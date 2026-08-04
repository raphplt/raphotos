/**
 * Pipeline d'ingestion des photos.
 *
 *   npm run import -- <dossier> [options]
 *
 * Pour chaque image trouvée :
 *   1. lecture des EXIF (boîtier, objectif, réglages, date, GPS)
 *   2. génération des variantes AVIF (thumb / grid / full) + LQIP
 *   3. upload des variantes et de l'original sur Cloudflare R2
 *   4. insertion ou mise à jour de la ligne dans Supabase
 *
 * Idempotent : l'empreinte SHA-256 du fichier sert de clé de déduplication,
 * le script peut donc être relancé sans créer de doublon.
 *
 * Options :
 *   --album <nom>   nom de l'album (défaut : nom du dossier)
 *   --dry-run       n'écrit rien, affiche seulement ce qui serait fait
 *   --force         régénère et réuploade même si la photo existe déjà
 *   --recursive     traite les sous-dossiers comme autant d'albums
 *   --concurrency N traitements simultanés (défaut : 4)
 */

import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { parseArgs } from "node:util";

import {
	PutObjectCommand,
	S3Client,
	type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import exifr from "exifr";
import pLimit from "p-limit";
import sharp, { type Sharp } from "sharp";
import "dotenv/config";

import { IMAGE_VARIANTS, type ImageVariant } from "../src/lib/image-variants";
import { formatAlbumTitle, slugify } from "../src/lib/utils";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);

// --------------------------------------------------------------- arguments

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		album: { type: "string" },
		"dry-run": { type: "boolean", default: false },
		force: { type: "boolean", default: false },
		recursive: { type: "boolean", default: false },
		concurrency: { type: "string", default: "4" },
	},
});

const sourceDir = positionals[0];
if (!sourceDir) {
	console.error("Usage : npm run import -- <dossier> [--album <nom>] [--dry-run]");
	process.exit(1);
}

const dryRun = values["dry-run"];
const force = values.force;
const concurrency = Number(values.concurrency) || 4;

// ------------------------------------------------------------ environnement

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		console.error(`Variable d'environnement manquante : ${name}`);
		process.exit(1);
	}
	return value;
}

const supabase = dryRun
	? null
	: createClient(
			requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
			requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
			{ auth: { persistSession: false } },
		);

const r2 = dryRun
	? null
	: new S3Client({
			region: "auto",
			endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
				secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
			},
		});

const bucket = process.env.R2_BUCKET ?? "raphotos";

// ------------------------------------------------------------------ helpers

interface ExifData {
	takenAt: string | null;
	camera: string | null;
	lens: string | null;
	iso: number | null;
	aperture: number | null;
	shutterSpeed: number | null;
	focalLength: number | null;
	gpsLat: number | null;
	gpsLng: number | null;
}

async function readExif(filePath: string): Promise<ExifData> {
	try {
		const raw = await exifr.parse(filePath, {
			pick: [
				"DateTimeOriginal", "CreateDate", "Model", "Make", "LensModel",
				"ISO", "FNumber", "ExposureTime", "FocalLength",
				"latitude", "longitude",
			],
			gps: true,
		});
		if (!raw) return emptyExif();

		const date: Date | undefined = raw.DateTimeOriginal ?? raw.CreateDate;
		const model: string | undefined = raw.Model;
		const make: string | undefined = raw.Make;

		return {
			takenAt: date instanceof Date && !Number.isNaN(date.getTime())
				? date.toISOString()
				: null,
			camera: model ? `${make && !model.startsWith(make) ? `${make} ` : ""}${model}`.trim() : null,
			lens: raw.LensModel ?? null,
			iso: numberOrNull(raw.ISO),
			aperture: numberOrNull(raw.FNumber),
			shutterSpeed: numberOrNull(raw.ExposureTime),
			focalLength: numberOrNull(raw.FocalLength),
			gpsLat: numberOrNull(raw.latitude),
			gpsLng: numberOrNull(raw.longitude),
		};
	} catch {
		return emptyExif();
	}
}

function emptyExif(): ExifData {
	return {
		takenAt: null, camera: null, lens: null, iso: null, aperture: null,
		shutterSpeed: null, focalLength: null, gpsLat: null, gpsLng: null,
	};
}

function numberOrNull(value: unknown): number | null {
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
}

async function upload(key: string, body: Buffer, contentType: string) {
	if (dryRun || !r2) return;
	const params: PutObjectCommandInput = {
		Bucket: bucket,
		Key: key,
		Body: body,
		ContentType: contentType,
		// Les clés sont immuables (slug dérivé du contenu) : cache maximal.
		CacheControl: "public, max-age=31536000, immutable",
	};
	await r2.send(new PutObjectCommand(params));
}

/** Placeholder flou de 20px encodé en data-URI, affiché pendant le chargement. */
async function makeLqip(pipeline: Sharp): Promise<string> {
	const buffer = await pipeline
		.clone()
		.resize(20, 20, { fit: "inside" })
		.webp({ quality: 30 })
		.toBuffer();
	return `data:image/webp;base64,${buffer.toString("base64")}`;
}

// -------------------------------------------------------------- traitement

interface ImportStats {
	imported: number;
	skipped: number;
	failed: number;
	bytesUploaded: number;
}

const stats: ImportStats = { imported: 0, skipped: 0, failed: 0, bytesUploaded: 0 };

async function processPhoto(
	filePath: string,
	albumId: string | null,
	index: number,
): Promise<void> {
	const fileName = basename(filePath);
	const buffer = await readFile(filePath);
	const fileHash = createHash("sha256").update(buffer).digest("hex");

	// Déduplication : même contenu binaire = même photo, quel que soit le nom.
	if (supabase && !force) {
		const { data: existing } = await supabase
			.from("photos")
			.select("id, slug")
			.eq("file_hash", fileHash)
			.maybeSingle();
		if (existing) {
			stats.skipped += 1;
			console.log(`  ⤬ ${fileName} — déjà importée (${existing.slug})`);
			return;
		}
	}

	const pipeline = sharp(buffer, { failOn: "none" }).rotate();
	const metadata = await pipeline.metadata();
	const width = metadata.width ?? 0;
	const height = metadata.height ?? 0;
	if (!width || !height) throw new Error("dimensions illisibles");

	const baseName = basename(fileName, extname(fileName));
	const slug = `${slugify(baseName)}-${fileHash.slice(0, 8)}`;
	const originalExt = extname(fileName).slice(1).toLowerCase() || "jpg";

	const [exif, lqip] = await Promise.all([readExif(filePath), makeLqip(pipeline)]);

	// Variantes AVIF. `withoutEnlargement` évite d'upscaler les petits fichiers.
	let uploadedBytes = 0;
	for (const [name, config] of Object.entries(IMAGE_VARIANTS)) {
		const variant = await pipeline
			.clone()
			.resize(config.width, null, { withoutEnlargement: true, fit: "inside" })
			.avif({ quality: config.quality, effort: 4 })
			.toBuffer();
		await upload(`photos/${slug}/${name as ImageVariant}.avif`, variant, "image/avif");
		uploadedBytes += variant.length;
	}

	// Original conservé pour le téléchargement (licence CC BY-NC).
	await upload(
		`photos/${slug}/original.${originalExt}`,
		buffer,
		originalExt === "png" ? "image/png" : originalExt === "webp" ? "image/webp" : "image/jpeg",
	);
	uploadedBytes += buffer.length;
	stats.bytesUploaded += uploadedBytes;

	if (supabase) {
		const { error } = await supabase.from("photos").upsert(
			{
				slug,
				album_id: albumId,
				width,
				height,
				lqip,
				original_ext: originalExt,
				taken_at: exif.takenAt,
				camera: exif.camera,
				lens: exif.lens,
				iso: exif.iso,
				aperture: exif.aperture,
				shutter_speed: exif.shutterSpeed,
				focal_length: exif.focalLength,
				gps_lat: exif.gpsLat,
				gps_lng: exif.gpsLng,
				file_hash: fileHash,
				published: true,
				sort_order: index,
			},
			{ onConflict: "file_hash" },
		);
		if (error) throw new Error(`Supabase : ${error.message}`);
	}

	stats.imported += 1;
	console.log(
		`  ✓ ${fileName} → ${slug} (${width}×${height}, ${(uploadedBytes / 1024 / 1024).toFixed(1)} Mo)`,
	);
}

async function ensureAlbum(folderName: string): Promise<string | null> {
	const title = values.album ?? formatAlbumTitle(folderName);
	const slug = slugify(title);
	const [season, yearRaw] = folderName.split("_");
	const year = Number(yearRaw);

	if (!supabase) {
		console.log(`Album (simulation) : ${title} [${slug}]`);
		return null;
	}

	const { data, error } = await supabase
		.from("albums")
		.upsert(
			{
				slug,
				title,
				season: season && Number.isFinite(year) ? season : null,
				year: Number.isFinite(year) ? year : null,
				published: true,
			},
			{ onConflict: "slug" },
		)
		.select("id")
		.single();

	if (error) throw new Error(`Album « ${title} » : ${error.message}`);
	console.log(`\nAlbum : ${title} [${slug}]`);
	return data.id;
}

async function listImages(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	return entries
		.filter((e) => e.isFile() && IMAGE_EXTENSIONS.has(extname(e.name).toLowerCase()))
		.map((e) => join(dir, e.name))
		.sort();
}

async function importFolder(dir: string): Promise<void> {
	const images = await listImages(dir);
	if (images.length === 0) return;

	const albumId = await ensureAlbum(basename(dir));
	const limit = pLimit(concurrency);

	await Promise.all(
		images.map((filePath, index) =>
			limit(async () => {
				try {
					await processPhoto(filePath, albumId, index);
				} catch (error) {
					stats.failed += 1;
					console.error(`  ✗ ${basename(filePath)} — ${(error as Error).message}`);
				}
			}),
		),
	);
}

async function main() {
	const root = resolve(sourceDir);
	const rootStat = await stat(root);
	if (!rootStat.isDirectory()) {
		console.error(`${root} n'est pas un dossier`);
		process.exit(1);
	}

	console.log(
		`Import depuis ${root}${dryRun ? "  [SIMULATION — aucune écriture]" : ""}`,
	);

	if (values.recursive) {
		const entries = await readdir(root, { withFileTypes: true });
		const folders = entries.filter((e) => e.isDirectory()).map((e) => join(root, e.name));
		// Le dossier racine peut lui-même contenir des images.
		await importFolder(root);
		for (const folder of folders.sort()) {
			await importFolder(folder);
		}
	} else {
		await importFolder(root);
	}

	console.log(
		`\n${stats.imported} importée(s) · ${stats.skipped} ignorée(s) · ${stats.failed} en échec` +
			` · ${(stats.bytesUploaded / 1024 / 1024).toFixed(0)} Mo envoyés`,
	);
	process.exit(stats.failed > 0 ? 1 : 0);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

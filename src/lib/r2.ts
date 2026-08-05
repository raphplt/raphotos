import "server-only";

import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";

import { IMAGE_VARIANTS, type ImageVariant } from "./image-variants";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET ?? "raphotos";

export const isR2Configured = Boolean(accountId && accessKeyId && secretAccessKey);

let client: S3Client | null = null;

function r2(): S3Client {
	client ??= new S3Client({
		region: "auto",
		endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
		credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
	});
	return client;
}

/** Toutes les clés stockées pour une photo : les variantes AVIF et l'original. */
export function photoObjectKeys(slug: string, originalExt: string): string[] {
	return [
		...Object.keys(IMAGE_VARIANTS).map(
			(variant) => `photos/${slug}/${variant as ImageVariant}.avif`,
		),
		`photos/${slug}/original.${originalExt}`,
	];
}

/**
 * Supprime les fichiers de plusieurs photos sur R2. Ne lève jamais : la base
 * fait foi, un objet resté sur le bucket est un déchet, pas une panne. Renvoie
 * les clés qui n'ont pas pu être supprimées pour qu'on puisse le signaler.
 */
export async function deletePhotoObjects(
	photos: { slug: string; original_ext: string }[],
): Promise<{ deleted: number; failedKeys: string[] }> {
	const keys = photos.flatMap((photo) => photoObjectKeys(photo.slug, photo.original_ext));
	if (keys.length === 0) return { deleted: 0, failedKeys: [] };
	if (!isR2Configured) return { deleted: 0, failedKeys: keys };

	const failedKeys: string[] = [];
	let deleted = 0;

	// DeleteObjects plafonne à 1000 clés par appel.
	for (let i = 0; i < keys.length; i += 1000) {
		const batch = keys.slice(i, i + 1000);
		try {
			const result = await r2().send(
				new DeleteObjectsCommand({
					Bucket: bucket,
					Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
				}),
			);
			for (const error of result.Errors ?? []) {
				if (error.Key) failedKeys.push(error.Key);
			}
			deleted += batch.length - (result.Errors?.length ?? 0);
		} catch {
			failedKeys.push(...batch);
		}
	}

	return { deleted, failedKeys };
}

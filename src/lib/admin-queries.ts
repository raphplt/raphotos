import "server-only";

import { createSupabaseAdminClient } from "./supabase/server";
import { compareAlbumsByRecency } from "./utils";
import type { Album, Comment, Photo, Video } from "./types";

/**
 * Ce que l'administration affiche réellement. On évite `select(*)` : sur
 * plusieurs centaines de photos, `lqip` (un data URI par ligne), `file_hash`
 * et les horodatages pesaient la moitié de la réponse — et cette réponse est
 * resérialisée vers le navigateur, la grille étant un composant client.
 */
export type AdminPhoto = Pick<
	Photo,
	| "id"
	| "slug"
	| "album_id"
	| "width"
	| "height"
	| "title"
	| "caption"
	| "taken_at"
	| "camera"
	| "lens"
	| "iso"
	| "aperture"
	| "shutter_speed"
	| "focal_length"
	| "published"
> & { album_title: string | null };

const ADMIN_PHOTO_COLUMNS =
	"id, slug, album_id, width, height, title, caption, taken_at, camera, lens, iso, aperture, shutter_speed, focal_length, published";

export const ADMIN_PHOTOS_LIMIT = 1200;

export async function getAdminPhotos(options?: {
	albumId?: string;
	onlyDrafts?: boolean;
	limit?: number;
}): Promise<AdminPhoto[]> {
	const supabase = createSupabaseAdminClient();
	let query = supabase
		.from("photos")
		.select(`${ADMIN_PHOTO_COLUMNS}, albums!photos_album_id_fkey(title)`)
		.order("created_at", { ascending: false })
		.limit(options?.limit ?? ADMIN_PHOTOS_LIMIT);

	if (options?.albumId) query = query.eq("album_id", options.albumId);
	if (options?.onlyDrafts) query = query.eq("published", false);

	const { data } = await query;

	type Row = Omit<AdminPhoto, "album_title"> & {
		albums?: { title: string } | { title: string }[] | null;
	};

	return ((data as unknown as Row[] | null) ?? []).map((row) => {
		const { albums, ...photo } = row;
		const album = Array.isArray(albums) ? albums[0] : albums;
		return { ...photo, album_title: album?.title ?? null };
	});
}

export async function getAdminAlbums(): Promise<
	(Album & { photo_count: number })[]
> {
	const supabase = createSupabaseAdminClient();

	const [{ data: albums }, { data: rows, error }] = await Promise.all([
		supabase.from("albums").select("*"),
		supabase.from("album_photo_counts").select("album_id, photo_count"),
	]);

	const counts = new Map<string, number>();

	if (error) {
		// La vue 0003 n'est pas encore appliquée : on recompte à l'ancienne
		// plutôt que d'afficher des albums vides.
		const { data: photos } = await supabase.from("photos").select("album_id");
		for (const photo of (photos as { album_id: string | null }[] | null) ?? []) {
			if (photo.album_id) counts.set(photo.album_id, (counts.get(photo.album_id) ?? 0) + 1);
		}
	} else {
		for (const row of (rows as { album_id: string; photo_count: number }[] | null) ?? []) {
			counts.set(row.album_id, row.photo_count);
		}
	}

	return ((albums as Album[] | null) ?? [])
		.sort(compareAlbumsByRecency)
		.map((album) => ({
			...album,
			photo_count: counts.get(album.id) ?? 0,
		}));
}

export interface AdminComment extends Comment {
	photo_slug: string | null;
	photo_title: string | null;
}

export async function getAdminComments(
	status?: "pending" | "approved" | "rejected",
): Promise<AdminComment[]> {
	const supabase = createSupabaseAdminClient();
	let query = supabase
		.from("comments")
		.select("*, photos(slug, title)")
		.order("created_at", { ascending: false })
		.limit(200);

	if (status) query = query.eq("status", status);

	const { data } = await query;

	type Row = Comment & {
		photos?:
			| { slug: string; title: string | null }
			| { slug: string; title: string | null }[]
			| null;
	};

	return ((data as Row[] | null) ?? []).map((row) => {
		const { photos, ...comment } = row;
		const photo = Array.isArray(photos) ? photos[0] : photos;
		return {
			...comment,
			photo_slug: photo?.slug ?? null,
			photo_title: photo?.title ?? null,
		};
	});
}

export async function getAdminVideos(): Promise<Video[]> {
	const supabase = createSupabaseAdminClient();
	const { data } = await supabase
		.from("videos")
		.select("*")
		.order("sort_order", { ascending: true });
	return (data as Video[] | null) ?? [];
}

/** Le seul chiffre dont la barre de navigation a besoin. */
export async function getPendingCommentsCount(): Promise<number> {
	const supabase = createSupabaseAdminClient();
	const { count } = await supabase
		.from("comments")
		.select("id", { count: "exact", head: true })
		.eq("status", "pending");
	return count ?? 0;
}

/** Pastille de navigation + compteur de brouillons, en une seule attente. */
export async function getPhotosPageCounts(): Promise<{
	drafts: number;
	pendingComments: number;
}> {
	const supabase = createSupabaseAdminClient();
	const [drafts, pending] = await Promise.all([
		supabase
			.from("photos")
			.select("id", { count: "exact", head: true })
			.eq("published", false),
		supabase
			.from("comments")
			.select("id", { count: "exact", head: true })
			.eq("status", "pending"),
	]);
	return { drafts: drafts.count ?? 0, pendingComments: pending.count ?? 0 };
}

export interface AdminStats {
	photos: number;
	drafts: number;
	albums: number;
	pendingComments: number;
	likes: number;
}

export async function getAdminStats(): Promise<AdminStats> {
	const supabase = createSupabaseAdminClient();
	const count = { count: "exact" as const, head: true };

	const [photos, drafts, albums, pending, likes] = await Promise.all([
		supabase.from("photos").select("id", count),
		supabase.from("photos").select("id", count).eq("published", false),
		supabase.from("albums").select("id", count),
		supabase.from("comments").select("id", count).eq("status", "pending"),
		supabase.from("likes").select("id", count),
	]);

	return {
		photos: photos.count ?? 0,
		drafts: drafts.count ?? 0,
		albums: albums.count ?? 0,
		pendingComments: pending.count ?? 0,
		likes: likes.count ?? 0,
	};
}

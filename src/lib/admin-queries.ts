import "server-only";

import { createSupabaseAdminClient } from "./supabase/server";
import type { Album, Comment, Photo, Video } from "./types";

export interface AdminPhoto extends Photo {
	album_title: string | null;
}

export async function getAdminPhotos(options?: {
	albumId?: string;
	onlyDrafts?: boolean;
	limit?: number;
}): Promise<AdminPhoto[]> {
	const supabase = createSupabaseAdminClient();
	let query = supabase
		.from("photos")
		.select("*, albums(title)")
		.order("created_at", { ascending: false })
		.limit(options?.limit ?? 500);

	if (options?.albumId) query = query.eq("album_id", options.albumId);
	if (options?.onlyDrafts) query = query.eq("published", false);

	const { data } = await query;

	type Row = Photo & { albums?: { title: string } | { title: string }[] | null };

	return ((data as Row[] | null) ?? []).map((row) => {
		const { albums, ...photo } = row;
		const album = Array.isArray(albums) ? albums[0] : albums;
		return { ...photo, album_title: album?.title ?? null };
	});
}

export async function getAdminAlbums(): Promise<
	(Album & { photo_count: number })[]
> {
	const supabase = createSupabaseAdminClient();

	const [{ data: albums }, { data: photos }] = await Promise.all([
		supabase
			.from("albums")
			.select("*")
			.order("year", { ascending: false, nullsFirst: false })
			.order("sort_order", { ascending: true }),
		supabase.from("photos").select("album_id"),
	]);

	const counts = new Map<string, number>();
	for (const photo of (photos as { album_id: string | null }[] | null) ?? []) {
		if (!photo.album_id) continue;
		counts.set(photo.album_id, (counts.get(photo.album_id) ?? 0) + 1);
	}

	return ((albums as Album[] | null) ?? []).map((album) => ({
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

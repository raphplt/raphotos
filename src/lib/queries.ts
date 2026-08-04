import "server-only";

import { isSupabaseConfigured, supabasePublic } from "./supabase/public";
import type {
	Album,
	AlbumWithCover,
	Comment,
	Photo,
	PhotoWithStats,
	Video,
} from "./types";

const PHOTO_COLUMNS =
	"id, slug, album_id, width, height, lqip, title, caption, original_ext, taken_at, camera, lens, iso, aperture, shutter_speed, focal_length, gps_lat, gps_lng, file_hash, published, sort_order, created_at";

/** Colonnes de la photo + slug de l'album parent (pour construire les URLs). */
const PHOTO_FIELDS = `${PHOTO_COLUMNS}, albums(slug)`;

type StatsRow = { photo_id: string; like_count: number; comment_count: number };

/** Ligne brute renvoyée par PostgREST : la relation peut arriver en objet ou en tableau. */
type PhotoRow = Photo & { albums?: { slug: string } | { slug: string }[] | null };

function albumSlugOf(row: PhotoRow): string | null {
	const album = Array.isArray(row.albums) ? row.albums[0] : row.albums;
	return album?.slug ?? null;
}

/** Rattache les compteurs à une liste de photos en une seule requête. */
async function attachStats(rows: PhotoRow[]): Promise<PhotoWithStats[]> {
	if (rows.length === 0) return [];

	const { data } = await supabasePublic
		.from("photo_stats")
		.select("photo_id, like_count, comment_count")
		.in(
			"photo_id",
			rows.map((p) => p.id),
		);

	const byId = new Map<string, StatsRow>(
		((data as StatsRow[] | null) ?? []).map((row) => [row.photo_id, row]),
	);

	return rows.map((row) => {
		const { albums: _albums, ...photo } = row;
		return {
			...photo,
			album_slug: albumSlugOf(row),
			like_count: byId.get(row.id)?.like_count ?? 0,
			comment_count: byId.get(row.id)?.comment_count ?? 0,
		};
	});
}

export async function getAlbums(): Promise<AlbumWithCover[]> {
	if (!isSupabaseConfigured) return [];
	const { data: albums } = await supabasePublic
		.from("albums")
		.select("*")
		.eq("published", true)
		.order("year", { ascending: false, nullsFirst: false })
		.order("sort_order", { ascending: true });

	if (!albums?.length) return [];

	// Toutes les photos publiées des albums concernés, en une requête : sert à
	// la fois au comptage et au repli de couverture.
	const { data: photos } = await supabasePublic
		.from("photos")
		.select("id, album_id, slug, width, height, lqip, taken_at, sort_order")
		.eq("published", true)
		.in(
			"album_id",
			(albums as Album[]).map((a) => a.id),
		)
		.order("sort_order", { ascending: true });

	const grouped = new Map<string, typeof photos>();
	for (const photo of photos ?? []) {
		if (!photo.album_id) continue;
		const list = grouped.get(photo.album_id) ?? [];
		list.push(photo);
		grouped.set(photo.album_id, list);
	}

	return (albums as Album[]).map((album) => {
		const albumPhotos = grouped.get(album.id) ?? [];
		const cover =
			albumPhotos.find((p) => p.id === album.cover_photo_id) ?? albumPhotos[0] ?? null;

		return {
			...album,
			photo_count: albumPhotos.length,
			cover: cover
				? {
						slug: cover.slug,
						width: cover.width,
						height: cover.height,
						lqip: cover.lqip,
					}
				: null,
		};
	});
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
	if (!isSupabaseConfigured) return null;
	const { data } = await supabasePublic
		.from("albums")
		.select("*")
		.eq("slug", slug)
		.eq("published", true)
		.maybeSingle();
	return (data as Album | null) ?? null;
}

export async function getAlbumPhotos(albumId: string): Promise<PhotoWithStats[]> {
	if (!isSupabaseConfigured) return [];
	const { data } = await supabasePublic
		.from("photos")
		.select(PHOTO_FIELDS)
		.eq("album_id", albumId)
		.eq("published", true)
		.order("sort_order", { ascending: true })
		.order("taken_at", { ascending: false, nullsFirst: false });

	return attachStats((data as unknown as PhotoRow[] | null) ?? []);
}

export async function getPhotoBySlug(slug: string): Promise<PhotoWithStats | null> {
	if (!isSupabaseConfigured) return null;
	const { data } = await supabasePublic
		.from("photos")
		.select(PHOTO_FIELDS)
		.eq("slug", slug)
		.eq("published", true)
		.maybeSingle();

	if (!data) return null;
	const [withStats] = await attachStats([data as unknown as PhotoRow]);
	return withStats ?? null;
}

/** Dernières photos publiées, tous albums confondus. */
export async function getLatestPhotos(limit = 12): Promise<PhotoWithStats[]> {
	if (!isSupabaseConfigured) return [];
	const { data } = await supabasePublic
		.from("photos")
		.select(PHOTO_FIELDS)
		.eq("published", true)
		.order("taken_at", { ascending: false, nullsFirst: false })
		.order("created_at", { ascending: false })
		.limit(limit);

	return attachStats((data as unknown as PhotoRow[] | null) ?? []);
}

/** Photos les plus aimées — alimente la sélection de la page d'accueil. */
export async function getMostLikedPhotos(limit = 6): Promise<PhotoWithStats[]> {
	if (!isSupabaseConfigured) return [];
	const { data: stats } = await supabasePublic
		.from("photo_stats")
		.select("photo_id, like_count, comment_count")
		.order("like_count", { ascending: false })
		.limit(limit);

	const ids = ((stats as StatsRow[] | null) ?? [])
		.filter((row) => row.like_count > 0)
		.map((row) => row.photo_id);

	if (ids.length === 0) return [];

	const { data } = await supabasePublic
		.from("photos")
		.select(PHOTO_FIELDS)
		.eq("published", true)
		.in("id", ids);

	const photos = await attachStats((data as unknown as PhotoRow[] | null) ?? []);
	return photos.sort((a, b) => b.like_count - a.like_count);
}

export async function getAllPhotoSlugs(): Promise<
	{ slug: string; album_slug: string | null }[]
> {
	if (!isSupabaseConfigured) return [];
	const { data } = await supabasePublic
		.from("photos")
		.select("slug, albums(slug)")
		.eq("published", true);

	type Row = { slug: string; albums: { slug: string } | { slug: string }[] | null };

	return ((data as Row[] | null) ?? []).map((row) => {
		const album = Array.isArray(row.albums) ? row.albums[0] : row.albums;
		return { slug: row.slug, album_slug: album?.slug ?? null };
	});
}

export async function getApprovedComments(photoId: string): Promise<Comment[]> {
	if (!isSupabaseConfigured) return [];
	const { data } = await supabasePublic
		.from("comments")
		.select("id, photo_id, author_name, body, status, created_at")
		.eq("photo_id", photoId)
		.eq("status", "approved")
		.order("created_at", { ascending: false });

	return (data as Comment[] | null) ?? [];
}

export async function getVideos(): Promise<Video[]> {
	if (!isSupabaseConfigured) return [];
	const { data } = await supabasePublic
		.from("videos")
		.select("*")
		.eq("published", true)
		.order("sort_order", { ascending: true });

	return (data as Video[] | null) ?? [];
}

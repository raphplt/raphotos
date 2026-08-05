"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { deletePhotoObjects } from "@/lib/r2";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const uuid = z.uuid();
const uuidList = z.array(uuid).min(1).max(500);

type ActionError = { error: string };
type PublishResult = ActionError | { success: true; count: number };
type DeleteResult =
	| ActionError
	| { success: true; count: number; orphanedFiles: number };

/**
 * `revalidatePath` raisonne sur l'arborescence de fichiers, pas sur l'URL :
 * depuis que les pages publiques vivent dans le groupe (site), des chemins
 * comme "/photos" ne correspondent plus à aucune route et n'invalidaient rien.
 * Purger depuis la racine couvre tout le sous-arbre — l'admin est assez peu
 * sollicité pour que le surcoût de régénération soit sans importance.
 */
function revalidatePublicPages() {
	revalidatePath("/", "layout");
}

const photoDetailsSchema = z.object({
	title: z.string().trim().max(120).nullable(),
	caption: z.string().trim().max(600).nullable(),
	album_id: z.string().nullable(),
});

export async function updatePhotoDetails(
	photoId: string,
	formData: FormData,
) {
	await requireAdmin();
	if (!uuid.safeParse(photoId).success) return { error: "Photo inconnue" };

	const parsed = photoDetailsSchema.safeParse({
		title: (formData.get("title") as string)?.trim() || null,
		caption: (formData.get("caption") as string)?.trim() || null,
		album_id: (formData.get("album_id") as string) || null,
	});
	if (!parsed.success) return { error: "Champs invalides" };

	const albumId = parsed.data.album_id;
	if (albumId && !uuid.safeParse(albumId).success) {
		return { error: "Album inconnu" };
	}

	const supabase = createSupabaseAdminClient();
	const { error } = await supabase
		.from("photos")
		.update({
			title: parsed.data.title,
			caption: parsed.data.caption,
			album_id: albumId,
		})
		.eq("id", photoId);

	if (error) return { error: error.message };
	revalidatePublicPages();
	revalidatePath("/admin/photos");
	return { success: true };
}

export async function setPhotosPublished(
	photoIds: string[],
	published: boolean,
): Promise<PublishResult> {
	await requireAdmin();
	const parsed = uuidList.safeParse(photoIds);
	if (!parsed.success) return { error: "Sélection invalide" };

	const supabase = createSupabaseAdminClient();
	const { error } = await supabase
		.from("photos")
		.update({ published })
		.in("id", parsed.data);

	if (error) return { error: error.message };
	revalidatePublicPages();
	revalidatePath("/admin/photos");
	return { success: true, count: parsed.data.length };
}

/** Marque des photos comme candidates à la hero de la page d'accueil. */
export async function setPhotosFeatured(
	photoIds: string[],
	featured: boolean,
): Promise<PublishResult> {
	await requireAdmin();
	const parsed = uuidList.safeParse(photoIds);
	if (!parsed.success) return { error: "Sélection invalide" };

	const supabase = createSupabaseAdminClient();
	const { error } = await supabase
		.from("photos")
		.update({ featured })
		.in("id", parsed.data);

	if (error) return { error: error.message };
	revalidatePublicPages();
	revalidatePath("/admin/photos");
	return { success: true, count: parsed.data.length };
}

export async function deletePhoto(photoId: string): Promise<DeleteResult> {
	return deletePhotos([photoId]);
}

/**
 * Supprime les fiches puis leurs fichiers sur R2. La base passe en premier :
 * si le nettoyage du bucket échoue, il reste des objets orphelins — gênant
 * mais invisible, alors que l'inverse afficherait des images cassées.
 */
export async function deletePhotos(photoIds: string[]): Promise<DeleteResult> {
	await requireAdmin();
	const parsed = uuidList.safeParse(photoIds);
	if (!parsed.success) return { error: "Sélection invalide" };

	const supabase = createSupabaseAdminClient();

	const { data: photos, error: readError } = await supabase
		.from("photos")
		.select("id, slug, original_ext")
		.in("id", parsed.data);

	if (readError) return { error: readError.message };
	if (!photos?.length) return { error: "Photo introuvable" };

	const { error } = await supabase.from("photos").delete().in("id", parsed.data);
	if (error) return { error: error.message };

	const { failedKeys } = await deletePhotoObjects(
		photos as { slug: string; original_ext: string }[],
	);

	revalidatePublicPages();
	revalidatePath("/admin/photos");

	return {
		success: true,
		count: photos.length,
		orphanedFiles: failedKeys.length,
	};
}

const albumSchema = z.object({
	title: z.string().trim().min(1).max(80),
	description: z.string().trim().max(600).nullable(),
	published: z.boolean(),
});

export async function updateAlbum(albumId: string, formData: FormData) {
	await requireAdmin();
	if (!uuid.safeParse(albumId).success) return { error: "Album inconnu" };

	const parsed = albumSchema.safeParse({
		title: (formData.get("title") as string)?.trim(),
		description: (formData.get("description") as string)?.trim() || null,
		published: formData.get("published") === "on",
	});
	if (!parsed.success) return { error: "Titre requis (80 caractères max)" };

	const supabase = createSupabaseAdminClient();
	const { error } = await supabase
		.from("albums")
		.update(parsed.data)
		.eq("id", albumId);

	if (error) return { error: error.message };
	revalidatePublicPages();
	revalidatePath("/admin/albums");
	return { success: true };
}

export async function setAlbumCover(albumId: string, photoId: string) {
	await requireAdmin();
	if (!uuid.safeParse(albumId).success || !uuid.safeParse(photoId).success) {
		return { error: "Référence invalide" };
	}

	const supabase = createSupabaseAdminClient();
	const { error } = await supabase
		.from("albums")
		.update({ cover_photo_id: photoId })
		.eq("id", albumId);

	if (error) return { error: error.message };
	revalidatePublicPages();
	revalidatePath("/admin/albums");
	return { success: true };
}

export async function moderateComment(
	commentId: string,
	status: "approved" | "rejected",
) {
	await requireAdmin();
	if (!uuid.safeParse(commentId).success) return { error: "Commentaire inconnu" };

	const supabase = createSupabaseAdminClient();
	const { error } = await supabase
		.from("comments")
		.update({ status })
		.eq("id", commentId);

	if (error) return { error: error.message };
	revalidatePath("/admin/commentaires");
	revalidatePath("/photos/[album]/[photo]", "page");
	return { success: true };
}

export async function deleteComment(commentId: string) {
	await requireAdmin();
	if (!uuid.safeParse(commentId).success) return { error: "Commentaire inconnu" };

	const supabase = createSupabaseAdminClient();
	const { error } = await supabase.from("comments").delete().eq("id", commentId);

	if (error) return { error: error.message };
	revalidatePath("/admin/commentaires");
	revalidatePath("/photos/[album]/[photo]", "page");
	return { success: true };
}

const videoSchema = z.object({
	youtube_id: z
		.string()
		.trim()
		.regex(/^[A-Za-z0-9_-]{11}$/, "Identifiant YouTube invalide (11 caractères)"),
	title: z.string().trim().min(1).max(120),
	description: z.string().trim().max(600).nullable(),
});

function extractYoutubeId(input: string): string {
	const trimmed = input.trim();
	const match = trimmed.match(
		/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/,
	);
	return match?.[1] ?? trimmed;
}

export async function createVideo(formData: FormData) {
	await requireAdmin();

	const parsed = videoSchema.safeParse({
		youtube_id: extractYoutubeId((formData.get("youtube_id") as string) ?? ""),
		title: (formData.get("title") as string)?.trim(),
		description: (formData.get("description") as string)?.trim() || null,
	});
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? "Champs invalides" };
	}

	const supabase = createSupabaseAdminClient();
	const { error } = await supabase.from("videos").insert(parsed.data);

	if (error) return { error: error.message };
	revalidatePath("/videos");
	revalidatePath("/admin/videos");
	return { success: true };
}

export async function deleteVideo(videoId: string) {
	await requireAdmin();
	if (!uuid.safeParse(videoId).success) return { error: "Vidéo inconnue" };

	const supabase = createSupabaseAdminClient();
	const { error } = await supabase.from("videos").delete().eq("id", videoId);

	if (error) return { error: error.message };
	revalidatePath("/videos");
	revalidatePath("/admin/videos");
	return { success: true };
}

export async function setVideoPublished(videoId: string, published: boolean) {
	await requireAdmin();
	if (!uuid.safeParse(videoId).success) return { error: "Vidéo inconnue" };

	const supabase = createSupabaseAdminClient();
	const { error } = await supabase
		.from("videos")
		.update({ published })
		.eq("id", videoId);

	if (error) return { error: error.message };
	revalidatePath("/videos");
	revalidatePath("/admin/videos");
	return { success: true };
}

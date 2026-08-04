"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const uuid = z.uuid();

function revalidatePublicPages() {
	revalidatePath("/", "page");
	revalidatePath("/photos", "page");
	revalidatePath("/photos/[album]", "page");
	revalidatePath("/videos", "page");
}

export async function setPhotoPublished(photoId: string, published: boolean) {
	await requireAdmin();
	if (!uuid.safeParse(photoId).success) return { error: "Photo inconnue" };

	const supabase = createSupabaseAdminClient();
	const { error } = await supabase
		.from("photos")
		.update({ published })
		.eq("id", photoId);

	if (error) return { error: error.message };
	revalidatePublicPages();
	revalidatePath("/admin/photos");
	return { success: true };
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

export async function deletePhoto(photoId: string) {
	await requireAdmin();
	if (!uuid.safeParse(photoId).success) return { error: "Photo inconnue" };

	const supabase = createSupabaseAdminClient();

	const { error } = await supabase.from("photos").delete().eq("id", photoId);

	if (error) return { error: error.message };
	revalidatePublicPages();
	revalidatePath("/admin/photos");
	return { success: true };
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

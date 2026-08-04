import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import PhotoGrid from "@/components/gallery/photo-grid";
import { getAlbumBySlug, getAlbumPhotos, getAlbums } from "@/lib/queries";
import { variantUrl } from "@/lib/image-variants";
import { pluralize } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
	const albums = await getAlbums();
	return albums.map((album) => ({ album: album.slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ album: string }>;
}): Promise<Metadata> {
	const { album: slug } = await params;
	const album = await getAlbumBySlug(slug);
	if (!album) return { title: "Album introuvable" };

	const photos = await getAlbumPhotos(album.id);
	const cover = photos[0];

	return {
		title: album.title,
		description:
			album.description ?? `${photos.length} photographies — ${album.title}.`,
		openGraph: {
			title: `${album.title} · Raphotos`,
			images: cover ? [{ url: variantUrl(cover.slug, "grid") }] : undefined,
		},
	};
}

export default async function AlbumPage({
	params,
}: {
	params: Promise<{ album: string }>;
}) {
	const { album: slug } = await params;
	const album = await getAlbumBySlug(slug);
	if (!album) notFound();

	const photos = await getAlbumPhotos(album.id);

	return (
		<div className="mx-auto max-w-[1600px] px-5 pb-24 pt-28 sm:px-10 sm:pt-36">
			<Link
				href="/photos"
				className="group inline-flex items-center gap-2 text-xs tracking-editorial text-faint transition-colors hover:text-paper"
			>
				<ArrowLeft
					size={14}
					className="transition-transform duration-300 group-hover:-translate-x-1"
				/>
				Tous les albums
			</Link>

			<header className="mt-10 flex flex-wrap items-baseline justify-between gap-4 border-b border-line/60 pb-8">
				<h1 className="font-display text-5xl leading-tight sm:text-7xl">
					{album.title}
				</h1>
				<p className="text-xs text-faint">
					{photos.length} {pluralize(photos.length, "photo")}
				</p>
			</header>

			{album.description && (
				<p className="mt-6 max-w-xl text-sm leading-relaxed text-muted">
					{album.description}
				</p>
			)}

			<div className="mt-12">
				{photos.length === 0 ? (
					<p className="text-sm text-faint">Cet album ne contient encore aucune photo.</p>
				) : (
					<PhotoGrid photos={photos} />
				)}
			</div>
		</div>
	);
}

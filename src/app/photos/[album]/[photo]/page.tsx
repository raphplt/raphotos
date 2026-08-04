import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";

import PhotoImage from "@/components/gallery/photo-image";
import LikeButton from "@/components/social/like-button";
import CommentSection from "@/components/social/comment-section";
import { originalUrl, variantUrl } from "@/lib/image-variants";
import {
	getAlbumBySlug,
	getApprovedComments,
	getPhotoBySlug,
} from "@/lib/queries";
import { formatDate, formatShutterSpeed } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ album: string; photo: string }>;
}): Promise<Metadata> {
	const { photo: slug } = await params;
	const photo = await getPhotoBySlug(slug);
	if (!photo) return { title: "Photo introuvable" };

	const title = photo.title ?? "Photographie";
	return {
		title,
		description:
			photo.caption ?? `${title} — photographie de paysage par Raphaël.`,
		openGraph: {
			title: `${title} · Raphotos`,
			images: [
				{
					url: variantUrl(photo.slug, "grid"),
					width: photo.width,
					height: photo.height,
				},
			],
		},
	};
}

export default async function PhotoPage({
	params,
}: {
	params: Promise<{ album: string; photo: string }>;
}) {
	const { album: albumSlug, photo: photoSlug } = await params;

	const photo = await getPhotoBySlug(photoSlug);
	if (!photo) notFound();

	const [album, comments] = await Promise.all([
		getAlbumBySlug(albumSlug),
		getApprovedComments(photo.id),
	]);

	const exif = [
		{ label: "Appareil", value: photo.camera },
		{ label: "Objectif", value: photo.lens },
		{
			label: "Focale",
			value: photo.focal_length ? `${Math.round(photo.focal_length)} mm` : null,
		},
		{ label: "Ouverture", value: photo.aperture ? `ƒ/${photo.aperture}` : null },
		{
			label: "Vitesse",
			value: photo.shutter_speed ? formatShutterSpeed(photo.shutter_speed) : null,
		},
		{ label: "ISO", value: photo.iso ? String(photo.iso) : null },
		{ label: "Dimensions", value: `${photo.width} × ${photo.height}` },
		{ label: "Date", value: formatDate(photo.taken_at) || null },
	].filter((item) => item.value);

	return (
		<article className="mx-auto max-w-[1600px] px-5 pb-24 pt-28 sm:px-10 sm:pt-36">
			<Link
				href={album ? `/photos/${album.slug}` : "/photos"}
				className="group inline-flex items-center gap-2 text-xs tracking-editorial text-faint transition-colors hover:text-paper"
			>
				<ArrowLeft
					size={14}
					className="transition-transform duration-300 group-hover:-translate-x-1"
				/>
				{album?.title ?? "Retour"}
			</Link>

			<div className="mt-8 bg-ink-soft">
				<PhotoImage
					slug={photo.slug}
					width={photo.width}
					height={photo.height}
					lqip={photo.lqip}
					alt={photo.title ?? "Photographie de paysage"}
					variant="full"
					priority
					sizes="(max-width: 1600px) 100vw, 1600px"
					className="max-h-[85dvh] w-full object-contain"
				/>
			</div>

			<div className="mt-10 flex flex-col gap-12 lg:flex-row lg:justify-between">
				<div className="max-w-xl flex-1">
					<h1 className="font-display text-4xl leading-tight sm:text-5xl">
						{photo.title ?? "Sans titre"}
					</h1>
					{photo.caption && (
						<p className="mt-4 text-sm leading-relaxed text-muted">
							{photo.caption}
						</p>
					)}

					<div className="mt-8 flex items-center gap-3">
						<LikeButton photoId={photo.id} initialCount={photo.like_count} />
						<a
							href={originalUrl(photo.slug, photo.original_ext)}
							download
							className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs tracking-editorial text-muted transition-colors hover:border-accent/60 hover:text-paper"
						>
							<Download size={15} />
							Télécharger
						</a>
					</div>

					<CommentSection photoId={photo.id} comments={comments} />
				</div>

				{exif.length > 0 && (
					<aside className="lg:w-64 lg:shrink-0">
						<h2 className="text-[11px] tracking-editorial text-faint">
							Prise de vue
						</h2>
						<dl className="mt-5 flex flex-col gap-3 border-t border-line/60 pt-5">
							{exif.map((item) => (
								<div key={item.label} className="flex justify-between gap-4">
									<dt className="text-xs text-faint">{item.label}</dt>
									<dd className="text-right text-xs text-muted">{item.value}</dd>
								</div>
							))}
						</dl>
					</aside>
				)}
			</div>
		</article>
	);
}

import type { Metadata } from "next";
import Link from "next/link";

import PhotoImage from "@/components/gallery/photo-image";
import { getAlbums } from "@/lib/queries";
import { pluralize } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
	title: "Photos",
	description:
		"Toutes mes photographies, réunies par saison : paysages, lumière et détails.",
};

export default async function PhotosPage() {
	const albums = await getAlbums();

	return (
		<div className="mx-auto max-w-[1600px] px-5 pb-24 pt-32 sm:px-10 sm:pt-44">
			<header className="max-w-2xl">
				<p className="text-[11px] tracking-editorial text-accent">Galerie</p>
				<h1 className="mt-4 font-display text-5xl leading-tight text-balance sm:text-7xl">
					Photographies
				</h1>
				<p className="mt-5 text-sm leading-relaxed text-muted">
					Mes photos réunies par saison. Chaque cliché est téléchargeable en
					pleine résolution sous licence CC BY-NC.
				</p>
			</header>

			{albums.length === 0 ? (
				<p className="mt-24 text-sm text-faint">
					Aucun album publié pour le moment.
				</p>
			) : (
				<div className="mt-20 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
					{albums.map((album, index) => (
						<Link
							key={album.id}
							href={`/photos/${album.slug}`}
							className="group block"
						>
							<div className="relative overflow-hidden bg-ink-soft">
								{album.cover ? (
									<PhotoImage
										slug={album.cover.slug}
										width={album.cover.width}
										height={album.cover.height}
										lqip={album.cover.lqip}
										alt={`Couverture de ${album.title}`}
										variant="grid"
										priority={index < 3}
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
										className="aspect-[4/3] object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
									/>
								) : (
									<div className="aspect-[4/3] bg-ink-raised" />
								)}
								<div className="absolute inset-0 bg-ink/10 transition-colors duration-500 group-hover:bg-transparent" />
							</div>

							<div className="mt-4 flex items-baseline justify-between gap-4">
								<h2 className="font-display text-2xl transition-colors group-hover:text-accent">
									{album.title}
								</h2>
								<span className="shrink-0 text-xs text-faint">
									{album.photo_count} {pluralize(album.photo_count, "photo")}
								</span>
							</div>
							{album.description && (
								<p className="mt-1.5 text-sm text-muted">{album.description}</p>
							)}
						</Link>
					))}
				</div>
			)}
		</div>
	);
}

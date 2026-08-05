import Link from "next/link";
import { ArrowRight } from "lucide-react";

import PhotoImage from "@/components/gallery/photo-image";
import { getAlbums, getLatestPhotos } from "@/lib/queries";
import { formatAlbumTitle, pluralize } from "@/lib/utils";

export const revalidate = 3600;

export default async function HomePage() {
	const [latest, albums] = await Promise.all([getLatestPhotos(9), getAlbums()]);
	const hero = latest[0];

	return (
		<>

			<section className="relative flex min-h-dvh items-end overflow-hidden">
				{hero ? (
					<>
						<div className="absolute inset-0">
							<PhotoImage
								slug={hero.slug}
								width={hero.width}
								height={hero.height}
								lqip={hero.lqip}
								alt={hero.title ?? "Photographie de paysage"}
								variant="full"
								priority
								sizes="100vw"
								className="h-full w-full object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/60" />
						</div>

						<div className="relative mx-auto w-full max-w-[1600px] px-5 pb-20 sm:px-10 sm:pb-28">
							<p className="text-[11px] tracking-editorial text-accent">
								Photographie de paysage
							</p>
							<h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.95] text-balance sm:text-7xl lg:text-8xl">
								La poésie cachée dans les paysages
							</h1>
							<p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
								Photographies de Raphaël. Chaque image est téléchargeable
								librement sous licence CC BY-NC.
							</p>
							<Link
								href="/photos"
								className="group mt-10 inline-flex items-center gap-3 border-b border-line pb-2 text-xs tracking-editorial text-paper transition-colors hover:border-accent"
							>
								Voir la galerie
								<ArrowRight
									size={15}
									className="transition-transform duration-300 group-hover:translate-x-1"
								/>
							</Link>
						</div>
					</>
				) : (
					<div className="mx-auto w-full max-w-[1600px] px-5 pb-28 pt-40 sm:px-10">
						<h1 className="font-display text-5xl sm:text-7xl">Raphotos</h1>
						<p className="mt-6 max-w-md text-sm text-muted">
							La galerie est en cours de préparation. Lance{" "}
							<code className="text-accent">npm run import</code> pour publier
							tes premières photos.
						</p>
					</div>
				)}
			</section>

			{latest.length > 1 && (
				<section className="mx-auto max-w-[1600px] px-5 py-24 sm:px-10 sm:py-32">
					<div className="flex items-end justify-between gap-6">
						<h2 className="text-[11px] tracking-editorial text-faint">
							Dernières photographies
						</h2>
						<Link
							href="/photos"
							className="group flex items-center gap-2 text-xs text-muted transition-colors hover:text-paper"
						>
							Tout voir
							<ArrowRight
								size={13}
								className="transition-transform duration-300 group-hover:translate-x-1"
							/>
						</Link>
					</div>

					<div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
						{latest.slice(1, 9).map((photo) => (
							<Link
								key={photo.id}
								href={
									photo.album_slug
										? `/photos/${photo.album_slug}/${photo.slug}`
										: "/photos"
								}
								className="group relative overflow-hidden bg-ink-soft"
							>
								<PhotoImage
									slug={photo.slug}
									width={photo.width}
									height={photo.height}
									lqip={photo.lqip}
									alt={photo.title ?? "Photographie"}
									variant="grid"
									sizes="(max-width: 768px) 50vw, 25vw"
									className="aspect-[4/5] object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
								/>
							</Link>
						))}
					</div>
				</section>
			)}

			{albums.length > 0 && (
				<section className="mx-auto max-w-[1600px] px-5 pb-24 sm:px-10 sm:pb-32">
					<h2 className="text-[11px] tracking-editorial text-faint">
						Par saison
					</h2>

					<ul className="mt-10 divide-y divide-line/60 border-y border-line/60">
						{albums.slice(0, 6).map((album) => (
							<li key={album.id}>
								<Link
									href={`/photos/${album.slug}`}
									className="group flex items-center justify-between gap-6 py-7 transition-colors hover:bg-ink-soft/40"
								>
									<div className="flex min-w-0 items-baseline gap-5">
										<span className="font-display text-2xl transition-colors group-hover:text-accent sm:text-3xl">
											{album.title || formatAlbumTitle(album.slug)}
										</span>
										<span className="shrink-0 text-xs text-faint">
											{album.photo_count}{" "}
											{pluralize(album.photo_count, "photo")}
										</span>
									</div>
									<ArrowRight
										size={18}
										className="shrink-0 text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-paper"
									/>
								</Link>
							</li>
						))}
					</ul>
				</section>
			)}
		</>
	);
}

import type { Metadata } from "next";

import { getVideos } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
	title: "Vidéos",
	description: "Mes vidéos : paysages en mouvement et timelapses.",
};

export default async function VideosPage() {
	const videos = await getVideos();

	return (
		<div className="mx-auto max-w-[1600px] px-5 pb-24 pt-32 sm:px-10 sm:pt-44">
			<header className="max-w-2xl">
				<p className="text-[11px] tracking-editorial text-accent">Mouvement</p>
				<h1 className="mt-4 font-display text-5xl leading-tight sm:text-7xl">
					Vidéos
				</h1>
			</header>

			{videos.length === 0 ? (
				<p className="mt-20 text-sm text-faint">
					Aucune vidéo publiée pour le moment.
				</p>
			) : (
				<div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-2">
					{videos.map((video) => (
						<article key={video.id}>
							<div className="relative aspect-video overflow-hidden bg-ink-soft">
								<iframe
									src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}`}
									title={video.title}
									loading="lazy"
									allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowFullScreen
									className="absolute inset-0 h-full w-full border-0"
								/>
							</div>
							<h2 className="mt-4 font-display text-2xl">{video.title}</h2>
							{video.description && (
								<p className="mt-2 text-sm leading-relaxed text-muted">
									{video.description}
								</p>
							)}
						</article>
					))}
				</div>
			)}
		</div>
	);
}

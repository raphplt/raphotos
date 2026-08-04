"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";

import Lightbox from "./lightbox";
import PhotoImage from "./photo-image";
import type { PhotoWithStats } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PhotoGridProps {
	photos: PhotoWithStats[];

	initialCount?: number;
}

const BATCH_SIZE = 24;

export default function PhotoGrid({
	photos,
	initialCount = BATCH_SIZE,
}: PhotoGridProps) {
	const [visibleCount, setVisibleCount] = useState(
		Math.min(initialCount, photos.length),
	);
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel || visibleCount >= photos.length) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setVisibleCount((count) => Math.min(count + BATCH_SIZE, photos.length));
				}
			},
			{ rootMargin: "800px" },
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [visibleCount, photos.length]);

	const close = useCallback(() => setOpenIndex(null), []);
	const visible = photos.slice(0, visibleCount);

	return (
		<>
			<div
				className="masonry columns-1 sm:columns-2 lg:columns-3 xl:columns-4"
				style={{ ["--masonry-gap" as string]: "1rem" }}
			>
				{visible.map((photo, index) => (
					<button
						key={photo.id}
						type="button"
						onClick={() => setOpenIndex(index)}
						className="group relative block w-full overflow-hidden bg-ink-soft text-left"
						aria-label={`Ouvrir ${photo.title ?? "la photo"} en plein écran`}
					>
						<PhotoImage
							slug={photo.slug}
							width={photo.width}
							height={photo.height}
							lqip={photo.lqip}
							alt={photo.title ?? "Photographie de paysage"}
							variant="grid"
							priority={index < 4}
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
							className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-hover:brightness-110"
						/>

						<div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
							<div className="flex w-full items-end justify-between gap-3 p-4">
								<span className="font-display text-base leading-tight text-paper">
									{photo.title ?? ""}
								</span>
								{photo.like_count > 0 && (
									<span className="flex shrink-0 items-center gap-1.5 text-xs text-paper/90">
										<Heart size={13} className="fill-current" />
										{photo.like_count}
									</span>
								)}
							</div>
						</div>
					</button>
				))}
			</div>

			{visibleCount < photos.length && (
				<div ref={sentinelRef} className="flex justify-center py-16">
					<span className={cn("text-xs tracking-editorial text-faint")}>
						Chargement…
					</span>
				</div>
			)}

			{openIndex !== null && (
				<Lightbox
					photos={photos}
					index={openIndex}
					onClose={close}
					onNavigate={setOpenIndex}
				/>
			)}
		</>
	);
}

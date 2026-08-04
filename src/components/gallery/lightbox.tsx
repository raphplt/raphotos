"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	ChevronLeft,
	ChevronRight,
	Download,
	Info,
	Maximize2,
	X,
} from "lucide-react";

import LikeButton from "@/components/social/like-button";
import { originalUrl, variantUrl } from "@/lib/image-variants";
import type { PhotoWithStats } from "@/lib/types";
import { cn, formatDate, formatShutterSpeed } from "@/lib/utils";

interface LightboxProps {
	photos: PhotoWithStats[];
	index: number;
	onClose: () => void;
	onNavigate: (index: number) => void;
}

const SWIPE_THRESHOLD = 60;

export default function Lightbox({
	photos,
	index,
	onClose,
	onNavigate,
}: LightboxProps) {
	const [showInfo, setShowInfo] = useState(false);
	const touchStartX = useRef<number | null>(null);
	const dialogRef = useRef<HTMLDivElement>(null);

	const photo = photos[index];
	const previous = useCallback(
		() => onNavigate((index - 1 + photos.length) % photos.length),
		[index, photos.length, onNavigate],
	);
	const next = useCallback(
		() => onNavigate((index + 1) % photos.length),
		[index, photos.length, onNavigate],
	);

	// Navigation clavier
	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			switch (event.key) {
				case "Escape":
					onClose();
					break;
				case "ArrowLeft":
					previous();
					break;
				case "ArrowRight":
					next();
					break;
				case "i":
				case "I":
					setShowInfo((v) => !v);
					break;
				case "f":
				case "F":
					toggleFullscreen();
					break;
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [previous, next, onClose]);

	// Précharge les voisines immédiates pour que la navigation paraisse
	// instantanée. On vise la variante `full`, celle qu'affichera la lightbox.
	useEffect(() => {
		if (photos.length < 2) return;
		const targets = [
			photos[(index + 1) % photos.length],
			photos[(index - 1 + photos.length) % photos.length],
		];
		for (const target of targets) {
			if (!target) continue;
			const image = new window.Image();
			image.src = variantUrl(target.slug, "full");
		}
	}, [index, photos]);

	// Verrouille le défilement de la page pendant l'ouverture
	useEffect(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		dialogRef.current?.focus();
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, []);

	function toggleFullscreen() {
		if (document.fullscreenElement) {
			void document.exitFullscreen();
		} else {
			void dialogRef.current?.requestFullscreen?.();
		}
	}

	if (!photo) return null;

	const exifItems = [
		photo.camera,
		photo.lens,
		photo.focal_length ? `${Math.round(photo.focal_length)} mm` : null,
		photo.aperture ? `ƒ/${photo.aperture}` : null,
		photo.shutter_speed ? formatShutterSpeed(photo.shutter_speed) : null,
		photo.iso ? `ISO ${photo.iso}` : null,
	].filter(Boolean) as string[];

	return (
		<div
			ref={dialogRef}
			role="dialog"
			aria-modal="true"
			aria-label={photo.title ?? "Photo en plein écran"}
			tabIndex={-1}
			className="fixed inset-0 z-50 flex flex-col bg-ink/98 backdrop-blur-sm"
			onTouchStart={(e) => {
				touchStartX.current = e.touches[0]?.clientX ?? null;
			}}
			onTouchEnd={(e) => {
				const start = touchStartX.current;
				const end = e.changedTouches[0]?.clientX;
				if (start == null || end == null) return;
				const delta = end - start;
				if (Math.abs(delta) > SWIPE_THRESHOLD) {
					if (delta > 0) previous();
					else next();
				}
				touchStartX.current = null;
			}}
		>
			{/* Barre d'outils */}
			<div className="flex items-center justify-between px-4 py-3 sm:px-6">
				<span className="text-xs tabular-nums text-faint">
					{index + 1} / {photos.length}
				</span>
				<div className="flex items-center gap-1">
					<LikeButton
						photoId={photo.id}
						initialCount={photo.like_count}
						variant="ghost"
					/>
					<button
						type="button"
						onClick={() => setShowInfo((v) => !v)}
						aria-label="Informations de prise de vue"
						aria-pressed={showInfo}
						className={cn(
							"rounded-full p-2.5 transition-colors",
							showInfo ? "bg-line text-paper" : "text-muted hover:text-paper",
						)}
					>
						<Info size={18} />
					</button>
					<a
						href={originalUrl(photo.slug, photo.original_ext)}
						download
						aria-label="Télécharger l'original"
						className="rounded-full p-2.5 text-muted transition-colors hover:text-paper"
					>
						<Download size={18} />
					</a>
					<button
						type="button"
						onClick={toggleFullscreen}
						aria-label="Plein écran"
						className="hidden rounded-full p-2.5 text-muted transition-colors hover:text-paper sm:block"
					>
						<Maximize2 size={18} />
					</button>
					<button
						type="button"
						onClick={onClose}
						aria-label="Fermer"
						className="rounded-full p-2.5 text-muted transition-colors hover:text-paper"
					>
						<X size={20} />
					</button>
				</div>
			</div>

			{/* Image */}
			<div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
				<button
					type="button"
					onClick={previous}
					aria-label="Photo précédente"
					className="absolute left-1 z-10 hidden rounded-full p-3 text-muted transition-all hover:bg-ink-raised hover:text-paper sm:block"
				>
					<ChevronLeft size={26} />
				</button>

				<Image
					key={photo.slug}
					src={variantUrl(photo.slug, "full")}
					alt={photo.title ?? "Photographie"}
					width={photo.width}
					height={photo.height}
					sizes="100vw"
					priority
					placeholder={photo.lqip ? "blur" : "empty"}
					blurDataURL={photo.lqip ?? undefined}
					className="max-h-full w-auto max-w-full object-contain"
				/>

				<button
					type="button"
					onClick={next}
					aria-label="Photo suivante"
					className="absolute right-1 z-10 hidden rounded-full p-3 text-muted transition-all hover:bg-ink-raised hover:text-paper sm:block"
				>
					<ChevronRight size={26} />
				</button>
			</div>

			{/* Légende et EXIF */}
			<div className="px-4 pb-6 pt-4 sm:px-8">
				{photo.title && (
					<p className="font-display text-lg text-paper">{photo.title}</p>
				)}
				{photo.caption && (
					<p className="mt-1 max-w-2xl text-sm text-muted">{photo.caption}</p>
				)}

				{showInfo && (
					<dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-faint">
						{photo.taken_at && (
							<div>
								<dt className="sr-only">Date</dt>
								<dd>{formatDate(photo.taken_at)}</dd>
							</div>
						)}
						{exifItems.map((item) => (
							<div key={item}>
								<dd>{item}</dd>
							</div>
						))}
						<div>
							<dd>
								{photo.width} × {photo.height}
							</dd>
						</div>
					</dl>
				)}
			</div>

		</div>
	);
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import {
	Check,
	ChevronLeft,
	ChevronRight,
	Eye,
	EyeOff,
	Pencil,
	Square,
	Trash2,
	X,
} from "lucide-react";

import { variantUrl } from "@/lib/image-variants";
import type { AdminPhoto } from "@/lib/admin-queries";
import { cn, formatDate, formatShutterSpeed } from "@/lib/utils";

interface PhotoPreviewProps {
	photos: AdminPhoto[];
	index: number;
	isSelected: boolean;
	onClose: () => void;
	onNavigate: (index: number) => void;
	onToggleSelect: (photo: AdminPhoto) => void;
	onTogglePublished: (photo: AdminPhoto) => void;
	onEdit: (photo: AdminPhoto) => void;
	onDelete: (photo: AdminPhoto) => void;
}

export default function PhotoPreview({
	photos,
	index,
	isSelected,
	onClose,
	onNavigate,
	onToggleSelect,
	onTogglePublished,
	onEdit,
	onDelete,
}: PhotoPreviewProps) {
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
				case " ":
					// Espace : cocher sans quitter l'aperçu, pour trier au clavier.
					event.preventDefault();
					if (photo) onToggleSelect(photo);
					break;
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [previous, next, onClose, onToggleSelect, photo]);

	// Précharge les voisines : la navigation doit être instantanée quand on
	// enchaîne les photos d'une même série.
	useEffect(() => {
		if (photos.length < 2) return;
		for (const target of [
			photos[(index + 1) % photos.length],
			photos[(index - 1 + photos.length) % photos.length],
		]) {
			if (!target) continue;
			const image = new window.Image();
			image.src = variantUrl(target.slug, "full");
		}
	}, [index, photos]);

	useEffect(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		dialogRef.current?.focus();
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, []);

	if (!photo) return null;

	const exifItems = [
		photo.album_title,
		photo.camera,
		photo.lens,
		photo.focal_length ? `${Math.round(photo.focal_length)} mm` : null,
		photo.aperture ? `ƒ/${photo.aperture}` : null,
		photo.shutter_speed ? formatShutterSpeed(photo.shutter_speed) : null,
		photo.iso ? `ISO ${photo.iso}` : null,
		`${photo.width} × ${photo.height}`,
		photo.taken_at ? formatDate(photo.taken_at) : null,
	].filter(Boolean) as string[];

	return (
		<div
			ref={dialogRef}
			role="dialog"
			aria-modal="true"
			aria-label={photo.title ?? photo.slug}
			tabIndex={-1}
			className="fixed inset-0 z-50 flex flex-col bg-ink/98 backdrop-blur-sm"
		>
			<div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
				<div className="flex min-w-0 items-baseline gap-3">
					<span className="shrink-0 text-xs tabular-nums text-faint">
						{index + 1} / {photos.length}
					</span>
					<span className="truncate text-xs text-muted">{photo.slug}</span>
					{!photo.published && (
						<span className="shrink-0 bg-ink-raised px-2 py-1 text-[10px] tracking-editorial text-muted">
							Brouillon
						</span>
					)}
				</div>

				<div className="flex shrink-0 items-center gap-1">
					<button
						type="button"
						onClick={() => onToggleSelect(photo)}
						title={isSelected ? "Retirer de la sélection" : "Ajouter à la sélection"}
						aria-pressed={isSelected}
						className={cn(
							"flex items-center gap-1.5 rounded-full px-3 py-2 text-xs transition-colors",
							isSelected ? "bg-line text-paper" : "text-muted hover:text-paper",
						)}
					>
						{isSelected ? <Check size={15} /> : <Square size={15} />}
						Sélectionner
					</button>
					<button
						type="button"
						onClick={() => onTogglePublished(photo)}
						title={photo.published ? "Dépublier" : "Publier"}
						aria-label={photo.published ? "Dépublier" : "Publier"}
						className="rounded-full p-2.5 text-muted transition-colors hover:text-paper"
					>
						{photo.published ? <EyeOff size={18} /> : <Eye size={18} />}
					</button>
					<button
						type="button"
						onClick={() => onEdit(photo)}
						title="Modifier"
						aria-label="Modifier"
						className="rounded-full p-2.5 text-muted transition-colors hover:text-paper"
					>
						<Pencil size={18} />
					</button>
					<button
						type="button"
						onClick={() => onDelete(photo)}
						title="Supprimer"
						aria-label="Supprimer"
						className="rounded-full p-2.5 text-muted transition-colors hover:text-red-400"
					>
						<Trash2 size={18} />
					</button>
					<button
						type="button"
						onClick={onClose}
						title="Fermer"
						aria-label="Fermer"
						className="rounded-full p-2.5 text-muted transition-colors hover:text-paper"
					>
						<X size={20} />
					</button>
				</div>
			</div>

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
					alt={photo.title ?? photo.slug}
					width={photo.width}
					height={photo.height}
					sizes="100vw"
					priority
					className={cn(
						"max-h-full w-auto max-w-full object-contain transition-opacity",
						!photo.published && "opacity-60",
					)}
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

			<div className="px-4 pb-5 pt-3 sm:px-8">
				{photo.title && (
					<p className="font-display text-lg text-paper">{photo.title}</p>
				)}
				{photo.caption && (
					<p className="mt-1 max-w-2xl text-sm text-muted">{photo.caption}</p>
				)}
				<dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-faint">
					{exifItems.map((item) => (
						<div key={item}>
							<dd>{item}</dd>
						</div>
					))}
				</dl>
				<p className="mt-3 text-[11px] text-faint">
					← → naviguer · Espace sélectionner · Échap fermer
				</p>
			</div>
		</div>
	);
}

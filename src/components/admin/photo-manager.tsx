"use client";

import Image from "next/image";
import { useOptimistic, useState, useTransition } from "react";
import { Check, Eye, EyeOff, Pencil, Trash2, X } from "lucide-react";

import {
	deletePhoto,
	setPhotoPublished,
	updatePhotoDetails,
} from "@/app/admin/actions";
import { variantUrl } from "@/lib/image-variants";
import type { AdminPhoto } from "@/lib/admin-queries";
import type { Album } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PhotoManagerProps {
	photos: AdminPhoto[];
	albums: Pick<Album, "id" | "title">[];
}

export default function PhotoManager({ photos, albums }: PhotoManagerProps) {
	const [editing, setEditing] = useState<AdminPhoto | null>(null);
	const [items, setItems] = useState(photos);
	const [, startTransition] = useTransition();

	// Reflet immédiat des bascules publié/brouillon, avant la réponse serveur.
	const [optimisticItems, applyOptimistic] = useOptimistic(
		items,
		(state: AdminPhoto[], update: { id: string; published: boolean }) =>
			state.map((photo) =>
				photo.id === update.id ? { ...photo, published: update.published } : photo,
			),
	);

	function togglePublished(photo: AdminPhoto) {
		startTransition(async () => {
			applyOptimistic({ id: photo.id, published: !photo.published });
			const result = await setPhotoPublished(photo.id, !photo.published);
			if (!("error" in result)) {
				setItems((current) =>
					current.map((item) =>
						item.id === photo.id ? { ...item, published: !photo.published } : item,
					),
				);
			}
		});
	}

	function remove(photo: AdminPhoto) {
		if (
			!window.confirm(
				`Supprimer définitivement « ${photo.title ?? photo.slug} » ?\n\nLa fiche est retirée de la base ; le fichier reste sur le stockage R2.`,
			)
		) {
			return;
		}
		startTransition(async () => {
			const result = await deletePhoto(photo.id);
			if (!("error" in result)) {
				setItems((current) => current.filter((item) => item.id !== photo.id));
			}
		});
	}

	return (
		<>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
				{optimisticItems.map((photo) => (
					<div key={photo.id} className="group relative">
						<div
							className={cn(
								"relative overflow-hidden bg-ink-soft transition-opacity",
								!photo.published && "opacity-40",
							)}
						>
							<Image
								src={variantUrl(photo.slug, "thumb")}
								alt={photo.title ?? photo.slug}
								width={photo.width}
								height={photo.height}
								sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
								className="aspect-square w-full object-cover"
							/>

							{!photo.published && (
								<span className="absolute left-2 top-2 bg-ink/90 px-2 py-1 text-[10px] tracking-editorial text-muted">
									Brouillon
								</span>
							)}
						</div>

						{/* Actions, révélées au survol */}
						<div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-ink to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
							<button
								type="button"
								onClick={() => togglePublished(photo)}
								title={photo.published ? "Dépublier" : "Publier"}
								aria-label={photo.published ? "Dépublier" : "Publier"}
								className="rounded-full bg-ink-raised p-2 text-muted transition-colors hover:text-paper"
							>
								{photo.published ? <EyeOff size={14} /> : <Eye size={14} />}
							</button>
							<button
								type="button"
								onClick={() => setEditing(photo)}
								title="Modifier"
								aria-label="Modifier"
								className="rounded-full bg-ink-raised p-2 text-muted transition-colors hover:text-paper"
							>
								<Pencil size={14} />
							</button>
							<button
								type="button"
								onClick={() => remove(photo)}
								title="Supprimer"
								aria-label="Supprimer"
								className="rounded-full bg-ink-raised p-2 text-muted transition-colors hover:text-red-400"
							>
								<Trash2 size={14} />
							</button>
						</div>

						<p className="mt-2 truncate text-xs text-faint" title={photo.slug}>
							{photo.title ?? photo.slug}
						</p>
					</div>
				))}
			</div>

			{editing && (
				<EditDialog
					photo={editing}
					albums={albums}
					onClose={() => setEditing(null)}
					onSaved={(updated) => {
						setItems((current) =>
							current.map((item) => (item.id === updated.id ? updated : item)),
						);
						setEditing(null);
					}}
				/>
			)}
		</>
	);
}

function EditDialog({
	photo,
	albums,
	onClose,
	onSaved,
}: {
	photo: AdminPhoto;
	albums: Pick<Album, "id" | "title">[];
	onClose: () => void;
	onSaved: (photo: AdminPhoto) => void;
}) {
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);

		startTransition(async () => {
			const result = await updatePhotoDetails(photo.id, formData);
			if ("error" in result && result.error) {
				setError(result.error);
				return;
			}
			onSaved({
				...photo,
				title: (formData.get("title") as string)?.trim() || null,
				caption: (formData.get("caption") as string)?.trim() || null,
				album_id: (formData.get("album_id") as string) || null,
			});
		});
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-5 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-label="Modifier la photo"
				className="w-full max-w-md border border-line bg-ink-soft p-6"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="flex items-start justify-between gap-4">
					<h2 className="font-display text-2xl">Modifier</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Fermer"
						className="text-muted transition-colors hover:text-paper"
					>
						<X size={18} />
					</button>
				</div>

				<form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5">
					<div>
						<label htmlFor="title" className="text-[11px] tracking-editorial text-faint">
							Titre
						</label>
						<input
							id="title"
							name="title"
							defaultValue={photo.title ?? ""}
							maxLength={120}
							className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm text-paper outline-none focus:border-accent"
						/>
					</div>

					<div>
						<label htmlFor="caption" className="text-[11px] tracking-editorial text-faint">
							Légende
						</label>
						<textarea
							id="caption"
							name="caption"
							defaultValue={photo.caption ?? ""}
							maxLength={600}
							rows={3}
							className="mt-2 w-full resize-none border-b border-line bg-transparent py-2 text-sm text-paper outline-none focus:border-accent"
						/>
					</div>

					<div>
						<label htmlFor="album_id" className="text-[11px] tracking-editorial text-faint">
							Album
						</label>
						<select
							id="album_id"
							name="album_id"
							defaultValue={photo.album_id ?? ""}
							className="mt-2 w-full border-b border-line bg-ink-soft py-2 text-sm text-paper outline-none focus:border-accent"
						>
							<option value="">— Aucun —</option>
							{albums.map((album) => (
								<option key={album.id} value={album.id}>
									{album.title}
								</option>
							))}
						</select>
					</div>

					{error && <p className="text-xs text-red-400">{error}</p>}

					<button
						type="submit"
						disabled={isPending}
						className="mt-2 flex items-center justify-center gap-2 border border-line py-2.5 text-xs tracking-editorial text-paper transition-colors hover:border-accent/60 disabled:opacity-50"
					>
						<Check size={14} />
						{isPending ? "Enregistrement…" : "Enregistrer"}
					</button>
				</form>
			</div>
		</div>
	);
}

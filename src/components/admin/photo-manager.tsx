"use client";

import Image from "next/image";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import {
	Check,
	CheckSquare,
	Eye,
	EyeOff,
	Loader2,
	Pencil,
	Trash2,
	X,
} from "lucide-react";

import {
	deletePhotos,
	setPhotosPublished,
	updatePhotoDetails,
} from "@/app/admin/actions";
import PhotoPreview from "@/components/admin/photo-preview";
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
	const [previewIndex, setPreviewIndex] = useState<number | null>(null);
	const [items, setItems] = useState(photos);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	// En mode sélection, cliquer une vignette la coche au lieu de l'agrandir :
	// on trie une planche entière sans viser les cases une par une.
	const [bulkMode, setBulkMode] = useState(false);
	const [notice, setNotice] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	// Ancre du Maj+clic : dernière vignette cochée à la main.
	const lastToggled = useRef<string | null>(null);

	function exitBulkMode() {
		setBulkMode(false);
		setSelected(new Set());
		lastToggled.current = null;
	}

	useEffect(() => {
		if (!bulkMode) return;
		const onKey = (event: KeyboardEvent) => {
			// L'aperçu gère sa propre touche Échap, on ne lui coupe pas l'herbe.
			if (event.key === "Escape" && previewIndex === null) exitBulkMode();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [bulkMode, previewIndex]);

	const [optimisticItems, applyOptimistic] = useOptimistic(
		items,
		(state: AdminPhoto[], update: { ids: Set<string>; published: boolean }) =>
			state.map((photo) =>
				update.ids.has(photo.id) ? { ...photo, published: update.published } : photo,
			),
	);

	function toggleSelected(photo: AdminPhoto, extend: boolean) {
		setSelected((current) => {
			const next = new Set(current);
			const anchor = lastToggled.current;

			if (extend && anchor && anchor !== photo.id) {
				const from = optimisticItems.findIndex((item) => item.id === anchor);
				const to = optimisticItems.findIndex((item) => item.id === photo.id);
				if (from !== -1 && to !== -1) {
					const shouldSelect = !next.has(photo.id);
					for (let i = Math.min(from, to); i <= Math.max(from, to); i += 1) {
						if (shouldSelect) next.add(optimisticItems[i].id);
						else next.delete(optimisticItems[i].id);
					}
					lastToggled.current = photo.id;
					return next;
				}
			}

			if (next.has(photo.id)) next.delete(photo.id);
			else next.add(photo.id);
			lastToggled.current = photo.id;
			return next;
		});
	}

	function publishMany(ids: string[], published: boolean) {
		const idSet = new Set(ids);
		startTransition(async () => {
			applyOptimistic({ ids: idSet, published });
			const result = await setPhotosPublished(ids, published);
			if ("error" in result) {
				setNotice(result.error);
				return;
			}
			setItems((current) =>
				current.map((item) => (idSet.has(item.id) ? { ...item, published } : item)),
			);
			setSelected(new Set());
			setNotice(
				`${ids.length} photo${ids.length > 1 ? "s" : ""} ${published ? "publiée" : "dépubliée"}${ids.length > 1 ? "s" : ""}.`,
			);
		});
	}

	function removeMany(ids: string[]) {
		const count = ids.length;
		const label =
			count === 1
				? `« ${items.find((item) => item.id === ids[0])?.title ?? items.find((item) => item.id === ids[0])?.slug} »`
				: `${count} photos`;

		if (
			!window.confirm(
				`Supprimer définitivement ${label} ?\n\nLa fiche est retirée de la base et les fichiers correspondants sont effacés du stockage R2. Cette action est irréversible.`,
			)
		) {
			return;
		}

		const idSet = new Set(ids);
		setPreviewIndex(null);
		startTransition(async () => {
			const result = await deletePhotos(ids);
			if ("error" in result) {
				setNotice(result.error);
				return;
			}
			setItems((current) => current.filter((item) => !idSet.has(item.id)));
			setSelected(new Set());
			setNotice(
				result.orphanedFiles
					? `${result.count} photo${result.count > 1 ? "s" : ""} supprimée${result.count > 1 ? "s" : ""}, mais ${result.orphanedFiles} fichier${result.orphanedFiles > 1 ? "s" : ""} n'a pas pu être effacé de R2.`
					: `${result.count} photo${result.count > 1 ? "s" : ""} supprimée${result.count > 1 ? "s" : ""}, fichiers R2 compris.`,
			);
		});
	}

	const allSelected = selected.size > 0 && selected.size === optimisticItems.length;

	return (
		<>
			<div className="mb-6 flex flex-wrap items-center gap-3 text-xs">
				<button
					type="button"
					onClick={() => (bulkMode ? exitBulkMode() : setBulkMode(true))}
					aria-pressed={bulkMode}
					className={cn(
						"flex items-center gap-2 border px-4 py-2 tracking-editorial transition-colors",
						bulkMode
							? "border-accent/60 bg-ink-raised text-paper"
							: "border-line text-faint hover:text-paper",
					)}
				>
					<CheckSquare size={14} />
					{bulkMode ? "Quitter le mode sélection" : "Mode sélection"}
				</button>

				{bulkMode && (
					<button
						type="button"
						onClick={() =>
							setSelected(
								allSelected
									? new Set()
									: new Set(optimisticItems.map((item) => item.id)),
							)
						}
						className="border border-line px-4 py-2 tracking-editorial text-faint transition-colors hover:text-paper"
					>
						{allSelected
							? "Tout désélectionner"
							: `Tout sélectionner (${optimisticItems.length})`}
					</button>
				)}

				<p className="text-faint">
					{bulkMode
						? "Clic pour cocher · Maj+clic pour une plage · Échap pour quitter"
						: "Clic pour agrandir une photo."}
				</p>
				{notice && <p className="text-accent">{notice}</p>}
			</div>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
				{optimisticItems.map((photo, index) => {
					const isSelected = selected.has(photo.id);

					return (
						<div key={photo.id} className="group relative">
							<div
								className={cn(
									"relative overflow-hidden bg-ink-soft transition-opacity",
									!photo.published && "opacity-40",
									isSelected && "ring-2 ring-accent",
								)}
							>
								<button
									type="button"
									onClick={(event) =>
										bulkMode
											? toggleSelected(photo, event.shiftKey)
											: setPreviewIndex(index)
									}
									aria-label={
										bulkMode
											? `Sélectionner ${photo.title ?? photo.slug}`
											: `Agrandir ${photo.title ?? photo.slug}`
									}
									aria-pressed={bulkMode ? isSelected : undefined}
									className={cn(
										"block w-full",
										bulkMode ? "cursor-pointer" : "cursor-zoom-in",
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
								</button>

								{!photo.published && (
									<span className="absolute left-2 top-2 bg-ink/90 px-2 py-1 text-[10px] tracking-editorial text-muted">
										Brouillon
									</span>
								)}

								<label
									className={cn(
										"absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center bg-ink/80 transition-opacity",
										isSelected || bulkMode
											? "opacity-100"
											: "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
									)}
								>
									<span className="sr-only">
										Sélectionner {photo.title ?? photo.slug}
									</span>
									<input
										type="checkbox"
										checked={isSelected}
										onChange={() => undefined}
										onClick={(event) => toggleSelected(photo, event.shiftKey)}
										className="h-4 w-4 accent-accent"
									/>
								</label>
							</div>

							<div
								className={cn(
									"absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-ink to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100",
									// En mode sélection la vignette entière est une case à cocher :
									// les actions unitaires n'ont plus à intercepter le clic.
									bulkMode && "hidden",
								)}
							>
								<button
									type="button"
									onClick={() => publishMany([photo.id], !photo.published)}
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
									onClick={() => removeMany([photo.id])}
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
					);
				})}
			</div>

			{selected.size > 0 && (
				<div className="sticky bottom-6 z-40 mx-auto mt-8 flex w-fit flex-wrap items-center gap-2 border border-line bg-ink-soft/95 px-4 py-3 text-xs backdrop-blur-sm">
					<span className="flex items-center gap-2 pr-2 tracking-editorial text-paper">
						{isPending && <Loader2 size={13} className="animate-spin text-accent" />}
						{isPending
							? "Traitement en cours…"
							: `${selected.size} sélectionnée${selected.size > 1 ? "s" : ""}`}
					</span>
					<button
						type="button"
						disabled={isPending}
						onClick={() => publishMany([...selected], true)}
						className="flex items-center gap-1.5 border border-line px-3 py-2 text-muted transition-colors hover:text-paper disabled:opacity-50"
					>
						<Eye size={13} /> Publier
					</button>
					<button
						type="button"
						disabled={isPending}
						onClick={() => publishMany([...selected], false)}
						className="flex items-center gap-1.5 border border-line px-3 py-2 text-muted transition-colors hover:text-paper disabled:opacity-50"
					>
						<EyeOff size={13} /> Dépublier
					</button>
					<button
						type="button"
						disabled={isPending}
						onClick={() => removeMany([...selected])}
						className="flex items-center gap-1.5 border border-line px-3 py-2 text-muted transition-colors hover:border-red-400/60 hover:text-red-400 disabled:opacity-50"
					>
						<Trash2 size={13} /> Supprimer
					</button>
					<button
						type="button"
						onClick={() => setSelected(new Set())}
						aria-label="Vider la sélection"
						className="ml-1 p-2 text-faint transition-colors hover:text-paper"
					>
						<X size={14} />
					</button>
				</div>
			)}

			{previewIndex !== null && optimisticItems[previewIndex] && (
				<PhotoPreview
					photos={optimisticItems}
					index={previewIndex}
					isSelected={selected.has(optimisticItems[previewIndex].id)}
					onClose={() => setPreviewIndex(null)}
					onNavigate={setPreviewIndex}
					onToggleSelect={(photo) => toggleSelected(photo, false)}
					onTogglePublished={(photo) =>
						publishMany([photo.id], !photo.published)
					}
					onEdit={(photo) => {
						setPreviewIndex(null);
						setEditing(photo);
					}}
					onDelete={(photo) => removeMany([photo.id])}
				/>
			)}

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

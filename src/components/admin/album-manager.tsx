"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";

import { updateAlbum } from "@/app/admin/actions";
import type { Album } from "@/lib/types";

type AlbumRow = Album & { photo_count: number };

export default function AlbumManager({ albums }: { albums: AlbumRow[] }) {
	return (
		<ul className="flex flex-col divide-y divide-line/60 border-y border-line/60">
			{albums.map((album) => (
				<AlbumRowForm key={album.id} album={album} />
			))}
		</ul>
	);
}

function AlbumRowForm({ album }: { album: AlbumRow }) {
	const [feedback, setFeedback] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);

		startTransition(async () => {
			const result = await updateAlbum(album.id, formData);
			setFeedback(
				"error" in result && result.error ? result.error : "Enregistré",
			);
			setTimeout(() => setFeedback(null), 2500);
		});
	}

	return (
		<li className="py-6">
			<form onSubmit={onSubmit} className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<input
						name="title"
						defaultValue={album.title}
						maxLength={80}
						required
						aria-label={`Titre de l'album ${album.title}`}
						className="min-w-0 flex-1 border-b border-transparent bg-transparent font-display text-2xl text-paper outline-none transition-colors hover:border-line focus:border-accent"
					/>
					<span className="shrink-0 text-xs text-faint">
						{album.photo_count} photo{album.photo_count > 1 ? "s" : ""}
					</span>
				</div>

				<textarea
					name="description"
					defaultValue={album.description ?? ""}
					maxLength={600}
					rows={2}
					placeholder="Description (optionnelle)…"
					aria-label={`Description de l'album ${album.title}`}
					className="w-full resize-none border-b border-line bg-transparent py-2 text-sm text-muted outline-none placeholder:text-faint focus:border-accent"
				/>

				<div className="flex flex-wrap items-center gap-6">
					<label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
						<input
							type="checkbox"
							name="published"
							defaultChecked={album.published}
							className="size-4 accent-[var(--color-accent)]"
						/>
						Visible sur le site
					</label>

					<button
						type="submit"
						disabled={isPending}
						className="flex items-center gap-2 border border-line px-4 py-2 text-xs tracking-editorial text-muted transition-colors hover:border-accent/60 hover:text-paper disabled:opacity-50"
					>
						<Check size={13} />
						{isPending ? "…" : "Enregistrer"}
					</button>

					{feedback && (
						<span role="status" className="text-xs text-accent">
							{feedback}
						</span>
					)}
				</div>
			</form>
		</li>
	);
}

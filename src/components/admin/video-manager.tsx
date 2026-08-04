"use client";

import { useRef, useState, useTransition } from "react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";

import { createVideo, deleteVideo, setVideoPublished } from "@/app/admin/actions";
import type { Video } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function VideoManager({ videos }: { videos: Video[] }) {
	const [items, setItems] = useState(videos);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const formRef = useRef<HTMLFormElement>(null);

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		setError(null);

		startTransition(async () => {
			const result = await createVideo(formData);
			if ("error" in result && result.error) {
				setError(result.error);
				return;
			}
			formRef.current?.reset();

			window.location.reload();
		});
	}

	function togglePublished(video: Video) {
		startTransition(async () => {
			const result = await setVideoPublished(video.id, !video.published);
			if (!("error" in result)) {
				setItems((current) =>
					current.map((item) =>
						item.id === video.id ? { ...item, published: !video.published } : item,
					),
				);
			}
		});
	}

	function remove(video: Video) {
		if (!window.confirm(`Retirer « ${video.title} » du site ?`)) return;
		startTransition(async () => {
			const result = await deleteVideo(video.id);
			if (!("error" in result)) {
				setItems((current) => current.filter((item) => item.id !== video.id));
			}
		});
	}

	return (
		<>
			<form
				ref={formRef}
				onSubmit={onSubmit}
				className="flex flex-col gap-4 border border-line/70 p-6"
			>
				<div>
					<label htmlFor="youtube_id" className="text-[11px] tracking-editorial text-faint">
						URL ou identifiant YouTube
					</label>
					<input
						id="youtube_id"
						name="youtube_id"
						required
						placeholder="https://www.youtube.com/watch?v=…"
						className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm text-paper outline-none placeholder:text-faint focus:border-accent"
					/>
				</div>

				<div>
					<label htmlFor="title" className="text-[11px] tracking-editorial text-faint">
						Titre
					</label>
					<input
						id="title"
						name="title"
						required
						maxLength={120}
						className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm text-paper outline-none focus:border-accent"
					/>
				</div>

				<div>
					<label htmlFor="description" className="text-[11px] tracking-editorial text-faint">
						Description (optionnelle)
					</label>
					<textarea
						id="description"
						name="description"
						rows={2}
						maxLength={600}
						className="mt-2 w-full resize-none border-b border-line bg-transparent py-2 text-sm text-paper outline-none focus:border-accent"
					/>
				</div>

				{error && <p className="text-xs text-red-400">{error}</p>}

				<button
					type="submit"
					disabled={isPending}
					className="mt-2 flex items-center justify-center gap-2 border border-line py-2.5 text-xs tracking-editorial text-paper transition-colors hover:border-accent/60 disabled:opacity-50"
				>
					<Plus size={14} />
					{isPending ? "Ajout…" : "Ajouter la vidéo"}
				</button>
			</form>

			{items.length > 0 && (
				<ul className="mt-10 flex flex-col divide-y divide-line/60 border-y border-line/60">
					{items.map((video) => (
						<li
							key={video.id}
							className={cn(
								"flex flex-wrap items-center gap-4 py-5",
								!video.published && "opacity-50",
							)}
						>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm text-paper">{video.title}</p>
								<p className="mt-0.5 font-mono text-xs text-faint">
									{video.youtube_id}
								</p>
							</div>

							<button
								type="button"
								onClick={() => togglePublished(video)}
								aria-label={video.published ? "Masquer" : "Afficher"}
								className="rounded-full p-2 text-muted transition-colors hover:text-paper"
							>
								{video.published ? <EyeOff size={15} /> : <Eye size={15} />}
							</button>
							<button
								type="button"
								onClick={() => remove(video)}
								aria-label="Supprimer"
								className="rounded-full p-2 text-muted transition-colors hover:text-red-400"
							>
								<Trash2 size={15} />
							</button>
						</li>
					))}
				</ul>
			)}
		</>
	);
}

"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";

import type { Comment } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";

export default function CommentSection({
	photoId,
	comments,
}: {
	photoId: string;
	comments: Comment[];
}) {
	const [status, setStatus] = useState<Status>("idle");
	const [message, setMessage] = useState("");

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const data = new FormData(form);

		setStatus("sending");
		try {
			const response = await fetch(`/api/photos/${photoId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					author_name: data.get("author_name"),
					body: data.get("body"),
					website: data.get("website"),
				}),
			});

			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as
					| { error?: string }
					| null;
				setMessage(payload?.error ?? "Envoi impossible pour le moment.");
				setStatus("error");
				return;
			}

			form.reset();
			setMessage("Merci ! Ton commentaire sera visible après relecture.");
			setStatus("sent");
		} catch {
			setMessage("Envoi impossible pour le moment.");
			setStatus("error");
		}
	}

	return (
		<section className="mt-16">
			<h2 className="flex items-center gap-2 text-[11px] tracking-editorial text-faint">
				<MessageCircle size={13} />
				Commentaires
				{comments.length > 0 && <span>({comments.length})</span>}
			</h2>

			<form onSubmit={onSubmit} className="mt-6 max-w-xl">
				<div className="flex flex-col gap-3">
					<label className="sr-only" htmlFor="author_name">
						Pseudo
					</label>
					<input
						id="author_name"
						name="author_name"
						required
						minLength={2}
						maxLength={40}
						placeholder="Ton pseudo"
						className="border-b border-line bg-transparent py-2 text-sm text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
					/>

					<label className="sr-only" htmlFor="body">
						Message
					</label>
					<textarea
						id="body"
						name="body"
						required
						minLength={2}
						maxLength={1000}
						rows={3}
						placeholder="Ton message…"
						className="resize-none border-b border-line bg-transparent py-2 text-sm text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
					/>

					<input
						type="text"
						name="website"
						tabIndex={-1}
						autoComplete="off"
						aria-hidden="true"
						className="absolute left-[-9999px] h-0 w-0 opacity-0"
					/>
				</div>

				<div className="mt-4 flex items-center gap-4">
					<button
						type="submit"
						disabled={status === "sending"}
						className="flex items-center gap-2 border border-line px-5 py-2 text-xs tracking-editorial text-muted transition-colors hover:border-accent/60 hover:text-paper disabled:opacity-50"
					>
						<Send size={13} />
						{status === "sending" ? "Envoi…" : "Envoyer"}
					</button>

					{message && (
						<p
							role="status"
							className={
								status === "error" ? "text-xs text-red-400" : "text-xs text-accent"
							}
						>
							{message}
						</p>
					)}
				</div>
			</form>

			{comments.length > 0 && (
				<ul className="mt-12 flex max-w-xl flex-col gap-8">
					{comments.map((comment) => (
						<li key={comment.id}>
							<div className="flex items-baseline gap-3">
								<span className="text-sm text-paper">{comment.author_name}</span>
								<span className="text-xs text-faint">
									{formatRelativeDate(comment.created_at)}
								</span>
							</div>
							<p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted">
								{comment.body}
							</p>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

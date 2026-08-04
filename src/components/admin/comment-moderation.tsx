"use client";

import { useState, useTransition } from "react";
import { Check, Trash2, X } from "lucide-react";

import { deleteComment, moderateComment } from "@/app/admin/actions";
import type { AdminComment } from "@/lib/admin-queries";
import { cn, formatRelativeDate } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
	pending: "En attente",
	approved: "Approuvé",
	rejected: "Rejeté",
};

export default function CommentModeration({
	comments,
}: {
	comments: AdminComment[];
}) {
	const [items, setItems] = useState(comments);
	const [isPending, startTransition] = useTransition();

	function moderate(id: string, status: "approved" | "rejected") {
		startTransition(async () => {
			const result = await moderateComment(id, status);
			if (!("error" in result)) {
				setItems((current) =>
					current.map((item) => (item.id === id ? { ...item, status } : item)),
				);
			}
		});
	}

	function remove(id: string) {
		if (!window.confirm("Supprimer définitivement ce commentaire ?")) return;
		startTransition(async () => {
			const result = await deleteComment(id);
			if (!("error" in result)) {
				setItems((current) => current.filter((item) => item.id !== id));
			}
		});
	}

	return (
		<ul className="flex flex-col divide-y divide-line/60 border-y border-line/60">
			{items.map((comment) => (
				<li key={comment.id} className="py-6">
					<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
						<span className="text-sm text-paper">{comment.author_name}</span>
						<span className="text-xs text-faint">
							{formatRelativeDate(comment.created_at)}
						</span>
						<span
							className={cn(
								"text-[10px] tracking-editorial",
								comment.status === "approved" && "text-accent",
								comment.status === "pending" && "text-muted",
								comment.status === "rejected" && "text-faint line-through",
							)}
						>
							{STATUS_LABELS[comment.status]}
						</span>
						{comment.photo_slug && (
							<span className="truncate text-xs text-faint">
								sur « {comment.photo_title ?? comment.photo_slug} »
							</span>
						)}
					</div>

					<p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
						{comment.body}
					</p>

					<div className="mt-4 flex gap-2">
						{comment.status !== "approved" && (
							<button
								type="button"
								disabled={isPending}
								onClick={() => moderate(comment.id, "approved")}
								className="flex items-center gap-2 border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/60 hover:text-paper disabled:opacity-50"
							>
								<Check size={13} />
								Approuver
							</button>
						)}
						{comment.status !== "rejected" && (
							<button
								type="button"
								disabled={isPending}
								onClick={() => moderate(comment.id, "rejected")}
								className="flex items-center gap-2 border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:text-paper disabled:opacity-50"
							>
								<X size={13} />
								Rejeter
							</button>
						)}
						<button
							type="button"
							disabled={isPending}
							onClick={() => remove(comment.id)}
							className="flex items-center gap-2 border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-red-400/50 hover:text-red-400 disabled:opacity-50"
						>
							<Trash2 size={13} />
							Supprimer
						</button>
					</div>
				</li>
			))}
		</ul>
	);
}

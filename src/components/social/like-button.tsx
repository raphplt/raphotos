"use client";

import { useCallback, useState, useSyncExternalStore, useTransition } from "react";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

const STORAGE_KEY = "raphotos:likes";

/**
 * Mémoire locale des photos aimées.
 *
 * Le cookie visiteur qui fait autorité est `httpOnly` : le client ne peut donc
 * pas déduire son propre état. On garde ici un miroir purement visuel — le
 * décompte, lui, vient toujours du serveur, où la contrainte d'unicité
 * (photo_id, visitor_id) empêche tout double comptage.
 */
function readLocalLikes(): Set<string> {
	if (typeof window === "undefined") return new Set();
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		return new Set(raw ? (JSON.parse(raw) as string[]) : []);
	} catch {
		return new Set();
	}
}

/** Abonnés locaux : `storage` ne se déclenche que dans les *autres* onglets. */
const listeners = new Set<() => void>();

function subscribeLocalLikes(listener: () => void) {
	listeners.add(listener);
	window.addEventListener("storage", listener);
	return () => {
		listeners.delete(listener);
		window.removeEventListener("storage", listener);
	};
}

function writeLocalLikes(likes: Set<string>) {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...likes]));
	} catch {
		// Stockage indisponible (navigation privée) : sans conséquence.
	}
	for (const listener of listeners) listener();
}

interface LikeButtonProps {
	photoId: string;
	initialCount: number;
	variant?: "default" | "ghost";
}

export default function LikeButton({
	photoId,
	initialCount,
	variant = "default",
}: LikeButtonProps) {
	const [count, setCount] = useState(initialCount);
	const [isPending, startTransition] = useTransition();

	// Le stockage local est un système externe : useSyncExternalStore le lit
	// sans effet ni setState au montage, et gère proprement le rendu serveur
	// (où l'état vaut toujours « non aimé »).
	const liked = useSyncExternalStore(
		subscribeLocalLikes,
		useCallback(() => readLocalLikes().has(photoId), [photoId]),
		() => false,
	);

	function toggle() {
		const nextLiked = !liked;

		// Optimistic UI : on applique tout de suite, on corrige si le serveur
		// répond autre chose.
		setCount((c) => c + (nextLiked ? 1 : -1));

		const likes = readLocalLikes();
		if (nextLiked) likes.add(photoId);
		else likes.delete(photoId);
		writeLocalLikes(likes);

		startTransition(async () => {
			try {
				const response = await fetch(`/api/photos/${photoId}/like`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ liked: nextLiked }),
				});
				if (!response.ok) throw new Error("échec");

				const data = (await response.json()) as { liked: boolean; count: number };
				setCount(data.count);

				// Le serveur fait foi : on aligne le miroir local sur sa réponse.
				const synced = readLocalLikes();
				if (data.liked) synced.add(photoId);
				else synced.delete(photoId);
				writeLocalLikes(synced);
			} catch {
				// Retour à l'état antérieur
				setCount((c) => c + (nextLiked ? -1 : 1));
				const reverted = readLocalLikes();
				if (nextLiked) reverted.delete(photoId);
				else reverted.add(photoId);
				writeLocalLikes(reverted);
			}
		});
	}

	return (
		<button
			type="button"
			onClick={toggle}
			disabled={isPending}
			aria-pressed={liked}
			aria-label={liked ? "Retirer mon j'aime" : "J'aime cette photo"}
			className={cn(
				"group flex items-center gap-2 rounded-full transition-all",
				variant === "default"
					? "border border-line px-4 py-2 hover:border-accent/60"
					: "p-2.5",
				liked ? "text-accent" : "text-muted hover:text-paper",
			)}
		>
			<Heart
				size={18}
				className={cn(
					"transition-transform duration-300",
					liked ? "scale-110 fill-current" : "group-hover:scale-110",
				)}
			/>
			{count > 0 && <span className="text-sm tabular-nums">{count}</span>}
		</button>
	);
}

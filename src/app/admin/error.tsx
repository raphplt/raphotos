"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";

export default function AdminError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="mx-auto max-w-2xl px-5 py-24 sm:px-8">
			<h1 className="font-display text-4xl">Ça a coincé</h1>
			<p className="mt-4 text-sm text-muted">
				Une requête de l&apos;administration a échoué. Le détail est ci-dessous —
				s&apos;il mentionne une colonne ou une table absente, c&apos;est
				qu&apos;une migration de <code className="text-accent">supabase/migrations</code>{" "}
				reste à appliquer.
			</p>

			<pre className="mt-6 overflow-x-auto border border-line bg-ink-soft p-4 text-xs text-faint">
				{error.message}
			</pre>

			<button
				type="button"
				onClick={reset}
				className="mt-8 inline-flex items-center gap-2 border border-line px-5 py-2.5 text-xs tracking-editorial text-paper transition-colors hover:border-accent/60"
			>
				<RotateCw size={14} />
				Réessayer
			</button>
		</div>
	);
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import AdminNav from "@/components/admin/admin-nav";
import { getAdminStats } from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
	await requireAdmin();
	const stats = await getAdminStats();

	const tiles = [
		{ label: "Photos publiées", value: stats.photos - stats.drafts, href: "/admin/photos" },
		{ label: "Brouillons", value: stats.drafts, href: "/admin/photos?filtre=brouillons" },
		{ label: "Albums", value: stats.albums, href: "/admin/albums" },
		{ label: "J'aime reçus", value: stats.likes, href: "/admin/photos" },
	];

	return (
		<>
			<AdminNav pendingCount={stats.pendingComments} />

			<div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8">
				<h1 className="font-display text-4xl">Tableau de bord</h1>

				<div className="mt-10 grid grid-cols-2 gap-px overflow-hidden border border-line/70 bg-line/70 lg:grid-cols-4">
					{tiles.map((tile) => (
						<Link
							key={tile.label}
							href={tile.href}
							className="group bg-ink p-6 transition-colors hover:bg-ink-soft"
						>
							<p className="text-[11px] tracking-editorial text-faint">
								{tile.label}
							</p>
							<p className="mt-3 font-display text-4xl tabular-nums">
								{tile.value}
							</p>
						</Link>
					))}
				</div>

				{stats.pendingComments > 0 && (
					<Link
						href="/admin/commentaires"
						className="group mt-8 flex items-center justify-between gap-4 border border-accent/40 bg-accent/5 p-6 transition-colors hover:bg-accent/10"
					>
						<div>
							<p className="text-sm text-paper">
								{stats.pendingComments} commentaire
								{stats.pendingComments > 1 ? "s" : ""} en attente de relecture
							</p>
							<p className="mt-1 text-xs text-muted">
								Ils ne sont pas visibles publiquement tant qu&apos;ils ne sont pas
								approuvés.
							</p>
						</div>
						<ArrowRight
							size={18}
							className="shrink-0 text-accent transition-transform duration-300 group-hover:translate-x-1"
						/>
					</Link>
				)}

				<section className="mt-14">
					<h2 className="text-[11px] tracking-editorial text-faint">
						Ajouter des photos
					</h2>
					<div className="mt-4 border border-line/70 p-6">
						<p className="text-sm text-muted">
							L&apos;import se fait en ligne de commande, depuis ton ordinateur —
							le traitement des fichiers lourds (redimensionnement, EXIF, envoi
							vers R2) n&apos;est pas réalisable depuis le navigateur.
						</p>
						<pre className="mt-4 overflow-x-auto border border-line/70 bg-ink-soft p-4 text-xs text-accent">
							npm run import -- &quot;/chemin/vers/le/dossier&quot;
						</pre>
						<p className="mt-3 text-xs text-faint">
							Les photos importées arrivent publiées. Utilise l&apos;onglet Photos
							pour dépublier celles que tu ne veux pas montrer.
						</p>
					</div>
				</section>
			</div>
		</>
	);
}

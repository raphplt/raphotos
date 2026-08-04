import Link from "next/link";

import AdminNav from "@/components/admin/admin-nav";
import PhotoManager from "@/components/admin/photo-manager";
import {
	getAdminAlbums,
	getAdminPhotos,
	getAdminStats,
} from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage({
	searchParams,
}: {
	searchParams: Promise<{ filtre?: string; album?: string }>;
}) {
	await requireAdmin();
	const { filtre, album } = await searchParams;
	const onlyDrafts = filtre === "brouillons";

	const [photos, albums, stats] = await Promise.all([
		getAdminPhotos({ onlyDrafts, albumId: album }),
		getAdminAlbums(),
		getAdminStats(),
	]);

	const filters = [
		{ label: "Toutes", href: "/admin/photos", active: !onlyDrafts && !album },
		{
			label: `Brouillons (${stats.drafts})`,
			href: "/admin/photos?filtre=brouillons",
			active: onlyDrafts,
		},
	];

	return (
		<>
			<AdminNav pendingCount={stats.pendingComments} />

			<div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<div>
						<h1 className="font-display text-4xl">Photos</h1>
						<p className="mt-2 text-sm text-muted">
							{photos.length} photo{photos.length > 1 ? "s" : ""} affichée
							{photos.length > 1 ? "s" : ""} — masque une photo pour la retirer du
							site sans la supprimer.
						</p>
					</div>

					<nav className="flex flex-wrap gap-2">
						{filters.map((filter) => (
							<Link
								key={filter.href}
								href={filter.href}
								className={cn(
									"border px-4 py-2 text-xs tracking-editorial transition-colors",
									filter.active
										? "border-accent/60 text-paper"
										: "border-line text-faint hover:text-muted",
								)}
							>
								{filter.label}
							</Link>
						))}
						{albums.map((item) => (
							<Link
								key={item.id}
								href={`/admin/photos?album=${item.id}`}
								className={cn(
									"border px-4 py-2 text-xs tracking-editorial transition-colors",
									album === item.id
										? "border-accent/60 text-paper"
										: "border-line text-faint hover:text-muted",
								)}
							>
								{item.title} ({item.photo_count})
							</Link>
						))}
					</nav>
				</div>

				<div className="mt-10">
					{photos.length === 0 ? (
						<p className="text-sm text-faint">
							Aucune photo ici. Lance{" "}
							<code className="text-accent">npm run import -- &lt;dossier&gt;</code>{" "}
							pour en ajouter.
						</p>
					) : (
						<PhotoManager
							photos={photos}
							albums={albums.map(({ id, title }) => ({ id, title }))}
						/>
					)}
				</div>
			</div>
		</>
	);
}

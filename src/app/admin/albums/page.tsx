import AdminNav from "@/components/admin/admin-nav";
import AlbumManager from "@/components/admin/album-manager";
import { getAdminAlbums, getAdminStats } from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminAlbumsPage() {
	await requireAdmin();
	const [albums, stats] = await Promise.all([getAdminAlbums(), getAdminStats()]);

	return (
		<>
			<AdminNav pendingCount={stats.pendingComments} />

			<div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
				<h1 className="font-display text-4xl">Albums</h1>
				<p className="mt-2 text-sm text-muted">
					Les albums sont créés automatiquement à l&apos;import. Tu peux les
					renommer, les décrire et les masquer.
				</p>

				<div className="mt-10">
					{albums.length === 0 ? (
						<p className="text-sm text-faint">Aucun album pour le moment.</p>
					) : (
						<AlbumManager albums={albums} />
					)}
				</div>
			</div>
		</>
	);
}

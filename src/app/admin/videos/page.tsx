import AdminNav from "@/components/admin/admin-nav";
import VideoManager from "@/components/admin/video-manager";
import { getAdminVideos, getPendingCommentsCount } from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
	await requireAdmin();
	const [videos, pendingCount] = await Promise.all([
		getAdminVideos(),
		getPendingCommentsCount(),
	]);

	return (
		<>
			<AdminNav pendingCount={pendingCount} />

			<div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
				<h1 className="font-display text-4xl">Vidéos</h1>
				<p className="mt-2 text-sm text-muted">
					Colle une URL YouTube ou un identifiant de 11 caractères.
				</p>

				<div className="mt-10">
					<VideoManager videos={videos} />
				</div>
			</div>
		</>
	);
}

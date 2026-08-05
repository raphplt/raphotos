import Link from "next/link";

import AdminNav from "@/components/admin/admin-nav";
import CommentModeration from "@/components/admin/comment-moderation";
import { getAdminComments, getPendingCommentsCount } from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { CommentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const FILTERS: { label: string; value: CommentStatus | "all" }[] = [
  { label: "En attente", value: "pending" },
  { label: "Approuvés", value: "approved" },
  { label: "Rejetés", value: "rejected" },
  { label: "Tous", value: "all" },
];

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  await requireAdmin();
  const { statut } = await searchParams;

  const active = (FILTERS.find((f) => f.value === statut)?.value ??
    "pending") as CommentStatus | "all";

  const [comments, pendingCount] = await Promise.all([
    getAdminComments(active === "all" ? undefined : active),
    getPendingCommentsCount(),
  ]);

  return (
    <>
      <AdminNav pendingCount={pendingCount} />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <h1 className="font-display text-4xl">Commentaires</h1>
        <p className="mt-2 text-sm text-muted">
          Un commentaire n&apos;apparaît sur le site qu&apos;une fois approuvé.
        </p>

        <nav className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={`/admin/commentaires?statut=${filter.value}`}
              className={cn(
                "border px-4 py-2 text-xs tracking-editorial transition-colors",
                active === filter.value
                  ? "border-accent/60 text-paper"
                  : "border-line text-faint hover:text-muted",
              )}
            >
              {filter.label}
              {filter.value === "pending" && pendingCount > 0 && (
                <span className="ml-2 tabular-nums text-accent">
                  {pendingCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-10">
          {comments.length === 0 ? (
            <p className="text-sm text-faint">
              Aucun commentaire dans cette vue.
            </p>
          ) : (
            <CommentModeration key={active} comments={comments} />
          )}
        </div>
      </div>
    </>
  );
}

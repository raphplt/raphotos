"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const LINKS = [
	{ href: "/admin", label: "Tableau de bord" },
	{ href: "/admin/photos", label: "Photos" },
	{ href: "/admin/albums", label: "Albums" },
	{ href: "/admin/commentaires", label: "Commentaires" },
	{ href: "/admin/videos", label: "Vidéos" },
];

export default function AdminNav({ pendingCount }: { pendingCount: number }) {
	const pathname = usePathname();
	const router = useRouter();

	async function signOut() {
		const supabase = createSupabaseBrowserClient();
		await supabase.auth.signOut();
		router.push("/admin/login");
		router.refresh();
	}

	return (
		<header className="sticky top-0 z-30 border-b border-line/70 bg-ink/90 backdrop-blur-xl">
			<div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4 sm:px-8">
				<span className="font-display text-lg">Raphotos</span>

				<nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
					{LINKS.map((link) => {
						const active =
							link.href === "/admin"
								? pathname === "/admin"
								: pathname.startsWith(link.href);
						return (
							<Link
								key={link.href}
								href={link.href}
								className={cn(
									"flex items-center gap-2 text-xs tracking-editorial transition-colors",
									active ? "text-paper" : "text-faint hover:text-muted",
								)}
							>
								{link.label}
								{link.href === "/admin/commentaires" && pendingCount > 0 && (
									<span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-ink">
										{pendingCount}
									</span>
								)}
							</Link>
						);
					})}
				</nav>

				<div className="ml-auto flex items-center gap-5">
					<Link
						href="/"
						target="_blank"
						className="flex items-center gap-1.5 text-xs text-faint transition-colors hover:text-muted"
					>
						Voir le site
						<ExternalLink size={12} />
					</Link>
					<button
						type="button"
						onClick={signOut}
						className="flex items-center gap-1.5 text-xs text-faint transition-colors hover:text-muted"
					>
						<LogOut size={12} />
						Déconnexion
					</button>
				</div>
			</div>
		</header>
	);
}

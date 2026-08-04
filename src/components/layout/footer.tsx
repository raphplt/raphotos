import Link from "next/link";

import InstagramIcon from "@/components/icons/instagram";

const YEAR = new Date().getFullYear();

export default function Footer() {
	return (
		<footer className="mt-32 border-t border-line/70">
			<div className="mx-auto max-w-[1600px] px-5 py-14 sm:px-10 sm:py-20">
				<div className="flex flex-col gap-12 sm:flex-row sm:justify-between">
					<div className="max-w-xs">
						<p className="font-display text-2xl">Raphotos</p>
						<p className="mt-3 text-sm leading-relaxed text-muted">
							Paysages, lumière et détails qu&apos;on ne regarde pas. Toutes les
							photos sont téléchargeables sous licence CC BY-NC.
						</p>
					</div>

					<nav className="flex gap-16">
						<div className="flex flex-col gap-3">
							<p className="text-[11px] tracking-editorial text-faint">Explorer</p>
							{[
								{ href: "/photos", label: "Photos" },
								{ href: "/videos", label: "Vidéos" },
								{ href: "/a-propos", label: "À propos" },
							].map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="text-sm text-muted transition-colors hover:text-paper"
								>
									{link.label}
								</Link>
							))}
						</div>

						<div className="flex flex-col gap-3">
							<p className="text-[11px] tracking-editorial text-faint">Informations</p>
							{[
								{ href: "/mentions-legales", label: "Mentions légales" },
								{ href: "/cookies", label: "Cookies" },
							].map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="text-sm text-muted transition-colors hover:text-paper"
								>
									{link.label}
								</Link>
							))}
							<a
								href="https://www.instagram.com/raph.otos/"
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-paper"
							>
								<InstagramIcon size={14} />
								Instagram
							</a>
						</div>
					</nav>
				</div>

				<p className="mt-14 text-xs text-faint">
					© {YEAR} Raphaël Plassart — Tous droits réservés
				</p>
			</div>
		</footer>
	);
}

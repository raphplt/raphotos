import type { Metadata } from "next";
import Link from "next/link";

import InstagramIcon from "@/components/icons/instagram";

export const metadata: Metadata = {
	title: "À propos",
	description:
		"Raphaël, photographe de paysages. Matériel, démarche et licence d'utilisation des photos.",
};

const GEAR = [
	"Sony Alpha 6000",
	"Sony 16-50 mm",
	"Sony 55-210 mm",
	"Trépied Essentiels",
];

const LINKS = [
	{ href: "https://www.raph-portfolio.fr", label: "Mon portfolio" },
	{ href: "https://pokelab-fr.vercel.app", label: "Pokélab" },
];

export default function AboutPage() {
	return (
		<div className="mx-auto max-w-[1600px] px-5 pb-24 pt-32 sm:px-10 sm:pt-44">
			<header className="max-w-2xl">
				<p className="text-[11px] tracking-editorial text-accent">Le photographe</p>
				<h1 className="mt-4 font-display text-5xl leading-tight text-balance sm:text-7xl">
					La poésie qui se cache dans les paysages
				</h1>
			</header>

			<div className="mt-20 flex flex-col gap-16 lg:flex-row lg:gap-24">
				<div className="max-w-xl flex-1 text-sm leading-relaxed text-muted">
					<p>
						Je m&apos;appelle Raphaël et je photographie depuis plusieurs années,
						principalement des paysages — avec quelques incursions du côté du
						portrait et d&apos;autres styles.
					</p>
					<p className="mt-5">
						À travers mes clichés, j&apos;essaie de mettre en valeur la poésie
						qui se cache dans les paysages et les détails qu&apos;on ne regarde
						pas.
					</p>
					<p className="mt-5">
						Toutes les photos sont téléchargeables et utilisables sous licence{" "}
						<a
							href="https://creativecommons.org/licenses/by-nc/4.0/deed.fr"
							target="_blank"
							rel="noreferrer"
							className="text-paper underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
						>
							CC BY-NC
						</a>{" "}
						— usage non commercial, avec attribution.
					</p>
					<p className="mt-5">
						Un bug à signaler ou envie de parler photo ? Écris-moi sur Instagram.
					</p>

					<a
						href="https://www.instagram.com/raph.otos/"
						target="_blank"
						rel="noreferrer"
						className="mt-8 inline-flex items-center gap-2 border border-line px-5 py-2.5 text-xs tracking-editorial text-paper transition-colors hover:border-accent/60"
					>
						<InstagramIcon size={15} />
						raph.otos
					</a>
				</div>

				<aside className="lg:w-64 lg:shrink-0">
					<h2 className="text-[11px] tracking-editorial text-faint">Matériel</h2>
					<ul className="mt-5 flex flex-col gap-2.5 border-t border-line/60 pt-5">
						{GEAR.map((item) => (
							<li key={item} className="text-xs text-muted">
								{item}
							</li>
						))}
					</ul>

					<h2 className="mt-12 text-[11px] tracking-editorial text-faint">
						Ailleurs
					</h2>
					<ul className="mt-5 flex flex-col gap-2.5 border-t border-line/60 pt-5">
						{LINKS.map((link) => (
							<li key={link.href}>
								<a
									href={link.href}
									target="_blank"
									rel="noreferrer"
									className="text-xs text-muted transition-colors hover:text-paper"
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>
				</aside>
			</div>

			<p className="mt-24 text-xs text-faint">
				Site en version 3.0 —{" "}
				<Link
					href="/mentions-legales"
					className="transition-colors hover:text-muted"
				>
					mentions légales
				</Link>
			</p>
		</div>
	);
}

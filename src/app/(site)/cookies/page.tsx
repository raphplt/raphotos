import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Cookies",
	robots: { index: false, follow: true },
};

const COOKIES = [
	{
		name: "raphotos_visitor",
		purpose:
			"Identifiant anonyme permettant de ne compter qu'une fois le même « j'aime » depuis un navigateur donné. Ne contient aucune donnée personnelle.",
		duration: "12 mois",
		type: "Strictement nécessaire au fonctionnement",
	},
	{
		name: "raphotos:likes (stockage local)",
		purpose:
			"Mémorise, dans votre navigateur uniquement, les photos que vous avez aimées afin d'afficher le cœur en surbrillance. Cette information ne quitte jamais votre appareil.",
		duration: "Jusqu'à effacement du navigateur",
		type: "Confort d'affichage",
	},
	{
		name: "Vercel Analytics",
		purpose:
			"Mesure d'audience agrégée et anonyme (pages vues, performances). Ne dépose pas de cookie publicitaire et ne permet pas de vous identifier.",
		duration: "Aucun cookie déposé",
		type: "Mesure d'audience",
	},
];

export default function CookiesPage() {
	return (
		<div className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-10 sm:pt-44">
			<h1 className="font-display text-5xl leading-tight sm:text-6xl">Cookies</h1>

			<p className="mt-8 text-sm leading-relaxed text-muted">
				Ce site n&apos;utilise ni cookie publicitaire, ni traceur tiers, ni outil
				de profilage. Aucun bandeau de consentement n&apos;est donc nécessaire :
				les seuls éléments déposés sont indispensables au fonctionnement des
				fonctionnalités que vous utilisez.
			</p>

			<div className="mt-16 flex flex-col gap-10">
				{COOKIES.map((cookie) => (
					<section key={cookie.name} className="border-t border-line/60 pt-5">
						<h2 className="font-mono text-sm text-paper">{cookie.name}</h2>
						<p className="mt-3 text-sm leading-relaxed text-muted">
							{cookie.purpose}
						</p>
						<dl className="mt-4 flex flex-wrap gap-x-10 gap-y-2">
							<div className="flex gap-2">
								<dt className="text-xs text-faint">Durée</dt>
								<dd className="text-xs text-muted">{cookie.duration}</dd>
							</div>
							<div className="flex gap-2">
								<dt className="text-xs text-faint">Finalité</dt>
								<dd className="text-xs text-muted">{cookie.type}</dd>
							</div>
						</dl>
					</section>
				))}
			</div>

			<p className="mt-16 text-sm text-muted">
				Vous pouvez supprimer ces éléments à tout moment depuis les réglages de
				votre navigateur. Pour en savoir plus sur le traitement des données,
				consultez les{" "}
				<Link
					href="/mentions-legales"
					className="text-paper underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
				>
					mentions légales
				</Link>
				.
			</p>
		</div>
	);
}

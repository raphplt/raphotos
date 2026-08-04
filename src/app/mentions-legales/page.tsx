import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Mentions légales",
	robots: { index: false, follow: true },
};

const SECTIONS = [
	{
		title: "Éditeur du site",
		body: [
			"Le site raphotos est édité à titre personnel et non commercial par Raphaël Plassart.",
			"Contact : via le compte Instagram @raph.otos.",
		],
	},
	{
		title: "Hébergement",
		body: [
			"Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.",
			"Les images sont distribuées via Cloudflare R2 (Cloudflare, Inc.), et les données du site sont stockées par Supabase.",
		],
	},
	{
		title: "Propriété intellectuelle",
		body: [
			"L'ensemble des photographies présentées sur ce site sont l'œuvre de Raphaël Plassart.",
			"Elles sont mises à disposition sous licence Creative Commons BY-NC 4.0 : leur réutilisation est autorisée à des fins non commerciales, sous réserve de citer l'auteur. Toute exploitation commerciale nécessite une autorisation écrite préalable.",
		],
	},
	{
		title: "Données personnelles",
		body: [
			"Ce site ne demande la création d'aucun compte et ne collecte aucune donnée nominative de navigation.",
			"Lorsque vous aimez une photo, un identifiant anonyme (un nombre aléatoire, sans lien avec votre identité) est déposé dans un cookie afin d'éviter qu'un même navigateur soit compté plusieurs fois.",
			"Lorsque vous déposez un commentaire, seuls le pseudonyme et le message que vous saisissez sont conservés, accompagnés d'une empreinte chiffrée et non réversible de votre adresse IP, utilisée uniquement pour limiter les abus. L'adresse IP elle-même n'est jamais enregistrée.",
			"Les commentaires sont relus avant publication. Vous pouvez demander la suppression d'un commentaire ou d'un « j'aime » à tout moment via Instagram.",
			"Les mesures d'audience (Vercel Analytics) sont anonymes et ne reposent sur aucun cookie publicitaire.",
		],
	},
	{
		title: "Responsabilité",
		body: [
			"L'éditeur s'efforce d'assurer l'exactitude des informations diffusées, sans pouvoir en garantir l'exhaustivité. Sa responsabilité ne saurait être engagée en cas d'indisponibilité temporaire du site.",
		],
	},
];

export default function LegalPage() {
	return (
		<div className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-10 sm:pt-44">
			<h1 className="font-display text-5xl leading-tight sm:text-6xl">
				Mentions légales
			</h1>

			<div className="mt-16 flex flex-col gap-12">
				{SECTIONS.map((section) => (
					<section key={section.title}>
						<h2 className="text-[11px] tracking-editorial text-accent">
							{section.title}
						</h2>
						<div className="mt-4 flex flex-col gap-3 border-t border-line/60 pt-4">
							{section.body.map((paragraph) => (
								<p
									key={paragraph.slice(0, 40)}
									className="text-sm leading-relaxed text-muted"
								>
									{paragraph}
								</p>
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}

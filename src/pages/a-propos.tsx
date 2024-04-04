import Footer from "@/components/footer";
import Header from "@/components/header";
import Metadata from "@/components/metadata";
import Image from "next/image";

export default function APropos() {
  return (
			<div>
				<Metadata title="A propos" description="A propos de Raphotos" />
				<Header />
				<div className="mt-24 mb-12">
					<h1 className="mt-28 text-2xl text-center bg-black text-white w-fit mx-auto px-24 py-1">
						A propos
					</h1>
					<p className="w-2/3 sm:w-[30%] mx-auto mt-16 text-justify">
						Bienvenue sur mon site web dédié à la photographie ! Je m&apos;appelle
						Raphaël, j&apos;ai 19 ans et je suis un passioné de photos depuis
						plusieurs années. Je photographie principalement des paysages, mais je
						m&apos;essaie aussi aux portraits oo à d&apos;autres styles de
						photographies.
						<Image
							src={"/assets/others/moi.jpg"}
							alt="Moi"
							width={1000}
							height={700}
							className="w-2/3 mx-auto py-5"
						/>
						<br />A travers mes clichés, j&apos;essaie de mettre en valeur la poésie
						qui se cache dans les paysages et les détails qu&apos;on ne regarde pas.
						<br />
						<br />
						Mon matériel actuel:
						<br />- Sony Alpha 6000
						<br />- Objectif Sony 16-50mm
						<br />- Objectif Sony 55-210mm
						<br />- Trépied Boulanger Essentiels
						<br />
						<br />
						Toutes les photos sont téléchargables et utilisables sous la licence CC by
						NC (pas d&apos;utilisation commerciale).
						<br />
						<br />
						Le site en est actuellement à sa version 2.1, en date du 04/04/2024. Si
						vous remarquez un bug (hors ralentissement), ou que vous souhaitez
						discuter de photo, vous pouvez me contacter sur mon instagram dédié:{" "}
						<a href="https://www.instagram.com/raph.otos/" target="_blank">
							raph.otos.
						</a>
						<br />
						<br />
						Merci beaucoup d&apos;être passé !
						<br />
						<br />
						Mes autres sites internet :
						<br />
						<br />
						<div className="flex flex-col gap-5 mx-auto">
							<a
								href="https://www.raph-portfolio.fr"
								target="_blank"
								rel="noreferrer"
								className="bg-slate-300 px-5 py-2 drop-shadow-md text-center  hover:bg-slate-400"
							>
								Mon portfolio
							</a>
							<a
								href="https://pokelab-fr.vercel.app"
								target="_blank"
								rel="noreferrer"
								className="bg-slate-300 px-5 py-2 drop-shadow-md text-center hover:bg-slate-400"
							>
								Pokélab
							</a>
						</div>
					</p>
				</div>
				<Footer />
			</div>
		);
}

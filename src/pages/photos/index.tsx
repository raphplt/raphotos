/* eslint-disable @next/next/no-img-element */
import Header from "@/components/header";
import Metadata from "@/components/metadata";
import path from "path";
import fs from "fs/promises";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/footer";

export default function Decouvrir({ imagePaths }: any) {
	return (
		<div>
			<Metadata title="Photos" description="Découvrez mes photos" />
			<Header />
			<div className="sm:w-10/12 w-full mx-auto mb-24">
				<h1 className="mt-28 text-2xl text-center bg-black text-white w-fit mx-auto px-24 py-1">
					Photos
				</h1>
				<h2 className="text-center mt-4  w-3/4 mx-auto">
					Retrouvez ici toutes mes photos, triées dans des dossiers saisonniers.
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-8 mx-auto">
					{imagePaths.map((imagePath: any, index: any) => {
						const lastSubfolder = path.basename(path.dirname(imagePath));
						return (
							<div key={index} className="group sm:w-full w-4/5 mx-auto">
								<div className="folder">
									<div className="rectangle-left" />
									<div className="triangle">
										<div className="triangle-left" />
										<div className="triangle-right" />
									</div>
									<div className="rectangle-right" />
								</div>
								<Link
									href={`/photos/${lastSubfolder}`}
									className="relative group/item flex flex-col justify-center drop-shadow-md mb-1 border-[1px] border-black rounded-lg bg-[#e9d14c] overflow-hidden"
								>
									<span className="my-1 font-semibold ml-6 group-hover/item:font-semibold">
										{lastSubfolder}
									</span>
									<div className="bg-slate-600">
										<Image
											src={imagePath}
											alt={`Image ${index}`}
											className="group/img  sm:w-[30vw] hover:opacity-70 transition-opacity duration-200"
											width={1080}
											height={720}
											// placeholder="blur"
										/>
									</div>
								</Link>
							</div>
						);
					})}
				</div>
			</div>
			<Footer />
			<style jsx>{`
				.folder {
					display: flex;
					align-items: flex-end; /* Coller les formes au bas du dossier */
				}

				.rectangle-left {
					width: 100px; /* Largeur du rectangle tout à gauche */
					height: 35px; /* Hauteur du rectangle tout à gauche */
					background-color: #a3922e; /* Couleur du rectangle tout à gauche */
					position: relative;
					left: 5px; /* Ajustement pour le positionnement */
					border-radius: 5px 0 0 0; /* Arrondir le coin en haut à gauche */
				}

				.triangle {
					width: 0;
					height: 40px; /* Hauteur du triangle, correspondant au rectangle de gauche */
					border-left: 20px solid transparent; /* Largeur du triangle */
					border-right: 0;
					border-top: 50px solid transparent; /* Hauteur du triangle */
					border-bottom: 50px solid transparent;
					position: relative;
					left: 5px; /* Ajustement pour le positionnement */
				}

				.triangle-left {
					width: 0;
					height: 40px; /* Hauteur du triangle, correspondant au rectangle de gauche */
					border-left: 20px solid #a3922e; /* Couleur du triangle */
					border-right: 0;
					border-top: 50px solid transparent;
					border-bottom: 50px solid transparent;
					position: absolute;
					left: -20px; /* Ajustement pour le positionnement */
					top: 15px; /* Coller le triangle au haut du dossier */
				}

				.triangle-right {
					width: 0;
					height: 40px; /* Hauteur du triangle, correspondant au rectangle de gauche */
					border-left: 20px solid transparent;
					border-right: 0;
					border-top: 50px solid transparent;
					border-bottom: 50px solid transparent;
					position: absolute;
					left: 0;
					top: 0; /* Coller le triangle au haut du dossier */
				}

				.rectangle-right {
					flex-grow: 1; /* Prend toute la place disponible */
					height: 20px; /* Hauteur du rectangle tout à droite */
					background-color: #a3922e; /* Couleur du rectangle tout à droite */
					position: relative; /* Permet au rectangle de droite de déborder sur le triangle */
					z-index: -1; /* Assure que le rectangle de droite est derrière le triangle */
					right: 20px; /* Ajustement pour le positionnement */
					border-radius: 0 5px 0 0; /* Arrondir le coin en haut à droite */
				}
			`}</style>
		</div>
	);
}

export async function getStaticProps() {
	const picturesDirectory = path.join(process.cwd(), "public/assets/pictures");
	const subdirectories = await fs.readdir(picturesDirectory);

	const imagePaths = [];
	const extractSeasonAndYear = (folderName: string) => {
		const [season, year] = folderName.split("_");
		return {
			season,
			year: parseInt(year),
		};
	};

	const sortSeasonAndYear = (a: any, b: any) => {
		const { season: seasonA, year: yearA } = extractSeasonAndYear(a);
		const { season: seasonB, year: yearB } = extractSeasonAndYear(b);

		if (yearA > yearB) {
			return -1;
		} else if (yearA < yearB) {
			return 1;
		} else {
			const seasonOrder = ["Spring", "Summer", "Fall", "Winter"];
			return seasonOrder.indexOf(seasonB) - seasonOrder.indexOf(seasonA);
		}
	};

	subdirectories.sort(sortSeasonAndYear);

	for (const subdirectory of subdirectories) {
		if (subdirectory !== "FirstPage") {
			const subdirectoryPath = path.join(picturesDirectory, subdirectory);
			const subdirectoryContents = await fs.readdir(subdirectoryPath);

			const imageFilename = subdirectoryContents.find((filename) => {
				const extension = path.extname(filename).toLowerCase();
				return (
					extension === ".jpg" ||
					extension === ".jpeg" ||
					extension === ".png" ||
					extension === ".gif" ||
					extension === ".webp"
				);
			});

			if (imageFilename) {
				const imagePath = `/assets/pictures/${subdirectory}/${imageFilename}`;
				imagePaths.push(imagePath);
			}
		}
	}

	return {
		props: {
			imagePaths,
		},
	};
}

/* eslint-disable @next/next/no-img-element */
import Header from "@/components/header";
import Metadata from "@/components/metadata";
import path from "path";
import fs from "fs/promises";
import Image from "next/image";
import {
  faArrowLeft,
  faDownload,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "@/components/footer";
import { useInView } from "react-intersection-observer";

export default function Decouvrir({ directoryName, imagePaths }: any) {
	const [selectedImage, setSelectedImage] = useState(null);
	const [hoveredImage, setHoveredImage] = useState(null);
	const [shouldHideArrow, setShouldHideArrow] = useState(true);
	const [showMore, setShowMore] = useState(9);
	const [showImages, setShowImages] = useState(false);
	const [imageLoaded, setImageLoaded] = useState<boolean[]>([]);

	const openImage = (imagePath: any) => {
		setSelectedImage(imagePath);
	};

	const closeImage = () => {
		setSelectedImage(null);
	};

	const handleImageHover = (imagePath: any) => {
		setHoveredImage(imagePath);
	};

	const handleImageHoverExit = () => {
		setHoveredImage(null);
	};

	const handleScroll = () => {
		if (window.scrollY > 0) {
			setShouldHideArrow(false);
		} else {
			setShouldHideArrow(true);
		}
	};

	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const handleImageClick = (
		event: React.MouseEvent<HTMLImageElement>,
		imagePath: any
	) => {
		event.stopPropagation();
		openImage(imagePath);
	};

	const [ref, inView] = useInView({
		triggerOnce: true,
		threshold: 0.3,
	});

	useEffect(() => {
		if (inView) {
			setShowImages(true);
		}
	}, [inView]);
	return (
		<div>
			<Metadata
				title={directoryName}
				description={`Découvrez les photos issues de ${directoryName}.`}
			/>
			<Header />
			<a
				className={`py-3 px-3 w-10 bg-emerald-200 rounded-full z-20 h-10 fixed bottom-6 hover:bg-emerald-300 right-6 flex items-center justify-center ${
					shouldHideArrow ? "hidden" : ""
				}`}
				href="#top"
			>
				<FontAwesomeIcon icon={faArrowUp} className="w-4" />
			</a>
			<div className="w-11/12 sm:w-10/12 mx-auto mt-14 mb-24">
				<Link href={"/photos"} className="w-fit">
					<FontAwesomeIcon className="w-4 pt-6" icon={faArrowLeft} />
				</Link>
				<div className="mb-10">
					<h1 className="text-lg mt-4 sm:text-2xl text-center bg-black text-white w-fit mx-auto px-24 py-1">
						{directoryName}
					</h1>
					<p className="text-center mt-2 text-lg">{imagePaths.length} photos</p>
				</div>
				<div
					className={`grid grid-cols-1 sm:grid-cols-3 gap-5 mx-auto ${
						directoryName == "Wallpapers" && "w-4/5"
					}`}
				>
					{imagePaths.slice(0, showMore).map((imagePath: any, index: any) => (
						<div
							key={index}
							ref={ref}
							className="flex justify-center items-center flex-col relative overflow-hidden max-w-full "
							onMouseEnter={() => handleImageHover(imagePath)}
							onMouseLeave={handleImageHoverExit}
						>
							<button
								onClick={(event) => handleImageClick(event as any, imagePath)}
								className={`w-full  relative ${
									imageLoaded[index]
										? "animate-none"
										: "animate-pulse h-2/3 bg-slate-600"
								}`}
							>
								{hoveredImage === imagePath && (
									<a
										href={imagePath}
										download=""
										className="absolute top-0 right-0 p-2 bg-white bg-opacity-70 z-10"
									>
										<FontAwesomeIcon icon={faDownload} className="w-4" />
									</a>
								)}

								<Image
									src={imagePath}
									alt={`Image ${index}`}
									className="w-full h-full object-cover zoomed-image transition-transform transform hover:scale-110"
									width={1000}
									height={1000}
									placeholder="empty"
									onLoad={() => {
										setImageLoaded((prev) => {
											const newLoaded = [...prev];
											newLoaded[index] = true;
											return newLoaded;
										});
									}}
								/>
							</button>
						</div>
					))}
				</div>
				{showMore < imagePaths.length && (
					<button
						className="group relative px-4 py-2 overflow-hidden rounded-lg bg-white text-md shadow mx-auto flex items-center mt-10 border-[1px] border-[#1F2937]"
						onClick={() => setShowMore(showMore + 9)}
					>
						<div className="absolute inset-0 w-3 bg-[#1F2937] transition-all duration-[250ms] ease-out group-hover:w-full"></div>
						<span className="relative text-[#1F2937] group-hover:text-white">
							Voir plus d&apos;images
						</span>
					</button>
				)}
				<style jsx>
					{`
						.zoomed-image {
							transform-origin: center;
							transition: transform 0.2s ease-in-out;
						}

						.zoomed-image:hover {
							transform: scale(1.1);
						}
					`}
				</style>
			</div>
			{selectedImage && directoryName !== "Wallpapers" && (
				<div
					onClick={closeImage}
					className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center"
				>
					COUCOU
					<Image
						src={selectedImage}
						alt="Selected Image"
						width={1000}
						height={1000}
						className="w-[100vw] sm:w-[75vw]"
					/>
				</div>
			)}
			<Footer />
		</div>
	);
}

export async function getStaticPaths() {
	const picturesDirectory = path.join(process.cwd(), "public/assets/pictures");
	const subdirectories = await fs.readdir(picturesDirectory);

	const paths = subdirectories.map((subdirectory) => ({
		params: { pid: subdirectory },
	}));

	return {
		paths,
		fallback: false,
	};
}

export async function getStaticProps({ params }: any) {
	const { pid } = params;

	const picturesDirectory = path.join(
		process.cwd(),
		"public/assets/pictures",
		pid
	);
	const contents = await fs.readdir(picturesDirectory);

	const imagePaths = contents
		.filter((filename: any) => {
			const extension = path.extname(filename).toLowerCase();
			return [".jpg", ".jpeg", ".png", ".webp"].includes(extension);
		})
		.map((filename: any) => `/assets/pictures/${pid}/${filename}`);

	return {
		props: {
			directoryName: pid,
			imagePaths,
		},
	};
}

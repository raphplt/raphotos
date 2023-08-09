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

export default function Decouvrir({ directoryName, imagePaths }: any) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [shouldHideArrow, setShouldHideArrow] = useState(true);

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
  return (
    <div>
      <Metadata />
      <Header />
      <a
        className={`py-3 px-3 bg-emerald-200 rounded-full w-10 h-10 fixed bottom-2 right-2 flex items-center justify-center ${
          shouldHideArrow ? "hidden" : ""
        }`}
        href="#top"
      >
        <FontAwesomeIcon icon={faArrowUp} className="w-4" />
      </a>
      <div className="w-10/12 mx-auto mt-12 mb-24">
        <Link href={"/decouvrir"}>
          <FontAwesomeIcon className="w-4 pt-6" icon={faArrowLeft} />
        </Link>
        <h1 className="mb-12 text-2xl text-center">
          ---- {directoryName} ----
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mx-auto">
          {imagePaths.map((imagePath: any, index: any) => (
            <div
              key={index}
              className="flex justify-center items-center flex-col relative overflow-hidden max-w-full"
              onMouseEnter={() => handleImageHover(imagePath)}
              onMouseLeave={handleImageHoverExit}
            >
              <button
                onClick={(event) => handleImageClick(event as any, imagePath)}
              >
                <Image
                  src={imagePath}
                  alt={`Image ${index}`}
                  className="w-full h-full object-cover zoomed-image transition-transform transform hover:scale-110"
                  width={1000}
                  height={1000}
                />
                {hoveredImage === imagePath && (
                  <a
                    href={imagePath}
                    download=""
                    className="absolute top-0 right-0 p-2 bg-white bg-opacity-70"
                  >
                    <FontAwesomeIcon icon={faDownload} className="w-4" />
                  </a>
                )}
              </button>
            </div>
          ))}
        </div>
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
      {selectedImage && (
        <div
          onClick={closeImage}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center"
        >
          <Image
            src={selectedImage}
            alt="Selected Image"
            width={1000}
            height={1000}
            className="w-[100vw] sm:w-[75vw]"
          />
        </div>
      )}
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
      return [".jpg", ".jpeg", ".png", ".gif"].includes(extension);
    })
    .map((filename: any) => `/assets/pictures/${pid}/${filename}`);

  return {
    props: {
      directoryName: pid,
      imagePaths,
    },
  };
}

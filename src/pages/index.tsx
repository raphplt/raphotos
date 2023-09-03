/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import Header from "@/components/header";
import Metadata from "@/components/metadata";
import fs from "fs";
import path from "path";
import { useEffect, useState } from "react";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Footer from "@/components/footer";
import Card from "@/components/card";

export default function Slider({ imagePaths }: any) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(imagePaths.length - 1);
  const [nextImageIndex, setNextImageIndex] = useState(1);

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imagePaths.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === imagePaths.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    setPrevImageIndex(
      currentImageIndex === 0 ? imagePaths.length - 1 : currentImageIndex - 1
    );
    setNextImageIndex(
      currentImageIndex === imagePaths.length - 1 ? 0 : currentImageIndex + 1
    );

    const interval = setInterval(goToNextImage, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [currentImageIndex, imagePaths.length]);

  return (
    <div>
      <Metadata />
      <Header />

      <div className="flex justify-center items-center mt-20 mb-16">
        <button onClick={goToPreviousImage} className="w-64 h-64 mr-2 sm:mr-12">
          <img
            src={imagePaths[prevImageIndex]}
            alt={`Image ${prevImageIndex}`}
            className="rounded-md border-[1px] border-gray-500 drop-shadow-md"
          />
        </button>
        <div className="flex">
          {imagePaths.map((imagePath: any, index: any) => (
            <div
              key={index}
              className={`w-[40vw] mx-2 mt-8 transition-opacity duration-400 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              <div>
                <span className="">
                  {imagePath.split("/").pop().split(".").slice(0, -1).join(".")}
                </span>
                <img
                  src={imagePath}
                  alt={`Image ${index}`}
                  className="rounded-md border-[1px] border-gray-500 drop-shadow-md"
                />
              </div>
            </div>
          ))}
        </div>
        <button onClick={goToNextImage} className="w-64 h-64 ml-2 sm:ml-12">
          <img
            src={imagePaths[nextImageIndex]}
            alt={`Image ${nextImageIndex}`}
            className="rounded-md border-[1px] border-gray-500 drop-shadow-md"
          />
        </button>
      </div>
      <div className="bg-slate-300 pb-48 ">
        <h2 className="text-xl text-center pb-8 pt-10 font-semibold">
          Découvrir mon travail :
        </h2>
        <div className="flex w-2/3 gap-12 mx-auto justify-evenly">
          <Card
            title="Mes dernières photos"
            href={"/photos"}
            img="/assets/pictures/Summer_2023/DSC05825-min.jpg"
          />
          <Card
            title="Mes dernières vidéos"
            href={"/videos"}
            img="/assets/pictures/Summer_2023/DSC06232.jpg"
          />
          <Card
            title="A propos de moi"
            href={"/a-propos"}
            img="/assets/others/moi.jpg"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  const imageDirectory = path.join(
    process.cwd(),
    "public/assets/pictures/FirstPage"
  );
  const filenames = fs.readdirSync(imageDirectory);
  const imagePaths = filenames.map(
    (filename) => `/assets/pictures/FirstPage/${filename}`
  );

  return {
    props: {
      imagePaths,
    },
  };
}

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import Header from "@/components/header";
import Metadata from "@/components/metadata";
import fs from "fs";
import path from "path";
import { useEffect, useState } from "react";
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
        <button
          onClick={goToPreviousImage}
          className="w-64 h-64 mr-2 sm:mr-12 hidden sm:block"
        >
          <img
            src={imagePaths[prevImageIndex]}
            alt={`Image ${prevImageIndex}`}
            className="rounded-md border-[1px] border-gray-500 drop-shadow-md"
          />
        </button>
        <div className="flex justify-center sm:justify-normal mx-auto sm:mx-0">
          {imagePaths.map((imagePath: any, index: any) => (
            <div
              key={index}
              className={`w-10/12  flex-col flex sm:gap-0 gap-2 sm:w-[40vw] mx-2 mt-8 transition-opacity duration-400 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              <h2>
                {imagePath.split("/").pop().split(".").slice(0, -1).join(".")}
              </h2>
              <img
                src={imagePath}
                alt={`Image ${index}`}
                className="rounded-md border-[1px] border-gray-500 drop-shadow-md"
              />
            </div>
          ))}
        </div>
        <button
          onClick={goToNextImage}
          className="w-64 h-64 ml-2 sm:ml-12 hidden sm:block"
        >
          <img
            src={imagePaths[nextImageIndex]}
            alt={`Image ${nextImageIndex}`}
            className="rounded-md border-[1px] border-gray-500 drop-shadow-md"
          />
        </button>
      </div>
      <div className="bg-slate-300 sm:pb-32 pb-24">
        <h2 className="text-xl w-3/5 mx-auto pb-10 pt-8 font-semibold">
          Découvrir mon travail :
        </h2>
        <div className="flex w-4/5 sm:w-2/3 gap-5 mx-auto justify-evenly items-center flex-col sm:flex-row">
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

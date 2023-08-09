/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import Header from "@/components/header";
import Metadata from "@/components/metadata";
import fs from "fs";
import path from "path";
import Image from "next/image";
import { useEffect, useState } from "react";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Footer from "@/components/footer";

export default function Slider({ imagePaths }: any) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    const interval = setInterval(goToNextImage, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <Metadata />
      <Header />
      <div className="flex justify-center items-center mt-8 mb-24">
        <button onClick={goToPreviousImage} className="w-6 h-6 mr-2 sm:mr-12">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className="flex">
          {imagePaths.map((imagePath: any, index: any) => (
            <div
              key={index}
              className={`w-[65vw] mx-2 mt-8 transition-opacity duration-400 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              <div>
                <span>
                  {imagePath.split("/").pop().split(".").slice(0, -1).join(".")}
                </span>
                <img
                  src={imagePath}
                  alt={`Image ${index}`}
                  className="w-full h-full"
                />
              </div>
            </div>
          ))}
        </div>
        <button onClick={goToNextImage} className="w-6 h-6 ml-2 sm:ml-12">
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
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

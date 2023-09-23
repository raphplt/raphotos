/* eslint-disable @next/next/no-img-element */
import Footer from "@/components/footer";
import Header from "@/components/header";
import Metadata from "@/components/metadata";
import Image from "next/image";
import bg from "/public/assets/others/wood.jpg";
import button from "/public/assets/others/button.png";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function Decouvrir() {
  const [url, setUrl] = useState("https://www.youtube.com/embed/7LYEla1TJic");
  const urls = [
    { url: "https://www.youtube.com/embed/7LYEla1TJic", id: 1 },
    { url: "https://www.youtube.com/embed/5h3zQvttngM", id: 2 },
  ];

  const updateURL = (url: string, bool: number) => {
    const index = urls.findIndex((item) => item.url === url);
    if (index === 0 && bool === -1) {
      setUrl(urls[urls.length - 1].url);
    } else if (index === urls.length - 1 && bool === 1) {
      setUrl(urls[0].url);
    } else {
      setUrl(urls[index + bool].url);
    }
  };

  return (
    <div className="h-[100vh]">
      <Metadata />
      <Header />
      <h1 className="mt-28 text-2xl text-center  bg-black text-white w-fit mx-auto px-24 py-1">
        Vidéos
      </h1>
      <div
        className="rounded-2xl w-[55%] h-[65%] mx-auto mt-20 mb-20 flex items-center justify-center"
        style={{
          backgroundImage: `url(${bg.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-gray-900 w-[95%] h-[94%] flex items-center justify-center gap-5 rounded-xl">
          <div className="bg-gray-300 w-[72%] h-[93%] rounded-lg flex  items-center justify-center">
            <iframe
              width="560"
              height="315"
              src={url}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="old-tv-screen"
            ></iframe>
          </div>
          <div className="bg-gray-300 w-[21%] h-[93%] rounded-lg flex items-center justify-center flex-col gap-16">
            <img src={button.src} alt="button" className="w-fit" />
            <img src={button.src} alt="button" className="w-fit" />
            <div className="flex gap-4 w-fit justify-center mx-auto sm:w-full">
              <button
                className="rounded-xl drop-shadow-sm bg-slate-400 py-2 px-3 hover:bg-slate-500"
                onClick={() => updateURL(url, 1)}
              >
                <div
                  className="w-0 h-0 
                  border-t-[37px] border-t-transparent
                  border-r-[56px] border-r-gray-900
                  border-b-[37px] border-b-transparent"
                ></div>
              </button>
              <button
                className="rounded-xl drop-shadow-sm bg-slate-400 py-2 px-3 hover:bg-slate-500"
                onClick={() => updateURL(url, -1)}
              >
                <div
                  className="w-0 h-0 
                  border-t-[37px] border-t-transparent
                  border-l-[56px] border-l-gray-900
                  border-b-[37px] border-b-transparent"
                ></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <style jsx>
        {`
        .old-tv-screen {
    -webkit-box-sizing: content-box;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
    width: 90%;
    height: 90%;
    position: relative;
    margin: 0;
    border: none;
    -webkit-border-radius: 50% / 10%;
    border-radius: 50% / 10%;
    font: normal 100%/normal Arial, Helvetica, sans-serif;
    color: white;
    text-align: center;
    text-indent: 0.1em;
    -o-text-overflow: clip;
    text-overflow: clip;
    background: #fff;
    border-top: 3px solid #CDCDCD;
    border-bottom: 3px solid #CDCDCD;
   }

.old-tv-screen::before {
    -webkit-box-sizing: content-box;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
    position: absolute;
    content: "";
    top: 10%;
    right: -5%;
    bottom: 10%;
    left: -5%;
    border-left: 3px solid #CDCDCD;
    border-right: 3px solid #CDCDCD;
    -webkit-border-radius: 5% / 50%;
    border-radius: 5% / 50%;
    font: normal 100%/normal Arial, Helvetica, sans-serif;
    color: rgba(0,0,0,1);
    -o-text-overflow: clip;
    text-overflow: clip;
    background: #fff;
    text-shadow: none;

 `}
      </style>
    </div>
  );
}

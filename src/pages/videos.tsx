import Footer from "@/components/footer";
import Header from "@/components/header";
import Metadata from "@/components/metadata";

export default function Decouvrir() {
  return (
    <div>
      <Metadata />
      <Header />
      <h1 className="mt-28 text-2xl text-center bg-black text-white w-fit mx-auto px-24 py-1">
        Vidéos
      </h1>
      <div className=" mt-12 w-fit mx-auto flex flex-col justify-center items-center gap-16 bg-gray-800 py-12 px-96 rounded-lg mb-16 drop-shadow-md">
        <div className="border-[1px] border-gray-600 py-6 rounded-lg px-10 bg-slate-200">
          <h2 className="mb-5 font-semibold text-center">
            Ma dernière vidéo :
          </h2>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/7LYEla1TJic"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        <div className="border-[1px] border-gray-600 py-6 rounded-lg px-10 bg-slate-200">
          <h2 className="mb-5 font-semibold text-center">
            Mon voyage au Québec :
          </h2>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/5h3zQvttngM"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <Footer />
    </div>
  );
}

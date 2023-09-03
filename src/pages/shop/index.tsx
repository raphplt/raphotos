import Header from "@/components/header";
import Metadata from "@/components/metadata";

export default function Decouvrir() {
  return (
    <div>
      <Metadata />
      <Header />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mx-auto mt-24 ">
        <div className="bg-slate-500 w-96 h-64"></div>
        <div className="bg-slate-500 w-96 h-64"></div>
        <div className="bg-slate-500 w-96 h-64"></div>
        <div className="bg-slate-500 w-96 h-64"></div>
        <div className="bg-slate-500 w-96 h-64"></div>
        <div className="bg-slate-500 w-96 h-64"></div>
        <div className="bg-slate-500 w-96 h-64"></div>
        <div className="bg-slate-500 w-96 h-64"></div>
        <div className="bg-slate-500 w-96 h-64²"></div>
      </div>
    </div>
  );
}

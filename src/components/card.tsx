import Image from "next/image";
import Link from "next/link";

export default function Card(props: any) {
  return (
    <div className="rounded-lg bg-gray-200 px-8 py-4 drop-shadow-md border-[1px] border-gray-500">
      <Link href={props.href}>
        <h1 className="text-gray-900 mb-2 g">
          {props.title} {">"}
        </h1>

        <Image
          src={props.img}
          width={350}
          height={350}
          alt="image"
          className="rounded-md"
        />
      </Link>
    </div>
  );
}

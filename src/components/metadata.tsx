import Head from "next/head";

interface MetadataProps {
	title: string;
	description: string;
}

export default function Metadata({ title, description }: MetadataProps) {
	return (
		<Head>
			<title>Raphotos | {title}</title>
			<meta name="description" content={description || "Raphotos"} />

			<link rel="icon" href="favicon.ico" />
		</Head>
	);
}

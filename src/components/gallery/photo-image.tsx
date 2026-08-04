import Image from "next/image";

import { variantUrl } from "@/lib/image-variants";
import { cn } from "@/lib/utils";

interface PhotoImageProps {
	slug: string;
	width: number;
	height: number;
	lqip?: string | null;
	alt: string;
	sizes: string;
	variant?: "thumb" | "grid" | "full";
	priority?: boolean;
	className?: string;
}

export default function PhotoImage({
	slug,
	width,
	height,
	lqip,
	alt,
	sizes,
	variant = "grid",
	priority = false,
	className,
}: PhotoImageProps) {
	return (
		<Image
			src={variantUrl(slug, variant)}
			alt={alt}
			width={width}
			height={height}
			sizes={sizes}
			priority={priority}
			loading={priority ? undefined : "lazy"}
			placeholder={lqip ? "blur" : "empty"}
			blurDataURL={lqip ?? undefined}
			className={cn("h-auto w-full", className)}
		/>
	);
}

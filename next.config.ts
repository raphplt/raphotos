import type { NextConfig } from "next";

const cdnHost = process.env.NEXT_PUBLIC_CDN_URL
	? new URL(process.env.NEXT_PUBLIC_CDN_URL).hostname
	: "cdn.raphotos.fr";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	images: {
		loader: "custom",
		loaderFile: "./src/lib/image-loader.ts",
		remotePatterns: [{ protocol: "https", hostname: cdnHost }],
		formats: ["image/avif", "image/webp"],
	},
	experimental: {
		optimizePackageImports: ["lucide-react", "motion"],
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					{ key: "X-Frame-Options", value: "SAMEORIGIN" },
				],
			},
		];
	},
};

export default nextConfig;

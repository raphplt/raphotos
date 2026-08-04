"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

const LINKS = [
	{ href: "/photos", label: "Photos" },
	{ href: "/videos", label: "Vidéos" },
	{ href: "/a-propos", label: "À propos" },
];

export default function Header() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-40 transition-all duration-500",
				scrolled
					? "border-b border-line/70 bg-ink/85 backdrop-blur-xl"
					: "border-b border-transparent",
			)}
		>
			<div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 sm:h-20 sm:px-10">
				<Link
					href="/"
					className="font-display text-xl tracking-tight text-paper transition-opacity hover:opacity-70 sm:text-2xl"
				>
					Raphotos
				</Link>

				<nav className="hidden items-center gap-10 sm:flex">
					{LINKS.map((link) => {
						const active = pathname.startsWith(link.href);
						return (
							<Link
								key={link.href}
								href={link.href}
								className={cn(
									"relative text-[13px] tracking-editorial transition-colors",
									active ? "text-paper" : "text-muted hover:text-paper",
								)}
							>
								{link.label}
								<span
									className={cn(
										"absolute -bottom-1.5 left-0 h-px bg-accent transition-all duration-300",
										active ? "w-full" : "w-0",
									)}
								/>
							</Link>
						);
					})}
				</nav>

				<button
					type="button"
					onClick={() => setOpen((v) => !v)}
					className="-mr-2 p-2 text-paper sm:hidden"
					aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
					aria-expanded={open}
				>
					{open ? <X size={22} /> : <Menu size={22} />}
				</button>
			</div>

			<div
				className={cn(
					"fixed inset-0 top-16 bg-ink transition-all duration-300 sm:hidden",
					open
						? "pointer-events-auto opacity-100"
						: "pointer-events-none opacity-0",
				)}
			>
				<nav className="flex flex-col gap-2 px-8 pt-10">
					{LINKS.map((link, index) => (
						<Link
							key={link.href}
							href={link.href}

							onClick={() => setOpen(false)}
							className="border-b border-line/60 py-5 font-display text-3xl text-paper"
							style={{ transitionDelay: `${index * 60}ms` }}
						>
							{link.label}
						</Link>
					))}
				</nav>
			</div>
		</header>
	);
}

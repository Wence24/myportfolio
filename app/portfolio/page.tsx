"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const getRequestedPath = (value: string | null) => {
  if (!value) return "/portfolio/video-editing";

  const normalizedValue = value.toLowerCase().replace(/[-_]+/g, " ").trim();
  if (normalizedValue === "graphic design" || normalizedValue === "graphics") {
    return "/portfolio/graphic-design";
  }
  if (
    normalizedValue === "websites" ||
    normalizedValue === "website" ||
    normalizedValue === "web development"
  ) {
    return "/portfolio/web-development";
  }

  return "/portfolio/video-editing";
};

export default function PortfolioPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    router.replace(getRequestedPath(params.get("category")));
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#050914] px-6 text-center text-white">
      <p className="text-sm uppercase tracking-[0.24em] text-white/58">
        Opening portfolio...
      </p>
    </main>
  );
}

"use client";

import { usePathname } from "next/navigation";

export function ScrollGlowField() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div
      aria-hidden="true"
      className={`scroll-glow-field ${isHome ? "scroll-glow-field--after-hero" : ""}`}
    />
  );
}

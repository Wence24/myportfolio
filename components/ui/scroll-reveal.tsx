"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  y?: number;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
};

export function ScrollReveal({
  children,
  className,
  delayMs = 0,
  y = 24,
  threshold = 0.16,
  rootMargin = "0px 0px -10% 0px",
  once = true,
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = Boolean(entry?.isIntersecting);
        setIsVisible(nextVisible);

        if (nextVisible && once) {
          observer.unobserve(node);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [once, rootMargin, threshold]);

  return (
    <div
      ref={ref}
      className={cn(
        "transform-gpu transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isVisible ? "translate-y-0 opacity-100 blur-0" : "opacity-0 blur-[1px]",
        className
      )}
      style={{
        transform: isVisible ? "translate3d(0,0,0)" : `translate3d(0,${y}px,0)`,
        transitionDelay: isVisible ? `${delayMs}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
}

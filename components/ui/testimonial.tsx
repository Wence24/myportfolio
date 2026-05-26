"use client";

/* eslint-disable @next/next/no-img-element */

import { cn } from "@/lib/utils";
import type { HomeExperienceCard } from "@/lib/portfolio-data";
import { useEffect, useState } from "react";

type ExperienceTestimonialsProps = {
  eyebrow?: string;
  titleMuted?: string;
  titleStrong?: string;
  description?: string;
  cards: HomeExperienceCard[];
  className?: string;
};

export default function ExperienceTestimonials({
  eyebrow,
  titleMuted = "Built through reps.",
  titleStrong = "Shown through results.",
  description,
  cards,
  className,
}: ExperienceTestimonialsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [previewSize, setPreviewSize] = useState({ width: 220, height: 320 });

  useEffect(() => {
    if (hoveredIndex === null) {
      setPreviewIndex(null);
      setPreviewSize({ width: 220, height: 320 });
      return;
    }

    const timer = window.setTimeout(() => {
      setPreviewIndex(hoveredIndex);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [hoveredIndex]);

  const previewGap = 2;

  return (
    <section className={cn("relative mx-auto w-full max-w-6xl", className)}>
      <div className="mb-10 text-center">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8fdcff]/74">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="whitespace-nowrap text-[clamp(0.95rem,3.2vw,2.45rem)] font-bold leading-none tracking-[-0.02em] text-white">
          <span className="font-normal text-white/58">{titleMuted}</span>{" "}
          <span>{titleStrong}</span>
        </h3>
        {description ? (
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/54 sm:text-base">
            {description}
          </p>
        ) : null}
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8fdcff]/56">
          Hover for 3 seconds to see testimonial video
        </p>
      </div>

      <div className="flex flex-wrap items-stretch justify-center gap-6">
        {cards.map((card, index) => (
          <article
            key={`${card.name}-${index}`}
            onMouseEnter={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setHoveredIndex(index);
              setPreviewPosition({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
              });
            }}
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setPreviewPosition({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
              });
            }}
            onMouseLeave={() => {
              setHoveredIndex((current) => (current === index ? null : current));
              setPreviewIndex((current) => (current === index ? null : current));
            }}
            className={cn(
              "group relative max-w-80 overflow-visible rounded-2xl border border-white/10 bg-black text-white shadow-[0_22px_60px_rgba(0,0,0,0.28)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#8fdcff]/28 hover:shadow-[0_26px_70px_rgba(84,184,255,0.14)]",
              previewIndex === index ? "z-[100]" : "z-0"
            )}
          >
            <div className="overflow-hidden rounded-2xl">
            <div className="relative -mt-px overflow-hidden rounded-2xl">
              <img
                src={card.image}
                alt={card.name}
                className="h-[270px] w-full rounded-2xl object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute bottom-0 z-10 h-60 w-full bg-gradient-to-t from-black to-transparent" />
            </div>
            <div className="px-4 pb-4">
              <p className="border-b border-white/14 pb-5 font-medium leading-7 text-white/88">
                &quot;{card.quote}&quot;
              </p>
              <p className="mt-4 font-semibold text-white">- {card.name}</p>
              <p className="bg-gradient-to-r from-[#8fdcff] via-[#4a8fff] to-[#bdeeff] bg-clip-text text-sm font-medium text-transparent">
                {card.role}
              </p>
            </div>
            </div>
            {card.videoUrl && previewIndex === index ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute z-[999] animate-[testimonialPreviewIn_220ms_ease-out_both]"
                style={{
                  left: previewPosition.x + previewGap,
                  top: previewPosition.y + previewGap,
                  width: previewSize.width,
                }}
              >
                <div
                  className="overflow-hidden rounded-2xl border border-[#8fdcff]/28 bg-black shadow-[0_26px_80px_rgba(0,0,0,0.55),0_0_44px_rgba(84,184,255,0.2)]"
                  style={{ width: previewSize.width }}
                >
                  <video
                    key={card.videoUrl}
                    src={card.videoUrl}
                    className="block bg-black object-cover"
                    style={{
                      width: previewSize.width,
                      height: previewSize.height,
                    }}
                    loop
                    playsInline
                    autoPlay
                    controls
                    preload="auto"
                    onLoadedMetadata={(event) => {
                      const video = event.currentTarget;
                      if (video.videoWidth && video.videoHeight) {
                        const maxWidth = 260;
                        const maxHeight = 340;
                        const scale = Math.min(
                          maxWidth / video.videoWidth,
                          maxHeight / video.videoHeight,
                          1
                        );
                        setPreviewSize({
                          width: Math.round(video.videoWidth * scale),
                          height: Math.round(video.videoHeight * scale),
                        });
                      }
                    }}
                  />
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-white">{card.name}</p>
                    <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8fdcff]/72">
                      Preview
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <style jsx>{`
        @keyframes testimonialPreviewIn {
          from {
            opacity: 0;
            transform: translate3d(10px, 10px, 0) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
      `}</style>
    </section>
  );
}

"use client";

/* eslint-disable @next/next/no-img-element */

import { cn } from "@/lib/utils";
import type { HomeExperienceCard } from "@/lib/portfolio-data";

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
      </div>

      <div className="flex flex-wrap items-stretch justify-center gap-6">
        {cards.map((card, index) => (
          <article
            key={`${card.name}-${index}`}
            className="group max-w-80 overflow-hidden rounded-2xl border border-white/10 bg-black text-white shadow-[0_22px_60px_rgba(0,0,0,0.28)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#8fdcff]/28 hover:shadow-[0_26px_70px_rgba(84,184,255,0.14)]"
          >
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
          </article>
        ))}
      </div>
    </section>
  );
}

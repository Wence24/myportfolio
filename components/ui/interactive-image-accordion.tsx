"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";

type AccordionItemData = {
  id: number;
  title: string;
  imageUrl: string;
};

type AccordionItemProps = {
  item: AccordionItemData;
  isActive: boolean;
  onMouseEnter: () => void;
};

const defaultAccordionItems: AccordionItemData[] = [
  {
    id: 1,
    title: "Easy Handoff",
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Story Sense",
    imageUrl:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Visual Taste",
    imageUrl:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Tech Mindset",
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Wence",
    imageUrl: "/wenshe.png",
  },
];

function AccordionItem({ item, isActive, onMouseEnter }: AccordionItemProps) {
  return (
    <div
      className={`relative h-[390px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/10 transition-all duration-700 ease-in-out sm:h-[430px] ${
        isActive
          ? "w-[min(52vw,390px)] sm:w-[320px] lg:w-[300px] xl:w-[360px] 2xl:w-[390px]"
          : "w-[clamp(2rem,7vw,3.25rem)] sm:w-[52px] lg:w-[48px] xl:w-[56px] 2xl:w-[64px]"
      }`}
      onMouseEnter={onMouseEnter}
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        className={`absolute inset-0 h-full w-full ${
          item.imageUrl.startsWith("/") ? "object-contain object-bottom" : "object-cover"
        }`}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src =
            "https://placehold.co/400x450/07111c/ffffff?text=Image+Error";
        }}
      />
      <div className="absolute inset-0 bg-black/18" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(0,0,0,0.48)_100%)]" />

      <span
        className={`absolute whitespace-nowrap text-lg font-semibold text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.55)] transition-all duration-300 ease-in-out ${
          isActive
            ? "bottom-6 left-1/2 -translate-x-1/2 rotate-0"
            : "bottom-24 left-1/2 -translate-x-1/2 rotate-90 text-left"
        }`}
      >
        {item.title}
      </span>
    </div>
  );
}

export function LandingAccordionItem({
  eyebrow = "About Me",
  title = "Wence Dante De Vera",
  description = "Creative freelancer with 2 years of experience turning scattered ideas into organized, publish-ready work.",
  secondaryDescription = "My edge is the way I work: clean files, direct updates, thoughtful revisions, and a calm hand from first brief to final export.",
  ctaLabel = "View Client Edits",
  onCtaClick,
  items = defaultAccordionItems,
  initialActiveIndex = 0,
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  description?: string;
  secondaryDescription?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  items?: AccordionItemData[];
  initialActiveIndex?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(
    Math.min(Math.max(initialActiveIndex, 0), Math.max(items.length - 1, 0))
  );

  return (
    <div className="relative overflow-visible">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[12%] top-[10%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.18)_0%,transparent_72%)] blur-3xl" />
        <div className="absolute right-[8%] bottom-[12%] h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(47,125,255,0.16)_0%,transparent_74%)] blur-3xl" />
      </div>

      <section className="relative mx-auto w-full max-w-[98rem] py-10 md:py-14 lg:-translate-x-16 xl:-translate-x-24 2xl:-translate-x-32">
        <div className="flex flex-col items-center justify-between gap-10 lg:flex-row lg:gap-6 xl:gap-8">
          <div className="w-full lg:w-[56%] xl:w-[54%]">
            <div className="flex flex-row items-center justify-center gap-2 overflow-visible p-0 sm:gap-3 2xl:gap-4">
              {items.map((item, index) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isActive={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </div>

          <div className="w-full text-center lg:w-[44%] lg:pl-4 lg:text-left xl:w-[46%]">
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8fdcff]/78">
                {eyebrow}
              </p>
            ) : null}
            <h3
              className="mt-4 text-2xl font-bold leading-none tracking-normal text-white sm:text-3xl lg:text-[2.45rem]"
              style={{ fontFamily: "'CreatoDisplay', sans-serif" }}
            >
              {title}
            </h3>
            <p className="mx-auto mt-6 max-w-xl text-justify text-sm leading-7 text-white/66 md:text-base lg:mx-0">
              {description}
            </p>
            <p className="mx-auto mt-4 max-w-xl text-justify text-sm leading-7 text-white/54 md:text-base lg:mx-0">
              {secondaryDescription}
            </p>
            {onCtaClick ? (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={onCtaClick}
                  className="inline-flex rounded-full bg-[linear-gradient(135deg,#76e1ff,#4a8fff)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#04111b] shadow-[0_18px_38px_rgba(84,184,255,0.22)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(84,184,255,0.32)]"
                >
                  {ctaLabel}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

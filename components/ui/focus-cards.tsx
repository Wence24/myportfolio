"use client";

import React, { useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type FocusCardItem = {
  id: string;
  title: string;
  description: string;
  src?: string;
  meta?: string;
  hint?: string;
  ctaLabel?: string;
};

type FocusCardsProps = {
  cards: FocusCardItem[];
  selectedId?: string | null;
  onCardClick?: (card: FocusCardItem, index: number) => void;
  className?: string;
};

export function FocusCards({
  cards,
  selectedId = null,
  onCardClick,
  className,
}: FocusCardsProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className={cn("grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3", className)}>
      {cards.map((card, index) => {
        const isSelected = selectedId === card.id;
        const isDimmed = hovered !== null && hovered !== index;
        const showHoverState = hovered === index || isSelected;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onCardClick?.(card, index)}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "group relative flex aspect-square w-full overflow-hidden rounded-[28px] border text-left transition-[transform,filter,opacity,border-color,box-shadow] duration-300 ease-out",
              "bg-[linear-gradient(180deg,rgba(10,18,28,0.96),rgba(7,12,19,0.98))]",
              isSelected
                ? "border-[#74daff]/45 shadow-[0_22px_60px_rgba(0,153,255,0.18)]"
                : "border-white/10 hover:-translate-y-1 hover:border-white/18 hover:shadow-[0_20px_48px_rgba(0,0,0,0.22)]",
              isDimmed && "scale-[0.985] opacity-75 blur-[1px]"
            )}
            aria-pressed={isSelected}
          >
            {card.src ? (
              <img
                src={card.src}
                alt={card.title}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out",
                  showHoverState ? "scale-105" : "scale-100"
                )}
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,214,255,0.14),transparent_36%),linear-gradient(180deg,rgba(12,22,34,0.94),rgba(7,12,19,0.98))]" />
            )}

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,14,0.12),rgba(4,8,14,0.28)_40%,rgba(2,5,10,0.88)_100%)]" />
            <div
              className={cn(
                "absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(125,225,255,0.14),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_54%)] transition-opacity duration-300",
                showHoverState ? "opacity-100" : "opacity-60"
              )}
            />

            <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72 backdrop-blur-md">
              <Play className="h-3.5 w-3.5 text-[#9ceaff]" />
              <span>{card.meta || "Project"}</span>
            </div>

            <div
              className={cn(
                "pointer-events-none absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/28 text-white/78 backdrop-blur-md transition-all duration-300",
                showHoverState && "border-[#79deff]/28 bg-[#07151f]/70 text-[#c7f4ff]"
              )}
            >
              <ArrowUpRight className="h-4.5 w-4.5" />
            </div>

            <div className="relative z-10 mt-auto w-full p-5">
              <div
                className={cn(
                  "mb-3 inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300",
                  showHoverState
                    ? "border-[#8fdcff]/24 bg-[#07131d]/82 text-[#b8efff]"
                    : "border-white/10 bg-black/22 text-white/60"
                )}
              >
                {card.hint || "Click to view videos"}
              </div>

              <h3 className="text-xl font-semibold text-white sm:text-[1.4rem]">
                {card.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/68">
                {card.description}
              </p>

              <div
                className={cn(
                  "mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300",
                  showHoverState
                    ? "border-[#7bddff]/28 bg-[#091724]/88 text-[#caf5ff]"
                    : "border-white/12 bg-black/20 text-white/74"
                )}
              >
                <span>{card.ctaLabel || "Preview project"}</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

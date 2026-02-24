"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type InteractiveHoverButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  defaultLabel?: string;
  hoverLabel?: string;
};

export function InteractiveHoverButton({
  defaultLabel = "Details",
  hoverLabel = "Open",
  className,
  onClick,
  ...props
}: InteractiveHoverButtonProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
      className={cn(
        "group relative z-20 inline-flex h-6 min-w-[56px] items-center justify-center overflow-hidden rounded-sm pointer-events-auto",
        "border border-white/5 bg-white/0 px-1.5 text-[10px] font-semibold text-white/90 backdrop-blur-md",
        "transition-all duration-300 hover:border-white/20 hover:bg-white/20",
        className
      )}
      {...props}
    >
      <span className="inline-flex items-center transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-0">
        {defaultLabel}
      </span>

      <span className="absolute inset-0 z-10 inline-flex translate-x-5 items-center justify-center gap-0.5 opacity-0 text-[#8fd3ff] transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span>{hoverLabel}</span>
        <ArrowRight className="h-2 w-2" />
      </span>
    </button>
  );
}

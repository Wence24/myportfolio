"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Clapperboard, Film, Layers, MonitorPlay, Sparkles } from "lucide-react";
import { defaultHomeContent, type HomeContent, type HomeFeaturedProject } from "@/lib/portfolio-data";

type InteractiveSelectorOption = {
  title: string;
  description: string;
  image: string;
  icon: HomeFeaturedProject["icon"];
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const iconMap: Record<HomeFeaturedProject["icon"], React.ReactNode> = {
  clapperboard: <Clapperboard className="h-5 w-5 text-white" />,
  "monitor-play": <MonitorPlay className="h-5 w-5 text-white" />,
  film: <Film className="h-5 w-5 text-white" />,
  layers: <Layers className="h-5 w-5 text-white" />,
  sparkles: <Sparkles className="h-5 w-5 text-white" />,
};

export default function InteractiveSelector({
  content,
}: {
  content?: HomeContent["featuredProjects"];
}) {
  const featuredContent = content || defaultHomeContent.featuredProjects;
  const isLegacyFeaturedTitle =
    featuredContent.titleMuted.trim().toLowerCase() === "featured projects" &&
    featuredContent.titleStrong.trim().toLowerCase() === "a closer look";
  const displayEyebrow =
    featuredContent.eyebrow.trim().toLowerCase() === "featured projects"
      ? ""
      : featuredContent.eyebrow.trim();
  const displayTitleMuted = isLegacyFeaturedTitle
    ? "Recent favorites."
    : featuredContent.titleMuted;
  const displayTitleStrong = isLegacyFeaturedTitle
    ? "A closer look at each."
    : featuredContent.titleStrong;
  const displayDescription =
    featuredContent.description.trim() ===
    "This section pins in place while scrolling moves through the featured project frames."
      ? ""
      : featuredContent.description.trim();
  const options: InteractiveSelectorOption[] = useMemo(
    () => featuredContent.projects,
    [featuredContent.projects]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatedOptions, setAnimatedOptions] = useState<number[]>([]);

  const frameCount = Math.max(options.length, 1);
  const maxIndex = Math.max(options.length - 1, 0);
  const safeActiveIndex = clamp(activeIndex, 0, maxIndex);
  const progress = frameCount > 0 ? ((safeActiveIndex + 1) / frameCount) * 100 : 0;

  const handleOptionClick = (index: number) => {
    setActiveIndex(clamp(index, 0, Math.max(options.length - 1, 0)));
  };

  useEffect(() => {
    setActiveIndex(0);
    setAnimatedOptions([]);

    const timers = options.map((_, index) =>
      window.setTimeout(() => {
        setAnimatedOptions((currentOptions) =>
          currentOptions.includes(index) ? currentOptions : [...currentOptions, index]
        );
      }, 120 * index)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [options]);

  return (
    <section
      className="section-side-glow relative bg-black px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8"
      aria-label="Featured projects selector"
    >
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(62,141,255,0.16),transparent_34%),linear-gradient(180deg,#05070b_0%,#000_72%)]" />
          <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(143,220,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(143,220,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            {displayEyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8fdcff]/72 sm:text-[11px] sm:tracking-[0.34em]">
                {displayEyebrow}
              </p>
            ) : null}
            <h2
              className="mx-auto max-w-4xl text-center text-[clamp(1.45rem,6vw,2.95rem)] font-bold leading-[1.05] text-white sm:whitespace-nowrap"
              style={{ fontFamily: "'CreatoDisplay', sans-serif" }}
            >
              <span className="font-normal text-white/58">{displayTitleMuted}</span>{" "}
              <span>{displayTitleStrong}</span>
            </h2>
            {displayDescription ? (
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/66 sm:text-base">
                {displayDescription}
              </p>
            ) : null}
          </div>

          <div className="mx-auto mt-5 max-w-5xl sm:mt-7">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-white/48">
              <span>Project {safeActiveIndex + 1}</span>
              <span>{options.length} featured</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#3e8dff,#8fdcff)] transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="relative mt-5 flex h-[min(460px,50svh)] w-full flex-col gap-2 overflow-hidden sm:mt-7 sm:gap-3 md:h-[min(540px,58vh)] md:flex-row md:items-stretch lg:h-[min(590px,62vh)]">
            {options.map((option, index) => {
              const isActive = safeActiveIndex === index;
              const hasAnimated = animatedOptions.includes(index);

              return (
                <button
                  key={`${option.title}-${index}`}
                  type="button"
                  className="group relative flex min-h-0 flex-col justify-end overflow-hidden border-2 bg-[#111827] text-left outline-none transition-[flex,opacity,transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-[#8fdcff]/60 md:min-h-[100px]"
                  style={{
                    backgroundImage: `url('${option.image}')`,
                    backgroundSize: isActive ? "cover" : "auto 116%",
                    backgroundPosition: "center",
                    borderColor: isActive ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.1)",
                    boxShadow: isActive
                      ? "0 22px 70px rgba(0,0,0,0.46)"
                      : "0 12px 34px rgba(0,0,0,0.26)",
                    flex: isActive ? "7 1 0%" : "1 1 0%",
                    opacity: hasAnimated ? 1 : 0,
                    transform: hasAnimated ? "translateX(0)" : "translateX(-42px)",
                    zIndex: isActive ? 10 : 1,
                    willChange: "flex-grow, transform, opacity",
                  }}
                  onClick={() => handleOptionClick(index)}
                  aria-pressed={isActive}
                >
                  <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.72))]" />
                  <span
                    className="absolute inset-x-0 bottom-0 h-36 transition-opacity duration-500"
                    style={{
                      boxShadow: isActive
                        ? "inset 0 -130px 120px -92px #000, inset 0 -130px 130px -70px #000"
                        : "inset 0 -110px 90px -94px #000",
                      opacity: isActive ? 1 : 0.62,
                    }}
                  />

                  <span className="relative z-10 flex h-16 items-center gap-2.5 px-3 pb-4 sm:h-20 sm:gap-3 sm:px-4 sm:pb-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/18 bg-black/60 shadow-[0_10px_24px_rgba(0,0,0,0.24)] sm:h-11 sm:w-11">
                      {iconMap[option.icon]}
                    </span>
                    <span className="min-w-0 overflow-hidden">
                      <span
                        className="block truncate text-base font-bold text-white transition-[opacity,transform] duration-500 sm:text-lg"
                        style={{
                          opacity: isActive ? 1 : 0,
                          transform: isActive ? "translateX(0)" : "translateX(24px)",
                        }}
                      >
                        {option.title}
                      </span>
                      <span
                        className="mt-1 block truncate text-xs text-white/70 transition-[opacity,transform] duration-500 sm:text-sm"
                        style={{
                          opacity: isActive ? 1 : 0,
                          transform: isActive ? "translateX(0)" : "translateX(24px)",
                        }}
                      >
                        {option.description}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

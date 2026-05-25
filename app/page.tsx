"use client";

import React, { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Listbox, Transition } from "@headlessui/react";
import {
  SiAdobeaftereffects,
  SiAdobeillustrator,
  SiAdobephotoshop,
  SiAdobepremierepro,
  SiCanva,
} from "react-icons/si";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Lens } from "@/components/ui/lens";
import AnimatedTestimonialsDemo from "@/components/animated-testimonials-demo";
import AuroraBackgroundDemo from "@/components/aurora-background-demo";
import { HomeScrollRevealSection } from "@/components/ui/motion-footer";
import { SiteHeader } from "@/components/site-header";
import { Feature108 } from "@/components/ui/shadcnblocks-com-feature108";
import { LandingAccordionItem } from "@/components/ui/interactive-image-accordion";
import InteractiveSelector from "@/components/ui/interactive-selector";
import ExperienceTestimonials from "@/components/ui/testimonial";
import {
  countUsableExperienceImages,
  type CreativeExperienceEntry,
  type HomeContent,
  defaultHomeContent,
  defaultExperienceEntries,
  defaultPortfolioProjects,
  EXPERIENCE_CONTENT_UPDATED_AT_KEY,
  EXPERIENCE_STORAGE_KEY,
  EXPERIENCE_UPDATED_EVENT,
  HOME_CONTENT_STORAGE_KEY,
  HOME_CONTENT_UPDATED_AT_KEY,
  HOME_CONTENT_UPDATED_EVENT,
  normalizeExperienceEntries,
  normalizeHomeContent,
  parseHomeContent,
  parseExperienceEntries,
  PORTFOLIO_CONTENT_UPDATED_AT_KEY,
  PORTFOLIO_SYNC_CHANNEL_NAME,
  PORTFOLIO_STORAGE_KEY,
  PORTFOLIO_UPDATED_EVENT,
  fetchPortfolioContentFromSupabase,
} from "@/lib/portfolio-data";
import {
  Mail,
  Medal,
  Globe,
  ArrowUpRight,
  Film,
  Palette,
  ExternalLink,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
} from "lucide-react"; // added icons

const MODAL_TRANSITION_MS = 520;
const MODAL_OPEN_DELAY_MS = 10;
const CONTACT_PANEL_TRANSITION_MS = 220;
const CONTACT_PANEL_OPEN_DELAY_MS = 8;
const VIDEO_METADATA_TIMEOUT_MS = 12000;
const INTRO_DOOR_OPEN_MS = 760;
const INTRO_DOOR_OPEN_MOTION_LITE_MS = 560;
const INTRO_OVERLAY_RELEASE_MS = 140;
const INTRO_BACKDROP_FADE_MS = 420;
const INTRO_ATMOSPHERE_FADE_MS = 320;
const INTRO_LOGO_PULSE_MS = 1480;
const INTRO_LOGO_PULSE_MOTION_LITE_MS = 1080;
type PortfolioCategoryName = "Graphic Design" | "Video Edit" | "Websites";

const getPortfolioCategoryPath = (categoryName: PortfolioCategoryName) => {
  if (categoryName === "Video Edit") return "/portfolio/video-editing";
  if (categoryName === "Graphic Design") return "/portfolio/graphic-design";
  return "/portfolio/web-development";
};

type AboutExperienceSectionProps = {
  aboutRef: React.RefObject<HTMLDivElement | null>;
  clientStoriesRef: React.RefObject<HTMLElement | null>;
  showAbout: boolean;
  showClientStories: boolean;
  helloVisible: boolean;
  aboutFullName: string;
  nameText: string;
  nameDone: boolean;
  onViewClientEdits: () => void;
  highlightCards: ReadonlyArray<{
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  snapshotStats: ReadonlyArray<{
    value: string;
    label: string;
  }>;
  experienceEntries: ReadonlyArray<CreativeExperienceEntry>;
  experienceContentVersion: string;
  homeContent: HomeContent;
};

const getVersionedAssetUrl = (url: string, version: string) => {
  const trimmedUrl = url.trim();
  if (!trimmedUrl || !version) {
    return trimmedUrl;
  }

  if (/^(data:|blob:)/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  const separator = trimmedUrl.includes("?") ? "&" : "?";
  return `${trimmedUrl}${separator}v=${encodeURIComponent(version)}`;
};

const getStoredExperienceContentVersion = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    window.localStorage.getItem(EXPERIENCE_CONTENT_UPDATED_AT_KEY) ||
    window.localStorage.getItem(PORTFOLIO_CONTENT_UPDATED_AT_KEY) ||
    ""
  );
};

const getStoredHomeContentVersion = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    window.localStorage.getItem(HOME_CONTENT_UPDATED_AT_KEY) ||
    window.localStorage.getItem(PORTFOLIO_CONTENT_UPDATED_AT_KEY) ||
    ""
  );
};

const shouldUseMotionLite = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const navigatorWithDeviceMemory = window.navigator as Navigator & {
    deviceMemory?: number;
    connection?: {
      saveData?: boolean;
    };
  };
  const cpuCores = window.navigator.hardwareConcurrency;
  const deviceMemory = navigatorWithDeviceMemory.deviceMemory;
  const isSmallScreen = window.innerWidth <= 1024;

  return (
    mediaQuery.matches ||
    navigatorWithDeviceMemory.connection?.saveData === true ||
    (typeof cpuCores === "number" && cpuCores <= 4) ||
    (typeof deviceMemory === "number" && deviceMemory <= 4) ||
    (isSmallScreen &&
      ((typeof cpuCores === "number" && cpuCores <= 8) ||
        (typeof deviceMemory === "number" && deviceMemory <= 6)))
  );
};

function FreshAboutExperienceSection({
  aboutRef,
  showAbout,
  helloVisible,
  aboutFullName,
  nameText,
  nameDone,
  onViewClientEdits,
  highlightCards,
  snapshotStats,
  experienceEntries,
}: AboutExperienceSectionProps) {
  const rolePills = ["Video Editing", "Graphic Design", "WordPress Builds"] as const;

  return (
    <div
      ref={aboutRef}
      className="relative mt-14 overflow-visible transition-all duration-700 ease-out lg:mt-20"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-[-4.5rem] h-28 bg-[linear-gradient(180deg,rgba(9,15,24,0)_0%,rgba(11,17,26,0.52)_55%,rgba(11,17,26,0.88)_100%)] blur-2xl" />
        <div className="absolute left-[7%] top-[9%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.12)_0%,transparent_72%)] blur-3xl" />
        <div className="absolute right-[6%] top-[14%] h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.07)_0%,transparent_74%)] blur-3xl" />
        <div className="absolute inset-x-[14%] top-[20%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-x-[16%] bottom-[10%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute left-1/2 bottom-[14%] h-44 w-[72%] -translate-x-1/2 bg-[radial-gradient(circle,rgba(84,184,255,0.08)_0%,transparent_72%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-2 sm:px-4 lg:px-6">
        <div
          className={`mx-auto max-w-3xl transform-gpu text-center transition-[opacity,transform] duration-500 ease-out ${
            showAbout ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
          }`}
        >
          <span className="inline-flex items-center rounded-full border border-white/14 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c7efff]">
            About Me + Experience
          </span>
          <h2
            className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-[3.15rem]"
            style={{
              fontFamily: "'CreatoDisplay', sans-serif",
              letterSpacing: "0.03em",
              textShadow: "0 0 18px rgba(0,153,255,0.14)",
            }}
          >
            A cleaner look at who you&apos;re hiring.
          </h2>
          <div className="mx-auto mt-4 h-[4px] w-24 rounded-full bg-[linear-gradient(90deg,#6677ff_0%,#54b8ff_52%,#74ebff_100%)] shadow-[0_0_18px_rgba(84,184,255,0.42)]" />
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/68 sm:text-base">
            Short, polished, and easy to scan so clients get the important part fast.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <section
            className={`relative overflow-hidden rounded-[36px] border border-white/12 bg-[linear-gradient(135deg,rgba(11,18,29,0.98),rgba(16,28,43,0.92)_58%,rgba(8,12,18,0.98)_100%)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-[opacity,transform] duration-[560ms] ease-out sm:p-6 lg:p-7 ${
              helloVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute left-[10%] top-[16%] h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(122,228,255,0.12)_0%,transparent_72%)] blur-3xl" />
              <div className="absolute right-[8%] bottom-[14%] h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(116,126,255,0.12)_0%,transparent_72%)] blur-3xl" />
              <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <div className="relative z-10 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_220px] xl:items-center">
              <div
                className={`relative mx-auto w-full max-w-[260px] transition-[opacity,transform] duration-500 ease-out ${
                  helloVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                <div className="absolute -left-3 top-4 rounded-2xl border border-[#8fdcff]/24 bg-[#071521]/88 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#c8f3ff] shadow-[0_14px_32px_rgba(0,0,0,0.2)]">
                  Available
                </div>
                <div className="absolute -right-3 bottom-5 rounded-2xl border border-white/14 bg-[#0f1723]/92 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/70 shadow-[0_14px_32px_rgba(0,0,0,0.2)]">
                  Remote-ready
                </div>
                <div className="relative aspect-square overflow-hidden rounded-[30px] border border-white/12 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.12),rgba(255,255,255,0.02)_44%,rgba(3,8,14,0.9)_100%)] shadow-[0_18px_52px_rgba(0,0,0,0.32)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,227,255,0.16),transparent_42%)]" />
                  <Image
                    src="/wenshe.png"
                    alt="Wence portrait"
                    fill
                    priority
                    className="object-contain object-bottom"
                  />
                </div>
              </div>

              <div
                className={`min-w-0 transition-[opacity,transform] duration-500 ease-out ${
                  helloVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: "0.08s" }}
              >
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#8fdcff]">
                  Profile Snapshot
                </p>

                <h3
                  className="relative mt-3 block text-4xl font-bold leading-[0.94] tracking-[-0.03em] text-white sm:text-[3rem]"
                  aria-label={aboutFullName}
                  style={{
                    fontFamily: "'CreatoDisplay', sans-serif",
                    textShadow: "0 0 16px rgba(0,153,255,0.12)",
                  }}
                >
                  <span aria-hidden="true" className="invisible block">
                    {aboutFullName}
                  </span>
                  <span aria-hidden="true" className="absolute inset-0">
                    <span>{nameText}</span>
                    {!nameDone && (
                      <span className="ml-1 inline-block h-[1em] w-[2px] animate-blink bg-white align-baseline" />
                    )}
                  </span>
                </h3>

                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                  I help brands, creators, and businesses turn rough ideas into cleaner
                  edits, sharper visuals, and simple web experiences that already feel
                  ready to publish.
                </p>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {rolePills.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/76 backdrop-blur-md"
                    >
                      <Check className="h-3.5 w-3.5 text-[#8fdcff]" />
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onViewClientEdits}
                    className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#76e1ff,#4a8fff)] px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#04111b] shadow-[0_18px_36px_rgba(84,184,255,0.24)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(84,184,255,0.32)]"
                  >
                    View Portfolio
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>

                  <a
                    href="/Wence-De-Vera-CV.pdf"
                    download
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/84 transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    Download CV
                  </a>
                </div>
              </div>

              <div
                className={`grid gap-3 sm:grid-cols-3 xl:grid-cols-1 transition-[opacity,transform] duration-500 ease-out ${
                  helloVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: "0.16s" }}
              >
                {snapshotStats.map((item) => (
                  <div
                    key={item.value}
                    className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-4 py-4"
                  >
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#8fdcff]/74">
                      Snapshot
                    </p>
                    <p className="mt-2 text-[1.9rem] font-semibold leading-none text-white">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/58">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-3">
            {highlightCards.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className={`group relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-5 shadow-[0_18px_42px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-[opacity,transform,border-color,background-color] duration-500 ease-out hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.07] ${
                    showAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: showAbout ? `${0.16 + index * 0.08}s` : "0s" }}
                >
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                    <div className="absolute right-[-8%] top-[-8%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.1)_0%,transparent_72%)] blur-3xl" />
                  </div>

                  <div className="relative z-10">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-[#0a1724] text-[#a9ebff] shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/66">
                      {item.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          <section
            className={`relative overflow-hidden rounded-[36px] border border-white/12 bg-[linear-gradient(180deg,rgba(18,26,36,0.96),rgba(10,16,24,0.98))] p-5 shadow-[0_28px_72px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-[opacity,transform] duration-[560ms] ease-out sm:p-6 lg:p-7 ${
              showAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: showAbout ? "0.28s" : "0s" }}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute left-[8%] bottom-[12%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_72%)] blur-3xl" />
              <div className="absolute right-[10%] top-[16%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.1)_0%,transparent_72%)] blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-[#8fdcff]">
                    Experience Snapshot
                  </p>
                  <h3
                    className="mt-3 text-2xl font-semibold text-white sm:text-[2.35rem]"
                    style={{
                      fontFamily: "'CreatoDisplay', sans-serif",
                      letterSpacing: "0.03em",
                      textShadow: "0 0 18px rgba(0,153,255,0.14)",
                    }}
                  >
                    Past client work, made easy to scan.
                  </h3>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-white/62 sm:text-right">
                  A quick read on the projects, formats, and creative support I have
                  already delivered.
                </p>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-3">
                {experienceEntries.map((experience, index) => (
                  <article
                    key={`${experience.client}-${experience.role}`}
                    className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.07]"
                    style={{
                      animation: showAbout ? "fadeIn 0.72s ease forwards" : "none",
                      animationDelay: `${0.12 + index * 0.08}s`,
                    }}
                  >
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/16 to-transparent" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <span className="rounded-full border border-white/12 bg-black/18 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/58">
                          {experience.period}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-white/28 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#8fdcff]" />
                      </div>

                      <h4 className="mt-5 text-xl font-semibold text-white">
                        {experience.client}
                      </h4>
                      <p className="mt-2 text-sm font-medium text-[#b9eeff]">
                        {experience.role}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-white/68">
                        {experience.summary}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {experience.tags.map((tag) => (
                          <span
                            key={`${experience.client}-${tag}`}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/58"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function AboutExperienceSection({
  aboutRef,
  clientStoriesRef,
  showAbout,
  showClientStories,
  helloVisible,
  aboutFullName,
  nameText,
  nameDone,
  onViewClientEdits,
  highlightCards,
  snapshotStats,
  experienceEntries,
  experienceContentVersion,
  homeContent,
}: AboutExperienceSectionProps) {
  return (
    <FreshAboutExperienceSection
      aboutRef={aboutRef}
      clientStoriesRef={clientStoriesRef}
      showAbout={showAbout}
      showClientStories={showClientStories}
      helloVisible={helloVisible}
      aboutFullName={aboutFullName}
      nameText={nameText}
      nameDone={nameDone}
      onViewClientEdits={onViewClientEdits}
      highlightCards={highlightCards}
      snapshotStats={snapshotStats}
      experienceEntries={experienceEntries}
      experienceContentVersion={experienceContentVersion}
      homeContent={homeContent}
    />
  );

  return (
    <div
      ref={aboutRef}
      className="relative mt-10 flex flex-col items-center overflow-visible transition-all duration-700 ease-out lg:mt-14"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-[-4rem] h-24 bg-[linear-gradient(180deg,rgba(9,14,21,0)_0%,rgba(9,14,21,0.74)_56%,rgba(9,14,21,0.96)_100%)] blur-2xl" />
        <div className="absolute left-[8%] top-[7%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(86,197,255,0.18)_0%,transparent_72%)] blur-3xl" />
        <div className="absolute right-[6%] top-[18%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_74%)] blur-3xl" />
        <div className="absolute inset-x-[18%] top-[12rem] h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
        <div className="absolute inset-x-[14%] bottom-[22%] h-40 bg-[radial-gradient(circle,rgba(84,184,255,0.08)_0%,transparent_72%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-2 sm:px-4 lg:px-5">
        <div
          className={`mx-auto max-w-3xl text-center transition-[opacity,transform] duration-500 ease-out ${
            showAbout ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
          }`}
        >
          <span className="inline-flex items-center rounded-full border border-white/14 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c7efff]">
            Professional Profile
          </span>
          <h2
            className="mt-5 text-[1.9rem] font-bold text-white sm:text-[2.35rem] lg:text-[2.75rem]"
            style={{
              fontFamily: "'CreatoDisplay', sans-serif",
              letterSpacing: "0.03em",
              textShadow: "0 0 18px rgba(0,153,255,0.14)",
            }}
          >
            A fresher read on the person and projects behind the work.
          </h2>
          <div className="mx-auto mt-4 h-[4px] w-24 rounded-full bg-[linear-gradient(90deg,#6677ff_0%,#54b8ff_52%,#74ebff_100%)] shadow-[0_0_18px_rgba(84,184,255,0.42)]" />
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/68 sm:text-base">
            Kept short, visual, and easy to scan.
          </p>
        </div>

        <div className="mt-10 grid gap-6">
          <section
            className={`relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,24,35,0.98),rgba(7,11,18,0.98)_62%,rgba(11,24,37,0.96)_100%)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.28)] transition-[opacity,transform] duration-500 ease-out sm:p-7 lg:p-8 ${
              helloVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/22 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(84,184,255,0.16),transparent_24%),radial-gradient(circle_at_84%_26%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.05)_0%,transparent_35%)]" />
              <div className="absolute right-[-8%] top-[-18%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(102,119,255,0.16)_0%,transparent_72%)] blur-3xl" />
              <div className="absolute left-[-8%] bottom-[-18%] h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.14)_0%,transparent_72%)] blur-3xl" />
            </div>

            <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] xl:items-stretch">
              <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 sm:p-6 lg:p-7">
                <span className="inline-flex items-center rounded-full border border-white/14 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c7efff]">
                  About Me
                </span>

                <h3
                  className="relative mt-5 block text-4xl font-bold leading-[0.92] tracking-[-0.03em] text-white sm:text-[3.1rem] lg:text-[3.45rem]"
                  aria-label={aboutFullName}
                  style={{
                    opacity: helloVisible ? 1 : 0,
                    transform: helloVisible ? "translateX(0)" : "translateX(-40px)",
                    transition: "opacity 0.42s ease-out 0.12s, transform 0.42s ease-out 0.12s",
                    fontFamily: "'CreatoDisplay', sans-serif",
                    textShadow: "0 0 16px rgba(0,153,255,0.1)",
                  }}
                >
                  <span aria-hidden="true" className="invisible block">
                    {aboutFullName}
                  </span>
                  <span aria-hidden="true" className="absolute inset-0">
                    <span>{nameText}</span>
                    {!nameDone && (
                      <span className="ml-1 inline-block h-[1em] w-[2px] animate-blink bg-white align-baseline" />
                    )}
                  </span>
                </h3>

                <div className="mt-5 h-[4px] w-24 rounded-full bg-[linear-gradient(90deg,#6677ff_0%,#54b8ff_52%,#74ebff_100%)] shadow-[0_0_18px_rgba(84,184,255,0.42)]" />

                <p
                  className={`mt-5 max-w-2xl text-justify text-sm leading-relaxed text-white/70 transition-[opacity,transform] duration-420 ease-out sm:text-base ${
                    helloVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  }`}
                  style={{ transitionDelay: "0.12s" }}
                >
                  Creative freelancer with 2 years of experience focused on organized process, sharp taste, and smooth client collaboration.
                </p>

                <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-[#c7efff]/74">
                  Video Editor • Graphic Designer • 2 Years Experience
                </p>

                <div className="mt-7 grid gap-3 md:grid-cols-3">
                  {highlightCards.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-4 transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.09]"
                        style={{
                          transitionDelay: showAbout ? `${0.16 + index * 0.05}s` : "0s",
                        }}
                      >
                        <div className="pointer-events-none absolute inset-0">
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                          <div className="absolute right-[-12%] top-[-20%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.14)_0%,transparent_72%)] blur-3xl" />
                        </div>

                        <div className="relative z-10">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06]">
                            <Icon className="h-5 w-5 text-[#c7efff]" />
                          </div>
                          <p className="mt-4 text-base font-semibold text-white">{item.title}</p>
                          <p className="mt-2 text-sm leading-relaxed text-white/60">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="/Wence-De-Vera-CV.pdf"
                    download
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[#8fdcff]/28 bg-[linear-gradient(90deg,rgba(84,184,255,0.16),rgba(111,228,255,0.08))] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d8f5ff] transition-[transform,border-color,background-color,box-shadow] duration-180 ease-out hover:-translate-y-0.5 hover:border-[#8fdcff]/42 hover:shadow-[0_12px_30px_rgba(84,184,255,0.18)]"
                  >
                    Download CV
                  </a>

                  <button
                    type="button"
                    onClick={onViewClientEdits}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/86 transition-[transform,border-color,background-color] duration-180 ease-out hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    View Client Edits
                  </button>
                </div>
              </div>

              <aside
                className={`relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,18,27,0.98),rgba(7,11,18,0.98))] p-4 transition-[opacity,transform] duration-500 ease-out sm:p-5 ${
                  helloVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: "0.08s" }}
              >
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.14),transparent_22%),radial-gradient(circle_at_22%_84%,rgba(84,184,255,0.16),transparent_26%)]" />
                </div>

                <div className="relative z-10 flex h-full flex-col">
                  <div className="relative aspect-[0.82] overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.16),rgba(255,255,255,0.04)_38%,rgba(0,0,0,0.4)_100%)]">
                    <div className="absolute inset-x-[14%] top-[7%] h-[1px] bg-gradient-to-r from-transparent via-white/24 to-transparent" />
                    <div className="absolute inset-x-[10%] bottom-[11%] h-24 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.22)_0%,transparent_70%)] blur-3xl" />
                    <Image
                      src="/wenshe.png"
                      alt="Wence portrait"
                      fill
                      priority
                      className="object-contain object-bottom grayscale"
                    />

                    <div className="absolute left-4 top-4 rounded-full border border-white/14 bg-[#06111c]/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[#d7f4ff] backdrop-blur-md">
                      Client-ready polish
                    </div>
                    <div className="absolute right-4 top-4 rounded-full border border-white/14 bg-[#0b1521]/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/76 backdrop-blur-md">
                      Short + Long-Form
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(5,12,18,0.78),rgba(5,12,18,0.48))] px-4 py-4 backdrop-blur-xl">
                      <p className="text-[10px] uppercase tracking-[0.26em] text-[#c7efff]">
                        Main Focus
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        Editing, design, and content that feels sharp fast.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    {snapshotStats.map((item) => (
                      <div
                        key={item.value}
                        className="rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-4"
                      >
                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#c7efff]/80">
                          {item.value}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-white/58">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <section
            className={`relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,27,0.98),rgba(8,12,18,0.98))] p-5 shadow-[0_26px_72px_rgba(0,0,0,0.26)] transition-[opacity,transform] duration-500 ease-out sm:p-7 lg:p-8 ${
              showAbout ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: showAbout ? "0.14s" : "0s" }}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(84,184,255,0.12),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(102,119,255,0.1),transparent_22%)]" />
            </div>

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center rounded-full border border-white/14 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c7efff]">
                  Experience
                </span>
                <h3
                  className="mt-5 text-3xl font-bold text-white sm:text-4xl lg:text-[3rem]"
                  style={{
                    fontFamily: "'CreatoDisplay', sans-serif",
                    letterSpacing: "0.03em",
                    textShadow: "0 0 18px rgba(0,153,255,0.14)",
                  }}
                >
                  Client work with cleaner hooks, pacing, and finish.
                </h3>
                <div className="mt-4 h-[4px] w-24 rounded-full bg-[linear-gradient(90deg,#6677ff_0%,#54b8ff_52%,#74ebff_100%)] shadow-[0_0_18px_rgba(84,184,255,0.42)]" />
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/68 sm:text-base">
                  A few recent projects, kept simple and easy to read.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] text-white/58">
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2">
                  2024 - Present
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2">
                  Short + Long-Form
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2">
                  Brand-Aware Delivery
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {experienceEntries.map((experience, index) => {
                const accentClasses =
                  index === 0
                    ? "from-[#54b8ff]/18 via-[#0a1622] to-[#08111a]"
                    : index === 1
                      ? "from-[#6677ff]/18 via-[#0b1420] to-[#08111a]"
                      : "from-[#74ebff]/16 via-[#0b1721] to-[#08111a]";
                const badgeClasses =
                  index === 0
                    ? "text-[#c8f5ff]"
                    : index === 1
                      ? "text-[#d4ddff]"
                      : "text-[#d8ffff]";
                const offsetClass =
                  index === 0 ? "lg:mt-0" : index === 1 ? "lg:mt-10" : "lg:mt-5";

                return (
                  <article
                    key={`${experience.client}-${experience.role}`}
                    className={`group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br ${accentClasses} p-5 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1.5 hover:border-white/18 hover:shadow-[0_18px_40px_rgba(0,0,0,0.24)] sm:p-6 ${offsetClass}`}
                    style={{
                      transitionDelay: showAbout ? `${0.18 + index * 0.06}s` : "0s",
                    }}
                  >
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                      <div className="absolute right-[-14%] top-[-18%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.16)_0%,transparent_72%)] blur-3xl" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-4">
                        <span className={`text-[2.8rem] font-semibold leading-none ${badgeClasses}/20`}>
                          0{index + 1}
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/18 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/58">
                          {experience.period}
                        </span>
                      </div>

                      <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-[#c7efff]/82">
                        {experience.role}
                      </p>
                      <h4 className="mt-2 text-2xl font-semibold text-white">
                        {experience.client}
                      </h4>
                      <p className="mt-4 text-sm leading-relaxed text-white/66">
                        {experience.summary}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {experience.tags.map((tag) => (
                          <span
                            key={`${experience.client}-${tag}`}
                            className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function AboutExperienceListSection({
  aboutRef,
  clientStoriesRef,
  showAbout,
  showClientStories,
  helloVisible,
  aboutFullName,
  onViewClientEdits,
  homeContent,
}: AboutExperienceSectionProps) {
  const creativeLaneIcons = {
    "video-editing": <Film className="h-auto w-4 shrink-0" />,
    "graphic-design": <Palette className="h-auto w-4 shrink-0" />,
    "web-development": <Globe className="h-auto w-4 shrink-0" />,
  };
  const creativeProfileTabs = homeContent.creativeProfile.lanes.map((lane) => ({
    value: lane.value,
    icon: creativeLaneIcons[lane.value],
    label: lane.label,
    content: {
      badge: lane.badge,
      title: lane.title,
      description: lane.description,
      buttonText: lane.buttonText,
      buttonHref: lane.buttonHref,
      imageSrc: lane.imageSrc,
      imageAlt: lane.imageAlt,
    },
  }));
  return (
    <div
      ref={aboutRef}
      className="relative -mt-10 flex flex-col items-center overflow-visible bg-[linear-gradient(180deg,rgba(7,13,22,0.94),rgba(8,15,25,0.9)_42%,rgba(5,10,18,0.96)_100%)] pt-10 transition-all duration-700 ease-out lg:-mt-14 lg:pt-14"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(143,220,255,0.12),transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-2 sm:px-4 lg:px-6">
        <div className="grid gap-10">
          <div
            className={`transform-gpu transition-[opacity,transform] duration-500 ease-out ${
              showAbout ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-[0.985] opacity-0"
            }`}
            style={{ transitionDelay: showAbout ? "0.08s" : "0s" }}
          >
            <Feature108
              badge={null}
              description={null}
              heading={
                <>
                  <span className="font-normal text-white/58">
                    {homeContent.creativeProfile.titleMuted}
                  </span>{" "}
                  <span className="font-bold text-white">
                    {homeContent.creativeProfile.titleStrong}
                  </span>
                </>
              }
              tabs={creativeProfileTabs}
            />
          </div>

          <section
            className={`relative transform-gpu overflow-visible transition-[opacity,transform] duration-500 ease-out ${
              helloVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-[0.985] opacity-0"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-10 bottom-0">
              <div className="absolute left-1/2 top-[-4rem] h-72 w-[82vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.14)_0%,rgba(84,184,255,0.05)_42%,transparent_74%)] blur-3xl" />
              <div className="absolute right-[-4%] top-[18%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(47,125,255,0.14)_0%,rgba(47,125,255,0.045)_40%,transparent_74%)] blur-3xl" />
              <div className="absolute inset-x-[12%] bottom-[8%] h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
            </div>

            <div className="relative left-1/2 z-10 w-screen -translate-x-1/2 px-4 sm:px-8 lg:px-12">
              <LandingAccordionItem
                eyebrow=""
                title={
                  <>
                    <span className="font-normal text-white/58">
                      {homeContent.aboutAccordion.eyebrow || "About Me"}.
                    </span>{" "}
                    <span className="font-bold text-white">
                      {homeContent.aboutAccordion.title || aboutFullName}
                    </span>
                  </>
                }
                description={homeContent.aboutAccordion.description}
                secondaryDescription={homeContent.aboutAccordion.secondaryDescription}
                ctaLabel={homeContent.aboutAccordion.ctaLabel}
                onCtaClick={onViewClientEdits}
                initialActiveIndex={Math.max(
                  0,
                  homeContent.aboutAccordion.items.findIndex((item) => item.title === "Wence")
                )}
                items={homeContent.aboutAccordion.items.map((item, index) => ({
                  id: index + 1,
                  title: item.title,
                  imageUrl: item.imageUrl,
                }))}
              />
            </div>
          </section>

        </div>
      </div>

      <section
        ref={clientStoriesRef}
        className={`relative isolate w-full transform-gpu overflow-hidden bg-[linear-gradient(180deg,rgba(5,10,18,0.96),rgba(8,14,24,0.9)_48%,rgba(5,10,18,0.96)_100%)] pb-10 pt-24 transition-[opacity,transform] duration-500 ease-out sm:pb-12 sm:pt-28 ${
          showClientStories ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-[0.985] opacity-0"
        }`}
        style={{ transitionDelay: showClientStories ? "0.04s" : "0s" }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_6%,rgba(143,220,255,0.1),transparent_58%)]" />
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(143,220,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(143,220,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="absolute left-1/2 top-14 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(43,145,255,0.16)_0%,rgba(43,145,255,0.04)_42%,transparent_72%)] blur-3xl" />
          <div className="absolute inset-x-[18%] top-0 h-px bg-gradient-to-r from-transparent via-[#8fdcff]/18 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10">
          <div
            className={`relative z-10 transform-gpu transition-[opacity,transform] duration-700 ease-out ${
              showClientStories
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-10 scale-[0.985] opacity-0"
            }`}
            style={{ transitionDelay: showClientStories ? "0.08s" : "0s" }}
          >
            <ExperienceTestimonials
              eyebrow={homeContent.experienceSection.eyebrow}
              titleMuted={homeContent.experienceSection.titleMuted}
              titleStrong={homeContent.experienceSection.titleStrong}
              description={homeContent.experienceSection.description}
              cards={homeContent.experienceSection.cards}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [, setTextVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(true);
  const [introDone, setIntroDone] = useState(true);
  const [introPulse, setIntroPulse] = useState(false);
  const [introLogoVisible, setIntroLogoVisible] = useState(true);
  const [introWelcomeVisible, setIntroWelcomeVisible] = useState(true);
  const [introDoorsOpen, setIntroDoorsOpen] = useState(true);
  const [introExit, setIntroExit] = useState(true);
  const [isMotionLite, setIsMotionLite] = useState(() => shouldUseMotionLite());
  const [showAbout, setShowAbout] = useState(false); // scroll-triggered About Me
  const [videoText, setVideoText] = useState("");
  const [graphicText, setGraphicText] = useState("");
const [videoDone, setVideoDone] = useState(false);
const [graphicDone, setGraphicDone] = useState(false);
const [activeBox, setActiveBox] = useState<PortfolioCategoryName>("Video Edit"); // default Projects
const [showPortfolio, setShowPortfolio] = useState(false);
const portfolioShown = useRef(false);
const [showModal, setShowModal] = useState(false);
const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
const [showAddProjectModal, setShowAddProjectModal] = useState(false);
const [addProjectModalVisible, setAddProjectModalVisible] = useState(false);
const [isDetailsModalMounted, setIsDetailsModalMounted] = useState(false);
const [isAddProjectModalMounted, setIsAddProjectModalMounted] = useState(false);
const [newProjectForm, setNewProjectForm] = useState<NewProjectForm>(createEmptyProjectForm());
const [addProjectError, setAddProjectError] = useState("");
const [isAddingProject, setIsAddingProject] = useState(false);


const [animateTab, setAnimateTab] = useState(false);
const [videoCarouselIndexes, setVideoCarouselIndexes] = useState<Record<string, number>>({});
const [selectedVideoProjectKey, setSelectedVideoProjectKey] = useState<string | null>(null);
const [selectedCategoryProjectIndexes, setSelectedCategoryProjectIndexes] = useState<
  Record<PortfolioCategoryName, number>
>({
  "Video Edit": 0,
  "Graphic Design": 0,
  Websites: 0,
});

const portfolioCategories = [
  {
    name: "Video Edit",
    icon: Film,
    description: "Story-driven edits, pacing, transitions, and cinematic cuts.",
  },
  {
    name: "Graphic Design",
    icon: Palette,
    description: "Poster systems, visual branding, and polished design work.",
  },
  {
    name: "Websites",
    icon: Globe,
    description: "Landing pages, web builds, and polished interactive experiences.",
  },
] as const;

type PortfolioProject = {
  title: string;
  description: string;
  image: string;
  designLink: string;
  videoCategory?: string;
  videoParentLabel?: string;
  videoAspectRatio?: "landscape" | "portrait";
  videoUrl?: string;
  videoUrls?: string[];
  videoPosterUrls?: string[];
  showDetailsModal?: boolean;
  details?: {
    title: string;
    description: string;
    heroImage: string;
    galleryImages: string[];
  };
};

type NewProjectForm = {
  title: string;
  description: string;
  image: string;
  designLink: string;
  videoCategory: string;
  videoParentLabel: string;
  videoAspectRatio: "landscape" | "portrait";
  videoUrls: string[];
  showDetailsModal: boolean;
  detailsTitle: string;
  detailsDescription: string;
  detailsHeroImage: string;
  galleryImages: string[];
};

type VideoProjectAspectRatio = "landscape" | "portrait";

const DEFAULT_VIDEO_EDIT_GROUP = "Featured Edits";
const VIDEO_ASPECT_RATIO_OPTIONS: Array<{
  value: VideoProjectAspectRatio;
  label: string;
  description: string;
}> = [
  {
    value: "landscape",
    label: "1920 x 1080",
    description: "Standard horizontal video for long-form content.",
  },
  {
    value: "portrait",
    label: "1080 x 1920",
    description: "Vertical short-form video for reels, shorts, and TikToks.",
  },
];

const getVideoProjectCategory = (project: PortfolioProject) =>
  project.videoCategory?.trim() || project.title?.trim() || DEFAULT_VIDEO_EDIT_GROUP;

const getVideoProjectParentLabel = (
  project: PortfolioProject,
  fallbackGroupName = ""
) => {
  const explicitLabel = project.videoParentLabel?.trim() || "";
  if (explicitLabel) {
    return explicitLabel;
  }

  const legacyCategoryLabel = project.videoCategory?.trim() || "";
  if (legacyCategoryLabel && legacyCategoryLabel !== project.title.trim()) {
    return legacyCategoryLabel;
  }

  const legacyDetailsLabel = project.details?.title?.trim() || "";
  if (
    legacyDetailsLabel &&
    legacyDetailsLabel !== project.title.trim() &&
    legacyDetailsLabel.toLowerCase() !== "project details"
  ) {
    return legacyDetailsLabel;
  }

  const normalizedFallbackGroupName = fallbackGroupName.trim();
  if (normalizedFallbackGroupName && normalizedFallbackGroupName !== project.title.trim()) {
    return normalizedFallbackGroupName;
  }

  return "";
};

const getVideoProjectAspectRatio = (
  project: Pick<PortfolioProject, "videoAspectRatio">
): VideoProjectAspectRatio => {
  const normalizedValue = project.videoAspectRatio?.trim().toLowerCase();
  if (
    normalizedValue === "portrait" ||
    normalizedValue === "1080x1920" ||
    normalizedValue === "9:16" ||
    normalizedValue === "vertical"
  ) {
    return "portrait";
  }

  return "landscape";
};

const getVideoAspectRatioLabel = (aspectRatio: VideoProjectAspectRatio) =>
  aspectRatio === "portrait" ? "1080x1920" : "1920x1080";

const isMp4VideoSource = (value: string) =>
  /^data:video\/mp4/i.test(value) || /\.mp4(?:[?#].*)?$/i.test(value);

const detectAspectRatioFromDimensions = (
  width: number,
  height: number
): VideoProjectAspectRatio | null => {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return height > width ? "portrait" : "landscape";
};

const loadVideoMetadata = (src: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Video metadata can only be checked in the browser."));
      return;
    }

    const video = document.createElement("video");
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      video.onloadedmetadata = null;
      video.onerror = null;
      video.removeAttribute("src");
      video.load();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out while checking the video ratio."));
    }, VIDEO_METADATA_TIMEOUT_MS);

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      cleanup();
      resolve({ width, height });
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("The video could not be loaded to verify its ratio."));
    };
    video.src = src;
  });

const validateVideoSourcesForProject = async (
  videoSources: string[],
  expectedAspectRatio: VideoProjectAspectRatio
) => {
  for (const [index, source] of videoSources.entries()) {
    try {
      const { width, height } = await loadVideoMetadata(source);
      const detectedAspectRatio = detectAspectRatioFromDimensions(width, height);

      if (!detectedAspectRatio) {
        throw new Error("The video ratio could not be detected.");
      }

      if (detectedAspectRatio !== expectedAspectRatio) {
        throw new Error(
          `This clip is ${getVideoAspectRatioLabel(detectedAspectRatio)}, but this project is set to ${getVideoAspectRatioLabel(expectedAspectRatio)}. One Video Edit project can only use one ratio.`
        );
      }
    } catch (error) {
      const prefix = videoSources.length > 1 ? `Clip ${index + 1}: ` : "";
      throw new Error(
        prefix +
          (error instanceof Error
            ? error.message
            : "The video ratio could not be verified.")
      );
    }
  }
};

const getProjectVideoUrls = (project: PortfolioProject) => {
  const uploadedVideoUrls = Array.isArray(project.videoUrls)
    ? project.videoUrls
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    : [];

  if (uploadedVideoUrls.length > 0) {
    return uploadedVideoUrls;
  }

  const trimmedVideoUrl = project.videoUrl?.trim();
  if (trimmedVideoUrl) {
    return [trimmedVideoUrl];
  }

  const trimmedLink = project.designLink?.trim();
  if (!trimmedLink || trimmedLink === "#") {
    return [];
  }

  if (
    /^data:video\//i.test(trimmedLink) ||
    /\.(mp4|webm|ogg|mov)(?:[?#].*)?$/i.test(trimmedLink)
  ) {
    return [trimmedLink];
  }

  return [];
};

const getProjectVideoPosterUrls = (project: PortfolioProject, clipCount: number) => {
  const rawVideoPosterUrls = Array.isArray(project.videoPosterUrls)
    ? project.videoPosterUrls
    : [];
  const normalizedVideoPosterUrls = rawVideoPosterUrls.map((item) =>
    typeof item === "string" ? item.trim() : ""
  );

  if (clipCount <= 0) {
    return normalizedVideoPosterUrls;
  }

  return Array.from({ length: clipCount }, (_, index) => normalizedVideoPosterUrls[index] || "");
};

const buildVideoProjectKey = (project: PortfolioProject, projectIndex: number) => {
  const categoryName = getVideoProjectCategory(project);
  return `${categoryName}-${project.title || "video-project"}-${projectIndex}`;
};

const groupVideoProjects = (projects: PortfolioProject[]) => {
  return projects.map((project, projectIndex) => {
    const categoryName = getVideoProjectCategory(project);
    const projectKey = buildVideoProjectKey(project, projectIndex);
    const projectVideoUrls = getProjectVideoUrls(project);
    const clipsToAdd = projectVideoUrls.length > 0 ? projectVideoUrls : [""];
    const projectVideoPosterUrls = getProjectVideoPosterUrls(project, clipsToAdd.length);
    const projectVideoAspectRatio = getVideoProjectAspectRatio(project);
    const previewImage =
      project.image || projectVideoPosterUrls.find((item) => item.trim().length > 0) || "";

    return {
      key: projectKey,
      name: categoryName,
      project,
      aspectRatio: projectVideoAspectRatio,
      previewImage,
      clips: clipsToAdd.map((videoUrl, index) => ({
        key: `${projectKey}-${index}-${videoUrl || "empty"}`,
        project,
        videoUrl,
        posterUrl: projectVideoPosterUrls[index] || "",
        clipIndex: index,
        clipCount: clipsToAdd.length,
      })),
    };
  });
};

type ContactFormState = {
  name: string;
  email: string;
  serviceType: string;
  videoEditType: string;
  message: string;
};

type ContactSelectOption = {
  value: string;
  label: string;
  description: string;
};

type RateTableRow = {
  label: string;
  price: string;
  details?: string;
};

type RateCategory = "video-edit" | "graphic-design";

const getDefaultContactFormState = (): ContactFormState => ({
  name: "",
  email: "",
  serviceType: "",
  videoEditType: "",
  message: "",
});

const contactServiceOptions: ContactSelectOption[] = [
  {
    value: "video-edit",
    label: "Video edit",
    description: "Cuts, pacing, motion, captions, and story flow.",
  },
  {
    value: "graphic-design",
    label: "Graphic design",
    description: "Posters, visuals, layouts, and branded creative assets.",
  },
];

const videoEditTypeOptions: ContactSelectOption[] = [
  {
    value: "long-form",
    label: "Long-form edits",
    description: "YouTube videos, interviews, vlogs, and full-length content.",
  },
  {
    value: "short-form",
    label: "Short-form edits",
    description: "Reels, TikToks, Shorts, and quick vertical content.",
  },
];

const videoEditingRateRows: RateTableRow[] = [
  {
    label: "Long-form videos",
    price: "$80 - $120",
    details:
      "Clean cuts and pacing, audio sync and cleanup, basic color correction, light motion graphics, and optional simple captions.",
  },
  {
    label: "Short-form basic edit",
    price: "$10 - $25",
    details: "Jump cuts, basic captions, and light zooms.",
  },
  {
    label: "Short-form engaging edit",
    price: "$25 - $50",
    details:
      "Dynamic captions, zooms and sound effects, B-roll inserts, and fast-paced editing.",
  },
  {
    label: "Short-form high-end",
    price: "$50 - $100",
    details:
      "Custom animations, advanced transitions, visual storytelling edits, and branded style.",
  },
];

const bundleRateRows: RateTableRow[] = [
  {
    label: "1 long video + 3 shorts",
    price: "$140 - $180",
  },
  {
    label: "1 long video + 5 shorts",
    price: "$180 - $250",
  },
  {
    label: "Monthly packages",
    price: "Custom",
    details: "Flexible monthly pricing based on volume and turnaround.",
  },
];

const addOnRateRows: RateTableRow[] = [
  {
    label: "Subtitles",
    price: "+$10 - $25",
    details: "Full-video subtitles.",
  },
  {
    label: "Thumbnail design",
    price: "+$10 - $20",
  },
  {
    label: "Fast delivery",
    price: "+$20 - $40",
    details: "24-48 hour turnaround.",
  },
  {
    label: "Extra revisions",
    price: "+$10",
  },
];

const graphicDesignPosterRows: RateTableRow[] = [
  {
    label: "Social media poster - Basic",
    price: "$20 - $40",
    details: "Simple layout for clean, quick poster graphics.",
  },
  {
    label: "Social media poster - Branded / Mid-tier",
    price: "$40 - $80",
    details: "More polished branded visuals with stronger composition and styling.",
  },
  {
    label: "Social media poster - High-end / Ads / Premium",
    price: "$80 - $120",
    details: "Ad-ready creative with premium layout, stronger hierarchy, and visual polish.",
  },
  {
    label: "Social media post - Single post",
    price: "$35 - $60",
    details: "One designed social post tailored to your brand or campaign.",
  },
  {
    label: "Social media post - Carousel",
    price: "$60 - $100",
    details: "Multi-slide carousel built for engagement and clear storytelling.",
  },
];

const graphicDesignBrandRows: RateTableRow[] = [
  {
    label: "YouTube thumbnail - Standard",
    price: "$10 - $25",
    details: "Clean thumbnail design with readable text and a strong focal point.",
  },
  {
    label: "YouTube thumbnail - High CTR / Advanced",
    price: "$25 - $50",
    details: "More refined thumbnail treatment focused on higher click-through appeal.",
  },
  {
    label: "Logo design - Basic",
    price: "$30 - $80",
    details: "Simple logo concept for a straightforward visual identity.",
  },
  {
    label: "Logo design - Premium",
    price: "$80 - $150",
    details: "More developed logo work with stronger refinement and presentation.",
  },
  {
    label: "Brand kit",
    price: "$100 - $250",
    details: "Logo, color palette, and font direction in one brand-ready package.",
  },
];

const graphicDesignMarketingRows: RateTableRow[] = [
  {
    label: "Marketing materials - Posters / Flyers",
    price: "$20 - $60",
    details: "Promotional layouts for events, announcements, and campaigns.",
  },
  {
    label: "Marketing materials - Banners",
    price: "$15 - $40",
    details: "Channel art, Facebook banners, and similar wide-format headers.",
  },
  {
    label: "Marketing materials - Presentation slides",
    price: "$20 - $60",
    details: "Slides with cleaner structure, readability, and visual consistency.",
  },
];

const rateNotes = [
  "Prices may vary depending on complexity.",
  "Discounts are available for bulk and long-term clients.",
  "1-2 revisions are included.",
] as const;

const graphicDesignRateNotes = [
  "Prices may vary depending on design complexity and turnaround.",
  "Bundle discounts are available for recurring content or brand work.",
  "Revisions can be adjusted depending on the scope of the project.",
] as const;

type HeroSignatureFrame = {
  key: string;
  side: "left" | "right";
  topRange: readonly [number, number];
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

type HeroMarkerLayout = {
  circleX: number;
  circleY: number;
  bendX: number;
  bendY: number;
  anchorX: number;
  anchorY: number;
};

const heroSignatureFrames: readonly HeroSignatureFrame[] = [
  {
    key: "pacing",
    side: "left",
    topRange: [47, 52] as const,
    title: "Cinematic pacing",
    description: "Cuts shaped around rhythm, scene flow, and cleaner transitions.",
    icon: Film,
  },
  {
    key: "identity",
    side: "left",
    topRange: [92, 96] as const,
    title: "Brand-first visuals",
    description: "Layouts and posters polished to feel sharp, intentional, and clear.",
    icon: Palette,
  },
  {
    key: "hook",
    side: "right",
    topRange: [52, 58] as const,
    title: "Social content hooks",
    description: "Visual decisions built to catch attention fast without losing clarity.",
    icon: Globe,
  },
  {
    key: "finish",
    side: "right",
    topRange: [94, 98] as const,
    title: "Signature finish",
    description: "A final layer of refinement that keeps the work memorable.",
    icon: Medal,
  },
] as const;

const createHeroMarkerLayouts = (): HeroMarkerLayout[] => {
  const leftMarkerConfigs = [
    { circleX: 8.5, bendX: 18.5, anchorX: 42.5, anchorY: 74 },
    { circleX: 30.5, bendX: 36.5, anchorX: 54.5, anchorY: 103 },
  ] as const;

  const rightMarkerConfigs = [
    { circleX: 89.5, bendX: 79.5, anchorX: 58.5, anchorY: 75.5 },
    { circleX: 67.5, bendX: 61.5, anchorX: 46.5, anchorY: 104 },
  ] as const;

  return heroSignatureFrames.map((frame, index) => {
    const [minTop, maxTop] = frame.topRange;
    const circleY = Math.round((minTop + maxTop) / 2);

    if (frame.side === "left") {
      const config = leftMarkerConfigs[index];
      return {
        circleX: config.circleX,
        circleY,
        bendX: config.bendX,
        bendY: circleY,
        anchorX: config.anchorX,
        anchorY: config.anchorY,
      };
    }

    const config = rightMarkerConfigs[index - leftMarkerConfigs.length];
    return {
      circleX: config.circleX,
      circleY,
      bendX: config.bendX,
      bendY: circleY,
      anchorX: config.anchorX,
      anchorY: config.anchorY,
    };
  });
};

type ContactSelectProps = {
  label: string;
  placeholder: string;
  value: string;
  options: ContactSelectOption[];
  onChange: (value: string) => void;
};

function ContactSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
}: ContactSelectProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative z-20">
        <Listbox.Button className="group relative w-full overflow-hidden rounded-[24px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-4 py-3 text-left shadow-[0_14px_34px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-[border-color,background-color,box-shadow,transform] duration-180 ease-out hover:border-[#54cfff]/40 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] focus:outline-none focus-visible:border-[#77dbff]/60 focus-visible:ring-2 focus-visible:ring-[#3ecfff]/25">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,212,255,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_60%)] opacity-80" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#8fdcff]">
                {label}
              </p>
              <p
                className={`mt-1 text-sm font-medium transition-colors ${
                  selectedOption ? "text-white" : "text-white/42"
                }`}
              >
                {selectedOption?.label || placeholder}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/48">
                {selectedOption?.description || "Choose the option that fits your project."}
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white/72 transition-[border-color,color,transform] duration-180 ease-out group-hover:border-[#61d4ff]/35 group-hover:text-[#b5ecff]">
              <ChevronDown className="h-4 w-4 transition-transform duration-180 ease-out group-data-[headlessui-state=open]:rotate-180" />
            </span>
          </div>
        </Listbox.Button>

        <Transition
          as={Fragment}
          enter="transition duration-200 ease-out"
          enterFrom="translate-y-2 opacity-0 scale-[0.98]"
          enterTo="translate-y-0 opacity-100 scale-100"
          leave="transition duration-150 ease-in"
          leaveFrom="translate-y-0 opacity-100 scale-100"
          leaveTo="translate-y-1 opacity-0 scale-[0.99]"
        >
          <Listbox.Options className="absolute left-0 right-0 z-30 mt-3 space-y-2 rounded-[24px] border border-white/14 bg-[linear-gradient(180deg,rgba(9,16,27,0.96),rgba(5,9,16,0.98))] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl focus:outline-none">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  `cursor-pointer rounded-[18px] border px-4 py-3 transition-all duration-200 ${
                    active
                      ? "border-[#59d4ff]/35 bg-[#0b1d30] shadow-[0_10px_28px_rgba(0,153,255,0.14)]"
                      : "border-transparent bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                  }`
                }
              >
                {({ selected }) => (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${
                          selected ? "text-[#aeeeff]" : "text-white"
                        }`}
                      >
                        {option.label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-white/50">
                        {option.description}
                      </p>
                    </div>
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                        selected
                          ? "border-[#63dbff]/45 bg-[#0d3244] text-[#baf2ff]"
                          : "border-white/10 bg-white/[0.03] text-transparent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

type CompactRateTableProps = {
  title: string;
  subtitle?: string;
  rows: RateTableRow[];
  onRowSelect?: (row: RateTableRow) => void;
  isVisible?: boolean;
  animationDelayMs?: number;
};

function CompactRateTable({
  title,
  subtitle,
  rows,
  onRowSelect,
  isVisible = true,
  animationDelayMs = 0,
}: CompactRateTableProps) {
  const isInteractive = Boolean(onRowSelect);

  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
    row: RateTableRow
  ) => {
    if (!onRowSelect) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowSelect(row);
    }
  };

  return (
    <div
      className={`transform-gpu overflow-hidden rounded-[20px] border border-white/10 bg-black/18 transition-[opacity,transform] duration-280 ease-out will-change-transform ${
        isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0"
      }`}
      style={{ transitionDelay: `${animationDelayMs}ms` }}
    >
      <div className="border-b border-white/8 px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#8fdcff]">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-1 text-[11px] leading-relaxed text-white/50">
            {subtitle}
          </p>
        ) : null}
        {isInteractive ? (
          <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/30">
            Click a rate to start a message
          </p>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-[11px] text-white/78">
          <thead className="bg-white/[0.03] text-white/42">
            <tr>
              <th className="px-4 py-2 font-medium">Item</th>
              <th className="px-4 py-2 text-right font-medium">Rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${title}-${row.label}`}
                className={`border-t border-white/6 align-top transition-all duration-200 ${
                  isInteractive
                    ? "cursor-pointer outline-none hover:bg-[#0a1723] focus:bg-[#0a1723]"
                    : ""
                }`}
                onClick={() => onRowSelect?.(row)}
                onKeyDown={(event) => handleRowKeyDown(event, row)}
                role={isInteractive ? "button" : undefined}
                tabIndex={isInteractive ? 0 : undefined}
                aria-label={
                  isInteractive ? `Select ${row.label} priced at ${row.price}` : undefined
                }
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-white/88">{row.label}</p>
                  {row.details ? (
                    <p className="mt-1 leading-relaxed text-white/46">
                      {row.details}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#b8efff]">
                  <span>{row.price}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type SocialLink = {
  label: string;
  handle: string;
  description: string;
  href?: string;
  options?: Array<{
    label: string;
    href: string;
  }>;
};

type BackgroundLogoLabel = SocialLink["label"] | "Upwork" | "Fiverr" | "LinkedIn";

function PlatformBackgroundLogo({
  label,
  className,
}: {
  label: BackgroundLogoLabel;
  className?: string;
}) {
  if (label === "Facebook") {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
        <path
          d="M37.8 56V35.3h6.9l1-8.2h-7.9v-5.2c0-2.4.7-4 4-4h4.3v-7.1c-.8-.1-3.1-.3-5.9-.3-5.8 0-9.8 3.6-9.8 10.2v6.6h-6.6v8.2h6.6V56h7.4Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (label === "Instagram") {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
        <rect x="12" y="12" width="40" height="40" rx="12" stroke="currentColor" strokeWidth="4" />
        <circle cx="32" cy="32" r="9" stroke="currentColor" strokeWidth="4" />
        <circle cx="44.5" cy="19.5" r="2.5" fill="currentColor" />
      </svg>
    );
  }

  if (label === "LinkedIn") {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
        <rect x="12" y="12" width="40" height="40" rx="10" stroke="currentColor" strokeWidth="4" />
        <circle cx="23" cy="24" r="2.8" fill="currentColor" />
        <path d="M23 30V45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path
          d="M33 45V30M33 34.5C34.8 31.5 37.2 30 40.1 30C44.3 30 47 33 47 38.3V45"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (label === "Upwork") {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
        <path
          d="M16 21v12.2c0 5 3.6 8.8 8.7 8.8s8.7-3.8 8.7-8.8V21"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M39 24.5v26"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M39 31.5c1.9-3.4 4.8-5.2 8.4-5.2 5 0 8.6 3.7 8.6 8.6S52.4 43.5 47.4 43.5c-3.6 0-6.4-1.6-8.4-4.8"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (label === "Fiverr") {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
        <circle cx="43.5" cy="19.5" r="3.5" fill="currentColor" />
        <path
          d="M22 47V28.5C22 22.4 25.8 19 31.4 19h8.6"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 31h22"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (label === "TikTok") {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
        <path
          d="M39.6 18.2c2.1 2 4.4 3.3 7 3.8v6.1c-2.8-.1-5.6-1-8-2.6V37c0 8.8-7.1 15.9-15.9 15.9-3.4 0-6.5-1-9.1-2.9a16 16 0 0 0 7.9 1.2c5.1-.6 9-5 9-10.2V11.4h9.1v6.8Z"
          fill="currentColor"
        />
        <path
          d="M27.4 24.1a9.2 9.2 0 0 0-8.3 9.2c0 2.9 1.3 5.4 3.3 7.1a8.7 8.7 0 0 1-1-4c0-4.5 3-8.3 7.2-9.4v-2.9c-.4 0-.8 0-1.2 0Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return null;
}

function createEmptyProjectForm(): NewProjectForm {
  return {
    title: "",
    description: "",
    image: "",
    designLink: "",
    videoCategory: "",
    videoParentLabel: "",
    videoAspectRatio: "landscape",
    videoUrls: [""],
    showDetailsModal: true,
    detailsTitle: "",
    detailsDescription: "",
    detailsHeroImage: "",
    galleryImages: [""],
  };
}

const initialPortfolioProjects: Record<string, PortfolioProject[]> = {
  "Graphic Design": [
    {
      title: "COMRADZ Sessions",
      description:
        "A weekly poster designed to showcase the details of our Sunday dance sessions. Each poster highlights the schedule, theme, and key information for the day’s session, making it easy for participants to stay informed and join in. The design aims to be clear, engaging, and consistent, creating a recognizable visual identity for COMRADZ’s weekly gatherings.",
      image: "/comradz.png",
      designLink: "#",
      showDetailsModal: true,
      details: {
        title: "COMRADZ Sessions",
        description:
          "A weekly poster designed to showcase the details of our Sunday dance sessions. Each poster highlights the schedule, theme, and key information for the day’s session, making it easy for participants to stay informed and join in. The design aims to be clear, engaging, and consistent, creating a recognizable visual identity for COMRADZ’s weekly gatherings.",
        heroImage: "/comradz2.png",
        galleryImages: ["/image1.png", "/image2.png", "/image3.png", "/image4.png"],
      },
    },
    {
      title: "Project Two",
      description: "Description of Project Two",
      image: "/comradz.png",
      designLink: "#",
    },
    {
      title: "Project Three",
      description: "Description of Project Three",
      image: "/comradz.png",
      designLink: "#",
    },
  ],
  "Video Edit": defaultPortfolioProjects["Video Edit"],
  Websites: [],
};

const [portfolioProjects, setPortfolioProjects] = useState<Record<string, PortfolioProject[]>>(
  initialPortfolioProjects
);
const [experienceEntries, setExperienceEntries] = useState<CreativeExperienceEntry[]>(() => {
  if (typeof window === "undefined") {
    return defaultExperienceEntries;
  }

  try {
    const raw = window.localStorage.getItem(EXPERIENCE_STORAGE_KEY);
    if (!raw) {
      return defaultExperienceEntries;
    }

    return normalizeExperienceEntries(JSON.parse(raw));
  } catch {
    return defaultExperienceEntries;
  }
});
const [experienceContentVersion, setExperienceContentVersion] = useState(() => {
  if (typeof window === "undefined") {
    return "";
  }

  return getStoredExperienceContentVersion();
});
const [homeContent, setHomeContent] = useState(() => {
  if (typeof window === "undefined") {
    return defaultHomeContent;
  }

  try {
    const raw = window.localStorage.getItem(HOME_CONTENT_STORAGE_KEY);
    return raw ? parseHomeContent(raw) : defaultHomeContent;
  } catch {
    return defaultHomeContent;
  }
});
const [, setHomeContentVersion] = useState(() => {
  if (typeof window === "undefined") {
    return "";
  }

  return getStoredHomeContentVersion();
});

const normalizeStoredProjects = (value: unknown): Record<string, PortfolioProject[]> => {
  if (!value || typeof value !== "object") {
    return initialPortfolioProjects;
  }

  const raw = value as Record<string, unknown>;
  return {
    "Graphic Design": Array.isArray(raw["Graphic Design"])
      ? (raw["Graphic Design"] as PortfolioProject[])
      : initialPortfolioProjects["Graphic Design"],
    "Video Edit": Array.isArray(raw["Video Edit"])
      ? (raw["Video Edit"] as PortfolioProject[])
      : initialPortfolioProjects["Video Edit"],
    Websites: Array.isArray(raw.Websites)
      ? (raw.Websites as PortfolioProject[])
      : Array.isArray(raw.Certificates)
        ? (raw.Certificates as PortfolioProject[])
        : initialPortfolioProjects.Websites,
  };
};

  // About Me typing + slide-in
const [helloVisible, setHelloVisible] = useState(false); // slide in from left
const [nameText, setNameText] = useState("");
const [nameDone, setNameDone] = useState(false); // new
const [modalVisible, setModalVisible] = useState(false);
const [showReviewsIntro, setShowReviewsIntro] = useState(false);
const [showReviewsTestimonials, setShowReviewsTestimonials] = useState(false);
const [showContactForm, setShowContactForm] = useState(false);
const [showRates, setShowRates] = useState(false);
const [activeRateCategory, setActiveRateCategory] = useState<RateCategory>("video-edit");
const [isContactFormMounted, setIsContactFormMounted] = useState(false);
const [isContactFormVisible, setIsContactFormVisible] = useState(false);
const [isRatesPanelMounted, setIsRatesPanelMounted] = useState(false);
const [isRatesPanelVisible, setIsRatesPanelVisible] = useState(false);
const [showTikTokModal, setShowTikTokModal] = useState(false);
const [isTikTokBubbleMounted, setIsTikTokBubbleMounted] = useState(false);
const [isTikTokBubbleVisible, setIsTikTokBubbleVisible] = useState(false);
const [activeHeroMarker, setActiveHeroMarker] = useState<number | null>(null);
const [selectedRateSummary, setSelectedRateSummary] = useState("");
const [contactForm, setContactForm] = useState<ContactFormState>(getDefaultContactFormState);
const [contactSubmitState, setContactSubmitState] = useState<{
  status: "idle" | "sending" | "success" | "error";
  message: string;
}>({
  status: "idle",
  message: "",
});
const reviewsRevealHasRun = useRef(false);




  const videoFullText = "VIDEO EDITOR";
  const graphicFullText = "GRAPHIC DESIGNER";
const aboutFullName = "Wence Dante De Vera";

const tikTokBubbleRef = useRef<HTMLDivElement>(null);
const contactMessageCardRef = useRef<HTMLDivElement>(null);
const contactMessageRef = useRef<HTMLTextAreaElement>(null);
const shouldFocusContactMessageRef = useRef(false);
const videoProjectViewerRef = useRef<HTMLDivElement>(null);
const projectRailViewportRef = useRef<HTMLDivElement>(null);
const heroMarkerLayouts = createHeroMarkerLayouts();


  const hasRun = useRef(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const clientStoriesRef = useRef<HTMLElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

const [activeSection, setActiveSection] = useState("home");
const activeSectionRef = useRef("home");
const [showClientStories, setShowClientStories] = useState(false);
  const [, setLogoTapCount] = useState(0);
  const logoTapResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  if (typeof window === "undefined") return;

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const applyMotionMode = () => {
    const nextMotionLite = shouldUseMotionLite();
    setIsMotionLite(nextMotionLite);
    document.documentElement.classList.toggle("motion-lite", nextMotionLite);
    document.body.classList.toggle("motion-lite", nextMotionLite);
  };

  applyMotionMode();
  window.addEventListener("resize", applyMotionMode, { passive: true });

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", applyMotionMode);
    return () => {
      mediaQuery.removeEventListener("change", applyMotionMode);
      window.removeEventListener("resize", applyMotionMode);
      document.documentElement.classList.remove("motion-lite");
      document.body.classList.remove("motion-lite");
    };
  }

  mediaQuery.addListener(applyMotionMode);
  return () => {
    mediaQuery.removeListener(applyMotionMode);
    window.removeEventListener("resize", applyMotionMode);
    document.documentElement.classList.remove("motion-lite");
    document.body.classList.remove("motion-lite");
  };
}, []);

useEffect(() => {
  if (!portfolioRef.current) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !portfolioShown.current) {
          setShowPortfolio(true);
          portfolioShown.current = true;
        }
      });
    },
    { threshold: 0.3 } // triggers when 30% of section is visible
  );

  observer.observe(portfolioRef.current);

  return () => observer.disconnect();
}, []);

useEffect(() => {
  if (!reviewsRef.current) return;

  let testimonialsTimer: ReturnType<typeof setTimeout> | null = null;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !reviewsRevealHasRun.current) {
          reviewsRevealHasRun.current = true;
          setShowReviewsIntro(true);
          testimonialsTimer = setTimeout(() => {
            setShowReviewsTestimonials(true);
          }, 380);
        }
      });
    },
    { threshold: 0.28 }
  );

  observer.observe(reviewsRef.current);

  return () => {
    observer.disconnect();
    if (testimonialsTimer) clearTimeout(testimonialsTimer);
  };
}, []);

useEffect(() => {
  if (typeof window === "undefined") return;

  const syncPortfolioFromStorage = () => {
    try {
      const raw = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (!raw) {
        window.localStorage.setItem(
          PORTFOLIO_STORAGE_KEY,
          JSON.stringify(initialPortfolioProjects)
        );
        setPortfolioProjects(initialPortfolioProjects);
        return;
      }
      const parsed = JSON.parse(raw);
      setPortfolioProjects(normalizeStoredProjects(parsed));
    } catch {
      setPortfolioProjects(initialPortfolioProjects);
    }
  };

  syncPortfolioFromStorage();
  window.addEventListener("storage", syncPortfolioFromStorage);
  window.addEventListener(
    PORTFOLIO_UPDATED_EVENT,
    syncPortfolioFromStorage as EventListener
  );

  return () => {
    window.removeEventListener("storage", syncPortfolioFromStorage);
    window.removeEventListener(
      PORTFOLIO_UPDATED_EVENT,
      syncPortfolioFromStorage as EventListener
    );
  };
}, []);

useEffect(() => {
  if (typeof window === "undefined") return;

  const syncExperienceFromStorage = () => {
    try {
      const raw = window.localStorage.getItem(EXPERIENCE_STORAGE_KEY);
      const storedVersion = getStoredExperienceContentVersion();
      if (!raw) {
        window.localStorage.setItem(
          EXPERIENCE_STORAGE_KEY,
          JSON.stringify(defaultExperienceEntries)
        );
        setExperienceEntries(defaultExperienceEntries);
        setExperienceContentVersion(storedVersion);
        return;
      }

      setExperienceEntries(normalizeExperienceEntries(JSON.parse(raw)));
      setExperienceContentVersion(storedVersion);
    } catch {
      setExperienceEntries(defaultExperienceEntries);
      setExperienceContentVersion("");
    }
  };

  syncExperienceFromStorage();
  window.addEventListener("storage", syncExperienceFromStorage);
  window.addEventListener(
    EXPERIENCE_UPDATED_EVENT,
    syncExperienceFromStorage as EventListener
  );
  window.addEventListener("focus", syncExperienceFromStorage);
  window.addEventListener("pageshow", syncExperienceFromStorage as EventListener);
  document.addEventListener("visibilitychange", syncExperienceFromStorage);
  const syncChannel =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(PORTFOLIO_SYNC_CHANNEL_NAME)
      : null;
  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      const payload = event.data as {
        type?: string;
        experienceEntries?: unknown;
        updatedAt?: string;
      };

      if (payload?.type !== "experience-updated") {
        return;
      }

      const nextExperienceEntries = normalizeExperienceEntries(
        payload.experienceEntries
      );
      setExperienceEntries(nextExperienceEntries);
      setExperienceContentVersion(payload.updatedAt || "");

      try {
        window.localStorage.setItem(
          EXPERIENCE_STORAGE_KEY,
          JSON.stringify(nextExperienceEntries)
        );
        if (payload.updatedAt) {
          window.localStorage.setItem(
            EXPERIENCE_CONTENT_UPDATED_AT_KEY,
            payload.updatedAt
          );
          window.localStorage.setItem(
            PORTFOLIO_CONTENT_UPDATED_AT_KEY,
            payload.updatedAt
          );
        }
      } catch {
        // ignore storage write errors
      }
    };
  }

  return () => {
    window.removeEventListener("storage", syncExperienceFromStorage);
    window.removeEventListener(
      EXPERIENCE_UPDATED_EVENT,
      syncExperienceFromStorage as EventListener
    );
    window.removeEventListener("focus", syncExperienceFromStorage);
    window.removeEventListener("pageshow", syncExperienceFromStorage as EventListener);
    document.removeEventListener("visibilitychange", syncExperienceFromStorage);
    syncChannel?.close();
  };
}, []);

useEffect(() => {
  if (typeof window === "undefined") return;

  const syncHomeContentFromStorage = () => {
    try {
      const raw = window.localStorage.getItem(HOME_CONTENT_STORAGE_KEY);
      const storedVersion = getStoredHomeContentVersion();
      if (!raw) {
        window.localStorage.setItem(
          HOME_CONTENT_STORAGE_KEY,
          JSON.stringify(defaultHomeContent)
        );
        setHomeContent(defaultHomeContent);
        setHomeContentVersion(storedVersion);
        return;
      }

      setHomeContent(parseHomeContent(raw));
      setHomeContentVersion(storedVersion);
    } catch {
      setHomeContent(defaultHomeContent);
      setHomeContentVersion("");
    }
  };

  syncHomeContentFromStorage();
  window.addEventListener("storage", syncHomeContentFromStorage);
  window.addEventListener(
    HOME_CONTENT_UPDATED_EVENT,
    syncHomeContentFromStorage as EventListener
  );
  window.addEventListener("focus", syncHomeContentFromStorage);
  window.addEventListener("pageshow", syncHomeContentFromStorage as EventListener);
  document.addEventListener("visibilitychange", syncHomeContentFromStorage);

  const syncChannel =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(PORTFOLIO_SYNC_CHANNEL_NAME)
      : null;
  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      const payload = event.data as {
        type?: string;
        homeContent?: unknown;
        updatedAt?: string;
      };

      if (payload?.type !== "home-content-updated") {
        return;
      }

      const nextHomeContent = normalizeHomeContent(payload.homeContent);
      setHomeContent(nextHomeContent);
      setHomeContentVersion(payload.updatedAt || "");

      try {
        window.localStorage.setItem(
          HOME_CONTENT_STORAGE_KEY,
          JSON.stringify(nextHomeContent)
        );
        if (payload.updatedAt) {
          window.localStorage.setItem(HOME_CONTENT_UPDATED_AT_KEY, payload.updatedAt);
          window.localStorage.setItem(PORTFOLIO_CONTENT_UPDATED_AT_KEY, payload.updatedAt);
        }
      } catch {
        // ignore storage write errors
      }
    };
  }

  return () => {
    window.removeEventListener("storage", syncHomeContentFromStorage);
    window.removeEventListener(
      HOME_CONTENT_UPDATED_EVENT,
      syncHomeContentFromStorage as EventListener
    );
    window.removeEventListener("focus", syncHomeContentFromStorage);
    window.removeEventListener("pageshow", syncHomeContentFromStorage as EventListener);
    document.removeEventListener("visibilitychange", syncHomeContentFromStorage);
    syncChannel?.close();
  };
}, []);

useEffect(() => {
  if (typeof window === "undefined") return;

  let cancelled = false;
  const syncPortfolioFromSupabase = async () => {
    const remoteContent = await fetchPortfolioContentFromSupabase();
    if (!remoteContent || cancelled) return;

    const localPortfolioUpdatedAtValue = window.localStorage.getItem(
      PORTFOLIO_CONTENT_UPDATED_AT_KEY
    );
    const localExperienceUpdatedAtValue = getStoredExperienceContentVersion();
    const localHomeUpdatedAtValue = getStoredHomeContentVersion();
    const localPortfolioUpdatedAt = localPortfolioUpdatedAtValue
      ? Date.parse(localPortfolioUpdatedAtValue)
      : Number.NaN;
    const localExperienceUpdatedAt = localExperienceUpdatedAtValue
      ? Date.parse(localExperienceUpdatedAtValue)
      : Number.NaN;
    const localHomeUpdatedAt = localHomeUpdatedAtValue
      ? Date.parse(localHomeUpdatedAtValue)
      : Number.NaN;
    const remoteUpdatedAt = remoteContent.updatedAt
      ? Date.parse(remoteContent.updatedAt)
      : Number.NaN;
    const hasLocalPortfolioUpdatedAt = Number.isFinite(localPortfolioUpdatedAt);
    const hasLocalExperienceUpdatedAt = Number.isFinite(localExperienceUpdatedAt);
    const hasLocalHomeUpdatedAt = Number.isFinite(localHomeUpdatedAt);
    const hasRemoteUpdatedAt = Number.isFinite(remoteUpdatedAt);
    const shouldApplyRemoteProjects = hasRemoteUpdatedAt
      ? !hasLocalPortfolioUpdatedAt || remoteUpdatedAt >= localPortfolioUpdatedAt
      : !hasLocalPortfolioUpdatedAt;
    const remoteExperienceEntries =
      remoteContent.experienceEntriesSyncSupported !== false
        ? parseExperienceEntries(remoteContent.experienceEntries)
        : null;
    const remoteHomeContent =
      remoteContent.homeContentSyncSupported !== false
        ? normalizeHomeContent(remoteContent.homeContent)
        : null;
    const shouldApplyRemoteHomeContent =
      remoteHomeContent !== null &&
      (hasRemoteUpdatedAt
        ? !hasLocalHomeUpdatedAt || remoteUpdatedAt >= localHomeUpdatedAt
        : !hasLocalHomeUpdatedAt);
    let localExperienceEntries = defaultExperienceEntries;

    try {
      const storedExperienceEntries = window.localStorage.getItem(EXPERIENCE_STORAGE_KEY);
      if (storedExperienceEntries) {
        localExperienceEntries = normalizeExperienceEntries(JSON.parse(storedExperienceEntries));
      }
    } catch {
      localExperienceEntries = defaultExperienceEntries;
    }

    const remoteExperienceImageCount = countUsableExperienceImages(remoteExperienceEntries ?? []);
    const localExperienceImageCount = countUsableExperienceImages(localExperienceEntries);
    const shouldKeepLocalExperienceImages =
      remoteExperienceEntries !== null &&
      remoteExperienceImageCount < localExperienceImageCount;
    const shouldApplyRemoteExperience =
      remoteExperienceEntries !== null &&
      !shouldKeepLocalExperienceImages &&
      (hasRemoteUpdatedAt
        ? !hasLocalExperienceUpdatedAt || remoteUpdatedAt >= localExperienceUpdatedAt
        : !hasLocalExperienceUpdatedAt);

    if (!shouldApplyRemoteProjects && !shouldApplyRemoteExperience && !shouldApplyRemoteHomeContent) {
      return;
    }

    if (shouldApplyRemoteProjects) {
      const normalizedProjects = normalizeStoredProjects(remoteContent.projects);
      setPortfolioProjects(normalizedProjects);
      try {
        window.localStorage.setItem(
          PORTFOLIO_STORAGE_KEY,
          JSON.stringify(normalizedProjects)
        );
        if (remoteContent.updatedAt) {
          window.localStorage.setItem(
            PORTFOLIO_CONTENT_UPDATED_AT_KEY,
            remoteContent.updatedAt
          );
        }
        window.dispatchEvent(new Event(PORTFOLIO_UPDATED_EVENT));
      } catch {
        // ignore storage write errors
      }
    }

    if (shouldApplyRemoteExperience && remoteExperienceEntries) {
      setExperienceEntries(remoteExperienceEntries);
      setExperienceContentVersion(remoteContent.updatedAt || "");
      try {
        window.localStorage.setItem(
          EXPERIENCE_STORAGE_KEY,
          JSON.stringify(remoteExperienceEntries)
        );
        if (remoteContent.updatedAt) {
          window.localStorage.setItem(
            EXPERIENCE_CONTENT_UPDATED_AT_KEY,
            remoteContent.updatedAt
          );
        }
        window.dispatchEvent(new Event(EXPERIENCE_UPDATED_EVENT));
      } catch {
        // ignore storage write errors
      }
    }

    if (shouldApplyRemoteHomeContent && remoteHomeContent) {
      setHomeContent(remoteHomeContent);
      setHomeContentVersion(remoteContent.updatedAt || "");
      try {
        window.localStorage.setItem(
          HOME_CONTENT_STORAGE_KEY,
          JSON.stringify(remoteHomeContent)
        );
        if (remoteContent.updatedAt) {
          window.localStorage.setItem(HOME_CONTENT_UPDATED_AT_KEY, remoteContent.updatedAt);
        }
        window.dispatchEvent(new Event(HOME_CONTENT_UPDATED_EVENT));
      } catch {
        // ignore storage write errors
      }
    }
  };

  void syncPortfolioFromSupabase();
  const handleWindowFocus = () => {
    void syncPortfolioFromSupabase();
  };
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      void syncPortfolioFromSupabase();
    }
  };
  const handlePageShow = () => {
    void syncPortfolioFromSupabase();
  };
  window.addEventListener("focus", handleWindowFocus);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pageshow", handlePageShow);

  return () => {
    cancelled = true;
    window.removeEventListener("focus", handleWindowFocus);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pageshow", handlePageShow);
  };
}, []);

useEffect(() => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };

  const handleDragStart = (event: DragEvent) => {
    const target = event.target;
    if (target instanceof HTMLImageElement || target instanceof HTMLVideoElement) {
      event.preventDefault();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const hasModifier = event.ctrlKey || event.metaKey;
    const isInspectShortcut =
      key === "f12" ||
      (hasModifier && event.shiftKey && ["i", "j", "c"].includes(key)) ||
      (hasModifier && ["u", "s"].includes(key));

    if (!isInspectShortcut) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  document.addEventListener("contextmenu", handleContextMenu);
  document.addEventListener("dragstart", handleDragStart);
  window.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("contextmenu", handleContextMenu);
    document.removeEventListener("dragstart", handleDragStart);
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);

useEffect(() => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PORTFOLIO_STORAGE_KEY,
      JSON.stringify(portfolioProjects)
    );
  } catch {
    // ignore localStorage write errors
  }
}, [portfolioProjects]);

  // Keep the homepage ready immediately on load.
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    setIntroDone(true);
    setIntroPulse(false);
    setIntroLogoVisible(true);
    setIntroWelcomeVisible(true);
    setIntroDoorsOpen(true);
    setIntroExit(true);
    setTextVisible(true);
    setImageVisible(true);
    setVideoText(videoFullText);
    setGraphicText(graphicFullText);
    setVideoDone(true);
    setGraphicDone(true);
  }, [graphicFullText, videoFullText]);

useEffect(() => {
  if (activeHeroMarker === null) return;

  const handleDismissHeroMarker = (event: MouseEvent | TouchEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('[data-hero-marker-button="true"]')) return;
    setActiveHeroMarker(null);
  };

  const handleEscapeHeroMarker = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setActiveHeroMarker(null);
    }
  };

  document.addEventListener("mousedown", handleDismissHeroMarker);
  document.addEventListener("touchstart", handleDismissHeroMarker, { passive: true });
  document.addEventListener("keydown", handleEscapeHeroMarker);

  return () => {
    document.removeEventListener("mousedown", handleDismissHeroMarker);
    document.removeEventListener("touchstart", handleDismissHeroMarker);
    document.removeEventListener("keydown", handleEscapeHeroMarker);
  };
}, [activeHeroMarker]);


// Hello + Name typing animation
useEffect(() => {
  const timers: ReturnType<typeof setTimeout>[] = [];

  if (!showAbout) {
    setHelloVisible(false);
    setNameText("");
    setNameDone(false);
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }

  setHelloVisible(true);
  setNameText("");
  setNameDone(false);

  let index = 0;

  const typeNextLetter = () => {
    if (index < aboutFullName.length) {
      setNameText(aboutFullName.slice(0, index + 1));
      index++;
      const timer = setTimeout(typeNextLetter, 72);
      timers.push(timer);
    } else {
      setNameDone(true);
    }
  };

  const startTimer = setTimeout(typeNextLetter, 40);
  timers.push(startTimer);

  return () => {
    timers.forEach((timer) => clearTimeout(timer));
  };
}, [aboutFullName, showAbout]);

useEffect(() => {
  if (!aboutRef.current) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      setShowAbout(Boolean(entry?.isIntersecting));
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  observer.observe(aboutRef.current);

  return () => {
    observer.disconnect();
  };
}, []);

useEffect(() => {
  if (!clientStoriesRef.current) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      setShowClientStories(Boolean(entry?.isIntersecting));
    },
    {
      threshold: 0.01,
      rootMargin: "35% 0px 20% 0px",
    }
  );

  observer.observe(clientStoriesRef.current);

  return () => {
    observer.disconnect();
  };
}, []);

  useEffect(() => {
    const sections = [
      { id: "home", ref: heroRef },
      { id: "about", ref: aboutRef },
      { id: "reviews", ref: reviewsRef },
    ] as const;

    const activeSections = new Set<string>();
    const thresholdSteps = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1];

    const updateActiveSection = () => {
      const nextActiveSection =
        sections.find((section) => activeSections.has(section.id))?.id ||
        activeSectionRef.current;

      if (activeSectionRef.current !== nextActiveSection) {
        activeSectionRef.current = nextActiveSection;
        setActiveSection(nextActiveSection);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = (entry.target as HTMLElement).dataset.sectionId;
          if (!sectionId) return;

          if (entry.isIntersecting) {
            activeSections.add(sectionId);
          } else {
            activeSections.delete(sectionId);
          }
        });

        updateActiveSection();
      },
      {
        threshold: thresholdSteps,
        rootMargin: "-45% 0px -45% 0px",
      }
    );

    sections.forEach((section) => {
      if (!section.ref.current) return;
      section.ref.current.dataset.sectionId = section.id;
      observer.observe(section.ref.current);
    });

    updateActiveSection();

    return () => {
      observer.disconnect();
    };
  }, []);

useEffect(() => {
  return () => {
    if (logoTapResetRef.current) {
      clearTimeout(logoTapResetRef.current);
    }
  };
}, []);

const scrollToSection = (ref: React.RefObject<HTMLDivElement | null> | null) => {
  const targetTop = ref?.current ? ref.current.offsetTop : 0;
  window.scrollTo({ top: targetTop, behavior: "smooth" });
};

const openPortfolioCategory = (
  categoryName: PortfolioCategoryName,
  _shouldScroll = false
) => {
  router.push(getPortfolioCategoryPath(categoryName));
};

const openVideoProjectShowcase = (projectKey: string) => {
  setSelectedVideoProjectKey(projectKey);

  window.setTimeout(() => {
    videoProjectViewerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 110);
};

const openProjectDetails = (project: PortfolioProject) => {
  setSelectedProject(project);
  setShowModal(true);
};

const openHeroShowreel = () => {
  router.push("/portfolio/video-editing");
};

const handleSecretLogoTap = () => {
  setLogoTapCount((previousTapCount) => {
    const nextTapCount = previousTapCount + 1;

    if (logoTapResetRef.current) {
      clearTimeout(logoTapResetRef.current);
    }

    logoTapResetRef.current = setTimeout(() => {
      setLogoTapCount(0);
    }, 1600);

    if (nextTapCount >= 5) {
      if (logoTapResetRef.current) {
        clearTimeout(logoTapResetRef.current);
        logoTapResetRef.current = null;
      }
      router.push("/studio");
      return 0;
    }

    return nextTapCount;
  });
};

useEffect(() => {
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  if (showModal) {
    setIsDetailsModalMounted(true);
    openTimer = setTimeout(() => setModalVisible(true), MODAL_OPEN_DELAY_MS);
  } else {
    setModalVisible(false);
    closeTimer = setTimeout(() => {
      setIsDetailsModalMounted(false);
      setSelectedProject(null);
    }, MODAL_TRANSITION_MS);
  }

  return () => {
    if (openTimer) clearTimeout(openTimer);
    if (closeTimer) clearTimeout(closeTimer);
  };
}, [showModal]);

useEffect(() => {
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  if (showAddProjectModal) {
    setIsAddProjectModalMounted(true);
    openTimer = setTimeout(() => setAddProjectModalVisible(true), MODAL_OPEN_DELAY_MS);
  } else {
    setAddProjectModalVisible(false);
    closeTimer = setTimeout(() => {
      setIsAddProjectModalMounted(false);
    }, MODAL_TRANSITION_MS);
  }

  return () => {
    if (openTimer) clearTimeout(openTimer);
    if (closeTimer) clearTimeout(closeTimer);
  };
}, [showAddProjectModal]);

useEffect(() => {
  const shouldLockScroll = !introDone || isDetailsModalMounted || isAddProjectModalMounted;
  const overflowValue = shouldLockScroll ? "hidden" : "";
  document.body.style.overflow = overflowValue;
  document.documentElement.style.overflow = overflowValue;

  return () => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  };
}, [introDone, isDetailsModalMounted, isAddProjectModalMounted]);

useEffect(() => {
  if (!showTikTokModal) return;

  const handlePointerDown = (event: MouseEvent) => {
    if (!tikTokBubbleRef.current) return;
    if (!tikTokBubbleRef.current.contains(event.target as Node)) {
      setShowTikTokModal(false);
    }
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setShowTikTokModal(false);
    }
  };

  document.addEventListener("mousedown", handlePointerDown);
  document.addEventListener("keydown", handleEscape);

  return () => {
    document.removeEventListener("mousedown", handlePointerDown);
    document.removeEventListener("keydown", handleEscape);
  };
}, [showTikTokModal]);

useEffect(() => {
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  if (showTikTokModal) {
    setIsTikTokBubbleMounted(true);
    openTimer = setTimeout(() => {
      setIsTikTokBubbleVisible(true);
    }, 12);
  } else {
    setIsTikTokBubbleVisible(false);
    closeTimer = setTimeout(() => {
      setIsTikTokBubbleMounted(false);
    }, 190);
  }

  return () => {
    if (openTimer) clearTimeout(openTimer);
    if (closeTimer) clearTimeout(closeTimer);
  };
}, [showTikTokModal]);

useEffect(() => {
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  if (showContactForm) {
    setIsContactFormMounted(true);
    openTimer = setTimeout(() => {
      setIsContactFormVisible(true);
    }, CONTACT_PANEL_OPEN_DELAY_MS);
  } else {
    setIsContactFormVisible(false);
    closeTimer = setTimeout(() => {
      setIsContactFormMounted(false);
    }, CONTACT_PANEL_TRANSITION_MS);
  }

  return () => {
    if (openTimer) clearTimeout(openTimer);
    if (closeTimer) clearTimeout(closeTimer);
  };
}, [showContactForm]);

useEffect(() => {
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  if (showRates) {
    setIsRatesPanelMounted(true);
    openTimer = setTimeout(() => {
      setIsRatesPanelVisible(true);
    }, CONTACT_PANEL_OPEN_DELAY_MS);
  } else {
    setIsRatesPanelVisible(false);
    closeTimer = setTimeout(() => {
      setIsRatesPanelMounted(false);
    }, CONTACT_PANEL_TRANSITION_MS);
  }

  return () => {
    if (openTimer) clearTimeout(openTimer);
    if (closeTimer) clearTimeout(closeTimer);
  };
}, [showRates]);

useEffect(() => {
  if (!isContactFormVisible || !shouldFocusContactMessageRef.current) return;

  const focusContactMessage = () => {
    contactMessageCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    contactMessageRef.current?.focus();
    const messageLength = contactMessageRef.current?.value.length ?? 0;
    contactMessageRef.current?.setSelectionRange(messageLength, messageLength);
    shouldFocusContactMessageRef.current = false;
  };

  const focusTimer = setTimeout(focusContactMessage, 180);

  return () => clearTimeout(focusTimer);
}, [isContactFormVisible]);

const closeDetailsModal = () => {
  setShowModal(false);
};

const openAddProjectModal = () => {
  setNewProjectForm(createEmptyProjectForm());
  setAddProjectError("");
  setIsAddingProject(false);
  setShowAddProjectModal(true);
};

const closeAddProjectModal = () => {
  setAddProjectError("");
  setIsAddingProject(false);
  setShowAddProjectModal(false);
};

const updateGalleryImage = (index: number, value: string) => {
  setNewProjectForm((prev) => {
    const nextGallery = [...prev.galleryImages];
    nextGallery[index] = value;
    return { ...prev, galleryImages: nextGallery };
  });
};

const addGalleryInput = () => {
  setNewProjectForm((prev) => ({
    ...prev,
    galleryImages: [...prev.galleryImages, ""],
  }));
};

const removeGalleryInput = (index: number) => {
  setNewProjectForm((prev) => {
    if (prev.galleryImages.length === 1) return prev;
    return {
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    };
  });
};

const getVideoCarouselIndex = (groupName: string, projectCount: number) => {
  if (projectCount <= 0) {
    return 0;
  }

  const currentIndex = videoCarouselIndexes[groupName] ?? 0;
  return ((currentIndex % projectCount) + projectCount) % projectCount;
};

const setVideoCarouselIndex = (groupName: string, nextIndex: number, projectCount: number) => {
  if (projectCount <= 0) {
    return;
  }

  const currentIndex = getVideoCarouselIndex(groupName, projectCount);
  const normalizedNextIndex = ((nextIndex % projectCount) + projectCount) % projectCount;
  if (normalizedNextIndex === currentIndex) {
    return;
  }

  setVideoCarouselIndexes((prev) => ({
    ...prev,
    [groupName]: normalizedNextIndex,
  }));
};

const shiftVideoCarousel = (
  groupName: string,
  direction: -1 | 1,
  projectCount: number
) => {
  if (projectCount <= 1) {
    return;
  }

  setVideoCarouselIndexes((prev) => {
    const currentIndex = ((prev[groupName] ?? 0) % projectCount + projectCount) % projectCount;
    return {
      ...prev,
      [groupName]: (currentIndex + direction + projectCount) % projectCount,
    };
  });
};

const handleAddProjectSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  void (async () => {
    setAddProjectError("");

    const fallbackImage = "/comradz.png";
    const fallbackHeroImage = "/comradz2.png";
    const trimmedTitle = newProjectForm.title.trim();
    const trimmedDescription = newProjectForm.description.trim();
    const trimmedCardImage = newProjectForm.image.trim();
    const trimmedDesignLink = newProjectForm.designLink.trim();
    const trimmedVideoCategory = newProjectForm.videoCategory.trim();
    const trimmedVideoParentLabel = newProjectForm.videoParentLabel.trim();
    const trimmedVideoAspectRatio: VideoProjectAspectRatio =
      newProjectForm.videoAspectRatio === "portrait" ? "portrait" : "landscape";
    const trimmedVideoUrls = newProjectForm.videoUrls
      .map((videoUrl) => videoUrl.trim())
      .filter((videoUrl) => videoUrl.length > 0);
    const galleryImages = newProjectForm.galleryImages
      .map((img) => img.trim())
      .filter((img) => img.length > 0);

    if (activeBox === "Video Edit") {
      const validVideoSources = trimmedVideoUrls.filter((videoUrl) => isMp4VideoSource(videoUrl));

      if (validVideoSources.length > 0) {
        setIsAddingProject(true);

        try {
          await validateVideoSourcesForProject(validVideoSources, trimmedVideoAspectRatio);
        } catch (error) {
          setAddProjectError(
            error instanceof Error
              ? error.message
              : "All clips in this project must match the selected ratio."
          );
          setIsAddingProject(false);
          return;
        }
      }
    }

    const projectToAdd: PortfolioProject = {
      title: trimmedTitle || "Untitled Project",
      description: trimmedDescription || "Project description will be added soon.",
      image: trimmedCardImage || fallbackImage,
      designLink: trimmedDesignLink || "#",
      showDetailsModal: activeBox !== "Video Edit" && newProjectForm.showDetailsModal,
    };

    if (activeBox === "Video Edit") {
      projectToAdd.videoCategory =
        trimmedVideoCategory || trimmedTitle || DEFAULT_VIDEO_EDIT_GROUP;
      projectToAdd.videoAspectRatio = trimmedVideoAspectRatio;
      if (trimmedVideoParentLabel) {
        projectToAdd.videoParentLabel = trimmedVideoParentLabel;
      }
      if (trimmedVideoUrls.length > 0) {
        projectToAdd.videoUrls = trimmedVideoUrls;
        projectToAdd.videoUrl = trimmedVideoUrls[0];
      }
    }

    if (activeBox !== "Video Edit" && newProjectForm.showDetailsModal) {
      projectToAdd.details = {
        title: newProjectForm.detailsTitle.trim() || trimmedTitle || "Project Details",
        description:
          newProjectForm.detailsDescription.trim() ||
          trimmedDescription ||
          "Additional project details will be added soon.",
        heroImage: newProjectForm.detailsHeroImage.trim() || trimmedCardImage || fallbackHeroImage,
        galleryImages:
          galleryImages.length > 0 ? galleryImages : [trimmedCardImage || fallbackImage],
      };
    }

    setPortfolioProjects((prev) => ({
      ...prev,
      [activeBox]: [...(prev[activeBox] || []), projectToAdd],
    }));

    closeAddProjectModal();
    setAnimateTab(false);
    setTimeout(() => setAnimateTab(true), 50);
  })();
};

const updateContactField = (field: keyof ContactFormState, value: string) => {
  if (field === "serviceType") {
    setSelectedRateSummary("");
  }

  setContactForm((prev) => ({
    ...prev,
    [field]: value,
    ...(field === "serviceType" && value !== "video-edit"
      ? { videoEditType: "" }
      : {}),
  }));
};

const openContactFormPanel = (options?: { focusMessage?: boolean }) => {
  void options;
  router.push("/contact");
};

const closeContactFormPanel = () => {
  shouldFocusContactMessageRef.current = false;
  setShowContactForm(false);
};

const toggleContactFormPanel = () => {
  if (showRates) {
    openContactFormPanel();
    return;
  }

  if (showContactForm) {
    closeContactFormPanel();
    return;
  }

  openContactFormPanel();
};

const toggleRatesPanel = () => {
  shouldFocusContactMessageRef.current = false;

  if (showRates) {
    setShowRates(false);
    return;
  }

  setShowContactForm(false);
  if (contactForm.serviceType === "graphic-design") {
    setActiveRateCategory("graphic-design");
  } else if (contactForm.serviceType === "video-edit") {
    setActiveRateCategory("video-edit");
  }
  setShowRates(true);
};

const openContactMessageForm = () => {
  router.push("/contact");
};

const inferVideoEditTypeFromRateLabel = (label: string) => {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes("long-form")) {
    return "long-form";
  }

  if (normalizedLabel.includes("short-form")) {
    return "short-form";
  }

  return "";
};

const handleRateRowSelect = (row: RateTableRow, rateCategory: RateCategory) => {
  const inferredVideoEditType =
    rateCategory === "video-edit" ? inferVideoEditTypeFromRateLabel(row.label) : "";
  const rateSummary = `${row.label} - ${row.price}`;

  setContactForm((prev) => ({
    ...prev,
    serviceType: rateCategory,
    videoEditType: inferredVideoEditType,
  }));
  setSelectedRateSummary(rateSummary);

  openContactFormPanel({ focusMessage: true });
};

const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  if (!contactForm.serviceType) {
    setContactSubmitState({
      status: "error",
      message: "Choose the type of project you want help with.",
    });
    return;
  }

  if (contactForm.serviceType === "video-edit" && !contactForm.videoEditType) {
    setContactSubmitState({
      status: "error",
      message: "Choose whether you need long-form or short-form video edits.",
    });
    return;
  }

  setContactSubmitState({
    status: "sending",
    message: "Sending your message...",
  });

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...contactForm,
        selectedRateSummary,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; success?: boolean }
      | null;

    if (!response.ok) {
      throw new Error(
        payload?.error || "Your message could not be sent right now."
      );
    }

    setContactForm(getDefaultContactFormState());
    setSelectedRateSummary("");
    setContactSubmitState({
      status: "success",
      message: "Your message was sent successfully.",
    });
  } catch (error) {
    setContactSubmitState({
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Your message could not be sent right now.",
    });
  }
};

const activeCategoryName = activeBox as PortfolioCategoryName;
const activeProjects = portfolioProjects[activeCategoryName] || [];
const isVideoEditShowcase = activeBox === "Video Edit";
const videoProjectGroups = isVideoEditShowcase ? groupVideoProjects(activeProjects) : [];
const totalVideoClipCount = isVideoEditShowcase
  ? videoProjectGroups.reduce((total, group) => total + group.clips.length, 0)
  : 0;
const selectedVideoProjectGroup = isVideoEditShowcase
  ? videoProjectGroups.find((group) => group.key === selectedVideoProjectKey) ?? null
  : null;
const selectedVideoProject = selectedVideoProjectGroup?.project ?? null;
const selectedVideoProjectClipIndex = selectedVideoProjectGroup
  ? getVideoCarouselIndex(selectedVideoProjectGroup.key, selectedVideoProjectGroup.clips.length)
  : 0;
const selectedVideoProjectClip = selectedVideoProjectGroup
  ? selectedVideoProjectGroup.clips[selectedVideoProjectClipIndex] ?? null
  : null;
const selectedVideoProjectParentLabel =
  selectedVideoProjectGroup && selectedVideoProject
    ? getVideoProjectParentLabel(selectedVideoProject, selectedVideoProjectGroup.name)
    : "";
const selectedCategoryProjectIndex = !isVideoEditShowcase
  ? Math.min(
      selectedCategoryProjectIndexes[activeCategoryName] ?? 0,
      Math.max(activeProjects.length - 1, 0)
    )
  : 0;
const spotlightCategoryProject = !isVideoEditShowcase
  ? activeProjects[selectedCategoryProjectIndex] ?? null
  : null;
const totalWebsites = portfolioProjects.Websites?.length || 0;
const categoryProjectCounts = {
  "Video Edit": videoProjectGroups.length,
  "Graphic Design": portfolioProjects["Graphic Design"]?.length || 0,
  Websites: totalWebsites,
} as const;
const activeCategoryMeta =
  portfolioCategories.find((item) => item.name === activeBox) ?? portfolioCategories[0];
const activeCategoryCountText =
  isVideoEditShowcase && videoProjectGroups.length > 0
    ? `${videoProjectGroups.length} cinematic ${
        videoProjectGroups.length === 1 ? "project" : "projects"
      } and ${totalVideoClipCount} ${totalVideoClipCount === 1 ? "clip" : "clips"} on standby.`
    : `${activeProjects.length} ${activeProjects.length === 1 ? "item" : "items"} currently showing.`;

useEffect(() => {
  if (!isVideoEditShowcase) {
    return;
  }

  if (videoProjectGroups.length === 0) {
    if (selectedVideoProjectKey) {
      setSelectedVideoProjectKey(null);
    }
    return;
  }

  if (!selectedVideoProjectKey) {
    setSelectedVideoProjectKey(videoProjectGroups[0]?.key ?? null);
    return;
  }

  const hasSelectedProject = videoProjectGroups.some(
    (group) => group.key === selectedVideoProjectKey
  );

  if (!hasSelectedProject) {
    setSelectedVideoProjectKey(videoProjectGroups[0]?.key ?? null);
  }
}, [isVideoEditShowcase, selectedVideoProjectKey, videoProjectGroups]);

useEffect(() => {
  if (isVideoEditShowcase || activeProjects.length === 0) {
    return;
  }

  const currentIndex = selectedCategoryProjectIndexes[activeCategoryName] ?? 0;
  if (currentIndex >= activeProjects.length) {
    setSelectedCategoryProjectIndexes((prev) => ({
      ...prev,
      [activeCategoryName]: 0,
    }));
  }
}, [
  activeCategoryName,
  activeProjects.length,
  isVideoEditShowcase,
  selectedCategoryProjectIndexes,
]);

const scrollProjectRail = (direction: -1 | 1) => {
  const railViewport = projectRailViewportRef.current;
  if (!railViewport) {
    return;
  }

  const distance = Math.max(railViewport.clientWidth * 0.72, 240);
  railViewport.scrollBy({
    left: distance * direction,
    behavior: "smooth",
  });
};

const glassSectionClass =
  "relative mx-auto w-full max-w-7xl rounded-[26px] border border-white/10 bg-white/[0.03] p-[1.5px] shadow-[0_18px_60px_rgba(0,0,0,0.24)] transform-gpu [backface-visibility:hidden]";
const glassSectionPanelClass =
  "relative overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,rgba(14,19,27,0.94),rgba(8,12,18,0.98))] backdrop-blur-xl";
const glassSectionInnerClass =
  "relative z-10 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12";
const mainSectionGlowProps = {
  disabled: false,
  glow: true,
  blur: 0,
  spread: 34,
  proximity: 128,
  inactiveZone: 0.01,
  movementDuration: 0.55,
  borderWidth: 1.5,
};
const ratePanelTitle =
  activeRateCategory === "video-edit" ? "Video Editing Services" : "Graphic Design Services";
const ratePanelSubtitle =
  activeRateCategory === "video-edit"
    ? "A compact starting price sheet for long-form, short-form, bundles, and add-ons. Click any rate to open the message form with that rate attached to your inquiry."
    : "A compact starting price sheet for posters, thumbnails, branding, and marketing materials. Click any rate to open the message form with that rate attached to your inquiry.";
const ratePanelToggleLabel =
  activeRateCategory === "video-edit" ? "Graphic Design" : "Video Edit";
const activeRateNotes =
  activeRateCategory === "video-edit" ? rateNotes : graphicDesignRateNotes;
const activeRateSections =
  activeRateCategory === "video-edit"
    ? [
        {
          title: "Core Pricing",
          subtitle: "YouTube videos, podcasts, reels, TikToks, and Shorts.",
          rows: videoEditingRateRows,
          wrapperClass: "min-w-[280px] flex-[1.2] sm:min-w-[360px] sm:flex-[1.35]",
          animationDelayMs: 60,
        },
        {
          title: "Bundle Offers",
          rows: bundleRateRows,
          wrapperClass: "min-w-[240px] flex-1 sm:min-w-[280px]",
          animationDelayMs: 120,
        },
        {
          title: "Add-Ons",
          rows: addOnRateRows,
          wrapperClass: "min-w-[240px] flex-1 sm:min-w-[280px]",
          animationDelayMs: 180,
        },
      ]
    : [
        {
          title: "Social & Content",
          subtitle: "Poster systems, social graphics, and carousel content.",
          rows: graphicDesignPosterRows,
          wrapperClass: "min-w-[260px] flex-[1.05] sm:min-w-[330px] sm:flex-[1.2]",
          animationDelayMs: 60,
        },
        {
          title: "Branding",
          subtitle: "Thumbnail work, logos, and fuller brand identity support.",
          rows: graphicDesignBrandRows,
          wrapperClass: "min-w-[240px] flex-1 sm:min-w-[290px]",
          animationDelayMs: 120,
        },
        {
          title: "Marketing Materials",
          subtitle: "Support assets for promos, banners, and presentations.",
          rows: graphicDesignMarketingRows,
          wrapperClass: "min-w-[240px] flex-1 sm:min-w-[290px]",
          animationDelayMs: 180,
        },
      ];
const creativeTools = [
  {
    name: "Adobe Premiere Pro",
    shortName: "Premiere Pro",
    description: "Main timeline for cuts, pacing, audio sync, and polished final exports.",
    icon: SiAdobepremierepro,
    featured: true,
    accent: "#b895ff",
    iconBrandColor: "#9999FF",
    glow: "rgba(124, 58, 237, 0.28)",
    badgeBackground:
      "linear-gradient(145deg, rgba(35, 12, 70, 0.98), rgba(113, 72, 228, 0.96))",
    badgeBorder: "rgba(224, 206, 255, 0.34)",
    panelBackground:
      "linear-gradient(160deg, rgba(71, 28, 131, 0.44) 0%, rgba(19, 17, 38, 0.9) 42%, rgba(6, 12, 22, 0.98) 100%)",
    accentBeam:
      "radial-gradient(circle at 50% 12%, rgba(184, 149, 255, 0.18) 0%, rgba(184, 149, 255, 0.06) 24%, transparent 58%), linear-gradient(145deg, rgba(255, 255, 255, 0.08), transparent 38%, rgba(184, 149, 255, 0.14) 82%, transparent 100%)",
    layoutClassName:
      "sm:col-span-2 xl:col-start-2 xl:row-start-1 xl:row-span-2 xl:place-self-center xl:-translate-x-46 xl:w-full xl:max-w-[30rem]",
    shellClassName: "min-h-[250px] rounded-[32px] xl:min-h-[18rem]",
    iconFrameClassName: "h-20 w-20 rounded-[24px] sm:h-[5.6rem] sm:w-[5.6rem]",
    iconClassName: "h-10 w-10 sm:h-11 sm:w-11",
    watermarkClassName: "h-28 w-28 sm:h-32 sm:w-32",
    iconLaneClassName: "items-center justify-center",
    footerClassName: "justify-center",
    lift: "0px",
    rotate: "0deg",
    hoverRotate: "0deg",
  },
  {
    name: "Adobe Photoshop",
    shortName: "Photoshop",
    description: "Thumbnails, retouching, composites, and sharper visual finishing.",
    icon: SiAdobephotoshop,
    featured: false,
    accent: "#6ee7ff",
    iconBrandColor: "#31A8FF",
    glow: "rgba(14, 165, 233, 0.22)",
    badgeBackground:
      "linear-gradient(145deg, rgba(5, 34, 58, 0.98), rgba(20, 127, 162, 0.96))",
    badgeBorder: "rgba(125, 233, 255, 0.3)",
    panelBackground:
      "linear-gradient(155deg, rgba(8, 68, 108, 0.32) 0%, rgba(9, 22, 36, 0.92) 52%, rgba(5, 11, 21, 0.98) 100%)",
    accentBeam:
      "radial-gradient(circle at 22% 18%, rgba(110, 231, 255, 0.18) 0%, rgba(110, 231, 255, 0.06) 22%, transparent 54%), linear-gradient(155deg, rgba(255, 255, 255, 0.06), transparent 34%, rgba(110, 231, 255, 0.1) 84%, transparent 100%)",
    layoutClassName: "xl:col-start-1 xl:row-start-1",
    shellClassName: "min-h-[250px] rounded-[32px] xl:min-h-[18rem]",
    iconFrameClassName: "h-20 w-20 rounded-[24px] sm:h-[5.6rem] sm:w-[5.6rem]",
    iconClassName: "h-10 w-10 sm:h-11 sm:w-11",
    watermarkClassName: "h-28 w-28 sm:h-32 sm:w-32",
    iconLaneClassName: "items-start justify-start",
    footerClassName: "justify-between",
    lift: "-6px",
    rotate: "-4.8deg",
    hoverRotate: "-2deg",
  },
  {
    name: "Adobe After Effects",
    shortName: "After Effects",
    description: "Motion graphics, transitions, and layered animation for extra impact.",
    icon: SiAdobeaftereffects,
    featured: false,
    accent: "#e2b7ff",
    iconBrandColor: "#CF96FD",
    glow: "rgba(168, 85, 247, 0.22)",
    badgeBackground:
      "linear-gradient(145deg, rgba(29, 13, 60, 0.98), rgba(121, 60, 196, 0.96))",
    badgeBorder: "rgba(233, 206, 255, 0.3)",
    panelBackground:
      "linear-gradient(160deg, rgba(74, 31, 124, 0.32) 0%, rgba(22, 16, 38, 0.9) 48%, rgba(7, 12, 21, 0.98) 100%)",
    accentBeam:
      "radial-gradient(circle at 78% 18%, rgba(226, 183, 255, 0.16) 0%, rgba(226, 183, 255, 0.04) 24%, transparent 54%), linear-gradient(145deg, rgba(255, 255, 255, 0.05), transparent 34%, rgba(226, 183, 255, 0.12) 86%, transparent 100%)",
    layoutClassName: "xl:col-start-3 xl:row-start-1",
    shellClassName: "min-h-[250px] rounded-[32px] xl:min-h-[18rem]",
    iconFrameClassName: "h-20 w-20 rounded-[24px] sm:h-[5.6rem] sm:w-[5.6rem]",
    iconClassName: "h-10 w-10 sm:h-11 sm:w-11",
    watermarkClassName: "h-28 w-28 sm:h-32 sm:w-32",
    iconLaneClassName: "items-end justify-end",
    footerClassName: "flex-row-reverse justify-between",
    lift: "-2px",
    rotate: "4.2deg",
    hoverRotate: "1.5deg",
  },
  {
    name: "Canva",
    icon: SiCanva,
    shortName: "Canva",
    description: "Fast layouts, social graphics, and quick client-ready concepts.",
    featured: false,
    accent: "#7df9ff",
    iconBrandColor: "#00C4CC",
    glow: "rgba(34, 211, 238, 0.2)",
    badgeBackground:
      "linear-gradient(145deg, rgba(9, 63, 74, 0.98), rgba(12, 143, 162, 0.96))",
    badgeBorder: "rgba(154, 246, 255, 0.28)",
    panelBackground:
      "linear-gradient(156deg, rgba(10, 92, 109, 0.28) 0%, rgba(10, 28, 35, 0.9) 52%, rgba(5, 12, 20, 0.98) 100%)",
    accentBeam:
      "radial-gradient(circle at 24% 80%, rgba(125, 249, 255, 0.16) 0%, rgba(125, 249, 255, 0.04) 24%, transparent 56%), linear-gradient(150deg, rgba(255, 255, 255, 0.05), transparent 30%, rgba(125, 249, 255, 0.12) 82%, transparent 100%)",
    layoutClassName: "xl:col-start-1 xl:row-start-2",
    shellClassName: "min-h-[235px] rounded-[30px] xl:min-h-[16.5rem]",
    iconFrameClassName: "h-[4.8rem] w-[4.8rem] rounded-[22px] sm:h-[5.25rem] sm:w-[5.25rem]",
    iconClassName: "h-9 w-9 sm:h-10 sm:w-10",
    watermarkClassName: "h-24 w-24 sm:h-28 sm:w-28",
    iconLaneClassName: "items-start justify-start",
    footerClassName: "justify-between",
    lift: "4px",
    rotate: "-2.8deg",
    hoverRotate: "-0.8deg",
  },
  {
    name: "Adobe Illustrator",
    shortName: "Illustrator",
    description: "Vector logos, icons, and clean scalable brand details.",
    icon: SiAdobeillustrator,
    featured: false,
    accent: "#fdba74",
    iconBrandColor: "#FF9A00",
    glow: "rgba(249, 115, 22, 0.2)",
    badgeBackground:
      "linear-gradient(145deg, rgba(77, 31, 7, 0.98), rgba(168, 80, 12, 0.96))",
    badgeBorder: "rgba(255, 191, 116, 0.28)",
    panelBackground:
      "linear-gradient(156deg, rgba(108, 50, 14, 0.28) 0%, rgba(34, 18, 11, 0.9) 52%, rgba(7, 11, 18, 0.98) 100%)",
    accentBeam:
      "radial-gradient(circle at 78% 78%, rgba(253, 186, 116, 0.16) 0%, rgba(253, 186, 116, 0.04) 24%, transparent 56%), linear-gradient(150deg, rgba(255, 255, 255, 0.05), transparent 30%, rgba(253, 186, 116, 0.12) 82%, transparent 100%)",
    layoutClassName: "xl:col-start-3 xl:row-start-2",
    shellClassName: "min-h-[235px] rounded-[30px] xl:min-h-[16.5rem]",
    iconFrameClassName: "h-[4.8rem] w-[4.8rem] rounded-[22px] sm:h-[5.25rem] sm:w-[5.25rem]",
    iconClassName: "h-9 w-9 sm:h-10 sm:w-10",
    watermarkClassName: "h-24 w-24 sm:h-28 sm:w-28",
    iconLaneClassName: "items-end justify-end",
    footerClassName: "flex-row-reverse justify-between",
    lift: "8px",
    rotate: "3.1deg",
    hoverRotate: "1deg",
  },
] as const;
const creativeExperienceEntries = [
  {
    role: "Short-Form Video Editing",
    client: "Kayla",
    period: "2024",
    summary:
      "Business-focused short-form edits shaped with Premiere Pro polish and clean motion support.",
    tags: ["Short-Form", "Premiere Pro", "After Effects"],
  },
  {
    role: "Short-Form and Long-Form Video Editing",
    client: "Vast Professionals",
    period: "2025-2026",
    summary:
      "Handled both short and long-form client content with motion, polish, and brand-consistent finishing.",
    tags: ["Long-Form", "Premiere Pro", "After Effects"],
  },
  {
    role: "Long-Form Video Editor",
    client: "Henry Sims",
    period: "2026-Present",
    summary:
      "Long-form edits built with stronger structure, cleaner pacing, and polished sound design.",
    tags: ["Premiere Pro", "After Effects", "Adobe Audition"],
  },
] as const;
const aboutHighlightCards = [
  {
    title: "Organized from brief",
    description: "Clear scope, tidy files, and fewer guessing games.",
    icon: Film,
  },
  {
    title: "Detail-driven taste",
    description: "Strong pacing, readable hierarchy, and polished finish.",
    icon: Palette,
  },
  {
    title: "Easy to work with",
    description: "Direct updates, clean revisions, and quick replies.",
    icon: Globe,
  },
] as const;
const aboutSnapshotStats = [
  {
    value: "2+ yrs",
    label: "creative delivery",
  },
  {
    value: "24 hrs",
    label: "usual response",
  },
  {
    value: "3 skills",
    label: "creative + tech",
  },
] as const;
const contactPlatforms = [
  {
    label: "Upwork",
    href: "https://www.upwork.com/freelancers/~01c7183b8ea44ccc28",
    description: "Hire or connect with me on Upwork.",
  },
  {
    label: "Fiverr",
    href: "https://www.fiverr.com/",
    description: "Browse my Fiverr-style creative services.",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/wence-dante-de-vera-29077a2ba/",
    description: "Connect professionally on LinkedIn.",
  },
] as const;
const socialLinks: SocialLink[] = [
  {
    label: "Facebook",
    handle: "Wence Dante De Vera",
    href: "https://www.facebook.com/wence.dante.de.vera.2024",
    description: "Personal updates, public posts, and a more direct look at who I am.",
  },
  {
    label: "Instagram",
    handle: "@editwithwens",
    href: "https://www.instagram.com/editwithwens",
    description: "Edits, visuals, and behind-the-scenes creative work in one feed.",
  },
  {
    label: "TikTok",
    handle: "@wncedvra or @editwithwens",
    description: "Choose between my two TikTok accounts for different styles of content.",
    options: [
      {
        label: "@wncedvra",
        href: "https://www.tiktok.com/@wncedvra",
      },
      {
        label: "@editwithwens",
        href: "https://www.tiktok.com/@editwithwens",
      },
    ],
  },
];
  return (
    <div className="relative min-h-screen overflow-x-clip bg-transparent">
      {/* INTRO BUILD-UP + LOGO REVEAL */}
      {!introDone && (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
          <div
            className={`intro-backdrop ${
              introPulse ? "intro-backdrop-active" : "intro-backdrop-idle"
            } ${
              introDoorsOpen ? "intro-backdrop-open" : ""
            }`}
          />
          <div
            className={`intro-atmosphere ${
              introExit ? "intro-atmosphere-exit" : ""
            } ${introDoorsOpen ? "intro-atmosphere-open" : ""}`}
          >
            <span className="intro-atmosphere-grid" />
            <span className="intro-atmosphere-haze intro-atmosphere-haze-left" />
            <span className="intro-atmosphere-haze intro-atmosphere-haze-right" />
            <span className="intro-atmosphere-beam intro-atmosphere-beam-a" />
            <span className="intro-atmosphere-beam intro-atmosphere-beam-b" />
            <span className="intro-atmosphere-beam intro-atmosphere-beam-c" />
            <span className="intro-side-rail intro-side-rail-left" />
            <span className="intro-side-rail intro-side-rail-right" />
            <span className="intro-side-flare intro-side-flare-left" />
            <span className="intro-side-flare intro-side-flare-right" />
          </div>
          <div
            className={`intro-door intro-door-left ${
              introDoorsOpen ? "intro-door-left-open" : ""
            }`}
          />
          <div
            className={`intro-door intro-door-right ${
              introDoorsOpen ? "intro-door-right-open" : ""
            }`}
          />

          <div
            className={`relative z-10 flex h-full flex-col items-center justify-center px-6 text-center transition-[opacity,transform,filter] duration-[720ms] ease-[cubic-bezier(0.22,0.78,0.24,1)] ${
              introExit
                ? "translate-y-1 opacity-0 scale-[0.985] blur-[2px]"
                : "opacity-100 scale-100 blur-0"
            }`}
          >
            <div
              className={`transition-[opacity,transform] duration-[560ms] ease-[cubic-bezier(0.2,0.82,0.24,1)] ${
                introLogoVisible
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-75 translate-y-3"
              }`}
            >
              <div className="intro-logo-stage">
                <span className="intro-logo-burst intro-logo-burst-outer" />
                <span className="intro-logo-burst intro-logo-burst-inner" />
                <span className="intro-logo-sidewash intro-logo-sidewash-left" />
                <span className="intro-logo-sidewash intro-logo-sidewash-right" />
                <span className="intro-logo-sidebeam intro-logo-sidebeam-left" />
                <span className="intro-logo-sidebeam intro-logo-sidebeam-right" />
                <span className="intro-logo-aura intro-logo-aura-back" />
                <span className="intro-logo-aura intro-logo-aura-front" />
                <span className="intro-logo-ring intro-logo-ring-outer" />
                <span className="intro-logo-ring intro-logo-ring-inner" />
                <span className="intro-logo-shard intro-logo-shard-a" />
                <span className="intro-logo-shard intro-logo-shard-b" />
                <span className="intro-logo-shard intro-logo-shard-c" />
                <span className="intro-logo-shard intro-logo-shard-d" />
                <span className="intro-logo-spark intro-logo-spark-a" />
                <span className="intro-logo-spark intro-logo-spark-b" />
                <span className="intro-logo-spark intro-logo-spark-c" />
                <span className="intro-logo-spark intro-logo-spark-d" />
                <span className="intro-logo-ground" />
                <div className="intro-logo-shell">
                  <span className="intro-logo-shell-gloss" />
                  <span className="intro-logo-shell-edge" />
                  <Image
                    src="/logo.png"
                    alt="Wence logo"
                    width={150}
                    height={150}
                    priority
                    className="h-auto w-[120px] sm:w-[140px] md:w-[150px] intro-logo-mark"
                  />
                </div>
              </div>
            </div>
            <p
              className={`intro-welcome ${
                introWelcomeVisible ? "intro-welcome-visible" : ""
              }`}
            >
              Welcome to my creative space.
            </p>
          </div>
        </div>
      )}

      {/* PAGE AMBIENCE */}
      <div className="page-ambience pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-[8%] h-[22rem] w-[64rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(118,208,255,0.12)_0%,rgba(118,208,255,0.05)_34%,transparent_74%)] blur-2xl opacity-65" />
        <div className="absolute left-[-8%] top-[38%] hidden h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.1)_0%,rgba(0,153,255,0.035)_38%,transparent_74%)] blur-2xl opacity-60 lg:block" />
        <div className="absolute right-[-10%] top-[54%] hidden h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.025)_32%,transparent_72%)] blur-2xl opacity-55 lg:block" />
        <div className="absolute left-1/2 bottom-[-8%] h-[22rem] w-[78vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(102,214,255,0.1)_0%,rgba(102,214,255,0.04)_34%,transparent_74%)] blur-2xl opacity-70" />
      </div>

      <SiteHeader
        activeSection={activeSection}
        onLogoClick={handleSecretLogoTap}
        onWork={() => router.push("/portfolio/video-editing")}
        onLab={() => router.push("/portfolio/web-development")}
        onContact={() => router.push("/contact")}
      />

      <div ref={heroRef} className="relative z-10 mt-0 w-full">
        <AuroraBackgroundDemo
          isVisible={introDone || introDoorsOpen}
          onViewPortfolio={() => router.push("/portfolio/video-editing")}
          onShowreel={openHeroShowreel}
          onContact={() => router.push("/contact")}
          homeContent={homeContent.hero}
          motionLite={isMotionLite}
        />
      </div>

      <div className="section-side-glow relative w-full bg-[linear-gradient(180deg,rgba(5,10,18,0.92),rgba(8,15,25,0.96))]">
        <AboutExperienceListSection
          aboutRef={aboutRef}
          clientStoriesRef={clientStoriesRef}
          showAbout={showAbout}
          showClientStories={showClientStories}
          helloVisible={helloVisible}
          aboutFullName={aboutFullName}
          nameText={nameText}
          nameDone={nameDone}
          onViewClientEdits={() => openPortfolioCategory("Video Edit", true)}
          highlightCards={aboutHighlightCards}
          snapshotStats={aboutSnapshotStats}
          experienceEntries={experienceEntries}
          experienceContentVersion={experienceContentVersion}
          homeContent={homeContent}
        />

        <InteractiveSelector content={homeContent.featuredProjects} />

        <HomeScrollRevealSection />
      </div>

      <style>{`
        .intro-backdrop {
          position: absolute;
          inset: 0;
          will-change: opacity;
          transition: opacity ${INTRO_BACKDROP_FADE_MS}ms ease-out;
        }
        .intro-backdrop-idle {
          background: #000;
        }
        .intro-backdrop-active {
          background: radial-gradient(circle at 50% 44%, rgba(0, 153, 255, 0.09) 0%, rgba(0, 0, 0, 0.98) 34%, #000 74%);
          animation: introBackdropGlow 1.2s ease-out forwards;
        }
        .intro-backdrop-open {
          opacity: 0 !important;
          animation: none !important;
        }
        .intro-atmosphere {
          position: absolute;
          inset: 0;
          overflow: hidden;
          opacity: 1;
          contain: paint;
          will-change: opacity, transform, filter;
          transition:
            opacity ${INTRO_ATMOSPHERE_FADE_MS}ms cubic-bezier(0.22, 0.78, 0.24, 1),
            transform ${INTRO_ATMOSPHERE_FADE_MS}ms cubic-bezier(0.22, 0.78, 0.24, 1),
            filter ${INTRO_ATMOSPHERE_FADE_MS}ms cubic-bezier(0.22, 0.78, 0.24, 1);
        }
        .intro-atmosphere-exit {
          opacity: 0.42;
          transform: scale(1.015);
          filter: blur(1.5px);
        }
        .intro-atmosphere-open {
          opacity: 0;
          transform: scale(1.04);
          filter: blur(6px);
        }
        .intro-atmosphere-grid,
        .intro-atmosphere-haze,
        .intro-atmosphere-beam,
        .intro-side-rail,
        .intro-side-flare,
        .intro-logo-burst,
        .intro-logo-shard,
        .intro-logo-spark {
          pointer-events: none;
        }
        .intro-atmosphere-grid {
          position: absolute;
          inset: 0;
          opacity: 0.12;
          background-image:
            linear-gradient(rgba(160, 228, 255, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(160, 228, 255, 0.1) 1px, transparent 1px);
          background-size: 46px 46px;
          mask-image: radial-gradient(circle at 50% 46%, black 18%, rgba(0, 0, 0, 0.82) 44%, transparent 74%);
          animation: introGridShift 12s linear infinite;
        }
        .intro-atmosphere-haze {
          position: absolute;
          top: 50%;
          width: 28rem;
          height: 28rem;
          border-radius: 9999px;
          transform: translateY(-50%);
          filter: blur(18px);
          mix-blend-mode: screen;
          opacity: 0.48;
        }
        .intro-atmosphere-haze-left {
          left: -8rem;
          background: radial-gradient(circle, rgba(88, 192, 255, 0.26) 0%, rgba(88, 192, 255, 0.08) 34%, transparent 68%);
          animation: introHazeDriftLeft 8.8s ease-in-out infinite;
        }
        .intro-atmosphere-haze-right {
          right: -9rem;
          background: radial-gradient(circle, rgba(148, 236, 255, 0.18) 0%, rgba(99, 170, 255, 0.08) 32%, transparent 68%);
          animation: introHazeDriftRight 9.4s ease-in-out infinite;
        }
        .intro-atmosphere-beam {
          position: absolute;
          left: 50%;
          top: 50%;
          width: min(70vw, 48rem);
          height: 2px;
          transform-origin: center;
          background: linear-gradient(90deg, transparent, rgba(196, 242, 255, 0.86), rgba(110, 206, 255, 0.34), transparent);
          filter: blur(1.2px);
          mix-blend-mode: screen;
          opacity: 0.48;
        }
        .intro-atmosphere-beam-a {
          transform: translate(-50%, -50%) rotate(16deg);
          animation: introBeamSweepA 4.8s ease-in-out infinite;
        }
        .intro-atmosphere-beam-b {
          width: min(64vw, 42rem);
          transform: translate(-50%, -50%) rotate(-28deg);
          opacity: 0.34;
          animation: introBeamSweepB 4.2s ease-in-out infinite;
        }
        .intro-atmosphere-beam-c {
          width: min(52vw, 34rem);
          transform: translate(-50%, -50%) rotate(86deg);
          opacity: 0.22;
          animation: introBeamSweepC 5.2s ease-in-out infinite;
        }
        .intro-side-rail {
          position: absolute;
          top: 9%;
          bottom: 9%;
          width: 2px;
          border-radius: 9999px;
          background: linear-gradient(180deg, transparent, rgba(196, 242, 255, 0.74), rgba(110, 206, 255, 0.34), transparent);
          box-shadow: 0 0 16px rgba(102, 204, 255, 0.18);
          mix-blend-mode: screen;
        }
        .intro-side-rail-left {
          left: clamp(1.1rem, 3vw, 2.4rem);
          animation: introSideRailLeft 4.8s ease-in-out infinite;
        }
        .intro-side-rail-right {
          right: clamp(1.1rem, 3vw, 2.4rem);
          animation: introSideRailRight 4.8s ease-in-out infinite;
        }
        .intro-side-flare {
          position: absolute;
          top: 12%;
          bottom: 12%;
          width: clamp(7rem, 16vw, 11rem);
          opacity: 0.38;
          filter: blur(18px);
          mix-blend-mode: screen;
        }
        .intro-side-flare-left {
          left: -2rem;
          background: linear-gradient(90deg, rgba(104, 190, 255, 0.26) 0%, rgba(104, 190, 255, 0.08) 38%, transparent 86%);
          animation: introSideFlareLeft 5.6s ease-in-out infinite;
        }
        .intro-side-flare-right {
          right: -2rem;
          background: linear-gradient(270deg, rgba(156, 238, 255, 0.2) 0%, rgba(104, 190, 255, 0.08) 36%, transparent 84%);
          animation: introSideFlareRight 6.2s ease-in-out infinite;
        }
        .intro-door {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 50.5%;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.995) 0%, rgba(3, 7, 12, 0.995) 52%, rgba(0, 0, 0, 0.995) 100%);
          box-shadow: inset 0 0 42px rgba(255, 255, 255, 0.03);
          will-change: transform;
        }
        .intro-door-left {
          left: 0;
        }
        .intro-door-right {
          right: 0;
        }
        .intro-door-left-open {
          animation: introDoorLeft ${INTRO_DOOR_OPEN_MS}ms cubic-bezier(0.22, 0.76, 0.24, 1) forwards;
        }
        .intro-door-right-open {
          animation: introDoorRight ${INTRO_DOOR_OPEN_MS}ms cubic-bezier(0.22, 0.76, 0.24, 1) forwards;
        }
        .intro-logo-stage {
          position: relative;
          display: grid;
          place-items: center;
          padding: 2.3rem 2.7rem 3rem;
          margin-bottom: 0.35rem;
          perspective: 1200px;
          transform-style: preserve-3d;
          isolation: isolate;
        }
        .intro-logo-aura,
        .intro-logo-ring,
        .intro-logo-ground,
        .intro-logo-shell-gloss,
        .intro-logo-shell-edge,
        .intro-logo-sidewash,
        .intro-logo-sidebeam,
        .intro-logo-burst,
        .intro-logo-shard,
        .intro-logo-spark {
          pointer-events: none;
        }
        .intro-logo-sidewash {
          position: absolute;
          top: 50%;
          width: clamp(4.8rem, 12vw, 7rem);
          height: clamp(10rem, 26vw, 15rem);
          border-radius: 9999px;
          transform: translateY(-50%);
          filter: blur(18px);
          mix-blend-mode: screen;
          opacity: 0.62;
          z-index: 1;
        }
        .intro-logo-sidewash-left {
          left: clamp(0.9rem, 3vw, 1.8rem);
          background:
            radial-gradient(circle at 72% 50%, rgba(196, 242, 255, 0.88) 0%, rgba(103, 205, 255, 0.36) 24%, rgba(103, 205, 255, 0.08) 52%, transparent 78%),
            linear-gradient(90deg, rgba(84, 184, 255, 0.06), rgba(84, 184, 255, 0.22), transparent 76%);
          animation: introLogoSideWashLeft 3.1s ease-in-out infinite;
        }
        .intro-logo-sidewash-right {
          right: clamp(0.9rem, 3vw, 1.8rem);
          background:
            radial-gradient(circle at 28% 50%, rgba(210, 248, 255, 0.82) 0%, rgba(132, 223, 255, 0.34) 22%, rgba(132, 223, 255, 0.08) 52%, transparent 78%),
            linear-gradient(270deg, rgba(84, 184, 255, 0.06), rgba(84, 184, 255, 0.2), transparent 76%);
          animation: introLogoSideWashRight 3.25s ease-in-out infinite;
        }
        .intro-logo-sidebeam {
          position: absolute;
          top: 50%;
          width: clamp(3.8rem, 10vw, 5.4rem);
          height: 2px;
          border-radius: 9999px;
          filter: blur(0.4px);
          mix-blend-mode: screen;
          opacity: 0.72;
          z-index: 2;
        }
        .intro-logo-sidebeam-left {
          left: clamp(1.7rem, 4.5vw, 3rem);
          transform-origin: left center;
          background: linear-gradient(90deg, rgba(218, 249, 255, 0.94), rgba(118, 220, 255, 0.48), transparent);
          box-shadow: 0 0 14px rgba(118, 220, 255, 0.24);
          animation: introLogoSideBeamLeft 2.5s ease-in-out infinite;
        }
        .intro-logo-sidebeam-right {
          right: clamp(1.7rem, 4.5vw, 3rem);
          transform-origin: right center;
          background: linear-gradient(270deg, rgba(218, 249, 255, 0.94), rgba(118, 220, 255, 0.48), transparent);
          box-shadow: 0 0 14px rgba(118, 220, 255, 0.24);
          animation: introLogoSideBeamRight 2.65s ease-in-out infinite;
        }
        .intro-logo-burst {
          position: absolute;
          left: 50%;
          top: 50%;
          border-radius: 9999px;
          transform: translate(-50%, -50%);
          opacity: 0.88;
          mix-blend-mode: screen;
        }
        .intro-logo-burst-outer {
          width: clamp(14rem, 40vw, 22rem);
          height: clamp(14rem, 40vw, 22rem);
          background: radial-gradient(circle, rgba(166, 241, 255, 0.22) 0%, rgba(77, 190, 255, 0.08) 26%, transparent 66%);
          filter: blur(14px);
          animation: introBurstPulse 4.8s ease-in-out infinite;
        }
        .intro-logo-burst-inner {
          width: clamp(10rem, 26vw, 14rem);
          height: clamp(10rem, 26vw, 14rem);
          background: radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(143, 220, 255, 0.16) 24%, transparent 64%);
          filter: blur(10px);
          animation: introBurstPulseInner 3.4s ease-in-out infinite;
        }
        .intro-logo-aura {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 9999px;
          mix-blend-mode: screen;
        }
        .intro-logo-aura-back {
          width: clamp(12rem, 36vw, 19rem);
          height: clamp(12rem, 36vw, 19rem);
          background: radial-gradient(circle, rgba(144, 234, 255, 0.28) 0%, rgba(49, 155, 255, 0.2) 28%, rgba(0, 153, 255, 0.08) 52%, transparent 74%);
          filter: blur(12px);
          opacity: 0.92;
          animation: introLogoAuraPulse 4.4s ease-in-out infinite;
        }
        .intro-logo-aura-front {
          width: clamp(9rem, 24vw, 13rem);
          height: clamp(4rem, 12vw, 6.4rem);
          top: 66%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.28) 0%, rgba(143, 220, 255, 0.16) 48%, transparent 74%);
          filter: blur(10px);
          opacity: 0.76;
        }
        .intro-logo-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          border-radius: 9999px;
          opacity: 0.82;
          filter: drop-shadow(0 0 10px rgba(102, 204, 255, 0.22));
        }
        .intro-logo-ring-outer {
          width: clamp(14rem, 42vw, 20rem);
          height: clamp(5.8rem, 18vw, 8.8rem);
          transform: translate(-50%, -50%) rotateX(74deg);
          background: conic-gradient(from 18deg, transparent 0deg, transparent 60deg, rgba(132, 231, 255, 0.94) 96deg, rgba(255, 255, 255, 0.22) 126deg, transparent 164deg, transparent 256deg, rgba(104, 190, 255, 0.5) 292deg, transparent 340deg);
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
          animation: introOrbitSpin 8.8s linear infinite;
        }
        .intro-logo-ring-inner {
          width: clamp(11rem, 34vw, 16rem);
          height: clamp(4rem, 14vw, 6.4rem);
          transform: translate(-50%, -50%) rotateX(74deg) rotateZ(22deg);
          background: conic-gradient(from 180deg, transparent 0deg, transparent 48deg, rgba(255, 255, 255, 0.12) 92deg, rgba(121, 223, 255, 0.84) 126deg, transparent 168deg, transparent 262deg, rgba(173, 240, 255, 0.44) 314deg, transparent 360deg);
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
          animation: introOrbitSpinReverse 7.2s linear infinite;
        }
        .intro-logo-ground {
          position: absolute;
          left: 50%;
          bottom: 0.7rem;
          width: 72%;
          height: 1rem;
          transform: translateX(-50%);
          border-radius: 9999px;
          background: radial-gradient(ellipse at center, rgba(143, 220, 255, 0.54) 0%, rgba(0, 153, 255, 0.2) 42%, transparent 78%);
          filter: blur(10px);
          opacity: 0.9;
          animation: introGroundPulse 4.4s ease-in-out infinite;
        }
        .intro-logo-shard {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 7.2rem;
          height: 1px;
          transform-origin: left center;
          background: linear-gradient(90deg, rgba(196, 242, 255, 0.92), rgba(102, 204, 255, 0.32), transparent);
          filter: blur(0.6px);
          opacity: 0.48;
        }
        .intro-logo-shard-a {
          transform: translate(1.6rem, -4.2rem) rotate(-20deg);
          animation: introShardDriftA 4.1s ease-in-out infinite;
        }
        .intro-logo-shard-b {
          transform: translate(-7.8rem, -1.6rem) rotate(198deg);
          opacity: 0.38;
          animation: introShardDriftB 3.8s ease-in-out infinite;
        }
        .intro-logo-shard-c {
          transform: translate(2.8rem, 5.4rem) rotate(32deg);
          width: 5.8rem;
          opacity: 0.36;
          animation: introShardDriftC 4.5s ease-in-out infinite;
        }
        .intro-logo-shard-d {
          transform: translate(-6.6rem, 4.1rem) rotate(152deg);
          width: 6.4rem;
          opacity: 0.34;
          animation: introShardDriftD 4.3s ease-in-out infinite;
        }
        .intro-logo-spark {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 0.45rem;
          height: 0.45rem;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.98) 0%, rgba(143, 220, 255, 0.88) 46%, rgba(143, 220, 255, 0) 74%);
          box-shadow: 0 0 12px rgba(143, 220, 255, 0.42);
          opacity: 0;
        }
        .intro-logo-spark-a {
          animation: introSparkOrbitA 2.8s ease-in-out 0.2s infinite;
        }
        .intro-logo-spark-b {
          animation: introSparkOrbitB 3.2s ease-in-out 0.6s infinite;
        }
        .intro-logo-spark-c {
          animation: introSparkOrbitC 3.4s ease-in-out 0.1s infinite;
        }
        .intro-logo-spark-d {
          animation: introSparkOrbitD 2.9s ease-in-out 0.9s infinite;
        }
        .intro-logo-shell {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem 1.45rem;
          border-radius: 2.35rem;
          overflow: hidden;
          transform-style: preserve-3d;
          transform: rotateX(12deg) rotateY(-14deg);
          background: linear-gradient(155deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 32%, rgba(9, 18, 28, 0.84) 100%);
          border: 1px solid rgba(232, 247, 255, 0.22);
          box-shadow: 0 28px 58px rgba(0, 0, 0, 0.38), 0 0 34px rgba(0, 153, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 -18px 28px rgba(3, 9, 16, 0.34);
          backdrop-filter: blur(8px);
          animation: introLogoFloat 4.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
        .intro-logo-shell::after {
          content: "";
          position: absolute;
          inset: -26% -14%;
          background: linear-gradient(115deg, transparent 34%, rgba(255, 255, 255, 0.76) 48%, rgba(143, 220, 255, 0.32) 54%, transparent 68%);
          transform: translate3d(-56%, 0, 28px) rotate(8deg);
          filter: blur(3px);
          opacity: 0;
          animation: introLogoSheen 4.4s ease-in-out 0.55s infinite;
        }
        .intro-logo-shell-gloss {
          position: absolute;
          inset: 10px;
          border-radius: 1.8rem;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.02) 38%, rgba(84, 184, 255, 0.1) 100%), radial-gradient(circle at 24% 16%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.08) 34%, transparent 52%);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 0 24px rgba(84, 184, 255, 0.08);
          transform: translateZ(12px);
        }
        .intro-logo-shell-edge {
          position: absolute;
          left: 16%;
          right: 16%;
          bottom: 14px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(143, 220, 255, 0.82), transparent);
          box-shadow: 0 0 14px rgba(84, 184, 255, 0.24);
          opacity: 0.82;
          transform: translateZ(22px);
        }
        .intro-logo-mark {
          position: relative;
          z-index: 2;
          transform: translateZ(42px) scale(1.01);
          filter: drop-shadow(0 0 14px rgba(0, 153, 255, 0.52));
          animation: introLogoPulse ${INTRO_LOGO_PULSE_MS}ms ease-out, introLogoHover 4.8s ease-in-out ${INTRO_LOGO_PULSE_MS}ms infinite;
        }
        .intro-welcome {
          margin-top: 1.1rem;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(214, 244, 255, 0.76);
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 320ms ease-out, transform 320ms ease-out;
          text-shadow: 0 0 14px rgba(84, 184, 255, 0.16);
        }
        .intro-welcome-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes introBackdropGlow {
          0% {
            opacity: 1;
            filter: brightness(1);
          }
          45% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            filter: brightness(0.96);
          }
        }
        @keyframes introGridShift {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(46px, 46px, 0);
          }
        }
        @keyframes introHazeDriftLeft {
          0%, 100% {
            transform: translateY(-50%) translateX(0) scale(0.96);
            opacity: 0.34;
          }
          50% {
            transform: translateY(-50%) translateX(3rem) scale(1.04);
            opacity: 0.58;
          }
        }
        @keyframes introHazeDriftRight {
          0%, 100% {
            transform: translateY(-50%) translateX(0) scale(0.98);
            opacity: 0.28;
          }
          50% {
            transform: translateY(-50%) translateX(-2.4rem) scale(1.06);
            opacity: 0.5;
          }
        }
        @keyframes introBeamSweepA {
          0%, 100% {
            opacity: 0.26;
            transform: translate(-50%, -50%) rotate(12deg) scaleX(0.84);
          }
          50% {
            opacity: 0.62;
            transform: translate(-50%, -50%) rotate(20deg) scaleX(1.06);
          }
        }
        @keyframes introBeamSweepB {
          0%, 100% {
            opacity: 0.2;
            transform: translate(-50%, -50%) rotate(-30deg) scaleX(0.76);
          }
          50% {
            opacity: 0.46;
            transform: translate(-50%, -50%) rotate(-24deg) scaleX(1);
          }
        }
        @keyframes introBeamSweepC {
          0%, 100% {
            opacity: 0.12;
            transform: translate(-50%, -50%) rotate(84deg) scaleX(0.78);
          }
          50% {
            opacity: 0.34;
            transform: translate(-50%, -50%) rotate(90deg) scaleX(1.08);
          }
        }
        @keyframes introLogoSideWashLeft {
          0%, 100% {
            opacity: 0.32;
            transform: translateY(-50%) translateX(-6px) scaleY(0.92) scaleX(0.9);
          }
          50% {
            opacity: 0.84;
            transform: translateY(-50%) translateX(3px) scaleY(1.04) scaleX(1.06);
          }
        }
        @keyframes introLogoSideWashRight {
          0%, 100% {
            opacity: 0.3;
            transform: translateY(-50%) translateX(6px) scaleY(0.92) scaleX(0.9);
          }
          50% {
            opacity: 0.82;
            transform: translateY(-50%) translateX(-3px) scaleY(1.04) scaleX(1.06);
          }
        }
        @keyframes introLogoSideBeamLeft {
          0%, 100% {
            opacity: 0.28;
            transform: translateY(-1.9rem) rotate(-18deg) scaleX(0.54);
          }
          50% {
            opacity: 0.96;
            transform: translateY(-0.4rem) rotate(-8deg) scaleX(1);
          }
        }
        @keyframes introLogoSideBeamRight {
          0%, 100% {
            opacity: 0.26;
            transform: translateY(1.9rem) rotate(18deg) scaleX(0.54);
          }
          50% {
            opacity: 0.94;
            transform: translateY(0.4rem) rotate(8deg) scaleX(1);
          }
        }
        @keyframes introSideRailLeft {
          0%, 100% {
            opacity: 0.18;
            transform: translateX(0) scaleY(0.92);
          }
          50% {
            opacity: 0.48;
            transform: translateX(3px) scaleY(1.02);
          }
        }
        @keyframes introSideRailRight {
          0%, 100% {
            opacity: 0.16;
            transform: translateX(0) scaleY(0.9);
          }
          50% {
            opacity: 0.42;
            transform: translateX(-3px) scaleY(1.02);
          }
        }
        @keyframes introSideFlareLeft {
          0%, 100% {
            opacity: 0.18;
            transform: translateX(0) scaleX(0.88);
          }
          50% {
            opacity: 0.42;
            transform: translateX(0.8rem) scaleX(1.04);
          }
        }
        @keyframes introSideFlareRight {
          0%, 100% {
            opacity: 0.14;
            transform: translateX(0) scaleX(0.86);
          }
          50% {
            opacity: 0.36;
            transform: translateX(-0.9rem) scaleX(1.04);
          }
        }
        @keyframes introDoorLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-104%);
          }
        }
        @keyframes introDoorRight {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(104%);
          }
        }
        @keyframes introLogoPulse {
          0% {
            opacity: 0;
            transform: translateZ(6px) scale(0.78) rotate(-5deg);
            filter: blur(4px) drop-shadow(0 0 0 rgba(0, 153, 255, 0));
          }
          65% {
            opacity: 1;
            transform: translateZ(48px) scale(1.06) rotate(1deg);
            filter: blur(0) drop-shadow(0 0 16px rgba(0, 153, 255, 0.68));
          }
          100% {
            transform: translateZ(42px) scale(1.01);
            filter: blur(0) drop-shadow(0 0 12px rgba(0, 153, 255, 0.52));
          }
        }
        @keyframes introLogoHover {
          0%, 100% {
            transform: translateZ(42px) translateY(0) scale(1.01);
            filter: drop-shadow(0 0 12px rgba(0, 153, 255, 0.52));
          }
          50% {
            transform: translateZ(50px) translateY(-4px) scale(1.03);
            filter: drop-shadow(0 0 18px rgba(102, 219, 255, 0.68));
          }
        }
        @keyframes introLogoFloat {
          0%, 100% {
            transform: rotateX(12deg) rotateY(-14deg) translateY(0);
          }
          50% {
            transform: rotateX(8deg) rotateY(12deg) translateY(-8px);
          }
        }
        @keyframes introLogoAuraPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.94);
            opacity: 0.72;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.06);
            opacity: 1;
          }
        }
        @keyframes introBurstPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.86);
            opacity: 0.42;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.06);
            opacity: 0.84;
          }
        }
        @keyframes introBurstPulseInner {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.92);
            opacity: 0.38;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08);
            opacity: 0.76;
          }
        }
        @keyframes introGroundPulse {
          0%, 100% {
            transform: translateX(-50%) scaleX(0.88);
            opacity: 0.74;
          }
          50% {
            transform: translateX(-50%) scaleX(1.02);
            opacity: 1;
          }
        }
        @keyframes introShardDriftA {
          0%, 100% {
            transform: translate(1.6rem, -4.2rem) rotate(-20deg) scaleX(0.86);
            opacity: 0.26;
          }
          50% {
            transform: translate(2.4rem, -4.9rem) rotate(-12deg) scaleX(1.12);
            opacity: 0.58;
          }
        }
        @keyframes introShardDriftB {
          0%, 100% {
            transform: translate(-7.8rem, -1.6rem) rotate(198deg) scaleX(0.82);
            opacity: 0.18;
          }
          50% {
            transform: translate(-8.5rem, -2.3rem) rotate(206deg) scaleX(1.08);
            opacity: 0.48;
          }
        }
        @keyframes introShardDriftC {
          0%, 100% {
            transform: translate(2.8rem, 5.4rem) rotate(32deg) scaleX(0.86);
            opacity: 0.18;
          }
          50% {
            transform: translate(3.4rem, 6rem) rotate(38deg) scaleX(1.08);
            opacity: 0.44;
          }
        }
        @keyframes introShardDriftD {
          0%, 100% {
            transform: translate(-6.6rem, 4.1rem) rotate(152deg) scaleX(0.8);
            opacity: 0.16;
          }
          50% {
            transform: translate(-7.2rem, 4.8rem) rotate(160deg) scaleX(1.04);
            opacity: 0.42;
          }
        }
        @keyframes introOrbitSpin {
          0% {
            transform: translate(-50%, -50%) rotateX(74deg) rotateZ(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotateX(74deg) rotateZ(360deg);
          }
        }
        @keyframes introOrbitSpinReverse {
          0% {
            transform: translate(-50%, -50%) rotateX(74deg) rotateZ(22deg);
          }
          100% {
            transform: translate(-50%, -50%) rotateX(74deg) rotateZ(-338deg);
          }
        }
        @keyframes introLogoSheen {
          0% {
            opacity: 0;
            transform: translate3d(-56%, 0, 28px) rotate(8deg);
          }
          18% {
            opacity: 0.88;
          }
          52% {
            opacity: 0;
            transform: translate3d(56%, 0, 28px) rotate(8deg);
          }
          100% {
            opacity: 0;
            transform: translate3d(56%, 0, 28px) rotate(8deg);
          }
        }
        @keyframes introSparkOrbitA {
          0% {
            transform: translate(-1rem, 0.2rem) scale(0.2);
            opacity: 0;
          }
          18% {
            opacity: 1;
          }
          100% {
            transform: translate(7rem, -4.6rem) scale(1);
            opacity: 0;
          }
        }
        @keyframes introSparkOrbitB {
          0% {
            transform: translate(0.4rem, -0.8rem) scale(0.2);
            opacity: 0;
          }
          16% {
            opacity: 1;
          }
          100% {
            transform: translate(-6.2rem, -5.4rem) scale(0.9);
            opacity: 0;
          }
        }
        @keyframes introSparkOrbitC {
          0% {
            transform: translate(-0.2rem, 0.6rem) scale(0.2);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translate(6rem, 5.4rem) scale(1);
            opacity: 0;
          }
        }
        @keyframes introSparkOrbitD {
          0% {
            transform: translate(0.2rem, 0.2rem) scale(0.2);
            opacity: 0;
          }
          18% {
            opacity: 1;
          }
          100% {
            transform: translate(-5.8rem, 5rem) scale(0.95);
            opacity: 0;
          }
        }
        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-start infinite;
        }

        .portfolio-main-text {
          position: relative;
        }
        .portfolio-main-text::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          font: inherit;
          line-height: inherit;
          letter-spacing: inherit;
          color: transparent;
          background-image: linear-gradient(135deg, rgba(255,255,255,0.72), rgba(143,220,255,0.22) 42%, rgba(255,255,255,0.5));
          background-size: 160% 160%;
          background-position: 50% 50%;
          -webkit-background-clip: text;
          background-clip: text;
          pointer-events: none;
          opacity: 0.06;
        }

        @keyframes pulseSlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulseSlow 2s infinite;
        }
        .video-carousel-stage-sweep {
          position: absolute;
          inset: -12% -10%;
          pointer-events: none;
          opacity: 0;
          background:
            linear-gradient(
              115deg,
              transparent 0%,
              rgba(132, 223, 255, 0.04) 26%,
              rgba(214, 248, 255, 0.42) 48%,
              rgba(0, 153, 255, 0.22) 58%,
              transparent 80%
            );
          mix-blend-mode: screen;
          filter: blur(1px);
        }
        .video-carousel-stage-sweep--from-right,
        .video-carousel-stage-sweep--from-right-a,
        .video-carousel-stage-sweep--from-right-b {
          animation: videoCarouselSweepFromRight 720ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .video-carousel-stage-sweep--from-left,
        .video-carousel-stage-sweep--from-left-a,
        .video-carousel-stage-sweep--from-left-b {
          animation: videoCarouselSweepFromLeft 720ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .video-carousel-track-shift--to-left-a,
        .video-carousel-track-shift--to-left-b {
          will-change: transform, filter;
        }
        .video-carousel-track-shift--to-right-a,
        .video-carousel-track-shift--to-right-b {
          will-change: transform, filter;
        }
        .video-carousel-track-shift--to-left-a {
          animation: videoCarouselTrackToLeft 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .video-carousel-track-shift--to-left-b {
          animation: videoCarouselTrackToLeft 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .video-carousel-track-shift--to-right-a {
          animation: videoCarouselTrackToRight 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .video-carousel-track-shift--to-right-b {
          animation: videoCarouselTrackToRight 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .video-carousel-card-active {
          will-change: transform, filter;
        }
        .video-carousel-card-active--from-right {
          animation: videoCarouselCardFromRight 680ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .video-carousel-card-active--from-left {
          animation: videoCarouselCardFromLeft 680ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .video-carousel-card-glow {
          opacity: 0.34;
          animation: videoCarouselCardGlow 760ms ease-out both;
        }
        .video-carousel-meta-switch {
          will-change: transform, opacity;
        }
        .video-carousel-meta-switch--from-right,
        .video-carousel-meta-switch--from-right-a,
        .video-carousel-meta-switch--from-right-b {
          animation: videoCarouselMetaFromRight 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .video-carousel-meta-switch--from-left,
        .video-carousel-meta-switch--from-left-a,
        .video-carousel-meta-switch--from-left-b {
          animation: videoCarouselMetaFromLeft 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .motion-lite .intro-door-left-open,
        .motion-lite .intro-door-right-open {
          animation-duration: ${INTRO_DOOR_OPEN_MOTION_LITE_MS}ms;
        }
        .motion-lite .intro-logo-mark {
          animation: introLogoPulse ${INTRO_LOGO_PULSE_MOTION_LITE_MS}ms ease-out forwards !important;
          filter: drop-shadow(0 0 10px rgba(0, 153, 255, 0.38));
        }
        .motion-lite .intro-logo-shell {
          animation: none !important;
          transform: rotateX(8deg) rotateY(-10deg);
          box-shadow: 0 18px 34px rgba(0, 0, 0, 0.3), 0 0 18px rgba(0, 153, 255, 0.14), inset 0 0 12px rgba(255, 255, 255, 0.05);
        }
        .motion-lite .intro-logo-aura-back,
        .motion-lite .intro-logo-aura-front,
        .motion-lite .intro-logo-ground,
        .motion-lite .intro-logo-ring,
        .motion-lite .intro-logo-sidewash,
        .motion-lite .intro-logo-sidebeam,
        .motion-lite .intro-logo-burst,
        .motion-lite .intro-logo-shard,
        .motion-lite .intro-logo-spark,
        .motion-lite .intro-atmosphere-grid,
        .motion-lite .intro-atmosphere-haze,
        .motion-lite .intro-atmosphere-beam,
        .motion-lite .intro-side-rail,
        .motion-lite .intro-side-flare {
          animation: none !important;
        }
        .motion-lite .intro-logo-shell::after {
          animation: none !important;
          opacity: 0.18;
        }
        .motion-lite .intro-atmosphere-grid {
          opacity: 0.06;
        }
        .motion-lite .intro-logo-burst-outer,
        .motion-lite .intro-logo-burst-inner,
        .motion-lite .intro-logo-sidewash,
        .motion-lite .intro-logo-sidebeam,
        .motion-lite .intro-logo-shard,
        .motion-lite .intro-logo-spark,
        .motion-lite .intro-atmosphere-beam,
        .motion-lite .intro-side-rail,
        .motion-lite .intro-side-flare {
          opacity: 0.12;
        }
        .motion-lite .video-carousel-stage-sweep,
        .motion-lite .video-carousel-stage-sweep--from-right-a,
        .motion-lite .video-carousel-stage-sweep--from-right-b,
        .motion-lite .video-carousel-stage-sweep--from-left-a,
        .motion-lite .video-carousel-stage-sweep--from-left-b,
        .motion-lite .video-carousel-track-shift--to-left-a,
        .motion-lite .video-carousel-track-shift--to-left-b,
        .motion-lite .video-carousel-track-shift--to-right-a,
        .motion-lite .video-carousel-track-shift--to-right-b,
        .motion-lite .video-carousel-card-active--from-right,
        .motion-lite .video-carousel-card-active--from-left,
        .motion-lite .video-carousel-card-glow,
        .motion-lite .video-carousel-meta-switch--from-right-a,
        .motion-lite .video-carousel-meta-switch--from-right-b,
        .motion-lite .video-carousel-meta-switch--from-left-a,
        .motion-lite .video-carousel-meta-switch--from-left-b,
        .motion-lite .video-carousel-meta-switch--from-right,
        .motion-lite .video-carousel-meta-switch--from-left {
          animation: none !important;
        }
        @keyframes videoCarouselSweepFromRight {
          0% {
            opacity: 0;
            transform: translate3d(42%, 0, 0) skewX(-18deg) scaleX(0.94);
          }
          18% {
            opacity: 0.92;
          }
          100% {
            opacity: 0;
            transform: translate3d(-42%, 0, 0) skewX(-18deg) scaleX(1.04);
          }
        }
        @keyframes videoCarouselSweepFromLeft {
          0% {
            opacity: 0;
            transform: translate3d(-42%, 0, 0) skewX(18deg) scaleX(0.94);
          }
          18% {
            opacity: 0.92;
          }
          100% {
            opacity: 0;
            transform: translate3d(42%, 0, 0) skewX(18deg) scaleX(1.04);
          }
        }
        @keyframes videoCarouselTrackToLeft {
          0% {
            transform: translate3d(30px, 0, 0) scale(0.985);
            filter: blur(2px);
          }
          55% {
            transform: translate3d(-8px, 0, 0) scale(1.008);
            filter: blur(0);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0);
          }
        }
        @keyframes videoCarouselTrackToRight {
          0% {
            transform: translate3d(-30px, 0, 0) scale(0.985);
            filter: blur(2px);
          }
          55% {
            transform: translate3d(8px, 0, 0) scale(1.008);
            filter: blur(0);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0);
          }
        }
        @keyframes videoCarouselCardFromRight {
          0% {
            transform: translate3d(18px, 0, 0) scale(0.84) rotate(6deg);
            filter: blur(6px);
          }
          58% {
            transform: translate3d(0, 0, 0) scale(1.035) rotate(-1.2deg);
            filter: blur(0);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0);
            filter: blur(0);
          }
        }
        @keyframes videoCarouselCardFromLeft {
          0% {
            transform: translate3d(-18px, 0, 0) scale(0.84) rotate(-6deg);
            filter: blur(6px);
          }
          58% {
            transform: translate3d(0, 0, 0) scale(1.035) rotate(1.2deg);
            filter: blur(0);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0);
            filter: blur(0);
          }
        }
        @keyframes videoCarouselCardGlow {
          0% {
            opacity: 0;
            transform: scale(0.92);
          }
          40% {
            opacity: 0.56;
          }
          100% {
            opacity: 0.34;
            transform: scale(1);
          }
        }
        @keyframes videoCarouselMetaFromRight {
          0% {
            opacity: 0;
            transform: translate3d(28px, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes videoCarouselMetaFromLeft {
          0% {
            opacity: 0;
            transform: translate3d(-28px, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .creative-stack-showcase {
          isolation: isolate;
          overflow: visible;
        }
        .creative-stack-stage-noise {
          inset: 3% 2% 7%;
          border-radius: 2.4rem;
          opacity: 0.1;
          background:
            radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.16) 0%, transparent 14%),
            radial-gradient(circle at 78% 76%, rgba(255, 255, 255, 0.12) 0%, transparent 12%),
            radial-gradient(circle at 50% 48%, rgba(255, 255, 255, 0.08) 0%, transparent 8%),
            radial-gradient(circle at 50% 50%, rgba(10, 22, 38, 0.72) 0%, rgba(8, 14, 24, 0.32) 42%, transparent 78%);
          pointer-events: none;
        }
        .creative-stack-stage-grid {
          inset: 4% 3% 8%;
          border-radius: 2.4rem;
          opacity: 0.06;
          background-image:
            linear-gradient(rgba(196, 242, 255, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(196, 242, 255, 0.08) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(circle at 50% 48%, black 24%, rgba(0, 0, 0, 0.9) 54%, transparent 88%);
          pointer-events: none;
        }
        .creative-stack-stage-glow {
          position: absolute;
          top: 12%;
          bottom: 12%;
          width: clamp(6.5rem, 16vw, 11rem);
          opacity: 0.26;
          filter: blur(32px);
          mix-blend-mode: screen;
          will-change: transform, opacity;
        }
        .creative-stack-stage-glow-left {
          left: -2rem;
          background: linear-gradient(90deg, rgba(102, 204, 255, 0.24), rgba(102, 204, 255, 0.08), transparent);
          animation: creativeStackGlowLeft 8.8s ease-in-out infinite;
        }
        .creative-stack-stage-glow-right {
          right: -2rem;
          background: linear-gradient(270deg, rgba(184, 149, 255, 0.2), rgba(184, 149, 255, 0.06), transparent);
          animation: creativeStackGlowRight 9.2s ease-in-out infinite;
        }
        .creative-stack-stage-beam {
          position: absolute;
          left: 50%;
          height: 1px;
          border-radius: 9999px;
          background: linear-gradient(90deg, transparent, rgba(214, 248, 255, 0.9), rgba(102, 204, 255, 0.24), transparent);
          mix-blend-mode: screen;
          opacity: 0.3;
          will-change: transform, opacity;
        }
        .creative-stack-stage-beam-a {
          top: 24%;
          width: min(74vw, 46rem);
          transform: translateX(-50%) rotate(16deg);
          animation: creativeStackBeamA 6.8s ease-in-out infinite;
        }
        .creative-stack-stage-beam-b {
          bottom: 22%;
          width: min(70vw, 42rem);
          transform: translateX(-50%) rotate(-12deg);
          opacity: 0.22;
          animation: creativeStackBeamB 7.4s ease-in-out infinite;
        }
        .creative-stack-stage-arc {
          position: absolute;
          left: 50%;
          width: min(82%, 48rem);
          height: 12.5rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          filter: drop-shadow(0 0 16px rgba(102, 204, 255, 0.1));
          opacity: 0.48;
          transform: translateX(-50%);
        }
        .creative-stack-stage-arc-top {
          top: -8.2rem;
        }
        .creative-stack-stage-arc-bottom {
          bottom: -8rem;
        }
        .creative-stack-core-bloom,
        .creative-stack-core-orbit,
        .creative-stack-core-pillar,
        .creative-tool-feature-ring,
        .creative-tool-feature-sheen {
          pointer-events: none;
        }
        .creative-stack-core-bloom {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 22rem;
          height: 22rem;
          transform: translate(-50%, -50%);
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(136, 230, 255, 0.16) 0%, rgba(70, 165, 255, 0.08) 34%, transparent 74%);
          filter: blur(30px);
          opacity: 0.9;
        }
        .creative-stack-core-orbit {
          position: absolute;
          left: 50%;
          top: 50%;
          border-radius: 9999px;
          will-change: transform;
        }
        .creative-stack-core-orbit-a {
          width: min(36rem, 68vw);
          height: 9rem;
          border: 1px solid rgba(166, 241, 255, 0.16);
          box-shadow: inset 0 0 20px rgba(102, 204, 255, 0.08);
          transform: translate(-50%, -50%) rotateX(76deg);
          animation: creativeStackOrbit 11s linear infinite;
        }
        .creative-stack-core-orbit-b {
          width: min(30rem, 56vw);
          height: 6.8rem;
          border: 1px solid rgba(184, 149, 255, 0.14);
          transform: translate(-50%, -50%) rotateX(76deg) rotateZ(18deg);
          animation: creativeStackOrbitReverse 8.4s linear infinite;
        }
        .creative-stack-core-orbit-c {
          width: 14rem;
          height: 14rem;
          border: 1px solid rgba(255, 255, 255, 0.06);
          transform: translate(-50%, -50%);
          opacity: 0.36;
          animation: creativeStackOrbitCircle 12.8s linear infinite;
        }
        .creative-stack-core-pillar {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 7.25rem;
          height: 7.25rem;
          transform: translate(-50%, -50%) rotate(45deg);
          border-radius: 2rem;
          border: 1px solid rgba(232, 247, 255, 0.14);
          background:
            linear-gradient(155deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(6, 12, 22, 0.5) 100%),
            radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.22), transparent 54%);
          box-shadow:
            0 16px 36px rgba(0, 0, 0, 0.2),
            0 0 28px rgba(102, 204, 255, 0.12);
          backdrop-filter: blur(10px);
          opacity: 0.72;
        }
        .creative-tool-shell {
          transform: translate3d(0, var(--creative-tool-lift, 0px), 0) rotate(var(--creative-tool-rotate, 0deg));
          transition:
            transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 240ms ease,
            filter 240ms ease;
          will-change: transform;
          filter: saturate(1);
        }
        .creative-tool-shell:hover {
          transform: translate3d(0, calc(var(--creative-tool-lift, 0px) - 10px), 0) rotate(var(--creative-tool-hover-rotate, 0deg));
          border-color: rgba(255, 255, 255, 0.22);
          filter: brightness(1.05) saturate(1.05);
        }
        .creative-tool-shell-featured {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 0 0 1px rgba(255, 255, 255, 0.03);
        }
        .creative-tool-shell-grid {
          opacity: 0.06;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
          background-size: 24px 24px;
          mask-image: linear-gradient(180deg, black 0%, rgba(0, 0, 0, 0.76) 48%, transparent 100%);
        }
        .creative-tool-shell-beam {
          mix-blend-mode: screen;
          opacity: 0.82;
        }
        .creative-tool-feature-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          border-radius: 9999px;
          opacity: 0.56;
          filter: drop-shadow(0 0 12px rgba(102, 204, 255, 0.16));
          will-change: transform;
        }
        .creative-tool-feature-ring-a {
          width: 82%;
          height: 22%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          transform: translate(-50%, -50%) rotateX(76deg);
          animation: creativeStackOrbit 9s linear infinite;
        }
        .creative-tool-feature-ring-b {
          width: 68%;
          height: 18%;
          border: 1px solid rgba(184, 149, 255, 0.16);
          transform: translate(-50%, -50%) rotateX(76deg) rotateZ(18deg);
          animation: creativeStackOrbitReverse 6.8s linear infinite;
        }
        .creative-tool-feature-sheen {
          position: absolute;
          inset: -16% -12%;
          background: linear-gradient(112deg, transparent 34%, rgba(255, 255, 255, 0.52) 48%, rgba(184, 149, 255, 0.18) 54%, transparent 68%);
          transform: translateX(-58%) rotate(8deg);
          filter: blur(6px);
          opacity: 0;
          animation: creativeToolFeaturedSheen 4.8s ease-in-out 0.5s infinite;
        }
        .creative-stack-showcase-lite .creative-stack-stage-glow,
        .creative-stack-showcase-lite .creative-stack-stage-beam,
        .creative-stack-showcase-lite .creative-stack-core-orbit,
        .creative-stack-showcase-lite .creative-tool-feature-ring,
        .creative-stack-showcase-lite .creative-tool-feature-sheen {
          animation: none !important;
        }
        .creative-stack-showcase-lite .creative-stack-stage-glow {
          opacity: 0.18;
        }
        @keyframes creativeStackGlowLeft {
          0%, 100% {
            opacity: 0.16;
            transform: translateX(0) scaleX(0.9);
          }
          50% {
            opacity: 0.42;
            transform: translateX(1rem) scaleX(1.06);
          }
        }
        @keyframes creativeStackGlowRight {
          0%, 100% {
            opacity: 0.14;
            transform: translateX(0) scaleX(0.88);
          }
          50% {
            opacity: 0.38;
            transform: translateX(-1rem) scaleX(1.04);
          }
        }
        @keyframes creativeStackBeamA {
          0%, 100% {
            opacity: 0.18;
            transform: translateX(-50%) rotate(12deg) scaleX(0.82);
          }
          50% {
            opacity: 0.52;
            transform: translateX(-50%) rotate(18deg) scaleX(1.04);
          }
        }
        @keyframes creativeStackBeamB {
          0%, 100% {
            opacity: 0.14;
            transform: translateX(-50%) rotate(-16deg) scaleX(0.76);
          }
          50% {
            opacity: 0.38;
            transform: translateX(-50%) rotate(-8deg) scaleX(1);
          }
        }
        @keyframes creativeStackOrbit {
          0% {
            transform: translate(-50%, -50%) rotateX(76deg) rotateZ(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotateX(76deg) rotateZ(360deg);
          }
        }
        @keyframes creativeStackOrbitReverse {
          0% {
            transform: translate(-50%, -50%) rotateX(76deg) rotateZ(18deg);
          }
          100% {
            transform: translate(-50%, -50%) rotateX(76deg) rotateZ(-342deg);
          }
        }
        @keyframes creativeStackOrbitCircle {
          0% {
            transform: translate(-50%, -50%) scale(0.94) rotate(0deg);
            opacity: 0.22;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.04) rotate(180deg);
            opacity: 0.4;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.94) rotate(360deg);
            opacity: 0.22;
          }
        }
        @keyframes creativeToolFeaturedSheen {
          0% {
            opacity: 0;
            transform: translateX(-58%) rotate(8deg);
          }
          20% {
            opacity: 0.72;
          }
          56% {
            opacity: 0;
            transform: translateX(58%) rotate(8deg);
          }
          100% {
            opacity: 0;
            transform: translateX(58%) rotate(8deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .creative-stack-stage-glow,
          .creative-stack-stage-beam,
          .creative-stack-core-orbit,
          .creative-tool-feature-ring,
          .creative-tool-feature-sheen {
            animation: none !important;
          }
          .creative-tool-shell,
          .creative-tool-shell:hover {
            transform: none !important;
          }
          .video-carousel-stage-sweep,
          .video-carousel-stage-sweep--from-right-a,
          .video-carousel-stage-sweep--from-right-b,
          .video-carousel-stage-sweep--from-left-a,
          .video-carousel-stage-sweep--from-left-b,
          .video-carousel-track-shift--to-left-a,
          .video-carousel-track-shift--to-left-b,
          .video-carousel-track-shift--to-right-a,
          .video-carousel-track-shift--to-right-b,
          .video-carousel-card-active--from-right,
          .video-carousel-card-active--from-left,
          .video-carousel-card-glow,
          .video-carousel-meta-switch--from-right-a,
          .video-carousel-meta-switch--from-right-b,
          .video-carousel-meta-switch--from-left-a,
          .video-carousel-meta-switch--from-left-b,
          .video-carousel-meta-switch--from-right,
          .video-carousel-meta-switch--from-left {
            animation: none !important;
          }
        }
      `}</style>


      
    </div>

    
  );
}




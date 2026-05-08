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
import { FloatingDock, type FloatingDockItem } from "@/components/ui/floating-dock";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Lens } from "@/components/ui/lens";
import AnimatedTestimonialsDemo from "@/components/animated-testimonials-demo";
import AuroraBackgroundDemo from "@/components/aurora-background-demo";
import {
  type CreativeExperienceEntry,
  defaultExperienceEntries,
  EXPERIENCE_CONTENT_UPDATED_AT_KEY,
  EXPERIENCE_STORAGE_KEY,
  EXPERIENCE_UPDATED_EVENT,
  normalizeExperienceEntries,
  parseExperienceEntries,
  PORTFOLIO_CONTENT_UPDATED_AT_KEY,
  PORTFOLIO_SYNC_CHANNEL_NAME,
  PORTFOLIO_STORAGE_KEY,
  PORTFOLIO_UPDATED_EVENT,
  fetchPortfolioContentFromSupabase,
} from "@/lib/portfolio-data";
import {
  Home as HomeIcon,
  User,
  Video,
  MessageSquareQuote,
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

type AboutExperienceSectionProps = {
  aboutRef: React.RefObject<HTMLDivElement | null>;
  showAbout: boolean;
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
          className={`mx-auto max-w-3xl text-center transition-[opacity,transform] duration-500 ease-out ${
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
  showAbout,
  helloVisible,
  aboutFullName,
  nameText,
  nameDone,
  onViewClientEdits,
  highlightCards,
  snapshotStats,
  experienceEntries,
  experienceContentVersion,
}: AboutExperienceSectionProps) {
  return (
    <FreshAboutExperienceSection
      aboutRef={aboutRef}
      showAbout={showAbout}
      helloVisible={helloVisible}
      aboutFullName={aboutFullName}
      nameText={nameText}
      nameDone={nameDone}
      onViewClientEdits={onViewClientEdits}
      highlightCards={highlightCards}
      snapshotStats={snapshotStats}
      experienceEntries={experienceEntries}
      experienceContentVersion={experienceContentVersion}
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
                  className={`mt-5 max-w-2xl text-sm leading-relaxed text-white/70 transition-[opacity,transform] duration-420 ease-out sm:text-base ${
                    helloVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  }`}
                  style={{ transitionDelay: "0.12s" }}
                >
                  Video editor, graphic designer, and BSIT senior focused on clean storytelling, polished visuals, and smooth client collaboration.
                </p>

                <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-[#c7efff]/74">
                  Video Editor • Graphic Designer • BSIT Senior
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
  showAbout,
  helloVisible,
  aboutFullName,
  nameText,
  nameDone,
  onViewClientEdits,
  highlightCards,
  snapshotStats,
  experienceEntries,
  experienceContentVersion,
}: AboutExperienceSectionProps) {
  return (
    <div
      ref={aboutRef}
      className="relative -mt-10 flex flex-col items-center overflow-visible pt-10 transition-all duration-700 ease-out lg:-mt-14 lg:pt-14"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-[-3rem] h-32 bg-[linear-gradient(180deg,rgba(5,9,14,0.6)_0%,rgba(7,12,18,0.3)_42%,rgba(9,14,21,0)_100%)] blur-2xl" />
        <div className="absolute inset-x-[4%] top-[-8.5rem] h-56 bg-[radial-gradient(ellipse_at_top,rgba(46,92,135,0.14)_0%,rgba(30,57,86,0.12)_28%,rgba(14,24,35,0.1)_50%,rgba(9,14,21,0)_76%)] blur-3xl" />
        <div className="absolute inset-x-[14%] top-[-3.75rem] h-24 bg-[linear-gradient(180deg,rgba(62,118,160,0.06)_0%,rgba(33,66,96,0.05)_42%,rgba(9,14,21,0)_100%)] blur-2xl" />
        <div className="absolute left-[4%] top-[12%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(126,136,255,0.16)_0%,transparent_72%)] blur-3xl" />
        <div className="absolute right-[4%] top-[18%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(99,210,255,0.14)_0%,transparent_72%)] blur-3xl" />
        <div className="absolute inset-x-[18%] top-[7.75rem] h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
        <div className="absolute inset-x-[12%] bottom-[18%] h-44 bg-[radial-gradient(circle,rgba(84,184,255,0.08)_0%,transparent_72%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-2 sm:px-4 lg:px-6">
        <div
          className={`mx-auto max-w-3xl text-center transition-[opacity,transform] duration-500 ease-out ${
            showAbout ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
          }`}
        >
          <span className="inline-flex items-center rounded-full border border-white/14 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c7efff]">
            Creative Profile
          </span>
          <h2
            className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-[3.15rem]"
            style={{
              fontFamily: "'CreatoDisplay', sans-serif",
              letterSpacing: "0.03em",
              textShadow: "0 0 18px rgba(0,153,255,0.14)",
            }}
          >
            About me and video editing experience.
          </h2>
          <div className="mx-auto mt-4 h-[3px] w-20 rounded-full bg-[linear-gradient(90deg,#6677ff_0%,#54b8ff_52%,#74ebff_100%)] shadow-[0_0_18px_rgba(84,184,255,0.42)]" />
          <p className="mx-auto mt-4 max-w-xl text-[13px] leading-relaxed text-white/68 sm:text-[15px]">
            A straightforward look at my background and editing work.
          </p>
        </div>

        <div className="mt-6 grid gap-10">
          <section
            className={`relative overflow-visible transition-[opacity,transform] duration-500 ease-out ${
              helloVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-10 bottom-0">
              <div className="absolute left-[8%] top-[4%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(126,136,255,0.2)_0%,transparent_72%)] blur-3xl" />
              <div className="absolute right-[6%] top-[24%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(99,210,255,0.16)_0%,transparent_72%)] blur-3xl" />
              <div className="absolute inset-x-[12%] bottom-[8%] h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
            </div>

            <div className="relative z-10">
              <div className="mt-2 grid gap-5 lg:grid-cols-[minmax(330px,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-6">
                <div className="relative overflow-hidden rounded-[36px] border border-white/12 bg-[radial-gradient(circle_at_50%_14%,rgba(255,255,255,0.22),rgba(255,255,255,0.06)_34%,rgba(4,10,19,0.82)_100%)] shadow-[0_28px_70px_rgba(0,0,0,0.28)]">
                  <div className="absolute inset-x-[10%] top-[6%] h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" />
                  <div className="absolute left-[-4%] top-[18%] h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(126,136,255,0.2)_0%,transparent_72%)] blur-3xl" />
                  <div className="absolute right-[0%] bottom-[8%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(99,210,255,0.2)_0%,transparent_72%)] blur-3xl" />
                  <div className="absolute inset-x-[14%] bottom-[10%] h-28 rounded-full bg-[radial-gradient(circle,rgba(126,136,255,0.18)_0%,transparent_72%)] blur-3xl" />
                  <div className="absolute right-5 top-5 z-10 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/12 bg-[linear-gradient(135deg,rgba(10,27,42,0.9),rgba(12,46,74,0.72))] shadow-[0_12px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
                    <Image
                      src="/logo.png"
                      alt="Wence logo"
                      width={34}
                      height={34}
                      className="h-auto w-[30px] drop-shadow-[0_6px_12px_rgba(255,255,255,0.08)]"
                    />
                  </div>
                  <div className="absolute left-4 top-4 z-10 rounded-full border border-white/14 bg-[#091120]/78 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[#dce4ff] backdrop-blur-md">
                    Video Editor
                  </div>
                  <div className="relative aspect-[4/5] min-h-[360px] sm:min-h-[460px]">
                    <Image
                      src="/wenshe.png"
                      alt="Wence portrait"
                      fill
                      priority
                      className="object-contain object-bottom grayscale"
                    />
                  </div>
                </div>

                <div className="relative rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)] sm:p-5 lg:p-6">
                  <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_28%,rgba(255,255,255,0)_100%)]" />
                  <div className="relative">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-[#d6dcff]">
                      About Me
                    </p>
                  <h4
                    className="relative mt-3 block text-[2rem] font-bold leading-[0.95] tracking-[-0.03em] text-white sm:text-[2.35rem]"
                    aria-label={aboutFullName}
                    style={{
                      opacity: helloVisible ? 1 : 0,
                      transform: helloVisible ? "translateX(0)" : "translateX(-32px)",
                      transition:
                        "opacity 0.42s ease-out 0.12s, transform 0.42s ease-out 0.12s",
                      fontFamily: "'CreatoDisplay', sans-serif",
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
                  </h4>

                  <p
                    className={`mt-4 max-w-2xl text-[13px] leading-relaxed text-white/68 transition-[opacity,transform] duration-420 ease-out sm:text-[15px] ${
                      helloVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                    }`}
                    style={{ transitionDelay: "0.12s" }}
                  >
                    Video editor, graphic designer, and BSIT senior focused on making content feel cleaner, sharper, and easier to watch. I like edits with better pacing, stronger hooks, and visuals that still feel polished without becoming too noisy.
                  </p>

                  <p className="mt-3 text-[13px] leading-relaxed text-white/60 sm:text-[15px]">
                    I work across short-form, long-form, and visual design, and I try to keep the process smooth for clients through clear updates, organized revisions, and reliable delivery.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {highlightCards.map((item) => (
                      <span
                        key={item.title}
                        className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/68"
                      >
                        {item.title}
                      </span>
                    ))}
                    {snapshotStats.map((item) => (
                      <span
                        key={item.value}
                        className="rounded-full border border-[#aab2ff]/18 bg-[#aab2ff]/[0.06] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#e9ecff]"
                      >
                        {item.value} {item.label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <a
                      href="/Wence-De-Vera-CV.pdf"
                      download
                      className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#73cfff]/34 bg-[linear-gradient(135deg,rgba(0,153,255,0.34),rgba(86,116,255,0.32)_48%,rgba(90,222,255,0.28)_100%)] px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f3fbff] shadow-[0_14px_30px_rgba(0,153,255,0.14)] transition-[transform,border-color,background-color,box-shadow] duration-180 ease-out hover:-translate-y-0.5 hover:border-[#9fddff]/42 hover:shadow-[0_16px_34px_rgba(0,153,255,0.2)]"
                    >
                      Download CV
                    </a>

                    <button
                      type="button"
                      onClick={onViewClientEdits}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#73cfff]/30 bg-[linear-gradient(135deg,rgba(8,74,138,0.72),rgba(0,153,255,0.44)_54%,rgba(78,216,255,0.24)_100%)] px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#eefcff] shadow-[0_14px_30px_rgba(0,153,255,0.12)] transition-[transform,border-color,background-color,box-shadow] duration-180 ease-out hover:-translate-y-0.5 hover:border-[#9fddff]/42 hover:shadow-[0_16px_34px_rgba(0,153,255,0.18)]"
                    >
                      View Client Edits
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className={`relative overflow-visible transition-[opacity,transform] duration-500 ease-out ${
              showAbout ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: showAbout ? "0.14s" : "0s" }}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-[4%] top-[8%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(90,181,255,0.14)_0%,transparent_72%)] blur-3xl" />
              <div className="absolute right-[6%] top-[26%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(146,228,255,0.12)_0%,transparent_72%)] blur-3xl" />
              <div className="absolute inset-x-[18%] bottom-[4%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="relative z-10">
              <div className="text-center">
                <h3
                  className="text-[1.9rem] font-bold text-white sm:text-[2.35rem]"
                  style={{
                    fontFamily: "'CreatoDisplay', sans-serif",
                    letterSpacing: "0.03em",
                    textShadow: "0 0 18px rgba(84,184,255,0.14)",
                  }}
                >
                  Video Editing Experience
                </h3>
                <div className="mx-auto mt-4 h-[3px] w-20 rounded-full bg-[linear-gradient(90deg,#6eaaff_0%,#57d2ff_52%,#b6f0ff_100%)] shadow-[0_0_18px_rgba(84,184,255,0.28)]" />
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/58">
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2">
                  2024 - Present
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2">
                  Short + Long-Form
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2">
                  Brand-Aware
                </span>
              </div>

              <div className="mt-7 space-y-4">
                {experienceEntries.map((experience, index) => {
                  const accentBarClass =
                    index === 0
                      ? "bg-[linear-gradient(180deg,#8fe7ff_0%,#6a86ff_100%)]"
                    : index === 1
                        ? "bg-[linear-gradient(180deg,#73ffe0_0%,#41b0ff_100%)]"
                        : "bg-[linear-gradient(180deg,#fff0b3_0%,#63d5ca_100%)]";
                  const accentGlowClass =
                    index === 0
                      ? "bg-[radial-gradient(circle,rgba(108,154,255,0.3)_0%,transparent_68%)]"
                    : index === 1
                        ? "bg-[radial-gradient(circle,rgba(73,223,201,0.28)_0%,transparent_68%)]"
                        : "bg-[radial-gradient(circle,rgba(255,204,120,0.24)_0%,transparent_68%)]";
                  const roleClass =
                    index === 0
                      ? "text-[#d9efff]"
                    : index === 1
                        ? "text-[#d7fff5]"
                        : "text-[#fff4d8]";
                  const periodClass =
                    index === 0
                      ? "border-[#87abff]/32 bg-[#87abff]/12 text-[#f2f6ff]"
                    : index === 1
                        ? "border-[#66f4db]/28 bg-[#66f4db]/12 text-[#f0fffb]"
                        : "border-[#ffd68b]/26 bg-[#ffd68b]/12 text-[#fff7e6]";
                  const tagClass =
                    index === 0
                      ? "border-[#7fa0ff]/18 bg-[#7fa0ff]/8 text-white/78"
                    : index === 1
                        ? "border-[#66f4db]/18 bg-[#66f4db]/8 text-white/78"
                        : "border-[#ffd68b]/18 bg-[#ffd68b]/8 text-white/78";

                  return (
                    <article
                      key={`${experience.client}-${experience.role}`}
                      className="group relative overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(135deg,rgba(7,11,18,0.98)_0%,rgba(12,19,30,0.96)_54%,rgba(8,12,20,0.98)_100%)] shadow-[0_22px_48px_rgba(0,0,0,0.24)] transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-white/18 hover:shadow-[0_28px_58px_rgba(0,0,0,0.3)]"
                      style={{
                        transitionDelay: showAbout ? `${0.2 + index * 0.06}s` : "0s",
                      }}
                    >
                      <div className={`absolute inset-x-0 top-0 h-[3px] ${accentBarClass}`} />
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className={`absolute -right-8 top-[-2rem] h-44 w-44 rounded-full blur-3xl ${accentGlowClass}`} />
                        <div className="absolute left-[26%] top-0 h-full w-px bg-white/6" />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02)_22%,rgba(255,255,255,0)_64%)]" />
                        <div className="absolute right-[-8%] top-[18%] h-28 w-40 rotate-[18deg] bg-white/[0.04] blur-2xl transition-opacity duration-200 ease-out group-hover:opacity-100" />
                      </div>
                      <div className="pointer-events-none absolute right-4 top-4 text-[2.7rem] font-semibold leading-none text-white/[0.06] sm:text-[3.6rem]">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="relative z-10 lg:grid lg:grid-cols-[132px_minmax(0,1fr)_auto] lg:items-stretch lg:gap-5">
                        <div className="relative overflow-hidden border-b border-white/10 bg-[#09131d] lg:min-h-[172px] lg:rounded-r-[22px] lg:border-b-0 lg:border-r">
                          {experience.image.trim().length > 0 ? (
                            <>
                              <img
                                key={`${experience.client}-${experience.image}-${experienceContentVersion}`}
                                src={getVersionedAssetUrl(
                                  experience.image,
                                  experienceContentVersion
                                )}
                                alt={`${experience.client} preview`}
                                className="h-40 w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] lg:h-full lg:w-[132px]"
                              />
                              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,18,0.05),rgba(7,11,18,0.54)_100%)]" />
                              <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(4,7,11,0)_0%,rgba(4,7,11,0.78)_100%)] lg:hidden" />
                            </>
                          ) : (
                            <div className="flex h-40 w-full items-center justify-center bg-[linear-gradient(135deg,rgba(10,18,27,0.98),rgba(8,12,18,0.98))] text-xs font-semibold uppercase tracking-[0.22em] text-white/42 lg:h-full lg:w-[132px]">
                              Image
                            </div>
                          )}
                          <div className={`absolute left-4 top-4 h-10 w-1 rounded-full ${accentBarClass}`} />
                        </div>

                        <div className="min-w-0 px-4 py-4 sm:px-5 sm:py-5 lg:px-0">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:hidden">
                            <div>
                              <p className="text-lg font-semibold leading-tight text-white">
                                {experience.client}
                              </p>
                              <p className={`mt-1 text-[11px] uppercase tracking-[0.2em] ${roleClass}`}>
                                {experience.role}
                              </p>
                            </div>
                            <span className={`w-fit rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] shadow-[0_8px_24px_rgba(0,0,0,0.16)] ${periodClass}`}>
                              {experience.period}
                            </span>
                          </div>

                          <div className="hidden lg:block">
                            <p className="text-[1.4rem] font-semibold leading-tight text-white">
                              {experience.client}
                            </p>
                            <p className={`mt-1 text-[11px] uppercase tracking-[0.2em] ${roleClass}`}>
                              {experience.role}
                            </p>
                          </div>

                          <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-white/82 sm:text-[14px]">
                            {experience.summary}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {experience.tags.map((tag) => (
                              <span
                                key={`${experience.client}-${tag}`}
                                className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] ${tagClass}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="hidden px-4 py-5 lg:flex lg:items-center">
                          <span className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold uppercase tracking-[0.13em] shadow-[0_10px_26px_rgba(0,0,0,0.18)] ${periodClass}`}>
                            {experience.period}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-4 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.018))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.16)] sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#c6fff1]">
                      Current Focus
                    </p>
                    <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-white/64 sm:text-sm">
                      Retention-driven edits, business content, and polished long-form support for creators and brands.
                    </p>
                  </div>

                  <a
                    href="/Wence-De-Vera-CV.pdf"
                    download
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[#aab2ff]/26 bg-[linear-gradient(90deg,rgba(99,210,191,0.14),rgba(87,210,255,0.08))] px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#effffb] transition-[transform,border-color,background-color] duration-180 ease-out hover:-translate-y-0.5 hover:border-white/20"
                  >
                    Download CV
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [, setTextVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [introPulse, setIntroPulse] = useState(false);
  const [introLogoVisible, setIntroLogoVisible] = useState(false);
  const [introWelcomeVisible, setIntroWelcomeVisible] = useState(false);
  const [introDoorsOpen, setIntroDoorsOpen] = useState(false);
  const [introExit, setIntroExit] = useState(false);
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

const groupVideoProjects = (projects: PortfolioProject[]) => {
  return projects.map((project, projectIndex) => {
    const categoryName = getVideoProjectCategory(project);
    const projectKey = `${categoryName}-${project.title || "video-project"}-${projectIndex}`;
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

type SideNavIcon = React.ComponentType<{ size?: number; className?: string }>;

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
  "Video Edit": [],
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

const normalizeStoredProjects = (value: unknown): Record<string, PortfolioProject[]> => {
  if (!value || typeof value !== "object") {
    return initialPortfolioProjects;
  }

  const raw = value as Record<string, unknown>;
  return {
    "Graphic Design": Array.isArray(raw["Graphic Design"])
      ? (raw["Graphic Design"] as PortfolioProject[])
      : [],
    "Video Edit": Array.isArray(raw["Video Edit"]) ? (raw["Video Edit"] as PortfolioProject[]) : [],
    Websites: Array.isArray(raw.Websites)
      ? (raw.Websites as PortfolioProject[])
      : Array.isArray(raw.Certificates)
        ? (raw.Certificates as PortfolioProject[])
        : [],
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

const hasShownAbout = useRef(false);
const hasShownHello = useRef(false);
const tikTokBubbleRef = useRef<HTMLDivElement>(null);
const contactMessageCardRef = useRef<HTMLDivElement>(null);
const contactMessageRef = useRef<HTMLTextAreaElement>(null);
const shouldFocusContactMessageRef = useRef(false);
const videoProjectViewerRef = useRef<HTMLDivElement>(null);
const projectRailViewportRef = useRef<HTMLDivElement>(null);
const heroMarkerLayouts = createHeroMarkerLayouts();


  const hasRun = useRef(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const sideNavTriggerRef = useRef<HTMLDivElement>(null);

  const [showSideNav, setShowSideNav] = useState(false);
const [activeSection, setActiveSection] = useState("home");
const showSideNavRef = useRef(false);
const activeSectionRef = useRef("home");
  type SideNavId = "home" | "about" | "portfolio" | "reviews" | "contact";
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

  let cancelled = false;
  const syncPortfolioFromSupabase = async () => {
    const remoteContent = await fetchPortfolioContentFromSupabase();
    if (!remoteContent || cancelled) return;

    const localPortfolioUpdatedAtValue = window.localStorage.getItem(
      PORTFOLIO_CONTENT_UPDATED_AT_KEY
    );
    const localExperienceUpdatedAtValue = getStoredExperienceContentVersion();
    const localPortfolioUpdatedAt = localPortfolioUpdatedAtValue
      ? Date.parse(localPortfolioUpdatedAtValue)
      : Number.NaN;
    const localExperienceUpdatedAt = localExperienceUpdatedAtValue
      ? Date.parse(localExperienceUpdatedAtValue)
      : Number.NaN;
    const remoteUpdatedAt = remoteContent.updatedAt
      ? Date.parse(remoteContent.updatedAt)
      : Number.NaN;
    const hasLocalPortfolioUpdatedAt = Number.isFinite(localPortfolioUpdatedAt);
    const hasLocalExperienceUpdatedAt = Number.isFinite(localExperienceUpdatedAt);
    const hasRemoteUpdatedAt = Number.isFinite(remoteUpdatedAt);
    const shouldApplyRemoteProjects = hasRemoteUpdatedAt
      ? !hasLocalPortfolioUpdatedAt || remoteUpdatedAt >= localPortfolioUpdatedAt
      : !hasLocalPortfolioUpdatedAt;
    const remoteExperienceEntries =
      remoteContent.experienceEntriesSyncSupported !== false
        ? parseExperienceEntries(remoteContent.experienceEntries)
        : null;
    const shouldApplyRemoteExperience =
      remoteExperienceEntries !== null &&
      (hasRemoteUpdatedAt
        ? !hasLocalExperienceUpdatedAt || remoteUpdatedAt >= localExperienceUpdatedAt
        : !hasLocalExperienceUpdatedAt);

    if (!shouldApplyRemoteProjects && !shouldApplyRemoteExperience) {
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

  // Intro + typing animation
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const timers: Array<ReturnType<typeof setTimeout>> = [];
    let videoInterval: ReturnType<typeof setInterval> | null = null;
    let graphicInterval: ReturnType<typeof setInterval> | null = null;
    const introTiming = isMotionLite
      ? {
          pulse: 40,
          logo: 180,
          welcome: 1080,
          exit: 1760,
          reveal: 1980,
          text: 2060,
          image: 2180,
          typingStart: 2100,
          typingStep: 82,
          graphicDelay: 260,
          doorDuration: INTRO_DOOR_OPEN_MOTION_LITE_MS,
        }
      : {
          pulse: 80,
          logo: 260,
          welcome: 1360,
          exit: 2140,
          reveal: 2380,
          text: 2480,
          image: 2660,
          typingStart: 2520,
          typingStep: 100,
          graphicDelay: 420,
          doorDuration: INTRO_DOOR_OPEN_MS,
        };
    const introDoneDelay =
      introTiming.reveal + introTiming.doorDuration + INTRO_OVERLAY_RELEASE_MS;

    const schedule = (callback: () => void, delay: number) => {
      timers.push(setTimeout(callback, delay));
    };

    schedule(() => setIntroPulse(true), introTiming.pulse);
    schedule(() => setIntroLogoVisible(true), introTiming.logo);
    schedule(() => setIntroWelcomeVisible(true), introTiming.welcome);
    schedule(() => setIntroExit(true), introTiming.exit);
    schedule(() => setIntroDoorsOpen(true), introTiming.reveal);
    schedule(() => setTextVisible(true), introTiming.text);
    schedule(() => setImageVisible(true), introTiming.image);

    schedule(() => {
      let vIndex = 0;
      let gIndex = 0;

      videoInterval = setInterval(() => {
        setVideoText(videoFullText.slice(0, vIndex + 1));
        vIndex++;

        if (vIndex === videoFullText.length) {
          if (videoInterval) {
            clearInterval(videoInterval);
            videoInterval = null;
          }
          setVideoDone(true);

          timers.push(
            setTimeout(() => {
              graphicInterval = setInterval(() => {
                setGraphicText(graphicFullText.slice(0, gIndex + 1));
                gIndex++;

                if (gIndex === graphicFullText.length) {
                  if (graphicInterval) {
                    clearInterval(graphicInterval);
                    graphicInterval = null;
                  }
                  setGraphicDone(true);
                }
              }, introTiming.typingStep);
            }, introTiming.graphicDelay)
          );
        }
      }, introTiming.typingStep);
    }, introTiming.typingStart);

    schedule(() => setIntroDone(true), introDoneDelay);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      if (videoInterval) clearInterval(videoInterval);
      if (graphicInterval) clearInterval(graphicInterval);
    };
  }, [isMotionLite]);

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
  if (!showAbout || hasShownHello.current) return;

  hasShownHello.current = true;

  setHelloVisible(true);
  setNameText("");
  setNameDone(false);

  let index = 0;

  const typeNextLetter = () => {
    if (index < aboutFullName.length) {
      setNameText(aboutFullName.slice(0, index + 1));
      index++;
      setTimeout(typeNextLetter, 100);
    } else {
      setNameDone(true);
    }
  };

  typeNextLetter();
}, [showAbout]);




  useEffect(() => {
    if (!aboutRef.current || hasShownAbout.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasShownAbout.current) return;
        hasShownAbout.current = true;
        setShowAbout(true);
        observer.disconnect();
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    observer.observe(aboutRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const sections = [
      { id: "home", ref: heroRef },
      { id: "about", ref: aboutRef },
      { id: "portfolio", ref: portfolioRef },
      { id: "reviews", ref: reviewsRef },
      { id: "contact", ref: contactRef },
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
  if (!sideNavTriggerRef.current) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      const nextShowSideNav = !entry.isIntersecting;
      if (showSideNavRef.current !== nextShowSideNav) {
        showSideNavRef.current = nextShowSideNav;
        setShowSideNav(nextShowSideNav);
      }
    },
    { threshold: 0, rootMargin: "-120px 0px 0px 0px" }
  );

  observer.observe(sideNavTriggerRef.current);

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
  shouldScroll = false
) => {
  setActiveBox(categoryName);
  setAnimateTab(false);

  window.setTimeout(() => {
    setAnimateTab(true);
  }, 50);

  if (shouldScroll) {
    window.setTimeout(() => {
      scrollToSection(portfolioRef);
    }, 80);
  }
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

  // NAV LIST
  const navList = (
    <ul className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      {[
        { name: "Home", ref: null }, // null because top of page
        { name: "About", ref: aboutRef },
        { name: "Portfolio", ref: portfolioRef },
        { name: "Contact", ref: contactRef },
      ].map((item) => {
        const isActive = activeSection.toLowerCase() === item.name.toLowerCase();

        return (
          <li key={item.name}>
            <button
              type="button"
              onClick={() => {
                scrollToSection(item.ref);
              }}
              className={`group relative inline-flex min-w-[102px] items-center justify-center gap-2 overflow-hidden rounded-full px-4 py-2.5 text-sm font-medium tracking-[0.01em] transition-[transform,background-color,color,box-shadow] duration-180 ease-out ${
                isActive
                  ? "bg-[linear-gradient(135deg,rgba(0,153,255,0.95),rgba(104,222,255,0.85))] text-white shadow-[0_12px_30px_rgba(0,153,255,0.26)]"
                  : "text-white/72 hover:-translate-y-[1px] hover:bg-white/[0.08] hover:text-white"
              }`}
              aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-180 ${
                    isActive ? "bg-white" : "bg-white/25 group-hover:bg-[#8fe3ff]"
                  }`}
                />
                <span>{item.name}</span>
                {!isActive ? (
                  <span className="pointer-events-none absolute inset-x-5 bottom-[3px] h-px bg-gradient-to-r from-transparent via-[#8fe3ff]/80 to-transparent opacity-0 transition-opacity duration-180 group-hover:opacity-100" />
                ) : null}
              </button>
          </li>
        );
      })}
    </ul>
  );

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
  const shouldFocusMessage = options?.focusMessage === true;

  if (shouldFocusMessage) {
    shouldFocusContactMessageRef.current = true;
  }

  setContactSubmitState({
    status: "idle",
    message: "",
  });
  setShowRates(false);
  setShowContactForm(true);

  if (shouldFocusMessage && isContactFormVisible) {
    contactMessageCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    contactMessageRef.current?.focus();
    const messageLength = contactMessageRef.current?.value.length ?? 0;
    contactMessageRef.current?.setSelectionRange(messageLength, messageLength);
    shouldFocusContactMessageRef.current = false;
  }
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
  scrollToSection(contactRef);
  openContactFormPanel({ focusMessage: true });
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
    description: "Main timeline for cuts, pacing, captions, and polished final exports.",
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
      "Business-focused short-form edits shaped for clarity, captions, and message-first storytelling.",
    tags: ["Short-form", "Captions", "Business"],
  },
  {
    role: "Short-Form and Long-Form Video Editing",
    client: "Vast Professionals",
    period: "2025-2026",
    summary:
      "Handled both short and long-form client content with motion, polish, and brand-consistent finishing.",
    tags: ["Long-form", "Motion", "Branding"],
  },
  {
    role: "Long-Form Video Editor",
    client: "Henry Sims",
    period: "2026-Present",
    summary:
      "Retention-focused long-form edits with stronger hooks, cleaner pacing, and polished sound design.",
    tags: ["Retention", "Hooks", "Storytelling"],
  },
] as const;
const aboutHighlightCards = [
  {
    title: "Retention pacing",
    description: "Hooks, rhythm, and cleaner watch flow.",
    icon: Film,
  },
  {
    title: "Visual polish",
    description: "Layouts, thumbnails, and sharper brand detail.",
    icon: Palette,
  },
  {
    title: "Smooth handoff",
    description: "Clear updates, revisions, and quick replies.",
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
    value: "3 lanes",
    label: "edit, design, web",
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
const sideNavButtons: Array<{
  id: SideNavId;
  icon: SideNavIcon;
  ref: React.RefObject<HTMLDivElement | null>;
}> = [
  { id: "home", icon: HomeIcon, ref: heroRef },
  { id: "about", icon: User, ref: aboutRef },
  { id: "portfolio", icon: Video, ref: portfolioRef },
  { id: "reviews", icon: MessageSquareQuote, ref: reviewsRef },
  { id: "contact", icon: Mail, ref: contactRef },
];
const sideNavDockItems: FloatingDockItem[] = sideNavButtons.map((item) => {
  const Icon = item.icon;
  return {
    id: item.id,
    title:
      item.id === "home"
        ? "Home"
        : item.id === "about"
          ? "About"
        : item.id === "portfolio"
            ? "Portfolio"
            : item.id === "reviews"
              ? "Reviews"
              : "Contact",
    icon: <Icon className="h-full w-full" />,
    active: activeSection === item.id,
    onClick: () => {
      scrollToSection(item.ref);
    },
  };
});

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-transparent">
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
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-[8%] h-[24rem] w-[72rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(118,208,255,0.16)_0%,rgba(118,208,255,0.07)_34%,transparent_74%)] blur-3xl opacity-75" />
        <div className="absolute left-[-8%] top-[38%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.14)_0%,rgba(0,153,255,0.05)_38%,transparent_74%)] blur-3xl opacity-70" />
        <div className="absolute right-[-10%] top-[54%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.03)_32%,transparent_72%)] blur-3xl opacity-65" />
        <div className="absolute left-[14%] bottom-[18%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(124,220,255,0.11)_0%,rgba(124,220,255,0.04)_36%,transparent_74%)] blur-3xl opacity-70" />
        <div className="absolute left-1/2 bottom-[-8%] h-[24rem] w-[84vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(102,214,255,0.14)_0%,rgba(102,214,255,0.05)_34%,transparent_74%)] blur-3xl opacity-85" />
      </div>

      {/* NAVBAR */}
      <div className="relative z-50 px-2 pt-3 sm:px-4 lg:px-5">
        <nav
          className="sticky top-3 mx-auto w-full max-w-[1520px] overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(4,8,14,0.88),rgba(5,10,18,0.8))] px-3 py-3.5 font-semibold tracking-[0.02em] shadow-[0_18px_44px_rgba(0,0,0,0.22)] backdrop-blur-2xl lg:px-5"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent" />
            <div className="absolute -left-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.2)_0%,transparent_70%)] blur-2xl opacity-80" />
            <div className="absolute right-[-1.5rem] top-[-1.25rem] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12)_0%,transparent_72%)] blur-2xl opacity-55" />
            <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
          </div>

          <div className="relative flex items-center gap-3 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-5">
            <button
              type="button"
              onClick={handleSecretLogoTap}
              className="group inline-flex shrink-0 items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-2 pr-4 transition-[transform,border-color,background-color,box-shadow] duration-180 ease-out hover:-translate-y-[1px] hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_14px_32px_rgba(0,0,0,0.18)] lg:pr-5"
              aria-label="Portfolio logo"
            >
              <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,rgba(6,21,34,0.96),rgba(12,46,74,0.9))] shadow-[0_12px_28px_rgba(0,153,255,0.2)]">
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(132,223,255,0.35),transparent_58%)] opacity-90" />
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  priority
                  className="relative h-auto w-[28px] drop-shadow-[0_6px_12px_rgba(255,255,255,0.08)]"
                />
              </span>

              <span className="hidden min-w-0 flex-col text-left md:flex">
                <span className="text-[10px] uppercase tracking-[0.26em] text-[#8fdcff]">
                  Creative Portfolio
                </span>
                <span className="mt-1 text-sm font-semibold text-white">
                  Wence Dante De Vera
                </span>
              </span>
            </button>

            <div className="hidden min-w-0 lg:flex lg:items-center lg:justify-center">
              <div className="w-full max-w-[780px] xl:max-w-[860px]">
                {navList}
              </div>
            </div>

            <div className="hidden xl:flex items-center justify-end">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-left shadow-[0_14px_36px_rgba(0,0,0,0.16)]">
                <span className="h-2 w-2 rounded-full bg-[#8fe3ff] shadow-[0_0_12px_rgba(143,227,255,0.75)] animate-pulse-slow" />
                <span className="flex min-w-0 flex-col">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/36">
                    Open for projects
                  </span>
                  <span className="mt-0.5 text-xs font-medium text-white/64">
                    Video edits and graphic design work
                  </span>
                </span>
              </div>
            </div>
          </div>
        </nav>
      </div>

     {/* SIDE NAV */}
<div
  className={`
    fixed bottom-4 right-4 z-50
    transition-[opacity,transform] duration-220 ease-out
    md:bottom-auto md:right-5 md:top-1/2 md:-translate-y-1/2
    ${showSideNav 
      ? "translate-x-0 opacity-100"    // slide in from right
      : "translate-x-full opacity-0"}  // slide out to right
  `}
>
  <div className="relative">
    <FloatingDock items={sideNavDockItems} vertical />
  </div>
</div>

      <div ref={heroRef} className="relative z-10 mt-0 w-full">
        <AuroraBackgroundDemo
          isVisible={introDone || introDoorsOpen}
          onViewPortfolio={() => scrollToSection(portfolioRef)}
          onContact={openContactMessageForm}
          motionLite={isMotionLite}
        />
        <div
          ref={sideNavTriggerRef}
          className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-x-[-8%] bottom-[-8.5rem] z-0 h-80 bg-[radial-gradient(ellipse_at_center,rgba(62,122,177,0.18)_0%,rgba(31,64,96,0.14)_30%,rgba(10,18,28,0.08)_56%,rgba(9,14,21,0)_82%)] blur-[72px] opacity-100" />
        <div className="pointer-events-none absolute inset-x-[8%] bottom-[-5.5rem] z-0 h-40 bg-[linear-gradient(180deg,rgba(92,180,232,0)_0%,rgba(92,180,232,0.1)_34%,rgba(46,96,140,0.08)_58%,rgba(11,20,30,0.04)_78%,rgba(92,180,232,0)_100%)] blur-[40px] opacity-92" />
      </div>

      <AboutExperienceListSection
        aboutRef={aboutRef}
        showAbout={showAbout}
        helloVisible={helloVisible}
        aboutFullName={aboutFullName}
        nameText={nameText}
        nameDone={nameDone}
        onViewClientEdits={() => openPortfolioCategory("Video Edit", true)}
        highlightCards={aboutHighlightCards}
        snapshotStats={aboutSnapshotStats}
        experienceEntries={experienceEntries}
        experienceContentVersion={experienceContentVersion}
      />

      {false ? (
        <>
      {/* ===== ABOUT ME SECTION ===== */}
      <div
        ref={aboutRef}
        className="relative mt-12 flex flex-col items-center overflow-visible transition-all duration-700 ease-out lg:mt-16"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-[-4.5rem] h-28 bg-[linear-gradient(180deg,rgba(9,15,24,0)_0%,rgba(11,17,26,0.6)_55%,rgba(11,17,26,0.9)_100%)] blur-2xl" />
          <div className="absolute left-[8%] top-[8%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.16)_0%,transparent_72%)] blur-3xl" />
          <div className="absolute right-[6%] top-[6%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.07)_0%,transparent_74%)] blur-3xl" />
          <div className="absolute inset-x-[10%] bottom-[12%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div
          className={`relative z-10 w-full max-w-7xl rounded-[32px] border border-white/10 bg-white/[0.03] p-[1.5px] shadow-[0_28px_80px_rgba(0,0,0,0.28)] transform-gpu [backface-visibility:hidden] transition-[opacity,transform] duration-420 ease-out ${
            showAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: showAbout ? "0.16s" : "0s" }}
        >
          <GlowingEffect {...mainSectionGlowProps} className="z-[2]" />
          <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(18,25,34,0.92),rgba(11,18,26,0.96))] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(0,153,255,0.09),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.05),transparent_22%)]" />
            </div>

            <div className="relative z-10 px-4 pt-4 pb-5 sm:px-6 sm:pt-6 sm:pb-6 lg:px-6 lg:pt-6 lg:pb-7">
            <div
              className={`transition-[opacity,transform] duration-420 ease-out ${
                showAbout ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
              }`}
            >
              <span className="inline-flex rounded-full border border-[#0099ff]/25 bg-[#0099ff]/10 px-4 py-1 text-[11px] uppercase tracking-[0.26em] text-[#8fdcff]">
                About Me + Experience
              </span>
              <h3
                className="mt-4 max-w-3xl text-3xl font-bold text-white sm:text-[2.7rem]"
                style={{
                  fontFamily: "'CreatoDisplay', sans-serif",
                  letterSpacing: "0.02em",
                  textShadow: "0 0 16px rgba(0,153,255,0.1)",
                }}
              >
                A quick read on who I am and the work I bring.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/68 sm:text-base">
                Short, clear, and client-friendly. Here is the profile, focus, and real
                project experience behind the edits.
              </p>
            </div>

            <div className="relative mt-6 grid w-full gap-5 xl:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)] xl:items-start">
              <div
                className={`relative overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(14,22,32,0.96),rgba(8,13,20,0.94))] p-5 transition-[opacity,transform] duration-500 ease-out sm:p-6 ${
                  helloVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
                }`}
              >
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="absolute left-[12%] top-[10%] h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.12)_0%,transparent_74%)] blur-3xl" />
                  <div className="absolute right-[8%] bottom-[8%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_74%)] blur-3xl" />
                </div>

                <div className="relative z-10">
                  <div className="relative aspect-[0.83] overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.12),rgba(255,255,255,0.02)_42%,rgba(0,0,0,0.18)_100%)]">
                    <Image
                      src="/wenshe.png"
                      alt="Wence portrait"
                      fill
                      priority
                      className="object-contain object-bottom grayscale"
                    />
                  </div>

                  <div className="mt-5">
                    <p
                      className={`text-[11px] uppercase tracking-[0.28em] text-[#8fdcff] transition-[opacity,transform] duration-420 ease-out ${
                        helloVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                      }`}
                    >
                      Quick Profile
                    </p>

                    <h3
                      className="relative mt-2 block text-3xl font-bold leading-[0.96] tracking-[-0.02em] text-white transition-[opacity,transform] duration-420 sm:text-[2.6rem]"
                      aria-label={aboutFullName}
                      style={{
                        opacity: helloVisible ? 1 : 0,
                        transform: helloVisible ? "translateX(0)" : "translateX(-40px)",
                        transition: "opacity 0.42s ease-out 0.12s, transform 0.42s ease-out 0.12s",
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

                    <p
                      className={`mt-3 text-sm leading-relaxed text-white/68 transition-[opacity,transform] duration-420 ease-out ${
                        helloVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                      }`}
                      style={{ transitionDelay: "0.12s" }}
                    >
                      Video editor, graphic designer, and BSIT senior focused on clean,
                      engaging work that feels polished from idea to final output.
                    </p>

                    <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-[#8fdcff]/78">
                      Video Editor • Graphic Designer
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#8fdcff]/74">
                          Experience
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">2+ yrs</p>
                        <p className="mt-1 text-sm text-white/58">Editing and design work</p>
                      </div>
                      <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#8fdcff]/74">
                          Focus
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">3 lanes</p>
                        <p className="mt-1 text-sm text-white/58">Edit, design, web</p>
                      </div>
                      <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#8fdcff]/74">
                          Response
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">24 hrs</p>
                        <p className="mt-1 text-sm text-white/58">Typical reply time</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <a
                        href="/Wence-De-Vera-CV.pdf"
                        download
                        className="inline-flex h-11 items-center justify-center rounded-full border border-[#8fdcff]/25 bg-[#8fdcff]/10 px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b9eeff] transition-[transform,border-color,background-color] duration-160 ease-out hover:-translate-y-0.5 hover:border-[#8fdcff]/40"
                      >
                        Download CV
                      </a>

                      <button
                        type="button"
                        onClick={() => openPortfolioCategory("Video Edit", true)}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/84 transition-[transform,border-color,background-color] duration-160 ease-out hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]"
                      >
                        View Client Edits
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`relative overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(22,29,39,0.98),rgba(12,17,24,0.96))] p-5 transition-[opacity,transform] duration-500 ease-out sm:p-6 ${
                  helloVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
                }`}
                style={{ transitionDelay: "0.08s" }}
              >
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                  <div className="absolute right-[8%] top-[10%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.08)_0%,transparent_74%)] blur-3xl" />
                  <div className="absolute left-[6%] bottom-[8%] h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_74%)] blur-3xl" />
                </div>

                <div className="relative z-10">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#8fdcff]">
                    Experience Snapshot
                  </p>
                  <h4 className="mt-3 max-w-xl text-xl font-semibold text-white sm:text-[2.2rem]">
                    Real client work, shown simply.
                  </h4>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/68 sm:text-base">
                    A concise look at the kind of editing and creative support I have
                    already delivered for clients.
                  </p>

                  <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {creativeExperienceEntries.map((experience) => (
                      <article
                        key={`${experience.client}-${experience.role}`}
                        className="group relative overflow-hidden rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-4 transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] sm:p-5"
                      >
                        <div className="pointer-events-none absolute inset-0">
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/16 to-transparent" />
                          <div className="absolute right-[-8%] top-[-8%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.1)_0%,transparent_72%)] blur-3xl" />
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-lg font-semibold text-white">
                                {experience.client}
                              </p>
                              <p className="mt-1 text-sm font-medium text-[#b9eeff]">
                                {experience.role}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full border border-white/10 bg-black/18 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/58">
                              {experience.period}
                            </span>
                          </div>

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
              </div>
            </div>

            </div>
          </div>
        </div>
      </div>
        </>
      ) : null}

<div className="relative mt-16 flex flex-col items-center overflow-visible transition-all duration-700 ease-out lg:mt-20">
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute left-[4%] top-[8%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.12)_0%,transparent_72%)] blur-3xl" />
    <div className="absolute right-[6%] bottom-[10%] h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(187,132,255,0.08)_0%,transparent_74%)] blur-3xl" />
    <div className="absolute inset-x-[14%] top-1/2 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
  </div>

  <section
    aria-labelledby="creative-stack-heading"
    className="relative z-10 mx-auto w-full max-w-7xl px-2 sm:px-4 lg:px-6"
  >
    <div className="space-y-8">
      <div
        className={`mx-auto max-w-3xl text-center transition-[opacity,transform] duration-500 ease-out ${
          showAbout ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
        }`}
      >
        <span className="inline-flex items-center rounded-full border border-white/14 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c7efff]">
          Creative Stack
        </span>
        <h2
          id="creative-stack-heading"
          className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-[3.15rem]"
          style={{
            fontFamily: "'CreatoDisplay', sans-serif",
            letterSpacing: "0.03em",
            textShadow: "0 0 18px rgba(0,153,255,0.14)",
          }}
        >
          Tools behind the work.
        </h2>
        <div className="mx-auto mt-4 h-[4px] w-24 rounded-full bg-[linear-gradient(90deg,#6677ff_0%,#54b8ff_52%,#74ebff_100%)] shadow-[0_0_18px_rgba(84,184,255,0.42)]" />
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/68 sm:text-base">
          A small creative stack with a clear role for every part of the process,
          from editing and motion to thumbnails, layouts, and vector detail.
        </p>
      </div>

      <div
        className={`creative-stack-showcase relative px-1 pb-4 pt-1 transition-[opacity,transform] duration-500 ease-out sm:px-2 sm:pb-6 lg:px-4 ${
          showAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } ${isMotionLite ? "creative-stack-showcase-lite" : ""}`}
        style={{ transitionDelay: showAbout ? "0.1s" : "0s" }}
      >
        <div className="creative-stack-stage-noise absolute inset-0" />
        <div className="creative-stack-stage-grid absolute inset-0" />
        <div className="creative-stack-stage-glow creative-stack-stage-glow-left" />
        <div className="creative-stack-stage-glow creative-stack-stage-glow-right" />
        <div className="creative-stack-stage-beam creative-stack-stage-beam-a" />
        <div className="creative-stack-stage-beam creative-stack-stage-beam-b" />
        <div className="creative-stack-stage-arc creative-stack-stage-arc-top hidden xl:block" />
        <div className="creative-stack-stage-arc creative-stack-stage-arc-bottom hidden xl:block" />
        <div className="creative-stack-core pointer-events-none absolute inset-0 hidden xl:block">
          <span className="creative-stack-core-bloom" />
          <span className="creative-stack-core-orbit creative-stack-core-orbit-a" />
          <span className="creative-stack-core-orbit creative-stack-core-orbit-b" />
          <span className="creative-stack-core-orbit creative-stack-core-orbit-c" />
          <span className="creative-stack-core-pillar" />
        </div>

        <div className="relative z-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-[0.92fr_minmax(0,1.16fr)_0.92fr] xl:grid-rows-[minmax(15rem,1fr)_minmax(15rem,1fr)]">
          {creativeTools.map((tool, index) => {
            const ToolIcon = tool.icon;
            const shellStyle = {
              ["--creative-tool-lift" as string]: isMotionLite ? "0px" : tool.lift,
              ["--creative-tool-rotate" as string]: isMotionLite ? "0deg" : tool.rotate,
              ["--creative-tool-hover-rotate" as string]: isMotionLite ? "0deg" : tool.hoverRotate,
              boxShadow: `0 24px 56px ${tool.glow}`,
            } as React.CSSProperties;

            return (
              <article
                key={tool.name}
                aria-label={tool.name}
                className={`${tool.layoutClassName} transition-[opacity,transform] duration-500 ease-out ${
                  showAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: showAbout ? `${0.12 + index * 0.07}s` : "0s" }}
              >
                <div
                  className={`creative-tool-shell group relative overflow-hidden border border-white/12 bg-[#060b14]/78 p-4 backdrop-blur-xl sm:p-5 ${tool.shellClassName} ${
                    tool.featured ? "creative-tool-shell-featured xl:h-auto" : "h-full"
                  }`}
                  style={shellStyle}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-95"
                    style={{ background: tool.panelBackground }}
                  />
                  <div
                    className="creative-tool-shell-beam pointer-events-none absolute inset-0"
                    style={{ background: tool.accentBeam }}
                  />
                  <div className="creative-tool-shell-grid pointer-events-none absolute inset-0" />
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${tool.badgeBorder}, transparent)`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute left-1/2 top-2 h-28 w-28 -translate-x-1/2 rounded-full blur-3xl"
                    style={{
                      background: `radial-gradient(circle, ${tool.glow} 0%, transparent 72%)`,
                    }}
                  />
                  <div className="pointer-events-none absolute -bottom-8 right-[-8%] h-24 w-24 rounded-full border border-white/8 opacity-60" />

                  {tool.featured ? (
                    <div className="creative-tool-feature pointer-events-none absolute inset-0 hidden xl:block">
                      <span className="creative-tool-feature-ring creative-tool-feature-ring-a" />
                      <span className="creative-tool-feature-ring creative-tool-feature-ring-b" />
                      <span className="creative-tool-feature-sheen" />
                    </div>
                  ) : null}

                  <div className="relative z-10 flex h-full flex-col">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-white/44" />
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: tool.accent,
                            boxShadow: `0 0 12px ${tool.glow}`,
                          }}
                        />
                      </div>
                      <span className="rounded-full border border-white/12 bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/78 backdrop-blur-md">
                        {tool.shortName}
                      </span>
                    </div>

                    <div
                      className={`mt-6 flex ${tool.featured ? "flex-1 items-center justify-center pb-2" : tool.iconLaneClassName}`}
                    >
                        <div className="relative flex items-center justify-center">
                          <div
                            className={`relative flex items-center justify-center border ${tool.iconFrameClassName}`}
                            style={{
                              background:
                                "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.09), rgba(7,15,26,0.76) 58%, rgba(3,8,14,0.94) 100%)",
                              borderColor: "rgba(255,255,255,0.08)",
                              boxShadow:
                                "inset 0 1px 0 rgba(255,255,255,0.06), 0 16px 28px rgba(0,0,0,0.24)",
                            }}
                          >
                          <ToolIcon
                            className={tool.iconClassName}
                            style={{
                              color: tool.iconBrandColor,
                              filter: `drop-shadow(0 0 12px ${tool.glow})`,
                            }}
                          />
                          <div className="pointer-events-none absolute inset-[10px] rounded-[inherit] border border-white/10" />
                        </div>
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.12]">
                          <ToolIcon
                            className={tool.watermarkClassName}
                            style={{ color: tool.iconBrandColor }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={`mt-auto ${tool.featured ? "mx-auto max-w-md text-center" : ""}`}>
                      <h3 className="text-lg font-semibold text-white sm:text-xl">
                        {tool.name}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/68">
                        {tool.description}
                      </p>

                      <div
                        className={`mt-5 flex items-center gap-4 ${
                          tool.featured ? "justify-center" : tool.footerClassName
                        }`}
                      >
                        <span
                          className={`h-[2px] rounded-full ${
                            tool.featured ? "w-14 sm:w-20" : "flex-1"
                          }`}
                          style={{
                            background: `linear-gradient(90deg, rgba(255,255,255,0), ${tool.accent}, rgba(255,255,255,0))`,
                            boxShadow: `0 0 16px ${tool.glow}`,
                          }}
                        />
                        {tool.featured ? (
                          <span
                            className="h-[2px] w-14 rounded-full sm:w-20"
                            style={{
                              background: `linear-gradient(90deg, rgba(255,255,255,0), ${tool.accent}, rgba(255,255,255,0))`,
                              boxShadow: `0 0 16px ${tool.glow}`,
                            }}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  </section>
</div>

{/* ===== PORTFOLIO SHOWCASE SECTION ===== */}
<div
  ref={portfolioRef}
  className="relative mt-16 flex flex-col items-center overflow-visible transition-all duration-700 ease-out lg:mt-20"
>
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute left-[12%] top-[12%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.14)_0%,transparent_72%)] blur-3xl" />
    <div className="absolute right-[8%] bottom-[10%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_74%)] blur-3xl" />
  </div>

  <div className="relative z-10 mx-auto w-full max-w-7xl px-2 sm:px-4 lg:px-6">
    <div className="space-y-8">
      <div
        className={`mx-auto max-w-3xl text-center transition-[opacity,transform] duration-500 ease-out ${
          showPortfolio ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
        }`}
      >
        <span className="inline-flex items-center rounded-full border border-white/14 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c7efff]">
          Portfolio Showcase
        </span>
        <h2
          className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-[3.15rem]"
          style={{
            fontFamily: "'CreatoDisplay', sans-serif",
            letterSpacing: "0.03em",
            textShadow: "0 0 18px rgba(0,153,255,0.14)",
          }}
        >
          Browse the work like a highlight reel.
        </h2>
        <div className="mx-auto mt-4 h-[4px] w-24 rounded-full bg-[linear-gradient(90deg,#6677ff_0%,#54b8ff_52%,#74ebff_100%)] shadow-[0_0_18px_rgba(84,184,255,0.42)]" />
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/68 sm:text-base">
          {isVideoEditShowcase
            ? `${videoProjectGroups.length} projects, ${totalVideoClipCount} clips. Pick a card and the rest shrink back while the selected edit takes the stage.`
            : `A cleaner spotlight for ${activeCategoryMeta.name.toLowerCase()}. Tap a card, let one piece lead, and keep the rest in the rail.`}
        </p>
      </div>

      <div
        className={`flex flex-wrap justify-center gap-3 transition-[opacity,transform] duration-500 ease-out ${
          showPortfolio ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        {portfolioCategories.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeBox === item.name;
          const categoryCount = categoryProjectCounts[item.name];
          const accentStyles =
            item.name === "Video Edit"
              ? {
                  activeBorder: "rgba(111, 228, 255, 0.42)",
                  activeBackground:
                    "linear-gradient(180deg, rgba(73, 202, 255, 0.18), rgba(73, 202, 255, 0.08))",
                  activeShadow: "rgba(73, 202, 255, 0.18)",
                  idleBackground: "rgba(73, 202, 255, 0.035)",
                  iconColor: "#c8f5ff",
                  iconBackground: "#091724",
                }
              : item.name === "Graphic Design"
                ? {
                    activeBorder: "rgba(112, 156, 255, 0.4)",
                    activeBackground:
                      "linear-gradient(180deg, rgba(88, 133, 255, 0.18), rgba(88, 133, 255, 0.08))",
                    activeShadow: "rgba(88, 133, 255, 0.18)",
                    idleBackground: "rgba(88, 133, 255, 0.035)",
                    iconColor: "#d8e3ff",
                    iconBackground: "#10192c",
                  }
                : {
                    activeBorder: "rgba(255, 214, 107, 0.4)",
                    activeBackground:
                      "linear-gradient(180deg, rgba(255, 214, 107, 0.16), rgba(255, 214, 107, 0.06))",
                    activeShadow: "rgba(255, 214, 107, 0.15)",
                    idleBackground: "rgba(255, 214, 107, 0.03)",
                    iconColor: "#fff0be",
                    iconBackground: "#241c0d",
                  };

          return (
            <button
              key={item.name}
              type="button"
              aria-pressed={isActive}
              onClick={() => openPortfolioCategory(item.name)}
              className={`group inline-flex items-center gap-3 rounded-full border px-4 py-3 text-left transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out ${
                isActive
                  ? "text-white"
                  : "border-white/10 text-white/78 hover:-translate-y-0.5 hover:border-white/18"
              }`}
              style={{
                animation: showPortfolio ? "fadeIn 0.68s ease forwards" : "none",
                animationDelay: `${0.08 + index * 0.08}s`,
                borderColor: isActive ? accentStyles.activeBorder : undefined,
                background: isActive ? accentStyles.activeBackground : accentStyles.idleBackground,
                boxShadow: isActive
                  ? `0 18px 40px ${accentStyles.activeShadow}`
                  : "none",
              }}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                  isActive
                    ? "border-white/24"
                    : "border-white/10 bg-black/18 text-white/70"
                }`}
                style={
                  isActive
                    ? {
                        color: accentStyles.iconColor,
                        background: accentStyles.iconBackground,
                      }
                    : undefined
                }
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{item.name}</span>
                <span className="block text-[11px] uppercase tracking-[0.18em] text-white/50">
                  {categoryCount} {categoryCount === 1 ? "item" : "items"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={`transition-[opacity,transform] duration-[560ms] ease-out ${
          showPortfolio ? "opacity-100 translate-y-0 blur-0" : "pointer-events-none opacity-0 translate-y-8 blur-sm"
        }`}
      >
        <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:p-5 lg:p-6">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute left-[10%] top-[18%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_72%)] blur-3xl" />
            <div className="absolute right-[9%] bottom-[12%] h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(125,225,255,0.12)_0%,transparent_72%)] blur-3xl" />
          </div>

          {showPortfolio &&
            (activeProjects.length > 0 ? (
              <div
                key={`${activeBox}-${animateTab ? "in" : "out"}`}
                className="relative z-10 space-y-6 opacity-0 animate-fadeIn"
                style={{ animationDuration: "0.76s", animationDelay: "0.06s" }}
              >
                <div className="flex items-center justify-between gap-3 px-1">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.26em] text-[#bcefff]">
                      {isVideoEditShowcase ? "Project Rail" : "Portfolio Rail"}
                    </p>
                    <p className="mt-2 text-sm text-white/62">
                      {isVideoEditShowcase
                        ? "These are past projects I created for previous clients. Pick a card to open its clips."
                        : "Choose a piece to bring it forward."}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/12 bg-black/22 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/55">
                    {activeCategoryCountText}
                  </span>
                </div>

                <div className="relative">
                  {(isVideoEditShowcase ? videoProjectGroups.length > 1 : activeProjects.length > 1) ? (
                    <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden items-center justify-between sm:flex">
                      <button
                        type="button"
                        onClick={() => scrollProjectRail(-1)}
                        className="pointer-events-auto inline-flex h-11 w-11 -translate-x-3 items-center justify-center rounded-full border border-white/12 bg-[#09131e]/90 text-white/82 shadow-[0_12px_24px_rgba(0,0,0,0.24)] transition-colors hover:bg-[#0d1824]"
                        aria-label="Scroll project boxes left"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollProjectRail(1)}
                        className="pointer-events-auto inline-flex h-11 w-11 translate-x-3 items-center justify-center rounded-full border border-white/12 bg-[#09131e]/90 text-white/82 shadow-[0_12px_24px_rgba(0,0,0,0.24)] transition-colors hover:bg-[#0d1824]"
                        aria-label="Scroll project boxes right"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  ) : null}

                  <div
                    ref={projectRailViewportRef}
                    className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    <div className="flex min-w-max items-stretch gap-4 px-1 sm:px-10">
                      {isVideoEditShowcase
                        ? videoProjectGroups.map((group, index) => {
                            const isSelected = selectedVideoProjectGroup?.key === group.key;
                            const clipCount = group.clips.length;
                            const activeIndex = getVideoCarouselIndex(group.key, group.clips.length);
                            const previewClip = group.clips[activeIndex];
                            const previewImage =
                              group.project.image || previewClip?.posterUrl || group.previewImage;
                            const projectSummary =
                              group.project.description?.trim() ||
                              "Preview clips from this editing project.";

                            return (
                              <button
                                key={group.key}
                                type="button"
                                onClick={() => openVideoProjectShowcase(group.key)}
                                className={`group relative h-[292px] w-[248px] shrink-0 overflow-hidden rounded-[30px] border text-left transition-[transform,opacity,border-color,background-color,box-shadow] duration-500 ease-out sm:h-[304px] sm:w-[260px] ${
                                  isSelected
                                    ? "border-white/28 bg-white/[0.08] opacity-100 shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
                                    : "border-white/10 bg-white/[0.04] opacity-80 hover:-translate-y-1 hover:border-white/18 hover:opacity-100"
                                }`}
                                style={{
                                  animation: showPortfolio ? "fadeIn 0.72s ease forwards" : "none",
                                  animationDelay: `${0.1 + index * 0.06}s`,
                                }}
                              >
                                <div className="relative z-10 flex h-full flex-col p-4">
                                  <div className="relative aspect-[5/4] overflow-hidden rounded-[22px] border border-white/10 bg-black/24">
                                    {previewImage ? (
                                      <img
                                        src={previewImage}
                                        alt={group.name}
                                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="h-full w-full bg-[linear-gradient(135deg,rgba(8,16,24,0.98),rgba(5,9,15,0.94))]" />
                                    )}
                                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,11,18,0.04),rgba(6,11,18,0.18)_45%,rgba(5,8,13,0.74)_100%)]" />
                                  </div>

                                  <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="line-clamp-1 text-lg font-semibold text-white">
                                        {group.name}
                                      </p>
                                      <span className="rounded-full border border-white/12 bg-black/22 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/58">
                                        {clipCount} {clipCount === 1 ? "clip" : "clips"}
                                      </span>
                                    </div>
                                    <p className="line-clamp-2 text-sm text-white/60">
                                      {projectSummary}
                                    </p>
                                  </div>

                                  <div className="mt-auto pt-3">
                                    <span className="inline-flex rounded-full border border-[#9adfff]/22 bg-[#091826]/78 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c8f5ff]">
                                      Preview project
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        : activeProjects.map((project, index) => {
                            const isSelected = selectedCategoryProjectIndex === index;
                            const projectSummary =
                              project.description?.trim() || "Preview this portfolio piece.";

                            return (
                              <button
                                key={`${activeBox}-${project.title}-${index}`}
                                type="button"
                                onClick={() =>
                                  setSelectedCategoryProjectIndexes((prev) => ({
                                    ...prev,
                                    [activeCategoryName]: index,
                                  }))
                                }
                                className={`group relative h-[292px] w-[248px] shrink-0 overflow-hidden rounded-[30px] border text-left transition-[transform,opacity,border-color,background-color,box-shadow] duration-500 ease-out sm:h-[304px] sm:w-[260px] ${
                                  isSelected
                                    ? "border-white/28 bg-white/[0.08] opacity-100 shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
                                    : "border-white/10 bg-white/[0.04] opacity-80 hover:-translate-y-1 hover:border-white/18 hover:opacity-100"
                                }`}
                                style={{
                                  animation: showPortfolio ? "fadeIn 0.72s ease forwards" : "none",
                                  animationDelay: `${0.1 + index * 0.06}s`,
                                }}
                              >
                                <div className="relative z-10 flex h-full flex-col p-4">
                                  <div className="relative aspect-[5/4] overflow-hidden rounded-[22px] border border-white/10 bg-black/24">
                                    <img
                                      src={project.image}
                                      alt={project.title}
                                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,11,18,0.04),rgba(6,11,18,0.18)_45%,rgba(5,8,13,0.74)_100%)]" />
                                  </div>

                                  <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="line-clamp-1 text-lg font-semibold text-white">
                                        {project.title}
                                      </p>
                                      <span className="rounded-full border border-white/12 bg-black/22 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/58">
                                        {String(index + 1).padStart(2, "0")}
                                      </span>
                                    </div>
                                    <p className="line-clamp-2 text-sm text-white/60">
                                      {projectSummary}
                                    </p>
                                  </div>

                                  <div className="mt-auto pt-3">
                                    <span className="inline-flex rounded-full border border-[#9adfff]/22 bg-[#091826]/78 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c8f5ff]">
                                      Preview project
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                    </div>
                  </div>
                </div>

                {isVideoEditShowcase && selectedVideoProjectGroup && selectedVideoProjectClip ? (
                  <section
                    ref={videoProjectViewerRef}
                    className="relative overflow-hidden rounded-[32px] border border-white/14 bg-[linear-gradient(180deg,rgba(7,14,22,0.94),rgba(6,11,17,0.96))] p-5 shadow-[0_26px_80px_rgba(0,0,0,0.26)] sm:p-6"
                  >
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute left-[8%] top-[10%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(125,225,255,0.14)_0%,transparent_72%)] blur-3xl" />
                      <div className="absolute right-[6%] top-[14%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_74%)] blur-3xl" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1 sm:pr-8 lg:pr-10">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-[#9adfff]/22 bg-[#091826]/78 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c8f5ff]">
                              In Focus
                            </span>
                            <span className="rounded-full border border-white/12 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/56">
                              {selectedVideoProjectGroup.clips.length}{" "}
                              {selectedVideoProjectGroup.clips.length === 1 ? "clip" : "clips"}
                            </span>
                          </div>
                          <h3 className="mt-4 text-2xl font-semibold text-white sm:text-[2.3rem]">
                            {selectedVideoProjectGroup.name}
                          </h3>
                          <p className="mt-3 text-sm leading-relaxed text-white/64">
                            {selectedVideoProjectGroup.project.description?.trim() ||
                              "Past client project highlights and selected edit samples."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:shrink-0">
                          {selectedVideoProjectParentLabel ? (
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/54">
                              {selectedVideoProjectParentLabel}
                            </span>
                          ) : null}
                          {selectedVideoProjectGroup.project.designLink.trim().length > 0 &&
                          selectedVideoProjectGroup.project.designLink.trim() !== "#" ? (
                            <a
                              href={selectedVideoProjectGroup.project.designLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/[0.1]"
                            >
                              Project link
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : null}
                        </div>
                      </div>

                      <div
                        className={`mt-6 overflow-hidden rounded-[28px] border border-white/12 bg-black/30 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ${
                          selectedVideoProjectGroup.aspectRatio === "portrait"
                            ? "mx-auto aspect-[4/5] w-full max-w-[420px]"
                            : "aspect-[16/9] w-full"
                        }`}
                      >
                        {selectedVideoProjectClip.videoUrl.trim().length > 0 ? (
                          <video
                            key={selectedVideoProjectClip.key}
                            src={selectedVideoProjectClip.videoUrl}
                            poster={selectedVideoProjectClip.posterUrl || undefined}
                            className="h-full w-full object-cover"
                            controls
                            controlsList="nodownload"
                            disablePictureInPicture
                            playsInline
                            preload="none"
                            onContextMenu={(event) => {
                              event.preventDefault();
                            }}
                          />
                        ) : (
                          <div
                            className="flex h-full w-full items-center justify-center px-6 text-center"
                            style={{
                              background:
                                selectedVideoProjectClip.posterUrl ||
                                selectedVideoProjectGroup.previewImage ||
                                selectedVideoProjectGroup.project.image
                                  ? `linear-gradient(135deg, rgba(2, 6, 10, 0.68), rgba(2, 6, 10, 0.92)), url(${
                                      selectedVideoProjectClip.posterUrl ||
                                      selectedVideoProjectGroup.previewImage ||
                                      selectedVideoProjectGroup.project.image
                                    }) center/cover`
                                  : "linear-gradient(135deg, rgba(4,10,18,0.98), rgba(6,18,28,0.92))",
                            }}
                          >
                            <div className="max-w-sm">
                              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/8 text-[#9ae9ff]">
                                <Play className="ml-0.5 h-5 w-5" />
                              </span>
                              <p className="mt-3 text-sm font-semibold text-white">
                                No direct video file added yet
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#bcefff]">
                              Clip Deck
                            </p>
                            <p className="mt-2 text-sm text-white/58">
                              Only the selected project loads its video.
                            </p>
                          </div>

                          {selectedVideoProjectGroup.clips.length > 1 ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  shiftVideoCarousel(
                                    selectedVideoProjectGroup.key,
                                    -1,
                                    selectedVideoProjectGroup.clips.length
                                  )
                                }
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white/80 transition-colors hover:bg-white/[0.1]"
                                aria-label={`Show previous clip in ${selectedVideoProjectGroup.name}`}
                              >
                                <ChevronLeft className="h-4.5 w-4.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  shiftVideoCarousel(
                                    selectedVideoProjectGroup.key,
                                    1,
                                    selectedVideoProjectGroup.clips.length
                                  )
                                }
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white/80 transition-colors hover:bg-white/[0.1]"
                                aria-label={`Show next clip in ${selectedVideoProjectGroup.name}`}
                              >
                                <ChevronRight className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          ) : null}
                        </div>

                        <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          <div className="flex min-w-max gap-3">
                            {selectedVideoProjectGroup.clips.map((clip, clipIndex) => {
                              const isActiveClip = clipIndex === selectedVideoProjectClipIndex;
                              const previewImage =
                                clip.posterUrl ||
                                selectedVideoProjectGroup.previewImage ||
                                selectedVideoProjectGroup.project.image;

                              return (
                                <button
                                  key={clip.key}
                                  type="button"
                                  onClick={() =>
                                    setVideoCarouselIndex(
                                      selectedVideoProjectGroup.key,
                                      clipIndex,
                                      selectedVideoProjectGroup.clips.length
                                    )
                                  }
                                  className={`group w-[150px] overflow-hidden rounded-[20px] border text-left transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out ${
                                    isActiveClip
                                      ? "border-white/24 bg-white/[0.08] shadow-[0_16px_34px_rgba(0,0,0,0.2)]"
                                      : "border-white/10 bg-white/[0.04] hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.07]"
                                  }`}
                                >
                                  <div className="relative aspect-[16/10] overflow-hidden">
                                    {previewImage ? (
                                      <img
                                        src={previewImage}
                                        alt={`${selectedVideoProjectGroup.name} clip ${clipIndex + 1}`}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="h-full w-full bg-[linear-gradient(135deg,rgba(8,16,24,0.98),rgba(5,9,15,0.94))]" />
                                    )}
                                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,11,18,0.08),rgba(5,8,13,0.72)_100%)]" />
                                  </div>
                                  <div className="px-3 py-3">
                                    <p className="text-sm font-semibold text-white">
                                      Clip {String(clipIndex + 1).padStart(2, "0")}
                                    </p>
                                    <p className="mt-1 text-[11px] text-white/54">
                                      {clip.videoUrl.trim().length > 0 ? "Load in stage" : "Poster only"}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                ) : null}

                {!isVideoEditShowcase && spotlightCategoryProject ? (
                  <section className="relative overflow-hidden rounded-[32px] border border-white/14 bg-[linear-gradient(180deg,rgba(7,14,22,0.94),rgba(6,11,17,0.96))] shadow-[0_26px_80px_rgba(0,0,0,0.26)]">
                    <img
                      src={spotlightCategoryProject.image}
                      alt={spotlightCategoryProject.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,18,0.08),rgba(7,12,18,0.18)_30%,rgba(5,8,13,0.92)_100%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,225,255,0.18),transparent_34%)]" />

                    <div className="relative z-10 flex min-h-[460px] flex-col justify-between p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/14 bg-white/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                          Spotlight
                        </span>
                        <span className="rounded-full border border-white/12 bg-black/22 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/58">
                          {activeBox}
                        </span>
                      </div>

                      <div className="max-w-2xl">
                        <h3 className="text-3xl font-semibold text-white sm:text-[2.4rem]">
                          {spotlightCategoryProject.title}
                        </h3>
                        <p className="mt-3 max-w-xl line-clamp-3 text-sm leading-relaxed text-white/68 sm:text-base">
                          {spotlightCategoryProject.description}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                          {spotlightCategoryProject.designLink.trim().length > 0 &&
                          spotlightCategoryProject.designLink.trim() !== "#" ? (
                            <a
                              href={spotlightCategoryProject.designLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12]"
                            >
                              Open project
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : null}
                          {(spotlightCategoryProject.showDetailsModal ||
                            spotlightCategoryProject.details) && (
                            <button
                              type="button"
                              onClick={() => openProjectDetails(spotlightCategoryProject)}
                              className="inline-flex items-center rounded-full border border-white/14 bg-black/22 px-4 py-2 text-sm font-semibold text-white/82 transition-colors hover:bg-white/[0.08]"
                            >
                              View details
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                ) : null}
              </div>
            ) : (
              <div
                key={`${activeBox}-${animateTab ? "in" : "out"}-empty`}
                className="relative z-10 rounded-[28px] border border-dashed border-white/12 bg-black/20 px-5 py-12 text-center"
              >
                <p className="text-sm text-white/72 sm:text-base">
                  {isVideoEditShowcase
                    ? "No video edits in this showcase yet."
                    : `No projects in ${activeBox} yet.`}
                </p>
                <p className="mt-2 text-xs text-white/45">
                  {isVideoEditShowcase
                    ? "Add a video edit in Studio and include a direct playable file so it can open inside this spotlight view."
                    : "Add work to this category and it will appear here automatically."}
                </p>
              </div>
            ))}
        </div>
        <div className="pointer-events-none mx-auto mt-6 h-[3px] w-44 rounded-full bg-[linear-gradient(90deg,rgba(96,214,255,0),rgba(96,214,255,0.72),rgba(153,239,255,1),rgba(96,214,255,0.72),rgba(96,214,255,0))] shadow-[0_0_26px_rgba(96,214,255,0.48)]" />
      </div>
    </div>
  </div>

  {isDetailsModalMounted &&
    selectedProject &&
    typeof window !== "undefined" &&
    createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/50 backdrop-blur-[2px] transition-opacity duration-[380ms] ease-out ${
        modalVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={closeDetailsModal}
    >
      <div
        className={`relative w-11/12 max-w-6xl bg-black/20 backdrop-blur-3xl rounded-3xl border border-[#0099ff]/25 shadow-[0_0_24px_rgba(0,153,255,0.2)] modal-blue-flow p-6 md:p-8 flex flex-col justify-start transform transition-[opacity,transform] duration-[520ms] ease-[cubic-bezier(0.2,0.82,0.2,1)] ${
          modalVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.45), rgba(255,255,255,0.1), rgba(0,153,255,0.14))",
          transformOrigin: "50% 100%",
          transform: modalVisible
            ? "translate3d(0,0,0) scale(1) rotate(0deg)"
            : "translate3d(0, 44vh, 0) scale(0.18) rotate(0deg)",
          willChange: "transform, opacity",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl modal-flow-layer"
          style={{
            background:
              "radial-gradient(70% 55% at 14% 10%, rgba(0,153,255,0.18), transparent 65%), radial-gradient(50% 40% at 88% 88%, rgba(0,153,255,0.12), transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
          <div className="md:w-1/2 flex flex-col justify-center space-y-4">
            <h1
              style={{
                fontFamily: "'CreatoDisplay', sans-serif",
                fontWeight: "700",
                letterSpacing: "1.5px",
              }}
              className="text-3xl md:text-4xl text-white"
            >
              {selectedProject.details?.title || selectedProject.title}
            </h1>

            <div
              className="w-20 h-1 rounded-full"
              style={{
                background: "linear-gradient(to right, #0099ff, #00d4ff)",
                boxShadow: "0 0 8px #0099ff, 0 0 16px #00d4ff",
              }}
            ></div>

            <p className="text-white text-sm md:text-base max-w-[90%] opacity-80 text-justify leading-relaxed">
              {selectedProject.details?.description || selectedProject.description}
            </p>
          </div>

          <div className="md:w-1/2 flex justify-center items-start">
            <div className="w-full max-w-md">
              <Lens zoomFactor={1.65} lensSize={150}>
                <img
                  src={selectedProject.details?.heroImage || selectedProject.image}
                  alt={`${selectedProject.title} preview`}
                  className="w-full max-h-60 md:max-h-72 object-contain rounded-lg"
                />
              </Lens>
            </div>
          </div>
        </div>

        <div
          className="relative z-10 mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 p-3 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {(selectedProject.details?.galleryImages?.length
            ? selectedProject.details.galleryImages
            : [selectedProject.image]
          ).map((imageSrc, index) => (
            <div
              key={`${selectedProject.title}-gallery-${index}`}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-cyan-500/40"
            >
              <img
                src={imageSrc}
                alt={`${selectedProject.title} gallery ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <button
          onClick={closeDetailsModal}
          className="relative z-10 absolute top-5 right-5 text-white text-lg font-bold hover:text-[#0099ff] transition-colors"
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  )}

  {isAddProjectModalMounted &&
    typeof window !== "undefined" &&
    createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-[2px] transition-opacity duration-[380ms] ease-out ${
        addProjectModalVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={closeAddProjectModal}
    >
      <div
        className={`relative w-11/12 max-w-5xl max-h-[84vh] overflow-y-auto rounded-3xl border border-[#0099ff]/25 shadow-[0_0_24px_rgba(0,153,255,0.22)] modal-blue-flow p-5 md:p-6 transform transition-[opacity,transform] duration-[520ms] ease-[cubic-bezier(0.2,0.82,0.2,1)] ${
          addProjectModalVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(255,255,255,0.1), rgba(0,153,255,0.16))",
          transformOrigin: "50% 100%",
          transform: addProjectModalVisible
            ? "translate3d(0,0,0) scale(1) rotate(0deg)"
            : "translate3d(0, 44vh, 0) scale(0.18) rotate(0deg)",
          willChange: "transform, opacity",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl modal-flow-layer"
          style={{
            background:
              "radial-gradient(65% 50% at 12% 8%, rgba(0,153,255,0.2), transparent 68%), radial-gradient(45% 36% at 86% 92%, rgba(0,153,255,0.13), transparent 72%)",
          }}
        />

        <h2
          className="relative z-10 text-2xl md:text-3xl text-white font-bold"
          style={{ fontFamily: "'CreatoDisplay', sans-serif", letterSpacing: "1px" }}
        >
          Add Project to {activeBox}
        </h2>
        <p className="relative z-10 text-xs md:text-sm text-white/75 mt-2">
          Fill in the fields below. Video edits can use a custom carousel heading or fall back to
          the project title, plus one or more direct playable files.
        </p>

        <form onSubmit={handleAddProjectSubmit} className="relative z-10 mt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newProjectForm.title}
              onChange={(e) => setNewProjectForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Project title"
              className="w-full rounded-lg border border-white/20 bg-black/30 text-white text-sm px-3 py-2 outline-none focus:border-[#0099ff]"
              required
            />
            <input
              type="text"
              value={newProjectForm.image}
              onChange={(e) => setNewProjectForm((prev) => ({ ...prev, image: e.target.value }))}
              placeholder="Card image path (e.g. /my-image.png)"
              className="w-full rounded-lg border border-white/20 bg-black/30 text-white text-sm px-3 py-2 outline-none focus:border-[#0099ff]"
            />
            <input
              type="text"
              value={newProjectForm.designLink}
              onChange={(e) => setNewProjectForm((prev) => ({ ...prev, designLink: e.target.value }))}
              placeholder={
                activeBox === "Video Edit"
                  ? "Project link (optional)"
                  : "Design link (e.g. https://...)"
              }
              className="w-full rounded-lg border border-white/20 bg-black/30 text-white text-sm px-3 py-2 outline-none focus:border-[#0099ff]"
            />
            {activeBox !== "Video Edit" ? (
              <label className="flex items-center gap-2 text-sm text-white/90">
                <input
                  type="checkbox"
                  checked={newProjectForm.showDetailsModal}
                  onChange={(e) =>
                    setNewProjectForm((prev) => ({ ...prev, showDetailsModal: e.target.checked }))
                  }
                  className="accent-[#0099ff]"
                />
                Enable details modal for this project
              </label>
            ) : null}
          </div>

          <textarea
            value={newProjectForm.description}
            onChange={(e) => setNewProjectForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Project description"
            className="w-full min-h-[120px] rounded-lg border border-white/20 bg-black/30 text-white text-sm px-3 py-2 outline-none focus:border-[#0099ff]"
            required
          />

          {activeBox === "Video Edit" && (
            <div className="rounded-xl border border-[#8fdcff]/18 bg-[#06111a]/72 p-4 space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#8fdcff]">
                  Video Project Setup
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/60">
                  Each Video Edit project becomes one project box. When someone clicks it, the
                  uploaded clips open inside that project viewer instead of loading every video at
                  once.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newProjectForm.videoCategory}
                  onChange={(e) =>
                    setNewProjectForm((prev) => ({ ...prev, videoCategory: e.target.value }))
                  }
                  placeholder="Carousel heading for this project (leave blank to use project title)"
                  className="w-full rounded-lg border border-white/20 bg-black/30 text-white text-sm px-3 py-2 outline-none focus:border-[#0099ff]"
                />
                <input
                  type="text"
                  value={newProjectForm.videoParentLabel}
                  onChange={(e) =>
                    setNewProjectForm((prev) => ({ ...prev, videoParentLabel: e.target.value }))
                  }
                  placeholder="Small label under the title (e.g. Vast Professionals)"
                  className="w-full rounded-lg border border-white/20 bg-black/30 text-white text-sm px-3 py-2 outline-none focus:border-[#0099ff]"
                />
                <div className="space-y-2 md:col-span-2">
                  <div>
                    <p className="text-sm text-white/85">Video ratio</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/55">
                      Choose the format for this carousel project so the website can size the
                      player correctly for long-form or short-form videos. All clips in this
                      project must match the same ratio.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {VIDEO_ASPECT_RATIO_OPTIONS.map((option) => {
                      const isSelected = newProjectForm.videoAspectRatio === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            {
                              setAddProjectError("");
                              setNewProjectForm((prev) => ({
                                ...prev,
                                videoAspectRatio: option.value,
                              }));
                            }
                          }
                          className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                            isSelected
                              ? "border-[#36d1ff]/55 bg-[#081927] text-white"
                              : "border-white/15 bg-black/20 text-white/78 hover:border-[#36d1ff]/30 hover:bg-[#07131d]"
                          }`}
                        >
                          <p className="text-sm font-semibold">{option.label}</p>
                          <p className="mt-1 text-xs leading-relaxed text-white/55">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-3">
                  {newProjectForm.videoUrls.map((videoUrl, index) => (
                    <div key={`new-project-video-${index}`} className="flex gap-2">
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) =>
                          setNewProjectForm((prev) => {
                            const nextVideoUrls = [...prev.videoUrls];
                            nextVideoUrls[index] = e.target.value;
                            return { ...prev, videoUrls: nextVideoUrls };
                          })
                        }
                        placeholder={`Direct video file path for clip ${index + 1} (e.g. /vide1.mp4)`}
                        className="w-full rounded-lg border border-white/20 bg-black/30 text-white text-sm px-3 py-2 outline-none focus:border-[#0099ff]"
                      />
                      {newProjectForm.videoUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setNewProjectForm((prev) => ({
                              ...prev,
                              videoUrls: prev.videoUrls.filter((_, itemIndex) => itemIndex !== index),
                            }))
                          }
                          className="rounded-lg border border-white/20 px-3 text-xs text-white/75 hover:bg-white/10 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setNewProjectForm((prev) => ({
                        ...prev,
                        videoUrls: [...prev.videoUrls, ""],
                      }))
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-[#0099ff]/60 px-3 py-2 text-xs text-[#8fd3ff] hover:bg-[#0099ff]/15 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add another clip
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeBox !== "Video Edit" && newProjectForm.showDetailsModal && (
            <div className="rounded-xl border border-white/15 bg-black/25 p-4 space-y-4">
              <h3 className="text-sm md:text-base font-semibold text-white">Details Modal Content</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newProjectForm.detailsTitle}
                  onChange={(e) =>
                    setNewProjectForm((prev) => ({ ...prev, detailsTitle: e.target.value }))
                  }
                  placeholder="Details modal title"
                  className="w-full rounded-lg border border-white/20 bg-black/30 text-white text-sm px-3 py-2 outline-none focus:border-[#0099ff]"
                />
                <input
                  type="text"
                  value={newProjectForm.detailsHeroImage}
                  onChange={(e) =>
                    setNewProjectForm((prev) => ({ ...prev, detailsHeroImage: e.target.value }))
                  }
                  placeholder="Details hero image path"
                  className="w-full rounded-lg border border-white/20 bg-black/30 text-white text-sm px-3 py-2 outline-none focus:border-[#0099ff]"
                />
              </div>

              <textarea
                value={newProjectForm.detailsDescription}
                onChange={(e) =>
                  setNewProjectForm((prev) => ({ ...prev, detailsDescription: e.target.value }))
                }
                placeholder="Details modal description"
                className="w-full min-h-[100px] rounded-lg border border-white/20 bg-black/30 text-white text-sm px-3 py-2 outline-none focus:border-[#0099ff]"
              />

              <div className="space-y-3">
                {newProjectForm.galleryImages.map((imagePath, index) => (
                  <div key={`new-gallery-${index}`} className="flex gap-2">
                    <input
                      type="text"
                      value={imagePath}
                      onChange={(e) => updateGalleryImage(index, e.target.value)}
                      placeholder={`Gallery image ${index + 1} path`}
                      className="w-full rounded-lg border border-white/20 bg-black/30 text-white text-sm px-3 py-2 outline-none focus:border-[#0099ff]"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryInput(index)}
                      className="px-3 rounded-lg border border-white/20 text-white/85 text-sm hover:bg-white/10 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addGalleryInput}
                  className="px-3 py-2 rounded-lg border border-[#0099ff]/60 text-[#8fd3ff] text-sm hover:bg-[#0099ff]/15 transition-colors"
                >
                  + Add gallery image
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end">
            {addProjectError ? (
              <p className="sm:mr-auto text-sm text-amber-200">{addProjectError}</p>
            ) : null}
            <button
              type="button"
              onClick={closeAddProjectModal}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/90 text-sm hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingProject}
              className="px-4 py-2 rounded-lg bg-[#0099ff] text-white text-sm font-semibold hover:bg-[#00a6ff] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isAddingProject ? "Checking ratio..." : "Add Project"}
            </button>
          </div>
        </form>

        <button
          onClick={closeAddProjectModal}
          className="relative z-10 absolute top-4 right-4 text-white text-lg font-bold hover:text-[#0099ff] transition-colors"
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  )}

  {/* Fade-in animation & font */}
  <style jsx>{`
    @font-face {
      font-family: 'CreatoDisplay';
      src: url('/fonts/CreatoDisplay-Regular.otf') format('opentype');
      font-weight: normal;
      font-style: normal;
    }
    .project-heading {
      font-family: 'CreatoDisplay', sans-serif;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.7s forwards;
    }
    @keyframes modalBlueFlow {
      0%, 100% {
        box-shadow: 0 0 18px rgba(0, 153, 255, 0.14), 0 0 38px rgba(0, 153, 255, 0.08);
      }
      50% {
        box-shadow: 0 0 28px rgba(0, 153, 255, 0.24), 0 0 52px rgba(0, 153, 255, 0.14);
      }
    }
    @keyframes modalFlowLayer {
      0%, 100% {
        opacity: 0.42;
        transform: scale(1);
      }
      50% {
        opacity: 0.72;
        transform: scale(1.03);
      }
    }
    .modal-blue-flow {
      animation: modalBlueFlow 4s ease-in-out infinite;
    }
    .modal-flow-layer {
      animation: modalFlowLayer 4.2s ease-in-out infinite;
    }
  `}</style>












{/* ADDITIONAL SECTIONS FOR SIDE NAV */}

     
      <div ref={reviewsRef} className="relative mt-16 flex flex-col items-center overflow-visible transition-all duration-700 ease-out lg:mt-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[12%] h-64 w-[72%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.14)_0%,rgba(0,153,255,0.03)_44%,transparent_72%)] blur-3xl" />
          <div className="absolute left-1/2 bottom-[-8%] h-40 w-[78%] -translate-x-1/2 bg-[radial-gradient(circle,rgba(96,214,255,0.16)_0%,rgba(96,214,255,0.06)_34%,transparent_74%)] blur-3xl opacity-80" />
        </div>
        <div className={`${glassSectionClass} z-10`}>
          <GlowingEffect {...mainSectionGlowProps} className="z-[2]" />
          <div className={glassSectionPanelClass}>
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <div className="absolute right-[6%] top-[10%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.12)_0%,transparent_74%)] blur-3xl" />
              <div className="absolute left-[4%] top-[22%] h-44 w-44 rounded-full border border-white/6 opacity-60" />
              <div className="absolute right-[12%] bottom-[16%] h-32 w-32 rounded-[28px] border border-[#00d4ff]/10 opacity-70" />
              <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
              <div className="absolute inset-y-[16%] left-[7%] w-px bg-gradient-to-b from-transparent via-white/16 to-transparent" />
              <div className="absolute inset-y-[22%] right-[7%] w-px bg-gradient-to-b from-transparent via-[#8fdcff]/18 to-transparent" />
            </div>
            <div className={`${glassSectionInnerClass} space-y-8`}>
            <div
              className={`flex flex-col gap-6 transition-[opacity,transform] duration-420 ease-out ${
                showReviewsIntro ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-6 scale-95"
              }`}
            >
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#8fdcff]">Reviews</p>
                <h2
                  className="mt-4 text-3xl font-bold text-white sm:text-4xl"
                  style={{
                    fontFamily: "'CreatoDisplay', sans-serif",
                    letterSpacing: "0.03em",
                    textShadow: "0 0 16px rgba(0,153,255,0.14)",
                  }}
                >
                  Real feedback from people I&apos;ve created with.
                </h2>
                <p className="mt-4 max-w-[68rem] text-sm leading-relaxed text-white/72 sm:text-base lg:max-w-[72rem] xl:max-w-[78rem]">
                  These stories come from clients and collaborators who trusted me with edits,
                  visuals, revisions, and delivery. Every review reflects the care, consistency,
                  and creative direction I bring into each project. They also show how I approach
                  communication, revision flow, and the final polish from start to finish.
                </p>
              </div>
            </div>
            <div
              className={`w-full transition-[opacity,transform,filter] duration-[520ms] ease-out ${
                showReviewsTestimonials
                  ? "opacity-100 translate-y-0 blur-0"
                  : "pointer-events-none opacity-0 translate-y-8 blur-sm"
              }`}
            >
              <div className="w-full scale-100 transform-gpu sm:scale-[1.03]">
                <AnimatedTestimonialsDemo />
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
      <div ref={contactRef} className="relative mt-16 flex flex-col items-center overflow-visible pb-20 transition-all duration-700 ease-out lg:mt-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[4%] h-[30rem] w-[86%] -translate-x-1/2 bg-[radial-gradient(circle,rgba(0,153,255,0.14)_0%,rgba(0,153,255,0.05)_38%,transparent_76%)] blur-3xl" />
          <div className="absolute right-[8%] top-[16%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.18)_0%,transparent_72%)] blur-3xl" />
          <div className="absolute left-[10%] bottom-[12%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_74%)] blur-3xl" />
          <div className="absolute left-[8%] top-[22%] h-40 w-40 rounded-[32px] border border-white/6 opacity-55 rotate-[10deg]" />
          <div className="absolute right-[14%] top-[34%] h-28 w-28 rounded-full border border-[#8fdcff]/12 opacity-75" />
          <div className="absolute right-[18%] bottom-[10%] h-36 w-36 rounded-[30px] border border-[#00d4ff]/10 opacity-60 rotate-[16deg]" />
          <div className="absolute left-[16%] bottom-[18%] h-24 w-56 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_72%)] blur-2xl" />
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(143,220,255,0.12)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
          <div className="absolute inset-y-[18%] left-[7%] w-px bg-gradient-to-b from-transparent via-white/14 to-transparent" />
          <div className="absolute inset-y-[24%] right-[9%] w-px bg-gradient-to-b from-transparent via-[#8fdcff]/16 to-transparent" />
          <div className="absolute left-1/2 bottom-[-6%] h-44 w-[82%] -translate-x-1/2 bg-[radial-gradient(circle,rgba(0,153,255,0.14)_0%,rgba(0,153,255,0.05)_34%,transparent_74%)] blur-3xl opacity-90" />
        </div>
        <div className={`${glassSectionClass} z-10`}>
          <GlowingEffect {...mainSectionGlowProps} className="z-[2]" />
          <div className={glassSectionPanelClass}>
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>
            <div
              className={`${glassSectionInnerClass} grid gap-8 ${
                showRates ? "" : "lg:grid-cols-[0.95fr_1.05fr] lg:gap-10"
              }`}
            >
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#8fdcff]">Contact</p>
                <h2
                  className="mt-4 text-3xl font-bold text-white sm:text-4xl"
                  style={{
                    fontFamily: "'CreatoDisplay', sans-serif",
                    letterSpacing: "0.03em",
                    textShadow: "0 0 16px rgba(0,153,255,0.18)",
                  }}
                >
                  Let&apos;s build something clean, cinematic, and memorable.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/72 sm:text-base">
                  Reach out through your preferred platform, or send a direct message right here on the site.
                  Replies from the form will be sent to{" "}
                  <span className="font-semibold text-[#a6e5ff]">aiakosedt@gmail.com</span>.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={toggleContactFormPanel}
                  className="inline-flex items-center justify-center rounded-full border border-[#00d4ff]/45 bg-[#04101a]/70 px-5 py-2.5 text-sm font-semibold text-[#9be8ff] transition-colors hover:bg-[#072033]"
                >
                  {showContactForm ? "Hide message form" : "Open message form"}
                </button>
                <a
                  href="mailto:aiakosedt@gmail.com"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10"
                >
                  Email directly
                </a>
                <button
                  type="button"
                  onClick={toggleRatesPanel}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10"
                >
                  {showRates ? "Hide rates" : "Rates"}
                </button>
              </div>

              {isRatesPanelMounted && (
                <div className="mt-5">
                  <div
                    className={`transform-gpu rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(10,18,28,0.92),rgba(5,10,16,0.98))] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-[opacity,transform] duration-220 ease-out will-change-transform sm:p-5 ${
                      isRatesPanelVisible
                        ? "translate-y-0 scale-100"
                        : "-translate-y-4 scale-[0.985] pointer-events-none"
                    } ${isRatesPanelVisible ? "opacity-100" : "opacity-0"}`}
                  >
                    <div
                      className={`flex flex-col gap-3 transition-opacity duration-180 ease-out sm:flex-row sm:items-start sm:justify-between sm:gap-4 ${
                        isRatesPanelVisible ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <div className="max-w-xl">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-[#8fdcff]">
                          Rates
                        </p>
                        <h3 className="mt-2 text-base font-semibold text-white">
                          {ratePanelTitle}
                        </h3>
                        <p className="mt-1 max-w-xl text-xs leading-relaxed text-white/56">
                          {ratePanelSubtitle}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveRateCategory((previous) =>
                            previous === "video-edit" ? "graphic-design" : "video-edit"
                          )
                        }
                        className="inline-flex w-fit shrink-0 items-center justify-center self-start rounded-full border border-[#8fdcff]/20 bg-[#07141f] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#aeeaff] transition-[transform,border-color,background-color] duration-180 ease-out hover:-translate-y-[1px] hover:border-[#8fdcff]/38 hover:bg-[#0a1b29]"
                      >
                        {ratePanelToggleLabel}
                      </button>
                    </div>

                    <div className="mt-4 -mx-1 overflow-x-auto pb-1">
                      <div className="flex min-w-full gap-3 px-1">
                        {activeRateSections.map((section) => (
                          <div key={section.title} className={section.wrapperClass}>
                            <CompactRateTable
                              title={section.title}
                              subtitle={section.subtitle}
                              rows={section.rows}
                              onRowSelect={(row) => handleRateRowSelect(row, activeRateCategory)}
                              isVisible={isRatesPanelVisible}
                              animationDelayMs={section.animationDelayMs}
                            />
                          </div>
                        ))}
                        <div
                          className={`w-[144px] min-w-[144px] max-w-[144px] shrink-0 rounded-[20px] border border-white/10 bg-white/[0.03] px-3 py-3 transition-[opacity,transform] duration-260 ease-out sm:w-[160px] sm:min-w-[160px] sm:max-w-[160px] ${
                            isRatesPanelVisible
                              ? "translate-y-0 scale-100 opacity-100"
                              : "translate-y-3 scale-[0.98] opacity-0"
                          }`}
                          style={{ transitionDelay: "120ms" }}
                        >
                          <p className="text-[10px] uppercase tracking-[0.22em] text-white/44">
                            Notes
                          </p>
                          <div className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-white/58">
                            {activeRateNotes.map((note) => (
                              <p key={note}>{note}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!showRates && <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {contactPlatforms.map((platform) => {
                  const logoClass =
                    platform.label === "Upwork"
                      ? "text-[#8af0b5]/10 group-hover:text-[#8af0b5]/14"
                      : platform.label === "Fiverr"
                        ? "text-[#7df3aa]/10 group-hover:text-[#7df3aa]/14"
                        : "text-[#6ec8ff]/10 group-hover:text-[#6ec8ff]/14";

                  return (
                    <a
                      key={platform.label}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-left transition-[transform,border-color,background-color,box-shadow] duration-180 ease-out hover:-translate-y-1 hover:border-[#00d4ff]/35 hover:bg-white/[0.07] hover:shadow-[0_14px_34px_rgba(0,153,255,0.16)]"
                    >
                      <div
                        className={`pointer-events-none absolute inset-y-0 right-2 flex items-center justify-center transition-[opacity,transform,color] duration-180 ease-out ${logoClass}`}
                      >
                        <PlatformBackgroundLogo
                          label={platform.label}
                          className="h-16 w-16 translate-x-2 opacity-90 group-hover:translate-x-1 sm:h-20 sm:w-20"
                        />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">{platform.label}</span>
                          <ArrowUpRight className="h-4 w-4 text-[#8fdcff] transition-transform duration-180 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-white/62">
                          {platform.description}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>

              <div
                ref={contactMessageCardRef}
                className="relative overflow-visible rounded-[26px] border border-white/12 bg-black/20 p-4 backdrop-blur-md sm:p-5"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">Send a message</h3>
                      <p className="mt-1 text-sm text-white/60">
                        Leave your email and message here, and it will be sent to Gmail.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleContactFormPanel}
                      className="rounded-full border border-white/15 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 transition-colors hover:bg-white/10"
                    >
                      {showContactForm ? "Close" : "Write"}
                    </button>
                  </div>

                  {isContactFormMounted && (
                    <div
                      className={`mt-5 transform-gpu transition-[opacity,transform] duration-220 ease-out will-change-transform ${
                        isContactFormVisible
                          ? "translate-y-0 scale-100 opacity-100"
                          : "-translate-y-3 scale-[0.985] opacity-0 pointer-events-none"
                      }`}
                    >
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input
                          type="text"
                          value={contactForm.name}
                          onChange={(event) => updateContactField("name", event.target.value)}
                          placeholder="Your name"
                          className="w-full rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-[#00d4ff]/55"
                          required
                        />
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(event) => updateContactField("email", event.target.value)}
                          placeholder="Your email"
                          className="w-full rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-[#00d4ff]/55"
                          required
                        />
                      </div>
                      <div
                        className={`grid gap-4 ${
                          contactForm.serviceType === "video-edit"
                            ? "sm:grid-cols-2"
                            : ""
                        }`}
                      >
                        <ContactSelect
                          label="Service"
                          placeholder="Select a service"
                          value={contactForm.serviceType}
                          options={contactServiceOptions}
                          onChange={(nextValue) => updateContactField("serviceType", nextValue)}
                        />
                        {contactForm.serviceType === "video-edit" && (
                          <ContactSelect
                            label="Edit type"
                            placeholder="Select video edit type"
                            value={contactForm.videoEditType}
                            options={videoEditTypeOptions}
                            onChange={(nextValue) =>
                              updateContactField("videoEditType", nextValue)
                            }
                          />
                        )}
                      </div>
                      <textarea
                        ref={contactMessageRef}
                        value={contactForm.message}
                        onChange={(event) => updateContactField("message", event.target.value)}
                        placeholder="Tell me about your project..."
                        className="min-h-[150px] w-full rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-[#00d4ff]/55"
                        required
                      />
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p
                          className={`text-sm ${
                            contactSubmitState.status === "error"
                              ? "text-[#ffb4b4]"
                              : contactSubmitState.status === "success"
                                ? "text-[#9ff3c8]"
                                : "text-white/55"
                          }`}
                        >
                          {contactSubmitState.message ||
                            (selectedRateSummary
                              ? `Selected rate: ${selectedRateSummary}`
                              : "Select a rate in the Rates section to attach it to your inquiry.")}
                        </p>
                        <button
                          type="submit"
                          disabled={contactSubmitState.status === "sending"}
                          className="inline-flex items-center justify-center rounded-full bg-[#0099ff] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00a6ff] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {contactSubmitState.status === "sending" ? "Sending..." : "Send message"}
                        </button>
                      </div>
                    </form>
                    </div>
                  )}
                </div>
              </div>
            </div>}
          </div>
          </div>
        </div>
      </div>
      <div className="relative flex flex-col items-center overflow-hidden pb-14 lg:pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="relative z-10 w-full max-w-5xl px-5 sm:px-8 lg:px-10">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#050a12]/88 px-5 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] transform-gpu [backface-visibility:hidden] sm:px-6 sm:py-6">
            <GlowingEffect {...mainSectionGlowProps} className="z-[2]" />
            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <p className="text-[10px] uppercase tracking-[0.34em] text-[#8fdcff]">
                  Socials
                </p>
                <h2
                  className="mt-3 text-2xl font-semibold text-white sm:text-[2rem]"
                  style={{
                    fontFamily: "'CreatoDisplay', sans-serif",
                    letterSpacing: "0.03em",
                  }}
                >
                  Find me beyond the portfolio.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/62">
                  A smaller space for the platforms where I share my edits, visuals, and updates.
                </p>
              </div>

              <a
                href="mailto:aiakosedt@gmail.com"
                className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/85 transition-colors hover:bg-white/[0.08]"
              >
                Email me
              </a>
            </div>

            <div className="relative z-10 mt-5 grid gap-3 md:grid-cols-3">
              {socialLinks.map((social, index) => {
                const accentClass =
                  index === 0
                    ? "bg-[#6ec8ff]"
                    : index === 1
                      ? "bg-[#8ef0d2]"
                      : "bg-[#ffd28e]";
                const logoClass =
                  index === 0
                    ? "text-[#6ec8ff]/10 group-hover:text-[#6ec8ff]/14"
                    : index === 1
                      ? "text-[#8ef0d2]/10 group-hover:text-[#8ef0d2]/14"
                      : "text-[#ffd28e]/10 group-hover:text-[#ffd28e]/14";

                const content = (
                  <>
                    <div
                      className={`pointer-events-none absolute inset-y-0 right-2 flex items-center justify-center transition-[opacity,transform,color] duration-180 ease-out ${logoClass}`}
                    >
                      <PlatformBackgroundLogo
                        label={social.label}
                        className="h-20 w-20 translate-x-2 opacity-90 group-hover:translate-x-1 sm:h-24 sm:w-24"
                      />
                    </div>
                    <div className={`absolute left-0 top-0 z-10 h-full w-[3px] ${accentClass}`} />
                    <div className="relative z-10 pl-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">
                          {social.label}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-white/45 transition-[color,transform] duration-180 ease-out group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-white sm:text-[15px]">
                        {social.handle}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-white/55">
                        {social.description}
                      </p>
                    </div>
                  </>
                );

                if (social.options) {
                  return (
                    <div key={social.label} ref={tikTokBubbleRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTikTokModal((previous) => !previous)}
                        className={`group relative w-full overflow-hidden rounded-[22px] border bg-white/[0.03] px-4 py-4 text-left transition-[transform,border-color,background-color,box-shadow] duration-180 ease-out hover:-translate-y-1 hover:bg-white/[0.06] ${
                          showTikTokModal
                            ? "border-white/22 shadow-[0_14px_36px_rgba(0,0,0,0.2)]"
                            : "border-white/10 hover:border-white/18"
                        }`}
                        aria-expanded={showTikTokModal}
                        aria-haspopup="dialog"
                      >
                        {content}
                      </button>

                      {isTikTokBubbleMounted && (
                        <div
                          className={`absolute bottom-full left-1/2 z-20 mb-3 w-[220px] -translate-x-1/2 transition-[opacity,transform] duration-140 ease-out ${
                            isTikTokBubbleVisible
                              ? "translate-y-0 opacity-100"
                              : "translate-y-2 opacity-0"
                          }`}
                        >
                          <div
                            className={`relative rounded-[20px] border border-white/12 bg-[#060b12]/96 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-[opacity,transform] duration-140 ease-out ${
                              isTikTokBubbleVisible ? "scale-100" : "scale-95"
                            }`}
                          >
                            <div
                              className={`pointer-events-none absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rotate-45 border-b border-r border-white/12 bg-[#060b12]/96 transition-opacity duration-140 ease-out ${
                                isTikTokBubbleVisible ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <p className="px-1 text-[10px] uppercase tracking-[0.22em] text-[#8fdcff]">
                              TikTok
                            </p>
                            <div className="mt-3 grid gap-2">
                              {social.options.map((option) => (
                                <a
                                  key={option.href}
                                  href={option.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setShowTikTokModal(false)}
                                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-white transition-[transform,background-color,border-color] duration-160 ease-out hover:translate-x-0.5 hover:bg-white/[0.08]"
                                >
                                  {option.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition-[transform,border-color,background-color] duration-180 ease-out hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.06]"
                  >
                    {content}
                  </a>
                );
              })}
            </div>

            <div className="relative z-10 mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
              <p>Wence Dante De Vera</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/34">
                Creative edits, visuals, and social content
              </p>
            </div>
          </div>
        </div>
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
          filter: blur(34px);
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
          filter: blur(34px);
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
          filter: blur(22px);
          opacity: 0.92;
          animation: introLogoAuraPulse 4.4s ease-in-out infinite;
        }
        .intro-logo-aura-front {
          width: clamp(9rem, 24vw, 13rem);
          height: clamp(4rem, 12vw, 6.4rem);
          top: 66%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.28) 0%, rgba(143, 220, 255, 0.16) 48%, transparent 74%);
          filter: blur(15px);
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
          filter: blur(16px);
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
          backdrop-filter: blur(14px);
          animation: introLogoFloat 4.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
        .intro-logo-shell::after {
          content: "";
          position: absolute;
          inset: -26% -14%;
          background: linear-gradient(115deg, transparent 34%, rgba(255, 255, 255, 0.76) 48%, rgba(143, 220, 255, 0.32) 54%, transparent 68%);
          transform: translate3d(-56%, 0, 28px) rotate(8deg);
          filter: blur(6px);
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
          background-image: url('/textures/stone.jpg');
          background-size: cover;
          background-position: center;
          -webkit-background-clip: text;
          background-clip: text;
          pointer-events: none;
          opacity: 0.08;
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
    </div>

    
  );
}

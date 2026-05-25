"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Hero } from "@/components/ui/hero";
import { HomeScrollRevealSection } from "@/components/ui/motion-footer";
import { SiteHeader } from "@/components/site-header";
import {
  defaultPortfolioProjects,
  fetchPortfolioContentFromSupabase,
  PORTFOLIO_STORAGE_KEY,
  type PortfolioCategory,
  type PortfolioProject,
  type PortfolioProjects,
} from "@/lib/portfolio-data";

export const EMPTY_PROJECTS: PortfolioProjects = defaultPortfolioProjects;

export const CATEGORY_PATHS: Record<PortfolioCategory, string> = {
  "Graphic Design": "/portfolio/graphic-design",
  "Video Edit": "/portfolio/video-editing",
  Websites: "/portfolio/web-development",
};

export type ProjectCard = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href?: string;
  year: string;
  tags: string[];
};

export type CategoryConfig = {
  label: string;
  heroLead?: string;
  heroTitle: string;
  heroSubtitle: string;
  fallbackCards: ProjectCard[];
  fallbackTags: string[];
};

export const CATEGORY_CONFIG: Record<PortfolioCategory, CategoryConfig> = {
  "Video Edit": {
    label: "Video Editing",
    heroLead: "Short-form. Long-form.",
    heroTitle: "Edits that keep momentum.",
    heroSubtitle:
      "Short-form clips, long-form stories, Adobe Premiere Pro, After Effects, and CapCut workflows for content that feels ready to publish.",
    fallbackTags: ["SHORT-FORM", "ADOBE PREMIERE PRO", "AFTER EFFECTS", "CAPCUT", "PHOTOSHOP"],
    fallbackCards: [
      {
        title: "Short-Form Reel System",
        description:
          "Fast trims, clean motion, and platform-ready polish for reels, shorts, and TikToks.",
        imageSrc:
          "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Video editing timeline on a monitor",
        year: "2026",
        tags: ["SHORT-FORM", "ADOBE PREMIERE PRO", "AFTER EFFECTS", "CAPCUT", "PHOTOSHOP"],
      },
      {
        title: "Long-Form Story Cut",
        description:
          "Cleaner structure, tighter sections, smoother audio, and watch-through polish for longer content.",
        imageSrc:
          "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Camera and video production setup",
        year: "2025",
        tags: ["LONG-FORM", "ADOBE PREMIERE PRO", "AFTER EFFECTS", "AUDITION", "YOUTUBE"],
      },
      {
        title: "Promo Edit Package",
        description:
          "Brand-ready clips shaped for launches, promos, client announcements, and social campaigns.",
        imageSrc:
          "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Video production scene with lights",
        year: "2025",
        tags: ["PROMO VIDEO", "ADOBE PREMIERE PRO", "AFTER EFFECTS", "PHOTOSHOP", "CANVA"],
      },
    ],
  },
  "Graphic Design": {
    label: "Graphic Design",
    heroTitle: "Visuals that read fast.",
    heroSubtitle:
      "Thumbnails, social posts, layouts, and brand assets with clear hierarchy and polished detail.",
    fallbackTags: ["ADOBE PHOTOSHOP", "ADOBE ILLUSTRATOR", "CANVA", "FIGMA", "SOCIAL MEDIA"],
    fallbackCards: [
      {
        title: "Social Asset Direction",
        description:
          "Readable posts, banners, and content layouts that stay aligned with the brand voice.",
        imageSrc:
          "https://images.unsplash.com/photo-1747435628628-60d0bf15ec8d?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Colorful abstract graphic design texture",
        year: "2026",
        tags: ["SOCIAL MEDIA", "ADOBE PHOTOSHOP", "CANVA", "FIGMA", "BRAND KIT"],
      },
      {
        title: "Thumbnail Design System",
        description:
          "High-clarity visual systems built to catch attention quickly without losing polish.",
        imageSrc:
          "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Graphic designer workspace",
        year: "2025",
        tags: ["THUMBNAILS", "ADOBE PHOTOSHOP", "ADOBE ILLUSTRATOR", "CANVA", "YOUTUBE"],
      },
      {
        title: "Brand Support Assets",
        description:
          "Consistent visual pieces for campaigns, promos, decks, and client-facing material.",
        imageSrc:
          "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Abstract brand design background",
        year: "2025",
        tags: ["BRAND ASSETS", "ADOBE ILLUSTRATOR", "ADOBE PHOTOSHOP", "FIGMA", "CANVA"],
      },
    ],
  },
  Websites: {
    label: "Web Development",
    heroTitle: "Pages that feel ready.",
    heroSubtitle:
      "Responsive portfolios, landing pages, and web sections with clean structure and smooth presentation.",
    fallbackTags: ["NEXT.JS", "REACT", "TYPESCRIPT", "TAILWIND CSS", "FRAMER MOTION"],
    fallbackCards: [
      {
        title: "Landing Page Build",
        description:
          "Clear sections, responsive layout, and strong first impressions for service-focused pages.",
        imageSrc:
          "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Web design workspace",
        year: "2026",
        tags: ["LANDING PAGE", "NEXT.JS", "REACT", "TAILWIND CSS", "TYPESCRIPT"],
      },
      {
        title: "Portfolio Website",
        description:
          "Project-focused pages built to scan well and show creative work with better structure.",
        imageSrc:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Laptop with code",
        year: "2025",
        tags: ["PORTFOLIO", "NEXT.JS", "REACT", "TAILWIND CSS", "FRAMER MOTION"],
      },
      {
        title: "Reusable UI Sections",
        description:
          "Clean components that adapt across desktop and mobile without feeling cramped.",
        imageSrc:
          "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Code editor on a screen",
        year: "2025",
        tags: ["COMPONENTS", "REACT", "TYPESCRIPT", "FRAMER MOTION", "TAILWIND CSS"],
      },
    ],
  },
};

export const normalizePortfolioProjects = (value: unknown): PortfolioProjects => {
  if (!value || typeof value !== "object") {
    return defaultPortfolioProjects;
  }

  const raw = value as Record<string, unknown>;

  return {
    "Graphic Design": Array.isArray(raw["Graphic Design"])
      ? (raw["Graphic Design"] as PortfolioProject[])
      : defaultPortfolioProjects["Graphic Design"],
    "Video Edit": Array.isArray(raw["Video Edit"])
      ? (raw["Video Edit"] as PortfolioProject[])
      : defaultPortfolioProjects["Video Edit"],
    Websites: Array.isArray(raw.Websites)
      ? (raw.Websites as PortfolioProject[])
      : defaultPortfolioProjects.Websites,
  };
};

const isPortraitPlaceholderImage = (value: string) => {
  const normalizedValue = value
    .trim()
    .replace(/\\/g, "/")
    .split("#")[0]
    .split("?")[0]
    .toLowerCase();
  const basename = normalizedValue.slice(normalizedValue.lastIndexOf("/") + 1);

  return /^(wens|wence)/i.test(basename);
};

export const getProjectImage = (project: PortfolioProject) =>
  [project.details?.heroImage, project.image]
    .map((value) => value?.trim() || "")
    .find((value) => value && !isPortraitPlaceholderImage(value)) || "";

export const getProjectExternalHref = (project: PortfolioProject) => {
  const designLink = project.designLink?.trim();
  if (designLink && designLink !== "#") return designLink;

  const firstVideoUrl =
    project.videoUrls?.find((item) => item.trim().length > 0) || project.videoUrl?.trim();
  if (firstVideoUrl) return firstVideoUrl;

  const heroImage = project.details?.heroImage?.trim();
  if (heroImage) return heroImage;

  const image = project.image?.trim();
  if (image) return image;

  return "";
};

export const getProjectTags = (
  project: PortfolioProject,
  category: PortfolioCategory,
  fallbackTags: string[]
) => {
  const nonToolTags = new Set([
    "CAPTIONS",
    "RETENTION",
    "HOOKS",
    "PACING",
    "STORY FLOW",
    "STORYTELLING",
    "EXPORTS",
  ]);
  const projectFormat =
    category === "Video Edit" && project.videoCategory?.trim()
      ? project.videoCategory
      : undefined;
  const tags = [...fallbackTags, projectFormat]
    .filter((tag): tag is string => Boolean(tag?.trim()))
    .map((tag) => tag.trim().toUpperCase())
    .filter((tag) => !nonToolTags.has(tag));

  return Array.from(new Set(tags));
};

export const getProjectSlug = (title: string) => {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "project";
};

export const getProjectDetailHref = (
  category: PortfolioCategory,
  title: string
) => `${CATEGORY_PATHS[category]}/${getProjectSlug(title)}`;

function ProjectShowcaseCard({ card }: { card: ProjectCard }) {
  const visibleTags = card.tags.slice(0, 4);
  const hiddenTagCount = Math.max(card.tags.length - visibleTags.length, 0);

  const cardContent = (
    <article className="group overflow-hidden rounded-[10px] border border-white/[0.055] bg-[#202322] text-left shadow-[0_18px_54px_rgba(0,0,0,0.28)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-[0_24px_68px_rgba(0,0,0,0.38)]">
      <div className="relative h-[210px] overflow-hidden bg-[#080a09] sm:h-[232px] 2xl:h-[252px]">
        <img
          src={card.imageSrc}
          alt={card.imageAlt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_48%,rgba(0,0,0,0.12)_78%,rgba(0,0,0,0.24)_100%)]" />
      </div>

      <div className="min-h-[154px] bg-[#202322] px-4 pb-4 pt-5 sm:px-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5">
          <h2 className="min-w-0 text-[1.08rem] font-bold leading-tight tracking-[-0.04em] text-white sm:text-[1.18rem]">
            {card.title}
          </h2>
          <span className="shrink-0 select-none pt-0.5 text-sm font-medium text-white/[0.025]">
            {card.year}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-[0.86rem] leading-6 text-[#cbd5de]">
          {card.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/[0.11] bg-[#242827] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.045em] text-[#bfc9d0]"
            >
              {tag}
            </span>
          ))}
          {hiddenTagCount > 0 ? (
            <span className="px-1 text-[0.72rem] font-medium text-[#aeb8bf]">
              +{hiddenTagCount}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );

  if (!card.href) {
    return cardContent;
  }

  return (
    <Link href={card.href} className="block">
      {cardContent}
    </Link>
  );
}

export default function PortfolioCategoryPage({
  category,
}: {
  category: PortfolioCategory;
}) {
  const [projectsByCategory, setProjectsByCategory] = useState<PortfolioProjects>(EMPTY_PROJECTS);
  const config = CATEGORY_CONFIG[category];

  useEffect(() => {
    let localContentTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    if (typeof window !== "undefined") {
      localContentTimer = setTimeout(() => {
        const storedProjects = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY);
        if (!storedProjects) return;

        try {
          setProjectsByCategory(normalizePortfolioProjects(JSON.parse(storedProjects)));
        } catch {
          setProjectsByCategory(EMPTY_PROJECTS);
        }
      }, 0);
    }

    void (async () => {
      const remoteContent = await fetchPortfolioContentFromSupabase();
      if (!cancelled && remoteContent?.projects) {
        setProjectsByCategory(normalizePortfolioProjects(remoteContent.projects));
      }
    })();

    return () => {
      cancelled = true;
      if (localContentTimer) {
        clearTimeout(localContentTimer);
      }
    };
  }, []);

  const projectCards = useMemo(() => {
    const mappedCards = (projectsByCategory[category] || [])
      .slice(0, 3)
      .map((project, index): ProjectCard => {
        const fallback = config.fallbackCards[index % config.fallbackCards.length];

        return {
          title: project.title || fallback.title,
          description: project.description || fallback.description,
          imageSrc: getProjectImage(project) || fallback.imageSrc,
          imageAlt: project.title || fallback.imageAlt,
          href: getProjectDetailHref(category, project.title || fallback.title),
          year: index === 0 ? "2026" : "2025",
          tags: getProjectTags(project, category, fallback.tags),
        };
      });

    const cards = mappedCards.length > 0 ? mappedCards : config.fallbackCards;

    return cards.map((card) => ({
      ...card,
      href: card.href || getProjectDetailHref(category, card.title),
    }));
  }, [category, config, projectsByCategory]);

  const heroTitle = config.heroLead ? (
    <span className="flex flex-col items-center gap-2">
      <span className="text-[0.42em] font-normal leading-none tracking-[-0.025em] text-slate-400 sm:text-[0.44em]">
        {config.heroLead}
      </span>
      <span className="bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
        {config.heroTitle}
      </span>
    </span>
  ) : (
    config.heroTitle
  );
  const laneActions = (Object.keys(CATEGORY_CONFIG) as PortfolioCategory[])
    .filter((item) => item !== category)
    .map((item) => ({
      label: CATEGORY_CONFIG[item].label,
      href: CATEGORY_PATHS[item],
      variant: "outline" as const,
      className:
        "rounded-full border-[#8fdcff]/22 bg-white/[0.035] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#dff8ff] shadow-[0_12px_30px_rgba(84,184,255,0.08)] backdrop-blur-md transition-[border-color,background-color,color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#8fdcff]/44 hover:bg-[#8fdcff]/[0.09] hover:text-white hover:shadow-[0_16px_36px_rgba(84,184,255,0.16)]",
    }));

  return (
    <main className="min-h-screen overflow-hidden bg-[#050706] text-white">
      <SiteHeader activeSection="portfolio" />

      <Hero
        title={heroTitle}
        subtitle={config.heroSubtitle}
        actions={laneActions}
        className="min-h-[58vh] rounded-none bg-[#050706] pt-20"
        titleClassName={`max-w-5xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl md:text-6xl lg:text-7xl ${
          config.heroLead
            ? "text-white"
            : "bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent"
        }`}
        subtitleClassName="mx-auto max-w-2xl text-sm leading-7 text-white/58 sm:text-base md:text-lg"
        actionsClassName="mt-5 flex flex-wrap justify-center gap-3"
      />

      <section className="relative z-10 mx-auto max-w-[90rem] px-6 pb-24 sm:px-10 lg:px-16 xl:px-20">
        <div className="relative -mt-20 mb-12 flex items-center justify-between gap-5">
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-[#8fdcff]/0 via-[#8fdcff]/18 to-[#8fdcff]/0" />
          <Link
            href="/"
            className="group relative inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/56 shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-md transition-[border-color,background-color,color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#8fdcff]/32 hover:bg-[#8fdcff]/[0.07] hover:text-white hover:shadow-[0_14px_34px_rgba(84,184,255,0.14)]"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#8fdcff]/72 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back Home
          </Link>
          <p className="relative inline-flex items-center gap-3 rounded-full border border-[#8fdcff]/18 bg-[#061424]/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#aeeeff] shadow-[0_0_28px_rgba(84,184,255,0.12)] backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8fdcff] opacity-35" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#8fdcff] shadow-[0_0_14px_rgba(143,220,255,0.75)]" />
            </span>
            {config.label}
            <Sparkles className="h-3.5 w-3.5 text-[#8fdcff]/75" />
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:gap-7">
          {projectCards.map((card) => (
            <ProjectShowcaseCard key={`${card.title}-${card.year}`} card={card} />
          ))}
        </div>
      </section>

      <HomeScrollRevealSection />
    </main>
  );
}

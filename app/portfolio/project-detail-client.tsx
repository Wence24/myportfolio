"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Play } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { HomeScrollRevealSection } from "@/components/ui/motion-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {
  CATEGORY_CONFIG,
  CATEGORY_PATHS,
  EMPTY_PROJECTS,
  getProjectDetailHref,
  getProjectExternalHref,
  getProjectImage,
  getProjectSlug,
  getProjectTags,
  normalizePortfolioProjects,
  type ProjectCard,
} from "@/app/portfolio/category-page-client";
import {
  fetchPortfolioContentFromSupabase,
  PORTFOLIO_STORAGE_KEY,
  type PortfolioCategory,
  type PortfolioProject,
  type PortfolioProjects,
} from "@/lib/portfolio-data";

type ProjectEntry = ProjectCard & {
  project?: PortfolioProject;
};

type MediaItem = {
  label: string;
  url: string;
  type: "youtube" | "video" | "image" | "placeholder";
};

const roleByCategory: Record<PortfolioCategory, string> = {
  "Video Edit": "Video editor",
  "Graphic Design": "Graphic designer",
  Websites: "Web developer",
};

const overviewByCategory: Record<PortfolioCategory, string> = {
  "Video Edit":
    "A video piece shaped around pacing, clear structure, and a cleaner watch-through experience.",
  "Graphic Design":
    "A visual direction shaped around readable hierarchy, polished detail, and brand-ready delivery.",
  Websites:
    "A web build shaped around responsive structure, simple interaction, and a page that feels ready to use.",
};

const featureSets: Record<
  PortfolioCategory,
  Array<{ title: string; description: string }>
> = {
  "Video Edit": [
    {
      title: "Hook",
      description: "The opening is trimmed to land quickly and make the next moment easy to follow.",
    },
    {
      title: "Pacing",
      description: "Cuts, pauses, and transitions are tuned so the edit keeps moving without feeling rushed.",
    },
    {
      title: "Sound",
      description: "Audio cleanup, music beds, and emphasis points support the rhythm of the final cut.",
    },
    {
      title: "Delivery",
      description: "Exports are prepared for the platform and format the content needs.",
    },
  ],
  "Graphic Design": [
    {
      title: "Layout",
      description: "The composition is built to scan fast while keeping the main message clear.",
    },
    {
      title: "Visual System",
      description: "Color, type, spacing, and supporting elements stay consistent across the piece.",
    },
    {
      title: "Assets",
      description: "Images and graphics are prepared for polished presentation and clean handoff.",
    },
    {
      title: "Delivery",
      description: "Final visuals are framed in a 1920x1080 presentation-ready format.",
    },
  ],
  Websites: [
    {
      title: "Structure",
      description: "Sections are arranged so the page is easy to scan and navigate.",
    },
    {
      title: "Responsive",
      description: "Layouts are shaped for desktop and mobile without squeezing the content.",
    },
    {
      title: "Interaction",
      description: "Motion and hover states support the page without getting in the way.",
    },
    {
      title: "Delivery",
      description: "The build is presented through clean 1920x1080 project frames.",
    },
  ],
};

const getUniqueValues = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const isImageUrl = (value: string) =>
  /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(value) ||
  value.startsWith("/") ||
  value.includes("images.unsplash.com");

const isVideoUrl = (value: string) =>
  /\.(mp4|webm|mov)(\?.*)?$/i.test(value) ||
  /res\.cloudinary\.com\/[^/]+\/video\/upload/i.test(value);

const getYoutubeEmbedUrl = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  if (/youtube\.com\/embed\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  try {
    const url = new URL(trimmedValue);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const watchId = url.searchParams.get("v");
      if (watchId) return `https://www.youtube.com/embed/${watchId}`;

      const parts = url.pathname.split("/").filter(Boolean);
      const embedIndex = parts.findIndex((part) =>
        ["embed", "shorts", "live"].includes(part)
      );
      const videoId = embedIndex >= 0 ? parts[embedIndex + 1] : "";
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }
  } catch {
    return "";
  }

  return "";
};

const getProjectEntries = (
  projectsByCategory: PortfolioProjects,
  category: PortfolioCategory
): ProjectEntry[] => {
  const config = CATEGORY_CONFIG[category];
  const storedProjects = projectsByCategory[category] || [];

  if (storedProjects.length === 0) {
    return config.fallbackCards.map((card) => ({
      ...card,
      href: getProjectDetailHref(category, card.title),
    }));
  }

  return storedProjects.map((project, index) => {
    const fallback = config.fallbackCards[index % config.fallbackCards.length];
    const title = project.title || fallback.title;

    return {
      title,
      description: project.description || fallback.description,
      imageSrc: getProjectImage(project) || fallback.imageSrc,
      imageAlt: project.title || fallback.imageAlt,
      href: getProjectDetailHref(category, title),
      year: index === 0 ? "2026" : "2025",
      tags: getProjectTags(project, category, fallback.tags),
      project,
    };
  });
};

const getProjectMedia = (
  entry: ProjectEntry,
  category: PortfolioCategory
): MediaItem[] => {
  const { project } = entry;

  if (category === "Video Edit") {
    const rawVideoUrls = getUniqueValues([
      ...(project?.videoUrls || []),
      project?.videoUrl || "",
      project?.designLink || "",
    ]);
    const videoItems = rawVideoUrls
      .map((url, index): MediaItem | null => {
        const youtubeUrl = getYoutubeEmbedUrl(url);
        if (youtubeUrl) {
          return {
            label: `Video ${String(index + 1).padStart(2, "0")}`,
            url: youtubeUrl,
            type: "youtube",
          };
        }

        if (isVideoUrl(url)) {
          return {
            label: `Video ${String(index + 1).padStart(2, "0")}`,
            url,
            type: "video",
          };
        }

        return null;
      })
      .filter((item): item is MediaItem => item !== null);

    if (videoItems.length > 0) return videoItems;

    return [
      {
        label: "Video 01",
        url: entry.imageSrc,
        type: "placeholder",
      },
    ];
  }

  const rawImages = getUniqueValues([
    project?.details?.heroImage || "",
    ...(project?.details?.galleryImages || []),
    project?.image || "",
    isImageUrl(project?.designLink || "") ? project?.designLink || "" : "",
    entry.imageSrc,
  ]);

  const imageItems = rawImages
    .filter(isImageUrl)
    .map((url, index) => ({
      label: index === 0 ? "Hero Frame" : `Frame ${String(index + 1).padStart(2, "0")}`,
      url,
      type: "image" as const,
    }));

  return imageItems.length > 0
    ? imageItems
    : [
        {
          label: "Hero Frame",
          url: entry.imageSrc,
          type: "image",
        },
      ];
};

function ProjectMediaBlock({ item, index = 0 }: { item: MediaItem; index?: number }) {
  return (
    <ScrollReveal delayMs={Math.min(index * 80, 240)}>
    <section className="scroll-mt-28" id={getProjectSlug(item.label)}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">
          {item.label}
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/28">
          1920 x 1080
        </p>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-[18px] border border-white/10 bg-[#0b0c0c] shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
        {item.type === "youtube" ? (
          <iframe
            src={item.url}
            title={item.label}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : item.type === "video" ? (
          <video src={item.url} className="h-full w-full object-cover" controls playsInline />
        ) : (
          <>
            <img src={item.url} alt={item.label} className="h-full w-full object-cover" />
            {item.type === "placeholder" ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/38">
                <div className="rounded-full border border-white/16 bg-black/42 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/76 backdrop-blur-md">
                  Add YouTube link in Studio
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
    </ScrollReveal>
  );
}

export default function PortfolioProjectDetailPage({
  category,
  slug,
}: {
  category: PortfolioCategory;
  slug: string;
}) {
  const [projectsByCategory, setProjectsByCategory] =
    useState<PortfolioProjects>(EMPTY_PROJECTS);
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
      if (localContentTimer) clearTimeout(localContentTimer);
    };
  }, []);

  const entries = useMemo(
    () => getProjectEntries(projectsByCategory, category),
    [category, projectsByCategory]
  );
  const entry = entries.find((item) => getProjectSlug(item.title) === slug) || entries[0];
  const mediaItems = useMemo(
    () => (entry ? getProjectMedia(entry, category) : []),
    [category, entry]
  );
  const featureCards = featureSets[category];
  const externalHref = entry?.project ? getProjectExternalHref(entry.project) : "";
  const clientLabel =
    entry?.project?.videoParentLabel?.trim() ||
    entry?.project?.details?.title?.trim() ||
    entry?.title ||
    config.label;
  const tools = entry?.tags?.slice(0, 5).join(", ") || config.fallbackTags.join(", ");

  if (!entry) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#050706] text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-[-18rem] h-[42rem] w-[82rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.18)_0%,rgba(35,117,255,0.075)_38%,transparent_72%)] blur-3xl" />
          <div className="absolute left-[-18rem] top-[24rem] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(64,167,255,0.15)_0%,rgba(64,167,255,0.05)_36%,transparent_72%)] blur-3xl" />
        </div>
        <SiteHeader activeSection="portfolio" />
        <section className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8fdcff]">
            Project not found
          </p>
          <h1 className="mt-4 text-4xl font-semibold">This project is not available.</h1>
          <Link
            href={CATEGORY_PATHS[category]}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white/74 transition hover:border-[#8fdcff]/40 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {config.label}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050706] text-white">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute left-1/2 top-[-18rem] h-[42rem] w-[82rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.18)_0%,rgba(35,117,255,0.075)_38%,transparent_72%)] blur-3xl" />
        <div className="absolute left-[-18rem] top-[24rem] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(64,167,255,0.15)_0%,rgba(64,167,255,0.05)_36%,transparent_72%)] blur-3xl" />
        <div className="absolute right-[-16rem] bottom-[-12rem] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(143,220,255,0.16)_0%,rgba(84,184,255,0.055)_38%,transparent_74%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(84,184,255,0.08),transparent_48%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,16,28,0.2)_0%,rgba(5,7,6,0.54)_48%,rgba(5,7,6,0.86)_100%)]" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute left-1/2 top-24 h-72 w-[64rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.12)_0%,rgba(84,184,255,0.04)_38%,transparent_74%)] blur-3xl" />
        <div className="absolute left-[-10%] top-[34rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(47,125,255,0.12)_0%,transparent_72%)] blur-3xl" />
        <div className="absolute right-[-12rem] top-[62rem] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.14)_0%,rgba(84,184,255,0.045)_38%,transparent_74%)] blur-3xl" />
        <div className="absolute left-[-14rem] top-[104rem] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(47,125,255,0.16)_0%,rgba(47,125,255,0.05)_36%,transparent_72%)] blur-3xl" />
        <div className="absolute right-[8%] top-[150rem] h-[32rem] w-[46rem] rounded-full bg-[radial-gradient(circle,rgba(143,220,255,0.11)_0%,rgba(84,184,255,0.04)_42%,transparent_74%)] blur-3xl" />
      </div>
      <div className="relative z-[1000]">
        <SiteHeader activeSection="portfolio" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-[96rem] px-5 pb-24 pt-28 sm:px-8 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-16 h-[26rem] w-[72rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.16)_0%,rgba(84,184,255,0.055)_38%,transparent_74%)] blur-3xl" />
          <div className="absolute left-[-10%] top-[34rem] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(47,125,255,0.16)_0%,transparent_72%)] blur-3xl" />
        </div>

        <div className="relative z-10 grid gap-12 lg:grid-cols-[18rem_minmax(0,1fr)] xl:gap-16">
          <ScrollReveal className="lg:sticky lg:top-28 lg:self-start" y={18}>
          <aside>
            <Link
              href={CATEGORY_PATHS[category]}
              className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/46 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#8fdcff]/70 transition-transform group-hover:-translate-x-0.5" />
              Back to {config.label}
            </Link>

            <p className="mt-9 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8fdcff]">
              {config.label} - {entry.year}
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[0.95] tracking-[-0.06em] text-white">
              {entry.title}
            </h1>
            <p className="mt-6 text-sm leading-7 text-white/50">{entry.description}</p>

            <dl className="mt-9 space-y-4 border-b border-t border-white/10 py-7 text-sm">
              <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/34">
                  Role
                </dt>
                <dd className="font-semibold text-white/78">{roleByCategory[category]}</dd>
              </div>
              <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/34">
                  Client
                </dt>
                <dd className="font-semibold text-white/78">{clientLabel}</dd>
              </div>
              <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/34">
                  Tools
                </dt>
                <dd className="font-semibold leading-6 text-white/78">{tools}</dd>
              </div>
            </dl>

            <div className="mt-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/34">
                Pages
              </p>
              <nav className="mt-5 space-y-4">
                {mediaItems.map((item, index) => (
                  <a
                    key={`${item.label}-${item.url}`}
                    href={`#${getProjectSlug(item.label)}`}
                    className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 text-sm font-semibold text-white/42 transition-colors hover:text-white"
                  >
                    <span className={index === 0 ? "text-[#8fdcff]" : "text-white/30"}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>

            {externalHref ? (
              <a
                href={externalHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#8fdcff]/24 bg-[#8fdcff]/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#dff8ff] transition hover:border-[#8fdcff]/44 hover:bg-[#8fdcff]/[0.1]"
              >
                Source
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </aside>
          </ScrollReveal>

          <article>
            <ScrollReveal y={18} delayMs={80}>
              <h2 className="max-w-5xl text-5xl font-bold leading-[0.98] tracking-[-0.06em] text-white md:text-7xl">
                {entry.project?.details?.title?.trim() || overviewByCategory[category]}
              </h2>

              <div className="mt-8 grid max-w-4xl gap-5 text-lg leading-8 text-white/76">
                <p>
                  {entry.project?.details?.description?.trim() ||
                    `${entry.title} is presented as a focused case page with the core work, project framing, and final media laid out for a closer look.`}
                </p>
                <p className="text-white/62">
                  {overviewByCategory[category]}
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {featureCards.map((feature, index) => (
                <ScrollReveal key={feature.title} delayMs={120 + index * 60}>
                  <div
                    className="rounded-[14px] border border-white/10 bg-white/[0.025] p-6 transition-colors hover:border-[#8fdcff]/24 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start gap-4">
                      <span className="pt-1 text-[11px] font-semibold text-[#8fdcff]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold tracking-[-0.04em] text-white">
                          {feature.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-white/52">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <div className="mt-14 space-y-14">
              {mediaItems.map((item, index) => (
                <ProjectMediaBlock key={`${item.label}-${item.url}`} item={item} index={index} />
              ))}
            </div>

            <div className="mt-16 flex flex-wrap gap-3">
              <Link
                href={CATEGORY_PATHS[category]}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white/70 transition hover:border-[#8fdcff]/32 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                More {config.label}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#76e1ff,#4a8fff)] px-5 py-3 text-sm font-bold text-[#04111b] shadow-[0_16px_34px_rgba(84,184,255,0.22)] transition hover:-translate-y-0.5"
              >
                <Play className="h-4 w-4" />
                Start a project
              </Link>
            </div>
          </article>
        </div>
      </section>

      <HomeScrollRevealSection />
    </main>
  );
}

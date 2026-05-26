"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Cloud,
  Database,
  Gauge,
  HardDrive,
  Image as ImageIcon,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";

import {
  defaultExperienceEntries,
  defaultHomeContent,
  defaultPortfolioProjects,
  defaultTestimonials,
  EXPERIENCE_CONTENT_UPDATED_AT_KEY,
  EXPERIENCE_STORAGE_KEY,
  EXPERIENCE_UPDATED_EVENT,
  fetchPublicPortfolioConfig,
  fetchPortfolioContentFromSupabase,
  HOME_CONTENT_STORAGE_KEY,
  HOME_CONTENT_UPDATED_AT_KEY,
  HOME_CONTENT_UPDATED_EVENT,
  normalizeExperienceEntries,
  normalizeHomeContent,
  normalizeTestimonials,
  parseExperienceEntries,
  parseHomeContent,
  PORTFOLIO_CONTENT_UPDATED_AT_KEY,
  PORTFOLIO_STORAGE_KEY,
  PORTFOLIO_UPDATED_EVENT,
  savePortfolioContentToSupabase,
  sanitizeExperienceImage,
  TESTIMONIALS_STORAGE_KEY,
  TESTIMONIALS_UPDATED_EVENT,
  uploadPortfolioAssetToCloudinary,
  type CreativeExperienceEntry,
  type FeaturedProjectIcon,
  type HomeAboutAccordionItem,
  type HomeContent,
  type HomeCreativeLane,
  type HomeExperienceCard,
  type HomeFeaturedProject,
  type PortfolioCategory,
  type PortfolioProject,
  type PortfolioProjects,
  type Testimonial,
} from "@/lib/portfolio-data";

type StudioTab =
  | "dashboard"
  | "home"
  | "about"
  | "lanes"
  | "experience"
  | "portfolio"
  | "stories";
type VideoAspectRatio = "landscape" | "portrait";
type ConnectionState = "checking" | "connected" | "missing" | "error";
type StudioHealthStatus = "healthy" | "attention" | "limited" | "missing" | "error" | "checking";

type UsageMetric = {
  usage?: number;
  limit?: number;
  used_percent?: number;
};

type StudioHealth = {
  checkedAt?: string;
  cloudinary?: {
    configured?: boolean;
    status?: StudioHealthStatus;
    detail?: string;
    storage?: UsageMetric | null;
    bandwidth?: UsageMetric | null;
    credits?: UsageMetric | null;
    objects?: UsageMetric | null;
  };
  supabase?: {
    configured?: boolean;
    status?: StudioHealthStatus;
    detail?: string;
    bucket?: string;
    contentBytes?: number;
    updatedAt?: string | null;
  };
  website?: {
    status?: "healthy" | "attention";
  };
};

const STUDIO_AUTH_KEY = "portfolio-studio-auth";
const DEFAULT_STUDIO_EMAIL = "aiakosedt@gmail.com";
const DEFAULT_STUDIO_PASSWORD = "Wence_dante24";

const emptyProjects: PortfolioProjects = defaultPortfolioProjects;

const categories: Array<{
  key: PortfolioCategory;
  label: string;
  note: string;
}> = [
  {
    key: "Video Edit",
    label: "Video Editing",
    note: "Card image, YouTube or MP4 links, clip thumbnails, and detail text.",
  },
  {
    key: "Graphic Design",
    label: "Graphic Design",
    note: "Card image plus 1920x1080 detail frames.",
  },
  {
    key: "Websites",
    label: "Web Development",
    note: "Card image plus 1920x1080 website frames.",
  },
];

const iconOptions: FeaturedProjectIcon[] = [
  "clapperboard",
  "monitor-play",
  "film",
  "layers",
  "sparkles",
];

const isVideoCategory = (category: PortfolioCategory) => category === "Video Edit";

const defaultProjectImages: Record<PortfolioCategory, string> = {
  "Graphic Design": "/comradz.png",
  "Video Edit": "/v2.png",
  Websites:
    "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1200&q=80",
};

const defaultProjectTags: Record<PortfolioCategory, string[]> = {
  "Graphic Design": ["Adobe Photoshop", "Adobe Illustrator", "Canva", "Figma"],
  "Video Edit": ["Adobe Premiere Pro", "After Effects", "CapCut"],
  Websites: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
};

const parseTagInput = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const estimateByteSize = (value: unknown) =>
  new Blob([JSON.stringify(value ?? null)]).size;

const formatBytes = (bytes?: number | null) => {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) return "Unavailable";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size >= 10 ? size.toFixed(1) : size.toFixed(2)} ${units[unitIndex]}`;
};

const formatUsageMetric = (metric?: UsageMetric | null) => {
  if (!metric) return "Unavailable";
  const hasUsage = typeof metric.usage === "number";
  const hasLimit = typeof metric.limit === "number" && metric.limit > 0;
  if (hasUsage && hasLimit) {
    return `${formatBytes(metric.usage)} / ${formatBytes(metric.limit)}`;
  }
  if (hasUsage) return formatBytes(metric.usage);
  if (typeof metric.used_percent === "number") return `${metric.used_percent.toFixed(1)}% used`;
  return "Unavailable";
};

const getUsageTone = (percent?: number) => {
  if (typeof percent !== "number") return "neutral";
  if (percent >= 90) return "danger";
  if (percent >= 75) return "warn";
  return "healthy";
};

const getMetricPercent = (metric?: UsageMetric | null) => {
  if (!metric) return undefined;
  if (typeof metric.used_percent === "number") return metric.used_percent;
  if (
    typeof metric.usage === "number" &&
    typeof metric.limit === "number" &&
    metric.limit > 0
  ) {
    return (metric.usage / metric.limit) * 100;
  }
  return undefined;
};

const getProjectTotals = (projects: PortfolioProjects) =>
  categories.reduce(
    (totals, category) => ({
      ...totals,
      [category.key]: projects[category.key]?.length || 0,
      all: totals.all + (projects[category.key]?.length || 0),
    }),
    {
      all: 0,
      "Video Edit": 0,
      "Graphic Design": 0,
      Websites: 0,
    } as Record<PortfolioCategory | "all", number>
  );

const cleanStringList = (items: string[] | undefined) =>
  Array.from(new Set((items || []).map((item) => item.trim()).filter(Boolean)));

const optimizeProjects = (projects: PortfolioProjects): PortfolioProjects => ({
  "Graphic Design": (projects["Graphic Design"] || []).map((project) => ({
    ...project,
    title: project.title.trim(),
    description: project.description.trim(),
    image: project.image.trim(),
    designLink: project.designLink.trim(),
    tags: cleanStringList(project.tags),
    details: project.details
      ? {
          ...project.details,
          title: project.details.title.trim(),
          description: project.details.description.trim(),
          heroImage: project.details.heroImage.trim(),
          galleryImages: cleanStringList(project.details.galleryImages),
        }
      : project.details,
  })),
  "Video Edit": (projects["Video Edit"] || []).map((project) => ({
    ...project,
    title: project.title.trim(),
    description: project.description.trim(),
    image: project.image.trim(),
    designLink: project.designLink.trim(),
    videoCategory: project.videoCategory?.trim() || "",
    videoParentLabel: project.videoParentLabel?.trim() || "",
    videoUrl: project.videoUrl?.trim() || "",
    videoUrls: cleanStringList(project.videoUrls),
    videoPosterUrls: cleanStringList(project.videoPosterUrls),
    tags: cleanStringList(project.tags),
  })),
  Websites: (projects.Websites || []).map((project) => ({
    ...project,
    title: project.title.trim(),
    description: project.description.trim(),
    image: project.image.trim(),
    designLink: project.designLink.trim(),
    tags: cleanStringList(project.tags),
    details: project.details
      ? {
          ...project.details,
          title: project.details.title.trim(),
          description: project.details.description.trim(),
          heroImage: project.details.heroImage.trim(),
          galleryImages: cleanStringList(project.details.galleryImages),
        }
      : project.details,
  })),
});

const normalizeProjects = (value: unknown): PortfolioProjects => {
  if (!value || typeof value !== "object") return emptyProjects;
  const raw = value as Record<string, unknown>;

  return {
    "Graphic Design": Array.isArray(raw["Graphic Design"])
      ? (raw["Graphic Design"] as PortfolioProject[])
      : emptyProjects["Graphic Design"],
    "Video Edit": Array.isArray(raw["Video Edit"])
      ? (raw["Video Edit"] as PortfolioProject[])
      : emptyProjects["Video Edit"],
    Websites: Array.isArray(raw.Websites)
      ? (raw.Websites as PortfolioProject[])
      : emptyProjects.Websites,
  };
};

const getInitialProjects = (): PortfolioProjects => {
  if (typeof window === "undefined") return emptyProjects;

  try {
    const raw = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    return raw ? normalizeProjects(JSON.parse(raw)) : emptyProjects;
  } catch {
    return emptyProjects;
  }
};

const getInitialHomeContent = (): HomeContent => {
  if (typeof window === "undefined") return defaultHomeContent;

  try {
    const raw = window.localStorage.getItem(HOME_CONTENT_STORAGE_KEY);
    return raw ? parseHomeContent(raw) : defaultHomeContent;
  } catch {
    return defaultHomeContent;
  }
};

const getInitialExperienceEntries = (): CreativeExperienceEntry[] => {
  if (typeof window === "undefined") return defaultExperienceEntries;

  try {
    const raw = window.localStorage.getItem(EXPERIENCE_STORAGE_KEY);
    return raw ? parseExperienceEntries(raw) : defaultExperienceEntries;
  } catch {
    return defaultExperienceEntries;
  }
};

const getInitialTestimonials = (): Testimonial[] => {
  if (typeof window === "undefined") return defaultTestimonials;

  try {
    const raw = window.localStorage.getItem(TESTIMONIALS_STORAGE_KEY);
    return raw ? normalizeTestimonials(JSON.parse(raw)) : defaultTestimonials;
  } catch {
    return defaultTestimonials;
  }
};

const createProject = (category: PortfolioCategory): PortfolioProject => {
  if (category === "Video Edit") {
    return {
      title: "New Video Project",
      description: "Describe the edit, style, pacing, and result.",
      image: defaultProjectImages["Video Edit"],
      designLink: "#",
      videoCategory: "short-form",
      videoParentLabel: "Client project",
      videoAspectRatio: "landscape",
      videoUrls: [""],
      videoPosterUrls: [defaultProjectImages["Video Edit"]],
      tags: defaultProjectTags["Video Edit"],
      showDetailsModal: false,
    };
  }

  const title = category === "Graphic Design" ? "New Design Project" : "New Web Project";
  const defaultImage = defaultProjectImages[category];

  return {
    title,
    description: "Describe the project, visual direction, and final delivery.",
    image: defaultImage,
    designLink: "#",
    tags: defaultProjectTags[category],
    showDetailsModal: true,
    details: {
      title,
      description: "Add the case-study introduction shown on the project page.",
      heroImage: defaultImage,
      galleryImages: [defaultImage],
    },
  };
};

const createExperienceEntry = (): CreativeExperienceEntry => ({
  role: "Video Editing Experience",
  client: "Client name",
  period: "2026",
  summary: "Describe the client story or result.",
  tags: ["Premiere Pro", "After Effects"],
  image: "",
});

const createFeaturedProject = (): HomeFeaturedProject => ({
  title: "Featured Project",
  description: "Short description for the featured project frame.",
  image: "",
  icon: "sparkles",
});

const createAboutItem = (): HomeAboutAccordionItem => ({
  title: "New Panel",
  imageUrl: "",
});

const createCreativeLane = (): HomeCreativeLane => ({
  value: "video-editing",
  label: "New Lane",
  badge: "Creative Lane",
  title: "A sharp lane title.",
  description: "Describe what this service lane offers.",
  buttonText: "View Work",
  buttonHref: "/portfolio/video-editing",
  imageSrc: "",
  imageAlt: "Creative lane image",
});

const createExperienceCard = (): HomeExperienceCard => ({
  quote: "Describe the experience, workflow, or result.",
  name: "Experience lane",
  role: "Tools / Role",
  image: "",
});

const splitTags = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const moveItem = <T,>(items: T[], index: number, direction: -1 | 1) => {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(nextIndex, 0, item);
  return nextItems;
};

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8fdcff]/72">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-1.5 text-xs leading-relaxed text-white/38">{hint}</p> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#8fdcff]/46";

const textareaClass =
  "min-h-[96px] w-full rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2.5 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#8fdcff]/46";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className || ""}`} />;
}

function ToolBadgesInput({
  tags,
  placeholder,
  onChange,
}: {
  tags: string[];
  placeholder?: string;
  onChange: (tags: string[]) => void;
}) {
  const normalizedValue = tags.join(", ");
  const [draftValue, setDraftValue] = useState(normalizedValue);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDraftValue(normalizedValue);
    }
  }, [isFocused, normalizedValue]);

  return (
    <TextInput
      value={draftValue}
      placeholder={placeholder}
      onFocus={() => setIsFocused(true)}
      onChange={(event) => {
        const nextValue = event.target.value;
        setDraftValue(nextValue);
        onChange(parseTagInput(nextValue));
      }}
      onBlur={(event) => {
        setIsFocused(false);
        setDraftValue(parseTagInput(event.target.value).join(", "));
      }}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${textareaClass} ${props.className || ""}`} />;
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className || ""}`} />;
}

function SectionCard({
  title,
  eyebrow,
  children,
  action,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(84,184,255,0.1),transparent_34%)]" />
      <div className="relative z-10 mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8fdcff]/70">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function SaveButton({
  children = "Save",
  onClick,
}: {
  children?: React.ReactNode;
  onClick: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#76e1ff,#4a8fff)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#04111b] shadow-[0_14px_30px_rgba(84,184,255,0.22)] transition hover:-translate-y-0.5"
    >
      <Save className="h-4 w-4" />
      {children}
    </button>
  );
}

function ConnectionBadge({
  label,
  detail,
  state,
  icon,
}: {
  label: string;
  detail: string;
  state: ConnectionState;
  icon: React.ReactNode;
}) {
  const stateClass =
    state === "connected"
      ? "border-[#8ef0d2]/24 bg-[#8ef0d2]/[0.075] text-[#c9ffe9]"
      : state === "checking"
        ? "border-[#8fdcff]/18 bg-[#8fdcff]/[0.055] text-[#ccefff]"
        : "border-[#ff8fa3]/28 bg-[#ff8fa3]/[0.08] text-[#ffd1d8]";
  const dotClass =
    state === "connected"
      ? "bg-[#8ef0d2]"
      : state === "checking"
        ? "animate-pulse bg-[#8fdcff]"
        : "bg-[#ff8fa3]";
  const statusLabel =
    state === "connected" ? "Connected" : state === "checking" ? "Checking" : "Not connected";

  return (
    <div
      className={`inline-flex min-w-0 items-center gap-3 rounded-2xl border px-3.5 py-2 ${stateClass}`}
    >
      <span className="shrink-0 text-current/82">{icon}</span>
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em]">
          {label} · {statusLabel}
        </span>
        <span className="block truncate text-xs text-current/68">{detail}</span>
      </span>
    </div>
  );
}

function HealthCard({
  label,
  value,
  detail,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "healthy" | "warn" | "danger" | "neutral";
  icon: React.ReactNode;
}) {
  const toneClass =
    tone === "healthy"
      ? "border-[#8ef0d2]/18 bg-[#8ef0d2]/[0.055]"
      : tone === "warn"
        ? "border-[#ffd166]/22 bg-[#ffd166]/[0.065]"
        : tone === "danger"
          ? "border-[#ff8fa3]/24 bg-[#ff8fa3]/[0.07]"
          : "border-white/10 bg-white/[0.035]";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-[#8fdcff]">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">
            {label}
          </p>
          <p className="mt-1 truncate text-lg font-semibold text-white">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/54">{detail}</p>
    </div>
  );
}

function EditorTabs({
  items,
  activeIndex,
  onChange,
  emptyLabel,
}: {
  items: Array<{ label: string; title: string }>;
  activeIndex: number;
  onChange: (index: number) => void;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-white/46">
        {emptyLabel || "No items yet."}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/18 p-2">
      {items.map((item, index) => (
        <button
          key={`${item.label}-${index}`}
          type="button"
          onClick={() => onChange(index)}
          className={`shrink-0 rounded-xl border px-4 py-3 text-left transition ${
            activeIndex === index
              ? "border-[#8fdcff]/40 bg-[#8fdcff]/[0.12] text-white"
              : "border-white/10 bg-white/[0.035] text-white/58 hover:border-white/20 hover:text-white"
          }`}
        >
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-current/54">
            {item.label}
          </span>
          <span className="mt-1 block max-w-[12rem] truncate text-sm font-semibold">
            {item.title}
          </span>
        </button>
      ))}
    </div>
  );
}

function UploadField({
  label,
  value,
  onChange,
  onUploaded,
  kind,
  folder,
  hint,
  placeholder,
  uploadLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUploaded?: (value: string) => void | Promise<void>;
  kind: "image" | "video";
  folder: string;
  hint?: string;
  placeholder?: string;
  uploadLabel?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<number | null>(null);

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setUploading(true);
    setProgress(0);

    try {
      const asset = await uploadPortfolioAssetToCloudinary(file, folder, {
        onProgress: ({ bytesUploaded, totalBytes }) => {
          setProgress(Math.round((bytesUploaded / totalBytes) * 100));
        },
      });
      if (onUploaded) {
        await onUploaded(asset.url);
      } else {
        onChange(asset.url);
      }
      setProgress(100);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed. Paste a URL instead."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Field label={label} hint={hint}>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <TextInput
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            placeholder ||
            (kind === "image"
              ? "Image URL or /file.png"
              : "YouTube link, Cloudinary video URL, or MP4 URL")
          }
        />
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8fdcff]/22 bg-[#8fdcff]/[0.06] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#dff8ff] transition hover:border-[#8fdcff]/40 hover:bg-[#8fdcff]/[0.1]">
          <UploadCloud className="h-4 w-4" />
          {uploading ? "Uploading" : uploadLabel || "Upload"}
          <input
            type="file"
            accept={kind === "image" ? "image/*" : "video/*"}
            className="hidden"
            onChange={(event) => {
              void handleUpload(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>
      {progress !== null ? (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#8fdcff] transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
      {error ? <p className="mt-2 text-xs leading-relaxed text-[#ffb7c0]">{error}</p> : null}
      {kind === "image" && value ? (
        <div className="mt-3 aspect-video max-w-sm overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <img src={value} alt={label} className="h-full w-full object-cover" />
        </div>
      ) : null}
    </Field>
  );
}

function RowActions({
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!onMoveUp}
        className="rounded-full border border-white/10 p-2 text-white/54 transition hover:border-white/20 hover:text-white disabled:opacity-30"
        aria-label="Move up"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!onMoveDown}
        className="rounded-full border border-white/10 p-2 text-white/54 transition hover:border-white/20 hover:text-white disabled:opacity-30"
        aria-label="Move down"
      >
        <ArrowDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full border border-[#ffb7c0]/16 p-2 text-[#ffb7c0]/72 transition hover:border-[#ffb7c0]/32 hover:text-[#ffccd2]"
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function StudioPage() {
  const [isAuthed, setIsAuthed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem(STUDIO_AUTH_KEY) === "true"
  );
  const [loginEmail, setLoginEmail] = useState(DEFAULT_STUDIO_EMAIL);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<StudioTab>("dashboard");
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>("Video Edit");
  const [activeFeaturedProjectIndex, setActiveFeaturedProjectIndex] = useState(0);
  const [activeAboutItemIndex, setActiveAboutItemIndex] = useState(0);
  const [activeCreativeLaneIndex, setActiveCreativeLaneIndex] = useState(0);
  const [activeExperienceCardIndex, setActiveExperienceCardIndex] = useState(0);
  const [activeExperienceEntryIndex, setActiveExperienceEntryIndex] = useState(0);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [projects, setProjects] = useState<PortfolioProjects>(getInitialProjects);
  const [homeContent, setHomeContent] = useState<HomeContent>(getInitialHomeContent);
  const [experienceEntries, setExperienceEntries] =
    useState<CreativeExperienceEntry[]>(getInitialExperienceEntries);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(getInitialTestimonials);
  const [statusMessage, setStatusMessage] = useState("");
  const [studioHealth, setStudioHealth] = useState<StudioHealth | null>(null);
  const [isHealthChecking, setIsHealthChecking] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    cloudinary: ConnectionState;
    supabase: ConnectionState;
    cloudinaryDetail: string;
    supabaseDetail: string;
  }>({
    cloudinary: "checking",
    supabase: "checking",
    cloudinaryDetail: "Checking upload config",
    supabaseDetail: "Checking database config",
  });

  const projectsRef = useRef(projects);
  const homeContentRef = useRef(homeContent);
  const experienceEntriesRef = useRef(experienceEntries);
  const testimonialsRef = useRef(testimonials);

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    homeContentRef.current = homeContent;
  }, [homeContent]);

  useEffect(() => {
    experienceEntriesRef.current = experienceEntries;
  }, [experienceEntries]);

  useEffect(() => {
    testimonialsRef.current = testimonials;
  }, [testimonials]);

  const refreshStudioHealth = async () => {
    setIsHealthChecking(true);
    try {
      const response = await fetch("/api/studio/health", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Health check failed.");
      }
      const health = (await response.json()) as StudioHealth;
      setStudioHealth(health);
    } catch (error) {
      setStudioHealth({
        cloudinary: {
          status: "error",
          detail: error instanceof Error ? error.message : "Health check failed.",
        },
        supabase: {
          status: "error",
          detail: "Health check failed.",
        },
        website: {
          status: "attention",
        },
      });
    } finally {
      setIsHealthChecking(false);
    }
  };

  useEffect(() => {
    void refreshStudioHealth();
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const publicConfig = await fetchPublicPortfolioConfig();
      if (cancelled) return;

      setConnectionStatus((current) => ({
        ...current,
        cloudinary: publicConfig?.cloudinaryConfigured ? "connected" : "missing",
        supabase: publicConfig?.supabaseConfigured ? "checking" : "missing",
        cloudinaryDetail: publicConfig?.cloudinaryConfigured
          ? `Connected to ${publicConfig.cloudinaryCloudName}`
          : "Not connected: missing cloud name or upload preset",
        supabaseDetail: publicConfig?.supabaseConfigured
          ? "Checking content table"
          : "Not connected: missing URL or anon key",
      }));

      const remote = await fetchPortfolioContentFromSupabase();
      if (cancelled) return;

      setConnectionStatus((current) => ({
        ...current,
        supabase: remote ? "connected" : publicConfig?.supabaseConfigured ? "error" : "missing",
        supabaseDetail: remote
          ? `Connected to row ${publicConfig?.supabaseContentRowId || "main"}`
          : publicConfig?.supabaseConfigured
            ? "Not connected: content row was not reached"
            : current.supabaseDetail,
      }));

      if (!remote) return;

      if (remote.projects) {
        const normalized = normalizeProjects(remote.projects);
        setProjects(normalized);
        window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(normalized));
      }

      if (remote.homeContent) {
        const normalized = normalizeHomeContent(remote.homeContent);
        setHomeContent(normalized);
        window.localStorage.setItem(HOME_CONTENT_STORAGE_KEY, JSON.stringify(normalized));
      }

      if (remote.experienceEntries) {
        const normalized = normalizeExperienceEntries(remote.experienceEntries);
        setExperienceEntries(normalized);
        window.localStorage.setItem(EXPERIENCE_STORAGE_KEY, JSON.stringify(normalized));
      }

      if (remote.testimonials) {
        const normalized = normalizeTestimonials(remote.testimonials);
        setTestimonials(normalized);
        window.localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(normalized));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentCategoryProjects = projects[activeCategory] || [];
  const selectedFeaturedProjectIndex = Math.min(
    activeFeaturedProjectIndex,
    Math.max(homeContent.featuredProjects.projects.length - 1, 0)
  );
  const selectedAboutItemIndex = Math.min(
    activeAboutItemIndex,
    Math.max(homeContent.aboutAccordion.items.length - 1, 0)
  );
  const selectedCreativeLaneIndex = Math.min(
    activeCreativeLaneIndex,
    Math.max(homeContent.creativeProfile.lanes.length - 1, 0)
  );
  const selectedExperienceCardIndex = Math.min(
    activeExperienceCardIndex,
    Math.max(homeContent.experienceSection.cards.length - 1, 0)
  );
  const selectedExperienceEntryIndex = Math.min(
    activeExperienceEntryIndex,
    Math.max(experienceEntries.length - 1, 0)
  );
  const selectedProjectIndex = Math.min(
    activeProjectIndex,
    Math.max(currentCategoryProjects.length - 1, 0)
  );

  const activeCategoryLabel = useMemo(
    () => categories.find((category) => category.key === activeCategory)?.label || activeCategory,
    [activeCategory]
  );
  const projectTotals = useMemo(() => getProjectTotals(projects), [projects]);
  const localContentBytes = useMemo(
    () =>
      estimateByteSize({
        projects,
        homeContent,
        experienceEntries,
        testimonials,
      }),
    [experienceEntries, homeContent, projects, testimonials]
  );
  const localStoragePercent = Math.min((localContentBytes / (5 * 1024 * 1024)) * 100, 100);
  const cloudinaryStoragePercent = getMetricPercent(studioHealth?.cloudinary?.storage);
  const websiteIsHealthy =
    connectionStatus.cloudinary !== "error" &&
    connectionStatus.supabase !== "error" &&
    studioHealth?.website?.status !== "attention";

  const markStatus = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => {
      setStatusMessage((currentMessage) =>
        currentMessage === message ? "" : currentMessage
      );
    }, 2800);
  };

  const syncToSupabase = async (payload?: {
    nextProjects?: PortfolioProjects;
    nextHomeContent?: HomeContent;
    nextExperienceEntries?: CreativeExperienceEntry[];
    nextTestimonials?: Testimonial[];
  }) => {
    const saved = await savePortfolioContentToSupabase({
      projects: payload?.nextProjects || projectsRef.current,
      testimonials: payload?.nextTestimonials || testimonialsRef.current,
      experienceEntries: payload?.nextExperienceEntries || experienceEntriesRef.current,
      homeContent: payload?.nextHomeContent || homeContentRef.current,
    });

    markStatus(
      saved
        ? "Saved and synced."
        : "Saved locally. Supabase sync failed or is not configured."
    );
  };

  const persistHomeContent = async (nextHomeContent: HomeContent) => {
    const normalized = normalizeHomeContent(nextHomeContent);
    const updatedAt = new Date().toISOString();
    setHomeContent(normalized);
    homeContentRef.current = normalized;
    window.localStorage.setItem(HOME_CONTENT_STORAGE_KEY, JSON.stringify(normalized));
    window.localStorage.setItem(HOME_CONTENT_UPDATED_AT_KEY, updatedAt);
    window.dispatchEvent(new Event(HOME_CONTENT_UPDATED_EVENT));
    await syncToSupabase({ nextHomeContent: normalized });
  };

  const persistProjects = async (nextProjects: PortfolioProjects) => {
    const updatedAt = new Date().toISOString();
    setProjects(nextProjects);
    projectsRef.current = nextProjects;
    window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(nextProjects));
    window.localStorage.setItem(PORTFOLIO_CONTENT_UPDATED_AT_KEY, updatedAt);
    window.dispatchEvent(new Event(PORTFOLIO_UPDATED_EVENT));
    await syncToSupabase({ nextProjects });
  };

  const optimizeWebsite = async () => {
    setIsOptimizing(true);
    try {
      const optimizedProjects = optimizeProjects(projectsRef.current);
      const optimizedHomeContent = normalizeHomeContent(homeContentRef.current);
      const optimizedExperienceEntries = normalizeExperienceEntries(
        experienceEntriesRef.current.map((entry) => ({
          ...entry,
          role: entry.role.trim(),
          client: entry.client.trim(),
          period: entry.period.trim(),
          summary: entry.summary.trim(),
          tags: cleanStringList(entry.tags),
          image: sanitizeExperienceImage(entry.image),
        }))
      );
      const optimizedTestimonials = normalizeTestimonials(testimonialsRef.current);
      const updatedAt = new Date().toISOString();

      setProjects(optimizedProjects);
      projectsRef.current = optimizedProjects;
      window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(optimizedProjects));
      window.localStorage.setItem(PORTFOLIO_CONTENT_UPDATED_AT_KEY, updatedAt);
      window.dispatchEvent(new Event(PORTFOLIO_UPDATED_EVENT));

      setHomeContent(optimizedHomeContent);
      homeContentRef.current = optimizedHomeContent;
      window.localStorage.setItem(HOME_CONTENT_STORAGE_KEY, JSON.stringify(optimizedHomeContent));
      window.localStorage.setItem(HOME_CONTENT_UPDATED_AT_KEY, updatedAt);
      window.dispatchEvent(new Event(HOME_CONTENT_UPDATED_EVENT));

      setExperienceEntries(optimizedExperienceEntries);
      experienceEntriesRef.current = optimizedExperienceEntries;
      window.localStorage.setItem(EXPERIENCE_STORAGE_KEY, JSON.stringify(optimizedExperienceEntries));
      window.localStorage.setItem(EXPERIENCE_CONTENT_UPDATED_AT_KEY, updatedAt);
      window.dispatchEvent(new Event(EXPERIENCE_UPDATED_EVENT));

      setTestimonials(optimizedTestimonials);
      testimonialsRef.current = optimizedTestimonials;
      window.localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(optimizedTestimonials));
      window.dispatchEvent(new Event(TESTIMONIALS_UPDATED_EVENT));

      await syncToSupabase({
        nextProjects: optimizedProjects,
        nextHomeContent: optimizedHomeContent,
        nextExperienceEntries: optimizedExperienceEntries,
        nextTestimonials: optimizedTestimonials,
      });
      await refreshStudioHealth();
      markStatus("Website data optimized.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const persistExperienceEntries = async (nextEntries: CreativeExperienceEntry[]) => {
    const sanitized = nextEntries.map((entry) => ({
      ...entry,
      image: sanitizeExperienceImage(entry.image),
    }));
    const updatedAt = new Date().toISOString();
    setExperienceEntries(sanitized);
    experienceEntriesRef.current = sanitized;
    window.localStorage.setItem(EXPERIENCE_STORAGE_KEY, JSON.stringify(sanitized));
    window.localStorage.setItem(EXPERIENCE_CONTENT_UPDATED_AT_KEY, updatedAt);
    window.dispatchEvent(new Event(EXPERIENCE_UPDATED_EVENT));
    await syncToSupabase({ nextExperienceEntries: sanitized });
  };

  const persistHomeUpload = async (updater: (current: HomeContent) => HomeContent) => {
    await persistHomeContent(updater(homeContentRef.current));
  };

  const persistProjectUploadAt = async (
    index: number,
    updater: (project: PortfolioProject) => PortfolioProject
  ) => {
    const currentProjects = projectsRef.current;
    const categoryProjects = currentProjects[activeCategory] || [];
    const nextProjects = {
      ...currentProjects,
      [activeCategory]: categoryProjects.map((project, projectIndex) =>
        projectIndex === index ? updater(project) : project
      ),
    };

    await persistProjects(nextProjects);
  };

  const persistProjectDetailsUpload = async (
    index: number,
    updater: (
      details: NonNullable<PortfolioProject["details"]>
    ) => NonNullable<PortfolioProject["details"]>
  ) => {
    await persistProjectUploadAt(index, (project) => {
      const currentDetails = project.details || {
        title: project.title,
        description: project.description,
        heroImage: project.image,
        galleryImages: [project.image].filter(Boolean),
      };

      return {
        ...project,
        showDetailsModal: true,
        details: updater(currentDetails),
      };
    });
  };

  const persistExperienceUpload = async (
    updater: (current: CreativeExperienceEntry[]) => CreativeExperienceEntry[]
  ) => {
    await persistExperienceEntries(updater(experienceEntriesRef.current));
  };

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loginEmail.trim() !== DEFAULT_STUDIO_EMAIL || loginPassword !== DEFAULT_STUDIO_PASSWORD) {
      setLoginError("Use the Studio email and password.");
      return;
    }
    window.localStorage.setItem(STUDIO_AUTH_KEY, "true");
    setIsAuthed(true);
    setLoginError("");
  };

  const handleLogout = () => {
    window.localStorage.removeItem(STUDIO_AUTH_KEY);
    setIsAuthed(false);
  };

  const updateHome = (updater: (draft: HomeContent) => HomeContent) => {
    setHomeContent((current) => updater(current));
  };

  const updateProjects = (updater: (draft: PortfolioProjects) => PortfolioProjects) => {
    setProjects((current) => updater(current));
  };

  const updateProjectAt = (
    index: number,
    updater: (project: PortfolioProject) => PortfolioProject
  ) => {
    updateProjects((current) => ({
      ...current,
      [activeCategory]: (current[activeCategory] || []).map((project, projectIndex) =>
        projectIndex === index ? updater(project) : project
      ),
    }));
  };

  const updateProjectDetails = (
    index: number,
    updater: (details: NonNullable<PortfolioProject["details"]>) => NonNullable<PortfolioProject["details"]>
  ) => {
    updateProjectAt(index, (project) => {
      const currentDetails = project.details || {
        title: project.title,
        description: project.description,
        heroImage: project.image,
        galleryImages: [project.image].filter(Boolean),
      };

      return {
        ...project,
        showDetailsModal: true,
        details: updater(currentDetails),
      };
    });
  };

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050914] px-5 text-white">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8fdcff]">
            Portfolio Studio
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
            Edit the whole site.
          </h1>
          <div className="mt-6 space-y-4">
            <Field label="Email">
              <TextInput
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
              />
            </Field>
            <Field label="Password">
              <TextInput
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Studio password"
              />
            </Field>
          </div>
          {loginError ? <p className="mt-4 text-sm text-[#ffb7c0]">{loginError}</p> : null}
          <button
            type="submit"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#76e1ff,#4a8fff)] text-sm font-bold text-[#04111b]"
          >
            Open Studio
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#040914] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(25,91,255,0.24),transparent_32%),radial-gradient(circle_at_88%_4%,rgba(84,184,255,0.2),transparent_28%),linear-gradient(180deg,#06111f_0%,#040914_58%,#03060c_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(143,220,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(143,220,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#040914]/82 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[92rem] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/46 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
              Portfolio Studio
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {statusMessage ? (
              <p className="rounded-full border border-[#8fdcff]/18 bg-[#8fdcff]/[0.06] px-4 py-2 text-xs font-semibold text-[#ccefff]">
                {statusMessage}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => syncToSupabase()}
              className="inline-flex items-center gap-2 rounded-full border border-[#8fdcff]/24 bg-[#8fdcff]/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#dff8ff] transition hover:border-[#8fdcff]/44 hover:bg-[#8fdcff]/[0.12]"
            >
              <Save className="h-4 w-4" />
              Sync all to Supabase
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/62 transition hover:border-white/22 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
        <div className="mx-auto mt-4 flex max-w-[92rem] flex-col gap-2 sm:flex-row sm:flex-wrap">
          <ConnectionBadge
            label="Cloudinary"
            detail={connectionStatus.cloudinaryDetail}
            state={connectionStatus.cloudinary}
            icon={<Cloud className="h-4 w-4" />}
          />
          <ConnectionBadge
            label="Supabase"
            detail={connectionStatus.supabaseDetail}
            state={connectionStatus.supabase}
            icon={<Database className="h-4 w-4" />}
          />
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-[92rem] gap-6 px-4 py-6 sm:px-5 sm:py-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <nav className="flex gap-2 overflow-x-auto rounded-[22px] border border-white/10 bg-white/[0.045] p-2 backdrop-blur-xl lg:grid lg:overflow-visible">
            {[
              ["dashboard", "Dashboard"],
              ["home", "Home Page"],
              ["about", "About Me"],
              ["lanes", "Creative Lanes"],
              ["experience", "Experience"],
              ["portfolio", "Portfolio"],
              ["stories", "Experience Archive"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key as StudioTab)}
                className={`shrink-0 whitespace-nowrap rounded-2xl px-4 py-3 text-left text-sm font-semibold transition lg:shrink ${
                  activeTab === key
                    ? "bg-[#8fdcff]/14 text-white shadow-[0_0_24px_rgba(84,184,255,0.12)]"
                    : "text-white/54 hover:bg-white/[0.045] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-6">
          {activeTab === "dashboard" ? (
            <>
              <SectionCard
                eyebrow="Studio"
                title="Website Health"
                action={
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void refreshStudioHealth()}
                      disabled={isHealthChecking}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/62 transition hover:border-white/22 hover:text-white disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${isHealthChecking ? "animate-spin" : ""}`} />
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={() => void optimizeWebsite()}
                      disabled={isOptimizing}
                      className="inline-flex items-center gap-2 rounded-full border border-[#8fdcff]/24 bg-[#8fdcff]/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#dff8ff] transition hover:border-[#8fdcff]/44 hover:bg-[#8fdcff]/[0.12] disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4" />
                      {isOptimizing ? "Optimizing" : "Optimize website"}
                    </button>
                  </div>
                }
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <HealthCard
                    label="Website Status"
                    value={websiteIsHealthy ? "Healthy" : "Needs attention"}
                    detail={
                      websiteIsHealthy
                        ? "Core data, Studio state, and provider checks look usable."
                        : "One provider check failed or could not be reached."
                    }
                    tone={websiteIsHealthy ? "healthy" : "warn"}
                    icon={<ShieldCheck className="h-5 w-5" />}
                  />
                  <HealthCard
                    label="Portfolio Projects"
                    value={`${projectTotals.all} total`}
                    detail={`${projectTotals["Video Edit"]} video, ${projectTotals["Graphic Design"]} graphic, ${projectTotals.Websites} web projects.`}
                    tone={projectTotals.all > 0 ? "healthy" : "warn"}
                    icon={<Activity className="h-5 w-5" />}
                  />
                  <HealthCard
                    label="Local Studio Data"
                    value={formatBytes(localContentBytes)}
                    detail={`${localStoragePercent.toFixed(1)}% of the common 5 MB browser storage budget used by editable content.`}
                    tone={getUsageTone(localStoragePercent)}
                    icon={<HardDrive className="h-5 w-5" />}
                  />
                  <HealthCard
                    label="Last Health Check"
                    value={
                      studioHealth?.checkedAt
                        ? new Date(studioHealth.checkedAt).toLocaleTimeString()
                        : isHealthChecking
                          ? "Checking"
                          : "Not checked"
                    }
                    detail="Refresh this after uploading or syncing content."
                    tone={isHealthChecking ? "neutral" : "healthy"}
                    icon={<Gauge className="h-5 w-5" />}
                  />
                </div>
              </SectionCard>

              <SectionCard eyebrow="Storage" title="Provider Usage">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/18 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8fdcff]/72">
                          Cloudinary
                        </p>
                        <h3 className="mt-1 text-xl font-semibold text-white">
                          {connectionStatus.cloudinary === "connected"
                            ? "Upload ready"
                            : "Check configuration"}
                        </h3>
                      </div>
                      <Cloud className="h-5 w-5 text-[#8fdcff]" />
                    </div>
                    <div className="mt-5 space-y-3">
                      <HealthCard
                        label="Storage"
                        value={formatUsageMetric(studioHealth?.cloudinary?.storage)}
                        detail={
                          studioHealth?.cloudinary?.detail ||
                          connectionStatus.cloudinaryDetail
                        }
                        tone={getUsageTone(cloudinaryStoragePercent)}
                        icon={<HardDrive className="h-5 w-5" />}
                      />
                      <HealthCard
                        label="Bandwidth"
                        value={formatUsageMetric(studioHealth?.cloudinary?.bandwidth)}
                        detail="Shown when Cloudinary Admin API keys are available."
                        tone={getUsageTone(getMetricPercent(studioHealth?.cloudinary?.bandwidth))}
                        icon={<Activity className="h-5 w-5" />}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/18 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8fdcff]/72">
                          Supabase
                        </p>
                        <h3 className="mt-1 text-xl font-semibold text-white">
                          {connectionStatus.supabase === "connected"
                            ? "Content row healthy"
                            : "Check connection"}
                        </h3>
                      </div>
                      <Database className="h-5 w-5 text-[#8fdcff]" />
                    </div>
                    <div className="mt-5 space-y-3">
                      <HealthCard
                        label="Content Payload"
                        value={formatBytes(studioHealth?.supabase?.contentBytes)}
                        detail={studioHealth?.supabase?.detail || connectionStatus.supabaseDetail}
                        tone={
                          studioHealth?.supabase?.status === "healthy" ? "healthy" : "warn"
                        }
                        icon={<HardDrive className="h-5 w-5" />}
                      />
                      <HealthCard
                        label="Asset Bucket"
                        value={studioHealth?.supabase?.bucket || "portfolio-assets"}
                        detail="Supabase quota remaining is not exposed to this app unless a provider quota API is added."
                        tone="neutral"
                        icon={<Database className="h-5 w-5" />}
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>
            </>
          ) : null}

          {activeTab === "home" ? (
            <>
              <SectionCard
                eyebrow="Home"
                title="Hero Text"
                action={<SaveButton onClick={() => persistHomeContent(homeContent)} />}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Eyebrow">
                    <TextInput
                      value={homeContent.hero.eyebrow}
                      onChange={(event) =>
                        updateHome((current) => ({
                          ...current,
                          hero: { ...current.hero, eyebrow: event.target.value },
                        }))
                      }
                    />
                  </Field>
                  <Field label="Highlight">
                    <TextInput
                      value={homeContent.hero.highlight}
                      onChange={(event) =>
                        updateHome((current) => ({
                          ...current,
                          hero: { ...current.hero, highlight: event.target.value },
                        }))
                      }
                    />
                  </Field>
                  <Field label="Line 1">
                    <TextInput
                      value={homeContent.hero.line1}
                      onChange={(event) =>
                        updateHome((current) => ({
                          ...current,
                          hero: { ...current.hero, line1: event.target.value },
                        }))
                      }
                    />
                  </Field>
                  <Field label="Line 2">
                    <TextInput
                      value={homeContent.hero.line2}
                      onChange={(event) =>
                        updateHome((current) => ({
                          ...current,
                          hero: { ...current.hero, line2: event.target.value },
                        }))
                      }
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Description">
                      <TextArea
                        value={homeContent.hero.description}
                        onChange={(event) =>
                          updateHome((current) => ({
                            ...current,
                            hero: { ...current.hero, description: event.target.value },
                          }))
                        }
                      />
                    </Field>
                  </div>
                  {(["primaryCta", "secondaryCta", "contactCta"] as const).map((field) => (
                    <Field key={field} label={field.replace("Cta", " CTA")}>
                      <TextInput
                        value={homeContent.hero[field]}
                        onChange={(event) =>
                          updateHome((current) => ({
                            ...current,
                            hero: { ...current.hero, [field]: event.target.value },
                          }))
                        }
                      />
                    </Field>
                  ))}
                  <div className="md:col-span-2">
                    <Field label="Pills" hint="Comma separated labels.">
                      <TextInput
                        value={homeContent.hero.pills.join(", ")}
                        onChange={(event) =>
                          updateHome((current) => ({
                            ...current,
                            hero: { ...current.hero, pills: splitTags(event.target.value) },
                          }))
                        }
                      />
                    </Field>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="Home"
                title="Featured Projects"
                action={<SaveButton onClick={() => persistHomeContent(homeContent)} />}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Eyebrow">
                    <TextInput
                      value={homeContent.featuredProjects.eyebrow}
                      onChange={(event) =>
                        updateHome((current) => ({
                          ...current,
                          featuredProjects: {
                            ...current.featuredProjects,
                            eyebrow: event.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  {(["titleMuted", "titleStrong"] as const).map((field) => (
                    <Field key={field} label={field}>
                      <TextInput
                        value={homeContent.featuredProjects[field]}
                        onChange={(event) =>
                          updateHome((current) => ({
                            ...current,
                            featuredProjects: {
                              ...current.featuredProjects,
                              [field]: event.target.value,
                            },
                          }))
                        }
                      />
                    </Field>
                  ))}
                  <Field
                    label="Scroll pace"
                    hint="Viewport height per frame. Lower values change frames faster."
                  >
                    <TextInput
                      type="number"
                      min={32}
                      max={110}
                      step={1}
                      value={homeContent.featuredProjects.scrollLengthVh}
                      onChange={(event) => {
                        const nextValue = Number(event.target.value);

                        updateHome((current) => ({
                          ...current,
                          featuredProjects: {
                            ...current.featuredProjects,
                            scrollLengthVh: Number.isFinite(nextValue)
                              ? Math.min(110, Math.max(32, nextValue))
                              : defaultHomeContent.featuredProjects.scrollLengthVh,
                          },
                        }));
                      }}
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Description">
                      <TextArea
                        value={homeContent.featuredProjects.description}
                        onChange={(event) =>
                          updateHome((current) => ({
                            ...current,
                            featuredProjects: {
                              ...current.featuredProjects,
                              description: event.target.value,
                            },
                          }))
                        }
                      />
                    </Field>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <EditorTabs
                    items={homeContent.featuredProjects.projects.map((project, index) => ({
                      label: `Frame ${index + 1}`,
                      title: project.title || `Featured frame ${index + 1}`,
                    }))}
                    activeIndex={selectedFeaturedProjectIndex}
                    onChange={setActiveFeaturedProjectIndex}
                    emptyLabel="No featured frames yet."
                  />
                  {homeContent.featuredProjects.projects.map((project, index) => (
                    index === selectedFeaturedProjectIndex ? (
                    <div key={`featured-project-${index}`} className="rounded-2xl border border-white/10 bg-black/18 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">Frame {index + 1}</p>
                        <RowActions
                          onMoveUp={
                            index > 0
                              ? () =>
                                  {
                                    updateHome((current) => ({
                                      ...current,
                                      featuredProjects: {
                                        ...current.featuredProjects,
                                        projects: moveItem(
                                          current.featuredProjects.projects,
                                          index,
                                          -1
                                        ),
                                      },
                                    }));
                                    setActiveFeaturedProjectIndex(index - 1);
                                  }
                              : undefined
                          }
                          onMoveDown={
                            index < homeContent.featuredProjects.projects.length - 1
                              ? () =>
                                  {
                                    updateHome((current) => ({
                                      ...current,
                                      featuredProjects: {
                                        ...current.featuredProjects,
                                        projects: moveItem(
                                          current.featuredProjects.projects,
                                          index,
                                          1
                                        ),
                                      },
                                    }));
                                    setActiveFeaturedProjectIndex(index + 1);
                                  }
                              : undefined
                          }
                          onRemove={() => {
                            updateHome((current) => ({
                              ...current,
                              featuredProjects: {
                                ...current.featuredProjects,
                                projects: current.featuredProjects.projects.filter(
                                  (_, itemIndex) => itemIndex !== index
                                ),
                              },
                            }));
                            setActiveFeaturedProjectIndex(Math.max(0, index - 1));
                          }}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Title">
                          <TextInput
                            value={project.title}
                            onChange={(event) =>
                              updateHome((current) => ({
                                ...current,
                                featuredProjects: {
                                  ...current.featuredProjects,
                                  projects: current.featuredProjects.projects.map(
                                    (item, itemIndex) =>
                                      itemIndex === index
                                        ? { ...item, title: event.target.value }
                                        : item
                                  ),
                                },
                              }))
                            }
                          />
                        </Field>
                        <Field label="Icon">
                          <SelectInput
                            value={project.icon}
                            onChange={(event) =>
                              updateHome((current) => ({
                                ...current,
                                featuredProjects: {
                                  ...current.featuredProjects,
                                  projects: current.featuredProjects.projects.map(
                                    (item, itemIndex) =>
                                      itemIndex === index
                                        ? {
                                            ...item,
                                            icon: event.target.value as FeaturedProjectIcon,
                                          }
                                        : item
                                  ),
                                },
                              }))
                            }
                          >
                            {iconOptions.map((icon) => (
                              <option key={icon} value={icon}>
                                {icon}
                              </option>
                            ))}
                          </SelectInput>
                        </Field>
                        <div className="md:col-span-2">
                          <Field label="Description">
                            <TextArea
                              value={project.description}
                              onChange={(event) =>
                                updateHome((current) => ({
                                  ...current,
                                  featuredProjects: {
                                    ...current.featuredProjects,
                                    projects: current.featuredProjects.projects.map(
                                      (item, itemIndex) =>
                                        itemIndex === index
                                          ? { ...item, description: event.target.value }
                                          : item
                                    ),
                                  },
                                }))
                              }
                            />
                          </Field>
                        </div>
                        <div className="md:col-span-2">
                          <UploadField
                            label="Image"
                            kind="image"
                            folder="portfolio/home-featured"
                            value={project.image}
                            onChange={(value) =>
                              updateHome((current) => ({
                                ...current,
                                featuredProjects: {
                                  ...current.featuredProjects,
                                  projects: current.featuredProjects.projects.map(
                                    (item, itemIndex) =>
                                      itemIndex === index ? { ...item, image: value } : item
                                  ),
                                },
                              }))
                            }
                            onUploaded={(value) =>
                              persistHomeUpload((current) => ({
                                ...current,
                                featuredProjects: {
                                  ...current.featuredProjects,
                                  projects: current.featuredProjects.projects.map(
                                    (item, itemIndex) =>
                                      itemIndex === index ? { ...item, image: value } : item
                                  ),
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                    ) : null
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      updateHome((current) => ({
                        ...current,
                        featuredProjects: {
                          ...current.featuredProjects,
                          projects: [
                            ...current.featuredProjects.projects,
                            createFeaturedProject(),
                          ],
                        },
                      }));
                      setActiveFeaturedProjectIndex(homeContent.featuredProjects.projects.length);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[#8fdcff]/22 px-4 py-2 text-sm font-semibold text-[#dff8ff] transition hover:bg-[#8fdcff]/[0.08]"
                  >
                    <Plus className="h-4 w-4" />
                    Add featured frame
                  </button>
                </div>
              </SectionCard>
            </>
          ) : null}

          {activeTab === "about" ? (
            <SectionCard
              eyebrow="Home"
              title="About Accordion"
              action={<SaveButton onClick={() => persistHomeContent(homeContent)} />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                {(["eyebrow", "title", "ctaLabel"] as const).map((field) => (
                  <Field key={field} label={field}>
                    <TextInput
                      value={homeContent.aboutAccordion[field]}
                      onChange={(event) =>
                        updateHome((current) => ({
                          ...current,
                          aboutAccordion: {
                            ...current.aboutAccordion,
                            [field]: event.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                ))}
                <div className="md:col-span-2">
                  <Field label="Description">
                    <TextArea
                      value={homeContent.aboutAccordion.description}
                      onChange={(event) =>
                        updateHome((current) => ({
                          ...current,
                          aboutAccordion: {
                            ...current.aboutAccordion,
                            description: event.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Secondary Description">
                    <TextArea
                      value={homeContent.aboutAccordion.secondaryDescription}
                      onChange={(event) =>
                        updateHome((current) => ({
                          ...current,
                          aboutAccordion: {
                            ...current.aboutAccordion,
                            secondaryDescription: event.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <EditorTabs
                  items={homeContent.aboutAccordion.items.map((item, index) => ({
                    label: `Panel ${index + 1}`,
                    title: item.title || `Accordion image ${index + 1}`,
                  }))}
                  activeIndex={selectedAboutItemIndex}
                  onChange={setActiveAboutItemIndex}
                  emptyLabel="No About panels yet."
                />
                {homeContent.aboutAccordion.items.map((item, index) => (
                  index === selectedAboutItemIndex ? (
                  <div key={`about-item-${index}`} className="rounded-2xl border border-white/10 bg-black/18 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">Accordion image {index + 1}</p>
                      <RowActions
                        onMoveUp={
                          index > 0
                            ? () =>
                                {
                                  updateHome((current) => ({
                                    ...current,
                                    aboutAccordion: {
                                      ...current.aboutAccordion,
                                      items: moveItem(current.aboutAccordion.items, index, -1),
                                    },
                                  }));
                                  setActiveAboutItemIndex(index - 1);
                                }
                            : undefined
                        }
                        onMoveDown={
                          index < homeContent.aboutAccordion.items.length - 1
                            ? () =>
                                {
                                  updateHome((current) => ({
                                    ...current,
                                    aboutAccordion: {
                                      ...current.aboutAccordion,
                                      items: moveItem(current.aboutAccordion.items, index, 1),
                                    },
                                  }));
                                  setActiveAboutItemIndex(index + 1);
                                }
                            : undefined
                        }
                        onRemove={() => {
                          updateHome((current) => ({
                            ...current,
                            aboutAccordion: {
                              ...current.aboutAccordion,
                              items: current.aboutAccordion.items.filter(
                                (_, itemIndex) => itemIndex !== index
                              ),
                            },
                          }));
                          setActiveAboutItemIndex(Math.max(0, index - 1));
                        }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Title">
                        <TextInput
                          value={item.title}
                          onChange={(event) =>
                            updateHome((current) => ({
                              ...current,
                              aboutAccordion: {
                                ...current.aboutAccordion,
                                items: current.aboutAccordion.items.map((entry, itemIndex) =>
                                  itemIndex === index
                                    ? { ...entry, title: event.target.value }
                                    : entry
                                ),
                              },
                            }))
                          }
                        />
                      </Field>
                      <UploadField
                        label="Image"
                        kind="image"
                        folder="portfolio/about"
                        value={item.imageUrl}
                        onChange={(value) =>
                          updateHome((current) => ({
                            ...current,
                            aboutAccordion: {
                              ...current.aboutAccordion,
                              items: current.aboutAccordion.items.map((entry, itemIndex) =>
                                itemIndex === index ? { ...entry, imageUrl: value } : entry
                              ),
                            },
                          }))
                        }
                        onUploaded={(value) =>
                          persistHomeUpload((current) => ({
                            ...current,
                            aboutAccordion: {
                              ...current.aboutAccordion,
                              items: current.aboutAccordion.items.map((entry, itemIndex) =>
                                itemIndex === index ? { ...entry, imageUrl: value } : entry
                              ),
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                  ) : null
                ))}
                <button
                  type="button"
                  onClick={() => {
                    updateHome((current) => ({
                      ...current,
                      aboutAccordion: {
                        ...current.aboutAccordion,
                        items: [...current.aboutAccordion.items, createAboutItem()],
                      },
                    }));
                    setActiveAboutItemIndex(homeContent.aboutAccordion.items.length);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#8fdcff]/22 px-4 py-2 text-sm font-semibold text-[#dff8ff] transition hover:bg-[#8fdcff]/[0.08]"
                >
                  <Plus className="h-4 w-4" />
                  Add accordion panel
                </button>
              </div>
            </SectionCard>
          ) : null}

          {activeTab === "lanes" ? (
            <SectionCard
              eyebrow="Home"
              title="Creative Lanes"
              action={<SaveButton onClick={() => persistHomeContent(homeContent)} />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Muted title">
                  <TextInput
                    value={homeContent.creativeProfile.titleMuted}
                    onChange={(event) =>
                      updateHome((current) => ({
                        ...current,
                        creativeProfile: {
                          ...current.creativeProfile,
                          titleMuted: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>
                <Field label="Strong title">
                  <TextInput
                    value={homeContent.creativeProfile.titleStrong}
                    onChange={(event) =>
                      updateHome((current) => ({
                        ...current,
                        creativeProfile: {
                          ...current.creativeProfile,
                          titleStrong: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>
              </div>

              <div className="mt-6 space-y-4">
                <EditorTabs
                  items={homeContent.creativeProfile.lanes.map((lane, index) => ({
                    label: `Lane ${index + 1}`,
                    title: lane.label || lane.value,
                  }))}
                  activeIndex={selectedCreativeLaneIndex}
                  onChange={setActiveCreativeLaneIndex}
                  emptyLabel="No creative lanes yet."
                />
                {homeContent.creativeProfile.lanes.map((lane, index) => (
                  index === selectedCreativeLaneIndex ? (
                  <div key={`${lane.value}-${index}`} className="rounded-2xl border border-white/10 bg-black/18 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{lane.label}</p>
                      <RowActions
                        onMoveUp={
                          index > 0
                            ? () =>
                                {
                                  updateHome((current) => ({
                                    ...current,
                                    creativeProfile: {
                                      ...current.creativeProfile,
                                      lanes: moveItem(current.creativeProfile.lanes, index, -1),
                                    },
                                  }));
                                  setActiveCreativeLaneIndex(index - 1);
                                }
                            : undefined
                        }
                        onMoveDown={
                          index < homeContent.creativeProfile.lanes.length - 1
                            ? () =>
                                {
                                  updateHome((current) => ({
                                    ...current,
                                    creativeProfile: {
                                      ...current.creativeProfile,
                                      lanes: moveItem(current.creativeProfile.lanes, index, 1),
                                    },
                                  }));
                                  setActiveCreativeLaneIndex(index + 1);
                                }
                            : undefined
                        }
                        onRemove={() => {
                          updateHome((current) => ({
                            ...current,
                            creativeProfile: {
                              ...current.creativeProfile,
                              lanes: current.creativeProfile.lanes.filter(
                                (_, itemIndex) => itemIndex !== index
                              ),
                            },
                          }));
                          setActiveCreativeLaneIndex(Math.max(0, index - 1));
                        }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Lane type">
                        <SelectInput
                          value={lane.value}
                          onChange={(event) =>
                            updateHome((current) => ({
                              ...current,
                              creativeProfile: {
                                ...current.creativeProfile,
                                lanes: current.creativeProfile.lanes.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        value: event.target.value as HomeCreativeLane["value"],
                                      }
                                    : item
                                ),
                              },
                            }))
                          }
                        >
                          <option value="video-editing">Video Editing</option>
                          <option value="graphic-design">Graphic Design</option>
                          <option value="web-development">Web Development</option>
                        </SelectInput>
                      </Field>
                      {(["label", "badge", "buttonText", "buttonHref", "imageAlt"] as const).map(
                        (field) => (
                          <Field key={field} label={field}>
                            <TextInput
                              value={lane[field]}
                              onChange={(event) =>
                                updateHome((current) => ({
                                  ...current,
                                  creativeProfile: {
                                    ...current.creativeProfile,
                                    lanes: current.creativeProfile.lanes.map(
                                      (item, itemIndex) =>
                                        itemIndex === index
                                          ? { ...item, [field]: event.target.value }
                                          : item
                                    ),
                                  },
                                }))
                              }
                            />
                          </Field>
                        )
                      )}
                      <div className="md:col-span-2">
                        <Field label="Title">
                          <TextInput
                            value={lane.title}
                            onChange={(event) =>
                              updateHome((current) => ({
                                ...current,
                                creativeProfile: {
                                  ...current.creativeProfile,
                                  lanes: current.creativeProfile.lanes.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, title: event.target.value }
                                      : item
                                  ),
                                },
                              }))
                            }
                          />
                        </Field>
                      </div>
                      <div className="md:col-span-2">
                        <Field label="Description">
                          <TextArea
                            value={lane.description}
                            onChange={(event) =>
                              updateHome((current) => ({
                                ...current,
                                creativeProfile: {
                                  ...current.creativeProfile,
                                  lanes: current.creativeProfile.lanes.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, description: event.target.value }
                                      : item
                                  ),
                                },
                              }))
                            }
                          />
                        </Field>
                      </div>
                      <div className="md:col-span-2">
                        <UploadField
                          label="Lane image"
                          kind="image"
                          folder="portfolio/lanes"
                          value={lane.imageSrc}
                          onChange={(value) =>
                            updateHome((current) => ({
                              ...current,
                              creativeProfile: {
                                ...current.creativeProfile,
                                lanes: current.creativeProfile.lanes.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, imageSrc: value } : item
                                ),
                              },
                            }))
                          }
                          onUploaded={(value) =>
                            persistHomeUpload((current) => ({
                              ...current,
                              creativeProfile: {
                                ...current.creativeProfile,
                                lanes: current.creativeProfile.lanes.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, imageSrc: value } : item
                                ),
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  ) : null
                ))}
                <button
                  type="button"
                  onClick={() => {
                    updateHome((current) => ({
                      ...current,
                      creativeProfile: {
                        ...current.creativeProfile,
                        lanes: [...current.creativeProfile.lanes, createCreativeLane()],
                      },
                    }));
                    setActiveCreativeLaneIndex(homeContent.creativeProfile.lanes.length);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#8fdcff]/22 px-4 py-2 text-sm font-semibold text-[#dff8ff] transition hover:bg-[#8fdcff]/[0.08]"
                >
                  <Plus className="h-4 w-4" />
                  Add lane
                </button>
              </div>
            </SectionCard>
          ) : null}

          {activeTab === "experience" ? (
            <SectionCard
              eyebrow="Home"
              title="Experience Testimonials"
              action={<SaveButton onClick={() => persistHomeContent(homeContent)} />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                {(["eyebrow", "titleMuted", "titleStrong"] as const).map((field) => (
                  <Field key={field} label={field}>
                    <TextInput
                      value={homeContent.experienceSection[field]}
                      onChange={(event) =>
                        updateHome((current) => ({
                          ...current,
                          experienceSection: {
                            ...current.experienceSection,
                            [field]: event.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                ))}
                <div className="md:col-span-2">
                  <Field label="Description">
                    <TextArea
                      value={homeContent.experienceSection.description}
                      onChange={(event) =>
                        updateHome((current) => ({
                          ...current,
                          experienceSection: {
                            ...current.experienceSection,
                            description: event.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <EditorTabs
                  items={homeContent.experienceSection.cards.map((card, index) => ({
                    label: `Card ${index + 1}`,
                    title: card.name || `Experience card ${index + 1}`,
                  }))}
                  activeIndex={selectedExperienceCardIndex}
                  onChange={setActiveExperienceCardIndex}
                  emptyLabel="No experience cards yet."
                />
                {homeContent.experienceSection.cards.map((card, index) => (
                  index === selectedExperienceCardIndex ? (
                  <div
                    key={`experience-card-${index}`}
                    className="rounded-2xl border border-white/10 bg-black/18 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">
                        {card.name || `Experience card ${index + 1}`}
                      </p>
                      <RowActions
                        onMoveUp={
                          index > 0
                            ? () =>
                                {
                                  updateHome((current) => ({
                                    ...current,
                                    experienceSection: {
                                      ...current.experienceSection,
                                      cards: moveItem(
                                        current.experienceSection.cards,
                                        index,
                                        -1
                                      ),
                                    },
                                  }));
                                  setActiveExperienceCardIndex(index - 1);
                                }
                            : undefined
                        }
                        onMoveDown={
                          index < homeContent.experienceSection.cards.length - 1
                            ? () =>
                                {
                                  updateHome((current) => ({
                                    ...current,
                                    experienceSection: {
                                      ...current.experienceSection,
                                      cards: moveItem(
                                        current.experienceSection.cards,
                                        index,
                                        1
                                      ),
                                    },
                                  }));
                                  setActiveExperienceCardIndex(index + 1);
                                }
                            : undefined
                        }
                        onRemove={() => {
                          updateHome((current) => ({
                            ...current,
                            experienceSection: {
                              ...current.experienceSection,
                              cards: current.experienceSection.cards.filter(
                                (_, itemIndex) => itemIndex !== index
                              ),
                            },
                          }));
                          setActiveExperienceCardIndex(Math.max(0, index - 1));
                        }}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Name">
                        <TextInput
                          value={card.name}
                          onChange={(event) =>
                            updateHome((current) => ({
                              ...current,
                              experienceSection: {
                                ...current.experienceSection,
                                cards: current.experienceSection.cards.map(
                                  (item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, name: event.target.value }
                                      : item
                                ),
                              },
                            }))
                          }
                        />
                      </Field>
                      <Field label="Role / tools">
                        <TextInput
                          value={card.role}
                          onChange={(event) =>
                            updateHome((current) => ({
                              ...current,
                              experienceSection: {
                                ...current.experienceSection,
                                cards: current.experienceSection.cards.map(
                                  (item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, role: event.target.value }
                                      : item
                                ),
                              },
                            }))
                          }
                        />
                      </Field>
                      <div className="md:col-span-2">
                        <Field label="Quote">
                          <TextArea
                            value={card.quote}
                            onChange={(event) =>
                              updateHome((current) => ({
                                ...current,
                                experienceSection: {
                                  ...current.experienceSection,
                                  cards: current.experienceSection.cards.map(
                                    (item, itemIndex) =>
                                      itemIndex === index
                                        ? { ...item, quote: event.target.value }
                                        : item
                                  ),
                                },
                              }))
                            }
                          />
                        </Field>
                      </div>
                      <div className="md:col-span-2">
                        <UploadField
                          label="Card image"
                          kind="image"
                          folder="portfolio/experience"
                          value={card.image}
                          onChange={(value) =>
                            updateHome((current) => ({
                              ...current,
                              experienceSection: {
                                ...current.experienceSection,
                                cards: current.experienceSection.cards.map(
                                  (item, itemIndex) =>
                                    itemIndex === index ? { ...item, image: value } : item
                                ),
                              },
                            }))
                          }
                          onUploaded={(value) =>
                            persistHomeUpload((current) => ({
                              ...current,
                              experienceSection: {
                                ...current.experienceSection,
                                cards: current.experienceSection.cards.map(
                                  (item, itemIndex) =>
                                    itemIndex === index ? { ...item, image: value } : item
                                ),
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  ) : null
                ))}

                <button
                  type="button"
                  onClick={() => {
                    updateHome((current) => ({
                      ...current,
                      experienceSection: {
                        ...current.experienceSection,
                        cards: [...current.experienceSection.cards, createExperienceCard()],
                      },
                    }));
                    setActiveExperienceCardIndex(homeContent.experienceSection.cards.length);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#8fdcff]/22 px-4 py-2 text-sm font-semibold text-[#dff8ff] transition hover:bg-[#8fdcff]/[0.08]"
                >
                  <Plus className="h-4 w-4" />
                  Add experience card
                </button>
              </div>
            </SectionCard>
          ) : null}

          {activeTab === "portfolio" ? (
            <SectionCard
              eyebrow="Portfolio"
              title={`${activeCategoryLabel} Projects`}
              action={<SaveButton onClick={() => persistProjects(projects)} />}
            >
              <div className="mb-5 grid gap-3 md:grid-cols-3">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category.key);
                      setActiveProjectIndex(0);
                    }}
                    className={`rounded-2xl border p-4 text-left transition ${
                      activeCategory === category.key
                        ? "border-[#8fdcff]/36 bg-[#8fdcff]/[0.1]"
                        : "border-white/10 bg-black/14 hover:border-white/20"
                    }`}
                  >
                    <p className="font-semibold text-white">{category.label}</p>
                    <p className="mt-2 text-xs leading-relaxed text-white/46">{category.note}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {currentCategoryProjects.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/18 p-2">
                    {currentCategoryProjects.map((project, index) => (
                      <button
                        key={`project-tab-${index}`}
                        type="button"
                        onClick={() => setActiveProjectIndex(index)}
                        className={`shrink-0 rounded-xl border px-4 py-3 text-left transition ${
                          selectedProjectIndex === index
                            ? "border-[#8fdcff]/40 bg-[#8fdcff]/[0.12] text-white"
                            : "border-white/10 bg-white/[0.035] text-white/58 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-current/54">
                          Project {index + 1}
                        </span>
                        <span className="mt-1 block max-w-[12rem] truncate text-sm font-semibold">
                          {project.title || `${activeCategoryLabel} ${index + 1}`}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {currentCategoryProjects.map((project, index) => {
                  if (index !== selectedProjectIndex) {
                    return null;
                  }

                  const detailImages = project.details?.galleryImages || [""];
                  const videoUrls = project.videoUrls && project.videoUrls.length > 0 ? project.videoUrls : [""];
                  const videoPosters =
                    project.videoPosterUrls && project.videoPosterUrls.length > 0
                      ? project.videoPosterUrls
                      : [""];

                  return (
                    <div key={`portfolio-project-${index}`} className="rounded-2xl border border-white/10 bg-black/18 p-4">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">
                            {project.title || `Project ${index + 1}`}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/34">
                            {activeCategoryLabel} / Project {index + 1}
                          </p>
                        </div>
                        <RowActions
                          onMoveUp={
                            index > 0
                              ? () =>
                                  {
                                    updateProjects((current) => ({
                                      ...current,
                                      [activeCategory]: moveItem(
                                        current[activeCategory] || [],
                                        index,
                                        -1
                                      ),
                                    }));
                                    setActiveProjectIndex(index - 1);
                                  }
                              : undefined
                          }
                          onMoveDown={
                            index < currentCategoryProjects.length - 1
                              ? () =>
                                  {
                                    updateProjects((current) => ({
                                      ...current,
                                      [activeCategory]: moveItem(
                                        current[activeCategory] || [],
                                        index,
                                        1
                                      ),
                                    }));
                                    setActiveProjectIndex(index + 1);
                                  }
                              : undefined
                          }
                          onRemove={() => {
                            updateProjects((current) => ({
                              ...current,
                              [activeCategory]: (current[activeCategory] || []).filter(
                                (_, itemIndex) => itemIndex !== index
                              ),
                            }));
                            setActiveProjectIndex(Math.max(0, index - 1));
                          }}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Title">
                          <TextInput
                            value={project.title}
                            onChange={(event) =>
                              updateProjectAt(index, (item) => ({
                                ...item,
                                title: event.target.value,
                              }))
                            }
                          />
                        </Field>
                        <UploadField
                          label="Card image"
                          kind="image"
                          folder="portfolio/cards"
                          value={project.image}
                          onChange={(value) =>
                            updateProjectAt(index, (item) => ({ ...item, image: value }))
                          }
                          onUploaded={(value) =>
                            persistProjectUploadAt(index, (item) => ({
                              ...item,
                              image: value,
                            }))
                          }
                        />
                        <div className="md:col-span-2">
                          <Field label="Description">
                            <TextArea
                              value={project.description}
                              onChange={(event) =>
                                updateProjectAt(index, (item) => ({
                                  ...item,
                                  description: event.target.value,
                                }))
                              }
                            />
                          </Field>
                        </div>
                        <Field label="External source / backup link">
                          <TextInput
                            value={project.designLink}
                            onChange={(event) =>
                              updateProjectAt(index, (item) => ({
                                ...item,
                                designLink: event.target.value,
                              }))
                            }
                          />
                        </Field>
                        <Field
                          label="Tool badges"
                          hint="Comma-separated badges shown after the video group badge, for example: Adobe Premiere Pro, After Effects, CapCut."
                        >
                          <ToolBadgesInput
                            key={`${activeCategory}-${index}-tool-badges`}
                            tags={project.tags || []}
                            placeholder={defaultProjectTags[activeCategory].join(", ")}
                            onChange={(tags) =>
                              updateProjectAt(index, (item) => ({
                                ...item,
                                tags,
                              }))
                            }
                          />
                        </Field>
                      </div>

                      {isVideoCategory(activeCategory) ? (
                        <div className="mt-5 rounded-2xl border border-[#8fdcff]/14 bg-[#8fdcff]/[0.045] p-4">
                          <div className="grid gap-4 md:grid-cols-3">
                            <Field
                              label="First badge / video group"
                              hint="Type short-form here and the public card shows SHORT REEL."
                            >
                              <TextInput
                                value={project.videoCategory || ""}
                                placeholder="short-form"
                                onChange={(event) =>
                                  updateProjectAt(index, (item) => ({
                                    ...item,
                                    videoCategory: event.target.value,
                                  }))
                                }
                              />
                            </Field>
                            <Field label="Client / parent label">
                              <TextInput
                                value={project.videoParentLabel || ""}
                                onChange={(event) =>
                                  updateProjectAt(index, (item) => ({
                                    ...item,
                                    videoParentLabel: event.target.value,
                                  }))
                                }
                              />
                            </Field>
                            <Field label="Aspect ratio">
                              <SelectInput
                                value={project.videoAspectRatio || "landscape"}
                                onChange={(event) =>
                                  updateProjectAt(index, (item) => ({
                                    ...item,
                                    videoAspectRatio: event.target.value as VideoAspectRatio,
                                  }))
                                }
                              >
                                <option value="landscape">1920 x 1080</option>
                                <option value="portrait">1080 x 1920</option>
                              </SelectInput>
                            </Field>
                          </div>

                          <div className="mt-4 space-y-4">
                            {videoUrls.map((videoUrl, videoIndex) => (
                              <div key={`video-source-${videoIndex}`} className="rounded-xl border border-white/10 bg-black/20 p-3">
                                <div className="grid gap-4 lg:grid-cols-2">
                                  <UploadField
                                    label={`Video source ${videoIndex + 1}`}
                                    kind="video"
                                    folder="portfolio/videos"
                                    value={videoUrl}
                                    placeholder="Paste a YouTube link, or upload a video file to Cloudinary"
                                    uploadLabel="Upload video"
                                    hint="YouTube links stay as links. Uploaded video files are stored in Cloudinary; Supabase only saves the public URL."
                                    onChange={(value) =>
                                      updateProjectAt(index, (item) => {
                                        const nextVideoUrls = [...videoUrls];
                                        nextVideoUrls[videoIndex] = value;
                                        return {
                                          ...item,
                                          videoUrls: nextVideoUrls,
                                          videoUrl: nextVideoUrls.find(Boolean) || "",
                                        };
                                      })
                                    }
                                    onUploaded={(value) =>
                                      persistProjectUploadAt(index, (item) => {
                                        const nextVideoUrls = [...videoUrls];
                                        nextVideoUrls[videoIndex] = value;
                                        return {
                                          ...item,
                                          videoUrls: nextVideoUrls,
                                          videoUrl: nextVideoUrls.find(Boolean) || "",
                                        };
                                      })
                                    }
                                  />
                                  <UploadField
                                    label={`Thumbnail ${videoIndex + 1}`}
                                    kind="image"
                                    folder="portfolio/video-thumbnails"
                                    value={videoPosters[videoIndex] || ""}
                                    onChange={(value) =>
                                      updateProjectAt(index, (item) => {
                                        const nextPosters = [...videoPosters];
                                        nextPosters[videoIndex] = value;
                                        return { ...item, videoPosterUrls: nextPosters };
                                      })
                                    }
                                    onUploaded={(value) =>
                                      persistProjectUploadAt(index, (item) => {
                                        const nextPosters = [...videoPosters];
                                        nextPosters[videoIndex] = value;
                                        return { ...item, videoPosterUrls: nextPosters };
                                      })
                                    }
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateProjectAt(index, (item) => ({
                                      ...item,
                                      videoUrls: videoUrls.filter(
                                        (_, itemIndex) => itemIndex !== videoIndex
                                      ),
                                      videoPosterUrls: videoPosters.filter(
                                        (_, itemIndex) => itemIndex !== videoIndex
                                      ),
                                    }))
                                  }
                                  className="mt-3 text-xs font-semibold text-[#ffb7c0] hover:text-[#ffccd2]"
                                >
                                  Remove video link
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                updateProjectAt(index, (item) => ({
                                  ...item,
                                  videoUrls: [...videoUrls, ""],
                                  videoPosterUrls: [...videoPosters, ""],
                                }))
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-[#8fdcff]/22 px-4 py-2 text-sm font-semibold text-[#dff8ff] transition hover:bg-[#8fdcff]/[0.08]"
                            >
                              <Video className="h-4 w-4" />
                              Add video
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-5 rounded-2xl border border-[#8fdcff]/14 bg-[#8fdcff]/[0.045] p-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Detail page title">
                              <TextInput
                                value={project.details?.title || project.title}
                                onChange={(event) =>
                                  updateProjectDetails(index, (details) => ({
                                    ...details,
                                    title: event.target.value,
                                  }))
                                }
                              />
                            </Field>
                            <UploadField
                              label="Hero frame 1920x1080"
                              kind="image"
                              folder="portfolio/project-frames"
                              value={project.details?.heroImage || ""}
                              onChange={(value) =>
                                updateProjectDetails(index, (details) => ({
                                  ...details,
                                  heroImage: value,
                                }))
                              }
                              onUploaded={(value) =>
                                persistProjectDetailsUpload(index, (details) => ({
                                  ...details,
                                  heroImage: value,
                                }))
                              }
                            />
                            <div className="md:col-span-2">
                              <Field label="Detail page intro">
                                <TextArea
                                  value={project.details?.description || ""}
                                  onChange={(event) =>
                                    updateProjectDetails(index, (details) => ({
                                      ...details,
                                      description: event.target.value,
                                    }))
                                  }
                                />
                              </Field>
                            </div>
                          </div>

                          <div className="mt-4 space-y-4">
                            {detailImages.map((imageUrl, imageIndex) => (
                              <div key={`gallery-frame-${imageIndex}`} className="rounded-xl border border-white/10 bg-black/20 p-3">
                                <UploadField
                                  label={`Gallery frame ${imageIndex + 1}`}
                                  kind="image"
                                  folder="portfolio/project-gallery"
                                  value={imageUrl}
                                  onChange={(value) =>
                                    updateProjectDetails(index, (details) => {
                                      const nextImages = [...detailImages];
                                      nextImages[imageIndex] = value;
                                      return { ...details, galleryImages: nextImages };
                                    })
                                  }
                                  onUploaded={(value) =>
                                    persistProjectDetailsUpload(index, (details) => {
                                      const nextImages = [...detailImages];
                                      nextImages[imageIndex] = value;
                                      return { ...details, galleryImages: nextImages };
                                    })
                                  }
                                  hint="Use 1920x1080 images for graphic design and web projects."
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateProjectDetails(index, (details) => ({
                                      ...details,
                                      galleryImages: detailImages.filter(
                                        (_, itemIndex) => itemIndex !== imageIndex
                                      ),
                                    }))
                                  }
                                  className="mt-3 text-xs font-semibold text-[#ffb7c0] hover:text-[#ffccd2]"
                                >
                                  Remove frame
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                updateProjectDetails(index, (details) => ({
                                  ...details,
                                  galleryImages: [...detailImages, ""],
                                }))
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-[#8fdcff]/22 px-4 py-2 text-sm font-semibold text-[#dff8ff] transition hover:bg-[#8fdcff]/[0.08]"
                            >
                              <ImageIcon className="h-4 w-4" />
                              Add 1920x1080 frame
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() =>
                    {
                      updateProjects((current) => ({
                        ...current,
                        [activeCategory]: [
                          ...(current[activeCategory] || []),
                          createProject(activeCategory),
                        ],
                      }));
                      setActiveProjectIndex(currentCategoryProjects.length);
                    }
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-[#8fdcff]/22 px-4 py-2 text-sm font-semibold text-[#dff8ff] transition hover:bg-[#8fdcff]/[0.08]"
                >
                  <Plus className="h-4 w-4" />
                  Add project
                </button>
              </div>
            </SectionCard>
          ) : null}

          {activeTab === "stories" ? (
            <SectionCard
              eyebrow="Home"
              title="Experience Archive"
              action={<SaveButton onClick={() => persistExperienceEntries(experienceEntries)} />}
            >
              <div className="space-y-4">
                <EditorTabs
                  items={experienceEntries.map((entry, index) => ({
                    label: `Story ${index + 1}`,
                    title: entry.role || entry.client || `Experience story ${index + 1}`,
                  }))}
                  activeIndex={selectedExperienceEntryIndex}
                  onChange={setActiveExperienceEntryIndex}
                  emptyLabel="No experience stories yet."
                />
                {experienceEntries.map((entry, index) => (
                  index === selectedExperienceEntryIndex ? (
                  <div key={`experience-story-${index}`} className="rounded-2xl border border-white/10 bg-black/18 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{entry.role || `Story ${index + 1}`}</p>
                      <RowActions
                        onMoveUp={
                          index > 0
                            ? () =>
                                {
                                  setExperienceEntries((current) => moveItem(current, index, -1));
                                  setActiveExperienceEntryIndex(index - 1);
                                }
                            : undefined
                        }
                        onMoveDown={
                          index < experienceEntries.length - 1
                            ? () =>
                                {
                                  setExperienceEntries((current) => moveItem(current, index, 1));
                                  setActiveExperienceEntryIndex(index + 1);
                                }
                            : undefined
                        }
                        onRemove={() => {
                          setExperienceEntries((current) =>
                            current.filter((_, itemIndex) => itemIndex !== index)
                          );
                          setActiveExperienceEntryIndex(Math.max(0, index - 1));
                        }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {(["role", "client", "period"] as const).map((field) => (
                        <Field key={field} label={field}>
                          <TextInput
                            value={entry[field]}
                            onChange={(event) =>
                              setExperienceEntries((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, [field]: event.target.value }
                                    : item
                                )
                              )
                            }
                          />
                        </Field>
                      ))}
                      <Field label="Tags" hint="Comma separated.">
                        <TextInput
                          value={entry.tags.join(", ")}
                          onChange={(event) =>
                            setExperienceEntries((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, tags: splitTags(event.target.value) }
                                  : item
                              )
                            )
                          }
                        />
                      </Field>
                      <div className="md:col-span-2">
                        <Field label="Summary">
                          <TextArea
                            value={entry.summary}
                            onChange={(event) =>
                              setExperienceEntries((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, summary: event.target.value }
                                    : item
                                )
                              )
                            }
                          />
                        </Field>
                      </div>
                      <div className="md:col-span-2">
                        <UploadField
                          label="Story image"
                          kind="image"
                          folder="portfolio/client-stories"
                          value={entry.image}
                          onChange={(value) =>
                            setExperienceEntries((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, image: value } : item
                              )
                            )
                          }
                          onUploaded={(value) =>
                            persistExperienceUpload((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, image: value } : item
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                  ) : null
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setExperienceEntries((current) => [...current, createExperienceEntry()]);
                    setActiveExperienceEntryIndex(experienceEntries.length);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#8fdcff]/22 px-4 py-2 text-sm font-semibold text-[#dff8ff] transition hover:bg-[#8fdcff]/[0.08]"
                >
                  <Plus className="h-4 w-4" />
                  Add experience story
                </button>
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </main>
  );
}

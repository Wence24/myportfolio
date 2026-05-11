import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type PortfolioProject = {
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

export type PortfolioCategory = "Graphic Design" | "Video Edit" | "Websites";
export type PortfolioProjects = Record<PortfolioCategory, PortfolioProject[]>;

export type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

export type CreativeExperienceEntry = {
  role: string;
  client: string;
  period: string;
  summary: string;
  tags: string[];
  image: string;
};

const BLOCKED_EXPERIENCE_IMAGE_BASENAME_PATTERNS = [/^wens/i, /^wence/i];

export const sanitizeExperienceImage = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return "";
  }

  const normalizedValue = trimmedValue
    .replace(/\\/g, "/")
    .split("#")[0]
    .split("?")[0]
    .toLowerCase();
  const basename = normalizedValue.slice(normalizedValue.lastIndexOf("/") + 1);

  return BLOCKED_EXPERIENCE_IMAGE_BASENAME_PATTERNS.some((pattern) => pattern.test(basename))
    ? ""
    : trimmedValue;
};

export const countUsableExperienceImages = (
  entries: ReadonlyArray<Pick<CreativeExperienceEntry, "image">> | null | undefined
) =>
  Array.isArray(entries)
    ? entries.reduce((count, entry) => {
        if (!entry || typeof entry.image !== "string") {
          return count;
        }

        return sanitizeExperienceImage(entry.image).trim().length > 0 ? count + 1 : count;
      }, 0)
    : 0;

export type PortfolioContent = {
  projects: PortfolioProjects;
  testimonials: Testimonial[];
  experienceEntries?: CreativeExperienceEntry[];
  updatedAt?: string;
  experienceEntriesSyncSupported?: boolean;
};

export const PORTFOLIO_STORAGE_KEY = "portfolio-projects-v1";
export const PORTFOLIO_UPDATED_EVENT = "portfolio-projects-updated";
export const TESTIMONIALS_STORAGE_KEY = "portfolio-testimonials-v1";
export const TESTIMONIALS_UPDATED_EVENT = "portfolio-testimonials-updated";
export const EXPERIENCE_STORAGE_KEY = "portfolio-experience-v1";
export const EXPERIENCE_UPDATED_EVENT = "portfolio-experience-updated";
export const EXPERIENCE_CONTENT_UPDATED_AT_KEY = "portfolio-experience-updated-at-v1";
export const PORTFOLIO_CONTENT_UPDATED_AT_KEY = "portfolio-content-updated-at-v1";
export const PORTFOLIO_SYNC_CHANNEL_NAME = "portfolio-sync-v1";

export const defaultPortfolioProjects: PortfolioProjects = {
  "Graphic Design": [
    {
      title: "COMRADZ Sessions",
      description:
        "A weekly poster designed to showcase the details of our Sunday dance sessions. Each poster highlights the schedule, theme, and key information for the day's session, making it easy for participants to stay informed and join in. The design aims to be clear, engaging, and consistent, creating a recognizable visual identity for COMRADZ's weekly gatherings.",
      image: "/comradz.png",
      designLink: "#",
      showDetailsModal: true,
      details: {
        title: "COMRADZ Sessions",
        description:
          "A weekly poster designed to showcase the details of our Sunday dance sessions. Each poster highlights the schedule, theme, and key information for the day's session, making it easy for participants to stay informed and join in. The design aims to be clear, engaging, and consistent, creating a recognizable visual identity for COMRADZ's weekly gatherings.",
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

export const defaultTestimonials: Testimonial[] = [
  {
    quote:
      "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
    name: "Sarah Chen",
    designation: "Product Manager at TechFlow",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
    name: "Michael Rodriguez",
    designation: "CTO at InnovateSphere",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
    name: "Emily Watson",
    designation: "Operations Director at CloudScale",
    src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
    name: "James Kim",
    designation: "Engineering Lead at DataPro",
    src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
    name: "Lisa Thompson",
    designation: "VP of Technology at FutureNet",
    src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export const defaultExperienceEntries: CreativeExperienceEntry[] = [
  {
    role: "Short-Form Video Editing",
    client: "Kayla",
    period: "2024",
    summary:
      "Business-focused short-form edits built around clarity, captions, and message-first storytelling.",
    tags: ["Short-form", "Captions", "Business"],
    image: "/v2.png",
  },
  {
    role: "Short-Form and Long-Form Video Editing",
    client: "Vast Professionals",
    period: "2025-2026",
    summary:
      "Delivered both short-form and long-form client content with motion, polish, and brand-consistent finishing.",
    tags: ["Long-form", "Motion", "Branding"],
    image: "/v3.png",
  },
  {
    role: "Long-Form Video Editor",
    client: "Henry Sims",
    period: "2026-Present",
    summary:
      "Produced retention-focused long-form edits with stronger hooks, cleaner pacing, and polished sound design.",
    tags: ["Retention", "Hooks", "Storytelling"],
    image: "/v4.png",
  },
];

type PortfolioContentRow = {
  id: string;
  projects: unknown;
  testimonials: unknown;
  experience_entries?: unknown;
  updated_at?: string;
};

const SUPABASE_CONTENT_TABLE = "portfolio_content";
const DEFAULT_SUPABASE_CONTENT_ROW_ID = "main";

type PublicSupabaseConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseContentRowId: string;
};

let supabaseClient: SupabaseClient | null | undefined;
let supabaseConfig: PublicSupabaseConfig | null | undefined;
let supabaseConfigPromise: Promise<PublicSupabaseConfig | null> | null = null;

const readSupabaseConfigFromEnv = (): PublicSupabaseConfig | null => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseContentRowId:
      process.env.NEXT_PUBLIC_SUPABASE_CONTENT_ROW_ID ||
      DEFAULT_SUPABASE_CONTENT_ROW_ID,
  };
};

const readSupabaseConfigFromRuntime = async (): Promise<PublicSupabaseConfig | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const response = await fetch("/api/public-config", {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Partial<PublicSupabaseConfig>;
    if (!payload.supabaseUrl || !payload.supabaseAnonKey) {
      return null;
    }

    return {
      supabaseUrl: payload.supabaseUrl,
      supabaseAnonKey: payload.supabaseAnonKey,
      supabaseContentRowId:
        payload.supabaseContentRowId || DEFAULT_SUPABASE_CONTENT_ROW_ID,
    };
  } catch {
    return null;
  }
};

const getSupabaseConfig = async (): Promise<PublicSupabaseConfig | null> => {
  if (supabaseConfig !== undefined) {
    return supabaseConfig;
  }

  const envConfig = readSupabaseConfigFromEnv();
  if (envConfig) {
    supabaseConfig = envConfig;
    return supabaseConfig;
  }

  if (!supabaseConfigPromise) {
    supabaseConfigPromise = readSupabaseConfigFromRuntime().then((runtimeConfig) => {
      supabaseConfig = runtimeConfig;
      supabaseConfigPromise = null;
      return runtimeConfig;
    });
  }

  return supabaseConfigPromise;
};

const getSupabaseClient = async (): Promise<SupabaseClient | null> => {
  if (supabaseClient !== undefined) {
    return supabaseClient;
  }

  const config = await getSupabaseConfig();
  if (!config) {
    supabaseClient = null;
    return supabaseClient;
  }

  supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
  return supabaseClient;
};

export const isSupabaseConfigured = (): boolean => {
  if (readSupabaseConfigFromEnv()) {
    return true;
  }

  return supabaseConfig !== undefined && supabaseConfig !== null;
};

export const ensureSupabaseConfigured = async (): Promise<boolean> =>
  (await getSupabaseConfig()) !== null;

export const normalizeProjects = (value: unknown): PortfolioProjects => {
  if (!value || typeof value !== "object") {
    return defaultPortfolioProjects;
  }

  const raw = value as Record<string, unknown>;
  return {
    "Graphic Design": Array.isArray(raw["Graphic Design"])
      ? (raw["Graphic Design"] as PortfolioProject[])
      : [],
    "Video Edit": Array.isArray(raw["Video Edit"])
      ? (raw["Video Edit"] as PortfolioProject[])
      : [],
    Websites: Array.isArray(raw.Websites)
      ? (raw.Websites as PortfolioProject[])
      : Array.isArray(raw.Certificates)
        ? (raw.Certificates as PortfolioProject[])
        : [],
  };
};

export const normalizeTestimonials = (value: unknown): Testimonial[] => {
  if (!Array.isArray(value)) {
    return defaultTestimonials;
  }

  const normalized = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const raw = entry as Record<string, unknown>;
      if (
        typeof raw.quote !== "string" ||
        typeof raw.name !== "string" ||
        typeof raw.designation !== "string" ||
        typeof raw.src !== "string"
      ) {
        return null;
      }

      return {
        quote: raw.quote,
        name: raw.name,
        designation: raw.designation,
        src: raw.src,
      };
    })
    .filter((entry): entry is Testimonial => entry !== null);

  return normalized.length > 0 ? normalized : defaultTestimonials;
};

export const parseExperienceEntries = (
  value: unknown
): CreativeExperienceEntry[] | null => {
  if (typeof value === "string") {
    try {
      return parseExperienceEntries(JSON.parse(value));
    } catch {
      return null;
    }
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const normalized = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const raw = entry as Record<string, unknown>;
      if (
        typeof raw.role !== "string" ||
        typeof raw.client !== "string" ||
        typeof raw.period !== "string" ||
        typeof raw.summary !== "string" ||
        typeof raw.image !== "string" ||
        !Array.isArray(raw.tags)
      ) {
        return null;
      }

      const tags = raw.tags.filter((tag): tag is string => typeof tag === "string");
      if (tags.length === 0) {
        return null;
      }

      return {
        role: raw.role,
        client: raw.client,
        period: raw.period,
        summary: raw.summary,
        image: sanitizeExperienceImage(raw.image),
        tags,
      };
    })
    .filter((entry): entry is CreativeExperienceEntry => entry !== null);

  return normalized.length > 0 ? normalized : null;
};

export const normalizeExperienceEntries = (value: unknown): CreativeExperienceEntry[] => {
  return parseExperienceEntries(value) ?? defaultExperienceEntries;
};

export const fetchPortfolioContentFromSupabase = async (): Promise<PortfolioContent | null> => {
  const client = await getSupabaseClient();
  if (!client) {
    return null;
  }

  const config = await getSupabaseConfig();
  const contentRowId =
    config?.supabaseContentRowId || DEFAULT_SUPABASE_CONTENT_ROW_ID;
  let experienceEntriesSyncSupported = true;

  let { data, error } = await client
    .from(SUPABASE_CONTENT_TABLE)
    .select("id, projects, testimonials, experience_entries, updated_at")
    .eq("id", contentRowId)
    .maybeSingle<PortfolioContentRow>();

  if (
    error &&
    /experience_entries/i.test(error.message) &&
    /column/i.test(error.message)
  ) {
    experienceEntriesSyncSupported = false;
    const fallbackResponse = await client
      .from(SUPABASE_CONTENT_TABLE)
      .select("id, projects, testimonials, updated_at")
      .eq("id", contentRowId)
      .maybeSingle<PortfolioContentRow>();

    data = fallbackResponse.data;
    error = fallbackResponse.error;
  }

  if (error) {
    console.error("Failed to fetch portfolio content from Supabase:", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    projects: normalizeProjects(data.projects),
    testimonials: normalizeTestimonials(data.testimonials),
    experienceEntries: parseExperienceEntries(data.experience_entries) ?? undefined,
    updatedAt: typeof data.updated_at === "string" ? data.updated_at : undefined,
    experienceEntriesSyncSupported,
  };
};

export const savePortfolioContentToSupabase = async (
  content: PortfolioContent
): Promise<boolean> => {
  const client = await getSupabaseClient();
  if (!client) {
    return false;
  }

  const config = await getSupabaseConfig();
  const contentRowId =
    config?.supabaseContentRowId || DEFAULT_SUPABASE_CONTENT_ROW_ID;

  const payload: PortfolioContentRow = {
    id: contentRowId,
    projects: content.projects,
    testimonials: content.testimonials,
    experience_entries: content.experienceEntries ?? defaultExperienceEntries,
    updated_at: new Date().toISOString(),
  };

  let { error } = await client
    .from(SUPABASE_CONTENT_TABLE)
    .upsert(payload, { onConflict: "id" });

  if (
    error &&
    /experience_entries/i.test(error.message) &&
    /column/i.test(error.message)
  ) {
    const fallbackPayload = {
      id: contentRowId,
      projects: content.projects,
      testimonials: content.testimonials,
      updated_at: payload.updated_at,
    };

    const fallbackResponse = await client
      .from(SUPABASE_CONTENT_TABLE)
      .upsert(fallbackPayload, { onConflict: "id" });

    error = fallbackResponse.error;

    if (!error) {
      return false;
    }
  }

  if (error) {
    console.error("Failed to save portfolio content to Supabase:", error.message);
    return false;
  }

  return true;
};

export type PortfolioAssetKind = "images" | "videos";

export type PortfolioAssetUploadProgress = {
  bytesUploaded: number;
  bytesTotal: number;
  percentage: number;
};

type PortfolioAssetUploadOptions = {
  onProgress?: (progress: PortfolioAssetUploadProgress) => void;
};

export const uploadPortfolioAssetToCloudinary = async (
  file: File,
  kind: PortfolioAssetKind,
  options?: PortfolioAssetUploadOptions
): Promise<{ url: string; path: string; format?: string }> => {
  const folder = `portfolio/${kind}`;
  const resourceType = kind === "videos" ? "video" : "image";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("resourceType", resourceType);

  try {
    const response = await fetch("/api/cloudinary-upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(
        errorPayload?.error || `Cloudinary upload failed with status ${response.status}.`
      );
    }

    const result = (await response.json()) as {
      url: string;
      publicId: string;
      format?: string;
    };

    options?.onProgress?.({
      bytesUploaded: file.size,
      bytesTotal: file.size,
      percentage: 100,
    });

    return {
      url: result.url,
      path: result.publicId,
      format: result.format,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Cloudinary upload failed because the server could not be reached. Make sure the server is running and Cloudinary environment variables are set."
      );
    }

    throw error;
  }
};
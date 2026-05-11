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
  entries: ReadonlyArray<CreativeExperienceEntry>
) => {
  let count = 0;
  for (const entry of entries) {
    if (sanitizeExperienceImage(entry.image)) {
      count++;
    }
  }
  return count;
};

export const normalizeExperienceEntries = (
  raw: unknown
): CreativeExperienceEntry[] => {
  if (!Array.isArray(raw)) {
    return defaultExperienceEntries;
  }

  return raw
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const entry = item as Record<string, unknown>;

      return {
        role: typeof entry.role === "string" ? entry.role : "",
        client: typeof entry.client === "string" ? entry.client : "",
        period: typeof entry.period === "string" ? entry.period : "",
        summary: typeof entry.summary === "string" ? entry.summary : "",
        tags: Array.isArray(entry.tags)
          ? entry.tags.filter((tag): tag is string => typeof tag === "string")
          : [],
        image: sanitizeExperienceImage(
          typeof entry.image === "string" ? entry.image : ""
        ),
      };
    })
    .filter((entry): entry is CreativeExperienceEntry => entry !== null);
};

export const parseExperienceEntries = (value: string): CreativeExperienceEntry[] => {
  try {
    const parsed = JSON.parse(value);
    return normalizeExperienceEntries(parsed);
  } catch {
    return defaultExperienceEntries;
  }
};

export const fallbackTestimonials: Testimonial[] = [
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

export const defaultTestimonials = fallbackTestimonials;

export const normalizeTestimonials = (value: unknown): Testimonial[] => {
  if (!Array.isArray(value)) {
    return fallbackTestimonials;
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

  return normalized.length > 0 ? normalized : fallbackTestimonials;
};

export const defaultExperienceEntries: CreativeExperienceEntry[] = [
  {
    role: "Video Editor & Motion Designer",
    client: "Freelance Clients",
    period: "2024 - Present",
    summary:
      "Edit YouTube content, short-form reels, and promotional clips. Handle color work, pacing, captions, and clean audio.",
    tags: ["Premiere Pro", "After Effects", "DaVinci"],
    image: "",
  },
  {
    role: "Graphic Design & Social Assets",
    client: "Freelance Clients",
    period: "2024 - Present",
    summary:
      "Design thumbnails, banners, posters, and social media graphics with consistent brand identity.",
    tags: ["Photoshop", "Illustrator", "Canva"],
    image: "",
  },
  {
    role: "WordPress Site Builds",
    client: "Freelance Clients",
    period: "2024 - Present",
    summary:
      "Build lightweight, responsive WordPress sites with Elementor. Handle hosting setup, theme customization, and basic SEO.",
    tags: ["WordPress", "Elementor", "SEO"],
    image: "",
  },
];

export const EXPERIENCE_STORAGE_KEY = "portfolio-experience-entries";
export const EXPERIENCE_UPDATED_EVENT = "portfolio-experience-updated";
export const EXPERIENCE_CONTENT_UPDATED_AT_KEY = "portfolio-experience-updated-at";

export const PORTFOLIO_STORAGE_KEY = "portfolio-projects";
export const PORTFOLIO_UPDATED_EVENT = "portfolio-projects-updated";
export const PORTFOLIO_CONTENT_UPDATED_AT_KEY = "portfolio-content-updated-at";

export const TESTIMONIALS_STORAGE_KEY = "portfolio-testimonials";
export const TESTIMONIALS_UPDATED_EVENT = "portfolio-testimonials-updated";

export const PORTFOLIO_SYNC_CHANNEL_NAME = "portfolio-sync-channel";
export const PORTFOLIO_SYNC_REQUEST_EVENT = "request-sync";
export const PORTFOLIO_SYNC_RESPONSE_EVENT = "sync-response";

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  return supabaseInstance;
};

const supabaseConfiguredRef = { current: false };

export const ensureSupabaseConfigured = () => {
  const client = getSupabaseClient();
  if (client) {
    supabaseConfiguredRef.current = true;
  }
  return supabaseConfiguredRef.current;
};

export const isSupabaseConfigured = () => {
  if (supabaseConfiguredRef.current) return true;
  const client = getSupabaseClient();
  if (client) {
    supabaseConfiguredRef.current = true;
    return true;
  }
  return false;
};

const getCloudinaryUploadConfig = () => {
  if (typeof window === "undefined") {
    return { cloudName: "", uploadPreset: "", isConfigured: false };
  }

  const cloudName =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) || "";
  const uploadPreset =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) || "";

  return {
    cloudName: cloudName || "",
    uploadPreset: uploadPreset || "",
    isConfigured: !!(cloudName && uploadPreset),
  };
};

export type PortfolioAssetUploadProgress = {
  bytesUploaded: number;
  totalBytes: number;
};

type PortfolioAssetUploadOptions = {
  onProgress?: (progress: PortfolioAssetUploadProgress) => void;
};

export const uploadPortfolioAssetToCloudinary = async (
  file: File,
  folder: string,
  options?: PortfolioAssetUploadOptions
): Promise<{ url: string; publicId: string }> => {
  const { cloudName, uploadPreset, isConfigured } = getCloudinaryUploadConfig();

  if (!isConfigured) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your environment."
    );
  }

  const isVideo = file.type.startsWith("video/");
  const resourceType = isVideo ? "video" : "image";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);
  formData.append("filename_override", file.name);

  // For direct browser upload, use XMLHttpRequest to track upload progress
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && options?.onProgress) {
        options.onProgress({
          bytesUploaded: event.loaded,
          totalBytes: event.total,
        });
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          if (result.secure_url || result.url) {
            resolve({
              url: result.secure_url || result.url,
              publicId: result.public_id,
            });
          } else {
            reject(new Error("Cloudinary upload returned no URL."));
          }
        } catch {
          reject(new Error("Cloudinary upload returned an invalid response."));
        }
      } else {
        let errorMessage = `Cloudinary upload failed with status ${xhr.status}.`;
        try {
          const errorResult = JSON.parse(xhr.responseText);
          errorMessage = errorResult.error?.message || errorMessage;
        } catch {
          // use default error message
        }
        reject(new Error(errorMessage));
      }
    });

    xhr.addEventListener("error", () => {
      reject(
        new Error(
          "Cloudinary upload failed because the server could not be reached. Check your network connection."
        )
      );
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Cloudinary upload was aborted."));
    });

    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);
    xhr.send(formData);
  });
};

export const fetchPortfolioContentFromSupabase = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error("Portfolio data: Supabase is not configured.");
    return null;
  }

  try {
    const contentRowId =
      process.env.NEXT_PUBLIC_SUPABASE_CONTENT_ROW_ID || "main";

    const { data, error } = await supabase
      .from("portfolio_content")
      .select("*")
      .eq("id", contentRowId)
      .maybeSingle();

    if (error) {
      console.error("Portfolio data: Could not fetch content from Supabase.", error);
      return null;
    }

    if (!data) {
      console.warn("Portfolio data: No content row found in Supabase.");
      return null;
    }

    const rawExperience = data.experience || data.experience_entries || null;
    const hasExperienceColumn = "experience" in data || "experience_entries" in data;

    return {
      projects: data.projects || null,
      testimonials: data.testimonials || null,
      experience: data.experience || null,
      experienceEntries: rawExperience,
      experienceEntriesSyncSupported: hasExperienceColumn,
      updatedAt: data.updated_at || null,
    };
  } catch (error) {
    console.error("Portfolio data: Failed to fetch from Supabase:", error);
    return null;
  }
};

export const savePortfolioContentToSupabase = async (payload: {
  projects: PortfolioProjects;
  testimonials: Testimonial[];
  experienceEntries: CreativeExperienceEntry[];
}) => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error("Portfolio data: Cannot save to Supabase.");
    return false;
  }

  try {
    const contentRowId =
      process.env.NEXT_PUBLIC_SUPABASE_CONTENT_ROW_ID || "main";
    const now = new Date().toISOString();

    const { error } = await supabase.from("portfolio_content").upsert(
      {
        id: contentRowId,
        projects: payload.projects,
        testimonials: payload.testimonials,
        experience: payload.experienceEntries,
        updated_at: now,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Portfolio data: Could not save to Supabase.", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Portfolio data: Failed to save to Supabase:", error);
    return false;
  }
};

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import {
  countUsableExperienceImages,
  type CreativeExperienceEntry,
  defaultExperienceEntries,
  EXPERIENCE_CONTENT_UPDATED_AT_KEY,
  EXPERIENCE_STORAGE_KEY,
  EXPERIENCE_UPDATED_EVENT,
  normalizeExperienceEntries,
  parseExperienceEntries,
  sanitizeExperienceImage,
  ensureSupabaseConfigured,
  PORTFOLIO_CONTENT_UPDATED_AT_KEY,
  PORTFOLIO_SYNC_CHANNEL_NAME,
  PORTFOLIO_STORAGE_KEY,
  PORTFOLIO_UPDATED_EVENT,
  TESTIMONIALS_STORAGE_KEY,
  TESTIMONIALS_UPDATED_EVENT,
  fetchPortfolioContentFromSupabase,
  isSupabaseConfigured,
  savePortfolioContentToSupabase,
  uploadPortfolioAssetToCloudinary,
} from "@/lib/portfolio-data";
import { getCloudinaryConfig } from "@/lib/cloudinary-config";

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

type PortfolioCategory = "Graphic Design" | "Video Edit" | "Websites";
type PortfolioProjects = Record<PortfolioCategory, PortfolioProject[]>;

type ProjectForm = {
  title: string;
  description: string;
  image: string;
  designLink: string;
  videoCategory: string;
  videoParentLabel: string;
  videoAspectRatio: "landscape" | "portrait";
  videoUrls: string[];
  videoPosterUrls: string[];
  showDetailsModal: boolean;
  detailsTitle: string;
  detailsDescription: string;
  detailsHeroImage: string;
  galleryImages: string[];
};

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

type TestimonialForm = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

type VideoProjectAspectRatio = "landscape" | "portrait";

const categories: PortfolioCategory[] = [
  "Graphic Design",
  "Video Edit",
  "Websites",
];

const STUDIO_AUTH_KEY = "portfolio-studio-auth";
const STUDIO_EMAIL_STORAGE_KEY = "portfolio-studio-email";
const STUDIO_PASSWORD_STORAGE_KEY = "portfolio-studio-password";
const DEFAULT_STUDIO_EMAIL = "aiakosedt@gmail.com";
const DEFAULT_STUDIO_PASSWORD = "Wence_dante24";
const MAX_IMAGE_UPLOAD_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_UPLOAD_SIZE = 100 * 1024 * 1024;
const MAX_VIDEO_UPLOAD_SIZE_MB = Math.floor(MAX_VIDEO_UPLOAD_SIZE / (1024 * 1024));
const VIDEO_METADATA_TIMEOUT_MS = 12000;

type StudioCredentials = {
  email: string;
  password: string;
};

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

const getVideoProjectParentLabel = (project: PortfolioProject) => {
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

const verifyVideoSourceMatchesAspectRatio = async (
  source: string,
  expectedAspectRatio: VideoProjectAspectRatio
) => {
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
};

const verifyVideoFileMatchesAspectRatio = async (
  file: File,
  expectedAspectRatio: VideoProjectAspectRatio
) => {
  const objectUrl = URL.createObjectURL(file);

  try {
    await verifyVideoSourceMatchesAspectRatio(objectUrl, expectedAspectRatio);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const validateVideoSourcesForProject = async (
  videoSources: string[],
  expectedAspectRatio: VideoProjectAspectRatio
) => {
  for (const [index, source] of videoSources.entries()) {
    try {
      await verifyVideoSourceMatchesAspectRatio(source, expectedAspectRatio);
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

const isMp4VideoSource = (value: string) =>
  /^data:video\/mp4/i.test(value) || /\.mp4(?:[?#].*)?$/i.test(value);

const isMp4VideoFile = (file: File) => {
  const fileName = file.name.trim().toLowerCase();
  return file.type === "video/mp4" || fileName.endsWith(".mp4");
};

const getProjectVideoUrls = (project: PortfolioProject) => {
  const uploadedVideoUrls = Array.isArray(project.videoUrls)
    ? project.videoUrls
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && isMp4VideoSource(item))
    : [];

  if (uploadedVideoUrls.length > 0) {
    return uploadedVideoUrls;
  }

  const trimmedVideoUrl = project.videoUrl?.trim();
  if (trimmedVideoUrl && isMp4VideoSource(trimmedVideoUrl)) {
    return [trimmedVideoUrl];
  }

  const trimmedLink = project.designLink?.trim();
  if (trimmedLink && trimmedLink !== "#" && isMp4VideoSource(trimmedLink)) {
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

const getProjectVideoUrl = (project: PortfolioProject) => {
  return getProjectVideoUrls(project)[0] || "";
};

const fallbackProjects: PortfolioProjects = {
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

const fallbackTestimonials: Testimonial[] = [
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

function createEmptyProjectForm(): ProjectForm {
  return {
    title: "",
    description: "",
    image: "",
    designLink: "",
    videoCategory: "",
    videoParentLabel: "",
    videoAspectRatio: "landscape",
    videoUrls: [""],
    videoPosterUrls: [""],
    showDetailsModal: true,
    detailsTitle: "",
    detailsDescription: "",
    detailsHeroImage: "",
    galleryImages: [""],
  };
}

function createEmptyTestimonialForm(): TestimonialForm {
  return {
    quote: "",
    name: "",
    designation: "",
    src: "",
  };
}

function getInitialExperienceEntries(): CreativeExperienceEntry[] {
  if (typeof window === "undefined") return defaultExperienceEntries;
  try {
    const raw = window.localStorage.getItem(EXPERIENCE_STORAGE_KEY);
    if (!raw) return defaultExperienceEntries;
    return normalizeExperienceEntries(JSON.parse(raw));
  } catch {
    return defaultExperienceEntries;
  }
}

function getStoredExperienceUpdatedAt() {
  if (typeof window === "undefined") return "";

  return (
    window.localStorage.getItem(EXPERIENCE_CONTENT_UPDATED_AT_KEY) ||
    window.localStorage.getItem(PORTFOLIO_CONTENT_UPDATED_AT_KEY) ||
    ""
  );
}

function normalizeProjects(value: unknown): PortfolioProjects {
  if (!value || typeof value !== "object") {
    return fallbackProjects;
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
}

function normalizeTestimonials(value: unknown): Testimonial[] {
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
}

function toForm(project: PortfolioProject): ProjectForm {
  const videoUrls = getProjectVideoUrls(project);
  const hasVideoUrls = videoUrls.length > 0;
  const videoPosterUrls = getProjectVideoPosterUrls(project, hasVideoUrls ? videoUrls.length : 1);

  return {
    title: project.title,
    description: project.description,
    image: project.image,
    designLink: project.designLink,
    videoCategory: project.videoCategory || "",
    videoParentLabel: getVideoProjectParentLabel(project),
    videoAspectRatio: getVideoProjectAspectRatio(project),
    videoUrls: hasVideoUrls ? videoUrls : [""],
    videoPosterUrls: hasVideoUrls ? videoPosterUrls : [videoPosterUrls[0] || ""],
    showDetailsModal: project.showDetailsModal ?? false,
    detailsTitle: project.details?.title || "",
    detailsDescription: project.details?.description || "",
    detailsHeroImage: project.details?.heroImage || "",
    galleryImages:
      project.details?.galleryImages && project.details.galleryImages.length > 0
        ? project.details.galleryImages
        : [""],
  };
}

function toProject(form: ProjectForm, category: PortfolioCategory): PortfolioProject {
  const trimmedTitle = form.title.trim();
  const trimmedDescription = form.description.trim();
  const trimmedImage = form.image.trim();
  const trimmedLink = form.designLink.trim();
  const trimmedVideoCategory = form.videoCategory.trim();
  const trimmedVideoParentLabel = form.videoParentLabel.trim();
  const trimmedVideoAspectRatio: VideoProjectAspectRatio =
    form.videoAspectRatio === "portrait" ? "portrait" : "landscape";
  const shouldEnableDetailsModal = category !== "Video Edit" && form.showDetailsModal;
  const trimmedVideoEntries = form.videoUrls
    .map((item, index) => ({
      videoUrl: item.trim(),
      posterUrl: form.videoPosterUrls[index]?.trim() || "",
    }))
    .filter((entry) => entry.videoUrl.length > 0 && isMp4VideoSource(entry.videoUrl));
  const trimmedVideoUrls = trimmedVideoEntries.map((entry) => entry.videoUrl);
  const trimmedVideoPosterUrls = trimmedVideoEntries.map((entry) => entry.posterUrl);
  const galleryImages = form.galleryImages
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const project: PortfolioProject = {
    title: trimmedTitle || "Untitled Project",
    description: trimmedDescription || "Project description will be added soon.",
    image: trimmedImage || "/comradz.png",
    designLink: trimmedLink || "#",
    showDetailsModal: shouldEnableDetailsModal,
  };

  if (category === "Video Edit") {
    project.videoCategory =
      trimmedVideoCategory || trimmedTitle || DEFAULT_VIDEO_EDIT_GROUP;
    project.videoAspectRatio = trimmedVideoAspectRatio;
    if (trimmedVideoParentLabel) {
      project.videoParentLabel = trimmedVideoParentLabel;
    }
    if (trimmedVideoUrls.length > 0) {
      project.videoUrls = trimmedVideoUrls;
      project.videoUrl = trimmedVideoUrls[0];
      if (trimmedVideoPosterUrls.some((item) => item.length > 0)) {
        project.videoPosterUrls = trimmedVideoPosterUrls;
      }
    }
  }

  if (shouldEnableDetailsModal) {
    project.details = {
      title: form.detailsTitle.trim() || trimmedTitle || "Project Details",
      description:
        form.detailsDescription.trim() ||
        trimmedDescription ||
        "Additional project details will be added soon.",
      heroImage: form.detailsHeroImage.trim() || trimmedImage || "/comradz2.png",
      galleryImages:
        galleryImages.length > 0 ? galleryImages : [trimmedImage || "/comradz.png"],
    };
  }

  return project;
}

function toTestimonial(form: TestimonialForm): Testimonial {
  return {
    quote:
      form.quote.trim() ||
      "Great collaboration and a strong final result from start to finish.",
    name: form.name.trim() || "Anonymous Client",
    designation: form.designation.trim() || "Creative Partner",
    src:
      form.src.trim() ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop",
  };
}

function getDefaultStudioCredentials(): StudioCredentials {
  return {
    email: DEFAULT_STUDIO_EMAIL,
    password: DEFAULT_STUDIO_PASSWORD,
  };
}

function getStoredStudioCredentials(): StudioCredentials {
  if (typeof window === "undefined") {
    return getDefaultStudioCredentials();
  }

  try {
    const storedEmail = window.localStorage.getItem(STUDIO_EMAIL_STORAGE_KEY)?.trim();
    const storedPassword = window.localStorage.getItem(STUDIO_PASSWORD_STORAGE_KEY);

    return {
      email: storedEmail || DEFAULT_STUDIO_EMAIL,
      password: storedPassword || DEFAULT_STUDIO_PASSWORD,
    };
  } catch {
    return getDefaultStudioCredentials();
  }
}

type ImageFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  previewHeightClassName?: string;
};

function ImageField({
  id,
  label,
  value,
  placeholder,
  onChange,
  previewHeightClassName = "h-36",
}: ImageFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }

    if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
      setUploadError("Please keep image uploads under 5 MB for smoother saving.");
      return;
    }

    setIsUploading(true);

    try {
      const asset = await uploadPortfolioAssetToCloudinary(file, "portfolio/images");
      onChange(asset.url);
      setUploadError("");
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "That image could not be uploaded."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm text-white/85">
        {label}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
      />

      <label
        htmlFor={`${id}-upload`}
        onDragEnter={() => setIsDragging(true)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 text-center transition-all ${
          isDragging
            ? "border-[#0099ff]/70 bg-[#0099ff]/12"
            : "border-white/15 bg-black/20 hover:border-[#0099ff]/45 hover:bg-[#0099ff]/8"
        } ${isUploading ? "pointer-events-none opacity-70" : ""}`}
      >
        <input
          id={`${id}-upload`}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleInputChange}
          disabled={isUploading}
        />
        <span className="text-sm font-medium text-white/90">
          {isUploading ? "Uploading image..." : "Drag an image here or click to upload"}
        </span>
        <span className="mt-1 text-xs text-white/55">
          Uploaded images are saved to Cloudinary. You can still paste a path or URL above.
        </span>
      </label>

      {uploadError && <p className="text-xs text-amber-200">{uploadError}</p>}

      {value && (
        <div className="overflow-hidden rounded-xl border border-white/15 bg-black/30">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
              Preview
            </p>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[11px] uppercase tracking-[0.14em] text-white/55 transition-colors hover:text-white"
            >
              Clear
            </button>
          </div>
          <img
            src={value}
            alt={`${label} preview`}
            className={`w-full object-cover ${previewHeightClassName}`}
          />
        </div>
      )}
    </div>
  );
}

type VideoFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  expectedAspectRatio?: VideoProjectAspectRatio;
  previewHeightClassName?: string;
};

function VideoField({
  id,
  label,
  value,
  placeholder,
  onChange,
  expectedAspectRatio = "landscape",
  previewHeightClassName = "h-40",
}: VideoFieldProps) {
  const trimmedValue = value.trim();
  const hasValue = trimmedValue.length > 0;
  const hasMp4Value = isMp4VideoSource(trimmedValue);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    const fileName = file.name.trim().toLowerCase();
    const isMp4File = file.type === "video/mp4" || fileName.endsWith(".mp4");

    if (!isMp4File) {
      setUploadError("Please choose an MP4 video file.");
      return;
    }

    if (file.size > MAX_VIDEO_UPLOAD_SIZE) {
      setUploadError(`Please keep MP4 uploads under ${MAX_VIDEO_UPLOAD_SIZE_MB} MB.`);
      return;
    }

    try {
      await verifyVideoFileMatchesAspectRatio(file, expectedAspectRatio);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "The video ratio could not be verified."
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(50);

    try {
      const asset = await uploadPortfolioAssetToCloudinary(file, "portfolio/videos");
      onChange(asset.url);
      setUploadProgress(100);
      setUploadError("");
    } catch (error) {
      setUploadProgress(null);
      setUploadError(
        error instanceof Error ? error.message : "That MP4 could not be uploaded."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm text-white/85">
        {label}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
      />

      <p className="text-xs leading-relaxed text-white/55">
        Use a direct `.mp4` path, a public URL, or upload one below. This project is set to{" "}
        {getVideoAspectRatioLabel(expectedAspectRatio)} only.
      </p>

      <label
        htmlFor={`${id}-upload`}
        onDragEnter={() => setIsDragging(true)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 text-center transition-all ${
          isDragging
            ? "border-[#0099ff]/70 bg-[#0099ff]/12"
            : "border-white/15 bg-black/20 hover:border-[#0099ff]/45 hover:bg-[#0099ff]/8"
        } ${isUploading ? "pointer-events-none opacity-70" : ""}`}
      >
        <input
          id={`${id}-upload`}
          type="file"
          accept="video/mp4,.mp4"
          className="sr-only"
          onChange={handleInputChange}
          disabled={isUploading}
        />
        <span className="text-sm font-medium text-white/90">
          {isUploading ? "Uploading MP4..." : "Drag an MP4 here or click to upload"}
        </span>
        <span className="mt-1 text-xs text-white/55">
          Uploaded videos are saved to Cloudinary. Max {MAX_VIDEO_UPLOAD_SIZE_MB} MB.
        </span>
      </label>

      {uploadError && <p className="text-xs text-amber-200">{uploadError}</p>}

      {uploadProgress !== null && (
        <div className="rounded-xl border border-[#8fdcff]/18 bg-[#071722]/80 px-3 py-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-medium text-white/82">
              {isUploading ? "Uploading to Cloudinary" : "Upload complete"}
            </span>
            <span className="font-semibold text-[#8fdcff]">{uploadProgress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#36d1ff,#0099ff)] transition-[width] duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {hasValue ? (
        hasMp4Value ? (
          <div className="overflow-hidden rounded-xl border border-white/15 bg-black/30">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                MP4 Preview
              </p>
              <button
                type="button"
                onClick={() => {
                  setUploadError("");
                  setUploadProgress(null);
                  onChange("");
                }}
                className="text-[11px] uppercase tracking-[0.14em] text-white/55 transition-colors hover:text-white"
              >
                Clear
              </button>
            </div>
            <video
              src={trimmedValue}
              className={`w-full object-cover ${previewHeightClassName}`}
              controls
              playsInline
              muted
              preload="metadata"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-4 text-sm leading-relaxed text-amber-100">
            Use a direct `.mp4` file path or URL for Video Edit projects.
          </div>
        )
      ) : null}
    </div>
  );
}

export default function StudioPage() {
  const router = useRouter();
  const [supabaseStatus, setSupabaseStatus] = useState<
    "checking" | "enabled" | "disabled"
  >(() => (isSupabaseConfigured() ? "enabled" : "checking"));
  const [cloudinaryStatus, setCloudinaryStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [studioCredentials, setStudioCredentials] = useState<StudioCredentials>(() =>
    getStoredStudioCredentials()
  );
  const [email, setEmail] = useState(() => getStoredStudioCredentials().email);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(STUDIO_AUTH_KEY) === "1";
  });
  const [loginError, setLoginError] = useState("");
  const [loginNotice, setLoginNotice] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState(() => getStoredStudioCredentials().email);
  const [resetCode, setResetCode] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmNextPassword, setConfirmNextPassword] = useState("");
  const [resetState, setResetState] = useState<{
    status: "idle" | "submitting" | "success" | "error";
    message: string;
  }>({
    status: "idle",
    message: "",
  });

  const [projects, setProjects] = useState<PortfolioProjects>(() => {
    if (typeof window === "undefined") return fallbackProjects;
    try {
      const raw = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (!raw) return fallbackProjects;
      return normalizeProjects(JSON.parse(raw));
    } catch {
      return fallbackProjects;
    }
  });
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>("Graphic Design");
  const [form, setForm] = useState<ProjectForm>(createEmptyProjectForm());
  const [isBulkVideoDragging, setIsBulkVideoDragging] = useState(false);
  const [isBulkVideoUploading, setIsBulkVideoUploading] = useState(false);
  const [bulkVideoUploadProgress, setBulkVideoUploadProgress] = useState<number | null>(null);
  const [bulkVideoUploadMessage, setBulkVideoUploadMessage] = useState("");
  const [bulkVideoUploadError, setBulkVideoUploadError] = useState("");
  const [projectFormError, setProjectFormError] = useState("");
  const [isProjectSubmitting, setIsProjectSubmitting] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    if (typeof window === "undefined") return fallbackTestimonials;
    try {
      const raw = window.localStorage.getItem(TESTIMONIALS_STORAGE_KEY);
      if (!raw) return fallbackTestimonials;
      return normalizeTestimonials(JSON.parse(raw));
    } catch {
      return fallbackTestimonials;
    }
  });
  const [experienceEntries, setExperienceEntries] = useState<CreativeExperienceEntry[]>(
    getInitialExperienceEntries
  );
  const [savedExperienceEntries, setSavedExperienceEntries] = useState<
    CreativeExperienceEntry[]
  >(getInitialExperienceEntries);
  const [isSavingExperience, setIsSavingExperience] = useState(false);
  const [experienceSaveNotice, setExperienceSaveNotice] = useState<{
    tone: "success" | "warning";
    message: string;
  } | null>(null);
  const [testimonialForm, setTestimonialForm] = useState<TestimonialForm>(
    createEmptyTestimonialForm()
  );
  const [editingTestimonialIndex, setEditingTestimonialIndex] = useState<number | null>(
    null
  );
  const projectPreview = useMemo(() => toProject(form, activeCategory), [form, activeCategory]);
  const testimonialPreview = useMemo(
    () => toTestimonial(testimonialForm),
    [testimonialForm]
  );
  const experienceEntriesRef = useRef(experienceEntries);
  const hasUnsavedExperienceChanges = useMemo(
    () =>
      JSON.stringify(experienceEntries) !== JSON.stringify(savedExperienceEntries),
    [experienceEntries, savedExperienceEntries]
  );

  useEffect(() => {
    experienceEntriesRef.current = experienceEntries;
  }, [experienceEntries]);

  useEffect(() => {
    const storedCredentials = getStoredStudioCredentials();
    setStudioCredentials(storedCredentials);
    setEmail((previousEmail) => previousEmail || storedCredentials.email);
    setResetEmail(storedCredentials.email);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STUDIO_EMAIL_STORAGE_KEY, storedCredentials.email);
      window.localStorage.setItem(
        STUDIO_PASSWORD_STORAGE_KEY,
        storedCredentials.password
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(PORTFOLIO_STORAGE_KEY)) {
      window.localStorage.setItem(
        PORTFOLIO_STORAGE_KEY,
        JSON.stringify(projects)
      );
    }
  }, [projects]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(EXPERIENCE_STORAGE_KEY)) {
      window.localStorage.setItem(
        EXPERIENCE_STORAGE_KEY,
        JSON.stringify(experienceEntries)
      );
    }
  }, [experienceEntries]);

  useEffect(() => {
    let cancelled = false;
    const syncFromSupabase = async () => {
      const configured = await ensureSupabaseConfigured();
      if (cancelled) return;

      setSupabaseStatus(configured ? "enabled" : "disabled");
      if (!configured) return;

      const remoteContent = await fetchPortfolioContentFromSupabase();
      if (!remoteContent || cancelled) return;

      const localPortfolioUpdatedAtValue =
        typeof window !== "undefined"
          ? window.localStorage.getItem(PORTFOLIO_CONTENT_UPDATED_AT_KEY)
          : null;
      const localExperienceUpdatedAtValue = getStoredExperienceUpdatedAt();
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
      const shouldApplyRemoteProjectsAndTestimonials = hasRemoteUpdatedAt
        ? !hasLocalPortfolioUpdatedAt || remoteUpdatedAt >= localPortfolioUpdatedAt
        : !hasLocalPortfolioUpdatedAt;
      const remoteExperienceEntries =
        remoteContent.experienceEntriesSyncSupported !== false
          ? parseExperienceEntries(remoteContent.experienceEntries)
          : null;
      const remoteExperienceImageCount = countUsableExperienceImages(remoteExperienceEntries ?? []);
      const localExperienceImageCount = countUsableExperienceImages(experienceEntriesRef.current);
      const shouldKeepLocalExperienceImages =
        remoteExperienceEntries !== null &&
        remoteExperienceImageCount < localExperienceImageCount;
      const shouldApplyRemoteExperience =
        remoteExperienceEntries !== null &&
        !shouldKeepLocalExperienceImages &&
        (hasRemoteUpdatedAt
          ? !hasLocalExperienceUpdatedAt || remoteUpdatedAt >= localExperienceUpdatedAt
          : !hasLocalExperienceUpdatedAt);

      if (!shouldApplyRemoteProjectsAndTestimonials && !shouldApplyRemoteExperience) {
        return;
      }

      if (shouldApplyRemoteProjectsAndTestimonials) {
        const normalizedProjects = normalizeProjects(remoteContent.projects);
        const normalizedTestimonials = normalizeTestimonials(remoteContent.testimonials);

        setProjects(normalizedProjects);
        setTestimonials(normalizedTestimonials);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            PORTFOLIO_STORAGE_KEY,
            JSON.stringify(normalizedProjects)
          );
          window.localStorage.setItem(
            TESTIMONIALS_STORAGE_KEY,
            JSON.stringify(normalizedTestimonials)
          );
          if (remoteContent.updatedAt) {
            persistPortfolioUpdatedAt(remoteContent.updatedAt);
          }
          window.dispatchEvent(new Event(PORTFOLIO_UPDATED_EVENT));
          window.dispatchEvent(new Event(TESTIMONIALS_UPDATED_EVENT));
        }
      }

      if (shouldApplyRemoteExperience && remoteExperienceEntries) {
        setExperienceEntries(remoteExperienceEntries);
        setSavedExperienceEntries(remoteExperienceEntries);
        experienceEntriesRef.current = remoteExperienceEntries;

        if (typeof window !== "undefined") {
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
        }
      }
    };

    void syncFromSupabase();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(TESTIMONIALS_STORAGE_KEY)) {
      window.localStorage.setItem(
        TESTIMONIALS_STORAGE_KEY,
        JSON.stringify(testimonials)
      );
    }
  }, [testimonials]);

  useEffect(() => {
    const config = getCloudinaryConfig();
    setCloudinaryStatus(config.isConfigured ? "connected" : "disconnected");
  }, []);

  const activeProjects = useMemo(
    () => projects[activeCategory] || [],
    [projects, activeCategory]
  );
  const isVideoEditCategory = activeCategory === "Video Edit";
  const projectPreviewVideoUrls = getProjectVideoUrls(projectPreview);
  const projectPreviewVideoPosterUrls = getProjectVideoPosterUrls(
    projectPreview,
    projectPreviewVideoUrls.length || 1
  );
  const projectPreviewPosterImage = projectPreviewVideoPosterUrls[0] || "";
  const projectPreviewVideoPosterCount = projectPreviewVideoPosterUrls.filter(
    (item) => item.length > 0
  ).length;
  const projectPreviewVideoUrl = getProjectVideoUrl(projectPreview);
  const projectPreviewVideoCategory = getVideoProjectCategory(projectPreview);
  const projectPreviewVideoParentLabel = getVideoProjectParentLabel(projectPreview);
  const projectPreviewVideoAspectRatio = getVideoProjectAspectRatio(projectPreview);
  const projectPreviewCardImage = projectPreview.image.trim() || projectPreviewPosterImage;
  const projectPreviewVideoFrameClass =
    projectPreviewVideoAspectRatio === "portrait"
      ? "mx-auto aspect-[9/16] max-w-[260px] sm:max-w-[320px]"
      : "aspect-[16/9]";

  const persistStudioCredentials = (nextCredentials: StudioCredentials) => {
    setStudioCredentials(nextCredentials);

    if (typeof window === "undefined") return;
    window.localStorage.setItem(STUDIO_EMAIL_STORAGE_KEY, nextCredentials.email);
    window.localStorage.setItem(
      STUDIO_PASSWORD_STORAGE_KEY,
      nextCredentials.password
    );
  };

  const persistPortfolioUpdatedAt = (nextUpdatedAt: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PORTFOLIO_CONTENT_UPDATED_AT_KEY, nextUpdatedAt);
  };

  const persistExperienceUpdatedAt = (nextUpdatedAt: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(EXPERIENCE_CONTENT_UPDATED_AT_KEY, nextUpdatedAt);
  };

  const persistProjects = (nextProjects: PortfolioProjects) => {
    setProjects(nextProjects);
    if (typeof window === "undefined") return;
    persistPortfolioUpdatedAt(new Date().toISOString());
    window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(nextProjects));
    window.dispatchEvent(new Event(PORTFOLIO_UPDATED_EVENT));
    void savePortfolioContentToSupabase({
      projects: nextProjects,
      testimonials,
      experienceEntries: experienceEntriesRef.current,
    });
  };

  const persistTestimonials = (nextTestimonials: Testimonial[]) => {
    setTestimonials(nextTestimonials);
    if (typeof window === "undefined") return;
    persistPortfolioUpdatedAt(new Date().toISOString());
    window.localStorage.setItem(
      TESTIMONIALS_STORAGE_KEY,
      JSON.stringify(nextTestimonials)
    );
    window.dispatchEvent(new Event(TESTIMONIALS_UPDATED_EVENT));
    void savePortfolioContentToSupabase({
      projects,
      testimonials: nextTestimonials,
      experienceEntries: experienceEntriesRef.current,
    });
  };

  const persistExperienceDraftLocally = (
    nextExperienceEntries: CreativeExperienceEntry[],
    updatedAt = new Date().toISOString()
  ) => {
    if (typeof window === "undefined") return;

    persistExperienceUpdatedAt(updatedAt);
    window.localStorage.setItem(
      EXPERIENCE_STORAGE_KEY,
      JSON.stringify(nextExperienceEntries)
    );
    window.dispatchEvent(new Event(EXPERIENCE_UPDATED_EVENT));

    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(PORTFOLIO_SYNC_CHANNEL_NAME);
      channel.postMessage({
        type: "experience-updated",
        experienceEntries: nextExperienceEntries,
        updatedAt,
      });
      channel.close();
    }
  };

  const persistExperienceEntries = async (
    nextExperienceEntries: CreativeExperienceEntry[]
  ) => {
    const sanitizedExperienceEntries = nextExperienceEntries.map((entry) => ({
      ...entry,
      image: sanitizeExperienceImage(entry.image),
    }));

    setExperienceEntries(sanitizedExperienceEntries);
    setSavedExperienceEntries(sanitizedExperienceEntries);
    experienceEntriesRef.current = sanitizedExperienceEntries;
    if (typeof window === "undefined") return;
    const updatedAt = new Date().toISOString();
    persistPortfolioUpdatedAt(updatedAt);
    persistExperienceUpdatedAt(updatedAt);
    window.localStorage.setItem(
      EXPERIENCE_STORAGE_KEY,
      JSON.stringify(sanitizedExperienceEntries)
    );
    window.dispatchEvent(new Event(EXPERIENCE_UPDATED_EVENT));
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(PORTFOLIO_SYNC_CHANNEL_NAME);
      channel.postMessage({
        type: "experience-updated",
        experienceEntries: sanitizedExperienceEntries,
        updatedAt,
      });
      channel.close();
    }
    return savePortfolioContentToSupabase({
      projects,
      testimonials,
      experienceEntries: sanitizedExperienceEntries,
    });
  };

  const handleExperienceImageChange = (index: number, value: string) => {
    const nextEntries = experienceEntriesRef.current.map((item, itemIndex) =>
      itemIndex === index ? { ...item, image: sanitizeExperienceImage(value) } : item
    );

    experienceEntriesRef.current = nextEntries;
    setExperienceEntries(nextEntries);
    persistExperienceDraftLocally(nextEntries);
    setExperienceSaveNotice(null);
  };

  const handleSaveExperience = async () => {
    setIsSavingExperience(true);
    setExperienceSaveNotice(null);

    const nextExperienceEntries = experienceEntriesRef.current;
    const didSyncToSupabase = await persistExperienceEntries(nextExperienceEntries);
    let didVerifyRemoteExperience = didSyncToSupabase;
    let didVerifyLocalExperience = false;

    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(EXPERIENCE_STORAGE_KEY);
        didVerifyLocalExperience =
          raw !== null &&
          JSON.stringify(normalizeExperienceEntries(JSON.parse(raw))) ===
            JSON.stringify(nextExperienceEntries);
      } catch {
        didVerifyLocalExperience = false;
      }
    }

    if (didSyncToSupabase) {
      const remoteContent = await fetchPortfolioContentFromSupabase();
      const remoteExperienceEntries = parseExperienceEntries(
        remoteContent?.experienceEntries
      );
      didVerifyRemoteExperience =
        remoteContent?.experienceEntriesSyncSupported !== false &&
        remoteExperienceEntries !== null &&
        JSON.stringify(remoteExperienceEntries) === JSON.stringify(nextExperienceEntries);
    }

    setExperienceSaveNotice(
      didVerifyLocalExperience && didVerifyRemoteExperience
        ? {
            tone: "success",
            message: "Experience changes saved.",
          }
        : didVerifyLocalExperience
          ? {
              tone: "warning",
              message:
                "Experience changes saved locally, but Supabase is not saving experience entries yet. Run the latest SQL in supabase/schema.sql to add the experience_entries column.",
            }
        : {
            tone: "warning",
            message:
              "Experience changes did not finish saving correctly. Try saving once more after the image preview appears.",
          }
    );
    setIsSavingExperience(false);
  };

  const handleResetExperience = () => {
    setExperienceEntries(savedExperienceEntries);
    setExperienceSaveNotice(null);
  };

  const experienceSection = (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 md:p-5 space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Experience</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/65">
            Update the image shown on each homepage experience card. Save when
            you&apos;re done so the About section uses the latest thumbnails.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="flex flex-wrap gap-2">
            {hasUnsavedExperienceChanges ? (
              <button
                type="button"
                onClick={handleResetExperience}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
              >
                Reset
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleSaveExperience}
              disabled={!hasUnsavedExperienceChanges || isSavingExperience}
              className="rounded-lg bg-[#0099ff] px-4 py-2 text-sm font-semibold hover:bg-[#00a8ff] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingExperience ? "Saving Experience..." : "Save Experience"}
            </button>
          </div>

          {hasUnsavedExperienceChanges ? (
            <p className="text-xs text-amber-200">Unsaved changes in experience.</p>
          ) : experienceSaveNotice ? (
            <p
              className={`text-xs ${
                experienceSaveNotice.tone === "success"
                  ? "text-emerald-300"
                  : "text-amber-200"
              }`}
            >
              {experienceSaveNotice.message}
            </p>
          ) : (
            <p className="text-xs text-white/45">
              Image changes update locally right away. Click save to sync them everywhere.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {experienceEntries.map((entry, index) => (
          <div
            key={`${entry.client}-${entry.role}`}
            className="rounded-2xl border border-white/15 bg-black/25 p-4 space-y-4"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                Experience {index + 1}
              </p>
              <h3 className="mt-2 text-base font-semibold text-white">{entry.client}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8cdfff]">
                {entry.role}
              </p>
              <p className="mt-2 text-xs text-white/55">{entry.period}</p>
            </div>

            <ImageField
              id={`experience-image-${index}`}
              label="Card image"
              value={entry.image}
              onChange={(value) => handleExperienceImageChange(index, value)}
              placeholder="Image path or URL for this experience card"
              previewHeightClassName="h-40"
            />

            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs leading-relaxed text-white/68">{entry.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span
                    key={`${entry.client}-${tag}`}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/58"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      email.trim().toLowerCase() === studioCredentials.email.trim().toLowerCase() &&
      password === studioCredentials.password
    ) {
      setIsAuthenticated(true);
      setLoginError("");
      setLoginNotice("");
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(STUDIO_AUTH_KEY, "1");
      }
      return;
    }

    setLoginNotice("");
    setLoginError("Invalid email or password.");
  };

  const handleBackToHome = () => {
    if (typeof window !== "undefined") {
      window.location.assign("/");
      return;
    }

    router.push("/");
  };

  const openForgotPassword = () => {
    setShowForgotPassword(true);
    setResetEmail(studioCredentials.email);
    setResetCode("");
    setNextPassword("");
    setConfirmNextPassword("");
    setResetState({
      status: "idle",
      message: "",
    });
    setLoginError("");
    setLoginNotice("");
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setResetEmail(studioCredentials.email);
    setResetCode("");
    setNextPassword("");
    setConfirmNextPassword("");
    setResetState({
      status: "idle",
      message: "",
    });
  };

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedResetEmail = resetEmail.trim().toLowerCase();
    const normalizedStudioEmail = studioCredentials.email.trim().toLowerCase();

    if (normalizedResetEmail !== normalizedStudioEmail) {
      setResetState({
        status: "error",
        message: "Use the Studio email address to reset your password.",
      });
      return;
    }

    if (nextPassword.length < 8) {
      setResetState({
        status: "error",
        message: "Choose a password with at least 8 characters.",
      });
      return;
    }

    if (nextPassword !== confirmNextPassword) {
      setResetState({
        status: "error",
        message: "The new password and confirmation do not match.",
      });
      return;
    }

    setResetState({
      status: "submitting",
      message: "Checking your recovery code...",
    });

    try {
      const response = await fetch("/api/studio/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim(),
          resetCode: resetCode.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setResetState({
          status: "error",
          message: payload?.error || "That recovery code was not accepted.",
        });
        return;
      }

      const updatedCredentials: StudioCredentials = {
        email: studioCredentials.email,
        password: nextPassword,
      };

      persistStudioCredentials(updatedCredentials);
      setPassword("");
      setEmail(updatedCredentials.email);
      setShowForgotPassword(false);
      setResetCode("");
      setNextPassword("");
      setConfirmNextPassword("");
      setResetState({
        status: "success",
        message: "Password changed.",
      });
      setLoginError("");
      setLoginNotice("Password changed. Sign in with your new Studio password.");
    } catch {
      setResetState({
        status: "error",
        message: "The password reset check failed. Please try again.",
      });
    }
  };

  const resetForm = () => {
    setForm(createEmptyProjectForm());
    setIsBulkVideoDragging(false);
    setIsBulkVideoUploading(false);
    setBulkVideoUploadProgress(null);
    setBulkVideoUploadMessage("");
    setBulkVideoUploadError("");
    setProjectFormError("");
    setIsProjectSubmitting(false);
    setEditingIndex(null);
  };

  const appendVideoUrlsToForm = (videoUrls: string[]) => {
    if (videoUrls.length === 0) {
      return;
    }

    setForm((prev) => {
      const existingVideoEntries = prev.videoUrls
        .map((item, index) => ({
          videoUrl: item.trim(),
          posterUrl: prev.videoPosterUrls[index]?.trim() || "",
        }))
        .filter((entry) => entry.videoUrl.length > 0 || entry.posterUrl.length > 0);
      const nextVideoEntries = [
        ...existingVideoEntries,
        ...videoUrls.map((videoUrl) => ({
          videoUrl,
          posterUrl: "",
        })),
      ];

      return {
        ...prev,
        videoUrls:
          nextVideoEntries.length > 0
            ? nextVideoEntries.map((entry) => entry.videoUrl)
            : [""],
        videoPosterUrls:
          nextVideoEntries.length > 0
            ? nextVideoEntries.map((entry) => entry.posterUrl)
            : [""],
      };
    });
  };

  const handleBulkVideoFiles = async (files: FileList | null) => {
    const nextFiles = Array.from(files ?? []);
    if (nextFiles.length === 0) {
      return;
    }

    const invalidFile = nextFiles.find((file) => !isMp4VideoFile(file));
    if (invalidFile) {
      setBulkVideoUploadError(`"${invalidFile.name}" is not an MP4 file.`);
      return;
    }

    const oversizedFile = nextFiles.find((file) => file.size > MAX_VIDEO_UPLOAD_SIZE);
    if (oversizedFile) {
      setBulkVideoUploadError(
        `"${oversizedFile.name}" is over ${MAX_VIDEO_UPLOAD_SIZE_MB} MB.`
      );
      return;
    }

    try {
      for (const file of nextFiles) {
        await verifyVideoFileMatchesAspectRatio(file, form.videoAspectRatio);
      }
    } catch (error) {
      setBulkVideoUploadError(
        error instanceof Error ? error.message : "One of the MP4 files does not match the selected ratio."
      );
      return;
    }

    const totalBytes = nextFiles.reduce((total, file) => total + file.size, 0);
    let uploadedBytes = 0;

    setBulkVideoUploadError("");
    setBulkVideoUploadMessage(
      nextFiles.length === 1
        ? "Uploading 1 clip to this project"
        : `Uploading ${nextFiles.length} clips to this project`
    );
    setIsBulkVideoUploading(true);
    setBulkVideoUploadProgress(1);

    try {
      for (const [index, file] of nextFiles.entries()) {
        let currentFileUploadedBytes = 0;

        setBulkVideoUploadMessage(
          nextFiles.length === 1
            ? "Uploading clip 1 of 1"
            : `Uploading clip ${index + 1} of ${nextFiles.length}`
        );

        const asset = await uploadPortfolioAssetToCloudinary(file, "portfolio/videos");
        currentFileUploadedBytes = file.size;

        uploadedBytes += file.size;
        appendVideoUrlsToForm([asset.url]);
        setBulkVideoUploadProgress(
          Math.max(1, Math.min(100, Math.round((uploadedBytes / totalBytes) * 100)))
        );
      }

      setBulkVideoUploadMessage(
        nextFiles.length === 1 ? "1 clip uploaded to the project" : `${nextFiles.length} clips uploaded to the project`
      );
      setBulkVideoUploadProgress(100);
    } catch (error) {
      setBulkVideoUploadError(
        error instanceof Error ? error.message : "One of the MP4 uploads failed."
      );
    } finally {
      setIsBulkVideoUploading(false);
      setIsBulkVideoDragging(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    void (async () => {
      setProjectFormError("");

      if (activeCategory === "Video Edit") {
        const trimmedVideoSources = form.videoUrls
          .map((item) => item.trim())
          .filter((item) => item.length > 0 && isMp4VideoSource(item));

        if (trimmedVideoSources.length > 0) {
          setIsProjectSubmitting(true);

          try {
            await validateVideoSourcesForProject(
              trimmedVideoSources,
              form.videoAspectRatio
            );
          } catch (error) {
            setProjectFormError(
              error instanceof Error
                ? error.message
                : "All clips in this project must match the selected ratio."
            );
            setIsProjectSubmitting(false);
            return;
          }
        }
      }

      const updatedProjects = { ...projects };
      const categoryProjects = [...updatedProjects[activeCategory]];
      const nextProject = toProject(form, activeCategory);

      if (editingIndex === null) {
        categoryProjects.push(nextProject);
      } else {
        categoryProjects[editingIndex] = nextProject;
      }

      updatedProjects[activeCategory] = categoryProjects;
      persistProjects(updatedProjects);
      resetForm();
    })();
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setBulkVideoUploadProgress(null);
    setBulkVideoUploadMessage("");
    setBulkVideoUploadError("");
    setProjectFormError("");
    setIsProjectSubmitting(false);
    setIsBulkVideoDragging(false);
    setIsBulkVideoUploading(false);
    setForm(toForm(activeProjects[index]));
  };

  const handleMoveProject = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    const categoryProjects = projects[activeCategory] || [];

    if (nextIndex < 0 || nextIndex >= categoryProjects.length) {
      return;
    }

    const updatedProjects = { ...projects };
    const reorderedProjects = [...categoryProjects];
    const [movedProject] = reorderedProjects.splice(index, 1);

    if (!movedProject) {
      return;
    }

    reorderedProjects.splice(nextIndex, 0, movedProject);
    updatedProjects[activeCategory] = reorderedProjects;
    persistProjects(updatedProjects);

    setEditingIndex((previousIndex) => {
      if (previousIndex === null) {
        return previousIndex;
      }

      if (previousIndex === index) {
        return nextIndex;
      }

      if (previousIndex === nextIndex) {
        return index;
      }

      return previousIndex;
    });
  };

  const handleDelete = (index: number) => {
    const updatedProjects = { ...projects };
    updatedProjects[activeCategory] = updatedProjects[activeCategory].filter(
      (_, itemIndex) => itemIndex !== index
    );
    persistProjects(updatedProjects);

    if (editingIndex === index) {
      resetForm();
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const resetTestimonialForm = () => {
    setTestimonialForm(createEmptyTestimonialForm());
    setEditingTestimonialIndex(null);
  };

  const handleTestimonialSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTestimonials = [...testimonials];
    const nextTestimonial = toTestimonial(testimonialForm);

    if (editingTestimonialIndex === null) {
      nextTestimonials.push(nextTestimonial);
    } else {
      nextTestimonials[editingTestimonialIndex] = nextTestimonial;
    }

    persistTestimonials(nextTestimonials);
    resetTestimonialForm();
  };

  const handleEditTestimonial = (index: number) => {
    setEditingTestimonialIndex(index);
    setTestimonialForm(testimonials[index]);
  };

  const handleDeleteTestimonial = (index: number) => {
    const nextTestimonials = testimonials.filter(
      (_, itemIndex) => itemIndex !== index
    );
    persistTestimonials(
      nextTestimonials.length > 0 ? nextTestimonials : fallbackTestimonials
    );

    if (editingTestimonialIndex === index) {
      resetTestimonialForm();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl p-6 space-y-5">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Studio Login</h1>
            <p className="text-sm text-white/70">
              Sign in to manage portfolio sections and projects.
            </p>
          </div>

          {!showForgotPassword ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                required
              />

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                required
              />

              <div className="flex items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="text-[#8fd3ff] transition-colors hover:text-white"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={handleBackToHome}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  Back to home
                </button>
              </div>

              {loginError && <p className="text-sm text-red-300">{loginError}</p>}
              {loginNotice && <p className="text-sm text-emerald-300">{loginNotice}</p>}

              <button
                type="submit"
                className="w-full rounded-lg bg-[#0099ff] py-2 text-sm font-semibold hover:bg-[#00a8ff] transition-colors"
              >
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="rounded-xl border border-white/12 bg-black/20 p-4 space-y-2">
                <p className="text-sm font-semibold text-white">
                  Reset your Studio password
                </p>
                <p className="text-xs leading-relaxed text-white/60">
                  Enter your private recovery code, then choose a new Studio password.
                </p>
              </div>

              <input
                type="email"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                placeholder="Studio
                 email"
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                required
              />

              <input
                type="password"
                value={resetCode}
                onChange={(event) => setResetCode(event.target.value)}
                placeholder="Recovery code"
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                required
              />

              <input
                type="password"
                value={nextPassword}
                onChange={(event) => setNextPassword(event.target.value)}
                placeholder="New password"
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                required
              />

              <input
                type="password"
                value={confirmNextPassword}
                onChange={(event) => setConfirmNextPassword(event.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                required
              />

              {resetState.message && (
                <p
                  className={`text-sm ${
                    resetState.status === "error"
                      ? "text-red-300"
                      : resetState.status === "success"
                        ? "text-emerald-300"
                        : "text-white/65"
                  }`}
                >
                  {resetState.message}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[#0099ff] py-2 text-sm font-semibold hover:bg-[#00a8ff] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={resetState.status === "submitting"}
                >
                  {resetState.status === "submitting"
                    ? "Checking code..."
                    : "Change Password"}
                </button>
                <button
                  type="button"
                  onClick={closeForgotPassword}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Portfolio Studio</h1>
            <p
              className={`mt-1 text-xs ${
                supabaseStatus === "enabled"
                  ? "text-emerald-300"
                  : supabaseStatus === "checking"
                    ? "text-sky-300"
                    : "text-amber-300"
              }`}
            >
              {supabaseStatus === "enabled"
                ? "Supabase sync connected"
                : supabaseStatus === "checking"
                  ? "Checking Supabase connection..."
                  : "Supabase env not set: using local storage fallback"}
            </p>
            <p
              className={`mt-0.5 text-xs ${
                cloudinaryStatus === "connected"
                  ? "text-emerald-300"
                  : "text-amber-300"
              }`}
            >
              {cloudinaryStatus === "connected"
                ? "Cloudinary connected"
                : cloudinaryStatus === "checking"
                  ? "Checking Cloudinary..."
                  : "Cloudinary not configured"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleBackToHome}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={16} />
            Back To Home
          </button>
        </div>

        {experienceSection}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setActiveCategory(category);
                resetForm();
              }}
              className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-all ${
                activeCategory === category
                  ? "border-[#0099ff] bg-[#0099ff]/20 text-white"
                  : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              {category} ({projects[category].length})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 md:p-5 space-y-4">
            <h2 className="text-lg font-semibold">
              {editingIndex === null ? "Add Project" : "Edit Project"} - {activeCategory}
            </h2>
            <p className="text-xs leading-relaxed text-white/65">
              {isVideoEditCategory
                ? "Each Video Edit entry becomes one project box in the homepage rail. Give it a dedicated thumbnail, then attach one or more direct .mp4 clips for the in-focus preview."
                : "Update the project card, optional external link, and the case-study details shown in the portfolio."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Project title"
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                required
              />

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Project description"
                className="w-full min-h-[90px] rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                required
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-start">
                {isVideoEditCategory ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-[#8fdcff]/18 bg-[#06111a]/70 p-4 space-y-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#8fdcff]">
                          Bulk MP4 Upload
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-white/60">
                          Drag multiple `.mp4` files here or click to upload several clips at once.
                          Every successful upload is added to this project&apos;s clip list, and you
                          can set a thumbnail for each clip below.
                        </p>
                      </div>

                      <label
                        htmlFor="project-video-bulk-upload"
                        onDragEnter={() => setIsBulkVideoDragging(true)}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setIsBulkVideoDragging(true);
                        }}
                        onDragLeave={() => setIsBulkVideoDragging(false)}
                        onDrop={async (event) => {
                          event.preventDefault();
                          setIsBulkVideoDragging(false);
                          await handleBulkVideoFiles(event.dataTransfer.files);
                        }}
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 text-center transition-all ${
                          isBulkVideoDragging
                            ? "border-[#0099ff]/70 bg-[#0099ff]/12"
                            : "border-white/15 bg-black/20 hover:border-[#0099ff]/45 hover:bg-[#0099ff]/8"
                        } ${isBulkVideoUploading ? "pointer-events-none opacity-70" : ""}`}
                      >
                        <input
                          id="project-video-bulk-upload"
                          type="file"
                          accept="video/mp4,.mp4"
                          multiple
                          className="sr-only"
                          onChange={async (event) => {
                            await handleBulkVideoFiles(event.target.files);
                            event.target.value = "";
                          }}
                          disabled={isBulkVideoUploading}
                        />
                        <span className="text-sm font-medium text-white/90">
                          {isBulkVideoUploading
                            ? "Uploading clips..."
                            : "Drag MP4 clips here or click to upload many"}
                        </span>
                        <span className="mt-1 text-xs text-white/55">
                          Uploaded videos are saved to Cloudinary and appended to this
                          project.
                        </span>
                      </label>

                      {bulkVideoUploadError ? (
                        <p className="text-xs text-amber-200">{bulkVideoUploadError}</p>
                      ) : null}

                      {bulkVideoUploadProgress !== null ? (
                        <div className="rounded-xl border border-[#8fdcff]/18 bg-[#071722]/80 px-3 py-3">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="font-medium text-white/82">
                              {bulkVideoUploadMessage || "Uploading clips"}
                            </span>
                            <span className="font-semibold text-[#8fdcff]">
                              {bulkVideoUploadProgress}%
                            </span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,#36d1ff,#0099ff)] transition-[width] duration-200"
                              style={{ width: `${bulkVideoUploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {form.videoUrls.map((videoUrl, index) => (
                      <div
                        key={`project-video-file-${index}`}
                        className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-3"
                      >
                        <VideoField
                          id={`project-video-file-${index}`}
                          label={form.videoUrls.length === 1 ? "MP4 file" : `MP4 clip ${index + 1}`}
                          value={videoUrl}
                          expectedAspectRatio={form.videoAspectRatio}
                          onChange={(value) =>
                            setForm((prev) => {
                              const nextVideoUrls = [...prev.videoUrls];
                              nextVideoUrls[index] = value;
                              return { ...prev, videoUrls: nextVideoUrls };
                            })
                          }
                          placeholder={`Direct .mp4 file path or URL for clip ${index + 1}`}
                        />
                        <ImageField
                          id={`project-video-thumbnail-${index}`}
                          label={
                            form.videoUrls.length === 1
                              ? "Clip thumbnail"
                              : `Clip ${index + 1} thumbnail`
                          }
                          value={form.videoPosterUrls[index] || ""}
                          onChange={(value) =>
                            setForm((prev) => {
                              const nextVideoPosterUrls = [...prev.videoPosterUrls];
                              nextVideoPosterUrls[index] = value;
                              return { ...prev, videoPosterUrls: nextVideoPosterUrls };
                            })
                          }
                          placeholder={`Image path or URL for clip ${index + 1} thumbnail`}
                          previewHeightClassName="h-28"
                        />
                        {form.videoUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                videoUrls: prev.videoUrls.filter((_, itemIndex) => itemIndex !== index),
                                videoPosterUrls: prev.videoPosterUrls.filter(
                                  (_, itemIndex) => itemIndex !== index
                                ),
                              }))
                            }
                            className="rounded-lg border border-white/20 px-3 text-xs hover:bg-white/10 transition-colors"
                          >
                            Remove clip
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          videoUrls: [...prev.videoUrls, ""],
                          videoPosterUrls: [...prev.videoPosterUrls, ""],
                        }))
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-[#0099ff]/60 px-3 py-2 text-xs text-[#8fd3ff] hover:bg-[#0099ff]/15 transition-colors"
                    >
                      <Plus size={14} />
                      Add another MP4
                    </button>
                  </div>
                ) : (
                  <ImageField
                    id="project-card-image"
                    label="Card image"
                    value={form.image}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, image: value }))
                    }
                    placeholder="Card image path or URL"
                  />
                )}
                <input
                  type="text"
                  value={form.designLink}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, designLink: event.target.value }))
                  }
                  placeholder={isVideoEditCategory ? "Project link (optional)" : "Design link"}
                  className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                />
              </div>

              {isVideoEditCategory && (
                <div className="rounded-xl border border-[#8fdcff]/18 bg-[#06111a]/70 p-4 space-y-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#8fdcff]">
                      Video Showcase Setup
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-white/60">
                      This single project becomes one homepage project box. Leave the heading blank
                      to use the project title, keep a dedicated box thumbnail, and add one or more
                      direct `.mp4` files for the in-focus preview.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      type="text"
                      value={form.videoCategory}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, videoCategory: event.target.value }))
                      }
                      placeholder="Project heading for this box (leave blank to use project title)"
                      className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                    />
                    <input
                      type="text"
                      value={form.videoParentLabel}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, videoParentLabel: event.target.value }))
                      }
                      placeholder="Small label under the title (e.g. Vast Professionals)"
                      className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                    />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-white/85">Video ratio</p>
                      <p className="mt-1 text-xs leading-relaxed text-white/55">
                        Choose the format for this project so the website can size the
                        player correctly for long-form or short-form videos. All clips in this
                        project must match the same ratio.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {VIDEO_ASPECT_RATIO_OPTIONS.map((option) => {
                        const isSelected = form.videoAspectRatio === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              {
                                setProjectFormError("");
                                setBulkVideoUploadError("");
                                setForm((prev) => ({
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
                  <div>
                    <ImageField
                      id="project-video-poster"
                      label="Project box thumbnail"
                      value={form.image}
                      onChange={(value) =>
                        setForm((prev) => ({ ...prev, image: value }))
                      }
                      placeholder="Thumbnail image for the homepage project box"
                      previewHeightClassName="h-28"
                    />
                  </div>
                </div>
              )}

              {!isVideoEditCategory && (
                <label className="flex items-center gap-2 text-sm text-white/85">
                  <input
                    type="checkbox"
                    checked={form.showDetailsModal}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        showDetailsModal: event.target.checked,
                      }))
                    }
                    className="accent-[#0099ff]"
                  />
                  Enable details modal
                </label>
              )}

              {!isVideoEditCategory && form.showDetailsModal && (
                <div className="rounded-xl border border-white/15 bg-black/25 p-3 space-y-3">
                  <input
                    type="text"
                    value={form.detailsTitle}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, detailsTitle: event.target.value }))
                    }
                    placeholder="Details title"
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                  />

                  <textarea
                    value={form.detailsDescription}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, detailsDescription: event.target.value }))
                    }
                    placeholder="Details description"
                    className="w-full min-h-[80px] rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                  />

                  <ImageField
                    id="project-details-hero-image"
                    label="Details hero image"
                    value={form.detailsHeroImage}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, detailsHeroImage: value }))
                    }
                    placeholder="Details hero image path or URL"
                  />

                  <div className="space-y-2">
                    {form.galleryImages.map((galleryPath, index) => (
                      <div
                        key={`gallery-input-${index}`}
                        className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-3"
                      >
                        <ImageField
                          id={`gallery-image-${index}`}
                          label={`Gallery image ${index + 1}`}
                          value={galleryPath}
                          onChange={(value) =>
                            setForm((prev) => {
                              const nextGallery = [...prev.galleryImages];
                              nextGallery[index] = value;
                              return { ...prev, galleryImages: nextGallery };
                            })
                          }
                          placeholder={`Gallery image ${index + 1}`}
                          previewHeightClassName="h-28"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => {
                              if (prev.galleryImages.length === 1) return prev;
                              return {
                                ...prev,
                                galleryImages: prev.galleryImages.filter(
                                  (_, itemIndex) => itemIndex !== index
                                ),
                              };
                            })
                          }
                          className="rounded-lg border border-white/20 px-3 text-xs hover:bg-white/10 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          galleryImages: [...prev.galleryImages, ""],
                        }))
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-[#0099ff]/60 px-3 py-2 text-xs text-[#8fd3ff] hover:bg-[#0099ff]/15 transition-colors"
                    >
                      <Plus size={14} />
                      Add gallery field
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {projectFormError ? (
                  <p className="flex-1 text-sm text-amber-200">{projectFormError}</p>
                ) : (
                  <div className="flex-1" />
                )}
                <button
                  type="submit"
                  className="rounded-lg bg-[#0099ff] px-4 py-2 text-sm font-semibold hover:bg-[#00a8ff] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isProjectSubmitting}
                >
                  {isProjectSubmitting
                    ? "Checking ratio..."
                    : editingIndex === null
                      ? "Add Project"
                      : "Save Changes"}
                </button>
                {editingIndex !== null && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="rounded-2xl border border-white/15 bg-black/25 p-4 md:p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                    Live Preview
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-white">
                    This is how the project content is shaping up.
                  </h3>
                </div>
                <span className="rounded-full border border-[#0099ff]/30 bg-[#0099ff]/10 px-3 py-1 text-[10px] tracking-[0.18em] text-[#8fd3ff]">
                  {activeCategory}
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.95fr]">
                <div className={isVideoEditCategory ? "space-y-4" : "overflow-hidden rounded-[22px] border border-white/15 bg-black/30"}>
                  {isVideoEditCategory ? (
                    <>
                      <div className="rounded-[22px] border border-white/15 bg-black/30 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                              Homepage Project Box
                            </p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              This thumbnail is what shows in the rail before someone opens the project.
                            </p>
                          </div>
                          <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/58">
                            Thumbnail
                          </span>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
                          <div className="group relative aspect-square overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.05]">
                            {projectPreviewCardImage ? (
                              <img
                                src={projectPreviewCardImage}
                                alt={`${projectPreview.title} project box preview`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-[linear-gradient(135deg,rgba(8,16,24,0.98),rgba(5,9,15,0.94))]" />
                            )}
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,11,18,0.05),rgba(5,8,13,0.78)_100%)]" />
                            <div className="relative z-10 flex h-full flex-col p-4">
                              <div className="flex items-start justify-between gap-3">
                                <span className="rounded-full border border-white/12 bg-black/24 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/58">
                                  {projectPreviewVideoUrls.length}{" "}
                                  {projectPreviewVideoUrls.length === 1 ? "clip" : "clips"}
                                </span>
                              </div>
                              <div className="mt-auto">
                                <p className="text-lg font-semibold text-white">
                                  {projectPreviewVideoCategory}
                                </p>
                                <p className="mt-2 text-sm text-white/62">
                                  Click to view clips
                                </p>
                                <span className="mt-4 inline-flex rounded-full border border-[#8fdcff]/22 bg-[#091826]/78 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c8f5ff]">
                                  Preview project
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-[24px] border border-white/12 bg-black/24 p-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                              Box Setup
                            </p>
                            <p className="mt-2 text-xl font-semibold text-white">
                              {projectPreview.title}
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-white/66 line-clamp-4">
                              {projectPreview.description}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/58">
                                {projectPreviewCardImage ? "Box thumbnail ready" : "Needs box thumbnail"}
                              </span>
                              <span className="rounded-full border border-[#8fdcff]/22 bg-[#091826]/78 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#c8f5ff]">
                                {projectPreviewVideoAspectRatio === "portrait" ? "Portrait" : "Landscape"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-[22px] border border-white/15 bg-black/30">
                        <div className={`relative bg-black ${projectPreviewVideoFrameClass}`}>
                          {projectPreviewVideoUrl ? (
                            <video
                              key={`${projectPreview.title}-${projectPreviewVideoUrl}`}
                              src={projectPreviewVideoUrl}
                              poster={projectPreviewPosterImage || undefined}
                              className="h-full w-full object-cover"
                              controls
                              playsInline
                              muted
                              autoPlay
                              loop
                              preload="metadata"
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center px-6 text-center"
                              style={{
                                background: projectPreviewPosterImage
                                  ? `linear-gradient(135deg, rgba(2, 6, 10, 0.7), rgba(2, 6, 10, 0.92)), url(${projectPreviewPosterImage}) center/cover`
                                  : projectPreviewCardImage
                                    ? `linear-gradient(135deg, rgba(2, 6, 10, 0.7), rgba(2, 6, 10, 0.92)), url(${projectPreviewCardImage}) center/cover`
                                    : "linear-gradient(135deg, rgba(4,10,18,0.98), rgba(6,18,28,0.92))",
                              }}
                            >
                              <div className="max-w-sm">
                                <p className="text-base font-semibold text-white">
                                  No direct MP4 clip added yet
                                </p>
                                <p className="mt-2 text-sm leading-relaxed text-white/62">
                                  Add one or more direct `.mp4` file paths or URLs and this
                                  project will open inside the in-focus stage on the homepage.
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="absolute left-4 top-4 rounded-full border border-[#8fdcff]/20 bg-[#06131d]/86 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#aeeaff] backdrop-blur-md">
                            In Focus
                          </div>
                        </div>
                        <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(0,153,255,0.08),rgba(8,10,18,0.14))] p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-white">
                              {projectPreviewVideoCategory}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                                Clip Deck
                              </span>
                              <span className="rounded-full border border-white/12 bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/62">
                                {projectPreviewVideoUrls.length}{" "}
                                {projectPreviewVideoUrls.length === 1 ? "clip" : "clips"}
                              </span>
                            </div>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-white/70 line-clamp-4">
                            {projectPreview.description}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <img
                        src={projectPreview.image}
                        alt={projectPreview.title}
                        className="h-52 w-full object-cover"
                      />
                      <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(0,153,255,0.08),rgba(8,10,18,0.14))] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">
                              {projectPreview.title}
                            </p>
                            {projectPreviewVideoParentLabel ? (
                              <p className="mt-1 text-xs text-white/46">
                                under {projectPreviewVideoParentLabel}
                              </p>
                            ) : null}
                          </div>
                          <span className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                            Project Card
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-white/70 line-clamp-4">
                          {projectPreview.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="rounded-[22px] border border-white/15 bg-black/30 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">
                      {isVideoEditCategory ? "Showcase Setup" : "Details Preview"}
                    </p>
                    <span className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                      {isVideoEditCategory
                        ? "Video Edit"
                        : projectPreview.showDetailsModal
                          ? "Enabled"
                          : "Disabled"}
                    </span>
                  </div>

                  {isVideoEditCategory ? (
                    <>
                      <div className="rounded-xl border border-white/12 bg-black/35 p-4 space-y-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                            Project Heading
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {projectPreviewVideoCategory}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                            Video Ratio
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-white/68">
                            {projectPreviewVideoAspectRatio === "portrait"
                              ? "1080 x 1920 (portrait / short-form)"
                              : "1920 x 1080 (landscape / standard)"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                            MP4 Clips
                          </p>
                          {projectPreviewVideoUrls.length > 0 ? (
                            <div className="mt-2 space-y-2">
                              <p className="text-sm leading-relaxed text-white/68">
                                {projectPreviewVideoUrls.length}{" "}
                                {projectPreviewVideoUrls.length === 1 ? "clip is" : "clips are"}{" "}
                                ready for this in-focus project.
                              </p>
                              {projectPreviewVideoUrls.slice(0, 3).map((videoUrl, index) => (
                                <p
                                  key={`${videoUrl}-${index}`}
                                  className="break-all text-xs leading-relaxed text-white/50"
                                >
                                  Clip {index + 1}: {videoUrl}
                                </p>
                              ))}
                              {projectPreviewVideoUrls.length > 3 ? (
                                <p className="text-xs leading-relaxed text-white/42">
                                  +{projectPreviewVideoUrls.length - 3} more clips
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <p className="mt-1 break-all text-sm leading-relaxed text-white/68">
                              Add one or more direct `.mp4` file paths or URLs so the homepage can
                              play all of your clips inside the in-focus preview.
                            </p>
                          )}
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                              Clip Thumbnails
                            </p>
                            {projectPreviewVideoPosterCount > 0 ? (
                              <p className="mt-1 text-sm leading-relaxed text-white/68">
                                {projectPreviewVideoPosterCount}{" "}
                                {projectPreviewVideoPosterCount === 1
                                  ? "thumbnail is"
                                  : "thumbnails are"}{" "}
                                ready for the clip deck.
                              </p>
                            ) : (
                              <p className="mt-1 text-sm leading-relaxed text-white/68">
                                Upload an optional image for each clip to override the default
                                live frame preview from the video itself.
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                              Project Box Thumbnail
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-white/68">
                              {projectPreviewCardImage
                                ? "A dedicated thumbnail is ready for the homepage project box."
                                : "Add a dedicated image so the project box has its own thumbnail in the homepage rail."}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                              Project Link
                            </p>
                            <p className="mt-1 break-all text-sm leading-relaxed text-white/68">
                              {projectPreview.designLink}
                            </p>
                          </div>
                        </div>
                    </>
                  ) : projectPreview.showDetailsModal && projectPreview.details ? (
                    <>
                      <div className="overflow-hidden rounded-xl border border-white/12 bg-black/35">
                        <img
                          src={projectPreview.details.heroImage}
                          alt={projectPreview.details.title}
                          className="h-28 w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          {projectPreview.details.title}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-white/68 line-clamp-5">
                          {projectPreview.details.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {projectPreview.details.galleryImages
                          .slice(0, 3)
                          .map((image, index) => (
                            <div
                              key={`${image}-${index}`}
                              className="overflow-hidden rounded-lg border border-white/10 bg-black/40"
                            >
                              <img
                                src={image}
                                alt={`${projectPreview.details?.title} gallery ${index + 1}`}
                                className="h-16 w-full object-cover"
                              />
                            </div>
                          ))}
                      </div>
                    </>
                  ) : (
                    <p className="rounded-xl border border-dashed border-white/12 bg-black/20 px-4 py-6 text-sm text-white/55">
                      Turn on the details modal to preview the hero image and gallery here.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 md:p-5 space-y-3">
            <h2 className="text-lg font-semibold">
              {activeCategory} Projects ({activeProjects.length})
            </h2>
            {activeCategory === "Video Edit" && activeProjects.length > 1 && (
              <p className="text-xs leading-relaxed text-white/58">
                Use the up and down buttons to control the order shown in the main
                portfolio showcase.
              </p>
            )}

            <div className="max-h-[62vh] overflow-y-auto space-y-3 pr-1">
              {activeProjects.map((project, index) => (
                <div
                  key={`${activeCategory}-${project.title}-${index}`}
                  className="rounded-xl border border-white/15 bg-black/25 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-xl border border-white/12 bg-black/30">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={`${project.title} thumbnail`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-[linear-gradient(135deg,rgba(8,16,24,0.98),rgba(5,9,15,0.94))]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-sm">{project.title}</h3>
                        {activeCategory === "Video Edit" && (
                          <span className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/58">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-white/75 line-clamp-3">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  {activeCategory === "Video Edit" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#8fdcff]/25 bg-[#081622] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#aeeaff]">
                        {getVideoProjectCategory(project)}
                      </span>
                      <span className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/58">
                        {(() => {
                          const videoCount = getProjectVideoUrls(project).length;
                          if (videoCount === 0) {
                            return "Needs clips";
                          }

                          return `${videoCount} ${videoCount === 1 ? "clip" : "clips"} ready`;
                        })()}
                      </span>
                      <span className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/58">
                        {project.image ? "Box thumbnail ready" : "Needs box thumbnail"}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeCategory === "Video Edit" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleMoveProject(index, -1)}
                          disabled={index === 0}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowUp size={12} />
                          Up
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveProject(index, 1)}
                          disabled={index === activeProjects.length - 1}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowDown size={12} />
                          Down
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEdit(index)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10 transition-colors"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-300/40 px-3 py-1.5 text-xs text-red-200 hover:bg-red-300/10 transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {activeProjects.length === 0 && (
                <p className="text-sm text-white/65">
                  {activeCategory === "Video Edit"
                    ? "No video edit projects yet. Add one project box with a heading, thumbnail, and one or more direct .mp4 files."
                    : "No projects yet in this category."}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 md:p-5 space-y-4">
            <h2 className="text-lg font-semibold">
              {editingTestimonialIndex === null
                ? "Add Testimonial"
                : "Edit Testimonial"}
            </h2>
            <p className="text-xs text-white/70">
              Manage testimonial text and profile image path/URL used in the Reviews
              section.
            </p>

            <form onSubmit={handleTestimonialSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={testimonialForm.name}
                  onChange={(event) =>
                    setTestimonialForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Client name"
                  className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                  required
                />
                <input
                  type="text"
                  value={testimonialForm.designation}
                  onChange={(event) =>
                    setTestimonialForm((prev) => ({
                      ...prev,
                      designation: event.target.value,
                    }))
                  }
                  placeholder="Role / Company"
                  className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                  required
                />
              </div>

              <ImageField
                id="testimonial-image"
                label="Testimonial image"
                value={testimonialForm.src}
                onChange={(value) =>
                  setTestimonialForm((prev) => ({
                    ...prev,
                    src: value,
                  }))
                }
                placeholder="Image path or URL (e.g. /client.png or https://...)"
                previewHeightClassName="h-40"
              />

              <textarea
                value={testimonialForm.quote}
                onChange={(event) =>
                  setTestimonialForm((prev) => ({
                    ...prev,
                    quote: event.target.value,
                  }))
                }
                placeholder="Testimonial quote"
                className="w-full min-h-[100px] rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                required
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-[#0099ff] px-4 py-2 text-sm font-semibold hover:bg-[#00a8ff] transition-colors"
                >
                  {editingTestimonialIndex === null
                    ? "Add Testimonial"
                    : "Save Testimonial"}
                </button>
                {editingTestimonialIndex !== null && (
                  <button
                    type="button"
                    onClick={resetTestimonialForm}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="rounded-2xl border border-white/15 bg-black/25 p-4 md:p-5 space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                  Live Preview
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  This updates while you edit the testimonial.
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                <div className="overflow-hidden rounded-[22px] border border-white/15 bg-black/30">
                  <img
                    src={testimonialPreview.src}
                    alt={testimonialPreview.name}
                    className="h-56 w-full object-cover"
                  />
                </div>

                <div className="relative flex min-h-[14rem] flex-col overflow-hidden rounded-[22px] border border-white/15 bg-black/35 p-4 shadow-[0_12px_26px_rgba(0,0,0,0.3)]">
                  <div className="pointer-events-none absolute right-3 top-1 text-[56px] leading-none text-[#00c6ff]/18">
                    &quot;
                  </div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full border border-[#00c6ff]/35 bg-[#00c6ff]/10 px-3 py-1 text-[10px] tracking-[0.16em] text-[#86e9ff]">
                      TESTIMONIAL
                    </span>
                    <span className="text-xs text-white/55">Studio Preview</span>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h4 className="text-lg font-bold text-white">
                      {testimonialPreview.name}
                    </h4>
                    <p className="text-sm text-[#8cdfff]">
                      {testimonialPreview.designation}
                    </p>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-white/85">
                      {testimonialPreview.quote}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 md:p-5 space-y-3">
            <h2 className="text-lg font-semibold">
              Testimonials ({testimonials.length})
            </h2>

            <div className="max-h-[62vh] overflow-y-auto space-y-3 pr-1">
              {testimonials.map((testimonial, index) => (
                <div
                  key={`${testimonial.name}-${index}`}
                  className="rounded-xl border border-white/15 bg-black/25 p-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={testimonial.src}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full object-cover border border-white/20"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate">
                        {testimonial.name}
                      </h3>
                      <p className="text-xs text-[#8cdfff] truncate">
                        {testimonial.designation}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-white/75 mt-2 line-clamp-3">
                    {testimonial.quote}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditTestimonial(index)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10 transition-colors"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTestimonial(index)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-300/40 px-3 py-1.5 text-xs text-red-200 hover:bg-red-300/10 transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

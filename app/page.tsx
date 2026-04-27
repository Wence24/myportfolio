"use client";

import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
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
import {
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

export default function Home() {
  const router = useRouter();
  const [, setTextVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [introPulse, setIntroPulse] = useState(false);
  const [introLogoVisible, setIntroLogoVisible] = useState(false);
  const [introExit, setIntroExit] = useState(false);
  const [showAbout, setShowAbout] = useState(false); // scroll-triggered About Me
  const [videoText, setVideoText] = useState("");
  const [graphicText, setGraphicText] = useState("");
const [videoDone, setVideoDone] = useState(false);
const [graphicDone, setGraphicDone] = useState(false);
const [activeBox, setActiveBox] = useState("Video Edit"); // default Projects
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
const [videoCarouselMotion, setVideoCarouselMotion] = useState<
  Record<string, VideoCarouselMotionState>
>({});
const [activeCarouselPlaybackKey, setActiveCarouselPlaybackKey] = useState<string | null>(null);

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
    name: "Certificates",
    icon: Medal,
    description: "Proof of learning, milestones, and validated skill growth.",
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

type VideoCarouselMotionState = {
  token: number;
  direction: -1 | 1;
};

type VideoProjectAspectRatio = "landscape" | "portrait";

type CarouselClipVideoProps = {
  playbackKey: string;
  videoUrl: string;
  posterUrl?: string;
  isActive: boolean;
  isVisible: boolean;
  activePlaybackKey: string | null;
  onPlaybackStart: (playbackKey: string) => void;
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
const carouselClipPlaybackTimes = new Map<string, number>();
let activeCarouselVideoElement: HTMLVideoElement | null = null;

const pauseOtherCarouselVideos = (
  currentVideo: HTMLVideoElement,
  playbackKey: string
) => {
  if (typeof document === "undefined") {
    return;
  }

  document
    .querySelectorAll<HTMLVideoElement>('video[data-carousel-video="true"]')
    .forEach((videoElement) => {
      if (videoElement === currentVideo) {
        return;
      }

      const otherPlaybackKey = videoElement.dataset.playbackKey?.trim();
      if (otherPlaybackKey) {
        carouselClipPlaybackTimes.set(otherPlaybackKey, videoElement.currentTime || 0);
      }

      videoElement.pause();
      videoElement.currentTime = videoElement.currentTime;
    });

  activeCarouselVideoElement = currentVideo;
  carouselClipPlaybackTimes.set(playbackKey, currentVideo.currentTime || 0);
};

function CarouselClipVideo({
  playbackKey,
  videoUrl,
  posterUrl,
  isActive,
  isVisible,
  activePlaybackKey,
  onPlaybackStart,
}: CarouselClipVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastPlaybackTimeRef = useRef(0);
  const hasCustomPoster = typeof posterUrl === "string" && posterUrl.trim().length > 0;
  const shouldKeepPlaying = isActive && isVisible && activePlaybackKey === playbackKey;

  const savePlaybackTime = useCallback((time: number) => {
    if (!Number.isFinite(time) || time < 0) {
      return;
    }

    lastPlaybackTimeRef.current = time;
    carouselClipPlaybackTimes.set(playbackKey, time);
  }, [playbackKey]);

  const restorePlaybackTime = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const savedPlaybackTime =
      carouselClipPlaybackTimes.get(playbackKey) ?? lastPlaybackTimeRef.current;
    if (
      savedPlaybackTime > 0.15 &&
      Math.abs(video.currentTime - savedPlaybackTime) > 0.35
    ) {
      try {
        video.currentTime = savedPlaybackTime;
      } catch {
        // ignore currentTime assignment errors on partially loaded media
      }
    }
  }, [playbackKey]);

  const resumePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    restorePlaybackTime();
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      void playPromise.catch(() => {
        // ignore autoplay interruptions from the browser
      });
    }
  }, [restorePlaybackTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (shouldKeepPlaying) {
      if (video.readyState >= 1) {
        resumePlayback();
        return;
      }

      const handleReadyForResume = () => {
        resumePlayback();
      };

      video.addEventListener("loadedmetadata", handleReadyForResume, { once: true });
      video.addEventListener("canplay", handleReadyForResume, { once: true });
      return () => {
        video.removeEventListener("loadedmetadata", handleReadyForResume);
        video.removeEventListener("canplay", handleReadyForResume);
      };
    }

    savePlaybackTime(video.currentTime || lastPlaybackTimeRef.current);
    video.pause();
  }, [resumePlayback, savePlaybackTime, shouldKeepPlaying, videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isVisible) {
      return;
    }

    savePlaybackTime(video.currentTime || lastPlaybackTimeRef.current);
    video.pause();
  }, [isVisible, playbackKey, savePlaybackTime]);

  useEffect(() => {
    lastPlaybackTimeRef.current = carouselClipPlaybackTimes.get(playbackKey) ?? 0;
  }, [playbackKey, videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || shouldKeepPlaying) {
      return;
    }

    savePlaybackTime(video.currentTime || lastPlaybackTimeRef.current);
    video.pause();
  }, [savePlaybackTime, shouldKeepPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (activeCarouselVideoElement === video) {
        activeCarouselVideoElement = null;
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      poster={hasCustomPoster ? posterUrl : undefined}
      data-carousel-video="true"
      data-playback-key={playbackKey}
      className="h-full w-full object-cover"
      controls={isActive}
      controlsList="nodownload"
      disablePictureInPicture
      playsInline
      loop
      preload={hasCustomPoster || !isVisible ? "metadata" : "auto"}
      onContextMenu={(event) => {
        event.preventDefault();
      }}
      onLoadedData={(event) => {
        if (hasCustomPoster || shouldKeepPlaying || !isVisible) {
          return;
        }

        const video = event.currentTarget;
        const savedPlaybackTime =
          carouselClipPlaybackTimes.get(playbackKey) ?? lastPlaybackTimeRef.current;
        const previewTime = savedPlaybackTime > 0.15 ? savedPlaybackTime : 0.01;

        if (!Number.isFinite(video.duration) || video.duration <= 0) {
          return;
        }

        try {
          video.currentTime = Math.min(previewTime, Math.max(video.duration - 0.05, 0));
        } catch {
          // ignore currentTime assignment errors while previewing the first frame
        }
      }}
      onPlay={(event) => {
        const currentVideo = event.currentTarget;

        pauseOtherCarouselVideos(currentVideo, playbackKey);
        onPlaybackStart(playbackKey);

        window.setTimeout(() => {
          pauseOtherCarouselVideos(currentVideo, playbackKey);
        }, 0);
      }}
      onTimeUpdate={(event) => {
        savePlaybackTime(event.currentTarget.currentTime);
      }}
      onSeeked={(event) => {
        savePlaybackTime(event.currentTarget.currentTime);
      }}
      onPause={(event) => {
        savePlaybackTime(event.currentTarget.currentTime);
        if (activeCarouselVideoElement === event.currentTarget) {
          activeCarouselVideoElement = null;
        }
      }}
      onEnded={(event) => {
        savePlaybackTime(event.currentTarget.currentTime);
        if (activeCarouselVideoElement === event.currentTarget) {
          activeCarouselVideoElement = null;
        }
      }}
    />
  );
}

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

    return {
      key: projectKey,
      name: categoryName,
      project,
      aspectRatio: projectVideoAspectRatio,
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
  Certificates: [],
};

const [portfolioProjects, setPortfolioProjects] = useState<Record<string, PortfolioProject[]>>(
  initialPortfolioProjects
);

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
    Certificates: Array.isArray(raw.Certificates) ? (raw.Certificates as PortfolioProject[]) : [],
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
const heroMarkerLayouts = createHeroMarkerLayouts();


  const hasRun = useRef(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  const aboutRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const [showSideNav, setShowSideNav] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const showSideNavRef = useRef(false);
  const activeSectionRef = useRef("home");
  type SideNavId = "home" | "about" | "portfolio" | "reviews" | "contact";
  const [, setLogoTapCount] = useState(0);
  const logoTapResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  let cancelled = false;
  const syncPortfolioFromSupabase = async () => {
    const remoteContent = await fetchPortfolioContentFromSupabase();
    if (!remoteContent || cancelled) return;

    const normalizedProjects = normalizeStoredProjects(remoteContent.projects);
    setPortfolioProjects(normalizedProjects);

    try {
      window.localStorage.setItem(
        PORTFOLIO_STORAGE_KEY,
        JSON.stringify(normalizedProjects)
      );
      window.dispatchEvent(new Event(PORTFOLIO_UPDATED_EVENT));
    } catch {
      // ignore storage write errors
    }
  };

  void syncPortfolioFromSupabase();

  return () => {
    cancelled = true;
  };
}, []);

useEffect(() => {
  if (typeof document === "undefined") {
    return;
  }

  const handleCarouselVideoPlay = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLVideoElement)) {
      return;
    }

    if (target.dataset.carouselVideo !== "true") {
      return;
    }

    const playbackKey = target.dataset.playbackKey?.trim() || "";
    pauseOtherCarouselVideos(target, playbackKey);
    if (playbackKey) {
      setActiveCarouselPlaybackKey(playbackKey);
    }
  };

  document.addEventListener("play", handleCarouselVideoPlay, true);
  document.addEventListener("playing", handleCarouselVideoPlay, true);

  return () => {
    document.removeEventListener("play", handleCarouselVideoPlay, true);
    document.removeEventListener("playing", handleCarouselVideoPlay, true);
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

    const schedule = (callback: () => void, delay: number) => {
      timers.push(setTimeout(callback, delay));
    };

    schedule(() => setIntroPulse(true), 80);
    schedule(() => setIntroLogoVisible(true), 260);
    schedule(() => setIntroExit(true), 1480);
    schedule(() => setTextVisible(true), 1580);
    schedule(() => setImageVisible(true), 1840);

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
              }, 100);
            }, 420)
          );
        }
      }, 100);
    }, 1640);

    schedule(() => setIntroDone(true), 2120);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      if (videoInterval) clearInterval(videoInterval);
      if (graphicInterval) clearInterval(graphicInterval);
    };
  }, []);

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




  // Scroll animation for About Me & Side Nav
  useEffect(() => {
    let ticking = false;

    const runScrollWork = () => {
      if (!aboutRef.current) return;
      const rect = aboutRef.current.getBoundingClientRect();
      const triggerPoint = window.innerHeight * 0.9; // show About Me when 90% of viewport
      if (rect.top < triggerPoint && !hasShownAbout.current) {
  setShowAbout(true);
  hasShownAbout.current = true;
}


      // Show side nav after hero
      if (heroRef.current) {
        const nextShowSideNav = window.scrollY > heroRef.current.offsetHeight - 200;
        if (showSideNavRef.current !== nextShowSideNav) {
          showSideNavRef.current = nextShowSideNav;
          setShowSideNav(nextShowSideNav);
        }
      }
      

      // Detect active section
      const sections = [
        { id: "home", ref: heroRef },
        { id: "about", ref: aboutRef },
        { id: "portfolio", ref: portfolioRef },
        { id: "reviews", ref: reviewsRef },
        { id: "contact", ref: contactRef },
      ];

      for (const s of sections) {
        if (!s.ref.current) continue;
        const r = s.ref.current.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.45 && r.bottom >= 0) {
          if (activeSectionRef.current !== s.id) {
            activeSectionRef.current = s.id;
            setActiveSection(s.id);
          }
          break;
        }
      }
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        runScrollWork();
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    runScrollWork(); // check on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

useEffect(() => {
  if (!navbarRef.current) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      const nextShowSideNav = !entry.isIntersecting;
      if (showSideNavRef.current !== nextShowSideNav) {
        showSideNavRef.current = nextShowSideNav;
        setShowSideNav(nextShowSideNav);
      }
    },
    { threshold: 0 }
  );

  observer.observe(navbarRef.current);

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

  const focusTimer = setTimeout(() => {
    contactMessageCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    contactMessageRef.current?.focus();
    const messageLength = contactMessageRef.current?.value.length ?? 0;
    contactMessageRef.current?.setSelectionRange(messageLength, messageLength);
    shouldFocusContactMessageRef.current = false;
  }, 180);

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

const getVideoCarouselMotionDirection = (
  currentIndex: number,
  nextIndex: number,
  projectCount: number
): -1 | 1 => {
  if (projectCount <= 1) {
    return 1;
  }

  const forwardDistance = (nextIndex - currentIndex + projectCount) % projectCount;
  if (forwardDistance === 0) {
    return 1;
  }

  return forwardDistance <= projectCount / 2 ? 1 : -1;
};

const triggerVideoCarouselMotion = (groupName: string, direction: -1 | 1) => {
  setVideoCarouselMotion((prev) => ({
    ...prev,
    [groupName]: {
      token: (prev[groupName]?.token ?? 0) + 1,
      direction,
    },
  }));
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

  triggerVideoCarouselMotion(
    groupName,
    getVideoCarouselMotionDirection(currentIndex, normalizedNextIndex, projectCount)
  );
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

  triggerVideoCarouselMotion(groupName, direction >= 0 ? 1 : -1);
  setVideoCarouselIndexes((prev) => {
    const currentIndex = ((prev[groupName] ?? 0) % projectCount + projectCount) % projectCount;
    return {
      ...prev,
      [groupName]: (currentIndex + direction + projectCount) % projectCount,
    };
  });
};

const getVideoCarouselClipOffset = (
  clipIndex: number,
  activeIndex: number,
  clipCount: number
) => {
  if (clipCount <= 1) {
    return 0;
  }

  if (clipCount === 2) {
    return clipIndex === activeIndex ? 0 : 1;
  }

  const forwardDistance = (clipIndex - activeIndex + clipCount) % clipCount;

  if (forwardDistance === 0) {
    return 0;
  }

  if (forwardDistance === 1) {
    return 1;
  }

  if (forwardDistance === clipCount - 1) {
    return -1;
  }

  return forwardDistance < clipCount / 2 ? 2 : -2;
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
  if (options?.focusMessage) {
    shouldFocusContactMessageRef.current = true;
  }

  setContactSubmitState({
    status: "idle",
    message: "",
  });
  setShowRates(false);
  setShowContactForm(true);
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

const isAnyModalOpen = isDetailsModalMounted || isAddProjectModalMounted;
const activeProjects = portfolioProjects[activeBox] || [];
const isVideoEditShowcase = activeBox === "Video Edit";
const videoProjectGroups = isVideoEditShowcase ? groupVideoProjects(activeProjects) : [];
const totalVideoClipCount = isVideoEditShowcase
  ? videoProjectGroups.reduce((total, group) => total + group.clips.length, 0)
  : 0;
const totalCreativeProjects =
  (portfolioProjects["Graphic Design"]?.length || 0) +
  (portfolioProjects["Video Edit"]?.length || 0);
const totalCertificates = portfolioProjects.Certificates?.length || 0;
const activeCategoryMeta =
  portfolioCategories.find((item) => item.name === activeBox) ?? portfolioCategories[0];
const activeCategoryCountText =
  isVideoEditShowcase && videoProjectGroups.length > 0
    ? `${totalVideoClipCount} ${totalVideoClipCount === 1 ? "clip" : "clips"} across ${
        videoProjectGroups.length
      } ${
        videoProjectGroups.length === 1 ? "project carousel" : "project carousels"
      }.`
    : `${activeProjects.length} ${activeProjects.length === 1 ? "item" : "items"} currently showing.`;
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
    icon: SiAdobepremierepro,
    description:
      "My main workspace for pacing, story cuts, transitions, audio cleanup, and polished final exports.",
    accent: "#a78bfa",
    glow: "rgba(126, 34, 206, 0.18)",
    badgeBackground:
      "linear-gradient(135deg, rgba(32, 10, 58, 0.98), rgba(95, 38, 181, 0.96))",
    badgeBorder: "rgba(201, 168, 255, 0.34)",
    panelBackground:
      "linear-gradient(135deg, rgba(72, 31, 128, 0.26), rgba(8, 11, 20, 0.88) 64%)",
  },
  {
    name: "Adobe Photoshop",
    icon: SiAdobephotoshop,
    description:
      "Used for retouching, poster visuals, thumbnails, compositing, and sharpening the final look of a frame.",
    accent: "#6ee7ff",
    glow: "rgba(14, 165, 233, 0.14)",
    badgeBackground:
      "linear-gradient(135deg, rgba(3, 31, 54, 0.98), rgba(14, 116, 144, 0.96))",
    badgeBorder: "rgba(125, 233, 255, 0.3)",
    panelBackground:
      "linear-gradient(135deg, rgba(10, 72, 108, 0.24), rgba(8, 11, 20, 0.88) 66%)",
  },
  {
    name: "Adobe After Effects",
    icon: SiAdobeaftereffects,
    description:
      "For motion graphics, transitions, layered animation, and adding cinematic movement that elevates an edit.",
    accent: "#d8b4fe",
    glow: "rgba(168, 85, 247, 0.14)",
    badgeBackground:
      "linear-gradient(135deg, rgba(28, 14, 56, 0.98), rgba(107, 55, 176, 0.96))",
    badgeBorder: "rgba(227, 197, 255, 0.28)",
    panelBackground:
      "linear-gradient(135deg, rgba(73, 35, 123, 0.24), rgba(8, 11, 20, 0.88) 66%)",
  },
  {
    name: "Canva",
    icon: SiCanva,
    description:
      "Great for rapid social graphics, clean layouts, client-ready mockups, and quick-turn visual concepts.",
    accent: "#7df9ff",
    glow: "rgba(34, 211, 238, 0.13)",
    badgeBackground:
      "linear-gradient(135deg, rgba(8, 58, 72, 0.98), rgba(9, 118, 138, 0.96))",
    badgeBorder: "rgba(154, 246, 255, 0.28)",
    panelBackground:
      "linear-gradient(135deg, rgba(12, 88, 104, 0.22), rgba(8, 11, 20, 0.88) 68%)",
  },
  {
    name: "Adobe Illustrator",
    icon: SiAdobeillustrator,
    description:
      "Used when a project needs crisp vector marks, icon work, title treatments, or scalable layout details.",
    accent: "#fdba74",
    glow: "rgba(249, 115, 22, 0.13)",
    badgeBackground:
      "linear-gradient(135deg, rgba(72, 29, 8, 0.98), rgba(154, 73, 12, 0.96))",
    badgeBorder: "rgba(255, 191, 116, 0.28)",
    panelBackground:
      "linear-gradient(135deg, rgba(107, 51, 16, 0.22), rgba(8, 11, 20, 0.88) 68%)",
  },
] as const;
const creativeExperienceEntries = [
  {
    role: "Short-Form Video Editing",
    client: "Kayla",
    period: "2024",
    points: [
      "Edited short-form video content for B2B and business platforms, tailored to support and empower women facing professional and personal challenges.",
      "Enhanced storytelling through precise cuts, captions, and pacing to deliver clear, engaging, and value-driven messages.",
      "Applied motion graphics, subtitles, and audio optimization to improve clarity, accessibility, and audience engagement.",
    ],
  },
  {
    role: "Short-Form and Long-Form Video Editing",
    client: "Vast Professionals",
    period: "2025-2026",
    points: [
      "Edited and optimized short-form and long-form video content, ensuring strong storytelling, pacing, and platform-ready delivery.",
      "Created motion graphics, visual effects, and performed color correction and grading to maintain visual quality and brand consistency.",
      "Designed and mixed audio, including music, sound effects, and voiceovers, to enhance overall viewer engagement.",
    ],
  },
  {
    role: "Long-Form Video Editor",
    client: "Henry Sims",
    period: "2026-Present",
    points: [
      "Edited long-form videos with fast-paced storytelling, strong hooks, and a focus on viewer retention.",
      "Incorporated motion graphics, dynamic subtitles, and visual elements to simplify complex information and maintain engagement.",
      "Produced polished, informative content with smooth transitions, sound design, and attention to detail.",
    ],
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
        <div
          className={`fixed inset-0 z-[9999] pointer-events-none overflow-hidden transition-opacity duration-700 ${
            introExit ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="absolute inset-0 bg-black/88" />
          <div
            className={`absolute inset-0 ${
              introPulse ? "intro-backdrop-active" : "intro-backdrop-idle"
            }`}
          />
          <div className={`intro-scanline ${introPulse ? "intro-scanline-active" : ""}`} />
          <div className={`intro-burst ${introPulse ? "intro-burst-active" : ""}`} />

          <div
            className={`relative z-10 flex h-full items-center justify-center transition-[opacity,transform] duration-280 ease-out ${
              introLogoVisible
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-75 translate-y-3"
            }`}
          >
            <div className="intro-logo-shell">
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
      )}

      {/* HERO ATMOSPHERE */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(1,4,8,0.56) 0%, rgba(1,3,6,0.82) 58%, rgba(1,2,5,0.95) 100%), linear-gradient(122deg, rgba(255,255,255,0.02) 0%, transparent 30%, transparent 72%, rgba(255,255,255,0.01) 100%), radial-gradient(circle at 50% 0%, rgba(255,255,255,0.018) 0%, transparent 34%), radial-gradient(circle at 50% 40%, rgba(0,153,255,0.06) 0%, transparent 24%), radial-gradient(circle at 18% 56%, rgba(0,153,255,0.05) 0%, transparent 22%), radial-gradient(circle at 82% 72%, rgba(255,255,255,0.04) 0%, transparent 18%), radial-gradient(circle at 38% 92%, rgba(0,153,255,0.045) 0%, transparent 24%)",
          }}
        />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(143,220,255,0.08)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:linear-gradient(180deg,transparent_0%,black_12%,black_92%,transparent_100%)]" />
        <div
          className="absolute left-[-12%] top-[12%] hidden h-[30rem] w-[30rem] opacity-60 lg:block"
          style={{
            borderRadius: "999px",
            background:
              "conic-gradient(from 165deg, transparent 0deg, rgba(214,225,238,0.12) 64deg, transparent 110deg, transparent 360deg)",
            WebkitMask:
              "radial-gradient(circle, transparent 61%, black 63%, black 65.5%, transparent 67.5%)",
            mask:
              "radial-gradient(circle, transparent 61%, black 63%, black 65.5%, transparent 67.5%)",
          }}
        />
        <div className="absolute left-1/2 top-[7%] h-px w-[58vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-70" />
        <div className="absolute left-1/2 top-[9%] h-24 w-[50vw] -translate-x-1/2 bg-[radial-gradient(circle,rgba(0,153,255,0.12)_0%,rgba(0,153,255,0.045)_44%,transparent_74%)] blur-3xl opacity-40" />
        <div className="absolute left-[8%] top-[34%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.08)_0%,transparent_72%)] blur-3xl sm:h-52 sm:w-52" />
        <div className="absolute right-[10%] top-[46%] h-28 w-28 rounded-[28px] border border-white/6 opacity-45 rotate-[10deg] sm:h-36 sm:w-36" />
        <div className="absolute left-[14%] top-[63%] h-20 w-[36%] bg-[radial-gradient(circle,rgba(255,255,255,0.07)_0%,transparent_72%)] blur-3xl sm:h-24" />
        <div className="absolute right-[12%] top-[78%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.07)_0%,transparent_74%)] blur-3xl sm:h-52 sm:w-52" />
        <div className="absolute left-[9%] top-[88%] h-24 w-24 rounded-full border border-[#8fdcff]/10 opacity-50 sm:h-32 sm:w-32" />
        <div className="absolute inset-y-[18%] left-[6%] w-px bg-gradient-to-b from-transparent via-white/12 to-transparent opacity-60" />
        <div className="absolute inset-y-[28%] right-[7%] w-px bg-gradient-to-b from-transparent via-[#8fdcff]/14 to-transparent opacity-60" />
        <div className="absolute left-1/2 bottom-[7%] h-40 w-[84%] -translate-x-1/2 bg-[radial-gradient(circle,rgba(0,153,255,0.08)_0%,rgba(0,153,255,0.025)_36%,transparent_74%)] blur-3xl opacity-80" />
      </div>

      {/* NAVBAR */}
      <div className="relative z-50 px-2 pt-3 sm:px-4 lg:px-5">
        <nav
         ref={navbarRef}
          className="sticky top-3 mx-auto w-full max-w-[1520px] overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(4,8,14,0.9),rgba(5,10,18,0.76))] px-3 py-3.5 font-semibold tracking-[0.02em] shadow-[0_22px_60px_rgba(0,0,0,0.3)] backdrop-blur-2xl lg:px-5"
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

        <div className="pointer-events-none absolute left-1/2 top-full h-14 w-[min(88vw,1180px)] -translate-x-1/2 bg-[radial-gradient(circle,rgba(118,208,255,0.2)_0%,rgba(118,208,255,0.08)_38%,transparent_72%)] blur-2xl" />
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

      {/* HERO STACK */}
      <div ref={heroRef} className="relative z-10 flex flex-col items-center justify-center pt-[30vh] sm:pt-[34vh] lg:pt-[40vh]">
        <div
          className="absolute"
          style={{
            transform: "translateY(12%) scaleY(1.2)",
            transformOrigin: "center",
          }}
        >
          <span
            className="pointer-events-none absolute left-0 top-0 select-none text-[11px] text-gray-400 sm:text-base"
            style={{
              transform: "translate(8%, -8%)",
              fontFamily: "Calibri, sans-serif",
              lineHeight: "1.2",
              whiteSpace: "nowrap",
            }}
          >
            {videoText}
            {!videoDone && (
              <span className="inline-block w-[1px] h-[1em] bg-gray-400 ml-1 animate-blink align-baseline" />
            )}
          </span>

          <span
            className="pointer-events-none absolute right-0 top-0 select-none text-[11px] text-gray-400 sm:text-base"
            style={{
              transform: "translate(-8%, -22%)",
              fontFamily: "Calibri, sans-serif",
              lineHeight: "1.2",
              whiteSpace: "nowrap",
            }}
          >
            {graphicText}
            {videoDone && !graphicDone && (
              <span className="inline-block w-[1px] h-[1em] bg-gray-400 ml-1 animate-blink align-baseline" />
            )}
          </span>

          <div className="relative inline-block align-top">
            <h1
              className={`
                text-[8.25rem] sm:text-[13rem] md:text-[22rem] lg:text-[32rem] xl:text-[40rem]
                portfolio-heading portfolio-main-text select-none pointer-events-none leading-none
                text-white/38
              `}
              data-text="PORTFOLIO"
            >
              PORTFOLIO
            </h1>
          </div>
        </div>

        <div
          className={`pointer-events-none absolute left-1/2 top-[5%] z-10 hidden h-[34rem] w-[34rem] -translate-x-1/2 rounded-full transition-[opacity,transform] duration-[780ms] ease-out lg:block ${
            imageVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          style={{
            background:
              "radial-gradient(circle, rgba(0,153,255,0.18) 0%, rgba(0,153,255,0.07) 28%, rgba(255,255,255,0.04) 44%, transparent 72%)",
            filter: "blur(10px)",
          }}
        />
        <div
          className={`pointer-events-none absolute left-1/2 top-[8%] z-10 hidden h-[31rem] w-[31rem] -translate-x-1/2 transition-[opacity,transform] duration-[780ms] ease-out lg:block ${
            imageVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{
            background:
              "conic-gradient(from 205deg, transparent 0deg, rgba(143,227,255,0.16) 54deg, transparent 112deg, transparent 360deg)",
            WebkitMask:
              "radial-gradient(circle, transparent 61%, black 63%, black 65.5%, transparent 67.5%)",
            mask:
              "radial-gradient(circle, transparent 61%, black 63%, black 65.5%, transparent 67.5%)",
          }}
        />

        <div
          className={`pointer-events-none absolute z-20 transition-all duration-1000 ${
            imageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ top: "1%" }}
        >
          <Image
            src="/v6.png"
            alt="Wens"
            width={810}
            height={810}
            priority
            className="h-auto w-[22rem] max-w-[84vw] object-contain grayscale brightness-[1.1] contrast-[1.12] drop-shadow-[0_30px_80px_rgba(0,0,0,0.56)] sm:w-[28rem] md:w-[38rem] lg:w-[50rem]"
          />
        </div>

        <div className="pointer-events-none absolute left-[10%] right-[10%] top-[64%] z-[11] hidden h-[23rem] -translate-y-1/2 xl:block">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
            {heroSignatureFrames.map((frame, index) => {
              const isActive = activeHeroMarker === index;
              const layout = heroMarkerLayouts[index];
              const lineLoadDelay = 180 + index * 120;

              if (!layout) return null;

              return (
                <path
                  key={frame.key}
                  d={`M ${layout.anchorX} ${layout.anchorY} L ${layout.bendX} ${layout.bendY} L ${layout.circleX} ${layout.circleY}`}
                  fill="none"
                  stroke={isActive ? "rgba(168,235,255,0.88)" : "rgba(255,255,255,0.3)"}
                  strokeWidth={isActive ? 0.3 : 0.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  style={{
                    opacity: imageVisible ? 1 : 0,
                    strokeDasharray: 1,
                    strokeDashoffset: imageVisible ? 0 : 1,
                    transition: `stroke-dashoffset 860ms cubic-bezier(0.22,1,0.36,1) ${lineLoadDelay}ms, opacity 320ms ease-out ${lineLoadDelay}ms, stroke 260ms ease-out, stroke-width 260ms ease-out`,
                  }}
                />
              );
            })}
          </svg>
        </div>

        <div className="absolute left-[10%] right-[10%] top-[64%] z-[12] hidden h-[23rem] -translate-y-1/2 xl:block">
          {heroSignatureFrames.map((frame, index) => {
            const Icon = frame.icon;
            const isActive = activeHeroMarker === index;
            const layout = heroMarkerLayouts[index];
            const popupOffsetRem =
              frame.key === "identity" ? -4 : frame.key === "finish" ? 4 : 0;
            const markerLoadDelay = 420 + index * 110;

            if (!layout) return null;

            return (
              <div
                key={frame.key}
                className="absolute"
                style={{
                  left: `${layout.circleX}%`,
                  top: `${layout.circleY}%`,
                  opacity: imageVisible ? 1 : 0,
                  transform: imageVisible
                    ? "translate(-50%, -50%) scale(1)"
                    : "translate(-50%, -50%) scale(0.72)",
                  transition: `transform 560ms cubic-bezier(0.22,1,0.36,1) ${markerLoadDelay}ms, opacity 320ms ease-out ${markerLoadDelay}ms`,
                }}
              >
                <button
                  type="button"
                  data-hero-marker-button="true"
                  aria-pressed={isActive}
                  onClick={() =>
                    setActiveHeroMarker((currentMarker) =>
                      currentMarker === index ? null : index
                    )
                  }
                  className={`relative flex h-7 w-7 items-center justify-center rounded-full border bg-transparent transition-[transform,border-color,box-shadow] duration-220 ease-out ${
                    isActive
                      ? "scale-105 border-[#8fdcff]/58 shadow-[0_0_14px_rgba(143,227,255,0.16)]"
                      : "border-white/20 hover:scale-[1.04] hover:border-[#8fdcff]/34 hover:shadow-[0_0_10px_rgba(143,227,255,0.1)]"
                  }`}
                >
                  <span
                    className={`absolute inset-[3px] rounded-full border transition-colors duration-220 ${
                      isActive ? "border-[#8fdcff]/44" : "border-white/12"
                    }`}
                  />
                  <span
                    className={`relative h-1.5 w-1.5 rounded-full transition-all duration-220 ${
                      isActive
                        ? "bg-[#eafcff] shadow-[0_0_8px_rgba(143,227,255,0.58)]"
                        : "bg-white/78 shadow-[0_0_6px_rgba(255,255,255,0.12)]"
                    }`}
                  />
                </button>

                <div
                  className={`absolute w-[232px] transition-[opacity,transform,filter] duration-220 ease-out ${
                    isActive
                      ? "pointer-events-auto -translate-x-1/2 translate-y-0 opacity-100 blur-0"
                      : "pointer-events-none -translate-x-1/2 translate-y-2 opacity-0 blur-[2px]"
                  }`}
                  style={{
                    left: `calc(50% + ${popupOffsetRem}rem)`,
                    top: "2.45rem",
                  }}
                >
                  <div className="relative overflow-hidden rounded-[16px] border border-white/10 bg-[linear-gradient(135deg,rgba(5,11,18,0.92),rgba(8,17,27,0.8))] px-4 py-2 shadow-[0_16px_36px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(143,227,255,0.08),transparent_44%)]" />
                    <div className="relative flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#9be8ff]">
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] uppercase tracking-[0.26em] text-[#8fdcff]/68">
                          Signature Frame
                        </p>
                        <p className="mt-0.5 text-[13px] font-semibold leading-snug text-white">
                          {frame.title}
                        </p>
                        <p className="mt-0.5 text-[10px] leading-snug text-white/58">
                          {frame.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* ===== ABOUT ME SECTION ===== */}
      <div
        ref={aboutRef}
        className="relative mt-[610px] flex flex-col items-center overflow-visible transition-all duration-700 ease-out"
      >
        <div className="pointer-events-none absolute inset-0">
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
            </div>

            <div className="relative mt-4 grid w-full gap-4 xl:grid-cols-[minmax(280px,0.58fr)_minmax(0,1.42fr)] xl:items-start">
              <div
                className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,23,31,0.94),rgba(10,15,22,0.92))] p-5 transition-[opacity,transform] duration-500 ease-out ${
                  helloVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
                }`}
              >
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/16 to-transparent" />
                  <div className="absolute left-1/2 top-[28%] h-44 w-44 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.13)_0%,transparent_74%)] blur-3xl" />
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
                      Hello! I am
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
                      4th-year BSIT student, video editor, and graphic designer focused on
                      clear storytelling, clean execution, and platform-ready creative work.
                    </p>

                    <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-[#8fdcff]/78">
                      Video Editor • Graphic Designer
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href="https://your-link-1.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]"
                        >
                          <div
                            className="absolute inset-0 opacity-0 transition-opacity duration-180 ease-out group-hover:opacity-100"
                            style={{
                              backgroundColor: "#0099ff",
                              WebkitMaskImage: "url('/linkedin.png')",
                              WebkitMaskRepeat: "no-repeat",
                              WebkitMaskSize: "18px",
                              WebkitMaskPosition: "center",
                              maskImage: "url('/linkedin.png')",
                              maskRepeat: "no-repeat",
                              maskSize: "18px",
                              maskPosition: "center",
                            }}
                          />
                          <img
                            src="/linkedin.png"
                            alt="LinkedIn"
                            className="h-[18px] w-[18px] object-contain brightness-0 invert transition-opacity duration-180 ease-out group-hover:opacity-0"
                          />
                        </a>

                        <a
                          href="https://your-link-2.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]"
                        >
                          <div
                            className="absolute inset-0 opacity-0 transition-opacity duration-180 ease-out group-hover:opacity-100"
                            style={{
                              backgroundColor: "#0099ff",
                              WebkitMaskImage: "url('/behance.png')",
                              WebkitMaskRepeat: "no-repeat",
                              WebkitMaskSize: "18px",
                              WebkitMaskPosition: "center",
                              maskImage: "url('/behance.png')",
                              maskRepeat: "no-repeat",
                              maskSize: "18px",
                              maskPosition: "center",
                            }}
                          />
                          <img
                            src="/behance.png"
                            alt="Behance"
                            className="h-[18px] w-[18px] object-contain brightness-0 invert transition-opacity duration-180 ease-out group-hover:opacity-0"
                          />
                        </a>

                        <a
                          href="https://your-link-3.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]"
                        >
                          <div
                            className="absolute inset-0 opacity-0 transition-opacity duration-180 ease-out group-hover:opacity-100"
                            style={{
                              backgroundColor: "#0099ff",
                              WebkitMaskImage: "url('/upwork.png')",
                              WebkitMaskRepeat: "no-repeat",
                              WebkitMaskSize: "18px",
                              WebkitMaskPosition: "center",
                              maskImage: "url('/upwork.png')",
                              maskRepeat: "no-repeat",
                              maskSize: "18px",
                              maskPosition: "center",
                            }}
                          />
                          <img
                            src="/upwork.png"
                            alt="Upwork"
                            className="h-[18px] w-[18px] object-contain brightness-0 invert transition-opacity duration-180 ease-out group-hover:opacity-0"
                          />
                        </a>
                      </div>

                      <div className="min-w-0 flex-1 self-center">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[#8fdcff]/78">
                          Response Time
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-white/68">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#8fdcff] shadow-[0_0_10px_rgba(143,220,255,0.6)]" />
                          <span>Replies within 24 hours</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid w-full max-w-[420px] grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                      <a
                        href="/Wence-De-Vera-CV.pdf"
                        download
                        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#8fdcff]/25 bg-[#8fdcff]/10 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b9eeff] transition-[transform,border-color,background-color] duration-160 ease-out hover:-translate-y-0.5 hover:border-[#8fdcff]/40"
                      >
                        Download CV
                      </a>

                      <a
                        href="#projects"
                        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72 transition-[transform,border-color,background-color] duration-160 ease-out hover:-translate-y-0.5 hover:border-white/20"
                      >
                        View Projects
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`relative overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(34,40,49,0.97),rgba(19,24,32,0.95))] p-5 transition-[opacity,transform] duration-500 ease-out ${
                  helloVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
                }`}
                style={{ transitionDelay: "0.08s" }}
              >
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
                  <div className="absolute right-[8%] top-[10%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.08)_0%,transparent_74%)] blur-3xl" />
                </div>

                <div className="relative z-10">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#8fdcff]">
                    Profile Overview
                  </p>
                  <h4 className="mt-3 max-w-xl text-xl font-semibold text-white sm:text-2xl">
                    A detail-first editor blending technical perspective with polished,
                    platform-ready storytelling.
                  </h4>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/70 sm:text-base">
                    I am a 4th-year BSIT student with 2 years of hands-on editing
                    experience. I focus on cinematic pacing, strong viewer retention,
                    clean motion work, and thoughtful sound design so every output feels
                    intentional from first cut to final export.
                  </p>

                  <div className="mt-8 rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.035))] px-4 py-3 sm:px-5">
                    <div className="grid gap-2 text-[10px] uppercase tracking-[0.22em] text-white/44 sm:grid-cols-[1.45fr_0.85fr_0.5fr] sm:items-center">
                      <span>What I Did</span>
                      <span>Client</span>
                      <span>Period</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-6">
                    {creativeExperienceEntries.map((experience) => (
                      <div
                        key={`${experience.client}-${experience.role}`}
                        className="rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(68,74,86,0.4),rgba(24,29,37,0.84))] px-4 py-4 sm:px-5 sm:py-5"
                      >
                        <div className="grid gap-3 sm:grid-cols-[1.45fr_0.85fr_0.5fr] sm:items-start">
                          <div className="min-w-0">
                            <h4 className="text-lg font-semibold text-white">
                              {experience.role}
                            </h4>
                          </div>
                          <p className="text-sm font-medium text-[#b9eeff]">
                            {experience.client}
                          </p>
                          <span className="self-start rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/58">
                            {experience.period}
                          </span>
                        </div>

                        <ul className="mt-4 space-y-3">
                          {experience.points.map((point, pointIndex) => (
                            <li
                              key={`${experience.client}-${pointIndex}`}
                              className="flex items-start gap-3"
                            >
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#8fdcff]" />
                              <p className="text-sm leading-relaxed text-white/68">{point}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            </div>
          </div>
        </div>
      </div>

<div className="relative mt-16 flex flex-col items-center overflow-visible transition-all duration-700 ease-out lg:mt-20">
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute left-[6%] top-[8%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.1)_0%,transparent_72%)] blur-3xl" />
    <div className="absolute right-[7%] bottom-[12%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,145,72,0.07)_0%,transparent_74%)] blur-3xl" />
    <div className="absolute inset-x-[14%] top-1/2 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
  </div>

  <div
    className={`${glassSectionClass} z-10 transition-[opacity,transform] duration-420 ease-out ${
      showAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
    }`}
    style={{ transitionDelay: showAbout ? "0.2s" : "0s" }}
  >
    <GlowingEffect {...mainSectionGlowProps} className="z-[2]" />
    <div className={glassSectionPanelClass}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="absolute right-[10%] top-[14%] h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.08)_0%,transparent_74%)] blur-3xl" />
      </div>

      <div className={glassSectionInnerClass}>
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/16 to-transparent" />
            <div className="absolute left-[12%] top-[14%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.08)_0%,transparent_72%)] blur-3xl" />
            <div className="absolute right-[10%] bottom-[10%] h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(255,145,72,0.06)_0%,transparent_74%)] blur-3xl" />
          </div>

          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.32em] text-[#8fdcff]">Creative Stack</p>
            <h2
              className="mt-4 text-3xl font-bold text-white sm:text-4xl"
              style={{
                fontFamily: "'CreatoDisplay', sans-serif",
                letterSpacing: "0.03em",
                textShadow: "0 0 10px rgba(0,153,255,0.11)",
              }}
            >
              Creative tools I use.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
              A small creative stack, but each tool has a clear role in how I cut, design,
              animate, and finish a project.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {creativeTools.map((tool) => {
                const ToolIcon = tool.icon;

                return (
                  <div
                    key={tool.name}
                    className="group relative min-h-[280px] overflow-hidden rounded-[28px] border border-white/12 p-5 backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-white/22"
                    style={{
                      background: tool.panelBackground,
                      boxShadow: `0 18px 42px ${tool.glow}`,
                    }}
                  >
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/16 to-transparent" />
                      <div
                        className="absolute left-1/2 top-4 h-24 w-24 -translate-x-1/2 rounded-full blur-3xl opacity-90"
                        style={{
                          background: `radial-gradient(circle, ${tool.glow} 0%, transparent 72%)`,
                        }}
                      />
                      <div
                        className="absolute bottom-[-8%] right-[-6%] h-24 w-24 rounded-full border border-white/8"
                        style={{ opacity: 0.5 }}
                      />
                      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:20px_20px]" />
                    </div>

                    <div className="relative z-10 flex h-full flex-col items-center text-center">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-[20px] border sm:h-[72px] sm:w-[72px]"
                        style={{
                          background: tool.badgeBackground,
                          borderColor: tool.badgeBorder,
                          color: tool.accent,
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 22px ${tool.glow}`,
                        }}
                      >
                        <ToolIcon className="h-8 w-8 sm:h-9 sm:w-9" />
                      </div>

                      <div className="mt-6 min-w-0">
                        <h3 className="text-lg font-semibold text-white sm:text-xl">{tool.name}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-white/72">
                          {tool.description}
                        </p>
                      </div>

                      <div className="mt-auto pt-8">
                        <ToolIcon
                          className="h-14 w-14 opacity-[0.12]"
                          style={{ color: tool.accent }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
  </div>
</div>
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

  <div className={`${glassSectionClass} z-10`}>
    <GlowingEffect {...mainSectionGlowProps} className="z-[2]" />
    <div className={glassSectionPanelClass}>
      <div
        className={`pointer-events-none absolute inset-0 z-30 rounded-[24px] bg-black/40 transition-opacity duration-300 ${
          isAnyModalOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="absolute right-[7%] top-[12%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.12)_0%,transparent_74%)] blur-3xl" />
      </div>

      <div className={`${glassSectionInnerClass} space-y-8`}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div
          className={`transition-[opacity,transform] duration-420 ease-out ${
            showPortfolio ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-6 scale-95"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.32em] text-[#8fdcff]">Portfolio</p>
          <h2
            className="mt-4 text-3xl font-bold text-white sm:text-4xl"
            style={{
              fontFamily: "'CreatoDisplay', sans-serif",
              letterSpacing: "0.03em",
              textShadow: "0 0 16px rgba(0,153,255,0.18)",
            }}
          >
            Portfolio Showcase
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/72 sm:text-base">
            Browse the work by category in one cleaner section. Graphic design keeps its visual
            card layout, while video edits now break into grouped carousels with playable clips
            inside the same showcase flow.
          </p>
        </div>

        <div
          className={`transition-[opacity,transform] duration-420 ease-out ${
            showPortfolio ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"
          }`}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/12 bg-black/20 p-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#8fdcff]">Creative Work</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalCreativeProjects}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/58">
                Graphics and edited video projects currently inside the showcase.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-black/20 p-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#8fdcff]">Certificates</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalCertificates}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/58">
                Validated milestones and proof of continuous learning.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-black/20 p-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#8fdcff]">Live Category</p>
              <p className="mt-3 text-lg font-semibold text-white">{activeCategoryMeta.name}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/58">
                {activeCategoryCountText}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`w-full transition-[opacity,transform] duration-[520ms] ease-out ${
          showPortfolio ? "opacity-100 translate-y-0 blur-0" : "pointer-events-none opacity-0 translate-y-8 blur-sm"
        }`}
      >
        <div className="rounded-[26px] border border-white/12 bg-black/20 p-4 backdrop-blur-md sm:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {portfolioCategories.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeBox === item.name;

              return (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setActiveBox(item.name);
                    setAnimateTab(false);
                    setTimeout(() => {
                      setAnimateTab(true);
                    }, 50);
                  }}
                  className={`group rounded-[22px] border p-4 text-left transition-[transform,border-color,background-color,box-shadow] duration-180 ease-out ${
                    isActive
                      ? "border-[#00d4ff]/24 bg-[#04101a]/68 shadow-[0_10px_22px_rgba(0,153,255,0.12)]"
                      : "border-white/12 bg-white/[0.04] hover:-translate-y-1 hover:border-[#00d4ff]/22 hover:bg-white/[0.07]"
                  }`}
                  style={{
                    animation: showPortfolio ? "fadeIn 0.7s ease forwards" : "none",
                    animationDelay: `${0.08 + index * 0.08}s`,
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                        isActive ? "bg-[#0099ff] text-white" : "bg-white/10 text-white/80"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span
                      className={`text-[11px] uppercase tracking-[0.22em] ${
                        isActive ? "text-[#9be8ff]" : "text-white/42"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-white">{item.name}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/60">{item.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-2 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 sm:px-5 sm:py-5">
            {showPortfolio &&
              (activeProjects.length > 0 ? (
                isVideoEditShowcase ? (
                  <div key={`${activeBox}-${animateTab ? "in" : "out"}`} className="space-y-6">
                    {videoProjectGroups.map((group, groupIndex) => {
                      const activeIndex = getVideoCarouselIndex(group.key, group.clips.length);
                      const activeClip = group.clips[activeIndex];
                      const activeProject = activeClip.project;
                      const groupMotion = videoCarouselMotion[group.key] ?? {
                        token: 0,
                        direction: 1 as const,
                      };
                      const isPortraitCarousel = group.aspectRatio === "portrait";
                      const carouselStageClass = isPortraitCarousel
                        ? "h-[250px] sm:h-[360px] lg:h-[420px]"
                        : "h-[210px] sm:h-[270px] lg:h-[320px]";
                      const carouselCardSizeClass = isPortraitCarousel
                        ? "w-[42%] aspect-[9/16] sm:w-[32%] lg:w-[25%]"
                        : "w-[82%] aspect-[16/9] sm:w-[66%] lg:w-[54%]";
                      const stageMotionClass =
                        groupMotion.token > 0
                          ? groupMotion.direction > 0
                            ? groupMotion.token % 2 === 0
                              ? "video-carousel-track-shift--to-left-a"
                              : "video-carousel-track-shift--to-left-b"
                            : groupMotion.token % 2 === 0
                              ? "video-carousel-track-shift--to-right-a"
                              : "video-carousel-track-shift--to-right-b"
                          : "";
                      const canSwitchClips = group.clips.length > 1;
                      const hasProjectLink =
                        activeProject.designLink.trim().length > 0 &&
                        activeProject.designLink.trim() !== "#";
                      const parentProjectLabel = getVideoProjectParentLabel(
                        activeProject,
                        group.name
                      );

                      return (
                        <section
                          key={`${activeBox}-${group.key}-${groupIndex}`}
                          className="relative px-1 pb-4 pt-3 opacity-0 translate-y-6 animate-fadeIn sm:px-1.5 sm:pb-5 sm:pt-4"
                          style={{ animationDelay: `${0.18 + groupIndex * 0.12}s` }}
                        >
                          <div className="pointer-events-none absolute inset-0">
                            <div className="absolute left-[10%] top-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.18)_0%,transparent_72%)] blur-3xl" />
                          </div>

                          <div className="relative z-10 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-md sm:px-5 sm:py-5 lg:px-6 lg:py-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.28em] text-[#8fdcff]">
                                  Project Title
                                </p>
                                <h3 className="mt-2 text-2xl font-semibold text-white sm:text-[1.9rem]">
                                  {group.name}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2 self-start sm:self-end">
                                <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/62">
                                  {group.clips.length} {group.clips.length === 1 ? "clip" : "clips"}
                                </span>
                                <span className="rounded-full border border-[#8fdcff]/20 bg-[#07131d] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#aeeaff]">
                                  Carousel
                                </span>
                              </div>
                            </div>

                            <div className="relative mt-5 overflow-hidden rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(143,220,255,0.14),transparent_34%),radial-gradient(circle_at_82%_16%,rgba(89,136,255,0.11),transparent_30%),linear-gradient(180deg,rgba(4,10,18,0.96),rgba(2,7,12,0.985))] px-3 py-5 shadow-[0_22px_70px_rgba(0,0,0,0.3)] sm:px-5 lg:px-6">
                              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:120px_120px]" />
                                <div className="absolute left-[-6%] top-[10%] h-40 w-40 rounded-full border border-[#8fdcff]/10 bg-[#8fdcff]/[0.05] blur-3xl sm:h-56 sm:w-56" />
                                <div className="absolute right-[-4%] top-[-8%] h-48 w-48 rounded-full border border-white/8 bg-[#153149]/25 blur-3xl sm:h-64 sm:w-64" />
                                <div className="absolute bottom-[-18%] left-1/2 h-40 w-[68%] -translate-x-1/2 rounded-full bg-[#8fdcff]/[0.05] blur-3xl" />
                                <div className="absolute left-[8%] top-[18%] h-24 w-24 rounded-[30px] border border-white/8 rotate-12" />
                                <div className="absolute right-[12%] bottom-[20%] h-20 w-20 rounded-full border border-[#8fdcff]/12" />
                                <div className="absolute inset-x-12 top-7 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
                                <div className="absolute inset-x-10 bottom-9 h-px bg-gradient-to-r from-transparent via-[#8fdcff]/12 to-transparent" />
                              </div>
                              <div
                                className={`relative mx-auto w-full max-w-[920px] ${carouselStageClass} ${stageMotionClass}`}
                              >
                                {group.clips.map((clip, index) => {
                                  const clipIsReady = clip.videoUrl.trim().length > 0;
                                  const clipOffset = getVideoCarouselClipOffset(
                                    index,
                                    activeIndex,
                                    group.clips.length
                                  );
                                  const isActiveCard = clipOffset === 0;
                                  const isVisibleCard = Math.abs(clipOffset) <= 1;
                                  const cardPositionClass =
                                    clipOffset === 0
                                      ? "z-30 opacity-100 translate-x-[-50%] scale-100 rotate-0 blur-0"
                                      : clipOffset < 0
                                        ? "z-20 opacity-55 translate-x-[-78%] scale-[0.8] -rotate-[5deg] blur-[1px] sm:translate-x-[-84%] lg:translate-x-[-88%]"
                                        : clipOffset === 1
                                          ? "z-10 opacity-55 translate-x-[-22%] scale-[0.8] rotate-[5deg] blur-[1px] sm:translate-x-[-16%] lg:translate-x-[-12%]"
                                          : clipOffset < 0
                                            ? "z-0 opacity-0 translate-x-[-100%] scale-[0.68] -rotate-[8deg]"
                                            : "z-0 opacity-0 translate-x-[0%] scale-[0.68] rotate-[8deg]";

                                  return (
                                    <div
                                      key={clip.key}
                                      className={`absolute left-1/2 top-1/2 -translate-y-1/2 transition-[transform,opacity,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${carouselCardSizeClass} ${cardPositionClass} ${
                                        isVisibleCard ? "" : "pointer-events-none"
                                      }`}
                                    >
                                      <div
                                        className={`relative h-full overflow-hidden rounded-[24px] border backdrop-blur-xl ${
                                          isActiveCard
                                            ? "border-[#8fdcff]/28 bg-black/30 shadow-[0_24px_60px_rgba(0,0,0,0.38)]"
                                            : "border-white/10 bg-black/25 shadow-[0_16px_40px_rgba(0,0,0,0.24)]"
                                        }`}
                                      >
                                        {isActiveCard ? (
                                          <div className="pointer-events-none absolute inset-0 z-10 rounded-[24px] ring-1 ring-[#8fdcff]/8 shadow-[inset_0_0_34px_rgba(125,225,255,0.14)]" />
                                        ) : null}
                                        {clipIsReady ? (
                                          <CarouselClipVideo
                                            playbackKey={clip.key}
                                            videoUrl={clip.videoUrl}
                                            posterUrl={clip.posterUrl || undefined}
                                            isActive={isActiveCard}
                                            isVisible={isVisibleCard}
                                            activePlaybackKey={activeCarouselPlaybackKey}
                                            onPlaybackStart={setActiveCarouselPlaybackKey}
                                          />
                                        ) : (
                                          <div
                                            className="flex h-full w-full items-center justify-center px-6 text-center"
                                            style={{
                                              background: clip.posterUrl || clipProject.image
                                                ? `linear-gradient(135deg, rgba(2, 6, 10, 0.76), rgba(2, 6, 10, 0.94)), url(${clip.posterUrl || clipProject.image}) center/cover`
                                                : "linear-gradient(135deg, rgba(4,10,18,0.98), rgba(6,18,28,0.92))",
                                            }}
                                          >
                                            <div className="max-w-xs">
                                              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/8 text-[#9ae9ff]">
                                                <Play className="ml-0.5 h-5 w-5" />
                                              </span>
                                              <p className="mt-3 text-sm font-semibold text-white">
                                                No direct video file added yet
                                              </p>
                                            </div>
                                          </div>
                                        )}

                                        {!isActiveCard && isVisibleCard ? (
                                          <div className="pointer-events-none absolute inset-0 bg-black/22" />
                                        ) : null}

                                        {!isActiveCard && isVisibleCard ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setVideoCarouselIndex(
                                                group.key,
                                                index,
                                                group.clips.length
                                              )
                                            }
                                            className="absolute inset-0 z-20 cursor-pointer"
                                            aria-label={`Show clip ${clip.clipIndex + 1} in ${group.name}`}
                                          />
                                        ) : null}
                                      </div>
                                    </div>
                                  );
                                })}

                                {canSwitchClips ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        shiftVideoCarousel(group.key, -1, group.clips.length)
                                      }
                                      className="absolute left-0 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-black/55 text-white/88 backdrop-blur-md transition-colors hover:bg-black/75 sm:left-3"
                                      aria-label={`Show previous video in ${group.name}`}
                                    >
                                      <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        shiftVideoCarousel(group.key, 1, group.clips.length)
                                      }
                                      className="absolute right-0 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-black/55 text-white/88 backdrop-blur-md transition-colors hover:bg-black/75 sm:right-3"
                                      aria-label={`Show next video in ${group.name}`}
                                    >
                                      <ChevronRight className="h-5 w-5" />
                                    </button>
                                  </>
                                ) : null}
                              </div>
                            </div>

                            <div className="mt-6 rounded-[22px] border border-white/10 bg-black/20 px-5 py-5 sm:px-6 sm:py-6">
                              <div className="flex flex-col gap-5">
                                <div>
                                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                                  Project
                                </p>
                                <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                                  <h4 className="text-lg font-semibold text-white sm:text-[1.15rem]">
                                    {activeProject.title}
                                  </h4>
                                  {parentProjectLabel ? (
                                    <span className="text-xs font-medium text-white/56">
                                      under {parentProjectLabel}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/68">
                                  {activeProject.description}
                                </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 border-t border-white/8 pt-4">
                                  {hasProjectLink ? (
                                    <a
                                      href={activeProject.designLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-[#8fdcff]/22 bg-[#07141f] px-4 py-2 text-sm font-semibold text-[#b6efff] transition-colors hover:bg-[#0a1b29]"
                                    >
                                      Open project link
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  ) : null}
                                  <span className="inline-flex w-fit rounded-full border border-white/12 bg-black/30 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/56">
                                    Clip {activeIndex + 1} / {group.clips.length}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    key={`${activeBox}-${animateTab ? "in" : "out"}`}
                    className="grid grid-cols-1 auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3"
                  >
                    {activeProjects.map((project, index) => (
                      <div
                        key={`${activeBox}-${project.title}-${index}`}
                        className="-mt-4 h-full opacity-0 translate-y-6 animate-fadeIn"
                        style={{ animationDelay: `${0.18 + index * 0.12}s` }}
                      >
                        <CardContainer
                          className="h-full w-full !items-start !justify-start"
                          containerClassName="h-full !items-start !justify-start"
                        >
                          <CardBody className="relative flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-xl transition-all duration-700 hover:scale-[1.02] hover:bg-white/20 hover:shadow-[0_0_15px_rgba(0,153,255,0.3)]">
                            <CardItem translateZ={90} className="w-full">
                              <Image
                                src={project.image}
                                alt={project.title}
                                width={400}
                                height={250}
                                className="mb-4 h-[220px] w-full rounded-[18px] object-cover"
                              />
                            </CardItem>

                            <CardItem translateZ={55} className="w-full">
                              <h3 className="project-heading mb-1 text-m tracking-wider text-white line-clamp-1">
                                {project.title}
                              </h3>
                            </CardItem>
                            <CardItem translateZ={45} className="w-full flex-1">
                              <p className="mt-2 mb-4 text-xs text-white/80 line-clamp-3">
                                {project.description}
                              </p>
                            </CardItem>

                            <div className="relative z-20 mt-4 flex w-full items-center justify-between gap-3 pointer-events-auto">
                              <a
                                href={project.designLink}
                                data-no-tilt="true"
                                className="flex items-center gap-2 text-xs font-semibold text-[#0099ff] hover:underline"
                              >
                                Link to design
                                <ExternalLink className="h-3 w-3 -mt-[0px] -ml-1" />
                              </a>

                              <InteractiveHoverButton
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowModal(true);
                                }}
                                data-no-tilt="true"
                                defaultLabel="Details"
                                hoverLabel="Open"
                                className="cursor-pointer"
                              />
                            </div>
                          </CardBody>
                        </CardContainer>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div
                  key={`${activeBox}-${animateTab ? "in" : "out"}-empty`}
                  className="mt-5 rounded-[20px] border border-dashed border-white/12 bg-black/20 px-5 py-10 text-center"
                >
                  <p className="text-sm text-white/72 sm:text-base">
                    {isVideoEditShowcase
                      ? "No video edits in this showcase yet."
                      : `No projects in ${activeBox} yet.`}
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    {isVideoEditShowcase
                      ? "Add a video edit in Studio, assign it to a category, and include a direct video file so the carousel can play it here."
                      : "Add work to this category and it will appear here automatically."}
                  </p>
                </div>
              ))}
          </div>
        </div>
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
                  Video Carousel Setup
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/60">
                  Each Video Edit project becomes one carousel. Leave the heading blank to use the
                  project title, then add one or more video clips below.
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
</div>


  </div>












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
        .intro-backdrop-idle {
          background: radial-gradient(circle at 50% 50%, rgba(10, 10, 10, 0.92) 0%, rgba(0, 0, 0, 1) 72%);
          opacity: 1;
        }
        .intro-backdrop-active {
          background: radial-gradient(circle at 50% 42%, rgba(0, 153, 255, 0.16) 0%, rgba(0, 0, 0, 0.98) 58%, #000 100%);
          animation: introBackdrop 1.5s ease-out forwards;
        }
        .intro-scanline {
          position: absolute;
          inset: -30% -10%;
          background: linear-gradient(110deg, transparent 0%, rgba(0, 153, 255, 0.18) 40%, rgba(255, 255, 255, 0.5) 50%, rgba(0, 153, 255, 0.18) 60%, transparent 100%);
          transform: translateX(-65%) skewX(-12deg);
          opacity: 0;
        }
        .intro-scanline-active {
          animation: introScan 0.86s ease-out forwards;
        }
        .intro-burst {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 22rem;
          height: 22rem;
          border-radius: 9999px;
          border: 1px solid rgba(143, 211, 255, 0.45);
          transform: translate(-50%, -50%) scale(0.2);
          opacity: 0;
          box-shadow: 0 0 36px rgba(0, 153, 255, 0.18);
        }
        .intro-burst-active {
          animation: introBurst 1.3s cubic-bezier(0.2, 0.9, 0.25, 1) forwards;
        }
        .intro-logo-shell {
          position: relative;
          padding: 1rem;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.03) 62%, transparent 100%);
          border: 1px solid rgba(255, 255, 255, 0.24);
          box-shadow: 0 0 36px rgba(0, 153, 255, 0.3), inset 0 0 24px rgba(255, 255, 255, 0.1);
        }
        .intro-logo-mark {
          filter: drop-shadow(0 0 18px rgba(0, 153, 255, 0.7));
          animation: introLogoPulse 1.3s ease-out;
        }
        @keyframes introBackdrop {
          0% {
            opacity: 1;
            transform: scale(1.03);
          }
          60% {
            opacity: 1;
          }
          100% {
            opacity: 0.84;
            transform: scale(1);
          }
        }
        @keyframes introScan {
          0% {
            opacity: 0;
            transform: translateX(-65%) skewX(-12deg);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(65%) skewX(-12deg);
          }
        }
        @keyframes introBurst {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.2);
          }
          35% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.7);
          }
        }
        @keyframes introLogoPulse {
          0% {
            opacity: 0;
            transform: scale(0.7);
            filter: blur(8px) drop-shadow(0 0 0 rgba(0, 153, 255, 0));
          }
          65% {
            opacity: 1;
            transform: scale(1.08);
            filter: blur(0) drop-shadow(0 0 22px rgba(0, 153, 255, 0.9));
          }
          100% {
            transform: scale(1);
            filter: blur(0) drop-shadow(0 0 16px rgba(0, 153, 255, 0.75));
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
        @media (prefers-reduced-motion: reduce) {
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

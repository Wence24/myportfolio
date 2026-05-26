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
  tags?: string[];
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

export type FeaturedProjectIcon =
  | "clapperboard"
  | "monitor-play"
  | "film"
  | "layers"
  | "sparkles";

export type HomeFeaturedProject = {
  title: string;
  description: string;
  image: string;
  icon: FeaturedProjectIcon;
  href?: string;
};

export type HomeCreativeLane = {
  value: "video-editing" | "graphic-design" | "web-development";
  label: string;
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  imageSrc: string;
  imageAlt: string;
};

export type HomeAboutAccordionItem = {
  title: string;
  imageUrl: string;
};

export type HomeExperienceCard = {
  quote: string;
  name: string;
  role: string;
  image: string;
  videoUrl: string;
};

export type HomeContent = {
  hero: {
    eyebrow: string;
    line1: string;
    line2: string;
    highlight: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    contactCta: string;
    pills: string[];
  };
  featuredProjects: {
    eyebrow: string;
    titleMuted: string;
    titleStrong: string;
    description: string;
    scrollLengthVh: number;
    projects: HomeFeaturedProject[];
  };
  aboutAccordion: {
    eyebrow: string;
    title: string;
    description: string;
    secondaryDescription: string;
    ctaLabel: string;
    items: HomeAboutAccordionItem[];
  };
  creativeProfile: {
    titleMuted: string;
    titleStrong: string;
    lanes: HomeCreativeLane[];
  };
  experienceSection: {
    eyebrow: string;
    titleMuted: string;
    titleStrong: string;
    description: string;
    cards: HomeExperienceCard[];
  };
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
    .map((item) => {
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

export const defaultPortfolioProjects: PortfolioProjects = {
  "Graphic Design": [
    {
      title: "COMRADZ Sessions",
      description:
        "A weekly poster system for Sunday dance sessions, built around clear session details, strong visual rhythm, and a recognizable community look.",
      image: "/comradz.png",
      designLink: "#",
      showDetailsModal: true,
      details: {
        title: "COMRADZ Sessions",
        description:
          "A weekly poster designed to showcase the schedule, theme, and key information for each COMRADZ Sunday dance session. The layout keeps the details readable while giving the series a consistent visual identity.",
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
  "Video Edit": [
    {
      title: "Short-Form Motion Reel",
      description:
        "A fast social edit shaped around clean pacing, punchy cuts, and a ready-to-post finish for short-form content.",
      image: "/v2.png",
      designLink: "/vide1.mp4",
      videoCategory: "Short-form",
      videoParentLabel: "Social edit",
      videoAspectRatio: "landscape",
      videoUrl: "/vide1.mp4",
      videoUrls: ["/vide1.mp4"],
      videoPosterUrls: ["/v2.png"],
      showDetailsModal: false,
    },
    {
      title: "Cinematic Brand Cut",
      description:
        "A longer edit with stronger visual flow, cleaner transitions, and a more polished showcase-style presentation.",
      image: "/v3.png",
      designLink: "/VID.mp4",
      videoCategory: "Long-form",
      videoParentLabel: "Portfolio edit",
      videoAspectRatio: "landscape",
      videoUrl: "/VID.mp4",
      videoUrls: ["/VID.mp4"],
      videoPosterUrls: ["/v3.png"],
      showDetailsModal: false,
    },
  ],
  Websites: [],
};

export const defaultHomeContent: HomeContent = {
  hero: {
    eyebrow: "Creative portfolio",
    line1: "I turn footage",
    line2: "into stories that",
    highlight: "HIT DIFFERENT.",
    description:
      "Video edits, branded graphics, and clean website builds for creators, businesses, and brands that want something polished right away.",
    primaryCta: "View my work",
    secondaryCta: "Showreel",
    contactCta: "Start a project",
    pills: [
      "Short-form and long-form editing",
      "Brand graphics and posters",
      "Portfolio and business websites",
    ],
  },
  featuredProjects: {
    eyebrow: "",
    titleMuted: "Recent favorites.",
    titleStrong: "A closer look at each.",
    description: "",
    scrollLengthVh: 58,
    projects: [
      {
        title: "Featured Edit 01",
        description: "Story-first pacing with clean structure and emotional rhythm.",
        image: "/v2.png",
        icon: "clapperboard",
      },
      {
        title: "Featured Edit 02",
        description: "Short-form edits built for clean structure and fast visual impact.",
        image: "/v3.png",
        icon: "monitor-play",
      },
      {
        title: "Featured Edit 03",
        description: "Cinematic polish with stronger color, sound, and movement.",
        image: "/v4.png",
        icon: "film",
      },
      {
        title: "Featured Edit 04",
        description: "Branded graphics and transitions matched to the client identity.",
        image: "/v5.png",
        icon: "layers",
      },
      {
        title: "Featured Edit 05",
        description: "Ready-to-post delivery for campaigns, reels, and channels.",
        image: "/v6.png",
        icon: "sparkles",
      },
    ],
  },
  aboutAccordion: {
    eyebrow: "About Me",
    title: "Wence Dante De Vera",
    description:
      "Creative freelancer with 2 years of experience turning scattered ideas into organized, publish-ready work.",
    secondaryDescription:
      "My edge is the way I work: clean files, direct updates, thoughtful revisions, and a calm hand from first brief to final export.",
    ctaLabel: "View Client Edits",
    items: [
      {
        title: "Easy Handoff",
        imageUrl:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
      },
      {
        title: "Story Sense",
        imageUrl:
          "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1974&auto=format&fit=crop",
      },
      {
        title: "Visual Taste",
        imageUrl:
          "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=1974&auto=format&fit=crop",
      },
      {
        title: "Tech Mindset",
        imageUrl:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2070&auto=format&fit=crop",
      },
      {
        title: "Wence",
        imageUrl: "/wenshe.png",
      },
    ],
  },
  creativeProfile: {
    titleMuted: "Clean work.",
    titleStrong: "Sharp results.",
    lanes: [
      {
        value: "video-editing",
        label: "Video Editing",
        badge: "Editing Lane",
        title: "Video edits with cleaner pacing and stronger hooks.",
        description:
          "Short-form reels, long-form YouTube cuts, Adobe Premiere Pro, After Effects, sound polish, and clean exports shaped for publish-ready content.",
        buttonText: "View Video Work",
        buttonHref: "/portfolio/video-editing",
        imageSrc:
          "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Video editing software on a computer screen",
      },
      {
        value: "graphic-design",
        label: "Graphic Design",
        badge: "Visual Lane",
        title: "Design assets that make the brand feel sharper.",
        description:
          "Thumbnails, social graphics, layouts, and branded visuals built around clean hierarchy, readable details, and a polished final look.",
        buttonText: "View Design Work",
        buttonHref: "/portfolio/graphic-design",
        imageSrc:
          "https://images.unsplash.com/photo-1747435628628-60d0bf15ec8d?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Colorful abstract graphic design texture",
      },
      {
        value: "web-development",
        label: "Web Development",
        badge: "Web Lane",
        title: "Simple web builds that feel ready to publish.",
        description:
          "Portfolio pages, landing sections, and responsive websites with neat structure, thoughtful visuals, and smooth user flow.",
        buttonText: "View Web Work",
        buttonHref: "/portfolio/web-development",
        imageSrc:
          "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Web design and development workspace",
      },
    ],
  },
  experienceSection: {
    eyebrow: "",
    titleMuted: "Built through reps.",
    titleStrong: "Shown through results.",
    description: "",
    cards: [
      {
        quote:
          "Short-form and long-form edits shaped around pacing, structure, and cleaner delivery.",
        name: "Video Editing",
        role: "Premiere Pro / After Effects",
        image:
          "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=900&auto=format&fit=crop",
        videoUrl: "",
      },
      {
        quote:
          "Graphic assets designed to read fast, feel polished, and stay useful across platforms.",
        name: "Graphic Design",
        role: "Photoshop / Illustrator / Canva",
        image:
          "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=900&auto=format&fit=crop",
        videoUrl: "",
      },
      {
        quote:
          "Responsive pages built with clean sections, clear hierarchy, and smooth presentation.",
        name: "Web Development",
        role: "React / Next.js / Tailwind",
        image:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=900&auto=format&fit=crop",
        videoUrl: "",
      },
    ],
  },
};

const FEATURED_PROJECT_ICONS: FeaturedProjectIcon[] = [
  "clapperboard",
  "monitor-play",
  "film",
  "layers",
  "sparkles",
];

const CREATIVE_LANE_VALUES: HomeCreativeLane["value"][] = [
  "video-editing",
  "graphic-design",
  "web-development",
];

const getStringOrFallback = (value: unknown, fallback: string) =>
  typeof value === "string" ? value : fallback;

const getNumberInRangeOrFallback = (
  value: unknown,
  fallback: number,
  min: number,
  max: number
) => {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numericValue)
    ? Math.min(max, Math.max(min, numericValue))
    : fallback;
};

const normalizeStringArray = (value: unknown, fallback: string[]) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : fallback;

export const normalizeHomeContent = (value: unknown): HomeContent => {
  if (!value || typeof value !== "object") {
    return defaultHomeContent;
  }

  const raw = value as Record<string, unknown>;
  const rawHero =
    raw.hero && typeof raw.hero === "object"
      ? (raw.hero as Record<string, unknown>)
      : {};
  const rawFeatured =
    raw.featuredProjects && typeof raw.featuredProjects === "object"
      ? (raw.featuredProjects as Record<string, unknown>)
      : {};
  const rawCreativeProfile =
    raw.creativeProfile && typeof raw.creativeProfile === "object"
      ? (raw.creativeProfile as Record<string, unknown>)
      : {};
  const rawAboutAccordion =
    raw.aboutAccordion && typeof raw.aboutAccordion === "object"
      ? (raw.aboutAccordion as Record<string, unknown>)
      : {};
  const rawExperienceSection =
    raw.experienceSection && typeof raw.experienceSection === "object"
      ? (raw.experienceSection as Record<string, unknown>)
      : {};

  const fallbackProjects = defaultHomeContent.featuredProjects.projects;
  const normalizedProjects = Array.isArray(rawFeatured.projects)
    ? rawFeatured.projects
        .map((item, index) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const rawProject = item as Record<string, unknown>;
          const fallbackProject = fallbackProjects[index % fallbackProjects.length];
          const rawIcon = rawProject.icon;

          return {
            title: getStringOrFallback(rawProject.title, fallbackProject.title),
            description: getStringOrFallback(
              rawProject.description,
              fallbackProject.description
            ),
            image: getStringOrFallback(rawProject.image, fallbackProject.image),
            icon:
              typeof rawIcon === "string" &&
              FEATURED_PROJECT_ICONS.includes(rawIcon as FeaturedProjectIcon)
                ? (rawIcon as FeaturedProjectIcon)
                : fallbackProject.icon,
          };
        })
        .filter((project): project is HomeFeaturedProject => project !== null)
    : fallbackProjects;
  const fallbackAboutAccordionItems = defaultHomeContent.aboutAccordion.items;
  const normalizedAboutAccordionItems = Array.isArray(rawAboutAccordion.items)
    ? rawAboutAccordion.items
        .map((item, index) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const rawItem = item as Record<string, unknown>;
          const fallbackItem =
            fallbackAboutAccordionItems[index % fallbackAboutAccordionItems.length];
          const rawTitle = getStringOrFallback(rawItem.title, fallbackItem.title);
          const rawImageUrl = getStringOrFallback(rawItem.imageUrl, fallbackItem.imageUrl);
          const legacyAboutItemTitles: Record<string, string> = {
            "Video Editing": "Story Sense",
            "Graphic Design": "Visual Taste",
            "Web Development": "Tech Mindset",
            "Client Workflow": "Easy Handoff",
          };
          const normalizedTitle = legacyAboutItemTitles[rawTitle] || rawTitle;
          const previousWorkflowImage =
            "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop";
          const shouldSwapCurrentWence =
            normalizedTitle === "Wence" && rawImageUrl === previousWorkflowImage;
          const shouldSwapCurrentHandoff =
            normalizedTitle === "Easy Handoff" && rawImageUrl === "/wenshe.png";
          const finalTitle = shouldSwapCurrentWence
            ? "Easy Handoff"
            : shouldSwapCurrentHandoff
              ? "Wence"
              : normalizedTitle;
          const normalizedImageUrl =
            finalTitle === "Wence"
              ? "/wenshe.png"
              : finalTitle === "Easy Handoff"
                ? previousWorkflowImage
                : rawImageUrl;

          return {
            title: finalTitle,
            imageUrl: normalizedImageUrl,
          };
        })
        .filter((item): item is HomeAboutAccordionItem => item !== null)
    : fallbackAboutAccordionItems;
  const fallbackLanes = defaultHomeContent.creativeProfile.lanes;
  const normalizedLanes = Array.isArray(rawCreativeProfile.lanes)
    ? rawCreativeProfile.lanes
        .map((item, index) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const rawLane = item as Record<string, unknown>;
          const fallbackLane = fallbackLanes[index % fallbackLanes.length];
          const rawValue = rawLane.value;

          return {
            value:
              typeof rawValue === "string" &&
              CREATIVE_LANE_VALUES.includes(rawValue as HomeCreativeLane["value"])
                ? (rawValue as HomeCreativeLane["value"])
                : fallbackLane.value,
            label: getStringOrFallback(rawLane.label, fallbackLane.label),
            badge: getStringOrFallback(rawLane.badge, fallbackLane.badge),
            title: getStringOrFallback(rawLane.title, fallbackLane.title),
            description: getStringOrFallback(rawLane.description, fallbackLane.description),
            buttonText: getStringOrFallback(rawLane.buttonText, fallbackLane.buttonText),
            buttonHref: getStringOrFallback(rawLane.buttonHref, fallbackLane.buttonHref),
            imageSrc: getStringOrFallback(rawLane.imageSrc, fallbackLane.imageSrc),
            imageAlt: getStringOrFallback(rawLane.imageAlt, fallbackLane.imageAlt),
          };
        })
        .filter((lane): lane is HomeCreativeLane => lane !== null)
    : fallbackLanes;
  const fallbackExperienceCards = defaultHomeContent.experienceSection.cards;
  const normalizedExperienceCards = Array.isArray(rawExperienceSection.cards)
    ? rawExperienceSection.cards
        .map((item, index) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const rawCard = item as Record<string, unknown>;
          const fallbackCard =
            fallbackExperienceCards[index % fallbackExperienceCards.length];

          return {
            quote: getStringOrFallback(rawCard.quote, fallbackCard.quote),
            name: getStringOrFallback(rawCard.name, fallbackCard.name),
            role: getStringOrFallback(rawCard.role, fallbackCard.role),
            image: getStringOrFallback(rawCard.image, fallbackCard.image),
            videoUrl: getStringOrFallback(rawCard.videoUrl, fallbackCard.videoUrl || ""),
          };
        })
        .filter((card): card is HomeExperienceCard => card !== null)
    : fallbackExperienceCards;
  const rawFeaturedEyebrowText = getStringOrFallback(
    rawFeatured.eyebrow,
    defaultHomeContent.featuredProjects.eyebrow
  );
  const rawFeaturedTitleMutedText = getStringOrFallback(
    rawFeatured.titleMuted,
    defaultHomeContent.featuredProjects.titleMuted
  );
  const rawFeaturedTitleStrongText = getStringOrFallback(
    rawFeatured.titleStrong,
    defaultHomeContent.featuredProjects.titleStrong
  );
  const rawFeaturedDescriptionText = getStringOrFallback(
    rawFeatured.description,
    defaultHomeContent.featuredProjects.description
  );
  const isLegacyFeaturedTitle =
    rawFeaturedTitleMutedText.trim().toLowerCase() === "featured projects" &&
    rawFeaturedTitleStrongText.trim().toLowerCase() === "a closer look";
  const normalizedFeaturedEyebrow =
    rawFeaturedEyebrowText.trim().toLowerCase() === "featured projects"
      ? ""
      : rawFeaturedEyebrowText;
  const normalizedFeaturedDescription =
    rawFeaturedDescriptionText.trim() ===
    "This section pins in place while scrolling moves through the featured project frames."
      ? ""
      : rawFeaturedDescriptionText;
  const rawAboutDescriptionText = getStringOrFallback(
    rawAboutAccordion.description,
    defaultHomeContent.aboutAccordion.description
  );
  const rawAboutSecondaryDescriptionText = getStringOrFallback(
    rawAboutAccordion.secondaryDescription,
    defaultHomeContent.aboutAccordion.secondaryDescription
  );
  const legacyAboutDescriptions = [
    [
      "Video editor, graphic designer, and BSIT",
      "focused on making content feel cleaner, sharper, and easier to use.",
    ].join(" "),
    "Video editor, graphic designer, and creative freelancer with 2 years of experience focused on making content feel cleaner, sharper, and easier to use.",
  ];
  const normalizedAboutDescription =
    legacyAboutDescriptions.includes(rawAboutDescriptionText.trim())
      ? defaultHomeContent.aboutAccordion.description
      : rawAboutDescriptionText;
  const normalizedAboutSecondaryDescription =
    rawAboutSecondaryDescriptionText.trim() ===
    "I work across short-form, long-form, visual design, and simple web builds with clear updates, organized revisions, and reliable delivery."
      ? defaultHomeContent.aboutAccordion.secondaryDescription
      : rawAboutSecondaryDescriptionText;

  return {
    hero: {
      eyebrow: getStringOrFallback(rawHero.eyebrow, defaultHomeContent.hero.eyebrow),
      line1: getStringOrFallback(rawHero.line1, defaultHomeContent.hero.line1),
      line2: getStringOrFallback(rawHero.line2, defaultHomeContent.hero.line2),
      highlight: getStringOrFallback(rawHero.highlight, defaultHomeContent.hero.highlight),
      description: getStringOrFallback(
        rawHero.description,
        defaultHomeContent.hero.description
      ),
      primaryCta: getStringOrFallback(rawHero.primaryCta, defaultHomeContent.hero.primaryCta),
      secondaryCta: getStringOrFallback(
        rawHero.secondaryCta,
        defaultHomeContent.hero.secondaryCta
      ),
      contactCta: getStringOrFallback(rawHero.contactCta, defaultHomeContent.hero.contactCta),
      pills: normalizeStringArray(rawHero.pills, defaultHomeContent.hero.pills),
    },
    featuredProjects: {
      eyebrow: normalizedFeaturedEyebrow,
      titleMuted: isLegacyFeaturedTitle
        ? defaultHomeContent.featuredProjects.titleMuted
        : rawFeaturedTitleMutedText,
      titleStrong: isLegacyFeaturedTitle
        ? defaultHomeContent.featuredProjects.titleStrong
        : rawFeaturedTitleStrongText,
      description: normalizedFeaturedDescription,
      scrollLengthVh: getNumberInRangeOrFallback(
        rawFeatured.scrollLengthVh,
        defaultHomeContent.featuredProjects.scrollLengthVh,
        32,
        110
      ),
      projects: normalizedProjects.length > 0 ? normalizedProjects : fallbackProjects,
    },
    aboutAccordion: {
      eyebrow: getStringOrFallback(
        rawAboutAccordion.eyebrow,
        defaultHomeContent.aboutAccordion.eyebrow
      ),
      title: getStringOrFallback(
        rawAboutAccordion.title,
        defaultHomeContent.aboutAccordion.title
      ),
      description: getStringOrFallback(
        normalizedAboutDescription,
        defaultHomeContent.aboutAccordion.description
      ),
      secondaryDescription: getStringOrFallback(
        normalizedAboutSecondaryDescription,
        defaultHomeContent.aboutAccordion.secondaryDescription
      ),
      ctaLabel: getStringOrFallback(
        rawAboutAccordion.ctaLabel,
        defaultHomeContent.aboutAccordion.ctaLabel
      ),
      items:
        normalizedAboutAccordionItems.length > 0
          ? normalizedAboutAccordionItems
          : fallbackAboutAccordionItems,
    },
    creativeProfile: {
      titleMuted: getStringOrFallback(
        rawCreativeProfile.titleMuted,
        defaultHomeContent.creativeProfile.titleMuted
      ),
      titleStrong: getStringOrFallback(
        rawCreativeProfile.titleStrong,
        defaultHomeContent.creativeProfile.titleStrong
      ),
      lanes: normalizedLanes.length > 0 ? normalizedLanes : fallbackLanes,
    },
    experienceSection: {
      eyebrow: getStringOrFallback(
        rawExperienceSection.eyebrow,
        defaultHomeContent.experienceSection.eyebrow
      ),
      titleMuted: getStringOrFallback(
        rawExperienceSection.titleMuted,
        defaultHomeContent.experienceSection.titleMuted
      ),
      titleStrong: getStringOrFallback(
        rawExperienceSection.titleStrong,
        defaultHomeContent.experienceSection.titleStrong
      ),
      description: getStringOrFallback(
        rawExperienceSection.description,
        defaultHomeContent.experienceSection.description
      ),
      cards:
        normalizedExperienceCards.length > 0
          ? normalizedExperienceCards
          : fallbackExperienceCards,
    },
  };
};

export const parseHomeContent = (value: string): HomeContent => {
  try {
    return normalizeHomeContent(JSON.parse(value));
  } catch {
    return defaultHomeContent;
  }
};

export const EXPERIENCE_STORAGE_KEY = "portfolio-experience-entries";
export const EXPERIENCE_UPDATED_EVENT = "portfolio-experience-updated";
export const EXPERIENCE_CONTENT_UPDATED_AT_KEY = "portfolio-experience-updated-at";

export const HOME_CONTENT_STORAGE_KEY = "portfolio-home-content";
export const HOME_CONTENT_UPDATED_EVENT = "portfolio-home-content-updated";
export const HOME_CONTENT_UPDATED_AT_KEY = "portfolio-home-content-updated-at";

export const PORTFOLIO_STORAGE_KEY = "portfolio-projects";
export const PORTFOLIO_UPDATED_EVENT = "portfolio-projects-updated";
export const PORTFOLIO_CONTENT_UPDATED_AT_KEY = "portfolio-content-updated-at";

export const TESTIMONIALS_STORAGE_KEY = "portfolio-testimonials";
export const TESTIMONIALS_UPDATED_EVENT = "portfolio-testimonials-updated";

export const PORTFOLIO_SYNC_CHANNEL_NAME = "portfolio-sync-channel";
export const PORTFOLIO_SYNC_REQUEST_EVENT = "request-sync";
export const PORTFOLIO_SYNC_RESPONSE_EVENT = "sync-response";

let supabaseInstance: SupabaseClient | null = null;
let runtimeSupabaseConfig: {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseContentRowId?: string;
} = {};
let runtimeCloudinaryUploadConfig: {
  cloudName?: string;
  uploadPreset?: string;
} = {};

export type PublicPortfolioConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseContentRowId: string;
  supabaseAssetBucket: string;
  supabaseConfigured: boolean;
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  cloudinaryConfigured: boolean;
};

export const applyPublicPortfolioConfig = (config: Partial<PublicPortfolioConfig>) => {
  runtimeSupabaseConfig = {
    supabaseUrl: config.supabaseUrl || runtimeSupabaseConfig.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey || runtimeSupabaseConfig.supabaseAnonKey,
    supabaseContentRowId:
      config.supabaseContentRowId || runtimeSupabaseConfig.supabaseContentRowId,
  };
  runtimeCloudinaryUploadConfig = {
    cloudName: config.cloudinaryCloudName || runtimeCloudinaryUploadConfig.cloudName,
    uploadPreset:
      config.cloudinaryUploadPreset || runtimeCloudinaryUploadConfig.uploadPreset,
  };
  supabaseInstance = null;
};

export const fetchPublicPortfolioConfig = async (): Promise<PublicPortfolioConfig | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const response = await fetch("/api/public-config", { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const config = (await response.json()) as PublicPortfolioConfig;
    applyPublicPortfolioConfig(config);
    return config;
  } catch {
    return null;
  }
};

export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl =
    runtimeSupabaseConfig.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    runtimeSupabaseConfig.supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  return supabaseInstance;
};

const getConfiguredSupabaseClient = async () => {
  let supabase = getSupabaseClient();

  if (!supabase && typeof window !== "undefined") {
    await fetchPublicPortfolioConfig();
    supabase = getSupabaseClient();
  }

  return supabase;
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
    runtimeCloudinaryUploadConfig.cloudName ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) || "";
  const uploadPreset =
    runtimeCloudinaryUploadConfig.uploadPreset ||
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
  let { cloudName, uploadPreset, isConfigured } = getCloudinaryUploadConfig();

  if (!isConfigured) {
    await fetchPublicPortfolioConfig();
    ({ cloudName, uploadPreset, isConfigured } = getCloudinaryUploadConfig());
  }

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
  const supabase = await getConfiguredSupabaseClient();
  if (!supabase) {
    console.error("Portfolio data: Supabase is not configured.");
    return null;
  }

  try {
    const contentRowId =
      runtimeSupabaseConfig.supabaseContentRowId ||
      process.env.NEXT_PUBLIC_SUPABASE_CONTENT_ROW_ID ||
      "main";

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
    const rawHomeContent = data.home_content || data.homeContent || null;

    return {
      projects: data.projects || null,
      testimonials: data.testimonials || null,
      experience: data.experience || null,
      experienceEntries: rawExperience,
      experienceEntriesSyncSupported: hasExperienceColumn,
      homeContent: rawHomeContent,
      homeContentSyncSupported: "home_content" in data || "homeContent" in data,
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
  homeContent?: HomeContent;
}) => {
  const supabase = await getConfiguredSupabaseClient();
  if (!supabase) {
    console.error("Portfolio data: Cannot save to Supabase.");
    return false;
  }

  try {
    const contentRowId =
      runtimeSupabaseConfig.supabaseContentRowId ||
      process.env.NEXT_PUBLIC_SUPABASE_CONTENT_ROW_ID ||
      "main";
    const now = new Date().toISOString();

    const { error } = await supabase.from("portfolio_content").upsert(
      {
        id: contentRowId,
        projects: payload.projects,
        testimonials: payload.testimonials,
        experience_entries: payload.experienceEntries,
        ...(payload.homeContent ? { home_content: payload.homeContent } : {}),
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

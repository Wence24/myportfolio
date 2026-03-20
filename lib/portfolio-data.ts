import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type PortfolioProject = {
  title: string;
  description: string;
  image: string;
  designLink: string;
  showDetailsModal?: boolean;
  details?: {
    title: string;
    description: string;
    heroImage: string;
    galleryImages: string[];
  };
};

export type PortfolioCategory = "Graphic Design" | "Video Edit" | "Certificates";
export type PortfolioProjects = Record<PortfolioCategory, PortfolioProject[]>;

export type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

export type PortfolioContent = {
  projects: PortfolioProjects;
  testimonials: Testimonial[];
};

export const PORTFOLIO_STORAGE_KEY = "portfolio-projects-v1";
export const PORTFOLIO_UPDATED_EVENT = "portfolio-projects-updated";
export const TESTIMONIALS_STORAGE_KEY = "portfolio-testimonials-v1";
export const TESTIMONIALS_UPDATED_EVENT = "portfolio-testimonials-updated";

export const defaultPortfolioProjects: PortfolioProjects = {
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

type PortfolioContentRow = {
  id: string;
  projects: unknown;
  testimonials: unknown;
  updated_at?: string;
};

const SUPABASE_CONTENT_TABLE = "portfolio_content";
const SUPABASE_CONTENT_ROW_ID =
  process.env.NEXT_PUBLIC_SUPABASE_CONTENT_ROW_ID || "main";

let supabaseClient: SupabaseClient | null | undefined;

const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseClient !== undefined) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    supabaseClient = null;
    return supabaseClient;
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
  return supabaseClient;
};

export const isSupabaseConfigured = (): boolean => getSupabaseClient() !== null;

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
    Certificates: Array.isArray(raw.Certificates)
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

export const fetchPortfolioContentFromSupabase = async (): Promise<PortfolioContent | null> => {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from(SUPABASE_CONTENT_TABLE)
    .select("id, projects, testimonials, updated_at")
    .eq("id", SUPABASE_CONTENT_ROW_ID)
    .maybeSingle<PortfolioContentRow>();

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
  };
};

export const savePortfolioContentToSupabase = async (
  content: PortfolioContent
): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  const payload: PortfolioContentRow = {
    id: SUPABASE_CONTENT_ROW_ID,
    projects: content.projects,
    testimonials: content.testimonials,
    updated_at: new Date().toISOString(),
  };

  const { error } = await client
    .from(SUPABASE_CONTENT_TABLE)
    .upsert(payload, { onConflict: "id" });

  if (error) {
    console.error("Failed to save portfolio content to Supabase:", error.message);
    return false;
  }

  return true;
};

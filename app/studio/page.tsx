"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import {
  ensureSupabaseConfigured,
  PORTFOLIO_STORAGE_KEY,
  PORTFOLIO_UPDATED_EVENT,
  TESTIMONIALS_STORAGE_KEY,
  TESTIMONIALS_UPDATED_EVENT,
  fetchPortfolioContentFromSupabase,
  isSupabaseConfigured,
  savePortfolioContentToSupabase,
} from "@/lib/portfolio-data";

type PortfolioProject = {
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

type PortfolioCategory = "Graphic Design" | "Video Edit" | "Certificates";
type PortfolioProjects = Record<PortfolioCategory, PortfolioProject[]>;

type ProjectForm = {
  title: string;
  description: string;
  image: string;
  designLink: string;
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

const categories: PortfolioCategory[] = [
  "Graphic Design",
  "Video Edit",
  "Certificates",
];

const STUDIO_AUTH_KEY = "portfolio-studio-auth";
const STUDIO_EMAIL_STORAGE_KEY = "portfolio-studio-email";
const STUDIO_PASSWORD_STORAGE_KEY = "portfolio-studio-password";
const DEFAULT_STUDIO_EMAIL = "aiakosedt@gmail.com";
const DEFAULT_STUDIO_PASSWORD = "Wence_dante24";
const MAX_IMAGE_UPLOAD_SIZE = 2 * 1024 * 1024;

type StudioCredentials = {
  email: string;
  password: string;
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
  Certificates: [],
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
    Certificates: Array.isArray(raw.Certificates)
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
  return {
    title: project.title,
    description: project.description,
    image: project.image,
    designLink: project.designLink,
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

function toProject(form: ProjectForm): PortfolioProject {
  const trimmedTitle = form.title.trim();
  const trimmedDescription = form.description.trim();
  const trimmedImage = form.image.trim();
  const trimmedLink = form.designLink.trim();
  const galleryImages = form.galleryImages
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const project: PortfolioProject = {
    title: trimmedTitle || "Untitled Project",
    description: trimmedDescription || "Project description will be added soon.",
    image: trimmedImage || "/comradz.png",
    designLink: trimmedLink || "#",
    showDetailsModal: form.showDetailsModal,
  };

  if (form.showDetailsModal) {
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

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read the selected file."));
    };

    reader.onerror = () => {
      reject(new Error("Failed to read the selected file."));
    };

    reader.readAsDataURL(file);
  });

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
  const [uploadError, setUploadError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }

    if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
      setUploadError("Please keep image uploads under 2 MB for smoother saving.");
      return;
    }

    try {
      const imageValue = await readFileAsDataUrl(file);
      onChange(imageValue);
      setUploadError("");
    } catch {
      setUploadError("That image could not be read. Try another file.");
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
        }`}
      >
        <input
          id={`${id}-upload`}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleInputChange}
        />
        <span className="text-sm font-medium text-white/90">
          Drag an image here or click to upload
        </span>
        <span className="mt-1 text-xs text-white/55">
          You can still paste a path, URL, or data URL above. Best under 2 MB.
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

export default function StudioPage() {
  const router = useRouter();
  const [supabaseStatus, setSupabaseStatus] = useState<
    "checking" | "enabled" | "disabled"
  >(() => (isSupabaseConfigured() ? "enabled" : "checking"));
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
  const [testimonialForm, setTestimonialForm] = useState<TestimonialForm>(
    createEmptyTestimonialForm()
  );
  const [editingTestimonialIndex, setEditingTestimonialIndex] = useState<number | null>(
    null
  );
  const projectPreview = useMemo(() => toProject(form), [form]);
  const testimonialPreview = useMemo(
    () => toTestimonial(testimonialForm),
    [testimonialForm]
  );

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
    let cancelled = false;
    const syncFromSupabase = async () => {
      const configured = await ensureSupabaseConfigured();
      if (cancelled) return;

      setSupabaseStatus(configured ? "enabled" : "disabled");
      if (!configured) return;

      const remoteContent = await fetchPortfolioContentFromSupabase();
      if (!remoteContent || cancelled) return;

      setProjects(normalizeProjects(remoteContent.projects));
      setTestimonials(normalizeTestimonials(remoteContent.testimonials));

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          PORTFOLIO_STORAGE_KEY,
          JSON.stringify(remoteContent.projects)
        );
        window.localStorage.setItem(
          TESTIMONIALS_STORAGE_KEY,
          JSON.stringify(remoteContent.testimonials)
        );
        window.dispatchEvent(new Event(PORTFOLIO_UPDATED_EVENT));
        window.dispatchEvent(new Event(TESTIMONIALS_UPDATED_EVENT));
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

  const activeProjects = useMemo(
    () => projects[activeCategory] || [],
    [projects, activeCategory]
  );

  const persistStudioCredentials = (nextCredentials: StudioCredentials) => {
    setStudioCredentials(nextCredentials);

    if (typeof window === "undefined") return;
    window.localStorage.setItem(STUDIO_EMAIL_STORAGE_KEY, nextCredentials.email);
    window.localStorage.setItem(
      STUDIO_PASSWORD_STORAGE_KEY,
      nextCredentials.password
    );
  };

  const persistProjects = (nextProjects: PortfolioProjects) => {
    setProjects(nextProjects);
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(nextProjects));
    window.dispatchEvent(new Event(PORTFOLIO_UPDATED_EVENT));
    void savePortfolioContentToSupabase({
      projects: nextProjects,
      testimonials,
    });
  };

  const persistTestimonials = (nextTestimonials: Testimonial[]) => {
    setTestimonials(nextTestimonials);
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      TESTIMONIALS_STORAGE_KEY,
      JSON.stringify(nextTestimonials)
    );
    window.dispatchEvent(new Event(TESTIMONIALS_UPDATED_EVENT));
    void savePortfolioContentToSupabase({
      projects,
      testimonials: nextTestimonials,
    });
  };

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
    setEditingIndex(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const updatedProjects = { ...projects };
    const categoryProjects = [...updatedProjects[activeCategory]];
    const nextProject = toProject(form);

    if (editingIndex === null) {
      categoryProjects.push(nextProject);
    } else {
      categoryProjects[editingIndex] = nextProject;
    }

    updatedProjects[activeCategory] = categoryProjects;
    persistProjects(updatedProjects);
    resetForm();
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setForm(toForm(activeProjects[index]));
  };

  const handleDelete = (index: number) => {
    const updatedProjects = { ...projects };
    updatedProjects[activeCategory] = updatedProjects[activeCategory].filter(
      (_, itemIndex) => itemIndex !== index
    );
    persistProjects(updatedProjects);

    if (editingIndex === index) {
      resetForm();
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
                <ImageField
                  id="project-card-image"
                  label="Card image"
                  value={form.image}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, image: value }))
                  }
                  placeholder="Card image path or URL"
                />
                <input
                  type="text"
                  value={form.designLink}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, designLink: event.target.value }))
                  }
                  placeholder="Design link"
                  className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                />
              </div>

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

              {form.showDetailsModal && (
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

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-[#0099ff] px-4 py-2 text-sm font-semibold hover:bg-[#00a8ff] transition-colors"
                >
                  {editingIndex === null ? "Add Project" : "Save Changes"}
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
                <div className="overflow-hidden rounded-[22px] border border-white/15 bg-black/30">
                  <img
                    src={projectPreview.image}
                    alt={projectPreview.title}
                    className="h-52 w-full object-cover"
                  />
                  <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(0,153,255,0.08),rgba(8,10,18,0.14))] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">
                        {projectPreview.title}
                      </p>
                      <span className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                        Project Card
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/70 line-clamp-4">
                      {projectPreview.description}
                    </p>
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/15 bg-black/30 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">
                      Details Preview
                    </p>
                    <span className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                      {projectPreview.showDetailsModal ? "Enabled" : "Disabled"}
                    </span>
                  </div>

                  {projectPreview.showDetailsModal && projectPreview.details ? (
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

            <div className="max-h-[62vh] overflow-y-auto space-y-3 pr-1">
              {activeProjects.map((project, index) => (
                <div
                  key={`${activeCategory}-${project.title}-${index}`}
                  className="rounded-xl border border-white/15 bg-black/25 p-3"
                >
                  <h3 className="font-semibold text-sm">{project.title}</h3>
                  <p className="text-xs text-white/75 mt-1 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="mt-3 flex gap-2">
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
                  No projects yet in this category.
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
                    "
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

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";

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

const PORTFOLIO_STORAGE_KEY = "portfolio-projects-v1";
const PORTFOLIO_UPDATED_EVENT = "portfolio-projects-updated";
const TESTIMONIALS_STORAGE_KEY = "portfolio-testimonials-v1";
const TESTIMONIALS_UPDATED_EVENT = "portfolio-testimonials-updated";
const STUDIO_AUTH_KEY = "portfolio-studio-auth";

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

export default function StudioPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(STUDIO_AUTH_KEY) === "1";
  });
  const [loginError, setLoginError] = useState("");

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

  const persistProjects = (nextProjects: PortfolioProjects) => {
    setProjects(nextProjects);
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(nextProjects));
    window.dispatchEvent(new Event(PORTFOLIO_UPDATED_EVENT));
  };

  const persistTestimonials = (nextTestimonials: Testimonial[]) => {
    setTestimonials(nextTestimonials);
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      TESTIMONIALS_STORAGE_KEY,
      JSON.stringify(nextTestimonials)
    );
    window.dispatchEvent(new Event(TESTIMONIALS_UPDATED_EVENT));
  };

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (email.trim() === "aiakosedt@gmail.com" && password === "wencedante") {
      setIsAuthenticated(true);
      setLoginError("");
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(STUDIO_AUTH_KEY, "1");
      }
      return;
    }

    setLoginError("Invalid email or password.");
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl p-6 space-y-4"
        >
          <h1 className="text-2xl font-bold">Studio Login</h1>
          <p className="text-sm text-white/70">
            Sign in to manage portfolio sections and projects.
          </p>

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

          {loginError && <p className="text-sm text-red-300">{loginError}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#0099ff] py-2 text-sm font-semibold hover:bg-[#00a8ff] transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Portfolio Studio</h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={16} />
            Back To Home
          </Link>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={form.image}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, image: event.target.value }))
                  }
                  placeholder="Card image path"
                  className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
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

                  <input
                    type="text"
                    value={form.detailsHeroImage}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, detailsHeroImage: event.target.value }))
                    }
                    placeholder="Details hero image path"
                    className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                  />

                  <div className="space-y-2">
                    {form.galleryImages.map((galleryPath, index) => (
                      <div key={`gallery-input-${index}`} className="flex gap-2">
                        <input
                          type="text"
                          value={galleryPath}
                          onChange={(event) =>
                            setForm((prev) => {
                              const nextGallery = [...prev.galleryImages];
                              nextGallery[index] = event.target.value;
                              return { ...prev, galleryImages: nextGallery };
                            })
                          }
                          placeholder={`Gallery image ${index + 1}`}
                          className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
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

              <input
                type="text"
                value={testimonialForm.src}
                onChange={(event) =>
                  setTestimonialForm((prev) => ({
                    ...prev,
                    src: event.target.value,
                  }))
                }
                placeholder="Image path or URL (e.g. /client.png or https://...)"
                className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#0099ff]"
                required
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

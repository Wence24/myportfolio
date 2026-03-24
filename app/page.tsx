"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
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
import { Home as HomeIcon, User, Video, MessageSquareQuote, Mail, Code, Medal, Globe, ArrowUpRight, Film, Palette, ExternalLink } from "lucide-react"; // added icons

const MODAL_TRANSITION_MS = 520;
const MODAL_OPEN_DELAY_MS = 10;

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
const [activeBox, setActiveBox] = useState("Graphic Design"); // default Projects
const [showPortfolio, setShowPortfolio] = useState(false);
const portfolioShown = useRef(false);
const [showModal, setShowModal] = useState(false);
const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
const [showAddProjectModal, setShowAddProjectModal] = useState(false);
const [addProjectModalVisible, setAddProjectModalVisible] = useState(false);
const [isDetailsModalMounted, setIsDetailsModalMounted] = useState(false);
const [isAddProjectModalMounted, setIsAddProjectModalMounted] = useState(false);
const [newProjectForm, setNewProjectForm] = useState<NewProjectForm>(createEmptyProjectForm());


const [animateTab, setAnimateTab] = useState(false);

const portfolioCategories = [
  {
    name: "Graphic Design",
    icon: Palette,
    description: "Poster systems, visual branding, and polished design work.",
  },
  {
    name: "Video Edit",
    icon: Film,
    description: "Story-driven edits, pacing, transitions, and cinematic cuts.",
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
  showDetailsModal: boolean;
  detailsTitle: string;
  detailsDescription: string;
  detailsHeroImage: string;
  galleryImages: string[];
};

type ContactFormState = {
  name: string;
  email: string;
  message: string;
};

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

type SideNavIcon = React.ComponentType<{ size?: number; className?: string }>;

function createEmptyProjectForm(): NewProjectForm {
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
const [buttonsVisible, setButtonsVisible] = useState([false, false, false]);
const buttonsRef = useRef<HTMLDivElement>(null);
const [modalVisible, setModalVisible] = useState(false);
const [showReviewsIntro, setShowReviewsIntro] = useState(false);
const [showReviewsTestimonials, setShowReviewsTestimonials] = useState(false);
const [showContactForm, setShowContactForm] = useState(false);
const [showTikTokModal, setShowTikTokModal] = useState(false);
const [isTikTokBubbleMounted, setIsTikTokBubbleMounted] = useState(false);
const [isTikTokBubbleVisible, setIsTikTokBubbleVisible] = useState(false);
const [contactForm, setContactForm] = useState<ContactFormState>({
  name: "",
  email: "",
  message: "",
});
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

const hasShownAbout = useRef(false);
const hasShownHello = useRef(false);
const tikTokBubbleRef = useRef<HTMLDivElement>(null);


  const hasRun = useRef(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  const aboutRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const [showSideNav, setShowSideNav] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
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
  if (!buttonsRef.current) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt((entry.target as HTMLElement).dataset.index || "0");
          setButtonsVisible((prev) => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }
      });
    },
    { threshold: 0.1 } // triggers when 30% visible
  );

  const btns = buttonsRef.current.querySelectorAll("button");
  btns.forEach((btn, i) => {
    btn.dataset.index = i.toString();
    observer.observe(btn);
  });

  return () => observer.disconnect();
}, []);


// Hello + Name typing animation
useEffect(() => {
  if (!showAbout || hasShownHello.current) return;

  hasShownHello.current = true;

  setHelloVisible(true);
  setNameText("");
  setNameDone(false);

  const fullName = "Wence Dante De Vera";
  let index = 0;

  const typeNextLetter = () => {
    if (index < fullName.length) {
      setNameText(fullName.slice(0, index + 1));
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
        setShowSideNav(window.scrollY > heroRef.current.offsetHeight - 200);
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
          setActiveSection(s.id);
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
      setShowSideNav(!entry.isIntersecting);
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

  // NAV LIST WITH ACTIVE UNDERLINE
  const navList = (
    <ul
  className="mt-2 mb-4 flex flex-col gap-2 font-semibold tracking-[0.02em] lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6"
>
  {[
    { name: "Home", ref: null }, // null because top of page
    { name: "About", ref: aboutRef },
    { name: "Portfolio", ref: portfolioRef },
    { name: "Contact", ref: contactRef },
  ].map((item) => (
    <li
      key={item.name}
      className={`p-1 font-normal cursor-pointer text-white ${
        activeSection.toLowerCase() === item.name.toLowerCase()
          ? "border-b-2 border-white"
          : ""
      }`}
      onClick={() => {
        scrollToSection(item.ref);
      }}
    >
      {item.name}
    </li>
  ))}
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

const closeDetailsModal = () => {
  setShowModal(false);
};

const openAddProjectModal = () => {
  setNewProjectForm(createEmptyProjectForm());
  setShowAddProjectModal(true);
};

const closeAddProjectModal = () => {
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

const handleAddProjectSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const fallbackImage = "/comradz.png";
  const fallbackHeroImage = "/comradz2.png";
  const trimmedTitle = newProjectForm.title.trim();
  const trimmedDescription = newProjectForm.description.trim();
  const trimmedCardImage = newProjectForm.image.trim();
  const trimmedDesignLink = newProjectForm.designLink.trim();
  const galleryImages = newProjectForm.galleryImages
    .map((img) => img.trim())
    .filter((img) => img.length > 0);

  const projectToAdd: PortfolioProject = {
    title: trimmedTitle || "Untitled Project",
    description: trimmedDescription || "Project description will be added soon.",
    image: trimmedCardImage || fallbackImage,
    designLink: trimmedDesignLink || "#",
    showDetailsModal: newProjectForm.showDetailsModal,
  };

  if (newProjectForm.showDetailsModal) {
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
};

const updateContactField = (field: keyof ContactFormState, value: string) => {
  setContactForm((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

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
      body: JSON.stringify(contactForm),
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; success?: boolean }
      | null;

    if (!response.ok) {
      throw new Error(
        payload?.error || "Your message could not be sent right now."
      );
    }

    setContactForm({
      name: "",
      email: "",
      message: "",
    });
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
const totalCreativeProjects =
  (portfolioProjects["Graphic Design"]?.length || 0) +
  (portfolioProjects["Video Edit"]?.length || 0);
const totalCertificates = portfolioProjects.Certificates?.length || 0;
const activeCategoryMeta =
  portfolioCategories.find((item) => item.name === activeBox) ?? portfolioCategories[0];
const glassSectionClass =
  "relative w-full max-w-7xl mx-auto rounded-[26px] border border-white/10 bg-white/[0.03] p-[1.5px] shadow-[0_18px_60px_rgba(0,0,0,0.24)]";
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
  movementDuration: 0.8,
  borderWidth: 1.5,
};
const creativeTools = [
  {
    name: "Adobe Premiere Pro",
    short: "Pr",
    category: "Primary editor",
    description:
      "My main workspace for pacing, story cuts, transitions, audio cleanup, and polished final exports.",
    accent: "#a78bfa",
    glow: "rgba(126, 34, 206, 0.32)",
    badgeBackground:
      "linear-gradient(135deg, rgba(32, 10, 58, 0.98), rgba(95, 38, 181, 0.96))",
    badgeBorder: "rgba(201, 168, 255, 0.34)",
    panelBackground:
      "linear-gradient(135deg, rgba(72, 31, 128, 0.26), rgba(8, 11, 20, 0.88) 64%)",
    tags: ["Cuts", "Rhythm", "Audio"],
  },
  {
    name: "Adobe Photoshop",
    short: "Ps",
    category: "Image polish",
    description:
      "Used for retouching, poster visuals, thumbnails, compositing, and sharpening the final look of a frame.",
    accent: "#6ee7ff",
    glow: "rgba(14, 165, 233, 0.25)",
    badgeBackground:
      "linear-gradient(135deg, rgba(3, 31, 54, 0.98), rgba(14, 116, 144, 0.96))",
    badgeBorder: "rgba(125, 233, 255, 0.3)",
    panelBackground:
      "linear-gradient(135deg, rgba(10, 72, 108, 0.24), rgba(8, 11, 20, 0.88) 66%)",
    tags: ["Retouch", "Posters", "Thumbnails"],
  },
  {
    name: "Adobe After Effects",
    short: "Ae",
    category: "Motion details",
    description:
      "For motion graphics, transitions, layered animation, and adding cinematic movement that elevates an edit.",
    accent: "#d8b4fe",
    glow: "rgba(168, 85, 247, 0.24)",
    badgeBackground:
      "linear-gradient(135deg, rgba(28, 14, 56, 0.98), rgba(107, 55, 176, 0.96))",
    badgeBorder: "rgba(227, 197, 255, 0.28)",
    panelBackground:
      "linear-gradient(135deg, rgba(73, 35, 123, 0.24), rgba(8, 11, 20, 0.88) 66%)",
    tags: ["Motion", "Titles", "Transitions"],
  },
  {
    name: "Canva",
    short: "C",
    category: "Fast layouts",
    description:
      "Great for rapid social graphics, clean layouts, client-ready mockups, and quick-turn visual concepts.",
    accent: "#7df9ff",
    glow: "rgba(34, 211, 238, 0.22)",
    badgeBackground:
      "linear-gradient(135deg, rgba(8, 58, 72, 0.98), rgba(9, 118, 138, 0.96))",
    badgeBorder: "rgba(154, 246, 255, 0.28)",
    panelBackground:
      "linear-gradient(135deg, rgba(12, 88, 104, 0.22), rgba(8, 11, 20, 0.88) 68%)",
    tags: ["Socials", "Layouts", "Mockups"],
  },
  {
    name: "Adobe Illustrator",
    short: "Ai",
    category: "Vector finish",
    description:
      "Used when a project needs crisp vector marks, icon work, title treatments, or scalable layout details.",
    accent: "#fdba74",
    glow: "rgba(249, 115, 22, 0.22)",
    badgeBackground:
      "linear-gradient(135deg, rgba(72, 29, 8, 0.98), rgba(154, 73, 12, 0.96))",
    badgeBorder: "rgba(255, 191, 116, 0.28)",
    panelBackground:
      "linear-gradient(135deg, rgba(107, 51, 16, 0.22), rgba(8, 11, 20, 0.88) 68%)",
    tags: ["Vector", "Icons", "Type"],
  },
] as const;
const contactPlatforms = [
  {
    label: "Upwork",
    href: "https://www.upwork.com/",
    description: "Hire or connect with me on Upwork.",
  },
  {
    label: "Fiverr",
    href: "https://www.fiverr.com/",
    description: "Browse my Fiverr-style creative services.",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
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
    <div className="relative min-h-screen overflow-y-auto bg-transparent">
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
            className={`relative z-10 flex h-full items-center justify-center transition-all duration-500 ${
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
              "linear-gradient(180deg, rgba(4,8,13,0.08) 0%, rgba(0,0,0,0.34) 100%), linear-gradient(122deg, rgba(255,255,255,0.035) 0%, transparent 32%, transparent 72%, rgba(255,255,255,0.014) 100%), radial-gradient(circle at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 40%)",
          }}
        />
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
      </div>

      {/* NAVBAR */}
      <div className="relative z-50">
        
        <nav
         ref={navbarRef}
          className="sticky top-0 w-full rounded-none border-b border-white/10 bg-black/78 px-4 py-2 font-semibold tracking-[0.02em] backdrop-blur-md lg:px-8 lg:py-4"
        >
          <div className="flex items-center justify-between relative">
            <button
              type="button"
              onClick={handleSecretLogoTap}
              className="rounded-full p-1 transition-transform duration-200 hover:scale-105"
              aria-label="Portfolio logo"
            >
              <Image src="/logo.png" alt="Logo" width={40} height={40} priority />
            </button>
            <div className="hidden lg:block">{navList}</div>
          </div>
        </nav>

        {/* EDGE GLOW BELOW NAVBAR */}
        <div
          className="absolute left-0 w-full pointer-events-none animate-pulse-slow"
          style={{
            top: "100%",
            height: "16px",
            background:
              "linear-gradient(to bottom, rgba(230, 239, 248, 0.24) 0%, rgba(157, 182, 205, 0.12) 38%, rgba(255,255,255,0.0) 100%)",
            filter: "blur(15px)",
            zIndex: 49,
          }}
        />
      </div>

     {/* SIDE NAV */}
<div
  className={`
    fixed right-5 top-1/2 -translate-y-1/2 z-50
    transition-all duration-500 ease-out
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
      <div ref={heroRef} className="relative flex flex-col items-center justify-center z-10 pt-[40vh]">
        <div
          className="absolute"
          style={{
            transform: "translateY(12%) scaleY(1.2)",
            transformOrigin: "center",
          }}
        >
          {/* VIDEO EDITOR */}
          <span
            className="absolute top-0 left-0 text-gray-400 text-sm sm:text-base select-none pointer-events-none"
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

          {/* GRAPHIC DESIGNER */}
          <span
            className="absolute top-0 right-0 text-gray-400 text-sm sm:text-base select-none pointer-events-none"
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
                text-[16rem] sm:text-[22rem] md:text-[30rem] lg:text-[40rem]
                portfolio-heading portfolio-main-text select-none pointer-events-none leading-none
                text-white
              `}
              data-text="PORTFOLIO"
            >
              PORTFOLIO
            </h1>
          </div>
            {/* SMALL SOCIAL / LINK IMAGES — RIGHT SIDE UNDER PORTFOLIO */}

          
        </div>

        {/* IMAGE */}
        <div
          className={`absolute z-20 transition-all duration-1000 ${
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
            className="object-contain grayscale"
          />
        </div>

      </div>  {/* <-- this closes the absolute text container */}


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
          className={`relative z-10 w-full max-w-7xl rounded-[32px] border border-white/10 bg-white/[0.03] p-[1.5px] shadow-[0_28px_80px_rgba(0,0,0,0.28)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            showAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: showAbout ? "0.4s" : "0s" }}
        >
          <GlowingEffect {...mainSectionGlowProps} className="z-[2]" />
          <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(18,25,34,0.92),rgba(11,18,26,0.96))] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(0,153,255,0.09),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.05),transparent_22%)]" />
            </div>

            <div className="relative z-10 px-4 pt-4 pb-5 sm:px-6 sm:pt-6 sm:pb-6 lg:px-6 lg:pt-6 lg:pb-7">
            <div
              className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                showAbout ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
              }`}
            >
              <span className="inline-flex rounded-full border border-[#0099ff]/25 bg-[#0099ff]/10 px-4 py-1 text-[11px] uppercase tracking-[0.26em] text-[#8fdcff]">
                Video Editor • Graphic Designer
              </span>
            </div>

            <div className="relative flex w-full flex-col items-start justify-between gap-6 lg:flex-row lg:gap-8">
              <div className="order-1 w-full lg:basis-[54%] lg:max-w-[54%] lg:pr-6">
                <h3
                  className={`mt-5 text-5xl font-bold leading-[0.95] transition-all duration-700 sm:text-[4.3rem] ${
                    helloVisible ? "translate-x-0 opacity-100" : "-translate-x-64 opacity-0"
                  }`}
                  style={{
                    background: "linear-gradient(135deg, #f6fbff 0%, #88d4ff 48%, #0099ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontFamily: "'Condenso', sans-serif",
                  }}
                >
                  Hello, I&apos;m
                </h3>

                <h4
                  className="mt-2 flex items-center text-5xl font-bold leading-[0.98] tracking-[-0.02em] text-white transition-all duration-700 delay-300 sm:text-[5.2rem]"
                  style={{
                    opacity: helloVisible ? 1 : 0,
                    transform: helloVisible ? "translateX(0)" : "translateX(-64px)",
                    transition: "all 0.7s ease-out 0.3s",
                  }}
                >
                  <span>{nameText}</span>
                  {!nameDone && (
                    <span className="ml-1 inline-block h-[1em] w-[2px] bg-white animate-blink" />
                  )}
                </h4>

                <p
                  className={`mt-5 max-w-2xl text-sm text-justify text-white transition-all duration-700 sm:text-base ${
                    helloVisible ? "translate-y-0 opacity-80" : "-translate-y-3 opacity-0"
                  }`}
                  style={{
                    opacity: helloVisible ? 0.74 : 0,
                    lineHeight: 1.55,
                    transitionDelay: "0.4s",
                  }}
                >
                  I am a 4th-year BSIT student and a skilled video editor with 2 years of
                  hands-on experience. I have a keen eye for detail and a passion for
                  storytelling through visual media. Whether crafting cinematic sequences or
                  enhancing the impact of a message, I bring creativity and technical expertise
                  to every project. I am proficient in Adobe Premiere, moderately skilled in
                  After Effects, and experienced in sound design.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="/Wence-De-Vera-CV.pdf"
                    download
                    className="inline-flex items-center justify-center rounded-xl px-8 py-3 text-sm font-bold transition-all duration-200 ease-in hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(0,153,255,0.22)] sm:text-base"
                    style={{
                      fontFamily: "'Condenso', sans-serif",
                      background: "linear-gradient(135deg, #0099ff, #18c8ff)",
                      color: "white",
                      opacity: helloVisible ? 1 : 0,
                      transform: helloVisible ? "translateY(0)" : "translateY(12px)",
                      transitionDelay: "0.4s",
                    }}
                  >
                    Download CV
                  </a>

                  <a
                    href="#projects"
                    className="inline-flex items-center justify-center rounded-xl border border-[#0099ff]/65 bg-[#07131d] px-8 py-3 text-sm font-bold text-[#19b7ff] transition-all duration-200 ease-in hover:-translate-y-0.5 hover:border-[#20c4ff] hover:shadow-[0_14px_30px_rgba(0,153,255,0.14)] sm:text-base"
                    style={{
                      fontFamily: "'Condenso', sans-serif",
                      opacity: helloVisible ? 1 : 0,
                      transform: helloVisible ? "translateY(0)" : "translateY(12px)",
                      transitionDelay: "0.6s",
                    }}
                  >
                    <span className="mr-2">{'<>'}</span> View Projects
                  </a>

                  <div className="ml-0 flex items-center gap-3 sm:ml-4">
                    <a
                      href="https://your-link-1.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex h-10 w-10 items-center justify-center"
                    >
                      <div
                        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          backgroundColor: "#0099ff",
                          WebkitMaskImage: "url('/linkedin.png')",
                          WebkitMaskRepeat: "no-repeat",
                          WebkitMaskSize: "contain",
                          WebkitMaskPosition: "center",
                          maskImage: "url('/linkedin.png')",
                          maskRepeat: "no-repeat",
                          maskSize: "contain",
                          maskPosition: "center",
                        }}
                      />
                      <img
                        src="/linkedin.png"
                        alt="LinkedIn"
                        className="h-full w-full object-contain brightness-0 invert transition-opacity duration-300 group-hover:opacity-0"
                      />
                    </a>

                    <a
                      href="https://your-link-2.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex h-10 w-10 items-center justify-center"
                    >
                      <div
                        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          backgroundColor: "#0099ff",
                          WebkitMaskImage: "url('/behance.png')",
                          WebkitMaskRepeat: "no-repeat",
                          WebkitMaskSize: "contain",
                          WebkitMaskPosition: "center",
                          maskImage: "url('/behance.png')",
                          maskRepeat: "no-repeat",
                          maskSize: "contain",
                          maskPosition: "center",
                        }}
                      />
                      <img
                        src="/behance.png"
                        alt="Behance"
                        className="h-full w-full object-contain brightness-0 invert transition-opacity duration-300 group-hover:opacity-0"
                      />
                    </a>

                    <a
                      href="https://your-link-3.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex h-10 w-10 items-center justify-center"
                    >
                      <div
                        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          backgroundColor: "#0099ff",
                          WebkitMaskImage: "url('/upwork.png')",
                          WebkitMaskRepeat: "no-repeat",
                          WebkitMaskSize: "contain",
                          WebkitMaskPosition: "center",
                          maskImage: "url('/upwork.png')",
                          maskRepeat: "no-repeat",
                          maskSize: "contain",
                          maskPosition: "center",
                        }}
                      />
                      <img
                        src="/upwork.png"
                        alt="Upwork"
                        className="h-full w-full object-contain brightness-0 invert transition-opacity duration-300 group-hover:opacity-0"
                      />
                    </a>
                  </div>
                </div>
              </div>

              <div
                className={`relative order-2 w-full self-start overflow-visible lg:-mt-10 lg:basis-[46%] lg:max-w-[46%] lg:ml-auto ${
                  helloVisible ? "translate-x-0 opacity-100" : "translate-x-24 opacity-0"
                } transition-all duration-700 ease-out`}
                style={{ transitionDelay: "0.7s" }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,153,255,0.18)_0%,transparent_72%)] blur-3xl" />
                <div className="relative flex justify-end lg:pr-2">
                  <Image
                    src="/wenshe.png"
                    alt="Wence portrait"
                    width={560}
                    height={560}
                    priority
                    className="relative z-10 h-auto w-full max-w-[34rem] object-contain grayscale drop-shadow-[0_26px_45px_rgba(0,0,0,0.42)]"
                  />
                </div>
              </div>
            </div>

            <div
              ref={buttonsRef}
              className="relative z-20 mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:-mt-24"
            >
              <button
                className={`relative flex h-[160px] w-full flex-col justify-start overflow-hidden rounded-[18px] border border-white/14 bg-[linear-gradient(180deg,rgba(18,24,32,0.86),rgba(11,16,24,0.66))] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(0,0,0,0.26)] ${
                  buttonsVisible[0] ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0b9dff] shadow-[0_10px_30px_rgba(0,153,255,0.24)]">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-[2.2rem] font-bold leading-none text-white">
                    {totalCreativeProjects}
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-1">
                  <span className="text-left text-[11px] uppercase tracking-[0.08em] text-white/76">
                    Total Projects
                  </span>
                  <span className="text-left text-sm text-white/58">
                    Creative graphics and storytelling
                  </span>
                </div>
                <ArrowUpRight className="absolute bottom-5 right-5 h-4 w-4 text-white" />
              </button>

              <button
                className={`relative flex h-[160px] w-full flex-col justify-start overflow-hidden rounded-[18px] border border-white/14 bg-[linear-gradient(180deg,rgba(18,24,32,0.86),rgba(11,16,24,0.66))] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(0,0,0,0.26)] ${
                  buttonsVisible[1] ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0b9dff] shadow-[0_10px_30px_rgba(0,153,255,0.24)]">
                    <Medal className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-[2.2rem] font-bold leading-none text-white">
                    {totalCertificates}
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-1">
                  <span className="text-left text-[11px] uppercase tracking-[0.08em] text-white/76">
                    Certificates
                  </span>
                  <span className="text-left text-sm text-white/58">
                    Professional skills validated
                  </span>
                </div>
                <ArrowUpRight className="absolute bottom-5 right-5 h-4 w-4 text-white" />
              </button>

              <button
                className={`relative flex h-[160px] w-full flex-col justify-start overflow-hidden rounded-[18px] border border-white/14 bg-[linear-gradient(180deg,rgba(18,24,32,0.86),rgba(11,16,24,0.66))] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(0,0,0,0.26)] ${
                  buttonsVisible[2] ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0b9dff] shadow-[0_10px_30px_rgba(0,153,255,0.24)]">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-[2.2rem] font-bold leading-none text-white">2</div>
                </div>
                <div className="mt-5 flex flex-col gap-1">
                  <span className="text-left text-[11px] uppercase tracking-[0.08em] text-white/76">
                    Years of Experience
                  </span>
                  <span className="text-left text-sm text-white/58">
                    Continuous learning journey
                  </span>
                </div>
                <ArrowUpRight className="absolute bottom-5 right-5 h-4 w-4 text-white" />
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

<div className="relative mt-16 flex flex-col items-center overflow-visible transition-all duration-700 ease-out lg:mt-20">
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute left-[6%] top-[8%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.18)_0%,transparent_72%)] blur-3xl" />
    <div className="absolute right-[7%] bottom-[12%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,145,72,0.12)_0%,transparent_74%)] blur-3xl" />
    <div className="absolute inset-x-[14%] top-1/2 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
  </div>

  <div
    className={`${glassSectionClass} z-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
      showAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
    }`}
    style={{ transitionDelay: showAbout ? "0.55s" : "0s" }}
  >
    <GlowingEffect {...mainSectionGlowProps} className="z-[2]" />
    <div className={glassSectionPanelClass}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="absolute right-[10%] top-[14%] h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.14)_0%,transparent_74%)] blur-3xl" />
      </div>

      <div className={`${glassSectionInnerClass} grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start`}>
      <div className="max-w-xl">
        <p className="text-xs uppercase tracking-[0.32em] text-[#8fdcff]">Creative Stack</p>
        <h2
          className="mt-4 text-3xl font-bold text-white sm:text-4xl"
          style={{
            fontFamily: "'CreatoDisplay', sans-serif",
            letterSpacing: "0.03em",
            textShadow: "0 0 16px rgba(0,153,255,0.18)",
          }}
        >
          The tools I trust to keep every edit sharp, cinematic, and intentional.
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/72 sm:text-base">
          My workflow stays simple on the surface but refined in execution. I mainly
          build with Premiere Pro, Photoshop, After Effects, Canva, and Illustrator,
          switching between them depending on whether a project needs pacing, motion,
          layout, or stronger visual polish.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Main Focus</p>
            <p className="mt-2 text-sm font-semibold text-white">Video editing with design support</p>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Core Tools</p>
            <p className="mt-2 text-sm font-semibold text-white">5 daily-use apps</p>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Style</p>
            <p className="mt-2 text-sm font-semibold text-white">Clean, fast, and cinematic</p>
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-8 top-4 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.1)_0%,transparent_72%)] blur-2xl" />
          </div>

          <div className="relative z-10 flex min-h-[215px] flex-col justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#ffe97a]">Edit Flow</p>
              <h3 className="mt-3 max-w-sm text-xl font-semibold text-white">
                I keep the process clear so the final output feels effortless.
              </h3>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">01</p>
                <p className="mt-2 text-sm font-medium text-white/88">Rough cut and pacing first</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">02</p>
                <p className="mt-2 text-sm font-medium text-white/88">Design polish and clean framing</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">03</p>
                <p className="mt-2 text-sm font-medium text-white/88">Motion where it adds real impact</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">04</p>
                <p className="mt-2 text-sm font-medium text-white/88">Export tuned for a strong finish</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {creativeTools.map((tool, index) => (
          <div
            key={tool.name}
            className={`group relative overflow-hidden rounded-[28px] border border-white/12 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/22 ${
              index === 0 ? "sm:col-span-2" : ""
            }`}
            style={{
              background: tool.panelBackground,
              boxShadow: `0 22px 60px ${tool.glow}`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.12), transparent 38%, transparent 100%)",
              }}
            />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-xl font-bold tracking-[0.02em]"
                style={{
                  background: tool.badgeBackground,
                  borderColor: tool.badgeBorder,
                  color: tool.accent,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 30px ${tool.glow}`,
                }}
              >
                {tool.short}
              </div>

              <span
                className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em]"
                style={{
                  borderColor: tool.badgeBorder,
                  color: tool.accent,
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                {tool.category}
              </span>
            </div>

            <div className="relative z-10 mt-5">
              <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/72">
                {tool.description}
              </p>
            </div>

            <div className="relative z-10 mt-5 flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <span
                  key={`${tool.name}-${tag}`}
                  className="rounded-full border px-3 py-1 text-[11px] font-medium text-white/78"
                  style={{
                    borderColor: "rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
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
          className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
            Browse the work by category in one cleaner section. Graphics, Video Edit, and
            Certificates still switch exactly the same way and only show the projects inside the
            selected group.
          </p>
        </div>

        <div
          className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
                {activeProjects.length} {activeProjects.length === 1 ? "item" : "items"} currently showing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`w-full transition-all duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
                  className={`group rounded-[22px] border p-4 text-left transition-all duration-300 ${
                    isActive
                      ? "border-[#00d4ff]/35 bg-[#04101a]/72 shadow-[0_16px_34px_rgba(0,153,255,0.18)]"
                      : "border-white/12 bg-white/[0.04] hover:-translate-y-1 hover:border-[#00d4ff]/28 hover:bg-white/[0.07]"
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

          <div className="mt-2 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] px-4 pb-4 pt-1 sm:px-5 sm:pb-5 sm:pt-2">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#8fdcff]">
                  {activeCategoryMeta.name}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                  {activeCategoryMeta.description}
                </h3>
              </div>
              <p className="text-sm text-white/55">
                {activeProjects.length} {activeProjects.length === 1 ? "item" : "items"} in this
                category
              </p>
            </div>

            {showPortfolio &&
              (activeProjects.length > 0 ? (
                <div
                  key={`${activeBox}-${animateTab ? "in" : "out"}`}
                  className="mt-1 grid grid-cols-1 auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3"
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
              ) : (
                <div
                  key={`${activeBox}-${animateTab ? "in" : "out"}-empty`}
                  className="mt-5 rounded-[20px] border border-dashed border-white/12 bg-black/20 px-5 py-10 text-center"
                >
                  <p className="text-sm text-white/72 sm:text-base">
                    No projects in {activeBox} yet.
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    Add work to this category and it will appear here automatically.
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
          Fill in the fields below. You can add as many gallery images as you want.
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
              placeholder="Design link (e.g. https://...)"
              className="w-full rounded-lg border border-white/20 bg-black/30 text-white text-sm px-3 py-2 outline-none focus:border-[#0099ff]"
            />
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
          </div>

          <textarea
            value={newProjectForm.description}
            onChange={(e) => setNewProjectForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Project description"
            className="w-full min-h-[120px] rounded-lg border border-white/20 bg-black/30 text-white text-sm px-3 py-2 outline-none focus:border-[#0099ff]"
            required
          />

          {newProjectForm.showDetailsModal && (
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

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={closeAddProjectModal}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/90 text-sm hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#0099ff] text-white text-sm font-semibold hover:bg-[#00a6ff] transition-colors"
            >
              Add Project
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
        </div>
        <div className={`${glassSectionClass} z-10`}>
          <GlowingEffect {...mainSectionGlowProps} className="z-[2]" />
          <div className={glassSectionPanelClass}>
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <div className="absolute right-[6%] top-[10%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.12)_0%,transparent_74%)] blur-3xl" />
            </div>
            <div className={`${glassSectionInnerClass} space-y-8`}>
            <div
              className={`flex flex-col gap-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/72 sm:text-base">
                  These stories come from clients and collaborators who trusted me with edits,
                  visuals, revisions, and delivery. The interactive review showcase on the right
                  stays exactly as part of the experience, now paired with a cleaner introduction.
                </p>
              </div>
            </div>
            <div
              className={`w-full transition-all duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                showReviewsTestimonials
                  ? "opacity-100 translate-y-0 blur-0"
                  : "pointer-events-none opacity-0 translate-y-8 blur-sm"
              }`}
            >
              <div className="w-full scale-[1.02] transform-gpu sm:scale-[1.03]">
                <AnimatedTestimonialsDemo />
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
      <div ref={contactRef} className="relative mt-16 flex flex-col items-center overflow-visible pb-20 transition-all duration-700 ease-out lg:mt-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[8%] top-[16%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.18)_0%,transparent_72%)] blur-3xl" />
          <div className="absolute left-[10%] bottom-[12%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_74%)] blur-3xl" />
        </div>
        <div className={`${glassSectionClass} z-10`}>
          <GlowingEffect {...mainSectionGlowProps} className="z-[2]" />
          <div className={glassSectionPanelClass}>
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>
            <div className={`${glassSectionInnerClass} grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10`}>
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
                  onClick={() => setShowContactForm((prev) => !prev)}
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
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {contactPlatforms.map((platform) => (
                  <a
                    key={platform.label}
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#00d4ff]/35 hover:bg-white/[0.07] hover:shadow-[0_14px_34px_rgba(0,153,255,0.16)]"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">{platform.label}</span>
                        <ArrowUpRight className="h-4 w-4 text-[#8fdcff] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-white/62">
                        {platform.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>

              <div className="relative overflow-hidden rounded-[26px] border border-white/12 bg-black/20 p-4 backdrop-blur-md sm:p-5">
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
                      onClick={() => setShowContactForm((prev) => !prev)}
                      className="rounded-full border border-white/15 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 transition-colors hover:bg-white/10"
                    >
                      {showContactForm ? "Close" : "Write"}
                    </button>
                  </div>

                  {showContactForm && (
                    <form onSubmit={handleContactSubmit} className="mt-5 space-y-4">
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
                      <textarea
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
                          {contactSubmitState.message || "Use a Gmail app password in SMTP settings for delivery."}
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
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
      <div className="relative flex flex-col items-center overflow-hidden pb-14 lg:pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="relative z-10 w-full max-w-5xl px-5 sm:px-8 lg:px-10">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#050a12]/88 px-5 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
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

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {socialLinks.map((social, index) => {
                const accentClass =
                  index === 0
                    ? "bg-[#6ec8ff]"
                    : index === 1
                      ? "bg-[#8ef0d2]"
                      : "bg-[#ffd28e]";

                const content = (
                  <>
                    <div className={`absolute left-0 top-0 z-10 h-full w-[3px] ${accentClass}`} />
                    <div className="relative z-10 pl-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">
                          {social.label}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-white/45 transition-all duration-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
                        className={`group relative w-full overflow-hidden rounded-[22px] border bg-white/[0.03] px-4 py-4 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] ${
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
                          className={`absolute bottom-full left-1/2 z-20 mb-3 w-[220px] -translate-x-1/2 transition-all duration-200 ease-out ${
                            isTikTokBubbleVisible
                              ? "translate-y-0 opacity-100"
                              : "translate-y-2 opacity-0"
                          }`}
                        >
                          <div
                            className={`relative rounded-[20px] border border-white/12 bg-[#060b12]/96 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-200 ease-out ${
                              isTikTokBubbleVisible ? "scale-100" : "scale-95"
                            }`}
                          >
                            <div
                              className={`pointer-events-none absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rotate-45 border-b border-r border-white/12 bg-[#060b12]/96 transition-all duration-200 ease-out ${
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
                                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:translate-x-0.5 hover:bg-white/[0.08]"
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
                    className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.06]"
                  >
                    {content}
                  </a>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
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
          -webkit-mask-image: linear-gradient(to top, black 45%, transparent 100%);
          mask-image: linear-gradient(to top, black 45%, transparent 100%);
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          pointer-events: none;
          opacity: 0.2;
        }

        @keyframes pulseSlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulseSlow 2s infinite;
        }
      `}</style>


      
    </div>

    
  );
}

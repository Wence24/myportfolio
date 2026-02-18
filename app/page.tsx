"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Inter } from "next/font/google";
import { Home as HomeIcon, User, Video, Award, Mail, Code, Medal, Globe, ArrowUpRight, Film, Palette, ExternalLink } from "lucide-react"; // added icons

// Google Fonts Inter SemiBold
const inter = Inter({
  weight: "600",
  subsets: ["latin"],
});

export default function Home() {
  const [textVisible, setTextVisible] = useState(false);
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
const [newProjectForm, setNewProjectForm] = useState<NewProjectForm>(createEmptyProjectForm());


const [animateTab, setAnimateTab] = useState(false);

const portfolioCategories = [
  { name: "Graphic Design", icon: Palette },
  { name: "Video Edit", icon: Film },
  { name: "Certificates", icon: Medal },
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

  // About Me typing + slide-in
const [helloVisible, setHelloVisible] = useState(false); // slide in from left
const [nameText, setNameText] = useState("");
const [nameDone, setNameDone] = useState(false); // new
const [buttonsVisible, setButtonsVisible] = useState([false, false, false]);
const buttonsRef = useRef<HTMLDivElement>(null);
const [modalVisible, setModalVisible] = useState(false);




  const videoFullText = "VIDEO EDITOR";
  const graphicFullText = "GRAPHIC DESIGNER";

const hasShownAbout = useRef(false);
const hasShownHello = useRef(false);


  const hasRun = useRef(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  const aboutRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const certRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const [showSideNav, setShowSideNav] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const sideNavIds = ["home", "about", "portfolio", "cert", "contact"] as const;
  type SideNavId = (typeof sideNavIds)[number];
  const [sideNavDropId, setSideNavDropId] = useState<string | null>(null);
  const sideNavDropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sideNavTransfer, setSideNavTransfer] = useState<{ from: number; to: number; key: number } | null>(null);
  const sideNavTransferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousActiveSectionRef = useRef<SideNavId>("home");

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
    const handleScroll = () => {
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
        { id: "cert", ref: certRef },
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

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // check on mount
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
    if (sideNavDropTimerRef.current) {
      clearTimeout(sideNavDropTimerRef.current);
    }
    if (sideNavTransferTimerRef.current) {
      clearTimeout(sideNavTransferTimerRef.current);
    }
  };
}, []);

const scrollToSection = (ref: React.RefObject<HTMLDivElement | null> | null) => {
  const targetTop = ref?.current ? ref.current.offsetTop : 0;
  window.scrollTo({ top: targetTop, behavior: "smooth" });
};

useEffect(() => {
  const nextSection = activeSection as SideNavId;
  const previousSection = previousActiveSectionRef.current;
  if (previousSection === nextSection) return;

  const fromIndex = sideNavIds.indexOf(previousSection);
  const toIndex = sideNavIds.indexOf(nextSection);
  if (fromIndex >= 0 && toIndex >= 0) {
    setSideNavTransfer({ from: fromIndex, to: toIndex, key: Date.now() });

    if (sideNavTransferTimerRef.current) {
      clearTimeout(sideNavTransferTimerRef.current);
    }
    sideNavTransferTimerRef.current = setTimeout(() => {
      setSideNavTransfer(null);
    }, 860);

    setSideNavDropId(nextSection);
    if (sideNavDropTimerRef.current) {
      clearTimeout(sideNavDropTimerRef.current);
    }
    sideNavDropTimerRef.current = setTimeout(() => {
      setSideNavDropId(null);
    }, 760);
  }

  previousActiveSectionRef.current = nextSection;
}, [activeSection]);

  // NAV LIST WITH ACTIVE UNDERLINE
  const navList = (
    <ul
  className={`mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6 ${inter.className}`}
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
  if (showModal) {
    const timer = setTimeout(() => setModalVisible(true), 50); // trigger fade in
    return () => clearTimeout(timer);
  } else {
    setModalVisible(false);
  }
}, [showModal]);

useEffect(() => {
  if (showAddProjectModal) {
    const timer = setTimeout(() => setAddProjectModalVisible(true), 50);
    return () => clearTimeout(timer);
  } else {
    setAddProjectModalVisible(false);
  }
}, [showAddProjectModal]);

useEffect(() => {
  const shouldLockScroll = showModal || showAddProjectModal;
  document.body.style.overflow = shouldLockScroll ? "hidden" : "";

  return () => {
    document.body.style.overflow = "";
  };
}, [showModal, showAddProjectModal]);

// SIDE NAV BUTTON
const sideBtn = (id: SideNavId, Icon: any, ref: React.RefObject<HTMLDivElement | null>) => (
  <button
    onClick={() => {
      setSideNavDropId(id);
      if (sideNavDropTimerRef.current) {
        clearTimeout(sideNavDropTimerRef.current);
      }
      sideNavDropTimerRef.current = setTimeout(() => {
        setSideNavDropId(null);
      }, 760);
      scrollToSection(ref);
    }}
    className={`
      side-wave-btn relative isolate overflow-hidden
      w-12 h-12 rounded-full flex items-center justify-center
      transition-all duration-300 ease-out
      ${sideNavDropId === id ? "side-nav-drop-active" : ""}
      ${activeSection === id 
        ? "scale-125 bg-white text-black shadow-lg shadow-blue-400/50 hover:shadow-blue-500/70 hover:scale-130"
        : "scale-100 bg-black/70 text-white hover:scale-110 hover:shadow-lg hover:shadow-white/30"
      }
    `}
  >
    <Icon size={18} className="relative z-10" />
  </button>
);

const closeDetailsModal = () => {
  setShowModal(false);
  setSelectedProject(null);
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

const isAnyModalOpen = showModal || showAddProjectModal;
const activeProjects = portfolioProjects[activeBox] || [];

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-black overflow-y-auto">
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

      {/* GRUNGE BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
          style={{ backgroundImage: "url('/grunge.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* NAVBAR */}
      <div className="relative z-50">
        
        <nav
         ref={navbarRef}
          className={`sticky top-0 w-full rounded-none px-4 py-2 lg:px-8 lg:py-4 backdrop-blur-sm bg-black/80 border-none ${inter.className}`}
        >
          <div className="flex items-center justify-between relative">
            <Image src="/logo.png" alt="Logo" width={40} height={40} priority />
            <div className="hidden lg:block">{navList}</div>
          </div>
        </nav>

        {/* EDGE GLOW BELOW NAVBAR */}
        <div
          className="absolute left-0 w-full pointer-events-none animate-pulse-slow"
          style={{
            top: "100%",
            height: "12px",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.0) 100%)",
            filter: "blur(16px)",
            zIndex: 49,
          }}
        />
      </div>

     {/* SIDE NAV */}
<div
  className={`
    fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4
    transition-all duration-500 ease-out
    ${showSideNav 
      ? "translate-x-0 opacity-100"    // slide in from right
      : "translate-x-full opacity-0"}  // slide out to right
  `}
>
  {sideBtn("home", HomeIcon, heroRef)}
  {sideBtn("about", User, aboutRef)}
  {sideBtn("portfolio", Video, portfolioRef)}
  {sideBtn("cert", Award, certRef)}
  {sideBtn("contact", Mail, contactRef)}

  {sideNavTransfer &&
    (() => {
      const step = 64; // 48px button + 16px gap
      const centerOffset = 24;
      const fromY = centerOffset + sideNavTransfer.from * step;
      const toY = centerOffset + sideNavTransfer.to * step;
      const minY = Math.min(fromY, toY);
      const distance = Math.max(Math.abs(toY - fromY), 2);
      const travel = toY - fromY;
      const dropStyle: React.CSSProperties & { "--side-nav-travel": string } = {
        left: "50%",
        top: `${fromY}px`,
        "--side-nav-travel": `${travel}px`,
      };

      return (
        <div key={`side-nav-transfer-${sideNavTransfer.key}`} className="pointer-events-none absolute inset-0 z-[60]">
          <div
            className={`side-nav-transfer-trail ${
              travel >= 0 ? "side-nav-transfer-trail-down" : "side-nav-transfer-trail-up"
            }`}
            style={{ left: "50%", top: `${minY}px`, height: `${distance}px` }}
          />
          <div className="side-nav-transfer-drop" style={dropStyle} />
        </div>
      );
    })()}
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

          {/* White base text */}
          <h1
            className="
              text-[16rem] sm:text-[22rem] md:text-[30rem] lg:text-[40rem]
              portfolio-heading select-none pointer-events-none leading-none
              text-white
            "
          >
            PORTFOLIO
          </h1>

          {/* Textured lower-half overlay */}
          <h1
            className="
              absolute top-0 left-0 w-full
              text-[16rem] sm:text-[22rem] md:text-[30rem] lg:text-[40rem]
              portfolio-heading select-none pointer-events-none leading-none
              text-transparent bg-clip-text
            "
            style={{
              backgroundImage: "url('/textures/stone.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              WebkitMaskImage: "linear-gradient(to top, black 45%, transparent 100%)",
              maskImage: "linear-gradient(to top, black 45%, transparent 100%)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              opacity: 0.2,
            }}
          >
            PORTFOLIO
          </h1>
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


      {/* ===== ABOUT ME SECTION OUTSIDE HERO ===== */}
{/* ===== ABOUT ME SECTION ===== */}
<div
  ref={aboutRef}
  className="relative flex flex-col items-center mt-[610px] transition-all duration-700 ease-out"
>
  {/* About Me Heading (Centered) */}
  <h2
    className={`text-3xl sm:text-4xl font-bold mb-2 transition-all duration-700 ${
      showAbout ? "opacity-100 scale-100" : "opacity-0 scale-75"
    }`}
    style={{
      background: "linear-gradient(135deg, #ffffff, #0099ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textShadow:
        "0 0 6px rgba(0,153,255,0.6), 0 0 14px rgba(0,153,255,0.45), 0 0 26px rgba(0,153,255,0.3)",
    }}
  >
    About Me
  </h2>

  {/* Small caption below About Me (separate animation) */}
  <p
    className={`text-sm sm:text-base font-medium mb-8 text-center transition-all duration-700 ${
      showAbout ? "opacity-80 translate-y-0" : "opacity-0 -translate-y-3"
    }`}
    style={{
      color: "white",
      opacity: showAbout ? 0.7 : 0, // lower opacity
      transitionDelay: showAbout ? "0.4s" : "0s", // delayed fade-in
    }}
  >
    🎥 Turning ideas into visuals that speak louder than words 🎥
  </p>

  {/* GLASSMORPHISM CONNECTED CONTAINER (same style as Portfolio Showcase) */}
  <div
    className={`relative w-full max-w-7xl mx-auto -mt-1 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg shadow-black/10 p-2 lg:p-4 overflow-hidden transition-all duration-700 ${
      showAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
    }`}
    style={{ fontFamily: "Arial, sans-serif", transitionDelay: showAbout ? "0.4s" : "0s" }}
  >
  {/* FLEX CONTAINER: Text Left, Circle Right */}
  <div className="relative flex flex-col sm:flex-row items-start w-full max-w-7xl mx-auto px-2 lg:px-4 gap-6 lg:gap-8 mt-8 lg:mt-10 pb-8 lg:pb-10 justify-between">
    {/* Left: Text */}
    <div className="order-1 w-full sm:basis-[56%] sm:max-w-[56%] flex flex-col items-start lg:pr-8">
      {/* Hello, I'm */}
      <h3
        className={`text-4xl sm:text-5xl font-bold mb-0.5 transition-all duration-700 ${
          helloVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-64"
        }`}
        style={{
          background: "linear-gradient(135deg, #ffffff, #0099ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontFamily: "'Condenso', sans-serif",
        }}
      >
        Hello, I'm
      </h3>

      {/* Name */}
      <h4
        className="text-4xl sm:text-5xl font-bold text-white transition-all duration-700 delay-300 flex items-center"
        style={{
          opacity: helloVisible ? 1 : 0,
          transform: helloVisible ? "translateX(0)" : "translateX(-64px)",
          transition: "all 0.7s ease-out 0.3s",
          fontFamily: "'Condenso', sans-serif",
        }}
      >
        <span>{nameText}</span>
        {!nameDone && (
          <span className="w-[2px] h-[1em] bg-white ml-1 animate-blink inline-block" />
        )}
      </h4>

      {/* Short description */}
      <p
        className={`mt-4 text-sm sm:text-base max-w-lg text-white transition-all duration-700 text-justify  transition-opacity duration-700${
          helloVisible ? "opacity-80 translate-y-0" : "opacity-0 -translate-y-3"
        }`}
        style={{
          opacity: helloVisible ? 0.7 : 0,
          lineHeight: 1.5,
           maxWidth: "850px",
           textAlign: "justify",
           transitionDelay: "0.4s", // fades in after name

        }}
      >
        I am a 4th-year BSIT student and a skilled video editor with 2 years of hands-on experience.  
        I have a keen eye for detail and a passion for storytelling through visual media.  
        Whether crafting cinematic sequences or enhancing the impact of a message, I bring creativity and technical expertise to every project.  
        I am proficient in Adobe Premiere, moderately skilled in After Effects, and experienced in sound design.  
      </p>

      {/* FLEX CONTAINER FOR BUTTONS */}
<div className="mt-6 flex gap-4">
  {/* Download CV Button */}
  <a
    href="/Wence-De-Vera-CV.pdf" // put your CV file in /public
    download
    className="
      inline-flex items-center justify-center
      px-8 py-3 rounded-lg
      font-bold text-sm sm:text-base
      transition-transform duration-200 ease-in
      hover:scale-105 hover:shadow-lg
      hover:shadow-[#0099ff]/40
    "
    style={{
      fontFamily: "'Condenso', sans-serif",
      background: "linear-gradient(135deg, #0099ff, #00ccff)",
      color: "white",
      opacity: helloVisible ? 1 : 0,
    transform: helloVisible ? "translateY(0)" : "translateY(12px)",
    transitionDelay: "0.4s", // SAME as description
      
      
    }}
  >
    Download CV
  </a>

  {/* View Projects Button */}
  <a
    href="#projects"
    className="
      inline-flex items-center justify-center
      px-8 py-3 rounded-lg
      font-bold text-sm sm:text-base
      border-2 border-[#0099ff]
      text-[#0099ff]
      transition-transform duration-200 ease-in
      hover:scale-105 hover:shadow-lg hover:shadow-[#0099ff]/40
    "
    style={{
      fontFamily: "'Condenso', sans-serif",
        opacity: helloVisible ? 1 : 0,
    transform: helloVisible ? "translateY(0)" : "translateY(12px)",
    transitionDelay: "0.6s", // delayed after Download CV
      
    }}
  >
    <span className="mr-2">{'<>'}</span> View Projects
  </a>

   {/* SOCIAL ICONS (Right of View Projects) */}
<div className="flex items-center gap-2 ml-4 -mt-1">
  {/* LinkedIn */}
  <a
    href="https://your-link-1.com"
    target="_blank"
    rel="noopener noreferrer"
    className="relative w-9 h-9"
  >
    {/* Hover effect layer */}
    <div
      className="absolute inset-0 transition-opacity duration-300 opacity-0 hover:opacity-100"
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
    {/* Original icon */}
    <img
      src="/linkedin.png"
      alt="LinkedIn"
      className="w-full h-full object-contain"
    />
  </a>

  {/* Behance */}
  <a
    href="https://your-link-2.com"
    target="_blank"
    rel="noopener noreferrer"
    className="relative w-9 h-9 mt-1"
  >
    <div
      className="absolute inset-0 transition-opacity duration-300 opacity-0 hover:opacity-100"
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
      className="w-full h-full object-contain"
    />
  </a>

  {/* Upwork */}
  <a
    href="https://your-link-3.com"
    target="_blank"
    rel="noopener noreferrer"
    className="relative w-9 h-9 mt-2"
  >
    <div
      className="absolute inset-0 transition-opacity duration-300 opacity-0 hover:opacity-100"
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
      className="w-full h-full object-contain"
    />
  </a>
</div>

  
</div>


 </div>


{/* Right: Image (same as v6.png style) */}
<div
  className={`relative order-2 w-full sm:basis-[44%] sm:max-w-[44%] flex-shrink-0 self-start sm:ml-auto mt-2 sm:mt-0 lg:-mt-12 transition-all duration-700 ease-out ${
    helloVisible
      ? "opacity-100 translate-x-0"
      : "opacity-0 translate-x-24"
  }`}
  style={{ transitionDelay: "0.7s" }}
>
  <Image
    src="/wenshe.png"
    alt="Wence portrait"
    width={520}
    height={520}
    priority
    className="
      w-full
      h-auto
      object-contain
      grayscale
      drop-shadow-2xl
    "
  />
  
  {/* NEW LARGE GLASSMORPHISM BUTTONS OVER IMAGE */}
  <div
    ref={buttonsRef}
    className="absolute bottom-1 left-3 right-3 z-20 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:left-[-128%] sm:right-auto sm:w-[228%] sm:gap-3"
  >

  {/* Button 1 as horizontal glass card */}
  <button 
    
    className={`w-full h-[150px] relative rounded-lg backdrop-blur-xl bg-black/35 border border-white/20 shadow-lg shadow-black/10 p-4 flex flex-col justify-start transition-all duration-300 hover:duration-200 hover:scale-105 hover:shadow-xl hover:shadow-white/20 ${
  buttonsVisible[0] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
}`}

    style={{ fontFamily: "Arial, sans-serif" }}
  >
    {/* Top row: Icon left, Number right */}
    <div className="flex justify-between items-start">
      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0099ff]">
        <Code className="w-6 h-6 text-white" />
      </div>

      {/* Number */}
      <div className="text-3xl font-bold leading-none">{3}</div>
    </div>

    {/* Bottom-left: Title + Description */}
    <div className="flex flex-col gap-0.5 mt-4">
      <span className="text-sm uppercase opacity-80 text-left">TOTAL PROJECTS</span>
      <span className="text-xs opacity-70 text-left">Creative graphics and storytelling</span>
    </div>

    {/* Bottom-right: Arrow */}
    <ArrowUpRight className="w-4 h-4 text-white absolute bottom-4 right-4" />
  </button>

  {/* Button 2 */}
  <button
    className={`w-full h-[150px] relative rounded-lg backdrop-blur-xl bg-black/35 border border-white/20 shadow-lg shadow-black/10 p-4 flex flex-col justify-start transition-all duration-300 hover:duration-200 hover:scale-105 hover:shadow-xl hover:shadow-white/20 ${
  buttonsVisible[1] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
}`}

    style={{ fontFamily: "Arial, sans-serif" }}
  >
    {/* Top row: Icon left, Number right */}
    <div className="flex justify-between items-start">
      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0099ff]">
        <Medal className="w-6 h-6 text-white" />
      </div>

      {/* Number */}
      <div className="text-3xl font-bold leading-none">{0}</div>
    </div>

    {/* Bottom-left: Title + Description */}
    <div className="flex flex-col gap-0.5 mt-4">
      <span className="text-sm uppercase opacity-80 text-left">Certificates</span>
      <span className="text-xs opacity-70 text-left">Professional skills validated</span>
    </div>

    {/* Bottom-right: Arrow */}
    <ArrowUpRight className="w-4 h-4 text-white absolute bottom-4 right-4" />
  </button>

  {/* Button 3 */}
  <button
      className={`w-full h-[150px] relative rounded-lg backdrop-blur-xl bg-black/35 border border-white/20 shadow-lg shadow-black/10 p-4 flex flex-col justify-start transition-all duration-300 hover:duration-200 hover:scale-105 hover:shadow-xl hover:shadow-white/20 ${
  buttonsVisible[2] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
}`}
  style={{ fontFamily: "Arial, sans-serif" }}
  >
    {/* Top row: Icon left, Number right */}
    <div className="flex justify-between items-start">
      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0099ff]">
        <Globe className="w-6 h-6 text-white" />
      </div>

      {/* Number */}
      <div className="text-3xl font-bold leading-none">{2}</div>
    </div>

    {/* Bottom-left: Title + Description */}
    <div className="flex flex-col gap-0.5 mt-4">
      <span className="text-[11px] uppercase opacity-80 text-left">YEARS OF EXPERIENCE</span>
      <span className="text-xs opacity-70 text-left">Continuous learning journey</span>
    </div>

    {/* Bottom-right: Arrow */}
    <ArrowUpRight className="w-4 h-4 text-white absolute bottom-4 right-4" />
  </button>

  {/* Slide-Up Keyframes */}
  <style jsx>{`
    .animate-slideUp {
      opacity: 0;
      transform: translateY(50px);
      animation: slideUp 0.7s forwards;
    }
    @keyframes slideUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `}</style>

  </div>
</div>

  </div>
</div>
</div>

{/* ===== PORTFOLIO SHOWCASE SECTION ===== */}
<div
  ref={portfolioRef}
  className="relative flex flex-col items-center mt-16 lg:mt-20 transition-all duration-700 ease-out"
>
  {/* Heading */}
  <h2
    className={`text-3xl sm:text-4xl font-bold mb-2 transition-all duration-700 ${
      showPortfolio ? "opacity-100 scale-100" : "opacity-0 scale-75"
    }`}
    style={{
      background: "linear-gradient(135deg, #ffffff, #0099ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textShadow:
        "0 0 6px rgba(0,153,255,0.6), 0 0 14px rgba(0,153,255,0.45), 0 0 26px rgba(0,153,255,0.3)",
    }}
  >
    Portfolio Showcase
  </h2>

  {/* Small description */}
  <p
    className={`text-sm sm:text-base font-medium mb-8 text-center transition-all duration-700 ${
      showPortfolio ? "opacity-80 translate-y-0" : "opacity-0 -translate-y-3"
    }`}
    style={{
      color: "white",
      opacity: showPortfolio ? 0.7 : 0,
      transitionDelay: showPortfolio ? "0.4s" : "0s",
    }}
  >
    Explore my journey through projects, certifications, and technical expertise. Each <br />section represents a milestone in my continuous learning path.
  </p>


{/* GLASSMORPHISM CONNECTED CONTAINER */}
<div
  className={`relative w-full max-w-7xl mx-auto -mt-1 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg shadow-black/10 p-2 lg:p-4 pb-8 lg:pb-10 overflow-hidden transition-all duration-700 ${
    showPortfolio ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
  }`}
  style={{ fontFamily: "Arial, sans-serif", transitionDelay: showPortfolio ? "0.4s" : "0s" }}
>
  <div
    className={`pointer-events-none absolute inset-0 z-30 rounded-xl bg-black/40 transition-opacity duration-300 ${
      isAnyModalOpen ? "opacity-100" : "opacity-0"
    }`}
  />

  <div className="flex flex-col lg:flex-row gap-4">
    {portfolioCategories.map((item) => {
      const Icon = item.icon;
      return (
        <div
          key={item.name}
          onClick={() => {
            setActiveBox(item.name);
            setAnimateTab(false);
            setTimeout(() => {
              setAnimateTab(true);
            }, 50);
          }}
          className={`flex-1 w-full lg:w-[380px] flex flex-col items-center justify-center py-3 px-10 rounded-lg backdrop-blur-xl border border-white/10 shadow-sm transition-all duration-500 cursor-pointer ${
            activeBox === item.name
              ? "bg-[rgba(0,153,255,0.15)] shadow-[0_0_20px_rgba(0,153,255,0.3)]"
              : "bg-white/1 opacity-60 hover:opacity-80"
          }`}
          style={{ animation: showPortfolio ? "fadeIn 0.7s ease forwards" : "none" }}
        >
          <Icon className="w-6 h-6 text-white mb-1" />
          <span className="font-bold text-sm text-white mb-0.5 text-center">{item.name}</span>
        </div>
      );
    })}
  </div>

  {showPortfolio && (
    <div
      key={`${activeBox}-${animateTab ? "in" : "out"}`}
      className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-2"
    >
      {activeProjects.map((project, index) => (
        <div
          key={`${activeBox}-${project.title}-${index}`}
          className="bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg p-4 rounded-lg transition-all duration-700 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,153,255,0.3)] hover:bg-white/20 opacity-0 translate-y-6 animate-fadeIn"
          style={{ animationDelay: `${0.2 + index * 0.2}s` }}
        >
          <Image
            src={project.image}
            alt={project.title}
            width={400}
            height={250}
            className="rounded-lg object-cover mb-4"
          />
          <h3 className="text-white text-m mb-1 project-heading tracking-wider">{project.title}</h3>
          <p className="text-xs text-white/80 mb-4 mt-2 line-clamp-3">{project.description}</p>

          <div className="flex justify-between items-center mt-4">
            <a
              href={project.designLink}
              className="flex items-center gap-2 text-xs text-[#0099ff] font-semibold hover:underline"
            >
              Link to design
              <ExternalLink className="w-3 h-3 -mt-[0px] -ml-1" />
            </a>

            {project.showDetailsModal ? (
              <button
                onClick={() => {
                  setSelectedProject(project);
                  setShowModal(true);
                }}
                className="flex items-center gap-1 text-xs text-white/90 font-semibold px-2 py-1 rounded-sm backdrop-blur-md bg-white/0 border border-white/5 hover:bg-white/20 transition-all duration-300 cursor-pointer"
              >
                Details
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 12h14m0 0l-4-4m4 4l-4 4"
                  />
                </svg>
              </button>
            ) : (
              <span className="flex items-center gap-1 text-xs text-white/50 font-semibold px-2 py-1 rounded-sm border border-white/5">
                Details
              </span>
            )}
          </div>
        </div>
      ))}

      <div
        key={`${activeBox}-add-project`}
        onClick={openAddProjectModal}
        className="bg-white/10 backdrop-blur-xl border border-dashed border-[#0099ff]/50 shadow-lg p-4 rounded-lg transition-all duration-700 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,153,255,0.3)] hover:bg-white/20 opacity-0 translate-y-6 animate-fadeIn cursor-pointer"
        style={{ animationDelay: `${0.2 + activeProjects.length * 0.2}s` }}
      >
        <div className="w-full h-[250px] rounded-lg mb-4 border border-dashed border-white/25 bg-white/5 flex items-center justify-center">
          <span className="text-6xl leading-none text-[#0099ff] animate-pulse-slow">+</span>
        </div>

        <h3 className="text-white text-m mb-1 project-heading tracking-wider">Add New Project</h3>
        <p className="text-xs text-white/80 mb-4 mt-2 line-clamp-3">
          Click to open the project creator modal for the selected category.
        </p>

        <div className="flex justify-between items-center mt-4">
          <span className="flex items-center gap-2 text-xs text-[#0099ff] font-semibold">
            Link to design
            <ExternalLink className="w-3 h-3 -mt-[0px] -ml-1" />
          </span>

          <span className="flex items-center gap-1 text-xs text-white/50 font-semibold px-2 py-1 rounded-sm border border-white/5">
            Details
          </span>
        </div>
      </div>
    </div>
  )}

  {showModal &&
    selectedProject &&
    typeof window !== "undefined" &&
    createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        modalVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={closeDetailsModal}
    >
      <div
        className={`relative w-11/12 max-w-6xl bg-black/20 backdrop-blur-3xl rounded-3xl border border-[#0099ff]/25 shadow-[0_0_24px_rgba(0,153,255,0.2)] modal-blue-flow p-6 md:p-8 flex flex-col justify-start transform transition-all duration-500 ${
          modalVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.45), rgba(255,255,255,0.1), rgba(0,153,255,0.14))",
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
            <img
              src={selectedProject.details?.heroImage || selectedProject.image}
              alt={`${selectedProject.title} preview`}
              className="max-h-60 md:max-h-72 object-contain rounded-lg"
            />
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

  {showAddProjectModal &&
    typeof window !== "undefined" &&
    createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        addProjectModalVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={closeAddProjectModal}
    >
      <div
        className={`relative w-11/12 max-w-5xl max-h-[84vh] overflow-y-auto rounded-3xl border border-[#0099ff]/25 shadow-[0_0_24px_rgba(0,153,255,0.22)] modal-blue-flow p-5 md:p-6 transform transition-all duration-500 ${
          addProjectModalVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(255,255,255,0.1), rgba(0,153,255,0.16))",
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

     
      <div ref={certRef} className="h-[100vh] flex items-center justify-center">
        <h2 className="text-5xl font-bold">Certificates Section</h2>
      </div>
      <div ref={contactRef} className="h-[100vh] flex items-center justify-center">
        <h2 className="text-5xl font-bold">Contact Section</h2>
      </div>

      {/* EXTRA SPACE BELOW TO ENABLE SCROLL */}
      <div className="h-[100vh]" />

      <style>{`
        .side-nav-transfer-trail {
          position: absolute;
          width: 16px;
          border-radius: 9999px;
          transform: translateX(-50%);
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.72) 0%,
            rgba(210, 243, 255, 0.46) 36%,
            rgba(121, 201, 255, 0.22) 72%,
            rgba(121, 201, 255, 0) 100%
          );
          box-shadow: 0 0 14px rgba(125, 203, 255, 0.35);
          filter: blur(1.1px);
          opacity: 0;
        }
        .side-nav-transfer-trail-down {
          transform-origin: top center;
          animation: sideNavTrailDown 0.88s ease-out forwards;
        }
        .side-nav-transfer-trail-up {
          transform-origin: bottom center;
          animation: sideNavTrailUp 0.88s ease-out forwards;
        }
        .side-nav-transfer-drop {
          position: absolute;
          width: 48px;
          height: 48px;
          border-radius: 9999px;
          transform: translate(-50%, -50%);
          background: radial-gradient(
            circle at 36% 28%,
            rgba(255, 255, 255, 1) 0%,
            rgba(245, 252, 255, 0.98) 42%,
            rgba(220, 242, 255, 0.92) 70%,
            rgba(182, 223, 255, 0.78) 100%
          );
          box-shadow:
            0 2px 12px rgba(139, 208, 255, 0.42),
            0 0 20px rgba(171, 226, 255, 0.25),
            inset 0 -4px 7px rgba(117, 176, 220, 0.4);
          opacity: 0;
          animation: sideNavTransferDrop 0.88s cubic-bezier(0.22, 0.72, 0.24, 1) forwards;
        }
        @keyframes sideNavTrailDown {
          0% {
            opacity: 0;
            transform: translateX(-50%) scaleX(0.42) scaleY(0.12);
          }
          22% {
            opacity: 0.72;
          }
          58% {
            opacity: 0.52;
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) scaleX(0.95) scaleY(1.03);
          }
        }
        @keyframes sideNavTrailUp {
          0% {
            opacity: 0;
            transform: translateX(-50%) scaleX(0.42) scaleY(0.12);
          }
          22% {
            opacity: 0.72;
          }
          58% {
            opacity: 0.52;
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) scaleX(0.95) scaleY(1.03);
          }
        }
        @keyframes sideNavTransferDrop {
          0% {
            opacity: 0.96;
            transform: translate(-50%, -50%) scale(1);
            width: 48px;
            height: 48px;
            border-radius: 9999px;
            box-shadow:
              0 2px 10px rgba(146, 212, 255, 0.4),
              0 0 16px rgba(184, 230, 255, 0.22);
          }
          22% {
            transform: translate(
              -50%,
              calc(-50% + calc(var(--side-nav-travel) * 0.2))
            ) scale(0.98, 1.02);
            width: 44px;
            height: 54px;
            border-radius: 52% 48% 57% 43% / 41% 59% 43% 57%;
          }
          52% {
            transform: translate(
              -50%,
              calc(-50% + calc(var(--side-nav-travel) * 0.56))
            ) scale(0.94, 1.08);
            width: 24px;
            height: 72px;
            border-radius: 16px;
            box-shadow:
              0 0 18px rgba(166, 225, 255, 0.35),
              0 3px 14px rgba(112, 191, 245, 0.35);
          }
          74% {
            transform: translate(
              -50%,
              calc(-50% + calc(var(--side-nav-travel) * 0.82))
            ) scale(0.95, 1.04);
            width: 30px;
            height: 62px;
            border-radius: 18px;
          }
          88% {
            transform: translate(
              -50%,
              calc(-50% + calc(var(--side-nav-travel) * 0.94))
            ) scale(1, 1);
            width: 46px;
            height: 50px;
            border-radius: 9999px;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, calc(-50% + var(--side-nav-travel))) scale(1);
            width: 48px;
            height: 48px;
            border-radius: 9999px;
          }
        }
        .side-nav-drop-active {
          animation: sideNavMorph 0.76s cubic-bezier(0.2, 0.72, 0.24, 1);
          will-change: border-radius;
        }
        @keyframes sideNavMorph {
          0% {
            border-radius: 9999px;
          }
          18% {
            border-radius: 58% 42% 55% 45% / 44% 60% 40% 56%;
          }
          44% {
            border-radius: 44% 56% 40% 60% / 62% 42% 58% 38%;
          }
          68% {
            border-radius: 56% 44% 60% 40% / 46% 58% 42% 54%;
          }
          100% {
            border-radius: 9999px;
          }
        }
        .side-wave-btn::before {
          content: "";
          position: absolute;
          inset: -60% -95%;
          background: linear-gradient(
            110deg,
            transparent 18%,
            rgba(0, 153, 255, 0.08) 34%,
            rgba(143, 211, 255, 0.5) 49%,
            rgba(255, 255, 255, 0.45) 52%,
            rgba(0, 153, 255, 0.35) 58%,
            transparent 76%
          );
          transform: translateX(-120%) rotate(-8deg);
          opacity: 0;
          pointer-events: none;
          z-index: 0;
        }
        .side-wave-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(circle at 30% 50%, rgba(143, 211, 255, 0.16), transparent 55%);
          opacity: 0;
          pointer-events: none;
          z-index: 0;
        }
        .side-wave-btn:is(:hover, :focus-visible)::before {
          opacity: 1;
          animation: sideWaveFlow 1.1s ease-in-out infinite;
        }
        .side-wave-btn:is(:hover, :focus-visible)::after {
          opacity: 1;
          animation: sideWaveGlow 1.1s ease-in-out infinite;
        }
        @keyframes sideWaveFlow {
          0% {
            transform: translateX(-120%) rotate(-8deg);
          }
          50% {
            transform: translateX(0%) rotate(-8deg);
          }
          100% {
            transform: translateX(120%) rotate(-8deg);
          }
        }
        @keyframes sideWaveGlow {
          0%, 100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.38;
          }
        }
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

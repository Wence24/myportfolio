"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
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
  const [showAbout, setShowAbout] = useState(false); // scroll-triggered About Me
  const [videoText, setVideoText] = useState("");
  const [graphicText, setGraphicText] = useState("");
  const [videoDone, setVideoDone] = useState(false);
  const [graphicDone, setGraphicDone] = useState(false);
const [activeBox, setActiveBox] = useState("Graphic Design"); // default Projects
const [showPortfolio, setShowPortfolio] = useState(false);
const portfolioShown = useRef(false);
const [showModal, setShowModal] = useState(false);


const [animateTab, setAnimateTab] = useState(false);

const portfolioCategories = [
  { name: "Graphic Design", icon: Palette },
  { name: "Video Edit", icon: Film },
  { name: "Certificates", icon: Medal },
] as const;

const portfolioProjects: Record<
  string,
  Array<{
    title: string;
    description: string;
    image: string;
    designLink: string;
    showDetailsModal?: boolean;
  }>
> = {
  "Graphic Design": [
    {
      title: "COMRADZ Sessions",
      description:
        "A weekly poster designed to showcase the details of our Sunday dance sessions. Each poster highlights the schedule, theme, and key information for the day’s session, making it easy for participants to stay informed and join in. The design aims to be clear, engaging, and consistent, creating a recognizable visual identity for COMRADZ’s weekly gatherings.",
      image: "/comradz.png",
      designLink: "#",
      showDetailsModal: true,
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


  // Typing animation
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    setTimeout(() => setIntroDone(true), 400);
    setTimeout(() => setTextVisible(true), 300);
    setTimeout(() => setImageVisible(true), 700);

    let vIndex = 0;
    let gIndex = 0;

    const videoInterval = setInterval(() => {
      setVideoText(videoFullText.slice(0, vIndex + 1));
      vIndex++;

      if (vIndex === videoFullText.length) {
        clearInterval(videoInterval);
        setVideoDone(true);

        setTimeout(() => {
          const graphicInterval = setInterval(() => {
            setGraphicText(graphicFullText.slice(0, gIndex + 1));
            gIndex++;

            if (gIndex === graphicFullText.length) {
              clearInterval(graphicInterval);
              setGraphicDone(true);
            }
          }, 100);
        }, 500);
      }
    }, 100);

    return () => clearInterval(videoInterval);
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
        if (item.ref) {
          item.ref.current?.scrollIntoView({ behavior: "smooth" });
        } else {
          // Scroll to top for Home
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
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

// SIDE NAV BUTTON
const sideBtn = (id: string, Icon: any, ref: React.RefObject<HTMLDivElement | null>) => (
  <button
    onClick={() => ref.current?.scrollIntoView({ behavior: "smooth" })}
    className={`
      w-12 h-12 rounded-full flex items-center justify-center
      transition-all duration-300 ease-out
      ${activeSection === id 
        ? "scale-125 bg-white text-black shadow-lg shadow-blue-400/50 hover:shadow-blue-500/70 hover:scale-130"
        : "scale-100 bg-black/70 text-white hover:scale-110 hover:shadow-lg hover:shadow-white/30"
      }
    `}
  >
    <Icon size={18} />
  </button>
);


  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-black overflow-y-auto">
      {/* INTRO BLACK SCREEN */}
      <div
        className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-700 pointer-events-none ${
          introDone ? "opacity-0" : "opacity-100"
        }`}
      />

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

  {/* FLEX CONTAINER: Text Left, Circle Right */}
  <div className="relative flex flex-col lg:flex-row items-start w-full max-w-6xl gap-8 mt-20 justify-between">
    {/* Left: Text */}
    <div className="flex-1 flex flex-col items-start lg:pr-8 -ml-27">
      {/* Hello, I'm */}
      <h3
        className={`text-3xl sm:text-4xl font-bold mb-0.5 transition-all duration-700 ${
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
        className="text-3xl sm:text-4xl font-bold text-white transition-all duration-700 delay-300 flex items-center"
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
  className={`flex-shrink-0 self-start -mt-35 -mr-23 transition-all duration-700 ease-out ${
    helloVisible
      ? "opacity-100 translate-x-0"
      : "opacity-0 translate-x-24"
  }`}
  style={{ transitionDelay: "0.7s" }}
>
  <Image
    src="/wenshe.png"
    alt="Wence portrait"
    width={600}
    height={600}
    priority
    className="
      object-contain
      grayscale
      drop-shadow-2xl
    "
  />
  

 
</div>

 {/* NEW LARGE GLASSMORPHISM BUTTONS OVER IMAGE */}
<div
  ref={buttonsRef}
  className="absolute -bottom-15 left-1/2 transform -translate-x-1/2 flex gap-3 z-10"
>

  {/* Button 1 as horizontal glass card */}
  <button 
    
    className={`w-[448px] h-[150px] relative rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg shadow-black/10 p-4 flex flex-col justify-start transition-all duration-700 hover:scale-105 hover:shadow-xl hover:shadow-white/20 ${
  buttonsVisible[0] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
}`}

    style={{ fontFamily: "Arial, sans-serif", animationDelay: "0.2s",}}
  >
    {/* Top row: Icon left, Number right */}
    <div className="flex justify-between items-start">
      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0099ff]">
        <Code className="w-6 h-6 text-white" />
      </div>

      {/* Number */}
      <div className="text-2xl font-bold">{3}</div>
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
    className={`w-[448px] h-[150px] relative rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg shadow-black/10 p-4 flex flex-col justify-start transition-all duration-700 hover:scale-105 hover:shadow-xl hover:shadow-white/20 ${
  buttonsVisible[1] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
}`}

    style={{ fontFamily: "Arial, sans-serif", animationDelay: "0.6s", transitionDelay: buttonsVisible[1] ? "0.6s" : "0s" }}
  >
    {/* Top row: Icon left, Number right */}
    <div className="flex justify-between items-start">
      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0099ff]">
        <Medal className="w-6 h-6 text-white" />
      </div>

      {/* Number */}
      <div className="text-2xl font-bold">{0}</div>
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
      className={`w-[448px] h-[150px] relative rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg shadow-black/10 p-4 flex flex-col justify-start transition-all duration-700 hover:scale-105 hover:shadow-xl hover:shadow-white/20 ${
  buttonsVisible[2] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
}`}
  style={{ fontFamily: "Arial, sans-serif", animationDelay: "0.8s", transitionDelay: buttonsVisible[2] ? "1s" : "0s" }}
  >
    {/* Top row: Icon left, Number right */}
    <div className="flex justify-between items-start">
      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0099ff]">
        <Globe className="w-6 h-6 text-white" />
      </div>

      {/* Number */}
      <div className="text-2xl font-bold">{2}</div>
    </div>

    {/* Bottom-left: Title + Description */}
    <div className="flex flex-col gap-0.5 mt-4">
      <span className="text-sm uppercase opacity-80 text-left">YEARS OF EXPERIENCE</span>
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

{/* ===== PORTFOLIO SHOWCASE SECTION ===== */}
<div
  ref={portfolioRef}
  className="relative flex flex-col items-center mt-50 transition-all duration-700 ease-out"
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
  className={`w-full max-w-7xl mx-auto -mt-1 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg shadow-black/10 p-2 lg:p-4 transition-all duration-700 ${
    showPortfolio ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
  }`}
  style={{ fontFamily: "Arial, sans-serif", transitionDelay: showPortfolio ? "0.4s" : "0s" }}
>
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
      className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      {(portfolioProjects[activeBox] || []).map((project, index) => (
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
                onClick={() => setShowModal(true)}
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
    </div>
  )}

  {showModal && (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onClick={() => setShowModal(false)}
  >
    <div
      className="relative w-11/12 max-w-7xl lg:max-w-8xl bg-black/20 backdrop-blur-3xl rounded-3xl p-8 flex flex-col justify-start transform transition-all duration-500"
      onClick={(e) => e.stopPropagation()}
      style={{
        background:
          "linear-gradient(135deg, rgba(0,0,0,0.4), rgba(255,255,255,0.12), rgba(0,153,255,0.12))",
      }}
    >
      {/* Main content */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="md:w-1/2 flex flex-col justify-center space-y-4">
          <h1
            style={{
              fontFamily: "'CreatoDisplay', sans-serif",
              fontWeight: "700",
              letterSpacing: "1.5px",
            }}
            className="text-3xl md:text-4xl text-white"
          >
            COMRADZ Sessions
          </h1>

          <div
            className="w-20 h-1 rounded-full"
            style={{
              background: "linear-gradient(to right, #0099ff, #00d4ff)",
              boxShadow: "0 0 8px #0099ff, 0 0 16px #00d4ff",
            }}
          ></div>

          <p className="text-white text-sm md:text-base max-w-[90%] opacity-80 text-justify leading-relaxed">
            A weekly poster designed to showcase the details of our Sunday dance sessions.
            Each poster highlights the schedule, theme, and key information for the day’s session,
            making it easy for participants to stay informed and join in. The design aims to be clear,
            engaging, and consistent, creating a recognizable visual identity for COMRADZ’s weekly gatherings.
        
          </p>
        </div>

        <div className="md:w-1/2 flex justify-center items-start">
          <img
            src="/comradz2.png"
            alt="COMRADZ Poster"
            className="max-h-60 md:max-h-72 object-contain rounded-lg"
          />
        </div>
      </div>

      {/* Glassmorphism Image Row */}
      <div
        className="mt-5 grid grid-cols-4 gap-4 p-3 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {[1, 2, 3, 4].map((num) => (
          <div
            key={num}
            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-cyan-500/40"
          >
            <img
              src={`/image${num}.png`}
              alt={`Gallery ${num}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-5 right-5 text-white text-lg font-bold hover:text-[#0099ff] transition-colors"
      >
        ✕
      </button>
    </div>
  </div>
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

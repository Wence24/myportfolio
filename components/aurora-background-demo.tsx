"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Mail, Play } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { cn } from "@/lib/utils";
import { defaultHomeContent, type HomeContent } from "@/lib/portfolio-data";

export type HeroProjectCard = {
  id: string;
  title: string;
  category: string;
  src: string;
  ctaLabel?: string;
  onClick?: () => void;
};

type AuroraBackgroundDemoProps = {
  isVisible?: boolean;
  onViewPortfolio: () => void;
  onShowreel?: () => void;
  onContact: () => void;
  projectCards?: HeroProjectCard[];
  homeContent?: HomeContent["hero"];
  motionLite?: boolean;
};

export default function AuroraBackgroundDemo({
  isVisible = true,
  onViewPortfolio,
  onShowreel,
  onContact,
  projectCards: _projectCards,
  homeContent,
  motionLite = false,
}: AuroraBackgroundDemoProps) {
  const [highlightActive, setHighlightActive] = useState(false);
  const [highlightComplete, setHighlightComplete] = useState(false);
  const [highlightCycle, setHighlightCycle] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const heroRef = useRef<HTMLDivElement>(null);
  const showreelAction = onShowreel ?? onViewPortfolio;
  const content = homeContent || defaultHomeContent.hero;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(rect.width * 0.5);
    mouseY.set(rect.height * 0.38);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(rect.width * 0.5);
    mouseY.set(rect.height * 0.38);
  }, [mouseX, mouseY]);

  useEffect(() => {
    let resetTimer: number | null = null;
    let showTimer: number | null = null;
    let hideTimer: number | null = null;
    let cancelled = false;

    const resetHighlight = () => {
      if (cancelled) return;
      setHighlightActive(false);
      setHighlightComplete(false);
    };

    if (!isVisible) {
      resetTimer = window.setTimeout(resetHighlight, 0);
      return () => {
        cancelled = true;
        if (resetTimer !== null) window.clearTimeout(resetTimer);
      };
    }

    const initialDelay = motionLite ? 2000 : 2500;
    const visibleDuration = 5000;

    resetTimer = window.setTimeout(resetHighlight, 0);
    showTimer = window.setTimeout(() => {
      if (cancelled) return;

      setHighlightCycle((currentCycle) => currentCycle + 1);
      setHighlightActive(true);
      setHighlightComplete(true);
      hideTimer = window.setTimeout(() => {
        if (cancelled) return;

        setHighlightActive(false);
      }, visibleDuration);
    }, initialDelay);

    return () => {
      cancelled = true;
      if (resetTimer !== null) window.clearTimeout(resetTimer);
      if (showTimer !== null) window.clearTimeout(showTimer);
      if (hideTimer !== null) window.clearTimeout(hideTimer);
    };
  }, [isVisible, motionLite]);

  return (
    <AuroraBackground
      className="min-h-[100vh] sm:min-h-[102vh] lg:min-h-[104vh]"
      showRadialGradient={false}
      motionLite={motionLite}
    >
      <div
        ref={heroRef}
        onMouseMove={motionLite ? undefined : handleMouseMove}
        onMouseLeave={motionLite ? undefined : handleMouseLeave}
        className="relative min-h-[100vh] flex flex-col sm:min-h-[102vh] lg:min-h-[104vh]"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <motion.div
            className="absolute inset-y-[-14%] left-[-14%] w-[138%]"
            style={{
              background:
                "radial-gradient(circle at 10% 18%, rgba(25, 91, 255, 0.96) 0%, rgba(25, 91, 255, 0.34) 16%, transparent 40%), radial-gradient(circle at 86% 62%, rgba(63, 176, 255, 0.78) 0%, rgba(63, 176, 255, 0.2) 18%, transparent 42%), radial-gradient(circle at 52% 18%, rgba(255, 255, 255, 0.08) 0%, transparent 11%), linear-gradient(135deg, #020611 0%, #050b17 44%, #040915 100%)",
              filter: motionLite ? "none" : "blur(2px)",
              willChange: motionLite ? "auto" : "transform",
            }}
            animate={
              motionLite
                ? {}
                : {
                    x: [0, -42, 0],
                    y: [0, 8, 0],
                    scale: [1, 1.045, 0.98, 1],
                  }
            }
            transition={{
              duration: 36,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-[-8%] opacity-[0.32] mix-blend-screen"
            style={{
              backgroundImage:
                "linear-gradient(rgba(76, 142, 255, 0.26) 1px, transparent 1px), linear-gradient(90deg, rgba(76, 142, 255, 0.26) 1px, transparent 1px), radial-gradient(circle at 16% 18%, rgba(107, 208, 255, 0.4), transparent 24%), radial-gradient(circle at 84% 66%, rgba(48, 104, 255, 0.42), transparent 24%), radial-gradient(circle at 50% 50%, rgba(6, 13, 28, 0.78) 0%, rgba(6, 13, 28, 0.2) 46%, transparent 76%)",
              backgroundSize: "18px 18px, 18px 18px, 100% 100%, 100% 100%, 100% 100%",
              filter: motionLite ? "none" : "saturate(1.18)",
            }}
            animate={
              motionLite
                ? {}
                : {
                    x: [0, -18, 0],
                    y: [0, 6, -4, 0],
                    scale: [0.99, 1.035, 0.98, 0.99],
                    opacity: [0.18, 0.3, 0.2, 0.18],
                  }
            }
            transition={{
              duration: 34,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div
            className="absolute inset-[-10%] opacity-[0.14] mix-blend-screen"
            style={{
              backgroundImage:
                "linear-gradient(rgba(122, 228, 255, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(27, 88, 255, 0.22) 1px, transparent 1px)",
              backgroundSize: "42px 42px, 42px 42px",
              maskImage:
                "radial-gradient(circle at 50% 50%, black 18%, rgba(0,0,0,0.88) 56%, transparent 88%)",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_26%),linear-gradient(180deg,rgba(3,7,13,0.22),rgba(3,7,13,0.42)_48%,rgba(3,7,13,0.72)_100%)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(circle_at_center,black,transparent_84%)]" />
        </div>

        {!motionLite && (
          <motion.div
            className="pointer-events-none absolute left-0 top-0 h-[14rem] w-[14rem] rounded-full opacity-35"
            style={{
              background: "radial-gradient(circle, rgba(95, 173, 255, 0.18) 0%, transparent 66%)",
              filter: "blur(14px)",
              x: springX,
              y: springY,
              translateX: "-50%",
              translateY: "-50%",
            }}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            motionLite
              ? "bg-[radial-gradient(circle_at_50%_18%,rgba(116,228,255,0.12),transparent_22%),radial-gradient(circle_at_20%_32%,rgba(82,169,255,0.07),transparent_18%),radial-gradient(circle_at_82%_28%,rgba(124,132,255,0.08),transparent_20%)]"
              : "bg-[radial-gradient(circle_at_50%_18%,rgba(116,228,255,0.16),transparent_24%),radial-gradient(circle_at_20%_32%,rgba(82,169,255,0.1),transparent_20%),radial-gradient(circle_at_82%_28%,rgba(124,132,255,0.12),transparent_22%)]"
          )}
        />

        <div className="relative z-10 mx-auto flex w-full max-w-[1560px] flex-1 items-center justify-center px-4 pb-20 pt-36 sm:px-6 sm:pt-40 lg:px-7 lg:pt-44">
          <motion.div
            initial={false}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: motionLite ? 0.4 : 0.7, ease: "easeOut" }}
            className="flex w-full max-w-[1100px] flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/72 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              {content.eyebrow}
            </div>

            <h1
              className="mt-7 max-w-[72rem] text-[clamp(4rem,7vw,6.4rem)] font-bold uppercase leading-[0.9] text-white"
              style={{
                fontFamily: "'CreatoDisplay', sans-serif",
                letterSpacing: "-0.04em",
              }}
            >
              <span className="block text-white">{content.line1}</span>
              <span className="mt-1 block text-white">{content.line2}</span>
              <span className="relative mt-1 inline-flex">
                <span
                  className={cn(
                    "block transition-colors duration-700 ease-out",
                    highlightComplete ? "text-[#60a5fa]" : "text-white"
                  )}
                >
                  {content.highlight}
                </span>
                <motion.span
                  className="pointer-events-none absolute inset-0"
                  initial={false}
                  animate={{ opacity: highlightActive ? 1 : 0 }}
                  transition={{
                    duration: highlightActive ? (motionLite ? 0.22 : 0.3) : (motionLite ? 0.4 : 0.52),
                    ease: "easeOut",
                  }}
                >
                  <PointerHighlight
                    key={highlightCycle}
                    rectangleClassName="border-[#3e8dff]/55 bg-[#2563eb]/14"
                    pointerClassName="text-[#60a5fa]"
                    containerClassName="inline-block"
                    delay={0}
                    duration={motionLite ? 0.48 : 0.64}
                  >
                    <motion.span
                      className="relative z-10 block text-[#60a5fa]"
                      initial={{ clipPath: "inset(0 100% 0 0)" }}
                      animate={{ clipPath: "inset(0 0 0 0)" }}
                      transition={{
                        duration: motionLite ? 0.42 : 0.68,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {content.highlight}
                    </motion.span>
                  </PointerHighlight>
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={false}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ duration: motionLite ? 0.38 : 0.62, delay: 0.18, ease: "easeOut" }}
              className="mt-14 max-w-[40rem] text-sm leading-7 text-white/78 sm:text-base lg:text-[1.05rem]"
            >
              {content.description}
            </motion.p>

            <motion.div
              initial={false}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: motionLite ? 0.4 : 0.62, delay: 0.24, ease: "easeOut" }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <button
                type="button"
                onClick={onViewPortfolio}
                className="group inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#76e1ff,#4a8fff)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#04111b] shadow-[0_18px_40px_rgba(84,184,255,0.26)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(84,184,255,0.34)]"
              >
                {content.primaryCta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={showreelAction}
                className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white/88 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-0.5 hover:border-[#89e5ff]/28 hover:bg-white/[0.08]"
              >
                <Play className="h-4 w-4 fill-current" />
                {content.secondaryCta}
              </button>
            </motion.div>

            <motion.div
              initial={false}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: motionLite ? 0.42 : 0.62, delay: 0.3, ease: "easeOut" }}
              className="mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-3"
            >
              {content.pills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/10 bg-black/18 px-4 py-2 text-xs text-white/78 backdrop-blur-md"
                >
                  {pill}
                </span>
              ))}
            </motion.div>

            <motion.button
              type="button"
              onClick={onContact}
              initial={false}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: motionLite ? 0.4 : 0.62, delay: 0.36, ease: "easeOut" }}
              className="mt-7 inline-flex items-center gap-2 text-sm text-white/82 transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4" />
              {content.contactCta}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}

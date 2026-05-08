"use client";

import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { cn } from "@/lib/utils";

type AuroraBackgroundDemoProps = {
  isVisible?: boolean;
  onViewPortfolio: () => void;
  onContact: () => void;
  motionLite?: boolean;
};

const heroRoles = [
  {
    title: "Video Editor",
    gradient: "from-[#97efff] via-[#67b8ff] to-[#8e82ff]",
  },
  {
    title: "Graphic Designer",
    gradient: "from-[#b7f6ff] via-[#72c4ff] to-[#6784ff]",
  },
  {
    title: "Website Developer",
    gradient: "from-[#9be8ff] via-[#5fa8ff] to-[#7287ff]",
  },
] as const;

const servicePills = [
  "Short-form and long-form editing",
  "Brand graphics and posters",
  "WordPress and portfolio websites",
] as const;

export default function AuroraBackgroundDemo({
  isVisible = true,
  onViewPortfolio,
  onContact,
  motionLite = false,
}: AuroraBackgroundDemoProps) {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const intervalId = window.setInterval(() => {
      setRoleIndex((currentIndex) => (currentIndex + 1) % heroRoles.length);
    }, motionLite ? 3600 : 2800);

    return () => window.clearInterval(intervalId);
  }, [isVisible, motionLite]);

  const activeRole = heroRoles[roleIndex];
  return (
    <AuroraBackground
      className="min-h-[100vh] sm:min-h-[102vh] lg:min-h-[104vh]"
      motionLite={motionLite}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          motionLite
            ? "bg-[radial-gradient(circle_at_50%_18%,rgba(116,228,255,0.12),transparent_22%),radial-gradient(circle_at_20%_32%,rgba(82,169,255,0.07),transparent_18%),radial-gradient(circle_at_82%_28%,rgba(124,132,255,0.08),transparent_20%)]"
            : "bg-[radial-gradient(circle_at_50%_18%,rgba(116,228,255,0.16),transparent_24%),radial-gradient(circle_at_20%_32%,rgba(82,169,255,0.1),transparent_20%),radial-gradient(circle_at_82%_28%,rgba(124,132,255,0.12),transparent_22%)]"
        )}
      />
      {!motionLite && (
        <>
          <div className="pointer-events-none absolute left-[12%] top-[18%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(118,233,255,0.24)_0%,transparent_72%)] blur-3xl" />
          <div className="pointer-events-none absolute right-[10%] top-[22%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(116,126,255,0.18)_0%,transparent_74%)] blur-3xl" />
          <div className="pointer-events-none absolute inset-x-[-4%] bottom-[-6rem] h-[28rem] bg-[linear-gradient(180deg,rgba(7,12,18,0)_0%,rgba(7,12,18,0.06)_18%,rgba(9,16,25,0.15)_38%,rgba(28,64,95,0.16)_58%,rgba(8,13,20,0.1)_78%,rgba(9,14,21,0)_100%)] blur-3xl" />
          <div className="pointer-events-none absolute inset-x-[5%] bottom-[-5.5rem] h-52 bg-[radial-gradient(ellipse_at_center,rgba(70,145,192,0.16)_0%,rgba(70,145,192,0.08)_32%,rgba(10,18,28,0.1)_56%,transparent_82%)] blur-[56px] opacity-100" />
        </>
      )}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-[14%] bottom-[8%] h-[3px] rounded-full bg-[linear-gradient(90deg,rgba(100,120,255,0),rgba(84,184,255,0.3),rgba(132,240,255,0.5),rgba(84,184,255,0.3),rgba(100,120,255,0))]",
          motionLite
            ? "opacity-24 shadow-[0_0_12px_rgba(84,184,255,0.08)]"
            : "opacity-34 shadow-[0_0_18px_rgba(84,184,255,0.12)]"
        )}
      />

      <motion.div
        initial={false}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
        transition={{ duration: motionLite ? 0.46 : 0.76, ease: "easeOut" }}
        className="relative flex min-h-[100vh] flex-col items-center justify-start px-5 pt-[8vh] pb-16 text-center sm:min-h-[102vh] sm:px-8 sm:pt-[9vh] sm:pb-20 lg:min-h-[104vh] lg:px-12 lg:pt-[10vh] lg:pb-24"
      >
        <motion.div
          initial={false}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: motionLite ? 0.34 : 0.56, delay: 0.1, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c8f3ff]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Creative services
        </motion.div>

        <h1
          className="mx-auto mt-6 max-w-6xl text-4xl font-bold leading-[0.94] text-white sm:text-[3.6rem] lg:text-[6.8rem]"
          style={{
            fontFamily: "'CreatoDisplay', sans-serif",
            letterSpacing: "-0.04em",
          }}
        >
          <span className="block text-white/88">Need a</span>
          <span className="relative mt-3 block min-h-[1.15em]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeRole.title}
                initial={{
                  opacity: 0,
                  y: motionLite ? 10 : 18,
                  scale: motionLite ? 0.99 : 0.985,
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: motionLite ? -10 : -18,
                  scale: motionLite ? 0.99 : 0.985,
                }}
                transition={{ duration: motionLite ? 0.26 : 0.38, ease: "easeInOut" }}
                className={cn(
                  "block bg-gradient-to-r bg-clip-text text-transparent",
                  activeRole.gradient
                )}
              >
                {activeRole.title}
              </motion.span>
            </AnimatePresence>
            <span className="absolute left-1/2 top-full mt-4 h-[4px] w-24 -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,#6677ff_0%,#54b8ff_55%,#7ef0ff_100%)] shadow-[0_0_18px_rgba(84,184,255,0.44)]" />
          </span>
        </h1>

        <motion.p
          initial={false}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: motionLite ? 0.38 : 0.62, delay: 0.18, ease: "easeOut" }}
          className="mx-auto mt-10 max-w-3xl text-sm leading-7 text-white/68 sm:text-base lg:text-[1.08rem]"
        >
          Clean edits, stronger visuals, and modern WordPress-style website builds for
          creators, businesses, and brands that want something polished right away.
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
            className="group inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#76e1ff,#4a8fff)] px-6 py-3 text-sm font-semibold text-[#04111b] shadow-[0_18px_40px_rgba(84,184,255,0.26)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(84,184,255,0.34)]"
          >
            View portfolio
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={onContact}
            className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/88 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-0.5 hover:border-[#89e5ff]/28 hover:bg-white/[0.08]"
          >
            <Mail className="h-4 w-4" />
            Start a project
          </button>
        </motion.div>

        <motion.div
          initial={false}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: motionLite ? 0.42 : 0.62, delay: 0.3, ease: "easeOut" }}
          className="mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3"
        >
          {servicePills.map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-white/10 bg-black/18 px-4 py-2 text-xs text-white/62 backdrop-blur-md"
            >
              {pill}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </AuroraBackground>
  );
}

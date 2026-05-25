"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { ArrowUp, ArrowUpRight, Eye } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  --pill-bg-1: color-mix(in oklch, var(--foreground) 3%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--background) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--foreground) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--background) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-1-hover: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 2%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--background) 70%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-side-glow {
  0%, 100% { opacity: 0.34; transform: translateY(0) scale(1); }
  50% { opacity: 0.58; transform: translateY(-3%) scale(1.08); }
}

@keyframes footer-grain-drift {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-18px, 12px, 0); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in oklch, var(--primary) 11%, transparent) 0%,
    color-mix(in oklch, var(--secondary) 10%, transparent) 40%,
    transparent 70%
  );
}

.footer-side-glow {
  background:
    radial-gradient(ellipse at center, rgba(43, 145, 255, 0.3) 0%, rgba(36, 210, 255, 0.12) 32%, transparent 70%),
    radial-gradient(ellipse at center, rgba(99, 107, 255, 0.18) 0%, transparent 64%);
  animation: footer-side-glow 9s ease-in-out infinite;
  filter: blur(18px);
}

.footer-side-glow-right {
  animation-delay: -4s;
}

.footer-grain-overlay {
  background-image:
    radial-gradient(circle at 22% 18%, rgba(143, 220, 255, 0.1), transparent 20%),
    radial-gradient(circle at 78% 24%, rgba(47, 125, 255, 0.11), transparent 22%),
    repeating-radial-gradient(circle at 25% 25%, rgba(255,255,255,0.09) 0 1px, transparent 1px 4px);
  mix-blend-mode: screen;
  opacity: 0.13;
  animation: footer-grain-drift 1.8s steps(2) infinite alternate;
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
    0 10px 30px -10px var(--pill-shadow),
    inset 0 1px 1px var(--pill-highlight),
    inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
    0 20px 40px -10px var(--pill-shadow-hover),
    inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--foreground);
}

.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  opacity: 0.48;
  -webkit-text-stroke: 1px rgba(143, 220, 255, 0.1);
  background: linear-gradient(180deg, rgba(143, 220, 255, 0.16) 0%, transparent 62%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer-text-glow {
  background: linear-gradient(180deg, #d8f6ff 0%, #8fdcff 42%, #3e8dff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px rgba(62, 141, 255, 0.18));
}

@media (max-width: 900px), (prefers-reduced-motion: reduce) {
  .animate-footer-breathe,
  .footer-side-glow,
  .footer-grain-overlay {
    animation: none !important;
  }

  .footer-aurora,
  .footer-side-glow {
    filter: none !important;
    opacity: 0.18 !important;
  }

  .footer-glass-pill {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
`;

export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;
      const canUseMagnet =
        window.matchMedia("(pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!canUseMagnet) return;

      const ctx = gsap.context(() => {
        let frameId: number | null = null;
        let latestEvent: MouseEvent | null = null;

        const animateToPointer = () => {
          frameId = null;
          if (!latestEvent) return;

          const rect = element.getBoundingClientRect();
          const x = latestEvent.clientX - rect.left - rect.width / 2;
          const y = latestEvent.clientY - rect.top - rect.height / 2;

          gsap.to(element, {
            x: x * 0.12,
            y: y * 0.12,
            rotationX: -y * 0.08,
            rotationY: x * 0.08,
            scale: 1.02,
            ease: "power2.out",
            duration: 0.24,
            overwrite: "auto",
          });
        };

        const handleMouseMove = (e: MouseEvent) => {
          latestEvent = e;
          if (frameId === null) {
            frameId = window.requestAnimationFrame(animateToPointer);
          }
        };

        const handleMouseLeave = () => {
          latestEvent = null;
          if (frameId !== null) {
            window.cancelAnimationFrame(frameId);
            frameId = null;
          }
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          if (frameId !== null) {
            window.cancelAnimationFrame(frameId);
          }
          element.removeEventListener("mousemove", handleMouseMove);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) {
            (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
          }
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

const MarqueeItem = () => (
  <div className="flex items-center space-x-10 px-6">
    <span>Video Editing</span>
    <span className="text-primary/60">*</span>
    <span>Graphic Design</span>
    <span className="text-secondary/60">*</span>
    <span>Website Builds</span>
    <span className="text-primary/60">*</span>
    <span>Brand Visuals</span>
    <span className="text-secondary/60">*</span>
    <span>Fast Turnaround</span>
  </div>
);

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) return;
    const shouldUseStaticFooter =
      window.matchMedia("(max-width: 900px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

    if (shouldUseStaticFooter) {
      gsap.set(giantTextRef.current, { y: 0, scale: 1, opacity: 0.24 });
      gsap.set([headingRef.current, linksRef.current], { y: 0, scale: 1, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 0.34,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 48, scale: 0.96, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    {
      label: "Instagram",
      detail: "@editwithwens",
      href: "https://www.instagram.com/editwithwens",
      icon: FaInstagram,
      iconClassName: "text-[#E4405F]",
    },
    {
      label: "TikTok",
      detail: "@editwithwens",
      href: "https://www.tiktok.com/@editwithwens",
      icon: FaTiktok,
      iconClassName: "text-white drop-shadow-[2px_0_0_#FE2C55] [filter:drop-shadow(-2px_0_0_#25F4EE)]",
    },
    {
      label: "Facebook",
      detail: "wence.dante.de.vera.2024",
      href: "https://www.facebook.com/wence.dante.de.vera.2024",
      icon: FaFacebookF,
      iconClassName: "text-[#1877F2]",
    },
  ] as const;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        ref={wrapperRef}
        className="relative h-screen w-full cinematic-footer-wrapper"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-black text-foreground">
          <div className="footer-aurora pointer-events-none absolute left-1/2 top-1/2 z-0 h-[52vh] w-[74vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[56px]" />
          <div className="footer-side-glow pointer-events-none absolute -left-[18vw] top-[8vh] z-0 h-[86vh] w-[42vw] rounded-full" />
          <div className="footer-side-glow footer-side-glow-right pointer-events-none absolute -right-[18vw] top-[2vh] z-0 h-[92vh] w-[42vw] rounded-full" />
          <div className="footer-bg-grid pointer-events-none absolute inset-0 z-0" />
          <div className="footer-grain-overlay pointer-events-none absolute inset-[-24px] z-0" />

          <div
            ref={giantTextRef}
            className="footer-giant-bg-text pointer-events-none absolute -bottom-[5vh] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap"
          >
            WENCE
          </div>

          <div className="absolute left-0 top-12 z-10 w-full overflow-hidden border-y border-border/50 bg-background/60 py-4 shadow-2xl backdrop-blur-md">
            <div className="flex w-max animate-footer-scroll-marquee text-xs font-bold uppercase tracking-[0.3em] text-[#8fdcff]/72 md:text-sm">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-20 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6">
            <h2
              ref={headingRef}
              className="footer-text-glow mb-5 text-center text-5xl font-black tracking-tighter md:text-8xl"
            >
              Ready to work together?
            </h2>
            <p className="mb-10 max-w-2xl text-center text-sm leading-relaxed text-[#8fdcff]/68 md:text-base">
              View the work, book a call, or reach me through the platforms below.
            </p>

            <div ref={linksRef} className="flex w-full flex-col items-center gap-6">
              <div className="flex w-full flex-wrap justify-center gap-4">
                <MagneticButton
                  as="a"
                  href="/portfolio/video-editing"
                  className="footer-glass-pill group flex items-center gap-3 rounded-full px-10 py-5 text-sm font-bold text-[#8fdcff] md:text-base"
                >
                  <Eye className="h-6 w-6 text-[#8fdcff]/78 transition-colors group-hover:text-[#d8f6ff]" />
                  View Portfolio
                </MagneticButton>

                <MagneticButton
                  as="a"
                  href="/contact"
                  className="group inline-flex items-center gap-3 rounded-full bg-[linear-gradient(135deg,#2f7dff,#56b8ff)] px-10 py-5 text-sm font-bold text-white shadow-[0_18px_40px_rgba(47,125,255,0.34)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(47,125,255,0.42)] md:text-base"
                >
                  <ArrowUpRight className="h-5 w-5" />
                  Book a Call
                </MagneticButton>
              </div>

              <div className="mt-2 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <MagneticButton
                      key={item.label}
                      as="a"
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="footer-glass-pill group relative flex min-h-[72px] items-center gap-3 overflow-hidden rounded-[1.35rem] px-3 py-3 text-left text-white hover:text-white sm:min-h-[78px] sm:gap-4 sm:rounded-[1.55rem] sm:px-4"
                    >
                      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(143,220,255,0.12),transparent_40%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/18 bg-white/[0.07] transition-colors duration-300 group-hover:border-white/32 group-hover:bg-white/[0.12] sm:h-11 sm:w-11 sm:rounded-2xl">
                        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", item.iconClassName)} />
                      </span>
                      <span className="relative min-w-0">
                        <span className="block truncate text-xs font-bold leading-none text-inherit sm:text-sm">
                          {item.label}
                        </span>
                        <span className="mt-1.5 block truncate text-[8px] font-semibold uppercase tracking-[0.13em] text-white/58 sm:mt-2 sm:text-[10px] sm:tracking-[0.16em]">
                          {item.detail}
                        </span>
                      </span>
                    </MagneticButton>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative z-20 flex w-full flex-col items-center justify-between gap-6 px-6 pb-8 md:flex-row md:px-12">
            <div className="order-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:order-1 md:text-xs">
              © 2026 Wence Dante De Vera. All rights reserved.
            </div>

            <MagneticButton
              as="button"
              onClick={scrollToTop}
              className="footer-glass-pill group order-1 flex h-12 w-12 items-center justify-center rounded-full text-[#8fdcff]/72 hover:text-[#d8f6ff] md:order-3"
            >
              <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1.5" />
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  );
}

export function HomeScrollRevealSection() {
  return (
    <div className="section-side-glow relative w-full overflow-x-hidden bg-black selection:bg-white/20">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes home-reveal-pulse {
              0%, 100% { opacity: 0.25; transform: scale(0.82); }
              50% { opacity: 0.72; transform: scale(1); }
            }
            @keyframes home-reveal-line {
              0%, 100% { opacity: 0.22; transform: scaleY(0.76); }
              50% { opacity: 0.58; transform: scaleY(1); }
            }
          `,
        }}
      />
      <main className="relative z-10 flex min-h-[24vh] w-full flex-col items-center justify-center bg-black/70 px-4 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(143,220,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(143,220,255,0.05)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="relative flex flex-col items-center">
          <div
            className="h-14 w-14 rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(143,220,255,0.12)_0%,rgba(143,220,255,0.02)_48%,transparent_72%)] sm:h-16 sm:w-16"
            style={{ animation: "home-reveal-pulse 2.6s ease-in-out infinite" }}
          />
          <div
            className="mt-5 h-14 w-px bg-gradient-to-b from-[#8fdcff]/80 to-transparent sm:h-16"
            style={{ animation: "home-reveal-line 2.6s ease-in-out infinite" }}
          />
        </div>
      </main>

      <CinematicFooter />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

const MANILA_TIME_ZONE = "Asia/Manila";

const formatManilaTimeLabel = (date = new Date()) =>
  `PHT ${new Intl.DateTimeFormat("en-US", {
    timeZone: MANILA_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date)}`;

type SiteHeaderProps = {
  activeSection?: string;
  onLogoClick?: () => void;
  onWork?: () => void;
  onLab?: () => void;
  onContact?: () => void;
};

export function SiteHeader({
  activeSection = "portfolio",
  onLogoClick,
  onWork,
  onLab,
  onContact,
}: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [manilaTimeLabel, setManilaTimeLabel] = useState(() => formatManilaTimeLabel());
  const routeActiveSection = pathname.startsWith("/portfolio/web-development")
    ? "lab"
    : pathname.startsWith("/portfolio/video-editing") ||
        pathname.startsWith("/portfolio/graphic-design")
      ? "portfolio"
      : pathname.startsWith("/contact")
        ? "contact"
        : "";
  const normalizedActiveSection = routeActiveSection || activeSection.toLowerCase();
  const isBrandActive =
    pathname === "/" &&
    (normalizedActiveSection === "home" || normalizedActiveSection === "about");

  useEffect(() => {
    if (typeof window === "undefined") return;

    let frameId: number | null = null;
    const updateNavScrollState = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        const nextValue = window.scrollY > 24;
        setIsNavScrolled((currentValue) =>
          currentValue === nextValue ? currentValue : nextValue
        );
      });
    };

    updateNavScrollState();
    window.addEventListener("scroll", updateNavScrollState, { passive: true });

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", updateNavScrollState);
    };
  }, []);

  useEffect(() => {
    const updateTime = () => setManilaTimeLabel(formatManilaTimeLabel());

    updateTime();
    const timeTimer = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(timeTimer);
  }, []);

  const navList = (
    <ul
      className={`flex w-full items-center justify-between transition-[gap] duration-300 ease-out sm:justify-center ${
        isNavScrolled ? "gap-3 sm:gap-4 lg:gap-5" : "gap-4 sm:gap-5 lg:gap-7"
      }`}
    >
      {[
        {
          name: "Work",
          activeKey: "portfolio",
          action: onWork || (() => router.push("/portfolio/video-editing")),
        },
        {
          name: "Lab",
          activeKey: "lab",
          action: onLab || (() => router.push("/portfolio/web-development")),
        },
        {
          name: "Contact",
          activeKey: "contact",
          action: onContact || (() => router.push("/contact")),
        },
      ].map((item) => {
        const isActive = normalizedActiveSection === item.activeKey;

        return (
          <li key={item.name}>
            <button
              type="button"
              onClick={item.action}
              className={`group relative inline-flex items-center justify-center overflow-hidden py-2 text-[10.5px] font-medium uppercase tracking-[0.22em] transition-colors duration-200 ease-out ${
                isActive ? "text-white" : "text-white/62 hover:text-white"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span>{item.name}</span>
              <span
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,rgba(96,214,255,0),rgba(96,214,255,0.82),rgba(96,214,255,0))] transition-opacity duration-180 ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-80"
                }`}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="fixed left-0 right-0 top-0 z-50 px-2 pt-3 sm:px-4 lg:px-5">
      <nav
        className={`relative mx-auto w-full transform-gpu origin-top overflow-hidden font-semibold tracking-[0.02em] transition-[max-width,transform,padding,border-color,background-color,box-shadow,border-radius,backdrop-filter] duration-320 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          isNavScrolled
            ? "max-w-[880px] rounded-[26px] border border-white/14 bg-black/48 px-4 py-3 shadow-[0_18px_44px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl lg:rounded-full lg:px-5 lg:py-3.5 lg:scale-[0.94]"
            : "max-w-[1520px] rounded-none border border-transparent bg-transparent px-2 py-3 shadow-none backdrop-blur-none"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] transition-opacity duration-240 ${
            isNavScrolled ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025)_48%,rgba(143,220,255,0.045))]" />
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent" />
          <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-black/70 to-transparent" />
        </div>

        <div
          className={`relative flex items-center justify-between transition-[gap] duration-300 ease-out lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] ${
            isNavScrolled ? "gap-4 lg:gap-5" : "gap-6 lg:gap-10"
          }`}
        >
          <button
            type="button"
            onClick={onLogoClick || (() => router.push("/"))}
            className={`group relative inline-flex shrink-0 overflow-hidden py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.24em] transition-colors duration-200 hover:text-white ${
              isBrandActive ? "text-white" : "text-white/88"
            }`}
            aria-label="Portfolio logo"
            aria-current={isBrandActive ? "page" : undefined}
          >
            <span>Wence Dante De Vera</span>
          </button>

          <div
            className={`hidden min-w-0 lg:flex lg:items-center lg:justify-center ${
              isNavScrolled
                ? "lg:static lg:translate-x-0 lg:translate-y-0"
                : "lg:absolute lg:left-1/2 lg:top-1/2 lg:w-[430px] lg:-translate-x-1/2 lg:-translate-y-1/2"
            }`}
          >
            <div className="w-full max-w-[760px]">{navList}</div>
          </div>

          <div className="hidden items-center justify-end gap-3 xl:flex">
            <div
              className={`group/timechip relative shrink-0 transform-gpu overflow-hidden rounded-full text-white/82 transition-[width,padding,opacity,transform,border-color,background-color,box-shadow,backdrop-filter] duration-200 ease-out ${
                isNavScrolled
                  ? "w-[178px] border border-white/10 bg-black/28 px-3 py-2 opacity-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
                  : "w-[214px] border border-transparent bg-transparent px-4 py-2.5 opacity-100 shadow-none backdrop-blur-none"
              }`}
              aria-live="polite"
            >
              <div className="relative flex w-full items-center justify-center whitespace-nowrap text-[11px] font-medium tracking-[0.04em]">
                <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 animate-pulse rounded-full bg-[#5dff8f] shadow-[0_0_14px_rgba(93,255,143,0.8)]" />
                <span className="relative block h-[1.15rem] w-full overflow-hidden pl-4 text-center">
                  {isNavScrolled ? (
                    <>
                      <span className="block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/timechip:-translate-y-full">
                        {manilaTimeLabel}
                      </span>
                      <span className="absolute left-4 right-0 top-full block text-[#c8f3ff] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/timechip:-translate-y-full">
                        Davao, Philippines
                      </span>
                    </>
                  ) : (
                    <span className="block">
                      Davao {String.fromCharCode(8226)} {manilaTimeLabel}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={
                onContact ||
                (() => {
                  router.push("/contact");
                })
              }
              className={`group inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2f7dff,#56b8ff)] text-white shadow-[0_16px_36px_rgba(47,125,255,0.34)] transition-[padding,font-size,letter-spacing,transform,box-shadow] duration-300 ease-out hover:-translate-y-[1px] hover:shadow-[0_20px_40px_rgba(47,125,255,0.42)] ${
                isNavScrolled
                  ? "px-3.5 py-2 text-[10px] tracking-[0.18em]"
                  : "px-4 py-2.5 text-[11px] tracking-[0.22em]"
              }`}
            >
              Book a call
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-[1px] group-hover:translate-x-[1px]" />
            </button>
          </div>
        </div>

        <div
          className={`relative mt-2 border-t pt-2 transition-colors duration-200 lg:hidden ${
            isNavScrolled ? "border-white/10" : "border-white/0"
          }`}
        >
          {navList}
        </div>
      </nav>
    </div>
  );
}

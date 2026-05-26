"use client";

import { useEffect } from "react";

const shouldUseMotionLite = () => {
  if (typeof window === "undefined") return false;

  const navigatorWithHints = window.navigator as Navigator & {
    deviceMemory?: number;
    connection?: {
      saveData?: boolean;
    };
  };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cpuCores = window.navigator.hardwareConcurrency;
  const deviceMemory = navigatorWithHints.deviceMemory;
  const isSmallScreen = window.innerWidth <= 1024;

  return (
    reducedMotion ||
    navigatorWithHints.connection?.saveData === true ||
    (typeof cpuCores === "number" && cpuCores <= 4) ||
    (typeof deviceMemory === "number" && deviceMemory <= 4) ||
    (isSmallScreen &&
      ((typeof cpuCores === "number" && cpuCores <= 8) ||
        (typeof deviceMemory === "number" && deviceMemory <= 6)))
  );
};

export function MotionMode() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyMotionMode = () => {
      const nextMotionLite = shouldUseMotionLite();
      document.documentElement.classList.toggle("motion-lite", nextMotionLite);
      document.body.classList.toggle("motion-lite", nextMotionLite);
    };

    applyMotionMode();
    window.addEventListener("resize", applyMotionMode, { passive: true });

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", applyMotionMode);
      return () => {
        mediaQuery.removeEventListener("change", applyMotionMode);
        window.removeEventListener("resize", applyMotionMode);
      };
    }

    mediaQuery.addListener(applyMotionMode);
    return () => {
      mediaQuery.removeListener(applyMotionMode);
      window.removeEventListener("resize", applyMotionMode);
    };
  }, []);

  return null;
}

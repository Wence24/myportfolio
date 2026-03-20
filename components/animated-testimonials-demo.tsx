"use client";

import { useEffect, useState } from "react";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import {
  TESTIMONIALS_STORAGE_KEY,
  TESTIMONIALS_UPDATED_EVENT,
  defaultTestimonials,
  fetchPortfolioContentFromSupabase,
  normalizeTestimonials,
  type Testimonial,
} from "@/lib/portfolio-data";

export default function AnimatedTestimonialsDemo() {
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(defaultTestimonials);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const syncTestimonialsFromLocalStorage = () => {
      try {
        const raw = window.localStorage.getItem(TESTIMONIALS_STORAGE_KEY);
        if (!raw) {
          window.localStorage.setItem(
            TESTIMONIALS_STORAGE_KEY,
            JSON.stringify(defaultTestimonials)
          );
          setTestimonials(defaultTestimonials);
          return;
        }

        const parsed = JSON.parse(raw);
        setTestimonials(normalizeTestimonials(parsed));
      } catch {
        setTestimonials(defaultTestimonials);
      }
    };

    const syncTestimonialsFromSupabase = async () => {
      const remoteContent = await fetchPortfolioContentFromSupabase();
      if (!remoteContent || cancelled) return;

      const normalized = normalizeTestimonials(remoteContent.testimonials);
      setTestimonials(normalized);

      window.localStorage.setItem(
        TESTIMONIALS_STORAGE_KEY,
        JSON.stringify(normalized)
      );
      window.dispatchEvent(new Event(TESTIMONIALS_UPDATED_EVENT));
    };

    syncTestimonialsFromLocalStorage();
    void syncTestimonialsFromSupabase();

    window.addEventListener("storage", syncTestimonialsFromLocalStorage);
    window.addEventListener(
      TESTIMONIALS_UPDATED_EVENT,
      syncTestimonialsFromLocalStorage as EventListener
    );

    return () => {
      cancelled = true;
      window.removeEventListener("storage", syncTestimonialsFromLocalStorage);
      window.removeEventListener(
        TESTIMONIALS_UPDATED_EVENT,
        syncTestimonialsFromLocalStorage as EventListener
      );
    };
  }, []);

  return <AnimatedTestimonials testimonials={testimonials} />;
}

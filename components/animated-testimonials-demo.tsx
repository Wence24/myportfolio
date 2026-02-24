"use client";

import { useEffect, useState } from "react";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

const TESTIMONIALS_STORAGE_KEY = "portfolio-testimonials-v1";
const TESTIMONIALS_UPDATED_EVENT = "portfolio-testimonials-updated";

const defaultTestimonials: Testimonial[] = [
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

function normalizeTestimonials(value: unknown): Testimonial[] {
  if (!Array.isArray(value)) {
    return defaultTestimonials;
  }

  const normalized = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
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

  return normalized.length > 0 ? normalized : defaultTestimonials;
}

export default function AnimatedTestimonialsDemo() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncTestimonials = () => {
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

    syncTestimonials();
    window.addEventListener("storage", syncTestimonials);
    window.addEventListener(
      TESTIMONIALS_UPDATED_EVENT,
      syncTestimonials as EventListener
    );

    return () => {
      window.removeEventListener("storage", syncTestimonials);
      window.removeEventListener(
        TESTIMONIALS_UPDATED_EVENT,
        syncTestimonials as EventListener
      );
    };
  }, []);

  return <AnimatedTestimonials testimonials={testimonials} />;
}

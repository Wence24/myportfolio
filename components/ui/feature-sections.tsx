"use client";

/* eslint-disable @next/next/no-img-element */

import { cn } from "@/lib/utils";

export interface FeatureSectionItem {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
}

interface FeatureSectionsProps {
  title?: string;
  description?: string;
  features?: FeatureSectionItem[];
  className?: string;
}

const defaultFeatures: FeatureSectionItem[] = [
  {
    title: "Feedback analyser",
    description: "Get instant insights with focused dashboards and clear visual direction.",
    imageSrc:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Analytics dashboard on a screen",
  },
  {
    title: "User management",
    description: "Organize the details that keep every project moving cleanly.",
    imageSrc:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Team planning around a laptop",
  },
  {
    title: "Better invoicing",
    description: "Turn rough ideas into a polished final handoff with fewer loose ends.",
    imageSrc:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Organized desk with financial paperwork",
  },
];

export default function Example({
  title = "Powerful Features",
  description = "Everything you need to manage, track, and grow your work with clarity.",
  features = defaultFeatures,
  className,
}: FeatureSectionsProps) {
  return (
    <section
      className={cn("w-full py-16", className)}
      style={{
        fontFamily:
          'Poppins, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-white/54">{description}</p>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-10">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="max-w-80 transition duration-300 hover:-translate-y-0.5"
          >
            <div className="overflow-hidden rounded-xl border border-[#8fdcff]/16 bg-black/20 shadow-[0_0_28px_rgba(84,184,255,0.12)]">
              <img
                className="aspect-[4/3] w-full object-cover"
                src={feature.imageSrc}
                alt={feature.imageAlt || feature.title}
              />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">{feature.title}</h3>
            <p className="mt-1 text-sm leading-6 text-white/60">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { MoveRight, Star } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BlogPost {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  href: string;
  views: number;
  readTime?: number;
  rating?: number;
  className?: string;
}

interface GridSectionProps {
  title: string;
  description: string;
  backgroundLabel?: string;
  backgroundPosition?: "left" | "right";
  posts?: BlogPost[];
  className?: string;
  onPostClick?: (post: BlogPost) => void;
}

export const Component = ({
  title,
  description,
  backgroundLabel,
  backgroundPosition = "left",
  posts = [],
  className,
  onPostClick,
}: GridSectionProps) => {
  return (
    <section className={cn("container relative isolate mx-auto my-20 px-4 py-10", className)}>
      <h1 className="mb-2 text-center text-4xl font-semibold capitalize !leading-[1.4] text-white md:text-5xl lg:text-6xl">
        {title}
      </h1>

      {backgroundLabel ? (
        <span
          className={cn(
            "pointer-events-none absolute -top-10 -z-10 select-none text-[180px] font-extrabold leading-[1] text-white/[0.035] md:text-[250px] lg:text-[400px]",
            backgroundPosition === "left" ? "-left-[18%]" : "-right-[28%]"
          )}
        >
          {backgroundLabel}
        </span>
      ) : null}

      <p className="mx-auto mb-8 max-w-[800px] text-center text-xl !leading-[2] text-white/54 md:text-2xl">
        {description}
      </p>

      <div className="grid h-auto grid-cols-1 gap-5 md:h-[650px] md:grid-cols-2 lg:grid-cols-[1fr_0.5fr]">
        {posts.map((post, index) => {
          const {
            id,
            title: postTitle,
            category,
            imageUrl,
            views,
            readTime,
            rating = 4,
            className: postClassName,
          } = post;
          const isPrimary = index === 0;

          return (
            <div
              key={id || index}
              style={{ backgroundImage: `url(${imageUrl})` }}
              className={cn(
                "group relative row-span-1 flex size-full cursor-pointer flex-col justify-end overflow-hidden rounded-[20px] bg-cover bg-center bg-no-repeat p-5 text-white transition-all duration-300 hover:scale-[0.98] hover:rotate-[0.3deg] max-md:h-[300px]",
                isPrimary && "col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-1",
                postClassName
              )}
              onClick={() => onPostClick?.(post)}
            >
              <div className="absolute inset-0 -z-0 h-[130%] w-full bg-gradient-to-t from-black/80 to-transparent transition-all duration-500 group-hover:h-full" />

              <article className="relative z-0 flex items-end">
                <div className="flex flex-1 flex-col gap-3">
                  <h1 className="text-3xl font-semibold md:text-4xl">{postTitle}</h1>
                  <div className="flex flex-col gap-3">
                    <span className="w-fit rounded-md bg-white/40 px-2 py-px text-base capitalize text-white backdrop-blur-md">
                      {category}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            width={20}
                            height={20}
                            key={idx}
                            stroke={idx < rating ? "#ffa534" : "#B9B8B8aa"}
                            fill={idx < rating ? "#ffa534" : "#B9B8B8aa"}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-thin">({views} Views)</span>
                    </div>
                    {readTime ? (
                      <div className="text-xl font-semibold">{readTime} min read</div>
                    ) : null}
                  </div>
                </div>
                <MoveRight
                  className="transition-all duration-300 group-hover:translate-x-2"
                  color="white"
                  width={40}
                  height={40}
                  strokeWidth={1.25}
                />
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
};

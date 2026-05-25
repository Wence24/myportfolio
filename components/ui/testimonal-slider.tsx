"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Transition } from "@headlessui/react";
import { cn } from "@/lib/utils";

interface Testimonial {
  img: string;
  quote: string;
  name: string;
  role: string;
}

export const Component = ({
  testimonials,
  className,
}: {
  testimonials: Testimonial[];
  className?: string;
}) => {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [autorotate, setAutorotate] = useState(true);
  const autorotateTiming = 7000;

  useEffect(() => {
    if (!autorotate || testimonials.length <= 1) return;

    const interval = window.setInterval(() => {
      setDirection("right");
      setActive((currentActive) =>
        currentActive + 1 === testimonials.length ? 0 : currentActive + 1
      );
    }, autorotateTiming);

    return () => window.clearInterval(interval);
  }, [autorotate, testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  const enterFromClass =
    direction === "left" ? "opacity-0 -translate-x-8" : "opacity-0 translate-x-8";
  const leaveToClass =
    direction === "left" ? "opacity-0 translate-x-8" : "opacity-0 -translate-x-8";
  const imageEnterFromClass =
    direction === "left" ? "opacity-0 -rotate-[60deg]" : "opacity-0 rotate-[60deg]";
  const imageLeaveToClass =
    direction === "left" ? "opacity-0 rotate-[60deg]" : "opacity-0 -rotate-[60deg]";

  return (
    <div className={cn("mx-auto w-full max-w-6xl text-center", className)}>
      <div className="relative h-52 sm:h-60">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-gradient-to-b before:from-[#2b91ff]/28 before:via-[#2b91ff]/6 before:via-25% before:to-[#2b91ff]/0 before:to-75%">
          <div className="h-52 sm:h-60 [mask-image:_linear-gradient(0deg,transparent,theme(colors.white)_20%,theme(colors.white))]">
            {testimonials.map((testimonial, index) => (
              <Transition
                as="div"
                key={`${testimonial.name}-${index}`}
                show={active === index}
                className="absolute inset-0 -z-10 h-full"
                enter="transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] duration-700 order-first"
                enterFrom={imageEnterFromClass}
                enterTo="opacity-100 rotate-0"
                leave="transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] duration-700"
                leaveFrom="opacity-100 rotate-0"
                leaveTo={imageLeaveToClass}
              >
                <Image
                  className="relative left-1/2 top-14 h-24 w-24 -translate-x-1/2 rounded-full border border-[#8fdcff]/30 object-cover shadow-[0_20px_48px_rgba(0,0,0,0.45)] sm:top-16 sm:h-32 sm:w-32"
                  src={testimonial.img}
                  width={128}
                  height={128}
                  alt={testimonial.name}
                />
              </Transition>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-10 min-h-[11.5rem] transition-all delay-300 duration-150 ease-in-out sm:min-h-[12.25rem] lg:min-h-[13rem]">
        <div className="relative flex h-full flex-col">
          {testimonials.map((testimonial, index) => (
            <Transition
              key={`${testimonial.name}-quote-${index}`}
              show={active === index}
              enter="transition ease-in-out duration-500 delay-200 order-first"
              enterFrom={enterFromClass}
              enterTo="opacity-100 translate-x-0"
              leave="transition ease-out duration-300 delay-300 absolute"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo={leaveToClass}
            >
              <div className="mx-auto max-w-5xl text-[2.1rem] font-bold leading-[1.08] text-[#d8f6ff] sm:text-[2.8rem] lg:text-[3.45rem] before:content-['\201C'] after:content-['\201D']">
                {testimonial.quote}
              </div>
            </Transition>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 grid w-full max-w-[42rem] grid-cols-1 gap-2 sm:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <button
            key={`${testimonial.name}-button-${index}`}
            className={cn(
              "group relative min-h-[50px] overflow-hidden rounded-[1.1rem] border px-3 py-2 text-left shadow-sm transition-[transform,border-color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73cfff]/45",
              active === index
                ? "border-[#55c4ff]/55 bg-[linear-gradient(135deg,#186dff_0%,#2aa8ff_52%,#74d8ff_100%)] text-white shadow-[0_18px_45px_rgba(43,145,255,0.24)]"
                : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.028))] text-[#8fdcff] hover:-translate-y-1 hover:border-[#73cfff]/28 hover:bg-white/[0.08]"
            )}
            onClick={() => {
              if (index !== active) {
                setDirection(index < active ? "left" : "right");
              }
              setActive(index);
              setAutorotate(false);
            }}
          >
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_48%)] opacity-60" />
            <span className="relative block text-[0.72rem] font-semibold leading-none">
              {testimonial.name}
            </span>
            <span
              className={cn(
                "relative mt-1.5 block text-[7px] font-semibold uppercase tracking-[0.16em]",
                active === index ? "text-white/72" : "text-[#8fdcff]/54"
              )}
            >
              {testimonial.role}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";

import { useEffect, useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};
export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };
  const activeTestimonial = testimonials[active];

  return (
    <div className="mx-auto max-w-sm px-4 py-6 font-sans antialiased md:max-w-[52rem] md:px-6 lg:max-w-[56rem] lg:px-8">
      <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2 md:items-stretch md:gap-8">
        <div className="h-full">
          <div className="relative h-full min-h-[16rem] w-full [perspective:1000px] md:min-h-[18rem]">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 40
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -56, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <div className="relative h-full w-full overflow-hidden rounded-[18px] border border-white/20 bg-black/20 shadow-[0_16px_36px_rgba(0,0,0,0.45)]">
                    <img
                      src={testimonial.src}
                      alt={testimonial.name}
                      width={500}
                      height={500}
                      draggable={false}
                      className="h-full w-full object-cover object-center"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent_45%)]" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <motion.div
          key={active}
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          exit={{
            y: -20,
            opacity: 0,
          }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
          className="relative flex h-full min-h-[16rem] flex-col overflow-hidden rounded-[18px] border border-white/15 bg-black/35 p-4 shadow-[0_12px_26px_rgba(0,0,0,0.42)] backdrop-blur-sm md:min-h-[18rem] md:p-5"
        >
          <div className="pointer-events-none absolute right-3 top-1 text-[56px] leading-none text-[#00c6ff]/18">
            "
          </div>
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-full border border-[#00c6ff]/35 bg-[#00c6ff]/10 px-3 py-1 text-[10px] tracking-[0.16em] text-[#86e9ff]">
              TESTIMONIAL
            </span>
            <span className="text-xs text-white/60">
              {String(active + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </span>
          </div>
          <div className="flex flex-1 flex-col">
            <h3 className="text-lg font-bold text-white md:text-xl">{activeTestimonial.name}</h3>
            <p className="text-sm text-[#8cdfff]">{activeTestimonial.designation}</p>
            <motion.p className="mt-4 flex-1 text-sm leading-relaxed text-white/85 md:text-sm">
              {activeTestimonial.quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{
                    filter: "blur(10px)",
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </div>
        </motion.div>
      </div>
      <div className="mt-4 flex justify-center gap-3 md:mt-5">
        <button
          onClick={handlePrev}
          className="group/button flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 transition-all duration-300 hover:border-[#00c6ff]/55 hover:text-[#8ce5ff] hover:shadow-[0_0_14px_rgba(0,198,255,0.35)]"
        >
          <IconArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover/button:rotate-12" />
        </button>
        <button
          onClick={handleNext}
          className="group/button flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 transition-all duration-300 hover:border-[#00c6ff]/55 hover:text-[#8ce5ff] hover:shadow-[0_0_14px_rgba(0,198,255,0.35)]"
        >
          <IconArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/button:-rotate-12" />
        </button>
      </div>
    </div>
  );
};

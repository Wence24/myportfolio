"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

export type FloatingDockItem = {
  id?: string;
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
};

type FloatingDockProps = {
  items: FloatingDockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
  className?: string;
  vertical?: boolean;
};

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
  className,
  vertical = false,
}: FloatingDockProps) => {
  return (
    <>
      <FloatingDockDesktop
        items={items}
        className={cn(className, desktopClassName)}
        vertical={vertical}
      />
      <FloatingDockMobile items={items} className={mobileClassName} vertical={vertical} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
  vertical,
}: {
  items: FloatingDockItem[];
  className?: string;
  vertical: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="mobile-dock"
            className={cn(
              "flex gap-2",
              vertical
                ? "absolute right-full mr-2 top-1/2 -translate-y-1/2 flex-col"
                : "absolute inset-x-0 bottom-full mb-2 flex-col"
            )}
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.id ?? item.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 8,
                  transition: { delay: idx * 0.05 },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                {item.onClick ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      item.onClick?.();
                    }}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border",
                      item.active
                        ? "border-[#2eb3ff] bg-[#0099ff] text-white shadow-[0_0_14px_rgba(0,153,255,0.45)]"
                        : "border-white/15 bg-gray-100/90 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                    )}
                    aria-label={item.title}
                  >
                    <div className="h-4 w-4 [&>*]:h-full [&>*]:w-full">{item.icon}</div>
                  </button>
                ) : (
                  <a
                    href={item.href ?? "#"}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border",
                      item.active
                        ? "border-[#2eb3ff] bg-[#0099ff] text-white shadow-[0_0_14px_rgba(0,153,255,0.45)]"
                        : "border-white/15 bg-gray-100/90 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                    )}
                    aria-label={item.title}
                  >
                    <div className="h-4 w-4 [&>*]:h-full [&>*]:w-full">{item.icon}</div>
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-gray-100/90 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        aria-label="Toggle navigation dock"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
  vertical,
}: {
  items: FloatingDockItem[];
  className?: string;
  vertical: boolean;
}) => {
  const mouseAxis = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(event) => mouseAxis.set(vertical ? event.clientY : event.clientX)}
      onMouseLeave={() => mouseAxis.set(Infinity)}
      className={cn(
        "hidden md:flex rounded-2xl border border-white/10 bg-slate-500/14 p-2 backdrop-blur-md",
        vertical ? "flex-col items-center gap-3" : "mx-auto h-16 items-end gap-4 px-4 pb-3",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer
          key={item.id ?? item.title}
          mouseAxis={mouseAxis}
          title={item.title}
          icon={item.icon}
          href={item.href}
          onClick={item.onClick}
          active={Boolean(item.active)}
          vertical={vertical}
        />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseAxis,
  title,
  icon,
  href,
  onClick,
  active,
  vertical,
}: {
  mouseAxis: MotionValue<number>;
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active: boolean;
  vertical: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseAxis, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 };
    const center = vertical ? bounds.y + bounds.height / 2 : bounds.x + bounds.width / 2;
    return value - center;
  });

  const widthTransform = useTransform(distance, [-130, 0, 130], [40, 62, 40]);
  const heightTransform = useTransform(distance, [-130, 0, 130], [40, 62, 40]);
  const widthTransformIcon = useTransform(distance, [-130, 0, 130], [18, 26, 18]);
  const heightTransformIcon = useTransform(distance, [-130, 0, 130], [18, 26, 18]);

  const width = useSpring(widthTransform, {
    mass: 0.12,
    stiffness: 165,
    damping: 14,
  });
  const height = useSpring(heightTransform, {
    mass: 0.12,
    stiffness: 165,
    damping: 14,
  });
  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.12,
    stiffness: 165,
    damping: 14,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.12,
    stiffness: 165,
    damping: 14,
  });

  const body = (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-full border",
        "transition-colors duration-200",
        active
          ? "border-[#2eb3ff] bg-[#0099ff] text-white shadow-[0_0_18px_rgba(0,153,255,0.5)]"
          : "border-gray-300/75 bg-gray-200/85 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
      )}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: vertical ? 8 : "-50%", y: vertical ? "-50%" : 8 }}
            animate={{ opacity: 1, x: vertical ? 0 : "-50%", y: vertical ? "-50%" : 0 }}
            exit={{ opacity: 0, x: vertical ? 6 : "-50%", y: vertical ? "-50%" : 4 }}
            className={cn(
              "pointer-events-none absolute z-50 w-fit whitespace-pre rounded-md border px-2 py-0.5 text-xs",
              "border-gray-200 bg-gray-100 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white",
              vertical ? "right-full mr-2 top-1/2 -translate-y-1/2" : "-top-8 left-1/2 -translate-x-1/2"
            )}
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{ width: widthIcon, height: heightIcon }}
        className="flex items-center justify-center [&>*]:h-full [&>*]:w-full"
      >
        {icon}
      </motion.div>
    </motion.div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={title}>
        {body}
      </button>
    );
  }

  return (
    <a href={href ?? "#"} aria-label={title}>
      {body}
    </a>
  );
}

"use client";

import { cn } from "@/lib/utils";

import React, {
  useCallback,
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from "react";

const MouseEnterContext = createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined
>(undefined);

export const CardContainer = ({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);
  const [canTilt, setCanTilt] = useState(false);

  const applyTilt = () => {
    if (!containerRef.current || !rectRef.current) {
      frameRef.current = null;
      return;
    }

    const { left, top, width, height } = rectRef.current;
    const x = (mouseRef.current.x - left - width / 2) / 34;
    const y = (mouseRef.current.y - top - height / 2) / 34;
    containerRef.current.style.transform = `translateZ(0) rotateY(${x.toFixed(
      2
    )}deg) rotateX(${y.toFixed(2)}deg)`;
    frameRef.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canTilt) return;
    if (!containerRef.current) return;

    const eventTarget = e.target;
    if (eventTarget instanceof Element && eventTarget.closest('[data-no-tilt="true"]')) {
      containerRef.current.style.transform = "translateZ(0) rotateY(0deg) rotateX(0deg)";
      return;
    }

    mouseRef.current = { x: e.clientX, y: e.clientY };
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(applyTilt);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canTilt) return;
    const container = containerRef.current;
    if (!container) return;

    setIsMouseEntered(true);
    rectRef.current = e.currentTarget.getBoundingClientRect();
    mouseRef.current = { x: e.clientX, y: e.clientY };
    const { left, top, width, height } = rectRef.current;
    const x = (mouseRef.current.x - left - width / 2) / 34;
    const y = (mouseRef.current.y - top - height / 2) / 34;
    container.style.transform = `translateZ(0) rotateY(${x.toFixed(2)}deg) rotateX(${y.toFixed(
      2
    )}deg)`;
  };

  const handleMouseLeave = () => {
    if (!canTilt) return;
    if (!containerRef.current) return;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    rectRef.current = null;
    setIsMouseEntered(false);
    containerRef.current.style.transform = "translateZ(0) rotateY(0deg) rotateX(0deg)";
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pointerQuery = window.matchMedia("(pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateTiltMode = () => {
      setCanTilt(pointerQuery.matches && !motionQuery.matches && !document.body.classList.contains("motion-lite"));
    };

    updateTiltMode();
    pointerQuery.addEventListener("change", updateTiltMode);
    motionQuery.addEventListener("change", updateTiltMode);

    return () => {
      pointerQuery.removeEventListener("change", updateTiltMode);
      motionQuery.removeEventListener("change", updateTiltMode);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        className={cn(
          "flex h-full w-full items-center justify-center",
          containerClassName
        )}
        style={{
          perspective: "1000px",
        }}
      >
        <div
          ref={containerRef}
          onMouseEnter={canTilt ? handleMouseEnter : undefined}
          onMouseMove={canTilt ? handleMouseMove : undefined}
          onMouseLeave={canTilt ? handleMouseLeave : undefined}
          className={cn(
            "flex items-center justify-center relative transition-transform duration-200 ease-out",
            canTilt && "will-change-transform",
            className
          )}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

export const CardBody = ({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "h-full w-full [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
  [key: string]: unknown;
} & React.HTMLAttributes<HTMLElement>) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isMouseEntered] = useMouseEnter();

  const handleAnimations = useCallback(() => {
    if (!ref.current) return;
    if (isMouseEntered) {
      ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    } else {
      ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
    }
  }, [isMouseEntered, rotateX, rotateY, rotateZ, translateX, translateY, translateZ]);

  useEffect(() => {
    handleAnimations();
  }, [handleAnimations]);

  return (
    <Tag
      ref={ref}
      className={cn("w-fit transition duration-200 ease-linear", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used within a MouseEnterProvider");
  }
  return context;
};

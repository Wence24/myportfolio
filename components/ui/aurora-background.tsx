"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
  motionLite?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  motionLite = false,
  ...props
}: AuroraBackgroundProps) => {
  const auroraBottomFadeClass =
    "[mask-image:linear-gradient(180deg,black_0%,black_54%,rgba(0,0,0,0.82)_66%,rgba(0,0,0,0.28)_82%,transparent_100%)]";

  return (
    <div
      className={cn(
        "relative flex w-full overflow-hidden bg-transparent text-slate-50",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          auroraBottomFadeClass
        )}
        style={
          {
            "--aurora":
              "repeating-linear-gradient(100deg,#3b82f6_10%,#7dd3fc_16%,#8b5cf6_22%,#60a5fa_28%,#93c5fd_34%,#3b82f6_42%)",
            "--dark-gradient":
              "repeating-linear-gradient(100deg,#02050a_0%,#02050a_7%,transparent_10%,transparent_12%,#02050a_16%)",
            "--transparent": "transparent",
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            "absolute -inset-[12px] transform-gpu bg-[image:var(--dark-gradient),var(--aurora)] bg-[position:50%_50%,50%_50%] will-change-transform",
            motionLite
              ? "bg-[size:220%,_150%] opacity-45 blur-[4px]"
              : "animate-aurora bg-[size:270%,_180%] opacity-54 blur-[6px]",
            showRadialGradient &&
              "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_72%)]"
          )}
        />
        {!motionLite && (
          <div
            className={cn(
              "absolute -inset-[12px] animate-aurora-slower transform-gpu bg-[image:var(--dark-gradient),var(--aurora)] bg-[size:200%,_150%] bg-[position:50%_50%,50%_50%] opacity-34 mix-blend-screen blur-[16px]",
              showRadialGradient &&
                "[mask-image:radial-gradient(ellipse_at_0%_100%,black_12%,var(--transparent)_74%)]"
            )}
          />
        )}
      </div>

      <div
        className={cn(
          motionLite
            ? "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,9,14,0.18),rgba(5,9,14,0.34)_46%,rgba(5,9,14,0.26)_60%,rgba(5,9,14,0.12)_76%,rgba(5,9,14,0)_100%)]"
            : "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,9,14,0.16),rgba(5,9,14,0.42)_46%,rgba(5,9,14,0.36)_60%,rgba(5,9,14,0.18)_76%,rgba(5,9,14,0)_100%)]",
          auroraBottomFadeClass
        )}
      />
      <div
        className={cn(
          motionLite
            ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_28%),radial-gradient(circle_at_18%_22%,rgba(109,223,255,0.1),transparent_20%),radial-gradient(circle_at_82%_78%,rgba(104,117,255,0.1),transparent_20%)]"
            : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_30%),radial-gradient(circle_at_18%_22%,rgba(109,223,255,0.16),transparent_24%),radial-gradient(circle_at_82%_78%,rgba(104,117,255,0.16),transparent_24%)]",
          auroraBottomFadeClass
        )}
      />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

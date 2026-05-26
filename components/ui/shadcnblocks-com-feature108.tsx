"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { ArrowUpRight, Layout, Pointer, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TabContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  buttonHref?: string;
  imageSrc: string;
  imageAlt: string;
}

interface Tab {
  value: string;
  icon: ReactNode;
  label: string;
  content: TabContent;
}

interface Feature108Props {
  badge?: ReactNode;
  heading?: ReactNode;
  description?: ReactNode;
  tabs?: Tab[];
}

const Feature108 = ({
  badge = "shadcnblocks.com",
  heading = "A Collection of Components Built With Shadcn & Tailwind",
  description = "Join us to build flawless web solutions.",
  tabs = [
    {
      value: "tab-1",
      icon: <Zap className="h-auto w-4 shrink-0" />,
      label: "Boost Revenue",
      content: {
        badge: "Modern Tactics",
        title: "Make your site a true standout.",
        description:
          "Discover new web trends that help you craft sleek, highly functional sites that drive traffic and convert leads into customers.",
        buttonText: "See Plans",
        imageSrc:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Laptop with code on screen",
      },
    },
    {
      value: "tab-2",
      icon: <Pointer className="h-auto w-4 shrink-0" />,
      label: "Higher Engagement",
      content: {
        badge: "Expert Features",
        title: "Boost your site with top-tier design.",
        description:
          "Use stellar design to easily engage users and strengthen their loyalty. Create a seamless experience that keeps them coming back for more.",
        buttonText: "See Tools",
        imageSrc:
          "https://images.unsplash.com/photo-1747435628628-60d0bf15ec8d?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Colorful abstract graphic design texture",
      },
    },
    {
      value: "tab-3",
      icon: <Layout className="h-auto w-4 shrink-0" />,
      label: "Stunning Layouts",
      content: {
        badge: "Elite Solutions",
        title: "Build an advanced web experience.",
        description:
          "Lift your brand with modern tech that grabs attention and drives action. Create a digital experience that stands out from the crowd.",
        buttonText: "See Options",
        imageSrc:
          "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Desktop setup with web design screens",
      },
    },
  ],
}: Feature108Props) => {
  const [activeValue, setActiveValue] = useState(tabs[0]?.value ?? "");
  const tabsListRef = useRef<HTMLDivElement | null>(null);
  const tabTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({
    opacity: 0,
  });

  const updateIndicator = useCallback(() => {
    const tabsList = tabsListRef.current;
    const activeTrigger = tabTriggerRefs.current[activeValue];

    if (!tabsList || !activeTrigger) {
      setIndicatorStyle({ opacity: 0 });
      return;
    }

    const listRect = tabsList.getBoundingClientRect();
    const triggerRect = activeTrigger.getBoundingClientRect();

    setIndicatorStyle({
      opacity: 1,
      width: triggerRect.width,
      height: triggerRect.height,
      transform: `translate3d(${triggerRect.left - listRect.left}px, ${
        triggerRect.top - listRect.top
      }px, 0)`,
    });
  }, [activeValue]);

  useEffect(() => {
    if (tabs.length === 0) {
      setActiveValue("");
      return;
    }

    if (!tabs.some((tab) => tab.value === activeValue)) {
      setActiveValue(tabs[0].value);
    }
  }, [activeValue, tabs]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(updateIndicator);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateIndicator)
        : null;

    if (resizeObserver) {
      if (tabsListRef.current) {
        resizeObserver.observe(tabsListRef.current);
      }

      tabs.forEach((tab) => {
        const trigger = tabTriggerRefs.current[tab.value];
        if (trigger) {
          resizeObserver.observe(trigger);
        }
      });
    }

    window.addEventListener("resize", updateIndicator);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [tabs, updateIndicator]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-12 sm:py-14 lg:py-16">
      <div className="pointer-events-none absolute inset-x-[-6%] top-0 bottom-[-10%] -z-10">
        <div className="absolute left-1/2 top-6 h-72 w-[76vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.18)_0%,rgba(84,184,255,0.07)_34%,transparent_72%)] blur-3xl" />
        <div className="absolute left-[4%] top-[42%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(56,142,255,0.16)_0%,rgba(56,142,255,0.055)_42%,transparent_74%)] blur-3xl" />
        <div className="absolute right-[4%] bottom-[4%] h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(143,220,255,0.14)_0%,rgba(143,220,255,0.05)_40%,transparent_74%)] blur-3xl" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-7xl -translate-x-14 px-4 sm:-translate-x-20 sm:px-6 lg:-translate-x-36 lg:px-8 xl:-translate-x-52">
        <div className="flex flex-col items-center gap-4 text-center">
          {badge ? (
            <Badge
              variant="outline"
              className="border-white/14 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-[#c7efff]"
            >
              {badge}
            </Badge>
          ) : null}
          <h3
            className="w-full max-w-none whitespace-nowrap text-center text-[clamp(0.82rem,3.45vw,2.55rem)] font-bold leading-none tracking-[-0.02em] text-white"
            style={{
              fontFamily:
                'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            {heading}
          </h3>
          {description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-white/64 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        <Tabs value={activeValue} onValueChange={setActiveValue} className="mt-8">
          <TabsList
            ref={tabsListRef}
            className="relative mx-auto flex w-full max-w-4xl flex-col items-stretch justify-start gap-3 overflow-x-auto rounded-full pb-1 sm:flex-row sm:items-center md:gap-4"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-0 overflow-hidden rounded-full border border-[#8fdcff]/48 bg-[radial-gradient(circle_at_50%_0%,rgba(143,220,255,0.38),rgba(84,184,255,0.2)_42%,rgba(8,42,66,0.82)_100%)] shadow-[0_0_34px_rgba(84,184,255,0.5),0_18px_42px_rgba(0,153,255,0.22)] transition-[height,opacity,transform,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={indicatorStyle}
            >
              <div className="absolute inset-x-8 -bottom-5 h-9 rounded-full bg-[#8fdcff]/35 blur-xl" />
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                ref={(node) => {
                  tabTriggerRefs.current[tab.value] = node;
                }}
                value={tab.value}
                className="group relative z-10 flex min-h-12 min-w-[11rem] flex-1 items-center justify-center gap-2 rounded-full border border-[#8fdcff]/16 bg-[#061424]/60 px-4 py-3 text-sm font-semibold text-white/66 outline-none shadow-[0_0_24px_rgba(84,184,255,0.08)] transition-[border-color,background-color,color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#8fdcff]/34 hover:bg-[#0b2236]/74 hover:text-white hover:shadow-[0_0_34px_rgba(84,184,255,0.18)] data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                <span className="text-[#8fdcff]">{tab.icon}</span>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="relative mx-auto mt-10 w-full overflow-visible">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute left-[8%] top-[8%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(143,220,255,0.2)_0%,rgba(143,220,255,0.065)_42%,transparent_70%)] blur-3xl" />
              <div className="absolute right-[6%] bottom-[8%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.18)_0%,rgba(84,184,255,0.06)_42%,transparent_70%)] blur-3xl" />
              <div className="absolute left-1/2 bottom-[-18%] h-56 w-[68%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(47,125,255,0.13)_0%,rgba(47,125,255,0.045)_42%,transparent_74%)] blur-3xl" />
            </div>

            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="relative z-10 grid gap-8 data-[state=active]:animate-[featureLaneReveal_420ms_cubic-bezier(0.22,1,0.36,1)] data-[state=inactive]:hidden lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12"
              >
                <div className="flex flex-col gap-5 lg:pl-10 xl:pl-12">
                  <Badge
                    variant="outline"
                    className="w-fit border-white/14 bg-white/[0.035] text-[#dff8ff]"
                  >
                    {tab.content.badge}
                  </Badge>
                  <h4
                    className="text-3xl font-semibold leading-tight text-white lg:text-5xl"
                    style={{ fontFamily: "'CreatoDisplay', sans-serif" }}
                  >
                    {tab.content.title}
                  </h4>
                  <p className="max-w-xl text-sm leading-relaxed text-white/66 lg:text-base">
                    {tab.content.description}
                  </p>
                  {tab.content.buttonHref ? (
                    <Button
                      asChild
                      className="mt-2.5 w-fit gap-2 rounded-full bg-[linear-gradient(135deg,#76e1ff,#4a8fff)] px-6 text-[#04111b] shadow-[0_18px_36px_rgba(84,184,255,0.2)] hover:bg-[linear-gradient(135deg,#8ce8ff,#63a2ff)]"
                      size="lg"
                    >
                      <a href={tab.content.buttonHref}>
                        {tab.content.buttonText}
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      className="mt-2.5 w-fit gap-2 rounded-full bg-[linear-gradient(135deg,#76e1ff,#4a8fff)] px-6 text-[#04111b] shadow-[0_18px_36px_rgba(84,184,255,0.2)] hover:bg-[linear-gradient(135deg,#8ce8ff,#63a2ff)]"
                      size="lg"
                    >
                      {tab.content.buttonText}
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] bg-black/20 shadow-[0_0_34px_rgba(84,184,255,0.16),0_28px_70px_rgba(0,0,0,0.22)]">
                  <Image
                    src={tab.content.imageSrc}
                    alt={tab.content.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,rgba(0,0,0,0.38)_100%)]" />
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
      <style>{`
        @keyframes featureLaneReveal {
          from {
            opacity: 0;
            transform: translate3d(18px, 10px, 0) scale(0.985);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0);
          }
        }
      `}</style>
    </section>
  );
};

export { Feature108 };

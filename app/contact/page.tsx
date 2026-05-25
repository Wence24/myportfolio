"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Check,
  Download,
  Mail,
  Send,
} from "lucide-react";
import {
  FaInstagram,
  FaLinkedinIn,
  FaTelegramPlane,
  FaWhatsapp,
} from "react-icons/fa";

import { SiteHeader } from "@/components/site-header";
import { HomeScrollRevealSection } from "@/components/ui/motion-footer";

const CAL_SCRIPT_URL = "https://app.cal.com/embed/embed.js";
const CAL_ORIGIN = "https://app.cal.com";
const CAL_NAMESPACE = "15-minute-intro-call";
const CAL_LINK = "aiakos-edits-wq23bc/15-minute-intro-call";
const CAL_ELEMENT_ID = "my-cal-inline-15-minute-intro-call";
const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";
const EMAILJS_SERVICE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_t9r2gpm";
const EMAILJS_TEMPLATE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_gr6dp6b";
const EMAILJS_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "tFjmISXX0nKYCXvYR";

const projectNeeds = [
  {
    label: "Short-Form Edit",
    value: "short-form-package",
    serviceType: "video-edit",
    videoEditType: "short-form",
  },
  {
    label: "Long-Form Edit",
    value: "long-form-package",
    serviceType: "video-edit",
    videoEditType: "long-form",
  },
  {
    label: "Graphic Design",
    value: "design-assets",
    serviceType: "graphic-design",
  },
  {
    label: "Web Development",
    value: "web-page-build",
    serviceType: "web-development",
  },
  {
    label: "Monthly Package",
    value: "monthly-support",
    serviceType: "creative-package",
  },
  { label: "Custom Request", value: "custom-request", serviceType: "other" },
] as const;

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/editwithwens",
    icon: FaInstagram,
    className: "text-[#8fdcff]",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: FaLinkedinIn,
    className: "text-[#bdeeff]",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/",
    icon: FaWhatsapp,
    className: "text-[#65d9ff]",
  },
  {
    label: "Telegram",
    href: "https://t.me/",
    icon: FaTelegramPlane,
    className: "text-[#4a8fff]",
  },
] as const;

type SubmitState = {
  status: "idle" | "sending" | "success" | "error";
  message: string;
};

type ContactPayload = {
  name: string;
  email: string;
  serviceType: string;
  videoEditType: string;
  services: string;
  selectedRateSummary: string;
  message: string;
};

type CalApi = {
  (...args: unknown[]): void;
  loaded?: boolean;
  ns?: Record<string, CalApi>;
  q?: unknown[][];
};

type CalWindow = Window & {
  Cal?: CalApi;
};

const initializeCalEmbed = () => {
  const calWindow = window as CalWindow;

  ((C: CalWindow, A: string, L: string) => {
    const pushQueue = (api: CalApi, args: unknown[]) => {
      api.q = api.q || [];
      api.q.push(args);
    };

    const documentRef = C.document;

    C.Cal =
      C.Cal ||
      ((...args: unknown[]) => {
        const cal = C.Cal as CalApi;

        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          const script = documentRef.createElement("script");
          script.src = A;
          documentRef.head.appendChild(script);
          cal.loaded = true;
        }

        if (args[0] === L) {
          const api = ((...apiArgs: unknown[]) => {
            pushQueue(api, apiArgs);
          }) as CalApi;
          const namespace = args[1];
          api.q = api.q || [];

          if (typeof namespace === "string") {
            cal.ns = cal.ns || {};
            cal.ns[namespace] = cal.ns[namespace] || api;
            pushQueue(cal.ns[namespace], args);
            pushQueue(cal, ["initNamespace", namespace]);
          } else {
            pushQueue(cal, args);
          }

          return;
        }

        pushQueue(cal, args);
      });
  })(calWindow, CAL_SCRIPT_URL, "init");

  calWindow.Cal?.("init", CAL_NAMESPACE, { origin: CAL_ORIGIN });

  calWindow.Cal?.ns?.[CAL_NAMESPACE]?.("inline", {
    elementOrSelector: `#${CAL_ELEMENT_ID}`,
    config: {
      layout: "month_view",
      useSlotsViewOnSmallScreen: "true",
      theme: "dark",
    },
    calLink: CAL_LINK,
  });

  calWindow.Cal?.ns?.[CAL_NAMESPACE]?.("ui", {
    theme: "dark",
    cssVarsPerTheme: {
      dark: {
        "cal-brand": "#008dff",
      },
    },
    hideEventTypeDetails: false,
    layout: "month_view",
  });
};

const sendEmailJsMessage = async (payload: ContactPayload) => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    return false;
  }

  const response = await fetch(EMAILJS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        name: payload.name,
        from_name: payload.name,
        email: payload.email,
        from_email: payload.email,
        to_name: payload.name,
        to_email: payload.email,
        reply_to: payload.email,
        services: payload.services,
        selected_services: payload.services,
        service_type: payload.serviceType,
        video_edit_type: payload.videoEditType,
        project_needs: payload.services,
        selected_rate_summary: payload.selectedRateSummary,
        message: payload.message,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("EmailJS could not send your message right now.");
  }

  return true;
};

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(["short-form-package"]);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });

  useEffect(() => {
    initializeCalEmbed();
  }, []);

  const selectedNeedsLabel = useMemo(
    () =>
      projectNeeds
        .filter((item) => selectedNeeds.includes(item.value))
        .map((item) => item.label)
        .join(", "),
    [selectedNeeds]
  );

  const toggleNeed = (value: string) => {
    setSelectedNeeds((currentNeeds) =>
      currentNeeds.includes(value)
        ? currentNeeds.filter((item) => item !== value)
        : [...currentNeeds, value]
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState({ status: "sending", message: "Sending your message..." });

    const primaryNeed =
      projectNeeds.find((item) => selectedNeeds.includes(item.value)) ||
      projectNeeds[projectNeeds.length - 1];
    const contactPayload: ContactPayload = {
      name,
      email,
      serviceType: primaryNeed.serviceType,
      videoEditType: "videoEditType" in primaryNeed ? primaryNeed.videoEditType : "",
      services: selectedNeedsLabel || "Not specified",
      selectedRateSummary: selectedNeedsLabel || "Not specified",
      message,
    };

    try {
      const sentWithEmailJs = await sendEmailJsMessage(contactPayload);

      if (!sentWithEmailJs) {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactPayload),
        });

        const responsePayload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        if (!response.ok) {
          throw new Error(
            responsePayload?.error || "Your message could not be sent."
          );
        }
      }

      setName("");
      setEmail("");
      setMessage("");
      setSelectedNeeds(["short-form-package"]);
      setSubmitState({
        status: "success",
        message: sentWithEmailJs
          ? "Message sent. Check your inbox for the auto-reply."
          : "Message sent. I will get back to you soon.",
      });
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Your message could not be sent.",
      });
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020611] text-white">
      <SiteHeader activeSection="contact" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,rgba(25,91,255,0.58)_0%,rgba(25,91,255,0.22)_18%,transparent_42%),radial-gradient(circle_at_88%_12%,rgba(63,176,255,0.48)_0%,rgba(63,176,255,0.16)_22%,transparent_46%),radial-gradient(circle_at_50%_90%,rgba(84,184,255,0.18)_0%,transparent_46%),linear-gradient(135deg,#020611_0%,#050b17_44%,#040915_100%)]" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(143,220,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(143,220,255,0.1)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="absolute inset-x-[8%] top-28 h-px bg-[linear-gradient(90deg,transparent,rgba(143,220,255,0.68),transparent)]" />
        <div className="absolute left-1/2 top-16 h-72 w-[70vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(84,184,255,0.18)_0%,rgba(84,184,255,0.06)_42%,transparent_74%)] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(2,6,17,0.84),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(0deg,rgba(2,6,17,0.94),transparent)]" />
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-[88rem] gap-6 px-5 pb-14 pt-28 sm:px-7 lg:grid-cols-[0.98fr_0.92fr] lg:px-10 lg:pt-32 xl:px-12">
        <div className="contact-fade-in contact-fade-delay-1 relative overflow-hidden rounded-[22px] border border-[#8fdcff]/18 bg-[#061424]/82 shadow-[0_24px_78px_rgba(0,0,0,0.44),0_0_52px_rgba(84,184,255,0.1)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" />
            <div className="absolute right-[-8%] top-[-12%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(89,188,255,0.28),transparent_72%)] blur-3xl" />
            <div className="absolute left-[-12%] bottom-[-18%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,125,255,0.18),transparent_72%)] blur-3xl" />
          </div>

          <div className="relative z-10 px-5 pb-4 pt-6 sm:px-7 lg:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8fdcff]/72">
              Book a call
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[2.15rem]">
              Find a good <span className="font-serif italic text-[#8fdcff]">time.</span>
            </h1>
            <p className="mt-2.5 text-sm font-medium text-white/52">
              Fifteen minutes to see if we click.
            </p>
          </div>

          <div className="relative z-10 border-t border-sky-300/12 bg-[#06111e]/76 p-1.5 sm:p-2.5">
            <div className="relative min-h-[590px] overflow-hidden rounded-[18px] border border-sky-300/12 bg-[#0a1522]">
              <div
                id={CAL_ELEMENT_ID}
                className="h-[590px] w-full overflow-auto"
                aria-label="Cal.com booking calendar"
              />
            </div>
          </div>
        </div>

        <aside className="contact-fade-in contact-fade-delay-2 relative overflow-hidden rounded-[22px] border border-[#8fdcff]/18 bg-[linear-gradient(145deg,rgba(6,20,36,0.94),rgba(5,14,27,0.88))] p-5 shadow-[0_24px_78px_rgba(0,0,0,0.42),0_0_52px_rgba(47,125,255,0.1)] backdrop-blur-xl sm:p-7 lg:p-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute right-[-10%] top-[-10%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(76,159,255,0.28),transparent_72%)] blur-3xl" />
            <div className="absolute left-[-14%] bottom-[-18%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(143,220,255,0.16),transparent_72%)] blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[2.15rem]">
              Let&apos;s talk.
            </h2>

            <div className="contact-fade-in contact-fade-delay-3 mt-6">
              <p className="text-sm font-semibold text-white/46">Mail me at</p>
              <a
                href="mailto:aiakosedt@gmail.com"
                className="mt-2.5 inline-flex items-center gap-3 text-base font-semibold text-white transition-colors hover:text-[#8fdcff] sm:text-lg"
              >
                <Mail className="h-5 w-5 text-white/80" />
                aiakosedt@gmail.com
              </a>
            </div>

            <div className="contact-fade-in contact-fade-delay-4 mt-5 flex flex-wrap items-center gap-3">
              <span className="mr-1 text-sm font-semibold uppercase text-white/42">or</span>
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#8fdcff]/40 hover:bg-white/[0.08]"
                  >
                    <Icon className={`h-4 w-4 ${item.className}`} />
                  </a>
                );
              })}
            </div>

            <Link
              href="/Wence-De-Vera-CV.pdf"
              className="contact-fade-in contact-fade-delay-5 mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/54 transition-colors hover:text-white"
            >
              <Download className="h-4 w-4" />
              Download resume (PDF)
            </Link>

            <div className="my-6 h-px bg-white/10" />

            <form onSubmit={handleSubmit} className="contact-fade-in contact-fade-delay-6 space-y-4">
              <p className="text-sm font-semibold text-white/50">
                Leave a brief message
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-white/86">Your name</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    required
                    className="mt-2 h-10 w-full rounded-xl border border-white/12 bg-white/[0.045] px-3 text-sm text-white outline-none transition-colors placeholder:text-white/36 focus:border-[#8fdcff]/48"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-white/86">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="mt-2 h-10 w-full rounded-xl border border-white/12 bg-white/[0.045] px-3 text-sm text-white outline-none transition-colors placeholder:text-white/36 focus:border-[#8fdcff]/48"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-white/86">
                  Briefly describe your project
                </span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell me the lane, timeline, package, references, and anything that needs to feel sharp."
                  required
                  className="mt-2 min-h-[82px] w-full rounded-xl border border-white/12 bg-white/[0.045] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/36 focus:border-[#8fdcff]/48"
                />
              </label>

              <div>
                <p className="text-sm font-semibold text-white/52">
                  I&apos;m looking for...
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {projectNeeds.map((item) => {
                    const selected = selectedNeeds.includes(item.value);

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => toggleNeed(item.value)}
                        className={`group flex h-9 items-center gap-2.5 rounded-full border px-3 text-left text-[13px] font-semibold transition-[border-color,background-color,color,transform] duration-200 hover:-translate-y-0.5 ${
                          selected
                            ? "border-[#8fdcff]/48 bg-[#8fdcff]/12 text-white"
                            : "border-white/12 bg-black/12 text-white/70 hover:border-white/24 hover:bg-white/[0.055]"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                            selected
                              ? "border-[#8fdcff] bg-[#8fdcff] text-[#04111b]"
                              : "border-white/28 text-transparent"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {submitState.message ? (
                <p
                  className={`text-sm ${
                    submitState.status === "error"
                      ? "text-[#ffb7c0]"
                      : submitState.status === "success"
                        ? "text-[#adffd0]"
                        : "text-white/56"
                  }`}
                >
                  {submitState.message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitState.status === "sending"}
                className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,#76e1ff,#4a8fff)] text-sm font-bold text-[#04111b] shadow-[0_18px_42px_rgba(74,143,255,0.28)] transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(118,225,255,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitState.status === "sending" ? "Sending..." : "Send a message"}
                <Send className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </form>

            <div className="contact-fade-in contact-fade-delay-7 mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/52">
              <CalendarCheck className="h-5 w-5 text-[#8fdcff]" />
              Prefer a quick call? Pick any open slot on the calendar.
            </div>
          </div>
        </aside>
      </section>

      <style jsx>{`
        @keyframes contactFadeUp {
          from {
            opacity: 0;
            transform: translate3d(0, 18px, 0);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            filter: blur(0);
          }
        }

        .contact-fade-in {
          opacity: 0;
          animation: contactFadeUp 680ms cubic-bezier(0.22, 0.78, 0.24, 1) forwards;
          will-change: opacity, transform, filter;
        }

        .contact-fade-delay-1 {
          animation-delay: 90ms;
        }

        .contact-fade-delay-2 {
          animation-delay: 180ms;
        }

        .contact-fade-delay-3 {
          animation-delay: 300ms;
        }

        .contact-fade-delay-4 {
          animation-delay: 390ms;
        }

        .contact-fade-delay-5 {
          animation-delay: 480ms;
        }

        .contact-fade-delay-6 {
          animation-delay: 570ms;
        }

        .contact-fade-delay-7 {
          animation-delay: 660ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .contact-fade-in {
            opacity: 1;
            animation: none;
            transform: none;
            filter: none;
          }
        }
      `}</style>

      <HomeScrollRevealSection />
    </main>
  );
}

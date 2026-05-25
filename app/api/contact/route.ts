import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_CONTACT_EMAIL = "aiakosedt@gmail.com";
const MAX_MESSAGE_LENGTH = 4000;
const VALID_SERVICES = [
  "video-edit",
  "graphic-design",
  "web-development",
  "creative-package",
  "branding",
  "social",
  "packaging",
  "motion",
  "code",
  "other",
] as const;
const VALID_VIDEO_EDIT_TYPES = ["long-form", "short-form"] as const;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getInquiryLabel = (value: string): string => {
  switch (value) {
    case "video-edit":
      return "Video edit";
    case "graphic-design":
      return "Graphic design";
    case "web-development":
      return "Web development";
    case "creative-package":
      return "Creative package";
    case "branding":
      return "Branding";
    case "social":
      return "Social";
    case "packaging":
      return "Packaging";
    case "motion":
      return "Motion";
    case "code":
      return "Code";
    case "other":
      return "Other";
    case "long-form":
      return "Long-form edits";
    case "short-form":
      return "Short-form edits";
    default:
      return value;
  }
};

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const serviceType =
    typeof body.serviceType === "string" ? body.serviceType.trim() : "";
  const videoEditType =
    typeof body.videoEditType === "string" ? body.videoEditType.trim() : "";
  const selectedRateSummary =
    typeof body.selectedRateSummary === "string"
      ? body.selectedRateSummary.trim()
      : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !serviceType || !message) {
    return Response.json(
      { error: "Name, email, service, and message are required." },
      { status: 400 }
    );
  }

  if (!VALID_SERVICES.includes(serviceType as (typeof VALID_SERVICES)[number])) {
    return Response.json(
      { error: "Please choose a valid service." },
      { status: 400 }
    );
  }

  if (serviceType === "video-edit" && !videoEditType) {
    return Response.json(
      { error: "Please choose whether you need long-form or short-form edits." },
      { status: 400 }
    );
  }

  if (
    videoEditType &&
    !VALID_VIDEO_EDIT_TYPES.includes(
      videoEditType as (typeof VALID_VIDEO_EDIT_TYPES)[number]
    )
  ) {
    return Response.json(
      { error: "Please choose a valid video edit type." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return Response.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      { error: "Message is too long. Please keep it under 4000 characters." },
      { status: 400 }
    );
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const contactToEmail =
    process.env.CONTACT_TO_EMAIL || DEFAULT_CONTACT_EMAIL;
  const selectedVideoEditType =
    serviceType === "video-edit" ? videoEditType : "";

  if (!smtpUser || !smtpPass) {
    return Response.json(
      {
        error:
          "Email sending is not configured yet. Set SMTP_USER and SMTP_PASS in your environment variables (.env.local for local development or your hosting provider settings for production).",
      },
      { status: 503 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    await transporter.sendMail({
      from: `Portfolio Contact <${smtpUser}>`,
      to: contactToEmail,
      replyTo: email,
      subject: `New ${getInquiryLabel(serviceType)} inquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Service: ${getInquiryLabel(serviceType)}`,
        ...(selectedVideoEditType
          ? [`Edit type: ${getInquiryLabel(selectedVideoEditType)}`]
          : []),
        ...(selectedRateSummary ? [`Selected needs: ${selectedRateSummary}`] : []),
        "",
        "Message:",
        message,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827;">
          <h2 style="margin-bottom: 16px;">New portfolio inquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Service:</strong> ${escapeHtml(
            getInquiryLabel(serviceType)
          )}</p>
          ${
            selectedVideoEditType
              ? `<p><strong>Edit type:</strong> ${escapeHtml(
                  getInquiryLabel(selectedVideoEditType)
                )}</p>`
              : ""
          }
          ${
            selectedRateSummary
              ? `<p><strong>Selected needs:</strong> ${escapeHtml(selectedRateSummary)}</p>`
              : ""
          }
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return Response.json(
      { error: "Your message could not be sent right now." },
      { status: 500 }
    );
  }
}

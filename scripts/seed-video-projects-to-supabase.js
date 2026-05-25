/* eslint-disable @typescript-eslint/no-require-imports */

const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) return env;

      const separatorIndex = trimmedLine.indexOf("=");
      if (separatorIndex === -1) return env;

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");

      return { ...env, [key]: value };
    }, {});
}

const defaultVideoProjects = [
  {
    title: "Short-Form Motion Reel",
    description:
      "A fast social edit shaped around clean pacing, punchy cuts, and a ready-to-post finish for short-form content.",
    image: "/v2.png",
    designLink: "/vide1.mp4",
    videoCategory: "Short-form",
    videoParentLabel: "Social edit",
    videoAspectRatio: "landscape",
    videoUrl: "/vide1.mp4",
    videoUrls: ["/vide1.mp4"],
    videoPosterUrls: ["/v2.png"],
    showDetailsModal: false,
  },
  {
    title: "Cinematic Brand Cut",
    description:
      "A longer edit with stronger visual flow, cleaner transitions, and a more polished showcase-style presentation.",
    image: "/v3.png",
    designLink: "/VID.mp4",
    videoCategory: "Long-form",
    videoParentLabel: "Portfolio edit",
    videoAspectRatio: "landscape",
    videoUrl: "/VID.mp4",
    videoUrls: ["/VID.mp4"],
    videoPosterUrls: ["/v3.png"],
    showDetailsModal: false,
  },
];

const envLocal = loadEnvFile(path.join(process.cwd(), ".env.local"));
const supabaseUrl =
  envLocal.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  envLocal.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const rowId =
  envLocal.NEXT_PUBLIC_SUPABASE_CONTENT_ROW_ID ||
  process.env.NEXT_PUBLIC_SUPABASE_CONTENT_ROW_ID ||
  "main";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase config. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

async function main() {
  const { data, error } = await supabase
    .from("portfolio_content")
    .select("*")
    .eq("id", rowId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not read portfolio_content: ${error.message}`);
  }

  const currentProjects =
    data?.projects && typeof data.projects === "object" ? data.projects : {};
  const currentVideoProjects = Array.isArray(currentProjects["Video Edit"])
    ? currentProjects["Video Edit"]
    : [];
  const existingTitles = new Set(
    currentVideoProjects.map((project) =>
      typeof project?.title === "string" ? project.title.trim().toLowerCase() : ""
    )
  );
  const nextVideoProjects = [
    ...currentVideoProjects,
    ...defaultVideoProjects.filter(
      (project) => !existingTitles.has(project.title.trim().toLowerCase())
    ),
  ];
  const nextProjects = {
    "Graphic Design": Array.isArray(currentProjects["Graphic Design"])
      ? currentProjects["Graphic Design"]
      : [],
    "Video Edit": nextVideoProjects,
    Websites: Array.isArray(currentProjects.Websites) ? currentProjects.Websites : [],
  };

  const { error: upsertError } = await supabase.from("portfolio_content").upsert(
    {
      id: rowId,
      projects: nextProjects,
      testimonials: Array.isArray(data?.testimonials) ? data.testimonials : [],
      experience_entries: Array.isArray(data?.experience_entries)
        ? data.experience_entries
        : [],
      home_content:
        data?.home_content && typeof data.home_content === "object"
          ? data.home_content
          : {},
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    throw new Error(`Could not update portfolio_content: ${upsertError.message}`);
  }

  console.log(`Seeded ${nextVideoProjects.length} video projects to Supabase.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

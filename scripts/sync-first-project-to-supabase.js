const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const env = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalIndex = trimmed.indexOf("=");
    if (equalIndex === -1) continue;
    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed.slice(equalIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

function getConfig() {
  const rootDir = process.cwd();
  const envLocal = readEnvFile(path.join(rootDir, ".env.local"));
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
    throw new Error(
      "Missing Supabase env values. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
    );
  }

  return { supabaseUrl, supabaseAnonKey, rowId };
}

async function run() {
  const { supabaseUrl, supabaseAnonKey, rowId } = getConfig();

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const firstProjectOnly = {
    "Graphic Design": [
      {
        title: "COMRADZ Sessions",
        description:
          "A weekly poster designed to showcase the details of our Sunday dance sessions. Each poster highlights the schedule, theme, and key information for the day’s session, making it easy for participants to stay informed and join in. The design aims to be clear, engaging, and consistent, creating a recognizable visual identity for COMRADZ’s weekly gatherings.",
        image: "/comradz.png",
        designLink: "#",
        showDetailsModal: true,
        details: {
          title: "COMRADZ Sessions",
          description:
            "A weekly poster designed to showcase the details of our Sunday dance sessions. Each poster highlights the schedule, theme, and key information for the day’s session, making it easy for participants to stay informed and join in. The design aims to be clear, engaging, and consistent, creating a recognizable visual identity for COMRADZ’s weekly gatherings.",
          heroImage: "/comradz2.png",
          galleryImages: ["/image1.png", "/image2.png", "/image3.png", "/image4.png"],
        },
      },
    ],
    "Video Edit": [],
    Certificates: [],
  };

  const { data: existingRow, error: readError } = await supabase
    .from("portfolio_content")
    .select("testimonials")
    .eq("id", rowId)
    .maybeSingle();

  if (readError) {
    throw new Error(`Failed reading current Supabase row: ${readError.message}`);
  }

  const testimonials = Array.isArray(existingRow?.testimonials)
    ? existingRow.testimonials
    : [];

  const payload = {
    id: rowId,
    projects: firstProjectOnly,
    testimonials,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase
    .from("portfolio_content")
    .upsert(payload, { onConflict: "id" });

  if (upsertError) {
    throw new Error(`Failed syncing first project: ${upsertError.message}`);
  }

  console.log("Done: Supabase now has only the first project box in projects.");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

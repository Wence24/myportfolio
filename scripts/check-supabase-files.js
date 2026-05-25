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
  // Try the database
  console.log("Trying database...");
  const { data, error } = await supabase
    .from("portfolio_content")
    .select("id, projects, testimonials, experience_entries")
    .eq("id", rowId)
    .maybeSingle();

  if (error) {
    console.log("DB error:", error.message);
    if (error.message.includes("portfolio_content")) {
      console.log(
        "Run supabase/schema.sql in your new Supabase project's SQL Editor, then try again."
      );
    }
    return;
  }

  if (data) {
    console.log("Database accessed successfully!");
    
    // Extract all URLs from the data
    const dataStr = JSON.stringify(data);
    const supabaseUrls = [];
    const cloudinaryUrls = [];
    const localMediaUrls = [];
    const projectCounts = data.projects && typeof data.projects === "object"
      ? Object.fromEntries(
          Object.entries(data.projects).map(([category, projects]) => [
            category,
            Array.isArray(projects) ? projects.length : 0,
          ])
        )
      : {};
    const regex = /https?:\/\/[^"'\s]*supabase[^"'\s]*/gi;
    const cloudinaryRegex = /https?:\/\/[^"'\s]*cloudinary[^"'\s]*/gi;
    const localMediaRegex = /"\/[^"']+\.(?:mp4|webm|mov|png|jpe?g|webp|gif|svg)(?:\?[^"']*)?"/gi;
    let match;
    while ((match = regex.exec(dataStr)) !== null) {
      supabaseUrls.push(match[0]);
    }
    while ((match = cloudinaryRegex.exec(dataStr)) !== null) {
      cloudinaryUrls.push(match[0]);
    }
    while ((match = localMediaRegex.exec(dataStr)) !== null) {
      localMediaUrls.push(match[0].slice(1, -1));
    }

    console.log("\nProject counts in Supabase:");
    Object.entries(projectCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
    
    if (supabaseUrls.length > 0) {
      console.log("\nFound Supabase Storage URLs in database:");
      supabaseUrls.forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
    } else {
      console.log("\nNo Supabase Storage URLs found.");
    }

    if (cloudinaryUrls.length > 0) {
      console.log("\nFound Cloudinary URLs in database:");
      cloudinaryUrls.forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
    } else {
      console.log("\nNo Cloudinary URLs found in Supabase.");
    }

    if (localMediaUrls.length > 0) {
      console.log("\nFound local public media paths in database:");
      localMediaUrls.forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
    } else if (cloudinaryUrls.length === 0) {
      console.log("If the work shows only in one browser, open that browser's Studio and click Save to sync it.");
    }
  }
}

main().catch((e) => console.error(e));

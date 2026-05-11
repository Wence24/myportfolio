/**
 * Migration script: Move all assets from Supabase Storage to Cloudinary.
 *
 * This script loads all file URLs stored in Supabase (projects images, video thumbnails,
 * testimonials images, experience images) and uploads them to Cloudinary.
 * After migration, update the Supabase DB records to point to Cloudinary URLs.
 *
 * Usage:
 *   node scripts/migrate-supabase-to-cloudinary.js
 *
 * Prerequisites:
 *   - .env.local with Supabase and Cloudinary credentials
 *   - cloudinary package installed
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { createClient } = require("@supabase/supabase-js");
const cloudinary = require("cloudinary").v2;

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

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with status ${response.statusCode} for ${url}`));
        return;
      }

      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    });
  });
}

async function uploadToCloudinary(buffer, folder, resourceType) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType || "auto",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(new Error(error.message || "Cloudinary upload failed."));
          return;
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

function isCloudinaryUrl(url) {
  return /^https?:\/\/.*cloudinary/i.test(url);
}

function isSupabaseStorageUrl(url) {
  return /^https?:\/\/.*supabase/i.test(url) && /storage/i.test(url);
}

function extractAssetPaths(obj, paths = new Set()) {
  if (!obj || typeof obj !== "object") return paths;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractAssetPaths(item, paths);
    }
    return paths;
  }

  for (const value of Object.values(obj)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (
        trimmed &&
        isSupabaseStorageUrl(trimmed) &&
        !isCloudinaryUrl(trimmed)
      ) {
        // Don't include URLs that start with just "/" (local paths)
        if (trimmed.startsWith("http")) {
          paths.add(trimmed);
        }
      }
    } else if (typeof value === "object") {
      extractAssetPaths(value, paths);
    }
  }

  return paths;
}

async function migrateAssets(urls, folder, resourceType) {
  const results = { succeeded: [], failed: [] };

  for (const [index, url] of urls.entries()) {
    if (isCloudinaryUrl(url)) {
      console.log(`[${index + 1}/${urls.length}] Already on Cloudinary: ${url}`);
      results.succeeded.push({ originalUrl: url, cloudinaryUrl: url });
      continue;
    }

    console.log(`[${index + 1}/${urls.length}] Downloading: ${url}`);

    try {
      const buffer = await downloadFile(url);
      console.log(`  Uploading to Cloudinary (${folder})...`);

      const result = await uploadToCloudinary(buffer, folder, resourceType);

      console.log(`  Uploaded: ${result.secure_url}`);
      results.succeeded.push({
        originalUrl: url,
        cloudinaryUrl: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error(`  FAILED: ${error.message}`);
      results.failed.push({ url, error: error.message });
    }
  }

  return results;
}

function updateUrlsInData(data, urlMap) {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => updateUrlsInData(item, urlMap));
  }

  const updated = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (urlMap.has(trimmed)) {
        updated[key] = urlMap.get(trimmed);
      } else {
        updated[key] = value;
      }
    } else if (typeof value === "object") {
      updated[key] = updateUrlsInData(value, urlMap);
    } else {
      updated[key] = value;
    }
  }

  return updated;
}

async function run() {
  const rootDir = process.cwd();
  const envLocal = readEnvFile(path.join(rootDir, ".env.local"));

  const supabaseUrl =
    envLocal.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    envLocal.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const rowId =
    envLocal.NEXT_PUBLIC_SUPABASE_CONTENT_ROW_ID ||
    process.env.NEXT_PUBLIC_SUPABASE_CONTENT_ROW_ID ||
    "main";

  const cloudinaryCloudName =
    envLocal.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const cloudinaryApiKey =
    envLocal.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const cloudinaryApiSecret =
    envLocal.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials. Check .env.local");
    process.exit(1);
  }

  if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
    console.error(
      "Missing Cloudinary credentials. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local"
    );
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
  });

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  console.log("Fetching portfolio content from Supabase...");
  const { data, error } = await supabase
    .from("portfolio_content")
    .select("*")
    .eq("id", rowId)
    .maybeSingle();

  if (error) {
    console.error(`Failed to fetch data: ${error.message}`);
    process.exit(1);
  }

  if (!data) {
    console.log("No portfolio content found.");
    return;
  }

  const supabaseStorageUrls = extractAssetPaths(data);
  const urlsArray = Array.from(supabaseStorageUrls);

  console.log(`Found ${urlsArray.length} Supabase Storage URLs to migrate.`);

  if (urlsArray.length === 0) {
    console.log("Nothing to migrate. All assets are already on Cloudinary or use local paths.");
    console.log("Migration complete.");
    return;
  }

  urlsArray.forEach((url) => console.log(`  - ${url}`));

  // Separate images and videos by folder
  const imageUrls = urlsArray.filter((url) => {
    const ext = path.extname(url).toLowerCase();
    return [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"].includes(ext);
  });

  const videoUrls = urlsArray.filter((url) => {
    const ext = path.extname(url).toLowerCase();
    return [".mp4", ".webm", ".mov", ".avi"].includes(ext);
  });

  const otherUrls = urlsArray.filter(
    (url) => !imageUrls.includes(url) && !videoUrls.includes(url)
  );

  console.log(`\nClassified: ${imageUrls.length} images, ${videoUrls.length} videos, ${otherUrls.length} other`);

  const allResults = { succeeded: [], failed: [] };

  if (imageUrls.length > 0) {
    console.log("\n--- Migrating Images ---");
    const imageResults = await migrateAssets(imageUrls, "portfolio/images", "image");
    allResults.succeeded.push(...imageResults.succeeded);
    allResults.failed.push(...imageResults.failed);
  }

  if (videoUrls.length > 0) {
    console.log("\n--- Migrating Videos ---");
    const videoResults = await migrateAssets(videoUrls, "portfolio/videos", "video");
    allResults.succeeded.push(...videoResults.succeeded);
    allResults.failed.push(...videoResults.failed);
  }

  if (otherUrls.length > 0) {
    console.log("\n--- Migrating Other Files ---");
    const otherResults = await migrateAssets(otherUrls, "portfolio/other", "auto");
    allResults.succeeded.push(...otherResults.succeeded);
    allResults.failed.push(...otherResults.failed);
  }

  // Build URL mapping
  const urlMap = new Map();
  for (const result of allResults.succeeded) {
    urlMap.set(result.originalUrl, result.cloudinaryUrl);
  }

  // Update data with Cloudinary URLs
  if (urlMap.size > 0) {
    console.log("\n--- Updating Supabase DB with Cloudinary URLs ---");
    const updatedProjects = data.projects
      ? updateUrlsInData(data.projects, urlMap)
      : data.projects;
    const updatedTestimonials = data.testimonials
      ? updateUrlsInData(data.testimonials, urlMap)
      : data.testimonials;
    const updatedExperience = data.experience_entries
      ? updateUrlsInData(data.experience_entries, urlMap)
      : data.experience_entries;

    const payload = {
      id: rowId,
      projects: updatedProjects,
      testimonials: updatedTestimonials,
      updated_at: new Date().toISOString(),
    };

    if (updatedExperience) {
      payload.experience_entries = updatedExperience;
    }

    const { error: updateError } = await supabase
      .from("portfolio_content")
      .upsert(payload, { onConflict: "id" });

    if (updateError) {
      console.error(`Failed to update Supabase DB: ${updateError.message}`);
    } else {
      console.log("Supabase DB updated with Cloudinary URLs.");
    }
  }

  // Summary
  console.log("\n=== Migration Summary ===");
  console.log(`Succeeded: ${allResults.succeeded.length}`);
  console.log(`Failed: ${allResults.failed.length}`);

  if (allResults.failed.length > 0) {
    console.log("\nFailed URLs:");
    allResults.failed.forEach((f) => console.log(`  - ${f.url}: ${f.error}`));
  }

  console.log("\nMigration complete.");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
/**
 * Upload local files from public/ to Cloudinary.
 *
 * This script scans your public/ folder and uploads images/videos to Cloudinary.
 * Then it updates the Supabase database to use Cloudinary URLs.
 *
 * Usage:
 *   node scripts/upload-local-to-cloudinary.js
 */

const fs = require("fs");
const path = require("path");
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

async function uploadToCloudinary(filePath, folder, resourceType) {
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
    fs.createReadStream(filePath).pipe(uploadStream);
  });
}

function getAssetType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if ([".mp4", ".webm", ".mov", ".avi", ".mkv"].includes(ext)) return "video";
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"].includes(ext)) return "image";
  return null;
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
    envLocal.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const cloudinaryApiKey =
    envLocal.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const cloudinaryApiSecret =
    envLocal.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;

  if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
    console.error("Missing Cloudinary credentials in .env.local");
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
  });

  // Scan public/ for images and videos
  const publicDir = path.join(rootDir, "public");
  const files = fs.readdirSync(publicDir);
  const assets = files
    .filter((f) => getAssetType(f) !== null)
    .map((f) => ({
      filename: f,
      filepath: path.join(publicDir, f),
      type: getAssetType(f),
      localUrl: "/" + f,
    }));

  console.log("Found assets in public/:");
  assets.forEach((a) => console.log(`  [${a.type}] ${a.filename}`));

  if (assets.length === 0) {
    console.log("No assets found to upload.");
    return;
  }

  // Upload to Cloudinary
  console.log("\nUploading to Cloudinary...");
  const urlMap = new Map();

  for (const [index, asset] of assets.entries()) {
    const folder = `portfolio/${asset.type}s`;
    const resourceType = asset.type === "video" ? "video" : "image";

    process.stdout.write(`  [${index + 1}/${assets.length}] ${asset.filename}... `);

    try {
      const result = await uploadToCloudinary(asset.filepath, folder, resourceType);
      urlMap.set(asset.localUrl, result.secure_url);
      console.log(`✓ ${result.secure_url}`);
    } catch (error) {
      console.log(`✗ FAILED: ${error.message}`);
    }
  }

  if (urlMap.size === 0) {
    console.log("\nNo files were uploaded.");
    return;
  }

  // Update Supabase DB to use Cloudinary URLs
  if (supabaseUrl && supabaseAnonKey) {
    console.log("\nUpdating Supabase database...");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from("portfolio_content")
      .select("*")
      .eq("id", rowId)
      .maybeSingle();

    if (error) {
      console.error(`Failed to fetch from Supabase: ${error.message}`);
      console.log("Files were uploaded to Cloudinary. You can update the DB later.");
      return;
    }

    if (!data) {
      console.log("No data found in Supabase. Files are on Cloudinary.");
      return;
    }

    // Replace local URLs with Cloudinary URLs
    function replaceUrls(obj) {
      if (!obj || typeof obj !== "object") return obj;
      if (Array.isArray(obj)) return obj.map(replaceUrls);

      const updated = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
          const trimmed = value.trim();
          updated[key] = urlMap.has(trimmed) ? urlMap.get(trimmed) : value;
        } else if (typeof value === "object") {
          updated[key] = replaceUrls(value);
        } else {
          updated[key] = value;
        }
      }
      return updated;
    }

    const payload = {
      id: rowId,
      projects: replaceUrls(data.projects || {}),
      testimonials: replaceUrls(data.testimonials || []),
      updated_at: new Date().toISOString(),
    };

    if (data.experience_entries) {
      payload.experience_entries = replaceUrls(data.experience_entries);
    }

    const { error: updateError } = await supabase
      .from("portfolio_content")
      .upsert(payload, { onConflict: "id" });

    if (updateError) {
      console.error(`Failed to update DB: ${updateError.message}`);
    } else {
      console.log("Supabase DB updated with Cloudinary URLs.");

      // Show what was updated
      console.log("\nURLs mapped:");
      urlMap.forEach((cloudUrl, localUrl) => {
        console.log(`  ${localUrl} → ${cloudUrl}`);
      });
    }
  } else {
    console.log("\nSupabase not configured. Files are on Cloudinary.");
    console.log("Here are the new URLs:");
    urlMap.forEach((cloudUrl, localUrl) => {
      console.log(`  ${localUrl} → ${cloudUrl}`);
    });
  }

  console.log("\nDone!");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
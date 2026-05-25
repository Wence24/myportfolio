/* eslint-disable @typescript-eslint/no-require-imports */

const cloudinary = require("cloudinary").v2;
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
const cloudName =
  envLocal.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey =
  envLocal.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
  process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = envLocal.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;
const shouldDelete = process.argv.includes("--delete-all-videos");

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "Missing Cloudinary config. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local."
  );
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

async function listAllVideos() {
  const videos = [];
  let nextCursor;

  do {
    const response = await cloudinary.api.resources({
      resource_type: "video",
      type: "upload",
      max_results: 500,
      next_cursor: nextCursor,
    });

    videos.push(...(response.resources || []));
    nextCursor = response.next_cursor;
  } while (nextCursor);

  return videos;
}

async function deleteVideos(publicIds) {
  const chunkSize = 100;

  for (let index = 0; index < publicIds.length; index += chunkSize) {
    const chunk = publicIds.slice(index, index + chunkSize);
    const result = await cloudinary.api.delete_resources(chunk, {
      resource_type: "video",
      type: "upload",
      invalidate: true,
    });

    const deletedCount = Object.values(result.deleted || {}).filter(
      (status) => status === "deleted"
    ).length;
    console.log(`Deleted ${deletedCount}/${chunk.length} videos in batch ${index / chunkSize + 1}.`);
  }
}

async function main() {
  const videos = await listAllVideos();
  const publicIds = videos.map((video) => video.public_id).filter(Boolean);

  console.log(`Cloudinary cloud: ${cloudName}`);
  console.log(`Videos found: ${publicIds.length}`);

  publicIds.forEach((publicId, index) => {
    console.log(`  ${index + 1}. ${publicId}`);
  });

  if (!shouldDelete) {
    console.log("\nDry run only. Run with --delete-all-videos to delete these videos.");
    return;
  }

  if (publicIds.length === 0) {
    console.log("Nothing to delete.");
    return;
  }

  await deleteVideos(publicIds);
  console.log("Done deleting Cloudinary videos.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const remoteImagePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "**.supabase.co",
    pathname: "/storage/v1/object/**",
  },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (supabaseUrl) {
  try {
    const parsedSupabaseUrl = new URL(supabaseUrl);

    remoteImagePatterns.push({
      protocol: parsedSupabaseUrl.protocol.replace(":", "") as "http" | "https",
      hostname: parsedSupabaseUrl.hostname,
      pathname: "/storage/v1/object/**",
    });
  } catch {
    // Ignore invalid runtime values and keep the default Supabase allowlist.
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: remoteImagePatterns,
  },
};

export default nextConfig;

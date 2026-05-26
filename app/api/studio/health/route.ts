import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const getJsonByteSize = (value: unknown) =>
  Buffer.byteLength(JSON.stringify(value ?? null), "utf8");

const getCloudinaryUsage = async () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      configured: Boolean(cloudName && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET),
      status: "limited",
      detail: "Upload config found, but Admin API keys are needed for quota usage.",
    };
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  try {
    const usage = (await cloudinary.api.usage()) as {
      storage?: { usage?: number; limit?: number; used_percent?: number };
      bandwidth?: { usage?: number; limit?: number; used_percent?: number };
      credits?: { usage?: number; limit?: number; used_percent?: number };
      objects?: { usage?: number; limit?: number; used_percent?: number };
    };

    return {
      configured: true,
      status: "healthy",
      detail: "Cloudinary Admin API reached.",
      storage: usage.storage || null,
      bandwidth: usage.bandwidth || null,
      credits: usage.credits || null,
      objects: usage.objects || null,
    };
  } catch (error) {
    return {
      configured: true,
      status: "error",
      detail: error instanceof Error ? error.message : "Cloudinary usage check failed.",
    };
  }
};

const getSupabaseUsage = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const contentRowId = process.env.NEXT_PUBLIC_SUPABASE_CONTENT_ROW_ID || "main";
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_ASSET_BUCKET || "portfolio-assets";

  if (!supabaseUrl || !supabaseKey) {
    return {
      configured: false,
      status: "missing",
      detail: "Supabase URL or key is missing.",
      bucket,
    };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase
      .from("portfolio_content")
      .select("*")
      .eq("id", contentRowId)
      .maybeSingle();

    if (error) {
      return {
        configured: true,
        status: "error",
        detail: error.message,
        bucket,
      };
    }

    return {
      configured: true,
      status: data ? "healthy" : "limited",
      detail: data ? `Content row ${contentRowId} reached.` : `Content row ${contentRowId} not found.`,
      bucket,
      contentBytes: getJsonByteSize(data),
      updatedAt: data?.updated_at || null,
    };
  } catch (error) {
    return {
      configured: true,
      status: "error",
      detail: error instanceof Error ? error.message : "Supabase health check failed.",
      bucket,
    };
  }
};

export async function GET() {
  const [cloudinaryUsage, supabaseUsage] = await Promise.all([
    getCloudinaryUsage(),
    getSupabaseUsage(),
  ]);

  return Response.json(
    {
      checkedAt: new Date().toISOString(),
      cloudinary: cloudinaryUsage,
      supabase: supabaseUsage,
      website: {
        status:
          cloudinaryUsage.status !== "error" && supabaseUsage.status !== "error"
            ? "healthy"
            : "attention",
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

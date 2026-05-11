export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

  return Response.json(
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      supabaseContentRowId:
        process.env.NEXT_PUBLIC_SUPABASE_CONTENT_ROW_ID || "main",
      supabaseAssetBucket:
        process.env.NEXT_PUBLIC_SUPABASE_ASSET_BUCKET || "portfolio-assets",
      supabaseConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
      cloudinaryCloudName,
      cloudinaryUploadPreset,
      cloudinaryConfigured: Boolean(cloudinaryCloudName && cloudinaryUploadPreset),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { configureCloudinaryFromEnv } from "@/lib/cloudinary";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const config = configureCloudinaryFromEnv();
    if (!config) {
      return NextResponse.json(
        { error: "Cloudinary is not configured on the server." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "portfolio";
    const resourceType = (formData.get("resourceType") as "image" | "video" | "auto") || "auto";

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    return new Promise<NextResponse>((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            resolve(
              NextResponse.json(
                { error: error.message || "Cloudinary upload failed." },
                { status: 500 }
              )
            );
            return;
          }

          if (!result) {
            resolve(
              NextResponse.json(
                { error: "Cloudinary upload returned no result." },
                { status: 500 }
              )
            );
            return;
          }

          resolve(
            NextResponse.json({
              url: result.secure_url || result.url,
              publicId: result.public_id,
              secure_url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            })
          );
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Cloudinary upload failed unexpectedly.",
      },
      { status: 500 }
    );
  }
}
import { v2 as cloudinary } from "cloudinary";

export type CloudinaryUploadResult = {
  url: string;
  publicId: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

export const configureCloudinaryFromEnv = () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return { cloudName, apiKey, apiSecret };
};

export const getCloudinaryConfig = () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  return {
    cloudName: cloudName || "",
    uploadPreset: uploadPreset || "",
    isConfigured: !!(cloudName && uploadPreset),
  };
};

export const uploadToCloudinaryFromServer = async (
  fileBuffer: Buffer,
  folder: string,
  options?: {
    publicId?: string;
    resourceType?: "image" | "video" | "auto";
    eager?: string;
  }
): Promise<CloudinaryUploadResult> => {
  const config = configureCloudinaryFromEnv();
  if (!config) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment."
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: options?.resourceType || "auto",
        public_id: options?.publicId,
        eager: options?.eager,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(new Error(error.message || "Cloudinary upload failed."));
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload returned no result."));
          return;
        }

        resolve({
          url: result.secure_url || result.url,
          publicId: result.public_id,
          secure_url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType?: "image" | "video" | "raw"
): Promise<boolean> => {
  const config = configureCloudinaryFromEnv();
  if (!config) {
    throw new Error("Cloudinary is not configured.");
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || "image",
    });

    return result.result === "ok";
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
    return false;
  }
};
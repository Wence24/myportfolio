export const getCloudinaryConfig = () => {
  const cloudName =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) || "";
  const uploadPreset =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) || "";

  return {
    cloudName,
    uploadPreset,
    isConfigured: !!(cloudName && uploadPreset),
  };
};
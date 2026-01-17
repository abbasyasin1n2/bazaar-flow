import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Upload image to Cloudinary
export async function uploadImage(file, folder = "bazaarflow") {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: "auto",
    });
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Delete image from Cloudinary
export async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === "ok",
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Delete multiple images from Cloudinary
export async function deleteImages(publicIds) {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error("Cloudinary delete multiple error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

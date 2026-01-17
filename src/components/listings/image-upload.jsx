"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Upload, X, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_IMAGES_PER_LISTING, MAX_IMAGE_SIZE } from "@/lib/constants";

export function ImageUpload({ images = [], onChange, maxImages = MAX_IMAGES_PER_LISTING }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setError("");

      if (images.length + acceptedFiles.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      setUploading(true);

      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          // Validate file size
          if (file.size > MAX_IMAGE_SIZE) {
            throw new Error(`File ${file.name} is too large. Max size is 5MB.`);
          }

          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Upload failed");
          }

          return response.json();
        });

        const results = await Promise.all(uploadPromises);
        const newImages = results.map((result) => ({
          url: result.url,
          publicId: result.publicId,
        }));

        onChange([...images, ...newImages]);
      } catch (err) {
        setError(err.message);
      } finally {
        setUploading(false);
      }
    },
    [images, onChange, maxImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: maxImages - images.length,
    disabled: uploading || images.length >= maxImages,
  });

  const removeImage = async (index) => {
    const imageToRemove = images[index];
    
    // Optionally delete from Cloudinary
    if (imageToRemove.publicId) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: imageToRemove.publicId }),
        });
      } catch (err) {
        console.error("Failed to delete image:", err);
      }
    }

    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          uploading && "opacity-50 cursor-not-allowed",
          images.length >= maxImages && "opacity-50 cursor-not-allowed",
          !isDragActive && !uploading && images.length < maxImages && "hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">
                {isDragActive ? "Drop images here" : "Drag & drop images here"}
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse (max {maxImages} images, 5MB each)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.filter((img) => img.url).map((image, index) => (
            <div
              key={image.publicId || index}
              className="relative group aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <Image
                src={image.url}
                alt={`Upload ${index + 1}`}
                fill                sizes="150px"                className="object-cover"
              />
              
              {/* First image badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Cover
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index > 0 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => moveImage(index, 0)}
                    title="Make cover image"
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image count */}
      <p className="text-xs text-muted-foreground text-right">
        {images.length} / {maxImages} images
      </p>
    </div>
  );
}

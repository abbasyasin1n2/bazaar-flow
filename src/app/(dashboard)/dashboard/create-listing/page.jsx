"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { 
  Loader2, 
  ArrowLeft, 
  Save, 
  Eye,
  Laptop,
  Shirt,
  Home,
  Car,
  Palette,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Gem,
  Package,
} from "lucide-react";

// Map icon names to components
const iconMap = {
  Laptop,
  Shirt,
  Home,
  Car,
  Palette,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Gem,
  Package,
};
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/listings/image-upload";
import { useSweetAlert } from "@/hooks/use-sweet-alert";
import { CATEGORIES } from "@/lib/constants";
import Link from "next/link";

export default function CreateListingPage() {
  const router = useRouter();
  const { showSuccess, showError } = useSweetAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [hasBuyNow, setHasBuyNow] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      startingPrice: "",
      buyNowPrice: "",
    },
  });

  const watchCategory = watch("category");

  const onSubmit = async (data) => {
    if (images.length === 0) {
      showError("Images Required", "Please upload at least one image");
      return;
    }

    setIsSubmitting(true);

    try {
      const listingData = {
        ...data,
        startingPrice: parseFloat(data.startingPrice),
        buyNowPrice: hasBuyNow && data.buyNowPrice ? parseFloat(data.buyNowPrice) : null,
        images,
      };

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create listing");
      }

      showSuccess("Listing Created!", "Your listing is now live on the marketplace.");
      router.push(`/listings/${result.listing._id}`);
    } catch (error) {
      showError("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Listing</h1>
          <p className="text-muted-foreground">
            Fill in the details to list your item for bidding
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>
                Add up to 5 photos. The first image will be the cover.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload images={images} onChange={setImages} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide details about your item
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., iPhone 15 Pro Max 256GB - Like New"
                  {...register("title", {
                    required: "Title is required",
                    minLength: { value: 10, message: "Title must be at least 10 characters" },
                    maxLength: { value: 100, message: "Title must be less than 100 characters" },
                  })}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={watchCategory}
                  onValueChange={(value) => setValue("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => {
                      const IconComponent = iconMap[category.icon] || Package;
                      return (
                        <SelectItem key={category.value} value={category.value}>
                          <span className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <span>{category.label}</span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  {...register("category", { required: "Category is required" })}
                />
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item in detail. Include condition, features, what's included, etc."
                  rows={6}
                  {...register("description", {
                    required: "Description is required",
                    minLength: { value: 30, message: "Description must be at least 30 characters" },
                  })}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Set your starting price and optional Buy Now price
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Starting Price */}
              <div className="space-y-2">
                <Label htmlFor="startingPrice">Starting Price (৳) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ৳
                  </span>
                  <Input
                    id="startingPrice"
                    type="number"
                    placeholder="1000"
                    className="pl-8"
                    {...register("startingPrice", {
                      required: "Starting price is required",
                      min: { value: 1, message: "Price must be at least ৳1" },
                    })}
                  />
                </div>
                {errors.startingPrice && (
                  <p className="text-sm text-destructive">{errors.startingPrice.message}</p>
                )}
              </div>

              {/* Buy Now Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Enable Buy Now</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow buyers to purchase immediately at a fixed price
                  </p>
                </div>
                <Switch
                  checked={hasBuyNow}
                  onCheckedChange={setHasBuyNow}
                />
              </div>

              {/* Buy Now Price */}
              {hasBuyNow && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="buyNowPrice">Buy Now Price (৳)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ৳
                    </span>
                    <Input
                      id="buyNowPrice"
                      type="number"
                      placeholder="5000"
                      className="pl-8"
                      {...register("buyNowPrice", {
                        min: { value: 1, message: "Price must be at least ৳1" },
                      })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Should be higher than the starting price
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Submit Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 justify-end"
        >
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Listing
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}

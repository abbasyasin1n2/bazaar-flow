"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/listings/image-upload";
import { CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [images, setImages] = useState([]);
  const [enableBuyNow, setEnableBuyNow] = useState(false);
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const category = watch("category");

  // Fetch listing data
  useEffect(() => {
    async function fetchListing() {
      try {
        const response = await fetch(`/api/listings/${params.id}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error || "Failed to load listing");
          return;
        }

        const listingData = data.listing;

        // Check if current user owns this listing
        if (session && listingData.sellerId !== session.user.id) {
          setError("You can only edit your own listings");
          return;
        }

        setListing(listingData);
        setImages(listingData.images || []);
        setEnableBuyNow(!!listingData.buyNowPrice);

        // Reset form with listing data
        reset({
          title: listingData.title,
          description: listingData.description,
          category: listingData.category,
          startingPrice: listingData.startingPrice,
          buyNowPrice: listingData.buyNowPrice || "",
        });
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError("Failed to load listing");
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated" && params.id) {
      fetchListing();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [params.id, session, status, reset, router]);

  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/listings/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          buyNowPrice: enableBuyNow ? parseFloat(data.buyNowPrice) : null,
          images,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Listing updated successfully!");
        router.push("/dashboard/my-listings");
      } else {
        toast.error(result.error || "Failed to update listing");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/listings/${params.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Listing deleted successfully!");
        router.push("/dashboard/my-listings");
      } else {
        toast.error(result.error || "Failed to delete listing");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">{error}</h2>
        <Button asChild variant="outline">
          <Link href="/dashboard/my-listings">Back to My Listings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/my-listings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Listing</h1>
            <p className="text-muted-foreground">
              Update your listing details
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={deleting}>
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Listing
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                listing and all associated bids.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Details */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Listing Details</CardTitle>
                  <CardDescription>
                    Update the basic information about your item
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter a descriptive title"
                      {...register("title", {
                        required: "Title is required",
                        minLength: {
                          value: 10,
                          message: "Title must be at least 10 characters",
                        },
                        maxLength: {
                          value: 100,
                          message: "Title must be less than 100 characters",
                        },
                      })}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={category}
                      onValueChange={(value) => setValue("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <span className="flex items-center gap-2">
                              <cat.icon className="h-4 w-4" />
                              {cat.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      {...register("category", {
                        required: "Category is required",
                      })}
                    />
                    {errors.category && (
                      <p className="text-sm text-destructive">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your item in detail..."
                      className="min-h-[150px] resize-none"
                      {...register("description", {
                        required: "Description is required",
                        minLength: {
                          value: 30,
                          message: "Description must be at least 30 characters",
                        },
                      })}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>
                    Update the pricing for your auction
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Starting Price */}
                  <div className="space-y-2">
                    <Label htmlFor="startingPrice">Starting Price (৳) *</Label>
                    <Input
                      id="startingPrice"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="0"
                      {...register("startingPrice", {
                        required: "Starting price is required",
                        min: {
                          value: 1,
                          message: "Starting price must be at least ৳1",
                        },
                      })}
                    />
                    {errors.startingPrice && (
                      <p className="text-sm text-destructive">
                        {errors.startingPrice.message}
                      </p>
                    )}
                  </div>

                  {/* Buy Now Toggle */}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableBuyNow">Enable Buy Now</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow buyers to purchase immediately
                      </p>
                    </div>
                    <Switch
                      id="enableBuyNow"
                      checked={enableBuyNow}
                      onCheckedChange={setEnableBuyNow}
                    />
                  </div>

                  {/* Buy Now Price */}
                  {enableBuyNow && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="buyNowPrice">Buy Now Price (৳) *</Label>
                      <Input
                        id="buyNowPrice"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="0"
                        {...register("buyNowPrice", {
                          required: enableBuyNow
                            ? "Buy now price is required"
                            : false,
                          min: {
                            value: 1,
                            message: "Buy now price must be at least ৳1",
                          },
                        })}
                      />
                      {errors.buyNowPrice && (
                        <p className="text-sm text-destructive">
                          {errors.buyNowPrice.message}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Should be higher than the starting price
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <CardDescription>
                  Update photos of your item (max 6 images)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  maxImages={6}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex justify-end gap-4"
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}

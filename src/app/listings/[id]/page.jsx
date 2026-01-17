"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { 
  ArrowLeft, 
  Tag, 
  Eye, 
  Clock, 
  Share2, 
  Heart,
  CheckCircle2,
  AlertTriangle,
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
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ImageGallery, 
  BidForm, 
  BuyNowCard, 
  BidHistory, 
  SellerInfo 
} from "@/components/listing-detail";
import { CATEGORIES, LISTING_STATUS, formatCurrency } from "@/lib/constants";
import { useSweetAlert } from "@/hooks/use-sweet-alert";

function ListingDetailContent({ id }) {
  const { data: session } = useSession();
  const { showSuccess } = useSweetAlert();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch listing");
        }

        setListing(data.listing);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: listing.title,
        text: `Check out this listing: ${listing.title}`,
        url: window.location.href,
      });
    } catch {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      showSuccess("Link Copied!", "Listing link copied to clipboard");
    }
  };

  const handleWishlist = async () => {
    if (!session) {
      showSuccess(
        "Sign in Required",
        "Please sign in to add items to your wishlist"
      );
      return;
    }

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?listingId=${listing._id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        
        if (data.success) {
          setIsWishlisted(false);
          showSuccess(
            "Removed from Wishlist",
            "This item has been removed from your wishlist"
          );
        }
      } else {
        // Add to wishlist
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: listing._id }),
        });
        const data = await response.json();
        
        if (data.success) {
          setIsWishlisted(true);
          showSuccess(
            "Added to Wishlist",
            "You'll be notified about updates to this listing"
          );
        }
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      showSuccess("Error", "Failed to update wishlist");
    }
  };

  const handleBidPlaced = (newBid) => {
    setListing((prev) => ({
      ...prev,
      currentBid: newBid.amount,
      bidCount: (prev.bidCount || 0) + 1,
      bids: [newBid, ...(prev.bids || [])],
    }));
  };

  if (loading) {
    return <ListingDetailSkeleton />;
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Listing Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "This listing doesn't exist or has been removed."}
          </p>
          <Button asChild>
            <Link href="/listings">Browse Listings</Link>
          </Button>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.value === listing.category);
  const isActive = listing.status === LISTING_STATUS.ACTIVE;

  // Mock seller data (would come from API in real app)
  const sellerData = {
    id: listing.sellerId,
    name: listing.sellerName,
    rating: 4.8,
    reviewCount: 127,
    joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    totalSales: 89,
    verified: true,
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      {/* Breadcrumb */}
      <motion.nav 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
      >
        <Button variant="ghost" size="sm" asChild>
          <Link href="/listings" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Listings
          </Link>
        </Button>
        <span>/</span>
        <Link href={`/listings?category=${listing.category}`} className="hover:text-foreground transition-colors">
          {category?.label || listing.category}
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[200px]">{listing.title}</span>
      </motion.nav>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ImageGallery images={listing.images} title={listing.title} />
        </motion.div>

        {/* Right Column - Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Status Badge */}
          {!isActive && (
            <Badge variant="destructive" className="text-sm">
              {listing.status === LISTING_STATUS.SOLD ? "Sold" : "Listing Ended"}
            </Badge>
          )}

          {/* Title & Category */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                {category?.icon && (() => {
                  const IconComponent = iconMap[category.icon] || Package;
                  return <IconComponent className="h-3 w-3" />;
                })()}
                {category?.label || listing.category}
              </Badge>
              {isActive && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{listing.title}</h1>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Listed {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {listing.views || Math.floor(Math.random() * 500) + 50} views
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleWishlist}
              className={isWishlisted ? "text-red-500 border-red-500" : ""}
            >
              <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? "fill-red-500" : ""}`} />
              {isWishlisted ? "Saved" : "Save"}
            </Button>
          </div>

          {/* Buy Now Card */}
          {isActive && <BuyNowCard listing={listing} />}

          {/* Bid Form */}
          {isActive && (
            <BidForm 
              listing={listing} 
              onBidPlaced={handleBidPlaced}
            />
          )}
        </motion.div>
      </div>

      {/* Bottom Section - Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12"
      >
        <Tabs defaultValue="description" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 h-auto">
            <TabsTrigger value="description" className="py-3">
              Description
            </TabsTrigger>
            <TabsTrigger value="bids" className="py-3">
              Bids ({listing.bidCount || 0})
            </TabsTrigger>
            <TabsTrigger value="seller" className="py-3">
              Seller
            </TabsTrigger>
          </TabsList>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TabsContent value="description" className="mt-0">
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">About This Item</h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {listing.description}
                    </p>
                  </div>

                  {/* Item Details */}
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-4">Item Details</h3>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Category</dt>
                        <dd className="font-medium">{category?.label}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Condition</dt>
                        <dd className="font-medium">Used - Excellent</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Starting Price</dt>
                        <dd className="font-medium">{formatCurrency(listing.startingPrice)}</dd>
                      </div>
                      {listing.buyNowPrice && (
                        <div>
                          <dt className="text-muted-foreground">Buy Now Price</dt>
                          <dd className="font-medium text-green-600">{formatCurrency(listing.buyNowPrice)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bids" className="mt-0">
                <BidHistory 
                  bids={listing.bids || []} 
                  currentUserId={session?.user?.id}
                />
              </TabsContent>

              <TabsContent value="seller" className="mt-0">
                <SellerInfo seller={sellerData} listingId={listing._id} />
              </TabsContent>
            </div>

            {/* Sidebar - Quick Info */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border p-6 sticky top-24 space-y-4">
                <h3 className="font-semibold">Price Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Starting Price</span>
                    <span className="font-medium">{formatCurrency(listing.startingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Bid</span>
                    <span className="font-bold text-primary">
                      {listing.currentBid ? formatCurrency(listing.currentBid) : "No bids"}
                    </span>
                  </div>
                  {listing.buyNowPrice && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buy Now</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(listing.buyNowPrice)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Bids</span>
                    <span className="font-medium">{listing.bidCount || 0}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span>Seller chooses the winning bid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tabs>
      </motion.div>
    </div>
  );
}

function ListingDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid lg:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function ListingDetailPage({ params }) {
  const { id } = use(params);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <ListingDetailContent id={id} />
      </main>
      <Footer />
    </div>
  );
}

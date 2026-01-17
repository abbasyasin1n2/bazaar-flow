"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ExternalLink, Loader2, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/constants";
import { toast } from "sonner";

export default function WishlistPage() {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist");
      const data = await response.json();

      if (data.success) {
        setWishlist(data.wishlist);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (listingId) => {
    try {
      const response = await fetch(`/api/wishlist?listingId=${listingId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setWishlist(wishlist.filter((item) => item._id !== listingId));
        toast.success("Removed from wishlist");
      } else {
        toast.error(data.error || "Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Heart className="h-6 w-6" />
          My Wishlist
        </h2>
        <p className="text-muted-foreground">
          Items you&apos;ve saved for later.
        </p>
      </motion.div>

      {wishlist.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground text-center mb-4">
              Browse listings and click the heart icon to save items for later.
            </p>
            <Button asChild>
              <Link href="/listings">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Listings
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden group">
                <div className="aspect-video relative bg-muted">
                  {item.images?.[0]?.url ? (
                    <Image
                      src={item.images[0].url}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <Badge
                    className="absolute top-2 right-2"
                    variant={item.status === "active" ? "default" : "secondary"}
                  >
                    {item.status === "active" ? "Active" : "Sold"}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate mb-1">{item.title}</h3>
                  <p className="text-lg font-bold text-primary mb-3">
                    {formatCurrency(item.currentBid || item.startingPrice)}
                  </p>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/listings/${item._id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromWishlist(item._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

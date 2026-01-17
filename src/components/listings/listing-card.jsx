"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, timeAgo } from "@/lib/constants";
import { truncateText } from "@/lib/utils";
import { Gavel, ShoppingCart, ImageIcon, Eye } from "lucide-react";

export function ListingCard({ listing }) {
  const {
    _id,
    title,
    description,
    category,
    startingPrice,
    buyNowPrice,
    currentBid,
    bidCount,
    images,
    sellerName,
    createdAt,
  } = listing;

  const displayPrice = currentBid || startingPrice;
  const hasImage = images && images.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/listings/${_id}`}>
        <Card className="h-full overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            {hasImage ? (
              <Image
                src={images[0].url}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
            
            {/* Category Badge */}
            <Badge 
              variant="secondary" 
              className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm"
            >
              {category}
            </Badge>

            {/* Buy Now Badge */}
            {buyNowPrice && (
              <Badge 
                className="absolute top-3 right-3 bg-green-500 hover:bg-green-600"
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Buy Now
              </Badge>
            )}
          </div>

          <CardContent className="p-4">
            {/* Title */}
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {truncateText(description, 80)}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(displayPrice)}
              </span>
              {currentBid && (
                <span className="text-xs text-muted-foreground">current bid</span>
              )}
            </div>

            {/* Buy Now Price */}
            {buyNowPrice && (
              <p className="text-sm text-muted-foreground mt-1">
                Buy Now: {formatCurrency(buyNowPrice)}
              </p>
            )}
          </CardContent>

          <CardFooter className="px-4 py-3 border-t bg-muted/30 flex items-center justify-between">
            {/* Bid Count */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Gavel className="h-4 w-4" />
              <span>{bidCount} {bidCount === 1 ? "bid" : "bids"}</span>
            </div>

            {/* Time */}
            <span className="text-xs text-muted-foreground">
              {timeAgo(createdAt)}
            </span>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}

// Skeleton loader for listing card
export function ListingCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <Skeleton className="h-8 w-1/3" />
      </CardContent>
      <CardFooter className="px-4 py-3 border-t">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20 ml-auto" />
      </CardFooter>
    </Card>
  );
}

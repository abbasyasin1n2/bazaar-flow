"use client";

import { ListingCard, ListingCardSkeleton } from "./listing-card";
import { motion } from "motion/react";
import { Package } from "lucide-react";

export function ListingsGrid({ listings, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No listings found</h3>
        <p className="text-muted-foreground max-w-md">
          There are no listings matching your criteria. Try adjusting your filters or check back later.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing, index) => (
        <motion.div
          key={listing._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <ListingCard listing={listing} />
        </motion.div>
      ))}
    </div>
  );
}

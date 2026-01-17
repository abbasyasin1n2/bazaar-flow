"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingBag, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSweetAlert } from "@/hooks/use-sweet-alert";
import { formatCurrency } from "@/lib/constants";
import { useState } from "react";

export function BuyNowCard({ listing }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { showConfirm, showSuccess, showError } = useSweetAlert();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!listing.buyNowPrice) return null;

  const savings = listing.currentBid 
    ? listing.buyNowPrice - listing.currentBid 
    : listing.buyNowPrice - listing.startingPrice;

  const handleBuyNow = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.id === listing.sellerId) {
      showError("Not Allowed", "You cannot buy your own listing");
      return;
    }

    const confirmed = await showConfirm(
      "Confirm Purchase",
      `You are about to purchase "${listing.title}" for ${formatCurrency(listing.buyNowPrice)}. This will end the auction immediately.`
    );

    if (!confirmed) return;

    setIsProcessing(true);

    try {
      const response = await fetch("/api/listings/buy-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete purchase");
      }

      showSuccess(
        "Purchase Complete!",
        "Congratulations! The seller will be notified to complete the transaction."
      );

      router.refresh();
    } catch (err) {
      showError("Purchase Failed", err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-2 border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Buy It Now</CardTitle>
              <CardDescription>Skip the bidding, buy instantly</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            Instant
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(listing.buyNowPrice)}
          </span>
          {listing.currentBid && savings > 0 && (
            <span className="text-sm text-muted-foreground">
              {formatCurrency(savings)} more than top bid
            </span>
          )}
        </div>

        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-white" 
          size="lg"
          onClick={handleBuyNow}
          disabled={isProcessing || session?.user?.id === listing.sellerId}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Buy Now for {formatCurrency(listing.buyNowPrice)}
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Secure purchase • Ends auction immediately
        </p>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Gavel, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSweetAlert } from "@/hooks/use-sweet-alert";
import { formatCurrency } from "@/lib/constants";

export function BidForm({ listing, onBidPlaced }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { showSuccess, showError } = useSweetAlert();
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const minimumBid = listing.currentBid 
    ? listing.currentBid + 1 
    : listing.startingPrice;

  const suggestedBids = [
    minimumBid,
    Math.ceil(minimumBid * 1.1),
    Math.ceil(minimumBid * 1.25),
  ];

  const handleBidClick = (amount) => {
    setBidAmount(amount.toString());
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!session) {
      router.push("/login");
      return;
    }

    const amount = parseFloat(bidAmount);

    if (isNaN(amount) || amount < minimumBid) {
      setError(`Minimum bid is ${formatCurrency(minimumBid)}`);
      return;
    }

    if (session.user.id === listing.sellerId) {
      setError("You cannot bid on your own listing");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing._id,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place bid");
      }

      showSuccess(
        "Bid Placed!",
        `Your bid of ${formatCurrency(amount)} has been placed successfully.`
      );

      setBidAmount("");
      if (onBidPlaced) {
        onBidPlaced(data.bid);
      }
    } catch (err) {
      showError("Bid Failed", err.message);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwnListing = session?.user?.id === listing.sellerId;

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Gavel className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Place Your Bid</CardTitle>
            <CardDescription>
              {listing.bidCount > 0 
                ? `${listing.bidCount} bid${listing.bidCount > 1 ? 's' : ''} so far` 
                : "Be the first to bid!"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Bid Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Current Bid</span>
            <span className="text-2xl font-bold text-primary">
              {listing.currentBid ? formatCurrency(listing.currentBid) : "No bids yet"}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Starting Price</span>
            <span className="font-medium">{formatCurrency(listing.startingPrice)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Minimum Bid
            </span>
            <span className="font-medium text-primary">{formatCurrency(minimumBid)}</span>
          </div>
        </div>

        {isOwnListing ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is your listing. You cannot bid on your own items.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Bid Buttons */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Quick Bid</Label>
              <div className="grid grid-cols-3 gap-2">
                {suggestedBids.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={bidAmount === amount.toString() ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleBidClick(amount)}
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Bid Input */}
            <div className="space-y-2">
              <Label htmlFor="bidAmount">Or enter custom amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="bidAmount"
                  type="number"
                  placeholder={minimumBid.toString()}
                  value={bidAmount}
                  onChange={(e) => {
                    setBidAmount(e.target.value);
                    setError("");
                  }}
                  className="pl-8"
                  min={minimumBid}
                  step="1"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isSubmitting || !bidAmount}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Placing Bid...
                </>
              ) : (
                <>
                  <Gavel className="h-4 w-4 mr-2" />
                  Place Bid {bidAmount && `of ${formatCurrency(parseFloat(bidAmount))}`}
                </>
              )}
            </Button>
          </form>
        )}

        {/* Info Note */}
        <p className="text-xs text-muted-foreground text-center">
          The seller will review all bids and choose the winning offer. 
          No time limit – the seller decides when to accept.
        </p>
      </CardContent>
    </Card>
  );
}

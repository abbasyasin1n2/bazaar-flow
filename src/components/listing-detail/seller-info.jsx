"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Star, Calendar, MessageCircle, Shield, BadgeCheck, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function SellerInfo({ seller = {}, listingId }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [startingChat, setStartingChat] = useState(false);
  
  const {
    id: sellerId,
    name = "Unknown Seller",
    avatar,
    rating = 0,
    reviewCount = 0,
    joinedAt = new Date(),
    totalSales = 0,
    verified = false,
  } = seller;

  const isOwnListing = session?.user?.id === sellerId;

  const handleStartConversation = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (isOwnListing) {
      toast.error("You cannot message yourself");
      return;
    }

    setStartingChat(true);

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: sellerId,
          listingId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/dashboard/messages?listingId=${listingId}`);
      } else {
        toast.error(data.error || "Failed to start conversation");
      }
    } catch (error) {
      console.error("Start conversation error:", error);
      toast.error("Failed to start conversation");
    } finally {
      setStartingChat(false);
    }
  };

  const ratingPercentage = (rating / 5) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Seller Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatar} />
            <AvatarFallback className="text-xl">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{name}</h3>
              {verified && (
                <BadgeCheck className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= rating 
                        ? "text-yellow-500 fill-yellow-500" 
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {rating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Member since</span>
            </div>
            <span className="font-medium text-sm">
              {formatDistanceToNow(new Date(joinedAt), { addSuffix: false })}
            </span>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Shield className="h-4 w-4" />
              <span className="text-xs">Completed sales</span>
            </div>
            <span className="font-medium text-sm">{totalSales}</span>
          </div>
        </div>

        {verified && (
          <Badge variant="secondary" className="w-full justify-center py-2">
            <Shield className="h-4 w-4 mr-2" />
            Verified Seller
          </Badge>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" asChild>
            <Link href={`/seller/${seller.id || 'demo'}`}>
              View Profile
            </Link>
          </Button>
          {!isOwnListing && (
            <Button 
              variant="default" 
              className="flex-1" 
              onClick={handleStartConversation}
              disabled={startingChat}
            >
              {startingChat ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4 mr-2" />
              )}
              Message
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

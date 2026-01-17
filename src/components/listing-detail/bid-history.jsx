"use client";

import { formatDistanceToNow } from "date-fns";
import { User, Trophy, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BidHistory({ bids = [], currentUserId }) {
  if (bids.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Bid History
          </CardTitle>
          <CardDescription>No bids have been placed yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Trophy className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p>Be the first to place a bid!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Bid History
        </CardTitle>
        <CardDescription>{bids.length} bid{bids.length > 1 ? 's' : ''} placed</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {bids.map((bid, index) => {
              const isTopBid = index === 0;
              const isCurrentUser = bid.bidderId === currentUserId;

              return (
                <div
                  key={bid._id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-colors",
                    isTopBid 
                      ? "bg-primary/10 border border-primary/20" 
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={bid.bidderAvatar} />
                        <AvatarFallback>
                          {bid.bidderName?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {isTopBid && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Trophy className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isCurrentUser ? "You" : bid.bidderName || "Anonymous"}
                        </span>
                        {isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">
                            Your bid
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "font-bold",
                      isTopBid ? "text-primary text-lg" : "text-foreground"
                    )}>
                      {formatCurrency(bid.amount)}
                    </span>
                    {isTopBid && (
                      <p className="text-xs text-primary">Highest bid</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

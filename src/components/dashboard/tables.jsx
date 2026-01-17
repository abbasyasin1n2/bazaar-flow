"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, LISTING_STATUS } from "@/lib/constants";

export function RecentListingsTable({ listings = [] }) {
  const getStatusBadge = (status) => {
    const variants = {
      [LISTING_STATUS.ACTIVE]: { variant: "default", className: "bg-green-500" },
      [LISTING_STATUS.SOLD]: { variant: "secondary", className: "bg-blue-500 text-white" },
      [LISTING_STATUS.CLOSED]: { variant: "outline", className: "" },
      [LISTING_STATUS.DRAFT]: { variant: "secondary", className: "" },
    };
    const config = variants[status] || variants[LISTING_STATUS.DRAFT];
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  // Use actual listings data (no demo data for new users)
  const displayListings = listings;

  if (displayListings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Listings</CardTitle>
          <CardDescription>Your latest marketplace listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No listings yet. Create your first listing to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Listings</CardTitle>
          <CardDescription>Your latest marketplace listings</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/listings">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden sm:table-cell">Bids</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayListings.map((listing) => (
              <TableRow key={listing._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
                      {listing.images?.[0]?.url && (
                        <Image
                          src={listing.images[0].url}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[200px]">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div>
                    <p className="font-medium">{formatCurrency(listing.currentBid || listing.startingPrice)}</p>
                    {listing.currentBid && (
                      <p className="text-xs text-muted-foreground">
                        from {formatCurrency(listing.startingPrice)}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="secondary">{listing.bidCount} bids</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(listing.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/listings/${listing._id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/listings/${listing._id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function RecentBidsTable({ bids = [] }) {
  // Use actual bids data (no demo data for new users)
  const displayBids = bids;

  const getStatusBadge = (status) => {
    const config = {
      pending: { icon: null, label: "Pending", className: "bg-yellow-500 text-white" },
      accepted: { icon: CheckCircle, label: "Accepted", className: "bg-green-500 text-white" },
      rejected: { icon: XCircle, label: "Rejected", className: "bg-red-500 text-white" },
      outbid: { icon: null, label: "Outbid", className: "bg-orange-500 text-white" },
    };
    const { icon: Icon, label, className } = config[status] || config.pending;
    return (
      <Badge className={className}>
        {Icon && <Icon className="mr-1 h-3 w-3" />}
        {label}
      </Badge>
    );
  };

  if (displayBids.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Bids</CardTitle>
          <CardDescription>Bids you've placed on items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No bids yet. Browse listings and start bidding!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Bids</CardTitle>
          <CardDescription>Bids you've placed on items</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/bids">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Your Bid</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayBids.map((bid) => (
              <TableRow key={bid._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-muted">
                      {bid.listingImage && (
                        <Image
                          src={bid.listingImage}
                          alt={bid.listingTitle}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[150px]">{bid.listingTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(bid.amount)}</TableCell>
                <TableCell>{getStatusBadge(bid.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

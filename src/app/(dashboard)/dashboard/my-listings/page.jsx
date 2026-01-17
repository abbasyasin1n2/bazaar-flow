"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Loader2,
  Package,
  Filter,
  MoreHorizontal,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, LISTING_STATUS, CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";

export default function MyListingsPage() {
  const { data: session, status } = useSession();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchListings() {
      if (!session?.user?.id) return;

      try {
        const params = new URLSearchParams({
          sellerId: session.user.id,
        });

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }

        const response = await fetch(`/api/listings?${params}`);
        const data = await response.json();

        if (data.success) {
          setListings(data.listings);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast.error("Failed to load listings");
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchListings();
    }
  }, [session, status, searchQuery, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/listings/${deleteId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setListings(listings.filter((l) => l._id !== deleteId));
        toast.success("Listing deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete listing");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const getStatusBadge = (listing) => {
    const status = listing.status;
    const variants = {
      [LISTING_STATUS.ACTIVE]: "default",
      [LISTING_STATUS.PENDING]: "secondary",
      [LISTING_STATUS.SOLD]: "success",
      [LISTING_STATUS.CLOSED]: "destructive",
    };

    // Show sold type if sold
    if (status === LISTING_STATUS.SOLD) {
      const soldType = listing.soldType;
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="success">Sold</Badge>
          <Badge variant="outline" className="text-xs">
            {soldType === "buy_now" || soldType === "buy-now" ? "Buy Now" : "Auction"}
          </Badge>
        </div>
      );
    }

    const labels = {
      [LISTING_STATUS.ACTIVE]: "Active",
      [LISTING_STATUS.PENDING]: "Pending",
      [LISTING_STATUS.SOLD]: "Sold",
      [LISTING_STATUS.CLOSED]: "Closed",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getCategoryLabel = (value) => {
    const cat = CATEGORIES.find((c) => c.value === value);
    return cat ? cat.label : value;
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Listings</h1>
          <p className="text-muted-foreground">
            Manage your auction listings
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/create-listing">
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={LISTING_STATUS.ACTIVE}>Active</SelectItem>
                <SelectItem value={LISTING_STATUS.PENDING}>Pending</SelectItem>
                <SelectItem value={LISTING_STATUS.SOLD}>Sold</SelectItem>
                <SelectItem value={LISTING_STATUS.CLOSED}>Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Your Listings</CardTitle>
            <CardDescription>
              {listings.length} listing{listings.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">No listings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first listing to start selling
                </p>
                <Button asChild>
                  <Link href="/dashboard/create-listing">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Listing
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Bids</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                              {listing.images?.[0]?.url ? (
                                <Image
                                  src={listing.images[0].url}
                                  alt={listing.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate max-w-[200px]">
                                {listing.title}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryLabel(listing.category)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">
                              {formatCurrency(listing.currentPrice || listing.startingPrice)}
                            </p>
                            {listing.buyNowPrice && (
                              <p className="text-xs text-muted-foreground">
                                Buy Now: {formatCurrency(listing.buyNowPrice)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{listing.bidCount || 0}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(listing)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/listings/${listing._id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              {listing.status === LISTING_STATUS.SOLD && listing.soldTo && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/messages?listingId=${listing._id}&recipientId=${listing.soldTo}`}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Contact Buyer
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              {listing.status !== LISTING_STATUS.SOLD && (
                                <>
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/dashboard/listings/${listing._id}/edit`}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => setDeleteId(listing._id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              listing and all associated bids.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import {
  Gavel,
  Check,
  X,
  Loader2,
  Eye,
  MessageSquare,
  Filter,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, BID_STATUS } from "@/lib/constants";
import { toast } from "sonner";

export default function BidsPage() {
  const { data: session, status } = useSession();
  const [incomingBids, setIncomingBids] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [myPurchases, setMyPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionBid, setActionBid] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function fetchBids() {
      if (!session?.user?.id) return;

      try {
        // Fetch incoming bids (bids on user's listings)
        const incomingRes = await fetch(`/api/bids?sellerId=${session.user.id}`);
        const incomingData = await incomingRes.json();
        if (incomingData.success) {
          setIncomingBids(incomingData.bids);
        }

        // Fetch user's own bids
        const myBidsRes = await fetch(`/api/bids?userId=${session.user.id}`);
        const myBidsData = await myBidsRes.json();
        if (myBidsData.success) {
          setMyBids(myBidsData.bids);
        }

        // Fetch user's purchases (Buy Now and accepted bids)
        const purchasesRes = await fetch(`/api/orders?type=purchases`);
        const purchasesData = await purchasesRes.json();
        if (purchasesData.success) {
          setMyPurchases(purchasesData.orders);
        }
      } catch (error) {
        console.error("Error fetching bids:", error);
        toast.error("Failed to load bids");
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchBids();
    }
  }, [session, status]);

  const handleBidAction = async () => {
    if (!actionBid || !actionType) return;

    setProcessing(true);

    try {
      const response = await fetch(`/api/bids/${actionBid._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionType }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        // Update local state
        setIncomingBids((prev) =>
          prev.map((bid) => {
            if (bid._id === actionBid._id) {
              return { ...bid, status: actionType === "accept" ? BID_STATUS.ACCEPTED : BID_STATUS.REJECTED };
            }
            // If accepting, reject other pending bids for same listing
            if (actionType === "accept" && bid.listingId === actionBid.listingId && bid.status === BID_STATUS.PENDING) {
              return { ...bid, status: BID_STATUS.REJECTED };
            }
            return bid;
          })
        );
      } else {
        toast.error(result.error || "Failed to process bid");
      }
    } catch (error) {
      console.error("Bid action error:", error);
      toast.error("Something went wrong");
    } finally {
      setProcessing(false);
      setActionBid(null);
      setActionType(null);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      [BID_STATUS.PENDING]: { variant: "secondary", icon: Clock, label: "Pending" },
      [BID_STATUS.ACCEPTED]: { variant: "success", icon: CheckCircle, label: "Accepted" },
      [BID_STATUS.REJECTED]: { variant: "destructive", icon: XCircle, label: "Rejected" },
      [BID_STATUS.OUTBID]: { variant: "outline", icon: Gavel, label: "Outbid" },
    };

    const { variant, icon: Icon, label } = config[status] || config[BID_STATUS.PENDING];

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const filteredIncomingBids = statusFilter === "all"
    ? incomingBids
    : incomingBids.filter((bid) => bid.status === statusFilter);

  const filteredMyBids = statusFilter === "all"
    ? myBids
    : myBids.filter((bid) => bid.status === statusFilter);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingCount = incomingBids.filter((b) => b.status === BID_STATUS.PENDING).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bids Management</h1>
          <p className="text-muted-foreground">
            Manage incoming bids and track your offers
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="default" className="self-start">
            {pendingCount} pending bid{pendingCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={BID_STATUS.PENDING}>Pending</SelectItem>
                <SelectItem value={BID_STATUS.ACCEPTED}>Accepted</SelectItem>
                <SelectItem value={BID_STATUS.REJECTED}>Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="incoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="incoming" className="gap-2">
            <Gavel className="h-4 w-4" />
            Incoming Bids
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-bids" className="gap-2">
            <Package className="h-4 w-4" />
            My Bids
          </TabsTrigger>
          <TabsTrigger value="my-purchases" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            My Purchases
            {myPurchases.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                {myPurchases.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Incoming Bids Tab */}
        <TabsContent value="incoming">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Incoming Bids</CardTitle>
                <CardDescription>
                  Bids on your listings. Accept to sell or reject to decline.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredIncomingBids.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Gavel className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-1">No incoming bids</h3>
                    <p className="text-muted-foreground">
                      When buyers bid on your listings, they&apos;ll appear here
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Listing</TableHead>
                          <TableHead>Bidder</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIncomingBids.map((bid) => (
                          <TableRow key={bid._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted">
                                  {bid.listing?.images?.[0]?.url ? (
                                    <Image
                                      src={bid.listing.images[0].url}
                                      alt={bid.listing?.title || "Listing"}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <Link
                                  href={`/listings/${bid.listingId}`}
                                  className="font-medium hover:underline truncate max-w-[150px]"
                                >
                                  {bid.listing?.title || "Unknown Listing"}
                                </Link>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{bid.bidderName}</p>
                                <p className="text-sm text-muted-foreground">{bid.bidderEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-primary">
                                {formatCurrency(bid.amount)}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(bid.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(bid.status)}</TableCell>
                            <TableCell className="text-right">
                              {bid.status === BID_STATUS.PENDING ? (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => {
                                      setActionBid(bid);
                                      setActionType("accept");
                                    }}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setActionBid(bid);
                                      setActionType("reject");
                                    }}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="ghost" asChild>
                                  <Link href={`/listings/${bid.listingId}`}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Link>
                                </Button>
                              )}
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
        </TabsContent>

        {/* My Bids Tab */}
        <TabsContent value="my-bids">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>My Bids</CardTitle>
                <CardDescription>
                  Track the bids you&apos;ve placed on other listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredMyBids.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Gavel className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-1">No bids yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start bidding on items you&apos;re interested in
                    </p>
                    <Button asChild>
                      <Link href="/listings">Browse Listings</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Listing</TableHead>
                          <TableHead>Your Bid</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMyBids.map((bid) => (
                          <TableRow key={bid._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted">
                                  {bid.listing?.images?.[0]?.url ? (
                                    <Image
                                      src={bid.listing.images[0].url}
                                      alt={bid.listing?.title || "Listing"}
                                      fill
                                      sizes="40px"
                                      sizes="40px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <Link
                                  href={`/listings/${bid.listingId}`}
                                  className="font-medium hover:underline truncate max-w-[200px]"
                                >
                                  {bid.listing?.title || "Unknown Listing"}
                                </Link>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">
                                {formatCurrency(bid.amount)}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(bid.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(bid.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" asChild>
                                  <Link href={`/listings/${bid.listingId}`}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Link>
                                </Button>
                                {bid.status === BID_STATUS.ACCEPTED && (
                                  <Button size="sm" variant="outline" asChild>
                                    <Link href={`/dashboard/messages?listingId=${bid.listingId}&sellerId=${bid.listing?.sellerId || ''}`}>
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Contact Seller
                                    </Link>
                                  </Button>
                                )}
                              </div>
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
        </TabsContent>

        {/* My Purchases Tab */}
        <TabsContent value="my-purchases">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>My Purchases</CardTitle>
                <CardDescription>
                  Items you&apos;ve bought via Buy Now or accepted bids
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myPurchases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-1">No purchases yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Items you buy will appear here
                    </p>
                    <Button asChild>
                      <Link href="/listings">Browse Listings</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Seller</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myPurchases.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell>
                              <Link
                                href={`/listings/${order.listingId}`}
                                className="font-medium hover:underline truncate max-w-[200px]"
                              >
                                {order.listingTitle}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{order.sellerName}</p>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-primary">
                                {formatCurrency(order.amount)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={order.type === "buy_now" ? "secondary" : "outline"}>
                                {order.type === "buy_now" ? "Buy Now" : "Auction"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" asChild>
                                  <Link href={`/listings/${order.listingId}`}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/dashboard/messages?listingId=${order.listingId}&sellerId=${order.sellerId}`}>
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Contact Seller
                                  </Link>
                                </Button>
                              </div>
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
        </TabsContent>
      </Tabs>

      {/* Confirm Action Dialog */}
      <AlertDialog open={!!actionBid} onOpenChange={() => setActionBid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "accept" ? "Accept Bid?" : "Reject Bid?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "accept" ? (
                <>
                  You are about to accept a bid of{" "}
                  <strong>{actionBid && formatCurrency(actionBid.amount)}</strong> from{" "}
                  <strong>{actionBid?.bidderName}</strong>. This will mark your listing
                  as sold and reject all other pending bids.
                </>
              ) : (
                <>
                  You are about to reject this bid. The bidder will be notified and
                  can place a new bid if they wish.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBidAction}
              disabled={processing}
              className={
                actionType === "accept"
                  ? "bg-primary"
                  : "bg-destructive hover:bg-destructive/90"
              }
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : actionType === "accept" ? (
                "Accept Bid"
              ) : (
                "Reject Bid"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

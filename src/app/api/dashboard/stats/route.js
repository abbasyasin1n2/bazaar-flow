import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const listingsCollection = await getCollection("listings");
    const bidsCollection = await getCollection("bids");
    const ordersCollection = await getCollection("orders");

    // Get user's listings stats
    const userListings = await listingsCollection
      .find({ sellerId: userId })
      .toArray();

    const activeListings = userListings.filter(l => l.status === "active").length;
    const soldListings = userListings.filter(l => l.status === "sold").length;
    const totalBidsReceived = userListings.reduce((sum, l) => sum + (l.bidCount || 0), 0);

    // Get user's bids
    const userBids = await bidsCollection
      .find({ bidderId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate total earnings from sold items
    const soldOrders = await ordersCollection
      .find({ sellerId: userId, status: { $in: ["completed", "pending"] } })
      .toArray();
    const totalEarnings = soldOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    // Get recent listings (limit 5)
    const recentListings = await listingsCollection
      .find({ sellerId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Get recent bids with listing info (limit 5)
    const recentBids = await bidsCollection
      .find({ bidderId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Enrich bids with listing info
    const enrichedBids = await Promise.all(
      recentBids.map(async (bid) => {
        const listing = await listingsCollection.findOne({ 
          _id: { $toString: bid.listingId } 
        });
        return {
          ...bid,
          _id: bid._id.toString(),
          listingTitle: listing?.title || "Unknown Listing",
          listingImage: listing?.images?.[0]?.url || null,
        };
      })
    );

    // Category distribution for pie chart
    const categoryStats = {};
    userListings.forEach((listing) => {
      const cat = listing.category || "other";
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalEarnings,
        activeListings,
        soldListings,
        totalBidsReceived,
        totalBidsPlaced: userBids.length,
        totalListings: userListings.length,
      },
      recentListings: recentListings.map((l) => ({
        ...l,
        _id: l._id.toString(),
      })),
      recentBids: enrichedBids,
      categoryStats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

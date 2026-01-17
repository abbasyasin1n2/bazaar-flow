import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { LISTING_STATUS } from "@/lib/constants";

// Debug endpoint to see sold listings and their bids
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const listingsCollection = await getCollection("listings");
    const bidsCollection = await getCollection("bids");
    const ordersCollection = await getCollection("orders");

    // Find all sold listings
    const soldListings = await listingsCollection
      .find({ status: LISTING_STATUS.SOLD })
      .toArray();

    const results = [];

    for (const listing of soldListings) {
      // Find all bids for this listing
      const bids = await bidsCollection
        .find({ listingId: listing._id.toString() })
        .toArray();

      // Find orders for this listing
      const orders = await ordersCollection
        .find({ listingId: listing._id.toString() })
        .toArray();

      results.push({
        listingId: listing._id.toString(),
        title: listing.title,
        sellerId: listing.sellerId,
        soldTo: listing.soldTo,
        soldToName: listing.soldToName,
        soldPrice: listing.soldPrice,
        soldType: listing.soldType,
        bids: bids.map((b) => ({
          bidderId: b.bidderId,
          bidderName: b.bidderName,
          amount: b.amount,
          status: b.status,
        })),
        orders: orders.map((o) => ({
          buyerId: o.buyerId,
          buyerName: o.buyerName,
          amount: o.amount,
          type: o.type,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      soldListings: results,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

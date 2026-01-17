import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { LISTING_STATUS } from "@/lib/constants";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Please sign in to place a bid" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, amount } = body;

    if (!listingId || !amount) {
      return NextResponse.json(
        { success: false, error: "Listing ID and amount are required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(listingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid listing ID" },
        { status: 400 }
      );
    }

    const bidAmount = parseFloat(amount);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid bid amount" },
        { status: 400 }
      );
    }

    const listingsCollection = await getCollection("listings");
    const listing = await listingsCollection.findOne({ 
      _id: new ObjectId(listingId) 
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.status !== LISTING_STATUS.ACTIVE) {
      return NextResponse.json(
        { success: false, error: "This listing is no longer active" },
        { status: 400 }
      );
    }

    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot bid on your own listing" },
        { status: 400 }
      );
    }

    const minimumBid = listing.currentBid 
      ? listing.currentBid + 1 
      : listing.startingPrice;

    if (bidAmount < minimumBid) {
      return NextResponse.json(
        { success: false, error: `Minimum bid is $${minimumBid}` },
        { status: 400 }
      );
    }

    // Create the bid
    const bidsCollection = await getCollection("bids");
    const bid = {
      listingId,
      bidderId: session.user.id,
      bidderName: session.user.name,
      bidderEmail: session.user.email,
      amount: bidAmount,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await bidsCollection.insertOne(bid);

    // Update listing with new current bid
    await listingsCollection.updateOne(
      { _id: new ObjectId(listingId) },
      {
        $set: { currentBid: bidAmount },
        $inc: { bidCount: 1 },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Bid placed successfully",
      bid: {
        ...bid,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Bid error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to place bid" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");

    const bidsCollection = await getCollection("bids");

    let query = {};

    if (listingId) {
      query.listingId = listingId;
    } else if (session) {
      // Get user's own bids
      query.bidderId = session.user.id;
    } else {
      return NextResponse.json(
        { success: false, error: "Please provide a listing ID or sign in" },
        { status: 400 }
      );
    }

    const bids = await bidsCollection
      .find(query)
      .sort({ amount: -1, createdAt: -1 })
      .toArray();

    const transformedBids = bids.map((bid) => ({
      ...bid,
      _id: bid._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      bids: transformedBids,
    });
  } catch (error) {
    console.error("Get bids error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bids" },
      { status: 500 }
    );
  }
}

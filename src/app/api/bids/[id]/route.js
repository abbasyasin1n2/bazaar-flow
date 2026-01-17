import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { LISTING_STATUS, BID_STATUS } from "@/lib/constants";
import { createNotification } from "@/lib/notifications";

// Get a specific bid
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid bid ID" },
        { status: 400 }
      );
    }

    const bidsCollection = await getCollection("bids");
    const bid = await bidsCollection.findOne({ _id: new ObjectId(id) });

    if (!bid) {
      return NextResponse.json(
        { success: false, error: "Bid not found" },
        { status: 404 }
      );
    }

    // Get listing info
    const listingsCollection = await getCollection("listings");
    const listing = await listingsCollection.findOne({
      _id: new ObjectId(bid.listingId),
    });

    return NextResponse.json({
      success: true,
      bid: {
        ...bid,
        _id: bid._id.toString(),
        listing: listing
          ? {
              _id: listing._id.toString(),
              title: listing.title,
              images: listing.images,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get bid error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bid" },
      { status: 500 }
    );
  }
}

// Update bid status (accept/reject)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid bid ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body; // 'accept' or 'reject'

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    const bidsCollection = await getCollection("bids");
    const listingsCollection = await getCollection("listings");

    // Get the bid
    const bid = await bidsCollection.findOne({ _id: new ObjectId(id) });

    if (!bid) {
      return NextResponse.json(
        { success: false, error: "Bid not found" },
        { status: 404 }
      );
    }

    // Get the listing
    const listing = await listingsCollection.findOne({
      _id: new ObjectId(bid.listingId),
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if user is the seller
    if (listing.sellerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Only the seller can accept or reject bids" },
        { status: 403 }
      );
    }

    // Check if listing is still active
    if (listing.status !== LISTING_STATUS.ACTIVE) {
      return NextResponse.json(
        { success: false, error: "This listing is no longer active" },
        { status: 400 }
      );
    }

    // Check if bid is still pending
    if (bid.status !== BID_STATUS.PENDING) {
      return NextResponse.json(
        { success: false, error: "This bid has already been processed" },
        { status: 400 }
      );
    }

    if (action === "accept") {
      // Accept the bid
      await bidsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: BID_STATUS.ACCEPTED,
            updatedAt: new Date(),
          },
        }
      );

      // Reject all other pending bids for this listing
      await bidsCollection.updateMany(
        {
          listingId: bid.listingId,
          _id: { $ne: new ObjectId(id) },
          status: BID_STATUS.PENDING,
        },
        {
          $set: {
            status: BID_STATUS.REJECTED,
            updatedAt: new Date(),
          },
        }
      );

      // Mark listing as sold
      await listingsCollection.updateOne(
        { _id: new ObjectId(bid.listingId) },
        {
          $set: {
            status: LISTING_STATUS.SOLD,
            soldTo: bid.bidderId,
            soldToName: bid.bidderName,
            soldPrice: bid.amount,
            soldAt: new Date(),
            soldType: "auction",
            updatedAt: new Date(),
          },
        }
      );

      // Create an order record for tracking
      const ordersCollection = await getCollection("orders");
      await ordersCollection.insertOne({
        listingId: bid.listingId,
        listingTitle: listing.title,
        listingImage: listing.images?.[0] || null,
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
        sellerEmail: listing.sellerEmail,
        buyerId: bid.bidderId,
        buyerName: bid.bidderName,
        buyerEmail: bid.bidderEmail,
        amount: bid.amount,
        type: "auction",
        status: "completed",
        bidId: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Notify bidder that their bid was accepted
      await createNotification({
        userId: bid.bidderId,
        type: "accepted",
        title: "Your bid was accepted!",
        message: `Congratulations! Your bid of ৳${bid.amount.toLocaleString()} on "${listing.title}" has been accepted by the seller.`,
        listingId: bid.listingId,
      });

      // Get all rejected bidders to notify them
      const rejectedBids = await bidsCollection
        .find({
          listingId: bid.listingId,
          _id: { $ne: new ObjectId(id) },
          status: BID_STATUS.REJECTED,
        })
        .toArray();

      // Notify rejected bidders
      for (const rejectedBid of rejectedBids) {
        await createNotification({
          userId: rejectedBid.bidderId,
          type: "rejected",
          title: "Bid not accepted",
          message: `Your bid of ৳${rejectedBid.amount.toLocaleString()} on "${listing.title}" was not accepted. The item has been sold to another bidder.`,
          listingId: bid.listingId,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Bid accepted! Item sold to ${bid.bidderName} for ৳${bid.amount.toLocaleString()}`,
        bid: {
          ...bid,
          _id: bid._id.toString(),
          status: BID_STATUS.ACCEPTED,
        },
      });
    } else {
      // Reject the bid
      await bidsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: BID_STATUS.REJECTED,
            updatedAt: new Date(),
          },
        }
      );

      // Notify bidder that their bid was rejected
      await createNotification({
        userId: bid.bidderId,
        type: "rejected",
        title: "Bid not accepted",
        message: `Your bid of ৳${bid.amount.toLocaleString()} on "${listing.title}" was not accepted by the seller.`,
        listingId: bid.listingId,
      });

      return NextResponse.json({
        success: true,
        message: "Bid rejected",
        bid: {
          ...bid,
          _id: bid._id.toString(),
          status: BID_STATUS.REJECTED,
        },
      });
    }
  } catch (error) {
    console.error("Update bid error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update bid" },
      { status: 500 }
    );
  }
}

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
        { success: false, error: "Please sign in to purchase" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId } = body;

    if (!listingId || !ObjectId.isValid(listingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid listing ID" },
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
        { success: false, error: "This listing is no longer available" },
        { status: 400 }
      );
    }

    if (!listing.buyNowPrice) {
      return NextResponse.json(
        { success: false, error: "This listing does not have a Buy Now option" },
        { status: 400 }
      );
    }

    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot buy your own listing" },
        { status: 400 }
      );
    }

    // Create the transaction/order
    const ordersCollection = await getCollection("orders");
    const order = {
      listingId,
      listingTitle: listing.title,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      buyerId: session.user.id,
      buyerName: session.user.name,
      buyerEmail: session.user.email,
      amount: listing.buyNowPrice,
      type: "buy_now",
      status: "pending",
      createdAt: new Date(),
    };

    const result = await ordersCollection.insertOne(order);

    // Update listing status
    await listingsCollection.updateOne(
      { _id: new ObjectId(listingId) },
      {
        $set: { 
          status: LISTING_STATUS.SOLD,
          soldAt: new Date(),
          soldTo: session.user.id,
          soldPrice: listing.buyNowPrice,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Purchase completed successfully",
      order: {
        ...order,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Buy now error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete purchase" },
      { status: 500 }
    );
  }
}

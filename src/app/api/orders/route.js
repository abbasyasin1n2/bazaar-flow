import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { LISTING_STATUS } from "@/lib/constants";

// Buy Now - Instant purchase
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Please sign in to make a purchase" },
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
    const ordersCollection = await getCollection("orders");

    // Get the listing
    const listing = await listingsCollection.findOne({
      _id: new ObjectId(listingId),
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if listing is active
    if (listing.status !== LISTING_STATUS.ACTIVE) {
      return NextResponse.json(
        { success: false, error: "This listing is no longer available" },
        { status: 400 }
      );
    }

    // Check if listing has buy now price
    if (!listing.buyNowPrice) {
      return NextResponse.json(
        { success: false, error: "This listing does not have a Buy Now option" },
        { status: 400 }
      );
    }

    // Check if user is not the seller
    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot buy your own listing" },
        { status: 400 }
      );
    }

    // Create the order
    const order = {
      listingId: listingId,
      listingTitle: listing.title,
      listingImage: listing.images?.[0] || null,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      sellerEmail: listing.sellerEmail,
      buyerId: session.user.id,
      buyerName: session.user.name,
      buyerEmail: session.user.email,
      amount: listing.buyNowPrice,
      type: "buy_now",
      status: "completed",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orderResult = await ordersCollection.insertOne(order);

    // Mark listing as sold
    await listingsCollection.updateOne(
      { _id: new ObjectId(listingId) },
      {
        $set: {
          status: LISTING_STATUS.SOLD,
          soldTo: session.user.id,
          soldToName: session.user.name,
          soldPrice: listing.buyNowPrice,
          soldAt: new Date(),
          soldType: "buy_now",
          updatedAt: new Date(),
        },
      }
    );

    // Reject any pending bids
    const bidsCollection = await getCollection("bids");
    await bidsCollection.updateMany(
      { listingId: listingId, status: "pending" },
      {
        $set: {
          status: "rejected",
          rejectedReason: "Item was purchased via Buy Now",
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `You've successfully purchased "${listing.title}" for ৳${listing.buyNowPrice.toLocaleString()}!`,
      order: {
        ...order,
        _id: orderResult.insertedId.toString(),
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

// Get user's orders (purchases)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'purchases' or 'sales'

    const ordersCollection = await getCollection("orders");

    let query = {};
    if (type === "sales") {
      query.sellerId = session.user.id;
    } else {
      query.buyerId = session.user.id;
    }

    const orders = await ordersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      orders: orders.map((order) => ({
        ...order,
        _id: order._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

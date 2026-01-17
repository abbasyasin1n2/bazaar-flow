import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

// Get user's wishlist
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const wishlistCollection = await getCollection("wishlist");
    const listingsCollection = await getCollection("listings");

    // Get user's wishlist items
    const wishlistItems = await wishlistCollection
      .find({ userId: session.user.id })
      .toArray();

    // Get full listing details for each wishlisted item
    const listingIds = wishlistItems.map((item) => new ObjectId(item.listingId));
    const listings = await listingsCollection
      .find({ _id: { $in: listingIds } })
      .toArray();

    // Transform listings
    const transformedListings = listings.map((listing) => ({
      _id: listing._id.toString(),
      title: listing.title,
      images: listing.images || [],
      currentBid: listing.currentBid,
      startingPrice: listing.startingPrice,
      buyNowPrice: listing.buyNowPrice,
      status: listing.status,
      createdAt: listing.createdAt,
    }));

    return NextResponse.json({
      success: true,
      wishlist: transformedListings,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// Add item to wishlist
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { listingId } = await request.json();

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: "Listing ID is required" },
        { status: 400 }
      );
    }

    const wishlistCollection = await getCollection("wishlist");

    // Check if already in wishlist
    const existing = await wishlistCollection.findOne({
      userId: session.user.id,
      listingId,
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Item already in wishlist",
        alreadyExists: true,
      });
    }

    // Add to wishlist
    await wishlistCollection.insertOne({
      userId: session.user.id,
      listingId,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

// Remove item from wishlist
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: "Listing ID is required" },
        { status: 400 }
      );
    }

    const wishlistCollection = await getCollection("wishlist");

    await wishlistCollection.deleteOne({
      userId: session.user.id,
      listingId,
    });

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}

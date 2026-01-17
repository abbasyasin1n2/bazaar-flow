import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LISTING_STATUS, CATEGORIES } from "@/lib/constants";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid listing ID" },
        { status: 400 }
      );
    }

    const listingsCollection = await getCollection("listings");
    const listing = await listingsCollection.findOne({ _id: new ObjectId(id) });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    // Get bids for this listing
    const bidsCollection = await getCollection("bids");
    const bids = await bidsCollection
      .find({ listingId: id })
      .sort({ amount: -1, createdAt: -1 })
      .limit(10)
      .toArray();

    const transformedListing = {
      ...listing,
      _id: listing._id.toString(),
      bids: bids.map((bid) => ({
        ...bid,
        _id: bid._id.toString(),
      })),
    };

    return NextResponse.json({
      success: true,
      listing: transformedListing,
    });
  } catch (error) {
    console.error("Get listing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

// Update a listing
export async function PUT(request, { params }) {
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
        { success: false, error: "Invalid listing ID" },
        { status: 400 }
      );
    }

    const listingsCollection = await getCollection("listings");
    const existingListing = await listingsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingListing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if user owns this listing
    if (existingListing.sellerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own listings" },
        { status: 403 }
      );
    }

    // Check if listing can be edited (not sold)
    if (existingListing.status === LISTING_STATUS.SOLD) {
      return NextResponse.json(
        { success: false, error: "Cannot edit a sold listing" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, category, startingPrice, buyNowPrice, images } = body;

    // Validate required fields
    if (!title || !description || !category || !startingPrice) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!CATEGORIES.find((c) => c.value === category)) {
      return NextResponse.json(
        { success: false, error: "Invalid category" },
        { status: 400 }
      );
    }

    if (startingPrice <= 0) {
      return NextResponse.json(
        { success: false, error: "Starting price must be greater than 0" },
        { status: 400 }
      );
    }

    if (buyNowPrice && buyNowPrice <= startingPrice) {
      return NextResponse.json(
        { success: false, error: "Buy now price must be greater than starting price" },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one image is required" },
        { status: 400 }
      );
    }

    const updateData = {
      title: title.trim(),
      description: description.trim(),
      category,
      startingPrice: parseFloat(startingPrice),
      buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
      images,
      updatedAt: new Date(),
    };

    await listingsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: "Listing updated successfully",
    });
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

// Delete a listing
export async function DELETE(request, { params }) {
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
        { success: false, error: "Invalid listing ID" },
        { status: 400 }
      );
    }

    const listingsCollection = await getCollection("listings");
    const existingListing = await listingsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingListing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if user owns this listing
    if (existingListing.sellerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own listings" },
        { status: 403 }
      );
    }

    // Check if listing has accepted bids
    if (existingListing.status === LISTING_STATUS.SOLD) {
      return NextResponse.json(
        { success: false, error: "Cannot delete a sold listing" },
        { status: 400 }
      );
    }

    // Delete the listing
    await listingsCollection.deleteOne({ _id: new ObjectId(id) });

    // Also delete all bids for this listing
    const bidsCollection = await getCollection("bids");
    await bidsCollection.deleteMany({ listingId: id });

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete listing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}

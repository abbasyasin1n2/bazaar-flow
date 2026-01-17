import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

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

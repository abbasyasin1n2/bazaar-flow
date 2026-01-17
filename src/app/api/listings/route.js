import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ITEMS_PER_PAGE, LISTING_STATUS } from "@/lib/constants";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || ITEMS_PER_PAGE;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";

    const listingsCollection = await getCollection("listings");

    // Build query
    const query = {
      status: LISTING_STATUS.ACTIVE,
    };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case "price-low":
        sortOption = { startingPrice: 1 };
        break;
      case "price-high":
        sortOption = { startingPrice: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "most-bids":
        sortOption = { bidCount: -1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
    }

    // Get total count
    const total = await listingsCollection.countDocuments(query);

    // Get listings with pagination
    const listings = await listingsCollection
      .find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Transform listings for response
    const transformedListings = listings.map((listing) => ({
      _id: listing._id.toString(),
      title: listing.title,
      description: listing.description,
      category: listing.category,
      startingPrice: listing.startingPrice,
      buyNowPrice: listing.buyNowPrice,
      currentBid: listing.currentBid,
      bidCount: listing.bidCount || 0,
      images: listing.images || [],
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      status: listing.status,
      createdAt: listing.createdAt,
    }));

    return NextResponse.json({
      success: true,
      listings: transformedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Get listings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    const sellerId = searchParams.get("sellerId");
    const status = searchParams.get("status");

    const listingsCollection = await getCollection("listings");

    // Build query
    const query = {};

    // If sellerId provided, show all statuses for that seller
    // Otherwise, show active and sold listings (public can see sold items too)
    if (sellerId) {
      query.sellerId = sellerId;
      if (status && status !== "all") {
        query.status = status;
      }
    } else {
      // Public listings: show active and sold (not closed or draft)
      query.status = { $in: [LISTING_STATUS.ACTIVE, LISTING_STATUS.SOLD] };
    }

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
      soldTo: listing.soldTo,
      soldToName: listing.soldToName,
      soldPrice: listing.soldPrice,
      soldType: listing.soldType,
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

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Please sign in to create a listing" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, category, startingPrice, buyNowPrice, images } = body;

    // Validation
    if (!title || title.length < 10) {
      return NextResponse.json(
        { success: false, error: "Title must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (!description || description.length < 30) {
      return NextResponse.json(
        { success: false, error: "Description must be at least 30 characters" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category is required" },
        { status: 400 }
      );
    }

    if (!startingPrice || startingPrice < 1) {
      return NextResponse.json(
        { success: false, error: "Starting price must be at least ৳1" },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one image is required" },
        { status: 400 }
      );
    }

    if (buyNowPrice && buyNowPrice <= startingPrice) {
      return NextResponse.json(
        { success: false, error: "Buy Now price must be higher than starting price" },
        { status: 400 }
      );
    }

    const listingsCollection = await getCollection("listings");

    const listing = {
      title,
      description,
      category,
      startingPrice: parseFloat(startingPrice),
      buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
      currentBid: null,
      bidCount: 0,
      images,
      sellerId: session.user.id,
      sellerName: session.user.name,
      sellerEmail: session.user.email,
      status: LISTING_STATUS.ACTIVE,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await listingsCollection.insertOne(listing);

    return NextResponse.json({
      success: true,
      message: "Listing created successfully",
      listing: {
        ...listing,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create listing" },
      { status: 500 }
    );
  }
}

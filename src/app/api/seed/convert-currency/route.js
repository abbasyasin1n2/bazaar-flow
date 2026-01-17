import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";

// USD to BDT conversion rate (approximately 110 BDT per USD)
const USD_TO_BDT = 110;

export async function GET() {
  try {
    const listingsCollection = await getCollection("listings");
    
    // Get all demo listings
    const listings = await listingsCollection.find({
      sellerId: { $regex: /^demo-seller/ }
    }).toArray();

    if (listings.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No demo listings found",
      });
    }

    // Update each listing with converted prices
    let updatedCount = 0;
    for (const listing of listings) {
      const updateData = {
        startingPrice: Math.round(listing.startingPrice * USD_TO_BDT),
        buyNowPrice: listing.buyNowPrice ? Math.round(listing.buyNowPrice * USD_TO_BDT) : null,
        currentBid: listing.currentBid ? Math.round(listing.currentBid * USD_TO_BDT) : null,
      };

      await listingsCollection.updateOne(
        { _id: listing._id },
        { $set: updateData }
      );
      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Converted ${updatedCount} listings from USD to BDT (rate: 1 USD = ${USD_TO_BDT} BDT)`,
      count: updatedCount,
    });
  } catch (error) {
    console.error("Currency conversion error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

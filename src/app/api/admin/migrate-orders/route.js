import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { LISTING_STATUS } from "@/lib/constants";

// One-time migration to create order records for sold listings without orders
// This endpoint can be deleted after migration is complete

// Support both GET and POST for easier access
export async function GET(request) {
  return runMigration();
}

export async function POST(request) {
  return runMigration();
}

async function runMigration() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const listingsCollection = await getCollection("listings");
    const ordersCollection = await getCollection("orders");
    const bidsCollection = await getCollection("bids");

    // Find all sold listings
    const soldListings = await listingsCollection
      .find({ status: LISTING_STATUS.SOLD })
      .toArray();

    let created = 0;
    let skipped = 0;

    for (const listing of soldListings) {
      // Check if order already exists for this listing
      const existingOrder = await ordersCollection.findOne({
        listingId: listing._id.toString(),
      });

      if (existingOrder) {
        skipped++;
        continue;
      }

      // Determine sale details
      let buyerId = listing.soldTo;
      let buyerName = listing.soldToName;
      let buyerEmail = "";
      let amount = listing.soldPrice;
      let type = listing.soldType || "auction";

      // If we don't have soldTo info, try to find the accepted bid
      if (!buyerId) {
        const acceptedBid = await bidsCollection.findOne({
          listingId: listing._id.toString(),
          status: "accepted",
        });

        if (acceptedBid) {
          buyerId = acceptedBid.bidderId;
          buyerName = acceptedBid.bidderName;
          buyerEmail = acceptedBid.bidderEmail;
          amount = acceptedBid.amount;
          type = "auction";
        }
      }

      if (!buyerId || !amount) {
        console.log(`Skipping listing ${listing._id} - no buyer info found`);
        skipped++;
        continue;
      }

      // Create the order
      const order = {
        listingId: listing._id.toString(),
        listingTitle: listing.title,
        listingImage: listing.images?.[0] || null,
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
        sellerEmail: listing.sellerEmail || "",
        buyerId: buyerId,
        buyerName: buyerName,
        buyerEmail: buyerEmail,
        amount: amount,
        type: type,
        status: "completed",
        createdAt: listing.soldAt || listing.updatedAt || new Date(),
        updatedAt: new Date(),
        migratedAt: new Date(), // Mark as migrated
      };

      await ordersCollection.insertOne(order);
      created++;

      // Also update the listing with soldTo info if missing
      if (!listing.soldTo && buyerId) {
        await listingsCollection.updateOne(
          { _id: listing._id },
          {
            $set: {
              soldTo: buyerId,
              soldToName: buyerName,
              soldPrice: amount,
              soldType: type,
            },
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration complete. Created ${created} orders, skipped ${skipped} (already existed or no buyer info).`,
      created,
      skipped,
      total: soldListings.length,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { success: false, error: "Migration failed: " + error.message },
      { status: 500 }
    );
  }
}

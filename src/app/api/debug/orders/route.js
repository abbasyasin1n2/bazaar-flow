import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";

// Check orders in database
export async function GET() {
  try {
    const ordersCollection = await getCollection("orders");
    const orders = await ordersCollection.find({}).toArray();

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders: orders.map(o => ({
        _id: o._id.toString(),
        listingTitle: o.listingTitle,
        sellerId: o.sellerId,
        sellerName: o.sellerName,
        buyerId: o.buyerId,
        buyerName: o.buyerName,
        amount: o.amount,
        type: o.type,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

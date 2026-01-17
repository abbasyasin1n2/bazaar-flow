import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";

// Cleanup duplicate conversations - keep only the oldest one per listing+participants combo
export async function POST() {
  try {
    const conversationsCollection = await getCollection("conversations");
    
    // Get all conversations
    const allConversations = await conversationsCollection
      .find({})
      .sort({ createdAt: 1 }) // oldest first
      .toArray();

    // Group by listingId + participants (sorted)
    const seen = new Map();
    const toDelete = [];

    for (const conv of allConversations) {
      const participants = [...conv.participants].sort().join("-");
      const key = `${conv.listingId || "general"}-${participants}`;
      
      if (seen.has(key)) {
        // This is a duplicate - mark for deletion
        toDelete.push(conv._id);
      } else {
        seen.set(key, conv._id);
      }
    }

    // Delete duplicates
    if (toDelete.length > 0) {
      await conversationsCollection.deleteMany({
        _id: { $in: toDelete },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${toDelete.length} duplicate conversation(s)`,
      deleted: toDelete.length,
      remaining: allConversations.length - toDelete.length,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

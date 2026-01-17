import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const conversationsCollection = await getCollection("conversations");
    const messagesCollection = await getCollection("messages");

    // Get all user's conversations
    const userConversations = await conversationsCollection
      .find({ participants: userId })
      .project({ _id: 1 })
      .toArray();

    const conversationIds = userConversations.map((c) => c._id.toString());

    // Count unread messages
    const unreadCount = await messagesCollection.countDocuments({
      conversationId: { $in: conversationIds },
      senderId: { $ne: userId },
      read: false,
    });

    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}

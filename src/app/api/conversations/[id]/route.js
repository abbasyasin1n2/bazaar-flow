import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { createNotification } from "@/lib/notifications";

// Get messages for a conversation
export async function GET(request, { params }) {
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
        { success: false, error: "Invalid conversation ID" },
        { status: 400 }
      );
    }

    const conversationsCollection = await getCollection("conversations");
    const messagesCollection = await getCollection("messages");

    // Check if user is part of this conversation
    const conversation = await conversationsCollection.findOne({
      _id: new ObjectId(id),
      participants: session.user.id,
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Get messages
    const messages = await messagesCollection
      .find({ conversationId: id })
      .sort({ createdAt: 1 })
      .toArray();

    // Mark unread messages as read
    await messagesCollection.updateMany(
      {
        conversationId: id,
        senderId: { $ne: session.user.id },
        read: false,
      },
      { $set: { read: true, readAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      conversation: {
        ...conversation,
        _id: conversation._id.toString(),
      },
      messages: messages.map((msg) => ({
        ...msg,
        _id: msg._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// Send a message
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Message content is required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid conversation ID" },
        { status: 400 }
      );
    }

    const conversationsCollection = await getCollection("conversations");
    const messagesCollection = await getCollection("messages");

    // Check if user is part of this conversation
    const conversation = await conversationsCollection.findOne({
      _id: new ObjectId(id),
      participants: session.user.id,
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Create message
    const message = {
      conversationId: id,
      senderId: session.user.id,
      senderName: session.user.name,
      content: content.trim(),
      read: false,
      createdAt: new Date(),
    };

    const result = await messagesCollection.insertOne(message);

    // Update conversation's updatedAt
    await conversationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { updatedAt: new Date() } }
    );

    // Get recipient (the other participant)
    const recipientId = conversation.participants.find(
      (p) => p !== session.user.id
    );

    // Get listing info for notification context
    const listingsCollection = await getCollection("listings");
    let listingTitle = "a listing";
    if (conversation.listingId) {
      const listing = await listingsCollection.findOne({
        _id: new ObjectId(conversation.listingId),
      });
      if (listing) {
        listingTitle = listing.title;
      }
    }

    // Create notification for recipient
    if (recipientId) {
      await createNotification({
        userId: recipientId,
        type: "message",
        title: "New message",
        message: `${session.user.name} sent you a message${conversation.listingId ? ` about ${listingTitle}` : ""}`,
        listingId: conversation.listingId || null,
      });
    }

    return NextResponse.json({
      success: true,
      message: {
        ...message,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}

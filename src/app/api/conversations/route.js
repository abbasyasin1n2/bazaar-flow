import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

// Get user's conversations
export async function GET(request) {
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
    const listingsCollection = await getCollection("listings");

    // Get all conversations where user is a participant
    const conversations = await conversationsCollection
      .find({
        participants: userId,
      })
      .sort({ updatedAt: -1 })
      .toArray();

    // Enrich conversations with last message and listing info
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        // Get last message (use find with sort and limit instead of findOne)
        const lastMessages = await messagesCollection
          .find({ conversationId: conv._id.toString() })
          .sort({ createdAt: -1 })
          .limit(1)
          .toArray();
        const lastMessage = lastMessages[0] || null;

        // Get unread count
        const unreadCount = await messagesCollection.countDocuments({
          conversationId: conv._id.toString(),
          senderId: { $ne: userId },
          read: false,
        });

        // Get listing info if linked
        let listing = null;
        if (conv.listingId) {
          listing = await listingsCollection.findOne({
            _id: new ObjectId(conv.listingId),
          });
        }

        // Get other participant info
        const otherParticipantId = conv.participants.find((p) => p !== userId);
        const otherParticipant = conv.participantDetails?.find(
          (p) => p.id === otherParticipantId
        );

        // Determine if user is seller or buyer
        const isSeller = listing?.sellerId === userId;
        const otherParticipantRole = isSeller ? "Buyer" : "Seller";

        return {
          _id: conv._id.toString(),
          listingId: conv.listingId,
          listing: listing
            ? {
                _id: listing._id.toString(),
                title: listing.title,
                images: listing.images,
                status: listing.status,
                sellerId: listing.sellerId,
              }
            : null,
          otherParticipant: {
            ...(otherParticipant || {
              id: otherParticipantId,
              name: "Unknown User",
            }),
            role: otherParticipantRole,
          },
          userRole: isSeller ? "Seller" : "Buyer",
          lastMessage: lastMessage
            ? {
                _id: lastMessage._id.toString(),
                content: lastMessage.content,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      conversations: enrichedConversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// Create or get existing conversation
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recipientId, listingId } = body;

    if (!recipientId) {
      return NextResponse.json(
        { success: false, error: "Recipient ID is required" },
        { status: 400 }
      );
    }

    if (recipientId === session.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot message yourself" },
        { status: 400 }
      );
    }

    const conversationsCollection = await getCollection("conversations");
    const usersCollection = await getCollection("users");

    // Check if conversation already exists for this listing (or between these users)
    let existingConversation = null;
    
    if (listingId) {
      // First try to find conversation for this specific listing
      existingConversation = await conversationsCollection.findOne({
        participants: { $all: [session.user.id, recipientId] },
        listingId: listingId,
      });
    }
    
    // If no listing-specific conversation, check for any conversation between these users
    if (!existingConversation) {
      existingConversation = await conversationsCollection.findOne({
        participants: { $all: [session.user.id, recipientId] },
        listingId: listingId || null,
      });
    }

    if (existingConversation) {
      return NextResponse.json({
        success: true,
        conversation: {
          ...existingConversation,
          _id: existingConversation._id.toString(),
        },
        isNew: false,
      });
    }

    // Get recipient info
    const recipient = await usersCollection.findOne({
      _id: new ObjectId(recipientId),
    });

    // Create new conversation
    const conversation = {
      participants: [session.user.id, recipientId],
      participantDetails: [
        {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
        {
          id: recipientId,
          name: recipient?.name || "User",
          email: recipient?.email || "",
        },
      ],
      listingId: listingId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await conversationsCollection.insertOne(conversation);

    return NextResponse.json({
      success: true,
      conversation: {
        ...conversation,
        _id: result.insertedId.toString(),
      },
      isNew: true,
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}

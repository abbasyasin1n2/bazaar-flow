import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/db";

// Get user's notifications
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notificationsCollection = await getCollection("notifications");

    // Get user's notifications, sorted by newest first
    const notifications = await notificationsCollection
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Transform notifications
    const transformedNotifications = notifications.map((notif) => ({
      _id: notif._id.toString(),
      type: notif.type,
      title: notif.title,
      message: notif.message,
      listingId: notif.listingId,
      read: notif.read || false,
      createdAt: notif.createdAt,
    }));

    return NextResponse.json({
      success: true,
      notifications: transformedNotifications,
      unreadCount: transformedNotifications.filter((n) => !n.read).length,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const notificationsCollection = await getCollection("notifications");

    await notificationsCollection.updateOne(
      { _id: new ObjectId(notificationId), userId: session.user.id },
      { $set: { read: true } }
    );

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}

// Clear all notifications
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notificationsCollection = await getCollection("notifications");

    // Delete all notifications for the user
    await notificationsCollection.deleteMany({ userId: session.user.id });

    return NextResponse.json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    console.error("Clear notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear notifications" },
      { status: 500 }
    );
  }
}

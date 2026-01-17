// Helper function to create notifications
import { getCollection } from "@/lib/db";

export async function createNotification({
  userId,
  type,
  title,
  message,
  listingId = null,
}) {
  try {
    const notificationsCollection = await getCollection("notifications");

    await notificationsCollection.insertOne({
      userId,
      type,
      title,
      message,
      listingId,
      read: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Create notification error:", error);
    return { success: false, error: error.message };
  }
}

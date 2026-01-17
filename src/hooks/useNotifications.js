"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!session) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [session]);

  return {
    notifications,
    unreadCount,
    isLoading,
    refetch: fetchNotifications,
  };
}

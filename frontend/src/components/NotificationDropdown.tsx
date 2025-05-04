"use client";

import { Notification } from "@/types";
import { useEffect, useState } from "react";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Simulate fetching notifications
    const mockNotifications: Notification[] = [
      {
        id: "1",
        title: "New Feature",
        message: "Voice customization is now available",
        read: false,
        timestamp: new Date(),
      },
      {
        id: "2",
        title: "Update",
        message: "Your subscription will renew soon",
        read: true,
        timestamp: new Date(Date.now() - 86400000),
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-800">Notifications</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <div key={notification.id} className={`p-4 ${!notification.read ? "bg-blue-50" : ""}`}>
            <h4 className="font-medium text-gray-800">{notification.title}</h4>
            <p className="text-sm text-gray-600">{notification.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {notification.timestamp.toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200 text-center">
        <button className="text-sm text-blue-600 hover:text-blue-800">
          View all notifications
        </button>
      </div>
    </div>
  );
}
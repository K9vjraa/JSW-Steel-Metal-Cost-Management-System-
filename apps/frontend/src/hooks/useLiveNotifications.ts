import * as React from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { getAccessToken } from "@/services/api/client";
import type { Notice } from "@jsw-mcms/types";

export function useLiveNotifications() {
  const addNotice = useNotificationStore((state) => state.addNotice);
  const addToast = useNotificationStore((state) => state.addToast);

  React.useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
    const sseUrl = `${baseUrl}/notifications/stream/live?token=${token}`;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: number | null = null;

    const connect = () => {
      eventSource = new EventSource(sseUrl);

      eventSource.addEventListener("ready", (e) => {
        console.log("SSE Live Stream Connection Established:", e.data);
      });

      eventSource.addEventListener("notification", (e) => {
        try {
          const notification = JSON.parse(e.data) as Notice;
          
          // 1. Add to persistent notifications store list
          addNotice(notification);

          // 2. Trigger dynamic toast alert with type mapped from priority / category
          let toastType: "success" | "warning" | "error" | "info" = "info";
          
          if (notification.category === "CRITICAL" || notification.priority === "HIGH") {
            toastType = "error";
          } else if (notification.category === "WARNING" || notification.priority === "MEDIUM") {
            toastType = "warning";
          } else if (notification.category === "SYSTEM" || notification.category === "COMPOSITION") {
            toastType = "success";
          }

          addToast({
            title: notification.title,
            message: notification.message,
            type: toastType,
            priority: notification.priority as "LOW" | "MEDIUM" | "HIGH" | undefined
          });
        } catch (err) {
          console.error("Failed to parse live notification SSE payload:", err);
        }
      });

      eventSource.onerror = (err) => {
        console.error("SSE stream error occurred. Reconnecting in 5 seconds...", err);
        eventSource?.close();
        reconnectTimeout = window.setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        window.clearTimeout(reconnectTimeout);
      }
    };
  }, [addNotice, addToast]);
}

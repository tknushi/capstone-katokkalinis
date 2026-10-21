import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { apiRequest } from "./api";

const PUSH_TOKEN_KEY = "@device_push_token";
const LAST_SEEN_BROADCAST_KEY = "@last_seen_broadcast_id";

type NotificationCallback = (notification: {
  id: string | number;
  title: string;
  message: string;
  type: string;
  targetRoute?: string;
}) => void;

let activeListeners: Set<NotificationCallback> = new Set();

/**
 * Register push notification device token with the KatokKalinis backend.
 */
export async function registerDevicePushToken(
  role?: string,
  barangayId?: number | null
): Promise<string | null> {
  try {
    let token: string | null = null;

    // Optional dynamic check for native notification permissions/token without static bundling crash
    try {
      // @ts-ignore
      const Notifications = await import("expo-notifications").catch(() => null);
      if (Notifications && typeof Notifications.getPermissionsAsync === "function") {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted" && typeof Notifications.requestPermissionsAsync === "function") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus === "granted" && typeof Notifications.getExpoPushTokenAsync === "function") {
          const expoTokenData = await Notifications.getExpoPushTokenAsync();
          token = expoTokenData?.data || null;
        }
      }
    } catch {
      // Expo Go SDK 53+ does not support native push module; use persistent client token
    }

    if (!token) {
      let cached = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (!cached) {
        cached = `ExponentPushToken[local-${Platform.OS}-${Math.random().toString(36).substring(2, 10)}]`;
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, cached);
      }
      token = cached;
    }

    // Register token with backend central registry
    await apiRequest("/notifications/device-token", {
      method: "POST",
      body: JSON.stringify({
        token,
        role: role || "resident",
        barangay_id: barangayId || null,
      }),
    }).catch(() => {});

    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    return token;
  } catch (error) {
    console.warn("Push token registration error:", error);
    return null;
  }
}

/**
 * Unregister device token from backend upon user logout.
 */
export async function unregisterDevicePushToken(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (token) {
      await apiRequest("/notifications/device-token", {
        method: "DELETE",
        body: JSON.stringify({ token }),
      }).catch(() => {});
      await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
    }
  } catch (e) {
    console.warn("Could not unregister push token on logout:", e);
  }
}

/**
 * Trigger an immediate notification banner and haptic feedback.
 */
export async function triggerLocalNotification(
  title: string,
  message: string,
  data: Record<string, any> = {}
): Promise<void> {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  } catch {}

  const notification = {
    id: Date.now(),
    title,
    message,
    type: (data?.type as string) || "advisory",
    targetRoute: data?.target_route || getRouteForNotificationType(data?.type || "advisory"),
  };

  // Broadcast to all active listeners (e.g. RootLayout banner)
  activeListeners.forEach((listener) => {
    try {
      listener(notification);
    } catch (err) {
      console.warn("Error notifying listener:", err);
    }
  });
}

/**
 * Fetch the latest broadcast from the backend.
 */
export async function fetchLatestBroadcast(): Promise<any> {
  try {
    const res = await apiRequest("/notifications/latest", { method: "GET" });
    if (res && res.success) {
      return res.latest_broadcast || res.latest_notification || null;
    }
  } catch {
    // offline or network unavailable
  }
  return null;
}

/**
 * Handle notification tap and return deep-link route matching approved scope.
 */
export function getRouteForNotificationType(type: string): string {
  switch (type) {
    case "schedule":
      return "/schedule";
    case "advisory":
      return "/notifications";
    case "inspection":
      return "/inspector/scan";
    case "announcement":
      return "/notifications";
    case "report_update":
      return "/report";
    case "feedback_update":
      return "/feedback";
    default:
      return "/notifications";
  }
}

/**
 * Start listening for broadcasts from backend in real time.
 * Automatically presents the TopNotificationBanner with haptics when admin pushes from web.
 */
export function startPushNotificationListener(
  onNotificationReceived: NotificationCallback
): () => void {
  let isMounted = true;
  activeListeners.add(onNotificationReceived);

  // Initialize registration
  AsyncStorage.getItem("userRole").then((role) => {
    AsyncStorage.getItem("userBarangay").then((brgy) => {
      let bId: number | null = null;
      if (brgy) {
        const m = brgy.match(/(\d+)/);
        if (m) bId = parseInt(m[1], 10);
      }
      registerDevicePushToken(role || "resident", bId).catch(() => {});
    });
  });

  // Background/Foreground poll for broadcasts dispatched from web
  const pollBroadcasts = async () => {
    if (!isMounted) return;
    try {
      const latest = await fetchLatestBroadcast();
      if (!latest || !latest.id) return;

      const lastSeen = await AsyncStorage.getItem(LAST_SEEN_BROADCAST_KEY);
      const currentIdStr = String(latest.id);

      if (lastSeen !== currentIdStr) {
        await AsyncStorage.setItem(LAST_SEEN_BROADCAST_KEY, currentIdStr);

        // When a new broadcast arrives, notify the active in-app banner with haptics
        if (lastSeen !== null) {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          } catch {}

          onNotificationReceived({
            id: latest.id,
            title: latest.title || "KatokKalinis Advisory",
            message: latest.message || "",
            type: latest.type || "advisory",
            targetRoute: getRouteForNotificationType(latest.type),
          });
        }
      }
    } catch {
      // Polling network fallback
    }
  };

  // Run poll check on start
  pollBroadcasts();

  // Poll every 5 seconds for real-time delivery when admin pushes from web
  const interval = setInterval(pollBroadcasts, 5000);

  return () => {
    isMounted = false;
    activeListeners.delete(onNotificationReceived);
    clearInterval(interval);
  };
}

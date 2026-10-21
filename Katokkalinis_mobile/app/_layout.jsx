import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import TopNotificationBanner from "../components/TopNotificationBanner";
import { startPushNotificationListener } from "../services/pushNotification";

export default function RootLayout() {
  const router = useRouter();
  const [bannerAlert, setBannerAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "advisory",
    targetRoute: "/notifications",
  });

  useEffect(() => {
    // Start listening for native notifications and live broadcasts from the web
    const cleanup = startPushNotificationListener((notification) => {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } catch {}

      setBannerAlert({
        visible: true,
        title: notification.title || "KatokKalinis Notification",
        message: notification.message || "",
        type: notification.type || "advisory",
        targetRoute: notification.targetRoute || "/notifications",
      });
    });

    return () => {
      cleanup();
    };
  }, []);

  const handleBannerPress = () => {
    const route = bannerAlert.targetRoute || "/notifications";
    setBannerAlert((prev) => ({ ...prev, visible: false }));
    try {
      router.push(route);
    } catch {
      router.push("/notifications");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <TopNotificationBanner
        visible={bannerAlert.visible}
        title={bannerAlert.title}
        message={bannerAlert.message}
        type={
          bannerAlert.type === "schedule"
            ? "schedule"
            : bannerAlert.type === "truck"
            ? "truck"
            : bannerAlert.type === "success"
            ? "success"
            : bannerAlert.type === "warning"
            ? "warning"
            : "alert"
        }
        onPress={handleBannerPress}
        onDismiss={() => setBannerAlert((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

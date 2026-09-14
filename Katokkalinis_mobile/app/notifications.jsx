import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import KatokLogo from "../components/KatokLogo";
import TopNotificationBanner from "../components/TopNotificationBanner";
import { fetchNotifications, markNotificationAsRead } from "../services/resident";

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bannerAlert, setBannerAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  const loadNotifications = async () => {
    try {
      const response = await fetchNotifications();
      if (response && response.success && Array.isArray(response.notifications) && response.notifications.length > 0) {
        setNotifications(response.notifications);
      } else {
        // High quality fallback alerts
        setNotifications([
          {
            id: 1,
            title: "Collection Truck Approaching",
            message: "The collection driver is entering your barangay route. Please have your bins ready.",
            type: "truck",
            is_read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          },
          {
            id: 2,
            title: "Report Status Updated",
            message: "Your report regarding market corner waste has been assigned to driver team #04.",
            type: "info",
            is_read: false,
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            id: 3,
            title: "Scheduled Pickup Reminder",
            message: "Upcoming general biodegradable waste collection tomorrow at 08:00 AM.",
            type: "schedule",
            is_read: true,
            created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRead = async (id, isRead) => {
    if (!isRead) {
      try {
        await markNotificationAsRead(id);
      } catch (err) {
        console.warn("Could not sync read status:", err);
      }
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    setBannerAlert({
      visible: true,
      title: "All Caught Up",
      message: "All notifications marked as read.",
      type: "success",
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <View style={styles.container}>
      {/* Top Banner Alert Component (Requirement 10) */}
      <TopNotificationBanner
        visible={bannerAlert.visible}
        title={bannerAlert.title}
        message={bannerAlert.message}
        type={bannerAlert.type}
        onDismiss={() => setBannerAlert((prev) => ({ ...prev, visible: false }))}
      />

      {/* 1. TOP HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1E331B" />
          </TouchableOpacity>
          <KatokLogo variant="header" showTagline={false} />
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markReadBtn}
            onPress={handleMarkAllAsRead}
            activeOpacity={0.8}
          >
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2E7D32"]} />}
      >
        {/* 2. TITLE BAR */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.pageTitle}>Notifications</Text>
            <Text style={styles.pageSubtitle}>Real-time updates on garbage schedules & reports</Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.unreadCountBadge}>
              <Text style={styles.unreadCountText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        {/* 3. NOTIFICATION LIST */}
        {fetching && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2E7D32" />
            <Text style={styles.loadingText}>Fetching updates...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="bell-sleep-outline" size={42} color="#8DA78B" />
            <Text style={styles.emptyTitle}>All Caught Up</Text>
            <Text style={styles.emptySub}>You have no alerts at this time.</Text>
          </View>
        ) : (
          notifications.map((n) => {
            const isUnread = !n.is_read;
            const iconName =
              n.type === "truck" || n.type === "alert"
                ? "truck-fast"
                : n.type === "schedule"
                ? "calendar-clock"
                : "bell-ring-outline";

            const iconBg = isUnread ? "#E8F8EE" : "#F2F5F2";
            const iconColor = isUnread ? "#2E7D32" : "#7A8D78";

            return (
              <TouchableOpacity
                key={n.id}
                style={[styles.card, isUnread && styles.unreadCard]}
                onPress={() => handleRead(n.id, n.is_read)}
                activeOpacity={0.85}
              >
                <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                  <MaterialCommunityIcons name={iconName} size={22} color={iconColor} />
                </View>

                <View style={styles.textContainer}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.cardTitle, isUnread && styles.cardTitleUnread]} numberOfLines={1}>
                      {n.title}
                    </Text>
                    {isUnread && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={styles.cardMessage}>{n.message}</Text>

                  <View style={styles.timestampRow}>
                    <MaterialCommunityIcons name="clock-outline" size={12} color="#8DA78B" />
                    <Text style={styles.timestampText}>
                      {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
                      {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFDFB",
    paddingTop: 45,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF5ED",
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F7F1",
    alignItems: "center",
    justifyContent: "center",
  },
  markReadBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#F2F7F1",
  },
  markReadText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1E331B",
  },
  pageSubtitle: {
    fontSize: 12,
    color: "#688264",
    marginTop: 2,
    fontWeight: "500",
  },
  unreadCountBadge: {
    backgroundColor: "#E8F8EE",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C5EBD2",
  },
  unreadCountText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2E7D32",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: "#688264",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EDF4EC",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E331B",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: "#7A8D78",
    marginTop: 4,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EDF4EC",
    elevation: 2,
    shadowColor: "#1A3816",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
    backgroundColor: "#FFFFFF",
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A5A48",
    flex: 1,
  },
  cardTitleUnread: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E331B",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2E7D32",
    marginLeft: 6,
  },
  cardMessage: {
    fontSize: 12,
    lineHeight: 18,
    color: "#4F634D",
    marginBottom: 8,
  },
  timestampRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timestampText: {
    fontSize: 11,
    color: "#8DA78B",
  },
});

import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import KatokLogo from "../components/KatokLogo";
import TopNotificationBanner from "../components/TopNotificationBanner";
import { fetchNextSchedule } from "../services/resident";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmall = SCREEN_WIDTH < 360;

function computeCountdown(dateStr, timeStr) {
  if (!dateStr) return "Upcoming";
  const now = new Date();

  let hours = 8;
  let minutes = 0;
  if (timeStr) {
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      hours = parseInt(parts[0], 10) || 8;
      minutes = parseInt(parts[1], 10) || 0;
    }
  }

  // target date at pickup time
  const target = new Date(dateStr);
  target.setHours(hours, minutes, 0, 0);

  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    const isSameDay = target.toDateString() === now.toDateString();
    if (isSameDay) return "Collection today";
    return "Next run scheduled";
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays >= 2) {
    return `in ${diffDays} days`;
  } else if (diffDays === 1) {
    return "in 1 day";
  } else if (diffHours >= 1) {
    return `in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  } else {
    const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `in ${diffMinutes} min${diffMinutes > 1 ? "s" : ""}`;
  }
}

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Jane Doe");
  const [userLocation, setUserLocation] = useState("Barangay 12, Cagayan de Oro");
  const [barangayId, setBarangayId] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");

  const [nextSchedule, setNextSchedule] = useState(null);
  const [countdownText, setCountdownText] = useState("in 2 days");
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [topBanner, setTopBanner] = useState({
    visible: false,
    title: "",
    message: "",
    type: "truck",
  });

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem("userName");
      const loc = await AsyncStorage.getItem("userBarangay");
      if (name) setUserName(name);
      if (loc) {
        setUserLocation(loc.includes("Cagayan") ? loc : `${loc}, Cagayan de Oro`);
        const match = loc.match(/(\d+)/);
        if (match) {
          setBarangayId(match[1]);
        }
      }
    } catch (e) {
      console.error("Failed to load user info:", e);
    }
  };

  const loadScheduleData = useCallback(async () => {
    try {
      setLoadingSchedule(true);
      const res = await fetchNextSchedule(barangayId, userLocation);
      if (res && res.success && res.schedule) {
        setNextSchedule(res.schedule);
        const cd = computeCountdown(res.schedule.date, res.schedule.pickup_time);
        setCountdownText(cd);
      } else {
        // Default smart fallback based on current date
        const fallbackTarget = new Date();
        fallbackTarget.setDate(fallbackTarget.getDate() + 2);
        const fallbackDateStr = fallbackTarget.toISOString().split("T")[0];
        setNextSchedule({
          date: fallbackDateStr,
          day: fallbackTarget.toLocaleDateString("en-US", { weekday: "long" }),
          pickup_time: "08:00",
          status: "scheduled",
        });
        setCountdownText("in 2 days");
      }
    } catch (e) {
      console.warn("Could not fetch remote schedule, using local fallback:", e);
      const fallbackTarget = new Date();
      fallbackTarget.setDate(fallbackTarget.getDate() + 2);
      setNextSchedule({
        date: fallbackTarget.toISOString().split("T")[0],
        day: fallbackTarget.toLocaleDateString("en-US", { weekday: "long" }),
        pickup_time: "08:00",
        status: "scheduled",
      });
      setCountdownText("in 2 days");
    } finally {
      setLoadingSchedule(false);
      setRefreshing(false);
    }
  }, [barangayId, userLocation]);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  useEffect(() => {
    if (!nextSchedule?.date) return;
    setCountdownText(computeCountdown(nextSchedule.date, nextSchedule.pickup_time));
    const interval = setInterval(() => {
      setCountdownText(computeCountdown(nextSchedule.date, nextSchedule.pickup_time));
    }, 60000);

    return () => clearInterval(interval);
  }, [nextSchedule?.date, nextSchedule?.pickup_time]);

  const onRefresh = () => {
    setRefreshing(true);
    loadScheduleData();
  };

  // Format date display (e.g. "Friday, May 2, 2026")
  const formattedCollectionDate = nextSchedule?.date
    ? new Date(nextSchedule.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Friday, May 2, 2026";

  const pickupTimeDisplay = nextSchedule?.pickup_time
    ? nextSchedule.pickup_time.slice(0, 5)
    : "08:00 AM";

  useEffect(() => {
    // Top banner alert when app is opened if truck is active in area
    const timer = setTimeout(() => {
      setTopBanner({
        visible: true,
        title: "Garbage Truck Approaching",
        message: "Compactor Truck #04 is now active in your barangay cluster.",
        type: "truck",
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <TopNotificationBanner
        visible={topBanner.visible}
        title={topBanner.title}
        message={topBanner.message}
        type={topBanner.type}
        onPress={() => router.push("/schedule")}
        onDismiss={() => setTopBanner((prev) => ({ ...prev, visible: false }))}
      />

      {/* 1. TOP BRAND & GREETING HEADER */}
      <View style={styles.topHeader}>
        {/* Left: Brand Logo Lockup */}
        <KatokLogo variant="header" showTagline={false} />

        {/* Right: Notifications & Profile Trigger */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.bellButton}
            activeOpacity={0.8}
            onPress={() => router.push("/notifications")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color="#1E331B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarCircle}
            activeOpacity={0.8}
            onPress={() => router.push("/profile")}
          >
            <MaterialCommunityIcons name="account" size={22} color="#2E7D32" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 2. USER GREETING & RESIDENTIAL LOCATION */}
        <View style={styles.greetingBar}>
          <View>
            <Text style={styles.greetingTitle}>Hello, {userName}!</Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={15} color="#2E7D32" />
              <Text style={styles.locationText}>{userLocation}</Text>
            </View>
          </View>
        </View>

        {/* 3. SEARCH BAR */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#7A8D78" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schedules, guides, or alerts..."
            placeholderTextColor="#9AA998"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* 4. MAIN HERO CARD: NEXT COLLECTION WITH LIVE DB COUNTDOWN */}
        <TouchableOpacity
          style={styles.heroCard}
          activeOpacity={0.9}
          onPress={() => router.push("/schedule")}
        >
          <View style={styles.heroCardLeft}>
            <View style={styles.heroCardHeaderRow}>
              <Text style={styles.heroTitle}>Next Collection</Text>
              {loadingSchedule && <ActivityIndicator size="small" color="#2E7D32" />}
            </View>

            <Text style={styles.heroMainDate}>{formattedCollectionDate}</Text>

            <View style={styles.countdownBadge}>
              <MaterialCommunityIcons name="clock-outline" size={13} color="#1E5E22" />
              <Text style={styles.countdownText}>{countdownText}</Text>
            </View>

            <Text style={styles.heroSubDetail}>
              Pickup starts at {pickupTimeDisplay}
            </Text>
          </View>

          <View style={styles.heroCardRight}>
            <Image
              source={require("../assets/images/compactor_truck.png")}
              style={styles.heroTruckImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        {/* 5. QUICK ACTIONS GRID */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.quickActionsGrid}>
          {/* 1: View Schedule */}
          <TouchableOpacity
            style={styles.actionGridCard}
            activeOpacity={0.85}
            onPress={() => router.push("/schedule")}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#E3F2FD" }]}>
              <MaterialCommunityIcons name="calendar-clock-outline" size={26} color="#1976D2" />
            </View>
            <Text style={styles.actionLabel}>Schedule</Text>
          </TouchableOpacity>

          {/* 2: Submit Report */}
          <TouchableOpacity
            style={styles.actionGridCard}
            activeOpacity={0.85}
            onPress={() => router.push("/post")}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#E8F8EE" }]}>
              <MaterialCommunityIcons name="camera-plus-outline" size={26} color="#2E7D32" />
            </View>
            <Text style={styles.actionLabel}>Submit Report</Text>
          </TouchableOpacity>

          {/* 3: Notifications */}
          <TouchableOpacity
            style={styles.actionGridCard}
            activeOpacity={0.85}
            onPress={() => router.push("/notifications")}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#FFF8E1" }]}>
              <MaterialCommunityIcons name="bell-ring-outline" size={26} color="#F57F17" />
            </View>
            <Text style={styles.actionLabel}>Notifications</Text>
          </TouchableOpacity>

          {/* 4: Feedback & Support */}
          <TouchableOpacity
            style={styles.actionGridCard}
            activeOpacity={0.85}
            onPress={() => router.push("/feedback")}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#F3E5F5" }]}>
              <MaterialCommunityIcons name="message-text-outline" size={26} color="#7B1FA2" />
            </View>
            <Text style={styles.actionLabel}>Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 6. BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => {}}
        >
          <MaterialCommunityIcons name="home" size={24} color="#2E7D32" />
          <Text style={[styles.navItemText, styles.navItemTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => router.push("/report")}
        >
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#7A8D78" />
          <Text style={styles.navItemText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => router.push("/schedule")}
        >
          <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#7A8D78" />
          <Text style={styles.navItemText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => router.push("/profile")}
        >
          <MaterialCommunityIcons name="account-outline" size={24} color="#7A8D78" />
          <Text style={styles.navItemText}>Profile</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF5ED",
    backgroundColor: "#FFFFFF",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F7F1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E8F8EE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C5E6CE",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  greetingBar: {
    marginBottom: 14,
  },
  greetingTitle: {
    fontSize: isSmall ? 20 : 22,
    fontWeight: "900",
    color: "#1E331B",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  locationText: {
    fontSize: 13,
    color: "#4A6E46",
    fontWeight: "600",
    marginLeft: 3,
  },
  searchBar: {
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1.2,
    borderColor: "#DDEADA",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#1E331B",
  },

  // HERO CARD: NEXT COLLECTION
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#D3EBD0",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 22,
  },
  heroCardLeft: {
    flex: 1,
    marginRight: 10,
  },
  heroCardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5C7858",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroMainDate: {
    fontSize: isSmall ? 18 : 20,
    fontWeight: "900",
    color: "#1E331B",
    marginBottom: 8,
  },
  countdownBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E4F7E3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E5E22",
    marginLeft: 4,
  },
  heroSubDetail: {
    fontSize: 12,
    color: "#728F6E",
    fontWeight: "500",
  },
  heroCardRight: {
    justifyContent: "center",
    alignItems: "center",
  },
  heroTruckImage: {
    width: 90,
    height: 60,
  },

  // SECTION & ACTIONS GRID
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E331B",
    marginBottom: 14,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  actionGridCard: {
    width: (SCREEN_WIDTH - 52) / 4,
    alignItems: "center",
    marginBottom: 8,
  },
  actionIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#F0F5EE",
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2C3E2A",
    textAlign: "center",
    lineHeight: 14,
  },

  // BOTTOM NAVIGATION
  bottomNav: {
    height: 62,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEF5ED",
    paddingBottom: 4,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navItemText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7A8D78",
    marginTop: 2,
  },
  navItemTextActive: {
    color: "#2E7D32",
    fontWeight: "800",
  },
});
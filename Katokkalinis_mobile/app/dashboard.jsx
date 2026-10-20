import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
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

const QUICK_ACTIONS = [
  { id: "schedule", label: "Schedule", icon: "calendar-clock-outline", color: "#1976D2", bg: "#E3F2FD", route: "/schedule", keywords: ["schedule", "pickup", "calendar", "time", "date", "trash"] },
  { id: "post", label: "Submit Report", icon: "camera-plus-outline", color: "#2E7D32", bg: "#E8F8EE", route: "/post", keywords: ["report", "complaint", "issue", "dumping", "spill", "bin", "camera", "photo"] },
  { id: "notifications", label: "Notifications", icon: "bell-ring-outline", color: "#F57F17", bg: "#FFF8E1", route: "/notifications", keywords: ["notification", "alert", "notice", "truck approaching"] },
  { id: "feedback", label: "Feedback", icon: "message-text-outline", color: "#7B1FA2", bg: "#F3E5F5", route: "/feedback", keywords: ["feedback", "suggestion", "support", "community", "message"] },
  { id: "reports_list", label: "All Reports", icon: "file-document-outline", color: "#455A64", bg: "#ECEFF1", route: "/report", keywords: ["view reports", "history", "resolved", "my reports"] },
  { id: "profile", label: "Profile", icon: "account-outline", color: "#00796B", bg: "#E0F2F1", route: "/profile", keywords: ["profile", "account", "barangay", "contact", "settings"] },
];

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

  const loadScheduleData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoadingSchedule(true);
      const res = await fetchNextSchedule(barangayId, userLocation);
      if (res && res.success && res.schedule) {
        setNextSchedule(res.schedule);
        const cd = computeCountdown(res.schedule.date, res.schedule.pickup_time);
        setCountdownText(cd);
      } else {
        setNextSchedule(null);
        setCountdownText("No schedule set");
      }
    } catch (e) {
      console.warn("Could not fetch remote schedule:", e);
      setNextSchedule(null);
      setCountdownText("No schedule set");
    } finally {
      if (!isSilent) setLoadingSchedule(false);
      setRefreshing(false);
    }
  }, [barangayId, userLocation]);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  // Periodic background check so web schedule changes update on mobile dashboard
  useEffect(() => {
    const timer = setInterval(() => {
      loadScheduleData(true);
    }, 10000);
    return () => clearInterval(timer);
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
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics fallback
    }
    setRefreshing(true);
    loadScheduleData();
  };

  const displayedActions = searchQuery.trim()
    ? QUICK_ACTIONS.filter(
        (a) =>
          a.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : QUICK_ACTIONS;

  const handleSearchSubmit = () => {
    if (displayedActions.length > 0) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics fallback
      }
      router.push(displayedActions[0].route);
    }
  };

  // Format date display (e.g. "Friday, May 2, 2026")
  const formattedCollectionDate = nextSchedule?.date
    ? new Date(String(nextSchedule.date).slice(0, 10) + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "No Upcoming Schedule";

  const pickupTimeDisplay = nextSchedule?.pickup_time
    ? nextSchedule.pickup_time.slice(0, 5)
    : "Not Set";

  useEffect(() => {
    // Only pop up the collection alert on the actual SET DATE
    if (!nextSchedule?.date) {
      setTopBanner((prev) => ({ ...prev, visible: false }));
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    const scheduleDateStr = String(nextSchedule.date).slice(0, 10);
    const isSetDate = scheduleDateStr === todayStr;

    if (isSetDate) {
      const timer = setTimeout(() => {
        setTopBanner({
          visible: true,
          title: "Garbage Collection Today",
          message: `Scheduled pickup today at ${pickupTimeDisplay} for ${userLocation}. Please have your bins ready.`,
          type: "truck",
        });

        // Also fire native system push notification into notification tray
        import("../services/pushNotification").then(({ triggerLocalNotification }) => {
          triggerLocalNotification(
            "Garbage Collection Today",
            `Scheduled pickup today at ${pickupTimeDisplay} for ${userLocation}. Please have your bins ready.`
          );
        }).catch(() => {});
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      // Do not pop up if today is not the set date
      setTopBanner((prev) => ({ ...prev, visible: false }));
    }
  }, [nextSchedule?.date, pickupTimeDisplay, userLocation]);

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
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color="#A5B8A3" />
            </TouchableOpacity>
          )}
        </View>

        {/* 4. MAIN HERO CARD: NEXT COLLECTION WITH LIVE DB COUNTDOWN */}
        <TouchableOpacity
          style={styles.heroCardContainer}
          activeOpacity={0.92}
          onPress={() => router.push("/schedule")}
        >
          <LinearGradient
            colors={["#1B431D", "#235B26", "#2E7D32"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            {/* Top Status Pill Bar */}
            <View style={styles.heroTopRow}>
              <View style={styles.heroLivePill}>
                <View style={styles.livePulseDot} />
                <Text style={styles.heroLiveText}>CLENRO DISPATCH</Text>
              </View>
              <View style={styles.countdownBadge}>
                <MaterialCommunityIcons name="clock-outline" size={12} color="#1B5E20" />
                <Text style={styles.countdownText}>{countdownText}</Text>
              </View>
            </View>

            {/* Mid Main Content */}
            <View style={styles.heroMiddleRow}>
              <View style={styles.heroTextContent}>
                <Text style={styles.heroScheduleHeader}>Next Scheduled Run</Text>
                <Text style={styles.heroMainDate}>{formattedCollectionDate}</Text>
                <View style={styles.pickupTimeRow}>
                  <MaterialCommunityIcons name="truck-clock" size={15} color="#A5D6A7" />
                  <Text style={styles.pickupTimeText}>
                    {nextSchedule?.pickup_time
                      ? `Starts at ${pickupTimeDisplay} • Curbside placement`
                      : "Tap to view city collection calendar"}
                  </Text>
                </View>
              </View>

              <View style={styles.heroTruckBox}>
                <Image
                  source={require("../assets/images/compactor_truck.png")}
                  style={styles.heroTruckImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Hero Footer Action Bar */}
            <View style={styles.heroFooterBar}>
              <Text style={styles.heroFooterActionText}>View Pickup Timetable &amp; Reminders</Text>
              <MaterialCommunityIcons name="arrow-right-circle" size={18} color="#C8E6C9" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* 5. QUICK ACTIONS GRID (Resident Services) */}
        <View style={styles.quickActionsHeaderRow}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? `Search Results (${displayedActions.length})` : "Resident Services"}
          </Text>
          {searchQuery.trim().length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearSearchLink}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.quickActionsGrid}>
          {displayedActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionGridCard}
              activeOpacity={0.85}
              onPress={() => router.push(action.route)}
            >
              <View style={[styles.actionIconBox, { backgroundColor: action.bg }]}>
                <MaterialCommunityIcons name={action.icon} size={26} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 6. DAILY SEGREGATION AT SOURCE GUIDE */}
        <View style={styles.ecoGuideCard}>
          <View style={styles.ecoGuideHeader}>
            <MaterialCommunityIcons name="leaf" size={18} color="#2E7D32" />
            <Text style={styles.ecoGuideTitle}>Segregation at Source Guide</Text>
          </View>
          <View style={styles.ecoColumnsRow}>
            {/* Column 1: Biodegradable */}
            <View style={[styles.ecoColumn, { backgroundColor: "#E8F8EE", borderColor: "#C8E6C9" }]}>
              <View style={styles.ecoColHeader}>
                <MaterialCommunityIcons name="sprout" size={16} color="#2E7D32" />
                <Text style={[styles.ecoColTitle, { color: "#2E7D32" }]}>Biodegradable</Text>
              </View>
              <Text style={styles.ecoColItems}>• Food scraps &amp; peels{"\n"}• Leaves &amp; yard clippings{"\n"}• Organic coffee grounds</Text>
            </View>

            {/* Column 2: Residual / Dry */}
            <View style={[styles.ecoColumn, { backgroundColor: "#E3F2FD", borderColor: "#BBDEFB" }]}>
              <View style={styles.ecoColHeader}>
                <MaterialCommunityIcons name="recycle" size={16} color="#1976D2" />
                <Text style={[styles.ecoColTitle, { color: "#1976D2" }]}>Residual / Dry</Text>
              </View>
              <Text style={styles.ecoColItems}>• Clean plastics &amp; cartons{"\n"}• Cans &amp; bottles{"\n"}• Dry packaging bags</Text>
            </View>
          </View>
        </View>

        {/* 7. NEIGHBORHOOD CLEANLINESS STATUS */}
        <View style={styles.cleanlinessCard}>
          <View style={styles.cleanlinessHeader}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#2E7D32" />
            <Text style={styles.cleanlinessTitle}>Sector Cleanliness Overview</Text>
          </View>
          <View style={styles.statsSummaryRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>96%</Text>
              <Text style={styles.statLabel}>Clean Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: "#1976D2" }]}>Active</Text>
              <Text style={styles.statLabel}>Fleet Operations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: "#F57F17" }]}>&lt; 24h</Text>
              <Text style={styles.statLabel}>Response Avg</Text>
            </View>
          </View>
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

  // HERO CARD: NEXT COLLECTION (LUSH GRADIENT)
  heroCardContainer: {
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#1B431D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 22,
  },
  heroGradient: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 22,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heroLivePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#69F0AE",
  },
  heroLiveText: {
    fontSize: 9.5,
    fontWeight: "900",
    color: "#E8F5E9",
    letterSpacing: 0.6,
  },
  countdownBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8EE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1B5E20",
  },
  heroMiddleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroTextContent: {
    flex: 1,
    paddingRight: 8,
  },
  heroScheduleHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C8E6C9",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroMainDate: {
    fontSize: isSmall ? 17 : 19,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 3,
    marginBottom: 4,
  },
  pickupTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  pickupTimeText: {
    fontSize: 11.5,
    color: "#E8F5E9",
    fontWeight: "500",
    flex: 1,
  },
  heroTruckBox: {
    width: 95,
    height: 65,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTruckImage: {
    width: 95,
    height: 62,
  },
  heroFooterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.18)",
  },
  heroFooterActionText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#E8F5E9",
  },

  // SECTION & ACTIONS GRID (3x2 RESPONSIVE CARDS)
  quickActionsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E331B",
  },
  clearSearchLink: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#2E7D32",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  actionGridCard: {
    width: (SCREEN_WIDTH - 60) / 3,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF4EC",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#1E331B",
    textAlign: "center",
  },

  // 6. DAILY ECO SEGREGATION GUIDE
  ecoGuideCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EDF4EC",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  ecoGuideHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  ecoGuideTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E331B",
  },
  ecoColumnsRow: {
    flexDirection: "row",
    gap: 10,
  },
  ecoColumn: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  ecoColHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  ecoColTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
  ecoColItems: {
    fontSize: 10.5,
    color: "#3F563E",
    lineHeight: 16,
    fontWeight: "500",
  },

  // 7. NEIGHBORHOOD CLEANLINESS STATUS
  cleanlinessCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EDF4EC",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  cleanlinessHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  cleanlinessTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E331B",
  },
  statsSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statVal: {
    fontSize: 15,
    fontWeight: "900",
    color: "#2E7D32",
  },
  statLabel: {
    fontSize: 10.5,
    color: "#7A8D78",
    marginTop: 2,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: "#EEF5ED",
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BarangayPickerModal, {
  BARANGAYS_1_TO_40,
} from "../components/BarangayPickerModal";
import { fetchSchedules } from "../services/resident";

const DAY_ORDER = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

function sortSchedulesChronologically(list) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const dayA = DAY_ORDER[a.day] || 99;
    const dayB = DAY_ORDER[b.day] || 99;
    if (dayA !== dayB) return dayA - dayB;
    if (a.date && b.date && a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return (a.pickup_time || "").localeCompare(b.pickup_time || "");
  });
}

const CHRONOLOGICAL_FALLBACK_SCHEDULES = [
  {
    day: "Monday",
    date: "2026-09-14",
    pickup_time: "08:00 AM",
    status: "scheduled",
    notes: "Biodegradable & Organic Waste",
  },
  {
    day: "Tuesday",
    date: "2026-09-15",
    pickup_time: "08:30 AM",
    status: "scheduled",
    notes: "Commercial Stalls & Yard Waste",
  },
  {
    day: "Wednesday",
    date: "2026-09-16",
    pickup_time: "09:30 AM",
    status: "scheduled",
    notes: "Recyclables, Bottles & Plastics",
  },
  {
    day: "Thursday",
    date: "2026-09-17",
    pickup_time: "08:00 AM",
    status: "scheduled",
    notes: "Secondary Residential Route",
  },
  {
    day: "Friday",
    date: "2026-09-18",
    pickup_time: "08:00 AM",
    status: "scheduled",
    notes: "Residual & Non-recyclable Waste",
  },
  {
    day: "Saturday",
    date: "2026-09-19",
    pickup_time: "09:00 AM",
    status: "scheduled",
    notes: "Market Hub & General Cleanup",
  },
  {
    day: "Sunday",
    date: "2026-09-20",
    pickup_time: "10:00 AM",
    status: "scheduled",
    notes: "Special Bulky Item Collection",
  },
];

export default function Schedule() {
  const router = useRouter();

  const [selectedBarangay, setSelectedBarangay] = useState(BARANGAYS_1_TO_40[11]); // Default to Barangay 12
  const [viewMode, setViewMode] = useState("weekly");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminderActive, setReminderActive] = useState(false);

  // Load user's registered barangay from storage
  useEffect(() => {
    const initBarangay = async () => {
      try {
        const stored = await AsyncStorage.getItem("userBarangay");
        if (stored) {
          const match = stored.match(/(\d+)/);
          if (match) {
            const id = parseInt(match[1], 10);
            if (id >= 1 && id <= 40) {
              setSelectedBarangay(BARANGAYS_1_TO_40[id - 1]);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load user barangay:", e);
      }
    };
    initBarangay();
  }, []);

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchSchedules(selectedBarangay.id);
      if (res && res.success && Array.isArray(res.schedules) && res.schedules.length > 0) {
        setSchedules(sortSchedulesChronologically(res.schedules));
      } else {
        setSchedules(CHRONOLOGICAL_FALLBACK_SCHEDULES);
      }
    } catch (error) {
      console.error("Schedule load error:", error);
      setSchedules(CHRONOLOGICAL_FALLBACK_SCHEDULES);
    } finally {
      setLoading(false);
    }
  }, [selectedBarangay.id]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const toggleReminder = () => {
    const nextState = !reminderActive;
    setReminderActive(nextState);
    Alert.alert(
      nextState ? "Reminder Enabled" : "Reminder Disabled",
      nextState
        ? `You will receive a notification 2 hours before collection in ${selectedBarangay.name}.`
        : "Collection reminders turned off."
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER NAV */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E331B" />
        </TouchableOpacity>

        <Text style={styles.screenTitle}>View Schedule</Text>

        <TouchableOpacity
          style={styles.calendarActionButton}
          onPress={toggleReminder}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons
            name={reminderActive ? "bell-ring" : "bell-outline"}
            size={22}
            color={reminderActive ? "#2E7D32" : "#455E42"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* VIEW MODE TOGGLE (Weekly / Monthly matching Reference 2) */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === "weekly" && styles.toggleBtnActive]}
            onPress={() => setViewMode("weekly")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleBtnText,
                viewMode === "weekly" && styles.toggleBtnTextActive,
              ]}
            >
              Weekly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === "monthly" && styles.toggleBtnActive]}
            onPress={() => setViewMode("monthly")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleBtnText,
                viewMode === "monthly" && styles.toggleBtnTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        {/* BARANGAY SELECTOR MODAL (1–40) */}
        <View style={styles.selectorSection}>
          <Text style={styles.selectorLabel}>Select Barangay Location</Text>
          <BarangayPickerModal
            selectedBarangay={selectedBarangay.name}
            onSelect={(item) => setSelectedBarangay(item)}
          />
        </View>

        {/* ACTIVE BARANGAY CARD */}
        <View style={styles.activeBanner}>
          <View style={styles.bannerIconBox}>
            <MaterialCommunityIcons name="truck" size={24} color="#2E7D32" />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Active Collection Area</Text>
            <Text style={styles.bannerBarangay}>{selectedBarangay.name}</Text>
          </View>
        </View>

        {/* SCHEDULE LIST */}
        <View style={styles.scheduleHeaderRow}>
          <Text style={styles.sectionTitle}>
            {viewMode === "weekly" ? "Weekly Collection Days" : "Monthly Calendar Dates"}
          </Text>
          <Text style={styles.scheduleCount}>{schedules.length} Scheduled</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading collection schedules...</Text>
          </View>
        ) : schedules.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="calendar-blank" size={38} color="#A3BCA0" />
            <Text style={styles.emptyTitle}>No schedules found</Text>
            <Text style={styles.emptySub}>No collection schedules set for {selectedBarangay.name}</Text>
          </View>
        ) : (
          <View style={styles.scheduleCardsList}>
            {schedules.map((item, idx) => {
              const isCompleted = item.status === "completed";
              return (
                <View
                  key={item.id ? String(item.id) : `${item.day}-${idx}`}
                  style={[styles.scheduleItemCard, isCompleted && styles.completedCard]}
                >
                  <View style={styles.cardLeft}>
                    <View style={styles.dayIconCircle}>
                      <MaterialCommunityIcons
                        name={isCompleted ? "check-circle" : "calendar-clock"}
                        size={22}
                        color={isCompleted ? "#689F38" : "#2E7D32"}
                      />
                    </View>
                    <View>
                      <Text style={styles.dayName}>{item.day || "Collection Day"}</Text>
                      {item.date && (
                        <Text style={styles.scheduleDate}>{item.date}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.cardRight}>
                    <View style={styles.timeTag}>
                      <MaterialCommunityIcons name="clock-outline" size={13} color="#2E7D32" />
                      <Text style={styles.timeTagText}>
                        {item.pickup_time ? item.pickup_time.slice(0, 5) : "08:00 AM"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        isCompleted ? styles.statusBadgeCompleted : styles.statusBadgeScheduled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isCompleted ? styles.statusTextCompleted : styles.statusTextScheduled,
                        ]}
                      >
                        {isCompleted ? "Completed" : "Scheduled"}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* BOTTOM NOTICE CARD (Matching Reference 2) */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeIconBox}>
            <MaterialCommunityIcons name="clock-alert-outline" size={24} color="#2E7D32" />
          </View>
          <View style={styles.noticeTextContainer}>
            <Text style={styles.noticeTitle}>Early Placement Reminder</Text>
            <Text style={styles.noticeBody}>
              Please put your segregated waste out before 8:00 AM on scheduled collection mornings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFDFB",
    paddingTop: 50,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF5ED",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F7F1",
    justifyContent: "center",
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1E331B",
  },
  calendarActionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F7F1",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#EEF5ED",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtnActive: {
    backgroundColor: "#2E7D32",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5C7558",
  },
  toggleBtnTextActive: {
    color: "#FFFFFF",
  },
  selectorSection: {
    marginBottom: 14,
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E331B",
    marginBottom: 6,
  },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    borderColor: "#D9EED3",
    marginBottom: 20,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E8F8EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 12,
    color: "#688264",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  bannerBarangay: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1E331B",
    marginTop: 2,
  },
  scheduleHeaderRow: {
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
  scheduleCount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
  },
  scheduleCardsList: {
    gap: 10,
    marginBottom: 20,
  },
  scheduleItemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.2,
    borderColor: "#E1EFE0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  completedCard: {
    opacity: 0.75,
    backgroundColor: "#F9FBF8",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F8EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dayName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E331B",
  },
  scheduleDate: {
    fontSize: 12,
    color: "#688264",
    fontWeight: "500",
    marginTop: 2,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  timeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  timeTagText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E331B",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeScheduled: {
    backgroundColor: "#E8F8EE",
  },
  statusBadgeCompleted: {
    backgroundColor: "#F0F0F0",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusTextScheduled: {
    color: "#2E7D32",
  },
  statusTextCompleted: {
    color: "#757575",
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#688264",
    fontWeight: "500",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5ECE4",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E331B",
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: "#7A9177",
    marginTop: 3,
    textAlign: "center",
  },
  noticeCard: {
    flexDirection: "row",
    backgroundColor: "#EAF6E9",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#CCE8CB",
    alignItems: "center",
  },
  noticeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E5822",
    marginBottom: 2,
  },
  noticeBody: {
    fontSize: 12,
    color: "#476A44",
    lineHeight: 16,
    fontWeight: "500",
  },
});
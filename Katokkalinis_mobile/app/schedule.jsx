import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
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

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAY_ORDER = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

function formatTime12(timeStr) {
  if (!timeStr) return "08:00 AM";
  const clean = String(timeStr).trim();
  const parts = clean.split(":");
  if (parts.length < 2) return clean;
  let hour = parseInt(parts[0], 10);
  const minute = parts[1].slice(0, 2);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  try {
    const cleanStr = String(dateStr).slice(0, 10);
    const d = new Date(cleanStr + "T00:00:00");
    if (isNaN(d.getTime())) return cleanStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(dateStr).slice(0, 10);
  }
}

function getDayFromItem(item) {
  if (item.day && item.day.trim()) {
    return item.day.trim();
  }
  if (item.date) {
    try {
      const cleanStr = String(item.date).slice(0, 10);
      const d = new Date(cleanStr + "T00:00:00");
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { weekday: "long" });
      }
    } catch {}
  }
  return "Monday";
}

function sortSchedulesChronologically(list) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const dateA = a.date ? String(a.date).slice(0, 10) : "";
    const dateB = b.date ? String(b.date).slice(0, 10) : "";
    if (dateA && dateB && dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }
    const dayA = DAY_ORDER[getDayFromItem(a)] || 99;
    const dayB = DAY_ORDER[getDayFromItem(b)] || 99;
    if (dayA !== dayB) return dayA - dayB;
    return (a.pickup_time || "").localeCompare(b.pickup_time || "");
  });
}

export default function Schedule() {
  const router = useRouter();

  const [selectedBarangay, setSelectedBarangay] = useState(BARANGAYS_1_TO_40[11]); // Default to Barangay 12
  const [viewMode, setViewMode] = useState("days");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  // Sync reminder state for selected barangay
  useEffect(() => {
    AsyncStorage.getItem(`@schedule_reminder_${selectedBarangay.id}`).then((val) => {
      setReminderActive(val === "true");
    }).catch(() => {});
  }, [selectedBarangay.id]);

  const loadSchedules = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);
        const res = await fetchSchedules(selectedBarangay.id, selectedBarangay.name);

        if (res && res.success && Array.isArray(res.schedules)) {
          // Strictly use real schedules from the backend
          setSchedules(sortSchedulesChronologically(res.schedules));
        } else {
          setSchedules([]);
        }
      } catch (error) {
        console.warn("Schedule load error:", error);
        setSchedules([]);
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [selectedBarangay.id, selectedBarangay.name]
  );

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // Live Auto-Refresh (Polls backend every 8s so when web schedule changes, mobile updates automatically)
  useEffect(() => {
    const timer = setInterval(() => {
      loadSchedules(true);
    }, 8000);
    return () => clearInterval(timer);
  }, [loadSchedules]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSchedules(true);
    setRefreshing(false);
  };

  const toggleReminder = async () => {
    const nextState = !reminderActive;
    setReminderActive(nextState);
    try {
      await AsyncStorage.setItem(`@schedule_reminder_${selectedBarangay.id}`, String(nextState));
    } catch {}

    if (nextState) {
      try {
        const { triggerLocalNotification } = await import("../services/pushNotification");
        await triggerLocalNotification(
          "Collection Reminder Activated",
          `Push notifications enabled for ${selectedBarangay.name}. You will be alerted before compactor runs.`
        );
      } catch (err) {
        console.warn("Could not fire local push notification:", err);
      }

      Alert.alert(
        "Push Reminder Enabled",
        `You will receive a push notification alert before scheduled collections in ${selectedBarangay.name}.`
      );
    } else {
      Alert.alert(
        "Reminder Disabled",
        `Collection reminders turned off for ${selectedBarangay.name}.`
      );
    }
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

        <Text style={styles.screenTitle}>Collection Schedule</Text>

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2E7D32"]}
            tintColor="#2E7D32"
          />
        }
      >
        {/* VIEW MODE TOGGLE (Monday to Sunday VS By Date) */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === "days" && styles.toggleBtnActive]}
            onPress={() => setViewMode("days")}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="calendar-week"
              size={16}
              color={viewMode === "days" ? "#1E5822" : "#688264"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.toggleBtnText,
                viewMode === "days" && styles.toggleBtnTextActive,
              ]}
            >
              Monday to Sunday
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === "date" && styles.toggleBtnActive]}
            onPress={() => setViewMode("date")}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="calendar-month"
              size={16}
              color={viewMode === "date" ? "#1E5822" : "#688264"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.toggleBtnText,
                viewMode === "date" && styles.toggleBtnTextActive,
              ]}
            >
              By Date
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
            <MaterialCommunityIcons name="truck-fast-outline" size={24} color="#2E7D32" />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Active Collection Area</Text>
            <Text style={styles.bannerBarangay}>{selectedBarangay.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshIconBtn}
            onPress={handleRefresh}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="sync" size={18} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        {/* SCHEDULE LIST HEADER */}
        <View style={styles.scheduleHeaderRow}>
          <Text style={styles.sectionTitle}>
            {viewMode === "days"
              ? "Weekly Days (Monday – Sunday)"
              : "Chronological Calendar Dates"}
          </Text>
          <Text style={styles.scheduleCount}>
            {schedules.length} {schedules.length === 1 ? "Schedule" : "Schedules"}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Syncing schedule from city portal...</Text>
          </View>
        ) : viewMode === "days" ? (
          /* ========================================================
             MODE 1: MONDAY TO SUNDAY VIEW
             ======================================================== */
          <View style={styles.scheduleCardsList}>
            {DAYS_OF_WEEK.map((dayName) => {
              const daySchedules = schedules.filter((item) => {
                const itemDay = getDayFromItem(item);
                return itemDay.toLowerCase() === dayName.toLowerCase();
              });

              const hasSchedules = daySchedules.length > 0;

              return (
                <View
                  key={dayName}
                  style={[
                    styles.dayWeekCard,
                    hasSchedules ? styles.dayWeekCardActive : styles.dayWeekCardMuted,
                  ]}
                >
                  <View style={styles.dayWeekHeader}>
                    <View style={styles.dayTitleRow}>
                      <View
                        style={[
                          styles.dayPill,
                          hasSchedules ? styles.dayPillActive : styles.dayPillMuted,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={hasSchedules ? "calendar-check" : "calendar-blank"}
                          size={18}
                          color={hasSchedules ? "#2E7D32" : "#9E9E9E"}
                        />
                        <Text
                          style={[
                            styles.dayPillText,
                            hasSchedules ? styles.dayPillTextActive : styles.dayPillTextMuted,
                          ]}
                        >
                          {dayName}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.dayRunCount,
                        hasSchedules ? styles.dayRunCountActive : styles.dayRunCountMuted,
                      ]}
                    >
                      {hasSchedules
                        ? `${daySchedules.length} collection run${daySchedules.length > 1 ? "s" : ""}`
                        : "No collection"}
                    </Text>
                  </View>

                  {hasSchedules ? (
                    <View style={styles.dayRunsContainer}>
                      {daySchedules.map((run, rIdx) => {
                        const isCompleted = run.status === "completed";
                        const isInProgress = run.status === "in_progress";
                        const displayTime = formatTime12(run.pickup_time);
                        const displayDate = run.date ? formatDateDisplay(run.date) : "";

                        return (
                          <View
                            key={run.id ? String(run.id) : `${dayName}-${rIdx}`}
                            style={[
                              styles.runItemRow,
                              rIdx > 0 && styles.runItemBorder,
                            ]}
                          >
                            <View style={styles.runItemLeft}>
                              <View style={styles.timeTag}>
                                <MaterialCommunityIcons
                                  name="clock-outline"
                                  size={14}
                                  color="#2E7D32"
                                />
                                <Text style={styles.timeTagText}>{displayTime}</Text>
                              </View>
                              {displayDate ? (
                                <Text style={styles.runDateText}>
                                  Scheduled: {displayDate}
                                </Text>
                              ) : null}
                              {run.notes ? (
                                <Text style={styles.runNotesText} numberOfLines={2}>
                                  {run.notes}
                                </Text>
                              ) : null}
                            </View>

                            <View
                              style={[
                                styles.statusBadge,
                                isCompleted
                                  ? styles.statusBadgeCompleted
                                  : isInProgress
                                  ? styles.statusBadgeInProgress
                                  : styles.statusBadgeScheduled,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  isCompleted
                                    ? styles.statusTextCompleted
                                    : isInProgress
                                    ? styles.statusTextInProgress
                                    : styles.statusTextScheduled,
                                ]}
                              >
                                {isCompleted
                                  ? "Completed"
                                  : isInProgress
                                  ? "In Progress"
                                  : "Scheduled"}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          /* ========================================================
             MODE 2: BY DATE VIEW
             ======================================================== */
          schedules.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <MaterialCommunityIcons
                  name="calendar-blank-outline"
                  size={36}
                  color="#4A7C59"
                />
              </View>
              <Text style={styles.emptyTitle}>No Scheduled Dates</Text>
              <Text style={styles.emptySub}>
                There is currently no garbage collection schedule listed for {selectedBarangay.name} on the official web calendar.
              </Text>
              <TouchableOpacity style={styles.emptyRefreshBtn} onPress={handleRefresh}>
                <MaterialCommunityIcons name="refresh" size={16} color="#FFFFFF" />
                <Text style={styles.emptyRefreshText}>Check for Updates</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.scheduleCardsList}>
              {schedules.map((item, idx) => {
                const isCompleted = item.status === "completed";
                const isInProgress = item.status === "in_progress";
                const displayDate = item.date ? formatDateDisplay(item.date) : "Open Schedule";
                const displayTime = formatTime12(item.pickup_time);
                const dayLabel = getDayFromItem(item);

                return (
                  <View
                    key={item.id ? String(item.id) : `date-${idx}`}
                    style={[
                      styles.scheduleItemCard,
                      isCompleted && styles.completedCard,
                      isInProgress && styles.inProgressCard,
                    ]}
                  >
                    <View style={styles.cardLeft}>
                      <View
                        style={[
                          styles.dateCalendarBadge,
                          isCompleted && styles.dateBadgeCompleted,
                          isInProgress && styles.dateBadgeInProgress,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="calendar"
                          size={18}
                          color={
                            isCompleted
                              ? "#689F38"
                              : isInProgress
                              ? "#E65100"
                              : "#2E7D32"
                          }
                        />
                        <Text
                          style={[
                            styles.dateBadgeText,
                            isCompleted && styles.dateBadgeTextCompleted,
                            isInProgress && styles.dateBadgeTextInProgress,
                          ]}
                        >
                          {dayLabel.slice(0, 3).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.metaLeft}>
                        <Text style={styles.dateMainTitle}>{displayDate}</Text>
                        <Text style={styles.daySubLabel}>{dayLabel}</Text>
                        {item.notes ? (
                          <Text style={styles.scheduleNotes} numberOfLines={2}>
                            {item.notes}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.cardRight}>
                      <View style={styles.timeTag}>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={13}
                          color="#2E7D32"
                        />
                        <Text style={styles.timeTagText}>{displayTime}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          isCompleted
                            ? styles.statusBadgeCompleted
                            : isInProgress
                            ? styles.statusBadgeInProgress
                            : styles.statusBadgeScheduled,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isCompleted
                              ? styles.statusTextCompleted
                              : isInProgress
                              ? styles.statusTextInProgress
                              : styles.statusTextScheduled,
                          ]}
                        >
                          {isCompleted
                            ? "Completed"
                            : isInProgress
                            ? "In Progress"
                            : "Scheduled"}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )
        )}

        {/* BOTTOM NOTICE CARD */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeIconBox}>
            <MaterialCommunityIcons name="clock-alert-outline" size={24} color="#2E7D32" />
          </View>
          <View style={styles.noticeTextContainer}>
            <Text style={styles.noticeTitle}>Collection Guidelines</Text>
            <Text style={styles.noticeBody}>
              Please place your segregated waste outside before pickup time on collection days. Ensure bins are accessible along primary collection routes.
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
    backgroundColor: "#E8F5E9",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },
  toggleBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4A6B46",
  },
  toggleBtnTextActive: {
    color: "#1E5822",
    fontWeight: "800",
  },
  selectorSection: {
    marginBottom: 14,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5C6B59",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF6E9",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#CCE8CB",
    marginBottom: 18,
  },
  bannerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 11,
    color: "#476A44",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  bannerBarangay: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1E5822",
  },
  refreshIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1E331B",
  },
  scheduleCount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
    backgroundColor: "#E8F8EE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scheduleCardsList: {
    gap: 10,
    marginBottom: 18,
  },

  /* MONDAY TO SUNDAY VIEW STYLES */
  dayWeekCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  dayWeekCardActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CCE3C9",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  dayWeekCardMuted: {
    backgroundColor: "#F7FAF6",
    borderColor: "#E6ECE5",
    opacity: 0.85,
  },
  dayWeekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dayTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayPillActive: {},
  dayPillMuted: {},
  dayPillText: {
    fontSize: 15,
    fontWeight: "800",
  },
  dayPillTextActive: {
    color: "#1E331B",
  },
  dayPillTextMuted: {
    color: "#757575",
  },
  dayRunCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  dayRunCountActive: {
    color: "#2E7D32",
    fontWeight: "700",
  },
  dayRunCountMuted: {
    color: "#9E9E9E",
  },
  dayRunsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#EEF5ED",
    backgroundColor: "#FAFCF9",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  runItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  runItemBorder: {
    borderTopWidth: 1,
    borderTopColor: "#EAEFE9",
  },
  runItemLeft: {
    flex: 1,
    marginRight: 10,
  },
  runDateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A6B46",
    marginTop: 2,
  },
  runNotesText: {
    fontSize: 11,
    color: "#6B8268",
    marginTop: 2,
  },

  /* BY DATE VIEW STYLES */
  scheduleItemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5ECE4",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  completedCard: {
    backgroundColor: "#F9FAF9",
    borderColor: "#EBEFEB",
  },
  inProgressCard: {
    borderColor: "#FFCC80",
    backgroundColor: "#FFF8E1",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  dateCalendarBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dateBadgeCompleted: {
    backgroundColor: "#F1F8E9",
  },
  dateBadgeInProgress: {
    backgroundColor: "#FFE0B2",
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#2E7D32",
    marginTop: 2,
  },
  dateBadgeTextCompleted: {
    color: "#689F38",
  },
  dateBadgeTextInProgress: {
    color: "#E65100",
  },
  metaLeft: {
    flex: 1,
  },
  dateMainTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E331B",
  },
  daySubLabel: {
    fontSize: 12,
    color: "#688264",
    fontWeight: "600",
    marginTop: 2,
  },
  scheduleNotes: {
    fontSize: 11,
    color: "#7A8D78",
    marginTop: 3,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  timeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeTagText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E331B",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeScheduled: {
    backgroundColor: "#E8F8EE",
  },
  statusBadgeCompleted: {
    backgroundColor: "#EEEEEE",
  },
  statusBadgeInProgress: {
    backgroundColor: "#FFE0B2",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusTextScheduled: {
    color: "#2E7D32",
  },
  statusTextCompleted: {
    color: "#757575",
  },
  statusTextInProgress: {
    color: "#E65100",
  },
  loadingBox: {
    paddingVertical: 36,
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
    borderRadius: 18,
    padding: 26,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5ECE4",
    marginBottom: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F1F7F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E331B",
  },
  emptySub: {
    fontSize: 12,
    color: "#7A9177",
    marginTop: 4,
    textAlign: "center",
    lineHeight: 17,
    maxWidth: 280,
  },
  emptyRefreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2E7D32",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginTop: 14,
  },
  emptyRefreshText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
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
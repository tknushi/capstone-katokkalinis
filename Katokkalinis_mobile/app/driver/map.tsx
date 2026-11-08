import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import KatokLogo from "../../components/KatokLogo";
import TopNotificationBanner from "../../components/TopNotificationBanner";
import {
  BarangayItem,
  getBarangays1to40,
  getDriverAssignedRoutes,
  updateDriverRouteProgress,
} from "../../services/driver";

interface RouteCorridorMeta {
  id: 1 | 2 | 3 | 4;
  code: string;
  name: string;
  truck: string;
  rangeLabel: string;
  startBrgy: number;
  endBrgy: number;
  scheduleDays: string;
  scheduleWindow: string;
  color: string;
  coverage: string;
}

const ROUTE_CORRIDORS: RouteCorridorMeta[] = [
  {
    id: 1,
    code: "R1",
    name: "North Poblacion Corridor",
    truck: "KAL-101",
    rangeLabel: "Barangays 1 to 10",
    startBrgy: 1,
    endBrgy: 10,
    scheduleDays: "Mon • Wed • Fri",
    scheduleWindow: "06:00 AM – 09:00 AM",
    color: "#2E7D32",
    coverage:
      "City Health, Fernandez St., Burgos, Macabalan Port Access, Gaabucayan (Barangays 1–10).",
  },
  {
    id: 2,
    code: "R2",
    name: "Central Poblacion & Cogon Corridor",
    truck: "KAL-102",
    rangeLabel: "Barangays 11 to 20",
    startBrgy: 11,
    endBrgy: 20,
    scheduleDays: "Tue • Thu • Sat",
    scheduleWindow: "07:00 AM – 10:00 AM",
    color: "#1976D2",
    coverage:
      "Tirso Neri, JR Borja, Cogon Public Market Periphery, Commercial District (Barangays 11–20).",
  },
  {
    id: 3,
    code: "R3",
    name: "East Poblacion Corridor",
    truck: "KAL-103",
    rangeLabel: "Barangays 21 to 30",
    startBrgy: 21,
    endBrgy: 30,
    scheduleDays: "Tue • Thu • Sat",
    scheduleWindow: "08:00 AM – 11:00 AM",
    color: "#F57C00",
    coverage:
      "Agora Access, Provincial Capitol Perimeter, Velez Central, Daumar St. (Barangays 21–30).",
  },
  {
    id: 4,
    code: "R4",
    name: "South Poblacion & Market Link",
    truck: "KAL-104",
    rangeLabel: "Barangays 31 to 40",
    startBrgy: 31,
    endBrgy: 40,
    scheduleDays: "Mon • Wed • Fri",
    scheduleWindow: "08:00 AM – 11:00 AM",
    color: "#7B1FA2",
    coverage:
      "Cogon Public Market South Bay, City Hall & Gaston Park, Carmen Public Market Bridge Approach (Barangays 31–40).",
  },
];

const WASTE_CATEGORIES = [
  "Biodegradable",
  "Recyclable",
  "Residual",
  "Special Waste",
];

const ISSUE_TYPES = [
  "Blocked Road",
  "Vehicle Breakdown",
  "Heavy Traffic / Delay",
  "Access Obstruction",
];

const CLEARED_STOPS_STORAGE_KEY = "driver_cleared_stops_v1";

export default function DriverMap() {
  const router = useRouter();
  const [driverUser, setDriverUser] = useState<any>(null);
  const [assignedRoutes, setAssignedRoutes] = useState<any[]>([]);
  const [selectedAssignedIdx, setSelectedAssignedIdx] = useState(0);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Stop Waste Logging Modal State
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [activeStop, setActiveStop] = useState<any>(null);
  const [stopTonnage, setStopTonnage] = useState("1.5");
  const [stopWasteCategory, setStopWasteCategory] = useState("Residual");

  // Operational Issue Modal State
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [issueType, setIssueType] = useState("Blocked Road");
  const [issueLocation, setIssueLocation] = useState("");
  const [issueDescription, setIssueDescription] = useState("");

  const [barangays, setBarangays] = useState<BarangayItem[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<1 | 2 | 3 | 4 | "all">(4);
  const [clearedStops, setClearedStops] = useState<Record<string, boolean>>({});
  const [banner, setBanner] = useState({
    visible: true,
    title: "Assigned Collection Routes • Driver Module",
    message:
      "View your website-scheduled collection route, update stop progress, log waste tonnage, or report operational issues.",
    type: "truck" as "truck" | "info" | "success",
  });

  useEffect(() => {
    initDriverRoutes();
    loadBarangays();
    loadClearedStops();
  }, []);

  const initDriverRoutes = async () => {
    setLoadingRoutes(true);
    try {
      let user: any = null;
      const rawUser =
        (await AsyncStorage.getItem("katokkalinis_user")) ||
        (await AsyncStorage.getItem("user"));
      if (rawUser) {
        try {
          user = JSON.parse(rawUser);
        } catch {}
      }
      setDriverUser(user);
      const routes = await getDriverAssignedRoutes({
        driverId: user?.id ? Number(user.id) : undefined,
      });
      setAssignedRoutes(routes);
      setSelectedAssignedIdx(0);
    } catch (e) {
      console.warn("Failed to load assigned routes", e);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const refreshAssignedRoutes = async () => {
    setLoadingRoutes(true);
    try {
      const routes = await getDriverAssignedRoutes({
        driverId: driverUser?.id ? Number(driverUser.id) : undefined,
      });
      setAssignedRoutes(routes);
    } catch {}
    setLoadingRoutes(false);
  };

  const loadBarangays = async () => {
    try {
      const data = await getBarangays1to40();
      setBarangays(data);
    } catch (e) {
      console.warn("Failed to load barangays", e);
    }
  };

  const loadClearedStops = async () => {
    try {
      const raw = await AsyncStorage.getItem(CLEARED_STOPS_STORAGE_KEY);
      if (raw) {
        setClearedStops(JSON.parse(raw));
      }
    } catch {}
  };

  const toggleStopCleared = async (brgyName: string) => {
    const updated = {
      ...clearedStops,
      [brgyName]: !clearedStops[brgyName],
    };
    setClearedStops(updated);
    try {
      await AsyncStorage.setItem(CLEARED_STOPS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const currentAssignedRoute = assignedRoutes[selectedAssignedIdx] || null;

  const handleStartRoute = async () => {
    if (!currentAssignedRoute) return;
    setActionLoading(true);
    try {
      const res = await updateDriverRouteProgress(currentAssignedRoute.id, {
        action: "start_route",
        driver_id: driverUser?.id,
      });
      if (res?.success && res.route) {
        const next = [...assignedRoutes];
        next[selectedAssignedIdx] = res.route;
        setAssignedRoutes(next);
        setBanner({
          visible: true,
          title: "Collection Started (Ongoing)",
          message: `${res.route.route_name || "Route"} is now Ongoing. Progress synced with Admin & Residents.`,
          type: "success",
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const openStopCompletionModal = (stop: any) => {
    setActiveStop(stop);
    setStopTonnage(stop?.waste_tonnage ? String(stop.waste_tonnage) : "1.5");
    setStopWasteCategory(stop?.waste_category || "Residual");
    setStopModalVisible(true);
  };

  const handleConfirmStopWaste = async () => {
    if (!currentAssignedRoute || !activeStop) return;
    setActionLoading(true);
    try {
      const res = await updateDriverRouteProgress(currentAssignedRoute.id, {
        action: "complete_stop",
        stop_order: activeStop.stop_order,
        stop_name: activeStop.name,
        completed: true,
        waste_tonnage: parseFloat(stopTonnage) || 1.2,
        waste_category: stopWasteCategory,
        driver_id: driverUser?.id,
      });
      if (res?.success && res.route) {
        const next = [...assignedRoutes];
        next[selectedAssignedIdx] = res.route;
        setAssignedRoutes(next);
        setStopModalVisible(false);
        setBanner({
          visible: true,
          title: `Stop Cleared • ${activeStop.name}`,
          message: `Recorded ${stopTonnage}t (${stopWasteCategory}) and updated route timeline.`,
          type: "success",
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const openReportIssueModal = () => {
    setIssueType("Blocked Road");
    setIssueLocation(
      currentAssignedRoute?.collection_stops?.[0]?.name ||
        currentAssignedRoute?.start_location ||
        "Barangay 1"
    );
    setIssueDescription("");
    setIssueModalVisible(true);
  };

  const handleSubmitIssue = async () => {
    if (!currentAssignedRoute) return;
    setActionLoading(true);
    try {
      const res = await updateDriverRouteProgress(currentAssignedRoute.id, {
        action: "report_issue",
        issue_type: issueType,
        stop_name: issueLocation || currentAssignedRoute.start_location,
        issue_description:
          issueDescription.trim() || `${issueType} reported along assigned route.`,
        mark_delayed: true,
        driver_id: driverUser?.id,
      });
      if (res?.success && res.route) {
        const next = [...assignedRoutes];
        next[selectedAssignedIdx] = res.route;
        setAssignedRoutes(next);
        setIssueModalVisible(false);
        setBanner({
          visible: true,
          title: `Issue Reported • Route Delayed`,
          message: `${issueType} logged to central database and Admin dashboard notified.`,
          type: "info",
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteRoute = async () => {
    if (!currentAssignedRoute) return;
    setActionLoading(true);
    try {
      const res = await updateDriverRouteProgress(currentAssignedRoute.id, {
        action: "complete_route",
        driver_id: driverUser?.id,
      });
      if (res?.success && res.route) {
        const next = [...assignedRoutes];
        next[selectedAssignedIdx] = res.route;
        setAssignedRoutes(next);
        setBanner({
          visible: true,
          title: "Collection Route Completed",
          message: `${res.route.route_name || "Route"} marked Completed and synced to Admin & Resident apps.`,
          type: "success",
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeStyle = (status?: string) => {
    const s = String(status || "scheduled").toLowerCase();
    if (s === "completed") {
      return { bg: "#DCFCE7", text: "#166534", label: "Completed" };
    }
    if (s === "ongoing" || s === "in_progress") {
      return { bg: "#DBEAFE", text: "#1E40AF", label: "Ongoing" };
    }
    if (s === "delayed") {
      return { bg: "#FEE2E2", text: "#991B1B", label: "Delayed" };
    }
    return { bg: "#FEF3C7", text: "#92400E", label: "Scheduled" };
  };

  const activeRouteMeta =
    selectedRouteId === "all"
      ? ROUTE_CORRIDORS[3]
      : ROUTE_CORRIDORS.find((r) => r.id === selectedRouteId) || ROUTE_CORRIDORS[3];

  const routeStops = barangays.filter((b) => {
    const num = Number(b.number || b.id);
    if (selectedRouteId === "all") return num >= 1 && num <= 40;
    return num >= activeRouteMeta.startBrgy && num <= activeRouteMeta.endBrgy;
  });

  const clearedInViewCount = routeStops.filter(
    (b) => clearedStops[b.name] || (b.today_logs_count && b.today_logs_count > 0)
  ).length;

  return (
    <View style={styles.container}>
      <TopNotificationBanner
        visible={banner.visible}
        title={banner.title}
        message={banner.message}
        type={banner.type}
        onDismiss={() => setBanner((prev) => ({ ...prev, visible: false }))}
      />

      {/* 1. TOP HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1E331B" />
          </TouchableOpacity>
          <KatokLogo variant="header" showTagline={false} />
        </View>

        <TouchableOpacity
          style={styles.truckActiveBadge}
          onPress={refreshAssignedRoutes}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="sync" size={14} color="#2E7D32" />
          <Text style={styles.truckActiveText}>
            {currentAssignedRoute?.assigned_vehicle?.plate_number || "KAL-101"} •{" "}
            {currentAssignedRoute?.route_name || "Assigned Run"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. TITLE SECTION */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Assigned Collection Routes</Text>
          <Text style={styles.pageSubtitle}>
            Website-Scheduled Routes • Start/End Route, Barangay Stops & Timeline (Asia/Manila)
          </Text>
        </View>

        {/* 3. WEBSITE-ASSIGNED COLLECTION ROUTE CARD (DRIVER EXECUTION MODULE) */}
        <View style={styles.assignedCard}>
          <View style={styles.assignedCardHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
              <MaterialCommunityIcons name="routes" size={20} color="#15803D" />
              <Text style={styles.assignedCardTitle}>
                Website-Assigned Collection Schedule
              </Text>
            </View>
            {currentAssignedRoute && (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusBadgeStyle(currentAssignedRoute.status).bg },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: getStatusBadgeStyle(currentAssignedRoute.status).text },
                  ]}
                >
                  {getStatusBadgeStyle(currentAssignedRoute.status).label}
                </Text>
              </View>
            )}
          </View>

          {/* Route Selector Pills if multiple routes exist */}
          {assignedRoutes.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsRow}
            >
              {assignedRoutes.map((rt, idx) => {
                const isSelected = idx === selectedAssignedIdx;
                return (
                  <TouchableOpacity
                    key={rt.id}
                    style={[
                      styles.routeFilterPill,
                      isSelected && {
                        backgroundColor: "#15803D",
                        borderColor: "#15803D",
                      },
                    ]}
                    onPress={() => setSelectedAssignedIdx(idx)}
                  >
                    <Text
                      style={[
                        styles.routeFilterPillText,
                        isSelected && { color: "#FFFFFF", fontWeight: "800" },
                      ]}
                    >
                      {rt.route_name || `Route #${rt.id}`} ({rt.collection_date})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {loadingRoutes ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <ActivityIndicator color="#15803D" size="small" />
              <Text style={{ fontSize: 12, color: "#688264", marginTop: 6 }}>
                Syncing assigned routes from CLENRO central database...
              </Text>
            </View>
          ) : currentAssignedRoute ? (
            <>
              {/* Start Location & End Location Banner */}
              <View style={styles.startEndBox}>
                <View style={styles.startEndRow}>
                  <View style={[styles.endpointDot, { backgroundColor: "#16A34A" }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.endpointLabel}>START ROUTE (STARTING LOCATION)</Text>
                    <Text style={styles.endpointValue}>
                      {currentAssignedRoute.start_location || "Dispatch Point"}
                    </Text>
                  </View>
                </View>
                <View style={styles.endpointConnector} />
                <View style={styles.startEndRow}>
                  <View style={[styles.endpointDot, { backgroundColor: "#DC2626" }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.endpointLabel}>END ROUTE (FINAL DESTINATION)</Text>
                    <Text style={styles.endpointValue}>
                      {currentAssignedRoute.end_location || "Waste Disposal Facility"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Date, Starting Time, Travel Duration, & Estimated Arrival Time */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricCell}>
                  <Text style={styles.metricLabel}>COLLECTION DATE</Text>
                  <Text style={styles.metricValue}>
                    {currentAssignedRoute.collection_date || "Today"}
                  </Text>
                </View>
                <View style={styles.metricCell}>
                  <Text style={styles.metricLabel}>STARTING TIME</Text>
                  <Text style={styles.metricValue}>
                    {currentAssignedRoute.start_time_formatted || "9:00 AM"}
                  </Text>
                </View>
                <View style={styles.metricCell}>
                  <Text style={styles.metricLabel}>EST. TRAVEL DURATION</Text>
                  <Text style={[styles.metricValue, { color: "#15803D" }]}>
                    {currentAssignedRoute.estimated_duration || "3 hours"}
                  </Text>
                </View>
                <View style={styles.metricCell}>
                  <Text style={styles.metricLabel}>EST. ARRIVAL TIME</Text>
                  <Text style={[styles.metricValue, { color: "#1E40AF" }]}>
                    {currentAssignedRoute.estimated_arrival_formatted || "12:00 PM"}
                  </Text>
                </View>
              </View>

              {/* Assigned Barangay Collection Stops in Sequence */}
              <Text style={styles.stopsSubheading}>
                Assigned Barangay Collection Stops (Tap stop to log waste & mark done)
              </Text>
              <View style={{ gap: 8, marginBottom: 12 }}>
                {(currentAssignedRoute.collection_stops || []).map(
                  (stop: any, sIdx: number) => {
                    const isStopDone = stop.status === "completed";
                    return (
                      <TouchableOpacity
                        key={`${stop.name}-${sIdx}`}
                        style={[
                          styles.orderedStopRow,
                          isStopDone && styles.orderedStopRowDone,
                        ]}
                        onPress={() => openStopCompletionModal(stop)}
                        activeOpacity={0.85}
                      >
                        <View
                          style={[
                            styles.stopSeqBadge,
                            isStopDone && { backgroundColor: "#16A34A" },
                          ]}
                        >
                          <Text style={styles.stopSeqText}>{sIdx + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.orderedStopName}>{stop.name}</Text>
                          <Text style={styles.orderedStopSub}>
                            Est. Arrival: {stop.arrival_time || "Scheduled"} • Stop Duration:{" "}
                            {stop.duration_minutes || 20} mins
                            {stop.waste_tonnage
                              ? ` • Logged: ${stop.waste_tonnage}t (${stop.waste_category || "Residual"})`
                              : ""}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.stopActionPill,
                            isStopDone && { backgroundColor: "#DCFCE7" },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={isStopDone ? "check-circle" : "scale"}
                            size={14}
                            color={isStopDone ? "#166534" : "#15803D"}
                          />
                          <Text
                            style={[
                              styles.stopActionPillText,
                              isStopDone && { color: "#166534" },
                            ]}
                          >
                            {isStopDone ? "Completed" : "Log Waste"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>

              {/* Route Schedule Timeline */}
              <View style={styles.timelineContainer}>
                <Text style={styles.timelineTitle}>
                  Route Schedule Timeline ({currentAssignedRoute.route_name || "Route A"})
                </Text>
                {(currentAssignedRoute.timeline || []).map((step: any, tIdx: number) => {
                  const dotColor =
                    step.type === "start"
                      ? "#16A34A"
                      : step.type === "end"
                      ? "#DC2626"
                      : step.status === "completed"
                      ? "#16A34A"
                      : "#2563EB";
                  const lineText =
                    step.type === "start"
                      ? `${step.time} – Collection Starts (${step.location})`
                      : step.type === "end"
                      ? `${step.time} – Estimated Arrival at Final Destination (${step.location})`
                      : `${step.time} – ${step.label}`;
                  return (
                    <View key={`tl-${tIdx}`} style={styles.timelineStepRow}>
                      <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
                      <Text style={styles.timelineStepText}>{lineText}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Driver Operational Action Buttons */}
              <View style={styles.driverActionsRow}>
                <TouchableOpacity
                  style={[styles.driverActionBtn, { backgroundColor: "#15803D" }]}
                  onPress={handleStartRoute}
                  disabled={actionLoading}
                >
                  <MaterialCommunityIcons name="play-circle" size={16} color="#FFF" />
                  <Text style={styles.driverActionBtnText}>Start Collection</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.driverActionBtn, { backgroundColor: "#D97706" }]}
                  onPress={openReportIssueModal}
                  disabled={actionLoading}
                >
                  <MaterialCommunityIcons name="alert-octagon" size={16} color="#FFF" />
                  <Text style={styles.driverActionBtnText}>Report Issue</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.driverActionBtn, { backgroundColor: "#1E40AF" }]}
                  onPress={handleCompleteRoute}
                  disabled={actionLoading}
                >
                  <MaterialCommunityIcons name="check-decagram" size={16} color="#FFF" />
                  <Text style={styles.driverActionBtnText}>Complete Route</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={{ fontSize: 12, color: "#688264", paddingVertical: 10 }}>
              No collection routes assigned yet. Routes created by Administrators on the website will appear here automatically.
            </Text>
          )}
        </View>

        {/* 4. ASSIGNED CORRIDOR & BARANGAY STOPS MODULE */}
        <View style={styles.corridorCard}>
          <View style={styles.corridorCardHeader}>
            <View style={styles.corridorCardTitleRow}>
              <MaterialCommunityIcons name="map-marker-path" size={18} color="#15803D" />
              <Text style={styles.corridorCardTitle}>
                {selectedRouteId === "all"
                  ? "All Pilot Corridors (Barangays 1–40)"
                  : `${activeRouteMeta.name} (${activeRouteMeta.truck})`}
              </Text>
            </View>
            <Text style={styles.stopsProgressPill}>
              {clearedInViewCount}/{routeStops.length || (selectedRouteId === "all" ? 40 : 10)} Cleared
            </Text>
          </View>

          {/* Route Filter Selector Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsRow}
          >
            {[
              { id: 4 as const, label: "R4 South • KAL-104 (Assigned)", color: "#7B1FA2" },
              { id: 1 as const, label: "R1 North • KAL-101", color: "#2E7D32" },
              { id: 2 as const, label: "R2 Central • KAL-102", color: "#1976D2" },
              { id: 3 as const, label: "R3 East • KAL-103", color: "#F57C00" },
              { id: "all" as const, label: "All Pilot Stops (1–40)", color: "#15803D" },
            ].map((tab) => {
              const isSelected = selectedRouteId === tab.id;
              return (
                <TouchableOpacity
                  key={String(tab.id)}
                  style={[
                    styles.routeFilterPill,
                    isSelected && {
                      backgroundColor: tab.color,
                      borderColor: tab.color,
                    },
                  ]}
                  onPress={() => setSelectedRouteId(tab.id)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.routeFilterPillText,
                      isSelected && { color: "#FFFFFF", fontWeight: "800" },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Schedule Summary Strip */}
          <View style={styles.scheduleSummaryBox}>
            <View style={styles.scheduleCol}>
              <Text style={styles.scheduleLabel}>COLLECTION DAYS</Text>
              <Text style={styles.scheduleValue}>
                {selectedRouteId === "all" ? "Mon – Sat Roster" : activeRouteMeta.scheduleDays}
              </Text>
            </View>
            <View style={styles.scheduleCol}>
              <Text style={styles.scheduleLabel}>TIME WINDOW</Text>
              <Text style={styles.scheduleValue}>
                {selectedRouteId === "all" ? "06:00 AM – 11:00 AM" : activeRouteMeta.scheduleWindow}
              </Text>
            </View>
            <View style={styles.scheduleCol}>
              <Text style={styles.scheduleLabel}>COVERAGE</Text>
              <Text style={[styles.scheduleValue, { color: "#15803D" }]}>
                {selectedRouteId === "all" ? "Brgy 1–40" : activeRouteMeta.rangeLabel}
              </Text>
            </View>
          </View>

          {/* Barangay Stops Checklist */}
          <Text style={styles.stopsSubheading}>
            Designated Barangay Pickup Stops (Tap stop to mark cleared)
          </Text>
          <View style={styles.stopsGrid}>
            {routeStops.slice(0, selectedRouteId === "all" ? 20 : 10).map((b) => {
              const isDone =
                Boolean(clearedStops[b.name]) ||
                Boolean(b.today_logs_count && b.today_logs_count > 0);
              return (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.stopChip, isDone && styles.stopChipDone]}
                  onPress={() => toggleStopCleared(b.name)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={isDone ? "check-circle" : "checkbox-blank-circle-outline"}
                    size={15}
                    color={isDone ? "#2E7D32" : "#7A8D78"}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.stopChipTitle, isDone && styles.stopChipTitleDone]}
                      numberOfLines={1}
                    >
                      {b.name}
                    </Text>
                    <Text style={styles.stopChipMeta}>
                      {b.today_collected_tons && b.today_collected_tons > 0
                        ? `${b.today_collected_tons} tons logged`
                        : isDone
                        ? "Stop Cleared"
                        : "Scheduled Stop"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* MODAL 1: RECORD WASTE TONNAGE & CATEGORY FOR BARANGAY STOP */}
      <Modal
        visible={stopModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStopModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Complete Stop & Record Waste: {activeStop?.name || "Barangay Stop"}
            </Text>
            <Text style={styles.modalSubtitle}>
              Record collected waste tonnage and category for this barangay collection point.
            </Text>

            <Text style={styles.inputLabel}>Collected Waste Tonnage (Metric Tons)</Text>
            <TextInput
              style={styles.textInput}
              value={stopTonnage}
              onChangeText={setStopTonnage}
              keyboardType="decimal-pad"
              placeholder="e.g. 1.5"
            />

            <Text style={styles.inputLabel}>Waste Category</Text>
            <View style={styles.categoryChipsWrap}>
              {WASTE_CATEGORIES.map((cat) => {
                const active = stopWasteCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryChip, active && styles.categoryChipActive]}
                    onPress={() => setStopWasteCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        active && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setStopModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleConfirmStopWaste}
                disabled={actionLoading}
              >
                <Text style={styles.modalSubmitBtnText}>
                  {actionLoading ? "Saving..." : "Save & Mark Stop Done"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: REPORT OPERATIONAL ISSUE (BLOCKED ROAD / BREAKDOWN) */}
      <Modal
        visible={issueModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIssueModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Report Operational Route Issue</Text>
            <Text style={styles.modalSubtitle}>
              Flag blocked roads, vehicle breakdowns, or delays to notify CLENRO Admin and update route status.
            </Text>

            <Text style={styles.inputLabel}>Issue Classification</Text>
            <View style={styles.categoryChipsWrap}>
              {ISSUE_TYPES.map((t) => {
                const active = issueType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.categoryChip,
                      active && { backgroundColor: "#DC2626", borderColor: "#DC2626" },
                    ]}
                    onPress={() => setIssueType(t)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        active && styles.categoryChipTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Affected Stop / Location</Text>
            <TextInput
              style={styles.textInput}
              value={issueLocation}
              onChangeText={setIssueLocation}
              placeholder="e.g. Barangay 2 Access Road"
            />

            <Text style={styles.inputLabel}>Operational Details</Text>
            <TextInput
              style={[styles.textInput, { height: 64, textAlignVertical: "top" }]}
              value={issueDescription}
              onChangeText={setIssueDescription}
              multiline
              placeholder="Describe the road obstruction, breakdown, or delay..."
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIssueModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: "#DC2626" }]}
                onPress={handleSubmitIssue}
                disabled={actionLoading}
              >
                <Text style={styles.modalSubmitBtnText}>
                  {actionLoading ? "Submitting..." : "Submit Issue & Flag Delay"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.8} onPress={() => {}}>
          <MaterialCommunityIcons name="map-marker-distance" size={24} color="#2E7D32" />
          <Text style={[styles.navItemText, styles.navItemTextActive]}>Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => router.push("/driver/dashboard" as any)}
        >
          <MaterialCommunityIcons name="truck-fast" size={24} color="#7A8D78" />
          <Text style={styles.navItemText}>Collection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => router.push("/driver/profile" as any)}
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F7F1",
    alignItems: "center",
    justifyContent: "center",
  },
  truckActiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8EE",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C5EBD2",
    gap: 5,
  },
  truckActiveText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2E7D32",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 95,
  },
  titleSection: {
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1E331B",
  },
  pageSubtitle: {
    fontSize: 11,
    color: "#688264",
    marginTop: 2,
    fontWeight: "500",
  },
  assignedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 13,
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  assignedCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  assignedCardTitle: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#14532D",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  startEndBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginBottom: 10,
  },
  startEndRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  endpointDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  endpointConnector: {
    width: 2,
    height: 12,
    backgroundColor: "#86EFAC",
    marginLeft: 4,
    marginVertical: 2,
  },
  endpointLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#688264",
    letterSpacing: 0.4,
  },
  endpointValue: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "#F8FAF8",
    borderRadius: 10,
    padding: 9,
    borderWidth: 1,
    borderColor: "#E2ECE1",
    marginBottom: 8,
    gap: 6,
  },
  metricCell: {
    width: "48%",
  },
  metricLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#688264",
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 1,
  },
  orderedStopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#F8FAF8",
    borderWidth: 1,
    borderColor: "#E2ECE1",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  orderedStopRowDone: {
    backgroundColor: "#ECFDF3",
    borderColor: "#86EFAC",
  },
  stopSeqBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  stopSeqText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  orderedStopName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E331B",
  },
  orderedStopSub: {
    fontSize: 10,
    color: "#556B53",
    fontWeight: "600",
    marginTop: 1,
  },
  stopActionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  stopActionPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#15803D",
  },
  timelineContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    gap: 5,
  },
  timelineTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 4,
  },
  timelineStepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineStepText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  driverActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  driverActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 9,
    borderRadius: 9,
  },
  driverActionBtnText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  corridorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DCEBDD",
    marginBottom: 16,
  },
  corridorCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  corridorCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  corridorCardTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#1E331B",
    flexShrink: 1,
  },
  stopsProgressPill: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#15803D",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  filterPillsRow: {
    flexDirection: "row",
    gap: 6,
    paddingBottom: 10,
  },
  routeFilterPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D6E3D5",
    backgroundColor: "#F4F8F4",
  },
  routeFilterPillText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#435941",
  },
  scheduleSummaryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F4FBF6",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  scheduleCol: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#688264",
    letterSpacing: 0.4,
  },
  scheduleValue: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },
  stopsSubheading: {
    fontSize: 11,
    fontWeight: "800",
    color: "#3F563E",
    marginTop: 8,
    marginBottom: 8,
  },
  stopsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  stopChip: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#F8FAF8",
    borderWidth: 1,
    borderColor: "#E2ECE1",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 9,
  },
  stopChipDone: {
    backgroundColor: "#ECFDF3",
    borderColor: "#A7F3D0",
  },
  stopChipTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#1E331B",
  },
  stopChipTitleDone: {
    color: "#166534",
  },
  stopChipMeta: {
    fontSize: 9.5,
    color: "#688264",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#14532D",
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: "#4B5563",
    marginTop: 4,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  categoryChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F3F4F6",
  },
  categoryChipActive: {
    backgroundColor: "#15803D",
    borderColor: "#15803D",
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16,
  },
  modalCancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  modalSubmitBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#15803D",
  },
  modalSubmitBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF5ED",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 4,
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 4,
  },
  navItemText: {
    fontSize: 10,
    color: "#7A8D78",
    marginTop: 2,
    fontWeight: "600",
  },
  navItemTextActive: {
    color: "#2E7D32",
    fontWeight: "800",
  },
});

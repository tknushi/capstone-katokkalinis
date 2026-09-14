import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import KatokLogo from "../../components/KatokLogo";
import PhilippinesMapView from "../../components/PhilippinesMapView";
import TopNotificationBanner from "../../components/TopNotificationBanner";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CollectionRecord {
  id: string;
  barangay: string;
  weightKg: string;
  binsCount: string;
  wasteType: string;
  timestamp: string;
}

export default function DriverDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("John Driver");
  const truckPlate = "KAL-104";
  const [isCollecting, setIsCollecting] = useState(false);
  const [routeCompleted, setRouteCompleted] = useState(false);

  // Record Collection Modal
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [selectedBrgy, setSelectedBrgy] = useState("Barangay 2 Main Ave");
  const [binsCount, setBinsCount] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [wasteType, setWasteType] = useState("Residual & Commercial");

  // Top Banner
  const [banner, setBanner] = useState({
    visible: false,
    title: "",
    message: "",
    type: "truck" as "truck" | "info" | "success" | "warning",
  });

  useEffect(() => {
    loadUserData();
    checkCollectionState();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem("userName");
      if (name) setUserName(name);
    } catch (e) {
      console.error(e);
    }
  };

  const checkCollectionState = async () => {
    try {
      const collecting = await AsyncStorage.getItem("driver_is_collecting");
      if (collecting === "true") setIsCollecting(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartCollection = async () => {
    setIsCollecting(true);
    setRouteCompleted(false);
    await AsyncStorage.setItem("driver_is_collecting", "true");
    setBanner({
      visible: true,
      title: "Collection Started",
      message: "GPS telemetry broadcasting. Driving Route #04 (Barangay 1 - 4).",
      type: "truck",
    });
  };

  const handleEndCollection = async () => {
    Alert.alert(
      "End Collection",
      "Are you sure you want to end current collection run and return to depot?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Run",
          style: "destructive",
          onPress: async () => {
            setIsCollecting(false);
            await AsyncStorage.setItem("driver_is_collecting", "false");
            setBanner({
              visible: true,
              title: "Collection Ended",
              message: "Run ended. Remember to log your waste disposal weight ticket.",
              type: "info",
            });
          },
        },
      ]
    );
  };

  const handleRouteCompleted = () => {
    Alert.alert(
      "Confirm Route Completion",
      "Mark all assigned 4 collection stops as fully cleared?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Completed",
          onPress: () => {
            setRouteCompleted(true);
            setIsCollecting(false);
            setBanner({
              visible: true,
              title: "Route Cleared",
              message: "All 4 stops completed successfully. Great job!",
              type: "success",
            });
          },
        },
      ]
    );
  };

  const handleSaveCollectionRecord = async () => {
    if (!binsCount.trim() && !weightKg.trim()) {
      Alert.alert("Validation", "Please specify bins emptied or weight collected.");
      return;
    }

    try {
      const newRecord: CollectionRecord = {
        id: Date.now().toString(),
        barangay: selectedBrgy,
        binsCount: binsCount.trim() || "N/A",
        weightKg: weightKg.trim() || "N/A",
        wasteType,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " • " + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };

      const existingRaw = await AsyncStorage.getItem("driver_collection_records");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      existing.unshift(newRecord);
      await AsyncStorage.setItem("driver_collection_records", JSON.stringify(existing));

      setRecordModalVisible(false);
      setBinsCount("");
      setWeightKg("");

      setBanner({
        visible: true,
        title: "Collection Recorded",
        message: `Logged ${newRecord.binsCount} bins for ${newRecord.barangay}.`,
        type: "success",
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not save collection record.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Alert Component (Requirement 14) */}
      <TopNotificationBanner
        visible={banner.visible}
        title={banner.title}
        message={banner.message}
        type={banner.type}
        onDismiss={() => setBanner((prev) => ({ ...prev, visible: false }))}
      />

      {/* 1. TOP BRAND & GREETING HEADER */}
      <View style={styles.topHeader}>
        <KatokLogo variant="header" showTagline={false} />

        <TouchableOpacity
          style={styles.greetingRight}
          activeOpacity={0.85}
          onPress={() => router.push("/driver/profile" as any)}
        >
          <View style={styles.greetingTextContainer}>
            <Text style={styles.greetingTitle}>Hello, {userName}!</Text>
            <View style={styles.statusBadgeRow}>
              <View style={[styles.statusDot, isCollecting ? styles.statusDotActive : styles.statusDotIdle]} />
              <Text style={styles.greetingSub}>
                {routeCompleted ? "Route Done" : isCollecting ? "Collecting" : "On Standby"}
              </Text>
            </View>
          </View>
          <View style={styles.avatarCircle}>
            <MaterialCommunityIcons name="account" size={22} color="#2E7D32" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. DRIVER DISPATCH INFO HERO CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <View style={styles.truckPlateBadge}>
              <MaterialCommunityIcons name="truck-check" size={14} color="#2E7D32" />
              <Text style={styles.truckPlateText}>Truck {truckPlate}</Text>
            </View>
            <Text style={styles.heroTitle}>Compactor Route #04</Text>
            <Text style={styles.heroSubtitle}>Barangays 1, 2, 3, 4 • Poblacion Hub</Text>
            <View style={styles.stopsIndicatorRow}>
              <MaterialCommunityIcons name="map-marker-path" size={14} color="#1E5E22" />
              <Text style={styles.stopsIndicatorText}>
                {routeCompleted ? "4 of 4 Stops Cleared" : isCollecting ? "Active at Stop 2 of 4" : "4 Scheduled Stops Today"}
              </Text>
            </View>
          </View>

          <View style={styles.heroRightStatus}>
            <View
              style={[
                styles.liveStatusPill,
                routeCompleted ? styles.liveStatusCompleted : isCollecting ? styles.liveStatusCollecting : styles.liveStatusStandby,
              ]}
            >
              <Text
                style={[
                  styles.liveStatusPillText,
                  routeCompleted ? styles.liveStatusTextCompleted : isCollecting ? styles.liveStatusTextCollecting : styles.liveStatusTextStandby,
                ]}
              >
                {routeCompleted ? "COMPLETED" : isCollecting ? "ACTIVE RUN" : "READY"}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. QUICK ACTIONS (Requirement 11) */}
        <Text style={styles.sectionTitle}>Driver Quick Actions</Text>

        <View style={styles.quickActionsGrid}>
          {/* Action 1: View Schedule */}
          <TouchableOpacity
            style={styles.actionGridCard}
            activeOpacity={0.85}
            onPress={() => router.push("/schedule")}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#E3F2FD" }]}>
              <MaterialCommunityIcons name="calendar-clock-outline" size={24} color="#1976D2" />
            </View>
            <Text style={styles.actionLabel}>View Schedule</Text>
          </TouchableOpacity>

          {/* Action 2: Start Collection */}
          <TouchableOpacity
            style={[styles.actionGridCard, isCollecting && styles.actionGridCardDisabled]}
            activeOpacity={0.85}
            onPress={handleStartCollection}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#E8F8EE" }]}>
              <MaterialCommunityIcons name="play-circle-outline" size={26} color="#2E7D32" />
            </View>
            <Text style={styles.actionLabel}>Start Collection</Text>
          </TouchableOpacity>

          {/* Action 3: Record Collection */}
          <TouchableOpacity
            style={styles.actionGridCard}
            activeOpacity={0.85}
            onPress={() => setRecordModalVisible(true)}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#FFF3E0" }]}>
              <MaterialCommunityIcons name="clipboard-edit-outline" size={24} color="#E65100" />
            </View>
            <Text style={styles.actionLabel}>Record Collection</Text>
          </TouchableOpacity>

          {/* Action 4: End Collection */}
          <TouchableOpacity
            style={[styles.actionGridCard, !isCollecting && styles.actionGridCardDisabled]}
            activeOpacity={0.85}
            onPress={handleEndCollection}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#FFEBEE" }]}>
              <MaterialCommunityIcons name="stop-circle-outline" size={26} color="#C62828" />
            </View>
            <Text style={styles.actionLabel}>End Collection</Text>
          </TouchableOpacity>

          {/* Action 5: Route Completed */}
          <TouchableOpacity
            style={[styles.actionGridCard, routeCompleted && styles.actionGridCardDisabled]}
            activeOpacity={0.85}
            onPress={handleRouteCompleted}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#EDE7F6" }]}>
              <MaterialCommunityIcons name="check-all" size={26} color="#512DA8" />
            </View>
            <Text style={styles.actionLabel}>Route Completed</Text>
          </TouchableOpacity>

          {/* Action 6: View Route Map Screen */}
          <TouchableOpacity
            style={styles.actionGridCard}
            activeOpacity={0.85}
            onPress={() => router.push("/driver/map" as any)}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#E0F2F1" }]}>
              <MaterialCommunityIcons name="map-marker-radius" size={24} color="#00796B" />
            </View>
            <Text style={styles.actionLabel}>Route Map</Text>
          </TouchableOpacity>
        </View>

        {/* 4. DEDICATED ROUTE MAP SECTION (Requirement 11 & 9) */}
        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Route Map & Navigation</Text>

        <PhilippinesMapView
          truckName="Compactor Truck #04"
          truckPlate={truckPlate}
          activeBarangay="Barangay 2, Cagayan de Oro"
          nextStopName="Barangay 3 Residential Zone"
          height={320}
          showControls={true}
        />
      </ScrollView>

      {/* RECORD COLLECTION MODAL */}
      <Modal visible={recordModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Collection Run</Text>
              <TouchableOpacity
                onPress={() => setRecordModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons name="close" size={22} color="#556655" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <Text style={styles.modalLabel}>Collection Stop</Text>
              <View style={styles.modalSelectRow}>
                {["Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4"].map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.modalChip, selectedBrgy.includes(b) && styles.modalChipActive]}
                    onPress={() => setSelectedBrgy(`${b} Main Ave`)}
                  >
                    <Text style={[styles.modalChipText, selectedBrgy.includes(b) && styles.modalChipTextActive]}>
                      {b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Bins Emptied</Text>
              <View style={styles.modalInputBox}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#7A8D78" />
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 18 commercial bins"
                  placeholderTextColor="#9AA998"
                  value={binsCount}
                  onChangeText={setBinsCount}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.modalLabel}>Estimated Weight (kg)</Text>
              <View style={styles.modalInputBox}>
                <MaterialCommunityIcons name="scale" size={18} color="#7A8D78" />
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 850 kg"
                  placeholderTextColor="#9AA998"
                  value={weightKg}
                  onChangeText={setWeightKg}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.modalLabel}>Waste Type</Text>
              <View style={styles.modalSelectRow}>
                {["Residual", "Biodegradable", "Recyclable", "Commercial"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.modalChip, wasteType.includes(t) && styles.modalChipActive]}
                    onPress={() => setWasteType(t)}
                  >
                    <Text style={[styles.modalChipText, wasteType.includes(t) && styles.modalChipTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveCollectionRecord}
                activeOpacity={0.88}
              >
                <Text style={styles.modalSubmitText}>Save to Collection History</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 5. BOTTOM NAVIGATION BAR (Requirement 13: Exactly 3 Tabs) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => router.push("/driver/map" as any)}
        >
          <MaterialCommunityIcons name="map-marker-distance" size={24} color="#7A8D78" />
          <Text style={styles.navItemText}>Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => router.push("/schedule")}
        >
          <MaterialCommunityIcons name="truck-fast" size={24} color="#2E7D32" />
          <Text style={[styles.navItemText, styles.navItemTextActive]}>Collection</Text>
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
  greetingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  greetingTextContainer: {
    alignItems: "flex-end",
    marginRight: 10,
  },
  greetingTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E331B",
  },
  statusBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusDotActive: {
    backgroundColor: "#2E7D32",
  },
  statusDotIdle: {
    backgroundColor: "#D97706",
  },
  greetingSub: {
    fontSize: 10,
    color: "#688264",
    fontWeight: "600",
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
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 95,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#EDF4EC",
    elevation: 3,
    shadowColor: "#1A3816",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    marginBottom: 16,
  },
  heroLeft: {
    flex: 1,
  },
  truckPlateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8EE",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
    gap: 4,
  },
  truckPlateText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2E7D32",
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1E331B",
  },
  heroSubtitle: {
    fontSize: 12,
    color: "#6B8468",
    marginTop: 2,
  },
  stopsIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  stopsIndicatorText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E7D32",
  },
  heroRightStatus: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  liveStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  liveStatusStandby: {
    backgroundColor: "#FFF3E0",
  },
  liveStatusCollecting: {
    backgroundColor: "#E8F8EE",
  },
  liveStatusCompleted: {
    backgroundColor: "#EDE7F6",
  },
  liveStatusPillText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  liveStatusTextStandby: {
    color: "#E65100",
  },
  liveStatusTextCollecting: {
    color: "#2E7D32",
  },
  liveStatusTextCompleted: {
    color: "#512DA8",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E331B",
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  actionGridCard: {
    width: (SCREEN_WIDTH - 36 - 12) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EDF4EC",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  actionGridCardDisabled: {
    opacity: 0.5,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#273824",
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10,20,10,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF4ED",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1E331B",
  },
  modalScroll: {
    paddingTop: 12,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4A6146",
    marginBottom: 6,
    marginTop: 10,
  },
  modalSelectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#F2F7F1",
    borderWidth: 1,
    borderColor: "#D8E6D6",
  },
  modalChipActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  modalChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4A6146",
  },
  modalChipTextActive: {
    color: "#FFFFFF",
  },
  modalInputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "#F2F7F1",
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D8E6D6",
  },
  modalInput: {
    flex: 1,
    fontSize: 13,
    color: "#1E331B",
    marginLeft: 8,
  },
  modalSubmitBtn: {
    backgroundColor: "#2E7D32",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 6,
  },
  modalSubmitText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
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
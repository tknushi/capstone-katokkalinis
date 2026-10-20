import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import KatokLogo from "../../components/KatokLogo";
import InspectorHotbar from "../../components/InspectorHotbar";
import { logoutUser } from "../../services/auth";
import { fetchInspectorStats, InspectorStats } from "../../services/inspector";

export default function InspectorProfile() {
  const router = useRouter();

  // Profile data (NO Edit Profile per Requirement 20)
  const [name, setName] = useState("John Inspector");
  const [email, setEmail] = useState("inspector@katokkalinis.com");
  const [inspectorId, setInspectorId] = useState("INS-2026");
  const assignedArea = "Divisoria & Cogon Market Zones";

  // Real stats from database (Requirement 3: Stalls Certified, Total Inspections, Pending Reviews)
  const [stats, setStats] = useState<InspectorStats>({
    stalls_certified: 0,
    total_inspections: 0,
    pending_reviews: 0,
    completed_today: 0,
    recent_stalls: [],
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const storedName = await AsyncStorage.getItem("userName");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      const storedId = await AsyncStorage.getItem("userId");

      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
      if (storedId) setInspectorId(`INS-${storedId}`);

      const statsRes = await fetchInspectorStats();
      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out of your inspector account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logoutUser(router);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
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
          style={styles.logoutTopBtn}
          onPress={handleLogout}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#C62828" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. INSPECTOR HERO CARD */}
        <View style={styles.profileHeroCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <MaterialCommunityIcons name="account-check" size={48} color="#2E7D32" />
            </View>
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={16} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.inspectorName}>{name}</Text>
          <Text style={styles.inspectorEmail}>{email}</Text>

          <View style={styles.tagRow}>
            <View style={styles.roleTag}>
              <MaterialCommunityIcons name="shield-check" size={14} color="#2E7D32" />
              <Text style={styles.roleTagText}>Sanitation & Waste Inspector</Text>
            </View>
            <View style={styles.idTag}>
              <Text style={styles.idTagText}>{inspectorId}</Text>
            </View>
          </View>

          {/* Stats Bar - Balanced 3-column government aesthetic (Requirement 3) */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.stalls_certified}</Text>
              <Text style={styles.statLabel}>Stalls Certified</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.total_inspections}</Text>
              <Text style={styles.statLabel}>Total Inspections</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: stats.pending_reviews > 0 ? "#D97706" : "#2E7D32" }]}>
                {stats.pending_reviews}
              </Text>
              <Text style={styles.statLabel}>Pending Reviews</Text>
            </View>
          </View>
        </View>

        {/* 3. ASSIGNED JURISDICTION */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assigned Markets & Zone</Text>

          <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
            <View style={[styles.detailIconCircle, { backgroundColor: "#E8F8EE" }]}>
              <MaterialCommunityIcons name="map-marker-radius" size={22} color="#2E7D32" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.detailMainText}>{assignedArea}</Text>
              <Text style={styles.detailSubText}>Cagayan de Oro City Market Administration</Text>
            </View>
          </View>
        </View>

        {/* 4. SANITATION STANDARDS & FIELD DIRECTORY */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Inspection Standards & Rubric</Text>
        </View>

        {/* Grade Rubric Reference Card */}
        <View style={styles.guidelineCard}>
          <Text style={styles.guidelineCardTitle}>Official Evaluation Thresholds</Text>
          <View style={styles.gradeRow}>
            <View style={[styles.gradePillBadge, { backgroundColor: "#E8F8EE", borderColor: "#B2DFDB" }]}>
              <Text style={[styles.gradePillLetter, { color: "#2E7D32" }]}>Grade A</Text>
              <Text style={styles.gradePillScore}>90% - 100%</Text>
              <Text style={styles.gradePillDesc}>Certified Clean Stall</Text>
            </View>

            <View style={[styles.gradePillBadge, { backgroundColor: "#FFF8E1", borderColor: "#FFE082" }]}>
              <Text style={[styles.gradePillLetter, { color: "#F57F17" }]}>Grade B</Text>
              <Text style={styles.gradePillScore}>75% - 89%</Text>
              <Text style={styles.gradePillDesc}>Satisfactory Rating</Text>
            </View>

            <View style={[styles.gradePillBadge, { backgroundColor: "#FFEBEE", borderColor: "#FFCDD2" }]}>
              <Text style={[styles.gradePillLetter, { color: "#C62828" }]}>Grade C</Text>
              <Text style={styles.gradePillScore}>Below 75%</Text>
              <Text style={styles.gradePillDesc}>Action Required</Text>
            </View>
          </View>
        </View>

        {/* Core Field Checklist Criteria */}
        <View style={styles.guidelineCard}>
          <Text style={styles.guidelineCardTitle}>Field Audit Checklist Pillars</Text>
          <View style={styles.criterionItem}>
            <MaterialCommunityIcons name="check-circle-outline" size={16} color="#2E7D32" />
            <Text style={styles.criterionText}>Waste Segregation: Separate wet/dry labeled receptacles at stall</Text>
          </View>
          <View style={styles.criterionItem}>
            <MaterialCommunityIcons name="check-circle-outline" size={16} color="#2E7D32" />
            <Text style={styles.criterionText}>Premises & Drainage: Clean grease traps and free-flowing floor drains</Text>
          </View>
          <View style={styles.criterionItem}>
            <MaterialCommunityIcons name="check-circle-outline" size={16} color="#2E7D32" />
            <Text style={styles.criterionText}>Pest Prevention: Elevated storage pallets and vector proofing</Text>
          </View>
          <View style={styles.criterionItem}>
            <MaterialCommunityIcons name="check-circle-outline" size={16} color="#2E7D32" />
            <Text style={styles.criterionText}>Public Display: KatokKalinis Official QR badge visibly posted</Text>
          </View>
        </View>

        {/* Dispatch & Escalation Hotlines */}
        <View style={styles.guidelineCard}>
          <Text style={styles.guidelineCardTitle}>Field Dispatch & Sanitation Contacts</Text>
          <View style={styles.hotlineRow}>
            <MaterialCommunityIcons name="phone" size={16} color="#1565C0" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.hotlineName}>City Health Office (CHO) Sanitation</Text>
              <Text style={styles.hotlineNum}>(088) 857-3188 • Mon-Fri 8AM-5PM</Text>
            </View>
          </View>
          <View style={styles.hotlineRow}>
            <MaterialCommunityIcons name="radio-handheld" size={16} color="#2E7D32" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.hotlineName}>CLENRO Market Inspector Dispatch</Text>
              <Text style={styles.hotlineNum}>0917-825-4647 • Sector 1 Field Desk</Text>
            </View>
          </View>
        </View>

        {/* 5. LOGOUT BUTTON (Guarded) */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#C62828" />
          <Text style={styles.logoutButtonText}>Log Out of Inspector Account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 6. CONNECTED INSPECTOR HOTBAR */}
      <InspectorHotbar activeTab="profile" />
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
  logoutTopBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFEBEE",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 95,
  },
  profileHeroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EDF4EC",
    elevation: 3,
    shadowColor: "#1A3816",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F8EE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#C5E6CE",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  inspectorName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1E331B",
  },
  inspectorEmail: {
    fontSize: 12,
    color: "#688264",
    marginTop: 2,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  roleTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8EE",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2E7D32",
  },
  idTag: {
    backgroundColor: "#F2F7F1",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  idTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4F634D",
  },
  statsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEF4ED",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1E331B",
  },
  statLabel: {
    fontSize: 10,
    color: "#7A8D78",
    marginTop: 2,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#EEF4ED",
  },
  card: {
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
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E331B",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F7F1",
  },
  detailIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  detailMainText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E331B",
  },
  detailSubText: {
    fontSize: 11,
    color: "#6B8468",
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E331B",
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
  },
  cardList: {
    gap: 10,
    marginBottom: 20,
  },
  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EDF4EC",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  recordIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E8F8EE",
    alignItems: "center",
    justifyContent: "center",
  },
  recordName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E331B",
  },
  recordSub: {
    fontSize: 11,
    color: "#6B8468",
    marginTop: 2,
  },
  passedBadge: {
    backgroundColor: "#E8F8EE",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  passedBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2E7D32",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#FFCDD2",
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#C62828",
    fontSize: 14,
    fontWeight: "800",
  },
  guidelineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EDF4EC",
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  guidelineCardTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#1E331B",
    marginBottom: 10,
  },
  gradeRow: {
    flexDirection: "row",
    gap: 8,
  },
  gradePillBadge: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  gradePillLetter: {
    fontSize: 15,
    fontWeight: "900",
  },
  gradePillScore: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4A6148",
    marginTop: 2,
  },
  gradePillDesc: {
    fontSize: 9.5,
    color: "#6B8468",
    marginTop: 2,
    textAlign: "center",
    fontWeight: "600",
  },
  criterionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  criterionText: {
    flex: 1,
    fontSize: 12,
    color: "#384E35",
    lineHeight: 17,
  },
  hotlineRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F7F1",
  },
  hotlineName: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#1E331B",
  },
  hotlineNum: {
    fontSize: 11,
    color: "#6B8468",
    marginTop: 1,
  },
});

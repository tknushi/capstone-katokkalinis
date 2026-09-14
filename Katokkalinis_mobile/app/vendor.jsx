import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import KatokLogo from "../components/KatokLogo";
import TopNotificationBanner from "../components/TopNotificationBanner";
import { fetchVendorStatus } from "../services/vendor";

export default function Vendor() {
  const router = useRouter();

  const [vendorName, setVendorName] = useState("Katok Vendor");
  const [vendorCode, setVendorCode] = useState("2026012345");
  const [stallNumber, setStallNumber] = useState("Stall #12");
  const [marketLocation, setMarketLocation] = useState("Divisoria Public Market");
  const sanitationScore = 92;
  const lastInspectedDate = "May 10, 2026";
  const inspectorNotes = "Excellent segregation and clean food preparation surface. Waste bins are covered with proper municipal color-coded liners.";

  // Modals for Quick Actions (Requirement 22)
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [gradesModalVisible, setGradesModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // "home" | "information" | "status"

  // Top Banner (Requirement 23)
  const [banner, setBanner] = useState({
    visible: true,
    title: "Sanitation Certificate Valid",
    message: "Your stall is certified Grade A through end of quarter.",
    type: "success",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedName = await AsyncStorage.getItem("userName");
      const storedId = await AsyncStorage.getItem("userId");
      if (storedName) setVendorName(storedName);
      if (storedId) setVendorCode(`2026${storedId.padStart(6, "0")}`);

      const statusRes = await fetchVendorStatus();
      if (statusRes.success && statusRes.user) {
        if (statusRes.user.name) setVendorName(statusRes.user.name);
        if (statusRes.user.vendor?.vendor_code) {
          setVendorCode(statusRes.user.vendor.vendor_code);
        }
        if (statusRes.user.vendor?.stall_number) {
          setStallNumber(statusRes.user.vendor.stall_number);
        }
        if (statusRes.user.vendor?.market) {
          setMarketLocation(statusRes.user.vendor.market);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Alert (Requirement 23) */}
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
          onPress={() => router.push("/profile")}
        >
          <View style={styles.greetingTextContainer}>
            <Text style={styles.greetingTitle}>Hello, {vendorName}!</Text>
            <Text style={styles.greetingSub}>{stallNumber}</Text>
          </View>
          <View style={styles.avatarCircle}>
            <MaterialCommunityIcons name="store" size={22} color="#2E7D32" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "home" && (
          <>
            {/* 2. SANITATION STATUS HERO CARD */}
            <View style={styles.heroCard}>
              <View style={styles.heroLeft}>
                <View style={styles.badgeRow}>
                  <MaterialCommunityIcons name="check-decagram" size={14} color="#2E7D32" />
                  <Text style={styles.badgeText}>Certified Compliance</Text>
                </View>
                <Text style={styles.heroTitle}>Sanitation Status</Text>
                <Text style={styles.heroSubtitle}>{marketLocation}</Text>
                <Text style={styles.inspectionDateText}>Last Inspected: {lastInspectedDate}</Text>
              </View>

              <TouchableOpacity
                style={styles.gradeCircle}
                activeOpacity={0.88}
                onPress={() => setGradesModalVisible(true)}
              >
                <Text style={styles.gradeLetter}>A</Text>
                <Text style={styles.gradeScore}>{sanitationScore}%</Text>
              </TouchableOpacity>
            </View>

            {/* 3. QUICK ACTIONS (Requirement 22: View QR, View Grades, View Inspection Report) */}
            <Text style={styles.sectionTitle}>Vendor Quick Actions</Text>

            <View style={styles.quickActionsGrid}>
              {/* Action 1: View QR */}
              <TouchableOpacity
                style={styles.actionGridCard}
                activeOpacity={0.85}
                onPress={() => setQrModalVisible(true)}
              >
                <View style={[styles.actionIconBox, { backgroundColor: "#E8F8EE" }]}>
                  <MaterialCommunityIcons name="qrcode" size={26} color="#2E7D32" />
                </View>
                <Text style={styles.actionLabel}>View QR</Text>
              </TouchableOpacity>

              {/* Action 2: View Grades */}
              <TouchableOpacity
                style={styles.actionGridCard}
                activeOpacity={0.85}
                onPress={() => setGradesModalVisible(true)}
              >
                <View style={[styles.actionIconBox, { backgroundColor: "#E3F2FD" }]}>
                  <MaterialCommunityIcons name="star-check-outline" size={26} color="#1976D2" />
                </View>
                <Text style={styles.actionLabel}>View Grades</Text>
              </TouchableOpacity>

              {/* Action 3: View Inspection Report */}
              <TouchableOpacity
                style={styles.actionGridCard}
                activeOpacity={0.85}
                onPress={() => setReportModalVisible(true)}
              >
                <View style={[styles.actionIconBox, { backgroundColor: "#FFF3E0" }]}>
                  <MaterialCommunityIcons name="clipboard-text-search-outline" size={26} color="#E65100" />
                </View>
                <Text style={styles.actionLabel}>View Inspection Report</Text>
              </TouchableOpacity>
            </View>

            {/* 4. MARKET DISPATCH & COLLECTION TIMING */}
            <View style={styles.card}>
              <Text style={styles.cardHeaderTitle}>Daily Commercial Waste Pickup</Text>

              <View style={styles.pickupRow}>
                <View style={[styles.pickupIconCircle, { backgroundColor: "#E8F8EE" }]}>
                  <MaterialCommunityIcons name="truck-fast" size={22} color="#2E7D32" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.pickupTimeTitle}>Compactor Truck Arrival: 11:30 AM</Text>
                  <Text style={styles.pickupSubText}>Wet & dry segregated bins must be placed at market Bay 4.</Text>
                </View>
              </View>
            </View>

            {/* 5. SANITATION GUIDELINES REMINDER */}
            <View style={styles.card}>
              <Text style={styles.cardHeaderTitle}>Market Hygiene Standards</Text>
              <View style={styles.ruleItem}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#2E7D32" />
                <Text style={styles.ruleText}>Keep separate colored bins for wet organic and dry residual waste.</Text>
              </View>
              <View style={styles.ruleItem}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#2E7D32" />
                <Text style={styles.ruleText}>Maintain clean floor drains and grease interceptors daily.</Text>
              </View>
              <View style={styles.ruleItem}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#2E7D32" />
                <Text style={styles.ruleText}>Display certified QR code visibly for health inspectors.</Text>
              </View>
            </View>
          </>
        )}

        {activeTab === "information" && (
          <View>
            <View style={styles.titleSection}>
              <Text style={styles.pageTitle}>Market Information</Text>
              <Text style={styles.pageSubtitle}>Guidelines, operating hours & disposal protocols</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardHeaderTitle}>Market Operational Hours</Text>
              <Text style={styles.infoParagraph}>
                Divisoria Public Market operates daily from 04:00 AM to 08:00 PM. Municipal sanitation sweeps occur twice daily at 11:30 AM and 07:30 PM.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardHeaderTitle}>Solid Waste Management Ordinance</Text>
              <Text style={styles.infoParagraph}>
                Pursuant to Cagayan de Oro City Environmental Code, all wet and dry stalls must practice segregation-at-source. Non-compliance may result in administrative warnings or suspension of stall permits.
              </Text>
            </View>
          </View>
        )}

        {activeTab === "status" && (
          <View>
            <View style={styles.titleSection}>
              <Text style={styles.pageTitle}>Sanitation & Grade History</Text>
              <Text style={styles.pageSubtitle}>Monthly audit performance for {stallNumber}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.statusHeaderRow}>
                <View>
                  <Text style={styles.statusSectionTitle}>Current Rating</Text>
                  <Text style={styles.statusSectionSub}>Valid through Q2 2026</Text>
                </View>
                <View style={styles.gradeBadgeA}>
                  <Text style={styles.gradeBadgeAText}>Grade A • 92%</Text>
                </View>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Hygiene & Segregation</Text>
                <Text style={styles.breakdownVal}>95%</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Premises & Grease Trap Cleanliness</Text>
                <Text style={styles.breakdownVal}>88%</Text>
              </View>
              <View style={[styles.breakdownRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.breakdownLabel}>Violations Record</Text>
                <Text style={[styles.breakdownVal, { color: "#2E7D32" }]}>0 Violations</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* MODAL 1: VIEW QR */}
      <Modal visible={qrModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vendor Stall QR Code</Text>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#556655" />
              </TouchableOpacity>
            </View>

            <View style={styles.qrDisplayBox}>
              <View style={styles.qrMockContainer}>
                <MaterialCommunityIcons name="qrcode" size={140} color="#1E331B" />
              </View>
              <Text style={styles.qrCodeNumber}>UID: {vendorCode}</Text>
              <Text style={styles.qrStallText}>{stallNumber} • {vendorName}</Text>
              <Text style={styles.qrInstructions}>
                Present this official QR code when sanitary inspectors visit your stall.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setQrModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: VIEW GRADES */}
      <Modal visible={gradesModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Inspection Grades</Text>
              <TouchableOpacity onPress={() => setGradesModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#556655" />
              </TouchableOpacity>
            </View>

            <View style={styles.gradeModalContent}>
              <View style={styles.gradeBigCircle}>
                <Text style={styles.gradeBigLetter}>A</Text>
                <Text style={styles.gradeBigSub}>Excellent</Text>
              </View>

              <Text style={styles.gradeScoreDisplay}>Overall Score: {sanitationScore}%</Text>
              <Text style={styles.gradeCertifiedDate}>Certified on {lastInspectedDate}</Text>

              <View style={styles.gradeDetailsBox}>
                <View style={styles.gradeRow}>
                  <Text style={styles.gradeRowLabel}>Waste Storage & Segregation</Text>
                  <Text style={styles.gradeRowVal}>4.8 / 5.0</Text>
                </View>
                <View style={styles.gradeRow}>
                  <Text style={styles.gradeRowLabel}>Stall Cleanliness</Text>
                  <Text style={styles.gradeRowVal}>4.5 / 5.0</Text>
                </View>
                <View style={[styles.gradeRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.gradeRowLabel}>Pest Control & Drainage</Text>
                  <Text style={styles.gradeRowVal}>4.6 / 5.0</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setGradesModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: VIEW INSPECTION REPORT */}
      <Modal visible={reportModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recent Inspection Findings</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#556655" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10 }}>
              <View style={styles.reportSummaryRow}>
                <View>
                  <Text style={styles.reportAuditTitle}>Comprehensive Sanitation Audit</Text>
                  <Text style={styles.reportInspectorName}>Inspector: John Inspector (INS-2026)</Text>
                  <Text style={styles.reportDate}>{lastInspectedDate}</Text>
                </View>
                <View style={styles.reportGradeBadge}>
                  <Text style={styles.reportGradeBadgeText}>Grade A</Text>
                </View>
              </View>

              <Text style={styles.reportSectionLabel}>Inspector Findings & Remarks</Text>
              <View style={styles.reportRemarksBox}>
                <Text style={styles.reportRemarksText}>{inspectorNotes}</Text>
              </View>

              <Text style={styles.reportSectionLabel}>Compliance Status</Text>
              <View style={styles.reportPassBox}>
                <MaterialCommunityIcons name="shield-check" size={18} color="#2E7D32" />
                <Text style={styles.reportPassText}>All municipal environmental standards satisfied.</Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setReportModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 6. BOTTOM NAVIGATION (Requirement 22: Home, Information, Status, Profile) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => setActiveTab("home")}
        >
          <MaterialCommunityIcons
            name="home"
            size={24}
            color={activeTab === "home" ? "#2E7D32" : "#7A8D78"}
          />
          <Text style={[styles.navItemText, activeTab === "home" && styles.navItemTextActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => setActiveTab("information")}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={24}
            color={activeTab === "information" ? "#2E7D32" : "#7A8D78"}
          />
          <Text style={[styles.navItemText, activeTab === "information" && styles.navItemTextActive]}>
            Information
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => setActiveTab("status")}
        >
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={24}
            color={activeTab === "status" ? "#2E7D32" : "#7A8D78"}
          />
          <Text style={[styles.navItemText, activeTab === "status" && styles.navItemTextActive]}>
            Status
          </Text>
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
    padding: 18,
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
  badgeRow: {
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
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2E7D32",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1E331B",
  },
  heroSubtitle: {
    fontSize: 12,
    color: "#688264",
    marginTop: 2,
  },
  inspectionDateText: {
    fontSize: 11,
    color: "#8DA78B",
    marginTop: 4,
  },
  gradeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  gradeLetter: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 30,
  },
  gradeScore: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.9)",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E331B",
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 8,
  },
  actionGridCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EDF4EC",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  actionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#273824",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
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
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E331B",
    marginBottom: 10,
  },
  pickupRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pickupIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  pickupTimeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E331B",
  },
  pickupSubText: {
    fontSize: 11,
    color: "#6B8468",
    marginTop: 2,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  ruleText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#384E35",
  },
  titleSection: {
    marginBottom: 14,
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
  infoParagraph: {
    fontSize: 13,
    lineHeight: 19,
    color: "#3F563B",
  },
  statusHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E331B",
  },
  statusSectionSub: {
    fontSize: 11,
    color: "#7A8D78",
  },
  gradeBadgeA: {
    backgroundColor: "#E8F8EE",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  gradeBadgeAText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2E7D32",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4EF",
  },
  breakdownLabel: {
    fontSize: 12,
    color: "#4A5E46",
    fontWeight: "500",
  },
  breakdownVal: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E331B",
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
    fontSize: 16,
    fontWeight: "900",
    color: "#1E331B",
  },
  qrDisplayBox: {
    alignItems: "center",
    paddingVertical: 18,
  },
  qrMockContainer: {
    padding: 16,
    backgroundColor: "#F9FCF8",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E2ECE0",
    marginBottom: 12,
  },
  qrCodeNumber: {
    fontSize: 14,
    fontWeight: "900",
    color: "#2E7D32",
    letterSpacing: 1,
  },
  qrStallText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E331B",
    marginTop: 4,
  },
  qrInstructions: {
    fontSize: 11,
    color: "#6B8468",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
  modalCloseButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  gradeModalContent: {
    alignItems: "center",
    paddingVertical: 14,
  },
  gradeBigCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gradeBigLetter: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 40,
  },
  gradeBigSub: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.9)",
  },
  gradeScoreDisplay: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1E331B",
  },
  gradeCertifiedDate: {
    fontSize: 11,
    color: "#6B8468",
    marginTop: 2,
    marginBottom: 14,
  },
  gradeDetailsBox: {
    width: "100%",
    backgroundColor: "#F7FAF6",
    borderRadius: 14,
    padding: 12,
  },
  gradeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EAF2E8",
  },
  gradeRowLabel: {
    fontSize: 12,
    color: "#4A6146",
  },
  gradeRowVal: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E331B",
  },
  reportSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  reportAuditTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E331B",
  },
  reportInspectorName: {
    fontSize: 11,
    color: "#4A6146",
    marginTop: 2,
  },
  reportDate: {
    fontSize: 10,
    color: "#7A8D78",
    marginTop: 1,
  },
  reportGradeBadge: {
    backgroundColor: "#E8F8EE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reportGradeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2E7D32",
  },
  reportSectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#3B5238",
    marginTop: 10,
    marginBottom: 6,
  },
  reportRemarksBox: {
    backgroundColor: "#F7FAF6",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5EEE3",
  },
  reportRemarksText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#2C3D29",
  },
  reportPassBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8EE",
    padding: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 10,
  },
  reportPassText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "#2E7D32",
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
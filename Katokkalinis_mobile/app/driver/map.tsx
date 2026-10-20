import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import KatokLogo from "../../components/KatokLogo";
import TopNotificationBanner from "../../components/TopNotificationBanner";
import { BarangayItem, getBarangays1to40 } from "../../services/driver";

export default function DriverMap() {
  const router = useRouter();
  const [barangays, setBarangays] = useState<BarangayItem[]>([]);
  const [banner, setBanner] = useState({
    visible: true,
    title: "Collection Schedule • Sector 1 Active",
    message: "Official assigned collection route covering urban pilot Barangays 1 to 10.",
    type: "truck" as "truck" | "info" | "success",
  });

  useEffect(() => {
    loadBarangays();
  }, []);

  const loadBarangays = async () => {
    try {
      const data = await getBarangays1to40();
      setBarangays(data);
    } catch (e) {
      console.warn("Failed to load barangays", e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Banner */}
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

        <View style={styles.truckActiveBadge}>
          <MaterialCommunityIcons name="truck-outline" size={14} color="#2E7D32" />
          <Text style={styles.truckActiveText}>Route Active</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. TITLE SECTION */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>CDO Route Directory</Text>
          <Text style={styles.pageSubtitle}>
            Designated Collection Sectors & Timetables • Urban Pilot Barangays 1 to 40
          </Text>
        </View>

        {/* 4. ROUTE DIRECTORY (BARANGAY 1 TO 40) */}
        <Text style={styles.sectionTitle}>Garbage Truck Fleet Routes</Text>

        <View style={styles.routeCardList}>
          {/* Route 1 */}
          <View style={[styles.routeCard, { borderLeftColor: "#2E7D32" }]}>
            <View style={styles.routeCardHeader}>
              <View style={[styles.routeNumBadge, { backgroundColor: "#2E7D32" }]}>
                <Text style={styles.routeNumText}>R1</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.routeCardTitle}>North Poblacion</Text>
                <Text style={styles.routeCardSub}>Barangays 1 to 10 • Truck KAL-101</Text>
              </View>
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>Active</Text>
              </View>
            </View>
            <View style={styles.routeInfoDivider} />
            <View style={styles.coverageRow}>
              <MaterialCommunityIcons name="map-marker-radius" size={16} color="#2E7D32" />
              <Text style={styles.routeCoverage}>
                Coverage: City Health, Fernandez, Burgos, Port Access, Gaabucayan.
              </Text>
            </View>
            <View style={styles.scheduleRow}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#7A8D78" />
              <Text style={styles.scheduleText}>Daily Morning Shift • 06:00 AM - 02:00 PM</Text>
            </View>
          </View>

          {/* Route 2 */}
          <View style={[styles.routeCard, { borderLeftColor: "#1976D2" }]}>
            <View style={styles.routeCardHeader}>
              <View style={[styles.routeNumBadge, { backgroundColor: "#1976D2" }]}>
                <Text style={styles.routeNumText}>R2</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.routeCardTitle}>Central Poblacion</Text>
                <Text style={styles.routeCardSub}>Barangays 11 to 20 • Truck KAL-102</Text>
              </View>
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>Active</Text>
              </View>
            </View>
            <View style={styles.routeInfoDivider} />
            <View style={styles.coverageRow}>
              <MaterialCommunityIcons name="map-marker-radius" size={16} color="#1976D2" />
              <Text style={styles.routeCoverage}>
                Coverage: Tirso Neri Heritage, JR Borja, Cogon Market Periphery, Limketkai.
              </Text>
            </View>
            <View style={styles.scheduleRow}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#7A8D78" />
              <Text style={styles.scheduleText}>Daily Commercial Shift • 08:00 AM - 04:00 PM</Text>
            </View>
          </View>

          {/* Route 3 */}
          <View style={[styles.routeCard, { borderLeftColor: "#F57C00" }]}>
            <View style={styles.routeCardHeader}>
              <View style={[styles.routeNumBadge, { backgroundColor: "#F57C00" }]}>
                <Text style={styles.routeNumText}>R3</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.routeCardTitle}>East Poblacion</Text>
                <Text style={styles.routeCardSub}>Barangays 21 to 30 • Truck KAL-103</Text>
              </View>
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>Active</Text>
              </View>
            </View>
            <View style={styles.routeInfoDivider} />
            <View style={styles.coverageRow}>
              <MaterialCommunityIcons name="map-marker-radius" size={16} color="#F57C00" />
              <Text style={styles.routeCoverage}>
                Coverage: Agora Terminal, Provincial Capitol, Velez Central, Daumar St.
              </Text>
            </View>
            <View style={styles.scheduleRow}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#7A8D78" />
              <Text style={styles.scheduleText}>Tue • Thu • Sat • 07:00 AM - 03:00 PM</Text>
            </View>
          </View>

          {/* Route 4 - Assigned Truck KAL-104 */}
          <View style={[styles.routeCard, styles.assignedRouteCard, { borderLeftColor: "#7B1FA2" }]}>
            <View style={styles.routeCardHeader}>
              <View style={[styles.routeNumBadge, { backgroundColor: "#7B1FA2" }]}>
                <Text style={styles.routeNumText}>R4</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.routeCardTitle}>South Poblacion</Text>
                <Text style={[styles.routeCardSub, { color: "#2E7D32", fontWeight: "700" }]}>
                  Barangays 31 to 40 • Truck KAL-104 (Your Truck)
                </Text>
              </View>
              <View style={[styles.activeTag, { backgroundColor: "#E8F8EE", borderWidth: 1, borderColor: "#B2E2C0" }]}>
                <Text style={[styles.activeTagText, { color: "#1B5E20", fontWeight: "800" }]}>YOUR RUN</Text>
              </View>
            </View>
            <View style={styles.routeInfoDivider} />
            <View style={styles.coverageRow}>
              <MaterialCommunityIcons name="map-marker-radius" size={16} color="#7B1FA2" />
              <Text style={styles.routeCoverage}>
                Coverage: Cogon Market Central Bay, City Hall & Gaston Park, Carmen Bridge Approach, Riverbank.
              </Text>
            </View>
            <View style={styles.scheduleRow}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#2E7D32" />
              <Text style={[styles.scheduleText, { color: "#1E331B", fontWeight: "600" }]}>
                Mon • Wed • Fri • 06:00 AM - 02:00 PM • Market Bay 4
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 4. BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.8}
          onPress={() => {}}
        >
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
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C5EBD2",
    gap: 4,
  },
  truckActiveText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2E7D32",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 105,
  },
  titleSection: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1E331B",
  },
  pageSubtitle: {
    fontSize: 12.5,
    color: "#688264",
    marginTop: 4,
    fontWeight: "500",
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E331B",
    marginBottom: 12,
  },
  routeCardList: {
    gap: 16,
  },
  routeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5ECE4",
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  assignedRouteCard: {
    backgroundColor: "#F7FBF8",
    borderColor: "#C6E8CE",
    borderWidth: 1.5,
  },
  routeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  routeNumBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  routeNumText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  routeCardTitle: {
    fontSize: 15.5,
    fontWeight: "900",
    color: "#1E331B",
  },
  routeCardSub: {
    fontSize: 12,
    color: "#688264",
    fontWeight: "600",
    marginTop: 2,
  },
  activeTag: {
    backgroundColor: "#F0F4EF",
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 8,
  },
  activeTagText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#4A6148",
  },
  routeInfoDivider: {
    height: 1,
    backgroundColor: "#EFF5EE",
    marginVertical: 12,
  },
  coverageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  routeCoverage: {
    flex: 1,
    fontSize: 12,
    color: "#465945",
    lineHeight: 17,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F4F8F3",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scheduleText: {
    fontSize: 11,
    color: "#526B50",
    fontWeight: "600",
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
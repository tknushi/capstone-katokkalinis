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
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.routeCardTitle}>North Poblacion</Text>
                <Text style={styles.routeCardSub}>Barangays 1 to 10 • Truck KAL-101</Text>
              </View>
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>Active</Text>
              </View>
            </View>
            <Text style={styles.routeCoverage}>
              Coverage: City Health, Fernandez, Burgos, Port Access, Gaabucayan.
            </Text>
          </View>

          {/* Route 2 */}
          <View style={[styles.routeCard, { borderLeftColor: "#1976D2" }]}>
            <View style={styles.routeCardHeader}>
              <View style={[styles.routeNumBadge, { backgroundColor: "#1976D2" }]}>
                <Text style={styles.routeNumText}>R2</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.routeCardTitle}>Central Poblacion</Text>
                <Text style={styles.routeCardSub}>Barangays 11 to 20 • Truck KAL-102</Text>
              </View>
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>Active</Text>
              </View>
            </View>
            <Text style={styles.routeCoverage}>
              Coverage: Tirso Neri Heritage, JR Borja, Cogon Market Periphery, Limketkai.
            </Text>
          </View>

          {/* Route 3 */}
          <View style={[styles.routeCard, { borderLeftColor: "#F57C00" }]}>
            <View style={styles.routeCardHeader}>
              <View style={[styles.routeNumBadge, { backgroundColor: "#F57C00" }]}>
                <Text style={styles.routeNumText}>R3</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.routeCardTitle}>East Poblacion</Text>
                <Text style={styles.routeCardSub}>Barangays 21 to 30 • Truck KAL-103</Text>
              </View>
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>Active</Text>
              </View>
            </View>
            <Text style={styles.routeCoverage}>
              Coverage: Agora Terminal, Provincial Capitol, Velez Central, Daumar St.
            </Text>
          </View>

          {/* Route 4 */}
          <View style={[styles.routeCard, { borderLeftColor: "#7B1FA2" }]}>
            <View style={styles.routeCardHeader}>
              <View style={[styles.routeNumBadge, { backgroundColor: "#7B1FA2" }]}>
                <Text style={styles.routeNumText}>R4</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.routeCardTitle}>South Poblacion</Text>
                <Text style={styles.routeCardSub}>Barangays 31 to 40 • Truck KAL-104 (Your Truck)</Text>
              </View>
              <View style={[styles.activeTag, { backgroundColor: "#E8F8EE" }]}>
                <Text style={[styles.activeTagText, { color: "#2E7D32" }]}>Your Run</Text>
              </View>
            </View>
            <Text style={styles.routeCoverage}>
              Coverage: Cogon Market Central Bay, City Hall & Gaston Park, Carmen Bridge Approach, Riverbank.
            </Text>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E331B",
    marginBottom: 8,
  },
  routeCardList: {
    gap: 10,
  },
  routeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5ECE4",
    borderLeftWidth: 4,
  },
  routeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  routeNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  routeNumText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  routeCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E331B",
  },
  routeCardSub: {
    fontSize: 10,
    color: "#688264",
    fontWeight: "600",
  },
  activeTag: {
    backgroundColor: "#F0F4EF",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4A6148",
  },
  routeCoverage: {
    fontSize: 10,
    color: "#556655",
    marginTop: 6,
    lineHeight: 14,
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import KatokLogo from "../../components/KatokLogo";
import PhilippinesMapView from "../../components/PhilippinesMapView";
import TopNotificationBanner from "../../components/TopNotificationBanner";

export default function DriverMap() {
  const router = useRouter();
  const [banner, setBanner] = useState({
    visible: true,
    title: "Route Active • Truck KAL-104",
    message: "Live telemetry connected to Cagayan de Oro City Sanitation Dispatch.",
    type: "truck" as "truck" | "info" | "success",
  });

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
          <MaterialCommunityIcons name="truck-fast" size={14} color="#2E7D32" />
          <Text style={styles.truckActiveText}>KAL-104 Live</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. TITLE SECTION */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Route Map</Text>
          <Text style={styles.pageSubtitle}>
            Compactor navigation & real-time stops across Cagayan de Oro
          </Text>
        </View>

        {/* 3. REAL PHILIPPINES / CDO MAP */}
        <PhilippinesMapView
          truckName="Compactor Truck #04"
          truckPlate="KAL-104"
          activeBarangay="Barangay 2 Main Ave, CDO"
          nextStopName="Barangay 3 Residential Zone"
          height={380}
          showControls={true}
        />
      </ScrollView>

      {/* 4. BOTTOM NAVIGATION (Requirement 13: Exactly 3 Tabs) */}
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
          onPress={() => router.push("/schedule")}
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
    paddingTop: 14,
    paddingBottom: 95,
  },
  titleSection: {
    marginBottom: 12,
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
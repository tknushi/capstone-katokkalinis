import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";

export type InspectorTabKey = "home" | "inspections" | "scan" | "history" | "profile";

interface InspectorHotbarProps {
  activeTab?: InspectorTabKey;
}

export default function InspectorHotbar({ activeTab }: InspectorHotbarProps) {
  const router = useRouter();
  const pathname = usePathname() || "";

  let currentTab: InspectorTabKey = "home";
  if (activeTab) {
    currentTab = activeTab;
  } else if (pathname.includes("/inspector/scan") || pathname.endsWith("/scan")) {
    currentTab = "scan";
  } else if (pathname.includes("/inspector/inspections") || pathname.includes("/inspector/vendor") || pathname.includes("/inspector/grade")) {
    currentTab = "inspections";
  } else if (pathname.includes("/inspector/history")) {
    currentTab = "history";
  } else if (pathname.includes("/inspector/profile")) {
    currentTab = "profile";
  } else {
    currentTab = "home";
  }

  const navigateTo = (tab: InspectorTabKey, route: string) => {
    if (currentTab === tab) return;
    if (tab === "home") {
      router.replace("/inspector/dashboard" as any);
    } else {
      router.push(route as any);
    }
  };

  return (
    <View style={styles.bottomNav}>
      {/* 1. HOME */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.8}
        onPress={() => navigateTo("home", "/inspector/dashboard")}
        accessibilityRole="button"
        accessibilityLabel="Navigate to Inspector Home"
      >
        <MaterialCommunityIcons
          name={currentTab === "home" ? "home" : "home-outline"}
          size={23}
          color={currentTab === "home" ? "#2E7D32" : "#7A8D78"}
        />
        <Text style={[styles.navItemText, currentTab === "home" && styles.navItemTextActive]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* 2. STALLS / INSPECTIONS */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.8}
        onPress={() => navigateTo("inspections", "/inspector/inspections")}
        accessibilityRole="button"
        accessibilityLabel="Navigate to Stall Roster"
      >
        <MaterialCommunityIcons
          name={currentTab === "inspections" ? "storefront" : "storefront-outline"}
          size={23}
          color={currentTab === "inspections" ? "#2E7D32" : "#7A8D78"}
        />
        <Text style={[styles.navItemText, currentTab === "inspections" && styles.navItemTextActive]}>
          Stalls
        </Text>
      </TouchableOpacity>

      {/* 3. SCAN QR (CENTER HIGHLIGHT ACTION) */}
      <TouchableOpacity
        style={styles.centerScanItem}
        activeOpacity={0.85}
        onPress={() => navigateTo("scan", "/inspector/scan")}
        accessibilityRole="button"
        accessibilityLabel="Scan Vendor QR Code"
      >
        <View style={[styles.scanFab, currentTab === "scan" && styles.scanFabActive]}>
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={22}
            color="#FFFFFF"
          />
        </View>
        <Text style={[styles.navItemText, currentTab === "scan" && styles.navItemTextActive, { marginTop: 3 }]}>
          Scan QR
        </Text>
      </TouchableOpacity>

      {/* 4. HISTORY */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.8}
        onPress={() => navigateTo("history", "/inspector/history")}
        accessibilityRole="button"
        accessibilityLabel="Navigate to Inspection History"
      >
        <MaterialCommunityIcons
          name={currentTab === "history" ? "clipboard-text-clock" : "clipboard-text-clock-outline"}
          size={23}
          color={currentTab === "history" ? "#2E7D32" : "#7A8D78"}
        />
        <Text style={[styles.navItemText, currentTab === "history" && styles.navItemTextActive]}>
          History
        </Text>
      </TouchableOpacity>

      {/* 5. PROFILE */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.8}
        onPress={() => navigateTo("profile", "/inspector/profile")}
        accessibilityRole="button"
        accessibilityLabel="Navigate to Inspector Profile"
      >
        <MaterialCommunityIcons
          name={currentTab === "profile" ? "account" : "account-outline"}
          size={23}
          color={currentTab === "profile" ? "#2E7D32" : "#7A8D78"}
        />
        <Text style={[styles.navItemText, currentTab === "profile" && styles.navItemTextActive]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF5ED",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 6,
    zIndex: 100,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  centerScanItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -8,
  },
  scanFab: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  scanFabActive: {
    backgroundColor: "#1B5E20",
    borderWidth: 2,
    borderColor: "#A5D6A7",
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

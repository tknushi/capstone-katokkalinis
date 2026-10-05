import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";

export type VendorTabKey = "home" | "qr" | "status" | "profile";

interface VendorHotbarProps {
  activeTab?: VendorTabKey;
}

export default function VendorHotbar({ activeTab }: VendorHotbarProps) {
  const router = useRouter();
  const pathname = usePathname() || "";

  // Derive active tab automatically from route unless explicitly overridden
  let currentTab: VendorTabKey = "home";
  if (activeTab) {
    currentTab = activeTab;
  } else if (pathname.includes("/vendor/qr") || pathname.endsWith("/qr")) {
    currentTab = "qr";
  } else if (pathname.includes("/vendor/status") || pathname.endsWith("/status")) {
    currentTab = "status";
  } else if (pathname.includes("/profile")) {
    currentTab = "profile";
  } else {
    currentTab = "home";
  }

  const navigateTo = (tab: VendorTabKey, route: string) => {
    if (currentTab === tab) {
      return;
    }
    router.push(route as any);
  };

  return (
    <View style={styles.bottomNav}>
      {/* 1. HOME */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.8}
        onPress={() => navigateTo("home", "/vendor")}
        accessibilityRole="button"
        accessibilityLabel="Navigate to Vendor Home"
      >
        <MaterialCommunityIcons
          name={currentTab === "home" ? "home" : "home-outline"}
          size={24}
          color={currentTab === "home" ? "#2E7D32" : "#7A8D78"}
        />
        <Text style={[styles.navItemText, currentTab === "home" && styles.navItemTextActive]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* 2. QR */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.8}
        onPress={() => navigateTo("qr", "/vendor/qr")}
        accessibilityRole="button"
        accessibilityLabel="Navigate to Vendor Stall QR Code"
      >
        <MaterialCommunityIcons
          name={currentTab === "qr" ? "qrcode" : "qrcode-scan"}
          size={24}
          color={currentTab === "qr" ? "#2E7D32" : "#7A8D78"}
        />
        <Text style={[styles.navItemText, currentTab === "qr" && styles.navItemTextActive]}>
          QR
        </Text>
      </TouchableOpacity>

      {/* 3. STATUS */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.8}
        onPress={() => navigateTo("status", "/vendor/status")}
        accessibilityRole="button"
        accessibilityLabel="Navigate to Vendor Sanitation Status"
      >
        <MaterialCommunityIcons
          name={currentTab === "status" ? "shield-check" : "shield-check-outline"}
          size={24}
          color={currentTab === "status" ? "#2E7D32" : "#7A8D78"}
        />
        <Text style={[styles.navItemText, currentTab === "status" && styles.navItemTextActive]}>
          Status
        </Text>
      </TouchableOpacity>

      {/* 4. PROFILE */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.8}
        onPress={() => navigateTo("profile", "/profile")}
        accessibilityRole="button"
        accessibilityLabel="Navigate to Profile"
      >
        <MaterialCommunityIcons
          name={currentTab === "profile" ? "account" : "account-outline"}
          size={24}
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
    height: 65,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF5ED",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 4,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    zIndex: 99,
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 12,
    minWidth: 60,
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const isSmall = SCREEN_WIDTH < 360;

export default function RoleScreen() {
  const router = useRouter();

  const handleRoleSelect = async (role: "vendor" | "driver" | "inspector") => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    await AsyncStorage.setItem("selectedRole", role);

    switch (role) {
      case "vendor":
        router.push("/login" as any);
        break;
      case "driver":
        router.push("/driver/login" as any);
        break;
      case "inspector":
        router.push("/inspector/login" as any);
        break;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Lush Background Eco-Gradient matching Title Screen */}
      <LinearGradient
        colors={["#FFFFFF", "#F8FDF7", "#EEF8EB", "#DFEED9"]}
        locations={[0, 0.35, 0.7, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top Navigation Row */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/welcome" as any)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#1E331B" />
        </TouchableOpacity>

        <Image
          source={require("../assets/images/katok_logo_full.png")}
          style={styles.navLogo}
          resizeMode="contain"
        />

        <View style={{ width: 40 }} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgePill}>
          <MaterialCommunityIcons name="shield-check-outline" size={12} color="#2E7D32" />
          <Text style={styles.badgeText}>PERSONNEL ACCESS PORTAL</Text>
        </View>
        <Text style={styles.title}>Select Your Role</Text>
        <Text style={styles.subtitle}>Choose your operational module to continue</Text>
      </View>

      {/* Scrollable Role Cards */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.cardsContainer}>
          {/* 1. VENDOR */}
          <TouchableOpacity
            style={styles.roleCard}
            activeOpacity={0.88}
            onPress={() => handleRoleSelect("vendor")}
          >
            <LinearGradient
              colors={["#FFFFFF", "#FBFDFB"]}
              style={styles.cardGradient}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }]}>
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={26}
                  color="#D97706"
                />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.tagRow}>
                  <View style={[styles.rolePill, { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}>
                    <Text style={[styles.rolePillText, { color: "#B45309" }]}>MARKET STALL</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>Market Vendor</Text>
                <Text style={styles.cardDescription}>
                  Access your digital stall QR code, track hygiene ratings, and monitor compliance.
                </Text>
              </View>

              <View style={[styles.chevronCircle, { backgroundColor: "#D97706" }]}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* 2. DRIVER */}
          <TouchableOpacity
            style={styles.roleCard}
            activeOpacity={0.88}
            onPress={() => handleRoleSelect("driver")}
          >
            <LinearGradient
              colors={["#FFFFFF", "#F8FCF8"]}
              style={styles.cardGradient}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#E8F8EE", borderColor: "#C2E8CC" }]}>
                <MaterialCommunityIcons
                  name="truck-fast-outline"
                  size={26}
                  color="#2E7D32"
                />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.tagRow}>
                  <View style={[styles.rolePill, { backgroundColor: "#EAF7ED", borderColor: "#C6EBD0" }]}>
                    <Text style={[styles.rolePillText, { color: "#2E7D32" }]}>WASTE LOGISTICS</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>Truck Driver</Text>
                <Text style={styles.cardDescription}>
                  Update truck status, navigate Barangay stops, and log collection weights.
                </Text>
              </View>

              <View style={[styles.chevronCircle, { backgroundColor: "#2E7D32" }]}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* 3. INSPECTOR */}
          <TouchableOpacity
            style={styles.roleCard}
            activeOpacity={0.88}
            onPress={() => handleRoleSelect("inspector")}
          >
            <LinearGradient
              colors={["#FFFFFF", "#F8FAFD"]}
              style={styles.cardGradient}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#EDF7FE", borderColor: "#C2DEFA" }]}>
                <MaterialCommunityIcons
                  name="clipboard-check-outline"
                  size={26}
                  color="#1565C0"
                />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.tagRow}>
                  <View style={[styles.rolePill, { backgroundColor: "#EBF3FB", borderColor: "#CCE1F8" }]}>
                    <Text style={[styles.rolePillText, { color: "#1565C0" }]}>SANITARY AUDIT</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>Market Inspector</Text>
                <Text style={styles.cardDescription}>
                  Scan stall QR codes, conduct hygiene evaluations, and certify public market vendors.
                </Text>
              </View>

              <View style={[styles.chevronCircle, { backgroundColor: "#1565C0" }]}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Title Screen Scenic Landscape Anchor */}
        <View style={styles.bottomLandscape} pointerEvents="none">
          <Image
            source={require("../assets/images/forest_hills.png")}
            style={styles.forestGraphic}
            resizeMode="cover"
          />
          <View style={styles.truckWrapper}>
            <Image
              source={require("../assets/images/compactor_truck.png")}
              style={styles.truckGraphic}
              resizeMode="contain"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topNav: {
    paddingHorizontal: 18,
    paddingTop: Math.max(44, SCREEN_HEIGHT * 0.055),
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D2EBD5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  navLogo: {
    width: 130,
    height: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(232, 248, 238, 0.9)",
    borderWidth: 1,
    borderColor: "#C5E8CF",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 16,
    marginBottom: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#2E7D32",
    letterSpacing: 0.6,
  },
  title: {
    fontSize: isSmall ? 24 : 27,
    fontWeight: "900",
    color: "#1E331B",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12.5,
    color: "#5C7558",
    marginTop: 4,
    fontWeight: "600",
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cardsContainer: {
    paddingHorizontal: 18,
    gap: 13,
    zIndex: 10,
    marginBottom: 10,
  },
  roleCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#D2EBD5",
    shadowColor: "#1B431D",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
  },
  cardGradient: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  cardContent: {
    flex: 1,
    marginLeft: 13,
    marginRight: 8,
  },
  tagRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  rolePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  rolePillText: {
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#1E331B",
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 11.5,
    color: "#577154",
    lineHeight: 15,
    fontWeight: "500",
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomLandscape: {
    width: "100%",
    position: "relative",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 6,
  },
  forestGraphic: {
    width: SCREEN_WIDTH,
    height: Math.min(SCREEN_HEIGHT * 0.20, 170),
    opacity: 0.95,
  },
  truckWrapper: {
    position: "absolute",
    left: SCREEN_WIDTH * 0.08,
    bottom: 20,
    zIndex: 5,
  },
  truckGraphic: {
    width: 110,
    height: 55,
  },
});

import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import {
  BackHandler,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const isSmall = SCREEN_WIDTH < 360;

export default function WelcomeScreen() {
  const router = useRouter();

  // Navigation guard: Prevent hardware back button from navigating into authenticated view
  useEffect(() => {
    const onBackPress = () => {
      BackHandler.exitApp();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, []);

  const handleSelectResident = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await AsyncStorage.setItem("selectedRole", "resident");
    router.push("/login" as any);
  };

  const handleSelectPersonnel = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push("/role" as any);
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

      {/* Top Header Branding Section */}
      <View style={styles.header}>
        {/* Official Brand Lockup */}
        <Image
          source={require("../assets/images/katok_logo_full.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>Select your portal to get started</Text>
      </View>

      {/* Main Role Selection Cards */}
      <View style={styles.cardsContainer}>
        {/* CARD 1: I'M A RESIDENT */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.88}
          onPress={handleSelectResident}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F7FCF6"]}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconCircle, { backgroundColor: "#E8F8EE", borderColor: "#C2E8CC" }]}>
                <MaterialCommunityIcons
                  name="home-heart"
                  size={26}
                  color="#2E7D32"
                />
              </View>
              <View style={[styles.chevronCircle, { backgroundColor: "#2E7D32" }]}>
                <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>I&apos;m a Resident</Text>
              <Text style={styles.cardDescription}>
                Track collection trucks in real-time, view barangay pickup schedules, and report waste issues.
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* CARD 2: I'M A PERSONNEL */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.88}
          onPress={handleSelectPersonnel}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F7FCF6"]}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconCircle, { backgroundColor: "#EDF7FE", borderColor: "#C2DEFA" }]}>
                <MaterialCommunityIcons
                  name="badge-account-horizontal-outline"
                  size={26}
                  color="#1565C0"
                />
              </View>
              <View style={[styles.chevronCircle, { backgroundColor: "#1565C0" }]}>
                <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>I&apos;m a Personnel</Text>
              <Text style={styles.cardDescription}>
                Access vendor stall QR compliance, driver collection runs, or conduct sanitary market inspections.
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom Title Screen Asset: Forest Hills & Driving Compactor Truck */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    alignItems: "center",
    paddingTop: Math.max(52, SCREEN_HEIGHT * 0.075),
    paddingHorizontal: 20,
    marginBottom: Math.max(22, SCREEN_HEIGHT * 0.032),
    zIndex: 10,
  },
  logoImage: {
    width: isSmall ? 180 : 210,
    height: isSmall ? 48 : 56,
    marginBottom: 8,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(232, 248, 238, 0.9)",
    borderWidth: 1,
    borderColor: "#C5E8CF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
    marginBottom: 10,
    gap: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2E7D32",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: isSmall ? 26 : 30,
    fontWeight: "900",
    color: "#1E331B",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    color: "#5C7558",
    marginTop: 4,
    fontWeight: "600",
    textAlign: "center",
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 15,
    zIndex: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D2EBD5",
    shadowColor: "#1B431D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
    overflow: "hidden",
  },
  cardGradient: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  pillContainer: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  cardBody: {
    width: "100%",
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1E331B",
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardDescription: {
    fontSize: 12.5,
    color: "#577154",
    lineHeight: 18,
    fontWeight: "500",
  },
  bottomLandscape: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  forestGraphic: {
    width: SCREEN_WIDTH,
    height: Math.min(SCREEN_HEIGHT * 0.24, 190),
    opacity: 0.95,
  },
  truckWrapper: {
    position: "absolute",
    left: SCREEN_WIDTH * 0.08,
    bottom: 22,
    zIndex: 5,
  },
  truckGraphic: {
    width: 125,
    height: 62,
  },
});

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import KatokLogo from "../components/KatokLogo";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/welcome");
    }, 2400);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Subtle clean vertical gradient matching reference mockup */}
      <LinearGradient
        colors={["#FFFFFF", "#FFFFFF", "#F6FAF5", "#EAF5E8"]}
        locations={[0, 0.45, 0.75, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Main Brand Header with Two-Tone Wordmark & Subtitle */}
      <View style={styles.brandSection}>
        <KatokLogo
          variant="splash"
          showTagline={true}
          tagline="Kalinis na Barangay, Mas Maayong Cagayan"
        />
      </View>

      {/* Bottom Scenic Illustration & Loading Indicator */}
      <View style={styles.bottomSection}>
        {/* Forest / Landscape Hills */}
        <Image
          source={require("../assets/images/forest_hills.png")}
          style={styles.forestGraphic}
          resizeMode="cover"
        />

        {/* Garbage Compactor Truck driving across the scenic path */}
        <View style={styles.truckWrapper}>
          <Image
            source={require("../assets/images/compactor_truck.png")}
            style={styles.truckGraphic}
            resizeMode="contain"
          />
        </View>

        {/* Circular Loading Spinner with 'Loading...' text */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
  },
  brandSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: SCREEN_HEIGHT * 0.08,
  },
  bottomSection: {
    width: "100%",
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 26,
  },
  forestGraphic: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.26,
    opacity: 0.9,
  },
  truckWrapper: {
    position: "absolute",
    left: SCREEN_WIDTH * 0.1,
    bottom: 60,
    zIndex: 5,
  },
  truckGraphic: {
    width: 130,
    height: 65,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    zIndex: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#2E7D32",
    letterSpacing: 0.5,
  },
});
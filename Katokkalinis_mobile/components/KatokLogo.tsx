import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface KatokLogoProps {
  variant?: "splash" | "header" | "compact" | "badge";
  showTagline?: boolean;
  tagline?: string;
  size?: "sm" | "md" | "lg";
}

export const BRAND_PRIMARY_GREEN = "#2E7D32"; // Primary brand green ("Katok")
export const BRAND_DARK_GREEN = "#1A4314";    // Secondary darker green ("Kalinis")
export const BRAND_LIGHT_BG = "#E8F8EE";

export default function KatokLogo({
  variant = "splash",
  showTagline = true,
  tagline = "Kalinis na Barangay, Mas Maayong Cagayan",
  size = "md",
}: KatokLogoProps) {
  // 1. HEADER VARIANT (Used on Dashboards & Navigation bars - exact Splash Screen image asset)
  if (variant === "header") {
    return (
      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/images/katok_logo_full.png")}
          style={styles.headerLogoImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  // 2. COMPACT VARIANT
  if (variant === "compact") {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactRow}>
          <Text style={styles.compactKatok}>Katok </Text>
          <Text style={styles.compactKalinis}>Kalinis</Text>
        </View>
        {showTagline && (
          <Text style={styles.compactTagline}>{tagline}</Text>
        )}
      </View>
    );
  }

  // 3. SPLASH / HERO BRAND LOCKUP VARIANT
  // Uses the exact high-res brand artwork paired with unified two-tone styling
  return (
    <View style={styles.splashContainer}>
      <Image
        source={require("../assets/images/katok_logo_full.png")}
        style={styles.splashLogoGraphic}
        resizeMode="contain"
      />

      {showTagline && (
        <View style={styles.taglineContainer}>
          <Text style={styles.taglineLine1}>
            {tagline}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // HEADER STYLES (Used across all dashboard headers)
  headerContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerLogoImage: {
    width: 138,
    height: 36,
  },
  headerTextRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  headerKatok: {
    fontSize: 19,
    fontWeight: "900",
    color: BRAND_PRIMARY_GREEN,
    letterSpacing: 0.2,
  },
  headerKalinis: {
    fontSize: 19,
    fontWeight: "900",
    color: BRAND_DARK_GREEN,
    letterSpacing: 0.2,
  },

  // COMPACT STYLES
  compactContainer: {
    alignItems: "center",
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactKatok: {
    fontSize: 26,
    fontWeight: "900",
    color: BRAND_PRIMARY_GREEN,
    letterSpacing: 0.3,
  },
  compactKalinis: {
    fontSize: 26,
    fontWeight: "900",
    color: BRAND_DARK_GREEN,
    letterSpacing: 0.3,
  },
  compactTagline: {
    fontSize: 12,
    color: "#5C7558",
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 0.5,
  },

  // SPLASH / HERO LOCKUP STYLES
  splashContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  splashLogoGraphic: {
    width: 240,
    height: 140,
  },
  taglineContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  taglineLine1: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4A6E46",
    letterSpacing: 0.4,
    textAlign: "center",
  },
});

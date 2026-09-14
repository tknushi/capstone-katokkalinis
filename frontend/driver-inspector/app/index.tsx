import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/role");
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoTop}>Katok</Text>
        <Text style={styles.logoBottom}>Kalinis</Text>

        <Text style={styles.tagline}>
          Kakatok, Lilinis, Gagaan ang Buhay.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7ED957",
    justifyContent: "center",
    alignItems: "center",
  },

  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  logoTop: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 38,
  },

  logoBottom: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 38,
  },

  tagline: {
    color: "#FFFFFF",
    fontSize: 9,
    marginTop: 12,
    fontWeight: "500",
  },
});
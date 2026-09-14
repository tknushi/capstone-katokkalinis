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
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        Katok
      </Text>

      <Text style={styles.logoSecond}>
        Kalinis
      </Text>
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

  logo: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 35,
  },

  logoSecond: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 35,
  },
});
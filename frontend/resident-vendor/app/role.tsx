import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RoleScreen() {
  const router = useRouter();

  const selectRole = async (role: "resident" | "vendor") => {
    await AsyncStorage.setItem("selectedRole", role);

    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KatokKalinis</Text>

        <Text style={styles.tagline}>
          Kakatok, Lilinis, Gagaan ang Buhay.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Choose Account Type</Text>

        <Text style={styles.subtitle}>
          Select how you want to use KatokKalinis.
        </Text>

        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => selectRole("resident")}
        >
          <Text style={styles.roleTitle}>Resident</Text>

          <Text style={styles.roleDescription}>
            Report waste and sanitation issues in your community.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => selectRole("vendor")}
        >
          <Text style={styles.roleTitle}>Vendor</Text>

          <Text style={styles.roleDescription}>
            Manage your market vendor account and sanitation compliance.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7ED957",
  },

  header: {
    paddingTop: 70,
    paddingHorizontal: 30,
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },

  tagline: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 5,
  },

  card: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: "72%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 30,
    paddingTop: 35,
  },

  title: {
    fontSize: 29,
    fontWeight: "700",
    color: "#4CAF50",
  },

  subtitle: {
    marginTop: 7,
    marginBottom: 30,
    fontSize: 13,
    color: "#777",
  },

  roleButton: {
    borderWidth: 1,
    borderColor: "#B8D7A3",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    backgroundColor: "#F8FCF5",
  },

  roleTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 7,
  },

  roleDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#777",
  },
});
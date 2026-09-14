import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import IllustrationSilhouettes from "../components/IllustrationSilhouettes";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const isSmall = SCREEN_WIDTH < 360;

export default function RoleScreen() {
  const router = useRouter();

  const handleRoleSelect = async (role: "vendor" | "driver" | "inspector") => {
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
      {/* Top Navigation Row */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/welcome" as any)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E331B" />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Role</Text>
        <Text style={styles.subtitle}>Choose your role to continue.</Text>
      </View>

      {/* Role Cards List */}
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
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="storefront-outline"
                size={30}
                color="#2E7D32"
              />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Vendor</Text>
              <Text style={styles.cardDescription}>
                Access vendor information and manage compliance.
              </Text>
            </View>

            <View style={styles.chevronCircle}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>

          {/* 2. DRIVER */}
          <TouchableOpacity
            style={styles.roleCard}
            activeOpacity={0.88}
            onPress={() => handleRoleSelect("driver")}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="truck-outline"
                size={30}
                color="#2E7D32"
              />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Driver</Text>
              <Text style={styles.cardDescription}>
                Manage collection activities and routes.
              </Text>
            </View>

            <View style={styles.chevronCircle}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>

          {/* 3. INSPECTOR */}
          <TouchableOpacity
            style={styles.roleCard}
            activeOpacity={0.88}
            onPress={() => handleRoleSelect("inspector")}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={30}
                color="#2E7D32"
              />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Inspector</Text>
              <Text style={styles.cardDescription}>
                Conduct inspections and ensure compliance.
              </Text>
            </View>

            <View style={styles.chevronCircle}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom City Skyline Illustration */}
      <IllustrationSilhouettes variant="city" height={SCREEN_HEIGHT * 0.24} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FAF2",
    paddingTop: 50,
  },
  topNav: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: isSmall ? 26 : 30,
    fontWeight: "900",
    color: "#1E331B",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    color: "#60795C",
    marginTop: 6,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: SCREEN_HEIGHT * 0.26,
  },
  cardsContainer: {
    gap: 16,
    zIndex: 10,
  },
  roleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DDF0D8",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E8F8EE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBE8D3",
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E331B",
    marginBottom: 3,
  },
  cardDescription: {
    fontSize: 12,
    color: "#5C7558",
    lineHeight: 16,
    fontWeight: "500",
  },
  chevronCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
});


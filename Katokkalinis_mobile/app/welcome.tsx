import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  BackHandler,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import IllustrationSilhouettes from "../components/IllustrationSilhouettes";

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
    await AsyncStorage.setItem("selectedRole", "resident");
    router.push("/login" as any);
  };

  const handleSelectPersonnel = async () => {
    router.push("/role" as any);
  };

  return (
    <View style={styles.container}>
      {/* Top Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>Please select an option to continue</Text>
      </View>

      {/* Main Option Cards */}
      <View style={styles.cardsContainer}>
        {/* CARD 1: I'M A RESIDENT */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.88}
          onPress={handleSelectResident}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="account-outline"
              size={32}
              color="#2E7D32"
            />
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>I&apos;m a Resident</Text>
            <Text style={styles.cardDescription}>
              Access services, view schedules, and report issues.
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

        {/* CARD 2: I'M A PERSONNEL */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.88}
          onPress={handleSelectPersonnel}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={32}
              color="#2E7D32"
            />
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>I&apos;m a Personnel</Text>
            <Text style={styles.cardDescription}>
              Access work tools and perform assigned tasks.
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

      {/* Bottom forest & compactor truck illustration */}
      <IllustrationSilhouettes variant="forest" height={SCREEN_HEIGHT * 0.28} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FAF2",
    paddingHorizontal: 22,
    paddingTop: 80,
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  title: {
    fontSize: isSmall ? 28 : 32,
    fontWeight: "900",
    color: "#1E331B",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    color: "#60795C",
    marginTop: 8,
    fontWeight: "500",
  },
  cardsContainer: {
    gap: 18,
    zIndex: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 20,
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
    width: 58,
    height: 58,
    borderRadius: 29,
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
    marginBottom: 4,
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

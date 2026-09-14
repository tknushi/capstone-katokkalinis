import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Role() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.logo}>Katok</Text>
        <Text style={styles.logoSecond}>Kalinis</Text>

        <Text style={styles.tagline}>
          Kakatok, Lilinis, Gagaan ang Buhay.
        </Text>
      </View>

      <View style={styles.card}>

        <Text style={styles.title}>
          Welcome
        </Text>

        <Text style={styles.subtitle}>
          Please select your role
        </Text>

        <View style={styles.roles}>

          {/* DRIVER */}
          <TouchableOpacity
            style={styles.roleBox}
            onPress={() =>
              router.push("/driver/login")
            }
          >
            <MaterialCommunityIcons
              name="truck-outline"
              size={42}
              color="#4CAF50"
            />

            <Text style={styles.roleText}>
              Driver
            </Text>

            <View style={styles.startButton}>
              <Text style={styles.startText}>
                Start
              </Text>
            </View>
          </TouchableOpacity>

          {/* INSPECTOR */}
          <TouchableOpacity
            style={styles.roleBox}
            onPress={() =>
              router.push("/inspector/login")
            }
          >
            <MaterialCommunityIcons
              name="file-document-outline"
              size={42}
              color="#4CAF50"
            />

            <Text style={styles.roleText}>
              Inspector
            </Text>

            <View style={styles.startButton}>
              <Text style={styles.startText}>
                Start
              </Text>
            </View>
          </TouchableOpacity>

        </View>
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
    alignItems: "center",
    paddingTop: 55,
  },

  logo: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 29,
  },

  logoSecond: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 29,
  },

  tagline: {
    color: "#fff",
    fontSize: 8,
    marginTop: 5,
  },

  card: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    minHeight: "72%",

    backgroundColor: "#fff",

    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,

    paddingHorizontal: 22,
    paddingTop: 32,
  },

  title: {
    color: "#4CAF50",
    fontSize: 25,
    fontWeight: "700",
  },

  subtitle: {
    color: "#777",
    fontSize: 10,
    marginTop: 3,
    marginBottom: 28,
  },

  roles: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  roleBox: {
    flex: 1,

    backgroundColor: "#DDF5D5",

    borderRadius: 13,

    alignItems: "center",

    paddingTop: 18,
    paddingBottom: 13,

    elevation: 3,
  },

  roleText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 7,
  },

  startButton: {
    backgroundColor: "#4CAF50",

    width: "75%",

    paddingVertical: 7,

    borderRadius: 20,

    alignItems: "center",

    marginTop: 9,
  },

  startText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
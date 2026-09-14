import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function InspectorDashboard() {

  const router = useRouter();

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Inspector Dashboard
        </Text>
      </View>

      {/* PROFILE */}
      <View style={styles.profile}>

        <View style={styles.avatar}>
          <MaterialCommunityIcons
            name="account"
            size={35}
            color="#4CAF50"
          />
        </View>

        <View>
          <Text style={styles.welcome}>
            Welcome, John Doe!
          </Text>

          <Text style={styles.small}>
            Manage your inspections efficiently.
          </Text>

          <Text style={styles.small}>
            User ID: INS-2026
          </Text>
        </View>

      </View>

      {/* SCAN */}
      <TouchableOpacity
        style={styles.menuCard}
        onPress={() =>
          router.push("/inspector/scan")
        }
      >

        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={28}
            color="#4CAF50"
          />
        </View>

        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>
            Scan QR Code
          </Text>

          <Text style={styles.menuSubtitle}>
            Scan a vendor for inspection
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>

      </TouchableOpacity>

      {/* TODAY'S INSPECTION */}
      <TouchableOpacity
        style={styles.menuCard}
        onPress={() =>
          router.push("/inspector/inspections")
        }
      >

        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name="clipboard-check-outline"
            size={28}
            color="#4CAF50"
          />
        </View>

        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>
            Today's Inspection
          </Text>

          <Text style={styles.menuSubtitle}>
            View your inspection appointments
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>

      </TouchableOpacity>

      {/* BOTTOM */}
      <View style={styles.bottomNav}>

        <Text style={styles.navText}>
          Home
        </Text>

        <Text style={styles.navText}>
          Report
        </Text>

        <Text style={styles.navText}>
          Notification
        </Text>

        <Text style={styles.navText}>
          Profile
        </Text>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#EDF6E8",
  },

  header: {
    backgroundColor: "#7ED957",
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  profile: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 15,
    borderRadius: 15,

    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,

    backgroundColor: "#DDF5D5",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  welcome: {
    fontSize: 15,
    fontWeight: "700",
  },

  small: {
    color: "#777",
    fontSize: 9,
    marginTop: 2,
  },

  menuCard: {
    backgroundColor: "#fff",

    marginHorizontal: 15,
    marginBottom: 12,

    borderRadius: 15,

    padding: 15,

    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 45,
    height: 45,

    borderRadius: 25,

    backgroundColor: "#DDF5D5",

    justifyContent: "center",
    alignItems: "center",
  },

  menuText: {
    flex: 1,
    marginLeft: 12,
  },

  menuTitle: {
    fontSize: 13,
    fontWeight: "700",
  },

  menuSubtitle: {
    fontSize: 9,
    color: "#777",
    marginTop: 3,
  },

  arrow: {
    color: "#4CAF50",
    fontSize: 25,
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    height: 65,

    backgroundColor: "#7ED957",

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navText: {
    color: "#fff",
    fontSize: 8,
  },

});
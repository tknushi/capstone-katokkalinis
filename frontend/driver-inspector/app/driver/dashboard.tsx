import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DriverDashboard() {

  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Driver Dashboard
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
            Manage your garbage collection efficiently.
          </Text>

          <Text style={styles.small}>
            User ID: DRV-2026
          </Text>
        </View>

      </View>

      {/* OVERVIEW */}
      <Text style={styles.sectionTitle}>
        Overview
      </Text>

      <View style={styles.stats}>

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            10
          </Text>
          <Text style={styles.statText}>
            Total Stops
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            5
          </Text>
          <Text style={styles.statText}>
            Completed
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            2
          </Text>
          <Text style={styles.statText}>
            Pending
          </Text>
        </View>

      </View>

      {/* SCHEDULE */}
      <View style={styles.scheduleCard}>

        <Text style={styles.scheduleTitle}>
          Schedule
        </Text>

        <View style={styles.scheduleRow}>
          <Text>8:00 AM</Text>
          <Text>Barangay 1</Text>
          <Text style={styles.completed}>
            Completed
          </Text>
        </View>

        <View style={styles.scheduleRow}>
          <Text>9:30 AM</Text>
          <Text>Barangay 2</Text>
          <Text style={styles.progress}>
            In Progress
          </Text>
        </View>

        <View style={styles.scheduleRow}>
          <Text>10:30 AM</Text>
          <Text>Barangay 3</Text>
          <Text style={styles.pending}>
            Pending
          </Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() =>
            router.push("/driver/map")
          }
        >
          <Text style={styles.startText}>
            Start Route
          </Text>
        </TouchableOpacity>

      </View>

      {/* NAVIGATION */}
      <View style={styles.bottomNav}>

        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons
            name="home"
            size={22}
            color="#fff"
          />
          <Text style={styles.navText}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons
            name="truck"
            size={22}
            color="#fff"
          />
          <Text style={styles.navText}>
            Collection
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            router.push("/driver/map")
          }
        >
          <MaterialCommunityIcons
            name="map"
            size={22}
            color="#fff"
          />
          <Text style={styles.navText}>
            Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons
            name="account"
            size={22}
            color="#fff"
          />
          <Text style={styles.navText}>
            Profile
          </Text>
        </TouchableOpacity>

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
    color: "#333",
  },

  small: {
    fontSize: 9,
    color: "#777",
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginHorizontal: 15,
  },

  stats: {
    flexDirection: "row",
    gap: 8,
    margin: 15,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4CAF50",
  },

  statText: {
    fontSize: 8,
    color: "#777",
    marginTop: 3,
  },

  scheduleCard: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 15,
  },

  scheduleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 10,
  },

  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  completed: {
    color: "#4CAF50",
    fontSize: 9,
  },

  progress: {
    color: "#D6A900",
    fontSize: 9,
  },

  pending: {
    color: "#D9534F",
    fontSize: 9,
  },

  startButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 11,
    marginTop: 15,
  },

  startText: {
    color: "#fff",
    fontWeight: "700",
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

  navItem: {
    alignItems: "center",
  },

  navText: {
    color: "#fff",
    fontSize: 8,
    marginTop: 2,
  },

});
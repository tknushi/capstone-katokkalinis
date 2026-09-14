import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DriverMap() {

  const router = useRouter();

  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Map
        </Text>

      </View>

      {/* BASIC MAP AREA */}
      <View style={styles.map}>

        <Text style={styles.mapText}>
          Map
        </Text>

        <MaterialCommunityIcons
          name="map-marker"
          size={55}
          color="#F44336"
        />

        <Text style={styles.location}>
          Current Route
        </Text>

      </View>

      {/* LOCATIONS */}
      <View style={styles.locations}>

        <View style={styles.locationRow}>

          <MaterialCommunityIcons
            name="map-marker"
            size={25}
            color="#4CAF50"
          />

          <Text style={styles.barangay}>
            Barangay 38
          </Text>

          <Text style={styles.progress}>
            In Progress
          </Text>

        </View>

        <View style={styles.locationRow}>

          <MaterialCommunityIcons
            name="map-marker"
            size={25}
            color="#4CAF50"
          />

          <Text style={styles.barangay}>
            Barangay 39
          </Text>

          <Text style={styles.completed}>
            Completed
          </Text>

        </View>

        <View style={styles.locationRow}>

          <MaterialCommunityIcons
            name="map-marker"
            size={25}
            color="#4CAF50"
          />

          <Text style={styles.barangay}>
            Barangay 40
          </Text>

          <Text style={styles.pending}>
            Pending
          </Text>

        </View>

      </View>

      <View style={styles.bottomNav}>

        <Text style={styles.navText}>
          Home
        </Text>

        <Text style={styles.navText}>
          Collection
        </Text>

        <Text style={styles.navText}>
          Map
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
    paddingHorizontal: 18,
    paddingBottom: 15,

    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 15,
  },

  map: {
    height: "55%",
    backgroundColor: "#DCE8D8",
    justifyContent: "center",
    alignItems: "center",
  },

  mapText: {
    fontSize: 25,
    fontWeight: "700",
    color: "#777",
    marginBottom: 20,
  },

  location: {
    color: "#777",
    marginTop: 5,
  },

  locations: {
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 15,
    padding: 10,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  barangay: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "600",
  },

  progress: {
    color: "#D6A900",
    fontSize: 9,
  },

  completed: {
    color: "#4CAF50",
    fontSize: 9,
  },

  pending: {
    color: "#D9534F",
    fontSize: 9,
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    height: 60,

    backgroundColor: "#7ED957",

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navText: {
    color: "#fff",
    fontSize: 9,
  },

});
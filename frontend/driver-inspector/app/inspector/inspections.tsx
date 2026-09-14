import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Inspections() {

  const router = useRouter();

  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#4CAF50"
          />
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>
            Today's Inspections
          </Text>

          <Text style={styles.date}>
            Thursday, April 30, 2026
          </Text>
        </View>

      </View>

      <View style={styles.summary}>

        <View style={styles.summaryBox}>
          <Text style={styles.number}>
            5
          </Text>

          <Text style={styles.summaryText}>
            Completed
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.number}>
            2
          </Text>

          <Text style={styles.summaryText}>
            In Progress
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.number}>
            3
          </Text>

          <Text style={styles.summaryText}>
            Pending
          </Text>
        </View>

      </View>

      <Text style={styles.sectionTitle}>
        Today's Appointments
      </Text>

      {/* APPOINTMENT 1 */}
      <View style={styles.card}>

        <MaterialCommunityIcons
          name="store"
          size={30}
          color="#4CAF50"
        />

        <View style={styles.cardContent}>

          <Text style={styles.vendor}>
            KatokKalimpyо
          </Text>

          <Text style={styles.info}>
            UID: 2026012345
          </Text>

          <Text style={styles.info}>
            Barangay 124, Cagayan
          </Text>

          <Text style={styles.info}>
            10:50 AM
          </Text>

        </View>

        <View style={styles.pendingBadge}>
          <Text style={styles.badgeText}>
            Pending
          </Text>
        </View>

      </View>

      {/* APPOINTMENT 2 */}
      <View style={styles.card}>

        <MaterialCommunityIcons
          name="store"
          size={30}
          color="#4CAF50"
        />

        <View style={styles.cardContent}>

          <Text style={styles.vendor}>
            KatokKalimpyo
          </Text>

          <Text style={styles.info}>
            UID: 2026012346
          </Text>

          <Text style={styles.info}>
            Barangay 123, Divis
          </Text>

          <Text style={styles.info}>
            10:30 AM
          </Text>

        </View>

        <View style={styles.pendingBadge}>
          <Text style={styles.badgeText}>
            Pending
          </Text>
        </View>

      </View>

      <View style={styles.bottomNav}>
        <Text style={styles.navText}>Home</Text>
        <Text style={styles.navText}>Report</Text>
        <Text style={styles.navText}>Notification</Text>
        <Text style={styles.navText}>Profile</Text>
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
    backgroundColor: "#fff",

    paddingTop: 55,
    paddingHorizontal: 18,
    paddingBottom: 15,

    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    color: "#4CAF50",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },

  date: {
    color: "#777",
    fontSize: 8,
    marginLeft: 10,
    marginTop: 2,
  },

  summary: {
    flexDirection: "row",
    gap: 8,
    margin: 15,
  },

  summaryBox: {
    flex: 1,

    backgroundColor: "#fff",

    borderRadius: 12,

    alignItems: "center",

    paddingVertical: 13,
  },

  number: {
    color: "#4CAF50",
    fontSize: 20,
    fontWeight: "800",
  },

  summaryText: {
    color: "#777",
    fontSize: 8,
    marginTop: 3,
  },

  sectionTitle: {
    marginHorizontal: 15,
    marginBottom: 8,

    fontSize: 15,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",

    marginHorizontal: 15,
    marginBottom: 10,

    padding: 15,

    borderRadius: 15,

    flexDirection: "row",
    alignItems: "center",
  },

  cardContent: {
    flex: 1,
    marginLeft: 10,
  },

  vendor: {
    fontSize: 13,
    fontWeight: "700",
  },

  info: {
    color: "#777",
    fontSize: 8,
    marginTop: 2,
  },

  pendingBadge: {
    backgroundColor: "#F4D7D7",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  badgeText: {
    color: "#C44",
    fontSize: 7,
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

  navText: {
    color: "#fff",
    fontSize: 8,
  },

});
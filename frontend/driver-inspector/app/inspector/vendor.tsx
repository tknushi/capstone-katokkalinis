import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Vendor() {

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

        <Text style={styles.headerTitle}>
          Scan Completed!
        </Text>

      </View>

      <View style={styles.success}>
        <MaterialCommunityIcons
          name="check-circle"
          size={55}
          color="#4CAF50"
        />

        <Text style={styles.successText}>
          Vendor Verified
        </Text>

        <Text style={styles.small}>
          Successfully scanned vendor QR Code
        </Text>
      </View>

      <View style={styles.vendorCard}>

        <MaterialCommunityIcons
          name="store"
          size={45}
          color="#4CAF50"
        />

        <Text style={styles.vendorName}>
          KatokKalimpyо
        </Text>

        <Text style={styles.info}>
          UID: 2026012345
        </Text>

        <Text style={styles.info}>
          Juan Dela Cruz
        </Text>

        <Text style={styles.info}>
          09467802940
        </Text>

        <Text style={styles.info}>
          juandelacruz@email.com
        </Text>

        <Text style={styles.info}>
          Barangay 123, Divis
        </Text>

      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() =>
          router.push("/inspector/grade")
        }
      >
        <Text style={styles.buttonText}>
          Continue
        </Text>
      </TouchableOpacity>

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

  headerTitle: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },

  success: {
    alignItems: "center",
    marginTop: 25,
  },

  successText: {
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },

  small: {
    color: "#777",
    fontSize: 9,
  },

  vendorCard: {
    backgroundColor: "#fff",

    margin: 20,

    padding: 20,

    borderRadius: 15,

    alignItems: "center",
  },

  vendorName: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 10,
  },

  info: {
    fontSize: 10,
    color: "#777",
    marginTop: 8,
  },

  continueButton: {
    backgroundColor: "#4CAF50",

    marginHorizontal: 50,

    paddingVertical: 11,

    borderRadius: 20,

    alignItems: "center",
  },

  buttonText: {
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

  navText: {
    color: "#fff",
    fontSize: 8,
  },

});
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Scan() {

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

        <Text style={styles.title}>
          Scan for Inspection
        </Text>

      </View>

      <View style={styles.scanCard}>

        <View style={styles.qrBox}>

          <MaterialCommunityIcons
            name="qrcode"
            size={180}
            color="#111"
          />

        </View>

        <Text style={styles.instruction}>
          Scan QR Code
        </Text>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() =>
            router.push("/inspector/vendor")
          }
        >
          <Text style={styles.buttonText}>
            Scan QR Code
          </Text>
        </TouchableOpacity>

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

  scanCard: {
    backgroundColor: "#fff",

    margin: 20,

    borderRadius: 15,

    padding: 25,

    alignItems: "center",
  },

  qrBox: {
    width: 230,
    height: 230,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 2,
    borderColor: "#4CAF50",
  },

  instruction: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 20,
  },

  scanButton: {
    backgroundColor: "#4CAF50",

    borderRadius: 20,

    paddingVertical: 10,
    paddingHorizontal: 40,

    marginTop: 20,
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
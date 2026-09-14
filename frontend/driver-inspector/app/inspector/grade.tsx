import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Grade() {

  const router = useRouter();

  const [hygiene, setHygiene] = useState("4");
  const [condition, setCondition] = useState("3");
  const [total, setTotal] = useState("7");
  const [compliance, setCompliance] = useState("8");
  const [notes, setNotes] = useState("");

  const submitReport = () => {

    Alert.alert(
      "Report Submitted",
      "The inspection report has been submitted successfully.",
      [
        {
          text: "OK",
          onPress: () =>
            router.push("/inspector/inspections"),
        },
      ]
    );
  };

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
          Grading
        </Text>

      </View>

      <View style={styles.vendor}>

        <MaterialCommunityIcons
          name="store"
          size={35}
          color="#4CAF50"
        />

        <View>
          <Text style={styles.vendorName}>
            KatokKalimpyо
          </Text>

          <Text style={styles.vendorId}>
            UID: 2026012345
          </Text>
        </View>

      </View>

      <View style={styles.form}>

        <Text style={styles.label}>
          Hygiene System
        </Text>

        <TextInput
          style={styles.input}
          value={hygiene}
          onChangeText={setHygiene}
          keyboardType="numeric"
        />

        <Text style={styles.label}>
          Condition of Premises
        </Text>

        <TextInput
          style={styles.input}
          value={condition}
          onChangeText={setCondition}
          keyboardType="numeric"
        />

        <Text style={styles.label}>
          Total Score
        </Text>

        <TextInput
          style={styles.input}
          value={total}
          onChangeText={setTotal}
          keyboardType="numeric"
        />

        <Text style={styles.label}>
          Level of Compliance
        </Text>

        <TextInput
          style={styles.input}
          value={compliance}
          onChangeText={setCompliance}
          keyboardType="numeric"
        />

        <Text style={styles.label}>
          Add Notes
        </Text>

        <TextInput
          style={styles.notes}
          placeholder="Write your comments..."
          placeholderTextColor="#999"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={submitReport}
        >
          <Text style={styles.submitText}>
            Submit Report
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

  headerTitle: {
    color: "#4CAF50",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },

  vendor: {
    backgroundColor: "#fff",

    margin: 15,

    padding: 15,

    borderRadius: 15,

    flexDirection: "row",
    alignItems: "center",
  },

  vendorName: {
    fontWeight: "700",
    fontSize: 14,
  },

  vendorId: {
    color: "#777",
    fontSize: 8,
    marginTop: 3,
  },

  form: {
    backgroundColor: "#fff",

    marginHorizontal: 15,

    padding: 15,

    borderRadius: 15,
  },

  label: {
    fontSize: 9,
    color: "#555",
    marginBottom: 4,
  },

  input: {
    height: 35,

    backgroundColor: "#EDF6E8",

    borderRadius: 8,

    paddingHorizontal: 12,

    marginBottom: 10,

    fontSize: 11,
  },

  notes: {
    height: 70,

    backgroundColor: "#EDF6E8",

    borderRadius: 8,

    padding: 10,

    textAlignVertical: "top",

    fontSize: 10,
  },

  submitButton: {
    backgroundColor: "#4CAF50",

    borderRadius: 20,

    paddingVertical: 11,

    alignItems: "center",

    marginTop: 15,
  },

  submitText: {
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
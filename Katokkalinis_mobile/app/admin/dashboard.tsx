import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Manage Katok Kalinis operations</Text>
      </View>

      <View style={styles.content}>
        
        {/* Manage Reports */}
        <TouchableOpacity style={styles.card} onPress={() => router.push("/admin/reports")}>
          <Ionicons name="document-text-outline" size={35} color="#4CAF50" />
          <Text style={styles.cardTitle}>Manage Reports</Text>
          <Text style={styles.description}>
            View and update the status of Resident sanitation reports.
          </Text>
        </TouchableOpacity>

        {/* Manage Vendors */}
        <TouchableOpacity style={styles.card} onPress={() => router.push("/admin/vendors")}>
          <Ionicons name="storefront-outline" size={35} color="#4CAF50" />
          <Text style={styles.cardTitle}>Manage Vendors</Text>
          <Text style={styles.description}>
            View registered vendors, violations, and adjust points/status.
          </Text>
        </TouchableOpacity>

        {/* Manage Users/Staff */}
        <TouchableOpacity style={styles.card} onPress={() => router.push("/admin/users")}>
          <Ionicons name="people-outline" size={35} color="#4CAF50" />
          <Text style={styles.cardTitle}>Manage Staff</Text>
          <Text style={styles.description}>
            View and manage Drivers and Inspectors.
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#7ED957" },
  header: { paddingTop: 70, paddingHorizontal: 25, paddingBottom: 30 },
  title: { color: "white", fontSize: 28, fontWeight: "700" },
  subtitle: { color: "white", fontSize: 13, marginTop: 5 },
  content: { flex: 1, backgroundColor: "#F8F8F8", borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 20 },
  card: { backgroundColor: "white", borderRadius: 15, padding: 20, marginBottom: 15, elevation: 2 },
  cardTitle: { color: "#4CAF50", fontSize: 18, fontWeight: "700", marginTop: 10 },
  description: { color: "#777", fontSize: 12, marginTop: 5 },
});

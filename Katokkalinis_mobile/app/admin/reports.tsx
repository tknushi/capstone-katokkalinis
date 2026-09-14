import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiRequest } from "../../services/api";

export default function AdminReports() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/reports", { method: "GET" });
      if (res.success) {
        setReports(res.reports);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.reportType}>{item.type}</Text>
        <Text style={[
          styles.statusBadge, 
          { color: item.status === 'resolved' ? '#4CAF50' : '#F44336' }
        ]}>
          {item.status?.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Reports</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <FlatList
            data={reports}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No reports found.</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#7ED957" },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 15 },
  title: { color: "white", fontSize: 24, fontWeight: "700" },
  content: { flex: 1, backgroundColor: "#F8F8F8", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  card: { backgroundColor: "white", borderRadius: 12, padding: 15, marginBottom: 15, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  reportType: { fontSize: 16, fontWeight: '700', color: '#333' },
  statusBadge: { fontSize: 12, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#666', marginBottom: 10 },
  date: { fontSize: 11, color: '#999' },
  emptyText: { textAlign: 'center', color: '#777', marginTop: 20 },
});

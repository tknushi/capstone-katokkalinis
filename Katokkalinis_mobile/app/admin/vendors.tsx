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

export default function AdminVendors() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/vendors", { method: "GET" });
      if (res.success) {
        setVendors(res.vendors);
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
        <Text style={styles.businessName}>{item.business_name}</Text>
        <Text style={[
          styles.statusBadge, 
          { color: item.status === 'active' ? '#4CAF50' : '#F44336' }
        ]}>
          {item.status?.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.ownerName}>Owner: {item.owner_name}</Text>
      <Text style={styles.points}>Points: {item.points ?? 100}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Vendors</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <FlatList
            data={vendors}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No vendors found.</Text>
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
  businessName: { fontSize: 16, fontWeight: '700', color: '#333' },
  statusBadge: { fontSize: 12, fontWeight: 'bold' },
  ownerName: { fontSize: 14, color: '#666', marginBottom: 5 },
  points: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50' },
  emptyText: { textAlign: 'center', color: '#777', marginTop: 20 },
});

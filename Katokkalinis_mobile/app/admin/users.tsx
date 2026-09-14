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

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/users", { method: "GET" });
      if (res.success) {
        setUsers(res.users);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const roleName = item.role || (item.roles && item.roles[0]?.name) || "staff";
    const isAdmin = roleName === "admin" || roleName === "super_admin";
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={[
            styles.roleBadge, 
            { backgroundColor: isAdmin ? '#E1F5FE' : '#E8F5E9' }
          ]}>
            <Text style={{ color: isAdmin ? '#0288D1' : '#2E7D32', fontWeight: 'bold' }}>
              {roleName.toUpperCase()}
            </Text>
          </Text>
        </View>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Staff</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No staff found.</Text>
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
  userName: { fontSize: 16, fontWeight: '700', color: '#333' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  userEmail: { fontSize: 14, color: '#666' },
  emptyText: { textAlign: 'center', color: '#777', marginTop: 20 },
});

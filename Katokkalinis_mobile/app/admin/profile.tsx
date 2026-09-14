import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiRequest } from "../../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmall = SCREEN_WIDTH < 360;

export default function AdminProfile() {
  const router = useRouter();

  // Profile data
  const [name, setName] = useState("System Administrator");
  const [email, setEmail] = useState("admin@katokkalinis.com");
  const [adminId, setAdminId] = useState("ADM-2026");
  const [contactNumber, setContactNumber] = useState("09189876543");
  const [address, setAddress] = useState("Central City Hall, CENRO Division");
  const [rolePermissions] = useState("Full System & User Management Access");

  // Modals state
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [activityModalVisible, setActivityModalVisible] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(name);
  const [editContact, setEditContact] = useState(contactNumber);
  const [editAddress, setEditAddress] = useState(address);
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  // Notification Preferences
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [userRegistrationAlerts, setUserRegistrationAlerts] = useState(true);
  const [inspectionReportsAlerts, setInspectionReportsAlerts] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const storedName = await AsyncStorage.getItem("userName");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      const storedId = await AsyncStorage.getItem("userId");

      if (storedName) {
        setName(storedName);
        setEditName(storedName);
      }
      if (storedEmail) setEmail(storedEmail);
      if (storedId) setAdminId(`ADM-${storedId}`);

      try {
        const res = await apiRequest("/me", { method: "GET" });
        if (res && res.user) {
          if (res.user.name) setName(res.user.name);
          if (res.user.email) setEmail(res.user.email);
          if (res.user.contact_number) setContactNumber(res.user.contact_number);
          if (res.user.address) setAddress(res.user.address);
        }
      } catch {
        // Offline fallback
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Validation", "Name cannot be empty.");
      return;
    }

    try {
      setSavingProfile(true);
      const res = await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: editName.trim(),
          email: email.trim(),
          contact_number: editContact.trim(),
          address: editAddress.trim(),
        }),
      });

      if (res && res.success) {
        setName(editName.trim());
        setContactNumber(editContact.trim());
        setAddress(editAddress.trim());
        await AsyncStorage.setItem("userName", editName.trim());
        Alert.alert("Success", "Profile updated successfully.");
        setEditModalVisible(false);
      } else {
        Alert.alert("Error", res?.message || "Could not update profile.");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "An error occurred.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Validation", "Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Validation", "New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Validation", "New passwords do not match.");
      return;
    }

    try {
      setChangingPass(true);
      const res = await apiRequest("/change-password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      });

      if (res && res.success) {
        Alert.alert("Success", "Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSecurityModalVisible(false);
      } else {
        Alert.alert("Error", res?.message || "Failed to change password.");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "An error occurred.");
    } finally {
      setChangingPass(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out of your administrator account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.multiRemove([
              "katokkalinis_token",
              "authToken",
              "userRole",
              "userId",
              "userName",
              "userEmail",
            ]);
            router.replace("/role");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Profile</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
      >
        {/* PROFILE BANNER CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="shield-account" size={80} color="#4CAF50" />
            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={() => Alert.alert("Profile Picture", "Profile picture upload ready.")}
            >
              <MaterialCommunityIcons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.emailText}>{email}</Text>
          
          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <MaterialCommunityIcons name="shield-lock-outline" size={14} color="#2E7D32" style={{ marginRight: 4 }} />
              <Text style={styles.roleBadgeText}>Super Administrator</Text>
            </View>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>ID: {adminId}</Text>
            </View>
          </View>

          {/* ADMIN STATS ROW */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>18</Text>
              <Text style={styles.statLabel}>Total Staff</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#4CAF50" }]}>42</Text>
              <Text style={styles.statLabel}>Vendors</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Access Level</Text>
            </View>
          </View>
        </View>

        {/* PROFILE MENU SECTIONS */}
        <View style={styles.menuCard}>
          {/* 1. VIEW PROFILE */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setViewModalVisible(true)}
          >
            <View style={[styles.iconBox, { backgroundColor: "#E8F5E9" }]}>
              <MaterialCommunityIcons name="card-account-details-outline" size={22} color="#4CAF50" />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuTitle}>View Profile</Text>
              <Text style={styles.menuSub}>Personal, contact & permission levels</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
          </TouchableOpacity>

          {/* 2. EDIT PROFILE */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => {
              setEditName(name);
              setEditContact(contactNumber);
              setEditAddress(address);
              setEditModalVisible(true);
            }}
          >
            <View style={[styles.iconBox, { backgroundColor: "#E3F2FD" }]}>
              <MaterialCommunityIcons name="account-edit-outline" size={22} color="#1976D2" />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuTitle}>Edit Profile</Text>
              <Text style={styles.menuSub}>Update name, contact & division</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
          </TouchableOpacity>

          {/* 3. SECURITY */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setSecurityModalVisible(true)}
          >
            <View style={[styles.iconBox, { backgroundColor: "#FFF3E0" }]}>
              <MaterialCommunityIcons name="lock-outline" size={22} color="#F57C00" />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuTitle}>Security</Text>
              <Text style={styles.menuSub}>Change password & admin audit logs</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
          </TouchableOpacity>

          {/* 4. NOTIFICATIONS */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setNotifModalVisible(true)}
          >
            <View style={[styles.iconBox, { backgroundColor: "#F3E5F5" }]}>
              <MaterialCommunityIcons name="bell-outline" size={22} color="#7B1FA2" />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuTitle}>Notifications</Text>
              <Text style={styles.menuSub}>System incident & dispatch alerts</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
          </TouchableOpacity>

          {/* 5. ACTIVITY HISTORY */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setActivityModalVisible(true)}
          >
            <View style={[styles.iconBox, { backgroundColor: "#E0F2F1" }]}>
              <MaterialCommunityIcons name="history" size={22} color="#00796B" />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={styles.menuTitle}>Activity Logs</Text>
              <Text style={styles.menuSub}>User management & audit records</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
          </TouchableOpacity>

          {/* 6. LOGOUT */}
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <View style={[styles.iconBox, { backgroundColor: "#FFEBEE" }]}>
              <MaterialCommunityIcons name="logout" size={22} color="#D32F2F" />
            </View>
            <View style={styles.menuTextBox}>
              <Text style={[styles.menuTitle, { color: "#D32F2F" }]}>Logout</Text>
              <Text style={styles.menuSub}>Sign out of this device</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#D32F2F" />
          </TouchableOpacity>
        </View>

        {/* EXTRA LOGOUT ACTION BUTTON */}
        <TouchableOpacity
          style={styles.bottomLogoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="power" size={20} color="#D32F2F" style={{ marginRight: 8 }} />
          <Text style={styles.bottomLogoutText}>Log Out Account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ==================================================== */}
      {/* 1. VIEW PROFILE MODAL */}
      {/* ==================================================== */}
      <Modal visible={viewModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Admin Profile Details</Text>
              <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.modalSectionHeader}>Personal Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Contact Number</Text>
                <Text style={styles.infoValue}>{contactNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Office / Division</Text>
                <Text style={styles.infoValue}>{address}</Text>
              </View>

              <Text style={styles.modalSectionHeader}>Security & Permissions</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Administrator ID</Text>
                <Text style={styles.infoValue}>{adminId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Role Access</Text>
                <Text style={[styles.infoValue, { color: "#4CAF50", fontWeight: "700" }]}>{rolePermissions}</Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setViewModalVisible(false)}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================================================== */}
      {/* 2. EDIT PROFILE MODAL */}
      {/* ==================================================== */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Admin Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter full name"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Contact Number</Text>
              <TextInput
                style={styles.modalInput}
                value={editContact}
                onChangeText={setEditContact}
                placeholder="Enter contact number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Office / Division</Text>
              <TextInput
                style={styles.modalInput}
                value={editAddress}
                onChangeText={setEditAddress}
                placeholder="Enter office address"
                placeholderTextColor="#999"
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalActionButton, savingProfile && { opacity: 0.6 }]}
              onPress={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalActionText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================================================== */}
      {/* 3. SECURITY MODAL */}
      {/* ==================================================== */}
      <Modal visible={securityModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Security & Audit</Text>
              <TouchableOpacity onPress={() => setSecurityModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.modalSectionHeader}>Change Password</Text>

              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Minimum 8 characters"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor="#999"
              />

              <TouchableOpacity
                style={[styles.modalActionButton, changingPass && { opacity: 0.6 }]}
                onPress={handleChangePassword}
                disabled={changingPass}
              >
                {changingPass ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalActionText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ==================================================== */}
      {/* 4. NOTIFICATIONS MODAL */}
      {/* ==================================================== */}
      <Modal visible={notifModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Admin Alerts</Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.toggleTitle}>System Alerts</Text>
                <Text style={styles.toggleSub}>Critical system & server status notifications</Text>
              </View>
              <Switch
                value={systemAlerts}
                onValueChange={setSystemAlerts}
                trackColor={{ false: "#ccc", true: "#7ED957" }}
                thumbColor={systemAlerts ? "#4CAF50" : "#f4f3f4"}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.toggleTitle}>User Registrations</Text>
                <Text style={styles.toggleSub}>New vendor and resident registrations</Text>
              </View>
              <Switch
                value={userRegistrationAlerts}
                onValueChange={setUserRegistrationAlerts}
                trackColor={{ false: "#ccc", true: "#7ED957" }}
                thumbColor={userRegistrationAlerts ? "#4CAF50" : "#f4f3f4"}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.toggleTitle}>Inspection Reports</Text>
                <Text style={styles.toggleSub}>Receive alerts on completed market audits</Text>
              </View>
              <Switch
                value={inspectionReportsAlerts}
                onValueChange={setInspectionReportsAlerts}
                trackColor={{ false: "#ccc", true: "#7ED957" }}
                thumbColor={inspectionReportsAlerts ? "#4CAF50" : "#f4f3f4"}
              />
            </View>

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setNotifModalVisible(false)}>
              <Text style={styles.modalCloseText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================================================== */}
      {/* 5. ACTIVITY HISTORY MODAL */}
      {/* ==================================================== */}
      <Modal visible={activityModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Activity & Audit Logs</Text>
              <TouchableOpacity onPress={() => setActivityModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.activityCard}>
                <MaterialCommunityIcons name="account-check" size={22} color="#4CAF50" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.activityTitle}>Vendor Verified: KatokKalimpyo</Text>
                  <Text style={styles.activitySub}>Status set to active by Admin</Text>
                  <Text style={styles.activityDate}>Today, 09:15 AM</Text>
                </View>
              </View>

              <View style={styles.activityCard}>
                <MaterialCommunityIcons name="file-chart" size={22} color="#1976D2" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.activityTitle}>Generated Monthly Inspection Report</Text>
                  <Text style={styles.activitySub}>Exported summary PDF</Text>
                  <Text style={styles.activityDate}>Yesterday, 05:00 PM</Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setActivityModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: "#fff",
    fontSize: isSmall ? 18 : 22,
    fontWeight: "700",
  },

  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },

  profileCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },

  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#4CAF50",
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  nameText: {
    fontSize: isSmall ? 18 : 22,
    fontWeight: "700",
    color: "#2E382D",
  },

  emailText: {
    fontSize: isSmall ? 12 : 14,
    color: "#666",
    marginTop: 2,
  },

  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },

  roleBadgeText: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "700",
  },

  idBadge: {
    backgroundColor: "#F0F4EF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },

  idBadgeText: {
    color: "#555",
    fontSize: 12,
    fontWeight: "600",
  },

  statsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEF4EC",
  },

  statItem: {
    alignItems: "center",
    flex: 1,
  },

  statNumber: {
    fontSize: isSmall ? 18 : 22,
    fontWeight: "800",
    color: "#333",
  },

  statLabel: {
    fontSize: 11,
    color: "#777",
    marginTop: 2,
    fontWeight: "500",
  },

  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E0E8DC",
  },

  menuCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F7F2",
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  menuTextBox: {
    flex: 1,
  },

  menuTitle: {
    fontSize: isSmall ? 14 : 16,
    fontWeight: "700",
    color: "#333",
  },

  menuSub: {
    fontSize: isSmall ? 11 : 12,
    color: "#888",
    marginTop: 2,
  },

  bottomLogoutButton: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#FFEBEE",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },

  bottomLogoutText: {
    color: "#D32F2F",
    fontSize: 15,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "85%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E382D",
  },

  modalSectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4CAF50",
    marginTop: 14,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  infoRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F7F2",
  },

  infoLabel: {
    fontSize: 12,
    color: "#777",
    fontWeight: "500",
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginTop: 3,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginTop: 12,
    marginBottom: 6,
  },

  modalInput: {
    backgroundColor: "#EDF6E8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
  },

  modalActionButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },

  modalActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  modalCloseButton: {
    backgroundColor: "#EDF6E8",
    borderRadius: 25,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 18,
  },

  modalCloseText: {
    color: "#4CAF50",
    fontSize: 15,
    fontWeight: "700",
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F7F2",
  },

  toggleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },

  toggleSub: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },

  activityCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAF8",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EAEFE8",
  },

  activityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },

  activitySub: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },

  activityDate: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 4,
  },
});

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchVendorByCodeOrId, VendorItem } from "../../services/inspector";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmall = SCREEN_WIDTH < 360;

export default function Vendor() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [vendor, setVendor] = useState<VendorItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadVendor = React.useCallback(async () => {
    try {
      setLoading(true);
      const idOrCode = (params.vendor_id as string) || "2026012345";
      const res = await fetchVendorByCodeOrId(idOrCode);
      if (res.success && res.vendor) {
        setVendor(res.vendor);
      } else {
        setVendor({
          id: 1,
          vendor_code: "2026012345",
          business_name: "KatokKalimpyo Fresh Fruits",
          owner_name: "Juan Dela Cruz",
          contact_number: "09467802940",
          address: "Divisoria Public Market, Section B",
          status: "active",
          user: {
            id: 1,
            name: "Juan Dela Cruz",
            email: "vendor@katokkalinis.com",
          },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [params.vendor_id]);

  useEffect(() => {
    loadVendor();
  }, [loadVendor]);

  const handleContinue = () => {
    router.push({
      pathname: "/inspector/grade",
      params: {
        vendor_id: vendor?.id || 1,
        vendor_name: vendor?.business_name || "KatokKalimpyo",
        vendor_code: vendor?.vendor_code || "2026012345",
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER (Dashboard / Profile Theme: Clean white with dark arrow and centered title) */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E331B" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Vendor Profile</Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginVertical: 40 }} />
        ) : (
          <>
            {/* 2. TOP PROFILE CARD (Matching Image 2 Resident Profile Card) */}
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                  <MaterialCommunityIcons name="storefront" size={44} color="#2E7D32" />
                </View>
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.vendorName}>
                {vendor?.business_name || "KatokKalimpyo Fresh Fruits"}
              </Text>
              <Text style={styles.vendorEmail}>
                {vendor?.user?.email || "vendor@katokkalinis.com"}
              </Text>

              {/* Badges Row (Matching Image 2: Barangay Resident & ID) */}
              <View style={styles.badgeRow}>
                <View style={styles.roleBadge}>
                  <MaterialCommunityIcons name="storefront-outline" size={14} color="#2E7D32" />
                  <Text style={styles.roleBadgeText}>Official Vendor</Text>
                </View>

                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>
                    Code: {vendor?.vendor_code || vendor?.qr_code || "2026012345"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Stats Row (Matching Image 2 Collections / Reports stats) */}
              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={styles.statNumber}>Verified</Text>
                  <Text style={styles.statLabel}>Compliance Status</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={[styles.statNumber, { color: "#2E7D32" }]}>Active</Text>
                  <Text style={styles.statLabel}>Registration</Text>
                </View>
              </View>
            </View>

            {/* 3. DETAILS CARD (Matching Image 2 List rows) */}
            <View style={styles.detailsCard}>
              {/* Registered Owner */}
              <View style={styles.detailRow}>
                <View style={[styles.detailIconBox, { backgroundColor: "#E8F8EE" }]}>
                  <MaterialCommunityIcons name="account-outline" size={20} color="#2E7D32" />
                </View>
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Registered Owner</Text>
                  <Text style={styles.detailValue}>{vendor?.owner_name || "Juan Dela Cruz"}</Text>
                </View>
              </View>

              <View style={styles.rowDivider} />

              {/* Contact Number */}
              <View style={styles.detailRow}>
                <View style={[styles.detailIconBox, { backgroundColor: "#E3F2FD" }]}>
                  <MaterialCommunityIcons name="phone-outline" size={20} color="#1976D2" />
                </View>
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Contact Number</Text>
                  <Text style={styles.detailValue}>{vendor?.contact_number || "09467802940"}</Text>
                </View>
              </View>

              <View style={styles.rowDivider} />

              {/* Official Email */}
              <View style={styles.detailRow}>
                <View style={[styles.detailIconBox, { backgroundColor: "#FFF3E0" }]}>
                  <MaterialCommunityIcons name="email-outline" size={20} color="#E65100" />
                </View>
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Official Email</Text>
                  <Text style={styles.detailValue}>
                    {vendor?.user?.email || "vendor@katokkalinis.com"}
                  </Text>
                </View>
              </View>

              <View style={styles.rowDivider} />

              {/* Stall Location */}
              <View style={styles.detailRow}>
                <View style={[styles.detailIconBox, { backgroundColor: "#F3E5F5" }]}>
                  <MaterialCommunityIcons name="map-marker-outline" size={20} color="#7B1FA2" />
                </View>
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Stall Market Location</Text>
                  <Text style={styles.detailValue}>
                    {vendor?.address || vendor?.barangay?.name || "Divisoria Public Market, Section B"}
                  </Text>
                </View>
              </View>
            </View>

            {/* 4. PROCEED ACTION BUTTON (Matching Dashboard/Profile Primary Button) */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Proceed to Grade Stall</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="#FFFFFF"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* 5. BOTTOM NAVIGATION (Matching Image 2 & 3 Green Bar) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/inspector/dashboard" as any)}
        >
          <MaterialCommunityIcons name="home-outline" size={24} color="rgba(255, 255, 255, 0.85)" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/inspector/inspections" as any)}
        >
          <MaterialCommunityIcons name="clipboard-check-outline" size={22} color="rgba(255, 255, 255, 0.85)" />
          <Text style={styles.navText}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#FFFFFF" />
          <Text style={[styles.navText, { fontWeight: "800" }]}>Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/inspector/profile" as any)}
        >
          <MaterialCommunityIcons name="account-outline" size={22} color="rgba(255, 255, 255, 0.85)" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFDFB",
  },

  // 1. Top Header matching Dashboard & Profile
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 50 : 42,
    paddingBottom: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF5ED",
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F7F1",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E331B",
    textAlign: "center",
  },

  headerRightPlaceholder: {
    width: 36,
  },

  scrollContent: {
    paddingBottom: 95,
  },

  // 2. Profile Card matching Image 2 "Resident Profile"
  profileCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 14,
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF5ED",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },

  avatarCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#E8F8EE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#C5E6CE",
  },

  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  vendorName: {
    fontSize: isSmall ? 18 : 21,
    fontWeight: "900",
    color: "#1E331B",
    textAlign: "center",
  },

  vendorEmail: {
    fontSize: 13,
    color: "#5C7558",
    marginTop: 2,
    textAlign: "center",
  },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8EE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },

  roleBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
  },

  idBadge: {
    backgroundColor: "#F2F7F1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  idBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4A6146",
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#EEF5ED",
    marginVertical: 16,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-around",
  },

  statCol: {
    alignItems: "center",
    flex: 1,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1E331B",
  },

  statLabel: {
    fontSize: 12,
    color: "#6B8267",
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#EEF5ED",
  },

  // 3. Details Card matching Image 2 second card
  detailsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF5ED",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  detailIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  detailTextCol: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 12,
    color: "#688264",
    fontWeight: "600",
  },

  detailValue: {
    fontSize: 14,
    color: "#1E331B",
    fontWeight: "800",
    marginTop: 1,
  },

  rowDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F2F7F1",
    marginVertical: 4,
  },

  // 4. Action Button matching primary green
  continueButton: {
    backgroundColor: "#2E7D32",
    marginHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 26,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.2,
  },

  // 5. Bottom Navigation
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: "#68B93C",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navItem: {
    alignItems: "center",
    paddingVertical: 4,
  },

  navText: {
    color: "#FFFFFF",
    fontSize: 10,
    marginTop: 2,
  },
});
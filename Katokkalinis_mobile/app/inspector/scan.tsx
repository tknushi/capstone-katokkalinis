import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchVendorByCodeOrId } from "../../services/inspector";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmall = SCREEN_WIDTH < 360;
const QR_BOX_SIZE = Math.min(270, SCREEN_WIDTH * 0.72);

export default function Scan() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const processVendorCode = async (rawCode: string) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      let codeToSearch = rawCode.trim();
      try {
        const parsed = JSON.parse(rawCode);
        if (parsed.vendor_code) codeToSearch = parsed.vendor_code;
        else if (parsed.code) codeToSearch = parsed.code;
        else if (parsed.id) codeToSearch = String(parsed.id);
      } catch {
        // Plain string
      }

      console.log("Processing scanned code:", codeToSearch);
      const res = await fetchVendorByCodeOrId(codeToSearch);

      if (res.success && res.vendor) {
        router.push({
          pathname: "/inspector/vendor",
          params: { vendor_id: res.vendor.id },
        });
      } else {
        Alert.alert(
          "Vendor Not Found",
          res.message || `No vendor stall registered under code: ${codeToSearch}`,
          [
            {
              text: "Try Again",
              onPress: () => setScanned(false),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Scan Error",
        error?.message || "An error occurred while connecting to system.",
        [
          {
            text: "OK",
            onPress: () => setScanned(false),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!scanned && !loading && data) {
      processVendorCode(data);
    }
  };

  const handleManualScan = () => {
    const code = manualCode.trim() || "2026012345";
    processVendorCode(code);
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

        <Text style={styles.headerTitle}>Scan QR Code</Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 2. GREETING / INTRO BANNER (Matching Dashboard section intro) */}
        <View style={styles.greetingBar}>
          <Text style={styles.sectionTitle}>Vendor Stall Scanner</Text>
          <Text style={styles.sectionSubtitle}>
            Point camera at the vendor stall compliance code to verify registration
          </Text>
        </View>

        {/* 3. FLOATING SCANNER CARD (Matching Dashboard / Profile clean white card) */}
        <View style={styles.scanCard}>
          <View style={styles.qrBox}>
            {loading ? (
              <ActivityIndicator size="large" color="#2E7D32" />
            ) : permission?.granted ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              />
            ) : (
              <TouchableOpacity
                style={styles.permissionContainer}
                onPress={requestPermission}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="camera-plus-outline" size={56} color="#2E7D32" />
                <Text style={styles.permissionText}>
                  Enable camera permissions to scan stall QR
                </Text>
              </TouchableOpacity>
            )}

            {/* Corner frame overlay */}
            <View style={styles.frameOverlay} pointerEvents="none">
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          <Text style={styles.instruction}>
            {showManualInput ? "Manual Stall Verification" : "Position QR Code within Frame"}
          </Text>

          {showManualInput ? (
            <View style={styles.manualContainer}>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="barcode-scan" size={20} color="#2E7D32" />
                <TextInput
                  style={styles.manualInput}
                  placeholder="Enter Stall Code (e.g. 2026012345)"
                  placeholderTextColor="#8FA58A"
                  value={manualCode}
                  onChangeText={setManualCode}
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleManualScan}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>Verify Stall Code</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleManualScan}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                {loading ? "Verifying..." : "Scan Demo QR Code"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.toggleManualBtn}
            onPress={() => setShowManualInput(!showManualInput)}
          >
            <Text style={styles.toggleManualText}>
              {showManualInput ? "Switch to Camera View" : "Enter Code Manually instead"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 4. BOTTOM NAVIGATION (Matching Image 2 & 3 Green Bar) */}
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

  // Greeting Section matching Dashboard
  greetingBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1E331B",
    letterSpacing: -0.2,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: "#5C7558",
    marginTop: 3,
    lineHeight: 18,
  },

  // Scan Card matching Dashboard heroCard & Profile card
  scanCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
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

  qrBox: {
    width: QR_BOX_SIZE,
    height: QR_BOX_SIZE,
    borderRadius: 20,
    backgroundColor: "#E8F8EE",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1.5,
    borderColor: "#C5E6CE",
  },

  permissionContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  permissionText: {
    marginTop: 12,
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
  },

  corner: {
    position: "absolute",
    width: 26,
    height: 26,
    borderColor: "#2E7D32",
  },

  topLeft: {
    top: 14,
    left: 14,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 6,
  },

  topRight: {
    top: 14,
    right: 14,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 6,
  },

  bottomLeft: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 6,
  },

  bottomRight: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 6,
  },

  instruction: {
    marginTop: 20,
    fontSize: 15,
    fontWeight: "800",
    color: "#2E382D",
  },

  scanButton: {
    backgroundColor: "#2E7D32",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 16,
    elevation: 3,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.2,
  },

  toggleManualBtn: {
    marginTop: 14,
    padding: 6,
  },

  toggleManualText: {
    color: "#3A6335",
    fontWeight: "700",
    fontSize: 13,
    textDecorationLine: "underline",
  },

  manualContainer: {
    width: "100%",
    marginTop: 10,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FCF8",
    borderWidth: 1.2,
    borderColor: "#D6E4D4",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },

  manualInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#1F2920",
    fontWeight: "600",
  },

  // Bottom Navigation
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import KatokLogo from "../../components/KatokLogo";
import { submitInspection } from "../../services/inspector";

const ratingOptions = [5, 4, 3, 2, 1];

export default function Grade() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const vendorId = Number(params.vendor_id) || 1;
  const vendorName = (params.vendor_name as string) || "KatokKalimpyo Fruit Stall";
  const vendorCode = (params.vendor_code as string) || "2026012345";
  const initialStatus = (params.status as string) || "pending";

  const [hygiene, setHygiene] = useState(4);
  const [condition, setCondition] = useState(4);
  const [total, setTotal] = useState(8);
  const [compliance, setCompliance] = useState(8.0);
  const [notes, setNotes] = useState("Good sanitation, clean food display and proper waste bin segregation.");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Lock state (Requirement 18)
  const [isLocked, setIsLocked] = useState(initialStatus === "completed");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sum = hygiene + condition;
    setTotal(sum);
    const compScore = Math.min(10, Math.round((sum / 10) * 10 * 10) / 10);
    setCompliance(compScore);
  }, [hygiene, condition]);

  const handlePickPhoto = () => {
    if (isLocked) return;

    Alert.alert("Photo Evidence", "Select photo source:", [
      {
        text: "Take Photo (Camera)",
        onPress: async () => {
          try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Needed", "Camera permission is required to capture evidence.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 0.7,
            });
            if (!result.canceled && result.assets?.[0]?.uri) {
              setPhotoUri(result.assets[0].uri);
            }
          } catch (e) {
            console.error(e);
          }
        },
      },
      {
        text: "Choose from Gallery",
        onPress: async () => {
          try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Needed", "Gallery permission is required to select photos.");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              quality: 0.7,
            });
            if (!result.canceled && result.assets?.[0]?.uri) {
              setPhotoUri(result.assets[0].uri);
            }
          } catch (e) {
            console.error(e);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const submitReport = async () => {
    try {
      setLoading(true);
      const inspectorIdStr = await AsyncStorage.getItem("userId");
      const inspectorId = inspectorIdStr ? parseInt(inspectorIdStr, 10) : 1;

      const hygieneNum = Math.min(100, Math.max(0, hygiene * 20));
      const conditionNum = Math.min(100, Math.max(0, condition * 20));

      const res = await submitInspection({
        vendor_id: vendorId,
        inspector_id: inspectorId,
        hygiene_system: hygieneNum,
        condition_of_premises: conditionNum,
        notes: notes.trim() || undefined,
        status: "completed",
      });

      if (res.success) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          // Haptics fallback
        }
        setIsLocked(true); // Lock report upon successful submission (Requirement 18)
        Alert.alert(
          "Grading Report Submitted & Locked",
          "The sanitation score has been officially certified and locked to prevent accidental modifications.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Submission Failed", res.message || "Failed to save inspection report.");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "An error occurred while submitting.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockEdit = () => {
    Alert.alert(
      "Unlock Grading Report?",
      "This inspection is currently locked. Unlocking allows you to alter scores and update photo evidence.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlock & Edit",
          style: "destructive",
          onPress: () => {
            setIsLocked(false);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1E331B" />
          </TouchableOpacity>
          <KatokLogo variant="header" showTagline={false} />
        </View>

        {isLocked && (
          <TouchableOpacity
            style={styles.unlockBtn}
            onPress={handleUnlockEdit}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="lock-open-outline" size={16} color="#D97706" />
            <Text style={styles.unlockBtnText}>Edit Report</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* LOCK STATUS BANNER (Requirement 18) */}
        {isLocked ? (
          <View style={styles.lockedBanner}>
            <MaterialCommunityIcons name="lock" size={18} color="#2E7D32" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.lockedBannerTitle}>Grading Report Locked</Text>
              <Text style={styles.lockedBannerSub}>
                This report is read-only. Tap &apos;Edit Report&apos; above if changes are required.
              </Text>
            </View>
          </View>
        ) : null}

        {/* 2. VENDOR INFO HERO CARD */}
        <View style={styles.vendorHeroCard}>
          <View style={styles.vendorIconCircle}>
            <MaterialCommunityIcons name="storefront" size={28} color="#2E7D32" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.vendorName}>{vendorName}</Text>
            <Text style={styles.vendorSub}>Stall Code: {vendorCode}</Text>
            <Text style={styles.vendorDate}>Evaluation: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Text>
          </View>

          <View style={[styles.statusBadge, isLocked ? styles.badgeLocked : styles.badgeDraft]}>
            <Text style={[styles.statusBadgeText, isLocked ? styles.badgeLockedText : styles.badgeDraftText]}>
              {isLocked ? "Graded & Certified" : "Draft Evaluation"}
            </Text>
          </View>
        </View>

        {/* 3. SCORING CRITERIA */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Sanitation Criteria</Text>

          {/* CRITERION 1 */}
          <Text style={styles.criterionLabel}>1. Hygiene & Waste Segregation (1 to 5)</Text>
          <View style={styles.ratingRow}>
            {ratingOptions.map((val) => (
              <TouchableOpacity
                key={`hyg-${val}`}
                style={[
                  styles.ratingPill,
                  hygiene === val && styles.ratingPillActive,
                  isLocked && styles.ratingPillDisabled,
                ]}
                onPress={() => !isLocked && setHygiene(val)}
                disabled={isLocked}
                activeOpacity={0.8}
              >
                <Text style={[styles.ratingPillText, hygiene === val && styles.ratingPillTextActive]}>
                  {val}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* CRITERION 2 */}
          <Text style={[styles.criterionLabel, { marginTop: 16 }]}>
            2. Condition of Premises & Stall Cleanliness (1 to 5)
          </Text>
          <View style={styles.ratingRow}>
            {ratingOptions.map((val) => (
              <TouchableOpacity
                key={`cond-${val}`}
                style={[
                  styles.ratingPill,
                  condition === val && styles.ratingPillActive,
                  isLocked && styles.ratingPillDisabled,
                ]}
                onPress={() => !isLocked && setCondition(val)}
                disabled={isLocked}
                activeOpacity={0.8}
              >
                <Text style={[styles.ratingPillText, condition === val && styles.ratingPillTextActive]}>
                  {val}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* TOTAL SCORE BOX */}
          <View style={styles.scoreSummaryBox}>
            <View style={styles.scoreMetric}>
              <Text style={styles.scoreLabel}>COMBINED SCORE</Text>
              <Text style={styles.scoreVal}>{total} / 10</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreMetric}>
              <Text style={styles.scoreLabel}>COMPLIANCE RATING</Text>
              <Text style={[styles.scoreVal, { color: compliance >= 7.5 ? "#2E7D32" : "#D97706" }]}>
                {compliance * 10}%
              </Text>
            </View>
          </View>
        </View>

        {/* 4. PHOTO EVIDENCE ATTACHMENT (Requirement 19) */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Photo Evidence</Text>
          <Text style={styles.cardHeaderSub}>
            Attach photographic documentation of stalls and waste receptacles.
          </Text>

          {photoUri ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUri }} style={styles.evidenceImage} resizeMode="cover" />
              {!isLocked && (
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => setPhotoUri(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons name="close-circle" size={24} color="#D32F2F" />
                </TouchableOpacity>
              )}
              <View style={styles.evidenceBadge}>
                <MaterialCommunityIcons name="check-circle" size={14} color="#2E7D32" />
                <Text style={styles.evidenceBadgeText}>Photo Evidence Attached</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.attachBtn, isLocked && styles.attachBtnDisabled]}
              onPress={handlePickPhoto}
              disabled={isLocked}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="camera-plus" size={24} color="#2E7D32" />
              <Text style={styles.attachBtnText}>Attach Stall Photo Evidence</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 5. INSPECTION FINDINGS & NOTES */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Inspection Findings</Text>
          <View style={[styles.notesBox, isLocked && styles.notesBoxLocked]}>
            <TextInput
              style={styles.notesInput}
              multiline
              editable={!isLocked}
              placeholder="Enter inspector observations, recommendations, or violations..."
              placeholderTextColor="#9AA998"
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>

        {/* 6. SUBMIT BUTTON */}
        {!isLocked ? (
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={submitReport}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Submit & Lock Grading Report</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.unlockActionBtn}
            onPress={handleUnlockEdit}
            activeOpacity={0.88}
          >
            <MaterialCommunityIcons name="pencil-outline" size={18} color="#FFFFFF" />
            <Text style={styles.unlockActionBtnText}>Edit Submitted Report</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFDFB",
    paddingTop: 45,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF5ED",
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F7F1",
    alignItems: "center",
    justifyContent: "center",
  },
  unlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFE082",
    gap: 4,
  },
  unlockBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D97706",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
  },
  lockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8EE",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#C5EBD2",
    marginBottom: 14,
  },
  lockedBannerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2E7D32",
  },
  lockedBannerSub: {
    fontSize: 11,
    color: "#5C7558",
    marginTop: 2,
  },
  vendorHeroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EDF4EC",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    marginBottom: 14,
  },
  vendorIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F8EE",
    alignItems: "center",
    justifyContent: "center",
  },
  vendorName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E331B",
  },
  vendorSub: {
    fontSize: 11,
    color: "#6B8468",
    marginTop: 2,
  },
  vendorDate: {
    fontSize: 10,
    color: "#8FA58A",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeLocked: {
    backgroundColor: "#E8F8EE",
  },
  badgeLockedText: {
    color: "#2E7D32",
    fontSize: 10,
    fontWeight: "800",
  },
  badgeDraft: {
    backgroundColor: "#FFF3E0",
  },
  badgeDraftText: {
    color: "#E65100",
    fontSize: 10,
    fontWeight: "800",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EDF4EC",
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E331B",
  },
  cardHeaderSub: {
    fontSize: 11,
    color: "#6B8468",
    marginTop: 2,
    marginBottom: 12,
  },
  criterionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3B5238",
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 8,
  },
  ratingPill: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F2F7F1",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D8E6D6",
  },
  ratingPillActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  ratingPillDisabled: {
    opacity: 0.7,
  },
  ratingPillText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#4A6146",
  },
  ratingPillTextActive: {
    color: "#FFFFFF",
  },
  scoreSummaryBox: {
    flexDirection: "row",
    backgroundColor: "#F7FAF6",
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E2ECE0",
  },
  scoreMetric: {
    flex: 1,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#7A9477",
    letterSpacing: 0.5,
  },
  scoreVal: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1E331B",
    marginTop: 2,
  },
  scoreDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#DCE7DA",
  },
  photoContainer: {
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  evidenceImage: {
    width: "100%",
    height: 180,
    borderRadius: 14,
  },
  removePhotoBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    elevation: 4,
  },
  evidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8EE",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  evidenceBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
  },
  attachBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F8EE",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#C5EBD2",
    gap: 8,
  },
  attachBtnDisabled: {
    opacity: 0.5,
  },
  attachBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2E7D32",
  },
  notesBox: {
    backgroundColor: "#F9FAF8",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EDF2EC",
    minHeight: 80,
    marginTop: 8,
  },
  notesBoxLocked: {
    backgroundColor: "#F2F5F1",
  },
  notesInput: {
    fontSize: 13,
    lineHeight: 18,
    color: "#243322",
  },
  submitBtn: {
    backgroundColor: "#2E7D32",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
    elevation: 3,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  unlockActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D97706",
    borderRadius: 14,
    paddingVertical: 14,
    gap: 6,
    marginTop: 6,
  },
  unlockActionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
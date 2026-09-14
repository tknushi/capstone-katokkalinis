import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchFeedback, submitFeedback } from "../services/resident";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmall = SCREEN_WIDTH < 360;

export default function Feedback() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const response = await fetchFeedback();
      if (response && response.success && Array.isArray(response.feedbacks)) {
        setFeedbacks(response.feedbacks);
      }
    } catch (error) {
      console.error("Load feedback error:", error);
    } finally {
      setFetching(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFeedback();
  };

  const handleFeedback = async () => {
    if (!content.trim()) {
      Alert.alert("Missing Feedback", "Please write your thoughts or suggestions before submitting.");
      return;
    }

    try {
      setLoading(true);
      const response = await submitFeedback(content.trim());

      if (response && response.success) {
        Alert.alert("Thank You!", "Your feedback has been received and shared with our community team.");
        setContent("");
        loadFeedback();
      } else {
        Alert.alert("Error", (response && response.message) || "Failed to submit feedback.");
      }
    } catch (_error) {
      Alert.alert("Error", "An unexpected connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Community Feedback</Text>
        <Text style={styles.headerSubtitle}>
          Share suggestions to help us improve garbage collection & local hygiene.
        </Text>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#38B000"]}
              tintColor="#38B000"
            />
          }
        >
          <Text style={styles.label}>Write Your Feedback</Text>

          <View style={styles.textareaContainer}>
            <TextInput
              multiline
              placeholder="Tell us about collection timing, service quality, or suggestions..."
              placeholderTextColor="#8FA58A"
              style={styles.textarea}
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleFeedback}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Your Past Feedback</Text>

          {fetching ? (
            <ActivityIndicator size="large" color="#4CAF50" style={{ marginVertical: 20 }} />
          ) : feedbacks.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="chat-outline" size={32} color="#79B96A" />
              <Text style={styles.emptyText}>No feedback submitted yet. Your voice matters!</Text>
            </View>
          ) : (
            feedbacks.map((f) => (
              <View key={f.id} style={styles.feedbackCard}>
                <View style={styles.feedbackHeader}>
                  <View style={styles.feedbackIconCircle}>
                    <MaterialCommunityIcons name="comment-text-outline" size={16} color="#2E7D32" />
                  </View>
                  <Text style={styles.feedbackDate}>
                    {f.created_at ? new Date(f.created_at).toLocaleDateString() : "Recent"}
                  </Text>
                </View>
                <Text style={styles.feedbackText}>{f.content}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7ED957",
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 22,
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },

  headerTitle: {
    fontSize: isSmall ? 24 : 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.95)",
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 320,
  },

  content: {
    flex: 1,
    backgroundColor: "#F6F8F3",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: "hidden",
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 40,
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2E4A28",
    marginBottom: 8,
  },

  textareaContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    height: 140,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#D9EED3",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  textarea: {
    fontSize: 14,
    color: "#1F2920",
    height: "100%",
  },

  submitButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#38B000",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 24,
    elevation: 3,
    shadowColor: "#38B000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  disabledButton: {
    opacity: 0.6,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2E382D",
    marginBottom: 10,
  },

  feedbackCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#E6EFE4",
  },

  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  feedbackIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E8F8EE",
    justifyContent: "center",
    alignItems: "center",
  },

  feedbackDate: {
    fontSize: 11,
    color: "#8FA58A",
    fontWeight: "600",
  },

  feedbackText: {
    fontSize: 13,
    color: "#3F4E3D",
    lineHeight: 18,
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6EFE4",
  },

  emptyText: {
    fontSize: 12,
    color: "#7E927A",
    marginTop: 6,
    textAlign: "center",
  },
});

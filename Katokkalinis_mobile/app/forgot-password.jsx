import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { forgotPassword } from "../services/auth";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmall = SCREEN_WIDTH < 360;

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Missing Email",
        "Please enter your email address."
      );
      return;
    }

    try {
      setLoading(true);

      const result = await forgotPassword(email.trim());

      if (result.success) {
        Alert.alert(
          "Reset Link Sent",
          result.message || "A password reset link has been sent to your email.",
          [
            {
              text: "Back to Login",
              onPress: () => router.replace("/login"),
            },
          ]
        );
      } else {
        Alert.alert("Password Reset", result.message || "Could not request reset link.");
      }
    } catch (error) {
      console.error("FORGOT PASSWORD ERROR:", error);

      Alert.alert(
        "Connection Error",
        "Cannot connect to the Laravel server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.logoTop}>Katok</Text>
        <Text style={styles.logoBottom}>Kalinis</Text>

        <Text style={styles.tagline}>
          Kakatok, Lilinis, Gagaan ang Buhay.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password?</Text>

        <Text style={styles.subtitle}>
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </Text>

        <Text style={styles.inputLabel}>Email Address</Text>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color="#558B2F"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your registered email"
            placeholderTextColor="#8FA58A"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleForgotPassword}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backLinkButton}
          onPress={() => router.replace("/login")}
          disabled={loading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={16} color="#2E7D32" style={{ marginRight: 4 }} />
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7ED957",
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

  header: {
    height: "36%",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 15,
  },

  logoTop: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 38,
    letterSpacing: 0.5,
  },

  logoBottom: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 38,
    letterSpacing: 0.5,
  },

  tagline: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 11,
    marginTop: 6,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 26,
    paddingTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },

  title: {
    fontSize: isSmall ? 24 : 28,
    fontWeight: "900",
    color: "#2E7D32",
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 24,
    color: "#6B8063",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },

  inputLabel: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#2E4A28",
  },

  inputContainer: {
    height: 52,
    backgroundColor: "#F2F9F0",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D9EED3",
    marginBottom: 22,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: "#1F2920",
    fontSize: 15,
    fontWeight: "500",
  },

  button: {
    height: 52,
    backgroundColor: "#4CAF50",
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  backLinkButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 26,
  },

  backText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "700",
  },
});
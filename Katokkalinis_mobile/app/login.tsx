import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import * as Haptics from "expo-haptics";
import { forgotPassword, loginUser } from "../services/auth";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmall = SCREEN_WIDTH < 360;

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"resident" | "vendor">("resident");

  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const loadSelectedRole = useCallback(async () => {
    const role = await AsyncStorage.getItem("selectedRole");
    if (role === "vendor") {
      setSelectedRole("vendor");
    } else {
      setSelectedRole("resident");
    }
  }, []);

  useEffect(() => {
    loadSelectedRole();
  }, [loadSelectedRole]);

  const handleLogin = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      Alert.alert("Login", "Please enter your email address.");
      return;
    }

    if (!password) {
      Alert.alert("Login", "Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser(cleanEmail, password);

      if (!result.success) {
        Alert.alert("Login Failed", result.message || "Invalid credentials.");
        return;
      }

      if (!result.user) {
        Alert.alert("Login Error", "User information was not returned.");
        return;
      }

      if (result.user.role !== selectedRole) {
        Alert.alert(
          "Account Type",
          `Logged in with role: ${result.user.role}. Redirecting to your dashboard.`
        );
      }

      await AsyncStorage.setItem("userRole", result.user.role);
      await AsyncStorage.setItem("userId", String(result.user.id));
      await AsyncStorage.setItem("userName", result.user.name);
      await AsyncStorage.setItem("userEmail", result.user.email);

      if (result.token) {
        await AsyncStorage.setItem("authToken", result.token);
        await AsyncStorage.setItem("katokkalinis_token", result.token);
      }

      if (rememberMe) {
        await AsyncStorage.setItem("rememberMe", "true");
      } else {
        await AsyncStorage.removeItem("rememberMe");
      }

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Haptics fallback on unsupported platforms
      }

      if (result.user.role === "vendor" || selectedRole === "vendor") {
        router.replace("/vendor" as any);
      } else if (result.user.role === "driver") {
        router.replace("/driver/dashboard" as any);
      } else if (result.user.role === "inspector") {
        router.replace("/inspector/dashboard" as any);
      } else {
        router.replace("/dashboard" as any);
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      Alert.alert(
        "Connection Error",
        "Cannot connect to the Laravel server. Please check your network or server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Forgot Password", "Please enter your email address first.");
      return;
    }

    try {
      setForgotLoading(true);
      const result = await forgotPassword(email.trim());
      Alert.alert(result.success ? "Password Reset" : "Password Reset Failed", result.message);
    } catch (error) {
      console.error("FORGOT PASSWORD ERROR:", error);
      Alert.alert("Error", "Something went wrong while requesting a password reset.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Back Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/welcome" as any)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E331B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Titles */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            {selectedRole === "vendor"
              ? "Login to your vendor account"
              : "Login to your resident account"}
          </Text>
        </View>

        {/* Input Form Fields */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputBox}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color="#7A8D78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#9AA998"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputBox}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color="#7A8D78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9AA998"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#7A8D78"
              />
            </TouchableOpacity>
          </View>

          {/* Remember me & Forgot Password Row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxSelected]}>
                {rememberMe && (
                  <MaterialCommunityIcons name="check" size={13} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword} disabled={forgotLoading}>
              {forgotLoading ? (
                <ActivityIndicator size="small" color="#2E7D32" />
              ) : (
                <Text style={styles.forgotText}>Forgot Password?</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* REGISTER LINK (FOR RESIDENT) */}
          {selectedRole === "resident" && (
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don&apos;t have an account?</Text>
              <TouchableOpacity
                onPress={() => router.push("/signup" as any)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.signupLink}>Register</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
  },
  topNav: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: isSmall ? 26 : 30,
    fontWeight: "900",
    color: "#1E331B",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#688264",
    marginTop: 6,
    fontWeight: "500",
  },
  formContainer: {
    gap: 14,
  },
  inputBox: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1.2,
    borderColor: "#D6E4D4",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1E331B",
    fontWeight: "500",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: "#2E7D32",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },
  checkboxSelected: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  rememberText: {
    color: "#5F7558",
    fontSize: 13,
    fontWeight: "500",
  },
  forgotText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "600",
  },
  loginButton: {
    height: 52,
    backgroundColor: "#2E7D32",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  disabledButton: {
    opacity: 0.65,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  signupText: {
    color: "#688264",
    fontSize: 13,
    fontWeight: "500",
  },
  signupLink: {
    marginLeft: 6,
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "800",
  },
});
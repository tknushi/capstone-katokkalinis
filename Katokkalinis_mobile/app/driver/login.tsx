import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { loginUser } from "../../services/auth";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmall = SCREEN_WIDTH < 360;

export default function DriverLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      Alert.alert("Login", "Please enter your full name or email.");
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
        Alert.alert("Login Error", "The server did not return user information.");
        return;
      }

      if (result.user.role !== "driver") {
        Alert.alert("Access Notice", `Logged in with role: ${result.user.role}.`);
      }

      await AsyncStorage.setItem("userRole", "driver");
      await AsyncStorage.setItem("userId", String(result.user.id));
      await AsyncStorage.setItem("userName", result.user.name);
      await AsyncStorage.setItem("userEmail", result.user.email);

      if (result.token) {
        await AsyncStorage.setItem("katokkalinis_token", result.token);
        await AsyncStorage.setItem("authToken", result.token);
      }

      if (rememberMe) {
        await AsyncStorage.setItem("rememberMe", "true");
      } else {
        await AsyncStorage.removeItem("rememberMe");
      }

      router.replace("/driver/dashboard");
    } catch (error) {
      console.error("DRIVER LOGIN ERROR:", error);
      Alert.alert(
        "Connection Error",
        error instanceof Error ? error.message : "Cannot connect to the Laravel server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Back Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/role")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E331B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Icon Badge */}
        <View style={styles.header}>
          <View style={styles.roleIconCircle}>
            <MaterialCommunityIcons
              name="truck-outline"
              size={36}
              color="#2E7D32"
            />
          </View>
          <Text style={styles.title}>Driver Login</Text>
          <Text style={styles.subtitle}>Login to your driver account</Text>
        </View>

        {/* Input Form Fields */}
        <View style={styles.formContainer}>
          {/* Full Name / Email */}
          <View style={styles.inputBox}>
            <MaterialCommunityIcons
              name="account-outline"
              size={20}
              color="#7A8D78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#9AA998"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
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
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
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

          {/* Options Row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxSelected]}>
                {rememberMe && (
                  <MaterialCommunityIcons
                    name="check"
                    size={13}
                    color="#FFFFFF"
                  />
                )}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Password Help",
                  "Please contact your dispatch supervisor to reset officer password."
                )
              }
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
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
    marginTop: 15,
    marginBottom: 32,
  },
  roleIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E8F8EE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#C5EBD2",
  },
  title: {
    fontSize: isSmall ? 24 : 28,
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
});
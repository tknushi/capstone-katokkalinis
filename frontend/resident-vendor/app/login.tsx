import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  forgotPassword,
  loginUser,
} from "../services/auth";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "resident" | "vendor" | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const loadSelectedRole = useCallback(async () => {
    const role = await AsyncStorage.getItem("selectedRole");

    if (role === "resident" || role === "vendor") {
      setSelectedRole(role);
    } else {
      router.replace("/role");
    }
  }, [router]);

  useEffect(() => {
    loadSelectedRole();
  }, [loadSelectedRole]);

  const handleLogin = async () => {
    if (!selectedRole) {
      Alert.alert(
        "Account Type",
        "Please select Resident or Vendor first."
      );
      router.replace("/role");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Login", "Please enter your email.");
      return;
    }

    if (!password) {
      Alert.alert("Login", "Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser(
        email.trim(),
        password
      );

      if (!result.success) {
        Alert.alert(
          "Login Failed",
          result.message
        );
        return;
      }

      if (!result.user) {
        Alert.alert(
          "Login Error",
          "User information was not returned."
        );
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Check selected account type
      |--------------------------------------------------------------------------
      */

      if (result.user.role !== selectedRole) {
        Alert.alert(
          "Wrong Account Type",
          `You selected ${selectedRole}, but this account is registered as ${result.user.role}. Please use the correct account type.`
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Save login information
      |--------------------------------------------------------------------------
      */

      await AsyncStorage.setItem(
        "userRole",
        result.user.role
      );

      await AsyncStorage.setItem(
        "userId",
        String(result.user.id)
      );

      await AsyncStorage.setItem(
        "userName",
        result.user.name
      );

      await AsyncStorage.setItem(
        "userEmail",
        result.user.email
      );

      if (result.token) {
        await AsyncStorage.setItem(
          "authToken",
          result.token
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Navigate according to role
      |--------------------------------------------------------------------------
      */

      if (result.user.role === "resident") {
        router.replace("/dashboard" as any);
      } else if (result.user.role === "vendor") {
        router.replace("/vendor" as any);
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      Alert.alert(
        "Connection Error",
        "Cannot connect to the Laravel server. Make sure php artisan serve is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Forgot Password",
        "Please enter your email address first."
      );
      return;
    }

    try {
      setForgotLoading(true);

      const result = await forgotPassword(
        email.trim()
      );

      Alert.alert(
        result.success
          ? "Password Reset"
          : "Password Reset Failed",
        result.message
      );
    } catch (error) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Something went wrong while requesting a password reset."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      "Google Login",
      "Google login will be connected after Google OAuth is configured in Laravel."
    );
  };

  const handleFacebookLogin = () => {
    Alert.alert(
      "Facebook Login",
      "Facebook login will be connected after Facebook OAuth is configured in Laravel."
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          KatokKalinis
        </Text>

        <Text style={styles.tagline}>
          Kakatok, Lilinis, Gagaan ang Buhay.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Welcome Back
        </Text>

        <Text style={styles.subtitle}>
          Login as{" "}
          <Text style={styles.roleText}>
            {selectedRole === "resident"
              ? "Resident"
              : selectedRole === "vendor"
              ? "Vendor"
              : ""}
          </Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.forgotButton}
          onPress={handleForgotPassword}
          disabled={forgotLoading}
        >
          {forgotLoading ? (
            <ActivityIndicator
              size="small"
              color="#4CAF50"
            />
          ) : (
            <Text style={styles.forgotText}>
              Forgot your password?
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.loginButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              Login
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.orContainer}>
          <View style={styles.line} />

          <Text style={styles.orText}>
            OR
          </Text>

          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleGoogleLogin}
        >
          <Text style={styles.googleIcon}>
            G
          </Text>

          <Text style={styles.socialText}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.socialButton,
            styles.facebookButton,
          ]}
          onPress={handleFacebookLogin}
        >
          <Text style={styles.facebookIcon}>
            f
          </Text>

          <Text style={styles.socialText}>
            Continue with Facebook
          </Text>
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>
            Don&apos;t have an account?
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push("/signup" as any)
            }
          >
            <Text style={styles.signupLink}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 70,
    paddingHorizontal: 30,
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },

  tagline: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 5,
  },

  card: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    minHeight: "76%",

    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 52,
    borderTopRightRadius: 52,

    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 25,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#4CAF50",
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 24,
    color: "#888",
    fontSize: 13,
  },

  roleText: {
    color: "#4CAF50",
    fontWeight: "700",
  },

  input: {
    height: 52,
    backgroundColor: "#EDF6E8",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    color: "#333",
    fontSize: 15,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -2,
    marginBottom: 18,
    minHeight: 25,
    justifyContent: "center",
  },

  forgotText: {
    color: "#4CAF50",
    fontSize: 13,
    fontWeight: "600",
  },

  loginButton: {
    height: 52,
    backgroundColor: "#4CAF50",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDDDDD",
  },

  orText: {
    marginHorizontal: 12,
    color: "#999",
    fontSize: 12,
    fontWeight: "600",
  },

  socialButton: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },

  facebookButton: {
    marginBottom: 0,
  },

  googleIcon: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4285F4",
    marginRight: 10,
  },

  facebookIcon: {
    fontSize: 23,
    fontWeight: "800",
    color: "#1877F2",
    marginRight: 10,
  },

  socialText: {
    color: "#444",
    fontSize: 14,
    fontWeight: "600",
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },

  signupText: {
    color: "#777",
    fontSize: 12,
  },

  signupLink: {
    marginLeft: 5,
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "700",
  },
});
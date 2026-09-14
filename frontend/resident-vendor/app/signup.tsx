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

import { registerUser } from "../services/auth";

export default function Signup() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState<
    "resident" | "vendor" | null
  >(null);

  const [loading, setLoading] = useState(false);

  const loadRole = useCallback(async () => {
    const savedRole =
      await AsyncStorage.getItem("selectedRole");

    if (
      savedRole === "resident" ||
      savedRole === "vendor"
    ) {
      setRole(savedRole);
    } else {
      router.replace("/role");
    }
  }, [router]);

  useEffect(() => {
    loadRole();
  }, [loadRole]);

  const handleSignup = async () => {
    if (!role) {
      Alert.alert(
        "Account Type",
        "Please select an account type first."
      );

      router.replace("/role");
      return;
    }

    if (!fullName.trim()) {
      Alert.alert(
        "Missing Name",
        "Please enter your full name."
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert(
        "Missing Email",
        "Please enter your email."
      );
      return;
    }

    if (!password) {
      Alert.alert(
        "Missing Password",
        "Please enter a password."
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Error",
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const result = await registerUser(
        fullName.trim(),
        email.trim(),
        password,
        confirmPassword,
        role
      );

      if (!result.success) {
        Alert.alert(
          "Registration Failed",
          result.message
        );
        return;
      }

      Alert.alert(
        "Registration Successful",
        `Your ${role} account has been created.`,
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/login");
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error
      );

      Alert.alert(
        "Error",
        "Something went wrong while creating your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Create Account
        </Text>

        <Text style={styles.headerSubtitle}>
          Join KatokKalinis and help keep your
          community clean.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Sign Up
        </Text>

        <Text style={styles.subtitle}>
          Create your{" "}
          <Text style={styles.roleText}>
            {role === "resident"
              ? "Resident"
              : role === "vendor"
              ? "Vendor"
              : ""}
          </Text>{" "}
          account
        </Text>

        <Text style={styles.label}>
          Full Name
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#999"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>
          Email
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>
          Password
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>
          Confirm Password
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Confirm your password"
          placeholderTextColor="#999"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[
            styles.signupButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signupButtonText}>
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>
            Already have an account?
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.replace("/login")
            }
          >
            <Text style={styles.loginLink}>
              Login
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
    paddingTop: 65,
    paddingHorizontal: 25,
    paddingBottom: 30,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  headerSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: "#FFFFFF",
    lineHeight: 18,
  },

  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingHorizontal: 25,
    paddingTop: 30,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#4CAF50",
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 20,
    fontSize: 12,
    color: "#777",
  },

  roleText: {
    color: "#4CAF50",
    fontWeight: "700",
  },

  label: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },

  input: {
    height: 48,
    backgroundColor: "#EDF6E8",
    borderRadius: 12,
    paddingHorizontal: 15,
    color: "#333",
  },

  signupButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.6,
  },

  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },

  loginText: {
    fontSize: 12,
    color: "#777",
  },

  loginLink: {
    marginLeft: 5,
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "700",
  },
});
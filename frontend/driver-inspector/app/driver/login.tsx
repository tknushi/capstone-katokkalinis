import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { loginUser } from "../../services/auth";

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
      Alert.alert(
        "Login",
        "Please enter your email or User ID."
      );
      return;
    }

    if (!password) {
      Alert.alert(
        "Login",
        "Please enter your password."
      );
      return;
    }

    try {
      setLoading(true);

      console.log("DRIVER LOGIN:");
      console.log("Email:", cleanEmail);
      console.log(
        "Password provided:",
        password.length > 0
      );

      const result = await loginUser(
        cleanEmail,
        password
      );

      console.log(
        "DRIVER LOGIN RESULT:",
        result
      );

      /*
      |--------------------------------------------------------------------------
      | LOGIN FAILED
      |--------------------------------------------------------------------------
      */

      if (!result.success) {
        Alert.alert(
          "Login Failed",
          result.message ||
            "Invalid email or password."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | NO USER
      |--------------------------------------------------------------------------
      */

      if (!result.user) {
        Alert.alert(
          "Login Error",
          "The server did not return user information."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | DRIVER ROLE CHECK
      |--------------------------------------------------------------------------
      */

      if (result.user.role !== "driver") {
        Alert.alert(
          "Access Denied",
          "This account is not registered as a driver."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | SAVE LOGIN INFORMATION
      |--------------------------------------------------------------------------
      */

      await AsyncStorage.setItem(
        "userRole",
        "driver"
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

      if (rememberMe) {
        await AsyncStorage.setItem(
          "rememberMe",
          "true"
        );
      } else {
        await AsyncStorage.removeItem(
          "rememberMe"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | GO TO DRIVER DASHBOARD
      |--------------------------------------------------------------------------
      */

      router.replace("/driver/dashboard");

    } catch (error) {
      console.error(
        "DRIVER LOGIN ERROR:",
        error
      );

      Alert.alert(
        "Connection Error",
        error instanceof Error
          ? error.message
          : "Cannot connect to the Laravel server."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.logoTop}>
          Katok
        </Text>

        <Text style={styles.logoBottom}>
          Kalinis
        </Text>

        <Text style={styles.tagline}>
          Kakatok, Lilinis, Gagaan ang Buhay.
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.title}>
          Driver Login
        </Text>

        <Text style={styles.subtitle}>
          Welcome, please login to your account.
        </Text>

        <View style={styles.inputContainer}>

          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color="#79B96A"
          />

          <TextInput
            style={styles.input}
            placeholder="Email / User ID"
            placeholderTextColor="#8FA58A"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

        </View>

        <View style={styles.inputContainer}>

          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color="#79B96A"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8FA58A"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            onPress={() =>
              setShowPassword(
                !showPassword
              )
            }
          >
            <MaterialCommunityIcons
              name={
                showPassword
                  ? "eye-outline"
                  : "eye-off-outline"
              }
              size={20}
              color="#79B96A"
            />
          </TouchableOpacity>

        </View>

        <View style={styles.optionsRow}>

          <TouchableOpacity
            style={styles.rememberContainer}
            onPress={() =>
              setRememberMe(
                !rememberMe
              )
            }
          >

            <View
              style={[
                styles.checkbox,
                rememberMe &&
                  styles.checkboxSelected,
              ]}
            >
              {rememberMe && (
                <MaterialCommunityIcons
                  name="check"
                  size={13}
                  color="#FFFFFF"
                />
              )}
            </View>

            <Text style={styles.rememberText}>
              Remember me
            </Text>

          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.forgotText}>
              Forgot your password?
            </Text>
          </TouchableOpacity>

        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >

          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.loginText}>
              Login
            </Text>
          )}

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

  header: {
    height: "38%",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },

  logoTop: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 30,
  },

  logoBottom: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 30,
  },

  tagline: {
    color: "#FFFFFF",
    fontSize: 8,
    marginTop: 8,
  },

  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    paddingHorizontal: 32,
    paddingTop: 25,
  },

  title: {
    color: "#4CAF50",
    fontSize: 25,
    fontWeight: "800",
  },

  subtitle: {
    color: "#8FA58A",
    fontSize: 9,
    marginTop: 3,
    marginBottom: 25,
  },

  inputContainer: {
    height: 43,
    backgroundColor: "#E4F5DC",
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 13,
  },

  input: {
    flex: 1,
    marginLeft: 8,
    color: "#333333",
    fontSize: 12,
  },

  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 1,
    marginBottom: 22,
  },

  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 13,
    height: 13,
    borderWidth: 1,
    borderColor: "#A9CBA0",
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },

  checkboxSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },

  rememberText: {
    color: "#8A9A86",
    fontSize: 8,
  },

  forgotText: {
    color: "#4CAF50",
    fontSize: 8,
  },

  loginButton: {
    height: 40,
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
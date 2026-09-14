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

import { forgotPassword } from "../services/auth";

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handleForgotPassword =
    async () => {

      if (!email.trim()) {
        Alert.alert(
          "Missing Email",
          "Please enter your email address."
        );

        return;
      }

      try {
        setLoading(true);

        const result =
          await forgotPassword(
            email.trim()
          );

        if (result.success) {

          Alert.alert(
            "Reset Link Sent",
            result.message,
            [
              {
                text: "Back to Login",
                onPress: () =>
                  router.replace(
                    "/login"
                  ),
              },
            ]
          );

        } else {

          Alert.alert(
            "Password Reset",
            result.message
          );
        }

      } catch (error) {

        console.error(
          "FORGOT PASSWORD ERROR:",
          error
        );

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
          Forgot Password?
        </Text>

        <Text style={styles.subtitle}>
          Enter your email address and we&apos;ll
          send you instructions to reset your
          password.
        </Text>


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
          editable={!loading}
        />


        <TouchableOpacity
          style={[
            styles.button,
            loading &&
              styles.buttonDisabled,
          ]}
          onPress={
            handleForgotPassword
          }
          disabled={loading}
        >

          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={styles.buttonText}
            >
              Send Reset Link
            </Text>
          )}

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.replace("/login")
          }
          disabled={loading}
        >

          <Text style={styles.backText}>
            ← Back to Login
          </Text>

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

    minHeight: "65%",

    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 52,
    borderTopRightRadius: 52,

    paddingHorizontal: 34,
    paddingTop: 35,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#4CAF50",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 30,

    color: "#888",

    fontSize: 13,

    lineHeight: 20,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",

    color: "#4CAF50",

    marginBottom: 6,
  },

  input: {
    height: 52,

    backgroundColor: "#EDF6E8",

    borderRadius: 14,

    paddingHorizontal: 16,

    marginBottom: 20,

    color: "#333",

    fontSize: 15,
  },

  button: {
    height: 52,

    backgroundColor: "#4CAF50",

    borderRadius: 14,

    justifyContent: "center",
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "700",
  },

  backButton: {
    alignItems: "center",

    marginTop: 25,
  },

  backText: {
    color: "#4CAF50",

    fontSize: 14,

    fontWeight: "600",
  },

});
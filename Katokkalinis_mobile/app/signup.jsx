import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

import BarangayPickerModal from "../components/BarangayPickerModal";
import { registerUser } from "../services/auth";
import { sanitizePhoneNumber, validatePhilippinePhone } from "../utils/phoneValidation";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmall = SCREEN_WIDTH < 360;

export default function Signup() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactTouched, setContactTouched] = useState(false);
  const [barangay, setBarangay] = useState("");
  const [barangayId, setBarangayId] = useState(null);
  const [barangayTouched, setBarangayTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);

  // Phone Validation
  const phoneValidation = useMemo(() => {
    if (!contactNumber) {
      return { isValid: false, error: "Contact number is required." };
    }
    return validatePhilippinePhone(contactNumber);
  }, [contactNumber]);

  // Overall form validity
  const isFormValid = useMemo(() => {
    return (
      fullName.trim().length > 0 &&
      phoneValidation.isValid &&
      barangay.trim().length > 0 &&
      email.trim().includes("@") &&
      password.length >= 8 &&
      password === confirmPassword &&
      agreeTerms
    );
  }, [fullName, phoneValidation, barangay, email, password, confirmPassword, agreeTerms]);

  const handleContactChange = (text) => {
    const sanitized = sanitizePhoneNumber(text);
    setContactNumber(sanitized);
    if (!contactTouched) setContactTouched(true);
  };

  const handleSignup = async () => {
    if (!fullName.trim()) {
      Alert.alert("Missing Name", "Please enter your full name.");
      return;
    }

    if (!phoneValidation.isValid) {
      Alert.alert("Invalid Phone Number", phoneValidation.error || "Please enter a valid 11-digit mobile number starting with 09.");
      return;
    }

    if (!barangay.trim()) {
      Alert.alert("Missing Barangay", "Please select your barangay location.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }

    if (!password) {
      Alert.alert("Missing Password", "Please enter a password.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Invalid Password", "Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      Alert.alert("Terms & Conditions", "Please agree to the Terms and Conditions to proceed.");
      return;
    }

    try {
      setLoading(true);

      const result = await registerUser(
        fullName.trim(),
        email.trim(),
        password,
        confirmPassword,
        "resident",
        contactNumber.trim(),
        barangay.trim(),
        barangayId
      );

      if (!result.success) {
        Alert.alert("Registration Failed", result.message || "Could not complete registration.");
        return;
      }

      // Persist contact number and barangay locally so all other screens can reuse it
      await AsyncStorage.setItem("userContact", contactNumber.trim());
      await AsyncStorage.setItem("userBarangay", barangay.trim());
      if (barangayId) {
        await AsyncStorage.setItem("userBarangayId", String(barangayId));
      }
      await AsyncStorage.setItem("userName", fullName.trim());
      await AsyncStorage.setItem("userReportsCount", "0");

      Alert.alert(
        "Registration Successful",
        "Your resident account has been created successfully. Please login to continue.",
        [
          {
            text: "Login",
            onPress: () => {
              router.replace("/login");
            },
          },
        ]
      );
    } catch (error) {
      console.error("REGISTRATION ERROR:", error);
      Alert.alert("Error", "Something went wrong while creating your account.");
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
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E331B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Titles */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Register as a resident</Text>
        </View>

        {/* Input Form Fields */}
        <View style={styles.formContainer}>
          {/* 1. Full Name */}
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
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          {/* 2. Contact Number (Strict Philippine Format) */}
          <View>
            <View
              style={[
                styles.inputBox,
                contactTouched && !phoneValidation.isValid && styles.inputBoxError,
              ]}
            >
              <MaterialCommunityIcons
                name="phone-outline"
                size={20}
                color={contactTouched && !phoneValidation.isValid ? "#D32F2F" : "#7A8D78"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Contact Number (e.g. 09123456789)"
                placeholderTextColor="#9AA998"
                value={contactNumber}
                onChangeText={handleContactChange}
                onBlur={() => setContactTouched(true)}
                keyboardType="numeric"
                maxLength={11}
              />
              {contactNumber.length > 0 && (
                <Text style={styles.counterText}>
                  {contactNumber.length}/11
                </Text>
              )}
            </View>
            {contactTouched && !phoneValidation.isValid && (
              <Text style={styles.errorText}>{phoneValidation.error}</Text>
            )}
          </View>

          {/* 3. Barangay (Searchable Dropdown 1–40) */}
          <View>
            <BarangayPickerModal
              selectedBarangay={barangay}
              onSelect={(b) => {
                setBarangay(b.name);
                setBarangayId(b.id);
                setBarangayTouched(true);
              }}
              placeholder="Select Barangay"
              error={barangayTouched && !barangay ? "Barangay selection is required." : null}
            />
          </View>

          {/* 4. Email Address */}
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
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* 5. Password */}
          <View style={styles.inputBox}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color="#7A8D78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password (min. 8 characters)"
              placeholderTextColor="#9AA998"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
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

          {/* 6. Confirm Password */}
          <View style={styles.inputBox}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color="#7A8D78"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#9AA998"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#7A8D78"
              />
            </TouchableOpacity>
          </View>

          {/* 7. Terms and Conditions Checkbox */}
          <TouchableOpacity
            style={styles.termsRow}
            activeOpacity={0.8}
            onPress={() => setAgreeTerms(!agreeTerms)}
          >
            <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
              {agreeTerms && (
                <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Terms and Conditions</Text>
            </Text>
          </TouchableOpacity>

          {/* REGISTER BUTTON */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              (!isFormValid || loading) && styles.disabledButton,
            ]}
            onPress={handleSignup}
            disabled={!isFormValid || loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Register</Text>
            )}
          </TouchableOpacity>

          {/* LOGIN LINK */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => router.replace("/login")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 24,
  },
  title: {
    fontSize: isSmall ? 24 : 27,
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
    gap: 13,
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
  inputBoxError: {
    borderColor: "#D32F2F",
    backgroundColor: "#FFF8F8",
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
  counterText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#839E81",
    marginLeft: 6,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 6,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#A3C2A0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },
  checkboxActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  termsText: {
    fontSize: 13,
    color: "#5C7558",
    fontWeight: "500",
  },
  termsLink: {
    color: "#2E7D32",
    fontWeight: "700",
  },
  registerButton: {
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
    backgroundColor: "#A5D6A7",
    elevation: 0,
    shadowOpacity: 0,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  loginText: {
    fontSize: 13,
    color: "#688264",
    fontWeight: "500",
  },
  loginLink: {
    marginLeft: 6,
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "800",
  },
});
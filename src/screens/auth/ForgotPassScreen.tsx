import { Ionicons } from "@expo/vector-icons";
import { useNavigation, router } from "expo-router";
import React, { useCallback, useState, useRef } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/api/clients";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { StatusBar } from "expo-status-bar";

const showToastOrAlert = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.showWithGravityAndOffset(message, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
  } else {
    Alert.alert("Error", message);
  }
};

const ForgotPassScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Steps: 'EMAIL' (Step 1) or 'RESET' (Step 2)
  const [step, setStep] = useState<"EMAIL" | "RESET">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Step 1: Forgot Password Request Mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (emailVal: string) => {
      const response = await api.post("/api/v1/auth/forgot-password/", { email: emailVal });
      return response.data;
    },
    onSuccess: () => {
      ToastAndroid.show("OTP sent to your email successfully", ToastAndroid.SHORT);
      setStep("RESET");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.email?.[0] || error?.response?.data?.detail || "No account found with this email.";
      showToastOrAlert(message);
    },
  });

  // Step 2: Verify Reset OTP and Set Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post("/api/v1/otp/verify-reset-otp/", payload);
      return response.data;
    },
    onSuccess: async (data) => {
      ToastAndroid.show("Password changed successfully", ToastAndroid.SHORT);

      const accessToken = data?.tokens?.access || data?.access;
      const refreshToken = data?.tokens?.refresh || data?.refresh;

      if (accessToken) {
        await SecureStore.setItemAsync("accessToken", accessToken);
      }
      if (refreshToken) {
        await SecureStore.setItemAsync("refreshToken", refreshToken);
      }

      // Register push token if available
      try {
        const pushToken = await SecureStore.getItemAsync("pushToken");
        if (pushToken && accessToken) {
          await api.post("/api/v1/notifications/devices/", { expo_push_token: pushToken });
        }
      } catch (err) {
        console.error("Failed to register push token during reset callback:", err);
      }

      await AsyncStorage.setItem("@bookmart:is_logged_in", "true");
      router.replace("/(tabs)/home");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || error?.response?.data?.otp?.[0] || "Failed to reset password. Please check code.";
      showToastOrAlert(message);
    },
  });

  const handleOtpChange = useCallback((value: string, index: number) => {
    const newValue = value.slice(-1);
    setOtp((prev) => {
      const newOtp = [...prev];
      newOtp[index] = newValue;
      return newOtp;
    });

    // Auto-advance
    if (newValue !== "" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyPress = useCallback((e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === "Backspace" && index > 0) {
      setOtp((prev) => {
        if (prev[index] === "") {
          inputRefs.current[index - 1]?.focus();
        }
        return prev;
      });
    }
  }, []);

  const handleRequestOtp = useCallback(() => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      showToastOrAlert("Please enter a valid email address");
      return;
    }
    forgotPasswordMutation.mutate(email);
  }, [email]);

  const handleResetPassword = useCallback(() => {
    const otpValue = otp.join("");
    if (otpValue.length < 4) {
      showToastOrAlert("Please enter the complete 4-digit code");
      return;
    }
    if (!password || password.length < 6) {
      showToastOrAlert("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      showToastOrAlert("Passwords do not match");
      return;
    }

    resetPasswordMutation.mutate({
      email,
      otp: otpValue,
      new_password: password,
    });
  }, [otp, email, password, confirmPassword]);

  const isStep1Pending = forgotPasswordMutation.isPending;
  const isStep2Pending = resetPasswordMutation.isPending;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>

          {step === "EMAIL" ? (
            <>
              {/* Step 1 Header */}
              <View style={styles.headerContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="lock-open-outline" size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.headingText}>Forgot Password</Text>
                <Text style={styles.subHeadingText}>Enter your email to receive a password reset OTP code</Text>
              </View>

              {/* Step 1 Form Card */}
              <View style={styles.card}>
                <Input
                  label="Email Address"
                  placeholder="name@domain.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoComplete="email"
                  autoCapitalize="none"
                />

                <View style={styles.buttonContainer}>
                  <Button
                    title={isStep1Pending ? "Sending…" : "Send Reset OTP"}
                    onPress={handleRequestOtp}
                    loading={isStep1Pending}
                    style={styles.actionBtn}
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Step 2 Header */}
              <View style={styles.headerContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="shield-checkmark-outline" size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.headingText}>Reset Password</Text>
                <Text style={styles.subHeadingText}>Enter the code sent to {email} and pick a new password</Text>
              </View>

              {/* Step 2 Form Card */}
              <View style={styles.card}>
                {/* OTP code row */}
                <Text style={styles.otpLabel}>Verification Code</Text>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        inputRefs.current[index] = ref;
                      }}
                      style={[styles.otpInput, focusedIndex === index && styles.otpInputFocused]}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(null)}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                <Input
                  label="New Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  isPassword={true}
                  autoComplete="password"
                  autoCapitalize="none"
                />

                <Input
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  isPassword={true}
                  autoComplete="password"
                  autoCapitalize="none"
                />

                <View style={styles.buttonContainer}>
                  <Button
                    title={isStep2Pending ? "Resetting…" : "Reset Password"}
                    onPress={handleResetPassword}
                    loading={isStep2Pending}
                    style={styles.actionBtn}
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: SPACING.lg,
    justifyContent: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: rem(1.5),
    padding: SPACING.xs,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: rem(2),
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  headingText: {
    fontSize: rem(1.6),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  subHeadingText: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: SPACING.sm,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    width: "100%",
  },
  otpLabel: {
    fontSize: rem(0.875),
    fontFamily: FONTS.montserrat.semibold,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: SPACING.md,
    width: "100%",
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.grayHeavvy,
    backgroundColor: COLORS.white,
    textAlign: "center",
    fontSize: rem(1.2),
    fontFamily: FONTS.montserrat.semibold,
    color: COLORS.black,
  },
  otpInputFocused: {
    borderColor: COLORS.primary,
  },
  buttonContainer: {
    width: "100%",
    marginTop: SPACING.md,
  },
  actionBtn: {
    borderRadius: 16,
    height: 52,
  },
});

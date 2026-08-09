import { verifyRegisterOtp } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute, router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/api/clients";
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
import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { StatusBar } from "expo-status-bar";

const VerifyEmail = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email } = route.params || { email: "your email" };
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // 5 minutes = 300 seconds
  const [timer, setTimer] = useState(5 * 60);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

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

  const verifyMutation = useMutation({
    mutationFn: verifyRegisterOtp,
    onSuccess: async (data) => {
      ToastAndroid.show("Email verified successfully!", ToastAndroid.SHORT);

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
        console.error("Failed to register push token during verification:", err);
      }

      await AsyncStorage.setItem("@bookmart:is_logged_in", "true");
      router.replace("/(tabs)/home");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || "Verification failed. Please check your OTP.";
      if (Platform.OS === "android") {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert("Error", message);
      }
    },
  });

  const handleVerify = useCallback(() => {
    const otpValue = otp.join("");
    if (otpValue.length < 4) {
      if (Platform.OS === "android") {
        ToastAndroid.show("Please enter the complete 4-digit OTP", ToastAndroid.SHORT);
      } else {
        Alert.alert("Validation", "Please enter the complete 4-digit OTP");
      }
      return;
    }

    verifyMutation.mutate({
      email,
      otp: otpValue,
    });
  }, [otp, email]);

  const isPending = verifyMutation.isPending;

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

          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="mail-open-outline" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.headingText}>Verify your Email</Text>
            <Text style={styles.subHeadingText}>We sent a 4-digit verification code to</Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* OTP Inputs */}
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

            {/* Resend Timer */}
            <View style={styles.resendContainer}>
              <Ionicons name="time-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
              <Text style={styles.resendText}>Resend code in {formattedTime}</Text>
            </View>

            {/* Verify Button */}
            <View style={styles.buttonContainer}>
              <Button
                title={isPending ? "Verifying…" : "Verify Code"}
                onPress={handleVerify}
                loading={isPending}
                style={styles.verifyBtn}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyEmail;

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
  },
  emailText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    alignItems: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.md,
    marginBottom: rem(1.5),
    width: "100%",
  },
  otpInput: {
    width: rem(3.5),
    height: rem(4),
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.grayHeavvy,
    backgroundColor: COLORS.white,
    textAlign: "center",
    fontSize: rem(1.3),
    fontFamily: FONTS.montserrat.semibold,
    color: COLORS.black,
  },
  otpInputFocused: {
    borderColor: COLORS.primary,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rem(1.5),
  },
  resendText: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.textMuted,
  },
  buttonContainer: {
    width: "100%",
  },
  verifyBtn: {
    borderRadius: 16,
    height: 52,
  },
});

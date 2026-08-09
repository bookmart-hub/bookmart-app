import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation, router } from "expo-router";
import React, { memo, useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useMutation } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { api } from "@/api/clients";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { registerUser } from "@/types/auth";

const GoogleIcon = memo(() => (
  <Svg viewBox="0 0 24 24" width={20} height={20}>
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
));

const FacebookIcon = memo(() => (
  <View style={styles.facebookIconContainer}>
    <FontAwesome name="facebook" size={14} color={COLORS.white} />
  </View>
));

const showToastOrAlert = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.showWithGravityAndOffset(message, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
  } else {
    Alert.alert("Validation Error", message);
  }
};

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      ToastAndroid.show("Account created successfully!", ToastAndroid.SHORT);
      navigation.replace("VerifyEmail", { email });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.email?.[0] ||
        error?.response?.data?.full_name?.[0] ||
        error?.response?.data?.password?.[0] ||
        "Registration failed";

      if (Platform.OS === "android") {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert("Error", message);
      }
    },
  });

  const validateForm = useCallback(() => {
    if (!fullname.trim()) {
      showToastOrAlert("Full name is required");
      return false;
    }
    if (fullname.trim().length < 3) {
      showToastOrAlert("Username must be at least 3 characters");
      return false;
    }
    if (!email.trim()) {
      showToastOrAlert("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showToastOrAlert("Please enter a valid email address");
      return false;
    }
    if (!password) {
      showToastOrAlert("Password is required");
      return false;
    }
    if (password.length < 6) {
      showToastOrAlert("Password must be at least 6 characters");
      return false;
    }
    if (!acceptedTerms) {
      showToastOrAlert("You must accept the Terms & Privacy Policy to create an account");
      return false;
    }
    return true;
  }, [fullname, email, password, acceptedTerms]);

  const socialLoginMutation = useMutation({
    mutationFn: async (payload: { provider: string; provider_id: string; email: string; full_name?: string }) => {
      const response = await api.post("/api/v1/auth/social-login/", payload);
      return response.data;
    },
    onSuccess: async (data) => {
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
        console.error("Failed to register push token during social login:", err);
      }

      await AsyncStorage.setItem("@bookmart:is_logged_in", "true");
      router.replace("/(tabs)/home");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || "Social authentication failed.";
      showToastOrAlert(message);
    },
  });

  const handleGoogleSignIn = useCallback(() => {
    const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID;
    const isMock = !androidClientId || androidClientId.includes("your-google");

    if (isMock) {
      Alert.alert(
        "Google Sign-In (Dev Mode)",
        "Would you like to simulate Google sign-in using test credentials? (Provide real IDs in .env to run real OAuth)",
        [
          {
            text: "Proceed as Google Tester",
            onPress: () => {
              socialLoginMutation.mutate({
                provider: "GOOGLE",
                provider_id: "google-mock-id-12345",
                email: "googletester@example.com",
                full_name: "Google Tester",
              });
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } else {
      Alert.alert("Google Sign-In", "Initializing Google OAuth flow...");
    }
  }, [socialLoginMutation]);

  const handleFacebookSignIn = useCallback(() => {
    const facebookAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;
    const isMock = !facebookAppId || facebookAppId.includes("your-facebook");

    if (isMock) {
      Alert.alert(
        "Facebook Sign-In (Dev Mode)",
        "Would you like to simulate Facebook sign-in using test credentials? (Provide real App ID in .env to run real OAuth)",
        [
          {
            text: "Proceed as Facebook Tester",
            onPress: () => {
              socialLoginMutation.mutate({
                provider: "FACEBOOK",
                provider_id: "facebook-mock-id-12345",
                email: "facebooktester@example.com",
                full_name: "Facebook Tester",
              });
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } else {
      Alert.alert("Facebook Sign-In", "Initializing Facebook OAuth flow...");
    }
  }, [socialLoginMutation]);

  const handleSignUp = useCallback(() => {
    if (!validateForm()) return;
    registerMutation.mutate({
      email,
      password,
      full_name: fullname,
    });
  }, [validateForm, email, password, fullname]);

  const toggleTerms = useCallback(() => setAcceptedTerms((prev) => !prev), []);
  const isPending = registerMutation.isPending || socialLoginMutation.isPending;

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
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="person-add" size={26} color={COLORS.primary} />
            </View>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subText}>Join Bookmart to list and buy books nearby</Text>
          </View>

          {/* Form Fields Card */}
          <View style={styles.card}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={fullname}
              onChangeText={setFullname}
              autoComplete="name"
            />

            <Input
              label="Email Address"
              placeholder="name@domain.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              autoComplete="password"
              autoCapitalize="none"
            />

            <Checkbox
              checked={acceptedTerms}
              onPress={toggleTerms}
              style={styles.checkboxContainer}
              labelComponent={
                <Text style={styles.termsText}>
                  I agree to the{" "}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              }
            />

            <View style={styles.buttonWrapper}>
              <Button
                title={registerMutation.isPending ? "Creating account…" : "Create Account"}
                onPress={handleSignUp}
                loading={registerMutation.isPending}
                style={styles.signUpButton}
              />
            </View>
          </View>

          {/* OR Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or register with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign Ins */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.8}
              onPress={handleGoogleSignIn}
              disabled={isPending}
            >
              {socialLoginMutation.isPending ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <GoogleIcon />
                  <Text style={styles.socialButtonText}>Google</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.8}
              onPress={handleFacebookSignIn}
              disabled={isPending}
            >
              {socialLoginMutation.isPending ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <FacebookIcon />
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Sign In Link */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.signInLink} onPress={() => router.push("/(auth)/login")}>
                Sign In
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

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
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    paddingBottom: SPACING.xl,
    justifyContent: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: rem(1.5),
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
  welcomeText: {
    fontSize: rem(1.6),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: 6,
  },
  subText: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  checkboxContainer: {
    marginTop: 8,
    marginBottom: SPACING.md,
  },
  termsText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  termsLink: {
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  buttonWrapper: {
    marginTop: SPACING.xs,
  },
  signUpButton: {
    borderRadius: 16,
    height: 52,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: rem(1.5),
    paddingHorizontal: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  dividerText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.semibold,
    color: COLORS.textMuted,
    marginHorizontal: 12,
  },
  socialContainer: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: rem(1.5),
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  socialButtonText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
  },
  facebookIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1877F2",
    justifyContent: "center",
    alignItems: "center",
  },
  footerContainer: {
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  footerText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  signInLink: {
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
});

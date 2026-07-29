import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { AuthStackParamList } from "@/navigation/AuthNavigator";
import { rem } from "@/utils/responsive";

import { registerUser } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, "Register">;

// Google multi-colored G SVG icon component
const GoogleIcon = () => (
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
);

// Facebook white f in blue circle icon component
const FacebookIcon = () => (
  <View style={styles.facebookIconContainer}>
    <FontAwesome name="facebook" size={14} color={COLORS.white} />
  </View>
);

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loadingText, setLoadingText] = useState("Signing up");

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

  useEffect(() => {
    if (!registerMutation.isPending) return;

    let count = 0;

    const interval = setInterval(() => {
      count = (count + 1) % 4;
      setLoadingText(`Signing up${".".repeat(count)}`);
    }, 400);

    return () => clearInterval(interval);
  }, [registerMutation.isPending]);

  // Helper function to trigger platform-appropriate notifications
  const showToastOrAlert = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.showWithGravityAndOffset(message, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
    } else {
      Alert.alert("Validation Error", message);
    }
  };

  const validateForm = () => {
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
  };

  const handleSignUp = () => {
    if (!validateForm()) return;

    registerMutation.mutate({
      full_name: fullname,
      email,
      password,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.headingText}>Create Your Account</Text>
            <Text style={styles.subHeadingText}>Which part of country that you call home?</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Input placeholder="Full name" value={fullname} onChangeText={setFullname} autoCapitalize="words" />

            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
            />

            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              autoComplete="password"
            />

            {/* Terms and Privacy Checkbox */}
            <Checkbox
              checked={acceptedTerms}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              style={styles.checkbox}
              labelComponent={
                <Text style={styles.termsText}>
                  I accepted <Text style={styles.termsTextBold}>Terms & Privacy Policy</Text>
                </Text>
              }
            />
          </View>

          {/* OR Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign Ins */}
          <View style={styles.socialContainer}>
            <Button
              title="Continue with facebook"
              variant="outline"
              icon={<FacebookIcon />}
              style={styles.socialButton}
            />

            <Button title="Continue with Google" variant="outline" icon={<GoogleIcon />} style={styles.socialButton} />
          </View>

          {/* Action Button */}
          <View style={styles.buttonContainer}>
            {registerMutation.isPending ? (
              <Button title={loadingText} onPress={handleSignUp} variant="primary" />
            ) : (
              <Button title="Sign Up" onPress={handleSignUp} />
            )}
          </View>

          {/* Bottom Sign In Link */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Already have an account ?{" "}
              <Text style={styles.signInLink} onPress={() => navigation.navigate("Login")}>
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
    paddingBottom: SPACING.lg,
    justifyContent: "center",
  },
  headerContainer: {
    marginTop: Platform.OS === "ios" ? 20 : 40,
    marginBottom: 30,
  },
  headingText: {
    fontSize: rem(1.875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    lineHeight: 36,
    marginBottom: SPACING.sm,
  },
  subHeadingText: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  formContainer: {
    width: "100%",
    marginBottom: SPACING.xs,
  },
  checkbox: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  loadingContainer: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 28,
  },
  loadingText: {
    fontSize: rem(1),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.white,
  },
  termsText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  termsTextBold: {
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
  },
  buttonContainer: {
    width: "100%",
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.grayHeavvy,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.semibold,
    color: COLORS.textMuted,
  },
  socialContainer: {
    width: "100%",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  socialButton: {
    height: 56,
    borderRadius: 28,
  },
  facebookIconContainer: {
    backgroundColor: COLORS.blue,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
    paddingVertical: SPACING.md,
  },
  footerText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.semibold,
    color: COLORS.textMuted,
  },
  signInLink: {
    color: COLORS.primary,
    fontFamily: FONTS.manrope.bold,
  },
});

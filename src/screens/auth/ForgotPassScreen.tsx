import { Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { AuthStackParamList } from "@/navigation/AuthNavigator";
import { rem } from "@/utils/responsive";

type ForgotPassScreenNavigationProp = any;

const ForgotPassScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPassScreenNavigationProp>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Updating password");

  useEffect(() => {
    if (!isLoading) return;

    let count = 0;

    const interval = setInterval(() => {
      count = (count + 1) % 4;

      setLoadingText(`Updating password${".".repeat(count)}`);
    }, 400);

    return () => {
      clearInterval(interval);
      setPassword("");
      setConfirmPassword("");
    };
  }, [isLoading]);

  // Helper function to trigger platform-appropriate notifications
  const showToastOrAlert = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.showWithGravityAndOffset(message, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
    } else {
      Alert.alert("Validation Error", message);
    }
  };

  const validateForm = () => {
    if (!password) {
      showToastOrAlert("New Password is required");
      return false;
    }

    if (password.length < 8) {
      showToastOrAlert("Password must be at least 8 characters long");
      return false;
    }

    if (!confirmPassword) {
      showToastOrAlert("Please confirm your new password");
      return false;
    }

    if (password !== confirmPassword) {
      showToastOrAlert("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate password change request
    setTimeout(() => {
      setIsLoading(false);
      if (Platform.OS === "android") {
        ToastAndroid.show("Password changed successfully", ToastAndroid.SHORT);
      } else {
        Alert.alert("Success", "Password changed successfully");
      }
      navigation.navigate("Login");
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        {/* Top Header Navigation bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Feather name="arrow-left" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.headingText}>New Password</Text>
            <Text style={styles.subHeadingText}>Your password must different from previous password.</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Input
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              autoComplete="password"
            />

            <Text style={styles.instructionText}>
              Your password needs to be at least 8 characters long. Includes some words and phrases to make it even
              safer
            </Text>

            <Input
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword={true}
              autoComplete="password"
            />
          </View>

          {/* Spacer to push button down */}
          <View style={styles.flexSpacer} />

          {/* Action Button */}
          <View style={styles.buttonContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{loadingText}</Text>
              </View>
            ) : (
              <Button title="Continue" onPress={handleContinue} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  navBar: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
    alignSelf: "flex-start",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContainer: {
    marginTop: 10,
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
  loadingContainer: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
  },
  loadingText: {
    fontSize: rem(1),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  formContainer: {
    width: "100%",
  },
  instructionText: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  flexSpacer: {
    flex: 1,
    minHeight: 40,
  },
  buttonContainer: {
    width: "100%",
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
});

import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import VerifyEmailScreen from "@/screens/auth/VerifyEmail";

export default function VerifyEmailRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <VerifyEmailScreen />
    </SafeAreaView>
  );
}

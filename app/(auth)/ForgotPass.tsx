import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import ForgotPassScreen from "@/screens/auth/ForgotPassScreen";

export default function ForgotPassRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ForgotPassScreen />
    </SafeAreaView>
  );
}

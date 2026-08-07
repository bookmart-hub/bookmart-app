import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import LoginScreen from "@/screens/auth/LoginScreen";

export default function LoginRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LoginScreen />
    </SafeAreaView>
  );
}

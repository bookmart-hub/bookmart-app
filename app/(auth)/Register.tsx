import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import RegisterScreen from "@/screens/auth/RegisterScreen";

export default function RegisterRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RegisterScreen />
    </SafeAreaView>
  );
}

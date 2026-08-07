import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import PersonalizationScreen from "@/screens/auth/PersonalizationScreen";

export default function PersonalizationRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PersonalizationScreen />
    </SafeAreaView>
  );
}

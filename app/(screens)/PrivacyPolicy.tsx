import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import PrivacyPolicyScreen from "@/screens/others/PrivacyPolicyScreen";

export default function PrivacyPolicyRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PrivacyPolicyScreen />
    </SafeAreaView>
  );
}

import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import TermsConditionsScreen from "@/screens/others/TermsConditionsScreen";

export default function TermsConditionsRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TermsConditionsScreen />
    </SafeAreaView>
  );
}

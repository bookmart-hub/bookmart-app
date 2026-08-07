import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import HelpSupportScreen from "@/screens/others/HelpSupportScreen";

export default function HelpSupportRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HelpSupportScreen />
    </SafeAreaView>
  );
}

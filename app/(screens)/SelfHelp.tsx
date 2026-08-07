import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import SelfHelpScreen from "@/screens/others/SelfHelpScreen";

export default function SelfHelpRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SelfHelpScreen />
    </SafeAreaView>
  );
}

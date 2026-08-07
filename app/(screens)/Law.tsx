import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import LawScreen from "@/screens/others/LawScreen";

export default function LawRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LawScreen />
    </SafeAreaView>
  );
}

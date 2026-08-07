import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import EngineeringScreen from "@/screens/others/EngineeringScreen";

export default function EngineeringRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <EngineeringScreen />
    </SafeAreaView>
  );
}

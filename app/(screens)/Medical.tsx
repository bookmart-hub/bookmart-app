import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import MedicalScreen from "@/screens/others/MedicalScreen";

export default function MedicalRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MedicalScreen />
    </SafeAreaView>
  );
}

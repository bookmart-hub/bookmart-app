import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import ScienceFictionScreen from "@/screens/others/ScienceFictionScreen";

export default function ScienceFictionRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScienceFictionScreen />
    </SafeAreaView>
  );
}

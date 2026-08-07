import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import RomanceScreen from "@/screens/others/RomanceScreen";

export default function RomanceRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RomanceScreen />
    </SafeAreaView>
  );
}

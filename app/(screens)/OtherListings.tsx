import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import OtherListingsScreen from "@/screens/others/OtherListingsScreen";

export default function OtherListingsRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <OtherListingsScreen />
    </SafeAreaView>
  );
}

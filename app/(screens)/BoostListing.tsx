import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import BoostListingScreen from "@/screens/others/BoostListingScreen";

export default function BoostListingRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BoostListingScreen />
    </SafeAreaView>
  );
}

import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import CollegeInsightsScreen from "@/screens/others/CollegeInsightsScreen";

export default function CollegeInsightsRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CollegeInsightsScreen />
    </SafeAreaView>
  );
}

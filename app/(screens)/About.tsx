import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import AboutScreen from "@/screens/others/AboutScreen";

export default function AboutRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AboutScreen />
    </SafeAreaView>
  );
}

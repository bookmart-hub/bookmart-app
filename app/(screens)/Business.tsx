import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import BusinessScreen from "@/screens/others/BusinessScreen";

export default function BusinessRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BusinessScreen />
    </SafeAreaView>
  );
}

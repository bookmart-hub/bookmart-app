import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import FAQsScreen from "@/screens/others/FAQsScreen";

export default function FAQsRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FAQsScreen />
    </SafeAreaView>
  );
}

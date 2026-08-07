import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import SoldBooksScreen from "@/screens/others/SoldBooksScreen";

export default function SoldBooksRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SoldBooksScreen />
    </SafeAreaView>
  );
}

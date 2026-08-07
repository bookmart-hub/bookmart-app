import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import NearestBooksScreen from "@/screens/others/NearestBooksScreen";

export default function NearestBooksRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NearestBooksScreen />
    </SafeAreaView>
  );
}

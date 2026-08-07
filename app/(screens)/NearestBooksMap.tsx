import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import NearestBooksMapScreen from "@/screens/others/NearestBooksMapScreen";

export default function NearestBooksMapRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NearestBooksMapScreen />
    </SafeAreaView>
  );
}

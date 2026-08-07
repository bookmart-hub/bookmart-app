import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import BookDetailsScreen from "@/screens/others/BookDetailsScreen";

export default function BookDetailsRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BookDetailsScreen />
    </SafeAreaView>
  );
}

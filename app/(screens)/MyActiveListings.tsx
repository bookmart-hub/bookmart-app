import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import MyActiveListingsScreen from "@/screens/others/MyActiveListingsScreen";

export default function MyActiveListingsRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MyActiveListingsScreen />
    </SafeAreaView>
  );
}

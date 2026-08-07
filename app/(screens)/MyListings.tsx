import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import MyListingsScreen from "@/screens/others/MyListingsScreen";

export default function MyListingsRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MyListingsScreen />
    </SafeAreaView>
  );
}

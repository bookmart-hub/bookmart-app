import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import ManageListingsScreen from "@/screens/others/ManageListingsScreen";

export default function ManageListingsRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ManageListingsScreen />
    </SafeAreaView>
  );
}

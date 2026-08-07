import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import SavedAddressesScreen from "@/screens/others/SavedAddressesScreen";

export default function SavedAddressesRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SavedAddressesScreen />
    </SafeAreaView>
  );
}

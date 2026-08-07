import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import BiographyScreen from "@/screens/others/BiographyScreen";

export default function BiographyRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BiographyScreen />
    </SafeAreaView>
  );
}

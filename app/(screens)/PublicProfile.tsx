import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import PublicProfileScreen from "@/screens/others/PublicProfileScreen";

export default function PublicProfileRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PublicProfileScreen />
    </SafeAreaView>
  );
}

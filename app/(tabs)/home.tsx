import React from "react";
import HomeScreen from "@/screens/main/Home.screen";

import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";

export default function HomeRoute() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <HomeScreen />
    </SafeAreaView>
  );
}

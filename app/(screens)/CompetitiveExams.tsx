import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import CompetitiveExamsScreen from "@/screens/others/CompetitiveExamsScreen";

export default function CompetitiveExamsRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CompetitiveExamsScreen />
    </SafeAreaView>
  );
}

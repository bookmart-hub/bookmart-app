import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import ReportScreen from "@/screens/others/ReportScreen";

export default function ReportRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ReportScreen />
    </SafeAreaView>
  );
}

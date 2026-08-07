import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import RequestPostScreen from "@/screens/others/RequestPostScreen";

export default function RequestPostRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RequestPostScreen />
    </SafeAreaView>
  );
}

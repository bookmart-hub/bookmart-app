import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import MyOrdersScreen from "@/screens/others/MyOrdersScreen";

export default function MyOrdersRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MyOrdersScreen />
    </SafeAreaView>
  );
}

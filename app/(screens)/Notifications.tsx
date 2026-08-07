import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import NotificationsScreen from "@/screens/others/NotificationsScreen";

export default function NotificationsRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NotificationsScreen />
    </SafeAreaView>
  );
}

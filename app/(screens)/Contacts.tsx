import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import ContactScreen from "@/screens/others/ContactScreen";

export default function ContactsRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ContactScreen />
    </SafeAreaView>
  );
}

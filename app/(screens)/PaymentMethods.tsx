import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import PaymentMethodsScreen from "@/screens/others/PaymentMethodsScreen";

export default function PaymentMethodsRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PaymentMethodsScreen />
    </SafeAreaView>
  );
}

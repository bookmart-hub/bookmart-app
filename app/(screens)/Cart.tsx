import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import CartScreen from "@/screens/others/CartScreen";

export default function CartRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CartScreen />
    </SafeAreaView>
  );
}

import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import FavouritesScreen from "@/screens/others/FavouritesScreen";

export default function FavouritesRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FavouritesScreen />
    </SafeAreaView>
  );
}

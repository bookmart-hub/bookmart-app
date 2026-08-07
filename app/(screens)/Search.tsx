import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import SearchScreen from "@/screens/others/SearchScreen";

export default function SearchRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SearchScreen />
    </SafeAreaView>
  );
}

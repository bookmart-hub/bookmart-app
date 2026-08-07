import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import AuthorDetailsScreen from "@/screens/others/AuthorDetailsScreen";

export default function AuthorDetailsRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AuthorDetailsScreen />
    </SafeAreaView>
  );
}

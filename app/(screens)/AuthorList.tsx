import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import AuthorListScreen from "@/screens/others/AuthorListScreen";

export default function AuthorListRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AuthorListScreen />
    </SafeAreaView>
  );
}

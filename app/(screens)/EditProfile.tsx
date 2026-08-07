import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import EditProfileScreen from "@/screens/others/EditProfileScreen";

export default function EditProfileRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <EditProfileScreen />
    </SafeAreaView>
  );
}

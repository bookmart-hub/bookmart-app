import React from "react";
import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>{/* Dynamic Native Stacks mapping all the inner screens */}</Stack>
  );
}

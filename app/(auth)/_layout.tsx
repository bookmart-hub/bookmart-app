import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="ForgotPass" />
      <Stack.Screen name="Personalization" />
      <Stack.Screen name="VerifyEmail" />
    </Stack>
  );
}

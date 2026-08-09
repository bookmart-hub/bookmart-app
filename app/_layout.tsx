import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { fontAssets } from "@/constants/fonts";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { api } from "@/api/clients";

// Lazy-load native modules so the app doesn't crash if the dev build
// hasn't been rebuilt after installing expo-notifications / expo-device.
let Notifications: typeof import("expo-notifications") | null = null;
let Device: typeof import("expo-device") | null = null;
try {
  Notifications = require("expo-notifications");
  Device = require("expo-device");
} catch {
  console.warn(
    "expo-notifications or expo-device native module not found. " +
      "Push notifications are disabled until the next native rebuild."
  );
}

// Configure how foreground notifications are handled (only if module loaded)
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Notifications) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // Device?.isDevice is undefined on emulators; default to true so dev
  // builds on physical devices without the native module still attempt.
  const isPhysical = Device ? Device.isDevice : true;
  if (!isPhysical) {
    console.warn("Must use physical device for Push Notifications");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.warn("Failed to get push token for push notification!");
    return null;
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as any).easConfig?.projectId;
    if (!projectId) {
      console.warn("EAS Project ID not found in configuration.");
    }
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return token;
  } catch (err) {
    console.warn(
      "Push token fetch failed. To receive push notifications on Android, download your google-services.json from Firebase, configure 'googleServicesFile' under the 'android' block in app.json, and rebuild your dev APK. Details:",
      err
    );
    return null;
  }
}

// Prevent splash screen auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts(fontAssets);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  // Set up notifications registration and listeners
  useEffect(() => {
    // Print cached token immediately on reload for rapid verification
    SecureStore.getItemAsync("pushToken").then((cachedToken) => {
      if (cachedToken) {
        console.log("\n🔑 [METRO RELOAD] Cached Expo Push Token:", cachedToken, "\n");
      } else {
        console.log("\n⚠️ [METRO RELOAD] No cached push token found. Initializing registration...\n");
      }
    });

    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        await SecureStore.setItemAsync("pushToken", token);
        console.log("\n🚀 [METRO RELOAD] Generated New Expo Push Token:", token, "\n");
        const accessToken = await SecureStore.getItemAsync("accessToken");
        if (accessToken) {
          try {
            await api.post("/api/v1/notifications/devices/", { expo_push_token: token });
            console.log("✅ [METRO RELOAD] Push token registered successfully on backend:", token);
          } catch (err: any) {
            console.warn("❌ [METRO RELOAD] Failed to register push token on backend:", err.message || err);
          }
        }
      } else {
        console.log("⚠️ [METRO RELOAD] Push notification token fetch skipped (see warnings above).");
      }
    });

    if (!Notifications) return;

    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Push Notification Received in Foreground:", notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Push Notification Clicked / Opened:", response);
    });

    return () => {
      if (notificationListener) {
        notificationListener.remove();
      }
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <PaperProvider>
            <StatusBar style="auto" hidden={false} />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(screens)" />
            </Stack>
          </PaperProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

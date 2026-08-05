import { fontAssets } from "@/constants/fonts";
import RootNavigator from "@/navigation/RootNavigator";
import { StaticSplashScreen } from "@/screens/auth/SplashScreen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as ExpoSplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";

// Prevent native splash screen from autohiding until we manually hide it
ExpoSplashScreen.preventAutoHideAsync().catch(() => {
  // Catch error in case it's already hidden or fails
});

const queryClient = new QueryClient();


export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);

  useEffect(() => {
    // Hide the native splash screen immediately when JS starts
    // This allows our custom StaticSplashScreen to take over and animate
    ExpoSplashScreen.hideAsync().catch(() => {});
  }, []);

  if (!fontsLoaded) {
    return <StaticSplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          {/* <StatusBar style="auto" translucent={true} backgroundColor="transparent" /> */}
          <StatusBar style="light" hidden={false} />
          <RootNavigator />
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

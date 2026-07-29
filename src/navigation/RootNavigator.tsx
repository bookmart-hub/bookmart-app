import SplashScreen from "@/screens/auth/SplashScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import AppStackNavigator from "./AppStackNavigator";

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Tab: undefined;
  AppStack: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          // animation: 'default',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Tab" component={TabNavigator} />
        <Stack.Screen name="AppStack" component={AppStackNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

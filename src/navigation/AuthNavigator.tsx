import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPassScreen from '@/screens/auth/ForgotPassScreen';
import PersonalizationScreen from '@/screens/auth/PersonalizationScreen';
import VerifyEmail from '@/screens/auth/VerifyEmail';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassScreen: undefined;
  VerifyEmail: undefined;
  Personalization: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />
      <Stack.Screen
        name="ForgotPassScreen"
        component={ForgotPassScreen}
      />
      <Stack.Screen
        name="VerifyEmail"
        component={VerifyEmail}
      />
      <Stack.Screen
        name="Personalization"
        component={PersonalizationScreen}
      />
    </Stack.Navigator>
  );
}
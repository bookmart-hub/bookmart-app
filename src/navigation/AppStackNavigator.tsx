import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BusinessScreen from '@/screens/others/BusinessScreen';
import BiographyScreen from '@/screens/others/BiographyScreen';
import ScinceFinctionScreen from '@/screens/others/ScinceFinctionScreen';
import SelfHelpScreen from '@/screens/others/SelfHelpScreen';
import RomanceScreen from '@/screens/others/RomanceScreen';

const Stack = createNativeStackNavigator();

export default function AppStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            animation: 'default'
        }}>
            <Stack.Screen name="Business" component={BusinessScreen} />
            <Stack.Screen name="Biography" component={BiographyScreen} />
            <Stack.Screen name="ScinceFinction" component={ScinceFinctionScreen} />
            <Stack.Screen name="SelfHelp" component={SelfHelpScreen} />
            <Stack.Screen name="Romance" component={RomanceScreen} />
        </Stack.Navigator>
    );
}

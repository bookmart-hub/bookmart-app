import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{
                headerShown: false,
                // animation: 'default',
            }}>
                <Stack.Screen name="Tab" component={TabNavigator} />
                <Stack.Screen name="Auth" component={AuthNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
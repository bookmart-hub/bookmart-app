import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/main/HomeScreen';
import CreateScreen from '../screens/main/CreateScreen';
import Analytics from '../screens/main/Analytics';
import ProfileScreen from '../screens/main/ProfileScreen';

export type TabParamList = {
    Home: undefined;
    Create: undefined;
    Analytics: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
            />
            <Tab.Screen
                name="Create"
                component={CreateScreen}
            />
            <Tab.Screen
                name="Analytics"
                component={Analytics}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
            />
        </Tab.Navigator>
    );
}
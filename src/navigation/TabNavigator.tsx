import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/main/HomeScreen';
import CreateScreen from '../screens/main/CreateScreen';
import Analytics from '../screens/main/Analytics';
import ProfileScreen from '../screens/main/ProfileScreen';
import { COLORS } from '@/constants/colors'; // Adjust imports to match your project paths
import { FONTS } from '@/constants/fonts';
import CustomTabBar from '@/components/ui/CustomTabBar';

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
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabelStyle: styles.tabLabel,
                tabBarIconStyle: styles.tabIcon,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Create') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'Analytics') {
                        iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size - 8} color={color} />;
                },
            })}
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
const styles = StyleSheet.create({
    tabLabel: {
        fontSize: 10,
        fontFamily: FONTS?.montserrat?.medium || Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
        marginTop: 1
    },
    tabIcon: {
        marginBottom: 1,
    }
});
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
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabelStyle: styles.tabLabel,
                tabBarIconStyle: styles.tabIcon,
                tabBarStyle: styles.floatingOvalTabBar,
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

                    return <Ionicons name={iconName} size={size - 1} color={color} />;
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
    floatingOvalTabBar: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 30 : 20,
        left: 20,
        right: 20,
        height: 64,
        backgroundColor: COLORS.white,
        borderRadius: 32, // Gives the navigation deck its full oval pill profile
        borderTopWidth: 0, // Clears the standard crisp default top divider line

        // Shadow architecture for elevation/depth
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,

        // Internal structural alignments
        paddingBottom: Platform.OS === 'ios' ? 0 : 8,
        paddingTop: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabLabel: {
        fontSize: 11,
        fontFamily: FONTS?.montserrat?.medium || Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
        marginTop: -2,
    },
    tabIcon: {
        marginBottom: 1,
    }
});
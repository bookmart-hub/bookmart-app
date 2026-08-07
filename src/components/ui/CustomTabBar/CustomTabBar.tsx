import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";

import { COLORS } from "@/constants/colors";
import { rem } from "@/utils/responsive";
import { styles } from "./CustomTabBar.style";

export interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = memo(({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  // Floating tab bar offset calculation
  const bottomMargin = insets.bottom > 0 ? insets.bottom + rem(1.25) : rem(1.0);

  return (
    <View style={[styles.container, { bottom: bottomMargin }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        // Determine icon name based on route (case-insensitive for compatibility)
        let iconName: keyof typeof Ionicons.glyphMap = "home-outline";
        const normalizedRouteName = route.name.toLowerCase();
        if (normalizedRouteName === "home") {
          iconName = isFocused ? "home" : "home-outline";
        } else if (normalizedRouteName === "create") {
          iconName = isFocused ? "add-circle" : "add-circle-outline";
        } else if (normalizedRouteName === "analytics") {
          iconName = isFocused ? "bar-chart" : "bar-chart-outline";
        } else if (normalizedRouteName === "profile") {
          iconName = isFocused ? "person" : "person-outline";
        }

        // Light colors matching the user's request
        const activeColor = COLORS.primary; // Brand teal for active
        const inactiveColor = COLORS.textMuted; // Muted gray for inactive
        const color = isFocused ? activeColor : inactiveColor;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID || (options as any).tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            {isFocused ? (
              // Active Tab: vertical bubble containing BOTH icon and text
              <Animated.View entering={FadeIn.duration(200)} style={styles.activeTabCapsule}>
                <Ionicons name={iconName} size={rem(1.5)} color={color} />
              </Animated.View>
            ) : (
              // Inactive Tab: vertical layout containing BOTH icon and text (no background bubble)
              <View style={styles.inactiveTabContent}>
                <Ionicons name={iconName} size={rem(1.5)} color={color} />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
});

export default CustomTabBar;

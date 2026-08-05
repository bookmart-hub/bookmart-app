import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants/colors";
import { rem } from "@/utils/responsive";
import { styles } from "./CustomTabBar.style";

// Interface kept directly inside the TSX file as requested
export interface CustomTabBarProps extends BottomTabBarProps {}

const CustomTabBar: React.FC<CustomTabBarProps> = memo(({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  // Floating tab bar offset calculation
  const bottomMargin = insets.bottom > 0 ? insets.bottom + rem(0.25) : rem(1.0);

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

        // Determine icon name based on route
        let iconName: keyof typeof Ionicons.glyphMap = "home-outline";
        if (route.name === "Home") {
          iconName = isFocused ? "home" : "home-outline";
        } else if (route.name === "Create") {
          iconName = isFocused ? "add-circle" : "add-circle-outline";
        } else if (route.name === "Analytics") {
          iconName = isFocused ? "bar-chart" : "bar-chart-outline";
        } else if (route.name === "Profile") {
          iconName = isFocused ? "person" : "person-outline";
        }

        const activeColor = COLORS.primary; // Active color matches primary teal of the app
        const inactiveColor = COLORS.textMuted; // Inactive color is muted gray from the app
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
              // Active Tab: Capsule background with standard FadeIn animation
              <Animated.View entering={FadeIn.duration(200)} style={styles.activeTabCapsule}>
                <Ionicons name={iconName} size={rem(1.1)} color={color} />
                <Text style={[styles.tabLabel, { color }]}>
                  {typeof label === "string" ? label : route.name}
                </Text>
              </Animated.View>
            ) : (
              // Inactive Tab: No capsule background, muted colors
              <View style={styles.inactiveTabContent}>
                <Ionicons name={iconName} size={rem(1.1)} color={color} />
                <Text style={[styles.tabLabel, { color }]}>
                  {typeof label === "string" ? label : route.name}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
});

export default CustomTabBar;

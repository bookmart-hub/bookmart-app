import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [isNewMode, setIsNewMode] = useState(false);

  const handleNewModePress = () => {
    const nextMode = !isNewMode;
    setIsNewMode(nextMode);

    if (Platform.OS === "android") {
      ToastAndroid.show(nextMode ? "NEW MODE ENABLED!" : "RESALE MODE ENABLED!", ToastAndroid.SHORT);
    } else {
      Alert.alert("Mode Changed", nextMode ? "You have switched to NEW MODE!" : "You have returned to RESALE MODE.");
    }
  };

  // Safe bottom margin calculation:
  // If the device has system safe-area insets at the bottom (e.g. iOS Home Indicator or Android Gesture/3-button edge-to-edge),
  // we add a 12dp spacing above the safe area boundary to make the pill float cleanly.
  // Otherwise, we use a fallback margin of 20dp to float above the physical edge of the screen.
  const bottomMargin = insets.bottom > 0 ? insets.bottom + 0 : rem(0.1875);

  return (
    <View style={[styles.wrapper, { bottom: bottomMargin }]}>
      {/* Left Pill: Standard Bottom Tab Navigator */}
      <View style={styles.leftPill}>
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

          const renderIcon = options.tabBarIcon;
          const activeColor = options.tabBarActiveTintColor || COLORS.primary;
          const inactiveColor = options.tabBarInactiveTintColor || COLORS.textMuted;
          const color = isFocused ? activeColor : inactiveColor;

          const labelStyle = options.tabBarLabelStyle || styles.tabLabel;
          const iconStyle = options.tabBarIconStyle || styles.tabIcon;
          const showLabel = options.tabBarShowLabel !== false;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID || (options as any).tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [styles.tabItem, { transform: [{ scale: pressed ? 0.92 : 1 }] }]}
            >
              <View style={iconStyle}>{renderIcon && renderIcon({ focused: isFocused, color, size: rem(1.375) })}</View>
              {showLabel &&
                (typeof label === "string" ? (
                  <Text style={[{ color }, labelStyle]}>{label}</Text>
                ) : typeof label === "function" ? (
                  label({
                    focused: isFocused,
                    color,
                    position: "below-icon",
                    children: route.name,
                  })
                ) : (
                  label
                ))}
            </Pressable>
          );
        })}
      </View>

      {/* Right Pill: Configurable Custom Button */}
      <Pressable
        style={({ pressed }) => [
          styles.rightPill,
          {
            backgroundColor: isNewMode ? COLORS.primary : COLORS.white,
            transform: [{ scale: pressed ? 0.92 : 1 }],
          },
        ]}
        onPress={handleNewModePress}
      >
        <Ionicons name="sparkles-outline" size={24} color={isNewMode ? COLORS.white : COLORS.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 18,
    right: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  leftPill: {
    flex: 5,
    flexDirection: "row",
    height: rem(3.75),
    backgroundColor: COLORS.white,
    borderRadius: rem(2),
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,

    // Shadows
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  rightPill: {
    flex: 1.2,
    height: rem(3.75),
    borderRadius: rem(2),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,

    // Shadows
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  tabLabel: {
    fontSize: rem(0.625),
    fontFamily: FONTS?.montserrat?.medium || Platform.select({ ios: "System", android: "sans-serif-medium" }),
    marginTop: 2,
  },
  tabIcon: {
    marginBottom: 1,
  },
  newModeText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS?.montserrat?.bold || Platform.select({ ios: "System", android: "sans-serif-bold" }),
    textAlign: "center",
  },
});

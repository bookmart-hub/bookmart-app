import { COLORS } from "@/constants/colors";
interface NearestBook {
  id: string;
  title: string;
  latitude?: number;
  longitude?: number;
}
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

interface MapMarkerProps {
  book: NearestBook;
  isSelected: boolean;
  hasSelection: boolean;
}

const MapMarker: React.FC<MapMarkerProps> = ({ book, isSelected, hasSelection }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSpring(1.3, { damping: 12, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 200 });
    } else if (hasSelection) {
      scale.value = withSpring(0.85, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(0.6, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [isSelected, hasSelection]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      zIndex: isSelected ? 10 : 1,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.bubble, isSelected && styles.bubbleSelected]}>
        <Ionicons name="book" size={14} color={isSelected ? COLORS.white : COLORS.white} />
      </View>
    </Animated.View>
  );
};

export default React.memo(MapMarker);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
    margin: 10,
  },
  bubbleSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.secondary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});

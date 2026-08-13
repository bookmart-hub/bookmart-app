import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { COLORS } from "@/constants/colors";
import { rem } from "@/utils/responsive";

interface ShimmerBlockProps {
  width?: any;
  height?: any;
  borderRadius?: number;
  style?: any;
}

export const ShimmerBlock: React.FC<ShimmerBlockProps> = ({
  width = "100%",
  height = rem(1),
  borderRadius = 4,
  style,
}) => {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.75, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: COLORS.grayHeavvy,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const BookCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <ShimmerBlock height={140} borderRadius={12} style={styles.cover} />
      <ShimmerBlock height={16} width="80%" style={styles.title} />
      <ShimmerBlock height={12} width="50%" style={styles.author} />
      <View style={styles.footer}>
        <ShimmerBlock height={16} width="40%" />
        <ShimmerBlock height={16} width="20%" borderRadius={8} />
      </View>
    </View>
  );
};

export const AuthorCardSkeleton: React.FC = () => {
  return (
    <View style={styles.authorCard}>
      <ShimmerBlock width={70} height={70} borderRadius={35} style={styles.authorImage} />
      <View style={styles.authorInfo}>
        <ShimmerBlock height={18} width="60%" style={{ marginBottom: 6 }} />
        <ShimmerBlock height={12} width="90%" style={{ marginBottom: 4 }} />
        <ShimmerBlock height={12} width="40%" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: rem(0.625),
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    marginBottom: rem(0.9375),
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cover: {
    marginBottom: 8,
  },
  title: {
    marginBottom: 6,
  },
  author: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    marginBottom: 12,
  },
  authorImage: {
    marginRight: 16,
  },
  authorInfo: {
    flex: 1,
  },
});

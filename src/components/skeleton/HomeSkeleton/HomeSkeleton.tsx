import React, { useEffect } from "react";
import { ScrollView, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { styles } from "./HomeSkeleton.style";

// Interface kept directly inside the TSX file as requested
export interface HomeSkeletonProps {
  isLoading?: boolean;
}

const ShimmerBlock: React.FC<{ style: any }> = ({ style }) => {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.75, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1, // Infinite repetition
      true // Reverse animation direction on each repetition (pulse effect)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[style, animatedStyle]} />;
};

const HomeSkeleton: React.FC<HomeSkeletonProps> = () => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false} // Disable interaction while loading
    >
      {/* Header Info Placeholder */}
      <View style={styles.headerRow}>
        <ShimmerBlock style={styles.logoPlaceholder} />
        <ShimmerBlock style={styles.subHeaderPlaceholder} />
      </View>

      {/* Search Input Placeholder */}
      <ShimmerBlock style={styles.searchPlaceholder} />

      {/* Banner Title */}
      <ShimmerBlock style={styles.bannerTitlePlaceholder} />

      {/* Hero Promo Banner Card Placeholder */}
      <ShimmerBlock style={styles.heroBannerPlaceholder} />

      {/* Categories Row Placeholders */}
      <View style={styles.categoriesContainer}>
        <ShimmerBlock style={styles.categoryBox} />
        <ShimmerBlock style={styles.categoryBox} />
        <ShimmerBlock style={styles.categoryBox} />
        <ShimmerBlock style={styles.categoryBox} />
      </View>

      {/* Nearest Books Title Row Placeholder */}
      <View style={styles.sectionTitleRow}>
        <ShimmerBlock style={styles.sectionTitlePlaceholder} />
        <ShimmerBlock style={styles.seeAllPlaceholder} />
      </View>

      {/* Bottom Grid Cards Placeholders */}
      <View style={styles.grid}>
        <ShimmerBlock style={styles.bookCardPlaceholder} />
        <ShimmerBlock style={styles.bookCardPlaceholder} />
      </View>
    </ScrollView>
  );
};

export default HomeSkeleton;

import { COLORS } from "@/constants/colors";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { FadeOut, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const HeartBurst = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 600,
    });
  }, []);

  const particles = [
    { x: -25, y: -20 },
    { x: 25, y: -20 },
    { x: -35, y: 0 },
    { x: 35, y: 0 },
    { x: -20, y: 25 },
    { x: 20, y: 25 },
  ];

  return (
    <Animated.View exiting={FadeOut.duration(200)} style={styles.burstContainer} pointerEvents="none">
      {particles.map((p, i) => {
        const animatedStyle = useAnimatedStyle(() => ({
          opacity: 1 - progress.value,
          transform: [
            {
              translateX: p.x * progress.value,
            },
            {
              translateY: p.y * progress.value,
            },
            {
              scale: 1 - progress.value * 0.3,
            },
          ],
        }));

        return <Animated.View key={i} style={[styles.particle, animatedStyle]} />;
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  burstContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 10,
    height: 10,
  },

  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
});

export default HeartBurst;

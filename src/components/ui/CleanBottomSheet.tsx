import {
  View,
  StyleSheet,
  BackHandler,
  Dimensions,
  Pressable,
} from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CleanBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  minHeight?: number;
  midHeight?: number;
  maxHeight?: number;
  backgroundColor?: string;
  borderRadius?: number;
  children?: React.ReactNode;
  showCross?: boolean;
}

const CleanBottomSheet: React.FC<CleanBottomSheetProps> = ({
  visible,
  onClose,
  minHeight = SCREEN_HEIGHT * 0.25,
  midHeight = SCREEN_HEIGHT * 0.5,
  maxHeight = SCREEN_HEIGHT * 0.85,
  backgroundColor = COLORS.white,
  borderRadius = 30,
  children,
  showCross = true,
}) => {
  // Snap offsets (translateY values)
  const MAX_OFFSET = 0; // Fully expanded (maxHeight)
  const MID_OFFSET = maxHeight - midHeight; // Halfway open (midHeight)
  const MIN_OFFSET = maxHeight - minHeight; // Partially open (minHeight)
  const CLOSED_OFFSET = maxHeight; // Completely hidden

  const sv = useSharedValue(CLOSED_OFFSET);
  const startY = useSharedValue(CLOSED_OFFSET);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sv.value }],
  }));

  const gesture = Gesture.Pan()
    .onStart(() => {
      startY.value = sv.value;
    })
    .onUpdate(e => {
      const newValue = startY.value + e.translationY;
      if (newValue >= MAX_OFFSET) {
        sv.value = newValue;
      }
    })
    .onEnd(e => {
      const currentPos = sv.value;
      const targets = [MAX_OFFSET, MID_OFFSET, MIN_OFFSET, CLOSED_OFFSET];
      let target = CLOSED_OFFSET;

      if (e.velocityY > 500) {
        // Dragging down fast
        if (currentPos < MID_OFFSET) {
          target = MID_OFFSET;
        } else if (currentPos < MIN_OFFSET) {
          target = MIN_OFFSET;
        } else {
          target = CLOSED_OFFSET;
        }
      } else if (e.velocityY < -500) {
        // Dragging up fast
        if (currentPos > MIN_OFFSET) {
          target = MIN_OFFSET;
        } else if (currentPos > MID_OFFSET) {
          target = MID_OFFSET;
        } else {
          target = MAX_OFFSET;
        }
      } else {
        // Snap to closest target
        target = targets.reduce((prev, curr) =>
          Math.abs(curr - currentPos) < Math.abs(prev - currentPos) ? curr : prev
        );
      }

      if (target === CLOSED_OFFSET) {
        sv.value = withTiming(CLOSED_OFFSET, { duration: 300 }, () => {
          runOnJS(onClose)();
        });
      } else {
        sv.value = withTiming(target, { duration: 300 });
      }
    });

  useEffect(() => {
    if (visible) {
      // Default initial snap position is midHeight (MID_OFFSET)
      sv.value = withDelay(
        100,
        withTiming(MID_OFFSET, {
          duration: 350,
          easing: Easing.out(Easing.cubic),
        })
      );
    } else {
      sv.value = CLOSED_OFFSET;
    }
  }, [visible, maxHeight, midHeight]);

  useEffect(() => {
    if (!visible) return;

    const onBackPress = () => {
      handleClosePress();
      return true;
    };

    const subs = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      subs.remove();
    };
  }, [visible]);

  const handleClosePress = () => {
    sv.value = withTiming(CLOSED_OFFSET, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  if (!visible) return null;

  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: COLORS.lessTransparency
      }}
      pointerEvents="box-none"
    >
      {/* Bottom Sheet */}
      <Animated.View
        style={[
          {
            position: 'relative',
            height: maxHeight,
            width: '100%',
            backgroundColor,
            borderTopRightRadius: borderRadius,
            borderTopLeftRadius: borderRadius,
            // Premium shadow to stand out from the map background
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 16,
          },
          animatedStyle,
        ]}
      >
        {/* Drag handle area only */}
        <GestureDetector gesture={gesture}>
          <View
            style={{
              height: 40,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showCross && (
              <Pressable
                style={{
                  position: 'absolute',
                  top: -50,
                  left: '50%',
                  transform: [{ translateX: -15 }],
                  zIndex: 10,
                }}
                onPress={handleClosePress}
              >
                <Ionicons
                  name="close-circle"
                  size={35}
                  color={COLORS.completeTransparency}
                  style={{
                    alignSelf: 'center',
                    marginTop: 10,
                  }}
                />
              </Pressable>
            )}
            {/* Visual drag handle */}
            <View
              style={{
                width: 40,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: '#ccc',
                marginTop: 30,
              }}
            />
          </View>
        </GestureDetector>
        {/* Sheet content (scrollable) */}
        <View style={{ flex: 1 }}>{children}</View>
      </Animated.View>
    </View>
  );
};

export default CleanBottomSheet;


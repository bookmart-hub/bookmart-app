import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Ellipse, G, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";

import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ── Custom SVG Illustrations for Slides ──────────────────────────────────────

// Slide 1: Buy & Sell Locally
const IllustrationBuySell = () => (
  <Svg width={rem(11.25)} height={rem(8.75)} viewBox="0 0 180 140">
    <Ellipse cx="90" cy="115" rx="75" ry="18" fill="#E8F4F4" />

    {/* Books Stack */}
    <G transform="translate(45, 30)">
      {/* Bottom Book */}
      <Rect x="0" y="55" width="80" height="12" rx="2" fill="#006666" />
      <Rect x="2" y="57" width="76" height="8" fill="#FFFFF0" />

      {/* Middle Book */}
      <Rect x="5" y="42" width="70" height="12" rx="2" fill="#F5C518" />
      <Rect x="5" y="44" width="68" height="8" fill="#FFFFFF" />

      {/* Bottom Standing Book */}
      <Rect x="15" y="0" width="40" height="42" rx="2" fill="#008080" />
      <Rect x="15" y="0" width="5" height="42" fill="#005B5B" />
      <SvgText x="37" y="27" fontSize="18" fontFamily="Montserrat-Bold" fill="#FFFFFF" textAnchor="middle">
        B
      </SvgText>
    </G>

    {/* Floating location pins and deals badges */}
    <G transform="translate(125, 25)">
      <Circle cx="12" cy="12" r="16" fill="rgba(24, 119, 242, 0.1)" />
      <Path d="M12,2 C6.5,2 2,6.5 2,12 C2,18 12,28 12,28 C12,28 22,18 22,12 C22,6.5 17.5,2 12,2 Z" fill="#EF4545" />
      <Circle cx="12" cy="11" r="4" fill="#FFFFFF" />
    </G>

    {/* Currency coins floating */}
    <Circle cx="30" cy="50" r="8" fill="#F5C518" />
    <Circle cx="30" cy="50" r="5" fill="#E5B20D" />
    <Circle cx="140" cy="90" r="10" fill="#F5C518" />
    <Circle cx="140" cy="90" r="7" fill="#E5B20D" />
  </Svg>
);

// Slide 2: Request & Share Resources
const IllustrationRequestShare = () => (
  <Svg width={rem(11.25)} height={rem(8.75)} viewBox="0 0 180 140">
    <Ellipse cx="90" cy="115" rx="75" ry="18" fill="#FBF7E7" />

    {/* Paper Plane representing request dispatch */}
    <G transform="translate(85, 30)">
      <Path d="M0,25 L40,0 L35,32 L20,38 L15,50 L10,38 Z" fill="#008080" />
      <Path d="M0,25 L40,0 L20,38 Z" fill="#006666" />
    </G>

    {/* Speech Bubble */}
    <G transform="translate(30, 20)">
      <Rect x="0" y="0" width="55" height="38" rx="8" fill="#00968814" stroke="#008080" strokeWidth="1.5" />
      <Polygon points="15,37 20,44 25,37" fill="#00968814" stroke="#008080" strokeWidth="1.5" />
      <Rect x="15" y="36" width="10" height="1" fill="#F4F9F9" />
      <SvgText x="27.5" y="24" fontSize="12" fontFamily="Manrope-Bold" fill="#008080" textAnchor="middle">
        Need Info?
      </SvgText>
    </G>

    {/* Handshake/Agreement checkmark icon */}
    <G transform="translate(35, 75)">
      <Circle cx="18" cy="18" r="18" fill="#10B981" />
      <Path
        d="M10,18 L15,23 L26,12"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </G>
  </Svg>
);

// Slide 3: Live Map Navigation
const IllustrationMapNavigation = () => (
  <Svg width={rem(11.25)} height={rem(8.75)} viewBox="0 0 180 140">
    {/* Map grid representation */}
    <Rect x="15" y="15" width="150" height="110" rx="12" fill="#E8F4F4" stroke="#008080" strokeWidth="1.5" />

    {/* Simplified streets */}
    <Path d="M15,50 L165,50" stroke="#FFFFFF" strokeWidth="8" />
    <Path d="M60,15 L60,125" stroke="#FFFFFF" strokeWidth="8" />
    <Path d="M120,15 L120,125" stroke="#FFFFFF" strokeWidth="8" />

    <Path d="M15,50 L165,50" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4,4" />
    <Path d="M60,15 L60,125" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4,4" />

    {/* Navigation Route */}
    <Path
      d="M60,90 L60,50 L120,50 L120,35"
      stroke="#008080"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Origin user dot */}
    <Circle cx="60" cy="90" r="7" fill="#1877F2" />
    <Circle cx="60" cy="90" r="12" fill="none" stroke="#1877F2" strokeWidth="1.5" />

    {/* Target book marker */}
    <G transform="translate(108, 10)">
      <Path d="M12,2 C6.5,2 2,6.5 2,12 C2,18 12,28 12,28 C12,28 22,18 22,12 C22,6.5 17.5,2 12,2 Z" fill="#EF4545" />
      <Circle cx="12" cy="11" r="4" fill="#FFFFFF" />
    </G>
  </Svg>
);

// ── Slide Metadata ───────────────────────────────────────────────────────────
interface SlideItem {
  id: number;
  title: string;
  description: string;
  Illustration: React.FC;
}

const SLIDES: SlideItem[] = [
  {
    id: 0,
    title: "Buy & Sell Near You",
    description:
      "Explore verified book listings right inside your college campus or nearby locations. Easily find resources for your upcoming semesters.",
    Illustration: IllustrationBuySell,
  },
  {
    id: 1,
    title: "Request from Peers",
    description:
      "Can’t find the copy you need? Broadcast a book request to your college network and let peers notification ping you when they have it.",
    Illustration: IllustrationRequestShare,
  },
  {
    id: 2,
    title: "Interactive Map & Routes",
    description:
      "Locate physical listings in real-time. Calculate walking distances and fetch driving routes directly to finalize exchanges.",
    Illustration: IllustrationMapNavigation,
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / SCREEN_WIDTH);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (activeIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem("@bookmart:onboarding_completed", "true");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error saving onboarding completion status:", error);
      router.replace("/(auth)/login");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Scrollable Slide Content */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {SLIDES.map((slide) => {
          const Illustration = slide.Illustration;
          return (
            <View key={slide.id} style={styles.slide}>
              <View style={styles.illustrationWrapper}>
                <Illustration />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Controls Area */}
      <View style={[styles.controlsContainer, { marginBottom: insets.bottom + SPACING.lg }]}>
        {/* Dots indicator */}
        <View style={styles.indicatorsRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, activeIndex === i ? styles.dotActive : null]} />
          ))}
        </View>

        {/* Bottom Actions Row */}
        <View style={styles.actionsRow}>
          {activeIndex < SLIDES.length - 1 ? (
            <>
              {/* Skip Button */}
              <TouchableOpacity style={styles.skipButton} onPress={handleFinish} activeOpacity={0.7}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>

              {/* Next Round Button */}
              <TouchableOpacity style={styles.nextRoundBtn} onPress={handleNext} activeOpacity={0.8}>
                <Ionicons name="arrow-forward" size={rem(1.375)} color={COLORS.white} />
              </TouchableOpacity>
            </>
          ) : (
            /* Complete Button */
            <Button title="Get Started" onPress={handleFinish} variant="primary" style={styles.getStartedButton} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.65,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  illustrationWrapper: {
    width: rem(13.75),
    height: rem(13.75),
    backgroundColor: COLORS.white,
    borderRadius: rem(6.875),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: rem(1.375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.light,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: rem(1.25),
    paddingHorizontal: SPACING.xs,
  },
  controlsContainer: {
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
  },
  indicatorsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.grayHeavvy,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  actionsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
  },
  skipButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  skipText: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.textMuted,
  },
  nextRoundBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedButton: {
    width: "100%",
    marginVertical: 0,
  },
});

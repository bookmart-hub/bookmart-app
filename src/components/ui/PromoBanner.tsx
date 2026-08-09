import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View, ViewToken } from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_HORIZONTAL_PADDING = SPACING.lg;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2;

export interface PromoBannerItem {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  bookImageUri: string;
}

const DEFAULT_BANNERS: PromoBannerItem[] = [
  {
    id: "1",
    title: "New Exploration on Non-Fiction",
    subtitle: "Discount 50% for first transaction",
    cta: "Explore Now",
    bookImageUri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=400&fit=crop",
  },
  {
    id: "2",
    title: "Best Sellers This Week",
    subtitle: "Up to 40% off on top picks",
    cta: "Browse Now",
    bookImageUri: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop",
  },
  {
    id: "3",
    title: "Pre-owned Books at Unbeatable Prices",
    subtitle: "Flat ₹99 on selected titles",
    cta: "Shop Now",
    bookImageUri: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&h=400&fit=crop",
  },
];

interface PromoCardProps {
  item: PromoBannerItem;
  onCtaPress?: (item: PromoBannerItem) => void;
}

const PromoCard: React.FC<PromoCardProps> = memo(({ item, onCtaPress }) => {
  const handlePress = useCallback(() => {
    onCtaPress?.(item);
  }, [item, onCtaPress]);

  return (
    <View style={styles.card}>
      {/* Full background image (resembles 2nd image banner) */}
      <Image
        source={{ uri: item.bookImageUri }}
        style={styles.backgroundImage}
        contentFit="cover"
        cachePolicy="memory-disk"
        recyclingKey={item.bookImageUri}
        transition={200}
      />

      {/* Light gradient overlay from transparent to white bottom */}
      <LinearGradient
        colors={["transparent", "rgba(255, 255, 255, 0.75)", "rgba(255, 255, 255, 0.98)"]}
        style={styles.cardOverlay}
      />

      {/* Bottom overlay text contents */}
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>

        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8} onPress={handlePress}>
          <Text style={styles.ctaText}>{item.cta}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

interface PromoBannerProps {
  banners?: PromoBannerItem[];
  onCtaPress?: (banner: PromoBannerItem) => void;
}

const PromoBanner: React.FC<PromoBannerProps> = memo(({ banners = DEFAULT_BANNERS, onCtaPress }) => {
  const activeIndexRef = useRef(0);
  const [activeDot, setActiveDot] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const currentIndexRef = useRef(0);
  const autoSlideRef = useRef<any>(null);

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0]?.index !== null && viewableItems[0]?.index !== undefined) {
      const index = viewableItems[0].index;

      currentIndexRef.current = index;
      if (activeIndexRef.current !== index) {
        activeIndexRef.current = index;
        setActiveDot(index);
      }
    }
  }).current;

  const startAutoSlide = useCallback(() => {
    if (banners.length <= 1) return;

    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }

    autoSlideRef.current = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % banners.length;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      currentIndexRef.current = nextIndex;
      if (activeIndexRef.current !== nextIndex) {
        activeIndexRef.current = nextIndex;
        setActiveDot(nextIndex);
      }
    }, 4000);
  }, [banners.length]);

  useEffect(() => {
    startAutoSlide();

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [startAutoSlide]);

  const renderCard = useCallback(
    ({ item }: { item: PromoBannerItem }) => <PromoCard item={item} onCtaPress={onCtaPress} />,
    [onCtaPress]
  );

  const keyExtractor = useCallback((item: PromoBannerItem) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_WIDTH + SPACING.md,
      offset: (CARD_WIDTH + SPACING.md) * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        scrollEventThrottle={16}
        disableIntervalMomentum
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_WIDTH + SPACING.md}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={3}
        removeClippedSubviews={true}
        onScrollBeginDrag={useCallback(() => {
          if (autoSlideRef.current) {
            clearInterval(autoSlideRef.current);
          }
        }, [])}
        onMomentumScrollEnd={startAutoSlide}
        style={styles.flatlist}
      />

      {banners.length > 1 && <PaginationDots count={banners.length} activeIndex={activeDot} />}
    </View>
  );
});

const ProgressIndicator = memo(({ active }: { active: boolean }) => {
  const progress = useSharedValue(active ? 0 : 1);
  const dotWidth = useSharedValue(active ? rem(1.5) : rem(0.5));

  useEffect(() => {
    cancelAnimation(progress);
    cancelAnimation(dotWidth);
    dotWidth.value = withTiming(active ? rem(1.5) : rem(0.5), { duration: 300 });

    if (active) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: 4000 });
    } else {
      progress.value = 0;
    }
  }, [active]);

  const trackAnimatedStyle = useAnimatedStyle(() => ({
    width: dotWidth.value,
  }));

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Animated.View style={[styles.indicatorTrack, trackAnimatedStyle]}>
      <Animated.View style={[styles.indicatorFill, fillAnimatedStyle]} />
    </Animated.View>
  );
});

const PaginationDots = memo(({ count, activeIndex }: { count: number; activeIndex: number }) => {
  return (
    <View style={styles.indicatorContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <ProgressIndicator key={index} active={index === activeIndex} />
      ))}
    </View>
  );
});

export default PromoBanner;

const styles = StyleSheet.create({
  container: {
    marginBottom: rem(0.625),
  },
  listContent: {
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    gap: SPACING.md,
  },
  card: {
    width: CARD_WIDTH,
    height: rem(13.5), // Tall vertical portrait aspect ratio (spotlight card style)
    borderRadius: rem(1.0),
    overflow: "hidden",
    position: "relative",
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  backgroundImage: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "65%",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md + 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: SPACING.xs,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
    lineHeight: rem(1.2),
  },
  cardSubtitle: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  ctaButton: {
    backgroundColor: COLORS.primary, // Brand teal background for light mode
    paddingHorizontal: rem(1.0),
    paddingVertical: rem(0.55),
    borderRadius: rem(1.5),
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.white,
  },
  flatlist: {
    paddingBottom: rem(0.25),
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: rem(0.5),
    marginTop: rem(0.625),
  },
  indicatorTrack: {
    width: rem(0.5),
    height: rem(0.1875),
    borderRadius: rem(0.09375),
    overflow: "hidden",
    backgroundColor: "rgba(0, 128, 128, 0.1)",
  },
  indicatorFill: {
    height: "100%",
    borderRadius: rem(0.09375),
    backgroundColor: COLORS.primary,
  },
});

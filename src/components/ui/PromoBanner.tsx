import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = SPACING.lg;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2;

export interface PromoBannerItem {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  bookImageUri: string;
  bgColor: string;
  bgColorLight: string;
}

const DEFAULT_BANNERS: PromoBannerItem[] = [
  {
    id: '1',
    title: 'New Exploration on Non-Fiction',
    subtitle: 'Discount 50% for first transaction',
    cta: 'Explore now',
    bookImageUri:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop',
    bgColor: '#C5D5C0',
    bgColorLight: '#DDE8D8',
  },
  {
    id: '2',
    title: 'Best Sellers This Week - Fiction & Thrillers',
    subtitle: 'Up to 40% off on top picks',
    cta: 'Browse now',
    bookImageUri:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=300&fit=crop',
    bgColor: '#B8C8D8',
    bgColorLight: '#D4E0EC',
  },
  {
    id: '3',
    title: 'Pre-owned Books at Unbeatable Prices',
    subtitle: 'Flat ₹99 on selected titles',
    cta: 'Shop now',
    bookImageUri:
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop',
    bgColor: '#D4C5B8',
    bgColorLight: '#E8DDD4',
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
    <View
      style={[
        styles.card,
        {
          backgroundColor: item.bgColor,
        },
      ]}
    >
      <View
        style={[
          styles.cardOverlay,
          {
            backgroundColor: item.bgColorLight,
            opacity: 0.5,
          },
        ]}
      />

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={3}>
          {item.title}
        </Text>

        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {item.subtitle}
        </Text>

        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.8}
          onPress={handlePress}
        >
          <Text style={styles.ctaText}>{item.cta}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bookImageContainer}>
        <Image
          source={{ uri: item.bookImageUri }}
          style={styles.bookImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={item.bookImageUri}
          transition={0}
        />
      </View>
    </View>
  );
});

interface PromoBannerProps {
  banners?: PromoBannerItem[];
  onCtaPress?: (banner: PromoBannerItem) => void;
}

const PromoBanner: React.FC<PromoBannerProps> = memo(({
  banners = DEFAULT_BANNERS,
  onCtaPress,
}) => {
  const activeIndexRef = useRef(0);
  const [activeDot, setActiveDot] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const currentIndexRef = useRef(0);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (
        viewableItems.length > 0 &&
        viewableItems[0]?.index !== null &&
        viewableItems[0]?.index !== undefined
      ) {
        const index = viewableItems[0].index;

        currentIndexRef.current = index;
        if (activeIndexRef.current !== index) {
          activeIndexRef.current = index;
          setActiveDot(index);
        }
      }
    }
  ).current;

  const startAutoSlide = useCallback(() => {
    if (banners.length <= 1) return;

    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }

    autoSlideRef.current = setInterval(() => {
      const nextIndex =
        (currentIndexRef.current + 1) % banners.length;

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
    ({ item }: { item: PromoBannerItem }) => (
      <PromoCard item={item} onCtaPress={onCtaPress} />
    ),
    [onCtaPress]
  );

  const keyExtractor = useCallback((item: PromoBannerItem) => item.id, []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: CARD_WIDTH + SPACING.md,
    offset: (CARD_WIDTH + SPACING.md) * index,
    index,
  }), []);

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
      />

      {banners.length > 1 && (
        <PaginationDots
          count={banners.length}
          activeIndex={activeDot}
        />
      )}
    </View>
  );
});
const PaginationDots = memo(
  ({ count, activeIndex }: { count: number, activeIndex: number }) => {
    return (
      <View style={styles.dotsContainer}>
        {Array.from({ length: count }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex
                ? styles.dotActive
                : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    );
  }
);

export default PromoBanner;

const styles = StyleSheet.create({
  container: {
    // marginTop: SPACING.md,
  },
  listContent: {
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    gap: SPACING.md,
  },
  card: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: 24,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '60%',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  cardContent: {
    flex: 1,
    paddingVertical: SPACING.lg - 4,
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.sm,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  cardTitle: {
    fontSize: rf(14),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
    lineHeight: 20,
  },
  cardSubtitle: {
    fontSize: rf(12),
    fontFamily: FONTS.manrope.semibold,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  ctaButton: {
    backgroundColor: COLORS.text,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md + 4,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 24,
    marginTop: SPACING.sm,
  },
  ctaText: {
    fontSize: rf(12),
    fontFamily: FONTS.montserrat.semibold,
    color: COLORS.white,
  },
  bookImageContainer: {
    width: 130,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: SPACING.md,
    paddingVertical: SPACING.md,
  },
  bookImage: {
    width: 100,
    height: 145,
    borderRadius: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    backgroundColor: COLORS.grayHeavvy,
  },
});
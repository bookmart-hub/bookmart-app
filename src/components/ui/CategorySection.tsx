import React, { memo, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
    Extrapolation,
    interpolate,
    interpolateColor,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface CategoryItem {
    id: string;
    label: string;
    imageUri: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
    {
        id: '1',
        label: 'Romance',
        imageUri:
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200',
    },
    {
        id: '2',
        label: 'Self Help',
        imageUri:
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200',
    },
    {
        id: '3',
        label: 'Science Fiction',
        imageUri:
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200',
    },
    {
        id: '4',
        label: 'Biography',
        imageUri:
            'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200',
    },
    {
        id: '5',
        label: 'Business',
        imageUri:
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200',
    },
];

const ITEM_WIDTH = 75;
const ITEM_HEIGHT = 100;
const ITEM_GAP = 10;

const SNAP_SIZE = ITEM_WIDTH + ITEM_GAP;

const SIDE_PADDING =
    (SCREEN_WIDTH - ITEM_WIDTH) / 2;

const LOOP_COPIES = 3; // Odd number, large enough for seamless looping

// ── CategoryCard ──────────────────────────────────────────────────────────────

interface CategoryCardProps {
    item: CategoryItem;
    index: number;
    scrollX: SharedValue<number>;
}

const CategoryCard = memo(({
    item,
    index,
    scrollX,
}: CategoryCardProps) => {
    const center = index * SNAP_SIZE;
    const inputRange = [
        center - SNAP_SIZE,
        center,
        center + SNAP_SIZE,
    ];

    const animatedStyle = useAnimatedStyle(() => {
        'worklet';
        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.85, 1.25, 0.85],
            Extrapolation.CLAMP
        );

        const borderColor = interpolateColor(
            scrollX.value,
            inputRange,
            [
                'transparent',
                COLORS.primary,
                'transparent',
            ]
        );

        return {
            transform: [{ scale }],
            borderColor,
        };
    });

    const labelAnimatedStyle = useAnimatedStyle(() => {
        'worklet';
        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0, 1, 0],
            Extrapolation.CLAMP
        );
        return {
            opacity,
        };
    });

    return (
        <View style={styles.itemWrapper}>
            <Animated.Text style={[styles.title, labelAnimatedStyle]} numberOfLines={1}>
                {item.label}
            </Animated.Text>
            <Animated.View
                style={[
                    styles.cardContainer,
                    animatedStyle,
                ]}
            >
                <Image
                    source={{ uri: item.imageUri }}
                    style={styles.image}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    recyclingKey={item.imageUri}
                    transition={0}
                />
            </Animated.View>
        </View>
    );
});

// ── CategorySection ───────────────────────────────────────────────────────────

interface CategorySectionProps {
    categories?: CategoryItem[];
}

const CategorySection: React.FC<
    CategorySectionProps
> = memo(({
    categories = DEFAULT_CATEGORIES,
}) => {
    const scrollX = useSharedValue(0);
    const flatListRef = useRef<any>(null);
    const N = categories.length;

    // Replicate data LOOP_COPIES times for infinite loop
    const loopedData = useMemo(() => {
        const arr = [];
        for (let c = 0; c < LOOP_COPIES; c++) {
            for (let i = 0; i < N; i++) {
                arr.push({ ...categories[i], _key: `${categories[i].id}-${c}` });
            }
        }
        return arr;
    }, [categories, N]);

    const middleCopy = Math.floor(LOOP_COPIES / 2);
    const middleStartIndex = middleCopy * N;

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            'worklet';
            scrollX.value = event.contentOffset.x;
        },
    });

    // Reset boundary on momentum end
    const handleMomentumScrollEnd = useCallback((e: any) => {
        const x = e.nativeEvent.contentOffset.x;
        const index = Math.round(x / SNAP_SIZE);
        const originalIdx = ((index % N) + N) % N;
        const newIndex = middleCopy * N + originalIdx;

        if (index < N * 2 || index > loopedData.length - N * 2) {
            flatListRef.current?.scrollToIndex({ index: newIndex, animated: false });
            scrollX.value = newIndex * SNAP_SIZE;
        }
    }, [N, middleCopy, loopedData.length]);

    // Scroll to middle copy on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            flatListRef.current?.scrollToIndex({
                index: middleStartIndex,
                animated: false,
            });
        }, 80);
        return () => clearTimeout(timer);
    }, [middleStartIndex]);

    const renderItem = useCallback(({ item, index }: any) => (
        <CategoryCard
            item={item}
            index={index}
            scrollX={scrollX}
        />
    ), [scrollX]);

    const keyExtractor = useCallback((item: any) => item._key, []);

    const getItemLayout = useCallback((_: any, index: number) => ({
        length: SNAP_SIZE,
        offset: SNAP_SIZE * index,
        index,
    }), []);

    return (
        <View style={styles.container}>
            <Animated.FlatList
                ref={flatListRef}
                horizontal
                data={loopedData}
                keyExtractor={keyExtractor}
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={SNAP_SIZE}
                bounces={false}
                scrollEventThrottle={16}
                onScroll={onScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                initialScrollIndex={middleStartIndex}
                getItemLayout={getItemLayout}
                contentContainerStyle={{
                    paddingHorizontal: SIDE_PADDING,
                    alignItems: 'center' as const,
                    columnGap: ITEM_GAP,
                }}
                renderItem={renderItem}
                initialNumToRender={3}
                maxToRenderPerBatch={2}
                windowSize={3}
                removeClippedSubviews
            />
        </View>
    );
});

export default CategorySection;

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.sm,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 20,
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
    },
    title: {
        position: 'absolute',
        top: 0,
        fontSize: 14,
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.textMuted,
        width: ITEM_WIDTH * 1.5,
        textAlign: 'center',
        zIndex: 10,
    },

    itemWrapper: {
        width: ITEM_WIDTH,
        alignItems: 'center',
        paddingTop: 30, // Space for the absolutely positioned label
    },

    cardContainer: {
        width: ITEM_WIDTH,
        marginTop: 5,
        height: ITEM_HEIGHT,
        marginBottom: 15,

        borderRadius: 10,
        overflow: 'hidden',

        borderWidth: 2,
        borderColor: 'transparent',

        padding: 5,
        backgroundColor: COLORS.background,

        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 0,
    },

    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12
    },
});
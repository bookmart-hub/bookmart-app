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
    runOnJS,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useDerivedValue,
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

const LOOP_COPIES = 11; // Odd number, large enough for seamless looping

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
            [0.88, 1.25, 0.88],
            Extrapolation.CLAMP
        );

        const translateY = 0;

        const borderWidth = interpolate(
            scrollX.value,
            inputRange,
            [0, 2, 0],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.7, 1, 0.7],
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { scale },
                { translateY },
            ],
            borderWidth,
            opacity,
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
        const translateY = interpolate(
            scrollX.value,
            inputRange,
            [8, 0, 8],
            Extrapolation.CLAMP
        );
        return {
            opacity,
            transform: [{ translateY }],
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
                    recyclingKey={item.id}
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
> = ({
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

        const jumpTo = useCallback((offset: number) => {
            flatListRef.current?.scrollToOffset({ offset, animated: false });
        }, []);

        const onScroll = useAnimatedScrollHandler({
            onScroll: (event) => {
                'worklet';
                scrollX.value = event.contentOffset.x;

                // Boundary detection — jump to middle copy silently
                const minOffset = (middleStartIndex - N) * SNAP_SIZE;
                const maxOffset = (middleStartIndex + 2 * N) * SNAP_SIZE;

                if (event.contentOffset.x < minOffset) {
                    runOnJS(jumpTo)(event.contentOffset.x + N * SNAP_SIZE);
                } else if (event.contentOffset.x >= maxOffset) {
                    runOnJS(jumpTo)(event.contentOffset.x - N * SNAP_SIZE);
                }
            },
        });

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
                <View style={styles.header}>
                    <Text style={styles.subtitle}>Categories</Text>
                </View>

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
                    initialScrollIndex={middleStartIndex}
                    getItemLayout={getItemLayout}
                    contentContainerStyle={{
                        paddingHorizontal: SIDE_PADDING,
                        alignItems: 'center' as const,
                        columnGap: ITEM_GAP,
                    }}
                    renderItem={renderItem}
                    initialNumToRender={10}
                    maxToRenderPerBatch={8}
                    windowSize={11}
                    removeClippedSubviews={Platform.OS === 'ios'}
                    updateCellsBatchingPeriod={30}
                />
            </View>
        );
    };

export default CategorySection;

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.md,
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

        borderColor: COLORS.primary,
        padding: 5,
        backgroundColor: COLORS.background,

        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,

        elevation: 4,
    },

    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12
    },
});
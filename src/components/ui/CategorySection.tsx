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

const ITEM_WIDTH = 90;
const ITEM_HEIGHT = 120;
const ITEM_GAP = 10;

const SNAP_SIZE = ITEM_WIDTH + ITEM_GAP;

const SIDE_PADDING =
    (SCREEN_WIDTH - ITEM_WIDTH) / 2;

const LOOP_COPIES = 11; // Odd number, large enough for seamless looping

const IMAGE_TRANSITION = { duration: 150, effect: 'cross-dissolve' as const };

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
            [0.82, 1.2, 0.82],
            Extrapolation.CLAMP
        );

        const translateY = interpolate(
            scrollX.value,
            inputRange,
            [8, -10, 8],
            Extrapolation.CLAMP
        );

        const borderWidth = interpolate(
            scrollX.value,
            inputRange,
            [0, 3, 0],
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

    return (
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
                transition={IMAGE_TRANSITION}
            />
        </Animated.View>
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

        // Track active label on the JS thread (only updated on scroll-end)
        const activeLabelRef = useRef(categories[0]?.label ?? '');
        const [activeLabel, setActiveLabel] = React.useState(activeLabelRef.current);

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

        // Update label only on scroll end — avoids JS re-renders during scroll
        const handleScrollEnd = useCallback((e: any) => {
            const index = Math.round(
                e.nativeEvent.contentOffset.x / SNAP_SIZE
            );
            const realIndex = ((index % N) + N) % N;
            const label = categories[realIndex]?.label ?? '';
            if (activeLabelRef.current !== label) {
                activeLabelRef.current = label;
                setActiveLabel(label);
            }
        }, [N, categories]);

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
                <Text style={styles.subtitle}>Categories</Text>
                <Text style={styles.title}>
                    {activeLabel}
                </Text>

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
                    onMomentumScrollEnd={handleScrollEnd}
                    onScrollEndDrag={handleScrollEnd}
                    renderItem={renderItem}
                    initialNumToRender={7}
                    maxToRenderPerBatch={5}
                    windowSize={7}
                    removeClippedSubviews={Platform.OS === 'ios'}
                    updateCellsBatchingPeriod={50}
                />
            </View>
        );
    };

export default CategorySection;

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.sm,
    },

    subtitle: {
        fontSize: 20,
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.text,
        marginRight: SPACING.sm,
        marginLeft: SPACING.md + 10,
    },

    title: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily:
            FONTS.montserrat.semibold,

        color: COLORS.text,
    },

    cardContainer: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,

        borderRadius: 12,
        overflow: 'hidden',

        borderColor: COLORS.primary,
        padding: 5,
        marginTop: 30,
        backgroundColor: COLORS.background,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,

        elevation: 5,
    },

    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10
    },
});
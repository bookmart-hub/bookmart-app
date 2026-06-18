import React, { memo, useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    View,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

import { CATEGORIES_LIST, CategoryItem } from '@/data/categoryMockData';
import { rf } from '@/utils/responsive';

const ITEM_WIDTH = 75;
const ITEM_HEIGHT = 100;
const ITEM_GAP = 0;

const SNAP_SIZE = ITEM_WIDTH + ITEM_GAP;

// Fix layout issue: dynamically center the cards
const SIDE_PADDING = (SCREEN_WIDTH - SNAP_SIZE) / 2;

const LOOP_COPIES = 3; // Create infinite loop illusion

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExtendedCategoryItem extends CategoryItem {
    uniqueId: string;
}

// ── CategoryCard ──────────────────────────────────────────────────────────────

interface CategoryCardProps {
    item: ExtendedCategoryItem;
    index: number;
    scrollX: SharedValue<number>;
    onPress: (item: ExtendedCategoryItem) => void;
}

const CategoryCard = memo(
    ({
        item,
        index,
        scrollX,
        onPress,
    }: CategoryCardProps) => {
        const handlePress = useCallback(() => {
            onPress(item);
        }, [item, onPress]);

        const animatedStyle = useAnimatedStyle(() => {
            const centerPosition = index * SNAP_SIZE;

            const scale = interpolate(
                scrollX.value,
                [
                    centerPosition - SNAP_SIZE,
                    centerPosition,
                    centerPosition + SNAP_SIZE,
                ],
                [0.85, 1.18, 0.85],
                Extrapolation.CLAMP
            );

            const borderColor = interpolateColor(
                scrollX.value,
                [
                    centerPosition - SNAP_SIZE,
                    centerPosition,
                    centerPosition + SNAP_SIZE,
                ],
                ['transparent', COLORS.primary, 'transparent']
            );

            return {
                transform: [{ scale }],
                borderColor,
            };
        });

        const titleStyle = useAnimatedStyle(() => {
            const centerPosition = index * SNAP_SIZE;

            const opacity = interpolate(
                scrollX.value,
                [
                    centerPosition - SNAP_SIZE / 2,
                    centerPosition,
                    centerPosition + SNAP_SIZE / 2,
                ],
                [0, 1, 0],
                Extrapolation.CLAMP
            );

            return { opacity };
        });

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.itemWrapper}
                onPress={handlePress}
            >
                <Animated.Text
                    numberOfLines={1}
                    style={[
                        styles.title,
                        titleStyle,
                    ]}
                >
                    {item.label}
                </Animated.Text>

                <Animated.View style={[styles.cardContainer, animatedStyle]}>
                    <Image
                        source={{ uri: item.imageUri }}
                        style={styles.image}
                        contentFit="cover"
                        transition={0}
                        cachePolicy="memory-disk"
                    />
                </Animated.View>
            </TouchableOpacity>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.item.uniqueId ===
            nextProps.item.uniqueId &&
            prevProps.index ===
            nextProps.index &&
            prevProps.scrollX ===
            nextProps.scrollX &&
            prevProps.onPress ===
            nextProps.onPress
        );
    }
);

// ── CategorySection ───────────────────────────────────────────────────────────

interface CategorySectionProps {
    categories?: CategoryItem[];
}

const CategorySection = memo(
    ({ categories = CATEGORIES_LIST }: CategorySectionProps) => {
        const navigation = useNavigation<any>();
        const flatListRef = useRef<any>(null);

        const loopedData = useMemo(() => {
            return Array.from(
                { length: LOOP_COPIES },
                (_, copyIndex) =>
                    categories.map((item) => ({
                        ...item,
                        uniqueId: `${copyIndex}-${item.id}`,
                    }))
            ).flat();
        }, [categories]);

        const middleIndex =
            Math.floor(LOOP_COPIES / 2) *
            categories.length;

        const scrollX = useSharedValue(0);

        useEffect(() => {
            requestAnimationFrame(() => {
                flatListRef.current?.scrollToIndex({
                    index: middleIndex,
                    animated: false,
                });

                scrollX.value =
                    middleIndex * SNAP_SIZE;
            });
        }, [middleIndex]);

        const onScroll =
            useAnimatedScrollHandler({
                onScroll: (event) => {
                    scrollX.value =
                        event.contentOffset.x;
                },
            });

        const handleMomentumEnd =
            useCallback(
                (event: any) => {
                    const x =
                        event.nativeEvent
                            .contentOffset.x;

                    const index =
                        Math.round(
                            x / SNAP_SIZE
                        );


                    const total =
                        categories.length;

                    if (index < total) {
                        const newIndex =
                            index + total;

                        flatListRef.current?.scrollToIndex({
                            index: newIndex,
                            animated: false,
                        });

                        scrollX.value =
                            newIndex *
                            SNAP_SIZE;
                    }

                    if (
                        index >= total * 2
                    ) {
                        const newIndex =
                            index - total;

                        flatListRef.current?.scrollToIndex({
                            index: newIndex,
                            animated: false,
                        });

                        scrollX.value =
                            newIndex *
                            SNAP_SIZE;
                    }
                },
                [categories.length]
            );

        const handlePress =
            useCallback(
                (
                    item: ExtendedCategoryItem
                ) => {
                    navigation.navigate(
                        'AppStack',
                        {
                            screen:
                                item.screenName ||
                                'ScinceFinction',
                        }
                    );
                },
                [navigation]
            );

        const renderItem =
            useCallback(
                ({
                    item,
                    index,
                }: {
                    item: ExtendedCategoryItem;
                    index: number;
                }) => (
                    <CategoryCard
                        item={item}
                        index={index}
                        scrollX={scrollX}
                        onPress={
                            handlePress
                        }
                    />
                ),
                [
                    handlePress,
                    scrollX,
                ]
            );

        return (
            <View style={styles.container}>
                <Animated.FlatList
                    ref={flatListRef}
                    horizontal
                    data={loopedData}
                    renderItem={renderItem}
                    keyExtractor={(item) =>
                        item.uniqueId
                    }
                    showsHorizontalScrollIndicator={
                        false
                    }
                    snapToInterval={
                        SNAP_SIZE
                    }
                    decelerationRate="fast"
                    bounces={false}
                    onScroll={onScroll}
                    onMomentumScrollEnd={
                        handleMomentumEnd
                    }
                    scrollEventThrottle={
                        16
                    }
                    contentContainerStyle={{
                        paddingHorizontal:
                            SIDE_PADDING,
                    }}
                    getItemLayout={(
                        _,
                        index
                    ) => ({
                        length:
                            SNAP_SIZE,
                        offset:
                            SNAP_SIZE *
                            index,
                        index,
                    })}
                    initialNumToRender={
                        8
                    }
                    maxToRenderPerBatch={
                        8
                    }
                    windowSize={5}
                    removeClippedSubviews={
                        false
                    }
                />
            </View>
        );
    }
);

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
        fontSize: rf(20),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
    },
    title: {
        position: 'absolute',
        top: 0,
        fontSize: rf(12),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.textMuted,
        width: ITEM_WIDTH * 1.5,
        textAlign: 'center',
        zIndex: 10,
        lineHeight: rf(12),
    },
    itemWrapper: {
        width: SNAP_SIZE,
        alignItems: 'center',
        paddingTop: 10,
    },
    cardContainer: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        backgroundColor: COLORS.background,
        padding: 4,
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        marginBottom: 10,
        marginTop: 14,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
});
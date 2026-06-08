import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthorItem {
    id: string;
    name: string;
    photoUri: string;
    bio?: string;
    rating?: number; // 0-5
}

// ── Sample data ───────────────────────────────────────────────────────────────

const DEFAULT_AUTHORS: AuthorItem[] = [
    {
        id: '1',
        name: 'Rabindranath Thakur',
        photoUri:
            'https://plus.unsplash.com/premium_photo-1678337928702-3ca9cdf81122?q=80&w=402&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        bio: 'Nobel Prize-winning Bengali polymath who revolutionized literature, music, and cultural thought.',
        rating: 5,
    },
    {
        id: '2',
        name: 'Satyajit Ray',
        photoUri:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREEIv5y-hQrhYN5sNmCtkWB-cfiy1mv4TtBxXm9cffGB-jJ_BhCeelnJl0TZ3Vf0tbdc3t20MaJpdSI1DWTc-ST5qCfGHxBJdZ5S0OeA&s=10',
        bio: 'Internationally acclaimed filmmaker and author celebrated for masterful storytelling and cinematic excellence.',
        rating: 5,
    },
    {
        id: '3',
        name: 'Bibhutibhusan Bandyopadhyay',
        photoUri:
            'https://upload.wikimedia.org/wikipedia/commons/f/f8/Bibhutibhushan_Bandopadhyay.jpg',
        bio: "Renowned novelist whose works beautifully portrayed rural Bengal, nature, and humanity.",
        rating: 5,
    },
    {
        id: '4',
        name: 'Bankim Chandra Chattopadhyay',
        photoUri:
            'https://www.sahapedia.org/sites/default/files/styles/sp_inline_images/public/inline-images/Bankim%20Chandra%20Chattopadhyay_Wikimedia%20Commons_0.jpg?itok=ud8o9B0n',
        bio: 'Influential novelist best known for Anandamath and the song Vande Mataram.',
        rating: 5,
    },
    {
        id: '5',
        name: 'Sarat Chandra Chattopadhyay',
        photoUri:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbeFEoT9pdFhMC5zkegpfozc5GR7Doxl6x-fjpOd0tAm3GY6k4Hzl3h7cKy98cOlG1KJk1m66KaxE6lk9d_qkl1JJGJZRXgQvLrsKnmt0&s=10',
        bio: 'Beloved novelist exploring human emotions, relationships, and societal challenges with sensitivity.',
        rating: 5,
    },
    {
        id: '6',
        name: 'Jibanananda Das',
        photoUri:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Jibanananda_Das_%281899%E2%80%931954%29.jpg/250px-Jibanananda_Das_%281899%E2%80%931954%29.jpg',
        bio: 'Celebrated modern poet known for lyrical depth, nature imagery, and introspection.',
        rating: 5,
    },
    {
        id: '7',
        name: 'Kazi Nazrul Islam',
        photoUri:
            'https://d18x2uyjeekruj.cloudfront.net/wp-content/uploads/2023/11/kazi-islam.jpg',
        bio: 'Rebel Poet, revolutionary writer and composer advocating freedom, equality, and justice.',
        rating: 5,
    },
    {
        id: '8',
        name: 'Samaresh Majumdar',
        photoUri:
            'https://cafedissensuseveryday.com/wp-content/uploads/2023/05/samaresh-majumdar-370x300-1.jpg',
        bio: 'Acclaimed novelist portraying social realities, youth struggles, and political complexities.',
        rating: 5,
    },
    {
        id: '9',
        name: 'Michael modhusudhon dutt',
        photoUri:
            'https://upload.wikimedia.org/wikipedia/commons/a/a8/Michael_Madhusudan_Dutta.jpg',
        bio: 'Pioneer of modern Bengali poetry, renowned for Meghnad Badh Kavya.',
        rating: 5,
    },
];

// ── Layout constants ──────────────────────────────────────────────────────────

const HORIZONTAL_PADDING = SPACING.lg; // 24
const COLLAPSED_WIDTH = 100;
const ITEM_GAP = 10;

const SNAP_INTERVAL = SCREEN_WIDTH - HORIZONTAL_PADDING - COLLAPSED_WIDTH;
const EXPANDED_WIDTH = SNAP_INTERVAL - ITEM_GAP;
const PHOTO_SIZE = COLLAPSED_WIDTH;
const CARD_HEIGHT = 150;

const LOOP_COPIES = 15;

// ── Module-scoped animation configs (never re-created) ────────────────────────

const SPRING_CONFIG = {
    damping: 20,
    stiffness: 160,
    mass: 0.6,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
} as const;

const WIDTH_SPRING = {
    damping: 22,
    stiffness: 180,
    mass: 0.5,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
} as const;

const REVEAL_NAME = {
    duration: 200,
    easing: Easing.out(Easing.cubic),
} as const;

const REVEAL_BIO = {
    duration: 260,
    easing: Easing.out(Easing.cubic),
} as const;

const REVEAL_STARS = {
    duration: 320,
    easing: Easing.out(Easing.cubic),
} as const;

// ── Star rating ───────────────────────────────────────────────────────────────

const StarRating: React.FC<{ rating: number }> = memo(({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <Text
                key={i}
                style={[
                    styles.star,
                    i <= rating ? styles.starFilled : styles.starEmpty,
                ]}
            >
                ★
            </Text>
        );
    }
    return <View style={styles.starRow}>{stars}</View>;
});

// ── AuthorCard ────────────────────────────────────────────────────────────────

interface AuthorCardProps {
    item: AuthorItem;
    index: number;
    scrollX: SharedValue<number>;
    onPress?: (item: AuthorItem) => void;
}

const AuthorCard: React.FC<AuthorCardProps> = memo(
    ({ item, index, scrollX, onPress }) => {
        const center = index * SNAP_INTERVAL;
        const inputRange = [
            center - SNAP_INTERVAL,
            center,
            center + SNAP_INTERVAL,
        ] as const;

        const handlePress = useCallback(() => {
            onPress?.(item);
        }, [item, onPress]);

        // ── Optimized Inline Animated Styles (0 useDerivedValue hooks!) ──────────

        const containerStyle = useAnimatedStyle(() => {
            'worklet';
            const progress = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
            const activeProgress = interpolate(progress, [0.3, 0.7], [0, 1], Extrapolation.CLAMP);

            const widthVal = interpolate(activeProgress, [0, 1], [COLLAPSED_WIDTH, EXPANDED_WIDTH]);
            const scaleVal = interpolate(activeProgress, [0, 1], [0.93, 1]);

            return {
                width: withSpring(widthVal, WIDTH_SPRING),
                transform: [{ scale: withSpring(scaleVal, SPRING_CONFIG) }],
            };
        });

        const nameStyle = useAnimatedStyle(() => {
            'worklet';
            const progress = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
            const activeProgress = interpolate(progress, [0.3, 0.7], [0, 1], Extrapolation.CLAMP);
            const active = activeProgress > 0.45;

            return {
                opacity: withTiming(active ? 1 : 0, REVEAL_NAME),
                transform: [{ translateX: withSpring(active ? 0 : -10, SPRING_CONFIG) }],
            };
        });

        const bioStyle = useAnimatedStyle(() => {
            'worklet';
            const progress = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
            const activeProgress = interpolate(progress, [0.3, 0.7], [0, 1], Extrapolation.CLAMP);
            const active = activeProgress > 0.55;

            return {
                opacity: withTiming(active ? 1 : 0, REVEAL_BIO),
                transform: [{ translateX: withSpring(active ? 0 : -8, SPRING_CONFIG) }],
            };
        });

        const starsStyle = useAnimatedStyle(() => {
            'worklet';
            const progress = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
            const activeProgress = interpolate(progress, [0.3, 0.7], [0, 1], Extrapolation.CLAMP);
            const active = activeProgress > 0.65;

            return {
                opacity: withTiming(active ? 1 : 0, REVEAL_STARS),
                transform: [{ scale: withSpring(active ? 1 : 0.5, SPRING_CONFIG) }],
            };
        });

        return (
            <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
                {/* Fixed-width slot ── FlatList always sees this constant width */}
                <View style={styles.slot}>
                    <Animated.View style={[styles.card, containerStyle]}>
                        {/* Author photo ── always visible */}
                        <View style={styles.photoWrap}>
                            <Image
                                source={{ uri: item.photoUri }}
                                style={styles.photo}
                                contentFit="cover"
                                recyclingKey={item.photoUri}
                                cachePolicy="memory-disk"
                                placeholderContentFit="cover"
                            />
                        </View>

                        {/* Details ── staggered reveal: Name → Bio → Stars */}
                        <View style={styles.details}>
                            <Animated.Text
                                style={[styles.authorName, nameStyle]}
                                numberOfLines={2}
                            >
                                {item.name}
                            </Animated.Text>

                            {item.bio ? (
                                <Animated.Text
                                    style={[styles.authorBio, bioStyle]}
                                    numberOfLines={6}
                                >
                                    {item.bio}
                                </Animated.Text>
                            ) : null}

                            {item.rating != null && item.rating > 0 ? (
                                <Animated.View style={starsStyle}>
                                    <StarRating rating={item.rating} />
                                </Animated.View>
                            ) : null}
                        </View>
                    </Animated.View>
                </View>
            </TouchableOpacity>
        );
    }
);

// ── AuthorsSection ────────────────────────────────────────────────────────────

export interface AuthorsSectionProps {
    authors?: AuthorItem[];
    onAuthorPress?: (author: AuthorItem) => void;
    onSeeAllPress?: () => void;
}

const AuthorsSection: React.FC<AuthorsSectionProps> = memo(({
    authors = DEFAULT_AUTHORS,
    onAuthorPress,
    onSeeAllPress,
}) => {
    const listRef = useRef<any>(null);
    const scrollX = useSharedValue(0);
    const N = authors.length;

    // Replicate data for infinite loop
    const loopedData = useMemo(() => {
        const arr: Array<AuthorItem & { _key: string }> = [];
        for (let c = 0; c < LOOP_COPIES; c++) {
            for (let i = 0; i < N; i++) {
                arr.push({ ...authors[i], _key: `${authors[i].id}-${c}` });
            }
        }
        return arr;
    }, [authors, N]);

    const middleCopy = Math.floor(LOOP_COPIES / 2);
    const middleStartIndex = middleCopy * N;

    // Scroll to middle on mount
    useEffect(() => {
        if (N > 0 && listRef.current) {
            const timer = setTimeout(() => {
                listRef.current?.scrollToIndex({
                    index: middleStartIndex,
                    animated: false,
                });
            }, 80);
            return () => clearTimeout(timer);
        }
    }, [middleStartIndex, N]);

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            'worklet';
            scrollX.value = event.contentOffset.x;
        },
    });

    // Reset to middle copy on momentum end near boundaries
    const handleMomentumScrollEnd = useCallback((e: any) => {
        const x = e.nativeEvent.contentOffset.x;
        const index = Math.round(x / SNAP_INTERVAL);
        const originalIdx = ((index % N) + N) % N;
        const newIndex = middleCopy * N + originalIdx;

        if (index < N * 2 || index > loopedData.length - N * 2) {
            listRef.current?.scrollToIndex({ index: newIndex, animated: false });
            scrollX.value = newIndex * SNAP_INTERVAL;
        }
    }, [N, middleCopy, loopedData.length]);

    const renderItem = useCallback(
        ({ item, index }: { item: AuthorItem & { _key: string }; index: number }) => (
            <AuthorCard
                item={item}
                index={index}
                scrollX={scrollX}
                onPress={onAuthorPress}
            />
        ),
        [scrollX, onAuthorPress]
    );

    const keyExtractor = useCallback((item: any) => item._key, []);

    const getItemLayout = useCallback(
        (_: any, index: number) => ({
            length: SNAP_INTERVAL,
            offset: SNAP_INTERVAL * index,
            index,
        }),
        []
    );

    return (
        <View style={styles.section}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Authors</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={onSeeAllPress}>
                    <Text style={styles.headerLink}>see all</Text>
                </TouchableOpacity>
            </View>

            {/* ── Infinite loop carousel ── */}
            <Animated.FlatList
                ref={listRef}
                horizontal
                data={loopedData}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                getItemLayout={getItemLayout}
                onScroll={onScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                scrollEventThrottle={16}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                bounces={false}
                initialNumToRender={3}
                maxToRenderPerBatch={2}
                windowSize={5}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={40}
            />
        </View>
    );
});

export default AuthorsSection;

// ── Styles ────────────────────────────────────────────────────────────────────

const CARD_BG = COLORS.text;

const styles = StyleSheet.create({
    section: {
        marginTop: SPACING.md,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: HORIZONTAL_PADDING,
        marginBottom: SPACING.sm,
    },
    headerTitle: {
        fontSize: rf(20),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
    },
    headerLink: {
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.primary,
    },

    // ── List ──
    listContent: {
        paddingLeft: HORIZONTAL_PADDING,
        paddingVertical: 4,
        // paddingRight is applied inline (depends on data length)
    },

    // ── Fixed-width slot ── every item occupies exactly SNAP_INTERVAL ──
    slot: {
        width: SNAP_INTERVAL,
        height: CARD_HEIGHT,
    },

    // ── Card (animated width inside the fixed slot) ──
    card: {
        height: CARD_HEIGHT,
        backgroundColor: CARD_BG,
        borderRadius: 16,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
    },

    // ── Photo ──
    photoWrap: {
        width: PHOTO_SIZE,
        height: '100%',
    },
    photo: {
        width: '100%',
        height: '100%',
    },

    // ── Details column ──
    details: {
        width: EXPANDED_WIDTH - PHOTO_SIZE,
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: 'center',
    },
    authorName: {
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.white,
        marginBottom: 6,
    },
    authorBio: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.light,
        color: 'rgba(255,255,255,0.78)',
        lineHeight: 15,
        marginBottom: 8,
    },

    // ── Star rating ──
    starRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    star: {
        fontSize: rf(15),
    },
    starFilled: {
        color: COLORS.yellow,
    },
    starEmpty: {
        color: COLORS.textMuted,
    },
});

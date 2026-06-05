import React, { memo, useCallback, useMemo, useRef } from 'react';
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
    withTiming,
    useDerivedValue,
    Easing,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';

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
//
//  Viewport at any snap position:
//
//  |<- PAD ->|<------- EXPANDED_WIDTH ------->|<- GAP ->|<- COLLAPSED ->|
//  |  24px   |        active card              |  10px   |  100px peek   |
//  |<----------------------- SCREEN_WIDTH -------------------------------->|
//
//  SNAP_INTERVAL = one slot width = EXPANDED_WIDTH + GAP
//                = SCREEN_WIDTH - PAD - COLLAPSED_WIDTH
//
//  Last-card fix: paddingRight on the content container =
//      SCREEN_WIDTH - HORIZONTAL_PADDING - SNAP_INTERVAL
//  This ensures the last item can scroll to its full snap position
//  and still expand to EXPANDED_WIDTH without clipping.
// ──────────────────────────────────────────────────────────────────────────────

const HORIZONTAL_PADDING = SPACING.lg; // 24
const COLLAPSED_WIDTH = 100;
const ITEM_GAP = 10;

const SNAP_INTERVAL = SCREEN_WIDTH - HORIZONTAL_PADDING - COLLAPSED_WIDTH;
const EXPANDED_WIDTH = SNAP_INTERVAL - ITEM_GAP;
const PHOTO_SIZE = COLLAPSED_WIDTH;
const CARD_HEIGHT = 150;

// Right-side trailing space so the last card can snap and expand fully
const TRAILING_SPACE = SCREEN_WIDTH - HORIZONTAL_PADDING - SNAP_INTERVAL;

// ── Module-scoped animation configs (never re-created) ────────────────────────

const TIMING_WIDTH = {
    duration: 260,
    easing: Easing.out(Easing.cubic),
} as const;

const TIMING_REVEAL = {
    duration: 240,
    easing: Easing.out(Easing.cubic),
} as const;

const TIMING_FAST = {
    duration: 160,
    easing: Easing.out(Easing.cubic),
} as const;

// expo-image transition — prevents flash/blink when images load
const IMAGE_TRANSITION = { duration: 200, effect: 'cross-dissolve' as const };

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
    onPress?: () => void;
}

const AuthorCard: React.FC<AuthorCardProps> = memo(
    ({ item, index, scrollX, onPress }) => {
        // Input range for this card's scroll position
        const center = index * SNAP_INTERVAL;
        const inputRange = [
            center - SNAP_INTERVAL,
            center,
            center + SNAP_INTERVAL,
        ] as const;

        // Raw progress: peaks at 1.0 when card is at the snap position
        const progress = useDerivedValue(() => {
            'worklet';
            return interpolate(
                scrollX.value,
                inputRange,
                [0, 1, 0],
                Extrapolation.CLAMP
            );
        });

        // Smooth activation ramp — no binary pop
        const activeProgress = useDerivedValue(() => {
            'worklet';
            return interpolate(
                progress.value,
                [0.35, 0.65],
                [0, 1],
                Extrapolation.CLAMP
            );
        });

        // ── Derived animation values (UI thread only) ─────────────────────

        const animatedWidth = useDerivedValue(() => {
            'worklet';
            return withTiming(
                interpolate(
                    activeProgress.value,
                    [0, 1],
                    [COLLAPSED_WIDTH, EXPANDED_WIDTH]
                ),
                TIMING_WIDTH
            );
        });

        const animatedDetailsOpacity = useDerivedValue(() => {
            'worklet';
            return withTiming(
                activeProgress.value > 0.5 ? 1 : 0,
                TIMING_REVEAL
            );
        });

        const animatedDetailsX = useDerivedValue(() => {
            'worklet';
            return withTiming(
                activeProgress.value > 0.5 ? 0 : -6,
                TIMING_FAST
            );
        });

        const animatedScale = useDerivedValue(() => {
            'worklet';
            return withTiming(
                interpolate(activeProgress.value, [0, 1], [0.94, 1]),
                TIMING_FAST
            );
        });

        // ── Animated styles (read-only from derived values) ───────────────

        const containerStyle = useAnimatedStyle(() => {
            'worklet';
            return {
                width: animatedWidth.value,
                transform: [{ scale: animatedScale.value }],
            };
        });

        const detailsStyle = useAnimatedStyle(() => {
            'worklet';
            return {
                opacity: animatedDetailsOpacity.value,
                transform: [{ translateX: animatedDetailsX.value }],
            };
        });

        return (
            <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
                {/* Fixed-width slot — FlatList always sees this constant width */}
                <View style={styles.slot}>
                    <Animated.View style={[styles.card, containerStyle]}>
                        {/* Author photo — always visible */}
                        <View style={styles.photoWrap}>
                            <Image
                                source={{ uri: item.photoUri }}
                                style={styles.photo}
                                contentFit="cover"
                                recyclingKey={item.id}
                                cachePolicy="memory-disk"
                                transition={IMAGE_TRANSITION}
                                placeholderContentFit="cover"
                            />
                        </View>

                        {/* Details — visible when active */}
                        <Animated.View style={[styles.details, detailsStyle]}>
                            <Text style={styles.authorName} numberOfLines={2}>
                                {item.name}
                            </Text>

                            {item.bio ? (
                                <Text style={styles.authorBio} numberOfLines={6}>
                                    {item.bio}
                                </Text>
                            ) : null}

                            {item.rating != null && item.rating > 0 ? (
                                <StarRating rating={item.rating} />
                            ) : null}
                        </Animated.View>
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

const AuthorsSection: React.FC<AuthorsSectionProps> = ({
    authors = DEFAULT_AUTHORS,
    onAuthorPress,
    onSeeAllPress,
}) => {
    const scrollX = useSharedValue(0);

    const onAuthorPressRef = useRef(onAuthorPress);
    onAuthorPressRef.current = onAuthorPress;

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            'worklet';
            scrollX.value = event.contentOffset.x;
        },
    });

    const renderItem = useCallback(
        ({ item, index }: { item: AuthorItem; index: number }) => (
            <AuthorCard
                item={item}
                index={index}
                scrollX={scrollX}
                onPress={() => onAuthorPressRef.current?.(item)}
            />
        ),
        [scrollX]
    );

    const keyExtractor = useCallback((item: AuthorItem) => item.id, []);

    const getItemLayout = useCallback(
        (_: any, index: number) => ({
            length: SNAP_INTERVAL,
            offset: SNAP_INTERVAL * index,
            index,
        }),
        []
    );

    // Compute snap offsets so every card including the last one gets a proper
    // snap position. snapToInterval doesn't account for trailing padding, but
    // snapToOffsets does — each offset = index * SNAP_INTERVAL.
    const snapOffsets = useMemo(
        () => authors.map((_, i) => i * SNAP_INTERVAL),
        [authors]
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

            {/* ── Carousel ── */}
            <Animated.FlatList
                horizontal
                data={authors}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                    styles.listContent,
                    // Trailing space lets the last item reach its snap position
                    // and expand fully without the FlatList bouncing back
                    { paddingRight: TRAILING_SPACE },
                ]}
                getItemLayout={getItemLayout}
                onScroll={onScroll}
                scrollEventThrottle={16}
                // snapToOffsets is more reliable than snapToInterval when
                // trailing padding is involved — each offset is explicit
                snapToOffsets={snapOffsets}
                decelerationRate="fast"
                bounces={false}
                // Performance tuning
                initialNumToRender={3}
                maxToRenderPerBatch={3}
                windowSize={5}
                // Avoid removeClippedSubviews on Android — it can cause
                // image blink/flash when views are re-attached during fast scroll
                removeClippedSubviews={Platform.OS === 'ios'}
                updateCellsBatchingPeriod={50}
            />
        </View>
    );
};

export default AuthorsSection;

// ── Styles ────────────────────────────────────────────────────────────────────

const CARD_BG = '#3a3a3a';

const styles = StyleSheet.create({
    section: {
        marginTop: SPACING.md,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: HORIZONTAL_PADDING + 4,
        marginBottom: SPACING.sm + 4,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.text,
    },
    headerLink: {
        fontSize: 14,
        fontFamily: FONTS.montserrat.medium,
        color: COLORS.primary,
    },

    // ── List ──
    listContent: {
        paddingLeft: HORIZONTAL_PADDING,
        paddingVertical: 4,
        // paddingRight is applied inline (depends on data length)
    },

    // ── Fixed-width slot — every item occupies exactly SNAP_INTERVAL ──
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
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: 'center',
    },
    authorName: {
        fontSize: 17,
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.white,
        marginBottom: 6,
    },
    authorBio: {
        fontSize: 11,
        fontFamily: FONTS.manrope.regular,
        color: 'rgba(255,255,255,0.78)',
        lineHeight: 15,
        marginBottom: 8,
    },

    // ── Star rating ──
    starRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    star: {
        fontSize: 16,
    },
    starFilled: {
        color: '#F5C518',
    },
    starEmpty: {
        color: 'rgba(255,255,255,0.25)',
    },
});

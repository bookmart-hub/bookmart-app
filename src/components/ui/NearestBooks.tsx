import React from 'react';
import {
    Dimensions,
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
    useDerivedValue
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NearestBookItem {
    id: string;
    title: string;
    author: string;
    price: number;
    coverUri: string;
    condition: string;
    distance: string;
    description?: string;
    sellerAvatarUri?: string;
}

// ── Sample data ───────────────────────────────────────────────────────────────

const DEFAULT_BOOKS: NearestBookItem[] = [
    {
        id: '1',
        title: 'Ikigai',
        author: 'Hector Garcia...',
        price: 160,
        coverUri:
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop',
        condition: 'Good Condition',
        distance: '5km',
        description: 'This book teaches me many things',
        sellerAvatarUri:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face',
    },
    {
        id: '2',
        title: 'Rich Dad Poor Dad',
        author: 'Robert T. Kiyosaki',
        price: 199,
        coverUri:
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=440&fit=crop',
        condition: 'Like New',
        distance: '3km',
        description: 'Great financial literacy book',
        sellerAvatarUri:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
    },
    {
        id: '3',
        title: 'Atomic Habits',
        author: 'James Clear',
        price: 220,
        coverUri:
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop',
        condition: 'Good Condition',
        distance: '8km',
        description: 'Changed my daily routine completely',
        sellerAvatarUri:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
    },
    {
        id: '4',
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        price: 180,
        coverUri:
            'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop',
        condition: 'Acceptable',
        distance: '2km',
    },
];

// ── Layout constants ──────────────────────────────────────────────────────────

const CARD_WIDTH = SCREEN_WIDTH * 0.44;
const ITEM_GAP = 12;
const SNAP_INTERVAL = CARD_WIDTH + ITEM_GAP;
const HORIZONTAL_PADDING = SPACING.lg;

const COVER_FLOAT = 25;           // how far the cover floats above the white card
const COVER_HEIGHT_ACTIVE = 220;  // cover height when featured
const COVER_HEIGHT_IDLE = 210;    // cover height when compact
const DETAILS_HEIGHT = 138;       // text block height when fully expanded

// ── BookCard (per-item, scroll-driven animations) ─────────────────────────────

interface BookCardProps {
    item: NearestBookItem;
    index: number;
    scrollX: SharedValue<number>;
    onPress?: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ item, index, scrollX, onPress }) => {
    const center = index * SNAP_INTERVAL;
    const prev = (index - 1) * SNAP_INTERVAL;
    const next = (index + 1) * SNAP_INTERVAL;
    const range = [prev, center, next];

    // ── Whole card ──
    const cardAnimStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            scrollX.value,
            [prev, center, next],
            [10, -2, 10],
            Extrapolation.CLAMP
        );
        return { transform: [{ translateY }] };
    });

    // ── White card background ──
    const bgAnimStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollX.value,
            range,
            [0, 1, 0],
            Extrapolation.CLAMP
        );

        const scale = interpolate(
            scrollX.value,
            range,
            [0.95, 1, 0.95],
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [{ scale }],
        };
    });

    // ── Cover image ──
    const coverAnimStyle = useAnimatedStyle(() => {
        const height = interpolate(
            scrollX.value, range,
            [COVER_HEIGHT_IDLE, COVER_HEIGHT_ACTIVE, COVER_HEIGHT_IDLE],
            Extrapolation.CLAMP,
        );
        const translateY = interpolate(scrollX.value, range, [0, -COVER_FLOAT, 0], Extrapolation.CLAMP);
        const borderRadius = interpolate(scrollX.value, range, [12, 14, 12], Extrapolation.CLAMP);

        return { height, borderRadius, transform: [{ translateY }] };
    });

    // ── Details block ──
    const progress = useDerivedValue(() => {
        return interpolate(
            scrollX.value,
            range,
            [0, 1, 0],
            Extrapolation.CLAMP
        );
    });

    const detailsAnimStyle = useAnimatedStyle(() => {
        const maxHeight = interpolate(
            progress.value,
            [0, 1],
            [0, DETAILS_HEIGHT],
            Extrapolation.CLAMP
        );

        return {
            maxHeight,
        };
    });

    const titleAnimStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            progress.value,
            [0, 0.4, 0.55],
            [0, 0, 1],
            Extrapolation.CLAMP
        );

        return { opacity };
    });

    const authorAnimStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            progress.value,
            [0.25, 0.55, 0.7],
            [0, 0, 1],
            Extrapolation.CLAMP
        );

        return { opacity };
    });

    const sellerAnimStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            progress.value,
            [0.5, 0.75, 0.9],
            [0, 0, 1],
            Extrapolation.CLAMP
        );

        return { opacity };
    });

    const metaAnimStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            progress.value,
            [0.75, 0.95, 1],
            [0, 0, 1],
            Extrapolation.CLAMP
        );

        return { opacity };
    });

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={styles.slot}
        >
            <Animated.View style={[styles.cardRoot, cardAnimStyle]}>
                {/* White bg card – only visible when featured */}
                <Animated.View style={[styles.whiteBg, bgAnimStyle]} />

                {/* Book cover – floats above the card when featured */}
                <Animated.View style={[styles.coverWrap, coverAnimStyle]}>
                    <Image
                        source={{ uri: item.coverUri }}
                        style={styles.coverImg}
                        contentFit="cover"
                        recyclingKey={item.id}
                    />
                </Animated.View>

                {/* Details – expand/collapse with scroll */}
                <Animated.View style={[styles.details, detailsAnimStyle]}>
                    {/* Title + price */}
                    <Animated.View style={titleAnimStyle}>
                        <View style={styles.titleRow}>
                            <Text style={styles.titleText} numberOfLines={1}>
                                {item.title}
                            </Text>
                            <Text style={styles.priceText}>₹ {item.price}</Text>
                        </View>
                    </Animated.View>

                    {/* Author */}
                    <Animated.View style={authorAnimStyle}>
                        <Text style={styles.authorText} numberOfLines={1}>
                            {item.author}
                        </Text>
                    </Animated.View>
                    {/* Seller info */}
                    {item.sellerAvatarUri && item.description ? (
                        <Animated.View style={sellerAnimStyle}>
                            <View style={styles.sellerRow}>
                                <Image
                                    source={{ uri: item.sellerAvatarUri }}
                                    style={styles.sellerAvatar}
                                    contentFit="cover"
                                />
                                <Text style={styles.sellerDesc} numberOfLines={2}>
                                    {item.description}
                                </Text>
                            </View>
                        </Animated.View>
                    ) : null}

                    {/* Condition + distance */}
                    <Animated.View style={metaAnimStyle}>
                        <View style={styles.metaRow}>
                            <View style={styles.conditionBadge}>
                                <Text style={styles.conditionLabel}>{item.condition}</Text>
                            </View>
                            <Text style={styles.distanceLabel}>{item.distance}</Text>
                        </View>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
};

// ── NearestBooks section ──────────────────────────────────────────────────────

interface NearestBooksProps {
    books?: NearestBookItem[];
    onBookPress?: (book: NearestBookItem) => void;
    onSeeAllPress?: () => void;
}

const NearestBooks: React.FC<NearestBooksProps> = ({
    books = DEFAULT_BOOKS,
    onBookPress,
    onSeeAllPress,
}) => {
    const scrollX = useSharedValue(0);

    const onScroll = useAnimatedScrollHandler({
        onScroll: (e) => {
            scrollX.value = e.contentOffset.x;
        },
    });

    return (
        <View style={styles.section}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Nearest Books</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={onSeeAllPress}>
                    <Text style={styles.headerLink}>see all</Text>
                </TouchableOpacity>
            </View>

            {/* Carousel */}
            <Animated.FlatList
                horizontal
                data={books}
                keyExtractor={(b) => b.id}
                renderItem={({ item, index }) => (
                    <BookCard
                        item={item}
                        index={index}
                        scrollX={scrollX}
                        onPress={() => onBookPress?.(item)}
                    />
                )}
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                bounces={false}
                scrollEventThrottle={16}
                onScroll={onScroll}
                contentContainerStyle={styles.listContent}
                getItemLayout={(_, i) => ({
                    length: SNAP_INTERVAL,
                    offset: SNAP_INTERVAL * i,
                    index: i,
                })}
            />
        </View>
    );
};

export default NearestBooks;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    // Section
    section: {
        marginTop: SPACING.lg + SPACING.sm,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: HORIZONTAL_PADDING,
        marginBottom: SPACING.md,
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

    // FlatList
    listContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: COVER_FLOAT + 6,
        paddingBottom: SPACING.md,
    },

    // Per-item slot (fixed width so snapping is predictable)
    slot: {
        width: CARD_WIDTH,
        marginRight: ITEM_GAP,
    },

    // Card root (positioned, receives translateY animation)
    cardRoot: {
        position: 'relative',
        width: 200,
        paddingHorizontal: 10
    },

    // White background card (absoluteFill so it sits behind cover + details)
    whiteBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.white,
        borderRadius: 18,
        // Soft shadow for depth
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
        elevation: 6,
    },

    // Cover image wrapper (animates height + top for floating effect)
    coverWrap: {
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 2,
    },
    coverImg: {
        width: '100%',
        height: '100%',
    },

    // Details
    details: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm + 2,
        paddingBottom: SPACING.sm + 2,
        overflow: 'hidden',
        zIndex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 16,
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
        flex: 1,
        marginRight: SPACING.xs,
    },
    priceText: {
        fontSize: 14,
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
    authorText: {
        fontSize: 12,
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginTop: 2,
    },

    // Seller row
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: SPACING.sm,
        gap: SPACING.sm,
    },
    sellerAvatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
    },
    sellerDesc: {
        flex: 1,
        fontSize: 11,
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        lineHeight: 15,
    },

    // Meta (condition + distance)
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    conditionBadge: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: SPACING.sm + 2,
        paddingVertical: 3,
        borderRadius: 10,
    },
    conditionLabel: {
        fontSize: 10,
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.primary,
    },
    distanceLabel: {
        fontSize: 11,
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.textMuted,
    },
});
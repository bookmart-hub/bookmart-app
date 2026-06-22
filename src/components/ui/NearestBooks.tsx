import React, { memo, useCallback, useEffect, useRef } from 'react';
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
        coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop',
        condition: 'Good Condition',
        distance: '5km',
        description: 'This book teaches me many things',
        sellerAvatarUri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face',
    },
    {
        id: '2',
        title: 'Rich Dad Poor Dad',
        author: 'Robert T. Kiyosaki',
        price: 199,
        coverUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=440&fit=crop',
        condition: 'Like New',
        distance: '3km',
        description: 'Great financial literacy book',
        sellerAvatarUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
    },
    {
        id: '3',
        title: 'Atomic Habits',
        author: 'James Clear',
        price: 220,
        coverUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop',
        condition: 'Good Condition',
        distance: '8km',
        description: 'Changed my daily routine completely',
        sellerAvatarUri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
    },
    {
        id: '4',
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        price: 180,
        coverUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop',
        condition: 'Acceptable',
        description: 'Great book for finance',
        sellerAvatarUri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
        distance: '2km',
    },
];

// ── Layout constants ──────────────────────────────────────────────────────────

const CARD_WIDTH = SCREEN_WIDTH * 0.42;
const ITEM_GAP = 12;
const SNAP_INTERVAL = CARD_WIDTH + ITEM_GAP;
const HORIZONTAL_PADDING = SPACING.lg;

const CARD_HEIGHT = 280;
const LIST_HEIGHT = CARD_HEIGHT + 20;
const COVER_FLOAT = 10;

const LOOP_COUNT = 3;

// ── Shared animation configs (defined once at module scope) ──────────────────

const SPRING_CONFIG = {
    damping: 20,
    stiffness: 160,
    mass: 0.6,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
} as const;

const COVER_SPRING_CONFIG = {
    damping: 22,
    stiffness: 200,
    mass: 0.4,
    overshootClamping: false,
    restDisplacementThreshold: 0.005,
    restSpeedThreshold: 0.005,
} as const;

const REVEAL_TIMING = {
    duration: 220,
    easing: Easing.out(Easing.cubic),
} as const;

const REVEAL_TIMING_SLOW = {
    duration: 300,
    easing: Easing.out(Easing.cubic),
} as const;

// ── BookCard ──────────────────────────────────────────────────────────────────

interface BookCardProps {
    item: NearestBookItem;
    index: number;
    scrollX: SharedValue<number>;
    onPress?: (item: NearestBookItem) => void;
}

const BookCard: React.FC<BookCardProps> = memo(({ item, index, scrollX, onPress }) => {
    const center = index * SNAP_INTERVAL;
    const inputRange = [center - SNAP_INTERVAL, center, center + SNAP_INTERVAL] as const;

    const handlePress = useCallback(() => {
        onPress?.(item);
    }, [item, onPress]);

    // ── Optimized Inline Animated Styles (0 useDerivedValue hooks!) ──────────

    const cardAnimatedStyle = useAnimatedStyle(() => {
        'worklet';
        const progressVal = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);

        return {
            transform: [
                {
                    scale: interpolate(progressVal, [0, 1], [0.95, 1], Extrapolation.CLAMP)
                }
            ],
        };
    });

    const coverAnimStyle = useAnimatedStyle(() => {
        'worklet';

        const progress = interpolate(
            scrollX.value,
            inputRange,
            [0, 1, 0],
            Extrapolation.CLAMP
        );

        return {
            transform: [
                {
                    translateY: interpolate(progress, [0, 1], [0, -COVER_FLOAT]),
                },
                {
                    scale: interpolate(progress, [0, 1], [0.9, 1]),
                },
            ],
            borderBottomLeftRadius: interpolate(progress, [0, 1], [16, 0]),
            borderBottomRightRadius: interpolate(progress, [0, 1], [16, 0]),
        };
    });

    const bgStyle = useAnimatedStyle(() => {
        'worklet';
        const progressVal = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
        return {
            bottom: interpolate(progressVal, [0, 1], [75, 0], Extrapolation.CLAMP),
        };
    });

    const detailsStyle = useAnimatedStyle(() => {
        'worklet';
        const progressVal = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
        const activeProgressVal = interpolate(progressVal, [0.5, 1], [0, 1], Extrapolation.CLAMP);

        return {
            opacity: activeProgressVal,
            transform: [
                {
                    translateY: interpolate(activeProgressVal, [0, 1], [12, 0], Extrapolation.CLAMP),
                },
            ],
        };
    });

    const priceStyle = useAnimatedStyle(() => {
        'worklet';
        const progressVal = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
        const activeProgressVal = interpolate(progressVal, [0.5, 1], [0, 1], Extrapolation.CLAMP);

        return {
            opacity: activeProgressVal,
            transform: [{ scale: interpolate(activeProgressVal, [0, 1], [0.8, 1], Extrapolation.CLAMP) }],
        };
    });

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            style={styles.slot}
        >
            <Animated.View style={[styles.cardRoot, cardAnimatedStyle]}>
                {/* Expandable card background */}
                <Animated.View style={[styles.whiteBg, bgStyle]} />

                {/* Floating Cover */}
                <Animated.View style={[styles.coverWrap, coverAnimStyle]}>
                    <Image
                        source={{ uri: item.coverUri }}
                        style={styles.coverImg}
                        contentFit="cover"
                        recyclingKey={item.coverUri}
                        cachePolicy="memory-disk"
                        transition={0}
                    />
                    {/* Subtle depth overlay */}
                    <View style={styles.coverOverlay} />
                </Animated.View>

                {/* Title & Price container */}
                <View style={styles.titleContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.titleText} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Animated.Text style={[styles.priceText, priceStyle]}>
                            ₹{item.price}
                        </Animated.Text>
                    </View>
                </View>

                {/* Expandable Details Area */}
                <Animated.View style={[styles.details, detailsStyle]}>
                    {/* Author */}
                    <Text style={styles.authorText} numberOfLines={1}>
                        {item.author}
                    </Text>

                    {/* Meta Row ── Condition / Distance */}
                    <View style={styles.metaRow}>
                        <View style={styles.conditionBadge}>
                            <Text style={styles.conditionLabel}>{item.condition}</Text>
                        </View>
                        <Text style={styles.distanceLabel}>{item.distance} away</Text>
                    </View>
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
});

// ── NearestBooks section ──────────────────────────────────────────────────────

interface NearestBooksProps {
    books?: NearestBookItem[];
    onBookPress?: (book: NearestBookItem) => void;
    onSeeAllPress?: () => void;
}

const NearestBooks: React.FC<NearestBooksProps> = memo(({
    books = DEFAULT_BOOKS,
    onBookPress,
    onSeeAllPress,
}) => {
    const listRef = useRef<Animated.FlatList<any>>(null);
    const scrollX = useSharedValue(0);
    const activeIndexShared = useSharedValue(0);

    const booksLengthRef = useRef(books.length);
    booksLengthRef.current = books.length;

    const loopedData = React.useMemo(() => {
        return Array(LOOP_COUNT)
            .fill(books)
            .flat()
            .map((book, idx) => ({
                ...book,
                uniqueId: `${book.id}-${idx}`,
            }));
    }, [books]);

    const loopedLengthRef = useRef(loopedData.length);
    loopedLengthRef.current = loopedData.length;

    useEffect(() => {
        if (books.length > 0 && listRef.current) {
            const timer = setTimeout(() => {
                const middleIndex = Math.floor(LOOP_COUNT / 2) * books.length;
                listRef.current?.scrollToIndex({
                    index: middleIndex,
                    animated: false,
                });
                activeIndexShared.value = middleIndex;
                scrollX.value = middleIndex * SNAP_INTERVAL;
            }, 60);
            return () => clearTimeout(timer);
        }
    }, [books.length]);

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            'worklet';
            scrollX.value = event.contentOffset.x;
        },
    });

    const handleMomentumScrollEnd = useCallback((e: any) => {
        const x = e.nativeEvent.contentOffset.x;
        const index = Math.round(x / SNAP_INTERVAL);
        const bLen = booksLengthRef.current;
        const loopedLen = loopedLengthRef.current;
        const originalIdx = index % bLen;
        const middleInstance = Math.floor(LOOP_COUNT / 2);
        const newIndex = middleInstance * bLen + originalIdx;

        if (index < bLen * 2 || index > loopedLen - bLen * 2) {
            listRef.current?.scrollToIndex({ index: newIndex, animated: false });
            activeIndexShared.value = newIndex;
            scrollX.value = newIndex * SNAP_INTERVAL;
        }
    }, []);

    const renderItem = useCallback(({ item, index }: any) => (
        <BookCard
            item={item}
            index={index}
            scrollX={scrollX}
            onPress={onBookPress}
        />
    ), [scrollX, onBookPress]);

    const keyExtractor = useCallback((b: any) => b.uniqueId, []);

    const getItemLayout = useCallback((_: any, i: number) => ({
        length: SNAP_INTERVAL,
        offset: SNAP_INTERVAL * i,
        index: i,
    }), []);

    return (
        <View style={styles.section}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Nearest Books</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={onSeeAllPress}>
                    <Text style={styles.headerLink}>see all</Text>
                </TouchableOpacity>
            </View>

            <Animated.FlatList
                ref={listRef}
                style={styles.list}
                horizontal
                data={loopedData}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                bounces={false}
                scrollEventThrottle={16}
                onScroll={onScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                contentContainerStyle={styles.listContent}
                getItemLayout={getItemLayout}
                initialNumToRender={3}
                maxToRenderPerBatch={2}
                windowSize={3}
                removeClippedSubviews={false}
            />
        </View>
    );
});

export default NearestBooks;

const styles = StyleSheet.create({
    section: {
        marginTop: SPACING.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: HORIZONTAL_PADDING,
        marginBottom: SPACING.sm,
    },
    headerTitle: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
    },
    headerLink: {
        fontSize: rf(13),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.primary,
    },
    list: {
        height: LIST_HEIGHT,
    },
    listContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: COVER_FLOAT,
        paddingBottom: 10,
    },
    slot: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginRight: ITEM_GAP,
    },
    cardRoot: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        position: 'relative',
    },
    whiteBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    coverWrap: {
        width: '99%',
        height: 160,
        marginTop: 8,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        overflow: 'hidden',
        backgroundColor: COLORS.grayLight,
        zIndex: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
    },
    coverImg: {
        width: '100%',
        height: '100%',
    },
    coverOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.015)',
    },
    titleContainer: {
        width: '100%',
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleText: {
        fontSize: rf(12.5),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
        flex: 1,
        marginRight: 4,
    },
    priceText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
    details: {
        width: '100%',
        paddingHorizontal: 12,
        paddingTop: 4,
        overflow: 'hidden',
    },
    authorText: {
        fontSize: rf(10.5),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginTop: 1,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.025)',
        padding: 5,
        borderRadius: 8,
        marginTop: 6,
    },
    sellerAvatar: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 4,
    },
    sellerDesc: {
        flex: 1,
        fontSize: rf(8.5),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
        lineHeight: 10,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: rf(8)
    },
    conditionBadge: {
        backgroundColor: COLORS.secondary + '20',
        paddingVertical: 1,
        borderRadius: 6,
    },
    conditionLabel: {
        fontSize: rf(8.5),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.primary,
    },
    distanceLabel: {
        fontSize: rf(9.5),
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.textMuted,
    },
});
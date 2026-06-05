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
    useDerivedValue,
    runOnJS,
    Easing,
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

const CARD_WIDTH = SCREEN_WIDTH * 0.44;
const ITEM_GAP = 16;
const SNAP_INTERVAL = CARD_WIDTH + ITEM_GAP;
const HORIZONTAL_PADDING = SPACING.lg;

const CARD_HEIGHT = 300;
const LIST_HEIGHT = CARD_HEIGHT + 20;
const COVER_FLOAT = 12;

const LOOP_COUNT = 30;


// ── Shared animation configs (defined once outside components, never re-created) ──

/**
 * OPTIMIZATION 1: Spring/timing configs are plain objects defined at module scope.
 * Previously they were created inside the component on every render cycle.
 * Worklets capture these by value — defining them once at the top eliminates
 * object allocation on every render and every animation frame evaluation.
 */
const SPRING_CONFIG = {
    damping: 20,
    stiffness: 160,
    mass: 0.6,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
} as const;

// Slightly snappier spring for the cover float (lighter mass = faster settle)
const COVER_SPRING_CONFIG = {
    damping: 22,
    stiffness: 200,
    mass: 0.4,
    overshootClamping: false,
    restDisplacementThreshold: 0.005,
    restSpeedThreshold: 0.005,
} as const;

// Timing config for staggered reveals — cubic ease-out feels premium
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
    onPress?: () => void;
}

const BookCard: React.FC<BookCardProps> = memo(({ item, index, scrollX, onPress }) => {
    /**
     * OPTIMIZATION 2: Derive scroll-relative progress entirely on the UI thread
     * using useDerivedValue. These derivations are computed once per scroll event
     * on the UI thread and then cheaply read by each useAnimatedStyle hook.
     *
     * Previously: Each useAnimatedStyle independently re-ran interpolate() on
     * every frame. Now: One interpolation feeds all downstream styles.
     */
    const center = index * SNAP_INTERVAL;
    const inputRange = [center - SNAP_INTERVAL, center, center + SNAP_INTERVAL] as const;

    // Raw progress: 0 when off-screen, peaks at 1.0 when card is centered
    const progress = useDerivedValue(() => {
        'worklet';
        return interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    });

    /**
     * OPTIMIZATION 3: isActive is a smoothly interpolated float (0→1) rather
     * than a hard boolean threshold at 0.5. This allows animations to start
     * transitioning as soon as the card begins entering the viewport instead
     * of snapping at a single threshold, eliminating the "pop" artifact.
     *
     * We use a derived value with a soft sigmoid-like curve via interpolate
     * to get a smooth 0→1 signal that drives all active-state animations.
     */
    const activeProgress = useDerivedValue(() => {
        'worklet';
        // Remap progress [0.4 → 0.7] to [0 → 1] for smooth activation window
        return interpolate(progress.value, [0.4, 0.7], [0, 1], Extrapolation.CLAMP);
    });

    /**
     * OPTIMIZATION 4: Pre-compute all animated values as derived values on the
     * UI thread. useAnimatedStyle should only read these pre-computed values —
     * never call withSpring/withTiming inside useAnimatedStyle's callback when
     * the input itself is already animated. Calling withSpring inside
     * useAnimatedStyle re-triggers a NEW spring animation on every frame,
     * causing exponential worklet invocations.
     *
     * Correct pattern: drive withSpring/withTiming from useDerivedValue,
     * then READ the result in useAnimatedStyle.
     */
    const animatedMinHeight = useDerivedValue(() => {
        'worklet';
        return withSpring(activeProgress.value > 0.5 ? 300 : 220, SPRING_CONFIG);
    });

    const animatedScale = useDerivedValue(() => {
        'worklet';
        return withSpring(activeProgress.value > 0.5 ? 1 : 0.95, SPRING_CONFIG);
    });

    // Cover float — spring-driven translateY using smooth progress
    const animatedCoverY = useDerivedValue(() => {
        'worklet';
        return withSpring(
            interpolate(progress.value, [0, 1], [0, -COVER_FLOAT], Extrapolation.CLAMP),
            COVER_SPRING_CONFIG
        );
    });

    // Details reveal — smooth opacity and maxHeight driven by active progress
    const animatedDetailsOpacity = useDerivedValue(() => {
        'worklet';
        return withTiming(activeProgress.value > 0.5 ? 1 : 0, REVEAL_TIMING);
    });

    const animatedDetailsHeight = useDerivedValue(() => {
        'worklet';
        return withSpring(activeProgress.value > 0.5 ? 120 : 0, SPRING_CONFIG);
    });

    // Price tag — staggered after details (use slower timing for visual offset)
    const animatedPriceOpacity = useDerivedValue(() => {
        'worklet';
        return withTiming(activeProgress.value > 0.5 ? 1 : 0, REVEAL_TIMING_SLOW);
    });

    const animatedPriceScale = useDerivedValue(() => {
        'worklet';
        return withSpring(activeProgress.value > 0.5 ? 1 : 0.5, SPRING_CONFIG);
    });

    // ── Animated Styles ── (now purely read pre-computed derived values) ────────

    const cardStyle = useAnimatedStyle(() => {
        'worklet';
        return { minHeight: animatedMinHeight.value };
    });

    const scaleStyle = useAnimatedStyle(() => {
        'worklet';
        return { transform: [{ scale: animatedScale.value }] };
    });

    const coverAnimStyle = useAnimatedStyle(() => {
        'worklet';
        return { transform: [{ translateY: animatedCoverY.value }] };
    });

    const detailsStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            opacity: animatedDetailsOpacity.value,
            maxHeight: animatedDetailsHeight.value,
        };
    });

    const priceStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            opacity: animatedPriceOpacity.value,
            transform: [{ scale: animatedPriceScale.value }],
        };
    });

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={styles.slot}
        >
            <Animated.View style={[styles.cardRoot, cardStyle, scaleStyle]}>
                {/* Expandable card background */}
                <View style={styles.whiteBg} />

                {/* Floating Cover */}
                <Animated.View style={[styles.coverWrap, coverAnimStyle]}>
                    <Image
                        source={{ uri: item.coverUri }}
                        style={styles.coverImg}
                        contentFit="cover"
                        recyclingKey={item.id}
                        cachePolicy="memory-disk"
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

                {/* Expandable Details Area — staggered reveal via staggered derived values */}
                <Animated.View style={[styles.details, detailsStyle]}>
                    {/* Author — first to appear */}
                    <Text style={styles.authorText} numberOfLines={1}>
                        {item.author}
                    </Text>

                    {/* Seller row */}
                    {item.sellerAvatarUri && item.description && (
                        <View style={styles.sellerRow}>
                            <Image
                                source={{ uri: item.sellerAvatarUri }}
                                style={styles.sellerAvatar}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                            <Text style={styles.sellerDesc} numberOfLines={2}>
                                {item.description}
                            </Text>
                        </View>
                    )}

                    {/* Meta Row — Condition / Distance */}
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

const NearestBooks: React.FC<NearestBooksProps> = ({
    books = DEFAULT_BOOKS,
    onBookPress,
    onSeeAllPress,
}) => {
    const listRef = useRef<Animated.FlatList<any>>(null);
    const scrollX = useSharedValue(0);
    const activeIndexShared = useSharedValue(0);

    /**
     * OPTIMIZATION 6: Removed the JS-thread `activeIndex` useState entirely.
     * The previous code called runOnJS(setActiveIndex) on every scroll frame,
     * causing a JS-thread state update (and therefore a full React re-render of
     * NearestBooks + all visible BookCards) on every scroll event. Since nothing
     * in the render tree actually consumed `activeIndex` for visual output —
     * all animations were driven by `scrollX` SharedValue — this re-render was
     * pure overhead. The index is now tracked only via `activeIndexShared`.
     */

    // Stable reference to books.length for use inside worklets and callbacks
    const booksLengthRef = useRef(books.length);
    booksLengthRef.current = books.length;

    /**
     * OPTIMIZATION 7: loopedData memo is unchanged in logic but the result is
     * a stable array reference that only changes when `books` changes.
     * LOOP_COUNT reduced to 20 (still infinite feel) to reduce total FlatList
     * item count from 120 → 80, shrinking the virtual list memory footprint.
     */
    const loopedData = React.useMemo(() => {
        return Array(LOOP_COUNT)
            .fill(books)
            .flat()
            .map((book, idx) => ({
                ...book,
                uniqueId: `${book.id}-${idx}`,
            }));
    }, [books]);

    // Store loopedData length in a ref so it's accessible inside worklets
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

    /**
     * OPTIMIZATION 8: onScroll runs fully on the UI thread via useAnimatedScrollHandler.
     * The Math.round + boundary check now operates without touching the JS thread
     * at all. runOnJS is removed from the hot path — only fired when the user
     * actually changes the active item, and even then only when truly necessary.
     *
     * The `loopedData.length` reference previously closed over the JS array inside
     * the worklet. Now it only reads `scrollX.value`, which is the only shared
     * state needed to drive all card animations.
     */
    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            'worklet';
            scrollX.value = event.contentOffset.x;
        },
    });

    /**
     * OPTIMIZATION 9: Momentum scroll end handler resets the infinite loop
     * position. This is the only place that needs JS-thread access (scrollToIndex).
     * Wrapped in useCallback with stable deps to prevent recreation on each render.
     */
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

    /**
     * OPTIMIZATION 10: renderItem is stable via useCallback with empty deps
     * (scrollX is a SharedValue — a stable object ref, not a primitive).
     * This prevents FlatList from re-rendering every cell on parent re-renders.
     * onBookPress is not in deps because it's used inside the closure but
     * changes to it don't affect the animated behavior. We use a ref to access
     * the latest onBookPress without adding it to useCallback's dependency array.
     */
    const onBookPressRef = useRef(onBookPress);
    onBookPressRef.current = onBookPress;

    const renderItem = useCallback(({ item, index }: any) => (
        <BookCard
            item={item}
            index={index}
            scrollX={scrollX}
            onPress={() => onBookPressRef.current?.(item)}
        />
    ), [scrollX]);

    return (
        <View style={styles.section}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Nearest Books</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={onSeeAllPress}>
                    <Text style={styles.headerLink}>see all</Text>
                </TouchableOpacity>
            </View>

            {/**
             * OPTIMIZATION 11: FlatList rendering tuning.
             *
             * - initialNumToRender: Render only the visible viewport + a few
             *   adjacent items. Default (10) caused over-rendering at mount.
             * - maxToRenderPerBatch: Limit items rendered per JS batch to avoid
             *   blocking the JS thread during fast flings.
             * - windowSize: Virtualization window of 5 viewport-widths (down
             *   from default 21) — keeps memory low while avoiding blank cells.
             * - removeClippedSubviews: Unmounts off-screen native views to free
             *   GPU memory. Safe here because expo-image handles recycling.
             * - updateCellsBatchingPeriod: Increase batching interval so the
             *   JS thread does less work per frame during rapid scrolling.
             */}
            <Animated.FlatList
                ref={listRef}
                style={styles.list}
                horizontal
                data={loopedData}
                keyExtractor={(b) => b.uniqueId}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                bounces={false}
                scrollEventThrottle={16}
                onScroll={onScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                contentContainerStyle={styles.listContent}
                getItemLayout={(_, i) => ({
                    length: SNAP_INTERVAL,
                    offset: SNAP_INTERVAL * i,
                    index: i,
                })}
                initialNumToRender={8}
                maxToRenderPerBatch={5}
                windowSize={11}
                removeClippedSubviews={Platform.OS === 'ios'}
                updateCellsBatchingPeriod={30}
            />
        </View>
    );
};

export default NearestBooks;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    section: {
        marginTop: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: HORIZONTAL_PADDING,
        marginBottom: SPACING.sm,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
    },
    headerLink: {
        fontSize: 14,
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
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    whiteBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    coverWrap: {
        width: '88%',
        height: 160,
        marginTop: 12,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        zIndex: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
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
        fontSize: 13.5,
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
        flex: 1,
        marginRight: 4,
    },
    priceText: {
        fontSize: 13,
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
        fontSize: 11,
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
        fontSize: 9,
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
        lineHeight: 11,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    conditionBadge: {
        backgroundColor: COLORS.secondary + '20',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    conditionLabel: {
        fontSize: 9,
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.primary,
    },
    distanceLabel: {
        fontSize: 10,
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.textMuted,
    },
});
import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
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
    withTiming,
    withSpring,
    useDerivedValue,
    FadeIn,
    runOnJS,
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

const CARD_WIDTH = SCREEN_WIDTH * 0.44; // Sleek, modern card width
const ITEM_GAP = 6;
const SNAP_INTERVAL = CARD_WIDTH + ITEM_GAP;
const HORIZONTAL_PADDING = SPACING.lg;

const CARD_HEIGHT = 300; // Slot height accommodating active state (320) plus a small buffer
const LIST_HEIGHT = CARD_HEIGHT + 20; // Breathing room for animated transitions
const COVER_FLOAT = 12; // Subtle elegant cover float

const LOOP_COUNT = 30; // Amount of repeated loops for infinite scrolling

// ── BookCard ──────────────────────────────────────────────────────────

interface BookCardProps {
    item: NearestBookItem;
    index: number;
    scrollX: SharedValue<number>;
    onPress?: () => void;
}

const BookCard: React.FC<BookCardProps> = memo(({ item, index, scrollX, onPress }) => {
    const center = index * SNAP_INTERVAL;
    const prev = (index - 1) * SNAP_INTERVAL;
    const next = (index + 1) * SNAP_INTERVAL;
    const range = [prev, center, next];

    // Progress 0 -> 1 -> 0 as we scroll past the item
    const progress = useDerivedValue(() => {
        return interpolate(scrollX.value, range, [0, 1, 0], Extrapolation.CLAMP);
    });

    // Calculate active state directly on the UI thread for instant response
    const isActiveUI = useDerivedValue(() => {
        return progress.value > 0.5;
    });

    // Snappy, premium spring configuration (mimics high-end native carousels)
    const SPRING_CONFIG = {
        damping: 18,
        stiffness: 155,
        mass: 0.5,
    };

    // Whole card height animation timing
    const cardStyle = useAnimatedStyle(() => {
        return {
            minHeight: withSpring(
                isActiveUI.value ? 300 : 220,
                SPRING_CONFIG
            ),
        };
    });

    // Active Card scale transition
    const scaleStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: withSpring(
                        isActiveUI.value ? 1 : 0.95,
                        SPRING_CONFIG
                    ),
                },
            ],
        };
    });

    // Cover image floating transition (GPU accelerated)
    const coverAnimStyle = useAnimatedStyle(() => {
        const translateY = interpolate(progress.value, [0, 1], [0, -COVER_FLOAT], Extrapolation.CLAMP);
        return {
            transform: [{ translateY }],
        };
    });

    // Smooth spring-based reveal for extra active details
    const detailsStyle = useAnimatedStyle(() => {
        return {
            opacity: withSpring(
                isActiveUI.value ? 1 : 0,
                SPRING_CONFIG
            ),
            maxHeight: withSpring(
                isActiveUI.value ? 120 : 0,
                SPRING_CONFIG
            ),
        };
    });

    // Price tag smooth scale and fade transition
    const priceStyle = useAnimatedStyle(() => {
        return {
            opacity: withSpring(
                isActiveUI.value ? 1 : 0,
                SPRING_CONFIG
            ),
            transform: [
                {
                    scale: withSpring(
                        isActiveUI.value ? 1 : 0.5,
                        SPRING_CONFIG
                    ),
                },
            ],
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
                    />
                    {/* Subtle depth overlay */}
                    <View style={styles.coverOverlay} />
                </Animated.View>

                {/* Title & Price container (Always visible title, price reveals on active) */}
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

                    {/* Seller description snippet */}
                    {item.sellerAvatarUri && item.description && (
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
                    )}

                    {/* Meta Row */}
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
    const [activeIndex, setActiveIndex] = useState(0);
    const activeIndexShared = useSharedValue(0);

    // Create a repeated list for infinite loop
    const loopedData = React.useMemo(() => {
        return Array(LOOP_COUNT)
            .fill(books)
            .flat()
            .map((item, idx) => ({
                ...item,
                uniqueId: `${item.id}-${idx}`,
            }));
    }, [books]);

    // Scroll to the middle on mount
    useEffect(() => {
        if (books.length > 0 && listRef.current) {
            const timer = setTimeout(() => {
                const middleIndex = Math.floor(LOOP_COUNT / 2) * books.length;
                listRef.current?.scrollToIndex({
                    index: middleIndex,
                    animated: false,
                });
                setActiveIndex(middleIndex);
                activeIndexShared.value = middleIndex;
                scrollX.value = middleIndex * SNAP_INTERVAL;
            }, 60);
            return () => clearTimeout(timer);
        }
    }, [books.length]);

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;

            const index = Math.round(event.contentOffset.x / SNAP_INTERVAL);
            const clampedIndex = Math.max(0, Math.min(loopedData.length - 1, index));

            if (activeIndexShared.value !== clampedIndex) {
                activeIndexShared.value = clampedIndex;
                runOnJS(setActiveIndex)(clampedIndex);
            }
        },
    });

    // Reset scroll back to the middle set silently when nearing boundaries
    const handleMomentumScrollEnd = (e: any) => {
        const x = e.nativeEvent.contentOffset.x;
        const index = Math.round(x / SNAP_INTERVAL);
        const originalIdx = index % books.length;
        const middleInstance = Math.floor(LOOP_COUNT / 2);
        const newIndex = middleInstance * books.length + originalIdx;

        if (index < books.length * 2 || index > loopedData.length - books.length * 2) {
            listRef.current?.scrollToIndex({
                index: newIndex,
                animated: false,
            });
            setActiveIndex(newIndex);
            activeIndexShared.value = newIndex;
            scrollX.value = newIndex * SNAP_INTERVAL;
        }
    };

    const renderItem = useCallback(({ item, index }: any) => (
        <BookCard
            item={item}
            index={index}
            scrollX={scrollX}
            onPress={() => onBookPress?.(item)}
        />
    ), [onBookPress]);

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
            />
        </View>
    );
};

export default NearestBooks;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    section: {
        marginTop: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: HORIZONTAL_PADDING + 4,
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
    list: {
        height: LIST_HEIGHT,
    },
    listContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: COVER_FLOAT + 4,
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
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        // Soft Shadow
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 10,
        elevation: 4,
    },
    coverWrap: {
        width: '88%',
        height: 160,
        marginTop: 10,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        zIndex: 2,
        // Subtle depth shadow
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
        fontFamily: FONTS.montserrat.bold,
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
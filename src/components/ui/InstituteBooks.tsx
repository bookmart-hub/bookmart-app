import React, { memo, useCallback, useRef, useMemo, useEffect } from 'react';
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
    useAnimatedScrollHandler,
    useSharedValue,
    runOnJS,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InstituteBookItem {
    id: string;
    title: string;
    author: string;
    price: number;
    coverUri: string;
    description?: string;
    /** Single initial shown in the avatar pill when no photo is available */
    sellerName: string;
    sellerAvatarUri?: string;
}

// ── Sample data ───────────────────────────────────────────────────────────────

const DEFAULT_INSTITUTE_BOOKS: InstituteBookItem[] = [
    {
        id: '1',
        title: 'Fingersmith',
        author: 'Sarah Waters',
        price: 140,
        coverUri:
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=280&fit=crop',
        description:
            'Widely celebrated for its intricate "Dickensian" plot,',
        sellerName: 'Amit Roy',
        sellerAvatarUri:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
    },
    {
        id: '2',
        title: 'The Skin and ...',
        author: 'Sarah Cypher',
        price: 175,
        coverUri:
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=280&fit=crop',
        description:
            'Widely celebrated for its intricate "Dickensian" plot,',
        sellerName: 'Amit Roy',
        sellerAvatarUri:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
    },
    {
        id: '3',
        title: 'Atomic Habits',
        author: 'James Clear',
        price: 220,
        coverUri:
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=280&fit=crop',
        description: 'Tiny changes, remarkable results — a proven framework.',
        sellerName: 'Priya Sen',
        sellerAvatarUri:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face',
    },
    {
        id: '4',
        title: 'Deep Work',
        author: 'Cal Newport',
        price: 195,
        coverUri:
            'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=280&fit=crop',
        description: 'Rules for focused success in a distracted world.',
        sellerName: 'Rahul Mehta',
    },
];

// ── Layout constants ──────────────────────────────────────────────────────────

const CARD_WIDTH = 250;
const COVER_WIDTH = 75;
const COVER_HEIGHT = '100%' as const;
const ITEM_GAP = 12;
const SNAP_INTERVAL = CARD_WIDTH + ITEM_GAP;
const HORIZONTAL_PADDING = SPACING.lg;

const LOOP_COPIES = 15; // Enough for seamless infinite scroll

const IMAGE_TRANSITION = { duration: 150, effect: 'cross-dissolve' as const };

// ── SellerPill ────────────────────────────────────────────────────────────────

interface SellerPillProps {
    name: string;
    avatarUri?: string;
}

const SellerPill: React.FC<SellerPillProps> = memo(({ name, avatarUri }) => {
    const initial = name.charAt(0).toUpperCase();

    return (
        <View style={styles.sellerPill}>
            {avatarUri ? (
                <Image
                    source={{ uri: avatarUri }}
                    style={styles.sellerAvatar}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={IMAGE_TRANSITION}
                />
            ) : (
                <View style={styles.sellerAvatarFallback}>
                    <Text style={styles.sellerAvatarInitial}>{initial}</Text>
                </View>
            )}
            <Text style={styles.sellerName} numberOfLines={1}>
                {name}
            </Text>
        </View>
    );
});

// ── InstituteBookCard ─────────────────────────────────────────────────────────

interface InstituteBookCardProps {
    item: InstituteBookItem;
    onPress?: () => void;
}

const InstituteBookCard: React.FC<InstituteBookCardProps> = memo(
    ({ item, onPress }) => {
        return (
            <TouchableOpacity
                activeOpacity={0.88}
                onPress={onPress}
                style={styles.card}
            >
                {/* Book cover */}
                <Image
                    source={{ uri: item.coverUri }}
                    style={styles.cover}
                    contentFit="cover"
                    recyclingKey={item.id}
                    cachePolicy="memory-disk"
                    transition={IMAGE_TRANSITION}
                />

                {/* Text content */}
                <View style={styles.cardBody}>
                    <Text style={styles.titleText} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={styles.authorText} numberOfLines={1}>
                        {item.author}
                    </Text>
                    {item.description ? (
                        <Text style={styles.descText} numberOfLines={3}>
                            {item.description}
                        </Text>
                    ) : null}
                    <View style={styles.spacer} />
                    <SellerPill
                        name={item.sellerName}
                        avatarUri={item.sellerAvatarUri}
                    />
                </View>
            </TouchableOpacity>
        );
    }
);

// ── InstituteBooks section ────────────────────────────────────────────────────

export interface InstituteBooksProps {
    instituteName?: string;
    books?: InstituteBookItem[];
    onBookPress?: (book: InstituteBookItem) => void;
    onSeeAllPress?: () => void;
}

const InstituteBooks: React.FC<InstituteBooksProps> = ({
    instituteName = 'Your Institute',
    books = DEFAULT_INSTITUTE_BOOKS,
    onBookPress,
    onSeeAllPress,
}) => {
    const listRef = useRef<any>(null);
    const scrollX = useSharedValue(0);
    const N = books.length;

    const onBookPressRef = useRef(onBookPress);
    onBookPressRef.current = onBookPress;

    // Replicate data for infinite loop
    const loopedData = useMemo(() => {
        const arr = [];
        for (let c = 0; c < LOOP_COPIES; c++) {
            for (let i = 0; i < N; i++) {
                arr.push({ ...books[i], _key: `${books[i].id}-${c}` });
            }
        }
        return arr;
    }, [books, N]);

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

    const jumpTo = useCallback((offset: number) => {
        listRef.current?.scrollToOffset({ offset, animated: false });
    }, []);

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            'worklet';
            scrollX.value = event.contentOffset.x;

            // Boundary jump for infinite loop
            const minOffset = (middleStartIndex - N * 2) * SNAP_INTERVAL;
            const maxOffset = (middleStartIndex + N * 2) * SNAP_INTERVAL;

            if (event.contentOffset.x < minOffset) {
                runOnJS(jumpTo)(event.contentOffset.x + N * SNAP_INTERVAL);
            } else if (event.contentOffset.x >= maxOffset) {
                runOnJS(jumpTo)(event.contentOffset.x - N * SNAP_INTERVAL);
            }
        },
    });

    // Reset to middle on momentum end near boundaries
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
        ({ item }: any) => (
            <InstituteBookCard
                item={item}
                onPress={() => onBookPressRef.current?.(item)}
            />
        ),
        []
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
        <View>
            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    From Your {instituteName === 'Your Institute' ? 'College' : instituteName}
                </Text>
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
                snapToAlignment="start"
                decelerationRate="fast"
                bounces={false}
                initialNumToRender={4}
                maxToRenderPerBatch={3}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'ios'}
                updateCellsBatchingPeriod={50}
            />
        </View>
    );
};

export default InstituteBooks;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    // ── Header ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: HORIZONTAL_PADDING + 4,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.text,
        marginRight: SPACING.sm,
    },
    headerLink: {
        fontSize: 14,
        fontFamily: FONTS.montserrat.medium,
        color: COLORS.primary,
    },

    // ── List ──
    listContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingBottom: 4,
    },

    // ── Card ──
    card: {
        width: CARD_WIDTH,
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        padding: 10,
        marginRight: ITEM_GAP,

        // Shadow — iOS
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        // Shadow — Android
        elevation: 3,
    },

    // ── Cover ──
    cover: {
        width: COVER_WIDTH,
        height: COVER_HEIGHT,
        borderRadius: 8,
        backgroundColor: COLORS.secondary,
        flexShrink: 0,
    },

    // ── Card text area ──
    cardBody: {
        flex: 1,
        marginLeft: 10,
        alignSelf: 'stretch',
    },
    titleText: {
        fontSize: 13,
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
        marginBottom: 2,
    },
    authorText: {
        fontSize: 11,
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    descText: {
        fontSize: 10,
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
        lineHeight: 14,
    },
    spacer: {
        flex: 1,
    },

    // ── Seller pill ──
    sellerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    sellerAvatar: {
        width: 18,
        height: 18,
        borderRadius: 9,
        marginRight: 5,
        backgroundColor: COLORS.secondary,
    },
    sellerAvatarFallback: {
        width: 18,
        height: 18,
        borderRadius: 9,
        marginRight: 5,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sellerAvatarInitial: {
        fontSize: 9,
        fontFamily: FONTS.manrope.bold,
        color: COLORS.white,
    },
    sellerName: {
        fontSize: 10,
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        flex: 1,
    },
});
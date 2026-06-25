import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    Pressable,
    View,
    Platform,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { NearestBookItem } from './NearestBooks'; // Reusing type for simplicity

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HORIZONTAL_PADDING = SPACING.lg;

export type AnimationType = 'scale' | 'fade' | 'rotate' | 'parallax' | 'standard';
export type CardLayout = 'standard' | 'horizontal' | 'compact' | 'featured';

interface HorizontalBookListProps {
    title: string;
    books: NearestBookItem[];
    animationType?: AnimationType;
    cardLayout?: CardLayout;
    onBookPress?: (book: NearestBookItem) => void;
    onSeeAllPress?: () => void;
    loop?: boolean;
}

interface BookCardProps {
    item: NearestBookItem;
    index: number;
    scrollX: SharedValue<number>;
    animationType: AnimationType;
    cardLayout: CardLayout;
    snapInterval: number;
    onPress?: (item: NearestBookItem) => void;
}

const BookCard: React.FC<BookCardProps> = memo(({ item, index, scrollX, animationType, cardLayout, snapInterval, onPress }) => {
    const center = index * snapInterval;
    const inputRange = [center - snapInterval, center, center + snapInterval] as const;

    const handlePress = useCallback(() => {
        onPress?.(item);
    }, [item, onPress]);

    const animatedStyle = useAnimatedStyle(() => {
        'worklet';
        if (animationType === 'standard') return {};

        const progress = interpolate(scrollX.value, inputRange, [-1, 0, 1], Extrapolation.CLAMP);

        if (animationType === 'scale') {
            return {
                transform: [
                    { scale: interpolate(progress, [-1, 0, 1], [0.9, 1, 0.9]) },
                ],
            };
        }

        if (animationType === 'fade') {
            return {
                opacity: interpolate(progress, [-1, 0, 1], [0.65, 1, 0.65]),
            };
        }

        if (animationType === 'rotate') {
            return {
                transform: [
                    { scale: interpolate(progress, [-1, 0, 1], [0.85, 1, 0.85]) },
                    { rotate: `${interpolate(progress, [-1, 0, 1], [-10, 0, 10])}deg` }
                ],
            };
        }

        return {};
    });

    const coverAnimStyle = useAnimatedStyle(() => {
        'worklet';
        if (animationType !== 'parallax' || cardLayout === 'featured') return {};
        const progress = interpolate(scrollX.value, inputRange, [-1, 0, 1], Extrapolation.CLAMP);
        return {
            transform: [{ translateX: interpolate(progress, [-1, 0, 1], [-20, 0, 20]) }]
        };
    });

    const isHorizontal = cardLayout === 'horizontal';
    const isFeatured = cardLayout === 'featured';
    const isCompact = cardLayout === 'compact';

    const cardStyles = isHorizontal ? styles.cardHorizontal : isFeatured ? styles.cardFeatured : isCompact ? styles.cardCompact : styles.cardStandard;
    const rootStyle = isHorizontal ? styles.cardRootHorizontal : isFeatured ? styles.cardRootFeatured : isCompact ? styles.cardRootCompact : styles.cardRootStandard;

    if (isFeatured) {
        return (
            <Pressable onPress={handlePress} style={cardStyles}>
                <Animated.View style={[rootStyle, animatedStyle]}>
                    <Image
                        recyclingKey={item.id}
                        cachePolicy="memory-disk"
                        source={{ uri: item.coverUri }}
                        style={StyleSheet.absoluteFill}
                        contentFit="contain"
                        transition={0}
                    />
                    <View style={styles.featuredOverlay} />
                    <View style={styles.featuredInfoWrap}>
                        <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.featuredAuthor} numberOfLines={1}>{item.author}</Text>
                        <Text style={styles.featuredPrice}>₹{item.price}</Text>
                    </View>
                </Animated.View>
            </Pressable>
        );
    }

    if (isHorizontal) {
        return (
            <Pressable onPress={handlePress} style={cardStyles}>
                <Animated.View style={[rootStyle, animatedStyle]}>
                    <View style={styles.horizontalCoverWrap}>
                        <Image recyclingKey={item.id} cachePolicy="memory-disk" source={{ uri: item.coverUri }} style={styles.coverImg} contentFit="cover" transition={0} />
                    </View>
                    <View style={styles.horizontalInfoWrap}>
                        <Text style={styles.titleText} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.authorText} numberOfLines={1}>{item.author}</Text>
                        <View style={styles.horizontalMeta}>
                            <Text style={styles.priceText}>₹{item.price}</Text>
                            <View style={styles.horizontalBadge}>
                                <Text style={styles.horizontalBadgeText}>{item.condition}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </Pressable>
        );
    }

    return (
        <Pressable onPress={handlePress} style={cardStyles}>
            <Animated.View style={[rootStyle, animatedStyle]}>
                <View style={isCompact ? styles.compactCoverWrap : styles.standardCoverWrap}>
                    <Animated.View style={[StyleSheet.absoluteFill, coverAnimStyle]}>
                        <Image recyclingKey={item.id} cachePolicy="memory-disk" source={{ uri: item.coverUri }} style={styles.coverImg} contentFit="cover" transition={0} />
                    </Animated.View>
                </View>
                <View style={isCompact ? styles.compactInfoWrap : styles.standardInfoWrap}>
                    <Text style={styles.titleText} numberOfLines={isCompact ? 1 : 2}>{item.title}</Text>
                    <Text style={styles.authorText} numberOfLines={1}>{item.author}</Text>
                    <Text style={styles.priceText}>₹{item.price}</Text>
                </View>
            </Animated.View>
        </Pressable>
    );
}, (prev, next) => {
    return prev.item.id === next.item.id &&
        prev.index === next.index &&
        prev.animationType === next.animationType &&
        prev.cardLayout === next.cardLayout &&
        prev.snapInterval === next.snapInterval;
});

const HorizontalBookList: React.FC<HorizontalBookListProps> = memo(({
    title,
    books,
    animationType = 'standard',
    cardLayout = 'standard',
    onBookPress,
    onSeeAllPress,
    loop = false
}) => {
    const listRef = useRef<Animated.FlatList<any>>(null);
    const scrollX = useSharedValue(0);

    // Determine sizes based on layout
    const itemGap = 10;
    let cardWidth = SCREEN_WIDTH * 0.36;
    let cardHeight = 200;

    if (cardLayout === 'horizontal') {
        cardWidth = SCREEN_WIDTH * 0.72;
        cardHeight = 110;
    } else if (cardLayout === 'compact') {
        cardWidth = SCREEN_WIDTH * 0.26;
        cardHeight = 145;
    } else if (cardLayout === 'featured') {
        cardWidth = SCREEN_WIDTH * 0.52;
        cardHeight = 230;
    }

    const snapInterval = cardWidth + itemGap;

    const LOOP_COPIES = 15;

    const loopedData = React.useMemo(() => {
        if (!loop) return books.map((b, i) => ({ ...b, uniqueId: `${b.id}-${i}` }));
        return Array(LOOP_COPIES).fill(books).flat().map((book, idx) => ({
            ...book,
            uniqueId: `${book.id}-${idx}`,
        }));
    }, [books, loop]);

    useEffect(() => {
        if (loop && books.length > 0 && listRef.current) {
            const timer = setTimeout(() => {
                const middleIndex = Math.floor(LOOP_COPIES / 2) * books.length;
                listRef.current?.scrollToIndex({ index: middleIndex, animated: false });
                scrollX.value = middleIndex * snapInterval;
            }, 60);
            return () => clearTimeout(timer);
        }
    }, [books.length, loop, snapInterval]);

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            'worklet';
            scrollX.value = event.contentOffset.x;
        },
    });

    const handleMomentumScrollEnd = useCallback((e: any) => {
        if (!loop) return;
        const x = e.nativeEvent.contentOffset.x;
        const index = Math.round(x / snapInterval);
        const bLen = books.length;
        const loopedLen = loopedData.length;
        const originalIdx = ((index % bLen) + bLen) % bLen;
        const newIndex = Math.floor(LOOP_COPIES / 2) * bLen + originalIdx;

        if (index < bLen * 2 || index > loopedLen - bLen * 2) {
            listRef.current?.scrollToIndex({ index: newIndex, animated: false });
            scrollX.value = newIndex * snapInterval;
        }
    }, [books.length, loop, scrollX, snapInterval, loopedData.length]);

    const renderItem = useCallback(({ item, index }: any) => (
        <BookCard item={item} index={index} scrollX={scrollX} animationType={animationType} cardLayout={cardLayout} snapInterval={snapInterval} onPress={onBookPress} />
    ), [scrollX, animationType, cardLayout, snapInterval, onBookPress]);

    const keyExtractor = useCallback((b: any) => b.uniqueId, []);

    const getItemLayout = useCallback((_: any, i: number) => ({
        length: snapInterval,
        offset: snapInterval * i,
        index: i,
    }), [snapInterval]);

    return (
        <View style={styles.section}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{title}</Text>
                {onSeeAllPress && (
                    <Pressable onPress={onSeeAllPress}>
                        <Text style={styles.headerLink}>see all</Text>
                    </Pressable>
                )}
            </View>

            <Animated.FlatList
                ref={listRef}
                style={{ height: cardHeight + 20 }}
                horizontal
                data={loopedData}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                snapToInterval={snapInterval}
                decelerationRate="fast"
                bounces={false}
                scrollEventThrottle={16}
                onScroll={onScroll}
                onMomentumScrollEnd={loop ? handleMomentumScrollEnd : undefined}
                contentContainerStyle={styles.listContent}
                getItemLayout={getItemLayout}
                windowSize={3}
                maxToRenderPerBatch={3}
                initialNumToRender={4}
                updateCellsBatchingPeriod={40}
                removeClippedSubviews={false}
            />
        </View>
    );
}, (prev, next) => {
    return prev.title === next.title &&
        prev.animationType === next.animationType &&
        prev.cardLayout === next.cardLayout &&
        prev.loop === next.loop &&
        prev.books === next.books;
});

export default HorizontalBookList;

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
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
    },
    headerLink: {
        fontSize: rf(12),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.primary,
    },
    listContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 8,
        paddingBottom: 8,
    },

    // Standard Card
    cardStandard: { width: SCREEN_WIDTH * 0.36, height: 200, marginRight: 10 },
    cardRootStandard: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy || 'rgba(0,0,0,0.05)',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    standardCoverWrap: {
        width: '100%',
        height: 125,
        overflow: 'hidden',
        backgroundColor: COLORS.background
    },
    standardInfoWrap: {
        padding: 8,
        justifyContent: 'center'
    },

    // Compact Card
    cardCompact: { width: SCREEN_WIDTH * 0.26, height: 145, marginRight: 10 },
    cardRootCompact: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy || 'rgba(0,0,0,0.05)',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    compactCoverWrap: {
        width: '100%',
        height: 90,
        overflow: 'hidden',
        backgroundColor: COLORS.background
    },
    compactInfoWrap: {
        padding: 6,
        justifyContent: 'center'
    },

    // Horizontal Card
    cardHorizontal: { width: SCREEN_WIDTH * 0.72, height: 110, marginRight: 10 },
    cardRootHorizontal: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy || 'rgba(0,0,0,0.05)',
        flexDirection: 'row',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    horizontalCoverWrap: {
        width: 72,
        height: '100%',
        backgroundColor: COLORS.background
    },
    horizontalInfoWrap: {
        flex: 1,
        padding: 10,
        justifyContent: 'space-between'
    },
    horizontalMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    horizontalBadge: {
        backgroundColor: COLORS.blueLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4
    },
    horizontalBadgeText: {
        fontSize: rf(8.5),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.blue
    },

    // Featured Card
    cardFeatured: {
        width: SCREEN_WIDTH * 0.52,
        height: 230,
        marginRight: 10
    },
    cardRootFeatured: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.black,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    featuredOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    featuredInfoWrap: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0, padding: 10
    },
    featuredTitle: {
        fontSize: rf(13),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.white,
        marginBottom: 2
    },
    featuredAuthor: {
        fontSize: rf(10.5),
        fontFamily: FONTS.manrope.medium,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 6
    },
    featuredPrice: {
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.white
    },

    // Shared Texts
    coverImg: {
        width: '100%',
        height: '100%'
    },
    titleText: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
        marginBottom: 2
    },
    authorText: {
        fontSize: rf(9.5),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginBottom: 4
    },
    priceText: {
        fontSize: rf(12),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary
    },
});
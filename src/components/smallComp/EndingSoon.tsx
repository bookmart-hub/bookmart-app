import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    Pressable,
    View,
    FlatList
} from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { NearestBookItem } from '../ui/NearestBooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = SPACING.lg;

const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const CARD_HEIGHT = 110;
const ITEM_GAP = 10;
const SNAP_INTERVAL = CARD_WIDTH + ITEM_GAP;
const LOOP_COPIES = 15;

interface EndingSoonProps {
    title?: string;
    books: NearestBookItem[];
    onBookPress?: (book: NearestBookItem) => void;
    onSeeAllPress?: () => void;
    loop?: boolean;
}

const BookCard = memo(({ item, onPress }: any) => {
    const handlePress = useCallback(() => {
        onPress?.(item);
    }, [item, onPress]);

    return (
        <Pressable onPress={handlePress} style={styles.cardHorizontal}>
            <View style={styles.cardRootHorizontal}>
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
            </View>
        </Pressable>
    );
}, (prev: any, next: any) => prev.item.id === next.item.id);

const EndingSoon: React.FC<EndingSoonProps> = memo(({
    title = "Ending Soon",
    books,
    onBookPress,
    onSeeAllPress,
    loop = true
}) => {
    const listRef = useRef<FlatList<any>>(null);

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
                listRef.current?.scrollToIndex({
                    index: middleIndex,
                    animated: false,
                });
            }, 60);
            return () => clearTimeout(timer);
        }
    }, [books.length, loop]);

    const handleMomentumScrollEnd = useCallback((e: any) => {
        if (!loop) return;
        const x = e.nativeEvent.contentOffset.x;
        const index = Math.round(x / SNAP_INTERVAL);
        const bLen = books.length;
        const loopedLen = loopedData.length;
        const originalIdx = ((index % bLen) + bLen) % bLen;
        const newIndex = Math.floor(LOOP_COPIES / 2) * bLen + originalIdx;

        if (index < bLen * 2 || index > loopedLen - bLen * 2) {
            listRef.current?.scrollToIndex({ index: newIndex, animated: false });
        }
    }, [books.length, loop, loopedData.length]);

    const renderItem = useCallback(({ item }: any) => (
        <BookCard item={item} onPress={onBookPress} />
    ), [onBookPress]);

    const keyExtractor = useCallback((b: any) => b.uniqueId, []);

    const getItemLayout = useCallback((_: any, i: number) => ({
        length: SNAP_INTERVAL,
        offset: SNAP_INTERVAL * i,
        index: i,
    }), []);

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

            <FlatList
                ref={listRef}
                style={{ height: CARD_HEIGHT + 20 }}
                horizontal
                data={loopedData}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                bounces={false}
                scrollEventThrottle={16}
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
}, (prev, next) => prev.books === next.books && prev.loop === next.loop);

export default EndingSoon;

const styles = StyleSheet.create({
    section: { marginTop: SPACING.md },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: HORIZONTAL_PADDING, marginBottom: SPACING.sm },
    headerTitle: { fontSize: rf(16), fontFamily: FONTS.montserrat.bold, color: COLORS.text },
    headerLink: { fontSize: rf(12), fontFamily: FONTS.montserrat.semibold, color: COLORS.primary },
    listContent: { paddingHorizontal: HORIZONTAL_PADDING, paddingTop: 8, paddingBottom: 8 },
    cardHorizontal: { width: CARD_WIDTH, height: CARD_HEIGHT, marginRight: ITEM_GAP },
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
    coverImg: { width: '100%', height: '100%' },
    titleText: { fontSize: rf(11), fontFamily: FONTS.manrope.bold, color: COLORS.text, marginBottom: 2 },
    authorText: { fontSize: rf(9.5), fontFamily: FONTS.manrope.medium, color: COLORS.textMuted, marginBottom: 4 },
    priceText: { fontSize: rf(12), fontFamily: FONTS.montserrat.bold, color: COLORS.primary },
});

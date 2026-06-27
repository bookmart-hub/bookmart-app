import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import {
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { NearestBookItem } from '../ui/NearestBooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = SPACING.lg;

const CARD_WIDTH = SCREEN_WIDTH * 0.36;
const CARD_HEIGHT = 200;
const ITEM_GAP = 10;
const SNAP_INTERVAL = CARD_WIDTH + ITEM_GAP;
const LOOP_COPIES = 50;

interface RecentlyAddedProps {
    title?: string;
    books: NearestBookItem[];
    onBookPress?: (book: NearestBookItem) => void;
    onSeeAllPress?: () => void;
    loop?: boolean;
}

const BookCard = memo(
    ({ item, onPress }: any) => {
        const handlePress = useCallback(() => {
            onPress?.(item);
        }, [item, onPress]);

        return (
            <Pressable onPress={handlePress} style={styles.cardStandard}>
                <View style={styles.cardRootStandard}>
                    <View style={styles.standardCoverWrap}>
                        <Image
                            source={{ uri: item.coverUri }}
                            style={styles.coverImg}
                            contentFit="cover"
                        />
                    </View>

                    <View style={styles.standardInfoWrap}>
                        <Text numberOfLines={2} style={styles.titleText}>
                            {item.title}
                        </Text>

                        <Text numberOfLines={1} style={styles.authorText}>
                            {item.author}
                        </Text>

                        <Text style={styles.priceText}>
                            ₹{item.price}
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    },
    (prev: any, next: any) => prev.item.id === next.item.id
);

const RecentlyAdded: React.FC<RecentlyAddedProps> = memo(({
    title = "Recently Added",
    books,
    onBookPress,
    onSeeAllPress,
    loop = true
}) => {
    const loopedData = useMemo(() => {
        if (!loop) return books;

        return Array.from({ length: LOOP_COPIES }, (_, copy) =>
            books.map(book => ({
                ...book,
                uniqueId: `${copy}-${book.id}`,
            }))
        ).flat();
    }, [books, loop]);

    const handleMomentumEnd = useCallback(
        (e: any) => {
            if (!loop) return;

            const offset = e.nativeEvent.contentOffset.x;
            const index = Math.round(offset / (CARD_WIDTH + ITEM_GAP));

            const bookCount = books.length;
            const middle = Math.floor(LOOP_COPIES / 2) * bookCount;

            if (
                index < bookCount * 2 ||
                index > loopedData.length - bookCount * 2
            ) {
                const newIndex = middle + (index % bookCount);

                listRef.current?.scrollToIndex({
                    index: newIndex,
                    animated: false,
                });
            }
        },
        [books, loop, loopedData]
    );

    useEffect(() => {
        if (!loop || books.length === 0) return;

        requestAnimationFrame(() => {
            const middle = Math.floor(LOOP_COPIES / 2) * books.length;

            listRef.current?.scrollToIndex({
                index: middle,
                animated: false,
            });
        });
    }, [books, loop]);

    const listRef = useRef<FlatList>(null);

    const renderItem = useCallback(
        ({ item }: any) => (
            <BookCard item={item} onPress={onBookPress} />
        ),
        [onBookPress]
    );

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
                horizontal
                data={loopedData}
                keyExtractor={(item) => item.uniqueId}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                onMomentumScrollEnd={handleMomentumEnd}
                getItemLayout={(_, index) => ({
                    length: CARD_WIDTH + ITEM_GAP,
                    offset: (CARD_WIDTH + ITEM_GAP) * index,
                    index,
                })}
            />
        </View>
    );
}, (prev, next) => prev.books === next.books && prev.loop === next.loop);

export default RecentlyAdded;

const styles = StyleSheet.create({
    section: {
        marginTop: SPACING.md
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: HORIZONTAL_PADDING,
        marginBottom: SPACING.sm
    },
    headerTitle: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text
    },
    headerLink: {
        fontSize: rf(12),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.primary
    },
    listContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 8,
        paddingBottom: 8
    },
    cardStandard: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginRight: ITEM_GAP
    },
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
        elevation: 2
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
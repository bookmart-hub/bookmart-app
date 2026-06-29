import React, { memo, useCallback } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    Pressable,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { NearestBookItem } from '../ui/NearestBooks';

interface RecentlyAddedProps {
    title?: string;
    books: NearestBookItem[];
    onBookPress?: (book: NearestBookItem) => void;
    onSeeAllPress?: () => void;
}

const FeaturedCard = memo(
    ({ item, onPress }: { item: NearestBookItem; onPress?: (item: NearestBookItem) => void }) => {
        const handlePress = useCallback(() => {
            onPress?.(item);
        }, [item, onPress]);

        return (
            <Pressable onPress={handlePress} style={styles.featuredCard}>
                <View style={styles.featuredCoverWrap}>
                    <Image
                        source={{ uri: item.coverUri }}
                        style={styles.coverImg}
                        contentFit="fill"
                        recyclingKey={item.coverUri}
                        cachePolicy="memory-disk"
                    />
                    <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>FEATURED NEW</Text>
                    </View>
                </View>

                <View style={styles.featuredInfo}>
                    <Text numberOfLines={1} style={styles.titleText}>
                        {item.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.authorText}>
                        {item.author}
                    </Text>
                    <View style={styles.footerRow}>
                        <Text style={styles.priceText}>₹{item.price}</Text>
                        <View style={styles.conditionBadge}>
                            <Text style={styles.conditionText}>{item.condition}</Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    },
    (prev, next) => prev.item.id === next.item.id
);

const SideRowCard = memo(
    ({ item, onPress }: { item: NearestBookItem; onPress?: (item: NearestBookItem) => void }) => {
        const handlePress = useCallback(() => {
            onPress?.(item);
        }, [item, onPress]);

        return (
            <Pressable onPress={handlePress} style={styles.sideRowCard}>
                <Image
                    source={{ uri: item.coverUri }}
                    style={styles.sideRowCover}
                    contentFit="fill"
                    recyclingKey={item.coverUri}
                    cachePolicy="memory-disk"
                />
                <View style={styles.sideRowInfo}>
                    <Text numberOfLines={1} style={styles.sideTitle}>
                        {item.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.sideAuthor}>
                        {item.author}
                    </Text>
                    <Text style={styles.sidePrice}>₹{item.price}</Text>
                </View>
            </Pressable>
        );
    },
    (prev, next) => prev.item.id === next.item.id
);

const RecentlyAdded: React.FC<RecentlyAddedProps> = memo(({
    title = "Recently Added",
    books,
    onBookPress,
    onSeeAllPress,
}) => {
    if (books.length === 0) return null;

    const featuredBook = books[0];
    const sideBooks = books.slice(1, 3); // next 2 books for side column

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

            <View style={styles.splitBlock}>
                {/* Left Side: 1 Featured Card */}
                {featuredBook && (
                    <View style={styles.leftCol}>
                        <FeaturedCard
                            item={featuredBook}
                            onPress={onBookPress}
                        />
                    </View>
                )}

                {/* Right Side: Stack of 2 side row items */}
                <View style={styles.rightCol}>
                    {sideBooks.map((book) => (
                        <SideRowCard
                            key={book.id}
                            item={book}
                            onPress={onBookPress}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
});

export default RecentlyAdded;

const styles = StyleSheet.create({
    section: {
        marginTop: SPACING.md,
        paddingHorizontal: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    splitBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    leftCol: {
        flex: 1,
    },
    rightCol: {
        flex: 1,
        justifyContent: 'space-between',
        gap: 8,
    },
    featuredCard: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
        height: 206, // matches total height of right column stacked cards
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    featuredCoverWrap: {
        width: '100%',
        height: 130,
        position: 'relative',
    },
    coverImg: {
        width: '100%',
        height: '100%',
    },
    featuredBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 6,
        paddingVertical: 1.5,
        borderRadius: 4,
    },
    featuredBadgeText: {
        fontSize: rf(7.5),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.white,
    },
    featuredInfo: {
        padding: 6,
        gap: 1,
    },
    titleText: {
        fontSize: rf(10.5),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
    },
    authorText: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 3,
    },
    priceText: {
        fontSize: rf(11.5),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
    },
    conditionBadge: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 3,
    },
    conditionText: {
        fontSize: rf(7.5),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
    sideRowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        padding: 6,
        height: 99, // 2 cards = 198 + 8 gap = 206 total height
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 2,
        elevation: 1,
    },
    sideRowCover: {
        width: 48,
        height: 66,
        borderRadius: 6,
        backgroundColor: COLORS.background,
    },
    sideRowInfo: {
        flex: 1,
        marginLeft: 8,
        justifyContent: 'center',
        gap: 1,
    },
    sideTitle: {
        fontSize: rf(10.5),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
    },
    sideAuthor: {
        fontSize: rf(8.5),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    sidePrice: {
        fontSize: rf(11),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
        marginTop: 4,
    },
});
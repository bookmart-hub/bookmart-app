import React, { memo, useCallback } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    Pressable,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { NearestBookItem } from '../ui/NearestBooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = SPACING.md;
const COLUMN_GAP = 8;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP * 2) / 3;

interface ExcellentConditionProps {
    title?: string;
    books: NearestBookItem[];
    onBookPress?: (book: NearestBookItem) => void;
    onSeeAllPress?: () => void;
}

const BookCard = memo(
    ({ item, onPress }: { item: NearestBookItem; onPress?: (item: NearestBookItem) => void }) => {
        const handlePress = useCallback(() => {
            onPress?.(item);
        }, [item, onPress]);

        return (
            <Pressable onPress={handlePress} style={styles.card}>
                <View style={styles.coverWrap}>
                    <Image
                        source={{ uri: item.coverUri }}
                        style={styles.coverImg}
                        contentFit="fill"
                        recyclingKey={item.coverUri}
                        cachePolicy="memory-disk"
                    />
                    <View style={styles.mintBadge}>
                        <Ionicons name="sparkles" size={8} color={COLORS.white} />
                        <Text style={styles.mintBadgeText}>MINT</Text>
                    </View>
                </View>

                <View style={styles.infoWrap}>
                    <Text numberOfLines={1} style={styles.titleText}>
                        {item.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.authorText}>
                        {item.author}
                    </Text>
                    <View style={styles.footerRow}>
                        <Text style={styles.priceText}>₹{item.price}</Text>
                        <Text style={styles.distanceText}>{item.distance}</Text>
                    </View>
                </View>
            </Pressable>
        );
    },
    (prev, next) => prev.item.id === next.item.id
);

const ExcellentCondition: React.FC<ExcellentConditionProps> = memo(({
    title = "Excellent Condition",
    books,
    onBookPress,
    onSeeAllPress,
}) => {
    // Render up to 6 items in a clean 3-column grid
    const displayBooks = books.slice(0, 6);

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

            <View style={styles.grid}>
                {displayBooks.map((book) => (
                    <BookCard
                        key={book.id}
                        item={book}
                        onPress={onBookPress}
                    />
                ))}
            </View>
        </View>
    );
});

export default ExcellentCondition;

const styles = StyleSheet.create({
    section: {
        marginTop: SPACING.md,
        paddingHorizontal: HORIZONTAL_PADDING,
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: COLUMN_GAP,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
        marginBottom: 4,
    },
    coverWrap: {
        width: '100%',
        height: 100,
        backgroundColor: COLORS.background,
        position: 'relative',
    },
    coverImg: {
        width: '100%',
        height: '100%',
    },
    mintBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: COLORS.green, // Mint green color
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 1.5,
        borderRadius: 4,
        gap: 2,
    },
    mintBadgeText: {
        fontSize: rf(7.5),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.white,
    },
    infoWrap: {
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
        marginTop: 4,
    },
    priceText: {
        fontSize: rf(11.5),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
    },
    distanceText: {
        fontSize: rf(8.5),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
});
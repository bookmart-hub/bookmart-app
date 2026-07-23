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
import { rem } from '@/utils/responsive';
import { NearestBookItem } from '../ui/NearestBooks';
import { LinearGradient } from 'expo-linear-gradient';

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
        <LinearGradient
            colors={[COLORS.purple + '35', COLORS.purple + '70']}
            style={styles.section}
        >
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
        </LinearGradient>
    );
});

export default ExcellentCondition;

const styles = StyleSheet.create({
    section: {
        marginTop: SPACING.md,
        paddingHorizontal: HORIZONTAL_PADDING,
        borderRadius: 20,
        paddingTop: 10,
        paddingBottom: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    headerTitle: {
        fontSize: rem(1),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
    },
    headerLink: {
        fontSize: rem(0.75),
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.white,
        overflow: 'hidden',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 8,
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
        fontSize: rem(0.46875),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.white,
    },
    infoWrap: {
        padding: 6,
        gap: 1,
    },
    titleText: {
        fontSize: rem(0.65625),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
    },
    authorText: {
        fontSize: rem(0.5625),
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
        fontSize: rem(0.71875),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
    },
    distanceText: {
        fontSize: rem(0.53125),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
});
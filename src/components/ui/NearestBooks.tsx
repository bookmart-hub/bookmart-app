import React, { memo, useCallback, useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import HeartBurst from './HeartBrust';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = SPACING.md;
const COLUMN_GAP = 8;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP * 2) / 3;

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

interface NearestBooksProps {
    books: NearestBookItem[];
    onBookPress?: (book: NearestBookItem) => void;
    onSeeAllPress?: () => void;
}

const BookCard = memo(
    ({ item, onPress }: { item: NearestBookItem; onPress?: (item: NearestBookItem) => void }) => {
        const [isLiked, setIsLiked] = useState(false);
        const [showBurst, setShowBurst] = useState(false);

        const handlePress = useCallback(() => {
            onPress?.(item);
        }, [item, onPress]);

        const toggleLike = useCallback(() => {
            setIsLiked((prev) => {
                const next = !prev;
                if (next) {
                    setShowBurst(true);
                    setTimeout(() => setShowBurst(false), 600);
                }
                return next;
            });
        }, []);

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePress}
                style={styles.card}
            >
                <View style={styles.coverContainer}>
                    <Image
                        source={{ uri: item.coverUri }}
                        style={styles.coverImg}
                        contentFit="fill"
                        recyclingKey={item.coverUri}
                        cachePolicy="memory-disk"
                    />
                    <View style={styles.distanceBadge}>
                        <Ionicons name="location" size={8} color={COLORS.primary} />
                        <Text style={styles.distanceText}>{item.distance}</Text>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text numberOfLines={1} style={styles.titleText}>
                        {item.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.authorText}>
                        {item.author}
                    </Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceText}>₹{item.price}</Text>
                        <View style={styles.heartContainer}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={toggleLike}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name={isLiked ? 'heart' : 'heart-outline'}
                                    size={18}
                                    color={isLiked ? COLORS.primary : COLORS.textMuted}
                                />
                            </TouchableOpacity>
                            {showBurst && <HeartBurst />}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    },
    (prev, next) => prev.item.id === next.item.id
);

const NearestBooks: React.FC<NearestBooksProps> = memo(({
    books,
    onBookPress,
    onSeeAllPress,
}) => {
    return (
        <View style={styles.section}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Nearest Books</Text>
                {onSeeAllPress && (
                    <TouchableOpacity activeOpacity={0.7} onPress={onSeeAllPress}>
                        <Text style={styles.headerLink}>see all</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* 3-Column Grid */}
            <View style={styles.grid}>
                {books.map((book) => (
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

export default NearestBooks;

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
        borderWidth: 0,
        // borderColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    coverContainer: {
        width: '100%',
        height: 100,
        backgroundColor: COLORS.grayLight,
        position: 'relative',
    },
    coverImg: {
        width: '100%',
        height: '100%',
    },
    distanceBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 5,
        paddingVertical: 1.5,
        borderRadius: 4,
        gap: 2,
    },
    distanceText: {
        fontSize: rf(8),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
    infoContainer: {
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
    priceRow: {
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
    heartContainer: {
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
});
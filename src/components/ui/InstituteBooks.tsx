import React, { memo, useCallback, useState } from 'react';
import {
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

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InstituteBookItem {
    id: string;
    title: string;
    author: string;
    price: number;
    coverUri: string;
    description?: string;
    sellerName: string;
    sellerAvatarUri?: string;
}

export interface InstituteBooksProps {
    instituteName?: string;
    books: InstituteBookItem[];
    onBookPress?: (book: InstituteBookItem) => void;
    onSeeAllPress?: () => void;
}

const SellerPill: React.FC<{ name: string; avatarUri?: string }> = memo(({ name, avatarUri }) => {
    const initial = name.charAt(0).toUpperCase();

    return (
        <View style={styles.sellerPill}>
            {avatarUri ? (
                <Image
                    source={{ uri: avatarUri }}
                    style={styles.sellerAvatar}
                    contentFit="fill"
                    cachePolicy="memory-disk"
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

const BookRowCard = memo(
    ({ item, onPress }: { item: InstituteBookItem; onPress?: (item: InstituteBookItem) => void }) => {
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
                activeOpacity={0.88}
                onPress={handlePress}
                style={styles.rowCard}
            >
                {/* Book cover */}
                <Image
                    source={{ uri: item.coverUri }}
                    style={styles.cover}
                    contentFit="fill"
                    recyclingKey={item.coverUri}
                    cachePolicy="memory-disk"
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
                        <Text style={styles.descText} numberOfLines={2}>
                            {item.description}
                        </Text>
                    ) : null}
                    <SellerPill
                        name={item.sellerName}
                        avatarUri={item.sellerAvatarUri}
                    />
                </View>

                {/* Price and Action */}
                <View style={styles.rightActionWrap}>
                    <Text style={styles.priceText}>₹{item.price}</Text>
                    <View style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>View</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    },
    (prev, next) => prev.item.id === next.item.id
);

const InstituteBooks: React.FC<InstituteBooksProps> = memo(({
    instituteName = 'Your Institute',
    books,
    onBookPress,
    onSeeAllPress,
}) => {
    // Only display top 3 books for Q-commerce vertical rows
    const displayBooks = books.slice(0, 3);

    return (
        <View style={styles.section}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    From Your {instituteName === 'Your Institute' ? 'College' : instituteName}
                </Text>
                {onSeeAllPress && (
                    <TouchableOpacity activeOpacity={0.7} onPress={onSeeAllPress}>
                        <Text style={styles.headerLink}>see all</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Vertical rows */}
            <View style={styles.list}>
                {displayBooks.map((book) => (
                    <BookRowCard
                        key={book.id}
                        item={book}
                        onPress={onBookPress}
                    />
                ))}
            </View>
        </View>
    );
});

export default InstituteBooks;

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
    list: {
        gap: 8,
    },
    rowCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.grayLight || '#F9FAFB',
        padding: 8,
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cover: {
        width: 58,
        height: 78,
        borderRadius: 6,
        backgroundColor: COLORS.secondary,
    },
    cardBody: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'space-between',
    },
    titleText: {
        fontSize: rf(11.5),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
        marginBottom: 1,
    },
    authorText: {
        fontSize: rf(9.5),
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.textMuted,
        marginBottom: 2,
    },
    descText: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
        lineHeight: 12,
        marginBottom: 4,
    },
    sellerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    sellerAvatar: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 4,
        backgroundColor: COLORS.secondary,
    },
    sellerAvatarFallback: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 4,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sellerAvatarInitial: {
        fontSize: rf(8),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.white,
    },
    sellerName: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    rightActionWrap: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginLeft: 8,
        gap: 6,
    },
    priceText: {
        fontSize: rf(13),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    actionBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    actionBtnText: {
        fontSize: rf(9.5),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.white,
    },
    heartContainer: {
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
});
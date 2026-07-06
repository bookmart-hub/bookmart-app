import React, { memo, useCallback } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    Pressable,
    View,
    FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { NearestBookItem } from '../ui/NearestBooks';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = SPACING.md;
const CARD_WIDTH = SCREEN_WIDTH * 0.28; // Show ~3.5 items (4 visible in a row)

interface SponsoredSectionProps {
    title?: string;
    books: NearestBookItem[];
    onBookPress?: (book: NearestBookItem) => void;
}

const SponsoredCard = memo(
    ({ item, onPress }: { item: NearestBookItem; onPress?: (item: NearestBookItem) => void }) => {
        const handlePress = useCallback(() => {
            Haptics.selectionAsync();
            onPress?.(item);
        }, [item, onPress]);

        return (
            <Pressable onPress={handlePress} style={styles.card}>
                <View style={styles.coverWrap}>
                    <Image
                        source={{ uri: item.coverUri }}
                        style={styles.coverImg}
                        contentFit="cover"
                        recyclingKey={item.coverUri}
                        cachePolicy="memory-disk"
                    />
                    <View style={styles.sponsoredBadge}>
                        <Ionicons name="trending-up" size={rf(14)} color={COLORS.white} />
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
                    </View>
                </View>
            </Pressable>
        );
    },
    (prev, next) => prev.item.id === next.item.id
);

const SponsoredSection: React.FC<SponsoredSectionProps> = memo(({
    title = "Trending Now",
    books,
    onBookPress,
}) => {
    if (books.length === 0) return null;

    const displayBooks = books;

    return (
        <LinearGradient
            colors={['#FFF8E7', '#FDF5E6', COLORS.background]}
            style={styles.section}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={styles.adTag}>
                    <Text style={styles.adTagText}>Ad</Text>
                </View>
            </View>

            <FlatList
                data={displayBooks}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 12}
                snapToAlignment="start"
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: HORIZONTAL_PADDING, paddingBottom: SPACING.md }}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                renderItem={({ item }) => (
                    <SponsoredCard
                        item={item}
                        onPress={onBookPress}
                    />
                )}
            />
        </LinearGradient>
    );
});

export default SponsoredSection;

const styles = StyleSheet.create({
    section: {
        paddingTop: SPACING.md,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingHorizontal: HORIZONTAL_PADDING,
        gap: 8,
    },
    headerTitle: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: '#4B3621', // Dark brown/gold hue
    },
    adTag: {
        backgroundColor: '#E8D5B5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    adTagText: {
        fontSize: rf(9),
        fontFamily: FONTS.montserrat.bold,
        color: '#4B3621',
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.45,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F5E6D3',
    },
    coverWrap: {
        width: '100%',
        height: '65%',
        position: 'relative',
    },
    coverImg: {
        width: '100%',
        height: '80%',
    },
    sponsoredBadge: {
        position: 'absolute',
        top: 4,
        left: 4,
        backgroundColor: COLORS.completeTransparency,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    sponsoredBadgeText: {
        fontSize: rf(7.5),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.white,
        letterSpacing: 0.5,
    },
    infoWrap: {
        paddingHorizontal: rf(6),
        marginTop: rf(-5),
        gap: 2,
    },
    titleText: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
    },
    authorText: {
        fontSize: rf(8),
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
        color: '#D4AF37', // Gold color for price
    },
    distanceText: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
});

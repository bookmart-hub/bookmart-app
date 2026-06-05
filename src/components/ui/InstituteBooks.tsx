import React, { memo, useCallback, useRef } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';

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
const COVER_HEIGHT = '100%';
const ITEM_GAP = 10;
const HORIZONTAL_PADDING = SPACING.md;

// ── SellerPill ────────────────────────────────────────────────────────────────
// Small avatar + name row shown at the bottom of each card

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
                />

                {/* Text content */}
                <View style={styles.cardBody}>
                    {/* Title */}
                    <Text style={styles.titleText} numberOfLines={1}>
                        {item.title}
                    </Text>

                    {/* Author */}
                    <Text style={styles.authorText} numberOfLines={1}>
                        {item.author}
                    </Text>

                    {/* Description snippet */}
                    {item.description ? (
                        <Text style={styles.descText} numberOfLines={3}>
                            {item.description}
                        </Text>
                    ) : null}

                    {/* Spacer pushes seller pill to the bottom */}
                    <View style={styles.spacer} />

                    {/* Seller */}
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
    /**
     * Label shown in the heading — passed in from the user's onboarding
     * data (e.g. "College", "School", "University of Delhi", etc.)
     */
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
    // Keep latest onBookPress accessible without adding it to renderItem's deps
    const onBookPressRef = useRef(onBookPress);
    onBookPressRef.current = onBookPress;

    const renderItem = useCallback(
        ({ item }: { item: InstituteBookItem }) => (
            <InstituteBookCard
                item={item}
                onPress={() => onBookPressRef.current?.(item)}
            />
        ),
        [] // stable — item identity drives re-render, not the callback
    );

    const keyExtractor = useCallback(
        (item: InstituteBookItem) => item.id,
        []
    );

    const getItemLayout = useCallback(
        (_: any, index: number) => ({
            length: CARD_WIDTH + ITEM_GAP,
            offset: (CARD_WIDTH + ITEM_GAP) * index,
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

            {/* ── Card list ── */}
            <FlatList
                horizontal
                data={books}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                getItemLayout={getItemLayout}
                initialNumToRender={3}
                maxToRenderPerBatch={3}
                windowSize={5}
                removeClippedSubviews={true}
                decelerationRate="fast"
                snapToInterval={CARD_WIDTH + ITEM_GAP}
                snapToAlignment="start"
                bounces={false}
            />
        </View>
    );
};

export default InstituteBooks;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    // section: {
    // marginTop: SPACING.lg,
    // },

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
        alignSelf: 'stretch', // fill full card height so spacer works
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
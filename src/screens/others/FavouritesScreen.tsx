import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import Header from '@/components/ui/Header';

const { width, height } = Dimensions.get('window');


const FavouritesScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [favourites, setFavourites] = useState([]);

    const handleRemove = (id: string) => {
        setFavourites(prev => prev.filter(item => item !== id));
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Ionicons name="heart-dislike-outline" size={48} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Favourites Yet</Text>
            <Text style={styles.emptySubtitle}>
                You haven't added any books to your interests yet. Start exploring and save your favourites!
            </Text>
        </View>
    );

    const renderBookCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AppStack', { screen: 'BookDetails' })}
        >
            <Image
                source={item.image}
                style={styles.bookImage}
                contentFit="cover"
                transition={200}
            />
            <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                    <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
                    <TouchableOpacity
                        style={styles.heartBtn}
                        onPress={() => handleRemove(item.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="heart" size={22} color={COLORS.red} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.authorText} numberOfLines={1}>{item.author}</Text>

                <View style={styles.tagsRow}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{item.condition}</Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: COLORS.grayLight }]}>
                        <Ionicons name="location-outline" size={10} color={COLORS.textMuted} />
                        <Text style={[styles.tagText, { color: COLORS.textMuted, marginLeft: 2 }]}>{item.distance}</Text>
                    </View>
                </View>

                <View style={styles.footerRow}>
                    <Text style={styles.priceText}>{item.price}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="My Interests" backButton />

            <FlatList
                data={favourites}
                keyExtractor={item => item.id}
                renderItem={renderBookCard}
                contentContainerStyle={[
                    styles.listContent,
                    favourites.length === 0 && { flex: 1 }
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
            />
        </View>
    );
};

export default FavouritesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.sm,
        marginBottom: SPACING.md,
        elevation: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
    },
    bookImage: {
        width: 80,
        height: 110,
        borderRadius: 10,
        backgroundColor: COLORS.grayLight,
    },
    cardContent: {
        flex: 1,
        marginLeft: SPACING.md,
        justifyContent: 'space-between',
        paddingVertical: SPACING.xs,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    bookTitle: {
        flex: 1,
        fontSize: rf(15),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginRight: SPACING.xs,
    },
    heartBtn: {
        padding: 2,
    },
    authorText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginBottom: SPACING.xs,
    },
    tagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 128, 128, 0.1)', // Light primary
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
        paddingBottom: height * 0.15,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.grayLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    emptyTitle: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: SPACING.xl,
    },
    exploreBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    exploreBtnText: {
        color: COLORS.white,
        fontFamily: FONTS.montserrat.bold,
        fontSize: rf(14),
    },
});

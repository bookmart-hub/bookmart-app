import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/navigation/AppStackNavigator';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { StatusBar } from 'expo-status-bar';
import Header from '@/components/ui/Header';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

// Dummy data matching the design
const MY_LISTINGS = [
    {
        id: '1',
        title: 'Atomic Habits',
        author: 'James Clear',
        price: 350,
        status: 'Active',
        coverUri: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop', // generic book cover
        views: 152,
        likes: 22,
        chats: 8,
    },
    {
        id: '2',
        title: 'The Kite Runner',
        author: 'Khaled Hosseini',
        price: 230,
        status: 'Active',
        coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
        views: 128,
        likes: 18,
        chats: 6,
    },
    {
        id: '3',
        title: '1984',
        author: 'George Orwell',
        price: 200,
        status: 'Active',
        coverUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop',
        views: 98,
        likes: 15,
        chats: 4,
    },
    {
        id: '4',
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        price: 280,
        status: 'Active',
        coverUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
        views: 175,
        likes: 30,
        chats: 12,
    }
];

export default function MyActiveListingsScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const [activeFilter, setActiveFilter] = useState('All');


    const renderSummarySection = () => (
        <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>4 Active Books</Text>
            <Text style={styles.summarySubtitle}>Manage your listed books</Text>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <View style={styles.statIconWrap}>
                        <Ionicons name="book-outline" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.statLabel}>Total Listings</Text>
                    <Text style={styles.statValue}>4</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={styles.statIconWrap}>
                        <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.statLabel}>Total Views</Text>
                    <Text style={styles.statValue}>553</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={styles.statIconWrap}>
                        <Ionicons name="heart-outline" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.statLabel}>Interested</Text>
                    <Text style={styles.statValue}>242</Text>
                </View>
            </View>
        </View>
    );

    const renderBookCard = ({ item }: { item: typeof MY_LISTINGS[0] }) => (
        <View style={styles.bookCard}>
            <Image source={{ uri: item.coverUri }} style={styles.bookCover} contentFit="cover" />
            <View style={styles.bookInfo}>
                <View style={styles.bookHeaderRow}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
                    </View>
                    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                        <Feather name="edit-2" size={14} color={COLORS.primary} />
                        <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bookStatsRow}>
                    <View style={styles.bookStat}>
                        <Ionicons name="eye-outline" size={14} color={COLORS.text} />
                        <Text style={styles.bookStatText}>{item.views}</Text>
                    </View>
                    <View style={styles.bookStat}>
                        <Ionicons name="heart-outline" size={14} color={COLORS.text} />
                        <Text style={styles.bookStatText}>{item.likes}</Text>
                    </View>
                    <View style={styles.bookStat}>
                        <Ionicons name="chatbubble-outline" size={14} color={COLORS.text} />
                        <Text style={styles.bookStatText}>{item.chats}</Text>
                    </View>
                </View>

                <View style={styles.bookFooterRow}>
                    <Text style={styles.bookPrice}>₹{item.price}</Text>
                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                            <Feather name="more-horizontal" size={14} color={COLORS.primary} />
                            <Text style={styles.actionBtnText}>More</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderPromoCard = () => (
        <View style={styles.promoCard}>
            <View style={styles.promoIconWrap}>
                <Ionicons name="rocket-outline" size={28} color={COLORS.primary} />
            </View>
            <View style={styles.promoInfo}>
                <View style={styles.promoTitleRow}>
                    <Text style={styles.promoTitle}>Boost Your Listing</Text>
                    <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                </View>
                <Text style={styles.promoDesc}>Get 3x more visibility and reach more buyers.</Text>
            </View>
            <TouchableOpacity
                style={styles.boostBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('BoostListing')}
            >
                <Text style={styles.boostBtnText}>Boost Now</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />
            <Header backButton title="My Active Listings" />

            <FlatList
                data={MY_LISTINGS}
                keyExtractor={(item) => item.id}
                renderItem={renderBookCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        {renderSummarySection()}
                    </>
                }
                ListFooterComponent={
                    <View style={styles.footerSpacing}>
                        {renderPromoCard()}
                    </View>
                }
            />

            {/* Floating Action Button */}
            <View style={[styles.fabContainer, { bottom: insets.bottom + SPACING.xl * 3 }]}>
                <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
                    <FontAwesome name="book" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    iconBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
    },
    summarySection: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.md,
    },
    summaryTitle: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: 2,
    },
    summarySubtitle: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
        marginBottom: SPACING.md,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.sm,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.sm,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.grayLight,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    statLabel: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    statValue: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
    },
    filtersWrapper: {
        marginBottom: SPACING.md,
    },
    filtersContainer: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    filterChip: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterChipText: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.text,
    },
    filterChipTextActive: {
        color: COLORS.white,
    },
    listContent: {
        paddingBottom: 100, // padding for FAB
    },
    bookCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    bookCover: {
        width: 70,
        height: 95,
        borderRadius: 8,
        backgroundColor: COLORS.grayLight,
    },
    bookInfo: {
        flex: 1,
        marginLeft: SPACING.sm,
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    bookHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    bookTitle: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
        marginBottom: 2,
    },
    bookAuthor: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.greenlight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.green,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.green,
    },
    bookStatsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginVertical: 6,
    },
    bookStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    bookStatText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
    },
    bookFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bookPrice: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        gap: 4,
    },
    actionBtnText: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.primary,
    },
    footerSpacing: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.xl,
    },
    promoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        padding: SPACING.md,
        borderRadius: 20,
    },
    promoIconWrap: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    promoInfo: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    promoTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    promoTitle: {
        fontSize: rf(13),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginRight: 8,
    },
    proBadge: {
        backgroundColor: COLORS.yellow,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    proBadgeText: {
        fontSize: rf(9),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
    },
    promoDesc: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.black,
        lineHeight: 16,
    },
    boostBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        top: rf(13),
    },
    boostBtnText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.white,
    },
    fabContainer: {
        position: 'absolute',
        right: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fab: {
        width: rf(60),
        height: rf(60),
        borderRadius: rf(30),
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});

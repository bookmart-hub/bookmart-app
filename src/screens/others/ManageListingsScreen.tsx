import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const MY_LISTINGS = [
    {
        id: '1',
        title: 'Atomic Habits',
        author: 'James Clear',
        price: 350,
        status: 'Active',
        coverUri: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
        views: 152,
        interested: 22,
        date: '2024-06-25T10:00:00Z'
    },
    {
        id: '2',
        title: 'The Kite Runner',
        author: 'Khaled Hosseini',
        price: 230,
        status: 'Active',
        coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
        views: 128,
        interested: 18,
        date: '2024-06-20T10:00:00Z'
    },
    {
        id: '3',
        title: '1984',
        author: 'George Orwell',
        price: 200,
        status: 'Draft',
        coverUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop',
        views: 98,
        interested: 15,
        date: '2024-05-15T10:00:00Z'
    },
    {
        id: '4',
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        price: 280,
        status: 'Draft',
        coverUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
        views: 175,
        interested: 30,
        date: '2024-06-27T10:00:00Z'
    },
    {
        id: '5',
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        price: 450,
        status: 'Active',
        coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
        views: 210,
        interested: 45,
        date: '2024-06-10T10:00:00Z'
    }
];

const FILTER_CHIPS = ['All', 'Active', 'Draft'];
const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Most Viewed'];

export default function ManageListingsScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();

    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeSort, setActiveSort] = useState('Newest');
    const [showSortOptions, setShowSortOptions] = useState(false);

    useEffect(() => {
        // Simulate network request
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const filteredAndSortedData = useMemo(() => {
        let data = [...MY_LISTINGS];

        // Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            data = data.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.author.toLowerCase().includes(query)
            );
        }

        // Status Filter
        if (activeFilter !== 'All') {
            data = data.filter(item => item.status === activeFilter);
        }

        // Sorting
        data.sort((a, b) => {
            if (activeSort === 'Newest') {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            } else if (activeSort === 'Price: Low to High') {
                return a.price - b.price;
            } else if (activeSort === 'Price: High to Low') {
                return b.price - a.price;
            } else if (activeSort === 'Most Viewed') {
                return b.views - a.views;
            }
            return 0;
        });

        return data;
    }, [searchQuery, activeFilter, activeSort]);

    const handleListingPress = (item: any) => {
        // Navigate to existing MyListings which acts as EditListing
        navigation.navigate('MyListings');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return COLORS.green;
            case 'Draft': return COLORS.primary;
            case 'Draft': return COLORS.textMuted;
            default: return COLORS.grayHeavvy;
        }
    };

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'Active': return COLORS.greenlight;
            case 'Draft': return COLORS.blueLight;
            case 'Draft': return COLORS.grayLight;
            default: return COLORS.white;
        }
    };

    const renderSortOptions = () => {
        if (!showSortOptions) return null;
        return (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.sortOptionsContainer}>
                {SORT_OPTIONS.map((sort) => (
                    <TouchableOpacity
                        key={sort}
                        style={[styles.sortOptionItem, activeSort === sort && styles.sortOptionItemActive]}
                        onPress={() => {
                            setActiveSort(sort);
                            setShowSortOptions(false);
                        }}
                    >
                        <Text style={[styles.sortOptionText, activeSort === sort && styles.sortOptionTextActive]}>
                            {sort}
                        </Text>
                        {activeSort === sort && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
                    </TouchableOpacity>
                ))}
            </Animated.View>
        );
    };

    const renderFilters = () => (
        <View style={styles.filtersWrapper}>
            <FlatList
                data={FILTER_CHIPS}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContainer}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            activeFilter === item && styles.filterChipActive
                        ]}
                        onPress={() => setActiveFilter(item)}
                        activeOpacity={0.8}
                    >
                        <Text style={[
                            styles.filterChipText,
                            activeFilter === item && styles.filterChipTextActive
                        ]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconWrap}>
                <Ionicons name="book-outline" size={48} color={COLORS.grayHeavvy} />
            </View>
            <Text style={styles.emptyTitle}>No Listings Found</Text>
            <Text style={styles.emptyDesc}>
                {searchQuery || activeFilter !== 'All'
                    ? "We couldn't find any listings matching your search or filters."
                    : "You haven't listed any books yet."}
            </Text>
            {(searchQuery || activeFilter !== 'All') && (
                <TouchableOpacity
                    style={styles.clearFiltersBtn}
                    onPress={() => {
                        setSearchQuery('');
                        setActiveFilter('All');
                    }}
                >
                    <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderBookCard = ({ item, index }: { item: typeof MY_LISTINGS[0], index: number }) => (
        <Animated.View entering={FadeIn.delay(index * 100).duration(300)}>
            <TouchableOpacity
                style={styles.bookCard}
                activeOpacity={0.7}
                onPress={() => handleListingPress(item)}
            >
                <Image source={{ uri: item.coverUri }} style={styles.bookCover} contentFit="cover" />
                <View style={styles.bookInfo}>
                    <View style={styles.bookHeaderRow}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                        </View>
                    </View>

                    <View style={styles.bookStatsRow}>
                        <View style={styles.bookStat}>
                            <Ionicons name="eye-outline" size={14} color={COLORS.textMuted} />
                            <Text style={styles.bookStatText}>{item.views}</Text>
                        </View>
                        <View style={styles.bookStat}>
                            <Ionicons name="heart-outline" size={14} color={COLORS.textMuted} />
                            <Text style={styles.bookStatText}>{item.interested}</Text>
                        </View>
                    </View>

                    <View style={styles.bookFooterRow}>
                        <Text style={styles.bookPrice}>₹{item.price}</Text>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            activeOpacity={0.7}
                            onPress={() => handleListingPress(item)}
                        >
                            <Feather name="edit-2" size={14} color={COLORS.primary} />
                            <Text style={styles.actionBtnText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />
            <Header backButton title="Manage Listings" />

            {/* {renderSearchBar()} */}
            {renderSortOptions()}
            {renderFilters()}

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading listings...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredAndSortedData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderBookCard}
                    contentContainerStyle={[
                        styles.listContent,
                        filteredAndSortedData.length === 0 && styles.listContentEmpty,
                        { paddingBottom: insets.bottom + SPACING.xl }
                    ]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    keyboardShouldPersistTaps="handled"
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.md,
        gap: SPACING.sm,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
        borderRadius: 12,
        paddingHorizontal: SPACING.md,
        height: 48,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        // elevation: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: rf(13),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
        height: '100%',
    },
    sortButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        // elevation: 1,
    },
    sortButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    sortOptionsContainer: {
        marginHorizontal: SPACING.lg,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.xs,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        // elevation: 3,
    },
    sortOptionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: SPACING.sm,
        borderRadius: 8,
    },
    sortOptionItemActive: {
        backgroundColor: COLORS.background,
    },
    sortOptionText: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
    },
    sortOptionTextActive: {
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
    filtersWrapper: {
        marginBottom: SPACING.sm,
    },
    filtersContainer: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
        paddingBottom: SPACING.xs,
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
        fontSize: rf(12),
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.text,
    },
    filterChipTextActive: {
        color: COLORS.white,
    },
    listContent: {
        paddingTop: SPACING.sm,
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: SPACING.md,
        fontSize: rf(13),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
        marginTop: 60,
    },
    emptyIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.grayLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    emptyTitle: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: SPACING.xl,
    },
    clearFiltersBtn: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 25,
    },
    clearFiltersText: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.white,
    },
    bookCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        // elevation: -1,
    },
    bookCover: {
        width: 75,
        height: 100,
        borderRadius: 10,
        backgroundColor: COLORS.grayLight,
    },
    bookInfo: {
        flex: 1,
        marginLeft: SPACING.md,
        justifyContent: 'space-between',
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
        marginBottom: 4,
    },
    bookAuthor: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.bold,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    bookStatsRow: {
        flexDirection: 'row',
        gap: SPACING.lg,
        marginVertical: 8,
    },
    bookStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    bookStatText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.semibold,
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
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '10',
        gap: 6,
    },
    actionBtnText: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
});

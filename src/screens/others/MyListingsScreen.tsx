import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/navigation/AppStackNavigator';
import { Menu, Divider } from 'react-native-paper';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { StatusBar } from 'expo-status-bar';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

// Dummy data
const MY_LISTINGS = [
    {
        id: '1',
        title: 'Project Hail Mary',
        price: 290,
        status: 'Available',
        coverUri: 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop',
        condition: 'Like New',
        views: 120,
        likes: 15,
        listedOn: '2023-10-01'
    },
    {
        id: '2',
        title: '1984 by George Orwell',
        price: 150,
        status: 'Available',
        coverUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop',
        condition: 'Good',
        views: 340,
        likes: 42,
        listedOn: '2023-09-15'
    },
    {
        id: '3',
        title: 'The Martian Chronicles',
        price: 200,
        status: 'Available',
        coverUri: 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop',
        condition: 'Acceptable',
        views: 80,
        likes: 5,
        listedOn: '2023-10-05'
    },
    {
        id: '4',
        title: 'Dune',
        price: 300,
        status: 'Sold',
        coverUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
        condition: 'Like New',
        views: 500,
        likes: 80,
        listedOn: '2023-08-20'
    }
];

const FILTER_CHIPS = ['All', 'Available', 'Sold'];

export default function MyListingsScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);
    const [visibleMenu, setVisibleMenu] = useState<string | null>(null);

    const openMenu = (id: string) => setVisibleMenu(id);
    const closeMenu = () => setVisibleMenu(null);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const filteredData = MY_LISTINGS.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' || item.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return COLORS.green;
            case 'Sold': return COLORS.red;
            default: return COLORS.primary;
        }
    };

    const renderItem = ({ item }: { item: typeof MY_LISTINGS[0] }) => (
        <Pressable
            style={styles.card}
        // onPress={() => navigation.navigate('AppStack', { screen: 'BookDetails' })}
        >
            <View style={styles.cardHeader}>
                <Image source={{ uri: item.coverUri }} style={styles.coverImage} />
                <View style={styles.cardInfo}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                        <Menu
                            visible={visibleMenu === item.id}
                            onDismiss={closeMenu}
                            anchor={
                                <TouchableOpacity onPress={() => openMenu(item.id)} style={styles.moreIcon}>
                                    <Feather name="more-vertical" size={20} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            }
                            contentStyle={{ backgroundColor: COLORS.white, borderRadius: 12 }}
                        >
                            <Menu.Item leadingIcon="pencil-outline" onPress={closeMenu} title="Edit" />
                            <Menu.Item leadingIcon="check-circle-outline" onPress={closeMenu} title="Mark as Sold" />
                            <Menu.Item leadingIcon="share-variant-outline" onPress={closeMenu} title="Share" />
                            <Menu.Item leadingIcon="chart-bar" onPress={closeMenu} title="View Analytics" />
                            <Divider />
                            <Menu.Item leadingIcon="delete-outline" onPress={closeMenu} title="Delete" titleStyle={{ color: COLORS.red }} />
                        </Menu>
                    </View>
                    <Text style={styles.price}>₹{item.price}</Text>
                    <View style={styles.badgeRow}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                        </View>
                        <View style={styles.conditionBadge}>
                            <Text style={styles.conditionText}>{item.condition}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Ionicons name="eye-outline" size={16} color={COLORS.textMuted} />
                        <Text style={styles.statText}>{item.views} Views</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="heart-outline" size={16} color={COLORS.textMuted} />
                        <Text style={styles.statText}>{item.likes} Likes</Text>
                    </View>
                </View>
                <Text style={styles.dateText}>Listed {item.listedOn}</Text>
            </View>
        </Pressable>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Listings</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search your listings..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.textMuted}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Chips */}
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

            {/* List */}
            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="book-outline" size={64} color={COLORS.textMuted} />
                        <Text style={styles.emptyTitle}>No listings found</Text>
                        <Text style={styles.emptySubtitle}>You don't have any books listed matching your search or filter.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: COLORS.white,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    headerTitle: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.lg,
        paddingHorizontal: SPACING.md,
        borderRadius: 12,
        height: 48,
        marginBottom: SPACING.md,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    searchIcon: {
        marginRight: SPACING.sm
    },
    searchInput: {
        flex: 1,
        fontSize: rf(13),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text
    },
    filtersWrapper: {
        marginBottom: SPACING.sm
    },
    filtersContainer: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm
    },
    filterChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs + 2,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary
    },
    filterChipText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.textMuted
    },
    filterChipTextActive: {
        color: COLORS.white
    },
    listContainer: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl,
        gap: SPACING.md
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.md,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.md
    },
    coverImage: {
        width: 70,
        height: 100,
        borderRadius: 8,
        backgroundColor: COLORS.grayHeavvy
    },
    cardInfo: {
        flex: 1,
        justifyContent: 'space-between'
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    title: {
        flex: 1,
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.text,
        marginRight: SPACING.sm
    },
    moreIcon: {
        padding: 4
    },
    price: {
        fontSize: rf(15),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
        marginVertical: 4
    },
    badgeRow: {
        flexDirection: 'row',
        gap: SPACING.sm
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3
    },
    statusText: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.bold
    },
    conditionBadge: {
        backgroundColor: COLORS.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
    },
    conditionText: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.grayHeavvy
    },
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.md
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    statText: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted
    },
    dateText: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xl
    },
    emptyTitle: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
        marginTop: SPACING.md,
        marginBottom: SPACING.xs
    },
    emptySubtitle: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
        textAlign: 'center',
        paddingHorizontal: SPACING.xl
    },
});

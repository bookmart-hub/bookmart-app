import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { DISTANCE_FILTERS, MOCK_NEAREST_BOOKS, NearestBook } from '@/data/nearestBooksMockData';

const { width } = Dimensions.get('window');
const COLUMN_GAP = SPACING.md;
const PADDING_HORIZONTAL = SPACING.lg;
// Adjusted for 2 columns with gaps
const CARD_WIDTH = (width - PADDING_HORIZONTAL * 2 - COLUMN_GAP) / 2;

const NearestBooksScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [activeFilter, setActiveFilter] = useState('Upto 20KM');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBooks = useMemo(() => {
        let books = MOCK_NEAREST_BOOKS;
        if (activeFilter) {
            // For demo purposes, we will just filter strictly by the string.
            // In a real app, logic would handle distances properly.
            books = MOCK_NEAREST_BOOKS.filter(book => book.distance === activeFilter);
        }
        if (searchQuery) {
            books = books.filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return books;
    }, [activeFilter, searchQuery]);

    const handleBookPress = useCallback((book: NearestBook) => {
        // Map NearestBook to Book model expected by BookDetailsScreen
        const mappedBook = {
            id: book.id,
            title: book.title,
            imageUri: book.imageUri,
            price: book.price,
            discount: book.discount,
        };
        navigation.navigate('AppStack', { screen: 'BookDetails', params: { book: mappedBook, categoryTitle: 'Nearest' } });
    }, [navigation]);

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
            </TouchableOpacity>

            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color={COLORS.primary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder=""
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="options-outline" size={28} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );

    const renderFilters = () => (
        <View style={styles.filtersWrapper}>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={DISTANCE_FILTERS}
                keyExtractor={item => item}
                contentContainerStyle={styles.filtersContainer}
                renderItem={({ item }) => {
                    const isActive = activeFilter === item;
                    return (
                        <TouchableOpacity
                            onPress={() => setActiveFilter(item)}
                            style={[styles.filterChip, isActive && styles.activeFilterChip]}
                        >
                            <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );

    const renderBookCard = useCallback(({ item }: { item: NearestBook }) => (
        <TouchableOpacity style={styles.cardContainer} onPress={() => handleBookPress(item)} activeOpacity={0.9}>
            <View style={styles.cardInner}>
                <Image
                    source={{ uri: item.imageUri }}
                    style={styles.bookCover}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                />
                <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>

                <View style={styles.bottomRow}>
                    <Text style={styles.discountText}>{item.discount}</Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.currencySymbol}>₹ </Text>
                        <Text style={styles.priceText}>{item.price}</Text>
                    </View>
                </View>
            </View>

            {/* Floating Bag Button */}
            <TouchableOpacity style={styles.fab} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="bag-outline" size={16} color={COLORS.white} />
            </TouchableOpacity>
        </TouchableOpacity>
    ), [handleBookPress]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {renderHeader()}
            {renderFilters()}

            <FlatList
                data={filteredBooks}
                keyExtractor={item => item.id}
                renderItem={renderBookCard}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default NearestBooksScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        marginBottom: SPACING.lg,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: SPACING.md,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.white,
    },
    searchIcon: {
        marginRight: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: rf(14),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.black,
    },
    filtersWrapper: {
        marginBottom: SPACING.lg,
    },
    filtersContainer: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeFilterChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.textMuted,
    },
    activeFilterText: {
        color: COLORS.white,
    },
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl * 2,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    cardContainer: {
        width: CARD_WIDTH,
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    cardInner: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.sm,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        alignItems: 'center',
    },
    bookCover: {
        width: '100%',
        borderRadius: 12,
        marginBottom: SPACING.md,
        backgroundColor: COLORS.grayLight,
        height: 150,
    },
    bookTitle: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.black,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: SPACING.xs,
        marginBottom: SPACING.md, // Leave space for FAB overlapping
    },
    discountText: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.primary,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.primary,
    },
    priceText: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.primary,
    },
    fab: {
        position: 'absolute',
        bottom: -16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
});

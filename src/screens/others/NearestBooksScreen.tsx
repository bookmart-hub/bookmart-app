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
import { DISTANCE_FILTERS, MOCK_CATEGORIES, MOCK_NEAREST_BOOKS, NearestBook } from '@/data/nearestBooksMockData';
import Animated, {
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { Button } from '@/components/ui/Button';

const { width, height } = Dimensions.get('window');
const COLUMN_GAP = SPACING.md;
const PADDING_HORIZONTAL = SPACING.lg;
// Adjusted for 2 columns with gaps
const CARD_WIDTH = (width - PADDING_HORIZONTAL * 2 - COLUMN_GAP) / 2;

const NearestBooksScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [activeFilter, setActiveFilter] = useState('Nearest To You');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [priceRange, setPriceRange] = useState<number>(0);

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
                <Ionicons name="arrow-back" size={28} color={COLORS.black} />
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

            <TouchableOpacity
                onPress={() => setShowFilter(true)}
            >
                <Ionicons name="options-outline" size={28} color={COLORS.primary} />
            </TouchableOpacity>
        </View >
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
            {showFilter && (
                <Animated.View
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(250)}
                    style={[styles.overlay]}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={StyleSheet.absoluteFill}
                        onPress={() => setShowFilter(false)}
                    />

                    <Animated.View
                        entering={FadeIn.duration(250).springify().withInitialValues({
                            transform: [
                                { translateX: (width * 0.75) / 2 },
                                { translateY: -(height * 0.6) / 2 },
                                { scale: 0.05 },
                            ],
                        })}
                        exiting={FadeOut.duration(250).withInitialValues({
                            transform: [
                                { translateX: (width * 0.75) / 2 },
                                { translateY: -(height * 0.6) / 2 },
                                { scale: 0.05 },
                            ],
                        })}
                        style={[
                            styles.filterModal,
                            {
                                transformOrigin: 'top right' as any,
                            }
                        ]}
                    >
                        {/* Filter Content */}
                        <View
                            style={{
                                padding: 20,
                                minHeight: 200,
                            }}>
                            <View
                                style={styles.filterHeader}>
                                <Ionicons name="close-outline" size={28} color={COLORS.black} onPress={() => setShowFilter(false)} />
                                <Text
                                    style={styles.filterTitle}>
                                    Filters
                                </Text>
                                <View />
                            </View>
                            <View style={styles.filterCategoriesContainer}>
                                <Text style={styles.filterCategoriesText}>Categories</Text>
                                <FlatList
                                    data={MOCK_CATEGORIES}
                                    keyExtractor={item => item.id}
                                    numColumns={2}
                                    contentContainerStyle={{
                                        paddingVertical: SPACING.sm,
                                    }}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.filterCategoriesColumnWrapper}
                                            onPress={() => setShowFilter(false)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.filterCategory}>
                                                {item.name}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>

                            <Text style={[styles.filterCategoriesText, { fontSize: rf(12) }]}>Price Range</Text>
                            <Slider
                                style={{ width: 320, height: 40, alignSelf: 'center', }}
                                minimumValue={0}
                                maximumValue={1000}
                                step={1}
                                minimumTrackTintColor={COLORS.text}
                                maximumTrackTintColor={COLORS.grayHeavvy}
                                thumbTintColor={COLORS.primary}
                                onValueChange={value => {
                                    console.log('Slider value:', value);
                                    setPriceRange(value);
                                }}
                            />
                            <View style={styles.priceRangeContainer}>
                                <Text style={styles.priceRangeText}>₹ 0</Text>
                                <Text style={styles.priceRangeText}>₹ {priceRange}</Text>
                            </View>

                            <View style={styles.filterButtonContainer}>
                                <Button title='Clear' variant='outline' onPress={() => setShowFilter(false)} style={{ width: '48%' }} textStyle={{ fontSize: rf(15) }} />
                                <Button title='Apply' onPress={() => setShowFilter(false)} style={{ width: '48%' }} textStyle={{ fontSize: rf(15) }} />
                            </View>
                        </View>
                    </Animated.View>
                </Animated.View>
            )}
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
        marginBottom: SPACING.md,
    },
    filtersContainer: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    filterChip: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#00000069',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    activeFilterChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: rf(10),
        fontFamily: FONTS.montserrat.medium,
        color: COLORS.textMuted,
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.lg + SPACING.md,
    },
    filterTitle: {
        fontFamily: FONTS.manrope.bold,
        fontSize: rf(18),
        color: COLORS.black,
        textAlign: 'center'
    },
    filterCategoriesText: {
        fontFamily: FONTS.manrope.medium,
        fontSize: rf(14),
        color: COLORS.text,
        marginTop: SPACING.md,
    },
    filterCategoriesContainer: {
        marginTop: SPACING.md,
    },
    filterCategoriesColumnWrapper: {
        flex: 1,
        margin: SPACING.xs,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.sm,
        backgroundColor: COLORS.grayLight,
        borderRadius: 16,
        borderTopWidth: 1,
        borderBottomWidth: 0,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.grayHeavvy,
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    priceRangeText: {
        fontFamily: FONTS.manrope.medium,
        fontSize: rf(12),
        color: COLORS.text,
        textAlign: 'center',
        marginTop: -SPACING.md,
    },
    filterButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.lg,
        width: '100%',
        alignSelf: 'center'
    },
    filterCategory: {
        fontFamily: FONTS.montserrat.medium,
        fontSize: rf(11),
        color: COLORS.text,
        textAlign: 'center',
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
    filterModal: {
        width: width * 0.80,
        height: height * 0.75,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        borderTopRightRadius: 4, // Make it look like it's pointing to the icon
        overflow: 'hidden',
        position: 'absolute',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
});

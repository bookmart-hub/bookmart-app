import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { StyleSheet, View, FlatList, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";

import Header from "@/components/ui/Header";
import RecentSearches from "@/components/ui/RecentSearches";
import SearchBar from "@/components/ui/SearchBar";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/api/clients";

const RECENT_SEARCHES_KEY = "@recent_searches";
const MAX_RECENT_SEARCHES = 10;

const getConditionColor = (cond: string) => {
  switch (cond.toUpperCase()) {
    case "NEW":
      return COLORS.green;
    case "LIKE_NEW":
      return COLORS.primary;
    case "GOOD":
      return COLORS.blue;
    case "FAIR":
      return COLORS.yellow;
    case "POOR":
      return COLORS.red;
    default:
      return COLORS.textMuted;
  }
};

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [condition, setCondition] = useState<string | null>(null);
  const [ordering, setOrdering] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Accordion expansion states inside bottom sheet
  const [isConditionExpanded, setIsConditionExpanded] = useState(true);
  const [isOrderingExpanded, setIsOrderingExpanded] = useState(false);
  const [isGenreExpanded, setIsGenreExpanded] = useState(false);
  const [isTagExpanded, setIsTagExpanded] = useState(false);

  // Tag pagination limit
  const [tagsLimit, setTagsLimit] = useState(5);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  // Bottom Sheet Ref & Snapping Points
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%", "85%"], []);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const storedSearches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error("Failed to load recent searches", error);
    }
  };

  const saveRecentSearch = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    try {
      const filteredSearches = recentSearches.filter((item) => item.toLowerCase() !== trimmedQuery.toLowerCase());
      const updatedSearches = [trimmedQuery, ...filteredSearches].slice(0, MAX_RECENT_SEARCHES);

      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
    } catch (error) {
      console.error("Failed to save recent search", error);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
    }
  };

  const handleSelectSearch = (value: string) => {
    setSearchQuery(value);
    saveRecentSearch(value);
  };

  const handleClearAll = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error("Failed to clear recent searches", error);
    }
  };

  const handleResetFilters = () => {
    setCondition(null);
    setOrdering(null);
    setSelectedGenre(null);
    setSelectedTag(null);
  };

  // Queries
  const { data: genres = [] } = useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const response = await api.get("/api/v1/book/genres/");
      return response.data?.results || response.data || [];
    },
  });

  const { data: tagsResponse } = useQuery({
    queryKey: ["tags", tagsLimit],
    queryFn: async () => {
      const response = await api.get("/api/v1/tags/", {
        params: { page_size: tagsLimit },
      });
      return response.data;
    },
  });

  const tagsList = tagsResponse?.results || tagsResponse || [];
  const totalTagsCount = tagsResponse?.count || tagsList.length;

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search-results", searchQuery, condition, ordering, selectedGenre, selectedTag],
    queryFn: async () => {
      if (!searchQuery.trim()) return null;
      let url = `/api/v1/marketplace/listings/?search=${encodeURIComponent(searchQuery)}`;
      if (condition) {
        url += `&condition=${condition}`;
      }
      if (ordering) {
        url += `&ordering=${ordering}`;
      }
      if (selectedGenre) {
        url += `&genre=${selectedGenre}`;
      }
      if (selectedTag) {
        url += `&tag=${selectedTag}`;
      }
      const response = await api.get(url);
      return response.data;
    },
    enabled: searchQuery.trim().length > 0,
  });

  const renderBookItem = ({ item }: { item: any }) => {
    const coverUri =
      item.listing_images?.[0]?.image_url ||
      item.book.cover_url ||
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop";

    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => navigation.navigate("AppStack", { screen: "BookDetails", params: { listingId: item.id } })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: coverUri }} style={styles.bookCover} contentFit="cover" />
        <View style={styles.bookDetails}>
          <View>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {item.book.title}
            </Text>
            <View style={styles.authorChipsRow}>
              {item.book.authors?.map((a: any, idx: number) => (
                <View key={idx} style={styles.authorChip}>
                  <Text style={styles.authorChipText} numberOfLines={1}>
                    {a.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.priceConditionRow}>
            <Text style={styles.bookPrice}>₹{parseFloat(item.price)}</Text>
            <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(item.condition) + "15" }]}>
              <Text style={[styles.conditionText, { color: getConditionColor(item.condition) }]}>{item.condition}</Text>
            </View>
            {item.distance_km != null && (
              <View style={styles.distanceBadge}>
                <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.distanceText}>{item.distance_km.toFixed(1)} km</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const searchList = searchResults?.results || [];

  const conditions = [
    { label: "All Conditions", value: null },
    { label: "New", value: "NEW" },
    { label: "Like New", value: "LIKE_NEW" },
    { label: "Good", value: "GOOD" },
    { label: "Fair", value: "FAIR" },
    { label: "Poor", value: "POOR" },
  ];

  const orderings = [
    { label: "Default", value: null },
    { label: "Price: Low to High", value: "price" },
    { label: "Price: High to Low", value: "-price" },
    { label: "Recently Added", value: "-created_at" },
  ];

  // Backdrop render function
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" />,
    []
  );

  const hasActiveFilters = condition !== null || ordering !== null || selectedGenre !== null || selectedTag !== null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Header title="Search" backButton />

      {/* Row containing Search bar and the filter button */}
      <View style={styles.searchHeaderRow}>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            onClearPress={() => setSearchQuery("")}
            containerStyle={styles.searchBarContainer}
            autoFocus
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => bottomSheetRef.current?.expand()}
          activeOpacity={0.7}
        >
          <Ionicons
            name={hasActiveFilters ? "filter" : "filter-outline"}
            size={20}
            color={hasActiveFilters ? COLORS.white : COLORS.primary}
          />
          {hasActiveFilters && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      {searchQuery.trim().length === 0 ? (
        <RecentSearches searches={recentSearches} onSelect={handleSelectSearch} onClear={handleClearAll} />
      ) : isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : searchList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search terms or filters.</Text>
        </View>
      ) : (
        <FlatList
          data={searchList}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderBookItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        />
      )}

      {/* Filters Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetIndicator}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filters & Sort</Text>
          {hasActiveFilters && (
            <TouchableOpacity onPress={handleResetFilters} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Reset All</Text>
            </TouchableOpacity>
          )}
        </View>

        <BottomSheetScrollView contentContainerStyle={styles.sheetScrollContent} showsVerticalScrollIndicator={false}>
          {/* Accordion 1: Condition */}
          <View style={styles.accordionContainer}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setIsConditionExpanded(!isConditionExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.accordionTitleRow}>
                <Text style={[styles.accordionTitle, condition !== null && styles.accordionTitleActive]}>
                  Condition
                </Text>
                {condition !== null && <View style={styles.activeDot} />}
              </View>
              <Ionicons
                name={isConditionExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={condition !== null ? COLORS.primary : COLORS.textMuted}
              />
            </TouchableOpacity>

            {isConditionExpanded && (
              <View style={styles.accordionContent}>
                {conditions.map((item) => {
                  const isSelected = condition === item.value;
                  return (
                    <TouchableOpacity
                      key={String(item.value)}
                      onPress={() => setCondition(item.value)}
                      style={[styles.filterChip, isSelected && styles.selectedChip]}
                    >
                      <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Accordion 2: Sort By */}
          <View style={styles.accordionContainer}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setIsOrderingExpanded(!isOrderingExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.accordionTitleRow}>
                <Text style={[styles.accordionTitle, ordering !== null && styles.accordionTitleActive]}>Sort by</Text>
                {ordering !== null && <View style={styles.activeDot} />}
              </View>
              <Ionicons
                name={isOrderingExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={ordering !== null ? COLORS.primary : COLORS.textMuted}
              />
            </TouchableOpacity>

            {isOrderingExpanded && (
              <View style={styles.accordionContent}>
                {orderings.map((item) => {
                  const isSelected = ordering === item.value;
                  return (
                    <TouchableOpacity
                      key={String(item.value)}
                      onPress={() => setOrdering(item.value)}
                      style={[styles.filterChip, isSelected && styles.selectedChip]}
                    >
                      <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Accordion 3: Genre */}
          <View style={styles.accordionContainer}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setIsGenreExpanded(!isGenreExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.accordionTitleRow}>
                <Text style={[styles.accordionTitle, selectedGenre !== null && styles.accordionTitleActive]}>
                  Genre
                </Text>
                {selectedGenre !== null && <View style={styles.activeDot} />}
              </View>
              <Ionicons
                name={isGenreExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={selectedGenre !== null ? COLORS.primary : COLORS.textMuted}
              />
            </TouchableOpacity>

            {isGenreExpanded && (
              <View style={styles.accordionContent}>
                <TouchableOpacity
                  onPress={() => setSelectedGenre(null)}
                  style={[styles.filterChip, selectedGenre === null && styles.selectedChip]}
                >
                  <Text style={[styles.chipText, selectedGenre === null && styles.selectedChipText]}>All Genres</Text>
                </TouchableOpacity>
                {genres.map((g: any) => {
                  const isSelected = selectedGenre === g.slug;
                  return (
                    <TouchableOpacity
                      key={g.slug}
                      onPress={() => setSelectedGenre(g.slug)}
                      style={[styles.filterChip, isSelected && styles.selectedChip]}
                    >
                      <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>{g.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Accordion 4: Tags */}
          <View style={styles.accordionContainer}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setIsTagExpanded(!isTagExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.accordionTitleRow}>
                <Text style={[styles.accordionTitle, selectedTag !== null && styles.accordionTitleActive]}>Tags</Text>
                {selectedTag !== null && <View style={styles.activeDot} />}
              </View>
              <Ionicons
                name={isTagExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={selectedTag !== null ? COLORS.primary : COLORS.textMuted}
              />
            </TouchableOpacity>

            {isTagExpanded && (
              <View style={styles.accordionContent}>
                <TouchableOpacity
                  onPress={() => setSelectedTag(null)}
                  style={[styles.filterChip, selectedTag === null && styles.selectedChip]}
                >
                  <Text style={[styles.chipText, selectedTag === null && styles.selectedChipText]}>All Tags</Text>
                </TouchableOpacity>
                {tagsList.map((t: any) => {
                  const isSelected = selectedTag === t.slug;
                  return (
                    <TouchableOpacity
                      key={t.slug}
                      onPress={() => setSelectedTag(t.slug)}
                      style={[styles.filterChip, isSelected && styles.selectedChip]}
                    >
                      <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>#{t.name}</Text>
                    </TouchableOpacity>
                  );
                })}
                {totalTagsCount > tagsLimit && (
                  <TouchableOpacity onPress={() => setTagsLimit(100)} style={[styles.filterChip, styles.moreChip]}>
                    <Text style={styles.moreChipText}>+more</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  searchBarContainer: {
    paddingRight: SPACING.md,
    marginBottom: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: rem(1.125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  listContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  bookCover: {
    width: 68,
    height: 92,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: COLORS.grayLight,
  },
  bookDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  bookTitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    lineHeight: 18,
    marginBottom: 4,
  },
  authorChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 4,
  },
  authorChip: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  authorChipText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.primary,
  },
  priceConditionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  conditionBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  conditionText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.bold,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginLeft: "auto",
  },
  distanceText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  bookPrice: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
  },

  // Bottom Sheet Custom Styles
  sheetBackground: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 24,
  },
  sheetIndicator: {
    backgroundColor: COLORS.grayHeavvy,
    width: 48,
    height: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.md,
  },
  sheetTitle: {
    fontSize: rem(1.125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
  },
  resetButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  resetButtonText: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.montserrat.semibold,
    color: COLORS.red,
  },
  sheetScrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },

  // Collapsible Accordions inside Bottom Sheet
  accordionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
  },
  accordionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  accordionTitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.montserrat.semibold,
    color: COLORS.black,
  },
  accordionTitleActive: {
    color: COLORS.primary,
    fontFamily: FONTS.montserrat.bold,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginLeft: 6,
  },
  accordionContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: SPACING.md,
    paddingBottom: 16,
    paddingTop: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
  },
  selectedChipText: {
    color: COLORS.white,
    fontFamily: FONTS.manrope.bold,
  },
  moreChip: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },
  moreChipText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
});

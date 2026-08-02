import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, FlatList, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

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

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [condition, setCondition] = useState<string | null>(null);
  const [ordering, setOrdering] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

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

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search-results", searchQuery, condition, ordering],
    queryFn: async () => {
      if (!searchQuery.trim()) return null;
      let url = `/api/v1/marketplace/listings/?search=${encodeURIComponent(searchQuery)}`;
      if (condition) {
        url += `&condition=${condition}`;
      }
      if (ordering) {
        url += `&ordering=${ordering}`;
      }
      const response = await api.get(url);
      return response.data;
    },
    enabled: searchQuery.trim().length > 0,
  });

  const renderBookItem = ({ item }: { item: any }) => {
    const authorName = item.book.authors?.map((a: any) => a.name).join(", ") || "Unknown Author";
    const coverUri = item.listing_images?.[0]?.image_url || item.book.cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop";

    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => navigation.navigate("AppStack", { screen: "BookDetails", params: { listingId: item.id } })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: coverUri }} style={styles.bookCover} contentFit="cover" />
        <View style={styles.bookDetails}>
          <Text style={styles.bookTitle} numberOfLines={2}>{item.book.title}</Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>{authorName}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>{item.condition}</Text>
            </View>
            {item.distance_km != null && (
              <View style={styles.distanceBadge}>
                <Ionicons name="location-outline" size={10} color={COLORS.textMuted} />
                <Text style={styles.distanceText}>{item.distance_km.toFixed(1)} km</Text>
              </View>
            )}
          </View>
          <Text style={styles.bookPrice}>₹{parseFloat(item.price)}</Text>
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
    { label: "Acceptable", value: "ACCEPTABLE" },
  ];

  const orderings = [
    { label: "Default", value: null },
    { label: "Price: Low to High", value: "price" },
    { label: "Price: High to Low", value: "-price" },
    { label: "Recently Added", value: "-created_at" },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <Header title="Search" backButton />

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={handleSearchSubmit} autoFocus />

      {searchQuery.trim().length > 0 && (
        <View style={styles.filtersWrapper}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Condition:</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={conditions}
              keyExtractor={(item) => String(item.value)}
              contentContainerStyle={styles.filterChips}
              renderItem={({ item }) => {
                const isSelected = condition === item.value;
                return (
                  <TouchableOpacity
                    onPress={() => setCondition(item.value)}
                    style={[styles.filterChip, isSelected && styles.selectedChip]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sort by:</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={orderings}
              keyExtractor={(item) => String(item.value)}
              contentContainerStyle={styles.filterChips}
              renderItem={({ item }) => {
                const isSelected = ordering === item.value;
                return (
                  <TouchableOpacity
                    onPress={() => setOrdering(item.value)}
                    style={[styles.filterChip, isSelected && styles.selectedChip]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      )}

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
        />
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    gap: SPACING.md,
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  bookCover: {
    width: 80,
    height: 110,
    borderRadius: 8,
    marginRight: SPACING.md,
    backgroundColor: COLORS.grayLight,
  },
  bookDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  bookTitle: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    lineHeight: 20,
  },
  bookAuthor: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  badgeRow: {
    flexDirection: "row",
    gap: SPACING.xs,
    alignItems: "center",
  },
  conditionBadge: {
    backgroundColor: COLORS.primary + "15",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  conditionText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  distanceText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  bookPrice: {
    fontSize: rem(1.0625),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
  filtersWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  filterSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterTitle: {
    fontSize: rem(0.75),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    width: rem(5),
  },
  filterChips: {
    gap: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: COLORS.grayLight,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
  },
  selectedChipText: {
    color: COLORS.white,
    fontFamily: FONTS.manrope.bold,
  },
});

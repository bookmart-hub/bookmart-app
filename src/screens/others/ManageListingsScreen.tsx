import Header from "@/components/ui/Header";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, router } from "expo-router";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/clients";

const FILTER_CHIPS = ["All", "Active", "Sold"];
const SORT_OPTIONS = ["Newest", "Price: Low to High", "Price: High to Low", "Most Liked"];

export default function ManageListingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeSort, setActiveSort] = useState("Newest");
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Fetch Logged-in User Profile to filter by seller
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/api/v1/core/profile/me/");
      return response.data;
    },
  });

  // Fetch all listings
  const { data: listingsData, isLoading, refetch } = useQuery({
    queryKey: ["allListings"],
    queryFn: async () => {
      const response = await api.get("/api/v1/marketplace/listings/");
      return response.data;
    },
  });

  const myListingsList = useMemo(() => {
    if (!listingsData?.results || !userProfile?.user_id) return [];
    // Filter listings belonging to the logged-in user
    return listingsData.results.filter((item: any) => item.seller.id === userProfile.user_id);
  }, [listingsData, userProfile]);

  const filteredAndSortedData = useMemo(() => {
    let data = [...myListingsList];

    // Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          item.book.title.toLowerCase().includes(query) ||
          item.book.authors?.some((a: any) => a.name.toLowerCase().includes(query))
      );
    }

    // Status Filter
    if (activeFilter === "Active") {
      data = data.filter((item) => item.status === "AVAILABLE");
    } else if (activeFilter === "Sold") {
      data = data.filter((item) => item.status === "SOLD");
    }

    // Sorting
    data.sort((a, b) => {
      if (activeSort === "Newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (activeSort === "Price: Low to High") {
        return parseFloat(a.price) - parseFloat(b.price);
      } else if (activeSort === "Price: High to Low") {
        return parseFloat(b.price) - parseFloat(a.price);
      } else if (activeSort === "Most Liked") {
        return (b.favorite_count || 0) - (a.favorite_count || 0);
      }
      return 0;
    });

    return data;
  }, [myListingsList, searchQuery, activeFilter, activeSort]);

  const handleListingPress = (item: any) => {
    // Navigate to listings update edit view
    navigation.navigate("MyListings");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return COLORS.green;
      case "SOLD":
        return COLORS.textMuted;
      default:
        return COLORS.grayHeavvy;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return COLORS.greenlight;
      case "SOLD":
        return "rgba(0,0,0,0.04)";
      default:
        return "rgba(0,0,0,0.02)";
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case "NEW":
        return "New";
      case "LIKE_NEW":
        return "Like New";
      case "GOOD":
        return "Good";
      case "FAIR":
        return "Fair";
      case "POOR":
        return "Poor";
      default:
        return condition;
    }
  };

  const renderSortOptions = () => {
    if (!showSortOptions) return null;
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.sortOptionsContainer}
      >
        {SORT_OPTIONS.map((sort) => (
          <TouchableOpacity
            key={sort}
            style={[styles.sortOptionItem, activeSort === sort && styles.sortOptionItemActive]}
            onPress={() => {
              setActiveSort(sort);
              setShowSortOptions(false);
            }}
          >
            <Text style={[styles.sortOptionText, activeSort === sort && styles.sortOptionTextActive]}>{sort}</Text>
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
            style={[styles.filterChip, activeFilter === item && styles.filterChipActive]}
            onPress={() => setActiveFilter(item)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, activeFilter === item && styles.filterChipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const authorsStr = item.book.authors?.map((a: any) => a.name).join(", ") || "Unknown Author";
    const coverUrl =
      item.listing_images?.[0]?.image_url ||
      item.book.cover_url ||
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop";

    return (
      <TouchableOpacity style={styles.listingCard} activeOpacity={0.9} onPress={() => handleListingPress(item)}>
        <Image source={{ uri: coverUrl }} style={styles.bookCover} contentFit="cover" />
        <View style={styles.cardDetails}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {item.book.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status === "AVAILABLE" ? "Active" : "Sold"}
              </Text>
            </View>
          </View>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            by {authorsStr}
          </Text>

          <View style={styles.cardMiddleRow}>
            <Text style={styles.bookPrice}>₹{parseInt(item.price)}</Text>
            <View style={styles.conditionChip}>
              <Text style={styles.conditionText}>{getConditionLabel(item.condition)}</Text>
            </View>
          </View>

          <View style={styles.cardFooterRow}>
            <View style={styles.footerMetric}>
              <Ionicons name="heart" size={14} color={COLORS.red} />
              <Text style={styles.metricText}>{item.favorite_count || 0} Likes</Text>
            </View>
            <Text style={styles.listingDate}>
              Listed {new Date(item.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="book-outline" size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Listings Yet</Text>
      <Text style={styles.emptySubtitle}>
        You haven't listed any pre-owned books for sale. List books to get buyers instantly.
      </Text>
      <TouchableOpacity style={styles.createBtn} activeOpacity={0.8} onPress={() => router.push("/(tabs)/create")}>
        <Ionicons name="add" size={20} color={COLORS.white} style={{ marginRight: 6 }} />
        <Text style={styles.createBtnText}>Create Listing</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Header title="Manage Listings" backButton />

      {/* Search & Sort Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title or author..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.sortButton, showSortOptions && styles.sortButtonActive]}
          onPress={() => setShowSortOptions(!showSortOptions)}
          activeOpacity={0.7}
        >
          <Ionicons name="funnel-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Sort Overlay dropdown */}
      {renderSortOptions()}

      {/* Filter Chips */}
      {renderFilters()}

      {/* Main List */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedData}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + SPACING.lg }]}
          onRefresh={refetch}
          refreshing={isLoading}
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
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    zIndex: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.02)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    height: 44,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.black,
    padding: 0,
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(0, 128, 128, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sortOptionsContainer: {
    position: "absolute",
    top: 110,
    right: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.xs,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 100,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  sortOptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 10,
    minWidth: 180,
  },
  sortOptionItemActive: {
    backgroundColor: "rgba(0, 128, 128, 0.04)",
  },
  sortOptionText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.black,
  },
  sortOptionTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.manrope.bold,
  },
  filtersWrapper: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
    paddingBottom: SPACING.sm,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.textMuted,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listingCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
    marginBottom: SPACING.xs,
  },
  bookCover: {
    width: 80,
    height: 110,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  cardDetails: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: "space-between",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.xs,
  },
  bookTitle: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.bold,
  },
  bookAuthor: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardMiddleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  bookPrice: {
    fontSize: rem(1),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
  },
  conditionChip: {
    backgroundColor: "rgba(0,0,0,0.02)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  conditionText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.textMuted,
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.03)",
    paddingTop: 6,
  },
  footerMetric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
  },
  listingDate: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    marginTop: rem(6),
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 128, 128, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: rem(1.25),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  createBtnText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.white,
  },
});

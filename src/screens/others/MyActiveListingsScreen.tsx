import Header from "@/components/ui/Header";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { AppStackParamList } from "@/navigation/AppStackNavigator";
import { rem } from "@/utils/responsive";
import { Feather, Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "expo-router";

import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NavigationProp = any;

// Dummy data matching the design
const MY_LISTINGS = [
  {
    id: "1",
    title: "Atomic Habits",
    author: "James Clear",
    price: 350,
    status: "Active",
    coverUri: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop", // generic book cover
    views: 152,
    likes: 22,
    chats: 8,
  },
  {
    id: "2",
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    price: 230,
    status: "Active",
    coverUri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    views: 128,
    likes: 18,
    chats: 6,
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    price: 200,
    status: "Active",
    coverUri: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop",
    views: 98,
    likes: 15,
    chats: 4,
  },
  {
    id: "4",
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 280,
    status: "Active",
    coverUri: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
    views: 175,
    likes: 30,
    chats: 12,
  },
];

import { api } from "@/api/clients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, Alert } from "react-native";

export default function MyActiveListingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("All");

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/api/v1/core/profile/me/");
      return response.data;
    },
  });

  const sellerId = userProfile?.user?.id;

  const {
    data: listingsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-listings", sellerId],
    queryFn: async () => {
      if (!sellerId) return null;
      const response = await api.get(`/api/v1/marketplace/listings/?seller=${sellerId}`);
      return response.data;
    },
    enabled: !!sellerId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/api/v1/marketplace/listings/${id}/`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });

  const handleMorePress = (item: any) => {
    Alert.alert("Manage Listing", `Title: ${item.title}\nStatus: ${item.status}`, [
      {
        text: item.status === "AVAILABLE" ? "Mark as Sold" : "Mark as Available",
        onPress: () => {
          updateStatusMutation.mutate({
            id: item.id,
            status: item.status === "AVAILABLE" ? "SOLD" : "AVAILABLE",
          });
        },
      },
      {
        text: "Delete Listing",
        style: "destructive",
        onPress: () => {
          Alert.alert("Confirm Delete", "Are you sure you want to delete this listing?", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                await api.delete(`/api/v1/marketplace/listings/${item.id}/`);
                queryClient.invalidateQueries({ queryKey: ["my-listings"] });
              },
            },
          ]);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const myListings = useMemo(() => {
    if (!listingsData?.results) return [];
    return listingsData.results.map((item: any) => ({
      id: String(item.id),
      title: item.book.title,
      author: item.book.authors?.map((a: any) => a.name).join(", ") || "Unknown Author",
      price: parseFloat(item.price),
      status: item.status,
      coverUri:
        item.listing_images?.[0]?.image_url ||
        item.book.cover_url ||
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
      views: 12, // Analytics metrics can fall back or be mock
      likes: 3,
      chats: 2,
    }));
  }, [listingsData]);

  const filteredListings = useMemo(() => {
    if (activeFilter === "All") return myListings;
    return myListings.filter((l) => l.status === (activeFilter === "Active" ? "AVAILABLE" : "SOLD"));
  }, [myListings, activeFilter]);

  const renderSummarySection = () => (
    <View style={styles.summarySection}>
      <Text style={styles.summaryTitle}>{myListings.length} Listings</Text>
      <Text style={styles.summarySubtitle}>Manage your listed books</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconWrap}>
            <Ionicons name="book-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.statLabel}>Total Listings</Text>
          <Text style={styles.statValue}>{myListings.length}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconWrap}>
            <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.statLabel}>Total Views</Text>
          <Text style={styles.statValue}>{myListings.reduce((acc, curr) => acc + curr.views, 0)}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconWrap}>
            <Ionicons name="heart-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.statLabel}>Interested</Text>
          <Text style={styles.statValue}>{myListings.reduce((acc, curr) => acc + curr.likes, 0)}</Text>
        </View>
      </View>
    </View>
  );

  const renderBookCard = ({ item }: { item: any }) => (
    <View style={styles.bookCard}>
      <Image source={{ uri: item.coverUri }} style={styles.bookCover} contentFit="cover" />
      <View style={styles.bookInfo}>
        <View style={styles.bookHeaderRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {item.author}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("AppStack", { screen: "Create", params: { editListingId: item.id } })}
          >
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
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={() => handleMorePress(item)}>
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
      <TouchableOpacity style={styles.boostBtn} activeOpacity={0.8} onPress={() => navigation.navigate("BoostListing")}>
        <Text style={styles.boostBtnText}>Boost Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <Header backButton title="My Active Listings" />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<>{renderSummarySection()}</>}
          ListFooterComponent={<View style={styles.footerSpacing}>{renderPromoCard()}</View>}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}

      {/* Floating Action Button */}
      <View style={[styles.fabContainer, { bottom: insets.bottom + SPACING.xl * 3 }]}>
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("AppStack", { screen: "Create" })}
        >
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: rem(1.125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
  },
  summarySection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  summaryTitle: {
    fontSize: rem(1.125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.sm,
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: rem(1.125),
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
    fontSize: rem(0.8125),
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
    flexDirection: "row",
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
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  bookHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bookTitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.greenlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: rem(0.625),
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
    flexDirection: "row",
    gap: SPACING.md,
    marginVertical: 6,
  },
  bookStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bookStatText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
  },
  bookFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookPrice: {
    fontSize: rem(1),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    gap: 4,
  },
  actionBtnText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.semibold,
    color: COLORS.primary,
  },
  footerSpacing: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  promoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    borderRadius: 20,
  },
  promoIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  promoInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  promoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  promoTitle: {
    fontSize: rem(0.8125),
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
    fontSize: rem(0.5625),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
  },
  promoDesc: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.black,
    lineHeight: 16,
  },
  boostBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    top: rem(0.8125),
  },
  boostBtnText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.white,
  },
  fabContainer: {
    position: "absolute",
    right: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    width: rem(3.75),
    height: rem(3.75),
    borderRadius: rem(1.875),
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

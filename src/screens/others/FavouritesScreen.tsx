import Header from "@/components/ui/Header";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/clients";
import { ActivityIndicator } from "react-native";

const FavouritesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const {
    data: wishlistData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await api.get("/api/v1/marketplace/wishlist/");
      return response.data;
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/marketplace/wishlist/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const handleRemove = (id: string) => {
    removeMutation.mutate(id);
  };

  const favourites = React.useMemo(() => {
    if (!wishlistData?.results) return [];
    return wishlistData.results.map((item: any) => ({
      id: String(item.id),
      listingId: item.listing.id,
      title: item.listing.book.title,
      author: item.listing.book.authors?.map((a: any) => a.name).join(", ") || "Unknown Author",
      price: `₹${item.listing.price}`,
      condition: item.listing.condition,
      image:
        item.listing.listing_images?.[0]?.image_url ||
        item.listing.book.cover_url ||
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&auto=format&fit=crop",
      distance: item.listing.distance_km ? `${item.listing.distance_km.toFixed(1)} km` : "Nearby",
    }));
  }, [wishlistData]);

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
      onPress={() => navigation.navigate("AppStack", { screen: "BookDetails", params: { listingId: item.listingId } })}
    >
      <Image source={item.image} style={styles.bookImage} contentFit="cover" transition={200} />
      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => handleRemove(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart" size={22} color={COLORS.red} />
          </TouchableOpacity>
        </View>
        <Text style={styles.authorText} numberOfLines={1}>
          {item.author}
        </Text>

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
      <StatusBar style="dark" />
      <Header title="My Interests" backButton />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={(item) => item.id}
          renderItem={renderBookCard}
          contentContainerStyle={[styles.listContent, favourites.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
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
    flexDirection: "row",
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
    justifyContent: "space-between",
    paddingVertical: SPACING.xs,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bookTitle: {
    flex: 1,
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginRight: SPACING.xs,
  },
  heartBtn: {
    padding: 2,
  },
  authorText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 128, 128, 0.1)", // Light primary
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: rem(1),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    paddingBottom: height * 0.15,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.grayLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: rem(1.125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  exploreBtnText: {
    color: COLORS.white,
    fontFamily: FONTS.montserrat.bold,
    fontSize: rem(0.875),
  },
});

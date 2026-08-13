import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/clients";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React, { memo, useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeartBurst from "./HeartBrust";
import { BookCardSkeleton } from "@/components/skeleton/SkeletonLoader";

const COLUMN_GAP = 16;
const PADDING_HORIZONTAL = SPACING.lg;

interface GenreMasonryLayoutProps {
  genreTitle: string;
}

const MasonryBookCard = memo(({ book, navigation }: { book: any; navigation: any }) => {
  const queryClient = useQueryClient();
  const [showBurst, setShowBurst] = useState(false);

  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await api.get("/api/v1/marketplace/wishlist/");
      return response.data.results || [];
    },
  });

  const wishlistEntry = useMemo(() => {
    if (!wishlistData) return null;
    return wishlistData.find((w: any) => String(w.listing.id) === String(book.id));
  }, [wishlistData, book.id]);

  const isLiked = !!wishlistEntry;

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isLiked && wishlistEntry) {
        await api.delete(`/api/v1/marketplace/wishlist/${wishlistEntry.id}/`);
      } else {
        await api.post("/api/v1/marketplace/wishlist/", { listing: book.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const toggleLike = useCallback(() => {
    if (!isLiked) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 600);
    }
    toggleWishlistMutation.mutate();
  }, [isLiked, toggleWishlistMutation]);

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() =>
        navigation.navigate("AppStack", {
          screen: "BookDetails",
          params: { listingId: book.id, categoryTitle: book.genre || "Genre" },
        })
      }
      activeOpacity={0.9}
    >
      <View style={styles.cardInner}>
        <Image
          source={{ uri: book.imageUri }}
          style={styles.bookCover}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <Text style={styles.bookTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.author}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>₹{book.price}</Text>

          <View style={styles.heartContainer}>
            <TouchableOpacity
              onPress={toggleLike}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={rem(0.9375)}
                color={isLiked ? COLORS.primary : COLORS.textMuted}
              />
            </TouchableOpacity>
            {showBurst && <HeartBurst />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const getSlugFromTitle = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const GenreMasonryLayout = memo(({ genreTitle }: GenreMasonryLayoutProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const genreSlug = getSlugFromTitle(genreTitle);

  // Fetch books matching genre slug
  const {
    data: booksData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["genre-books", genreSlug],
    queryFn: async () => {
      const response = await api.get(`/api/v1/book/books/?genres__slug=${genreSlug}`);
      return response.data;
    },
  });

  const genreBooks = useMemo(() => {
    if (!booksData?.results) return [];
    return booksData.results.map((item: any) => {
      const activeListing = item.ranked_listings?.[0] || item.listings?.[0];
      return {
        id: String(activeListing?.id || item.id),
        title: item.title,
        author: item.authors?.map((a: any) => a.name).join(", ") || "Unknown Author",
        price: activeListing ? parseFloat(activeListing.price) : 250,
        imageUri:
          activeListing?.listing_images?.[0]?.image_url ||
          item.cover_url ||
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop",
        genre: genreTitle,
      };
    });
  }, [booksData, genreTitle]);

  const processedData = useMemo(() => {
    const listItems = [
      { type: "header" as const },
      ...genreBooks.map((book) => ({ type: "book" as const, book })),
    ];
    return listItems;
  }, [genreBooks]);

  const renderItem = ({ item }: { item: any }) => {
    const wrapperStyle = {
      paddingHorizontal: COLUMN_GAP / 2,
      paddingBottom: COLUMN_GAP,
    };

    switch (item.type) {
      case "header":
        return (
          <View style={[styles.headerContainer, wrapperStyle]}>
            <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit={true}>
              {genreTitle}
            </Text>
            <Text style={styles.headerSubtitle}>Explore listings from this category</Text>
          </View>
        );

      case "book":
        return (
          <View style={wrapperStyle}>
            <MasonryBookCard book={item.book} navigation={navigation} />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: SPACING.lg }}>
          <FlatList
            data={Array.from({ length: 4 })}
            keyExtractor={(_, index) => String(index)}
            renderItem={() => <BookCardSkeleton />}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between", marginBottom: COLUMN_GAP }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <FlashList
          data={processedData}
          renderItem={renderItem}
          numColumns={2}
          masonry
          getItemType={(item) => item.type}
          contentContainerStyle={{
            paddingHorizontal: PADDING_HORIZONTAL - COLUMN_GAP / 2,
            paddingBottom: insets.bottom + SPACING.xl,
          }}
          estimatedItemSize={250}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 40 }}>
              <Text style={{ fontFamily: FONTS.manrope.medium, color: COLORS.textMuted }}>No books found in this category.</Text>
            </View>
          }
        />
      )}
    </View>
  );
});

export default GenreMasonryLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  appBar: {
    height: rem(3.5),
    justifyContent: "center",
    paddingHorizontal: PADDING_HORIZONTAL,
  },
  headerContainer: {
    paddingTop: rem(0.5),
    paddingBottom: rem(1.0),
    width: "100%",
  },
  headerTitle: {
    fontSize: rem(2.0),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    marginTop: rem(0.25),
  },
  cardContainer: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: rem(1.0),
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    overflow: "hidden",
  },
  cardInner: {
    padding: rem(0.625),
  },
  bookCover: {
    width: "100%",
    height: rem(12.0),
    borderRadius: rem(0.625),
    backgroundColor: COLORS.background,
  },
  bookTitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
    marginTop: rem(0.625),
  },
  bookAuthor: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: rem(0.625),
  },
  priceText: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
  heartContainer: {
    width: rem(1.75),
    height: rem(1.75),
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
});

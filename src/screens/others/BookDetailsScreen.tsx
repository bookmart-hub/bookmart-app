import { api } from "@/api/clients";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StarRating from "react-native-star-rating-widget";

const { width, height } = Dimensions.get("window");

import HeartBurst from "@/components/ui/HeartBrust";
import { rem } from "@/utils/responsive";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { TextInput } from "react-native";

// Progress indicators matching Home Screen's PromoBanner
const ProgressIndicator = React.memo(({ active }: { active: boolean }) => {
  const progress = useSharedValue(active ? 0 : 1);
  const dotWidth = useSharedValue(active ? rem(1.2) : rem(0.4));

  useEffect(() => {
    cancelAnimation(progress);
    cancelAnimation(dotWidth);
    dotWidth.value = withTiming(active ? rem(1.2) : rem(0.4), { duration: 300 });

    if (active) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: 4000 });
    } else {
      progress.value = 0;
    }
  }, [active]);

  const trackAnimatedStyle = useAnimatedStyle(() => ({
    width: dotWidth.value,
  }));

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Animated.View style={[styles.indicatorTrack, trackAnimatedStyle]}>
      <Animated.View style={[styles.indicatorFill, fillAnimatedStyle]} />
    </Animated.View>
  );
});

const PaginationDots = React.memo(({ count, activeIndex }: { count: number; activeIndex: number }) => {
  return (
    <View style={styles.indicatorContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <ProgressIndicator key={index} active={index === activeIndex} />
      ))}
    </View>
  );
});

const BookDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();

  const [showBurst, setShowBurst] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const initialBook = route.params?.book;
  const listingId = route.params?.listingId || initialBook?.id;

  // Query listing details from backend
  const { data: listingData, isLoading: isListingLoading } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: async () => {
      if (!listingId) return null;
      const response = await api.get(`/api/v1/marketplace/listings/${listingId}/`);
      return response.data;
    },
    enabled: !!listingId,
  });

  const activeBook = useMemo(() => {
    if (listingData) {
      return {
        id: String(listingData.id),
        bookId: String(listingData.book.id),
        title: listingData.book.title,
        coverUri:
          listingData.listing_images?.[0]?.image_url ||
          listingData.book.cover_url ||
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
        price: parseFloat(listingData.price),
        authorsList: listingData.book.authors || [],
        condition: listingData.condition,
        conditionNote: listingData.condition_notes,
        sellerName: listingData.seller.full_name,
        sellerPhone: listingData.seller.phone_number,
        distance: listingData.distance_km != null ? `${listingData.distance_km.toFixed(1)} km away` : null,
        listedDate: new Date(listingData.created_at).toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        description: listingData.book.description || "",
        publisher: listingData.book.publisher || "",
        publishedDate: listingData.book.published_date || "",
        language: listingData.book.language || "",
        isbn13: listingData.book.isbn_13 || "",
        isbn10: listingData.book.isbn_10 || "",
        genresList: listingData.book.genres || [],
        tagsList: listingData.tags || [],
      };
    }
    return initialBook;
  }, [listingData, initialBook]);

  const imagesToDisplay = useMemo(() => {
    if (listingData?.listing_images && listingData.listing_images.length > 0) {
      return listingData.listing_images.map((img: any) => img.image_url);
    }
    return activeBook?.coverUri ? [activeBook.coverUri] : [];
  }, [listingData, activeBook?.coverUri]);

  // Autoscroll hooks and effects
  const flatListRef = useRef<FlatList>(null);
  const currentIndexRef = useRef(0);
  const autoSlideRef = useRef<any>(null);

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0]?.index !== null && viewableItems[0]?.index !== undefined) {
      const index = viewableItems[0].index;
      currentIndexRef.current = index;
      setActiveImageIndex(index);
    }
  }).current;

  const startAutoSlide = useCallback(() => {
    if (imagesToDisplay.length <= 1) return;

    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }

    autoSlideRef.current = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % imagesToDisplay.length;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      currentIndexRef.current = nextIndex;
      setActiveImageIndex(nextIndex);
    }, 4000);
  }, [imagesToDisplay.length]);

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [startAutoSlide]);

  // Load wishlist
  const { data: wishlistData, refetch: refetchWishlist } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await api.get("/api/v1/marketplace/wishlist/");
      return response.data.results || [];
    },
  });

  const isFavorite = useMemo(() => {
    if (!wishlistData || !listingId) return false;
    return wishlistData.some((w: any) => String(w.listing.id) === String(listingId));
  }, [wishlistData, listingId]);

  const wishlistId = useMemo(() => {
    if (!wishlistData || !listingId) return null;
    const found = wishlistData.find((w: any) => String(w.listing.id) === String(listingId));
    return found ? found.id : null;
  }, [wishlistData, listingId]);

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite && wishlistId) {
        await api.delete(`/api/v1/marketplace/wishlist/${wishlistId}/`);
      } else {
        await api.post("/api/v1/marketplace/wishlist/", { listing: listingId });
      }
    },
    onSuccess: () => {
      refetchWishlist();
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const handleFavorite = () => {
    toggleWishlistMutation.mutate();
    if (!isFavorite) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowBurst(true);
      setTimeout(() => {
        setShowBurst(false);
      }, 700);
    } else {
      Haptics.selectionAsync();
    }
  };

  // Log contact
  const logContactMutation = useMutation({
    mutationFn: async (payload: {
      contact_person_name: string;
      book_title: string;
      deal_type: string;
      price_recorded: number;
    }) => {
      await api.post("/api/v1/marketplace/contacts/", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts-ledger"] });
    },
  });

  const handleContactSeller = () => {
    if (!activeBook) return;
    Haptics.selectionAsync();

    const sellerPhone = activeBook.sellerPhone || "919876543210";
    const cleanedPhone = sellerPhone.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(`Hi ${activeBook.sellerName || "Seller"}, I'm interested in buying your book: ${activeBook.title} listed for ₹${activeBook.price}.`)}`;

    logContactMutation.mutate({
      contact_person_name: activeBook.sellerName || "Seller User",
      book_title: activeBook.title,
      deal_type: "BOUGHT",
      price_recorded: activeBook.price,
    });

    Linking.openURL(whatsappUrl).catch((err) => {
      console.error("Failed to open WhatsApp URL", err);
      Alert.alert("Error", "Could not open WhatsApp. Please ensure WhatsApp is installed.");
    });
  };

  // Load reviews
  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", activeBook?.bookId || activeBook?.id],
    queryFn: async () => {
      const bId = listingData?.book?.id || activeBook?.bookId || activeBook?.id;
      if (!bId) return [];
      const response = await api.get(`/api/v1/book/reviews/?book=${bId}`);
      return response.data.results || response.data;
    },
    enabled: !!(listingData?.book?.id || activeBook?.bookId || activeBook?.id),
  });

  const writeReviewMutation = useMutation({
    mutationFn: async (payload: { book: number; rating: number; comment: string }) => {
      await api.post("/api/v1/book/reviews/", payload);
    },
    onSuccess: () => {
      refetchReviews();
      setNewReviewText("");
      setNewReviewRating(0);
    },
    onError: (err: any) => {
      Alert.alert("Error", err.response?.data?.non_field_errors?.[0] || "Failed to submit review.");
    },
  });

  const handleAddReview = () => {
    const bId = listingData?.book?.id || activeBook?.bookId || activeBook?.id;
    if (!bId || newReviewRating === 0 || !newReviewText.trim()) return;

    writeReviewMutation.mutate({
      book: parseInt(bId),
      rating: newReviewRating,
      comment: newReviewText,
    });
  };

  const reviewsList = useMemo(() => {
    if (!reviewsData) return [];
    return reviewsData.map((r: any) => ({
      id: String(r.id),
      reviewerName: r.user,
      rating: r.rating,
      comment: r.comment,
      date: new Date(r.created_at).toLocaleDateString([], { month: "short", day: "numeric" }),
    }));
  }, [reviewsData]);

  const localRatings = useMemo(() => {
    if (reviewsList.length === 0) return null;
    const ratings = {
      average: 4.5,
      totalReviews: reviewsList.length,
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0,
    };
    const sum = reviewsList.reduce((acc: number, curr: any) => {
      const r = Math.round(curr.rating);
      if (r === 5) ratings.fiveStar++;
      else if (r === 4) ratings.fourStar++;
      else if (r === 3) ratings.threeStar++;
      else if (r === 2) ratings.twoStar++;
      else if (r === 1) ratings.oneStar++;
      return acc + curr.rating;
    }, 0);
    ratings.average = Number((sum / reviewsList.length).toFixed(1));
    return ratings;
  }, [reviewsList]);

  const getConditionColor = (cond: string) => {
    if (!cond) return COLORS.textMuted;
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

  const book = activeBook;

  if (isListingLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.errorText}>Book not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: COLORS.primary, fontFamily: FONTS.montserrat.semibold }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Floating circular back button floating above full-width top cover carousel */}
      <TouchableOpacity
        style={[styles.floatingBackButton, { top: insets.top > 0 ? insets.top + 8 : 16 }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color={COLORS.black} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Full-width Carousel (30% of screen length, zero bezel) */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={imagesToDisplay}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => String(index)}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onScrollBeginDrag={() => {
              if (autoSlideRef.current) {
                clearInterval(autoSlideRef.current);
              }
            }}
            onMomentumScrollEnd={(e) => {
              const offset = e.nativeEvent.contentOffset.x;
              const idx = Math.round(offset / width);
              currentIndexRef.current = idx;
              setActiveImageIndex(idx);
              startAutoSlide();
            }}
            renderItem={({ item }) => (
              <View style={styles.carouselImageWrapper}>
                <Image source={{ uri: item }} style={styles.bookImage} contentFit="cover" cachePolicy="memory-disk" />
              </View>
            )}
          />
          {imagesToDisplay.length > 1 && (
            <PaginationDots count={imagesToDisplay.length} activeIndex={activeImageIndex} />
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {book.title}
            </Text>
            <View style={styles.favContainer}>
              <TouchableOpacity onPress={handleFavorite} activeOpacity={0.7}>
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={26}
                  color={isFavorite ? COLORS.primary : COLORS.textMuted}
                />
              </TouchableOpacity>
              {showBurst && <HeartBurst />}
            </View>
          </View>

          {/* Authors as chips */}
          <View style={styles.chipsRow}>
            {book.authorsList?.map((a: any, idx: number) => {
              const authorImageUrl =
                a.image_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop";
              return (
                <View key={idx} style={styles.authorChip}>
                  <Image
                    source={{ uri: authorImageUrl }}
                    style={styles.authorChipAvatar}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                  <Text style={styles.authorChipText}>{a.name}</Text>
                </View>
              );
            })}
          </View>

          {/* Highlights section (Condition, language, distance as pill chips) */}
          <View style={styles.highlightsContainer}>
            <View style={[styles.highlightChip, { backgroundColor: getConditionColor(book.condition) + "12" }]}>
              <Text style={[styles.highlightChipText, { color: getConditionColor(book.condition) }]}>
                {book.condition}
              </Text>
            </View>
            {book.language ? (
              <View style={styles.highlightChip}>
                <Text style={styles.highlightChipText}>{book.language.toUpperCase()}</Text>
              </View>
            ) : null}
            {book.distance ? (
              <View style={styles.highlightChip}>
                <Text style={styles.highlightChipText}>{book.distance}</Text>
              </View>
            ) : null}
          </View>

          {/* Price Box */}
          <View style={styles.bookMetaCard}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>₹{book.price}</Text>
          </View>

          {/* Seller Notes Section */}
          {book.conditionNote ? (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Seller's Notes</Text>
              <View style={styles.notesCard}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color={COLORS.primary}
                  style={{ marginTop: 2 }}
                />
                <Text style={styles.notesText}>{book.conditionNote}</Text>
              </View>
            </View>
          ) : null}

          {/* Listing & Seller Details Card */}
          <View style={styles.sellerDetailsCard}>
            <Text style={styles.sellerCardTitle}>Listing & Seller Info</Text>
            <View style={styles.sellerDetailsRow}>
              <View style={styles.sellerDetailCol}>
                <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
                <View style={styles.sellerDetailTextCol}>
                  <Text style={styles.sellerDetailLabel}>Seller</Text>
                  <Text style={styles.sellerDetailVal} numberOfLines={1}>
                    {book.sellerName || "Seller User"}
                  </Text>
                </View>
              </View>

              {book.distance ? (
                <View style={styles.sellerDetailCol}>
                  <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                  <View style={styles.sellerDetailTextCol}>
                    <Text style={styles.sellerDetailLabel}>Distance</Text>
                    <Text style={styles.sellerDetailVal} numberOfLines={1}>
                      {book.distance}
                    </Text>
                  </View>
                </View>
              ) : null}

              {book.listedDate ? (
                <View style={styles.sellerDetailCol}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                  <View style={styles.sellerDetailTextCol}>
                    <Text style={styles.sellerDetailLabel}>Listed On</Text>
                    <Text style={styles.sellerDetailVal} numberOfLines={1}>
                      {book.listedDate}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          {/* Description Section */}
          {book.description ? (
            <View style={styles.specsSection}>
              <Text style={styles.sectionTitle}>About the Book</Text>
              <Text style={styles.descriptionText}>{book.description}</Text>
            </View>
          ) : null}

          {/* Specifications Grid */}
          <View style={styles.specsSection}>
            <Text style={styles.sectionTitle}>Book Specifications</Text>
            <View style={styles.specsCard}>
              {book.publisher ? (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Publisher</Text>
                  <Text style={styles.specValue}>{book.publisher}</Text>
                </View>
              ) : null}
              {book.publishedDate ? (
                <View style={[styles.specRow, styles.specRowBorder]}>
                  <Text style={styles.specLabel}>Published Date</Text>
                  <Text style={styles.specValue}>{book.publishedDate}</Text>
                </View>
              ) : null}
              {book.language ? (
                <View style={[styles.specRow, styles.specRowBorder]}>
                  <Text style={styles.specLabel}>Language</Text>
                  <Text style={styles.specValue}>{book.language}</Text>
                </View>
              ) : null}
              {book.isbn13 ? (
                <View style={[styles.specRow, styles.specRowBorder]}>
                  <Text style={styles.specLabel}>ISBN-13</Text>
                  <Text style={styles.specValue}>{book.isbn13}</Text>
                </View>
              ) : null}
              {book.isbn10 ? (
                <View style={[styles.specRow, styles.specRowBorder]}>
                  <Text style={styles.specLabel}>ISBN-10</Text>
                  <Text style={styles.specValue}>{book.isbn10}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Genres as chips */}
          {book.genresList && book.genresList.length > 0 ? (
            <View style={styles.genreSection}>
              <Text style={styles.sectionTitle}>Genre</Text>
              <View style={styles.chipsContainer}>
                {book.genresList.map((g: string, idx: number) => (
                  <View key={idx} style={styles.genreChip}>
                    <Text style={styles.genreText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Tags as chips */}
          {book.tagsList && book.tagsList.length > 0 ? (
            <View style={styles.genreSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.chipsContainer}>
                {book.tagsList.map((tag: string, idx: number) => (
                  <View key={idx} style={styles.tagChip}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* Review & Ratings Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewHeaderTitle}>Ratings and reviews</Text>

          {/* Ratings Overview - Only display if reviews count > 0 */}
          {localRatings ? (
            <View style={styles.ratingsOverview}>
              <View style={styles.averageRatingContainer}>
                <Text style={styles.averageRatingText}>{localRatings.average}</Text>
                <StarRating
                  rating={localRatings.average}
                  onChange={() => {}}
                  maxStars={5}
                  starSize={18}
                  color={COLORS.yellow}
                  enableSwiping={false}
                  animationConfig={{ scale: 1 }}
                />
                <Text style={styles.totalReviewsText}>{localRatings.totalReviews} reviews</Text>
              </View>

              <View style={styles.ratingBarsContainer}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count =
                    (localRatings as any)[
                      `${star === 5 ? "five" : star === 4 ? "four" : star === 3 ? "three" : star === 2 ? "two" : "one"}Star`
                    ] || 0;
                  const percentage = (count / localRatings.totalReviews) * 100;
                  return (
                    <View key={star} style={styles.ratingBarRow}>
                      <Text style={styles.starLabel}>{star}</Text>
                      <View style={styles.barBackground}>
                        <View style={[styles.barFill, { width: `${percentage}%` }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Dynamic Reviews List */}
          <View style={styles.reviewsList}>
            {reviewsList.length > 0 ? (
              reviewsList.map((review: any) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeaderRow}>
                    <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <StarRating
                    rating={review.rating}
                    onChange={() => {}}
                    maxStars={5}
                    starSize={14}
                    color={COLORS.yellow}
                    enableSwiping={false}
                    animationConfig={{ scale: 1 }}
                  />
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyReviewsContainer}>
                <Ionicons name="chatbubbles-outline" size={32} color={COLORS.textMuted} style={{ marginBottom: 6 }} />
                <Text style={styles.emptyReviewsText}>No reviews yet. Be the first to share your thoughts!</Text>
              </View>
            )}
          </View>

          {/* Add Review Form */}
          <View style={styles.addReviewContainer}>
            <Text style={styles.addReviewTitle}>Write a Review</Text>
            <StarRating
              rating={newReviewRating}
              onChange={setNewReviewRating}
              maxStars={5}
              starSize={28}
              color={COLORS.yellow}
              style={{ alignSelf: "flex-start", marginBottom: SPACING.md }}
            />
            <TextInput
              style={styles.reviewInput}
              placeholder="What did you think of this book?"
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              value={newReviewText}
              onChangeText={setNewReviewText}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.submitReviewBtn,
                (!newReviewText.trim() || newReviewRating === 0) && styles.submitReviewBtnDisabled,
              ]}
              onPress={handleAddReview}
              disabled={!newReviewText.trim() || newReviewRating === 0}
            >
              <Text style={styles.submitReviewText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar (Optimized Pill Conversion flow) */}
      <View style={[styles.bottomBar, { bottom: insets.bottom > 0 ? insets.bottom + 8 : rem(1.0) }]}>
        <TouchableOpacity style={styles.backCtaButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCtaButton} onPress={handleContactSeller} activeOpacity={0.8}>
          <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} style={{ marginRight: 6 }} />
          <Text style={styles.contactCtaText}>Contact Seller</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BookDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: rem(1),
    fontFamily: FONTS.montserrat.medium,
    color: COLORS.text,
  },
  scrollContent: {
    paddingBottom: rem(5.5),
  },
  floatingBackButton: {
    position: "absolute",
    left: SPACING.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  // Zero-bezel top image carousel (takes up 30% of screen length)
  carouselContainer: {
    width: width,
    height: height * 0.4,
    backgroundColor: COLORS.grayLight,
    position: "relative",
  },
  carouselImageWrapper: {
    width: width,
    height: height * 0.4,
  },
  bookImage: {
    width: "100%",
    height: "100%",
  },
  // Progress indicators layout matching home screen's pagination dots
  indicatorContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    gap: rem(0.3),
  },
  indicatorTrack: {
    width: rem(0.4),
    height: rem(0.1875),
    borderRadius: rem(0.09375),
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  indicatorFill: {
    height: "100%",
    borderRadius: rem(0.09375),
    backgroundColor: COLORS.primary,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  title: {
    flex: 1,
    fontSize: rem(1.25),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginRight: SPACING.md,
    lineHeight: 26,
  },
  favContainer: {
    position: "relative",
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: SPACING.md,
  },
  authorChip: {
    backgroundColor: COLORS.secondary,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  authorChipAvatar: {
    width: rem(1.2),
    height: rem(1.2),
    borderRadius: rem(0.6),
    marginRight: 6,
    backgroundColor: COLORS.grayLight,
  },
  authorChipText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.primary,
  },
  highlightsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: SPACING.md,
  },
  highlightChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  highlightChipText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.text,
  },
  bookMetaCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  priceLabel: {
    fontSize: rem(0.8125),
    color: COLORS.textMuted,
    fontFamily: FONTS.manrope.medium,
  },
  priceValue: {
    fontSize: rem(1.25),
    color: COLORS.primary,
    fontFamily: FONTS.montserrat.bold,
  },
  notesSection: {
    marginBottom: SPACING.md,
  },
  notesCard: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  notesText: {
    flex: 1,
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
    lineHeight: 20,
  },
  sellerDetailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sellerCardTitle: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: 12,
  },
  sellerDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  sellerDetailCol: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  sellerDetailTextCol: {
    flex: 1,
  },
  sellerDetailLabel: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  sellerDetailVal: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.text,
    marginTop: 1,
  },
  specsSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
    lineHeight: 22,
  },
  specsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    paddingHorizontal: SPACING.md,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  specRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.03)",
  },
  specLabel: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  specValue: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.text,
    textAlign: "right",
  },
  genreSection: {
    marginBottom: SPACING.md,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  genreChip: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
  },
  genreText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  tagChip: {
    backgroundColor: COLORS.grayLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
  },
  tagText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
  },
  // Compact pill-shaped CTAs
  bottomBar: {
    position: "absolute",
    left: rem(1.0),
    right: rem(1.0),
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
    borderRadius: 24,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    height: rem(4.2),
  },
  backCtaButton: {
    width: rem(2.8),
    height: rem(2.8),
    borderRadius: rem(1.4),
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  contactCtaButton: {
    flex: 1,
    height: rem(2.8),
    borderRadius: rem(1.4),
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  contactCtaText: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.white,
  },
  reviewSection: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  reviewHeaderTitle: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  ratingsOverview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    padding: SPACING.md,
    borderRadius: 16,
  },
  averageRatingContainer: {
    alignItems: "center",
    marginRight: SPACING.lg,
  },
  averageRatingText: {
    fontSize: rem(2.25),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  totalReviewsText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  ratingBarsContainer: {
    flex: 1,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  starLabel: {
    width: 12,
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.text,
    marginRight: 8,
  },
  barBackground: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.grayLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: COLORS.yellow,
    borderRadius: 3,
  },
  reviewsList: {
    gap: SPACING.md,
  },
  reviewCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  reviewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.montserrat.semibold,
    color: COLORS.black,
  },
  reviewDate: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  reviewComment: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
    marginTop: 8,
    lineHeight: 18,
  },
  emptyReviewsContainer: {
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
  },
  emptyReviewsText: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  addReviewContainer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.03)",
  },
  addReviewTitle: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  reviewInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.black,
    minHeight: 100,
    marginBottom: SPACING.md,
  },
  submitReviewBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rem(3.125),
  },
  submitReviewBtnDisabled: {
    backgroundColor: COLORS.grayHeavvy,
  },
  submitReviewText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.white,
  },
});

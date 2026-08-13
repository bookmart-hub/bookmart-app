import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/clients";
import Header from "@/components/ui/Header";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React, { useState, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NavigationProp = any;

const PLANS = [
  {
    id: "pro",
    name: "PRO",
    books: 1,
    price: "49",
    color: COLORS.primary,
    popular: false,
  },
  {
    id: "pro_plus",
    name: "PRO PLUS",
    books: 3,
    price: "129",
    color: COLORS.primary,
    popular: true,
  },
  {
    id: "ultimate",
    name: "ULTIMATE",
    books: 10,
    price: "299",
    color: COLORS.purple,
    popular: false,
  },
];

export default function BoostListingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();

  const [selectedPlanId, setSelectedPlanId] = useState("pro_plus");
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

  // Fetch current user profile
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/api/v1/core/profile/me/");
      return response.data;
    },
  });

  // Fetch all listings to filter user's own listings on the client
  const { data: listingsData } = useQuery({
    queryKey: ["all-listings"],
    queryFn: async () => {
      const response = await api.get("/api/v1/marketplace/listings/");
      return response.data;
    },
  });

  const myListings = useMemo(() => {
    if (!listingsData?.results || !userProfile?.user_id) return [];
    return listingsData.results
      .filter((item: any) => item.seller.id === userProfile.user_id)
      .map((item: any) => ({
        id: String(item.id),
        title: item.book.title,
        author: item.book.authors?.map((a: any) => a.name).join(", ") || "Unknown Author",
        price: parseFloat(item.price),
        coverUri:
          item.listing_images?.[0]?.image_url ||
          item.book.cover_url ||
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop",
        isBoosted: item.is_boosted || false,
      }));
  }, [listingsData, userProfile]);

  // Set default selection
  React.useEffect(() => {
    if (myListings.length > 0 && selectedBooks.length === 0) {
      // Pre-select first unboosted book if available
      const unboosted = myListings.find((b) => !b.isBoosted);
      if (unboosted) {
        setSelectedBooks([unboosted.id]);
      }
    }
  }, [myListings]);

  const boostMutation = useMutation({
    mutationFn: async (listingId: string) => {
      await api.post(`/api/v1/marketplace/listings/${listingId}/boost/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-listings"] });
    },
  });

  const handleBoostNow = async () => {
    if (selectedBooks.length === 0) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Promise.all(selectedBooks.map((id) => boostMutation.mutateAsync(id)));
      navigation.goBack();
    } catch (err) {
      console.error("Boosting failed:", err);
    }
  };

  const handleToggleBook = (id: string, isBoosted: boolean) => {
    if (isBoosted) return; // Cannot toggle already boosted books here
    if (selectedBooks.includes(id)) {
      setSelectedBooks((prev) => prev.filter((b) => b !== id));
    } else {
      const currentPlan = PLANS.find((p) => p.id === selectedPlanId);
      if (currentPlan && selectedBooks.length < currentPlan.books) {
        setSelectedBooks((prev) => [...prev, id]);
      }
    }
  };

  const renderHero = () => (
    <View style={styles.heroSection}>
      <View style={styles.heroTextContainer}>
        <Text style={styles.heroTitle}>Boost your books</Text>
        <Text style={styles.heroSubtitle}>Increase visibility and reach more students interested in buying.</Text>
      </View>
      <View style={styles.heroImageContainer}>
        {/* Fallback to an icon if custom image is not available, but using Ionicons rocket for now */}
        <Ionicons name="rocket" size={80} color={COLORS.primary} style={{ opacity: 0.8 }} />
      </View>
    </View>
  );

  const renderInfoCard = () => (
    <View style={styles.infoCard}>
      <View style={styles.infoIconWrap}>
        <Ionicons name="stats-chart" size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.infoText}>
        Your boosted books will appear at the top of search results and in relevant categories.
      </Text>
    </View>
  );

  const renderPlans = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Your Plan</Text>
      <View style={styles.plansContainer}>
        {PLANS.map((plan) => {
          const isActive = selectedPlanId === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, isActive && styles.planCardActive]}
              onPress={() => setSelectedPlanId(plan.id)}
              activeOpacity={0.8}
            >
              <View style={styles.planHeaderRow}>
                <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>POPULAR</Text>
                  </View>
                )}
              </View>
              <Text style={styles.planBooksText}>
                Boost <Text style={{ fontFamily: FONTS.manrope.bold }}>{plan.books}</Text> book
                {plan.books > 1 ? "s" : ""}
              </Text>
              <Text style={styles.planBooksText}>per day</Text>

              <Text style={styles.planPrice}>
                ₹{plan.price} <Text style={styles.planPriceSuffix}>/ month</Text>
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderCurrentPlan = () => (
    <View style={styles.currentPlanCard}>
      <View style={styles.currentPlanLeft}>
        <View style={styles.crownIconWrap}>
          <MaterialCommunityIcons name="crown" size={20} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.currentPlanTitle}>Your Current Plan: Pro Plus</Text>
          <Text style={styles.currentPlanSubtitle}>You can boost up to 3 books per day</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.managePlanBtn} activeOpacity={0.7}>
        <Text style={styles.managePlanText}>Manage</Text>
        <Ionicons name="chevron-forward" size={12} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderUsage = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.usageHeaderRow}>
        <Text style={styles.sectionTitle}>Today's Boost Usage</Text>
        <Text style={styles.usageCountText}>1 / 3 books boosted</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: "33.33%" }]} />
      </View>
      <Text style={styles.usageSubText}>You can boost 2 more books today.</Text>
    </View>
  );

  const renderBookSelection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Select Books to Boost</Text>

      <View style={styles.bookListContainer}>
        {myListings.map((book) => {
          const isSelected = selectedBooks.includes(book.id);
          return (
            <TouchableOpacity
              key={book.id}
              style={styles.bookCard}
              onPress={() => handleToggleBook(book.id, book.isBoosted)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: book.coverUri }} style={styles.bookCover} contentFit="fill" />
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={1}>
                  {book.title}
                </Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>
                  {book.author}
                </Text>
                <Text style={styles.bookPrice}>₹{book.price}</Text>
              </View>
              <View style={styles.bookActionArea}>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                </View>
                {book.isBoosted && (
                  <View style={styles.boostedBadge}>
                    <Ionicons name="rocket-outline" size={10} color={COLORS.primary} />
                    <Text style={styles.boostedBadgeText}>Boosted</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.addMoreCard} activeOpacity={0.7}>
        <View style={styles.addMoreRow}>
          <Ionicons name="add" size={18} color={COLORS.primary} />
          <Text style={styles.addMoreText}>Add More Books</Text>
        </View>
        <Text style={styles.addMoreSub}>You can select up to 3 books as per your plan.</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <Header
        title="Boost Listing"
        backButton
        rightElement={
          <TouchableOpacity style={styles.helpIconBtn}>
            <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {renderHero()}
        {renderInfoCard()}
        {renderPlans()}
        {renderCurrentPlan()}
        {renderUsage()}
        {renderBookSelection()}
      </ScrollView>

      {/* Bottom Sticky Summary */}
      <View style={[styles.bottomBar, { bottom: insets.bottom > 0 ? insets.bottom + 8 : rem(1.0) }]}>
        <View style={styles.bottomBarInfo}>
          <Text style={styles.selectedCountText}>
            {selectedBooks.length} book{selectedBooks.length > 1 ? "s" : ""} selected
          </Text>
          <Text style={styles.bottomBarSub}>Boosted books will be visible for 24 hours.</Text>
        </View>
        <View style={styles.bottomBarAction}>
          <TouchableOpacity style={styles.boostNowBtn} activeOpacity={0.8} onPress={handleBoostNow}>
            <Text style={styles.boostNowText}>Boost Now</Text>
          </TouchableOpacity>
          <View style={styles.coinRow}>
            <View style={styles.coinIconWrap}>
              <MaterialCommunityIcons name="circle-multiple-outline" size={12} color={COLORS.yellow} />
            </View>
            <Text style={styles.coinText}>{selectedBooks.length} boost will be used</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  helpIconBtn: {
    padding: SPACING.xs,
  },
  scrollContent: {
    paddingBottom: 120, // space for sticky footer
  },
  heroSection: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    alignItems: "center",
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  heroTitle: {
    fontSize: rem(1.375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.black,
    lineHeight: 20,
    opacity: 0.8,
  },
  heroImageContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: COLORS.secondary,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.text,
    lineHeight: 18,
  },
  sectionContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: rem(1),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  plansContainer: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  planCardActive: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  planHeaderRow: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: SPACING.sm,
    minHeight: rem(1.5),
  },
  planName: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.montserrat.bold,
  },
  popularBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "center",
  },
  popularBadgeText: {
    fontSize: rem(0.5),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.white,
  },
  planBooksText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.text,
    textAlign: "center",
  },
  planPrice: {
    fontSize: rem(1),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginTop: SPACING.md,
  },
  planPriceSuffix: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
  },
  currentPlanCard: {
    flexDirection: "row",
    backgroundColor: COLORS.secondary,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xl,
  },
  currentPlanLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  crownIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  currentPlanTitle: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
  currentPlanSubtitle: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  managePlanBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rem(0.3125),
  },
  managePlanText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
    marginRight: 2,
  },
  usageHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  usageCountText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.grayHeavvy,
    borderRadius: 4,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  usageSubText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
  bookListContainer: {
    gap: SPACING.sm,
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    alignItems: "center",
  },
  bookCover: {
    width: 60,
    height: 85,
    borderRadius: 6,
    backgroundColor: COLORS.grayLight,
  },
  bookInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
    justifyContent: "center",
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
    marginBottom: SPACING.xs,
  },
  bookPrice: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
  bookActionArea: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 70,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.grayHeavvy,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  boostedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: SPACING.sm,
  },
  boostedBadgeText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
    marginLeft: 2,
  },
  addMoreCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.sm,
  },
  addMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  addMoreText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
    marginLeft: 4,
  },
  addMoreSub: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
  },
  bottomBar: {
    position: "absolute",
    left: rem(1.0),
    right: rem(1.0),
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 24,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  bottomBarInfo: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  selectedCountText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  bottomBarSub: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  bottomBarAction: {
    alignItems: "center",
  },
  boostNowBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginBottom: 6,
  },
  boostNowText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.white,
  },
  coinRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinIconWrap: {
    backgroundColor: COLORS.yellowlight,
    borderRadius: 6,
    padding: 2,
    marginRight: 4,
  },
  coinText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
  },
});

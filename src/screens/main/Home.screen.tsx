import { api } from "@/api/clients";
import HomeSkeleton from "@/components/skeleton/HomeSkeleton/HomeSkeleton";
import EditorsChoiceComp from "@/components/smallComp/EditorsChoiceComp";
import EndingSoon from "@/components/smallComp/EndingSoon";
import ExcellentCondition from "@/components/smallComp/ExcellentCondition";
import PeopleViewing from "@/components/smallComp/PeopleViewing";
import RecentlyAdded from "@/components/smallComp/RecentlyAdded";
import SponsoredSection from "@/components/smallComp/SponsoredSection";
import AuthorsSection, { AuthorItem } from "@/components/ui/AuthorsSection";
import CategorySection from "@/components/ui/CategorySection";
import HomeHeader from "@/components/ui/HomeHeader";
import InstituteBooks from "@/components/ui/InstituteBooks";
import NearestBooks from "@/components/ui/NearestBooks";
import PromoBanner, { PromoBannerItem } from "@/components/ui/PromoBanner";
import SearchBar from "@/components/ui/SearchBar";
import { COLORS } from "@/constants/colors";
import { rem } from "@/utils/responsive";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  // ── Queries ──
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/api/v1/core/profile/me/");
      return response.data;
    },
  });

  const { data: listingsData, isLoading: isLoadingListings, refetch: refetchListings } = useQuery({
    queryKey: ["all-listings"],
    queryFn: async () => {
      const response = await api.get("/api/v1/marketplace/listings/");
      return response.data;
    },
  });

  const { data: recommendationsData } = useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      const response = await api.get("/api/v1/book/recommendations/");
      return response.data;
    },
  });

  const { data: authorsData } = useQuery({
    queryKey: ["authors"],
    queryFn: async () => {
      const response = await api.get("/api/v1/book/authors/");
      return response.data;
    },
  });

  // ── Mappers ──
  const mapListingToBook = useCallback((item: any) => ({
    id: String(item.id),
    title: item.book.title,
    author: item.book.authors?.map((a: any) => a.name).join(", ") || "Unknown Author",
    price: parseFloat(item.price),
    coverUri: item.listing_images?.[0]?.image_url || item.book.cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop",
    condition: item.condition,
    distance: item.distance_km ? `${item.distance_km.toFixed(1)}km` : "1.2km",
    description: item.condition_notes || item.book.description || "",
    sellerName: item.seller.full_name,
    sellerAvatarUri: item.seller.profile_image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
  }), []);

  const sponsoredBooks = useMemo(() => {
    if (!listingsData?.results) return [];
    return listingsData.results.slice(0, 4).map(mapListingToBook);
  }, [listingsData, mapListingToBook]);

  const nearestBooks = useMemo(() => {
    if (!listingsData?.results) return [];
    return listingsData.results.slice(0, 6).map(mapListingToBook);
  }, [listingsData, mapListingToBook]);

  const collegeBooks = useMemo(() => {
    if (!listingsData?.results) return [];
    const collegeId = userProfile?.college?.id;
    const filtered = listingsData.results.filter((item: any) => 
      item.seller.id !== userProfile?.user?.id && 
      (!collegeId || item.seller.profile?.college?.id === collegeId)
    );
    return (filtered.length > 0 ? filtered : listingsData.results).slice(0, 6).map(mapListingToBook);
  }, [listingsData, userProfile, mapListingToBook]);

  const recentlyAdded = useMemo(() => {
    if (!listingsData?.results) return [];
    return [...listingsData.results].sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 6).map(mapListingToBook);
  }, [listingsData, mapListingToBook]);

  const excellentCondition = useMemo(() => {
    if (!listingsData?.results) return [];
    return listingsData.results.filter((item: any) => 
      item.condition === "NEW" || item.condition === "LIKE_NEW"
    ).slice(0, 6).map(mapListingToBook);
  }, [listingsData, mapListingToBook]);

  const peopleViewing = useMemo(() => {
    if (!listingsData?.results) return [];
    return listingsData.results.slice().reverse().slice(0, 5).map(mapListingToBook);
  }, [listingsData, mapListingToBook]);

  const endingSoon = useMemo(() => {
    if (!listingsData?.results) return [];
    return listingsData.results.slice(0, 5).map((item: any) => ({
      ...mapListingToBook(item),
      timeLeft: "12h left",
    }));
  }, [listingsData, mapListingToBook]);

  const editorsChoice = useMemo(() => {
    if (!recommendationsData?.results) return null;
    if (recommendationsData.results.length === 0) return null;
    const item = recommendationsData.results[0];
    const activeListing = item.ranked_listings?.[0] || item.listings?.[0];
    return {
      id: String(activeListing?.id || item.id),
      title: item.title,
      author: item.authors?.map((a: any) => a.name).join(", ") || "Unknown Author",
      price: activeListing ? parseFloat(activeListing.price) : 250,
      coverUri: activeListing?.listing_images?.[0]?.image_url || item.cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop",
      condition: activeListing?.condition || "Good",
      distance: "2km",
    };
  }, [recommendationsData]);

  const authors = useMemo(() => {
    if (!authorsData?.results) return [];
    return authorsData.results.map((item: any) => ({
      id: String(item.id),
      name: item.name,
      photoUri: item.image_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      bio: item.bio || "",
      rating: parseFloat(item.rating) || 5,
    }));
  }, [authorsData]);

  const handleNotificationPress = useCallback(() => {
    navigation.navigate("AppStack", { screen: "Notifications" });
  }, [navigation]);

  const handleAvatarPress = useCallback(() => {
    navigation.navigate("AppStack", { screen: "EditProfile" });
  }, [navigation]);

  const handleCtaPress = useCallback((banner: PromoBannerItem) => {
    // Navigate to promotion detail
  }, []);

  const handleBookPress = useCallback(
    (book: any) => {
      navigation.navigate("AppStack", {
        screen: "BookDetails",
        params: { listingId: book.id, categoryTitle: "Non-Fiction" },
      });
    },
    [navigation]
  );

  const handleSeeAllPress = useCallback(() => {
    navigation.navigate("AppStack", { screen: "NearestBooksMap" });
  }, [navigation]);

  const handleInstituteBookPress = useCallback(
    (book: any) => {
      navigation.navigate("AppStack", {
        screen: "BookDetails",
        params: { listingId: book.id, categoryTitle: "Textbooks" },
      });
    },
    [navigation]
  );

  const handleInstituteSeeAllPress = useCallback(() => {
    navigation.navigate("AppStack", { screen: "CollegeInsights" });
  }, [navigation]);

  const handleAuthorPress = useCallback(
    (author: AuthorItem) => {
      navigation.navigate("AppStack", { screen: "AuthorDetails", params: { author } });
    },
    [navigation]
  );

  const handleAuthorSeeAllPress = useCallback(() => {
    navigation.navigate("AppStack", { screen: "AuthorList" });
  }, [navigation]);

  if (isLoadingListings) {
    return <HomeSkeleton />;
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <HomeHeader
        notificationCount={3}
        onNotificationPress={handleNotificationPress}
        onAvatarPress={handleAvatarPress}
      />

      {/* ── Search Bar ── */}
      <SearchBar
        onPress={() => navigation.navigate("AppStack", { screen: "Search" })}
        editable={false}
        onClearPress={() => {}}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
        scrollEventThrottle={16}
      >
        {/* ── Promo Carousel ── */}
        <PromoBanner onCtaPress={handleCtaPress} />

        {/* ── Categories ── */}
        <CategorySection />

        {/* ── Trending / Sponsored ── */}
        {sponsoredBooks.length > 0 && <SponsoredSection books={sponsoredBooks} onBookPress={handleBookPress} />}

        {/* ── Nearest Books ── */}
        {nearestBooks.length > 0 && <NearestBooks books={nearestBooks} onBookPress={handleBookPress} onSeeAllPress={handleSeeAllPress} />}

        {/* ── From Your College ── */}
        {collegeBooks.length > 0 && (
          <InstituteBooks
            instituteName={userProfile?.college?.name || "College"}
            books={collegeBooks}
            onBookPress={handleInstituteBookPress}
            onSeeAllPress={handleInstituteSeeAllPress}
          />
        )}

        {/* ── Authors ── */}
        {authors.length > 0 && <AuthorsSection authors={authors} onAuthorPress={handleAuthorPress} onSeeAllPress={handleAuthorSeeAllPress} />}

        {/* ── Recently Added ── */}
        {recentlyAdded.length > 0 && (
          <RecentlyAdded
            title="Recently Added"
            books={recentlyAdded}
            onBookPress={handleBookPress}
          />
        )}

        {/* ── Excellent Condition ── */}
        {excellentCondition.length > 0 && (
          <ExcellentCondition
            title="Excellent Condition"
            books={excellentCondition}
            onBookPress={handleBookPress}
          />
        )}
        {/* ── People Are Viewing ── */}
        {peopleViewing.length > 0 && (
          <PeopleViewing
            title="People Are Viewing"
            books={peopleViewing}
            onBookPress={handleBookPress}
          />
        )}

        {/* ── Ending Soon ── */}
        {endingSoon.length > 0 && (
          <EndingSoon
            title="Ending Soon"
            books={endingSoon}
            onBookPress={handleBookPress}
          />
        )}

        {/* ── Editor's Choice ── */}
        {editorsChoice && <EditorsChoiceComp item={editorsChoice} onBookPress={handleBookPress} />}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: rem(7.5), // room for floating tab bar
  },
});

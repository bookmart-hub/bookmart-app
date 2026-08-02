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
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Expanded Mock Datasets ──────────────────────────────────────────────────

const SPONSORED_BOOKS = [
  {
    id: "sp1",
    title: "Start with Why",
    author: "Simon Sinek",
    price: 299,
    coverUri: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=440&fit=crop",
    condition: "Like New",
    distance: "1.2km",
  },
  {
    id: "sp2",
    title: "The Lean Startup",
    author: "Eric Ries",
    price: 349,
    coverUri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop",
    condition: "Mint Condition",
    distance: "3.5km",
  },
  {
    id: "sp3",
    title: "The Lean Startup",
    author: "Eric Ries",
    price: 349,
    coverUri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop",
    condition: "Mint Condition",
    distance: "3.5km",
  },
  {
    id: "sp4",
    title: "The Lean Startup",
    author: "Eric Ries",
    price: 349,
    coverUri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop",
    condition: "Mint Condition",
    distance: "3.5km",
  },
];

const NEAREST_BOOKS = [
  {
    id: "n1",
    title: "Ikigai",
    author: "Hector Garcia",
    price: 160,
    coverUri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop",
    condition: "Good Condition",
    distance: "0.8km",
    description: "Find your reason for being. A beautiful guide to a long and happy life.",
  },
  {
    id: "n2",
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    price: 199,
    coverUri: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=440&fit=crop",
    condition: "Like New",
    distance: "1.2km",
    description: "What the rich teach their kids about money.",
  },
  {
    id: "n3",
    title: "Atomic Habits",
    author: "James Clear",
    price: 220,
    coverUri: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop",
    condition: "Good Condition",
    distance: "1.5km",
    description: "Build good habits and break bad ones.",
  },
  {
    id: "n4",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    price: 180,
    coverUri: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop",
    condition: "Acceptable",
    distance: "2.0km",
    description: "Timeless lessons on wealth and happiness.",
  },
  {
    id: "n5",
    title: "Deep Work",
    author: "Cal Newport",
    price: 195,
    coverUri: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=280&fit=crop",
    condition: "Like New",
    distance: "2.3km",
    description: "Rules for focused success.",
  },
  {
    id: "n6",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    price: 400,
    coverUri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop",
    condition: "Good Condition",
    distance: "3.1km",
    description: "A brief history of humankind.",
  },
];

const COLLEGE_BOOKS = [
  {
    id: "cb1",
    title: "Fingersmith",
    author: "Sarah Waters",
    price: 140,
    coverUri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=280&fit=crop",
    description: "Intricate Dickensian plot novel.",
    sellerName: "Amit Roy",
    sellerAvatarUri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
  },
  {
    id: "cb2",
    title: "The Skin and its Girl",
    author: "Sarah Cypher",
    price: 175,
    coverUri: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=280&fit=crop",
    description: "Multigenerational novel about family lore.",
    sellerName: "Sumit Das",
    sellerAvatarUri: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
  },
  {
    id: "cb3",
    title: "Calculus: Early Transcendentals",
    author: "James Stewart",
    price: 550,
    coverUri: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=280&fit=crop",
    description: "Top-selling calculus textbook.",
    sellerName: "Rahul Mehta",
  },
  {
    id: "cb4",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    price: 680,
    coverUri: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=280&fit=crop",
    description: "Standard algorithms reference guide.",
    sellerName: "Priya Sen",
    sellerAvatarUri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face",
  },
  {
    id: "cb5",
    title: "Organic Chemistry",
    author: "Jonathan Clayden",
    price: 490,
    coverUri: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=440&fit=crop",
    description: "Modern guide to organic chemistry.",
    sellerName: "Ananya Roy",
  },
];

const RECENTLY_ADDED = [
  {
    id: "ra1",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    price: 250,
    coverUri: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop",
    condition: "Like New",
    distance: "1km",
  },
  {
    id: "ra2",
    title: "Educated",
    author: "Tara Westover",
    price: 300,
    coverUri: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop",
    condition: "Good",
    distance: "2km",
  },
  {
    id: "ra3",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    price: 400,
    coverUri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop",
    condition: "Like New",
    distance: "3km",
  },
  {
    id: "ra4",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    price: 350,
    coverUri: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=440&fit=crop",
    condition: "Acceptable",
    distance: "1.5km",
  },
  {
    id: "ra5",
    title: "Midnight Library",
    author: "Matt Haig",
    price: 210,
    coverUri: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=440&fit=crop",
    condition: "Good",
    distance: "0.5km",
  },
  {
    id: "ra6",
    title: "Normal People",
    author: "Sally Rooney",
    price: 180,
    coverUri: "https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=300&h=440&fit=crop",
    condition: "Like New",
    distance: "2.5km",
  },
];

const PEOPLE_ARE_VIEWING = [
  {
    id: "pv1",
    title: "Dune",
    author: "Frank Herbert",
    price: 450,
    coverUri: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop",
    condition: "Like New",
    distance: "2km",
  },
  {
    id: "pv2",
    title: "Foundation",
    author: "Isaac Asimov",
    price: 380,
    coverUri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop",
    condition: "Good",
    distance: "1km",
  },
  {
    id: "pv3",
    title: "Neuromancer",
    author: "William Gibson",
    price: 300,
    coverUri: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop",
    condition: "Acceptable",
    distance: "6km",
  },
  {
    id: "pv4",
    title: "Project Hail Mary",
    author: "Andy Weir",
    price: 420,
    coverUri: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=440&fit=crop",
    condition: "Like New",
    distance: "1.8km",
  },
  {
    id: "pv5",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    price: 290,
    coverUri: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=440&fit=crop",
    condition: "Good",
    distance: "4.2km",
  },
];

const ENDING_SOON = [
  {
    id: "es1",
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 150,
    coverUri: "https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=300&h=440&fit=crop",
    condition: "Good",
    distance: "5km",
    timeLeft: "2h left",
  },
  {
    id: "es2",
    title: "1984",
    author: "George Orwell",
    price: 200,
    coverUri: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=440&fit=crop",
    condition: "Like New",
    distance: "4km",
    timeLeft: "5h left",
  },
  {
    id: "es3",
    title: "Brave New World",
    author: "Aldous Huxley",
    price: 180,
    coverUri: "https://images.unsplash.com/photo-1629196914225-eb488db9f0eb?w=300&h=440&fit=crop",
    condition: "Acceptable",
    distance: "8km",
    timeLeft: "10h left",
  },
  {
    id: "es4",
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    price: 170,
    coverUri: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop",
    condition: "Good",
    distance: "3.5km",
    timeLeft: "12h left",
  },
  {
    id: "es5",
    title: "Lord of the Flies",
    author: "William Golding",
    price: 130,
    coverUri: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop",
    condition: "Good",
    distance: "1.2km",
    timeLeft: "18h left",
  },
];

const EXCELLENT_CONDITION = [
  {
    id: "ec1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    price: 220,
    coverUri: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=440&fit=crop",
    condition: "Mint Condition",
    distance: "2km",
  },
  {
    id: "ec2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    price: 280,
    coverUri: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=440&fit=crop",
    condition: "Like New",
    distance: "5km",
  },
  {
    id: "ec3",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    price: 190,
    coverUri: "https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=300&h=440&fit=crop",
    condition: "Mint Condition",
    distance: "3km",
  },
  {
    id: "ec4",
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    price: 340,
    coverUri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop",
    condition: "Mint Condition",
    distance: "4.8km",
  },
  {
    id: "ec5",
    title: "Wuthering Heights",
    author: "Emily Brontë",
    price: 210,
    coverUri: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop",
    condition: "Like New",
    distance: "1.9km",
  },
  {
    id: "ec6",
    title: "Frankenstein",
    author: "Mary Shelley",
    price: 250,
    coverUri: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop",
    condition: "Mint Condition",
    distance: "2.7km",
  },
];

const EDITORS_CHOICE = [
  {
    id: "ed1",
    title: "Steve Jobs",
    author: "Walter Isaacson",
    price: 500,
    coverUri: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop",
    condition: "Like New",
    distance: "4km",
  },
  {
    id: "ed2",
    title: "Shoe Dog",
    author: "Phil Knight",
    price: 400,
    coverUri:
      "https://images.unsplash.com/photo-1656266724092-d979cb85469b?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    condition: "Good",
    distance: "2km",
  },
  {
    id: "ed3",
    title: "Zero to One",
    author: "Peter Thiel",
    price: 350,
    coverUri: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=440&fit=crop",
    condition: "Like New",
    distance: "1km",
  },
];

import { api } from "@/api/clients";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator } from "react-native";

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
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
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

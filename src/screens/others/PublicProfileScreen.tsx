import { Button } from "@/components/ui/Button";
import Header from "@/components/ui/Header";
import HorizontalBookList from "@/components/ui/HorizontalBookList";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { Divider, Menu } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE_BOOKS = [
  {
    id: "1",
    title: "Atomic Habits",
    author: "James Clear",
    price: "350",
    coverUri: "https://m.media-amazon.com/images/I/91bYsX41DVL.jpg",
    condition: "Good",
  },
  {
    id: "2",
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    price: "230",
    coverUri: "https://m.media-amazon.com/images/I/81IzbD2IiIL.jpg",
    condition: "Good",
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    price: "200",
    coverUri: "https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg",
    condition: "Good",
  },
  {
    id: "4",
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: "280",
    coverUri: "https://m.media-amazon.com/images/I/71aFt4+OTOL.jpg",
    condition: "Like New",
  },
];

const SOLD_BOOKS = [
  {
    id: "s1",
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    price: "180",
    coverUri: "https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg",
    condition: "Sold 3 days ago", // Using condition field for sold status
  },
  {
    id: "s2",
    title: "Deep Work",
    author: "Cal Newport",
    price: "220",
    coverUri: "https://m.media-amazon.com/images/I/81qnd0J2hwL.jpg",
    condition: "Sold 1 week ago",
  },
];

import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/clients";
import { ActivityIndicator } from "react-native";
import { useRoute } from "expo-router";

const PublicProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  // profileId passed via route params
  const profileId = route.params?.profileId || route.params?.userId || "me";

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["public-profile", profileId],
    queryFn: async () => {
      const endpoint = profileId === "me" ? "/api/v1/core/profile/me/" : `/api/v1/core/profile/${profileId}/`;
      const response = await api.get(endpoint);
      return response.data;
    },
  });

  const sellerUserId = profileData?.user?.id;

  const { data: listingsData, isLoading: isLoadingListings } = useQuery({
    queryKey: ["seller-listings", sellerUserId],
    queryFn: async () => {
      if (!sellerUserId) return null;
      const response = await api.get(`/api/v1/marketplace/listings/?seller=${sellerUserId}`);
      return response.data;
    },
    enabled: !!sellerUserId,
  });

  const deleteAccount = () => {
    ToastAndroid.show("Account deletion requested", ToastAndroid.SHORT);
    navigation.goBack();
  };

  const activeBooks = React.useMemo(() => {
    if (!listingsData?.results) return [];
    return listingsData.results
      .filter((item: any) => item.status === "AVAILABLE")
      .map((item: any) => ({
        id: String(item.id),
        title: item.book.title,
        author: item.book.authors?.map((a: any) => a.name).join(", ") || "Unknown Author",
        price: String(parseFloat(item.price)),
        coverUri:
          item.listing_images?.[0]?.image_url ||
          item.book.cover_url ||
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop",
        condition: item.condition,
      }));
  }, [listingsData]);

  const soldBooks = React.useMemo(() => {
    if (!listingsData?.results) return [];
    return listingsData.results
      .filter((item: any) => item.status === "SOLD")
      .map((item: any) => ({
        id: String(item.id),
        title: item.book.title,
        author: item.book.authors?.map((a: any) => a.name).join(", ") || "Unknown Author",
        price: String(parseFloat(item.price)),
        coverUri:
          item.listing_images?.[0]?.image_url ||
          item.book.cover_url ||
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop",
        condition: "Sold",
      }));
  }, [listingsData]);

  const handleWhatsAppContact = () => {
    const phone = profileData?.phone_number || "919999999999";
    const text = encodeURIComponent(
      `Hi ${profileData?.user?.full_name || "there"}, I'm interested in buying your books listed on BookMart.`
    );
    Linking.openURL(`https://wa.me/${phone}?text=${text}`).catch(() => {
      Alert.alert("Error", "WhatsApp is not installed on this device");
    });
  };

  if (isLoadingProfile || isLoadingListings) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.quoteText}>Profile details not found.</Text>
      </View>
    );
  }

  const renderProfileHeader = () => (
    <View style={styles.profileHeaderContainer}>
      <View style={styles.profileMainRow}>
        <View style={styles.avatarContainer}>
          {profileData.image ? (
            <Image source={{ uri: profileData.image }} style={{ width: 80, height: 80, borderRadius: 40 }} />
          ) : (
            <Ionicons name="person" size={50} color={COLORS.grayHeavvy} />
          )}
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{profileData.user?.full_name}</Text>
            <View style={styles.badgeContainer}>
              <Ionicons name="shield-checkmark" size={10} color={COLORS.black} />
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={14} color={COLORS.primary} style={styles.infoIcon} />
            <Text style={styles.infoText}>{profileData.college?.name || "B.G.C College"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.primary} style={styles.infoIcon} />
            <Text style={styles.infoText}>{profileData.city_location || "Kolkata, India"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.primary} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Joined{" "}
              {new Date(profileData.user?.date_joined || Date.now()).toLocaleDateString([], {
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.trustedCard}>
          <View style={styles.trustedIconRow}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
            <Text style={styles.trustedTitle}>Trusted{"\n"}Seller</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{activeBooks.length + soldBooks.length}</Text>
        <Text style={styles.statLabel}>Successful Contacts</Text>
        <Text style={styles.statSub}>Through WhatsApp</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{activeBooks.length}</Text>
        <Text style={styles.statLabel}>Active Listings</Text>
        <Text style={styles.statSub}>Books for sale</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{soldBooks.length}</Text>
        <Text style={styles.statLabel}>Books Sold</Text>
        <Text style={styles.statSub}>Successfully</Text>
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <Button
        title="Contact"
        style={styles.actionBtnWhatsApp}
        textStyle={styles.actionBtnTextWhite}
        onPress={handleWhatsAppContact}
        icon={<Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.white} />}
      />
      <Button
        title="Share Profile"
        variant="outline"
        style={styles.actionBtnOutline}
        textStyle={styles.actionBtnTextPrimary}
        icon={<Ionicons name="share-social-outline" size={18} color={COLORS.primary} />}
      />
    </View>
  );

  const renderAbout = () => (
    <View style={styles.aboutContainer}>
      <View style={styles.aboutHeader}>
        <Ionicons name="person-circle" size={20} color={COLORS.primary} />
        <Text style={styles.aboutTitle}>About {profileData.user?.full_name?.split(" ")[0]}</Text>
      </View>
      <Text style={styles.aboutText}>
        {profileData.bio || "Student and book enthusiast. Selling academic and self-help books."}
      </Text>
    </View>
  );

  const renderInfoCards = () => (
    <View style={styles.infoCardsContainer}>
      <View style={styles.collegeCard}>
        <View style={styles.collegeCardHeader}>
          <Ionicons name="business-outline" size={20} color={COLORS.primary} />
          <Text style={styles.collegeCardTitle}>From {profileData.college?.name || "College"}</Text>
        </View>
        <View style={styles.collegeStatsRow}>
          <View style={styles.collegeStatItem}>
            <Text style={styles.collegeStatNumber}>{activeBooks.length}</Text>
            <Text style={styles.collegeStatLabel}>Books Listed</Text>
          </View>
          <View style={styles.collegeStatDivider} />
          <View style={styles.collegeStatItem}>
            <Text style={styles.collegeStatNumber}>{soldBooks.length}</Text>
            <Text style={styles.collegeStatLabel}>Books Sold</Text>
          </View>
        </View>
      </View>

      <View style={styles.ratingsCard}>
        <View style={styles.ratingsHeaderRow}>
          <View>
            <View style={styles.collegeCardHeader}>
              <Ionicons name="star" size={20} color={COLORS.primary} />
              <Text style={styles.collegeCardTitle}>Ratings & Reviews</Text>
            </View>
            <View style={styles.ratingContainer}>
              <View style={styles.ratingScoreRow}>
                <Text style={styles.ratingScore}>4.8</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons key={i} name="star" size={14} color="#FFC107" />
                  ))}
                </View>
                <Text style={styles.reviewCount}>(36 reviews)</Text>
              </View>
              <View style={styles.quotesContainer}>
                <Text style={styles.quoteText}>"Quick response and genuine seller"</Text>
                <Text style={styles.quoteText}>"Book condition exactly as described"</Text>
                <Text style={styles.quoteText}>"Fast WhatsApp communication"</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <Header
        title="Profile"
        backButton
        rightElement={
          <TouchableOpacity>
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <TouchableOpacity style={styles.iconCircle} onPress={openMenu}>
                  <Feather name="more-vertical" size={20} color={COLORS.text} />
                </TouchableOpacity>
              }
              contentStyle={styles.menu}
            >
              <Menu.Item
                leadingIcon="share-variant-outline"
                onPress={() => {
                  closeMenu();
                }}
                title="Share Profile"
              />
              <Divider />

              <Menu.Item
                leadingIcon="trash-can-outline"
                onPress={() => {
                  deleteAccount();
                }}
                title="Delete"
              />
            </Menu>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}
        {renderStats()}
        {renderActions()}
        {renderAbout()}

        {activeBooks.length > 0 && (
          <HorizontalBookList
            title={`Active Books (${activeBooks.length})`}
            books={activeBooks as any}
            cardLayout="standard"
          />
        )}

        {soldBooks.length > 0 && (
          <HorizontalBookList title="Recently Sold" books={soldBooks as any} cardLayout="horizontal" />
        )}

        {renderInfoCards()}
      </ScrollView>
    </View>
  );
};

export default PublicProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  menu: {
    borderRadius: 14,
    backgroundColor: COLORS.white,
    elevation: 5,
  },
  ratingContainer: {
    flex: 1,
    flexDirection: "row",
    gap: rem(0.625),
  },
  scrollContent: {
    paddingTop: SPACING.md,
  },
  profileHeaderContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  profileMainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.grayLight,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.grayHeavvy,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
    flexWrap: "wrap",
  },
  nameText: {
    fontSize: rem(1.125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD54F", // Yellow badge background
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  badgeText: {
    fontSize: rem(0.5625),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  infoIcon: {
    width: 16,
    textAlign: "center",
  },
  infoText: {
    fontSize: rem(0.71875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    flexShrink: 1,
  },
  trustedCard: {
    backgroundColor: COLORS.grayLight,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: COLORS.grayHeavvy,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignItems: "center",
  },
  trustedIconRow: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  trustedTitle: {
    fontSize: rem(0.5625),
    fontFamily: FONTS.montserrat.semibold,
    color: COLORS.primary,
    lineHeight: 14,
  },
  trustedSub: {
    fontSize: rem(0.5625),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: rem(1.125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
    textAlign: "center",
  },
  statSub: {
    fontSize: rem(0.59375),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.grayHeavvy,
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  actionBtnWhatsApp: {
    flex: 1.2,
    backgroundColor: COLORS.primary,
    height: 40,
  },
  actionBtnOutline: {
    flex: 1,
    backgroundColor: "transparent",
    borderColor: COLORS.primary,
    borderWidth: 1,
    height: 40,
  },
  actionBtnTextWhite: {
    fontSize: rem(0.75),
    color: COLORS.white,
  },
  actionBtnTextPrimary: {
    fontSize: rem(0.75),
    color: COLORS.primary,
  },
  aboutContainer: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.grayLight,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  aboutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  aboutTitle: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
  },
  aboutText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  infoCardsContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    gap: SPACING.md,
    flexDirection: "column",
    alignItems: "stretch",
  },
  collegeCard: {
    flex: 0.8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    padding: SPACING.md,
  },
  collegeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    gap: 8,
  },
  collegeCardTitle: {
    fontSize: rem(0.75),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
    flex: 1,
  },
  collegeStatsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  collegeStatItem: {
    flex: 1,
    alignItems: "center",
  },
  collegeStatNumber: {
    fontSize: rem(1),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  collegeStatLabel: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  collegeStatDivider: {
    width: 1,
    height: 25,
    backgroundColor: COLORS.grayHeavvy,
  },
  ratingsCard: {
    flex: 1.2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    padding: SPACING.md,
  },
  ratingsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  ratingScoreRow: {
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  ratingScore: {
    fontSize: rem(1.625),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    marginVertical: 4,
  },
  reviewCount: {
    fontSize: rem(0.5625),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
  },
  quotesContainer: {
    marginLeft: SPACING.md,
    gap: 6,
    justifyContent: "center",
  },
  quoteText: {
    fontSize: rem(0.59375),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
  bottomCTA: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayHeavvy,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  contactBtn: {
    height: rem(3),
    backgroundColor: COLORS.primary,
  },
});

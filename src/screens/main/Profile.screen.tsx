import { api } from "@/api/clients";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem, rf } from "@/utils/responsive";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Dialog, Divider, Menu, Portal, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const QUICK_ACTIONS = [
  {
    id: "waContacts",
    title: "Contacts",
    Icon: Ionicons,
    icon: "chatbox-ellipses-outline",
    color: COLORS.blue,
    bg: COLORS.blueLight,
  },
  {
    id: "sold",
    title: "Sold Books",
    Icon: Feather,
    icon: "shopping-bag",
    color: COLORS.green,
    bg: COLORS.greenlight,
  },
  {
    id: "interests",
    title: "My Interests",
    Icon: Ionicons,
    icon: "heart-outline",
    color: COLORS.red,
    bg: COLORS.redLight,
  },
  {
    id: "requests",
    title: "Requests",
    Icon: MaterialCommunityIcons,
    icon: "clipboard-text-outline",
    color: COLORS.yellow,
    bg: COLORS.yellowlight,
  },
];

const ProfileMenuTile = ({ icon, title, subtitle, color, onPress, isDanger = false, rightElement }: any) => (
  <TouchableOpacity style={styles.toolCard} activeOpacity={0.8} onPress={onPress}>
    <View style={[styles.toolIconWrap, { backgroundColor: isDanger ? "rgba(239, 68, 68, 0.1)" : `${color}20` }]}>
      <Ionicons name={icon} size={22} color={isDanger ? COLORS.red : color} />
    </View>
    <View style={styles.toolContent}>
      <Text style={[styles.toolTitle, isDanger && { color: COLORS.red }]}>{title}</Text>
      {subtitle && <Text style={styles.toolSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement ? (
      rightElement
    ) : (
      <Ionicons name="chevron-forward" size={20} color={isDanger ? COLORS.red : COLORS.textMuted} />
    )}
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [ispublic, setIsPublic] = useState(true);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/api/v1/core/profile/me/");
      return response.data;
    },
  });

  const showLogoutDialog = () => setLogoutVisible(true);
  const hideLogoutDialog = () => setLogoutVisible(false);

  const handleQuickAction = (id: string) => {
    if (id === "requests") {
      navigation.navigate("AppStack", { screen: "RequestPost" });
    } else if (id === "interests") {
      navigation.navigate("AppStack", { screen: "Favourites" });
    } else if (id === "listings") {
      navigation.navigate("AppStack", { screen: "ManageListings" });
    } else if (id === "sold") {
      navigation.navigate("AppStack", { screen: "SoldBooks" });
    } else if (id === "waContacts") {
      navigation.navigate("AppStack", { screen: "Contacts" });
    }
  };
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleLogout = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      if (refreshToken) {
        await api.post("/api/v1/auth/logout/", {
          refresh: refreshToken,
        });
      }
    } catch (error: any) {
      // A 400 error often happens if the token is already expired or blacklisted on the server.
      // We can safely ignore it since we are clearing local data and logging out anyway.
      if (error?.response?.status !== 400 && error?.response?.status !== 401) {
        console.error("Logout API error:", error?.response?.data || error.message);
      }
    } finally {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      await AsyncStorage.removeItem("@bookmart:is_logged_in");

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Auth" }],
        })
      );
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Check out Bookmart - Your Campus Library Companion! Download the app now.",
      });
    } catch (error) {
      console.error("Share error", error);
    }
  };

  const handleRateUs = () => {
    // Platform specific logic for opening app store could go here
    Alert.alert("Rate Us", "Thank you for using Bookmart! Redirecting to Play Store...");
  };

  return (
    <View style={styles.container}>
      {/* Header Section (Gradient Background) */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.headerContainer, { paddingTop: insets.top + SPACING.md }]}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <StatusBar style="light" />

          <Text style={styles.headerTitle}>My Profile</Text>

          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity style={styles.iconCircle} onPress={openMenu}>
                <Feather name="more-vertical" size={20} color={COLORS.white} />
              </TouchableOpacity>
            }
            contentStyle={styles.menu}
          >
            <Menu.Item
              leadingIcon="share-variant-outline"
              onPress={() => {
                closeMenu();
                // Share logic
              }}
              title="Share Profile"
            />

            <Menu.Item
              leadingIcon="account-edit-outline"
              onPress={() => {
                closeMenu();
                navigation.navigate("AppStack", {
                  screen: "EditProfile",
                });
              }}
              title="Edit Profile"
            />
            <Divider />

            {ispublic ? (
              <Menu.Item
                leadingIcon="flag-outline"
                onPress={() => {
                  closeMenu();
                  navigation.navigate("AppStack", {
                    screen: "Report",
                    params: { initialTab: "User" },
                  });
                }}
                title="Report"
              />
            ) : (
              <Menu.Item
                leadingIcon="delete-outline"
                onPress={() => {
                  closeMenu();
                }}
                title="Delete Account"
              />
            )}
          </Menu>
        </View>

        {/* Profile Info */}
        {isLoadingProfile ? (
          <View style={[styles.profileInfoRow, { justifyContent: "center", height: 80 }]}>
            <ActivityIndicator size="large" color={COLORS.white} />
          </View>
        ) : (
          <View style={styles.profileInfoRow}>
            <Image
              source={{
                uri:
                  userProfile?.image ||
                  "https://media.istockphoto.com/id/2220866251/photo/isolated-generic-gray-human-figure-placeholder.webp?a=1&b=1&s=612x612&w=0&k=20&c=vkqNIInBzzIYcuk-wV5KC28xiXfFfYZmAgVOaYebNEA=",
              }}
              contentFit="fill"
              style={styles.avatarPlaceholder}
            />
            <View style={styles.profileDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{userProfile?.full_name || "User"}</Text>
                <View style={styles.topSellerBadge}>
                  <Ionicons name="shield-checkmark" size={12} color={COLORS.black} />
                  <Text style={styles.topSellerText}>Top Seller</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="school-outline" size={14} color={COLORS.text} />
                <Text style={styles.infoText}>{userProfile?.college?.name || "N/A"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.text} />
                <Text style={styles.infoText}>{userProfile?.city_location || "N/A"}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Stats Block */}
        <View style={styles.statsBlock}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1.2K</Text>
            <Text style={styles.statLabel}>Profile Views</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>348</Text>
            <Text style={styles.statLabel}>WhatsApp Contacts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={[styles.sectionContainer, { marginTop: rf(-20) }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                activeOpacity={0.8}
                onPress={() => handleQuickAction(action.id)}
              >
                <View style={[styles.actionIconWrapper, { backgroundColor: action.bg }]}>
                  <action.Icon name={action.icon as any} size={20} color={action.color} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Seller Tools */}
        <View style={[styles.sectionContainer, { marginTop: rf(-10) }]}>
          <Text style={styles.sectionTitle}>Seller Tools</Text>
          <ProfileMenuTile
            icon="list"
            title="Manage Listings"
            subtitle="Edit, delete or update your active books"
            color={COLORS.primary}
            onPress={() => navigation.navigate("AppStack", { screen: "ManageListings" })}
          />
          <ProfileMenuTile
            icon="rocket-outline"
            title="Boost Listing"
            subtitle="Increase visibility and get more buyers"
            color="#F59E0B"
            onPress={() => navigation.navigate("AppStack", { screen: "BoostListing" })}
            rightElement={
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            }
          />
        </View>

        {/* Account Settings */}
        <View style={[styles.sectionContainer, { marginTop: rf(-10) }]}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <ProfileMenuTile
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal details"
            color={COLORS.blue}
            onPress={() => navigation.navigate("AppStack", { screen: "EditProfile" })}
          />
          <ProfileMenuTile
            icon="location-outline"
            title="Saved Addresses"
            subtitle="Manage your delivery addresses"
            color={COLORS.green}
            onPress={() => navigation.navigate("AppStack", { screen: "SavedAddresses" })}
          />
          <ProfileMenuTile
            icon="notifications-outline"
            title="Notifications"
            subtitle="Customize your alert preferences"
            color={COLORS.primary}
            onPress={() => navigation.navigate("AppStack", { screen: "Notifications" })}
          />
        </View>

        {/* Support & Legal */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>General</Text>
          <ProfileMenuTile
            icon="help-buoy-outline"
            title="Help & Support"
            color={COLORS.text}
            onPress={() => navigation.navigate("AppStack", { screen: "HelpSupport" })}
          />
          <ProfileMenuTile
            icon="chatbubbles-outline"
            title="FAQs"
            color={COLORS.text}
            onPress={() => navigation.navigate("AppStack", { screen: "FAQs" })}
          />
          <ProfileMenuTile
            icon="mail-outline"
            title="Contact Us"
            color={COLORS.text}
            // onPress={() => navigation.navigate('AppStack', { screen: 'ContactUs' })}
          />
          <ProfileMenuTile
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            color={COLORS.text}
            onPress={() => navigation.navigate("AppStack", { screen: "PrivacyPolicy" })}
          />
          <ProfileMenuTile
            icon="document-text-outline"
            title="Terms & Conditions"
            color={COLORS.text}
            onPress={() => navigation.navigate("AppStack", { screen: "TermsConditions" })}
          />
          <ProfileMenuTile
            icon="information-circle-outline"
            title="About"
            color={COLORS.text}
            onPress={() => navigation.navigate("AppStack", { screen: "About" })}
          />
          <ProfileMenuTile icon="star-outline" title="Rate Us" color={COLORS.text} onPress={handleRateUs} />
          <ProfileMenuTile icon="share-social-outline" title="Share App" color={COLORS.text} onPress={handleShare} />
        </View>

        {/* Logout Option */}
        <View style={styles.sectionContainer}>
          <ProfileMenuTile
            icon="log-out-outline"
            title="Logout"
            isDanger={true}
            color={COLORS.red}
            onPress={showLogoutDialog}
            rightElement={<View />}
          />
        </View>

        {/* Recent Activities */}
        <View style={styles.sectionContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
          </View>

          <View style={styles.activityCard}>
            <View style={[styles.activityIconWrap, { backgroundColor: "rgba(0, 128, 128, 0.1)" }]}>
              <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Physics Vol.2 viewed 12 times today</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={[styles.activityIconWrap, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
              <Ionicons name="chatbubble-outline" size={20} color="#F59E0B" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>2 new WhatsApp inquiries received</Text>
              <Text style={styles.activityTime}>2 days ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <Portal>
        <Dialog
          visible={logoutVisible}
          onDismiss={hideLogoutDialog}
          style={{ backgroundColor: COLORS.white, borderRadius: 16 }}
        >
          <Dialog.Title
            style={{
              fontFamily: FONTS.montserrat.bold,
              color: COLORS.black,
              fontSize: rem(1.125),
            }}
          >
            Logout
          </Dialog.Title>

          <Dialog.Content>
            <Text
              style={{
                fontFamily: FONTS.manrope.medium,
                color: COLORS.textMuted,
                fontSize: rem(0.875),
              }}
            >
              Are you sure you want to log out?
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={hideLogoutDialog}
              textColor={COLORS.textMuted}
              labelStyle={{ fontFamily: FONTS.manrope.bold }}
            >
              Cancel
            </Button>

            <Button
              onPress={async () => {
                hideLogoutDialog();
                await handleLogout();
              }}
              textColor={COLORS.red}
              labelStyle={{ fontFamily: FONTS.manrope.bold }}
            >
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default ProfileScreen;

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
  headerContainer: {
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    backgroundColor: COLORS.primary,
    elevation: 4,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: rem(1.25),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
  },
  headerIcons: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    marginRight: SPACING.md,
  },
  profileDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  profileName: {
    fontSize: rem(1.25),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
    marginRight: 8,
  },
  topSellerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  topSellerText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  infoText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
    flexShrink: 1,
  },
  statsBlock: {
    flexDirection: "row",
    backgroundColor: COLORS.completeTransparency,
    marginHorizontal: SPACING.lg,
    borderRadius: 16,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  statValue: {
    fontSize: rem(1),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.white,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.regular,
    color: "rgba(255, 255, 255, 0.8)",
  },
  scrollContent: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  sectionContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    justifyContent: "flex-start",
  },
  quickActionCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm * 3) / 4,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs - 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: SPACING.xs,
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
    textAlign: "center",
  },
  toolCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  toolIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  toolSubtitle: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  proBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proBadgeText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  seeAllText: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
});

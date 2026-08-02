import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";

import Header from "@/components/ui/Header";
import SearchBar from "@/components/ui/SearchBar";

interface ContactItem {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  bookTitle: string;
  timestamp: string;
  isPinned: boolean;
  isOnline: boolean;
  lastSeen?: string;
}

const INITIAL_CONTACTS: ContactItem[] = [
  {
    id: "1",
    name: "Rohan Sharma",
    phone: "919876543210",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
    bookTitle: "Concepts of Physics (Vol. 1)",
    timestamp: "10:32 AM",
    isPinned: false,
    isOnline: true,
  },
  {
    id: "2",
    name: "Sneha Patel",
    phone: "919876543211",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    bookTitle: "Atomic Habits",
    timestamp: "Yesterday",
    isPinned: false,
    isOnline: false,
    lastSeen: "Last seen 2h ago",
  },
  {
    id: "3",
    name: "Priyanshu Verma",
    phone: "919876543212",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    bookTitle: "Introduction to Algorithms (CLRS)",
    timestamp: "Yesterday",
    isPinned: false,
    isOnline: true,
  },
  {
    id: "4",
    name: "Ananya Sen",
    phone: "919876543213",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    bookTitle: "Sapiens: A Brief History of Humankind",
    timestamp: "25 Jun",
    isPinned: false,
    isOnline: false,
    lastSeen: "Last seen yesterday",
  },
  {
    id: "5",
    name: "Vikram Aditya",
    phone: "919876543214",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    bookTitle: "Organic Chemistry (Wade)",
    timestamp: "24 Jun",
    isPinned: false,
    isOnline: false,
    lastSeen: "Last seen 3 days ago",
  },
  {
    id: "6",
    name: "Kriti Deshmukh",
    phone: "919876543215",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120",
    bookTitle: "Rich Dad Poor Dad",
    timestamp: "22 Jun",
    isPinned: false,
    isOnline: false,
    lastSeen: "Last seen 5 days ago",
  },
];

import { api } from "@/api/clients";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator } from "react-native";

const ContactsScreen = () => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: contactsData, isLoading, refetch } = useQuery({
    queryKey: ["contacts-ledger"],
    queryFn: async () => {
      const response = await api.get("/api/v1/marketplace/contacts/");
      return response.data;
    },
  });

  const contacts = useMemo(() => {
    if (!contactsData?.results) return [];
    return contactsData.results.map((item: any) => ({
      id: String(item.id),
      name: item.contact_person_name,
      phone: "",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
      bookTitle: item.book_title,
      timestamp: new Date(item.transaction_date).toLocaleDateString([], { month: "short", day: "numeric" }),
      isPinned: false,
      isOnline: false,
    }));
  }, [contactsData]);

  // Search filter
  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((c) => c.name.toLowerCase().includes(query) || c.bookTitle.toLowerCase().includes(query));
  }, [searchQuery, contacts]);

  // Split into pinned and recent (only when search query is empty)
  const isSearchActive = searchQuery.trim().length > 0;
  const pinnedContacts = useMemo(() => filteredContacts.filter((c) => c.isPinned), [filteredContacts]);
  const recentContacts = useMemo(() => filteredContacts.filter((c) => !c.isPinned), [filteredContacts]);

  // Pull-to-refresh implementation
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // WhatsApp redirection logic
  const handleContactPress = useCallback((contact: any) => {
    // If phone is empty we notify the user (WhatsApp is normally started from the listing page directly)
    Alert.alert(
      "WhatsApp Contact",
      `This log records that you contacted seller for "${contact.bookTitle}". Please go to the book detail page to contact again.`
    );
  }, []);

  // FlatList structure with section dividers
  const listData = useMemo(() => {
    if (isSearchActive) {
      return filteredContacts.map((item) => ({ type: "item" as const, data: item }));
    }

    const data: Array<{ type: "header"; title: string } | { type: "item"; data: any }> = [];

    if (pinnedContacts.length > 0) {
      data.push({ type: "header", title: "PINNED CHATS" });
      pinnedContacts.forEach((item) => data.push({ type: "item", data: item }));
    }

    if (recentContacts.length > 0) {
      data.push({ type: "header", title: "RECENT CHATS" });
      recentContacts.forEach((item) => data.push({ type: "item", data: item }));
    }

    return data;
  }, [isSearchActive, filteredContacts, pinnedContacts, recentContacts]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="chatbubble-ellipses-outline" size={48} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No Conversations Found</Text>
      <Text style={styles.emptySubtitle}>
        {isSearchActive
          ? `We couldn't find any chats matching "${searchQuery}". Try a different keyword.`
          : "Your WhatsApp inbox is currently empty. Initiating chats with sellers will populate your history."}
      </Text>
    </View>
  );

  const renderItem = ({ item, index }: { item: (typeof listData)[0]; index: number }) => {
    if (item.type === "header") {
      return (
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderTitle}>{item.title}</Text>
        </View>
      );
    }

    const contact = item.data;

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <TouchableOpacity style={[styles.chatCard]} activeOpacity={0.7} onPress={() => handleContactPress(contact)}>
          {/* Avatar Container */}
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: contact.avatar }} style={styles.avatar} contentFit="cover" transition={200} />
            {contact.isOnline && <View style={styles.onlineBadge} />}
          </View>

          {/* Details Container */}
          <View style={styles.chatDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.contactName} numberOfLines={1}>
                {contact.name}
              </Text>
              <Text style={[styles.timestamp]}>{contact.timestamp}</Text>
            </View>

            {/* Book Tag */}
            <View style={styles.bookBadgeContainer}>
              <View style={styles.bookBadge}>
                <Ionicons name="book-outline" size={10} color={COLORS.primary} style={{ marginRight: 2 }} />
                <Text style={styles.bookBadgeText} numberOfLines={1}>
                  {contact.bookTitle}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Callout */}
          <View style={styles.whatsappIconWrapper}>
            <Ionicons name="logo-whatsapp" size={20} color={COLORS.green} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Custom screen header */}
      <Header
        title="Contact History"
        backButton
        rightElement={
          <View style={styles.headerRightIcon}>
            <Ionicons name="logo-whatsapp" size={24} color={COLORS.primary} />
          </View>
        }
      />

      {/* Embedded search bar component */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name, book or message..."
        onClearPress={() => setSearchQuery("")}
      />

      {/* Contact inbox list */}
      {isLoading && listData.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, index) => (item.type === "header" ? `header-${index}` : item.data.id)}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, listData.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
};

export default ContactsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerRightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  sectionHeaderContainer: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  sectionHeaderTitle: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.textMuted,
    letterSpacing: 1.2,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  unreadChatCard: {
    borderColor: "rgba(0, 128, 128, 0.08)",
    backgroundColor: "#FCFFFF",
  },
  avatarWrapper: {
    position: "relative",
    marginRight: SPACING.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.grayLight,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.green,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  chatDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  contactName: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    flex: 1,
    marginRight: SPACING.sm,
  },
  timestamp: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  unreadTimestamp: {
    color: COLORS.primary,
    fontFamily: FONTS.manrope.bold,
  },
  bookBadgeContainer: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bookBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.darkerTeal,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    maxWidth: "100%",
  },
  bookBadgeText: {
    fontSize: rem(0.59375),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: rem(0.78125),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  unreadMessageText: {
    color: COLORS.black,
    fontFamily: FONTS.manrope.semibold,
  },
  metaColumn: {
    flexDirection: "row",
    alignItems: "center",
  },
  pinIcon: {
    marginLeft: SPACING.xs,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    marginLeft: SPACING.xs,
  },
  unreadBadgeText: {
    color: COLORS.white,
    fontSize: rem(0.5625),
    fontFamily: FONTS.manrope.bold,
  },
  whatsappIconWrapper: {
    marginLeft: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#25D36612",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl * 2,
    paddingVertical: SPACING.xl * 3,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: rem(1.0625),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: rem(0.78125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});

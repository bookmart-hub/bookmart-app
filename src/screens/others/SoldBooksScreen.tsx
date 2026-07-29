import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { AppStackParamList } from "@/navigation/AppStackNavigator";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import { FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Menu } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

// Dummy data
const SOLD_BOOKS = [
  {
    id: "s1",
    title: "Project Hail Mary",
    buyer: "John Doe",
    soldDate: "2023-11-01",
    sellingPrice: 290,
    status: "Delivered",
    coverUri: "https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop",
  },
  {
    id: "s2",
    title: "Dune",
    buyer: "Alice Smith",
    soldDate: "2023-10-15",
    sellingPrice: 300,
    status: "In Transit",
    coverUri: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
  },
  {
    id: "s3",
    title: "Atomic Habits",
    buyer: "Bob Johnson",
    soldDate: "2023-09-20",
    sellingPrice: 400,
    status: "Delivered",
    coverUri: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
  },
];

const SORT_OPTIONS = [
  { label: "Recent", value: "recent" },
  { label: "Price (High to Low)", value: "price_desc" },
  { label: "Date (Oldest First)", value: "date_asc" },
];

export default function SoldBooksScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [sortMenuVisible, setSortMenuVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  let filteredData = [...SOLD_BOOKS].filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.buyer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (sortBy === "price_desc") {
    filteredData.sort((a, b) => b.sellingPrice - a.sellingPrice);
  } else if (sortBy === "date_asc") {
    filteredData.sort((a, b) => new Date(a.soldDate).getTime() - new Date(b.soldDate).getTime());
  } else {
    // recent
    filteredData.sort((a, b) => new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime());
  }

  const totalSold = SOLD_BOOKS.length;
  const totalEarned = SOLD_BOOKS.reduce((sum, item) => sum + item.sellingPrice, 0);

  const renderItem = ({ item }: { item: (typeof SOLD_BOOKS)[0] }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.coverUri }} style={styles.coverImage} />
        <View style={styles.cardInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.buyerRow}>
            <Ionicons name="person-circle-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.buyerText}>Sold to {item.buyer}</Text>
          </View>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>₹{item.sellingPrice}</Text>
            </View>
            <View style={styles.earningsContainer}>
              <Text style={styles.priceLabel}>Sold On</Text>
              <Text style={styles.dateValue}>{item.soldDate}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sold Books</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListHeaderComponent={
          <>
            {/* Search & Sort */}
            <View style={styles.controlsRow}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search title or buyer..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={COLORS.textMuted}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              <Menu
                visible={sortMenuVisible}
                onDismiss={() => setSortMenuVisible(false)}
                anchor={
                  <TouchableOpacity style={styles.sortButton} onPress={() => setSortMenuVisible(true)}>
                    <Ionicons name="filter" size={20} color={COLORS.text} />
                  </TouchableOpacity>
                }
                contentStyle={{
                  backgroundColor: COLORS.white,
                  borderRadius: 12,
                  marginTop: 40,
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <Menu.Item
                    key={opt.value}
                    title={opt.label}
                    onPress={() => {
                      setSortBy(opt.value);
                      setSortMenuVisible(false);
                    }}
                    titleStyle={{
                      color: sortBy === opt.value ? COLORS.primary : COLORS.text,
                      fontFamily: sortBy === opt.value ? FONTS.manrope.bold : FONTS.manrope.medium,
                    }}
                  />
                ))}
              </Menu>
            </View>
            {/* Summary Section */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryBox}>
                <View style={[styles.summaryIcon, { backgroundColor: "rgba(0, 128, 128, 0.1)" }]}>
                  <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Total Sold</Text>
                  <Text style={styles.summaryValue}>{totalSold}</Text>
                </View>
              </View>
              <View style={styles.summaryBox}>
                <View style={[styles.summaryIcon, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
                  <Ionicons name="wallet-outline" size={24} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Total Value</Text>
                  <Text style={styles.summaryValue}>₹{totalEarned}</Text>
                </View>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No sold books yet</Text>
            <Text style={styles.emptySubtitle}>You haven't sold any books matching your search.</Text>
          </View>
        }
      />
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitle: {
    fontSize: rem(1.125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
  },

  summaryContainer: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    gap: SPACING.sm,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontSize: rem(1),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
    marginTop: 2,
  },

  controlsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    height: 48,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
  },
  sortButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  listContainer: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  coverImage: {
    width: 70,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.grayHeavvy,
  },
  cardInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: rem(0.875),
    fontFamily: FONTS.montserrat.semibold,
    color: COLORS.text,
    marginBottom: 4,
  },
  buyerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  buyerText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  priceRow: {
    flexDirection: "row",
    gap: SPACING.xl,
  },
  priceLabel: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontSize: rem(0.875),
    fontFamily: FONTS.montserrat.semibold,
    color: COLORS.text,
    marginTop: 2,
  },
  earningsContainer: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.grayHeavvy,
    paddingLeft: SPACING.md,
  },
  dateValue: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayHeavvy,
  },
  dateText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.bold,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    fontSize: rem(1),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: SPACING.xl,
  },
});

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { memo, useCallback } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { NearestBookItem } from "../ui/NearestBooks";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = SPACING.md;
const COLUMN_GAP = 8;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP * 2) / 3;

interface PeopleViewingProps {
  title?: string;
  books: NearestBookItem[];
  onBookPress?: (book: NearestBookItem) => void;
  onSeeAllPress?: () => void;
}

const SmallGridCard = memo(
  ({ item, onPress }: { item: NearestBookItem; onPress?: (item: NearestBookItem) => void }) => {
    const handlePress = useCallback(() => {
      onPress?.(item);
    }, [item, onPress]);

    return (
      <Pressable onPress={handlePress} style={styles.gridCard}>
        <View style={styles.gridCoverWrap}>
          <Image
            source={{ uri: item.coverUri }}
            style={styles.coverImg}
            contentFit="fill"
            recyclingKey={item.coverUri}
            cachePolicy="memory-disk"
          />
        </View>

        <View style={styles.gridInfoWrap}>
          <Text numberOfLines={1} style={styles.titleText}>
            {item.title}
          </Text>
          <Text numberOfLines={1} style={styles.authorText}>
            {item.author}
          </Text>
          <Text style={styles.priceText}>₹{item.price}</Text>
        </View>
      </Pressable>
    );
  },
  (prev, next) => prev.item.id === next.item.id
);

const PeopleViewing: React.FC<PeopleViewingProps> = memo(
  ({ title = "People Are Viewing", books, onBookPress, onSeeAllPress }) => {
    const spotlightBook = books[0];
    const gridBooks = books.slice(1, 4); // row of 3 small grid cards

    const handleSpotlightPress = useCallback(() => {
      if (spotlightBook && onBookPress) {
        onBookPress(spotlightBook);
      }
    }, [spotlightBook, onBookPress]);

    if (books.length === 0) return null;

    return (
      <View style={styles.section}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          {onSeeAllPress && (
            <Pressable onPress={onSeeAllPress}>
              <Text style={styles.headerLink}>see all</Text>
            </Pressable>
          )}
        </View>

        {/* Spotlight Banner Card */}
        {spotlightBook && (
          <Pressable onPress={handleSpotlightPress} style={styles.spotlightCard}>
            <View style={styles.spotlightInner}>
              <Image
                source={{ uri: spotlightBook.coverUri }}
                style={styles.spotlightCover}
                contentFit="fill"
                cachePolicy="memory-disk"
              />
              <View style={styles.spotlightInfo}>
                <View style={styles.badgeRow}>
                  <View style={styles.trendingBadge}>
                    <Ionicons name="flame" size={10} color={COLORS.primary} />
                    <Text style={styles.trendingBadgeText}>TRENDING</Text>
                  </View>
                  <Text style={styles.viewsText}>800+ viewed</Text>
                </View>
                <Text numberOfLines={1} style={styles.spotlightTitle}>
                  {spotlightBook.title}
                </Text>
                <Text numberOfLines={1} style={styles.spotlightAuthor}>
                  {spotlightBook.author}
                </Text>
                <Text style={styles.spotlightPrice}>₹{spotlightBook.price}</Text>
              </View>
              <View style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>View</Text>
              </View>
            </View>
          </Pressable>
        )}

        {/* 3-Column sub-grid */}
        <View style={styles.grid}>
          {gridBooks.map((book) => (
            <SmallGridCard key={book.id} item={book} onPress={onBookPress} />
          ))}
        </View>
      </View>
    );
  }
);

export default PeopleViewing;

const styles = StyleSheet.create({
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: rem(1),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
  },
  headerLink: {
    fontSize: rem(0.75),
    fontFamily: FONTS.montserrat.semibold,
    color: COLORS.primary,
  },
  spotlightCard: {
    backgroundColor: COLORS.secondary, // Light teal/mint wash
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,128,128,0.1)",
    padding: 8,
    marginBottom: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
  },
  spotlightInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  spotlightCover: {
    width: 48,
    height: 64,
    borderRadius: 6,
    backgroundColor: COLORS.grayLight,
  },
  spotlightInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "space-between",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 1,
  },
  trendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,128,128,0.15)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
  },
  trendingBadgeText: {
    fontSize: rem(0.46875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
  viewsText: {
    fontSize: rem(0.53125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  spotlightTitle: {
    fontSize: rem(0.71875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.text,
  },
  spotlightAuthor: {
    fontSize: rem(0.59375),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  spotlightPrice: {
    fontSize: rem(0.71875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
    marginTop: 2,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginLeft: 8,
  },
  actionBtnText: {
    fontSize: rem(0.5625),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.white,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: COLUMN_GAP,
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  gridCoverWrap: {
    width: "100%",
    height: 95,
    backgroundColor: COLORS.background,
  },
  coverImg: {
    width: "100%",
    height: "100%",
  },
  gridInfoWrap: {
    padding: 6,
    gap: 1,
  },
  titleText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.text,
  },
  authorText: {
    fontSize: rem(0.53125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  priceText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
    marginTop: 2,
  },
});

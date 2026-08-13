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
const HORIZONTAL_PADDING = SPACING.lg;
const COLUMN_GAP = rem(0.5);
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
            contentFit="cover"
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
    const gridBooks = books.slice(1, 4);

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
              <Text style={styles.headerLink}>SEE ALL</Text>
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
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <View style={styles.spotlightInfo}>
                <View style={styles.badgeRow}>
                  <View style={styles.trendingBadge}>
                    <Ionicons name="flame" size={10} color={COLORS.primary} />
                    <Text style={styles.trendingBadgeText}>TRENDING</Text>
                  </View>
                  <Text style={styles.viewsText}>
                    {spotlightBook.views} view{spotlightBook.views !== 1 ? "s" : ""}
                  </Text>
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
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: rem(1.25),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rem(0.5),
  },
  headerTitle: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
  },
  headerLink: {
    fontSize: rem(0.75),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  spotlightCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: rem(0.75),
    borderWidth: 1,
    borderColor: "rgba(0, 128, 128, 0.05)",
    padding: rem(0.5),
    marginBottom: rem(0.5),
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 0,
  },
  spotlightInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  spotlightCover: {
    width: rem(3.0),
    height: rem(4.25),
    borderRadius: 6,
    backgroundColor: COLORS.background,
  },
  spotlightInfo: {
    flex: 1,
    marginLeft: rem(0.625),
    justifyContent: "space-between",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  trendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,128,128,0.15)",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
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
    gap: COLUMN_GAP,
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: rem(0.75),
    borderWidth: 1,
    borderColor: "rgba(0,128,128,0.05)",
    overflow: "hidden",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  gridCoverWrap: {
    width: "100%",
    height: rem(5.95),
    backgroundColor: COLORS.background,
  },
  coverImg: {
    width: "100%",
    height: "100%",
  },
  gridInfoWrap: {
    padding: rem(0.375),
  },
  titleText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.text,
  },
  authorText: {
    fontSize: rem(0.5625),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  priceText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
    marginTop: 4,
  },
});

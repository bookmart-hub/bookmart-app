import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Image } from "expo-image";
import React, { memo, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NearestBookItem } from "../ui/NearestBooks";

interface RecentlyAddedProps {
  title?: string;
  books: NearestBookItem[];
  onBookPress?: (book: NearestBookItem) => void;
  onSeeAllPress?: () => void;
}

const FeaturedCard = memo(
  ({ item, onPress }: { item: NearestBookItem; onPress?: (item: NearestBookItem) => void }) => {
    const handlePress = useCallback(() => {
      onPress?.(item);
    }, [item, onPress]);

    return (
      <Pressable onPress={handlePress} style={styles.featuredCard}>
        <View style={styles.featuredCoverWrap}>
          <Image
            source={{ uri: item.coverUri }}
            style={styles.coverImg}
            contentFit="cover"
            recyclingKey={item.coverUri}
            cachePolicy="memory-disk"
          />
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>NEW LISTING</Text>
          </View>
        </View>

        <View style={styles.featuredInfo}>
          <Text numberOfLines={1} style={styles.titleText}>
            {item.title}
          </Text>
          <Text numberOfLines={1} style={styles.authorText}>
            {item.author}
          </Text>
          <View style={styles.footerRow}>
            <Text style={styles.priceText}>₹{item.price}</Text>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>{item.condition}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  },
  (prev, next) => prev.item.id === next.item.id
);

const SideRowCard = memo(
  ({ item, onPress }: { item: NearestBookItem; onPress?: (item: NearestBookItem) => void }) => {
    const handlePress = useCallback(() => {
      onPress?.(item);
    }, [item, onPress]);

    return (
      <Pressable onPress={handlePress} style={styles.sideRowCard}>
        <Image
          source={{ uri: item.coverUri }}
          style={styles.sideRowCover}
          contentFit="cover"
          recyclingKey={item.coverUri}
          cachePolicy="memory-disk"
        />
        <View style={styles.sideRowInfo}>
          <Text numberOfLines={1} style={styles.sideTitle}>
            {item.title}
          </Text>
          <Text numberOfLines={1} style={styles.sideAuthor}>
            {item.author}
          </Text>
          <Text style={styles.sidePrice}>₹{item.price}</Text>
        </View>
      </Pressable>
    );
  },
  (prev, next) => prev.item.id === next.item.id
);

const RecentlyAdded: React.FC<RecentlyAddedProps> = memo(
  ({ title = "Recently Added", books, onBookPress, onSeeAllPress }) => {
    if (books.length === 0) return null;

    const featuredBook = books[0];
    const sideBooks = books.slice(1, 3);

    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          {onSeeAllPress && (
            <Pressable onPress={onSeeAllPress}>
              <Text style={styles.headerLink}>SEE ALL</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.splitBlock}>
          {/* Left Side: 1 Featured Card */}
          {featuredBook && (
            <View style={styles.leftCol}>
              <FeaturedCard item={featuredBook} onPress={onBookPress} />
            </View>
          )}

          {/* Right Side: Stack of 2 side row items */}
          <View style={styles.rightCol}>
            {sideBooks.map((book) => (
              <SideRowCard key={book.id} item={book} onPress={onBookPress} />
            ))}
          </View>
        </View>
      </View>
    );
  }
);

export default RecentlyAdded;

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: SPACING.lg,
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
  splitBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: rem(0.5),
  },
  leftCol: {
    flex: 1,
  },
  rightCol: {
    flex: 1,
    justifyContent: "space-between",
    gap: rem(0.5),
  },
  featuredCard: {
    backgroundColor: COLORS.white,
    borderRadius: rem(0.75),
    borderWidth: 1,
    borderColor: "rgba(0, 128, 128, 0.05)",
    overflow: "hidden",
    height: rem(12.75),
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  featuredCoverWrap: {
    width: "100%",
    height: rem(8.25),
    position: "relative",
  },
  coverImg: {
    width: "100%",
    height: "100%",
  },
  featuredBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredBadgeText: {
    fontSize: rem(0.46875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.white,
  },
  featuredInfo: {
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
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  priceText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
  conditionBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  conditionText: {
    fontSize: rem(0.46875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  sideRowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: rem(0.75),
    borderWidth: 1,
    borderColor: "rgba(0, 128, 128, 0.05)",
    padding: rem(0.375),
    height: rem(6.125),
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  sideRowCover: {
    width: rem(3.0),
    height: rem(4.25),
    borderRadius: 6,
    backgroundColor: COLORS.background,
  },
  sideRowInfo: {
    flex: 1,
    marginLeft: rem(0.5),
    justifyContent: "center",
  },
  sideTitle: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.text,
  },
  sideAuthor: {
    fontSize: rem(0.5625),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sidePrice: {
    fontSize: rem(0.75),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
    marginTop: 4,
  },
});

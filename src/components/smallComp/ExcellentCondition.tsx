import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { NearestBookItem } from "../ui/NearestBooks";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = SPACING.lg;
const COLUMN_GAP = rem(0.5);
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP * 2) / 3;

interface ExcellentConditionProps {
  title?: string;
  books: NearestBookItem[];
  onBookPress?: (book: NearestBookItem) => void;
  onSeeAllPress?: () => void;
}

const BookCard = memo(
  ({ item, onPress }: { item: NearestBookItem; onPress?: (item: NearestBookItem) => void }) => {
    const handlePress = useCallback(() => {
      onPress?.(item);
    }, [item, onPress]);

    return (
      <Pressable onPress={handlePress} style={styles.card}>
        <View style={styles.coverWrap}>
          <Image
            source={{ uri: item.coverUri }}
            style={styles.coverImg}
            contentFit="cover"
            recyclingKey={item.coverUri}
            cachePolicy="memory-disk"
          />
          <View style={styles.mintBadge}>
            <Ionicons name="sparkles" size={8} color={COLORS.white} />
            <Text style={styles.mintBadgeText}>MINT</Text>
          </View>
        </View>

        <View style={styles.infoWrap}>
          <Text numberOfLines={1} style={styles.titleText}>
            {item.title}
          </Text>
          <Text numberOfLines={1} style={styles.authorText}>
            {item.author}
          </Text>
          <View style={styles.footerRow}>
            <Text style={styles.priceText}>₹{item.price}</Text>
          </View>
        </View>
      </Pressable>
    );
  },
  (prev, next) => prev.item.id === next.item.id
);

const ExcellentCondition: React.FC<ExcellentConditionProps> = memo(
  ({ title = "Excellent Condition", books, onBookPress, onSeeAllPress }) => {
    const displayBooks = books.slice(0, 3); // Slice 3 to maintain a clean single-row grid matching "Spotlight" consistency

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

        <View style={styles.grid}>
          {displayBooks.map((book) => (
            <BookCard key={book.id} item={book} onPress={onBookPress} />
          ))}
        </View>
      </View>
    );
  }
);

export default ExcellentCondition;

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
  grid: {
    flexDirection: "row",
    gap: COLUMN_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: rem(0.75),
    borderWidth: 1,
    borderColor: "rgba(0, 128, 128, 0.05)",
    overflow: "hidden",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  coverWrap: {
    width: "100%",
    height: rem(6.25),
    backgroundColor: COLORS.background,
    position: "relative",
  },
  coverImg: {
    width: "100%",
    height: "100%",
  },
  mintBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 2,
  },
  mintBadgeText: {
    fontSize: rem(0.46875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.white,
  },
  infoWrap: {
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
});

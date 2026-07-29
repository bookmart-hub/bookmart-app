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
const HORIZONTAL_PADDING = SPACING.md;
const COLUMN_GAP = 8;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

interface EndingSoonProps {
  title?: string;
  books: (NearestBookItem & { timeLeft?: string })[];
  onBookPress?: (book: NearestBookItem) => void;
  onSeeAllPress?: () => void;
}

const MiniRowCard = memo(
  ({ item, onPress }: { item: NearestBookItem & { timeLeft?: string }; onPress?: (item: NearestBookItem) => void }) => {
    const handlePress = useCallback(() => {
      onPress?.(item);
    }, [item, onPress]);

    return (
      <Pressable onPress={handlePress} style={styles.card}>
        <Image
          source={{ uri: item.coverUri }}
          style={styles.cover}
          contentFit="fill"
          recyclingKey={item.coverUri}
          cachePolicy="memory-disk"
        />
        <View style={styles.infoWrap}>
          <Text numberOfLines={1} style={styles.titleText}>
            {item.title}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.timerBadge}>
              <Ionicons name="alarm-outline" size={9} color={COLORS.red} />
              <Text style={styles.timerText}>{item.timeLeft || "Soon"}</Text>
            </View>
          </View>
          <Text style={styles.priceText}>₹{item.price}</Text>
        </View>
      </Pressable>
    );
  },
  (prev, next) => prev.item.id === next.item.id
);

const EndingSoon: React.FC<EndingSoonProps> = memo(({ title = "Ending Soon", books, onBookPress, onSeeAllPress }) => {
  // Show 4 items in a 2x2 grid
  const displayBooks = books.slice(0, 4);

  return (
    <LinearGradient colors={[COLORS.redLight, COLORS.background]} style={styles.section}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="hourglass-outline" size={18} color={COLORS.red} />
          <Text style={[styles.headerTitle, { marginLeft: 4 }]}>{title}</Text>
        </View>
        {onSeeAllPress && (
          <Pressable onPress={onSeeAllPress}>
            <Text style={styles.headerLink}>see all</Text>
          </Pressable>
        )}
      </View>

      {/* 2x2 Grid of horizontal cards */}
      <View style={styles.grid}>
        {displayBooks.map((book) => (
          <MiniRowCard key={book.id} item={book} onPress={onBookPress} />
        ))}
      </View>
    </LinearGradient>
  );
});

export default EndingSoon;

const styles = StyleSheet.create({
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: SPACING.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: COLUMN_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    padding: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 4,
  },
  cover: {
    width: 38,
    height: 52,
    borderRadius: 5,
    backgroundColor: COLORS.background,
  },
  infoWrap: {
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
    gap: 2,
  },
  titleText: {
    fontSize: rem(0.65625),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.text,
  },
  badgeRow: {
    flexDirection: "row",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.redLight,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    gap: 2,
  },
  timerText: {
    fontSize: rem(0.46875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.red,
  },
  priceText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
});

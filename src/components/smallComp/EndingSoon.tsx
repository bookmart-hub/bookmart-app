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
          contentFit="cover"
          recyclingKey={item.coverUri}
          cachePolicy="memory-disk"
        />
        <View style={styles.infoWrap}>
          <Text numberOfLines={1} style={styles.titleText}>
            {item.title}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.timerBadge}>
              <Ionicons name="time" size={9} color={COLORS.red} />
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
  const displayBooks = books.slice(0, 4);

  return (
    <LinearGradient colors={["#FFFDFD", "#FFFDFD", COLORS.background]} style={styles.section}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="hourglass" size={16} color={COLORS.red} />
          <Text style={[styles.headerTitle, { marginLeft: 4 }]}>{title}</Text>
        </View>
        {onSeeAllPress && (
          <Pressable onPress={onSeeAllPress}>
            <Text style={styles.headerLink}>SEE ALL</Text>
          </Pressable>
        )}
      </View>

      {/* Grid of horizontal cards */}
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
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: rem(1.25),
    borderTopLeftRadius: rem(1.5),
    borderTopRightRadius: rem(1.5),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rem(0.5),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
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
    flexWrap: "wrap",
    gap: COLUMN_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: rem(4.25),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: rem(0.75),
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.04)",
    padding: rem(0.375),
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: rem(0.5),
  },
  cover: {
    width: rem(2.5),
    height: rem(3.5),
    borderRadius: 5,
    backgroundColor: COLORS.background,
  },
  infoWrap: {
    flex: 1,
    marginLeft: rem(0.5),
    justifyContent: "center",
  },
  titleText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.text,
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: 2,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.redLight,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    gap: 2,
  },
  timerText: {
    fontSize: rem(0.46875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.red,
  },
  priceText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
    marginTop: 4,
  },
});

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { memo, useCallback, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HeartBurst from "./HeartBrust";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = SPACING.lg;
const COLUMN_GAP = rem(0.5);
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP * 2) / 3;

export interface NearestBookItem {
  id: string;
  title: string;
  author: string;
  price: number;
  coverUri: string;
  condition: string;
  distance: string;
  description?: string;
  sellerAvatarUri?: string;
}

interface NearestBooksProps {
  books: NearestBookItem[];
  onBookPress?: (book: NearestBookItem) => void;
  onSeeAllPress?: () => void;
}

const BookCard = memo(
  ({ item, onPress }: { item: NearestBookItem; onPress?: (item: NearestBookItem) => void }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [showBurst, setShowBurst] = useState(false);

    const handlePress = useCallback(() => {
      Haptics.selectionAsync();
      onPress?.(item);
    }, [item, onPress]);

    const toggleLike = useCallback(() => {
      setIsLiked((prev) => {
        const next = !prev;
        if (next) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setShowBurst(true);
          setTimeout(() => setShowBurst(false), 600);
        } else {
          Haptics.selectionAsync();
        }
        return next;
      });
    }, []);

    return (
      <TouchableOpacity activeOpacity={0.85} onPress={handlePress} style={styles.card}>
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: item.coverUri }}
            style={styles.coverImg}
            contentFit="cover"
            recyclingKey={item.coverUri}
            cachePolicy="memory-disk"
          />
          <View style={styles.distanceBadge}>
            <Ionicons name="location-sharp" size={8} color={COLORS.primary} />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text numberOfLines={1} style={styles.titleText}>
            {item.title}
          </Text>
          <Text numberOfLines={1} style={styles.authorText}>
            {item.author}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>₹{item.price}</Text>
            <View style={styles.heartContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleLike}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={16}
                  color={isLiked ? COLORS.primary : COLORS.textMuted}
                />
              </TouchableOpacity>
              {showBurst && <HeartBurst />}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) => prev.item.id === next.item.id
);

const NearestBooks: React.FC<NearestBooksProps> = memo(({ books, onBookPress, onSeeAllPress }) => {
  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearest Books</Text>
        {onSeeAllPress && (
          <TouchableOpacity activeOpacity={0.7} onPress={onSeeAllPress}>
            <Text style={styles.headerLink}>SEE ALL</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {books.map((book) => (
          <BookCard key={book.id} item={book} onPress={onBookPress} />
        ))}
      </View>
    </View>
  );
});

export default NearestBooks;

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
    flexWrap: "wrap",
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
    marginBottom: rem(0.5),
  },
  coverContainer: {
    width: "100%",
    height: rem(6.25),
    backgroundColor: COLORS.background,
    position: "relative",
  },
  coverImg: {
    width: "100%",
    height: "100%",
  },
  distanceBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  distanceText: {
    fontSize: rem(0.5),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  infoContainer: {
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
  priceRow: {
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
  heartContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { NearestBookItem } from "../ui/NearestBooks";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = SPACING.lg;
const CARD_WIDTH = rem(7.0);

interface SponsoredSectionProps {
  title?: string;
  books: NearestBookItem[];
  onBookPress?: (book: NearestBookItem) => void;
}

const SponsoredCard = memo(
  ({ item, onPress }: { item: NearestBookItem; onPress?: (item: NearestBookItem) => void }) => {
    const handlePress = useCallback(() => {
      Haptics.selectionAsync();
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
          <View style={styles.sponsoredBadge}>
            <Ionicons name="sparkles" size={10} color={COLORS.white} />
          </View>
        </View>
        <View style={styles.infoWrap}>
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

const SponsoredSection: React.FC<SponsoredSectionProps> = memo(({ title = "Trending Now", books, onBookPress }) => {
  if (books.length === 0) return null;

  return (
    <LinearGradient colors={["#FFFDF7", "#FFFDF7", COLORS.background]} style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.adTag}>
          <Text style={styles.adTagText}>AD</Text>
        </View>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + rem(0.75)}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingBottom: rem(0.75),
        }}
        ItemSeparatorComponent={() => <View style={{ width: rem(0.75) }} />}
        renderItem={({ item }) => <SponsoredCard item={item} onPress={onBookPress} />}
      />
    </LinearGradient>
  );
});

export default SponsoredSection;

const styles = StyleSheet.create({
  section: {
    paddingTop: rem(1.25),
    borderTopLeftRadius: rem(1.5),
    borderTopRightRadius: rem(1.5),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rem(0.5),
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 6,
  },
  headerTitle: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: "#6B5020", // Deep brown gold tone for trending sponsored
  },
  adTag: {
    backgroundColor: "#F4E5CA",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  adTagText: {
    fontSize: rem(0.5),
    fontFamily: FONTS.montserrat.bold,
    color: "#6B5020",
    letterSpacing: 0.5,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: rem(0.75),
    borderWidth: 1,
    borderColor: "rgba(107, 80, 32, 0.08)",
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
  sponsoredBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#D4AF37", // Gold accent for trending
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  priceText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.montserrat.bold,
    color: "#6B5020",
    marginTop: 4,
  },
});

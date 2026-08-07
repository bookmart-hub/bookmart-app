import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Image } from "expo-image";
import React, { memo, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface InstituteBookItem {
  id: string;
  title: string;
  author: string;
  price: number;
  coverUri: string;
  description?: string;
  sellerName: string;
  sellerAvatarUri?: string;
}

export interface InstituteBooksProps {
  instituteName?: string;
  books: InstituteBookItem[];
  onBookPress?: (book: InstituteBookItem) => void;
  onSeeAllPress?: () => void;
}

const SellerPill: React.FC<{ name: string; avatarUri?: string }> = memo(({ name, avatarUri }) => {
  const initial = name.charAt(0).toUpperCase();

  return (
    <View style={styles.sellerPill}>
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.sellerAvatar} contentFit="cover" cachePolicy="memory-disk" />
      ) : (
        <View style={styles.sellerAvatarFallback}>
          <Text style={styles.sellerAvatarInitial}>{initial}</Text>
        </View>
      )}
      <Text style={styles.sellerName} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
});

const BookRowCard = memo(
  ({ item, onPress }: { item: InstituteBookItem; onPress?: (item: InstituteBookItem) => void }) => {
    const handlePress = useCallback(() => {
      onPress?.(item);
    }, [item, onPress]);

    return (
      <TouchableOpacity activeOpacity={0.88} onPress={handlePress} style={styles.rowCard}>
        {/* Book cover */}
        <Image
          source={{ uri: item.coverUri }}
          style={styles.cover}
          contentFit="cover"
          recyclingKey={item.coverUri}
          cachePolicy="memory-disk"
        />

        {/* Text content */}
        <View style={styles.cardBody}>
          <Text style={styles.titleText} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.authorText} numberOfLines={1}>
            {item.author}
          </Text>
          {item.description ? (
            <Text style={styles.descText} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
          <SellerPill name={item.sellerName} avatarUri={item.sellerAvatarUri} />
        </View>

        {/* Price and Action */}
        <View style={styles.rightActionWrap}>
          <Text style={styles.priceText}>₹{item.price}</Text>
          <View style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>View</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) => prev.item.id === next.item.id
);

const InstituteBooks: React.FC<InstituteBooksProps> = memo(
  ({ instituteName = "Your Institute", books, onBookPress, onSeeAllPress }) => {
    const displayBooks = books.slice(0, 3);

    return (
      <View style={styles.section}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            From Your {instituteName === "Your Institute" ? "College" : instituteName}
          </Text>
          {onSeeAllPress && (
            <TouchableOpacity activeOpacity={0.7} onPress={onSeeAllPress}>
              <Text style={styles.headerLink}>SEE ALL</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Vertical rows */}
        <View style={styles.list}>
          {displayBooks.map((book) => (
            <BookRowCard key={book.id} item={book} onPress={onBookPress} />
          ))}
        </View>
      </View>
    );
  }
);

export default InstituteBooks;

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
  list: {
    gap: rem(0.5),
  },
  rowCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: rem(0.75),
    borderWidth: 1,
    borderColor: "rgba(0, 128, 128, 0.05)",
    padding: rem(0.5),
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cover: {
    width: rem(3.5),
    height: rem(4.75),
    borderRadius: 6,
    backgroundColor: COLORS.background,
  },
  cardBody: {
    flex: 1,
    marginLeft: rem(0.625),
    justifyContent: "space-between",
  },
  titleText: {
    fontSize: rem(0.71875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.text,
  },
  authorText: {
    fontSize: rem(0.59375),
    fontFamily: FONTS.manrope.semibold,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  descText: {
    fontSize: rem(0.5625),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
    lineHeight: 12,
    marginTop: 2,
  },
  sellerPill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  sellerAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 4,
  },
  sellerAvatarFallback: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 4,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sellerAvatarInitial: {
    fontSize: rem(0.5),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.white,
    lineHeight: 12,
  },
  sellerName: {
    fontSize: rem(0.5625),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  rightActionWrap: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: rem(0.5),
    gap: rem(0.375),
  },
  priceText: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  actionBtnText: {
    fontSize: rem(0.59375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.white,
  },
});

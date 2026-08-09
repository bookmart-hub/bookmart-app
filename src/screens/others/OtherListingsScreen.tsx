import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { Book } from "@/data/models";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const OtherListingsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { book, otherListings } = route.params as { book: Book; otherListings: Book[] };

  const renderItem = ({ item }: { item: Book }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => {
          navigation.navigate("BookDetails", { book: item });
        }}
      >
        <Image source={{ uri: item.coverUri }} style={styles.bookImage} contentFit="fill" />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {item.author || "Unknown"}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>₹{item.price}</Text>
          </View>
          {(item.discount || item.stock) && (
            <View style={styles.metaRow}>
              {item.discount && <Text style={styles.discountText}>{item.discount}</Text>}
              {item.stock && !item.otherListings && <Text style={styles.stockText}>{item.stock}</Text>}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Other Listings</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={otherListings}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        numColumns={2}
        contentContainerStyle={{
          paddingHorizontal: SPACING.lg - 8,
          paddingBottom: SPACING.xl,
        }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 8,
        }}
      />
    </View>
  );
};

export default OtherListingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: rem(1),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: rem(0.75),
    overflow: "hidden",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    width: "48%",
    marginBottom: SPACING.md,
  },
  bookImage: {
    width: "100%",
    height: rem(8.125),
  },
  cardContent: {
    padding: rem(0.5625),
  },
  author: {
    fontSize: rem(0.65625),
    color: COLORS.text,
    marginTop: rem(0.1875),
    marginBottom: rem(0.3125),
  },
  cardTitle: {
    fontSize: rem(0.78125),
    lineHeight: rem(1),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    fontSize: rem(0.78125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: rem(0.375),
  },
  discountText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  stockText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.red,
  },
});

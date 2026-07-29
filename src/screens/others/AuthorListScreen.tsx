import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { Author, AUTHOR_CATEGORIES, MOCK_AUTHORS } from "@/data/authorMockData";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const AuthorListScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredAuthors = useMemo(() => {
    if (activeCategory === "All") return MOCK_AUTHORS;
    return MOCK_AUTHORS.filter((author) => author.category === activeCategory);
  }, [activeCategory]);

  const handleAuthorPress = useCallback(
    (author: Author) => {
      navigation.navigate("AppStack", { screen: "AuthorDetails", params: { author } });
    },
    [navigation]
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="arrow-back" size={28} color={COLORS.black} />
      </TouchableOpacity>
      <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="search-outline" size={28} color={COLORS.black} />
      </TouchableOpacity>
    </View>
  );

  const renderTitleSection = () => (
    <View style={styles.titleSection}>
      <Text style={styles.titlePrefix}>Check the</Text>
      <Text style={styles.titleMain}>Authors</Text>
    </View>
  );

  const renderCategoryTabs = () => (
    <View style={styles.tabsContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={AUTHOR_CATEGORIES}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: SPACING.lg }}
        renderItem={({ item }) => {
          const isActive = activeCategory === item;
          return (
            <TouchableOpacity onPress={() => setActiveCategory(item)} style={styles.tabButton}>
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{item}</Text>
              {isActive && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderAuthorItem = useCallback(
    ({ item }: { item: Author }) => (
      <TouchableOpacity style={styles.authorCard} onPress={() => handleAuthorPress(item)}>
        <Image source={{ uri: item.imageUri }} style={styles.authorImage} contentFit="fill" cachePolicy="memory-disk" />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.authorBio} numberOfLines={2}>
            {item.bio}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [handleAuthorPress]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}
      {renderTitleSection()}
      {renderCategoryTabs()}

      <FlatList
        data={filteredAuthors}
        keyExtractor={(item) => item.id}
        renderItem={renderAuthorItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default AuthorListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  titleSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  titlePrefix: {
    fontSize: rem(1),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  titleMain: {
    fontSize: rem(1.75),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
  tabsContainer: {
    marginBottom: SPACING.lg,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 4,
  },
  tabText: {
    fontSize: rem(1),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  activeTabText: {
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: -2,
    width: "100%",
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  authorCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: SPACING.md,
    backgroundColor: COLORS.grayLight,
  },
  authorInfo: {
    flex: 1,
    justifyContent: "center",
  },
  authorName: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
    marginBottom: 4,
  },
  authorBio: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.light,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
});

import { useNavigation } from "expo-router";
import React, { memo, useCallback } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/clients";
import { useMemo } from "react";

// Maps each genre to a sleek, modern Ionicons vector icon matching 2nd image explore style
const getGenreIcon = (label: string): keyof typeof Ionicons.glyphMap => {
  const norm = label.toLowerCase();
  if (norm.includes("romance")) return "heart-sharp";
  if (norm.includes("self help")) return "leaf-sharp";
  if (norm.includes("science") || norm.includes("sci-fi")) return "rocket-sharp";
  if (norm.includes("biography")) return "finger-print-sharp";
  if (norm.includes("business")) return "briefcase-sharp";
  if (norm.includes("engineering")) return "hardware-chip-sharp";
  if (norm.includes("medical")) return "medical-sharp";
  if (norm.includes("law")) return "scale-sharp";
  if (norm.includes("competitive") || norm.includes("exam")) return "trophy-sharp";
  return "book-sharp";
};

interface GenreItem {
  id: string;
  label: string;
  imageUri: string | null;
  screenName: string;
}

interface GenreSectionProps {
  genres?: GenreItem[];
}

const GenreSection = memo(() => {
  const navigation = useNavigation<any>();

  const { data: genresData } = useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const response = await api.get("/api/v1/book/genres/");
      return response.data;
    },
  });

  const genres = useMemo(() => {
    if (!genresData?.results) return [];
    return genresData.results.map((g: any) => {
      let screenName = "ScienceFiction";
      const nameLower = g.name.toLowerCase();
      if (nameLower.includes("romance")) screenName = "Romance";
      else if (nameLower.includes("self help")) screenName = "SelfHelp";
      else if (nameLower.includes("biography")) screenName = "Biography";
      else if (nameLower.includes("business")) screenName = "Business";
      else if (nameLower.includes("engineering")) screenName = "Engineering";
      else if (nameLower.includes("medical")) screenName = "Medical";
      else if (nameLower.includes("law")) screenName = "Law";
      else if (nameLower.includes("competitive exams")) screenName = "CompetitiveExams";

      return {
        id: String(g.id),
        label: g.name,
        imageUri: g.image_url || null,
        screenName,
      };
    });
  }, [genresData]);

  const handlePress = useCallback(
    (item: GenreItem) => {
      Haptics.selectionAsync();
      navigation.navigate("(screens)", {
        screen: item.screenName,
      });
    },
    [navigation]
  );

  return (
    <View style={styles.container}>
      {/* Sleek section header matches 2nd image */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore Genres</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {genres.map((item) => {
          const iconName = getGenreIcon(item.label);
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={styles.cardWrapper}
              onPress={() => handlePress(item)}
            >
              {/* Sleek square box with image thumbnail */}
              <View style={styles.iconBox}>
                {item.imageUri ? (
                  <Image source={{ uri: item.imageUri }} style={styles.imageBox} contentFit="cover" />
                ) : (
                  <Ionicons name={iconName} size={24} color={COLORS.primary} />
                )}
              </View>
              {/* Genre label directly below box */}
              <Text numberOfLines={1} style={styles.label}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

export default GenreSection;

const styles = StyleSheet.create({
  container: {
    marginTop: rem(0.625),
    marginBottom: rem(0.9375),
  },
  header: {
    paddingHorizontal: SPACING.lg,
    marginBottom: rem(0.5),
  },
  title: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg - 4,
    gap: rem(0.625),
    paddingBottom: 4,
  },
  cardWrapper: {
    alignItems: "center",
    width: rem(4.25),
  },
  iconBox: {
    width: rem(3.5),
    height: rem(3.5),
    borderRadius: rem(0.875),
    backgroundColor: COLORS.background, // Soft light gray-teal tint
    borderWidth: 1,
    borderColor: "rgba(0, 128, 128, 0.06)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: rem(0.3125),
    overflow: "hidden",
  },
  imageBox: {
    width: "100%",
    height: "100%",
    borderRadius: rem(0.875),
  },
  label: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.text,
    textAlign: "center",
    width: "100%",
  },
});

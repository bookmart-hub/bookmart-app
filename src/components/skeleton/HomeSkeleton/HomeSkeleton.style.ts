import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = SPACING.md;
const COLUMN_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP * 2) / 2;

// Soft light background colors matching app palette
const SKELETON_BG = "#E2ECEB"; // Light teal-tinted gray placeholder
const SKELETON_BG_LIGHT = "#E9F2F1"; // Lighter variant for headers

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Light theme app background (#F4F9F9)
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  headerRow: {
    marginTop: rem(1.5),
    marginBottom: rem(1),
    gap: 8,
  },
  logoPlaceholder: {
    width: rem(5.625),
    height: rem(1),
    backgroundColor: SKELETON_BG,
    borderRadius: 4,
  },
  subHeaderPlaceholder: {
    width: rem(12),
    height: rem(0.75),
    backgroundColor: SKELETON_BG_LIGHT,
    borderRadius: 4,
  },
  searchPlaceholder: {
    height: rem(3),
    backgroundColor: SKELETON_BG,
    borderRadius: rem(1.5),
    marginBottom: rem(1.25),
  },
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: rem(1.5),
  },
  categoryBox: {
    width: rem(3.75),
    height: rem(3.75),
    backgroundColor: SKELETON_BG,
    borderRadius: rem(0.75),
  },
  bannerTitlePlaceholder: {
    width: rem(9.375),
    height: rem(1),
    backgroundColor: SKELETON_BG_LIGHT,
    borderRadius: 4,
    marginBottom: rem(0.75),
  },
  heroBannerPlaceholder: {
    height: rem(11.25),
    backgroundColor: SKELETON_BG,
    borderRadius: rem(1.25),
    marginBottom: rem(1.5),
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rem(0.75),
  },
  sectionTitlePlaceholder: {
    width: rem(7.5),
    height: rem(1.125),
    backgroundColor: SKELETON_BG,
    borderRadius: 4,
  },
  seeAllPlaceholder: {
    width: rem(3.125),
    height: rem(0.75),
    backgroundColor: SKELETON_BG_LIGHT,
    borderRadius: 4,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: rem(2),
  },
  bookCardPlaceholder: {
    width: CARD_WIDTH,
    height: rem(13.75),
    backgroundColor: SKELETON_BG,
    borderRadius: rem(1),
  },
});

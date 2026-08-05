import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { rem } from "@/utils/responsive";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignSelf: "center", // Center floating pill horizontally
    width: "82%", // Sleek compact width
    height: rem(3.25), // Reduced container height (was 4.25)
    backgroundColor: COLORS.white, // Light theme white background
    borderRadius: rem(1.625), // Adjusted pill shape
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rem(0.625),
    
    // Light shadow matching original premium tab bar style
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 128, 128, 0.06)", // Soft teal border
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  activeTabCapsule: {
    backgroundColor: COLORS.secondary, // Light primary teal tint from app colors
    borderRadius: rem(1.25), // Capsule shape
    paddingVertical: rem(0.2),
    paddingHorizontal: rem(0.625),
    alignItems: "center",
    justifyContent: "center",
    height: rem(2.5),
  },
  inactiveTabContent: {
    alignItems: "center",
    justifyContent: "center",
    height: rem(2.5),
    paddingHorizontal: rem(0.625),
  },
  tabLabel: {
    fontSize: rem(0.5625), // Sleek smaller label (was 0.6875)
    fontFamily: FONTS.montserrat.bold,
    marginTop: 1,
    letterSpacing: 0.15,
  },
});

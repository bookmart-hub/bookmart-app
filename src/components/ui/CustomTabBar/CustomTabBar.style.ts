import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { rem } from "@/utils/responsive";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignSelf: "center", // Center floating pill horizontally
    width: "70%", // Sleek compact width
    height: rem(3.75), // Container height
    backgroundColor: COLORS.white, // Light theme white background
    borderRadius: rem(2.0), // Adjusted pill shape
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: COLORS.secondary, // Light teal bubble highlight
    borderRadius: rem(1.4), // Rounded circle backdrop matching reference
    alignItems: "center",
    justifyContent: "center",
    height: rem(2.75),
    width: rem(3.25),
  },
  inactiveTabContent: {
    alignItems: "center",
    justifyContent: "center",
    height: rem(3.2),
    width: rem(3.2),
  },
  tabLabel: {
    fontSize: rem(0.5625), // Sleek smaller label
    fontFamily: FONTS.montserrat.bold,
    marginTop: rem(0.1), // Small vertical space directly below the icon
    letterSpacing: 0.15,
  },
});

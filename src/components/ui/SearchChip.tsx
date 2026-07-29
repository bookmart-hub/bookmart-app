import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;
};

const SearchChip = ({ title, onPress }: Props) => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
      <TouchableOpacity style={{ marginTop: rem(0.125) }}>
        <Ionicons name="close" size={rem(0.9375)} color={COLORS.text} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default SearchChip;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  text: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
  },
});

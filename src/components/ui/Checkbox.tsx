import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  labelComponent?: React.ReactNode;
  style?: ViewStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  labelComponent,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.container, style]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && (
          <Feather name="check" size={14} color={COLORS.white} />
        )}
      </View>
      {labelComponent && <View style={styles.labelContainer}>{labelComponent}</View>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  box: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  boxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  labelContainer: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
});

import React from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  Platform,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { TouchableRipple } from 'react-native-paper';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'text';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isText = variant === 'text';

  const containerStyles = [
    styles.baseContainer,
    isPrimary && styles.primaryContainer,
    isOutline && styles.outlineContainer,
    isText && styles.textContainer,
    disabled && styles.disabledContainer,
    style,
  ];

  const textStyles = [
    styles.baseText,
    isPrimary && styles.primaryText,
    isOutline && styles.outlineText,
    isText && styles.textText,
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableRipple
      onPress={onPress}
      disabled={disabled || loading}
      rippleColor={
        isPrimary
          ? 'rgba(255,255,255,0.25)'
          : 'rgba(0,0,0,0.08)'
      }
      borderless={false}
      style={containerStyles}
    >
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator
            color={isPrimary ? COLORS.white : COLORS.primary}
          />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={textStyles as TextStyle[]}>{title}</Text>
          </>
        )}
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden', // Required for ripple to stay inside rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: SPACING.xs,
  },
  primaryContainer: {
    backgroundColor: COLORS.primary,
  },
  outlineContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
  },
  textContainer: {
    backgroundColor: 'transparent',
    height: 'auto',
    width: 'auto',
    borderRadius: 0,
    padding: SPACING.xs,
  },
  disabledContainer: {
    backgroundColor: COLORS.grayHeavvy,
    borderColor: COLORS.grayHeavvy,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SPACING.sm + 4,
  },
  baseText: {
    fontSize: rf(16),
    fontFamily: FONTS.montserrat.semibold,
    textAlign: 'center',
  },
  primaryText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.montserrat.medium,
  },
  textText: {
    color: COLORS.primary,
    fontFamily: FONTS.montserrat.semibold,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
});

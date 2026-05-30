import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';

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
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={containerStyles as ViewStyle[]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? COLORS.white : COLORS.primary} size="small" />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={textStyles as TextStyle[]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    height: 56,
    borderRadius: 28,
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
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
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
    fontSize: 16,
    fontFamily: FONTS.montserrat.semibold,
    textAlign: 'center',
  },
  primaryText: {
    color: COLORS.white,
  },
  outlineText: {
    color: '#4B5563',
    fontFamily: FONTS.montserrat.medium,
  },
  textText: {
    color: COLORS.primary,
    fontFamily: FONTS.montserrat.semibold,
  },
  disabledText: {
    color: '#9CA3AF',
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextInputProps
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { Feather } from '@expo/vector-icons';
import { rem } from '@/utils/responsive';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  prefix?: React.ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  isPassword = false,
  secureTextEntry,
  style,
  onFocus,
  onBlur,
  prefix,
  multiline = false,
  numberOfLines = 1,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const isSecure = isPassword && !passwordVisible;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          multiline && { height: undefined, minHeight: 100, paddingVertical: 12, alignItems: 'flex-start' },
          isFocused && styles.focusedInput,
          !!error && styles.errorInput,
        ]}
      >
        {prefix}
        <TextInput
          style={[
            styles.input,
            multiline && { textAlignVertical: 'top', paddingTop: 0, paddingBottom: 0 },
            style
          ]}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={isSecure}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setPasswordVisible(!passwordVisible)}
            activeOpacity={0.7}
          >
            <Feather
              name={passwordVisible ? "eye" : "eye-off"}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: SPACING.sm,
  },
  label: {
    fontSize: rem(0.875),
    fontFamily: FONTS.montserrat.semibold,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy, // light gray border
    borderRadius: 16,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
  },
  focusedInput: {
    borderColor: COLORS.primary,
  },
  errorInput: {
    borderColor: COLORS.red,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.black,
    fontSize: rem(1),
    fontFamily: FONTS.manrope.medium,
  },
  iconContainer: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.red,
    marginTop: 4,
  },
});

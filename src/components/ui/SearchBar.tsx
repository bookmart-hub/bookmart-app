import React, { memo } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';

interface SearchBarProps extends TextInputProps {
  containerStyle?: ViewStyle;
  onPress?: () => void;
  onClearPress?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = memo(({
  containerStyle,
  placeholder = 'Search Books...',
  onPress,
  onClearPress,
  ...props
}) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.container, containerStyle]}>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="search-outline"
          size={20}
          color={COLORS.textMuted}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          {...props}
        />
        {props.value ? (
          <TouchableOpacity
            onPress={onClearPress}
            style={styles.clearIconWrapper}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: COLORS.white,
    borderRadius: 26,
    paddingHorizontal: SPACING.md,
    // Elevated shadow to match the premium floating search feel
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: {
    marginRight: SPACING.sm + 2,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: rf(15),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
  },
  clearIconWrapper: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
});

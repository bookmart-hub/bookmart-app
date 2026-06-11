import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';

type Props = {
    title: string;
    onPress?: () => void;
};

const SearchChip = ({ title, onPress }: Props) => {
    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.8}
            onPress={onPress}
        >
            <Text style={styles.text}>{title}</Text>
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
    },
    text: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
    },
});
import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';

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
            <TouchableOpacity style={{ marginTop: rf(2) }}>
                <Ionicons name="close" size={rf(15)} color={COLORS.text} />
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    text: {
        fontSize: rf(15),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
    },
});
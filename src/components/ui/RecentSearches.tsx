import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import SearchChip from './SearchChip';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rem } from '@/utils/responsive';

type Props = {
    searches: string[];
    onSelect: (value: string) => void;
    onClear: () => void;
};

const RecentSearches = ({
    searches,
    onSelect,
    onClear,
}: Props) => {
    if (!searches.length) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Recent Searches</Text>

                <TouchableOpacity activeOpacity={0.8} onPress={onClear}>
                    <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.chipsContainer}>
                {searches.map(item => (
                    <SearchChip
                        key={item}
                        title={item}
                        onPress={() => onSelect(item)}
                    />
                ))}
            </View>
        </View>
    );
};

export default RecentSearches;

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },

    title: {
        fontSize: rem(1),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
    },

    clearText: {
        fontSize: rem(0.875),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.primary,
    },

    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
});
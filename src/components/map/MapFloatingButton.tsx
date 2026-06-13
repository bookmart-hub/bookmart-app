import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { rf } from '@/utils/responsive';
import { SPACING } from '@/constants/spacings';
import { useNavigation } from '@react-navigation/native';

interface MapFloatingButtonProps {
    onPress: () => void;
}

const MapFloatingButton: React.FC<MapFloatingButtonProps> = ({ onPress }) => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="arrow-back" size={24} color={COLORS.black} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleButton} onPress={onPress}>
                <Ionicons name="list-outline" size={20} color={COLORS.primary} style={styles.icon} />
                <Text style={styles.text}>List View</Text>
            </TouchableOpacity>
        </View>
    );
};

export default MapFloatingButton;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 24,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    icon: {
        marginRight: 6,
    },
    text: {
        fontFamily: FONTS.manrope.bold,
        fontSize: rf(14),
        color: COLORS.black,
    },
});

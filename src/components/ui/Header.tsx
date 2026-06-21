import { Ionicons } from '@expo/vector-icons';
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { FONTS } from '@/constants/fonts';

const PADDING_HORIZONTAL = SPACING.lg;
interface HeaderProps {
    title?: string;
    backButton?: boolean;
    onPress?: () => void;
}

const Header = ({ title, backButton, onPress }: HeaderProps) => {
    const navigation = useNavigation();
    return (
        <View>
            <View style={styles.appBar}>
                {backButton && (
                    <TouchableOpacity
                        onPress={onPress ? onPress : () => navigation.goBack()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                )}
                <Text style={styles.title}>{title}</Text>
                <View style={styles.headerRight} />
            </View>
        </View>
    )
}

export default Header

const styles = StyleSheet.create({
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingVertical: SPACING.lg,
    },
    title: {
        fontSize: rf(20),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
        textAlign: 'center',
        flex: 1,
    },
    headerRight: {
        // width: 24,
    },
})
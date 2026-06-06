import { Ionicons } from '@expo/vector-icons';
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacings';

const PADDING_HORIZONTAL = SPACING.lg;
const Header = () => {
    const navigation = useNavigation();
    return (
        <View>
            <View style={styles.appBar}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
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
        marginTop: SPACING.lg,
    },
})
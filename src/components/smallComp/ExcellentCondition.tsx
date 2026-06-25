import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { COLORS } from '@/constants/colors'
import { rf } from '@/utils/responsive'
import { Image } from 'expo-image'
import { FONTS } from '@/constants/fonts'
import { SPACING } from '@/constants/spacings'

const ExcellentCondition = ({ item }: { item: any }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Excellent Condition</Text>
            <View style={styles.box}>
                <Image source={{ uri: item.coverUri }} style={styles.image} />
                <View style={styles.textContainer}>
                    <Text style={{ fontSize: rf(14), color: COLORS.textMuted }}>{item.distance}</Text>
                    <Text style={{ fontSize: rf(16), fontWeight: "bold" }}>{item.condition}</Text>
                    <Text style={{ fontSize: rf(14), color: COLORS.textMuted }}>{item.author}</Text>
                    <Text numberOfLines={1} style={{ fontSize: rf(16), fontWeight: "bold" }}>{item.name}</Text>
                    <Text style={{ fontSize: rf(16), fontWeight: "bold" }}>{item.price}</Text>
                </View>
            </View>
        </View>
    )
}

export default ExcellentCondition

const styles = StyleSheet.create({
    container: {
        marginTop: rf(12),
        marginBottom: rf(10),
        paddingLeft: SPACING.xs,
    },
    headerTitle: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
        paddingHorizontal: rf(20),
    },
    box: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: rf(5)
    },
    image: {
        width: rf(100),
        height: rf(150)
    },
    textContainer: {
        width: "60%"
    }
})
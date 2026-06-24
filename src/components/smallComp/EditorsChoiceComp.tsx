import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ScrollView } from 'react-native'
import { ImageBackground } from 'expo-image'
import { COLORS } from '@/constants/colors'
import { FONTS } from '@/constants/fonts'
import { rf } from '@/utils/responsive'

const EditorsChoiceComp = ({ item }: { item: any }) => {
    console.log('items from editors choice', item);

    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.headerTitle}>Editor's Choice</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.container}
            >
                {item.map((item: any, key: number) => (
                    <ImageBackground
                        source={{ uri: item.coverUri }}
                        style={styles.box}
                        contentFit='cover'
                        key={key}
                    >
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.author}>{item.author}</Text>
                            <Text style={styles.price}>{item.price}</Text>
                        </View>
                    </ImageBackground>
                ))}
            </ScrollView>
        </View>
    )
}

export default EditorsChoiceComp

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 10,
        gap: 10,
        paddingHorizontal: rf(20)
    },
    headerTitle: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
        paddingHorizontal: rf(20)
    },
    box: {
        width: rf(170),
        height: rf(200),
        marginRight: 10,
        backgroundColor: "#fff",
        borderRadius: 10,
        overflow: "hidden",
    },
    sectionContainer: {
        marginTop: rf(12),
        marginBottom: rf(10)
    },
    textContainer: {
        flex: 1,
        justifyContent: "flex-end",
        padding: 10,
        backgroundColor: COLORS.completeTransparency,
        borderRadius: 10,
    },
    title: {
        fontSize: rf(14),
        color: COLORS.white,
        fontFamily: FONTS.manrope.medium,
        textShadowColor: COLORS.black,
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1
    },
    author: {
        fontSize: rf(13),
        color: COLORS.white,
        fontFamily: FONTS.manrope.light
    },
    price: {
        fontSize: rf(12),
        color: COLORS.white,
        fontFamily: FONTS.manrope.regular
    },
})
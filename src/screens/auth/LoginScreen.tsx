import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { FONTS } from '@/constants/fonts'

const LoginScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Welcome to Bookmart</Text>
            <Text style={styles.text}>LoginScreen</Text>
        </View>
    )
}

export default LoginScreen

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 50,
        gap: 100,
    },
    heading: {
        fontSize: 25,
        fontFamily: FONTS.light,
    },
    text: {
        fontSize: 15,
        fontFamily: FONTS.light,
    },
})
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
    interpolate,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { ImageBackground } from 'expo-image';

import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { rf } from '@/utils/responsive';

const CARD_WIDTH = rf(170);
const CARD_HEIGHT = rf(200);

const EditorsChoiceComp = ({ item }: { item: any[] }) => {
    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.headerTitle}>Editor's Choice</Text>

            <Carousel
                loop
                width={CARD_WIDTH + 10}
                height={CARD_HEIGHT}
                data={item}
                autoPlay={false}
                pagingEnabled
                snapEnabled
                style={{
                    width: '100%',
                    marginTop: 10,
                }}
                renderItem={({ item, animationValue }) => {
                    const imageStyle = useAnimatedStyle(() => {
                        const scale = interpolate(
                            animationValue.value,
                            [-1, 0, 1],
                            [1, 1.08, 1]
                        );

                        return {
                            transform: [{ scale }],
                        };
                    });

                    return (
                        <View style={styles.box}>
                            <Animated.View
                                style={[StyleSheet.absoluteFillObject, imageStyle]}
                            >
                                <ImageBackground
                                    source={{ uri: item.coverUri }}
                                    style={StyleSheet.absoluteFill}
                                    contentFit="cover"
                                >
                                    <View style={styles.overlay}>
                                        <Text style={styles.title}>{item.title}</Text>
                                        <Text style={styles.author}>{item.author}</Text>
                                        <Text style={styles.price}>{item.price}</Text>
                                    </View>
                                </ImageBackground>
                            </Animated.View>
                        </View>
                    );
                }}
            />
        </View>
    );
};

export default EditorsChoiceComp;

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: rf(12),
        marginBottom: rf(10),
        paddingLeft: rf(20),
    },
    headerTitle: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text
    },
    box: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: COLORS.white,
    },

    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 10,
        backgroundColor: COLORS.completeTransparency,
    },
    title: {
        fontSize: rf(14),
        color: COLORS.white,
        fontFamily: FONTS.manrope.medium,
        textShadowColor: COLORS.black,
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },

    author: {
        fontSize: rf(13),
        color: COLORS.white,
        fontFamily: FONTS.manrope.light,
    },

    price: {
        fontSize: rf(12),
        color: COLORS.white,
        fontFamily: FONTS.manrope.regular,
    },
});
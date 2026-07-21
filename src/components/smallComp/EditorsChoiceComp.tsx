import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
    interpolate,
    useAnimatedStyle,
    SharedValue,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { rf } from '@/utils/responsive';

const CARD_WIDTH = rf(170);
const CARD_HEIGHT = rf(200);

interface EditorsChoiceCompProps {
    item: any[];
    onBookPress?: (book: any) => void;
}

interface EditorsChoiceItemProps {
    item: any;
    animationValue: SharedValue<number>;
    onBookPress?: (book: any) => void;
}

const EditorsChoiceItem = React.memo(({ item, animationValue, onBookPress }: EditorsChoiceItemProps) => {
    const imageStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            animationValue.value,
            [-1, 0, 1],
            [1, 1.1, 1],
            'identity'
        );

        return {
            transform: [{ scale }],
        };
    });

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onBookPress?.(item)}
            style={styles.box}
        >
            <Animated.View
                style={[StyleSheet.absoluteFill, imageStyle]}
            >
                <Image
                    source={{ uri: item.coverUri }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
                    style={styles.overlay}
                >
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.author} numberOfLines={1}>{item.author}</Text>
                    <Text style={styles.price}>₹{item.price}</Text>
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
});

const EditorsChoiceComp = ({ item, onBookPress }: EditorsChoiceCompProps) => {
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
                scrollAnimationDuration={600}
                onConfigurePanGesture={(gesture) => {
                    'worklet';
                    gesture.activeOffsetX([-15, 15]);
                }}
                style={{
                    width: '100%',
                    marginTop: 10,
                }}
                renderItem={({ item: book, animationValue }) => (
                    <EditorsChoiceItem
                        item={book}
                        animationValue={animationValue}
                        onBookPress={onBookPress}
                    />
                )}
            />
        </View>
    );
};

export default EditorsChoiceComp;

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: rf(12),
        marginBottom: rf(10),
        paddingHorizontal: rf(20),
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
        backgroundColor: COLORS.background,
    },

    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
        padding: 10,
    },
    title: {
        fontSize: rf(14),
        color: COLORS.white,
        fontFamily: FONTS.montserrat.bold,
    },
    author: {
        fontSize: rf(12),
        color: COLORS.white,
        fontFamily: FONTS.manrope.medium,
        opacity: 0.9,
    },
    price: {
        fontSize: rf(14),
        color: COLORS.white,
        fontFamily: FONTS.montserrat.bold,
        marginTop: 4,
    },
});
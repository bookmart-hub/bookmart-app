import React, { useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Image } from 'expo-image';

import Animated, {
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface CategoryItem {
    id: string;
    label: string;
    imageUri: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
    {
        id: '1',
        label: 'Romance',
        imageUri:
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200',
    },
    {
        id: '2',
        label: 'Self Help',
        imageUri:
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200',
    },
    {
        id: '3',
        label: 'Science Fiction',
        imageUri:
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200',
    },
    {
        id: '4',
        label: 'Biography',
        imageUri:
            'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200',
    },
    {
        id: '5',
        label: 'Business',
        imageUri:
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200',
    },
    {
        id: '6',
        label: 'Business',
        imageUri:
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200',
    },
    {
        id: '7',
        label: 'Business',
        imageUri:
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200',
    },
    {
        id: '8',
        label: 'Business',
        imageUri:
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200',
    },
    {
        id: '9',
        label: 'Business',
        imageUri:
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200',
    },
    {
        id: '10',
        label: 'Business',
        imageUri:
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200',
    },
    {
        id: '11',
        label: 'Business',
        imageUri:
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200',
    },
    {
        id: '12',
        label: 'Business',
        imageUri:
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200',
    },
    {
        id: '13',
        label: 'Business',
        imageUri:
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200',
    },
    {
        id: '14',
        label: 'Business',
        imageUri:
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200',
    },
    {
        id: '15',
        label: 'Business',
        imageUri:
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200',
    },
    {
        id: '16',
        label: 'Business',
        imageUri:
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200',
    },
];

const ITEM_WIDTH = 90;
const ITEM_HEIGHT = 120;
const ITEM_GAP = 10;

const SNAP_SIZE = ITEM_WIDTH + ITEM_GAP;

const SIDE_PADDING =
    (SCREEN_WIDTH - ITEM_WIDTH) / 2;

interface CategoryCardProps {
    item: CategoryItem;
    index: number;
    scrollX: SharedValue<number>;
}

const CategoryCard = ({
    item,
    index,
    scrollX,
}: CategoryCardProps) => {
    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * SNAP_SIZE,
            index * SNAP_SIZE,
            (index + 1) * SNAP_SIZE,
        ];

        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.82, 1.2, 0.82],
            Extrapolation.CLAMP
        );

        const translateY = interpolate(
            scrollX.value,
            inputRange,
            [8, -10, 8],
            Extrapolation.CLAMP
        );

        const borderWidth = interpolate(
            scrollX.value,
            inputRange,
            [0, 3, 0],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.7, 1, 0.7],
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { scale },
                { translateY },
            ],
            borderWidth,
            opacity,
        };
    });

    return (
        <Animated.View
            style={[
                styles.cardContainer,
                animatedStyle,
            ]}
        >
            <Image
                source={{ uri: item.imageUri }}
                style={styles.image}
                contentFit="cover"
            />
        </Animated.View>
    );
};

interface CategorySectionProps {
    categories?: CategoryItem[];
}

const CategorySection: React.FC<
    CategorySectionProps
> = ({
    categories = DEFAULT_CATEGORIES,
}) => {
        const scrollX = useSharedValue(0);

        const initialIndex = Math.floor(
            categories.length / 2
        );

        const [activeIndex, setActiveIndex] =
            useState(initialIndex);

        const onScroll =
            useAnimatedScrollHandler({
                onScroll: (event) => {
                    scrollX.value =
                        event.contentOffset.x;
                },
            });

        return (
            <View style={styles.container}>
                <Text style={styles.title}>
                    {categories[activeIndex]?.label}
                </Text>

                <Animated.FlatList
                    horizontal
                    data={categories}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={
                        false
                    }
                    decelerationRate="fast"
                    snapToInterval={SNAP_SIZE}
                    bounces={false}
                    scrollEventThrottle={16}
                    onScroll={onScroll}
                    initialScrollIndex={initialIndex}
                    getItemLayout={(_, index) => ({
                        length: SNAP_SIZE,
                        offset: SNAP_SIZE * index,
                        index,
                    })}
                    contentContainerStyle={{
                        paddingHorizontal:
                            SIDE_PADDING,
                        alignItems: 'center',
                        columnGap: ITEM_GAP,
                    }}
                    onMomentumScrollEnd={(e) => {
                        const index = Math.round(
                            e.nativeEvent.contentOffset.x /
                            SNAP_SIZE
                        );

                        setActiveIndex(index);
                    }}
                    renderItem={({ item, index }) => (
                        <CategoryCard
                            item={item}
                            index={index}
                            scrollX={scrollX}
                        />
                    )}
                />
            </View>
        );
    };

export default CategorySection;

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.sm,
    },

    title: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily:
            FONTS.montserrat.semibold,

        color: COLORS.text,
    },

    cardContainer: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,

        borderRadius: 12,
        overflow: 'hidden',

        borderColor: COLORS.primary,
        padding: 5,
        marginTop: 30,
        backgroundColor: COLORS.background,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,

        elevation: 5,
    },

    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10
    },
});
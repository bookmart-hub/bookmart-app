import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { rem } from '@/utils/responsive';
import { NearestBook } from '@/data/nearestBooksMockData';
import { SPACING } from '@/constants/spacings';

// Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

interface BookMapCardProps {
    book: NearestBook;
    userLocation: { latitude: number; longitude: number } | null;
    onPress?: (book: NearestBook) => void;
    isSelected?: boolean;
}

const EXPANDED_HEIGHT = 180; // Height of the expanded accordion area

const BookMapCard: React.FC<BookMapCardProps> = ({ book, userLocation, onPress, isSelected }) => {
    const navigation = useNavigation<any>();

    const distance = useMemo(() => {
        if (!book.latitude || !book.longitude || !userLocation) return 0;
        return calculateDistance(userLocation.latitude, userLocation.longitude, book.latitude, book.longitude);
    }, [book.latitude, book.longitude, userLocation]);

    const walkingTime = useMemo(() => {
        // Assume avg walking speed is 5km/h (about 12 mins per km)
        return Math.max(1, Math.round(distance * 12));
    }, [distance]);

    const handlePress = () => {
        if (onPress) onPress(book);
    };

    const handleViewDetails = () => {
        navigation.navigate('AppStack', {
            screen: 'BookDetails',
            params: {
                book: {
                    id: book.id,
                    title: book.title,
                    imageUri: book.imageUri,
                    price: book.price,
                    discount: book.discount,
                    categoryId: book.categoryId,
                    condition: book.condition,
                    genre: book.genre,
                },
                categoryTitle: book.genre || 'Nearest Map'
            }
        });
    };

    const expandedStyle = useAnimatedStyle(() => {
        return {
            height: withTiming(isSelected ? EXPANDED_HEIGHT : 0, { duration: 200 }),
            opacity: withTiming(isSelected ? 1 : 0, { duration: 200 }),
            marginTop: withTiming(isSelected ? SPACING.sm : 0, { duration: 200 }),
        };
    });

    return (
        <TouchableOpacity style={[styles.cardContainer, isSelected && styles.cardSelected]} activeOpacity={0.9} onPress={handlePress}>
            {/* Top Compact View */}
            <View style={styles.topContainer}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: book.imageUri }}
                        style={styles.image}
                        contentFit="fill"
                    />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.topRow}>
                        <Text style={styles.title} numberOfLines={1}>{book.title}</Text>
                        <Ionicons
                            name={isSelected ? "chevron-up" : "chevron-down"}
                            size={18}
                            color={COLORS.textMuted}
                        />
                    </View>

                    <Text style={styles.genreText}>{book.genre || 'General'}</Text>

                    <View style={styles.bottomRow}>
                        <Text style={styles.priceText}>₹{book.price}</Text>
                        {userLocation && (
                            <View style={styles.distanceBadge}>
                                <Ionicons name="location-outline" size={12} color={COLORS.primary} />
                                <Text style={styles.distanceText}>
                                    {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Expanded Accordion View */}
            <Animated.View style={[styles.expandedContainer, expandedStyle]}>
                <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                        <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailLabel}>Author: <Text style={styles.detailValue}>{book.author || 'Unknown'}</Text></Text>
                    </View>
                    {userLocation && (
                        <View style={styles.detailItem}>
                            <Ionicons name="walk-outline" size={14} color={COLORS.textMuted} />
                            <Text style={styles.detailLabel}>Walk: <Text style={styles.detailValue}>{walkingTime} mins</Text></Text>
                        </View>
                    )}
                </View>

                <Text style={styles.descriptionText} numberOfLines={2}>
                    A well-kept copy of {book.title} in {book.condition || 'good'} condition. Ready for immediate pickup.
                </Text>

                <TouchableOpacity style={styles.viewDetailsBtn} onPress={handleViewDetails} activeOpacity={0.8}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.white} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
            </Animated.View>
        </TouchableOpacity>
    );
};

export default React.memo(BookMapCard);

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: 'transparent',
        padding: SPACING.sm,
    },
    cardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: '#fafdff', // Very light blue/primary tint
    },
    topContainer: {
        flexDirection: 'row',
        height: 90,
    },
    imageContainer: {
        width: 70,
        height: '100%',
        backgroundColor: COLORS.grayLight,
        borderRadius: 10,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        flex: 1,
        paddingLeft: SPACING.md,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: rem(0.9375),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
        flex: 1,
        marginRight: SPACING.sm,
    },
    genreText: {
        fontSize: rem(0.75),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto',
    },
    priceText: {
        fontFamily: FONTS.manrope.extraBold,
        fontSize: rem(1),
        color: COLORS.primary,
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.grayLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    distanceText: {
        fontSize: rem(0.6875),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.text,
        marginLeft: 4,
    },

    // Expanded Section
    expandedContainer: {
        overflow: 'hidden',
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'rgba(0,0,0,0.02)',
        padding: SPACING.sm,
        borderRadius: 12,
        marginTop: SPACING.xs,
    },
    detailItem: {
        width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: rem(0.6875),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginLeft: 6,
    },
    detailValue: {
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
    },
    descriptionText: {
        fontSize: rem(0.75),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.text,
        lineHeight: 18,
        marginTop: SPACING.sm,
        paddingHorizontal: 4,
    },
    viewDetailsBtn: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 'auto',
    },
    viewDetailsText: {
        color: COLORS.white,
        fontFamily: FONTS.manrope.bold,
        fontSize: rem(0.875),
    },
});

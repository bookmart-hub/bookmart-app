import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { BookItem } from '@/components/ui/CategoryMasonryLayout';
import Header from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';

const { width, height } = Dimensions.get('window');

const isAcademicCategory = (category: string) => {
    if (!category) return false;
    const academicKeywords = [
        'textbook', 'academic', 'exam', 'reference', 'study',
        'certification', 'guide', 'business'
    ];
    const lowerCategory = category.toLowerCase();
    return academicKeywords.some(keyword => lowerCategory.includes(keyword));
};

const PADDING_HORIZONTAL = SPACING.lg;

const BookDetailsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute<any>();

    const book: BookItem | undefined = route.params?.book;
    const categoryTitle: string = route.params?.categoryTitle || '';

    const isAcademic = useMemo(() => isAcademicCategory(categoryTitle), [categoryTitle]);

    if (!book) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.errorText}>Book not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: COLORS.primary, fontFamily: FONTS.montserrat.semibold }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent]}
                bounces={false}
            >
                {/* Book Cover Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: book.imageUri }}
                        style={styles.bookImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                    />
                </View>

                {/* Content Section */}
                <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
                        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="heart" size={26} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Author Avatar */}
                    <View style={styles.authorRow}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' }}
                            style={styles.authorAvatar}
                            contentFit="cover"
                        />
                    </View>

                    {/* Conditional Section */}
                    <View style={styles.reasonsSection}>
                        <Text style={styles.reasonsHeader}>
                            {isAcademic ? 'Why buy this:' : 'Why read this:'}
                        </Text>
                        <View style={styles.reasonsList}>
                            {[1, 2, 3, 4].map((num) => (
                                <Text key={num} style={styles.reasonItem}>
                                    {num}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra dignissim ac, Nibh et sed ac, eget malesuada.
                                </Text>
                            ))}
                        </View>
                    </View>
                </View>
                <View>
                    <Text style={styles.reviewHeader}>Ratings and reviews </Text>
                </View>
            </ScrollView>

            {/* Bottom Sticky Action Bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.md }]}>
                <Button
                    title="Continue shopping"
                    onPress={() => navigation.goBack()}
                    style={styles.primaryButton}
                    textStyle={styles.primaryButtonText}
                />

                <Button
                    title="View cart"
                    onPress={() => navigation.navigate('Cart' as never)}
                    style={styles.secondaryButton}
                    textStyle={styles.secondaryButtonText}
                />
            </View>
        </View>
    );
};

export default BookDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    errorText: {
        fontSize: 16,
        fontFamily: FONTS.montserrat.medium,
        color: COLORS.text,
    },
    scrollContent: {
        paddingBottom: 100, // Space for bottom bar
    },
    backButton: {
        position: 'absolute',
        top: 0,
        left: SPACING.lg,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        paddingHorizontal: SPACING.xl,
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    bookImage: {
        width: '90%',
        height: height * 0.45,
        borderRadius: 24,
        backgroundColor: COLORS.grayLight,
    },
    contentContainer: {
        paddingHorizontal: SPACING.lg,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    title: {
        flex: 1,
        fontSize: 24,
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginRight: SPACING.md,
        lineHeight: 32,
    },
    authorRow: {
        marginBottom: SPACING.xl,
    },
    authorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.grayLight,
    },
    reasonsSection: {
        marginBottom: SPACING.xl,
    },
    reasonsHeader: {
        fontSize: 16,
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        textDecorationLine: 'underline',
        marginBottom: SPACING.md,
    },
    reasonsList: {
        gap: SPACING.sm,
    },
    reasonItem: {
        fontSize: 14,
        fontFamily: FONTS.manrope.medium,
        color: '#9CA3AF', // lighter gray matching the design's textMuted
        lineHeight: 22,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        gap: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.grayLight,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    primaryButton: {
        flex: 1.5,
        backgroundColor: COLORS.primary,
        borderRadius: 30,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: 16,
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.white,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#F9FAFB', // very light gray like COLORS.grayLight
        borderRadius: 30,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewHeader: {
        fontSize: 18,
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        paddingHorizontal: SPACING.lg,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.primary,
    },
});

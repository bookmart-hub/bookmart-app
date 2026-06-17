import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { Book } from '@/data/models';
import Header from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import StarRating from 'react-native-star-rating-widget';
import QuantitySelector from '@/components/ui/QuantitySelector';
import { MOCK_CATEGORIES } from '@/data/nearestBooksMockData';

const { width, height } = Dimensions.get('window');

import { TextInput } from 'react-native';
import HeartBurst from '@/components/ui/HeartBrust';
import { rf } from '@/utils/responsive';

const isAcademicCategory = (category: string) => {
    if (!category) return false;
    const academicKeywords = [
        'engineering', 'medical', 'law', 'competitive', 'exam', 'textbook', 'reference', 'study', 'academic'
    ];
    const lowerCategory = category.toLowerCase();
    return academicKeywords.some(keyword => lowerCategory.includes(keyword));
};

const PADDING_HORIZONTAL = SPACING.lg;

const BookDetailsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const [isFavorite, setIsFavorite] = useState(false);
    const [showBurst, setShowBurst] = useState(false);

    const book: Book | undefined = route.params?.book;
    console.log("🚀 ~ BookDetailsScreen ~ book:", book)
    const categoryTitle: string = route.params?.categoryTitle || '';

    const isAcademic = useMemo(() => isAcademicCategory(categoryTitle), [categoryTitle]);

    const genreName = useMemo(() => {
        if (book?.genre) return book.genre;
        if (book?.categoryId) {
            const cat = MOCK_CATEGORIES.find(c => c.id === book.categoryId);
            if (cat) return cat.name;
        }
        if (categoryTitle) return categoryTitle;
        return 'General';
    }, [book?.genre, book?.categoryId, categoryTitle]);

    const [localReviews, setLocalReviews] = useState(book?.reviews || []);
    const [localRatings, setLocalRatings] = useState(book?.ratings);
    const [newReviewText, setNewReviewText] = useState('');
    const [newReviewRating, setNewReviewRating] = useState(0);

    const handleFavorite = () => {
        const next = !isFavorite;

        setIsFavorite(next);

        if (next) {
            setShowBurst(true);

            setTimeout(() => {
                setShowBurst(false);
            }, 700);
        }
    };

    const handleAddReview = () => {
        if (newReviewRating === 0 || !newReviewText.trim()) return;

        const newReview = {
            id: Date.now().toString(),
            reviewerName: 'Current User', // Mocked user
            rating: newReviewRating,
            comment: newReviewText,
            date: new Date().toISOString().split('T')[0],
        };

        const updatedReviews = [newReview, ...localReviews];
        setLocalReviews(updatedReviews);

        if (localRatings) {
            const newTotal = localRatings.totalReviews + 1;
            const newAverage = ((localRatings.average * localRatings.totalReviews) + newReviewRating) / newTotal;
            setLocalRatings({
                ...localRatings,
                average: Number(newAverage.toFixed(1)),
                totalReviews: newTotal,
                fiveStar: localRatings.fiveStar + (newReviewRating === 5 ? 1 : 0),
                fourStar: localRatings.fourStar + (newReviewRating === 4 ? 1 : 0),
                threeStar: localRatings.threeStar + (newReviewRating === 3 ? 1 : 0),
                twoStar: localRatings.twoStar + (newReviewRating === 2 ? 1 : 0),
                oneStar: localRatings.oneStar + (newReviewRating === 1 ? 1 : 0),
            });
        }

        setNewReviewText('');
        setNewReviewRating(0);
    };

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
            <Header backButton />
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
                        <View
                            style={{
                                position: 'relative',
                                width: 30,
                                height: 30,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <TouchableOpacity
                                hitSlop={{
                                    top: 10,
                                    bottom: 10,
                                    left: 10,
                                    right: 10,
                                }}
                                onPress={handleFavorite}
                            >
                                <Ionicons
                                    name={isFavorite ? 'heart' : 'heart-outline'}
                                    size={26}
                                    color={COLORS.primary}
                                />
                            </TouchableOpacity>

                            {showBurst && <HeartBurst />}
                        </View>
                    </View>

                    {/* Author Avatar */}
                    <View style={styles.authorRow}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' }}
                            style={styles.authorAvatar}
                            contentFit="cover"
                        />
                        <Text style={styles.authorName}>{book.author}</Text>
                    </View>

                    <View style={styles.bookMetaCard}>
                        <View style={styles.conditionSection}>
                            <Text style={styles.priceLabel}>Condition</Text>
                            <Text style={styles.conditionValue}>
                                {book.condition || 'Used - Good'}
                            </Text>

                            {book.conditionNote ? (
                                <Text style={styles.conditionNote}>
                                    {book.conditionNote}
                                </Text>
                            ) : null}
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.priceSection}>
                            <Text style={styles.priceLabel}>Price</Text>
                            <Text style={styles.priceValue}>₹{book.price}</Text>
                        </View>
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

                    {/* Genre Section */}
                    <View style={styles.genreSection}>
                        <Text style={styles.sectionTitle}>Genre</Text>
                        <View style={styles.genreChip}>
                            <Text style={styles.genreText}>{genreName}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.reviewSection}>
                    <Text style={styles.reviewHeaderTitle}>Ratings and reviews</Text>

                    {/* Ratings Overview */}
                    <View style={styles.ratingsOverview}>
                        <View style={styles.averageRatingContainer}>
                            <Text style={styles.averageRatingText}>{localRatings?.average || 0}</Text>
                            <StarRating
                                rating={localRatings?.average || 0}
                                onChange={() => { }} // Read-only
                                maxStars={5}
                                starSize={20}
                                color={COLORS.yellow}
                                enableSwiping={false}
                                animationConfig={{ scale: 1 }}
                            />
                            <Text style={styles.totalReviewsText}>{localRatings?.totalReviews || 0} reviews</Text>
                        </View>

                        <View style={styles.ratingBarsContainer}>
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = localRatings ? (localRatings as any)[`${star === 5 ? 'five' : star === 4 ? 'four' : star === 3 ? 'three' : star === 2 ? 'two' : 'one'}Star`] : 0;
                                const percentage = localRatings && localRatings.totalReviews > 0 ? (count / localRatings.totalReviews) * 100 : 0;
                                return (
                                    <View key={star} style={styles.ratingBarRow}>
                                        <Text style={styles.starLabel}>{star}</Text>
                                        <View style={styles.barBackground}>
                                            <View style={[styles.barFill, { width: `${percentage}%` }]} />
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* Dynamic Reviews List */}
                    <View style={styles.reviewsList}>
                        {localReviews && localReviews.length > 0 ? (
                            localReviews.map((review) => (
                                <View key={review.id} style={styles.reviewCard}>
                                    <View style={styles.reviewHeaderRow}>
                                        <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                                        <Text style={styles.reviewDate}>{review.date}</Text>
                                    </View>
                                    <StarRating
                                        rating={review.rating}
                                        onChange={() => { }}
                                        maxStars={5}
                                        starSize={14}
                                        color={COLORS.yellow}
                                        enableSwiping={false}
                                        animationConfig={{ scale: 1 }}
                                    />
                                    <Text style={styles.reviewComment}>{review.comment}</Text>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyReviewsContainer}>
                                <Text style={styles.emptyReviewsText}>No reviews yet. Be the first to review!</Text>
                            </View>
                        )}
                    </View>

                    {/* Add Review Form */}
                    <View style={styles.addReviewContainer}>
                        <Text style={styles.addReviewTitle}>Write a Review</Text>
                        <StarRating
                            rating={newReviewRating}
                            onChange={setNewReviewRating}
                            maxStars={5}
                            starSize={28}
                            color={COLORS.yellow}
                            style={{ alignSelf: 'flex-start', marginBottom: SPACING.md }}
                        />
                        <TextInput
                            style={styles.reviewInput}
                            placeholder="What did you think of this book?"
                            placeholderTextColor={COLORS.textMuted}
                            multiline
                            numberOfLines={4}
                            value={newReviewText}
                            onChangeText={setNewReviewText}
                            textAlignVertical="top"
                        />
                        <TouchableOpacity
                            style={[styles.submitReviewBtn, (!newReviewText.trim() || newReviewRating === 0) && styles.submitReviewBtnDisabled]}
                            onPress={handleAddReview}
                            disabled={!newReviewText.trim() || newReviewRating === 0}
                        >
                            <Text style={styles.submitReviewText}>Submit Review</Text>
                        </TouchableOpacity>
                    </View>
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
        backgroundColor: COLORS.background,
    },
    errorText: {
        fontSize: rf(16),
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
        fontSize: rf(24),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginRight: SPACING.md,
        lineHeight: 32,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    authorName: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.text,
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
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        textDecorationLine: 'underline',
        marginBottom: SPACING.md,
    },
    reasonsList: {
        gap: SPACING.sm,
    },
    reasonItem: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted, // lighter gray matching the design's textMuted
        lineHeight: 22,
    },
    genreSection: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: SPACING.sm,
    },
    genreChip: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.grayLight,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
    },
    genreText: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
    bookMetaCard: {
        backgroundColor: COLORS.white,
        marginTop: -SPACING.lg,
        borderRadius: 18,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        marginBottom: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    priceSection: {
        gap: SPACING.sm,
    },

    priceLabel: {
        fontSize: rf(12),
        color: COLORS.textMuted,
        fontFamily: FONTS.manrope.medium,
    },

    priceValue: {
        fontSize: rf(26),
        color: COLORS.primary,
        fontFamily: FONTS.montserrat.bold,
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.grayLight,
        marginVertical: SPACING.sm,
    },

    conditionSection: {
        gap: 4,
    },

    conditionValue: {
        fontSize: rf(15),
        color: COLORS.black,
        fontFamily: FONTS.montserrat.semibold,
    },

    conditionNote: {
        fontSize: rf(13),
        lineHeight: 20,
        color: COLORS.textMuted,
        fontFamily: FONTS.manrope.medium,
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
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.white,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: COLORS.grayLight,
        borderRadius: 30,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
    },
    reviewHeaderTitle: {
        fontSize: rf(20),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: SPACING.md,
    },
    reviewSection: {
        marginTop: SPACING.md,
        paddingHorizontal: SPACING.lg,
    },
    ratingsOverview: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        backgroundColor: COLORS.grayLight,
        padding: SPACING.md,
        borderRadius: 16,
    },
    averageRatingContainer: {
        alignItems: 'center',
        marginRight: SPACING.lg,
    },
    averageRatingText: {
        fontSize: rf(36),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: 4,
    },
    totalReviewsText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginTop: 6,
    },
    ratingBarsContainer: {
        flex: 1,
    },
    ratingBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    starLabel: {
        width: 12,
        fontSize: rf(12),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
        marginRight: 8,
    },
    barBackground: {
        flex: 1,
        height: 6,
        backgroundColor: COLORS.grayHeavvy,
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: COLORS.yellow,
        borderRadius: 3,
    },
    reviewsList: {
        gap: SPACING.md,
    },
    reviewCard: {
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
    },
    reviewHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    reviewerName: {
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.black,
    },
    reviewDate: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    reviewComment: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
        marginTop: 8,
        lineHeight: 20,
    },
    emptyReviewsContainer: {
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.grayLight,
        borderRadius: 12,
    },
    emptyReviewsText: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    addReviewContainer: {
        marginTop: SPACING.xl,
        paddingTop: SPACING.xl,
        borderTopWidth: 1,
        borderTopColor: COLORS.grayLight,
    },
    addReviewTitle: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: SPACING.sm,
    },
    reviewInput: {
        backgroundColor: COLORS.grayLight,
        borderRadius: 12,
        padding: SPACING.md,
        fontSize: rf(14),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.black,
        minHeight: 100,
        marginBottom: SPACING.md,
    },
    submitReviewBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitReviewBtnDisabled: {
        backgroundColor: COLORS.grayHeavvy,
    },
    submitReviewText: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.white,
    },
    secondaryButtonText: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.primary,
    },
});

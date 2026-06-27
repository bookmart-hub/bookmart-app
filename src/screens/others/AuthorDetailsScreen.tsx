import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import StarRating from 'react-native-star-rating-widget';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { Author } from '@/data/authorMockData';
import Header from '@/components/ui/Header';

const { width } = Dimensions.get('window');
const COLUMN_GAP = SPACING.md;
const PADDING_HORIZONTAL = SPACING.lg;
const BOOK_CARD_WIDTH = (width - PADDING_HORIZONTAL * 2 - COLUMN_GAP) / 2;

const MOCK_AUTHOR_BOOKS = [
    {
        id: 'b1',
        title: 'The Da vinci Code',
        price: 230,
        imageUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop',
    },
    {
        id: 'b2',
        title: 'Carrie Fisher',
        price: 230,
        imageUri: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop',
    },
    {
        id: 'b3',
        title: 'The Good Sister',
        price: 230,
        imageUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop',
    },
    {
        id: 'b4',
        title: 'The Waiting',
        price: 230,
        imageUri: 'https://images.unsplash.com/photo-1629196914225-ebdd4da6af5a?q=80&w=400&auto=format&fit=crop',
    },
];

const AuthorDetailsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute<any>();

    // Author can come from either AuthorListScreen (Author type) or HomeScreen (AuthorItem type)
    const author = route.params?.author;

    if (!author) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.errorText}>Author not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: COLORS.primary, fontFamily: FONTS.montserrat.semibold }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const imageSource = author.imageUri || author.photoUri;
    const category = author.category || 'Author';
    const rating = author.rating || 4.0;

    // Fallback long bio if the provided bio is too short
    const fullBio = author.bio && author.bio.length > 50
        ? author.bio
        : `${author.bio} Gunty was born and raised in South Bend, Indiana. She graduated from the University of Notre Dame with a Bachelor of Arts in English and from New York University.`;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="Authors" backButton onPress={() => navigation.goBack()} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <Image source={{ uri: imageSource }} style={styles.image} contentFit="cover" />
                    <Text style={styles.category}>{category}</Text>
                    <Text style={styles.name}>{author.name}</Text>

                    <View style={styles.ratingContainer}>
                        <StarRating
                            rating={rating}
                            onChange={() => { }}
                            maxStars={5}
                            starSize={24}
                            color={COLORS.yellow}
                            enableSwiping={false}
                            animationConfig={{ scale: 1 }}
                            starStyle={{ marginHorizontal: 2 }}
                        />
                        <Text style={styles.ratingText}>({rating.toFixed(1)})</Text>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.aboutSection}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.bioText}>{fullBio}</Text>
                </View>

                {/* Books Section */}
                <View style={styles.booksSection}>
                    <Text style={styles.sectionTitle}>Books</Text>
                    <View style={styles.booksGrid}>
                        {MOCK_AUTHOR_BOOKS.map((book) => (
                            <View key={book.id} style={styles.bookCard}>
                                <Image source={{ uri: book.imageUri }} style={styles.bookCover} contentFit="cover" />
                                <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                                <View style={styles.priceContainer}>
                                    <View style={styles.currencyBadge}>
                                        <Text style={styles.currencySymbol}>₹</Text>
                                    </View>
                                    <Text style={styles.bookPrice}>{book.price}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};

export default AuthorDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        marginBottom: SPACING.lg,
    },
    backButton: {
        width: 40,
    },
    headerTitle: {
        fontSize: rf(20),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
    },
    headerRight: {
        width: 40,
    },
    scrollContent: {
        paddingBottom: SPACING.xl,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: SPACING.sm,
    },
    category: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginBottom: SPACING.sm,
    },
    name: {
        fontSize: rf(20),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: SPACING.sm,
        paddingHorizontal: PADDING_HORIZONTAL
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
        marginLeft: SPACING.sm,
    },
    aboutSection: {
        paddingHorizontal: PADDING_HORIZONTAL,
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: SPACING.md,
    },
    bioText: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        lineHeight: 22,
    },
    booksSection: {
        paddingHorizontal: PADDING_HORIZONTAL,
    },
    booksGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: COLUMN_GAP,
    },
    bookCard: {
        width: BOOK_CARD_WIDTH,
        marginBottom: SPACING.md,
    },
    bookCover: {
        width: '100%',
        height: BOOK_CARD_WIDTH * 1.25,
        borderRadius: 12,
        marginBottom: SPACING.sm,
        backgroundColor: COLORS.grayLight,
    },
    bookTitle: {
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.black,
        marginBottom: 2,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencyBadge: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 4,
    },
    currencySymbol: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.white,
    },
    bookPrice: {
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
    },
    errorText: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.medium,
        color: COLORS.text,
    },
});

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import Header from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { StatusBar } from 'expo-status-bar';
import HeartBurst from '@/components/ui/HeartBrust';

const BOOKS_DATA = [
    {
        id: '1',
        title: 'Atomic Habits',
        author: 'James Clear',
        price: '350',
        views: 128,
        messages: 12,
        coverUri: 'https://m.media-amazon.com/images/I/91bYsX41DVL.jpg',
    },
    {
        id: '2',
        title: 'The Kite Runner',
        author: 'Khaled Hosseini',
        price: '230',
        views: 98,
        messages: 8,
        coverUri: 'https://m.media-amazon.com/images/I/81IzbD2IiIL.jpg',
    },
    {
        id: '3',
        title: '1984',
        author: 'George Orwell',
        price: '200',
        views: 76,
        messages: 5,
        coverUri: 'https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg',
    },
    {
        id: '4',
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        price: '280',
        views: 112,
        messages: 9,
        coverUri: 'https://m.media-amazon.com/images/I/71aFt4+OTOL.jpg',
    },
];

const TOP_COLLEGES = [
    { id: 'c1', name: 'Shri Ram College of Commerce', university: 'University of Delhi', books: 532, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Shri_Ram_College_of_Commerce.png/220px-Shri_Ram_College_of_Commerce.png' },
    { id: 'c2', name: 'Hindu College', university: 'University of Delhi', books: 412, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Hindu_College_Delhi_Logo.jpg/220px-Hindu_College_Delhi_Logo.jpg' },
    { id: 'c3', name: 'Lady Shri Ram College', university: 'University of Delhi', books: 398, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/82/Lady_Shri_Ram_College_for_Women_Logo.jpg/220px-Lady_Shri_Ram_College_for_Women_Logo.jpg' },
    { id: 'c4', name: 'Kirori Mal College', university: 'University of Delhi', books: 287, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/Kirori_Mal_College_Logo.jpg/220px-Kirori_Mal_College_Logo.jpg' },
    { id: 'c5', name: 'Hansraj College', university: 'University of Delhi', books: 235, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/44/Hansraj_College_logo.jpg/220px-Hansraj_College_logo.jpg' },
];

const CollegeBookCard = ({ book }: { book: any }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [showBurst, setShowBurst] = useState(false);

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

    return (
        <View style={styles.bookCardContainer}>
            <View style={styles.bookCard}>
                <View style={styles.bookCoverWrap}>
                    <Image
                        source={{ uri: book.coverUri }}
                        style={styles.bookCover}
                        contentFit="contain"
                    />
                    <TouchableOpacity activeOpacity={0.6} style={styles.favBtn} onPress={handleFavorite}>
                        {showBurst && (
                            <View style={styles.burstContainer}>
                                <HeartBurst />
                            </View>
                        )}
                        <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
            <Text style={styles.bookPrice}>₹{book.price}</Text>

            <View style={styles.bookMetrics}>
                <View style={styles.metricItem}>
                    <Ionicons name="eye-outline" size={12} color={COLORS.textMuted} />
                    <Text style={styles.metricText}>{book.views}</Text>
                </View>
                <View style={styles.metricItem}>
                    <Ionicons name="chatbubble-outline" size={12} color={COLORS.textMuted} />
                    <Text style={styles.metricText}>{book.messages}</Text>
                </View>
            </View>
        </View>
    );
};

const CollegeInsightsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const renderActivitySection = () => (
        <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Your College Activity</Text>
            <Text style={styles.sectionSub}>
                See how many students from your college are using BookMart.
            </Text>

            <View style={styles.collegeCard}>
                <View style={styles.collegeCardLeft}>
                    <View style={styles.collegeIconWrap}>
                        <Ionicons name="school-outline" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.collegeTextWrap}>
                        <Text style={styles.collegeName} numberOfLines={1}>Shri Ram College of Commerce</Text>
                        <Text style={styles.collegeUniv} numberOfLines={1}>University of Delhi</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Ionicons name="people" size={20} color={COLORS.primary} style={styles.statIcon} />
                    <Text style={styles.statNum}>248</Text>
                    <Text style={styles.statTitle}>Students on BookMart</Text>
                    <Text style={styles.statDesc}>From your college</Text>
                </View>
                <View style={styles.statBox}>
                    <Ionicons name="book-outline" size={20} color={COLORS.primary} style={styles.statIcon} />
                    <Text style={styles.statNum}>532</Text>
                    <Text style={styles.statTitle}>Books Listed</Text>
                    <Text style={styles.statDesc}>By your college</Text>
                </View>
                <View style={styles.statBox}>
                    <Ionicons name="eye-outline" size={20} color={COLORS.primary} style={styles.statIcon} />
                    <Text style={styles.statNum}>1.8K</Text>
                    <Text style={styles.statTitle}>Total Views</Text>
                    <Text style={styles.statDesc}>On college books</Text>
                </View>
            </View>
        </View>
    );

    const renderBooksSection = () => (
        <View style={styles.booksSection}>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitleSmall}>Books from Your College</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.booksScrollContent}
            >
                {BOOKS_DATA.map((book) => (
                    <CollegeBookCard key={book.id} book={book} />
                ))}
            </ScrollView>
        </View>
    );

    const renderTopColleges = () => (
        <View style={styles.topCollegesSection}>
            <View style={styles.sectionHeaderRow}>
                <View>
                    <Text style={styles.sectionTitleSmall}>Top Colleges</Text>
                    <Text style={styles.sectionSubSmall}>Colleges with the most active listings</Text>
                </View>
            </View>

            <View style={styles.leaderboardList}>
                {TOP_COLLEGES.map((college, index) => (
                    <View key={college.id} style={styles.leaderboardItem}>
                        <Text style={styles.rankText}>{index + 1}</Text>
                        <View style={styles.collegeLogoWrap}>
                            <Image
                                source={{ uri: college.logo }}
                                style={styles.collegeLogo}
                                contentFit="contain"
                            />
                        </View>
                        <View style={styles.leaderboardInfo}>
                            <Text style={styles.leaderboardName} numberOfLines={1}>{college.name}</Text>
                            <Text style={styles.leaderboardUniv} numberOfLines={1}>{college.university}</Text>
                        </View>
                        <View style={styles.leaderboardRight}>
                            <Text style={styles.leaderboardBooks}>{college.books}</Text>
                            <Text style={styles.leaderboardBooksLabel}>Books Listed</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />
            <Header
                title="College Insights"
                backButton
                rightElement={
                    <TouchableOpacity>
                        <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {renderActivitySection()}
                {renderBooksSection()}
                {renderTopColleges()}

                <View style={styles.inviteCard}>
                    <View style={styles.inviteIconWrap}>
                        <Ionicons name="people" size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.inviteInfo}>
                        <Text style={styles.inviteTitle}>Invite More Students</Text>
                        <Text style={styles.inviteDesc}>
                            Help more students from your {'\n'} college discover and buy & sell books.
                        </Text>
                    </View>
                    <Button
                        title="Invite"
                        style={styles.inviteBtn}
                        textStyle={styles.inviteBtnText}
                        icon={<Ionicons name="share-social" size={12} color={COLORS.white} />}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default CollegeInsightsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingTop: SPACING.md,
    },
    activitySection: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: 4,
    },
    sectionSub: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginBottom: SPACING.md,
    },
    collegeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.grayLight,
        borderRadius: 12,
        padding: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        marginBottom: SPACING.lg,
    },
    collegeCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: SPACING.sm,
    },
    collegeIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.blueLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    collegeTextWrap: {
        flex: 1,
    },
    collegeName: {
        fontSize: rf(11.5),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
    },
    collegeUniv: {
        fontSize: rf(9.5),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    changeCollegeBtn: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    changeCollegeText: {
        fontSize: rf(10),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.primary,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.sm,
    },
    statBox: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    statIcon: {
        marginBottom: 4,
    },
    statNum: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
        marginBottom: 4,
    },
    statTitle: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
        textAlign: 'center',
    },
    statDesc: {
        fontSize: rf(8),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 2,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    sectionTitleSmall: {
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
    },
    sectionSubSmall: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        gap: 4,
    },
    filterText: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.text,
    },
    axisText: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendLine: {
        width: 16,
        height: 2,
    },
    legendText: {
        fontSize: rf(9.5),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    booksSection: {
        marginBottom: SPACING.xl,
    },
    viewAllRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: rf(11),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.primary,
    },
    booksScrollContent: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    bookCardContainer: {
        width: 130,
    },
    bookCard: {
        width: 130,
        height: 160,
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 8,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        marginBottom: 8,
    },
    bookCoverWrap: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    bookCover: {
        width: '100%',
        height: '100%',
    },
    favBtn: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        zIndex: 2,
    },
    burstContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 10,
        height: 10,
        marginLeft: -5,
        marginTop: -5,
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 1,
    },
    bookTitle: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
        marginBottom: 2,
    },
    bookAuthor: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    bookPrice: {
        fontSize: rf(12),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
    },
    bookMetrics: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metricText: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
    },
    topCollegesSection: {
        marginBottom: SPACING.xl,
    },
    leaderboardList: {
        paddingHorizontal: SPACING.lg,
    },
    leaderboardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.grayHeavvy,
    },
    rankText: {
        fontSize: rf(12),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
        width: 20,
    },
    collegeLogoWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.grayLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
    },
    collegeLogo: {
        width: 20,
        height: 20,
    },
    leaderboardInfo: {
        flex: 1,
        paddingRight: SPACING.sm,
    },
    leaderboardName: {
        fontSize: rf(11),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
        marginBottom: 2,
    },
    leaderboardUniv: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    leaderboardRight: {
        alignItems: 'flex-end',
    },
    leaderboardBooks: {
        fontSize: rf(13),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
    },
    leaderboardBooksLabel: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.primary,
    },
    inviteCard: {
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        backgroundColor: COLORS.grayLight,
        borderRadius: 12,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        flexDirection: 'row',
        alignItems: 'center',
    },
    inviteIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.purplelight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    inviteInfo: {
        marginRight: SPACING.sm,
    },
    inviteTitle: {
        fontSize: rf(12),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
        marginBottom: 4,
    },
    inviteDesc: {
        fontSize: rf(9.5),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        lineHeight: 14,
    },
    inviteBtn: {
        height: rf(32),
        width: rf(70),
        alignItems: 'center',
        justifyContent: 'center',
    },
    inviteBtnText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.medium,
    },
});

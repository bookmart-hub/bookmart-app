import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ToastAndroid
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
import HorizontalBookList from '@/components/ui/HorizontalBookList';
import { StatusBar } from 'expo-status-bar';
import { Divider, Menu } from 'react-native-paper';


const ACTIVE_BOOKS = [
    {
        id: '1',
        title: 'Atomic Habits',
        author: 'James Clear',
        price: '350',
        coverUri: 'https://m.media-amazon.com/images/I/91bYsX41DVL.jpg',
        condition: 'Good',
    },
    {
        id: '2',
        title: 'The Kite Runner',
        author: 'Khaled Hosseini',
        price: '230',
        coverUri: 'https://m.media-amazon.com/images/I/81IzbD2IiIL.jpg',
        condition: 'Good',
    },
    {
        id: '3',
        title: '1984',
        author: 'George Orwell',
        price: '200',
        coverUri: 'https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg',
        condition: 'Good',
    },
    {
        id: '4',
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        price: '280',
        coverUri: 'https://m.media-amazon.com/images/I/71aFt4+OTOL.jpg',
        condition: 'Like New',
    },
];

const SOLD_BOOKS = [
    {
        id: 's1',
        title: 'Rich Dad Poor Dad',
        author: 'Robert T. Kiyosaki',
        price: '180',
        coverUri: 'https://m.media-amazon.com/images/I/81bsw6fnUiL.jpg',
        condition: 'Sold 3 days ago', // Using condition field for sold status
    },
    {
        id: 's2',
        title: 'Deep Work',
        author: 'Cal Newport',
        price: '220',
        coverUri: 'https://m.media-amazon.com/images/I/81qnd0J2hwL.jpg',
        condition: 'Sold 1 week ago',
    },
];

const PublicProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [menuVisible, setMenuVisible] = useState(false);
    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);
    const [ispublic, setIsPublic] = useState(true);
    const deleteAccount = () => {
        // TODO: Implement delete account logic
        ToastAndroid.show("Account deleted successfully", ToastAndroid.SHORT);
        navigation.goBack();
    };

    const renderProfileHeader = () => (
        <View style={styles.profileHeaderContainer}>
            <View style={styles.profileMainRow}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={50} color={COLORS.grayHeavvy} />
                </View>

                <View style={styles.profileInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.nameText}>Amit Roy</Text>
                        <View style={styles.badgeContainer}>
                            <Ionicons name="shield-checkmark" size={10} color={COLORS.black} />
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="school-outline" size={14} color={COLORS.primary} style={styles.infoIcon} />
                        <Text style={styles.infoText}>B.G.C College</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={14} color={COLORS.primary} style={styles.infoIcon} />
                        <Text style={styles.infoText}>Kolkata, India</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={14} color={COLORS.primary} style={styles.infoIcon} />
                        <Text style={styles.infoText}>Joined Jan 2026</Text>
                    </View>
                </View>

                <View style={styles.trustedCard}>
                    <View style={styles.trustedIconRow}>
                        <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
                        <Text style={styles.trustedTitle}>Trusted{"\n"}Seller</Text>
                    </View>
                    {/* <Text style={styles.trustedSub}>Quick replies</Text>
                    <Text style={styles.trustedSub}>Reliable deals</Text> */}
                </View>
            </View>
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>348</Text>
                <Text style={styles.statLabel}>Successful Contacts</Text>
                <Text style={styles.statSub}>Through WhatsApp</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>Active Listings</Text>
                <Text style={styles.statSub}>Books for sale</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Books Sold</Text>
                <Text style={styles.statSub}>Successfully</Text>
            </View>
        </View>
    );

    const renderActions = () => (
        <View style={styles.actionsContainer}>
            <Button
                title="Contact"
                style={styles.actionBtnWhatsApp}
                textStyle={styles.actionBtnTextWhite}
                icon={<Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.white} />}
            />
            <Button
                title="Share Profile"
                variant="outline"
                style={styles.actionBtnOutline}
                textStyle={styles.actionBtnTextPrimary}
                icon={<Ionicons name="share-social-outline" size={18} color={COLORS.primary} />}
            />
        </View>
    );

    const renderAbout = () => (
        <View style={styles.aboutContainer}>
            <View style={styles.aboutHeader}>
                <Ionicons name="person-circle" size={20} color={COLORS.primary} />
                <Text style={styles.aboutTitle}>About Amit</Text>
            </View>
            <Text style={styles.aboutText}>
                Student of Computer Science.{"\n"}
                Interested in programming, entrepreneurship and technology.{"\n"}
                Selling academic and self-help books.
            </Text>
        </View>
    );

    const renderInfoCards = () => (
        <View style={styles.infoCardsContainer}>
            <View style={styles.collegeCard}>
                <View style={styles.collegeCardHeader}>
                    <Ionicons name="business-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.collegeCardTitle}>From B.G.C College</Text>
                </View>
                <View style={styles.collegeStatsRow}>
                    <View style={styles.collegeStatItem}>
                        <Text style={styles.collegeStatNumber}>24</Text>
                        <Text style={styles.collegeStatLabel}>Books Listed</Text>
                    </View>
                    <View style={styles.collegeStatDivider} />
                    <View style={styles.collegeStatItem}>
                        <Text style={styles.collegeStatNumber}>12</Text>
                        <Text style={styles.collegeStatLabel}>Books Sold</Text>
                    </View>
                </View>
            </View>

            <View style={styles.ratingsCard}>
                <View style={styles.ratingsHeaderRow}>
                    <View>
                        <View style={styles.collegeCardHeader}>
                            <Ionicons name="star" size={20} color={COLORS.primary} />
                            <Text style={styles.collegeCardTitle}>Ratings & Reviews</Text>
                        </View>
                        <View style={styles.ratingContainer}>
                            <View style={styles.ratingScoreRow}>
                                <Text style={styles.ratingScore}>4.8</Text>
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Ionicons key={i} name="star" size={14} color="#FFC107" />
                                    ))}
                                </View>
                                <Text style={styles.reviewCount}>(36 reviews)</Text>
                            </View>
                            <View style={styles.quotesContainer}>
                                <Text style={styles.quoteText}>"Quick response and genuine seller"</Text>
                                <Text style={styles.quoteText}>"Book condition exactly as described"</Text>
                                <Text style={styles.quoteText}>"Fast WhatsApp communication"</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />
            <Header
                title="Profile"
                backButton
                rightElement={
                    <TouchableOpacity>
                        <Menu
                            visible={menuVisible}
                            onDismiss={closeMenu}
                            anchor={
                                <TouchableOpacity
                                    style={styles.iconCircle}
                                    onPress={openMenu}
                                >
                                    <Feather
                                        name="more-vertical"
                                        size={20}
                                        color={COLORS.text}
                                    />
                                </TouchableOpacity>
                            }
                            contentStyle={styles.menu}
                        >
                            <Menu.Item
                                leadingIcon="share-variant-outline"
                                onPress={() => {
                                    closeMenu();
                                    // Share logic
                                }}
                                title="Share Profile"
                            />
                            <Divider />

                            <Menu.Item
                                leadingIcon="trash-can-outline"
                                onPress={() => {
                                    deleteAccount();
                                }}
                                title="Delete"
                            />
                        </Menu>
                    </TouchableOpacity>
                }
            />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {renderProfileHeader()}
                {renderStats()}
                {renderActions()}
                {renderAbout()}

                {/* Replace this two comp */}
                <HorizontalBookList
                    title="Active Books (24)"
                    books={ACTIVE_BOOKS as any}
                    cardLayout="standard"
                />

                <HorizontalBookList
                    title="Recently Sold"
                    books={SOLD_BOOKS as any}
                    cardLayout="horizontal"
                />

                {renderInfoCards()}
            </ScrollView>
        </View>
    );
};

export default PublicProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    menu: {
        borderRadius: 14,
        backgroundColor: COLORS.white,
        elevation: 5,
    },
    ratingContainer: {
        flex: 1,
        flexDirection: 'row',
        gap: rf(10),
    },
    scrollContent: {
        paddingTop: SPACING.md,
    },
    profileHeaderContainer: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    profileMainRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.grayLight,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.grayHeavvy,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    profileInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
        flexWrap: 'wrap',
    },
    nameText: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD54F', // Yellow badge background
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 2,
    },
    badgeText: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 6,
    },
    infoIcon: {
        width: 16,
        textAlign: 'center',
    },
    infoText: {
        fontSize: rf(11.5),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        flexShrink: 1,
    },
    trustedCard: {
        backgroundColor: COLORS.grayLight,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: COLORS.grayHeavvy,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        alignItems: 'center'
    },
    trustedIconRow: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
    },
    trustedTitle: {
        fontSize: rf(9),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.primary,
        lineHeight: 14,
    },
    trustedSub: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: SPACING.lg,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
        textAlign: 'center',
    },
    statSub: {
        fontSize: rf(9.5),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: COLORS.grayHeavvy,
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    actionBtnWhatsApp: {
        flex: 1.2,
        backgroundColor: COLORS.primary,
        height: 40,
    },
    actionBtnOutline: {
        flex: 1,
        backgroundColor: 'transparent',
        borderColor: COLORS.primary,
        borderWidth: 1,
        height: 40,
    },
    actionBtnTextWhite: {
        fontSize: rf(12),
        color: COLORS.white,
    },
    actionBtnTextPrimary: {
        fontSize: rf(12),
        color: COLORS.primary,
    },
    aboutContainer: {
        marginHorizontal: SPACING.lg,
        backgroundColor: COLORS.grayLight,
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    aboutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    aboutTitle: {
        fontSize: rf(13),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
    },
    aboutText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        lineHeight: 18,
    },
    infoCardsContainer: {
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.md,
        gap: SPACING.md,
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    collegeCard: {
        flex: 0.8,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        padding: SPACING.md,
    },
    collegeCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        gap: 8,
    },
    collegeCardTitle: {
        fontSize: rf(12),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
        flex: 1,
    },
    collegeStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    collegeStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    collegeStatNumber: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
        marginBottom: 2,
    },
    collegeStatLabel: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    collegeStatDivider: {
        width: 1,
        height: 25,
        backgroundColor: COLORS.grayHeavvy,
    },
    ratingsCard: {
        flex: 1.2,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        padding: SPACING.md,
    },
    ratingsHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
    },
    ratingScoreRow: {
        alignItems: 'center',
        marginTop: SPACING.xs,
    },
    ratingScore: {
        fontSize: rf(26),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
        marginVertical: 4,
    },
    reviewCount: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
    },
    quotesContainer: {
        marginLeft: SPACING.md,
        gap: 6,
        justifyContent: 'center',
    },
    quoteText: {
        fontSize: rf(9.5),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        fontStyle: 'italic',
    },
    bottomCTA: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.grayHeavvy,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    contactBtn: {
        height: rf(48),
        backgroundColor: COLORS.primary,
    }
});

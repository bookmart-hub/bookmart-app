import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
    { id: 'listings', title: 'My Listings', icon: 'book-outline', color: COLORS.blue, bg: COLORS.blueLight },
    { id: 'sold', title: 'Sold Books', icon: 'cube-outline', color: COLORS.green, bg: COLORS.greenlight },
    { id: 'interests', title: 'My Interests', icon: 'heart-outline', color: COLORS.red, bg: COLORS.redLight },
    { id: 'requests', title: 'Request Posts', icon: 'chatbox-ellipses-outline', color: COLORS.yellow, bg: COLORS.yellowlight },
];

const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const handleQuickAction = (id: string) => {
        if (id === 'requests') {
            navigation.navigate('AppStack', { screen: 'RequestPost' });
        }
    };

    return (
        <View style={styles.container}>
            {/* Header Section (Gradient Background) */}
            <View
                style={[styles.headerContainer, { paddingTop: insets.top + SPACING.md }]}
            >
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.iconCircle}>
                            <Ionicons name="share-social-outline" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconCircle}>
                            <Feather name="edit-2" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Info */}
                <View style={styles.profileInfoRow}>
                    <View style={styles.avatarPlaceholder} />
                    <View style={styles.profileDetails}>
                        <View style={styles.nameRow}>
                            <Text style={styles.profileName}>Amit Roy</Text>
                            <View style={styles.topSellerBadge}>
                                <Ionicons name="shield-checkmark" size={12} color={COLORS.black} />
                                <Text style={styles.topSellerText}>Top Seller</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="school-outline" size={14} color={COLORS.white} />
                            <Text style={styles.infoText}>B.G.C college, B.sc, Computer science</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={14} color={COLORS.white} />
                            <Text style={styles.infoText}>Kolkata, india</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Block */}
                <View style={styles.statsBlock}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>1.2K</Text>
                        <Text style={styles.statLabel}>Profile Views</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>348</Text>
                        <Text style={styles.statLabel}>WhatsApp Contacts</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>24</Text>
                        <Text style={styles.statLabel}>Active Listings</Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Quick Actions */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        {QUICK_ACTIONS.map((action) => (
                            <TouchableOpacity 
                                key={action.id} 
                                style={styles.quickActionCard} 
                                activeOpacity={0.8}
                                onPress={() => handleQuickAction(action.id)}
                            >
                                <View style={[styles.actionIconWrapper, { backgroundColor: action.bg }]}>
                                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                                </View>
                                <Text style={styles.quickActionText}>{action.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Seller Tools */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Seller Tools</Text>

                    <TouchableOpacity style={styles.toolCard} activeOpacity={0.8}>
                        <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(0, 128, 128, 0.1)' }]}>
                            <Ionicons name="list" size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.toolContent}>
                            <Text style={styles.toolTitle}>Manage Listings</Text>
                            <Text style={styles.toolSubtitle}>Edit, delete or update your active books</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.toolCard} activeOpacity={0.8}>
                        <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                            <Ionicons name="rocket-outline" size={24} color="#F59E0B" />
                        </View>
                        <View style={styles.toolContent}>
                            <Text style={styles.toolTitle}>Boost Listing</Text>
                            <Text style={styles.toolSubtitle}>Increase visibility and get more buyers</Text>
                        </View>
                        <View style={styles.proBadge}>
                            <Text style={styles.proBadgeText}>PRO</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Recent Activities */}
                <View style={styles.sectionContainer}>
                    <View style={styles.recentHeader}>
                        <Text style={styles.sectionTitle}>Recent Activities</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.activityCard}>
                        <View style={[styles.activityIconWrap, { backgroundColor: 'rgba(0, 128, 128, 0.1)' }]}>
                            <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.activityContent}>
                            <Text style={styles.activityTitle}>Physics Vol.2 viewed 12 times today</Text>
                            <Text style={styles.activityTime}>2 hours ago</Text>
                        </View>
                    </View>

                    <View style={styles.activityCard}>
                        <View style={[styles.activityIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                            <Ionicons name="chatbubble-outline" size={20} color="#F59E0B" />
                        </View>
                        <View style={styles.activityContent}>
                            <Text style={styles.activityTitle}>2 new WhatsApp inquiries received</Text>
                            <Text style={styles.activityTime}>2 days ago</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </View >
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerContainer: {
        paddingBottom: SPACING.lg,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        backgroundColor: COLORS.primary,
        elevation: 4
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    headerTitle: {
        fontSize: rf(20),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.white,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.white,
        marginRight: SPACING.md,
    },
    profileDetails: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    profileName: {
        fontSize: rf(20),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.white,
        marginRight: 8,
    },
    topSellerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        gap: 2,
    },
    topSellerText: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 6,
    },
    infoText: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: 'rgba(255, 255, 255, 0.8)',
        flexShrink: 1,
    },
    statsBlock: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.15)', // Darker teal effect
        marginHorizontal: SPACING.lg,
        borderRadius: 16,
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    statValue: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.white,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.regular,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    scrollContent: {
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    sectionContainer: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: rf(15),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        justifyContent: 'flex-start',
    },
    quickActionCard: {
        width: (width - SPACING.lg * 2 - SPACING.sm * 3) / 4, // 4 items per row exactly
        backgroundColor: COLORS.white,
        borderRadius: 16,
        paddingVertical: SPACING.sm,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: SPACING.xs,
    },
    actionIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    quickActionText: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
        textAlign: 'center',
    },
    toolCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    toolIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    toolContent: {
        flex: 1,
    },
    toolTitle: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
        marginBottom: 2,
    },
    toolSubtitle: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    proBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    proBadgeText: {
        fontSize: rf(10),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    seeAllText: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    activityIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
        marginBottom: 4,
    },
    activityTime: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
});
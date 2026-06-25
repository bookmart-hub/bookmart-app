import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Dimensions, Keyboard, ToastAndroid } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import Header from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const LISTING_CATEGORIES = [
    {
        id: 'scam',
        title: 'Scam / Fraud',
        subtitle: 'Deceptive or fraudulent activity',
        icon: 'alert-outline',
        color: COLORS.yellow,
        bg: COLORS.yellowlight
    },
    {
        id: 'fake',
        title: 'Fake Listing',
        subtitle: 'Listing doesn\'t exist or is misrepresented',
        icon: 'alert-circle-outline',
        color: COLORS.blue,
        bg: COLORS.blueLight
    },
    {
        id: 'inappropriate',
        title: 'Inappropriate',
        subtitle: 'Offensive or harmful content',
        icon: 'ban-outline',
        color: COLORS.red,
        bg: COLORS.redLight
    },
    {
        id: 'spam',
        title: 'Spam',
        subtitle: 'Unsolicited or repetitive content',
        icon: 'chatbubble-ellipses-outline',
        color: COLORS.purple,
        bg: COLORS.purplelight
    },
    {
        id: 'wrong-category',
        title: 'Wrong Category',
        subtitle: 'Listed in the incorrect category',
        icon: 'layers-outline',
        color: COLORS.green,
        bg: COLORS.greenlight
    },
    {
        id: 'others',
        title: 'Others',
        subtitle: 'Other issues',
        icon: 'ellipsis-horizontal-outline',
        color: COLORS.grayHeavvy,
        bg: COLORS.grayLight
    }
];

const USER_REASONS = [
    {
        id: 'harassment',
        title: 'Harassment',
        subtitle: 'Threats or unwanted contact',
        icon: 'shield-outline',
        color: COLORS.red,
        bg: COLORS.redLight
    },
    {
        id: 'fake_account',
        title: 'Fake Account',
        subtitle: 'Impersonation or false identity',
        icon: 'person-remove-outline',
        color: COLORS.blue,
        bg: COLORS.blueLight
    },
    {
        id: 'spam_user',
        title: 'Spam Activity',
        subtitle: 'Posting excessive messages',
        icon: 'chatbubble-ellipses-outline',
        color: COLORS.purple,
        bg: COLORS.purplelight
    },
    {
        id: 'abuse',
        title: 'Abuse',
        subtitle: 'Inappropriate profile or posts',
        icon: 'alert-circle-outline',
        color: COLORS.yellow,
        bg: COLORS.yellowlight
    },
];

const REASON_OPTIONS = [
    'Information is inaccurate',
    'Images are misleading',
    'Price is suspiciously low',
    'Seller requested payment outside app',
    'Other'
];

export default function ReportScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const initialTab = route.params?.initialTab || 'Listing';
    const [activeTab, setActiveTab] = useState<'Listing' | 'User'>(initialTab);

    // Listing Flow State
    const [listingStep, setListingStep] = useState(1);
    const [listingCategory, setListingCategory] = useState<string | null>(null);
    const [listingReason, setListingReason] = useState<string | null>(null);
    const [listingDetails, setListingDetails] = useState('');

    // User Flow State
    const [userStep, setUserStep] = useState(1);
    const [userReason, setUserReason] = useState<string | null>(null);
    const [userDetails, setUserDetails] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            ToastAndroid.show('Report Submitted', ToastAndroid.SHORT);
            navigation.goBack();
        }, 1500);
    };

    const handleNext = () => {
        if (activeTab === 'Listing') {
            if (listingStep === 1 && !listingCategory) {
                ToastAndroid.show('Please select a category.', ToastAndroid.SHORT);
                return;
            }
            if (listingStep === 2 && !listingReason) {
                ToastAndroid.show('Please select a reason.', ToastAndroid.SHORT);
                return;
            }
            if (listingStep < 3) {
                setListingStep(prev => prev + 1);
            } else {
                handleSubmit();
            }
        } else {
            if (userStep === 1 && !userReason) {
                ToastAndroid.show('Please select a reason.', ToastAndroid.SHORT);
                return;
            }
            if (userStep < 2) {
                setUserStep(prev => prev + 1);
            } else {
                handleSubmit();
            }
        }
    };

    const handleBack = () => {
        if (activeTab === 'Listing') {
            if (listingStep > 1) {
                setListingStep(prev => prev - 1);
            } else {
                navigation.goBack();
            }
        } else {
            if (userStep > 1) {
                setUserStep(prev => prev - 1);
            } else {
                navigation.goBack();
            }
        }
    };

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'Listing' && styles.activeTab]}
                onPress={() => {
                    setActiveTab('Listing');
                    setListingStep(1);
                }}
            >
                <Ionicons name="home-outline" size={18} color={activeTab === 'Listing' ? COLORS.white : COLORS.textMuted} />
                <Text style={[styles.tabText, activeTab === 'Listing' && styles.activeTabText]}>Listing</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'User' && styles.activeTab]}
                onPress={() => {
                    setActiveTab('User');
                    setUserStep(1);
                }}
            >
                <Ionicons name="person-outline" size={18} color={activeTab === 'User' ? COLORS.white : COLORS.textMuted} />
                <Text style={[styles.tabText, activeTab === 'User' && styles.activeTabText]}>User</Text>
            </TouchableOpacity>
        </View>
    );

    const renderWarning = () => (
        <View style={styles.warningContainer}>
            <Ionicons name="warning-outline" size={20} color={COLORS.yellow} />
            <Text style={styles.warningText}>
                <Text style={styles.warningBold}>False reports</Text> violate our Community Guidelines and may result in account suspension. Only report genuine violations.
            </Text>
        </View>
    );

    const renderItemCard = () => {
        if (activeTab === 'Listing') {
            return (
                <View style={styles.itemCard}>
                    <Image
                        source={{ uri: 'https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg' }}
                        style={styles.itemImage}
                        contentFit="cover"
                    />
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle} numberOfLines={1}>Atomic Habits by James Clear</Text>
                        <Text style={styles.itemSubtitle} numberOfLines={1}>Listed by BookNook Store</Text>
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>LST-8821</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.changeBtn}>
                        <Ionicons name="refresh-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.changeBtnText}>Change</Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View style={styles.itemCard}>
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?u=amitroy' }}
                        style={[styles.itemImage, { borderRadius: 30 }]}
                        contentFit="cover"
                    />
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle} numberOfLines={1}>Amit Roy</Text>
                        <Text style={styles.itemSubtitle} numberOfLines={1}>@amitroy_99</Text>
                    </View>
                </View>
            );
        }
    };

    const renderStepper = () => {
        const totalSteps = activeTab === 'Listing' ? 3 : 2;
        const currentStep = activeTab === 'Listing' ? listingStep : userStep;
        const stepLabelsListing = ['CATEGORY', 'REASON', 'DETAILS'];
        const stepLabelsUser = ['REASON', 'DETAILS'];
        const labels = activeTab === 'Listing' ? stepLabelsListing : stepLabelsUser;

        return (
            <View style={styles.stepperContainer}>
                {labels.map((label, index) => {
                    const stepNum = index + 1;
                    const isActive = stepNum === currentStep;
                    const isCompleted = stepNum < currentStep;

                    return (
                        <View key={label} style={styles.stepWrapper}>
                            <View style={styles.stepIndicator}>
                                <View style={[styles.stepCircle, isActive && styles.stepCircleActive, isCompleted && styles.stepCircleCompleted]}>
                                    <Text style={[styles.stepNumber, (isActive || isCompleted) && styles.stepNumberActive]}>{stepNum}</Text>
                                </View>
                                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{label}</Text>
                            </View>
                            {index < labels.length - 1 && (
                                <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderListingStep1 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepHeader}>1 — SELECT CATEGORY</Text>
            <View style={styles.gridContainer}>
                {LISTING_CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[styles.gridCard, listingCategory === cat.id && styles.gridCardSelected]}
                        onPress={() => setListingCategory(cat.id)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconWrapper, { backgroundColor: cat.bg }]}>
                            <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                        </View>
                        <Text style={styles.gridCardTitle}>{cat.title}</Text>
                        <Text style={styles.gridCardSubtitle}>{cat.subtitle}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderListingStep2 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepHeader}>2 — SELECT REASON</Text>
            <View style={styles.radioGroup}>
                {REASON_OPTIONS.map(reason => (
                    <TouchableOpacity
                        key={reason}
                        style={styles.radioOption}
                        onPress={() => setListingReason(reason)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.radioCircle, listingReason === reason && styles.radioCircleSelected]}>
                            {listingReason === reason && <View style={styles.radioInnerCircle} />}
                        </View>
                        <Text style={styles.radioText}>{reason}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderDetailsStep = (tab: 'Listing' | 'User') => (
        <View style={styles.stepContent}>
            <Text style={styles.stepHeader}>{tab === 'Listing' ? '3' : '2'} — PROVIDE DETAILS</Text>
            <Input
                placeholder="Please describe the issue in detail..."
                multiline
                numberOfLines={6}
                value={tab === 'Listing' ? listingDetails : userDetails}
                onChangeText={tab === 'Listing' ? setListingDetails : setUserDetails}
                containerStyle={{ marginTop: SPACING.md }}
                style={{ height: 120, textAlignVertical: 'top', paddingTop: SPACING.sm }}
            />
        </View>
    );

    const renderUserStep1 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepHeader}>1 — SELECT REASON</Text>
            <View style={styles.gridContainer}>
                {USER_REASONS.map(reason => (
                    <TouchableOpacity
                        key={reason.id}
                        style={[styles.gridCard, userReason === reason.id && styles.gridCardSelected]}
                        onPress={() => setUserReason(reason.id)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconWrapper, { backgroundColor: reason.bg }]}>
                            <Ionicons name={reason.icon as any} size={24} color={reason.color} />
                        </View>
                        <Text style={styles.gridCardTitle}>{reason.title}</Text>
                        <Text style={styles.gridCardSubtitle}>{reason.subtitle}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />
            <Header title="Report" backButton />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {renderWarning()}
                    {renderTabs()}
                    {renderItemCard()}
                    {renderStepper()}

                    {activeTab === 'Listing' && (
                        <>
                            {listingStep === 1 && renderListingStep1()}
                            {listingStep === 2 && renderListingStep2()}
                            {listingStep === 3 && renderDetailsStep('Listing')}
                        </>
                    )}

                    {activeTab === 'User' && (
                        <>
                            {userStep === 1 && renderUserStep1()}
                            {userStep === 2 && renderDetailsStep('User')}
                        </>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.lg }]}>
                {(activeTab === 'Listing' ? listingStep : userStep) === (activeTab === 'Listing' ? 3 : 2) ? (
                    <Button
                        title="Submit Report"
                        onPress={handleNext}
                        loading={isSubmitting}
                        style={{ backgroundColor: COLORS.red }}
                    />
                ) : (
                    <Button
                        title="Next"
                        onPress={handleNext}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 100,
    },
    warningContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.yellowlight, // Light amber background
        padding: SPACING.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.yellow,
        marginTop: SPACING.md,
        alignItems: 'flex-start',
    },
    warningText: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: '#92400E', // Dark amber text
        lineHeight: 18,
    },
    warningBold: {
        fontFamily: FONTS.manrope.bold,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.grayHeavvy,
        borderRadius: 12,
        padding: 4,
        marginTop: SPACING.lg,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
    },
    tabText: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.textMuted,
    },
    activeTabText: {
        color: COLORS.white,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 16,
        marginTop: SPACING.lg,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: SPACING.md,
    },
    itemInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: 2,
    },
    itemSubtitle: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    badgeContainer: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
    changeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    changeBtnText: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.textMuted,
    },
    stepperContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginTop: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepIndicator: {
        alignItems: 'center',
        width: 60,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.grayLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    stepCircleActive: {
        backgroundColor: COLORS.primary,
    },
    stepCircleCompleted: {
        backgroundColor: COLORS.primary,
    },
    stepNumber: {
        fontSize: rf(12),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.textMuted,
    },
    stepNumberActive: {
        color: COLORS.white,
    },
    stepLabel: {
        fontSize: rf(9),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.textMuted,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    stepLabelActive: {
        color: COLORS.primary,
    },
    stepLine: {
        width: 50,
        height: 2,
        backgroundColor: COLORS.grayLight,
        marginTop: 15, // Align with center of circles
        marginHorizontal: 4,
    },
    stepLineCompleted: {
        backgroundColor: COLORS.primary,
    },
    stepContent: {
        marginTop: SPACING.md,
    },
    stepHeader: {
        fontSize: rf(12),
        fontFamily: FONTS.montserrat.bold,
        color: '#6B7280', // grayish blue text
        marginBottom: SPACING.md,
        letterSpacing: 0.5,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        justifyContent: 'space-between',
    },
    gridCard: {
        width: (width - SPACING.lg * 2 - SPACING.sm) / 2, // 2 items per row
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
    },
    gridCardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.secondary,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    gridCardTitle: {
        fontSize: rf(13),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: 4,
    },
    gridCardSubtitle: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    radioGroup: {
        gap: SPACING.sm,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.textMuted,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    radioCircleSelected: {
        borderColor: COLORS.primary,
    },
    radioInnerCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    radioText: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderColor: COLORS.grayHeavvy + '40',
    },
});

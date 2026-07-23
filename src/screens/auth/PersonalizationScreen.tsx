import React, { useState, useMemo, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ToastAndroid,
    FlatList
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Ellipse, Rect, Path, Polygon, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rem } from '@/utils/responsive';
import { Button } from '@/components/ui/Button';

import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getColleges, submitOnboarding, College } from '@/types/core';

// ── SVG Header Illustration ──────────────────────────────────────────────────
const OnboardingHeroIllustration = () => (
    <Svg width={rem(8.125)} height={rem(6.5625)} viewBox="0 0 180 140">
        {/* Soft shadow/backdrop circle */}
        <Ellipse cx="90" cy="115" rx="80" ry="22" fill="#EBF6F6" />

        {/* Standing Green Book (Bookmart representation) */}
        <Rect x="88" y="20" width="56" height="85" rx="4" fill="#005B5B" />
        {/* Book spine lines/details */}
        <Rect x="88" y="20" width="6" height="85" fill="#004747" />
        {/* Logo 'B' on standing book */}
        <SvgText
            x="118"
            y="72"
            fontSize="32"
            fontFamily="Montserrat-Bold"
            fill="#FFFFFF"
            textAnchor="middle"
        >
            B
        </SvgText>

        {/* Stack of Flat Books on Left */}
        {/* Bottom book (Green cover, yellow/beige pages) */}
        <Rect x="35" y="93" width="90" height="11" rx="2" fill="#008080" />
        <Rect x="37" y="95" width="87" height="6" fill="#FFFFF0" />

        {/* Middle book (Beige cover, white pages) */}
        <Rect x="38" y="83" width="88" height="11" rx="2" fill="#E2E8F0" />
        <Rect x="38" y="85" width="86" height="6" fill="#FFFFFF" />

        {/* Top book (Yellow cover, beige pages) */}
        <Rect x="42" y="73" width="82" height="11" rx="2" fill="#F5C518" />
        <Rect x="42" y="75" width="80" height="6" fill="#FFFDF0" />

        {/* Terracotta Potted Plant on the Right */}
        <Polygon points="128,94 138,94 135,108 131,108" fill="#D27D2D" />
        {/* Leaves */}
        <Path d="M133,94 C129,82 124,85 126,76 C128,76 131,82 133,94 Z" fill="#2E7D32" />
        <Path d="M133,94 C137,82 142,85 140,76 C138,76 135,82 133,94 Z" fill="#4CAF50" />
        <Path d="M133,94 C133,83 135,81 133,72 C131,81 131,83 133,94 Z" fill="#81C784" />

        {/* Yellow Mug on Right */}
        <Rect x="146" y="92" width="20" height="20" rx="3" fill="#F5A623" />
        <Path d="M166,96 C170,96 170,108 166,108" stroke="#F5A623" strokeWidth="2.5" fill="none" />
    </Svg>
);

// ── Roles Mock Data ──────────────────────────────────────────────────────────
interface RoleItem {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    iconType: 'Ionicons' | 'MaterialCommunityIcons';
    color: string;
    lightColor: string;
}

const ROLES: RoleItem[] = [
    {
        id: 'student',
        title: "I'm a Student",
        subtitle: "Currently studying",
        icon: "school-outline",
        iconType: "Ionicons",
        color: COLORS.primary,
        lightColor: COLORS.secondary,
    },
    {
        id: 'teacher',
        title: "I'm a Teacher",
        subtitle: "Educator / Faculty",
        icon: "presentation",
        iconType: "MaterialCommunityIcons",
        color: COLORS.yellow,
        lightColor: COLORS.yellowlight,
    },
    {
        id: 'professional',
        title: "Working Professional",
        subtitle: "Not a student",
        icon: "briefcase-outline",
        iconType: "Ionicons",
        color: COLORS.blue,
        lightColor: COLORS.blueLight,
    },
    {
        id: 'lover',
        title: "Book Lover",
        subtitle: "Love reading books",
        icon: "book-outline",
        iconType: "Ionicons",
        color: COLORS.green,
        lightColor: COLORS.greenlight,
    }
];

// ── Book Interests Mock Data ─────────────────────────────────────────────────
interface InterestItem {
    id: string;
    label: string;
    icon: string;
    iconType: 'Ionicons' | 'MaterialCommunityIcons';
}

const BOOK_INTERESTS: InterestItem[] = [
    { id: 'academic', label: 'Academic / Textbooks', icon: 'library-outline', iconType: 'Ionicons' },
    { id: 'competitive', label: 'Competitive Exams', icon: 'bullseye-arrow', iconType: 'MaterialCommunityIcons' },
    { id: 'fiction', label: 'Fiction', icon: 'book-outline', iconType: 'Ionicons' },
    { id: 'self_help', label: 'Self Help', icon: 'leaf-outline', iconType: 'Ionicons' },
    { id: 'business', label: 'Business & Finance', icon: 'stats-chart-outline', iconType: 'Ionicons' },
    { id: 'comics', label: 'Comics / Manga', icon: 'chatbubble-ellipses-outline', iconType: 'Ionicons' },
    { id: 'non_fiction', label: 'Non-Fiction', icon: 'person-outline', iconType: 'Ionicons' },
    { id: 'technology', label: 'Technology', icon: 'desktop-outline', iconType: 'Ionicons' },
    { id: 'other', label: 'Other', icon: 'grid-outline', iconType: 'Ionicons' },
];

export default function PersonalizationScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [collegeQuery, setCollegeQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
    const [collegeDropdownVisible, setCollegeDropdownVisible] = useState(false);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [collegeError, setCollegeError] = useState<string | null>(null);
    const [roleError, setRoleError] = useState<string | null>(null);

    // Debounce the college search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(collegeQuery);
        }, 200);
        return () => clearTimeout(handler);
    }, [collegeQuery]);

    // Fetch colleges based on debounced search query
    const { data: filteredColleges = [], isFetching: isCollegesLoading } = useQuery({
        queryKey: ['colleges', debouncedQuery],
        queryFn: () => getColleges(debouncedQuery),
        enabled: debouncedQuery.length > 0,
    });

    // Check if college field is required based on role
    const isCollegeRequired = selectedRole === 'student' || selectedRole === 'teacher';

    const handleRoleSelect = (roleId: string) => {
        setSelectedRole(roleId);
        setRoleError(null);
        // Clear college input if changing to a role where it is hidden/not required
        if (roleId !== 'student' && roleId !== 'teacher') {
            setCollegeQuery('');
            setSelectedCollege(null);
            setCollegeError(null);
        }
    };

    const handleInterestToggle = (id: string) => {
        setSelectedInterests((prev) => {
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleCollegeSearch = (text: string) => {
        setCollegeQuery(text);
        setSelectedCollege(null);
        setCollegeDropdownVisible(true);
        if (isCollegeRequired && !text.trim()) {
            setCollegeError('Please search and select your college/university.');
        } else {
            setCollegeError(null);
        }
    };

    const handleCollegeSelect = (college: College) => {
        setSelectedCollege(college);
        setCollegeQuery(college.name);
        setCollegeDropdownVisible(false);
        setCollegeError(null);
    };


    const onboardingMutation = useMutation({
        mutationFn: submitOnboarding,
        onSuccess: async () => {
            ToastAndroid.show('Personalization saved!', ToastAndroid.SHORT);

            // Mark user as fully onboarded/logged in
            await AsyncStorage.setItem('@bookmart:is_logged_in', 'true');

            navigation.reset({
                index: 0,
                routes: [{ name: 'Tab' }],
            });
        },
        onError: (error: any) => {
            const message = error?.response?.data?.detail || 'Failed to save preferences.';
            if (Platform.OS === 'android') {
                ToastAndroid.show(message, ToastAndroid.LONG);
            } else {
                Alert.alert('Error', message);
            }
        }
    });

    const handleContinue = () => {
        let hasError = false;

        // 1. Role Selection check
        if (!selectedRole) {
            setRoleError('Please select who you are.');
            hasError = true;
        }

        // 2. College Selection check (mandatory for student/teacher)
        // if (isCollegeRequired && !selectedCollege) {
        //     setCollegeError('Please search and select your college/university.');
        //     hasError = true;
        // }

        if (hasError) {
            if (Platform.OS === 'android') {
                ToastAndroid.show('Please complete all required fields.', ToastAndroid.SHORT);
            } else {
                Alert.alert('Required Fields', 'Please complete all required fields.');
            }
            return;
        }

        // Format payload
        const payload = {
            user_role: selectedRole?.toUpperCase() || '',
            college_id: isCollegeRequired ? selectedCollege?.id || null : null,
            book_preferences: selectedInterests.length > 0 ? selectedInterests[0].toUpperCase() : 'OTHER'
        };

        onboardingMutation.mutate(payload);
    };

    const renderRoleIcon = (role: RoleItem) => {
        if (role.iconType === 'MaterialCommunityIcons') {
            return (
                <MaterialCommunityIcons
                    name={role.icon as any}
                    size={rem(1.625)}
                    color={selectedRole === role.id ? COLORS.white : role.color}
                />
            );
        }
        return (
            <Ionicons
                name={role.icon as any}
                size={rem(1.5)}
                color={selectedRole === role.id ? COLORS.white : role.color}
            />
        );
    };

    const renderInterestIcon = (interest: InterestItem, isSelected: boolean) => {
        const color = isSelected ? COLORS.primary : COLORS.text;
        if (interest.iconType === 'MaterialCommunityIcons') {
            return <MaterialCommunityIcons name={interest.icon as any} size={rem(1.25)} color={color} />;
        }
        return <Ionicons name={interest.icon as any} size={rem(1.125)} color={color} />;
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={['bottom', 'left', 'right']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Welcoming Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={styles.heroTextContainer}>
                            <Text style={styles.heroTitle}>Let's personalize</Text>
                            <Text style={[styles.heroTitle, styles.heroTitleHighlight]}>Bookmart for you</Text>
                            <Text style={styles.heroSubtitle}>
                                This helps us show you the most relevant books and offers.
                            </Text>
                        </View>
                        <View style={styles.heroImgContainer}>
                            <OnboardingHeroIllustration />
                        </View>
                    </View>

                    {/* Who are you Section */}
                    <View style={styles.cardContainer}>
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.circleHeaderIcon}>
                                <Ionicons name="school" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.cardHeaderTextCol}>
                                <Text style={styles.cardHeaderTitle}>Who are you?</Text>
                                <Text style={styles.cardHeaderSubtitle}>
                                    This helps us recommend relevant books and resources.
                                </Text>
                            </View>
                        </View>

                        {roleError && <Text style={styles.validationErrorText}>{roleError}</Text>}

                        {/* Roles Grid */}
                        <View style={styles.rolesGrid}>
                            {ROLES.map((role) => {
                                const isSelected = selectedRole === role.id;
                                return (
                                    <TouchableOpacity
                                        key={role.id}
                                        activeOpacity={0.8}
                                        onPress={() => handleRoleSelect(role.id)}
                                        style={[
                                            styles.roleCard,
                                            isSelected
                                                ? { borderColor: COLORS.primary, backgroundColor: COLORS.secondary }
                                                : { borderColor: 'rgba(0,0,0,0.06)', backgroundColor: COLORS.white },
                                        ]}
                                    >
                                        <View style={styles.roleCardHeader}>
                                            <View
                                                style={[
                                                    styles.roleIconWrap,
                                                    { backgroundColor: isSelected ? COLORS.primary : role.lightColor },
                                                ]}
                                            >
                                                {renderRoleIcon(role)}
                                            </View>
                                            {isSelected && (
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={18}
                                                    color={COLORS.primary}
                                                    style={styles.roleCheck}
                                                />
                                            )}
                                        </View>
                                        <Text style={styles.roleCardTitle}>{role.title}</Text>
                                        <Text style={styles.roleCardSubtitle} numberOfLines={1}>
                                            {role.subtitle}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Search college university building search field */}
                        {false && (
                        <View style={styles.collegeSearchBox}>
                            <Text style={styles.fieldLabel}>
                                College / University {isCollegeRequired && <Text style={styles.asterisk}>*</Text>}
                            </Text>
                            <View
                                style={[
                                    styles.searchBarContainer,
                                    collegeDropdownVisible && styles.searchBarFocused,
                                    !!collegeError && styles.searchBarError,
                                ]}
                            >
                                <FontAwesome5 name="university" size={16} color={COLORS.primary} style={styles.searchLeftIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder={
                                        isCollegeRequired
                                            ? "Search your college / university"
                                            : "Search your college / university"
                                    }
                                    placeholderTextColor={COLORS.textMuted}
                                    value={collegeQuery}
                                    onChangeText={handleCollegeSearch}
                                    onFocus={() => setCollegeDropdownVisible(true)}
                                    autoCapitalize="words"
                                />
                                <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchRightIcon} />
                            </View>

                            {/* Dropdown search suggestions */}
                            {collegeDropdownVisible && filteredColleges.length > 0 && (
                                <View style={styles.dropdownContainer}>
                                    <ScrollView style={styles.dropdownList} keyboardShouldPersistTaps="handled">
                                        {filteredColleges.map((item: College) => (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={styles.dropdownItem}
                                                onPress={() => handleCollegeSelect(item)}
                                            >
                                                <Ionicons name="location-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                                                <Text style={styles.dropdownText} numberOfLines={1}>{item.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {collegeError && <Text style={styles.validationErrorText}>{collegeError}</Text>}
                            <Text style={styles.collegeHelpText}>
                                You can skip this if you're not a student or teacher.
                            </Text>
                        </View>
                        )}
                    </View>

                    {/* Book Interest Categories Section */}
                    <View style={styles.cardContainer}>
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.circleHeaderIcon}>
                                <Ionicons name="book" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.cardHeaderTextCol}>
                                <Text style={styles.cardHeaderTitle}>What types of books interest you?</Text>
                                <Text style={styles.cardHeaderSubtitle}>Choose all that apply</Text>
                            </View>
                        </View>

                        {/* Interests Grid */}
                        <View style={styles.interestsGrid}>
                            {BOOK_INTERESTS.map((interest) => {
                                const isSelected = selectedInterests.includes(interest.id);
                                return (
                                    <TouchableOpacity
                                        key={interest.id}
                                        activeOpacity={0.8}
                                        onPress={() => handleInterestToggle(interest.id)}
                                        style={[
                                            styles.interestCard,
                                            isSelected
                                                ? { borderColor: COLORS.primary, backgroundColor: COLORS.secondary }
                                                : { borderColor: 'rgba(0,0,0,0.06)', backgroundColor: COLORS.white },
                                        ]}
                                    >
                                        <View style={styles.interestLeft}>
                                            {renderInterestIcon(interest, isSelected)}
                                            <Text
                                                style={[
                                                    styles.interestLabel,
                                                    isSelected && { color: COLORS.primary, fontFamily: FONTS.manrope.bold },
                                                ]}
                                                numberOfLines={2}
                                            >
                                                {interest.label}
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                                            size={18}
                                            color={isSelected ? COLORS.primary : COLORS.textMuted}
                                            style={styles.interestCheck}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Tips card */}
                        <View style={styles.tipsBox}>
                            <Feather name="info" size={16} color={COLORS.yellow} style={{ marginRight: 8 }} />
                            <Text style={styles.tipsText}>
                                You can update these preferences anytime in <Text style={{ fontFamily: FONTS.manrope.bold }}>settings</Text>.
                            </Text>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Continue"
                            onPress={handleContinue}
                            loading={onboardingMutation.isPending}
                            icon={<Feather name="arrow-right" size={18} color={COLORS.white} />}
                        />
                    </View>

                    {/* Secure Footer */}
                    <View style={styles.footerContainer}>
                        <Feather name="lock" size={12} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                        <Text style={styles.footerText}>Your information is safe and secure</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    appBar: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
    },
    backBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.xl * 2,
    },

    // ── Hero Section ──
    heroSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: SPACING.sm,
    },
    heroTextContainer: {
        flex: 1.2,
        paddingRight: SPACING.xs,
    },
    heroTitle: {
        fontSize: rem(1.3125),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        lineHeight: rem(1.625),
    },
    heroTitleHighlight: {
        color: COLORS.primary,
    },
    heroSubtitle: {
        fontSize: rem(0.71875),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginTop: 6,
        lineHeight: 16,
    },
    heroImgContainer: {
        flex: 0.8,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },

    // ── Card Containers ──
    cardContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        padding: 16,
        marginBottom: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 6,
        elevation: 1,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    circleHeaderIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    cardHeaderTextCol: {
        flex: 1,
    },
    cardHeaderTitle: {
        fontSize: rem(0.90625),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
    },
    cardHeaderSubtitle: {
        fontSize: rem(0.65625),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginTop: 2,
    },

    // ── Role Selection Grid ──
    rolesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
    },
    roleCard: {
        width: '48.5%',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 4,
        justifyContent: 'center',
    },
    roleCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    roleIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleCheck: {
        alignSelf: 'flex-start',
    },
    roleCardTitle: {
        fontSize: rem(0.75),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: 2,
    },
    roleCardSubtitle: {
        fontSize: rem(0.59375),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
    },

    collegeSearchBox: {
        marginTop: 16,
        position: 'relative',
    },
    fieldLabel: {
        fontSize: rem(0.75),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.black,
        marginBottom: 6,
        paddingLeft: 4,
    },
    asterisk: {
        color: COLORS.red,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: COLORS.white,
    },
    searchBarFocused: {
        borderColor: COLORS.primary,
    },
    searchBarError: {
        borderColor: COLORS.red,
    },
    searchLeftIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        color: COLORS.black,
        fontSize: rem(0.75),
        fontFamily: FONTS.manrope.medium,
    },
    searchRightIcon: {
        marginLeft: 8,
    },
    collegeHelpText: {
        fontSize: rem(0.625),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
        marginTop: 6,
        paddingLeft: 4,
    },

    // ── Dropdown Suggestions ──
    dropdownContainer: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        borderRadius: 10,
        maxHeight: 150,
        marginTop: 4,
        zIndex: 10,
        elevation: 3,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownList: {
        paddingVertical: 4,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F0F0F0',
    },
    dropdownText: {
        fontSize: rem(0.71875),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
        flex: 1,
    },

    // ── Interests Multi-selection Grid ──
    interestsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 10,
    },
    interestCard: {
        width: '48.5%',
        height: 48,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    interestLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 4,
    },
    interestLabel: {
        fontSize: rem(0.65625),
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.black,
        marginLeft: 8,
        flexShrink: 1,
        lineHeight: 13,
    },
    interestCheck: {
        marginLeft: 2,
    },

    // ── Tips Box ──
    tipsBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.yellowlight,
        borderWidth: 1,
        borderColor: 'rgba(245, 197, 24, 0.18)',
        borderRadius: 10,
        padding: 10,
        marginTop: 6,
    },
    tipsText: {
        fontSize: rem(0.6875),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
        flex: 1,
    },

    // ── Action Area ──
    buttonContainer: {
        marginTop: 8,
        marginBottom: 8,
        alignItems: 'center',
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    footerText: {
        fontSize: rem(0.6875),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    validationErrorText: {
        fontSize: rem(0.6875),
        fontFamily: FONTS.manrope.semibold,
        color: COLORS.red,
        marginBottom: 10,
        paddingLeft: 4,
    },
});

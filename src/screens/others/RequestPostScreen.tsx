import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, ToastAndroid } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import Header from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const CONDITIONS = ['New', 'Like New', 'Good', 'Acceptable'];

const RequestPostScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [bookTitle, setBookTitle] = useState('');
    const [selectedCondition, setSelectedCondition] = useState('New');
    const [minPrice, setMinPrice] = useState('0');
    const [maxPrice, setMaxPrice] = useState('50');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePost = () => {
        setIsLoading(true);
        if (!bookTitle.trim() || !notes.trim() || !selectedCondition.trim() || !minPrice.trim() || !maxPrice.trim()) {
            ToastAndroid.show('Please fill in all the fields', ToastAndroid.SHORT);
            setIsLoading(false);
            return;
        } else {
            ToastAndroid.show('Request posted successfully', ToastAndroid.SHORT);
            setTimeout(() => {
                setIsLoading(false);
                navigation.navigate('Home' as never);
            }, 1000);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="Post a Requirement" backButton />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.headerTitles}>
                        <Text style={styles.mainTitle}>Tell us what you need</Text>
                        <Text style={styles.subTitle}>Fill in the details below and we'll help you find the right match.</Text>
                    </View>

                    {/* Book Details Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                                <Ionicons name="book-outline" size={20} color="#6366F1" />
                            </View>
                            <Text style={styles.cardTitle}>Book Details</Text>
                        </View>
                        <Text style={styles.inputLabel}>Book Title / Name</Text>
                        <Input
                            placeholder="e.g. The Great Gatsby"
                            value={bookTitle}
                            onChangeText={setBookTitle}
                            keyboardType="default"
                            containerStyle={{ marginVertical: 0 }}
                            prefix={
                                <View style={[styles.inputIcon, { marginRight: 8 }]}>
                                    <Ionicons name="search-outline" size={20} color={COLORS.primary} />
                                </View>
                            }
                        />
                    </View>

                    {/* Condition Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="star-outline" size={20} color="#F59E0B" />
                            </View>
                            <Text style={styles.cardTitle}>Condition</Text>
                        </View>
                        <Text style={styles.inputLabelMuted}>What condition are you looking for?</Text>
                        <View style={styles.chipRow}>
                            {CONDITIONS.map((cond) => {
                                const isActive = selectedCondition === cond;
                                return (
                                    <TouchableOpacity
                                        key={cond}
                                        style={[styles.chip, isActive && styles.chipActive]}
                                        onPress={() => setSelectedCondition(cond)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{cond}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Price Range Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons name="pricetag-outline" size={20} color="#10B981" />
                            </View>
                            <Text style={styles.cardTitle}>Price Range</Text>
                        </View>
                        <Text style={styles.inputLabelMuted}>Set your maximum budget</Text>

                        <View style={styles.priceRow}>
                            <View style={styles.priceInputContainer}>
                                <Text style={styles.priceLabel}>Min(₹)</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    keyboardType="numeric"
                                    value={minPrice}
                                    onChangeText={setMinPrice}
                                />
                            </View>
                            <View style={[styles.priceInputContainer, styles.priceInputContainerActive]}>
                                <Text style={[styles.priceLabel, { color: COLORS.primary }]}>Max(₹)</Text>
                                <TextInput
                                    style={[styles.priceInput, { color: COLORS.primary }]}
                                    keyboardType="numeric"
                                    value={maxPrice}
                                    onChangeText={setMaxPrice}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Additional Notes Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: '#FCE7F3' }]}>
                                <Ionicons name="pencil-outline" size={20} color="#EC4899" />
                            </View>
                            <Text style={styles.cardTitle}>Additional Notes</Text>
                        </View>
                        <Input
                            placeholder="Any specific edition, author, or notes..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.lg }]}>
                <Button
                    title="Post Requirement"
                    onPress={handlePost}
                    loading={isLoading}
                    icon={<Ionicons name="paper-plane-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />}
                />
            </View>
        </View>
    );
};

export default RequestPostScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 120,
    },
    headerTitles: {
        marginBottom: SPACING.xl,
    },
    mainTitle: {
        fontSize: rf(20),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: SPACING.sm,
    },
    subTitle: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    cardTitle: {
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
    },
    inputLabel: {
        fontSize: rf(12),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: SPACING.sm,
    },
    inputLabelMuted: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        fontStyle: 'italic',
        marginBottom: SPACING.md,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background, // Very light gray/bg
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        paddingHorizontal: SPACING.md,
        height: 50,
    },
    inputIcon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        fontSize: rf(14),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.black,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: COLORS.background,
        borderRadius: 20,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
    },
    chipText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
    },
    chipTextActive: {
        color: COLORS.white,
    },
    priceRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    priceInputContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
    },
    priceInputContainerActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
    },
    priceLabel: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    priceInput: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
    },
    textArea: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        padding: SPACING.md,
        height: 100,
        fontSize: rf(13),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.black,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 12,
    },
    submitBtnText: {
        color: COLORS.white,
        fontFamily: FONTS.montserrat.bold,
        fontSize: rf(15),
    },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, ToastAndroid, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import Header from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';

const CONDITIONS = [
    { id: 'like_new', label: 'Like New', icon: 'decagram-outline' as any },
    { id: 'good', label: 'Good', icon: 'book-open-outline' as any },
    { id: 'fair', label: 'Fair', icon: 'file-document-outline' as any },
    { id: 'poor', label: 'Poor', icon: 'alert-circle-outline' as any },
];

const CreateScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [condition, setCondition] = useState('good');
    const [notes, setNotes] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState<string | null>(null);

    const handleCaptureImage = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            ToastAndroid.show("Camera permission is required to take photos.", ToastAndroid.SHORT);
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = () => {
        if (!title || !author || !price || !condition || !image) {
            ToastAndroid.show("Please fill all the required fields", ToastAndroid.SHORT);
        } else {
            ToastAndroid.show("Book listed successfully", ToastAndroid.SHORT);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Custom Header matching screenshot exactly */}
            <Header title="Listing" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* List Your Book Header */}
                <View style={styles.pageTitleRow}>
                    <Ionicons name="book-outline" size={26} color={COLORS.primary} />
                    <Text style={styles.pageTitleText}>List Your Book</Text>
                </View>

                {/* Book Photo Section */}
                <View style={styles.photoSectionWrapper}>
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Book Photo</Text>
                    </View>
                    <View style={styles.photoContainer}>
                        {image ? (
                            <View style={[styles.dashedBox, styles.previewContainer]}>
                                <Image source={{ uri: image }} style={styles.previewImage} resizeMode="stretch" />
                                <TouchableOpacity
                                    style={styles.removeImageBtn}
                                    onPress={() => setImage(null)}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons name="delete" size={20} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.dashedBox} activeOpacity={0.8} onPress={handleCaptureImage}>
                                <View style={styles.cameraIconWrapper}>
                                    <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.white} />
                                </View>
                                <Text style={styles.captureText}>Capture Image</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Basic Info Section */}
                <View style={styles.sectionWrapper}>
                    <View style={styles.sectionHeaderRowWithNumber}>
                        <View style={styles.numberCircle}>
                            <Text style={styles.numberText}>1</Text>
                        </View>
                        <Text style={styles.sectionTitleBlack}>Basic Info</Text>
                    </View>

                    <View style={styles.cardContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Book Title <Text style={styles.asterisk}>*</Text></Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder="Introduction to Algorithm"
                                placeholderTextColor={COLORS.textMuted}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Author<Text style={styles.asterisk}>*</Text></Text>
                            <TextInput
                                style={styles.inputField}
                                placeholder="Thomas H. Corman"
                                placeholderTextColor={COLORS.textMuted}
                                value={author}
                                onChangeText={setAuthor}
                            />
                        </View>
                    </View>
                </View>

                {/* Condition & Price Section */}
                <View style={styles.sectionWrapper}>
                    <View style={styles.sectionHeaderRowWithNumber}>
                        <View style={styles.numberCircle}>
                            <Text style={styles.numberText}>2</Text>
                        </View>
                        <Text style={styles.sectionTitleBlack}>Condition & Price</Text>
                    </View>

                    <View style={styles.cardContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Condition <Text style={styles.asterisk}>*</Text></Text>
                            <View style={styles.conditionGrid}>
                                {CONDITIONS.map((item) => {
                                    const isActive = condition === item.id;
                                    return (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[styles.conditionBox, isActive && styles.conditionBoxActive]}
                                            onPress={() => setCondition(item.id)}
                                            activeOpacity={0.8}
                                        >
                                            <View style={[styles.conditionIconWrapper, isActive && styles.conditionIconWrapperActive]}>
                                                <MaterialCommunityIcons
                                                    name={item.icon}
                                                    size={24}
                                                    color={isActive ? COLORS.white : COLORS.textMuted}
                                                />
                                            </View>
                                            <Text style={[styles.conditionText, isActive && styles.conditionTextActive]}>
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.notesLabelRow}>
                                <Text style={styles.inputLabel}>Condition Notes (Optional)</Text>
                                <TouchableOpacity style={styles.addBtn}>
                                    <Ionicons name="add" size={16} color={COLORS.primary} />
                                    <Text style={styles.addBtnText}>Add</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.inputField}
                                placeholder="e.g minor Highlights on page no. 45 and 67"
                                placeholderTextColor={COLORS.textMuted}
                                value={notes}
                                onChangeText={setNotes}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Price <Text style={styles.asterisk}>*</Text></Text>
                            <View style={styles.priceInputWrapper}>
                                <View style={styles.rupeeIconWrapper}>
                                    <Text style={styles.rupeeText}>₹</Text>
                                </View>
                                <TextInput
                                    style={styles.priceInputField}
                                    placeholder="Enter Your Price"
                                    placeholderTextColor={COLORS.textMuted}
                                    keyboardType="numeric"
                                    value={price}
                                    onChangeText={setPrice}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                <Button
                    title="Go to Next Step"
                    onPress={handleSubmit}
                    variant="primary"
                    style={{ borderRadius: 12 }}
                />
            </ScrollView>

        </View>
    );
};

export default CreateScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.grayLight,
    },
    headerIcon: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 120, // Space for bottom bar
    },
    pageTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    pageTitleText: {
        fontSize: rf(18),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginLeft: SPACING.sm,
    },
    photoSectionWrapper: {
        backgroundColor: COLORS.secondary,
        borderRadius: 20,
        padding: SPACING.md,
        marginBottom: SPACING.xl,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.xs,
    },
    sectionTitle: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
        marginLeft: SPACING.sm,
    },
    photoContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 2,
    },
    dashedBox: {
        borderWidth: 1.5,
        borderColor: COLORS.textMuted,
        borderStyle: 'dashed',
        borderRadius: 14,
        paddingVertical: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewContainer: {
        paddingVertical: 0,
        borderWidth: 0,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: 180,
        borderRadius: 14,
    },
    removeImageBtn: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        backgroundColor: COLORS.completeTransparency,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraIconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    captureText: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
    },
    sectionWrapper: {
        marginBottom: SPACING.xl,
    },
    sectionHeaderRowWithNumber: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        paddingHorizontal: SPACING.xs,
    },
    numberCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberText: {
        color: COLORS.white,
        fontFamily: FONTS.manrope.bold,
        fontSize: rf(12),
    },
    sectionTitleBlack: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginLeft: SPACING.sm,
    },
    cardContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.lg,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    inputLabel: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.textMuted,
    },
    asterisk: {
        color: COLORS.textMuted,
    },
    inputField: {
        backgroundColor: COLORS.grayLight,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy, // Light gray border
        borderRadius: 12,
        paddingHorizontal: SPACING.md,
        height: 48,
        fontSize: rf(14),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.black,
    },
    conditionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    conditionBox: {
        width: '48%',
        backgroundColor: COLORS.grayLight,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        borderRadius: 8,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    conditionBoxActive: {
        backgroundColor: COLORS.grayLight,
        borderColor: COLORS.blue, // Blue border
    },
    conditionIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    conditionIconWrapperActive: {
        backgroundColor: COLORS.blue, // Blue background for active icon wrapper
    },
    conditionText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.textMuted,
    },
    conditionTextActive: {
        color: '#3B82F6',
    },
    notesLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addBtnText: {
        color: COLORS.primary,
        fontFamily: FONTS.manrope.bold,
        fontSize: rf(13),
        marginLeft: 2,
    },
    priceInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.grayLight,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 12,
        height: 48,
        paddingHorizontal: 4,
    },
    rupeeIconWrapper: {
        backgroundColor: COLORS.green, // Green color from screenshot
        width: 50,
        height: 35,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rupeeText: {
        color: COLORS.white,
        fontFamily: FONTS.manrope.bold,
        fontSize: rf(16),
    },
    priceInputField: {
        flex: 1,
        paddingHorizontal: SPACING.md,
        fontSize: rf(14),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.black,
    },
    bottomBar: {
        position: 'absolute',
        bottom: SPACING.lg * 2,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.grayLight,
    },
    submitBtnText: {
        color: COLORS.white,
        fontFamily: FONTS.montserrat.bold,
        fontSize: rf(15),
    },
    submitBtnTextActive: {
        color: COLORS.white,
    },
});
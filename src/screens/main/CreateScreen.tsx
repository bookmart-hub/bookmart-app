import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, ToastAndroid, Alert } from 'react-native';
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
import { Input } from '@/components/ui/Input';
import * as Location from "expo-location";
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';

const CONDITIONS = [
    { id: 'like_new', label: 'Like New', icon: 'decagram-outline' as any },
    { id: 'good', label: 'Good', icon: 'book-open-outline' as any },
    { id: 'fair', label: 'Fair', icon: 'file-document-outline' as any },
    { id: 'poor', label: 'Poor', icon: 'alert-circle-outline' as any },
];

const SLOTS_CONFIG = [
    { label: 'Front Cover', required: true, icon: 'book-open-variant' as const },
    { label: 'Back Cover', required: true, icon: 'book-open' as const },
    { label: 'Spine', required: true, icon: 'book-minus' as const },
    { label: 'Middle Page', required: true, icon: 'book-open-outline' as const },
    { label: 'Damage 1', required: false, icon: 'alert-circle-outline' as const },
    { label: 'Damage 2', required: false, icon: 'alert-circle-outline' as const },
];

const CreateScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [condition, setCondition] = useState('good');
    const [notes, setNotes] = useState('');
    const [price, setPrice] = useState('');
    const [images, setImages] = useState<(string | null)[]>([null, null, null, null, null, null]);
    const [uploadProgress, setUploadProgress] = useState<number[]>([0, 0, 0, 0, 0, 0]);
    const uploadIntervals = React.useRef<{ [key: number]: NodeJS.Timeout }>({});

    React.useEffect(() => {
        return () => {
            Object.values(uploadIntervals.current).forEach(clearInterval);
        };
    }, []);

    const simulateUpload = (index: number) => {
        if (uploadIntervals.current[index]) {
            clearInterval(uploadIntervals.current[index]);
        }
        setUploadProgress(prev => {
            const next = [...prev];
            next[index] = 0;
            return next;
        });
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(prev => {
                const next = [...prev];
                next[index] = Math.min(progress, 100);
                return next;
            });
            if (progress >= 100) {
                clearInterval(interval);
                delete uploadIntervals.current[index];
            }
        }, 100);
        uploadIntervals.current[index] = interval;
    };

    const [description, setDescription] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
        address: string;
    } | null>(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const getCurrentLocation = async () => {
        setIsFetchingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                ToastAndroid.show(
                    "Location permission is required to fetch pickup address.",
                    ToastAndroid.SHORT
                );
                return false;
            }

            const current = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const reverse = await Location.reverseGeocodeAsync({
                latitude: current.coords.latitude,
                longitude: current.coords.longitude,
            });

            const place = reverse[0];
            const addressString = `${place?.name ? place.name + ', ' : ''}${place?.street ? place.street + ', ' : ''}${place?.city ? place.city : ''}`.replace(/, $/, '');

            setLocation({
                latitude: current.coords.latitude,
                longitude: current.coords.longitude,
                address: addressString || "Location found, but address is unavailable.",
            });

            return true;
        } catch (error) {
            ToastAndroid.show("Failed to fetch location. Please ensure GPS is enabled.", ToastAndroid.SHORT);
            return false;
        } finally {
            setIsFetchingLocation(false);
        }
    };

    const handleImagePick = (index: number) => {
        Alert.alert(
            "Upload Photo",
            `Upload ${SLOTS_CONFIG[index].label}`,
            [
                { text: "Take Photo", onPress: () => takePhoto(index) },
                { text: "Choose from Gallery", onPress: () => pickImage(index) },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const takePhoto = async (index: number) => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            ToastAndroid.show("Camera permission is required to take photos.", ToastAndroid.SHORT);
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.6,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const pickedUri = result.assets[0].uri;
            setImages(prev => {
                const next = [...prev];
                next[index] = pickedUri;
                return next;
            });
            simulateUpload(index);
        }
    };

    const pickImage = async (index: number) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            ToastAndroid.show("Gallery permission is required to choose photos.", ToastAndroid.SHORT);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.6,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const pickedUri = result.assets[0].uri;
            setImages(prev => {
                const next = [...prev];
                next[index] = pickedUri;
                return next;
            });
            simulateUpload(index);
        }
    };

    const handleSlotPress = (index: number) => {
        const hasImage = !!images[index];
        if (hasImage) {
            Alert.alert(
                "Manage Photo",
                `Options for ${SLOTS_CONFIG[index].label}`,
                [
                    { text: "Replace Photo", onPress: () => handleImagePick(index) },
                    {
                        text: "Remove Photo",
                        style: "destructive",
                        onPress: () => {
                            if (uploadIntervals.current[index]) {
                                clearInterval(uploadIntervals.current[index]);
                                delete uploadIntervals.current[index];
                            }
                            setImages(prev => {
                                const next = [...prev];
                                next[index] = null;
                                return next;
                            });
                            setUploadProgress(prev => {
                                const next = [...prev];
                                next[index] = 0;
                                return next;
                            });
                        }
                    },
                    { text: "Cancel", style: "cancel" }
                ]
            );
        } else {
            handleImagePick(index);
        }
    };

    const isSlotValid = (index: number) => {
        return !!images[index] && uploadProgress[index] === 100;
    };

    const isUploadValid = () => {
        return isSlotValid(0) && isSlotValid(1) && isSlotValid(2) && isSlotValid(3);
    };

    const handleNextStep = async () => {
        if (!title || !author || !price || !condition) {
            ToastAndroid.show(
                "Please fill all the required fields",
                ToastAndroid.SHORT
            );
            return;
        }

        if (!isUploadValid()) {
            ToastAndroid.show(
                "Please upload all required photos (Front Cover, Back Cover, Spine, Middle Page) and wait for upload to complete.",
                ToastAndroid.SHORT
            );
            return;
        }

        const success = await getCurrentLocation();

        if (!success) return;

        setCurrentStep(2);
    };

    const handleFinalSubmit = () => {
        ToastAndroid.show("Book listed successfully", ToastAndroid.SHORT);
        // Reset state for future usage
        setTitle('');
        setAuthor('');
        setCondition('good');
        setNotes('');
        setPrice('');
        setImages([null, null, null, null, null, null]);
        setUploadProgress([0, 0, 0, 0, 0, 0]);
        setDescription('');
        setCurrentStep(1);
        // Reset navigation to go back to the root of the tab navigator, effectively returning to Create screen
        navigation.reset({ index: 0, routes: [{ name: 'Create' as never }] });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style='dark' />
            {/* Custom Header matching screenshot exactly */}
            <Header title="Listing" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {currentStep === 1 ? (
                    <>
                        {/* List Your Book Header */}
                        <View style={styles.pageTitleRow}>
                            <Ionicons name="book-outline" size={26} color={COLORS.primary} />
                            <Text style={styles.pageTitleText}>List Your Book</Text>
                        </View>

                        {/* Book Photo Section */}
                        <View style={styles.photoSectionWrapper}>
                            <View style={styles.sectionHeaderRow}>
                                <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
                                <Text style={styles.sectionTitle}>Book Photos</Text>
                            </View>
                            <View style={styles.photoContainer}>
                                {images.every(img => img === null) ? (
                                    /* Single Large Placeholder initially */
                                    <TouchableOpacity style={styles.dashedBox} activeOpacity={0.8} onPress={() => handleImagePick(0)}>
                                        <View style={styles.cameraIconWrapper}>
                                            <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.white} />
                                        </View>
                                        <Text style={styles.captureText}>Upload Cover Image</Text>
                                        <Text style={{ fontSize: rf(11), fontFamily: FONTS.manrope.medium, color: COLORS.textMuted, marginTop: 4 }}>
                                            Tap to add Front Cover & start upload flow
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    /* 6-Slot Grid */
                                    <View style={styles.gridContainer}>
                                        {SLOTS_CONFIG.map((slot, index) => {
                                            const imgUri = images[index];
                                            const progress = uploadProgress[index];
                                            const isUploading = imgUri && progress < 100;

                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[
                                                        styles.gridSlot,
                                                        slot.required && !imgUri && styles.gridSlotRequired,
                                                        imgUri && progress === 100 && styles.gridSlotUploaded
                                                    ]}
                                                    activeOpacity={0.8}
                                                    onPress={() => handleSlotPress(index)}
                                                >
                                                    {imgUri ? (
                                                        <View style={styles.slotImageContainer}>
                                                            <Image source={{ uri: imgUri }} contentFit='cover' style={styles.slotImage} />
                                                            {isUploading && (
                                                                <View style={styles.progressOverlay}>
                                                                    <View style={styles.progressBarBackground}>
                                                                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                                                                    </View>
                                                                    <Text style={styles.progressText}>{progress}%</Text>
                                                                </View>
                                                            )}
                                                            {!isUploading && (
                                                                <View style={styles.slotBadge}>
                                                                    <Text style={styles.slotBadgeText}>{slot.label}</Text>
                                                                </View>
                                                            )}
                                                            <TouchableOpacity
                                                                style={styles.removeSlotBtn}
                                                                activeOpacity={0.7}
                                                                onPress={(e) => {
                                                                    e.stopPropagation();
                                                                    if (uploadIntervals.current[index]) {
                                                                        clearInterval(uploadIntervals.current[index]);
                                                                        delete uploadIntervals.current[index];
                                                                    }
                                                                    setImages(prev => {
                                                                        const next = [...prev];
                                                                        next[index] = null;
                                                                        return next;
                                                                    });
                                                                    setUploadProgress(prev => {
                                                                        const next = [...prev];
                                                                        next[index] = 0;
                                                                        return next;
                                                                    });
                                                                }}
                                                            >
                                                                <Ionicons name="close-circle" size={22} color={COLORS.completeTransparency} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    ) : (
                                                        <View style={styles.emptySlotContent}>
                                                            <MaterialCommunityIcons
                                                                name={slot.icon}
                                                                size={24}
                                                                color={slot.required ? COLORS.primary : COLORS.textMuted}
                                                            />
                                                            <Text style={[styles.slotLabel, slot.required && styles.slotLabelRequired]}>
                                                                {slot.label}
                                                            </Text>
                                                            <Text style={styles.slotRequiredIndicator}>
                                                                {slot.required ? 'Required' : 'If Any'}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>

                            {/* Validation Checklist */}
                            {!images.every(img => img === null) && (
                                <View style={styles.checklistContainer}>
                                    <Text style={styles.checklistTitle}>Upload Checklist:</Text>
                                    <View style={styles.checklistGrid}>
                                        {SLOTS_CONFIG.filter(s => s.required).map((slot, idx) => {
                                            const completed = isSlotValid(idx);
                                            return (
                                                <View key={idx} style={styles.checklistItem}>
                                                    <Ionicons
                                                        name={completed ? "checkmark-circle" : "close-circle"}
                                                        size={16}
                                                        color={completed ? COLORS.green : COLORS.red}
                                                    />
                                                    <Text style={[styles.checklistText, completed && styles.checklistTextCompleted]}>
                                                        {slot.label}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
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
                                    <Input
                                        placeholder="Book Title"
                                        value={title}
                                        onChangeText={setTitle}
                                        autoCapitalize="words"
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Author<Text style={styles.asterisk}>*</Text></Text>
                                    <Input
                                        placeholder="Author"
                                        value={author}
                                        onChangeText={setAuthor}
                                        autoCapitalize="words"
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
                                    <Input
                                        placeholder="Condition Notes (Optional)"
                                        value={notes}
                                        onChangeText={setNotes}
                                        autoCapitalize="words"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Price <Text style={styles.asterisk}>*</Text></Text>
                                    <Input
                                        placeholder="Enter Your Price"
                                        value={price}
                                        onChangeText={setPrice}
                                        keyboardType="numeric"
                                        containerStyle={{ marginVertical: 0 }}
                                        prefix={
                                            <View style={[styles.rupeeIconWrapper, { marginRight: 8 }]}>
                                                <Text style={styles.rupeeText}>₹</Text>
                                            </View>
                                        }
                                    />
                                </View>
                            </View>
                        </View>
                        <Button
                            title="Go to Next Step"
                            onPress={handleNextStep}
                            variant="primary"
                            loading={isFetchingLocation}
                            style={{ borderRadius: 12 }}
                        />
                    </>
                ) : (
                    <>
                        {/* Step 3 Section */}
                        <View style={styles.sectionWrapper}>
                            <View style={styles.sectionHeaderRowWithNumber}>
                                <View style={styles.numberCircle}>
                                    <Text style={styles.numberText}>3</Text>
                                </View>
                                <Text style={styles.sectionTitleBlack}>Description & Note</Text>
                            </View>

                            <View style={styles.cardContainer}>
                                <View style={styles.inputGroup}>
                                    <Input
                                        placeholder="Add a detailed description.."
                                        value={description}
                                        onChangeText={setDescription}
                                        multiline
                                        numberOfLines={50}
                                        containerStyle={{ marginVertical: 0, marginTop: SPACING.sm }}
                                        style={{ height: rf(150) }}
                                    />
                                </View>
                            </View>
                        </View>
                        {location && (
                            <View style={styles.locationCard}>
                                <Ionicons
                                    name="location"
                                    size={24}
                                    color={COLORS.primary}
                                />

                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.locationTitle}>
                                        Pickup Location
                                    </Text>
                                    <Text style={styles.locationText}>
                                        {location.address}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.refreshButton}
                                    activeOpacity={0.7}
                                    onPress={getCurrentLocation}
                                    disabled={isFetchingLocation}
                                >
                                    <Ionicons name="refresh" size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.actionButtonsRow}>
                            <Button
                                title="Skip"
                                onPress={handleFinalSubmit}
                                variant="outline"
                                style={styles.skipBtn}
                            />
                            <Button
                                title="Submit"
                                onPress={handleFinalSubmit}
                                variant="primary"
                                style={styles.submitBtnContainer}
                            />
                        </View>
                    </>
                )}
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
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: SPACING.xs,
    },
    gridSlot: {
        width: '31%',
        height: rf(110),
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.grayHeavvy,
        borderStyle: 'dashed',
        backgroundColor: COLORS.grayLight,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 6,
    },
    gridSlotRequired: {
        borderColor: COLORS.primary + '60',
    },
    gridSlotUploaded: {
        borderStyle: 'solid',
        borderColor: COLORS.primary,
    },
    emptySlotContent: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
    },
    slotLabel: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
        textAlign: 'center',
        marginTop: 4,
    },
    slotLabelRequired: {
        color: COLORS.black,
    },
    slotRequiredIndicator: {
        fontSize: rf(8),
        fontFamily: FONTS.manrope.regular,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    slotImageContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    slotImage: {
        width: '100%',
        height: '100%',
    },
    slotBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.completeTransparency,
        paddingVertical: 2,
        alignItems: 'center',
    },
    slotBadgeText: {
        color: COLORS.white,
        fontSize: rf(9),
        fontFamily: FONTS.manrope.bold,
    },
    progressOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.completeTransparency,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    progressBarBackground: {
        width: '85%',
        height: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.green,
    },
    progressText: {
        color: COLORS.white,
        fontSize: rf(10),
        fontFamily: FONTS.manrope.bold,
    },
    removeSlotBtn: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'transparent',
    },
    checklistContainer: {
        marginTop: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
    },
    checklistTitle: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
        marginBottom: 8,
    },
    checklistGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 6,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 4,
    },
    checklistText: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginLeft: 4,
    },
    checklistTextCompleted: {
        color: COLORS.black,
        fontFamily: FONTS.manrope.bold,
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
        gap: 5,
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
    actionButtonsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.xl,
    },
    skipBtn: {
        flex: 1,
        borderRadius: 12,
    },
    submitBtnContainer: {
        flex: 1,
        borderRadius: 12,
    },
    locationCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
        marginBottom: SPACING.xl,
    },
    locationTitle: {
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: 2,
    },
    locationText: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    refreshButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.grayLight,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
    },
});
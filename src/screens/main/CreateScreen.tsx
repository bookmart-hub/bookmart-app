import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, ToastAndroid, Alert, Platform, Modal, ActivityIndicator } from 'react-native';
import { api } from '@/api/clients';

const showToast = (message: string) => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
        Alert.alert("Notice", message);
    }
};
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rem } from '@/utils/responsive';
import Header from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import * as Location from "expo-location";
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

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
    const [category, setCategory] = useState('');
    const [images, setImages] = useState<(string | null)[]>([null, null, null, null, null, null]);
    const [uploadProgress, setUploadProgress] = useState<number[]>([0, 0, 0, 0, 0, 0]);
    const uploadIntervals = React.useRef<{ [key: number]: any }>({});

    const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState<any | null>(null);
    const [selectedChipCategory, setSelectedChipCategory] = useState('');
    const [manualCategory, setManualCategory] = useState('');
    const [bookId, setBookId] = useState<number | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const BOOK_CATEGORIES = [
        { id: 'science_fiction', label: 'Science Fiction' },
        { id: 'romance', label: 'Romance' },
        { id: 'self_help', label: 'Self Help' },
        { id: 'biography', label: 'Biography' },
        { id: 'business', label: 'Business' },
        { id: 'engineering', label: 'Engineering' },
        { id: 'medical', label: 'Medical' },
        { id: 'law', label: 'Law' },
        { id: 'competitive_exams', label: 'Competitive Exams' },
        { id: 'other', label: 'Other' },
    ];

    React.useEffect(() => {
        return () => {
            Object.values(uploadIntervals.current).forEach(clearInterval);
        };
    }, []);

    React.useEffect(() => {
        if (!showSuggestions || title.trim().length < 2) {
            setSearchSuggestions([]);
            return;
        }

        setIsLoadingSuggestions(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await api.get('/api/v1/book/search/', {
                    params: { q: title }
                });
                setSearchSuggestions(response.data || []);
            } catch (err) {
                console.error("Error searching books:", err);
            } finally {
                setIsLoadingSuggestions(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [title, showSuggestions]);

    const handleSelectSuggestion = (suggestion: any) => {
        setSelectedSuggestion(suggestion);
        setSelectedChipCategory('');
        setManualCategory('');
        setShowSuggestions(false);
        setIsCategoryModalVisible(true);
    };

    const handleImportBook = async () => {
        if (!selectedSuggestion) return;
        const finalCategory = selectedChipCategory || manualCategory.trim();
        
        setIsImporting(true);
        try {
            const response = await api.post('/api/v1/book/import-openlibrary/', {
                openlibrary_key: selectedSuggestion.openlibrary_key,
                category: finalCategory || null
            });
            
            const importedBook = response.data;
            setTitle(importedBook.title || '');
            setAuthor(importedBook.authors?.join(', ') || '');
            setBookId(importedBook.book_id || null);
            
            if (importedBook.categories && importedBook.categories.length > 0) {
                const matchedCategory = BOOK_CATEGORIES.find(c =>
                    importedBook.categories.some((rc: string) => 
                        rc.toLowerCase().replace(/[^a-z0-9]/g, '') === c.label.toLowerCase().replace(/[^a-z0-9]/g, '')
                    )
                );
                if (matchedCategory) {
                    setCategory(matchedCategory.id);
                } else {
                    setCategory('other');
                }
            } else {
                setCategory('other');
            }

            showToast("Book imported successfully");
            setIsCategoryModalVisible(false);
        } catch (err: any) {
            console.error("Error importing book:", err);
            showToast(err.response?.data?.detail || "Failed to import book.");
        } finally {
            setIsImporting(false);
        }
    };

    const handleManualInsert = async () => {
        setShowSuggestions(false);
        setIsImporting(true);
        try {
            const response = await api.post('/api/v1/book/manual/', {
                title: title,
                author: author || "Unknown"
            });

            const manualBook = response.data;
            setTitle(manualBook.title || '');
            setAuthor(manualBook.authors?.join(', ') || '');
            setBookId(manualBook.book_id || null);
            
            if (manualBook.categories && manualBook.categories.length > 0) {
                const matchedCategory = BOOK_CATEGORIES.find(c =>
                    manualBook.categories.some((rc: string) => 
                        rc.toLowerCase().replace(/[^a-z0-9]/g, '') === c.label.toLowerCase().replace(/[^a-z0-9]/g, '')
                    )
                );
                if (matchedCategory) {
                    setCategory(matchedCategory.id);
                } else {
                    setCategory('other');
                }
            } else {
                setCategory('other');
            }

            showToast("Manual book entry created");
        } catch (err: any) {
            console.error("Error creating book manually:", err);
            showToast(err.response?.data?.detail || "Failed to create manual book.");
        } finally {
            setIsImporting(false);
        }
    };

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
                showToast("Location permission is required to fetch pickup address.");
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
            showToast("Failed to fetch location. Please ensure GPS is enabled.");
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
            showToast("Camera permission is required to take photos.");
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
            showToast("Gallery permission is required to choose photos.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
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
            showToast("Please fill all the required fields");
            return;
        }

        if (!isUploadValid()) {
            showToast("Please upload all required photos (Front Cover, Back Cover, Spine, Middle Page) and wait for upload to complete.");
            return;
        }

        const success = await getCurrentLocation();

        if (!success) return;

        setCurrentStep(2);
    };

    const handleFinalSubmit = () => {
        if (!category) {
            showToast("Please select a category");
            return;
        }

        showToast("Book listed successfully");
        // Reset state for future usage
        setTitle('');
        setAuthor('');
        setCondition('good');
        setNotes('');
        setPrice('');
        setCategory('');
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
                                        <Text style={{ fontSize: rem(0.6875), fontFamily: FONTS.manrope.medium, color: COLORS.textMuted, marginTop: 4 }}>
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
                                        onChangeText={(text) => {
                                            setTitle(text);
                                            setShowSuggestions(true);
                                        }}
                                        autoCapitalize="words"
                                    />
                                    {showSuggestions && (title.trim().length >= 2) && (
                                        <View style={styles.suggestionsContainer}>
                                            {isLoadingSuggestions ? (
                                                <View style={styles.suggestionsLoading}>
                                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                                    <Text style={styles.suggestionsLoadingText}>Loading suggestions...</Text>
                                                </View>
                                            ) : (
                                                <ScrollView style={{ maxHeight: rem(12.5) }} keyboardShouldPersistTaps="handled">
                                                    {searchSuggestions.map((item, index) => (
                                                        <TouchableOpacity
                                                            key={item.id || item.openlibrary_key || index}
                                                            style={styles.suggestionItem}
                                                            onPress={() => handleSelectSuggestion(item)}
                                                        >
                                                            <View style={styles.suggestionIconWrapper}>
                                                                <Ionicons name="book-outline" size={18} color={COLORS.primary} />
                                                            </View>
                                                            <View style={styles.suggestionTextContainer}>
                                                                <Text style={styles.suggestionTitleText} numberOfLines={1}>
                                                                    {item.title}
                                                                </Text>
                                                                <Text style={styles.suggestionAuthorText} numberOfLines={1}>
                                                                    by {item.authors?.join(', ') || 'Unknown Author'}
                                                                </Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    ))}
                                                    
                                                    {/* Manual insertion option */}
                                                    <TouchableOpacity
                                                        style={styles.manualSuggestionItem}
                                                        onPress={handleManualInsert}
                                                    >
                                                        <View style={styles.manualSuggestionIconWrapper}>
                                                            <Ionicons name="create-outline" size={18} color={COLORS.blue} />
                                                        </View>
                                                        <View style={styles.suggestionTextContainer}>
                                                            <Text style={styles.manualSuggestionTitleText} numberOfLines={1}>
                                                                Add "{title}" manually
                                                            </Text>
                                                            <Text style={styles.manualSuggestionSubText}>
                                                                Not found in search? Insert details manually.
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </ScrollView>
                                            )}
                                        </View>
                                    )}
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
                        {/* Step 3 Section: Category */}
                        <View style={styles.sectionWrapper}>
                            <View style={styles.sectionHeaderRowWithNumber}>
                                <View style={styles.numberCircle}>
                                    <Text style={styles.numberText}>3</Text>
                                </View>
                                <Text style={styles.sectionTitleBlack}>Category <Text style={styles.asterisk}>*</Text></Text>
                            </View>

                            <View style={styles.cardContainer}>
                                <View style={styles.categoryGrid}>
                                    {BOOK_CATEGORIES.map((item) => {
                                        const isActive = category === item.id;
                                        return (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                                                onPress={() => setCategory(item.id)}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                                                    {item.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>

                        {/* Step 4 Section: Description & Note */}
                        <View style={styles.sectionWrapper}>
                            <View style={styles.sectionHeaderRowWithNumber}>
                                <View style={styles.numberCircle}>
                                    <Text style={styles.numberText}>4</Text>
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
                                        style={{ height: rem(9.375) }}
                                    />
                                </View>
                            </View>
                        </View>
                        {location && (
                            <View style={styles.locationContainer}>
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

                                <View style={styles.mapContainer}>
                                    <MapView
                                        style={styles.map}
                                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                                        initialRegion={{
                                            latitude: location.latitude,
                                            longitude: location.longitude,
                                            latitudeDelta: 0.005,
                                            longitudeDelta: 0.005,
                                        }}
                                        pitchEnabled={false}
                                        rotateEnabled={false}
                                        scrollEnabled={false}
                                        zoomEnabled={false}
                                    >
                                        <Marker
                                            coordinate={{
                                                latitude: location.latitude,
                                                longitude: location.longitude,
                                            }}
                                        >
                                            <View style={styles.userLocationMarker}>
                                                <Ionicons name="location" size={24} color={COLORS.white} />
                                            </View>
                                        </Marker>
                                    </MapView>
                                </View>
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

            <Modal
                visible={isCategoryModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsCategoryModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Category</Text>
                        <Text style={styles.modalSubtitle}>
                            Assign a category for "{selectedSuggestion?.title}" to import it.
                        </Text>

                        {/* Chips container */}
                        <Text style={styles.modalSectionLabel}>Suggested Categories:</Text>
                        {selectedSuggestion?.categories && selectedSuggestion.categories.length > 0 ? (
                            <View style={styles.modalChipsContainer}>
                                {selectedSuggestion.categories.map((cat: string, index: number) => {
                                    const isSelected = selectedChipCategory === cat;
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.categoryChip,
                                                isSelected && styles.categoryChipActive
                                            ]}
                                            onPress={() => {
                                                setSelectedChipCategory(cat);
                                                setManualCategory('');
                                            }}
                                        >
                                            <Text style={[
                                                styles.categoryChipText,
                                                isSelected && styles.categoryChipTextActive
                                            ]}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : (
                            <Text style={styles.noCategoriesText}>No suggested categories found for this book.</Text>
                        )}

                        {/* Manual entry */}
                        <Text style={styles.modalSectionLabel}>Or Enter Custom Category:</Text>
                        <Input
                            placeholder="e.g. Science, Fiction, History"
                            value={manualCategory}
                            onChangeText={(text) => {
                                setManualCategory(text);
                                setSelectedChipCategory('');
                            }}
                        />

                        {/* Action buttons */}
                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setIsCategoryModalVisible(false)}
                            >
                                <Text style={styles.modalCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalSubmitButton,
                                    isImporting && styles.modalSubmitButtonDisabled
                                ]}
                                onPress={handleImportBook}
                                disabled={isImporting}
                            >
                                {isImporting ? (
                                    <ActivityIndicator size="small" color={COLORS.white} />
                                ) : (
                                    <Text style={styles.modalSubmitButtonText}>Import Book</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
        fontSize: rem(1.125),
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
        fontSize: rem(1.125),
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
        fontSize: rem(0.875),
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
        height: rem(6.875),
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
        fontSize: rem(0.625),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.text,
        textAlign: 'center',
        marginTop: 4,
    },
    slotLabelRequired: {
        color: COLORS.black,
    },
    slotRequiredIndicator: {
        fontSize: rem(0.5),
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
        fontSize: rem(0.5625),
        fontFamily: FONTS.manrope.bold,
    },
    progressOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
        fontSize: rem(0.625),
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
        fontSize: rem(0.75),
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
        fontSize: rem(0.6875),
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
        fontSize: rem(0.8125),
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
        fontSize: rem(0.75),
    },
    sectionTitleBlack: {
        fontSize: rem(1),
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
        fontSize: rem(0.8125),
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
        fontSize: rem(0.875),
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
        fontSize: rem(0.75),
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
        fontSize: rem(0.8125),
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
        fontSize: rem(1),
    },
    priceInputField: {
        flex: 1,
        paddingHorizontal: SPACING.md,
        fontSize: rem(0.875),
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
        fontSize: rem(0.9375),
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
    locationContainer: {
        marginBottom: SPACING.xl,
    },
    locationCard: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.grayLight,
        borderBottomWidth: 0,
    },
    locationTitle: {
        fontSize: rem(0.875),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: 2,
    },
    locationText: {
        fontSize: rem(0.8125),
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
    mapContainer: {
        height: 150,
        width: '100%',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.grayLight,
    },
    map: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    userLocationMarker: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: COLORS.white,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryPill: {
        backgroundColor: COLORS.grayLight,
        paddingHorizontal: SPACING.md,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
    },
    categoryPillActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryPillText: {
        fontSize: rem(0.75),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.textMuted,
    },
    categoryPillTextActive: {
        color: COLORS.white,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 85,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        zIndex: 1000,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden',
    },
    suggestionsLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        justifyContent: 'center',
    },
    suggestionsLoadingText: {
        marginLeft: 8,
        fontSize: rem(0.8125),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.grayLight,
    },
    suggestionIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    suggestionTextContainer: {
        flex: 1,
    },
    suggestionTitleText: {
        fontSize: rem(0.875),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
    },
    suggestionAuthorText: {
        fontSize: rem(0.75),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    manualSuggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: SPACING.md,
        backgroundColor: '#F5F9FF',
    },
    manualSuggestionIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E6F0FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    manualSuggestionTitleText: {
        fontSize: rem(0.875),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.blue,
    },
    manualSuggestionSubText: {
        fontSize: rem(0.75),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    modalTitle: {
        fontSize: rem(1.125),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: rem(0.8125),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginBottom: 16,
    },
    modalSectionLabel: {
        fontSize: rem(0.8125),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
        marginTop: 8,
        marginBottom: 8,
    },
    modalChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    categoryChip: {
        backgroundColor: COLORS.grayLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
    },
    categoryChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryChipText: {
        fontSize: rem(0.75),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.textMuted,
    },
    categoryChipTextActive: {
        color: COLORS.white,
    },
    noCategoriesText: {
        fontSize: rem(0.75),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginBottom: 12,
    },
    modalButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 20,
    },
    modalCancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCancelButtonText: {
        color: COLORS.textMuted,
        fontFamily: FONTS.manrope.bold,
        fontSize: rem(0.875),
    },
    modalSubmitButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 100,
    },
    modalSubmitButtonDisabled: {
        backgroundColor: COLORS.grayHeavvy,
    },
    modalSubmitButtonText: {
        color: COLORS.white,
        fontFamily: FONTS.manrope.bold,
        fontSize: rem(0.875),
    },
});
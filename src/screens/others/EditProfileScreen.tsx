import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ToastAndroid, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import Header from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/clients';
import { getColleges, createCollege, updateProfile, College } from '@/types/core';

const EditProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const queryClient = useQueryClient();

    useEffect(() => {
        console.log("Profile id: ", userProfile?.id);
    }, [])

    const [profileId, setProfileId] = useState<number | null>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [dob, setDob] = useState('');
    const [address, setAddress] = useState('');
    const [avatar, setAvatar] = useState('https://media.istockphoto.com/id/2220866251/photo/isolated-generic-gray-human-figure-placeholder.webp?a=1&b=1&s=612x612&w=0&k=20&c=vkqNIInBzzIYcuk-wV5KC28xiXfFfYZmAgVOaYebNEA=');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // College Search State
    const [collegeQuery, setCollegeQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
    const [collegeDropdownVisible, setCollegeDropdownVisible] = useState(false);
    const [isCreatingCollege, setIsCreatingCollege] = useState(false);

    // Fetch User Profile
    const { data: userProfile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const response = await api.get('/api/v1/core/profile/me/');
            return response.data;
        }
    });

    useEffect(() => {
        if (userProfile) {
            setProfileId(userProfile.id);
            setFullName(userProfile.full_name || '');
            setPhone(userProfile.phone_number || '');
            setDob(userProfile.date_of_birth || '');
            setAddress(userProfile.city_location || '');
            if (userProfile.image) {
                setAvatar(userProfile.image);
            }
            if (userProfile.college) {
                setSelectedCollege(userProfile.college);
                setCollegeQuery(userProfile.college.name);
            }
        }
    }, [userProfile]);

    // College Debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(collegeQuery);
        }, 200);
        return () => clearTimeout(handler);
    }, [collegeQuery]);

    // Fetch Colleges
    const { data: filteredColleges = [], isFetching: isCollegesLoading } = useQuery({
        queryKey: ['colleges', debouncedQuery],
        queryFn: () => getColleges(debouncedQuery),
        enabled: debouncedQuery.length > 0,
    });

    const handleCollegeSearch = (text: string) => {
        setCollegeQuery(text);
        if (selectedCollege && text !== selectedCollege.name) {
            setSelectedCollege(null);
        }
        setCollegeDropdownVisible(true);
    };

    const handleCollegeSelect = (college: College) => {
        setSelectedCollege(college);
        setCollegeQuery(college.name);
        setCollegeDropdownVisible(false);
    };

    const handleCreateCollege = async () => {
        if (!debouncedQuery.trim()) return;
        setIsCreatingCollege(true);
        try {
            const newCollege = await createCollege(debouncedQuery.trim());
            handleCollegeSelect(newCollege);
            ToastAndroid.show('College created successfully', ToastAndroid.SHORT);
        } catch (error) {
            ToastAndroid.show('Failed to create college', ToastAndroid.SHORT);
        } finally {
            setIsCreatingCollege(false);
        }
    };

    const handleImagePick = () => {
        Alert.alert(
            "Upload Photo",
            "Choose an option",
            [
                { text: "Take Photo", onPress: takePhoto },
                { text: "Choose from Gallery", onPress: pickImage },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission Required", "Camera access is needed to take a photo.");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setAvatar(result.assets[0].uri);
        }
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission Required", "Gallery access is needed to choose a photo.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setAvatar(result.assets[0].uri);
        }
    };

    const validateForm = () => {
        let valid = true;
        let newErrors: Record<string, string> = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Full Name is required';
            valid = false;
        }
        if (!phone.trim()) {
            newErrors.phone = 'Phone Number is required';
            valid = false;
        }
        if (!dob.trim()) {
            newErrors.dob = 'Date of Birth is required';
            valid = false;
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
            newErrors.dob = 'Format must be YYYY-MM-DD';
            valid = false;
        }
        if (!address.trim()) {
            newErrors.address = 'Location is required';
            valid = false;
        }
        if (!selectedCollege) {
            newErrors.college = 'College is required';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const updateMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            // Perform PATCH request using /me/ endpoint
            const response = await api.patch('/api/v1/core/profile/me/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            ToastAndroid.show('Profile updated successfully', ToastAndroid.SHORT);
            navigation.goBack();
        },
        onError: (error: any) => {
            const data = error?.response?.data;
            let msg = error.message || 'Failed to update profile';
            if (data?.detail) {
                msg = data.detail;
            } else if (typeof data === 'object') {
                msg = JSON.stringify(data);
            } else if (typeof data === 'string') {
                msg = data;
            }
            Alert.alert("Update Error", msg);
            console.log("UPDATE ERROR:", data);
        }
    });

    const handleSave = () => {
        if (!validateForm()) {
            ToastAndroid.show('Please fix the errors', ToastAndroid.SHORT);
            return;
        }

        const formData = new FormData();
        formData.append('full_name', fullName);

        // Ensure phone number has +91 prefix
        let payloadPhone = phone.trim();
        if (!payloadPhone.startsWith('+91')) {
            payloadPhone = '+91' + payloadPhone.replace(/^(0|91|\+91)/, '');
        }
        formData.append('phone_number', payloadPhone);

        formData.append('date_of_birth', dob.trim());
        formData.append('city_location', address);
        if (bio) formData.append('bio', bio);
        if (selectedCollege) {
            formData.append('college', selectedCollege.id.toString());
        }

        // Append image only if it was modified (local device uri)
        if (avatar && !avatar.startsWith('http')) {
            const filename = avatar.split('/').pop() || 'profile.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;
            // @ts-ignore
            formData.append('image', { uri: avatar, name: filename, type });
        }

        updateMutation.mutate(formData);
    };

    const renderInputPrefix = (iconName: any, IconFamily = Feather) => (
        <View style={styles.inputPrefix}>
            <IconFamily name={iconName} size={18} color={COLORS.textMuted} />
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style='dark' />
            <Header title="Edit Profile" backButton />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {isProfileLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        {/* Avatar Section */}
                        <View style={styles.avatarSection}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: avatar }}
                                    style={styles.avatar}
                                    contentFit="cover"
                                />
                                <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8} onPress={handleImagePick}>
                                    <Ionicons name="camera" size={18} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                        </View>

                        {/* Form Fields */}
                        <View style={styles.formSection}>
                            <Input
                                label="Full Name"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChangeText={(text) => { setFullName(text); setErrors(prev => ({ ...prev, fullName: '' })) }}
                                prefix={renderInputPrefix('user')}
                                error={errors.fullName}
                            />

                            <Input
                                label="Email Address"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={(text) => { setEmail(text); setErrors(prev => ({ ...prev, email: '' })) }}
                                prefix={renderInputPrefix('mail')}
                                error={errors.email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Input
                                label="Phone Number"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChangeText={(text) => { setPhone(text); setErrors(prev => ({ ...prev, phone: '' })) }}
                                prefix={renderInputPrefix('phone')}
                                keyboardType="phone-pad"
                                error={errors.phone}
                            />

                            <Input
                                label="Date of Birth"
                                placeholder="YYYY-MM-DD"
                                value={dob}
                                onChangeText={(text) => { setDob(text); setErrors(prev => ({ ...prev, dob: '' })) }}
                                prefix={renderInputPrefix('calendar')}
                                error={errors.dob}
                            />

                            <Input
                                label="Bio"
                                placeholder="Tell us about yourself"
                                value={bio}
                                onChangeText={setBio}
                                multiline
                                numberOfLines={3}
                                prefix={renderInputPrefix('file-text')}
                            />

                            {/* College Search Field */}
                            <View style={styles.collegeSearchBox}>
                                <Text style={styles.fieldLabel}>College / University</Text>
                                <View
                                    style={[
                                        styles.searchBarContainer,
                                        collegeDropdownVisible && styles.searchBarFocused,
                                        !!errors.college && styles.searchBarError,
                                    ]}
                                >
                                    <FontAwesome5 name="university" size={16} color={COLORS.primary} style={styles.searchLeftIcon} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search your college / university"
                                        placeholderTextColor={COLORS.textMuted}
                                        value={collegeQuery}
                                        onChangeText={handleCollegeSearch}
                                        onFocus={() => setCollegeDropdownVisible(true)}
                                        autoCapitalize="words"
                                    />
                                    <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchRightIcon} />
                                </View>
                                {errors.college && <Text style={{ color: COLORS.red, fontSize: rf(11), marginTop: 4 }}>{errors.college}</Text>}

                                {/* Dropdown search suggestions */}
                                {collegeDropdownVisible && (
                                    <View style={styles.dropdownContainer}>
                                        <ScrollView style={styles.dropdownList} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
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
                                            {debouncedQuery.length > 0 && !filteredColleges.find(c => c.name.toLowerCase() === debouncedQuery.toLowerCase()) && (
                                                <TouchableOpacity
                                                    style={[styles.dropdownItem, { borderTopWidth: filteredColleges.length > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: '#F0F0F0' }]}
                                                    onPress={handleCreateCollege}
                                                    disabled={isCreatingCollege}
                                                >
                                                    {isCreatingCollege ? (
                                                        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 6 }} />
                                                    ) : (
                                                        <Ionicons name="add-circle-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                                                    )}
                                                    <Text style={[styles.dropdownText, { color: COLORS.primary, fontFamily: FONTS.manrope.bold }]} numberOfLines={1}>
                                                        + Add "{debouncedQuery}"
                                                    </Text>
                                                    <View style={styles.badgeContainer}>
                                                        <Text style={styles.badgeText}>New</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            <Input
                                label="Location"
                                placeholder="Enter your city or address"
                                value={address}
                                onChangeText={(text) => { setAddress(text); setErrors(prev => ({ ...prev, address: '' })) }}
                                numberOfLines={3}
                                prefix={renderInputPrefix('map-pin')}
                                containerStyle={{ marginTop: SPACING.md, marginBottom: SPACING.xl + 10 }}
                                error={errors.address}
                            />
                        </View>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>

            {/* Bottom Actions */}
            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.lg }]}>
                <Button
                    title="Save Changes"
                    onPress={handleSave}
                    loading={updateMutation.isPending}
                    icon={<Feather name="check" size={20} color={COLORS.white} style={{ marginRight: 8 }} />}
                />
            </View>
        </View>
    );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 100, // Extra padding for bottom fixed button
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: SPACING.xl,
    },
    avatarContainer: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: COLORS.grayLight,
        position: 'relative',
        marginBottom: SPACING.sm,
        elevation: 4,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: COLORS.background,
    },
    changePhotoText: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
    formSection: {
        gap: SPACING.xs,
    },
    inputPrefix: {
        marginRight: SPACING.sm,
        marginLeft: 2,
        alignSelf: "center"
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
        borderColor: COLORS.grayHeavvy + '40', // Semi-transparent border
    },
    collegeSearchBox: {
        marginTop: SPACING.sm,
        position: 'relative',
    },
    fieldLabel: {
        fontSize: rf(12),
        fontFamily: FONTS.montserrat.semibold,
        color: COLORS.black,
        marginBottom: 6,
        paddingLeft: 4,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
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
        fontSize: rf(12),
        fontFamily: FONTS.manrope.medium,
    },
    searchRightIcon: {
        marginLeft: 8,
    },
    dropdownContainer: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.grayLight,
        borderRadius: 10,
        maxHeight: 180,
        marginTop: 4,
        zIndex: 100,
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
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F0F0F0',
    },
    dropdownText: {
        fontSize: rf(11.5),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.text,
        flex: 1,
    },
    badgeContainer: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: rf(9),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    }
});

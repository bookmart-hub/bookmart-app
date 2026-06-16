import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ToastAndroid, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
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

const DUMMY_USER = {
    fullName: 'Amit Roy',
    username: 'amitroy_99',
    email: 'amit.roy@example.com',
    phone: '+91 9876543210',
    bio: 'Avid reader and book collector from Kolkata. I love finding rare editions of classic literature.',
    address: 'Kolkata, West Bengal, India',
    avatar: 'https://i.pravatar.cc/150?u=amitroy'
};

const EditProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [fullName, setFullName] = useState(DUMMY_USER.fullName);
    const [username, setUsername] = useState(DUMMY_USER.username);
    const [email, setEmail] = useState(DUMMY_USER.email);
    const [phone, setPhone] = useState(DUMMY_USER.phone);
    const [bio, setBio] = useState(DUMMY_USER.bio);
    const [address, setAddress] = useState(DUMMY_USER.address);
    const [avatar, setAvatar] = useState(DUMMY_USER.avatar);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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
        if (!username.trim()) {
            newErrors.username = 'Username is required';
            valid = false;
        }
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = 'Valid email is required';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSave = () => {
        if (!validateForm()) {
            ToastAndroid.show('Please fill all the required fields', ToastAndroid.SHORT);
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            ToastAndroid.show('Profile updated successfully', ToastAndroid.SHORT);
            navigation.goBack();
        }, 1500);
    };

    const renderInputPrefix = (iconName: any, IconFamily = Feather) => (
        <View style={styles.inputPrefix}>
            <IconFamily name={iconName} size={18} color={COLORS.textMuted} />
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="Edit Profile" backButton />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={avatar}
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
                            label="Username"
                            placeholder="Enter your username"
                            value={username}
                            onChangeText={(text) => { setUsername(text); setErrors(prev => ({ ...prev, username: '' })) }}
                            prefix={renderInputPrefix('at-sign')}
                            error={errors.username}
                            autoCapitalize="none"
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
                            onChangeText={setPhone}
                            prefix={renderInputPrefix('phone')}
                            keyboardType="phone-pad"
                        />

                        <Input
                            label="Bio"
                            placeholder="Tell us about yourself"
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={3}
                            prefix={renderInputPrefix('file-text')}
                            containerStyle={{ marginTop: SPACING.md }}
                        />

                        <Input
                            label="Location"
                            placeholder="Enter your city or address"
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            numberOfLines={3}
                            prefix={renderInputPrefix('map-pin')}
                            containerStyle={{ marginTop: SPACING.md, marginBottom: SPACING.xl + 10 }}
                        />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Actions */}
            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.lg }]}>
                <Button
                    title="Save Changes"
                    onPress={handleSave}
                    loading={isLoading}
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
});

import { api } from "@/api/clients";
import { Button } from "@/components/ui/Button";
import Header from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Feather, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const showToastOrAlert = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("Success", message);
  }
};

const EditProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [profileId, setProfileId] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch User Profile
  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/api/v1/core/profile/me/");
      return response.data;
    },
  });

  useEffect(() => {
    if (userProfile) {
      setProfileId(userProfile.id);
      setFullName(userProfile.full_name || "");
      setPhone(userProfile.phone_number || "");
      setDob(userProfile.date_of_birth || "");
      setAddress(userProfile.city_location || "");
      if (userProfile.email) {
        setEmail(userProfile.email);
      }
      if (userProfile.image) {
        setAvatar(userProfile.image);
      }
    }
  }, [userProfile]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      setDob(`${year}-${month}-${day}`);
      setErrors((prev) => ({ ...prev, dob: "" }));
    }
  };

  const handleImagePick = useCallback(() => {
    Alert.alert("Upload Photo", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Gallery", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [avatar]);

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Camera access is needed to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
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
      mediaTypes: ["images"],
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
    let firstErrorMessage = "";

    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required";
      if (!firstErrorMessage) firstErrorMessage = newErrors.fullName;
      valid = false;
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone Number is required";
      if (!firstErrorMessage) firstErrorMessage = newErrors.phone;
      valid = false;
    }
    if (!dob.trim()) {
      newErrors.dob = "Date of Birth is required";
      if (!firstErrorMessage) firstErrorMessage = newErrors.dob;
      valid = false;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
      newErrors.dob = "Format must be YYYY-MM-DD";
      if (!firstErrorMessage) firstErrorMessage = newErrors.dob;
      valid = false;
    }
    if (!address.trim()) {
      newErrors.address = "Location is required";
      if (!firstErrorMessage) firstErrorMessage = newErrors.address;
      valid = false;
    }

    setErrors(newErrors);
    return { valid, firstErrorMessage };
  };

  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.patch("/api/v1/core/profile/me/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      showToastOrAlert("Profile updated successfully");
      navigation.goBack();
    },
    onError: (error: any) => {
      const data = error?.response?.data;
      let msg = error.message || "Failed to update profile";
      if (data?.detail) {
        msg = data.detail;
      } else if (typeof data === "object") {
        msg = JSON.stringify(data);
      }
      Alert.alert("Update Error", msg);
    },
  });

  const handleSave = () => {
    const { valid, firstErrorMessage } = validateForm();
    if (!valid) {
      ToastAndroid.show(firstErrorMessage || "Please fix the errors", ToastAndroid.SHORT);
      return;
    }

    const formData = new FormData();
    formData.append("full_name", fullName);

    let payloadPhone = phone.trim();
    if (!payloadPhone.startsWith("+91")) {
      payloadPhone = "+91" + payloadPhone.replace(/^(0|91|\+91)/, "");
    }
    formData.append("phone_number", payloadPhone);
    formData.append("date_of_birth", dob.trim());
    formData.append("city_location", address);

    if (avatar && !avatar.startsWith("http")) {
      const filename = avatar.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      // @ts-ignore
      formData.append("image", { uri: avatar, name: filename, type });
    }

    updateMutation.mutate(formData);
  };

  const renderInputPrefix = (iconName: any, IconFamily = Feather) => (
    <View style={styles.inputPrefix}>
      <IconFamily name={iconName} size={18} color={COLORS.textMuted} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Edit Profile" backButton />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {isProfileLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            automaticallyAdjustKeyboardInsets={true}
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatar} contentFit="cover" />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={48} color={COLORS.primary} />
                  </View>
                )}
                <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8} onPress={handleImagePick}>
                  <Ionicons name="camera" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <Text style={styles.changePhotoText}>Change Profile Photo</Text>
            </View>

            {/* Form Fields Card */}
            <View style={styles.card}>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setErrors((prev) => ({ ...prev, fullName: "" }));
                }}
                prefix={renderInputPrefix("user")}
                error={errors.fullName}
              />

              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                prefix={renderInputPrefix("mail")}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false} // Email should not be editable as it is the primary identity
                containerStyle={styles.disabledInput}
              />

              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                prefix={renderInputPrefix("phone")}
                keyboardType="phone-pad"
                error={errors.phone}
              />

              <TouchableOpacity activeOpacity={0.8} onPress={() => setShowDatePicker(true)}>
                <View pointerEvents="none">
                  <Input
                    label="Date of Birth"
                    placeholder="YYYY-MM-DD"
                    value={dob}
                    onChangeText={() => {}}
                    prefix={renderInputPrefix("calendar")}
                    error={errors.dob}
                  />
                </View>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dob && /^\d{4}-\d{2}-\d{2}$/.test(dob) ? new Date(dob) : new Date(2000, 0, 1)}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}

              <Input
                label="Location"
                placeholder="Enter your city or address"
                value={address}
                onChangeText={(text) => {
                  setAddress(text);
                  setErrors((prev) => ({ ...prev, address: "" }));
                }}
                prefix={renderInputPrefix("map-pin")}
                error={errors.address}
              />
            </View>
          </ScrollView>
        )}

        {/* Bottom fixed save button */}
        {!isProfileLoading && (
          <View style={[styles.bottomContainer, { bottom: insets.bottom > 0 ? insets.bottom + 8 : rem(1.0) }]}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={updateMutation.isPending}
              style={styles.saveBtn}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: 110, // Margin for the absolute save button bar
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: SPACING.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    position: "relative",
    marginBottom: SPACING.sm,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: COLORS.background,
    elevation: 2,
  },
  changePhotoText: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    marginBottom: SPACING.md,
  },
  disabledInput: {
    opacity: 0.6,
  },
  inputPrefix: {
    marginRight: SPACING.sm,
    alignSelf: "center",
  },
  bottomContainer: {
    position: "absolute",
    left: rem(1.0),
    right: rem(1.0),
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 24,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  saveBtn: {
    borderRadius: 16,
    height: 52,
  },
});

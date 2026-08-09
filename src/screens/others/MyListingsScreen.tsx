import { Button } from "@/components/ui/Button";
import Header from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SectionCard = ({ children, style }: any) => <View style={[styles.sectionCard, style]}>{children}</View>;

const SectionHeader = ({ icon, title, showInfo = false, iconColor = COLORS.primary, customIcon }: any) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionHeaderLeft}>
      <View style={[styles.iconWrapper, { backgroundColor: iconColor + "15" }]}>
        {customIcon ? customIcon : <Ionicons name={icon} size={20} color={iconColor} />}
      </View>
      <Text style={[styles.sectionTitle, { color: COLORS.black }]}>{title}</Text>
    </View>
    {showInfo && <Ionicons name="help-circle-outline" size={22} color={COLORS.primary} />}
  </View>
);

const RadioOption = ({ label, selected, onPress }: any) => (
  <TouchableOpacity style={styles.radioContainer} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
    <Text style={styles.radioLabel}>{label}</Text>
  </TouchableOpacity>
);

const SLOTS_CONFIG = [
  { label: "Front Cover", required: true, icon: "book-open-variant" as const },
  { label: "Back Cover", required: true, icon: "book-open" as const },
  { label: "Spine", required: true, icon: "book-minus" as const },
  { label: "Middle Page", required: true, icon: "book-open-outline" as const },
  { label: "Damage 1", required: false, icon: "alert-circle-outline" as const },
  { label: "Damage 2", required: false, icon: "alert-circle-outline" as const },
];

const MyListingsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [condition, setCondition] = useState("Good");
  const [visibility, setVisibility] = useState("My College Only");
  const [status, setStatus] = useState("Active");
  const [description, setDescription] = useState(
    "This book is in good condition.\nNo pages missing.\nMinimal highlighting."
  );

  const [images, setImages] = useState<(string | null)[]>([
    "https://m.media-amazon.com/images/I/91bYsX41DVL.jpg",
    null,
    null,
    null,
    null,
    null,
  ]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([100, 0, 0, 0, 0, 0]);
  const uploadIntervals = React.useRef<{ [key: number]: any }>({});

  React.useEffect(() => {
    return () => {
      Object.values(uploadIntervals.current).forEach(clearInterval);
    };
  }, []);

  const simulateUpload = (index: number) => {
    if (uploadIntervals.current[index]) {
      clearInterval(uploadIntervals.current[index]);
    }
    setUploadProgress((prev) => {
      const next = [...prev];
      next[index] = 0;
      return next;
    });
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress((prev) => {
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

  const takePhoto = async (index: number) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Camera access is needed to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.6,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const pickedUri = result.assets[0].uri;
      setImages((prev) => {
        const next = [...prev];
        next[index] = pickedUri;
        return next;
      });
      simulateUpload(index);
    }
  };

  const pickImage = async (index: number) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Gallery access is needed to choose a photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.6,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const pickedUri = result.assets[0].uri;
      setImages((prev) => {
        const next = [...prev];
        next[index] = pickedUri;
        return next;
      });
      simulateUpload(index);
    }
  };

  const handleImagePick = (index: number) => {
    Alert.alert("Upload Photo", `Upload ${SLOTS_CONFIG[index].label}`, [
      { text: "Take Photo", onPress: () => takePhoto(index) },
      { text: "Choose from Gallery", onPress: () => pickImage(index) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSlotPress = (index: number) => {
    const hasImage = !!images[index];
    if (hasImage) {
      Alert.alert("Manage Photo", `Options for ${SLOTS_CONFIG[index].label}`, [
        { text: "Replace Photo", onPress: () => handleImagePick(index) },
        {
          text: "Remove Photo",
          style: "destructive",
          onPress: () => {
            if (uploadIntervals.current[index]) {
              clearInterval(uploadIntervals.current[index]);
              delete uploadIntervals.current[index];
            }
            setImages((prev) => {
              const next = [...prev];
              next[index] = null;
              return next;
            });
            setUploadProgress((prev) => {
              const next = [...prev];
              next[index] = 0;
              return next;
            });
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
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

  const handleSave = () => {
    if (!isUploadValid()) {
      ToastAndroid.show(
        "Please upload all required photos (Front Cover, Back Cover, Spine, Middle Page) and wait for upload to complete.",
        ToastAndroid.SHORT
      );
      return;
    }
    ToastAndroid.show("Changes saved successfully", ToastAndroid.SHORT);
    navigation.goBack();
  };

  const renderPhotosSection = () => {
    return (
      <View style={styles.photoSectionWrapper}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Book Photos</Text>
        </View>
        <View style={styles.photoContainer}>
          {images.every((img) => img === null) ? (
            /* Single Large Placeholder initially */
            <TouchableOpacity style={styles.dashedBox} activeOpacity={0.8} onPress={() => handleImagePick(0)}>
              <View style={styles.cameraIconWrapper}>
                <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.white} />
              </View>
              <Text style={styles.captureText}>Upload Cover Image</Text>
              <Text
                style={{
                  fontSize: rem(0.6875),
                  fontFamily: FONTS.manrope.medium,
                  color: COLORS.textMuted,
                  marginTop: 4,
                }}
              >
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
                      imgUri && progress === 100 && styles.gridSlotUploaded,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleSlotPress(index)}
                  >
                    {imgUri ? (
                      <View style={styles.slotImageContainer}>
                        <Image source={{ uri: imgUri }} contentFit="cover" style={styles.slotImage} />
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
                            setImages((prev) => {
                              const next = [...prev];
                              next[index] = null;
                              return next;
                            });
                            setUploadProgress((prev) => {
                              const next = [...prev];
                              next[index] = 0;
                              return next;
                            });
                          }}
                        >
                          <Ionicons name="close-circle" size={22} color={COLORS.red} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.emptySlotContent}>
                        <MaterialCommunityIcons
                          name={slot.icon}
                          size={24}
                          color={slot.required ? COLORS.primary : COLORS.textMuted}
                        />
                        <Text style={[styles.slotLabel, slot.required && styles.slotLabelRequired]}>{slot.label}</Text>
                        <Text style={styles.slotRequiredIndicator}>{slot.required ? "Required" : "If Any"}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Validation Checklist */}
        {!images.every((img) => img === null) && (
          <View style={styles.checklistContainer}>
            <Text style={styles.checklistTitle}>Upload Checklist:</Text>
            <View style={styles.checklistGrid}>
              {SLOTS_CONFIG.filter((s) => s.required).map((slot, idx) => {
                const completed = isSlotValid(idx);
                return (
                  <View key={idx} style={styles.checklistItem}>
                    <Ionicons
                      name={completed ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={completed ? COLORS.green : COLORS.red}
                    />
                    <Text style={[styles.checklistText, completed && styles.checklistTextCompleted]}>{slot.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <Header
        title="Edit Listing"
        backButton
        rightElement={
          <TouchableOpacity onPress={() => navigation.navigate("PublicProfile")}>
            <Ionicons name="eye-outline" size={25} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {renderPhotosSection()}

        <SectionCard>
          <SectionHeader icon="information-circle-outline" title="Basic Information" />
          <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: SPACING.xs }}>
              <Input label="Book Title *" value="Atomic Habits" placeholder="Enter title" />
            </View>
            <View style={{ flex: 1, paddingLeft: SPACING.xs }}>
              <Input label="Author *" value="James Clear" placeholder="Enter author" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: SPACING.xs }}>
              <TouchableOpacity activeOpacity={0.8}>
                <View pointerEvents="none">
                  <Input label="Category *" value="Self Help" placeholder="Select category" />
                  <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} style={styles.dropdownIcon} />
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, paddingLeft: SPACING.xs }}>
              <Input label="ISBN (Optional)" value="9781847941831" placeholder="Enter ISBN" />
            </View>
          </View>
        </SectionCard>

        <View style={styles.row}>
          <SectionCard style={{ flex: 1, marginRight: SPACING.xs }}>
            <SectionHeader icon="shield-checkmark-outline" title="Condition" showInfo />
            <View style={styles.conditionGrid}>
              {["Like New", "Good", "Fair", "Poor"].map((cond) => {
                const isSelected = condition === cond;
                return (
                  <TouchableOpacity
                    key={cond}
                    style={[styles.conditionBtn, isSelected && styles.conditionBtnSelected]}
                    onPress={() => setCondition(cond)}
                  >
                    <Text style={[styles.conditionText, isSelected && styles.conditionTextSelected]}>{cond}</Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.white} style={{ marginLeft: 4 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </SectionCard>

          <SectionCard style={{ flex: 1, marginLeft: SPACING.xs }}>
            <SectionHeader icon="pricetag-outline" title="Pricing" />
            <Input label="Selling Price *" value="₹350" placeholder="₹0" />
            <Input label="Original Price (Optional)" value="₹699" placeholder="₹0" />
          </SectionCard>
        </View>

        <SectionCard>
          <SectionHeader icon="list-outline" title="Description" />
          <View style={styles.descriptionContainer}>
            <Input
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your book's condition..."
              style={styles.descriptionInput}
              containerStyle={{ marginVertical: 0 }}
            />
            <Text style={styles.charCount}>{description.length} / 500</Text>
          </View>
        </SectionCard>

        <View style={styles.row}>
          <SectionCard style={[styles.performanceSection, { flex: 1 }]}>
            <SectionHeader icon="bar-chart-outline" title="Listing Performance" showInfo />
            <View style={styles.performanceGrid}>
              <View style={styles.perfItem}>
                <Ionicons name="eye" size={20} color={COLORS.primary} />
                <Text style={styles.perfValue}>152</Text>
                <Text style={styles.perfLabel}>Views</Text>
              </View>
              <View style={styles.perfDivider} />
              <View style={styles.perfItem}>
                <Ionicons name="heart-outline" size={20} color={COLORS.primary} />
                <Text style={styles.perfValue}>22</Text>
                <Text style={styles.perfLabel}>Interested</Text>
              </View>
              <View style={styles.perfDivider} />
              <View style={styles.perfItem}>
                <Ionicons name="logo-whatsapp" size={20} color={COLORS.primary} />
                <Text style={styles.perfValue}>8</Text>
                <Text style={styles.perfLabel}>WhatsApp Clicks</Text>
              </View>
            </View>
            <Text style={styles.listedDate}>Listed on 12 May 2024</Text>
          </SectionCard>
        </View>

        <View style={styles.row}>
          <SectionCard style={{ flex: 1, marginRight: SPACING.xs }}>
            <SectionHeader icon="flag-outline" title="Listing Status" showInfo />
            <View style={styles.radioGroup}>
              <RadioOption label="Active" selected={status === "Active"} onPress={() => setStatus("Active")} />
              <RadioOption
                label="Pause Listing"
                selected={status === "Pause Listing"}
                onPress={() => setStatus("Pause Listing")}
              />
              <RadioOption
                label="Mark as Sold"
                selected={status === "Mark as Sold"}
                onPress={() => setStatus("Mark as Sold")}
              />
            </View>
          </SectionCard>

          <SectionCard style={{ flex: 1, backgroundColor: COLORS.secondary, elevation: -10 }}>
            <SectionHeader icon="rocket-outline" title="Boost Listing" iconColor={COLORS.primary} />
            <View style={styles.boostContent}>
              <Text style={styles.boostSub}>Current Position</Text>
              <Text style={styles.boostPosition}>#14 in Self Help</Text>
              <Text style={styles.boostDesc}>Boosted listings get more visibility.</Text>
              <Button
                title="Boost Now"
                style={styles.boostBtn}
                textStyle={styles.boostBtnText}
                onPress={() => navigation.navigate("AppStack", { screen: "BoostListing" })}
              />
            </View>
          </SectionCard>
        </View>

        <View style={styles.dangerSection}>
          <View style={styles.dangerHeader}>
            <View style={styles.dangerIconWrap}>
              <Ionicons name="trash-outline" size={20} color={COLORS.red} />
            </View>
            <View>
              <Text style={styles.dangerTitle}>Delete Listing</Text>
              <Text style={styles.dangerSub}>This action cannot be undone.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { bottom: insets.bottom > 0 ? insets.bottom + 8 : rem(1.0) }]}>
        <View style={styles.bottomBarRow}>
          <Button title="Cancel" variant="outline" style={styles.cancelBtn} onPress={() => navigation.goBack()} />
          <Button title="Save Changes" style={styles.saveBtn} onPress={handleSave} />
        </View>
      </View>
    </View>
  );
};

export default MyListingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  previewText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  performanceSection: {
    flex: 1,
    marginLeft: SPACING.xs,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 120,
  },
  photoSectionWrapper: {
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: SPACING.xs,
  },
  gridSlot: {
    width: "31%",
    height: rem(6.875),
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.grayHeavvy,
    borderStyle: "dashed",
    backgroundColor: COLORS.grayLight,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 6,
  },
  gridSlotRequired: {
    borderColor: COLORS.primary + "60",
  },
  gridSlotUploaded: {
    borderStyle: "solid",
    borderColor: COLORS.primary,
  },
  emptySlotContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  slotLabel: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.text,
    textAlign: "center",
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
    width: "100%",
    height: "100%",
    position: "relative",
  },
  slotImage: {
    width: "100%",
    height: "100%",
  },
  slotBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.completeTransparency,
    paddingVertical: 2,
    alignItems: "center",
  },
  slotBadgeText: {
    color: COLORS.white,
    fontSize: rem(0.5625),
    fontFamily: FONTS.manrope.bold,
  },
  progressOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.completeTransparency,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  progressBarBackground: {
    width: "85%",
    height: 5,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.green,
  },
  progressText: {
    color: COLORS.white,
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.bold,
  },
  removeSlotBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "transparent",
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 6,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
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
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  captureText: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "column",
    marginBottom: 0,
  },
  dropdownIcon: {
    position: "absolute",
    right: 12,
    top: 45,
  },
  conditionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  conditionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    borderRadius: 8,
    paddingVertical: 8,
    width: "47%",
  },
  conditionBtnSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  conditionText: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.text,
  },
  conditionTextSelected: {
    color: COLORS.white,
  },
  descriptionContainer: {
    position: "relative",
  },
  descriptionInput: {
    height: 100,
  },
  charCount: {
    position: "absolute",
    bottom: -20,
    right: 0,
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
  },
  radioGroup: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.grayHeavvy,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
  },
  collegeInfoBox: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  collegeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  collegeName: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
    flexShrink: 1,
  },
  changeText: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  performanceGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.xs,
  },
  perfItem: {
    alignItems: "center",
    flex: 1,
  },
  perfValue: {
    fontSize: rem(1),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
    marginTop: 4,
  },
  perfLabel: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  perfDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.grayHeavvy,
  },
  listedDate: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    textAlign: "center",
  },
  boostContent: {
    marginTop: SPACING.xs,
  },
  boostSub: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  boostPosition: {
    fontSize: rem(0.875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
    marginVertical: 4,
  },
  boostDesc: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  boostBtn: {
    height: 40,
  },
  boostBtnText: {
    fontSize: rem(0.8125),
  },
  dangerSection: {
    backgroundColor: COLORS.redLight,
    borderRadius: 16,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    marginBottom: SPACING.xl,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  dangerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  dangerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerTitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.red,
  },
  dangerSub: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  deleteBtn: {
    height: 36,
    width: 100,
    borderColor: COLORS.red,
    marginVertical: 0,
  },
  deleteBtnText: {
    color: COLORS.red,
    fontSize: rem(0.75),
  },
  bottomBar: {
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
  bottomBarRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  cancelBtn: {
    flex: 1,
    height: rem(3.125),
  },
  saveBtn: {
    flex: 1,
    height: rem(3.125),
  },
});

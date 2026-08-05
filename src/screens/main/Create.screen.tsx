import { api } from "@/api/clients";
import { Button } from "@/components/ui/Button";
import Header from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const showToast = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("Notice", message);
  }
};

const CONDITIONS = [
  { id: "like_new", label: "Like New", icon: "decagram-outline" as any },
  { id: "good", label: "Good", icon: "book-open-outline" as any },
  { id: "fair", label: "Fair", icon: "file-document-outline" as any },
  { id: "poor", label: "Poor", icon: "alert-circle-outline" as any },
];

const SLOTS_CONFIG = [
  { label: "Front Cover", required: true, icon: "book-open-variant" as const },
  { label: "Back Cover", required: true, icon: "book-open" as const },
  { label: "Spine", required: true, icon: "book-minus" as const },
  { label: "Middle Page", required: true, icon: "book-open-outline" as const },
  { label: "Damage 1", required: false, icon: "alert-circle-outline" as const },
  { label: "Damage 2", required: false, icon: "alert-circle-outline" as const },
];

const CreateScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const editListingId = route.params?.editListingId;

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [condition, setCondition] = useState("good");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [loadingSuggestionKey, setLoadingSuggestionKey] = useState<string | null>(null);
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  const [bookId, setBookId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedTitle, setDebouncedTitle] = useState("");

  const { data: editListingData } = useQuery({
    queryKey: ["edit-listing", editListingId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/marketplace/listings/${editListingId}/`);
      return response.data;
    },
    enabled: !!editListingId,
  });

  React.useEffect(() => {
    if (editListingData) {
      setTitle(editListingData.book.title || "");
      setAuthor(editListingData.book.authors?.map((a: any) => a.name).join(", ") || "");
      setPrice(String(parseFloat(editListingData.price)));
      setCondition(editListingData.condition.toLowerCase() === "like_new" ? "like_new" : editListingData.condition.toLowerCase());
      setNotes(editListingData.condition_notes || "");
      setBookId(editListingData.book.id || null);

      const categoryNames = editListingData.book.categories?.map((c: any) => c.name) || [];
      if (categoryNames.length > 0) {
        setCategoryInput(categoryNames[0]);
      }

      // Load listing images
      const loadedImages: (string | null)[] = [null, null, null, null, null, null];
      const loadedProgress = [0, 0, 0, 0, 0, 0];

      editListingData.listing_images?.forEach((img: any) => {
        let index = -1;
        if (img.label === "FRONT_COVER" || img.label === "front_cover") index = 0;
        else if (img.label === "BACK_COVER" || img.label === "back_cover") index = 1;
        else if (img.label === "SPINE" || img.label === "spine") index = 2;
        else if (img.label === "MIDDLE_PAGE" || img.label === "middle_page") index = 3;
        else if (img.label === "DAMAGE_1" || img.label === "damage_1") index = 4;
        else if (img.label === "DAMAGE_2" || img.label === "damage_2") index = 5;

        if (index !== -1 && img.image_url) {
          loadedImages[index] = img.image_url;
          loadedProgress[index] = 100;
        }
      });

      setImages(loadedImages);
      setUploadProgress(loadedProgress);
    }
  }, [editListingData]);

  const BOOK_CATEGORIES = [
    { id: "science_fiction", label: "Science Fiction" },
    { id: "romance", label: "Romance" },
    { id: "self_help", label: "Self Help" },
    { id: "biography", label: "Biography" },
    { id: "business", label: "Business" },
    { id: "engineering", label: "Engineering" },
    { id: "medical", label: "Medical" },
    { id: "law", label: "Law" },
    { id: "competitive_exams", label: "Competitive Exams" },
    { id: "other", label: "Other" },
  ];

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTitle(title);
    }, 500);
    return () => clearTimeout(handler);
  }, [title]);

  const { data: searchSuggestions = [], isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ["bookSearch", debouncedTitle],
    queryFn: async () => {
      const response = await api.get("/api/v1/book/search/", {
        params: { q: debouncedTitle },
      });
      return response.data || [];
    },
    enabled: showSuggestions && debouncedTitle.trim().length >= 2,
  });

  const importMutation = useMutation({
    mutationFn: async ({ openlibraryKey, categoryVal }: { openlibraryKey: string; categoryVal: string | null }) => {
      const response = await api.post("/api/v1/book/import-openlibrary/", {
        openlibrary_key: openlibraryKey,
        category: categoryVal,
      });
      return response.data;
    },
    onSuccess: (importedBook) => {
      setTitle(importedBook.title || "");
      setAuthor(importedBook.authors?.join(", ") || "");
      setBookId(importedBook.book_id || null);
      const responseCats = importedBook.categories || [];
      if (responseCats.length > 0) {
        setAvailableCategories(responseCats);
        setCategoryInput(responseCats[0]);
        const matchedCategory = BOOK_CATEGORIES.find((c) =>
          responseCats.some(
            (rc: string) =>
              rc.toLowerCase().replace(/[^a-z0-9]/g, "") === c.label.toLowerCase().replace(/[^a-z0-9]/g, "")
          )
        );
        setCategory(matchedCategory ? matchedCategory.id : "other");
      } else {
        setAvailableCategories(["Other"]);
        setCategoryInput("Other");
        setCategory("other");
      }

      setLoadingSuggestionKey(null);
      setShowSuggestions(false);
      showToast("Book imported successfully");
    },
    onError: (err: any) => {
      console.error("Error importing book:", err);
      showToast(err.response?.data?.detail || "Failed to import book.");
      setLoadingSuggestionKey(null);
    },
  });

  const manualCreateMutation = useMutation({
    mutationFn: async ({ titleVal, authorVal }: { titleVal: string; authorVal: string }) => {
      const response = await api.post("/api/v1/book/manual/", {
        title: titleVal,
        author: authorVal,
      });
      return response.data;
    },
    onSuccess: (manualBook) => {
      setTitle(manualBook.title || "");
      setAuthor(manualBook.authors?.join(", ") || "");
      setBookId(manualBook.book_id || null);
      const responseCats = manualBook.categories || [];
      if (responseCats.length > 0) {
        setAvailableCategories(responseCats);
        setCategoryInput(responseCats[0]);
        const matchedCategory = BOOK_CATEGORIES.find((c) =>
          responseCats.some(
            (rc: string) =>
              rc.toLowerCase().replace(/[^a-z0-9]/g, "") === c.label.toLowerCase().replace(/[^a-z0-9]/g, "")
          )
        );
        setCategory(matchedCategory ? matchedCategory.id : "other");
      } else {
        setAvailableCategories(["Other"]);
        setCategoryInput("Other");
        setCategory("other");
      }

      setLoadingSuggestionKey(null);
      setShowSuggestions(false);
      showToast("Manual book entry created");
    },
    onError: (err: any) => {
      console.error("Error creating book manually:", err);
      showToast(err.response?.data?.detail || "Failed to create manual book.");
      setLoadingSuggestionKey(null);
    },
  });

  // const isImporting = importMutation.isPending || manualCreateMutation.isPending;

  const handleSelectSuggestion = (suggestion: any) => {
    if (suggestion.is_local && suggestion.id) {
      setShowSuggestions(false);
      setTitle(suggestion.title || "");
      setAuthor(suggestion.authors?.join(", ") || "");
      setBookId(suggestion.id);

      const responseCats = suggestion.categories || [];
      if (responseCats.length > 0) {
        setAvailableCategories(responseCats);
        setCategoryInput(responseCats[0]);
        const matchedCategory = BOOK_CATEGORIES.find((c) =>
          responseCats.some(
            (rc: string) =>
              rc.toLowerCase().replace(/[^a-z0-9]/g, "") === c.label.toLowerCase().replace(/[^a-z0-9]/g, "")
          )
        );
        setCategory(matchedCategory ? matchedCategory.id : "other");
      } else {
        setAvailableCategories(["Other"]);
        setCategoryInput("Other");
        setCategory("other");
      }

      showToast("Selected local book record");
    } else {
      setLoadingSuggestionKey(suggestion.openlibrary_key);
      importMutation.mutate({
        openlibraryKey: suggestion.openlibrary_key,
        categoryVal: null,
      });
    }
  };

  const handleManualInsert = () => {
    setLoadingSuggestionKey("manual");
    manualCreateMutation.mutate({
      titleVal: title,
      authorVal: author || "Unknown",
    });
  };

  const [description, setDescription] = useState("");
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
      const addressString =
        `${place?.name ? place.name + ", " : ""}${place?.street ? place.street + ", " : ""}${place?.city ? place.city : ""}`.replace(
          /, $/,
          ""
        );

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
    Alert.alert("Upload Photo", `Upload ${SLOTS_CONFIG[index].label}`, [
      { text: "Take Photo", onPress: () => takePhoto(index) },
      { text: "Choose from Gallery", onPress: () => pickImage(index) },
      { text: "Cancel", style: "cancel" },
    ]);
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
      setImages((prev) => {
        const next = [...prev];
        next[index] = pickedUri;
        return next;
      });
      setUploadProgress((prev) => {
        const next = [...prev];
        next[index] = 100;
        return next;
      });
    }
  };

  const pickImage = async (index: number) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      showToast("Gallery permission is required to choose photos.");
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
      setUploadProgress((prev) => {
        const next = [...prev];
        next[index] = 100;
        return next;
      });
    }
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

  const handleNextStep = async () => {
    if (!title || !author || !price || !condition) {
      showToast("Please fill all the required fields");
      return;
    }

    if (!isUploadValid()) {
      showToast(
        "Please upload all required photos (Front Cover, Back Cover, Spine, Middle Page) and wait for upload to complete."
      );
      return;
    }

    const success = await getCurrentLocation();

    if (!success) return;

    setCurrentStep(2);
  };

  const createListingMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/api/v1/marketplace/listings/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      showToast("Book listed successfully");
      resetForm();
    },
    onError: (err: any) => {
      console.error("Failed to list book:", err);
      showToast(err.response?.data?.detail || "Failed to list book.");
    },
  });

  const updateListingMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.patch(`/api/v1/marketplace/listings/${editListingId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      showToast("Book listing updated successfully");
      resetForm();
    },
    onError: (err: any) => {
      console.error("Failed to update book:", err);
      showToast(err.response?.data?.detail || "Failed to update book.");
    },
  });

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setCondition("good");
    setNotes("");
    setPrice("");
    setCategory("");
    setCategoryInput("");
    setImages([null, null, null, null, null, null]);
    setUploadProgress([0, 0, 0, 0, 0, 0]);
    setDescription("");
    setCurrentStep(1);
    navigation.reset({ index: 0, routes: [{ name: "Create" as never }] });
  };

  const handleFinalSubmit = () => {
    const formData = new FormData();
    formData.append("price", price);
    
    const conditionUpper = condition === "like_new" ? "LIKE_NEW" : condition.toUpperCase();
    formData.append("condition", conditionUpper);
    formData.append("condition_notes", notes || description || "");
    
    if (location) {
      formData.append("latitude", location.latitude.toFixed(6));
      formData.append("longitude", location.longitude.toFixed(6));
    }
    
    if (bookId) {
      formData.append("book_id", String(bookId));
    } else {
      formData.append("title", title);
      formData.append("author", author);
      if (categoryInput) {
        formData.append("category", categoryInput);
      }
    }

    const appendImageFile = (key: string, uri: string) => {
      const name = uri.split("/").pop() || `${key}.jpg`;
      const type = "image/jpeg";
      formData.append(key, {
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        name,
        type,
      } as any);
    };

    if (images[0] && !images[0].startsWith("http")) appendImageFile("front_cover", images[0]);
    if (images[1] && !images[1].startsWith("http")) appendImageFile("back_cover", images[1]);
    if (images[2] && !images[2].startsWith("http")) appendImageFile("spine", images[2]);
    if (images[3] && !images[3].startsWith("http")) appendImageFile("middle_page", images[3]);
    if (images[4] && !images[4].startsWith("http")) appendImageFile("damage_1", images[4]);
    if (images[5] && !images[5].startsWith("http")) appendImageFile("damage_2", images[5]);

    if (editListingId) {
      updateListingMutation.mutate(formData);
    } else {
      createListingMutation.mutate(formData);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      {/* Custom Header matching screenshot exactly */}
      <Header title="Listing" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!showSuggestions && !showCategoryDropdown}
        keyboardShouldPersistTaps="handled"
      >
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
                                  <View
                                    style={[
                                      styles.progressBarFill,
                                      {
                                        width: `${progress}%`,
                                      },
                                    ]}
                                  />
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
                            <Text style={styles.slotRequiredIndicator}>{slot.required ? "Required" : "If Any"}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
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
            <View style={[styles.sectionWrapper, (showSuggestions || showCategoryDropdown) && { zIndex: 10 }]}>
              <View style={styles.sectionHeaderRowWithNumber}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>1</Text>
                </View>
                <Text style={styles.sectionTitleBlack}>Basic Info</Text>
              </View>

              <View style={styles.cardContainer}>
                <View style={[styles.inputGroup, showSuggestions && { zIndex: 10 }]}>
                  <Text style={styles.inputLabel}>
                    Book Title <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <Input
                    placeholder="Book Title"
                    value={title}
                    onChangeText={(text) => {
                      setTitle(text);
                      setShowSuggestions(true);
                    }}
                    autoCapitalize="words"
                  />
                  {showSuggestions && title.trim().length >= 2 && (
                    <View style={styles.suggestionsContainer}>
                      {isLoadingSuggestions ? (
                        <View style={styles.suggestionsLoading}>
                          <ActivityIndicator size="small" color={COLORS.primary} />
                          <Text style={styles.suggestionsLoadingText}>Loading suggestions...</Text>
                        </View>
                      ) : (
                        <ScrollView
                          style={{ maxHeight: rem(15) }}
                          keyboardShouldPersistTaps="handled"
                          nestedScrollEnabled={true}
                        >
                          {searchSuggestions.map((item: any, index: number) => {
                            const isThisItemLoading =
                              loadingSuggestionKey === item.openlibrary_key ||
                              (item.is_local && loadingSuggestionKey === String(item.id));
                            return (
                              <TouchableOpacity
                                key={item.id || item.openlibrary_key || index}
                                style={styles.suggestionItem}
                                onPress={() => handleSelectSuggestion(item)}
                                disabled={loadingSuggestionKey !== null}
                              >
                                <Image
                                  source={{
                                    uri:
                                      item.cover_url ||
                                      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&auto=format&fit=crop",
                                  }}
                                  style={styles.suggestionItemCover}
                                  contentFit="cover"
                                />
                                <View style={styles.suggestionItemContent}>
                                  <Text style={styles.suggestionItemTitle} numberOfLines={1}>
                                    {item.title}
                                  </Text>
                                  <Text style={styles.suggestionItemAuthor} numberOfLines={1}>
                                    by {item.authors?.join(", ") || "Unknown Author"}
                                  </Text>
                                  <View style={styles.suggestionItemMetaRow}>
                                    {item.published_year && (
                                      <Text style={styles.suggestionItemMetaText}>Year: {item.published_year}</Text>
                                    )}
                                  </View>
                                </View>
                                {isThisItemLoading && (
                                  <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />
                                )}
                              </TouchableOpacity>
                            );
                          })}

                          {/* Manual insertion item */}
                          <TouchableOpacity
                            style={styles.manualSuggestionItem}
                            onPress={handleManualInsert}
                            disabled={loadingSuggestionKey !== null}
                          >
                            <View style={styles.manualSuggestionIconWrapper}>
                              {loadingSuggestionKey === "manual" ? (
                                <ActivityIndicator size="small" color={COLORS.blue} />
                              ) : (
                                <Ionicons name="create-outline" size={20} color={COLORS.blue} />
                              )}
                            </View>
                            <View style={styles.suggestionItemContent}>
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
                  <Text style={styles.inputLabel}>
                    Author<Text style={styles.asterisk}>*</Text>
                  </Text>
                  <Input placeholder="Author" value={author} onChangeText={setAuthor} autoCapitalize="words" />
                </View>
                <View style={[styles.inputGroup, showCategoryDropdown && { zIndex: 10 }]}>
                  <Text style={styles.inputLabel}>
                    Category<Text style={styles.asterisk}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.dropdownSelector}
                    activeOpacity={0.8}
                    onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    <Text style={[styles.dropdownSelectorText, !categoryInput && styles.dropdownPlaceholderText]}>
                      {categoryInput || "Select Category"}
                    </Text>
                    <Ionicons
                      name={showCategoryDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>

                  {showCategoryDropdown && (
                    <View style={styles.suggestionsContainer}>
                      <ScrollView
                        style={{ maxHeight: rem(10) }}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        scrollEnabled={true}
                      >
                        {(availableCategories.length > 0
                          ? availableCategories
                          : BOOK_CATEGORIES.map((c) => c.label)
                        ).map((cat: string, index: number) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => {
                              setCategoryInput(cat);
                              setShowCategoryDropdown(false);
                              const matched = BOOK_CATEGORIES.find((c) => c.label.toLowerCase() === cat.toLowerCase());
                              setCategory(matched ? matched.id : "other");
                            }}
                          >
                            <View style={styles.suggestionItemContent}>
                              <Text style={styles.suggestionItemTitle}>{cat}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
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
                  <Text style={styles.inputLabel}>
                    Condition <Text style={styles.asterisk}>*</Text>
                  </Text>
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
                  <Text style={styles.inputLabel}>
                    Price <Text style={styles.asterisk}>*</Text>
                  </Text>
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
            {/* Step 3 Section: Description & Note */}
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
                    containerStyle={{
                      marginVertical: 0,
                      marginTop: SPACING.sm,
                    }}
                    style={{ height: rem(9.375) }}
                  />
                </View>
              </View>
            </View>
            {location && (
              <View style={styles.locationContainer}>
                <View style={styles.locationCard}>
                  <Ionicons name="location" size={24} color={COLORS.primary} />

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.locationTitle}>Pickup Location</Text>
                    <Text style={styles.locationText}>{location.address}</Text>
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
                    provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
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
              <Button title="Skip" onPress={handleFinalSubmit} variant="outline" style={styles.skipBtn} />
              <Button title="Submit" onPress={handleFinalSubmit} variant="primary" style={styles.submitBtnContainer} />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    flexDirection: "row",
    alignItems: "center",
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  previewContainer: {
    paddingVertical: 0,
    borderWidth: 0,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 14,
  },
  removeImageBtn: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.completeTransparency,
    width: 32,
    height: 32,
    borderRadius: 16,
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
  sectionWrapper: {
    marginBottom: SPACING.xl,
  },
  sectionHeaderRowWithNumber: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 5,
  },
  conditionBox: {
    width: "48%",
    backgroundColor: COLORS.grayLight,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },
  conditionBoxActive: {
    backgroundColor: COLORS.grayLight,
    borderColor: COLORS.blue, // Blue border
  },
  conditionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
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
    color: "#3B82F6",
  },
  notesLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  addBtnText: {
    color: COLORS.primary,
    fontFamily: FONTS.manrope.bold,
    fontSize: rem(0.8125),
    marginLeft: 2,
  },
  priceInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.grayLight,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 4,
  },
  rupeeIconWrapper: {
    backgroundColor: COLORS.green, // Green color from screenshot
    width: 50,
    height: 35,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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
    position: "absolute",
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
    flexDirection: "row",
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
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
  },
  mapContainer: {
    height: 150,
    width: "100%",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  map: {
    position: "absolute",
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    position: "absolute",
    top: 85,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    zIndex: 1000,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  suggestionsLoading: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    justifyContent: "center",
  },
  suggestionsLoadingText: {
    marginLeft: 8,
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  suggestionItemCover: {
    width: 48,
    height: 64,
    borderRadius: 4,
    backgroundColor: COLORS.grayLight,
    marginRight: 12,
  },
  suggestionItemContent: {
    flex: 1,
    justifyContent: "center",
  },
  suggestionItemTitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
  },
  suggestionItemAuthor: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  suggestionItemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  suggestionItemMetaText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  sourceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceBadgeLocal: {
    backgroundColor: "#E6F4EA",
  },
  sourceBadgeExternal: {
    backgroundColor: "#F1F3F4",
  },
  sourceBadgeText: {
    fontSize: rem(0.5625),
    fontFamily: FONTS.manrope.bold,
  },
  sourceBadgeTextLocal: {
    color: "#137333",
  },
  sourceBadgeTextExternal: {
    color: "#5F6368",
  },
  manualSuggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    backgroundColor: "#F5F9FF",
  },
  manualSuggestionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E6F0FF",
    alignItems: "center",
    justifyContent: "center",
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
  dropdownSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
  },
  dropdownSelectorText: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.black,
  },
  dropdownPlaceholderText: {
    color: COLORS.textMuted,
  },
});

import { api } from "@/api/clients";
import { Button } from "@/components/ui/Button";
import Header from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router, useNavigation, useRoute } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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

// ────────────────────────────────────────────────────────────────────
// Helpers & Constants
// ────────────────────────────────────────────────────────────────────

const showToast = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("Notice", message);
  }
};

const CONDITIONS = [
  { id: "like_new", label: "Like New", icon: "decagram-outline" as any, color: COLORS.green },
  { id: "good", label: "Good", icon: "book-open-outline" as any, color: COLORS.primary },
  { id: "fair", label: "Fair", icon: "file-document-outline" as any, color: COLORS.yellow },
  { id: "poor", label: "Poor", icon: "alert-circle-outline" as any, color: COLORS.red },
];

const SLOTS_CONFIG = [
  { label: "Front Cover", required: true, icon: "book-open-variant" as const },
  { label: "Back Cover", required: true, icon: "book-open" as const },
  { label: "Spine", required: true, icon: "book-minus" as const },
  { label: "Middle Page", required: true, icon: "book-open-outline" as const },
  { label: "Damage 1", required: false, icon: "alert-circle-outline" as const },
  { label: "Damage 2", required: false, icon: "alert-circle-outline" as const },
];

const STEP_LABELS = ["Book Info", "Price & Condition", "Location"];

// ────────────────────────────────────────────────────────────────────
// Step Indicator
// ────────────────────────────────────────────────────────────────────

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <View style={stepStyles.container}>
    {STEP_LABELS.map((label, idx) => {
      const stepNum = idx + 1;
      const isActive = stepNum === currentStep;
      const isDone = stepNum < currentStep;
      return (
        <React.Fragment key={idx}>
          <View style={stepStyles.stepItem}>
            <View style={[stepStyles.circle, isActive && stepStyles.circleActive, isDone && stepStyles.circleDone]}>
              {isDone ? (
                <Ionicons name="checkmark" size={14} color={COLORS.white} />
              ) : (
                <Text style={[stepStyles.circleText, (isActive || isDone) && stepStyles.circleTextActive]}>
                  {stepNum}
                </Text>
              )}
            </View>
            <Text style={[stepStyles.label, isActive && stepStyles.labelActive, isDone && stepStyles.labelDone]}>
              {label}
            </Text>
          </View>
          {idx < STEP_LABELS.length - 1 && <View style={[stepStyles.line, isDone && stepStyles.lineDone]} />}
        </React.Fragment>
      );
    })}
  </View>
);

const stepStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  stepItem: { alignItems: "center", flex: 1 },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.grayHeavvy,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  circleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  circleDone: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.green,
  },
  circleText: {
    fontSize: 12,
    fontFamily: FONTS.manrope.bold,
    color: COLORS.grayHeavvy,
  },
  circleTextActive: { color: COLORS.white },
  label: {
    fontSize: 10,
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  labelActive: { color: COLORS.primary, fontFamily: FONTS.manrope.bold },
  labelDone: { color: COLORS.green },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.grayHeavvy,
    marginBottom: 16,
    marginHorizontal: -4,
  },
  lineDone: { backgroundColor: COLORS.green },
});

// ────────────────────────────────────────────────────────────────────
// Success Overlay
// ────────────────────────────────────────────────────────────────────

const SuccessOverlay = ({ onViewListing, onGoHome }: { onViewListing: () => void; onGoHome: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.spring(checkScale, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[successStyles.overlay, { opacity: opacityAnim }]}>
      <Animated.View style={[successStyles.card, { transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={[successStyles.checkCircle, { transform: [{ scale: checkScale }] }]}>
          <Ionicons name="checkmark" size={48} color={COLORS.white} />
        </Animated.View>
        <Text style={successStyles.title}>Listed Successfully!</Text>
        <Text style={successStyles.subtitle}>Your book is now visible to buyers nearby.</Text>
        <View style={successStyles.actions}>
          <Button
            title="View My Listings"
            onPress={onViewListing}
            variant="primary"
            style={{ borderRadius: 14, marginBottom: 8 }}
          />
          <Button title="Back to Home" onPress={onGoHome} variant="outline" style={{ borderRadius: 14 }} />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const successStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  card: {
    width: "85%",
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: "center",
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: rem(1.375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  actions: { width: "100%" },
});

// ────────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────────

const CreateScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editListingId = route.params?.editListingId;

  // ── State ──
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Step 1 – Book Info
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [genreInput, setGenreInput] = useState("");
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [bookId, setBookId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedTitle, setDebouncedTitle] = useState("");
  const [loadingSuggestionKey, setLoadingSuggestionKey] = useState<string | null>(null);

  // Step 2 – Condition & Price
  const [condition, setCondition] = useState("good");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("");

  // Step 3 – Description & Location
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // ── Genre fallback list ──
  const BOOK_GENRES = [
    "Science Fiction",
    "Romance",
    "Self Help",
    "Biography",
    "Business",
    "Engineering",
    "Medical",
    "Law",
    "Competitive Exams",
    "Other",
  ];

  // ── Edit Mode Hydration ──
  const { data: editListingData } = useQuery({
    queryKey: ["edit-listing", editListingId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/marketplace/listings/${editListingId}/`);
      return response.data;
    },
    enabled: !!editListingId,
  });

  useEffect(() => {
    if (editListingData) {
      setTitle(editListingData.book.title || "");
      setAuthor(editListingData.book.authors?.map((a: any) => a.name).join(", ") || "");
      setPrice(String(parseFloat(editListingData.price)));
      setCondition(
        editListingData.condition.toLowerCase() === "like_new" ? "like_new" : editListingData.condition.toLowerCase()
      );
      setNotes(editListingData.condition_notes || "");
      setBookId(editListingData.book.id || null);

      const genreNames = editListingData.book.genres?.map((g: any) => (typeof g === "string" ? g : g.name)) || [];
      if (genreNames.length > 0) {
        setGenreInput(genreNames[0]);
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

  // ── Debounced Book Title Search ──
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTitle(title), 500);
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

  // ── Genre list from backend ──
  const { data: backendGenres = [] } = useQuery({
    queryKey: ["genreList"],
    queryFn: async () => {
      const response = await api.get("/api/v1/book/genres/");
      return (response.data?.results || response.data || []).map((g: any) => g.name);
    },
  });

  const genreOptions: string[] =
    backendGenres.length > 0 ? backendGenres : availableGenres.length > 0 ? availableGenres : BOOK_GENRES;

  // ── Import & Manual Create Mutations ──
  const importMutation = useMutation({
    mutationFn: async ({ openlibraryKey, genreVal }: { openlibraryKey: string; genreVal: string | null }) => {
      const response = await api.post("/api/v1/book/import-openlibrary/", {
        openlibrary_key: openlibraryKey,
        genre: genreVal,
      });
      return response.data;
    },
    onSuccess: (importedBook) => {
      setTitle(importedBook.title || "");
      setAuthor(importedBook.authors?.join(", ") || "");
      setBookId(importedBook.book_id || null);
      const responseGenres = importedBook.genres || [];
      if (responseGenres.length > 0) {
        setAvailableGenres(responseGenres);
        setGenreInput(responseGenres[0]);
      }
      setLoadingSuggestionKey(null);
      setShowSuggestions(false);
      showToast("Book imported successfully");
    },
    onError: (err: any) => {
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
      const responseGenres = manualBook.genres || [];
      if (responseGenres.length > 0) {
        setAvailableGenres(responseGenres);
        setGenreInput(responseGenres[0]);
      }
      setLoadingSuggestionKey(null);
      setShowSuggestions(false);
      showToast("Manual book entry created");
    },
    onError: (err: any) => {
      showToast(err.response?.data?.detail || "Failed to create manual book.");
      setLoadingSuggestionKey(null);
    },
  });

  const handleSelectSuggestion = (suggestion: any) => {
    if (suggestion.is_local && suggestion.id) {
      setShowSuggestions(false);
      setTitle(suggestion.title || "");
      setAuthor(suggestion.authors?.join(", ") || "");
      setBookId(suggestion.id);
      const responseGenres = suggestion.genres || [];
      if (responseGenres.length > 0) {
        setAvailableGenres(responseGenres);
        setGenreInput(responseGenres[0]);
      }
      showToast("Selected local book record");
    } else {
      setLoadingSuggestionKey(suggestion.openlibrary_key);
      importMutation.mutate({ openlibraryKey: suggestion.openlibrary_key, genreVal: null });
    }
  };

  const handleManualInsert = () => {
    setLoadingSuggestionKey("manual");
    manualCreateMutation.mutate({ titleVal: title, authorVal: author || "Unknown" });
  };

  // ── Image Handlers ──
  const handleImagePick = (index: number) => {
    Alert.alert("Upload Photo", `Upload ${SLOTS_CONFIG[index].label}`, [
      { text: "Take Photo", onPress: () => takePhoto(index) },
      { text: "Choose from Gallery", onPress: () => pickImage(index) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const takePhoto = async (index: number) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      showToast("Camera permission is required to take photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [3, 4], quality: 0.6 });
    if (!result.canceled && result.assets?.length > 0) {
      setImages((prev) => {
        const next = [...prev];
        next[index] = result.assets[0].uri;
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
    if (!permissionResult.granted) {
      showToast("Gallery permission is required to choose photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.6,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setImages((prev) => {
        const next = [...prev];
        next[index] = result.assets[0].uri;
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
    if (images[index]) {
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

  const isSlotValid = (index: number) => !!images[index] && uploadProgress[index] === 100;
  const isUploadValid = () => isSlotValid(0) && isSlotValid(1) && isSlotValid(2) && isSlotValid(3);

  // ── Location ──
  const getCurrentLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showToast("Location permission is required to fetch pickup address.");
        return false;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
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

  // ── Step Navigation ──
  const handleStep1Next = () => {
    if (!title.trim()) {
      showToast("Please enter the book title");
      return;
    }
    if (!author.trim()) {
      showToast("Please enter the author name");
      return;
    }
    if (!isUploadValid()) {
      showToast("Please upload all 4 required photos (Front Cover, Back Cover, Spine, Middle Page).");
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Next = async () => {
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      showToast("Please enter a valid price");
      return;
    }
    // Fetch location before moving to step 3
    const success = await getCurrentLocation();
    if (!success) return;
    setCurrentStep(3);
  };

  // ── Submit ──
  const createListingMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/api/v1/marketplace/listings/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => setShowSuccess(true),
    onError: (err: any) => showToast(err.response?.data?.detail || "Failed to list book."),
  });

  const updateListingMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.patch(`/api/v1/marketplace/listings/${editListingId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => setShowSuccess(true),
    onError: (err: any) => showToast(err.response?.data?.detail || "Failed to update book."),
  });

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setCondition("good");
    setNotes("");
    setPrice("");
    setGenre("");
    setGenreInput("");
    setDescription("");
    setImages([null, null, null, null, null, null]);
    setUploadProgress([0, 0, 0, 0, 0, 0]);
    setCurrentStep(1);
    setShowSuccess(false);
    setLocation(null);
    setBookId(null);
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
      if (genreInput) formData.append("genre", genreInput);
    }

    const appendImageFile = (key: string, uri: string) => {
      const name = uri.split("/").pop() || `${key}.jpg`;
      formData.append(key, {
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        name,
        type: "image/jpeg",
      } as any);
    };
    if (images[0] && !images[0].startsWith("http")) appendImageFile("front_cover", images[0]);
    if (images[1] && !images[1].startsWith("http")) appendImageFile("back_cover", images[1]);
    if (images[2] && !images[2].startsWith("http")) appendImageFile("spine", images[2]);
    if (images[3] && !images[3].startsWith("http")) appendImageFile("middle_page", images[3]);
    if (images[4] && !images[4].startsWith("http")) appendImageFile("damage_1", images[4]);
    if (images[5] && !images[5].startsWith("http")) appendImageFile("damage_2", images[5]);

    if (editListingId) updateListingMutation.mutate(formData);
    else createListingMutation.mutate(formData);
  };

  const isSubmitting = createListingMutation.isPending || updateListingMutation.isPending;

  // ────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <Header title={editListingId ? "Edit Listing" : "List a Book"} />
      <StepIndicator currentStep={currentStep} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!showSuggestions && !showGenreDropdown}
      >
        {/* ─── Step 1: Book Info ────────────────────────────────────── */}
        {currentStep === 1 && (
          <>
            {/* Photos */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="camera-outline" size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Book Photos</Text>
              </View>
              <View style={styles.photoGrid}>
                {SLOTS_CONFIG.map((slot, index) => {
                  const imgUri = images[index];
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.photoSlot,
                        slot.required && !imgUri && styles.photoSlotRequired,
                        imgUri && styles.photoSlotFilled,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleSlotPress(index)}
                    >
                      {imgUri ? (
                        <View style={{ flex: 1, width: "100%" }}>
                          <Image source={{ uri: imgUri }} contentFit="cover" style={StyleSheet.absoluteFillObject} />
                          <View style={styles.photoBadge}>
                            <Text style={styles.photoBadgeText}>{slot.label}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.photoRemoveBtn}
                            onPress={(e) => {
                              e.stopPropagation();
                              setImages((prev) => {
                                const n = [...prev];
                                n[index] = null;
                                return n;
                              });
                              setUploadProgress((prev) => {
                                const n = [...prev];
                                n[index] = 0;
                                return n;
                              });
                            }}
                          >
                            <Ionicons name="close-circle" size={20} color="rgba(0,0,0,0.5)" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.photoSlotEmpty}>
                          <MaterialCommunityIcons
                            name={slot.icon}
                            size={22}
                            color={slot.required ? COLORS.primary : COLORS.textMuted}
                          />
                          <Text style={[styles.photoSlotLabel, slot.required && { color: COLORS.primary }]}>
                            {slot.label}
                          </Text>
                          <Text style={styles.photoSlotHint}>{slot.required ? "Required" : "If Any"}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Basic Info */}
            <View style={[styles.sectionCard, (showSuggestions || showGenreDropdown) && { zIndex: 10 }]}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Book Details</Text>
              </View>

              {/* Title with autocomplete */}
              <View style={[styles.fieldGroup, showSuggestions && { zIndex: 10 }]}>
                <Text style={styles.fieldLabel}>
                  Book Title <Text style={styles.asterisk}>*</Text>
                </Text>
                <Input
                  placeholder="Search or type book title"
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    setShowSuggestions(true);
                  }}
                  autoCapitalize="words"
                  containerStyle={{ marginVertical: 0 }}
                />
                {showSuggestions && title.trim().length >= 2 && (
                  <View style={styles.suggestionsContainer}>
                    {isLoadingSuggestions ? (
                      <View style={styles.suggestionsLoading}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={styles.suggestionsLoadingText}>Searching…</Text>
                      </View>
                    ) : (
                      <ScrollView
                        style={{ maxHeight: rem(12) }}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled
                      >
                        {searchSuggestions.map((item: any, idx: number) => {
                          const isThisLoading =
                            loadingSuggestionKey === item.openlibrary_key ||
                            (item.is_local && loadingSuggestionKey === String(item.id));
                          return (
                            <TouchableOpacity
                              key={item.id || item.openlibrary_key || idx}
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
                                style={styles.suggestionCover}
                                contentFit="cover"
                              />
                              <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.suggestionTitle} numberOfLines={1}>
                                  {item.title}
                                </Text>
                                <Text style={styles.suggestionAuthor} numberOfLines={1}>
                                  by {item.authors?.join(", ") || "Unknown"}
                                </Text>
                              </View>
                              {isThisLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
                            </TouchableOpacity>
                          );
                        })}
                        {/* Manual insert */}
                        <TouchableOpacity
                          style={[styles.suggestionItem, { borderTopWidth: 1, borderTopColor: COLORS.grayLight }]}
                          onPress={handleManualInsert}
                          disabled={loadingSuggestionKey !== null}
                        >
                          <View style={styles.manualIconWrap}>
                            {loadingSuggestionKey === "manual" ? (
                              <ActivityIndicator size="small" color={COLORS.blue} />
                            ) : (
                              <Ionicons name="create-outline" size={18} color={COLORS.blue} />
                            )}
                          </View>
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={[styles.suggestionTitle, { color: COLORS.blue }]} numberOfLines={1}>
                              Add "{title}" manually
                            </Text>
                            <Text style={styles.suggestionAuthor}>Not found? Insert details manually.</Text>
                          </View>
                        </TouchableOpacity>
                      </ScrollView>
                    )}
                  </View>
                )}
              </View>

              {/* Author */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Author <Text style={styles.asterisk}>*</Text>
                </Text>
                <Input
                  placeholder="Author name"
                  value={author}
                  onChangeText={setAuthor}
                  autoCapitalize="words"
                  containerStyle={{ marginVertical: 0 }}
                />
              </View>

              {/* Genre Dropdown */}
              <View style={[styles.fieldGroup, showGenreDropdown && { zIndex: 10 }]}>
                <Text style={styles.fieldLabel}>Genre</Text>
                <TouchableOpacity
                  style={styles.dropdownSelector}
                  activeOpacity={0.8}
                  onPress={() => setShowGenreDropdown(!showGenreDropdown)}
                >
                  <Text style={[styles.dropdownText, !genreInput && { color: COLORS.textMuted }]}>
                    {genreInput || "Select Genre"}
                  </Text>
                  <Ionicons
                    name={showGenreDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
                {showGenreDropdown && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView style={{ maxHeight: rem(10) }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                      {genreOptions.map((g: string, idx: number) => (
                        <TouchableOpacity
                          key={idx}
                          style={[styles.suggestionItem, genreInput === g && { backgroundColor: COLORS.secondary }]}
                          onPress={() => {
                            setGenreInput(g);
                            setGenre(g);
                            setShowGenreDropdown(false);
                          }}
                        >
                          <Text style={styles.suggestionTitle}>{g}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            {/* Next */}
            <Button
              title="Continue"
              onPress={handleStep1Next}
              variant="primary"
              style={{ borderRadius: 14, marginTop: SPACING.sm }}
            />
          </>
        )}

        {/* ─── Step 2: Condition & Price ────────────────────────────── */}
        {currentStep === 2 && (
          <>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="star-outline" size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Book Condition</Text>
              </View>
              <View style={styles.conditionGrid}>
                {CONDITIONS.map((item) => {
                  const isActive = condition === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.conditionCard,
                        isActive && { borderColor: item.color, backgroundColor: `${item.color}12` },
                      ]}
                      onPress={() => setCondition(item.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.conditionIconWrap, isActive && { backgroundColor: item.color }]}>
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={22}
                          color={isActive ? COLORS.white : COLORS.textMuted}
                        />
                      </View>
                      <Text
                        style={[
                          styles.conditionLabel,
                          isActive && { color: item.color, fontFamily: FONTS.manrope.bold },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Notes & Price</Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Condition Notes (Optional)</Text>
                <Input
                  placeholder="e.g. Minor highlighting on pages 12–15"
                  value={notes}
                  onChangeText={setNotes}
                  containerStyle={{ marginVertical: 0 }}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Price <Text style={styles.asterisk}>*</Text>
                </Text>
                <Input
                  placeholder="Enter your price"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  containerStyle={{ marginVertical: 0 }}
                  prefix={
                    <View style={styles.rupeeBadge}>
                      <Text style={styles.rupeeText}>₹</Text>
                    </View>
                  }
                />
              </View>
            </View>

            <View style={styles.actionRow}>
              <Button
                title="Back"
                onPress={() => setCurrentStep(1)}
                variant="outline"
                style={{ flex: 1, borderRadius: 14, marginRight: 8 }}
              />
              <Button
                title="Continue"
                onPress={handleStep2Next}
                variant="primary"
                loading={isFetchingLocation}
                style={{ flex: 1.5, borderRadius: 14 }}
              />
            </View>
          </>
        )}

        {/* ─── Step 3: Description & Location ──────────────────────── */}
        {currentStep === 3 && (
          <>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Description</Text>
              </View>
              <Input
                placeholder="Add a detailed description of the book…"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                containerStyle={{ marginVertical: 0 }}
                style={{ height: rem(7.5) }}
              />
            </View>

            {location && (
              <View style={styles.sectionCard}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location" size={22} color={COLORS.primary} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.locationTitle}>Pickup Location</Text>
                    <Text style={styles.locationAddress} numberOfLines={2}>
                      {location.address}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={getCurrentLocation}
                    disabled={isFetchingLocation}
                    style={styles.refreshBtn}
                  >
                    {isFetchingLocation ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Ionicons name="refresh" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.mapWrapper}>
                  <MapView
                    key={`${location.latitude}-${location.longitude}`}
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
                    <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
                      <View style={styles.markerDot}>
                        <Ionicons name="location" size={22} color={COLORS.white} />
                      </View>
                    </Marker>
                  </MapView>
                </View>
              </View>
            )}

            <View style={styles.actionRow}>
              <Button
                title="Back"
                onPress={() => setCurrentStep(2)}
                variant="outline"
                style={{ flex: 1, borderRadius: 14, marginRight: 8 }}
              />
              <Button
                title={editListingId ? "Update Listing" : "List Book"}
                onPress={handleFinalSubmit}
                variant="primary"
                loading={isSubmitting}
                style={{ flex: 1.5, borderRadius: 14 }}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Success Overlay */}
      {showSuccess && (
        <SuccessOverlay
          onViewListing={() => {
            resetForm();
            router.push("/(screens)/MyListings" as any);
          }}
          onGoHome={() => {
            resetForm();
            router.replace("/(tabs)/home");
          }}
        />
      )}
    </View>
  );
};

export default CreateScreen;

// ────────────────────────────────────────────────────────────────────
// STYLES
// ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 140,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
    marginLeft: 8,
  },

  // Photo Grid
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  photoSlot: {
    width: "31%",
    aspectRatio: 0.75,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.grayHeavvy,
    borderStyle: "dashed",
    backgroundColor: COLORS.grayLight,
    overflow: "hidden",
    marginBottom: 10,
  },
  photoSlotRequired: { borderColor: COLORS.primary },
  photoSlotFilled: { borderStyle: "solid", borderColor: COLORS.green, borderWidth: 2 },
  photoSlotEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  photoSlotLabel: {
    fontSize: 10,
    fontFamily: FONTS.manrope.semibold,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  photoSlotHint: {
    fontSize: 8,
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  photoBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 3,
    alignItems: "center",
  },
  photoBadgeText: {
    fontSize: 9,
    fontFamily: FONTS.manrope.bold,
    color: COLORS.white,
  },
  photoRemoveBtn: {
    position: "absolute",
    top: 4,
    right: 4,
  },

  // Fields
  fieldGroup: { marginBottom: SPACING.sm },
  fieldLabel: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.semibold,
    color: COLORS.text,
    marginBottom: 6,
  },
  asterisk: { color: COLORS.red },

  // Dropdown
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
  },
  dropdownText: {
    fontSize: rem(1),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.black,
  },

  // Suggestions / dropdown overlay
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    marginTop: 4,
    zIndex: 100,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: "hidden",
  },
  suggestionsLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.md,
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
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayLight,
  },
  suggestionCover: {
    width: 36,
    height: 48,
    borderRadius: 6,
    backgroundColor: COLORS.grayLight,
  },
  suggestionTitle: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.semibold,
    color: COLORS.black,
  },
  suggestionAuthor: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  manualIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.blueLight,
    alignItems: "center",
    justifyContent: "center",
  },

  // Condition grid
  conditionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  conditionCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.grayHeavvy,
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  conditionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.grayLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  conditionLabel: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.semibold,
    color: COLORS.text,
  },

  // Price prefix
  rupeeBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  rupeeText: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },

  // Location
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  locationTitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
  },
  locationAddress: {
    fontSize: rem(0.75),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    alignItems: "center",
    justifyContent: "center",
  },
  mapWrapper: {
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
  },
  map: { ...StyleSheet.absoluteFillObject },
  markerDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Action buttons
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
});

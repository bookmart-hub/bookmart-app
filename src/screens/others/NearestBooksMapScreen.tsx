import BooksBottomSheet from "@/components/map/BooksBottomSheet";
import MapMarker from "@/components/map/MapMarker";
import UserLocationButton from "@/components/map/UserLocationButton";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { MOCK_CATEGORIES, MOCK_NEAREST_BOOKS, NearestBook } from "@/data/nearestBooksMockData";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE, Region } from "react-native-maps";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// React Error Boundary for catching map rendering crashes
class MapErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("MapErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.container, styles.errorContainer]}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.primary} />
          <Text style={styles.errorText}>Something went wrong loading the map.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => this.setState({ hasError: false })}>
            <Text style={styles.retryButtonText}>Reload Map</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const { width, height } = Dimensions.get("window");

// Mock User Location (Naihati Railway Station)
const MOCK_USER_LOCATION = {
  latitude: 22.8943,
  longitude: 88.423,
};

// Static categories calculation outside the component to prevent recreation on every render
const EXTENDED_CATEGORIES = [{ id: "all", name: "All" }, ...MOCK_CATEGORIES];

// Memoized Category Chip component to prevent redundant chip rendering
const CategoryChip = React.memo(
  ({
    cat,
    isActive,
    onPress,
  }: {
    cat: { id: string; name: string };
    isActive: boolean;
    onPress: (id: string) => void;
  }) => {
    const handlePress = useCallback(() => {
      onPress(cat.id);
    }, [cat.id, onPress]);

    return (
      <TouchableOpacity
        style={[styles.categoryChip, isActive && styles.categoryChipActive]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{cat.name}</Text>
      </TouchableOpacity>
    );
  }
);

// Memoized Map Marker Wrapper component
const MapMarkerWrapper = React.memo(
  ({
    book,
    isSelected,
    hasSelection,
    onPress,
  }: {
    book: NearestBook;
    isSelected: boolean;
    hasSelection: boolean;
    onPress: (book: NearestBook) => void;
  }) => {
    const [tracksViewChanges, setTracksViewChanges] = useState(true);

    useEffect(() => {
      setTracksViewChanges(true);
      const timer = setTimeout(() => {
        setTracksViewChanges(false);
      }, 350);
      return () => clearTimeout(timer);
    }, [isSelected, hasSelection]);

    const handlePress = useCallback(() => {
      onPress(book);
    }, [book, onPress]);

    return (
      <Marker
        coordinate={{ latitude: book.latitude!, longitude: book.longitude! }}
        onPress={handlePress}
        tracksViewChanges={tracksViewChanges}
      >
        <MapMarker book={book} isSelected={isSelected} hasSelection={hasSelection} />
      </Marker>
    );
  }
);

const NearestBooksMapScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mapRef = useRef<MapView>(null);
  const prevLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);

  const [bottomSheetVisible, setBottomSheetVisible] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(route.params?.categoryId || "all");

  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  // Location permission & status flags
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<"checking" | "granted" | "denied">(
    "checking"
  );
  const [locationServicesEnabled, setLocationServicesEnabled] = useState<boolean>(true);
  const [isUsingMockLocation, setIsUsingMockLocation] = useState<boolean>(false);

  const handleCategoryPress = useCallback((categoryId: string) => {
    setActiveCategoryId(categoryId);
    setSelectedBookId(null);
  }, []);

  const filteredBooks = useMemo(() => {
    let books = MOCK_NEAREST_BOOKS;
    if (activeCategoryId !== "all") {
      books = books.filter((b) => b.categoryId === activeCategoryId);
    }
    return books;
  }, [activeCategoryId]);

  // OSRM route fetcher
  useEffect(() => {
    if (selectedBookId && userLocation) {
      const book = filteredBooks.find((b) => b.id === selectedBookId);
      if (book?.latitude && book?.longitude) {
        fetch(
          `https://router.project-osrm.org/route/v1/driving/${userLocation.longitude},${userLocation.latitude};${book.longitude},${book.latitude}?overview=full&geometries=geojson`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.routes && data.routes.length > 0) {
              const coords = data.routes[0].geometry.coordinates.map((coord: any) => ({
                latitude: coord[1],
                longitude: coord[0],
              }));
              setRouteCoords(coords);

              const distKm = (data.routes[0].distance / 1000).toFixed(1);
              const durMin = Math.round(data.routes[0].duration / 60);
              setRouteInfo({ distance: `${distKm} km`, duration: `${durMin} min` });
            }
          })
          .catch((err) => console.log("OSRM Error:", err));
      }
    } else {
      setRouteCoords([]);
      setRouteInfo(null);
    }
  }, [selectedBookId, userLocation, filteredBooks]);

  // Robust location requester with permissions, availability check and fallback configuration
  const requestLocation = useCallback(async () => {
    try {
      setLocationPermissionStatus("checking");
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      setLocationServicesEnabled(servicesEnabled);

      if (!servicesEnabled) {
        console.warn("Location services disabled. Falling back to mock location.");
        setIsUsingMockLocation(true);
        setUserLocation(MOCK_USER_LOCATION);
        setLocationPermissionStatus("denied");
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionStatus(status === "granted" ? "granted" : "denied");

      if (status !== "granted") {
        console.warn("Location permission denied. Falling back to mock location.");
        setIsUsingMockLocation(true);
        setUserLocation(MOCK_USER_LOCATION);
        return;
      }

      let location = null;
      try {
        // Try fast last known position first
        location = await Location.getLastKnownPositionAsync({});
        if (!location) {
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }
      } catch (err) {
        console.error("Failed to get device current location coordinate:", err);
      }

      if (location && location.coords) {
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setIsUsingMockLocation(false);
      } else {
        console.warn("No coordinates retrieved. Falling back to mock location.");
        setIsUsingMockLocation(true);
        setUserLocation(MOCK_USER_LOCATION);
      }
    } catch (error) {
      console.error("Error checking location setup:", error);
      setIsUsingMockLocation(true);
      setUserLocation(MOCK_USER_LOCATION);
      setLocationPermissionStatus("denied");
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Animate map camera to user location when location changes
  useEffect(() => {
    if (
      userLocation &&
      (!prevLocationRef.current ||
        prevLocationRef.current.latitude !== userLocation.latitude ||
        prevLocationRef.current.longitude !== userLocation.longitude)
    ) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
      prevLocationRef.current = userLocation;
    }
  }, [userLocation]);

  const initialRegion: Region = {
    latitude: userLocation?.latitude || MOCK_USER_LOCATION.latitude,
    longitude: userLocation?.longitude || MOCK_USER_LOCATION.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const handleBookPress = useCallback(
    (book: NearestBook) => {
      setSelectedBookId((prev) => {
        const isClosing = prev === book.id;
        const newSelectedId = isClosing ? null : book.id;

        if (!isClosing && book.latitude && book.longitude && userLocation) {
          mapRef.current?.fitToCoordinates(
            [
              { latitude: userLocation.latitude, longitude: userLocation.longitude },
              { latitude: book.latitude, longitude: book.longitude },
            ],
            {
              edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
              animated: true,
            }
          );
        } else if (isClosing && userLocation) {
          mapRef.current?.animateToRegion(
            {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            },
            500
          );
        }
        return newSelectedId;
      });
      setBottomSheetVisible(true);
    },
    [userLocation]
  );

  const handleCenterLocation = useCallback(() => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    }
  }, [userLocation]);

  const handleToggleScreen = useCallback(() => {
    navigation.navigate("NearestBooks", { categoryId: activeCategoryId });
  }, [navigation, activeCategoryId]);

  const handleOpenSettings = useCallback(() => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  }, []);

  if (!userLocation && locationPermissionStatus === "checking") {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Initializing Map...</Text>
      </View>
    );
  }

  const mapProvider = Platform.OS === "android" ? PROVIDER_GOOGLE : undefined;

  return (
    <View style={styles.container}>
      <MapErrorBoundary>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={mapProvider}
          initialRegion={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          mapType="standard"
          userInterfaceStyle="light"
          customMapStyle={[]}
          showsTraffic={false}
          showsIndoors={false}
          showsIndoorLevelPicker={false}
          showsBuildings={false}
        >
          {/* User Location Marker */}
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              zIndex={999}
              tracksViewChanges={true}
            >
              <View style={styles.userLocationMarker}>
                <Ionicons name="locate" size={32} color={COLORS.primary} />
              </View>
            </Marker>
          )}

          {/* 1km Radius Circle */}
          {userLocation && (
            <Circle
              center={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              radius={1000}
              fillColor="rgba(128, 128, 128, 0.2)"
              strokeColor="rgba(128, 128, 128, 0.5)"
              strokeWidth={1}
            />
          )}

          {/* Route Line for selected book */}
          {selectedBookId && routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor={COLORS.primary}
              strokeWidth={4}
              lineJoin="round"
              lineCap="round"
              zIndex={10}
            />
          )}

          {filteredBooks.map((book) => {
            if (!book.latitude || !book.longitude) return null;
            const isSelected = selectedBookId === book.id;
            return (
              <MapMarkerWrapper
                key={book.id}
                book={book}
                isSelected={isSelected}
                hasSelection={!!selectedBookId}
                onPress={handleBookPress}
              />
            );
          })}
        </MapView>
      </MapErrorBoundary>

      <LinearGradient
        colors={["rgba(255,255,255,1)", "rgba(255,255,255,0.8)", "transparent"]}
        style={[styles.headerGradient, { paddingTop: insets.top + SPACING.sm }]}
        pointerEvents="box-none"
      >
        {isUsingMockLocation && (
          <View style={styles.warningBanner}>
            <Ionicons name="location-outline" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
            <Text style={styles.warningBannerText} numberOfLines={1}>
              {!locationServicesEnabled
                ? "GPS is disabled. Showing default location."
                : "Location denied. Showing default location."}
            </Text>
            <TouchableOpacity
              style={styles.warningBannerAction}
              onPress={!locationServicesEnabled ? requestLocation : handleOpenSettings}
              activeOpacity={0.8}
            >
              <Text style={styles.warningBannerActionText}>{!locationServicesEnabled ? "Retry" : "Enable"}</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={COLORS.primary} style={styles.searchIcon} />
            <TextInput style={styles.searchInput} placeholder="Search" placeholderTextColor={COLORS.textMuted} />
          </View>
        </View>

        <View style={styles.categoriesRow}>
          <TouchableOpacity onPress={handleToggleScreen} style={styles.filterBtn}>
            <Ionicons name="list" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {EXTENDED_CATEGORIES.map((cat) => {
              const isActive = activeCategoryId === cat.id;
              return <CategoryChip key={cat.id} cat={cat} isActive={isActive} onPress={handleCategoryPress} />;
            })}
          </ScrollView>
        </View>
      </LinearGradient>

      <View style={[styles.locationButtonContainer, { bottom: insets.bottom + (bottomSheetVisible ? 290 : 80) }]}>
        <UserLocationButton onPress={handleCenterLocation} />
      </View>

      {routeInfo && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.routeBadge, { top: insets.top + 100 }]}>
          <Ionicons name="car" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
          <Text style={styles.routeBadgeText}>
            {routeInfo.duration} ({routeInfo.distance})
          </Text>
        </Animated.View>
      )}

      {!bottomSheetVisible && (
        <TouchableOpacity
          style={[styles.listToggleButton, { bottom: insets.bottom + 20 }]}
          onPress={() => setBottomSheetVisible(true)}
        >
          <Ionicons name="list" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.listToggleText}>List View</Text>
        </TouchableOpacity>
      )}

      <BooksBottomSheet
        books={filteredBooks}
        selectedBookId={selectedBookId}
        onBookPress={handleBookPress}
        userLocation={userLocation}
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
      />
    </View>
  );
};

export default NearestBooksMapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: SPACING.xl,
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginLeft: SPACING.md,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.manrope.medium,
    fontSize: rem(0.875),
    color: COLORS.black,
  },
  categoriesRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginRight: SPACING.sm,
  },
  categoriesScroll: {
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  categoryChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayHeavvy,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontFamily: FONTS.manrope.bold,
    fontSize: rem(0.8125),
    color: COLORS.black,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  locationButtonContainer: {
    position: "absolute",
    right: SPACING.lg,
    zIndex: 10,
  },
  listToggleButton: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 30,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  listToggleText: {
    fontFamily: FONTS.manrope.bold,
    fontSize: rem(0.875),
    color: COLORS.white,
  },
  userLocationMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  routeBadge: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  routeBadgeText: {
    fontFamily: FONTS.manrope.bold,
    fontSize: rem(0.8125),
    color: COLORS.white,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  loadingText: {
    fontFamily: FONTS.manrope.bold,
    fontSize: rem(0.875),
    color: COLORS.primary,
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
  },
  errorText: {
    fontFamily: FONTS.manrope.semibold,
    fontSize: rem(0.875),
    color: COLORS.black,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
  },
  retryButtonText: {
    fontFamily: FONTS.manrope.bold,
    fontSize: rem(0.875),
    color: COLORS.white,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.95)",
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
    borderRadius: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningBannerText: {
    flex: 1,
    fontFamily: FONTS.manrope.semibold,
    fontSize: rem(0.6875),
    color: COLORS.white,
  },
  warningBannerAction: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  warningBannerActionText: {
    fontFamily: FONTS.manrope.bold,
    fontSize: rem(0.625),
    color: "rgb(239, 68, 68)",
  },
});

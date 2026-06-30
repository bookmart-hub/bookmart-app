import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity, TextInput, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Circle, Polyline } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { MOCK_NEAREST_BOOKS, NearestBook, MOCK_CATEGORIES } from '@/data/nearestBooksMockData';
import BooksBottomSheet from '@/components/map/BooksBottomSheet';
import UserLocationButton from '@/components/map/UserLocationButton';
import MapMarker from '@/components/map/MapMarker';
import * as Location from 'expo-location';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { FONTS } from '@/constants/fonts';

const { width, height } = Dimensions.get('window');

// Mock User Location (Naihati Railway Station)
const MOCK_USER_LOCATION = {
    latitude: 22.8943,
    longitude: 88.4230,
};

// Static categories calculation outside the component to prevent recreation on every render
const EXTENDED_CATEGORIES = [{ id: 'all', name: 'All' }, ...MOCK_CATEGORIES];

// Memoized Category Chip component to prevent redundant chip rendering
const CategoryChip = React.memo(({ cat, isActive, onPress }: {
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
});

// Memoized Map Marker Wrapper component
const MapMarkerWrapper = React.memo(({ book, isSelected, hasSelection, onPress }: {
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
});

const NearestBooksMapScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const mapRef = useRef<MapView>(null);
    const [bottomSheetVisible, setBottomSheetVisible] = useState(true);

    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
    const [activeCategoryId, setActiveCategoryId] = useState<string>(route.params?.categoryId || 'all');

    const [routeCoords, setRouteCoords] = useState<{ latitude: number, longitude: number }[]>([]);
    const [routeInfo, setRouteInfo] = useState<{ distance: string, duration: string } | null>(null);

    const handleCategoryPress = useCallback((categoryId: string) => {
        setActiveCategoryId(categoryId);
        setSelectedBookId(null);
    }, []);

    const filteredBooks = useMemo(() => {
        let books = MOCK_NEAREST_BOOKS;
        if (activeCategoryId !== 'all') {
            books = books.filter(b => b.categoryId === activeCategoryId);
        }
        return books;
    }, [activeCategoryId]);

    useEffect(() => {
        if (selectedBookId && userLocation) {
            const book = filteredBooks.find(b => b.id === selectedBookId);
            if (book?.latitude && book?.longitude) {
                // Fetch real road route using public OSRM API
                fetch(`https://router.project-osrm.org/route/v1/driving/${userLocation.longitude},${userLocation.latitude};${book.longitude},${book.latitude}?overview=full&geometries=geojson`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.routes && data.routes.length > 0) {
                            const coords = data.routes[0].geometry.coordinates.map((coord: any) => ({
                                latitude: coord[1],
                                longitude: coord[0]
                            }));
                            setRouteCoords(coords);

                            const distKm = (data.routes[0].distance / 1000).toFixed(1);
                            const durMin = Math.round(data.routes[0].duration / 60);
                            setRouteInfo({ distance: `${distKm} km`, duration: `${durMin} min` });
                        }
                    })
                    .catch(err => console.log("OSRM Error:", err));
            }
        } else {
            setRouteCoords([]);
            setRouteInfo(null);
        }
    }, [selectedBookId, userLocation, filteredBooks]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setUserLocation(MOCK_USER_LOCATION);
                return;
            }
            try {
                let location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch (error) {
                setUserLocation(MOCK_USER_LOCATION);
            }
        })();
    }, []);

    const initialRegion: Region = {
        latitude: userLocation?.latitude || MOCK_USER_LOCATION.latitude,
        longitude: userLocation?.longitude || MOCK_USER_LOCATION.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    };

    const handleBookPress = useCallback((book: NearestBook) => {
        setSelectedBookId(prev => {
            const isClosing = prev === book.id;
            const newSelectedId = isClosing ? null : book.id;

            if (!isClosing && book.latitude && book.longitude && userLocation) {
                // Focus both user and marker
                mapRef.current?.fitToCoordinates(
                    [
                        { latitude: userLocation.latitude, longitude: userLocation.longitude },
                        { latitude: book.latitude, longitude: book.longitude }
                    ],
                    {
                        edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
                        animated: true,
                    }
                );
            } else if (isClosing && userLocation) {
                // Re-center on user
                mapRef.current?.animateToRegion({
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }, 500);
            }
            return newSelectedId;
        });
        setBottomSheetVisible(true);
    }, [userLocation]);

    const handleCenterLocation = useCallback(() => {
        if (userLocation) {
            mapRef.current?.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            }, 500);
        }
    }, [userLocation]);

    const handleToggleScreen = useCallback(() => {
        navigation.navigate('NearestBooks', { categoryId: activeCategoryId });
    }, [navigation, activeCategoryId]);

    if (!userLocation) {
        return <View style={styles.container} />; // Loading state can be added here
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={false}
                mapType="standard"
                customMapStyle={[]}
                showsTraffic={false}
                showsIndoors={false}
                showsIndoorLevelPicker={false}
                showsBuildings={false}
            >
                {/* User Location Marker */}
                <Marker
                    coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
                    zIndex={999}
                    tracksViewChanges={false}
                >
                    <View style={styles.userLocationMarker}>
                        <Ionicons name="navigate-circle" size={32} color={COLORS.primary} />
                    </View>
                </Marker>

                {/* 1km Radius Circle */}
                <Circle
                    center={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
                    radius={1000}
                    fillColor="rgba(128, 128, 128, 0.2)"
                    strokeColor="rgba(128, 128, 128, 0.5)"
                    strokeWidth={1}
                />

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

            <LinearGradient
                colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0.8)', 'transparent']}
                style={[styles.headerGradient, { paddingTop: insets.top + SPACING.sm }]}
                pointerEvents="box-none"
            >
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
                    </TouchableOpacity>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search-outline" size={20} color={COLORS.primary} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>
                </View>

                <View style={styles.categoriesRow}>
                    <TouchableOpacity onPress={handleToggleScreen} style={styles.filterBtn}>
                        <Ionicons name="list" size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                        {EXTENDED_CATEGORIES.map((cat) => {
                            const isActive = activeCategoryId === cat.id;
                            return (
                                <CategoryChip
                                    key={cat.id}
                                    cat={cat}
                                    isActive={isActive}
                                    onPress={handleCategoryPress}
                                />
                            );
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
                    <Text style={styles.routeBadgeText}>{routeInfo.duration} ({routeInfo.distance})</Text>
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
        ...StyleSheet.absoluteFillObject,
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingBottom: SPACING.xl,
        zIndex: 10,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
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
        fontSize: rf(14),
        color: COLORS.black,
    },
    categoriesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.sm,
    },
    filterBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: rf(13),
        color: COLORS.black,
    },
    categoryTextActive: {
        color: COLORS.white,
    },
    locationButtonContainer: {
        position: 'absolute',
        right: SPACING.lg,
        zIndex: 10,
    },
    listToggleButton: {
        position: 'absolute',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
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
        fontSize: rf(14),
        color: COLORS.white,
    },
    userLocationMarker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },
    routeBadge: {
        position: 'absolute',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
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
        fontSize: rf(13),
        color: COLORS.white,
    },
});

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { NearestBook } from '@/data/nearestBooksMockData';
import { COLORS } from '@/constants/colors';
import BookMapCard from './BookMapCard';
import { SPACING } from '@/constants/spacings';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BooksBottomSheetProps {
    books: NearestBook[];
    selectedBookId: string | null;
    onBookPress: (book: NearestBook) => void;
    userLocation: { latitude: number; longitude: number };
}

const BooksBottomSheet = forwardRef<BottomSheet, BooksBottomSheetProps>(
    ({ books, selectedBookId, onBookPress, userLocation }, ref) => {
        const insets = useSafeAreaInsets();
        const localRef = useRef<BottomSheet>(null);
        const flatListRef = useRef<any>(null);

        useImperativeHandle(ref, () => localRef.current!);

        // Sync flatlist with marker selection
        useEffect(() => {
            if (selectedBookId) {
                const index = books.findIndex(b => b.id === selectedBookId);
                if (index !== -1 && flatListRef.current) {
                    flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
                }
            }
        }, [selectedBookId, books]);

        // Define snap points so the map is visible behind the bottom sheet
        const snapPoints = React.useMemo(() => ['20%', '40%', '85%'], []);

        return (
            <BottomSheet
                ref={localRef}
                snapPoints={snapPoints}
                index={1}
                backgroundStyle={{ backgroundColor: COLORS.white, borderRadius: 24 }}
                style={{ zIndex: 10 }}
            >
                <BottomSheetFlatList
                    ref={flatListRef}
                    data={books}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + SPACING.xl }]}
                    renderItem={({ item }) => (
                        <BookMapCard
                            book={item}
                            userLocation={userLocation}
                            onPress={onBookPress}
                            isSelected={selectedBookId === item.id}
                        />
                    )}
                />
            </BottomSheet>
        );
    }
);

export default BooksBottomSheet;

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
});

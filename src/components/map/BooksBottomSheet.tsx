import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, FlatList, Platform } from 'react-native';
import CleanBottomSheet from '@/components/ui/CleanBottomSheet';
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
    visible: boolean;
    onClose: () => void;
}

const BooksBottomSheet: React.FC<BooksBottomSheetProps> = ({
    books,
    selectedBookId,
    onBookPress,
    userLocation,
    visible,
    onClose,
}) => {
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList<NearestBook>>(null);

    // Sync flatlist with marker selection
    useEffect(() => {
        if (selectedBookId) {
            const index = books.findIndex(b => b.id === selectedBookId);
            if (index !== -1 && flatListRef.current) {
                flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
            }
        }
    }, [selectedBookId, books]);

    const renderItem = useCallback(({ item }: { item: NearestBook }) => (
        <BookMapCard
            book={item}
            userLocation={userLocation}
            onPress={onBookPress}
            isSelected={selectedBookId === item.id}
        />
    ), [onBookPress, selectedBookId, userLocation]);

    return (
        <CleanBottomSheet
            visible={visible}
            onClose={onClose}
            backgroundColor={COLORS.white}
            borderRadius={24}
            showCross={true}
        >
            <FlatList
                ref={flatListRef}
                data={books}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + SPACING.xl }]}
                renderItem={renderItem}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
                onScrollToIndexFailed={info => {
                    const wait = new Promise(resolve => setTimeout(resolve, 50));
                    wait.then(() => {
                        flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
                    });
                }}
            />
        </CleanBottomSheet>
    );
};

export default React.memo(BooksBottomSheet);

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
});


import CleanBottomSheet from "@/components/ui/CleanBottomSheet";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacings";
interface NearestBook {
  id: string;
  title: string;
  price: number;
  imageUri: string;
  latitude?: number;
  longitude?: number;
  genre?: string;
  discount?: string;
  condition?: string;
}
import React, { useCallback, useEffect, useRef } from "react";
import { FlatList, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BookMapCard from "./BookMapCard";

interface BooksBottomSheetProps {
  books: NearestBook[];
  selectedBookId: string | null;
  onBookPress: (book: NearestBook) => void;
  userLocation: { latitude: number; longitude: number } | null;
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
      const index = books.findIndex((b) => b.id === selectedBookId);
      if (index !== -1 && flatListRef.current) {
        flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    }
  }, [selectedBookId, books]);

  const renderItem = useCallback(
    ({ item }: { item: NearestBook }) => (
      <BookMapCard
        book={item}
        userLocation={userLocation}
        onPress={onBookPress}
        isSelected={selectedBookId === item.id}
      />
    ),
    [onBookPress, selectedBookId, userLocation]
  );

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
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + SPACING.xl }]}
        renderItem={renderItem}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 50));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
              viewPosition: 0.5,
            });
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

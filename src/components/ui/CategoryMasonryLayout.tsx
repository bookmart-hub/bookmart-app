import React, { memo, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rem } from '@/utils/responsive';
import { FeedItem, Book } from '@/data/models';
import { StatusBar } from 'expo-status-bar';
import HeartBurst from './HeartBrust';

const COLUMN_GAP = 16;
const PADDING_HORIZONTAL = SPACING.lg;

interface CategoryMasonryLayoutProps {
  data: FeedItem[];
}

const MasonryBookCard = memo(
  ({ book, navigation }: { book: any; navigation: any }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [showBurst, setShowBurst] = useState(false);

    const toggleLike = useCallback(() => {
      setIsLiked((prev) => {
        const next = !prev;
        if (next) {
          setShowBurst(true);
          setTimeout(() => setShowBurst(false), 600);
        }
        return next;
      });
    }, []);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => {
          navigation.navigate('BookDetails', {
            book: book,
          });
        }}
      >
        <Image
          source={{ uri: book.imageUri || book.coverUri }}
          style={styles.bookImage}
          contentFit="fill"
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {book.author || 'Unknown'}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>₹{book.price}</Text>
            <View style={styles.heartContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleLike}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={rem(0.9375)}
                  color={isLiked ? COLORS.primary : COLORS.textMuted}
                />
              </TouchableOpacity>
              {showBurst && <HeartBurst />}
            </View>
          </View>
          {(book.discount || book.stock || (book.otherListings && book.otherListings.length > 0)) && (
            <View style={styles.metaRow}>
              {book.discount && <Text style={styles.discountText}>{book.discount}</Text>}
              {book.otherListings && book.otherListings.length > 0 ? (
                <TouchableOpacity 
                  style={styles.moreOptionsBtn} 
                  onPress={() => navigation.navigate('OtherListings', { book, otherListings: book.otherListings })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.moreOptionsText}>+{book.otherListings.length} More</Text>
                </TouchableOpacity>
              ) : book.stock ? (
                <Text style={styles.stockText}>{book.stock}</Text>
              ) : null}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

const CategoryMasonryLayout: React.FC<CategoryMasonryLayoutProps> = ({ data }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const processedData = useMemo(() => {
    const groupedBooks = new Map<string, Book[]>();
    data.forEach((item) => {
      if (item.type === 'book' && item.book) {
        if (!groupedBooks.has(item.book.title)) groupedBooks.set(item.book.title, []);
        groupedBooks.get(item.book.title)!.push(item.book);
      }
    });

    const processedTitles = new Set<string>();
    const result: FeedItem[] = [];

    data.forEach((item) => {
      if (item.type !== 'book') {
        result.push(item);
      } else if (item.book) {
        if (!processedTitles.has(item.book.title)) {
          const allListings = groupedBooks.get(item.book.title)!;
          if (allListings.length > 1) {
            const lowestPriceBook = allListings.reduce((prev, curr) => (prev.price < curr.price ? prev : curr));
            const otherListings = allListings.filter((b) => b.id !== lowestPriceBook.id);
            result.push({ ...item, book: { ...lowestPriceBook, otherListings } });
          } else {
            result.push(item);
          }
          processedTitles.add(item.book.title);
        }
      }
    });

    return result;
  }, [data]);

  const renderItem = ({ item }: { item: FeedItem }) => {
    const wrapperStyle = {
      paddingHorizontal: COLUMN_GAP / 2,
      paddingBottom: COLUMN_GAP,
    };

    switch (item.type) {
      case 'header':
        return (
          <View style={[styles.headerContainer, wrapperStyle]}>
            <Text 
              style={styles.headerTitle} 
              numberOfLines={1} 
              adjustsFontSizeToFit={true}
            >
              {item.title}
            </Text>
            <Text style={styles.headerSubtitle}>{item.subtitle}</Text>
          </View>
        );

      case 'ad':
        return (
          <View style={[wrapperStyle]}>
            <View style={styles.adCard}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.adImage}
                contentFit="fill"
              />
              {item.text && (
                <View style={styles.adOverlay}>
                  <Text style={styles.adText}>{item.text}</Text>
                </View>
              )}
            </View>
          </View>
        );

      case 'book':
        return (
          <View style={wrapperStyle}>
            <MasonryBookCard book={item.book} navigation={navigation} />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style='dark' />
      <View style={styles.appBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <FlashList
        data={processedData}
        renderItem={renderItem}
        numColumns={2}
        masonry
        getItemType={(item) => item.type}
        contentContainerStyle={{
          paddingHorizontal: PADDING_HORIZONTAL - (COLUMN_GAP / 2),
          paddingBottom: SPACING.xl,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CategoryMasonryLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: rem(0.75),
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  bookImage: {
    width: '100%',
    height: rem(8.125),
  },
  cardContent: {
    padding: rem(0.5625),
  },
  author: {
    fontSize: rem(0.65625),
    color: COLORS.text,
    marginTop: rem(0.1875),
    marginBottom: rem(0.3125),
  },
  cardTitle: {
    fontSize: rem(0.78125),
    lineHeight: rem(1),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingVertical: SPACING.md,
  },
  headerContainer: {
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: rem(2),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: rem(0.3125),
  },
  headerSubtitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.black,
    lineHeight: rem(1.125),
  },
  adCard: {
    borderRadius: rem(0.9375),
    overflow: 'hidden',
    height: rem(8.75),
    backgroundColor: COLORS.grayLight,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  adImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  adOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: rem(0.75),
    paddingVertical: rem(0.375),
    borderRadius: rem(0.5),
  },
  adText: {
    color: COLORS.white,
    fontFamily: FONTS.montserrat.bold,
    fontSize: rem(0.875),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: rem(0.78125),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
  addButton: {
    width: rem(1.375),
    height: rem(1.375),
    borderRadius: rem(0.6875),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartContainer: {
    width: rem(1.75),
    height: rem(1.75),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: -rem(0.25),
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: rem(0.375),
  },
  discountText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  stockText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.red,
  },
  moreOptionsBtn: {
    backgroundColor: COLORS.background,
    paddingHorizontal: rem(0.375),
    paddingVertical: rem(0.125),
    borderRadius: rem(0.25),
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  moreOptionsText: {
    fontSize: rem(0.5625),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
});

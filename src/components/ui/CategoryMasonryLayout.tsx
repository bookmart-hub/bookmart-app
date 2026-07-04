import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { FeedItem } from '@/data/models';

const COLUMN_GAP = 16;
const PADDING_HORIZONTAL = SPACING.lg;

interface CategoryMasonryLayoutProps {
  data: FeedItem[];
}

const CategoryMasonryLayout: React.FC<CategoryMasonryLayoutProps> = ({ data }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const renderItem = ({ item }: { item: FeedItem }) => {
    const wrapperStyle = {
      paddingHorizontal: COLUMN_GAP / 2,
      paddingBottom: COLUMN_GAP,
    };

    switch (item.type) {
      case 'header':
        return (
          <View style={[styles.headerContainer, wrapperStyle]}>
            <Text style={styles.headerTitle}>{item.title.replace(' ', '\n')}</Text>
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
                contentFit="cover"
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
        const book = item.book;
        return (
          <View style={wrapperStyle}>
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
                contentFit="cover"
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
                  <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="bag-handle-sharp" size={14} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
                {(book.discount || book.stock) && (
                  <View style={styles.metaRow}>
                    {book.discount && <Text style={styles.discountText}>{book.discount}</Text>}
                    {book.stock && <Text style={styles.stockText}>{book.stock}</Text>}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.appBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <FlashList
        data={data}
        renderItem={renderItem}
        numColumns={2}
        masonry
        getItemType={(item) => item.type}
        contentContainerStyle={{
          paddingHorizontal: PADDING_HORIZONTAL - (COLUMN_GAP / 2),
          paddingBottom: SPACING.xl,
        }}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={250}
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
    borderRadius: rf(15),
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  bookImage: {
    width: '100%',
    height: rf(155),
  },
  cardContent: {
    padding: rf(13),
  },
  author: {
    fontSize: rf(12),
    color: COLORS.text,
    marginTop: rf(4),
    marginBottom: rf(7),
  },
  cardTitle: {
    fontSize: rf(14),
    lineHeight: rf(18),
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
    fontSize: rf(32),
    lineHeight: rf(30),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: rf(5),
  },
  headerSubtitle: {
    fontSize: rf(14),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.black,
    lineHeight: rf(18),
  },
  adCard: {
    borderRadius: rf(15),
    overflow: 'hidden',
    height: rf(170),
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
    paddingHorizontal: rf(12),
    paddingVertical: rf(6),
    borderRadius: rf(8),
  },
  adText: {
    color: COLORS.white,
    fontFamily: FONTS.montserrat.bold,
    fontSize: rf(14),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: rf(14),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
  addButton: {
    width: rf(22),
    height: rf(22),
    borderRadius: rf(11),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: rf(12),
  },
  discountText: {
    fontSize: rf(12),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  stockText: {
    fontSize: rf(12),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.red,
  },
});

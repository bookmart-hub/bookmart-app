import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 16;
const PADDING_HORIZONTAL = SPACING.lg;
const COLUMN_WIDTH = (width - PADDING_HORIZONTAL * 2 - COLUMN_GAP) / 2;

export type BookItem = {
  id: string;
  title: string;
  imageUri: string;
  price: number;
  discount?: string;
  stock?: string;
  empty?: boolean;
};

interface CategoryMasonryLayoutProps {
  title: string;
  subtitle: string;
  leftColumnData: BookItem[];
  rightColumnData: BookItem[];
}

const CategoryMasonryLayout: React.FC<CategoryMasonryLayoutProps> = ({
  title,
  subtitle,
  leftColumnData,
  rightColumnData,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const renderBookCard = (item: BookItem) => {
    if (item.empty) {
      return <View key={item.id} style={styles.emptyCard} />;
    }

    return (
      <View key={item.id} style={styles.card}>
        <Image
          source={{ uri: item.imageUri }}
          style={styles.bookImage}
          contentFit="cover"
        />

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.author}>
            Andy Weir
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.condition}>Used • Good</Text>
            <Text style={styles.rating}>⭐ 4.8</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>₹{item.price}</Text>

            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="bag-handle-sharp" size={14} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.discountText}>60% OFF</Text>
            <Text style={styles.stockText}>2 left</Text>
          </View>
        </View>
      </View>
    );
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {/* Left Column */}
          <View style={styles.column}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>{title.replace(' ', '\n')}</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
            {leftColumnData.map(renderBookCard)}
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            {rightColumnData.map(renderBookCard)}
          </View>
        </View>
      </ScrollView>
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
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  bookImage: {
    width: '100%',
    height: 165,
  },
  cardContent: {
    padding: 14,
  },
  author: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  condition: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  rating: {
    fontSize: 11,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingVertical: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: SPACING.xl,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: COLUMN_WIDTH,
    gap: COLUMN_GAP,
  },
  headerContainer: {
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.manrope.medium,
    color: COLORS.black,
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    height: 80,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.grayLight,
    marginBottom: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '70%',
    height: '70%',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.primary,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  discountText: {
    fontSize: 12,
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  stockText: {
    fontSize: 12,
    fontFamily: FONTS.manrope.bold,
    color: COLORS.red,
  },
});

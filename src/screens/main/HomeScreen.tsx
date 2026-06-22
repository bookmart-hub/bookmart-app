import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import HomeHeader from '@/components/ui/HomeHeader';
import SearchBar from '@/components/ui/SearchBar';
import PromoBanner, { PromoBannerItem } from '@/components/ui/PromoBanner';
import CategorySection from '@/components/ui/CategorySection';
import NearestBooks, { NearestBookItem } from '@/components/ui/NearestBooks';
import AuthorsSection, { AuthorItem } from '@/components/ui/AuthorsSection';
import InstituteBooks, { InstituteBookItem } from '@/components/ui/InstituteBooks';
import HorizontalBookList from '@/components/ui/HorizontalBookList';

const RECENTLY_ADDED = [
  { id: 'ra1', title: 'The Silent Patient', author: 'Alex Michaelides', price: 250, coverUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop', condition: 'Like New', distance: '1km' },
  { id: 'ra2', title: 'Educated', author: 'Tara Westover', price: 300, coverUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop', condition: 'Good', distance: '2km' },
  { id: 'ra3', title: 'Sapiens', author: 'Yuval Noah Harari', price: 400, coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop', condition: 'Like New', distance: '3km' },
  { id: 'ra4', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', price: 350, coverUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=440&fit=crop', condition: 'Acceptable', distance: '1.5km' },
];

const ENDING_SOON = [
  { id: 'es1', title: 'The Alchemist', author: 'Paulo Coelho', price: 150, coverUri: 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=300&h=440&fit=crop', condition: 'Good', distance: '5km' },
  { id: 'es2', title: '1984', author: 'George Orwell', price: 200, coverUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=440&fit=crop', condition: 'Like New', distance: '4km' },
  { id: 'es3', title: 'Brave New World', author: 'Aldous Huxley', price: 180, coverUri: 'https://images.unsplash.com/photo-1629196914225-eb488db9f0eb?w=300&h=440&fit=crop', condition: 'Acceptable', distance: '8km' },
];

const PEOPLE_ARE_VIEWING = [
  { id: 'pv1', title: 'Dune', author: 'Frank Herbert', price: 450, coverUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop', condition: 'Like New', distance: '2km' },
  { id: 'pv2', title: 'Foundation', author: 'Isaac Asimov', price: 380, coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop', condition: 'Good', distance: '1km' },
  { id: 'pv3', title: 'Neuromancer', author: 'William Gibson', price: 300, coverUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop', condition: 'Acceptable', distance: '6km' },
];

const EXCELLENT_CONDITION = [
  { id: 'ec1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 220, coverUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=440&fit=crop', condition: 'Like New', distance: '2km' },
  { id: 'ec2', title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 280, coverUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=440&fit=crop', condition: 'Like New', distance: '5km' },
  { id: 'ec3', title: 'Pride and Prejudice', author: 'Jane Austen', price: 190, coverUri: 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=300&h=440&fit=crop', condition: 'Like New', distance: '3km' },
];

const EDITORS_CHOICE = [
  { id: 'ed1', title: 'Steve Jobs', author: 'Walter Isaacson', price: 500, coverUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop', condition: 'Like New', distance: '4km' },
  { id: 'ed2', title: 'Shoe Dog', author: 'Phil Knight', price: 400, coverUri: 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=300&h=440&fit=crop', condition: 'Good', distance: '2km' },
  { id: 'ed3', title: 'Zero to One', author: 'Peter Thiel', price: 350, coverUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=440&fit=crop', condition: 'Like New', distance: '1km' },
];

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleNotificationPress = useCallback(() => {
    // TODO: navigate to notifications
  }, []);

  const handleAvatarPress = useCallback(() => {
    // TODO: navigate to profile / settings
  }, []);

  const handleCtaPress = useCallback((banner: PromoBannerItem) => {
    // TODO: navigate to promotion detail
  }, []);

  const handleBookPress = useCallback((book: NearestBookItem) => {
    navigation.navigate('AppStack', { screen: 'BookDetails', params: { book, categoryTitle: 'Non-Fiction' } });
  }, [navigation]);

  const handleSeeAllPress = useCallback(() => {
    navigation.navigate('AppStack', { screen: 'NearestBooksMap' });
  }, [navigation]);

  const handleInstituteBookPress = useCallback((book: InstituteBookItem) => {
    navigation.navigate('AppStack', { screen: 'BookDetails', params: { book, categoryTitle: 'Textbooks' } });
  }, [navigation]);

  const handleInstituteSeeAllPress = useCallback(() => {
    // TODO: navigate to institute books list
  }, []);

  const handleAuthorPress = useCallback((author: AuthorItem) => {
    navigation.navigate('AppStack', { screen: 'AuthorDetails', params: { author } });
  }, [navigation]);

  const handleAuthorSeeAllPress = useCallback(() => {
    navigation.navigate('AppStack', { screen: 'AuthorList' });
  }, [navigation]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <HomeHeader
        notificationCount={3}
        onNotificationPress={handleNotificationPress}
        onAvatarPress={handleAvatarPress}
      />

      {/* ── Search Bar ── */}
      <SearchBar
        onPress={() => navigation.navigate('AppStack', { screen: 'Search' })}
        editable={false}
        onClearPress={() => { }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
      >
        {/* ── Promo Carousel ── */}
        <PromoBanner onCtaPress={handleCtaPress} />

        {/* ── Categories ── */}
        <CategorySection />

        {/* ── Nearest Books ── */}
        <NearestBooks
          onBookPress={handleBookPress}
          onSeeAllPress={handleSeeAllPress}
        />

        {/* ── From Your Institute ── */}
        <InstituteBooks
          instituteName="College"
          onBookPress={handleInstituteBookPress}
          onSeeAllPress={handleInstituteSeeAllPress}
        />

        {/* ── Authors ── */}
        <AuthorsSection
          onAuthorPress={handleAuthorPress}
          onSeeAllPress={handleAuthorSeeAllPress}
        />

        <HorizontalBookList
          title="Recently Added"
          books={RECENTLY_ADDED}
          animationType="fade"
          cardLayout="standard"
          onBookPress={(book) => navigation.navigate('AppStack', { screen: 'BookDetails', params: { book, categoryTitle: 'Recently Added' } })}
          onSeeAllPress={() => { }}
          loop={true}
        />

        <HorizontalBookList
          title="People Are Viewing"
          books={PEOPLE_ARE_VIEWING}
          animationType="scale"
          cardLayout="standard"
          loop={true}
          onBookPress={(book) => navigation.navigate('AppStack', { screen: 'BookDetails', params: { book, categoryTitle: 'Trending' } })}
          onSeeAllPress={() => { }}
        />

        <HorizontalBookList
          title="Ending Soon"
          books={ENDING_SOON}
          animationType="standard"
          cardLayout="horizontal"
          onBookPress={(book) => navigation.navigate('AppStack', { screen: 'BookDetails', params: { book, categoryTitle: 'Ending Soon' } })}
          onSeeAllPress={() => { }}
          loop={true}
        />

        <HorizontalBookList
          title="Excellent Condition"
          books={EXCELLENT_CONDITION}
          animationType="fade"
          cardLayout="standard"
          onBookPress={(book) => navigation.navigate('AppStack', { screen: 'BookDetails', params: { book, categoryTitle: 'Premium' } })}
          onSeeAllPress={() => { }}
          loop={true}
        />

        <HorizontalBookList
          title="Editor's Choice"
          books={EDITORS_CHOICE}
          animationType="standard"
          cardLayout="featured"
          onBookPress={(book) => navigation.navigate('AppStack', { screen: 'BookDetails', params: { book, categoryTitle: 'Editor\'s Choice' } })}
          onSeeAllPress={() => { }}
          loop={true}
        />

      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // room for floating tab bar
  },
});
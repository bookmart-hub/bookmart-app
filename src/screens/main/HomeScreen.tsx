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
import EditorsChoiceComp from '@/components/smallComp/EditorsChoiceComp';
import ExcellentCondition from '@/components/smallComp/ExcellentCondition';
import RecentlyAdded from '@/components/smallComp/RecentlyAdded';
import SponsoredSection from '@/components/smallComp/SponsoredSection';
import PeopleViewing from '@/components/smallComp/PeopleViewing';
import EndingSoon from '@/components/smallComp/EndingSoon';
import { rf } from '@/utils/responsive';

// ── Expanded Mock Datasets ──────────────────────────────────────────────────

const SPONSORED_BOOKS = [
  { id: 'sp1', title: 'Start with Why', author: 'Simon Sinek', price: 299, coverUri: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=440&fit=crop', condition: 'Like New', distance: '1.2km' },
  { id: 'sp2', title: 'The Lean Startup', author: 'Eric Ries', price: 349, coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop', condition: 'Mint Condition', distance: '3.5km' },
  { id: 'sp3', title: 'The Lean Startup', author: 'Eric Ries', price: 349, coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop', condition: 'Mint Condition', distance: '3.5km' },
  { id: 'sp4', title: 'The Lean Startup', author: 'Eric Ries', price: 349, coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop', condition: 'Mint Condition', distance: '3.5km' },
];

const NEAREST_BOOKS = [
  { id: 'n1', title: 'Ikigai', author: 'Hector Garcia', price: 160, coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop', condition: 'Good Condition', distance: '0.8km', description: 'Find your reason for being. A beautiful guide to a long and happy life.' },
  { id: 'n2', title: 'Rich Dad Poor Dad', author: 'Robert T. Kiyosaki', price: 199, coverUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=440&fit=crop', condition: 'Like New', distance: '1.2km', description: 'What the rich teach their kids about money.' },
  { id: 'n3', title: 'Atomic Habits', author: 'James Clear', price: 220, coverUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop', condition: 'Good Condition', distance: '1.5km', description: 'Build good habits and break bad ones.' },
  { id: 'n4', title: 'The Psychology of Money', author: 'Morgan Housel', price: 180, coverUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop', condition: 'Acceptable', distance: '2.0km', description: 'Timeless lessons on wealth and happiness.' },
  { id: 'n5', title: 'Deep Work', author: 'Cal Newport', price: 195, coverUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=280&fit=crop', condition: 'Like New', distance: '2.3km', description: 'Rules for focused success.' },
  { id: 'n6', title: 'Sapiens', author: 'Yuval Noah Harari', price: 400, coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop', condition: 'Good Condition', distance: '3.1km', description: 'A brief history of humankind.' }
];

const COLLEGE_BOOKS = [
  { id: 'cb1', title: 'Fingersmith', author: 'Sarah Waters', price: 140, coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=280&fit=crop', description: 'Intricate Dickensian plot novel.', sellerName: 'Amit Roy', sellerAvatarUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face' },
  { id: 'cb2', title: 'The Skin and its Girl', author: 'Sarah Cypher', price: 175, coverUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=280&fit=crop', description: 'Multigenerational novel about family lore.', sellerName: 'Sumit Das', sellerAvatarUri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face' },
  { id: 'cb3', title: 'Calculus: Early Transcendentals', author: 'James Stewart', price: 550, coverUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=280&fit=crop', description: 'Top-selling calculus textbook.', sellerName: 'Rahul Mehta' },
  { id: 'cb4', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', price: 680, coverUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=280&fit=crop', description: 'Standard algorithms reference guide.', sellerName: 'Priya Sen', sellerAvatarUri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face' },
  { id: 'cb5', title: 'Organic Chemistry', author: 'Jonathan Clayden', price: 490, coverUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=440&fit=crop', description: 'Modern guide to organic chemistry.', sellerName: 'Ananya Roy' }
];

const RECENTLY_ADDED = [
  { id: 'ra1', title: 'The Silent Patient', author: 'Alex Michaelides', price: 250, coverUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop', condition: 'Like New', distance: '1km' },
  { id: 'ra2', title: 'Educated', author: 'Tara Westover', price: 300, coverUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop', condition: 'Good', distance: '2km' },
  { id: 'ra3', title: 'Sapiens', author: 'Yuval Noah Harari', price: 400, coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop', condition: 'Like New', distance: '3km' },
  { id: 'ra4', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', price: 350, coverUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=440&fit=crop', condition: 'Acceptable', distance: '1.5km' },
  { id: 'ra5', title: 'Midnight Library', author: 'Matt Haig', price: 210, coverUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=440&fit=crop', condition: 'Good', distance: '0.5km' },
  { id: 'ra6', title: 'Normal People', author: 'Sally Rooney', price: 180, coverUri: 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=300&h=440&fit=crop', condition: 'Like New', distance: '2.5km' }
];

const PEOPLE_ARE_VIEWING = [
  { id: 'pv1', title: 'Dune', author: 'Frank Herbert', price: 450, coverUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop', condition: 'Like New', distance: '2km' },
  { id: 'pv2', title: 'Foundation', author: 'Isaac Asimov', price: 380, coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop', condition: 'Good', distance: '1km' },
  { id: 'pv3', title: 'Neuromancer', author: 'William Gibson', price: 300, coverUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop', condition: 'Acceptable', distance: '6km' },
  { id: 'pv4', title: 'Project Hail Mary', author: 'Andy Weir', price: 420, coverUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=440&fit=crop', condition: 'Like New', distance: '1.8km' },
  { id: 'pv5', title: 'The Hobbit', author: 'J.R.R. Tolkien', price: 290, coverUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=440&fit=crop', condition: 'Good', distance: '4.2km' }
];

const ENDING_SOON = [
  { id: 'es1', title: 'The Alchemist', author: 'Paulo Coelho', price: 150, coverUri: 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=300&h=440&fit=crop', condition: 'Good', distance: '5km', timeLeft: '2h left' },
  { id: 'es2', title: '1984', author: 'George Orwell', price: 200, coverUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=440&fit=crop', condition: 'Like New', distance: '4km', timeLeft: '5h left' },
  { id: 'es3', title: 'Brave New World', author: 'Aldous Huxley', price: 180, coverUri: 'https://images.unsplash.com/photo-1629196914225-eb488db9f0eb?w=300&h=440&fit=crop', condition: 'Acceptable', distance: '8km', timeLeft: '10h left' },
  { id: 'es4', title: 'Fahrenheit 451', author: 'Ray Bradbury', price: 170, coverUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop', condition: 'Good', distance: '3.5km', timeLeft: '12h left' },
  { id: 'es5', title: 'Lord of the Flies', author: 'William Golding', price: 130, coverUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop', condition: 'Good', distance: '1.2km', timeLeft: '18h left' }
];

const EXCELLENT_CONDITION = [
  { id: 'ec1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 220, coverUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=440&fit=crop', condition: 'Mint Condition', distance: '2km' },
  { id: 'ec2', title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 280, coverUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=440&fit=crop', condition: 'Like New', distance: '5km' },
  { id: 'ec3', title: 'Pride and Prejudice', author: 'Jane Austen', price: 190, coverUri: 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=300&h=440&fit=crop', condition: 'Mint Condition', distance: '3km' },
  { id: 'ec4', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', price: 340, coverUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=440&fit=crop', condition: 'Mint Condition', distance: '4.8km' },
  { id: 'ec5', title: 'Wuthering Heights', author: 'Emily Brontë', price: 210, coverUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=440&fit=crop', condition: 'Like New', distance: '1.9km' },
  { id: 'ec6', title: 'Frankenstein', author: 'Mary Shelley', price: 250, coverUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop', condition: 'Mint Condition', distance: '2.7km' }
];

const EDITORS_CHOICE = [
  { id: 'ed1', title: 'Steve Jobs', author: 'Walter Isaacson', price: 500, coverUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=440&fit=crop', condition: 'Like New', distance: '4km' },
  { id: 'ed2', title: 'Shoe Dog', author: 'Phil Knight', price: 400, coverUri: 'https://images.unsplash.com/photo-1656266724092-d979cb85469b?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', condition: 'Good', distance: '2km' },
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
    navigation.navigate('AppStack', { screen: 'CollegeInsights' });
  }, [navigation]);

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
      >
        {/* ── Promo Carousel ── */}
        <PromoBanner onCtaPress={handleCtaPress} />

        {/* ── Categories ── */}
        <CategorySection />

        {/* ── Trending / Sponsored ── */}
        <SponsoredSection
          books={SPONSORED_BOOKS}
          onBookPress={handleBookPress}
        />

        {/* ── Nearest Books ── */}
        <NearestBooks
          books={NEAREST_BOOKS}
          onBookPress={handleBookPress}
          onSeeAllPress={handleSeeAllPress}
        />

        {/* ── From Your College ── */}
        <InstituteBooks
          instituteName="College"
          books={COLLEGE_BOOKS}
          onBookPress={handleInstituteBookPress}
          onSeeAllPress={handleInstituteSeeAllPress}
        />

        {/* ── Authors ── */}
        <AuthorsSection
          onAuthorPress={handleAuthorPress}
          onSeeAllPress={handleAuthorSeeAllPress}
        />

        {/* ── Recently Added ── */}
        <RecentlyAdded
          title="Recently Added"
          books={RECENTLY_ADDED}
          onBookPress={(book) => navigation.navigate('AppStack', { screen: 'BookDetails', params: { book, categoryTitle: 'Recently Added' } })}
        />

        {/* ── Excellent Condition ── */}
        <ExcellentCondition
          title="Excellent Condition"
          books={EXCELLENT_CONDITION}
          onBookPress={(book) => navigation.navigate('AppStack', { screen: 'BookDetails', params: { book, categoryTitle: 'Premium' } })}
        />
        {/* ── People Are Viewing ── */}
        <PeopleViewing
          title="People Are Viewing"
          books={PEOPLE_ARE_VIEWING}
          onBookPress={(book) => navigation.navigate('AppStack', { screen: 'BookDetails', params: { book, categoryTitle: 'Trending' } })}
        />

        {/* ── Ending Soon ── */}
        <EndingSoon
          title="Ending Soon"
          books={ENDING_SOON}
          onBookPress={(book) => navigation.navigate('AppStack', { screen: 'BookDetails', params: { book, categoryTitle: 'Ending Soon' } })}
        />

        {/* ── Editor's Choice ── */}
        <EditorsChoiceComp item={EDITORS_CHOICE} onBookPress={handleBookPress} />

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
    paddingBottom: rf(120), // room for floating tab bar
  },
});
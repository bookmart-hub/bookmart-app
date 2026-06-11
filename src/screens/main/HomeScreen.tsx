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
    navigation.navigate('AppStack', { screen: 'NearestBooks' });
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
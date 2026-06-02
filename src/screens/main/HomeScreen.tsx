import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import HomeHeader from '@/components/ui/HomeHeader';
import SearchBar from '@/components/ui/SearchBar';
import PromoBanner, { PromoBannerItem } from '@/components/ui/PromoBanner';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();

  const handleNotificationPress = useCallback(() => {
    // TODO: navigate to notifications
  }, []);

  const handleAvatarPress = useCallback(() => {
    // TODO: navigate to profile / settings
  }, []);

  const handleCtaPress = useCallback((banner: PromoBannerItem) => {
    // TODO: navigate to promotion detail
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <HomeHeader
          notificationCount={3}
          onNotificationPress={handleNotificationPress}
          onAvatarPress={handleAvatarPress}
        />

        {/* ── Search Bar ── */}
        <SearchBar />

        {/* ── Promo Carousel ── */}
        <PromoBanner onCtaPress={handleCtaPress} />

        {/* Future sections will go below */}
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
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, ActivityIndicator, Text, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { rf } from '@/utils/responsive';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  isLoadingFonts?: boolean;
}

export default function SplashScreen({ isLoadingFonts = false }: SplashScreenProps) {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const textTranslateY = useRef(new Animated.Value(15)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const loaderFadeAnim = useRef(new Animated.Value(0)).current;
  // eas init --id 3f15e29f-09ca-43f7-937c-cd9eaa118265
  useEffect(() => {
    // Start animations immediately
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 15,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(loaderFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // If we're not just showing the boot splash for font loading, check local states
    if (!isLoadingFonts) {
      const initializeApp = async () => {
        try {
          const isLoggedIn = await AsyncStorage.getItem('@bookmart:is_logged_in');
          const token = await SecureStore.getItemAsync('accessToken');

          // Ensure a minimum splash screen duration of 1800ms for smooth/premium branding
          setTimeout(() => {
            if (isLoggedIn === 'true') {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Tab' }],
              });
            } else if (token) {
              // Token exists, but not fully onboarded/logged in. Go to Personalization.
              navigation.reset({
                index: 0,
                routes: [
                  { 
                    name: 'Auth', 
                    state: { routes: [{ name: 'Personalization' }] } 
                  }
                ],
              });
            } else {
              // Not logged in and no token
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            }
          }, 1800);
        } catch (e) {
          console.error('Splash initialization error:', e);
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          }, 1800);
        }
      };

      initializeApp();
    }
  }, [isLoadingFonts]);

  // Safe font declarations during initial boot (before Montserrat/Manrope fonts are loaded)
  const titleFont = isLoadingFonts
    ? Platform.select({ ios: 'System', android: 'sans-serif-medium' })
    : 'Montserrat-Bold';
  const tagFont = isLoadingFonts
    ? Platform.select({ ios: 'System', android: 'sans-serif' })
    : 'Manrope-Medium';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Image
          source={require('../../../assets/icon.png')}
          style={[
            styles.logo,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          resizeMode="contain"
        />
        <Animated.View
          style={[
            styles.textWrapper,
            {
              opacity: textFadeAnim,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={[styles.title, { fontFamily: titleFont }]}>Bookmart</Text>
          <Text style={[styles.subtitle, { fontFamily: tagFont }]}>Your Campus Library Companion</Text>
        </Animated.View>
      </View>
      <Animated.View style={[styles.loaderContainer, { opacity: loaderFadeAnim }]}>
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
      </Animated.View>
    </View>
  );
}

export function StaticSplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const textTranslateY = useRef(new Animated.Value(15)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const loaderFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 15,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(loaderFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const titleFont = Platform.select({ ios: 'System', android: 'sans-serif-medium' });
  const tagFont = Platform.select({ ios: 'System', android: 'sans-serif' });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Image
          source={require('../../../assets/icon.png')}
          style={[
            styles.logo,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          resizeMode="contain"
        />
        <Animated.View
          style={[
            styles.textWrapper,
            {
              opacity: textFadeAnim,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={[styles.title, { fontFamily: titleFont }]}>Bookmart</Text>
          <Text style={[styles.subtitle, { fontFamily: tagFont }]}>Your Campus Library Companion</Text>
        </Animated.View>
      </View>
      <Animated.View style={[styles.loaderContainer, { opacity: loaderFadeAnim }]}>
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: rf(110),
    height: rf(110),
    marginBottom: 20,
  },
  textWrapper: {
    alignItems: 'center',
  },
  title: {
    fontSize: rf(26),
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: rf(12),
    color: COLORS.textMuted,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 50,
  },
  loader: {
    transform: [{ scale: 1.1 }],
  },
});

import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { StatusBar } from 'expo-status-bar';

interface HomeHeaderProps {
  avatarUri?: string;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = memo(({
  avatarUri = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  notificationCount = 0,
  onNotificationPress,
  onAvatarPress,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar style='dark' />
      {/* Brand Logo */}
      <Text style={styles.brandLogo}><Text style={{ fontFamily: FONTS.montserrat.bold }}>B</Text>ookmart</Text>

      {/* Right Actions */}
      <View style={styles.rightSection}>
        {/* Notification Bell */}
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Avatar */}
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={onAvatarPress}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatar}
            contentFit="fill"
            cachePolicy="memory-disk"
            recyclingKey={avatarUri}
            transition={200}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  brandLogo: {
    fontSize: rf(22),
    fontFamily: FONTS.montserrat.regular,
    color: COLORS.primary,
    lineHeight: 28,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.red,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: rf(8),
    fontFamily: FONTS.montserrat.bold,
    lineHeight: 12,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});

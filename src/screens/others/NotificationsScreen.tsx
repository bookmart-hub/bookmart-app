import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/clients";

const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await api.get("/api/v1/marketplace/notifications/");
      return response.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/api/v1/marketplace/notifications/${id}/`, { is_read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleMarkAsRead = (id: number) => {
    markReadMutation.mutate(id);
  };

  const renderItem = ({ item }: { item: any }) => {
    let iconName = "notifications-outline";
    let iconColor = COLORS.primary;

    if (item.notification_type === "PRICE_DROP") {
      iconName = "trending-down-outline";
      iconColor = COLORS.green || "green";
    } else if (item.notification_type === "BUYER_INTEREST") {
      iconName = "chatbubble-outline";
      iconColor = COLORS.blue || "blue";
    } else if (item.notification_type === "NEW_LISTING") {
      iconName = "book-outline";
      iconColor = COLORS.primary;
    }

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
        onPress={() => handleMarkAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconColor + "15" }]}>
          <Ionicons name={iconName as any} size={24} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.notiTitle, !item.is_read && styles.unreadText]}>{item.title}</Text>
          <Text style={styles.notiBody}>{item.body}</Text>
          <Text style={styles.notiTime}>
            {new Date(item.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
          </Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.content}>
      <Ionicons name="notifications-off-outline" size={64} color={COLORS.grayHeavvy} style={{ marginBottom: 16 }} />
      <Text style={styles.title}>All Caught Up!</Text>
      <Text style={styles.subtitle}>You don't have any notifications at the moment.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={notificationsData?.results || []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  backButton: { padding: SPACING.xs, marginRight: SPACING.sm },
  headerTitle: { fontSize: rem(1.125), fontFamily: FONTS.montserrat.bold, color: COLORS.black },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: SPACING.lg, marginTop: rem(4) },
  title: {
    fontSize: rem(1.25),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  listContent: {
    paddingVertical: SPACING.sm,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
    backgroundColor: COLORS.white,
  },
  unreadCard: {
    backgroundColor: COLORS.grayLight + "20",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  notiTitle: {
    fontSize: rem(0.9375),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  unreadText: {
    fontFamily: FONTS.montserrat.bold,
  },
  notiBody: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.regular,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  notiTime: {
    fontSize: rem(0.6875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
});

export default NotificationsScreen;

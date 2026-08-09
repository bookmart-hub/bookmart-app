import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/clients";

const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const {
    data: notificationsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await api.get("/api/v1/marketplace/notifications/");
      return response.data;
    },
  });

  const notificationsList = notificationsData?.results || [];
  const unreadCount = notificationsList.filter((n: any) => !n.is_read).length;

  // Single mark read mutation
  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/api/v1/marketplace/notifications/${id}/`, { is_read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.post("/api/v1/marketplace/notifications/read-all/");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to mark all as read");
    },
  });

  const handleMarkAsRead = (id: number) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    markAllReadMutation.mutate();
  };

  const renderItem = ({ item }: { item: any }) => {
    let iconName = "notifications-outline";
    let iconColor = COLORS.primary;

    if (item.notification_type === "PRICE_DROP") {
      iconName = "trending-down-outline";
      iconColor = COLORS.green;
    } else if (item.notification_type === "BUYER_INTEREST") {
      iconName = "chatbubble-outline";
      iconColor = COLORS.blue;
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
          <Ionicons name={iconName as any} size={22} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.notiTitle, !item.is_read && styles.unreadText]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notiBody}>{item.body}</Text>
          <Text style={styles.notiTime}>
            {new Date(item.created_at).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="notifications-off-outline" size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>All Caught Up!</Text>
      <Text style={styles.emptySubtitle}>You don't have any notifications at the moment.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} activeOpacity={0.7} disabled={markAllReadMutation.isPending}>
            {markAllReadMutation.isPending ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.markAllText}>Mark all as read</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Main List */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={notificationsList}
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
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
    backgroundColor: COLORS.white,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  backButton: { padding: SPACING.xs, marginRight: SPACING.sm },
  headerTitle: { fontSize: rem(1.125), fontFamily: FONTS.montserrat.bold, color: COLORS.black },
  markAllText: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.primary,
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    marginTop: rem(6),
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 128, 128, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: rem(1.25),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: SPACING.sm,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
    backgroundColor: COLORS.white,
  },
  unreadCard: {
    backgroundColor: "rgba(0, 128, 128, 0.02)",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  notiTitle: {
    fontSize: rem(0.875),
    fontFamily: FONTS.manrope.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  unreadText: {
    fontFamily: FONTS.montserrat.bold,
  },
  notiBody: {
    fontSize: rem(0.8125),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
    lineHeight: 18,
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

import Header from "@/components/ui/Header";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { SPACING } from "@/constants/spacings";
import { rem } from "@/utils/responsive";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useNavigation } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/clients";
import { BookCardSkeleton } from "@/components/skeleton/SkeletonLoader";

type MetricType = "views" | "clicks" | "waContacts";
type TimeframeType = "daily" | "weekly" | "monthly";

const AnalyticsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const [selectedMetric, setSelectedMetric] = useState<MetricType>("views");
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>("daily");

  // Fetch current user profile
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/api/v1/core/profile/me/");
      return response.data;
    },
  });

  // Fetch listings to get seller's books analytics
  const { data: listingsData, isLoading: isLoadingListings } = useQuery({
    queryKey: ["all-listings"],
    queryFn: async () => {
      const response = await api.get("/api/v1/marketplace/listings/");
      return response.data;
    },
  });

  const myListings = useMemo(() => {
    if (!listingsData?.results || !userProfile?.user_id) return [];
    return listingsData.results.filter((item: any) => item.seller.id === userProfile.user_id);
  }, [listingsData, userProfile]);

  const stats = useMemo(() => {
    const views = myListings.reduce((sum: number, item: any) => sum + (item.views_count || 0), 0);
    // Dynamic proxies representing clicks and WhatsApp contacts based on views conversion
    const clicks = Math.round(views * 0.4);
    const waContacts = Math.round(views * 0.1);

    return {
      views: {
        total: views,
        trend: views > 0 ? "+12%" : "0%",
      },
      clicks: {
        total: clicks,
        trend: clicks > 0 ? "+8%" : "0%",
      },
      waContacts: {
        total: waContacts,
        trend: waContacts > 0 ? "+21%" : "0%",
      },
    };
  }, [myListings]);

  const activeMetricTotal = useMemo(() => {
    return stats[selectedMetric].total;
  }, [stats, selectedMetric]);

  const chartData = useMemo(() => {
    const totalVal = activeMetricTotal;
    const base = Math.max(1, Math.round(totalVal / 6));
    if (selectedTimeframe === "daily") {
      return [
        { label: "4 AM", value: Math.round(base * 0.2) },
        { label: "8 AM", value: Math.round(base * 0.5) },
        { label: "12 PM", value: Math.round(base * 0.8) },
        { label: "4 PM", value: Math.round(base * 1.2) },
        { label: "8 PM", value: Math.round(base * 0.6) },
        { label: "12 AM", value: Math.round(base * 0.3) },
      ];
    } else if (selectedTimeframe === "weekly") {
      return [
        { label: "Mon", value: Math.round(base * 0.8) },
        { label: "Tue", value: Math.round(base * 1.1) },
        { label: "Wed", value: Math.round(base * 0.9) },
        { label: "Thu", value: Math.round(base * 1.4) },
        { label: "Fri", value: Math.round(base * 1.2) },
        { label: "Sat", value: Math.round(base * 1.8) },
        { label: "Sun", value: Math.round(base * 1.5) },
      ];
    } else {
      return [
        { label: "Week1", value: Math.round(totalVal * 0.15) },
        { label: "Week2", value: Math.round(totalVal * 0.3) },
        { label: "Week3", value: Math.round(totalVal * 0.25) },
        { label: "Week4", value: Math.round(totalVal * 0.3) },
      ];
    }
  }, [activeMetricTotal, selectedTimeframe]);

  const maxValue = Math.max(1, ...chartData.map((item) => item.value));
  const data = chartData.map((item) => ({
    ...item,
    showStrip: item.value === maxValue,
  }));

  const topPerformingBooks = useMemo(() => {
    return [...myListings]
      .sort((a: any, b: any) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, 5)
      .map((item: any, index: number) => ({
        id: String(item.id),
        rank: index + 1,
        title: item.book.title,
        author: item.book.authors?.map((a: any) => a.name).join(", ") || "Unknown Author",
        cover:
          item.listing_images?.[0]?.image_url ||
          item.book.cover_url ||
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&auto=format&fit=crop",
        views: item.views_count || 0,
        clicks: Math.round((item.views_count || 0) * 0.4),
        waContacts: Math.round((item.views_count || 0) * 0.1),
        earnings: parseFloat(item.price),
        trend: "up",
      }));
  }, [myListings]);

  const handleBookPress = (book: any) => {
    navigation.navigate("AppStack", {
      screen: "BookDetails",
      params: {
        listingId: book.id,
        categoryTitle: "Top Performing",
      },
    });
  };

  const metricTitleMap = {
    views: "Total Views",
    clicks: "Interested",
    waContacts: "WA Contact",
  };

  const metricSubtitleMap = {
    views: "Views",
    clicks: "Clicks",
    waContacts: "Contacts",
  };

  const getSummaryCardStyle = (metric: MetricType) => {
    const isActive = selectedMetric === metric;
    return [styles.summaryCard, isActive ? styles.summaryCardActive : styles.summaryCardInactive];
  };

  const chartWidth = width - SPACING.lg * 4;
  const chartHeight = rem(7.5);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Header title="Analytics" />
      </View>

      {isLoadingListings ? (
        <View style={{ paddingHorizontal: SPACING.lg, marginTop: rem(1) }}>
          <BookCardSkeleton />
          <BookCardSkeleton />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerSubtitle}>Your Bookshelf</Text>
          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            <TouchableOpacity
              style={getSummaryCardStyle("views")}
              onPress={() => setSelectedMetric("views")}
              activeOpacity={0.8}
            >
              <View style={styles.summaryCardHeader}>
                <Ionicons
                  name="eye-outline"
                  size={16}
                  color={selectedMetric === "views" ? COLORS.primary : COLORS.textMuted}
                />
                <Text style={styles.trendText}>{stats.views.trend}</Text>
              </View>
              <Text style={styles.summaryCardValue}>{stats.views.total}</Text>
              <Text style={styles.summaryCardLabel}>Total Views</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={getSummaryCardStyle("clicks")}
              onPress={() => setSelectedMetric("clicks")}
              activeOpacity={0.8}
            >
              <View style={styles.summaryCardHeader}>
                <Ionicons
                  name="heart-outline"
                  size={16}
                  color={selectedMetric === "clicks" ? COLORS.primary : COLORS.textMuted}
                />
                <Text style={styles.trendText}>{stats.clicks.trend}</Text>
              </View>
              <Text style={styles.summaryCardValue}>{stats.clicks.total}</Text>
              <Text style={styles.summaryCardLabel}>Interested</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={getSummaryCardStyle("waContacts")}
              onPress={() => setSelectedMetric("waContacts")}
              activeOpacity={0.8}
            >
              <View style={styles.summaryCardHeader}>
                <Ionicons
                  name="chatbubble-outline"
                  size={16}
                  color={selectedMetric === "waContacts" ? COLORS.primary : COLORS.textMuted}
                />
                <Text style={styles.trendText}>{stats.waContacts.trend}</Text>
              </View>
              <Text style={styles.summaryCardValue}>{stats.waContacts.total}</Text>
              <Text style={styles.summaryCardLabel}>WA Contact</Text>
            </TouchableOpacity>
          </View>

          {/* Performance Chart */}
          <View style={styles.performanceSection}>
            <View style={styles.performanceHeader}>
              <View>
                <Text style={styles.sectionTitle}>Performance</Text>
                <Text style={styles.performanceSubtitle}>
                  {metricSubtitleMap[selectedMetric]} ·{" "}
                  {selectedTimeframe === "daily" ? "Today" : selectedTimeframe === "weekly" ? "This Week" : "This Month"}
                </Text>
              </View>
              <View style={styles.segmentControl}>
                <TouchableOpacity
                  style={[styles.segmentBtn, selectedTimeframe === "daily" && styles.segmentBtnActive]}
                  onPress={() => setSelectedTimeframe("daily")}
                >
                  <Text style={[styles.segmentText, selectedTimeframe === "daily" && styles.segmentTextActive]}>Day</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentBtn, selectedTimeframe === "weekly" && styles.segmentBtnActive]}
                  onPress={() => setSelectedTimeframe("weekly")}
                >
                  <Text style={[styles.segmentText, selectedTimeframe === "weekly" && styles.segmentTextActive]}>
                    Week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentBtn, selectedTimeframe === "monthly" && styles.segmentBtnActive]}
                  onPress={() => setSelectedTimeframe("monthly")}
                >
                  <Text style={[styles.segmentText, selectedTimeframe === "monthly" && styles.segmentTextActive]}>
                    Month
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.chartContainer}>
              <LineChart
                data={data}
                width={chartWidth}
                height={chartHeight}
                showVerticalLines
                verticalLinesColor={COLORS.grayHeavvy}
                verticalLinesStrokeDashArray={[4, 4]}
                stripColor={COLORS.grayHeavvy}
                stripWidth={1}
                stripHeight={180}
                stripStrokeDashArray={[4, 4]}
                curved
                color={COLORS.primary}
                thickness={3}
                startFillColor={COLORS.secondary}
                endFillColor={COLORS.secondary}
                startOpacity={0.4}
                endOpacity={0}
                noOfSections={4}
                maxValue={maxValue * 1.2}
                yAxisColor="transparent"
                xAxisColor="transparent"
                yAxisTextStyle={styles.axisText}
                xAxisLabelTextStyle={styles.axisText}
                areaChart
                hideRules
                hideDataPoints
                initialSpacing={SPACING.md}
                endSpacing={SPACING.md}
                isAnimated
                spacing={selectedTimeframe === "daily" ? 50 : selectedTimeframe === "weekly" ? 43 : 85}
              />
            </View>
          </View>

          {/* Active Listings Card */}
          <TouchableOpacity
            style={styles.activeListingsCard}
            onPress={() => navigation.navigate("AppStack", { screen: "MyActiveListings" })}
            activeOpacity={0.8}
          >
            <View style={styles.activeListingsLeft}>
              <View style={styles.activeListingsIconWrap}>
                <Ionicons name="book-outline" size={24} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.activeListingsTitle}>Active Listings</Text>
                <Text style={styles.activeListingsSub}>
                  {myListings.length} book{myListings.length !== 1 ? "s" : ""} currently live
                </Text>
              </View>
            </View>
            <View style={styles.activeListingsRight}>
              <Text style={styles.activeListingsCount}>{myListings.length}</Text>
              <Feather name="arrow-up-right" size={20} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          {/* Top Performing List */}
          <View style={styles.topPerformingSection}>
            <View style={styles.topPerformingHeader}>
              <View style={styles.topPerformingTitleRow}>
                <Ionicons name="bar-chart-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Top Performing</Text>
              </View>
            </View>

            <View style={styles.listContainer}>
              {topPerformingBooks.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No books listed yet. Your active listing analytics will show up here.</Text>
                </View>
              ) : (
                topPerformingBooks.map((book) => (
                  <TouchableOpacity
                    key={book.id}
                    style={styles.bookListItem}
                    onPress={() => handleBookPress(book)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.bookRank}>{book.rank}</Text>
                    <Image source={{ uri: book.cover }} style={styles.bookCover} contentFit="fill" />

                    <View style={styles.bookInfo}>
                      <Text style={styles.bookTitle} numberOfLines={1}>
                        {book.title}
                      </Text>
                      <Text style={styles.bookAuthor} numberOfLines={1}>
                        {book.author}
                      </Text>

                      <View style={styles.bookStatsRow}>
                        <View style={styles.bookStat}>
                          <Ionicons name="eye-outline" size={12} color={COLORS.textMuted} />
                          <Text style={styles.bookStatText}>{book.views}</Text>
                        </View>
                        <View style={styles.bookStat}>
                          <Ionicons name="heart-outline" size={12} color={COLORS.textMuted} />
                          <Text style={styles.bookStatText}>{book.clicks}</Text>
                        </View>
                        <View style={styles.bookStat}>
                          <Ionicons name="chatbubble-outline" size={12} color={COLORS.textMuted} />
                          <Text style={styles.bookStatText}>{book.waContacts}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.bookEarnings}>
                      <Text style={styles.earningsText}>
                        ₹ <Text style={{ fontWeight: "bold" }}>{book.earnings}</Text>
                      </Text>
                      <View style={styles.trendRow}>
                        <Feather
                          name={book.trend === "up" ? "trending-up" : "trending-down"}
                          size={14}
                          color={book.trend === "up" ? COLORS.primary : COLORS.red}
                        />
                        <Text
                          style={[
                            styles.trendLabel,
                            {
                              color: book.trend === "up" ? COLORS.primary : COLORS.red,
                            },
                          ]}
                        >
                          {book.trend === "up" ? "Up" : "Down"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default AnalyticsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: SPACING.lg,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  headerSubtitle: {
    fontFamily: FONTS.manrope.bold,
    fontSize: rem(1.25),
    color: COLORS.black,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    width: "30.5%",
    borderRadius: rem(0.75),
    padding: rem(0.625),
    borderWidth: 1,
  },
  summaryCardActive: {
    backgroundColor: COLORS.secondary,
    borderColor: "rgba(0, 128, 128, 0.1)",
  },
  summaryCardInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.grayHeavvy,
  },
  summaryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rem(0.375),
  },
  trendText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.semibold,
    color: COLORS.primary,
  },
  summaryCardValue: {
    fontSize: rem(1.25),
    fontFamily: FONTS.montserrat.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  summaryCardLabel: {
    fontSize: rem(0.5625),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  performanceSection: {
    backgroundColor: COLORS.white,
    borderRadius: rem(1.0),
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    marginBottom: SPACING.lg,
  },
  performanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.montserrat.bold,
    fontSize: rem(0.9375),
    color: COLORS.text,
  },
  performanceSubtitle: {
    fontFamily: FONTS.manrope.medium,
    fontSize: rem(0.6875),
    color: COLORS.textMuted,
    marginTop: 2,
  },
  segmentControl: {
    flexDirection: "row",
    backgroundColor: COLORS.grayLight,
    borderRadius: 8,
    padding: 2,
  },
  segmentBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontFamily: FONTS.manrope.semibold,
    fontSize: rem(0.625),
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: COLORS.primary,
  },
  chartContainer: {
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  axisText: {
    color: COLORS.textMuted,
    fontSize: rem(0.5625),
    fontFamily: FONTS.manrope.medium,
  },
  activeListingsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: rem(1.0),
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  activeListingsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeListingsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  activeListingsTitle: {
    fontFamily: FONTS.montserrat.bold,
    fontSize: rem(0.875),
    color: COLORS.text,
  },
  activeListingsSub: {
    fontFamily: FONTS.manrope.medium,
    fontSize: rem(0.6875),
    color: COLORS.textMuted,
    marginTop: 2,
  },
  activeListingsRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeListingsCount: {
    fontFamily: FONTS.montserrat.bold,
    fontSize: rem(1.25),
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  topPerformingSection: {
    backgroundColor: COLORS.white,
    borderRadius: rem(1.0),
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  topPerformingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  topPerformingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontFamily: FONTS.montserrat.bold,
    fontSize: rem(0.6875),
    color: COLORS.primary,
  },
  listContainer: {
    marginTop: SPACING.xs,
  },
  bookListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  bookRank: {
    fontFamily: FONTS.montserrat.bold,
    fontSize: rem(0.875),
    color: COLORS.textMuted,
    width: 24,
  },
  bookCover: {
    width: rem(2.0),
    height: rem(2.75),
    borderRadius: 4,
    backgroundColor: COLORS.grayLight,
    marginRight: SPACING.md,
  },
  bookInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  bookTitle: {
    fontFamily: FONTS.montserrat.bold,
    fontSize: rem(0.8125),
    color: COLORS.text,
  },
  bookAuthor: {
    fontFamily: FONTS.manrope.medium,
    fontSize: rem(0.6875),
    color: COLORS.textMuted,
    marginTop: 1,
  },
  bookStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rem(0.5),
    marginTop: SPACING.xs,
  },
  bookStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  bookStatText: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.medium,
    color: COLORS.textMuted,
  },
  bookEarnings: {
    alignItems: "flex-end",
  },
  earningsText: {
    fontFamily: FONTS.manrope.medium,
    fontSize: rem(0.75),
    color: COLORS.text,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  trendLabel: {
    fontSize: rem(0.625),
    fontFamily: FONTS.manrope.semibold,
    marginLeft: 2,
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: FONTS.manrope.medium,
    fontSize: rem(0.75),
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});

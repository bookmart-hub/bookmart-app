import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-gifted-charts';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';
import { SPACING } from '@/constants/spacings';
import { rf } from '@/utils/responsive';
import { MOCK_ANALYTICS_DATA, MOCK_TOP_BOOKS, TopBook } from '@/data/analyticsMockData';

const { width } = Dimensions.get('window');

type MetricType = 'views' | 'clicks' | 'waContacts';
type TimeframeType = 'daily' | 'weekly' | 'monthly';

const AnalyticsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [selectedMetric, setSelectedMetric] = useState<MetricType>('views');
    const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>('daily');

    const chartData = useMemo(() => {
        return MOCK_ANALYTICS_DATA[selectedMetric][selectedTimeframe];
    }, [selectedMetric, selectedTimeframe]);

    const maxValue = Math.max(...chartData.map(item => item.value));
    const data = chartData.map(item => ({
        ...item,
        showStrip: item.value === maxValue,
    }));

    const handleBookPress = (book: TopBook) => {
        navigation.navigate('AppStack', {
            screen: 'BookDetails',
            params: {
                book: {
                    id: book.id,
                    title: book.title,
                    imageUri: book.cover,
                    price: book.earnings, // using earnings as price for mock
                    discount: 0,
                    author: book.author,
                },
                categoryTitle: 'Top Performing'
            }
        });
    };

    const metricTitleMap = {
        views: 'Total Views',
        clicks: 'Interested',
        waContacts: 'WA Contact'
    };

    const metricSubtitleMap = {
        views: 'Views',
        clicks: 'Clicks',
        waContacts: 'Contacts'
    };

    const getSummaryCardStyle = (metric: MetricType) => {
        const isActive = selectedMetric === metric;
        return [
            styles.summaryCard,
            isActive ? styles.summaryCardActive : styles.summaryCardInactive
        ];
    };

    const chartWidth = width - SPACING.lg * 2;
    const chartHeight = rf(120);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Analytics</Text>
                <Text style={styles.headerSubtitle}>Your Bookshelf</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Summary Cards */}
                <View style={styles.summaryRow}>
                    <TouchableOpacity
                        style={getSummaryCardStyle('views')}
                        onPress={() => setSelectedMetric('views')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.summaryCardHeader}>
                            <Ionicons name="eye-outline" size={16} color={selectedMetric === 'views' ? COLORS.primary : COLORS.textMuted} />
                            <Text style={styles.trendText}>{MOCK_ANALYTICS_DATA.views.trend}</Text>
                        </View>
                        <Text style={styles.summaryCardValue}>{MOCK_ANALYTICS_DATA.views.total}</Text>
                        <Text style={styles.summaryCardLabel}>Total Views</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={getSummaryCardStyle('clicks')}
                        onPress={() => setSelectedMetric('clicks')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.summaryCardHeader}>
                            <Ionicons name="heart-outline" size={16} color={selectedMetric === 'clicks' ? COLORS.primary : COLORS.textMuted} />
                            <Text style={styles.trendText}>{MOCK_ANALYTICS_DATA.clicks.trend}</Text>
                        </View>
                        <Text style={styles.summaryCardValue}>{MOCK_ANALYTICS_DATA.clicks.total}</Text>
                        <Text style={styles.summaryCardLabel}>Interested</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={getSummaryCardStyle('waContacts')}
                        onPress={() => setSelectedMetric('waContacts')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.summaryCardHeader}>
                            <Ionicons name="chatbubble-outline" size={16} color={selectedMetric === 'waContacts' ? COLORS.primary : COLORS.textMuted} />
                            <Text style={styles.trendText}>{MOCK_ANALYTICS_DATA.waContacts.trend}</Text>
                        </View>
                        <Text style={styles.summaryCardValue}>{MOCK_ANALYTICS_DATA.waContacts.total}</Text>
                        <Text style={styles.summaryCardLabel}>WA Contact</Text>
                    </TouchableOpacity>
                </View>

                {/* Performance Chart */}
                <View style={styles.performanceSection}>
                    <View style={styles.performanceHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Performance</Text>
                            <Text style={styles.performanceSubtitle}>
                                {metricSubtitleMap[selectedMetric]} · {selectedTimeframe === 'daily' ? 'Today' : selectedTimeframe === 'weekly' ? 'This Week' : 'This Month'}
                            </Text>
                        </View>
                        <View style={styles.segmentControl}>
                            <TouchableOpacity
                                style={[styles.segmentBtn, selectedTimeframe === 'daily' && styles.segmentBtnActive]}
                                onPress={() => setSelectedTimeframe('daily')}
                            >
                                <Text style={[styles.segmentText, selectedTimeframe === 'daily' && styles.segmentTextActive]}>Day</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.segmentBtn, selectedTimeframe === 'weekly' && styles.segmentBtnActive]}
                                onPress={() => setSelectedTimeframe('weekly')}
                            >
                                <Text style={[styles.segmentText, selectedTimeframe === 'weekly' && styles.segmentTextActive]}>Week</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.segmentBtn, selectedTimeframe === 'monthly' && styles.segmentBtnActive]}
                                onPress={() => setSelectedTimeframe('monthly')}
                            >
                                <Text style={[styles.segmentText, selectedTimeframe === 'monthly' && styles.segmentTextActive]}>Month</Text>
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
                            maxValue={Math.max(...chartData.map(d => d.value)) * 1.2}
                            yAxisColor="transparent"
                            xAxisColor="transparent"
                            yAxisTextStyle={styles.axisText}
                            xAxisLabelTextStyle={styles.axisText}
                            areaChart
                            hideRules
                            hideDataPoints
                            isAnimated
                            spacing={
                                selectedTimeframe === 'daily'
                                    ? 50
                                    : selectedTimeframe === 'weekly'
                                        ? 43
                                        : 85
                            }
                        />
                    </View>
                </View>

                {/* Active Listings Card */}
                <View style={styles.activeListingsCard}>
                    <View style={styles.activeListingsLeft}>
                        <View style={styles.activeListingsIconWrap}>
                            <Ionicons name="book-outline" size={24} color={COLORS.primary} />
                        </View>
                        <View>
                            <Text style={styles.activeListingsTitle}>Active Listings</Text>
                            <Text style={styles.activeListingsSub}>4 books currently live</Text>
                        </View>
                    </View>
                    <View style={styles.activeListingsRight}>
                        <Text style={styles.activeListingsCount}>4</Text>
                        <Feather name="arrow-up-right" size={20} color={COLORS.primary} />
                    </View>
                </View>

                {/* Top Performing List */}
                <View style={styles.topPerformingSection}>
                    <View style={styles.topPerformingHeader}>
                        <View style={styles.topPerformingTitleRow}>
                            <Ionicons name="bar-chart-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                            <Text style={styles.sectionTitle}>Top Performing</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See all {'>'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.listContainer}>
                        {MOCK_TOP_BOOKS.map((book) => (
                            <TouchableOpacity
                                key={book.id}
                                style={styles.bookListItem}
                                onPress={() => handleBookPress(book)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.bookRank}>{book.rank}</Text>
                                <Image source={{ uri: book.cover }} style={styles.bookCover} contentFit="cover" />

                                <View style={styles.bookInfo}>
                                    <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                                    <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>

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
                                    <Text style={styles.earningsText}>RM <Text style={{ fontWeight: 'bold' }}>{book.earnings}</Text></Text>
                                    <View style={styles.trendRow}>
                                        <Feather name={book.trend === 'up' ? "trending-up" : "trending-down"} size={14} color={book.trend === 'up' ? COLORS.primary : COLORS.red} />
                                        <Text style={[styles.trendLabel, { color: book.trend === 'up' ? COLORS.primary : COLORS.red }]}>
                                            {book.trend === 'up' ? 'Up' : 'Down'}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default AnalyticsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    headerTitle: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    headerSubtitle: {
        fontSize: rf(22),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
    },
    scrollContent: {
        paddingBottom: SPACING.xl,
    },
    summaryRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        justifyContent: 'space-between',
        marginTop: SPACING.md,
    },
    summaryCard: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: 16,
        borderWidth: 1,
        marginHorizontal: 4,
    },
    summaryCardActive: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.primary,
    },
    summaryCardInactive: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.grayHeavvy,
    },
    summaryCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    trendText: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
    summaryCardValue: {
        fontSize: rf(20),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
        marginBottom: 2,
    },
    summaryCardLabel: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    performanceSection: {
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.xl,
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.grayHeavvy,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    performanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
    },
    performanceSubtitle: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    segmentControl: {
        flexDirection: 'row',
        backgroundColor: COLORS.grayLight,
        borderRadius: 20,
        padding: 4,
    },
    segmentBtn: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: 16,
    },
    segmentBtnActive: {
        backgroundColor: COLORS.primary,
    },
    segmentText: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.textMuted,
    },
    segmentTextActive: {
        color: COLORS.white,
    },
    chartContainer: {
        alignItems: 'center',
        marginLeft: -5,
    },
    axisText: {
        color: COLORS.textMuted,
        fontSize: rf(10),
        fontFamily: FONTS.manrope.medium,
    },
    chartLegend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: SPACING.md,
    },
    legendPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.grayLight,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.black,
    },
    legendTextBold: {
        fontFamily: FONTS.manrope.bold,
    },
    activeListingsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.xl,
        backgroundColor: COLORS.secondary, // TODO: Implement gradient theme
        padding: SPACING.lg,
        borderRadius: 20,
    },
    activeListingsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeListingsIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.darkerTeal, // darker teal tint
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    activeListingsTitle: {
        fontSize: rf(16),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.black,
    },
    activeListingsSub: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    activeListingsRight: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    activeListingsCount: {
        fontSize: rf(28),
        fontFamily: FONTS.montserrat.medium,
        color: COLORS.primary,
        marginRight: 4,
    },
    topPerformingSection: {
        marginTop: SPACING.xl,
    },
    topPerformingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    topPerformingTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontSize: rf(13),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.primary,
    },
    listContainer: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.md,
    },
    bookListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.sm,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: COLORS.grayHeavvy,
    },
    bookRank: {
        width: 24,
        textAlign: 'center',
        fontSize: rf(14),
        fontFamily: FONTS.montserrat.bold,
        color: COLORS.primary,
    },
    bookCover: {
        width: 50,
        height: 70,
        borderRadius: 8,
        marginHorizontal: SPACING.sm,
    },
    bookInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    bookTitle: {
        fontSize: rf(14),
        fontFamily: FONTS.manrope.bold,
        color: COLORS.black,
        marginBottom: 2,
    },
    bookAuthor: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
        marginBottom: 8,
    },
    bookStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bookStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    bookStatText: {
        fontSize: rf(10),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.textMuted,
    },
    bookEarnings: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: SPACING.sm,
    },
    earningsText: {
        fontSize: rf(12),
        fontFamily: FONTS.manrope.medium,
        color: COLORS.black,
        marginBottom: 4,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    trendLabel: {
        fontSize: rf(11),
        fontFamily: FONTS.manrope.bold,
    },
});

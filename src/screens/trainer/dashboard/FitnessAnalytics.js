import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Import your constants (adjust path as needed)
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const FitnessAnalytics = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, clients, sessions, revenue } = useSelector(state => ({
    user: state.auth.user,
    clients: state.clients.list,
    sessions: state.sessions.completed,
    revenue: state.analytics.revenue
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('week'); // week, month, quarter, year
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Load analytics data
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = useCallback(() => {
    try {
      // Simulate API call - replace with actual analytics fetch
      // dispatch(fetchAnalyticsData({ timeRange }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load analytics data');
    }
  }, [timeRange, dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalyticsData();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadAnalyticsData]);

  // Mock data - replace with actual data from Redux store
  const analyticsData = {
    totalClients: 47,
    activeClients: 38,
    totalSessions: 156,
    completionRate: 87,
    monthlyRevenue: 12450,
    avgSessionRating: 4.8,
    clientGrowth: 12,
    retentionRate: 94
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [8200, 9100, 10300, 11200, 11800, 12450]
    }]
  };

  const sessionData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [12, 15, 18, 14, 20, 16, 8]
    }]
  };

  const clientTypeData = [
    { name: 'Weight Loss', population: 35, color: COLORS.primary, legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Strength', population: 28, color: '#764ba2', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Sports', population: 22, color: COLORS.success, legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Rehab', population: 15, color: COLORS.warning, legendFontColor: '#333', legendFontSize: 12 }
  ];

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS.primary
    }
  };

  const timeRanges = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'quarter', label: 'Quarter' },
    { key: 'year', label: 'Year' }
  ];

  const metricCards = [
    {
      title: 'Total Clients',
      value: analyticsData.totalClients,
      icon: 'people',
      color: COLORS.primary,
      change: '+12%'
    },
    {
      title: 'Active Sessions',
      value: analyticsData.totalSessions,
      icon: 'fitness-center',
      color: COLORS.success,
      change: '+8%'
    },
    {
      title: 'Monthly Revenue',
      value: `$${analyticsData.monthlyRevenue.toLocaleString()}`,
      icon: 'attach-money',
      color: '#764ba2',
      change: '+15%'
    },
    {
      title: 'Completion Rate',
      value: `${analyticsData.completionRate}%`,
      icon: 'check-circle',
      color: COLORS.warning,
      change: '+3%'
    }
  ];

  const renderMetricCard = (metric, index) => (
    <Animated.View
      key={metric.title}
      style={{
        opacity: fadeAnim,
        transform: [{
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })
        }]
      }}
    >
      <Card style={styles.metricCard}>
        <LinearGradient
          colors={[metric.color, `${metric.color}dd`]}
          style={styles.metricGradient}
        >
          <View style={styles.metricHeader}>
            <Icon name={metric.icon} size={24} color="#fff" />
            <Text style={styles.metricChange}>{metric.change}</Text>
          </View>
          <Text style={styles.metricValue}>{metric.value}</Text>
          <Text style={styles.metricTitle}>{metric.title}</Text>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  const renderChartSection = () => (
    <View style={styles.chartSection}>
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>💰 Revenue Trend</Text>
            <IconButton
              icon="trending-up"
              size={20}
              iconColor={COLORS.success}
            />
          </View>
          <LineChart
            data={revenueData}
            width={screenWidth - SPACING.xl * 2 - 32}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>📊 Weekly Sessions</Text>
            <IconButton
              icon="bar-chart"
              size={20}
              iconColor={COLORS.primary}
            />
          </View>
          <BarChart
            data={sessionData}
            width={screenWidth - SPACING.xl * 2 - 32}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>🎯 Client Categories</Text>
            <Text style={styles.chartSubtitle}>Training Focus Areas</Text>
          </View>
          <PieChart
            data={clientTypeData}
            width={screenWidth - SPACING.xl * 2 - 32}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    </View>
  );

  const renderPerformanceMetrics = () => (
    <Card style={styles.performanceCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>⭐ Performance Metrics</Text>
        
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Client Satisfaction</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingValue}>{analyticsData.avgSessionRating}</Text>
            <View style={styles.stars}>
              {[1,2,3,4,5].map(star => (
                <Icon
                  key={star}
                  name="star"
                  size={16}
                  color={star <= Math.floor(analyticsData.avgSessionRating) ? '#FFD700' : '#ddd'}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Client Retention</Text>
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={analyticsData.retentionRate / 100}
              color={COLORS.success}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>{analyticsData.retentionRate}%</Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Session Completion</Text>
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={analyticsData.completionRate / 100}
              color={COLORS.primary}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>{analyticsData.completionRate}%</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTopPerformers = () => (
    <Card style={styles.topPerformersCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>🏆 Top Performers</Text>
        
        {[
          { name: 'Sarah Johnson', progress: 95, avatar: '👩‍💼' },
          { name: 'Mike Chen', progress: 89, avatar: '👨‍💻' },
          { name: 'Emma Davis', progress: 87, avatar: '👩‍🎨' },
        ].map((client, index) => (
          <View key={client.name} style={styles.performerRow}>
            <View style={styles.performerInfo}>
              <Text style={styles.performerAvatar}>{client.avatar}</Text>
              <View>
                <Text style={styles.performerName}>{client.name}</Text>
                <Text style={styles.performerProgress}>{client.progress}% completion</Text>
              </View>
            </View>
            <Chip
              mode="outlined"
              textStyle={{ color: COLORS.success, fontSize: 12 }}
              style={{ backgroundColor: `${COLORS.success}20` }}
            >
              #{index + 1}
            </Chip>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📈 Analytics Dashboard</Text>
          <Text style={styles.headerSubtitle}>Track your training business</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Search Bar */}
        <Searchbar
          placeholder="Search analytics..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />

        {/* Time Range Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.timeRangeContainer}
        >
          {timeRanges.map(range => (
            <Chip
              key={range.key}
              selected={timeRange === range.key}
              onPress={() => setTimeRange(range.key)}
              style={[
                styles.timeRangeChip,
                timeRange === range.key && styles.selectedTimeRange
              ]}
              textStyle={{
                color: timeRange === range.key ? '#fff' : COLORS.primary
              }}
            >
              {range.label}
            </Chip>
          ))}
        </ScrollView>

        {/* Metric Cards */}
        <View style={styles.metricsGrid}>
          {metricCards.map((metric, index) => renderMetricCard(metric, index))}
        </View>

        {/* Performance Metrics */}
        {renderPerformanceMetrics()}

        {/* Charts */}
        {renderChartSection()}

        {/* Top Performers */}
        {renderTopPerformers()}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="insights"
        style={styles.fab}
        onPress={() => Alert.alert('Advanced Analytics', 'Feature coming soon! 🚀')}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginTop: -SPACING.md,
  },
  searchbar: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  timeRangeContainer: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  timeRangeChip: {
    marginRight: SPACING.sm,
    backgroundColor: '#fff',
  },
  selectedTimeRange: {
    backgroundColor: COLORS.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    width: (screenWidth - SPACING.lg * 3) / 2,
    marginRight: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 3,
  },
  metricGradient: {
    padding: SPACING.md,
    borderRadius: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricChange: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metricValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  metricTitle: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  performanceCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 3,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metricLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  stars: {
    flexDirection: 'row',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
  },
  progressText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  chartSection: {
    paddingHorizontal: SPACING.lg,
  },
  chartCard: {
    marginBottom: SPACING.lg,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  chartSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  chart: {
    borderRadius: 16,
  },
  topPerformersCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 3,
  },
  performerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  performerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  performerAvatar: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  performerName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  performerProgress: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default FitnessAnalytics;
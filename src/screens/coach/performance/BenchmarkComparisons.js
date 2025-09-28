import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  RefreshControl,
  Alert,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Platform,
  Vibration,
} from 'react-native';
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
  Portal,
  Modal,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Design System
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  border: '#e1e8ed',
  accent: '#3498db',
  info: '#17a2b8',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PerformanceAnalytics = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Redux state
  const { user, players, analytics, performance } = useSelector((state) => ({
    user: state.auth.user,
    players: state.coach.players || [],
    analytics: state.performance.analytics || {},
    performance: state.performance.data || {},
  }));

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [viewType, setViewType] = useState('team'); // team, individual, comparison
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [loading, setLoading] = useState(false);

  // Animation setup
  useFocusEffect(
    useCallback(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, [])
  );

  // Sample analytics data
  const performanceMetrics = [
    { id: 'overall', name: 'Overall', icon: 'assessment', color: COLORS.primary },
    { id: 'strength', name: 'Strength', icon: 'fitness-center', color: COLORS.error },
    { id: 'speed', name: 'Speed', icon: 'speed', color: COLORS.warning },
    { id: 'endurance', name: 'Endurance', icon: 'timer', color: COLORS.success },
    { id: 'agility', name: 'Agility', icon: 'shuffle', color: COLORS.info },
    { id: 'consistency', name: 'Consistency', icon: 'trending-up', color: COLORS.accent },
  ];

  const teamStats = {
    totalPlayers: 24,
    activeThisWeek: 22,
    avgImprovement: 12.5,
    topPerformer: 'Alex Johnson',
    improvementTrend: 'up',
    consistencyScore: 8.4,
    injuryRate: 2.1,
  };

  const chartData = {
    line: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          data: [75, 78, 82, 85, 88, 92],
          color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    },
    bar: {
      labels: ['Strength', 'Speed', 'Endurance', 'Agility', 'Power'],
      datasets: [
        {
          data: [85, 78, 92, 73, 88],
        },
      ],
    },
    pie: [
      { name: 'Excellent', population: 35, color: COLORS.success, legendFontColor: COLORS.text },
      { name: 'Good', population: 40, color: COLORS.accent, legendFontColor: COLORS.text },
      { name: 'Average', population: 20, color: COLORS.warning, legendFontColor: COLORS.text },
      { name: 'Below Avg', population: 5, color: COLORS.error, legendFontColor: COLORS.text },
    ],
  };

  const playerRankings = [
    { id: 1, name: 'Alex Johnson', score: 94.5, improvement: 8.2, trend: 'up', position: 'QB' },
    { id: 2, name: 'Maria Rodriguez', score: 91.8, improvement: 12.1, trend: 'up', position: 'RB' },
    { id: 3, name: 'James Smith', score: 89.3, improvement: -2.1, trend: 'down', position: 'WR' },
    { id: 4, name: 'Sarah Wilson', score: 87.9, improvement: 5.4, trend: 'up', position: 'LB' },
    { id: 5, name: 'Mike Chen', score: 85.2, improvement: 1.8, trend: 'stable', position: 'DB' },
  ];

  const insights = [
    {
      id: 1,
      type: 'improvement',
      title: 'Team Speed Improving',
      description: '40-yard dash times improved by average of 0.15s this month',
      icon: 'trending-up',
      color: COLORS.success,
      priority: 'high',
    },
    {
      id: 2,
      type: 'concern',
      title: 'Endurance Plateau',
      description: '3 players showing no improvement in mile run times',
      icon: 'warning',
      color: COLORS.warning,
      priority: 'medium',
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Strength Milestone',
      description: 'Team average bench press reached 180lbs',
      icon: 'jump-rope',
      color: COLORS.accent,
      priority: 'low',
    },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchAnalyticsData());
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'trending-flat';
      default: return 'help';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return COLORS.success;
      case 'down': return COLORS.error;
      case 'stable': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Performance Analytics</Text>
          <IconButton
            icon="filter-list"
            iconColor="white"
            size={24}
            onPress={() => Alert.alert('Filters', 'Advanced filtering coming soon!')}
          />
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {['week', 'month', 'quarter', 'year'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeChip,
                timeRange === range && styles.timeRangeChipActive
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive
              ]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickStats}
      >
        <Surface style={styles.statCard} elevation={2}>
          <MaterialIcons name="group" size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{teamStats.totalPlayers}</Text>
          <Text style={styles.statLabel}>Total Players</Text>
        </Surface>

        <Surface style={styles.statCard} elevation={2}>
          <MaterialIcons name="trending-up" size={24} color={COLORS.success} />
          <Text style={[styles.statNumber, { color: COLORS.success }]}>
            +{teamStats.avgImprovement}%
          </Text>
          <Text style={styles.statLabel}>Avg Improvement</Text>
        </Surface>

        <Surface style={styles.statCard} elevation={2}>
          <MaterialIcons name="star" size={24} color={COLORS.warning} />
          <Text style={styles.statNumber}>{teamStats.consistencyScore}</Text>
          <Text style={styles.statLabel}>Consistency</Text>
        </Surface>

        <Surface style={styles.statCard} elevation={2}>
          <MaterialIcons name="local-hospital" size={24} color={COLORS.error} />
          <Text style={[styles.statNumber, { color: COLORS.error }]}>
            {teamStats.injuryRate}%
          </Text>
          <Text style={styles.statLabel}>Injury Rate</Text>
        </Surface>
      </ScrollView>
    </View>
  );

  const renderMetricsSelector = () => (
    <View style={styles.metricsSection}>
      <Text style={styles.sectionTitle}>Performance Metrics</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.metricsContainer}
      >
        {performanceMetrics.map((metric) => (
          <TouchableOpacity
            key={metric.id}
            style={[
              styles.metricChip,
              selectedMetric === metric.id && { backgroundColor: metric.color }
            ]}
            onPress={() => setSelectedMetric(metric.id)}
          >
            <MaterialIcons
              name={metric.icon}
              size={20}
              color={selectedMetric === metric.id ? 'white' : metric.color}
            />
            <Text style={[
              styles.metricChipText,
              selectedMetric === metric.id && { color: 'white' }
            ]}>
              {metric.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderChart = () => {
    const chartConfig = {
      backgroundColor: 'transparent',
      backgroundGradientFrom: 'white',
      backgroundGradientTo: 'white',
      decimalPlaces: 1,
      color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: COLORS.primary,
      },
    };

    return (
      <Card style={styles.chartCard} elevation={3}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Performance Trends</Text>
            <View style={styles.chartControls}>
              <IconButton
                icon="show-chart"
                size={20}
                iconColor={chartType === 'line' ? COLORS.primary : COLORS.textSecondary}
                onPress={() => setChartType('line')}
              />
              <IconButton
                icon="bar-chart"
                size={20}
                iconColor={chartType === 'bar' ? COLORS.primary : COLORS.textSecondary}
                onPress={() => setChartType('bar')}
              />
              <IconButton
                icon="pie-chart"
                size={20}
                iconColor={chartType === 'pie' ? COLORS.primary : COLORS.textSecondary}
                onPress={() => setChartType('pie')}
              />
            </View>
          </View>

          <View style={styles.chartContainer}>
            {chartType === 'line' && (
              <LineChart
                data={chartData.line}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            )}

            {chartType === 'bar' && (
              <BarChart
                data={chartData.bar}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
              />
            )}

            {chartType === 'pie' && (
              <PieChart
                data={chartData.pie}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                style={styles.chart}
              />
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderPlayerRankings = () => (
    <Card style={styles.rankingsCard} elevation={2}>
      <Card.Content>
        <View style={styles.rankingsHeader}>
          <Text style={styles.sectionTitle}>Player Rankings</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('View All', 'Full rankings feature coming soon!')}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {playerRankings.slice(0, 5).map((player, index) => (
          <TouchableOpacity
            key={player.id}
            style={styles.playerRankItem}
            onPress={() => {
              setSelectedPlayer(player);
              Alert.alert('Player Details', 'Individual player analytics coming soon!');
            }}
          >
            <View style={styles.rankPosition}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>

            <Avatar.Text
              size={36}
              label={player.name.charAt(0)}
              style={[styles.playerAvatar, { backgroundColor: COLORS.primary }]}
            />

            <View style={styles.playerRankInfo}>
              <Text style={styles.playerRankName}>{player.name}</Text>
              <Text style={styles.playerRankPosition}>{player.position}</Text>
            </View>

            <View style={styles.playerRankStats}>
              <Text style={styles.playerScore}>{player.score}</Text>
              <View style={styles.improvementContainer}>
                <MaterialIcons
                  name={getTrendIcon(player.trend)}
                  size={14}
                  color={getTrendColor(player.trend)}
                />
                <Text style={[
                  styles.improvementText,
                  { color: getTrendColor(player.trend) }
                ]}>
                  {Math.abs(player.improvement)}%
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </Card.Content>
    </Card>
  );

  const renderInsights = () => (
    <Card style={styles.insightsCard} elevation={2}>
      <Card.Content>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        
        {insights.map((insight) => (
          <TouchableOpacity
            key={insight.id}
            style={styles.insightItem}
            onPress={() => Alert.alert('Insight Details', 'Detailed insights coming soon!')}
          >
            <View style={[styles.insightIcon, { backgroundColor: `${insight.color}20` }]}>
              <MaterialIcons
                name={insight.icon}
                size={20}
                color={insight.color}
              />
            </View>

            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>

            <View style={styles.insightPriority}>
              <View style={[
                styles.priorityDot,
                {
                  backgroundColor: insight.priority === 'high' ? COLORS.error :
                                  insight.priority === 'medium' ? COLORS.warning : COLORS.success
                }
              ]} />
            </View>
          </TouchableOpacity>
        ))}
      </Card.Content>
    </Card>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <Button
        mode="contained"
        onPress={() => Alert.alert('Generate Report', 'Report generation feature coming soon!')}
        style={styles.actionButton}
        icon="description"
      >
        Generate Report
      </Button>

      <Button
        mode="outlined"
        onPress={() => Alert.alert('Export Data', 'Data export feature coming soon!')}
        style={[styles.actionButton, { borderColor: COLORS.primary }]}
        textColor={COLORS.primary}
        icon="download"
      >
        Export Data
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {renderQuickStats()}
          {renderMetricsSelector()}
          {renderChart()}
          {renderPlayerRankings()}
          {renderInsights()}
          {renderActionButtons()}
        </Animated.View>
      </ScrollView>

      <FAB
        icon="analytics"
        style={styles.fab}
        onPress={() => Alert.alert('Advanced Analytics', 'Advanced analytics features coming soon!')}
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
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeRangeChip: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  timeRangeChipActive: {
    backgroundColor: 'white',
  },
  timeRangeText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  quickStatsContainer: {
    paddingVertical: SPACING.md,
  },
  quickStats: {
    paddingHorizontal: SPACING.md,
  },
  statCard: {
    alignItems: 'center',
    padding: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 12,
    backgroundColor: 'white',
    minWidth: 100,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  metricsSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
  },
  metricsContainer: {
    paddingVertical: SPACING.xs,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    marginRight: SPACING.sm,
    elevation: 1,
  },
  metricChipText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  chartCard: {
    margin: SPACING.md,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartTitle: {
    ...TEXT_STYLES.h3,
  },
  chartControls: {
    flexDirection: 'row',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: SPACING.xs,
    borderRadius: 16,
  },
  rankingsCard: {
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  rankingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  playerRankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rankPosition: {
    width: 24,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  rankNumber: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  playerAvatar: {
    marginRight: SPACING.sm,
  },
  playerRankInfo: {
    flex: 1,
  },
  playerRankName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  playerRankPosition: {
    ...TEXT_STYLES.caption,
  },
  playerRankStats: {
    alignItems: 'flex-end',
  },
  playerScore: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  improvementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  improvementText: {
    ...TEXT_STYLES.small,
    marginLeft: 2,
    fontWeight: '600',
  },
  insightsCard: {
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  insightDescription: {
    ...TEXT_STYLES.caption,
  },
  insightPriority: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionButtons: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default PerformanceAnalytics;
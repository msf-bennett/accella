import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Dimensions,
  Animated,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Portal,
  Modal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, RadarChart } from 'react-native-chart-kit';

// Design System Imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#6c757d',
  border: '#e9ecef',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const screenWidth = Dimensions.get('window').width;

const ComparisonAnalytics = ({ navigation }) => {
  // Redux State
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const playerStats = useSelector(state => state.player.stats);
  const isLoading = useSelector(state => state.player.loading);

  // Local State
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('performance');
  const [comparisonType, setComparisonType] = useState('time'); // 'time', 'peers', 'goals'
  const [timeRange, setTimeRange] = useState('3months');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPeriods, setSelectedPeriods] = useState(['current', 'previous']);
  const [searchQuery, setSearchQuery] = useState('');

  // Animation References
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Sample Data (in real app, this would come from Redux/API)
  const [analyticsData, setAnalyticsData] = useState({
    performance: {
      current: { score: 85, improvement: 12, trend: 'up' },
      previous: { score: 73, improvement: -5, trend: 'down' },
      target: { score: 90, improvement: 5, trend: 'up' },
    },
    fitness: {
      current: { score: 78, improvement: 8, trend: 'up' },
      previous: { score: 70, improvement: 2, trend: 'up' },
      target: { score: 85, improvement: 7, trend: 'up' },
    },
    skills: {
      current: { score: 82, improvement: 15, trend: 'up' },
      previous: { score: 67, improvement: -3, trend: 'down' },
      target: { score: 88, improvement: 6, trend: 'up' },
    },
    consistency: {
      current: { score: 91, improvement: 3, trend: 'up' },
      previous: { score: 88, improvement: 1, trend: 'up' },
      target: { score: 95, improvement: 4, trend: 'up' },
    },
  });

  // Chart Data
  const performanceChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: [70, 75, 82, 85],
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 3,
      },
      {
        data: [68, 70, 75, 73],
        color: (opacity = 1) => `rgba(118, 75, 162, ${opacity})`,
        strokeWidth: 3,
      },
    ],
    legend: ['Current Period', 'Previous Period'],
  };

  const radarData = {
    labels: ['Speed', 'Strength', 'Endurance', 'Skill', 'Tactical', 'Mental'],
    datasets: [
      {
        data: [85, 78, 82, 90, 75, 88],
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 2,
        fillShadowGradient: COLORS.primary,
        fillShadowGradientOpacity: 0.3,
      },
    ],
  };

  const comparisonMetrics = [
    {
      id: 'performance',
      title: 'Overall Performance',
      icon: 'trending-up',
      color: COLORS.primary,
    },
    {
      id: 'fitness',
      title: 'Physical Fitness',
      icon: 'fitness-center',
      color: COLORS.success,
    },
    {
      id: 'skills',
      title: 'Technical Skills',
      icon: 'sports-soccer',
      color: COLORS.warning,
    },
    {
      id: 'consistency',
      title: 'Consistency',
      icon: 'timeline',
      color: COLORS.secondary,
    },
  ];

  const comparisonOptions = [
    { id: 'time', title: 'Time Periods', icon: 'access-time' },
    { id: 'peers', title: 'Peer Comparison', icon: 'people' },
    { id: 'goals', title: 'Goals vs Actual', icon: 'flag' },
  ];

  // Effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app: dispatch(fetchPlayerAnalytics());
      setRefreshing(false);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh analytics data');
    }
  }, [dispatch]);

  const handleMetricSelect = useCallback((metricId) => {
    Vibration.vibrate(30);
    setSelectedMetric(metricId);
  }, []);

  const handleComparisonTypeChange = useCallback((type) => {
    Vibration.vibrate(30);
    setComparisonType(type);
  }, []);

  const handleShowDetails = useCallback((metric) => {
    Alert.alert(
      '🚧 Feature Development',
      'Detailed analytics view is coming soon! This will show comprehensive breakdowns and historical trends.',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  }, []);

  const renderTrendIcon = (trend, improvement) => {
    if (trend === 'up' && improvement > 0) {
      return <MaterialIcons name="trending-up" size={20} color={COLORS.success} />;
    } else if (trend === 'down' || improvement < 0) {
      return <MaterialIcons name="trending-down" size={20} color={COLORS.error} />;
    } else {
      return <MaterialIcons name="trending-flat" size={20} color={COLORS.textSecondary} />;
    }
  };

  const renderMetricCard = (metricData, period, title) => {
    const isTarget = period === 'target';
    const cardColor = isTarget ? COLORS.primary : COLORS.surface;
    const textColor = isTarget ? COLORS.surface : COLORS.text;

    return (
      <Surface style={[styles.metricCard, { backgroundColor: cardColor }]} elevation={2}>
        <Text style={[styles.periodTitle, { color: textColor }]}>{title}</Text>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, { color: textColor }]}>
            {metricData.score}
          </Text>
          <Text style={[styles.scoreUnit, { color: isTarget ? COLORS.surface : COLORS.textSecondary }]}>
            /100
          </Text>
        </View>
        <View style={styles.improvementContainer}>
          {renderTrendIcon(metricData.trend, metricData.improvement)}
          <Text style={[styles.improvementText, { 
            color: metricData.improvement >= 0 ? COLORS.success : COLORS.error 
          }]}>
            {metricData.improvement > 0 ? '+' : ''}{metricData.improvement}%
          </Text>
        </View>
        {!isTarget && (
          <ProgressBar
            progress={metricData.score / 100}
            color={COLORS.primary}
            style={styles.progressBar}
          />
        )}
      </Surface>
    );
  };

  const renderComparisonChart = () => {
    switch (comparisonType) {
      case 'time':
        return (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.chartTitle}>Performance Over Time 📈</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={performanceChartData}
                  width={screenWidth + 50}
                  height={220}
                  chartConfig={{
                    backgroundColor: COLORS.surface,
                    backgroundGradientFrom: COLORS.surface,
                    backgroundGradientTo: COLORS.background,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: COLORS.primary,
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              </ScrollView>
            </Card.Content>
          </Card>
        );
      
      case 'peers':
        return (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.chartTitle}>Peer Comparison 👥</Text>
              <View style={styles.peerComparisonContainer}>
                <Text style={styles.peerNote}>
                  Anonymous comparison with players in your age group and skill level
                </Text>
                <View style={styles.peerStatsGrid}>
                  <View style={styles.peerStat}>
                    <Text style={styles.peerRank}>Top 15%</Text>
                    <Text style={styles.peerLabel}>Overall Rank</Text>
                  </View>
                  <View style={styles.peerStat}>
                    <Text style={styles.peerRank}>8.2/10</Text>
                    <Text style={styles.peerLabel}>Peer Rating</Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        );
      
      case 'goals':
        return (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.chartTitle}>Goals vs Performance 🎯</Text>
              <RadarChart
                data={radarData}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: COLORS.surface,
                  backgroundGradientFrom: COLORS.surface,
                  backgroundGradientTo: COLORS.background,
                  color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                  strokeWidth: 2,
                }}
                style={styles.chart}
              />
            </Card.Content>
          </Card>
        );
      
      default:
        return null;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent
      />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-back"
            iconColor={COLORS.surface}
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Performance Comparison</Text>
          <IconButton
            icon="filter-list"
            iconColor={COLORS.surface}
            size={24}
            onPress={() => setShowFilterModal(true)}
          />
        </View>
        <Text style={styles.headerSubtitle}>
          Compare your progress and find areas for improvement 🚀
        </Text>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
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
          {/* Comparison Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comparison Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipContainer}
            >
              {comparisonOptions.map((option) => (
                <Chip
                  key={option.id}
                  mode={comparisonType === option.id ? 'flat' : 'outlined'}
                  selected={comparisonType === option.id}
                  onPress={() => handleComparisonTypeChange(option.id)}
                  icon={option.icon}
                  style={[
                    styles.chip,
                    comparisonType === option.id && styles.selectedChip,
                  ]}
                  textStyle={[
                    styles.chipText,
                    comparisonType === option.id && styles.selectedChipText,
                  ]}
                >
                  {option.title}
                </Chip>
              ))}
            </ScrollView>
          </View>

          {/* Metric Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            <View style={styles.metricsGrid}>
              {comparisonMetrics.map((metric) => (
                <TouchableOpacity
                  key={metric.id}
                  style={[
                    styles.metricSelector,
                    selectedMetric === metric.id && styles.selectedMetricSelector,
                  ]}
                  onPress={() => handleMetricSelect(metric.id)}
                >
                  <MaterialIcons
                    name={metric.icon}
                    size={24}
                    color={selectedMetric === metric.id ? COLORS.surface : metric.color}
                  />
                  <Text
                    style={[
                      styles.metricSelectorText,
                      selectedMetric === metric.id && styles.selectedMetricSelectorText,
                    ]}
                  >
                    {metric.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comparison Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {comparisonType === 'time' ? 'Time Period Comparison' :
               comparisonType === 'peers' ? 'Peer Comparison' : 'Goal Comparison'}
            </Text>
            
            <View style={styles.comparisonCards}>
              {comparisonType === 'time' && (
                <>
                  {renderMetricCard(
                    analyticsData[selectedMetric].current,
                    'current',
                    'Current Period'
                  )}
                  {renderMetricCard(
                    analyticsData[selectedMetric].previous,
                    'previous',
                    'Previous Period'
                  )}
                </>
              )}
              
              {(comparisonType === 'goals' || comparisonType === 'peers') && (
                <>
                  {renderMetricCard(
                    analyticsData[selectedMetric].current,
                    'current',
                    'Your Performance'
                  )}
                  {renderMetricCard(
                    analyticsData[selectedMetric].target,
                    'target',
                    comparisonType === 'goals' ? 'Target Goal' : 'Peer Average'
                  )}
                </>
              )}
            </View>
          </View>

          {/* Chart Section */}
          <View style={styles.section}>
            {renderComparisonChart()}
          </View>

          {/* Insights Section */}
          <Card style={styles.insightsCard}>
            <Card.Content>
              <Text style={styles.insightsTitle}>💡 Key Insights</Text>
              <View style={styles.insightsList}>
                <View style={styles.insightItem}>
                  <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
                  <Text style={styles.insightText}>
                    Your consistency score improved by 3% this period!
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <MaterialIcons name="trending-up" size={20} color={COLORS.primary} />
                  <Text style={styles.insightText}>
                    Technical skills showing strongest improvement trend
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <MaterialIcons name="flag" size={20} color={COLORS.warning} />
                  <Text style={styles.insightText}>
                    Focus on endurance training to reach your fitness goals
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => handleShowDetails(selectedMetric)}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
              icon="analytics"
            >
              View Detailed Analysis
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleShowDetails('export')}
              style={styles.secondaryButton}
              contentStyle={styles.buttonContent}
              icon="share"
            >
              Share Progress
            </Button>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilterModal}
          onDismiss={() => setShowFilterModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Filter Options</Text>
          <Text style={styles.modalSubtitle}>Coming Soon! 🚧</Text>
          <Text style={styles.modalDescription}>
            Advanced filtering options including date ranges, specific metrics, 
            and comparison groups will be available in the next update.
          </Text>
          <Button
            mode="contained"
            onPress={() => setShowFilterModal(false)}
            style={styles.modalButton}
          >
            Got it!
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    gap: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.surface,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.surface,
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  chip: {
    backgroundColor: COLORS.surface,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
  },
  selectedChipText: {
    color: COLORS.surface,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metricSelector: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMetricSelector: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  metricSelectorText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  selectedMetricSelectorText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  comparisonCards: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  metricCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  periodTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreUnit: {
    ...TEXT_STYLES.caption,
  },
  improvementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  improvementText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  chartCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  chartTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: 16,
  },
  peerComparisonContainer: {
    alignItems: 'center',
    gap: SPACING.lg,
  },
  peerNote: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  peerStatsGrid: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  peerStat: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  peerRank: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  peerLabel: {
    ...TEXT_STYLES.caption,
  },
  insightsCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  insightsTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
  },
  insightsList: {
    gap: SPACING.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  insightText: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  actionButtons: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    borderColor: COLORS.primary,
  },
  buttonContent: {
    paddingVertical: SPACING.sm,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    margin: SPACING.xl,
    borderRadius: 20,
  },
  modalTitle: {
    ...TEXT_STYLES.title,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
  },
});

export default ComparisonAnalytics;
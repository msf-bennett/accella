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
  FlatList,
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
  FAB,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  LineChart, 
  BarChart, 
  PieChart, 
  ContributionGraph,
  StackedBarChart,
  ProgressChart 
} from 'react-native-chart-kit';

// Design System Imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#6c757d',
  border: '#e9ecef',
  accent: '#ff6b6b',
  purple: '#9b59b6',
  orange: '#f39c12',
  teal: '#1abc9c',
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
  small: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
};

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 32;

const DataVisualization = ({ navigation }) => {
  // Redux State
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const playerData = useSelector(state => state.player.data);
  const isLoading = useSelector(state => state.player.loading);

  // Local State
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeVisualization, setActiveVisualization] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);

  // Animation References
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Sample Data (in real app, this would come from Redux/API)
  const [visualizationData, setVisualizationData] = useState({
    performanceTrend: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        data: [72, 78, 85, 88],
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 3,
      }],
    },
    skillsBreakdown: [
      { name: 'Speed', population: 85, color: COLORS.primary, legendFontColor: COLORS.text },
      { name: 'Strength', population: 78, color: COLORS.success, legendFontColor: COLORS.text },
      { name: 'Endurance', population: 92, color: COLORS.warning, legendFontColor: COLORS.text },
      { name: 'Agility', population: 76, color: COLORS.accent, legendFontColor: COLORS.text },
      { name: 'Technical', population: 89, color: COLORS.purple, legendFontColor: COLORS.text },
    ],
    weeklyActivity: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [2.5, 3.0, 0, 2.8, 3.2, 4.1, 1.5],
      }],
    },
    progressMetrics: {
      data: [0.85, 0.72, 0.93, 0.68, 0.89],
    },
    heatmapData: [
      { date: '2024-01-01', count: 1 },
      { date: '2024-01-02', count: 3 },
      { date: '2024-01-03', count: 0 },
      { date: '2024-01-04', count: 2 },
      { date: '2024-01-05', count: 4 },
    ],
    trainingLoad: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      data: [
        { low: 45, medium: 35, high: 20 },
        { low: 40, medium: 40, high: 20 },
        { low: 35, medium: 45, high: 20 },
        { low: 30, medium: 50, high: 20 },
      ],
    },
  });

  const timeRanges = [
    { id: 'week', title: 'This Week', icon: 'today' },
    { id: 'month', title: 'This Month', icon: 'date-range' },
    { id: '3months', title: '3 Months', icon: 'calendar-view-month' },
    { id: 'year', title: 'This Year', icon: 'calendar-today' },
  ];

  const visualizationTypes = [
    { 
      id: 'overview', 
      title: 'Overview', 
      icon: 'dashboard',
      color: COLORS.primary,
      description: 'Key metrics at a glance'
    },
    { 
      id: 'performance', 
      title: 'Performance', 
      icon: 'trending-up',
      color: COLORS.success,
      description: 'Training performance trends'
    },
    { 
      id: 'skills', 
      title: 'Skills', 
      icon: 'psychology',
      color: COLORS.warning,
      description: 'Skill development breakdown'
    },
    { 
      id: 'activity', 
      title: 'Activity', 
      icon: 'fitness-center',
      color: COLORS.info,
      description: 'Training activity patterns'
    },
    { 
      id: 'progress', 
      title: 'Progress', 
      icon: 'timeline',
      color: COLORS.accent,
      description: 'Goal completion tracking'
    },
  ];

  const kpiData = [
    { title: 'Training Hours', value: '45.2', unit: 'hrs', change: '+12%', trend: 'up', color: COLORS.primary },
    { title: 'Avg Performance', value: '8.4', unit: '/10', change: '+0.8', trend: 'up', color: COLORS.success },
    { title: 'Session Streak', value: '12', unit: 'days', change: '+5', trend: 'up', color: COLORS.warning },
    { title: 'Goal Progress', value: '78', unit: '%', change: '+15%', trend: 'up', color: COLORS.info },
  ];

  // Effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
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
      
      // In real app: dispatch(fetchVisualizationData());
      setRefreshing(false);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh visualization data');
    }
  }, [dispatch]);

  const handleVisualizationChange = useCallback((vizId) => {
    Vibration.vibrate(30);
    setActiveVisualization(vizId);
  }, []);

  const handleTimeRangeChange = useCallback((rangeId) => {
    Vibration.vibrate(30);
    setSelectedTimeRange(rangeId);
  }, []);

  const handleCardExpand = useCallback((cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  }, [expandedCard]);

  const handleExportData = useCallback(() => {
    Alert.alert(
      '🚧 Feature Development',
      'Data export functionality is coming soon! You\'ll be able to export your training data in various formats.',
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  }, []);

  const chartConfig = {
    backgroundColor: COLORS.surface,
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.background,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: COLORS.border,
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
    },
  };

  const renderKPICard = (kpi, index) => (
    <Surface key={index} style={styles.kpiCard} elevation={2}>
      <LinearGradient
        colors={[kpi.color, `${kpi.color}20`]}
        style={styles.kpiGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.kpiContent}>
          <Text style={styles.kpiTitle}>{kpi.title}</Text>
          <View style={styles.kpiValueContainer}>
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <Text style={styles.kpiUnit}>{kpi.unit}</Text>
          </View>
          <View style={styles.kpiChangeContainer}>
            <MaterialIcons
              name={kpi.trend === 'up' ? 'trending-up' : 'trending-down'}
              size={16}
              color={kpi.trend === 'up' ? COLORS.success : COLORS.error}
            />
            <Text style={[
              styles.kpiChange,
              { color: kpi.trend === 'up' ? COLORS.success : COLORS.error }
            ]}>
              {kpi.change}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderOverviewCharts = () => (
    <View style={styles.chartsContainer}>
      {/* Performance Trend */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>📈 Performance Trend</Text>
            <IconButton
              icon={expandedCard === 'performance' ? 'expand-less' : 'expand-more'}
              size={20}
              onPress={() => handleCardExpand('performance')}
            />
          </View>
          <LineChart
            data={visualizationData.performanceTrend}
            width={chartWidth - 32}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          {expandedCard === 'performance' && (
            <View style={styles.expandedContent}>
              <Divider style={styles.divider} />
              <Text style={styles.insightText}>
                💡 Your performance has improved by 22% over the last month!
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Skills Breakdown */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>🎯 Skills Breakdown</Text>
            <IconButton
              icon={expandedCard === 'skills' ? 'expand-less' : 'expand-more'}
              size={20}
              onPress={() => handleCardExpand('skills')}
            />
          </View>
          <PieChart
            data={visualizationData.skillsBreakdown}
            width={chartWidth - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
          {expandedCard === 'skills' && (
            <View style={styles.expandedContent}>
              <Divider style={styles.divider} />
              <Text style={styles.insightText}>
                🚀 Endurance is your strongest skill. Focus on improving agility for better overall performance.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Weekly Activity */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>📅 Weekly Activity</Text>
            <IconButton
              icon={expandedCard === 'activity' ? 'expand-less' : 'expand-more'}
              size={20}
              onPress={() => handleCardExpand('activity')}
            />
          </View>
          <BarChart
            data={visualizationData.weeklyActivity}
            width={chartWidth - 32}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
            }}
            style={styles.chart}
            yAxisSuffix="h"
          />
          {expandedCard === 'activity' && (
            <View style={styles.expandedContent}>
              <Divider style={styles.divider} />
              <Text style={styles.insightText}>
                💪 Saturday is your most active day. Consider adding a recovery session on Wednesday.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Progress Metrics */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>🎖️ Progress Metrics</Text>
            <IconButton
              icon={expandedCard === 'progress' ? 'expand-less' : 'expand-more'}
              size={20}
              onPress={() => handleCardExpand('progress')}
            />
          </View>
          <ProgressChart
            data={visualizationData.progressMetrics}
            width={chartWidth - 32}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1, index) => {
                const colors = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.info, COLORS.accent];
                return colors[index % colors.length] || COLORS.primary;
              },
            }}
            hideLegend={false}
            style={styles.chart}
          />
          {expandedCard === 'progress' && (
            <View style={styles.expandedContent}>
              <Divider style={styles.divider} />
              <View style={styles.progressLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: COLORS.primary }]} />
                  <Text style={styles.legendText}>Speed (85%)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
                  <Text style={styles.legendText}>Strength (72%)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: COLORS.warning }]} />
                  <Text style={styles.legendText}>Endurance (93%)</Text>
                </View>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderVisualizationSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.sectionTitle}>Visualization Type</Text>
      <FlatList
        data={visualizationTypes}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.vizSelectorList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.vizSelector,
              activeVisualization === item.id && styles.selectedVizSelector,
            ]}
            onPress={() => handleVisualizationChange(item.id)}
          >
            <LinearGradient
              colors={
                activeVisualization === item.id
                  ? [item.color, `${item.color}80`]
                  : [COLORS.surface, COLORS.surface]
              }
              style={styles.vizSelectorGradient}
            >
              <MaterialIcons
                name={item.icon}
                size={24}
                color={activeVisualization === item.id ? COLORS.surface : item.color}
              />
              <Text
                style={[
                  styles.vizSelectorTitle,
                  activeVisualization === item.id && styles.selectedVizSelectorTitle,
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.vizSelectorDescription,
                  activeVisualization === item.id && styles.selectedVizSelectorDescription,
                ]}
              >
                {item.description}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
    </View>
  );

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
          <Text style={styles.headerTitle}>Data Visualization</Text>
          <IconButton
            icon="share"
            iconColor={COLORS.surface}
            size={24}
            onPress={handleExportData}
          />
        </View>
        <Text style={styles.headerSubtitle}>
          Explore your training data with interactive charts 📊
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
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
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
          {/* Time Range Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time Range</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timeRangeContainer}
            >
              {timeRanges.map((range) => (
                <Chip
                  key={range.id}
                  mode={selectedTimeRange === range.id ? 'flat' : 'outlined'}
                  selected={selectedTimeRange === range.id}
                  onPress={() => handleTimeRangeChange(range.id)}
                  icon={range.icon}
                  style={[
                    styles.timeRangeChip,
                    selectedTimeRange === range.id && styles.selectedTimeRangeChip,
                  ]}
                  textStyle={[
                    styles.chipText,
                    selectedTimeRange === range.id && styles.selectedChipText,
                  ]}
                >
                  {range.title}
                </Chip>
              ))}
            </ScrollView>
          </View>

          {/* KPI Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Metrics 🏆</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.kpiContainer}
            >
              {kpiData.map((kpi, index) => renderKPICard(kpi, index))}
            </ScrollView>
          </View>

          {/* Visualization Type Selector */}
          {renderVisualizationSelector()}

          {/* Charts Section */}
          {activeVisualization === 'overview' && renderOverviewCharts()}
          {activeVisualization !== 'overview' && (
            <View style={styles.comingSoonContainer}>
              <MaterialIcons name="construction" size={64} color={COLORS.textSecondary} />
              <Text style={styles.comingSoonTitle}>
                {visualizationTypes.find(v => v.id === activeVisualization)?.title} View
              </Text>
              <Text style={styles.comingSoonText}>
                Detailed {activeVisualization} visualization is coming soon! 🚧
              </Text>
            </View>
          )}

          {/* Quick Actions */}
          <Card style={styles.actionsCard}>
            <Card.Content>
              <Text style={styles.actionsTitle}>Quick Actions ⚡</Text>
              <View style={styles.actionsGrid}>
                <Button
                  mode="outlined"
                  onPress={() => Alert.alert('Coming Soon', 'Custom report generation is in development!')}
                  style={styles.actionButton}
                  icon="assessment"
                >
                  Generate Report
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => Alert.alert('Coming Soon', 'Data comparison tools are in development!')}
                  style={styles.actionButton}
                  icon="compare"
                >
                  Compare Periods
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setShowFilterModal(true)}
                  style={styles.actionButton}
                  icon="filter-list"
                >
                  Advanced Filters
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleExportData}
                  style={styles.actionButton}
                  icon="download"
                >
                  Export Data
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button */}
      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={onRefresh}
        color={COLORS.surface}
      />

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilterModal}
          onDismiss={() => setShowFilterModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Advanced Filters</Text>
          <Text style={styles.modalSubtitle}>Coming Soon! 🚧</Text>
          <Text style={styles.modalDescription}>
            Advanced filtering options including custom date ranges, 
            specific metrics selection, and data drill-down capabilities 
            will be available in the next update.
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
    paddingBottom: SPACING.xl * 2,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  timeRangeChip: {
    backgroundColor: COLORS.surface,
  },
  selectedTimeRangeChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
  },
  selectedChipText: {
    color: COLORS.surface,
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  kpiCard: {
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 140,
  },
  kpiGradient: {
    padding: SPACING.md,
  },
  kpiContent: {
    gap: SPACING.sm,
  },
  kpiTitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.surface,
    fontWeight: '600',
  },
  kpiValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  kpiUnit: {
    ...TEXT_STYLES.small,
    color: COLORS.surface,
    opacity: 0.8,
  },
  kpiChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  kpiChange: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  selectorContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  vizSelectorList: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  vizSelector: {
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 120,
  },
  selectedVizSelector: {
    transform: [{ scale: 1.05 }],
  },
  vizSelectorGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
    minHeight: 100,
    justifyContent: 'center',
  },
  vizSelectorTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedVizSelectorTitle: {
    color: COLORS.surface,
  },
  vizSelectorDescription: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
    opacity: 0.8,
  },
  selectedVizSelectorDescription: {
    color: COLORS.surface,
  },
  chartsContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.lg,
  },
  chartCard: {
    marginBottom: SPACING.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartTitle: {
    ...TEXT_STYLES.subtitle,
    flex: 1,
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: 16,
  },
  expandedContent: {
    marginTop: SPACING.md,
  },
  divider: {
    marginBottom: SPACING.md,
  },
  insightText: {
    ...TEXT_STYLES.body,
    fontStyle: 'italic',
    color: COLORS.primary,
  },
  progressLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...TEXT_STYLES.caption,
  },
  comingSoonContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  comingSoonTitle: {
    ...TEXT_STYLES.subtitle,
    textAlign: 'center',
  },
  comingSoonText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  actionsCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  actionsTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    minWidth: '48%',
    marginBottom: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
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

export default DataVisualization;
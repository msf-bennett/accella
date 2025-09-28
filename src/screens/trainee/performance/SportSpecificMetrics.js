import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Alert,
  Vibration,
  Animated,
  StatusBar,
  TouchableOpacity,
  FlatList,
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
  SegmentedButtons,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Constants (would be imported from your design system)
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 22, fontWeight: 'bold' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
};

const { width } = Dimensions.get('window');

const SportSpecificMetrics = ({ navigation }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('football');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showModal, setShowModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [metricsData, setMetricsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overview');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Redux
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const sportMetrics = useSelector(state => state.performance.sportMetrics);

  // Sports and their specific metrics
  const sportsData = {
    football: {
      name: 'Football ⚽',
      color: '#4CAF50',
      metrics: [
        {
          id: 'passes_completed',
          name: 'Pass Accuracy',
          icon: 'sports-soccer',
          value: 87,
          unit: '%',
          change: +5,
          target: 90,
          category: 'technical',
          data: [82, 85, 87, 84, 87, 89, 87],
          description: 'Successful passes out of total attempts',
        },
        {
          id: 'sprint_speed',
          name: 'Sprint Speed',
          icon: 'speed',
          value: 28.5,
          unit: 'km/h',
          change: +1.2,
          target: 30,
          category: 'physical',
          data: [27.3, 27.8, 28.1, 28.0, 28.5, 28.3, 28.5],
          description: 'Maximum running speed achieved',
        },
        {
          id: 'shots_on_target',
          name: 'Shot Accuracy',
          icon: 'gps-fixed',
          value: 65,
          unit: '%',
          change: -3,
          target: 75,
          category: 'technical',
          data: [68, 67, 65, 69, 65, 63, 65],
          description: 'Shots on target percentage',
        },
        {
          id: 'distance_covered',
          name: 'Distance Covered',
          icon: 'timeline',
          value: 11.2,
          unit: 'km',
          change: +0.8,
          target: 12,
          category: 'physical',
          data: [10.4, 10.8, 11.2, 10.9, 11.2, 11.5, 11.2],
          description: 'Total distance covered per match',
        },
      ],
    },
    basketball: {
      name: 'Basketball 🏀',
      color: '#FF9800',
      metrics: [
        {
          id: 'free_throw_pct',
          name: 'Free Throw %',
          icon: 'sports-basketball',
          value: 78,
          unit: '%',
          change: +4,
          target: 85,
          category: 'technical',
          data: [74, 76, 78, 75, 78, 80, 78],
          description: 'Free throw shooting percentage',
        },
        {
          id: 'vertical_jump',
          name: 'Vertical Jump',
          icon: 'expand-less',
          value: 68,
          unit: 'cm',
          change: +2,
          target: 75,
          category: 'physical',
          data: [66, 67, 68, 66, 68, 69, 68],
          description: 'Maximum vertical jump height',
        },
        {
          id: 'three_point_pct',
          name: '3-Point %',
          icon: 'filter-3',
          value: 42,
          unit: '%',
          change: +6,
          target: 45,
          category: 'technical',
          data: [36, 38, 42, 39, 42, 44, 42],
          description: 'Three-point shooting percentage',
        },
        {
          id: 'assists_per_game',
          name: 'Assists/Game',
          icon: 'group-work',
          value: 5.8,
          unit: 'avg',
          change: +0.3,
          target: 7,
          category: 'tactical',
          data: [5.5, 5.6, 5.8, 5.4, 5.8, 6.1, 5.8],
          description: 'Average assists per game',
        },
      ],
    },
    tennis: {
      name: 'Tennis 🎾',
      color: '#2196F3',
      metrics: [
        {
          id: 'serve_speed',
          name: 'Serve Speed',
          icon: 'sports-tennis',
          value: 185,
          unit: 'km/h',
          change: +8,
          target: 200,
          category: 'technical',
          data: [177, 180, 185, 182, 185, 188, 185],
          description: 'Average first serve speed',
        },
        {
          id: 'first_serve_pct',
          name: 'First Serve %',
          icon: 'check-circle',
          value: 68,
          unit: '%',
          change: +3,
          target: 75,
          category: 'technical',
          data: [65, 66, 68, 64, 68, 70, 68],
          description: 'First serve success rate',
        },
        {
          id: 'unforced_errors',
          name: 'Unforced Errors',
          icon: 'error-outline',
          value: 15,
          unit: 'per set',
          change: -2,
          target: 10,
          category: 'technical',
          data: [17, 16, 15, 18, 15, 13, 15],
          description: 'Average unforced errors per set',
        },
        {
          id: 'court_coverage',
          name: 'Court Coverage',
          icon: 'directions-run',
          value: 2.8,
          unit: 'km/set',
          change: +0.2,
          target: 3.2,
          category: 'physical',
          data: [2.6, 2.7, 2.8, 2.5, 2.8, 3.0, 2.8],
          description: 'Distance covered per set',
        },
      ],
    },
    swimming: {
      name: 'Swimming 🏊‍♀️',
      color: '#00BCD4',
      metrics: [
        {
          id: 'freestyle_50m',
          name: '50m Freestyle',
          icon: 'pool',
          value: 26.8,
          unit: 'sec',
          change: -0.3,
          target: 25.5,
          category: 'technical',
          data: [27.1, 26.9, 26.8, 27.2, 26.8, 26.5, 26.8],
          description: '50 meter freestyle time',
        },
        {
          id: 'stroke_rate',
          name: 'Stroke Rate',
          icon: 'rotate-right',
          value: 52,
          unit: 'spm',
          change: +1,
          target: 55,
          category: 'technical',
          data: [51, 51, 52, 50, 52, 53, 52],
          description: 'Strokes per minute',
        },
        {
          id: 'distance_per_stroke',
          name: 'Distance/Stroke',
          icon: 'straighten',
          value: 2.1,
          unit: 'm',
          change: +0.1,
          target: 2.3,
          category: 'technical',
          data: [2.0, 2.0, 2.1, 1.9, 2.1, 2.2, 2.1],
          description: 'Distance covered per stroke',
        },
        {
          id: 'vo2_max',
          name: 'VO2 Max',
          icon: 'air',
          value: 58,
          unit: 'ml/kg/min',
          change: +2,
          target: 65,
          category: 'physical',
          data: [56, 57, 58, 55, 58, 60, 58],
          description: 'Maximum oxygen consumption',
        },
      ],
    },
  };

  const periodOptions = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'season', label: 'Season' },
  ];

  // Initialize component
  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = useCallback(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    loadMetricsData();
  }, []);

  const loadMetricsData = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setMetricsData(sportsData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading metrics data:', error);
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    loadMetricsData().finally(() => setRefreshing(false));
  }, [loadMetricsData]);

  const handleMetricPress = (metric) => {
    setSelectedMetric(metric);
    setShowModal(true);
    Vibration.vibrate(30);
  };

  const getCurrentSportData = () => {
    return metricsData[selectedSport] || sportsData[selectedSport];
  };

  const getMetricsByCategory = (category) => {
    const sportData = getCurrentSportData();
    if (!sportData) return [];
    return sportData.metrics.filter(metric => metric.category === category);
  };

  const getChangeColor = (change) => {
    if (change > 0) return COLORS.success;
    if (change < 0) return COLORS.error;
    return COLORS.textLight;
  };

  const getChangeIcon = (change) => {
    if (change > 0) return 'trending-up';
    if (change < 0) return 'trending-down';
    return 'trending-flat';
  };

  const renderSportSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.sportScroll}
      contentContainerStyle={styles.sportContainer}
    >
      {Object.entries(sportsData).map(([key, sport]) => (
        <TouchableOpacity
          key={key}
          onPress={() => {
            setSelectedSport(key);
            Vibration.vibrate(30);
          }}
          style={[
            styles.sportCard,
            selectedSport === key && { borderColor: sport.color, borderWidth: 2 }
          ]}
        >
          <LinearGradient
            colors={selectedSport === key ? [sport.color, sport.color + '80'] : ['#ffffff', '#f5f5f5']}
            style={styles.sportGradient}
          >
            <Text style={[
              styles.sportName,
              selectedSport === key && { color: COLORS.white }
            ]}>
              {sport.name}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderMetricCard = (metric, index) => (
    <Animated.View
      key={metric.id}
      style={[
        styles.metricCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card
        style={styles.card}
        elevation={3}
        onPress={() => handleMetricPress(metric)}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.metricHeader}>
            <View style={styles.metricInfo}>
              <Icon
                name={metric.icon}
                size={24}
                color={getCurrentSportData().color}
                style={styles.metricIcon}
              />
              <View style={styles.metricDetails}>
                <Text style={styles.metricName}>{metric.name}</Text>
                <Text style={styles.metricDescription}>{metric.description}</Text>
              </View>
            </View>
            <Icon
              name={getChangeIcon(metric.change)}
              size={20}
              color={getChangeColor(metric.change)}
            />
          </View>

          <View style={styles.metricValues}>
            <View style={styles.currentValue}>
              <Text style={[styles.valueText, { color: getCurrentSportData().color }]}>
                {metric.value} {metric.unit}
              </Text>
              <Text style={[styles.changeText, { color: getChangeColor(metric.change) }]}>
                {metric.change > 0 ? '+' : ''}{metric.change} from last {selectedPeriod}
              </Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress to Target</Text>
              <Text style={styles.targetText}>
                Target: {metric.target} {metric.unit}
              </Text>
            </View>
            <ProgressBar
              progress={Math.min(metric.value / metric.target, 1)}
              color={getCurrentSportData().color}
              style={styles.progressBar}
            />
            <Text style={styles.progressPercentage}>
              {Math.round((metric.value / metric.target) * 100)}% of target achieved
            </Text>
          </View>

          <View style={styles.trendSection}>
            <Text style={styles.trendLabel}>7-Day Trend</Text>
            <View style={styles.trendChart}>
              {metric.data.map((value, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.trendBar,
                    {
                      height: (value / Math.max(...metric.data)) * 30,
                      backgroundColor: getCurrentSportData().color + '60',
                    }
                  ]}
                />
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderCategorySection = (category, title, icon) => {
    const metrics = getMetricsByCategory(category);
    if (metrics.length === 0) return null;

    return (
      <View style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Icon name={icon} size={24} color={COLORS.primary} />
          <Text style={styles.categoryTitle}>{title}</Text>
          <Text style={styles.categoryCount}>({metrics.length})</Text>
        </View>
        {metrics.map(renderMetricCard)}
      </View>
    );
  };

  const renderMetricModal = () => (
    <Portal>
      <Modal
        visible={showModal}
        onDismiss={() => setShowModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurOverlay} blurType="dark" blurAmount={10}>
          <Card style={styles.modalCard}>
            <Card.Content>
              {selectedMetric && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleRow}>
                      <Icon
                        name={selectedMetric.icon}
                        size={32}
                        color={getCurrentSportData().color}
                        style={styles.modalIcon}
                      />
                      <Text style={styles.modalTitle}>{selectedMetric.name}</Text>
                    </View>
                    <IconButton
                      icon="close"
                      size={24}
                      onPress={() => setShowModal(false)}
                      style={styles.closeButton}
                    />
                  </View>

                  <Text style={styles.modalDescription}>
                    {selectedMetric.description}
                  </Text>

                  <Surface style={styles.modalValueCard}>
                    <Text style={styles.modalValueLabel}>Current Performance</Text>
                    <Text style={[styles.modalValue, { color: getCurrentSportData().color }]}>
                      {selectedMetric.value} {selectedMetric.unit}
                    </Text>
                    <Text style={[styles.modalChange, { color: getChangeColor(selectedMetric.change) }]}>
                      {selectedMetric.change > 0 ? '+' : ''}{selectedMetric.change} from last {selectedPeriod}
                    </Text>
                  </Surface>

                  <View style={styles.modalStats}>
                    <Surface style={styles.modalStatCard}>
                      <Text style={styles.modalStatLabel}>Target</Text>
                      <Text style={styles.modalStatValue}>
                        {selectedMetric.target} {selectedMetric.unit}
                      </Text>
                    </Surface>
                    <Surface style={styles.modalStatCard}>
                      <Text style={styles.modalStatLabel}>Best This Season</Text>
                      <Text style={styles.modalStatValue}>
                        {Math.max(...selectedMetric.data)} {selectedMetric.unit}
                      </Text>
                    </Surface>
                  </View>

                  <View style={styles.modalButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setShowModal(false);
                        Alert.alert('Feature Coming Soon', 'Detailed analytics will be available soon! 📈');
                      }}
                      style={styles.modalButton}
                    >
                      View Details
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => {
                        setShowModal(false);
                        Alert.alert('Feature Coming Soon', 'Goal setting interface coming soon! 🎯');
                      }}
                      style={[styles.modalButton, { backgroundColor: getCurrentSportData().color }]}
                    >
                      Set Goal
                    </Button>
                  </View>
                </>
              )}
            </Card.Content>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderOverview = () => {
    const sportData = getCurrentSportData();
    if (!sportData) return null;

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[sportData.color]}
            tintColor={sportData.color}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Surface style={styles.summaryCard}>
          <LinearGradient
            colors={[sportData.color, sportData.color + '80']}
            style={styles.summaryGradient}
          >
            <Text style={styles.summaryTitle}>Performance Summary</Text>
            <Text style={styles.summarySubtitle}>
              {sportData.metrics.length} metrics tracked this {selectedPeriod}
            </Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatValue}>
                  {sportData.metrics.filter(m => m.change > 0).length}
                </Text>
                <Text style={styles.summaryStatLabel}>Improving</Text>
              </View>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatValue}>
                  {sportData.metrics.filter(m => (m.value / m.target) >= 0.9).length}
                </Text>
                <Text style={styles.summaryStatLabel}>Near Target</Text>
              </View>
            </View>
          </LinearGradient>
        </Surface>

        {renderCategorySection('technical', 'Technical Skills', 'precision-manufacturing')}
        {renderCategorySection('physical', 'Physical Attributes', 'fitness-center')}
        {renderCategorySection('tactical', 'Tactical Awareness', 'psychology')}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Sport Metrics 📊</Text>
          <Text style={styles.headerSubtitle}>
            Track performance in your specialized sport
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {renderSportSelector()}

        <View style={styles.controls}>
          <SegmentedButtons
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
            buttons={periodOptions}
            style={styles.periodSelector}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading metrics... 🔄</Text>
          </View>
        ) : (
          renderOverview()
        )}
      </View>

      {renderMetricModal()}

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: getCurrentSportData()?.color || COLORS.primary }]}
        onPress={() => Alert.alert(
          'Custom Metric',
          'Add your own performance metric! This feature will be available soon. 📈'
        )}
        color={COLORS.white}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl + 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  sportScroll: {
    marginBottom: SPACING.md,
  },
  sportContainer: {
    paddingHorizontal: SPACING.md,
    paddingRight: SPACING.lg,
  },
  sportCard: {
    marginRight: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  sportGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minWidth: 120,
    alignItems: 'center',
  },
  sportName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  controls: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  periodSelector: {
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  summaryGradient: {
    padding: SPACING.lg,
  },
  summaryTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  summarySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.lg,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatValue: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  summaryStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  categorySection: {
    marginBottom: SPACING.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  categoryCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  metricCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  cardContent: {
    padding: SPACING.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  metricInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  metricIcon: {
    marginRight: SPACING.md,
    marginTop: SPACING.xs,
  },
  metricDetails: {
    flex: 1,
  },
  metricName: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  metricDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    lineHeight: 16,
  },
  metricValues: {
    marginBottom: SPACING.md,
  },
  currentValue: {
    alignItems: 'center',
  },
  valueText: {
    ...TEXT_STYLES.h1,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  changeText: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  targetText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  trendSection: {
    alignItems: 'center',
  },
  trendLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  trendBar: {
    width: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  modalHeader: {
    marginBottom: SPACING.md,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalIcon: {
    marginRight: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    margin: 0,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  modalValueCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalValueLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  modalValue: {
    ...TEXT_STYLES.h1,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  modalChange: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  modalStats: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  modalStatCard: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginRight: SPACING.sm,
    alignItems: 'center',
  },
  modalStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  modalStatValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default SportSpecificMetrics;
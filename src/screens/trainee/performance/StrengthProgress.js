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
  Divider,
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
  purple: '#9C27B0',
  teal: '#009688',
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

const FitnessProgress = ({ navigation }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Redux
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const fitnessData = useSelector(state => state.performance.fitness);

  const periodOptions = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];

  const categoryOptions = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'strength', label: 'Strength', icon: 'fitness-center' },
    { id: 'cardio', label: 'Cardio', icon: 'favorite' },
    { id: 'flexibility', label: 'Flexibility', icon: 'accessibility' },
    { id: 'body', label: 'Body Comp', icon: 'straighten' },
  ];

  // Mock fitness data with comprehensive metrics
  const fitnessMetrics = {
    overview: {
      workoutsCompleted: {
        current: 23,
        target: 30,
        change: +5,
        unit: 'sessions',
        icon: 'fitness-center',
        color: COLORS.primary,
        data: [18, 19, 21, 20, 23, 25, 23],
        description: 'Total workout sessions completed',
      },
      caloriesBurned: {
        current: 8450,
        target: 10000,
        change: +1200,
        unit: 'kcal',
        icon: 'local-fire-department',
        color: COLORS.error,
        data: [7250, 7800, 8100, 7900, 8450, 8650, 8450],
        description: 'Total calories burned through exercise',
      },
      activeMinutes: {
        current: 1250,
        target: 1500,
        change: +180,
        unit: 'minutes',
        icon: 'timer',
        color: COLORS.success,
        data: [1070, 1150, 1200, 1180, 1250, 1280, 1250],
        description: 'Minutes of active exercise',
      },
      restingHeartRate: {
        current: 58,
        target: 55,
        change: -3,
        unit: 'bpm',
        icon: 'favorite',
        color: COLORS.info,
        data: [61, 60, 59, 60, 58, 57, 58],
        description: 'Average resting heart rate',
      },
    },
    strength: {
      benchPress: {
        current: 85,
        target: 100,
        change: +8,
        unit: 'kg',
        icon: 'fitness-center',
        color: COLORS.primary,
        data: [77, 79, 82, 80, 85, 87, 85],
        description: 'Maximum bench press weight',
      },
      squat: {
        current: 120,
        target: 140,
        change: +12,
        unit: 'kg',
        icon: 'airline-seat-legroom-extra',
        color: COLORS.purple,
        data: [108, 112, 118, 115, 120, 125, 120],
        description: 'Maximum squat weight',
      },
      deadlift: {
        current: 140,
        target: 160,
        change: +15,
        unit: 'kg',
        icon: 'trending-up',
        color: COLORS.warning,
        data: [125, 130, 135, 132, 140, 145, 140],
        description: 'Maximum deadlift weight',
      },
      pullUps: {
        current: 12,
        target: 20,
        change: +3,
        unit: 'reps',
        icon: 'expand-less',
        color: COLORS.teal,
        data: [9, 10, 11, 10, 12, 13, 12],
        description: 'Maximum pull-ups in a single set',
      },
    },
    cardio: {
      runningPace: {
        current: 5.2,
        target: 4.5,
        change: -0.3,
        unit: 'min/km',
        icon: 'directions-run',
        color: COLORS.success,
        data: [5.5, 5.4, 5.3, 5.4, 5.2, 5.1, 5.2],
        description: 'Average running pace per kilometer',
      },
      vo2Max: {
        current: 52,
        target: 60,
        change: +3,
        unit: 'ml/kg/min',
        icon: 'air',
        color: COLORS.info,
        data: [49, 50, 51, 50, 52, 53, 52],
        description: 'Maximum oxygen consumption',
      },
      cyclingDistance: {
        current: 45,
        target: 60,
        change: +8,
        unit: 'km/week',
        icon: 'directions-bike',
        color: COLORS.primary,
        data: [37, 39, 42, 40, 45, 47, 45],
        description: 'Weekly cycling distance',
      },
      swimmingTime: {
        current: 28.5,
        target: 25.0,
        change: -1.2,
        unit: 'min/1500m',
        icon: 'pool',
        color: COLORS.teal,
        data: [29.7, 29.2, 28.8, 29.0, 28.5, 28.2, 28.5],
        description: '1500m swimming time',
      },
    },
    flexibility: {
      sitAndReach: {
        current: 15,
        target: 20,
        change: +2,
        unit: 'cm',
        icon: 'accessibility',
        color: COLORS.purple,
        data: [13, 13, 14, 14, 15, 16, 15],
        description: 'Sit and reach flexibility test',
      },
      shoulderMobility: {
        current: 85,
        target: 95,
        change: +5,
        unit: 'degrees',
        icon: 'rotate-90-degrees-ccw',
        color: COLORS.warning,
        data: [80, 81, 83, 82, 85, 87, 85],
        description: 'Shoulder mobility range',
      },
      hipFlexibility: {
        current: 72,
        target: 90,
        change: +8,
        unit: 'degrees',
        icon: 'self-improvement',
        color: COLORS.success,
        data: [64, 66, 69, 68, 72, 74, 72],
        description: 'Hip flexor flexibility',
      },
    },
    body: {
      weight: {
        current: 75.2,
        target: 72.0,
        change: -1.8,
        unit: 'kg',
        icon: 'monitor-weight',
        color: COLORS.primary,
        data: [77.0, 76.5, 75.8, 76.2, 75.2, 75.0, 75.2],
        description: 'Current body weight',
      },
      bodyFat: {
        current: 14.5,
        target: 12.0,
        change: -1.2,
        unit: '%',
        icon: 'donut-small',
        color: COLORS.warning,
        data: [15.7, 15.3, 14.9, 15.1, 14.5, 14.3, 14.5],
        description: 'Body fat percentage',
      },
      muscleMass: {
        current: 32.8,
        target: 35.0,
        change: +0.9,
        unit: 'kg',
        icon: 'fitness-center',
        color: COLORS.success,
        data: [31.9, 32.1, 32.4, 32.2, 32.8, 33.0, 32.8],
        description: 'Lean muscle mass',
      },
      waistCircumference: {
        current: 81,
        target: 78,
        change: -2,
        unit: 'cm',
        icon: 'straighten',
        color: COLORS.info,
        data: [83, 82, 81, 82, 81, 80, 81],
        description: 'Waist circumference measurement',
      },
    },
  };

  const recentAchievements = [
    {
      id: 1,
      title: 'Strength Milestone! 💪',
      description: 'Achieved new personal record in bench press',
      date: '2 days ago',
      icon: 'fitness-center',
      color: COLORS.primary,
    },
    {
      id: 2,
      title: 'Consistency King! 👑',
      description: 'Completed 7 consecutive workout days',
      date: '1 week ago',
      icon: 'local-fire-department',
      color: COLORS.error,
    },
    {
      id: 3,
      title: 'Cardio Champion! 🏃‍♂️',
      description: 'Improved 5K running time by 2 minutes',
      date: '2 weeks ago',
      icon: 'directions-run',
      color: COLORS.success,
    },
  ];

  // Initialize component
  useEffect(() => {
    initializeScreen();
    startPulseAnimation();
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

    loadProgressData();
  }, []);

  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadProgressData = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setProgressData(fitnessMetrics);
        setAchievements(recentAchievements);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading progress data:', error);
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    loadProgressData().finally(() => setRefreshing(false));
  }, [loadProgressData]);

  const handleMetricPress = (metric, key) => {
    setSelectedMetric({ ...metric, key });
    setShowModal(true);
    Vibration.vibrate(30);
  };

  const getCurrentCategoryData = () => {
    return progressData[selectedCategory] || fitnessMetrics[selectedCategory] || {};
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

  const calculateOverallProgress = () => {
    const allMetrics = Object.values(fitnessMetrics).flat();
    const totalMetrics = Object.values(fitnessMetrics).reduce((acc, category) => 
      acc + Object.keys(category).length, 0
    );
    const achievedTargets = Object.values(fitnessMetrics).reduce((acc, category) => 
      acc + Object.values(category).filter(metric => 
        (metric.current / metric.target) >= 0.9
      ).length, 0
    );
    return Math.round((achievedTargets / totalMetrics) * 100);
  };

  const renderCategorySelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContainer}
    >
      {categoryOptions.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => {
            setSelectedCategory(category.id);
            Vibration.vibrate(30);
          }}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && styles.selectedCategoryChip
          ]}
        >
          <Icon
            name={category.icon}
            size={20}
            color={selectedCategory === category.id ? COLORS.white : COLORS.primary}
            style={styles.categoryIcon}
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.id && styles.selectedCategoryText
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderMetricCard = (metricKey, metric) => (
    <Animated.View
      key={metricKey}
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
        onPress={() => handleMetricPress(metric, metricKey)}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.metricHeader}>
            <View style={styles.metricIconContainer}>
              <Icon
                name={metric.icon}
                size={28}
                color={metric.color}
                style={styles.metricIcon}
              />
            </View>
            <View style={styles.metricInfo}>
              <Text style={styles.metricTitle}>
                {metricKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Text>
              <Text style={styles.metricDescription}>{metric.description}</Text>
            </View>
            <Icon
              name={getChangeIcon(metric.change)}
              size={20}
              color={getChangeColor(metric.change)}
            />
          </View>

          <View style={styles.metricValues}>
            <View style={styles.currentValueSection}>
              <Text style={[styles.currentValue, { color: metric.color }]}>
                {metric.current} {metric.unit}
              </Text>
              <Text style={[styles.changeValue, { color: getChangeColor(metric.change) }]}>
                {metric.change > 0 ? '+' : ''}{metric.change} from last {selectedPeriod}
              </Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress to Goal</Text>
              <Text style={styles.targetValue}>
                Target: {metric.target} {metric.unit}
              </Text>
            </View>
            <ProgressBar
              progress={Math.min(Math.abs(metric.current) / Math.abs(metric.target), 1)}
              color={metric.color}
              style={styles.progressBar}
            />
            <Text style={styles.progressPercentage}>
              {Math.round((Math.abs(metric.current) / Math.abs(metric.target)) * 100)}% achieved
            </Text>
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.chartLabel}>7-Day Trend</Text>
            <View style={styles.miniChart}>
              {metric.data.map((value, index) => (
                <View
                  key={index}
                  style={[
                    styles.chartBar,
                    {
                      height: (value / Math.max(...metric.data)) * 30,
                      backgroundColor: metric.color + '60',
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

  const renderOverviewStats = () => (
    <Surface style={styles.overviewCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.overviewGradient}
      >
        <View style={styles.overviewHeader}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Text style={styles.overallProgress}>{calculateOverallProgress()}%</Text>
          </Animated.View>
          <Text style={styles.overviewTitle}>Overall Fitness Progress</Text>
          <Text style={styles.overviewSubtitle}>
            Great job! You're making excellent progress toward your goals 🚀
          </Text>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {fitnessMetrics.overview.workoutsCompleted.current}
            </Text>
            <Text style={styles.quickStatLabel}>Workouts</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {Math.round(fitnessMetrics.overview.caloriesBurned.current / 1000)}K
            </Text>
            <Text style={styles.quickStatLabel}>Calories</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {Math.round(fitnessMetrics.overview.activeMinutes.current / 60)}h
            </Text>
            <Text style={styles.quickStatLabel}>Active Time</Text>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderAchievements = () => (
    <View style={styles.achievementsSection}>
      <Text style={styles.sectionTitle}>Recent Achievements 🏆</Text>
      {achievements.map((achievement) => (
        <Surface key={achievement.id} style={styles.achievementCard}>
          <View style={styles.achievementContent}>
            <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
              <Icon name={achievement.icon} size={24} color={achievement.color} />
            </View>
            <View style={styles.achievementText}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              <Text style={styles.achievementDate}>{achievement.date}</Text>
            </View>
          </View>
        </Surface>
      ))}
    </View>
  );

  const renderDetailModal = () => (
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
                        color={selectedMetric.color}
                        style={styles.modalIcon}
                      />
                      <Text style={styles.modalTitle}>
                        {selectedMetric.key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Text>
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
                    <Text style={[styles.modalValue, { color: selectedMetric.color }]}>
                      {selectedMetric.current} {selectedMetric.unit}
                    </Text>
                    <Text style={[styles.modalChange, { color: getChangeColor(selectedMetric.change) }]}>
                      {selectedMetric.change > 0 ? '+' : ''}{selectedMetric.change} from last {selectedPeriod}
                    </Text>
                  </Surface>

                  <View style={styles.modalStats}>
                    <Surface style={styles.modalStatCard}>
                      <Text style={styles.modalStatLabel}>Target Goal</Text>
                      <Text style={styles.modalStatValue}>
                        {selectedMetric.target} {selectedMetric.unit}
                      </Text>
                    </Surface>
                    <Surface style={styles.modalStatCard}>
                      <Text style={styles.modalStatLabel}>Best This Period</Text>
                      <Text style={styles.modalStatValue}>
                        {Math.max(...selectedMetric.data)} {selectedMetric.unit}
                      </Text>
                    </Surface>
                  </View>

                  <View style={styles.modalChart}>
                    <Text style={styles.modalChartLabel}>Progress Trend</Text>
                    <View style={styles.modalChartContainer}>
                      {selectedMetric.data.map((value, index) => (
                        <View key={index} style={styles.modalChartItem}>
                          <View
                            style={[
                              styles.modalChartBar,
                              {
                                height: (value / Math.max(...selectedMetric.data)) * 60,
                                backgroundColor: selectedMetric.color,
                              }
                            ]}
                          />
                          <Text style={styles.modalChartDay}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setShowModal(false);
                        Alert.alert('Feature Coming Soon', 'Detailed analytics will be available soon! 📊');
                      }}
                      style={styles.modalButton}
                    >
                      View History
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => {
                        setShowModal(false);
                        Alert.alert('Feature Coming Soon', 'Goal adjustment interface coming soon! 🎯');
                      }}
                      style={[styles.modalButton, { backgroundColor: selectedMetric.color }]}
                    >
                      Update Goal
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
          <Text style={styles.headerTitle}>Fitness Progress 📈</Text>
          <Text style={styles.headerSubtitle}>
            Track your journey to peak fitness
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.controls}>
          <SegmentedButtons
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
            buttons={periodOptions}
            style={styles.periodSelector}
          />
        </View>

        {renderCategorySelector()}

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading progress data... 🔄</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
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
            {selectedCategory === 'overview' && renderOverviewStats()}
            
            {selectedCategory === 'overview' && renderAchievements()}

            <View style={styles.metricsSection}>
              <Text style={styles.sectionTitle}>
                {categoryOptions.find(cat => cat.id === selectedCategory)?.label} Metrics
              </Text>
              {Object.entries(getCurrentCategoryData()).map(([key, metric]) =>
                renderMetricCard(key, metric)
              )}
            </View>
          </ScrollView>
        )}
      </View>

      {renderDetailModal()}

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert(
          'Log Progress',
          'Manual progress entry will be available soon! 📝'
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
  controls: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  periodSelector: {
    backgroundColor: COLORS.white,
  },
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.md,
    paddingRight: SPACING.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    marginRight: SPACING.xs,
  },
  categoryText: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
    color: COLORS.text,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  overviewCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  overviewGradient: {
    padding: SPACING.lg,
  },
  overviewHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  overallProgress: {
    ...TEXT_STYLES.h1,
    fontSize: 48,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  overviewTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  overviewSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  quickStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.white,
    opacity: 0.3,
  },
  achievementsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  achievementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  achievementDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    fontSize: 10,
  },
  metricsSection: {
    marginBottom: SPACING.lg,
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
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  metricIcon: {
    // Icon styling handled by container
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
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
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  currentValueSection: {
    alignItems: 'center',
  },
  currentValue: {
    ...TEXT_STYLES.h1,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  changeValue: {
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
  targetValue: {
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
  chartSection: {
    alignItems: 'center',
  },
  chartLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  chartBar: {
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
    backgroundColor: COLORS.primary,
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
    maxHeight: '80%',
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
  modalChart: {
    marginBottom: SPACING.lg,
  },
  modalChartLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    fontWeight: '500',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 80,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
  },
  modalChartItem: {
    alignItems: 'center',
  },
  modalChartBar: {
    width: 12,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  modalChartDay: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    fontSize: 10,
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

export default FitnessProgress;
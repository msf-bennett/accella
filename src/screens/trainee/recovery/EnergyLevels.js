import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
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
  Switch,
  RadioButton,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your established design system
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  energy: '#FFC107',
  energyHigh: '#4CAF50',
  energyMedium: '#FF9800',
  energyLow: '#F44336',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheader: {
    fontSize: 20,
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

const { width } = Dimensions.get('window');

const EnergyLevels = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, energyData, isLoading } = useSelector(state => ({
    user: state.auth.user,
    energyData: state.recovery?.energyLevels || {},
    isLoading: state.ui.isLoading,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [currentEnergyLevel, setCurrentEnergyLevel] = useState(7);
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Energy tracking data
  const [todayEnergyData] = useState([
    { time: '6:00', level: 4, activity: 'Wake up', mood: 'groggy' },
    { time: '8:00', level: 6, activity: 'After breakfast', mood: 'alert' },
    { time: '10:00', level: 8, activity: 'Morning workout', mood: 'energized' },
    { time: '12:00', level: 7, activity: 'Post-workout', mood: 'satisfied' },
    { time: '14:00', level: 5, activity: 'After lunch', mood: 'sleepy' },
    { time: '16:00', level: 6, activity: 'Afternoon snack', mood: 'focused' },
    { time: '18:00', level: 8, activity: 'Evening training', mood: 'motivated' },
    { time: '20:00', level: 6, activity: 'Dinner', mood: 'relaxed' },
    { time: '22:00', level: 4, activity: 'Wind down', mood: 'calm' },
  ]);

  const [weeklyEnergyTrends] = useState([
    { day: 'Mon', morning: 6, afternoon: 7, evening: 5 },
    { day: 'Tue', morning: 7, afternoon: 6, evening: 6 },
    { day: 'Wed', morning: 5, afternoon: 8, evening: 7 },
    { day: 'Thu', morning: 8, afternoon: 7, evening: 5 },
    { day: 'Fri', morning: 6, afternoon: 6, evening: 8 },
    { day: 'Sat', morning: 9, afternoon: 8, evening: 6 },
    { day: 'Sun', morning: 7, afternoon: 7, evening: 4 },
  ]);

  // Energy boosting recommendations
  const [energyRecommendations] = useState([
    {
      id: 1,
      title: 'Power Nap',
      duration: '10-20 min',
      category: 'rest',
      energyBoost: 8,
      bestTime: 'Early afternoon',
      description: 'Short nap to recharge without grogginess',
      icon: 'bedtime',
      color: COLORS.primary,
    },
    {
      id: 2,
      title: 'High-Intensity Interval',
      duration: '15-20 min',
      category: 'exercise',
      energyBoost: 9,
      bestTime: 'Morning or pre-workout',
      description: 'Quick burst to activate your system',
      icon: 'flash-on',
      color: COLORS.energyHigh,
    },
    {
      id: 3,
      title: 'Hydration Break',
      duration: '5 min',
      category: 'nutrition',
      energyBoost: 6,
      bestTime: 'Anytime',
      description: 'Drink 16-20oz of water with electrolytes',
      icon: 'water-drop',
      color: COLORS.energy,
    },
    {
      id: 4,
      title: 'Protein Snack',
      duration: '10 min',
      category: 'nutrition',
      energyBoost: 7,
      bestTime: 'Mid-morning/afternoon',
      description: 'Nuts, Greek yogurt, or protein bar',
      icon: 'restaurant',
      color: COLORS.warning,
    },
    {
      id: 5,
      title: 'Deep Breathing',
      duration: '5-10 min',
      category: 'mindfulness',
      energyBoost: 5,
      bestTime: 'When stressed',
      description: '4-7-8 breathing technique for calm energy',
      icon: 'air',
      color: COLORS.secondary,
    },
    {
      id: 6,
      title: 'Cold Exposure',
      duration: '2-3 min',
      category: 'therapy',
      energyBoost: 9,
      bestTime: 'Morning',
      description: 'Cold shower or ice bath for alertness',
      icon: 'ac-unit',
      color: '#00BCD4',
    },
  ]);

  const timeframes = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
  ];

  // Current energy stats
  const [energyStats] = useState({
    currentLevel: 7,
    averageToday: 6.2,
    weeklyAverage: 6.8,
    peakTime: '10:00 AM',
    lowTime: '2:00 PM',
    trend: 'improving',
  });

  useEffect(() => {
    // Entrance animations
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
    ]).start();

    loadEnergyData();
  }, []);

  const loadEnergyData = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(loadEnergyLevelsData());
    } catch (error) {
      console.error('Error loading energy data:', error);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEnergyData();
    setRefreshing(false);
  }, [loadEnergyData]);

  const getEnergyColor = (level) => {
    if (level >= 8) return COLORS.energyHigh;
    if (level >= 5) return COLORS.energyMedium;
    return COLORS.energyLow;
  };

  const getEnergyEmoji = (level) => {
    if (level >= 8) return '⚡';
    if (level >= 6) return '😊';
    if (level >= 4) return '😐';
    return '😴';
  };

  const handleLogEnergy = () => {
    Alert.alert(
      '⚡ Log Current Energy',
      'How are you feeling right now?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Energy',
          onPress: () => {
            Alert.alert('✅ Energy Logged', 'Your energy level has been recorded!');
          },
        },
      ]
    );
  };

  const handleRecommendation = (recommendation) => {
    Alert.alert(
      `${recommendation.title} ⚡`,
      `${recommendation.description}\n\nBest Time: ${recommendation.bestTime}\nDuration: ${recommendation.duration}\nEnergy Boost: ${recommendation.energyBoost}/10`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        {
          text: 'Try Now',
          onPress: () => {
            Alert.alert('🚀 Starting Activity', 'Tracking and guidance features coming in the next update!');
          },
        },
      ]
    );
  };

  const renderCurrentEnergyCard = () => (
    <Card style={styles.currentEnergyCard}>
      <LinearGradient
        colors={[getEnergyColor(energyStats.currentLevel), getEnergyColor(energyStats.currentLevel) + '80']}
        style={styles.currentEnergyGradient}
      >
        <View style={styles.currentEnergyContent}>
          <Text style={[TEXT_STYLES.header, { color: '#fff', fontSize: 24 }]}>
            Current Energy Level
          </Text>
          <View style={styles.energyLevelDisplay}>
            <Text style={styles.energyNumber}>
              {energyStats.currentLevel}
            </Text>
            <Text style={styles.energyEmoji}>
              {getEnergyEmoji(energyStats.currentLevel)}
            </Text>
          </View>
          <Text style={[TEXT_STYLES.caption, { color: '#fff', opacity: 0.9 }]}>
            {energyStats.currentLevel >= 8 ? 'High Energy' : 
             energyStats.currentLevel >= 5 ? 'Moderate Energy' : 'Low Energy'}
          </Text>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Surface style={styles.statCard}>
        <Icon name="trending-up" size={24} color={COLORS.success} />
        <Text style={styles.statValue}>{energyStats.averageToday}</Text>
        <Text style={styles.statLabel}>Today's Avg</Text>
      </Surface>
      <Surface style={styles.statCard}>
        <Icon name="schedule" size={24} color={COLORS.primary} />
        <Text style={[styles.statValue, { fontSize: 14 }]}>{energyStats.peakTime}</Text>
        <Text style={styles.statLabel}>Peak Time</Text>
      </Surface>
      <Surface style={styles.statCard}>
        <Icon name="timeline" size={24} color={COLORS.warning} />
        <Text style={styles.statValue}>{energyStats.weeklyAverage}</Text>
        <Text style={styles.statLabel}>Weekly Avg</Text>
      </Surface>
    </View>
  );

  const renderEnergyChart = () => (
    <Card style={styles.chartCard}>
      <Card.Content>
        <View style={styles.chartHeader}>
          <Text style={[TEXT_STYLES.subheader, { color: COLORS.primary }]}>
            Energy Throughout Day 📊
          </Text>
          <View style={styles.timeframeSelector}>
            {timeframes.map((timeframe) => (
              <Chip
                key={timeframe.value}
                mode={selectedTimeframe === timeframe.value ? 'flat' : 'outlined'}
                selected={selectedTimeframe === timeframe.value}
                onPress={() => setSelectedTimeframe(timeframe.value)}
                compact
                style={[
                  styles.timeframeChip,
                  selectedTimeframe === timeframe.value && {
                    backgroundColor: COLORS.primary,
                  }
                ]}
                textStyle={{
                  fontSize: 12,
                  color: selectedTimeframe === timeframe.value ? '#fff' : COLORS.primary,
                }}
              >
                {timeframe.label}
              </Chip>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.energyChart}>
            {todayEnergyData.map((data, index) => (
              <View key={index} style={styles.energyDataPoint}>
                <View 
                  style={[
                    styles.energyBar,
                    { 
                      height: (data.level / 10) * 100,
                      backgroundColor: getEnergyColor(data.level)
                    }
                  ]}
                />
                <Text style={styles.energyTime}>{data.time}</Text>
                <Text style={styles.energyValue}>{data.level}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderRecommendationsSection = () => (
    <Card style={styles.recommendationsCard}>
      <Card.Content>
        <View style={styles.recommendationsHeader}>
          <Text style={[TEXT_STYLES.subheader, { color: COLORS.energy }]}>
            Energy Boosters 🚀
          </Text>
          <Switch
            value={showRecommendations}
            onValueChange={setShowRecommendations}
            color={COLORS.energy}
          />
        </View>
        {showRecommendations && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.recommendationsRow}>
              {energyRecommendations.map((recommendation) => (
                <TouchableOpacity
                  key={recommendation.id}
                  style={styles.recommendationItem}
                  onPress={() => handleRecommendation(recommendation)}
                >
                  <LinearGradient
                    colors={[recommendation.color, recommendation.color + '80']}
                    style={styles.recommendationGradient}
                  >
                    <Icon name={recommendation.icon} size={24} color="#fff" />
                    <Text style={styles.recommendationTitle}>
                      {recommendation.title}
                    </Text>
                    <View style={styles.energyBoostIndicator}>
                      <Text style={styles.energyBoostText}>
                        +{recommendation.energyBoost}
                      </Text>
                      <Text style={styles.energyBoostLabel}>Energy</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </Card.Content>
    </Card>
  );

  const renderInsightsCard = () => (
    <Card style={styles.insightsCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.subheader, { color: COLORS.primary, marginBottom: SPACING.md }]}>
          Energy Insights 💡
        </Text>
        
        <View style={styles.insightItem}>
          <Icon name="wb-sunny" size={20} color={COLORS.energyHigh} />
          <Text style={styles.insightText}>
            Your peak energy time is {energyStats.peakTime} - schedule important workouts then!
          </Text>
        </View>
        
        <View style={styles.insightItem}>
          <Icon name="trending-down" size={20} color={COLORS.energyLow} />
          <Text style={styles.insightText}>
            Energy dips around {energyStats.lowTime} - consider a healthy snack or brief walk.
          </Text>
        </View>
        
        <View style={styles.insightItem}>
          <Icon name="timeline" size={20} color={COLORS.success} />
          <Text style={styles.insightText}>
            Your energy levels are {energyStats.trend} compared to last week! 📈
          </Text>
        </View>
        
        <View style={styles.insightItem}>
          <Icon name="local-drink" size={20} color={COLORS.energy} />
          <Text style={styles.insightText}>
            Stay hydrated! Dehydration can reduce energy levels by up to 25%.
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickEnergyLogger = () => (
    <View style={styles.quickLogger}>
      <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md, textAlign: 'center' }]}>
        How's your energy right now?
      </Text>
      <View style={styles.energyButtons}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.energyButton,
              { 
                backgroundColor: level === currentEnergyLevel ? getEnergyColor(level) : '#f0f0f0'
              }
            ]}
            onPress={() => setCurrentEnergyLevel(level)}
          >
            <Text style={[
              styles.energyButtonText,
              { color: level === currentEnergyLevel ? '#fff' : COLORS.text }
            ]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.energy, '#F57F17']}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[TEXT_STYLES.header, { color: '#fff' }]}>
            Energy Levels ⚡
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: '#fff', opacity: 0.9 }]}>
            Track and optimize your daily energy
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.energy]}
            tintColor={COLORS.energy}
          />
        }
      >
        {renderCurrentEnergyCard()}
        {renderStatsCards()}
        {renderEnergyChart()}
        {renderRecommendationsSection()}
        {renderInsightsCard()}
        
        <Card style={styles.loggerCard}>
          <Card.Content>
            {renderQuickEnergyLogger()}
          </Card.Content>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={handleLogEnergy}
        color="#fff"
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
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  currentEnergyCard: {
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  currentEnergyGradient: {
    padding: SPACING.lg,
  },
  currentEnergyContent: {
    alignItems: 'center',
  },
  energyLevelDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  energyNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: SPACING.md,
  },
  energyEmoji: {
    fontSize: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: 12,
    elevation: 2,
  },
  statValue: {
    ...TEXT_STYLES.subheader,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  chartCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timeframeSelector: {
    flexDirection: 'row',
  },
  timeframeChip: {
    marginLeft: SPACING.xs,
  },
  energyChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: SPACING.md,
  },
  energyDataPoint: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  energyBar: {
    width: 20,
    marginBottom: SPACING.sm,
    borderRadius: 10,
  },
  energyTime: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    marginBottom: SPACING.xs,
  },
  energyValue: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    fontSize: 12,
  },
  recommendationsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  recommendationsRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
  },
  recommendationItem: {
    marginRight: SPACING.md,
  },
  recommendationGradient: {
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    width: 120,
    minHeight: 100,
  },
  recommendationTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: SPACING.sm,
  },
  energyBoostIndicator: {
    alignItems: 'center',
  },
  energyBoostText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  energyBoostLabel: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.9,
  },
  insightsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  insightText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 18,
  },
  loggerCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  quickLogger: {
    alignItems: 'center',
  },
  energyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  energyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  energyButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.energy,
  },
});

export default EnergyLevels;
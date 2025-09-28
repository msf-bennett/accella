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
  mood: {
    excellent: '#4CAF50',
    good: '#8BC34A',
    neutral: '#FFC107',
    low: '#FF9800',
    poor: '#F44336',
  },
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

const MoodTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, moodData, isLoading } = useSelector(state => ({
    user: state.auth.user,
    moodData: state.recovery?.mood || {},
    isLoading: state.ui.isLoading,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [currentMood, setCurrentMood] = useState('neutral');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [showCorrelations, setShowCorrelations] = useState(true);
  const [selectedMoodFactors, setSelectedMoodFactors] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Mood options with emojis and descriptions
  const moodOptions = [
    { 
      value: 'excellent', 
      emoji: '😄', 
      label: 'Excellent', 
      description: 'Energetic, motivated, ready for anything',
      color: COLORS.mood.excellent 
    },
    { 
      value: 'good', 
      emoji: '🙂', 
      label: 'Good', 
      description: 'Positive, focused, feeling well',
      color: COLORS.mood.good 
    },
    { 
      value: 'neutral', 
      emoji: '😐', 
      label: 'Neutral', 
      description: 'Balanced, neither up nor down',
      color: COLORS.mood.neutral 
    },
    { 
      value: 'low', 
      emoji: '😔', 
      label: 'Low', 
      description: 'Tired, unmotivated, struggling',
      color: COLORS.mood.low 
    },
    { 
      value: 'poor', 
      emoji: '😞', 
      label: 'Poor', 
      description: 'Stressed, anxious, overwhelmed',
      color: COLORS.mood.poor 
    },
  ];

  // Mood affecting factors
  const moodFactors = [
    { id: 'sleep', label: 'Sleep Quality', icon: 'bedtime', selected: false },
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant', selected: false },
    { id: 'exercise', label: 'Exercise', icon: 'fitness-center', selected: false },
    { id: 'stress', label: 'Stress Level', icon: 'psychology', selected: false },
    { id: 'social', label: 'Social Life', icon: 'people', selected: false },
    { id: 'work', label: 'Work/Study', icon: 'work', selected: false },
    { id: 'weather', label: 'Weather', icon: 'wb-sunny', selected: false },
    { id: 'health', label: 'Physical Health', icon: 'health-and-safety', selected: false },
  ];

  // Weekly mood data
  const [weeklyMoodData] = useState([
    { day: 'Mon', mood: 'good', value: 4, workoutPerformance: 8.2 },
    { day: 'Tue', mood: 'excellent', value: 5, workoutPerformance: 9.1 },
    { day: 'Wed', mood: 'neutral', value: 3, workoutPerformance: 7.5 },
    { day: 'Thu', mood: 'low', value: 2, workoutPerformance: 6.8 },
    { day: 'Fri', mood: 'good', value: 4, workoutPerformance: 8.5 },
    { day: 'Sat', mood: 'excellent', value: 5, workoutPerformance: 9.3 },
    { day: 'Sun', mood: 'neutral', value: 3, workoutPerformance: 7.8 },
  ]);

  // Mood insights and correlations
  const [moodInsights] = useState({
    averageMood: 3.7,
    moodTrend: 'improving',
    bestMoodTime: 'Morning',
    worstMoodTime: 'Late evening',
    workoutCorrelation: 0.82,
    sleepCorrelation: 0.75,
    nutritionCorrelation: 0.68,
    stressCorrelation: -0.71,
  });

  // Mood boosting activities
  const [moodBoosters] = useState([
    {
      id: 1,
      title: 'Quick Walk Outside',
      duration: '10-15 min',
      category: 'movement',
      moodBoost: 7,
      description: 'Fresh air and light movement',
      icon: 'directions-walk',
      color: COLORS.mood.good,
    },
    {
      id: 2,
      title: 'Gratitude Journaling',
      duration: '5-10 min',
      category: 'mindfulness',
      moodBoost: 6,
      description: 'Write 3 things you\'re grateful for',
      icon: 'edit',
      color: COLORS.primary,
    },
    {
      id: 3,
      title: 'Deep Breathing',
      duration: '5-8 min',
      category: 'relaxation',
      moodBoost: 5,
      description: '4-7-8 breathing technique',
      icon: 'air',
      color: COLORS.secondary,
    },
    {
      id: 4,
      title: 'Listen to Music',
      duration: '10-20 min',
      category: 'entertainment',
      moodBoost: 8,
      description: 'Play your favorite uplifting songs',
      icon: 'music-note',
      color: COLORS.mood.excellent,
    },
    {
      id: 5,
      title: 'Quick Workout',
      duration: '15-25 min',
      category: 'exercise',
      moodBoost: 9,
      description: 'Light exercise releases endorphins',
      icon: 'fitness-center',
      color: COLORS.warning,
    },
    {
      id: 6,
      title: 'Connect with Friend',
      duration: '10-30 min',
      category: 'social',
      moodBoost: 8,
      description: 'Call or message someone you care about',
      icon: 'phone',
      color: COLORS.mood.good,
    },
  ]);

  // Weekly mood statistics
  const [weeklyStats] = useState({
    entriesLogged: 6,
    targetEntries: 7,
    averageMood: 3.7,
    bestDay: 'Saturday',
    moodVariance: 'moderate',
    correlationStrength: 'strong',
  });

  const timeframes = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: '3 Months', value: '3months' },
  ];

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

    loadMoodData();
  }, []);

  const loadMoodData = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(loadMoodTrackingData());
    } catch (error) {
      console.error('Error loading mood data:', error);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMoodData();
    setRefreshing(false);
  }, [loadMoodData]);

  const getMoodFromValue = (value) => {
    if (value >= 4.5) return moodOptions.find(m => m.value === 'excellent');
    if (value >= 3.5) return moodOptions.find(m => m.value === 'good');
    if (value >= 2.5) return moodOptions.find(m => m.value === 'neutral');
    if (value >= 1.5) return moodOptions.find(m => m.value === 'low');
    return moodOptions.find(m => m.value === 'poor');
  };

  const handleLogMood = () => {
    Alert.alert(
      '📝 Log Your Mood',
      'How are you feeling right now? This helps us understand patterns and provide better recommendations.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Mood',
          onPress: () => {
            Alert.alert('✅ Mood Logged', 'Your mood has been recorded! Keep tracking for better insights.');
          },
        },
      ]
    );
  };

  const handleMoodBooster = (booster) => {
    Alert.alert(
      `${booster.title} 🌟`,
      `${booster.description}\n\nDuration: ${booster.duration}\nMood Boost: ${booster.moodBoost}/10`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        {
          text: 'Try Now',
          onPress: () => {
            Alert.alert('🚀 Great Choice!', 'Mood boosting activity tracking will be available in the next update!');
          },
        },
      ]
    );
  };

  const toggleMoodFactor = (factorId) => {
    setSelectedMoodFactors(prev => 
      prev.includes(factorId) 
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    );
  };

  const renderCurrentMoodCard = () => {
    const currentMoodOption = moodOptions.find(option => option.value === currentMood);
    
    return (
      <Card style={styles.currentMoodCard}>
        <LinearGradient
          colors={[currentMoodOption.color, currentMoodOption.color + '80']}
          style={styles.currentMoodGradient}
        >
          <View style={styles.currentMoodContent}>
            <Text style={[TEXT_STYLES.header, { color: '#fff', fontSize: 24 }]}>
              How are you feeling?
            </Text>
            <View style={styles.moodDisplay}>
              <Text style={styles.moodEmoji}>
                {currentMoodOption.emoji}
              </Text>
              <Text style={[TEXT_STYLES.subheader, { color: '#fff' }]}>
                {currentMoodOption.label}
              </Text>
            </View>
            <Text style={[TEXT_STYLES.caption, { color: '#fff', opacity: 0.9, textAlign: 'center' }]}>
              {currentMoodOption.description}
            </Text>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  const renderMoodSelector = () => (
    <Card style={styles.moodSelectorCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
          Select your current mood:
        </Text>
        <View style={styles.moodOptionsGrid}>
          {moodOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.moodOption,
                {
                  backgroundColor: currentMood === option.value ? option.color : '#f0f0f0',
                  borderColor: option.color,
                  borderWidth: currentMood === option.value ? 2 : 1,
                }
              ]}
              onPress={() => setCurrentMood(option.value)}
            >
              <Text style={styles.moodOptionEmoji}>
                {option.emoji}
              </Text>
              <Text style={[
                styles.moodOptionLabel,
                { 
                  color: currentMood === option.value ? '#fff' : COLORS.text,
                  fontWeight: currentMood === option.value ? '600' : 'normal',
                }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Surface style={styles.statCard}>
        <Icon name="trending-up" size={24} color={COLORS.success} />
        <Text style={styles.statValue}>{moodInsights.averageMood.toFixed(1)}/5</Text>
        <Text style={styles.statLabel}>Avg Mood</Text>
      </Surface>
      <Surface style={styles.statCard}>
        <Icon name="psychology" size={24} color={COLORS.primary} />
        <Text style={styles.statValue}>{Math.round(moodInsights.workoutCorrelation * 100)}%</Text>
        <Text style={styles.statLabel}>Workout Link</Text>
      </Surface>
      <Surface style={styles.statCard}>
        <Icon name="timeline" size={24} color={COLORS.mood.good} />
        <Text style={[styles.statValue, { fontSize: 14, textTransform: 'capitalize' }]}>
          {moodInsights.moodTrend}
        </Text>
        <Text style={styles.statLabel}>Trend</Text>
      </Surface>
    </View>
  );

  const renderMoodChart = () => (
    <Card style={styles.chartCard}>
      <Card.Content>
        <View style={styles.chartHeader}>
          <Text style={[TEXT_STYLES.subheader, { color: COLORS.primary }]}>
            Mood Timeline 📈
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
          <View style={styles.moodChart}>
            {weeklyMoodData.map((data, index) => {
              const moodOption = getMoodFromValue(data.value);
              return (
                <View key={index} style={styles.moodDataPoint}>
                  <View 
                    style={[
                      styles.moodBar,
                      { 
                        height: (data.value / 5) * 100,
                        backgroundColor: moodOption.color
                      }
                    ]}
                  />
                  <Text style={styles.moodDay}>{data.day}</Text>
                  <Text style={styles.moodEmoji}>{moodOption.emoji}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderCorrelationsCard = () => (
    <Card style={styles.correlationsCard}>
      <Card.Content>
        <View style={styles.correlationsHeader}>
          <Text style={[TEXT_STYLES.subheader, { color: COLORS.secondary }]}>
            Mood Correlations 🔗
          </Text>
          <Switch
            value={showCorrelations}
            onValueChange={setShowCorrelations}
            color={COLORS.secondary}
          />
        </View>
        
        {showCorrelations && (
          <View style={styles.correlationsList}>
            <View style={styles.correlationItem}>
              <Icon name="fitness-center" size={20} color={COLORS.warning} />
              <Text style={styles.correlationLabel}>Workout Performance</Text>
              <View style={styles.correlationIndicator}>
                <ProgressBar
                  progress={Math.abs(moodInsights.workoutCorrelation)}
                  color={COLORS.success}
                  style={styles.correlationBar}
                />
                <Text style={styles.correlationValue}>
                  +{Math.round(moodInsights.workoutCorrelation * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.correlationItem}>
              <Icon name="bedtime" size={20} color={COLORS.primary} />
              <Text style={styles.correlationLabel}>Sleep Quality</Text>
              <View style={styles.correlationIndicator}>
                <ProgressBar
                  progress={Math.abs(moodInsights.sleepCorrelation)}
                  color={COLORS.success}
                  style={styles.correlationBar}
                />
                <Text style={styles.correlationValue}>
                  +{Math.round(moodInsights.sleepCorrelation * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.correlationItem}>
              <Icon name="restaurant" size={20} color={COLORS.mood.good} />
              <Text style={styles.correlationLabel}>Nutrition</Text>
              <View style={styles.correlationIndicator}>
                <ProgressBar
                  progress={Math.abs(moodInsights.nutritionCorrelation)}
                  color={COLORS.success}
                  style={styles.correlationBar}
                />
                <Text style={styles.correlationValue}>
                  +{Math.round(moodInsights.nutritionCorrelation * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.correlationItem}>
              <Icon name="psychology" size={20} color={COLORS.error} />
              <Text style={styles.correlationLabel}>Stress Level</Text>
              <View style={styles.correlationIndicator}>
                <ProgressBar
                  progress={Math.abs(moodInsights.stressCorrelation)}
                  color={COLORS.error}
                  style={styles.correlationBar}
                />
                <Text style={styles.correlationValue}>
                  {Math.round(moodInsights.stressCorrelation * 100)}%
                </Text>
              </View>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderMoodBoostersCard = () => (
    <Card style={styles.boostersCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.subheader, { color: COLORS.mood.excellent, marginBottom: SPACING.md }]}>
          Mood Boosters 🌟
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.boostersRow}>
            {moodBoosters.map((booster) => (
              <TouchableOpacity
                key={booster.id}
                style={styles.boosterItem}
                onPress={() => handleMoodBooster(booster)}
              >
                <LinearGradient
                  colors={[booster.color, booster.color + '80']}
                  style={styles.boosterGradient}
                >
                  <Icon name={booster.icon} size={24} color="#fff" />
                  <Text style={styles.boosterTitle}>
                    {booster.title}
                  </Text>
                  <View style={styles.moodBoostIndicator}>
                    <Text style={styles.moodBoostText}>
                      +{booster.moodBoost}
                    </Text>
                    <Text style={styles.moodBoostLabel}>Mood</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderMoodFactorsCard = () => (
    <Card style={styles.factorsCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.subheader, { color: COLORS.primary, marginBottom: SPACING.md }]}>
          What's affecting your mood? 🤔
        </Text>
        
        <View style={styles.factorsGrid}>
          {moodFactors.map((factor) => (
            <TouchableOpacity
              key={factor.id}
              style={[
                styles.factorItem,
                {
                  backgroundColor: selectedMoodFactors.includes(factor.id) ? COLORS.primary : '#f0f0f0',
                }
              ]}
              onPress={() => toggleMoodFactor(factor.id)}
            >
              <Icon 
                name={factor.icon} 
                size={20} 
                color={selectedMoodFactors.includes(factor.id) ? '#fff' : COLORS.textSecondary} 
              />
              <Text style={[
                styles.factorLabel,
                { 
                  color: selectedMoodFactors.includes(factor.id) ? '#fff' : COLORS.text,
                  fontWeight: selectedMoodFactors.includes(factor.id) ? '600' : 'normal',
                }
              ]}>
                {factor.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderInsightsCard = () => (
    <Card style={styles.insightsCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.subheader, { color: COLORS.primary, marginBottom: SPACING.md }]}>
          Mood Insights 💡
        </Text>
        
        <View style={styles.insightItem}>
          <Icon name="wb-sunny" size={20} color={COLORS.mood.excellent} />
          <Text style={styles.insightText}>
            Your best mood time is {moodInsights.bestMoodTime} - schedule important tasks then!
          </Text>
        </View>
        
        <View style={styles.insightItem}>
          <Icon name="trending-up" size={20} color={COLORS.success} />
          <Text style={styles.insightText}>
            Strong correlation between mood and workout performance ({Math.round(moodInsights.workoutCorrelation * 100)}%)
          </Text>
        </View>
        
        <View style={styles.insightItem}>
          <Icon name="bedtime" size={20} color={COLORS.primary} />
          <Text style={styles.insightText}>
            Better sleep quality significantly improves your mood the next day.
          </Text>
        </View>
        
        <View style={styles.insightItem}>
          <Icon name="timeline" size={20} color={COLORS.mood.good} />
          <Text style={styles.insightText}>
            Your mood trend is {moodInsights.moodTrend} - keep up the good work! 📈
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
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
            Mood Tracking 🎭
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: '#fff', opacity: 0.9 }]}>
            Understanding your emotional wellness
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
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderCurrentMoodCard()}
        {renderMoodSelector()}
        {renderStatsCards()}
        {renderMoodChart()}
        {renderCorrelationsCard()}
        {renderMoodBoostersCard()}
        {renderMoodFactorsCard()}
        {renderInsightsCard()}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={handleLogMood}
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
  currentMoodCard: {
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  currentMoodGradient: {
    padding: SPACING.lg,
  },
  currentMoodContent: {
    alignItems: 'center',
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  moodEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  moodSelectorCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  moodOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodOption: {
    width: '48%',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  moodOptionEmoji: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  moodOptionLabel: {
    fontSize: 14,
    textAlign: 'center',
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
    textAlign: 'center',
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
  moodChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: SPACING.md,
  },
  moodDataPoint: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  moodBar: {
    width: 20,
    marginBottom: SPACING.sm,
    borderRadius: 10,
  },
  moodDay: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    marginBottom: SPACING.xs,
  },
  correlationsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  correlationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  correlationsList: {
    marginTop: SPACING.md,
  },
  correlationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  correlationLabel: {
    ...TEXT_STYLES.body,
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: 14,
  },
  correlationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  correlationBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
    marginRight: SPACING.sm,
  },
  correlationValue: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    minWidth: 40,
  },
  boostersCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  boostersRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xs,
  },
  boosterItem: {
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  boosterGradient: {
    width: 120,
    height: 120,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boosterTitle: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontSize: 12,
  },
  moodBoostIndicator: {
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  moodBoostText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  moodBoostLabel: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.9,
  },
  factorsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  factorItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 10,
    marginBottom: SPACING.md,
  },
  factorLabel: {
    ...TEXT_STYLES.body,
    fontSize: 12,
    marginLeft: SPACING.sm,
    flex: 1,
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
    paddingVertical: SPACING.sm,
  },
  insightText: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: SPACING.md,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    elevation: 8,
  },
});

export default MoodTracking;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Animated,
  StatusBar,
  Alert,
  TouchableOpacity,
  FlatList,
  Dimensions,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const EnduranceTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const enduranceData = useSelector(state => state.performance.enduranceData);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedActivity, setSelectedActivity] = useState('all');
  const [showTimer, setShowTimer] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [currentActivity, setCurrentActivity] = useState('running');
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  // Mock endurance data
  const mockEnduranceData = {
    currentWeek: {
      totalMinutes: 240,
      activities: 8,
      avgHeartRate: 142,
      caloriesBurned: 1850,
      weeklyGoal: 300,
    },
    activities: [
      {
        id: '1',
        type: 'running',
        name: 'Morning Run',
        date: '2024-08-29',
        duration: 45,
        distance: 5.2,
        avgHeartRate: 155,
        maxHeartRate: 172,
        calories: 420,
        pace: '8:39',
        intensity: 'moderate',
        notes: 'Felt strong throughout the run',
      },
      {
        id: '2',
        type: 'cycling',
        name: 'Bike Training',
        date: '2024-08-28',
        duration: 60,
        distance: 15.3,
        avgHeartRate: 138,
        maxHeartRate: 162,
        calories: 485,
        pace: '15.3 km/h',
        intensity: 'easy',
        notes: 'Recovery ride, felt relaxed',
      },
      {
        id: '3',
        type: 'swimming',
        name: 'Pool Session',
        date: '2024-08-27',
        duration: 35,
        distance: 1.5,
        avgHeartRate: 148,
        maxHeartRate: 165,
        calories: 315,
        pace: '2:20/100m',
        intensity: 'hard',
        notes: 'Interval training session',
      },
      {
        id: '4',
        type: 'rowing',
        name: 'Rowing Machine',
        date: '2024-08-26',
        duration: 30,
        distance: 6.0,
        avgHeartRate: 145,
        maxHeartRate: 158,
        calories: 280,
        pace: '2:30/500m',
        intensity: 'moderate',
        notes: 'Steady state workout',
      },
    ],
    weeklyProgress: [
      { day: 'Mon', minutes: 45, target: 43 },
      { day: 'Tue', minutes: 60, target: 43 },
      { day: 'Wed', minutes: 35, target: 43 },
      { day: 'Thu', minutes: 30, target: 43 },
      { day: 'Fri', minutes: 40, target: 43 },
      { day: 'Sat', minutes: 30, target: 43 },
      { day: 'Sun', minutes: 0, target: 43 },
    ],
    heartRateZones: {
      zone1: { name: 'Recovery', range: '100-120', percentage: 15, color: '#4CAF50' },
      zone2: { name: 'Aerobic', range: '120-140', percentage: 35, color: '#8BC34A' },
      zone3: { name: 'Threshold', range: '140-160', percentage: 30, color: '#FFC107' },
      zone4: { name: 'VO2 Max', range: '160-180', percentage: 15, color: '#FF9800' },
      zone5: { name: 'Neuromuscular', range: '180+', percentage: 5, color: '#F44336' },
    }
  };

  useEffect(() => {
    // Entrance animations
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

    loadEnduranceData();
  }, []);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  useEffect(() => {
    // Pulse animation for timer
    if (timerRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timerRunning]);

  const loadEnduranceData = useCallback(async () => {
    try {
      // In a real app, this would fetch from API or local storage
      console.log('Loading endurance data...');
    } catch (error) {
      Alert.alert('Error', 'Failed to load endurance data');
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEnduranceData();
    setRefreshing(false);
  }, [loadEnduranceData]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setTimerRunning(true);
    Alert.alert('Timer Started', `Started tracking ${currentActivity} session`);
  };

  const stopTimer = () => {
    setTimerRunning(false);
    Alert.alert(
      'Session Complete',
      `${currentActivity} session lasted ${formatTime(timerSeconds)}`,
      [
        {
          text: 'Save Session',
          onPress: () => {
            Alert.alert('Feature Coming Soon', 'Session saving will be available soon!');
            setTimerSeconds(0);
            setShowTimer(false);
          }
        },
        {
          text: 'Discard',
          onPress: () => {
            setTimerSeconds(0);
            setShowTimer(false);
          }
        }
      ]
    );
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'running': return 'directions-run';
      case 'cycling': return 'directions-bike';
      case 'swimming': return 'pool';
      case 'rowing': return 'rowing';
      case 'walking': return 'directions-walk';
      default: return 'fitness-center';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'running': return '#E53E3E';
      case 'cycling': return '#3182CE';
      case 'swimming': return '#0BC5EA';
      case 'rowing': return '#805AD5';
      case 'walking': return '#38A169';
      default: return COLORS.primary;
    }
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'easy': return COLORS.success;
      case 'moderate': return COLORS.warning;
      case 'hard': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const renderWeeklyOverview = () => {
    const { totalMinutes, activities, avgHeartRate, caloriesBurned, weeklyGoal } = mockEnduranceData.currentWeek;
    const progressPercentage = (totalMinutes / weeklyGoal) * 100;

    return (
      <Card style={styles.overviewCard}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.overviewHeader}>
          <Text style={styles.overviewTitle}>💪 This Week's Progress</Text>
        </LinearGradient>
        <Card.Content>
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Weekly Goal Progress</Text>
              <Text style={styles.progressText}>
                {totalMinutes} / {weeklyGoal} minutes
              </Text>
            </View>
            <ProgressBar
              progress={progressPercentage / 100}
              color={progressPercentage >= 100 ? COLORS.success : COLORS.primary}
              style={styles.progressBar}
            />
            <Text style={styles.progressPercentage}>{progressPercentage.toFixed(0)}% Complete</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="schedule" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{totalMinutes}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="fitness-center" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{activities}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="favorite" size={24} color={COLORS.error} />
              <Text style={styles.statNumber}>{avgHeartRate}</Text>
              <Text style={styles.statLabel}>Avg BPM</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="local-fire-department" size={24} color={COLORS.warning} />
              <Text style={styles.statNumber}>{caloriesBurned}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderWeeklyChart = () => {
    const maxMinutes = Math.max(...mockEnduranceData.weeklyProgress.map(day => day.minutes));
    
    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>📊 Daily Activity (Minutes)</Text>
          <View style={styles.chartContainer}>
            {mockEnduranceData.weeklyProgress.map((day, index) => {
              const height = (day.minutes / (maxMinutes || 1)) * 120;
              const targetHeight = (day.target / (maxMinutes || 1)) * 120;
              
              return (
                <View key={day.day} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View style={[styles.targetLine, { bottom: targetHeight }]} />
                    <View style={[styles.actualBar, { height, backgroundColor: day.minutes >= day.target ? COLORS.success : COLORS.primary }]} />
                  </View>
                  <Text style={styles.barValue}>{day.minutes}</Text>
                  <Text style={styles.barLabel}>{day.day}</Text>
                </View>
              );
            })}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderHeartRateZones = () => {
    return (
      <Card style={styles.heartRateCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>❤️ Heart Rate Training Zones</Text>
          <View style={styles.zonesContainer}>
            {Object.entries(mockEnduranceData.heartRateZones).map(([key, zone]) => (
              <View key={key} style={styles.zoneItem}>
                <View style={styles.zoneInfo}>
                  <View style={[styles.zoneColor, { backgroundColor: zone.color }]} />
                  <View style={styles.zoneDetails}>
                    <Text style={styles.zoneName}>{zone.name}</Text>
                    <Text style={styles.zoneRange}>{zone.range} BPM</Text>
                  </View>
                </View>
                <View style={styles.zonePercentage}>
                  <Text style={styles.percentageText}>{zone.percentage}%</Text>
                  <ProgressBar
                    progress={zone.percentage / 100}
                    color={zone.color}
                    style={styles.zoneProgress}
                  />
                </View>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderTimer = () => {
    if (!showTimer) return null;

    return (
      <Card style={styles.timerCard}>
        <LinearGradient colors={['#4CAF50', '#45A049']} style={styles.timerHeader}>
          <Text style={styles.timerTitle}>🏃‍♀️ Active Session</Text>
        </LinearGradient>
        <Card.Content style={styles.timerContent}>
          <View style={styles.activitySelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['running', 'cycling', 'swimming', 'rowing', 'walking'].map(activity => (
                <TouchableOpacity
                  key={activity}
                  onPress={() => setCurrentActivity(activity)}
                  style={[
                    styles.activityChip,
                    { backgroundColor: currentActivity === activity ? getActivityColor(activity) : COLORS.surface }
                  ]}
                >
                  <Icon 
                    name={getActivityIcon(activity)} 
                    size={20} 
                    color={currentActivity === activity ? '#FFFFFF' : COLORS.secondary} 
                  />
                  <Text style={[
                    styles.activityChipText,
                    { color: currentActivity === activity ? '#FFFFFF' : COLORS.secondary }
                  ]}>
                    {activity.charAt(0).toUpperCase() + activity.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <Animated.View style={[styles.timerDisplay, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.timerTime}>{formatTime(timerSeconds)}</Text>
            <Text style={styles.timerActivity}>{currentActivity.toUpperCase()}</Text>
          </Animated.View>
          
          <View style={styles.timerControls}>
            <Button
              mode={timerRunning ? "outlined" : "contained"}
              onPress={timerRunning ? stopTimer : startTimer}
              style={styles.timerButton}
              buttonColor={timerRunning ? undefined : COLORS.success}
            >
              {timerRunning ? 'Stop Session' : 'Start Session'}
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderActivityCard = ({ item }) => {
    return (
      <Card style={styles.activityCard}>
        <Card.Content>
          <View style={styles.activityHeader}>
            <View style={styles.activityIcon}>
              <Icon 
                name={getActivityIcon(item.type)} 
                size={24} 
                color={getActivityColor(item.type)} 
              />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityName}>{item.name}</Text>
              <Text style={styles.activityDate}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <Chip
              mode="outlined"
              textStyle={{ color: getIntensityColor(item.intensity) }}
              style={{ borderColor: getIntensityColor(item.intensity) }}
            >
              {item.intensity}
            </Chip>
          </View>
          
          <View style={styles.activityStats}>
            <View style={styles.activityStat}>
              <Icon name="schedule" size={16} color={COLORS.secondary} />
              <Text style={styles.statText}>{item.duration}min</Text>
            </View>
            <View style={styles.activityStat}>
              <Icon name="straighten" size={16} color={COLORS.secondary} />
              <Text style={styles.statText}>{item.distance}km</Text>
            </View>
            <View style={styles.activityStat}>
              <Icon name="favorite" size={16} color={COLORS.error} />
              <Text style={styles.statText}>{item.avgHeartRate} BPM</Text>
            </View>
            <View style={styles.activityStat}>
              <Icon name="local-fire-department" size={16} color={COLORS.warning} />
              <Text style={styles.statText}>{item.calories} cal</Text>
            </View>
          </View>
          
          {item.notes && (
            <View style={styles.activityNotes}>
              <Icon name="note" size={16} color={COLORS.secondary} />
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🏃‍♀️ Endurance Tracking</Text>
          <Text style={styles.headerSubtitle}>Monitor your cardiovascular fitness</Text>
        </View>
        <IconButton
          icon={showTimer ? "timer-off" : "timer"}
          iconColor="#FFFFFF"
          size={24}
          onPress={() => setShowTimer(!showTimer)}
          style={styles.timerToggleButton}
        />
      </LinearGradient>

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
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {renderTimer()}
          {renderWeeklyOverview()}
          {renderWeeklyChart()}
          {renderHeartRateZones()}
          
          <Card style={styles.activitiesHeader}>
            <Card.Content>
              <Text style={styles.activitiesTitle}>📈 Recent Activities</Text>
              <View style={styles.activityFilters}>
                {['all', 'running', 'cycling', 'swimming'].map(activity => (
                  <Chip
                    key={activity}
                    selected={selectedActivity === activity}
                    onPress={() => setSelectedActivity(activity)}
                    style={styles.activityFilterChip}
                    mode={selectedActivity === activity ? 'flat' : 'outlined'}
                  >
                    {activity === 'all' ? 'All' : activity.charAt(0).toUpperCase() + activity.slice(1)}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          <FlatList
            data={mockEnduranceData.activities}
            renderItem={renderActivityCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.activitiesList}
          />
        </ScrollView>
      </Animated.View>

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.success }]}
        onPress={() => Alert.alert('Feature Coming Soon', 'Manual activity logging will be available soon!')}
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
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  timerToggleButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.medium,
  },
  scrollView: {
    flex: 1,
  },
  timerCard: {
    marginTop: SPACING.medium,
    marginBottom: SPACING.medium,
    elevation: 4,
  },
  timerHeader: {
    padding: SPACING.medium,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  timerTitle: {
    ...TEXT_STYLES.h3,
    color: '#FFFFFF',
  },
  timerContent: {
    alignItems: 'center',
  },
  activitySelector: {
    width: '100%',
    marginBottom: SPACING.medium,
  },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 20,
    marginRight: SPACING.small,
  },
  activityChipText: {
    marginLeft: SPACING.xs,
    ...TEXT_STYLES.caption,
  },
  timerDisplay: {
    alignItems: 'center',
    marginVertical: SPACING.large,
  },
  timerTime: {
    ...TEXT_STYLES.h1,
    fontSize: 48,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  timerActivity: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    letterSpacing: 2,
  },
  timerControls: {
    width: '100%',
    marginTop: SPACING.medium,
  },
  timerButton: {
    width: '100%',
  },
  overviewCard: {
    marginBottom: SPACING.medium,
    elevation: 4,
  },
  overviewHeader: {
    padding: SPACING.medium,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  overviewTitle: {
    ...TEXT_STYLES.h3,
    color: '#FFFFFF',
  },
  progressSection: {
    marginBottom: SPACING.large,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  chartCard: {
    marginBottom: SPACING.medium,
    elevation: 2,
  },
  chartTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    marginBottom: SPACING.medium,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingBottom: 30,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    position: 'relative',
    width: 20,
    height: 120,
    justifyContent: 'flex-end',
  },
  actualBar: {
    width: '100%',
    borderRadius: 4,
  },
  targetLine: {
    position: 'absolute',
    width: '120%',
    height: 2,
    backgroundColor: COLORS.error,
    left: -2,
  },
  barValue: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  barLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  heartRateCard: {
    marginBottom: SPACING.medium,
    elevation: 2,
  },
  zonesContainer: {
    gap: SPACING.small,
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.small,
  },
  zoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  zoneColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: SPACING.medium,
  },
  zoneDetails: {
    flex: 1,
  },
  zoneName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  zoneRange: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  zonePercentage: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  percentageText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  zoneProgress: {
    width: 60,
    height: 4,
  },
  activitiesHeader: {
    marginBottom: SPACING.medium,
    elevation: 2,
  },
  activitiesTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    marginBottom: SPACING.medium,
  },
  activityFilters: {
    flexDirection: 'row',
    gap: SPACING.small,
  },
  activityFilterChip: {
    marginRight: SPACING.small,
  },
  activitiesList: {
    paddingBottom: 100,
  },
  activityCard: {
    marginBottom: SPACING.medium,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
  },
  activityDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  activityStat: {
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  activityNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    padding: SPACING.medium,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  notesText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    marginLeft: SPACING.small,
    flex: 1,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: SPACING.medium,
    bottom: SPACING.medium,
  },
}

export default EnduranceTracking;
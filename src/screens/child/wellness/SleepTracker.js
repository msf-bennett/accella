import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Dimensions,
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
  FAB,
  Surface,
  Portal,
  Modal,
  Switch,
  TextInput,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  sleep: {
    night: '#2D1B69',
    moon: '#E8E8E8',
    star: '#FFD700',
    dream: '#9C88FF',
    rest: '#4ECDC4',
    wake: '#FFA726',
  }
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
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
};

const { width, height } = Dimensions.get('window');

const SleepTracker = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, sleep } = useSelector((state) => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [sleepGoal, setSleepGoal] = useState(9); // hours for kids
  const [bedtime, setBedtime] = useState('20:30');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [showBedtimeModal, setShowBedtimeModal] = useState(false);
  const [showWakeModal, setShowWakeModal] = useState(false);
  const [sleepQuality, setSleepQuality] = useState('good');
  const [sleepStreak, setSleepStreak] = useState(4);
  const [animatedValue] = useState(new Animated.Value(0));
  const [twinkleAnim] = useState(new Animated.Value(0));
  const [moonPhase] = useState(new Animated.Value(0));

  // Weekly sleep data
  const [weekSleepData] = useState([
    { day: 'Mon', hours: 8.5, quality: 'good', bedtime: '20:45', wake: '07:15' },
    { day: 'Tue', hours: 9.2, quality: 'great', bedtime: '20:30', wake: '07:00' },
    { day: 'Wed', hours: 8.8, quality: 'good', bedtime: '20:35', wake: '07:05' },
    { day: 'Thu', hours: 9.5, quality: 'amazing', bedtime: '20:15', wake: '06:45' },
    { day: 'Fri', hours: 8.2, quality: 'okay', bedtime: '21:00', wake: '07:20' },
    { day: 'Sat', hours: 9.8, quality: 'great', bedtime: '20:45', wake: '08:30' },
    { day: 'Sun', hours: 9.0, quality: 'good', bedtime: '20:30', wake: '07:30' },
  ]);

  const bedtimeRoutines = [
    { id: 1, task: 'Take a warm bath or shower', icon: 'bathtub', completed: false, duration: '15 min' },
    { id: 2, task: 'Brush teeth and wash face', icon: 'face', completed: false, duration: '5 min' },
    { id: 3, task: 'Put on comfy pajamas', icon: 'checkroom', completed: false, duration: '2 min' },
    { id: 4, task: 'Read a bedtime story', icon: 'menu-book', completed: false, duration: '15 min' },
    { id: 5, task: 'Listen to calm music', icon: 'music-note', completed: false, duration: '10 min' },
    { id: 6, task: 'Say goodnight prayers/gratitude', icon: 'favorite', completed: false, duration: '5 min' },
  ];

  const [routineChecklist, setRoutineChecklist] = useState(bedtimeRoutines);

  const sleepTips = [
    {
      id: 1,
      category: 'Bedtime',
      tip: 'Go to bed at the same time every night, even on weekends! 🕘',
      icon: 'schedule',
    },
    {
      id: 2,
      category: 'Environment',
      tip: 'Keep your bedroom cool, dark, and quiet for the best sleep 🌙',
      icon: 'nights-stay',
    },
    {
      id: 3,
      category: 'Screen Time',
      tip: 'No screens for 1 hour before bedtime - try reading instead! 📚',
      icon: 'no-cell',
    },
    {
      id: 4,
      category: 'Activities',
      tip: 'Do calm activities before bed like reading or gentle stretching 🧘‍♀️',
      icon: 'self-improvement',
    },
  ];

  const sleepAchievements = [
    {
      id: 1,
      title: 'Sleep Champion',
      description: 'Sleep 9+ hours for 7 nights',
      icon: 'jump-rope',
      progress: 4,
      total: 7,
      earned: false,
    },
    {
      id: 2,
      title: 'Bedtime Hero',
      description: 'Follow bedtime routine 5 times',
      icon: 'star',
      progress: 5,
      total: 5,
      earned: true,
    },
    {
      id: 3,
      title: 'Early Bird',
      description: 'Wake up on time for 10 days',
      icon: 'wb-sunny',
      progress: 7,
      total: 10,
      earned: false,
    },
    {
      id: 4,
      title: 'Dream Master',
      description: 'Track sleep quality for 14 days',
      icon: 'cloud',
      progress: 12,
      total: 14,
      earned: false,
    },
  ];

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Twinkling stars animation
    const twinkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(twinkleAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    twinkleAnimation.start();

    // Moon phase animation
    const moonAnimation = Animated.loop(
      Animated.timing(moonPhase, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      })
    );
    moonAnimation.start();

    return () => {
      twinkleAnimation.stop();
      moonAnimation.stop();
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const getCurrentSleepStatus = () => {
    const lastNightHours = weekSleepData[weekSleepData.length - 1]?.hours || 0;
    if (lastNightHours >= 9.5) return { status: 'Amazing! 🌟', color: COLORS.success };
    if (lastNightHours >= 9) return { status: 'Great job! 😊', color: COLORS.success };
    if (lastNightHours >= 8) return { status: 'Good sleep! 👍', color: COLORS.warning };
    return { status: 'Need more! 😴', color: COLORS.error };
  };

  const handleRoutineToggle = (id) => {
    setRoutineChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    
    Vibration.vibrate(50);
    
    const completedCount = routineChecklist.filter(item => item.completed).length + 1;
    if (completedCount === routineChecklist.length) {
      Alert.alert(
        'Bedtime Routine Complete! 🌟',
        'Amazing job finishing your bedtime routine! You\'re ready for a great night\'s sleep! Sweet dreams! 💤',
        [{ text: 'Sweet Dreams!', style: 'default' }]
      );
    }
  };

  const handleSleepQualityUpdate = (quality) => {
    setSleepQuality(quality);
    const messages = {
      amazing: 'Fantastic! You had amazing sleep! 🌟',
      great: 'Wonderful! Great sleep makes great days! 😊',
      good: 'Nice! Good sleep helps you grow strong! 💪',
      okay: 'That\'s okay! Tonight will be even better! 🌙',
      poor: 'Tomorrow night will be better! Sweet dreams ahead! 💤'
    };
    
    Alert.alert('Sleep Quality Updated! 📊', messages[quality], [{ text: 'Thanks!', style: 'default' }]);
  };

  const calculateAverageSleep = () => {
    const total = weekSleepData.reduce((sum, day) => sum + day.hours, 0);
    return (total / weekSleepData.length).toFixed(1);
  };

  const renderSleepOverview = () => {
    const sleepStatus = getCurrentSleepStatus();
    const lastNight = weekSleepData[weekSleepData.length - 1];
    
    return (
      <Card style={styles.card}>
        <LinearGradient
          colors={[COLORS.sleep.night, COLORS.sleep.dream]}
          style={styles.sleepOverviewGradient}
        >
          <View style={styles.starsContainer}>
            {[...Array(8)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.star,
                  {
                    left: `${10 + (i * 12)}%`,
                    top: `${15 + (i % 2) * 20}%`,
                    opacity: twinkleAnim,
                    transform: [{
                      rotate: twinkleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '45deg'],
                      })
                    }]
                  }
                ]}
              >
                <Icon name="star" size={12} color={COLORS.sleep.star} />
              </Animated.View>
            ))}
          </View>
          
          <Animated.View 
            style={[
              styles.moonContainer,
              {
                transform: [{
                  rotate: moonPhase.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '15deg'],
                  })
                }]
              }
            ]}
          >
            <Icon name="nightlight" size={64} color={COLORS.sleep.moon} />
          </Animated.View>
          
          <Text style={styles.sleepTitle}>Last Night's Sleep 🌙</Text>
          <Text style={styles.sleepHours}>{lastNight?.hours || 0} hours</Text>
          <Text style={[styles.sleepStatus, { color: sleepStatus.color }]}>
            {sleepStatus.status}
          </Text>
          
          <View style={styles.sleepDetails}>
            <View style={styles.sleepDetailItem}>
              <Icon name="bedtime" size={20} color={COLORS.white} />
              <Text style={styles.sleepDetailText}>Bedtime: {lastNight?.bedtime}</Text>
            </View>
            <View style={styles.sleepDetailItem}>
              <Icon name="wb-sunny" size={20} color={COLORS.white} />
              <Text style={styles.sleepDetailText}>Wake: {lastNight?.wake}</Text>
            </View>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  const renderWeeklySleepChart = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="bar-chart" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            This Week's Sleep 📊
          </Text>
        </View>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textLight, marginBottom: SPACING.md }]}>
          Average: {calculateAverageSleep()} hours per night
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartContainer}>
            {weekSleepData.map((day, index) => {
              const height = (day.hours / 12) * 120; // Max height 120px for 12 hours
              const isToday = index === weekSleepData.length - 1;
              
              return (
                <TouchableOpacity
                  key={day.day}
                  style={styles.chartBar}
                  onPress={() => {
                    Alert.alert(
                      `${day.day} Sleep Details 📊`,
                      `Hours: ${day.hours}\nQuality: ${day.quality}\nBedtime: ${day.bedtime}\nWake: ${day.wake}`,
                      [{ text: 'Got it!', style: 'default' }]
                    );
                  }}
                >
                  <Surface style={[
                    styles.bar,
                    { 
                      height: height,
                      backgroundColor: day.hours >= 9 ? COLORS.success : 
                                     day.hours >= 8 ? COLORS.warning : COLORS.error,
                      opacity: isToday ? 1 : 0.7,
                    }
                  ]} />
                  <Text style={styles.chartLabel}>{day.day}</Text>
                  <Text style={styles.chartHours}>{day.hours}h</Text>
                  {isToday && (
                    <Chip
                      mode="flat"
                      style={styles.todayChip}
                      textStyle={styles.todayText}
                    >
                      Today
                    </Chip>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        
        <View style={styles.sleepGoalContainer}>
          <ProgressBar
            progress={calculateAverageSleep() / sleepGoal}
            color={calculateAverageSleep() >= sleepGoal ? COLORS.success : COLORS.primary}
            style={styles.sleepGoalBar}
          />
          <Text style={styles.sleepGoalText}>
            Goal: {sleepGoal} hours per night
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderBedtimeRoutine = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="checklist" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Tonight's Bedtime Routine ✅
          </Text>
        </View>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textLight, marginBottom: SPACING.md }]}>
          Complete your routine for better sleep!
        </Text>
        
        {routineChecklist.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.routineItem,
              item.completed && styles.routineItemCompleted
            ]}
            onPress={() => handleRoutineToggle(item.id)}
          >
            <Surface style={[
              styles.routineIcon,
              item.completed && styles.routineIconCompleted
            ]}>
              <Icon
                name={item.completed ? 'check' : item.icon}
                size={20}
                color={item.completed ? COLORS.white : COLORS.primary}
              />
            </Surface>
            <View style={styles.routineContent}>
              <Text style={[
                styles.routineTask,
                item.completed && styles.routineTaskCompleted
              ]}>
                {item.task}
              </Text>
              <Text style={styles.routineDuration}>{item.duration}</Text>
            </View>
            <Switch
              value={item.completed}
              onValueChange={() => handleRoutineToggle(item.id)}
              thumbColor={item.completed ? COLORS.success : COLORS.white}
              trackColor={{ false: COLORS.background, true: COLORS.success + '50' }}
            />
          </TouchableOpacity>
        ))}
        
        <View style={styles.routineProgress}>
          <Text style={styles.routineProgressText}>
            Progress: {routineChecklist.filter(item => item.completed).length}/{routineChecklist.length}
          </Text>
          <ProgressBar
            progress={routineChecklist.filter(item => item.completed).length / routineChecklist.length}
            color={COLORS.success}
            style={styles.routineProgressBar}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderSleepQuality = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="mood" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            How Did You Sleep? 😴
          </Text>
        </View>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textLight, marginBottom: SPACING.md }]}>
          Rate your sleep quality from last night
        </Text>
        
        <View style={styles.qualityButtons}>
          {[
            { value: 'amazing', emoji: '🤩', label: 'Amazing', color: COLORS.success },
            { value: 'great', emoji: '😊', label: 'Great', color: COLORS.success },
            { value: 'good', emoji: '👍', label: 'Good', color: COLORS.warning },
            { value: 'okay', emoji: '😐', label: 'Okay', color: COLORS.warning },
            { value: 'poor', emoji: '😴', label: 'Tired', color: COLORS.error },
          ].map((quality) => (
            <TouchableOpacity
              key={quality.value}
              style={[
                styles.qualityButton,
                sleepQuality === quality.value && { 
                  backgroundColor: quality.color + '20',
                  borderColor: quality.color,
                  borderWidth: 2 
                }
              ]}
              onPress={() => handleSleepQualityUpdate(quality.value)}
            >
              <Text style={styles.qualityEmoji}>{quality.emoji}</Text>
              <Text style={[
                styles.qualityLabel,
                sleepQuality === quality.value && { color: quality.color, fontWeight: 'bold' }
              ]}>
                {quality.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderSleepAchievements = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="jump-rope" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Sleep Achievements 🏆
          </Text>
        </View>
        
        {sleepAchievements.map((achievement) => (
          <Surface key={achievement.id} style={styles.achievementItem}>
            <View style={styles.achievementContent}>
              <Surface style={[
                styles.achievementIcon,
                achievement.earned && styles.achievementIconEarned
              ]}>
                <Icon
                  name={achievement.icon}
                  size={24}
                  color={achievement.earned ? COLORS.white : COLORS.textLight}
                />
              </Surface>
              <View style={styles.achievementDetails}>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.earned && { color: COLORS.textLight }
                ]}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                <View style={styles.achievementProgress}>
                  <ProgressBar
                    progress={achievement.progress / achievement.total}
                    color={achievement.earned ? COLORS.success : COLORS.primary}
                    style={styles.achievementProgressBar}
                  />
                  <Text style={styles.achievementProgressText}>
                    {achievement.progress}/{achievement.total}
                  </Text>
                </View>
              </View>
              {achievement.earned && (
                <Chip
                  mode="flat"
                  style={styles.earnedBadge}
                  textStyle={styles.earnedText}
                >
                  EARNED! ✨
                </Chip>
              )}
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderSleepTips = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="lightbulb" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Sleep Better Tips 💡
          </Text>
        </View>
        
        {sleepTips.map((tip) => (
          <Surface key={tip.id} style={styles.tipCard}>
            <Surface style={styles.tipIcon}>
              <Icon name={tip.icon} size={20} color={COLORS.primary} />
            </Surface>
            <View style={styles.tipContent}>
              <Chip
                mode="outlined"
                style={styles.tipCategory}
                textStyle={styles.tipCategoryText}
              >
                {tip.category}
              </Chip>
              <Text style={styles.tipText}>{tip.tip}</Text>
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Sleep Tracker 🌙</Text>
          <Text style={styles.headerSubtitle}>
            Track your sleep and build healthy habits! 💤
          </Text>
          <View style={styles.streakContainer}>
            <Icon name="local-fire-department" size={24} color={COLORS.warning} />
            <Text style={styles.streakText}>{sleepStreak} night streak!</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: animatedValue,
              transform: [
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {renderSleepOverview()}
          {renderWeeklySleepChart()}
          {renderSleepQuality()}
          {renderBedtimeRoutine()}
          {renderSleepAchievements()}
          {renderSleepTips()}
        </Animated.View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="bedtime"
        onPress={() => {
          Alert.alert(
            'Sleep Challenge! 🌟',
            'Tonight, try to get 9+ hours of sleep and complete your bedtime routine! Good sleep helps you grow strong and smart! 💪🧠',
            [{ text: 'Challenge Accepted!', style: 'default' }]
          );
        }}
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  streakText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sleepOverviewGradient: {
    borderRadius: 12,
    padding: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
  },
  moonContainer: {
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  sleepTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  sleepHours: {
    ...TEXT_STYLES.h1,
    fontSize: 36,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  sleepStatus: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  sleepDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sleepDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sleepDetailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.sm,
  },
  chartBar: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    minWidth: 50,
  },
  bar: {
    width: 24,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  chartLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  chartHours: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  todayChip: {
    backgroundColor: COLORS.primary,
  },
  todayText: {
    color: COLORS.white,
    fontSize: 10,
  },
  sleepGoalContainer: {
    marginTop: SPACING.lg,
  },
  sleepGoalBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.xs,
  },
  sleepGoalText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  routineItemCompleted: {
    opacity: 0.7,
  },
  routineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    marginRight: SPACING.md,
  },
  routineIconCompleted: {
    backgroundColor: COLORS.success,
  },
  routineContent: {
    flex: 1,
  },
  routineTask: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  routineTaskCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  routineDuration: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  routineProgress: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  routineProgressText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  routineProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  qualityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  qualityButton: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    elevation: 1,
    width: (width - 80) / 3,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  qualityEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  qualityLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  achievementItem: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    elevation: 1,
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
    backgroundColor: COLORS.textLight + '20',
    marginRight: SPACING.md,
  },
  achievementIconEarned: {
    backgroundColor: COLORS.success,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
  },
  achievementProgressText: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
    minWidth: 40,
  },
  earnedBadge: {
    backgroundColor: COLORS.success,
  },
  earnedText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    elevation: 1,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    marginRight: SPACING.md,
  },
  tipContent: {
    flex: 1,
  },
  tipCategory: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
    marginBottom: SPACING.xs,
    alignSelf: 'flex-start',
  },
  tipCategoryText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tipText: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.sleep.dream,
  },
});

export default SleepTracker;
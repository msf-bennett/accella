import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
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
  Portal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const MotivationalTracker = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, progress, achievements } = useSelector(state => ({
    user: state.auth.user,
    progress: state.progress,
    achievements: state.achievements,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Mock data - replace with Redux state
  const [trackerData, setTrackerData] = useState({
    currentLevel: 12,
    totalPoints: 2847,
    pointsToNext: 153,
    currentStreak: 7,
    longestStreak: 21,
    weeklyGoal: 5,
    completedSessions: 4,
    totalSessions: 156,
    achievements: [
      { id: 1, title: '🔥 Week Warrior', desc: '7 days streak', unlocked: true, date: '2024-01-15' },
      { id: 2, title: '💪 Strength Beast', desc: '50 strength sessions', unlocked: true, date: '2024-01-10' },
      { id: 3, title: '⚡ Speed Demon', desc: 'Sub 10s 100m', unlocked: false, progress: 0.85 },
      { id: 4, title: '🏆 Champion', desc: '100 sessions completed', unlocked: true, date: '2024-01-05' },
    ],
    weeklyProgress: [
      { day: 'Mon', completed: true, points: 25 },
      { day: 'Tue', completed: true, points: 30 },
      { day: 'Wed', completed: true, points: 20 },
      { day: 'Thu', completed: true, points: 35 },
      { day: 'Fri', completed: false, points: 0 },
      { day: 'Sat', completed: false, points: 0 },
      { day: 'Sun', completed: false, points: 0 },
    ],
    categories: [
      { name: 'Strength', progress: 0.75, sessions: 23, points: 575 },
      { name: 'Cardio', progress: 0.60, sessions: 18, points: 450 },
      { name: 'Flexibility', progress: 0.40, sessions: 12, points: 300 },
      { name: 'Technique', progress: 0.85, sessions: 28, points: 700 },
    ]
  });

  // Animation effects
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

    // Pulse animation for points
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Dispatch refresh action
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleAchievementPress = (achievement) => {
    if (achievement.unlocked) {
      Vibration.vibrate(100);
      Alert.alert(
        achievement.title,
        `Unlocked on ${achievement.date}\n${achievement.desc}`,
        [{ text: 'Awesome! 🎉', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Keep Going! 💪',
        `${Math.round(achievement.progress * 100)}% complete`,
        [{ text: 'Got it!', style: 'default' }]
      );
    }
  };

  const handleQuickAction = (action) => {
    Vibration.vibrate(50);
    Alert.alert(
      'Feature Coming Soon! 🚧',
      `${action} functionality is under development`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  // Components
  const LevelProgressCard = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.levelCard}
      >
        <View style={styles.levelHeader}>
          <Text style={styles.levelTitle}>Level {trackerData.currentLevel}</Text>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Text style={styles.pointsText}>{trackerData.totalPoints.toLocaleString()} pts</Text>
          </Animated.View>
        </View>
        
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={1 - (trackerData.pointsToNext / 200)}
            color={COLORS.success}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {trackerData.pointsToNext} pts to Level {trackerData.currentLevel + 1}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="local-fire-department" size={24} color="#fff" />
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{trackerData.currentStreak} days</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="fitness-center" size={24} color="#fff" />
            <Text style={styles.statLabel}>Sessions</Text>
            <Text style={styles.statValue}>{trackerData.totalSessions}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="trending-up" size={24} color="#fff" />
            <Text style={styles.statLabel}>Best Streak</Text>
            <Text style={styles.statValue}>{trackerData.longestStreak} days</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const WeeklyProgressCard = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>This Week's Progress 📅</Text>
          <Text style={styles.weekProgress}>
            {trackerData.completedSessions}/{trackerData.weeklyGoal} sessions
          </Text>
        </View>
        
        <View style={styles.weeklyGrid}>
          {trackerData.weeklyProgress.map((day, index) => (
            <View key={day.day} style={styles.dayContainer}>
              <Surface style={[
                styles.dayCircle,
                { backgroundColor: day.completed ? COLORS.success : COLORS.background }
              ]}>
                <Icon 
                  name={day.completed ? "check" : "schedule"} 
                  size={16} 
                  color={day.completed ? "#fff" : COLORS.primary} 
                />
              </Surface>
              <Text style={styles.dayLabel}>{day.day}</Text>
              {day.completed && <Text style={styles.dayPoints}>+{day.points}</Text>}
            </View>
          ))}
        </View>

        <ProgressBar
          progress={trackerData.completedSessions / trackerData.weeklyGoal}
          color={COLORS.primary}
          style={styles.weekProgressBar}
        />
      </Card.Content>
    </Card>
  );

  const AchievementsCard = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Achievements 🏆</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Achievements')}
            labelStyle={styles.viewAllText}
          >
            View All
          </Button>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {trackerData.achievements.map((achievement) => (
            <Surface
              key={achievement.id}
              style={[
                styles.achievementCard,
                { opacity: achievement.unlocked ? 1 : 0.6 }
              ]}
              elevation={achievement.unlocked ? 4 : 1}
            >
              <Button
                onPress={() => handleAchievementPress(achievement)}
                style={styles.achievementButton}
                contentStyle={styles.achievementContent}
              >
                <Text style={styles.achievementEmoji}>
                  {achievement.title.split(' ')[0]}
                </Text>
                <Text style={styles.achievementTitle}>
                  {achievement.title.substring(2)}
                </Text>
                <Text style={styles.achievementDesc}>{achievement.desc}</Text>
                {!achievement.unlocked && (
                  <ProgressBar
                    progress={achievement.progress}
                    color={COLORS.primary}
                    style={styles.achievementProgress}
                  />
                )}
              </Button>
            </Surface>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const CategoryProgressCard = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.cardTitle}>Training Categories 📊</Text>
        
        {trackerData.categories.map((category, index) => (
          <View key={category.name} style={styles.categoryRow}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <View style={styles.categoryStats}>
                <Text style={styles.categoryPoints}>+{category.points} pts</Text>
                <Text style={styles.categorySessions}>{category.sessions} sessions</Text>
              </View>
            </View>
            <ProgressBar
              progress={category.progress}
              color={COLORS.primary}
              style={styles.categoryProgress}
            />
            <Text style={styles.categoryPercent}>
              {Math.round(category.progress * 100)}% complete
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const QuickActionsFAB = () => (
    <FAB.Group
      open={false}
      icon="add"
      actions={[
        {
          icon: 'fitness-center',
          label: 'Log Workout',
          onPress: () => handleQuickAction('Log Workout'),
          color: COLORS.primary,
        },
        {
          icon: 'timer',
          label: 'Start Timer',
          onPress: () => handleQuickAction('Start Timer'),
          color: COLORS.secondary,
        },
        {
          icon: 'camera',
          label: 'Record Progress',
          onPress: () => handleQuickAction('Record Progress'),
          color: COLORS.success,
        },
      ]}
      onStateChange={() => Vibration.vibrate(30)}
      fabStyle={{ backgroundColor: COLORS.primary }}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
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
      >
        <LevelProgressCard />
        <WeeklyProgressCard />
        <AchievementsCard />
        <CategoryProgressCard />
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <QuickActionsFAB />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  levelCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 16,
    marginTop: SPACING.xl + 20,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  levelTitle: {
    ...TEXT_STYLES.heading2,
    color: '#fff',
    fontWeight: 'bold',
  },
  pointsText: {
    ...TEXT_STYLES.heading3,
    color: '#fff',
    fontWeight: '600',
  },
  progressContainer: {
    marginVertical: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  statValue: {
    ...TEXT_STYLES.body2,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  card: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TEXT_STYLES.heading3,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  weekProgress: {
    ...TEXT_STYLES.body2,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.md,
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  dayLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
  },
  dayPoints: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: 'bold',
    fontSize: 10,
  },
  weekProgressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: SPACING.sm,
  },
  achievementCard: {
    width: 120,
    marginRight: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  achievementButton: {
    margin: 0,
    borderRadius: 12,
  },
  achievementContent: {
    height: 140,
    padding: SPACING.sm,
  },
  achievementEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  achievementTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.text,
  },
  achievementDesc: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  achievementProgress: {
    height: 3,
    marginTop: SPACING.xs,
  },
  categoryRow: {
    marginBottom: SPACING.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryName: {
    ...TEXT_STYLES.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryPoints: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  categorySessions: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  categoryProgress: {
    height: 6,
    borderRadius: 3,
    marginVertical: SPACING.xs,
  },
  categoryPercent: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  viewAllText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default MotivationalTracker;

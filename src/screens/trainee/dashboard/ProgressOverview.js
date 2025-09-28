import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Animated,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Card,
  ProgressBar,
  Chip,
  Avatar,
  Surface,
  IconButton,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const ProgressOverview = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const trainingData = useSelector(state => state.training.progressData);

  // Mock data - replace with real Redux state
  const mockProgressData = {
    currentLevel: 12,
    totalXP: 2450,
    nextLevelXP: 2800,
    completedSessions: 45,
    totalSessions: 60,
    currentStreak: 7,
    longestStreak: 14,
    achievements: [
      { id: 1, name: 'First Week Complete', icon: 'star', earned: true },
      { id: 2, name: 'Speed Demon', icon: 'flash-on', earned: true },
      { id: 3, name: 'Consistency King', icon: 'trending-up', earned: true },
      { id: 4, name: 'Perfect Form', icon: 'check-circle', earned: false },
    ],
    weeklyStats: [
      { day: 'Mon', completed: true, intensity: 'high' },
      { day: 'Tue', completed: true, intensity: 'medium' },
      { day: 'Wed', completed: false, intensity: 'high' },
      { day: 'Thu', completed: true, intensity: 'low' },
      { day: 'Fri', completed: true, intensity: 'high' },
      { day: 'Sat', completed: false, intensity: 'medium' },
      { day: 'Sun', completed: true, intensity: 'low' },
    ],
    performanceMetrics: {
      endurance: 78,
      strength: 65,
      agility: 82,
      technique: 71,
    },
    recentGoals: [
      { id: 1, title: 'Improve Sprint Time', progress: 0.75, target: '< 12 seconds' },
      { id: 2, title: 'Increase Bench Press', progress: 0.6, target: '80kg' },
      { id: 3, title: 'Master Free Kicks', progress: 0.4, target: '8/10 accuracy' },
    ]
  };

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
  }, [fadeAnim, slideAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Progress Updated! 📈', 'Your latest training data has been synced.');
    }, 2000);
  }, []);

  const handleAchievementPress = (achievement) => {
    if (achievement.earned) {
      Alert.alert(
        `🏆 ${achievement.name}`,
        'Congratulations on this achievement! Keep up the great work!'
      );
    } else {
      Alert.alert(
        `🎯 ${achievement.name}`,
        'This achievement is still locked. Keep training to unlock it!'
      );
    }
  };

  const renderLevelCard = () => (
    <Card style={styles.levelCard} elevation={4}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.levelGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.levelContent}>
          <View style={styles.levelInfo}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: SPACING.xs }]}>
              Level {mockProgressData.currentLevel}
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
              {mockProgressData.totalXP} / {mockProgressData.nextLevelXP} XP
            </Text>
          </View>
          <Avatar.Icon 
            size={60} 
            icon="jump-rope" 
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
        </View>
        <ProgressBar
          progress={mockProgressData.totalXP / mockProgressData.nextLevelXP}
          color="white"
          style={styles.levelProgress}
        />
      </LinearGradient>
    </Card>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <Card style={styles.statCard} elevation={2}>
        <Card.Content style={styles.statContent}>
          <Icon name="fitness-center" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
            {mockProgressData.completedSessions}
          </Text>
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
            Sessions Completed
          </Text>
          <ProgressBar
            progress={mockProgressData.completedSessions / mockProgressData.totalSessions}
            color={COLORS.success}
            style={styles.miniProgress}
          />
        </Card.Content>
      </Card>

      <Card style={styles.statCard} elevation={2}>
        <Card.Content style={styles.statContent}>
          <Icon name="local-fire-department" size={24} color={COLORS.error} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.error }]}>
            {mockProgressData.currentStreak}
          </Text>
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
            Day Streak 🔥
          </Text>
          <Text style={[TEXT_STYLES.small, { color: COLORS.secondary, textAlign: 'center' }]}>
            Best: {mockProgressData.longestStreak} days
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderWeeklyOverview = () => (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>
          This Week's Progress 📅
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.weekContainer}>
            {mockProgressData.weeklyStats.map((day, index) => (
              <View key={day.day} style={styles.dayContainer}>
                <Text style={[TEXT_STYLES.caption, styles.dayLabel]}>{day.day}</Text>
                <Surface
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: day.completed 
                        ? COLORS.success 
                        : COLORS.background,
                      borderColor: day.completed ? COLORS.success : COLORS.secondary,
                    }
                  ]}
                >
                  <Icon
                    name={day.completed ? "check" : "close"}
                    size={16}
                    color={day.completed ? "white" : COLORS.secondary}
                  />
                </Surface>
                <View style={[
                  styles.intensityBar,
                  {
                    backgroundColor: day.intensity === 'high' ? COLORS.error :
                                   day.intensity === 'medium' ? COLORS.primary : COLORS.success
                  }
                ]} />
              </View>
            ))}
          </View>
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>
          Achievements 🏆
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.achievementsContainer}>
            {mockProgressData.achievements.map((achievement) => (
              <Surface
                key={achievement.id}
                style={[
                  styles.achievementItem,
                  { opacity: achievement.earned ? 1 : 0.5 }
                ]}
                elevation={1}
                onTouchEnd={() => handleAchievementPress(achievement)}
              >
                <Icon
                  name={achievement.icon}
                  size={32}
                  color={achievement.earned ? COLORS.primary : COLORS.secondary}
                />
                <Text style={[TEXT_STYLES.small, styles.achievementText]}>
                  {achievement.name}
                </Text>
              </Surface>
            ))}
          </View>
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderPerformanceMetrics = () => (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>
          Performance Metrics 📊
        </Text>
        {Object.entries(mockProgressData.performanceMetrics).map(([key, value]) => (
          <View key={key} style={styles.metricRow}>
            <Text style={[TEXT_STYLES.body, { textTransform: 'capitalize', flex: 1 }]}>
              {key}
            </Text>
            <View style={styles.metricBarContainer}>
              <ProgressBar
                progress={value / 100}
                color={
                  value >= 80 ? COLORS.success :
                  value >= 60 ? COLORS.primary : COLORS.error
                }
                style={styles.metricBar}
              />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm }]}>
                {value}%
              </Text>
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderGoalsProgress = () => (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>
          Current Goals 🎯
        </Text>
        {mockProgressData.recentGoals.map((goal) => (
          <View key={goal.id} style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={TEXT_STYLES.body}>{goal.title}</Text>
              <Chip
                mode="outlined"
                compact
                textStyle={{ fontSize: 10 }}
                style={{ height: 24 }}
              >
                {Math.round(goal.progress * 100)}%
              </Chip>
            </View>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary, marginBottom: SPACING.xs }]}>
              Target: {goal.target}
            </Text>
            <ProgressBar
              progress={goal.progress}
              color={COLORS.primary}
              style={{ height: 6 }}
            />
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
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
          {renderLevelCard()}
          {renderStatsCards()}
          {renderWeeklyOverview()}
          {renderAchievements()}
          {renderPerformanceMetrics()}
          {renderGoalsProgress()}
          
          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </Animated.View>

      <IconButton
        icon="trending-up"
        size={24}
        iconColor="white"
        style={styles.fab}
        onPress={() => Alert.alert('📈 Detailed Analytics', 'Feature coming soon! Advanced analytics and insights are in development.')}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  levelCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  levelGradient: {
    padding: SPACING.lg,
  },
  levelContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  levelInfo: {
    flex: 1,
  },
  levelProgress: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 0.48,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  miniProgress: {
    width: '100%',
    marginTop: SPACING.xs,
    height: 4,
  },
  card: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
  },
  weekContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
  },
  dayContainer: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  dayLabel: {
    marginBottom: SPACING.xs,
    color: COLORS.secondary,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: SPACING.xs,
  },
  intensityBar: {
    width: 20,
    height: 4,
    borderRadius: 2,
  },
  achievementsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
  },
  achievementItem: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  achievementText: {
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontSize: 10,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metricBarContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricBar: {
    flex: 1,
    height: 6,
  },
  goalItem: {
    marginBottom: SPACING.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
  },
};

export default ProgressOverview;
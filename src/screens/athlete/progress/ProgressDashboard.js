import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const ProgressDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Redux state
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  // Mock data - replace with actual Redux state
  const progressData = {
    currentLevel: 12,
    totalXP: 2850,
    nextLevelXP: 3000,
    streak: 18,
    completionRate: 78,
    weeklyGoal: 5,
    weeklyCompleted: 4,
    recentAchievements: [
      { id: 1, title: 'Speed Demon', icon: 'flash-on', earned: '2 days ago', color: '#FFD700' },
      { id: 2, title: 'Consistency King', icon: 'trending-up', earned: '1 week ago', color: '#32CD32' },
      { id: 3, title: 'Team Player', icon: 'group', earned: '2 weeks ago', color: '#1E90FF' },
    ],
    performanceMetrics: [
      { id: 1, name: 'Speed', value: 85, change: '+5', trend: 'up', unit: '%', icon: 'speed' },
      { id: 2, name: 'Endurance', value: 72, change: '+12', trend: 'up', unit: '%', icon: 'timer' },
      { id: 3, name: 'Strength', value: 68, change: '-2', trend: 'down', unit: '%', icon: 'fitness-center' },
      { id: 4, name: 'Flexibility', value: 90, change: '+8', trend: 'up', unit: '%', icon: 'accessibility' },
    ],
    weeklyStats: [
      { day: 'Mon', completed: true, intensity: 8 },
      { day: 'Tue', completed: true, intensity: 6 },
      { day: 'Wed', completed: false, intensity: 0 },
      { day: 'Thu', completed: true, intensity: 9 },
      { day: 'Fri', completed: true, intensity: 7 },
      { day: 'Sat', completed: false, intensity: 0 },
      { day: 'Sun', completed: false, intensity: 0 },
    ],
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('📊 Progress Updated!', 'Your latest performance data has been synced.', [
        { text: 'Awesome! 🎉' }
      ]);
    }, 1500);
  }, []);

  const handleViewDetails = (metric) => {
    Alert.alert('🔍 Feature Coming Soon', `Detailed ${metric} analytics will be available in the next update!`, [
      { text: 'Got it!' }
    ]);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const renderLevelProgress = () => (
    <Animated.View style={[styles.levelCard, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.levelGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.levelContent}>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>Level {progressData.currentLevel} 🏆</Text>
            <Text style={styles.levelSubtitle}>{progressData.totalXP} XP</Text>
          </View>
          <View style={styles.levelProgress}>
            <ProgressBar
              progress={(progressData.totalXP % 1000) / 1000}
              color={COLORS.success}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {150} XP to Level {progressData.currentLevel + 1}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderStreakCard = () => (
    <Card style={styles.streakCard} elevation={4}>
      <Card.Content style={styles.streakContent}>
        <View style={styles.streakIcon}>
          <Icon name="local-fire-department" size={32} color="#FF6B35" />
        </View>
        <View style={styles.streakInfo}>
          <Text style={styles.streakNumber}>{progressData.streak}</Text>
          <Text style={styles.streakLabel}>Day Streak 🔥</Text>
        </View>
        <View style={styles.weeklyGoal}>
          <Text style={styles.goalText}>Weekly Goal</Text>
          <Text style={styles.goalProgress}>
            {progressData.weeklyCompleted}/{progressData.weeklyGoal}
          </Text>
          <ProgressBar
            progress={progressData.weeklyCompleted / progressData.weeklyGoal}
            color={COLORS.primary}
            style={styles.goalProgressBar}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderPerformanceMetrics = () => (
    <View style={styles.metricsContainer}>
      <Text style={styles.sectionTitle}>Performance Metrics 📈</Text>
      <View style={styles.metricsGrid}>
        {progressData.performanceMetrics.map((metric, index) => (
          <Animated.View
            key={metric.id}
            style={[
              styles.metricCard,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity
              onPress={() => handleViewDetails(metric.name)}
              style={styles.metricTouchable}
            >
              <Surface style={styles.metricSurface} elevation={2}>
                <View style={styles.metricHeader}>
                  <Icon name={metric.icon} size={24} color={COLORS.primary} />
                  <View style={styles.metricTrend}>
                    <Icon
                      name={metric.trend === 'up' ? 'trending-up' : 'trending-down'}
                      size={16}
                      color={metric.trend === 'up' ? COLORS.success : COLORS.error}
                    />
                    <Text style={[
                      styles.metricChange,
                      { color: metric.trend === 'up' ? COLORS.success : COLORS.error }
                    ]}>
                      {metric.change}
                    </Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>{metric.value}{metric.unit}</Text>
                <Text style={styles.metricName}>{metric.name}</Text>
                <ProgressBar
                  progress={metric.value / 100}
                  color={metric.trend === 'up' ? COLORS.success : COLORS.error}
                  style={styles.metricProgressBar}
                />
              </Surface>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderWeeklyActivity = () => (
    <Card style={styles.weeklyCard} elevation={3}>
      <Card.Content>
        <View style={styles.weeklyHeader}>
          <Text style={styles.sectionTitle}>This Week 📅</Text>
          <Chip
            mode="outlined"
            selected={selectedPeriod === 'week'}
            onPress={() => setSelectedPeriod('week')}
            style={styles.periodChip}
          >
            Week
          </Chip>
        </View>
        <View style={styles.weeklyDays}>
          {progressData.weeklyStats.map((day, index) => (
            <View key={index} style={styles.dayContainer}>
              <Text style={styles.dayLabel}>{day.day}</Text>
              <View style={[
                styles.dayCircle,
                {
                  backgroundColor: day.completed ? COLORS.success : COLORS.background,
                  borderColor: day.completed ? COLORS.success : '#E0E0E0',
                }
              ]}>
                {day.completed ? (
                  <Icon name="check" size={16} color="white" />
                ) : (
                  <Text style={styles.dayNumber}>{index + 1}</Text>
                )}
              </View>
              {day.completed && (
                <View style={styles.intensityBar}>
                  <View style={[
                    styles.intensityFill,
                    {
                      height: `${day.intensity * 10}%`,
                      backgroundColor: day.intensity > 7 ? '#FF6B35' : day.intensity > 5 ? '#FFD700' : COLORS.success,
                    }
                  ]} />
                </View>
              )}
            </View>
          ))}
        </View>
        <View style={styles.completionStats}>
          <Text style={styles.completionText}>
            {Math.round(progressData.completionRate)}% completion rate this month 🎯
          </Text>
          <ProgressBar
            progress={progressData.completionRate / 100}
            color={COLORS.primary}
            style={styles.completionBar}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={styles.achievementsCard} elevation={3}>
      <Card.Content>
        <View style={styles.achievementsHeader}>
          <Text style={styles.sectionTitle}>Recent Achievements 🏆</Text>
          <IconButton
            icon="arrow-right"
            size={20}
            onPress={() => Alert.alert('🏆 Feature Coming Soon', 'Full achievements gallery coming soon!')}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementsScroll}
        >
          {progressData.recentAchievements.map((achievement) => (
            <Surface key={achievement.id} style={styles.achievementCard} elevation={2}>
              <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
                <Icon name={achievement.icon} size={24} color={achievement.color} />
              </View>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDate}>{achievement.earned}</Text>
            </Surface>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Avatar.Text
                size={48}
                label={user?.name?.charAt(0) || 'A'}
                style={styles.avatar}
              />
              <View style={styles.headerText}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.name || 'Athlete'} 💪</Text>
              </View>
            </View>
            <IconButton
              icon="notifications"
              iconColor="white"
              size={24}
              onPress={() => Alert.alert('🔔 Feature Coming Soon', 'Notifications center coming soon!')}
            />
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
      >
        {renderLevelProgress()}
        {renderStreakCard()}
        {renderPerformanceMetrics()}
        {renderWeeklyActivity()}
        {renderAchievements()}
        
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('WorkoutHistory')}
            style={styles.actionButton}
            icon="history"
          >
            View History
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Analytics')}
            style={styles.actionButton}
            icon="analytics"
          >
            Detailed Analytics
          </Button>
        </View>
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => navigation.navigate('LogWorkout')}
        label="Log Session"
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerText: {
    marginLeft: SPACING.md,
  },
  welcomeText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    ...TEXT_STYLES.h6,
    color: 'white',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 140,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    ...TEXT_STYLES.h5,
    color: 'white',
    fontWeight: 'bold',
  },
  levelSubtitle: {
    ...TEXT_STYLES.body2,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  levelProgress: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  streakCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  streakIcon: {
    marginRight: SPACING.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  streakLabel: {
    ...TEXT_STYLES.body2,
    color: COLORS.text,
  },
  weeklyGoal: {
    alignItems: 'flex-end',
  },
  goalText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  goalProgress: {
    ...TEXT_STYLES.h6,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  goalProgressBar: {
    width: 80,
    height: 6,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    ...TEXT_STYLES.h6,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  metricsContainer: {
    marginBottom: SPACING.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - SPACING.lg * 3) / 2,
    marginBottom: SPACING.md,
  },
  metricTouchable: {
    flex: 1,
  },
  metricSurface: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricChange: {
    ...TEXT_STYLES.caption,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  metricValue: {
    ...TEXT_STYLES.h5,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  metricName: {
    ...TEXT_STYLES.body2,
    color: COLORS.textSecondary,
    marginVertical: SPACING.xs,
  },
  metricProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  weeklyCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  periodChip: {
    backgroundColor: COLORS.primary + '20',
  },
  weeklyDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  dayNumber: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  intensityBar: {
    width: 4,
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  intensityFill: {
    width: '100%',
    borderRadius: 2,
  },
  completionStats: {
    marginTop: SPACING.md,
  },
  completionText: {
    ...TEXT_STYLES.body2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  completionBar: {
    height: 6,
    borderRadius: 3,
  },
  achievementsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  achievementsScroll: {
    paddingRight: SPACING.md,
  },
  achievementCard: {
    width: 120,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  achievementTitle: {
    ...TEXT_STYLES.body2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  achievementDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default ProgressDashboard;
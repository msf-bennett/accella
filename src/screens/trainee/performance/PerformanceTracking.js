import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  RefreshControl,
  Dimensions,
  StatusBar,
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
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PerformanceTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, performanceData, isLoading } = useSelector(state => state.performance);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Sample performance data (replace with actual Redux state)
  const [performanceMetrics] = useState({
    currentStreak: 12,
    totalWorkouts: 47,
    weeklyGoal: 5,
    completedThisWeek: 3,
    level: 8,
    totalPoints: 2450,
    nextLevelPoints: 2800,
    achievements: [
      { id: '1', title: 'Consistency King', icon: 'jump-rope', earned: true },
      { id: '2', title: 'Strength Builder', icon: 'fitness-center', earned: true },
      { id: '3', title: 'Cardio Champion', icon: 'directions-run', earned: false },
    ],
    physicalTests: [
      { id: '1', name: 'Push-ups', current: 45, previous: 40, target: 50, unit: 'reps' },
      { id: '2', name: '5K Run', current: '22:30', previous: '23:15', target: '21:00', unit: 'min' },
      { id: '3', name: 'Plank Hold', current: '3:20', previous: '3:00', target: '4:00', unit: 'min' },
      { id: '4', name: 'Squat Max', current: 85, previous: 80, target: 90, unit: 'kg' },
    ],
    weeklyProgress: [
      { day: 'Mon', completed: true, points: 120 },
      { day: 'Tue', completed: true, points: 95 },
      { day: 'Wed', completed: true, points: 110 },
      { day: 'Thu', completed: false, points: 0 },
      { day: 'Fri', completed: false, points: 0 },
      { day: 'Sat', completed: false, points: 0 },
      { day: 'Sun', completed: false, points: 0 },
    ],
  });

  useEffect(() => {
    // Animate screen entrance
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
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Performance Tracking', 'Data refreshed! 📊');
    }, 1000);
  }, []);

  const handleAddMetric = () => {
    Alert.alert(
      'Add New Metric',
      'This feature is coming soon! You\'ll be able to log custom performance metrics.',
      [{ text: 'Got it! 💪', onPress: () => {} }]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Avatar.Image
            size={50}
            source={{ uri: user?.avatar || 'https://via.placeholder.com/50' }}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: 4 }]}>
              Performance 📈
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
              Level {performanceMetrics.level} • {performanceMetrics.totalPoints} Points
            </Text>
          </View>
        </View>
        <IconButton
          icon="notifications"
          iconColor="white"
          size={24}
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>
      
      {/* Level Progress */}
      <View style={styles.levelProgress}>
        <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginBottom: 8 }]}>
          Progress to Level {performanceMetrics.level + 1}
        </Text>
        <ProgressBar
          progress={(performanceMetrics.totalPoints % 350) / 350}
          color="white"
          style={styles.progressBar}
        />
        <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
          {performanceMetrics.nextLevelPoints - performanceMetrics.totalPoints} points to go!
        </Text>
      </View>
    </LinearGradient>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStats}>
      <Surface style={styles.statCard} elevation={2}>
        <Icon name="local-fire-department" size={28} color={COLORS.error} />
        <Text style={[TEXT_STYLES.h1, { marginTop: 8 }]}>
          {performanceMetrics.currentStreak}
        </Text>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
          Day Streak 🔥
        </Text>
      </Surface>
      
      <Surface style={styles.statCard} elevation={2}>
        <Icon name="fitness-center" size={28} color={COLORS.primary} />
        <Text style={[TEXT_STYLES.h1, { marginTop: 8 }]}>
          {performanceMetrics.totalWorkouts}
        </Text>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
          Total Workouts
        </Text>
      </Surface>
      
      <Surface style={styles.statCard} elevation={2}>
        <Icon name="jump-rope" size={28} color={COLORS.warning} />
        <Text style={[TEXT_STYLES.h1, { marginTop: 8 }]}>
          {performanceMetrics.achievements.filter(a => a.earned).length}
        </Text>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
          Achievements 🏆
        </Text>
      </Surface>
    </View>
  );

  const renderWeeklyProgress = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={TEXT_STYLES.h3}>Weekly Progress 📅</Text>
          <Chip
            mode="outlined"
            textStyle={{ color: COLORS.primary }}
            style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}
          >
            {performanceMetrics.completedThisWeek}/{performanceMetrics.weeklyGoal} workouts
          </Chip>
        </View>
        
        <View style={styles.weeklyGrid}>
          {performanceMetrics.weeklyProgress.map((day, index) => (
            <View key={day.day} style={styles.dayCard}>
              <Surface
                style={[
                  styles.dayIndicator,
                  day.completed && styles.dayCompleted
                ]}
                elevation={day.completed ? 3 : 1}
              >
                <Icon
                  name={day.completed ? 'check' : 'fitness-center'}
                  size={20}
                  color={day.completed ? 'white' : COLORS.textSecondary}
                />
              </Surface>
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                {day.day}
              </Text>
              {day.completed && (
                <Text style={[TEXT_STYLES.caption, { color: COLORS.success, fontSize: 10 }]}>
                  +{day.points}pts
                </Text>
              )}
            </View>
          ))}
        </View>
        
        <ProgressBar
          progress={performanceMetrics.completedThisWeek / performanceMetrics.weeklyGoal}
          color={COLORS.success}
          style={[styles.progressBar, { marginTop: SPACING.lg }]}
        />
      </Card.Content>
    </Card>
  );

  const renderPhysicalTests = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={TEXT_STYLES.h3}>Physical Tests 💪</Text>
          <IconButton
            icon="add"
            iconColor={COLORS.primary}
            size={20}
            onPress={handleAddMetric}
          />
        </View>
        
        {performanceMetrics.physicalTests.map((test) => (
          <Surface key={test.id} style={styles.testItem} elevation={1}>
            <View style={styles.testHeader}>
              <Text style={TEXT_STYLES.subtitle1}>{test.name}</Text>
              <View style={styles.testValues}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                  {test.current}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {test.unit}
                </Text>
              </View>
            </View>
            
            <View style={styles.testProgress}>
              <View style={styles.testStats}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Previous: {test.previous} {test.unit}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.warning }]}>
                  Target: {test.target} {test.unit}
                </Text>
              </View>
              
              <View style={styles.improvementBadge}>
                <Icon name="trending-up" size={16} color={COLORS.success} />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.success, marginLeft: 4 }]}>
                  Improved! 🎉
                </Text>
              </View>
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={TEXT_STYLES.h3}>Achievements 🏆</Text>
          <Button
            mode="text"
            textColor={COLORS.primary}
            onPress={() => navigation.navigate('AllAchievements')}
          >
            View All
          </Button>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {performanceMetrics.achievements.map((achievement) => (
            <Surface
              key={achievement.id}
              style={[
                styles.achievementCard,
                achievement.earned && styles.achievementEarned
              ]}
              elevation={achievement.earned ? 3 : 1}
            >
              <Icon
                name={achievement.icon}
                size={32}
                color={achievement.earned ? COLORS.warning : COLORS.textSecondary}
              />
              <Text
                style={[
                  TEXT_STYLES.caption,
                  { textAlign: 'center', marginTop: 8 },
                  achievement.earned && { color: COLORS.warning, fontWeight: 'bold' }
                ]}
              >
                {achievement.title}
              </Text>
              {achievement.earned && (
                <View style={styles.earnedBadge}>
                  <Icon name="check" size={12} color="white" />
                </View>
              )}
            </Surface>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
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
          {renderHeader()}
          
          <View style={styles.content}>
            {renderQuickStats()}
            {renderWeeklyProgress()}
            {renderPhysicalTests()}
            {renderAchievements()}
            
            {/* Spacing for FAB */}
            <View style={{ height: 80 }} />
          </View>
        </ScrollView>
      </Animated.View>

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={handleAddMetric}
        label="Log Performance"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  levelProgress: {
    marginTop: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  dayCard: {
    alignItems: 'center',
  },
  dayIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCompleted: {
    backgroundColor: COLORS.success,
  },
  testItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  testValues: {
    alignItems: 'flex-end',
  },
  testProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testStats: {
    flex: 1,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  achievementCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 100,
    position: 'relative',
  },
  achievementEarned: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  earnedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.success,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
  },
});

export default PerformanceTracking;
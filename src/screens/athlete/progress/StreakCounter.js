import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Animated,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
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
  Modal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 18,
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

const { width, height } = Dimensions.get('window');

const StreakCounter = ({ navigation, route }) => {
  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const streaks = useSelector(state => state.streaks);
  const achievements = useSelector(state => state.achievements);

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [streakData, setStreakData] = useState({
    currentStreak: 15,
    longestStreak: 28,
    totalWorkouts: 124,
    weeklyGoal: 5,
    weeklyProgress: 3,
    monthlyPoints: 1250,
    level: 7,
    nextLevelPoints: 1500,
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const streakFireAnim = useRef(new Animated.Value(1)).current;

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Fire animation for streak
    const fireAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(streakFireAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(streakFireAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    fireAnimation.start();

    setLoading(false);
    return () => fireAnimation.stop();
  }, [fadeAnim, scaleAnim, streakFireAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data fetch
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Streak Data', 'Streak data refreshed! 🔥', [{ text: 'OK' }]);
    }, 1500);
  }, []);

  const handleStreakTap = () => {
    Vibration.vibrate(50);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAchievementPress = (achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
    Vibration.vibrate(100);
  };

  const achievements_data = [
    { id: 1, title: 'Fire Starter', description: '7 day streak', icon: 'whatshot', earned: true, points: 100 },
    { id: 2, title: 'Dedication', description: '30 day streak', icon: 'jump-rope', earned: true, points: 300 },
    { id: 3, title: 'Beast Mode', description: '100 workouts', icon: 'fitness-center', earned: true, points: 500 },
    { id: 4, title: 'Consistency King', description: '60 day streak', icon: 'crown', earned: false, points: 600 },
    { id: 5, title: 'Marathon Master', description: '365 day streak', icon: 'star', earned: false, points: 1000 },
  ];

  const streakMilestones = [
    { days: 7, title: 'Week Warrior', color: '#4CAF50', achieved: true },
    { days: 14, title: 'Fortnight Fighter', color: '#2196F3', achieved: true },
    { days: 30, title: 'Month Master', color: '#FF9800', achieved: false },
    { days: 60, title: 'Consistency Champion', color: '#9C27B0', achieved: false },
    { days: 100, title: 'Century Crusher', color: '#F44336', achieved: false },
  ];

  const renderStreakCard = () => (
    <Card style={styles.streakCard} elevation={8}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.streakGradient}
      >
        <TouchableOpacity onPress={handleStreakTap} activeOpacity={0.8}>
          <Animated.View
            style={[
              styles.streakContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.fireIconContainer,
                { transform: [{ scale: streakFireAnim }] },
              ]}
            >
              <Icon name="whatshot" size={60} color="#FFD700" />
            </Animated.View>
            <Text style={styles.streakNumber}>{streakData.currentStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
            <Text style={styles.streakSubtitle}>Keep the fire burning! 🔥</Text>
          </Animated.View>
        </TouchableOpacity>
      </LinearGradient>
    </Card>
  );

  const renderStatsGrid = () => (
    <View style={styles.statsGrid}>
      <Surface style={styles.statCard} elevation={4}>
        <Icon name="timeline" size={30} color={COLORS.primary} />
        <Text style={styles.statNumber}>{streakData.longestStreak}</Text>
        <Text style={styles.statLabel}>Best Streak</Text>
      </Surface>
      
      <Surface style={styles.statCard} elevation={4}>
        <Icon name="fitness-center" size={30} color={COLORS.success} />
        <Text style={styles.statNumber}>{streakData.totalWorkouts}</Text>
        <Text style={styles.statLabel}>Total Workouts</Text>
      </Surface>
      
      <Surface style={styles.statCard} elevation={4}>
        <Icon name="star" size={30} color={COLORS.warning} />
        <Text style={styles.statNumber}>{streakData.monthlyPoints}</Text>
        <Text style={styles.statLabel}>Monthly Points</Text>
      </Surface>
      
      <Surface style={styles.statCard} elevation={4}>
        <Icon name="trending-up" size={30} color={COLORS.secondary} />
        <Text style={styles.statNumber}>Level {streakData.level}</Text>
        <Text style={styles.statLabel}>Current Level</Text>
      </Surface>
    </View>
  );

  const renderWeeklyProgress = () => (
    <Card style={styles.progressCard} elevation={4}>
      <Card.Content>
        <View style={styles.progressHeader}>
          <Text style={TEXT_STYLES.subheading}>Weekly Goal Progress</Text>
          <Chip
            mode="outlined"
            textStyle={{ color: COLORS.primary }}
            style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}
          >
            {streakData.weeklyProgress}/{streakData.weeklyGoal}
          </Chip>
        </View>
        <ProgressBar
          progress={streakData.weeklyProgress / streakData.weeklyGoal}
          color={COLORS.primary}
          style={styles.progressBar}
        />
        <Text style={styles.progressText}>
          {streakData.weeklyGoal - streakData.weeklyProgress} more workouts to reach your weekly goal! 💪
        </Text>
      </Card.Content>
    </Card>
  );

  const renderMilestones = () => (
    <Card style={styles.milestonesCard} elevation={4}>
      <Card.Content>
        <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md }]}>
          Streak Milestones
        </Text>
        {streakMilestones.map((milestone, index) => (
          <View key={index} style={styles.milestoneItem}>
            <View style={[
              styles.milestoneIcon,
              {
                backgroundColor: milestone.achieved ? milestone.color : '#E0E0E0',
              }
            ]}>
              <Icon
                name={milestone.achieved ? 'check' : 'lock'}
                size={20}
                color={milestone.achieved ? 'white' : '#999'}
              />
            </View>
            <View style={styles.milestoneContent}>
              <Text style={[
                TEXT_STYLES.body,
                { opacity: milestone.achieved ? 1 : 0.6 }
              ]}>
                {milestone.title}
              </Text>
              <Text style={[
                TEXT_STYLES.caption,
                { opacity: milestone.achieved ? 1 : 0.6 }
              ]}>
                {milestone.days} day streak
              </Text>
            </View>
            {milestone.achieved && (
              <Icon name="jump-rope" size={24} color={milestone.color} />
            )}
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={styles.achievementsCard} elevation={4}>
      <Card.Content>
        <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.md }]}>
          Achievements 🏆
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {achievements_data.map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              onPress={() => handleAchievementPress(achievement)}
              style={styles.achievementItem}
            >
              <View style={[
                styles.achievementIcon,
                {
                  backgroundColor: achievement.earned ? COLORS.primary : '#E0E0E0',
                  opacity: achievement.earned ? 1 : 0.5,
                }
              ]}>
                <Icon
                  name={achievement.icon}
                  size={30}
                  color={achievement.earned ? 'white' : '#999'}
                />
              </View>
              <Text style={[
                styles.achievementTitle,
                { opacity: achievement.earned ? 1 : 0.5 }
              ]}>
                {achievement.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderAchievementModal = () => (
    <Portal>
      <Modal
        visible={showAchievementModal}
        onDismiss={() => setShowAchievementModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedAchievement && (
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <View style={[
                  styles.modalIcon,
                  {
                    backgroundColor: selectedAchievement.earned ? COLORS.primary : '#E0E0E0',
                  }
                ]}>
                  <Icon
                    name={selectedAchievement.icon}
                    size={40}
                    color={selectedAchievement.earned ? 'white' : '#999'}
                  />
                </View>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowAchievementModal(false)}
                  style={styles.closeButton}
                />
              </View>
              <Text style={styles.modalTitle}>{selectedAchievement.title}</Text>
              <Text style={styles.modalDescription}>{selectedAchievement.description}</Text>
              <Text style={styles.modalPoints}>+{selectedAchievement.points} points</Text>
              {selectedAchievement.earned && (
                <Chip
                  mode="flat"
                  textStyle={{ color: COLORS.success }}
                  style={styles.earnedChip}
                >
                  ✅ Earned
                </Chip>
              )}
            </Card.Content>
          </Card>
        )}
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="whatshot" size={60} color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your streak...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Streak Counter</Text>
        <Text style={styles.headerSubtitle}>Keep your momentum going! 🚀</Text>
      </LinearGradient>

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
      >
        {renderStreakCard()}
        {renderStatsGrid()}
        {renderWeeklyProgress()}
        {renderMilestones()}
        {renderAchievements()}
      </ScrollView>

      {renderAchievementModal()}

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Log Workout', 'Workout logging feature coming soon! 💪')}
        color="white"
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
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  streakCard: {
    marginBottom: SPACING.lg,
    borderRadius: 20,
    overflow: 'hidden',
  },
  streakGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  streakContent: {
    alignItems: 'center',
  },
  fireIconContainer: {
    marginBottom: SPACING.sm,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.xs,
  },
  streakLabel: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  streakSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: (width - SPACING.md * 3) / 2,
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: SPACING.sm,
  },
  statNumber: {
    ...TEXT_STYLES.subheading,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  progressCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  milestonesCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  milestoneContent: {
    flex: 1,
  },
  achievementsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  achievementItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  achievementTitle: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    maxWidth: 80,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '90%',
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    margin: 0,
  },
  modalTitle: {
    ...TEXT_STYLES.heading,
    marginBottom: SPACING.sm,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
  },
  modalPoints: {
    ...TEXT_STYLES.subheading,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  earnedChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignSelf: 'flex-start',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
  },
};

export default StreakCounter;
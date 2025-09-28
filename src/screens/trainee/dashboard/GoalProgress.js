import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Alert,
  FlatList,
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
  Badge,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
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
  border: '#e0e0e0',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
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
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' },
};

const { width } = Dimensions.get('window');

const GoalProgress = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, goals, achievements } = useSelector(state => ({
    user: state.auth.user,
    goals: state.goals.userGoals,
    achievements: state.achievements.userAchievements,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnims = useRef({}).current;

  // Mock data for demonstration
  const mockGoals = [
    {
      id: '1',
      title: 'Sprint Speed Improvement',
      description: 'Improve 100m sprint time by 0.5 seconds',
      category: 'speed',
      targetValue: 0.5,
      currentValue: 0.3,
      unit: 'seconds',
      progress: 60,
      targetDate: '2024-09-15',
      priority: 'high',
      streak: 12,
      icon: 'speed',
      color: COLORS.error,
      isCompleted: false,
      milestones: [
        { value: 0.1, completed: true, date: '2024-08-10' },
        { value: 0.3, completed: true, date: '2024-08-20' },
        { value: 0.5, completed: false, date: '2024-09-15' },
      ],
    },
    {
      id: '2',
      title: 'Endurance Building',
      description: 'Run 5km under 22 minutes',
      category: 'endurance',
      targetValue: 22,
      currentValue: 24.5,
      unit: 'minutes',
      progress: 80,
      targetDate: '2024-10-01',
      priority: 'medium',
      streak: 8,
      icon: 'directions-run',
      color: COLORS.warning,
      isCompleted: false,
      milestones: [
        { value: 26, completed: true, date: '2024-07-15' },
        { value: 24, completed: true, date: '2024-08-15' },
        { value: 22, completed: false, date: '2024-10-01' },
      ],
    },
    {
      id: '3',
      title: 'Strength Training',
      description: 'Complete 50 training sessions',
      category: 'strength',
      targetValue: 50,
      currentValue: 50,
      unit: 'sessions',
      progress: 100,
      targetDate: '2024-08-24',
      priority: 'high',
      streak: 15,
      icon: 'fitness-center',
      color: COLORS.success,
      isCompleted: true,
      milestones: [
        { value: 20, completed: true, date: '2024-07-01' },
        { value: 35, completed: true, date: '2024-08-01' },
        { value: 50, completed: true, date: '2024-08-24' },
      ],
    },
    {
      id: '4',
      title: 'Flexibility Improvement',
      description: 'Increase flexibility score by 25%',
      category: 'flexibility',
      targetValue: 25,
      currentValue: 15,
      unit: '%',
      progress: 60,
      targetDate: '2024-11-01',
      priority: 'low',
      streak: 6,
      icon: 'accessibility',
      color: COLORS.primary,
      isCompleted: false,
      milestones: [
        { value: 10, completed: true, date: '2024-08-01' },
        { value: 20, completed: false, date: '2024-10-01' },
        { value: 25, completed: false, date: '2024-11-01' },
      ],
    },
  ];

  const mockAchievements = [
    {
      id: 'a1',
      title: 'First Goal Completed! 🏆',
      description: 'Completed your first training goal',
      type: 'milestone',
      earnedDate: '2024-08-24',
      points: 100,
      badge: 'gold',
    },
    {
      id: 'a2',
      title: 'Consistency King 👑',
      description: '15-day training streak',
      type: 'streak',
      earnedDate: '2024-08-23',
      points: 150,
      badge: 'gold',
    },
    {
      id: 'a3',
      title: 'Speed Demon ⚡',
      description: 'Improved sprint time significantly',
      type: 'performance',
      earnedDate: '2024-08-20',
      points: 75,
      badge: 'silver',
    },
  ];

  const timeframes = [
    { key: 'daily', label: 'Daily', icon: 'today' },
    { key: 'weekly', label: 'Weekly', icon: 'date-range' },
    { key: 'monthly', label: 'Monthly', icon: 'calendar-month' },
    { key: 'yearly', label: 'Yearly', icon: 'calendar-today' },
  ];

  const categories = [
    { key: 'all', label: 'All Goals', icon: 'all-inclusive', color: COLORS.primary },
    { key: 'speed', label: 'Speed', icon: 'speed', color: COLORS.error },
    { key: 'endurance', label: 'Endurance', icon: 'directions-run', color: COLORS.warning },
    { key: 'strength', label: 'Strength', icon: 'fitness-center', color: COLORS.success },
    { key: 'flexibility', label: 'Flexibility', icon: 'accessibility', color: COLORS.primary },
  ];

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent', true);

    // Initialize animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize progress animations
    mockGoals.forEach(goal => {
      progressAnims[goal.id] = new Animated.Value(0);
      Animated.timing(progressAnims[goal.id], {
        toValue: goal.progress / 100,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    });

    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Goals Refreshed', 'Latest progress data has been loaded! 📈');
    }, 1500);
  }, []);

  const handleGoalPress = useCallback((goal) => {
    Alert.alert(
      goal.title,
      `${goal.description}\n\nProgress: ${goal.progress}%\nStreak: ${goal.streak} days`,
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const handleAddGoal = useCallback(() => {
    Alert.alert(
      'Feature Coming Soon',
      'Goal creation and customization will be available in the next version! 🎯',
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const getFilteredGoals = () => {
    let filtered = mockGoals;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(goal => goal.category === selectedCategory);
    }
    return filtered;
  };

  const calculateOverallProgress = () => {
    const goals = getFilteredGoals();
    if (goals.length === 0) return 0;
    return Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length);
  };

  const getCompletedGoalsCount = () => {
    return getFilteredGoals().filter(goal => goal.isCompleted).length;
  };

  const getTotalPoints = () => {
    return mockAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
  };

  const getBadgeIcon = (badge) => {
    const badges = {
      gold: { icon: 'jump-rope', color: COLORS.gold },
      silver: { icon: 'jump-rope', color: COLORS.silver },
      bronze: { icon: 'jump-rope', color: COLORS.bronze },
    };
    return badges[badge] || { icon: 'jump-rope', color: COLORS.primary };
  };

  const renderStatsCard = () => (
    <Surface style={styles.statsCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.statsGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Your Progress 📊</Text>
          <Text style={styles.overallProgress}>{calculateOverallProgress()}%</Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="jump-rope" size={24} color="#fff" />
            <Text style={styles.statValue}>{getCompletedGoalsCount()}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="trending-up" size={24} color="#fff" />
            <Text style={styles.statValue}>{getFilteredGoals().length}</Text>
            <Text style={styles.statLabel}>Active Goals</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="stars" size={24} color="#fff" />
            <Text style={styles.statValue}>{getTotalPoints()}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderGoalCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.goalCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card
        style={[
          styles.card,
          item.isCompleted && styles.completedCard
        ]}
        onPress={() => handleGoalPress(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.goalInfo}>
            <View style={[styles.goalIcon, { backgroundColor: item.color + '20' }]}>
              <Icon name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.goalDetails}>
              <Text style={styles.goalTitle}>{item.title}</Text>
              <Text style={styles.goalDescription}>{item.description}</Text>
            </View>
          </View>
          
          {item.isCompleted && (
            <Icon name="check-circle" size={28} color={COLORS.success} />
          )}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {item.currentValue}{item.unit} / {item.targetValue}{item.unit}
            </Text>
            <Text style={[styles.progressPercent, { color: item.color }]}>
              {item.progress}%
            </Text>
          </View>
          
          <ProgressBar
            progress={item.progress / 100}
            color={item.color}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.goalFooter}>
          <View style={styles.streakSection}>
            <Icon name="local-fire-department" size={16} color={COLORS.warning} />
            <Text style={styles.streakText}>{item.streak} day streak</Text>
          </View>
          
          <View style={styles.milestoneSection}>
            <Text style={styles.milestonesLabel}>Milestones:</Text>
            <View style={styles.milestones}>
              {item.milestones.map((milestone, mIndex) => (
                <View
                  key={mIndex}
                  style={[
                    styles.milestone,
                    milestone.completed && styles.completedMilestone
                  ]}
                >
                  <Icon
                    name={milestone.completed ? 'check-circle' : 'radio-button-unchecked'}
                    size={12}
                    color={milestone.completed ? COLORS.success : COLORS.border}
                  />
                </View>
              ))}
            </View>
          </View>
          
          <Chip
            mode="outlined"
            compact
            style={[styles.priorityChip, { borderColor: item.color }]}
            textStyle={[styles.priorityText, { color: item.color }]}
          >
            {item.priority}
          </Chip>
        </View>
      </Card>
    </Animated.View>
  );

  const renderTimeframeChip = ({ item }) => (
    <Chip
      mode={selectedTimeframe === item.key ? 'flat' : 'outlined'}
      selected={selectedTimeframe === item.key}
      onPress={() => setSelectedTimeframe(item.key)}
      style={[
        styles.filterChip,
        selectedTimeframe === item.key && styles.selectedFilterChip
      ]}
      textStyle={[
        styles.filterChipText,
        selectedTimeframe === item.key && styles.selectedFilterChipText
      ]}
      icon={item.icon}
    >
      {item.label}
    </Chip>
  );

  const renderCategoryChip = ({ item }) => (
    <Chip
      mode={selectedCategory === item.key ? 'flat' : 'outlined'}
      selected={selectedCategory === item.key}
      onPress={() => setSelectedCategory(item.key)}
      style={[
        styles.categoryChip,
        selectedCategory === item.key && { backgroundColor: item.color + '20' }
      ]}
      textStyle={[
        styles.categoryChipText,
        selectedCategory === item.key && { color: item.color }
      ]}
      icon={item.icon}
    >
      {item.label}
    </Chip>
  );

  const renderAchievementCard = ({ item }) => {
    const badgeInfo = getBadgeIcon(item.badge);
    return (
      <Card style={styles.achievementCard}>
        <View style={styles.achievementContent}>
          <Icon
            name={badgeInfo.icon}
            size={32}
            color={badgeInfo.color}
            style={styles.achievementIcon}
          />
          <View style={styles.achievementDetails}>
            <Text style={styles.achievementTitle}>{item.title}</Text>
            <Text style={styles.achievementDescription}>{item.description}</Text>
            <Text style={styles.achievementPoints}>+{item.points} points</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              iconColor="#fff"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Goal Progress 🎯</Text>
            <IconButton
              icon="insights"
              iconColor="#fff"
              size={24}
              onPress={() => Alert.alert('Feature Coming Soon', 'Detailed analytics will be available soon!')}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Stats Card */}
        {renderStatsCard()}

        {/* Recent Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Achievements 🏆</Text>
            <TouchableOpacity onPress={() => Alert.alert('Feature Coming Soon', 'Full achievements list will be available soon!')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={mockAchievements.slice(0, 2)}
            renderItem={renderAchievementCard}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsList}
          />
        </View>

        {/* Timeframe Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Timeframe</Text>
          <FlatList
            data={timeframes}
            renderItem={renderTimeframeChip}
            keyExtractor={item => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          />
        </View>

        {/* Category Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryChip}
            keyExtractor={item => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          />
        </View>

        {/* Goals List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Goals 🎯</Text>
          {getFilteredGoals().map((goal, index) => (
            <View key={goal.id}>
              {renderGoalCard({ item: goal, index })}
            </View>
          ))}
        </View>

        <View style={{ height: SPACING.xl * 2 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleAddGoal}
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    margin: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
  },
  overallProgress: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  viewAllText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  achievementsList: {
    gap: SPACING.md,
  },
  achievementCard: {
    width: width * 0.7,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  achievementIcon: {
    marginRight: SPACING.md,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  achievementPoints: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  filtersSection: {
    marginBottom: SPACING.lg,
  },
  filterTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    backgroundColor: '#fff',
    borderColor: COLORS.border,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: '#fff',
  },
  categoryChip: {
    backgroundColor: '#fff',
    borderColor: COLORS.border,
  },
  categoryChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  goalCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 3,
    overflow: 'hidden',
  },
  completedCard: {
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  goalDetails: {
    flex: 1,
  },
  goalTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  goalDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  progressSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  progressPercent: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  milestoneSection: {
    alignItems: 'center',
  },
  milestonesLabel: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  milestones: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  milestone: {
    padding: 2,
  },
  completedMilestone: {
    backgroundColor: COLORS.success + '20',
    borderRadius: 8,
  },
  priorityChip: {
    height: 24,
    backgroundColor: 'transparent',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});

export default GoalProgress;
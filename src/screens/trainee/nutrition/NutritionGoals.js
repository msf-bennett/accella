import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Modal,
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
  TextInput,
  Portal,
  Switch,
  Slider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
  info: '#3498db',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const NutritionalGoals = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, goals, currentProgress } = useSelector((state) => state.nutrition);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [scrollY] = useState(new Animated.Value(0));

  // Sample goal data
  const [nutritionalGoals, setNutritionalGoals] = useState([
    {
      id: 1,
      title: 'Daily Calorie Target',
      type: 'calories',
      current: 1850,
      target: 2200,
      unit: 'kcal',
      icon: 'local-fire-department',
      color: COLORS.accent,
      streak: 8,
      bestStreak: 15,
      priority: 'high',
      status: 'in_progress',
      lastUpdated: '2 hours ago',
      weeklyProgress: [85, 92, 78, 95, 88, 90, 84], // Last 7 days percentage
    },
    {
      id: 2,
      title: 'Protein Intake',
      type: 'protein',
      current: 120,
      target: 140,
      unit: 'g',
      icon: 'fitness-center',
      color: COLORS.primary,
      streak: 12,
      bestStreak: 20,
      priority: 'high',
      status: 'on_track',
      lastUpdated: '1 hour ago',
      weeklyProgress: [90, 88, 95, 92, 89, 96, 86],
    },
    {
      id: 3,
      title: 'Water Intake',
      type: 'hydration',
      current: 2.1,
      target: 3.0,
      unit: 'L',
      icon: 'water-drop',
      color: COLORS.info,
      streak: 5,
      bestStreak: 12,
      priority: 'medium',
      status: 'needs_attention',
      lastUpdated: '30 mins ago',
      weeklyProgress: [70, 65, 80, 72, 68, 75, 70],
    },
    {
      id: 4,
      title: 'Carbohydrate Balance',
      type: 'carbs',
      current: 180,
      target: 200,
      unit: 'g',
      icon: 'grain',
      color: COLORS.warning,
      streak: 6,
      bestStreak: 14,
      priority: 'medium',
      status: 'on_track',
      lastUpdated: '1 hour ago',
      weeklyProgress: [88, 92, 85, 90, 87, 91, 90],
    },
    {
      id: 5,
      title: 'Healthy Fats',
      type: 'fats',
      current: 65,
      target: 75,
      unit: 'g',
      icon: 'eco',
      color: COLORS.success,
      streak: 3,
      bestStreak: 9,
      priority: 'low',
      status: 'in_progress',
      lastUpdated: '2 hours ago',
      weeklyProgress: [82, 78, 88, 85, 80, 87, 87],
    },
  ]);

  const [weeklyStats] = useState({
    avgCalories: 2080,
    avgProtein: 128,
    avgHydration: 2.4,
    goalsCompleted: 18,
    totalGoals: 35,
    improvementRate: 12,
  });

  const [recommendations] = useState([
    {
      id: 1,
      title: 'Increase Water Intake',
      description: 'You\'re consistently under your hydration goal. Try setting hourly reminders.',
      priority: 'high',
      icon: 'water-drop',
      color: COLORS.info,
      actionText: 'Set Reminders',
    },
    {
      id: 2,
      title: 'Pre-Workout Nutrition',
      description: 'Add a banana 30 minutes before training for better performance.',
      priority: 'medium',
      icon: 'schedule',
      color: COLORS.warning,
      actionText: 'Learn More',
    },
    {
      id: 3,
      title: 'Evening Protein',
      description: 'Consider casein protein before bed to support overnight recovery.',
      priority: 'low',
      icon: 'bedtime',
      color: COLORS.primary,
      actionText: 'Add to Plan',
    },
  ]);

  const [achievements] = useState([
    { title: 'Hydration Hero', description: '7 days perfect water intake', earned: false, progress: 5 },
    { title: 'Protein Pro', description: 'Hit protein goals 14 days straight', earned: true, progress: 14 },
    { title: 'Calorie Crusher', description: 'Stay within 50 kcal of target for 10 days', earned: false, progress: 6 },
  ]);

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'dashboard' },
    { key: 'goals', label: 'My Goals', icon: 'flag' },
    { key: 'progress', label: 'Progress', icon: 'trending-up' },
    { key: 'insights', label: 'Insights', icon: 'analytics' },
  ];

  useEffect(() => {
    loadGoalsData();
  }, []);

  const loadGoalsData = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(loadNutritionGoals());
    } catch (error) {
      Alert.alert('Error', 'Failed to load goals data');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGoalsData();
    setRefreshing(false);
  }, [loadGoalsData]);

  const getGoalStatus = (goal) => {
    const percentage = (goal.current / goal.target) * 100;
    if (percentage >= 95) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 60) return 'fair';
    return 'needs_work';
  };

  const getStatusColor = (status) => {
    const colors = {
      excellent: COLORS.success,
      good: COLORS.primary,
      fair: COLORS.warning,
      needs_work: COLORS.error,
      on_track: COLORS.success,
      in_progress: COLORS.warning,
      needs_attention: COLORS.error,
    };
    return colors[status] || COLORS.textSecondary;
  };

  const handleGoalEdit = (goal) => {
    setSelectedGoal(goal);
    setShowGoalModal(true);
  };

  const handleGoalUpdate = (goalId, newTarget) => {
    setNutritionalGoals(prev =>
      prev.map(goal =>
        goal.id === goalId ? { ...goal, target: newTarget } : goal
      )
    );
    Alert.alert('Goal Updated! 🎯', 'Your nutrition target has been successfully updated.');
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              Nutrition Goals 🎯
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Track your nutrition targets
            </Text>
          </View>
          <TouchableOpacity style={styles.headerAction}>
            <Icon name="add-circle" size={32} color="white" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <Surface style={styles.quickStats}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weeklyStats.goalsCompleted}</Text>
              <Text style={styles.statLabel}>Goals Hit This Week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weeklyStats.improvementRate}%</Text>
              <Text style={styles.statLabel}>Improvement Rate</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Math.round((weeklyStats.goalsCompleted / weeklyStats.totalGoals) * 100)}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </Surface>
      </View>
    </LinearGradient>
  );

  const renderTabNavigation = () => (
    <Surface style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabItem,
              activeTab === tab.key && styles.activeTabItem
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? 'white' : COLORS.textSecondary}
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  const renderGoalCard = (goal) => {
    const progress = (goal.current / goal.target) * 100;
    const status = getGoalStatus(goal);
    const statusColor = getStatusColor(status);

    return (
      <Card key={goal.id} style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalIconContainer}>
            <View style={[styles.goalIcon, { backgroundColor: `${goal.color}20` }]}>
              <Icon name={goal.icon} size={24} color={goal.color} />
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(goal.priority) }]}>
              <Text style={styles.priorityText}>{goal.priority.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.goalInfo}>
            <Text style={TEXT_STYLES.h3}>{goal.title}</Text>
            <Text style={[TEXT_STYLES.caption, { color: statusColor }]}>
              {goal.current} / {goal.target} {goal.unit} • {Math.round(progress)}%
            </Text>
          </View>
          
          <IconButton
            icon="edit"
            size={20}
            onPress={() => handleGoalEdit(goal)}
          />
        </View>

        <View style={styles.progressSection}>
          <ProgressBar
            progress={Math.min(progress / 100, 1)}
            color={goal.color}
            style={styles.goalProgressBar}
          />
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: statusColor }]}>
              {status.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={styles.progressLabel}>
              {goal.target - goal.current > 0 ? `${goal.target - goal.current} ${goal.unit} to go` : 'Goal achieved!'}
            </Text>
          </View>
        </View>

        <View style={styles.goalStats}>
          <View style={styles.streakContainer}>
            <Icon name="local-fire-department" size={16} color={COLORS.accent} />
            <Text style={styles.streakText}>{goal.streak} day streak</Text>
            <Text style={styles.bestStreak}>Best: {goal.bestStreak}</Text>
          </View>
          <Text style={styles.lastUpdated}>Updated {goal.lastUpdated}</Text>
        </View>

        {/* Mini Weekly Progress Chart */}
        <View style={styles.weeklyChart}>
          <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
            Last 7 Days
          </Text>
          <View style={styles.chartBars}>
            {goal.weeklyProgress.map((percentage, index) => (
              <View key={index} style={styles.chartBarContainer}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: (percentage / 100) * 40,
                      backgroundColor: percentage >= 80 ? goal.color : COLORS.textSecondary,
                    }
                  ]}
                />
                <Text style={styles.chartLabel}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Card>
    );
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: COLORS.error,
      medium: COLORS.warning,
      low: COLORS.success,
    };
    return colors[priority] || COLORS.textSecondary;
  };

  const renderRecommendations = () => (
    <Surface style={styles.recommendationsContainer}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        AI Recommendations 🤖
      </Text>
      {recommendations.map((rec) => (
        <View key={rec.id} style={styles.recommendationCard}>
          <View style={[styles.recIcon, { backgroundColor: `${rec.color}20` }]}>
            <Icon name={rec.icon} size={20} color={rec.color} />
          </View>
          <View style={styles.recContent}>
            <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
              {rec.title}
            </Text>
            <Text style={[TEXT_STYLES.caption, { marginVertical: SPACING.xs }]}>
              {rec.description}
            </Text>
            <Button
              mode="outlined"
              compact
              onPress={() => Alert.alert('Recommendation', rec.description)}
              style={styles.recButton}
            >
              {rec.actionText}
            </Button>
          </View>
        </View>
      ))}
    </Surface>
  );

  const renderAchievements = () => (
    <Surface style={styles.achievementsContainer}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        Goal Achievements 🏆
      </Text>
      {achievements.map((achievement, index) => (
        <View key={index} style={[
          styles.achievementItem,
          achievement.earned && styles.achievementEarned
        ]}>
          <View style={styles.achievementIcon}>
            <Icon
              name={achievement.earned ? 'jump-rope' : 'radio-button-unchecked'}
              size={24}
              color={achievement.earned ? COLORS.warning : COLORS.textSecondary}
            />
          </View>
          <View style={styles.achievementContent}>
            <Text style={[
              TEXT_STYLES.body,
              { fontWeight: '600' },
              achievement.earned && { color: COLORS.warning }
            ]}>
              {achievement.title}
            </Text>
            <Text style={TEXT_STYLES.caption}>
              {achievement.description}
            </Text>
            {!achievement.earned && (
              <View style={styles.achievementProgress}>
                <ProgressBar
                  progress={achievement.progress / (achievement.title.includes('14') ? 14 : achievement.title.includes('10') ? 10 : 7)}
                  color={COLORS.primary}
                  style={styles.achievementProgressBar}
                />
                <Text style={styles.achievementProgressText}>
                  {achievement.progress} / {achievement.title.includes('14') ? 14 : achievement.title.includes('10') ? 10 : 7}
                </Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </Surface>
  );

  const renderOverview = () => (
    <View>
      {renderRecommendations()}
      {renderAchievements()}
      
      <Surface style={styles.overviewStats}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          Weekly Averages 📊
        </Text>
        <View style={styles.avgStatsGrid}>
          <View style={styles.avgStatItem}>
            <Text style={styles.avgStatNumber}>{weeklyStats.avgCalories}</Text>
            <Text style={styles.avgStatLabel}>Avg Calories</Text>
          </View>
          <View style={styles.avgStatItem}>
            <Text style={styles.avgStatNumber}>{weeklyStats.avgProtein}g</Text>
            <Text style={styles.avgStatLabel}>Avg Protein</Text>
          </View>
          <View style={styles.avgStatItem}>
            <Text style={styles.avgStatNumber}>{weeklyStats.avgHydration}L</Text>
            <Text style={styles.avgStatLabel}>Avg Water</Text>
          </View>
        </View>
      </Surface>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'goals':
        return (
          <View>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              Active Goals ({nutritionalGoals.length}) 🎯
            </Text>
            {nutritionalGoals.map(renderGoalCard)}
          </View>
        );
      case 'progress':
        return (
          <Surface style={styles.comingSoonContainer}>
            <Icon name="trending-up" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { marginVertical: SPACING.md }]}>
              Detailed Progress Analytics Coming Soon! 📈
            </Text>
            <Text style={TEXT_STYLES.caption}>
              Advanced charts and trend analysis will be available here.
            </Text>
          </Surface>
        );
      case 'insights':
        return (
          <Surface style={styles.comingSoonContainer}>
            <Icon name="analytics" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { marginVertical: SPACING.md }]}>
              AI Insights Coming Soon! 🔬
            </Text>
            <Text style={TEXT_STYLES.caption}>
              Personalized nutrition insights and recommendations will be available here.
            </Text>
          </Surface>
        );
      default:
        return null;
    }
  };

  const renderGoalModal = () => (
    <Portal>
      <Modal
        visible={showGoalModal}
        onDismiss={() => setShowGoalModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedGoal && (
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={TEXT_STYLES.h3}>Edit Goal: {selectedGoal.title}</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowGoalModal(false)}
              />
            </View>
            
            <View style={styles.modalBody}>
              <Text style={TEXT_STYLES.body}>
                Current Target: {selectedGoal.target} {selectedGoal.unit}
              </Text>
              
              <View style={styles.sliderContainer}>
                <Text style={TEXT_STYLES.caption}>Adjust Target:</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={selectedGoal.target * 0.5}
                  maximumValue={selectedGoal.target * 1.5}
                  value={selectedGoal.target}
                  onValueChange={(value) => {
                    setSelectedGoal(prev => ({ ...prev, target: Math.round(value) }));
                  }}
                  minimumTrackTintColor={selectedGoal.color}
                  maximumTrackTintColor={COLORS.textSecondary}
                  thumbStyle={{ backgroundColor: selectedGoal.color }}
                />
                <Text style={[TEXT_STYLES.h3, { color: selectedGoal.color, textAlign: 'center' }]}>
                  {Math.round(selectedGoal.target)} {selectedGoal.unit}
                </Text>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowGoalModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  handleGoalUpdate(selectedGoal.id, selectedGoal.target);
                  setShowGoalModal(false);
                }}
                style={styles.modalButton}
                buttonColor={selectedGoal.color}
              >
                Update Goal
              </Button>
            </View>
          </Surface>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {renderHeader()}
      
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderTabNavigation()}
        
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('New Goal', 'Set a new nutrition goal to track your progress!')}
        label="New Goal"
      />

      {renderGoalModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    marginTop: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerAction: {
    padding: SPACING.xs,
  },
  quickStats: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: SPACING.md,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.textSecondary,
    opacity: 0.3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  tabContainer: {
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 2,
    paddingVertical: SPACING.sm,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: 20,
  },
  activeTabItem: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    marginLeft: SPACING.xs,
    ...TEXT_STYLES.caption,
  },
  activeTabLabel: {
    color: 'white',
  },
  contentContainer: {
    marginBottom: SPACING.xl,
  },
  goalCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 2,
    padding: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  goalIconContainer: {
    marginRight: SPACING.md,
    position: 'relative',
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBadge: {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
    borderRadius: 8,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  priorityText: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  goalInfo: {
    flex: 1,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  goalProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    ...TEXT_STYLES.small,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  bestStreak: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
  },
  lastUpdated: {
    ...TEXT_STYLES.small,
  },
  weeklyChart: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 60,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 20,
    borderRadius: 10,
    marginBottom: SPACING.xs,
  },
  chartLabel: {
    ...TEXT_STYLES.small,
  },
  recommendationsContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  recommendationCard: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  recIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  recContent: {
    flex: 1,
  },
  recButton: {
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  achievementsContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  achievementEarned: {
    backgroundColor: `${COLORS.warning}15`,
    borderWidth: 1,
    borderColor: `${COLORS.warning}30`,
  },
  achievementIcon: {
    marginRight: SPACING.md,
  },
  achievementContent: {
    flex: 1,
  },
  achievementProgress: {
    marginTop: SPACING.xs,
  },
  achievementProgressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  achievementProgressText: {
    ...TEXT_STYLES.small,
    textAlign: 'right',
  },
  overviewStats: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  avgStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  avgStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  avgStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  avgStatLabel: {
    ...TEXT_STYLES.small,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  comingSoonContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: 16,
    elevation: 2,
    marginBottom: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width - SPACING.xl,
    borderRadius: 20,
    padding: 0,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  sliderContainer: {
    marginTop: SPACING.lg,
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default NutritionalGoals;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Modal,
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
  Searchbar,
  Portal,
  TextInput,
  Switch,
  Slider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports (assumed to be available)
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const NutritionalGoals = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const nutritionGoals = useSelector(state => state.nutrition.goals);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGoalType, setSelectedGoalType] = useState('daily');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalStreak, setGoalStreak] = useState(7);
  const [weeklyProgress, setWeeklyProgress] = useState(85);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const [currentGoals, setCurrentGoals] = useState({
    calories: { current: 2150, target: 2400, unit: 'kcal', priority: 'high' },
    protein: { current: 125, target: 150, unit: 'g', priority: 'high' },
    carbs: { current: 280, target: 320, unit: 'g', priority: 'medium' },
    fat: { current: 65, target: 80, unit: 'g', priority: 'medium' },
    fiber: { current: 28, target: 35, unit: 'g', priority: 'low' },
    water: { current: 2.8, target: 3.5, unit: 'L', priority: 'high' },
    sodium: { current: 1800, target: 2300, unit: 'mg', priority: 'low' },
    sugar: { current: 45, target: 50, unit: 'g', priority: 'medium' },
  });

  const [weeklyGoals, setWeeklyGoals] = useState([
    {
      id: '1',
      title: 'Meal Prep Sunday',
      description: 'Prepare 5 healthy meals',
      progress: 5,
      target: 5,
      completed: true,
      points: 100,
      icon: 'restaurant',
      category: 'preparation',
    },
    {
      id: '2',
      title: 'Hydration Hero',
      description: 'Drink 3.5L water daily for 7 days',
      progress: 6,
      target: 7,
      completed: false,
      points: 150,
      icon: 'water-drop',
      category: 'hydration',
    },
    {
      id: '3',
      title: 'Protein Power',
      description: 'Hit protein target 6/7 days',
      progress: 4,
      target: 6,
      completed: false,
      points: 120,
      icon: 'fitness-center',
      category: 'macros',
    },
    {
      id: '4',
      title: 'Veggie Victory',
      description: 'Eat 5+ servings vegetables daily',
      progress: 3,
      target: 7,
      completed: false,
      points: 80,
      icon: 'eco',
      category: 'micronutrients',
    },
  ]);

  const [monthlyGoals, setMonthlyGoals] = useState([
    {
      id: '1',
      title: 'Body Composition',
      description: 'Lose 2kg while maintaining muscle',
      progress: 1.2,
      target: 2.0,
      unit: 'kg',
      completed: false,
      points: 500,
      icon: 'monitor-weight',
      category: 'body-comp',
      deadline: '2025-09-22',
    },
    {
      id: '2',
      title: 'Performance Nutrition',
      description: 'Perfect pre/post workout nutrition',
      progress: 18,
      target: 30,
      unit: 'sessions',
      completed: false,
      points: 300,
      icon: 'sports',
      category: 'performance',
      deadline: '2025-09-22',
    },
  ]);

  const goalCategories = [
    { key: 'daily', label: 'Daily', icon: 'today', count: Object.keys(currentGoals).length },
    { key: 'weekly', label: 'Weekly', icon: 'view-week', count: weeklyGoals.length },
    { key: 'monthly', label: 'Monthly', icon: 'calendar-month', count: monthlyGoals.length },
    { key: 'custom', label: 'Custom', icon: 'tune', count: 2 },
  ];

  const nutritionTips = [
    { tip: 'Consistency beats perfection! 💪', type: 'motivation' },
    { tip: 'Track weekly averages, not daily perfection 📊', type: 'strategy' },
    { tip: 'Adjust goals based on training intensity ⚡', type: 'optimization' },
  ];

  const achievements = [
    { id: '1', title: 'Goal Setter', description: 'Set your first nutrition goal', icon: 'flag', earned: true },
    { id: '2', title: 'Streak Master', description: '7-day goal achievement streak', icon: 'local-fire-department', earned: true },
    { id: '3', title: 'Macro Manager', description: 'Hit all macro targets for 5 days', icon: 'pie-chart', earned: false },
    { id: '4', title: 'Hydration Expert', description: 'Meet hydration goals for 14 days', icon: 'water-drop', earned: false },
  ];

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(COLORS.primary, true);
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleGoalPress = (goalKey, goalData) => {
    Alert.alert(
      `${goalKey.charAt(0).toUpperCase() + goalKey.slice(1)} Goal`,
      `Current: ${goalData.current}${goalData.unit}\nTarget: ${goalData.target}${goalData.unit}\nProgress: ${Math.round((goalData.current / goalData.target) * 100)}%\nPriority: ${goalData.priority}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Update Target', onPress: () => editGoal(goalKey, goalData) },
        { text: 'Log Progress', onPress: () => logProgress(goalKey) },
      ]
    );
  };

  const editGoal = (goalKey, goalData) => {
    setEditingGoal({ key: goalKey, ...goalData });
    setShowGoalModal(true);
  };

  const logProgress = (goalKey) => {
    Alert.alert('Log Progress 📝', `Update your ${goalKey} intake for today`);
  };

  const addCustomGoal = () => {
    Alert.alert('Create Custom Goal 🎯', 'Set up a personalized nutrition goal');
  };

  const generateGoalSuggestions = () => {
    Alert.alert('AI Goal Suggestions 🤖', 'Analyzing your data to suggest optimal nutrition goals...');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.primary;
    }
  };

  const getProgressColor = (progress, target) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 100) return COLORS.success;
    if (percentage >= 80) return COLORS.primary;
    if (percentage >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const renderDailyGoal = (goalKey) => {
    const goal = currentGoals[goalKey];
    const progress = goal.current / goal.target;
    const percentage = Math.round(progress * 100);
    
    return (
      <Surface key={goalKey} style={styles.dailyGoalCard} elevation={1}>
        <TouchableOpacity onPress={() => handleGoalPress(goalKey, goal)}>
          <View style={styles.goalHeader}>
            <View style={styles.goalTitleContainer}>
              <Text style={[TEXT_STYLES.subtitle, { color: COLORS.text }]}>
                {goalKey.charAt(0).toUpperCase() + goalKey.slice(1)}
              </Text>
              <Chip
                style={[styles.priorityChip, { backgroundColor: getPriorityColor(goal.priority) }]}
                textStyle={{ color: 'white', fontSize: 10 }}
              >
                {goal.priority}
              </Chip>
            </View>
            <Text style={styles.goalValues}>
              {goal.current}/{goal.target}{goal.unit}
            </Text>
          </View>
          
          <ProgressBar
            progress={Math.min(progress, 1)}
            color={getProgressColor(goal.current, goal.target)}
            style={styles.goalProgressBar}
          />
          
          <View style={styles.goalFooter}>
            <Text style={[styles.progressText, { color: getProgressColor(goal.current, goal.target) }]}>
              {percentage}% complete
            </Text>
            <TouchableOpacity onPress={() => logProgress(goalKey)}>
              <Icon name="add-circle" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Surface>
    );
  };

  const renderWeeklyGoal = ({ item }) => (
    <Surface style={styles.weeklyGoalCard} elevation={2}>
      <TouchableOpacity onPress={() => handleWeeklyGoalPress(item)}>
        <View style={styles.goalCardHeader}>
          <View style={[styles.goalIcon, { backgroundColor: item.completed ? COLORS.success : COLORS.primary }]}>
            <Icon name={item.icon} size={24} color="white" />
          </View>
          <View style={styles.goalCardInfo}>
            <Text style={[TEXT_STYLES.subtitle, { color: COLORS.text }]}>
              {item.title}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {item.description}
            </Text>
          </View>
          <View style={styles.goalPoints}>
            <Text style={styles.pointsText}>+{item.points}</Text>
          </View>
        </View>
        
        <View style={styles.goalProgress}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressNumbers}>
              {item.progress}/{item.target}
            </Text>
            <ProgressBar
              progress={item.progress / item.target}
              color={item.completed ? COLORS.success : COLORS.primary}
              style={styles.weeklyProgressBar}
            />
          </View>
          
          {item.completed && (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={16} color={COLORS.success} />
              <Text style={styles.completedText}>Completed! ✨</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Surface>
  );

  const renderMonthlyGoal = ({ item }) => (
    <Surface style={styles.monthlyGoalCard} elevation={2}>
      <TouchableOpacity onPress={() => handleMonthlyGoalPress(item)}>
        <View style={styles.monthlyGoalHeader}>
          <View style={styles.goalCardHeader}>
            <View style={[styles.goalIcon, { backgroundColor: COLORS.secondary }]}>
              <Icon name={item.icon} size={24} color="white" />
            </View>
            <View style={styles.goalCardInfo}>
              <Text style={[TEXT_STYLES.subtitle, { color: COLORS.text }]}>
                {item.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {item.description}
              </Text>
            </View>
            <View style={styles.goalPoints}>
              <Text style={styles.pointsText}>+{item.points}</Text>
            </View>
          </View>
          
          <View style={styles.monthlyGoalProgress}>
            <Text style={styles.progressNumbers}>
              {item.progress}/{item.target} {item.unit}
            </Text>
            <ProgressBar
              progress={item.progress / item.target}
              color={COLORS.secondary}
              style={styles.monthlyProgressBar}
            />
            <Text style={styles.deadlineText}>
              Deadline: {new Date(item.deadline).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Surface>
  );

  const handleWeeklyGoalPress = (goal) => {
    Alert.alert(
      goal.title,
      `${goal.description}\n\nProgress: ${goal.progress}/${goal.target}\nPoints: +${goal.points}\nCategory: ${goal.category}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Update Progress', onPress: () => updateWeeklyProgress(goal.id) },
        { text: 'Edit Goal', onPress: () => editWeeklyGoal(goal.id) },
      ]
    );
  };

  const handleMonthlyGoalPress = (goal) => {
    Alert.alert(
      goal.title,
      `${goal.description}\n\nProgress: ${goal.progress}/${goal.target} ${goal.unit}\nPoints: +${goal.points}\nDeadline: ${new Date(goal.deadline).toLocaleDateString()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Update Progress', onPress: () => updateMonthlyProgress(goal.id) },
        { text: 'Edit Goal', onPress: () => editMonthlyGoal(goal.id) },
      ]
    );
  };

  const updateWeeklyProgress = (goalId) => {
    Alert.alert('Progress Updated! 📈', 'Weekly goal progress has been recorded');
  };

  const updateMonthlyProgress = (goalId) => {
    Alert.alert('Progress Updated! 🎯', 'Monthly goal progress has been recorded');
  };

  const editWeeklyGoal = (goalId) => {
    Alert.alert('Feature Coming Soon! 🚧', 'Goal editing will be available in the next update');
  };

  const editMonthlyGoal = (goalId) => {
    Alert.alert('Feature Coming Soon! 🚧', 'Goal editing will be available in the next update');
  };

  const renderContent = () => {
    switch (selectedGoalType) {
      case 'daily':
        return (
          <View style={styles.dailyGoalsContainer}>
            {Object.keys(currentGoals).map(renderDailyGoal)}
          </View>
        );
      case 'weekly':
        return (
          <FlatList
            data={weeklyGoals}
            renderItem={renderWeeklyGoal}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          />
        );
      case 'monthly':
        return (
          <FlatList
            data={monthlyGoals}
            renderItem={renderMonthlyGoal}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          />
        );
      case 'custom':
        return (
          <View style={styles.customGoalsContainer}>
            <Surface style={styles.emptyStateCard} elevation={1}>
              <Icon name="tune" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateTitle}>Custom Goals</Text>
              <Text style={styles.emptyStateDescription}>
                Create personalized nutrition goals tailored to your specific needs and preferences.
              </Text>
              <Button
                mode="contained"
                onPress={addCustomGoal}
                style={styles.addCustomButton}
              >
                Create Custom Goal
              </Button>
            </Surface>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Nutrition Goals 🎯</Text>
              <Text style={styles.headerSubtitle}>
                {goalStreak} day streak • {weeklyProgress}% weekly progress 🔥
              </Text>
            </View>
            <TouchableOpacity onPress={generateGoalSuggestions}>
              <Surface style={styles.aiButton} elevation={3}>
                <Icon name="psychology" size={24} color={COLORS.primary} />
              </Surface>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <Animated.ScrollView
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
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Overall Progress Overview */}
        <Surface style={styles.overviewCard} elevation={2}>
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
            Today's Overview 📊
          </Text>
          
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatNumber}>{goalStreak}</Text>
              <Text style={styles.overviewStatLabel}>Day Streak</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatNumber}>{weeklyProgress}%</Text>
              <Text style={styles.overviewStatLabel}>Weekly</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatNumber}>6/8</Text>
              <Text style={styles.overviewStatLabel}>Goals Met</Text>
            </View>
          </View>
          
          <ProgressBar
            progress={0.75}
            color={COLORS.success}
            style={styles.overviewProgressBar}
          />
          <Text style={styles.overviewProgressText}>
            75% of daily goals achieved
          </Text>
        </Surface>

        {/* Goal Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
            Goal Categories 📁
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {goalCategories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryCard,
                  selectedGoalType === category.key && styles.activeCategoryCard
                ]}
                onPress={() => setSelectedGoalType(category.key)}
              >
                <Icon 
                  name={category.icon} 
                  size={24} 
                  color={selectedGoalType === category.key ? 'white' : COLORS.primary}
                />
                <Text style={[
                  styles.categoryLabel,
                  selectedGoalType === category.key && styles.activeCategoryLabel
                ]}>
                  {category.label}
                </Text>
                <Text style={[
                  styles.categoryCount,
                  selectedGoalType === category.key && styles.activeCategoryCount
                ]}>
                  {category.count} goals
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Tips */}
        <Surface style={styles.tipsCard} elevation={1}>
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
            Goal Tips 💡
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {nutritionTips.map((tip, index) => (
              <Chip
                key={index}
                mode="outlined"
                style={styles.tipChip}
                textStyle={{ fontSize: 12 }}
              >
                {tip.tip}
              </Chip>
            ))}
          </ScrollView>
        </Surface>

        {/* Goals Content */}
        <View style={styles.goalsSection}>
          <View style={styles.goalsSectionHeader}>
            <Text style={[TEXT_STYLES.subtitle, { flex: 1 }]}>
              {goalCategories.find(c => c.key === selectedGoalType)?.label} Goals
            </Text>
            <IconButton
              icon="add"
              size={24}
              iconColor={COLORS.primary}
              onPress={addCustomGoal}
            />
          </View>
          
          {renderContent()}
        </View>

        {/* Achievements */}
        <Surface style={styles.achievementsCard} elevation={1}>
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
            Goal Achievements 🏆
          </Text>
          <View style={styles.achievementsContainer}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <Avatar.Icon
                  size={40}
                  icon={achievement.icon}
                  style={[
                    styles.achievementIcon,
                    { backgroundColor: achievement.earned ? COLORS.success : COLORS.disabled }
                  ]}
                />
                <Text style={[
                  styles.achievementTitle,
                  { color: achievement.earned ? COLORS.text : COLORS.textSecondary }
                ]}>
                  {achievement.title}
                </Text>
              </View>
            ))}
          </View>
        </Surface>
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="add"
        label="New Goal"
        onPress={addCustomGoal}
        color="white"
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'column',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  aiButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    marginTop: -20,
  },
  overviewCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    backgroundColor: 'white',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  overviewProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  overviewProgressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  categoriesContainer: {
    marginBottom: SPACING.lg,
  },
  categoryCard: {
    padding: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeCategoryCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryLabel: {
    fontSize: 12,
    color: COLORS.text,
    marginVertical: 4,
    fontWeight: '600',
  },
  activeCategoryLabel: {
    color: 'white',
  },
  categoryCount: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  activeCategoryCount: {
    color: 'rgba(255,255,255,0.9)',
  },
  tipsCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    backgroundColor: 'white',
  },
  tipChip: {
    marginRight: SPACING.sm,
  },
  goalsSection: {
    marginBottom: SPACING.lg,
  },
  goalsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dailyGoalsContainer: {
    gap: SPACING.sm,
  },
  dailyGoalCard: {
    padding: SPACING.lg,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priorityChip: {
    height: 20,
    marginLeft: SPACING.sm,
  },
  goalValues: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  goalProgressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.sm,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  weeklyGoalCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  goalCardInfo: {
    flex: 1,
  },
  goalPoints: {
    alignItems: 'flex-end',
  },
  pointsText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  goalProgress: {
    gap: SPACING.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressNumbers: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 50,
  },
  weeklyProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  completedText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 4,
    fontWeight: '600',
  },
  monthlyGoalCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  monthlyGoalHeader: {
    gap: SPACING.md,
  },
  monthlyGoalProgress: {
    gap: SPACING.xs,
  },
  monthlyProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  deadlineText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  customGoalsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateCard: {
    padding: SPACING.xl,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: SPACING.sm,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  addCustomButton: {
    paddingHorizontal: SPACING.lg,
  },
  achievementsCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    backgroundColor: 'white',
  },
  achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievementItem: {
    alignItems: 'center',
    flex: 1,
  },
  achievementIcon: {
    marginBottom: SPACING.sm,
  },
  achievementTitle: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default NutritionalGoals;
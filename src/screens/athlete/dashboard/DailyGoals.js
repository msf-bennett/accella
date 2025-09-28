import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  FlatList,
  Vibration,
  Alert,
  StyleSheet,
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
  Portal,
  Modal,
  Checkbox,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f6fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
  lightBlue: '#e3f2fd',
  lightGreen: '#e8f5e8',
  lightOrange: '#fff3e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  heading2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  heading3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const DailyGoals = ({ navigation }) => {
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [completionAnimation] = useState(new Animated.Value(0));
  
  // Redux State
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const dailyGoals = useSelector(state => state.goals.dailyGoals);
  const streakCount = useSelector(state => state.gamification.streakCount);
  
  // Animation Refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;

  // Mock Data (would come from Redux in real implementation)
  const mockGoals = [
    {
      id: 1,
      title: 'Complete Morning Cardio',
      description: '30 minutes of running or cycling',
      category: 'fitness',
      priority: 'high',
      completed: false,
      points: 50,
      targetValue: 30,
      currentValue: 0,
      unit: 'minutes',
      icon: 'directions-run',
      color: COLORS.error,
      streak: 5,
    },
    {
      id: 2,
      title: 'Practice Ball Control',
      description: '100 touches with both feet',
      category: 'skill',
      priority: 'high',
      completed: true,
      points: 75,
      targetValue: 100,
      currentValue: 100,
      unit: 'touches',
      icon: 'sports-soccer',
      color: COLORS.success,
      streak: 12,
    },
    {
      id: 3,
      title: 'Hydration Goal',
      description: 'Drink 8 glasses of water',
      category: 'health',
      priority: 'medium',
      completed: false,
      points: 25,
      targetValue: 8,
      currentValue: 5,
      unit: 'glasses',
      icon: 'local-drink',
      color: COLORS.primary,
      streak: 3,
    },
    {
      id: 4,
      title: 'Meditation & Recovery',
      description: '10 minutes mindfulness',
      category: 'recovery',
      priority: 'medium',
      completed: false,
      points: 30,
      targetValue: 10,
      currentValue: 0,
      unit: 'minutes',
      icon: 'self-improvement',
      color: COLORS.secondary,
      streak: 0,
    },
    {
      id: 5,
      title: 'Nutrition Log',
      description: 'Track all meals and snacks',
      category: 'nutrition',
      priority: 'low',
      completed: true,
      points: 40,
      targetValue: 5,
      currentValue: 5,
      unit: 'meals',
      icon: 'restaurant',
      color: COLORS.warning,
      streak: 7,
    },
  ];

  const categories = [
    { id: 'all', label: 'All Goals', icon: 'list', color: COLORS.text },
    { id: 'fitness', label: 'Fitness', icon: 'fitness-center', color: COLORS.error },
    { id: 'skill', label: 'Skills', icon: 'sports-soccer', color: COLORS.success },
    { id: 'health', label: 'Health', icon: 'favorite', color: COLORS.primary },
    { id: 'recovery', label: 'Recovery', icon: 'spa', color: COLORS.secondary },
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant', color: COLORS.warning },
  ];

  // Effects
  useEffect(() => {
    // Animate progress bars on mount
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, []);

  // Callbacks
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch refresh actions
      Vibration.vibrate(50);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh goals');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleGoalToggle = useCallback((goalId) => {
    Vibration.vibrate(75);
    const goal = mockGoals.find(g => g.id === goalId);
    
    // Animate completion
    Animated.sequence([
      Animated.timing(completionAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(completionAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (!goal.completed) {
      // Show celebration for goal completion
      Alert.alert(
        '🎉 Goal Completed!',
        `Great job! You earned ${goal.points} points for completing "${goal.title}"`,
        [{ text: 'Awesome!', style: 'default' }]
      );
    }
    
    // Dispatch toggle action
    // dispatch(toggleDailyGoal(goalId));
  }, []);

  const handleUpdateProgress = (goalId, newValue) => {
    Vibration.vibrate(50);
    // dispatch(updateGoalProgress({ goalId, value: newValue }));
  };

  const getTotalProgress = () => {
    const completedGoals = mockGoals.filter(goal => goal.completed).length;
    return completedGoals / mockGoals.length;
  };

  const getTotalPoints = () => {
    return mockGoals.filter(goal => goal.completed).reduce((sum, goal) => sum + goal.points, 0);
  };

  const getFilteredGoals = () => {
    let filtered = mockGoals;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(goal => goal.category === filterCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(goal =>
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by priority and completion status
    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed - b.completed;
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  // Render Functions
  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.headerGradient}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Daily Goals 🎯</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowAddGoalModal(true)}
          style={styles.addButton}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderProgressOverview = () => {
    const totalProgress = getTotalProgress();
    const totalPoints = getTotalPoints();
    const completedCount = mockGoals.filter(g => g.completed).length;

    return (
      <Card style={styles.progressCard} elevation={4}>
        <Card.Content>
          <View style={styles.progressHeader}>
            <Text style={[TEXT_STYLES.heading3, { marginBottom: SPACING.sm }]}>
              Today's Progress
            </Text>
            <Chip 
              icon="jump-rope" 
              style={[styles.pointsChip, { backgroundColor: COLORS.warning }]}
              textStyle={{ color: 'white', fontWeight: 'bold' }}
            >
              {totalPoints} pts
            </Chip>
          </View>

          <View style={styles.progressStats}>
            <View style={styles.progressItem}>
              <Text style={TEXT_STYLES.caption}>Completed</Text>
              <Text style={[TEXT_STYLES.heading2, { color: COLORS.success }]}>
                {completedCount}/{mockGoals.length}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={TEXT_STYLES.caption}>Streak</Text>
              <Text style={[TEXT_STYLES.heading2, { color: COLORS.primary }]}>
                {streakCount || 5} 🔥
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={TEXT_STYLES.caption}>Progress</Text>
              <Text style={[TEXT_STYLES.heading2, { color: COLORS.accent }]}>
                {Math.round(totalProgress * 100)}%
              </Text>
            </View>
          </View>

          <ProgressBar
            progress={totalProgress}
            color={COLORS.success}
            style={styles.mainProgressBar}
          />
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
            Keep going! You're doing great! 💪
          </Text>
        </Card.Content>
      </Card>
    );
  };

  const renderCategoryFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm, fontWeight: '600' }]}>
        Categories
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              filterCategory === category.id && styles.categoryChipActive,
              { borderColor: category.color }
            ]}
            onPress={() => setFilterCategory(category.id)}
          >
            <Icon 
              name={category.icon} 
              size={18} 
              color={filterCategory === category.id ? 'white' : category.color}
              style={{ marginRight: SPACING.xs }}
            />
            <Text
              style={[
                styles.categoryText,
                filterCategory === category.id && styles.categoryTextActive
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderGoalItem = ({ item: goal }) => {
    const progress = goal.targetValue > 0 ? goal.currentValue / goal.targetValue : 0;
    const isCompleted = goal.completed;

    return (
      <Animated.View
        style={[
          styles.goalCard,
          {
            opacity: completionAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.8],
            }),
            transform: [{
              scale: completionAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.95],
              })
            }]
          }
        ]}
      >
        <Card 
          style={[
            styles.goalCardInner,
            isCompleted && styles.completedGoalCard
          ]} 
          elevation={2}
        >
          <Card.Content>
            <View style={styles.goalHeader}>
              <View style={styles.goalIconContainer}>
                <Surface 
                  style={[
                    styles.goalIcon, 
                    { backgroundColor: goal.color + '20' }
                  ]}
                  elevation={1}
                >
                  <Icon name={goal.icon} size={24} color={goal.color} />
                </Surface>
                <View style={styles.goalInfo}>
                  <View style={styles.goalTitleRow}>
                    <Text 
                      style={[
                        TEXT_STYLES.body,
                        { fontWeight: '600', flex: 1 },
                        isCompleted && { textDecorationLine: 'line-through', opacity: 0.7 }
                      ]}
                      numberOfLines={1}
                    >
                      {goal.title}
                    </Text>
                    <View style={styles.goalMeta}>
                      <Chip 
                        style={[
                          styles.priorityChip,
                          { backgroundColor: getPriorityColor(goal.priority) }
                        ]}
                        textStyle={styles.priorityText}
                        compact
                      >
                        {goal.priority}
                      </Chip>
                      <Text style={[TEXT_STYLES.small, { color: COLORS.success, fontWeight: 'bold' }]}>
                        +{goal.points}
                      </Text>
                    </View>
                  </View>
                  <Text style={[TEXT_STYLES.caption, { marginTop: 2 }]} numberOfLines={1}>
                    {goal.description}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleGoalToggle(goal.id)}
              >
                <Surface 
                  style={[
                    styles.customCheckbox,
                    isCompleted && { backgroundColor: COLORS.success }
                  ]}
                  elevation={isCompleted ? 3 : 1}
                >
                  {isCompleted && <Icon name="check" size={20} color="white" />}
                </Surface>
              </TouchableOpacity>
            </View>

            {!isCompleted && goal.targetValue > 0 && (
              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text style={TEXT_STYLES.caption}>
                    {goal.currentValue}/{goal.targetValue} {goal.unit}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={progress}
                  color={goal.color}
                  style={styles.goalProgressBar}
                />
                <View style={styles.progressActions}>
                  <TouchableOpacity
                    style={styles.progressButton}
                    onPress={() => handleUpdateProgress(goal.id, Math.max(0, goal.currentValue - 1))}
                    disabled={goal.currentValue <= 0}
                  >
                    <Icon name="remove" size={16} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.progressButton}
                    onPress={() => handleUpdateProgress(goal.id, Math.min(goal.targetValue, goal.currentValue + 1))}
                    disabled={goal.currentValue >= goal.targetValue}
                  >
                    <Icon name="add" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {goal.streak > 0 && (
              <View style={styles.streakBadge}>
                <Icon name="local-fire-department" size={16} color={COLORS.warning} />
                <Text style={[TEXT_STYLES.small, { color: COLORS.warning, fontWeight: 'bold' }]}>
                  {goal.streak} day streak
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error + '20';
      case 'medium': return COLORS.warning + '20';
      case 'low': return COLORS.success + '20';
      default: return COLORS.textSecondary + '20';
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="jump-rope" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.heading3, { marginTop: SPACING.md, textAlign: 'center' }]}>
        No goals found
      </Text>
      <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
        Create your first daily goal to start tracking your progress!
      </Text>
      <Button
        mode="contained"
        onPress={() => setShowAddGoalModal(true)}
        style={styles.emptyStateButton}
        contentStyle={{ paddingVertical: SPACING.sm }}
      >
        Add First Goal
      </Button>
    </View>
  );

  const filteredGoals = getFilteredGoals();

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.scrollContainer}
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
        <View style={styles.content}>
          {renderProgressOverview()}
          
          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search goals..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              iconColor={COLORS.primary}
            />
          </View>

          {renderCategoryFilter()}

          <View style={styles.goalsSection}>
            <Text style={[TEXT_STYLES.heading3, { marginBottom: SPACING.md }]}>
              Your Goals ({filteredGoals.length})
            </Text>
            
            {filteredGoals.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={filteredGoals}
                renderItem={renderGoalItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
              />
            )}
          </View>
        </View>
      </Animated.ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert('Feature Coming Soon', 'Goal creation will be available soon! 🎯');
        }}
        color="white"
      />

      {/* Add Goal Modal would go here */}
      <Portal>
        <Modal
          visible={showAddGoalModal}
          onDismiss={() => setShowAddGoalModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
            <View style={styles.modalContent}>
              <Text style={TEXT_STYLES.heading2}>Add New Goal</Text>
              <Text style={TEXT_STYLES.body}>Feature coming soon! 🚧</Text>
              <Button
                mode="contained"
                onPress={() => setShowAddGoalModal(false)}
                style={{ marginTop: SPACING.lg }}
              >
                Got it!
              </Button>
            </View>
          </BlurView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  addButton: {
    padding: SPACING.sm,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  progressCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsChip: {
    borderRadius: 20,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.md,
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  mainProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.background,
  },
  searchSection: {
    marginBottom: SPACING.lg,
  },
  searchbar: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 2,
  },
  filterContainer: {
    marginBottom: SPACING.lg,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  goalsSection: {
    marginBottom: 100, // Space for FAB
  },
  goalCard: {
    marginBottom: SPACING.md,
  },
  goalCardInner: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  completedGoalCard: {
    opacity: 0.7,
    backgroundColor: COLORS.lightGreen,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  goalIconContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  priorityChip: {
    height: 24,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  checkboxContainer: {
    marginLeft: SPACING.sm,
  },
  customCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  progressSection: {
    marginTop: SPACING.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  goalProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.background,
  },
  progressActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.sm,
  },
  progressButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.lightOrange,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateButton: {
    marginTop: SPACING.lg,
    borderRadius: 25,
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
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    elevation: 8,
  },
});

export default DailyGoals;
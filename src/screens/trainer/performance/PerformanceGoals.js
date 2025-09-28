import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Alert,
  Dimensions,
  TouchableOpacity,
  Animated,
  TextInput,
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
  Badge,
  Divider,
  Switch,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design System Imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#e91e63',
  info: '#2196F3',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 14, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PerformanceGoals = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, goals, achievements, isLoading } = useSelector(state => state.trainer);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // New goal form states
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('business');
  const [newGoalReminders, setNewGoalReminders] = useState(true);

  const animatedValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.spring(animatedValue, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    loadGoalsData();
  }, [selectedCategory]);

  const loadGoalsData = useCallback(async () => {
    try {
      // Simulate API call - replace with actual data loading
      console.log('Loading goals data...');
      // dispatch(fetchGoalsData({ category: selectedCategory }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load goals data');
    }
  }, [selectedCategory, dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGoalsData();
    setRefreshing(false);
  }, [loadGoalsData]);

  // Mock data for demonstration
  const mockGoalsData = {
    currentGoals: [
      {
        id: 1,
        title: 'Increase Client Base',
        description: 'Acquire 20 new clients this quarter',
        category: 'business',
        target: 20,
        current: 14,
        deadline: '2025-12-31',
        priority: 'high',
        status: 'active',
        icon: 'people',
        color: COLORS.primary,
      },
      {
        id: 2,
        title: 'Monthly Revenue Goal',
        description: 'Reach $5,000 monthly revenue',
        category: 'business',
        target: 5000,
        current: 3800,
        deadline: '2025-09-30',
        priority: 'high',
        status: 'active',
        icon: 'monetization-on',
        color: COLORS.success,
      },
      {
        id: 3,
        title: 'Session Completion Rate',
        description: 'Maintain 95% session completion rate',
        category: 'performance',
        target: 95,
        current: 92,
        deadline: '2025-12-31',
        priority: 'medium',
        status: 'active',
        icon: 'check-circle',
        color: COLORS.accent,
      },
      {
        id: 4,
        title: 'Client Retention Rate',
        description: 'Achieve 90% client retention',
        category: 'performance',
        target: 90,
        current: 85,
        deadline: '2025-11-30',
        priority: 'medium',
        status: 'active',
        icon: 'favorite',
        color: COLORS.warning,
      },
      {
        id: 5,
        title: 'Professional Certification',
        description: 'Complete advanced nutrition certification',
        category: 'education',
        target: 1,
        current: 0.7,
        deadline: '2025-10-15',
        priority: 'low',
        status: 'active',
        icon: 'school',
        color: COLORS.info,
      },
    ],
    completedGoals: [
      {
        id: 6,
        title: 'Build Client Portfolio',
        description: 'Establish portfolio of 30 clients',
        category: 'business',
        target: 30,
        current: 30,
        completedDate: '2025-07-15',
        icon: 'portfolio',
        color: COLORS.success,
      },
    ],
    achievements: [
      { id: 1, title: 'First Client Milestone', description: '10 clients acquired', badge: '🏆' },
      { id: 2, title: 'Revenue Champion', description: '$1K monthly revenue', badge: '💰' },
      { id: 3, title: 'Consistency King', description: '30 day streak', badge: '🔥' },
    ],
  };

  const categories = [
    { key: 'all', label: 'All Goals', icon: 'dashboard' },
    { key: 'business', label: 'Business', icon: 'business' },
    { key: 'performance', label: 'Performance', icon: 'trending-up' },
    { key: 'education', label: 'Education', icon: 'school' },
    { key: 'health', label: 'Health', icon: 'fitness-center' },
  ];

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Performance Goals</Text>
            <Text style={styles.headerSubtitle}>🎯 Track your progress & achievements</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={styles.viewModeButton}
          >
            <Icon name={viewMode === 'grid' ? 'view-list' : 'view-module'} size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderOverviewStats = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>📊 Goals Overview</Text>
        <View style={styles.statsGrid}>
          <Surface style={[styles.statItem, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.statNumber}>
              {mockGoalsData.currentGoals.filter(g => g.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active Goals</Text>
          </Surface>
          
          <Surface style={[styles.statItem, { backgroundColor: COLORS.success }]}>
            <Text style={styles.statNumber}>
              {mockGoalsData.completedGoals.length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Surface>
          
          <Surface style={[styles.statItem, { backgroundColor: COLORS.accent }]}>
            <Text style={styles.statNumber}>
              {Math.round(
                mockGoalsData.currentGoals.reduce((sum, goal) => sum + (goal.current / goal.target) * 100, 0) / 
                mockGoalsData.currentGoals.length
              )}%
            </Text>
            <Text style={styles.statLabel}>Avg Progress</Text>
          </Surface>
          
          <Surface style={[styles.statItem, { backgroundColor: COLORS.warning }]}>
            <Text style={styles.statNumber}>
              {mockGoalsData.achievements.length}
            </Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCategoryTabs = () => (
    <View style={styles.categoryTabs}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryTabsContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryTab,
                selectedCategory === category.key && styles.selectedCategoryTab
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Icon 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.key ? 'white' : COLORS.textSecondary} 
              />
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category.key && styles.selectedCategoryTabText
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderGoalCard = (goal) => (
    <Card key={goal.id} style={styles.goalCard}>
      <Card.Content>
        <View style={styles.goalHeader}>
          <View style={styles.goalHeaderLeft}>
            <Surface style={[styles.goalIcon, { backgroundColor: goal.color }]}>
              <Icon name={goal.icon} size={20} color="white" />
            </Surface>
            <View style={styles.goalTitleSection}>
              <Text style={TEXT_STYLES.h3}>{goal.title}</Text>
              <Text style={TEXT_STYLES.caption}>{goal.description}</Text>
            </View>
          </View>
          <View style={styles.goalActions}>
            <Chip 
              compact 
              style={[
                styles.priorityChip,
                { backgroundColor: 
                  goal.priority === 'high' ? COLORS.error : 
                  goal.priority === 'medium' ? COLORS.warning : COLORS.success
                }
              ]}
            >
              {goal.priority.toUpperCase()}
            </Chip>
            <TouchableOpacity
              onPress={() => {
                setSelectedGoal(goal);
                setShowEditGoal(true);
              }}
              style={styles.goalMenuButton}
            >
              <Icon name="dots-vertical" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.goalProgress}>
          <View style={styles.progressHeader}>
            <Text style={TEXT_STYLES.body}>
              Progress: {goal.current} / {goal.target}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round((goal.current / goal.target) * 100)}%
            </Text>
          </View>
          <ProgressBar
            progress={goal.current / goal.target}
            color={goal.color}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.goalFooter}>
          <View style={styles.goalDeadline}>
            <Icon name="schedule" size={16} color={COLORS.textSecondary} />
            <Text style={styles.deadlineText}>
              Due: {new Date(goal.deadline).toLocaleDateString()}
            </Text>
          </View>
          <Button
            mode="outlined"
            compact
            onPress={() => Alert.alert('Update Progress', 'Feature coming soon! 📈')}
            style={styles.updateButton}
          >
            Update
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderGoalsList = () => {
    const filteredGoals = selectedCategory === 'all' 
      ? mockGoalsData.currentGoals 
      : mockGoalsData.currentGoals.filter(goal => goal.category === selectedCategory);

    return (
      <View style={styles.goalsContainer}>
        <View style={styles.goalsHeader}>
          <Text style={TEXT_STYLES.h3}>Current Goals ({filteredGoals.length})</Text>
          <TouchableOpacity
            onPress={() => setShowAddGoal(true)}
            style={styles.addGoalButton}
          >
            <Icon name="add" size={20} color={COLORS.primary} />
            <Text style={styles.addGoalText}>Add Goal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.goalsList}>
          {filteredGoals.map(renderGoalCard)}
        </View>
      </View>
    );
  };

  const renderCompletedGoals = () => (
    <Card style={styles.completedCard}>
      <Card.Content>
        <View style={styles.completedHeader}>
          <Text style={TEXT_STYLES.h3}>🏆 Completed Goals</Text>
          <Chip icon="check" compact>
            {mockGoalsData.completedGoals.length} Done
          </Chip>
        </View>
        
        <View style={styles.completedList}>
          {mockGoalsData.completedGoals.map((goal) => (
            <Surface key={goal.id} style={styles.completedItem}>
              <View style={[styles.completedIcon, { backgroundColor: goal.color }]}>
                <Icon name="check" size={16} color="white" />
              </View>
              <View style={styles.completedContent}>
                <Text style={TEXT_STYLES.h3}>{goal.title}</Text>
                <Text style={TEXT_STYLES.caption}>
                  Completed on {new Date(goal.completedDate).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.completedBadge}>✅</Text>
            </Surface>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={styles.achievementsCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>🏅 Recent Achievements</Text>
        <View style={styles.achievementsList}>
          {mockGoalsData.achievements.map((achievement) => (
            <Surface key={achievement.id} style={styles.achievementItem}>
              <Text style={styles.achievementBadge}>{achievement.badge}</Text>
              <View style={styles.achievementContent}>
                <Text style={TEXT_STYLES.h3}>{achievement.title}</Text>
                <Text style={TEXT_STYLES.caption}>{achievement.description}</Text>
              </View>
            </Surface>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderAddGoalModal = () => (
    <Portal>
      <Modal
        visible={showAddGoal}
        onDismiss={() => setShowAddGoal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView style={styles.modalScrollView}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={TEXT_STYLES.h2}>🎯 Create New Goal</Text>
              <TouchableOpacity
                onPress={() => setShowAddGoal(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Goal Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter goal title"
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your goal"
                value={newGoalDescription}
                onChangeText={setNewGoalDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 0.48 }]}>
                <Text style={styles.formLabel}>Target</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="100"
                  value={newGoalTarget}
                  onChangeText={setNewGoalTarget}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, { flex: 0.48 }]}>
                <Text style={styles.formLabel}>Deadline</Text>
                <TouchableOpacity style={styles.dateInput}>
                  <Text style={styles.dateText}>
                    {newGoalDeadline || 'Select date'}
                  </Text>
                  <Icon name="calendar-today" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.categorySelector}>
                {categories.slice(1).map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryOption,
                      newGoalCategory === category.key && styles.selectedCategoryOption
                    ]}
                    onPress={() => setNewGoalCategory(category.key)}
                  >
                    <Icon 
                      name={category.icon} 
                      size={16} 
                      color={newGoalCategory === category.key ? 'white' : COLORS.textSecondary} 
                    />
                    <Text style={[
                      styles.categoryOptionText,
                      newGoalCategory === category.key && styles.selectedCategoryOptionText
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.formLabel}>Enable Reminders</Text>
                <Switch
                  value={newGoalReminders}
                  onValueChange={setNewGoalReminders}
                  color={COLORS.primary}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowAddGoal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setShowAddGoal(false);
                  Alert.alert('Success', 'Goal created successfully! 🎯');
                  // Reset form
                  setNewGoalTitle('');
                  setNewGoalDescription('');
                  setNewGoalTarget('');
                  setNewGoalDeadline('');
                  setNewGoalCategory('business');
                  setNewGoalReminders(true);
                }}
                style={styles.modalButton}
                disabled={!newGoalTitle || !newGoalTarget}
              >
                Create Goal
              </Button>
            </View>
          </Surface>
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Searchbar
          placeholder="Search goals and achievements..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          icon="flag"
        />

        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {renderOverviewStats()}
          {renderCategoryTabs()}
          {renderGoalsList()}
          {renderCompletedGoals()}
          {renderAchievements()}
        </Animated.View>
        
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {renderAddGoalModal()}

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => setShowAddGoal(true)}
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewModeButton: {
    padding: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  searchbar: {
    margin: SPACING.md,
    elevation: 2,
  },
  content: {
    paddingHorizontal: SPACING.md,
  },
  statsCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statItem: {
    flex: 0.23,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    marginBottom: SPACING.sm,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  categoryTabs: {
    marginBottom: SPACING.md,
  },
  categoryTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    elevation: 1,
  },
  selectedCategoryTab: {
    backgroundColor: COLORS.primary,
  },
  categoryTabText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  selectedCategoryTabText: {
    color: 'white',
    fontWeight: '600',
  },
  goalsContainer: {
    marginBottom: SPACING.md,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  addGoalText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  goalsList: {
    gap: SPACING.md,
  },
  goalCard: {
    elevation: 2,
    borderRadius: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  goalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  goalTitleSection: {
    flex: 1,
  },
  goalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityChip: {
    marginRight: SPACING.sm,
  },
  goalMenuButton: {
    padding: SPACING.xs,
  },
  goalProgress: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  updateButton: {
    borderColor: COLORS.primary,
  },
  completedCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  completedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  completedList: {
    gap: SPACING.sm,
  },
  completedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    elevation: 1,
  },
  completedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  completedContent: {
    flex: 1,
  },
  completedBadge: {
    fontSize: 20,
  },
  achievementsCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  achievementsList: {
    gap: SPACING.sm,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    elevation: 1,
  },
  achievementBadge: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  achievementContent: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalScrollView: {
    maxHeight: screenHeight * 0.9,
  },
  modalContent: {
    padding: SPACING.lg,
    borderRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 14,
    backgroundColor: COLORS.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 8,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  dateText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  selectedCategoryOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryOptionText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  selectedCategoryOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  modalButton: {
    flex: 0.4,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default PerformanceGoals;
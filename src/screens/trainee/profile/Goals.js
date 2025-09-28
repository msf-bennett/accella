import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Vibration,
  Animated,
} from 'react-native';
import {
  Card,
  Button,
  IconButton,
  ProgressBar,
  Surface,
  Portal,
  Modal,
  TextInput,
  Chip,
  Divider,
  RadioButton,
  Switch,
  FAB,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';
import { Text } from '../components/StyledText';

const Goals = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { goals, loading } = useSelector(state => state.profile);

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // active, completed, all
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    targetValue: '',
    targetUnit: '',
    currentValue: '0',
    targetDate: '',
    priority: 'medium',
    isPublic: false,
    milestones: [],
  });

  const goalCategories = [
    { value: 'weight', label: 'Weight Loss/Gain', icon: 'monitor-weight', color: COLORS.error },
    { value: 'strength', label: 'Strength', icon: 'fitness-center', color: COLORS.primary },
    { value: 'endurance', label: 'Endurance', icon: 'directions-run', color: COLORS.success },
    { value: 'flexibility', label: 'Flexibility', icon: 'self-improvement', color: '#9c27b0' },
    { value: 'body-composition', label: 'Body Composition', icon: 'person', color: '#ff5722' },
    { value: 'performance', label: 'Performance', icon: 'speed', color: COLORS.secondary },
    { value: 'habit', label: 'Habit Building', icon: 'repeat', color: '#795548' },
    { value: 'sport-specific', label: 'Sport Specific', icon: 'sports-basketball', color: '#607d8b' },
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: '#4caf50' },
    { value: 'medium', label: 'Medium', color: '#ff9800' },
    { value: 'high', label: 'High', color: '#f44336' },
  ];

  const targetUnits = {
    weight: ['kg', 'lbs'],
    strength: ['kg', 'lbs', 'reps'],
    endurance: ['km', 'miles', 'minutes', 'hours'],
    flexibility: ['cm', 'inches', 'degrees'],
    'body-composition': ['%', 'kg', 'lbs'],
    performance: ['seconds', 'minutes', 'reps', 'points'],
    habit: ['days', 'weeks', 'sessions'],
    'sport-specific': ['points', 'goals', 'wins', 'time'],
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = useCallback(async () => {
    try {
      // dispatch(loadUserGoals(user.id));
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  }, [user.id, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGoals();
    setRefreshing(false);
  }, [loadGoals]);

  const handleAddGoal = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      targetValue: '',
      targetUnit: '',
      currentValue: '0',
      targetDate: '',
      priority: 'medium',
      isPublic: false,
      milestones: [],
    });
    setModalVisible(true);
    Vibration.vibrate(50);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setFormData(goal);
    setModalVisible(true);
    Vibration.vibrate(50);
  };

  const handleSaveGoal = async () => {
    if (!formData.title.trim() || !formData.category || !formData.targetValue) {
      Alert.alert('Required Fields', 'Please fill in goal title, category, and target value.');
      return;
    }

    try {
      if (editingGoal) {
        // dispatch(updateGoal({ ...formData, id: editingGoal.id }));
      } else {
        // dispatch(addGoal({ ...formData, createdDate: new Date().toISOString() }));
      }
      setModalVisible(false);
      Vibration.vibrate([50, 50, 50]);
      
      Alert.alert(
        '🚧 Feature in Development',
        'Goal management is being built. This will help track your fitness progress and achievements.',
        [{ text: 'Got it!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    }
  };

  const handleDeleteGoal = (goalId) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // dispatch(deleteGoal(goalId));
            Vibration.vibrate(100);
          },
        },
      ]
    );
  };

  const handleUpdateProgress = (goal, newValue) => {
    Alert.prompt(
      'Update Progress',
      `Current: ${goal.currentValue}${goal.targetUnit}\nEnter new value:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: (value) => {
            if (value && !isNaN(parseFloat(value))) {
              // dispatch(updateGoalProgress({ goalId: goal.id, currentValue: value }));
              Vibration.vibrate([50, 50, 50]);
            }
          },
        },
      ],
      'plain-text',
      goal.currentValue.toString()
    );
  };

  const getProgressPercentage = (goal) => {
    const current = parseFloat(goal.currentValue) || 0;
    const target = parseFloat(goal.targetValue) || 1;
    return Math.min((current / target) * 100, 100);
  };

  const getCategoryIcon = (category) => {
    const cat = goalCategories.find(c => c.value === category);
    return cat ? cat.icon : 'track-changes';
  };

  const getCategoryColor = (category) => {
    const cat = goalCategories.find(c => c.value === category);
    return cat ? cat.color : COLORS.primary;
  };

  const getPriorityColor = (priority) => {
    const prio = priorityLevels.find(p => p.value === priority);
    return prio ? prio.color : COLORS.textSecondary;
  };

  const getTimeRemaining = (targetDate) => {
    if (!targetDate) return null;
    
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    if (diffDays <= 7) return `${diffDays} days left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return `${Math.ceil(diffDays / 30)} months left`;
  };

  const renderGoalCard = (goal) => {
    const progress = getProgressPercentage(goal);
    const isCompleted = progress >= 100;
    const timeRemaining = getTimeRemaining(goal.targetDate);
    const categoryColor = getCategoryColor(goal.category);

    return (
      <Card key={goal.id} style={[styles.goalCard, isCompleted && styles.completedCard]}>
        <Card.Content>
          <View style={styles.goalHeader}>
            <View style={styles.goalTitleSection}>
              <View style={styles.goalIcon}>
                <MaterialIcons 
                  name={getCategoryIcon(goal.category)} 
                  size={24} 
                  color={categoryColor} 
                />
              </View>
              <View style={styles.goalInfo}>
                <Text style={[TEXT_STYLES.h3, isCompleted && styles.completedText]}>
                  {goal.title}
                </Text>
                <View style={styles.goalMeta}>
                  <Chip
                    icon="category"
                    mode="outlined"
                    compact
                    style={[styles.categoryChip, { borderColor: categoryColor }]}
                    textStyle={{ color: categoryColor }}
                  >
                    {goalCategories.find(c => c.value === goal.category)?.label}
                  </Chip>
                  <Chip
                    icon="flag"
                    mode="outlined"
                    compact
                    style={[styles.priorityChip, { borderColor: getPriorityColor(goal.priority) }]}
                    textStyle={{ color: getPriorityColor(goal.priority) }}
                  >
                    {goal.priority}
                  </Chip>
                </View>
              </View>
            </View>
            <View style={styles.goalActions}>
              <IconButton
                icon="edit"
                size={18}
                onPress={() => handleEditGoal(goal)}
              />
              <IconButton
                icon="delete"
                size={18}
                iconColor={COLORS.error}
                onPress={() => handleDeleteGoal(goal.id)}
              />
            </View>
          </View>

          {goal.description && (
            <Text style={styles.goalDescription}>{goal.description}</Text>
          )}

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={[styles.progressValue, { color: categoryColor }]}>
                {goal.currentValue}/{goal.targetValue} {goal.targetUnit}
              </Text>
            </View>
            <ProgressBar
              progress={progress / 100}
              color={isCompleted ? COLORS.success : categoryColor}
              style={styles.progressBar}
            />
            <View style={styles.progressFooter}>
              <Text style={styles.progressPercentage}>{Math.round(progress)}% complete</Text>
              {timeRemaining && (
                <Text style={[
                  styles.timeRemaining,
                  timeRemaining === 'Overdue' && { color: COLORS.error }
                ]}>
                  {timeRemaining}
                </Text>
              )}
            </View>
          </View>

          {isCompleted && (
            <View style={styles.completedBadge}>
              <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
              <Text style={styles.completedText}>Goal Completed! 🎉</Text>
            </View>
          )}
        </Card.Content>

        <Card.Actions>
          <Button
            mode="text"
            icon="trending-up"
            onPress={() => handleUpdateProgress(goal)}
          >
            Update Progress
          </Button>
          {goal.isPublic && (
            <Button
              mode="text"
              icon="share"
              onPress={() => {
                Alert.alert('Share Goal', 'Share your progress with friends and trainers!');
              }}
            >
              Share
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  };

  const renderGoalForm = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.formContainer}>
          <View style={styles.modalHeader}>
            <Text style={TEXT_STYLES.h2}>
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </Text>
            <IconButton
              icon="close"
              onPress={() => setModalVisible(false)}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              label="Goal Title *"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Lose 10kg, Run 5km, Bench press 100kg"
            />

            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Describe your goal and why it's important to you"
            />

            <View style={styles.chipContainer}>
              <Text style={styles.chipLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {goalCategories.map((category) => (
                    <Chip
                      key={category.value}
                      icon={category.icon}
                      mode={formData.category === category.value ? 'flat' : 'outlined'}
                      selected={formData.category === category.value}
                      onPress={() => setFormData({ ...formData, category: category.value })}
                      style={[
                        styles.categoryOption,
                        formData.category === category.value && { backgroundColor: category.color + '20' }
                      ]}
                      textStyle={formData.category === category.value && { color: category.color }}
                    >
                      {category.label}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.targetSection}>
              <View style={styles.targetInputs}>
                <TextInput
                  label="Target Value *"
                  value={formData.targetValue}
                  onChangeText={(text) => setFormData({ ...formData, targetValue: text })}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.targetValueInput]}
                />
                <View style={styles.unitSelector}>
                  <Text style={styles.chipLabel}>Unit</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                      {(targetUnits[formData.category] || ['units']).map((unit) => (
                        <Chip
                          key={unit}
                          mode={formData.targetUnit === unit ? 'flat' : 'outlined'}
                          selected={formData.targetUnit === unit}
                          onPress={() => setFormData({ ...formData, targetUnit: unit })}
                          style={styles.unitChip}
                          compact
                        >
                          {unit}
                        </Chip>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>

            <TextInput
              label="Current Value"
              value={formData.currentValue}
              onChangeText={(text) => setFormData({ ...formData, currentValue: text })}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              placeholder="0"
            />

            <TextInput
              label="Target Date"
              value={formData.targetDate}
              onChangeText={(text) => setFormData({ ...formData, targetDate: text })}
              mode="outlined"
              style={styles.input}
              placeholder="YYYY-MM-DD"
              left={<TextInput.Icon icon="calendar" />}
            />

            <View style={styles.prioritySection}>
              <Text style={styles.chipLabel}>Priority</Text>
              <RadioButton.Group
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                value={formData.priority}
              >
                <View style={styles.priorityOptions}>
                  {priorityLevels.map((priority) => (
                    <View key={priority.value} style={styles.priorityOption}>
                      <RadioButton.Item
                        label={priority.label}
                        value={priority.value}
                        labelStyle={{ color: priority.color }}
                      />
                    </View>
                  ))}
                </View>
              </RadioButton.Group>
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <MaterialIcons name="public" size={20} color={COLORS.textSecondary} />
                <Text style={styles.switchText}>Make this goal public</Text>
              </View>
              <Switch
                value={formData.isPublic}
                onValueChange={(value) => setFormData({ ...formData, isPublic: value })}
              />
            </View>

            <View style={styles.formActions}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveGoal}
                style={styles.saveButton}
              >
                {editingGoal ? 'Update' : 'Create'} Goal
              </Button>
            </View>
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );

  const renderStatsOverview = () => {
    const totalGoals = mockGoals.length;
    const completedGoals = mockGoals.filter(g => getProgressPercentage(g) >= 100).length;
    const activeGoals = totalGoals - completedGoals;
    const avgProgress = totalGoals > 0 ? mockGoals.reduce((sum, g) => sum + getProgressPercentage(g), 0) / totalGoals : 0;

    return (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={TEXT_STYLES.h3}>Your Progress Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalGoals}</Text>
              <Text style={styles.statLabel}>Total Goals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.success }]}>{completedGoals}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.primary }]}>{activeGoals}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.secondary }]}>{Math.round(avgProgress)}%</Text>
              <Text style={styles.statLabel}>Avg Progress</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const filterGoals = (goals) => {
    switch (activeTab) {
      case 'completed':
        return goals.filter(g => getProgressPercentage(g) >= 100);
      case 'active':
        return goals.filter(g => getProgressPercentage(g) < 100);
      default:
        return goals;
    }
  };

  // Mock data for development
  const mockGoals = [
    {
      id: 1,
      title: 'Lose 5kg Weight',
      description: 'Reach my target weight for summer',
      category: 'weight',
      targetValue: '5',
      targetUnit: 'kg',
      currentValue: '3.2',
      targetDate: '2024-12-31',
      priority: 'high',
      isPublic: true,
      createdDate: '2024-08-01',
    },
    {
      id: 2,
      title: 'Run 10km Non-stop',
      description: 'Build endurance for half marathon',
      category: 'endurance',
      targetValue: '10',
      targetUnit: 'km',
      currentValue: '6.5',
      targetDate: '2024-10-15',
      priority: 'medium',
      isPublic: false,
      createdDate: '2024-07-15',
    },
    {
      id: 3,
      title: 'Bench Press 80kg',
      description: 'Increase upper body strength',
      category: 'strength',
      targetValue: '80',
      targetUnit: 'kg',
      currentValue: '80',
      targetDate: '2024-09-30',
      priority: 'high',
      isPublic: true,
      createdDate: '2024-06-01',
    },
    {
      id: 4,
      title: 'Workout 5x per Week',
      description: 'Build consistent exercise habit',
      category: 'habit',
      targetValue: '12',
      targetUnit: 'weeks',
      currentValue: '8',
      targetDate: '2024-11-01',
      priority: 'medium',
      isPublic: false,
      createdDate: '2024-08-10',
    },
  ];

  const filteredGoals = filterGoals(mockGoals);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Goals</Text>
          <Text style={styles.headerSubtitle}>
            Track your progress and achieve greatness 🏆
          </Text>
        </View>
      </LinearGradient>

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
      >
        <View style={styles.statsSection}>
          {renderStatsOverview()}
        </View>

        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            {[
              { key: 'active', label: 'Active', icon: 'play-circle' },
              { key: 'completed', label: 'Completed', icon: 'check-circle' },
              { key: 'all', label: 'All Goals', icon: 'list' },
            ].map((tab) => (
              <Button
                key={tab.key}
                mode={activeTab === tab.key ? 'contained' : 'outlined'}
                onPress={() => {
                  setActiveTab(tab.key);
                  Vibration.vibrate(30);
                }}
                icon={tab.icon}
                style={styles.tabButton}
                compact
              >
                {tab.label}
              </Button>
            ))}
          </View>
        </View>

        <View style={styles.goalsSection}>
          {filteredGoals.length > 0 ? (
            filteredGoals.map(renderGoalCard)
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialIcons 
                  name={activeTab === 'completed' ? 'jump-rope' : 'track-changes'} 
                  size={64} 
                  color={COLORS.textSecondary} 
                />
                <Text style={styles.emptyTitle}>
                  {activeTab === 'completed' ? 'No Completed Goals Yet' : 'No Goals Set'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {activeTab === 'completed' 
                    ? 'Keep working towards your goals!' 
                    : 'Set your first fitness goal to start tracking progress'
                  }
                </Text>
                {activeTab !== 'completed' && (
                  <Button
                    mode="contained"
                    icon="add"
                    onPress={handleAddGoal}
                    style={styles.emptyButton}
                  >
                    Create Your First Goal
                  </Button>
                )}
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleAddGoal}
      />

      {renderGoalForm()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
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
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  statsSection: {
    marginTop: -SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  tabsContainer: {
    marginBottom: SPACING.md,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  tabButton: {
    flex: 1,
  },
  goalsSection: {
    marginBottom: SPACING.lg,
  },
  goalCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  completedCard: {
    backgroundColor: COLORS.success + '10',
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  goalTitleSection: {
    flexDirection: 'row',
    flex: 1,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  goalInfo: {
    flex: 1,
  },
  goalMeta: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  priorityChip: {
    alignSelf: 'flex-start',
  },
  goalActions: {
    flexDirection: 'row',
  },
  goalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  progressSection: {
    marginTop: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  progressValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  timeRemaining: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.success + '30',
  },
  completedText: {
    ...TEXT_STYLES.body,
    color: COLORS.success,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  emptyCard: {
    marginVertical: SPACING.lg,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    paddingHorizontal: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  formContainer: {
    maxHeight: '90%',
    borderRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  input: {
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md,
  },
  chipContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  chipLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  chipRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
  },
  categoryOption: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  targetSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  targetInputs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  targetValueInput: {
    flex: 1,
    marginHorizontal: 0,
  },
  unitSelector: {
    flex: 1,
  },
  unitChip: {
    marginRight: SPACING.xs,
  },
  prioritySection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  priorityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priorityOption: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
};

export default Goals;
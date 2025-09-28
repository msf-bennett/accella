import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Surface,
  Portal,
  Modal,
  TextInput,
  Menu,
  Divider,
  Badge,
  IconButton,
  FAB,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const { width } = Dimensions.get('window');

const GoalTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, goals, achievements } = useSelector(state => state.athlete);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: '',
    targetValue: '',
    currentValue: 0,
    unit: '',
    deadline: '',
    priority: 'medium'
  });
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  // Sample data (replace with Redux state)
  const [sampleGoals] = useState([
    {
      id: 1,
      title: 'Increase Bench Press',
      description: 'Improve maximum bench press weight',
      category: 'strength',
      currentValue: 85,
      targetValue: 100,
      unit: 'kg',
      deadline: '2025-12-01',
      priority: 'high',
      progress: 85,
      streak: 12,
      milestones: [
        { value: 90, achieved: true, date: '2025-08-15' },
        { value: 95, achieved: false, date: null },
        { value: 100, achieved: false, date: null }
      ]
    },
    {
      id: 2,
      title: 'Run 10K Under 45 Minutes',
      description: 'Achieve sub-45 minute 10K time',
      category: 'endurance',
      currentValue: 48.5,
      targetValue: 45,
      unit: 'minutes',
      deadline: '2025-11-15',
      priority: 'high',
      progress: 72,
      streak: 8,
      milestones: [
        { value: 47, achieved: true, date: '2025-08-10' },
        { value: 46, achieved: false, date: null },
        { value: 45, achieved: false, date: null }
      ]
    },
    {
      id: 3,
      title: 'Perfect Free Throw Accuracy',
      description: 'Achieve 85% free throw accuracy',
      category: 'skill',
      currentValue: 78,
      targetValue: 85,
      unit: '%',
      deadline: '2025-10-30',
      priority: 'medium',
      progress: 92,
      streak: 15,
      milestones: [
        { value: 80, achieved: true, date: '2025-08-18' },
        { value: 82, achieved: true, date: '2025-08-20' },
        { value: 85, achieved: false, date: null }
      ]
    }
  ]);

  const goalCategories = [
    { label: 'All Goals', value: 'all', icon: 'jump-rope' },
    { label: 'Strength', value: 'strength', icon: 'fitness-center' },
    { label: 'Endurance', value: 'endurance', icon: 'directions-run' },
    { label: 'Skill', value: 'skill', icon: 'psychology' },
    { label: 'Recovery', value: 'recovery', icon: 'spa' },
    { label: 'Nutrition', value: 'nutrition', icon: 'restaurant' },
  ];

  const priorityLevels = [
    { label: 'High Priority', value: 'high', color: COLORS.error },
    { label: 'Medium Priority', value: 'medium', color: COLORS.primary },
    { label: 'Low Priority', value: 'low', color: COLORS.secondary },
  ];

  // Animations
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
  }, []);

  // Event handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handleAddGoal = () => {
    if (!goalForm.title || !goalForm.targetValue) {
      Alert.alert('Error', 'Please fill in the required fields');
      return;
    }
    
    // Add goal logic here
    Alert.alert('Success', '🎯 Goal added successfully!');
    setShowAddGoal(false);
    setGoalForm({
      title: '',
      description: '',
      category: '',
      targetValue: '',
      currentValue: 0,
      unit: '',
      deadline: '',
      priority: 'medium'
    });
    Vibration.vibrate(100);
  };

  const handleUpdateGoal = (goalId, newValue) => {
    // Update goal progress logic
    Alert.alert('Progress Updated', `🚀 Keep pushing towards your goal!`);
    Vibration.vibrate(50);
  };

  const getCategoryIcon = (category) => {
    const categoryData = goalCategories.find(cat => cat.value === category);
    return categoryData ? categoryData.icon : 'jump-rope';
  };

  const getPriorityColor = (priority) => {
    const priorityData = priorityLevels.find(p => p.value === priority);
    return priorityData ? priorityData.color : COLORS.primary;
  };

  const filteredGoals = filterCategory === 'all' 
    ? sampleGoals 
    : sampleGoals.filter(goal => goal.category === filterCategory);

  const renderGoalCard = (goal) => (
    <Card key={goal.id} style={styles.goalCard} elevation={4}>
      <LinearGradient
        colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.05)']}
        style={styles.goalCardGradient}
      >
        <View style={styles.goalHeader}>
          <View style={styles.goalTitleSection}>
            <Icon 
              name={getCategoryIcon(goal.category)} 
              size={24} 
              color={COLORS.primary} 
            />
            <View style={styles.goalTitleContainer}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalDescription}>{goal.description}</Text>
            </View>
          </View>
          <View style={styles.goalActions}>
            <Chip 
              style={[styles.priorityChip, { backgroundColor: getPriorityColor(goal.priority) }]}
              textStyle={styles.priorityText}
            >
              {goal.priority.toUpperCase()}
            </Chip>
            <Badge style={styles.streakBadge}>{goal.streak}🔥</Badge>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </Text>
            <Text style={styles.progressPercentage}>{goal.progress}%</Text>
          </View>
          <ProgressBar 
            progress={goal.progress / 100} 
            color={COLORS.primary}
            style={styles.progressBar}
          />
          <Text style={styles.deadlineText}>
            📅 Target: {new Date(goal.deadline).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.milestonesSection}>
          <Text style={styles.milestonesTitle}>🎯 Milestones</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {goal.milestones.map((milestone, index) => (
              <Surface key={index} style={[
                styles.milestoneChip,
                { backgroundColor: milestone.achieved ? COLORS.success : COLORS.background }
              ]}>
                <Text style={[
                  styles.milestoneText,
                  { color: milestone.achieved ? 'white' : COLORS.text }
                ]}>
                  {milestone.achieved ? '✅' : '⏳'} {milestone.value}{goal.unit}
                </Text>
              </Surface>
            ))}
          </ScrollView>
        </View>

        <View style={styles.goalActions}>
          <Button 
            mode="outlined" 
            onPress={() => setSelectedGoal(goal)}
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
          >
            📊 Details
          </Button>
          <Button 
            mode="contained" 
            onPress={() => handleUpdateGoal(goal.id, goal.currentValue + 1)}
            style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            contentStyle={styles.buttonContent}
          >
            📈 Update
          </Button>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderGoalModal = () => (
    <Portal>
      <Modal 
        visible={!!selectedGoal} 
        onDismiss={() => setSelectedGoal(null)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurOverlay} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent} elevation={8}>
            {selectedGoal && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedGoal.title}</Text>
                  <IconButton 
                    icon="close" 
                    onPress={() => setSelectedGoal(null)}
                    iconColor={COLORS.text}
                  />
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalDescription}>{selectedGoal.description}</Text>
                  
                  <View style={styles.modalStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Current Progress</Text>
                      <Text style={styles.statValue}>
                        {selectedGoal.currentValue} {selectedGoal.unit}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Target</Text>
                      <Text style={styles.statValue}>
                        {selectedGoal.targetValue} {selectedGoal.unit}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Streak</Text>
                      <Text style={styles.statValue}>{selectedGoal.streak} days 🔥</Text>
                    </View>
                  </View>

                  <ProgressBar 
                    progress={selectedGoal.progress / 100} 
                    color={COLORS.primary}
                    style={styles.modalProgressBar}
                  />

                  <Text style={styles.milestonesTitle}>🎯 Milestone Progress</Text>
                  {selectedGoal.milestones.map((milestone, index) => (
                    <View key={index} style={styles.milestoneItem}>
                      <Icon 
                        name={milestone.achieved ? "check-circle" : "radio-button-unchecked"} 
                        size={20} 
                        color={milestone.achieved ? COLORS.success : COLORS.secondary} 
                      />
                      <Text style={styles.milestoneItemText}>
                        {milestone.value}{selectedGoal.unit}
                        {milestone.achieved && ` - Achieved ${milestone.date}`}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderAddGoalModal = () => (
    <Portal>
      <Modal 
        visible={showAddGoal} 
        onDismiss={() => setShowAddGoal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.addGoalModal} elevation={8}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎯 Add New Goal</Text>
            <IconButton 
              icon="close" 
              onPress={() => setShowAddGoal(false)}
              iconColor={COLORS.text}
            />
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              label="Goal Title *"
              value={goalForm.title}
              onChangeText={(text) => setGoalForm({...goalForm, title: text})}
              style={styles.textInput}
              mode="outlined"
            />
            
            <TextInput
              label="Description"
              value={goalForm.description}
              onChangeText={(text) => setGoalForm({...goalForm, description: text})}
              style={styles.textInput}
              mode="outlined"
              multiline
            />

            <Menu
              visible={categoryMenuVisible}
              onDismiss={() => setCategoryMenuVisible(false)}
              anchor={
                <TouchableOpacity 
                  style={styles.menuButton}
                  onPress={() => setCategoryMenuVisible(true)}
                >
                  <Text style={styles.menuButtonText}>
                    {goalForm.category ? goalCategories.find(c => c.value === goalForm.category)?.label : 'Select Category'}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color={COLORS.text} />
                </TouchableOpacity>
              }
            >
              {goalCategories.slice(1).map((category) => (
                <Menu.Item
                  key={category.value}
                  title={category.label}
                  onPress={() => {
                    setGoalForm({...goalForm, category: category.value});
                    setCategoryMenuVisible(false);
                  }}
                  leadingIcon={category.icon}
                />
              ))}
            </Menu>

            <View style={styles.inputRow}>
              <TextInput
                label="Target Value *"
                value={goalForm.targetValue}
                onChangeText={(text) => setGoalForm({...goalForm, targetValue: text})}
                style={[styles.textInput, { flex: 1, marginRight: SPACING.sm }]}
                mode="outlined"
                keyboardType="numeric"
              />
              <TextInput
                label="Unit"
                value={goalForm.unit}
                onChangeText={(text) => setGoalForm({...goalForm, unit: text})}
                style={[styles.textInput, { flex: 1, marginLeft: SPACING.sm }]}
                mode="outlined"
                placeholder="kg, minutes, %"
              />
            </View>

            <TextInput
              label="Deadline"
              value={goalForm.deadline}
              onChangeText={(text) => setGoalForm({...goalForm, deadline: text})}
              style={styles.textInput}
              mode="outlined"
              placeholder="YYYY-MM-DD"
            />

            <Menu
              visible={priorityMenuVisible}
              onDismiss={() => setPriorityMenuVisible(false)}
              anchor={
                <TouchableOpacity 
                  style={styles.menuButton}
                  onPress={() => setPriorityMenuVisible(true)}
                >
                  <Text style={styles.menuButtonText}>
                    {priorityLevels.find(p => p.value === goalForm.priority)?.label}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color={COLORS.text} />
                </TouchableOpacity>
              }
            >
              {priorityLevels.map((priority) => (
                <Menu.Item
                  key={priority.value}
                  title={priority.label}
                  onPress={() => {
                    setGoalForm({...goalForm, priority: priority.value});
                    setPriorityMenuVisible(false);
                  }}
                />
              ))}
            </Menu>

            <Button 
              mode="contained" 
              onPress={handleAddGoal}
              style={styles.addButton}
              contentStyle={styles.addButtonContent}
            >
              🎯 Create Goal
            </Button>
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleSection}>
            <Text style={styles.headerTitle}>🎯 Goal Tracking</Text>
            <Text style={styles.headerSubtitle}>Chase your dreams, track your wins! 💪</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statCircle}>
              <Text style={styles.statNumber}>{filteredGoals.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {goalCategories.map((category) => (
            <Chip
              key={category.value}
              selected={filterCategory === category.value}
              onPress={() => setFilterCategory(category.value)}
              style={[
                styles.categoryChip,
                filterCategory === category.value && styles.selectedCategoryChip
              ]}
              textStyle={[
                styles.categoryChipText,
                filterCategory === category.value && styles.selectedCategoryChipText
              ]}
              icon={category.icon}
            >
              {category.label}
            </Chip>
          ))}
        </ScrollView>

        <ScrollView 
          style={styles.goalsList}
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
          {filteredGoals.length > 0 ? (
            filteredGoals.map(renderGoalCard)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="jump-rope" size={80} color={COLORS.secondary} />
              <Text style={styles.emptyTitle}>No Goals Yet!</Text>
              <Text style={styles.emptySubtitle}>
                Start your journey by setting your first goal 🚀
              </Text>
            </View>
          )}
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowAddGoal(true)}
        color="white"
      />

      {renderGoalModal()}
      {renderAddGoalModal()}
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleSection: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  headerStats: {
    alignItems: 'center',
  },
  statCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
  },
  categoryFilter: {
    paddingVertical: SPACING.sm,
  },
  categoryFilterContent: {
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.text,
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  goalsList: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  goalCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  goalCardGradient: {
    padding: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  goalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalTitleContainer: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  goalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  goalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    marginTop: 2,
  },
  goalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  priorityChip: {
    height: 24,
  },
  priorityText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
  },
  streakBadge: {
    backgroundColor: COLORS.success,
  },
  progressSection: {
    marginVertical: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
  },
  deadlineText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  milestonesSection: {
    marginVertical: SPACING.sm,
  },
  milestonesTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  milestoneChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginRight: SPACING.xs,
    elevation: 2,
  },
  milestoneText: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  buttonContent: {
    height: 40,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginTop: SPACING.md,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  bottomPadding: {
    height: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 16,
    padding: SPACING.md,
  },
  addGoalModal: {
    width: width * 0.9,
    maxHeight: '90%',
    borderRadius: 16,
    padding: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  statValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 2,
  },
  modalProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  milestoneItemText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    color: COLORS.text,
  },
  textInput: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  addButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  addButtonContent: {
    height: 48,
  },
});

export default GoalTracking;
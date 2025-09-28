import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
  Vibration,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  Searchbar,
  Badge,
  ProgressBar,
  Checkbox,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#E91E63',
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
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  bodySmall: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const PlayerGoals = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth?.user);
  const playerGoals = useSelector(state => state.player?.goals || []);
  const isLoading = useSelector(state => state.player?.isLoading || false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [selectedGoalType, setSelectedGoalType] = useState('performance');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalTargetValue, setGoalTargetValue] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [showCompletedGoals, setShowCompletedGoals] = useState(false);

  // Mock data for development
  const mockGoals = [
    {
      id: '1',
      title: 'Improve Shooting Accuracy',
      description: 'Reach 80% shooting accuracy in training sessions',
      type: 'performance',
      category: 'Technical',
      targetValue: 80,
      currentValue: 72,
      unit: '%',
      deadline: '2025-09-15',
      priority: 'high',
      status: 'active',
      progress: 0.9,
      createdAt: '2025-07-01',
      milestones: [
        { value: 20, completed: true, date: '2025-07-15' },
        { value: 40, completed: true, date: '2025-07-30' },
        { value: 60, completed: true, date: '2025-08-10' },
        { value: 80, completed: false, date: null },
      ],
      rewards: ['🎯', '⚽', '50 XP'],
      streak: 12,
      icon: 'sports-soccer',
    },
    {
      id: '2',
      title: 'Complete Fitness Challenge',
      description: 'Run 100km total distance this month',
      type: 'fitness',
      category: 'Physical',
      targetValue: 100,
      currentValue: 65,
      unit: 'km',
      deadline: '2025-08-31',
      priority: 'medium',
      status: 'active',
      progress: 0.65,
      createdAt: '2025-08-01',
      milestones: [
        { value: 25, completed: true, date: '2025-08-08' },
        { value: 50, completed: true, date: '2025-08-15' },
        { value: 75, completed: false, date: null },
        { value: 100, completed: false, date: null },
      ],
      rewards: ['💪', '🏃', '75 XP'],
      streak: 8,
      icon: 'directions-run',
    },
    {
      id: '3',
      title: 'Leadership Development',
      description: 'Captain the team for 5 matches',
      type: 'personal',
      category: 'Mental',
      targetValue: 5,
      currentValue: 3,
      unit: 'matches',
      deadline: '2025-10-01',
      priority: 'medium',
      status: 'active',
      progress: 0.6,
      createdAt: '2025-07-20',
      milestones: [
        { value: 1, completed: true, date: '2025-07-25' },
        { value: 3, completed: true, date: '2025-08-10' },
        { value: 5, completed: false, date: null },
      ],
      rewards: ['👑', '🎖️', '100 XP'],
      streak: 3,
      icon: 'jump-rope',
    },
    {
      id: '4',
      title: 'Perfect Attendance',
      description: 'Attend all training sessions this season',
      type: 'habit',
      category: 'Discipline',
      targetValue: 48,
      currentValue: 48,
      unit: 'sessions',
      deadline: '2025-12-31',
      priority: 'high',
      status: 'completed',
      progress: 1.0,
      createdAt: '2025-06-01',
      completedAt: '2025-08-15',
      milestones: [
        { value: 12, completed: true, date: '2025-06-30' },
        { value: 24, completed: true, date: '2025-07-31' },
        { value: 36, completed: true, date: '2025-08-10' },
        { value: 48, completed: true, date: '2025-08-15' },
      ],
      rewards: ['🏆', '✨', '200 XP'],
      streak: 48,
      icon: 'event-available',
    },
  ];

  const goalTypes = [
    { 
      key: 'performance', 
      label: 'Performance', 
      icon: 'trending-up',
      description: 'Skill-based achievements',
      color: COLORS.primary,
    },
    { 
      key: 'fitness', 
      label: 'Fitness', 
      icon: 'fitness-center',
      description: 'Physical conditioning goals',
      color: COLORS.success,
    },
    { 
      key: 'personal', 
      label: 'Personal', 
      icon: 'psychology',
      description: 'Mental & leadership growth',
      color: COLORS.accent,
    },
    { 
      key: 'habit', 
      label: 'Habits', 
      icon: 'repeat',
      description: 'Daily routine building',
      color: COLORS.warning,
    },
  ];

  const filterOptions = [
    { key: 'all', label: 'All Goals', icon: 'dashboard' },
    { key: 'active', label: 'Active', icon: 'play-circle-filled' },
    { key: 'completed', label: 'Completed', icon: 'check-circle' },
    { key: 'overdue', label: 'Overdue', icon: 'schedule' },
  ];

  const priorityColors = {
    high: COLORS.error,
    medium: COLORS.warning,
    low: COLORS.success,
  };

  // Initialize animations
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Goals Updated! 🎯', 'Latest progress data loaded successfully!', [
        { text: 'Keep Going! 💪', style: 'default' },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh goals data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleCreateGoal = useCallback(() => {
    if (!goalTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a goal title! 📝');
      return;
    }

    const newGoal = {
      id: Date.now().toString(),
      title: goalTitle,
      description: goalDescription,
      type: selectedGoalType,
      targetValue: parseFloat(goalTargetValue) || 100,
      currentValue: 0,
      deadline: goalDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'medium',
      status: 'active',
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    Alert.alert(
      'Goal Created! 🚀',
      `"${goalTitle}" has been added to your goals. You've got this!`,
      [{ text: 'Let\'s Do This! 💪', style: 'default' }]
    );

    // Reset form
    setGoalTitle('');
    setGoalDescription('');
    setGoalTargetValue('');
    setGoalDeadline('');
    setShowNewGoalModal(false);
    Vibration.vibrate(100);
  }, [goalTitle, goalDescription, selectedGoalType, goalTargetValue, goalDeadline]);

  const handleGoalProgress = useCallback((goalId, increment = 1) => {
    Alert.alert(
      'Progress Updated! 📈',
      `Great work! Keep pushing towards your goal! 🔥`,
      [{ text: 'Amazing! 🎉', style: 'default' }]
    );
    Vibration.vibrate(50);
  }, []);

  const handleCompleteGoal = useCallback((goalId) => {
    Alert.alert(
      'Goal Completed! 🏆',
      'Congratulations! You\'ve achieved another milestone. Rewards earned! 🎉',
      [
        { text: 'Set New Goal', onPress: () => setShowNewGoalModal(true) },
        { text: 'Celebrate! 🥳', style: 'default' },
      ]
    );
    Vibration.vibrate([0, 100, 100, 100]);
  }, []);

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { text: 'Overdue', color: COLORS.error };
    if (days === 0) return { text: 'Due Today', color: COLORS.warning };
    if (days === 1) return { text: '1 day left', color: COLORS.warning };
    if (days <= 7) return { text: `${days} days left`, color: COLORS.warning };
    return { text: `${days} days left`, color: COLORS.textSecondary };
  };

  const filteredGoals = mockGoals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'active' && goal.status === 'active') ||
      (selectedFilter === 'completed' && goal.status === 'completed') ||
      (selectedFilter === 'overdue' && goal.status === 'active' && new Date(goal.deadline) < new Date());
    
    return matchesSearch && matchesFilter;
  });

  const renderHeader = () => {
    const activeGoals = mockGoals.filter(g => g.status === 'active').length;
    const completedGoals = mockGoals.filter(g => g.status === 'completed').length;
    const totalProgress = mockGoals.reduce((sum, g) => sum + g.progress, 0) / mockGoals.length;

    return (
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.lg,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={[TEXT_STYLES.h2, { color: '#fff' }]}>
              My Goals 🎯
            </Text>
            <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
              Track your journey to greatness
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Overall Progress
            </Text>
            <Text style={[TEXT_STYLES.h2, { color: '#fff', marginTop: 4 }]}>
              {Math.round(totalProgress * 100)}%
            </Text>
          </View>
        </View>
        
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          marginTop: SPACING.lg,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: SPACING.md,
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: '#fff' }]}>{activeGoals}</Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Active</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: '#fff' }]}>{completedGoals}</Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Completed</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: '#fff' }]}>{mockGoals.length}</Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Total</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderGoalCard = ({ item, index }) => {
    const timeRemaining = getTimeRemaining(item.deadline);
    const goalType = goalTypes.find(t => t.key === item.type);
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Card style={{
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          elevation: 4,
          borderRadius: 16,
          backgroundColor: item.status === 'completed' ? '#f0f8ff' : COLORS.surface,
          borderLeftWidth: 4,
          borderLeftColor: goalType?.color || COLORS.primary,
        }}>
          <Card.Content style={{ padding: SPACING.md }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Icon 
                    name={item.icon} 
                    size={20} 
                    color={goalType?.color || COLORS.primary} 
                  />
                  <Text style={[TEXT_STYLES.h3, { marginLeft: 8, fontSize: 16, flex: 1 }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.status === 'completed' && (
                    <Icon name="check-circle" size={24} color={COLORS.success} />
                  )}
                </View>
                
                <Text style={[TEXT_STYLES.bodySmall, { marginBottom: SPACING.sm }]} numberOfLines={2}>
                  {item.description}
                </Text>
                
                {/* Priority and Category */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                  <Chip
                    mode="outlined"
                    compact
                    style={{
                      borderColor: priorityColors[item.priority],
                      backgroundColor: `${priorityColors[item.priority]}20`,
                    }}
                    textStyle={{ fontSize: 10, color: priorityColors[item.priority] }}
                  >
                    {item.priority.toUpperCase()}
                  </Chip>
                  <Chip
                    mode="outlined"
                    compact
                    style={{
                      marginLeft: SPACING.xs,
                      borderColor: goalType?.color,
                      backgroundColor: `${goalType?.color}20`,
                    }}
                    textStyle={{ fontSize: 10, color: goalType?.color }}
                  >
                    {item.category}
                  </Chip>
                </View>
              </View>
            </View>

            {/* Progress Section */}
            <View style={{ marginBottom: SPACING.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={TEXT_STYLES.bodySmall}>
                  Progress: {item.currentValue}/{item.targetValue} {item.unit}
                </Text>
                <Text style={[TEXT_STYLES.bodySmall, { fontWeight: '600' }]}>
                  {Math.round(item.progress * 100)}%
                </Text>
              </View>
              
              <ProgressBar
                progress={item.progress}
                color={item.status === 'completed' ? COLORS.success : goalType?.color || COLORS.primary}
                style={{ height: 8, borderRadius: 4, backgroundColor: '#e0e0e0' }}
              />
            </View>

            {/* Streak and Rewards */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="local-fire-department" size={16} color={COLORS.warning} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                  {item.streak} day streak
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { marginRight: 4 }]}>Rewards:</Text>
                {item.rewards.slice(0, 3).map((reward, rewardIndex) => (
                  <Text key={rewardIndex} style={{ fontSize: 14, marginLeft: 2 }}>
                    {reward}
                  </Text>
                ))}
              </View>
            </View>

            {/* Deadline */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="schedule" size={16} color={timeRemaining.color} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: timeRemaining.color }]}>
                  {timeRemaining.text}
                </Text>
              </View>
              
              <Text style={TEXT_STYLES.caption}>
                Due: {new Date(item.deadline).toLocaleDateString()}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', marginTop: SPACING.sm }}>
              {item.status === 'active' && (
                <>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => handleGoalProgress(item.id)}
                    style={{ 
                      flex: 1, 
                      marginRight: SPACING.xs,
                      borderColor: goalType?.color,
                    }}
                    labelStyle={{ color: goalType?.color }}
                    icon="add"
                  >
                    Update
                  </Button>
                  
                  {item.progress >= 1.0 && (
                    <Button
                      mode="contained"
                      compact
                      onPress={() => handleCompleteGoal(item.id)}
                      style={{ 
                        flex: 1,
                        marginLeft: SPACING.xs,
                        backgroundColor: COLORS.success,
                      }}
                      icon="check"
                    >
                      Complete
                    </Button>
                  )}
                </>
              )}
              
              {item.status === 'completed' && (
                <View style={{ 
                  flex: 1, 
                  backgroundColor: `${COLORS.success}20`, 
                  borderRadius: 8, 
                  padding: SPACING.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon name="celebration" size={16} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.bodySmall, { marginLeft: 4, color: COLORS.success, fontWeight: '600' }]}>
                    Completed on {new Date(item.completedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
      }}
    >
      {filterOptions.map((filter) => (
        <Chip
          key={filter.key}
          selected={selectedFilter === filter.key}
          onPress={() => {
            setSelectedFilter(filter.key);
            Vibration.vibrate(30);
          }}
          icon={filter.icon}
          style={{
            marginRight: SPACING.sm,
            backgroundColor: selectedFilter === filter.key ? COLORS.primary : COLORS.surface,
          }}
          textStyle={{
            color: selectedFilter === filter.key ? '#fff' : COLORS.text,
            fontWeight: selectedFilter === filter.key ? '600' : 'normal',
          }}
        >
          {filter.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderNewGoalModal = () => (
    <Portal>
      <Modal
        visible={showNewGoalModal}
        onDismiss={() => setShowNewGoalModal(false)}
        contentContainerStyle={{
          backgroundColor: COLORS.surface,
          margin: SPACING.md,
          borderRadius: 16,
          maxHeight: height * 0.8,
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView style={{ padding: SPACING.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
              <Text style={TEXT_STYLES.h3}>Create New Goal 🚀</Text>
              <IconButton
                icon="close"
                onPress={() => setShowNewGoalModal(false)}
                size={24}
              />
            </View>
            
            {/* Goal Type Selection */}
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Goal Type</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg }}>
              {goalTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  onPress={() => setSelectedGoalType(type.key)}
                  style={{
                    flex: 1,
                    minWidth: '48%',
                    margin: '1%',
                  }}
                >
                  <Surface
                    style={{
                      padding: SPACING.md,
                      borderRadius: 12,
                      backgroundColor: selectedGoalType === type.key ? `${type.color}20` : COLORS.background,
                      borderWidth: selectedGoalType === type.key ? 2 : 1,
                      borderColor: selectedGoalType === type.key ? type.color : '#e0e0e0',
                    }}
                  >
                    <View style={{ alignItems: 'center' }}>
                      <Icon name={type.icon} size={24} color={type.color} />
                      <Text style={[TEXT_STYLES.bodySmall, { fontWeight: '600', marginTop: 4 }]}>
                        {type.label}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: 2 }]}>
                        {type.description}
                      </Text>
                    </View>
                  </Surface>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Goal Title */}
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Goal Title</Text>
            <TextInput
              style={{
                backgroundColor: COLORS.background,
                borderRadius: 8,
                padding: SPACING.md,
                marginBottom: SPACING.md,
                borderWidth: 1,
                borderColor: '#e0e0e0',
              }}
              placeholder="e.g., Improve free kick accuracy"
              value={goalTitle}
              onChangeText={setGoalTitle}
            />
            
            {/* Goal Description */}
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Description</Text>
            <TextInput
              style={{
                backgroundColor: COLORS.background,
                borderRadius: 8,
                padding: SPACING.md,
                marginBottom: SPACING.md,
                textAlignVertical: 'top',
                minHeight: 80,
                borderWidth: 1,
                borderColor: '#e0e0e0',
              }}
              placeholder="Describe your goal in detail..."
              value={goalDescription}
              onChangeText={setGoalDescription}
              multiline
              numberOfLines={3}
            />
            
            {/* Target Value */}
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Target Value</Text>
            <TextInput
              style={{
                backgroundColor: COLORS.background,
                borderRadius: 8,
                padding: SPACING.md,
                marginBottom: SPACING.md,
                borderWidth: 1,
                borderColor: '#e0e0e0',
              }}
              placeholder="e.g., 85 (for 85% accuracy)"
              value={goalTargetValue}
              onChangeText={setGoalTargetValue}
              keyboardType="numeric"
            />
            
            {/* Deadline */}
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm }]}>Deadline (Optional)</Text>
            <TextInput
              style={{
                backgroundColor: COLORS.background,
                borderRadius: 8,
                padding: SPACING.md,
                marginBottom: SPACING.lg,
                borderWidth: 1,
                borderColor: '#e0e0e0',
              }}
              placeholder="YYYY-MM-DD"
              value={goalDeadline}
              onChangeText={setGoalDeadline}
            />
            
            {/* Action Buttons */}
            <View style={{ flexDirection: 'row' }}>
              <Button
                mode="outlined"
                onPress={() => setShowNewGoalModal(false)}
                style={{ flex: 1, marginRight: SPACING.sm }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateGoal}
                style={{ 
                  flex: 1, 
                  backgroundColor: goalTypes.find(t => t.key === selectedGoalType)?.color || COLORS.primary,
                }}
                disabled={!goalTitle.trim()}
              >
                Create Goal
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.xl,
    }}>
      <Icon name="flag" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginTop: SPACING.md }]}>
        No Goals Yet
      </Text>
      <Text style={[TEXT_STYLES.bodySmall, { textAlign: 'center', marginTop: SPACING.sm, marginBottom: SPACING.lg }]}>
        Set your first goal and start your journey to excellence! Every champion starts with a goal.
      </Text>
      <Button
        mode="contained"
        onPress={() => setShowNewGoalModal(true)}
        style={{
          backgroundColor: COLORS.primary,
        }}
        icon="add"
      >
        Create Your First Goal
      </Button>
    </View>
  );

  const renderMotivationalQuote = () => {
    const quotes = [
      { text: "A goal without a plan is just a wish", author: "Antoine de Saint-Exupéry" },
      { text: "Champions keep playing until they get it right", author: "Billie Jean King" },
      { text: "Success is where preparation and opportunity meet", author: "Bobby Unser" },
      { text: "The only impossible journey is the one you never begin", author: "Tony Robbins" },
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    return (
      <Card style={{
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        elevation: 2,
        borderRadius: 12,
      }}>
        <LinearGradient
          colors={[COLORS.accent, COLORS.accent + '80']}
          style={{
            borderRadius: 12,
            padding: SPACING.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Icon name="format-quote" size={20} color="#fff" />
            <Text style={[TEXT_STYLES.bodySmall, { color: '#fff', marginLeft: SPACING.sm }]}>
              Daily Motivation
            </Text>
          </View>
          <Text style={[TEXT_STYLES.body, { color: '#fff', fontStyle: 'italic', marginBottom: SPACING.sm }]}>
            "{randomQuote.text}"
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', textAlign: 'right' }]}>
            - {randomQuote.author}
          </Text>
        </LinearGradient>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      {renderHeader()}
      
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderMotivationalQuote()}
        
        {/* Search Bar */}
        <View style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm }}>
          <Searchbar
            placeholder="Search your goals..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            icon="search"
            clearIcon="close"
            style={{
              backgroundColor: COLORS.surface,
              elevation: 2,
            }}
          />
        </View>

        {renderFilterChips()}

        {/* Goals List */}
        {filteredGoals.length > 0 ? (
          <FlatList
            data={filteredGoals}
            keyExtractor={(item) => item.id}
            renderItem={renderGoalCard}
            scrollEnabled={false}
            contentContainerStyle={{
              paddingBottom: 100,
            }}
          />
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => setShowNewGoalModal(true)}
        color="#fff"
      />

      {renderNewGoalModal()}
    </View>
  );
};

export default PlayerGoals;
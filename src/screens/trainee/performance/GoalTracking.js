import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
  Animated,
  Vibration,
  Alert,
  Dimensions,
  TouchableOpacity,
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
  Text,
  Searchbar,
  Portal,
  Modal,
  TextInput,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const GoalTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, goals, progress } = useSelector(state => ({
    user: state.auth.user,
    goals: state.performance.goals || [],
    progress: state.performance.progress || {}
  }));

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'fitness',
    target: '',
    deadline: new Date(),
    priority: 'medium'
  });
  const [activeTab, setActiveTab] = useState('active');

  // Mock data for development
  const mockGoals = [
    {
      id: '1',
      title: 'Run 5K in 25 minutes',
      description: 'Improve cardiovascular endurance and speed',
      category: 'cardio',
      currentValue: 27.5,
      targetValue: 25,
      unit: 'minutes',
      progress: 75,
      deadline: '2024-12-31',
      priority: 'high',
      status: 'active',
      streak: 12,
      completedSessions: 15,
      totalSessions: 20,
      milestones: [
        { value: 30, achieved: true, date: '2024-08-01' },
        { value: 28, achieved: true, date: '2024-08-15' },
        { value: 26, achieved: false, target: '2024-09-15' },
        { value: 25, achieved: false, target: '2024-12-31' }
      ]
    },
    {
      id: '2',
      title: 'Bench Press 100kg',
      description: 'Increase upper body strength',
      category: 'strength',
      currentValue: 85,
      targetValue: 100,
      unit: 'kg',
      progress: 85,
      deadline: '2024-11-30',
      priority: 'high',
      status: 'active',
      streak: 8,
      completedSessions: 12,
      totalSessions: 16,
      milestones: [
        { value: 70, achieved: true, date: '2024-07-01' },
        { value: 80, achieved: true, date: '2024-08-01' },
        { value: 90, achieved: false, target: '2024-09-30' },
        { value: 100, achieved: false, target: '2024-11-30' }
      ]
    },
    {
      id: '3',
      title: 'Lose 5kg Body Weight',
      description: 'Achieve optimal body composition',
      category: 'weight',
      currentValue: 3.2,
      targetValue: 5,
      unit: 'kg lost',
      progress: 64,
      deadline: '2024-10-31',
      priority: 'medium',
      status: 'active',
      streak: 25,
      completedSessions: 30,
      totalSessions: 40,
      milestones: [
        { value: 2, achieved: true, date: '2024-07-15' },
        { value: 3, achieved: true, date: '2024-08-15' },
        { value: 4, achieved: false, target: '2024-09-30' },
        { value: 5, achieved: false, target: '2024-10-31' }
      ]
    },
    {
      id: '4',
      title: 'Complete Marathon',
      description: 'Finish first marathon under 4 hours',
      category: 'endurance',
      currentValue: 0,
      targetValue: 1,
      unit: 'completed',
      progress: 45,
      deadline: '2025-03-15',
      priority: 'high',
      status: 'active',
      streak: 5,
      completedSessions: 25,
      totalSessions: 50,
      milestones: [
        { value: '10K', achieved: true, date: '2024-07-01' },
        { value: '21K', achieved: true, date: '2024-08-01' },
        { value: '30K', achieved: false, target: '2024-10-01' },
        { value: '42K', achieved: false, target: '2025-03-15' }
      ]
    }
  ];

  useEffect(() => {
    initializeScreen();
    startAnimations();
    startPulseAnimation();
  }, []);

  const initializeScreen = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      console.error('Error loading goals:', error);
      setLoading(false);
    }
  };

  const startAnimations = () => {
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
      })
    ]).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleAddGoal = () => {
    Vibration.vibrate(50);
    Alert.alert(
      '🎯 Goal Creation',
      'Goal creation feature is in development! You\'ll soon be able to set and track custom fitness goals.',
      [{ text: 'Got it! 💪', style: 'default' }]
    );
  };

  const handleGoalPress = (goal) => {
    Vibration.vibrate(30);
    setSelectedGoal(goal);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cardio': return 'directions-run';
      case 'strength': return 'fitness-center';
      case 'weight': return 'monitor-weight';
      case 'endurance': return 'timer';
      case 'flexibility': return 'accessibility';
      default: return 'flag';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'cardio': return COLORS.error;
      case 'strength': return COLORS.primary;
      case 'weight': return COLORS.secondary;
      case 'endurance': return '#FF9800';
      case 'flexibility': return '#9C27B0';
      default: return COLORS.primary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return '#FF9800';
      case 'low': return COLORS.success;
      default: return COLORS.primary;
    }
  };

  const formatDeadline = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return `${Math.ceil(diffDays / 30)} months left`;
  };

  const filteredGoals = mockGoals.filter(goal =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeTab === 'all' || goal.status === activeTab)
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.lg,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg,
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.h1, { color: 'white', marginBottom: SPACING.xs }]}>
              🎯 My Goals
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
              Track your progress and achieve greatness!
            </Text>
          </View>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Avatar.Text
              size={50}
              label={user?.name?.charAt(0) || 'U'}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
          </Animated.View>
        </View>

        {/* Stats Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: SPACING.lg }}
          contentContainerStyle={{ paddingRight: SPACING.lg }}
        >
          <Surface style={{
            padding: SPACING.md,
            borderRadius: 12,
            marginRight: SPACING.md,
            backgroundColor: 'rgba(255,255,255,0.15)',
            minWidth: 120
          }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center' }]}>
              {mockGoals.filter(g => g.status === 'active').length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', textAlign: 'center' }]}>
              Active Goals
            </Text>
          </Surface>

          <Surface style={{
            padding: SPACING.md,
            borderRadius: 12,
            marginRight: SPACING.md,
            backgroundColor: 'rgba(255,255,255,0.15)',
            minWidth: 120
          }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center' }]}>
              {Math.round(mockGoals.reduce((acc, goal) => acc + goal.progress, 0) / mockGoals.length)}%
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', textAlign: 'center' }]}>
              Avg Progress
            </Text>
          </Surface>

          <Surface style={{
            padding: SPACING.md,
            borderRadius: 12,
            marginRight: SPACING.md,
            backgroundColor: 'rgba(255,255,255,0.15)',
            minWidth: 120
          }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center' }]}>
              {Math.max(...mockGoals.map(g => g.streak))}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', textAlign: 'center' }]}>
              Best Streak
            </Text>
          </Surface>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={{ padding: SPACING.lg, paddingBottom: SPACING.md }}>
      <Searchbar
        placeholder="Search your goals..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ marginBottom: SPACING.md }}
        iconColor={COLORS.primary}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: SPACING.lg }}
      >
        {['all', 'active', 'completed', 'paused'].map((tab) => (
          <Chip
            key={tab}
            selected={activeTab === tab}
            onPress={() => setActiveTab(tab)}
            style={{ marginRight: SPACING.sm }}
            textStyle={{ textTransform: 'capitalize' }}
          >
            {tab} ({tab === 'all' ? mockGoals.length : mockGoals.filter(g => g.status === tab).length})
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderGoalCard = (goal) => (
    <Animated.View
      key={goal.id}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.lg
      }}
    >
      <Card
        style={{
          marginHorizontal: SPACING.lg,
          elevation: 4,
        }}
        onPress={() => handleGoalPress(goal)}
      >
        <Card.Content style={{ padding: SPACING.lg }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md }}>
            <Surface
              style={{
                padding: SPACING.sm,
                borderRadius: 8,
                backgroundColor: getCategoryColor(goal.category),
                marginRight: SPACING.md
              }}
            >
              <Icon name={getCategoryIcon(goal.category)} size={24} color="white" />
            </Surface>
            
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[TEXT_STYLES.h3, { flex: 1, marginRight: SPACING.sm }]}>
                  {goal.title}
                </Text>
                <Chip
                  compact
                  textStyle={{ fontSize: 10, color: getPriorityColor(goal.priority) }}
                  style={{
                    backgroundColor: `${getPriorityColor(goal.priority)}20`,
                    height: 24
                  }}
                >
                  {goal.priority.toUpperCase()}
                </Chip>
              </View>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: SPACING.xs }]}>
                {goal.description}
              </Text>
            </View>
          </View>

          {/* Progress Section */}
          <View style={{ marginBottom: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs }}>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                Progress: {goal.progress}%
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {goal.currentValue} / {goal.targetValue} {goal.unit}
              </Text>
            </View>
            <ProgressBar
              progress={goal.progress / 100}
              color={getCategoryColor(goal.category)}
              style={{ height: 8, borderRadius: 4 }}
            />
          </View>

          {/* Stats Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="local-fire-department" size={16} color={COLORS.error} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, fontWeight: '600', color: COLORS.error }]}>
                {goal.streak} day streak
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="check-circle-outline" size={16} color={COLORS.success} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                {goal.completedSessions}/{goal.totalSessions} sessions
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="schedule" size={16} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: COLORS.primary }]}>
                {formatDeadline(goal.deadline)}
              </Text>
            </View>
          </View>

          {/* Milestones */}
          <View>
            <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
              Milestones
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {goal.milestones.map((milestone, index) => (
                <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                  <Surface
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: milestone.achieved ? COLORS.success : COLORS.background,
                      borderWidth: 2,
                      borderColor: milestone.achieved ? COLORS.success : COLORS.border
                    }}
                  >
                    <Icon
                      name={milestone.achieved ? "check" : "radio-button-unchecked"}
                      size={16}
                      color={milestone.achieved ? 'white' : COLORS.textSecondary}
                    />
                  </Surface>
                  <Text style={[TEXT_STYLES.caption, {
                    marginTop: SPACING.xs,
                    textAlign: 'center',
                    color: milestone.achieved ? COLORS.success : COLORS.textSecondary
                  }]}>
                    {milestone.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md }}>
            <Button
              mode="outlined"
              compact
              onPress={() => Alert.alert('📊 Analytics', 'Detailed analytics coming soon!')}
              style={{ flex: 1, marginRight: SPACING.sm }}
            >
              View Details
            </Button>
            <Button
              mode="contained"
              compact
              onPress={() => Alert.alert('📝 Update Progress', 'Progress update feature in development!')}
              style={{ flex: 1, marginLeft: SPACING.sm }}
              buttonColor={getCategoryColor(goal.category)}
            >
              Update Progress
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.xxl,
      paddingHorizontal: SPACING.lg
    }}>
      <Icon name="flag" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h2, { marginTop: SPACING.lg, textAlign: 'center' }]}>
        No Goals Found
      </Text>
      <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm }]}>
        {searchQuery ? 'Try adjusting your search terms' : 'Set your first goal and start your fitness journey!'}
      </Text>
      {!searchQuery && (
        <Button
          mode="contained"
          onPress={handleAddGoal}
          style={{ marginTop: SPACING.lg }}
          buttonColor={COLORS.primary}
        >
          Set Your First Goal 🎯
        </Button>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <Icon name="flag" size={50} color={COLORS.primary} />
        <Text style={[TEXT_STYLES.body, { marginTop: SPACING.md, color: COLORS.textSecondary }]}>
          Loading your goals...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.background}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderSearchAndFilters()}
        
        {filteredGoals.length > 0 ? (
          filteredGoals.map(renderGoalCard)
        ) : (
          renderEmptyState()
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          right: SPACING.lg,
          bottom: SPACING.lg,
          backgroundColor: COLORS.primary,
        }}
        onPress={handleAddGoal}
      />
    </View>
  );
};

export default GoalTracking;
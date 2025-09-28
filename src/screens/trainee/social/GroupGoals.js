import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  Vibration,
  FlatList,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
  ProgressBar,
  Badge,
  TextInput,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
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
  accent: '#FF6B6B',
  teamBlue: '#2196F3',
  teamGreen: '#4CAF50',
  teamPurple: '#9C27B0',
  teamOrange: '#FF5722',
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

const GroupGoals = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-goals');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'fitness',
    target: '',
    duration: 30,
    privacy: 'public',
    maxMembers: 10,
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Mock user stats
  const [userStats, setUserStats] = useState({
    activeGoals: 3,
    completedGoals: 7,
    totalPoints: 1850,
    currentStreak: 12,
    teamContributions: 25,
    achievements: 8,
  });

  // Mock group goals data
  const [groupGoals, setGroupGoals] = useState([
    {
      id: 1,
      title: 'Summer Fitness Challenge 💪',
      description: 'Get beach-ready together! 30 days of consistent workouts and healthy eating.',
      category: 'fitness',
      creator: 'Sarah M.',
      creatorAvatar: 'https://picsum.photos/50/50?random=1',
      target: 'Complete 30 workouts in 30 days',
      targetValue: 30,
      currentValue: 18,
      progress: 0.6,
      members: [
        { id: 1, name: 'You', avatar: 'https://picsum.photos/40/40?random=user', contribution: 6 },
        { id: 2, name: 'Mike R.', avatar: 'https://picsum.photos/40/40?random=2', contribution: 5 },
        { id: 3, name: 'Emma K.', avatar: 'https://picsum.photos/40/40?random=3', contribution: 4 },
        { id: 4, name: 'John D.', avatar: 'https://picsum.photos/40/40?random=4', contribution: 3 },
      ],
      maxMembers: 8,
      startDate: '2025-08-01',
      endDate: '2025-08-30',
      status: 'active',
      joined: true,
      privacy: 'public',
      teamColor: COLORS.teamBlue,
      milestones: [
        { value: 10, reached: true, reward: 'Team Badge' },
        { value: 20, reached: false, reward: 'Bonus Points' },
        { value: 30, reached: false, reward: 'Championship Trophy' },
      ],
      recentActivity: [
        { member: 'Mike R.', action: 'completed morning workout', time: '2h ago' },
        { member: 'You', action: 'logged 5km run', time: '4h ago' },
        { member: 'Emma K.', action: 'hit daily step goal', time: '6h ago' },
      ],
    },
    {
      id: 2,
      title: 'Healthy Habits Squad 🥗',
      description: 'Building sustainable healthy habits one day at a time.',
      category: 'nutrition',
      creator: 'Alex P.',
      creatorAvatar: 'https://picsum.photos/50/50?random=5',
      target: 'Log healthy meals for 21 days',
      targetValue: 21,
      currentValue: 8,
      progress: 0.38,
      members: [
        { id: 5, name: 'Lisa W.', avatar: 'https://picsum.photos/40/40?random=6', contribution: 3 },
        { id: 6, name: 'Tom B.', avatar: 'https://picsum.photos/40/40?random=7', contribution: 2 },
        { id: 7, name: 'Anna S.', avatar: 'https://picsum.photos/40/40?random=8', contribution: 2 },
        { id: 8, name: 'Chris M.', avatar: 'https://picsum.photos/40/40?random=9', contribution: 1 },
      ],
      maxMembers: 6,
      startDate: '2025-08-20',
      endDate: '2025-09-10',
      status: 'active',
      joined: false,
      privacy: 'public',
      teamColor: COLORS.teamGreen,
      milestones: [
        { value: 7, reached: true, reward: 'Nutrition Badge' },
        { value: 14, reached: false, reward: 'Healthy Chef Title' },
        { value: 21, reached: false, reward: 'Wellness Warrior Badge' },
      ],
      recentActivity: [
        { member: 'Lisa W.', action: 'shared healthy recipe', time: '1h ago' },
        { member: 'Tom B.', action: 'logged breakfast', time: '3h ago' },
      ],
    },
    {
      id: 3,
      title: 'Morning Warriors ☀️',
      description: 'Early birds getting fit together! 6 AM workout sessions.',
      category: 'routine',
      creator: 'Maria G.',
      creatorAvatar: 'https://picsum.photos/50/50?random=10',
      target: 'Attend 20 morning sessions',
      targetValue: 20,
      currentValue: 15,
      progress: 0.75,
      members: [
        { id: 9, name: 'You', avatar: 'https://picsum.photos/40/40?random=user', contribution: 8 },
        { id: 10, name: 'Jake L.', avatar: 'https://picsum.photos/40/40?random=11', contribution: 4 },
        { id: 11, name: 'Sophie T.', avatar: 'https://picsum.photos/40/40?random=12', contribution: 3 },
      ],
      maxMembers: 5,
      startDate: '2025-08-15',
      endDate: '2025-09-15',
      status: 'active',
      joined: true,
      privacy: 'private',
      teamColor: COLORS.teamOrange,
      milestones: [
        { value: 5, reached: true, reward: 'Early Bird Badge' },
        { value: 10, reached: true, reward: 'Morning Champion' },
        { value: 20, reached: false, reward: 'Sunrise Legend' },
      ],
      recentActivity: [
        { member: 'You', action: 'completed 6 AM HIIT session', time: '12h ago' },
        { member: 'Sophie T.', action: 'checked in for morning yoga', time: '14h ago' },
      ],
    },
    {
      id: 4,
      title: 'Step Challenge Masters 👟',
      description: 'Walking our way to fitness! Daily step goals and friendly competition.',
      category: 'cardio',
      creator: 'David H.',
      creatorAvatar: 'https://picsum.photos/50/50?random=13',
      target: 'Achieve 300,000 total steps',
      targetValue: 300000,
      currentValue: 287500,
      progress: 0.96,
      members: [
        { id: 12, name: 'Rachel K.', avatar: 'https://picsum.photos/40/40?random=14', contribution: 95000 },
        { id: 13, name: 'Mark T.', avatar: 'https://picsum.photos/40/40?random=15', contribution: 87500 },
        { id: 14, name: 'Nina P.', avatar: 'https://picsum.photos/40/40?random=16', contribution: 65000 },
        { id: 15, name: 'Sam R.', avatar: 'https://picsum.photos/40/40?random=17', contribution: 40000 },
      ],
      maxMembers: 6,
      startDate: '2025-07-01',
      endDate: '2025-08-31',
      status: 'completing',
      joined: false,
      privacy: 'public',
      teamColor: COLORS.teamPurple,
      milestones: [
        { value: 100000, reached: true, reward: 'Walker Badge' },
        { value: 200000, reached: true, reward: 'Stepper Champion' },
        { value: 300000, reached: false, reward: 'Step Master Trophy' },
      ],
      recentActivity: [
        { member: 'Rachel K.', action: 'hit 15,000 steps today', time: '30min ago' },
        { member: 'Mark T.', action: 'completed evening walk', time: '2h ago' },
      ],
    },
  ]);

  const categories = [
    { id: 'all', label: 'All Goals', icon: 'flag', color: COLORS.primary },
    { id: 'fitness', label: 'Fitness', icon: 'fitness-center', color: COLORS.teamBlue },
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant', color: COLORS.teamGreen },
    { id: 'routine', label: 'Routine', icon: 'schedule', color: COLORS.teamOrange },
    { id: 'cardio', label: 'Cardio', icon: 'directions-run', color: COLORS.teamPurple },
    { id: 'strength', label: 'Strength', icon: 'fitness-center', color: COLORS.accent },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleJoinGoal = (goalId) => {
    Vibration.vibrate(100);
    setGroupGoals(goals => 
      goals.map(goal => 
        goal.id === goalId 
          ? { 
              ...goal, 
              joined: !goal.joined,
              members: goal.joined 
                ? goal.members.filter(m => m.name !== 'You')
                : [...goal.members, { id: Date.now(), name: 'You', avatar: 'https://picsum.photos/40/40?random=user', contribution: 0 }]
            }
          : goal
      )
    );
    Alert.alert(
      'Success! 🎉', 
      'You\'ve successfully joined the goal! Let\'s achieve it together!'
    );
  };

  const handleCreateGoal = () => {
    if (!newGoal.title.trim() || !newGoal.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const goalToCreate = {
      id: Date.now(),
      ...newGoal,
      creator: user?.name || 'You',
      creatorAvatar: user?.avatar || 'https://picsum.photos/50/50?random=user',
      targetValue: parseInt(newGoal.target) || 1,
      currentValue: 0,
      progress: 0,
      members: [
        { id: Date.now(), name: 'You', avatar: 'https://picsum.photos/40/40?random=user', contribution: 0 }
      ],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + (newGoal.duration * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      status: 'active',
      joined: true,
      teamColor: categories.find(c => c.id === newGoal.category)?.color || COLORS.primary,
      milestones: [],
      recentActivity: [],
    };

    setGroupGoals(goals => [goalToCreate, ...goals]);
    setNewGoal({
      title: '',
      description: '',
      category: 'fitness',
      target: '',
      duration: 30,
      privacy: 'public',
      maxMembers: 10,
    });
    setShowCreateModal(false);
    Alert.alert('Success! 🎯', 'Your group goal has been created! Invite friends to join.');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'completing': return COLORS.warning;
      case 'completed': return COLORS.textSecondary;
      default: return COLORS.primary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completing': return 'Almost Done!';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.lg,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
          <View>
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: SPACING.xs }]}>
              Group Goals 🎯
            </Text>
            <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.8)' }]}>
              Achieve more together
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Invitations feature is under development')}
            style={{ position: 'relative' }}
          >
            <Icon name="group-add" size={24} color="white" />
            <Badge
              size={16}
              style={{ position: 'absolute', top: -8, right: -8, backgroundColor: COLORS.accent }}
            >
              2
            </Badge>
          </TouchableOpacity>
        </View>
        
        {/* User Stats Row */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Surface style={{ borderRadius: 12, padding: SPACING.md, backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>{userStats.activeGoals}</Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Active</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>{userStats.completedGoals}</Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Completed</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>{userStats.totalPoints}</Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Points</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>{userStats.currentStreak}</Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Streak</Text>
              </View>
            </View>
          </Surface>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <Surface style={{ elevation: 2, backgroundColor: 'white' }}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}
      >
        {[
          { id: 'my-goals', label: 'My Goals', icon: 'person', badge: userStats.activeGoals },
          { id: 'discover', label: 'Discover', icon: 'explore', badge: null },
          { id: 'trending', label: 'Trending', icon: 'trending-up', badge: null },
          { id: 'completed', label: 'Completed', icon: 'check-circle', badge: null },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              marginRight: SPACING.sm,
              borderRadius: 20,
              backgroundColor: activeTab === tab.id ? COLORS.primary : 'transparent',
              position: 'relative',
            }}
          >
            <Icon 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.id ? 'white' : COLORS.textSecondary} 
            />
            <Text style={[
              TEXT_STYLES.bodySmall,
              { 
                marginLeft: SPACING.xs,
                color: activeTab === tab.id ? 'white' : COLORS.textSecondary,
                fontWeight: activeTab === tab.id ? '600' : 'normal',
              }
            ]}>
              {tab.label}
            </Text>
            {tab.badge && (
              <Badge
                size={16}
                style={{ 
                  marginLeft: SPACING.xs, 
                  backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : COLORS.accent 
                }}
              >
                {tab.badge}
              </Badge>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  const renderCategoryFilter = () => (
    <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            icon={() => <Icon name={category.icon} size={16} color={
              selectedCategory === category.id ? 'white' : category.color
            } />}
            style={{
              marginRight: SPACING.sm,
              backgroundColor: selectedCategory === category.id 
                ? category.color 
                : 'rgba(255,255,255,0.9)',
            }}
            textStyle={{
              color: selectedCategory === category.id ? 'white' : category.color,
              fontWeight: '600',
            }}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderGoalCard = (goal) => (
    <Card key={goal.id} style={{ marginBottom: SPACING.md, elevation: 3 }}>
      <View style={{ position: 'relative' }}>
        <LinearGradient
          colors={[goal.teamColor, `${goal.teamColor}80`]}
          style={{ height: 100, justifyContent: 'center', alignItems: 'center', position: 'relative' }}
        >
          <Icon name={categories.find(c => c.id === goal.category)?.icon || 'flag'} size={32} color="white" />
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)', marginTop: SPACING.xs, textTransform: 'uppercase', fontWeight: '600' }]}>
            {goal.category}
          </Text>
          
          <Chip
            compact
            style={{
              position: 'absolute',
              top: SPACING.sm,
              right: SPACING.sm,
              backgroundColor: getStatusColor(goal.status),
            }}
            textStyle={{ color: 'white', fontSize: 10, fontWeight: '600' }}
          >
            {getStatusLabel(goal.status)}
          </Chip>

          {goal.joined && (
            <Chip
              compact
              style={{
                position: 'absolute',
                top: SPACING.sm,
                left: SPACING.sm,
                backgroundColor: 'rgba(255,255,255,0.2)',
              }}
              textStyle={{ color: 'white', fontSize: 10, fontWeight: '600' }}
            >
              Member ✓
            </Chip>
          )}

          {goal.privacy === 'private' && (
            <Icon 
              name="lock" 
              size={16} 
              color="rgba(255,255,255,0.8)"
              style={{ position: 'absolute', bottom: SPACING.sm, left: SPACING.sm }}
            />
          )}
        </LinearGradient>
      </View>
      
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
          <Avatar.Image size={30} source={{ uri: goal.creatorAvatar }} style={{ marginRight: SPACING.sm }} />
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.xs }]}>{goal.title}</Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Created by {goal.creator}
            </Text>
          </View>
        </View>
        
        <Text style={[TEXT_STYLES.bodySmall, { marginBottom: SPACING.md }]}>{goal.description}</Text>
        
        {/* Progress Section */}
        <View style={{ marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
            <Text style={[TEXT_STYLES.bodySmall, { fontWeight: '600' }]}>{goal.target}</Text>
            <Text style={[TEXT_STYLES.bodySmall, { fontWeight: '600' }]}>
              {Math.round(goal.progress * 100)}%
            </Text>
          </View>
          <ProgressBar 
            progress={goal.progress} 
            color={goal.teamColor}
            style={{ height: 8, borderRadius: 4 }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {goal.members.length}/{goal.maxMembers} members
            </Text>
          </View>
        </View>

        {/* Team Members */}
        <View style={{ marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Icon name="group" size={16} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.bodySmall, { marginLeft: SPACING.xs, fontWeight: '600' }]}>
              Team Members
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {goal.members.slice(0, 4).map((member, index) => (
              <Avatar.Image
                key={member.id}
                size={32}
                source={{ uri: member.avatar }}
                style={{ 
                  marginLeft: index > 0 ? -8 : 0,
                  borderWidth: 2,
                  borderColor: 'white',
                }}
              />
            ))}
            {goal.members.length > 4 && (
              <Surface style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLORS.background,
                marginLeft: -8,
                borderWidth: 2,
                borderColor: 'white',
              }}>
                <Text style={[TEXT_STYLES.caption, { fontWeight: '600' }]}>
                  +{goal.members.length - 4}
                </Text>
              </Surface>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedGoal(goal);
              setShowDetailsModal(true);
            }}
            style={{ borderColor: goal.teamColor, flex: 1, marginRight: SPACING.sm }}
            labelStyle={{ color: goal.teamColor }}
          >
            View Details
          </Button>
          
          {!goal.joined && goal.members.length < goal.maxMembers && (
            <Button
              mode="contained"
              onPress={() => handleJoinGoal(goal.id)}
              style={{ backgroundColor: goal.teamColor, flex: 1 }}
            >
              Join Goal
            </Button>
          )}
          
          {goal.joined && (
            <IconButton
              icon="chat"
              size={24}
              iconColor={goal.teamColor}
              onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Team chat feature is under development')}
              style={{ marginLeft: SPACING.xs }}
            />
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderContent = () => {
    let filteredGoals = groupGoals;
    
    // Filter by tab
    if (activeTab === 'my-goals') {
      filteredGoals = groupGoals.filter(goal => goal.joined);
    } else if (activeTab === 'completed') {
      filteredGoals = groupGoals.filter(goal => goal.status === 'completed');
    } else if (activeTab === 'trending') {
      filteredGoals = groupGoals.sort((a, b) => b.members.length - a.members.length);
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.category === selectedCategory);
    }

    return (
      <View>
        {renderCategoryFilter()}
        <View style={{ paddingHorizontal: SPACING.md }}>
          {filteredGoals.map(renderGoalCard)}
          
          {filteredGoals.length === 0 && (
            <Card style={{ marginTop: SPACING.lg, elevation: 2 }}>
              <Card.Content style={{ padding: SPACING.lg, alignItems: 'center' }}>
                <Icon name="flag" size={80} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginVertical: SPACING.md }]}>
                  No Goals Found
                </Text>
                <Text style={[TEXT_STYLES.bodySmall, { textAlign: 'center', marginBottom: SPACING.lg }]}>
                  {activeTab === 'my-goals' 
                    ? "You haven't joined any goals yet. Create or join one to get started!"
                    : "No goals match your current filters. Try adjusting your search criteria."
                  }
                </Text>
                <Button
                  mode="contained"
                  onPress={() => setShowCreateModal(true)}
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Create New Goal
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {renderHeader()}
      {renderTabBar()}
      
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
          <Searchbar
            placeholder="Search group goals..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ elevation: 2 }}
            iconColor={COLORS.primary}
          />
        </View>
        
        <ScrollView
          style={{ flex: 1 }}
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
          {renderContent()}
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      <FAB
        icon="add"
        label="Create Goal"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => setShowCreateModal(true)}
      />

      {/* Create Goal Modal */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.lg,
            borderRadius: 12,
            maxHeight: '90%',
          }}
        >
          <ScrollView style={{ maxHeight: height * 0.8 }}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={{ padding: SPACING.lg, alignItems: 'center', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            >
              <Icon name="add-task" size={40} color="white" />
              <Text style={[TEXT_STYLES.h3, { color: 'white', marginTop: SPACING.sm }]}>
                Create Group Goal
              </Text>
              <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.8)', textAlign: 'center' }]}>
                Start a new challenge and invite others to join
              </Text>
            </LinearGradient>
            
            <View style={{ padding: SPACING.lg }}>
              <TextInput
                label="Goal Title *"
                value={newGoal.title}
                onChangeText={(text) => setNewGoal({...newGoal, title: text})}
                style={{ marginBottom: SPACING.md }}
                mode="outlined"
                activeOutlineColor={COLORS.primary}
                placeholder="e.g., Summer Fitness Challenge"
              />
              
              <TextInput
                label="Description *"
                value={newGoal.description}
                onChangeText={(text) => setNewGoal({...newGoal, description: text})}
                style={{ marginBottom: SPACING.md }}
                mode="outlined"
                activeOutlineColor={COLORS.primary}
                multiline
                numberOfLines={3}
                placeholder="Describe what this goal is about..."
              />

              <View style={{ marginBottom: SPACING.md }}>
                <Text style={[TEXT_STYLES.bodySmall, { marginBottom: SPACING.sm, fontWeight: '600' }]}>
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.slice(1).map((category) => (
                    <Chip
                      key={category.id}
                      selected={newGoal.category === category.id}
                      onPress={() => setNewGoal({...newGoal, category: category.id})}
                      icon={() => <Icon name={category.icon} size={16} color={
                        newGoal.category === category.id ? 'white' : category.color
                      } />}
                      style={{
                        marginRight: SPACING.sm,
                        backgroundColor: newGoal.category === category.id 
                          ? category.color 
                          : 'rgba(255,255,255,0.9)',
                      }}
                      textStyle={{
                        color: newGoal.category === category.id ? 'white' : category.color,
                        fontWeight: '600',
                      }}
                    >
                      {category.label}
                    </Chip>
                  ))}
                </ScrollView>
              </View>

              <TextInput
                label="Target/Objective"
                value={newGoal.target}
                onChangeText={(text) => setNewGoal({...newGoal, target: text})}
                style={{ marginBottom: SPACING.md }}
                mode="outlined"
                activeOutlineColor={COLORS.primary}
                placeholder="e.g., Complete 30 workouts"
              />

              <View style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
                <View style={{ flex: 1, marginRight: SPACING.sm }}>
                  <TextInput
                    label="Duration (days)"
                    value={newGoal.duration.toString()}
                    onChangeText={(text) => setNewGoal({...newGoal, duration: parseInt(text) || 30})}
                    mode="outlined"
                    activeOutlineColor={COLORS.primary}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                  <TextInput
                    label="Max Members"
                    value={newGoal.maxMembers.toString()}
                    onChangeText={(text) => setNewGoal({...newGoal, maxMembers: parseInt(text) || 10})}
                    mode="outlined"
                    activeOutlineColor={COLORS.primary}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={{ marginBottom: SPACING.lg }}>
                <Text style={[TEXT_STYLES.bodySmall, { marginBottom: SPACING.sm, fontWeight: '600' }]}>
                  Privacy Setting
                </Text>
                <View style={{ flexDirection: 'row' }}>
                  <Chip
                    selected={newGoal.privacy === 'public'}
                    onPress={() => setNewGoal({...newGoal, privacy: 'public'})}
                    icon={() => <Icon name="public" size={16} color={
                      newGoal.privacy === 'public' ? 'white' : COLORS.primary
                    } />}
                    style={{
                      marginRight: SPACING.sm,
                      backgroundColor: newGoal.privacy === 'public' 
                        ? COLORS.primary 
                        : 'rgba(255,255,255,0.9)',
                    }}
                    textStyle={{
                      color: newGoal.privacy === 'public' ? 'white' : COLORS.primary,
                      fontWeight: '600',
                    }}
                  >
                    Public
                  </Chip>
                  <Chip
                    selected={newGoal.privacy === 'private'}
                    onPress={() => setNewGoal({...newGoal, privacy: 'private'})}
                    icon={() => <Icon name="lock" size={16} color={
                      newGoal.privacy === 'private' ? 'white' : COLORS.textSecondary
                    } />}
                    style={{
                      backgroundColor: newGoal.privacy === 'private' 
                        ? COLORS.textSecondary 
                        : 'rgba(255,255,255,0.9)',
                    }}
                    textStyle={{
                      color: newGoal.privacy === 'private' ? 'white' : COLORS.textSecondary,
                      fontWeight: '600',
                    }}
                  >
                    Private
                  </Chip>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button 
                  onPress={() => setShowCreateModal(false)} 
                  style={{ flex: 1, marginRight: SPACING.sm }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreateGoal}
                  style={{ backgroundColor: COLORS.primary, flex: 1 }}
                >
                  Create Goal
                </Button>
              </View>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Goal Details Modal */}
      <Portal>
        <Modal
          visible={showDetailsModal}
          onDismiss={() => setShowDetailsModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.lg,
            borderRadius: 12,
            maxHeight: '85%',
          }}
        >
          {selectedGoal && (
            <ScrollView style={{ maxHeight: height * 0.75 }}>
              <LinearGradient
                colors={[selectedGoal.teamColor, `${selectedGoal.teamColor}80`]}
                style={{ height: 150, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              >
                <Icon 
                  name={categories.find(c => c.id === selectedGoal.category)?.icon || 'flag'} 
                  size={50} 
                  color="white" 
                />
                <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center', marginTop: SPACING.sm }]}>
                  {selectedGoal.title}
                </Text>
                <Chip
                  compact
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginTop: SPACING.sm }}
                  textStyle={{ color: 'white', fontSize: 12, fontWeight: '600' }}
                >
                  {getStatusLabel(selectedGoal.status)}
                </Chip>
              </LinearGradient>
              
              <View style={{ padding: SPACING.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                  <Avatar.Image size={40} source={{ uri: selectedGoal.creatorAvatar }} />
                  <View style={{ marginLeft: SPACING.sm }}>
                    <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                      Created by {selectedGoal.creator}
                    </Text>
                    <Text style={TEXT_STYLES.caption}>
                      {selectedGoal.startDate} - {selectedGoal.endDate}
                    </Text>
                  </View>
                </View>

                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg }]}>
                  {selectedGoal.description}
                </Text>
                
                {/* Progress Details */}
                <Card style={{ marginBottom: SPACING.lg, elevation: 1 }}>
                  <Card.Content style={{ padding: SPACING.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                      <Icon name="trending-up" size={20} color={selectedGoal.teamColor} />
                      <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>Progress</Text>
                    </View>
                    
                    <View style={{ marginBottom: SPACING.md }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
                        <Text style={TEXT_STYLES.bodySmall}>{selectedGoal.target}</Text>
                        <Text style={[TEXT_STYLES.bodySmall, { fontWeight: '600' }]}>
                          {Math.round(selectedGoal.progress * 100)}%
                        </Text>
                      </View>
                      <ProgressBar 
                        progress={selectedGoal.progress} 
                        color={selectedGoal.teamColor}
                        style={{ height: 8, borderRadius: 4 }}
                      />
                      <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.xs }]}>
                        {selectedGoal.currentValue.toLocaleString()} / {selectedGoal.targetValue.toLocaleString()}
                      </Text>
                    </div>

                    {/* Milestones */}
                    {selectedGoal.milestones.length > 0 && (
                      <View style={{ marginTop: SPACING.md }}>
                        <Text style={[TEXT_STYLES.bodySmall, { fontWeight: '600', marginBottom: SPACING.sm }]}>
                          Milestones
                        </Text>
                        {selectedGoal.milestones.map((milestone, index) => (
                          <View key={index} style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            marginBottom: SPACING.xs,
                            opacity: milestone.reached ? 1 : 0.6,
                          }}>
                            <Icon 
                              name={milestone.reached ? 'check-circle' : 'radio-button-unchecked'} 
                              size={16} 
                              color={milestone.reached ? COLORS.success : COLORS.textSecondary} 
                            />
                            <Text style={[TEXT_STYLES.bodySmall, { marginLeft: SPACING.sm, flex: 1 }]}>
                              {milestone.value.toLocaleString()} - {milestone.reward}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </Card.Content>
                </Card>

                {/* Team Members */}
                <Card style={{ marginBottom: SPACING.lg, elevation: 1 }}>
                  <Card.Content style={{ padding: SPACING.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                      <Icon name="group" size={20} color={selectedGoal.teamColor} />
                      <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
                        Team Members ({selectedGoal.members.length}/{selectedGoal.maxMembers})
                      </Text>
                    </View>
                    
                    {selectedGoal.members.map((member, index) => (
                      <View key={member.id} style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        marginBottom: SPACING.sm,
                        padding: SPACING.sm,
                        backgroundColor: index === 0 ? `${selectedGoal.teamColor}10` : 'transparent',
                        borderRadius: 8,
                      }}>
                        <Avatar.Image size={35} source={{ uri: member.avatar }} />
                        <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                          <Text style={[TEXT_STYLES.body, { fontWeight: member.name === 'You' ? '600' : 'normal' }]}>
                            {member.name}
                          </Text>
                          <Text style={TEXT_STYLES.caption}>
                            Contribution: {member.contribution.toLocaleString()}
                          </Text>
                        </View>
                        {index === 0 && (
                          <Icon name="star" size={20} color={selectedGoal.teamColor} />
                        )}
                      </View>
                    ))}
                  </Card.Content>
                </Card>

                {/* Recent Activity */}
                {selectedGoal.recentActivity.length > 0 && (
                  <Card style={{ marginBottom: SPACING.lg, elevation: 1 }}>
                    <Card.Content style={{ padding: SPACING.md }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                        <Icon name="history" size={20} color={selectedGoal.teamColor} />
                        <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>Recent Activity</Text>
                      </View>
                      
                      {selectedGoal.recentActivity.map((activity, index) => (
                        <View key={index} style={{ marginBottom: SPACING.sm }}>
                          <Text style={TEXT_STYLES.bodySmall}>
                            <Text style={{ fontWeight: '600' }}>{activity.member}</Text> {activity.action}
                          </Text>
                          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                            {activity.time}
                          </Text>
                        </View>
                      ))}
                    </Card.Content>
                  </Card>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Button onPress={() => setShowDetailsModal(false)} style={{ flex: 1, marginRight: SPACING.sm }}>
                    Close
                  </Button>
                  {!selectedGoal.joined && selectedGoal.members.length < selectedGoal.maxMembers && (
                    <Button
                      mode="contained"
                      onPress={() => {
                        handleJoinGoal(selectedGoal.id);
                        setShowDetailsModal(false);
                      }}
                      style={{ backgroundColor: selectedGoal.teamColor, flex: 1 }}
                    >
                      Join Goal
                    </Button>
                  )}
                  {selectedGoal.joined && (
                    <Button
                      mode="outlined"
                      onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Progress logging feature is under development')}
                      style={{ borderColor: selectedGoal.teamColor, flex: 1 }}
                      labelStyle={{ color: selectedGoal.teamColor }}
                    >
                      Log Progress
                    </Button>
                  )}
                </View>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

export default GroupGoals;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
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
  Searchbar,
  TextInput,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const PerformanceGoals = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { players, goals, loading } = useSelector(state => state.goals);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Animate screen entrance
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Load goals data
    loadGoalsData();
  }, []);

  const loadGoalsData = useCallback(async () => {
    try {
      // Dispatch actions to load goals data
      // dispatch(fetchGoals());
      // dispatch(fetchPlayers());
    } catch (error) {
      console.error('Error loading goals data:', error);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGoalsData();
    setRefreshing(false);
  }, [loadGoalsData]);

  // Mock data for demonstration
  const mockGoalCategories = [
    { value: 'all', label: 'All Goals', count: 42 },
    { value: 'fitness', label: 'Fitness', count: 15, icon: 'fitness-center' },
    { value: 'skills', label: 'Skills', count: 18, icon: 'sports-soccer' },
    { value: 'tactical', label: 'Tactical', count: 9, icon: 'psychology' },
    { value: 'mental', label: 'Mental', count: 8, icon: 'psychology-alt' },
  ];

  const mockStatusOptions = [
    { value: 'active', label: 'Active', count: 28, color: COLORS.primary },
    { value: 'completed', label: 'Completed', count: 12, color: COLORS.success },
    { value: 'overdue', label: 'Overdue', count: 2, color: COLORS.error },
  ];

  const mockGoals = [
    {
      id: 1,
      title: 'Improve Sprint Speed',
      description: 'Reduce 40m sprint time by 0.3 seconds',
      player: { id: 1, name: 'Alex Johnson', avatar: 'AJ', position: 'Forward' },
      category: 'fitness',
      priority: 'high',
      progress: 75,
      currentValue: 5.2,
      targetValue: 4.9,
      unit: 'seconds',
      deadline: '2024-09-15',
      status: 'active',
      streak: 12,
      milestones: [
        { id: 1, title: 'First Assessment', completed: true, date: '2024-08-01' },
        { id: 2, title: 'Mid-point Check', completed: true, date: '2024-08-15' },
        { id: 3, title: 'Final Assessment', completed: false, date: '2024-09-15' },
      ],
    },
    {
      id: 2,
      title: 'Master Ball Control',
      description: 'Complete advanced ball control drills with 90% accuracy',
      player: { id: 2, name: 'Maria Santos', avatar: 'MS', position: 'Midfielder' },
      category: 'skills',
      priority: 'medium',
      progress: 60,
      currentValue: 78,
      targetValue: 90,
      unit: '% accuracy',
      deadline: '2024-09-20',
      status: 'active',
      streak: 8,
      milestones: [
        { id: 1, title: 'Basic Drills', completed: true, date: '2024-07-20' },
        { id: 2, title: 'Intermediate Level', completed: true, date: '2024-08-10' },
        { id: 3, title: 'Advanced Level', completed: false, date: '2024-09-20' },
      ],
    },
    {
      id: 3,
      title: 'Defensive Positioning',
      description: 'Improve tactical awareness in defensive situations',
      player: { id: 3, name: 'David Chen', avatar: 'DC', position: 'Defender' },
      category: 'tactical',
      priority: 'high',
      progress: 40,
      currentValue: 6.5,
      targetValue: 8.5,
      unit: 'rating',
      deadline: '2024-10-01',
      status: 'active',
      streak: 5,
      milestones: [
        { id: 1, title: 'Video Analysis', completed: true, date: '2024-08-01' },
        { id: 2, title: 'Practice Sessions', completed: false, date: '2024-09-01' },
        { id: 3, title: 'Game Application', completed: false, date: '2024-10-01' },
      ],
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.primary;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'fitness': return 'fitness-center';
      case 'skills': return 'sports-soccer';
      case 'tactical': return 'psychology';
      case 'mental': return 'psychology-alt';
      default: return 'flag';
    }
  };

  const renderHeader = () => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          borderRadius: 12,
          margin: SPACING.medium,
          overflow: 'hidden',
        }}
      >
        <Card style={{ backgroundColor: 'transparent', elevation: 0 }}>
          <Card.Content style={{ padding: SPACING.large }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium }}>
              <Text style={[TEXT_STYLES.heading, { color: 'white' }]}>
                Performance Goals 🎯
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <IconButton
                  icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
                  iconColor="white"
                  size={24}
                  onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                />
                <IconButton
                  icon="filter-list"
                  iconColor="white"
                  size={24}
                  onPress={() => Alert.alert('Filters', 'Filter options coming soon')}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Total Goals</Text>
                <Text style={[TEXT_STYLES.title, { color: 'white', fontWeight: 'bold' }]}>42</Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Active</Text>
                <Text style={[TEXT_STYLES.title, { color: 'white', fontWeight: 'bold' }]}>28</Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Completed</Text>
                <Text style={[TEXT_STYLES.title, { color: COLORS.success, fontWeight: 'bold' }]}>12</Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>Success Rate</Text>
                <Text style={[TEXT_STYLES.title, { color: 'white', fontWeight: 'bold' }]}>85%</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </LinearGradient>
    </Animated.View>
  );

  const renderSearchAndFilters = () => (
    <View style={{ paddingHorizontal: SPACING.medium, marginBottom: SPACING.medium }}>
      <Searchbar
        placeholder="Search goals or players..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ marginBottom: SPACING.medium, elevation: 2 }}
        iconColor={COLORS.primary}
      />

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.small }}>
        <View style={{ flexDirection: 'row' }}>
          {mockGoalCategories.map((category) => (
            <TouchableOpacity
              key={category.value}
              onPress={() => setSelectedCategory(category.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: SPACING.medium,
                paddingVertical: SPACING.small,
                marginRight: SPACING.small,
                borderRadius: 20,
                backgroundColor: selectedCategory === category.value ? COLORS.primary : COLORS.background,
                borderWidth: 1,
                borderColor: selectedCategory === category.value ? COLORS.primary : COLORS.border,
              }}
            >
              {category.icon && (
                <Icon
                  name={category.icon}
                  size={16}
                  color={selectedCategory === category.value ? 'white' : COLORS.primary}
                  style={{ marginRight: SPACING.xsmall }}
                />
              )}
              <Text
                style={[
                  TEXT_STYLES.caption,
                  { color: selectedCategory === category.value ? 'white' : COLORS.primary }
                ]}
              >
                {category.label} ({category.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          {mockStatusOptions.map((status) => (
            <Chip
              key={status.value}
              mode={selectedStatus === status.value ? 'flat' : 'outlined'}
              selected={selectedStatus === status.value}
              onPress={() => setSelectedStatus(status.value)}
              style={{
                marginRight: SPACING.small,
                backgroundColor: selectedStatus === status.value ? status.color : 'transparent',
              }}
              textStyle={{
                color: selectedStatus === status.value ? 'white' : status.color,
              }}
            >
              {status.label} ({status.count})
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderGoalCard = (goal) => (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => navigation.navigate('GoalDetails', { goalId: goal.id })}
        activeOpacity={0.9}
      >
        <Card style={{
          margin: viewMode === 'grid' ? SPACING.small : SPACING.medium,
          marginBottom: SPACING.medium,
          elevation: 4,
          borderLeftWidth: 4,
          borderLeftColor: getPriorityColor(goal.priority),
        }}>
          <Card.Content style={{ padding: SPACING.medium }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.medium }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.subheading, { fontWeight: '600', marginBottom: SPACING.xsmall }]}>
                  {goal.title}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]} numberOfLines={2}>
                  {goal.description}
                </Text>
              </View>
              
              <View style={{ alignItems: 'flex-end' }}>
                <View
                  style={{
                    backgroundColor: getPriorityColor(goal.priority),
                    paddingHorizontal: SPACING.small,
                    paddingVertical: 2,
                    borderRadius: 10,
                    marginBottom: SPACING.xsmall,
                  }}
                >
                  <Text style={[TEXT_STYLES.caption, { color: 'white', fontSize: 10 }]}>
                    {goal.priority.toUpperCase()}
                  </Text>
                </View>
                
                {goal.streak > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="local-fire-department" size={14} color={COLORS.warning} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.warning, fontSize: 10 }]}>
                      {goal.streak} day streak
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Player Info */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.medium }}>
              <Avatar.Text
                size={32}
                label={goal.player.avatar}
                style={{ backgroundColor: COLORS.primary, marginRight: SPACING.small }}
                labelStyle={{ fontSize: 12 }}
              />
              <View>
                <Text style={[TEXT_STYLES.body, { fontWeight: '500' }]}>{goal.player.name}</Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>{goal.player.position}</Text>
              </View>
              
              <View style={{ marginLeft: 'auto', alignItems: 'center' }}>
                <Icon name={getCategoryIcon(goal.category)} size={24} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontSize: 10 }]}>
                  {goal.category}
                </Text>
              </View>
            </View>

            {/* Progress */}
            <View style={{ marginBottom: SPACING.medium }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xsmall }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Progress</Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontWeight: '600' }]}>
                  {goal.progress}%
                </Text>
              </View>
              <ProgressBar
                progress={goal.progress / 100}
                color={goal.progress >= 75 ? COLORS.success : goal.progress >= 50 ? COLORS.warning : COLORS.primary}
                style={{ height: 6, borderRadius: 3 }}
              />
            </View>

            {/* Current vs Target */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.medium }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Current</Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: COLORS.primary }]}>
                  {goal.currentValue} {goal.unit}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Icon name="arrow-forward" size={20} color={COLORS.textSecondary} />
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Target</Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: COLORS.success }]}>
                  {goal.targetValue} {goal.unit}
                </Text>
              </View>
            </View>

            {/* Milestones */}
            <View style={{ marginBottom: SPACING.medium }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.xsmall }]}>
                Milestones ({goal.milestones.filter(m => m.completed).length}/{goal.milestones.length})
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {goal.milestones.map((milestone, index) => (
                  <View key={milestone.id} style={{ alignItems: 'center', flex: 1 }}>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: milestone.completed ? COLORS.success : COLORS.border,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: SPACING.xsmall,
                      }}
                    >
                      {milestone.completed ? (
                        <Icon name="check" size={14} color="white" />
                      ) : (
                        <Text style={[TEXT_STYLES.caption, { color: 'white', fontSize: 10 }]}>
                          {index + 1}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[TEXT_STYLES.caption, {
                        color: milestone.completed ? COLORS.success : COLORS.textSecondary,
                        fontSize: 9,
                        textAlign: 'center',
                      }]}
                      numberOfLines={2}
                    >
                      {milestone.title}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Footer */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Due: {new Date(goal.deadline).toLocaleDateString()}
              </Text>
              
              <View style={{ flexDirection: 'row' }}>
                <IconButton
                  icon="edit"
                  size={20}
                  iconColor={COLORS.primary}
                  onPress={() => {
                    Alert.alert('Edit Goal', 'Goal editing feature coming soon');
                  }}
                />
                <IconButton
                  icon="trending-up"
                  size={20}
                  iconColor={COLORS.success}
                  onPress={() => navigation.navigate('GoalProgress', { goalId: goal.id })}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderGoalsList = () => {
    const filteredGoals = mockGoals.filter(goal => {
      const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          goal.player.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || goal.category === selectedCategory;
      const matchesStatus = goal.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    if (viewMode === 'grid') {
      return (
        <View style={{ paddingHorizontal: SPACING.small }}>
          {filteredGoals.map(goal => (
            <View key={goal.id} style={{ width: '100%' }}>
              {renderGoalCard(goal)}
            </View>
          ))}
        </View>
      );
    }

    return (
      <FlatList
        data={filteredGoals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderGoalCard(item)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
      <Icon name="flag" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.heading, { color: COLORS.textSecondary, marginTop: SPACING.medium }]}>
        No Goals Found
      </Text>
      <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.small }]}>
        Create your first performance goal to start tracking progress
      </Text>
      <Button
        mode="contained"
        onPress={() => setShowCreateModal(true)}
        style={{ marginTop: SPACING.large, backgroundColor: COLORS.primary }}
        icon="add"
      >
        Create Goal
      </Button>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.background}
          />
        }
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {renderHeader()}
        {renderSearchAndFilters()}
        
        {mockGoals.length > 0 ? renderGoalsList() : renderEmptyState()}
      </ScrollView>

      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Alert.alert(
            'Create New Goal',
            'Choose goal type',
            [
              { text: 'Individual Goal', onPress: () => navigation.navigate('CreateGoal', { type: 'individual' }) },
              { text: 'Team Goal', onPress: () => navigation.navigate('CreateGoal', { type: 'team' }) },
              { text: 'Quick Goal Template', onPress: () => navigation.navigate('GoalTemplates') },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      />
    </View>
  );
};

// Screen configuration for navigation
PerformanceGoals.navigationOptions = {
  title: 'Performance Goals',
  headerShown: true,
  headerStyle: {
    backgroundColor: COLORS.primary,
  },
  headerTintColor: 'white',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

export default PerformanceGoals;
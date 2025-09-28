import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
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
  TextInput,
  Portal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import your constants (adjust path as needed)
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const GoalTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, goals, clients } = useSelector(state => ({
    user: state.auth.user,
    goals: state.goals.list,
    clients: state.clients.list
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('my-goals'); // my-goals, client-goals, achievements
  const [fadeAnim] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalFilter, setGoalFilter] = useState('all'); // all, active, completed, overdue

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    loadGoalsData();
  }, [selectedTab]);

  const loadGoalsData = useCallback(() => {
    try {
      // Simulate API call - replace with actual goals fetch
      // dispatch(fetchGoalsData({ tab: selectedTab }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load goals data');
    }
  }, [selectedTab, dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGoalsData();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadGoalsData]);

  // Mock data - replace with actual data from Redux store
  const myGoals = [
    {
      id: 1,
      title: '💼 Reach 50 Active Clients',
      description: 'Build a strong client base for sustainable income',
      progress: 76,
      target: 50,
      current: 38,
      category: 'Business',
      deadline: '2025-12-31',
      priority: 'high',
      status: 'active'
    },
    {
      id: 2,
      title: '💰 Monthly Revenue $15K',
      description: 'Achieve consistent monthly revenue target',
      progress: 83,
      target: 15000,
      current: 12450,
      category: 'Financial',
      deadline: '2025-10-31',
      priority: 'high',
      status: 'active'
    },
    {
      id: 3,
      title: '⭐ 4.9 Average Rating',
      description: 'Maintain excellent client satisfaction',
      progress: 96,
      target: 4.9,
      current: 4.7,
      category: 'Quality',
      deadline: '2025-09-30',
      priority: 'medium',
      status: 'active'
    },
    {
      id: 4,
      title: '🎓 Get Advanced Certification',
      description: 'Complete advanced personal training certification',
      progress: 45,
      target: 100,
      current: 45,
      category: 'Education',
      deadline: '2025-11-15',
      priority: 'medium',
      status: 'active'
    }
  ];

  const clientGoals = [
    {
      id: 1,
      clientName: 'Sarah Johnson',
      clientAvatar: '👩‍💼',
      title: '🎯 Lose 20 lbs',
      progress: 65,
      target: 20,
      current: 13,
      deadline: '2025-12-01',
      status: 'on-track'
    },
    {
      id: 2,
      clientName: 'Mike Chen',
      clientAvatar: '👨‍💻',
      title: '💪 Bench Press 200 lbs',
      progress: 80,
      target: 200,
      current: 160,
      deadline: '2025-10-15',
      status: 'ahead'
    },
    {
      id: 3,
      clientName: 'Emma Davis',
      clientAvatar: '👩‍🎨',
      title: '🏃‍♀️ Run 5K in 25 min',
      progress: 40,
      target: 25,
      current: 31,
      deadline: '2025-09-30',
      status: 'behind'
    }
  ];

  const achievements = [
    {
      id: 1,
      title: '🏆 First 30 Clients',
      description: 'Reached your first major milestone!',
      date: '2025-07-15',
      category: 'Business'
    },
    {
      id: 2,
      title: '⭐ 100 Five-Star Reviews',
      description: 'Exceptional client satisfaction achieved',
      date: '2025-06-22',
      category: 'Quality'
    },
    {
      id: 3,
      title: '💰 $10K Month',
      description: 'First five-figure monthly revenue',
      date: '2025-05-08',
      category: 'Financial'
    }
  ];

  const tabs = [
    { key: 'my-goals', label: 'My Goals', icon: 'flag' },
    { key: 'client-goals', label: 'Client Goals', icon: 'people' },
    { key: 'achievements', label: 'Achievements', icon: 'jump-rope' }
  ];

  const goalFilters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'overdue', label: 'Overdue' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track': return COLORS.success;
      case 'ahead': return '#00BCD4';
      case 'behind': return COLORS.error;
      case 'completed': return COLORS.success;
      case 'overdue': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.primary;
    }
  };

  const renderMyGoalCard = (goal) => (
    <Animated.View
      key={goal.id}
      style={{
        opacity: fadeAnim,
        transform: [{
          translateX: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })
        }]
      }}
    >
      <Card style={styles.goalCard}>
        <TouchableOpacity
          onPress={() => setSelectedGoal(goal)}
          activeOpacity={0.7}
        >
          <Card.Content>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleContainer}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Chip
                  mode="outlined"
                  textStyle={{ 
                    color: getPriorityColor(goal.priority), 
                    fontSize: 10 
                  }}
                  style={{ 
                    backgroundColor: `${getPriorityColor(goal.priority)}20`,
                    height: 24
                  }}
                >
                  {goal.priority.toUpperCase()}
                </Chip>
              </View>
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => Alert.alert('Goal Options', 'Edit, Delete, or Share goal')}
              />
            </View>

            <Text style={styles.goalDescription}>{goal.description}</Text>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  {typeof goal.current === 'number' && goal.current > 1000 
                    ? `$${goal.current.toLocaleString()}` 
                    : goal.current} / {typeof goal.target === 'number' && goal.target > 1000 
                    ? `$${goal.target.toLocaleString()}` 
                    : goal.target}
                </Text>
                <Text style={[styles.progressPercentage, { color: getStatusColor(goal.status) }]}>
                  {goal.progress}%
                </Text>
              </View>
              <ProgressBar
                progress={goal.progress / 100}
                color={getStatusColor(goal.status)}
                style={styles.progressBar}
              />
            </View>

            <View style={styles.goalFooter}>
              <View style={styles.categoryChip}>
                <Icon name="category" size={14} color={COLORS.primary} />
                <Text style={styles.categoryText}>{goal.category}</Text>
              </View>
              <Text style={styles.deadline}>
                📅 {new Date(goal.deadline).toLocaleDateString()}
              </Text>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const renderClientGoalCard = (goal) => (
    <Animated.View
      key={goal.id}
      style={{
        opacity: fadeAnim,
        transform: [{
          translateX: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, 0]
          })
        }]
      }}
    >
      <Card style={styles.goalCard}>
        <TouchableOpacity
          onPress={() => setSelectedGoal(goal)}
          activeOpacity={0.7}
        >
          <Card.Content>
            <View style={styles.clientGoalHeader}>
              <View style={styles.clientInfo}>
                <Text style={styles.clientAvatar}>{goal.clientAvatar}</Text>
                <View>
                  <Text style={styles.clientName}>{goal.clientName}</Text>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                </View>
              </View>
              <Chip
                mode="filled"
                textStyle={{ 
                  color: '#fff', 
                  fontSize: 10,
                  fontWeight: 'bold'
                }}
                style={{ 
                  backgroundColor: getStatusColor(goal.status)
                }}
              >
                {goal.status.replace('-', ' ').toUpperCase()}
              </Chip>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  {goal.current} / {goal.target} {goal.title.includes('lbs') ? 'lbs' : goal.title.includes('min') ? 'min' : 'units'}
                </Text>
                <Text style={[styles.progressPercentage, { color: getStatusColor(goal.status) }]}>
                  {goal.progress}%
                </Text>
              </View>
              <ProgressBar
                progress={goal.progress / 100}
                color={getStatusColor(goal.status)}
                style={styles.progressBar}
              />
            </View>

            <View style={styles.goalFooter}>
              <Button
                mode="outlined"
                compact
                onPress={() => Alert.alert('Update Progress', `Update ${goal.clientName}'s progress`)}
                style={styles.updateButton}
              >
                Update Progress
              </Button>
              <Text style={styles.deadline}>
                📅 {new Date(goal.deadline).toLocaleDateString()}
              </Text>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const renderAchievementCard = (achievement) => (
    <Animated.View
      key={achievement.id}
      style={{
        opacity: fadeAnim,
        transform: [{
          scale: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1]
          })
        }]
      }}
    >
      <Card style={styles.achievementCard}>
        <LinearGradient
          colors={[COLORS.warning, '#FFB74D']}
          style={styles.achievementGradient}
        >
          <Card.Content>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>
            <View style={styles.achievementFooter}>
              <Text style={styles.achievementDate}>
                🗓️ {new Date(achievement.date).toLocaleDateString()}
              </Text>
              <Text style={styles.achievementCategory}>
                {achievement.category}
              </Text>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  const renderStatsOverview = () => {
    const stats = {
      totalGoals: myGoals.length,
      activeGoals: myGoals.filter(g => g.status === 'active').length,
      completedGoals: 12,
      avgProgress: Math.round(myGoals.reduce((sum, g) => sum + g.progress, 0) / myGoals.length)
    };

    return (
      <Surface style={styles.statsContainer}>
        <Text style={styles.statsTitle}>📊 Goals Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalGoals}</Text>
            <Text style={styles.statLabel}>Total Goals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>{stats.activeGoals}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{stats.completedGoals}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>{stats.avgProgress}%</Text>
            <Text style={styles.statLabel}>Avg Progress</Text>
          </View>
        </View>
      </Surface>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'my-goals':
        return (
          <>
            {renderStatsOverview()}
            {myGoals.map(renderMyGoalCard)}
          </>
        );
      case 'client-goals':
        return clientGoals.map(renderClientGoalCard);
      case 'achievements':
        return achievements.map(renderAchievementCard);
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🎯 Goal Tracking</Text>
          <Text style={styles.headerSubtitle}>Monitor progress & achievements</Text>
        </View>
      </LinearGradient>

      <ScrollView
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
      >
        {/* Search Bar */}
        <Searchbar
          placeholder="Search goals..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
        />

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setSelectedTab(tab.key)}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.activeTab
              ]}
            >
              <Icon
                name={tab.icon}
                size={20}
                color={selectedTab === tab.key ? '#fff' : COLORS.primary}
              />
              <Text style={[
                styles.tabLabel,
                { color: selectedTab === tab.key ? '#fff' : COLORS.primary }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filter Chips for My Goals */}
        {selectedTab === 'my-goals' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {goalFilters.map(filter => (
              <Chip
                key={filter.key}
                selected={goalFilter === filter.key}
                onPress={() => setGoalFilter(filter.key)}
                style={[
                  styles.filterChip,
                  goalFilter === filter.key && styles.selectedFilter
                ]}
                textStyle={{
                  color: goalFilter === filter.key ? '#fff' : COLORS.textSecondary
                }}
              >
                {filter.label}
              </Chip>
            ))}
          </ScrollView>
        )}

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      />

      {/* Create Goal Modal */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Title title="🎯 Create New Goal" />
            <Card.Content>
              <Text style={styles.modalText}>
                Goal creation form will be implemented here with fields for:
                {'\n'}• Goal title and description
                {'\n'}• Target value and deadline
                {'\n'}• Category and priority
                {'\n'}• Milestone tracking
              </Text>
              <Button
                mode="contained"
                onPress={() => {
                  setShowCreateModal(false);
                  Alert.alert('Goal Created! 🎉', 'Your new goal has been added to tracking.');
                }}
                style={styles.modalButton}
              >
                Create Goal
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginTop: -SPACING.md,
  },
  searchbar: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  tabContainer: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 1,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterContainer: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: '#fff',
  },
  selectedFilter: {
    backgroundColor: COLORS.textSecondary,
  },
  tabContent: {
    paddingHorizontal: SPACING.lg,
  },
  statsContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  goalCard: {
    marginBottom: SPACING.md,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  goalTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: SPACING.sm,
  },
  goalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  goalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
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
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  categoryText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  deadline: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  clientGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientAvatar: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  clientName: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  updateButton: {
    borderColor: COLORS.primary,
  },
  achievementCard: {
    marginBottom: SPACING.md,
    elevation: 3,
  },
  achievementGradient: {
    borderRadius: 8,
  },
  achievementTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
    marginBottom: SPACING.md,
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementDate: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  achievementCategory: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    elevation: 5,
  },
  modalText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
  },
};

export default GoalTracking;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
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
  Portal,
  Modal,
  TextInput,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import established design constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width } = Dimensions.get('window');

const ClientGoals = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'fitness',
    targetValue: '',
    targetUnit: 'kg',
    deadline: '',
    priority: 'medium',
  });

  // Mock data - replace with Redux selectors
  const [clients, setClients] = useState([
    {
      id: '1',
      name: 'John Smith',
      avatar: 'https://via.placeholder.com/50',
      totalGoals: 5,
      completedGoals: 3,
      activeGoals: 2,
      goals: [
        {
          id: 'g1',
          title: 'Lose 10kg Weight 💪',
          description: 'Target weight loss through cardio and strength training',
          category: 'weight-loss',
          currentValue: 7,
          targetValue: 10,
          unit: 'kg',
          progress: 70,
          status: 'in-progress',
          priority: 'high',
          deadline: '2024-12-31',
          createdDate: '2024-09-01',
          lastUpdated: '2024-11-15',
        },
        {
          id: 'g2',
          title: 'Bench Press 100kg 🏋️',
          description: 'Increase bench press strength',
          category: 'strength',
          currentValue: 85,
          targetValue: 100,
          unit: 'kg',
          progress: 85,
          status: 'in-progress',
          priority: 'medium',
          deadline: '2024-12-15',
          createdDate: '2024-10-01',
          lastUpdated: '2024-11-10',
        },
        {
          id: 'g3',
          title: 'Run 5K in 25 minutes ⏱️',
          description: 'Improve cardiovascular endurance',
          category: 'cardio',
          currentValue: 28,
          targetValue: 25,
          unit: 'minutes',
          progress: 60,
          status: 'completed',
          priority: 'medium',
          deadline: '2024-11-30',
          createdDate: '2024-09-15',
          lastUpdated: '2024-11-20',
        },
      ],
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      avatar: 'https://via.placeholder.com/50',
      totalGoals: 4,
      completedGoals: 2,
      activeGoals: 2,
      goals: [
        {
          id: 'g4',
          title: 'Build Muscle Mass 💪',
          description: 'Gain 5kg lean muscle mass',
          category: 'muscle-gain',
          currentValue: 2,
          targetValue: 5,
          unit: 'kg',
          progress: 40,
          status: 'in-progress',
          priority: 'high',
          deadline: '2025-02-28',
          createdDate: '2024-10-15',
          lastUpdated: '2024-11-18',
        },
      ],
    },
  ]);

  const goalCategories = [
    { key: 'all', label: 'All Goals', icon: 'fitness-center', color: COLORS.primary },
    { key: 'weight-loss', label: 'Weight Loss', icon: 'trending-down', color: '#e74c3c' },
    { key: 'muscle-gain', label: 'Muscle Gain', icon: 'trending-up', color: '#2ecc71' },
    { key: 'strength', label: 'Strength', icon: 'fitness-center', color: '#f39c12' },
    { key: 'cardio', label: 'Cardio', icon: 'favorite', color: '#e91e63' },
    { key: 'flexibility', label: 'Flexibility', icon: 'accessibility', color: '#9b59b6' },
  ];

  const priorityColors = {
    high: COLORS.error,
    medium: COLORS.warning,
    low: COLORS.success,
  };

  // Animation effects
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

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Goals data refreshed! 🎉');
    }, 1500);
  }, []);

  // Filter goals based on search and category
  const getFilteredGoals = useCallback(() => {
    let allGoals = [];
    clients.forEach(client => {
      client.goals.forEach(goal => {
        allGoals.push({ ...goal, clientId: client.id, clientName: client.name, clientAvatar: client.avatar });
      });
    });

    if (selectedFilter !== 'all') {
      allGoals = allGoals.filter(goal => goal.category === selectedFilter);
    }

    if (searchQuery) {
      allGoals = allGoals.filter(goal => 
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return allGoals;
  }, [clients, selectedFilter, searchQuery]);

  // Handle add new goal
  const handleAddGoal = () => {
    if (!newGoal.title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }
    
    Alert.alert('Feature Development', 'Goal creation feature is coming soon! 🚀', [
      { text: 'OK', style: 'default' }
    ]);
    
    setShowAddGoalModal(false);
    setNewGoal({
      title: '',
      description: '',
      category: 'fitness',
      targetValue: '',
      targetUnit: 'kg',
      deadline: '',
      priority: 'medium',
    });
  };

  // Handle goal progress update
  const handleUpdateProgress = (goalId, clientId) => {
    Alert.alert('Feature Development', 'Progress update feature is coming soon! 📊', [
      { text: 'OK', style: 'default' }
    ]);
  };

  // Render goal card
  const renderGoalCard = ({ item: goal }) => (
    <Animated.View
      style={[
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        { marginBottom: SPACING.md }
      ]}
    >
      <Card style={styles.goalCard} elevation={3}>
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientEnd]}
          style={styles.cardHeader}
        >
          <View style={styles.cardHeaderContent}>
            <Avatar.Image source={{ uri: goal.clientAvatar }} size={40} />
            <View style={styles.headerText}>
              <Text style={styles.clientName}>{goal.clientName}</Text>
              <Text style={styles.goalTitle}>{goal.title}</Text>
            </View>
            <Chip
              style={[styles.priorityChip, { backgroundColor: priorityColors[goal.priority] }]}
              textStyle={{ color: COLORS.white, fontSize: 12 }}
            >
              {goal.priority.toUpperCase()}
            </Chip>
          </View>
        </LinearGradient>

        <Card.Content style={styles.cardContent}>
          <Text style={styles.goalDescription}>{goal.description}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>Progress</Text>
              <Text style={styles.progressValue}>
                {goal.currentValue}/{goal.targetValue} {goal.unit}
              </Text>
            </View>
            <ProgressBar
              progress={goal.progress / 100}
              color={goal.status === 'completed' ? COLORS.success : COLORS.primary}
              style={styles.progressBar}
            />
            <Text style={styles.progressPercentage}>{goal.progress}% Complete</Text>
          </View>

          <View style={styles.goalMeta}>
            <View style={styles.metaItem}>
              <Icon name="event" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>Due: {new Date(goal.deadline).toLocaleDateString()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="update" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>Updated: {new Date(goal.lastUpdated).toLocaleDateString()}</Text>
            </View>
          </View>

          {goal.status === 'completed' && (
            <Surface style={styles.completedBadge} elevation={1}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <Text style={styles.completedText}>Goal Achieved! 🎉</Text>
            </Surface>
          )}
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => handleUpdateProgress(goal.id, goal.clientId)}
            icon="trending-up"
            style={styles.actionButton}
          >
            Update Progress
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('GoalDetails', { goalId: goal.id })}
            icon="visibility"
            buttonColor={COLORS.primary}
          >
            View Details
          </Button>
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  // Render stats overview
  const renderStatsOverview = () => {
    const totalGoals = clients.reduce((sum, client) => sum + client.totalGoals, 0);
    const completedGoals = clients.reduce((sum, client) => sum + client.completedGoals, 0);
    const activeGoals = clients.reduce((sum, client) => sum + client.activeGoals, 0);
    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    return (
      <Surface style={styles.statsContainer} elevation={2}>
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientEnd]}
          style={styles.statsGradient}
        >
          <Text style={styles.statsTitle}>Goals Overview 🎯</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalGoals}</Text>
              <Text style={styles.statLabel}>Total Goals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeGoals}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedGoals}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(completionRate)}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </LinearGradient>
      </Surface>
    );
  };

  // Render filter chips
  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {goalCategories.map((category) => (
        <Chip
          key={category.key}
          selected={selectedFilter === category.key}
          onPress={() => setSelectedFilter(category.key)}
          style={[
            styles.filterChip,
            selectedFilter === category.key && { backgroundColor: category.color }
          ]}
          textStyle={[
            styles.filterChipText,
            selectedFilter === category.key && { color: COLORS.white }
          ]}
          icon={category.icon}
        >
          {category.label}
        </Chip>
      ))}
    </ScrollView>
  );

  // Render add goal modal
  const renderAddGoalModal = () => (
    <Portal>
      <Modal
        visible={showAddGoalModal}
        onDismiss={() => setShowAddGoalModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.modalContent} elevation={8}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Goal 🎯</Text>
              <IconButton
                icon="close"
                onPress={() => setShowAddGoalModal(false)}
                style={styles.closeButton}
              />
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                label="Goal Title *"
                value={newGoal.title}
                onChangeText={(text) => setNewGoal(prev => ({ ...prev, title: text }))}
                mode="outlined"
                style={styles.formInput}
                left={<TextInput.Icon icon="flag" />}
              />

              <TextInput
                label="Description"
                value={newGoal.description}
                onChangeText={(text) => setNewGoal(prev => ({ ...prev, description: text }))}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.formInput}
                left={<TextInput.Icon icon="description" />}
              />

              <View style={styles.formRow}>
                <TextInput
                  label="Target Value"
                  value={newGoal.targetValue}
                  onChangeText={(text) => setNewGoal(prev => ({ ...prev, targetValue: text }))}
                  mode="outlined"
                  style={[styles.formInput, styles.formInputHalf]}
                  keyboardType="numeric"
                  left={<TextInput.Icon icon="track-changes" />}
                />

                <TextInput
                  label="Unit"
                  value={newGoal.targetUnit}
                  onChangeText={(text) => setNewGoal(prev => ({ ...prev, targetUnit: text }))}
                  mode="outlined"
                  style={[styles.formInput, styles.formInputHalf]}
                  left={<TextInput.Icon icon="straighten" />}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowAddGoalModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddGoal}
                style={styles.modalButton}
                buttonColor={COLORS.primary}
              >
                Create Goal
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const filteredGoals = getFilteredGoals();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Client Goals</Text>
          <IconButton
            icon="filter-list"
            iconColor={COLORS.white}
            onPress={() => Alert.alert('Feature Development', 'Advanced filters coming soon! 🔍')}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderStatsOverview()}

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search goals or clients..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={styles.searchInput}
          />
        </View>

        {renderFilterChips()}

        <View style={styles.goalsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === 'all' ? 'All Goals' : goalCategories.find(c => c.key === selectedFilter)?.label} 
              ({filteredGoals.length})
            </Text>
          </View>

          <FlatList
            data={filteredGoals}
            renderItem={renderGoalCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <Surface style={styles.emptyState} elevation={1}>
                <Icon name="fitness-center" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>No Goals Found</Text>
                <Text style={styles.emptyMessage}>
                  {searchQuery ? 'Try adjusting your search criteria' : 'Start by adding goals for your clients'}
                </Text>
              </Surface>
            )}
          />
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => setShowAddGoalModal(true)}
        label="Add Goal"
        color={COLORS.white}
        customSize={56}
      />

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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
    marginRight: SPACING.xl,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    margin: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.white,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchBar: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterContainer: {
    paddingLeft: SPACING.md,
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingRight: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  filterChipText: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  goalsSection: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  goalCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  clientName: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    opacity: 0.8,
  },
  goalTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    fontWeight: '600',
    marginTop: 2,
  },
  priorityChip: {
    height: 28,
  },
  cardContent: {
    padding: SPACING.md,
  },
  goalDescription: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  progressValue: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    textAlign: 'right',
    fontWeight: '500',
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: `${COLORS.success}15`,
  },
  completedText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  cardActions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  actionButton: {
    marginRight: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    margin: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  emptyTitle: {
    ...TEXT_STYLES.subtitle,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: width - SPACING.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.subtitle,
  },
  closeButton: {
    margin: 0,
  },
  modalForm: {
    padding: SPACING.md,
    maxHeight: 400,
  },
  formInput: {
    marginBottom: SPACING.md,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formInputHalf: {
    width: '48%',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    marginLeft: SPACING.sm,
  },
});

export default ClientGoals;
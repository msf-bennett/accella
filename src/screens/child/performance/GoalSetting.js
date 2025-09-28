import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  Animated,
  StatusBar,
  TouchableOpacity,
  Modal,
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
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const GoalSettingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, goals, achievements } = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'fitness',
    target: '',
    deadline: '',
    difficulty: 'medium'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Goal categories with icons and colors
  const goalCategories = [
    { id: 'all', name: 'All Goals', icon: 'all-inclusive', color: COLORS.primary },
    { id: 'fitness', name: 'Fitness 💪', icon: 'fitness-center', color: '#FF6B6B' },
    { id: 'skill', name: 'Skills ⚽', icon: 'sports-soccer', color: '#4ECDC4' },
    { id: 'team', name: 'Teamwork 🤝', icon: 'group', color: '#45B7D1' },
    { id: 'mental', name: 'Mental 🧠', icon: 'psychology', color: '#96CEB4' },
    { id: 'nutrition', name: 'Nutrition 🥗', icon: 'restaurant', color: '#FECA57' },
  ];

  // Sample goals data
  const [activeGoals, setActiveGoals] = useState([
    {
      id: 1,
      title: 'Run 5K in under 25 minutes',
      category: 'fitness',
      progress: 65,
      target: '25:00',
      current: '27:30',
      deadline: '2025-10-01',
      difficulty: 'medium',
      points: 150,
      streak: 12,
      lastUpdated: '2025-08-28'
    },
    {
      id: 2,
      title: 'Master 20 ball juggles',
      category: 'skill',
      progress: 40,
      target: '20',
      current: '8',
      deadline: '2025-09-15',
      difficulty: 'hard',
      points: 200,
      streak: 5,
      lastUpdated: '2025-08-27'
    },
    {
      id: 3,
      title: 'Attend all team practices',
      category: 'team',
      progress: 85,
      target: '100%',
      current: '85%',
      deadline: '2025-12-31',
      difficulty: 'easy',
      points: 100,
      streak: 20,
      lastUpdated: '2025-08-29'
    }
  ]);

  // Achievement badges
  const achievementBadges = [
    { id: 1, name: 'First Goal', icon: '🎯', unlocked: true },
    { id: 2, name: 'Streak Master', icon: '🔥', unlocked: true },
    { id: 3, name: 'Team Player', icon: '👥', unlocked: false },
    { id: 4, name: 'Speed Demon', icon: '⚡', unlocked: false },
  ];

  useEffect(() => {
    // Animation on mount
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return COLORS.primary;
    }
  };

  const getCategoryIcon = (category) => {
    const cat = goalCategories.find(c => c.id === category);
    return cat ? cat.icon : 'flag';
  };

  const getCategoryColor = (category) => {
    const cat = goalCategories.find(c => c.id === category);
    return cat ? cat.color : COLORS.primary;
  };

  const filteredGoals = activeGoals.filter(goal => {
    const matchesCategory = selectedCategory === 'all' || goal.category === selectedCategory;
    const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleGoalPress = (goal) => {
    Alert.alert(
      `${goal.title} 🎯`,
      `Progress: ${goal.progress}%\nStreak: ${goal.streak} days\nPoints: ${goal.points}`,
      [
        { text: 'Update Progress', onPress: () => updateProgress(goal.id) },
        { text: 'View Details', onPress: () => viewGoalDetails(goal.id) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const updateProgress = (goalId) => {
    Alert.alert(
      '🚀 Progress Updated!',
      'Great job on working towards your goal! Keep it up, champion!',
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

  const viewGoalDetails = (goalId) => {
    Alert.alert(
      '📊 Goal Analytics',
      'Detailed goal analytics and history coming soon!',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const createNewGoal = () => {
    setShowGoalModal(true);
  };

  const saveNewGoal = () => {
    Alert.alert(
      '🎉 New Goal Created!',
      'Your new goal has been added! Time to start crushing it!',
      [{ text: 'Let\'s Go!', onPress: () => setShowGoalModal(false) }]
    );
  };

  const renderGoalCard = (goal) => (
    <Animated.View
      key={goal.id}
      style={[
        styles.goalCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Card style={styles.card} onPress={() => handleGoalPress(goal)}>
        <Card.Content>
          <View style={styles.goalHeader}>
            <View style={styles.goalTitleSection}>
              <Icon 
                name={getCategoryIcon(goal.category)} 
                size={24} 
                color={getCategoryColor(goal.category)}
              />
              <Text style={styles.goalTitle}>{goal.title}</Text>
            </View>
            <Surface style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(goal.difficulty) }]}>
              <Text style={styles.difficultyText}>{goal.difficulty.toUpperCase()}</Text>
            </Surface>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>{goal.progress}% Complete</Text>
              <Text style={styles.targetText}>{goal.current} / {goal.target}</Text>
            </View>
            <ProgressBar 
              progress={goal.progress / 100} 
              color={getCategoryColor(goal.category)}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.goalStats}>
            <View style={styles.statItem}>
              <Icon name="local-fire-department" size={16} color="#FF6B6B" />
              <Text style={styles.statText}>{goal.streak} day streak</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="stars" size={16} color="#FFD700" />
              <Text style={styles.statText}>{goal.points} points</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="schedule" size={16} color={COLORS.secondary} />
              <Text style={styles.statText}>Due: {new Date(goal.deadline).toLocaleDateString()}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderAchievementBadge = (achievement) => (
    <TouchableOpacity key={achievement.id} style={styles.badgeContainer}>
      <Surface style={[
        styles.badge,
        { opacity: achievement.unlocked ? 1 : 0.5 }
      ]}>
        <Text style={styles.badgeEmoji}>{achievement.icon}</Text>
        <Text style={styles.badgeName}>{achievement.name}</Text>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      {/* Header with Gradient */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Goals 🎯</Text>
          <Text style={styles.headerSubtitle}>Chase your dreams, champion!</Text>
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
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search your goals..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />
        </View>

        {/* Achievement Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Your Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScrollView}>
            {achievementBadges.map(renderAchievementBadge)}
          </ScrollView>
        </View>

        {/* Category Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Goal Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
            {goalCategories.map(category => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && { backgroundColor: category.color }
                ]}
                textStyle={[
                  styles.categoryChipText,
                  selectedCategory === category.id && { color: 'white' }
                ]}
              >
                {category.name}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Active Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🚀 Active Goals ({filteredGoals.length})</Text>
            <IconButton
              icon="add"
              size={24}
              iconColor="white"
              containerColor={COLORS.primary}
              onPress={createNewGoal}
            />
          </View>
          
          {filteredGoals.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="flag" size={48} color={COLORS.secondary} />
                <Text style={styles.emptyTitle}>No Goals Found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery ? 'Try adjusting your search' : 'Create your first goal to get started!'}
                </Text>
              </Card.Content>
            </Card>
          ) : (
            filteredGoals.map(renderGoalCard)
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={createNewGoal}
        color="white"
        customSize={56}
      />

      {/* Goal Creation Modal */}
      <Portal>
        <Modal
          visible={showGoalModal}
          onRequestClose={() => setShowGoalModal(false)}
          animationType="slide"
        >
          <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
            <View style={styles.modalContainer}>
              <Card style={styles.modalCard}>
                <Card.Content>
                  <Text style={styles.modalTitle}>🎯 Create New Goal</Text>
                  <Text style={styles.modalSubtitle}>What do you want to achieve?</Text>
                  
                  <View style={styles.modalButtons}>
                    <Button
                      mode="contained"
                      onPress={saveNewGoal}
                      style={styles.saveButton}
                    >
                      Create Goal 🚀
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => setShowGoalModal(false)}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </Button>
                  </View>
                </Card.Content>
              </Card>
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
  header: {
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchbar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  badgeScrollView: {
    paddingVertical: SPACING.sm,
  },
  badgeContainer: {
    marginRight: SPACING.md,
  },
  badge: {
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
    elevation: 2,
  },
  badgeEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  badgeName: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoryScrollView: {
    paddingVertical: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  categoryChipText: {
    fontSize: 12,
  },
  goalCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  goalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  difficultyChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  targetText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: 4,
    fontSize: 11,
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.heading,
    marginTop: SPACING.md,
    color: COLORS.text.primary,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalBlur: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
  },
  modalTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
  },
  modalButtons: {
    gap: SPACING.md,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    borderColor: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default GoalSettingScreen;
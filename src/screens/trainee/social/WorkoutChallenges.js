import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Text,
  Image,
  FlatList,
  Animated,
  StatusBar,
  Dimensions,
  Alert,
  Vibration,
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
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const WorkoutChallenges = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, activeChallenges, availableChallenges, completedChallenges } = useSelector(state => state.trainee);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [showChallengeDetails, setShowChallengeDetails] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Start pulse animation for active challenges
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    loadChallengesData();
  }, []);

  const loadChallengesData = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement API calls to fetch challenges data
      // dispatch(fetchActiveChallenges());
      // dispatch(fetchAvailableChallenges());
      // dispatch(fetchCompletedChallenges());
    } catch (error) {
      Alert.alert('Error', 'Failed to load challenges data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChallengesData();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadChallengesData]);

  const handleJoinChallenge = useCallback((challengeId) => {
    Vibration.vibrate(50);
    // TODO: Implement join challenge functionality
    Alert.alert('Feature Coming Soon', 'Challenge participation is under development! 🚀');
  }, []);

  const handleLogProgress = useCallback((challengeId) => {
    Vibration.vibrate(50);
    // TODO: Implement progress logging functionality
    Alert.alert('Feature Coming Soon', 'Progress logging is under development! 📈');
  }, []);

  const handleViewLeaderboard = useCallback((challengeId) => {
    Vibration.vibrate(50);
    // TODO: Implement leaderboard functionality
    Alert.alert('Feature Coming Soon', 'Challenge leaderboards coming soon! 🏆');
  }, []);

  // Mock data - replace with real data from Redux store
  const mockActiveChallenges = [
    {
      id: '1',
      title: '30-Day Plank Challenge',
      description: 'Build core strength with progressive plank holds',
      category: 'Core',
      difficulty: 'Intermediate',
      duration: 30,
      daysLeft: 12,
      progress: 0.6,
      currentStreak: 5,
      participants: 1247,
      dailyGoal: '2 minutes',
      todayCompleted: false,
      reward: 500,
      image: 'https://via.placeholder.com/300x150',
      color: ['#FF6B6B', '#FF8E53'],
    },
    {
      id: '2',
      title: 'Run 100K This Month',
      description: 'Accumulate 100km of running throughout the month',
      category: 'Cardio',
      difficulty: 'Advanced',
      duration: 31,
      daysLeft: 8,
      progress: 0.75,
      currentStreak: 12,
      participants: 892,
      dailyGoal: '5km',
      todayCompleted: true,
      reward: 750,
      image: 'https://via.placeholder.com/300x150',
      color: ['#4ECDC4', '#44A08D'],
    },
  ];

  const mockAvailableChallenges = [
    {
      id: '3',
      title: 'Push-Up Power Month',
      description: 'Master the push-up with daily progression',
      category: 'Strength',
      difficulty: 'Beginner',
      duration: 28,
      startDate: '2025-09-01',
      participants: 543,
      reward: 400,
      image: 'https://via.placeholder.com/300x150',
      color: ['#A8EDEA', '#FED6E3'],
      featured: true,
    },
    {
      id: '4',
      title: 'Flexibility Focus',
      description: '21 days of stretching and mobility work',
      category: 'Flexibility',
      difficulty: 'All Levels',
      duration: 21,
      startDate: '2025-09-05',
      participants: 324,
      reward: 350,
      image: 'https://via.placeholder.com/300x150',
      color: ['#D299C2', '#FEF9D7'],
    },
    {
      id: '5',
      title: 'HIIT Master Challenge',
      description: 'High-intensity workouts for maximum results',
      category: 'HIIT',
      difficulty: 'Advanced',
      duration: 14,
      startDate: '2025-08-30',
      participants: 178,
      reward: 600,
      image: 'https://via.placeholder.com/300x150',
      color: ['#667eea', '#764ba2'],
    },
  ];

  const mockCompletedChallenges = [
    {
      id: '6',
      title: 'Summer Shred Challenge',
      description: 'Get beach body ready with this intense program',
      category: 'Full Body',
      difficulty: 'Intermediate',
      duration: 42,
      completedDate: '2025-07-15',
      finalProgress: 1.0,
      rank: 23,
      participants: 1567,
      reward: 1000,
      badge: 'Summer Warrior',
      image: 'https://via.placeholder.com/300x150',
    },
  ];

  const renderTabButton = (tab, title, icon, count = 0) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton,
      ]}
    >
      <View style={styles.tabButtonContent}>
        <Icon 
          name={icon} 
          size={20} 
          color={activeTab === tab ? COLORS.primary : COLORS.textSecondary} 
        />
        <Text style={[
          styles.tabButtonText,
          activeTab === tab && styles.activeTabButtonText,
        ]}>
          {title}
        </Text>
        {count > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderActiveChallenge = ({ item }) => (
    <Animated.View style={[
      styles.challengeContainer, 
      { 
        opacity: fadeAnim,
        transform: [{ scale: item.todayCompleted ? 1 : pulseAnim }]
      }
    ]}>
      <TouchableOpacity 
        onPress={() => {
          setSelectedChallenge(item);
          setShowChallengeDetails(true);
        }}
      >
        <Card style={styles.activeChallengeCard}>
          <LinearGradient
            colors={item.color}
            style={styles.challengeGradient}
          >
            <Image source={{ uri: item.image }} style={styles.challengeBackgroundImage} />
            <View style={styles.challengeOverlay}>
              
              <View style={styles.challengeHeader}>
                <View style={styles.challengeTitleContainer}>
                  <Text style={styles.challengeTitle}>{item.title}</Text>
                  <View style={styles.challengeMetadata}>
                    <Chip 
                      style={styles.difficultyChip} 
                      textStyle={styles.difficultyChipText}
                      compact
                    >
                      {item.difficulty}
                    </Chip>
                    <Chip 
                      style={styles.categoryChip} 
                      textStyle={styles.categoryChipText}
                      compact
                    >
                      {item.category}
                    </Chip>
                  </View>
                </View>
                
                <View style={styles.rewardContainer}>
                  <Icon name="stars" size={16} color={COLORS.white} />
                  <Text style={styles.rewardText}>{item.reward}</Text>
                </View>
              </View>

              <Text style={styles.challengeDescription}>{item.description}</Text>

              <View style={styles.challengeStats}>
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <Icon name="schedule" size={16} color={COLORS.white} />
                    <Text style={styles.statText}>{item.daysLeft} days left</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="people" size={16} color={COLORS.white} />
                    <Text style={styles.statText}>{item.participants} joined</Text>
                  </View>
                </View>
                
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <Icon name="local-fire-department" size={16} color={COLORS.white} />
                    <Text style={styles.statText}>{item.currentStreak} day streak</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="today" size={16} color={COLORS.white} />
                    <Text style={styles.statText}>Goal: {item.dailyGoal}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(item.progress * 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={item.progress}
                  color={COLORS.white}
                  style={styles.progressBar}
                />
              </View>

              <View style={styles.challengeActions}>
                <Button
                  mode="contained"
                  onPress={() => handleLogProgress(item.id)}
                  style={[
                    styles.actionButton,
                    item.todayCompleted && styles.completedButton
                  ]}
                  contentStyle={styles.actionButtonContent}
                  labelStyle={styles.actionButtonLabel}
                  disabled={item.todayCompleted}
                >
                  {item.todayCompleted ? '✓ Completed Today' : 'Log Progress'}
                </Button>
                <IconButton
                  icon="leaderboard"
                  size={20}
                  iconColor={COLORS.white}
                  style={styles.leaderboardButton}
                  onPress={() => handleViewLeaderboard(item.id)}
                />
              </View>
            </View>
          </LinearGradient>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderAvailableChallenge = ({ item }) => (
    <Animated.View style={[styles.availableChallengeContainer, { opacity: fadeAnim }]}>
      <TouchableOpacity 
        onPress={() => {
          setSelectedChallenge(item);
          setShowChallengeDetails(true);
        }}
      >
        <Card style={styles.availableChallengeCard}>
          {item.featured && (
            <View style={styles.featuredBadge}>
              <Icon name="star" size={16} color={COLORS.white} />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
          
          <LinearGradient
            colors={item.color}
            style={styles.availableChallengeGradient}
          >
            <Image source={{ uri: item.image }} style={styles.availableChallengeImage} />
            <View style={styles.availableChallengeOverlay}>
              
              <View style={styles.availableChallengeHeader}>
                <Text style={styles.availableChallengeTitle}>{item.title}</Text>
                <View style={styles.availableRewardContainer}>
                  <Icon name="stars" size={14} color={COLORS.white} />
                  <Text style={styles.availableRewardText}>{item.reward}</Text>
                </View>
              </View>

              <Text style={styles.availableChallengeDescription}>{item.description}</Text>

              <View style={styles.availableChallengeMetadata}>
                <Chip 
                  style={styles.availableDifficultyChip} 
                  textStyle={styles.availableDifficultyChipText}
                  compact
                >
                  {item.difficulty}
                </Chip>
                <Chip 
                  style={styles.availableCategoryChip} 
                  textStyle={styles.availableCategoryChipText}
                  compact
                >
                  {item.category}
                </Chip>
              </View>

              <View style={styles.availableChallengeStats}>
                <View style={styles.availableStatItem}>
                  <Icon name="schedule" size={14} color={COLORS.white} />
                  <Text style={styles.availableStatText}>{item.duration} days</Text>
                </View>
                <View style={styles.availableStatItem}>
                  <Icon name="people" size={14} color={COLORS.white} />
                  <Text style={styles.availableStatText}>{item.participants} joined</Text>
                </View>
                <View style={styles.availableStatItem}>
                  <Icon name="event" size={14} color={COLORS.white} />
                  <Text style={styles.availableStatText}>Starts {item.startDate}</Text>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={() => handleJoinChallenge(item.id)}
                style={styles.joinChallengeButton}
                contentStyle={styles.joinChallengeButtonContent}
                labelStyle={styles.joinChallengeButtonLabel}
              >
                Join Challenge
              </Button>
            </View>
          </LinearGradient>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCompletedChallenge = ({ item }) => (
    <Animated.View style={[styles.completedChallengeContainer, { opacity: fadeAnim }]}>
      <Card style={styles.completedChallengeCard}>
        <View style={styles.completedChallengeContent}>
          <View style={styles.completedChallengeHeader}>
            <Image source={{ uri: item.image }} style={styles.completedChallengeImage} />
            
            <View style={styles.completedChallengeInfo}>
              <Text style={styles.completedChallengeTitle}>{item.title}</Text>
              <Text style={styles.completedChallengeDescription}>{item.description}</Text>
              
              <View style={styles.completedChallengeMetadata}>
                <Chip 
                  style={styles.completedDifficultyChip} 
                  textStyle={styles.completedDifficultyChipText}
                  compact
                >
                  {item.difficulty}
                </Chip>
                <Text style={styles.completedDate}>Completed {item.completedDate}</Text>
              </View>
            </View>
          </View>

          <Divider style={styles.completedDivider} />

          <View style={styles.completedStats}>
            <View style={styles.completedStatItem}>
              <Icon name="jump-rope" size={20} color={COLORS.success} />
              <Text style={styles.completedStatLabel}>Rank</Text>
              <Text style={styles.completedStatValue}>#{item.rank}</Text>
            </View>
            
            <View style={styles.completedStatItem}>
              <Icon name="stars" size={20} color={COLORS.primary} />
              <Text style={styles.completedStatLabel}>Reward</Text>
              <Text style={styles.completedStatValue}>{item.reward}</Text>
            </View>
            
            <View style={styles.completedStatItem}>
              <Icon name="military-tech" size={20} color={COLORS.secondary} />
              <Text style={styles.completedStatLabel}>Badge</Text>
              <Text style={styles.completedStatValue}>{item.badge}</Text>
            </View>
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const renderActiveChallengesContent = () => (
    <FlatList
      data={mockActiveChallenges}
      renderItem={renderActiveChallenge}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>No Active Challenges</Text>
          <Text style={styles.emptySubtitle}>
            Join a challenge to start your fitness journey!
          </Text>
          <Button
            mode="contained"
            onPress={() => setActiveTab('available')}
            style={styles.emptyButton}
          >
            Browse Challenges
          </Button>
        </View>
      )}
    />
  );

  const renderAvailableChallengesContent = () => (
    <FlatList
      data={mockAvailableChallenges}
      renderItem={renderAvailableChallenge}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    />
  );

  const renderCompletedChallengesContent = () => (
    <FlatList
      data={mockCompletedChallenges}
      renderItem={renderCompletedChallenge}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏆</Text>
          <Text style={styles.emptyTitle}>No Completed Challenges</Text>
          <Text style={styles.emptySubtitle}>
            Complete challenges to earn badges and rewards!
          </Text>
        </View>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Challenges 🎯</Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="search"
              size={24}
              iconColor={COLORS.white}
              onPress={() => Alert.alert('Feature Coming Soon', 'Search functionality coming soon! 🔍')}
            />
            <IconButton
              icon="tune"
              size={24}
              iconColor={COLORS.white}
              onPress={() => setShowFilters(true)}
            />
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
        >
          {renderTabButton('active', 'Active', 'play-circle-filled', mockActiveChallenges.length)}
          {renderTabButton('available', 'Available', 'add-circle-outline')}
          {renderTabButton('completed', 'Completed', 'check-circle', mockCompletedChallenges.length)}
        </ScrollView>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.contentContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {activeTab === 'active' && renderActiveChallengesContent()}
        {activeTab === 'available' && renderAvailableChallengesContent()}
        {activeTab === 'completed' && renderCompletedChallengesContent()}
      </Animated.View>

      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
            <Card style={styles.filtersCard}>
              <Card.Title
                title="Filter Challenges"
                titleStyle={styles.modalTitle}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="close"
                    onPress={() => setShowFilters(false)}
                  />
                )}
              />
              <Card.Content>
                <Text style={styles.comingSoonModalText}>
                  Challenge filters coming soon! 🎛️
                </Text>
                <Text style={styles.comingSoonModalSubtext}>
                  Filter by category, difficulty, duration, and reward level.
                </Text>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>

        <Modal
          visible={showChallengeDetails}
          onDismiss={() => setShowChallengeDetails(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
            <Card style={styles.detailsCard}>
              <Card.Title
                title="Challenge Details"
                titleStyle={styles.modalTitle}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="close"
                    onPress={() => setShowChallengeDetails(false)}
                  />
                )}
              />
              <Card.Content>
                <Text style={styles.comingSoonModalText}>
                  Detailed challenge view coming soon! 📊
                </Text>
                <Text style={styles.comingSoonModalSubtext}>
                  View challenge rules, daily tasks, leaderboards, and progress analytics.
                </Text>
              </Card.Content>
            </Card>
          </BlurView>
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
    paddingBottom: SPACING.md,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  tabScrollContainer: {
    paddingHorizontal: SPACING.lg,
  },
  tabButton: {
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTabButton: {
    backgroundColor: COLORS.white,
  },
  tabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  tabButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    marginLeft: SPACING.xs,
    fontSize: 14,
  },
  activeTabButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  tabBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  tabBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  listContainer: {
    padding: SPACING.md,
  },
  
  // Active Challenge Styles
  challengeContainer: {
    marginBottom: SPACING.lg,
  },
  activeChallengeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  challengeGradient: {
    padding: SPACING.lg,
    minHeight: 280,
  },
  challengeBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.2,
  },
  challengeOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  challengeTitleContainer: {
    flex: 1,
  },
  challengeTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  challengeMetadata: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  difficultyChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 22,
  },
  difficultyChipText: {
    color: COLORS.white,
    fontSize: 11,
  },
  categoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    height: 22,
  },
  categoryChipText: {
    color: COLORS.white,
    fontSize: 11,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  rewardText: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  challengeDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.md,
  },
  challengeStats: {
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    fontWeight: '500',
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  challengeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  completedButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonContent: {
    paddingVertical: 6,
  },
  actionButtonLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  leaderboardButton: {
    marginLeft: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Available Challenge Styles
  availableChallengeContainer: {
    marginBottom: SPACING.md,
  },
  availableChallengeCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    zIndex: 1,
  },
  featuredText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  availableChallengeGradient: {
    padding: SPACING.md,
    minHeight: 200,
  },
  availableChallengeImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.25,
  },
  availableChallengeOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  availableChallengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  availableChallengeTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.white,
    fontWeight: 'bold',
    flex: 1,
  },
  availableRewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 10,
  },
  availableRewardText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  availableChallengeDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.sm,
  },
  availableChallengeMetadata: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  availableDifficultyChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 20,
  },
  availableDifficultyChipText: {
    color: COLORS.white,
    fontSize: 10,
  },
  availableCategoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    height: 20,
  },
  availableCategoryChipText: {
    color: COLORS.white,
    fontSize: 10,
  },
  availableChallengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  availableStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  availableStatText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    marginLeft: SPACING.xs,
    fontSize: 11,
  },
  joinChallengeButton: {
    backgroundColor: COLORS.white,
  },
  joinChallengeButtonContent: {
    paddingVertical: 4,
  },
  joinChallengeButtonLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  // Completed Challenge Styles
  completedChallengeContainer: {
    marginBottom: SPACING.md,
  },
  completedChallengeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
  },
  completedChallengeContent: {
    padding: SPACING.md,
  },
  completedChallengeHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  completedChallengeImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  completedChallengeInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  completedChallengeTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  completedChallengeDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  completedChallengeMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completedDifficultyChip: {
    backgroundColor: COLORS.success,
    height: 20,
  },
  completedDifficultyChipText: {
    color: COLORS.white,
    fontSize: 10,
  },
  completedDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  completedDivider: {
    marginVertical: SPACING.sm,
  },
  completedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  completedStatItem: {
    alignItems: 'center',
  },
  completedStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  completedStatValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginTop: 2,
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: screenHeight * 0.1,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: screenWidth * 0.9,
    borderRadius: 12,
    overflow: 'hidden',
  },
  filtersCard: {
    backgroundColor: COLORS.white,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
  },
  comingSoonModalText: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  comingSoonModalSubtext: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
};

export default WorkoutChallenges;
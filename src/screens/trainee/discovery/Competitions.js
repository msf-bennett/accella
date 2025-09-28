import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
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
  Portal,
  Modal,
  Searchbar,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
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
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
};

const { width } = Dimensions.get('window');

const Competitions = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => ({
    user: state.auth.user,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [competitions, setCompetitions] = useState([]);
  const [myCompetitions, setMyCompetitions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('discover'); // discover, joined, leaderboard

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  const categories = ['all', 'strength', 'cardio', 'yoga', 'crossfit', 'running', 'cycling', 'swimming'];
  const statuses = ['all', 'upcoming', 'active', 'completed'];

  useEffect(() => {
    loadCompetitions();
    loadMyCompetitions();
    animateEntrance();
  }, []);

  const animateEntrance = () => {
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
  };

  const loadCompetitions = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual API integration
      const mockCompetitions = [
        {
          id: 1,
          title: '30-Day Push-Up Challenge 💪',
          description: 'Complete 1000 push-ups in 30 days and win amazing prizes!',
          category: 'strength',
          status: 'active',
          startDate: '2024-08-01',
          endDate: '2024-08-31',
          participants: 234,
          maxParticipants: 500,
          prize: '$500 Cash Prize',
          difficulty: 'Intermediate',
          isJoined: false,
          organizer: 'FitChallenge Pro',
          image: null,
          progress: 67,
          myRank: null,
          requirements: ['Track daily push-ups', 'Submit weekly videos', 'Join group discussions'],
        },
        {
          id: 2,
          title: 'Virtual Marathon Series 🏃‍♂️',
          description: 'Run anywhere, anytime. Complete 42.2km in 30 days!',
          category: 'running',
          status: 'upcoming',
          startDate: '2024-09-01',
          endDate: '2024-09-30',
          participants: 156,
          maxParticipants: 300,
          prize: 'Medal & Certificate',
          difficulty: 'Advanced',
          isJoined: true,
          organizer: 'RunWorld Community',
          image: null,
          progress: 0,
          myRank: null,
          requirements: ['GPS tracking required', 'Minimum 3 runs per week', 'Photo proof required'],
        },
        {
          id: 3,
          title: 'Flexibility Master Challenge 🧘‍♀️',
          description: '21-day yoga and stretching challenge to improve flexibility',
          category: 'yoga',
          status: 'active',
          startDate: '2024-08-15',
          endDate: '2024-09-05',
          participants: 89,
          maxParticipants: 150,
          prize: 'Premium Yoga Mat',
          difficulty: 'Beginner',
          isJoined: true,
          organizer: 'Zen Fitness Studio',
          image: null,
          progress: 45,
          myRank: 12,
          requirements: ['Daily 15-min sessions', 'Photo progress tracking', 'Community support'],
        },
        {
          id: 4,
          title: 'Summer Shred Competition 🔥',
          description: 'Ultimate body transformation challenge with expert guidance',
          category: 'crossfit',
          status: 'upcoming',
          startDate: '2024-09-15',
          endDate: '2024-12-15',
          participants: 45,
          maxParticipants: 100,
          prize: '$1000 + Supplements',
          difficulty: 'Advanced',
          isJoined: false,
          organizer: 'Elite CrossFit Box',
          image: null,
          progress: 0,
          myRank: null,
          requirements: ['Before/after photos', 'Weekly check-ins', 'Nutrition tracking'],
        },
        {
          id: 5,
          title: 'Cardio Kings Challenge 👑',
          description: 'Burn maximum calories in 14 days. Track your cardio sessions!',
          category: 'cardio',
          status: 'completed',
          startDate: '2024-07-01',
          endDate: '2024-07-14',
          participants: 178,
          maxParticipants: 200,
          prize: 'Fitness Tracker',
          difficulty: 'Intermediate',
          isJoined: true,
          organizer: 'CardioMax Gym',
          image: null,
          progress: 100,
          myRank: 8,
          requirements: ['Heart rate monitoring', 'Daily cardio sessions', 'Calorie tracking'],
        },
      ];
      
      setCompetitions(mockCompetitions);
    } catch (error) {
      Alert.alert('Error', 'Failed to load competitions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMyCompetitions = useCallback(() => {
    const joined = competitions.filter(comp => comp.isJoined);
    setMyCompetitions(joined);
  }, [competitions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCompetitions();
    setRefreshing(false);
  }, [loadCompetitions]);

  const handleJoinCompetition = (competition) => {
    Alert.alert(
      'Join Competition! 🎯',
      `Are you ready to join "${competition.title}"?\n\nRequirements:\n${competition.requirements.map(req => `• ${req}`).join('\n')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join Now!',
          onPress: () => {
            Alert.alert(
              'Welcome Aboard! 🚀',
              'You have successfully joined the competition. Check the "Joined" tab to track your progress!',
              [{ text: 'Let\'s Go!' }]
            );
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'upcoming': return COLORS.warning;
      case 'completed': return COLORS.textSecondary;
      default: return COLORS.primary;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const renderCompetitionCard = (competition) => (
    <Animated.View
      key={competition.id}
      style={[
        styles.competitionCardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={styles.competitionCard}>
        <LinearGradient
          colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
          style={styles.cardGradient}
        >
          <Card.Content>
            <View style={styles.competitionHeader}>
              <View style={styles.competitionInfo}>
                <Text style={styles.competitionTitle}>{competition.title}</Text>
                <Text style={styles.competitionOrganizer}>by {competition.organizer}</Text>
              </View>
              <View style={styles.competitionBadges}>
                <Chip
                  mode="flat"
                  compact
                  style={[styles.statusChip, { backgroundColor: getStatusColor(competition.status) + '20' }]}
                  textStyle={[styles.chipText, { color: getStatusColor(competition.status) }]}
                >
                  {competition.status.toUpperCase()}
                </Chip>
                {competition.isJoined && (
                  <Badge style={styles.joinedBadge} size={8} />
                )}
              </View>
            </View>

            <Text style={styles.competitionDescription}>{competition.description}</Text>

            <View style={styles.competitionDetails}>
              <View style={styles.detailItem}>
                <Icon name="calendar-today" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>
                  {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Icon name="people" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>
                  {competition.participants}/{competition.maxParticipants} participants
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Icon name="jump-rope" size={16} color={COLORS.gold} />
                <Text style={styles.detailText}>{competition.prize}</Text>
              </View>

              <View style={styles.detailItem}>
                <Icon name="fitness-center" size={16} color={getDifficultyColor(competition.difficulty)} />
                <Text style={[styles.detailText, { color: getDifficultyColor(competition.difficulty) }]}>
                  {competition.difficulty}
                </Text>
              </View>
            </View>

            {competition.isJoined && competition.status === 'active' && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercentage}>{competition.progress}%</Text>
                </View>
                <ProgressBar
                  progress={competition.progress / 100}
                  color={COLORS.primary}
                  style={styles.progressBar}
                />
                {competition.myRank && (
                  <Text style={styles.rankText}>Current Rank: #{competition.myRank}</Text>
                )}
              </View>
            )}

            <View style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={() => Alert.alert('Feature Coming Soon', 'Competition details view will be available soon! 📊')}
                style={styles.detailsButton}
              >
                View Details
              </Button>
              
              {!competition.isJoined && competition.status !== 'completed' && (
                <Button
                  mode="contained"
                  onPress={() => handleJoinCompetition(competition)}
                  style={styles.joinButton}
                  buttonColor={COLORS.primary}
                >
                  Join Now
                </Button>
              )}
              
              {competition.isJoined && competition.status === 'active' && (
                <Button
                  mode="contained"
                  onPress={() => Alert.alert('Feature Coming Soon', 'Progress tracking will be available soon! 📈')}
                  style={styles.trackButton}
                  buttonColor={COLORS.success}
                >
                  Track Progress
                </Button>
              )}
              
              {competition.status === 'completed' && competition.isJoined && (
                <Button
                  mode="contained"
                  onPress={() => Alert.alert('Feature Coming Soon', 'Results view will be available soon! 🏆')}
                  style={styles.resultsButton}
                  buttonColor={COLORS.gold}
                >
                  View Results
                </Button>
              )}
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      <Card style={styles.leaderboardCard}>
        <Card.Content>
          <Text style={styles.leaderboardTitle}>🏆 Top Performers This Month</Text>
          
          {[
            { rank: 1, name: 'Sarah Johnson', points: 2840, badge: '🥇', color: COLORS.gold },
            { rank: 2, name: 'Mike Chen', points: 2650, badge: '🥈', color: COLORS.silver },
            { rank: 3, name: 'Emma Davis', points: 2420, badge: '🥉', color: COLORS.bronze },
            { rank: 4, name: 'You', points: 1890, badge: '💪', color: COLORS.primary },
            { rank: 5, name: 'Alex Thompson', points: 1760, badge: '⚡', color: COLORS.textSecondary },
          ].map((user, index) => (
            <View key={index} style={[styles.leaderboardItem, user.name === 'You' && styles.myLeaderboardItem]}>
              <View style={styles.leaderboardRank}>
                <Text style={[styles.rankBadge, { color: user.color }]}>{user.badge}</Text>
                <Text style={styles.rankNumber}>#{user.rank}</Text>
              </View>
              <View style={styles.leaderboardUserInfo}>
                <Avatar.Text
                  size={40}
                  label={user.name.charAt(0)}
                  style={{ backgroundColor: user.color + '20' }}
                  labelStyle={{ color: user.color }}
                />
                <View style={styles.userNamePoints}>
                  <Text style={[styles.leaderboardName, user.name === 'You' && styles.myName]}>
                    {user.name}
                  </Text>
                  <Text style={styles.leaderboardPoints}>{user.points} points</Text>
                </View>
              </View>
              {user.name === 'You' && (
                <Chip
                  mode="flat"
                  compact
                  style={styles.youChip}
                  textStyle={styles.youChipText}
                >
                  You
                </Chip>
              )}
            </View>
          ))}
          
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Feature Coming Soon', 'Full leaderboard will be available soon! 🎯')}
            style={styles.viewAllButton}
          >
            View Full Leaderboard
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'joined':
        const joinedComps = competitions.filter(comp => comp.isJoined);
        return (
          <View style={styles.tabContent}>
            {joinedComps.length > 0 ? (
              joinedComps.map(renderCompetitionCard)
            ) : (
              <Surface style={styles.emptyState}>
                <Icon name="jump-rope" size={80} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>No Competitions Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Join your first competition to start tracking your progress!
                </Text>
                <Button
                  mode="contained"
                  onPress={() => setActiveTab('discover')}
                  style={styles.exploreButton}
                  buttonColor={COLORS.primary}
                >
                  Explore Competitions
                </Button>
              </Surface>
            )}
          </View>
        );
      
      case 'leaderboard':
        return renderLeaderboard();
      
      default:
        return (
          <View style={styles.tabContent}>
            {competitions.map(renderCompetitionCard)}
          </View>
        );
    }
  };

  const renderFiltersModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <Surface style={styles.filtersModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Competitions</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowFilters(false)}
              />
            </View>

            <Text style={styles.filterSectionTitle}>Category</Text>
            <View style={styles.filterOptions}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  mode={selectedCategory === category ? 'flat' : 'outlined'}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  style={styles.filterChip}
                  selectedColor={COLORS.primary}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Chip>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Status</Text>
            <View style={styles.filterOptions}>
              {statuses.map((status) => (
                <Chip
                  key={status}
                  mode={selectedStatus === status ? 'flat' : 'outlined'}
                  selected={selectedStatus === status}
                  onPress={() => setSelectedStatus(status)}
                  style={styles.filterChip}
                  selectedColor={COLORS.primary}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Chip>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                style={styles.clearButton}
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilters(false)}
                style={styles.applyButton}
                buttonColor={COLORS.primary}
              >
                Apply Filters
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Competitions 🏆</Text>
            <IconButton
              icon="filter-list"
              iconColor="#fff"
              size={24}
              onPress={() => setShowFilters(true)}
            />
          </View>
          
          <Searchbar
            placeholder="Search competitions..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <Surface style={styles.tabContainer}>
        <View style={styles.tabs}>
          {[
            { key: 'discover', label: 'Discover', icon: 'explore' },
            { key: 'joined', label: 'Joined', icon: 'jump-rope' },
            { key: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Icon
                name={tab.icon}
                size={20}
                color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.key && styles.activeTabLabel
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Surface>

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
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Create Competition FAB */}
      <FAB
        icon="add"
        style={styles.fab}
        color="#fff"
        onPress={() => Alert.alert('Feature Coming Soon', 'Create competition feature will be available soon! 🚀')}
        customSize={56}
      />

      {renderFiltersModal()}
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
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  tabContainer: {
    elevation: 4,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: COLORS.primary + '15',
  },
  tabLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: SPACING.md,
  },
  competitionCardContainer: {
    marginBottom: SPACING.md,
  },
  competitionCard: {
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 16,
  },
  competitionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  competitionInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  competitionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  competitionOrganizer: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  competitionBadges: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: SPACING.xs,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  joinedBadge: {
    backgroundColor: COLORS.success,
  },
  competitionDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  competitionDetails: {
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  progressSection: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
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
    backgroundColor: COLORS.border,
  },
  rankText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  joinButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  trackButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  resultsButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  leaderboardContainer: {
    padding: SPACING.md,
  },
  leaderboardCard: {
    elevation: 4,
    borderRadius: 16,
  },
  leaderboardTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  myLeaderboardItem: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  leaderboardRank: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 50,
  },
  rankBadge: {
    fontSize: 20,
  },
  rankNumber: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  leaderboardUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNamePoints: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  leaderboardName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  myName: {
    color: COLORS.primary,
  },
  leaderboardPoints: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  youChip: {
    backgroundColor: COLORS.primary,
  },
  youChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewAllButton: {
    marginTop: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: 16,
    elevation: 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  exploreButton: {
    paddingHorizontal: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  filtersModal: {
    width: width - SPACING.xl,
    maxHeight: '80%',
    borderRadius: 16,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
  },
  clearButton: {
    marginRight: SPACING.md,
  },
  applyButton: {
    paddingHorizontal: SPACING.lg,
  },
});

export default Competitions;
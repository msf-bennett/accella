import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
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
  Searchbar,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const Challenges = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, challenges, userChallenges } = useSelector(state => state.app);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
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

  const mockChallenges = [
    {
      id: '1',
      title: '30-Day Push-Up Challenge',
      description: 'Complete 1000 push-ups in 30 days',
      type: 'fitness',
      difficulty: 'intermediate',
      participants: 234,
      duration: '30 days',
      reward: 500,
      progress: 0.7,
      isJoined: true,
      category: 'strength',
      endDate: '2025-09-15',
      creator: {
        name: 'FitCoach Mike',
        avatar: 'https://i.pravatar.cc/100?img=1',
      },
    },
    {
      id: '2',
      title: 'Run 100 Miles This Month',
      description: 'Complete 100 miles of running in August',
      type: 'cardio',
      difficulty: 'advanced',
      participants: 156,
      duration: '1 month',
      reward: 750,
      progress: 0.45,
      isJoined: false,
      category: 'endurance',
      endDate: '2025-08-31',
      creator: {
        name: 'Running Club Elite',
        avatar: 'https://i.pravatar.cc/100?img=2',
      },
    },
    {
      id: '3',
      title: 'Daily Yoga Streak',
      description: 'Practice yoga for 21 consecutive days',
      type: 'wellness',
      difficulty: 'beginner',
      participants: 445,
      duration: '21 days',
      reward: 300,
      progress: 0.33,
      isJoined: true,
      category: 'flexibility',
      endDate: '2025-09-10',
      creator: {
        name: 'ZenMaster Sarah',
        avatar: 'https://i.pravatar.cc/100?img=3',
      },
    },
    {
      id: '4',
      title: 'Team Weight Loss Challenge',
      description: 'Join a team and lose weight together',
      type: 'team',
      difficulty: 'intermediate',
      participants: 89,
      duration: '12 weeks',
      reward: 1000,
      progress: 0.2,
      isJoined: false,
      category: 'weight-loss',
      endDate: '2025-11-15',
      creator: {
        name: 'Healthy Living Community',
        avatar: 'https://i.pravatar.cc/100?img=4',
      },
    },
  ];

  const filterOptions = [
    { key: 'all', label: 'All Challenges', icon: 'apps' },
    { key: 'joined', label: 'My Challenges', icon: 'person' },
    { key: 'fitness', label: 'Fitness', icon: 'fitness-center' },
    { key: 'team', label: 'Team', icon: 'groups' },
    { key: 'wellness', label: 'Wellness', icon: 'spa' },
  ];

  const difficultyColors = {
    beginner: COLORS.success,
    intermediate: COLORS.warning,
    advanced: COLORS.error,
  };

  const filteredChallenges = mockChallenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'joined' && challenge.isJoined) ||
                         challenge.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleJoinChallenge = (challengeId) => {
    Alert.alert(
      'Join Challenge',
      'Are you ready to take on this challenge?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join', 
          onPress: () => {
            Alert.alert('Success! 🎉', 'You have joined the challenge. Good luck!');
          }
        }
      ]
    );
  };

  const handleCreateChallenge = () => {
    Alert.alert(
      'Create Challenge',
      'Challenge creation feature coming soon! 🚀',
      [{ text: 'OK' }]
    );
  };

  const renderStatsHeader = () => (
    <Surface style={styles.statsContainer} elevation={2}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.statsGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>2,450</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>7</Text>
          <Text style={styles.statLabel}>Streak</Text>
          <Text style={styles.streakEmoji}>🔥</Text>
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {filterOptions.map((filter, index) => (
        <Chip
          key={filter.key}
          mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
          selected={selectedFilter === filter.key}
          onPress={() => setSelectedFilter(filter.key)}
          icon={filter.icon}
          style={[
            styles.filterChip,
            selectedFilter === filter.key && styles.selectedChip
          ]}
          textStyle={selectedFilter === filter.key ? styles.selectedChipText : styles.chipText}
        >
          {filter.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderChallengeCard = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.challengeCardContainer,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 50],
            })
          }]
        }
      ]}
    >
      <Card style={styles.challengeCard} elevation={3}>
        <LinearGradient
          colors={item.isJoined ? ['#667eea', '#764ba2'] : ['#f8f9fa', '#e9ecef']}
          style={styles.cardHeader}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <View style={styles.cardHeaderContent}>
            <View style={styles.challengeInfo}>
              <Text style={[
                styles.challengeTitle,
                { color: item.isJoined ? COLORS.white : COLORS.text }
              ]}>
                {item.title}
              </Text>
              <View style={styles.challengeMeta}>
                <Chip
                  mode="outlined"
                  style={[styles.difficultyChip, { borderColor: difficultyColors[item.difficulty] }]}
                  textStyle={[styles.difficultyText, { color: difficultyColors[item.difficulty] }]}
                >
                  {item.difficulty.toUpperCase()}
                </Chip>
                <Text style={[
                  styles.duration,
                  { color: item.isJoined ? COLORS.white : COLORS.textSecondary }
                ]}>
                  {item.duration}
                </Text>
              </View>
            </View>
            {item.isJoined && (
              <Badge style={styles.joinedBadge}>
                Joined ✓
              </Badge>
            )}
          </View>
        </LinearGradient>

        <Card.Content style={styles.cardContent}>
          <Text style={styles.description}>{item.description}</Text>
          
          <View style={styles.creatorInfo}>
            <Avatar.Image size={32} source={{ uri: item.creator.avatar }} />
            <Text style={styles.creatorName}>by {item.creator.name}</Text>
          </View>

          <View style={styles.challengeStats}>
            <View style={styles.statRow}>
              <Icon name="group" size={16} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{item.participants} participants</Text>
            </View>
            <View style={styles.statRow}>
              <Icon name="stars" size={16} color={COLORS.warning} />
              <Text style={styles.statText}>{item.reward} points</Text>
            </View>
            <View style={styles.statRow}>
              <Icon name="schedule" size={16} color={COLORS.textSecondary} />
              <Text style={styles.statText}>Ends {item.endDate}</Text>
            </View>
          </View>

          {item.isJoined && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercentage}>
                  {Math.round(item.progress * 100)}%
                </Text>
              </View>
              <ProgressBar
                progress={item.progress}
                color={COLORS.primary}
                style={styles.progressBar}
              />
            </View>
          )}
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          {item.isJoined ? (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ChallengeDetails', { challengeId: item.id })}
              style={styles.viewButton}
              icon="visibility"
            >
              View Progress
            </Button>
          ) : (
            <Button
              mode="outlined"
              onPress={() => handleJoinChallenge(item.id)}
              style={styles.joinButton}
              icon="add"
            >
              Join Challenge
            </Button>
          )}
          <IconButton
            icon="share"
            size={20}
            onPress={() => Alert.alert('Share', 'Share feature coming soon!')}
          />
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="jump-rope" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Challenges Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? 'Try adjusting your search terms'
          : 'Be the first to create a challenge!'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="light-content" 
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <Text style={styles.headerTitle}>Challenges 🏆</Text>
        <Text style={styles.headerSubtitle}>Push your limits and compete!</Text>
      </LinearGradient>

      {renderStatsHeader()}

      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search challenges..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          icon="search"
          clearIcon="close"
        />
      </View>

      {renderFilterChips()}

      <FlatList
        data={filteredChallenges}
        renderItem={renderChallengeCard}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />

      <FAB
        style={styles.fab}
        icon="add"
        onPress={handleCreateChallenge}
        color={COLORS.white}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  statsContainer: {
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsGradient: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.white,
    opacity: 0.3,
    marginHorizontal: SPACING.sm,
  },
  streakEmoji: {
    fontSize: 16,
    marginTop: SPACING.xs,
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  searchbar: {
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
  },
  selectedChipText: {
    color: COLORS.white,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl + 60,
  },
  challengeCardContainer: {
    marginBottom: SPACING.md,
  },
  challengeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyChip: {
    backgroundColor: 'transparent',
    marginRight: SPACING.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  duration: {
    ...TEXT_STYLES.caption,
    fontWeight: '500',
  },
  joinedBadge: {
    backgroundColor: COLORS.success,
    color: COLORS.white,
  },
  cardContent: {
    paddingTop: SPACING.md,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  creatorName: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
  },
  challengeStats: {
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  progressSection: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  cardActions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    justifyContent: 'space-between',
  },
  joinButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  viewButton: {
    flex: 1,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
};

export default Challenges;
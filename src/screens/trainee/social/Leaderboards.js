import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
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
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports (these would be imported from your design system)
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

const LeaderBoard = ({ navigation }) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, all-time
  const [selectedCategory, setSelectedCategory] = useState('overall'); // overall, workouts, points, streak
  const [showMyRank, setShowMyRank] = useState(false);

  // Redux state
  const currentUser = useSelector(state => state.auth.user);
  const leaderboardData = useSelector(state => state.leaderboard.data);
  const loading = useSelector(state => state.leaderboard.loading);
  const dispatch = useDispatch();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for demonstration
  const mockLeaderboardData = [
    {
      id: '1',
      name: 'Alex Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      points: 2850,
      workouts: 45,
      streak: 12,
      level: 15,
      badges: ['🔥', '💪', '⭐'],
      rank: 1,
      change: '+2',
      isCurrentUser: false,
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      avatar: 'https://i.pravatar.cc/150?img=2',
      points: 2720,
      workouts: 42,
      streak: 8,
      level: 14,
      badges: ['🏆', '💎', '⚡'],
      rank: 2,
      change: '-1',
      isCurrentUser: false,
    },
    {
      id: '3',
      name: 'Mike Chen',
      avatar: 'https://i.pravatar.cc/150?img=3',
      points: 2680,
      workouts: 38,
      streak: 15,
      level: 13,
      badges: ['🎯', '🔥', '💪'],
      rank: 3,
      change: '+1',
      isCurrentUser: false,
    },
    {
      id: '4',
      name: 'You',
      avatar: 'https://i.pravatar.cc/150?img=4',
      points: 2450,
      workouts: 35,
      streak: 6,
      level: 12,
      badges: ['⭐', '💎'],
      rank: 5,
      change: '+3',
      isCurrentUser: true,
    },
  ];

  // Effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Load leaderboard data
    loadLeaderboardData();
  }, [selectedPeriod, selectedCategory]);

  // Callbacks
  const loadLeaderboardData = useCallback(() => {
    // In real app, dispatch Redux action to fetch data
    // dispatch(fetchLeaderboardData({ period: selectedPeriod, category: selectedCategory }));
  }, [selectedPeriod, selectedCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      loadLeaderboardData();
      setRefreshing(false);
    }, 1500);
  }, [loadLeaderboardData]);

  const handlePeriodChange = useCallback((period) => {
    setSelectedPeriod(period);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleUserPress = useCallback((userId) => {
    Alert.alert(
      'User Profile',
      'Navigate to user profile feature coming soon! 🚀',
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const handleChallengeUser = useCallback((userId) => {
    Alert.alert(
      'Challenge Friend',
      'Challenge feature coming soon! Get ready to compete! 💪',
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const scrollToMyRank = useCallback(() => {
    setShowMyRank(!showMyRank);
    Alert.alert(
      'My Rank',
      'Scroll to my position feature coming soon! 📍',
      [{ text: 'OK', style: 'default' }]
    );
  }, [showMyRank]);

  // Render functions
  const renderRankMedal = (rank) => {
    if (rank === 1) return <Text style={styles.medalText}>🥇</Text>;
    if (rank === 2) return <Text style={styles.medalText}>🥈</Text>;
    if (rank === 3) return <Text style={styles.medalText}>🥉</Text>;
    return (
      <Surface style={styles.rankBadge}>
        <Text style={styles.rankText}>#{rank}</Text>
      </Surface>
    );
  };

  const renderChangeIndicator = (change) => {
    const isPositive = change.startsWith('+');
    const isNeutral = change === '0';
    
    if (isNeutral) return null;
    
    return (
      <View style={[styles.changeIndicator, isPositive ? styles.positiveChange : styles.negativeChange]}>
        <Icon 
          name={isPositive ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
          size={16} 
          color={isPositive ? COLORS.success : COLORS.error} 
        />
        <Text style={[styles.changeText, { color: isPositive ? COLORS.success : COLORS.error }]}>
          {change.replace(/[+-]/, '')}
        </Text>
      </View>
    );
  };

  const renderUserCard = (user, index) => {
    const animatedStyle = {
      opacity: fadeAnim,
      transform: [
        {
          translateY: slideAnim.interpolate({
            inputRange: [0, 50],
            outputRange: [0, 50],
          }),
        },
      ],
    };

    return (
      <Animated.View key={user.id} style={[animatedStyle, { delay: index * 100 }]}>
        <Card style={[styles.userCard, user.isCurrentUser && styles.currentUserCard]}>
          <TouchableOpacity
            onPress={() => handleUserPress(user.id)}
            style={styles.userCardContent}
          >
            <View style={styles.userCardLeft}>
              {renderRankMedal(user.rank)}
              <Avatar.Image 
                size={50} 
                source={{ uri: user.avatar }} 
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={[TEXT_STYLES.body, styles.userName]}>
                  {user.name} {user.isCurrentUser && '(You)'}
                </Text>
                <View style={styles.badgesContainer}>
                  {user.badges.map((badge, idx) => (
                    <Text key={idx} style={styles.badge}>{badge}</Text>
                  ))}
                  <Text style={styles.levelText}>Level {user.level}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.userCardRight}>
              <View style={styles.statsContainer}>
                <Text style={[TEXT_STYLES.h3, styles.pointsText]}>{user.points.toLocaleString()}</Text>
                <Text style={styles.pointsLabel}>points</Text>
                <View style={styles.miniStats}>
                  <Text style={styles.miniStatText}>{user.workouts} workouts</Text>
                  <Text style={styles.miniStatText}>{user.streak} day streak 🔥</Text>
                </View>
              </View>
              {renderChangeIndicator(user.change)}
            </View>
          </TouchableOpacity>
          
          {!user.isCurrentUser && (
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                compact
                onPress={() => handleChallengeUser(user.id)}
                style={styles.challengeButton}
                labelStyle={styles.challengeButtonText}
              >
                Challenge 🏃‍♂️
              </Button>
            </View>
          )}
        </Card>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>🏆 Leaderboard</Text>
      <Text style={styles.headerSubtitle}>Compete with friends and climb the ranks!</Text>
      
      {/* Period Selection */}
      <View style={styles.periodContainer}>
        {['week', 'month', 'all-time'].map((period) => (
          <Chip
            key={period}
            selected={selectedPeriod === period}
            onPress={() => handlePeriodChange(period)}
            style={[
              styles.periodChip,
              selectedPeriod === period && styles.selectedPeriodChip,
            ]}
            textStyle={[
              styles.periodChipText,
              selectedPeriod === period && styles.selectedPeriodChipText,
            ]}
          >
            {period === 'all-time' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
          </Chip>
        ))}
      </View>
    </LinearGradient>
  );

  const renderCategoryTabs = () => (
    <View style={styles.categoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'overall', label: 'Overall', icon: 'jump-rope' },
          { key: 'workouts', label: 'Workouts', icon: 'fitness-center' },
          { key: 'points', label: 'Points', icon: 'stars' },
          { key: 'streak', label: 'Streaks', icon: 'local-fire-department' },
        ].map((category) => (
          <TouchableOpacity
            key={category.key}
            onPress={() => handleCategoryChange(category.key)}
            style={[
              styles.categoryTab,
              selectedCategory === category.key && styles.selectedCategoryTab,
            ]}
          >
            <Icon
              name={category.icon}
              size={24}
              color={selectedCategory === category.key ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === category.key && styles.selectedCategoryTabText,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMyRankCard = () => {
    const currentUser = mockLeaderboardData.find(user => user.isCurrentUser);
    if (!currentUser) return null;

    return (
      <Card style={styles.myRankCard}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.myRankGradient}>
          <View style={styles.myRankContent}>
            <Text style={styles.myRankTitle}>Your Current Rank</Text>
            <View style={styles.myRankStats}>
              <Text style={styles.myRankNumber}>#{currentUser.rank}</Text>
              <View style={styles.myRankDetails}>
                <Text style={styles.myRankText}>{currentUser.points.toLocaleString()} points</Text>
                <Text style={styles.myRankText}>Level {currentUser.level}</Text>
                <Text style={styles.myRankText}>{currentUser.streak} day streak 🔥</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.content}>
          {/* Search Bar */}
          <Searchbar
            placeholder="Search competitors..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />

          {/* My Rank Card */}
          {renderMyRankCard()}

          {/* Category Tabs */}
          {renderCategoryTabs()}

          {/* Motivational Header */}
          <View style={styles.motivationalHeader}>
            <Text style={styles.motivationalText}>
              💪 Keep pushing! You're doing amazing!
            </Text>
            <ProgressBar
              progress={0.75}
              color={COLORS.success}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>75% to next level!</Text>
          </View>

          {/* Leaderboard List */}
          <View style={styles.leaderboardContainer}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              🏅 Top Performers This {selectedPeriod === 'all-time' ? 'Season' : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
            </Text>
            {mockLeaderboardData.map((user, index) => renderUserCard(user, index))}
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="my-location"
        style={styles.fab}
        color={COLORS.surface}
        onPress={scrollToMyRank}
        label="My Rank"
      />
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    color: COLORS.surface,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: COLORS.surface,
    textAlign: 'center',
    opacity: 0.9,
    fontSize: 16,
    marginBottom: SPACING.md,
  },
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  periodChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  selectedPeriodChip: {
    backgroundColor: COLORS.surface,
  },
  periodChipText: {
    color: COLORS.surface,
    fontSize: 12,
  },
  selectedPeriodChipText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  myRankCard: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  myRankGradient: {
    padding: SPACING.md,
  },
  myRankContent: {
    alignItems: 'center',
  },
  myRankTitle: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  myRankStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  myRankNumber: {
    color: COLORS.surface,
    fontSize: 32,
    fontWeight: 'bold',
  },
  myRankDetails: {
    alignItems: 'flex-start',
  },
  myRankText: {
    color: COLORS.surface,
    fontSize: 14,
    opacity: 0.9,
  },
  categoryContainer: {
    marginBottom: SPACING.md,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    elevation: 1,
    gap: SPACING.xs,
  },
  selectedCategoryTab: {
    backgroundColor: COLORS.primary,
  },
  categoryTabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryTabText: {
    color: COLORS.surface,
  },
  motivationalHeader: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 15,
    marginBottom: SPACING.md,
    elevation: 2,
    alignItems: 'center',
  },
  motivationalText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  leaderboardContainer: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  userCard: {
    marginBottom: SPACING.sm,
    elevation: 3,
    backgroundColor: COLORS.surface,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medalText: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    elevation: 1,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  avatar: {
    marginRight: SPACING.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  badge: {
    fontSize: 12,
  },
  levelText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  userCardRight: {
    alignItems: 'flex-end',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  pointsText: {
    color: COLORS.text,
  },
  pointsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  miniStats: {
    alignItems: 'flex-end',
  },
  miniStatText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: SPACING.xs,
  },
  positiveChange: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  negativeChange: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtons: {
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  challengeButton: {
    borderColor: COLORS.primary,
  },
  challengeButtonText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default LeaderBoard;
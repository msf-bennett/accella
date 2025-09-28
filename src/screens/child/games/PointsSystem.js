import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Vibration,
  Alert,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const PointsSystem = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, totalPoints, dailyStreak, level, achievements } = useSelector((state) => state.user);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [recentPoints, setRecentPoints] = useState([]);
  const [weeklyGoal, setWeeklyGoal] = useState(500);
  const [currentWeekPoints, setCurrentWeekPoints] = useState(320);

  // Mock data - in real app this would come from Redux/API
  const [userStats, setUserStats] = useState({
    totalPoints: totalPoints || 2847,
    currentLevel: level || 7,
    pointsToNextLevel: 153,
    nextLevelPoints: 3000,
    rank: 12,
    totalUsers: 150,
    weeklyStreak: 5,
    monthlyPoints: 890,
  });

  // Points earning activities
  const pointActivities = [
    {
      id: 1,
      title: 'Complete Training Session',
      description: 'Finish your daily workout',
      points: 50,
      icon: 'fitness-center',
      color: ['#667eea', '#764ba2'],
      completed: false,
    },
    {
      id: 2,
      title: 'Perfect Attendance Week',
      description: 'Attend all training sessions this week',
      points: 100,
      icon: 'event-available',
      color: ['#26a69a', '#00897b'],
      completed: true,
    },
    {
      id: 3,
      title: 'Share Motivational Quote',
      description: 'Spread positive vibes with friends',
      points: 15,
      icon: 'share',
      color: ['#ffa726', '#ff7043'],
      completed: false,
    },
    {
      id: 4,
      title: 'Beat Personal Record',
      description: 'Improve your performance',
      points: 75,
      icon: 'trending-up',
      color: ['#ef5350', '#e53935'],
      completed: false,
    },
    {
      id: 5,
      title: 'Help Teammate',
      description: 'Support a friend during training',
      points: 25,
      icon: 'people',
      color: ['#ab47bc', '#8e24aa'],
      completed: true,
    },
    {
      id: 6,
      title: 'Healthy Meal Log',
      description: 'Log nutritious meals',
      points: 20,
      icon: 'restaurant',
      color: ['#5c6bc0', '#3f51b5'],
      completed: false,
    },
  ];

  // Recent points history
  const pointsHistory = [
    { id: 1, activity: 'Training Session Complete', points: 50, time: '2 hours ago', icon: 'fitness-center', type: 'earned' },
    { id: 2, activity: 'Daily Check-in Bonus', points: 10, time: '1 day ago', icon: 'check-circle', type: 'earned' },
    { id: 3, activity: 'Achievement Unlocked: Consistent Trainer', points: 100, time: '2 days ago', icon: 'jump-rope', type: 'earned' },
    { id: 4, activity: 'Weekly Challenge Complete', points: 75, time: '3 days ago', icon: 'flag', type: 'earned' },
    { id: 5, activity: 'Motivational Quote Share', points: 15, time: '3 days ago', icon: 'share', type: 'earned' },
    { id: 6, activity: 'Equipment Purchase', points: -200, time: '1 week ago', icon: 'shopping-cart', type: 'spent' },
  ];

  // Level system
  const levels = [
    { level: 1, title: 'Rookie', minPoints: 0, maxPoints: 100, color: '#8BC34A', emoji: '🌱' },
    { level: 2, title: 'Trainee', minPoints: 101, maxPoints: 250, color: '#4CAF50', emoji: '💪' },
    { level: 3, title: 'Athlete', minPoints: 251, maxPoints: 500, color: '#009688', emoji: '🏃' },
    { level: 4, title: 'Competitor', minPoints: 501, maxPoints: 750, color: '#00BCD4', emoji: '🎯' },
    { level: 5, title: 'Star Player', minPoints: 751, maxPoints: 1200, color: '#03A9F4', emoji: '⭐' },
    { level: 6, title: 'All-Star', minPoints: 1201, maxPoints: 1800, color: '#2196F3', emoji: '🌟' },
    { level: 7, title: 'Champion', minPoints: 1801, maxPoints: 3000, color: '#667eea', emoji: '🏆' },
    { level: 8, title: 'Legend', minPoints: 3001, maxPoints: 5000, color: '#9C27B0', emoji: '👑' },
  ];

  const currentLevelInfo = levels.find(l => l.level === userStats.currentLevel);
  const nextLevelInfo = levels.find(l => l.level === userStats.currentLevel + 1);

  // Animation functions
  const startEntryAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const bounceAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bounceAnim]);

  const confettiAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(confettiAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [confettiAnim]);

  const rotationAnimation = useCallback(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  // Effects
  useEffect(() => {
    startEntryAnimation();
    rotationAnimation();
  }, [startEntryAnimation, rotationAnimation]);

  // Handlers
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      Vibration.vibrate(50);
      
      // Simulate refreshing data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update stats (in real app, fetch from API)
      setUserStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints + Math.floor(Math.random() * 20),
      }));
      
      setRefreshing(false);
    } catch (error) {
      console.error('Refresh error:', error);
      setRefreshing(false);
    }
  }, []);

  const handleActivityPress = (activity) => {
    if (!activity.completed) {
      bounceAnimation();
      Vibration.vibrate(100);
      Alert.alert(
        'Start Activity! 🎯',
        `Complete "${activity.title}" to earn ${activity.points} points!`,
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Start Now!', onPress: () => navigation.navigate('TrainingSession') }
        ]
      );
    }
  };

  const handleRedeemRewards = () => {
    confettiAnimation();
    Vibration.vibrate(200);
    Alert.alert(
      'Rewards Store! 🎁',
      'Visit the rewards store to spend your points on cool gear and prizes!',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Shop Now!', onPress: () => Alert.alert('Feature Coming Soon!', 'Rewards store is under development 🚧') }
      ]
    );
  };

  const calculateProgress = () => {
    const currentLevel = currentLevelInfo;
    const nextLevel = nextLevelInfo;
    if (!nextLevel) return 1;
    
    const progressInLevel = userStats.totalPoints - currentLevel.minPoints;
    const levelRange = nextLevel.minPoints - currentLevel.minPoints;
    return Math.min(progressInLevel / levelRange, 1);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View style={styles.levelContainer}>
            <Animated.View
              style={[
                styles.levelBadge,
                {
                  transform: [{ scale: bounceAnim }]
                }
              ]}
            >
              <LinearGradient
                colors={[currentLevelInfo?.color || '#667eea', '#764ba2']}
                style={styles.levelBadgeGradient}
              >
                <Text style={styles.levelEmoji}>{currentLevelInfo?.emoji || '🏆'}</Text>
                <Text style={styles.levelNumber}>Level {userStats.currentLevel}</Text>
              </LinearGradient>
            </Animated.View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>{currentLevelInfo?.title || 'Champion'}</Text>
              <Text style={styles.levelSubtitle}>
                {userStats.pointsToNextLevel} points to next level!
              </Text>
            </View>
          </View>

          <View style={styles.totalPointsContainer}>
            <Animated.View
              style={[
                styles.pointsBadge,
                {
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }]
                }
              ]}
            >
              <MaterialIcons name="stars" size={24} color="#ffd700" />
            </Animated.View>
            <Text style={styles.totalPointsText}>{userStats.totalPoints.toLocaleString()}</Text>
            <Text style={styles.totalPointsLabel}>Total Points</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Level Progress</Text>
            <Text style={styles.progressPercentage}>
              {Math.round(calculateProgress() * 100)}%
            </Text>
          </View>
          <ProgressBar
            progress={calculateProgress()}
            color="#ffd700"
            style={styles.progressBar}
          />
          <View style={styles.progressFooter}>
            <Text style={styles.progressText}>
              {currentLevelInfo?.minPoints || 0}
            </Text>
            <Text style={styles.progressText}>
              {nextLevelInfo?.minPoints || userStats.nextLevelPoints}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
        onPress={() => setSelectedTab('overview')}
      >
        <MaterialIcons
          name="dashboard"
          size={20}
          color={selectedTab === 'overview' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[
          styles.tabText,
          selectedTab === 'overview' && styles.activeTabText
        ]}>
          Overview
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selectedTab === 'activities' && styles.activeTab]}
        onPress={() => setSelectedTab('activities')}
      >
        <MaterialIcons
          name="assignment"
          size={20}
          color={selectedTab === 'activities' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[
          styles.tabText,
          selectedTab === 'activities' && styles.activeTabText
        ]}>
          Earn Points
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
        onPress={() => setSelectedTab('history')}
      >
        <MaterialIcons
          name="history"
          size={20}
          color={selectedTab === 'history' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[
          styles.tabText,
          selectedTab === 'history' && styles.activeTabText
        ]}>
          History
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Weekly Goal Card */}
      <Card style={styles.goalCard}>
        <LinearGradient
          colors={['#26a69a', '#00897b']}
          style={styles.goalCardGradient}
        >
          <View style={styles.goalHeader}>
            <MaterialIcons name="flag" size={28} color="#fff" />
            <Text style={styles.goalTitle}>Weekly Goal 🎯</Text>
          </View>
          
          <View style={styles.goalProgress}>
            <Text style={styles.goalPoints}>
              {currentWeekPoints} / {weeklyGoal} points
            </Text>
            <ProgressBar
              progress={currentWeekPoints / weeklyGoal}
              color="#ffd700"
              style={styles.goalProgressBar}
            />
            <Text style={styles.goalRemaining}>
              {weeklyGoal - currentWeekPoints} points to go!
            </Text>
          </View>
        </LinearGradient>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Surface style={styles.statCard}>
          <MaterialIcons name="trending-up" size={32} color="#4CAF50" />
          <Text style={styles.statNumber}>{userStats.weeklyStreak}</Text>
          <Text style={styles.statLabel}>Week Streak</Text>
        </Surface>

        <Surface style={styles.statCard}>
          <MaterialIcons name="jump-rope" size={32} color="#FF9800" />
          <Text style={styles.statNumber}>#{userStats.rank}</Text>
          <Text style={styles.statLabel}>Rank</Text>
        </Surface>

        <Surface style={styles.statCard}>
          <MaterialIcons name="calendar-month" size={32} color="#2196F3" />
          <Text style={styles.statNumber}>{userStats.monthlyPoints}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </Surface>

        <Surface style={styles.statCard}>
          <MaterialIcons name="group" size={32} color="#9C27B0" />
          <Text style={styles.statNumber}>Top 10%</Text>
          <Text style={styles.statLabel}>Percentile</Text>
        </Surface>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions ⚡</Text>
        
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleRedeemRewards}>
            <LinearGradient
              colors={['#ffa726', '#ff7043']}
              style={styles.actionButtonGradient}
            >
              <MaterialIcons name="redeem" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Redeem Rewards</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <LinearGradient
              colors={['#ab47bc', '#8e24aa']}
              style={styles.actionButtonGradient}
            >
              <MaterialIcons name="leaderboard" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Leaderboard</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderActivitiesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Ways to Earn Points 🌟</Text>
      
      <FlatList
        data={pointActivities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleActivityPress(item)}>
            <Card style={[
              styles.activityCard,
              item.completed && styles.completedActivity
            ]}>
              <LinearGradient
                colors={item.completed ? ['#E8F5E8', '#F1F8E9'] : item.color}
                style={styles.activityCardGradient}
              >
                <View style={styles.activityContent}>
                  <View style={styles.activityLeft}>
                    <View style={[
                      styles.activityIcon,
                      { backgroundColor: item.completed ? '#4CAF50' : 'rgba(255,255,255,0.2)' }
                    ]}>
                      <MaterialIcons
                        name={item.completed ? 'check' : item.icon}
                        size={24}
                        color={item.completed ? '#fff' : '#fff'}
                      />
                    </View>
                    
                    <View style={styles.activityInfo}>
                      <Text style={[
                        styles.activityTitle,
                        { color: item.completed ? '#333' : '#fff' }
                      ]}>
                        {item.title}
                      </Text>
                      <Text style={[
                        styles.activityDescription,
                        { color: item.completed ? '#666' : 'rgba(255,255,255,0.9)' }
                      ]}>
                        {item.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.activityRight}>
                    <View style={[
                      styles.pointsBadge,
                      { backgroundColor: item.completed ? '#4CAF50' : 'rgba(255,255,255,0.2)' }
                    ]}>
                      <MaterialIcons name="stars" size={16} color="#ffd700" />
                      <Text style={styles.pointsText}>+{item.points}</Text>
                    </View>
                    
                    {item.completed && (
                      <Chip
                        mode="flat"
                        style={styles.completedChip}
                        textStyle={styles.completedChipText}
                      >
                        Completed!
                      </Chip>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </Card>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.activitiesList}
      />
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Points History 📊</Text>
      
      <FlatList
        data={pointsHistory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.historyCard}>
            <View style={styles.historyContent}>
              <View style={styles.historyLeft}>
                <View style={[
                  styles.historyIcon,
                  {
                    backgroundColor: item.type === 'earned'
                      ? 'rgba(76, 175, 80, 0.1)'
                      : 'rgba(244, 67, 54, 0.1)'
                  }
                ]}>
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={item.type === 'earned' ? '#4CAF50' : '#F44336'}
                  />
                </View>
                
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>{item.activity}</Text>
                  <Text style={styles.historyTime}>{item.time}</Text>
                </View>
              </View>

              <View style={styles.historyRight}>
                <Text style={[
                  styles.historyPoints,
                  {
                    color: item.type === 'earned' ? '#4CAF50' : '#F44336'
                  }
                ]}>
                  {item.type === 'earned' ? '+' : ''}{item.points}
                </Text>
              </View>
            </View>
          </Card>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.historyList}
      />
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverviewTab();
      case 'activities':
        return renderActivitiesTab();
      case 'history':
        return renderHistoryTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              title="Refreshing points..."
              titleColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderTabBar()}
          {renderTabContent()}
        </ScrollView>

        {/* Confetti Animation Overlay */}
        <Animated.View
          style={[
            styles.confettiOverlay,
            {
              opacity: confettiAnim,
              transform: [{
                translateY: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -100]
                })
              }]
            }
          ]}
          pointerEvents="none"
        >
          <Text style={styles.confettiText}>🎉✨🏆✨🎉</Text>
        </Animated.View>

        <FAB
          style={styles.fab}
          icon="add"
          label="Earn More"
          onPress={() => setSelectedTab('activities')}
          color="#fff"
        />
      </Animated.View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelBadge: {
    marginRight: SPACING.md,
  },
  levelBadgeGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  levelEmoji: {
    fontSize: 20,
  },
  levelNumber: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
  },
  levelSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  totalPointsContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: SPACING.md,
    borderRadius: 12,
    minWidth: 80,
  },
  pointsBadge: {
    marginBottom: SPACING.xs,
  },
  totalPointsText: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  totalPointsLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  progressContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.md,
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
    color: 'rgba(255,255,255,0.9)',
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: `${COLORS.primary}15`,
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  tabContent: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  goalCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  goalCardGradient: {
    padding: SPACING.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  goalTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
  },
  goalProgress: {
    alignItems: 'center',
  },
  goalPoints: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  goalProgressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.sm,
  },
  goalRemaining: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: (width - SPACING.lg * 3) / 2,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  quickActions: {
    marginBottom: SPACING.lg,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  actionButtonGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonText: {
    ...TEXT_STYLES.body,
    color: '#fff',
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
  },
  activitiesList: {
    paddingBottom: SPACING.lg,
  },
  activityCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  completedActivity: {
    opacity: 0.8,
  },
  activityCardGradient: {
    padding: SPACING.md,
  },
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  activityDescription: {
    ...TEXT_STYLES.body,
    fontSize: 13,
  },
  activityRight: {
    alignItems: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginBottom: SPACING.xs,
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  completedChip: {
    backgroundColor: '#4CAF50',
  },
  completedChipText: {
    color: '#fff',
    fontSize: 10,
  },
  historyList: {
    paddingBottom: SPACING.lg,
  },
  historyCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  historyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  historyTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyPoints: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
  },
  confettiOverlay: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiText: {
    fontSize: 48,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
    elevation: 8,
  },
};

export default PointsSystem;
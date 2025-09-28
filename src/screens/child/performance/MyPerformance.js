import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Dimensions,
  Vibration,
  ImageBackground,
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
  Divider,
  Badge,
  ProgressChart,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const MyPerformanceScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, goals, achievements } = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Performance tabs
  const performanceTabs = [
    { id: 'overview', name: 'Overview', icon: 'dashboard' },
    { id: 'fitness', name: 'Fitness', icon: 'fitness-center' },
    { id: 'skills', name: 'Skills', icon: 'sports-soccer' },
    { id: 'mental', name: 'Mental', icon: 'psychology' },
  ];

  // Timeframe options
  const timeframes = [
    { id: 'week', name: 'This Week', days: 7 },
    { id: 'month', name: 'This Month', days: 30 },
    { id: 'season', name: 'This Season', days: 90 },
  ];

  // Comprehensive performance data
  const [performanceData, setPerformanceData] = useState({
    playerProfile: {
      name: 'Champion',
      level: 15,
      experience: 2750,
      nextLevelXP: 3000,
      totalPoints: 8450,
      rank: 'Rising Star',
      position: 'Midfielder',
      favoriteSkill: 'Ball Control',
    },
    overallStats: {
      performanceScore: 85,
      improvementRate: 12.5,
      consistency: 88,
      effort: 92,
      attendanceRate: 94,
      goalsCompleted: 15,
      totalSessions: 48,
      streakCount: 12,
    },
    fitnessMetrics: {
      speed: { value: 78, trend: 'up', lastImprovement: '+5%' },
      endurance: { value: 85, trend: 'up', lastImprovement: '+8%' },
      strength: { value: 72, trend: 'steady', lastImprovement: '+2%' },
      flexibility: { value: 80, trend: 'up', lastImprovement: '+6%' },
      coordination: { value: 88, trend: 'excellent', lastImprovement: '+12%' },
      balance: { value: 76, trend: 'up', lastImprovement: '+4%' },
    },
    skillsMetrics: {
      ballControl: { value: 90, trend: 'excellent', lastImprovement: '+15%' },
      passing: { value: 82, trend: 'up', lastImprovement: '+7%' },
      shooting: { value: 75, trend: 'up', lastImprovement: '+9%' },
      dribbling: { value: 86, trend: 'up', lastImprovement: '+11%' },
      defending: { value: 68, trend: 'steady', lastImprovement: '+3%' },
      crossing: { value: 70, trend: 'up', lastImprovement: '+5%' },
    },
    mentalMetrics: {
      focus: { value: 85, trend: 'up', lastImprovement: '+8%' },
      confidence: { value: 88, trend: 'excellent', lastImprovement: '+12%' },
      teamwork: { value: 92, trend: 'excellent', lastImprovement: '+6%' },
      leadership: { value: 75, trend: 'up', lastImprovement: '+10%' },
      resilience: { value: 80, trend: 'up', lastImprovement: '+7%' },
      motivation: { value: 95, trend: 'excellent', lastImprovement: '+5%' },
    },
    recentAchievements: [
      {
        id: 1,
        title: 'Speed Demon',
        description: 'Improved sprint time by 10%',
        date: '2025-08-29',
        points: 500,
        badge: '⚡',
        rarity: 'rare'
      },
      {
        id: 2,
        title: 'Ball Master',
        description: '50 consecutive juggles!',
        date: '2025-08-28',
        points: 300,
        badge: '⚽',
        rarity: 'common'
      },
      {
        id: 3,
        title: 'Team Captain',
        description: 'Led team to victory',
        date: '2025-08-27',
        points: 400,
        badge: '👑',
        rarity: 'epic'
      }
    ],
    weeklyHighlights: [
      'Completed 8 training sessions this week! 🔥',
      'Improved in 5 different skill areas 📈',
      'Maintained perfect attendance streak 💯',
      'Achieved 2 new personal bests this week! ⭐'
    ],
    upcomingGoals: [
      { name: 'Sub-15s Sprint', progress: 80, dueDate: '2025-09-05' },
      { name: '20 Ball Juggles', progress: 60, dueDate: '2025-09-10' },
      { name: 'Team Leadership', progress: 45, dueDate: '2025-09-15' }
    ]
  });

  useEffect(() => {
    // Complex animation sequence
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation for loading elements
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
      Alert.alert('📊 Updated!', 'Your performance data has been refreshed!');
    }, 2000);
  }, []);

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'excellent': return '#9C27B0';
      case 'up': return '#4CAF50';
      case 'steady': return '#FF9800';
      case 'down': return '#F44336';
      default: return COLORS.primary;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'excellent': return 'star';
      case 'up': return 'trending-up';
      case 'steady': return 'trending-flat';
      case 'down': return 'trending-down';
      default: return 'timeline';
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#4CAF50';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FF9800';
      default: return COLORS.primary;
    }
  };

  const navigateToSection = (section) => {
    Vibration.vibrate(50);
    switch (section) {
      case 'goals':
        navigation.navigate('GoalSetting');
        break;
      case 'tracking':
        navigation.navigate('GoalTracking');
        break;
      case 'improvements':
        navigation.navigate('ImprovementTracking');
        break;
      default:
        Alert.alert('🚀 Coming Soon!', `${section} details coming soon!`);
    }
  };

  const renderPlayerProfile = () => {
    const { playerProfile } = performanceData;
    const xpProgress = (playerProfile.experience / playerProfile.nextLevelXP) * 100;

    return (
      <Animated.View 
        style={[
          styles.profileCard,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.profileGradient}>
          <View style={styles.profileHeader}>
            <Avatar.Text 
              size={60} 
              label="🏆" 
              style={styles.profileAvatar}
              labelStyle={{ fontSize: 24 }}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Hey, {playerProfile.name}! 👋</Text>
              <Text style={styles.profileRank}>{playerProfile.rank}</Text>
              <View style={styles.levelContainer}>
                <Text style={styles.levelText}>Level {playerProfile.level}</Text>
                <Surface style={styles.xpBar}>
                  <ProgressBar 
                    progress={xpProgress / 100} 
                    color="#FFD700"
                    style={styles.xpProgress}
                  />
                  <Text style={styles.xpText}>
                    {playerProfile.experience}/{playerProfile.nextLevelXP} XP
                  </Text>
                </Surface>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderOverallStats = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Text style={styles.cardTitle}>📊 Performance Summary</Text>
        
        <View style={styles.statsGrid}>
          <TouchableOpacity 
            style={styles.statBox}
            onPress={() => navigateToSection('Performance Score Details')}
          >
            <Surface style={[styles.statCircle, { backgroundColor: '#E8F5E8' }]}>
              <Text style={[styles.statValue, { color: '#2E7D32' }]}>
                {performanceData.overallStats.performanceScore}
              </Text>
            </Surface>
            <Text style={styles.statLabel}>Performance Score</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statBox}
            onPress={() => navigateToSection('improvements')}
          >
            <Surface style={[styles.statCircle, { backgroundColor: '#FFF3E0' }]}>
              <Text style={[styles.statValue, { color: '#EF6C00' }]}>
                {performanceData.overallStats.improvementRate}%
              </Text>
            </Surface>
            <Text style={styles.statLabel}>Improvement Rate</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statBox}
            onPress={() => navigateToSection('Consistency Details')}
          >
            <Surface style={[styles.statCircle, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.statValue, { color: '#1565C0' }]}>
                {performanceData.overallStats.consistency}%
              </Text>
            </Surface>
            <Text style={styles.statLabel}>Consistency</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statBox}
            onPress={() => navigateToSection('tracking')}
          >
            <Surface style={[styles.statCircle, { backgroundColor: '#FCE4EC' }]}>
              <Text style={[styles.statValue, { color: '#C2185B' }]}>
                {performanceData.overallStats.streakCount}
              </Text>
            </Surface>
            <Text style={styles.statLabel}>Day Streak</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderMetricCard = (title, metrics, icon) => (
    <Card style={styles.metricCard}>
      <Card.Content>
        <View style={styles.metricHeader}>
          <View style={styles.metricTitleSection}>
            <Icon name={icon} size={24} color={COLORS.primary} />
            <Text style={styles.metricTitle}>{title}</Text>
          </View>
          <IconButton
            icon="chevron-right"
            size={20}
            onPress={() => navigateToSection(title.toLowerCase())}
          />
        </View>

        <View style={styles.metricsGrid}>
          {Object.entries(metrics).slice(0, 4).map(([key, metric]) => (
            <TouchableOpacity 
              key={key} 
              style={styles.metricItem}
              onPress={() => {
                setSelectedStat({ name: key, ...metric });
                setShowStatsModal(true);
              }}
            >
              <View style={styles.metricInfo}>
                <Text style={styles.metricName}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <View style={styles.metricValueRow}>
                  <Text style={styles.metricValue}>{metric.value}%</Text>
                  <Surface style={[styles.trendBadge, { backgroundColor: getTrendColor(metric.trend) }]}>
                    <Icon name={getTrendIcon(metric.trend)} size={12} color="white" />
                  </Surface>
                </View>
              </View>
              <View style={styles.metricBar}>
                <ProgressBar 
                  progress={metric.value / 100} 
                  color={getTrendColor(metric.trend)}
                  style={styles.metricProgress}
                />
              </View>
              <Text style={styles.metricImprovement}>{metric.lastImprovement}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={styles.achievementsCard}>
      <Card.Content>
        <View style={styles.achievementsHeader}>
          <Text style={styles.cardTitle}>🏆 Recent Achievements</Text>
          <Button 
            mode="outlined" 
            compact 
            onPress={() => Alert.alert('🏆 All Achievements', 'View all achievements coming soon!')}
          >
            View All
          </Button>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
          {performanceData.recentAchievements.map(achievement => (
            <TouchableOpacity key={achievement.id} style={styles.achievementItem}>
              <Surface style={[
                styles.achievementBadge,
                { borderColor: getRarityColor(achievement.rarity) }
              ]}>
                <Text style={styles.achievementEmoji}>{achievement.badge}</Text>
              </Surface>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              <Surface style={[styles.pointsBadge, { backgroundColor: getRarityColor(achievement.rarity) }]}>
                <Text style={styles.pointsText}>+{achievement.points}</Text>
              </Surface>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderWeeklyHighlights = () => (
    <Card style={styles.highlightsCard}>
      <Card.Content>
        <Text style={styles.cardTitle}>✨ This Week's Highlights</Text>
        {performanceData.weeklyHighlights.map((highlight, index) => (
          <Surface key={index} style={styles.highlightItem}>
            <Text style={styles.highlightText}>{highlight}</Text>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderUpcomingGoals = () => (
    <Card style={styles.goalsCard}>
      <Card.Content>
        <View style={styles.goalsHeader}>
          <Text style={styles.cardTitle}>🎯 Upcoming Goals</Text>
          <Button 
            mode="contained" 
            compact 
            onPress={() => navigateToSection('goals')}
            style={styles.goalsButton}
          >
            Manage
          </Button>
        </View>

        {performanceData.upcomingGoals.map((goal, index) => (
          <View key={index} style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>{goal.name}</Text>
              <Text style={styles.goalDue}>Due: {goal.dueDate}</Text>
            </View>
            <View style={styles.goalProgress}>
              <ProgressBar 
                progress={goal.progress / 100} 
                color={COLORS.primary}
                style={styles.goalProgressBar}
              />
              <Text style={styles.goalPercentage}>{goal.progress}%</Text>
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigateToSection('tracking')}
        >
          <LinearGradient colors={['#FF6B6B', '#EE5A52']} style={styles.actionGradient}>
            <Icon name="update" size={24} color="white" />
            <Text style={styles.actionText}>Update Progress</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigateToSection('goals')}
        >
          <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.actionGradient}>
            <Icon name="flag" size={24} color="white" />
            <Text style={styles.actionText}>Set New Goal</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigateToSection('improvements')}
        >
          <LinearGradient colors={['#45B7D1', '#96C93D']} style={styles.actionGradient}>
            <Icon name="trending-up" size={24} color="white" />
            <Text style={styles.actionText}>View Improvements</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('📤 Share', 'Share your awesome progress!')}
        >
          <LinearGradient colors={['#96CEB4', '#FFECD2']} style={styles.actionGradient}>
            <Icon name="share" size={24} color="white" />
            <Text style={styles.actionText}>Share Progress</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {renderOverallStats()}
            {renderAchievements()}
            {renderWeeklyHighlights()}
            {renderUpcomingGoals()}
            {renderQuickActions()}
          </>
        );
      case 'fitness':
        return renderMetricCard('💪 Fitness Metrics', performanceData.fitnessMetrics, 'fitness-center');
      case 'skills':
        return renderMetricCard('⚽ Skills Metrics', performanceData.skillsMetrics, 'sports-soccer');
      case 'mental':
        return renderMetricCard('🧠 Mental Metrics', performanceData.mentalMetrics, 'psychology');
      default:
        return renderOverallStats();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      {/* Player Profile Header */}
      {renderPlayerProfile()}

      {/* Performance Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {performanceTabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
            >
              <Icon 
                name={tab.icon} 
                size={20} 
                color={activeTab === tab.id ? 'white' : COLORS.primary} 
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {renderTabContent()}
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="analytics"
        style={styles.fab}
        onPress={() => Alert.alert('📊 Analytics', 'Detailed analytics coming soon!')}
        color="white"
        customSize={56}
      />

      {/* Stats Detail Modal */}
      <Portal>
        <Modal
          visible={showStatsModal}
          onRequestClose={() => setShowStatsModal(false)}
          animationType="slide"
        >
          <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
            <View style={styles.modalContainer}>
              {selectedStat && (
                <Card style={styles.statsModal}>
                  <LinearGradient 
                    colors={[getTrendColor(selectedStat.trend), '#764ba2']} 
                    style={styles.statsModalGradient}
                  >
                    <IconButton
                      icon="close"
                      iconColor="white"
                      size={24}
                      style={styles.modalCloseButton}
                      onPress={() => setShowStatsModal(false)}
                    />
                    
                    <View style={styles.statsModalContent}>
                      <Text style={styles.statsModalTitle}>
                        {selectedStat.name.charAt(0).toUpperCase() + selectedStat.name.slice(1)}
                      </Text>
                      
                      <View style={styles.statsModalValue}>
                        <Text style={styles.statsModalNumber}>{selectedStat.value}%</Text>
                        <Surface style={styles.statsModalTrend}>
                          <Icon name={getTrendIcon(selectedStat.trend)} size={20} color="white" />
                          <Text style={styles.statsModalTrendText}>{selectedStat.trend}</Text>
                        </Surface>
                      </View>
                      
                      <Text style={styles.statsModalImprovement}>
                        Last improvement: {selectedStat.lastImprovement}
                      </Text>
                      
                      <Button
                        mode="contained"
                        onPress={() => {
                          setShowStatsModal(false);
                          navigateToSection('tracking');
                        }}
                        style={styles.statsModalButton}
                        buttonColor="white"
                        textColor={getTrendColor(selectedStat.trend)}
                      >
                        Update This Metric 🚀
                      </Button>
                    </View>
                  </LinearGradient>
                </Card>
              )}
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
  profileCard: {
    marginHorizontal: SPACING.md,
    marginTop: 50,
    marginBottom: SPACING.md,
    borderRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: SPACING.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  profileName: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileRank: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    marginBottom: SPACING.sm,
  },
  levelContainer: {
    marginTop: SPACING.sm,
  },
  levelText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  xpBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: SPACING.xs,
    position: 'relative',
  },
  xpProgress: {
    height: 6,
    borderRadius: 3,
  },
  xpText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    position: 'absolute',
    right: SPACING.sm,
    top: SPACING.xs,
    fontSize: 10,
  },
  tabsContainer: {
    backgroundColor: 'white',
    elevation: 2,
    paddingVertical: SPACING.sm,
  },
  tabsScroll: {
    paddingHorizontal: SPACING.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 3,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    ...TEXT_STYLES.heading,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    color: COLORS.text.secondary,
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 3,
    marginBottom: SPACING.lg,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metricTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  metricsGrid: {
    flexDirection:'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  metricInfo: {
    marginBottom: SPACING.sm,
  },
  metricName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    fontSize: 14,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  metricValue: {
    ...TEXT_STYLES.heading,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricBar: {
    marginVertical: SPACING.xs,
  },
  metricProgress: {
    height: 6,
    borderRadius: 3,
  },
  metricImprovement: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  achievementsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 3,
    marginBottom: SPACING.lg,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  achievementsScroll: {
    paddingVertical: SPACING.sm,
  },
  achievementItem: {
    width: 140,
    alignItems: 'center',
    marginRight: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  achievementBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    backgroundColor: 'white',
    marginBottom: SPACING.sm,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    color: COLORS.text.secondary,
    fontSize: 10,
    marginBottom: SPACING.sm,
  },
  pointsBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  highlightsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 3,
    marginBottom: SPACING.lg,
  },
  highlightItem: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  highlightText: {
    ...TEXT_STYLES.body,
    color: COLORS.text.primary,
    fontSize: 14,
  },
  goalsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 3,
    marginBottom: SPACING.lg,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  goalsButton: {
    borderRadius: 20,
  },
  goalItem: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  goalInfo: {
    marginBottom: SPACING.sm,
  },
  goalName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    fontSize: 14,
  },
  goalDue: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalProgressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  goalPercentage: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: 12,
    minWidth: 35,
  },
  quickActions: {
    marginBottom: SPACING.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  actionButton: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  actionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  actionText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
  },
  modalBlur: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  statsModal: {
    width: width * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
  },
  statsModalGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsModalContent: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  statsModalTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  statsModalValue: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statsModalNumber: {
    ...TEXT_STYLES.heading,
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.md,
  },
  statsModalTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  statsModalTrendText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
    textTransform: 'capitalize',
  },
  statsModalImprovement: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  statsModalButton: {
    borderRadius: 25,
    paddingHorizontal: SPACING.xl,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default MyPerformanceScreen;
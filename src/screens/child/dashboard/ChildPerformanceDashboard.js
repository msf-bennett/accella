import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Vibration,
  Alert,
  Dimensions,
  Share,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Card, ProgressBar, Avatar, Chip, Surface, FAB, Button, IconButton } from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const chartWidth = width - (SPACING.md * 2);

const ChildPerformanceDashboard = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, performance, goals, recentActivities } = useSelector(state => ({
    user: state.auth.user,
    performance: state.performance.childData || {},
    goals: state.goals.childGoals || [],
    recentActivities: state.activities.recent || []
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week'); // week, month, quarter
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [animatedValue] = useState(new Animated.Value(0));
  const [showGoals, setShowGoals] = useState(true);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    
    // Entrance animation
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Load performance data
    loadPerformanceData();
  }, [selectedTimeframe]);

  const loadPerformanceData = useCallback(async () => {
    try {
      // In a real app, this would fetch from your API
      // dispatch(fetchChildPerformance(selectedTimeframe));
      console.log(`Loading performance data for ${selectedTimeframe}...`);
    } catch (error) {
      console.error('Error loading performance data:', error);
    }
  }, [dispatch, selectedTimeframe]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPerformanceData();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadPerformanceData]);

  const handleShareProgress = async () => {
    try {
      Vibration.vibrate(50);
      Alert.alert(
        '🚧 Feature Coming Soon!',
        'Share your awesome progress with family and friends!',
        [{ text: 'Cool!', style: 'default' }]
      );
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleGoalPress = (goal) => {
    Vibration.vibrate(30);
    Alert.alert(
      `🎯 ${goal.title}`,
      `${goal.description}\n\nProgress: ${goal.progress}%\nDeadline: ${goal.deadline}`,
      [
        { text: 'Keep Going!', style: 'default' },
        { text: 'View Details', onPress: () => navigation.navigate('GoalDetails', { goalId: goal.id }) }
      ]
    );
  };

  // Mock performance data - replace with real data from Redux
  const mockPerformanceData = {
    overallScore: 85,
    improvement: 12,
    weeklyStats: {
      sessionsCompleted: 5,
      totalMinutes: 300,
      averageIntensity: 78,
      skillsImproved: 3
    },
    skillsProgress: {
      speed: 82,
      agility: 75,
      strength: 68,
      technique: 90,
      endurance: 72
    },
    weeklyTrend: [70, 73, 76, 78, 82, 85, 85],
    monthlyGoals: [
      { id: 1, title: '🏃‍♂️ Run 5km', progress: 78, deadline: 'Aug 30', category: 'fitness' },
      { id: 2, title: '⚽ Master Ball Control', progress: 65, deadline: 'Sep 5', category: 'skills' },
      { id: 3, title: '💪 Complete 20 Push-ups', progress: 90, deadline: 'Aug 28', category: 'strength' }
    ],
    recentAchievements: [
      { icon: '🏆', title: 'Best Week Ever!', date: 'Yesterday' },
      { icon: '⚽', title: 'First Goal', date: '3 days ago' },
      { icon: '🔥', title: '5-Day Streak', date: '1 week ago' }
    ]
  };

  const timeframes = [
    { id: 'week', label: 'This Week', icon: 'calendar-view-week' },
    { id: 'month', label: 'This Month', icon: 'calendar-view-month' },
    { id: 'quarter', label: '3 Months', icon: 'date-range' }
  ];

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.7,
    fillShadowGradient: COLORS.primary,
    fillShadowGradientOpacity: 0.3,
  };

  const skillsData = {
    labels: ['Speed', 'Agility', 'Strength', 'Technique', 'Endurance'],
    datasets: [{
      data: [82, 75, 68, 90, 72]
    }]
  };

  const weeklyProgressData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: mockPerformanceData.weeklyTrend,
      color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
      strokeWidth: 3
    }]
  };

  const progressRingData = {
    data: [
      mockPerformanceData.skillsProgress.speed / 100,
      mockPerformanceData.skillsProgress.technique / 100,
      mockPerformanceData.skillsProgress.endurance / 100,
      mockPerformanceData.skillsProgress.agility / 100
    ]
  };

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <Animated.View style={[
        styles.headerContent,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0]
              })
            }
          ]
        }
      ]}>
        <View style={styles.headerTop}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Performance Score</Text>
            <Text style={styles.scoreValue}>{mockPerformanceData.overallScore}</Text>
            <View style={styles.improvementBadge}>
              <Icon name="trending-up" size={16} color="white" />
              <Text style={styles.improvementText}>+{mockPerformanceData.improvement}%</Text>
            </View>
          </View>
          
          <Avatar.Text
            size={80}
            label={mockPerformanceData.overallScore.toString()}
            style={styles.scoreAvatar}
            labelStyle={styles.scoreAvatarLabel}
          />
        </View>

        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Icon name="fitness-center" size={24} color="white" />
            <Text style={styles.statValue}>{mockPerformanceData.weeklyStats.sessionsCompleted}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="schedule" size={24} color="white" />
            <Text style={styles.statValue}>{mockPerformanceData.weeklyStats.totalMinutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="whatshot" size={24} color="white" />
            <Text style={styles.statValue}>{mockPerformanceData.weeklyStats.averageIntensity}%</Text>
            <Text style={styles.statLabel}>Intensity</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="trending-up" size={24} color="white" />
            <Text style={styles.statValue}>{mockPerformanceData.weeklyStats.skillsImproved}</Text>
            <Text style={styles.statLabel}>Skills Up</Text>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {timeframes.map((timeframe) => (
          <TouchableOpacity
            key={timeframe.id}
            onPress={() => {
              setSelectedTimeframe(timeframe.id);
              Vibration.vibrate(30);
            }}
            style={[
              styles.timeframeChip,
              selectedTimeframe === timeframe.id && styles.activeTimeframeChip
            ]}
          >
            <Icon 
              name={timeframe.icon} 
              size={18} 
              color={selectedTimeframe === timeframe.id ? 'white' : COLORS.primary} 
            />
            <Text style={[
              styles.timeframeText,
              selectedTimeframe === timeframe.id && styles.activeTimeframeText
            ]}>
              {timeframe.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderProgressChart = () => (
    <Animated.View style={[
      styles.chartCard,
      {
        opacity: animatedValue,
        transform: [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1]
            })
          }
        ]
      }
    ]}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📈 Weekly Progress</Text>
            <IconButton
              icon="info-outline"
              size={20}
              onPress={() => Alert.alert('Progress Info', 'This chart shows your daily performance scores for the week!')}
            />
          </View>
          
          <LineChart
            data={weeklyProgressData}
            width={chartWidth - 40}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={true}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
          />
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderSkillsBreakdown = () => (
    <Animated.View style={[
      styles.chartCard,
      {
        opacity: animatedValue,
        transform: [
          {
            translateX: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }
        ]
      }
    ]}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>💪 Skills Breakdown</Text>
            <IconButton
              icon="refresh"
              size={20}
              onPress={() => {
                Vibration.vibrate(30);
                loadPerformanceData();
              }}
            />
          </View>
          
          <BarChart
            data={skillsData}
            width={chartWidth - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            withInnerLines={false}
            showValuesOnTopOfBars={true}
            fromZero={true}
          />
          
          <View style={styles.skillsLegend}>
            {Object.entries(mockPerformanceData.skillsProgress).map(([skill, value]) => (
              <View key={skill} style={styles.skillItem}>
                <View style={[styles.skillDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.skillName}>{skill.charAt(0).toUpperCase() + skill.slice(1)}</Text>
                <Text style={styles.skillValue}>{value}%</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderGoalsSection = () => (
    <Animated.View style={[
      styles.goalsCard,
      {
        opacity: animatedValue,
        transform: [
          {
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0]
            })
          }
        ]
      }
    ]}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🎯 Current Goals</Text>
            <TouchableOpacity
              onPress={() => setShowGoals(!showGoals)}
              style={styles.toggleButton}
            >
              <Icon 
                name={showGoals ? 'expand-less' : 'expand-more'} 
                size={24} 
                color={COLORS.primary} 
              />
            </TouchableOpacity>
          </View>
          
          {showGoals && (
            <View style={styles.goalsList}>
              {mockPerformanceData.monthlyGoals.map((goal, index) => (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => handleGoalPress(goal)}
                  style={styles.goalItem}
                >
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalDeadline}>{goal.deadline}</Text>
                  </View>
                  
                  <View style={styles.goalProgress}>
                    <ProgressBar
                      progress={goal.progress / 100}
                      color={goal.progress >= 80 ? COLORS.success : COLORS.primary}
                      style={styles.goalProgressBar}
                    />
                    <Text style={styles.goalProgressText}>{goal.progress}%</Text>
                  </View>
                  
                  {goal.progress >= 90 && (
                    <View style={styles.almostDoneBadge}>
                      <Icon name="celebration" size={16} color={COLORS.success} />
                      <Text style={styles.almostDoneText}>Almost there! 🎉</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderRecentAchievements = () => (
    <Animated.View style={[
      styles.achievementsCard,
      {
        opacity: animatedValue,
        transform: [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1]
            })
          }
        ]
      }
    ]}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.cardTitle}>🏆 Recent Achievements</Text>
          
          <View style={styles.achievementsList}>
            {mockPerformanceData.recentAchievements.map((achievement, index) => (
              <View key={index} style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDate}>{achievement.date}</Text>
                </View>
                <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
              </View>
            ))}
          </View>
          
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Achievements')}
            style={styles.viewAllButton}
            labelStyle={styles.viewAllButtonText}
          >
            View All Achievements
          </Button>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderMotivationalMessage = () => {
    const messages = [
      "🌟 You're doing amazing! Keep up the great work!",
      "🔥 Your dedication is paying off - look at that progress!",
      "💪 Every session makes you stronger and better!",
      "🎯 You're so close to reaching your goals!",
      "⭐ Your improvement this week is incredible!"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return (
      <Animated.View style={[
        styles.motivationCard,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }
          ]
        }
      ]}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.motivationGradient}>
          <Text style={styles.motivationText}>{randomMessage}</Text>
          <TouchableOpacity
            onPress={() => {
              Vibration.vibrate(50);
              Alert.alert('Keep Going!', 'You\'re on the right track! 🚀');
            }}
            style={styles.motivationButton}
          >
            <Text style={styles.motivationButtonText}>Thanks! 😊</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
      <View style={styles.content}>
        {renderTimeframeSelector()}
        
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              progressBackgroundColor="white"
            />
          }
        >
          {renderMotivationalMessage()}
          {renderProgressChart()}
          {renderSkillsBreakdown()}
          {renderGoalsSection()}
          {renderRecentAchievements()}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      <FAB
        style={styles.fab}
        icon="share"
        onPress={handleShareProgress}
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    // Header content styles
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  scoreContainer: {
    flex: 1,
  },
  scoreLabel: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.xs,
  },
  scoreValue: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 48,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  improvementText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  scoreAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scoreAvatarLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  timeframeContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  timeframeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'white',
  },
  activeTimeframeChip: {
    backgroundColor: COLORS.primary,
  },
  timeframeText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontSize: 14,
  },
  activeTimeframeText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  chartCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  goalsCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  achievementsCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  motivationCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  toggleButton: {
    padding: SPACING.xs,
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: 8,
  },
  skillsLegend: {
    marginTop: SPACING.md,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  skillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  skillName: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  skillValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  goalsList: {
    // Goals list styles
  },
  goalItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    flex: 1,
  },
  goalDeadline: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
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
  goalProgressText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
    minWidth: 35,
  },
  almostDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  almostDoneText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
  },
  achievementsList: {
    marginTop: SPACING.sm,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  achievementDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  viewAllButton: {
    marginTop: SPACING.md,
    borderColor: COLORS.primary,
  },
  viewAllButtonText: {
    color: COLORS.primary,
  },
  motivationGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  motivationText: {
    ...TEXT_STYLES.h3,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  motivationButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  motivationButtonText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default ChildPerformanceDashboard;
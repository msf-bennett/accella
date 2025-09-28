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
  Modal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const WeeklyChallenges = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, weeklyProgress, achievements } = useSelector((state) => state.user);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const starAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('current');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedChallenge, setCompletedChallenge] = useState(null);
  const [weekNumber, setWeekNumber] = useState(42);
  const [streakCount, setStreakCount] = useState(5);

  // Current week's challenges
  const currentChallenges = [
    {
      id: 1,
      title: 'Training Champion',
      description: 'Complete 5 training sessions this week',
      type: 'training',
      icon: 'fitness-center',
      color: ['#667eea', '#764ba2'],
      progress: 3,
      target: 5,
      points: 100,
      difficulty: 'Medium',
      daysRemaining: 3,
      isCompleted: false,
      rewards: ['100 points', 'Training badge', 'Coach recognition'],
      tips: ['Schedule sessions early', 'Track your attendance', 'Stay consistent'],
      emoji: '💪',
    },
    {
      id: 2,
      title: 'Skill Builder',
      description: 'Practice 3 different skills daily',
      type: 'skills',
      icon: 'sports-soccer',
      color: ['#4ecdc4', '#44a08d'],
      progress: 15,
      target: 21,
      points: 75,
      difficulty: 'Easy',
      daysRemaining: 3,
      isCompleted: false,
      rewards: ['75 points', 'Skill master badge', 'Progress tracking'],
      tips: ['Mix different skills', 'Focus on form', 'Ask for feedback'],
      emoji: '⚽',
    },
    {
      id: 3,
      title: 'Team Spirit Hero',
      description: 'Encourage 10 teammates this week',
      type: 'social',
      icon: 'people',
      color: ['#ffa726', '#ff7043'],
      progress: 10,
      target: 10,
      points: 50,
      difficulty: 'Easy',
      daysRemaining: 3,
      isCompleted: true,
      rewards: ['50 points', 'Team spirit badge', 'Social butterfly title'],
      tips: ['Give genuine compliments', 'Celebrate others wins', 'Be supportive'],
      emoji: '🤝',
    },
    {
      id: 4,
      title: 'Healthy Habits',
      description: 'Log meals and water intake daily',
      type: 'wellness',
      icon: 'restaurant',
      color: ['#26a69a', '#00897b'],
      progress: 4,
      target: 7,
      points: 60,
      difficulty: 'Easy',
      daysRemaining: 3,
      isCompleted: false,
      rewards: ['60 points', 'Wellness warrior badge', 'Nutrition tips'],
      tips: ['Use the meal tracker', 'Take photos of meals', 'Stay hydrated'],
      emoji: '🥗',
    },
    {
      id: 5,
      title: 'Personal Best',
      description: 'Improve any personal record',
      type: 'performance',
      icon: 'trending-up',
      color: ['#ef5350', '#e53935'],
      progress: 0,
      target: 1,
      points: 150,
      difficulty: 'Hard',
      daysRemaining: 3,
      isCompleted: false,
      rewards: ['150 points', 'Record breaker badge', 'Performance celebration'],
      tips: ['Focus on one metric', 'Track improvements', 'Push your limits safely'],
      emoji: '📈',
    },
  ];

  // Previous week's completed challenges
  const previousChallenges = [
    {
      id: 6,
      title: 'Attendance Ace',
      description: 'Perfect attendance for the week',
      points: 120,
      isCompleted: true,
      completedDate: '6 days ago',
      emoji: '🎯',
    },
    {
      id: 7,
      title: 'Motivation Master',
      description: 'Share 5 motivational quotes',
      points: 80,
      isCompleted: true,
      completedDate: '6 days ago',
      emoji: '✨',
    },
    {
      id: 8,
      title: 'Fitness Explorer',
      description: 'Try 3 new exercises',
      points: 90,
      isCompleted: false,
      emoji: '🏃‍♀️',
    },
  ];

  // Upcoming challenges preview
  const upcomingChallenges = [
    {
      id: 9,
      title: 'Speed Demon',
      description: 'Improve sprint times',
      points: 200,
      difficulty: 'Hard',
      startsIn: '4 days',
      emoji: '⚡',
    },
    {
      id: 10,
      title: 'Teamwork Champion',
      description: 'Complete group activities',
      points: 100,
      difficulty: 'Medium',
      startsIn: '4 days',
      emoji: '👥',
    },
    {
      id: 11,
      title: 'Mindful Athlete',
      description: 'Practice meditation daily',
      points: 75,
      difficulty: 'Easy',
      startsIn: '4 days',
      emoji: '🧘‍♀️',
    },
  ];

  // Weekly stats
  const weeklyStats = {
    totalChallenges: currentChallenges.length,
    completedChallenges: currentChallenges.filter(c => c.isCompleted).length,
    totalPoints: currentChallenges.reduce((sum, c) => sum + (c.isCompleted ? c.points : 0), 0),
    possiblePoints: currentChallenges.reduce((sum, c) => sum + c.points, 0),
    weeklyRank: 8,
    totalParticipants: 45,
  };

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

  const pulseAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pulseAnim]);

  const starAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(starAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(starAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [starAnim]);

  const confettiAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(confettiAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [confettiAnim]);

  const progressAnimation = useCallback((targetProgress) => {
    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  // Effects
  useEffect(() => {
    startEntryAnimation();
    starAnimation();
    
    // Animate overall progress
    const overallProgress = weeklyStats.completedChallenges / weeklyStats.totalChallenges;
    progressAnimation(overallProgress);
  }, [startEntryAnimation, starAnimation, progressAnimation, weeklyStats.completedChallenges, weeklyStats.totalChallenges]);

  // Handlers
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      Vibration.vibrate(50);
      
      // Simulate refreshing challenges
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRefreshing(false);
    } catch (error) {
      console.error('Refresh error:', error);
      setRefreshing(false);
    }
  }, []);

  const handleChallengePress = (challenge) => {
    pulseAnimation();
    Vibration.vibrate(50);
    
    if (challenge.isCompleted) {
      Alert.alert(
        '🎉 Challenge Complete!',
        `You've already completed "${challenge.title}" this week!\n\nRewards earned:\n• ${challenge.rewards?.join('\n• ') || 'Points and badges'}`,
        [{ text: 'Awesome!', style: 'default' }]
      );
    } else {
      Alert.alert(
        `${challenge.emoji} ${challenge.title}`,
        `${challenge.description}\n\nProgress: ${challenge.progress}/${challenge.target}\nReward: ${challenge.points} points\n\nTips:\n• ${challenge.tips?.join('\n• ') || 'Keep going!'}`,
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Start Now!', onPress: () => startChallenge(challenge) }
        ]
      );
    }
  };

  const startChallenge = (challenge) => {
    switch (challenge.type) {
      case 'training':
        navigation.navigate('TrainingSession');
        break;
      case 'skills':
        navigation.navigate('SkillPractice');
        break;
      case 'social':
        navigation.navigate('TeamChat');
        break;
      case 'wellness':
        navigation.navigate('NutritionTracker');
        break;
      case 'performance':
        navigation.navigate('PerformanceTracking');
        break;
      default:
        Alert.alert('Feature Coming Soon!', 'This challenge type is under development 🚧');
    }
  };

  const handleCompleteChallenge = (challenge) => {
    setCompletedChallenge(challenge);
    setShowCompletionModal(true);
    confettiAnimation();
    Vibration.vibrate([100, 50, 100]);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return COLORS.primary;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View style={styles.weekInfo}>
            <Text style={styles.weekTitle}>Week {weekNumber} Challenges 🎯</Text>
            <Text style={styles.weekSubtitle}>
              {weeklyStats.daysRemaining || 3} days remaining
            </Text>
          </View>
          
          <View style={styles.streakContainer}>
            <Animated.View
              style={[
                styles.streakBadge,
                {
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <MaterialIcons name="whatshot" size={24} color="#FF6B6B" />
              <Text style={styles.streakNumber}>{streakCount}</Text>
            </Animated.View>
            <Text style={styles.streakLabel}>Week Streak</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Weekly Progress</Text>
            <Text style={styles.progressStats}>
              {weeklyStats.completedChallenges}/{weeklyStats.totalChallenges} Complete
            </Text>
          </View>
          
          <Animated.View style={styles.progressBarContainer}>
            <ProgressBar
              progress={progressAnim}
              color="#ffd700"
              style={styles.progressBar}
            />
            <Animated.View
              style={[
                styles.progressStars,
                {
                  opacity: starAnim,
                  transform: [{ scale: starAnim }]
                }
              ]}
            >
              <MaterialIcons name="star" size={16} color="#ffd700" />
              <MaterialIcons name="star" size={16} color="#ffd700" />
              <MaterialIcons name="star" size={16} color="#ffd700" />
            </Animated.View>
          </Animated.View>
          
          <View style={styles.progressFooter}>
            <Text style={styles.progressText}>
              {weeklyStats.totalPoints}/{weeklyStats.possiblePoints} points earned
            </Text>
            <Text style={styles.progressRank}>
              Rank #{weeklyStats.weeklyRank} of {weeklyStats.totalParticipants}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'current' && styles.activeTab]}
        onPress={() => setSelectedTab('current')}
      >
        <MaterialIcons
          name="assignment"
          size={20}
          color={selectedTab === 'current' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[
          styles.tabText,
          selectedTab === 'current' && styles.activeTabText
        ]}>
          This Week
        </Text>
        <Badge
          style={styles.activeBadge}
          visible={selectedTab !== 'current'}
          size={16}
        >
          {currentChallenges.length}
        </Badge>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selectedTab === 'previous' && styles.activeTab]}
        onPress={() => setSelectedTab('previous')}
      >
        <MaterialIcons
          name="history"
          size={20}
          color={selectedTab === 'previous' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[
          styles.tabText,
          selectedTab === 'previous' && styles.activeTabText
        ]}>
          Last Week
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selectedTab === 'upcoming' && styles.activeTab]}
        onPress={() => setSelectedTab('upcoming')}
      >
        <MaterialIcons
          name="upcoming"
          size={20}
          color={selectedTab === 'upcoming' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[
          styles.tabText,
          selectedTab === 'upcoming' && styles.activeTabText
        ]}>
          Coming Up
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderChallengeCard = (challenge) => (
    <TouchableOpacity
      key={challenge.id}
      onPress={() => handleChallengePress(challenge)}
    >
      <Card style={[
        styles.challengeCard,
        challenge.isCompleted && styles.completedCard
      ]}>
        <LinearGradient
          colors={challenge.isCompleted 
            ? ['#E8F5E8', '#F1F8E9'] 
            : challenge.color || ['#667eea', '#764ba2']
          }
          style={styles.challengeGradient}
        >
          <View style={styles.challengeHeader}>
            <View style={styles.challengeLeft}>
              <View style={[
                styles.challengeIcon,
                { 
                  backgroundColor: challenge.isCompleted 
                    ? '#4CAF50' 
                    : 'rgba(255,255,255,0.2)' 
                }
              ]}>
                <MaterialIcons
                  name={challenge.isCompleted ? 'check' : challenge.icon}
                  size={24}
                  color="#fff"
                />
              </View>
              
              <View style={styles.challengeInfo}>
                <View style={styles.challengeTitleRow}>
                  <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
                  <Text style={[
                    styles.challengeTitle,
                    { color: challenge.isCompleted ? '#333' : '#fff' }
                  ]}>
                    {challenge.title}
                  </Text>
                </View>
                <Text style={[
                  styles.challengeDescription,
                  { color: challenge.isCompleted ? '#666' : 'rgba(255,255,255,0.9)' }
                ]}>
                  {challenge.description}
                </Text>
              </View>
            </View>

            <View style={styles.challengeRight}>
              <Chip
                mode="flat"
                style={[
                  styles.difficultyChip,
                  { backgroundColor: `${getDifficultyColor(challenge.difficulty)}20` }
                ]}
                textStyle={[
                  styles.difficultyText,
                  { color: getDifficultyColor(challenge.difficulty) }
                ]}
              >
                {challenge.difficulty}
              </Chip>
              
              <View style={[
                styles.pointsBadge,
                { backgroundColor: challenge.isCompleted ? '#4CAF50' : 'rgba(255,255,255,0.2)' }
              ]}>
                <MaterialIcons name="stars" size={16} color="#ffd700" />
                <Text style={styles.pointsText}>{challenge.points}</Text>
              </View>
            </View>
          </View>

          {!challenge.isCompleted && challenge.target && (
            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>
                  Progress: {challenge.progress}/{challenge.target}
                </Text>
                <Text style={styles.progressPercentage}>
                  {Math.round((challenge.progress / challenge.target) * 100)}%
                </Text>
              </View>
              <ProgressBar
                progress={challenge.progress / challenge.target}
                color="#ffd700"
                style={styles.challengeProgressBar}
              />
              <Text style={styles.daysRemaining}>
                {challenge.daysRemaining} days remaining
              </Text>
            </View>
          )}

          {challenge.isCompleted && (
            <View style={styles.completedSection}>
              <MaterialIcons name="jump-rope" size={20} color="#4CAF50" />
              <Text style={styles.completedText}>Challenge Complete! 🎉</Text>
            </View>
          )}
        </LinearGradient>
      </Card>
    </TouchableOpacity>
  );

  const renderPreviousCard = (challenge) => (
    <Card key={challenge.id} style={styles.previousCard}>
      <View style={styles.previousContent}>
        <View style={styles.previousLeft}>
          <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
          <View style={styles.previousInfo}>
            <Text style={styles.previousTitle}>{challenge.title}</Text>
            <Text style={styles.previousDescription}>{challenge.description}</Text>
            <Text style={styles.previousDate}>{challenge.completedDate}</Text>
          </View>
        </View>
        
        <View style={styles.previousRight}>
          {challenge.isCompleted ? (
            <View style={styles.completedBadge}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.earnedPoints}>+{challenge.points}</Text>
            </View>
          ) : (
            <View style={styles.missedBadge}>
              <MaterialIcons name="cancel" size={20} color="#F44336" />
              <Text style={styles.missedText}>Missed</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  const renderUpcomingCard = (challenge) => (
    <Card key={challenge.id} style={styles.upcomingCard}>
      <View style={styles.upcomingContent}>
        <View style={styles.upcomingLeft}>
          <View style={styles.upcomingIcon}>
            <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
          </View>
          <View style={styles.upcomingInfo}>
            <Text style={styles.upcomingTitle}>{challenge.title}</Text>
            <Text style={styles.upcomingDescription}>{challenge.description}</Text>
            <View style={styles.upcomingMeta}>
              <Chip
                mode="flat"
                style={[
                  styles.difficultyChip,
                  { backgroundColor: `${getDifficultyColor(challenge.difficulty)}20` }
                ]}
                textStyle={[
                  styles.difficultyText,
                  { color: getDifficultyColor(challenge.difficulty) }
                ]}
              >
                {challenge.difficulty}
              </Chip>
              <Text style={styles.upcomingPoints}>+{challenge.points} pts</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.upcomingRight}>
          <Text style={styles.startsIn}>Starts in</Text>
          <Text style={styles.startsInTime}>{challenge.startsIn}</Text>
          <TouchableOpacity style={styles.remindButton}>
            <MaterialIcons name="notifications" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderCurrentTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>This Week's Challenges 🎯</Text>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.challengesList}
      >
        {currentChallenges.map(renderChallengeCard)}
        
        <Surface style={styles.weeklyRewardCard}>
          <LinearGradient
            colors={['#ffd700', '#ffb300']}
            style={styles.rewardGradient}
          >
            <MaterialIcons name="card-giftcard" size={32} color="#fff" />
            <Text style={styles.rewardTitle}>Weekly Bonus Reward!</Text>
            <Text style={styles.rewardDescription}>
              Complete all challenges to unlock a special bonus of 200 points + exclusive badge!
            </Text>
            <ProgressBar
              progress={weeklyStats.completedChallenges / weeklyStats.totalChallenges}
              color="#fff"
              style={styles.rewardProgress}
            />
          </LinearGradient>
        </Surface>
      </ScrollView>
    </View>
  );

  const renderPreviousTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Last Week's Results 📊</Text>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.challengesList}
      >
        {previousChallenges.map(renderPreviousCard)}
        
        <Surface style={styles.weekSummaryCard}>
          <Text style={styles.summaryTitle}>Week {weekNumber - 1} Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>2</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>200</Text>
              <Text style={styles.summaryLabel}>Points Earned</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>#12</Text>
              <Text style={styles.summaryLabel}>Final Rank</Text>
            </View>
          </View>
        </Surface>
      </ScrollView>
    </View>
  );

  const renderUpcomingTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Next Week Preview 🚀</Text>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.challengesList}
      >
        {upcomingChallenges.map(renderUpcomingCard)}
        
        <Surface style={styles.preparationCard}>
          <MaterialIcons name="school" size={32} color={COLORS.primary} />
          <Text style={styles.preparationTitle}>Get Ready! 💪</Text>
          <Text style={styles.preparationDescription}>
            Next week's challenges will focus on speed, teamwork, and mindfulness. 
            Start preparing now to maximize your success!
          </Text>
          <Button
            mode="outlined"
            style={styles.preparationButton}
            onPress={() => Alert.alert('Feature Coming Soon!', 'Preparation guide coming soon! 📚')}
          >
            View Prep Guide
          </Button>
        </Surface>
      </ScrollView>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'current':
        return renderCurrentTab();
      case 'previous':
        return renderPreviousTab();
      case 'upcoming':
        return renderUpcomingTab();
      default:
        return renderCurrentTab();
    }
  };

  const renderCompletionModal = () => (
    <Portal>
      <Modal
        visible={showCompletionModal}
        onDismiss={() => setShowCompletionModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <View style={styles.modalContent}>
            <Animated.View
              style={[
                styles.celebrationContainer,
                {
                  transform: [{ scale: confettiAnim }],
                  opacity: confettiAnim,
                }
              ]}
            >
              <Text style={styles.celebrationEmoji}>🎉✨🏆✨🎉</Text>
            </Animated.View>
            
            <Text style={styles.modalTitle}>Challenge Complete!</Text>
            <Text style={styles.modalSubtitle}>
              {completedChallenge?.title || 'Great job!'}
            </Text>
            
            <View style={styles.rewardsContainer}>
              <Text style={styles.rewardsTitle}>Rewards Earned:</Text>
              {completedChallenge?.rewards?.map((reward, index) => (
                <Text key={index} style={styles.rewardItem}>• {reward}</Text>
              ))}
            </View>
            
            <Button
              mode="contained"
              onPress={() => setShowCompletionModal(false)}
              style={styles.modalButton}
            >
              Awesome!
            </Button>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

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
              title="Loading challenges..."
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
                  outputRange: [0, -200]
                })
              }]
            }
          ]}
          pointerEvents="none"
        >
          <Text style={styles.confettiText}>🎉✨🏆✨🎉</Text>
        </Animated.View>

        {renderCompletionModal()}

        <FAB
          style={styles.fab}
          icon="assignment"
          label="My Progress"
          onPress={() => navigation.navigate('Progress')}
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
  weekInfo: {
    flex: 1,
  },
  weekTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  weekSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginBottom: SPACING.xs,
  },
  streakNumber: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  streakLabel: {
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
  progressTitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    fontWeight: '500',
  },
  progressStats: {
    ...TEXT_STYLES.body,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressStars: {
    position: 'absolute',
    top: -3,
    right: 0,
    flexDirection: 'row',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  progressRank: {
    ...TEXT_STYLES.caption,
    color: '#ffd700',
    fontWeight: 'bold',
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
    position: 'relative',
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
  activeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
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
  challengesList: {
    paddingBottom: SPACING.lg,
  },
  challengeCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  completedCard: {
    opacity: 0.9,
  },
  challengeGradient: {
    padding: SPACING.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  challengeLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  challengeEmoji: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  challengeTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
  },
  challengeDescription: {
    ...TEXT_STYLES.body,
    fontSize: 13,
    lineHeight: 18,
  },
  challengeRight: {
    alignItems: 'flex-end',
  },
  difficultyChip: {
    marginBottom: SPACING.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  progressSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: '#fff',
    fontWeight: '500',
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  challengeProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.sm,
  },
  daysRemaining: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  completedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    padding: SPACING.md,
    borderRadius: 12,
  },
  completedText: {
    ...TEXT_STYLES.body,
    color: '#4CAF50',
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
  },
  weeklyRewardCard: {
    marginTop: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
  },
  rewardGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  rewardTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  rewardDescription: {
    ...TEXT_STYLES.body,
    color: '#fff',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  rewardProgress: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  previousCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  previousContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  previousLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  previousInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  previousTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  previousDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  previousDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  previousRight: {
    alignItems: 'flex-end',
  },
  completedBadge: {
    alignItems: 'center',
  },
  earnedPoints: {
    ...TEXT_STYLES.caption,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 2,
  },
  missedBadge: {
    alignItems: 'center',
  },
  missedText: {
    ...TEXT_STYLES.caption,
    color: '#F44336',
    marginTop: 2,
  },
  weekSummaryCard: {
    padding: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
    marginTop: SPACING.lg,
  },
  summaryTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  summaryLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  upcomingCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  upcomingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  upcomingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  upcomingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  upcomingDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  upcomingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  upcomingPoints: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  upcomingRight: {
    alignItems: 'center',
  },
  startsIn: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  startsInTime: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: SPACING.xs,
  },
  remindButton: {
    padding: 4,
  },
  preparationCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: 12,
    elevation: 2,
    marginTop: SPACING.lg,
  },
  preparationTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginTop: SPACING.md,
    fontWeight: 'bold',
  },
  preparationDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  preparationButton: {
    borderColor: COLORS.primary,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    maxWidth: width * 0.9,
    elevation: 8,
  },
  celebrationContainer: {
    marginBottom: SPACING.lg,
  },
  celebrationEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  rewardsContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  rewardsTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  rewardItem: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    minWidth: 120,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
    elevation: 8,
  },
};

export default WeeklyChallenge;
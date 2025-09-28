import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Animated,
  TouchableOpacity,
  Modal,
  StatusBar,
  ImageBackground,
  Vibration,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Text,
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Searchbar,
  Portal,
  FAB,
  Badge,
  Surface
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from '../../components/shared/LinearGradient';
import { BlurView } from '../../components/shared/BlurView';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const ChildDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [quickSearchVisible, setQuickSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTimeSlot, setCurrentTimeSlot] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [motivationMode, setMotivationMode] = useState(true);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const { user } = useSelector(state => state.auth);
  const { trainingPlan, currentSession } = useSelector(state => state.child || {});
  const dispatch = useDispatch();

  useEffect(() => {
    // Animate components on load
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
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ]).start();

    updateTimeSlot();
    const interval = setInterval(updateTimeSlot, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateTimeSlot = () => {
    const hour = new Date().getHours();
    if (hour < 6) setCurrentTimeSlot('Late Night');
    else if (hour < 12) setCurrentTimeSlot('Morning');
    else if (hour < 17) setCurrentTimeSlot('Afternoon');
    else if (hour < 21) setCurrentTimeSlot('Evening');
    else setCurrentTimeSlot('Night');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Vibration.vibrate([50, 100, 50]);
    // Simulate API call - in real app, dispatch actions to fetch latest data
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greetings = {
      morning: ['Rise & Shine', 'Good Morning', 'Ready to Train', 'Morning Champion'],
      afternoon: ['Keep Going', 'Good Afternoon', 'Stay Strong', 'Afternoon Warrior'],
      evening: ['Almost Done', 'Good Evening', 'Final Push', 'Evening Star'],
      night: ['Rest Well', 'Good Night', 'Sweet Dreams', 'Night Champion']
    };
    
    let timeKey = 'morning';
    if (hour >= 12 && hour < 17) timeKey = 'afternoon';
    else if (hour >= 17 && hour < 21) timeKey = 'evening';
    else if (hour >= 21 || hour < 6) timeKey = 'night';
    
    const options = greetings[timeKey];
    return options[Math.floor(Math.random() * options.length)];
  };

  // Mock child data - in real app this would come from Redux store
  const childData = {
    name: user?.firstName || 'Emma',
    age: 12,
    sport: 'Football',
    level: 'Youth League',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
    coach: 'Coach Martinez',
    academy: 'Champions Sports Academy',
    totalPoints: 2450,
    weeklyStreak: 5,
    currentLevel: 'Bronze Champion',
    nextLevel: 'Silver Star',
    pointsToNextLevel: 550,
    achievements: 12,
    badges: 8,
    personalBests: 15,
    friendsCount: 23
  };

  // Enhanced stats with gamification
  const playerStats = [
    { 
      icon: 'jump-rope', 
      label: 'Points', 
      value: childData.totalPoints.toLocaleString(), 
      subtitle: 'total earned',
      color: '#FFD700',
      bgGradient: ['#FFD700', '#FFA500'],
      trend: '+180 this week',
      animation: bounceAnim
    },
    { 
      icon: 'local-fire-department', 
      label: 'Streak', 
      value: `${childData.weeklyStreak}`, 
      subtitle: 'days in a row',
      color: '#FF6B6B',
      bgGradient: ['#FF6B6B', '#FF8E8E'],
      trend: 'Keep it up!',
      animation: bounceAnim
    },
    { 
      icon: 'fitness-center', 
      label: 'Sessions', 
      value: '23', 
      subtitle: 'this month',
      color: '#4ECDC4',
      bgGradient: ['#4ECDC4', '#44B3AA'],
      trend: '5 completed',
      animation: bounceAnim
    },
    { 
      icon: 'star', 
      label: 'Level', 
      value: childData.currentLevel.split(' ')[0], 
      subtitle: childData.currentLevel.split(' ')[1] || 'Champion',
      color: '#9B59B6',
      bgGradient: ['#9B59B6', '#8E44AD'],
      trend: `${childData.pointsToNextLevel} to next`,
      animation: bounceAnim
    },
  ];

  // Today's training schedule
  const todayTraining = [
    {
      id: 1,
      title: 'Agility & Speed Training',
      time: '4:00 PM',
      duration: 60,
      status: 'upcoming',
      type: 'Team Practice',
      difficulty: 'Medium',
      coach: childData.coach,
      location: 'Main Field',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
      exercises: ['Cone drills', 'Sprint intervals', 'Ball control'],
      points: 150,
      funFactor: '⚡ High Energy'
    },
    {
      id: 2,
      title: 'Strength & Conditioning',
      time: '6:00 PM',
      duration: 45,
      status: 'completed',
      type: 'Personal Training',
      difficulty: 'Hard',
      coach: childData.coach,
      location: 'Gym A',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
      exercises: ['Push-ups', 'Squats', 'Core work'],
      points: 120,
      funFactor: '💪 Strength Builder',
      completionRate: 95,
      coachRating: 4.8
    }
  ];

  // Quick actions categorized by areas
  const quickActionsData = [
    {
      category: 'Training',
      actions: [
        { 
          icon: 'play-arrow', 
          label: 'Start Training', 
          action: () => showFeatureAlert('TodaysSession'),
          color: '#4CAF50'
        },
        { 
          icon: 'assignment', 
          label: 'My Plan', 
          action: () => showFeatureAlert('MyTrainingPlan'),
          color: '#2196F3'
        },
        { 
          icon: 'video-library', 
          label: 'Learn Skills', 
          action: () => showFeatureAlert('TechniqueVideos'),
          color: '#FF9800'
        },
        { 
          icon: 'timer', 
          label: 'Workout Timer', 
          action: () => showFeatureAlert('WorkoutTimer'),
          color: '#9C27B0'
        },
      ]
    },
    {
      category: 'Progress',
      actions: [
        { 
          icon: 'trending-up', 
          label: 'My Progress', 
          action: () => showFeatureAlert('ProgressTracking'),
          color: '#4ECDC4'
        },
        { 
          icon: 'assessment', 
          label: 'Performance', 
          action: () => showFeatureAlert('MyPerformance'),
          color: '#FF6B6B'
        },
        { 
          icon: 'jump-rope', 
          label: 'Achievements', 
          action: () => showFeatureAlert('Achievements'),
          color: '#FFD700'
        },
        { 
          icon: 'military-tech', 
          label: 'Badges', 
          action: () => showFeatureAlert('Badges'),
          color: '#795548'
        },
      ]
    },
    {
      category: 'Social',
      actions: [
        { 
          icon: 'chat', 
          label: 'Team Chat', 
          action: () => showFeatureAlert('TeamChat'),
          color: '#4CAF50'
        },
        { 
          icon: 'people', 
          label: 'Find Friends', 
          action: () => showFeatureAlert('FindTeammates'),
          color: '#2196F3'
        },
        { 
          icon: 'leaderboard', 
          label: 'Leaderboard', 
          action: () => showFeatureAlert('Leaderboards'),
          color: '#FF5722'
        },
        { 
          icon: 'group-work', 
          label: 'Study Groups', 
          action: () => showFeatureAlert('StudyGroups'),
          color: '#607D8B'
        },
      ]
    },
    {
      category: 'Wellness',
      actions: [
        { 
          icon: 'restaurant', 
          label: 'Nutrition', 
          action: () => showFeatureAlert('NutritionGuide'),
          color: '#4CAF50'
        },
        { 
          icon: 'local-drink', 
          label: 'Hydration', 
          action: () => showFeatureAlert('HydrationTracker'),
          color: '#2196F3'
        },
        { 
          icon: 'bedtime', 
          label: 'Sleep', 
          action: () => showFeatureAlert('SleepTracker'),
          color: '#673AB7'
        },
        { 
          icon: 'self-improvement', 
          label: 'Mental Health', 
          action: () => showFeatureAlert('MentalWellness'),
          color: '#E91E63'
        },
      ]
    }
  ];

  // Achievements and progress
  const recentAchievements = [
    {
      id: 1,
      title: 'Speed Demon! 🏃‍♀️',
      description: 'Completed 10 sprint sessions',
      points: 200,
      date: 'Today',
      color: '#FF6B6B',
      icon: 'flash-on'
    },
    {
      id: 2,
      title: 'Team Player 🤝',
      description: 'Helped teammates in training',
      points: 150,
      date: 'Yesterday',
      color: '#4ECDC4',
      icon: 'people'
    },
    {
      id: 3,
      title: 'Perfect Week! ⭐',
      description: 'Attended all sessions this week',
      points: 300,
      date: '2 days ago',
      color: '#FFD700',
      icon: 'star'
    }
  ];

  // Learning progress
  const learningProgress = [
    {
      id: 1,
      skill: 'Ball Control',
      level: 'Intermediate',
      progress: 0.75,
      nextMilestone: 'Advanced dribbling',
      points: 450,
      color: '#4CAF50'
    },
    {
      id: 2,
      skill: 'Team Strategy',
      level: 'Beginner',
      progress: 0.45,
      nextMilestone: 'Formation understanding',
      points: 280,
      color: '#2196F3'
    },
    {
      id: 3,
      skill: 'Physical Fitness',
      level: 'Intermediate',
      progress: 0.68,
      nextMilestone: 'Endurance boost',
      points: 380,
      color: '#FF9800'
    }
  ];

  // Recent activities with coach feedback
  const recentActivities = [
    { 
      id: 1, 
      text: 'Excellent performance in agility drills! 🌟', 
      time: '2 hours ago',
      type: 'coach_feedback',
      icon: 'feedback',
      color: '#4CAF50',
      points: '+50 points'
    },
    { 
      id: 2, 
      text: 'Completed strength training session', 
      time: '1 day ago',
      type: 'completion',
      icon: 'check-circle',
      color: '#2196F3',
      points: '+120 points'
    },
    { 
      id: 3, 
      text: 'New technique video watched', 
      time: '2 days ago',
      type: 'learning',
      icon: 'play-circle',
      color: '#FF9800',
      points: '+30 points'
    },
    { 
      id: 4, 
      text: 'Helped teammate with drill', 
      time: '3 days ago',
      type: 'social',
      icon: 'people',
      color: '#9C27B0',
      points: '+75 points'
    },
  ];

  const showFeatureAlert = (featureName) => {
    Alert.alert(
      'Feature Under Development 🚧',
      `The ${featureName.replace(/([A-Z])/g, ' $1').trim()} feature is currently being built and will be available soon!`,
      [
        {
          text: 'Got it!',
          style: 'default'
        }
      ]
    );
  };

  const renderTabContent = () => {
    const currentActions = quickActionsData.find(cat => 
      cat.category.toLowerCase() === activeTab || activeTab === 'overview'
    );
    
    if (activeTab === 'overview') {
      // Show mix of actions from different categories
      const mixedActions = quickActionsData.flatMap(cat => 
        cat.actions.slice(0, 2)
      ).slice(0, 8);
      
      return mixedActions;
    }

    return currentActions?.actions || [];
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  const renderQuickSearchModal = () => (
    <Portal>
      <Modal
        visible={quickSearchVisible}
        onDismiss={() => setQuickSearchVisible(false)}
        contentContainerStyle={styles.searchModal}>
        <BlurView intensity={90} style={styles.searchBlur}>
          <View style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchTitle}>What do you want to learn? 🎯</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setQuickSearchVisible(false)}
              />
            </View>
            <Searchbar
              placeholder="Search skills, exercises, challenges..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
              autoFocus
            />
            <View style={styles.quickSearchOptions}>
              {[
                'Ball Control', 'Speed Training', 'Team Strategy', 
                'Fitness Tests', 'Technique Videos', 'Fun Challenges'
              ].map((option) => (
                <Chip
                  key={option}
                  mode="outlined"
                  onPress={() => {
                    setQuickSearchVisible(false);
                    showFeatureAlert(option);
                  }}
                  style={styles.searchChip}>
                  {option}
                </Chip>
              ))}
            </View>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Enhanced Child Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }]
          }
        ]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}>
          
          <View style={styles.headerTop}>
            <View style={styles.appBranding}>
              <Text style={styles.appName}>acceilla</Text>
              <Text style={styles.tagline}>Train • Learn • Achieve</Text>
            </View>
            
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => setQuickSearchVisible(true)}>
                <Icon name="search" size={24} color="white" style={styles.headerIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => showFeatureAlert('Notifications')}>
                <View style={styles.notificationContainer}>
                  <Icon name="notifications" size={24} color="white" style={styles.headerIcon} />
                  <View style={styles.notificationBadge}>
                     <Text style={styles.notificationText}>3</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMotivationMode(!motivationMode)}>
                <Icon name={motivationMode ? "emoji-emotions" : "mood"} size={24} color="white" style={styles.headerIcon} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerContent}>
            <Avatar.Image 
              size={60} 
              source={{ uri: childData.avatar }}
              style={styles.userAvatar}
            />
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{childData.name}! 🌟</Text>
              <Text style={styles.timeSlot}>
                {currentTimeSlot} • Level: {childData.currentLevel}
              </Text>
            </View>
          </View>

          {/* Level Progress Bar */}
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelText}>{childData.currentLevel}</Text>
              <Text style={styles.nextLevelText}>{childData.pointsToNextLevel} points to {childData.nextLevel}</Text>
            </View>
            <ProgressBar 
              progress={(childData.totalPoints % 3000) / 3000} 
              color="rgba(255,255,255,0.9)"
              style={styles.levelProgressBar}
            />
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#667eea"
            colors={['#667eea', '#764ba2']}
          />
        }>

        {/* Gamified Stats Grid */}
        <Animated.View 
          style={[
            styles.statsSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
          <Text style={styles.sectionTitle}>My Stats 📊</Text>
          <View style={styles.statsGrid}>
            {playerStats.map((stat, index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.statCard,
                  {
                    transform: [{
                      scale: stat.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1]
                      })
                    }]
                  }
                ]}>
                <LinearGradient
                  colors={stat.bgGradient}
                  style={styles.statGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <View style={styles.statHeader}>
                    <Icon name={stat.icon} size={28} color="white" />
                    <Text style={styles.statTrend}>{stat.trend}</Text>
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
                </LinearGradient>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Today's Training */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Training 🏋️‍♀️</Text>
            <Button 
              mode="text" 
              onPress={() => showFeatureAlert('TrainingCalendar')}
              textColor="#667eea">
              View All
            </Button>
          </View>
          
          {todayTraining.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.noSessionsText}>No training scheduled for today</Text>
                <Text style={styles.motivationText}>Perfect rest day! 😴✨</Text>
                <Button 
                  mode="contained"
                  buttonColor="#667eea"
                  style={styles.createButton}
                  onPress={() => showFeatureAlert('PersonalWorkouts')}>
                  Create Personal Workout
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sessionsScroll}>
              {todayTraining.map((session) => (
                <Card key={session.id} style={styles.sessionCard}>
                  <ImageBackground
                    source={{ uri: session.image }}
                    style={styles.sessionImage}
                    imageStyle={styles.sessionImageStyle}>
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.sessionOverlay}>
                      
                      <View style={styles.sessionHeader}>
                        <Chip 
                          mode="flat"
                          textStyle={styles.typeText}
                          style={styles.typeChip}>
                          {session.type}
                        </Chip>
                        <View style={styles.statusContainer}>
                          <Text style={styles.pointsText}>+{session.points} pts</Text>
                          <Chip 
                            mode="flat"
                            textStyle={styles.statusText}
                            style={[styles.statusChip, { 
                              backgroundColor: session.status === 'completed' ? '#4CAF50' : '#2196F3' 
                            }]}>
                            {session.status === 'completed' ? '✓' : '○'}
                          </Chip>
                        </View>
                      </View>

                      <View style={styles.sessionContent}>
                        <Text style={styles.sessionTitle}>{session.title}</Text>
                        <Text style={styles.funFactor}>{session.funFactor}</Text>
                        <Text style={styles.sessionCoach}>👨‍🏫 {session.coach}</Text>
                        
                        <View style={styles.sessionDetails}>
                          <View style={styles.sessionDetailItem}>
                            <Icon name="schedule" size={16} color="white" />
                            <Text style={styles.sessionDetailText}>{session.time}</Text>
                          </View>
                          <View style={styles.sessionDetailItem}>
                            <Icon name="timer" size={16} color="white" />
                            <Text style={styles.sessionDetailText}>{session.duration}m</Text>
                          </View>
                          <View style={styles.sessionDetailItem}>
                            <Icon name="fitness-center" size={16} color="white" />
                            <Text style={styles.sessionDetailText}>{session.difficulty}</Text>
                          </View>
                        </View>

                        {session.exercises && (
                          <View style={styles.exercisesContainer}>
                            <Text style={styles.exercisesTitle}>What we'll do:</Text>
                            <Text style={styles.exercisesText}>
                              {session.exercises.join(' • ')}
                            </Text>
                          </View>
                        )}

                        {session.status === 'completed' && (
                          <View style={styles.completionContainer}>
                            <Text style={styles.completionText}>
                              Your Score: {session.completionRate}% ⭐
                            </Text>
                            <Text style={styles.coachRating}>
                              Coach Rating: {session.coachRating}/5 ⭐
                            </Text>
                            <ProgressBar 
                              progress={session.completionRate / 100} 
                              color="#4CAF50"
                              style={styles.completionBar}
                            />
                          </View>
                        )}

                        <Button
                          mode="contained"
                          buttonColor={session.status === 'upcoming' ? "#667eea" : "rgba(255,255,255,0.2)"}
                          textColor="white"
                          style={styles.sessionButton}
                          onPress={() => showFeatureAlert(session.status === 'upcoming' ? 'TodaysSession' : 'SessionDetails')}>
                          {session.status === 'upcoming' ? 'Start Training! 🚀' : 'View Details'}
                        </Button>
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                </Card>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recent Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Achievements 🏆</Text>
            <Button 
              mode="text" 
              onPress={() => showFeatureAlert('AchievementCenter')}
              textColor="#667eea">
              View All
            </Button>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}>
            {recentAchievements.map((achievement) => (
              <Card key={achievement.id} style={styles.achievementCard}>
                <LinearGradient
                  colors={[achievement.color, `${achievement.color}CC`]}
                  style={styles.achievementGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  
                  <View style={styles.achievementHeader}>
                    <Icon name={achievement.icon} size={40} color="white" />
                    <Text style={styles.achievementPoints}>+{achievement.points}</Text>
                  </View>

                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <Text style={styles.achievementDate}>{achievement.date}</Text>
                  
                  <Button
                    mode="contained"
                    buttonColor="rgba(255,255,255,0.2)"
                    textColor="white"
                    style={styles.achievementButton}
                    onPress={() => showFeatureAlert('Share')}>
                    Share Achievement
                  </Button>
                </LinearGradient>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Learning Progress */}
        <Card style={styles.learningCard}>
          <Card.Title 
            title="My Learning Journey 📚"
            subtitle="Track your skill development"
          />
          <Card.Content>
            {learningProgress.map((skill) => (
              <View key={skill.id} style={styles.skillItem}>
                <View style={styles.skillHeader}>
                  <View style={styles.skillInfo}>
                    <Text style={styles.skillName}>{skill.skill}</Text>
                    <Text style={styles.skillLevel}>{skill.level} • {skill.points} points</Text>
                  </View>
                  <Text style={styles.skillProgress}>{Math.round(skill.progress * 100)}%</Text>
                </View>
                <ProgressBar 
                  progress={skill.progress} 
                  color={skill.color}
                  style={styles.skillProgressBar}
                />
                <Text style={styles.nextMilestone}>Next: {skill.nextMilestone}</Text>
              </View>
            ))}
            <Button 
              mode="outlined" 
              style={styles.learningButton}
              onPress={() => showFeatureAlert('LearningPath')}>
              View Full Learning Path
            </Button>
          </Card.Content>
        </Card>

        {/* Quick Actions with Tabs */}
        <Card style={styles.quickActionsCard}>
          <Card.Title title="Quick Actions ⚡" />
          <Card.Content>
            <View style={styles.tabContainer}>
              {['overview', 'training', 'progress', 'social', 'wellness'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab)}>
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.quickActionsGrid}>
              {renderTabContent().map((action, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.quickActionCard}
                  onPress={action.action}>
                  <LinearGradient
                    colors={[action.color, `${action.color}CC`]}
                    style={styles.quickActionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}>
                    <Icon name={action.icon} size={28} color="white" />
                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Coach Messages & Feedback */}
        <Card style={styles.coachFeedbackCard}>
          <Card.Title 
            title="Coach Messages 💬"
            subtitle="Latest feedback and encouragement"
          />
          <Card.Content>
            <View style={styles.feedbackItem}>
              <Avatar.Image 
                size={40} 
                source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }}
                style={styles.coachAvatar}
              />
              <View style={styles.feedbackContent}>
                <Text style={styles.coachName}>{childData.coach}</Text>
                <Text style={styles.feedbackText}>
                  "Excellent improvement in ball control! Keep practicing those drills we worked on. 
                  You're showing real progress! 🌟"
                </Text>
                <Text style={styles.feedbackTime}>2 hours ago</Text>
              </View>
            </View>
            
            <View style={styles.feedbackActions}>
              <Button 
                mode="outlined" 
                style={styles.feedbackButton}
                onPress={() => showFeatureAlert('CoachFeedback')}>
                View All Feedback
              </Button>
              <Button 
                mode="contained"
                buttonColor="#667eea"
                style={styles.feedbackButton}
                onPress={() => showFeatureAlert('ChatScreen')}>
                Message Coach
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Fun Zone - Games & Challenges */}
        <Card style={styles.funZoneCard}>
          <Card.Title 
            title="Fun Zone 🎮"
            subtitle="Games, challenges, and competitions"
          />
          <Card.Content>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity 
                style={styles.funCard}
                onPress={() => showFeatureAlert('DailyQuests')}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E8E']}
                  style={styles.funCardGradient}>
                  <Icon name="assignment" size={32} color="white" />
                  <Text style={styles.funCardTitle}>Daily Quest</Text>
                  <Text style={styles.funCardSubtitle}>Complete 3 drills</Text>
                  <Text style={styles.funCardReward}>+200 pts</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.funCard}
                onPress={() => showFeatureAlert('WeeklyChallenge')}>
                <LinearGradient
                  colors={['#4ECDC4', '#44B3AA']}
                  style={styles.funCardGradient}>
                  <Icon name="jump-rope" size={32} color="white" />
                  <Text style={styles.funCardTitle}>Weekly Challenge</Text>
                  <Text style={styles.funCardSubtitle}>Speed champion</Text>
                  <Text style={styles.funCardReward}>+500 pts</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.funCard}
                onPress={() => showFeatureAlert('TeamCompetitions')}>
                <LinearGradient
                  colors={['#45B7D1', '#3A9BC1']}
                  style={styles.funCardGradient}>
                  <Icon name="groups" size={32} color="white" />
                  <Text style={styles.funCardTitle}>Team Battle</Text>
                  <Text style={styles.funCardSubtitle}>vs Blue Team</Text>
                  <Text style={styles.funCardReward}>+1000 pts</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Recent Activities */}
        <Card style={styles.activitiesCard}>
          <Card.Title 
            title="Recent Activities 📝" 
            subtitle="Your training journey"
          />
          <Card.Content>
            {recentActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={[styles.activityIconContainer, { backgroundColor: `${activity.color}20` }]}>
                  <Icon 
                    name={activity.icon} 
                    size={20} 
                    color={activity.color}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.text}</Text>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                    <Text style={styles.activityPoints}>{activity.points}</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
              </View>
            ))}
            <Button 
              mode="outlined" 
              style={styles.viewAllButton}
              onPress={() => showFeatureAlert('RecentActivity')}>
              View All Activities
            </Button>
          </Card.Content>
        </Card>

        {/* Health & Wellness Tracker */}
        <Card style={styles.wellnessCard}>
          <Card.Title 
            title="My Wellness 💪"
            subtitle="Stay healthy and strong"
          />
          <Card.Content>
            <View style={styles.wellnessGrid}>
              <TouchableOpacity 
                style={styles.wellnessItem}
                onPress={() => showFeatureAlert('HydrationTracker')}>
                <Icon name="local-drink" size={24} color="#2196F3" />
                <Text style={styles.wellnessLabel}>Water</Text>
                <Text style={styles.wellnessValue}>6/8 cups</Text>
                <ProgressBar progress={0.75} color="#2196F3" style={styles.wellnessBar} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.wellnessItem}
                onPress={() => showFeatureAlert('SleepTracker')}>
                <Icon name="bedtime" size={24} color="#673AB7" />
                <Text style={styles.wellnessLabel}>Sleep</Text>
                <Text style={styles.wellnessValue}>8.5h</Text>
                <ProgressBar progress={0.95} color="#673AB7" style={styles.wellnessBar} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.wellnessItem}
                onPress={() => showFeatureAlert('NutritionGuide')}>
                <Icon name="restaurant" size={24} color="#4CAF50" />
                <Text style={styles.wellnessLabel}>Nutrition</Text>
                <Text style={styles.wellnessValue}>Good</Text>
                <ProgressBar progress={0.8} color="#4CAF50" style={styles.wellnessBar} />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* AI Learning Assistant */}
        <Card style={styles.aiAssistantCard}>
          <Card.Title 
            title="AI Learning Buddy 🤖"
            subtitle="Your personal training assistant"
          />
          <Card.Content>
            <View style={styles.aiSuggestion}>
              <Icon name="auto-awesome" size={24} color="#667eea" />
              <Text style={styles.aiSuggestionText}>
                Based on your progress, I recommend focusing on ball control drills this week! 
                Want me to create a personalized plan? ⚽
              </Text>
            </View>
            <View style={styles.aiActions}>
              <Button 
                mode="outlined" 
                style={styles.aiButton}
                onPress={() => showFeatureAlert('PersonalizedRecommendations')}>
                Get Recommendations
              </Button>
              <Button 
                mode="contained"
                buttonColor="#667eea"
                style={styles.aiButton}
                onPress={() => showFeatureAlert('AITrainingAssistant')}>
                Chat with AI
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Parent Connection */}
        <Card style={styles.parentCard}>
          <Card.Title 
            title="Family Connection 👨‍👩‍👧‍👦"
            subtitle="Share your progress with parents"
          />
          <Card.Content>
            <View style={styles.parentStats}>
              <View style={styles.parentStat}>
                <Text style={styles.parentStatValue}>85%</Text>
                <Text style={styles.parentStatLabel}>This Week's Score</Text>
              </View>
              <View style={styles.parentStat}>
                <Text style={styles.parentStatValue}>5</Text>
                <Text style={styles.parentStatLabel}>Days Trained</Text>
              </View>
              <View style={styles.parentStat}>
                <Text style={styles.parentStatValue}>3</Text>
                <Text style={styles.parentStatLabel}>New Skills</Text>
              </View>
            </View>
            <Button 
              mode="contained"
              buttonColor="#667eea"
              style={styles.shareButton}
              onPress={() => showFeatureAlert('ShareProgress')}>
              Share with Parents 📤
            </Button>
          </Card.Content>
        </Card>

        {/* Spacer for FAB */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Floating Action Button for Emergency/Quick Help */}
      <FAB
        icon="help"
        style={styles.fab}
        color="white"
        onPress={() => showFeatureAlert('EmergencyContacts')}
        label="Need Help?"
      />

      {/* Quick Search Modal */}
      {renderQuickSearchModal()}
    </View>
  );
};





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 20,
    zIndex: 1000,
  },
  headerGradient: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  appBranding: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginHorizontal: 8,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userAvatar: {
    marginRight: 15,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginVertical: 2,
  },
  timeSlot: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  levelProgressContainer: {
    marginTop: 10,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextLevelText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  levelProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    marginTop: -20,
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    marginLeft: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statGradient: {
    padding: 15,
    borderRadius: 15,
    minHeight: 120,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTrend: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  emptyCard: {
    borderRadius: 15,
    elevation: 2,
  },
  noSessionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  motivationText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    borderRadius: 25,
  },
  sessionsScroll: {
    paddingLeft: 5,
  },
  sessionCard: {
    width: CARD_WIDTH,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
  },
  sessionImage: {
    height: 280,
    justifyContent: 'flex-end',
  },
  sessionImageStyle: {
    borderRadius: 20,
  },
  sessionOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  typeChip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  typeText: {
    color: '#2c3e50',
    fontSize: 12,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  pointsText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusChip: {
    minWidth: 30,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  funFactor: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 5,
  },
  sessionCoach: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  sessionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  sessionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  sessionDetailText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '500',
  },
  exercisesContainer: {
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 8,
  },
  exercisesTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  exercisesText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  completionContainer: {
    marginBottom: 15,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    padding: 10,
    borderRadius: 8,
  },
  completionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  coachRating: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginBottom: 5,
  },
  completionBar: {
    height: 4,
    borderRadius: 2,
  },
  sessionButton: {
    borderRadius: 25,
    marginTop: 10,
  },
  achievementsScroll: {
    paddingLeft: 5,
  },
  achievementCard: {
    width: 200,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 4,
  },
  achievementGradient: {
    padding: 20,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  achievementPoints: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  achievementDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginBottom: 10,
    flex: 1,
  },
  achievementDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginBottom: 15,
  },
  achievementButton: {
    borderRadius: 20,
  },
  learningCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  skillItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  skillLevel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  skillProgress: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  skillProgressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  nextMilestone: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  learningButton: {
    borderRadius: 25,
    marginTop: 10,
  },
  quickActionsCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  quickActionGradient: {
    padding: 15,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  quickActionLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  coachFeedbackCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  feedbackItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  coachAvatar: {
    marginRight: 12,
  },
  feedbackContent: {
    flex: 1,
  },
  coachName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  feedbackText: {
    fontSize: 13,
    color: '#34495e',
    lineHeight: 18,
    marginBottom: 5,
  },
  feedbackTime: {
    fontSize: 11,
    color: '#7f8c8d',
  },
  feedbackActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedbackButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  funZoneCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  funCard: {
    width: 140,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  funCardGradient: {
    padding: 15,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'space-between',
  },
  funCardTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  funCardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    textAlign: 'center',
  },
  funCardReward: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  activitiesCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 3,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTime: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  activityPoints: {
    fontSize: 11,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  viewAllButton: {
    borderRadius: 25,
    marginTop: 10,
  },
  wellnessCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  wellnessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wellnessItem: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  wellnessLabel: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 3,
  },
  wellnessValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  wellnessBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  aiAssistantCard: {
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
    backgroundColor: '#f8f9ff',
  },
  aiSuggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 10,
    marginBottom: 15,
  },
  aiSuggestionText: {
    flex: 1,
    fontSize: 13,
    color: '#2c3e50',
    lineHeight: 18,
    marginLeft: 10,
 },
aiActions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
aiButton: {
  flex: 1,
  marginHorizontal: 5,
  borderRadius: 20,
},
parentCard: {
  borderRadius: 15,
  elevation: 3,
  marginBottom: 20,
},
parentStats: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 15,
},
parentStat: {
  alignItems: 'center',
  flex: 1,
},
parentStatValue: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: 5,
},
parentStatLabel: {
  fontSize: 12,
  color: '#7f8c8d',
  textAlign: 'center',
},
shareButton: {
  borderRadius: 25,
},
fab: {
  position: 'absolute',
  margin: 16,
  right: 0,
  bottom: 0,
  backgroundColor: '#667eea',
},
searchModal: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
searchBlur: {
  flex: 1,
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
},
searchContainer: {
  backgroundColor: 'white',
  margin: 20,
  borderRadius: 20,
  padding: 20,
  width: '90%',
  maxHeight: '80%',
},
searchHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 15,
},
searchTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#2c3e50',
},
searchBar: {
  marginBottom: 20,
  borderRadius: 15,
},
quickSearchOptions: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
},
searchChip: {
  marginBottom: 5,
},
});

export default ChildDashboard;


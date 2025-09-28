import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Platform,
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
  ProgressBar,
  Portal,
  Modal,
  ActivityIndicator,
  Snackbar,
  Menu,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { BlurView } from '../../../components/shared/BlurView';
//import Icon from 'react-native-vector-icons/MaterialIcons';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../../styles/colors';
import { LAYOUT } from '../../../styles/layout';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TraineeDashboard = ({ navigation }) => {
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));
  const [dailyStreak, setDailyStreak] = useState(7);
  const [weeklyProgress, setWeeklyProgress] = useState(0.75);
  const [currentLevel, setCurrentLevel] = useState(12);
  const [totalPoints, setTotalPoints] = useState(2847);

  // Redux State
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const trainingData = useSelector(state => state.training);

  // Mock Data (Replace with Redux/API data)
  const todaysWorkout = {
    title: "Upper Body Strength",
    duration: "45 min",
    exercises: 8,
    completed: false,
    intensity: "High"
  };

  const upcomingSessions = [
    { id: 1, title: "Speed Training", time: "2:00 PM", coach: "Coach Sarah" },
    { id: 2, title: "Recovery Session", time: "Tomorrow 10:00 AM", coach: "Coach Mike" },
    { id: 3, title: "Team Practice", time: "Wednesday 4:00 PM", coach: "Coach Sarah" }
  ];

  const recentAchievements = [
    { id: 1, title: "7-Day Streak!", icon: "local-fire-department", color: "#FF6B35" },
    { id: 2, title: "New PR!", icon: "jump-rope", color: "#FFD700" },
    { id: 3, title: "Perfect Form", icon: "verified", color: "#4CAF50" }
  ];

  const motivationalQuotes = [
    "Champions train, losers complain! 💪",
    "Your only limit is you! 🚀",
    "Success starts with self-discipline! ⭐",
    "Push yourself because no one else will! 🔥"
  ];

  const quickActions = [
    { id: 1, title: "Start Workout", icon: "play-arrow", screen: "TodaysSession", color: "#667eea" },
    { id: 2, title: "Log Progress", icon: "add-circle", screen: "LogWorkout", color: "#f093fb" },
    { id: 3, title: "Check Schedule", icon: "calendar-today", screen: "WeeklySchedule", color: "#4facfe" },
    { id: 4, title: "Message Coach", icon: "chat", screen: "CoachCommunication", color: "#43e97b" },
    { id: 5, title: "View Goals", icon: "flag", screen: "GoalProgress", color: "#fa709a" },
    { id: 6, title: "Track Nutrition", icon: "restaurant", screen: "TodaysNutrition", color: "#fee140" },
    { id: 7, title: "Check In", icon: "check-circle", screen: "CheckIn", color: "#ff9a9e" },
    { id: 8, title: "Personal Bests", icon: "jump-rope", screen: "PersonalBests", color: "#a8edea" }
  ];

  const menuCategories = [
    {
      title: "Training & Workouts",
      icon: "fitness-center",
      color: "#667eea",
      items: [
        { title: "Today's Session", screen: "TodaysSession", icon: "play-arrow" },
        { title: "Training Programs", screen: "TrainingPrograms", icon: "list" },
        { title: "Workout Library", screen: "WorkoutLibrary", icon: "video-library" },
        { title: "Exercise Guides", screen: "ExerciseGuides", icon: "help-outline" },
        { title: "Skill Development", screen: "SkillDevelopment", icon: "trending-up" },
        { title: "Drill Practice", screen: "DrillPractice", icon: "sports" },
        { title: "Workout Timer", screen: "WorkoutTimer", icon: "timer" },
        { title: "Workout History", screen: "WorkoutHistory", icon: "history" }
      ]
    },
    {
      title: "Performance & Progress",
      icon: "analytics",
      color: "#4facfe",
      items: [
        { title: "Performance Tracking", screen: "PerformanceTracking", icon: "trending-up" },
        { title: "Fitness Tests", screen: "FitnessTests", icon: "assessment" },
        { title: "Personal Records", screen: "PersonalRecords", icon: "jump-rope" },
        { title: "Goal Tracking", screen: "GoalTracking", icon: "flag" },
        { title: "Progress Photos", screen: "ProgressPhotos", icon: "camera-alt" },
        { title: "Body Measurements", screen: "BodyMeasurements", icon: "straighten" },
        { title: "Performance Analytics", screen: "PerformanceAnalytics", icon: "bar-chart" },
        { title: "Achievement Badges", screen: "AchievementBadges", icon: "military-tech" }
      ]
    },
    {
      title: "Coach & Team",
      icon: "people",
      color: "#43e97b",
      items: [
        { title: "My Coach", screen: "MyCoach", icon: "person" },
        { title: "Coach Communication", screen: "CoachCommunication", icon: "chat" },
        { title: "Training Assignments", screen: "TrainingAssignments", icon: "assignment" },
        { title: "Coach Feedback", screen: "CoachFeedback", icon: "feedback" },
        { title: "Session Bookings", screen: "SessionBookings", icon: "event" },
        { title: "Team Messages", screen: "TeamMessages", icon: "group" },
        { title: "Team Calendar", screen: "TeamCalendar", icon: "event-note" },
        { title: "Live Coaching", screen: "LiveCoaching", icon: "videocam" }
      ]
    },
    {
      title: "Nutrition & Wellness",
      icon: "restaurant",
      color: "#fa709a",
      items: [
        { title: "Nutrition Plan", screen: "NutritionPlan", icon: "restaurant-menu" },
        { title: "Meal Planning", screen: "MealPlanning", icon: "lunch-dining" },
        { title: "Food Diary", screen: "FoodDiary", icon: "book" },
        { title: "Water Intake", screen: "WaterIntake", icon: "local-drink" },
        { title: "Recovery Tracking", screen: "RecoveryTracking", icon: "spa" },
        { title: "Sleep Monitoring", screen: "SleepMonitoring", icon: "bedtime" },
        { title: "Mood Tracking", screen: "MoodTracking", icon: "sentiment-satisfied" },
        { title: "Healthy Recipes", screen: "HealthyRecipes", icon: "restaurant" }
      ]
    },
    {
      title: "Discovery & Search",
      icon: "explore",
      color: "#fee140",
      items: [
        { title: "Find Coaches", screen: "FindCoaches", icon: "search" },
        { title: "Academy Search", screen: "AcademySearch", icon: "school" },
        { title: "Sports Facilities", screen: "SportsFacilities", icon: "location-on" },
        { title: "Local Events", screen: "LocalEvents", icon: "event" },
        { title: "Competitions", screen: "Competitions", icon: "jump-rope" },
        { title: "Training Partners", screen: "TrainingPartners", icon: "group-add" },
        { title: "Sports Clubs", screen: "SportsClubs", icon: "groups" },
        { title: "Training Camps", screen: "TrainingCamps", icon: "camping" }
      ]
    },
    {
      title: "Learning & Education",
      icon: "school",
      color: "#a8edea",
      items: [
        { title: "Sport Theory", screen: "SportTheory", icon: "menu-book" },
        { title: "Technique Videos", screen: "TechniqueVideos", icon: "play-circle" },
        { title: "Skill Tutorials", screen: "SkillTutorials", icon: "play-lesson" },
        { title: "Rules & Regulations", screen: "RulesAndRegulations", icon: "gavel" },
        { title: "Strategy Guides", screen: "StrategyGuides", icon: "psychology" },
        { title: "Sports Psychology", screen: "SportsPsychology", icon: "psychology" },
        { title: "Goal Setting", screen: "GoalSetting", icon: "flag" },
        { title: "Quizzes & Tests", screen: "QuizzesTests", icon: "quiz" }
      ]
    },
    {
      title: "Social & Community",
      icon: "groups",
      color: "#ff9a9e",
      items: [
        { title: "Trainee Community", screen: "TraineeCommunity", icon: "group" },
        { title: "Social Feed", screen: "SocialFeed", icon: "dynamic-feed" },
        { title: "Leaderboards", screen: "Leaderboards", icon: "leaderboard" },
        { title: "Challenges", screen: "Challenges", icon: "jump-rope" },
        { title: "Success Stories", screen: "SuccessStories", icon: "auto-stories" },
        { title: "Community Support", screen: "CommunitySupport", icon: "support" },
        { title: "Mentorship Program", screen: "MentorshipProgram", icon: "supervisor-account" },
        { title: "Group Goals", screen: "GroupGoals", icon: "group-work" }
      ]
    },
    {
      title: "Equipment & Gear",
      icon: "sports",
      color: "#fad0c4",
      items: [
        { title: "Equipment Tracker", screen: "EquipmentTracker", icon: "inventory" },
        { title: "Gear Recommendations", screen: "GearRecommendations", icon: "recommend" },
        { title: "Maintenance Schedule", screen: "MaintenanceSchedule", icon: "build" },
        { title: "Equipment Reviews", screen: "EquipmentReviews", icon: "rate-review" },
        { title: "Budget Tracker", screen: "BudgetTracker", icon: "account-balance-wallet" },
        { title: "Wish List", screen: "WishList", icon: "favorite" },
        { title: "Marketplace Deals", screen: "MarketplaceDeals", icon: "local-offer" },
        { title: "Equipment Sharing", screen: "EquipmentSharing", icon: "share" }
      ]
    }
  ];

  const teamUpdates = [
    { id: 1, title: "New training schedule released", time: "2 hours ago", type: "info" },
    { id: 2, title: "Team meeting this Friday at 3 PM", time: "5 hours ago", type: "announcement" },
    { id: 3, title: "Great job in yesterday's session!", time: "1 day ago", type: "praise" }
  ];

  // Effects
  useEffect(() => {
    // Animate entrance
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Dashboard refreshed successfully!');
    }, 1500);
  }, []);

  // Quick Action Handler
  const handleQuickAction = (action) => {
    if (action.screen) {
      navigation.navigate(action.screen);
    } else {
      Alert.alert(
        'Feature Development',
        `${action.title} feature is coming soon! We're working hard to bring you amazing training tools.`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // Level Progress Calculation
  const levelProgress = (totalPoints % 1000) / 1000;
  const pointsToNextLevel = 1000 - (totalPoints % 1000);

  // Header Component
  const DashboardHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.userSection}>
          <Avatar.Image 
            size={50} 
            source={{ uri: 'https://i.pravatar.cc/150?img=1' }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>Alex Johnson! 👋</Text>
            <View style={styles.levelContainer}>
              <Icon name="stars" size={16} color="#FFD700" />
              <Text style={styles.levelText}>Level {currentLevel}</Text>
              <Text style={styles.pointsText}>• {totalPoints.toLocaleString()} pts</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <IconButton
            icon="search"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.navigate('Search')}
            style={styles.headerIconBtn}
          />
          <View style={styles.notificationContainer}>
            <IconButton
              icon="notifications"
              iconColor="#fff"
              size={24}
              onPress={() => Alert.alert('Notifications', 'Feature coming soon!')}
              style={styles.headerIconBtn}
            />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </View>
          <IconButton
            icon="dots-vertical"
            iconColor="#fff"
            size={24}
            onPress={() => setMenuModalVisible(true)}
            style={styles.headerIconBtn}
          />
        </View>
      </View>
      
      {/* Level Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Level Progress</Text>
          <Text style={styles.progressPoints}>{pointsToNextLevel} pts to Level {currentLevel + 1}</Text>
        </View>
        <ProgressBar 
          progress={levelProgress} 
          color="#FFD700" 
          style={styles.levelProgressBar}
        />
      </View>
    </LinearGradient>
  );

  // Today's Focus Card
  const TodaysFocusCard = () => (
    <Card style={styles.focusCard} elevation={4}>
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        style={styles.focusGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Card.Content style={styles.focusContent}>
          <View style={styles.focusHeader}>
            <Icon name="today" size={24} color="#fff" />
            <Text style={styles.focusTitle}>Today's Focus</Text>
          </View>
          
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutTitle}>{todaysWorkout.title}</Text>
            <View style={styles.workoutDetails}>
              <View style={styles.workoutDetailItem}>
                <Icon name="schedule" size={16} color="#fff" />
                <Text style={styles.workoutDetailText}>{todaysWorkout.duration}</Text>
              </View>
              <View style={styles.workoutDetailItem}>
                <Icon name="fitness-center" size={16} color="#fff" />
                <Text style={styles.workoutDetailText}>{todaysWorkout.exercises} exercises</Text>
              </View>
              <View style={styles.workoutDetailItem}>
                <Icon name="whatshot" size={16} color="#fff" />
                <Text style={styles.workoutDetailText}>{todaysWorkout.intensity}</Text>
              </View>
            </View>
          </View>
          
          <Button
            mode="contained"
            onPress={() => navigation.navigate('TodaysSession')}
            style={styles.startButton}
            contentStyle={styles.startButtonContent}
            labelStyle={styles.startButtonLabel}
            buttonColor="rgba(255,255,255,0.2)"
          >
            Start Workout
          </Button>
        </Card.Content>
      </LinearGradient>
    </Card>
  );

  // Quick Actions Grid
  const QuickActionsGrid = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.quickActionCard, { backgroundColor: action.color }]}
            onPress={() => handleQuickAction(action)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[action.color, `${action.color}CC`]}
              style={styles.quickActionGradient}
            >
              <Icon name={action.icon} size={28} color="#fff" />
              <Text style={styles.quickActionText}>{action.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Progress Overview Card
  const ProgressOverviewCard = () => (
    <Card style={styles.progressCard} elevation={3}>
      <Card.Content>
        <View style={styles.progressCardHeader}>
          <Text style={styles.cardTitle}>Weekly Progress</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProgressOverview')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.progressStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(weeklyProgress * 100)}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
            <ProgressBar 
              progress={weeklyProgress} 
              color={COLORS.primary} 
              style={styles.statProgressBar}
            />
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{dailyStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
            <View style={styles.streakIcons}>
              {[...Array(7)].map((_, i) => (
                <Icon 
                  key={i} 
                  name="local-fire-department" 
                  size={14} 
                  color={i < dailyStreak ? "#FF6B35" : "#E0E0E0"} 
                />
              ))}
            </View>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>A+</Text>
            <Text style={styles.statLabel}>Coach Rating</Text>
            <View style={styles.ratingStars}>
              {[...Array(5)].map((_, i) => (
                <Icon key={i} name="star" size={14} color="#FFD700" />
              ))}
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  // Upcoming Sessions Card
  const UpcomingSessionsCard = () => (
    <Card style={styles.upcomingCard} elevation={3}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Upcoming Sessions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('UpcomingSessions')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {upcomingSessions.slice(0, 3).map((session) => (
          <Surface key={session.id} style={styles.sessionItem} elevation={1}>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <Text style={styles.sessionCoach}>{session.coach}</Text>
            </View>
            <View style={styles.sessionTime}>
              <Icon name="schedule" size={16} color={COLORS.primary} />
              <Text style={styles.sessionTimeText}>{session.time}</Text>
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  // Achievements Card
  const AchievementsCard = () => (
    <Card style={styles.achievementCard} elevation={3}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Achievements 🏆</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AchievementBadges')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.achievementScroll}
        >
          {recentAchievements.map((achievement) => (
            <Surface key={achievement.id} style={[styles.achievementBadge, { borderColor: achievement.color }]} elevation={2}>
              <Icon name={achievement.icon} size={32} color={achievement.color} />
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
            </Surface>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  // Motivational Quote Card
  const MotivationalCard = () => {
    const [currentQuote, setCurrentQuote] = useState(0);
    
    const nextQuote = () => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    };

    return (
      <Card style={styles.motivationalCard} elevation={3}>
        <LinearGradient
          colors={['#fa709a', '#fee140']}
          style={styles.motivationalGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Card.Content style={styles.motivationalContent}>
            <TouchableOpacity onPress={nextQuote} style={styles.quoteContainer}>
              <Icon name="format-quote" size={24} color="#fff" style={styles.quoteIcon} />
              <Text style={styles.motivationalText}>
                {motivationalQuotes[currentQuote]}
              </Text>
              <Text style={styles.tapToChangeText}>Tap for new quote</Text>
            </TouchableOpacity>
          </Card.Content>
        </LinearGradient>
      </Card>
    );
  };

  // Team Updates Card
  const TeamUpdatesCard = () => (
    <Card style={styles.updatesCard} elevation={3}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Team Updates</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TeamUpdates')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {teamUpdates.map((update) => (
          <View key={update.id} style={styles.updateItem}>
            <View style={[styles.updateDot, { 
              backgroundColor: update.type === 'praise' ? '#4CAF50' : 
                              update.type === 'announcement' ? '#FF9800' : COLORS.primary 
            }]} />
            <View style={styles.updateContent}>
              <Text style={styles.updateTitle}>{update.title}</Text>
              <Text style={styles.updateTime}>{update.time}</Text>
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  // Recent Activity Card
  const RecentActivityCard = () => (
    <Card style={styles.activityCard} elevation={3}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RecentActivity')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Icon name="fitness-center" size={20} color="#667eea" />
            <Text style={styles.activityText}>Completed Upper Body workout</Text>
            <Text style={styles.activityTime}>2h ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Icon name="restaurant" size={20} color="#43e97b" />
            <Text style={styles.activityText}>Logged breakfast nutrition</Text>
            <Text style={styles.activityTime}>3h ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Icon name="jump-rope" size={20} color="#FFD700" />
            <Text style={styles.activityText}>New personal record in squats!</Text>
            <Text style={styles.activityTime}>Yesterday</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  // Personal Bests Card
  const PersonalBestsCard = () => (
    <Card style={styles.personalBestsCard} elevation={3}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Personal Bests 🏆</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PersonalBests')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.personalBestsGrid}>
          <View style={styles.prItem}>
            <Icon name="fitness-center" size={24} color="#667eea" />
            <Text style={styles.prValue}>225 lbs</Text>
            <Text style={styles.prLabel}>Squat</Text>
          </View>
          <View style={styles.prItem}>
            <Icon name="directions-run" size={24} color="#4facfe" />
            <Text style={styles.prValue}>6:45</Text>
            <Text style={styles.prLabel}>Mile Time</Text>
          </View>
          <View style={styles.prItem}>
            <Icon name="sports" size={24} color="#43e97b" />
            <Text style={styles.prValue}>95%</Text>
            <Text style={styles.prLabel}>Free Throw</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  // Coach Updates Card
  const CoachUpdatesCard = () => (
    <Card style={styles.coachUpdatesCard} elevation={3}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Coach Updates</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CoachUpdates')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.coachUpdate}>
          <Avatar.Image 
            size={40} 
            source={{ uri: 'https://i.pravatar.cc/150?img=2' }}
            style={styles.coachAvatar}
          />
          <View style={styles.coachUpdateContent}>
            <Text style={styles.coachUpdateTitle}>Great improvement this week!</Text>
            <Text style={styles.coachUpdateText}>Your form in the squat exercise has improved significantly. Keep up the excellent work!</Text>
            <Text style={styles.coachUpdateTime}>Coach Sarah • 1 hour ago</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  // Attendance Stats Card
  const AttendanceStatsCard = () => (
    <Card style={styles.attendanceCard} elevation={3}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Attendance Stats</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AttendanceStats')}>
            <Text style={styles.viewAllText}>Details</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.attendanceStats}>
          <View style={styles.attendanceItem}>
            <View style={styles.attendanceCircle}>
              <Text style={styles.attendancePercentage}>92%</Text>
            </View>
            <Text style={styles.attendanceLabel}>This Month</Text>
          </View>
          <View style={styles.attendanceDetails}>
            <View style={styles.attendanceDetailRow}>
              <Text style={styles.attendanceDetailLabel}>Sessions Attended:</Text>
              <Text style={styles.attendanceDetailValue}>23/25</Text>
            </View>
            <View style={styles.attendanceDetailRow}>
              <Text style={styles.attendanceDetailLabel}>Perfect Week Streak:</Text>
              <Text style={styles.attendanceDetailValue}>3 weeks</Text>
            </View>
            <View style={styles.attendanceDetailRow}>
              <Text style={styles.attendanceDetailLabel}>On-time Rate:</Text>
              <Text style={styles.attendanceDetailValue}>96%</Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  // Menu Modal Component
  const MenuModal = () => (
    <Portal>
      <Modal 
        visible={menuModalVisible} 
        onDismiss={() => setMenuModalVisible(false)}
        contentContainerStyle={styles.menuModalContainer}
      >
        <BlurView intensity={80} tint="dark" style={styles.menuModalBlur}>
          <View style={styles.menuModalContent}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>All Features</Text>
              <IconButton
                icon="close"
                iconColor="#333"
                size={24}
                onPress={() => setMenuModalVisible(false)}
              />
            </View>
            
            <Searchbar
              placeholder="Search features..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.menuSearchBar}
              inputStyle={styles.menuSearchInput}
            />
            
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.menuScrollView}
            >
              {menuCategories
                .filter(category => 
                  searchQuery === '' || 
                  category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  category.items.some(item => 
                    item.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                )
                .map((category, index) => (
                <View key={index} style={styles.menuCategory}>
                  <View style={styles.menuCategoryHeader}>
                    <View style={styles.menuCategoryTitle}>
                      <Icon name={category.icon} size={24} color={category.color} />
                      <Text style={styles.menuCategoryText}>{category.title}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.menuItemsGrid}>
                    {category.items
                      .filter(item => 
                        searchQuery === '' || 
                        item.title.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item, itemIndex) => (
                      <TouchableOpacity
                        key={itemIndex}
                        style={styles.menuItem}
                        onPress={() => {
                          setMenuModalVisible(false);
                          navigation.navigate(item.screen);
                        }}
                      >
                        <Icon name={item.icon} size={20} color={category.color} />
                        <Text style={styles.menuItemText}>{item.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
              
              <View style={styles.menuBottomSpacing} />
            </ScrollView>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  // Performance Stats Card
  const PerformanceStatsCard = () => (
    <Card style={styles.performanceCard} elevation={3}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>This Week's Performance</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PerformanceTracking')}>
            <Text style={styles.viewAllText}>Details</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.performanceGrid}>
          <View style={styles.performanceItem}>
            <Icon name="fitness-center" size={24} color="#667eea" />
            <Text style={styles.performanceValue}>12</Text>
            <Text style={styles.performanceLabel}>Workouts</Text>
          </View>
          <View style={styles.performanceItem}>
            <Icon name="schedule" size={24} color="#4facfe" />
            <Text style={styles.performanceValue}>8.5h</Text>
            <Text style={styles.performanceLabel}>Training Time</Text>
          </View>
          <View style={styles.performanceItem}>
            <Icon name="trending-up" size={24} color="#43e97b" />
            <Text style={styles.performanceValue}>+15%</Text>
            <Text style={styles.performanceLabel}>Improvement</Text>
          </View>
          <View style={styles.performanceItem}>
            <Icon name="jump-rope" size={24} color="#FFD700" />
            <Text style={styles.performanceValue}>3</Text>
            <Text style={styles.performanceLabel}>New PRs</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <DashboardHeader />
      
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor="#fff"
            tintColor={COLORS.primary}
          />
        }
      >
        <Animated.View style={[
          styles.content,
          {
            opacity: animatedValue,
            transform: [{
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            }],
          },
        ]}>
          
          {/* Recent Activity Card */}
          <RecentActivityCard />
          
          {/* Personal Bests Card */}
          <PersonalBestsCard />
          
          {/* Coach Updates Card */}
          <CoachUpdatesCard />
          
          {/* Attendance Stats Card */}
          <AttendanceStatsCard />

          {/* Today's Focus */}
          <TodaysFocusCard />
          
          {/* Quick Actions Grid */}
          <QuickActionsGrid />
          
          {/* Progress Overview */}
          <ProgressOverviewCard />
          
          {/* Performance Stats */}
          <PerformanceStatsCard />
          
          {/* Upcoming Sessions */}
          <UpcomingSessionsCard />
          
          {/* Recent Achievements */}
          <AchievementsCard />
          
          {/* Motivational Quote */}
          <MotivationalCard />
          
          {/* Team Updates */}
          <TeamUpdatesCard />
          
          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </Animated.View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        color="#fff"
        customSize={56}
      />
      
      {/* Quick Action Modal */}
      <Portal>
        <Modal 
          visible={modalVisible} 
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={80} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Quick Actions</Text>
              <View style={styles.modalActions}>
                {quickActions.slice(0, 6).map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[styles.modalActionButton, { backgroundColor: action.color }]}
                    onPress={() => {
                      setModalVisible(false);
                      handleQuickAction(action);
                    }}
                  >
                    <Icon name={action.icon} size={24} color="#fff" />
                    <Text style={styles.modalActionText}>{action.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
                textColor="#fff"
              >
                Close
              </Button>
            </View>
          </BlurView>
        </Modal>
      </Portal>

      {/* Menu Modal */}
      <MenuModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    marginRight: SPACING.sm,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  userName: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    ...TEXT_STYLES.caption,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    margin: 0,
    marginLeft: SPACING.xs,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressSection: {
    marginTop: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  progressPoints: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  levelProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  focusCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  focusGradient: {
    padding: 0,
  },
  focusContent: {
    padding: SPACING.md,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  focusTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  workoutInfo: {
    marginBottom: SPACING.md,
  },
  workoutTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  workoutDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  workoutDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginBottom: SPACING.xs,
  },
  workoutDetailText: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 4,
  },
  startButton: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  startButtonContent: {
    paddingVertical: 4,
  },
  startButtonLabel: {
    ...TEXT_STYLES.button,
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (screenWidth - SPACING.md * 2 - SPACING.sm) / 2,
    height: 100,
    borderRadius: 16,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  quickActionText: {
    ...TEXT_STYLES.body,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  progressCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TEXT_STYLES.h3,
    color: '#333',
    fontWeight: 'bold',
  },
  viewAllText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginBottom: SPACING.xs,
  },
  statProgressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
  },
  streakIcons: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  upcomingCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 12,
    marginBottom: SPACING.xs,
    backgroundColor: '#f8f9fa',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...TEXT_STYLES.body,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  sessionCoach: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  sessionTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTimeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  achievementCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  achievementScroll: {
    marginHorizontal: -SPACING.xs,
  },
  achievementBadge: {
    width: 120,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  achievementTitle: {
    ...TEXT_STYLES.caption,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  motivationalCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  motivationalGradient: {
    padding: 0,
  },
  motivationalContent: {
    padding: SPACING.md,
  },
  quoteContainer: {
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: SPACING.xs,
  },
  motivationalText: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  tapToChangeText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
  },
  updatesCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  updateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    ...TEXT_STYLES.body,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  updateTime: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  performanceCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  performanceValue: {
    ...TEXT_STYLES.h2,
    color: '#333',
    fontWeight: 'bold',
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  performanceLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
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
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: SPACING.lg,
    width: screenWidth - SPACING.lg * 2,
    maxHeight: screenHeight * 0.8,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalActionButton: {
    width: (screenWidth - SPACING.lg * 4 - SPACING.sm) / 2,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalActionText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  modalCloseButton: {
    borderColor: COLORS.primary,
    borderRadius: 25,
  },
  bottomSpacing: {
    height: 100,
  },
  // New Card Styles
  activityCard: {
  marginBottom: SPACING.md,
  borderRadius: 16,
},
activityList: {
  gap: SPACING.sm,
},
activityItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: SPACING.xs,
},
activityText: {
  ...TEXT_STYLES.body,
  color: '#333',
  flex: 1,
  marginLeft: SPACING.sm,
},
activityTime: {
  ...TEXT_STYLES.caption,
  color: '#666',
},

// Personal Bests Card Styles
personalBestsCard: {
  marginBottom: SPACING.md,
  borderRadius: 16,
},
personalBestsGrid: {
  flexDirection: 'row',
  justifyContent: 'space-around',
},
prItem: {
  alignItems: 'center',
  flex: 1,
},
prValue: {
  ...TEXT_STYLES.h3,
  color: '#333',
  fontWeight: 'bold',
  marginTop: SPACING.xs,
  marginBottom: 2,
},
prLabel: {
  ...TEXT_STYLES.caption,
  color: '#666',
  textAlign: 'center',
},

// Coach Updates Card Styles
coachUpdatesCard: {
  marginBottom: SPACING.md,
  borderRadius: 16,
},
coachUpdate: {
  flexDirection: 'row',
  alignItems: 'flex-start',
},
coachAvatar: {
  marginRight: SPACING.sm,
},
coachUpdateContent: {
  flex: 1,
},
coachUpdateTitle: {
  ...TEXT_STYLES.body,
  color: '#333',
  fontWeight: '600',
  marginBottom: 4,
},
coachUpdateText: {
  ...TEXT_STYLES.body,
  color: '#666',
  lineHeight: 20,
  marginBottom: SPACING.xs,
},
coachUpdateTime: {
  ...TEXT_STYLES.caption,
  color: '#999',
},

// Attendance Card Styles
attendanceCard: {
  marginBottom: SPACING.md,
  borderRadius: 16,
},
attendanceStats: {
  flexDirection: 'row',
  alignItems: 'center',
},
attendanceItem: {
  alignItems: 'center',
  marginRight: SPACING.lg,
},
attendanceCircle: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: COLORS.primary,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: SPACING.xs,
},
attendancePercentage: {
  ...TEXT_STYLES.h2,
  color: '#fff',
  fontWeight: 'bold',
},
attendanceLabel: {
  ...TEXT_STYLES.caption,
  color: '#666',
  textAlign: 'center',
},
attendanceDetails: {
  flex: 1,
},
attendanceDetailRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: SPACING.xs,
},
attendanceDetailLabel: {
  ...TEXT_STYLES.body,
  color: '#666',
  flex: 1,
},
attendanceDetailValue: {
  ...TEXT_STYLES.body,
  color: '#333',
  fontWeight: '600',
},

// Menu Modal Styles
menuModalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
menuModalBlur: {
  flex: 1,
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
},
menuModalContent: {
  backgroundColor: 'rgba(255,255,255,0.95)',
  borderRadius: 20,
  width: screenWidth - SPACING.lg * 2,
  maxHeight: screenHeight * 0.85,
  padding: SPACING.lg,
},
menuHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: SPACING.md,
},
menuTitle: {
  ...TEXT_STYLES.h2,
  color: '#333',
  fontWeight: 'bold',
},
menuSearchBar: {
  marginBottom: SPACING.md,
  borderRadius: 12,
  elevation: 0,
  backgroundColor: '#f5f5f5',
},
menuSearchInput: {
  ...TEXT_STYLES.body,
},
menuScrollView: {
  flex: 1,
},
menuCategory: {
  marginBottom: SPACING.lg,
},
menuCategoryHeader: {
  marginBottom: SPACING.sm,
},
menuCategoryTitle: {
  flexDirection: 'row',
  alignItems: 'center',
},
menuCategoryText: {
  ...TEXT_STYLES.h3,
  color: '#333',
  fontWeight: '600',
  marginLeft: SPACING.sm,
},
menuItemsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
},
menuItem: {
  width: (screenWidth - SPACING.lg * 4 - SPACING.sm) / 2,
  flexDirection: 'row',
  alignItems: 'center',
  padding: SPACING.sm,
  borderRadius: 12,
  backgroundColor: '#f8f9fa',
  marginBottom: SPACING.xs,
},
menuItemText: {
  ...TEXT_STYLES.body,
  color: '#333',
  marginLeft: SPACING.sm,
  flex: 1,
},
menuBottomSpacing: {
  height: SPACING.xl,
},
});

export default TraineeDashboard;
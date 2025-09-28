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
  Alert,
  Vibration,
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
  FAB
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from '../../components/shared/LinearGradient';
import { BlurView } from '../../components/shared/BlurView';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';
import { USER_TYPES, SESSION_STATUS } from '../../utils/constants';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const PlayerDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [quickSearchVisible, setQuickSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTimeSlot, setCurrentTimeSlot] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const { user } = useSelector(state => state.auth);
  const { trainingPlans, sessions } = useSelector(state => state.training);
  const dispatch = useDispatch();

  // Enhanced athlete data
  const [athleteData] = useState({
    name: user?.firstName || 'Alex',
    sport: 'Football',
    level: 'Intermediate',
    streak: 14,
    weeklyGoal: 5,
    completedSessions: 3,
    nextSession: 'Speed & Agility Training',
    nextSessionTime: '4:30 PM',
    coach: 'Coach Martinez',
    team: 'Lightning FC U18',
    totalWorkouts: 47,
    currentStreak: 14,
    caloriesBurned: 2450,
    activeMinutes: 145
  });

  // Today's comprehensive stats
  const [todaysStats] = useState({
    caloriesBurned: 420,
    trainingTime: 75,
    heartRateAvg: 145,
    hydrationGoal: 2.5,
    hydrationCurrent: 1.8,
    stepsCount: 8542,
    activeHours: 6
  });

  // Enhanced training schedule for today
  const todayTraining = [
    {
      id: 1,
      title: 'Morning Cardio & Strength',
      time: '07:00 AM',
      duration: 60,
      status: 'completed',
      type: 'Personal Training',
      coach: 'Coach Rodriguez',
      location: 'Home Gym',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100',
      completionRate: 100,
      intensity: 'High'
    },
    {
      id: 2,
      title: 'Technical Skills Practice',
      time: '02:00 PM',
      duration: 45,
      status: 'upcoming',
      type: 'Skill Training',
      coach: 'Coach Martinez',
      location: 'Training Ground',
      image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=100',
      completionRate: 0,
      intensity: 'Medium'
    },
    {
      id: 3,
      title: 'Team Practice Session',
      time: '05:30 PM',
      duration: 90,
      status: 'upcoming',
      type: 'Team Training',
      coach: 'Coach Johnson',
      location: 'Academy Field',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100',
      completionRate: 0,
      intensity: 'High'
    }
  ];

  // Enhanced player stats with comprehensive metrics
  const playerStats = [
    { 
      icon: 'fitness-center', 
      label: 'Workouts', 
      value: athleteData.totalWorkouts.toString(), 
      subtitle: 'completed',
      color: '#FF6B6B',
      bgGradient: ['#FF6B6B', '#FF8E8E'],
      trend: '+8 this week'
    },
    { 
      icon: 'local-fire-department', 
      label: 'Streak', 
      value: athleteData.currentStreak.toString(), 
      subtitle: 'day streak',
      color: '#F39C12',
      bgGradient: ['#F39C12', '#E67E22'],
      trend: 'Personal best!'
    },
    { 
      icon: 'timeline', 
      label: 'Progress', 
      value: '87%', 
      subtitle: 'completion rate',
      color: '#4ECDC4',
      bgGradient: ['#4ECDC4', '#44B3AA'],
      trend: '+12% growth'
    },
    { 
      icon: 'jump-rope', 
      label: 'Goals', 
      value: '5/7', 
      subtitle: 'achieved',
      color: '#45B7D1',
      bgGradient: ['#45B7D1', '#3A9BC1'],
      trend: '2 remaining'
    },
  ];

  // Active training programs
  const activePrograms = [
    {
      id: 1,
      title: 'Elite Football Development',
      subtitle: 'Professional Training Program',
      progress: 0.68,
      week: 'Week 8 of 12',
      nextSession: 'Tomorrow • 7:00 AM',
      coach: 'Coach Rodriguez',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
      category: 'Football',
      difficulty: 'Advanced',
      bgGradient: ['#667eea', '#764ba2'],
      sessionsCompleted: 28,
      totalSessions: 36,
      attendance: '92%'
    },
    {
      id: 2,
      title: 'Strength & Conditioning',
      subtitle: 'Build Your Foundation',
      progress: 0.45,
      week: 'Week 4 of 8',
      nextSession: 'Thursday • 6:00 PM',
      coach: 'Coach Martinez',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
      category: 'Fitness',
      difficulty: 'Intermediate',
      bgGradient: ['#f093fb', '#f5576c'],
      sessionsCompleted: 16,
      totalSessions: 32,
      attendance: '95%'
    }
  ];

  // Recent achievements
  const [recentAchievements] = useState([
    {
      id: 1,
      title: '14-Day Training Streak!',
      description: 'Completed training for 14 consecutive days',
      icon: 'local-fire-department',
      color: '#FF6B35',
      date: 'Today',
    },
    {
      id: 2,
      title: 'Personal Best: 40m Sprint',
      description: 'New record: 5.2 seconds',
      icon: 'timer',
      color: '#4CAF50',
      date: 'Yesterday',
    },
    {
      id: 3,
      title: 'Strength Milestone',
      description: 'Increased squat by 10kg',
      icon: 'fitness-center',
      color: '#2196F3',
      date: '2 days ago',
    },
  ]);

  // Weekly progress tracking
  const [weeklyProgress] = useState([
    { day: 'M', completed: true, type: 'strength' },
    { day: 'T', completed: true, type: 'cardio' },
    { day: 'W', completed: true, type: 'skills' },
    { day: 'T', completed: false, type: 'recovery' },
    { day: 'F', completed: false, type: 'strength' },
    { day: 'S', completed: false, type: 'match' },
    { day: 'S', completed: false, type: 'rest' },
  ]);

  // Recent activities
  const recentActivities = [
    { 
      id: 1, 
      text: 'Completed morning cardio session', 
      time: '2 hours ago',
      type: 'workout',
      icon: 'check-circle',
      color: '#4CAF50',
      action: () => navigation.navigate('WorkoutHistory')
    },
    { 
      id: 2, 
      text: 'New personal record in bench press', 
      time: '1 day ago',
      type: 'achievement',
      icon: 'jump-rope',
      color: '#FF9800',
      action: () => navigation.navigate('PersonalRecords')
    },
    { 
      id: 3, 
      text: 'Feedback received from Coach Rodriguez', 
      time: '2 days ago',
      type: 'feedback',
      icon: 'feedback',
      color: '#2196F3',
      action: () => navigation.navigate('CoachFeedback')
    }
  ];

  // Enhanced quick actions covering all player features
  const quickActionsData = [
    {
      category: 'Training Management',
      actions: [
        { 
          icon: 'play-arrow', 
          label: 'Start Workout', 
          action: () => navigation.navigate('AssignedWorkouts'),
          color: '#667eea'
        },
        { 
          icon: 'assignment', 
          label: 'My Plans', 
          action: () => navigation.navigate('MyTrainingPlans'),
          color: '#4ECDC4'
        },
        { 
          icon: 'history', 
          label: 'Workout History', 
          action: () => navigation.navigate('WorkoutHistory'),
          color: '#45B7D1'
        },
        { 
          icon: 'video-library', 
          label: 'Exercise Guides', 
          action: () => navigation.navigate('ExerciseGuides'),
          color: '#F39C12'
        },
      ]
    },
    {
      category: 'Performance Tracking',
      actions: [
        { 
          icon: 'analytics', 
          label: 'Performance', 
          action: () => navigation.navigate('PerformanceDashboard'),
          color: '#FF6B6B'
        },
        { 
          icon: 'trending-up', 
          label: 'Progress', 
          action: () => navigation.navigate('ProgressTracking'),
          color: '#9B59B6'
        },
        { 
          icon: 'jump-rope', 
          label: 'Personal Records', 
          action: () => navigation.navigate('PersonalRecords'),
          color: '#2ECC71'
        },
        { 
          icon: 'assessment', 
          label: 'Fitness Tests', 
          action: () => navigation.navigate('FitnessTests'),
          color: '#E74C3C'
        },
      ]
    },
    {
      category: 'Social & Community',
      actions: [
        { 
          icon: 'people', 
          label: 'Community', 
          action: () => navigation.navigate('PlayerCommunity'),
          color: '#27AE60'
        },
        { 
          icon: 'leaderboard', 
          label: 'Rankings', 
          action: () => navigation.navigate('PlayerRankings'),
          color: '#3498DB'
        },
        { 
          icon: 'group', 
          label: 'Team Mates', 
          action: () => navigation.navigate('TeamMates'),
          color: '#8E44AD'
        },
        { 
          icon: 'event', 
          label: 'Challenges', 
          action: () => navigation.navigate('Challenges'),
          color: '#E67E22'
        },
      ]
    },
    {
      category: 'Discovery & Learning',
      actions: [
        { 
          icon: 'search', 
          label: 'Find Coaches', 
          action: () => navigation.navigate('FindCoaches'),
          color: '#1ABC9C'
        },
        { 
          icon: 'school', 
          label: 'Find Academies', 
          action: () => navigation.navigate('FindAcademies'),
          color: '#34495E'
        },
        { 
          icon: 'library-books', 
          label: 'Learn Skills', 
          action: () => navigation.navigate('SkillTutorials'),
          color: '#E91E63'
        },
        { 
          icon: 'psychology', 
          label: 'AI Assistant', 
          action: () => navigation.navigate('AITrainingAssistant'),
          color: '#FF5722'
        },
      ]
    }
  ];

  // Menu options
const menuOptions = [
  { 
    icon: 'search', 
    label: 'Quick Search', 
    action: () => {
      setMenuVisible(false);
      setQuickSearchVisible(true);
    },
    category: 'General'
  },
  { 
    icon: 'analytics', 
    label: 'Performance Analytics', 
    action: () => navigation.navigate('PlayerAnalytics'),
    category: 'Analytics'
  },
  { 
    icon: 'smart-toy', 
    label: 'AI Training Assistant', 
    action: () => navigation.navigate('AITrainingAssistant'),
    category: 'AI Tools'
  },
  { 
    icon: 'restaurant', 
    label: 'Nutrition Tracking', 
    action: () => navigation.navigate('NutritionTracking'),
    category: 'Wellness'
  },
  { 
    icon: 'healing', 
    label: 'Recovery Tracking', 
    action: () => navigation.navigate('RecoveryTracking'),
    category: 'Wellness'
  },
  { 
    icon: 'support-agent', 
    label: 'Support Center', 
    action: () => navigation.navigate('SupportCenter'),
    category: 'Support'
  }
];

const quickSearchCategories = [
  {
    title: "Training & Workouts",
    items: [
      { title: "My Training Plans", screen: "MyTrainingPlans" },
      { title: "Assigned Workouts", screen: "AssignedWorkouts" },
      { title: "Workout History", screen: "WorkoutHistory" },
      { title: "Exercise Guides", screen: "ExerciseGuides" },
      { title: "Quick Workout", screen: "QuickWorkout" },
      { title: "Workout Timer", screen: "WorkoutTimer" }
    ]
  },
  {
    title: "Performance & Progress",
    items: [
      { title: "Performance Dashboard", screen: "PerformanceDashboard" },
      { title: "Progress Tracking", screen: "ProgressTracking" },
      { title: "Personal Records", screen: "PersonalRecords" },
      { title: "Fitness Tests", screen: "FitnessTests" },
      { title: "Goal Tracking", screen: "GoalTracking" }
    ]
  },
  {
    title: "Coach & Team",
    items: [
      { title: "Find Coaches", screen: "FindCoaches" },
      { title: "Coach Chat", screen: "CoachChat" },
      { title: "Team Chat", screen: "TeamChat" },
      { title: "Book Session", screen: "BookSession" },
      { title: "Coach Feedback", screen: "CoachFeedback" }
    ]
  },
  {
    title: "Community & Social",
    items: [
      { title: "Player Community", screen: "PlayerCommunity" },
      { title: "Player Rankings", screen: "PlayerRankings" },
      { title: "Challenges", screen: "Challenges" },
      { title: "Team Mates", screen: "TeamMates" },
      { title: "Social Feed", screen: "SocialFeed" }
    ]
  },
  {
    title: "Discovery",
    items: [
      { title: "Find Academies", screen: "FindAcademies" },
      { title: "Sports Facilities", screen: "SportsFacilities" },
      { title: "Local Events", screen: "LocalEvents" },
      { title: "Competitions", screen: "Competitions" }
    ]
  },
  {
    title: "Wellness & Nutrition",
    items: [
      { title: "Nutrition Dashboard", screen: "NutritionDashboard" },
      { title: "Meal Planning", screen: "MealPlanning" },
      { title: "Recovery Tracking", screen: "RecoveryTracking" },
      { title: "Sleep Analysis", screen: "SleepAnalysis" },
      { title: "Wellness Goals", screen: "WellnessGoals" }
    ]
  }
];

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
    ]).start();

    // Update time slot
    updateTimeSlot();
    const interval = setInterval(updateTimeSlot, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
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
    Vibration.vibrate(50);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greetings = {
      morning: ['Rise & Train', 'Good Morning', 'Morning Champion'],
      afternoon: ['Keep Training', 'Good Afternoon', 'Stay Strong'],
      evening: ['Evening Warrior', 'Good Evening', 'Train Hard'],
      night: ['Night Owl', 'Good Night', 'Rest & Recover']
    };
    
    let timeKey = 'morning';
    if (hour >= 12 && hour < 17) timeKey = 'afternoon';
    else if (hour >= 17 && hour < 21) timeKey = 'evening';
    else if (hour >= 21 || hour < 6) timeKey = 'night';
    
    const options = greetings[timeKey];
    return options[Math.floor(Math.random() * options.length)];
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'upcoming': return '#2196F3';
      case 'in_progress': return '#FF9800';
      default: return COLORS.textSecondary;
    }
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'High': return '#FF5722';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return COLORS.textSecondary;
    }
  };

  const getTrainingTypeIcon = (type) => {
    const icons = {
      strength: 'fitness-center',
      cardio: 'directions-run',
      skills: 'sports-soccer',
      recovery: 'self-improvement',
      match: 'sports',
      rest: 'hotel',
    };
    return icons[type] || 'fitness-center';
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

  // Component helper functions
  const QuickActionCard = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.quickActionCard, { borderColor: color }]} onPress={onPress}>
      <Icon name={icon} size={24} color={color} />
      <Text style={[styles.quickActionText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, unit, icon, color }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={20} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <View style={styles.statValueContainer}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
    </View>
  );

  const renderQuickActions = () => {
    const currentActions = quickActionsData.find(cat => 
      cat.category.toLowerCase().includes(activeTab) || activeTab === 'overview'
    );
    
    if (activeTab === 'overview') {
      const mixedActions = quickActionsData.flatMap(cat => 
        cat.actions.slice(0, 2)
      ).slice(0, 8);
      
      return (
        <Card style={styles.quickActionsCard}>
          <Card.Title title="Quick Actions" />
          <Card.Content>
            <View style={styles.tabContainer}>
              {['overview', 'training', 'performance', 'social'].map((tab) => (
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
              {mixedActions.map((action, index) => (
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
      );
    }

    const categoryActions = quickActionsData.find(cat => 
      cat.category.toLowerCase().includes(activeTab)
    )?.actions || [];

    return (
      <Card style={styles.quickActionsCard}>
        <Card.Title title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tools`} />
        <Card.Content>
          <View style={styles.tabContainer}>
            {['overview', 'training', 'performance', 'social'].map((tab) => (
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
            {categoryActions.map((action, index) => (
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
    );
  };

const renderQuickSearchModal = () => (
  <Portal>
    <Modal
      visible={quickSearchVisible}
      onDismiss={() => setQuickSearchVisible(false)}
      contentContainerStyle={styles.quickSearchModal}>
      <BlurView intensity={90} style={styles.quickSearchBlur}>
        <View style={styles.quickSearchContainer}>
          <View style={styles.quickSearchHeader}>
            <Text style={styles.quickSearchTitle}>Player Search</Text>
            <IconButton
              icon="close"
              size={24}
              iconColor="#333"
              onPress={() => setQuickSearchVisible(false)}
            />
          </View>
          
          <Searchbar
            placeholder="Search workouts, coaches, academies, challenges..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.quickSearchBar}
            inputStyle={styles.quickSearchInput}
            autoFocus
          />
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
            style={styles.quickSearchContent}
          >
            {/* Quick Access Chips */}
            <View style={styles.quickChipsContainer}>
              <Text style={styles.quickChipsTitle}>Quick Access</Text>
              <View style={styles.quickChipsGrid}>
                {[
                  'Start Workout', 'Find Coaches', 'Performance', 'Community', 
                  'Challenges', 'Academies', 'Nutrition', 'Recovery'
                ].map((chip) => (
                  <Chip
                    key={chip}
                    mode="outlined"
                    onPress={() => {
                      setQuickSearchVisible(false);
                      switch(chip) {
                        case 'Start Workout': navigation.navigate('AssignedWorkouts'); break;
                        case 'Find Coaches': navigation.navigate('FindCoaches'); break;
                        case 'Performance': navigation.navigate('PerformanceDashboard'); break;
                        case 'Community': navigation.navigate('PlayerCommunity'); break;
                        case 'Challenges': navigation.navigate('Challenges'); break;
                        case 'Academies': navigation.navigate('FindAcademies'); break;
                        case 'Nutrition': navigation.navigate('NutritionDashboard'); break;
                        case 'Recovery': navigation.navigate('RecoveryTracking'); break;
                        default: break;
                      }
                    }}
                    style={styles.quickChip}
                    textStyle={styles.quickChipText}>
                    {chip}
                  </Chip>
                ))}
              </View>
            </View>
            
            {/* Categorized Navigation */}
            {quickSearchCategories
              .filter(category => 
                searchQuery === '' || 
                category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                category.items.some(item => 
                  item.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
              )
              .map((category, index) => (
              <View key={index} style={styles.searchCategory}>
                <Text style={styles.searchCategoryTitle}>{category.title}</Text>
                <View style={styles.searchCategoryItems}>
                  {category.items
                    .filter(item => 
                      searchQuery === '' || 
                      item.title.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item, itemIndex) => (
                    <TouchableOpacity
                      key={itemIndex}
                      style={styles.searchCategoryItem}
                      onPress={() => {
                        setQuickSearchVisible(false);
                        navigation.navigate(item.screen);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.searchCategoryItemText}>{item.title}</Text>
                      <Icon name="chevron-right" size={16} color="#999" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
            
            <View style={styles.searchBottomSpacing} />
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  </Portal>
);

  const renderNextSession = () => {
    const nextSession = todayTraining.find(session => session.status === 'upcoming');
    
    if (!nextSession) {
      return (
        <Card style={styles.nextSessionCard}>
          <Card.Content style={styles.emptyCard}>
            <Icon name="check-circle" size={48} color="#4CAF50" />
            <Text style={styles.noSessionsText}>All sessions completed!</Text>
            <Text style={styles.motivationText}>Great work today! Keep the momentum going.</Text>
            <Button 
              mode="contained" 
              style={styles.createButton}
              onPress={() => navigation.navigate('WorkoutPlanning')}>
              Plan Tomorrow's Training
            </Button>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.nextSessionCard}>
        <Card.Content>
          <View style={styles.nextSessionHeader}>
            <Icon name="schedule" size={24} color={COLORS.primary} />
            <Text style={styles.nextSessionTitle}>Next Session</Text>
          </View>
          <View style={styles.nextSessionContent}>
            <Text style={styles.nextSessionName}>{nextSession.title}</Text>
            <Text style={styles.nextSessionTime}>{nextSession.time} • {nextSession.duration} minutes</Text>
            <Text style={styles.nextSessionCoach}>{nextSession.coach} • {nextSession.location}</Text>
          </View>
          <Button 
            mode="contained" 
            icon="play-arrow"
            style={styles.startSessionButton}
            onPress={() => navigation.navigate('WorkoutExecution', { sessionId: nextSession.id })}>
            <Text style={styles.startSessionText}>Start Session</Text>
          </Button>
        </Card.Content>
      </Card>
    );
  };

  const renderWeeklyProgress = () => (
    <Card style={styles.weeklyProgressContainer}>
      <Card.Title title="This Week's Progress" />
      <Card.Content>
        <View style={styles.weeklyProgressStats}>
          <Text style={styles.weeklyProgressNumber}>{athleteData.completedSessions}/{athleteData.weeklyGoal}</Text>
          <Text style={styles.weeklyProgressLabel}>sessions completed</Text>
        </View>
        <View style={styles.weeklyProgressDays}>
          {weeklyProgress.map((day, index) => (
            <View key={index} style={styles.dayContainer}>
              <View style={[
                styles.dayCircle,
                { backgroundColor: day.completed ? '#4CAF50' : '#E0E0E0' }
              ]}>
                <Icon 
                  name={getTrainingTypeIcon(day.type)} 
                  size={16} 
                  color={day.completed ? 'white' : '#999'} 
                />
              </View>
              <Text style={styles.dayText}>{day.day}</Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderRecentAchievements = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Achievements</Text>
      {recentAchievements.map((achievement) => (
        <TouchableOpacity 
          key={achievement.id} 
          style={styles.achievementCard}
          onPress={() => navigation.navigate('AchievementDetail', { achievementId: achievement.id })}
          activeOpacity={0.7}>
          <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
            <Icon name={achievement.icon} size={24} color="white" />
          </View>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>
            <Text style={styles.achievementDate}>{achievement.date}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

 const renderTodaySessions = () => {
  if (!todayTraining || todayTraining.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Training</Text>
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyCard}>
            <Icon name="event-available" size={48} color="#4CAF50" />
            <Text style={styles.noSessionsText}>No sessions scheduled</Text>
            <Text style={styles.motivationText}>Take a well-deserved rest day or create a custom workout!</Text>
            <Button 
              mode="outlined" 
              style={styles.createButton}
              onPress={() => navigation.navigate('WorkoutPlanning')}>
              Create Workout
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Training</Text>
        <Button mode="text" onPress={() => navigation.navigate('TodaySchedule')}>
          View All
        </Button>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.sessionsScroll}
        contentContainerStyle={{ paddingRight: SPACING.lg }}>
        {todayTraining.map((session) => (
          <TouchableOpacity 
            key={session.id}
            style={styles.sessionCard}
            onPress={() => navigation.navigate('SessionDetail', { sessionId: session.id })}
            activeOpacity={0.9}>
            <ImageBackground 
              source={{ uri: session.image }}
              style={styles.sessionImage}
              imageStyle={styles.sessionImageStyle}>
              <View style={styles.sessionOverlay}>
                <View style={styles.sessionHeader}>
                  <Chip 
                    mode="flat" 
                    textStyle={styles.typeText}
                    style={styles.typeChip}>
                    {session.type}
                  </Chip>
                  <Chip 
                    mode="flat" 
                    textStyle={[styles.statusText, { color: getStatusColor(session.status) }]}
                    style={[styles.statusChip, { backgroundColor: getStatusColor(session.status) }]}>
                    {session.status}
                  </Chip>
                </View>
                <View style={styles.sessionContent}>
                  <Text style={styles.sessionTitle}>{session.title}</Text>
                  <Text style={styles.sessionCoach}>{session.coach}</Text>
                  <Text style={styles.sessionLocation}>{session.location}</Text>
                  
                  <View style={styles.sessionDetails}>
                    <View style={styles.sessionDetailItem}>
                      <Icon name="schedule" size={14} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.sessionDetailText}>{session.time}</Text>
                    </View>
                    <View style={styles.sessionDetailItem}>
                      <Icon name="timer" size={14} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.sessionDetailText}>{session.duration}min</Text>
                    </View>
                    <View style={styles.sessionDetailItem}>
                      <Icon name="fitness-center" size={14} color={getIntensityColor(session.intensity)} />
                      <Text style={[styles.sessionDetailText, { color: getIntensityColor(session.intensity) }]}>
                        {session.intensity}
                      </Text>
                    </View>
                  </View>
                  
                  {session.status === 'completed' && (
                    <View style={styles.completionContainer}>
                      <Text style={styles.completionText}>Completion: {session.completionRate}%</Text>
                      <ProgressBar 
                        progress={session.completionRate / 100} 
                        color="rgba(76, 175, 80, 0.8)"
                        style={styles.completionBar}
                      />
                    </View>
                  )}
                  
                  <Button 
                    mode="outlined" 
                    style={styles.sessionButton}
                    labelStyle={{ color: 'white' }}
                    onPress={() => {
                      if (session.status === 'upcoming') {
                        navigation.navigate('WorkoutExecution', { sessionId: session.id });
                      } else {
                        navigation.navigate('SessionDetail', { sessionId: session.id });
                      }
                    }}>
                    {session.status === 'upcoming' ? 'Start Session' : 'View Details'}
                  </Button>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

  const renderActivePrograms = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Programs</Text>
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('MyTrainingPlans')}>
          View All
        </Button>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.programsScroll}
        contentContainerStyle={{ paddingRight: SPACING.lg }}>
        {activePrograms.map((program) => (
          <TouchableOpacity 
            key={program.id}
            style={styles.programCard}
            onPress={() => navigation.navigate('ProgramDetail', { programId: program.id })}
            activeOpacity={0.9}>
            <LinearGradient
              colors={program.bgGradient}
              style={styles.programGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              
              <View style={styles.programHeader}>
                <Chip 
                  mode="flat" 
                  textStyle={styles.categoryText}
                  style={styles.categoryChip}>
                  {program.category}
                </Chip>
                <Text style={styles.difficultyText}>{program.difficulty}</Text>
              </View>

              <View>
                <Text style={styles.programTitle}>{program.title}</Text>
                <Text style={styles.programSubtitle}>{program.subtitle}</Text>
                <Text style={styles.programWeek}>{program.week}</Text>
                <Text style={styles.programCoach}>with {program.coach}</Text>
                
                <View style={styles.programMeta}>
                  <View style={styles.programStats}>
                    <Text style={styles.programStat}>{program.sessionsCompleted}/{program.totalSessions} sessions</Text>
                    <Text style={styles.programStat}>{program.attendance} attendance</Text>
                    <Text style={styles.programStat}>★ {program.rating}</Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <Text style={styles.progressLabel}>Progress • {Math.round(program.progress * 100)}%</Text>
                  <ProgressBar 
                    progress={program.progress} 
                    color="rgba(255,255,255,0.9)"
                    style={styles.programProgress}
                  />
                </View>

                <Text style={styles.nextSession}>{program.nextSession}</Text>
                
                <Button 
                  mode="outlined" 
                  style={styles.programButton}
                  labelStyle={{ color: 'white' }}
                  onPress={() => navigation.navigate('ProgramDetail', { programId: program.id })}>
                  Continue Program
                </Button>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPerformanceCard = () => (
    <Card style={styles.performanceCard}>
      <Card.Title title="Performance Overview" />
      <Card.Content>
        <View style={styles.performanceMetrics}>
          <View style={styles.performanceMetric}>
            <Icon name="trending-up" size={24} color="#4CAF50" />
            <View>
              <Text style={styles.performanceMetricValue}>+12%</Text>
              <Text style={styles.performanceMetricLabel}>Overall Progress</Text>
            </View>
          </View>
          <View style={styles.performanceMetric}>
            <Icon name="timer" size={24} color="#2196F3" />
            <View>
              <Text style={styles.performanceMetricValue}>5.2s</Text>
              <Text style={styles.performanceMetricLabel}>40m Sprint PB</Text>
            </View>
          </View>
          <View style={styles.performanceMetric}>
            <Icon name="fitness-center" size={24} color="#FF9800" />
            <View>
              <Text style={styles.performanceMetricValue}>85kg</Text>
              <Text style={styles.performanceMetricLabel}>Squat Max</Text>
            </View>
          </View>
        </View>
        <View style={styles.performanceActions}>
          <Button 
            mode="outlined" 
            style={styles.performanceButton}
            onPress={() => navigation.navigate('PerformanceDashboard')}>
            View Analytics
          </Button>
          <Button 
            mode="contained" 
            style={styles.performanceButton}
            onPress={() => navigation.navigate('FitnessTests')}>
            Take Test
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderRecentActivities = () => (
    <Card style={styles.activitiesCard}>
      <Card.Title title="Recent Activity" />
      <Card.Content>
        {recentActivities.map((activity) => (
          <TouchableOpacity 
            key={activity.id} 
            style={styles.activityItem}
            onPress={activity.action}
            activeOpacity={0.7}>
            <View style={[styles.activityIconContainer, { backgroundColor: activity.color }]}>
              <Icon name={activity.icon} size={20} color="white" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>{activity.text}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <Button 
          mode="outlined" 
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('ActivityHistory')}>
          View All Activities
        </Button>
      </Card.Content>
    </Card>
  );

  const renderCoachConnection = () => (
    <Card style={styles.coachCard}>
      <Card.Title title="Coach Connection" />
      <Card.Content>
        <View style={styles.coachConnectionGrid}>
          <TouchableOpacity 
            style={styles.coachActionCard}
            onPress={() => navigation.navigate('CoachChat')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.coachActionGradient}>
              <Icon name="chat" size={32} color="white" />
              <Text style={styles.coachActionTitle}>Message Coach</Text>
              <Text style={styles.coachActionSubtitle}>Get instant feedback</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.coachActionCard}
            onPress={() => navigation.navigate('BookSession')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              style={styles.coachActionGradient}>
              <Icon name="schedule" size={32} color="white" />
              <Text style={styles.coachActionTitle}>Book Session</Text>
              <Text style={styles.coachActionSubtitle}>1-on-1 training</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <View style={styles.coachStatsRow}>
          <View style={styles.coachStat}>
            <Text style={styles.coachStatNumber}>28</Text>
            <Text style={styles.coachStatLabel}>Sessions</Text>
          </View>
          <View style={styles.coachStat}>
            <Text style={styles.coachStatNumber}>4.9</Text>
            <Text style={styles.coachStatLabel}>Rating</Text>
          </View>
          <View style={styles.coachStat}>
            <Text style={styles.coachStatNumber}>92%</Text>
            <Text style={styles.coachStatLabel}>Attendance</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAcademyDiscovery = () => (
    <Card style={styles.academyCard}>
      <Card.Title title="Discover Academies" />
      <Card.Content>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { title: 'Elite Football Academy', subtitle: '2.3km away', color: ['#4ECDC4', '#44B3AA'] },
            { title: 'Pro Basketball Center', subtitle: '1.8km away', color: ['#FF6B6B', '#FF8E8E'] },
            { title: 'Tennis Excellence Hub', subtitle: '3.1km away', color: ['#45B7D1', '#3A9BC1'] },
            { title: 'Multi-Sport Complex', subtitle: '0.9km away', color: ['#F39C12', '#E67E22'] }
          ].map((academy, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.academyDiscoveryCard}
              onPress={() => navigation.navigate('AcademyDetail', { academyId: index })}
              activeOpacity={0.8}>
              <LinearGradient
                colors={academy.color}
                style={styles.academyDiscoveryGradient}>
                <Icon name="school" size={32} color="white" />
                <Text style={styles.academyDiscoveryTitle}>{academy.title}</Text>
                <Text style={styles.academyDiscoverySubtitle}>{academy.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderAITools = () => (
    <Card style={styles.aiToolsCard}>
      <Card.Title title="AI Training Tools" />
      <Card.Content>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { title: 'Form Analyzer', subtitle: 'AI video analysis', color: ['#667eea', '#764ba2'], icon: 'video-camera-front' },
            { title: 'Nutrition Coach', subtitle: 'Smart meal planning', color: ['#f093fb', '#f5576c'], icon: 'restaurant' },
            { title: 'Recovery Assistant', subtitle: 'Optimize rest periods', color: ['#4ECDC4', '#44B3AA'], icon: 'healing' },
            { title: 'Performance Predictor', subtitle: 'Future insights', color: ['#FF6B6B', '#FF8E8E'], icon: 'psychology' }
          ].map((tool, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.aiToolCard}
              onPress={() => navigation.navigate('AITool', { toolType: tool.title })}
              activeOpacity={0.8}>
              <LinearGradient
                colors={tool.color}
                style={styles.aiToolGradient}>
                <Icon name={tool.icon} size={32} color="white" />
                <Text style={styles.aiToolTitle}>{tool.title}</Text>
                <Text style={styles.aiToolSubtitle}>{tool.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderWellnessTracking = () => (
    <Card style={styles.wellnessCard}>
      <Card.Title title="Wellness Tracking" />
      <Card.Content>
        <View style={styles.wellnessMetrics}>
          <View style={styles.wellnessMetric}>
            <Icon name="local-drink" size={24} color="#2196F3" />
            <Text style={styles.wellnessMetricValue}>1.8L</Text>
            <Text style={styles.wellnessMetricLabel}>Hydration</Text>
          </View>
          <View style={styles.wellnessMetric}>
            <Icon name="bedtime" size={24} color="#9C27B0" />
            <Text style={styles.wellnessMetricValue}>7.5h</Text>
            <Text style={styles.wellnessMetricLabel}>Sleep</Text>
          </View>
          <View style={styles.wellnessMetric}>
            <Icon name="mood" size={24} color="#FF9800" />
            <Text style={styles.wellnessMetricValue}>Good</Text>
            <Text style={styles.wellnessMetricLabel}>Mood</Text>
          </View>
          <View style={styles.wellnessMetric}>
            <Icon name="favorite" size={24} color="#F44336" />
            <Text style={styles.wellnessMetricValue}>145</Text>
            <Text style={styles.wellnessMetricLabel}>Avg HR</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTeamInfo = () => (
    <TouchableOpacity 
      style={styles.teamInfoCard}
      onPress={() => navigation.navigate('TeamDashboard')}
      activeOpacity={0.8}>
      <View style={styles.teamInfo}>
        <Avatar.Image 
          size={50} 
          source={{ uri: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=100' }}
        />
        <View style={styles.teamDetails}>
          <Text style={styles.teamName}>{athleteData.team}</Text>
          <Text style={styles.coachName}>Coach: {athleteData.coach}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.teamChatButton}
        onPress={() => navigation.navigate('TeamChat')}>
        <Icon name="chat" size={16} color={COLORS.primary} />
        <Text style={styles.teamChatText}>Team Chat</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderMenuModal = () => (
    <Portal>
      <Modal
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        contentContainerStyle={styles.menuModal}>
        <BlurView intensity={90} style={styles.menuBlur}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Player Menu</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setMenuVisible(false)}
              />
            </View>
            <ScrollView>
              {menuOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuOption}
                  onPress={() => {
                    setMenuVisible(false);
                    option.action();
                  }}>
                  <Icon name={option.icon} size={24} color="#2c3e50" />
                  <Text style={styles.menuOptionText}>{option.label}</Text>
                  <Icon name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Enhanced Player Header */}
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
              <Text style={styles.tagline}>Train • Progress • Achieve</Text>
            </View>
            
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => setQuickSearchVisible(true)}>
                <Icon name="search" size={24} color="white" style={styles.headerIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('PlayerNotifications')}>
                <View style={styles.notificationContainer}>
                  <Icon name="notifications" size={24} color="white" style={styles.headerIcon} />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>2</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <Icon name="dots-vertical" size={24} color="white" style={styles.headerIcon} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatarContainer}
              activeOpacity={0.8}
            >
              <Avatar.Image 
                size={60} 
                source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }}
                style={styles.userAvatar}
              />
              <View style={styles.editIconOverlay}>
                <Icon name="edit" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()}, {athleteData.name}!</Text>
              <Text style={styles.timeSlot}>{currentTimeSlot} • Ready for your {athleteData.sport} training?</Text>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            </View>
          </View>
          
          {/* Streak Counter */}
          <View style={styles.streakContainer}>
            <Icon name="local-fire-department" size={20} color="#FF6B35" />
            <Text style={styles.streakText}>{athleteData.streak} day streak!</Text>
            <Text style={styles.streakSubtext}>Keep it going!</Text>
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

        {/* Enhanced Player Stats Grid */}
        <Animated.View 
          style={[
            styles.statsSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
          <Text style={styles.sectionTitle}>Your Training Stats</Text>
          <View style={styles.statsGrid}>
            {playerStats.map((stat, index) => (
              <Animated.View key={index} style={styles.statCard}>
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

        {/* Next Session */}
        {renderNextSession()}

        {/* Weekly Progress */}
        {renderWeeklyProgress()}

        {/* Today's Training Sessions */}
        {renderTodaySessions()}

        {/* Active Programs */}
        {renderActivePrograms()}

        {/* Recent Achievements */}
        {renderRecentAchievements()}

        {/* Performance Overview */}
        {renderPerformanceCard()}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Recent Activities */}
        {renderRecentActivities()}

        {/* Coach Connection */}
        {renderCoachConnection()}

        {/* Academy Discovery */}
        {renderAcademyDiscovery()}

        {/* AI Tools */}
        {renderAITools()}

        {/* Wellness Tracking */}
        {renderWellnessTracking()}

        {/* Team Info */}
        {renderTeamInfo()}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => navigation.navigate('QuickWorkout')}
        label="Quick Workout"
      />

      {/* Modals */}
      {renderMenuModal()}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: StatusBar.currentHeight || 44,
  },
  headerGradient: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statGradient: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 20,
    justifyContent: 'space-between',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statTrend: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.xs,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  // Next Session Card Styles
  nextSessionCard: {
    backgroundColor: 'white',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    padding: SPACING.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nextSessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  nextSessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: SPACING.sm,
  },
  nextSessionContent: {
    marginBottom: SPACING.md,
  },
  nextSessionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: SPACING.xs,
  },
  nextSessionTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: SPACING.xs,
  },
  nextSessionCoach: {
    fontSize: 14,
    color: '#888',
  },
  startSessionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  startSessionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
  },
  // Today's Stats Styles
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: SPACING.xs,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statUnit: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  // Weekly Progress Styles
  weeklyProgressContainer: {
    backgroundColor: 'white',
    marginHorizontal: SPACING.lg,
    borderRadius: 16,
    padding: SPACING.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  weeklyProgressStats: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  weeklyProgressNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  weeklyProgressLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  weeklyProgressDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  // Achievement Card Styles
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
  },
  achievementDate: {
    fontSize: 12,
    color: '#999',
  },
  // Session Card Styles
  emptyCard: {
    margin: SPACING.md,
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  noSessionsText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  motivationText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  createButton: {
    borderRadius: 12,
  },
  sessionsScroll: {
    paddingHorizontal: SPACING.lg,
  },
  sessionCard: {
    width: CARD_WIDTH,
    height: 300,
    marginRight: SPACING.md,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sessionImage: {
    flex: 1,
    borderRadius: 20,
  },
  sessionImageStyle: {
    borderRadius: 20,
  },
  sessionOverlay: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: 20,
    justifyContent: 'space-between',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 24,
  },
  typeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  statusChip: {
    height: 24,
    minWidth: 24,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  sessionContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  sessionCoach: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  sessionLocation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.md,
  },
  sessionDetails: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  sessionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  sessionDetailText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 4,
  },
  completionContainer: {
    marginBottom: SPACING.md,
  },
  completionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  completionBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  sessionButton: {
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  // Program Card Styles
  programsScroll: {
    paddingHorizontal: SPACING.lg,
  },
  programCard: {
    width: CARD_WIDTH * 0.9,
    height: 320,
    marginRight: SPACING.md,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  programGradient: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: 20,
    justifyContent: 'space-between',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 24,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  difficultyText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  programTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  programSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.sm,
  },
  programWeek: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.xs,
  },
  programCoach: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.md,
  },
  programMeta: {
    marginBottom: SPACING.md,
  },
  programStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  programStat: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 6,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
    fontWeight: '600',
  },
  programProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  nextSession: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  programButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  // Performance Card Styles
  performanceCard: {
    margin: SPACING.md,
    marginHorizontal: SPACING.lg,
  },
  performanceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  performanceMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  performanceMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: SPACING.sm,
  },
  performanceMetricLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: SPACING.sm,
    marginTop: 2,
  },
  performanceActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  performanceButton: {
    flex: 1,
    borderRadius: 12,
  },
  // Activities Card Styles
  activitiesCard: {
    margin: SPACING.md,
    marginHorizontal: SPACING.lg,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  viewAllButton: {
    marginTop: SPACING.md,
    borderRadius: 12,
  },
  // Quick Actions Styles
  quickActionsCard: {
    margin: SPACING.md,
    marginHorizontal: SPACING.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - SPACING.lg * 3) / 2,
    height: 100,
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quickActionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  // Coach Connection Styles
  coachCard: {
    margin: SPACING.md,
    marginHorizontal: SPACING.lg,
  },
  coachConnectionGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  coachActionCard: {
    flex: 1,
    height: 120,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  coachActionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: SPACING.md,
  },
  coachActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  coachActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  coachStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: SPACING.md,
  },
  coachStat: {
    alignItems: 'center',
  },
  coachStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  coachStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // Academy Styles
  academyCard: {
    margin: SPACING.md,
    marginHorizontal: SPACING.lg,
  },
  academyDiscoveryCard: {
    width: 140,
    height: 100,
    marginRight: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  academyDiscoveryGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: SPACING.sm,
  },
  academyDiscoveryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  academyDiscoverySubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  // AI Tools Styles
  aiToolsCard: {
    margin: SPACING.md,
    marginHorizontal: SPACING.lg,
  },
  aiToolCard: {
    width: 140,
    height: 100,
    marginRight: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  aiToolGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: SPACING.sm,
  },
  aiToolTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  aiToolSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  // Wellness Styles
  wellnessCard: {
    margin: SPACING.md,
    marginHorizontal: SPACING.lg,
  },
  wellnessMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  wellnessMetric: {
    alignItems: 'center',
    flex: 1,
  },
  wellnessMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: SPACING.xs,
  },
  wellnessMetricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  // Team Info Styles
  teamInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamDetails: {
    marginLeft: SPACING.md,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  coachName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  teamChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  teamChatText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  // FAB Styles
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
    elevation: 8,
  },
  // Modal Styles
  menuModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuBlur: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: height * 0.6,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  menuOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: SPACING.md,
    fontWeight: '500',
  },
  searchModal: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  searchBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  searchContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: SPACING.lg,
    maxHeight: height * 0.5,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  searchBar: {
    marginBottom: SPACING.lg,
    elevation: 0,
    backgroundColor: '#f8f9fa',
  },
  quickSearchOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  searchChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  appBranding: {
    flex: 1,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: SPACING.md,
    padding: SPACING.sm,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  userAvatar: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editIconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
    fontWeight: '600',
  },
  timeSlot: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  streakText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
    marginRight: SPACING.xs,
  },
  streakSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    paddingTop: 280,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsSection: {
    marginBottom: SPACING.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
  },
  statCard: {
    width: (width - SPACING.lg * 3) / 2,
    height: 120,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // Quick Search Modal Styles
quickSearchModal: {
  flex: 1,
  justifyContent: 'center',
  paddingHorizontal: SPACING.lg,
},
quickSearchBlur: {
  flex: 1,
  justifyContent: 'center',
},
quickSearchContainer: {
  backgroundColor: 'rgba(255,255,255,0.95)',
  borderRadius: 20,
  maxHeight: height * 0.8,
  overflow: 'hidden',
},
quickSearchHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: SPACING.lg,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
},
quickSearchTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#2c3e50',
},
quickSearchBar: {
  margin: SPACING.lg,
  elevation: 0,
  backgroundColor: '#f8f9fa',
  borderRadius: 12,
},
quickSearchInput: {
  fontSize: 16,
},
quickSearchContent: {
  flex: 1,
  paddingHorizontal: SPACING.lg,
},
quickChipsContainer: {
  marginBottom: SPACING.xl,
},
quickChipsTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: SPACING.md,
},
quickChipsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: SPACING.sm,
},
quickChip: {
  marginRight: 0,
  marginBottom: 0,
  borderColor: COLORS.primary,
},
quickChipText: {
  fontSize: 12,
  color: COLORS.primary,
},
searchCategory: {
  marginBottom: SPACING.xl,
},
searchCategoryTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: SPACING.md,
},
searchCategoryItems: {
  backgroundColor: '#f8f9fa',
  borderRadius: 12,
  overflow: 'hidden',
},
searchCategoryItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.sm,
  borderBottomWidth: 1,
  borderBottomColor: '#e9ecef',
},
searchCategoryItemText: {
  fontSize: 16,
  color: '#2c3e50',
  fontWeight: '500',
},
searchBottomSpacing: {
  height: 50,
},
});

export default PlayerDashboard;
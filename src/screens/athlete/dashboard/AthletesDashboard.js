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
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { BlurView } from '../../../components/shared/BlurView';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/layout';
import { TEXT_STYLES } from '../../../styles/typography';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const PlayersAthletesDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [quickSearchVisible, setQuickSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTimeSlot, setCurrentTimeSlot] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const { user } = useSelector(state => state.auth);
  const { trainingPlans, sessions } = useSelector(state => state.training);
  const dispatch = useDispatch();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [athleteData, setAthleteData] = useState({
    name: 'Alex Johnson',
    sport: 'Football',
    level: 'Intermediate',
    streak: 12,
    weeklyGoal: 5,
    completedSessions: 3,
    nextSession: 'Speed & Agility',
    nextSessionTime: '4:30 PM',
    coach: 'Coach Martinez',
    team: 'Lightning FC U18',
  });

  const [todaysStats] = useState({
    caloriesBurned: 420,
    trainingTime: 75,
    heartRateAvg: 145,
    hydrationGoal: 2.5,
    hydrationCurrent: 1.8,
  });

  const [upcomingSchedule] = useState([
    {
      id: 1,
      type: 'Training',
      title: 'Speed & Agility',
      time: '4:30 PM',
      duration: '90 min',
      location: 'Main Field',
      coach: 'Coach Martinez',
    },
    {
      id: 2,
      type: 'Recovery',
      title: 'Recovery Session',
      time: 'Tomorrow 10:00 AM',
      duration: '60 min',
      location: 'Gym',
      coach: 'Recovery Specialist',
    },
    {
      id: 3,
      type: 'Match',
      title: 'League Match vs Rangers',
      time: 'Saturday 2:00 PM',
      duration: '90 min',
      location: 'City Stadium',
      coach: 'Coach Martinez',
    },
  ]);

  const [recentAchievements] = useState([
    {
      id: 1,
      title: '12-Day Training Streak!',
      description: 'Completed training for 12 consecutive days',
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

  const [weeklyProgress] = useState([
    { day: 'M', completed: true, type: 'strength' },
    { day: 'T', completed: true, type: 'cardio' },
    { day: 'W', completed: true, type: 'skills' },
    { day: 'T', completed: false, type: 'recovery' },
    { day: 'F', completed: false, type: 'strength' },
    { day: 'S', completed: false, type: 'match' },
    { day: 'S', completed: false, type: 'rest' },
  ]);



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

  //const onRefresh = () => {
  //  setRefreshing(true);
  //  // Simulate data refresh
  //  setTimeout(() => {
  //    setRefreshing(false);
  //    Alert.alert('Success', 'Dashboard updated!');
  //  }, 2000);
  //};

  // const getGreeting = () => {
  //  const hour = currentTime.getHours();
  //  if (hour < 12) return 'Good Morning';
  //  if (hour < 17) return 'Good Afternoon';
  //  return 'Good Evening';
  //};

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSessionTypeColor = (type) => {
    const colors = {
      Training: COLORS.primary,
      Recovery: '#4CAF50',
      Match: '#FF6B35',
      Assessment: '#9C27B0',
    };
    return colors[type] || COLORS.primary;
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
    // Simulate API call - in real app, dispatch actions to fetch latest data
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

  // Enhanced player stats data with comprehensive metrics
  const playerStats = [
    { 
      icon: 'fitness-center', 
      label: 'Workouts', 
      value: '42', 
      subtitle: 'this month',
      color: '#FF6B6B',
      bgGradient: ['#FF6B6B', '#FF8E8E'],
      trend: '+8 this week'
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
    { 
      icon: 'local-fire-department', 
      label: 'Streak', 
      value: '14', 
      subtitle: 'day streak',
      color: '#F39C12',
      bgGradient: ['#F39C12', '#E67E22'],
      trend: 'Personal best!'
    },
  ];

  // Today's training schedule for player
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

  // Active training programs with enhanced details
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

  // Recent activities with more comprehensive tracking
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
    },
    { 
      id: 4, 
      text: 'Joined new challenge: 30-day fitness', 
      time: '3 days ago',
      type: 'challenge',
      icon: 'flag',
      color: '#9C27B0',
      action: () => navigation.navigate('Challenges')
    },
  ];

  // Comprehensive menu options
  const menuOptions = [
    { 
      icon: 'search', 
      label: 'Quick Search', 
      action: () => setQuickSearchVisible(true),
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'upcoming':
        return '#2196F3';
      case 'in_progress':
        return '#FF9800';
      default:
        return COLORS.textSecondary;
    }
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'High':
        return '#FF5722';
      case 'Medium':
        return '#FF9800';
      case 'Low':
        return '#4CAF50';
      default:
        return COLORS.textSecondary;
    }
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

  const renderQuickActions = () => {
    const currentActions = quickActionsData.find(cat => 
      cat.category.toLowerCase().includes(activeTab) || activeTab === 'overview'
    );
    
    if (activeTab === 'overview') {
      // Show mix of actions from different categories
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
        contentContainerStyle={styles.searchModal}>
        <BlurView intensity={90} style={styles.searchBlur}>
          <View style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchTitle}>Player Search</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setQuickSearchVisible(false)}
              />
            </View>
            <Searchbar
              placeholder="Search workouts, coaches, academies, challenges..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
              autoFocus
            />
            <View style={styles.quickSearchOptions}>
              {[
                'My Workouts', 'Find Coaches', 'Training Plans', 
                'Performance', 'Community', 'Challenges', 
                'Academies', 'Nutrition Plans'
              ].map((option) => (
                <Chip
                  key={option}
                  mode="outlined"
                  onPress={() => {
                    setQuickSearchVisible(false);
                    // Navigate based on option
                    switch(option) {
                      case 'My Workouts': navigation.navigate('AssignedWorkouts'); break;
                      case 'Find Coaches': navigation.navigate('FindCoaches'); break;
                      case 'Training Plans': navigation.navigate('MyTrainingPlans'); break;
                      case 'Performance': navigation.navigate('PerformanceDashboard'); break;
                      case 'Community': navigation.navigate('PlayerCommunity'); break;
                      case 'Challenges': navigation.navigate('Challenges'); break;
                      case 'Academies': navigation.navigate('FindAcademies'); break;
                      case 'Nutrition Plans': navigation.navigate('NutritionDashboard'); break;
                      default: break;
                    }
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
              {/* Optional: Add a small edit icon overlay */}
              <View style={styles.editIconOverlay}>
                <Icon name="edit" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.greeting}>{getGreeting()}, {user?.firstName || 'Alex'}! 💪</Text>
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

          
      {/* Next Session Card */}
      <View style={styles.nextSessionCard}>
        <View style={styles.nextSessionHeader}>
          <Icon name="schedule" size={20} color={COLORS.primary} />
          <Text style={styles.nextSessionTitle}>Next Session</Text>
        </View>
        <View style={styles.nextSessionContent}>
          <Text style={styles.nextSessionName}>{athleteData.nextSession}</Text>
          <Text style={styles.nextSessionTime}>
            Today at {athleteData.nextSessionTime} • 90 min
          </Text>
          <Text style={styles.nextSessionCoach}>with {athleteData.coach}</Text>
        </View>
        <TouchableOpacity
          style={styles.startSessionButton}
          onPress={() => navigation.navigate('TodaysWorkout')}
        >
          <Text style={styles.startSessionText}>Start Session</Text>
          <Icon name="play-arrow" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions - Most Accessed</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionCard
            title="Today's Workout"
            icon="fitness-center"
            color={COLORS.primary}
            onPress={() => navigation.navigate('TodaysWorkout')}
          />
          <QuickActionCard
            title="Progress"
            icon="trending-up"
            color="#4CAF50"
            onPress={() => navigation.navigate('ProgressDashboard')}
          />
          <QuickActionCard
            title="Nutrition"
            icon="restaurant"
            color="#FF9800"
            onPress={() => navigation.navigate('NutritionDashboard')}
          />
          <QuickActionCard
            title="Coach Chat"
            icon="chat"
            color="#9C27B0"
            onPress={() => navigation.navigate('CoachChat')}
          />
        </View>
      </View>

      {/* Today's Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Calories"
            value={todaysStats.caloriesBurned}
            unit="kcal"
            icon="whatshot"
            color="#FF6B35"
          />
          <StatCard
            title="Training Time"
            value={todaysStats.trainingTime}
            unit="min"
            icon="timer"
            color={COLORS.primary}
          />
          <StatCard
            title="Avg Heart Rate"
            value={todaysStats.heartRateAvg}
            unit="bpm"
            icon="favorite"
            color="#E91E63"
          />
          <StatCard
            title="Hydration"
            value={`${todaysStats.hydrationCurrent}/${todaysStats.hydrationGoal}`}
            unit="L"
            icon="local-drink"
            color="#00BCD4"
          />
        </View>
      </View>

      {/* Weekly Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week's Progress</Text>
        <View style={styles.weeklyProgressContainer}>
          <View style={styles.weeklyProgressStats}>
            <Text style={styles.weeklyProgressNumber}>
              {athleteData.completedSessions}/{athleteData.weeklyGoal}
            </Text>
            <Text style={styles.weeklyProgressLabel}>Sessions Completed</Text>
          </View>
          <View style={styles.weeklyProgressDays}>
            {weeklyProgress.map((day, index) => (
              <View key={index} style={styles.dayContainer}>
                <View
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: day.completed ? '#4CAF50' : '#E0E0E0',
                    },
                  ]}
                >
                  <Icon
                    name={getTrainingTypeIcon(day.type)}
                    size={14}
                    color={day.completed ? '#fff' : '#9E9E9E'}
                  />
                </View>
                <Text style={styles.dayText}>{day.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Recent Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        {recentAchievements.map((achievement) => (
          <TouchableOpacity
            key={achievement.id}
            style={styles.achievementCard}
            onPress={() => navigation.navigate('Achievements')}
          >
            <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
              <Icon name={achievement.icon} size={20} color="#fff" />
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
            </View>
            <Text style={styles.achievementDate}>{achievement.date}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upcoming Schedule */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
          <TouchableOpacity onPress={() => navigation.navigate('BookingCalendar')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {upcomingSchedule.map((session) => (
          <TouchableOpacity key={session.id} style={styles.scheduleCard}>
            <View style={[styles.sessionTypeIndicator, { backgroundColor: getSessionTypeColor(session.type) }]} />
            <View style={styles.scheduleContent}>
              <View style={styles.scheduleHeader}>
                <Text style={styles.scheduleTitle}>{session.title}</Text>
                <Text style={[styles.scheduleType, { color: getSessionTypeColor(session.type) }]}>
                  {session.type}
                </Text>
              </View>
              <Text style={styles.scheduleTime}>
                {session.time} • {session.duration}
              </Text>
              <Text style={styles.scheduleLocation}>
                📍 {session.location} • {session.coach}
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9E9E9E" />
          </TouchableOpacity>
        ))}
      </View>


            
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

        {/* Today's Training Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Training</Text>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('TrainingSchedule')}
              textColor="#667eea">
              View All
            </Button>
          </View>
          
          {todayTraining.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.noSessionsText}>No training scheduled for today</Text>
                <Text style={styles.motivationText}>Perfect time for a rest day! 🏖️</Text>
                <Button 
                  mode="contained"
                  buttonColor="#667eea"
                  style={styles.createButton}
                  onPress={() => navigation.navigate('CustomWorkouts')}>
                  Create Workout
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
                        <Chip 
                          mode="flat"
                          textStyle={styles.statusText}
                          style={[styles.statusChip, { backgroundColor: getStatusColor(session.status) }]}>
                          {session.status === 'completed' ? '✓' : session.status === 'upcoming' ? '○' : '▶'}
                        </Chip>
                      </View>

                      <View style={styles.sessionContent}>
                        <Text style={styles.sessionTitle}>{session.title}</Text>
                        <Text style={styles.sessionCoach}>👨‍💼 {session.coach}</Text>
                        <Text style={styles.sessionLocation}>📍 {session.location}</Text>
                        
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
                            <Icon name="whatshot" size={16} color={getIntensityColor(session.intensity)} />
                            <Text style={[styles.sessionDetailText, { color: getIntensityColor(session.intensity) }]}>
                              {session.intensity}
                            </Text>
                          </View>
                        </View>

                        {session.status === 'completed' && (
                          <View style={styles.completionContainer}>
                            <Text style={styles.completionText}>Completed: {session.completionRate}%</Text>
                            <ProgressBar 
                              progress={session.completionRate / 100} 
                              color="#4CAF50"
                              style={styles.completionBar}
                            />
                          </View>
                        )}

                        <Button
                          mode={session.status === 'upcoming' ? "contained" : "outlined"}
                          buttonColor={session.status === 'upcoming' ? "#667eea" : "transparent"}
                          textColor="white"
                          style={styles.sessionButton}
                          onPress={() => session.status === 'upcoming' ? 
                            navigation.navigate('AssignedWorkouts', { sessionId: session.id }) :
                            navigation.navigate('WorkoutSummary', { sessionId: session.id })
                          }>
                          {session.status === 'upcoming' ? 'Start Training' : 'View Summary'}
                        </Button>
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                </Card>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Active Training Programs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Training Programs</Text>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('MyTrainingPlans')}
              textColor="#667eea">
              View All
            </Button>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.programsScroll}>
            {activePrograms.map((program) => (
              <Card key={program.id} style={styles.programCard}>
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

                  <Text style={styles.programTitle}>{program.title}</Text>
                  <Text style={styles.programSubtitle}>{program.subtitle}</Text>
                  <Text style={styles.programWeek}>{program.week}</Text>
                  <Text style={styles.programCoach}>👨‍💼 {program.coach}</Text>
                  
                  <View style={styles.programMeta}>
                    <View style={styles.programStats}>
                      <Text style={styles.programStat}>⭐ {program.rating}</Text>
                      <Text style={styles.programStat}>✅ {program.sessionsCompleted}/{program.totalSessions}</Text>
                      <Text style={styles.programStat}>📊 {program.attendance}</Text>
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <Text style={styles.progressLabel}>
                      {Math.round(program.progress * 100)}% Complete
                    </Text>
                    <ProgressBar 
                      progress={program.progress} 
                      color="rgba(255,255,255,0.9)"
                      style={styles.programProgress}
                    />
                  </View>

                  <Text style={styles.nextSession}>{program.nextSession}</Text>
                  
                  <Button
                    mode="contained"
                    buttonColor="rgba(255,255,255,0.2)"
                    textColor="white"
                    style={styles.programButton}
                    onPress={() => navigation.navigate('ProgressTracking', { programId: program.id })}>
                    View Progress
                  </Button>
                </LinearGradient>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Performance Insights Card */}
        <Card style={styles.performanceCard}>
          <Card.Title 
            title="Performance Insights"
            subtitle="Track your athletic progress and improvements"
          />
          <Card.Content>
            <View style={styles.performanceMetrics}>
              <View style={styles.performanceMetric}>
                <Icon name="trending-up" size={24} color="#27AE60" />
                <View>
                  <Text style={styles.performanceMetricValue}>+18%</Text>
                  <Text style={styles.performanceMetricLabel}>Performance Boost</Text>
                </View>
              </View>
              <View style={styles.performanceMetric}>
                <Icon name="fitness-center" size={24} color="#3498DB" />
                <View>
                  <Text style={styles.performanceMetricValue}>87%</Text>
                  <Text style={styles.performanceMetricLabel}>Goal Achievement</Text>
                </View>
              </View>
            </View>
            <View style={styles.performanceActions}>
              <Button 
                mode="outlined" 
                style={styles.performanceButton}
                onPress={() => navigation.navigate('PersonalRecords')}>
                Personal Records
              </Button>
              <Button 
                mode="contained"
                buttonColor="#667eea"
                style={styles.performanceButton}
                onPress={() => navigation.navigate('PerformanceDashboard')}>
                Full Analytics
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activities */}
        <Card style={styles.activitiesCard}>
          <Card.Title 
            title="Recent Activity" 
            subtitle="Stay updated with your training journey"
          />
          <Card.Content>
            {recentActivities.map((activity) => (
              <TouchableOpacity 
                key={activity.id} 
                style={styles.activityItem}
                onPress={activity.action}>
                <View style={[styles.activityIconContainer, { backgroundColor: `${activity.color}20` }]}>
                  <Icon 
                    name={activity.icon} 
                    size={20} 
                    color={activity.color}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.text}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
            <Button 
              mode="outlined" 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('RecentActivity')}>
              View All Activities
            </Button>
          </Card.Content>
        </Card>

        {/* Enhanced Quick Actions */}
        {renderQuickActions()}

        {/* Coach Connection Card */}
        <Card style={styles.coachCard}>
          <Card.Title 
            title="Connect with Coaches"
            subtitle="Find and book sessions with professional trainers"
          />
          <Card.Content>
            <View style={styles.coachConnectionGrid}>
              <TouchableOpacity 
                style={styles.coachActionCard}
                onPress={() => navigation.navigate('FindCoaches')}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.coachActionGradient}>
                  <Icon name="search" size={40} color="white" />
                  <Text style={styles.coachActionTitle}>Find Coaches</Text>
                  <Text style={styles.coachActionSubtitle}>Discover expert trainers</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.coachActionCard}
                onPress={() => navigation.navigate('MyCoaches')}>
                <LinearGradient
                  colors={['#4ECDC4', '#44B3AA']}
                  style={styles.coachActionGradient}>
                  <Icon name="people" size={40} color="white" />
                  <Text style={styles.coachActionTitle}>My Coaches</Text>
                  <Text style={styles.coachActionSubtitle}>Manage your trainers</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <View style={styles.coachStatsRow}>
              <View style={styles.coachStat}>
                <Text style={styles.coachStatNumber}>3</Text>
                <Text style={styles.coachStatLabel}>Active Coaches</Text>
              </View>
              <View style={styles.coachStat}>
                <Text style={styles.coachStatNumber}>28</Text>
                <Text style={styles.coachStatLabel}>Sessions Booked</Text>
              </View>
              <View style={styles.coachStat}>
                <Text style={styles.coachStatNumber}>4.9</Text>
                <Text style={styles.coachStatLabel}>Avg Rating</Text>
              </View>
              <View style={styles.coachStat}>
                <Text style={styles.coachStatNumber}>12</Text>
                <Text style={styles.coachStatLabel}>This Month</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Academy Discovery Card */}
        <Card style={styles.academyCard}>
          <Card.Title 
            title="Sports Academies"
            subtitle="Discover and join professional sports academies"
          />
          <Card.Content>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity 
                style={styles.academyDiscoveryCard}
                onPress={() => navigation.navigate('FindAcademies')}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E8E']}
                  style={styles.academyDiscoveryGradient}>
                  <Icon name="school" size={32} color="white" />
                  <Text style={styles.academyDiscoveryTitle}>Find Academies</Text>
                  <Text style={styles.academyDiscoverySubtitle}>Explore top academies</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.academyDiscoveryCard}
                onPress={() => navigation.navigate('MyAcademy')}>
                <LinearGradient
                  colors={['#4ECDC4', '#44B3AA']}
                  style={styles.academyDiscoveryGradient}>
                  <Icon name="home" size={32} color="white" />
                  <Text style={styles.academyDiscoveryTitle}>My Academy</Text>
                  <Text style={styles.academyDiscoverySubtitle}>Your current academy</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.academyDiscoveryCard}
                onPress={() => navigation.navigate('ScholarshipPrograms')}>
                <LinearGradient
                  colors={['#45B7D1', '#3A9BC1']}
                  style={styles.academyDiscoveryGradient}>
                  <Icon name="school" size={32} color="white" />
                  <Text style={styles.academyDiscoveryTitle}>Scholarships</Text>
                  <Text style={styles.academyDiscoverySubtitle}>Find opportunities</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* AI Tools Showcase */}
        <Card style={styles.aiToolsCard}>
          <Card.Title 
            title="AI Training Assistant"
            subtitle="Enhance your training with intelligent tools"
          />
          <Card.Content>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity 
                style={styles.aiToolCard}
                onPress={() => navigation.navigate('AITrainingAssistant')}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E8E']}
                  style={styles.aiToolGradient}>
                  <Icon name="auto-awesome" size={32} color="white" />
                  <Text style={styles.aiToolTitle}>AI Assistant</Text>
                  <Text style={styles.aiToolSubtitle}>Personal training advisor</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.aiToolCard}
                onPress={() => navigation.navigate('PersonalizedWorkouts')}>
                <LinearGradient
                  colors={['#4ECDC4', '#44B3AA']}
                  style={styles.aiToolGradient}>
                  <Icon name="psychology" size={32} color="white" />
                  <Text style={styles.aiToolTitle}>Smart Workouts</Text>
                  <Text style={styles.aiToolSubtitle}>AI-generated training</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.aiToolCard}
                onPress={() => navigation.navigate('TechniqueAnalysis')}>
                <LinearGradient
                  colors={['#45B7D1', '#3A9BC1']}
                  style={styles.aiToolGradient}>
                  <Icon name="videocam" size={32} color="white" />
                  <Text style={styles.aiToolTitle}>Form Analysis</Text>
                  <Text style={styles.aiToolSubtitle}>AI technique feedback</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Wellness & Recovery Section */}
        <Card style={styles.wellnessCard}>
          <Card.Title 
            title="Wellness & Recovery"
            subtitle="Track your nutrition, sleep, and recovery"
          />
          <Card.Content>
            <View style={styles.wellnessMetrics}>
              <TouchableOpacity 
                style={styles.wellnessMetric}
                onPress={() => navigation.navigate('NutritionTracking')}>
                <Icon name="restaurant" size={24} color="#27AE60" />
                <View>
                  <Text style={styles.wellnessMetricValue}>1,850</Text>
                  <Text style={styles.wellnessMetricLabel}>Calories Today</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.wellnessMetric}
                onPress={() => navigation.navigate('HydrationTracker')}>
                <Icon name="local-drink" size={24} color="#3498DB" />
                <View>
                  <Text style={styles.wellnessMetricValue}>2.1L</Text>
                  <Text style={styles.wellnessMetricLabel}>Water Intake</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.wellnessMetric}
                onPress={() => navigation.navigate('SleepAnalysis')}>
                <Icon name="bedtime" size={24} color="#9B59B6" />
                <View>
                  <Text style={styles.wellnessMetricValue}>7.5h</Text>
                  <Text style={styles.wellnessMetricLabel}>Sleep Last Night</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

      
      {/* Team & Coach Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Team</Text>
        <View style={styles.teamInfoCard}>
          <View style={styles.teamInfo}>
            <Icon name="group" size={24} color={COLORS.primary} />
            <View style={styles.teamDetails}>
              <Text style={styles.teamName}>{athleteData.team}</Text>
              <Text style={styles.coachName}>Coach: {athleteData.coach}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.teamChatButton}
            onPress={() => navigation.navigate('TeamChat')}
          >
            <Icon name="chat" size={16} color={COLORS.primary} />
            <Text style={styles.teamChatText}>Team Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

        {/* Spacer for FAB */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="play-arrow"
        label="Quick Workout"
        onPress={() => navigation.navigate('QuickWorkouts')}
      />
      {/* Quick Search Modal */}
      {renderQuickSearchModal()}
    </View>

    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: StatusBar.currentHeight + 10,
    zIndex: 1000,
    position: 'relative',
    backgroundColor: COLORS.primary,
    //padding: 20,
    //paddingTop: 50,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerGradient: {
    paddingHorizontal: SPACING.medium,
    paddingBottom: SPACING.medium,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
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
    gap: SPACING.small,
  },
  headerIcon: {
    marginHorizontal: 4,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4757',
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
    marginTop: SPACING.small,
  },
  userAvatar: {
    marginRight: SPACING.medium,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 2,
  },
  timeSlot: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#f5f7fa',
  },
  // Stats Section
  statsSection: {
    padding: SPACING.medium,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING.medium,
    color: '#2c3e50',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statGradient: {
    padding: SPACING.medium,
    borderRadius: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  statTrend: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  statSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  // Section styles
  section: {
    padding: SPACING.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  // Sessions scroll
  sessionsScroll: {
    paddingHorizontal: SPACING.small,
  },
  sessionCard: {
    width: CARD_WIDTH,
    height: 280,
    marginHorizontal: SPACING.small,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  sessionImage: {
    width: '100%',
    height: '100%',
  },
  sessionImageStyle: {
    borderRadius: 16,
  },
  sessionOverlay: {
    flex: 1,
    padding: SPACING.medium,
    justifyContent: 'space-between',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
    justifyContent: 'flex-end',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  sessionCoach: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  sessionLocation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.small,
  },
  sessionDetails: {
    flexDirection: 'row',
    marginBottom: SPACING.small,
  },
  sessionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  sessionDetailText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  completionContainer: {
    marginBottom: SPACING.small,
  },
  completionText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
  completionBar: {
    height: 4,
    borderRadius: 2,
  },
  sessionButton: {
    marginTop: SPACING.small,
  },
  // Programs scroll
  programsScroll: {
    paddingHorizontal: SPACING.small,
  },
  programCard: {
    width: CARD_WIDTH * 0.9,
    height: 320,
    marginHorizontal: SPACING.small,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
  },
  programGradient: {
    flex: 1,
    padding: SPACING.medium,
    justifyContent: 'space-between',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
  },
  difficultyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  programTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.small,
  },
  programSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  programWeek: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.small,
  },
  programCoach: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  programMeta: {
    marginTop: SPACING.medium,
  },
  programStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  programStat: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginRight: SPACING.small,
  },
  progressSection: {
    marginTop: SPACING.medium,
  },
  progressLabel: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
    fontWeight: '600',
  },
  programProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  nextSession: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.medium,
    fontWeight: '500',
  },
  programButton: {
    marginTop: SPACING.medium,
  },
  // Empty card styles
  emptyCard: {
    margin: SPACING.medium,
    padding: SPACING.large,
    alignItems: 'center',
    borderRadius: 16,
  },
  noSessionsText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.medium,
  },
  createButton: {
    marginTop: SPACING.small,
  },
  // Performance card styles
  performanceCard: {
    margin: SPACING.medium,
    borderRadius: 16,
    elevation: 3,
  },
  performanceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.medium,
  },
  performanceMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
  },
  performanceMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  performanceMetricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  performanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.small,
  },
  performanceButton: {
    flex: 1,
  },
  // Activities card styles
  activitiesCard: {
    margin: SPACING.medium,
    borderRadius: 16,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  viewAllButton: {
    marginTop: SPACING.medium,
  },
  // Quick actions styles
  quickActionsCard: {
    margin: SPACING.medium,
    borderRadius: 16,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.medium,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: 'white',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },// In your styles, change quickActionCard to:
quickActionCard: {
  backgroundColor: '#fff',
  width: (width - 60) / 2,  // This is causing oversizing
  // CHANGE TO:
  width: '48%',  // Use percentage instead
  height: 80,    // Set fixed height
  padding: 15,   // Reduce padding
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 10,
  elevation: 2,
},
  quickActionGradient: {
    padding: SPACING.medium,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
  },
  // Coach card styles
  coachCard: {
    margin: SPACING.medium,
    borderRadius: 16,
    elevation: 3,
  },
  coachConnectionGrid: {
    flexDirection: 'row',
    gap: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  coachActionCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  coachActionGradient: {
    padding: SPACING.medium,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  coachActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  coachActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  coachStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  coachStat: {
    alignItems: 'center',
  },
  coachStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  coachStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Academy card styles
  academyCard: {
    margin: SPACING.medium,
    borderRadius: 16,
    elevation: 3,
  },
  academyDiscoveryCard: {
    width: 120,
    marginRight: SPACING.medium,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  academyDiscoveryGradient: {
    padding: SPACING.medium,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  academyDiscoveryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  academyDiscoverySubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  // AI tools card styles
  aiToolsCard: {
    margin: SPACING.medium,
    borderRadius: 16,
    elevation: 3,
  },
  aiToolCard: {
    width: 120,
    marginRight: SPACING.medium,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  aiToolGradient: {
    padding: SPACING.medium,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  aiToolTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  aiToolSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  // Wellness card styles
  wellnessCard: {
    margin: SPACING.medium,
    borderRadius: 16,
    elevation: 3,
  },
  wellnessMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wellnessMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
    flex: 1,
  },
  wellnessMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  wellnessMetricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  // Search modal styles
  searchModal: {
    flex: 1,
  },
  searchBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: SPACING.large,
    elevation: 10,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  searchBar: {
    marginBottom: SPACING.medium,
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  quickSearchOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.small,
  },
  searchChip: {
    marginBottom: SPACING.small,
  },
  // FAB styles
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  timeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 15,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  streakSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
  },
  nextSessionCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    paddingTop: 47,
    borderRadius: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nextSessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nextSessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
  },
  nextSessionContent: {
    marginBottom: 15,
  },
  nextSessionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  nextSessionTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  nextSessionCoach: {
    fontSize: 14,
    color: '#666',
  },
  startSessionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
  },
  startSessionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#fff',
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: (width - 60) / 2,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    fontWeight: '600',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statUnit: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  weeklyProgressContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  weeklyProgressStats: {
    alignItems: 'center',
    marginBottom: 20,
  },
  weeklyProgressNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  weeklyProgressLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  weeklyProgressDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayText: {
    fontSize: 12,
    color: '#666',
  },
  achievementCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
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
    marginRight: 15,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
  },
  achievementDate: {
    fontSize: 12,
    color: '#999',
  },
  scheduleCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sessionTypeIndicator: {
    width: 4,
    height: 50,
    borderRadius: 2,
    marginRight: 15,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  scheduleType: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  scheduleLocation: {
    fontSize: 12,
    color: '#999',
  },
  teamInfoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  teamDetails: {
    marginLeft: 15,
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  coachName: {
    fontSize: 14,
    color: '#666',
  },
  teamChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
  },
  teamChatText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default PlayersAthletesDashboard;

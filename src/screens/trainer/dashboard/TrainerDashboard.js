import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  Vibration,
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
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';

const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
};

const SPACING = {
  xs: 4,
  small: 8,
  medium: 16,
  large: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
};

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const TrainerDashboard = ({ navigation }) => {
  // Enhanced State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [quickSearchVisible, setQuickSearchVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentTimeSlot, setCurrentTimeSlot] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Enhanced Animated values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Redux state with null safety
  const user = useSelector(state => state?.user || {});
  const clients = useSelector(state => state?.clients || []);
  const workouts = useSelector(state => state?.workouts || []);
  const sessions = useSelector(state => state?.sessions || []);
  
  const dispatch = useDispatch();

  // Enhanced dashboard data
  const [trainerData] = useState({
    name: 'Coach Martinez',
    specialization: 'Football & Fitness',
    level: 'Expert',
    rating: 4.9,
    experience: '8 years',
    certifications: ['NASM-CPT', 'FIFA Licensed', 'Sports Nutrition'],
    monthlyRevenue: 8450,
    yearlyGrowth: 24,
  });

  // Enhanced mock data with realistic trainer metrics
  const dashboardStats = useMemo(() => ({
    activeClients: clients.length || 28,
    monthlyRevenue: 5240,
    sessionsThisWeek: 22,
    completionRate: 94,
    avgClientRating: 4.8,
    newClientsThisMonth: 6,
    totalWorkouts: 156,
    certifications: 4,
    weeklyHours: 45,
    clientRetention: 92,
  }), [clients]);

  // Today's comprehensive schedule
  const todaysSchedule = useMemo(() => [
    { 
      id: 1, 
      client: 'Sarah Martinez', 
      clientAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100',
      time: '08:00 - 09:00', 
      type: 'HIIT Training', 
      status: 'confirmed',
      location: 'Studio A',
      sessionType: 'individual',
      notes: 'Focus on cardio endurance',
      intensity: 'High',
      duration: 60,
      fee: '$85'
    },
    { 
      id: 2, 
      client: 'Team Eagles', 
      clientAvatar: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=100',
      time: '10:00 - 11:30', 
      type: 'Football Training', 
      status: 'confirmed',
      location: 'Field 1',
      sessionType: 'group',
      notes: 'Sprint drills and ball work',
      intensity: 'High',
      duration: 90,
      fee: '$150'
    },
    { 
      id: 3, 
      client: 'Marcus Johnson', 
      clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      time: '14:00 - 15:00', 
      type: 'Strength Training', 
      status: 'pending',
      location: 'Gym Floor',
      sessionType: 'individual',
      notes: 'Upper body focus',
      intensity: 'Medium',
      duration: 60,
      fee: '$75'
    },
    { 
      id: 4, 
      client: 'Lisa Chen', 
      clientAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      time: '16:30 - 17:30', 
      type: 'Rehabilitation', 
      status: 'confirmed',
      location: 'Recovery Room',
      sessionType: 'individual',
      notes: 'Knee injury recovery',
      intensity: 'Low',
      duration: 60,
      fee: '$90'
    },
    { 
      id: 5, 
      client: 'Youth Soccer Group', 
      clientAvatar: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100',
      time: '18:00 - 19:30', 
      type: 'Soccer Skills', 
      status: 'confirmed',
      location: 'Field 2',
      sessionType: 'group',
      notes: 'Ages 12-14, passing techniques',
      intensity: 'Medium',
      duration: 90,
      fee: '$120'
    },
  ], []);

  // Enhanced trainer stats with comprehensive metrics
  const trainerStatsData = [
    { 
      icon: 'people', 
      label: 'Active Clients', 
      value: '28', 
      subtitle: 'this month',
      color: '#667eea',
      bgGradient: ['#667eea', '#764ba2'],
      trend: '+6 new clients',
      growth: '+27%'
    },
    { 
      icon: 'attach-money', 
      label: 'Revenue', 
      value: '$8.4K', 
      subtitle: 'monthly earnings',
      color: '#4CAF50',
      bgGradient: ['#4CAF50', '#45a049'],
      trend: '+24% this year',
      growth: '+12%'
    },
    { 
      icon: 'event', 
      label: 'Sessions', 
      value: '22/25', 
      subtitle: 'this week',
      color: '#FF5722',
      bgGradient: ['#FF5722', '#f4511e'],
      trend: '3 remaining',
      growth: '+8%'
    },
    { 
      icon: 'star', 
      label: 'Rating', 
      value: '4.9', 
      subtitle: 'client satisfaction',
      color: '#FFC107',
      bgGradient: ['#FFC107', '#FF8F00'],
      trend: 'Above average',
      growth: 'Excellent'
    },
  ];

  // Enhanced quick actions with trainer-specific features
  const quickActionItems = useMemo(() => [
    { 
      id: 1, 
      title: 'Create Workout', 
      subtitle: 'Build custom programs',
      icon: 'fitness-center', 
      color: COLORS.primary, 
      screen: 'WorkoutBuilder',
      stack: 'Workouts'
    },
    { 
      id: 2, 
      title: 'Add Client', 
      subtitle: 'Invite new trainees',
      icon: 'person-add', 
      color: COLORS.success, 
      screen: 'ClientInvitations',
      stack: 'Clients'
    },
    { 
      id: 3, 
      title: 'Schedule Session', 
      subtitle: 'Book training slots',
      icon: 'schedule', 
      color: COLORS.secondary, 
      screen: 'SessionBookings',
      stack: 'Business'
    },
    { 
      id: 4, 
      title: 'AI Generator', 
      subtitle: 'Smart workout plans',
      icon: 'auto-awesome', 
      color: '#9c27b0', 
      screen: 'AIWorkoutGenerator',
      stack: 'AI'
    },
    { 
      id: 5, 
      title: 'Analytics', 
      subtitle: 'Performance insights',
      icon: 'analytics', 
      color: '#ff5722', 
      screen: 'FitnessAnalytics',
      stack: 'Dashboard'
    },
    { 
      id: 6, 
      title: 'Nutrition Plan', 
      subtitle: 'Meal planning',
      icon: 'restaurant', 
      color: COLORS.success, 
      screen: 'NutritionPlanning',
      stack: 'Nutrition'
    },
    { 
      id: 7, 
      title: 'Video Analysis', 
      subtitle: 'Form assessment',
      icon: 'videocam', 
      color: '#607d8b', 
      screen: 'FormAnalysis',
      stack: 'AI'
    },
    { 
      id: 8, 
      title: 'Revenue Track', 
      subtitle: 'Business metrics',
      icon: 'trending-up', 
      color: '#4caf50', 
      screen: 'RevenueTracking',
      stack: 'Business'
    },
  ], []);

  // Enhanced quick actions by category
  const quickActionsData = [
    {
      category: 'Training Management',
      actions: [
        { 
          icon: 'fitness-center', 
          label: 'Create Workout', 
          action: () => navigation.navigate('WorkoutBuilder', 'Workouts'),
          color: '#667eea'
        },
        { 
          icon: 'library-books', 
          label: 'Exercise Library', 
          action: () => navigation.navigate('ExerciseDatabase', 'Workouts'),
          color: '#4ECDC4'
        },
        { 
          icon: 'psychology', 
          label: 'AI Generator', 
          action: () => navigation.navigate('AIWorkoutGenerator', 'AI'),
          color: '#45B7D1'
        },
        { 
          icon: 'video-library', 
          label: 'Program Templates', 
          action: () => navigation.navigate('ProgramTemplates', 'Workouts'),
          color: '#F39C12'
        },
      ]
    },
    {
      category: 'Client Management',
      actions: [
        { 
          icon: 'person-add', 
          label: 'Add Client', 
          action: () => navigation.navigate('ClientInvitations', 'Clients'),
          color: '#FF6B6B'
        },
        { 
          icon: 'people', 
          label: 'Client Profiles', 
          action: () => navigation.navigate('ClientProfiles', 'Clients'),
          color: '#9B59B6'
        },
        { 
          icon: 'trending-up', 
          label: 'Progress Tracking', 
          action: () => navigation.navigate('ClientProgress', 'Clients'),
          color: '#2ECC71'
        },
        { 
          icon: 'assignment', 
          label: 'Assessments', 
          action: () => navigation.navigate('FitnessAssessments', 'Clients'),
          color: '#E74C3C'
        },
      ]
    },
    {
      category: 'Business & Revenue',
      actions: [
        { 
          icon: 'schedule', 
          label: 'Book Sessions', 
          action: () => navigation.navigate('SessionBookings', 'Business'),
          color: '#27AE60'
        },
        { 
          icon: 'attach-money', 
          label: 'Revenue Tracking', 
          action: () => navigation.navigate('RevenueTracking', 'Business'),
          color: '#3498DB'
        },
        { 
          icon: 'payment', 
          label: 'Payment Processing', 
          action: () => navigation.navigate('PaymentProcessing', 'Business'),
          color: '#8E44AD'
        },
        { 
          icon: 'store', 
          label: 'Marketplace', 
          action: () => navigation.navigate('MarketplaceProfile', 'Business'),
          color: '#E67E22'
        },
      ]
    },
    {
      category: 'Analytics & AI',
      actions: [
        { 
          icon: 'analytics', 
          label: 'Performance Analytics', 
          action: () => navigation.navigate('FitnessAnalytics', 'Dashboard'),
          color: '#1ABC9C'
        },
        { 
          icon: 'videocam', 
          label: 'Form Analysis', 
          action: () => navigation.navigate('FormAnalysis', 'AI'),
          color: '#34495E'
        },
        { 
          icon: 'psychology', 
          label: 'Smart Recommendations', 
          action: () => navigation.navigate('SmartRecommendations', 'AI'),
          color: '#E91E63'
        },
        { 
          icon: 'insights', 
          label: 'Predictive Analytics', 
          action: () => navigation.navigate('PredictiveAnalytics', 'AI'),
          color: '#FF5722'
        },
      ]
    }
  ];

  // Enhanced recent activities
  const recentActivities = useMemo(() => [
    { 
      id: 1,
      icon: 'check-circle', 
      text: 'Sarah completed HIIT workout', 
      subtext: 'Burned 420 calories in 45 minutes',
      time: '2h ago', 
      color: COLORS.success,
      action: () => navigateToScreen('ClientProgress', 'Clients')
    },
    { 
      id: 2,
      icon: 'star', 
      text: 'Received 5-star review from Marcus', 
      subtext: '"Best trainer I\'ve ever worked with!"',
      time: '4h ago', 
      color: '#ffc107',
      action: () => navigateToScreen('ReviewsManagement', 'Business')
    },
    { 
      id: 3,
      icon: 'payment', 
      text: 'Payment received - Monthly package', 
      subtext: '$280 from Lisa Chen',
      time: '6h ago', 
      color: COLORS.success,
      action: () => navigateToScreen('EarningsTracker', 'Business')
    },
    { 
      id: 4,
      icon: 'message', 
      text: 'New message from Team Eagles', 
      subtext: 'Question about tomorrow\'s training',
      time: '1d ago', 
      color: COLORS.primary,
      action: () => navigateToScreen('ClientChat', 'Communication')
    },
    { 
      id: 5,
      icon: 'trending-up', 
      text: 'Client milestone achieved', 
      subtext: 'Marcus hit new deadlift PR: 180kg',
      time: '2d ago', 
      color: COLORS.secondary,
      action: () => navigateToScreen('PersonalRecords', 'Clients')
    },
  ], []);

  // Enhanced client highlights
  const clientHighlights = useMemo(() => [
    {
      id: 1,
      name: 'Sarah Martinez',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100',
      sport: 'Fitness',
      achievement: '15kg Weight Loss',
      progress: 85,
      streak: 12,
      color: COLORS.success,
      nextSession: 'Tomorrow 8:00 AM',
      program: 'Weight Loss Program'
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      sport: 'Powerlifting',
      achievement: '180kg Deadlift PR',
      progress: 92,
      streak: 8,
      color: COLORS.primary,
      nextSession: 'Today 2:00 PM',
      program: 'Strength Building'
    },
    {
      id: 3,
      name: 'Team Eagles',
      avatar: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=100',
      sport: 'Football',
      achievement: '90% Pass Accuracy',
      progress: 78,
      streak: 5,
      color: COLORS.secondary,
      nextSession: 'Today 10:00 AM',
      program: 'Team Training'
    },
    {
      id: 4,
      name: 'Youth Soccer',
      avatar: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100',
      sport: 'Soccer',
      achievement: '25% Speed Increase',
      progress: 70,
      streak: 15,
      color: '#ff5722',
      nextSession: 'Today 6:00 PM',
      program: 'Youth Development'
    },
  ], []);

  // Enhanced weekly progress data
  const weeklyProgress = [
    { day: 'M', completed: true, sessions: 5, revenue: 420 },
    { day: 'T', completed: true, sessions: 4, revenue: 340 },
    { day: 'W', completed: true, sessions: 6, revenue: 510 },
    { day: 'T', completed: false, sessions: 3, revenue: 255 },
    { day: 'F', completed: false, sessions: 4, revenue: 320 },
    { day: 'S', completed: false, sessions: 2, revenue: 170 },
    { day: 'S', completed: false, sessions: 1, revenue: 85 },
  ];

  // Initialize effects
  useEffect(() => {
    // Enhanced animation sequence
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
    
    // Update time and time slot
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

  // Enhanced utility functions
  const updateTimeSlot = () => {
    const hour = new Date().getHours();
    if (hour < 6) setCurrentTimeSlot('Late Night');
    else if (hour < 12) setCurrentTimeSlot('Morning');
    else if (hour < 17) setCurrentTimeSlot('Afternoon');
    else if (hour < 21) setCurrentTimeSlot('Evening');
    else setCurrentTimeSlot('Night');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greetings = {
      morning: ['Good Morning', 'Rise & Train', 'Morning Coach'],
      afternoon: ['Good Afternoon', 'Keep Coaching', 'Afternoon Champion'],
      evening: ['Good Evening', 'Evening Mentor', 'Train Hard'],
      night: ['Good Evening', 'Night Coach', 'Rest & Plan']
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return COLORS.textSecondary;
    }
  };

  // Enhanced handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    // Simulate API call - in real app, dispatch actions to fetch latest data
    setTimeout(() => {
      setRefreshing(false);
      setSnackbarMessage('Dashboard refreshed successfully');
      setSnackbarVisible(true);
    }, 1500);
  }, []);

  const navigateToScreen = useCallback((screenName, stackName = null) => {
    try {
      if (stackName) {
        navigation.navigate(stackName, { screen: screenName });
      } else {
        navigation.navigate(screenName);
      }
    } catch (error) {
      showFeatureAlert(screenName);
    }
  }, [navigation]);

  const showFeatureAlert = useCallback((featureName) => {
    Alert.alert(
      'Feature Coming Soon',
      `${featureName} is currently under development. Stay tuned for updates!`,
      [{ text: 'Got it', style: 'default' }]
    );
  }, []);

  // Enhanced animated values
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

  // Enhanced component renders
  const StatCard = React.memo(({ stat }) => (
    <Animated.View style={styles.statCard}>
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
        <View style={styles.statGrowthContainer}>
          <Text style={styles.statGrowth}>{stat.growth}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  ));

  const QuickActionCard = React.memo(({ item }) => (
    <TouchableOpacity
      style={styles.enhancedQuickActionCard}
      onPress={() => navigateToScreen(item.screen, item.stack)}
    >
      <LinearGradient
        colors={[item.color, `${item.color}CC`]}
        style={styles.quickActionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <Icon name={item.icon} size={28} color="white" />
        <Text style={styles.quickActionLabel}>{item.title}</Text>
        <Text style={styles.quickActionSubLabel}>{item.subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  ));

  const EnhancedScheduleItem = React.memo(({ session }) => (
    <Card style={styles.enhancedScheduleCard}>
      <TouchableOpacity 
        style={styles.scheduleContent}
        onPress={() => navigateToScreen('SessionDetails', 'Business')}
      >
        <ImageBackground
          source={{ uri: session.clientAvatar }}
          style={styles.sessionImageBackground}
          imageStyle={styles.sessionImageStyle}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.sessionOverlay}>
            
            <View style={styles.sessionStatusRow}>
              <Chip 
                mode="flat"
                textStyle={styles.sessionTypeText}
                style={[styles.sessionTypeChip, { backgroundColor: getStatusColor(session.status) }]}>
                {session.sessionType}
              </Chip>
              <View style={styles.sessionFeeContainer}>
                <Text style={styles.sessionFee}>{session.fee}</Text>
              </View>
            </View>

            <View style={styles.sessionMainContent}>
              <Text style={styles.sessionClientName}>{session.client}</Text>
              <Text style={styles.sessionType}>{session.type}</Text>
              
              <View style={styles.sessionDetailsRow}>
                <View style={styles.sessionDetailItem}>
                  <Icon name="schedule" size={16} color="white" />
                  <Text style={styles.sessionDetailText}>{session.time}</Text>
                </View>
                <View style={styles.sessionDetailItem}>
                  <Icon name="location-on" size={16} color="white" />
                  <Text style={styles.sessionDetailText}>{session.location}</Text>
                </View>
                <View style={styles.sessionDetailItem}>
                  <Icon name="whatshot" size={16} color={getIntensityColor(session.intensity)} />
                  <Text style={[styles.sessionDetailText, { color: getIntensityColor(session.intensity) }]}>
                    {session.intensity}
                  </Text>
                </View>
              </View>

              {session.notes && (
                <Text style={styles.sessionNotes}>{session.notes}</Text>
              )}
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Card>
  ));

  const ClientHighlightCard = React.memo(({ client }) => (
    <TouchableOpacity 
      style={styles.enhancedClientCard}
      onPress={() => navigateToScreen('ClientProfiles', 'Clients')}
    >
      <ImageBackground
        source={{ uri: client.avatar }}
        style={styles.clientImageBackground}
        imageStyle={styles.clientImageStyle}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.clientOverlay}>
          
          <View style={styles.clientHeader}>
            <View style={styles.streakBadge}>
              <Icon name="local-fire-department" size={12} color="#ff5722" />
              <Text style={styles.streakText}>{client.streak}</Text>
            </View>
          </View>

          <View style={styles.clientContent}>
            <Text style={styles.clientName}>{client.name}</Text>
            <Chip style={styles.sportChip} textStyle={styles.sportChipText}>
              {client.sport}
            </Chip>
            <Text style={styles.clientProgram}>{client.program}</Text>
            
            <View style={styles.achievementContainer}>
              <Text style={styles.achievementText}>{client.achievement}</Text>
              <ProgressBar 
                progress={client.progress / 100} 
                color={client.color} 
                style={styles.clientProgressBar}
              />
              <Text style={styles.progressText}>{client.progress}% complete</Text>
            </View>

            <Text style={styles.nextSessionText}>Next: {client.nextSession}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  ));

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
              {['overview', 'training', 'business', 'analytics'].map((tab) => (
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
            {['overview', 'training', 'business', 'analytics'].map((tab) => (
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
              <Text style={styles.searchTitle}>Trainer Search</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setQuickSearchVisible(false)}
              />
            </View>
            <Searchbar
              placeholder="Search clients, workouts, programs, analytics..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
              autoFocus
            />
            <View style={styles.quickSearchOptions}>
              {[
                'My Clients', 'Create Workout', 'Session Schedule', 
                'Analytics', 'Revenue Report', 'Client Progress', 
                'AI Generator', 'Business Tools'
              ].map((option) => (
                <Chip
                  key={option}
                  mode="outlined"
                  onPress={() => {
                    setQuickSearchVisible(false);
                    // Navigate based on option
                    switch(option) {
                      case 'My Clients': navigation.navigate('ClientProfiles', 'Clients'); break;
                      case 'Create Workout': navigation.navigate('WorkoutBuilder', 'Workouts'); break;
                      case 'Session Schedule': navigation.navigate('SessionBookings', 'Business'); break;
                      case 'Analytics': navigation.navigate('FitnessAnalytics', 'Dashboard'); break;
                      case 'Revenue Report': navigation.navigate('RevenueTracking', 'Business'); break;
                      case 'Client Progress': navigation.navigate('ClientProgress', 'Clients'); break;
                      case 'AI Generator': navigation.navigate('AIWorkoutGenerator', 'AI'); break;
                      case 'Business Tools': navigation.navigate('BusinessTools', 'Business'); break;
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
      
      {/* Enhanced Trainer Header */}
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
              <Text style={styles.tagline}>Train • Coach • Inspire</Text>
            </View>
            
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => setQuickSearchVisible(true)}>
                <Icon name="search" size={24} color="white" style={styles.headerIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('NotificationCenter', 'Communication')}>
                <View style={styles.notificationContainer}>
                  <Icon name="notifications" size={24} color="white" style={styles.headerIcon} />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>5</Text>
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
              onPress={() => navigation.navigate('TrainerProfile', 'Profile')}
              style={styles.avatarContainer}
              activeOpacity={0.8}
            >
              <Avatar.Text 
                size={60} 
                label={user?.name?.charAt(0) || 'T'}
                style={styles.userAvatar}
              />
              <View style={styles.editIconOverlay}>
                <Icon name="edit" size={16} color="white" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()}, {user?.name || trainerData.name}!</Text>
              <Text style={styles.timeSlot}>{currentTimeSlot} • Ready to inspire your clients?</Text>
              <View style={styles.trainerBadges}>
                <Chip style={styles.ratingChip} textStyle={styles.ratingChipText}>
                  ⭐ {trainerData.rating} Rating
                </Chip>
                <Chip style={styles.experienceChip} textStyle={styles.experienceChipText}>
                  {trainerData.experience}
                </Chip>
              </View>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            </View>
          </View>
          
          {/* Revenue Highlight */}
          <View style={styles.revenueContainer}>
            <Icon name="trending-up" size={20} color="#4CAF50" />
            <Text style={styles.revenueText}>
              ${trainerData.monthlyRevenue.toLocaleString()} this month
            </Text>
            <Text style={styles.revenueGrowth}>+{trainerData.yearlyGrowth}% growth</Text>
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

        {/* Enhanced Trainer Stats Grid */}
        <Animated.View 
          style={[
            styles.statsSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
          
          <Text style={styles.sectionTitle}>Your Training Business</Text>
          <View style={styles.statsGrid}>
            {trainerStatsData.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </View>
        </Animated.View>

        {/* Today's Schedule Enhanced */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Training Schedule</Text>
            <View style={styles.scheduleHeaderRight}>
              <Chip 
                style={styles.scheduleCountChip} 
                textStyle={styles.scheduleCountText}
              >
                {todaysSchedule.length} sessions
              </Chip>
              <TouchableOpacity onPress={() => navigateToScreen('WorkoutCalendar', 'Dashboard')}>
                <Text style={styles.viewAllText}>View Calendar</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {todaysSchedule.length === 0 ? (
            <Card style={styles.emptyScheduleCard}>
              <Card.Content>
                <Text style={styles.noSessionsText}>No sessions scheduled for today</Text>
                <Text style={styles.motivationText}>Perfect time to plan tomorrow's sessions!</Text>
                <Button 
                  mode="contained"
                  buttonColor="#667eea"
                  style={styles.createButton}
                  onPress={() => navigation.navigate('SessionBookings', 'Business')}>
                  Schedule Session
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sessionsScroll}>
              {todaysSchedule.map((session) => (
                <EnhancedScheduleItem key={session.id} session={session} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Client Performance Highlights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Client Highlights</Text>
            <TouchableOpacity onPress={() => navigateToScreen('ClientProgress', 'Clients')}>
              <Text style={styles.viewAllText}>View All Progress</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.clientHighlightsContainer}>
            {clientHighlights.map((client) => (
              <ClientHighlightCard key={client.id} client={client} />
            ))}
          </ScrollView>
        </View>

        {/* Weekly Business Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Business Overview</Text>
          <Card style={styles.weeklyOverviewCard}>
            <Card.Content>
              <View style={styles.weeklyStats}>
                <View style={styles.weeklyStatItem}>
                  <Text style={styles.weeklyStatNumber}>22/25</Text>
                  <Text style={styles.weeklyStatLabel}>Sessions Completed</Text>
                </View>
                <View style={styles.weeklyStatItem}>
                  <Text style={styles.weeklyStatNumber}>$2,100</Text>
                  <Text style={styles.weeklyStatLabel}>Weekly Revenue</Text>
                </View>
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
                      <Text style={[styles.dayNumber, { color: day.completed ? '#fff' : '#9E9E9E' }]}>
                        {day.sessions}
                      </Text>
                    </View>
                    <Text style={styles.dayText}>{day.day}</Text>
                    <Text style={styles.dayRevenue}>${day.revenue}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Enhanced Quick Actions */}
        {renderQuickActions()}

        {/* AI Insights & Recommendations - Enhanced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Business Insights</Text>
          <Card style={styles.enhancedInsightsCard}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.insightsGradient}>
              <View style={styles.cardPadding}>
                <View style={styles.insightsHeader}>
                  <Icon name="psychology" size={24} color="#fff" />
                  <Text style={styles.insightsTitle}>Smart Business Analytics</Text>
                </View>
                <View style={styles.insightsList}>
                  <View style={styles.insightItem}>
                    <Icon name="trending-up" size={16} color="#fff" />
                    <Text style={styles.insightText}>
                      Your evening sessions have 35% higher completion rates
                    </Text>
                  </View>
                  <View style={styles.insightItem}>
                    <Icon name="people" size={16} color="#fff" />
                    <Text style={styles.insightText}>
                      Group sessions generate 40% more revenue per hour
                    </Text>
                  </View>
                  <View style={styles.insightItem}>
                    <Icon name="star" size={16} color="#fff" />
                    <Text style={styles.insightText}>
                      Clients with nutrition plans show 50% better results
                    </Text>
                  </View>
                </View>
                <Button 
                  mode="contained" 
                  buttonColor="rgba(255,255,255,0.2)"
                  textColor="#fff"
                  style={styles.insightsButton}
                  onPress={() => navigateToScreen('SmartRecommendations', 'AI')}>
                  View Detailed Analytics
                </Button>
              </View>
            </LinearGradient>
          </Card>
        </View>

        {/* Recent Activities - Enhanced */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigateToScreen('ActivityFeed', 'Communication')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <Card style={styles.enhancedActivityCard}>
            <View style={styles.cardPadding}>
              {recentActivities.map((activity, index) => (
                <TouchableOpacity 
                  key={activity.id} 
                  style={styles.enhancedActivityItem}
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
                    <Text style={styles.activitySubtext}>{activity.subtext}</Text>
                  </View>
                  <View style={styles.activityRight}>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                    <Icon name="chevron-right" size={16} color={COLORS.textSecondary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* Business Performance Summary - Enhanced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Performance</Text>
          <Card style={styles.enhancedBusinessCard}>
            <View style={styles.cardPadding}>
              <View style={styles.businessMetricsGrid}>
                <View style={styles.businessMetric}>
                  <View style={styles.businessMetricIcon}>
                    <Icon name="people" size={24} color="#667eea" />
                  </View>
                  <Text style={styles.businessNumber}>{dashboardStats.activeClients}</Text>
                  <Text style={styles.businessLabel}>Active Clients</Text>
                  <Text style={styles.businessChange}>+{dashboardStats.newClientsThisMonth} this month</Text>
                </View>
                
                <View style={styles.businessMetric}>
                  <View style={styles.businessMetricIcon}>
                    <Icon name="schedule" size={24} color="#4CAF50" />
                  </View>
                  <Text style={styles.businessNumber}>{dashboardStats.weeklyHours}</Text>
                  <Text style={styles.businessLabel}>Weekly Hours</Text>
                  <Text style={styles.businessChange}>+8% vs last week</Text>
                </View>
                
                <View style={styles.businessMetric}>
                  <View style={styles.businessMetricIcon}>
                    <Icon name="trending-up" size={24} color="#FF9800" />
                  </View>
                  <Text style={styles.businessNumber}>{dashboardStats.clientRetention}%</Text>
                  <Text style={styles.businessLabel}>Client Retention</Text>
                  <Text style={styles.businessChange}>Excellent rate</Text>
                </View>
                
                <View style={styles.businessMetric}>
                  <View style={styles.businessMetricIcon}>
                    <Icon name="star" size={24} color="#FFC107" />
                  </View>
                  <Text style={styles.businessNumber}>{dashboardStats.avgClientRating}</Text>
                  <Text style={styles.businessLabel}>Avg Rating</Text>
                  <Text style={styles.businessChange}>Above industry avg</Text>
                </View>
              </View>
              
              <View style={styles.businessActions}>
                <Button 
                  mode="outlined" 
                  style={[styles.businessButton, { marginRight: SPACING.small }]}
                  onPress={() => navigateToScreen('EarningsTracker', 'Business')}>
                  View Earnings
                </Button>
                <Button 
                  mode="contained" 
                  buttonColor={COLORS.primary}
                  style={styles.businessButton}
                  onPress={() => navigateToScreen('MarketplaceProfile', 'Business')}>
                  Boost Profile
                </Button>
              </View>
            </View>
          </Card>
        </View>

        {/* Enhanced Certifications & Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Profile</Text>
          <Card style={styles.certificationsCard}>
            <View style={styles.cardPadding}>
              <View style={styles.certificationsHeader}>
                <Text style={styles.certificationsTitle}>Certifications & Specializations</Text>
                <TouchableOpacity onPress={() => navigateToScreen('CertificationManager', 'Profile')}>
                  <Text style={styles.addCertText}>Add More</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.certificationsGrid}>
                {trainerData.certifications.map((cert, index) => (
                  <Chip 
                    key={index}
                    mode="flat"
                    style={styles.certificationChip}
                    textStyle={styles.certificationChipText}>
                    {cert}
                  </Chip>
                ))}
              </View>
              <View style={styles.specializationRow}>
                <Icon name="sports" size={20} color={COLORS.primary} />
                <Text style={styles.specializationText}>
                  Specialization: {trainerData.specialization}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Spacer for FAB */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Enhanced Floating Action Button */}
      <FAB.Group
        open={false}
        icon="add"
        actions={[
          {
            icon: 'fitness-center',
            label: 'New Workout',
            onPress: () => navigateToScreen('WorkoutBuilder', 'Workouts'),
          },
          {
            icon: 'person-add',
            label: 'Add Client',
            onPress: () => navigateToScreen('ClientInvitations', 'Clients'),
          },
          {
            icon: 'schedule',
            label: 'Book Session',
            onPress: () => navigateToScreen('SessionBookings', 'Business'),
          },
        ]}
        onStateChange={() => {}}
        fabStyle={styles.fab}
      />

      {/* Enhanced Quick Search Modal */}
      {renderQuickSearchModal()}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Enhanced Header Styles
  header: {
    paddingTop: StatusBar.currentHeight || 40,
  },
  headerGradient: {
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.medium,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
  },
  appBranding: {
    alignItems: 'flex-start',
  },
  appName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tagline: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: SPACING.medium,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF5722',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.medium,
  },
  userAvatar: {
    elevation: 3,
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
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeSlot: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: SPACING.small,
  },
  trainerBadges: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: SPACING.small,
  },
  ratingChipText: {
    color: '#fff',
    fontSize: 11,
  },
  experienceChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  experienceChipText: {
    color: '#fff',
    fontSize: 11,
  },
  timeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  revenueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  revenueText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.small,
  },
  revenueGrowth: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginLeft: SPACING.small,
  },
  
  // Enhanced Scroll View
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.medium,
  },
  
  // Enhanced Stats Section
  statsSection: {
    marginTop: SPACING.medium,
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    ...TEXT_STYLES.heading,
    marginBottom: SPACING.medium,
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: SPACING.medium,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  statGradient: {
    padding: SPACING.medium,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTrend: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '500',
  },
  statValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: SPACING.xs,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  statSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  statGrowthContainer: {
    alignSelf: 'flex-start',
  },
  statGrowth: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.small,
    paddingVertical: 2,
    borderRadius: 8,
  },

  // Enhanced Section Styles
  section: {
    marginBottom: SPACING.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  viewAllText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  // Enhanced Schedule Styles
  scheduleHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleCountChip: {
    marginRight: SPACING.small,
    backgroundColor: `${COLORS.primary}15`,
  },
  scheduleCountText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyScheduleCard: {
    elevation: 2,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  noSessionsText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  motivationText: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.medium,
  },
  createButton: {
    marginTop: SPACING.small,
  },
  sessionsScroll: {
    paddingRight: SPACING.medium,
  },
  
  // Enhanced Schedule Card Styles
  enhancedScheduleCard: {
    marginRight: SPACING.medium,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    width: CARD_WIDTH,
  },
  sessionImageBackground: {
    height: 200,
    width: '100%',
  },
  sessionImageStyle: {
    borderRadius: 16,
  },
  sessionOverlay: {
    flex: 1,
    padding: SPACING.medium,
    justifyContent: 'space-between',
  },
  sessionStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionTypeChip: {
    alignSelf: 'flex-start',
  },
  sessionTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  sessionFeeContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionFee: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sessionMainContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sessionClientName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sessionType: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.small,
  },
  sessionDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.small,
  },
  sessionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.medium,
    marginBottom: 4,
  },
  sessionDetailText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  sessionNotes: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontStyle: 'italic',
  },

  // Enhanced Client Highlights
  clientHighlightsContainer: {
    paddingRight: SPACING.medium,
  },
  enhancedClientCard: {
    marginRight: SPACING.medium,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    width: 160,
    height: 220,
  },
  clientImageBackground: {
    flex: 1,
  },
  clientImageStyle: {
    borderRadius: 16,
  },
  clientOverlay: {
    flex: 1,
    padding: SPACING.medium,
    justifyContent: 'space-between',
  },
  clientHeader: {
    alignItems: 'flex-end',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ff5722',
    marginLeft: 2,
  },
  clientContent: {
    alignItems: 'flex-start',
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sportChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: SPACING.small,
  },
  sportChipText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  clientProgram: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginBottom: SPACING.small,
  },
  achievementContainer: {
    width: '100%',
    marginBottom: SPACING.small,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  clientProgressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  nextSessionText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },

  // Weekly Overview Styles
  weeklyOverviewCard: {
    elevation: 3,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.medium,
  },
  weeklyStatItem: {
    alignItems: 'center',
  },
  weeklyStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  weeklyStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  weeklyProgressDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dayText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  dayRevenue: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '600',
  },

  // Enhanced Quick Actions
  quickActionsCard: {
    elevation: 3,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.medium,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.small,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: '#fff',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: SPACING.small,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: SPACING.medium,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  quickActionLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  quickActionSubLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },

  // Enhanced Insights Card
  enhancedInsightsCard: {
    overflow: 'hidden',
    elevation: 4,
    borderRadius: 16,
  },
  insightsGradient: {
    borderRadius: 16,
  },
  cardPadding: {
    padding: SPACING.medium,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  insightsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: SPACING.small,
  },
  insightsList: {
    marginBottom: SPACING.medium,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.small,
  },
  insightText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
    marginLeft: SPACING.small,
    flex: 1,
  },
  insightsButton: {
    alignSelf: 'flex-start',
  },

  // Enhanced Activity Card
  enhancedActivityCard: {
    elevation: 3,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  enhancedActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.medium,
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
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  activitySubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },

  // Enhanced Business Card
  enhancedBusinessCard: {
    elevation: 3,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  businessMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.large,
  },
  businessMetric: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: SPACING.medium,
    marginBottom: SPACING.small,
  },
  businessMetricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.small,
    elevation: 2,
  },
  businessNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  businessLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  businessChange: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  businessActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  businessButton: {
    flex: 1,
  },

  // Enhanced Certifications Card
  certificationsCard: {
    elevation: 3,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  certificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  certificationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addCertText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  certificationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.medium,
  },
  certificationChip: {
    backgroundColor: `${COLORS.primary}15`,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  certificationChipText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  specializationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: SPACING.small,
    borderRadius: 8,
  },
  specializationText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.small,
    fontWeight: '500',
  },

  // Enhanced Search Modal
  searchModal: {
    justifyContent: 'flex-start',
    paddingTop: StatusBar.currentHeight || 40,
    paddingHorizontal: SPACING.medium,
  },
  searchBlur: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  searchContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.medium,
    margin: SPACING.medium,
    maxHeight: height * 0.8,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 12,
    marginBottom: SPACING.medium,
  },
  quickSearchOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  searchChip: {
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
    backgroundColor: `${COLORS.primary}10`,
  },

  // FAB and Snackbar
  fab: {
    backgroundColor: COLORS.primary,
  },
  snackbar: {
    backgroundColor: COLORS.primary,
  },

  // Enhanced Quick Action Cards
  enhancedQuickActionCard: {
    width: '48%',
    marginBottom: SPACING.medium,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
};

export default TrainerDashboard;
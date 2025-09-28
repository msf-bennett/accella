import React, { useState, useEffect, useRef, useCallback } from 'react';
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
//import { MaterialIcons as Icon } from '@expo/vector-icons';
import { BlurView } from '../../components/shared/BlurView';
import DocumentProcessor from '../../services/DocumentProcessor';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const CoachDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [quickSearchVisible, setQuickSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTimeSlot, setCurrentTimeSlot] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState(null);
  const [trainingPlansCount, setTrainingPlansCount] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const { user } = useSelector(state => state.auth);
  const { trainingPlans, sessions } = useSelector(state => state.training);
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
    ]).start();

    // Update time slot
    updateTimeSlot();
    const interval = setInterval(updateTimeSlot, 60000);
    return () => clearInterval(interval);
  }, []);

  //coaching plan(s) counter
      const loadTrainingPlansCount = useCallback(async () => {
      try {
        const plans = await DocumentProcessor.getTrainingPlans();
        setTrainingPlansCount(plans.length);
      } catch (error) {
        console.error('Error loading training plans count:', error);
        setTrainingPlansCount(0);
      }
    }, []);

    useFocusEffect(
      useCallback(() => {
        loadTrainingPlansCount();
      }, [loadTrainingPlansCount])
    );

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
  
  try {
    await loadTrainingPlansCount(); // Add this line
    // Add any other refresh logic here
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    setTimeout(() => setRefreshing(false), 1500);
  }
};

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greetings = {
      morning: ['Rise & Lead', 'Good Morning', 'Morning Coach'],
      afternoon: ['Keep Inspiring', 'Good Afternoon', 'Lead Strong'],
      evening: ['Evening Leader', 'Good Evening', 'Wind Down'],
      night: ['Late Night Mentor', 'Good Night', 'Rest Well']
    };
    
    let timeKey = 'morning';
    if (hour >= 12 && hour < 17) timeKey = 'afternoon';
    else if (hour >= 17 && hour < 21) timeKey = 'evening';
    else if (hour >= 21 || hour < 6) timeKey = 'night';
    
    const options = greetings[timeKey];
    return options[Math.floor(Math.random() * options.length)];
  };

  // Enhanced stats data with more comprehensive metrics
  const liveStats = [
    { 
      icon: 'group', 
      label: 'Players', 
      value: '24', 
      subtitle: 'active athletes',
      color: '#FF6B6B',
      trend: '+3 this week',
      onPress: () => navigation.navigate('Players')
    },
    { 
      icon: 'assignment', 
      label: 'Plans', 
      value: `${trainingPlansCount}`, 
      subtitle: 'training programs',
      color: '#4ECDC4',
      trend: '2 new plans',
      onPress: () => navigation.navigate('TrainingPlanLibrary')
    },
    { 
      icon: 'fitness-center', 
      label: 'Sessions', 
      value: `${sessions?.length || 32}`, 
      subtitle: 'this month',
      color: '#45B7D1',
      trend: '12 completed',
     onPress: () => navigation.navigate('UpcomingSessions')
    },
    { 
      icon: 'payments', 
      label: 'Revenue', 
      value: '$2,840', 
      subtitle: 'monthly earnings',
      color: '#F39C12',
      trend: '+15% growth',
     onPress: () => navigation.navigate('ClientManagement')
    },
  ];

  // Today's schedule for coach
  const todaySchedule = [
    {
      id: 1,
      title: 'Team A - Strength Training',
      time: '09:00 AM',
      duration: 60,
      status: 'completed',
      type: 'Team Session',
      players: 12,
      location: 'Gym A',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100',
      completionRate: 100,
      revenue: '$120'
    },
    {
      id: 2,
      title: '1-on-1 with Sarah Connor',
      time: '02:00 PM',
      duration: 45,
      status: 'completed',
      type: 'Personal Training',
      players: 1,
      location: 'Studio B',
      image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=100',
      completionRate: 95,
      revenue: '$80'
    },
    {
      id: 3,
      title: 'Youth Team - Agility',
      time: '05:30 PM',
      duration: 90,
      status: 'upcoming',
      type: 'Youth Training',
      players: 8,
      location: 'Field C',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100',
      completionRate: 0,
      revenue: '$160'
    }
  ];

  // Enhanced quick actions covering all navigator features
  const quickActionsData = [
    {
      category: 'Training Management',
      actions: [
        { 
          icon: 'add-circle', 
          label: 'Create Plan', 
          action: () => navigation.navigate('CreateTrainingPlan'),
          color: '#667eea'
        },
        { 
          icon: 'upload', 
          label: 'Upload Plan', 
          action: () => navigation.navigate('CoachingPlanUploadScreen'),
          color: '#4ECDC4'
        },
        { 
          icon: 'build', 
          label: 'Session Builder', 
          action: () => navigation.navigate('SessionBuilder'),
          color: '#45B7D1'
        },
        { 
          icon: 'library-books', 
          label: 'Drill Library', 
          action: () => navigation.navigate('DrillLibrary'),
          color: '#F39C12'
        },
      ]
    },
    {
      category: 'Player Management',
      actions: [
        { 
          icon: 'group', 
          label: 'My Players', 
          action: () => navigation.navigate('PlayerList'),
          color: '#FF6B6B'
        },
        { 
          icon: 'person-add', 
          label: 'Invite Players', 
          action: () => navigation.navigate('PlayerInvitations'),
          color: '#9B59B6'
        },
        { 
          icon: 'assessment', 
          label: 'Player Stats', 
          action: () => navigation.navigate('PlayerStats'),
          color: '#2ECC71'
        },
        { 
          icon: 'healing', 
          label: 'Injury Tracking', 
          action: () => navigation.navigate('InjuryTracking'),
          color: '#E74C3C'
        },
      ]
    },
    {
      category: 'Business Tools',
      actions: [
        { 
          icon: 'payment', 
          label: 'Payments', 
          action: () => navigation.navigate('PaymentManagement'),
          color: '#27AE60'
        },
        { 
          icon: 'trending-up', 
          label: 'Analytics', 
          action: () => navigation.navigate('BusinessAnalytics'),
          color: '#3498DB'
        },
        { 
          icon: 'store', 
          label: 'My Services', 
          action: () => navigation.navigate('ServicesListing'),
          color: '#8E44AD'
        },
        { 
          icon: 'calendar-today', 
          label: 'Bookings', 
          action: () => navigation.navigate('SessionBookings'),
          color: '#E67E22'
        },
      ]
    },
    {
      category: 'Discovery & Network',
      actions: [
        { 
          icon: 'search', 
          label: 'Find Coaches', 
          action: () => navigation.navigate('CoachNetwork'),
          color: '#1ABC9C'
        },
        { 
          icon: 'school', 
          label: 'Academies', 
          action: () => navigation.navigate('SearchAcademies'),
          color: '#34495E'
        },
        { 
          icon: 'event', 
          label: 'Events', 
          action: () => navigation.navigate('ProfessionalEvents'),
          color: '#E91E63'
        },
        { 
          icon: 'work', 
          label: 'Job Board', 
          action: () => navigation.navigate('JobOpportunities'),
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
      subtitle: 'Professional Level Training',
      progress: 0.75,
      week: 'Week 9 of 12',
      nextSession: 'Tomorrow • 8:00 AM',
      players: 16,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
      category: 'Football',
      difficulty: 'Advanced',
      backgroundColor: '#667eea',
      revenue: '$1,280',
      completion: '87%',
      feedback: 'Excellent'
    },
    {
      id: 2,
      title: 'Youth Athletic Foundation',
      subtitle: 'Building Future Champions',
      progress: 0.45,
      week: 'Week 5 of 10',
      nextSession: 'Thursday • 4:00 PM',
      players: 12,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
      category: 'Youth',
      difficulty: 'Intermediate',
      backgroundColor: '#f093fb',
      revenue: '$960',
      completion: '92%',
      feedback: 'Great Progress'
    }
  ];

  // Recent activities with more comprehensive tracking
  const recentActivities = [
    { 
      id: 1, 
      text: 'New player enrolled in Elite Program', 
      time: '30 min ago',
      type: 'enrollment',
      icon: 'person-add',
      color: '#4CAF50',
      action: () => navigation.navigate('PlayerList')
    },
    { 
      id: 2, 
      text: 'Payment received from Team A session', 
      time: '1 hour ago',
      type: 'payment',
      icon: 'payment',
      color: '#2196F3',
      action: () => navigation.navigate('PaymentManagement')
    },
    { 
      id: 3, 
      text: 'Session feedback from Youth Team', 
      time: '2 hours ago',
      type: 'feedback',
      icon: 'feedback',
      color: '#FF9800',
      action: () => navigation.navigate('SessionFeedback')
    },
    { 
      id: 4, 
      text: 'New collaboration request', 
      time: '4 hours ago',
      type: 'collaboration',
      icon: 'handshake',
      color: '#9C27B0',
      action: () => navigation.navigate('CollaborationHub')
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
    action: () => navigation.navigate('PerformanceAnalytics'),
    category: 'Analytics'
  },
  { 
    icon: 'smart-toy', 
    label: 'AI Assistant', 
    action: () => navigation.navigate('AIWorkoutGenerator'),
    category: 'AI Tools'
  },
  // ADD THIS NEW OPTION HERE:
  { 
    icon: 'settings', 
    label: 'AI Settings', 
    action: () => navigation.navigate('AISettings'),
    category: 'AI Tools'
  },
  // Continue with existing options...
  { 
    icon: 'video-library', 
    label: 'Video Library', 
    action: () => navigation.navigate('VideoLibrary'),
    category: 'Content'
  },
  { 
    icon: 'restaurant', 
    label: 'Nutrition Plans', 
    action: () => navigation.navigate('NutritionPlanning'),
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
        return COLORS.textSecondary || '#666';
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

  // Add this helper function to your CoachDashboard component:
const getCoachInitials = () => {
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  
  // If we have both initials, use them
  if (firstInitial && lastInitial) {
    return firstInitial + lastInitial;
  }
  
  // If we only have first name, use first two characters or duplicate
  if (firstInitial && !lastInitial) {
    const secondChar = firstName.charAt(1).toUpperCase();
    return firstInitial + (secondChar || firstInitial);
  }
  
  // If we only have last name, use it
  if (!firstInitial && lastInitial) {
    const secondChar = lastName.charAt(1).toUpperCase();
    return lastInitial + (secondChar || lastInitial);
  }
  
  // Fallback if no names available
  return 'CR'; // Coach Rodriguez or Coach as default
};

  const renderQuickActions = () => {
    const currentActions = quickActionsData.find(cat => 
      cat.category.toLowerCase().includes(activeTab) || activeTab === 'overview'
    );
    
    if (activeTab === 'overview') {
      // Show mix of actions from different categories
      const mixedActions = quickActionsData.flatMap(cat => 
          cat.actions.slice(0, 2)
        ).slice(0, 8); // This ensures exactly 8 actions
      
      return (
        <Card style={styles.quickActionsCard}>
          <Card.Title title="Quick Actions" />
          <Card.Content>
            <View style={styles.tabContainer}>
              {['overview', 'training', 'business', 'discovery'].map((tab) => (
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
                  style={[styles.quickActionCardGrid, { backgroundColor: action.color }]}
                  onPress={action.action}>
                  <View style={styles.quickActionContent}>
                    <Icon name={action.icon} size={18} color="white" />
                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                  </View>
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
            {['overview', 'training', 'business', 'discovery'].map((tab) => (
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
                style={[styles.quickActionCardGrid, { backgroundColor: action.color }]}
                onPress={action.action}>
                <View style={styles.quickActionContent}>
                  <Icon name={action.icon} size={18} color="white" />
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </View>
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
        <View style={styles.searchContainer}>
          <View style={styles.searchHeader}>
            <Text style={styles.searchTitle}>Coach Search</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setQuickSearchVisible(false)}
            />
          </View>
          <Searchbar
            placeholder="Search players, programs, sessions, analytics..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            autoFocus
          />
          <View style={styles.quickSearchOptions}>
            {[
              'My Players', 'Training Plans', 'Session Templates', 
              'Analytics', 'Payment History', 'Coach Network', 
              'Business Tools', 'Video Library'
            ].map((option) => (
              <Chip
                key={option}
                mode="outlined"
                onPress={() => {
                  setQuickSearchVisible(false);
                  // Navigate based on option
                  switch(option) {
                    case 'My Players': navigation.navigate('PlayerList'); break;
                    case 'Training Plans': navigation.navigate('TrainingPlanLibrary'); break;
                    case 'Analytics': navigation.navigate('PerformanceAnalytics'); break;
                    case 'Payment History': navigation.navigate('PaymentManagement'); break;
                    case 'Coach Network': navigation.navigate('CoachNetwork'); break;
                    case 'Video Library': navigation.navigate('VideoLibrary'); break;
                    default: break;
                  }
                }}
                style={styles.searchChip}>
                {option}
              </Chip>
            ))}
          </View>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Enhanced Coach Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }]
          }
        ]}>
        <View style={styles.headerGradient}>
          
          <View style={styles.headerTop}>
            <View style={styles.appBranding}>
              <Text style={styles.appName}>acceilla</Text>
              <Text style={styles.tagline}>Coach • Create • Inspire</Text>
            </View>
            
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => setQuickSearchVisible(true)}>
                <Icon name="search" size={24} color="white" style={styles.headerIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('NotificationsCenter')}>
                <View style={styles.notificationContainer}>
                  <Icon name="notifications" size={24} color="white" style={styles.headerIcon} />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>3</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <Icon name="more-vert" size={24} color="white" style={styles.headerIcon} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerContent}>
            <TouchableOpacity 
                onPress={() => navigation.navigate('Profile')}
                style={styles.profileImageContainer}
              >
                {user?.profileImage || user?.avatar ? (
                  <Avatar.Image 
                    size={60} 
                    source={{ uri: user.profileImage || user.avatar }}
                    style={styles.userAvatar}
                  />
                ) : (
                  <Avatar.Text 
                    size={60} 
                    label={getCoachInitials()}
                    style={styles.userAvatar}
                  />
                )}
                <View style={styles.cameraIcon}>
                  <Icon name="camera-alt" size={14} color="white" />
                </View>
              </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>Coach {user?.firstName || 'Rodriguez'}! 🏆</Text>
              <Text style={styles.timeSlot}>{currentTimeSlot} • Ready to inspire?</Text>
            </View>
          </View>
        </View>
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

        {/* Enhanced Live Stats Grid */}
        <Animated.View 
          style={[
            styles.statsSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
          <Text style={styles.sectionTitle}>Coach Dashboard</Text>
          <View style={styles.statsGrid}>
            {liveStats.map((stat, index) => (
              <TouchableOpacity 
              key={index} 
                style={[styles.statCard, { backgroundColor: stat.color }]}
                onPress={stat.onPress} // Add this line
                activeOpacity={stat.onPress ? 0.7 : 1} // Add this line
              >
              <View style={styles.statContent}>
                  <View style={styles.statHeader}>
                    <Icon name={stat.icon} size={28} color="white" />
                    <Text style={styles.statTrend}>{stat.trend}</Text>
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWithArrow}>
              <Text style={styles.sectionTitleWithArrowHeader}>Today's Schedule</Text>
              <Icon name="keyboard-arrow-right" size={24} color="#667eea" style={styles.scrollIndicator} />
            </View>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('SessionScheduler')}
              textColor="#667eea">
              View All
            </Button>
          </View>
          
          {todaySchedule.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.noSessionsText}>No sessions scheduled for today</Text>
                <Text style={styles.motivationText}>Perfect time to plan your next training! 📋</Text>
                <Button 
                  mode="contained"
                  buttonColor="#667eea"
                  style={styles.createButton}
                  onPress={() => navigation.navigate('SessionScheduler')}>
                  Schedule Session
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sessionsScroll}>
              {todaySchedule.map((session) => (
                <Card key={session.id} style={styles.sessionCard}>
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
                          textStyle={styles.statusText}
                          style={[styles.statusChip, { backgroundColor: getStatusColor(session.status) }]}>
                          {session.status === 'completed' ? '✓' : session.status === 'upcoming' ? '○' : '▶'}
                        </Chip>
                      </View>

                      <View style={styles.sessionContent}>
                        <Text style={styles.sessionTitle}>{session.title}</Text>
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
                            <Icon name="group" size={16} color="white" />
                            <Text style={styles.sessionDetailText}>{session.players}</Text>
                          </View>
                        </View>

                        {session.revenue && (
                          <Text style={styles.sessionRevenue}>💰 {session.revenue}</Text>
                        )}

                        {session.status === 'completed' && (
                          <View style={styles.completionContainer}>
                            <Text style={styles.completionText}>Attendance: {session.completionRate}%</Text>
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
                          onPress={() => navigation.navigate('LiveSessionTracking', { sessionId: session.id })}>
                          {session.status === 'upcoming' ? 'Start Session' : 'View Details'}
                        </Button>
                      </View>
                    </View>
                  </ImageBackground>
                </Card>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Active Training Programs with enhanced details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWithArrow}>
            <Text style={styles.sectionTitleWithArrowHeader}>Active Programs</Text>
            <Icon name="keyboard-arrow-right" size={24} color="#667eea" style={styles.scrollIndicator} />
          </View>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('TrainingPlanLibrary')}
            textColor="#667eea">
            Manage All
          </Button>
        </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.programsScroll}>
            {activePrograms.map((program) => (
              <Card key={program.id} style={styles.programCard}>
                <View style={[styles.programGradient, { backgroundColor: program.backgroundColor }]}>
                  
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
                  
                  <View style={styles.programMeta}>
                    <View style={styles.programStats}>
                      <Text style={styles.programStat}>⭐ {program.rating}</Text>
                      <Text style={styles.programStat}>👥 {program.players}</Text>
                      <Text style={styles.programStat}>💰 {program.revenue}</Text>
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <Text style={styles.progressLabel}>
                      {Math.round(program.progress * 100)}% Complete • {program.completion} Attendance
                    </Text>
                    <ProgressBar 
                      progress={program.progress} 
                      color="rgba(255,255,255,0.9)"
                      style={styles.programProgress}
                    />
                  </View>

                  <Text style={styles.nextSession}>{program.nextSession}</Text>
                  <Text style={styles.programFeedback}>Feedback: {program.feedback}</Text>
                  
                  <Button
                    mode="contained"
                    buttonColor="rgba(255,255,255,0.2)"
                    textColor="white"
                    style={styles.programButton}
                    onPress={() => navigation.navigate('ProgressTracking', { programId: program.id })}>
                    View Analytics
                  </Button>
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Create/Upload Training Plans Section */}
        <Card style={styles.trainingPlansCard}>
          <Card.Title 
            title="Training Plan Management"
            subtitle="Create, upload, and manage your training programs"
          />
          <Card.Content>
            <View style={styles.planManagementGrid}>
              <TouchableOpacity 
                style={styles.planActionCard}
                onPress={() => navigation.navigate('CreateTrainingPlan')}>
                <View style={[styles.planActionGradient, { backgroundColor: '#667eea' }]}>
                  <Icon name="add-circle" size={40} color="white" />
                  <Text style={styles.planActionTitle}>Create New Plan</Text>
                  <Text style={styles.planActionSubtitle}>Build custom training programs</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.planActionCard}
                onPress={() => navigation.navigate('CoachingPlanUploadScreen')}>
                <View style={[styles.planActionGradient, { backgroundColor: '#4ECDC4' }]}>
                  <Icon name="cloud-upload" size={40} color="white" />
                  <Text style={styles.planActionTitle}>Upload Plan</Text>
                  <Text style={styles.planActionSubtitle}>Import existing programs</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.planStatsRow}>
              <View style={styles.planStat}>
                <Text style={styles.planStatNumber}>24</Text>
                <Text style={styles.planStatLabel}>Total Plans</Text>
              </View>
              <View style={styles.planStat}>
                <Text style={styles.planStatNumber}>12</Text>
                <Text style={styles.planStatLabel}>Active</Text>
              </View>
              <View style={styles.planStat}>
                <Text style={styles.planStatNumber}>8</Text>
                <Text style={styles.planStatLabel}>Templates</Text>
              </View>
              <View style={styles.planStat}>
                <Text style={styles.planStatNumber}>156</Text>
                <Text style={styles.planStatLabel}>Sessions</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activities with enhanced functionality */}
        <Card style={styles.activitiesCard}>
          <Card.Title 
            title="Recent Activity" 
            subtitle="Stay updated with your coaching activities"
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
                <Icon name="chevron-right" size={20} color={COLORS.textSecondary || '#666'} />
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

        {/* Enhanced Quick Actions with Categories */}
        {renderQuickActions()}

        {/* Business Insights Card */}
        <Card style={styles.businessCard}>
          <Card.Title 
            title="Business Insights"
            subtitle="Track your coaching business performance"
          />
          <Card.Content>
            <View style={styles.businessMetrics}>
              <View style={styles.businessMetric}>
                <Icon name="trending-up" size={24} color="#27AE60" />
                <View>
                  <Text style={styles.businessMetricValue}>$2,840</Text>
                  <Text style={styles.businessMetricLabel}>Monthly Revenue</Text>
                </View>
              </View>
              <View style={styles.businessMetric}>
                <Icon name="people" size={24} color="#3498DB" />
                <View>
                  <Text style={styles.businessMetricValue}>24</Text>
                  <Text style={styles.businessMetricLabel}>Active Clients</Text>
                </View>
              </View>
            </View>
            <View style={styles.businessActions}>
              <Button 
                mode="outlined" 
                style={styles.businessButton}
                onPress={() => navigation.navigate('PaymentManagement')}>
                View Payments
              </Button>
              <Button 
                mode="contained"
                buttonColor="#667eea"
                style={styles.businessButton}
                onPress={() => navigation.navigate('BusinessAnalytics')}>
                Full Analytics
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* AI Tools Showcase */}
        <Card style={styles.aiToolsCard}>
          <Card.Title 
            title="AI Coaching Assistant"
            subtitle="Enhance your coaching with intelligent tools"
          />
          <Card.Content>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity 
                style={styles.aiToolCard}
                onPress={() => navigation.navigate('AIWorkoutGenerator')}>
                <View style={[styles.aiToolGradient, { backgroundColor: '#FF6B6B' }]}>
                  <Icon name="auto-awesome" size={32} color="white" />
                  <Text style={styles.aiToolTitle}>AI Workout Generator</Text>
                  <Text style={styles.aiToolSubtitle}>Generate personalized workouts</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.aiToolCard}
                onPress={() => navigation.navigate('PersonalizedPlans')}>
                <View style={[styles.aiToolGradient, { backgroundColor: '#4ECDC4' }]}>
                  <Icon name="psychology" size={32} color="white" />
                  <Text style={styles.aiToolTitle}>Smart Plans</Text>
                  <Text style={styles.aiToolSubtitle}>AI-powered training plans</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.aiToolCard}
                onPress={() => navigation.navigate('SmartRecommendations')}>
                <View style={[styles.aiToolGradient, { backgroundColor: '#45B7D1' }]}>
                  <Icon name="lightbulb" size={32} color="white" />
                  <Text style={styles.aiToolTitle}>Smart Tips</Text>
                  <Text style={styles.aiToolSubtitle}>Intelligent recommendations</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Spacer for FAB */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Enhanced Floating Action Button with menu */}
      <FAB
        icon="plus"
        color="white"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTrainingPlan')}
      />

      {/* Enhanced Menu Modal */}
      <Portal>
        <Modal
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          contentContainerStyle={styles.menuModal}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Coach Tools</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setMenuVisible(false)}
              />
            </View>
            <ScrollView style={styles.menuScrollView}>
              {Object.entries(
                menuOptions.reduce((acc, option) => {
                  if (!acc[option.category]) acc[option.category] = [];
                  acc[option.category].push(option);
                  return acc;
                }, {})
              ).map(([category, options]) => (
                <View key={category}>
                  <Text style={styles.menuCategoryTitle}>{category}</Text>
                  {options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuOption}
                      onPress={() => {
                        setMenuVisible(false);
                        option.action();
                      }}>
                      <Icon name={option.icon} size={24} color={COLORS.primary || '#667eea'} />
                      <Text style={styles.menuOptionText}>{option.label}</Text>
                      <Icon name="chevron-right" size={20} color={COLORS.textSecondary || '#666'} />
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </Portal>

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
    paddingHorizontal: SPACING.lg || 20,
    paddingBottom: SPACING.md || 16,
    backgroundColor: '#667eea',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg || 20,
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
    marginLeft: SPACING.md || 16,
    padding: SPACING.sm || 8,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
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
  },
  userAvatar: {
    marginRight: SPACING.md || 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  timeSlot: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
    paddingTop: 180,
  },
  section: {
    marginBottom: SPACING.xl || 32,
  },
  sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: SPACING.lg || 20,
  marginBottom: SPACING.md || 16,
},
sectionTitleWithArrow: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1, 
},
sectionTitleWithArrowHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
},
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingHorizontal: SPACING.lg || 20,
    marginBottom: SPACING.md || 16,
  },
  statsSection: {
    marginBottom: SPACING.xl || 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm || 8,
  },
  statCard: {
    width: (width - (SPACING.lg || 20) * 3) / 2,
    height: 140,
    marginHorizontal: SPACING.sm || 8,
    marginBottom: SPACING.md || 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statContent: {
    flex: 1,
    padding: SPACING.md || 16,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.sm || 8,
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
  emptyCard: {
    margin: SPACING.md || 16,
    padding: SPACING.lg || 20,
    alignItems: 'center',
    borderRadius: 16,
  },
  noSessionsText: {
    textAlign: 'center',
    color: '#666',
    fontWeight: '600',
    marginBottom: SPACING.sm || 8,
    fontSize: 16,
  },
  motivationText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginBottom: SPACING.md || 16,
    fontSize: 14,
  },
  createButton: {
    borderRadius: 12,
  },
  sessionsScroll: {
    paddingHorizontal: SPACING.lg || 20,
  },
  sessionCard: {
    width: CARD_WIDTH,
    height: 300,
    marginRight: SPACING.md || 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  sessionImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  sessionImageStyle: {
    borderRadius: 20,
  },
  sessionOverlay: {
    flex: 1,
    padding: SPACING.md || 16,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  typeChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  typeText: {
    color: 'white',
    fontSize: 12,
  },
  statusChip: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
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
    marginBottom: SPACING.xs || 4,
  },
  sessionLocation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.md || 16,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md || 16,
  },
  sessionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDetailText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
  },
  sessionRevenue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: SPACING.sm || 8,
  },
  completionContainer: {
    marginBottom: SPACING.md || 16,
  },
  completionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
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
  programsScroll: {
    paddingHorizontal: SPACING.lg || 20,
  },
  programCard: {
    width: CARD_WIDTH * 0.85,
    height: 360,
    marginRight: SPACING.md || 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  programGradient: {
    flex: 1,
    padding: SPACING.lg || 20,
    justifyContent: 'space-between',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md || 16,
  },
  categoryChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  programTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.xs || 4,
  },
  programSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.sm || 8,
  },
  programWeek: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.md || 16,
  },
  programMeta: {
    marginBottom: SPACING.md || 16,
  },
  programStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  programStat: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginRight: SPACING.md || 16,
    marginBottom: 4,
  },
  progressSection: {
    marginBottom: SPACING.md || 16,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '600',
  },
  programProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  nextSession: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.sm || 8,
  },
  programFeedback: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.md || 16,
  },
  programButton: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  trainingPlansCard: {
    margin: SPACING.lg || 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },





  planManagementGrid: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: SPACING.lg || 20,
  marginHorizontal: SPACING.lg || 20,
  gap: 12,
},
  planActionCard: {
  flex: 1, 
  maxWidth: '48%', 
  height: 140,
  borderRadius: 16,
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},
  planActionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: SPACING.md || 16,
  },
  planActionTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.sm || 8,
    textAlign: 'center',
  },
  planActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  planStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md || 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  planStat: {
    alignItems: 'center',
  },
  planStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  planStatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  activitiesCard: {
    margin: SPACING.lg || 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md || 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md || 16,
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
    color: '#7f8c8d',
  },
  viewAllButton: {
    marginTop: SPACING.md || 16,
    borderRadius: 12,
  },
  quickActionsCard: {
    margin: SPACING.lg || 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg || 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm || 8,
    paddingHorizontal: SPACING.md || 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  quickActionsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginHorizontal: SPACING.lg || 20,
  paddingVertical: 8,
},
quickActionCardGrid: {
  width: '48%', // Fixed width instead of flex
  height: 70,
  marginBottom: SPACING.md || 16,
  borderRadius: 12,
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},
  quickActionCard: {
  width: (width - (SPACING.lg || 20) * 3) / 2,
  height: 80,
  marginBottom: SPACING.sm || 8,
  borderRadius: 12,
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},
  quickActionContent: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
  paddingVertical: SPACING.xs || 4,
  paddingHorizontal: SPACING.xs || 4,
},
  quickActionLabel: {
  fontSize: 10,
  color: 'white',
  fontWeight: '600',
  marginTop: 4,
  textAlign: 'center',
  lineHeight: 12,
},
  businessCard: {
    margin: SPACING.lg || 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  businessMetrics: {
    marginBottom: SPACING.lg || 20,
  },
  businessMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md || 16,
  },
  businessMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: SPACING.md || 16,
  },
  businessMetricLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: SPACING.md || 16,
  },
  businessActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  businessButton: {
    flex: 1,
    marginHorizontal: SPACING.sm || 8,
    borderRadius: 12,
  },
  aiToolsCard: {
    margin: SPACING.lg || 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  aiToolCard: {
    width: 160,
    height: 120,
    marginRight: SPACING.md || 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  aiToolGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md || 16,
  },
  aiToolTitle: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.sm || 8,
    textAlign: 'center',
  },
  aiToolSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
  },
  menuModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
    paddingTop: SPACING.lg || 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg || 20,
    paddingBottom: SPACING.md || 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  menuScrollView: {
    flex: 1,
    paddingHorizontal: SPACING.lg || 20,
  },
  menuCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginTop: SPACING.lg || 20,
    marginBottom: SPACING.md || 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md || 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  menuOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: SPACING.md || 16,
    fontWeight: '500',
  },
  searchModal: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  searchContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: SPACING.lg || 20,
    width: width * 0.9,
    maxHeight: height * 0.6,
    alignSelf: 'center',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg || 20,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  searchBar: {
    marginBottom: SPACING.lg || 20,
    backgroundColor: '#f8f9fa',
  },
  quickSearchOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm || 8,
  },
  searchChip: {
    marginRight: SPACING.sm || 8,
    marginBottom: SPACING.sm || 8,
    backgroundColor: '#f8f9fa',
  },

  profileImageContainer: {
  position: 'relative',
  marginRight: SPACING.md || 16,
},
editIcon: {
  position: 'absolute',
  bottom: -2,
  right: -2,
  alignItems: 'center',
  justifyContent: 'center',
},
sectionHeaderRight: {
  flexDirection: 'row',
  alignItems: 'center',
},
scrollIndicator: {
  marginRight: SPACING.sm || 4,
  opacity: 0.7,
},
cameraIcon: {
  position: 'absolute',
  bottom: -2,
  right: -2,
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: '#667eea',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: 'white',
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},
profileImageContainer: {
  position: 'relative',
  marginRight: SPACING.md || 16,
},
});

export default CoachDashboard;
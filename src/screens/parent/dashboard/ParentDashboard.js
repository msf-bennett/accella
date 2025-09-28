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
  Badge
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/layout';
import { TEXT_STYLES } from '../../../styles/typography';
import ParentSearchHome from '../search/ParentSearchHome';


const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

const ParentDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [quickSearchVisible, setQuickSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChild, setSelectedChild] = useState(0);
  const [currentTimeSlot, setCurrentTimeSlot] = useState('');
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const { user } = useSelector(state => state.auth);
  const { children = [], academies = [] } = useSelector(state => state.parent || {});
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
    Vibration.vibrate(50);
    // Simulate API call to refresh children's data
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greetings = {
      morning: ['Good Morning', 'Rise & Support', 'Morning Parent'],
      afternoon: ['Good Afternoon', 'Keep Supporting', 'Afternoon Check'],
      evening: ['Good Evening', 'Evening Update', 'Wind Down Time'],
      night: ['Good Night', 'Late Check-in', 'Rest Well']
    };
    
    let timeKey = 'morning';
    if (hour >= 12 && hour < 17) timeKey = 'afternoon';
    else if (hour >= 17 && hour < 21) timeKey = 'evening';
    else if (hour >= 21 || hour < 6) timeKey = 'night';
    
    const options = greetings[timeKey];
    return options[Math.floor(Math.random() * options.length)];
  };

  // Mock data for children
  const myChildren = [
    {
      id: 1,
      name: 'Emma Rodriguez',
      age: 12,
      sport: 'Football',
      level: 'Youth League',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      currentProgram: 'Youth Development Program',
      coach: 'Coach Martinez',
      nextSession: 'Today • 4:00 PM',
      progress: 0.78,
      weeklyGoal: 3,
      completedSessions: 2,
      attendance: 92,
      recentScore: 85,
      academy: 'Champions Sports Academy',
      notifications: 2
    },
    {
      id: 2,
      name: 'Alex Rodriguez',
      age: 8,
      sport: 'Basketball',
      level: 'Beginner',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      currentProgram: 'Little Hoops Foundation',
      coach: 'Coach Johnson',
      nextSession: 'Tomorrow • 5:30 PM',
      progress: 0.45,
      weeklyGoal: 2,
      completedSessions: 1,
      attendance: 88,
      recentScore: 78,
      academy: 'Junior Sports Center',
      notifications: 1
    }
  ];

  const currentChild = myChildren[selectedChild];

  // Parent stats overview
  const parentStats = [
    { 
      icon: 'child-care', 
      label: 'Children', 
      value: myChildren.length.toString(), 
      subtitle: 'active athletes',
      color: '#FF6B6B',
      bgGradient: ['#FF6B6B', '#FF8E8E']
    },
    { 
      icon: 'school', 
      label: 'Academies', 
      value: '2', 
      subtitle: 'enrolled',
      color: '#4ECDC4',
      bgGradient: ['#4ECDC4', '#44B3AA']
    },
    { 
      icon: 'event', 
      label: 'This Week', 
      value: '5', 
      subtitle: 'sessions total',
      color: '#45B7D1',
      bgGradient: ['#45B7D1', '#3A9BC1']
    },
    { 
      icon: 'trending-up', 
      label: 'Avg Score', 
      value: '82%', 
      subtitle: 'performance',
      color: '#F39C12',
      bgGradient: ['#F39C12', '#E67E22']
    },
  ];

  // Today's schedule for selected child
  const todaySchedule = [
    {
      id: 1,
      childId: 1,
      title: 'Football Training - Agility Focus',
      time: '4:00 PM',
      duration: 60,
      status: 'upcoming',
      type: 'Team Practice',
      coach: 'Coach Martinez',
      location: 'Main Field',
      academy: 'Champions Sports Academy',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100',
      requirements: ['Water bottle', 'Cleats', 'Shin guards']
    },
    {
      id: 2,
      childId: 2,
      title: 'Basketball Skills & Drills',
      time: '5:30 PM',
      duration: 45,
      status: 'upcoming',
      type: 'Group Training',
      coach: 'Coach Johnson',
      location: 'Indoor Court A',
      academy: 'Junior Sports Center',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100',
      requirements: ['Basketball shoes', 'Water bottle']
    }
  ];

  // Upcoming events and competitions
  const upcomingEvents = [
    {
      id: 1,
      childId: 1,
      title: 'Regional Youth Tournament',
      date: 'March 15, 2024',
      time: '9:00 AM',
      type: 'Competition',
      location: 'City Sports Complex',
      status: 'confirmed',
      fee: '$25',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100'
    },
    {
      id: 2,
      childId: 2,
      title: 'Skills Assessment Day',
      date: 'March 12, 2024',
      time: '2:00 PM',
      type: 'Assessment',
      location: 'Junior Sports Center',
      status: 'pending_payment',
      fee: '$15',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100'
    }
  ];

  // Recent activities
  const recentActivities = [
    { 
      id: 1, 
      childId: 1,
      text: 'Emma completed agility session with 95% score', 
      time: '2 hours ago',
      type: 'completion',
      icon: 'check-circle',
      color: '#4CAF50'
    },
    { 
      id: 2, 
      childId: 1,
      text: 'New feedback from Coach Martinez available', 
      time: '4 hours ago',
      type: 'feedback',
      icon: 'feedback',
      color: '#2196F3'
    },
    { 
      id: 3, 
      childId: 2,
      text: 'Alex improved dribbling skills assessment', 
      time: '1 day ago',
      type: 'improvement',
      icon: 'trending-up',
      color: '#FF9800'
    },
    { 
      id: 4, 
      childId: 1,
      text: 'Payment reminder for tournament registration', 
      time: '2 days ago',
      type: 'payment',
      icon: 'payment',
      color: '#F44336'
    },
  ];

  const quickActions = [
    { icon: 'search', label: 'Find Academy', action: () => navigation.navigate('SearchAcademies') },
    { icon: 'payment', label: 'Payments', action: () => navigation.navigate('PaymentHistory') },
    { icon: 'assessment', label: 'Progress', action: () => navigation.navigate('ChildProgress', { childId: currentChild.id }) },
    { icon: 'chat', label: 'Coach Chat', action: () => navigation.navigate('CoachChat') }
  ];

  const menuOptions = [
    { icon: 'search', label: 'Search Academies', action: () => navigation.navigate('SearchAcademies') },
    { icon: 'event', label: 'Calendar View', action: () => navigation.navigate('CalendarScreen') },
    { icon: 'payment', label: 'Payment History', action: () => navigation.navigate('PaymentHistory') },
    { icon: 'feedback', label: 'Coach Feedback', action: () => navigation.navigate('FeedbackScreen') },
    { icon: 'help', label: 'Child Protection', action: () => navigation.navigate('ChildProtection') },
    { icon: 'help', label: 'Parent Support', action: () => navigation.navigate('SupportScreen') },
    { icon: 'settings', label: 'General Settings', action: () => navigation.navigate('SettingsScreen') },
    { icon: 'settings', label: 'Family Settings', action: () => navigation.navigate('FamilySettings') },
    { icon: 'settings', label: 'Privacy Settings', action: () => navigation.navigate('PrivacySettings') },
    { icon: 'Settings', label: 'Notification Settings', action: () => navigation.navigate('NotificationSettings') }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'upcoming':
        return '#2196F3';
      case 'confirmed':
        return '#4CAF50';
      case 'pending_payment':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
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

  const renderQuickSearchModal = () => (
    <Portal>
      <Modal
        visible={quickSearchVisible}
        onDismiss={() => setQuickSearchVisible(false)}
        contentContainerStyle={styles.searchModal}>
        <BlurView intensity={90} style={styles.searchBlur}>
          <View style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchTitle}>Quick Search</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setQuickSearchVisible(false)}
              />
            </View>
            <Searchbar
              placeholder="Search academies, coaches, sports..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
              autoFocus
            />
            <View style={styles.quickSearchOptions}>
              {['Football Academies', 'Basketball Training', 'Swimming Classes', 'Tennis Lessons'].map((option) => (
                <Chip
                  key={option}
                  mode="outlined"
                  onPress={() => {/* Handle search */}}
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

  const renderMenuModal = () => (
    <Portal>
      <Modal
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        contentContainerStyle={styles.menuModal}>
        <BlurView intensity={90} style={styles.menuBlur}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setMenuVisible(false)}
              />
            </View>
            <ScrollView style={styles.menuContent}>
              {menuOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuOption}
                  onPress={() => {
                    setMenuVisible(false);
                    option.action();
                  }}>
                  <Icon name={option.icon} size={24} color="#667eea" />
                  <Text style={styles.menuOptionText}>{option.label}</Text>
                  <Icon name="chevron-right" size={20} color="#ccc" />
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
      
      {/* Enhanced Parent Header */}
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
              <Text style={styles.tagline}>Parent • Support • Track</Text>
            </View>
            
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => navigation.navigate('ParentSearchScreen')}>
                <Icon name="search" size={24} color="white" style={styles.headerIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                <View>
                  <Icon name="notifications" size={24} color="white" style={styles.headerIcon} />
                  <Badge size={16} style={styles.notificationBadge}>
                    {myChildren.reduce((total, child) => total + child.notifications, 0)}
                  </Badge>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <Icon name="dots-vertical" size={24} color="white" style={styles.headerIcon} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerContent}>
            <Avatar.Image 
              size={60} 
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' }}
              style={styles.userAvatar}
            />
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user?.firstName || 'Maria'}! 👨‍👩‍👧‍👦</Text>
              <Text style={styles.timeSlot}>{currentTimeSlot} • Supporting champions</Text>
            </View>
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

        {/* Parent Stats Grid */}
        <Animated.View 
          style={[
            styles.statsSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
          <Text style={styles.sectionTitle}>Family Overview</Text>
          <View style={styles.statsGrid}>
            {parentStats.map((stat, index) => (
              <Animated.View key={index} style={styles.statCard}>
                <LinearGradient
                  colors={stat.bgGradient}
                  style={styles.statGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <Icon name={stat.icon} size={28} color="white" />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
                </LinearGradient>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Children Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Children</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.childrenScroll}>
            {myChildren.map((child, index) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childCard,
                  selectedChild === index && styles.selectedChildCard
                ]}
                onPress={() => setSelectedChild(index)}>
                <LinearGradient
                  colors={selectedChild === index ? ['#667eea', '#764ba2'] : ['#f8f9fa', '#e9ecef']}
                  style={styles.childGradient}>
                  <Avatar.Image 
                    size={50} 
                    source={{ uri: child.avatar }}
                    style={styles.childAvatar}
                  />
                  <Text style={[
                    styles.childName,
                    { color: selectedChild === index ? 'white' : '#2c3e50' }
                  ]}>
                    {child?.name?.split(' ')[0] || 'Unknown'}
                  </Text>
                  <Text style={[
                      styles.childSport,
                      { color: selectedChild === index ? 'rgba(255,255,255,0.8)' : '#7f8c8d' }
                    ]}>
                      {child?.sport || 'No sport assigned'}
                    </Text>
                  {child.notifications > 0 && (
                    <Badge size={16} style={styles.childNotificationBadge}>
                      {child.notifications}
                    </Badge>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selected Child Overview */}
        <Card style={styles.childOverviewCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.childOverviewGradient}>
            <View style={styles.childOverviewHeader}>
              <Avatar.Image 
                size={70} 
                source={{ uri: currentChild.avatar }}
                style={styles.childOverviewAvatar}
              />
              <View style={styles.childOverviewInfo}>
                <Text style={styles.childOverviewName}>{currentChild.name}</Text>
                <Text style={styles.childOverviewDetails}>
                  {currentChild.age} years • {currentChild.sport} • {currentChild.level}
                </Text>
                <Text style={styles.childOverviewAcademy}>
                  📍 {currentChild.academy}
                </Text>
              </View>
            </View>

            <View style={styles.childProgressSection}>
              <Text style={styles.progressTitle}>Weekly Progress</Text>
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatValue}>
                    {currentChild.completedSessions}/{currentChild.weeklyGoal}
                  </Text>
                  <Text style={styles.progressStatLabel}>Sessions</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatValue}>{currentChild.attendance}%</Text>
                  <Text style={styles.progressStatLabel}>Attendance</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatValue}>{currentChild.recentScore}%</Text>
                  <Text style={styles.progressStatLabel}>Last Score</Text>
                </View>
              </View>
              
              <View style={styles.overallProgress}>
                <Text style={styles.overallProgressLabel}>
                  Overall Progress: {Math.round(currentChild.progress * 100)}%
                </Text>
                <ProgressBar 
                  progress={currentChild.progress} 
                  color="rgba(255,255,255,0.9)"
                  style={styles.overallProgressBar}
                />
              </View>
            </View>

            <Button
              mode="contained"
              buttonColor="rgba(255,255,255,0.2)"
              textColor="white"
              style={styles.viewFullProgressButton}
              onPress={() => navigation.navigate('ChildProgress', { childId: currentChild.id })}>
              View Full Progress Report
            </Button>
          </LinearGradient>
        </Card>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <Button mode="text" onPress={() => navigation.navigate('Schedule')}>
              View All
            </Button>
          </View>
          
          {todaySchedule.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.noSessionsText}>No sessions scheduled for today</Text>
                <Text style={styles.motivationText}>Perfect rest day! 🌟</Text>
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
                          {session.status === 'completed' ? '✓' : '○'}
                        </Chip>
                      </View>

                      <View style={styles.sessionContent}>
                        <Text style={styles.sessionTitle}>{session.title}</Text>
                        <Text style={styles.sessionCoach}>👨‍🏫 {session.coach}</Text>
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
                        </View>

                        {session.requirements && (
                          <View style={styles.requirementsContainer}>
                            <Text style={styles.requirementsTitle}>Pack:</Text>
                            <Text style={styles.requirementsText}>
                              {session.requirements.join(', ')}
                            </Text>
                          </View>
                        )}

                        <Button
                          mode="contained"
                          buttonColor="#667eea"
                          textColor="white"
                          style={styles.sessionButton}
                          onPress={() => navigation.navigate('SessionDetails', { sessionId: session.id })}>
                          View Details
                        </Button>
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                </Card>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsScroll}>
            {upcomingEvents.map((event) => (
              <Card key={event.id} style={styles.eventCard}>
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  style={styles.eventGradient}>
                  
                  <View style={styles.eventHeader}>
                    <Chip 
                      mode="flat" 
                      textStyle={styles.eventTypeText}
                      style={styles.eventTypeChip}>
                      {event.type}
                    </Chip>
                    <Text style={styles.eventFee}>{event.fee}</Text>
                  </View>

                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                  <Text style={styles.eventTime}>🕐 {event.time}</Text>
                  <Text style={styles.eventLocation}>📍 {event.location}</Text>
                  
                  <View style={styles.eventStatusContainer}>
                    <Chip 
                      mode="flat"
                      textStyle={styles.eventStatusText}
                      style={[styles.eventStatusChip, { backgroundColor: getStatusColor(event.status) }]}>
                      {event.status === 'confirmed' ? 'Confirmed' : 'Payment Pending'}
                    </Chip>
                  </View>

                  <Button
                    mode="contained"
                    buttonColor="rgba(255,255,255,0.2)"
                    textColor="white"
                    style={styles.eventButton}
                    onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}>
                    {event.status === 'pending_payment' ? 'Pay Now' : 'View Details'}
                  </Button>
                </LinearGradient>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Recent Activities */}
        <Card style={styles.activitiesCard}>
          <Card.Title title="Recent Activities" />
          <Card.Content>
            {recentActivities.slice(0, 4).map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
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
                <Avatar.Image 
                  size={32} 
                  source={{ uri: myChildren.find(child => child.id === activity.childId)?.avatar }}
                  style={styles.activityChildAvatar}
                />
              </View>
            ))}
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('AllActivities')}
              style={styles.viewAllButton}>
              View All Activities
            </Button>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.quickActionsCard}>
          <Card.Title title="Quick Actions" />
          <Card.Content>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.quickActionCard}
                  onPress={action.action}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.quickActionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}>
                    <Icon name={action.icon} size={32} color="white" />
                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Spacer for FAB */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="chat"
        style={styles.fab}
        color="white"
        onPress={() => navigation.navigate('CoachChat')}
      />

      {/* Modals */}
      {renderQuickSearchModal()}
      {renderMenuModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header Styles
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    zIndex: 1000,
  },
  headerGradient: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  appBranding: {
    alignItems: 'flex-start',
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
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: SPACING.md,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff4444',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    marginRight: SPACING.md,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 2,
  },
  timeSlot: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },

  // ScrollView
  scrollView: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#f8f9fa',
  },

  // Section Styles
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: SPACING.md,
  },

  // Stats Grid
  statsSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
  },

  // Children Selector
  childrenScroll: {
    paddingRight: SPACING.lg,
  },
  childCard: {
    marginRight: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  selectedChildCard: {
    transform: [{ scale: 1.05 }],
  },
  childGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    width: 100,
    minHeight: 120,
  },
  childAvatar: {
    marginBottom: SPACING.sm,
  },
  childName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  childSport: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  childNotificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff4444',
  },

  // Child Overview Card
  childOverviewCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  childOverviewGradient: {
    padding: SPACING.lg,
  },
  childOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  childOverviewAvatar: {
    marginRight: SPACING.lg,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  childOverviewInfo: {
    flex: 1,
  },
  childOverviewName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  childOverviewDetails: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  childOverviewAcademy: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  childProgressSection: {
    marginBottom: SPACING.lg,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: SPACING.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  progressStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  overallProgress: {
    marginBottom: SPACING.md,
  },
  overallProgressLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.sm,
  },
  overallProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  viewFullProgressButton: {
    borderRadius: 12,
  },

  // Schedule Section
  emptyCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  noSessionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  motivationText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 4,
  },
  sessionsScroll: {
    paddingRight: SPACING.lg,
  },
  sessionCard: {
    width: CARD_WIDTH,
    marginRight: SPACING.md,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
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
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  typeChip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusChip: {
    minWidth: 30,
    height: 30,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.sm,
  },
  sessionCoach: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  sessionLocation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.md,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sessionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDetailText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 6,
  },
  requirementsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  requirementsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  sessionButton: {
    borderRadius: 12,
  },

  // Events Section
  eventsScroll: {
    paddingRight: SPACING.lg,
  },
  eventCard: {
    width: CARD_WIDTH * 0.8,
    marginRight: SPACING.md,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  eventGradient: {
    padding: SPACING.lg,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  eventTypeChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  eventFee: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.sm,
  },
  eventDate: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.md,
  },
  eventStatusContainer: {
    marginBottom: SPACING.md,
  },
  eventStatusChip: {
    alignSelf: 'flex-start',
  },
  eventStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  eventButton: {
    borderRadius: 12,
  },

  // Activities Card
  activitiesCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  activityChildAvatar: {
    marginLeft: SPACING.sm,
  },
  viewAllButton: {
    marginTop: SPACING.sm,
  },

  // Quick Actions
  quickActionsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  quickActionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
  },

  // Modal Styles
  searchModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBlur: {
    width: width * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: SPACING.lg,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  searchBar: {
    marginBottom: SPACING.lg,
    elevation: 2,
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

  // Menu Modal
  menuModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBlur: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
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
  menuContent: {
    maxHeight: height * 0.5,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  menuOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: SPACING.md,
    fontWeight: '500',
  },
});

export default ParentDashboard;
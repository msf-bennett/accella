import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Badge,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width } = Dimensions.get('window');

const ParentPortal = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { children, activities, loading } = useSelector(state => state.parent);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChild, setSelectedChild] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));

  // Sample data for children and their activities
  const sampleChildren = [
    {
      id: 1,
      name: 'Emma Johnson',
      age: 12,
      sport: 'Football',
      academy: 'Elite Sports Academy',
      coach: 'Coach Sarah Miller',
      avatar: 'EJ',
      level: 'Intermediate',
      nextSession: '2024-08-17T16:00:00',
      attendance: 92,
      performance: 85,
      badges: 12,
      recentAchievements: ['Best Player of the Week', 'Perfect Attendance'],
      upcomingEvents: [
        { id: 1, title: 'Team Practice', date: '2024-08-17', time: '4:00 PM' },
        { id: 2, title: 'Skills Assessment', date: '2024-08-19', time: '3:00 PM' },
        { id: 3, title: 'Parent-Coach Meeting', date: '2024-08-21', time: '5:00 PM' },
      ],
    },
    {
      id: 2,
      name: 'Alex Johnson',
      age: 9,
      sport: 'Basketball',
      academy: 'Youth Sports Center',
      coach: 'Coach Mike Davis',
      avatar: 'AJ',
      level: 'Beginner',
      nextSession: '2024-08-18T15:00:00',
      attendance: 88,
      performance: 78,
      badges: 8,
      recentAchievements: ['Most Improved Player', 'Team Spirit Award'],
      upcomingEvents: [
        { id: 1, title: 'Basketball Drills', date: '2024-08-18', time: '3:00 PM' },
        { id: 2, title: 'Mini Tournament', date: '2024-08-20', time: '10:00 AM' },
      ],
    },
  ];

  // Quick stats data
  const quickStats = [
    {
      id: 'attendance',
      title: 'Attendance',
      value: `${sampleChildren[selectedChild]?.attendance}%`,
      icon: 'event-available',
      color: COLORS.success,
      trend: '+5%',
    },
    {
      id: 'performance',
      title: 'Performance',
      value: `${sampleChildren[selectedChild]?.performance}%`,
      icon: 'trending-up',
      color: COLORS.primary,
      trend: '+12%',
    },
    {
      id: 'badges',
      title: 'Badges Earned',
      value: sampleChildren[selectedChild]?.badges || 0,
      icon: 'jump-rope',
      color: COLORS.warning,
      trend: '+3',
    },
    {
      id: 'sessions',
      title: 'This Month',
      value: '16',
      icon: 'fitness-center',
      color: COLORS.secondary,
      trend: '+2',
    },
  ];

  // Recent activities data
  const recentActivities = [
    {
      id: 1,
      type: 'performance',
      title: 'Performance Update',
      description: 'Great improvement in ball control and passing accuracy',
      timestamp: '2 hours ago',
      icon: 'trending-up',
      color: COLORS.success,
    },
    {
      id: 2,
      type: 'message',
      title: 'Message from Coach',
      description: 'Emma showed excellent teamwork in today\'s training session',
      timestamp: '5 hours ago',
      icon: 'message',
      color: COLORS.primary,
      unread: true,
    },
    {
      id: 3,
      type: 'achievement',
      title: 'New Badge Earned!',
      description: 'Earned "Team Player" badge for collaborative skills',
      timestamp: '1 day ago',
      icon: 'jump-rope',
      color: COLORS.warning,
    },
    {
      id: 4,
      type: 'session',
      title: 'Session Completed',
      description: 'Football Training - Advanced Techniques',
      timestamp: '2 days ago',
      icon: 'check-circle',
      color: COLORS.success,
    },
  ];

  // Effects
  useEffect(() => {
    loadParentData();
    animateChildSelection();
  }, [selectedChild]);

  // Handlers
  const loadParentData = useCallback(async () => {
    try {
      // dispatch(loadParentDashboard());
      // dispatch(loadChildrenActivities());
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadParentData();
    setRefreshing(false);
  }, [loadParentData]);

  const animateChildSelection = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: selectedChild * 10,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleChildSelection = (index) => {
    if (index !== selectedChild) {
      setSelectedChild(index);
      Vibration.vibrate(50);
    }
  };

  const handleMessageCoach = () => {
    const child = sampleChildren[selectedChild];
    navigation.navigate('ChatWithCoach', { 
      child: child,
      coach: child.coach 
    });
    Vibration.vibrate(50);
  };

  const handleViewProgress = () => {
    navigation.navigate('ChildProgress', { 
      childId: sampleChildren[selectedChild].id 
    });
    Vibration.vibrate(50);
  };

  const handleBookSession = () => {
    Alert.alert(
      'Book Session',
      'Would you like to book an additional training session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book Now', onPress: () => navigation.navigate('BookSession') },
      ]
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Render functions
  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()}, {user?.name}!</Text>
            <Text style={styles.headerSubtitle}>
              Track your children's sports journey
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('ParentProfile')}
            style={styles.profileButton}
          >
            <Avatar.Text 
              size={50} 
              label={user?.name?.charAt(0) || 'P'} 
              style={styles.avatar}
              labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
            />
            <Badge 
              visible={true} 
              size={8} 
              style={styles.notificationBadge}
            />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderChildSelector = () => (
    <View style={styles.childSelectorContainer}>
      <Text style={styles.sectionTitle}>My Children</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.childSelector}
      >
        {sampleChildren.map((child, index) => (
          <TouchableOpacity
            key={child.id}
            style={[
              styles.childCard,
              selectedChild === index && styles.selectedChildCard,
            ]}
            onPress={() => handleChildSelection(index)}
          >
            <Avatar.Text 
              size={60} 
              label={child.avatar} 
              style={[
                styles.childAvatar,
                selectedChild === index && styles.selectedChildAvatar,
              ]}
              labelStyle={{ 
                fontSize: 20, 
                fontWeight: 'bold',
                color: selectedChild === index ? 'white' : COLORS.primary,
              }}
            />
            <Text style={[
              styles.childName,
              selectedChild === index && styles.selectedChildName,
            ]}>
              {child.name.split(' ')[0]}
            </Text>
            <Text style={styles.childInfo}>
              {child.age} yrs • {child.sport}
            </Text>
            <Chip
              compact
              style={[
                styles.levelChip,
                selectedChild === index && styles.selectedLevelChip,
              ]}
              textStyle={[
                styles.levelChipText,
                selectedChild === index && styles.selectedLevelChipText,
              ]}
            >
              {child.level}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickStats = () => (
    <Animated.View style={[styles.quickStatsContainer, { opacity: fadeAnim }]}>
      <Text style={styles.sectionTitle}>Quick Overview</Text>
      <View style={styles.statsGrid}>
        {quickStats.map((stat) => (
          <Surface key={stat.id} style={styles.statCard}>
            <View style={styles.statHeader}>
              <Icon name={stat.icon} size={24} color={stat.color} />
              <Text style={[styles.statTrend, { color: stat.color }]}>
                {stat.trend}
              </Text>
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </Surface>
        ))}
      </View>
    </Animated.View>
  );

  const renderNextSession = () => {
    const child = sampleChildren[selectedChild];
    const nextSession = formatDateTime(child.nextSession);
    
    return (
      <Card style={styles.nextSessionCard}>
        <LinearGradient 
          colors={[COLORS.primary, COLORS.primaryLight]} 
          style={styles.nextSessionGradient}
          start={{x: 0, y: 0}} 
          end={{x: 1, y: 1}}
        >
          <Card.Content style={styles.nextSessionContent}>
            <View style={styles.nextSessionHeader}>
              <View>
                <Text style={styles.nextSessionTitle}>Next Session</Text>
                <Text style={styles.nextSessionSubtitle}>
                  {child.sport} Training with {child.coach}
                </Text>
              </View>
              <Icon name="schedule" size={32} color="white" />
            </View>
            
            <View style={styles.sessionDetails}>
              <View style={styles.sessionDetail}>
                <Icon name="event" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.sessionDetailText}>{nextSession.date}</Text>
              </View>
              <View style={styles.sessionDetail}>
                <Icon name="access-time" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.sessionDetailText}>{nextSession.time}</Text>
              </View>
              <View style={styles.sessionDetail}>
                <Icon name="location-on" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.sessionDetailText}>{child.academy}</Text>
              </View>
            </View>

            <View style={styles.sessionActions}>
              <Button
                mode="contained"
                onPress={() => Alert.alert('Reminder Set', 'You\'ll be notified 30 minutes before the session')}
                style={styles.reminderButton}
                labelStyle={styles.reminderButtonLabel}
                icon="notifications"
                compact
              >
                Set Reminder
              </Button>
              <Button
                mode="text"
                onPress={handleMessageCoach}
                labelStyle={styles.messageButtonLabel}
                icon="message"
                compact
              >
                Message Coach
              </Button>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    );
  };

  const renderProgressOverview = () => {
    const child = sampleChildren[selectedChild];
    
    return (
      <Card style={styles.progressCard}>
        <Card.Content style={styles.progressContent}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress Overview</Text>
            <Button
              mode="text"
              onPress={handleViewProgress}
              labelStyle={styles.viewMoreButton}
              icon="arrow-forward"
              compact
            >
              View Details
            </Button>
          </View>

          <View style={styles.progressMetrics}>
            <View style={styles.progressMetric}>
              <View style={styles.progressMetricHeader}>
                <Text style={styles.progressMetricLabel}>Attendance</Text>
                <Text style={styles.progressMetricValue}>{child.attendance}%</Text>
              </View>
              <ProgressBar 
                progress={child.attendance / 100} 
                color={COLORS.success}
                style={styles.progressBar}
              />
            </View>

            <View style={styles.progressMetric}>
              <View style={styles.progressMetricHeader}>
                <Text style={styles.progressMetricLabel}>Performance</Text>
                <Text style={styles.progressMetricValue}>{child.performance}%</Text>
              </View>
              <ProgressBar 
                progress={child.performance / 100} 
                color={COLORS.primary}
                style={styles.progressBar}
              />
            </View>
          </View>

          <View style={styles.achievements}>
            <Text style={styles.achievementsTitle}>Recent Achievements 🏆</Text>
            <View style={styles.achievementsList}>
              {child.recentAchievements.map((achievement, index) => (
                <Chip
                  key={index}
                  style={styles.achievementChip}
                  textStyle={styles.achievementChipText}
                  icon="jump-rope"
                  compact
                >
                  {achievement}
                </Chip>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderUpcomingEvents = () => {
    const child = sampleChildren[selectedChild];
    
    return (
      <Card style={styles.eventsCard}>
        <Card.Content style={styles.eventsContent}>
          <Text style={styles.eventsTitle}>Upcoming Events</Text>
          
          {child.upcomingEvents.map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <View style={styles.eventIcon}>
                <Icon name="event" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDateTime}>
                  {event.date} • {event.time}
                </Text>
              </View>
              <IconButton
                icon="chevron-right"
                iconColor={COLORS.textSecondary}
                onPress={() => Alert.alert('Event Details', `More information about ${event.title}`)}
              />
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  const renderRecentActivity = () => (
    <Card style={styles.activityCard}>
      <Card.Content style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>Recent Activity</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('ActivityHistory')}
            labelStyle={styles.viewAllButton}
            compact
          >
            View All
          </Button>
        </View>

        {recentActivities.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
              <Icon name={activity.icon} size={20} color={activity.color} />
              {activity.unread && (
                <Badge 
                  visible={true} 
                  size={8} 
                  style={[styles.activityBadge, { backgroundColor: activity.color }]}
                />
              )}
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityItemTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>
              <Text style={styles.activityTimestamp}>{activity.timestamp}</Text>
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={handleMessageCoach}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            style={styles.quickActionGradient}
          >
            <Icon name="chat" size={32} color="white" />
            <Text style={styles.quickActionText}>Message Coach</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={handleBookSession}
        >
          <LinearGradient
            colors={[COLORS.success, '#4CAF50']}
            style={styles.quickActionGradient}
          >
            <Icon name="add-circle" size={32} color="white" />
            <Text style={styles.quickActionText}>Book Session</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={handleViewProgress}
        >
          <LinearGradient
            colors={[COLORS.warning, '#FF9800']}
            style={styles.quickActionGradient}
          >
            <Icon name="analytics" size={32} color="white" />
            <Text style={styles.quickActionText}>View Progress</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('PaymentHistory')}
        >
          <LinearGradient
            colors={[COLORS.secondary, '#9C27B0']}
            style={styles.quickActionGradient}
          >
            <Icon name="payment" size={32} color="white" />
            <Text style={styles.quickActionText}>Payments</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
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
        showsVerticalScrollIndicator={false}
      >
        {renderChildSelector()}
        {renderQuickStats()}
        {renderNextSession()}
        {renderProgressOverview()}
        {renderUpcomingEvents()}
        {renderRecentActivity()}
        {renderQuickActions()}
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        color="white"
        onPress={() => {
          Alert.alert(
            'Add Child',
            'Would you like to enroll another child in sports training?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Find Academy', onPress: () => navigation.navigate('FindAcademy') },
            ]
          );
        }}
      />
    </View>
  );
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  profileButton: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error,
  },
  content: {
    flex: 1,
  },
  childSelectorContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  childSelector: {
    gap: SPACING.md,
  },
  childCard: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedChildCard: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  childAvatar: {
    backgroundColor: 'white',
    marginBottom: SPACING.sm,
  },
  selectedChildAvatar: {
    backgroundColor: COLORS.primary,
  },
  childName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  selectedChildName: {
    color: COLORS.primary,
  },
  childInfo: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  levelChip: {
    backgroundColor: COLORS.surface,
    height: 24,
  },
  selectedLevelChip: {
    backgroundColor: 'white',
  },
  levelChipText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  selectedLevelChipText: {
    color: COLORS.primary,
  },
  quickStatsContainer: {
    padding: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    minWidth: (width - SPACING.lg * 3) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statTrend: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  statValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statTitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  nextSessionCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 4,
    borderRadius: 16,
  },
  nextSessionGradient: {
    borderRadius: 16,
  },
  nextSessionContent: {
    padding: SPACING.lg,
  },
  nextSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  nextSessionTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  nextSessionSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  sessionDetails: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sessionDetailText: {
    ...TEXT_STYLES.body,
    color: 'white',
  },
  sessionActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  reminderButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  reminderButtonLabel: {
    color: 'white',
    fontSize: 12,
  },
  messageButtonLabel: {
    color: 'white',
    fontSize: 12,
  },
  progressCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
    borderRadius: 12,
  },
  progressContent: {
    padding: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  progressTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  viewMoreButton: {
    color: COLORS.primary,
    fontSize: 12,
  },
  progressMetrics: {
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  progressMetric: {
    gap: SPACING.sm,
  },
  progressMetricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressMetricLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  progressMetricValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  achievements: {
    marginTop: SPACING.md,
  },
  achievementsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  achievementChip: {
    backgroundColor: COLORS.warning + '20',
    height: 28,
  },
  achievementChipText: {
    fontSize: 11,
    color: COLORS.warning,
  },
  eventsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
    borderRadius: 12,
    },
  eventsContent: {
    padding: SPACING.lg,
  },
  eventsTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  eventDateTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  activityCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
    borderRadius: 12,
  },
  activityContent: {
    padding: SPACING.lg,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  activityTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  viewAllButton: {
    color: COLORS.primary,
    fontSize: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  activityBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  activityDetails: {
    flex: 1,
  },
  activityItemTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  activityDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  activityTimestamp: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: SPACING.xs,
  },
  quickActionsContainer: {
    padding: SPACING.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickActionCard: {
    flex: 1,
    minWidth: (width - SPACING.lg * 3) / 2,
    height: 80,
    borderRadius: 16,
    elevation: 3,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    elevation: 8,
  },
  bottomPadding: {
    height: 100,
  },
});

export default ParentPortal;
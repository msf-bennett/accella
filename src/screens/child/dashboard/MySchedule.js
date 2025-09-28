import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Surface,
  Avatar,
  IconButton,
  FAB,
  ProgressBar,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants';

const { width } = Dimensions.get('window');

const MySchedule = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { schedule, loading } = useSelector(state => state.schedule);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    loadSchedule();
  }, []);

  const loadSchedule = useCallback(async () => {
    try {
      // Simulate API call - replace with actual Redux actions
      // dispatch(fetchSchedule());
    } catch (error) {
      Alert.alert('Error', 'Failed to load schedule');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSchedule();
    setRefreshing(false);
  }, [loadSchedule]);

  const handleSessionPress = useCallback((session) => {
    Vibration.vibrate(50);
    
    if (session.status === 'completed') {
      Alert.alert(
        'Session Completed! 🎉',
        `Great job on completing "${session.title}"!\n\nPoints earned: +${session.points}`,
        [
          { text: 'View Details', onPress: () => navigation.navigate('SessionDetails', { sessionId: session.id }) },
          { text: 'OK', style: 'default' }
        ]
      );
    } else if (session.status === 'upcoming') {
      Alert.alert(
        'Ready to Train? 💪',
        `Are you ready to start "${session.title}"?`,
        [
          { text: 'Start Session', onPress: () => navigation.navigate('TrainingSession', { sessionId: session.id }) },
          { text: 'View Details', onPress: () => navigation.navigate('SessionDetails', { sessionId: session.id }) },
          { text: 'Later', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert(
        'Session Details',
        `"${session.title}"\n${session.description}`,
        [
          { text: 'View Full Details', onPress: () => navigation.navigate('SessionDetails', { sessionId: session.id }) },
          { text: 'OK', style: 'default' }
        ]
      );
    }
  }, [navigation]);

  // Mock data - replace with actual data from Redux store
  const mockSchedule = {
    weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    currentWeek: [
      {
        date: 'Dec 23',
        day: 'Mon',
        isToday: false,
        sessions: [
          {
            id: 1,
            title: 'Morning Warm-up',
            time: '07:00 AM',
            duration: '30 min',
            type: 'warmup',
            status: 'completed',
            points: 25,
            icon: 'wb-sunny',
            color: '#FF6B35'
          },
          {
            id: 2,
            title: 'Speed Training',
            time: '04:00 PM',
            duration: '45 min',
            type: 'training',
            status: 'completed',
            points: 50,
            icon: 'flash-on',
            color: '#9B59B6'
          }
        ]
      },
      {
        date: 'Dec 24',
        day: 'Tue',
        isToday: true,
        sessions: [
          {
            id: 3,
            title: 'Strength Building',
            time: '03:30 PM',
            duration: '60 min',
            type: 'training',
            status: 'upcoming',
            points: 75,
            icon: 'fitness-center',
            color: '#4ECDC4',
            description: 'Focus on core strength and stability exercises'
          },
          {
            id: 4,
            title: 'Cool Down',
            time: '05:00 PM',
            duration: '20 min',
            type: 'cooldown',
            status: 'pending',
            points: 20,
            icon: 'self-improvement',
            color: '#667eea'
          }
        ]
      },
      {
        date: 'Dec 25',
        day: 'Wed',
        isToday: false,
        sessions: [
          {
            id: 5,
            title: 'Rest Day',
            time: 'All Day',
            duration: '24 hrs',
            type: 'rest',
            status: 'scheduled',
            points: 0,
            icon: 'hotel',
            color: '#95A5A6',
            description: 'Take a well-deserved rest! Recovery is important too! 😴'
          }
        ]
      },
      {
        date: 'Dec 26',
        day: 'Thu',
        isToday: false,
        sessions: [
          {
            id: 6,
            title: 'Agility Drills',
            time: '04:00 PM',
            duration: '40 min',
            type: 'training',
            status: 'scheduled',
            points: 60,
            icon: 'directions-run',
            color: '#E74C3C'
          },
          {
            id: 7,
            title: 'Team Practice',
            time: '05:30 PM',
            duration: '90 min',
            type: 'team',
            status: 'scheduled',
            points: 100,
            icon: 'group',
            color: '#27AE60'
          }
        ]
      },
      {
        date: 'Dec 27',
        day: 'Fri',
        isToday: false,
        sessions: [
          {
            id: 8,
            title: 'Endurance Run',
            time: '07:00 AM',
            duration: '35 min',
            type: 'cardio',
            status: 'scheduled',
            points: 45,
            icon: 'directions-walk',
            color: '#3498DB'
          }
        ]
      },
      {
        date: 'Dec 28',
        day: 'Sat',
        isToday: false,
        sessions: [
          {
            id: 9,
            title: 'Game Day! ⚽',
            time: '10:00 AM',
            duration: '120 min',
            type: 'game',
            status: 'scheduled',
            points: 150,
            icon: 'sports-soccer',
            color: '#FFD700'
          }
        ]
      },
      {
        date: 'Dec 29',
        day: 'Sun',
        isToday: false,
        sessions: [
          {
            id: 10,
            title: 'Recovery Session',
            time: '11:00 AM',
            duration: '45 min',
            type: 'recovery',
            status: 'scheduled',
            points: 35,
            icon: 'spa',
            color: '#9B59B6'
          }
        ]
      }
    ],
    weekStats: {
      totalSessions: 12,
      completedSessions: 2,
      upcomingSessions: 2,
      totalPoints: 660,
      earnedPoints: 75
    }
  };

  const getSessionStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'upcoming': return COLORS.primary;
      case 'pending': return '#FFA726';
      case 'scheduled': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  const getSessionStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'upcoming': return 'play-circle-filled';
      case 'pending': return 'schedule';
      case 'scheduled': return 'event';
      default: return 'event';
    }
  };

  const renderSessionCard = (session) => (
    <TouchableOpacity
      key={session.id}
      onPress={() => handleSessionPress(session)}
      activeOpacity={0.8}
    >
      <Card style={[styles.sessionCard, { borderLeftColor: session.color }]}>
        <View style={styles.sessionContent}>
          <View style={styles.sessionHeader}>
            <View style={[styles.sessionIcon, { backgroundColor: session.color + '20' }]}>
              <Icon name={session.icon} size={24} color={session.color} />
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <View style={styles.sessionMeta}>
                <Icon name="access-time" size={16} color={COLORS.textSecondary} />
                <Text style={styles.sessionTime}>{session.time}</Text>
                <Text style={styles.sessionDuration}>• {session.duration}</Text>
              </View>
            </View>
            <View style={styles.sessionStatus}>
              <Icon
                name={getSessionStatusIcon(session.status)}
                size={24}
                color={getSessionStatusColor(session.status)}
              />
              {session.points > 0 && (
                <Chip
                  mode="outlined"
                  compact
                  textStyle={styles.pointsChipText}
                  style={[styles.pointsChip, { borderColor: session.color }]}
                >
                  +{session.points}
                </Chip>
              )}
            </View>
          </View>
          {session.description && (
            <Text style={styles.sessionDescription}>{session.description}</Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderDayColumn = (dayData) => (
    <View key={dayData.day} style={[
      styles.dayColumn,
      dayData.isToday && styles.todayColumn
    ]}>
      <Surface style={[
        styles.dayHeader,
        dayData.isToday && styles.todayHeader
      ]}>
        <Text style={[
          styles.dayName,
          dayData.isToday && styles.todayText
        ]}>
          {dayData.day}
        </Text>
        <Text style={[
          styles.dayDate,
          dayData.isToday && styles.todayText
        ]}>
          {dayData.date}
        </Text>
        {dayData.isToday && (
          <View style={styles.todayIndicator}>
            <Text style={styles.todayLabel}>TODAY</Text>
          </View>
        )}
      </Surface>
      
      <View style={styles.sessionsContainer}>
        {dayData.sessions.map(renderSessionCard)}
        {dayData.sessions.length === 0 && (
          <View style={styles.noSessionsContainer}>
            <Icon name="free-breakfast" size={32} color={COLORS.textSecondary} />
            <Text style={styles.noSessionsText}>Free Day! 🎉</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Training Schedule 📅</Text>
          <Text style={styles.headerSubtitle}>Let's see what's coming up!</Text>
        </View>
      </LinearGradient>

      <Animated.View style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        {/* Week Stats */}
        <Card style={styles.statsCard}>
          <LinearGradient
            colors={['#4ECDC4', '#44A08D']}
            style={styles.statsGradient}
          >
            <Text style={styles.statsTitle}>This Week's Progress 🎯</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {mockSchedule.weekStats.completedSessions}/{mockSchedule.weekStats.totalSessions}
                </Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {mockSchedule.weekStats.earnedPoints}/{mockSchedule.weekStats.totalPoints}
                </Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {mockSchedule.weekStats.upcomingSessions}
                </Text>
                <Text style={styles.statLabel}>Coming Up</Text>
              </View>
            </View>
            <ProgressBar
              progress={mockSchedule.weekStats.completedSessions / mockSchedule.weekStats.totalSessions}
              color="#FFD700"
              style={styles.weekProgressBar}
            />
          </LinearGradient>
        </Card>

        {/* View Mode Toggle */}
        <View style={styles.viewToggle}>
          <Surface style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === 'week' && styles.toggleButtonActive
              ]}
              onPress={() => setViewMode('week')}
            >
              <Icon 
                name="view-week" 
                size={20} 
                color={viewMode === 'week' ? '#FFFFFF' : COLORS.textSecondary} 
              />
              <Text style={[
                styles.toggleText,
                viewMode === 'week' && styles.toggleTextActive
              ]}>
                Week View
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === 'day' && styles.toggleButtonActive
              ]}
              onPress={() => setViewMode('day')}
            >
              <Icon 
                name="today" 
                size={20} 
                color={viewMode === 'day' ? '#FFFFFF' : COLORS.textSecondary} 
              />
              <Text style={[
                styles.toggleText,
                viewMode === 'day' && styles.toggleTextActive
              ]}>
                Day View
              </Text>
            </TouchableOpacity>
          </Surface>
        </View>

        {/* Schedule Content */}
        <ScrollView
          horizontal={viewMode === 'week'}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={viewMode === 'week' ? styles.weekScrollContainer : undefined}
        >
          {viewMode === 'week' ? (
            <View style={styles.weekView}>
              {mockSchedule.currentWeek.map(renderDayColumn)}
            </View>
          ) : (
            <View style={styles.dayView}>
              {mockSchedule.currentWeek
                .find(day => day.isToday)?.sessions
                .map(renderSessionCard) || (
                <View style={styles.noSessionsContainer}>
                  <Icon name="free-breakfast" size={48} color={COLORS.textSecondary} />
                  <Text style={styles.noSessionsText}>No sessions today! 🎉</Text>
                  <Text style={styles.noSessionsSubtext}>Enjoy your free time!</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Upcoming Sessions Preview */}
        <Card style={styles.upcomingCard}>
          <View style={styles.upcomingHeader}>
            <Icon name="upcoming" size={24} color={COLORS.primary} />
            <Text style={styles.upcomingTitle}>Next Up 🚀</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.upcomingList}>
              {mockSchedule.currentWeek
                .flatMap(day => day.sessions)
                .filter(session => session.status === 'upcoming' || session.status === 'pending')
                .slice(0, 3)
                .map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    style={styles.upcomingItem}
                    onPress={() => handleSessionPress(session)}
                  >
                    <View style={[styles.upcomingIcon, { backgroundColor: session.color + '20' }]}>
                      <Icon name={session.icon} size={20} color={session.color} />
                    </View>
                    <Text style={styles.upcomingSessionTitle}>{session.title}</Text>
                    <Text style={styles.upcomingSessionTime}>{session.time}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
        </Card>

        <View style={styles.bottomSpacing} />
      </Animated.View>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Quick Actions',
            'What would you like to do?',
            [
              { text: 'View Calendar', onPress: () => Alert.alert('Feature Coming Soon', 'Calendar view will be available soon!') },
              { text: 'Set Reminder', onPress: () => Alert.alert('Feature Coming Soon', 'Reminder feature will be available soon!') },
              { text: 'Share Schedule', onPress: () => Alert.alert('Feature Coming Soon', 'Share feature will be available soon!') },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }}
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  statsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: SPACING.sm,
  },
  weekProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  viewToggle: {
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 4,
    elevation: 2,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  weekScrollContainer: {
    paddingHorizontal: SPACING.sm,
  },
  weekView: {
    flexDirection: 'row',
  },
  dayView: {
    flex: 1,
  },
  dayColumn: {
    width: width * 0.85,
    marginHorizontal: SPACING.sm,
  },
  todayColumn: {},
  dayHeader: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    elevation: 2,
    alignItems: 'center',
  },
  todayHeader: {
    backgroundColor: COLORS.primary,
  },
  dayName: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  dayDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  todayText: {
    color: '#FFFFFF',
  },
  todayIndicator: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: SPACING.xs,
  },
  todayLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 10,
  },
  sessionsContainer: {
    flex: 1,
  },
  sessionCard: {
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderRadius: 8,
    elevation: 2,
  },
  sessionContent: {
    padding: SPACING.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  sessionTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  sessionDuration: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  sessionStatus: {
    alignItems: 'center',
  },
  pointsChip: {
    backgroundColor: 'transparent',
    marginTop: SPACING.xs,
  },
  pointsChipText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  sessionDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  noSessionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  noSessionsText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  noSessionsSubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  upcomingCard: {
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: 12,
    elevation: 3,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  upcomingTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  upcomingList: {
    flexDirection: 'row',
  },
  upcomingItem: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    minWidth: 80,
  },
  upcomingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  upcomingSessionTitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  upcomingSessionTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default MySchedule;
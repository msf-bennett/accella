import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Vibration,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  Card,
  ProgressBar,
  Chip,
  Surface,
  Avatar,
  IconButton,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Constants (these should be imported from your constants file)
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4ade80',
  error: '#ef4444',
  warning: '#f59e0b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width } = Dimensions.get('window');

const AthleteAttendanceStats = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, attendanceData, loading } = useSelector(state => ({
    user: state.auth.user,
    attendanceData: state.attendance.data,
    loading: state.attendance.loading,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Mock data - replace with real data from Redux store
  const mockAttendanceData = {
    currentStreak: 12,
    longestStreak: 18,
    totalSessions: 156,
    attendedSessions: 142,
    missedSessions: 14,
    attendanceRate: 91.0,
    weeklyAttendance: [
      { day: 'Mon', attended: true, date: '2024-08-19' },
      { day: 'Tue', attended: true, date: '2024-08-20' },
      { day: 'Wed', attended: false, date: '2024-08-21' },
      { day: 'Thu', attended: true, date: '2024-08-22' },
      { day: 'Fri', attended: true, date: '2024-08-23' },
      { day: 'Sat', attended: true, date: '2024-08-24' },
      { day: 'Sun', attended: false, date: '2024-08-25' },
    ],
    monthlyStats: [
      { month: 'Jan', rate: 88 },
      { month: 'Feb', rate: 92 },
      { month: 'Mar', rate: 85 },
      { month: 'Apr', rate: 94 },
      { month: 'May', rate: 89 },
      { month: 'Jun', rate: 96 },
    ],
    achievements: [
      { id: 1, title: 'Perfect Week', description: '7 days straight', icon: 'local-fire-department', earned: true },
      { id: 2, title: 'Consistency King', description: '30 days 90%+', icon: 'jump-rope', earned: true },
      { id: 3, title: 'Never Give Up', description: '50 sessions', icon: 'fitness-center', earned: false },
    ]
  };

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(true);
    
    // Animate screen entrance
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

    // Load attendance data
    // dispatch(loadAttendanceStats());
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      // dispatch(refreshAttendanceData());
    }, 2000);
  }, []);

  const getStreakColor = (streak) => {
    if (streak >= 15) return COLORS.success;
    if (streak >= 7) return COLORS.warning;
    return COLORS.primary;
  };

  const getAttendanceRateColor = (rate) => {
    if (rate >= 90) return COLORS.success;
    if (rate >= 75) return COLORS.warning;
    return COLORS.error;
  };

  const renderStatsOverview = () => (
    <Card style={styles.statsCard} elevation={4}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.statsGradient}
      >
        <View style={styles.statsHeader}>
          <Avatar.Icon 
            size={40} 
            icon="analytics" 
            style={styles.statsIcon}
            color={COLORS.surface}
          />
          <Text style={styles.statsTitle}>Attendance Overview 📊</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mockAttendanceData.attendanceRate}%</Text>
            <Text style={styles.statLabel}>Attendance Rate</Text>
            <ProgressBar 
              progress={mockAttendanceData.attendanceRate / 100} 
              color={COLORS.surface}
              style={styles.progressBar}
            />
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mockAttendanceData.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak 🔥</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderWeeklyView = () => (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="calendar-view-week" size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>This Week</Text>
        </View>
        
        <View style={styles.weeklyGrid}>
          {mockAttendanceData.weeklyAttendance.map((day, index) => (
            <View key={index} style={styles.dayItem}>
              <Text style={styles.dayLabel}>{day.day}</Text>
              <Surface 
                style={[
                  styles.dayIndicator,
                  { backgroundColor: day.attended ? COLORS.success : COLORS.error }
                ]}
              >
                <Icon 
                  name={day.attended ? "check" : "close"} 
                  size={16} 
                  color={COLORS.surface} 
                />
              </Surface>
            </View>
          ))}
        </View>
        
        <View style={styles.weekSummary}>
          <Chip 
            icon="trending-up" 
            style={styles.chip}
            textStyle={styles.chipText}
          >
            5/7 sessions attended
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  const renderStreakInfo = () => (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="local-fire-department" size={24} color={getStreakColor(mockAttendanceData.currentStreak)} />
          <Text style={styles.sectionTitle}>Streaks & Records</Text>
        </View>
        
        <View style={styles.streakGrid}>
          <Surface style={styles.streakCard}>
            <Text style={[styles.streakValue, { color: getStreakColor(mockAttendanceData.currentStreak) }]}>
              {mockAttendanceData.currentStreak}
            </Text>
            <Text style={styles.streakLabel}>Current Streak</Text>
            <Text style={styles.streakSubtext}>Days in a row! 🔥</Text>
          </Surface>
          
          <Surface style={styles.streakCard}>
            <Text style={[styles.streakValue, { color: COLORS.warning }]}>
              {mockAttendanceData.longestStreak}
            </Text>
            <Text style={styles.streakLabel}>Personal Best</Text>
            <Text style={styles.streakSubtext}>Keep pushing! 💪</Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  const renderMonthlyTrend = () => (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="show-chart" size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Monthly Trends</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.monthlyContainer}>
            {mockAttendanceData.monthlyStats.map((month, index) => (
              <View key={index} style={styles.monthItem}>
                <Text style={styles.monthLabel}>{month.month}</Text>
                <View style={styles.monthBarContainer}>
                  <View 
                    style={[
                      styles.monthBar,
                      { 
                        height: (month.rate / 100) * 80,
                        backgroundColor: getAttendanceRateColor(month.rate)
                      }
                    ]}
                  />
                </View>
                <Text style={styles.monthValue}>{month.rate}%</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="jump-rope" size={24} color={COLORS.warning} />
          <Text style={styles.sectionTitle}>Achievements</Text>
        </View>
        
        {mockAttendanceData.achievements.map((achievement) => (
          <Surface 
            key={achievement.id} 
            style={[
              styles.achievementItem,
              { opacity: achievement.earned ? 1 : 0.6 }
            ]}
          >
            <Avatar.Icon 
              size={40} 
              icon={achievement.icon}
              style={[
                styles.achievementIcon,
                { backgroundColor: achievement.earned ? COLORS.success : COLORS.textSecondary }
              ]}
            />
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
            </View>
            {achievement.earned && (
              <Icon name="check-circle" size={24} color={COLORS.success} />
            )}
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Surface style={styles.actionButton} elevation={2}>
        <IconButton
          icon="calendar-today"
          size={24}
          iconColor={COLORS.primary}
          onPress={() => {
            Vibration.vibrate(50);
            navigation.navigate('TrainingSchedule');
          }}
        />
        <Text style={styles.actionLabel}>Schedule</Text>
      </Surface>
      
      <Surface style={styles.actionButton} elevation={2}>
        <IconButton
          icon="history"
          size={24}
          iconColor={COLORS.primary}
          onPress={() => {
            Vibration.vibrate(50);
            // navigation.navigate('AttendanceHistory');
          }}
        />
        <Text style={styles.actionLabel}>History</Text>
      </Surface>
      
      <Surface style={styles.actionButton} elevation={2}>
        <IconButton
          icon="insights"
          size={24}
          iconColor={COLORS.primary}
          onPress={() => {
            Vibration.vibrate(50);
            // navigation.navigate('DetailedStats');
          }}
        />
        <Text style={styles.actionLabel}>Insights</Text>
      </Surface>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            size={24}
            iconColor={COLORS.surface}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Attendance Stats</Text>
          <IconButton
            icon="share"
            size={24}
            iconColor={COLORS.surface}
            onPress={() => Vibration.vibrate(50)}
          />
        </View>
      </LinearGradient>

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
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {renderStatsOverview()}
          {renderWeeklyView()}
          {renderStreakInfo()}
          {renderMonthlyTrend()}
          {renderAchievements()}
          {renderQuickActions()}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.surface,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  statsCard: {
    marginVertical: SPACING.sm,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statsIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: SPACING.md,
  },
  statsTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.surface,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: '100%',
  },
  card: {
    marginVertical: SPACING.sm,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  dayItem: {
    alignItems: 'center',
  },
  dayLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  dayIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  weekSummary: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  chip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  streakGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  streakCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    elevation: 1,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  streakLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  streakSubtext: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  monthlyContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  monthItem: {
    alignItems: 'center',
    width: 50,
  },
  monthLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  monthBarContainer: {
    height: 80,
    width: 20,
    backgroundColor: COLORS.border,
    borderRadius: 10,
    justifyContent: 'flex-end',
    marginBottom: SPACING.sm,
  },
  monthBar: {
    width: '100%',
    borderRadius: 10,
    minHeight: 4,
  },
  monthValue: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    elevation: 1,
  },
  achievementIcon: {
    marginRight: SPACING.md,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    ...TEXT_STYLES.caption,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.lg,
  },
  actionButton: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    minWidth: 80,
  },
  actionLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default AthleteAttendanceStats;
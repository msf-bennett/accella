import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Alert,
  Dimensions,
  TouchableOpacity,
  Animated,
  FlatList,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design System Imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#e91e63',
  info: '#2196F3',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 14, color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PerformanceDashboard = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, clients, sessions, analytics, isLoading, notifications } = useSelector(state => state.trainer);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  const animatedValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.spring(animatedValue, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = useCallback(async () => {
    try {
      // Simulate API calls - replace with actual data loading
      console.log('Loading dashboard data...');
      // dispatch(fetchDashboardData({ period: selectedPeriod }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  }, [selectedPeriod, dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  // Mock data for demonstration
  const mockDashboardData = {
    todayStats: {
      sessionsCompleted: 8,
      totalSessions: 12,
      revenue: 450,
      newClients: 2,
    },
    weeklyGoals: {
      sessions: { current: 45, target: 60 },
      revenue: { current: 2800, target: 3500 },
      clients: { current: 32, target: 40 },
    },
    recentActivity: [
      { id: 1, type: 'session', client: 'John Doe', action: 'Completed workout', time: '2 hours ago', status: 'success' },
      { id: 2, type: 'booking', client: 'Sarah Smith', action: 'Booked session', time: '3 hours ago', status: 'info' },
      { id: 3, type: 'payment', client: 'Mike Johnson', action: 'Payment received', time: '4 hours ago', status: 'success' },
      { id: 4, type: 'feedback', client: 'Emma Wilson', action: 'Left feedback (5★)', time: '6 hours ago', status: 'warning' },
    ],
    upcomingSessions: [
      { id: 1, client: 'Alex Brown', time: '2:00 PM', type: 'Strength Training', status: 'confirmed' },
      { id: 2, client: 'Lisa Davis', time: '3:30 PM', type: 'HIIT Workout', status: 'pending' },
      { id: 3, client: 'Tom Wilson', time: '5:00 PM', type: 'Flexibility', status: 'confirmed' },
    ],
    clientAlerts: [
      { id: 1, client: 'Jennifer Lee', type: 'missed', message: 'Missed 2 sessions this week', priority: 'high' },
      { id: 2, client: 'David Chen', type: 'progress', message: 'Achieved weight loss goal!', priority: 'low' },
      { id: 3, client: 'Maria Garcia', type: 'payment', message: 'Payment overdue by 3 days', priority: 'medium' },
    ],
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Performance Hub</Text>
            <Text style={styles.headerSubtitle}>🚀 Your coaching command center</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications" size={24} color="white" />
            {notifications?.length > 0 && (
              <Badge size={18} style={styles.notificationBadge}>
                {notifications.length}
              </Badge>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderPeriodTabs = () => (
    <View style={styles.periodTabs}>
      {['today', 'week', 'month', 'quarter'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodTab,
            selectedPeriod === period && styles.selectedPeriodTab
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodTabText,
            selectedPeriod === period && styles.selectedPeriodTabText
          ]}>
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTodayOverview = () => (
    <Card style={styles.overviewCard}>
      <Card.Content>
        <View style={styles.overviewHeader}>
          <Text style={TEXT_STYLES.h3}>Today's Snapshot</Text>
          <Chip icon="today" compact>
            {new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </Chip>
        </View>
        
        <View style={styles.todayGrid}>
          <Surface style={[styles.todayCard, { backgroundColor: COLORS.success }]}>
            <Icon name="check-circle" size={24} color="white" />
            <Text style={styles.todayNumber}>
              {mockDashboardData.todayStats.sessionsCompleted}/{mockDashboardData.todayStats.totalSessions}
            </Text>
            <Text style={styles.todayLabel}>Sessions</Text>
          </Surface>
          
          <Surface style={[styles.todayCard, { backgroundColor: COLORS.primary }]}>
            <Icon name="attach-money" size={24} color="white" />
            <Text style={styles.todayNumber}>${mockDashboardData.todayStats.revenue}</Text>
            <Text style={styles.todayLabel}>Revenue</Text>
          </Surface>
          
          <Surface style={[styles.todayCard, { backgroundColor: COLORS.accent }]}>
            <Icon name="person-add" size={24} color="white" />
            <Text style={styles.todayNumber}>{mockDashboardData.todayStats.newClients}</Text>
            <Text style={styles.todayLabel}>New Clients</Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  const renderWeeklyGoals = () => (
    <Card style={styles.goalsCard}>
      <Card.Content>
        <View style={styles.goalsHeader}>
          <Text style={TEXT_STYLES.h3}>Weekly Goals</Text>
          <Chip icon="flag" compact mode="outlined">Progress</Chip>
        </View>
        
        <View style={styles.goalsList}>
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Icon name="fitness-center" size={20} color={COLORS.primary} />
              <Text style={styles.goalTitle}>Sessions</Text>
              <Text style={styles.goalNumbers}>
                {mockDashboardData.weeklyGoals.sessions.current}/{mockDashboardData.weeklyGoals.sessions.target}
              </Text>
            </View>
            <ProgressBar
              progress={mockDashboardData.weeklyGoals.sessions.current / mockDashboardData.weeklyGoals.sessions.target}
              color={COLORS.primary}
              style={styles.goalProgress}
            />
          </View>
          
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Icon name="monetization-on" size={20} color={COLORS.success} />
              <Text style={styles.goalTitle}>Revenue</Text>
              <Text style={styles.goalNumbers}>
                ${mockDashboardData.weeklyGoals.revenue.current}/${mockDashboardData.weeklyGoals.revenue.target}
              </Text>
            </View>
            <ProgressBar
              progress={mockDashboardData.weeklyGoals.revenue.current / mockDashboardData.weeklyGoals.revenue.target}
              color={COLORS.success}
              style={styles.goalProgress}
            />
          </View>
          
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Icon name="people" size={20} color={COLORS.accent} />
              <Text style={styles.goalTitle}>Active Clients</Text>
              <Text style={styles.goalNumbers}>
                {mockDashboardData.weeklyGoals.clients.current}/{mockDashboardData.weeklyGoals.clients.target}
              </Text>
            </View>
            <ProgressBar
              progress={mockDashboardData.weeklyGoals.clients.current / mockDashboardData.weeklyGoals.clients.target}
              color={COLORS.accent}
              style={styles.goalProgress}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderUpcomingSessions = () => (
    <Card style={styles.sessionsCard}>
      <Card.Content>
        <View style={styles.sessionsHeader}>
          <Text style={TEXT_STYLES.h3}>Upcoming Sessions</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Sessions')}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Icon name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.sessionsList}>
          {mockDashboardData.upcomingSessions.map((session) => (
            <Surface key={session.id} style={styles.sessionItem}>
              <View style={styles.sessionTime}>
                <Text style={styles.sessionTimeText}>{session.time}</Text>
                <View style={[
                  styles.sessionStatus,
                  { backgroundColor: session.status === 'confirmed' ? COLORS.success : COLORS.warning }
                ]}>
                  <Text style={styles.sessionStatusText}>
                    {session.status}
                  </Text>
                </View>
              </View>
              <View style={styles.sessionDetails}>
                <Text style={TEXT_STYLES.h3}>{session.client}</Text>
                <Text style={TEXT_STYLES.caption}>{session.type}</Text>
              </View>
              <TouchableOpacity style={styles.sessionAction}>
                <Icon name="dots-vertical" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </Surface>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.quickActionsCard}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>⚡ Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('DataVisualization')}
          >
            <Surface style={[styles.actionButton, { backgroundColor: COLORS.primary }]}>
              <Icon name="analytics" size={24} color="white" />
            </Surface>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => Alert.alert('Schedule', 'Feature coming soon! 📅')}
          >
            <Surface style={[styles.actionButton, { backgroundColor: COLORS.success }]}>
              <Icon name="schedule" size={24} color="white" />
            </Surface>
            <Text style={styles.actionText}>Schedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => Alert.alert('Reports', 'Feature coming soon! 📊')}
          >
            <Surface style={[styles.actionButton, { backgroundColor: COLORS.accent }]}>
              <Icon name="assessment" size={24} color="white" />
            </Surface>
            <Text style={styles.actionText}>Reports</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => Alert.alert('Clients', 'Feature coming soon! 👥')}
          >
            <Surface style={[styles.actionButton, { backgroundColor: COLORS.warning }]}>
              <Icon name="group" size={24} color="white" />
            </Surface>
            <Text style={styles.actionText}>Clients</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderClientAlerts = () => (
    <Card style={styles.alertsCard}>
      <Card.Content>
        <View style={styles.alertsHeader}>
          <Text style={TEXT_STYLES.h3}>🚨 Client Alerts</Text>
          <Chip 
            icon="priority-high" 
            compact 
            style={{ backgroundColor: mockDashboardData.clientAlerts.filter(a => a.priority === 'high').length > 0 ? COLORS.error : COLORS.success }}
          >
            {mockDashboardData.clientAlerts.filter(a => a.priority === 'high').length || 0} High
          </Chip>
        </View>
        
        <View style={styles.alertsList}>
          {mockDashboardData.clientAlerts.map((alert) => (
            <Surface key={alert.id} style={styles.alertItem}>
              <View style={[
                styles.alertIndicator,
                { backgroundColor: 
                  alert.priority === 'high' ? COLORS.error :
                  alert.priority === 'medium' ? COLORS.warning : COLORS.success
                }
              ]} />
              <View style={styles.alertContent}>
                <Text style={TEXT_STYLES.h3}>{alert.client}</Text>
                <Text style={TEXT_STYLES.caption}>{alert.message}</Text>
              </View>
              <TouchableOpacity style={styles.alertAction}>
                <Icon name="arrow-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </Surface>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderRecentActivity = () => (
    <Card style={styles.activityCard}>
      <Card.Content>
        <Text style={TEXT_STYLES.h3}>Recent Activity</Text>
        <View style={styles.activityList}>
          {mockDashboardData.recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={[
                styles.activityIcon,
                { backgroundColor: 
                  activity.status === 'success' ? COLORS.success :
                  activity.status === 'info' ? COLORS.info :
                  activity.status === 'warning' ? COLORS.warning : COLORS.primary
                }
              ]}>
                <Icon 
                  name={
                    activity.type === 'session' ? 'fitness-center' :
                    activity.type === 'booking' ? 'event' :
                    activity.type === 'payment' ? 'payment' : 'star'
                  } 
                  size={16} 
                  color="white" 
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={TEXT_STYLES.body}>
                  <Text style={TEXT_STYLES.h3}>{activity.client}</Text> {activity.action}
                </Text>
                <Text style={TEXT_STYLES.caption}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Searchbar
          placeholder="Search clients, sessions, or data..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          icon="dashboard"
        />

        {renderPeriodTabs()}
        
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {renderTodayOverview()}
          {renderWeeklyGoals()}
          {renderUpcomingSessions()}
          {renderQuickActions()}
          {renderClientAlerts()}
          {renderRecentActivity()}
        </Animated.View>
        
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => setShowQuickActions(true)}
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: SPACING.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
  },
  scrollView: {
    flex: 1,
  },
  searchbar: {
    margin: SPACING.md,
    elevation: 2,
  },
  periodTabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  periodTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    elevation: 1,
  },
  selectedPeriodTab: {
    backgroundColor: COLORS.primary,
  },
  periodTabText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  selectedPeriodTabText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: SPACING.md,
  },
  overviewCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  todayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todayCard: {
    flex: 0.3,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  todayNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginVertical: SPACING.xs,
  },
  todayLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  goalsCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  goalsList: {
    gap: SPACING.md,
  },
  goalItem: {
    marginBottom: SPACING.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  goalTitle: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  goalNumbers: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  goalProgress: {
    height: 6,
    borderRadius: 3,
  },
  sessionsCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  sessionsList: {
    gap: SPACING.sm,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    elevation: 1,
  },
  sessionTime: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sessionTimeText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  sessionStatus: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: SPACING.xs,
  },
  sessionStatusText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontSize: 10,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionAction: {
    padding: SPACING.xs,
  },
  quickActionsCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    flex: 0.22,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    marginBottom: SPACING.xs,
  },
  actionText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  alertsCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  alertsList: {
    gap: SPACING.sm,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    elevation: 1,
  },
  alertIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  alertContent: {
    flex: 1,
  },
  alertAction: {
    padding: SPACING.xs,
  },
  activityCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  activityList: {
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default PerformanceDashboard;
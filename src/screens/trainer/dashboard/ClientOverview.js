import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
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
  Text,
  Divider,
  List,
  Badge,
  DataTable,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const ClientOverview = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const clientId = route?.params?.clientId || '1'; // Default for demo
  
  const { user, clients, clientProgress, loading } = useSelector(state => ({
    user: state.auth.user,
    clients: state.trainer.clients || [],
    clientProgress: state.progress.clientData || {},
    loading: state.progress.loading,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, progress, sessions, nutrition
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const tabSlideAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    loadClientData();
  }, [clientId]);

  const loadClientData = useCallback(async () => {
    try {
      // Simulate API call for loading client data
      console.log('Loading client data for:', clientId);
    } catch (error) {
      Alert.alert('Error', 'Failed to load client data');
    }
  }, [clientId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadClientData();
    setRefreshing(false);
  }, [loadClientData]);

  // Mock client data for demonstration
  const mockClient = {
    id: '1',
    name: 'John Doe',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    email: 'john@example.com',
    phone: '+1234567890',
    age: 28,
    gender: 'Male',
    height: '5\'10"',
    weight: 185,
    joinDate: '2024-01-15',
    program: 'Weight Loss Program',
    trainer: 'Sarah Johnson',
    status: 'active',
    attendanceRate: 85,
    totalSessions: 45,
    completedSessions: 38,
    upcomingSessions: 7,
    currentStreak: 5,
    longestStreak: 12,
    goals: [
      { id: 1, title: 'Lose 20 lbs', target: 165, current: 185, unit: 'lbs', progress: 0, type: 'weight' },
      { id: 2, title: 'Run 5K', target: 30, current: 45, unit: 'min', progress: 50, type: 'cardio' },
      { id: 3, title: 'Bench Press', target: 200, current: 150, unit: 'lbs', progress: 60, type: 'strength' },
    ],
    measurements: {
      weight: [
        { date: '2024-01-15', value: 200 },
        { date: '2024-02-15', value: 195 },
        { date: '2024-03-15', value: 190 },
        { date: '2024-04-15', value: 187 },
        { date: '2024-05-15', value: 185 },
      ],
      bodyFat: [
        { date: '2024-01-15', value: 22 },
        { date: '2024-02-15', value: 20.5 },
        { date: '2024-03-15', value: 19 },
        { date: '2024-04-15', value: 18.2 },
        { date: '2024-05-15', value: 17.5 },
      ],
    },
    recentSessions: [
      {
        id: 1,
        date: '2024-08-19',
        type: 'Strength Training',
        duration: 60,
        exercises: 8,
        calories: 450,
        rating: 5,
        notes: 'Great session! Increased bench press weight.'
      },
      {
        id: 2,
        date: '2024-08-17',
        type: 'Cardio',
        duration: 45,
        exercises: 5,
        calories: 380,
        rating: 4,
        notes: 'Good cardio session, felt strong throughout.'
      },
      {
        id: 3,
        date: '2024-08-15',
        type: 'HIIT',
        duration: 30,
        exercises: 6,
        calories: 320,
        rating: 5,
        notes: 'Intense HIIT workout, loved the challenge!'
      },
    ],
  };

  const handleEditClient = () => {
    setShowEditModal(true);
  };

  const handleViewProgress = () => {
    setShowProgressModal(true);
  };

  const handleManageGoals = () => {
    setShowGoalsModal(true);
  };

  const handleMessageClient = () => {
    Alert.alert(
      'Feature Coming Soon',
      'Direct messaging with clients will be available soon!',
      [{ text: 'OK' }]
    );
  };

  const handleCallClient = () => {
    Alert.alert(
      'Call Client',
      `Call ${mockClient.name} at ${mockClient.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Calling:', mockClient.phone) }
      ]
    );
  };

  const handleScheduleSession = () => {
    Alert.alert(
      'Feature Coming Soon',
      'Session scheduling will be available soon!',
      [{ text: 'OK' }]
    );
  };

  const renderClientHeader = () => (
    <Card style={styles.headerCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.clientHeaderContent}>
          <Avatar.Image
            size={80}
            source={{ uri: mockClient.avatar }}
            style={styles.clientAvatar}
          />
          <View style={styles.clientHeaderInfo}>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              {mockClient.name}
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
              {mockClient.program}
            </Text>
            <View style={styles.clientBadges}>
              <Chip
                style={styles.statusChip}
                textStyle={{ color: 'white', fontSize: 12 }}
              >
                {mockClient.status.toUpperCase()}
              </Chip>
              <Chip
                style={[styles.statusChip, { marginLeft: SPACING.xs }]}
                textStyle={{ color: 'white', fontSize: 12 }}
              >
                {mockClient.attendanceRate}% ATTENDANCE
              </Chip>
            </View>
          </View>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              {mockClient.totalSessions}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Total Sessions
            </Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              {mockClient.currentStreak}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Current Streak
            </Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              {mockClient.goals.filter(g => g.progress >= 100).length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Goals Achieved
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <IconButton
            icon="message"
            size={20}
            iconColor="white"
            style={styles.headerActionBtn}
            onPress={handleMessageClient}
          />
          <IconButton
            icon="phone"
            size={20}
            iconColor="white"
            style={styles.headerActionBtn}
            onPress={handleCallClient}
          />
          <IconButton
            icon="edit"
            size={20}
            iconColor="white"
            style={styles.headerActionBtn}
            onPress={handleEditClient}
          />
        </View>
      </LinearGradient>
    </Card>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'overview', label: 'Overview', icon: 'dashboard' },
        { key: 'progress', label: 'Progress', icon: 'trending-up' },
        { key: 'sessions', label: 'Sessions', icon: 'fitness-center' },
        { key: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
      ].map((tab, index) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabItem,
            activeTab === tab.key && styles.activeTab
          ]}
          onPress={() => {
            setActiveTab(tab.key);
            Animated.spring(tabSlideAnim, {
              toValue: index,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Icon
            name={tab.icon}
            size={20}
            color={activeTab === tab.key ? COLORS.primary : COLORS.secondary}
          />
          <Text
            style={[
              TEXT_STYLES.caption,
              {
                color: activeTab === tab.key ? COLORS.primary : COLORS.secondary,
                fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              }
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Client Details Card */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h4}>Client Details</Text>
            <IconButton
              icon="edit"
              size={20}
              onPress={handleEditClient}
            />
          </View>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Age</Text>
              <Text style={styles.detailValue}>{mockClient.age}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Gender</Text>
              <Text style={styles.detailValue}>{mockClient.gender}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Height</Text>
              <Text style={styles.detailValue}>{mockClient.height}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailValue}>{mockClient.weight} lbs</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Join Date</Text>
              <Text style={styles.detailValue}>
                {new Date(mockClient.joinDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <Chip
                style={{
                  backgroundColor: COLORS.success + '20',
                  borderColor: COLORS.success,
                  borderWidth: 1,
                }}
                textStyle={{ color: COLORS.success, fontSize: 10 }}
              >
                {mockClient.status.toUpperCase()}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Goals Progress Card */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h4}>Current Goals</Text>
            <IconButton
              icon="add"
              size={20}
              onPress={handleManageGoals}
            />
          </View>
          
          {mockClient.goals.map((goal) => (
            <View key={goal.id} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={TEXT_STYLES.body}>{goal.title}</Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                  {goal.current} / {goal.target} {goal.unit}
                </Text>
              </View>
              <View style={styles.goalProgress}>
                <ProgressBar
                  progress={goal.progress / 100}
                  color={
                    goal.progress >= 80 ? COLORS.success :
                    goal.progress >= 50 ? COLORS.warning : COLORS.primary
                  }
                  style={styles.goalProgressBar}
                />
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm }]}>
                  {goal.progress}%
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Recent Activity Card */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h4}>Recent Sessions</Text>
            <IconButton
              icon="arrow-forward"
              size={20}
              onPress={() => setActiveTab('sessions')}
            />
          </View>
          
          {mockClient.recentSessions.slice(0, 3).map((session) => (
            <View key={session.id} style={styles.sessionItem}>
              <View style={styles.sessionHeader}>
                <Text style={TEXT_STYLES.body}>{session.type}</Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                  {new Date(session.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.sessionStats}>
                <View style={styles.sessionStat}>
                  <Icon name="access-time" size={16} color={COLORS.secondary} />
                  <Text style={styles.sessionStatText}>{session.duration}min</Text>
                </View>
                <View style={styles.sessionStat}>
                  <Icon name="fitness-center" size={16} color={COLORS.secondary} />
                  <Text style={styles.sessionStatText}>{session.exercises} exercises</Text>
                </View>
                <View style={styles.sessionStat}>
                  <Icon name="local-fire-department" size={16} color={COLORS.secondary} />
                  <Text style={styles.sessionStatText}>{session.calories} cal</Text>
                </View>
                <View style={styles.sessionRating}>
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      name="star"
                      size={14}
                      color={i < session.rating ? COLORS.warning : COLORS.background}
                    />
                  ))}
                </View>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  const renderProgressTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h4}>Progress Tracking</Text>
            <View style={styles.progressControls}>
              <Chip
                selected={selectedMetric === 'weight'}
                onPress={() => setSelectedMetric('weight')}
                style={styles.metricChip}
              >
                Weight
              </Chip>
              <Chip
                selected={selectedMetric === 'bodyFat'}
                onPress={() => setSelectedMetric('bodyFat')}
                style={styles.metricChip}
              >
                Body Fat
              </Chip>
            </View>
          </View>
          
          <View style={styles.progressChart}>
            <Text style={[TEXT_STYLES.h2, { textAlign: 'center', color: COLORS.primary }]}>
              📊
            </Text>
            <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.md }]}>
              Progress Chart Coming Soon
            </Text>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center', color: COLORS.secondary }]}>
              Advanced analytics and visualizations will be available soon
            </Text>
          </View>

          <View style={styles.progressData}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
              Recent {selectedMetric === 'weight' ? 'Weight' : 'Body Fat'} Data:
            </Text>
            {mockClient.measurements[selectedMetric].slice(-3).map((measurement, index) => (
              <View key={index} style={styles.measurementItem}>
                <Text style={TEXT_STYLES.body}>
                  {new Date(measurement.date).toLocaleDateString()}
                </Text>
                <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                  {measurement.value} {selectedMetric === 'weight' ? 'lbs' : '%'}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderSessionsTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h4}>Session History</Text>
            <Button
              mode="outlined"
              onPress={handleScheduleSession}
              icon="add"
              compact
            >
              Schedule
            </Button>
          </View>
          
          <FlatList
            data={mockClient.recentSessions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: session }) => (
              <Card style={styles.sessionCard}>
                <Card.Content>
                  <View style={styles.sessionCardHeader}>
                    <View>
                      <Text style={TEXT_STYLES.body}>{session.type}</Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                        {new Date(session.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.sessionRating}>
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          name="star"
                          size={16}
                          color={i < session.rating ? COLORS.warning : COLORS.background}
                        />
                      ))}
                    </View>
                  </View>
                  
                  <View style={styles.sessionMetrics}>
                    <View style={styles.sessionMetric}>
                      <Icon name="access-time" size={18} color={COLORS.primary} />
                      <Text style={styles.metricValue}>{session.duration}min</Text>
                    </View>
                    <View style={styles.sessionMetric}>
                      <Icon name="fitness-center" size={18} color={COLORS.primary} />
                      <Text style={styles.metricValue}>{session.exercises}</Text>
                    </View>
                    <View style={styles.sessionMetric}>
                      <Icon name="local-fire-department" size={18} color={COLORS.primary} />
                      <Text style={styles.metricValue}>{session.calories}</Text>
                    </View>
                  </View>
                  
                  {session.notes && (
                    <View style={styles.sessionNotes}>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                        Notes: {session.notes}
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            )}
            scrollEnabled={false}
          />
        </Card.Content>
      </Card>
    </View>
  );

  const renderNutritionTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.h4}>Nutrition & Recovery</Text>
            <IconButton
              icon="add"
              size={20}
              onPress={() => Alert.alert('Feature Coming Soon', 'Nutrition tracking will be available soon!')}
            />
          </View>
          
          <View style={styles.comingSoonContainer}>
            <Icon name="restaurant" size={64} color={COLORS.secondary} />
            <Text style={[TEXT_STYLES.h4, { color: COLORS.secondary, marginTop: SPACING.md }]}>
              Nutrition Tracking
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary, textAlign: 'center' }]}>
              Meal planning, calorie tracking, and recovery recommendations coming soon!
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderEditModal = () => (
    <Portal>
      <Modal
        visible={showEditModal}
        onDismiss={() => setShowEditModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={TEXT_STYLES.h3}>Edit Client</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowEditModal(false)}
                />
              </View>
              
              <View style={styles.comingSoonContainer}>
                <Icon name="edit" size={48} color={COLORS.secondary} />
                <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.md }]}>
                  Client editing functionality will be available soon!
                </Text>
              </View>
            </Card.Content>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <View style={styles.header}>
        <IconButton
          icon="arrow-back"
          size={24}
          iconColor="white"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>

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
          {renderClientHeader()}
          {renderTabBar()}
          
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'progress' && renderProgressTab()}
          {activeTab === 'sessions' && renderSessionsTab()}
          {activeTab === 'nutrition' && renderNutritionTab()}
        </ScrollView>
      </Animated.View>

      {renderEditModal()}

      <FAB
        icon="schedule"
        style={styles.fab}
        onPress={handleScheduleSession}
        label="Schedule Session"
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    position: 'absolute',
    top: StatusBar.currentHeight + SPACING.md,
    left: SPACING.md,
    zIndex: 1000,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    flex: 1,
  },
  headerCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: SPACING.lg,
    paddingTop: StatusBar.currentHeight + SPACING.xl,
  },
  clientHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  clientAvatar: {
    marginRight: SPACING.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  clientHeaderInfo: {
    flex: 1,
  },
  clientBadges: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  statusChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 24,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  quickStatItem: {
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  headerActionBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    margin: 0,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    padding: SPACING.xs,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary + '20',
  },
  tabContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  sectionCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  detailLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  goalItem: {
    marginBottom: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalProgressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  sessionItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sessionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionStatText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.secondary,
  },
  sessionRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressControls: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  metricChip: {
    height: 32,
  },
  progressChart: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  progressData: {
    marginTop: SPACING.md,
  },
  measurementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  sessionCard: {
    marginBottom: SPACING.sm,
    elevation: 1,
    borderRadius: 8,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  sessionMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  sessionMetric: {
    alignItems: 'center',
  },
  metricValue: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    fontWeight: 'bold',
  },
  sessionNotes: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    borderRadius: 16,
    elevation: 8,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
};

export default ClientOverview;
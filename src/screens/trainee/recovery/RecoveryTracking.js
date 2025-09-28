import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  Vibration,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const RecoveryTracking = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const recoveryData = useSelector(state => state.recovery.data);
  const isLoading = useSelector(state => state.recovery.isLoading);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Mock data for demonstration - Fixed syntax error
  const [recoveryMetrics, setRecoveryMetrics] = useState({
    sleepQuality: 7.5,
    muscleRecovery: 8.2,
    energyLevel: 6.8,
    stressLevel: 4.2,
    hydration: 85,
    heartRateVariability: 42,
    restingHeartRate: 68,
  });

  const [sleepData, setSleepData] = useState({
    duration: 7.5,
    deepSleep: 1.8,
    remSleep: 1.2,
    efficiency: 89,
    bedTime: '22:30',
    wakeTime: '06:00',
  });

  const [recoveryActivities, setRecoveryActivities] = useState([
    {
      id: 1,
      type: 'stretching',
      name: 'Morning Yoga Flow',
      duration: 20,
      completed: true,
      points: 15,
      icon: 'self-improvement',
    },
    {
      id: 2,
      type: 'meditation',
      name: 'Mindfulness Session',
      duration: 10,
      completed: false,
      points: 10,
      icon: 'psychology',
    },
    {
      id: 3,
      type: 'massage',
      name: 'Foam Rolling',
      duration: 15,
      completed: true,
      points: 12,
      icon: 'spa',
    },
  ]);

  const [weeklyProgress, setWeeklyProgress] = useState([
    { day: 'Mon', score: 8.2 },
    { day: 'Tue', score: 7.8 },
    { day: 'Wed', score: 8.5 },
    { day: 'Thu', score: 7.9 },
    { day: 'Fri', score: 8.1 },
    { day: 'Sat', score: 8.7 },
    { day: 'Sun', score: 8.3 },
  ]);

  // Effects
  useEffect(() => {
    // Entrance animations
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchRecoveryData());
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh recovery data');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleMetricUpdate = useCallback((metric, value) => {
    setRecoveryMetrics(prev => ({
      ...prev,
      [metric]: value,
    }));
    Vibration.vibrate([50, 50]);
  }, []);

  const handleActivityToggle = useCallback((activityId) => {
    setRecoveryActivities(prev =>
      prev.map(activity =>
        activity.id === activityId
          ? { ...activity, completed: !activity.completed }
          : activity
      )
    );
    Vibration.vibrate(100);
  }, []);

  const openModal = useCallback((type) => {
    setModalType(type);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalType('');
  }, []);

  // Calculate overall recovery score
  const overallScore = Math.round(
    (recoveryMetrics.sleepQuality +
     recoveryMetrics.muscleRecovery +
     recoveryMetrics.energyLevel +
     (10 - recoveryMetrics.stressLevel)) / 4 * 10
  ) / 10;

  const getScoreColor = (score) => {
    if (score >= 8) return COLORS.success;
    if (score >= 6) return '#FFA726';
    return COLORS.error;
  };

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      {['overview', 'sleep', 'activities', 'insights'].map((tab) => (
        <Button
          key={tab}
          mode={activeTab === tab ? 'contained' : 'outlined'}
          onPress={() => setActiveTab(tab)}
          style={[
            styles.tabButton,
            activeTab === tab && { backgroundColor: COLORS.primary }
          ]}
          labelStyle={[
            styles.tabLabel,
            activeTab === tab && { color: 'white' }
          ]}
          compact
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </Button>
      ))}
    </View>
  );

  const renderOverviewTab = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      {/* Overall Recovery Score */}
      <Card style={styles.scoreCard}>
        <LinearGradient
          colors={[COLORS.primary, '#764ba2']}
          style={styles.scoreGradient}
        >
          <Text style={styles.scoreTitle}>Recovery Score</Text>
          <Text style={styles.scoreValue}>{overallScore}/10</Text>
          <Text style={styles.scoreSubtitle}>
            {overallScore >= 8 ? '🎉 Excellent!' : overallScore >= 6 ? '👍 Good' : '⚠️ Needs Attention'}
          </Text>
        </LinearGradient>
      </Card>

      {/* Key Metrics */}
      <Card style={styles.metricsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📊 Key Metrics</Text>
          
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Icon name="bedtime" size={24} color={COLORS.primary} />
              <Text style={styles.metricLabel}>Sleep Quality</Text>
              <Text style={[styles.metricValue, { color: getScoreColor(recoveryMetrics.sleepQuality) }]}>
                {recoveryMetrics.sleepQuality}/10
              </Text>
            </View>
            
            <View style={styles.metricItem}>
              <Icon name="fitness-center" size={24} color={COLORS.primary} />
              <Text style={styles.metricLabel}>Muscle Recovery</Text>
              <Text style={[styles.metricValue, { color: getScoreColor(recoveryMetrics.muscleRecovery) }]}>
                {recoveryMetrics.muscleRecovery}/10
              </Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Icon name="battery-charging-full" size={24} color={COLORS.primary} />
              <Text style={styles.metricLabel}>Energy Level</Text>
              <Text style={[styles.metricValue, { color: getScoreColor(recoveryMetrics.energyLevel) }]}>
                {recoveryMetrics.energyLevel}/10
              </Text>
            </View>
            
            <View style={styles.metricItem}>
              <Icon name="water-drop" size={24} color={COLORS.primary} />
              <Text style={styles.metricLabel}>Hydration</Text>
              <Text style={[styles.metricValue, { color: getScoreColor(recoveryMetrics.hydration / 10) }]}>
                {recoveryMetrics.hydration}%
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Weekly Progress Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📈 Weekly Progress</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chartContainer}>
              {weeklyProgress.map((day, index) => (
                <View key={day.day} style={styles.chartBar}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (day.score / 10) * 100,
                        backgroundColor: getScoreColor(day.score),
                      }
                    ]}
                  />
                  <Text style={styles.chartLabel}>{day.day}</Text>
                  <Text style={styles.chartValue}>{day.score}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <Surface style={styles.quickActionCard}>
            <IconButton
              icon="bedtime"
              size={32}
              iconColor={COLORS.primary}
              onPress={() => openModal('sleep')}
            />
            <Text style={styles.quickActionLabel}>Log Sleep</Text>
          </Surface>
          
          <Surface style={styles.quickActionCard}>
            <IconButton
              icon="self-improvement"
              size={32}
              iconColor={COLORS.primary}
              onPress={() => openModal('recovery')}
            />
            <Text style={styles.quickActionLabel}>Add Recovery</Text>
          </Surface>
          
          <Surface style={styles.quickActionCard}>
            <IconButton
              icon="insights"
              size={32}
              iconColor={COLORS.primary}
              onPress={() => setActiveTab('insights')}
            />
            <Text style={styles.quickActionLabel}>View Insights</Text>
          </Surface>
          
          <Surface style={styles.quickActionCard}>
            <IconButton
              icon="favorite"
              size={32}
              iconColor={COLORS.error}
              onPress={() => openModal('hrv')}
            />
            <Text style={styles.quickActionLabel}>HRV Check</Text>
          </Surface>
        </View>
      </View>
    </Animated.View>
  );

  const renderSleepTab = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      <Card style={styles.sleepCard}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.sleepHeader}
        >
          <Icon name="bedtime" size={32} color="white" />
          <Text style={styles.sleepTitle}>Sleep Tracking</Text>
        </LinearGradient>
        
        <Card.Content style={styles.sleepContent}>
          <View style={styles.sleepStatsRow}>
            <View style={styles.sleepStat}>
              <Text style={styles.sleepStatValue}>{sleepData.duration}h</Text>
              <Text style={styles.sleepStatLabel}>Total Sleep</Text>
            </View>
            
            <View style={styles.sleepStat}>
              <Text style={styles.sleepStatValue}>{sleepData.efficiency}%</Text>
              <Text style={styles.sleepStatLabel}>Efficiency</Text>
            </View>
            
            <View style={styles.sleepStat}>
              <Text style={styles.sleepStatValue}>{sleepData.deepSleep}h</Text>
              <Text style={styles.sleepStatLabel}>Deep Sleep</Text>
            </View>
          </View>

          <View style={styles.sleepPhases}>
            <Text style={styles.sleepPhasesTitle}>Sleep Phases</Text>
            <View style={styles.sleepPhaseBar}>
              <View style={[styles.phase, { flex: sleepData.deepSleep, backgroundColor: '#4CAF50' }]} />
              <View style={[styles.phase, { flex: sleepData.remSleep, backgroundColor: '#2196F3' }]} />
              <View style={[styles.phase, { flex: sleepData.duration - sleepData.deepSleep - sleepData.remSleep, backgroundColor: '#FFC107' }]} />
            </View>
            <View style={styles.phaseLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>Deep</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
                <Text style={styles.legendText}>REM</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
                <Text style={styles.legendText}>Light</Text>
              </View>
            </View>
          </View>

          <View style={styles.sleepTimes}>
            <View style={styles.sleepTime}>
              <Icon name="bedtime" size={20} color={COLORS.primary} />
              <Text style={styles.sleepTimeLabel}>Bedtime</Text>
              <Text style={styles.sleepTimeValue}>{sleepData.bedTime}</Text>
            </View>
            <View style={styles.sleepTime}>
              <Icon name="alarm" size={20} color={COLORS.primary} />
              <Text style={styles.sleepTimeLabel}>Wake Time</Text>
              <Text style={styles.sleepTimeValue}>{sleepData.wakeTime}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.sleepRecommendations}>
        <Card.Content>
          <Text style={styles.sectionTitle}>💡 Sleep Recommendations</Text>
          <View style={styles.recommendationsList}>
            <Text style={styles.recommendation}>
              🌙 Maintain consistent sleep schedule (±30 minutes)
            </Text>
            <Text style={styles.recommendation}>
              📱 Avoid screens 1 hour before bedtime
            </Text>
            <Text style={styles.recommendation}>
              🌡️ Keep room temperature between 60-67°F (15-19°C)
            </Text>
            <Text style={styles.recommendation}>
              ☕ Avoid caffeine 6 hours before sleep
            </Text>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderActivitiesTab = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      <Text style={styles.sectionTitle}>🏃‍♂️ Recovery Activities</Text>
      
      {recoveryActivities.map((activity) => (
        <Card key={activity.id} style={styles.activityCard}>
          <Card.Content>
            <View style={styles.activityHeader}>
              <View style={styles.activityInfo}>
                <Icon name={activity.icon} size={24} color={COLORS.primary} />
                <View style={styles.activityText}>
                  <Text style={styles.activityName}>{activity.name}</Text>
                  <Text style={styles.activityDuration}>{activity.duration} minutes</Text>
                </View>
              </View>
              
              <View style={styles.activityActions}>
                <Chip
                  icon="stars"
                  style={styles.pointsChip}
                  textStyle={styles.pointsText}
                >
                  {activity.points} pts
                </Chip>
                <IconButton
                  icon={activity.completed ? "check-circle" : "radio-button-unchecked"}
                  iconColor={activity.completed ? COLORS.success : COLORS.secondary}
                  size={28}
                  onPress={() => handleActivityToggle(activity.id)}
                />
              </View>
            </View>
            
            {activity.completed && (
              <View style={styles.completedBadge}>
                <Icon name="check" size={16} color="white" />
                <Text style={styles.completedText}>Completed! +{activity.points} points</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      ))}

      <Button
        mode="contained"
        icon="add"
        onPress={() => openModal('addActivity')}
        style={styles.addActivityButton}
        buttonColor={COLORS.primary}
      >
        Add Recovery Activity
      </Button>
    </Animated.View>
  );

  const renderInsightsTab = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      <Text style={styles.sectionTitle}>🧠 Recovery Insights</Text>
      
      <Card style={styles.insightCard}>
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.insightHeader}
        >
          <Icon name="trending-up" size={24} color="white" />
          <Text style={styles.insightTitle}>Improvement Trend</Text>
        </LinearGradient>
        <Card.Content>
          <Text style={styles.insightText}>
            Your recovery score has improved by 12% over the past week! 🎉
          </Text>
          <Text style={styles.insightDetail}>
            Key factors: Better sleep consistency and regular stretching routine.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.insightCard}>
        <LinearGradient
          colors={['#FF9800', '#F57C00']}
          style={styles.insightHeader}
        >
          <Icon name="lightbulb" size={24} color="white" />
          <Text style={styles.insightTitle}>Personalized Tip</Text>
        </LinearGradient>
        <Card.Content>
          <Text style={styles.insightText}>
            Your stress levels peak on Wednesdays 📈
          </Text>
          <Text style={styles.insightDetail}>
            Try adding a 10-minute meditation session on Wednesday mornings.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.insightCard}>
        <LinearGradient
          colors={['#2196F3', '#1976D2']}
          style={styles.insightHeader}
        >
          <Icon name="psychology" size={24} color="white" />
          <Text style={styles.insightTitle}>Recovery Pattern</Text>
        </LinearGradient>
        <Card.Content>
          <Text style={styles.insightText}>
            You recover best with 7.5-8 hours of sleep 😴
          </Text>
          <Text style={styles.insightDetail}>
            Optimal bedtime range: 10:00 PM - 10:30 PM for your schedule.
          </Text>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderModal = () => (
    <Portal>
      <Modal
        visible={showModal}
        onDismiss={closeModal}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView intensity={20} style={styles.modalBlur}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <Text style={styles.modalTitle}>
                {modalType === 'sleep' && '💤 Log Sleep Data'}
                {modalType === 'recovery' && '🧘‍♂️ Add Recovery Activity'}
                {modalType === 'hrv' && '❤️ Heart Rate Variability'}
                {modalType === 'addActivity' && '➕ New Recovery Activity'}
              </Text>
              
              <Text style={styles.modalSubtitle}>
                Feature coming soon! We're working on making this even better for you.
              </Text>
              
              <Button
                mode="contained"
                onPress={closeModal}
                style={styles.modalButton}
                buttonColor={COLORS.primary}
              >
                Got it!
              </Button>
            </Card.Content>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'sleep':
        return renderSleepTab();
      case 'activities':
        return renderActivitiesTab();
      case 'insights':
        return renderInsightsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Avatar.Text
              size={40}
              label={user?.name?.charAt(0) || 'U'}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.welcomeText}>Recovery Dashboard</Text>
              <Text style={styles.nameText}>
                {user?.name || 'Fitness Enthusiast'} 💪
              </Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <IconButton
              icon="notifications"
              iconColor="white"
              size={24}
              onPress={() => navigation.navigate('Notifications')}
            />
            <IconButton
              icon="settings"
              iconColor="white"
              size={24}
              onPress={() => navigation.navigate('Settings')}
            />
          </View>
        </View>
      </LinearGradient>

      {renderTabButtons()}

      {/* Content */}
      <ScrollView
        style={styles.content}
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
        {renderContent()}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => openModal('addActivity')}
        color="white"
        customSize={56}
      />

      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header Styles
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: SPACING.md,
  },
  welcomeText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  nameText: {
    ...TEXT_STYLES.subtitle1,
    color: 'white',
    fontWeight: 'bold',
  },

  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'white',
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    borderRadius: SPACING.sm,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Content Styles
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  tabContent: {
    flex: 1,
  },
  
  // Score Card Styles
  scoreCard: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  scoreGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  scoreTitle: {
    ...TEXT_STYLES.subtitle1,
    color: 'white',
    marginBottom: SPACING.sm,
  },
  scoreValue: {
    ...TEXT_STYLES.headline3,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 48,
  },
  scoreSubtitle: {
    ...TEXT_STYLES.body2,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.sm,
    fontSize: 16,
  },

  // Metrics Card Styles
  metricsCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle1,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    fontSize: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  metricValue: {
    ...TEXT_STYLES.subtitle1,
    fontWeight: 'bold',
  },

  // Chart Styles
  chartCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'end',
    height: 120,
    paddingHorizontal: SPACING.md,
  },
  chartBar: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  bar: {
    width: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  chartLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  chartValue: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // Quick Actions Styles
  quickActionsContainer: {
    marginBottom: SPACING.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - SPACING.md * 3) / 2,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: SPACING.md,
    elevation: 2,
  },
  quickActionLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontWeight: '500',
  },

  // Sleep Tab Styles
  sleepCard: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  sleepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  sleepTitle: {
    ...TEXT_STYLES.subtitle1,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  sleepContent: {
    padding: SPACING.lg,
  },
  sleepStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  sleepStat: {
    alignItems: 'center',
  },
  sleepStatValue: {
    ...TEXT_STYLES.headline5,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  sleepStatLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  sleepPhases: {
    marginBottom: SPACING.lg,
  },
  sleepPhasesTitle: {
    ...TEXT_STYLES.subtitle2,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  sleepPhaseBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  phase: {
    height: '100%',
  },
  phaseLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  legendText: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
  },
  sleepTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sleepTime: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  sleepTimeLabel: {
    ...TEXT_STYLES.body2,
    marginLeft: SPACING.xs,
    marginRight: SPACING.xs,
  },
  sleepTimeValue: {
    ...TEXT_STYLES.subtitle2,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // Sleep Recommendations
  sleepRecommendations: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  recommendationsList: {
    marginTop: SPACING.sm,
  },
  recommendation: {
    ...TEXT_STYLES.body2,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },

  // Activities Tab Styles
  activityCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: SPACING.md,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  activityName: {
    ...TEXT_STYLES.subtitle2,
    fontWeight: 'bold',
  },
  activityDuration: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  activityActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsChip: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  pointsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  completedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  addActivityButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },

  // Insights Tab Styles
  insightCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  insightTitle: {
    ...TEXT_STYLES.subtitle1,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  insightText: {
    ...TEXT_STYLES.body1,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  insightDetail: {
    ...TEXT_STYLES.body2,
    color: COLORS.secondary,
    lineHeight: 18,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalCard: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: SPACING.lg,
    elevation: 8,
  },
  modalTitle: {
    ...TEXT_STYLES.headline6,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalSubtitle: {
    ...TEXT_STYLES.body1,
    textAlign: 'center',
    color: COLORS.secondary,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  modalButton: {
    marginTop: SPACING.md,
  },

  // FAB Styles
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
    elevation: 8,
  },

  // Loading and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    ...TEXT_STYLES.body1,
    color: COLORS.secondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    ...TEXT_STYLES.body1,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },

  // Error Handling Styles
  errorContainer: {
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: SPACING.sm,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  // Accessibility Styles
  accessibilityFocus: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: SPACING.sm,
  },

  // Animation Styles
  fadeIn: {
    opacity: 1,
  },
  slideIn: {
    transform: [{ translateY: 0 }],
  },
  scaleIn: {
    transform: [{ scale: 1 }],
  },

  // Responsive Styles
  smallScreen: {
    padding: SPACING.sm,
  },
  largeScreen: {
    padding: SPACING.lg,
  },
});

export default RecoveryTracking;
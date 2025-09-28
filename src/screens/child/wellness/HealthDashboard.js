import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  Portal,
  Modal,
  ProgressBar,
  FAB,
  IconButton,
  Badge,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9ff',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  excellent: '#4CAF50',
  good: '#8BC34A',
  average: '#FFC107',
  needsWork: '#FF9800',
  concern: '#F44336',
  hydration: '#2196F3',
  nutrition: '#4CAF50',
  sleep: '#9C27B0',
  activity: '#FF5722',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
  caption: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const HealthDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [alertsExpanded, setAlertsExpanded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Pulse animation for alerts
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    loadHealthData();
  }, []);

  const [healthData, setHealthData] = useState({
    overallScore: 85,
    lastUpdated: '2025-08-30T10:30:00Z',
    dailyMetrics: {
      hydration: { current: 6, target: 8, unit: 'glasses', progress: 75 },
      sleep: { current: 8.5, target: 9, unit: 'hours', progress: 94 },
      activity: { current: 45, target: 60, unit: 'minutes', progress: 75 },
      nutrition: { current: 80, target: 100, unit: 'score', progress: 80 },
    },
    weeklyTrends: {
      energy: 88,
      mood: 92,
      focus: 85,
      recovery: 87,
    },
    recentAssessments: [
      { name: 'Fitness Assessment', score: 88, date: '2025-08-25', trend: 'up' },
      { name: 'Mental Wellness', score: 92, date: '2025-08-23', trend: 'stable' },
      { name: 'Nutrition Review', score: 76, date: '2025-08-20', trend: 'up' },
    ],
    alerts: [
      {
        id: 1,
        type: 'reminder',
        priority: 'medium',
        title: 'Hydration Reminder',
        message: 'Remember to drink water during training! 💧',
        time: '2 hours ago',
        icon: 'water-drop',
      },
      {
        id: 2,
        type: 'achievement',
        priority: 'low',
        title: 'Great Sleep Pattern!',
        message: 'You\'ve maintained consistent sleep for 5 days! 😴',
        time: '1 day ago',
        icon: 'jump-rope',
      },
      {
        id: 3,
        type: 'attention',
        priority: 'high',
        title: 'Recovery Focus',
        message: 'Consider a lighter training day to optimize recovery.',
        time: '3 hours ago',
        icon: 'healing',
      },
    ],
    goals: [
      { id: 1, title: 'Daily Hydration', progress: 75, target: '8 glasses', color: COLORS.hydration },
      { id: 2, title: 'Sleep Quality', progress: 94, target: '9 hours', color: COLORS.sleep },
      { id: 3, title: 'Active Minutes', progress: 75, target: '60 minutes', color: COLORS.activity },
      { id: 4, title: 'Nutrition Score', progress: 80, target: '100 points', color: COLORS.nutrition },
    ],
  });

  const loadHealthData = () => {
    // Simulate loading health data
    // In real app, this would fetch from API/Redux store
    console.log('Loading health data...');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadHealthData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const periodOptions = [
    { id: 'day', label: 'Today', icon: 'today' },
    { id: 'week', label: 'Week', icon: 'date-range' },
    { id: 'month', label: 'Month', icon: 'calendar-month' },
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return COLORS.excellent;
    if (score >= 80) return COLORS.good;
    if (score >= 70) return COLORS.average;
    if (score >= 60) return COLORS.needsWork;
    return COLORS.concern;
  };

  const getAlertColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const renderOverallHealthCard = () => (
    <Card style={styles.overallCard} elevation={3}>
      <LinearGradient
        colors={[getScoreColor(healthData.overallScore), getScoreColor(healthData.overallScore) + '80']}
        style={styles.overallGradient}
      >
        <Card.Content style={styles.overallContent}>
          <View style={styles.overallHeader}>
            <View>
              <Text style={styles.overallTitle}>Overall Health Score</Text>
              <Text style={styles.overallSubtitle}>
                Updated {new Date(healthData.lastUpdated).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
            <Avatar.Icon
              size={60}
              icon="favorite"
              style={[styles.overallAvatar, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
            />
          </View>
          
          <View style={styles.scoreDisplay}>
            <Text style={styles.scoreValue}>{healthData.overallScore}</Text>
            <Text style={styles.scoreUnit}>/ 100</Text>
          </View>
          
          <Text style={styles.scoreStatus}>
            {healthData.overallScore >= 85 ? 'Excellent health! Keep it up! 🌟' :
             healthData.overallScore >= 70 ? 'Good progress! Room to improve 💪' :
             'Let\'s work together on your health 🤝'}
          </Text>
        </Card.Content>
      </LinearGradient>
    </Card>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {periodOptions.map((option) => (
        <Chip
          key={option.id}
          mode={selectedPeriod === option.id ? 'flat' : 'outlined'}
          selected={selectedPeriod === option.id}
          onPress={() => setSelectedPeriod(option.id)}
          icon={option.icon}
          style={[
            styles.periodChip,
            selectedPeriod === option.id && { backgroundColor: COLORS.primary + '20' }
          ]}
          textStyle={[
            styles.periodChipText,
            selectedPeriod === option.id && { color: COLORS.primary }
          ]}
        >
          {option.label}
        </Chip>
      ))}
    </View>
  );

  const renderDailyMetrics = () => (
    <Card style={styles.metricsCard} elevation={2}>
      <Card.Content>
        <Text style={styles.sectionTitle}>📊 Today's Metrics</Text>
        <View style={styles.metricsGrid}>
          {Object.entries(healthData.dailyMetrics).map(([key, metric]) => {
            const icons = {
              hydration: 'water-drop',
              sleep: 'bedtime',
              activity: 'directions-run',
              nutrition: 'restaurant',
            };
            
            const colors = {
              hydration: COLORS.hydration,
              sleep: COLORS.sleep,
              activity: COLORS.activity,
              nutrition: COLORS.nutrition,
            };

            return (
              <TouchableOpacity
                key={key}
                style={styles.metricItem}
                onPress={() => openMetricModal(key, metric)}
              >
                <Surface style={[styles.metricSurface, { borderLeftColor: colors[key] }]}>
                  <View style={styles.metricHeader}>
                    <MaterialIcons 
                      name={icons[key]} 
                      size={24} 
                      color={colors[key]} 
                    />
                    <Text style={styles.metricValue}>
                      {metric.current}{metric.unit === 'score' ? '%' : ''}
                    </Text>
                  </View>
                  
                  <Text style={styles.metricLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  
                  <View style={styles.metricProgress}>
                    <ProgressBar
                      progress={metric.progress / 100}
                      color={colors[key]}
                      style={styles.metricProgressBar}
                    />
                    <Text style={styles.metricTarget}>
                      Target: {metric.target} {metric.unit !== 'score' ? metric.unit : ''}
                    </Text>
                  </View>
                </Surface>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );

  const renderWeeklyTrends = () => (
    <Card style={styles.trendsCard} elevation={2}>
      <Card.Content>
        <Text style={styles.sectionTitle}>📈 Weekly Trends</Text>
        <View style={styles.trendsGrid}>
          {Object.entries(healthData.weeklyTrends).map(([key, value]) => {
            const icons = {
              energy: 'flash-on',
              mood: 'mood',
              focus: 'center-focus-strong',
              recovery: 'healing',
            };

            return (
              <View key={key} style={styles.trendItem}>
                <MaterialIcons
                  name={icons[key]}
                  size={20}
                  color={getScoreColor(value)}
                />
                <Text style={styles.trendLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <Text style={[styles.trendValue, { color: getScoreColor(value) }]}>
                  {value}%
                </Text>
              </View>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );

  const renderGoalsCard = () => (
    <Card style={styles.goalsCard} elevation={2}>
      <Card.Content>
        <View style={styles.goalsSectionHeader}>
          <Text style={styles.sectionTitle}>🎯 Daily Goals</Text>
          <Button
            mode="outlined"
            compact
            onPress={() => Alert.alert('Feature Coming Soon', 'Goal customization is under development.')}
          >
            Customize
          </Button>
        </View>
        
        {healthData.goals.map((goal) => (
          <View key={goal.id} style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={[styles.goalProgress, { color: goal.color }]}>
                {goal.progress}%
              </Text>
            </View>
            
            <ProgressBar
              progress={goal.progress / 100}
              color={goal.color}
              style={styles.goalProgressBar}
            />
            
            <Text style={styles.goalTarget}>Target: {goal.target}</Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderAlertsCard = () => {
    const highPriorityAlerts = healthData.alerts.filter(alert => alert.priority === 'high');
    
    return (
      <Animated.View style={{ transform: [{ scale: highPriorityAlerts.length > 0 ? pulseAnim : 1 }] }}>
        <Card style={styles.alertsCard} elevation={2}>
          <Card.Content>
            <TouchableOpacity
              style={styles.alertsHeader}
              onPress={() => setAlertsExpanded(!alertsExpanded)}
            >
              <View style={styles.alertsTitle}>
                <Text style={styles.sectionTitle}>🔔 Health Alerts</Text>
                {highPriorityAlerts.length > 0 && (
                  <Badge size={20} style={styles.alertBadge}>
                    {highPriorityAlerts.length}
                  </Badge>
                )}
              </View>
              <MaterialIcons
                name={alertsExpanded ? 'expand-less' : 'expand-more'}
                size={24}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
            
            {alertsExpanded && (
              <View style={styles.alertsList}>
                {healthData.alerts.map((alert) => (
                  <TouchableOpacity
                    key={alert.id}
                    style={[
                      styles.alertItem,
                      { borderLeftColor: getAlertColor(alert.priority) }
                    ]}
                    onPress={() => handleAlertPress(alert)}
                  >
                    <View style={styles.alertContent}>
                      <MaterialIcons
                        name={alert.icon}
                        size={20}
                        color={getAlertColor(alert.priority)}
                        style={styles.alertIcon}
                      />
                      <View style={styles.alertText}>
                        <Text style={styles.alertTitle}>{alert.title}</Text>
                        <Text style={styles.alertMessage}>{alert.message}</Text>
                        <Text style={styles.alertTime}>{alert.time}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderRecentAssessments = () => (
    <Card style={styles.assessmentsCard} elevation={2}>
      <Card.Content>
        <View style={styles.assessmentsHeader}>
          <Text style={styles.sectionTitle}>📋 Recent Assessments</Text>
          <Button
            mode="outlined"
            compact
            onPress={() => navigation.navigate('HealthAssessments')}
          >
            View All
          </Button>
        </View>
        
        {healthData.recentAssessments.map((assessment, index) => (
          <View key={index} style={styles.assessmentItem}>
            <View style={styles.assessmentInfo}>
              <Text style={styles.assessmentName}>{assessment.name}</Text>
              <Text style={styles.assessmentDate}>
                {new Date(assessment.date).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.assessmentScore}>
              <Text style={[styles.scoreText, { color: getScoreColor(assessment.score) }]}>
                {assessment.score}%
              </Text>
              <MaterialIcons
                name={
                  assessment.trend === 'up' ? 'trending-up' :
                  assessment.trend === 'down' ? 'trending-down' : 'trending-flat'
                }
                size={16}
                color={
                  assessment.trend === 'up' ? COLORS.success :
                  assessment.trend === 'down' ? COLORS.error : COLORS.textSecondary
                }
              />
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.quickActionsCard} elevation={2}>
      <Card.Content>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Feature Coming Soon', 'Log hydration feature is under development.')}
          >
            <MaterialIcons name="water-drop" size={28} color={COLORS.hydration} />
            <Text style={styles.quickActionText}>Log Water</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Feature Coming Soon', 'Sleep tracking feature is under development.')}
          >
            <MaterialIcons name="bedtime" size={28} color={COLORS.sleep} />
            <Text style={styles.quickActionText}>Sleep Log</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Feature Coming Soon', 'Mood tracking feature is under development.')}
          >
            <MaterialIcons name="mood" size={28} color={COLORS.success} />
            <Text style={styles.quickActionText}>Log Mood</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('HealthAssessments')}
          >
            <MaterialIcons name="assignment" size={28} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Assessment</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const openMetricModal = (metricKey, metricData) => {
    setSelectedMetric({ key: metricKey, data: metricData });
    setModalVisible(true);
  };

  const handleAlertPress = (alert) => {
    Alert.alert(alert.title, alert.message, [
      { text: 'Dismiss', style: 'cancel' },
      { text: 'Learn More', onPress: () => Alert.alert('Feature Coming Soon', 'Detailed health guidance is under development.') }
    ]);
  };

  const renderMetricModal = () => {
    if (!selectedMetric) return null;

    return (
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={50} style={styles.modalBlur}>
            <Surface style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedMetric.key.charAt(0).toUpperCase() + selectedMetric.key.slice(1)} Details
                </Text>
                <IconButton
                  icon="close"
                  onPress={() => setModalVisible(false)}
                />
              </View>
              
              <View style={styles.modalBody}>
                <Text style={styles.modalDescription}>
                  Track your daily {selectedMetric.key} to maintain optimal health and performance.
                </Text>
                
                <View style={styles.modalStats}>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>
                      {selectedMetric.data.current}
                    </Text>
                    <Text style={styles.modalStatLabel}>Current</Text>
                  </View>
                  
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>
                      {selectedMetric.data.target}
                    </Text>
                    <Text style={styles.modalStatLabel}>Target</Text>
                  </View>
                  
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>
                      {selectedMetric.data.progress}%
                    </Text>
                    <Text style={styles.modalStatLabel}>Progress</Text>
                  </View>
                </View>
                
                <Button
                  mode="contained"
                  onPress={() => {
                    setModalVisible(false);
                    Alert.alert('Feature Coming Soon', 'Detailed tracking features are under development.');
                  }}
                  style={styles.modalButton}
                >
                  Update {selectedMetric.key.charAt(0).toUpperCase() + selectedMetric.key.slice(1)}
                </Button>
              </View>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Health Dashboard</Text>
              <Text style={styles.headerSubtitle}>Your wellness journey 🌟</Text>
            </View>
            <Avatar.Icon
              size={50}
              icon="dashboard"
              style={styles.headerAvatar}
            />
          </View>
        </Animated.View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
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
          {renderOverallHealthCard()}
          {renderPeriodSelector()}
          {renderAlertsCard()}
          {renderDailyMetrics()}
          {renderGoalsCard()}
          {renderWeeklyTrends()}
          {renderRecentAssessments()}
          {renderQuickActions()}

          <Card style={styles.supportCard} elevation={2}>
            <Card.Content>
              <Text style={styles.sectionTitle}>🤝 Health Support</Text>
              <Text style={styles.supportText}>
                Remember, your health and safety come first! If you have any concerns, 
                talk to your coach, parents, or healthcare provider.
              </Text>
              <Button
                mode="outlined"
                onPress={() => Alert.alert('Feature Coming Soon', 'Emergency contacts feature is under development.')}
                style={styles.supportButton}
                icon="phone"
              >
                Emergency Contacts
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Feature Coming Soon', 'Quick health logging is under development.')}
      />

      {renderMetricModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
  },
  headerAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
  },
  overallCard: {
    marginBottom: SPACING.lg,
    borderRadius: 15,
    overflow: 'hidden',
  },
  overallGradient: {
    borderRadius: 15,
  },
  overallContent: {
    padding: SPACING.lg,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  overallTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  overallSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  overallAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreUnit: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: SPACING.xs,
  },
  scoreStatus: {
    ...TEXT_STYLES.body,
    color: 'white',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  periodChip: {
    flex: 0.3,
  },
  periodChipText: {
    fontSize: 12,
  },
  metricsCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  metricSurface: {
    padding: SPACING.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    backgroundColor: COLORS.background,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  metricProgress: {
    marginTop: SPACING.sm,
  },
  metricProgressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  metricTarget: {
    ...TEXT_STYLES.small,
  },
  trendsCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  trendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trendItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  trendLabel: {
    ...TEXT_STYLES.body,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  trendValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  goalsCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  goalsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  goalItem: {
    marginBottom: SPACING.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  goalProgress: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  goalProgressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  goalTarget: {
    ...TEXT_STYLES.caption,
  },
  alertsCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBadge: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.error,
  },
  alertsList: {
    marginTop: SPACING.md,
  },
  alertItem: {
    borderLeftWidth: 4,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  alertContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  alertIcon: {
    marginRight: SPACING.md,
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  alertMessage: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  alertTime: {
    ...TEXT_STYLES.small,
  },
  assessmentsCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  assessmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  assessmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  assessmentDate: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  assessmentScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
  },
  quickActionsCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '22%',
    aspectRatio: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  supportCard: {
    marginBottom: SPACING.lg,
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  supportText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  supportButton: {
    borderColor: COLORS.success,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    flex: 1,
  },
  modalBody: {
    alignItems: 'center',
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.xl,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  modalStatLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
  },
  bottomSpacing: {
    height: SPACING.xxl * 2,
  },
});
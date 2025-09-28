import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  Dimensions,
  TouchableOpacity,
  Platform,
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
  Portal,
  Modal,
  Searchbar,
  Switch,
  Slider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#e91e63',
  sleep: '#3f51b5',
  deepSleep: '#1a237e',
  lightSleep: '#7986cb',
  rem: '#9c27b0',
  awake: '#ff5722',
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

const { width, height } = Dimensions.get('window');

const SleepMonitoring = ({ navigation, route }) => {
  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const sleepData = useSelector(state => state.sleep.data || []);
  const sleepGoal = useSelector(state => state.sleep.goal || 8);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [modalVisible, setModalVisible] = useState(false);
  const [sleepTimerRunning, setSleepTimerRunning] = useState(false);
  const [bedtime, setBedtime] = useState(new Date());
  const [wakeupTime, setWakeupTime] = useState(new Date());
  const [sleepQuality, setSleepQuality] = useState(4);
  const [smartAlarmEnabled, setSmartAlarmEnabled] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Sleep data states
  const [lastNightSleep, setLastNightSleep] = useState({
    duration: 7.5,
    quality: 85,
    deepSleep: 1.8,
    lightSleep: 4.2,
    remSleep: 1.5,
    awakeTime: 0.3,
    sleepEfficiency: 92,
    heartRate: 58,
    bedTime: '23:15',
    wakeTime: '06:45',
  });

  const [weeklyStats, setWeeklyStats] = useState({
    averageDuration: 7.2,
    averageQuality: 82,
    consistency: 78,
    goalAchieved: 5,
    totalNights: 7,
  });

  const [sleepTrends, setSleepTrends] = useState([
    { day: 'Mon', duration: 7.2, quality: 80, efficiency: 89 },
    { day: 'Tue', duration: 6.8, quality: 75, efficiency: 85 },
    { day: 'Wed', duration: 8.1, quality: 88, efficiency: 94 },
    { day: 'Thu', duration: 7.5, quality: 85, efficiency: 92 },
    { day: 'Fri', duration: 6.9, quality: 78, efficiency: 87 },
    { day: 'Sat', duration: 8.3, quality: 90, efficiency: 96 },
    { day: 'Sun', duration: 7.8, quality: 87, efficiency: 93 },
  ]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Sleep recommendations
  const sleepTips = [
    {
      id: 1,
      title: 'Consistent Sleep Schedule 🕘',
      description: 'Try to sleep and wake up at the same time daily',
      category: 'schedule',
      priority: 'high',
      implemented: false,
    },
    {
      id: 2,
      title: 'Blue Light Reduction 📱',
      description: 'Avoid screens 1 hour before bedtime',
      category: 'environment',
      priority: 'high',
      implemented: true,
    },
    {
      id: 3,
      title: 'Room Temperature 🌡️',
      description: 'Keep bedroom between 65-68°F (18-20°C)',
      category: 'environment',
      priority: 'medium',
      implemented: false,
    },
    {
      id: 4,
      title: 'Caffeine Cutoff ☕',
      description: 'No caffeine after 2 PM for better sleep',
      category: 'lifestyle',
      priority: 'medium',
      implemented: true,
    },
    {
      id: 5,
      title: 'Pre-Sleep Routine 🧘',
      description: 'Establish a relaxing 30-minute wind-down routine',
      category: 'routine',
      priority: 'high',
      implemented: false,
    },
  ];

  // Initialize animations
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for sleep timer
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

    if (sleepTimerRunning) {
      pulseLoop.start();
    } else {
      pulseLoop.stop();
    }

    return () => pulseLoop.stop();
  }, [sleepTimerRunning]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update sleep data
      setLastNightSleep(prev => ({
        ...prev,
        quality: Math.floor(Math.random() * 20) + 80,
        sleepEfficiency: Math.floor(Math.random() * 10) + 90,
      }));
      
      dispatch({ type: 'REFRESH_SLEEP_DATA' });
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh sleep data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Handle sleep timer toggle
  const handleSleepTimer = useCallback(() => {
    Vibration.vibrate(50);
    setSleepTimerRunning(!sleepTimerRunning);
    
    if (!sleepTimerRunning) {
      Alert.alert(
        '😴 Sleep Timer Started',
        'Sleep tracking is now active. Place your phone on the nightstand.',
        [{ text: 'Got it!', style: 'default' }]
      );
    } else {
      Alert.alert(
        '⏰ Sleep Timer Stopped',
        'How was your sleep quality?',
        [
          { text: 'Poor', onPress: () => setSleepQuality(2) },
          { text: 'Good', onPress: () => setSleepQuality(4) },
          { text: 'Excellent', onPress: () => setSleepQuality(5) },
        ]
      );
    }
  }, [sleepTimerRunning]);

  // Handle manual sleep log
  const handleManualLog = useCallback(() => {
    setModalVisible(true);
  }, []);

  // Get sleep quality color
  const getSleepQualityColor = (quality) => {
    if (quality >= 85) return COLORS.success;
    if (quality >= 70) return COLORS.warning;
    return COLORS.error;
  };

  // Format duration
  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Render header with gradient
  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.sleep, COLORS.deepSleep]}
      style={styles.headerGradient}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sleep Monitoring</Text>
          <TouchableOpacity onPress={() => Alert.alert('Settings', 'Sleep settings coming soon!')}>
            <Icon name="settings" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(lastNightSleep.duration)}</Text>
            <Text style={styles.statLabel}>Last Night</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{lastNightSleep.quality}%</Text>
            <Text style={styles.statLabel}>Sleep Quality</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(weeklyStats.averageDuration)}</Text>
            <Text style={styles.statLabel}>Weekly Avg</Text>
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );

  // Render sleep timer card
  const renderSleepTimer = () => (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <Card style={styles.timerCard}>
        <Card.Content>
          <View style={styles.timerHeader}>
            <Icon name="bedtime" size={28} color={COLORS.sleep} />
            <Text style={styles.timerTitle}>Sleep Tracker</Text>
            <Switch
              value={smartAlarmEnabled}
              onValueChange={setSmartAlarmEnabled}
              thumbColor={COLORS.sleep}
              trackColor={{ true: COLORS.sleep + '40' }}
            />
          </View>
          
          <View style={styles.timerContent}>
            <Animated.View
              style={[
                styles.timerButton,
                sleepTimerRunning && {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <TouchableOpacity
                onPress={handleSleepTimer}
                style={[
                  styles.timerTouchable,
                  {
                    backgroundColor: sleepTimerRunning ? COLORS.error : COLORS.sleep,
                  },
                ]}
              >
                <Icon
                  name={sleepTimerRunning ? 'stop' : 'bedtime'}
                  size={32}
                  color="#fff"
                />
                <Text style={styles.timerButtonText}>
                  {sleepTimerRunning ? 'Stop Tracking' : 'Start Sleep'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
            
            <View style={styles.timerInfo}>
              <Text style={styles.timerSubtext}>
                {sleepTimerRunning
                  ? '🌙 Tracking your sleep...'
                  : '😴 Tap to start sleep tracking'}
              </Text>
              {smartAlarmEnabled && (
                <Text style={styles.smartAlarmText}>
                  ⚡ Smart alarm enabled - wake during light sleep
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.quickActions}>
            <Button
              mode="outlined"
              onPress={handleManualLog}
              style={styles.quickActionButton}
              labelStyle={{ color: COLORS.sleep }}
            >
              Manual Log
            </Button>
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Feature Coming Soon!', 'Sleep insights and analysis coming soon.')}
              style={styles.quickActionButton}
              labelStyle={{ color: COLORS.sleep }}
            >
              View Insights
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  // Render sleep breakdown chart
  const renderSleepBreakdown = () => (
    <Card style={styles.breakdownCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>🌙 Last Night's Sleep Breakdown</Text>
        
        <View style={styles.sleepStages}>
          <View style={styles.stageItem}>
            <View style={[styles.stageColor, { backgroundColor: COLORS.deepSleep }]} />
            <View style={styles.stageInfo}>
              <Text style={styles.stageName}>Deep Sleep</Text>
              <Text style={styles.stageValue}>{formatDuration(lastNightSleep.deepSleep)} (24%)</Text>
            </View>
          </View>
          
          <View style={styles.stageItem}>
            <View style={[styles.stageColor, { backgroundColor: COLORS.lightSleep }]} />
            <View style={styles.stageInfo}>
              <Text style={styles.stageName}>Light Sleep</Text>
              <Text style={styles.stageValue}>{formatDuration(lastNightSleep.lightSleep)} (56%)</Text>
            </View>
          </View>
          
          <View style={styles.stageItem}>
            <View style={[styles.stageColor, { backgroundColor: COLORS.rem }]} />
            <View style={styles.stageInfo}>
              <Text style={styles.stageName}>REM Sleep</Text>
              <Text style={styles.stageValue}>{formatDuration(lastNightSleep.remSleep)} (20%)</Text>
            </View>
          </View>
          
          <View style={styles.stageItem}>
            <View style={[styles.stageColor, { backgroundColor: COLORS.awake }]} />
            <View style={styles.stageInfo}>
              <Text style={styles.stageName}>Awake</Text>
              <Text style={styles.stageValue}>{formatDuration(lastNightSleep.awakeTime)} (4%)</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.additionalMetrics}>
          <View style={styles.metricItem}>
            <Icon name="favorite" size={20} color={COLORS.error} />
            <Text style={styles.metricLabel}>Avg Heart Rate</Text>
            <Text style={styles.metricValue}>{lastNightSleep.heartRate} BPM</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Icon name="trending-up" size={20} color={COLORS.success} />
            <Text style={styles.metricLabel}>Sleep Efficiency</Text>
            <Text style={styles.metricValue}>{lastNightSleep.sleepEfficiency}%</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  // Render tab navigation
  const renderTabNavigation = () => (
    <View style={styles.tabContainer}>
      {['today', 'trends', 'tips'].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
            ]}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render today's overview
  const renderTodayOverview = () => (
    <View style={styles.todayContainer}>
      {renderSleepTimer()}
      {renderSleepBreakdown()}
      
      <Card style={styles.goalCard}>
        <Card.Content>
          <View style={styles.goalHeader}>
            <Icon name="flag" size={24} color={COLORS.success} />
            <Text style={styles.goalTitle}>Sleep Goal Progress</Text>
          </View>
          
          <View style={styles.goalContent}>
            <ProgressBar
              progress={lastNightSleep.duration / sleepGoal}
              color={getSleepQualityColor(lastNightSleep.quality)}
              style={styles.goalProgress}
            />
            <Text style={styles.goalText}>
              {formatDuration(lastNightSleep.duration)} of {formatDuration(sleepGoal)} goal
            </Text>
          </View>
          
          <View style={styles.goalStats}>
            <Chip
              icon="check-circle"
              style={[styles.goalChip, { backgroundColor: COLORS.success + '20' }]}
              textStyle={{ color: COLORS.success }}
            >
              {weeklyStats.goalAchieved}/{weeklyStats.totalNights} Days
            </Chip>
            <Chip
              icon="timeline"
              style={[styles.goalChip, { backgroundColor: COLORS.primary + '20' }]}
              textStyle={{ color: COLORS.primary }}
            >
              {weeklyStats.consistency}% Consistent
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  // Render weekly trends
  const renderTrends = () => (
    <View style={styles.trendsContainer}>
      <Card style={styles.trendsCard}>
        <Card.Content>
          <View style={styles.trendsHeader}>
            <Text style={styles.sectionTitle}>📊 Sleep Trends</Text>
            <View style={styles.periodSelector}>
              {['7d', '30d', '3m'].map((period) => (
                <Chip
                  key={period}
                  selected={selectedPeriod === period}
                  onPress={() => setSelectedPeriod(period)}
                  style={[
                    styles.periodChip,
                    selectedPeriod === period && { backgroundColor: COLORS.primary },
                  ]}
                  textStyle={{
                    color: selectedPeriod === period ? '#fff' : COLORS.primary,
                  }}
                >
                  {period}
                </Chip>
              ))}
            </View>
          </View>
          
          <View style={styles.trendsList}>
            {sleepTrends.map((trend, index) => (
              <View key={index} style={styles.trendItem}>
                <Text style={styles.trendDay}>{trend.day}</Text>
                <View style={styles.trendBars}>
                  <View style={styles.trendBar}>
                    <View
                      style={[
                        styles.trendBarFill,
                        {
                          width: `${(trend.duration / 10) * 100}%`,
                          backgroundColor: COLORS.sleep,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.trendValue}>{formatDuration(trend.duration)}</Text>
                </View>
                <View style={styles.trendQuality}>
                  <View
                    style={[
                      styles.qualityDot,
                      { backgroundColor: getSleepQualityColor(trend.quality) },
                    ]}
                  />
                  <Text style={styles.qualityText}>{trend.quality}%</Text>
                </View>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.averagesCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📈 Weekly Averages</Text>
          
          <View style={styles.averagesList}>
            <View style={styles.averageItem}>
              <Icon name="schedule" size={24} color={COLORS.sleep} />
              <View style={styles.averageInfo}>
                <Text style={styles.averageLabel}>Duration</Text>
                <Text style={styles.averageValue}>{formatDuration(weeklyStats.averageDuration)}</Text>
              </View>
            </View>
            
            <View style={styles.averageItem}>
              <Icon name="star" size={24} color={COLORS.warning} />
              <View style={styles.averageInfo}>
                <Text style={styles.averageLabel}>Quality</Text>
                <Text style={styles.averageValue}>{weeklyStats.averageQuality}%</Text>
              </View>
            </View>
            
            <View style={styles.averageItem}>
              <Icon name="timeline" size={24} color={COLORS.primary} />
              <View style={styles.averageInfo}>
                <Text style={styles.averageLabel}>Consistency</Text>
                <Text style={styles.averageValue}>{weeklyStats.consistency}%</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  // Render sleep tips
  const renderSleepTips = () => (
    <View style={styles.tipsContainer}>
      <Text style={styles.sectionTitle}>💡 Sleep Optimization Tips</Text>
      
      {sleepTips.map((tip) => (
        <Card key={tip.id} style={styles.tipCard}>
          <Card.Content>
            <View style={styles.tipHeader}>
              <View style={styles.tipTitleRow}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <View style={styles.tipBadges}>
                  <Chip
                    style={[
                      styles.priorityChip,
                      {
                        backgroundColor:
                          tip.priority === 'high'
                            ? COLORS.error + '20'
                            : COLORS.warning + '20',
                      },
                    ]}
                    textStyle={{
                      color: tip.priority === 'high' ? COLORS.error : COLORS.warning,
                      fontSize: 10,
                    }}
                  >
                    {tip.priority.toUpperCase()}
                  </Chip>
                  {tip.implemented && (
                    <Chip
                      style={[styles.implementedChip, { backgroundColor: COLORS.success + '20' }]}
                      textStyle={{ color: COLORS.success, fontSize: 10 }}
                    >
                      ✓ DONE
                    </Chip>
                  )}
                </View>
              </View>
            </View>
            
            <Text style={styles.tipDescription}>{tip.description}</Text>
            
            <View style={styles.tipActions}>
              <Button
                mode="outlined"
                compact
                onPress={() => Alert.alert('Feature Coming Soon!', 'Learn more about this sleep tip.')}
                style={styles.tipButton}
              >
                Learn More
              </Button>
              <Button
                mode={tip.implemented ? 'outlined' : 'contained'}
                compact
                onPress={() => {
                  Vibration.vibrate(50);
                  const updatedTips = sleepTips.map(t =>
                    t.id === tip.id ? { ...t, implemented: !t.implemented } : t
                  );
                  Alert.alert(
                    tip.implemented ? 'Tip Unmarked' : 'Tip Implemented!',
                    tip.implemented
                      ? 'Keep working on building this habit.'
                      : 'Great job implementing this sleep strategy! 🌟'
                  );
                }}
                style={[
                  styles.tipButton,
                  !tip.implemented && { backgroundColor: COLORS.sleep },
                ]}
                labelStyle={{
                  color: tip.implemented ? COLORS.sleep : '#fff',
                }}
              >
                {tip.implemented ? 'Implemented' : 'Mark Done'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'today':
        return renderTodayOverview();
      case 'trends':
        return renderTrends();
      case 'tips':
        return renderSleepTips();
      default:
        return renderTodayOverview();
    }
  };

  // Render manual sleep log modal
  const renderManualLogModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.modalCard}>
          <Card.Content>
            <Text style={styles.modalTitle}>Manual Sleep Log</Text>
            
            <View style={styles.timeInputs}>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Bedtime</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => Alert.alert('Feature Coming Soon!', 'Time picker will be available soon.')}
                >
                  <Text style={styles.timeButtonText}>11:15 PM</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Wake Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => Alert.alert('Feature Coming Soon!', 'Time picker will be available soon.')}
                >
                  <Text style={styles.timeButtonText}>6:45 AM</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.qualityInput}>
              <Text style={styles.qualityLabel}>Sleep Quality: {sleepQuality}/5</Text>
              <Slider
                style={styles.qualitySlider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={sleepQuality}
                onValueChange={setSleepQuality}
                minimumTrackTintColor={COLORS.sleep}
                maximumTrackTintColor={COLORS.background}
                thumbStyle={{ backgroundColor: COLORS.sleep }}
              />
              <View style={styles.qualityLabels}>
                <Text style={styles.qualityLabelText}>Poor</Text>
                <Text style={styles.qualityLabelText}>Excellent</Text>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setModalVisible(false);
                  Alert.alert('Sleep Logged!', 'Your sleep data has been saved successfully. 😴');
                }}
                style={[styles.modalButton, { backgroundColor: COLORS.sleep }]}
                labelStyle={{ color: '#fff' }}
              >
                Save Sleep
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.sleep]}
            tintColor={COLORS.sleep}
          />
        }
      >
        {renderTabNavigation()}
        {renderContent()}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Feature Coming Soon!', 'Advanced sleep features and AI insights coming soon!')}
        color="#fff"
      />
      
      {renderManualLogModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    marginTop: -20,
    paddingHorizontal: SPACING.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    padding: 4,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: COLORS.sleep,
  },
  tabText: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  todayContainer: {
    marginBottom: SPACING.lg,
  },
  timerCard: {
    marginBottom: SPACING.md,
    borderRadius: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  timerTitle: {
    ...TEXT_STYLES.h3,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  timerContent: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  timerButton: {
    marginBottom: SPACING.md,
  },
  timerTouchable: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  timerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  timerInfo: {
    alignItems: 'center',
  },
  timerSubtext: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginBottom: 4,
  },
  smartAlarmText: {
    ...TEXT_STYLES.caption,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    borderColor: COLORS.sleep,
  },
  breakdownCard: {
    marginBottom: SPACING.md,
    borderRadius: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  sleepStages: {
    marginBottom: SPACING.md,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stageColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  stageInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stageName: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  stageValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  additionalMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    marginTop: 4,
    marginBottom: 2,
  },
  metricValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  goalCard: {
    borderRadius: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  goalTitle: {
    ...TEXT_STYLES.h3,
    marginLeft: SPACING.sm,
  },
  goalContent: {
    marginBottom: SPACING.md,
  },
  goalProgress: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  goalText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  goalChip: {
    marginHorizontal: SPACING.xs,
  },
  trendsContainer: {
    marginBottom: SPACING.lg,
  },
  trendsCard: {
    marginBottom: SPACING.md,
    borderRadius: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  trendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  periodSelector: {
    flexDirection: 'row',
  },
  periodChip: {
    marginLeft: SPACING.xs,
    borderColor: COLORS.primary,
  },
  trendsList: {
    gap: SPACING.sm,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  trendDay: {
    ...TEXT_STYLES.caption,
    width: 40,
    fontWeight: '500',
  },
  trendBars: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  trendBar: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    marginBottom: 2,
  },
  trendBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  trendValue: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
  },
  trendQuality: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 50,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  qualityText: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
    fontWeight: '500',
  },
  averagesCard: {
    borderRadius: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  averagesList: {
    gap: SPACING.md,
  },
  averageItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageInfo: {
    marginLeft: SPACING.sm,
  },
  averageLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: 2,
  },
  averageValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  tipsContainer: {
    marginBottom: SPACING.lg,
  },
  tipCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipHeader: {
    marginBottom: SPACING.sm,
  },
  tipTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tipTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    flex: 1,
    marginRight: SPACING.sm,
  },
  tipBadges: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  priorityChip: {
    height: 24,
  },
  implementedChip: {
    height: 24,
  },
  tipDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  tipActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  tipButton: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    borderRadius: 20,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  timeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  timeLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  timeButton: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.sleep + '40',
  },
  timeButtonText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.sleep,
  },
  qualityInput: {
    marginBottom: SPACING.lg,
  },
  qualityLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  qualitySlider: {
    width: '100%',
    height: 40,
  },
  qualityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  qualityLabelText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.sleep,
  },
  bottomPadding: {
    height: 100,
  },
});

export default SleepMonitoring;
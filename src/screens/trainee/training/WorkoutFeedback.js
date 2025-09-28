import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
  Vibration,
  FlatList,
  BackHandler,
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
  Badge,
  Portal,
  Modal,
  Switch,
  Slider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design constants
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
  border: '#e0e0e0',
  rest: '#9C27B0',
  recovery: '#00BCD4',
  sleep: '#3F51B5',
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

const RestPeriods = ({ navigation }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [customRestTime, setCustomRestTime] = useState(90);
  const [autoStartEnabled, setAutoStartEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  // Redux state
  const dispatch = useDispatch();
  const { 
    restHistory = [], 
    user, 
    workoutSession = null,
    recoveryScore = 85,
    sleepQuality = 7.2,
    loading = false 
  } = useSelector(state => state.training || {});

  // Mock data for development
  const mockRestData = {
    todayStats: {
      totalRest: 45, // minutes
      restPeriods: 8,
      averageRest: 5.6, // minutes
      longestRest: 12, // minutes
      recoveryRate: 92, // percentage
    },
    weeklyStats: {
      totalRestTime: 285, // minutes
      averageDaily: 40.7,
      bestDay: 'Wednesday',
      restQuality: 88,
    },
    restTypes: [
      {
        id: 1,
        name: 'Between Sets',
        icon: '⚡',
        defaultTime: 60,
        color: COLORS.primary,
        description: 'Short recovery between exercise sets',
        used: 24,
        averageTime: 58,
      },
      {
        id: 2,
        name: 'Between Exercises',
        icon: '🔄',
        defaultTime: 120,
        color: COLORS.warning,
        description: 'Moderate rest between different exercises',
        used: 12,
        averageTime: 115,
      },
      {
        id: 3,
        name: 'Active Recovery',
        icon: '🚶',
        defaultTime: 300,
        color: COLORS.recovery,
        description: 'Light movement during rest periods',
        used: 8,
        averageTime: 280,
      },
      {
        id: 4,
        name: 'Complete Rest',
        icon: '😴',
        defaultTime: 600,
        color: COLORS.rest,
        description: 'Full recovery between workouts',
        used: 3,
        averageTime: 720,
      },
    ],
    recentSessions: [
      {
        id: 1,
        workout: 'Upper Body Strength',
        date: '2024-08-27T16:30:00Z',
        restPeriods: 12,
        totalRestTime: 18.5,
        averageRest: 92,
        efficiency: 94,
        heartRateRecovery: 88,
      },
      {
        id: 2,
        workout: 'HIIT Cardio Blast',
        date: '2024-08-26T18:00:00Z',
        restPeriods: 8,
        totalRestTime: 12.3,
        averageRest: 92,
        efficiency: 91,
        heartRateRecovery: 85,
      },
      {
        id: 3,
        workout: 'Leg Day Power',
        date: '2024-08-25T17:15:00Z',
        restPeriods: 15,
        totalRestTime: 25.2,
        averageRest: 101,
        efficiency: 89,
        heartRateRecovery: 92,
      },
    ],
    recoveryTips: [
      {
        id: 1,
        title: 'Hydration Check 💧',
        description: 'Drink water during rest periods to maintain performance',
        priority: 'high',
        category: 'nutrition',
      },
      {
        id: 2,
        title: 'Deep Breathing 🫁',
        description: 'Practice deep breathing to enhance recovery',
        priority: 'medium',
        category: 'technique',
      },
      {
        id: 3,
        title: 'Light Stretching 🤸',
        description: 'Gentle stretches can improve blood flow',
        priority: 'medium',
        category: 'movement',
      },
      {
        id: 4,
        title: 'Monitor Heart Rate ❤️',
        description: 'Let your heart rate drop to 120-130 BPM',
        priority: 'high',
        category: 'monitoring',
      },
    ],
  };

  useEffect(() => {
    // Initialize animations
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

    // Set up timer pulse animation
    const pulseAnimation = Animated.loop(
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

    if (isTimerRunning) {
      pulseAnimation.start();
    } else {
      pulseAnimation.stop();
      pulseAnim.setValue(1);
    }

    return () => {
      pulseAnimation.stop();
    };
  }, [isTimerRunning]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      // Timer completed
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerRunning, timerSeconds]);

  // Handle back button during active timer
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isTimerRunning) {
        Alert.alert(
          'Timer Active ⏰',
          'You have an active rest timer. Do you want to stop it?',
          [
            { text: 'Continue Timer', style: 'cancel' },
            { 
              text: 'Stop Timer', 
              style: 'destructive',
              onPress: () => handleStopTimer()
            },
          ]
        );
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isTimerRunning]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchRestData());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh rest data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRestTimer = (restType) => {
    setActiveTimer(restType);
    setTimerSeconds(restType.defaultTime);
    setIsTimerRunning(true);
    setTimerModalVisible(true);
    
    if (vibrationEnabled) {
      Vibration.vibrate(100);
    }
  };

  const handleTimerComplete = () => {
    setIsTimerRunning(false);
    setTimerModalVisible(false);
    
    if (soundEnabled) {
      // Play completion sound
    }
    
    if (vibrationEnabled) {
      Vibration.vibrate([200, 100, 200, 100, 200]);
    }
    
    Alert.alert(
      'Rest Complete! 🎉',
      'Your rest period is over. Ready for the next set?',
      [
        {
          text: 'Add 30s',
          style: 'cancel',
          onPress: () => {
            setTimerSeconds(30);
            setIsTimerRunning(true);
            setTimerModalVisible(true);
          }
        },
        {
          text: "I'm Ready! 💪",
          onPress: () => {
            // Log rest period completion
            logRestPeriod();
          }
        }
      ]
    );
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    if (vibrationEnabled) {
      Vibration.vibrate(50);
    }
  };

  const handleResumeTimer = () => {
    setIsTimerRunning(true);
    if (vibrationEnabled) {
      Vibration.vibrate(50);
    }
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setTimerModalVisible(false);
    setActiveTimer(null);
    setTimerSeconds(0);
  };

  const logRestPeriod = () => {
    // Log completed rest period
    console.log('Rest period completed:', activeTimer);
    setActiveTimer(null);
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Today's Stats */}
      <Card style={styles.statsCard}>
        <LinearGradient
          colors={[COLORS.rest, COLORS.recovery]}
          style={styles.statsGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.statsTitle}>Today's Recovery 🌟</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockRestData.todayStats.totalRest}</Text>
              <Text style={styles.statLabel}>Minutes Rest</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockRestData.todayStats.restPeriods}</Text>
              <Text style={styles.statLabel}>Rest Periods</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockRestData.todayStats.recoveryRate}%</Text>
              <Text style={styles.statLabel}>Recovery Rate</Text>
            </View>
          </View>
        </LinearGradient>
      </Card>

      {/* Recovery Score */}
      <Card style={styles.scoreCard}>
        <Card.Content>
          <View style={styles.scoreHeader}>
            <Icon name="favorite" size={24} color={COLORS.error} />
            <Text style={styles.scoreTitle}>Recovery Score</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{recoveryScore}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <ProgressBar
            progress={recoveryScore / 100}
            color={recoveryScore > 80 ? COLORS.success : recoveryScore > 60 ? COLORS.warning : COLORS.error}
            style={styles.scoreProgress}
          />
          <Text style={styles.scoreDescription}>
            {recoveryScore > 80 ? 'Excellent recovery! 🌟' : 
             recoveryScore > 60 ? 'Good recovery 👍' : 'Focus on rest 😴'}
          </Text>
        </Card.Content>
      </Card>

      {/* Quick Rest Buttons */}
      <Text style={styles.sectionTitle}>Quick Rest Timers ⏱️</Text>
      <FlatList
        data={mockRestData.restTypes}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => startRestTimer(item)}
            style={styles.restTypeCard}
            activeOpacity={0.8}
          >
            <Surface style={[styles.restTypeSurface, { borderLeftColor: item.color }]}>
              <View style={styles.restTypeContent}>
                <View style={styles.restTypeHeader}>
                  <Text style={styles.restTypeEmoji}>{item.icon}</Text>
                  <View style={styles.restTypeInfo}>
                    <Text style={styles.restTypeName}>{item.name}</Text>
                    <Text style={styles.restTypeDescription}>{item.description}</Text>
                  </View>
                  <Text style={styles.restTypeTime}>{formatTime(item.defaultTime)}</Text>
                </View>
                <View style={styles.restTypeStats}>
                  <Text style={styles.restTypeStat}>Used {item.used} times</Text>
                  <Text style={styles.restTypeStat}>Avg: {formatTime(item.averageTime)}</Text>
                </View>
              </View>
            </Surface>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Recovery Tips */}
      <Text style={styles.sectionTitle}>Recovery Tips 💡</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tipsContainer}
        contentContainerStyle={styles.tipsContent}
      >
        {mockRestData.recoveryTips.map((tip) => (
          <Card key={tip.id} style={styles.tipCard}>
            <Card.Content>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.description}</Text>
              <Chip
                mode="outlined"
                style={[styles.tipChip, {
                  borderColor: tip.priority === 'high' ? COLORS.error : COLORS.warning
                }]}
                textStyle={{
                  color: tip.priority === 'high' ? COLORS.error : COLORS.warning
                }}
              >
                {tip.priority.toUpperCase()}
              </Chip>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Recent Sessions 📊</Text>
      <FlatList
        data={mockRestData.recentSessions}
        renderItem={({ item }) => (
          <Card style={styles.sessionCard}>
            <Card.Content>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionWorkout}>{item.workout}</Text>
                <Text style={styles.sessionDate}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.sessionStats}>
                <View style={styles.sessionStat}>
                  <Icon name="timer" size={16} color={COLORS.primary} />
                  <Text style={styles.sessionStatText}>{item.totalRestTime}min total</Text>
                </View>
                <View style={styles.sessionStat}>
                  <Icon name="repeat" size={16} color={COLORS.warning} />
                  <Text style={styles.sessionStatText}>{item.restPeriods} periods</Text>
                </View>
                <View style={styles.sessionStat}>
                  <Icon name="trending-up" size={16} color={COLORS.success} />
                  <Text style={styles.sessionStatText}>{item.efficiency}% efficiency</Text>
                </View>
              </View>
              
              <View style={styles.sessionMetrics}>
                <Text style={styles.metricLabel}>Heart Rate Recovery</Text>
                <ProgressBar
                  progress={item.heartRateRecovery / 100}
                  color={COLORS.error}
                  style={styles.metricProgress}
                />
                <Text style={styles.metricValue}>{item.heartRateRecovery}%</Text>
              </View>
            </Card.Content>
          </Card>
        )}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );

  const renderTimerModal = () => (
    <Portal>
      <Modal
        visible={timerModalVisible}
        onDismiss={() => {
          if (!isTimerRunning) {
            setTimerModalVisible(false);
          }
        }}
        contentContainerStyle={styles.timerModalContainer}
      >
        <BlurView style={styles.timerBlur} blurType="light" blurAmount={10}>
          <Animated.View
            style={[
              styles.timerContent,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            {activeTimer && (
              <>
                <Text style={styles.timerTitle}>{activeTimer.name}</Text>
                <Text style={styles.timerEmoji}>{activeTimer.icon}</Text>
                <Text style={styles.timerDisplay}>{formatTime(timerSeconds)}</Text>
                
                <View style={styles.timerControls}>
                  {isTimerRunning ? (
                    <IconButton
                      icon="pause"
                      size={48}
                      iconColor="#ffffff"
                      style={styles.timerButton}
                      onPress={handlePauseTimer}
                    />
                  ) : (
                    <IconButton
                      icon="play-arrow"
                      size={48}
                      iconColor="#ffffff"
                      style={styles.timerButton}
                      onPress={handleResumeTimer}
                    />
                  )}
                  <IconButton
                    icon="stop"
                    size={36}
                    iconColor="#ffffff"
                    style={styles.timerButtonSecondary}
                    onPress={handleStopTimer}
                  />
                </View>
                
                <View style={styles.timerProgress}>
                  <ProgressBar
                    progress={activeTimer ? (activeTimer.defaultTime - timerSeconds) / activeTimer.defaultTime : 0}
                    color="#ffffff"
                    style={styles.timerProgressBar}
                  />
                </View>
              </>
            )}
          </Animated.View>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderSettingsModal = () => (
    <Portal>
      <Modal
        visible={settingsModalVisible}
        onDismiss={() => setSettingsModalVisible(false)}
        contentContainerStyle={styles.settingsModalContainer}
      >
        <Card style={styles.settingsCard}>
          <Card.Content>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Rest Settings ⚙️</Text>
              <IconButton
                icon="close"
                onPress={() => setSettingsModalVisible(false)}
              />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Default Rest Time</Text>
              <Text style={styles.settingValue}>{formatTime(customRestTime)}</Text>
              <Slider
                style={styles.slider}
                minimumValue={30}
                maximumValue={300}
                step={15}
                value={customRestTime}
                onValueChange={setCustomRestTime}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.border}
                thumbStyle={{ backgroundColor: COLORS.primary }}
              />
            </View>
            
            <View style={styles.settingToggle}>
              <Text style={styles.settingLabel}>Auto-start Next Set</Text>
              <Switch
                value={autoStartEnabled}
                onValueChange={setAutoStartEnabled}
                thumbColor={COLORS.primary}
                trackColor={{ true: COLORS.primary + '50' }}
              />
            </View>
            
            <View style={styles.settingToggle}>
              <Text style={styles.settingLabel}>Sound Notifications</Text>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                thumbColor={COLORS.primary}
                trackColor={{ true: COLORS.primary + '50' }}
              />
            </View>
            
            <View style={styles.settingToggle}>
              <Text style={styles.settingLabel}>Vibration Feedback</Text>
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                thumbColor={COLORS.primary}
                trackColor={{ true: COLORS.primary + '50' }}
              />
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <LinearGradient
        colors={[COLORS.rest, COLORS.recovery]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Rest Periods 😴</Text>
            <IconButton
              icon="settings"
              iconColor="#ffffff"
              onPress={() => setSettingsModalVisible(true)}
            />
          </View>
          <Text style={styles.headerSubtitle}>
            Recovery is where the magic happens! ✨
          </Text>
          
          {isTimerRunning && activeTimer && (
            <TouchableOpacity
              onPress={() => setTimerModalVisible(true)}
              style={styles.activeTimerBanner}
            >
              <Text style={styles.activeTimerText}>
                {activeTimer.name}: {formatTime(timerSeconds)} ⏰
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.rest]}
            tintColor={COLORS.rest}
          />
        }
      >
        <Animated.View
          style={[
            styles.animatedContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {activeTab === 'overview' ? renderOverviewTab() : renderHistoryTab()}
        </Animated.View>
      </ScrollView>

      {renderTimerModal()}
      {renderSettingsModal()}

      <FAB
        style={styles.fab}
        icon="timer"
        label={isTimerRunning ? formatTime(timerSeconds) : "Quick Rest"}
        onPress={() => {
          if (isTimerRunning) {
            setTimerModalVisible(true);
          } else {
            Alert.alert(
              'Custom Timer ⏱️',
              'Set a custom rest period',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: '1 min',
                  onPress: () => startRestTimer({ 
                    id: 'custom', 
                    name: 'Custom Rest', 
                    icon: '⏱️', 
                    defaultTime: 60 
                  })
                },
                {
                  text: '2 min',
                  onPress: () => startRestTimer({ 
                    id: 'custom', 
                    name: 'Custom Rest', 
                    icon: '⏱️', 
                    defaultTime: 120 
                  })
                },
                {
                  text: '3 min',
                  onPress: () => startRestTimer({ 
                    id: 'custom', 
                    name: 'Custom Rest', 
                    icon: '⏱️', 
                    defaultTime: 180 
                  })
                },
              ]
            );
          }
        }}
        color="#ffffff"
        extended={!isTimerRunning}
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  activeTimerBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginTop: SPACING.sm,
  },
  activeTimerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: COLORS.rest,
  },
  tabText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  animatedContent: {
    flex: 1,
  },
  tabContent: {
    paddingTop: SPACING.lg,
    paddingBottom: 120,
  },
  statsCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  statsTitle: {
    ...TEXT_STYLES.subtitle,
    color: '#ffffff',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  scoreCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 3,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreTitle: {
    ...TEXT_STYLES.subtitle,
    marginLeft: SPACING.sm,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  scoreMax: {
    fontSize: 20,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  scoreProgress: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  scoreDescription: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    fontWeight: '600',
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  restTypeCard: {
    marginBottom: SPACING.sm,
  },
  restTypeSurface: {
    borderRadius: 12,
    elevation: 2,
    backgroundColor: COLORS.surface,
    borderLeftWidth: 4,
  },
  restTypeContent: {
    padding: SPACING.md,
  },
  restTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  restTypeEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  restTypeInfo: {
    flex: 1,
  },
  restTypeName: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.xs,
  },
  restTypeDescription: {
    ...TEXT_STYLES.caption,
    lineHeight: 18,
  },
  restTypeTime: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  restTypeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  restTypeStat: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  tipsContainer: {
    marginBottom: SPACING.xl,
  },
  tipsContent: {
    paddingHorizontal: SPACING.xs,
  },
  tipCard: {
    width: width * 0.7,
    marginHorizontal: SPACING.sm,
    borderRadius: 12,
    elevation: 2,
  },
  tipTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  tipDescription: {
    ...TEXT_STYLES.caption,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  tipChip: {
    alignSelf: 'flex-start',
  },
  sessionCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sessionWorkout: {
    ...TEXT_STYLES.subtitle,
    flex: 1,
  },
  sessionDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sessionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionStatText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  sessionMetrics: {
    marginTop: SPACING.sm,
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  metricProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  metricValue: {
    ...TEXT_STYLES.caption,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  separator: {
    height: SPACING.sm,
  },
  timerModalContainer: {
    flex: 1,
  },
  timerBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  timerContent: {
    backgroundColor: COLORS.rest,
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: width * 0.8,
  },
  timerTitle: {
    ...TEXT_STYLES.subtitle,
    color: '#ffffff',
    marginBottom: SPACING.sm,
  },
  timerEmoji: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: SPACING.xl,
    fontFamily: 'monospace',
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: SPACING.sm,
  },
  timerButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: SPACING.sm,
  },
  timerProgress: {
    width: '100%',
  },
  timerProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  settingsModalContainer: {
    margin: SPACING.lg,
  },
  settingsCard: {
    borderRadius: 20,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  settingsTitle: {
    ...TEXT_STYLES.subtitle,
  },
  settingItem: {
    marginBottom: SPACING.lg,
  },
  settingToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  settingLabel: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  settingValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.rest,
  },
});

export default RestPeriods;
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
  TouchableOpacity,
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
  Badge,
  Switch,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const WaterIntake = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [todayIntake, setTodayIntake] = useState(1850); // ml
  const [dailyGoal, setDailyGoal] = useState(3000); // ml
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [waterLog, setWaterLog] = useState([]);
  
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { loading } = useSelector(state => state.app);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const waveAnim = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Entrance animation
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

    // Wave animation for water effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for interactive elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Quick add volumes
  const quickVolumes = [
    { amount: 250, label: '250ml', icon: '🥃', type: 'glass' },
    { amount: 500, label: '500ml', icon: '🍶', type: 'bottle' },
    { amount: 750, label: '750ml', icon: '🧴', type: 'large bottle' },
    { amount: 1000, label: '1L', icon: '🪣', type: 'liter' },
  ];

  // Mock water log data
  const todayWaterLog = [
    { time: '07:30', amount: 250, type: 'Morning water', icon: '☀️' },
    { time: '09:15', amount: 300, type: 'Pre-workout', icon: '💪' },
    { time: '10:45', amount: 500, type: 'During workout', icon: '🏋️' },
    { time: '12:00', amount: 250, type: 'Lunch water', icon: '🍽️' },
    { time: '14:30', amount: 200, type: 'Afternoon sip', icon: '☕' },
    { time: '16:15', amount: 350, type: 'Post-snack', icon: '🍎' },
  ];

  // Weekly progress data
  const weeklyData = [
    { day: 'Mon', intake: 2800, goal: 3000, percentage: 93 },
    { day: 'Tue', intake: 3200, goal: 3000, percentage: 107 },
    { day: 'Wed', intake: 2600, goal: 3000, percentage: 87 },
    { day: 'Thu', intake: 3100, goal: 3000, percentage: 103 },
    { day: 'Fri', intake: 2900, goal: 3000, percentage: 97 },
    { day: 'Sat', intake: 3400, goal: 3000, percentage: 113 },
    { day: 'Sun', intake: 1850, goal: 3000, percentage: 62 }, // Today
  ];

  const hydrationTips = [
    { icon: '🌅', title: 'Start Early', tip: 'Drink a glass of water immediately upon waking' },
    { icon: '💪', title: 'Pre-Workout', tip: 'Hydrate 2-3 hours before exercise' },
    { icon: '🍎', title: 'With Meals', tip: 'Drink water with every meal and snack' },
    { icon: '⏰', title: 'Set Reminders', tip: 'Use hourly reminders to stay consistent' },
    { icon: '🌡️', title: 'Temperature Matters', tip: 'Cool water is absorbed faster than warm' },
    { icon: '🚰', title: 'Quality First', tip: 'Use filtered water when possible' },
  ];

  const currentProgress = (todayIntake / dailyGoal) * 100;
  const remainingIntake = Math.max(0, dailyGoal - todayIntake);
  const isGoalMet = todayIntake >= dailyGoal;

  const addWater = (amount) => {
    setTodayIntake(prev => prev + amount);
    
    // Add to log
    const newEntry = {
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      amount,
      type: 'Manual add',
      icon: '💧'
    };
    setWaterLog(prev => [...prev, newEntry]);

    // Vibration feedback
    Vibration.vibrate(50);
    
    // Success message
    if (todayIntake + amount >= dailyGoal && todayIntake < dailyGoal) {
      Alert.alert('Congratulations! 🎉', 'You\'ve reached your daily hydration goal!', [
        { text: 'Awesome!', style: 'default' }
      ]);
    } else {
      Alert.alert('Water Added! 💧', `+${amount}ml recorded successfully`, [
        { text: 'OK', style: 'default' }
      ]);
    }
  };

  const renderWaterBottle = () => {
    const bottleHeight = 200;
    const fillHeight = (currentProgress / 100) * bottleHeight;
    const fillColor = currentProgress >= 100 ? '#2ecc71' : currentProgress >= 75 ? '#3498db' : currentProgress >= 50 ? '#f39c12' : '#e74c3c';
    
    return (
      <View style={styles.bottleContainer}>
        <View style={styles.bottle}>
          <Animated.View 
            style={[
              styles.waterFill, 
              { 
                height: fillHeight,
                backgroundColor: fillColor,
                transform: [
                  {
                    translateY: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              }
            ]} 
          />
          <View style={styles.bottleOverlay}>
            <Text style={styles.progressText}>{Math.round(currentProgress)}%</Text>
            <Text style={styles.intakeText}>{todayIntake}ml</Text>
            <Text style={styles.goalText}>of {dailyGoal}ml</Text>
          </View>
        </View>
        
        <View style={styles.bottleLabels}>
          <View style={styles.progressRings}>
            {[25, 50, 75, 100].map((milestone, index) => (
              <View 
                key={milestone}
                style={[
                  styles.progressRing,
                  currentProgress >= milestone && styles.progressRingActive
                ]}
              >
                <Text style={[
                  styles.ringLabel,
                  currentProgress >= milestone && styles.ringLabelActive
                ]}>
                  {milestone}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderQuickAdd = () => (
    <Card style={styles.quickAddCard}>
      <Card.Content>
        <View style={styles.quickAddHeader}>
          <Icon name="add-circle" size={24} color={COLORS.primary} />
          <Text style={styles.quickAddTitle}>Quick Add 💧</Text>
        </View>
        
        <View style={styles.quickAddGrid}>
          {quickVolumes.map((volume, index) => (
            <Animated.View 
              key={index} 
              style={[
                styles.quickAddButton,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <TouchableOpacity
                onPress={() => addWater(volume.amount)}
                style={styles.quickAddTouchable}
              >
                <Text style={styles.quickAddIcon}>{volume.icon}</Text>
                <Text style={styles.quickAddLabel}>{volume.label}</Text>
                <Text style={styles.quickAddType}>{volume.type}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        
        <Button
          mode="outlined"
          onPress={() => Alert.alert('Feature Coming Soon', 'Custom amount entry will be available soon!')}
          style={styles.customAddButton}
          icon="edit"
        >
          Add Custom Amount
        </Button>
      </Card.Content>
    </Card>
  );

  const renderTodaysProgress = () => (
    <Card style={styles.progressCard}>
      <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.progressHeader}>
        <Text style={styles.progressHeaderTitle}>Today's Hydration 🏆</Text>
        <Text style={styles.progressHeaderSubtitle}>
          {isGoalMet ? 'Goal achieved!' : `${remainingIntake}ml remaining`}
        </Text>
      </LinearGradient>
      
      <Card.Content style={styles.progressContent}>
        <View style={styles.progressStats}>
          <View style={styles.statColumn}>
            <Icon name="local-drink" size={20} color="#3498db" />
            <Text style={styles.statValue}>{todayIntake}ml</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          
          <View style={styles.statColumn}>
            <Icon name="flag" size={20} color={COLORS.primary} />
            <Text style={styles.statValue}>{dailyGoal}ml</Text>
            <Text style={styles.statLabel}>Goal</Text>
          </View>
          
          <View style={styles.statColumn}>
            <Icon name="trending-up" size={20} color="#2ecc71" />
            <Text style={styles.statValue}>{Math.round(currentProgress)}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>
        
        <ProgressBar 
          progress={Math.min(currentProgress / 100, 1)}
          color={isGoalMet ? '#2ecc71' : '#3498db'}
          style={styles.mainProgressBar}
        />
        
        <View style={styles.hydrationStatus}>
          <Icon 
            name={isGoalMet ? 'check-circle' : 'schedule'} 
            size={20} 
            color={isGoalMet ? '#2ecc71' : '#f39c12'} 
          />
          <Text style={[
            styles.statusText,
            { color: isGoalMet ? '#2ecc71' : '#f39c12' }
          ]}>
            {isGoalMet ? 'Excellently hydrated!' : 'Keep drinking to reach your goal'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTodaysLog = () => (
    <Card style={styles.logCard}>
      <Card.Content>
        <View style={styles.logHeader}>
          <Icon name="history" size={24} color={COLORS.primary} />
          <Text style={styles.logTitle}>Today's Water Log 📝</Text>
          <Badge style={styles.logBadge}>{todayWaterLog.length}</Badge>
        </View>
        
        <ScrollView style={styles.logScroll} nestedScrollEnabled>
          {todayWaterLog.map((entry, index) => (
            <Surface key={index} style={styles.logEntry}>
              <View style={styles.logTime}>
                <Text style={styles.logTimeText}>{entry.time}</Text>
                <Text style={styles.logIcon}>{entry.icon}</Text>
              </View>
              
              <View style={styles.logDetails}>
                <Text style={styles.logAmount}>+{entry.amount}ml</Text>
                <Text style={styles.logType}>{entry.type}</Text>
              </View>
              
              <View style={styles.logWave}>
                <Icon name="water-drop" size={16} color="#3498db" />
              </View>
            </Surface>
          ))}
        </ScrollView>
        
        <Button
          mode="text"
          onPress={() => Alert.alert('Feature Coming Soon', 'Detailed log view will be available soon!')}
          style={styles.viewLogButton}
        >
          View Full History
        </Button>
      </Card.Content>
    </Card>
  );

  const renderWeeklyChart = () => (
    <Card style={styles.chartCard}>
      <Card.Content>
        <View style={styles.chartHeader}>
          <Icon name="bar-chart" size={24} color={COLORS.primary} />
          <Text style={styles.chartTitle}>Weekly Progress 📊</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
          <View style={styles.chartContainer}>
            {weeklyData.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <View style={styles.dayBar}>
                  <View 
                    style={[
                      styles.dayBarFill,
                      { 
                        height: `${Math.min(day.percentage, 100)}%`,
                        backgroundColor: day.percentage >= 100 ? '#2ecc71' : day.percentage >= 75 ? '#3498db' : '#f39c12'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.dayLabel}>{day.day}</Text>
                <Text style={styles.dayPercentage}>{day.percentage}%</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderHydrationTips = () => (
    <Card style={styles.tipsCard}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.tipsHeader}>
        <Icon name="lightbulb" size={24} color="#fff" />
        <Text style={styles.tipsTitle}>Hydration Tips 💡</Text>
      </LinearGradient>
      
      <Card.Content style={styles.tipsContent}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {hydrationTips.map((tip, index) => (
            <Surface key={index} style={styles.tipCard}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipText}>{tip.tip}</Text>
            </Surface>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderReminders = () => (
    <Card style={styles.reminderCard}>
      <Card.Content>
        <View style={styles.reminderHeader}>
          <Icon name="notifications" size={24} color={COLORS.primary} />
          <Text style={styles.reminderTitle}>Smart Reminders ⏰</Text>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            color={COLORS.primary}
          />
        </View>
        
        <Text style={styles.reminderDescription}>
          Get gentle reminders every hour to stay hydrated throughout the day
        </Text>
        
        {reminderEnabled && (
          <Surface style={styles.reminderSettings}>
            <Text style={styles.nextReminderText}>Next reminder: 3:00 PM</Text>
            <Button
              mode="outlined"
              compact
              onPress={() => Alert.alert('Feature Coming Soon', 'Reminder customization will be available soon!')}
            >
              Customize
            </Button>
          </Surface>
        )}
      </Card.Content>
    </Card>
  );

  const renderGoalSetting = () => (
    <Card style={styles.goalCard}>
      <Card.Content>
        <View style={styles.goalHeader}>
          <Icon name="flag" size={24} color={COLORS.primary} />
          <Text style={styles.goalTitle}>Daily Goal 🎯</Text>
        </View>
        
        <View style={styles.goalDisplay}>
          <Text style={styles.currentGoal}>{dailyGoal}ml</Text>
          <Text style={styles.goalRecommendation}>
            Recommended: 2500-3500ml based on your activity level
          </Text>
        </View>
        
        <View style={styles.goalActions}>
          <Button
            mode="outlined"
            compact
            onPress={() => Alert.alert('Feature Coming Soon', 'Goal adjustment will be available soon!')}
            style={styles.goalButton}
          >
            Adjust Goal
          </Button>
          <Button
            mode="text"
            compact
            onPress={() => Alert.alert('Feature Coming Soon', 'Smart goal calculation will be available soon!')}
          >
            Calculate Smart Goal
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.header}>
        <Text style={styles.headerTitle}>Water Intake 💧</Text>
        <Text style={styles.headerSubtitle}>Stay hydrated, perform better</Text>
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
          style={styles.scrollView}
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
          {/* Water Bottle Visualization */}
          <View style={styles.visualSection}>
            {renderWaterBottle()}
          </View>

          {/* Today's Progress */}
          {renderTodaysProgress()}

          {/* Quick Add Buttons */}
          {renderQuickAdd()}

          {/* Goal Setting */}
          {renderGoalSetting()}

          {/* Today's Log */}
          {renderTodaysLog()}

          {/* Weekly Chart */}
          {renderWeeklyChart()}

          {/* Smart Reminders */}
          {renderReminders()}

          {/* Hydration Tips */}
          {renderHydrationTips()}

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Quick Add', 'Choose amount to add:', [
          { text: '250ml', onPress: () => addWater(250) },
          { text: '500ml', onPress: () => addWater(500) },
          { text: 'Cancel', style: 'cancel' }
        ])}
        color="#fff"
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
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  visualSection: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  bottleContainer: {
    alignItems: 'center',
  },
  bottle: {
    width: 120,
    height: 200,
    borderWidth: 3,
    borderColor: '#3498db',
    borderRadius: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f8f9ff',
  },
  waterFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
    opacity: 0.8,
  },
  bottleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  intakeText: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  goalText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bottleLabels: {
    marginTop: SPACING.lg,
  },
  progressRings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
  },
  progressRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  progressRingActive: {
    borderColor: '#3498db',
    backgroundColor: '#3498db',
  },
  ringLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  ringLabelActive: {
    color: '#fff',
  },
  quickAddCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  quickAddHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  quickAddTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginLeft: SPACING.md,
    fontWeight: 'bold',
  },
  quickAddGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  quickAddButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  quickAddTouchable: {
    backgroundColor: '#f0f8ff',
    padding: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quickAddIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  quickAddLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  quickAddType: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  customAddButton: {
    borderColor: COLORS.primary,
  },
  progressCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  progressHeader: {
    padding: SPACING.lg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  progressHeaderTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  progressHeaderSubtitle: {
    ...TEXT_STYLES.body,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  progressContent: {
    padding: SPACING.lg,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  statColumn: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  mainProgressBar: {
    height: 12,
    borderRadius: 6,
    marginBottom: SPACING.lg,
  },
  hydrationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
  },
  logCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginLeft: SPACING.md,
    fontWeight: 'bold',
    flex: 1,
  },
  logBadge: {
    backgroundColor: COLORS.primary,
  },
  logScroll: {
    maxHeight: 200,
    marginBottom: SPACING.md,
  },
  logEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: 12,
    elevation: 1,
  },
  logTime: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  logTimeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  logIcon: {
    fontSize: 16,
    marginTop: SPACING.xs,
  },
  logDetails: {
    flex: 1,
  },
  logAmount: {
    ...TEXT_STYLES.body,
    color: '#3498db',
    fontWeight: 'bold',
  },
  logType: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  logWave: {
    marginLeft: SPACING.sm,
  },
  viewLogButton: {
    alignSelf: 'center',
  },
  chartCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  chartTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginLeft: SPACING.md,
    fontWeight: 'bold',
  },
  chartScroll: {
    marginHorizontal: -SPACING.md,
  },
  chartContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    height: 150,
    alignItems: 'flex-end',
  },
  dayColumn: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  dayBar: {
    width: 24,
    height: 100,
    backgroundColor: COLORS.border,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  dayBarFill: {
    width: '100%',
    borderRadius: 12,
    position: 'absolute',
    bottom: 0,
  },
  dayLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  dayPercentage: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    fontSize: 10,
  },
  tipsCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tipsTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    marginLeft: SPACING.md,
    fontWeight: 'bold',
  },
  tipsContent: {
    paddingVertical: SPACING.lg,
    paddingLeft: SPACING.lg,
  },
  tipCard: {
    width: 140,
    backgroundColor: '#f0f8ff',
    padding: SPACING.md,
    borderRadius: 12,
    marginRight: SPACING.md,
    elevation: 2,
    alignItems: 'center',
  },
  tipIcon: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  tipTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  tipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  reminderCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  reminderTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginLeft: SPACING.md,
    fontWeight: 'bold',
    flex: 1,
  },
  reminderDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  reminderSettings: {
    backgroundColor: '#f0f8ff',
    padding: SPACING.md,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextReminderText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  goalCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  goalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginLeft: SPACING.md,
    fontWeight: 'bold',
  },
  goalDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  currentGoal: {
    ...TEXT_STYLES.h1,
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 32,
  },
  goalRecommendation: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  goalButton: {
    borderColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default WaterIntake;
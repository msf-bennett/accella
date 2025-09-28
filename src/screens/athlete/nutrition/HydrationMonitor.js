import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Vibration,
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
  Divider,
  Switch,
  Slider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  white: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  info: '#2196F3',
  hydration: '#00BCD4',
  light: '#E3F2FD',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const HydrationMonitoring = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, hydrationData, goals } = useSelector(state => ({
    user: state.auth.user,
    hydrationData: state.nutrition.hydrationData,
    goals: state.nutrition.hydrationGoals,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [dailyIntake, setDailyIntake] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(8);
  const [customAmount, setCustomAmount] = useState(250);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderInterval, setReminderInterval] = useState(60);
  const [selectedUnit, setSelectedUnit] = useState('ml');
  const [hydrationLevel, setHydrationLevel] = useState('optimal');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const dropletAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Quick add amounts (ml)
  const quickAmounts = [
    { label: '🥤 Glass', amount: 250, icon: '💧' },
    { label: '🍼 Bottle', amount: 500, icon: '🍼' },
    { label: '🏃 Sports', amount: 750, icon: '⚡' },
    { label: '💪 Large', amount: 1000, icon: '💪' },
  ];

  // Mock hydration history
  const [hydrationHistory] = useState([
    { id: '1', time: '07:30 AM', amount: 250, type: 'glass', note: 'Morning hydration' },
    { id: '2', time: '09:15 AM', amount: 500, type: 'bottle', note: 'Pre-workout' },
    { id: '3', time: '10:45 AM', amount: 750, type: 'sports', note: 'During workout' },
    { id: '4', time: '12:30 PM', amount: 250, type: 'glass', note: 'With lunch' },
    { id: '5', time: '02:45 PM', amount: 500, type: 'bottle', note: 'Afternoon boost' },
    { id: '6', time: '05:20 PM', amount: 250, type: 'glass', note: 'Pre-dinner' },
  ]);

  // Weekly hydration data for trends
  const [weeklyData] = useState([
    { day: 'Mon', intake: 2100, goal: 2000, percentage: 105 },
    { day: 'Tue', intake: 1850, goal: 2000, percentage: 92.5 },
    { day: 'Wed', intake: 2250, goal: 2000, percentage: 112.5 },
    { day: 'Thu', intake: 1950, goal: 2000, percentage: 97.5 },
    { day: 'Fri', intake: 2300, goal: 2000, percentage: 115 },
    { day: 'Sat', intake: 2150, goal: 2000, percentage: 107.5 },
    { day: 'Sun', intake: 1900, goal: 2000, percentage: 95 },
  ]);

  // Calculate current intake from history
  useEffect(() => {
    const totalToday = hydrationHistory.reduce((sum, entry) => sum + entry.amount, 0);
    setDailyIntake(totalToday);
  }, [hydrationHistory]);

  // Determine hydration level
  useEffect(() => {
    const percentage = (dailyIntake / (dailyGoal * 250)) * 100;
    if (percentage >= 100) setHydrationLevel('optimal');
    else if (percentage >= 75) setHydrationLevel('good');
    else if (percentage >= 50) setHydrationLevel('moderate');
    else setHydrationLevel('low');
  }, [dailyIntake, dailyGoal]);

  // Animations
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
      Animated.timing(progressAnim, {
        toValue: Math.min(dailyIntake / (dailyGoal * 250), 1),
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();

    // Wave animation
    const waveAnimation = Animated.loop(
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
    );
    waveAnimation.start();

    // Droplet animation
    const dropletAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(dropletAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(dropletAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    dropletAnimation.start();
  }, [fadeAnim, slideAnim, progressAnim, waveAnim, dropletAnim, dailyIntake, dailyGoal]);

  // Handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('🔄 Refreshed!', 'Your hydration data has been synced successfully.');
    }, 2000);
  }, []);

  const addWaterIntake = (amount) => {
    setDailyIntake(prev => prev + amount);
    Vibration.vibrate([50, 100, 50]);
    
    // Show motivational message based on progress
    const newTotal = dailyIntake + amount;
    const percentage = (newTotal / (dailyGoal * 250)) * 100;
    
    if (percentage >= 100 && dailyIntake < dailyGoal * 250) {
      Alert.alert('🎉 Goal Achieved!', 'Congratulations! You\'ve reached your daily hydration goal!');
    } else if (percentage >= 50 && (dailyIntake / (dailyGoal * 250)) * 100 < 50) {
      Alert.alert('💪 Halfway There!', 'Great progress! You\'re halfway to your hydration goal.');
    }
  };

  const removeWaterIntake = (amount) => {
    if (dailyIntake >= amount) {
      setDailyIntake(prev => prev - amount);
      Vibration.vibrate(50);
    }
  };

  const resetDailyIntake = () => {
    Alert.alert(
      '🔄 Reset Hydration',
      'Are you sure you want to reset today\'s hydration tracking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setDailyIntake(0);
            Alert.alert('✅ Reset Complete!', 'Your daily hydration has been reset.');
          },
        },
      ]
    );
  };

  const getHydrationStatus = () => {
    const percentage = (dailyIntake / (dailyGoal * 250)) * 100;
    if (percentage >= 100) return { status: 'Excellent!', color: COLORS.success, icon: '🌟' };
    if (percentage >= 75) return { status: 'Good Progress', color: COLORS.info, icon: '👍' };
    if (percentage >= 50) return { status: 'Keep Going', color: COLORS.warning, icon: '💪' };
    return { status: 'Need More Water', color: COLORS.error, icon: '💧' };
  };

  const getHydrationColor = () => {
    switch (hydrationLevel) {
      case 'optimal': return COLORS.success;
      case 'good': return COLORS.info;
      case 'moderate': return COLORS.warning;
      case 'low': return COLORS.error;
      default: return COLORS.hydration;
    }
  };

  // Render quick add button
  const renderQuickAddButton = ({ item, index }) => (
    <TouchableOpacity
      key={index}
      style={[styles.quickAddButton, { backgroundColor: `${COLORS.hydration}15` }]}
      onPress={() => addWaterIntake(item.amount)}
    >
      <Text style={styles.quickAddIcon}>{item.icon}</Text>
      <Text style={styles.quickAddLabel}>{item.label}</Text>
      <Text style={styles.quickAddAmount}>{item.amount}ml</Text>
    </TouchableOpacity>
  );

  // Render history item
  const renderHistoryItem = ({ item, index }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyTime}>
        <Icon name="schedule" size={16} color={COLORS.hydration} />
        <Text style={styles.historyTimeText}>{item.time}</Text>
      </View>
      <View style={styles.historyContent}>
        <Text style={styles.historyAmount}>{item.amount}ml</Text>
        <Text style={styles.historyNote}>{item.note}</Text>
      </View>
      <IconButton
        icon="remove-circle"
        size={20}
        iconColor={COLORS.error}
        onPress={() => removeWaterIntake(item.amount)}
      />
    </View>
  );

  // Render weekly trend item
  const renderWeeklyItem = ({ item, index }) => (
    <View style={styles.weeklyItem}>
      <Text style={styles.weeklyDay}>{item.day}</Text>
      <View style={styles.weeklyBar}>
        <Animated.View
          style={[
            styles.weeklyProgress,
            {
              height: `${Math.min(item.percentage, 100)}%`,
              backgroundColor: item.percentage >= 100 ? COLORS.success : 
                            item.percentage >= 75 ? COLORS.info : 
                            item.percentage >= 50 ? COLORS.warning : COLORS.error,
            }
          ]}
        />
      </View>
      <Text style={styles.weeklyPercentage}>{Math.round(item.percentage)}%</Text>
    </View>
  );

  const currentStatus = getHydrationStatus();
  const hydrationPercentage = Math.min((dailyIntake / (dailyGoal * 250)) * 100, 100);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.hydration, COLORS.info]}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>💧 Hydration Monitor</Text>
              <Text style={styles.headerSubtitle}>Stay hydrated, stay strong!</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowSettingsModal(true)}
            >
              <Icon name="settings" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Main Hydration Display */}
          <Surface style={styles.mainCard}>
            <View style={styles.hydrationDisplay}>
              <Animated.View
                style={[
                  styles.waterContainer,
                  {
                    transform: [
                      {
                        scale: waveAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.05],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={[getHydrationColor(), `${getHydrationColor()}80`]}
                  style={[
                    styles.waterLevel,
                    { height: `${hydrationPercentage}%` }
                  ]}
                />
                <Animated.Text
                  style={[
                    styles.waterText,
                    {
                      opacity: dropletAnim,
                      transform: [
                        {
                          translateY: dropletAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -10],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  💧
                </Animated.Text>
              </Animated.View>

              <View style={styles.hydrationStats}>
                <Text style={styles.currentIntake}>{dailyIntake}ml</Text>
                <Text style={styles.goalText}>of {dailyGoal * 250}ml goal</Text>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusIcon}>{currentStatus.icon}</Text>
                  <Text style={[styles.statusText, { color: currentStatus.color }]}>
                    {currentStatus.status}
                  </Text>
                </View>
              </View>
            </View>

            <Animated.View style={styles.progressSection}>
              <ProgressBar
                progress={progressAnim}
                color={getHydrationColor()}
                style={styles.mainProgressBar}
              />
              <Text style={styles.progressText}>
                {Math.round(hydrationPercentage)}% Complete
              </Text>
            </Animated.View>
          </Surface>

          {/* Quick Actions */}
          <Surface style={styles.quickActionsCard}>
            <Text style={styles.quickActionsTitle}>⚡ Quick Add</Text>
            <View style={styles.quickActionsGrid}>
              {quickAmounts.map((item, index) => renderQuickAddButton({ item, index }))}
            </View>
            <View style={styles.customActions}>
              <Button
                mode="outlined"
                onPress={() => setShowCustomModal(true)}
                style={styles.customButton}
                textColor={COLORS.hydration}
              >
                Custom Amount
              </Button>
              <Button
                mode="outlined"
                onPress={() => setShowHistoryModal(true)}
                style={styles.customButton}
                textColor={COLORS.info}
              >
                View History
              </Button>
            </View>
          </Surface>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.hydration]}
            tintColor={COLORS.hydration}
          />
        }
      >
        <Animated.View
          style={[
            styles.contentContainer,
            { opacity: fadeAnim }
          ]}
        >
          {/* Today's Summary */}
          <Card style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>📊 Today's Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Icon name="local-drink" size={32} color={COLORS.hydration} />
                <Text style={styles.summaryValue}>{hydrationHistory.length}</Text>
                <Text style={styles.summaryLabel}>Drinks</Text>
              </View>
              <View style={styles.summaryItem}>
                <Icon name="schedule" size={32} color={COLORS.success} />
                <Text style={styles.summaryValue}>
                  {hydrationHistory.length > 0 ? 
                    Math.round((dailyIntake / hydrationHistory.length) / 60) : 0}h
                </Text>
                <Text style={styles.summaryLabel}>Avg Interval</Text>
              </View>
              <View style={styles.summaryItem}>
                <Icon name="trending-up" size={32} color={COLORS.warning} />
                <Text style={styles.summaryValue}>
                  {dailyIntake > 0 ? Math.round((dailyIntake / (dailyGoal * 250)) * 100) : 0}%
                </Text>
                <Text style={styles.summaryLabel}>Goal Progress</Text>
              </View>
            </View>
          </Card>

          {/* Weekly Trends */}
          <Card style={styles.trendsCard}>
            <Text style={styles.sectionTitle}>📈 Weekly Trends</Text>
            <FlatList
              data={weeklyData}
              renderItem={renderWeeklyItem}
              keyExtractor={(item) => item.day}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weeklyList}
            />
            <Text style={styles.trendsNote}>
              💡 Consistency is key! Aim for 100% daily to maintain optimal hydration.
            </Text>
          </Card>

          {/* Hydration Tips */}
          <Card style={styles.tipsCard}>
            <Text style={styles.sectionTitle}>💡 Hydration Tips</Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>🌅</Text>
                <Text style={styles.tipText}>Start your day with 2 glasses of water</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>🏃</Text>
                <Text style={styles.tipText}>Drink 500ml before and after workouts</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>🍽️</Text>
                <Text style={styles.tipText}>Have water with every meal</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>⏰</Text>
                <Text style={styles.tipText}>Set reminders every hour during the day</Text>
              </View>
            </View>
          </Card>

          {/* Achievement Section */}
          <Card style={styles.achievementsCard}>
            <Text style={styles.sectionTitle}>🏆 Hydration Achievements</Text>
            <View style={styles.achievementsList}>
              <Chip
                icon="check-circle"
                style={[styles.achievementChip, { backgroundColor: `${COLORS.success}20` }]}
              >
                7-Day Streak 🔥
              </Chip>
              <Chip
                icon="jump-rope"
                style={[styles.achievementChip, { backgroundColor: `${COLORS.warning}20` }]}
              >
                Goal Master 🎯
              </Chip>
              <Chip
                icon="trending-up"
                style={[styles.achievementChip, { backgroundColor: `${COLORS.info}20` }]}
              >
                Consistency Pro ⭐
              </Chip>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Settings Modal */}
      <Portal>
        <Modal
          visible={showSettingsModal}
          onDismiss={() => setShowSettingsModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
            <Surface style={styles.settingsModal}>
              <Text style={styles.modalTitle}>⚙️ Hydration Settings</Text>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Daily Goal (glasses)</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={4}
                  maximumValue={16}
                  value={dailyGoal}
                  onValueChange={setDailyGoal}
                  step={1}
                  minimumTrackTintColor={COLORS.hydration}
                  maximumTrackTintColor={COLORS.border}
                  thumbColor={COLORS.hydration}
                />
                <Text style={styles.sliderValue}>{dailyGoal} glasses ({dailyGoal * 250}ml)</Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Enable Reminders</Text>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={setReminderEnabled}
                    color={COLORS.hydration}
                  />
                </View>
              </View>

              {reminderEnabled && (
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Reminder Interval (minutes)</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={30}
                    maximumValue={180}
                    value={reminderInterval}
                    onValueChange={setReminderInterval}
                    step={15}
                    minimumTrackTintColor={COLORS.hydration}
                    maximumTrackTintColor={COLORS.border}
                    thumbColor={COLORS.hydration}
                  />
                  <Text style={styles.sliderValue}>{reminderInterval} minutes</Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowSettingsModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowSettingsModal(false);
                    Alert.alert('✅ Settings Saved!', 'Your hydration preferences have been updated.');
                  }}
                  style={styles.modalButton}
                  buttonColor={COLORS.hydration}
                >
                  Save Settings
                </Button>
              </View>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>

      {/* Custom Amount Modal */}
      <Portal>
        <Modal
          visible={showCustomModal}
          onDismiss={() => setShowCustomModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
            <Surface style={styles.customModal}>
              <Text style={styles.modalTitle}>💧 Add Custom Amount</Text>
              
              <View style={styles.customAmountContainer}>
                <Text style={styles.customAmountLabel}>Amount (ml)</Text>
                <Slider
                  style={styles.amountSlider}
                  minimumValue={50}
                  maximumValue={1500}
                  value={customAmount}
                  onValueChange={setCustomAmount}
                  step={50}
                  minimumTrackTintColor={COLORS.hydration}
                  maximumTrackTintColor={COLORS.border}
                  thumbColor={COLORS.hydration}
                />
                <Text style={styles.customAmountValue}>{customAmount}ml</Text>
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowCustomModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    addWaterIntake(customAmount);
                    setShowCustomModal(false);
                  }}
                  style={styles.modalButton}
                  buttonColor={COLORS.hydration}
                >
                  Add Water
                </Button>
              </View>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>

      {/* History Modal */}
      <Portal>
        <Modal
          visible={showHistoryModal}
          onDismiss={() => setShowHistoryModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
            <Surface style={styles.historyModal}>
              <Text style={styles.modalTitle}>📝 Today's History</Text>
              
              <FlatList
                data={hydrationHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id}
                style={styles.historyList}
                showsVerticalScrollIndicator={false}
              />

              <View style={styles.historyActions}>
                <Button
                  mode="outlined"
                  onPress={resetDailyIntake}
                  style={styles.resetButton}
                  textColor={COLORS.error}
                >
                  Reset Today
                </Button>
                <Button
                  mode="contained"
                  onPress={() => setShowHistoryModal(false)}
                  style={styles.modalButton}
                  buttonColor={COLORS.hydration}
                >
                  Done
                </Button>
              </View>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => addWaterIntake(250)}
        color={COLORS.white}
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
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  settingsButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  mainCard: {
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 4,
  },
  hydrationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  waterContainer: {
    width: 120,
    height: 200,
    backgroundColor: COLORS.light,
    borderRadius: 60,
    marginRight: SPACING.lg,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 3,
    borderColor: COLORS.hydration,
  },
  waterLevel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 57,
    borderBottomRightRadius: 57,
  },
  waterText: {
    fontSize: 32,
    position: 'absolute',
    top: '20%',
  },
  hydrationStats: {
    flex: 1,
    alignItems: 'center',
  },
  currentIntake: {
    ...TEXT_STYLES.h1,
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.hydration,
  },
  goalText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusIcon: {
    fontSize: 24,
  },
  statusText: {
    ...TEXT_STYLES.h3,
    fontWeight: '600',
  },
  progressSection: {
    alignItems: 'center',
  },
  mainProgressBar: {
    width: width - SPACING.xl * 2,
    height: 12,
    borderRadius: 6,
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.hydration,
  },
  quickActionsCard: {
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  quickActionsTitle: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickAddButton: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAddIcon: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  quickAddLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  quickAddAmount: {
    ...TEXT_STYLES.small,
    color: COLORS.hydration,
    fontWeight: '500',
  },
  customActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.sm,
  },
  customButton: {
    flex: 1,
    borderColor: COLORS.hydration,
  },
  content: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  summaryCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  summaryValue: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  summaryLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  trendsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  weeklyList: {
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  weeklyItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  weeklyDay: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  weeklyBar: {
    width: 20,
    height: 80,
    backgroundColor: COLORS.light,
    borderRadius: 10,
    justifyContent: 'flex-end',
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  weeklyProgress: {
    width: '100%',
    borderRadius: 10,
    minHeight: 4,
  },
  weeklyPercentage: {
    ...TEXT_STYLES.small,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  trendsNote: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
  },
  tipsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  tipsContainer: {
    gap: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  tipIcon: {
    fontSize: 24,
    width: 32,
  },
  tipText: {
    ...TEXT_STYLES.body,
    flex: 1,
    color: COLORS.text,
  },
  achievementsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  achievementChip: {
    borderRadius: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  settingsModal: {
    maxHeight: height * 0.8,
    borderRadius: 16,
    padding: SPACING.md,
    elevation: 8,
  },
  customModal: {
    borderRadius: 16,
    padding: SPACING.md,
    elevation: 8,
  },
  historyModal: {
    maxHeight: height * 0.8,
    borderRadius: 16,
    padding: SPACING.md,
    elevation: 8,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  settingItem: {
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    color: COLORS.hydration,
    fontWeight: '600',
  },
  divider: {
    marginVertical: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  modalButton: {
    flex: 1,
  },
  customAmountContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  customAmountLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    marginBottom: SPACING.md,
  },
  amountSlider: {
    width: width - SPACING.xl * 3,
    height: 40,
  },
  customAmountValue: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
    color: COLORS.hydration,
    marginTop: SPACING.sm,
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    minWidth: 80,
  },
  historyTimeText: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  historyContent: {
    flex: 1,
    alignItems: 'center',
  },
  historyAmount: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.hydration,
  },
  historyNote: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  historyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  resetButton: {
    flex: 1,
    borderColor: COLORS.error,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.hydration,
  },
});

export default HydrationMonitoring;
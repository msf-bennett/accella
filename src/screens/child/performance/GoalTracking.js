import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  Animated,
  StatusBar,
  TouchableOpacity,
  Modal,
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
  Portal,
  TextInput,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const GoalTrackingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, goals } = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('week');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [updateValue, setUpdateValue] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Time frame options
  const timeFrames = [
    { id: 'week', name: 'This Week', icon: 'view-week' },
    { id: 'month', name: 'This Month', icon: 'calendar-view-month' },
    { id: 'quarter', name: '3 Months', icon: 'calendar-today' },
    { id: 'year', name: 'This Year', icon: 'calendar-view-year' },
  ];

  // Sample tracking data with detailed progress history
  const [trackingData, setTrackingData] = useState({
    goals: [
      {
        id: 1,
        title: 'Run 5K in under 25 minutes',
        category: 'fitness',
        currentValue: '27:30',
        targetValue: '25:00',
        unit: 'minutes',
        progress: 65,
        trend: 'improving',
        lastUpdated: '2025-08-29',
        weeklyProgress: [45, 52, 58, 62, 65],
        dailyEntries: [
          { date: '2025-08-25', value: '28:15', notes: 'Felt strong today!' },
          { date: '2025-08-27', value: '27:45', notes: 'Getting faster 🏃‍♂️' },
          { date: '2025-08-29', value: '27:30', notes: 'New personal best!' },
        ],
        streakCount: 12,
        bestStreak: 18,
        totalSessions: 45,
      },
      {
        id: 2,
        title: 'Master 20 ball juggles',
        category: 'skill',
        currentValue: 8,
        targetValue: 20,
        unit: 'juggles',
        progress: 40,
        trend: 'steady',
        lastUpdated: '2025-08-28',
        weeklyProgress: [25, 30, 35, 38, 40],
        dailyEntries: [
          { date: '2025-08-26', value: 6, notes: 'Practice makes perfect' },
          { date: '2025-08-28', value: 8, notes: 'Beat my record! ⚽' },
        ],
        streakCount: 5,
        bestStreak: 8,
        totalSessions: 23,
      },
      {
        id: 3,
        title: 'Attend all team practices',
        category: 'team',
        currentValue: 17,
        targetValue: 20,
        unit: 'practices',
        progress: 85,
        trend: 'excellent',
        lastUpdated: '2025-08-29',
        weeklyProgress: [70, 75, 80, 82, 85],
        dailyEntries: [
          { date: '2025-08-26', value: 16, notes: 'Great team energy!' },
          { date: '2025-08-28', value: 17, notes: 'Learned new formations' },
        ],
        streakCount: 20,
        bestStreak: 20,
        totalSessions: 17,
      },
    ],
    weeklyStats: {
      totalActiveSessions: 8,
      goalsImproved: 2,
      newPersonalBests: 1,
      streaksMaintained: 3,
      pointsEarned: 450,
    },
    motivationalMessages: [
      "You're crushing it this week! 🚀",
      "Your consistency is paying off! 💪",
      "Keep up the amazing work, champion! 🏆",
    ]
  });

  useEffect(() => {
    // Animation on mount
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

    // Animate progress bars
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1000,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      case 'steady': return 'trending-flat';
      case 'excellent': return 'star';
      default: return 'timeline';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#F44336';
      case 'steady': return '#FF9800';
      case 'excellent': return '#9C27B0';
      default: return COLORS.secondary;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'fitness': return '#FF6B6B';
      case 'skill': return '#4ECDC4';
      case 'team': return '#45B7D1';
      case 'mental': return '#96CEB4';
      case 'nutrition': return '#FECA57';
      default: return COLORS.primary;
    }
  };

  const formatValue = (value, unit) => {
    if (unit === 'minutes' && typeof value === 'string') {
      return value;
    }
    return `${value} ${unit}`;
  };

  const handleGoalUpdate = (goal) => {
    setSelectedGoal(goal);
    setUpdateValue(goal.currentValue.toString());
    setUpdateNotes('');
    setShowUpdateModal(true);
    Vibration.vibrate(50);
  };

  const saveGoalUpdate = () => {
    if (!updateValue.trim()) {
      Alert.alert('📝 Missing Value', 'Please enter your progress value!');
      return;
    }

    // Update the goal data
    setTrackingData(prev => ({
      ...prev,
      goals: prev.goals.map(goal => 
        goal.id === selectedGoal.id 
          ? {
              ...goal,
              currentValue: updateValue,
              lastUpdated: new Date().toISOString().split('T')[0],
              dailyEntries: [
                ...goal.dailyEntries,
                {
                  date: new Date().toISOString().split('T')[0],
                  value: updateValue,
                  notes: updateNotes || 'Updated progress'
                }
              ]
            }
          : goal
      )
    }));

    Vibration.vibrate([100, 50, 100]);
    Alert.alert(
      '🎉 Progress Updated!',
      `Great job updating your ${selectedGoal.title}! Keep up the amazing work!`,
      [{ 
        text: 'Awesome!', 
        onPress: () => {
          setShowUpdateModal(false);
          setSelectedGoal(null);
        }
      }]
    );
  };

  const viewGoalHistory = (goal) => {
    Alert.alert(
      `📈 ${goal.title}`,
      `Total Sessions: ${goal.totalSessions}\nCurrent Streak: ${goal.streakCount} days\nBest Streak: ${goal.bestStreak} days\n\nRecent entries:\n${goal.dailyEntries.slice(-3).map(entry => `${entry.date}: ${formatValue(entry.value, goal.unit)}`).join('\n')}`,
      [
        { text: 'View Details', onPress: () => navigation.navigate('GoalDetails', { goalId: goal.id }) },
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  const renderWeeklyStatsCard = () => (
    <Card style={styles.statsCard}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.statsGradient}>
        <Text style={styles.statsTitle}>📊 Weekly Highlights</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{trackingData.weeklyStats.totalActiveSessions}</Text>
            <Text style={styles.statLabel}>Active Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{trackingData.weeklyStats.goalsImproved}</Text>
            <Text style={styles.statLabel}>Goals Improved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{trackingData.weeklyStats.newPersonalBests}</Text>
            <Text style={styles.statLabel}>New Records</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{trackingData.weeklyStats.pointsEarned}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderGoalCard = (goal) => (
    <Animated.View
      key={goal.id}
      style={[
        styles.goalCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.goalHeader}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalCategory}>{goal.category.toUpperCase()}</Text>
            </View>
            <Surface style={[styles.trendChip, { backgroundColor: getTrendColor(goal.trend) }]}>
              <Icon name={getTrendIcon(goal.trend)} size={16} color="white" />
            </Surface>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.valueRow}>
              <Text style={styles.currentValue}>
                {formatValue(goal.currentValue, goal.unit)}
              </Text>
              <Text style={styles.targetValue}>
                / {formatValue(goal.targetValue, goal.unit)}
              </Text>
            </View>
            
            <Animated.View style={styles.progressBarContainer}>
              <ProgressBar 
                progress={progressAnim}
                color={getCategoryColor(goal.category)}
                style={styles.progressBar}
              />
              <Text style={styles.progressPercent}>{goal.progress}%</Text>
            </Animated.View>
          </View>

          <View style={styles.streakSection}>
            <View style={styles.streakInfo}>
              <Icon name="local-fire-department" size={18} color="#FF6B6B" />
              <Text style={styles.streakText}>{goal.streakCount} day streak</Text>
            </View>
            <Text style={styles.lastUpdated}>Updated {goal.lastUpdated}</Text>
          </View>

          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => handleGoalUpdate(goal)}
              style={[styles.updateButton, { backgroundColor: getCategoryColor(goal.category) }]}
              compact
            >
              📝 Update
            </Button>
            <Button
              mode="outlined"
              onPress={() => viewGoalHistory(goal)}
              style={styles.historyButton}
              textColor={getCategoryColor(goal.category)}
              compact
            >
              📈 History
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderMotivationalMessage = () => {
    const message = trackingData.motivationalMessages[
      Math.floor(Math.random() * trackingData.motivationalMessages.length)
    ];
    
    return (
      <Surface style={styles.motivationCard}>
        <Text style={styles.motivationText}>{message}</Text>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Goal Tracking 📈</Text>
          <Text style={styles.headerSubtitle}>Track your awesome progress!</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Motivational Message */}
        {renderMotivationalMessage()}

        {/* Weekly Stats */}
        <View style={styles.section}>
          {renderWeeklyStatsCard()}
        </View>

        {/* Time Frame Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Time Frame</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeFrameScroll}>
            {timeFrames.map(frame => (
              <Chip
                key={frame.id}
                selected={selectedTimeFrame === frame.id}
                onPress={() => setSelectedTimeFrame(frame.id)}
                style={[
                  styles.timeFrameChip,
                  selectedTimeFrame === frame.id && { backgroundColor: COLORS.primary }
                ]}
                textStyle={[
                  styles.timeFrameText,
                  selectedTimeFrame === frame.id && { color: 'white' }
                ]}
                icon={frame.icon}
              >
                {frame.name}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Goal Tracking Cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Your Goals ({trackingData.goals.length})</Text>
            <IconButton
              icon="analytics"
              size={24}
              iconColor="white"
              containerColor={COLORS.primary}
              onPress={() => Alert.alert('📊 Analytics', 'Detailed analytics coming soon!')}
            />
          </View>
          
          {trackingData.goals.map(renderGoalCard)}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Quick Update FAB */}
      <FAB
        icon="add-chart"
        style={styles.fab}
        onPress={() => Alert.alert('⚡ Quick Update', 'Quick update feature coming soon!')}
        color="white"
        customSize={56}
      />

      {/* Update Modal */}
      <Portal>
        <Modal
          visible={showUpdateModal}
          onRequestClose={() => setShowUpdateModal(false)}
          animationType="slide"
        >
          <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
            <View style={styles.modalContainer}>
              <Card style={styles.modalCard}>
                <Card.Content>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>📝 Update Progress</Text>
                    <IconButton
                      icon="close"
                      size={24}
                      onPress={() => setShowUpdateModal(false)}
                    />
                  </View>
                  
                  {selectedGoal && (
                    <>
                      <Text style={styles.modalSubtitle}>{selectedGoal.title}</Text>
                      
                      <TextInput
                        label={`Current ${selectedGoal.unit}`}
                        value={updateValue}
                        onChangeText={setUpdateValue}
                        mode="outlined"
                        style={styles.modalInput}
                        keyboardType={selectedGoal.unit === 'minutes' ? 'default' : 'numeric'}
                      />
                      
                      <TextInput
                        label="Notes (optional)"
                        value={updateNotes}
                        onChangeText={setUpdateNotes}
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                        style={styles.modalInput}
                        placeholder="How did it go? Any thoughts?"
                      />
                      
                      <View style={styles.modalButtons}>
                        <Button
                          mode="contained"
                          onPress={saveGoalUpdate}
                          style={styles.saveButton}
                        >
                          Save Progress 🚀
                        </Button>
                        <Button
                          mode="outlined"
                          onPress={() => setShowUpdateModal(false)}
                          style={styles.cancelButton}
                        >
                          Cancel
                        </Button>
                      </View>
                    </>
                  )}
                </Card.Content>
              </Card>
            </View>
          </BlurView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  motivationCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  motivationText: {
    ...TEXT_STYLES.body,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  statsCard: {
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: SPACING.sm,
  },
  statNumber: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  timeFrameScroll: {
    paddingVertical: SPACING.sm,
  },
  timeFrameChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  timeFrameText: {
    fontSize: 12,
  },
  goalCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.text.primary,
  },
  goalCategory: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
    fontSize: 10,
    marginTop: SPACING.xs,
  },
  trendChip: {
    padding: SPACING.sm,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  currentValue: {
    ...TEXT_STYLES.heading,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  targetValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  progressPercent: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  streakSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
    color: '#FF6B6B',
  },
  lastUpdated: {
    ...TEXT_STYLES.caption,
    color: COLORS.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  updateButton: {
    flex: 1,
  },
  historyButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalBlur: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.heading,
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
  },
  modalInput: {
    marginBottom: SPACING.md,
    backgroundColor: 'white',
  },
  modalButtons: {
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    borderColor: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default GoalTrackingScreen;
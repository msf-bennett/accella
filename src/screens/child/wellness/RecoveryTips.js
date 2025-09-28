import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Dimensions,
  Vibration,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
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
  Switch,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  recovery: {
    sleep: '#9C88FF',
    rest: '#4ECDC4',
    stretch: '#FFA726',
    hydrate: '#42A5F5',
    breathe: '#66BB6A',
    relax: '#EC407A',
  }
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
};

const { width, height } = Dimensions.get('window');

const RecoveryTips = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, recovery } = useSelector((state) => state.user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [sleepGoal, setSleepGoal] = useState(9); // hours for kids
  const [sleepTracked, setSleepTracked] = useState(8.5);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const [recoveryStreak, setRecoveryStreak] = useState(5);
  const [animatedValue] = useState(new Animated.Value(0));
  const [floatAnim] = useState(new Animated.Value(0));
  const breathingRef = useRef(null);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Floating animation for rest icons
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    floatAnimation.start();

    return () => floatAnimation.stop();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const recoveryActivities = [
    {
      id: 1,
      title: 'Gentle Stretching',
      description: 'Help your muscles feel happy!',
      duration: '5-10 minutes',
      icon: 'accessibility',
      color: COLORS.recovery.stretch,
      benefits: ['Flexible muscles', 'Better movement', 'Less stiffness'],
      instructions: ['Reach for the sky', 'Touch your toes', 'Twist left and right', 'Hold each stretch for 15 seconds'],
    },
    {
      id: 2,
      title: 'Deep Breathing',
      description: 'Calm your mind and body',
      duration: '3-5 minutes',
      icon: 'air',
      color: COLORS.recovery.breathe,
      benefits: ['Calm feeling', 'Better focus', 'Relaxed body'],
      instructions: ['Sit comfortably', 'Breathe in slowly (4 counts)', 'Hold breath (2 counts)', 'Breathe out slowly (6 counts)'],
    },
    {
      id: 3,
      title: 'Quiet Rest Time',
      description: 'Let your body recharge',
      duration: '15-20 minutes',
      icon: 'self-improvement',
      color: COLORS.recovery.rest,
      benefits: ['Energy boost', 'Better mood', 'Ready to play'],
      instructions: ['Find a quiet spot', 'Lie down comfortably', 'Close your eyes', 'Think happy thoughts'],
    },
    {
      id: 4,
      title: 'Hydration Break',
      description: 'Give your body the water it needs',
      duration: '2 minutes',
      icon: 'water-drop',
      color: COLORS.recovery.hydrate,
      benefits: ['Happy muscles', 'Clear thinking', 'More energy'],
      instructions: ['Get a big glass of water', 'Drink slowly', 'Add lemon for fun', 'Drink throughout the day'],
    },
    {
      id: 5,
      title: 'Relaxing Music',
      description: 'Soothe your mind with calm sounds',
      duration: '10-15 minutes',
      icon: 'music-note',
      color: COLORS.recovery.relax,
      benefits: ['Peaceful mind', 'Less worry', 'Happy feelings'],
      instructions: ['Choose calm music', 'Lie down or sit', 'Close your eyes', 'Let the music wash over you'],
    },
    {
      id: 6,
      title: 'Gentle Massage',
      description: 'Help sore muscles feel better',
      duration: '5-10 minutes',
      icon: 'healing',
      color: COLORS.recovery.sleep,
      benefits: ['Relaxed muscles', 'Better circulation', 'Feels good'],
      instructions: ['Use gentle pressure', 'Massage arms and legs', 'Ask for help if needed', 'Use lotion for smoothness'],
    },
  ];

  const sleepTips = [
    {
      id: 1,
      title: 'Create a Bedtime Routine',
      description: 'Do the same things before bed every night',
      icon: 'schedule',
      tips: ['Bath or shower', 'Brush teeth', 'Put on pajamas', 'Read a story', 'Say goodnight'],
    },
    {
      id: 2,
      title: 'Make Your Room Cozy',
      description: 'A comfortable room helps you sleep better',
      icon: 'bed',
      tips: ['Keep room cool', 'Use soft pillows', 'Have favorite stuffed animal', 'Use nightlight if needed', 'Keep room tidy'],
    },
    {
      id: 3,
      title: 'Wind Down Time',
      description: 'Calm activities before sleep',
      icon: 'nights-stay',
      tips: ['No screens 1 hour before bed', 'Read books', 'Listen to calm music', 'Do quiet activities', 'Talk about your day'],
    },
    {
      id: 4,
      title: 'Good Sleep Schedule',
      description: 'Sleep and wake up at the same time',
      icon: 'access-time',
      tips: ['Sleep 9-11 hours per night', 'Same bedtime every night', 'Wake up same time', 'No long naps after 3 PM', 'Get sunlight in morning'],
    },
  ];

  const recoveryMilestones = [
    { day: 1, completed: true, activity: 'Stretching', icon: 'accessibility' },
    { day: 2, completed: true, activity: 'Good Sleep', icon: 'bedtime' },
    { day: 3, completed: true, activity: 'Rest Time', icon: 'self-improvement' },
    { day: 4, completed: true, activity: 'Deep Breathing', icon: 'air' },
    { day: 5, completed: true, activity: 'Hydration', icon: 'water-drop' },
    { day: 6, completed: false, activity: 'Today!', icon: 'today' },
    { day: 7, completed: false, activity: 'Tomorrow', icon: 'tomorrow' },
  ];

  const handleActivityStart = (activity) => {
    Alert.alert(
      `${activity.title} Time! 🌟`,
      `Ready to try ${activity.title}? It will take about ${activity.duration} and help you feel amazing!`,
      [
        { 
          text: "Let's Do It!", 
          onPress: () => startActivity(activity)
        },
        { text: "Maybe Later", style: "cancel" }
      ]
    );
  };

  const startActivity = (activity) => {
    if (activity.title === 'Deep Breathing') {
      startBreathingExercise();
    } else {
      setSelectedTip(activity);
      Alert.alert(
        `Great Choice! 🎉`,
        `Here's how to do ${activity.title}:\n\n${activity.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\nTake your time and enjoy!`,
        [{ text: 'Got It!', style: 'default' }]
      );
    }
  };

  const startBreathingExercise = () => {
    let count = 0;
    const breathingSteps = ['Breathe In... 1, 2, 3, 4', 'Hold... 1, 2', 'Breathe Out... 1, 2, 3, 4, 5, 6'];
    let currentStep = 0;

    const showBreathingStep = () => {
      if (count < 6) { // 6 breathing cycles
        Alert.alert(
          `Breathing Exercise ${count + 1}/6 🫁`,
          breathingSteps[currentStep],
          [
            {
              text: count === 5 && currentStep === 2 ? 'Finished!' : 'Next',
              onPress: () => {
                currentStep = (currentStep + 1) % 3;
                if (currentStep === 0) count++;
                if (count < 6) {
                  setTimeout(showBreathingStep, 1000);
                } else {
                  Alert.alert('Amazing! 🌟', 'You completed the breathing exercise! How do you feel?', 
                    [{ text: 'Relaxed!', style: 'default' }]);
                }
              }
            }
          ]
        );
      }
    };

    showBreathingStep();
  };

  const handleSleepTracking = () => {
    setShowSleepModal(true);
  };

  const renderSleepTracker = () => (
    <TouchableOpacity onPress={handleSleepTracking}>
      <Card style={styles.card}>
        <LinearGradient
          colors={[COLORS.recovery.sleep, '#B19CD9']}
          style={styles.sleepGradient}
        >
          <View style={styles.sleepContent}>
            <Animated.View style={{
              transform: [{
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                })
              }]
            }}>
              <Icon name="bedtime" size={48} color={COLORS.white} />
            </Animated.View>
            <Text style={styles.sleepTitle}>Sleep Champion 🌙</Text>
            <Text style={styles.sleepSubtitle}>
              {sleepTracked} of {sleepGoal} hours last night
            </Text>
            <ProgressBar
              progress={sleepTracked / sleepGoal}
              color={COLORS.white}
              style={styles.sleepProgressBar}
            />
            <Text style={styles.sleepStatus}>
              {sleepTracked >= sleepGoal ? 'Perfect sleep! 🌟' : 'Try for a bit more tonight! 😴'}
            </Text>
          </View>
        </LinearGradient>
      </Card>
    </TouchableOpacity>
  );

  const renderRecoveryActivities = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="spa" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Recovery Activities 🧘‍♀️
          </Text>
        </View>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textLight, marginBottom: SPACING.md }]}>
          Help your body rest and recharge with these fun activities!
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recoveryActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityCard}
              onPress={() => handleActivityStart(activity)}
            >
              <LinearGradient
                colors={[activity.color + '20', activity.color + '10']}
                style={styles.activityGradient}
              >
                <Surface style={[styles.activityIcon, { backgroundColor: activity.color + '30' }]}>
                  <Icon name={activity.icon} size={32} color={activity.color} />
                </Surface>
                <Text style={[styles.activityTitle, { color: activity.color }]}>
                  {activity.title}
                </Text>
                <Text style={styles.activityDescription}>
                  {activity.description}
                </Text>
                <Chip
                  mode="outlined"
                  style={[styles.durationChip, { borderColor: activity.color }]}
                  textStyle={{ color: activity.color, fontSize: 12 }}
                >
                  {activity.duration}
                </Chip>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderSleepTips = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="nights-stay" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Sleep Better Tips 😴
          </Text>
        </View>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textLight, marginBottom: SPACING.md }]}>
          Great sleep helps your body grow strong and your brain learn better!
        </Text>
        
        {sleepTips.map((tip) => (
          <Surface key={tip.id} style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Surface style={styles.tipIcon}>
                <Icon name={tip.icon} size={24} color={COLORS.recovery.sleep} />
              </Surface>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </View>
            <View style={styles.tipsList}>
              {tip.tips.map((tipItem, index) => (
                <View key={index} style={styles.tipItem}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.tipItemText}>{tipItem}</Text>
                </View>
              ))}
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  );

  const renderRecoveryStreak = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="local-fire-department" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Recovery Streak 🔥
          </Text>
        </View>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textLight, marginBottom: SPACING.md }]}>
          Keep taking care of yourself every day!
        </Text>
        
        <View style={styles.streakContainer}>
          <Text style={styles.streakNumber}>{recoveryStreak}</Text>
          <Text style={styles.streakLabel}>Days in a row!</Text>
        </View>
        
        <View style={styles.milestonesContainer}>
          {recoveryMilestones.map((milestone) => (
            <View key={milestone.day} style={styles.milestoneItem}>
              <Surface style={[
                styles.milestoneIcon,
                milestone.completed && styles.milestoneCompleted
              ]}>
                <Icon
                  name={milestone.icon}
                  size={20}
                  color={milestone.completed ? COLORS.white : COLORS.textLight}
                />
              </Surface>
              <Text style={[
                styles.milestoneText,
                !milestone.completed && { color: COLORS.textLight }
              ]}>
                Day {milestone.day}
              </Text>
              <Text style={[
                styles.milestoneActivity,
                !milestone.completed && { color: COLORS.textLight }
              ]}>
                {milestone.activity}
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickRecovery = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="flash-on" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { marginLeft: SPACING.sm }]}>
            Quick Recovery ⚡
          </Text>
        </View>
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textLight, marginBottom: SPACING.md }]}>
          Fast ways to feel better after playing hard!
        </Text>
        
        <View style={styles.quickRecoveryGrid}>
          <TouchableOpacity 
            style={[styles.quickRecoveryCard, { borderLeftColor: COLORS.recovery.hydrate }]}
            onPress={() => {
              Alert.alert('Drink Water! 💧', 'Take 5 big sips of water right now! Your body will thank you!', 
                [{ text: 'Done!', style: 'default' }]);
            }}
          >
            <Icon name="water-drop" size={24} color={COLORS.recovery.hydrate} />
            <Text style={styles.quickRecoveryTitle}>Drink Water</Text>
            <Text style={styles.quickRecoveryTime}>30 seconds</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickRecoveryCard, { borderLeftColor: COLORS.recovery.breathe }]}
            onPress={() => startBreathingExercise()}
          >
            <Icon name="air" size={24} color={COLORS.recovery.breathe} />
            <Text style={styles.quickRecoveryTitle}>Deep Breaths</Text>
            <Text style={styles.quickRecoveryTime}>1 minute</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickRecoveryCard, { borderLeftColor: COLORS.recovery.stretch }]}
            onPress={() => {
              Alert.alert('Quick Stretch! 🤸‍♀️', 'Reach up high like you\'re touching the clouds, then touch your toes! Do it 5 times!', 
                [{ text: 'Stretching!', style: 'default' }]);
            }}
          >
            <Icon name="accessibility" size={24} color={COLORS.recovery.stretch} />
            <Text style={styles.quickRecoveryTitle}>Quick Stretch</Text>
            <Text style={styles.quickRecoveryTime}>2 minutes</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderSleepModal = () => (
    <Portal>
      <Modal
        visible={showSleepModal}
        onDismiss={() => setShowSleepModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <LinearGradient
          colors={[COLORS.recovery.sleep, '#B19CD9']}
          style={styles.modalGradient}
        >
          <Icon name="bedtime" size={48} color={COLORS.white} />
          <Text style={styles.modalTitle}>Sleep Tracker 🌙</Text>
          <Text style={styles.modalText}>
            How many hours did you sleep last night?
          </Text>
          <View style={styles.sleepButtons}>
            {[7, 8, 9, 10, 11].map((hours) => (
              <Button
                key={hours}
                mode={sleepTracked === hours ? 'contained' : 'outlined'}
                onPress={() => setSleepTracked(hours)}
                style={styles.sleepButton}
                buttonColor={sleepTracked === hours ? COLORS.white : 'transparent'}
                textColor={sleepTracked === hours ? COLORS.recovery.sleep : COLORS.white}
              >
                {hours}h
              </Button>
            ))}
          </View>
          <Button
            mode="contained"
            onPress={() => setShowSleepModal(false)}
            style={styles.modalCloseButton}
            buttonColor={COLORS.white}
            textColor={COLORS.recovery.sleep}
          >
            Save Sleep Time 💤
          </Button>
        </LinearGradient>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Recovery Tips 🌟</Text>
          <Text style={styles.headerSubtitle}>
            Rest, recharge, and feel amazing! 💚
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: animatedValue,
              transform: [
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {renderSleepTracker()}
          {renderQuickRecovery()}
          {renderRecoveryActivities()}
          {renderRecoveryStreak()}
          {renderSleepTips()}
        </Animated.View>
      </ScrollView>

      {renderSleepModal()}

      <FAB
        style={styles.fab}
        icon="self-improvement"
        onPress={() => {
          Alert.alert(
            'Recovery Challenge! 🏆',
            'Try one recovery activity today! Your body works hard and deserves to feel good. Which activity sounds fun to you? 🌟',
            [{ text: 'Let\'s Recover!', style: 'default' }]
          );
        }}
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sleepGradient: {
    borderRadius: 12,
    padding: SPACING.lg,
  },
  sleepContent: {
    alignItems: 'center',
  },
  sleepTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  sleepSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.md,
  },
  sleepProgressBar: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.md,
  },
  sleepStatus: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  activityCard: {
    width: 160,
    marginRight: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  activityGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  activityTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  activityDescription: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 16,
  },
  durationChip: {
    backgroundColor: 'transparent',
  },
  tipCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 8,
    elevation: 1,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.recovery.sleep + '20',
    marginRight: SPACING.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  tipDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  tipsList: {
    paddingLeft: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  tipItemText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  streakNumber: {
    ...TEXT_STYLES.h1,
    fontSize: 48,
    color: COLORS.warning,
    fontWeight: 'bold',
  },
  streakLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  milestonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  milestoneItem: {
    alignItems: 'center',
    width: (width - 64) / 7,
    marginBottom: SPACING.sm,
  },
  milestoneIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    marginBottom: SPACING.xs,
  },
  milestoneCompleted: {
    backgroundColor: COLORS.success,
  },
  milestoneText: {
    ...TEXT_STYLES.small,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  milestoneActivity: {
    ...TEXT_STYLES.small,
    fontSize: 10,
    textAlign: 'center',
  },
  quickRecoveryGrid: {
    gap: SPACING.sm,
  },
  quickRecoveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    elevation: 1,
    borderLeftWidth: 4,
  },
  quickRecoveryTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginLeft: SPACING.md,
    flex: 1,
  },
  quickRecoveryTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  modalContainer: {
    margin: SPACING.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  modalText: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: SPACING.lg,
  },
  sleepButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  sleepButton: {
    minWidth: 60,
  },
  modalCloseButton: {
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.recovery.rest,
  },
});

export default RecoveryTips;
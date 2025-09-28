import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
  TouchableOpacity,
  Platform,
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
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196F3',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  completed: '#4CAF50',
  inProgress: '#ff9800',
  upcoming: '#2196F3',
  skipped: '#f44336',
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
    fontSize: 28,
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
    color: COLORS.textLight,
  },
};

const { width, height } = Dimensions.get('window');

const TodaysActivities = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const scrollY = useRef(new Animated.Value(0)).current;

  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const todaysActivities = useSelector(state => state.training.todaysActivities);

  // Mock activity data
  const activitiesData = [
    {
      id: '1',
      title: 'Morning Cardio',
      type: 'cardio',
      startTime: '07:00',
      endTime: '07:45',
      duration: 45,
      status: 'completed',
      completedAt: '07:40',
      description: 'Light jog around the park',
      calories: 320,
      distance: '5.2 km',
      exercises: [
        { name: 'Warm-up walk', duration: '5 min', completed: true },
        { name: 'Steady jog', duration: '35 min', completed: true },
        { name: 'Cool-down walk', duration: '5 min', completed: true },
      ],
      coach: 'Alex Johnson',
      notes: 'Great pace today! Heart rate stayed in target zone.',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Strength Training - Upper Body',
      type: 'strength',
      startTime: '09:30',
      endTime: '10:30',
      duration: 60,
      status: 'in_progress',
      currentExercise: 2,
      description: 'Chest, shoulders, and triceps focus',
      targetSets: 12,
      completedSets: 8,
      exercises: [
        { name: 'Bench Press', sets: '4x8', weight: '155 lbs', completed: true, reps: [8, 8, 7, 8] },
        { name: 'Shoulder Press', sets: '3x10', weight: '45 lbs', completed: true, reps: [10, 9, 10] },
        { name: 'Incline Dumbbell Press', sets: '3x8', weight: '50 lbs', completed: false, reps: [8, 7] },
        { name: 'Tricep Dips', sets: '2x12', weight: 'bodyweight', completed: false, reps: [] },
      ],
      coach: 'Sarah Miller',
      notes: 'Focus on proper form over heavy weight',
      priority: 'high',
    },
    {
      id: '3',
      title: 'Flexibility & Mobility',
      type: 'flexibility',
      startTime: '11:00',
      endTime: '11:30',
      duration: 30,
      status: 'upcoming',
      description: 'Post-workout stretching routine',
      exercises: [
        { name: 'Dynamic warm-up', duration: '5 min', completed: false },
        { name: 'Upper body stretches', duration: '10 min', completed: false },
        { name: 'Hip mobility', duration: '10 min', completed: false },
        { name: 'Cool-down breathing', duration: '5 min', completed: false },
      ],
      coach: 'Mike Davis',
      notes: 'Essential for recovery after strength training',
      priority: 'medium',
    },
    {
      id: '4',
      title: 'Nutrition Check-in',
      type: 'nutrition',
      startTime: '12:30',
      endTime: '12:45',
      duration: 15,
      status: 'upcoming',
      description: 'Log lunch and hydration',
      tasks: [
        { name: 'Log lunch meal', completed: false },
        { name: 'Track water intake', completed: false },
        { name: 'Take progress photo', completed: false },
      ],
      coach: 'Emma Wilson',
      notes: 'Remember to include protein with every meal',
      priority: 'medium',
    },
    {
      id: '5',
      title: 'Afternoon Conditioning',
      type: 'conditioning',
      startTime: '16:00',
      endTime: '16:45',
      duration: 45,
      status: 'upcoming',
      description: 'HIIT circuit training',
      rounds: 4,
      restBetweenRounds: 60,
      exercises: [
        { name: 'Burpees', duration: '30 sec', rest: '15 sec', completed: false },
        { name: 'Mountain Climbers', duration: '30 sec', rest: '15 sec', completed: false },
        { name: 'Jump Squats', duration: '30 sec', rest: '15 sec', completed: false },
        { name: 'Push-ups', duration: '30 sec', rest: '15 sec', completed: false },
      ],
      coach: 'Alex Johnson',
      notes: 'High intensity - push yourself but maintain form',
      priority: 'high',
    },
    {
      id: '6',
      title: 'Evening Recovery',
      type: 'recovery',
      startTime: '19:30',
      endTime: '20:00',
      duration: 30,
      status: 'upcoming',
      description: 'Gentle stretching and meditation',
      exercises: [
        { name: 'Gentle yoga flow', duration: '15 min', completed: false },
        { name: 'Meditation', duration: '10 min', completed: false },
        { name: 'Sleep preparation', duration: '5 min', completed: false },
      ],
      coach: 'Emma Wilson',
      notes: 'Focus on relaxation and sleep quality',
      priority: 'low',
    },
  ];

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(refreshTodaysActivities());
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.completed;
      case 'in_progress': return COLORS.inProgress;
      case 'upcoming': return COLORS.upcoming;
      case 'skipped': return COLORS.skipped;
      default: return COLORS.textLight;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'in_progress': return 'play-circle-filled';
      case 'upcoming': return 'schedule';
      case 'skipped': return 'cancel';
      default: return 'radio-button-unchecked';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'cardio': return 'directions-run';
      case 'strength': return 'fitness-center';
      case 'flexibility': return 'self-improvement';
      case 'nutrition': return 'restaurant';
      case 'conditioning': return 'whatshot';
      case 'recovery': return 'spa';
      default: return 'event';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.textLight;
    }
  };

  const isActivityActive = (activity) => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = activity.startTime.split(':').map(Number);
    const [endHour, endMinute] = activity.endTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;
    
    return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
  };

  const handleActivityPress = (activity) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  const handleStartActivity = (activity) => {
    Alert.alert(
      'Start Activity 🚀',
      `Ready to start "${activity.title}"?`,
      [
        { text: 'Not yet', style: 'cancel' },
        { 
          text: 'Start Now!', 
          style: 'default',
          onPress: () => {
            Alert.alert(
              'Activity Started! 💪',
              'Feature in development - Activity tracking interface will load here.',
              [{ text: 'Got it!', style: 'default' }]
            );
          }
        }
      ]
    );
  };

  const handleCompleteActivity = (activity) => {
    Alert.alert(
      'Mark Complete ✅',
      `Mark "${activity.title}" as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          style: 'default',
          onPress: () => {
            Alert.alert(
              'Activity Completed! 🎉',
              'Great job! Your progress has been logged.',
              [{ text: 'Awesome!', style: 'default' }]
            );
          }
        }
      ]
    );
  };

  const renderDayOverview = () => {
    const totalActivities = activitiesData.length;
    const completedActivities = activitiesData.filter(a => a.status === 'completed').length;
    const inProgressActivities = activitiesData.filter(a => a.status === 'in_progress').length;
    const progressPercentage = completedActivities / totalActivities;

    return (
      <Animated.View
        style={[
          styles.overviewContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.overviewGradient}
        >
          <Text style={styles.overviewDate}>
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.overviewTitle}>Today's Activities 📅</Text>
          
          <View style={styles.overviewStats}>
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatNumber}>{completedActivities}</Text>
              <Text style={styles.overviewStatLabel}>Completed</Text>
            </View>
            <View style={styles.overviewStatDivider} />
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatNumber}>{inProgressActivities}</Text>
              <Text style={styles.overviewStatLabel}>In Progress</Text>
            </View>
            <View style={styles.overviewStatDivider} />
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatNumber}>{totalActivities}</Text>
              <Text style={styles.overviewStatLabel}>Total</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Daily Progress</Text>
            <ProgressBar
              progress={progressPercentage}
              color="rgba(255, 255, 255, 0.9)"
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {Math.round(progressPercentage * 100)}% Complete - Keep it up! 💪
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderActivityCard = ({ item: activity, index }) => {
    const isActive = isActivityActive(activity);
    const inputRange = [-1, 0, index * 120, (index + 2) * 120];
    
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.activityCardContainer,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleActivityPress(activity)}
          activeOpacity={0.8}
        >
          <Card style={[
            styles.activityCard,
            isActive && styles.activeActivityCard,
            activity.status === 'completed' && styles.completedActivityCard,
          ]}>
            <View style={styles.activityHeader}>
              <View style={styles.activityHeaderLeft}>
                <Surface style={[styles.activityIconContainer, { backgroundColor: getStatusColor(activity.status) + '20' }]}>
                  <Icon
                    name={getTypeIcon(activity.type)}
                    size={24}
                    color={getStatusColor(activity.status)}
                  />
                </Surface>
                <View style={styles.activityHeaderText}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>
                    {activity.startTime} - {activity.endTime} ({activity.duration} min)
                  </Text>
                </View>
              </View>
              <View style={styles.activityHeaderRight}>
                <Chip
                  style={[styles.priorityChip, { backgroundColor: getPriorityColor(activity.priority) + '20' }]}
                  textStyle={[styles.priorityChipText, { color: getPriorityColor(activity.priority) }]}
                >
                  {activity.priority}
                </Chip>
                <Icon
                  name={getStatusIcon(activity.status)}
                  size={24}
                  color={getStatusColor(activity.status)}
                  style={styles.statusIcon}
                />
              </View>
            </View>

            <Card.Content style={styles.activityContent}>
              <Text style={styles.activityDescription}>{activity.description}</Text>
              
              {activity.coach && (
                <View style={styles.coachInfo}>
                  <Icon name="person" size={16} color={COLORS.textLight} />
                  <Text style={styles.coachText}>Coach: {activity.coach}</Text>
                </View>
              )}

              {activity.status === 'in_progress' && activity.completedSets && activity.targetSets && (
                <View style={styles.progressInfo}>
                  <Text style={styles.progressInfoLabel}>Progress:</Text>
                  <ProgressBar
                    progress={activity.completedSets / activity.targetSets}
                    color={COLORS.inProgress}
                    style={styles.activityProgressBar}
                  />
                  <Text style={styles.progressInfoText}>
                    {activity.completedSets}/{activity.targetSets} sets completed
                  </Text>
                </View>
              )}

              {activity.status === 'completed' && activity.completedAt && (
                <View style={styles.completedInfo}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.completedText}>Completed at {activity.completedAt}</Text>
                </View>
              )}

              <View style={styles.activityActions}>
                {activity.status === 'upcoming' && (
                  <Button
                    mode="contained"
                    compact
                    onPress={() => handleStartActivity(activity)}
                    style={styles.startButton}
                    contentStyle={styles.buttonContent}
                    icon="play-arrow"
                  >
                    Start
                  </Button>
                )}
                {activity.status === 'in_progress' && (
                  <>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => handleActivityPress(activity)}
                      style={styles.continueButton}
                      contentStyle={styles.buttonContent}
                    >
                      Continue
                    </Button>
                    <Button
                      mode="contained"
                      compact
                      onPress={() => handleCompleteActivity(activity)}
                      style={styles.completeButton}
                      contentStyle={styles.buttonContent}
                      icon="check"
                    >
                      Complete
                    </Button>
                  </>
                )}
                {activity.status === 'completed' && (
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => handleActivityPress(activity)}
                    style={styles.viewButton}
                    contentStyle={styles.buttonContent}
                    icon="visibility"
                  >
                    View Details
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderActivityModal = () => {
    if (!selectedActivity) return null;

    return (
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={100} style={styles.modalBlur}>
            <Card style={styles.modalCard}>
              <LinearGradient
                colors={[getStatusColor(selectedActivity.status), getStatusColor(selectedActivity.status) + '80']}
                style={styles.modalHeader}
              >
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Icon name="close" size={24} color="white" />
                </TouchableOpacity>
                
                <View style={styles.modalHeaderContent}>
                  <Icon
                    name={getTypeIcon(selectedActivity.type)}
                    size={40}
                    color="white"
                    style={styles.modalIcon}
                  />
                  <Text style={styles.modalTitle}>{selectedActivity.title}</Text>
                  <Text style={styles.modalSubtitle}>{selectedActivity.description}</Text>
                </View>
              </LinearGradient>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Schedule</Text>
                  <Text style={styles.modalSectionText}>
                    {selectedActivity.startTime} - {selectedActivity.endTime} ({selectedActivity.duration} minutes)
                  </Text>
                </View>

                {selectedActivity.coach && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Coach</Text>
                    <Text style={styles.modalSectionText}>{selectedActivity.coach}</Text>
                  </View>
                )}

                {selectedActivity.notes && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Notes</Text>
                    <Text style={styles.modalSectionText}>{selectedActivity.notes}</Text>
                  </View>
                )}

                {selectedActivity.exercises && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Exercises</Text>
                    {selectedActivity.exercises.map((exercise, index) => (
                      <View key={index} style={styles.exerciseItem}>
                        <Icon
                          name={exercise.completed ? 'check-circle' : 'radio-button-unchecked'}
                          size={20}
                          color={exercise.completed ? COLORS.success : COLORS.border}
                        />
                        <View style={styles.exerciseContent}>
                          <Text style={styles.exerciseName}>{exercise.name}</Text>
                          <Text style={styles.exerciseDetails}>
                            {exercise.sets ? `${exercise.sets} @ ${exercise.weight}` : 
                             exercise.duration ? exercise.duration : ''}
                          </Text>
                          {exercise.reps && exercise.reps.length > 0 && (
                            <Text style={styles.exerciseReps}>
                              Reps: {exercise.reps.join(', ')}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {selectedActivity.tasks && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Tasks</Text>
                    {selectedActivity.tasks.map((task, index) => (
                      <View key={index} style={styles.exerciseItem}>
                        <Icon
                          name={task.completed ? 'check-circle' : 'radio-button-unchecked'}
                          size={20}
                          color={task.completed ? COLORS.success : COLORS.border}
                        />
                        <Text style={styles.taskName}>{task.name}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.modalActions}>
                  {selectedActivity.status === 'upcoming' && (
                    <Button
                      mode="contained"
                      onPress={() => {
                        setModalVisible(false);
                        handleStartActivity(selectedActivity);
                      }}
                      style={styles.modalButton}
                      contentStyle={styles.modalButtonContent}
                      icon="play-arrow"
                    >
                      Start Activity
                    </Button>
                  )}
                  {selectedActivity.status === 'in_progress' && (
                    <Button
                      mode="contained"
                      onPress={() => {
                        setModalVisible(false);
                        handleCompleteActivity(selectedActivity);
                      }}
                      style={styles.modalButton}
                      contentStyle={styles.modalButtonContent}
                      icon="check"
                    >
                      Mark Complete
                    </Button>
                  )}
                </View>
              </ScrollView>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent={true}
      />

      {renderDayOverview()}

      <View style={styles.content}>
        <Animated.FlatList
          data={activitiesData}
          keyExtractor={(item) => item.id}
          renderItem={renderActivityCard}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      </View>

      {renderActivityModal()}

      <FAB
        icon="add"
        style={styles.fab}
        color="white"
        onPress={() => {
          Alert.alert(
            'Add Activity 📝',
            'Feature in development - Add custom activities or quick workouts.',
            [{ text: 'Got it!', style: 'default' }]
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
  overviewContainer: {
    marginBottom: SPACING.md,
  },
  overviewGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 30,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  overviewDate: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  overviewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  overviewStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  overviewStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  overviewStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: SPACING.sm,
  },
  progressSection: {
    marginTop: SPACING.sm,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  listContent: {
    paddingBottom: 100,
  },
  activityCardContainer: {
    marginBottom: SPACING.md,
  },
  activityCard: {
    overflow: 'hidden',
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.border,
  },
  activeActivityCard: {
    borderLeftColor: COLORS.inProgress,
    elevation: 6,
    shadowColor: COLORS.inProgress,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  completedActivityCard: {
    borderLeftColor: COLORS.success,
    opacity: 0.8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  activityHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  activityHeaderText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  activityHeaderRight: {
    alignItems: 'flex-end',
  },
  priorityChip: {
    marginBottom: SPACING.xs,
  },
  priorityChipText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusIcon: {
    marginTop: SPACING.xs / 2,
  },
  activityContent: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  activityDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  coachText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
  progressInfo: {
    marginBottom: SPACING.sm,
  },
  progressInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  activityProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  progressInfoText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  completedText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  activityActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  startButton: {
    flex: 1,
    backgroundColor: COLORS.success,
  },
  continueButton: {
    flex: 1,
    marginRight: SPACING.sm,
    borderColor: COLORS.inProgress,
  },
  completeButton: {
    flex: 1,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.success,
  },
  viewButton: {
    flex: 1,
    borderColor: COLORS.primary,
  },
  buttonContent: {
    height: 36,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalBlur: {
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalCard: {
    flex: 1,
  },
  modalHeader: {
    padding: SPACING.lg,
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
  },
  modalHeaderContent: {
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  modalIcon: {
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalSectionText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  exerciseContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  exerciseDetails: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SPACING.xs / 2,
  },
  exerciseReps: {
    fontSize: 11,
    color: COLORS.success,
    fontStyle: 'italic',
  },
  taskName: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  modalActions: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.md,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  modalButtonContent: {
    height: 44,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default TodaysActivities;
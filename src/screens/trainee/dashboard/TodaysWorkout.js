import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Vibration,
  StatusBar,
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
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const TodaysWorkouts = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, workouts, isLoading } = useSelector(state => ({
    user: state.auth.user,
    workouts: state.workouts.todaysWorkouts,
    isLoading: state.workouts.loading,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(new Set());
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation setup
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for streak counter
    Animated.loop(
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
    ).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const toggleCardExpansion = (workoutId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(workoutId)) {
      newExpanded.delete(workoutId);
    } else {
      newExpanded.add(workoutId);
    }
    setExpandedCards(newExpanded);
    Vibration.vibrate(50);
  };

  const completeSession = (workoutId) => {
    Vibration.vibrate([50, 100, 50]);
    setCompletedSessions(new Set([...completedSessions, workoutId]));
    setSelectedWorkout(workoutId);
    setShowCompletionModal(true);
    
    // Dispatch completion action
    dispatch({
      type: 'COMPLETE_WORKOUT_SESSION',
      payload: { workoutId, completedAt: new Date().toISOString() }
    });
  };

  const startWorkout = (workout) => {
    Vibration.vibrate(100);
    Alert.alert(
      '🏃‍♂️ Start Workout',
      `Ready to begin "${workout.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Let\'s Go!', 
          onPress: () => navigation.navigate('WorkoutSession', { workout })
        }
      ]
    );
  };

  // Mock data - in real app this would come from Redux store
  const mockWorkouts = [
    {
      id: 1,
      title: 'Morning Cardio Blast 💨',
      coach: 'Coach Sarah',
      duration: 45,
      difficulty: 'Medium',
      type: 'Cardio',
      time: '07:00 AM',
      exercises: [
        { name: 'Warm-up Jog', duration: '10 min', sets: null },
        { name: 'High-Intensity Intervals', duration: '20 min', sets: '8 rounds' },
        { name: 'Cool-down Stretch', duration: '15 min', sets: null },
      ],
      points: 150,
      completion: 0,
      status: 'pending'
    },
    {
      id: 2,
      title: 'Strength Training 💪',
      coach: 'Coach Mike',
      duration: 60,
      difficulty: 'Hard',
      type: 'Strength',
      time: '10:30 AM',
      exercises: [
        { name: 'Squats', duration: null, sets: '4x12' },
        { name: 'Bench Press', duration: null, sets: '4x10' },
        { name: 'Deadlifts', duration: null, sets: '3x8' },
        { name: 'Pull-ups', duration: null, sets: '3xMax' },
      ],
      points: 200,
      completion: 0,
      status: 'pending'
    },
    {
      id: 3,
      title: 'Flexibility & Recovery 🧘‍♂️',
      coach: 'Coach Emma',
      duration: 30,
      difficulty: 'Easy',
      type: 'Recovery',
      time: '06:00 PM',
      exercises: [
        { name: 'Dynamic Stretching', duration: '10 min', sets: null },
        { name: 'Yoga Flow', duration: '15 min', sets: null },
        { name: 'Meditation', duration: '5 min', sets: null },
      ],
      points: 75,
      completion: 0,
      status: 'pending'
    },
  ];

  const currentWorkouts = workouts || mockWorkouts;
  const totalSessions = currentWorkouts.length;
  const completedCount = completedSessions.size;
  const completionPercentage = totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0;
  const currentStreak = user?.streak || 7; // Mock streak

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return COLORS.success;
      case 'medium': return '#FFA726';
      case 'hard': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'cardio': return 'directions-run';
      case 'strength': return 'fitness-center';
      case 'recovery': return 'spa';
      default: return 'sports';
    }
  };

  const renderWorkoutCard = (workout) => {
    const isCompleted = completedSessions.has(workout.id);
    const isExpanded = expandedCards.has(workout.id);

    return (
      <Animated.View
        key={workout.id}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: SPACING.md,
        }}
      >
        <Card style={{
          marginHorizontal: SPACING.md,
          elevation: 4,
          opacity: isCompleted ? 0.8 : 1,
        }}>
          <LinearGradient
            colors={isCompleted ? ['#4CAF50', '#45a049'] : ['#667eea', '#764ba2']}
            style={{
              padding: SPACING.md,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                  {workout.title}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
                  {workout.coach} • {workout.time}
                </Text>
              </View>
              <Avatar.Icon
                size={40}
                icon={getTypeIcon(workout.type)}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
            </View>
          </LinearGradient>

          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: SPACING.sm,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="access-time" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.body, { marginLeft: 4, color: COLORS.textSecondary }]}>
                  {workout.duration} min
                </Text>
              </View>
              <Chip
                mode="outlined"
                textStyle={{ fontSize: 12 }}
                style={{
                  backgroundColor: getDifficultyColor(workout.difficulty) + '20',
                  borderColor: getDifficultyColor(workout.difficulty),
                }}
              >
                {workout.difficulty}
              </Chip>
            </View>

            {isExpanded && (
              <View style={{ marginTop: SPACING.sm }}>
                <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
                  Exercises:
                </Text>
                {workout.exercises.map((exercise, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 4,
                      paddingHorizontal: SPACING.sm,
                      backgroundColor: index % 2 === 0 ? COLORS.background : 'transparent',
                      borderRadius: 4,
                    }}
                  >
                    <Text style={TEXT_STYLES.body}>{exercise.name}</Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      {exercise.duration || exercise.sets}
                    </Text>
                  </View>
                ))}
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: SPACING.sm,
                  padding: SPACING.sm,
                  backgroundColor: COLORS.primary + '10',
                  borderRadius: 8,
                }}>
                  <MaterialIcons name="stars" size={20} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.body, { marginLeft: 8, color: COLORS.primary }]}>
                    Earn {workout.points} points for completing this workout!
                  </Text>
                </View>
              </View>
            )}

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: SPACING.md,
            }}>
              <TouchableOpacity
                onPress={() => toggleCardExpansion(workout.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: SPACING.sm,
                }}
              >
                <MaterialIcons 
                  name={isExpanded ? 'expand-less' : 'expand-more'} 
                  size={24} 
                  color={COLORS.primary} 
                />
                <Text style={[TEXT_STYLES.body, { color: COLORS.primary, marginLeft: 4 }]}>
                  {isExpanded ? 'Less' : 'More'}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row' }}>
                {!isCompleted ? (
                  <>
                    <Button
                      mode="outlined"
                      onPress={() => startWorkout(workout)}
                      style={{ marginRight: SPACING.sm }}
                      labelStyle={{ fontSize: 12 }}
                    >
                      Start
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => completeSession(workout.id)}
                      buttonColor={COLORS.success}
                      labelStyle={{ fontSize: 12 }}
                    >
                      Complete
                    </Button>
                  </>
                ) : (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: COLORS.success + '20',
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.sm,
                    borderRadius: 20,
                  }}>
                    <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
                    <Text style={[TEXT_STYLES.body, { color: COLORS.success, marginLeft: 4 }]}>
                      Completed! 🎉
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.lg,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
              Today's Training 🔥
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Surface style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 25,
              padding: SPACING.sm,
              alignItems: 'center',
            }}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
                {currentStreak}
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Day Streak 🔥
              </Text>
            </Surface>
          </Animated.View>
        </View>

        {/* Progress Bar */}
        <View style={{ marginTop: SPACING.lg }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.sm,
          }}>
            <Text style={[TEXT_STYLES.subtitle, { color: 'white' }]}>
              Daily Progress
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
              {completedCount}/{totalSessions} sessions
            </Text>
          </View>
          <ProgressBar
            progress={completionPercentage / 100}
            color="white"
            style={{
              height: 8,
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: 4,
            }}
          />
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
            {Math.round(completionPercentage)}% Complete
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
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
        <View style={{ paddingVertical: SPACING.lg }}>
          {currentWorkouts.length > 0 ? (
            currentWorkouts.map(renderWorkoutCard)
          ) : (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: SPACING.xl,
            }}>
              <MaterialIcons name="event-available" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
                No workouts scheduled
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, marginTop: SPACING.sm }]}>
                Check back later or contact your coach
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Alert.alert(
            '🏃‍♂️ Quick Actions',
            'Feature Coming Soon!',
            [{ text: 'OK' }]
          );
        }}
      />

      {/* Completion Modal */}
      <Portal>
        {showCompletionModal && (
          <BlurView
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            blurType="light"
            blurAmount={10}
          >
            <Surface style={{
              margin: SPACING.lg,
              padding: SPACING.xl,
              borderRadius: 16,
              alignItems: 'center',
              elevation: 8,
            }}>
              <MaterialIcons name="celebration" size={64} color={COLORS.success} />
              <Text style={[TEXT_STYLES.h2, { color: COLORS.success, marginTop: SPACING.md }]}>
                Awesome Job! 🎉
              </Text>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
                You've completed another workout session!
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.primary, marginTop: SPACING.sm }]}>
                +{currentWorkouts.find(w => w.id === selectedWorkout)?.points || 0} points earned!
              </Text>
              <Button
                mode="contained"
                onPress={() => setShowCompletionModal(false)}
                style={{ marginTop: SPACING.lg }}
                buttonColor={COLORS.primary}
              >
                Continue
              </Button>
            </Surface>
          </BlurView>
        )}
      </Portal>
    </View>
  );
};

export default TodaysWorkouts;
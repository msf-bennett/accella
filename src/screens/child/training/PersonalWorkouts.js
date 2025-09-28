import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  Modal,
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
  Searchbar,
  Portal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const PersonalWorkouts = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, workouts, loading } = useSelector(state => state.fitness);
  
  const [activeTab, setActiveTab] = useState('workouts');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPaused, setPaused] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const timerRef = useRef(null);

  // Sample workout data
  const [workoutPlans] = useState([
    {
      id: 1,
      title: "Morning Energy Boost",
      description: "Start your day with fun movements to wake up your body! ☀️",
      difficulty: "Easy",
      duration: 15,
      calories: 45,
      icon: "wb-sunny",
      color: ['#FFD54F', '#FF8A65'],
      category: "Morning",
      level: 1,
      exercises: [
        { 
          name: "Jumping Jacks", 
          duration: 30, 
          description: "Jump up and spread your arms and legs wide! 🤸‍♀️",
          points: 10
        },
        { 
          name: "Arm Circles", 
          duration: 20, 
          description: "Make big circles with your arms like a windmill! 🌪️",
          points: 8
        },
        { 
          name: "March in Place", 
          duration: 30, 
          description: "Lift your knees high like you're marching in a parade! 🥁",
          points: 10
        },
        { 
          name: "Stretch Reach", 
          duration: 15, 
          description: "Reach up to the sky and touch the clouds! ☁️",
          points: 6
        }
      ]
    },
    {
      id: 2,
      title: "Animal Adventure",
      description: "Move like your favorite animals in this fun workout! 🦁",
      difficulty: "Medium",
      duration: 20,
      calories: 60,
      icon: "pets",
      color: ['#66BB6A', '#42A5F5'],
      category: "Fun",
      level: 2,
      exercises: [
        { 
          name: "Bear Crawl", 
          duration: 20, 
          description: "Walk on your hands and feet like a strong bear! 🐻",
          points: 12
        },
        { 
          name: "Frog Jumps", 
          duration: 30, 
          description: "Hop around like a happy frog by the pond! 🐸",
          points: 15
        },
        { 
          name: "Crab Walk", 
          duration: 25, 
          description: "Walk sideways with your belly up like a crab! 🦀",
          points: 13
        },
        { 
          name: "Butterfly Stretch", 
          duration: 15, 
          description: "Sit and flap your legs like butterfly wings! 🦋",
          points: 8
        },
        { 
          name: "Snake Slither", 
          duration: 20, 
          description: "Wiggle on your belly like a sneaky snake! 🐍",
          points: 10
        }
      ]
    },
    {
      id: 3,
      title: "Dance Party Fun",
      description: "Dance and move to the rhythm while getting stronger! 💃",
      difficulty: "Easy",
      duration: 12,
      calories: 40,
      icon: "music-note",
      color: ['#EC407A', '#AB47BC'],
      category: "Dance",
      level: 1,
      exercises: [
        { 
          name: "Wiggle Dance", 
          duration: 45, 
          description: "Wiggle your whole body to the beat! 🕺",
          points: 18
        },
        { 
          name: "Arm Wave", 
          duration: 30, 
          description: "Make waves with your arms like ocean water! 🌊",
          points: 12
        },
        { 
          name: "Hip Shake", 
          duration: 30, 
          description: "Shake your hips side to side! 💃",
          points: 12
        },
        { 
          name: "Happy Claps", 
          duration: 15, 
          description: "Clap your hands above your head with joy! 👏",
          points: 6
        }
      ]
    },
    {
      id: 4,
      title: "Superhero Training",
      description: "Train like your favorite superhero with these power moves! 🦸‍♀️",
      difficulty: "Medium",
      duration: 18,
      calories: 55,
      icon: "flash-on",
      color: ['#EF5350', '#5C6BC0'],
      category: "Hero",
      level: 2,
      exercises: [
        { 
          name: "Superhero Pose", 
          duration: 20, 
          description: "Stand tall with hands on hips like a hero! 🦸‍♀️",
          points: 10
        },
        { 
          name: "Flying Lunges", 
          duration: 30, 
          description: "Step forward and pretend to fly! ✈️",
          points: 15
        },
        { 
          name: "Power Punches", 
          duration: 25, 
          description: "Punch the air to fight off the bad guys! 👊",
          points: 13
        },
        { 
          name: "Hero Jumps", 
          duration: 20, 
          description: "Jump high like you're leaping tall buildings! 🏢",
          points: 10
        },
        { 
          name: "Shield Block", 
          duration: 15, 
          description: "Hold your arms up to block with your invisible shield! 🛡️",
          points: 8
        }
      ]
    }
  ]);

  const [completedWorkouts, setCompletedWorkouts] = useState([
    {
      workoutId: 2,
      date: "2025-08-29",
      duration: 20,
      calories: 60,
      title: "Animal Adventure",
      score: 95,
      points: 58,
      streak: 3
    },
    {
      workoutId: 1,
      date: "2025-08-28",
      duration: 15,
      calories: 45,
      title: "Morning Energy Boost",
      score: 88,
      points: 34,
      streak: 2
    }
  ]);

  const totalCaloriesBurned = completedWorkouts.reduce((sum, workout) => sum + workout.calories, 0);
  const totalWorkoutsCompleted = completedWorkouts.length;
  const totalPoints = completedWorkouts.reduce((sum, workout) => sum + workout.points, 0);
  const currentLevel = Math.floor(totalPoints / 50) + 1;
  const levelProgress = (totalPoints % 50) / 50;
  const currentStreak = Math.max(...completedWorkouts.map(w => w.streak), 0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isWorkoutActive && !isPaused && selectedWorkout) {
      timerRef.current = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isWorkoutActive, isPaused, selectedWorkout]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return COLORS.success;
      case 'medium': return '#FF9800';
      case 'hard': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const startWorkout = (workout) => {
    setSelectedWorkout(workout);
    setCurrentExercise(0);
    setTimer(0);
    setIsWorkoutActive(true);
    setPaused(false);
    setShowWorkoutModal(true);
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Vibration.vibrate(100);
    
    Alert.alert(
      "Workout Started! 🎉",
      `Get ready for ${workout.title}! Remember to have fun and stay safe!`,
      [{ text: "Let's Go! 💪", style: "default" }]
    );
  };

  const pauseWorkout = () => {
    setPaused(!isPaused);
    Vibration.vibrate(50);
  };

  const nextExercise = () => {
    if (currentExercise < selectedWorkout.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      Vibration.vibrate([100, 50, 100]);
    } else {
      completeWorkout();
    }
  };

  const completeWorkout = () => {
    setIsWorkoutActive(false);
    setShowWorkoutModal(false);
    
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const newCompletedWorkout = {
      workoutId: selectedWorkout.id,
      date: new Date().toISOString().split('T')[0],
      duration: selectedWorkout.duration,
      calories: selectedWorkout.calories,
      title: selectedWorkout.title,
      score: Math.floor(Math.random() * 20) + 80, // Random score between 80-100
      points: selectedWorkout.exercises.reduce((sum, ex) => sum + ex.points, 0),
      streak: currentStreak + 1
    };

    setCompletedWorkouts([newCompletedWorkout, ...completedWorkouts]);

    Alert.alert(
      "Workout Completed! 🏆",
      `Amazing job! You earned ${newCompletedWorkout.points} points and burned ${newCompletedWorkout.calories} calories! Keep up the great work! 🌟`,
      [{ text: "Awesome! 🎉", style: "default" }]
    );

    Vibration.vibrate([200, 100, 200, 100, 200]);
  };

  const resetWorkout = () => {
    setIsWorkoutActive(false);
    setCurrentExercise(0);
    setTimer(0);
    setPaused(false);
    setShowWorkoutModal(false);
    
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredWorkouts = workoutPlans.filter(workout =>
    searchQuery === '' ||
    workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderWorkoutCard = (workout) => (
    <Card key={workout.id} style={styles.workoutCard} elevation={4}>
      <LinearGradient
        colors={workout.color}
        style={styles.workoutCardHeader}
      >
        <View style={styles.workoutHeaderContent}>
          <Icon name={workout.icon} size={32} color="white" />
          <View style={styles.workoutHeaderText}>
            <Text style={styles.workoutTitle}>{workout.title}</Text>
            <Text style={styles.workoutCategory}>{workout.category}</Text>
          </View>
          <View style={styles.workoutLevel}>
            <Text style={styles.levelText}>L{workout.level}</Text>
          </View>
        </View>
      </LinearGradient>

      <Card.Content style={styles.workoutCardContent}>
        <Text style={[TEXT_STYLES.body, styles.workoutDescription]}>
          {workout.description}
        </Text>

        <View style={styles.workoutStats}>
          <View style={styles.statItem}>
            <Icon name="timer" size={16} color={COLORS.primary} />
            <Text style={styles.statText}>{workout.duration} min</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="local-fire-department" size={16} color="#FF6B35" />
            <Text style={styles.statText}>{workout.calories} cal</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="fitness-center" size={16} color={COLORS.success} />
            <Text style={styles.statText}>{workout.exercises.length} exercises</Text>
          </View>
        </View>

        <View style={styles.workoutActions}>
          <Chip
            mode="outlined"
            style={[styles.difficultyChip, { borderColor: getDifficultyColor(workout.difficulty) }]}
            textStyle={{ color: getDifficultyColor(workout.difficulty) }}
          >
            {workout.difficulty}
          </Chip>
          
          <Button
            mode="contained"
            onPress={() => startWorkout(workout)}
            style={[styles.startWorkoutButton, { backgroundColor: workout.color[0] }]}
            contentStyle={styles.startWorkoutContent}
          >
            <Icon name="play-arrow" size={20} color="white" />
            Start Workout
          </Button>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.exercisePreview}
        >
          {workout.exercises.map((exercise, index) => (
            <Surface key={index} style={styles.exercisePreviewCard}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseDuration}>{exercise.duration}s</Text>
            </Surface>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderCompletedWorkout = (workout) => (
    <Card key={`${workout.workoutId}-${workout.date}`} style={styles.completedCard} elevation={2}>
      <Card.Content style={styles.completedContent}>
        <View style={styles.completedHeader}>
          <View>
            <Text style={[TEXT_STYLES.h4, styles.completedTitle]}>{workout.title}</Text>
            <Text style={styles.completedDate}>{workout.date}</Text>
          </View>
          <Surface style={styles.completedScore}>
            <Text style={styles.scoreText}>{workout.score}%</Text>
          </Surface>
        </View>

        <View style={styles.completedStats}>
          <View style={styles.completedStatItem}>
            <Icon name="timer" size={16} color={COLORS.textSecondary} />
            <Text style={styles.completedStatText}>{workout.duration} min</Text>
          </View>
          <View style={styles.completedStatItem}>
            <Icon name="local-fire-department" size={16} color="#FF6B35" />
            <Text style={styles.completedStatText}>{workout.calories} cal</Text>
          </View>
          <View style={styles.completedStatItem}>
            <Icon name="stars" size={16} color="#FFD700" />
            <Text style={styles.completedStatText}>{workout.points} pts</Text>
          </View>
          <View style={styles.completedStatItem}>
            <Icon name="whatshot" size={16} color="#FF4500" />
            <Text style={styles.completedStatText}>{workout.streak} 🔥</Text>
          </View>
        </View>

        <ProgressBar 
          progress={workout.score / 100} 
          color={COLORS.success}
          style={styles.completedProgress}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>
            Personal Workouts 💪
          </Text>
          <Text style={styles.headerSubtitle}>
            Stay active and have fun with fitness! 🎉
          </Text>

          <View style={styles.fitnessStats}>
            <Surface style={styles.fitnessStatCard}>
              <Text style={styles.fitnessStatNumber}>{totalCaloriesBurned}</Text>
              <Text style={styles.fitnessStatLabel}>Calories Burned 🔥</Text>
            </Surface>
            <Surface style={styles.fitnessStatCard}>
              <Text style={styles.fitnessStatNumber}>Level {currentLevel}</Text>
              <ProgressBar 
                progress={levelProgress} 
                color="#FFD700"
                style={styles.fitnessLevelProgress}
              />
            </Surface>
            <Surface style={styles.fitnessStatCard}>
              <Text style={styles.fitnessStatNumber}>{currentStreak}</Text>
              <Text style={styles.fitnessStatLabel}>Day Streak 🔥</Text>
            </Surface>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Searchbar
          placeholder="Search workouts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'workouts' && styles.activeTab]}
            onPress={() => setActiveTab('workouts')}
          >
            <Icon 
              name="fitness-center" 
              size={20} 
              color={activeTab === 'workouts' ? 'white' : COLORS.textSecondary} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'workouts' && styles.activeTabText
            ]}>
              Workouts ({filteredWorkouts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Icon 
              name="jump-rope" 
              size={20} 
              color={activeTab === 'completed' ? 'white' : COLORS.textSecondary} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'completed' && styles.activeTabText
            ]}>
              Completed ({totalWorkoutsCompleted})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
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
          {activeTab === 'workouts' && (
            <View style={styles.workoutsContainer}>
              {filteredWorkouts.length === 0 ? (
                <Surface style={styles.emptyState}>
                  <Icon name="fitness-center" size={64} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
                    No workouts found
                  </Text>
                  <Text style={[TEXT_STYLES.body, styles.emptySubtitle]}>
                    Try adjusting your search or check back later!
                  </Text>
                </Surface>
              ) : (
                filteredWorkouts.map(renderWorkoutCard)
              )}
            </View>
          )}

          {activeTab === 'completed' && (
            <View style={styles.completedContainer}>
              {completedWorkouts.length === 0 ? (
                <Surface style={styles.emptyState}>
                  <Icon name="jump-rope" size={64} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
                    No completed workouts yet
                  </Text>
                  <Text style={[TEXT_STYLES.body, styles.emptySubtitle]}>
                    Complete your first workout to see it here! 🏆
                  </Text>
                </Surface>
              ) : (
                completedWorkouts.map(renderCompletedWorkout)
              )}
            </View>
          )}

          <Surface style={styles.motivationCard}>
            <LinearGradient
              colors={['#FF6B6B', '#4ECDC4']}
              style={styles.motivationGradient}
            >
              <Text style={[TEXT_STYLES.h2, styles.motivationTitle]}>
                You're Doing Amazing! 🌟
              </Text>
              <Text style={[TEXT_STYLES.body, styles.motivationText]}>
                Every workout makes you stronger and healthier. Keep moving and having fun! 💪
              </Text>
              <View style={styles.motivationTags}>
                <Chip style={styles.motivationTag}>💪 Stay Strong</Chip>
                <Chip style={styles.motivationTag}>🏃‍♀️ Stay Active</Chip>
                <Chip style={styles.motivationTag}>😊 Have Fun</Chip>
              </View>
            </LinearGradient>
          </Surface>
        </ScrollView>
      </Animated.View>

      {/* Active Workout Modal */}
      <Portal>
        <Modal
          visible={showWorkoutModal}
          onDismiss={() => {}}
          contentContainerStyle={styles.modalContainer}
        >
          <Animated.View style={[
            styles.workoutModal,
            { transform: [{ translateY: slideAnim }] }
          ]}>
            {selectedWorkout && (
              <LinearGradient
                colors={selectedWorkout.color}
                style={styles.workoutModalContent}
              >
                <View style={styles.workoutModalHeader}>
                  <Text style={styles.workoutModalTitle}>{selectedWorkout.title}</Text>
                  <TouchableOpacity onPress={resetWorkout} style={styles.closeButton}>
                    <Icon name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                <View style={styles.currentExerciseCard}>
                  <Text style={styles.exerciseCounter}>
                    Exercise {currentExercise + 1} of {selectedWorkout.exercises.length}
                  </Text>
                  <Text style={styles.currentExerciseName}>
                    {selectedWorkout.exercises[currentExercise]?.name}
                  </Text>
                  <Text style={styles.currentExerciseDescription}>
                    {selectedWorkout.exercises[currentExercise]?.description}
                  </Text>
                  
                  <Surface style={styles.timerCard}>
                    <Text style={styles.timerText}>{formatTime(timer)}</Text>
                    <Text style={styles.timerLabel}>Total Time</Text>
                  </Surface>

                  <ProgressBar
                    progress={(currentExercise + 1) / selectedWorkout.exercises.length}
                    color="white"
                    style={styles.workoutProgress}
                  />
                </View>

                <View style={styles.workoutControls}>
                  <IconButton
                    icon={isPaused ? "play-arrow" : "pause"}
                    size={32}
                    iconColor="white"
                    style={styles.controlButton}
                    onPress={pauseWorkout}
                  />
                  <IconButton
                    icon="skip-next"
                    size={32}
                    iconColor="white"
                    style={styles.controlButton}
                    onPress={nextExercise}
                  />
                  <IconButton
                    icon="refresh"
                    size={32}
                    iconColor="white"
                    style={styles.controlButton}
                    onPress={resetWorkout}
                  />
                </View>
              </LinearGradient>
            )}
          </Animated.View>
        </Modal>
      </Portal>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert(
          "Custom Workout",
          "Feature coming soon! You'll be able to create your own fun workout routines! 🎯"
        )}
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
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontSize: 16,
  },
  fitnessStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  fitnessStatCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  fitnessStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  fitnessStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  fitnessLevelProgress: {
    width: '100%',
    marginTop: SPACING.xs,
    height: 4,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  searchBar: {
    margin: SPACING.lg,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  workoutsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  workoutCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  workoutCardHeader: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  workoutHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutHeaderText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  workoutTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  workoutCategory: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  workoutLevel: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  workoutCardContent: {
    padding: SPACING.lg,
  },
  workoutDescription: {
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  workoutActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  difficultyChip: {
    marginRight: SPACING.md,
  },
  startWorkoutButton: {
    borderRadius: 25,
  },
  startWorkoutContent: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  exercisePreview: {
    marginTop: SPACING.md,
  },
  exercisePreviewCard: {
    marginRight: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  exerciseDuration: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  completedContainer: {
    paddingHorizontal: SPACING.lg,
  },
  completedCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  completedContent: {
    padding: SPACING.lg,
  },
  completedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  completedTitle: {
    color: COLORS.text,
  },
  completedDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  completedScore: {
    backgroundColor: COLORS.success,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  scoreText: {
    color: 'white',
    fontWeight: 'bold',
  },
  completedStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  completedStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedStatText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  completedProgress: {
    height: 4,
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginVertical: SPACING.xl,
    borderRadius: 16,
  },
  emptyTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  motivationCard: {
    margin: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  motivationGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  motivationTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  motivationText: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  motivationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  motivationTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  workoutModal: {
    height: height * 0.8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  workoutModalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  workoutModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  workoutModalTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: SPACING.sm,
  },
  currentExerciseCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseCounter: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: SPACING.md,
  },
  currentExerciseName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  currentExerciseDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  timerCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  timerText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  timerLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  workoutProgress: {
    width: width * 0.8,
    height: 6,
    borderRadius: 3,
  },
  workoutControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default PersonalWorkouts;
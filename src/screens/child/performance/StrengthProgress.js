import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Vibration,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
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
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const StrengthProgress = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, strengthData, loading, error } = useSelector(state => state.performance);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('3months');
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;

  // Strength categories
  const strengthCategories = [
    { id: 'all', name: 'All', icon: 'fitness-center', color: COLORS.primary },
    { id: 'upper', name: 'Upper Body', icon: 'accessibility', color: '#e74c3c' },
    { id: 'lower', name: 'Lower Body', icon: 'directions-run', color: '#f39c12' },
    { id: 'core', name: 'Core', icon: 'center-focus-strong', color: '#9b59b6' },
    { id: 'functional', name: 'Functional', icon: 'dynamic-form', color: '#1abc9c' },
  ];

  const timeframes = [
    { id: '1month', name: '1 Month', icon: 'today' },
    { id: '3months', name: '3 Months', icon: 'date-range' },
    { id: '6months', name: '6 Months', icon: 'event' },
    { id: '1year', name: '1 Year', icon: 'history' },
  ];

  // Mock strength data
  const strengthExercises = [
    {
      id: 1,
      name: 'Push-ups',
      category: 'upper',
      type: 'bodyweight',
      currentMax: 35,
      personalBest: 40,
      startingValue: 15,
      target: 50,
      unit: 'reps',
      trend: '+8',
      icon: '💪',
      lastWorkout: '2 days ago',
      improvements: [
        { date: '2024-05-01', value: 15 },
        { date: '2024-06-01', value: 22 },
        { date: '2024-07-01', value: 28 },
        { date: '2024-08-01', value: 35 },
      ],
      tips: 'Focus on form over quantity. Keep your body straight and engage your core.',
    },
    {
      id: 2,
      name: 'Squats',
      category: 'lower',
      type: 'bodyweight',
      currentMax: 45,
      personalBest: 50,
      startingValue: 20,
      target: 60,
      unit: 'reps',
      trend: '+12',
      icon: '🦵',
      lastWorkout: '1 day ago',
      improvements: [
        { date: '2024-05-01', value: 20 },
        { date: '2024-06-01', value: 30 },
        { date: '2024-07-01', value: 38 },
        { date: '2024-08-01', value: 45 },
      ],
      tips: 'Keep your knees behind your toes and go as low as you can comfortably.',
    },
    {
      id: 3,
      name: 'Plank Hold',
      category: 'core',
      type: 'time',
      currentMax: 90,
      personalBest: 120,
      startingValue: 30,
      target: 180,
      unit: 'seconds',
      trend: '+25s',
      icon: '⚡',
      lastWorkout: '3 days ago',
      improvements: [
        { date: '2024-05-01', value: 30 },
        { date: '2024-06-01', value: 55 },
        { date: '2024-07-01', value: 75 },
        { date: '2024-08-01', value: 90 },
      ],
      tips: 'Keep your body in a straight line and breathe steadily throughout the hold.',
    },
    {
      id: 4,
      name: 'Pull-ups',
      category: 'upper',
      type: 'bodyweight',
      currentMax: 8,
      personalBest: 10,
      startingValue: 2,
      target: 15,
      unit: 'reps',
      trend: '+3',
      icon: '🏋️‍♂️',
      lastWorkout: '4 days ago',
      improvements: [
        { date: '2024-05-01', value: 2 },
        { date: '2024-06-01', value: 4 },
        { date: '2024-07-01', value: 6 },
        { date: '2024-08-01', value: 8 },
      ],
      tips: 'Use assisted pull-ups or resistance bands if needed. Focus on controlled movement.',
    },
    {
      id: 5,
      name: 'Burpees',
      category: 'functional',
      type: 'bodyweight',
      currentMax: 25,
      personalBest: 30,
      startingValue: 10,
      target: 40,
      unit: 'reps',
      trend: '+7',
      icon: '🔥',
      lastWorkout: '1 day ago',
      improvements: [
        { date: '2024-05-01', value: 10 },
        { date: '2024-06-01', value: 16 },
        { date: '2024-07-01', value: 20 },
        { date: '2024-08-01', value: 25 },
      ],
      tips: 'Maintain good form even when tired. Break into sets if needed.',
    },
    {
      id: 6,
      name: 'Lunges',
      category: 'lower',
      type: 'bodyweight',
      currentMax: 30,
      personalBest: 35,
      startingValue: 12,
      target: 50,
      unit: 'reps (each leg)',
      trend: '+6',
      icon: '🚀',
      lastWorkout: '2 days ago',
      improvements: [
        { date: '2024-05-01', value: 12 },
        { date: '2024-06-01', value: 18 },
        { date: '2024-07-01', value: 24 },
        { date: '2024-08-01', value: 30 },
      ],
      tips: 'Step far enough forward and keep your torso upright throughout the movement.',
    },
  ];

  // Recent workouts data
  const recentWorkouts = [
    {
      id: 1,
      date: '2024-08-28',
      duration: 45,
      exercises: ['Push-ups', 'Squats', 'Burpees'],
      totalReps: 185,
      caloriesBurned: 320,
      rating: 4.5,
    },
    {
      id: 2,
      date: '2024-08-26',
      duration: 38,
      exercises: ['Pull-ups', 'Plank Hold', 'Lunges'],
      totalReps: 145,
      caloriesBurned: 280,
      rating: 4.2,
    },
    {
      id: 3,
      date: '2024-08-24',
      duration: 52,
      exercises: ['Push-ups', 'Squats', 'Plank Hold', 'Burpees'],
      totalReps: 220,
      caloriesBurned: 380,
      rating: 4.8,
    },
  ];

  // Animation effects
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
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Chart animation
  useEffect(() => {
    chartAnim.setValue(0);
    Animated.timing(chartAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [selectedCategory, selectedTimeframe, chartAnim]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh strength data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter exercises by category
  const filteredExercises = strengthExercises.filter(exercise => 
    selectedCategory === 'all' || exercise.category === selectedCategory
  );

  // Get progress color
  const getProgressColor = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage >= 80) return '#27ae60';
    if (percentage >= 60) return '#f39c12';
    return '#e74c3c';
  };

  // Get trend color
  const getTrendColor = (trend) => {
    if (trend.includes('+')) return '#27ae60';
    if (trend.includes('-')) return '#e74c3c';
    return COLORS.textSecondary;
  };

  // Handle exercise tap
  const handleExerciseTap = (exercise) => {
    Vibration.vibrate(50);
    setSelectedExercise(exercise);
    setShowAddRecordModal(true);
  };

  // Calculate improvement percentage
  const calculateImprovement = (exercise) => {
    const improvement = ((exercise.currentMax - exercise.startingValue) / exercise.startingValue) * 100;
    return Math.round(improvement);
  };

  // Calculate overall strength score
  const calculateOverallStrengthScore = () => {
    if (!filteredExercises.length) return 0;
    const totalScore = filteredExercises.reduce((acc, exercise) => {
      return acc + (exercise.currentMax / exercise.target) * 100;
    }, 0);
    return Math.round(totalScore / filteredExercises.length);
  };

  // Render category chips
  const renderCategoryChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: SPACING.md }}
    >
      {strengthCategories.map(category => (
        <Chip
          key={category.id}
          mode={selectedCategory === category.id ? 'flat' : 'outlined'}
          selected={selectedCategory === category.id}
          onPress={() => {
            setSelectedCategory(category.id);
            Vibration.vibrate(30);
          }}
          icon={category.icon}
          style={{
            marginRight: SPACING.sm,
            backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
          }}
          textStyle={{
            color: selectedCategory === category.id ? 'white' : category.color,
            fontSize: 12,
            fontWeight: '600',
          }}
        >
          {category.name}
        </Chip>
      ))}
    </ScrollView>
  );

  // Render timeframe selector
  const renderTimeframeSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: SPACING.md }}
    >
      {timeframes.map(timeframe => (
        <Chip
          key={timeframe.id}
          mode={selectedTimeframe === timeframe.id ? 'flat' : 'outlined'}
          selected={selectedTimeframe === timeframe.id}
          onPress={() => {
            setSelectedTimeframe(timeframe.id);
            Vibration.vibrate(30);
          }}
          icon={timeframe.icon}
          style={{
            marginRight: SPACING.sm,
            backgroundColor: selectedTimeframe === timeframe.id ? COLORS.primary : 'transparent',
          }}
          textStyle={{
            color: selectedTimeframe === timeframe.id ? 'white' : COLORS.primary,
            fontSize: 12,
            fontWeight: '600',
          }}
        >
          {timeframe.name}
        </Chip>
      ))}
    </ScrollView>
  );

  // Render strength overview
  const renderStrengthOverview = () => {
    const overallScore = calculateOverallStrengthScore();
    const totalImprovement = filteredExercises.reduce((acc, exercise) => 
      acc + calculateImprovement(exercise), 0) / filteredExercises.length;

    return (
      <Surface style={{
        margin: SPACING.md,
        borderRadius: 16,
        elevation: 6,
      }}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            padding: SPACING.lg,
            borderRadius: 16,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
            <Text style={[TEXT_STYLES.h1, { color: 'white', fontSize: 48, fontWeight: 'bold' }]}>
              {overallScore}%
            </Text>
            <Text style={[TEXT_STYLES.body1, { color: 'rgba(255,255,255,0.9)', fontWeight: '600' }]}>
              Strength Progress Score
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 4 }]}>
              Based on {filteredExercises.length} exercises over {selectedTimeframe}
            </Text>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: SPACING.md,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.3)',
          }}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="trending-up" size={28} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4 }]}>
                Avg Improvement
              </Text>
              <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold' }]}>
                +{Math.round(totalImprovement)}%
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Icon name="fitness-center" size={28} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4 }]}>
                Active Exercises
              </Text>
              <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold' }]}>
                {filteredExercises.length}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Icon name="whatshot" size={28} color="white" />
              <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4 }]}>
                Streak
              </Text>
              <Text style={[TEXT_STYLES.h3, { color: 'white', fontWeight: 'bold' }]}>
                12 days
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Surface>
    );
  };

  // Render exercise card
  const renderExerciseCard = (exercise, index) => {
    const progress = (exercise.currentMax / exercise.target) * 100;
    const progressColor = getProgressColor(exercise.currentMax, exercise.target);
    const improvement = calculateImprovement(exercise);
    
    return (
      <Animated.View
        key={exercise.id}
        style={{
          transform: [
            { 
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50 * (index + 1) * 0.1],
              })
            },
            { scale: scaleAnim }
          ],
          opacity: fadeAnim,
          marginBottom: SPACING.md,
          marginHorizontal: SPACING.md,
        }}
      >
        <TouchableOpacity
          onPress={() => handleExerciseTap(exercise)}
          activeOpacity={0.8}
        >
          <Card style={{
            elevation: 4,
            borderRadius: 16,
            borderLeftWidth: 5,
            borderLeftColor: progressColor,
          }}>
            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 24, marginRight: 8 }}>{exercise.icon}</Text>
                    <Text style={[TEXT_STYLES.h3, { fontWeight: 'bold', flex: 1 }]}>
                      {exercise.name}
                    </Text>
                    <Chip
                      compact
                      style={{ 
                        backgroundColor: strengthCategories.find(c => c.id === exercise.category)?.color + '20',
                        height: 24,
                      }}
                      textStyle={{ 
                        fontSize: 10, 
                        color: strengthCategories.find(c => c.id === exercise.category)?.color,
                      }}
                    >
                      {strengthCategories.find(c => c.id === exercise.category)?.name}
                    </Chip>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 }}>
                    <Text style={[TEXT_STYLES.h2, { color: progressColor, marginRight: 4 }]}>
                      {exercise.currentMax}
                    </Text>
                    <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary }]}>
                      {exercise.unit}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 8 }]}>
                      / {exercise.target} {exercise.unit}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="history" size={14} color={COLORS.textSecondary} />
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                        Last: {exercise.lastWorkout}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon 
                        name="trending-up" 
                        size={16} 
                        color={getTrendColor(exercise.trend)} 
                      />
                      <Text style={[TEXT_STYLES.body2, { color: getTrendColor(exercise.trend), marginLeft: 4, fontWeight: '600' }]}>
                        {exercise.trend}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                        Progress to Goal
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: progressColor, fontWeight: '600' }]}>
                        {Math.round(progress)}%
                      </Text>
                    </View>
                    <Animated.View style={{
                      width: chartAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    }}>
                      <ProgressBar
                        progress={progress / 100}
                        color={progressColor}
                        style={{ height: 6, borderRadius: 3 }}
                      />
                    </Animated.View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                        Personal Best
                      </Text>
                      <Text style={[TEXT_STYLES.body1, { fontWeight: '600', color: '#f39c12' }]}>
                        {exercise.personalBest} {exercise.unit}
                      </Text>
                    </View>
                    <Surface style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      backgroundColor: improvement > 0 ? '#27ae60' + '20' : COLORS.background,
                    }}>
                      <Text style={[
                        TEXT_STYLES.caption, 
                        { 
                          color: improvement > 0 ? '#27ae60' : COLORS.textSecondary,
                          fontWeight: '600' 
                        }
                      ]}>
                        +{improvement}% improved
                      </Text>
                    </Surface>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render recent workouts
  const renderRecentWorkouts = () => (
    <View style={{ margin: SPACING.md }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, fontWeight: 'bold' }]}>
        Recent Workouts 🏋️‍♂️
      </Text>
      {recentWorkouts.slice(0, 3).map((workout, index) => (
        <Card key={workout.id} style={{ marginBottom: SPACING.sm, elevation: 2 }}>
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.body1, { fontWeight: '600', marginBottom: 4 }]}>
                  {new Date(workout.date).toLocaleDateString()}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: 8 }]}>
                  {workout.exercises.join(', ')}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    ⏱️ {workout.duration} min
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    🔥 {workout.caloriesBurned} cal
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    💪 {workout.totalReps} reps
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'center', marginLeft: SPACING.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Icon
                      key={star}
                      name="star"
                      size={16}
                      color={star <= workout.rating ? '#f39c12' : '#ddd'}
                    />
                  ))}
                </View>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: 2 }]}>
                  {workout.rating}/5
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
      
      <Button
        mode="outlined"
        onPress={() => {
          Alert.alert(
            "Workout History",
            "Full workout history and analytics coming soon! 📊",
            [{ text: "Great!", style: "default" }]
          );
        }}
        style={{ marginTop: SPACING.sm, borderRadius: 25 }}
        icon="history"
      >
        View All Workouts
      </Button>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.lg,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: 4 }]}>
              Strength Progress 💪
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Track your strength development journey
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon="timeline"
              iconColor="white"
              size={24}
              onPress={() => {
                Vibration.vibrate(30);
                Alert.alert(
                  "Progress Charts",
                  "Detailed progress visualization coming soon! 📈",
                  [{ text: "Awesome!", style: "default" }]
                );
              }}
            />
            <Avatar.Text
              size={45}
              label={user?.name?.charAt(0) || 'P'}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
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
        {/* Selectors */}
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.body1, { fontWeight: '600', marginBottom: SPACING.sm }]}>
            Exercise Category
          </Text>
          {renderCategoryChips()}
          
          <Text style={[TEXT_STYLES.body1, { fontWeight: '600', marginBottom: SPACING.sm }]}>
            Time Period
          </Text>
          {renderTimeframeSelector()}
        </View>

        {/* Strength Overview */}
        {renderStrengthOverview()}

        {/* Exercise Progress */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {filteredExercises.map((exercise, index) => 
            renderExerciseCard(exercise, index)
          )}
        </Animated.View>

        {/* Recent Workouts */}
        {renderRecentWorkouts()}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert(
            "Log Workout",
            "Quick workout logging coming soon! 🏋️‍♂️",
            [{ text: "Awesome!", style: "default" }]
          );
        }}
      />

      {/* Exercise Detail Modal */}
      <Portal>
        <Modal
          visible={showAddRecordModal}
          onDismiss={() => setShowAddRecordModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: SPACING.lg,
            margin: SPACING.lg,
            borderRadius: 16,
            maxHeight: height * 0.8,
          }}
        >
          {selectedExercise && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
                <Text style={{ fontSize: 48, marginBottom: 8 }}>{selectedExercise.icon}</Text>
                <Text style={[TEXT_STYLES.h2, { fontWeight: 'bold', textAlign: 'center' }]}>
                  {selectedExercise.name}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                  {selectedExercise.tips}
                </Text>
              </View>

              <View style={{ marginBottom: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h3, { fontWeight: 'bold', marginBottom: SPACING.md }]}>
                  Progress Overview
                </Text>
                
                <Surface style={{ padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={TEXT_STYLES.body1}>Current Max</Text>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, fontWeight: 'bold' }]}>
                      {selectedExercise.currentMax} {selectedExercise.unit}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={TEXT_STYLES.body1}>Personal Best</Text>
                    <Text style={[TEXT_STYLES.body1, { color: '#f39c12', fontWeight: '600' }]}>
                      {selectedExercise.personalBest} {selectedExercise.unit}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={TEXT_STYLES.body1}>Target Goal</Text>
                    <Text style={[TEXT_STYLES.body1, { color: '#27ae60', fontWeight: '600' }]}>
                      {selectedExercise.target} {selectedExercise.unit}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={TEXT_STYLES.body1}>Improvement</Text>
                    <Text style={[TEXT_STYLES.body1, { color: '#27ae60', fontWeight: '600' }]}>
                      +{calculateImprovement(selectedExercise)}%
                    </Text>
                  </View>
                </Surface>

                <Text style={[TEXT_STYLES.h3, { fontWeight: 'bold', marginBottom: SPACING.md }]}>
                  Recent Progress
                </Text>
                
                {selectedExercise.improvements.map((improvement, index) => (
                  <Surface key={index} style={{ 
                    padding: SPACING.sm, 
                    borderRadius: 8, 
                    marginBottom: SPACING.sm,
                    backgroundColor: index === selectedExercise.improvements.length - 1 ? COLORS.primary + '10' : COLORS.background 
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary }]}>
                        {new Date(improvement.date).toLocaleDateString()}
                      </Text>
                      <Text style={[
                        TEXT_STYLES.body1, 
                        { 
                          fontWeight: '600',
                          color: index === selectedExercise.improvements.length - 1 ? COLORS.primary : COLORS.text
                        }
                      ]}>
                        {improvement.value} {selectedExercise.unit}
                      </Text>
                    </View>
                  </Surface>
                ))}
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md }}>
                <Button
                  mode="outlined"
                  onPress={() => setShowAddRecordModal(false)}
                  style={{ flex: 1, marginRight: SPACING.sm }}
                >
                  Close
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowAddRecordModal(false);
                    Alert.alert(
                      "Log New Record",
                      "Record logging feature coming soon! 📝",
                      [{ text: "Great!", style: "default" }]
                    );
                  }}
                  style={{ flex: 1, marginLeft: SPACING.sm }}
                  icon="add"
                >
                  Log Record
                </Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

export default StrengthProgress;
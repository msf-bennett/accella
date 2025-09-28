import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Vibration,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const ActiveWorkouts = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, activeWorkouts, loading, error } = useSelector(state => state.training);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Load active workouts
    loadActiveWorkouts();
  }, []);

  const loadActiveWorkouts = useCallback(async () => {
    try {
      // Simulate API call - replace with actual Redux action
      // dispatch(fetchActiveWorkouts());
    } catch (error) {
      Alert.alert('Error', 'Failed to load active workouts');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    await loadActiveWorkouts();
    setRefreshing(false);
  }, [loadActiveWorkouts]);

  // Mock data - replace with actual Redux state
  const mockWorkouts = [
    {
      id: 1,
      title: 'Morning Cardio Session',
      coach: 'Coach Johnson',
      duration: 45,
      progress: 75,
      type: 'cardio',
      scheduledTime: '08:00 AM',
      exercises: [
        { name: 'Warm-up Jog', duration: 10, completed: true },
        { name: 'HIIT Intervals', duration: 20, completed: true },
        { name: 'Cool Down', duration: 15, completed: false },
      ],
      difficulty: 'medium',
      points: 120,
      streakDay: 5,
    },
    {
      id: 2,
      title: 'Strength Training - Upper Body',
      coach: 'Coach Martinez',
      duration: 60,
      progress: 30,
      type: 'strength',
      scheduledTime: '02:00 PM',
      exercises: [
        { name: 'Push-ups', sets: 3, reps: 15, completed: true },
        { name: 'Pull-ups', sets: 3, reps: 8, completed: false },
        { name: 'Bench Press', sets: 4, reps: 10, completed: false },
        { name: 'Shoulder Press', sets: 3, reps: 12, completed: false },
      ],
      difficulty: 'hard',
      points: 180,
      streakDay: 3,
    },
    {
      id: 3,
      title: 'Football Skills Practice',
      coach: 'Coach Wilson',
      duration: 90,
      progress: 10,
      type: 'sport',
      scheduledTime: '04:00 PM',
      exercises: [
        { name: 'Ball Control Drills', duration: 20, completed: false },
        { name: 'Passing Practice', duration: 30, completed: false },
        { name: 'Shooting Drills', duration: 25, completed: false },
        { name: 'Small-sided Games', duration: 15, completed: false },
      ],
      difficulty: 'medium',
      points: 200,
      streakDay: 1,
    },
  ];

  const filteredWorkouts = mockWorkouts.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.coach.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || workout.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { key: 'all', label: 'All', icon: 'fitness-center' },
    { key: 'cardio', label: 'Cardio', icon: 'favorite' },
    { key: 'strength', label: 'Strength', icon: 'fitness-center' },
    { key: 'sport', label: 'Sport', icon: 'sports-soccer' },
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return COLORS.success;
      case 'medium': return COLORS.warning;
      case 'hard': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getProgressColor = (progress) => {
    if (progress < 25) return COLORS.error;
    if (progress < 50) return COLORS.warning;
    if (progress < 75) return COLORS.info;
    return COLORS.success;
  };

  const handleStartWorkout = (workoutId) => {
    Vibration.vibrate(100);
    Alert.alert(
      'Start Workout',
      'Ready to begin your training session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            navigation.navigate('WorkoutSession', { workoutId });
          },
        },
      ]
    );
  };

  const handleResumeWorkout = (workoutId) => {
    Vibration.vibrate(100);
    navigation.navigate('WorkoutSession', { workoutId, resume: true });
  };

  const renderWorkoutCard = (workout, index) => (
    <Animated.View
      key={workout.id}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Card
        style={{
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          elevation: 4,
        }}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            padding: SPACING.md,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: SPACING.xs }]}>
                {workout.title}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                <Avatar.Text
                  size={28}
                  label={workout.coach.split(' ').map(n => n[0]).join('')}
                  style={{ backgroundColor: 'rgba(255,255,255,0.3)', marginRight: SPACING.xs }}
                />
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
                  {workout.coach}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="schedule" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)', marginLeft: SPACING.xs }]}>
                  {workout.scheduledTime} • {workout.duration} min
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Chip
                mode="flat"
                style={{
                  backgroundColor: getDifficultyColor(workout.difficulty),
                  marginBottom: SPACING.xs,
                }}
                textStyle={{ color: 'white', fontSize: 12 }}
              >
                {workout.difficulty.toUpperCase()}
              </Chip>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="local-fire-department" size={16} color="#FF6B35" />
                <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: SPACING.xs }]}>
                  {workout.streakDay} day streak
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ marginBottom: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs }}>
              <Text style={TEXT_STYLES.body2}>Progress</Text>
              <Text style={[TEXT_STYLES.caption, { color: getProgressColor(workout.progress) }]}>
                {workout.progress}%
              </Text>
            </View>
            <ProgressBar
              progress={workout.progress / 100}
              color={getProgressColor(workout.progress)}
              style={{ height: 6, borderRadius: 3 }}
            />
          </View>

          <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.sm }]}>
            Exercises ({workout.exercises.length})
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {workout.exercises.map((exercise, idx) => (
              <Surface
                key={idx}
                style={{
                  marginRight: SPACING.sm,
                  padding: SPACING.sm,
                  borderRadius: 8,
                  width: 120,
                  backgroundColor: exercise.completed ? COLORS.success + '20' : COLORS.background,
                }}
              >
                <View style={{ alignItems: 'center' }}>
                  <Icon
                    name={exercise.completed ? 'check-circle' : 'radio-button-unchecked'}
                    size={24}
                    color={exercise.completed ? COLORS.success : COLORS.textSecondary}
                    style={{ marginBottom: SPACING.xs }}
                  />
                  <Text style={[TEXT_STYLES.caption, { textAlign: 'center', fontSize: 10 }]}>
                    {exercise.name}
                  </Text>
                  {exercise.duration && (
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, fontSize: 9 }]}>
                      {exercise.duration} min
                    </Text>
                  )}
                  {exercise.sets && (
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, fontSize: 9 }]}>
                      {exercise.sets} x {exercise.reps}
                    </Text>
                  )}
                </View>
              </Surface>
            ))}
          </ScrollView>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="stars" size={20} color="#FFD700" />
              <Text style={[TEXT_STYLES.body2, { marginLeft: SPACING.xs, color: COLORS.textSecondary }]}>
                {workout.points} points
              </Text>
            </View>
            
            {workout.progress > 0 ? (
              <Button
                mode="contained"
                onPress={() => handleResumeWorkout(workout.id)}
                style={{ backgroundColor: COLORS.primary }}
                contentStyle={{ paddingHorizontal: SPACING.md }}
                labelStyle={TEXT_STYLES.button}
              >
                Resume 🔥
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={() => handleStartWorkout(workout.id)}
                style={{ backgroundColor: COLORS.success }}
                contentStyle={{ paddingHorizontal: SPACING.md }}
                labelStyle={TEXT_STYLES.button}
              >
                Start 💪
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={{ alignItems: 'center', padding: SPACING.xl, marginTop: SPACING.xl }}>
      <Icon name="fitness-center" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h2, { marginTop: SPACING.md, marginBottom: SPACING.sm }]}>
        No Active Workouts
      </Text>
      <Text style={[TEXT_STYLES.body1, { textAlign: 'center', color: COLORS.textSecondary }]}>
        Your assigned workouts will appear here. Check back later or contact your coach! 💪
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: StatusBar.currentHeight + SPACING.md, paddingBottom: SPACING.md }}
      >
        <View style={{ paddingHorizontal: SPACING.md }}>
          <Text style={[TEXT_STYLES.h1, { color: 'white', marginBottom: SPACING.sm }]}>
            Active Workouts 🔥
          </Text>
          <Text style={[TEXT_STYLES.body1, { color: 'rgba(255,255,255,0.9)', marginBottom: SPACING.md }]}>
            Keep up the momentum! {filteredWorkouts.length} sessions ready
          </Text>
          
          <Searchbar
            placeholder="Search workouts or coaches..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 25,
              marginBottom: SPACING.md,
            }}
            iconColor={COLORS.primary}
            placeholderTextColor={COLORS.textSecondary}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <Chip
                key={category.key}
                selected={selectedCategory === category.key}
                onPress={() => {
                  setSelectedCategory(category.key);
                  Vibration.vibrate(30);
                }}
                style={{
                  marginRight: SPACING.sm,
                  backgroundColor: selectedCategory === category.key
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(255,255,255,0.1)',
                }}
                textStyle={{
                  color: 'white',
                  fontWeight: selectedCategory === category.key ? 'bold' : 'normal',
                }}
                icon={() => (
                  <Icon
                    name={category.icon}
                    size={16}
                    color="white"
                  />
                )}
              >
                {category.label}
              </Chip>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: SPACING.md }}
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
        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout, index) => renderWorkoutCard(workout, index))
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

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
            'Feature Coming Soon',
            'Request custom workout feature is under development! 🚀',
            [{ text: 'OK' }]
          );
        }}
      />
    </View>
  );
};

export default ActiveWorkouts;

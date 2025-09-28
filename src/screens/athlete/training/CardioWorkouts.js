import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
  FlatList,
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
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const CardioWorkouts = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { workouts } = useSelector(state => state.training);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntensity, setSelectedIntensity] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [activeWorkoutId, setActiveWorkoutId] = useState(null);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock cardio workouts data
  const [cardioWorkouts, setCardioWorkouts] = useState([
    {
      id: '1',
      name: 'HIIT Burn 🔥',
      description: 'High-intensity interval training to maximize calorie burn',
      duration: 25,
      intensity: 'High',
      calories: 350,
      exercises: [
        { name: 'Burpees', duration: 45, rest: 15 },
        { name: 'Mountain Climbers', duration: 45, rest: 15 },
        { name: 'Jumping Jacks', duration: 45, rest: 15 },
        { name: 'High Knees', duration: 45, rest: 15 },
      ],
      difficulty: 'Advanced',
      equipment: 'None',
      category: 'HIIT',
      icon: 'whatshot',
      color: '#ff4757',
      completed: false,
    },
    {
      id: '2',
      name: 'Morning Cardio ☀️',
      description: 'Perfect start to your day with gentle cardio',
      duration: 15,
      intensity: 'Low',
      calories: 120,
      exercises: [
        { name: 'Light Jogging', duration: 300, rest: 0 },
        { name: 'Walking', duration: 300, rest: 0 },
        { name: 'Stretching', duration: 300, rest: 0 },
      ],
      difficulty: 'Beginner',
      equipment: 'None',
      category: 'Low Impact',
      icon: 'wb_sunny',
      color: '#ffa502',
      completed: true,
    },
    {
      id: '3',
      name: 'Endurance Builder 💪',
      description: 'Build cardiovascular endurance with steady-state training',
      duration: 35,
      intensity: 'Medium',
      calories: 280,
      exercises: [
        { name: 'Steady Jog', duration: 600, rest: 60 },
        { name: 'Cycling Motion', duration: 600, rest: 60 },
        { name: 'Step-ups', duration: 300, rest: 30 },
      ],
      difficulty: 'Intermediate',
      equipment: 'Step/Platform',
      category: 'Endurance',
      icon: 'fitness_center',
      color: '#3742fa',
      completed: false,
    },
    {
      id: '4',
      name: 'Dance Cardio 💃',
      description: 'Fun dance moves that get your heart pumping',
      duration: 30,
      intensity: 'Medium',
      calories: 250,
      exercises: [
        { name: 'Dance Freestyle', duration: 240, rest: 30 },
        { name: 'Cardio Dance', duration: 240, rest: 30 },
        { name: 'Cool Down Dance', duration: 180, rest: 0 },
      ],
      difficulty: 'Beginner',
      equipment: 'None',
      category: 'Dance',
      icon: 'music_note',
      color: '#ff6b9d',
      completed: false,
    },
    {
      id: '5',
      name: 'Sprint Intervals ⚡',
      description: 'Explosive sprint intervals for speed and power',
      duration: 20,
      intensity: 'High',
      calories: 320,
      exercises: [
        { name: 'Sprint', duration: 30, rest: 90 },
        { name: 'Recovery Jog', duration: 60, rest: 0 },
        { name: 'Sprint', duration: 30, rest: 90 },
      ],
      difficulty: 'Advanced',
      equipment: 'Track/Open Space',
      category: 'Intervals',
      icon: 'flash_on',
      color: '#ff3838',
      completed: false,
    },
    {
      id: '6',
      name: 'Fat Burn Zone 🎯',
      description: 'Moderate intensity for optimal fat burning',
      duration: 40,
      intensity: 'Medium',
      calories: 300,
      exercises: [
        { name: 'Brisk Walk', duration: 600, rest: 0 },
        { name: 'Light Cycling', duration: 600, rest: 120 },
        { name: 'Cool Down Walk', duration: 600, rest: 0 },
      ],
      difficulty: 'Beginner',
      equipment: 'None',
      category: 'Fat Burn',
      icon: 'track_changes',
      color: '#2ed573',
      completed: false,
    },
  ]);

  const intensityFilters = ['all', 'Low', 'Medium', 'High'];
  const durationFilters = ['all', '15min', '25min', '35min+'];

  useEffect(() => {
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
  }, [fadeAnim, slideAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const filterWorkouts = useCallback(() => {
    return cardioWorkouts.filter(workout => {
      const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          workout.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          workout.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesIntensity = selectedIntensity === 'all' || workout.intensity === selectedIntensity;
      
      let matchesDuration = true;
      if (selectedDuration !== 'all') {
        if (selectedDuration === '15min') matchesDuration = workout.duration <= 20;
        else if (selectedDuration === '25min') matchesDuration = workout.duration > 20 && workout.duration <= 30;
        else if (selectedDuration === '35min+') matchesDuration = workout.duration > 30;
      }
      
      return matchesSearch && matchesIntensity && matchesDuration;
    });
  }, [cardioWorkouts, searchQuery, selectedIntensity, selectedDuration]);

  const handleStartWorkout = (workout) => {
    Vibration.vibrate(50);
    setActiveWorkoutId(workout.id);
    
    Alert.alert(
      `Start ${workout.name}? 🚀`,
      `Duration: ${workout.duration} minutes\nIntensity: ${workout.intensity}\nCalories: ~${workout.calories}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Workout',
          onPress: () => {
            // Navigate to workout session screen
            navigation.navigate('WorkoutSession', { workout });
          },
        },
      ]
    );
  };

  const handleCompleteWorkout = (workoutId) => {
    setCompletedWorkouts(prev => [...prev, workoutId]);
    setCardioWorkouts(prev => 
      prev.map(workout => 
        workout.id === workoutId 
          ? { ...workout, completed: true }
          : workout
      )
    );
    Vibration.vibrate([100, 50, 100]);
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'Low': return '#2ed573';
      case 'Medium': return '#ffa502';
      case 'High': return '#ff4757';
      default: return COLORS.primary;
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'star';
      case 'Intermediate': return 'star-half';
      case 'Advanced': return 'stars';
      default: return 'star';
    }
  };

  const renderWorkoutCard = ({ item: workout }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.medium,
      }}
    >
      <Card style={{ marginHorizontal: SPACING.medium, elevation: 4 }}>
        <LinearGradient
          colors={[workout.color, workout.color + '80']}
          style={{
            padding: SPACING.medium,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: SPACING.small }]}>
                {workout.name}
              </Text>
              <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
                {workout.description}
              </Text>
            </View>
            <Avatar.Icon
              size={50}
              icon={workout.icon}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
          </View>
        </LinearGradient>

        <Card.Content style={{ padding: SPACING.medium }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.medium }}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="schedule" size={20} color={COLORS.text.secondary} />
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                {workout.duration} min
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="local_fire_department" size={20} color={COLORS.text.secondary} />
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                {workout.calories} cal
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name={getDifficultyIcon(workout.difficulty)} size={20} color={COLORS.text.secondary} />
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                {workout.difficulty}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="fitness_center" size={20} color={COLORS.text.secondary} />
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                {workout.equipment}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: SPACING.medium }}>
            <Chip
              mode="outlined"
              style={{ 
                marginRight: SPACING.small,
                backgroundColor: getIntensityColor(workout.intensity) + '20',
              }}
              textStyle={{ color: getIntensityColor(workout.intensity) }}
            >
              {workout.intensity} Intensity
            </Chip>
            <Chip
              mode="outlined"
              style={{ backgroundColor: COLORS.primary + '20' }}
              textStyle={{ color: COLORS.primary }}
            >
              {workout.category}
            </Chip>
          </View>

          {workout.completed && (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: SPACING.small,
              padding: SPACING.small,
              backgroundColor: COLORS.success + '20',
              borderRadius: 8,
            }}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <Text style={[TEXT_STYLES.body, { color: COLORS.success, marginLeft: SPACING.small }]}>
                Completed! Great job! 🎉
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('WorkoutDetails', { workout })}
              style={{ flex: 1, marginRight: SPACING.small }}
            >
              View Details
            </Button>
            <Button
              mode="contained"
              onPress={() => handleStartWorkout(workout)}
              style={{ 
                flex: 1,
                backgroundColor: workout.completed ? COLORS.success : workout.color,
              }}
              disabled={activeWorkoutId === workout.id}
              loading={activeWorkoutId === workout.id}
            >
              {workout.completed ? 'Repeat' : 'Start'}
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{ paddingTop: StatusBar.currentHeight + SPACING.large, paddingBottom: SPACING.large }}
    >
      <View style={{ paddingHorizontal: SPACING.large }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
              Cardio Workouts 💓
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
              Get your heart pumping with these cardio sessions
            </Text>
          </View>
          <IconButton
            icon="filter-list"
            iconColor="white"
            size={28}
            onPress={() => Alert.alert('Filters', 'Advanced filtering coming soon!')}
          />
        </View>

        <Searchbar
          placeholder="Search cardio workouts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ 
            marginTop: SPACING.medium,
            backgroundColor: 'rgba(255,255,255,0.9)',
            elevation: 0,
          }}
          iconColor={COLORS.primary}
          placeholderTextColor={COLORS.text.secondary}
        />
      </View>
    </LinearGradient>
  );

  const renderFilters = () => (
    <View style={{ paddingVertical: SPACING.medium }}>
      <Text style={[TEXT_STYLES.h4, { marginHorizontal: SPACING.large, marginBottom: SPACING.small }]}>
        Intensity Level
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.large }}
      >
        {intensityFilters.map((intensity) => (
          <Chip
            key={intensity}
            mode={selectedIntensity === intensity ? 'flat' : 'outlined'}
            selected={selectedIntensity === intensity}
            onPress={() => setSelectedIntensity(intensity)}
            style={{ 
              marginRight: SPACING.small,
              backgroundColor: selectedIntensity === intensity ? COLORS.primary : 'transparent',
            }}
            textStyle={{ 
              color: selectedIntensity === intensity ? 'white' : COLORS.text.primary 
            }}
          >
            {intensity === 'all' ? 'All Levels' : intensity}
          </Chip>
        ))}
      </ScrollView>

      <Text style={[TEXT_STYLES.h4, { marginHorizontal: SPACING.large, marginVertical: SPACING.small }]}>
        Duration
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.large }}
      >
        {durationFilters.map((duration) => (
          <Chip
            key={duration}
            mode={selectedDuration === duration ? 'flat' : 'outlined'}
            selected={selectedDuration === duration}
            onPress={() => setSelectedDuration(duration)}
            style={{ 
              marginRight: SPACING.small,
              backgroundColor: selectedDuration === duration ? COLORS.primary : 'transparent',
            }}
            textStyle={{ 
              color: selectedDuration === duration ? 'white' : COLORS.text.primary 
            }}
          >
            {duration === 'all' ? 'All Durations' : duration}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderStats = () => {
    const totalWorkouts = cardioWorkouts.length;
    const completedCount = cardioWorkouts.filter(w => w.completed).length;
    const completionRate = totalWorkouts > 0 ? completedCount / totalWorkouts : 0;

    return (
      <Surface style={{ 
        margin: SPACING.medium, 
        padding: SPACING.large, 
        borderRadius: 12, 
        elevation: 2 
      }}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.medium, textAlign: 'center' }]}>
          Your Progress 📈
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.medium }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
              {completedCount}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
              Completed
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.secondary }]}>
              {totalWorkouts - completedCount}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
              Remaining
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
              {Math.round(completionRate * 100)}%
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
              Complete
            </Text>
          </View>
        </View>

        <ProgressBar
          progress={completionRate}
          color={COLORS.primary}
          style={{ height: 8, borderRadius: 4 }}
        />
      </Surface>
    );
  };

  const filteredWorkouts = filterWorkouts();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <FlatList
        data={filteredWorkouts}
        renderItem={renderWorkoutCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <>
            {renderHeader()}
            {renderStats()}
            {renderFilters()}
            {filteredWorkouts.length === 0 && (
              <View style={{ 
                alignItems: 'center', 
                padding: SPACING.xxLarge,
                marginTop: SPACING.large 
              }}>
                <Icon name="search-off" size={64} color={COLORS.text.secondary} />
                <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.medium, textAlign: 'center' }]}>
                  No workouts found
                </Text>
                <Text style={[TEXT_STYLES.body, { 
                  color: COLORS.text.secondary, 
                  textAlign: 'center',
                  marginTop: SPACING.small 
                }]}>
                  Try adjusting your search or filters
                </Text>
              </View>
            )}
          </>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.background.secondary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.large,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Custom Workout', 'Create custom cardio workout coming soon! 🔥')}
      />
    </View>
  );
};

export default CardioWorkouts;
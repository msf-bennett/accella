import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  Alert,
  RefreshControl,
  StatusBar,
  Vibration,
  Animated,
  TouchableOpacity,
  Dimensions,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const WorkoutTracking = ({ navigation }) => {
  // State management
  const [activeWorkouts, setActiveWorkouts] = useState([]);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Redux
  const { user, workouts, clients } = useSelector(state => state.trainer);
  const dispatch = useDispatch();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for demonstration
  const mockWorkouts = [
    {
      id: 1,
      clientName: 'Sarah Johnson',
      clientAvatar: 'https://i.pravatar.cc/100?img=1',
      workoutType: 'Strength Training',
      duration: 45,
      progress: 75,
      status: 'active',
      startTime: '2024-01-15 09:00',
      exercises: 8,
      completedExercises: 6,
      heartRate: 142,
      calories: 320,
      notes: 'Great form on squats today!',
      difficulty: 'intermediate'
    },
    {
      id: 2,
      clientName: 'Mike Chen',
      clientAvatar: 'https://i.pravatar.cc/100?img=3',
      workoutType: 'HIIT Cardio',
      duration: 30,
      progress: 100,
      status: 'completed',
      startTime: '2024-01-15 07:30',
      endTime: '2024-01-15 08:00',
      exercises: 6,
      completedExercises: 6,
      heartRate: 165,
      calories: 285,
      rating: 5,
      difficulty: 'advanced'
    },
    {
      id: 3,
      clientName: 'Emma Davis',
      clientAvatar: 'https://i.pravatar.cc/100?img=5',
      workoutType: 'Yoga Flow',
      duration: 60,
      progress: 40,
      status: 'active',
      startTime: '2024-01-15 10:00',
      exercises: 12,
      completedExercises: 5,
      heartRate: 98,
      calories: 150,
      notes: 'Focus on breathing techniques',
      difficulty: 'beginner'
    }
  ];

  // Initialize component
  useEffect(() => {
    initializeData();
    animateEntrance();
  }, []);

  const initializeData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const active = mockWorkouts.filter(w => w.status === 'active');
      const completed = mockWorkouts.filter(w => w.status === 'completed');
      
      setActiveWorkouts(active);
      setCompletedWorkouts(completed);
      setLoading(false);
    } catch (error) {
      console.error('Error loading workouts:', error);
      setLoading(false);
    }
  };

  const animateEntrance = () => {
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
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    await initializeData();
    setRefreshing(false);
  }, []);

  const handleWorkoutAction = (workoutId, action) => {
    Vibration.vibrate([50, 100, 50]);
    
    switch (action) {
      case 'view':
        navigation.navigate('WorkoutDetails', { workoutId });
        break;
      case 'pause':
        Alert.alert(
          'Pause Workout',
          'Are you sure you want to pause this workout?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Pause', onPress: () => pauseWorkout(workoutId) }
          ]
        );
        break;
      case 'complete':
        completeWorkout(workoutId);
        break;
      case 'message':
        Alert.alert('Feature Coming Soon', 'Direct messaging feature is under development! 💬');
        break;
      default:
        break;
    }
  };

  const pauseWorkout = (workoutId) => {
    // Implementation for pausing workout
    Alert.alert('Success', 'Workout paused successfully! ⏸️');
  };

  const completeWorkout = (workoutId) => {
    // Implementation for completing workout
    Alert.alert('Congratulations!', 'Workout completed! Great job! 🎉');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return '#FF9500';
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? 'play-circle-filled' : 'check-circle';
  };

  const renderWorkoutCard = (workout) => (
    <Animated.View
      key={workout.id}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.medium,
      }}
    >
      <Card style={{ marginHorizontal: SPACING.medium }}>
        <LinearGradient
          colors={workout.status === 'active' ? ['#667eea', '#764ba2'] : ['#43a047', '#66bb6a']}
          style={{
            padding: SPACING.medium,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar.Image
                size={40}
                source={{ uri: workout.clientAvatar }}
                style={{ marginRight: SPACING.small }}
              />
              <View>
                <Text style={[TEXT_STYLES.subheading, { color: 'white', fontWeight: 'bold' }]}>
                  {workout.clientName}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
                  {workout.workoutType} • {workout.duration}min
                </Text>
              </View>
            </View>
            <Icon
              name={getStatusIcon(workout.status)}
              size={28}
              color="white"
            />
          </View>
        </LinearGradient>

        <Card.Content style={{ paddingTop: SPACING.medium }}>
          <View style={{ marginBottom: SPACING.small }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={TEXT_STYLES.caption}>Progress</Text>
              <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>
                {workout.completedExercises}/{workout.exercises} exercises
              </Text>
            </View>
            <ProgressBar
              progress={workout.progress / 100}
              color={COLORS.primary}
              style={{ height: 6, borderRadius: 3 }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.small }}>
            <Surface style={{ 
              padding: SPACING.small, 
              borderRadius: 8, 
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              flex: 1,
              marginRight: SPACING.xsmall
            }}>
              <View style={{ alignItems: 'center' }}>
                <Icon name="favorite" size={16} color={COLORS.error} />
                <Text style={[TEXT_STYLES.caption, { marginTop: 2 }]}>
                  {workout.heartRate} BPM
                </Text>
              </View>
            </Surface>
            
            <Surface style={{ 
              padding: SPACING.small, 
              borderRadius: 8, 
              backgroundColor: 'rgba(255, 149, 0, 0.1)',
              flex: 1,
              marginLeft: SPACING.xsmall
            }}>
              <View style={{ alignItems: 'center' }}>
                <Icon name="local-fire-department" size={16} color="#FF9500" />
                <Text style={[TEXT_STYLES.caption, { marginTop: 2 }]}>
                  {workout.calories} cal
                </Text>
              </View>
            </Surface>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small }}>
            <Chip
              mode="outlined"
              textStyle={{ fontSize: 12 }}
              style={{ 
                marginRight: SPACING.small,
                borderColor: getDifficultyColor(workout.difficulty),
                backgroundColor: `${getDifficultyColor(workout.difficulty)}20`
              }}
            >
              {workout.difficulty.toUpperCase()}
            </Chip>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Started: {new Date(workout.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {workout.notes && (
            <Text style={[TEXT_STYLES.caption, { 
              fontStyle: 'italic', 
              color: COLORS.textSecondary,
              marginBottom: SPACING.small 
            }]}>
              💭 {workout.notes}
            </Text>
          )}

          {workout.status === 'completed' && workout.rating && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small }}>
              <Text style={[TEXT_STYLES.caption, { marginRight: SPACING.xsmall }]}>Client Rating:</Text>
              {[...Array(workout.rating)].map((_, i) => (
                <Icon key={i} name="star" size={16} color="#FFD700" />
              ))}
            </View>
          )}
        </Card.Content>

        <Card.Actions style={{ paddingHorizontal: SPACING.medium, paddingBottom: SPACING.medium }}>
          <Button
            mode="outlined"
            onPress={() => handleWorkoutAction(workout.id, 'view')}
            icon="visibility"
            style={{ marginRight: SPACING.small }}
          >
            View Details
          </Button>
          
          {workout.status === 'active' ? (
            <>
              <Button
                mode="contained"
                onPress={() => handleWorkoutAction(workout.id, 'pause')}
                icon="pause"
                buttonColor="#FF9500"
                style={{ marginRight: SPACING.small }}
              >
                Pause
              </Button>
              <IconButton
                icon="message"
                size={20}
                onPress={() => handleWorkoutAction(workout.id, 'message')}
              />
            </>
          ) : (
            <Button
              mode="contained"
              onPress={() => handleWorkoutAction(workout.id, 'view')}
              icon="assessment"
              buttonColor={COLORS.success}
            >
              View Report
            </Button>
          )}
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderFilterModal = () => (
    <Portal>
      <BlurView intensity={80} style={{ flex: 1 }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)'
        }}>
          <Surface style={{
            width: width * 0.85,
            padding: SPACING.large,
            borderRadius: 16,
            elevation: 8,
          }}>
            <Text style={[TEXT_STYLES.heading, { textAlign: 'center', marginBottom: SPACING.large }]}>
              Filter Workouts 🏋️
            </Text>
            
            {['all', 'active', 'completed', 'paused'].map(filter => (
              <TouchableOpacity
                key={filter}
                onPress={() => {
                  setSelectedFilter(filter);
                  setShowFilters(false);
                  Vibration.vibrate(50);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: SPACING.medium,
                  paddingHorizontal: SPACING.small,
                  backgroundColor: selectedFilter === filter ? COLORS.primary + '20' : 'transparent',
                  borderRadius: 8,
                  marginBottom: SPACING.small,
                }}
              >
                <Icon
                  name={selectedFilter === filter ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={24}
                  color={selectedFilter === filter ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={[
                  TEXT_STYLES.body,
                  { 
                    marginLeft: SPACING.small,
                    color: selectedFilter === filter ? COLORS.primary : COLORS.text,
                    fontWeight: selectedFilter === filter ? 'bold' : 'normal'
                  }
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)} Workouts
                </Text>
              </TouchableOpacity>
            ))}
            
            <Button
              mode="outlined"
              onPress={() => setShowFilters(false)}
              style={{ marginTop: SPACING.medium }}
            >
              Close
            </Button>
          </Surface>
        </View>
      </BlurView>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.large,
      paddingVertical: SPACING.xlarge,
    }}>
      <Icon name="fitness-center" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.heading, { 
        textAlign: 'center', 
        marginTop: SPACING.large,
        color: COLORS.textSecondary 
      }]}>
        No Workouts Found
      </Text>
      <Text style={[TEXT_STYLES.body, { 
        textAlign: 'center', 
        marginTop: SPACING.small,
        color: COLORS.textSecondary 
      }]}>
        Your clients haven't started any workouts yet. Time to motivate them! 💪
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <LinearGradient colors={['#667eea', '#764ba2']} style={{ height: 100 }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="fitness-center" size={60} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.subheading, { marginTop: SPACING.medium }]}>
            Loading Workouts...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={{
        paddingTop: 50,
        paddingBottom: SPACING.large,
        paddingHorizontal: SPACING.medium,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[TEXT_STYLES.heading, { color: 'white', fontWeight: 'bold' }]}>
              Workout Tracking 🏋️
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
              Monitor your clients' progress in real-time
            </Text>
          </View>
          <IconButton
            icon="filter-list"
            size={28}
            iconColor="white"
            onPress={() => setShowFilters(true)}
          />
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: SPACING.medium, paddingVertical: SPACING.small }}>
        <Searchbar
          placeholder="Search workouts or clients..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          icon="search"
          style={{ elevation: 2 }}
        />
      </View>

      {/* Stats Summary */}
      <View style={{ 
        flexDirection: 'row', 
        paddingHorizontal: SPACING.medium,
        marginBottom: SPACING.small 
      }}>
        <Surface style={{
          flex: 1,
          padding: SPACING.medium,
          borderRadius: 12,
          marginRight: SPACING.small,
          backgroundColor: 'rgba(102, 126, 234, 0.1)'
        }}>
          <Text style={[TEXT_STYLES.heading, { color: COLORS.primary, textAlign: 'center' }]}>
            {activeWorkouts.length}
          </Text>
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
            Active Now
          </Text>
        </Surface>
        
        <Surface style={{
          flex: 1,
          padding: SPACING.medium,
          borderRadius: 12,
          marginLeft: SPACING.small,
          backgroundColor: 'rgba(67, 160, 71, 0.1)'
        }}>
          <Text style={[TEXT_STYLES.heading, { color: COLORS.success, textAlign: 'center' }]}>
            {completedWorkouts.length}
          </Text>
          <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
            Completed
          </Text>
        </Surface>
      </View>

      {/* Workout List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        style={{ flex: 1 }}
      >
        {/* Active Workouts */}
        {activeWorkouts.length > 0 && (
          <>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              paddingHorizontal: SPACING.medium,
              marginTop: SPACING.medium,
              marginBottom: SPACING.small 
            }}>
              <Icon name="play-circle-filled" size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.subheading, { 
                marginLeft: SPACING.small,
                fontWeight: 'bold',
                color: COLORS.primary 
              }]}>
                Active Workouts ({activeWorkouts.length})
              </Text>
            </View>
            {activeWorkouts.map(renderWorkoutCard)}
          </>
        )}

        {/* Completed Workouts */}
        {completedWorkouts.length > 0 && (
          <>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              paddingHorizontal: SPACING.medium,
              marginTop: SPACING.large,
              marginBottom: SPACING.small 
            }}>
              <Icon name="check-circle" size={24} color={COLORS.success} />
              <Text style={[TEXT_STYLES.subheading, { 
                marginLeft: SPACING.small,
                fontWeight: 'bold',
                color: COLORS.success 
              }]}>
                Completed Today ({completedWorkouts.length})
              </Text>
            </View>
            {completedWorkouts.map(renderWorkoutCard)}
          </>
        )}

        {/* Empty State */}
        {activeWorkouts.length === 0 && completedWorkouts.length === 0 && renderEmptyState()}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          right: SPACING.medium,
          bottom: SPACING.large,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Feature Coming Soon', 'Quick workout assignment feature is under development! 🚀')}
      />

      {/* Filter Modal */}
      {showFilters && renderFilterModal()}
    </View>
  );
};

export default WorkoutTracking;
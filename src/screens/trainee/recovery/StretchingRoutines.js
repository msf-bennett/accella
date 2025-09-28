import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Vibration,
  FlatList,
} from 'react-native';
import {
  Card,
  Button,
  ProgressBar,
  Avatar,
  Surface,
  Portal,
  Modal,
  Chip,
  IconButton,
  FAB,
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const StretchingRoutines = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { stretchingData, loading } = useSelector(state => state.recovery);

  // State management
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [currentStretch, setCurrentStretch] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRoutineActive, setIsRoutineActive] = useState(false);
  const [completedStretches, setCompletedStretches] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteRoutines, setFavoriteRoutines] = useState(new Set());
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const timerRef = useRef(null);

  // Stretching routine categories
  const categories = [
    { id: 'all', label: 'All', icon: 'grid-view' },
    { id: 'morning', label: 'Morning', icon: 'wb-sunny' },
    { id: 'post-workout', label: 'Post-Workout', icon: 'fitness-center' },
    { id: 'evening', label: 'Evening', icon: 'bedtime' },
    { id: 'recovery', label: 'Recovery', icon: 'healing' },
    { id: 'mobility', label: 'Mobility', icon: 'accessibility' }
  ];

  // Sample stretching routines data
  const stretchingRoutines = [
    {
      id: '1',
      title: 'Morning Mobility Flow',
      category: 'morning',
      duration: 10,
      difficulty: 'Beginner',
      calories: 25,
      description: 'Gentle stretches to wake up your body',
      thumbnail: '🌅',
      rating: 4.8,
      completions: 1234,
      stretches: [
        { id: 's1', name: 'Cat-Cow Stretch', duration: 60, instructions: 'Move slowly between cat and cow positions', targetMuscles: ['spine', 'core'] },
        { id: 's2', name: 'Neck Rolls', duration: 30, instructions: 'Gently roll your neck in circles', targetMuscles: ['neck'] },
        { id: 's3', name: 'Arm Circles', duration: 45, instructions: 'Make large circles with your arms', targetMuscles: ['shoulders'] },
        { id: 's4', name: 'Hip Circles', duration: 45, instructions: 'Circle your hips slowly', targetMuscles: ['hips'] },
        { id: 's5', name: 'Ankle Pumps', duration: 30, instructions: 'Flex and point your feet', targetMuscles: ['calves', 'ankles'] }
      ]
    },
    {
      id: '2',
      title: 'Post-Workout Recovery',
      category: 'post-workout',
      duration: 15,
      difficulty: 'Intermediate',
      calories: 35,
      description: 'Essential stretches after training',
      thumbnail: '💪',
      rating: 4.9,
      completions: 2156,
      stretches: [
        { id: 's6', name: 'Hamstring Stretch', duration: 90, instructions: 'Hold gentle stretch in hamstrings', targetMuscles: ['hamstrings'] },
        { id: 's7', name: 'Quad Stretch', duration: 60, instructions: 'Pull heel towards glutes', targetMuscles: ['quadriceps'] },
        { id: 's8', name: 'Calf Stretch', duration: 60, instructions: 'Push against wall, heel down', targetMuscles: ['calves'] },
        { id: 's9', name: 'Hip Flexor Stretch', duration: 90, instructions: 'Lunge position, push hips forward', targetMuscles: ['hip flexors'] },
        { id: 's10', name: 'Shoulder Stretch', duration: 45, instructions: 'Cross arm over chest', targetMuscles: ['shoulders'] }
      ]
    },
    {
      id: '3',
      title: 'Deep Recovery Session',
      category: 'recovery',
      duration: 20,
      difficulty: 'Advanced',
      calories: 45,
      description: 'Intensive recovery for sore muscles',
      thumbnail: '🧘‍♀️',
      rating: 4.7,
      completions: 987,
      stretches: [
        { id: 's11', name: 'Pigeon Pose', duration: 120, instructions: 'Deep hip opener, breathe deeply', targetMuscles: ['hips', 'glutes'] },
        { id: 's12', name: 'Spinal Twist', duration: 90, instructions: 'Gentle rotation of the spine', targetMuscles: ['spine', 'core'] },
        { id: 's13', name: 'Figure-4 Stretch', duration: 90, instructions: 'Ankle on opposite knee', targetMuscles: ['glutes', 'hips'] },
        { id: 's14', name: 'Cobra Stretch', duration: 60, instructions: 'Gentle backbend', targetMuscles: ['chest', 'spine'] }
      ]
    },
    {
      id: '4',
      title: 'Evening Wind Down',
      category: 'evening',
      duration: 12,
      difficulty: 'Beginner',
      calories: 30,
      description: 'Relaxing stretches before bed',
      thumbnail: '🌙',
      rating: 4.6,
      completions: 1567,
      stretches: [
        { id: 's15', name: 'Child\'s Pose', duration: 90, instructions: 'Relax and breathe deeply', targetMuscles: ['back', 'shoulders'] },
        { id: 's16', name: 'Legs Up Wall', duration: 120, instructions: 'Lie with legs against wall', targetMuscles: ['legs', 'back'] },
        { id: 's17', name: 'Gentle Neck Stretch', duration: 60, instructions: 'Slow, gentle movements', targetMuscles: ['neck'] }
      ]
    }
  ];

  // Animation setup
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Timer management
  useEffect(() => {
    if (isRoutineActive && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0 && isRoutineActive) {
      handleStretchComplete();
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timer, isRoutineActive]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch action to refresh stretching data
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh data');
    }
  }, [dispatch]);

  // Start routine
  const startRoutine = useCallback((routine) => {
    setActiveRoutine(routine);
    setCurrentStretch(0);
    setTimer(routine.stretches[0].duration);
    setIsRoutineActive(true);
    setCompletedStretches(new Set());
    setShowRoutineModal(true);
    Vibration.vibrate(100);
  }, []);

  // Handle stretch completion
  const handleStretchComplete = useCallback(() => {
    if (!activeRoutine) return;

    const currentStretchId = activeRoutine.stretches[currentStretch].id;
    setCompletedStretches(prev => new Set(prev).add(currentStretchId));
    
    if (currentStretch < activeRoutine.stretches.length - 1) {
      setCurrentStretch(prev => prev + 1);
      setTimer(activeRoutine.stretches[currentStretch + 1].duration);
      Vibration.vibrate([100, 50, 100]);
    } else {
      // Routine completed
      setIsRoutineActive(false);
      Alert.alert(
        '🎉 Routine Complete!',
        `Great job! You completed the ${activeRoutine.title} routine.`,
        [
          { text: 'Done', onPress: () => setShowRoutineModal(false) }
        ]
      );
    }
  }, [activeRoutine, currentStretch]);

  // Skip current stretch
  const skipStretch = useCallback(() => {
    handleStretchComplete();
  }, [handleStretchComplete]);

  // Pause/Resume routine
  const toggleRoutine = useCallback(() => {
    setIsRoutineActive(prev => !prev);
    Vibration.vibrate(50);
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((routineId) => {
    setFavoriteRoutines(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(routineId)) {
        newFavorites.delete(routineId);
      } else {
        newFavorites.add(routineId);
      }
      return newFavorites;
    });
    Vibration.vibrate(30);
  }, []);

  // Filter routines
  const filteredRoutines = stretchingRoutines.filter(routine => {
    const matchesSearch = routine.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         routine.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || routine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render routine card
  const renderRoutineCard = ({ item }) => (
    <Card style={styles.routineCard}>
      <TouchableOpacity 
        onPress={() => startRoutine(item)}
        style={styles.routineContent}
      >
        <View style={styles.routineHeader}>
          <View style={styles.routineThumbnail}>
            <Text style={styles.thumbnailEmoji}>{item.thumbnail}</Text>
          </View>
          <View style={styles.routineInfo}>
            <Text style={styles.routineTitle}>{item.title}</Text>
            <Text style={styles.routineDescription}>{item.description}</Text>
            <View style={styles.routineMeta}>
              <View style={styles.metaItem}>
                <Icon name="schedule" size={16} color="#666" />
                <Text style={styles.metaText}>{item.duration} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="local-fire-department" size={16} color="#666" />
                <Text style={styles.metaText}>{item.calories} cal</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.metaText}>{item.rating}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item.id)}
          >
            <Icon 
              name={favoriteRoutines.has(item.id) ? "favorite" : "favorite-border"} 
              size={24} 
              color={favoriteRoutines.has(item.id) ? COLORS.error : "#666"} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.difficultyBadge}>
          <Chip 
            mode="outlined" 
            compact
            textStyle={styles.chipText}
          >
            {item.difficulty}
          </Chip>
          <Text style={styles.completionsText}>
            {item.completions.toLocaleString()} completions
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
  );

  // Render active routine modal
  const renderActiveRoutineModal = () => {
    if (!activeRoutine) return null;

    const currentStretchData = activeRoutine.stretches[currentStretch];
    const progress = (currentStretch + 1) / activeRoutine.stretches.length;

    return (
      <Portal>
        <Modal
          visible={showRoutineModal}
          onDismiss={() => {
            setShowRoutineModal(false);
            setIsRoutineActive(false);
          }}
          contentContainerStyle={styles.routineModalContainer}
        >
          <BlurView
            style={styles.routineBlurView}
            blurType="light"
            blurAmount={10}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.routineModalHeader}
            >
              <Text style={styles.routineModalTitle}>{activeRoutine.title}</Text>
              <ProgressBar 
                progress={progress} 
                color={COLORS.background}
                style={styles.routineProgress}
              />
            </LinearGradient>

            <View style={styles.currentStretchContainer}>
              <Text style={styles.currentStretchTitle}>
                {currentStretchData?.name}
              </Text>
              <Text style={styles.currentStretchInstructions}>
                {currentStretchData?.instructions}
              </Text>
              
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{formatTime(timer)}</Text>
                <Text style={styles.timerLabel}>
                  Stretch {currentStretch + 1} of {activeRoutine.stretches.length}
                </Text>
              </View>

              <View style={styles.targetMuscles}>
                <Text style={styles.targetMusclesTitle}>Target Muscles:</Text>
                <View style={styles.muscleChips}>
                  {currentStretchData?.targetMuscles.map((muscle, index) => (
                    <Chip key={index} compact style={styles.muscleChip}>
                      {muscle}
                    </Chip>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.routineControls}>
              <IconButton
                icon="skip-next"
                size={30}
                onPress={skipStretch}
                iconColor="#666"
              />
              <TouchableOpacity
                style={styles.playPauseButton}
                onPress={toggleRoutine}
              >
                <Icon 
                  name={isRoutineActive ? "pause" : "play-arrow"} 
                  size={40} 
                  color={COLORS.background} 
                />
              </TouchableOpacity>
              <IconButton
                icon="close"
                size={30}
                onPress={() => {
                  setShowRoutineModal(false);
                  setIsRoutineActive(false);
                }}
                iconColor="#666"
              />
            </View>
          </BlurView>
        </Modal>
      </Portal>
    );
  };

  // Render stats section
  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Surface style={styles.statCard}>
        <Text style={styles.statValue}>12</Text>
        <Text style={styles.statLabel}>Completed Today</Text>
        <Text style={styles.statEmoji}>🎯</Text>
      </Surface>
      
      <Surface style={styles.statCard}>
        <Text style={styles.statValue}>45</Text>
        <Text style={styles.statLabel}>Total Minutes</Text>
        <Text style={styles.statEmoji}>⏰</Text>
      </Surface>
      
      <Surface style={styles.statCard}>
        <Text style={styles.statValue}>7</Text>
        <Text style={styles.statLabel}>Day Streak</Text>
        <Text style={styles.statEmoji}>🔥</Text>
      </Surface>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="light-content" 
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Stretching Routines</Text>
        <Text style={styles.headerSubtitle}>
          Improve flexibility and aid recovery 🤸‍♀️
        </Text>
      </LinearGradient>

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
        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
            }
          ]}
        >
          {renderStats()}

          <Searchbar
            placeholder="Search routines..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={styles.searchInput}
          />

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Icon 
                  name={category.icon} 
                  size={20} 
                  color={selectedCategory === category.id ? COLORS.background : COLORS.primary}
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredRoutines}
            renderItem={renderRoutineCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.routinesList}
          />

          <Card style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Stretching Tips</Text>
            <Text style={styles.tipItem}>• Hold stretches for 15-30 seconds</Text>
            <Text style={styles.tipItem}>• Breathe deeply and never force a stretch</Text>
            <Text style={styles.tipItem}>• Stretch when muscles are warm</Text>
            <Text style={styles.tipItem}>• Listen to your body and stop if it hurts</Text>
          </Card>
        </Animated.View>
      </ScrollView>

      {renderActiveRoutineModal()}
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
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.background,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.background + 'CC',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    textAlign: 'center',
  },
  statEmoji: {
    fontSize: 20,
    marginTop: SPACING.xs,
  },
  searchBar: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: 25,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoriesContainer: {
    marginBottom: SPACING.lg,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    color: COLORS.primary,
  },
  categoryTextActive: {
    color: COLORS.background,
  },
  routinesList: {
    gap: SPACING.md,
  },
  routineCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  routineContent: {
    padding: SPACING.md,
  },
  routineHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  routineThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  thumbnailEmoji: {
    fontSize: 24,
  },
  routineInfo: {
    flex: 1,
  },
  routineTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.xs,
  },
  routineDescription: {
    ...TEXT_STYLES.body,
    color: '#666',
    marginBottom: SPACING.sm,
  },
  routineMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: '#666',
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  difficultyBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
  },
  completionsText: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  routineModalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  routineBlurView: {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    maxHeight: '80%',
  },
  routineModalHeader: {
    padding: SPACING.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  routineModalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.background,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  routineProgress: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  currentStretchContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  currentStretchTitle: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  currentStretchInstructions: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: '#666',
    marginBottom: SPACING.lg,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  timerLabel: {
    ...TEXT_STYLES.body,
    color: '#666',
  },
  targetMuscles: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  targetMusclesTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.sm,
  },
  muscleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  muscleChip: {
    backgroundColor: COLORS.primary + '20',
  },
  routineControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsCard: {
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderRadius: 16,
  },
  tipsTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  tipItem: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
    color: '#666',
  },
});

export default StretchingRoutines;

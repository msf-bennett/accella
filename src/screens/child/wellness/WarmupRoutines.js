import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
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
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  background: '#f5f7fa',
  white: '#ffffff',
  text: '#2c3e50',
  lightText: '#7f8c8d',
  accent: '#ff6b6b',
  warning: '#ff9800',
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
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 14, color: COLORS.lightText },
};

const { width } = Dimensions.get('window');

const WarmupRoutines = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, warmupData } = useSelector(state => ({
    user: state.auth.user,
    warmupData: state.wellness.warmupRoutines,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [completedToday, setCompletedToday] = useState([]);
  const [streakCount, setStreakCount] = useState(7);
  const [totalPoints, setTotalPoints] = useState(450);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  // Sample warmup routines data
  const warmupRoutines = [
    {
      id: 1,
      title: 'Morning Energy Boost',
      duration: '5 mins',
      difficulty: 'Easy',
      category: 'Morning',
      exercises: 8,
      icon: '🌅',
      color: '#ff6b6b',
      description: 'Perfect way to start your day with gentle movements',
      points: 25,
      exercises_list: ['Arm Circles', 'Leg Swings', 'Neck Rolls', 'Gentle Stretches']
    },
    {
      id: 2,
      title: 'Soccer Prep',
      duration: '10 mins',
      difficulty: 'Medium',
      category: 'Sports',
      exercises: 12,
      icon: '⚽',
      color: '#4ecdc4',
      description: 'Get ready for football practice with dynamic movements',
      points: 40,
      exercises_list: ['High Knees', 'Butt Kicks', 'Lunges', 'Dynamic Stretches']
    },
    {
      id: 3,
      title: 'Basketball Ready',
      duration: '8 mins',
      difficulty: 'Medium',
      category: 'Sports',
      exercises: 10,
      icon: '🏀',
      color: '#45b7d1',
      description: 'Dynamic warmup for basketball training sessions',
      points: 35,
      exercises_list: ['Jump Squats', 'Arm Swings', 'Side Steps', 'Calf Raises']
    },
    {
      id: 4,
      title: 'Quick Energizer',
      duration: '3 mins',
      difficulty: 'Easy',
      category: 'Quick',
      exercises: 5,
      icon: '⚡',
      color: '#f7b731',
      description: 'Fast energy boost between activities',
      points: 15,
      exercises_list: ['Jumping Jacks', 'Arm Reaches', 'Marching']
    },
    {
      id: 5,
      title: 'Evening Wind Down',
      duration: '7 mins',
      difficulty: 'Easy',
      category: 'Evening',
      exercises: 6,
      icon: '🌙',
      color: '#a55eea',
      description: 'Gentle movements to relax before bedtime',
      points: 30,
      exercises_list: ['Gentle Twists', 'Forward Bends', 'Deep Breathing']
    },
    {
      id: 6,
      title: 'Swimming Prep',
      duration: '6 mins',
      difficulty: 'Easy',
      category: 'Sports',
      exercises: 8,
      icon: '🏊',
      color: '#26d0ce',
      description: 'Prepare your shoulders and core for swimming',
      points: 25,
      exercises_list: ['Shoulder Rolls', 'Arm Stretches', 'Core Twists']
    }
  ];

  const categories = ['All', 'Morning', 'Sports', 'Quick', 'Evening'];

  const achievements = [
    { id: 1, title: 'Warmup Warrior', description: '7 day streak!', icon: '🔥', earned: true },
    { id: 2, title: 'Early Bird', description: 'Morning routines', icon: '🐦', earned: true },
    { id: 3, title: 'Sports Star', description: 'Sports warmups', icon: '⭐', earned: false },
    { id: 4, title: 'Consistency King', description: '30 day streak', icon: '👑', earned: false },
  ];

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
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const filteredRoutines = warmupRoutines.filter(routine => {
    const matchesSearch = routine.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         routine.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || routine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartRoutine = (routine) => {
    Vibration.vibrate(100);
    Alert.alert(
      `Start ${routine.title}? 🏃‍♂️`,
      `Ready for a ${routine.duration} warmup session? You'll earn ${routine.points} points!`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        {
          text: 'Let\'s Go!',
          onPress: () => {
            // Navigate to routine execution screen
            Alert.alert('Feature Coming Soon! 🚧', 'Routine execution screen is in development');
            // navigation.navigate('RoutineExecution', { routine });
          }
        }
      ]
    );
  };

  const handleCompleteRoutine = (routineId) => {
    setCompletedToday(prev => [...prev, routineId]);
    setTotalPoints(prev => prev + 25);
    Vibration.vibrate([100, 50, 100]);
    Alert.alert('Great Job! 🎉', 'Routine completed! +25 points earned');
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Hey {user?.firstName || 'Champion'}! 👋</Text>
            <Text style={styles.motivationText}>Time to warm up and shine! ✨</Text>
          </View>
          <View style={styles.pointsContainer}>
            <Icon name="stars" size={20} color={COLORS.warning} />
            <Text style={styles.pointsText}>{totalPoints}</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{streakCount}</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>{completedToday.length}</Text>
            <Text style={styles.statLabel}>Today's Goal 🎯</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statNumber}>Level 3</Text>
            <Text style={styles.statLabel}>Warmup Pro 💪</Text>
          </Surface>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchAndCategories = () => (
    <View style={styles.searchSection}>
      <Searchbar
        placeholder="Search warmup routines..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedCategoryChip
            ]}
            textStyle={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
            ]}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.achievementsSection}>
      <Text style={styles.sectionTitle}>Your Achievements 🏆</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.achievementsContainer}>
          {achievements.map((achievement) => (
            <Surface key={achievement.id} style={[
              styles.achievementCard,
              !achievement.earned && styles.lockedAchievement
            ]}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <Text style={[styles.achievementTitle, !achievement.earned && styles.lockedText]}>
                {achievement.title}
              </Text>
              <Text style={[styles.achievementDesc, !achievement.earned && styles.lockedText]}>
                {achievement.description}
              </Text>
            </Surface>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderRoutineCard = (routine) => {
    const isCompleted = completedToday.includes(routine.id);
    
    return (
      <Animated.View
        key={routine.id}
        style={[
          styles.routineCardWrapper,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Card style={styles.routineCard}>
          <LinearGradient
            colors={[routine.color, routine.color + '80']}
            style={styles.routineCardHeader}
          >
            <View style={styles.routineHeaderContent}>
              <View>
                <Text style={styles.routineIcon}>{routine.icon}</Text>
                <Text style={styles.routineTitle}>{routine.title}</Text>
              </View>
              <View style={styles.routineStats}>
                <Chip style={styles.difficultyChip} textStyle={styles.chipText}>
                  {routine.difficulty}
                </Chip>
                {isCompleted && (
                  <Icon name="check-circle" size={24} color={COLORS.success} />
                )}
              </View>
            </View>
          </LinearGradient>
          
          <Card.Content style={styles.routineContent}>
            <Text style={styles.routineDescription}>{routine.description}</Text>
            
            <View style={styles.routineDetails}>
              <View style={styles.detailItem}>
                <Icon name="timer" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>{routine.duration}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="fitness-center" size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>{routine.exercises} exercises</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="stars" size={16} color={COLORS.warning} />
                <Text style={styles.detailText}>{routine.points} points</Text>
              </View>
            </View>
            
            <View style={styles.exercisePreview}>
              <Text style={styles.exercisePreviewTitle}>Includes:</Text>
              <Text style={styles.exerciseList}>
                {routine.exercises_list.join(' • ')}
              </Text>
            </View>
          </Card.Content>
          
          <Card.Actions style={styles.routineActions}>
            {isCompleted ? (
              <Button
                mode="contained"
                disabled
                style={styles.completedButton}
                labelStyle={styles.buttonText}
              >
                Completed Today! ✅
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={() => handleStartRoutine(routine)}
                style={styles.startButton}
                labelStyle={styles.buttonText}
                icon="play-arrow"
              >
                Start Warmup
              </Button>
            )}
          </Card.Actions>
        </Card>
      </Animated.View>
    );
  };

  const renderProgressSection = () => (
    <Surface style={styles.progressSection}>
      <Text style={styles.sectionTitle}>Today's Progress 📊</Text>
      <View style={styles.progressContent}>
        <Text style={styles.progressLabel}>
          Daily Goal: {completedToday.length}/3 routines completed
        </Text>
        <ProgressBar
          progress={completedToday.length / 3}
          color={COLORS.success}
          style={styles.progressBar}
        />
        <Text style={styles.progressMotivation}>
          {completedToday.length === 0 && "Let's get started! 💪"}
          {completedToday.length === 1 && "Great start! Keep it up! 🌟"}
          {completedToday.length === 2 && "Almost there! One more to go! 🚀"}
          {completedToday.length >= 3 && "Goal achieved! You're amazing! 🎉"}
        </Text>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <ScrollView
        style={styles.scrollView}
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
        {renderHeader()}
        {renderSearchAndCategories()}
        {renderProgressSection()}
        {renderAchievements()}
        
        <View style={styles.routinesSection}>
          <Text style={styles.sectionTitle}>
            Warmup Routines {filteredRoutines.length > 0 && `(${filteredRoutines.length})`}
          </Text>
          
          {filteredRoutines.length === 0 ? (
            <Surface style={styles.emptyState}>
              <Icon name="search-off" size={48} color={COLORS.lightText} />
              <Text style={styles.emptyStateText}>No routines found</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your search or category filter</Text>
            </Surface>
          ) : (
            filteredRoutines.map(renderRoutineCard)
          )}
        </View>
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Custom routine builder is in development')}
        label="Create Custom"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  motivationText: {
    ...TEXT_STYLES.body,
    color: COLORS.white + 'E6',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  pointsText: {
    ...TEXT_STYLES.h3,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.white + '15',
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.white + 'CC',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  searchSection: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  searchbar: {
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryContainer: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  categoryChip: {
    backgroundColor: COLORS.white,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.text,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  progressSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
    elevation: 2,
  },
  progressContent: {
    gap: SPACING.sm,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.background,
  },
  progressMotivation: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  achievementsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  achievementsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  achievementCard: {
    width: 120,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    gap: SPACING.xs,
    elevation: 2,
  },
  lockedAchievement: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  achievementDesc: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    textAlign: 'center',
  },
  lockedText: {
    color: COLORS.lightText,
  },
  routinesSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100, // Space for FAB
  },
  routineCardWrapper: {
    marginBottom: SPACING.lg,
  },
  routineCard: {
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  routineCardHeader: {
    padding: SPACING.lg,
  },
  routineHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routineIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  routineTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.white,
  },
  routineStats: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  difficultyChip: {
    backgroundColor: COLORS.white + '20',
  },
  chipText: {
    color: COLORS.white,
    fontSize: 12,
  },
  routineContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  routineDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    lineHeight: 22,
  },
  routineDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    fontWeight: '500',
  },
  exercisePreview: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  exercisePreviewTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  exerciseList: {
    ...TEXT_STYLES.caption,
    color: COLORS.lightText,
    lineHeight: 20,
  },
  routineActions: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  startButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  completedButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    borderRadius: 8,
  },
  buttonText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: 12,
    margin: SPACING.md,
  },
  emptyStateText: {
    ...TEXT_STYLES.h3,
    color: COLORS.lightText,
  },
  emptyStateSubtext: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.accent,
  },
});

export default WarmupRoutines;
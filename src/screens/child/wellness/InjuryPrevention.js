import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Animated,
  Vibration,
  Alert,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  Card,
  Button,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Chip,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const InjuryPrevention = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, injuryData, isLoading } = useSelector(state => ({
    user: state.auth.user,
    injuryData: state.wellness.injuryPrevention || {},
    isLoading: state.wellness.isLoading,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [completedExercises, setCompletedExercises] = useState(injuryData.completedExercises || []);
  const [weeklyProgress, setWeeklyProgress] = useState(injuryData.weeklyProgress || 0);
  const [activeTab, setActiveTab] = useState('exercises');
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));
  const scrollY = useRef(new Animated.Value(0)).current;

  // Mock data for injury prevention content
  const [exerciseCategories] = useState([
    { id: 'all', label: 'All', icon: 'fitness-center', color: COLORS.primary },
    { id: 'warmup', label: 'Warm-up', icon: 'local-fire-department', color: '#FF6B6B' },
    { id: 'strength', label: 'Strength', icon: 'fitness-center', color: '#4ECDC4' },
    { id: 'flexibility', label: 'Flexibility', icon: 'self-improvement', color: '#45B7D1' },
    { id: 'balance', label: 'Balance', icon: 'accessibility', color: '#96CEB4' },
    { id: 'cooldown', label: 'Cool-down', icon: 'ac-unit', color: '#FFEAA7' },
  ]);

  const [preventionExercises] = useState([
    {
      id: 1,
      title: 'Dynamic Leg Swings',
      category: 'warmup',
      duration: '2 min',
      difficulty: 'Easy',
      bodyParts: ['legs', 'hips'],
      description: 'Swing your legs forward and back to warm up hip muscles',
      icon: 'directions-run',
      completed: false,
      benefits: 'Improves hip mobility and reduces injury risk',
    },
    {
      id: 2,
      title: 'Ankle Circles',
      category: 'warmup',
      duration: '1 min',
      difficulty: 'Easy',
      bodyParts: ['ankles'],
      description: 'Rotate ankles in both directions to improve mobility',
      icon: 'rotate-right',
      completed: true,
      benefits: 'Prevents ankle sprains and improves stability',
    },
    {
      id: 3,
      title: 'Glute Bridges',
      category: 'strength',
      duration: '3 min',
      difficulty: 'Medium',
      bodyParts: ['glutes', 'core'],
      description: 'Strengthen your glutes and core for better stability',
      icon: 'fitness-center',
      completed: false,
      benefits: 'Strengthens posterior chain, reduces back pain',
    },
    {
      id: 4,
      title: 'Single Leg Balance',
      category: 'balance',
      duration: '2 min',
      difficulty: 'Medium',
      bodyParts: ['legs', 'core'],
      description: 'Stand on one leg to improve balance and stability',
      icon: 'accessibility',
      completed: false,
      benefits: 'Improves proprioception and reduces fall risk',
    },
    {
      id: 5,
      title: 'Hamstring Stretch',
      category: 'flexibility',
      duration: '2 min',
      difficulty: 'Easy',
      bodyParts: ['hamstrings'],
      description: 'Gentle stretching to maintain hamstring flexibility',
      icon: 'self-improvement',
      completed: true,
      benefits: 'Prevents hamstring strains and improves flexibility',
    },
    {
      id: 6,
      title: 'Walking Cool Down',
      category: 'cooldown',
      duration: '5 min',
      difficulty: 'Easy',
      bodyParts: ['full-body'],
      description: 'Light walking to gradually reduce heart rate',
      icon: 'directions-walk',
      completed: false,
      benefits: 'Helps recovery and prevents muscle stiffness',
    },
  ]);

  const [injuryTips] = useState([
    {
      id: 1,
      title: 'Always Warm Up',
      description: 'Spend 5-10 minutes warming up before any activity',
      icon: 'local-fire-department',
      category: 'preparation',
    },
    {
      id: 2,
      title: 'Stay Hydrated',
      description: 'Drink water before, during, and after exercise',
      icon: 'opacity',
      category: 'hydration',
    },
    {
      id: 3,
      title: 'Listen to Your Body',
      description: 'Stop if you feel pain - it\'s your body\'s warning signal',
      icon: 'hearing',
      category: 'awareness',
    },
    {
      id: 4,
      title: 'Use Proper Equipment',
      description: 'Make sure your gear fits properly and is in good condition',
      icon: 'sports',
      category: 'equipment',
    },
  ]);

  // Component mount animation
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
    ]).start();

    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch action to refresh injury prevention data
      // dispatch(refreshInjuryPreventionData());
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    }
  }, [dispatch]);

  // Complete exercise
  const completeExercise = (exerciseId) => {
    Vibration.vibrate(100);
    const updatedExercises = [...completedExercises];
    
    if (!updatedExercises.includes(exerciseId)) {
      updatedExercises.push(exerciseId);
      setCompletedExercises(updatedExercises);
      
      // Update progress
      const totalExercises = preventionExercises.length;
      const newProgress = (updatedExercises.length / totalExercises) * 100;
      setWeeklyProgress(newProgress);

      Alert.alert(
        '🎉 Exercise Complete!',
        'Great job! You\'re building stronger, healthier habits! 💪',
        [{ text: 'Awesome!', style: 'default' }]
      );

      // Check for milestones
      if (updatedExercises.length === Math.floor(totalExercises / 2)) {
        Alert.alert(
          '🏆 Halfway There!',
          'You\'ve completed half of your injury prevention exercises! Keep going!',
          [{ text: 'Let\'s go!', style: 'default' }]
        );
      }
    }
    
    // Save to state/redux
    // dispatch(updateCompletedExercises(updatedExercises));
  };

  // Filter exercises
  const filteredExercises = preventionExercises.filter(exercise => {
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesSearch = exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderHeader = () => {
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={{ opacity: headerOpacity }}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.headerGradient}
        >
          <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
          <View style={styles.headerContent}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Icon name="health-and-safety" size={48} color="#ffffff" />
            </Animated.View>
            <Text style={[TEXT_STYLES.heading, styles.headerTitle]}>
              Injury Prevention 🛡️
            </Text>
            <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
              Stay safe, play strong!
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderProgressCard = () => (
    <Card style={styles.progressCard}>
      <LinearGradient
        colors={['#4CAF50', '#45A049']}
        style={styles.progressCardGradient}
      >
        <View style={styles.progressContent}>
          <Text style={styles.progressTitle}>Weekly Progress 📈</Text>
          <Text style={styles.progressText}>
            {completedExercises.length} / {preventionExercises.length} exercises completed
          </Text>
          <ProgressBar
            progress={weeklyProgress / 100}
            color="#ffffff"
            style={styles.progressBar}
          />
          <Text style={styles.percentageText}>
            {Math.round(weeklyProgress)}% Complete
          </Text>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'exercises' && styles.activeTab]}
        onPress={() => setActiveTab('exercises')}
      >
        <Icon
          name="fitness-center"
          size={20}
          color={activeTab === 'exercises' ? '#ffffff' : COLORS.primary}
        />
        <Text style={[
          styles.tabText,
          activeTab === 'exercises' && styles.activeTabText
        ]}>
          Exercises
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'tips' && styles.activeTab]}
        onPress={() => setActiveTab('tips')}
      >
        <Icon
          name="lightbulb"
          size={20}
          color={activeTab === 'tips' ? '#ffffff' : COLORS.primary}
        />
        <Text style={[
          styles.tabText,
          activeTab === 'tips' && styles.activeTabText
        ]}>
          Safety Tips
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search exercises..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {exerciseCategories.map((category) => (
          <Chip
            key={category.id}
            mode={selectedCategory === category.id ? 'flat' : 'outlined'}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && { backgroundColor: category.color }
            ]}
            textStyle={[
              styles.categoryChipText,
              selectedCategory === category.id && { color: '#ffffff' }
            ]}
            icon={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderExerciseCard = ({ item }) => {
    const isCompleted = completedExercises.includes(item.id);
    const categoryInfo = exerciseCategories.find(cat => cat.id === item.category);

    return (
      <Card style={[styles.exerciseCard, isCompleted && styles.completedCard]}>
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseIconContainer}>
            <Surface style={[styles.exerciseIcon, { backgroundColor: categoryInfo?.color || COLORS.primary }]}>
              <Icon name={item.icon} size={24} color="#ffffff" />
            </Surface>
          </View>
          
          <View style={styles.exerciseInfo}>
            <Text style={[TEXT_STYLES.heading, styles.exerciseTitle]}>
              {item.title}
            </Text>
            <Text style={styles.exerciseDescription}>
              {item.description}
            </Text>
            <Text style={styles.exerciseBenefits}>
              💡 {item.benefits}
            </Text>
          </View>

          {isCompleted && (
            <Icon name="check-circle" size={32} color={COLORS.success} />
          )}
        </View>

        <View style={styles.exerciseDetails}>
          <Chip
            mode="outlined"
            style={styles.detailChip}
            textStyle={styles.detailChipText}
            icon="schedule"
          >
            {item.duration}
          </Chip>
          
          <Chip
            mode="outlined"
            style={styles.detailChip}
            textStyle={styles.detailChipText}
            icon="trending-up"
          >
            {item.difficulty}
          </Chip>
        </View>

        <View style={styles.exerciseActions}>
          <Button
            mode={isCompleted ? "outlined" : "contained"}
            onPress={() => !isCompleted && completeExercise(item.id)}
            style={styles.actionButton}
            buttonColor={isCompleted ? 'transparent' : COLORS.primary}
            textColor={isCompleted ? COLORS.primary : '#ffffff'}
            disabled={isCompleted}
          >
            {isCompleted ? '✓ Completed' : 'Mark Complete'}
          </Button>
          
          <IconButton
            icon="play-arrow"
            mode="contained"
            iconColor="#ffffff"
            containerColor={COLORS.secondary}
            size={20}
            onPress={() => {
              Alert.alert(
                'Exercise Demo',
                'Video demonstrations coming soon! 🎥',
                [{ text: 'Got it!', style: 'default' }]
              );
            }}
          />
        </View>
      </Card>
    );
  };

  const renderTipCard = ({ item }) => (
    <Card style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <Surface style={[styles.tipIcon, { backgroundColor: COLORS.primary }]}>
          <Icon name={item.icon} size={24} color="#ffffff" />
        </Surface>
        <Text style={[TEXT_STYLES.heading, styles.tipTitle]}>
          {item.title}
        </Text>
      </View>
      <Text style={styles.tipDescription}>
        {item.description}
      </Text>
    </Card>
  );

  const renderContent = () => {
    if (activeTab === 'exercises') {
      return (
        <View>
          {renderSearchAndFilters()}
          <FlatList
            data={filteredExercises}
            renderItem={renderExerciseCard}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.exercisesList}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={injuryTips}
        renderItem={renderTipCard}
        keyExtractor={item => item.id.toString()}
        scrollEnabled={false}
        contentContainerStyle={styles.tipsList}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {renderProgressCard()}
          {renderTabButtons()}
          {renderContent()}
          
          <View style={styles.bottomSpacer} />
        </Animated.View>
      </Animated.ScrollView>

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => {
          Alert.alert(
            'Custom Routine',
            'Create custom injury prevention routines coming soon! 🏗️',
            [{ text: 'Awesome!', style: 'default' }]
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
  headerGradient: {
    paddingTop: 50,
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.medium,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.small,
  },
  headerSubtitle: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: SPACING.small,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.medium,
  },
  progressCard: {
    marginBottom: SPACING.large,
    elevation: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressCardGradient: {
    padding: SPACING.large,
    alignItems: 'center',
  },
  progressContent: {
    alignItems: 'center',
    width: '100%',
  },
  progressTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: SPACING.medium,
    opacity: 0.9,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.medium,
  },
  percentageText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: SPACING.large,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.small,
    borderRadius: 8,
    gap: SPACING.small,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  activeTabText: {
    color: '#ffffff',
  },
  searchContainer: {
    marginBottom: SPACING.large,
  },
  searchBar: {
    marginBottom: SPACING.medium,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: SPACING.small,
  },
  categoriesContent: {
    paddingRight: SPACING.medium,
  },
  categoryChip: {
    marginRight: SPACING.small,
  },
  categoryChipText: {
    fontSize: 12,
  },
  exercisesList: {
    gap: SPACING.medium,
  },
  exerciseCard: {
    padding: SPACING.medium,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  completedCard: {
    backgroundColor: '#f8f9fa',
    borderColor: COLORS.success,
    borderWidth: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
  },
  exerciseIconContainer: {
    marginRight: SPACING.medium,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.tiny,
  },
  exerciseDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
  },
  exerciseBenefits: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  detailChip: {
    height: 32,
  },
  detailChipText: {
    fontSize: 12,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginRight: SPACING.small,
  },
  tipsList: {
    gap: SPACING.medium,
  },
  tipCard: {
    padding: SPACING.medium,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.medium,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tipDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    right: SPACING.medium,
    bottom: SPACING.large,
    elevation: 8,
  },
});

export default InjuryPrevention;
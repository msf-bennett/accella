import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  RefreshControl,
  Alert,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  FlatList,
  Modal,
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
  Portal,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-blur/blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  mental: '#9c27b0',
  focus: '#3f51b5',
  confidence: '#ff5722',
  stress: '#795548',
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
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const SportsPsychology = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, mentalTraining, isLoading } = useSelector(state => ({
    user: state.auth.user,
    mentalTraining: state.psychology.mentalTraining,
    isLoading: state.psychology.isLoading,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [dailyMood, setDailyMood] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for mental training programs
  const mentalPrograms = [
    {
      id: '1',
      title: 'Pre-Competition Visualization',
      description: 'Master the art of mental rehearsal for peak performance',
      category: 'visualization',
      duration: '15 min',
      sessions: 12,
      completed: 8,
      difficulty: 'Intermediate',
      coach: 'Dr. Sarah Mind',
      rating: 4.8,
      participants: 1240,
      color: COLORS.mental,
      icon: 'visibility',
      benefits: ['Improved focus', 'Reduced anxiety', 'Enhanced confidence'],
      nextSession: 'Victory Visualization',
    },
    {
      id: '2',
      title: 'Confidence Building Bootcamp',
      description: 'Transform self-doubt into unshakeable confidence',
      category: 'confidence',
      duration: '20 min',
      sessions: 8,
      completed: 3,
      difficulty: 'Beginner',
      coach: 'Mike Mindset',
      rating: 4.9,
      participants: 890,
      color: COLORS.confidence,
      icon: 'psychology',
      benefits: ['Self-belief', 'Positive self-talk', 'Mental resilience'],
      nextSession: 'Positive Affirmations',
    },
    {
      id: '3',
      title: 'Focus & Concentration Mastery',
      description: 'Eliminate distractions and achieve laser focus',
      category: 'focus',
      duration: '10 min',
      sessions: 16,
      completed: 12,
      difficulty: 'Advanced',
      coach: 'Emma Focus',
      rating: 4.7,
      participants: 2100,
      color: COLORS.focus,
      icon: 'center-focus-strong',
      benefits: ['Better concentration', 'Flow state access', 'Mind clarity'],
      nextSession: 'Deep Focus Meditation',
    },
    {
      id: '4',
      title: 'Stress Management for Athletes',
      description: 'Learn to thrive under pressure and manage competition stress',
      category: 'stress',
      duration: '25 min',
      sessions: 10,
      completed: 5,
      difficulty: 'Intermediate',
      coach: 'Dr. Calm Waters',
      rating: 4.6,
      participants: 750,
      color: COLORS.stress,
      icon: 'spa',
      benefits: ['Stress reduction', 'Anxiety control', 'Relaxation techniques'],
      nextSession: 'Breathing for Performance',
    },
  ];

  // Mock mood tracking data
  const moodOptions = [
    { id: 'excellent', emoji: '🚀', label: 'Excellent', color: '#4caf50' },
    { id: 'good', emoji: '😊', label: 'Good', color: '#8bc34a' },
    { id: 'neutral', emoji: '😐', label: 'Neutral', color: '#ffc107' },
    { id: 'low', emoji: '😔', label: 'Low', color: '#ff9800' },
    { id: 'stressed', emoji: '😰', label: 'Stressed', color: '#f44336' },
  ];

  const weeklyMoodData = [
    { day: 'Mon', mood: 'good', energy: 80, focus: 75 },
    { day: 'Tue', mood: 'excellent', energy: 95, focus: 90 },
    { day: 'Wed', mood: 'neutral', energy: 60, focus: 65 },
    { day: 'Thu', mood: 'good', energy: 85, focus: 80 },
    { day: 'Fri', mood: 'excellent', energy: 90, focus: 95 },
    { day: 'Sat', mood: 'good', energy: 75, focus: 70 },
    { day: 'Sun', mood: 'neutral', energy: 65, focus: 60 },
  ];

  const categories = [
    { id: 'all', label: 'All Programs', icon: 'psychology', color: COLORS.primary },
    { id: 'visualization', label: 'Visualization', icon: 'visibility', color: COLORS.mental },
    { id: 'confidence', label: 'Confidence', icon: 'psychology', color: COLORS.confidence },
    { id: 'focus', label: 'Focus', icon: 'center-focus-strong', color: COLORS.focus },
    { id: 'stress', label: 'Stress Relief', icon: 'spa', color: COLORS.stress },
  ];

  useEffect(() => {
    // Entrance animations
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
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch action to refresh mental training data
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleProgramPress = (program) => {
    Vibration.vibrate(30);
    setSelectedProgram(program);
    navigation.navigate('MentalTrainingSession', { programId: program.id });
  };

  const handleStartSession = (program) => {
    Vibration.vibrate(50);
    navigation.navigate('MentalTrainingSession', { 
      programId: program.id,
      sessionTitle: program.nextSession
    });
  };

  const handleMoodSelection = (mood) => {
    setDailyMood(mood);
    setShowMoodModal(false);
    Vibration.vibrate(30);
    // Here you would dispatch an action to save the mood
    Alert.alert('Mood Logged! 📝', `Thanks for sharing how you're feeling today. This helps us personalize your mental training.`);
  };

  const filteredPrograms = mentalPrograms.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    return selectedCategory === 'all' || program.category === selectedCategory;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getMoodColor = (moodId) => {
    const mood = moodOptions.find(m => m.id === moodId);
    return mood ? mood.color : COLORS.textSecondary;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient colors={[COLORS.mental, COLORS.secondary]} style={styles.headerGradient}>
        <Text style={styles.headerTitle}>Mental Training 🧠</Text>
        <Text style={styles.headerSubtitle}>
          Train your mind, unlock your potential
        </Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => setShowMoodModal(true)}
          >
            <Icon name="emoji-emotions" size={24} color="white" />
            <Text style={styles.quickActionText}>Daily Mood</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('MoodTracker')}
          >
            <Icon name="trending-up" size={24} color="white" />
            <Text style={styles.quickActionText}>Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('MentalCoaching')}
          >
            <Icon name="chat" size={24} color="white" />
            <Text style={styles.quickActionText}>Coach Chat</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderMoodTracker = () => (
    <Card style={styles.moodCard}>
      <Card.Content>
        <View style={styles.moodHeader}>
          <Text style={styles.sectionTitle}>This Week's Mental State 📊</Text>
          <IconButton
            icon="insights"
            size={20}
            onPress={() => navigation.navigate('MoodInsights')}
          />
        </View>
        
        <View style={styles.moodWeekContainer}>
          {weeklyMoodData.map((day, index) => (
            <View key={day.day} style={styles.moodDayContainer}>
              <Text style={styles.moodDayLabel}>{day.day}</Text>
              <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(day.mood) }]}>
                <Text style={styles.moodEmoji}>
                  {moodOptions.find(m => m.id === day.mood)?.emoji}
                </Text>
              </View>
              <View style={styles.moodMetrics}>
                <View style={styles.metricBar}>
                  <View style={[styles.metricFill, { 
                    width: `${day.energy}%`, 
                    backgroundColor: COLORS.success 
                  }]} />
                </View>
                <View style={styles.metricBar}>
                  <View style={[styles.metricFill, { 
                    width: `${day.focus}%`, 
                    backgroundColor: COLORS.focus 
                  }]} />
                </View>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
            <Text style={styles.legendText}>Energy</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.focus }]} />
            <Text style={styles.legendText}>Focus</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && [
                styles.categoryChipSelected,
                { backgroundColor: category.color + '20' }
              ]
            ]}
            onPress={() => {
              setSelectedCategory(category.id);
              Vibration.vibrate(30);
            }}
          >
            <Icon
              name={category.icon}
              size={18}
              color={selectedCategory === category.id ? category.color : COLORS.textSecondary}
            />
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category.id && { color: category.color }
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderProgramCard = ({ item: program }) => (
    <Animated.View
      style={[
        styles.programCardContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <Card style={styles.programCard} onPress={() => handleProgramPress(program)}>
        <View style={[styles.cardHeader, { backgroundColor: program.color + '15' }]}>
          <View style={styles.programHeaderContent}>
            <View style={[styles.programIcon, { backgroundColor: program.color }]}>
              <Icon name={program.icon} size={24} color="white" />
            </View>
            <View style={styles.programHeaderText}>
              <Text style={styles.programTitle}>{program.title}</Text>
              <Text style={styles.programDescription}>{program.description}</Text>
              <View style={styles.programMeta}>
                <Text style={styles.coachName}>by {program.coach}</Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={14} color={COLORS.warning} />
                  <Text style={styles.rating}>{program.rating}</Text>
                  <Text style={styles.participants}>({program.participants})</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <Card.Content style={styles.cardContent}>
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {program.completed}/{program.sessions} sessions completed
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round((program.completed / program.sessions) * 100)}%
              </Text>
            </View>
            <ProgressBar
              progress={program.completed / program.sessions}
              color={program.color}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.programDetails}>
            <Chip
              mode="outlined"
              style={[styles.difficultyChip, { borderColor: getDifficultyColor(program.difficulty) }]}
              textStyle={{ color: getDifficultyColor(program.difficulty) }}
            >
              {program.difficulty}
            </Chip>
            <Chip mode="outlined" style={styles.durationChip}>
              {program.duration}
            </Chip>
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Benefits:</Text>
            <View style={styles.benefitsList}>
              {program.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Icon name="check-circle" size={14} color={COLORS.success} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.nextSessionContainer}>
            <Text style={styles.nextSessionLabel}>Next Session:</Text>
            <Text style={styles.nextSessionTitle}>{program.nextSession}</Text>
          </View>

          <View style={styles.cardActions}>
            <Button
              mode="contained"
              onPress={() => handleStartSession(program)}
              style={[styles.startButton, { backgroundColor: program.color }]}
              labelStyle={styles.buttonLabel}
              icon="play-arrow"
            >
              Start Session
            </Button>
            <IconButton
              icon="bookmark-outline"
              size={20}
              onPress={() => {
                Vibration.vibrate(30);
                Alert.alert('Bookmarked! 📚', 'Program added to your favorites.');
              }}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderMoodModal = () => (
    <Portal>
      <Modal
        visible={showMoodModal}
        onDismiss={() => setShowMoodModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Surface style={styles.moodModalContent}>
            <Text style={styles.modalTitle}>How are you feeling today? 🤔</Text>
            <Text style={styles.modalSubtitle}>
              Your mental state helps us personalize your training
            </Text>
            
            <View style={styles.moodOptionsContainer}>
              {moodOptions.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[styles.moodOption, { backgroundColor: mood.color + '20' }]}
                  onPress={() => handleMoodSelection(mood)}
                >
                  <Text style={styles.moodOptionEmoji}>{mood.emoji}</Text>
                  <Text style={[styles.moodOptionLabel, { color: mood.color }]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Button
              mode="outlined"
              onPress={() => setShowMoodModal(false)}
              style={styles.cancelButton}
            >
              Maybe Later
            </Button>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.mental]}
            tintColor={COLORS.mental}
          />
        }
      >
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search mental training programs..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.mental}
          />
        </View>

        {renderMoodTracker()}
        
        {renderCategoryFilter()}

        <View style={styles.programsSection}>
          <Text style={styles.sectionTitle}>Mental Training Programs 💪</Text>
          <FlatList
            data={filteredPrograms}
            keyExtractor={(item) => item.id}
            renderItem={renderProgramCard}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="psychology" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyStateText}>No programs found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try adjusting your search or category filter
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.mental }]}
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert('Feature Coming Soon', 'Custom mental training programs will be available soon! 🧠✨');
        }}
      />

      {renderMoodModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 0,
  },
  headerGradient: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.lg,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  quickActionText: {
    color: 'white',
    marginTop: SPACING.xs,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchbar: {
    elevation: 2,
  },
  moodCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 16,
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  moodWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  moodDayContainer: {
    alignItems: 'center',
    flex: 1,
  },
  moodDayLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  moodIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  moodEmoji: {
    fontSize: 18,
  },
  moodMetrics: {
    width: '100%',
    gap: 2,
  },
  metricBar: {
    height: 3,
    backgroundColor: COLORS.background,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  legendText: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  categoryChipSelected: {
    elevation: 4,
  },
  categoryChipText: {
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  programsSection: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 80, // Account for FAB
  },
  programCardContainer: {
    marginBottom: SPACING.md,
  },
  programCard: {
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  programHeaderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  programIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  programHeaderText: {
    flex: 1,
  },
  programTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.xs,
  },
  programDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  programMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coachName: {
    ...TEXT_STYLES.caption,
    fontStyle: 'italic',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  participants: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  cardContent: {
    padding: SPACING.md,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    color: COLORS.mental,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  programDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  difficultyChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  durationChip: {
    marginBottom: SPACING.xs,
  },
  benefitsContainer: {
    marginBottom: SPACING.md,
  },
  benefitsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  benefitsList: {
    gap: SPACING.xs,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  nextSessionContainer: {
    backgroundColor: COLORS.mental + '10',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  nextSessionLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  nextSessionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.mental,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  startButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateText: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodModalContent: {
    width: width * 0.9,
    maxHeight: '70%',
    borderRadius: 24,
    padding: SPACING.xl,
    elevation: 8,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  moodOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  moodOption: {
    width: '45%',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.md,
  },
  moodOptionEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  moodOptionLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: SPACING.sm,
  },
  });

export default SportsPsychology;
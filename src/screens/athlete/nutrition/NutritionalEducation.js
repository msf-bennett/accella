import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Image,
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
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports (assumed to be available)
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const NutritionEducation = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const educationProgress = useSelector(state => state.education.nutrition);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [completedLessons, setCompletedLessons] = useState(['1', '3', '7']);
  const [userLevel, setUserLevel] = useState('Beginner');
  const [totalPoints, setTotalPoints] = useState(850);
  const [showQuizModal, setShowQuizModal] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(COLORS.primary, true);
    
    // Entrance animation
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const categories = [
    { key: 'all', label: 'All Topics', icon: 'menu-book', count: 24 },
    { key: 'basics', label: 'Basics', icon: 'school', count: 8 },
    { key: 'performance', label: 'Performance', icon: 'sports', count: 6 },
    { key: 'recovery', label: 'Recovery', icon: 'healing', count: 5 },
    { key: 'supplements', label: 'Supplements', icon: 'medication', count: 5 },
  ];

  const educationalContent = [
    {
      id: '1',
      title: 'Macronutrients Basics',
      subtitle: 'Understanding Carbs, Proteins & Fats',
      category: 'basics',
      duration: '8 min read',
      difficulty: 'Beginner',
      points: 50,
      completed: true,
      progress: 100,
      icon: 'pie-chart',
      description: 'Learn the fundamental building blocks of nutrition and how they fuel your body.',
      topics: ['Carbohydrates', 'Proteins', 'Fats', 'Energy systems'],
    },
    {
      id: '2',
      title: 'Pre-Workout Nutrition',
      subtitle: 'Fuel for Peak Performance',
      category: 'performance',
      duration: '6 min read',
      difficulty: 'Intermediate',
      points: 75,
      completed: false,
      progress: 0,
      icon: 'fitness-center',
      description: 'Optimize your pre-training meals for maximum energy and performance.',
      topics: ['Timing', 'Food choices', 'Hydration', 'Energy systems'],
    },
    {
      id: '3',
      title: 'Hydration Science',
      subtitle: 'Water Balance & Performance',
      category: 'basics',
      duration: '5 min read',
      difficulty: 'Beginner',
      points: 40,
      completed: true,
      progress: 100,
      icon: 'water-drop',
      description: 'Understand the critical role of hydration in athletic performance.',
      topics: ['Fluid balance', 'Electrolytes', 'Dehydration', 'Monitoring'],
    },
    {
      id: '4',
      title: 'Post-Workout Recovery',
      subtitle: 'The Recovery Window',
      category: 'recovery',
      duration: '10 min read',
      difficulty: 'Intermediate',
      points: 80,
      completed: false,
      progress: 30,
      icon: 'restore',
      description: 'Maximize recovery with strategic nutrition timing and food choices.',
      topics: ['Protein synthesis', 'Glycogen replenishment', 'Timing', 'Food combinations'],
    },
    {
      id: '5',
      title: 'Supplement Science',
      subtitle: 'Evidence-Based Supplements',
      category: 'supplements',
      duration: '12 min read',
      difficulty: 'Advanced',
      points: 100,
      completed: false,
      progress: 0,
      icon: 'science',
      description: 'Navigate the world of supplements with evidence-based information.',
      topics: ['Creatine', 'Protein powder', 'Beta-alanine', 'Caffeine'],
    },
    {
      id: '6',
      title: 'Meal Timing Strategy',
      subtitle: 'When to Eat for Performance',
      category: 'performance',
      duration: '7 min read',
      difficulty: 'Intermediate',
      points: 70,
      completed: false,
      progress: 0,
      icon: 'schedule',
      description: 'Master the art of nutrient timing around training sessions.',
      topics: ['Circadian rhythm', 'Training windows', 'Metabolism', 'Performance peaks'],
    },
    {
      id: '7',
      title: 'Body Composition',
      subtitle: 'Fat Loss & Muscle Gain',
      category: 'basics',
      duration: '9 min read',
      difficulty: 'Intermediate',
      points: 85,
      completed: true,
      progress: 100,
      icon: 'fitness-center',
      description: 'Understand the science behind changing body composition.',
      topics: ['Caloric balance', 'Protein requirements', 'Training adaptations', 'Measurement'],
    },
    {
      id: '8',
      title: 'Micronutrients Matter',
      subtitle: 'Vitamins & Minerals for Athletes',
      category: 'basics',
      duration: '11 min read',
      difficulty: 'Advanced',
      points: 90,
      completed: false,
      progress: 0,
      icon: 'local-pharmacy',
      description: 'Discover the often-overlooked micronutrients crucial for performance.',
      topics: ['Vitamin D', 'Iron', 'B-vitamins', 'Antioxidants'],
    },
  ];

  const quickTips = [
    { tip: 'Eat protein within 2 hours post-workout 💪', category: 'recovery' },
    { tip: 'Aim for 30-60g carbs before intense training ⚡', category: 'performance' },
    { tip: 'Monitor urine color for hydration status 💧', category: 'basics' },
    { tip: 'Time creatine 3-5g daily, timing flexible 🔬', category: 'supplements' },
  ];

  const achievements = [
    { id: '1', title: 'Knowledge Seeker', description: 'Complete 5 lessons', icon: 'school', earned: true, progress: 5, target: 5 },
    { id: '2', title: 'Nutrition Scholar', description: 'Complete all basics', icon: 'menu-book', earned: false, progress: 3, target: 8 },
    { id: '3', title: 'Performance Expert', description: 'Master performance nutrition', icon: 'sports', earned: false, progress: 0, target: 6 },
    { id: '4', title: 'Quiz Master', description: 'Pass 10 quizzes with 80%+', icon: 'quiz', earned: false, progress: 3, target: 10 },
  ];

  const filteredContent = educationalContent.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  ).filter(item => 
    searchQuery === '' || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleLessonPress = (lesson) => {
    Alert.alert(
      lesson.title,
      `${lesson.description}\n\nDuration: ${lesson.duration}\nDifficulty: ${lesson.difficulty}\nPoints: ${lesson.points}\n\nTopics covered:\n${lesson.topics.join('\n• ')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: lesson.completed ? 'Review' : 'Start Learning', 
          onPress: () => startLesson(lesson.id)
        },
        { text: 'Take Quiz', onPress: () => startQuiz(lesson.id) },
      ]
    );
  };

  const startLesson = (lessonId) => {
    Alert.alert('Starting Lesson 📚', 'Opening interactive learning experience...');
  };

  const startQuiz = (lessonId) => {
    Alert.alert('Quiz Time! 🧠', 'Test your knowledge with interactive questions...');
  };

  const handleCategoryPress = (categoryKey) => {
    setSelectedCategory(categoryKey);
  };

  const openNutritionCalculator = () => {
    Alert.alert('Nutrition Calculator 🧮', 'Calculate your daily nutritional needs based on goals and activity level');
  };

  const openMealBuilder = () => {
    Alert.alert('Meal Builder 🍽️', 'Build balanced meals using our nutrition database');
  };

  const renderCategoryCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleCategoryPress(item.key)}
      style={[
        styles.categoryCard,
        selectedCategory === item.key && styles.activeCategoryCard
      ]}
    >
      <Icon 
        name={item.icon} 
        size={24} 
        color={selectedCategory === item.key ? 'white' : COLORS.primary}
      />
      <Text style={[
        styles.categoryLabel,
        selectedCategory === item.key && styles.activeCategoryLabel
      ]}>
        {item.label}
      </Text>
      <Text style={[
        styles.categoryCount,
        selectedCategory === item.key && styles.activeCategoryCount
      ]}>
        {item.count} topics
      </Text>
    </TouchableOpacity>
  );

  const renderLessonCard = ({ item }) => (
    <Surface style={styles.lessonCard} elevation={2}>
      <TouchableOpacity onPress={() => handleLessonPress(item)}>
        <View style={styles.lessonHeader}>
          <View style={styles.lessonIcon}>
            <Icon 
              name={item.icon} 
              size={28} 
              color={item.completed ? COLORS.success : COLORS.primary}
            />
          </View>
          <View style={styles.lessonInfo}>
            <Text style={[TEXT_STYLES.subtitle, { color: COLORS.text }]}>
              {item.title}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>
          <View style={styles.lessonMeta}>
            <Chip 
              style={styles.difficultyChip}
              textStyle={{ fontSize: 10 }}
              mode="outlined"
            >
              {item.difficulty}
            </Chip>
            <Text style={styles.pointsText}>+{item.points} pts</Text>
          </View>
        </View>

        <Text style={styles.lessonDescription}>
          {item.description}
        </Text>

        <View style={styles.lessonFooter}>
          <View style={styles.lessonDetails}>
            <Icon name="access-time" size={16} color={COLORS.textSecondary} />
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
          
          {item.completed ? (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={16} color={COLORS.success} />
              <Text style={styles.completedText}>Completed ✨</Text>
            </View>
          ) : item.progress > 0 ? (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{item.progress}% complete</Text>
              <ProgressBar
                progress={item.progress / 100}
                color={COLORS.primary}
                style={styles.progressBar}
              />
            </View>
          ) : (
            <Button
              mode="contained"
              compact
              style={styles.startButton}
              onPress={() => startLesson(item.id)}
            >
              Start
            </Button>
          )}
        </View>

        <View style={styles.topicsContainer}>
          {item.topics.slice(0, 3).map((topic, index) => (
            <Chip
              key={index}
              mode="outlined"
              style={styles.topicChip}
              textStyle={{ fontSize: 10 }}
            >
              {topic}
            </Chip>
          ))}
          {item.topics.length > 3 && (
            <Text style={styles.moreTopics}>+{item.topics.length - 3} more</Text>
          )}
        </View>
      </TouchableOpacity>
    </Surface>
  );

  const renderAchievement = ({ item }) => (
    <Surface style={styles.achievementCard} elevation={1}>
      <View style={styles.achievementHeader}>
        <Avatar.Icon
          size={40}
          icon={item.icon}
          style={[
            styles.achievementIcon,
            { backgroundColor: item.earned ? COLORS.success : COLORS.disabled }
          ]}
        />
        <View style={styles.achievementInfo}>
          <Text style={[
            styles.achievementTitle,
            { color: item.earned ? COLORS.text : COLORS.textSecondary }
          ]}>
            {item.title}
          </Text>
          <Text style={styles.achievementDescription}>
            {item.description}
          </Text>
        </View>
      </View>
      <View style={styles.achievementProgress}>
        <Text style={styles.achievementProgressText}>
          {item.progress}/{item.target}
        </Text>
        <ProgressBar
          progress={item.progress / item.target}
          color={item.earned ? COLORS.success : COLORS.primary}
          style={styles.achievementProgressBar}
        />
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Nutrition Education 🎓</Text>
              <Text style={styles.headerSubtitle}>
                Level: {userLevel} • {totalPoints} points earned 🌟
              </Text>
            </View>
            <TouchableOpacity onPress={openNutritionCalculator}>
              <Surface style={styles.calculatorButton} elevation={3}>
                <Icon name="calculate" size={24} color={COLORS.primary} />
              </Surface>
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <Searchbar
            placeholder="Search nutrition topics..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={{ fontSize: 14 }}
            iconColor={COLORS.primary}
          />
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Quick Action Buttons */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionButton} onPress={openMealBuilder}>
            <Icon name="restaurant" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Meal Builder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Nutrition tracker will be available soon')}>
            <Icon name="track-changes" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Track Nutrition</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Recipe database coming soon')}>
            <Icon name="menu-book" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Recipes</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
            Learning Categories 📚
          </Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING.sm }}
          />
        </View>

        {/* Quick Tips */}
        <Surface style={styles.tipsCard} elevation={1}>
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
            Quick Tips 💡
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickTips.map((tip, index) => (
              <Chip
                key={index}
                mode="outlined"
                style={styles.tipChip}
                textStyle={{ fontSize: 12 }}
              >
                {tip.tip}
              </Chip>
            ))}
          </ScrollView>
        </Surface>

        {/* Learning Progress Overview */}
        <Surface style={styles.progressOverviewCard} elevation={2}>
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
            Learning Progress 📈
          </Text>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatNumber}>{completedLessons.length}</Text>
              <Text style={styles.progressStatLabel}>Completed</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatNumber}>{totalPoints}</Text>
              <Text style={styles.progressStatLabel}>Points</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatNumber}>{userLevel}</Text>
              <Text style={styles.progressStatLabel}>Level</Text>
            </View>
          </View>
          <ProgressBar
            progress={completedLessons.length / educationalContent.length}
            color={COLORS.success}
            style={styles.overallProgressBar}
          />
          <Text style={styles.overallProgressText}>
            {Math.round((completedLessons.length / educationalContent.length) * 100)}% of all lessons completed
          </Text>
        </Surface>

        {/* Learning Content */}
        <View style={styles.contentSection}>
          <View style={styles.contentHeader}>
            <Text style={[TEXT_STYLES.subtitle, { flex: 1 }]}>
              {selectedCategory === 'all' ? 'All Topics' : categories.find(c => c.key === selectedCategory)?.label} 
              ({filteredContent.length})
            </Text>
            <IconButton
              icon="sort"
              size={20}
              onPress={() => Alert.alert('Sort Options', 'Sort by: Difficulty, Duration, Points, Progress')}
            />
          </View>
          
          <FlatList
            data={filteredContent}
            renderItem={renderLessonCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          />
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
            Achievements 🏆
          </Text>
          <FlatList
            data={achievements}
            renderItem={renderAchievement}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          />
        </View>
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="quiz"
        label="Take Quiz"
        onPress={() => Alert.alert('Quiz Mode 🧠', 'Test your nutrition knowledge with personalized quizzes!')}
        color="white"
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'column',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  calculatorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 25,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    marginTop: -20,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 1,
    minWidth: 80,
  },
  quickActionText: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 4,
    fontWeight: '600',
  },
  categoriesContainer: {
    marginBottom: SPACING.lg,
  },
  categoryCard: {
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeCategoryCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryLabel: {
    fontSize: 12,
    color: COLORS.text,
    marginVertical: 4,
    fontWeight: '600',
  },
  activeCategoryLabel: {
    color: 'white',
  },
  categoryCount: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  activeCategoryCount: {
    color: 'rgba(255,255,255,0.9)',
  },
  tipsCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    backgroundColor: 'white',
  },
  tipChip: {
    marginRight: SPACING.sm,
  },
  progressOverviewCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    backgroundColor: 'white',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  overallProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  overallProgressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  contentSection: {
    marginBottom: SPACING.lg,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  lessonCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  lessonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  lessonInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  lessonMeta: {
    alignItems: 'flex-end',
  },
  difficultyChip: {
    height: 24,
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  lessonDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  lessonDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 4,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  progressText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  progressBar: {
    width: 80,
    height: 4,
    borderRadius: 2,
  },
  startButton: {
    paddingHorizontal: SPACING.sm,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  topicChip: {
    height: 24,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  moreTopics: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  achievementsSection: {
    marginBottom: SPACING.lg,
  },
  achievementCard: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  achievementIcon: {
    marginRight: SPACING.sm,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementProgressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
    minWidth: 30,
  },
  achievementProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default NutritionEducation;
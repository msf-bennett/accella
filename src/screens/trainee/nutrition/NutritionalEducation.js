import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  FlatList,
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
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
  info: '#3498db',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const NutritionalEducation = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, completedLessons, userProgress } = useSelector((state) => state.education);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('lessons');
  const [scrollY] = useState(new Animated.Value(0));

  // Sample education data
  const [learningStats] = useState({
    totalLessons: 48,
    completedLessons: 23,
    currentStreak: 12,
    totalPoints: 2340,
    level: 7,
    nextLevelPoints: 2800,
    certificates: 3,
  });

  const [categories] = useState([
    { key: 'all', label: 'All Topics', icon: 'school', count: 48 },
    { key: 'basics', label: 'Nutrition Basics', icon: 'lightbulb', count: 12 },
    { key: 'macros', label: 'Macronutrients', icon: 'pie-chart', count: 8 },
    { key: 'timing', label: 'Meal Timing', icon: 'schedule', count: 6 },
    { key: 'supplements', label: 'Supplements', icon: 'medication', count: 10 },
    { key: 'sports', label: 'Sports Nutrition', icon: 'fitness-center', count: 12 },
  ]);

  const [featuredLessons] = useState([
    {
      id: 1,
      title: 'Understanding Macronutrients',
      description: 'Learn about proteins, carbs, and fats for optimal performance',
      category: 'macros',
      duration: '15 min',
      difficulty: 'Beginner',
      points: 100,
      completed: true,
      rating: 4.8,
      thumbnail: 'restaurant-menu',
      color: COLORS.primary,
      progress: 100,
    },
    {
      id: 2,
      title: 'Pre & Post Workout Nutrition',
      description: 'Optimize your training with proper meal timing strategies',
      category: 'timing',
      duration: '20 min',
      difficulty: 'Intermediate',
      points: 150,
      completed: false,
      rating: 4.9,
      thumbnail: 'schedule',
      color: COLORS.success,
      progress: 0,
    },
    {
      id: 3,
      title: 'Supplement Myths vs Facts',
      description: 'Discover what supplements actually work and which ones to avoid',
      category: 'supplements',
      duration: '25 min',
      difficulty: 'Advanced',
      points: 200,
      completed: false,
      rating: 4.7,
      thumbnail: 'fact-check',
      color: COLORS.warning,
      progress: 35,
    },
  ]);

  const [quizzes] = useState([
    {
      id: 1,
      title: 'Protein Power Quiz',
      description: 'Test your protein knowledge',
      questions: 10,
      timeLimit: 5,
      points: 50,
      difficulty: 'Easy',
      completed: true,
      score: 85,
      attempts: 2,
    },
    {
      id: 2,
      title: 'Carb Cycling Challenge',
      description: 'Advanced carbohydrate strategies',
      questions: 15,
      timeLimit: 8,
      points: 100,
      difficulty: 'Hard',
      completed: false,
      score: 0,
      attempts: 0,
    },
  ]);

  const [achievements] = useState([
    { id: 1, title: 'Quick Learner', description: 'Complete 5 lessons in a day', icon: 'flash-on', earned: true },
    { id: 2, title: 'Knowledge Seeker', description: 'Read 20 articles', icon: 'menu-book', earned: true },
    { id: 3, title: 'Quiz Master', description: 'Score 90% on 3 quizzes', icon: 'quiz', earned: false },
    { id: 4, title: 'Nutrition Expert', description: 'Complete all basic modules', icon: 'verified', earned: false },
  ]);

  const [dailyTips] = useState([
    {
      id: 1,
      title: "💡 Daily Nutrition Tip",
      content: "Eating protein within 30 minutes after your workout helps maximize muscle protein synthesis and recovery.",
      category: "Recovery",
      readTime: "1 min"
    }
  ]);

  const tabs = [
    { key: 'lessons', label: 'Lessons', icon: 'school' },
    { key: 'quizzes', label: 'Quizzes', icon: 'quiz' },
    { key: 'articles', label: 'Articles', icon: 'article' },
    { key: 'tools', label: 'Tools', icon: 'build' },
  ];

  useEffect(() => {
    loadEducationData();
  }, []);

  const loadEducationData = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(loadEducationContent());
    } catch (error) {
      Alert.alert('Error', 'Failed to load education content');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEducationData();
    setRefreshing(false);
  }, [loadEducationData]);

  const handleLessonStart = (lesson) => {
    if (lesson.completed) {
      Alert.alert(
        'Lesson Completed ✅',
        'You\'ve already completed this lesson! Would you like to review it again?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Review', onPress: () => startLesson(lesson) }
        ]
      );
    } else {
      startLesson(lesson);
    }
  };

  const startLesson = (lesson) => {
    Alert.alert(
      'Starting Lesson',
      `Ready to learn about "${lesson.title}"? This will take approximately ${lesson.duration}.`,
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Start Learning', onPress: () => navigation.navigate('LessonDetail', { lessonId: lesson.id }) }
      ]
    );
  };

  const handleQuizStart = (quiz) => {
    if (quiz.completed) {
      Alert.alert(
        'Quiz Results 📊',
        `Previous Score: ${quiz.score}%\nAttempts: ${quiz.attempts}\n\nWould you like to retake this quiz?`,
        [
          { text: 'View Results', style: 'cancel' },
          { text: 'Retake Quiz', onPress: () => startQuiz(quiz) }
        ]
      );
    } else {
      startQuiz(quiz);
    }
  };

  const startQuiz = (quiz) => {
    Alert.alert(
      'Quiz Challenge 🧠',
      `${quiz.questions} questions in ${quiz.timeLimit} minutes\nReward: ${quiz.points} points\n\nReady to test your knowledge?`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Start Quiz', onPress: () => navigation.navigate('QuizChallenge', { quizId: quiz.id }) }
      ]
    );
  };

  const getLevelProgress = () => {
    const currentLevelPoints = learningStats.totalPoints % 400; // Assuming 400 points per level
    return currentLevelPoints / 400;
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              Nutrition Education 🎓
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Master the science of nutrition
            </Text>
          </View>
          <TouchableOpacity style={styles.profileSection}>
            <Text style={styles.levelBadge}>Lv. {learningStats.level}</Text>
            <Avatar.Icon
              size={40}
              icon="school"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Section */}
        <Surface style={styles.progressSection}>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{learningStats.completedLessons}</Text>
              <Text style={styles.progressLabel}>Lessons Done</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{learningStats.currentStreak}</Text>
              <Text style={styles.progressLabel}>Day Streak 🔥</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{learningStats.totalPoints}</Text>
              <Text style={styles.progressLabel}>XP Points</Text>
            </View>
          </View>
          
          <View style={styles.levelProgressContainer}>
            <Text style={styles.levelProgressText}>
              Level {learningStats.level} Progress
            </Text>
            <ProgressBar
              progress={getLevelProgress()}
              color={COLORS.warning}
              style={styles.levelProgressBar}
            />
            <Text style={styles.levelProgressPoints}>
              {learningStats.totalPoints} / {learningStats.nextLevelPoints} XP
            </Text>
          </View>
        </Surface>
      </View>
    </LinearGradient>
  );

  const renderTabNavigation = () => (
    <Surface style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabItem,
              activeTab === tab.key && styles.activeTabItem
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? 'white' : COLORS.textSecondary}
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  const renderDailyTip = () => (
    <Card style={styles.dailyTipCard}>
      <LinearGradient
        colors={[COLORS.info, COLORS.primary]}
        style={styles.dailyTipGradient}
      >
        <View style={styles.dailyTipHeader}>
          <Text style={styles.dailyTipTitle}>{dailyTips[0].title}</Text>
          <View style={styles.dailyTipBadge}>
            <Text style={styles.dailyTipBadgeText}>{dailyTips[0].readTime}</Text>
          </View>
        </View>
        <Text style={styles.dailyTipContent}>{dailyTips[0].content}</Text>
        <Button
          mode="contained"
          onPress={() => Alert.alert('Daily Tips', 'Access your personalized daily nutrition tips!')}
          style={styles.dailyTipButton}
          buttonColor="rgba(255,255,255,0.2)"
          textColor="white"
          compact
        >
          Read More Tips
        </Button>
      </LinearGradient>
    </Card>
  );

  const renderCategoryFilters = () => (
    <View style={styles.categoriesContainer}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        Browse Topics 📚
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryCard,
              selectedCategory === category.key && styles.activeCategoryCard
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <View style={[
              styles.categoryIcon,
              selectedCategory === category.key && styles.activeCategoryIcon
            ]}>
              <Icon
                name={category.icon}
                size={24}
                color={selectedCategory === category.key ? 'white' : COLORS.primary}
              />
            </View>
            <Text style={[
              styles.categoryLabel,
              selectedCategory === category.key && styles.activeCategoryLabel
            ]}>
              {category.label}
            </Text>
            <Badge
              style={[
                styles.categoryBadge,
                selectedCategory === category.key && styles.activeCategoryBadge
              ]}
            >
              {category.count}
            </Badge>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderLessonCard = (lesson) => (
    <Card key={lesson.id} style={styles.lessonCard}>
      <View style={styles.lessonHeader}>
        <View style={[styles.lessonThumbnail, { backgroundColor: `${lesson.color}20` }]}>
          <Icon name={lesson.thumbnail} size={32} color={lesson.color} />
          {lesson.completed && (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
            </View>
          )}
        </View>
        <View style={styles.lessonInfo}>
          <Text style={TEXT_STYLES.h3}>{lesson.title}</Text>
          <Text style={[TEXT_STYLES.caption, { marginVertical: SPACING.xs }]}>
            {lesson.description}
          </Text>
          <View style={styles.lessonMeta}>
            <Chip style={styles.metaChip} textStyle={styles.metaChipText}>
              {lesson.duration}
            </Chip>
            <Chip style={styles.metaChip} textStyle={styles.metaChipText}>
              {lesson.difficulty}
            </Chip>
            <Chip style={[styles.metaChip, styles.pointsChip]} textStyle={styles.pointsChipText}>
              {lesson.points} XP
            </Chip>
          </View>
        </View>
      </View>

      {lesson.progress > 0 && lesson.progress < 100 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{lesson.progress}% Complete</Text>
          <ProgressBar
            progress={lesson.progress / 100}
            color={lesson.color}
            style={styles.lessonProgressBar}
          />
        </View>
      )}

      <View style={styles.lessonActions}>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color={COLORS.warning} />
          <Text style={styles.ratingText}>{lesson.rating}</Text>
        </View>
        <Button
          mode={lesson.completed ? "outlined" : "contained"}
          onPress={() => handleLessonStart(lesson)}
          style={styles.lessonButton}
          buttonColor={lesson.completed ? 'transparent' : lesson.color}
        >
          {lesson.completed ? 'Review' : lesson.progress > 0 ? 'Continue' : 'Start'}
        </Button>
      </View>
    </Card>
  );

  const renderQuizCard = (quiz) => (
    <Card key={quiz.id} style={styles.quizCard}>
      <View style={styles.quizHeader}>
        <View style={styles.quizIcon}>
          <Icon name="quiz" size={28} color={COLORS.accent} />
          {quiz.completed && (
            <Badge style={styles.quizScore}>{quiz.score}%</Badge>
          )}
        </View>
        <View style={styles.quizInfo}>
          <Text style={TEXT_STYLES.h3}>{quiz.title}</Text>
          <Text style={TEXT_STYLES.caption}>{quiz.description}</Text>
          <View style={styles.quizMeta}>
            <Text style={styles.quizMetaText}>
              {quiz.questions} questions • {quiz.timeLimit} min • {quiz.difficulty}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.quizActions}>
        <View style={styles.quizPoints}>
          <Icon name="stars" size={16} color={COLORS.warning} />
          <Text style={styles.quizPointsText}>{quiz.points} XP</Text>
        </View>
        <Button
          mode="contained"
          onPress={() => handleQuizStart(quiz)}
          style={styles.quizButton}
          buttonColor={quiz.completed ? COLORS.success : COLORS.accent}
        >
          {quiz.completed ? 'View Results' : 'Take Quiz'}
        </Button>
      </View>
    </Card>
  );

  const renderAchievements = () => (
    <Surface style={styles.achievementsContainer}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
        Achievements 🏆
      </Text>
      <FlatList
        data={achievements}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[
            styles.achievementCard,
            item.earned && styles.achievementEarned
          ]}>
            <Icon
              name={item.icon}
              size={32}
              color={item.earned ? COLORS.warning : COLORS.textSecondary}
            />
            <Text style={[
              styles.achievementTitle,
              item.earned && styles.achievementTitleEarned
            ]}>
              {item.title}
            </Text>
            <Text style={styles.achievementDescription}>
              {item.description}
            </Text>
            {item.earned && (
              <View style={styles.achievementBadge}>
                <Icon name="check" size={16} color="white" />
              </View>
            )}
          </View>
        )}
      />
    </Surface>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'lessons':
        return (
          <View>
            {featuredLessons
              .filter(lesson => selectedCategory === 'all' || lesson.category === selectedCategory)
              .map(renderLessonCard)}
          </View>
        );
      case 'quizzes':
        return (
          <View>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
              Knowledge Challenges 🧠
            </Text>
            {quizzes.map(renderQuizCard)}
          </View>
        );
      case 'articles':
        return (
          <Surface style={styles.comingSoonContainer}>
            <Icon name="article" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { marginVertical: SPACING.md }]}>
              Articles Coming Soon! 📖
            </Text>
            <Text style={TEXT_STYLES.caption}>
              In-depth nutrition articles and research papers will be available here.
            </Text>
          </Surface>
        );
      case 'tools':
        return (
          <Surface style={styles.comingSoonContainer}>
            <Icon name="build" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { marginVertical: SPACING.md }]}>
              Interactive Tools Coming Soon! 🛠️
            </Text>
            <Text style={TEXT_STYLES.caption}>
              Calculators, meal planners, and other helpful tools will be available here.
            </Text>
          </Surface>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderTabNavigation()}
        {renderDailyTip()}
        {renderAchievements()}
        {activeTab === 'lessons' && renderCategoryFilters()}
        
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="search"
        style={styles.fab}
        onPress={() => Alert.alert('Search', 'Search through all nutrition content!')}
        label="Search"
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
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    marginTop: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
  },
  levelBadge: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  progressSection: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: SPACING.md,
    elevation: 2,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  levelProgressContainer: {
    marginTop: SPACING.sm,
  },
  levelProgressText: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  levelProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  levelProgressPoints: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  tabContainer: {
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    elevation: 2,
    paddingVertical: SPACING.sm,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: 20,
  },
  activeTabItem: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    marginLeft: SPACING.xs,
    ...TEXT_STYLES.caption,
  },
  activeTabLabel: {
    color: 'white',
  },
  dailyTipCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  dailyTipGradient: {
    padding: SPACING.md,
  },
  dailyTipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dailyTipTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    flex: 1,
  },
  dailyTipBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  dailyTipBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  dailyTipContent: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  dailyTipButton: {
    alignSelf: 'flex-start',
  },
  categoriesContainer: {
    marginBottom: SPACING.lg,
  },
  categoryCard: {
    alignItems: 'center',
    padding: SPACING.md,
    marginRight: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    minWidth: 100,
    elevation: 2,
  },
  activeCategoryCard: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}15`,
    marginBottom: SPACING.sm,
  },
  activeCategoryIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  activeCategoryLabel: {
    color: 'white',
  },
  categoryBadge: {
    backgroundColor: COLORS.textSecondary,
  },
  activeCategoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  contentContainer: {
    marginBottom: SPACING.xl,
  },
  lessonCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  lessonHeader: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  lessonThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  completedBadge: {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 2,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  metaChip: {
    height: 24,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  metaChipText: {
    fontSize: 10,
  },
  pointsChip: {
    backgroundColor: `${COLORS.warning}20`,
  },
  pointsChipText: {
    color: COLORS.warning,
    fontWeight: '600',
    fontSize: 10,
  },
  progressContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.small,
    marginBottom: SPACING.xs,
  },
  lessonProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  lessonActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  lessonButton: {
    minWidth: 100,
  },
  quizCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    elevation: 2,
    padding: SPACING.md,
  },
  quizHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  quizIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.accent}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  quizScore: {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
    backgroundColor: COLORS.success,
  },
  quizInfo: {
    flex: 1,
  },
  quizMeta: {
    marginTop: SPACING.xs,
  },
  quizMetaText: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  quizActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizPointsText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '600',
    color: COLORS.warning,
  },
  quizButton: {
    minWidth: 120,
  },
  achievementsContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  achievementCard: {
    alignItems: 'center',
    padding: SPACING.md,
    marginRight: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    width: 140,
    position: 'relative',
  },
  achievementEarned: {
    backgroundColor: `${COLORS.warning}15`,
    borderWidth: 2,
    borderColor: `${COLORS.warning}30`,
  },
  achievementTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
  },
  achievementTitleEarned: {
    color: COLORS.text,
  },
  achievementDescription: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  achievementBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: 16,
    elevation: 2,
    marginBottom: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default NutritionalEducation;
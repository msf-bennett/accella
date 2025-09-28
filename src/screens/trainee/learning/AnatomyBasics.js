import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const AutonomyBasics = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  const { progress, completedLessons } = useSelector(state => state.learning);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Autonomy basics data structure
  const autonomyLessons = [
    {
      id: 1,
      title: 'Understanding Your Why',
      description: 'Discover your personal motivation and set meaningful fitness goals',
      category: 'mindset',
      duration: '8 min',
      difficulty: 'Beginner',
      icon: 'psychology',
      completed: false,
      points: 50,
      badge: '🎯',
    },
    {
      id: 2,
      title: 'Self-Assessment Skills',
      description: 'Learn to evaluate your current fitness level and progress',
      category: 'assessment',
      duration: '12 min',
      difficulty: 'Beginner',
      icon: 'assessment',
      completed: true,
      points: 75,
      badge: '📊',
    },
    {
      id: 3,
      title: 'Creating Your Routine',
      description: 'Build sustainable workout habits that fit your lifestyle',
      category: 'planning',
      duration: '15 min',
      difficulty: 'Intermediate',
      icon: 'schedule',
      completed: false,
      points: 100,
      badge: '📅',
    },
    {
      id: 4,
      title: 'Listening to Your Body',
      description: 'Develop body awareness and learn when to push or rest',
      category: 'awareness',
      duration: '10 min',
      difficulty: 'Beginner',
      icon: 'favorite',
      completed: false,
      points: 60,
      badge: '❤️',
    },
    {
      id: 5,
      title: 'Progress Tracking',
      description: 'Master the art of monitoring and measuring your improvements',
      category: 'tracking',
      duration: '14 min',
      difficulty: 'Intermediate',
      icon: 'trending_up',
      completed: true,
      points: 85,
      badge: '📈',
    },
    {
      id: 6,
      title: 'Problem Solving',
      description: 'Overcome obstacles and adapt when things don\'t go as planned',
      category: 'resilience',
      duration: '11 min',
      difficulty: 'Advanced',
      icon: 'lightbulb',
      completed: false,
      points: 120,
      badge: '💡',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Topics', color: COLORS.primary },
    { id: 'mindset', name: 'Mindset', color: '#9c27b0' },
    { id: 'assessment', name: 'Assessment', color: '#ff9800' },
    { id: 'planning', name: 'Planning', color: '#4caf50' },
    { id: 'awareness', name: 'Awareness', color: '#f44336' },
    { id: 'tracking', name: 'Tracking', color: '#2196f3' },
    { id: 'resilience', name: 'Resilience', color: '#795548' },
  ];

  // Animation setup
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
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call for fresh data
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Content updated successfully! 🎉');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh content. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter lessons based on search and category
  const filteredLessons = autonomyLessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate progress
  const completedCount = autonomyLessons.filter(lesson => lesson.completed).length;
  const totalProgress = (completedCount / autonomyLessons.length) * 100;
  const totalPoints = autonomyLessons
    .filter(lesson => lesson.completed)
    .reduce((sum, lesson) => sum + lesson.points, 0);

  // Handle lesson selection
  const handleLessonPress = (lesson) => {
    if (lesson.completed) {
      Alert.alert(
        'Lesson Completed! ✅',
        `You've already completed "${lesson.title}". Would you like to review it again?`,
        [
          { text: 'Maybe Later', style: 'cancel' },
          { 
            text: 'Review Again', 
            onPress: () => Alert.alert('Feature Coming Soon', 'Lesson review functionality will be available in the next update! 🚀')
          },
        ]
      );
    } else {
      Alert.alert(
        'Start Lesson? 🚀',
        `Ready to begin "${lesson.title}"?\n\nEstimated time: ${lesson.duration}\nDifficulty: ${lesson.difficulty}`,
        [
          { text: 'Not Now', style: 'cancel' },
          { 
            text: 'Let\'s Go!', 
            onPress: () => Alert.alert('Feature Coming Soon', 'Interactive lessons will be available soon! 📚')
          },
        ]
      );
    }
  };

  // Render lesson card
  const renderLessonCard = (lesson) => (
    <TouchableOpacity
      key={lesson.id}
      onPress={() => handleLessonPress(lesson)}
      style={styles.lessonCard}
    >
      <Card style={[styles.card, lesson.completed && styles.completedCard]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.lessonHeader}>
            <Surface style={[styles.iconContainer, { backgroundColor: lesson.completed ? COLORS.success + '20' : COLORS.primary + '20' }]}>
              <Icon 
                name={lesson.icon} 
                size={24} 
                color={lesson.completed ? COLORS.success : COLORS.primary} 
              />
            </Surface>
            <View style={styles.lessonInfo}>
              <Text style={[TEXT_STYLES.h3, styles.lessonTitle]}>{lesson.title}</Text>
              <Text style={[TEXT_STYLES.body, styles.lessonDescription]} numberOfLines={2}>
                {lesson.description}
              </Text>
            </View>
            {lesson.completed && (
              <Icon name="check-circle" size={28} color={COLORS.success} />
            )}
          </View>
          
          <View style={styles.lessonMeta}>
            <View style={styles.metaRow}>
              <Chip 
                icon="access-time" 
                mode="outlined" 
                compact
                style={styles.metaChip}
                textStyle={styles.chipText}
              >
                {lesson.duration}
              </Chip>
              <Chip 
                icon="trending-up" 
                mode="outlined" 
                compact
                style={styles.metaChip}
                textStyle={styles.chipText}
              >
                {lesson.difficulty}
              </Chip>
              <Chip 
                icon="stars" 
                mode="outlined" 
                compact
                style={[styles.metaChip, styles.pointsChip]}
                textStyle={styles.pointsText}
              >
                {lesson.points} pts
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>Autonomy Basics</Text>
            <IconButton
              icon="info"
              iconColor="white"
              size={24}
              onPress={() => Alert.alert(
                'About Autonomy Training 🎯',
                'Learn the fundamental skills to become an independent, self-directed trainee. These lessons will help you take ownership of your fitness journey and make informed decisions about your training.'
              )}
            />
          </View>
          
          {/* Progress Overview */}
          <Surface style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={[TEXT_STYLES.h3, styles.progressTitle]}>Your Progress</Text>
              <Text style={[TEXT_STYLES.h2, styles.progressPercentage]}>{Math.round(totalProgress)}%</Text>
            </View>
            <ProgressBar 
              progress={totalProgress / 100} 
              color={COLORS.success} 
              style={styles.progressBar}
            />
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{completedCount}/{autonomyLessons.length}</Text>
                <Text style={styles.statLabel}>Lessons</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalPoints}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>🏆 {completedCount >= 3 ? 'Achiever' : 'Beginner'}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
            </View>
          </Surface>
        </Animated.View>
      </LinearGradient>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search lessons..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map(category => (
            <Chip
              key={category.id}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && { backgroundColor: category.color + '20' }
              ]}
              selectedColor={category.color}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === category.id && { color: category.color }
              ]}
            >
              {category.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Lessons List */}
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
      >
        <Animated.View 
          style={[
            styles.lessonsContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          {filteredLessons.length > 0 ? (
            filteredLessons.map(renderLessonCard)
          ) : (
            <Surface style={styles.emptyState}>
              <Icon name="search-off" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>No lessons found</Text>
              <Text style={[TEXT_STYLES.body, styles.emptyDescription]}>
                Try adjusting your search terms or category filter
              </Text>
            </Surface>
          )}
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => Alert.alert(
          'Quick Start! 🚀',
          'Want to jump into your next lesson? We recommend starting with your incomplete lessons first!',
          [
            { text: 'Maybe Later', style: 'cancel' },
            { 
              text: 'Find Next Lesson', 
              onPress: () => {
                const nextLesson = autonomyLessons.find(lesson => !lesson.completed);
                if (nextLesson) {
                  handleLessonPress(nextLesson);
                } else {
                  Alert.alert('Congratulations! 🎉', 'You\'ve completed all autonomy basics lessons!');
                }
              }
            },
          ]
        )}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.fabGradient}
        >
          <Icon name="play-arrow" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  progressCard: {
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressTitle: {
    color: COLORS.textPrimary,
  },
  progressPercentage: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  categoryScroll: {
    marginBottom: SPACING.sm,
  },
  categoryContainer: {
    paddingRight: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  categoryChipText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  lessonsContainer: {
    padding: SPACING.md,
  },
  lessonCard: {
    marginBottom: SPACING.md,
  },
  card: {
    elevation: 3,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  completedCard: {
    backgroundColor: COLORS.success + '10',
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  cardContent: {
    padding: SPACING.md,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    elevation: 2,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lessonDescription: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  lessonMeta: {
    marginTop: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    height: 32,
  },
  chipText: {
    fontSize: 12,
  },
  pointsChip: {
    backgroundColor: COLORS.primary + '20',
  },
  pointsText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: 12,
    elevation: 2,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.md,
    borderRadius: 28,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AutonomyBasics;
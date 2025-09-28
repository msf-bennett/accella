import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Text,
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';
import PlaceholderScreen from '../components/PlaceholderScreen';

const { width: screenWidth } = Dimensions.get('window');

const NutritionEducation = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, userRole } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Nutrition education categories
  const categories = [
    { id: 'all', label: 'All Topics', icon: 'library-books', color: COLORS.primary },
    { id: 'macros', label: 'Macronutrients', icon: 'pie-chart', color: '#FF6B6B' },
    { id: 'hydration', label: 'Hydration', icon: 'water-drop', color: '#4ECDC4' },
    { id: 'timing', label: 'Meal Timing', icon: 'schedule', color: '#45B7D1' },
    { id: 'supplements', label: 'Supplements', icon: 'medication', color: '#96CEB4' },
    { id: 'recovery', label: 'Recovery Nutrition', icon: 'healing', color: '#FECA57' },
    { id: 'planning', label: 'Meal Planning', icon: 'restaurant-menu', color: '#FF9FF3' },
  ];

  // Comprehensive nutrition topics
  const nutritionTopics = [
    {
      id: 1,
      title: 'Understanding Macronutrients',
      category: 'macros',
      difficulty: 'Beginner',
      duration: '15 min',
      points: 100,
      description: 'Master the fundamentals of proteins, carbohydrates, and fats for optimal performance.',
      modules: [
        'Protein: Building Blocks of Muscle 💪',
        'Carbohydrates: Fuel for Performance ⚡',
        'Fats: Essential for Health 🥑',
        'Calculating Macro Ratios 📊'
      ],
      completed: false,
      progress: 0.75,
      icon: 'pie-chart',
    },
    {
      id: 2,
      title: 'Pre & Post Workout Nutrition',
      category: 'timing',
      difficulty: 'Intermediate',
      duration: '20 min',
      points: 150,
      description: 'Optimize performance and recovery through strategic nutrient timing.',
      modules: [
        'Pre-Workout Fuel Strategy 🚀',
        'During Training Hydration 💧',
        'Post-Workout Recovery Window ⏰',
        'Sample Meal Plans 📋'
      ],
      completed: true,
      progress: 1.0,
      icon: 'schedule',
    },
    {
      id: 3,
      title: 'Hydration Science & Strategy',
      category: 'hydration',
      difficulty: 'Beginner',
      duration: '12 min',
      points: 80,
      description: 'Learn the critical role of proper hydration in athletic performance.',
      modules: [
        'Daily Hydration Needs 📏',
        'Exercise Hydration Guidelines 🏃‍♂️',
        'Electrolyte Balance ⚖️',
        'Signs of Dehydration 🚨'
      ],
      completed: false,
      progress: 0.25,
      icon: 'water-drop',
    },
    {
      id: 4,
      title: 'Supplement Essentials',
      category: 'supplements',
      difficulty: 'Advanced',
      duration: '25 min',
      points: 200,
      description: 'Navigate the world of sports supplements with evidence-based recommendations.',
      modules: [
        'Proven Performance Supplements 🏆',
        'Protein Powder Selection 🥤',
        'Creatine: The Science 🧬',
        'Safety & Quality Standards ✅'
      ],
      completed: false,
      progress: 0.0,
      icon: 'medication',
    },
    {
      id: 5,
      title: 'Recovery Nutrition Protocols',
      category: 'recovery',
      difficulty: 'Intermediate',
      duration: '18 min',
      points: 120,
      description: 'Accelerate recovery and adaptation through targeted nutrition strategies.',
      modules: [
        'The Recovery Window 🕐',
        'Anti-Inflammatory Foods 🍓',
        'Sleep & Nutrition Connection 😴',
        'Recovery Meal Ideas 🍽️'
      ],
      completed: false,
      progress: 0.5,
      icon: 'healing',
    },
    {
      id: 6,
      title: 'Meal Planning Mastery',
      category: 'planning',
      difficulty: 'Intermediate',
      duration: '30 min',
      points: 180,
      description: 'Create sustainable meal plans that support training goals and lifestyle.',
      modules: [
        'Goal-Based Planning 🎯',
        'Batch Cooking Strategies 👨‍🍳',
        'Budget-Friendly Options 💰',
        'Client Meal Plan Templates 📄'
      ],
      completed: false,
      progress: 0.1,
      icon: 'restaurant-menu',
    },
  ];

  // Filter topics based on category and search
  const filteredTopics = nutritionTopics.filter(topic => {
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Load user progress
    loadUserProgress();
  }, []);

  const loadUserProgress = () => {
    // Simulate loading user progress from local storage or API
    const progress = {
      totalTopics: nutritionTopics.length,
      completedTopics: nutritionTopics.filter(t => t.completed).length,
      totalPoints: 280,
      currentStreak: 5,
    };
    setUserProgress(progress);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      loadUserProgress();
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handleTopicPress = (topic) => {
    Vibration.vibrate(50);
    setSelectedTopic(topic);
    setShowModal(true);
  };

  const handleStartLesson = (topic) => {
    Alert.alert(
      'Start Lesson 📚',
      `Ready to begin "${topic.title}"? This lesson takes approximately ${topic.duration} and awards ${topic.points} points upon completion.`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        { 
          text: 'Start Learning! 🚀', 
          onPress: () => {
            setShowModal(false);
            // Navigate to lesson content or show placeholder
            Alert.alert('Feature Coming Soon! 🚧', 'Detailed lesson content is being developed.');
          }
        }
      ]
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return '#4ECDC4';
      case 'Intermediate': return '#FFE66D';
      case 'Advanced': return '#FF6B6B';
      default: return COLORS.primary;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
            Nutrition Education 📚
          </Text>
          <IconButton
            icon="account-circle"
            iconColor="white"
            size={28}
            onPress={() => Alert.alert('Profile', 'Profile feature coming soon!')}
          />
        </View>
        
        {/* Progress Overview */}
        <Surface style={styles.progressCard} elevation={2}>
          <View style={styles.progressHeader}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              Your Progress 📈
            </Text>
            <Chip
              mode="outlined"
              textStyle={{ color: COLORS.success, fontWeight: 'bold' }}
              style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}
            >
              🔥 {userProgress.currentStreak} day streak
            </Chip>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Completed
              </Text>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                {userProgress.completedTopics}/{userProgress.totalTopics}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Points Earned
              </Text>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
                {userProgress.totalPoints} ⭐
              </Text>
            </View>
          </View>
          
          <ProgressBar
            progress={userProgress.completedTopics / userProgress.totalTopics}
            color={COLORS.primary}
            style={styles.overallProgress}
          />
        </Surface>
      </View>
    </LinearGradient>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categorySection}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
        Learning Categories 🎯
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => {
              setSelectedCategory(category.id);
              Vibration.vibrate(30);
            }}
            style={[
              styles.categoryCard,
              selectedCategory === category.id && styles.categoryCardSelected
            ]}
          >
            <LinearGradient
              colors={selectedCategory === category.id 
                ? [category.color, category.color + '80'] 
                : ['#f8f9fa', '#ffffff']
              }
              style={styles.categoryGradient}
            >
              <Icon
                name={category.icon}
                size={24}
                color={selectedCategory === category.id ? 'white' : category.color}
              />
              <Text style={[
                TEXT_STYLES.caption,
                {
                  color: selectedCategory === category.id ? 'white' : COLORS.textPrimary,
                  fontWeight: selectedCategory === category.id ? 'bold' : 'normal'
                }
              ]}>
                {category.label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTopicCard = (topic) => (
    <TouchableOpacity
      key={topic.id}
      onPress={() => handleTopicPress(topic)}
      style={styles.topicCardContainer}
    >
      <Card style={styles.topicCard} elevation={3}>
        <View style={styles.topicHeader}>
          <View style={styles.topicIcon}>
            <Icon name={topic.icon} size={28} color={COLORS.primary} />
          </View>
          <View style={styles.topicMeta}>
            <Chip
              mode="outlined"
              textStyle={{ fontSize: 10, color: getDifficultyColor(topic.difficulty) }}
              style={{
                backgroundColor: `${getDifficultyColor(topic.difficulty)}20`,
                height: 24,
              }}
            >
              {topic.difficulty}
            </Chip>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {topic.duration} • {topic.points} pts
            </Text>
          </View>
        </View>

        <View style={styles.topicContent}>
          <Text style={[TEXT_STYLES.h3, styles.topicTitle]}>
            {topic.title}
          </Text>
          <Text style={[TEXT_STYLES.body, styles.topicDescription]}>
            {topic.description}
          </Text>

          <View style={styles.modulesList}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: 8 }]}>
              What you'll learn:
            </Text>
            {topic.modules.slice(0, 2).map((module, index) => (
              <Text key={index} style={[TEXT_STYLES.caption, styles.moduleItem]}>
                • {module}
              </Text>
            ))}
            {topic.modules.length > 2 && (
              <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                +{topic.modules.length - 2} more modules...
              </Text>
            )}
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Progress: {Math.round(topic.progress * 100)}%
              </Text>
              {topic.completed && (
                <Chip
                  mode="outlined"
                  icon="check-circle"
                  textStyle={{ color: COLORS.success, fontSize: 10 }}
                  style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', height: 24 }}
                >
                  Completed ✓
                </Chip>
              )}
            </View>
            <ProgressBar
              progress={topic.progress}
              color={topic.completed ? COLORS.success : COLORS.primary}
              style={styles.topicProgress}
            />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderModal = () => (
    <Portal>
      {showModal && selectedTopic && (
        <BlurView
          style={styles.modalOverlay}
          blurType="dark"
          blurAmount={5}
          reducedTransparencyFallbackColor="rgba(0,0,0,0.8)"
        >
          <View style={styles.modalContent}>
            <Card style={styles.modalCard} elevation={8}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.modalHeader}
              >
                <IconButton
                  icon="close"
                  iconColor="white"
                  size={24}
                  onPress={() => setShowModal(false)}
                  style={styles.closeButton}
                />
                <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center' }]}>
                  {selectedTopic.title}
                </Text>
                <View style={styles.modalMeta}>
                  <Chip
                    mode="outlined"
                    textStyle={{ color: 'white', fontSize: 12 }}
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    {selectedTopic.difficulty}
                  </Chip>
                  <Text style={[TEXT_STYLES.body, { color: 'white' }]}>
                    {selectedTopic.duration} • {selectedTopic.points} points
                  </Text>
                </View>
              </LinearGradient>

              <View style={styles.modalBody}>
                <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
                  {selectedTopic.description}
                </Text>

                <Text style={[TEXT_STYLES.h3, { marginBottom: 12 }]}>
                  Learning Modules 📋
                </Text>
                {selectedTopic.modules.map((module, index) => (
                  <View key={index} style={styles.modalModule}>
                    <Icon name="play-circle-filled" size={20} color={COLORS.primary} />
                    <Text style={[TEXT_STYLES.body, { marginLeft: 12, flex: 1 }]}>
                      {module}
                    </Text>
                  </View>
                ))}

                <Button
                  mode="contained"
                  onPress={() => handleStartLesson(selectedTopic)}
                  style={styles.startButton}
                  contentStyle={{ paddingVertical: 8 }}
                  buttonColor={COLORS.primary}
                >
                  {selectedTopic.completed ? 'Review Lesson 🔄' : 'Start Learning 🚀'}
                </Button>
              </View>
            </Card>
          </View>
        </BlurView>
      )}
    </Portal>
  );

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
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
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        <View style={styles.content}>
          <Searchbar
            placeholder="Search nutrition topics... 🔍"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={TEXT_STYLES.body}
          />

          {renderCategoryFilter()}

          <View style={styles.topicsSection}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              {selectedCategory === 'all' ? 'All Topics' : 
               categories.find(c => c.id === selectedCategory)?.label} 
              ({filteredTopics.length})
            </Text>

            {filteredTopics.length === 0 ? (
              <PlaceholderScreen
                title="No Topics Found"
                subtitle="Try adjusting your search or category filter"
                icon="search-off"
              />
            ) : (
              filteredTopics.map(renderTopicCard)
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {renderModal()}

      <FAB
        style={styles.fab}
        icon="bookmark-plus"
        onPress={() => Alert.alert('Save Progress', 'Bookmark feature coming soon! 🔖')}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerContent: {
    paddingHorizontal: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  progressCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  overallProgress: {
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  searchBar: {
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  categorySection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  categoryScroll: {
    paddingRight: SPACING.lg,
  },
  categoryCard: {
    marginRight: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryCardSelected: {
    elevation: 4,
  },
  categoryGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    height: 70,
    borderRadius: 12,
  },
  topicsSection: {
    marginBottom: SPACING.xl,
  },
  topicCardContainer: {
    marginBottom: SPACING.lg,
  },
  topicCard: {
    padding: SPACING.lg,
    borderRadius: 16,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  topicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicMeta: {
    alignItems: 'flex-end',
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
  },
  topicDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  modulesList: {
    marginBottom: SPACING.md,
  },
  moduleItem: {
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  progressSection: {
    marginTop: SPACING.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicProgress: {
    height: 6,
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
  },
  modalCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  modalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  modalDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  modalModule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  startButton: {
    marginTop: SPACING.lg,
    borderRadius: 12,
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

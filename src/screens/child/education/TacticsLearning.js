import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Searchbar,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const TacticsLearning = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('Football');
  const [selectedLevel, setSelectedLevel] = useState('Beginner');
  const [showFilters, setShowFilters] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [tacticsData, setTacticsData] = useState({});
  const [userProgress, setUserProgress] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for tactics learning
  const mockTacticsData = {
    featuredLessons: [
      {
        id: 1,
        title: 'Basic Passing Patterns',
        sport: 'Football',
        level: 'Beginner',
        duration: '15 min',
        lessons: 8,
        completed: 3,
        description: 'Learn fundamental passing techniques and patterns',
        thumbnail: 'https://example.com/passing.jpg',
        difficulty: 'Easy',
        skills: ['Short Passing', 'Through Balls', 'Wing Play'],
        coach: 'Coach Martinez',
        rating: 4.8,
        students: 245,
      },
      {
        id: 2,
        title: 'Defensive Positioning',
        sport: 'Football',
        level: 'Intermediate',
        duration: '20 min',
        lessons: 12,
        completed: 0,
        description: 'Master defensive formations and positioning',
        thumbnail: 'https://example.com/defense.jpg',
        difficulty: 'Medium',
        skills: ['Man Marking', 'Zone Defense', 'Offside Trap'],
        coach: 'Coach Thompson',
        rating: 4.9,
        students: 189,
      },
    ],
    categories: [
      {
        id: 1,
        name: 'Attacking',
        icon: 'sports-soccer',
        color: '#FF6B6B',
        lessons: 24,
        description: 'Offensive strategies and scoring techniques',
        progress: 65,
      },
      {
        id: 2,
        name: 'Defending',
        icon: 'shield',
        color: '#4ECDC4',
        lessons: 18,
        description: 'Defensive formations and tactics',
        progress: 40,
      },
      {
        id: 3,
        name: 'Midfield',
        icon: 'swap-horiz',
        color: '#45B7D1',
        lessons: 20,
        description: 'Control the game from the middle',
        progress: 55,
      },
      {
        id: 4,
        name: 'Set Pieces',
        icon: 'flag',
        color: '#96CEB4',
        lessons: 15,
        description: 'Free kicks, corners, and penalties',
        progress: 30,
      },
    ],
    lessons: [
      {
        id: 1,
        title: '4-4-2 Formation Basics',
        category: 'Formation',
        sport: 'Football',
        level: 'Beginner',
        duration: '12 min',
        type: 'Interactive',
        completed: true,
        rating: 4.7,
        description: 'Learn the fundamentals of 4-4-2 formation',
        keyPoints: ['Player Positioning', 'Movement Patterns', 'Transition Play'],
        preview: 'Understand how 4-4-2 formation works in modern football',
      },
      {
        id: 2,
        title: 'Counter Attack Strategies',
        category: 'Attacking',
        sport: 'Football',
        level: 'Intermediate',
        duration: '18 min',
        type: 'Video Analysis',
        completed: false,
        rating: 4.9,
        description: 'Master the art of quick counter attacks',
        keyPoints: ['Speed of Play', 'Decision Making', 'Finishing'],
        preview: 'Learn how to exploit spaces left by opposing teams',
      },
      {
        id: 3,
        title: 'Pressing Triggers',
        category: 'Defending',
        sport: 'Football',
        level: 'Advanced',
        duration: '25 min',
        type: 'Tactical Board',
        completed: false,
        rating: 4.8,
        description: 'When and how to press effectively',
        keyPoints: ['Trigger Points', 'Team Coordination', 'Recovery'],
        preview: 'Understand when to apply high press vs low press',
      },
    ],
    achievements: [
      {
        id: 1,
        title: 'First Lesson Complete',
        description: 'Completed your first tactics lesson',
        icon: 'school',
        unlocked: true,
        date: '2024-08-20',
      },
      {
        id: 2,
        title: 'Formation Master',
        description: 'Completed all formation lessons',
        icon: 'military-tech',
        unlocked: false,
        progress: 60,
      },
    ],
  };

  const sportOptions = ['Football', 'Basketball', 'Tennis', 'Swimming'];
  const levelOptions = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = useCallback(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTacticsData(mockTacticsData);
      setUserProgress({
        totalLessons: 45,
        completedLessons: 12,
        currentStreak: 5,
        totalPoints: 850,
      });
      setLoading(false);
      
      // Animate screen entrance
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
    }, 1000);
  }, [fadeAnim, slideAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Updated', 'Tactics content refreshed successfully! 🎯');
    }, 1500);
  }, []);

  const handleLessonPress = (lesson) => {
    setSelectedLesson(lesson);
    setShowLessonModal(true);
  };

  const handleStartLesson = (lesson) => {
    Alert.alert(
      '🎓 Start Lesson',
      `Begin "${lesson.title}"?\n\nDuration: ${lesson.duration}\nLevel: ${lesson.level}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Learning', onPress: () => console.log('Navigate to lesson content') }
      ]
    );
  };

  const handleCategoryPress = (category) => {
    Alert.alert(
      '📚 Category Details',
      `Explore ${category.name} tactics?\n\n${category.description}\n\nLessons available: ${category.lessons}\nYour progress: ${category.progress}%`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Explore', onPress: () => console.log(`Navigate to ${category.name} category`) }
      ]
    );
  };

  const renderProgressCard = () => (
    <Card style={styles.progressCard} elevation={3}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.progressGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.progressTitle}>Your Learning Progress 🎯</Text>
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{userProgress.completedLessons}</Text>
            <Text style={styles.progressLabel}>Lessons</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{userProgress.currentStreak}</Text>
            <Text style={styles.progressLabel}>Day Streak</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{userProgress.totalPoints}</Text>
            <Text style={styles.progressLabel}>Points</Text>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarHeader}>
            <Text style={styles.progressBarLabel}>Overall Progress</Text>
            <Text style={styles.progressPercentage}>
              {Math.round((userProgress.completedLessons / userProgress.totalLessons) * 100)}%
            </Text>
          </View>
          <ProgressBar
            progress={userProgress.completedLessons / userProgress.totalLessons}
            color="white"
            style={styles.progressBar}
          />
        </View>
      </LinearGradient>
    </Card>
  );

  const renderFeaturedLesson = ({ item }) => (
    <Card style={styles.featuredCard} elevation={3}>
      <TouchableOpacity onPress={() => handleLessonPress(item)}>
        <View style={styles.featuredImageContainer}>
          <LinearGradient
            colors={[`${COLORS.primary}80`, COLORS.primary]}
            style={styles.featuredGradient}
          >
            <Icon name="play-circle-filled" size={60} color="white" />
          </LinearGradient>
          <View style={styles.featuredBadge}>
            <Chip mode="flat" textStyle={styles.badgeText} style={styles.levelBadge}>
              {item.level}
            </Chip>
          </View>
        </View>
        
        <Card.Content style={styles.featuredContent}>
          <Text style={styles.featuredTitle}>{item.title}</Text>
          <Text style={styles.featuredDescription}>{item.description}</Text>
          
          <View style={styles.featuredMeta}>
            <View style={styles.metaItem}>
              <Icon name="schedule" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{item.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="book" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{item.lessons} lessons</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.metaText}>{item.rating}</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Progress: {item.completed}/{item.lessons}
            </Text>
            <ProgressBar
              progress={item.completed / item.lessons}
              color={COLORS.primary}
              style={styles.lessonProgress}
            />
          </View>
          
          <View style={styles.skillsContainer}>
            {item.skills.map((skill, index) => (
              <Chip
                key={index}
                mode="outlined"
                compact
                style={styles.skillChip}
                textStyle={styles.skillText}
              >
                {skill}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity onPress={() => handleCategoryPress(item)}>
      <Surface style={styles.categoryCard} elevation={2}>
        <LinearGradient
          colors={[item.color, `${item.color}80`]}
          style={styles.categoryGradient}
        >
          <Icon name={item.icon} size={40} color="white" />
          <Text style={styles.categoryTitle}>{item.name}</Text>
          <Text style={styles.categoryDescription}>{item.description}</Text>
          
          <View style={styles.categoryFooter}>
            <Text style={styles.categoryLessons}>{item.lessons} lessons</Text>
            <View style={styles.categoryProgress}>
              <ProgressBar
                progress={item.progress / 100}
                color="rgba(255,255,255,0.8)"
                style={styles.categoryProgressBar}
              />
              <Text style={styles.categoryProgressText}>{item.progress}%</Text>
            </View>
          </View>
        </LinearGradient>
      </Surface>
    </TouchableOpacity>
  );

  const renderLesson = ({ item }) => (
    <Card style={styles.lessonCard} elevation={2}>
      <TouchableOpacity onPress={() => handleLessonPress(item)}>
        <Card.Content style={styles.lessonContent}>
          <View style={styles.lessonHeader}>
            <View style={styles.lessonIcon}>
              <Icon
                name={item.completed ? 'check-circle' : 'play-circle-outline'}
                size={24}
                color={item.completed ? COLORS.success : COLORS.primary}
              />
            </View>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{item.title}</Text>
              <Text style={styles.lessonCategory}>{item.category}</Text>
            </View>
            <View style={styles.lessonMeta}>
              <Chip
                mode="outlined"
                compact
                style={styles.typeChip}
                textStyle={styles.typeText}
              >
                {item.type}
              </Chip>
            </View>
          </View>
          
          <Text style={styles.lessonPreview}>{item.preview}</Text>
          
          <View style={styles.lessonDetails}>
            <View style={styles.detailItem}>
              <Icon name="schedule" size={14} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{item.duration}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="signal-cellular-alt" size={14} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{item.level}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.detailText}>{item.rating}</Text>
            </View>
          </View>
          
          <View style={styles.keyPointsContainer}>
            <Text style={styles.keyPointsTitle}>Key Points:</Text>
            <View style={styles.keyPoints}>
              {item.keyPoints.map((point, index) => (
                <Text key={index} style={styles.keyPoint}>• {point}</Text>
              ))}
            </View>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const LessonModal = () => (
    <Modal
      visible={showLessonModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLessonModal(false)}
    >
      <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
        <View style={styles.modalContainer}>
          <Surface style={styles.lessonModal} elevation={5}>
            {selectedLesson && (
              <>
                <View style={styles.modalHeader}>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowLessonModal(false)}
                    style={styles.closeButton}
                  />
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.modalHeaderGradient}
                  >
                    <Icon name="school" size={50} color="white" />
                    <Text style={styles.modalTitle}>{selectedLesson.title}</Text>
                    <Text style={styles.modalSubtitle}>{selectedLesson.category} • {selectedLesson.level}</Text>
                  </LinearGradient>
                </View>
                
                <ScrollView style={styles.modalContent}>
                  <Text style={styles.modalDescription}>
                    {selectedLesson.description}
                  </Text>
                  
                  <View style={styles.modalMeta}>
                    <View style={styles.modalMetaItem}>
                      <Icon name="schedule" size={20} color={COLORS.primary} />
                      <Text style={styles.modalMetaText}>Duration: {selectedLesson.duration}</Text>
                    </View>
                    <View style={styles.modalMetaItem}>
                      <Icon name="play-circle-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.modalMetaText}>Type: {selectedLesson.type}</Text>
                    </View>
                    <View style={styles.modalMetaItem}>
                      <Icon name="star" size={20} color="#FFD700" />
                      <Text style={styles.modalMetaText}>Rating: {selectedLesson.rating}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.keyPointsSection}>
                    <Text style={styles.sectionTitle}>What You'll Learn:</Text>
                    {selectedLesson.keyPoints?.map((point, index) => (
                      <View key={index} style={styles.keyPointItem}>
                        <Icon name="check-circle" size={16} color={COLORS.success} />
                        <Text style={styles.keyPointText}>{point}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                
                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => Alert.alert('Bookmark', 'Lesson bookmarked for later!')}
                    style={styles.bookmarkButton}
                    icon="bookmark-outline"
                  >
                    Bookmark
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleStartLesson(selectedLesson)}
                    buttonColor={COLORS.primary}
                    style={styles.startButton}
                    icon="play-arrow"
                  >
                    Start Lesson
                  </Button>
                </View>
              </>
            )}
          </Surface>
        </View>
      </BlurView>
    </Modal>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
        <View style={styles.modalContainer}>
          <Surface style={styles.filterModal} elevation={5}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter Lessons 🎯</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowFilters(false)}
              />
            </View>
            
            <ScrollView style={styles.filterContent}>
              <Text style={styles.filterSectionTitle}>Sport</Text>
              <View style={styles.chipContainer}>
                {sportOptions.map((sport) => (
                  <Chip
                    key={sport}
                    selected={selectedSport === sport}
                    onPress={() => setSelectedSport(sport)}
                    style={[
                      styles.filterChip,
                      selectedSport === sport && styles.selectedChip
                    ]}
                  >
                    {sport}
                  </Chip>
                ))}
              </View>
              
              <Text style={styles.filterSectionTitle}>Level</Text>
              <View style={styles.chipContainer}>
                {levelOptions.map((level) => (
                  <Chip
                    key={level}
                    selected={selectedLevel === level}
                    onPress={() => setSelectedLevel(level)}
                    style={[
                      styles.filterChip,
                      selectedLevel === level && styles.selectedChip
                    ]}
                  >
                    {level}
                  </Chip>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setSelectedSport('Football');
                  setSelectedLevel('Beginner');
                }}
                style={styles.clearButton}
              >
                Reset
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilters(false)}
                buttonColor={COLORS.primary}
                style={styles.applyButton}
              >
                Apply
              </Button>
            </View>
          </Surface>
        </View>
      </BlurView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingGradient}>
          <Icon name="school" size={60} color="white" />
          <Text style={styles.loadingTitle}>Loading Tactics Library</Text>
          <Text style={styles.loadingSubtitle}>Preparing your learning content 🎓</Text>
          <ProgressBar
            indeterminate
            color="white"
            style={styles.loadingProgress}
          />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Tactics Learning 🎓</Text>
        <Text style={styles.headerSubtitle}>Master sports tactics through interactive lessons</Text>
        
        <Searchbar
          placeholder="Search tactics, formations, strategies..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
        
        <View style={styles.quickFilters}>
          <Chip
            selected={selectedSport !== 'Football'}
            onPress={() => setShowFilters(true)}
            icon="sports"
            style={styles.filterChip}
          >
            {selectedSport}
          </Chip>
          <Chip
            selected={selectedLevel !== 'Beginner'}
            onPress={() => setShowFilters(true)}
            icon="signal-cellular-alt"
            style={styles.filterChip}
          >
            {selectedLevel}
          </Chip>
        </View>
      </LinearGradient>

      <ScrollView
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
      >
        <Animated.View
          style={[
            styles.animatedContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Progress Card */}
          {renderProgressCard()}

          {/* Featured Lessons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌟 Featured Lessons</Text>
            <FlatList
              data={tacticsData.featuredLessons}
              renderItem={renderFeaturedLesson}
              keyExtractor={(item) => `featured-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>

          {/* Learning Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 Learning Categories</Text>
            <FlatList
              data={tacticsData.categories}
              renderItem={renderCategory}
              keyExtractor={(item) => `category-${item.id}`}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.categoriesGrid}
              columnWrapperStyle={styles.categoryRow}
            />
          </View>

          {/* Recent Lessons */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📖 All Lessons</Text>
              <TouchableOpacity onPress={() => Alert.alert('View All', 'Navigate to full lessons library')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={tacticsData.lessons}
              renderItem={renderLesson}
              keyExtractor={(item) => `lesson-${item.id}`}
              scrollEnabled={false}
              contentContainerStyle={styles.lessonsList}
            />
          </View>
        </Animated.View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="tune"
        onPress={() => setShowFilters(true)}
        color="white"
      />

      <LessonModal />
      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  loadingSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  loadingProgress: {
    marginTop: SPACING.xl,
    width: 200,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.lg,
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  quickFilters: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
  },
  animatedContent: {
    flex: 1,
    paddingVertical: SPACING.lg,
  },
  progressCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressGradient: {
    padding: SPACING.lg,
  },
  progressTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.xs,
  },
  progressBarContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.md,
    borderRadius: 12,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressBarLabel: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: '600',
  },
  progressPercentage: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  viewAllText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  featuredList: {
    paddingLeft: SPACING.lg,
  },
  featuredCard: {
    width: 300,
    marginRight: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  featuredImageContainer: {
    height: 180,
    position: 'relative',
  },
  featuredGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  featuredContent: {
    padding: SPACING.lg,
  },
  featuredTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  featuredDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  featuredMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  lessonProgress: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  skillChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: COLORS.primary,
  },
  skillText: {
    fontSize: 11,
    color: COLORS.primary,
  },
  categoriesGrid: {
    paddingHorizontal: SPACING.lg,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  categoryCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  categoryGradient: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  categoryTitle: {
    ...TEXT_STYLES.h4,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  categoryDescription: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    flex: 1,
    marginTop: SPACING.xs,
  },
  categoryFooter: {
    marginTop: SPACING.sm,
  },
  categoryLessons: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.xs,
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  categoryProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  categoryProgressText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '600',
    minWidth: 30,
  },
  lessonsList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  lessonCard: {
    borderRadius: 12,
    backgroundColor: 'white',
  },
  lessonContent: {
    padding: SPACING.md,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  lessonIcon: {
    marginRight: SPACING.md,
    paddingTop: SPACING.xs,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  lessonCategory: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  lessonMeta: {
    alignItems: 'flex-end',
  },
  typeChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  lessonPreview: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  lessonDetails: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  keyPointsContainer: {
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    padding: SPACING.md,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  keyPointsTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  keyPoints: {
    gap: SPACING.xs,
  },
  keyPoint: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  blurContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  lessonModal: {
    backgroundColor: 'white',
    borderRadius: 25,
    maxWidth: width - SPACING.lg * 2,
    width: '100%',
    maxHeight: height * 0.9,
    overflow: 'hidden',
  },
  modalHeader: {
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modalHeaderGradient: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  modalContent: {
    padding: SPACING.lg,
    maxHeight: height * 0.5,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  modalMeta: {
    marginBottom: SPACING.xl,
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  modalMetaText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
  },
  keyPointsSection: {
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    padding: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  keyPointText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bookmarkButton: {
    flex: 1,
    borderColor: COLORS.primary,
  },
  startButton: {
    flex: 2,
  },
  filterModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: height * 0.6,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
  },
  filterContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    maxHeight: height * 0.35,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  clearButton: {
    flex: 1,
    borderColor: COLORS.textSecondary,
  },
  applyButton: {
    flex: 1,
  },
});

export default TacticsLearning;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Portal,
  Modal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const InteractiveLearning = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeGame, setActiveGame] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userProgress, setUserProgress] = useState({
    totalPoints: 2450,
    completedActivities: 18,
    currentStreak: 7,
    level: 'Bronze Champion'
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Interactive learning activities data
  const [activities, setActivities] = useState([
    {
      id: 'sports-quiz',
      title: 'Sports Knowledge Quiz',
      category: 'Quiz',
      description: 'Test your sports knowledge with fun questions!',
      icon: 'quiz',
      difficulty: 'Easy',
      duration: '5 min',
      points: 100,
      completed: true,
      progress: 100,
      color: '#4CAF50',
      players: 1247,
      rating: 4.8,
      type: 'quiz',
      questions: [
        {
          question: 'How many players are on a football team on the field?',
          options: ['9', '10', '11', '12'],
          correct: 2,
          explanation: 'Each football team has 11 players on the field at one time! ⚽'
        },
        {
          question: 'What sport is played at Wimbledon?',
          options: ['Tennis', 'Cricket', 'Golf', 'Rugby'],
          correct: 0,
          explanation: 'Wimbledon is the most famous tennis championship! 🎾'
        }
      ]
    },
    {
      id: 'match-athletes',
      title: 'Match the Athlete',
      category: 'Memory',
      description: 'Match famous athletes to their sports!',
      icon: 'psychology',
      difficulty: 'Medium',
      duration: '7 min',
      points: 150,
      completed: false,
      progress: 60,
      color: '#2196F3',
      players: 892,
      rating: 4.6,
      type: 'matching',
      pairs: [
        { athlete: 'Messi', sport: 'Football', image: '⚽' },
        { athlete: 'Jordan', sport: 'Basketball', image: '🏀' },
        { athlete: 'Serena', sport: 'Tennis', image: '🎾' },
        { athlete: 'Bolt', sport: 'Running', image: '🏃‍♂️' }
      ]
    },
    {
      id: 'sports-rules',
      title: 'Learn Game Rules',
      category: 'Education',
      description: 'Interactive guide to sports rules and regulations!',
      icon: 'menu_book',
      difficulty: 'Easy',
      duration: '10 min',
      points: 120,
      completed: true,
      progress: 100,
      color: '#FF9800',
      players: 1567,
      rating: 4.9,
      type: 'educational',
      modules: [
        { title: 'Football Basics', completed: true },
        { title: 'Basketball Rules', completed: true },
        { title: 'Tennis Scoring', completed: false }
      ]
    },
    {
      id: 'fitness-challenge',
      title: 'Daily Fitness Challenge',
      category: 'Activity',
      description: 'Fun physical activities you can do at home!',
      icon: 'fitness_center',
      difficulty: 'Medium',
      duration: '15 min',
      points: 200,
      completed: false,
      progress: 30,
      color: '#E91E63',
      players: 2103,
      rating: 4.7,
      type: 'physical',
      exercises: [
        { name: 'Jumping Jacks', reps: 20, completed: true },
        { name: 'Push-ups', reps: 10, completed: true },
        { name: 'Squats', reps: 15, completed: false },
        { name: 'Plank', duration: '30 sec', completed: false }
      ]
    },
    {
      id: 'sports-history',
      title: 'Sports Time Machine',
      category: 'History',
      description: 'Journey through the history of your favorite sports!',
      icon: 'history',
      difficulty: 'Hard',
      duration: '12 min',
      points: 180,
      completed: false,
      progress: 0,
      color: '#9C27B0',
      players: 743,
      rating: 4.5,
      type: 'timeline',
      events: [
        { year: '1863', event: 'Football rules established', sport: 'Football' },
        { year: '1891', event: 'Basketball invented', sport: 'Basketball' },
        { year: '1877', event: 'First Wimbledon', sport: 'Tennis' }
      ]
    },
    {
      id: 'nutrition-game',
      title: 'Athlete Nutrition Game',
      category: 'Health',
      description: 'Learn what foods fuel champions!',
      icon: 'restaurant',
      difficulty: 'Easy',
      duration: '8 min',
      points: 130,
      completed: true,
      progress: 100,
      color: '#4CAF50',
      players: 1432,
      rating: 4.8,
      type: 'nutrition',
      foods: [
        { name: 'Banana', benefit: 'Quick energy', good: true },
        { name: 'Water', benefit: 'Hydration', good: true },
        { name: 'Candy', benefit: 'Sugar rush', good: false },
        { name: 'Chicken', benefit: 'Protein power', good: true }
      ]
    }
  ]);

  const categories = ['all', 'Quiz', 'Memory', 'Education', 'Activity', 'History', 'Health'];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      Alert.alert(
        'New Activities Added! 🎮',
        'Fresh interactive learning games have been added! Keep exploring and learning!',
        [{ text: 'Let\'s Play!', style: 'default' }]
      );
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const startActivity = (activity) => {
    setActiveGame(activity);
    setModalVisible(true);
    Vibration.vibrate(50);
    
    Alert.alert(
      `🎯 ${activity.title}`,
      `Ready to start this ${activity.difficulty.toLowerCase()} activity?\n\nYou'll earn ${activity.points} points! 🌟`,
      [
        { text: 'Let\'s Go!', onPress: () => handleActivityStart(activity) },
        { text: 'Maybe Later', style: 'cancel', onPress: () => setModalVisible(false) }
      ]
    );
  };

  const handleActivityStart = (activity) => {
    // Simulate starting the activity
    Alert.alert(
      'Activity Started! 🚀',
      'This is where the interactive learning experience would begin. Features coming soon!',
      [{ text: 'Awesome!', style: 'default' }]
    );
    setModalVisible(false);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': '#4CAF50',
      'Medium': '#FF9800',
      'Hard': '#F44336'
    };
    return colors[difficulty] || '#757575';
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      'Quiz': '🧠',
      'Memory': '🧩',
      'Education': '📚',
      'Activity': '🏃‍♂️',
      'History': '📜',
      'Health': '🍎'
    };
    return emojis[category] || '🎮';
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
          Interactive Learning 🎮
        </Text>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Play, learn, and become a sports champion!
        </Text>
        
        {/* Progress Stats */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{userProgress.totalPoints}</Text>
              <Text style={styles.progressLabel}>Points 🌟</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{userProgress.completedActivities}</Text>
              <Text style={styles.progressLabel}>Completed 🎯</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{userProgress.currentStreak}</Text>
              <Text style={styles.progressLabel}>Day Streak 🔥</Text>
            </View>
          </View>
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Current Level: {userProgress.level} 🏆</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search learning activities..."
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
        {categories.map((category) => (
          <Chip
            key={category}
            mode={selectedCategory === category ? 'flat' : 'outlined'}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedChip
            ]}
            textStyle={[
              styles.chipText,
              selectedCategory === category && styles.selectedChipText
            ]}
          >
            {category === 'all' ? 'All Games 🎮' : `${category} ${getCategoryEmoji(category)}`}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderActivityCard = (activity) => {
    const progressWidth = (activity.progress / 100) * 100;
    
    return (
      <Card key={activity.id} style={styles.activityCard}>
        <TouchableOpacity
          onPress={() => startActivity(activity)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[activity.color + '20', activity.color + '10']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Surface style={[styles.iconContainer, { backgroundColor: activity.color }]}>
                <Icon
                  name={activity.icon}
                  size={28}
                  color="white"
                />
              </Surface>
              
              <View style={styles.activityInfo}>
                <Text style={[TEXT_STYLES.h4, styles.activityTitle]}>
                  {activity.title}
                </Text>
                <Text style={[TEXT_STYLES.caption, styles.activityDescription]} numberOfLines={2}>
                  {activity.description}
                </Text>
                
                <View style={styles.activityMeta}>
                  <Chip
                    compact
                    style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(activity.difficulty) }]}
                    textStyle={styles.difficultyText}
                  >
                    {activity.difficulty}
                  </Chip>
                  <Text style={styles.durationText}>⏱️ {activity.duration}</Text>
                </View>
              </View>
              
              <View style={styles.pointsContainer}>
                <Text style={[styles.pointsText, { color: activity.color }]}>
                  {activity.points}
                </Text>
                <Icon name="star" size={16} color="#FFD700" />
                {activity.completed && (
                  <Icon name="check-circle" size={20} color={COLORS.success} style={styles.completedIcon} />
                )}
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>Progress</Text>
                <Text style={[styles.progressPercentage, { color: activity.color }]}>
                  {activity.progress}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg} />
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: activity.color,
                      width: `${activity.progress}%`,
                    }
                  ]}
                />
              </View>
            </View>
            
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="people" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{activity.players.toLocaleString()}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.statText}>{activity.rating}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.categoryTag, { color: activity.color }]}>
                  {activity.category} {getCategoryEmoji(activity.category)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="games" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
        No Activities Found
      </Text>
      <Text style={[TEXT_STYLES.body, styles.emptySubtitle]}>
        Try a different search or category filter
      </Text>
    </View>
  );

  const renderFeaturedSection = () => {
    const featuredActivities = activities.filter(activity => activity.rating >= 4.8).slice(0, 3);
    
    return (
      <View style={styles.featuredSection}>
        <Text style={[TEXT_STYLES.h3, styles.featuredTitle]}>
          ⭐ Featured This Week
        </Text>
        <Text style={[TEXT_STYLES.caption, styles.featuredSubtitle]}>
          Most popular learning activities
        </Text>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.featuredScroll}
          contentContainerStyle={styles.featuredContainer}
        >
          {featuredActivities.map((activity) => (
            <TouchableOpacity
              key={`featured-${activity.id}`}
              onPress={() => startActivity(activity)}
              style={[styles.featuredCard, { backgroundColor: activity.color + '15' }]}
            >
              <Surface style={[styles.featuredIcon, { backgroundColor: activity.color }]}>
                <Icon name={activity.icon} size={24} color="white" />
              </Surface>
              <Text style={styles.featuredCardTitle} numberOfLines={2}>
                {activity.title}
              </Text>
              <Text style={styles.featuredCardPoints}>
                {activity.points} points ⭐
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {renderSearchAndFilters()}
          {renderFeaturedSection()}
          
          <View style={styles.activitiesSection}>
            <View style={styles.sectionHeader}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                All Learning Activities 📚
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.sectionSubtitle]}>
                Tap any activity to start learning and earning points!
              </Text>
            </View>
            
            {filteredActivities.length > 0 ? (
              filteredActivities.map(renderActivityCard)
            ) : (
              renderEmptyState()
            )}
          </View>
        </Animated.View>
      </Animated.ScrollView>
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
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: SPACING.md,
    width: '100%',
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
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: 'white',
  },
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.xs,
  },
  categoryChip: {
    marginHorizontal: SPACING.xs,
    backgroundColor: 'white',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
  },
  selectedChipText: {
    color: 'white',
  },
  featuredSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  featuredTitle: {
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  featuredSubtitle: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  featuredScroll: {
    marginBottom: SPACING.md,
  },
  featuredContainer: {
    paddingHorizontal: SPACING.xs,
  },
  featuredCard: {
    width: 120,
    height: 140,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  featuredCardTitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  featuredCardPoints: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  activitiesSection: {
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
  },
  activityCard: {
    marginBottom: SPACING.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  activityInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  activityTitle: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  activityDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyChip: {
    marginRight: SPACING.sm,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  durationText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  pointsContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  pointsText: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
  },
  completedIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  categoryTag: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default InteractiveLearning;
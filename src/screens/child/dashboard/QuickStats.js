import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import {
  Card,
  Button,
  Avatar,
  Chip,
  ProgressBar,
  Badge,
  IconButton,
  Surface,
  FAB,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/styles';

const { width, height } = Dimensions.get('window');

const QuickStarts = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, quickStarts, recentActivities, loading } = useSelector(state => state.child);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Load quick starts
    loadQuickStarts();
  }, []);

  const loadQuickStarts = useCallback(async () => {
    try {
      // Simulate API call for quick starts
      // dispatch(fetchQuickStarts(user.id));
      
      // For now, show development alert
      setTimeout(() => {
        Alert.alert(
          'Feature Development',
          'Quick Starts feature is currently being developed. This will provide instant access to workouts, drills, and training activities.',
          [{ text: 'OK' }]
        );
      }, 1000);
    } catch (error) {
      console.error('Error loading quick starts:', error);
    }
  }, [user?.id, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadQuickStarts();
    setRefreshing(false);
  }, [loadQuickStarts]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Filter quick starts based on category
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    Animated.timing(searchAnim, {
      toValue: showSearch ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleQuickStartPress = (quickStart) => {
    // Start the selected activity
    Alert.alert(
      'Start Activity',
      `Ready to start "${quickStart.title}"? This will launch the workout with ${quickStart.duration} of activities.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Now', 
          onPress: () => navigation.navigate('WorkoutSession', { 
            quickStartId: quickStart.id,
            workoutData: quickStart 
          })
        }
      ]
    );
  };

  const handleRecentActivityPress = (activity) => {
    // Continue or view recent activity
    navigation.navigate('ActivityDetail', { activityId: activity.id });
  };

  const renderQuickStartCard = (quickStart, index) => {
    const cardOpacity = scrollY.interpolate({
      inputRange: [0, 50 * index, 50 * (index + 2)],
      outputRange: [1, 1, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={quickStart.id}
        style={[
          styles.quickStartCard,
          { opacity: cardOpacity }
        ]}
      >
        <Card style={styles.card} onPress={() => handleQuickStartPress(quickStart)}>
          <LinearGradient
            colors={[quickStart.gradient[0], quickStart.gradient[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Icon name={quickStart.icon} size={32} color="white" />
                </View>
                
                <View style={styles.difficultyContainer}>
                  <Chip 
                    mode="flat" 
                    style={[styles.difficultyChip, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                    textStyle={styles.difficultyText}
                  >
                    {quickStart.difficulty}
                  </Chip>
                </View>
              </View>

              <Text style={styles.quickStartTitle}>{quickStart.title}</Text>
              <Text style={styles.quickStartDescription} numberOfLines={2}>
                {quickStart.description}
              </Text>

              <View style={styles.quickStartMeta}>
                <View style={styles.metaItem}>
                  <Icon name="access-time" size={16} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.metaText}>{quickStart.duration}</Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Icon name="whatshot" size={16} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.metaText}>{quickStart.calories} cal</Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Icon name="fitness-center" size={16} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.metaText}>{quickStart.exercises} exercises</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.popularityContainer}>
                  {quickStart.isPopular && (
                    <View style={styles.popularBadge}>
                      <Icon name="trending-up" size={12} color="#FFD700" />
                      <Text style={styles.popularText}>Popular</Text>
                    </View>
                  )}
                </View>
                
                <Button
                  mode="contained"
                  onPress={() => handleQuickStartPress(quickStart)}
                  style={styles.startButton}
                  contentStyle={styles.startButtonContent}
                  buttonColor="rgba(255, 255, 255, 0.2)"
                  textColor="white"
                  compact
                >
                  Start Now
                </Button>
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>
      </Animated.View>
    );
  };

  const renderRecentActivity = (activity) => (
    <TouchableOpacity
      key={activity.id}
      style={styles.recentActivityCard}
      onPress={() => handleRecentActivityPress(activity)}
    >
      <Surface style={styles.recentActivitySurface}>
        <View style={styles.recentActivityIcon}>
          <LinearGradient
            colors={[activity.color + '40', activity.color + '20']}
            style={styles.recentIconBackground}
          >
            <Icon name={activity.icon} size={20} color={activity.color} />
          </LinearGradient>
        </View>
        
        <View style={styles.recentActivityInfo}>
          <Text style={styles.recentActivityTitle} numberOfLines={1}>
            {activity.title}
          </Text>
          <Text style={styles.recentActivityTime}>{activity.timeAgo}</Text>
          
          {activity.progress && (
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={activity.progress / 100}
                color={activity.color}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>{activity.progress}%</Text>
            </View>
          )}
        </View>
        
        <IconButton
          icon="play-arrow"
          iconColor={activity.color}
          size={20}
          onPress={() => handleRecentActivityPress(activity)}
        />
      </Surface>
    </TouchableOpacity>
  );

  const renderCategoryChip = (category) => (
    <TouchableOpacity
      key={category.key}
      onPress={() => handleCategoryChange(category.key)}
      style={[
        styles.categoryChip,
        selectedCategory === category.key && styles.categoryChipActive
      ]}
    >
      <Icon 
        name={category.icon} 
        size={16} 
        color={selectedCategory === category.key ? 'white' : COLORS.primary} 
      />
      <Text style={[
        styles.categoryChipText,
        selectedCategory === category.key && styles.categoryChipTextActive
      ]}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  // Mock data for development
  const mockQuickStarts = [
    {
      id: 1,
      title: 'Morning Energy Boost ⚡',
      description: 'Quick cardio and stretching routine to start your day with energy',
      duration: '15 min',
      calories: 120,
      exercises: 8,
      difficulty: 'Easy',
      icon: 'wb-sunny',
      gradient: ['#FF6B6B', '#FF8E53'],
      category: 'cardio',
      isPopular: true,
    },
    {
      id: 2,
      title: 'Strength Builder 💪',
      description: 'Build muscle and strength with bodyweight exercises',
      duration: '20 min',
      calories: 180,
      exercises: 6,
      difficulty: 'Medium',
      icon: 'fitness-center',
      gradient: ['#667eea', '#764ba2'],
      category: 'strength',
      isPopular: false,
    },
    {
      id: 3,
      title: 'Speed & Agility 🏃',
      description: 'Improve your speed and coordination with dynamic movements',
      duration: '25 min',
      calories: 220,
      exercises: 10,
      difficulty: 'Hard',
      icon: 'directions-run',
      gradient: ['#f093fb', '#f5576c'],
      category: 'speed',
      isPopular: true,
    },
    {
      id: 4,
      title: 'Flexibility Flow 🧘',
      description: 'Gentle stretching and mobility routine for recovery',
      duration: '12 min',
      calories: 60,
      exercises: 12,
      difficulty: 'Easy',
      icon: 'self-improvement',
      gradient: ['#4facfe', '#00f2fe'],
      category: 'flexibility',
      isPopular: false,
    },
    {
      id: 5,
      title: 'Core Crusher 🔥',
      description: 'Intense core workout to build stability and strength',
      duration: '18 min',
      calories: 150,
      exercises: 7,
      difficulty: 'Medium',
      icon: 'center-focus-strong',
      gradient: ['#fa709a', '#fee140'],
      category: 'strength',
      isPopular: true,
    },
    {
      id: 6,
      title: 'Fun Dance Party 🎵',
      description: 'High-energy dance workout that feels like a party',
      duration: '30 min',
      calories: 280,
      exercises: 15,
      difficulty: 'Medium',
      icon: 'music-note',
      gradient: ['#a8edea', '#fed6e3'],
      category: 'cardio',
      isPopular: true,
    },
  ];

  const mockRecentActivities = [
    {
      id: 1,
      title: 'Morning Energy Boost',
      timeAgo: '2 hours ago',
      progress: 100,
      icon: 'wb-sunny',
      color: '#FF6B6B',
    },
    {
      id: 2,
      title: 'Strength Builder',
      timeAgo: '1 day ago',
      progress: 75,
      icon: 'fitness-center',
      color: '#667eea',
    },
    {
      id: 3,
      title: 'Core Crusher',
      timeAgo: '2 days ago',
      progress: 60,
      icon: 'center-focus-strong',
      color: '#fa709a',
    },
  ];

  const categories = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'cardio', label: 'Cardio', icon: 'favorite' },
    { key: 'strength', label: 'Strength', icon: 'fitness-center' },
    { key: 'speed', label: 'Speed', icon: 'directions-run' },
    { key: 'flexibility', label: 'Flexibility', icon: 'self-improvement' },
  ];

  const filteredQuickStarts = selectedCategory === 'all' 
    ? mockQuickStarts 
    : mockQuickStarts.filter(qs => qs.category === selectedCategory);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Quick Starts</Text>
            <View style={styles.headerActions}>
              <IconButton
                icon="search"
                iconColor="white"
                size={24}
                onPress={toggleSearch}
              />
              <IconButton
                icon="history"
                iconColor="white"
                size={24}
                onPress={() => navigation.navigate('ActivityHistory')}
              />
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Jump into action with instant workouts! 🚀
          </Text>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <Animated.View 
        style={[
          styles.searchContainer,
          {
            height: searchAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 70],
            }),
            opacity: searchAnim,
          }
        ]}
      >
        <Searchbar
          placeholder="Search workouts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />
      </Animated.View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map(renderCategoryChip)}
        </ScrollView>
      </View>

      {/* Main Content */}
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Recent Activities */}
          {mockRecentActivities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Continue Where You Left Off</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentActivitiesScroll}
              >
                {mockRecentActivities.map(renderRecentActivity)}
              </ScrollView>
            </View>
          )}

          {/* Quick Start Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === 'all' ? 'All Workouts' : categories.find(c => c.key === selectedCategory)?.label + ' Workouts'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {filteredQuickStarts.length} available
              </Text>
            </View>

            <View style={styles.quickStartsGrid}>
              {filteredQuickStarts.map((quickStart, index) => 
                renderQuickStartCard(quickStart, index)
              )}
            </View>
          </View>

          {/* Motivational Card */}
          <Card style={styles.motivationCard}>
            <LinearGradient
              colors={['#667eea20', '#764ba220']}
              style={styles.motivationGradient}
            >
              <Card.Content style={styles.motivationContent}>
                <Text style={styles.motivationTitle}>Ready for a Challenge? 💪</Text>
                <Text style={styles.motivationText}>
                  Try mixing different workout types to keep things exciting and improve all areas of fitness!
                </Text>
                <Button
                  mode="contained"
                  onPress={() => Alert.alert('Random Workout', 'Feature coming soon!')}
                  style={styles.motivationButton}
                  buttonColor={COLORS.primary}
                >
                  Surprise Me!
                </Button>
              </Card.Content>
            </LinearGradient>
          </Card>
        </Animated.View>
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        label="Custom"
        style={styles.fab}
        onPress={() => Alert.alert('Custom Workout', 'Create custom workout feature coming soon!')}
        color="white"
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    overflow: 'hidden',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: SPACING.xs,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
  },
  recentActivitiesScroll: {
    gap: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  recentActivityCard: {
    width: width * 0.75,
  },
  recentActivitySurface: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  recentActivityIcon: {
    marginRight: SPACING.md,
  },
  recentIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentActivityInfo: {
    flex: 1,
  },
  recentActivityTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  recentActivityTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textLight,
    fontSize: 10,
  },
  quickStartsGrid: {
    gap: SPACING.md,
  },
  quickStartCard: {
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyContainer: {
    alignItems: 'flex-end',
  },
  difficultyChip: {
    height: 24,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickStartTitle: {
    ...TEXT_STYLES.h4,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  quickStartDescription: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  quickStartMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularityContainer: {
    flex: 1,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  popularText: {
    ...TEXT_STYLES.caption,
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
  },
  startButton: {
    borderRadius: 20,
  },
  startButtonContent: {
    paddingHorizontal: SPACING.sm,
  },
  motivationCard: {
    marginTop: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  motivationGradient: {
    flex: 1,
  },
  motivationContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  motivationTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  motivationText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  motivationButton: {
    borderRadius: 20,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
};

export default QuickStarts;
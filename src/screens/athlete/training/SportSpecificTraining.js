import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  TouchableOpacity,
  FlatList,
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
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SportSpecificTraining = ({ navigation }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const dispatch = useDispatch();
  const { user, trainingData, isLoading } = useSelector(state => ({
    user: state.user,
    trainingData: state.training,
    isLoading: state.app.isLoading,
  }));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call for refreshing training data
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success', 'Training data updated! 🚀');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh training data');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Mock data for sport-specific training
  const sportCategories = [
    { id: 'all', name: 'All Sports', icon: 'sports', count: 24 },
    { id: 'football', name: 'Football', icon: 'sports-football', count: 8 },
    { id: 'basketball', name: 'Basketball', icon: 'sports-basketball', count: 6 },
    { id: 'tennis', name: 'Tennis', icon: 'sports-tennis', count: 4 },
    { id: 'running', name: 'Running', icon: 'directions-run', count: 6 },
  ];

  const trainingPrograms = [
    {
      id: 1,
      title: 'Elite Football Conditioning',
      sport: 'football',
      difficulty: 'Advanced',
      duration: '8 weeks',
      sessions: 32,
      completedSessions: 12,
      rating: 4.8,
      coach: 'Marcus Johnson',
      thumbnail: '⚽',
      badges: ['🏆', '💪', '⚡'],
      description: 'Professional-level conditioning program designed for competitive football players',
    },
    {
      id: 2,
      title: 'Basketball Agility Master',
      sport: 'basketball',
      difficulty: 'Intermediate',
      duration: '6 weeks',
      sessions: 24,
      completedSessions: 8,
      rating: 4.6,
      coach: 'Sarah Williams',
      thumbnail: '🏀',
      badges: ['🎯', '🔥', '💨'],
      description: 'Enhance your court movement, reaction time, and ball handling skills',
    },
    {
      id: 3,
      title: 'Tennis Power Training',
      sport: 'tennis',
      difficulty: 'Intermediate',
      duration: '10 weeks',
      sessions: 40,
      completedSessions: 0,
      rating: 4.9,
      coach: 'David Chen',
      thumbnail: '🎾',
      badges: ['💪', '⚡', '🎯'],
      description: 'Build explosive power for serves and groundstrokes',
    },
    {
      id: 4,
      title: 'Marathon Preparation',
      sport: 'running',
      difficulty: 'Advanced',
      duration: '16 weeks',
      sessions: 96,
      completedSessions: 24,
      rating: 4.7,
      coach: 'Lisa Rodriguez',
      thumbnail: '🏃',
      badges: ['🏆', '⏰', '💯'],
      description: 'Complete marathon training program with progressive mileage',
    },
  ];

  const aiRecommendations = [
    {
      id: 1,
      type: 'skill_improvement',
      title: 'Improve Ball Control',
      description: 'Based on your recent performances, focus on ball control drills',
      priority: 'high',
      estimatedTime: '2 weeks',
      icon: '🎯',
    },
    {
      id: 2,
      type: 'conditioning',
      title: 'Enhance Stamina',
      description: 'Your endurance metrics suggest cardio conditioning focus',
      priority: 'medium',
      estimatedTime: '4 weeks',
      icon: '💪',
    },
    {
      id: 3,
      type: 'recovery',
      title: 'Recovery Protocol',
      description: 'Incorporate more rest days to prevent overtraining',
      priority: 'high',
      estimatedTime: '1 week',
      icon: '😴',
    },
  ];

  const filteredPrograms = trainingPrograms.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.coach.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || program.sport === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderCategoryChip = ({ item }) => (
    <Chip
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.selectedCategoryChip
      ]}
      selected={selectedCategory === item.id}
      onPress={() => setSelectedCategory(item.id)}
      icon={item.icon}
      textStyle={selectedCategory === item.id ? styles.selectedChipText : styles.chipText}
    >
      {item.name} ({item.count})
    </Chip>
  );

  const renderTrainingProgram = ({ item }) => {
    const progress = item.completedSessions / item.sessions;
    const isNew = item.completedSessions === 0;

    return (
      <Card style={styles.programCard} elevation={4}>
        <TouchableOpacity
          onPress={() => navigation.navigate('TrainingProgramDetails', { program: item })}
          activeOpacity={0.9}
        >
          <View style={styles.programHeader}>
            <View style={styles.programThumbnail}>
              <Text style={styles.thumbnailEmoji}>{item.thumbnail}</Text>
              {isNew && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>}
            </View>
            <View style={styles.programInfo}>
              <Text style={styles.programTitle}>{item.title}</Text>
              <Text style={styles.programCoach}>by {item.coach}</Text>
              <View style={styles.programMeta}>
                <Chip style={styles.difficultyChip} textStyle={styles.chipMetaText}>
                  {item.difficulty}
                </Chip>
                <Text style={styles.duration}>{item.duration}</Text>
                <View style={styles.rating}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.programDescription}>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>

          <View style={styles.badgeContainer}>
            {item.badges.map((badge, index) => (
              <Text key={index} style={styles.badge}>{badge}</Text>
            ))}
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Progress: {item.completedSessions}/{item.sessions} sessions
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <ProgressBar
              progress={progress}
              color={COLORS.primary}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.programActions}>
            <Button
              mode={isNew ? "contained" : "outlined"}
              style={styles.actionButton}
              onPress={() => Alert.alert('Feature Coming Soon', 'Training program details will be available soon! 🚀')}
            >
              {isNew ? 'Start Training' : 'Continue'}
            </Button>
            <IconButton
              icon="bookmark-outline"
              size={24}
              onPress={() => Alert.alert('Bookmarked', 'Added to your saved programs! 📚')}
            />
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderAIRecommendation = ({ item }) => {
    const priorityColor = item.priority === 'high' ? COLORS.error : 
                         item.priority === 'medium' ? COLORS.warning : COLORS.success;

    return (
      <Card style={styles.recommendationCard} elevation={2}>
        <View style={styles.recommendationContent}>
          <View style={styles.recommendationHeader}>
            <Text style={styles.recommendationEmoji}>{item.icon}</Text>
            <View style={styles.recommendationInfo}>
              <Text style={styles.recommendationTitle}>{item.title}</Text>
              <Text style={styles.recommendationDescription}>{item.description}</Text>
            </View>
            <Chip
              style={[styles.priorityChip, { backgroundColor: priorityColor + '20' }]}
              textStyle={[styles.priorityText, { color: priorityColor }]}
            >
              {item.priority.toUpperCase()}
            </Chip>
          </View>
          <View style={styles.recommendationFooter}>
            <Text style={styles.estimatedTime}>⏱️ {item.estimatedTime}</Text>
            <Button
              mode="contained"
              compact
              style={styles.acceptButton}
              onPress={() => Alert.alert('AI Recommendation', 'Training plan updated based on AI recommendation! 🤖')}
            >
              Accept
            </Button>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>Sport-Specific Training</Text>
          <Text style={styles.headerSubtitle}>
            Specialized programs designed for your sport 🎯
          </Text>
        </Animated.View>
      </LinearGradient>

      <Animated.View style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search training programs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
              iconColor={COLORS.primary}
            />
          </View>

          {/* AI Recommendations Section */}
          <Surface style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🤖 AI Recommendations</Text>
              <Text style={styles.sectionSubtitle}>Personalized training insights</Text>
            </View>
            <FlatList
              data={aiRecommendations}
              renderItem={renderAIRecommendation}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </Surface>

          {/* Sport Categories */}
          <Surface style={styles.section}>
            <Text style={styles.sectionTitle}>Select Sport Category</Text>
            <FlatList
              data={sportCategories}
              renderItem={renderCategoryChip}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            />
          </Surface>

          {/* Training Programs */}
          <Surface style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Training Programs ({filteredPrograms.length})
              </Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Feature Coming Soon', 'Advanced filters will be available soon! 🔍')}
              >
                <Icon name="tune" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            {filteredPrograms.length === 0 ? (
              <Card style={styles.emptyState}>
                <Text style={styles.emptyStateText}>🔍</Text>
                <Text style={styles.emptyStateTitle}>No programs found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Try adjusting your search or category filters
                </Text>
              </Card>
            ) : (
              <FlatList
                data={filteredPrograms}
                renderItem={renderTrainingProgram}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            )}
          </Surface>

          {/* Stats Overview */}
          <Surface style={[styles.section, styles.statsSection]}>
            <Text style={styles.sectionTitle}>📊 Your Training Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>44</Text>
                <Text style={styles.statLabel}>Sessions Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Programs Enrolled</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>87%</Text>
                <Text style={styles.statLabel}>Completion Rate</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>🔥 15</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          </Surface>
        </ScrollView>
      </Animated.View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon', 'Create custom training program feature will be available soon! 💪')}
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
    paddingTop: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginTop: -SPACING.lg,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  searchBar: {
    elevation: 2,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: '600',
  },
  sectionSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  categoriesContainer: {
    paddingVertical: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
    fontSize: 12,
  },
  selectedChipText: {
    color: 'white',
    fontSize: 12,
  },
  recommendationCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  recommendationContent: {
    padding: SPACING.lg,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  recommendationInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  recommendationTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    fontWeight: '600',
  },
  recommendationDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  priorityChip: {
    height: 28,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  estimatedTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  acceptButton: {
    minWidth: 80,
  },
  programCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  programHeader: {
    flexDirection: 'row',
    padding: SPACING.lg,
  },
  programThumbnail: {
    position: 'relative',
    marginRight: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailEmoji: {
    fontSize: 40,
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  programInfo: {
    flex: 1,
  },
  programTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    fontWeight: '600',
  },
  programCoach: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    flexWrap: 'wrap',
  },
  difficultyChip: {
    height: 24,
    marginRight: SPACING.sm,
  },
  chipMetaText: {
    fontSize: 10,
  },
  duration: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  programDescription: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  descriptionText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  badge: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  progressPercent: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  programActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  statsSection: {
    marginBottom: SPACING.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    fontWeight: '600',
  },
  emptyStateSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default SportSpecificTraining;
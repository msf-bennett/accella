import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Modal,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  ProgressBar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#FF6B6B',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width } = Dimensions.get('window');

const TrainingClips = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, trainingClips, isLoading } = useSelector(state => state.training);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [videoModal, setVideoModal] = useState({ visible: false, clip: null });
  const [favorites, setFavorites] = useState(new Set());
  const [watchedClips, setWatchedClips] = useState(new Set());
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Mock data for training clips
  const mockClips = [
    {
      id: '1',
      title: '⚽ Ball Control Basics',
      description: 'Master the fundamentals of ball control with these easy drills',
      thumbnail: '🎬',
      duration: '3:45',
      category: 'skills',
      difficulty: 'beginner',
      views: 245,
      likes: 28,
      coachName: 'Coach Sarah',
      isNew: true,
      tags: ['ball-control', 'fundamentals', 'beginner'],
    },
    {
      id: '2',
      title: '🏃‍♂️ Speed Training Drills',
      description: 'Improve your running speed with these fun exercises',
      thumbnail: '💨',
      duration: '5:20',
      category: 'fitness',
      difficulty: 'intermediate',
      views: 189,
      likes: 35,
      coachName: 'Coach Mike',
      isNew: false,
      tags: ['speed', 'running', 'agility'],
    },
    {
      id: '3',
      title: '🥅 Goalkeeping Techniques',
      description: 'Learn proper diving and catching techniques',
      thumbnail: '🧤',
      duration: '4:15',
      category: 'goalkeeping',
      difficulty: 'intermediate',
      views: 156,
      likes: 22,
      coachName: 'Coach Emma',
      isNew: true,
      tags: ['goalkeeping', 'diving', 'catching'],
    },
    {
      id: '4',
      title: '🎯 Shooting Practice',
      description: 'Perfect your shooting accuracy with target practice',
      thumbnail: '⚽',
      duration: '6:30',
      category: 'skills',
      difficulty: 'advanced',
      views: 298,
      likes: 42,
      coachName: 'Coach David',
      isNew: false,
      tags: ['shooting', 'accuracy', 'practice'],
    },
    {
      id: '5',
      title: '🤸‍♂️ Warm-up Routine',
      description: 'Essential warm-up exercises before training',
      thumbnail: '🔥',
      duration: '2:30',
      category: 'fitness',
      difficulty: 'beginner',
      views: 412,
      likes: 58,
      coachName: 'Coach Lisa',
      isNew: false,
      tags: ['warm-up', 'stretching', 'preparation'],
    },
  ];

  const categories = [
    { id: 'all', label: 'All Clips', icon: 'video-library', count: mockClips.length },
    { id: 'skills', label: 'Skills', icon: 'sports-soccer', count: 2 },
    { id: 'fitness', label: 'Fitness', icon: 'fitness-center', count: 2 },
    { id: 'goalkeeping', label: 'Goalkeeping', icon: 'sports', count: 1 },
  ];

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Dispatch refresh action
      // dispatch(refreshTrainingClips());
    } catch (error) {
      Alert.alert('Oops! 😅', 'Something went wrong. Please try again!');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter clips based on search and category
  const filteredClips = mockClips.filter(clip => {
    const matchesSearch = clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clip.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || clip.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle clip press
  const handleClipPress = (clip) => {
    Vibration.vibrate(50);
    setVideoModal({ visible: true, clip });
    setWatchedClips(prev => new Set(prev).add(clip.id));
  };

  // Handle favorite toggle
  const toggleFavorite = (clipId) => {
    Vibration.vibrate(30);
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(clipId)) {
        newFavorites.delete(clipId);
      } else {
        newFavorites.add(clipId);
      }
      return newFavorites;
    });
  };

  // Render category chip
  const renderCategoryChip = (category) => (
    <Chip
      key={category.id}
      mode={selectedCategory === category.id ? 'flat' : 'outlined'}
      selected={selectedCategory === category.id}
      onPress={() => setSelectedCategory(category.id)}
      icon={category.icon}
      style={[
        styles.categoryChip,
        selectedCategory === category.id && {
          backgroundColor: COLORS.primary,
        },
      ]}
      textStyle={{
        color: selectedCategory === category.id ? 'white' : COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
      }}
    >
      {category.label} ({category.count})
    </Chip>
  );

  // Render training clip card
  const renderClipCard = (clip) => (
    <Animated.View
      key={clip.id}
      style={[
        styles.clipCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={styles.card} elevation={4}>
        <TouchableOpacity onPress={() => handleClipPress(clip)}>
          <Surface style={styles.thumbnailContainer}>
            <Text style={styles.thumbnailEmoji}>{clip.thumbnail}</Text>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{clip.duration}</Text>
            </View>
            {clip.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW! ✨</Text>
              </View>
            )}
            {watchedClips.has(clip.id) && (
              <View style={styles.watchedBadge}>
                <Icon name="check-circle" size={20} color={COLORS.success} />
              </View>
            )}
          </Surface>
        </TouchableOpacity>

        <Card.Content style={styles.cardContent}>
          <View style={styles.clipHeader}>
            <Text style={styles.clipTitle} numberOfLines={2}>
              {clip.title}
            </Text>
            <IconButton
              icon={favorites.has(clip.id) ? 'favorite' : 'favorite-border'}
              iconColor={favorites.has(clip.id) ? COLORS.accent : COLORS.textSecondary}
              size={20}
              onPress={() => toggleFavorite(clip.id)}
            />
          </View>

          <Text style={styles.clipDescription} numberOfLines={2}>
            {clip.description}
          </Text>

          <View style={styles.clipMeta}>
            <View style={styles.metaLeft}>
              <Avatar.Text
                size={32}
                label={clip.coachName.charAt(6)}
                style={styles.coachAvatar}
              />
              <Text style={styles.coachName}>{clip.coachName}</Text>
            </View>
            <View style={styles.metaRight}>
              <View style={styles.metaItem}>
                <Icon name="visibility" size={16} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{clip.views}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="thumb-up" size={16} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{clip.likes}</Text>
              </View>
            </View>
          </View>

          <View style={styles.difficultyContainer}>
            <Chip
              mode="outlined"
              compact
              textStyle={styles.difficultyText}
              style={[
                styles.difficultyChip,
                { borderColor: getDifficultyColor(clip.difficulty) },
              ]}
            >
              {getDifficultyEmoji(clip.difficulty)} {clip.difficulty}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  // Helper functions
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return '#FF9800';
      case 'advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getDifficultyEmoji = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '🌟';
      case 'intermediate': return '🔥';
      case 'advanced': return '💪';
      default: return '⭐';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Training Clips 🎬</Text>
          <Text style={styles.headerSubtitle}>
            Learn from the best coaches! 🌟
          </Text>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <Surface style={styles.searchContainer} elevation={2}>
        <Searchbar
          placeholder="Search for drills, techniques... 🔍"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
      </Surface>

      {/* Main Content */}
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
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Surface style={styles.statCard} elevation={2}>
            <Text style={styles.statNumber}>{mockClips.length}</Text>
            <Text style={styles.statLabel}>Total Clips</Text>
          </Surface>
          <Surface style={styles.statCard} elevation={2}>
            <Text style={styles.statNumber}>{watchedClips.size}</Text>
            <Text style={styles.statLabel}>Watched</Text>
          </Surface>
          <Surface style={styles.statCard} elevation={2}>
            <Text style={styles.statNumber}>{favorites.size}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </Surface>
        </View>

        {/* Category Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories 📚</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map(renderCategoryChip)}
          </ScrollView>
        </View>

        {/* Progress Section */}
        <Surface style={styles.progressSection} elevation={2}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Your Progress 📈</Text>
            <Text style={styles.progressPercentage}>
              {Math.round((watchedClips.size / mockClips.length) * 100)}%
            </Text>
          </View>
          <ProgressBar
            progress={watchedClips.size / mockClips.length}
            color={COLORS.success}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            You've watched {watchedClips.size} out of {mockClips.length} clips! Keep going! 🎉
          </Text>
        </Surface>

        {/* Training Clips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Training Clips' : `${categories.find(c => c.id === selectedCategory)?.label} Clips`} 🎥
          </Text>
          {filteredClips.length > 0 ? (
            filteredClips.map(renderClipCard)
          ) : (
            <Surface style={styles.emptyState} elevation={1}>
              <Text style={styles.emptyStateEmoji}>🔍</Text>
              <Text style={styles.emptyStateTitle}>No clips found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or category filter
              </Text>
            </Surface>
          )}
        </View>
      </ScrollView>

      {/* Video Modal */}
      <Portal>
        <Modal
          visible={videoModal.visible}
          onDismiss={() => setVideoModal({ visible: false, clip: null })}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.blurContainer}>
            <Surface style={styles.videoModal} elevation={8}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {videoModal.clip?.title}
                </Text>
                <IconButton
                  icon="close"
                  onPress={() => setVideoModal({ visible: false, clip: null })}
                />
              </View>
              
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoPlaceholderEmoji}>
                  {videoModal.clip?.thumbnail}
                </Text>
                <Text style={styles.videoPlaceholderText}>
                  Video Player Coming Soon! 🎬
                </Text>
                <Button
                  mode="contained"
                  onPress={() => {
                    Alert.alert(
                      'Feature Coming Soon! 🚀',
                      'Video playback will be available in the next update!'
                    );
                  }}
                  style={styles.playButton}
                >
                  Play Video ▶️
                </Button>
              </View>
              
              <Text style={styles.modalDescription}>
                {videoModal.clip?.description}
              </Text>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="video-library"
        label="My Library"
        style={styles.fab}
        onPress={() => Alert.alert('Coming Soon! 📚', 'Your personal video library is coming soon!')}
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
    fontSize: 16,
  },
  searchContainer: {
    margin: SPACING.md,
    borderRadius: 12,
  },
  searchbar: {
    backgroundColor: 'white',
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  statNumber: {
    ...TEXT_STYLES.title,
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    fontSize: 12,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoriesScroll: {
    paddingLeft: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  progressSection: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressPercentage: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    fontSize: 14,
  },
  clipCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
  },
  thumbnailContainer: {
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  thumbnailEmoji: {
    fontSize: 48,
  },
  durationBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  watchedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.xs,
  },
  cardContent: {
    padding: SPACING.md,
  },
  clipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  clipTitle: {
    ...TEXT_STYLES.subtitle,
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
  },
  clipDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  clipMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    backgroundColor: COLORS.primary,
  },
  coachName: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  metaRight: {
    flexDirection: 'row',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  metaText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  difficultyContainer: {
    alignItems: 'flex-start',
  },
  difficultyChip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    margin: SPACING.md,
    padding: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  videoModal: {
    width: width - SPACING.xl,
    maxHeight: '80%',
    borderRadius: 16,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  modalTitle: {
    ...TEXT_STYLES.subtitle,
    flex: 1,
    fontSize: 18,
  },
  videoPlaceholder: {
    height: 200,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  videoPlaceholderText: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
  },
  playButton: {
    backgroundColor: COLORS.primary,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    padding: SPACING.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
  },
});

export default TrainingClips;
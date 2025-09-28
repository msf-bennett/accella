import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  StatusBar,
  Alert,
  Animated,
  Share,
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
  Modal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: 'bold' },
  h3: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 14 },
  caption: { fontSize: 12 },
};

const { width, height } = Dimensions.get('window');

const TechniqueVideos = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, techniqueVideos, loading } = useSelector(state => ({
    user: state.user,
    techniqueVideos: state.learning?.techniqueVideos || [],
    loading: state.loading?.techniqueVideos || false,
  }));

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  const [favoriteVideos, setFavoriteVideos] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  // Mock data for technique videos
  const mockTechniqueVideos = [
    {
      id: '1',
      title: 'Perfect Push-Up Form',
      description: 'Master the fundamentals of proper push-up technique',
      thumbnail: 'https://example.com/pushup-thumb.jpg',
      duration: '3:45',
      category: 'Strength',
      difficulty: 'Beginner',
      instructor: 'Sarah Johnson',
      instructorAvatar: 'https://example.com/sarah.jpg',
      views: 15420,
      rating: 4.8,
      tags: ['Push-ups', 'Upper Body', 'Bodyweight'],
      videoUrl: 'https://example.com/pushup-video.mp4',
      keyPoints: [
        'Keep your core engaged throughout',
        'Lower your chest to ground level',
        'Push through your palms, not fingertips',
        'Maintain straight line from head to heels'
      ],
      muscles: ['Chest', 'Shoulders', 'Triceps', 'Core'],
      equipment: ['None'],
      progressions: ['Wall Push-ups', 'Knee Push-ups', 'Standard Push-ups', 'Diamond Push-ups'],
      commonMistakes: [
        'Sagging hips',
        'Partial range of motion',
        'Flared elbows',
        'Looking up instead of down'
      ]
    },
    {
      id: '2',
      title: 'Squat Fundamentals',
      description: 'Learn the foundation of all lower body movements',
      thumbnail: 'https://example.com/squat-thumb.jpg',
      duration: '4:20',
      category: 'Strength',
      difficulty: 'Beginner',
      instructor: 'Mike Rodriguez',
      instructorAvatar: 'https://example.com/mike.jpg',
      views: 22800,
      rating: 4.9,
      tags: ['Squats', 'Lower Body', 'Functional'],
      videoUrl: 'https://example.com/squat-video.mp4',
      keyPoints: [
        'Feet shoulder-width apart',
        'Weight in heels and midfoot',
        'Chest up, core braced',
        'Knees track over toes'
      ],
      muscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Calves'],
      equipment: ['None'],
      progressions: ['Box Squats', 'Bodyweight Squats', 'Goblet Squats', 'Barbell Squats']
    },
    {
      id: '3',
      title: 'Deadlift Technique',
      description: 'Safe and effective deadlift form for maximum results',
      thumbnail: 'https://example.com/deadlift-thumb.jpg',
      duration: '6:15',
      category: 'Strength',
      difficulty: 'Intermediate',
      instructor: 'Emma Thompson',
      instructorAvatar: 'https://example.com/emma.jpg',
      views: 18900,
      rating: 4.7,
      tags: ['Deadlifts', 'Full Body', 'Barbell'],
      videoUrl: 'https://example.com/deadlift-video.mp4',
      keyPoints: [
        'Bar close to shins',
        'Neutral spine throughout',
        'Drive through heels',
        'Hip hinge movement pattern'
      ],
      muscles: ['Hamstrings', 'Glutes', 'Lower Back', 'Traps'],
      equipment: ['Barbell', 'Weight Plates'],
      progressions: ['Romanian Deadlift', 'Trap Bar Deadlift', 'Conventional Deadlift', 'Sumo Deadlift']
    },
    {
      id: '4',
      title: 'Plank Progressions',
      description: 'Build core stability with proper plank variations',
      thumbnail: 'https://example.com/plank-thumb.jpg',
      duration: '5:30',
      category: 'Core',
      difficulty: 'Beginner',
      instructor: 'Alex Chen',
      instructorAvatar: 'https://example.com/alex.jpg',
      views: 12600,
      rating: 4.6,
      tags: ['Planks', 'Core', 'Stability'],
      videoUrl: 'https://example.com/plank-video.mp4',
      keyPoints: [
        'Straight line from head to heels',
        'Engage core muscles',
        'Breathe normally',
        'Keep hips level'
      ],
      muscles: ['Core', 'Shoulders', 'Glutes'],
      equipment: ['None'],
      progressions: ['Wall Plank', 'Knee Plank', 'Standard Plank', 'One-Arm Plank']
    },
    {
      id: '5',
      title: 'Burpee Breakdown',
      description: 'Master this full-body conditioning exercise',
      thumbnail: 'https://example.com/burpee-thumb.jpg',
      duration: '4:45',
      category: 'Cardio',
      difficulty: 'Intermediate',
      instructor: 'Jordan Smith',
      instructorAvatar: 'https://example.com/jordan.jpg',
      views: 9800,
      rating: 4.5,
      tags: ['Burpees', 'HIIT', 'Full Body'],
      videoUrl: 'https://example.com/burpee-video.mp4',
      keyPoints: [
        'Smooth transitions between movements',
        'Land softly from jump',
        'Maintain form when fatigued',
        'Control the descent'
      ],
      muscles: ['Full Body'],
      equipment: ['None'],
      progressions: ['Step-back Burpees', 'Standard Burpees', 'Burpee Box Jumps', 'Burpee Pull-ups']
    },
    {
      id: '6',
      title: 'Pull-Up Mastery',
      description: 'Develop upper body strength with perfect pull-ups',
      thumbnail: 'https://example.com/pullup-thumb.jpg',
      duration: '5:00',
      category: 'Strength',
      difficulty: 'Advanced',
      instructor: 'Ryan Davis',
      instructorAvatar: 'https://example.com/ryan.jpg',
      views: 14200,
      rating: 4.8,
      tags: ['Pull-ups', 'Upper Body', 'Bodyweight'],
      videoUrl: 'https://example.com/pullup-video.mp4',
      keyPoints: [
        'Dead hang to full chin clearance',
        'Controlled negative movement',
        'Engage lats and rear delts',
        'Avoid swinging or kipping'
      ],
      muscles: ['Latissimus Dorsi', 'Biceps', 'Rear Delts', 'Rhomboids'],
      equipment: ['Pull-up Bar'],
      progressions: ['Assisted Pull-ups', 'Negative Pull-ups', 'Standard Pull-ups', 'Weighted Pull-ups']
    }
  ];

  const categories = ['All', 'Strength', 'Cardio', 'Core', 'Flexibility', 'Sports-Specific'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Effects
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

    // Load user's watched and favorite videos
    loadUserProgress();
  }, []);

  // Functions
  const loadUserProgress = useCallback(async () => {
    try {
      // Simulate API call to load user's video progress
      const watchedIds = new Set(['1', '3']); // Mock data
      const favoriteIds = new Set(['1', '2', '4']); // Mock data
      setWatchedVideos(watchedIds);
      setFavoriteVideos(favoriteIds);
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadUserProgress();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh videos');
    } finally {
      setRefreshing(false);
    }
  }, [loadUserProgress]);

  const filteredVideos = mockTechniqueVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || video.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleVideoPress = useCallback((video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  }, []);

  const handleWatchVideo = useCallback((videoId) => {
    setWatchedVideos(prev => new Set([...prev, videoId]));
    // Update progress in backend
  }, []);

  const handleToggleFavorite = useCallback((videoId) => {
    setFavoriteVideos(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(videoId)) {
        newFavorites.delete(videoId);
      } else {
        newFavorites.add(videoId);
      }
      return newFavorites;
    });
  }, []);

  const handleShareVideo = useCallback(async (video) => {
    try {
      await Share.share({
        message: `Check out this technique video: ${video.title}`,
        title: video.title,
      });
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  }, []);

  const renderVideoCard = ({ item }) => (
    <Card style={styles.videoCard} onPress={() => handleVideoPress(item)}>
      <View style={styles.thumbnailContainer}>
        <View style={styles.thumbnailPlaceholder}>
          <Icon name="play-circle-filled" size={40} color={COLORS.white} />
        </View>
        <View style={styles.videoDuration}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(item.id)}
        >
          <Icon 
            name={favoriteVideos.has(item.id) ? "favorite" : "favorite-border"} 
            size={20} 
            color={favoriteVideos.has(item.id) ? COLORS.error : COLORS.white} 
          />
        </TouchableOpacity>
        {watchedVideos.has(item.id) && (
          <View style={styles.watchedIndicator}>
            <Icon name="check-circle" size={20} color={COLORS.success} />
          </View>
        )}
      </View>
      
      <Card.Content style={styles.cardContent}>
        <View style={styles.videoHeader}>
          <Text style={[TEXT_STYLES.h3, styles.videoTitle]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.difficultyChip}>
            <Chip 
              mode="outlined" 
              compact 
              textStyle={styles.chipText}
              style={[styles.chip, { borderColor: getDifficultyColor(item.difficulty) }]}
            >
              {item.difficulty}
            </Chip>
          </View>
        </View>
        
        <Text style={[TEXT_STYLES.body, styles.videoDescription]} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.instructorInfo}>
          <Avatar.Text size={24} label={item.instructor.split(' ').map(n => n[0]).join('')} />
          <Text style={[TEXT_STYLES.caption, styles.instructorName]}>
            {item.instructor}
          </Text>
        </View>
        
        <View style={styles.videoStats}>
          <View style={styles.statItem}>
            <Icon name="visibility" size={16} color={COLORS.textLight} />
            <Text style={styles.statText}>{item.views.toLocaleString()}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="star" size={16} color={COLORS.secondary} />
            <Text style={styles.statText}>{item.rating}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="schedule" size={16} color={COLORS.textLight} />
            <Text style={styles.statText}>{item.duration}</Text>
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <Chip key={index} mode="outlined" compact style={styles.tagChip}>
              {tag}
            </Chip>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.secondary;
      case 'Advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const renderHeader = () => (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.headerGradient}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>
          🎯 Technique Videos
        </Text>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Master proper form and technique
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Your Progress</Text>
            <Text style={styles.progressValue}>
              {watchedVideos.size}/{mockTechniqueVideos.length} videos completed
            </Text>
          </View>
          <ProgressBar 
            progress={watchedVideos.size / mockTechniqueVideos.length}
            color={COLORS.white}
            style={styles.progressBar}
          />
        </View>
      </Animated.View>
    </LinearGradient>
  );

  const renderFilterSection = () => (
    <Surface style={styles.filterSection}>
      <Searchbar
        placeholder="Search techniques..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.primary}
      />
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon name="tune" size={20} color={COLORS.primary} />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
        
        {categories.map((category) => (
          <Chip
            key={category}
            mode={selectedCategory === category ? "flat" : "outlined"}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[styles.filterChip, selectedCategory === category && styles.selectedChip]}
            textStyle={selectedCategory === category && styles.selectedChipText}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>
    </Surface>
  );

  const renderVideoModal = () => (
    <Portal>
      <Modal
        visible={showVideoModal}
        onDismiss={() => setShowVideoModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedVideo && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowVideoModal(false)}
              >
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={() => handleShareVideo(selectedVideo)}
              >
                <Icon name="share" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.videoPlayerPlaceholder}>
              <Icon name="play-circle-filled" size={60} color={COLORS.white} />
              <Text style={styles.videoPlayerText}>Video Player</Text>
            </View>
            
            <View style={styles.videoDetails}>
              <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
                {selectedVideo.title}
              </Text>
              <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
                {selectedVideo.description}
              </Text>
              
              <View style={styles.videoMetrics}>
                <View style={styles.metricItem}>
                  <Icon name="schedule" size={20} color={COLORS.primary} />
                  <Text style={styles.metricText}>Duration: {selectedVideo.duration}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Icon name="trending-up" size={20} color={COLORS.primary} />
                  <Text style={styles.metricText}>Difficulty: {selectedVideo.difficulty}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Icon name="fitness-center" size={20} color={COLORS.primary} />
                  <Text style={styles.metricText}>Category: {selectedVideo.category}</Text>
                </View>
              </View>
              
              {selectedVideo.keyPoints && (
                <View style={styles.section}>
                  <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Key Points 🎯</Text>
                  {selectedVideo.keyPoints.map((point, index) => (
                    <View key={index} style={styles.keyPoint}>
                      <Icon name="check-circle" size={16} color={COLORS.success} />
                      <Text style={styles.keyPointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {selectedVideo.muscles && (
                <View style={styles.section}>
                  <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Muscles Worked 💪</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {selectedVideo.muscles.map((muscle, index) => (
                      <Chip key={index} mode="outlined" style={styles.muscleChip}>
                        {muscle}
                      </Chip>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              {selectedVideo.progressions && (
                <View style={styles.section}>
                  <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Progressions 📈</Text>
                  {selectedVideo.progressions.map((progression, index) => (
                    <View key={index} style={styles.progressionItem}>
                      <Text style={styles.progressionNumber}>{index + 1}</Text>
                      <Text style={styles.progressionText}>{progression}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.modalActions}>
                <Button
                  mode="contained"
                  onPress={() => {
                    handleWatchVideo(selectedVideo.id);
                    Alert.alert('Success', 'Video marked as watched! 🎉');
                  }}
                  style={styles.watchButton}
                  disabled={watchedVideos.has(selectedVideo.id)}
                >
                  {watchedVideos.has(selectedVideo.id) ? '✅ Watched' : '▶️ Mark as Watched'}
                </Button>
                
                <IconButton
                  icon={favoriteVideos.has(selectedVideo.id) ? "favorite" : "favorite-border"}
                  size={24}
                  iconColor={favoriteVideos.has(selectedVideo.id) ? COLORS.error : COLORS.textLight}
                  onPress={() => handleToggleFavorite(selectedVideo.id)}
                />
              </View>
            </View>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {renderFilterSection()}
        
        <View style={styles.videoList}>
          <View style={styles.resultsHeader}>
            <Text style={[TEXT_STYLES.h3, styles.resultsTitle]}>
              {filteredVideos.length} technique video{filteredVideos.length !== 1 ? 's' : ''}
            </Text>
            {favoriteVideos.size > 0 && (
              <Text style={styles.favoritesCount}>
                ❤️ {favoriteVideos.size} favorite{favoriteVideos.size !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          
          <FlatList
            data={filteredVideos}
            renderItem={renderVideoCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
      
      {renderVideoModal()}
      
      <FAB
        icon="video-library"
        style={styles.fab}
        color={COLORS.white}
        onPress={() => {
          Alert.alert(
            'Feature Coming Soon! 🚀',
            'Video library and custom playlists will be available in the next update.'
          );
        }}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: SPACING.lg,
  },
  progressContainer: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  progressValue: {
    color: COLORS.white,
    fontSize: 12,
    opacity: 0.9,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  filterSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 0,
    backgroundColor: COLORS.background,
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  selectedChipText: {
    color: COLORS.white,
  },
  videoList: {
    padding: SPACING.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resultsTitle: {
    color: COLORS.text,
  },
  favoritesCount: {
    color: COLORS.textLight,
    fontSize: 12,
  },
  videoCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnailContainer: {
    height: 200,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: SPACING.xs,
    borderRadius: 20,
  },
  watchedIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.white,
    padding: 2,
    borderRadius: 15,
  },
  cardContent: {
    padding: SPACING.md,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  videoTitle: {
    flex: 1,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  difficultyChip: {
    marginLeft: SPACING.sm,
  },
  chip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
  },
  videoDescription: {
    color: COLORS.textLight,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  instructorName: {
    marginLeft: SPACING.sm,
    color: COLORS.textLight,
  },
  videoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    marginLeft: SPACING.xs,
    color: COLORS.textLight,
    fontSize: 12,
  },
  tagsContainer: {
    marginTop: SPACING.xs,
  },
  tagChip: {
    marginRight: SPACING.xs,
    height: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  shareButton: {
    padding: SPACING.xs,
  },
  videoPlayerPlaceholder: {
    height: 220,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.md,
    borderRadius: 12,
  },
  videoPlayerText: {
    color: COLORS.white,
    marginTop: SPACING.sm,
    fontSize: 16,
    fontWeight: '500',
  },
  videoDetails: {
    padding: SPACING.md,
  },
  modalTitle: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  modalDescription: {
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  videoMetrics: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricText: {
    marginLeft: SPACING.sm,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  keyPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  keyPointText: {
    flex: 1,
    marginLeft: SPACING.sm,
    color: COLORS.text,
    lineHeight: 18,
  },
  muscleChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  progressionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  progressionNumber: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
  },
  progressionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  watchButton: {
    flex: 1,
    marginRight: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default TechniqueVideos;
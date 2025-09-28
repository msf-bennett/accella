import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
  FlatList,
  RefreshControl,
  Vibration,
  Modal,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  ProgressBar,
  IconButton,
  FAB,
  Searchbar,
  Portal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const TechniqueVideos = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { videos, watchHistory } = useSelector(state => state.training);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.9);
  const headerAnim = new Animated.Value(0);

  // Component state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const [userProgress] = useState({
    videosWatched: 18,
    totalDuration: '3h 42m',
    favoriteVideos: 5,
    completedSeries: 2,
    currentStreak: 4,
  });

  const categories = ['All', 'Dribbling 🏃', 'Passing ⚽', 'Shooting 🥅', 'Defense 🛡️', 'Goalkeeping 🥅', 'Fitness 💪'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const [mockVideos] = useState([
    {
      id: '1',
      title: 'Basic Ball Control',
      description: 'Learn fundamental ball control techniques for beginners',
      category: 'Dribbling 🏃',
      level: 'Beginner',
      duration: '8:30',
      views: 1243,
      likes: 98,
      coach: 'Coach Sarah',
      thumbnail: '🏃',
      tags: ['fundamentals', 'touch', 'control'],
      watched: true,
      watchedPercentage: 100,
      favorite: true,
      difficulty: 1,
      rating: 4.8,
      uploadDate: '2024-08-15',
      series: 'Football Basics',
      seriesPosition: 1,
      totalSeriesVideos: 8,
    },
    {
      id: '2',
      title: 'Perfect Passing Technique',
      description: 'Master the art of accurate passing with proper form',
      category: 'Passing ⚽',
      level: 'Intermediate',
      duration: '12:15',
      views: 2156,
      likes: 187,
      coach: 'Coach Mike',
      thumbnail: '⚽',
      tags: ['passing', 'accuracy', 'technique'],
      watched: false,
      watchedPercentage: 0,
      favorite: false,
      difficulty: 2,
      rating: 4.9,
      uploadDate: '2024-08-20',
      series: 'Passing Mastery',
      seriesPosition: 1,
      totalSeriesVideos: 6,
    },
    {
      id: '3',
      title: 'Advanced Dribbling Moves',
      description: 'Step-ups, feints, and advanced dribbling techniques',
      category: 'Dribbling 🏃',
      level: 'Advanced',
      duration: '15:45',
      views: 3421,
      likes: 289,
      coach: 'Coach Alex',
      thumbnail: '🌟',
      tags: ['advanced', 'skills', 'moves'],
      watched: true,
      watchedPercentage: 65,
      favorite: true,
      difficulty: 4,
      rating: 4.7,
      uploadDate: '2024-08-25',
      series: 'Pro Dribbling',
      seriesPosition: 3,
      totalSeriesVideos: 10,
    },
    {
      id: '4',
      title: 'Shooting Power & Precision',
      description: 'Improve your shooting technique for maximum power and accuracy',
      category: 'Shooting 🥅',
      level: 'Intermediate',
      duration: '10:20',
      views: 1876,
      likes: 156,
      coach: 'Coach Emma',
      thumbnail: '🥅',
      tags: ['shooting', 'power', 'accuracy'],
      watched: false,
      watchedPercentage: 0,
      favorite: false,
      difficulty: 3,
      rating: 4.6,
      uploadDate: '2024-08-22',
      series: 'Goal Scoring',
      seriesPosition: 2,
      totalSeriesVideos: 5,
    },
    {
      id: '5',
      title: 'Defensive Positioning',
      description: 'Learn proper defensive positioning and timing',
      category: 'Defense 🛡️',
      level: 'Beginner',
      duration: '9:15',
      views: 987,
      likes: 78,
      coach: 'Coach David',
      thumbnail: '🛡️',
      tags: ['defense', 'positioning', 'tactics'],
      watched: true,
      watchedPercentage: 100,
      favorite: false,
      difficulty: 2,
      rating: 4.5,
      uploadDate: '2024-08-18',
      series: 'Defensive Basics',
      seriesPosition: 1,
      totalSeriesVideos: 4,
    },
    {
      id: '6',
      title: 'Agility & Speed Training',
      description: 'Improve your speed and agility with these exercises',
      category: 'Fitness 💪',
      level: 'All',
      duration: '20:30',
      views: 2987,
      likes: 234,
      coach: 'Coach Lisa',
      thumbnail: '💪',
      tags: ['fitness', 'agility', 'speed'],
      watched: true,
      watchedPercentage: 45,
      favorite: true,
      difficulty: 2,
      rating: 4.8,
      uploadDate: '2024-08-19',
      series: 'Fitness Fundamentals',
      seriesPosition: 2,
      totalSeriesVideos: 12,
    },
  ]);

  useEffect(() => {
    // Entrance animations
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Header animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(headerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  }, []);

  const handleVideoPress = useCallback((video) => {
    Vibration.vibrate(50);
    
    Alert.alert(
      `${video.thumbnail} ${video.title}`,
      `${video.description}\n\nDuration: ${video.duration}\nCoach: ${video.coach}\nLevel: ${video.level}\nRating: ${'⭐'.repeat(Math.floor(video.rating))}`,
      [
        { text: 'Cancel', style: 'cancel' },
        video.watched && video.watchedPercentage < 100 ? 
          { text: 'Continue Watching', onPress: () => playVideo(video) } :
          { text: 'Watch Now 🎬', onPress: () => playVideo(video) },
      ]
    );
  }, []);

  const playVideo = useCallback((video) => {
    // Navigate to video player or simulate video playback
    Alert.alert('Feature Coming Soon', 'Video player is being developed! 🎬');
  }, []);

  const toggleFavorite = useCallback((videoId) => {
    Vibration.vibrate(30);
    dispatch({
      type: 'TOGGLE_VIDEO_FAVORITE',
      payload: { videoId }
    });
  }, [dispatch]);

  const filteredVideos = mockVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || video.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getDifficultyStars = (difficulty) => {
    return '⭐'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  const getWatchStatus = (video) => {
    if (!video.watched) return { color: COLORS.gray, text: 'Not Watched' };
    if (video.watchedPercentage === 100) return { color: '#4CAF50', text: 'Completed' };
    return { color: COLORS.primary, text: `${video.watchedPercentage}% Watched` };
  };

  const renderProgressCard = () => (
    <Card style={styles.progressCard}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.progressGradient}>
        <View style={styles.progressContent}>
          <View style={styles.progressHeader}>
            <Animated.Text
              style={[
                styles.progressTitle,
                {
                  opacity: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.7],
                  }),
                }
              ]}
            >
              Your Learning Journey 📚
            </Animated.Text>
          </View>
          
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressNumber}>{userProgress.videosWatched}</Text>
              <Text style={styles.progressLabel}>Videos Watched</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressNumber}>{userProgress.totalDuration}</Text>
              <Text style={styles.progressLabel}>Total Time</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressNumber}>{userProgress.currentStreak}</Text>
              <Text style={styles.progressLabel}>Day Streak 🔥</Text>
            </View>
          </View>

          <View style={styles.progressFooter}>
            <Text style={styles.completedSeries}>
              {userProgress.completedSeries} Series Completed 🏆
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderVideoCard = ({ item, index }) => {
    const watchStatus = getWatchStatus(item);
    
    return (
      <Animated.View
        style={[
          styles.videoCardContainer,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, index * 5],
              })
            }],
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => handleVideoPress(item)}
          activeOpacity={0.8}
        >
          <Card style={[styles.videoCard, item.watched && styles.watchedCard]}>
            {/* Thumbnail Section */}
            <View style={styles.thumbnailContainer}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.thumbnail}
              >
                <Text style={styles.thumbnailEmoji}>{item.thumbnail}</Text>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{item.duration}</Text>
                </View>
                {item.watched && item.watchedPercentage < 100 && (
                  <View style={styles.progressOverlay}>
                    <ProgressBar
                      progress={item.watchedPercentage / 100}
                      color="#fff"
                      style={styles.videoProgressBar}
                    />
                  </View>
                )}
              </LinearGradient>
              
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(item.id)}
                activeOpacity={0.8}
              >
                <Icon
                  name={item.favorite ? 'favorite' : 'favorite-border'}
                  size={20}
                  color={item.favorite ? '#E91E63' : '#fff'}
                />
              </TouchableOpacity>
            </View>

            {/* Content Section */}
            <View style={styles.videoContent}>
              <View style={styles.videoHeader}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>

              <Text style={styles.videoDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.videoMeta}>
                <View style={styles.coachInfo}>
                  <Avatar.Text
                    size={24}
                    label={item.coach.split(' ')[1][0]}
                    style={styles.coachAvatar}
                    labelStyle={styles.coachAvatarText}
                  />
                  <Text style={styles.coachName}>{item.coach}</Text>
                </View>
                <Text style={styles.viewCount}>{item.views} views</Text>
              </View>

              <View style={styles.videoTags}>
                <Chip
                  style={[styles.levelChip, { backgroundColor: getLevelColor(item.level) + '20' }]}
                  textStyle={[styles.levelChipText, { color: getLevelColor(item.level) }]}
                  compact
                >
                  {item.level}
                </Chip>
                <Text style={styles.difficultyStars}>
                  {getDifficultyStars(item.difficulty)}
                </Text>
              </View>

              <View style={styles.seriesInfo}>
                <Text style={styles.seriesText}>
                  {item.series} • {item.seriesPosition}/{item.totalSeriesVideos}
                </Text>
              </View>

              <View style={styles.watchStatusContainer}>
                <View style={[styles.watchStatusDot, { backgroundColor: watchStatus.color }]} />
                <Text style={[styles.watchStatusText, { color: watchStatus.color }]}>
                  {watchStatus.text}
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return COLORS.primary;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Technique Videos 🎬</Text>
          <View style={styles.headerActions}>
            <IconButton
              icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
              iconColor="#fff"
              size={24}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            />
            <IconButton
              icon="filter-list"
              iconColor="#fff"
              size={24}
              onPress={() => setShowFilters(true)}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim }
          ]}
        >
          {/* Progress Card */}
          {renderProgressCard()}

          {/* Search Bar */}
          <Searchbar
            placeholder="Search videos, coaches, techniques..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />

          {/* Quick Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <Chip
                key={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.selectedCategoryChip
                ]}
                textStyle={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText
                ]}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>

          {/* Videos Section */}
          <View style={styles.videosSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {filteredVideos.length} Video{filteredVideos.length !== 1 ? 's' : ''} Available
              </Text>
              <Text style={styles.sectionSubtitle}>
                Keep learning and improving! 🌟
              </Text>
            </View>

            <FlatList
              data={filteredVideos}
              renderItem={renderVideoCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              numColumns={viewMode === 'grid' ? 1 : 1}
              key={viewMode}
            />
          </View>
        </Animated.View>
      </ScrollView>

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.filterModal}
        >
          <Surface style={styles.filterContent}>
            <Text style={styles.filterTitle}>Filter Videos 🔍</Text>
            
            <Text style={styles.filterSectionTitle}>Level</Text>
            <View style={styles.filterChips}>
              {levels.map((level) => (
                <Chip
                  key={level}
                  selected={selectedLevel === level}
                  onPress={() => setSelectedLevel(level)}
                  style={[styles.filterChip, selectedLevel === level && styles.selectedFilterChip]}
                >
                  {level}
                </Chip>
              ))}
            </View>

            <View style={styles.filterActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setSelectedLevel('All');
                  setSelectedCategory('All');
                }}
                style={styles.clearButton}
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilters(false)}
                style={styles.applyButton}
              >
                Apply Filters
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="download"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon', 'Offline video downloads coming soon! 📱')}
        color="#fff"
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  progressCard: {
    marginBottom: SPACING.lg,
    elevation: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressGradient: {
    padding: SPACING.lg,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressHeader: {
    marginBottom: SPACING.md,
  },
  progressTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.md,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  progressFooter: {
    alignItems: 'center',
  },
  completedSeries: {
    ...TEXT_STYLES.body,
    color: '#fff',
    fontWeight: 'bold',
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: SPACING.lg,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.lightGray,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.text,
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  videosSection: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  videoCardContainer: {
    marginBottom: SPACING.lg,
  },
  videoCard: {
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  watchedCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailEmoji: {
    fontSize: 48,
  },
  durationBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: SPACING.xs,
  },
  videoProgressBar: {
    height: 3,
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContent: {
    padding: SPACING.md,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  videoTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    flex: 1,
    marginRight: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
  },
  videoDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  coachAvatarText: {
    fontSize: 10,
  },
  coachName: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  viewCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  videoTags: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  levelChip: {
    height: 24,
  },
  levelChipText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  difficultyStars: {
    fontSize: 12,
  },
  seriesInfo: {
    marginBottom: SPACING.sm,
  },
  seriesText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  watchStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  watchStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  watchStatusText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  filterModal: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  filterContent: {
    padding: SPACING.lg,
    borderRadius: 12,
  },
  filterTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  filterChip: {
    backgroundColor: COLORS.lightGray,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  clearButton: {
    flex: 0.4,
  },
  applyButton: {
    flex: 0.4,
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default TechniqueVideos;
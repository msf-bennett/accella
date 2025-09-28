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
  FlatList,
  ImageBackground,
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
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';
import PlaceholderScreen from '../components/PlaceholderScreen';

const { width: screenWidth } = Dimensions.get('window');

const VideoTutorials = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, userRole } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Video tutorial categories
  const categories = [
    { id: 'all', label: 'All Videos', icon: 'play-circle-filled', color: COLORS.primary },
    { id: 'techniques', label: 'Exercise Techniques', icon: 'fitness-center', color: '#FF6B6B' },
    { id: 'coaching', label: 'Coaching Methods', icon: 'groups', color: '#4ECDC4' },
    { id: 'nutrition', label: 'Nutrition Tips', icon: 'restaurant', color: '#45B7D1' },
    { id: 'business', label: 'Business Skills', icon: 'business-center', color: '#96CEB4' },
    { id: 'assessment', label: 'Client Assessment', icon: 'assignment', color: '#FECA57' },
    { id: 'motivation', label: 'Motivation & Psychology', icon: 'psychology', color: '#FF9FF3' },
    { id: 'injury', label: 'Injury Prevention', icon: 'healing', color: '#A8E6CF' },
  ];

  // Comprehensive video tutorial library
  const videoTutorials = [
    {
      id: 1,
      title: 'Perfect Squat Form Breakdown',
      category: 'techniques',
      instructor: 'Dr. Sarah Mitchell',
      duration: '12:45',
      difficulty: 'Beginner',
      views: '25.3K',
      rating: 4.9,
      thumbnail: 'https://picsum.photos/400/300?random=1',
      description: 'Master the fundamentals of proper squat technique to prevent injury and maximize results.',
      tags: ['squats', 'form', 'lower-body', 'fundamentals'],
      chapters: [
        { title: 'Setup & Stance', time: '0:00' },
        { title: 'Descent Mechanics', time: '3:20' },
        { title: 'Drive Phase', time: '7:15' },
        { title: 'Common Mistakes', time: '9:30' }
      ],
      points: 150,
      watchTime: 0,
      totalDuration: 765, // in seconds
      isNew: true,
      isFeatured: false,
    },
    {
      id: 2,
      title: 'Client Motivation Psychology',
      category: 'motivation',
      instructor: 'Prof. Mike Johnson',
      duration: '18:20',
      difficulty: 'Intermediate',
      views: '18.7K',
      rating: 4.8,
      thumbnail: 'https://picsum.photos/400/300?random=2',
      description: 'Understand the psychological principles that drive client motivation and long-term adherence.',
      tags: ['psychology', 'motivation', 'client-relations', 'behavior-change'],
      chapters: [
        { title: 'Understanding Motivation', time: '0:00' },
        { title: 'Goal Setting Strategies', time: '5:45' },
        { title: 'Overcoming Plateaus', time: '11:20' },
        { title: 'Building Habits', time: '15:10' }
      ],
      points: 200,
      watchTime: 650,
      totalDuration: 1100,
      isNew: false,
      isFeatured: true,
    },
    {
      id: 3,
      title: 'Functional Movement Screen',
      category: 'assessment',
      instructor: 'Dr. Lisa Chen',
      duration: '22:15',
      difficulty: 'Advanced',
      views: '31.2K',
      rating: 4.9,
      thumbnail: 'https://picsum.photos/400/300?random=3',
      description: 'Learn to conduct comprehensive movement assessments to identify limitations and imbalances.',
      tags: ['assessment', 'movement', 'screening', 'injury-prevention'],
      chapters: [
        { title: 'Assessment Overview', time: '0:00' },
        { title: '7 Basic Movements', time: '4:30' },
        { title: 'Scoring & Interpretation', time: '14:20' },
        { title: 'Corrective Strategies', time: '18:45' }
      ],
      points: 250,
      watchTime: 1335,
      totalDuration: 1335,
      isNew: false,
      isFeatured: true,
    },
    {
      id: 4,
      title: 'Building Your Fitness Business',
      category: 'business',
      instructor: 'Marcus Rodriguez',
      duration: '15:30',
      difficulty: 'Intermediate',
      views: '22.8K',
      rating: 4.7,
      thumbnail: 'https://picsum.photos/400/300?random=4',
      description: 'Essential strategies for growing your personal training business and increasing client retention.',
      tags: ['business', 'marketing', 'client-retention', 'growth'],
      chapters: [
        { title: 'Market Analysis', time: '0:00' },
        { title: 'Pricing Strategies', time: '6:15' },
        { title: 'Client Acquisition', time: '9:45' },
        { title: 'Retention Tactics', time: '12:30' }
      ],
      points: 180,
      watchTime: 0,
      totalDuration: 930,
      isNew: true,
      isFeatured: false,
    },
    {
      id: 5,
      title: 'Nutrition Periodization',
      category: 'nutrition',
      instructor: 'Dr. Amanda Foster',
      duration: '20:10',
      difficulty: 'Advanced',
      views: '16.4K',
      rating: 4.8,
      thumbnail: 'https://picsum.photos/400/300?random=5',
      description: 'Advanced nutrition strategies for periodizing client diets based on training phases.',
      tags: ['nutrition', 'periodization', 'advanced', 'performance'],
      chapters: [
        { title: 'Periodization Principles', time: '0:00' },
        { title: 'Macronutrient Cycling', time: '7:20' },
        { title: 'Competition Prep', time: '13:45' },
        { title: 'Recovery Nutrition', time: '17:30' }
      ],
      points: 220,
      watchTime: 0,
      totalDuration: 1210,
      isNew: false,
      isFeatured: false,
    },
    {
      id: 6,
      title: 'Effective Coaching Communication',
      category: 'coaching',
      instructor: 'Jennifer Walsh',
      duration: '14:25',
      difficulty: 'Beginner',
      views: '29.1K',
      rating: 4.9,
      thumbnail: 'https://picsum.photos/400/300?random=6',
      description: 'Master the art of clear, motivating communication with clients of all backgrounds.',
      tags: ['communication', 'coaching', 'client-relations', 'leadership'],
      chapters: [
        { title: 'Active Listening', time: '0:00' },
        { title: 'Giving Feedback', time: '4:45' },
        { title: 'Difficult Conversations', time: '8:20' },
        { title: 'Building Rapport', time: '11:15' }
      ],
      points: 160,
      watchTime: 865,
      totalDuration: 865,
      isNew: false,
      isFeatured: false,
    },
    {
      id: 7,
      title: 'Injury Prevention Protocols',
      category: 'injury',
      instructor: 'Dr. Robert Kim',
      duration: '19:35',
      difficulty: 'Intermediate',
      views: '20.5K',
      rating: 4.8,
      thumbnail: 'https://picsum.photos/400/300?random=7',
      description: 'Comprehensive approach to identifying risk factors and implementing prevention strategies.',
      tags: ['injury-prevention', 'safety', 'protocols', 'risk-assessment'],
      chapters: [
        { title: 'Risk Factor Assessment', time: '0:00' },
        { title: 'Warm-up Protocols', time: '6:10' },
        { title: 'Load Management', time: '12:25' },
        { title: 'Recovery Strategies', time: '16:40' }
      ],
      points: 190,
      watchTime: 0,
      totalDuration: 1175,
      isNew: true,
      isFeatured: false,
    },
  ];

  // Filter videos based on category and search
  const filteredVideos = videoTutorials.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Statistics
  const totalWatchTime = videoTutorials.reduce((acc, video) => acc + video.watchTime, 0);
  const completedVideos = videoTutorials.filter(video => video.watchTime >= video.totalDuration).length;
  const totalPoints = videoTutorials.reduce((acc, video) => {
    return acc + (video.watchTime >= video.totalDuration ? video.points : 0);
  }, 0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Load user data
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Simulate loading watched videos and favorites
    setWatchedVideos(new Set([2, 3, 6]));
    setFavorites(new Set([1, 3, 5]));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      loadUserData();
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const handleVideoPress = (video) => {
    Vibration.vibrate(50);
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const handlePlayVideo = (video) => {
    Alert.alert(
      'Play Video 🎥',
      `Ready to watch "${video.title}" by ${video.instructor}? Duration: ${video.duration}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Watch Now! ▶️', 
          onPress: () => {
            setShowVideoModal(false);
            // Navigate to video player or show placeholder
            Alert.alert('Video Player', 'Video player feature coming soon! 🚧');
          }
        }
      ]
    );
  };

  const toggleFavorite = (videoId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(videoId)) {
        newFavorites.delete(videoId);
      } else {
        newFavorites.add(videoId);
      }
      return newFavorites;
    });
    Vibration.vibrate(30);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return '#4ECDC4';
      case 'Intermediate': return '#FFE66D';
      case 'Advanced': return '#FF6B6B';
      default: return COLORS.primary;
    }
  };

  const formatWatchTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
            Video Tutorials 🎥
          </Text>
          <View style={styles.headerActions}>
            <IconButton
              icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
              iconColor="white"
              size={24}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            />
            <IconButton
              icon="account-circle"
              iconColor="white"
              size={28}
              onPress={() => Alert.alert('Profile', 'Profile feature coming soon!')}
            />
          </View>
        </View>
        
        {/* Learning Progress */}
        <Surface style={styles.progressCard} elevation={2}>
          <View style={styles.progressHeader}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              Learning Progress 📊
            </Text>
            <Chip
              mode="outlined"
              textStyle={{ color: COLORS.success, fontWeight: 'bold' }}
              style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}
            >
              🎯 {totalPoints} pts earned
            </Chip>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Completed
              </Text>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                {completedVideos}/{videoTutorials.length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Watch Time
              </Text>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
                {formatWatchTime(totalWatchTime)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Favorites
              </Text>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.error }]}>
                {favorites.size} ❤️
              </Text>
            </View>
          </View>
          
          <ProgressBar
            progress={completedVideos / videoTutorials.length}
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
        Video Categories 🎯
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
                  fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                  textAlign: 'center'
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

  const renderVideoCardGrid = (video) => (
    <TouchableOpacity
      key={video.id}
      onPress={() => handleVideoPress(video)}
      style={styles.videoCardContainer}
    >
      <Card style={styles.videoCard} elevation={3}>
        {/* Video Thumbnail */}
        <ImageBackground
          source={{ uri: video.thumbnail }}
          style={styles.thumbnail}
          imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.thumbnailOverlay}
          >
            <View style={styles.thumbnailContent}>
              <View style={styles.thumbnailTop}>
                {video.isNew && (
                  <Chip
                    mode="outlined"
                    textStyle={{ color: 'white', fontSize: 10 }}
                    style={styles.newBadge}
                  >
                    🆕 NEW
                  </Chip>
                )}
                {video.isFeatured && (
                  <Chip
                    mode="outlined"
                    textStyle={{ color: 'white', fontSize: 10 }}
                    style={styles.featuredBadge}
                  >
                    ⭐ FEATURED
                  </Chip>
                )}
                <TouchableOpacity
                  onPress={() => toggleFavorite(video.id)}
                  style={styles.favoriteButton}
                >
                  <Icon
                    name={favorites.has(video.id) ? 'favorite' : 'favorite-border'}
                    size={20}
                    color={favorites.has(video.id) ? '#FF6B6B' : 'white'}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.thumbnailBottom}>
                <View style={styles.playButton}>
                  <Icon name="play-arrow" size={32} color="white" />
                </View>
                <View style={styles.videoDuration}>
                  <Text style={[TEXT_STYLES.caption, { color: 'white' }]}>
                    {video.duration}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Video Info */}
        <View style={styles.videoInfo}>
          <View style={styles.videoHeader}>
            <Text style={[TEXT_STYLES.h4, styles.videoTitle]} numberOfLines={2}>
              {video.title}
            </Text>
            <View style={styles.videoMeta}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                by {video.instructor}
              </Text>
              <View style={styles.metaRow}>
                <Icon name="visibility" size={14} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                  {video.views}
                </Text>
                <Icon name="star" size={14} color="#FFD700" style={{ marginLeft: 8 }} />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                  {video.rating}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.videoTags}>
            <Chip
              mode="outlined"
              textStyle={{ fontSize: 10, color: getDifficultyColor(video.difficulty) }}
              style={{
                backgroundColor: `${getDifficultyColor(video.difficulty)}20`,
                height: 24,
                marginRight: 8,
              }}
            >
              {video.difficulty}
            </Chip>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
              {video.points} pts
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <ProgressBar
              progress={video.watchTime / video.totalDuration}
              color={video.watchTime >= video.totalDuration ? COLORS.success : COLORS.primary}
              style={styles.videoProgress}
            />
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: 4 }]}>
              {video.watchTime >= video.totalDuration 
                ? 'Completed ✓' 
                : `${Math.round((video.watchTime / video.totalDuration) * 100)}% watched`
              }
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderVideoModal = () => (
    <Portal>
      {showVideoModal && selectedVideo && (
        <BlurView
          style={styles.modalOverlay}
          blurType="dark"
          blurAmount={5}
          reducedTransparencyFallbackColor="rgba(0,0,0,0.8)"
        >
          <View style={styles.modalContent}>
            <Card style={styles.modalCard} elevation={8}>
              {/* Modal Header */}
              <ImageBackground
                source={{ uri: selectedVideo.thumbnail }}
                style={styles.modalThumbnail}
                imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.modalThumbnailOverlay}
                >
                  <IconButton
                    icon="close"
                    iconColor="white"
                    size={24}
                    onPress={() => setShowVideoModal(false)}
                    style={styles.closeButton}
                  />
                  <View style={styles.modalPlaySection}>
                    <TouchableOpacity
                      style={styles.modalPlayButton}
                      onPress={() => handlePlayVideo(selectedVideo)}
                    >
                      <Icon name="play-arrow" size={48} color="white" />
                    </TouchableOpacity>
                    <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center', marginTop: 12 }]}>
                      {selectedVideo.title}
                    </Text>
                  </View>
                </LinearGradient>
              </ImageBackground>

              {/* Modal Body */}
              <View style={styles.modalBody}>
                <View style={styles.modalMeta}>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary }]}>
                    by {selectedVideo.instructor}
                  </Text>
                  <View style={styles.modalMetaRow}>
                    <Chip
                      mode="outlined"
                      textStyle={{ fontSize: 12, color: getDifficultyColor(selectedVideo.difficulty) }}
                      style={{ backgroundColor: `${getDifficultyColor(selectedVideo.difficulty)}20` }}
                    >
                      {selectedVideo.difficulty}
                    </Chip>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      {selectedVideo.duration} • {selectedVideo.points} pts
                    </Text>
                  </View>
                </View>

                <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
                  {selectedVideo.description}
                </Text>

                <Text style={[TEXT_STYLES.h3, { marginBottom: 12, marginTop: 16 }]}>
                  Video Chapters 📋
                </Text>
                {selectedVideo.chapters.map((chapter, index) => (
                  <View key={index} style={styles.chapterItem}>
                    <Icon name="play-circle-outline" size={20} color={COLORS.primary} />
                    <View style={styles.chapterInfo}>
                      <Text style={[TEXT_STYLES.body, { flex: 1 }]}>
                        {chapter.title}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                        {chapter.time}
                      </Text>
                    </View>
                  </View>
                ))}

                <View style={styles.modalActions}>
                  <Button
                    mode="contained"
                    onPress={() => handlePlayVideo(selectedVideo)}
                    style={styles.watchButton}
                    contentStyle={{ paddingVertical: 8 }}
                    buttonColor={COLORS.primary}
                  >
                    Watch Now ▶️
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      toggleFavorite(selectedVideo.id);
                      setShowVideoModal(false);
                    }}
                    style={styles.favoriteActionButton}
                    textColor={favorites.has(selectedVideo.id) ? COLORS.error : COLORS.primary}
                  >
                    {favorites.has(selectedVideo.id) ? '❤️ Favorited' : '🤍 Add to Favorites'}
                  </Button>
                </View>
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
            placeholder="Search video tutorials... 🔍"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={TEXT_STYLES.body}
          />

          {renderCategoryFilter()}

          <View style={styles.videosSection}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              {selectedCategory === 'all' ? 'All Videos' : 
               categories.find(c => c.id === selectedCategory)?.label} 
              ({filteredVideos.length})
            </Text>

            {filteredVideos.length === 0 ? (
              <PlaceholderScreen
                title="No Videos Found"
                subtitle="Try adjusting your search or category filter"
                icon="video-library"
              />
            ) : (
              <View style={styles.videosGrid}>
                {filteredVideos.map(renderVideoCardGrid)}
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {renderVideoModal()}

      <FAB
        style={styles.fab}
        icon="playlist-add"
        onPress={() => Alert.alert('Create Playlist', 'Custom playlists coming soon! 🎬')}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    minWidth: 90,
    height: 80,
    borderRadius: 12,
  },
  videosSection: {
    marginBottom: SPACING.xl,
  },
  videosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  videoCardContainer: {
    width: (screenWidth - (SPACING.lg * 3)) / 2,
    marginBottom: SPACING.lg,
  },
  videoCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
  },
  thumbnailOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.sm,
  },
  thumbnailContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  thumbnailTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  newBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    height: 20,
  },
  featuredBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    height: 20,
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDuration: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
  },
  videoInfo: {
    padding: SPACING.md,
  },
  videoHeader: {
    marginBottom: SPACING.sm,
  },
  videoTitle: {
    marginBottom: 4,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  videoMeta: {
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  videoTags: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressSection: {
    marginTop: SPACING.sm,
  },
  videoProgress: {
    height: 4,
    borderRadius: 2,
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
  modalThumbnail: {
    width: '100%',
    height: 200,
  },
  modalThumbnailOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  modalPlaySection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  modalBody: {
    padding: SPACING.lg,
  },
  modalMeta: {
    marginBottom: SPACING.md,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  modalDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  chapterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    flex: 1,
  },
  modalActions: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  watchButton: {
    borderRadius: 12,
  },
  favoriteActionButton: {
    borderRadius: 12,
    borderColor: COLORS.primary,
  },
});

export default VideoTutorials;
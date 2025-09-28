import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Dimensions,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Vibration,
  Modal,
  FlatList,
} from 'react-native';
import {
  Card,
  Button,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Chip,
  Portal,
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
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
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
};

const { width, height } = Dimensions.get('window');

const TechniqueVideos = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userSport = useSelector(state => state.profile.sport);
  const watchedVideos = useSelector(state => state.training.watchedVideos);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [favoriteVideos, setFavoriteVideos] = useState([]);
  const [watchProgress, setWatchProgress] = useState({});

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Mock data for development
  const mockVideos = [
    {
      id: 1,
      title: 'Perfect Free Kick Technique ⚽',
      description: 'Master the art of free kicks with professional tips',
      duration: '8:45',
      views: '12.5K',
      likes: '1.2K',
      category: 'football',
      skillLevel: 'intermediate',
      thumbnail: 'https://placeholder.com/300x200',
      instructor: 'Coach Martinez',
      rating: 4.8,
      tags: ['free-kick', 'shooting', 'technique'],
      difficulty: 3,
      equipment: ['Ball', 'Goals'],
      watchTime: 0,
      totalTime: 525, // seconds
      isNew: true,
      isPremium: false,
    },
    {
      id: 2,
      title: 'Basketball Shooting Form 🏀',
      description: 'Develop perfect shooting mechanics for consistent scoring',
      duration: '12:30',
      views: '24.8K',
      likes: '2.1K',
      category: 'basketball',
      skillLevel: 'beginner',
      thumbnail: 'https://placeholder.com/300x200',
      instructor: 'Coach Johnson',
      rating: 4.9,
      tags: ['shooting', 'form', 'fundamentals'],
      difficulty: 2,
      equipment: ['Basketball', 'Hoop'],
      watchTime: 180,
      totalTime: 750,
      isNew: false,
      isPremium: true,
    },
    {
      id: 3,
      title: 'Tennis Serve Mastery 🎾',
      description: 'Power and precision in your tennis serve technique',
      duration: '15:20',
      views: '18.3K',
      likes: '1.8K',
      category: 'tennis',
      skillLevel: 'advanced',
      thumbnail: 'https://placeholder.com/300x200',
      instructor: 'Pro Sarah Wilson',
      rating: 4.7,
      tags: ['serve', 'power', 'accuracy'],
      difficulty: 4,
      equipment: ['Racket', 'Balls'],
      watchTime: 920,
      totalTime: 920,
      isNew: false,
      isPremium: false,
    },
    {
      id: 4,
      title: 'Swimming Freestyle Stroke 🏊‍♂️',
      description: 'Efficient freestyle technique for speed and endurance',
      duration: '10:15',
      views: '9.7K',
      likes: '892',
      category: 'swimming',
      skillLevel: 'intermediate',
      thumbnail: 'https://placeholder.com/300x200',
      instructor: 'Coach Thompson',
      rating: 4.6,
      tags: ['freestyle', 'stroke', 'technique'],
      difficulty: 3,
      equipment: ['Pool', 'Goggles'],
      watchTime: 615,
      totalTime: 615,
      isNew: true,
      isPremium: false,
    },
    {
      id: 5,
      title: 'Volleyball Spike Training 🏐',
      description: 'Powerful attacking techniques and timing',
      duration: '9:30',
      views: '15.2K',
      likes: '1.4K',
      category: 'volleyball',
      skillLevel: 'intermediate',
      thumbnail: 'https://placeholder.com/300x200',
      instructor: 'Coach Davis',
      rating: 4.5,
      tags: ['spike', 'attack', 'jumping'],
      difficulty: 3,
      equipment: ['Volleyball', 'Net'],
      watchTime: 0,
      totalTime: 570,
      isNew: false,
      isPremium: true,
    },
  ];

  const categories = [
    { key: 'all', label: 'All Sports', icon: 'sports' },
    { key: 'football', label: 'Football', icon: 'sports-soccer' },
    { key: 'basketball', label: 'Basketball', icon: 'sports-basketball' },
    { key: 'tennis', label: 'Tennis', icon: 'sports-tennis' },
    { key: 'swimming', label: 'Swimming', icon: 'pool' },
    { key: 'volleyball', label: 'Volleyball', icon: 'sports-volleyball' },
  ];

  const skillLevels = [
    { key: 'all', label: 'All Levels', color: COLORS.textSecondary },
    { key: 'beginner', label: 'Beginner', color: COLORS.success },
    { key: 'intermediate', label: 'Intermediate', color: COLORS.warning },
    { key: 'advanced', label: 'Advanced', color: COLORS.error },
  ];

  const playlists = [
    {
      id: 1,
      title: 'My Favorites ❤️',
      count: 12,
      thumbnail: 'https://placeholder.com/150x100',
      description: 'Your liked videos',
    },
    {
      id: 2,
      title: 'Watch Later 📚',
      count: 8,
      thumbnail: 'https://placeholder.com/150x100',
      description: 'Save for later viewing',
    },
    {
      id: 3,
      title: 'Fundamentals 🎯',
      count: 15,
      thumbnail: 'https://placeholder.com/150x100',
      description: 'Basic skill development',
    },
  ];

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize watch progress
    const progress = {};
    mockVideos.forEach(video => {
      progress[video.id] = video.watchTime / video.totalTime;
    });
    setWatchProgress(progress);
  }, []);

  useEffect(() => {
    // Animate progress bars
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [watchProgress]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleVideoPress = (video) => {
    setSelectedVideo(video);
    setVideoModalVisible(true);
    Vibration.vibrate(50);
  };

  const toggleFavorite = (videoId) => {
    setFavoriteVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
    Vibration.vibrate(50);
  };

  const watchVideo = () => {
    if (selectedVideo) {
      // Update watch progress
      setWatchProgress(prev => ({
        ...prev,
        [selectedVideo.id]: 1.0
      }));
      
      setVideoModalVisible(false);
      Vibration.vibrate(100);
      
      Alert.alert(
        'Video Player 📺',
        `Now playing: ${selectedVideo.title}\n\nThis would open the video player in a real app.`,
        [{ text: 'Got it!', style: 'default' }]
      );
    }
  };

  const getDifficultyStars = (difficulty) => {
    return Array(5).fill(0).map((_, index) => (
      <Icon
        key={index}
        name="star"
        size={12}
        color={index < difficulty ? COLORS.warning : COLORS.textSecondary}
        style={{ opacity: index < difficulty ? 1 : 0.3 }}
      />
    ));
  };

  const getProgressColor = (progress) => {
    if (progress === 0) return COLORS.textSecondary;
    if (progress < 1) return COLORS.warning;
    return COLORS.success;
  };

  const filteredVideos = mockVideos.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesSkillLevel = selectedSkillLevel === 'all' || video.skillLevel === selectedSkillLevel;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSkillLevel && matchesSearch;
  });

  const LearningProgress = () => {
    const completedVideos = Object.values(watchProgress).filter(progress => progress === 1).length;
    const totalVideos = mockVideos.length;
    const progressPercentage = totalVideos > 0 ? completedVideos / totalVideos : 0;

    return (
      <Card style={styles.progressCard}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.progressGradient}
        >
          <View style={styles.progressHeader}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>Learning Progress 📈</Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              {completedVideos} of {totalVideos} videos completed
            </Text>
          </View>
          <ProgressBar 
            progress={progressPercentage} 
            color="white" 
            style={styles.progressBar}
          />
          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>2h 45m</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Watch Time 🎬
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>8</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Skills Learned 🎯
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  const VideoCard = ({ video }) => {
    const progress = watchProgress[video.id] || 0;
    const isFavorite = favoriteVideos.includes(video.id);

    return (
      <TouchableOpacity onPress={() => handleVideoPress(video)}>
        <Card style={[styles.videoCard, progress === 1 && styles.completedCard]}>
          <View style={styles.thumbnailContainer}>
            <View style={styles.thumbnailPlaceholder}>
              <Icon name="play-circle-filled" size={48} color="rgba(255,255,255,0.8)" />
            </View>
            
            {video.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
            
            {video.isPremium && (
              <View style={styles.premiumBadge}>
                <Icon name="star" size={12} color="white" />
              </View>
            )}

            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{video.duration}</Text>
            </View>

            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(video.id)}
            >
              <Icon 
                name={isFavorite ? "favorite" : "favorite-border"} 
                size={20} 
                color={isFavorite ? COLORS.accent : "white"} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.videoInfo}>
            <View style={styles.videoHeader}>
              <Text style={[TEXT_STYLES.body, styles.videoTitle]} numberOfLines={2}>
                {video.title}
              </Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={14} color={COLORS.warning} />
                <Text style={[TEXT_STYLES.caption, styles.rating]}>{video.rating}</Text>
              </View>
            </View>

            <Text style={[TEXT_STYLES.caption, styles.videoDescription]} numberOfLines={2}>
              {video.description}
            </Text>

            <View style={styles.videoMeta}>
              <Text style={[TEXT_STYLES.caption, styles.instructor]}>
                by {video.instructor}
              </Text>
              <View style={styles.difficultyStars}>
                {getDifficultyStars(video.difficulty)}
              </View>
            </View>

            <View style={styles.videoStats}>
              <View style={styles.statGroup}>
                <Icon name="visibility" size={14} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, styles.statText]}>{video.views}</Text>
              </View>
              <View style={styles.statGroup}>
                <Icon name="thumb-up" size={14} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, styles.statText]}>{video.likes}</Text>
              </View>
              <Chip 
                mode="outlined" 
                compact
                textStyle={{ fontSize: 10 }}
                style={[styles.skillChip, { borderColor: skillLevels.find(s => s.key === video.skillLevel)?.color }]}
              >
                {video.skillLevel}
              </Chip>
            </View>

            {progress > 0 && (
              <View style={styles.progressContainer}>
                <ProgressBar 
                  progress={progress} 
                  color={getProgressColor(progress)}
                  style={styles.videoProgress}
                />
                <Text style={[TEXT_STYLES.caption, styles.progressText]}>
                  {progress === 1 ? 'Completed ✅' : `${Math.round(progress * 100)}% watched`}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const PlaylistCard = ({ playlist }) => (
    <TouchableOpacity 
      style={styles.playlistCard}
      onPress={() => Alert.alert('Playlist', `Opening ${playlist.title}... 🚧`)}
    >
      <View style={styles.playlistThumbnail}>
        <Icon name="playlist-play" size={32} color={COLORS.primary} />
      </View>
      <View style={styles.playlistInfo}>
        <Text style={[TEXT_STYLES.body, styles.playlistTitle]}>{playlist.title}</Text>
        <Text style={[TEXT_STYLES.caption, styles.playlistCount]}>
          {playlist.count} videos
        </Text>
      </View>
    </TouchableOpacity>
  );

  const VideoModal = () => (
    <Portal>
      <Modal
        visible={videoModalVisible}
        onDismiss={() => setVideoModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.videoModal}>
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h3, styles.modalTitle]} numberOfLines={2}>
              {selectedVideo?.title}
            </Text>
            <IconButton
              icon="close"
              onPress={() => setVideoModalVisible(false)}
            />
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.videoPreview}>
              <View style={styles.previewThumbnail}>
                <Icon name="play-circle-filled" size={64} color={COLORS.primary} />
              </View>
            </View>

            <View style={styles.modalInfo}>
              <View style={styles.instructorInfo}>
                <Avatar.Text 
                  size={40} 
                  label={selectedVideo?.instructor?.charAt(0) || 'C'}
                  style={{ backgroundColor: COLORS.primary }}
                />
                <View style={styles.instructorDetails}>
                  <Text style={[TEXT_STYLES.body, styles.instructorName]}>
                    {selectedVideo?.instructor}
                  </Text>
                  <View style={styles.videoRating}>
                    <Icon name="star" size={16} color={COLORS.warning} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                      {selectedVideo?.rating} rating
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
                {selectedVideo?.description}
              </Text>

              <View style={styles.modalStats}>
                <Surface style={styles.modalStat}>
                  <Icon name="schedule" size={20} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.caption, styles.modalStatText]}>Duration</Text>
                  <Text style={[TEXT_STYLES.body, styles.modalStatValue]}>
                    {selectedVideo?.duration}
                  </Text>
                </Surface>
                <Surface style={styles.modalStat}>
                  <Icon name="visibility" size={20} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.caption, styles.modalStatText]}>Views</Text>
                  <Text style={[TEXT_STYLES.body, styles.modalStatValue]}>
                    {selectedVideo?.views}
                  </Text>
                </Surface>
                <Surface style={styles.modalStat}>
                  <Icon name="thumb-up" size={20} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.caption, styles.modalStatText]}>Likes</Text>
                  <Text style={[TEXT_STYLES.body, styles.modalStatValue]}>
                    {selectedVideo?.likes}
                  </Text>
                </Surface>
              </View>

              <View style={styles.equipmentSection}>
                <Text style={[TEXT_STYLES.body, styles.sectionTitle]}>Equipment Needed:</Text>
                <View style={styles.equipmentList}>
                  {selectedVideo?.equipment?.map((item, index) => (
                    <Chip key={index} mode="outlined" compact style={styles.equipmentChip}>
                      {item}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.tagsSection}>
                <Text style={[TEXT_STYLES.body, styles.sectionTitle]}>Tags:</Text>
                <View style={styles.tagsList}>
                  {selectedVideo?.tags?.map((tag, index) => (
                    <Chip key={index} compact style={styles.tagChip}>
                      #{tag}
                    </Chip>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => toggleFavorite(selectedVideo?.id)}
              style={styles.favoriteActionButton}
              icon={favoriteVideos.includes(selectedVideo?.id) ? "favorite" : "favorite-border"}
            >
              {favoriteVideos.includes(selectedVideo?.id) ? 'Favorited' : 'Add to Favorites'}
            </Button>
            <Button
              mode="contained"
              onPress={watchVideo}
              style={styles.watchButton}
              labelStyle={styles.watchButtonText}
              icon="play-arrow"
            >
              Watch Video 📺
            </Button>
          </View>
        </Card>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
                Technique Videos 🎬
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.headerSubtitle]}>
                Learn from the pros, master every move
              </Text>
            </View>
            <Avatar.Text
              size={50}
              label={user?.name?.charAt(0) || 'A'}
              style={styles.avatar}
            />
          </View>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
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
          <LearningProgress />

          <View style={styles.section}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              My Playlists 📚
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                Video Library 🎯
              </Text>
              <TouchableOpacity 
                onPress={() => setPlaylistModalVisible(true)}
                style={styles.filterButton}
              >
                <Icon name="tune" size={20} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginLeft: SPACING.xs }]}>
                  Filters
                </Text>
              </TouchableOpacity>
            </View>

            <Searchbar
              placeholder="Search videos, skills, sports..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              iconColor={COLORS.primary}
              inputStyle={TEXT_STYLES.body}
            />

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {categories.map((category) => (
                <Chip
                  key={category.key}
                  mode={selectedCategory === category.key ? 'flat' : 'outlined'}
                  onPress={() => setSelectedCategory(category.key)}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.key && styles.selectedCategoryChip
                  ]}
                  textStyle={selectedCategory === category.key && { color: 'white' }}
                  icon={category.icon}
                  compact
                >
                  {category.label}
                </Chip>
              ))}
            </ScrollView>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.skillLevelScroll}
            >
              {skillLevels.map((level) => (
                <Chip
                  key={level.key}
                  mode={selectedSkillLevel === level.key ? 'flat' : 'outlined'}
                  onPress={() => setSelectedSkillLevel(level.key)}
                  style={[
                    styles.skillLevelChip,
                    selectedSkillLevel === level.key && { backgroundColor: level.color }
                  ]}
                  textStyle={selectedSkillLevel === level.key && { color: 'white' }}
                  compact
                >
                  {level.label}
                </Chip>
              ))}
            </ScrollView>

            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}

            {filteredVideos.length === 0 && (
              <Card style={styles.emptyState}>
                <Icon name="video-library" size={48} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.body, styles.emptyText]}>
                  No videos found 🤷‍♂️
                </Text>
                <Text style={[TEXT_STYLES.caption, styles.emptySubtext]}>
                  Try adjusting your search or filters
                </Text>
              </Card>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      <FAB
        style={styles.fab}
        icon="upload"
        onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Video upload feature is in development')}
        color="white"
      />

      <VideoModal />
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    marginTop: -SPACING.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },
  progressCard: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressGradient: {
    padding: SPACING.md,
  },
  progressHeader: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: SPACING.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playlistCard: {
    width: 160,
    marginRight: SPACING.md,
    padding: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  playlistThumbnail: {
    height: 80,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  playlistInfo: {
    alignItems: 'center',
  },
  playlistTitle: {
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  playlistCount: {
    color: COLORS.textSecondary,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  skillLevelScroll: {
    marginBottom: SPACING.md,
  },
  skillLevelChip: {
    marginRight: SPACING.sm,
  },
  videoCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  completedCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderColor: COLORS.success,
    borderWidth: 1,
  },
  thumbnailContainer: {
    height: 180,
    backgroundColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailPlaceholder: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 10,
    fontWeight: 'bold',
  },
  premiumBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.warning,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  favoriteButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: SPACING.md,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  videoTitle: {
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
    marginRight: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  videoDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  instructor: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  difficultyStars: {
    flexDirection: 'row',
  },
  videoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  skillChip: {
    height: 24,
  },
  progressContainer: {
    marginTop: SPACING.sm,
  },
  videoProgress: {
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  videoModal: {
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: 0,
  },
  modalTitle: {
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  videoPreview: {
    padding: SPACING.md,
  },
  previewThumbnail: {
    height: 200,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInfo: {
    padding: SPACING.md,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  instructorDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  instructorName: {
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  videoRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalStat: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: 8,
    elevation: 1,
  },
  modalStatText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  modalStatValue: {
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  equipmentSection: {
    marginBottom: SPACING.md,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  equipmentChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  tagsSection: {
    marginBottom: SPACING.md,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  tagChip: {
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  favoriteActionButton: {
    flex: 1,
  },
  watchButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
  },
  watchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.lg,
  },
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  });

export default TechniqueVideos;
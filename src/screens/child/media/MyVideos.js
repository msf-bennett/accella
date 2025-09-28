import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  FlatList,
  Modal,
  Image,
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
  Portal,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-blur/blur';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e91e63',
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

const { width, height } = Dimensions.get('window');

const MyVideos = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  // Mock video data - replace with Redux selectors
  const [videos, setVideos] = useState([
    {
      id: '1',
      title: 'Perfect Football Kick Technique',
      thumbnail: 'https://via.placeholder.com/300x200',
      duration: '3:45',
      uploadDate: '2024-01-15',
      category: 'technique',
      type: 'coach_assigned',
      coach: 'Coach Martinez',
      description: 'Learn the proper form for penalty kicks',
      watched: true,
      watchProgress: 100,
      likes: 12,
      comments: 3,
      difficulty: 'Beginner',
    },
    {
      id: '2',
      title: 'My Progress - Week 3 Drills',
      thumbnail: 'https://via.placeholder.com/300x200',
      duration: '2:30',
      uploadDate: '2024-01-20',
      category: 'progress',
      type: 'user_upload',
      description: 'Showing improvement in dribbling drills',
      watched: false,
      watchProgress: 0,
      likes: 8,
      comments: 2,
      status: 'pending_review',
    },
    {
      id: '3',
      title: 'Defensive Positioning Basics',
      thumbnail: 'https://via.placeholder.com/300x200',
      duration: '5:20',
      uploadDate: '2024-01-18',
      category: 'tactics',
      type: 'coach_assigned',
      coach: 'Coach Martinez',
      description: 'Understanding defensive formations',
      watched: false,
      watchProgress: 45,
      likes: 15,
      comments: 5,
      difficulty: 'Intermediate',
    },
  ]);

  const categories = [
    { id: 'all', label: 'All Videos', icon: 'video-library' },
    { id: 'technique', label: 'Technique', icon: 'sports-soccer' },
    { id: 'tactics', label: 'Tactics', icon: 'psychology' },
    { id: 'fitness', label: 'Fitness', icon: 'fitness-center' },
    { id: 'progress', label: 'My Progress', icon: 'trending-up' },
  ];

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
      
      // Animate screen entrance
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      loadVideos();
    }, [])
  );

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchUserVideos(user.id));
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  }, []);

  const handleVideoPress = (video) => {
    Vibration.vibrate(50);
    setSelectedVideo(video);
    
    // Navigate to video player
    navigation.navigate('VideoPlayer', { 
      video,
      onProgress: (progress) => updateVideoProgress(video.id, progress)
    });
  };

  const handleUploadVideo = () => {
    Alert.alert(
      '📱 Video Upload',
      'Video upload feature is being developed! Soon you\'ll be able to upload progress videos for coach review.',
      [{ text: '✨ Awesome!', style: 'default' }]
    );
  };

  const handleLikeVideo = (videoId) => {
    Vibration.vibrate(30);
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, likes: video.likes + 1 }
        : video
    ));
  };

  const updateVideoProgress = (videoId, progress) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, watchProgress: progress, watched: progress === 100 }
        : video
    ));
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>My Videos 📹</Text>
            <Text style={styles.headerSubtitle}>
              {videos.length} videos • {videos.filter(v => v.watched).length} completed
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('VideoStats')}>
            <Surface style={styles.statsButton}>
              <Icon name="bar-chart" size={24} color={COLORS.primary} />
            </Surface>
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search videos..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>
      </View>
    </LinearGradient>
  );

  const renderCategoryTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      {categories.map((category, index) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setSelectedCategory(category.id)}
          style={[
            styles.categoryTab,
            selectedCategory === category.id && styles.categoryTabActive
          ]}
        >
          <Icon 
            name={category.icon} 
            size={20} 
            color={selectedCategory === category.id ? COLORS.surface : COLORS.primary} 
          />
          <Text style={[
            styles.categoryTabText,
            selectedCategory === category.id && styles.categoryTabTextActive
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderVideoCard = ({ item: video, index }) => (
    <Animated.View
      style={[
        styles.videoCard,
        {
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50 * (index + 1), 0],
            }),
          }],
          opacity: animatedValue,
        }
      ]}
    >
      <Card style={styles.card}>
        <TouchableOpacity onPress={() => handleVideoPress(video)}>
          <View style={styles.videoThumbnail}>
            <Image source={{ uri: video.thumbnail }} style={styles.thumbnailImage} />
            <View style={styles.videoDuration}>
              <Text style={styles.durationText}>{video.duration}</Text>
            </View>
            <View style={styles.playButton}>
              <Icon name="play-arrow" size={32} color={COLORS.surface} />
            </View>
            {video.watchProgress > 0 && (
              <View style={styles.progressOverlay}>
                <ProgressBar
                  progress={video.watchProgress / 100}
                  color={COLORS.success}
                  style={styles.videoProgress}
                />
              </View>
            )}
          </View>
          
          <View style={styles.videoInfo}>
            <View style={styles.videoHeader}>
              <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
              {video.type === 'coach_assigned' && (
                <Chip
                  mode="outlined"
                  compact
                  icon="school"
                  style={styles.assignedChip}
                  textStyle={styles.chipText}
                >
                  Coach
                </Chip>
              )}
            </View>
            
            <Text style={styles.videoDescription} numberOfLines={2}>
              {video.description}
            </Text>
            
            <View style={styles.videoMeta}>
              <View style={styles.videoMetaLeft}>
                {video.coach && (
                  <Text style={styles.coachName}>👨‍🏫 {video.coach}</Text>
                )}
                {video.difficulty && (
                  <Chip
                    mode="flat"
                    compact
                    style={[
                      styles.difficultyChip,
                      { backgroundColor: 
                        video.difficulty === 'Beginner' ? '#e8f5e8' :
                        video.difficulty === 'Intermediate' ? '#fff3e0' : '#ffebee'
                      }
                    ]}
                    textStyle={[
                      styles.difficultyText,
                      { color: 
                        video.difficulty === 'Beginner' ? COLORS.success :
                        video.difficulty === 'Intermediate' ? COLORS.warning : COLORS.error
                      }
                    ]}
                  >
                    {video.difficulty}
                  </Chip>
                )}
              </View>
              
              <View style={styles.videoActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLikeVideo(video.id)}
                >
                  <Icon name="thumb-up" size={18} color={COLORS.primary} />
                  <Text style={styles.actionText}>{video.likes}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="comment" size={18} color={COLORS.textSecondary} />
                  <Text style={styles.actionText}>{video.comments}</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {video.status === 'pending_review' && (
              <View style={styles.statusBadge}>
                <Icon name="pending" size={16} color={COLORS.warning} />
                <Text style={styles.statusText}>Pending Coach Review</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="video-library" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No videos yet! 📹</Text>
      <Text style={styles.emptyText}>
        Your coach will assign training videos, or you can upload your own progress videos
      </Text>
      <Button
        mode="contained"
        onPress={handleUploadVideo}
        style={styles.uploadButton}
        contentStyle={styles.uploadButtonContent}
      >
        Upload First Video
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressViewOffset={100}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {renderCategoryTabs()}
        
        <View style={styles.videosContainer}>
          {filteredVideos.length > 0 ? (
            <FlatList
              data={filteredVideos}
              renderItem={renderVideoCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.videosList}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        icon="video-plus"
        label="Upload Video"
        style={styles.fab}
        onPress={handleUploadVideo}
        color={COLORS.surface}
        customSize={56}
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
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  statsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  searchContainer: {
    marginBottom: SPACING.sm,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
  },
  categoryTabText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: COLORS.surface,
  },
  videosContainer: {
    padding: SPACING.md,
  },
  videosList: {
    paddingBottom: SPACING.lg,
  },
  videoCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    elevation: 3,
    overflow: 'hidden',
  },
  videoThumbnail: {
    position: 'relative',
    height: 200,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoDuration: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  videoProgress: {
    height: 4,
    borderRadius: 0,
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
    ...TEXT_STYLES.subtitle,
    flex: 1,
    marginRight: SPACING.sm,
  },
  assignedChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  videoDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoMetaLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachName: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  difficultyChip: {
    marginRight: SPACING.sm,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  videoActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  actionText: {
    ...TEXT_STYLES.caption,
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.title,
    marginVertical: SPACING.md,
    textAlign: 'center',
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    lineHeight: 24,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
  },
  uploadButtonContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default MyVideos;
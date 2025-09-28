import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import {
  Card,
  Button,
  Text,
  Surface,
  IconButton,
  Chip,
  ProgressBar,
  Portal,
  Modal,
  Searchbar,
  FAB,
  Badge,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
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
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const TechniqueVideos = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [animatedValue] = useState(new Animated.Value(0));
  const [bookmarkedVideos, setBookmarkedVideos] = useState(new Set());
  const [showAnalysisMode, setShowAnalysisMode] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const watchHistory = useSelector(state => state.videos.watchHistory);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const videoCategories = [
    { id: 'all', name: 'All Videos', icon: 'video-library', count: 42 },
    { id: 'fundamentals', name: 'Fundamentals', icon: 'school', count: 12 },
    { id: 'advanced', name: 'Advanced', icon: 'trending-up', count: 15 },
    { id: 'analysis', name: 'Game Analysis', icon: 'analytics', count: 8 },
    { id: 'drills', name: 'Training Drills', icon: 'fitness-center', count: 7 },
  ];

  const techniqueVideos = [
    {
      id: 1,
      title: 'Perfect First Touch Technique',
      category: 'fundamentals',
      duration: '08:45',
      thumbnail: '🎯',
      quality: '1080p',
      description: 'Master the art of receiving the ball with perfect control using various parts of your foot.',
      coach: 'Coach Alessandro',
      level: 'Beginner',
      views: 15420,
      likes: 1250,
      rating: 4.8,
      uploadDate: '2024-08-15',
      keyPoints: ['Body positioning', 'Foot placement', 'Ball cushioning', 'First touch direction'],
      watchTime: 245, // seconds watched
      totalDuration: 525, // total video duration in seconds
      hasSlowMotion: true,
      hasAnalysis: true,
      tags: ['touch', 'control', 'receiving'],
    },
    {
      id: 2,
      title: 'Advanced Shooting Mechanics',
      category: 'advanced',
      duration: '12:30',
      thumbnail: '⚽',
      quality: '4K',
      description: 'Break down the biomechanics of powerful and accurate shooting with frame-by-frame analysis.',
      coach: 'Coach Rodriguez',
      level: 'Advanced',
      views: 28500,
      likes: 2100,
      rating: 4.9,
      uploadDate: '2024-08-20',
      keyPoints: ['Power generation', 'Accuracy control', 'Follow through', 'Weak foot development'],
      watchTime: 0,
      totalDuration: 750,
      hasSlowMotion: true,
      hasAnalysis: true,
      tags: ['shooting', 'power', 'accuracy', 'biomechanics'],
    },
    {
      id: 3,
      title: 'Tactical Pressing Patterns',
      category: 'analysis',
      duration: '15:20',
      thumbnail: '🧠',
      quality: '1080p',
      description: 'Analyze professional team pressing patterns and learn when and how to apply pressure.',
      coach: 'Coach Martinez',
      level: 'Intermediate',
      views: 8750,
      likes: 680,
      rating: 4.7,
      uploadDate: '2024-08-18',
      keyPoints: ['Trigger moments', 'Coordinated pressure', 'Escape routes', 'Recovery positioning'],
      watchTime: 920,
      totalDuration: 920,
      hasSlowMotion: false,
      hasAnalysis: true,
      tags: ['tactics', 'pressing', 'defense', 'teamwork'],
    },
    {
      id: 4,
      title: 'Cone Dribbling Mastery',
      category: 'drills',
      duration: '06:15',
      thumbnail: '🏃',
      quality: '1080p',
      description: 'Progressive dribbling drills using cones to improve close control and agility.',
      coach: 'Coach Thompson',
      level: 'Beginner',
      views: 12300,
      likes: 950,
      rating: 4.6,
      uploadDate: '2024-08-22',
      keyPoints: ['Close control', 'Change of pace', 'Body feints', 'Spatial awareness'],
      watchTime: 375,
      totalDuration: 375,
      hasSlowMotion: true,
      hasAnalysis: false,
      tags: ['dribbling', 'agility', 'control', 'training'],
    },
    {
      id: 5,
      title: 'Professional Passing Patterns',
      category: 'advanced',
      duration: '10:45',
      thumbnail: '🎪',
      quality: '4K',
      description: 'Study how professional players create and execute complex passing combinations.',
      coach: 'Coach Silva',
      level: 'Advanced',
      views: 22100,
      likes: 1800,
      rating: 4.8,
      uploadDate: '2024-08-25',
      keyPoints: ['Vision development', 'Weight of pass', 'Timing', 'Space creation'],
      watchTime: 150,
      totalDuration: 645,
      hasSlowMotion: true,
      hasAnalysis: true,
      tags: ['passing', 'vision', 'teamwork', 'creativity'],
    },
    {
      id: 6,
      title: 'Goalkeeping Positioning',
      category: 'fundamentals',
      duration: '09:30',
      thumbnail: '🧤',
      quality: '1080p',
      description: 'Learn optimal positioning and decision-making for goalkeepers in various game situations.',
      coach: 'Coach Johnson',
      level: 'Intermediate',
      views: 6800,
      likes: 420,
      rating: 4.5,
      uploadDate: '2024-08-12',
      keyPoints: ['Angle play', 'Distribution', 'Shot stopping', 'Communication'],
      watchTime: 0,
      totalDuration: 570,
      hasSlowMotion: true,
      hasAnalysis: true,
      tags: ['goalkeeping', 'positioning', 'saves', 'distribution'],
    },
  ];

  const filteredVideos = techniqueVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         video.coach.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleBookmark = (videoId) => {
    const newBookmarks = new Set(bookmarkedVideos);
    if (newBookmarks.has(videoId)) {
      newBookmarks.delete(videoId);
    } else {
      newBookmarks.add(videoId);
    }
    setBookmarkedVideos(newBookmarks);
  };

  const openVideoPlayer = (video) => {
    setSelectedVideo(video);
    setVideoModalVisible(true);
    setCurrentTime(video.watchTime || 0);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const changePlaybackSpeed = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const addToWatchLater = (video) => {
    Alert.alert(
      'Added to Watch Later',
      `"${video.title}" has been added to your watch later list! 📺`,
      [{ text: 'OK' }]
    );
  };

  const downloadVideo = (video) => {
    Alert.alert(
      'Download Video',
      `Download "${video.title}" for offline viewing? This will use your device storage.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => Alert.alert('Download Started', 'Video is being downloaded! 📱') }
      ]
    );
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderCategoryTabs = () => (
    <View style={{ paddingHorizontal: SPACING.md, marginBottom: SPACING.md }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {videoCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={{ marginRight: SPACING.sm }}
          >
            <Surface
              style={{
                padding: SPACING.md,
                borderRadius: 25,
                backgroundColor: selectedCategory === category.id ? COLORS.primary : COLORS.surface,
                elevation: selectedCategory === category.id ? 4 : 2,
                flexDirection: 'row',
                alignItems: 'center',
                minWidth: 120,
              }}
            >
              <MaterialIcons
                name={category.icon}
                size={20}
                color={selectedCategory === category.id ? '#fff' : COLORS.primary}
                style={{ marginRight: SPACING.xs }}
              />
              <Text
                style={[
                  TEXT_STYLES.caption,
                  {
                    color: selectedCategory === category.id ? '#fff' : COLORS.text,
                    fontWeight: selectedCategory === category.id ? '600' : 'normal',
                  }
                ]}
              >
                {category.name}
              </Text>
              <Badge
                style={{
                  backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.3)' : COLORS.primary,
                  marginLeft: SPACING.xs,
                }}
                size={18}
              >
                {category.count}
              </Badge>
            </Surface>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderVideoCard = ({ item: video, index }) => {
    const progress = video.watchTime / video.totalDuration;
    const isWatched = progress > 0.9;
    const isInProgress = progress > 0 && progress <= 0.9;

    return (
      <Animated.View
        style={{
          opacity: animatedValue,
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        }}
      >
        <TouchableOpacity onPress={() => openVideoPlayer(video)}>
          <Card style={{ margin: SPACING.md, elevation: 4 }}>
            <View style={{ position: 'relative' }}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={{
                  height: 120,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 48 }}>{video.thumbnail}</Text>
                <View style={{
                  position: 'absolute',
                  bottom: SPACING.sm,
                  right: SPACING.sm,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  paddingHorizontal: SPACING.sm,
                  paddingVertical: SPACING.xs,
                  borderRadius: 12,
                }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                    {video.duration}
                  </Text>
                </View>
                
                {video.quality === '4K' && (
                  <View style={{
                    position: 'absolute',
                    top: SPACING.sm,
                    left: SPACING.sm,
                    backgroundColor: COLORS.accent,
                    paddingHorizontal: SPACING.sm,
                    paddingVertical: SPACING.xs,
                    borderRadius: 8,
                  }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
                      4K
                    </Text>
                  </View>
                )}

                <View style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: [{ translateX: -20 }, { translateY: -20 }],
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 20,
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <MaterialIcons name="play-arrow" size={24} color={COLORS.primary} />
                </View>
              </LinearGradient>

              {isInProgress && (
                <ProgressBar
                  progress={progress}
                  color={COLORS.accent}
                  style={{ height: 3, borderRadius: 0 }}
                />
              )}
            </View>

            <Card.Content style={{ padding: SPACING.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.xs }]}>
                    {video.title}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.sm }]}>
                    {video.coach} • {video.views.toLocaleString()} views
                  </Text>
                </View>
                <IconButton
                  icon={bookmarkedVideos.has(video.id) ? 'bookmark' : 'bookmark-outline'}
                  iconColor={COLORS.primary}
                  size={20}
                  onPress={() => toggleBookmark(video.id)}
                />
              </View>

              <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.md, lineHeight: 18 }]}>
                {video.description}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                <Chip
                  mode="flat"
                  textStyle={{
                    color: getLevelColor(video.level),
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                  style={{
                    backgroundColor: getLevelColor(video.level) + '20',
                    height: 28,
                    marginRight: SPACING.sm,
                  }}
                >
                  {video.level}
                </Chip>

                {video.hasSlowMotion && (
                  <Chip
                    mode="outlined"
                    icon="slow-motion-video"
                    textStyle={{ fontSize: 10 }}
                    style={{ height: 28, marginRight: SPACING.xs }}
                  >
                    Slow-Mo
                  </Chip>
                )}

                {video.hasAnalysis && (
                  <Chip
                    mode="outlined"
                    icon="analytics"
                    textStyle={{ fontSize: 10 }}
                    style={{ height: 28, marginRight: SPACING.xs }}
                  >
                    Analysis
                  </Chip>
                )}
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="star" size={16} color={COLORS.warning} style={{ marginRight: SPACING.xs }} />
                  <Text style={TEXT_STYLES.caption}>{video.rating}</Text>
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm }]}>
                    • {video.likes.toLocaleString()} likes
                  </Text>
                </View>

                {isWatched && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="check-circle" size={16} color={COLORS.success} style={{ marginRight: SPACING.xs }} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>Watched</Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderVideoPlayerModal = () => (
    <Portal>
      <Modal
        visible={videoModalVisible}
        onDismiss={() => setVideoModalVisible(false)}
        contentContainerStyle={{ flex: 1, backgroundColor: '#000' }}
      >
        {selectedVideo && (
          <View style={{ flex: 1 }}>
            {/* Video Player Area */}
            <View style={{ height: height * 0.3, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 64 }}>{selectedVideo.thumbnail}</Text>
              <View style={{
                position: 'absolute',
                top: 20,
                right: 20,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 20,
              }}>
                <IconButton
                  icon="close"
                  iconColor="#fff"
                  size={24}
                  onPress={() => setVideoModalVisible(false)}
                />
              </View>
            </View>

            {/* Video Controls */}
            <View style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: SPACING.md }}>
              <ProgressBar
                progress={currentTime / selectedVideo.totalDuration}
                color={COLORS.primary}
                style={{ height: 4, marginBottom: SPACING.md }}
              />
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 12 }}>
                  {formatDuration(currentTime)}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <IconButton
                    icon="replay-10"
                    iconColor="#fff"
                    size={24}
                    onPress={() => setCurrentTime(Math.max(0, currentTime - 10))}
                  />
                  <IconButton
                    icon={isPlaying ? 'pause' : 'play-arrow'}
                    iconColor="#fff"
                    size={32}
                    onPress={handlePlayPause}
                  />
                  <IconButton
                    icon="forward-10"
                    iconColor="#fff"
                    size={24}
                    onPress={() => setCurrentTime(Math.min(selectedVideo.totalDuration, currentTime + 10))}
                  />
                </View>

                <TouchableOpacity onPress={changePlaybackSpeed}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                    {playbackSpeed}x
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Video Details */}
            <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
              <View style={{ padding: SPACING.lg }}>
                <Text style={[TEXT_STYLES.h2, { marginBottom: SPACING.sm }]}>
                  {selectedVideo.title}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                  <Text style={[TEXT_STYLES.caption, { marginRight: SPACING.md }]}>
                    {selectedVideo.coach}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { marginRight: SPACING.md }]}>
                    {selectedVideo.views.toLocaleString()} views
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="star" size={16} color={COLORS.warning} style={{ marginRight: SPACING.xs }} />
                    <Text style={TEXT_STYLES.caption}>{selectedVideo.rating}</Text>
                  </View>
                </View>

                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.lg, lineHeight: 22 }]}>
                  {selectedVideo.description}
                </Text>

                <View style={{ flexDirection: 'row', marginBottom: SPACING.lg, flexWrap: 'wrap' }}>
                  <Button
                    mode="contained"
                    icon="download"
                    onPress={() => downloadVideo(selectedVideo)}
                    style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
                  >
                    Download
                  </Button>
                  <Button
                    mode="outlined"
                    icon="watch-later"
                    onPress={() => addToWatchLater(selectedVideo)}
                    style={{ marginRight: SPACING.sm, marginBottom: SPACING.sm }}
                  >
                    Watch Later
                  </Button>
                  <Button
                    mode="outlined"
                    icon="share"
                    onPress={() => Alert.alert('Share Video', 'Video shared successfully! 📤')}
                  >
                    Share
                  </Button>
                </View>

                <Divider style={{ marginVertical: SPACING.lg }} />

                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                  🎯 Key Learning Points
                </Text>
                
                {selectedVideo.keyPoints.map((point, index) => (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                    <MaterialIcons name="check-circle" size={16} color={COLORS.success} style={{ marginRight: SPACING.sm }} />
                    <Text style={TEXT_STYLES.body}>{point}</Text>
                  </View>
                ))}

                {selectedVideo.hasAnalysis && (
                  <>
                    <Divider style={{ marginVertical: SPACING.lg }} />
                    <Button
                      mode="contained"
                      icon="analytics"
                      onPress={() => setShowAnalysisMode(!showAnalysisMode)}
                      style={{ marginBottom: SPACING.lg }}
                      buttonColor={COLORS.secondary}
                    >
                      {showAnalysisMode ? 'Exit Analysis Mode' : 'Enter Analysis Mode'}
                    </Button>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: 50, paddingBottom: SPACING.lg }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md }}>
          <IconButton
            icon="arrow-left"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: '#fff', flex: 1, marginLeft: SPACING.sm }]}>
            Technique Videos
          </Text>
          <IconButton
            icon="download"
            iconColor="#fff"
            size={24}
            onPress={() => Alert.alert('Downloads', 'View your downloaded videos for offline watching! 📱')}
          />
        </View>

        <View style={{ paddingHorizontal: SPACING.md }}>
          <Text style={[TEXT_STYLES.caption, { color: '#fff', opacity: 0.9, textAlign: 'center' }]}>
            Watch professional technique breakdowns & analysis! 🎥📊
          </Text>
        </View>
      </LinearGradient>

      <Searchbar
        placeholder="Search videos, coaches, techniques..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ margin: SPACING.md, elevation: 2 }}
        iconColor={COLORS.primary}
      />

      {renderCategoryTabs()}

      <FlatList
        data={filteredVideos}
        renderItem={renderVideoCard}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: SPACING.xl }}>
            <Text style={{ fontSize: 48, marginBottom: SPACING.md }}>📺</Text>
            <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginBottom: SPACING.sm }]}>
              No videos found
            </Text>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center' }]}>
              Try adjusting your search or category filter
            </Text>
          </View>
        }
      />

      <FAB
        icon="video-plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Upload Video', 'Upload your own technique video! 📹')}
      />

      {renderVideoPlayerModal()}
    </View>
  );
};

export default TechniqueVideos;
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
  PermissionsAndroid,
  Platform,
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
  Menu,
  TextInput,
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

const ProgressVideos = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [recordingDescription, setRecordingDescription] = useState('');
  const [recordingSkill, setRecordingSkill] = useState('');
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  // Mock progress video data - replace with Redux selectors
  const [videos, setVideos] = useState([
    {
      id: '1',
      title: 'Week 1: Basic Dribbling 🏃‍♂️',
      description: 'My first attempt at cone dribbling drills',
      thumbnail: 'https://via.placeholder.com/400x300/667eea/ffffff?text=Week+1+Dribbling',
      duration: '2:15',
      uploadDate: '2024-01-15T10:30:00Z',
      skill: 'dribbling',
      category: 'technique',
      weekNumber: 1,
      status: 'reviewed',
      coachRating: 4,
      coachFeedback: 'Great start! Focus on keeping the ball closer to your feet.',
      improvements: ['Ball control', 'Speed'],
      nextGoals: ['Increase pace', 'Add direction changes'],
      views: 12,
      likes: 8,
      progress: 100,
      tags: ['beginner', 'dribbling', 'cones'],
    },
    {
      id: '2',
      title: 'Week 2: Dribbling Progress 📈',
      description: 'Second week showing improvement in ball control',
      thumbnail: 'https://via.placeholder.com/400x300/4CAF50/ffffff?text=Week+2+Progress',
      duration: '2:45',
      uploadDate: '2024-01-22T14:20:00Z',
      skill: 'dribbling',
      category: 'technique',
      weekNumber: 2,
      status: 'reviewed',
      coachRating: 5,
      coachFeedback: 'Excellent improvement! You\'re keeping the ball much closer now.',
      improvements: ['Ball control improved', 'Better rhythm'],
      nextGoals: ['Add speed variations', 'Practice with both feet'],
      views: 15,
      likes: 12,
      progress: 100,
      tags: ['improvement', 'dribbling', 'control'],
      comparison: { previousVideoId: '1', improvementScore: 85 },
    },
    {
      id: '3',
      title: 'Free Kick Technique Practice ⚽',
      description: 'Working on my free kick accuracy and power',
      thumbnail: 'https://via.placeholder.com/400x300/FF9800/ffffff?text=Free+Kick+Practice',
      duration: '3:20',
      uploadDate: '2024-01-25T16:45:00Z',
      skill: 'shooting',
      category: 'technique',
      weekNumber: 3,
      status: 'pending',
      views: 5,
      likes: 3,
      progress: 100,
      tags: ['shooting', 'free-kick', 'accuracy'],
    },
    {
      id: '4',
      title: 'Sprint Speed Test 🏃💨',
      description: 'Measuring my sprint speed improvement',
      thumbnail: 'https://via.placeholder.com/400x300/e91e63/ffffff?text=Speed+Test',
      duration: '1:30',
      uploadDate: '2024-01-28T09:15:00Z',
      skill: 'fitness',
      category: 'physical',
      weekNumber: 4,
      status: 'reviewed',
      coachRating: 4,
      coachFeedback: 'Good speed! Work on your starting position for better acceleration.',
      improvements: ['Faster start', 'Good form'],
      nextGoals: ['Improve reaction time', 'Build endurance'],
      views: 8,
      likes: 6,
      progress: 100,
      tags: ['speed', 'fitness', 'sprint'],
      metrics: { time: '12.5s', improvement: '+0.3s' },
    },
  ]);

  const categories = [
    { id: 'all', label: 'All Videos', icon: 'video-library' },
    { id: 'technique', label: 'Technique', icon: 'sports-soccer' },
    { id: 'physical', label: 'Physical', icon: 'fitness-center' },
    { id: 'tactical', label: 'Tactical', icon: 'psychology' },
  ];

  const skills = [
    { id: 'all', label: 'All Skills', icon: 'star' },
    { id: 'dribbling', label: 'Dribbling', icon: 'directions-run' },
    { id: 'shooting', label: 'Shooting', icon: 'sports-soccer' },
    { id: 'passing', label: 'Passing', icon: 'swap-horiz' },
    { id: 'fitness', label: 'Fitness', icon: 'fitness-center' },
    { id: 'defending', label: 'Defending', icon: 'security' },
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

      loadProgressVideos();
    }, [])
  );

  const loadProgressVideos = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchUserProgressVideos(user.id));
    } catch (error) {
      console.error('Failed to load progress videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProgressVideos();
    setRefreshing(false);
  }, []);

  const handleVideoPress = (video) => {
    Vibration.vibrate(50);
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const handleRecordVideo = () => {
    setShowRecordModal(true);
  };

  const handleStartRecording = async () => {
    if (!recordingTitle.trim()) {
      Alert.alert('Title Required', 'Please enter a title for your progress video');
      return;
    }

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission needed', 'Camera permission is required');
          return;
        }
      }

      Alert.alert(
        '🎬 Record Progress Video',
        'Video recording feature is being developed! Soon you\'ll be able to record progress videos directly in the app.',
        [{ text: '✨ Awesome!', style: 'default' }]
      );
      
      setShowRecordModal(false);
      setRecordingTitle('');
      setRecordingDescription('');
      setRecordingSkill('');
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const handleUploadVideo = () => {
    Alert.alert(
      '📱 Upload Progress Video',
      'Video upload feature is being developed! Soon you\'ll be able to upload progress videos from your device.',
      [{ text: '✨ Cool!', style: 'default' }]
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

  const handleCompareVideos = (video) => {
    if (video.comparison) {
      Alert.alert(
        '📊 Compare Progress',
        'Video comparison feature is being developed! Soon you\'ll be able to see side-by-side progress comparisons.',
        [{ text: '✨ Great!', style: 'default' }]
      );
    } else {
      Alert.alert('No Comparison Available', 'No previous video found for comparison.');
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesSkill = selectedSkill === 'all' || video.skill === selectedSkill;
    return matchesSearch && matchesCategory && matchesSkill;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Progress Videos 🎬</Text>
            <Text style={styles.headerSubtitle}>
              {videos.length} videos • {videos.filter(v => v.status === 'reviewed').length} reviewed
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ProgressStats')}>
            <Surface style={styles.statsButton}>
              <Icon name="trending-up" size={24} color={COLORS.primary} />
            </Surface>
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search progress videos..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>
      </View>
    </LinearGradient>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabs}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.filterTab,
              selectedCategory === category.id && styles.filterTabActive
            ]}
          >
            <Icon 
              name={category.icon} 
              size={18} 
              color={selectedCategory === category.id ? COLORS.surface : COLORS.primary} 
            />
            <Text style={[
              styles.filterTabText,
              selectedCategory === category.id && styles.filterTabTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.skillTabs}
      >
        {skills.map((skill) => (
          <TouchableOpacity
            key={skill.id}
            onPress={() => setSelectedSkill(skill.id)}
            style={[
              styles.skillTab,
              selectedSkill === skill.id && styles.skillTabActive
            ]}
          >
            <Icon 
              name={skill.icon} 
              size={16} 
              color={selectedSkill === skill.id ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[
              styles.skillTabText,
              selectedSkill === skill.id && styles.skillTabTextActive
            ]}>
              {skill.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
            
            {/* Status indicators */}
            <View style={styles.statusIndicators}>
              {video.status === 'reviewed' && video.coachRating && (
                <View style={styles.ratingBadge}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={styles.ratingText}>{video.coachRating}</Text>
                </View>
              )}
              {video.status === 'pending' && (
                <View style={styles.pendingBadge}>
                  <Icon name="pending" size={16} color={COLORS.warning} />
                </View>
              )}
              {video.comparison && (
                <View style={styles.comparisonBadge}>
                  <Icon name="compare" size={16} color={COLORS.success} />
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.videoInfo}>
            <View style={styles.videoHeader}>
              <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
              <Chip
                mode="outlined"
                compact
                style={styles.weekChip}
                textStyle={styles.weekChipText}
              >
                Week {video.weekNumber}
              </Chip>
            </View>
            
            <Text style={styles.videoDescription} numberOfLines={2}>
              {video.description}
            </Text>
            
            <View style={styles.skillInfo}>
              <Chip
                mode="flat"
                compact
                icon={skills.find(s => s.id === video.skill)?.icon}
                style={styles.skillChip}
                textStyle={styles.skillChipText}
              >
                {skills.find(s => s.id === video.skill)?.label || video.skill}
              </Chip>
              
              {video.metrics && (
                <View style={styles.metricsContainer}>
                  <Text style={styles.metricsText}>
                    {video.metrics.time} {video.metrics.improvement}
                  </Text>
                </View>
              )}
            </View>
            
            {video.status === 'reviewed' && video.coachFeedback && (
              <View style={styles.feedbackPreview}>
                <Icon name="feedback" size={16} color={COLORS.primary} />
                <Text style={styles.feedbackText} numberOfLines={2}>
                  {video.coachFeedback}
                </Text>
              </View>
            )}
            
            <View style={styles.videoMeta}>
              <Text style={styles.videoDate}>{formatDate(video.uploadDate)}</Text>
              
              <View style={styles.videoActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLikeVideo(video.id)}
                >
                  <Icon name="favorite" size={18} color={COLORS.accent} />
                  <Text style={styles.actionText}>{video.likes}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="visibility" size={18} color={COLORS.textSecondary} />
                  <Text style={styles.actionText}>{video.views}</Text>
                </TouchableOpacity>
                
                {video.comparison && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCompareVideos(video)}
                  >
                    <Icon name="compare-arrows" size={18} color={COLORS.success} />
                    <Text style={styles.actionText}>Compare</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="videocam" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>Start Your Progress Journey! 🎬</Text>
      <Text style={styles.emptyText}>
        Record your first progress video to track your improvement over time
      </Text>
      <View style={styles.emptyActions}>
        <Button
          mode="contained"
          onPress={handleRecordVideo}
          style={styles.recordButton}
          contentStyle={styles.recordButtonContent}
          icon="videocam"
        >
          Record Progress Video
        </Button>
        <Button
          mode="outlined"
          onPress={handleUploadVideo}
          style={[styles.recordButton, styles.uploadButton]}
          contentStyle={styles.recordButtonContent}
          icon="upload"
        >
          Upload Video
        </Button>
      </View>
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
        {renderFilters()}
        
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
        icon="videocam"
        label="Record Progress"
        style={styles.fab}
        onPress={handleRecordVideo}
        color={COLORS.surface}
        customSize={56}
      />

      {/* Recording Modal */}
      <Modal
        visible={showRecordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRecordModal(false)}
      >
        <BlurView style={styles.modalContainer} blurType="dark">
          <View style={styles.recordModalContent}>
            <View style={styles.recordModalHeader}>
              <Text style={styles.recordModalTitle}>Record Progress Video 🎬</Text>
              <TouchableOpacity
                onPress={() => setShowRecordModal(false)}
                style={styles.modalClose}
              >
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.recordModalBody}>
              <TextInput
                label="Video Title *"
                value={recordingTitle}
                onChangeText={setRecordingTitle}
                style={styles.input}
                mode="outlined"
                placeholder="e.g., Week 5: Shooting Practice"
              />
              
              <TextInput
                label="Description"
                value={recordingDescription}
                onChangeText={setRecordingDescription}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Describe what you're practicing..."
              />
              
              <Text style={styles.sectionTitle}>Select Skill</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.skillSelector}
              >
                {skills.filter(s => s.id !== 'all').map((skill) => (
                  <TouchableOpacity
                    key={skill.id}
                    onPress={() => setRecordingSkill(skill.id)}
                    style={[
                      styles.skillOption,
                      recordingSkill === skill.id && styles.skillOptionActive
                    ]}
                  >
                    <Icon 
                      name={skill.icon} 
                      size={20} 
                      color={recordingSkill === skill.id ? COLORS.surface : COLORS.primary} 
                    />
                    <Text style={[
                      styles.skillOptionText,
                      recordingSkill === skill.id && styles.skillOptionTextActive
                    ]}>
                      {skill.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>
            
            <View style={styles.recordModalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowRecordModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleStartRecording}
                style={[styles.modalButton, styles.primaryButton]}
                icon="videocam"
              >
                Start Recording
              </Button>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* Video Detail Modal */}
      <Modal
        visible={showVideoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVideoModal(false)}
      >
        <BlurView style={styles.modalContainer} blurType="dark">
          <View style={styles.videoModalContent}>
            {selectedVideo && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setShowVideoModal(false)}
                >
                  <Icon name="close" size={24} color={COLORS.surface} />
                </TouchableOpacity>
                
                <View style={styles.videoPlayer}>
                  <Image 
                    source={{ uri: selectedVideo.thumbnail }} 
                    style={styles.playerThumbnail}
                  />
                  <TouchableOpacity style={styles.playButtonLarge}>
                    <Icon name="play-arrow" size={48} color={COLORS.surface} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.videoDetails}>
                  <Text style={styles.detailTitle}>{selectedVideo.title}</Text>
                  <Text style={styles.detailDescription}>{selectedVideo.description}</Text>
                  
                  <View style={styles.detailMeta}>
                    <Chip icon="calendar" style={styles.detailChip}>
                      Week {selectedVideo.weekNumber}
                    </Chip>
                    <Chip icon="sports" style={styles.detailChip}>
                      {skills.find(s => s.id === selectedVideo.skill)?.label}
                    </Chip>
                  </View>
                  
                  {selectedVideo.status === 'reviewed' && (
                    <View style={styles.coachFeedback}>
                      <Text style={styles.feedbackTitle}>Coach Feedback 👨‍🏫</Text>
                      <View style={styles.ratingContainer}>
                        <Text style={styles.ratingLabel}>Rating:</Text>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Icon
                            key={star}
                            name="star"
                            size={20}
                            color={star <= selectedVideo.coachRating ? COLORS.warning : COLORS.textSecondary}
                          />
                        ))}
                      </View>
                      <Text style={styles.feedbackMessage}>{selectedVideo.coachFeedback}</Text>
                      
                      {selectedVideo.improvements && (
                        <View style={styles.improvementSection}>
                          <Text style={styles.improvementTitle}>✅ Improvements Noted:</Text>
                          {selectedVideo.improvements.map((improvement, index) => (
                            <Text key={index} style={styles.improvementItem}>
                              • {improvement}
                            </Text>
                          ))}
                        </View>
                      )}
                      
                      {selectedVideo.nextGoals && (
                        <View style={styles.goalsSection}>
                          <Text style={styles.goalsTitle}>🎯 Next Goals:</Text>
                          {selectedVideo.nextGoals.map((goal, index) => (
                            <Text key={index} style={styles.goalItem}>
                              • {goal}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                  
                  {selectedVideo.status === 'pending' && (
                    <View style={styles.pendingStatus}>
                      <Icon name="pending" size={24} color={COLORS.warning} />
                      <Text style={styles.pendingText}>Waiting for coach review...</Text>
                    </View>
                  )}
                  
                  <View style={styles.detailActions}>
                    <Button
                      mode="contained"
                      onPress={() => handleLikeVideo(selectedVideo.id)}
                      style={styles.detailButton}
                      icon="favorite"
                    >
                      Like ({selectedVideo.likes})
                    </Button>
                    
                    {selectedVideo.comparison && (
                      <Button
                        mode="outlined"
                        onPress={() => handleCompareVideos(selectedVideo)}
                        style={styles.detailButton}
                        icon="compare-arrows"
                      >
                        Compare Progress
                      </Button>
                    )}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </BlurView>
      </Modal>
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
  // Filter Styles
  filtersContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    elevation: 2,
  },
  categoryTabs: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  skillTabs: {
    paddingHorizontal: SPACING.md,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: COLORS.surface,
  },
  skillTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  skillTabActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: COLORS.primary,
  },
  skillTabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  skillTabTextActive: {
    color: COLORS.primary,
  },
  // Video Card Styles
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
  statusIndicators: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: SPACING.xs,
  },
  ratingText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  pendingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  comparisonBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
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
  weekChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: COLORS.primary,
  },
  weekChipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  videoDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  skillInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  skillChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  skillChipText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '600',
  },
  metricsContainer: {
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metricsText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  feedbackPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  feedbackText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    flex: 1,
    marginLeft: SPACING.sm,
    fontStyle: 'italic',
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
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
  // Empty State
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
  emptyActions: {
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    marginBottom: SPACING.sm,
    minWidth: 200,
  },
  uploadButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
  },
  recordButtonContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  // FAB
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  recordModalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    maxHeight: height * 0.8,
  },
  recordModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  recordModalTitle: {
    ...TEXT_STYLES.title,
    flex: 1,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordModalBody: {
    padding: SPACING.md,
    maxHeight: 300,
  },
  input: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.sm,
  },
  skillSelector: {
    marginBottom: SPACING.md,
  },
  skillOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  skillOptionActive: {
    backgroundColor: COLORS.primary,
  },
  skillOptionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  skillOptionTextActive: {
    color: COLORS.surface,
  },
  recordModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  // Video Detail Modal
  videoModalContent: {
    width: width - SPACING.lg,
    maxHeight: height * 0.9,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  videoPlayer: {
    position: 'relative',
    height: 250,
  },
  playerThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playButtonLarge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -36 }, { translateY: -36 }],
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDetails: {
    padding: SPACING.md,
  },
  detailTitle: {
    ...TEXT_STYLES.title,
    marginBottom: SPACING.sm,
  },
  detailDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 24,
  },
  detailMeta: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  detailChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  coachFeedback: {
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  feedbackTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingLabel: {
    ...TEXT_STYLES.body,
    marginRight: SPACING.sm,
  },
  feedbackMessage: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  improvementSection: {
    marginBottom: SPACING.sm,
  },
  improvementTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.success,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  improvementItem: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  goalsSection: {
    marginBottom: SPACING.sm,
  },
  goalsTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.warning,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  goalItem: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
  pendingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  pendingText: {
    ...TEXT_STYLES.body,
    color: COLORS.warning,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailButton: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ProgressVideos;
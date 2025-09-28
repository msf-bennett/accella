import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  FlatList,
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
  Searchbar,
  Portal,
  Modal,
  TextInput,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4ade80',
  error: '#ef4444',
  warning: '#f59e0b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  accent: '#8b5cf6',
  info: '#3b82f6',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
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

const TechniqueFeedback = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const players = useSelector(state => state.players.list);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('pending');
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock video submissions data
  const [videoSubmissions, setVideoSubmissions] = useState([
    {
      id: '1',
      player: {
        id: 'alex_thompson',
        name: 'Alex Thompson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        position: 'Midfielder',
        level: 'Intermediate'
      },
      technique: 'Free Kick',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop',
      submittedAt: '2024-08-15T10:30:00Z',
      status: 'pending',
      duration: '0:45',
      description: 'Working on my free kick technique. Please review my body positioning and follow-through.',
      priority: 'high',
      sessionId: 'session_001',
      attempts: 3,
      category: 'Set Pieces',
      difficulty: 'Advanced',
      aiAnalysis: {
        accuracy: 78,
        power: 85,
        technique: 72,
        consistency: 68,
        areas_for_improvement: ['Follow-through', 'Body position', 'Ball contact point']
      }
    },
    {
      id: '2',
      player: {
        id: 'sarah_jones',
        name: 'Sarah Jones',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b4a4?w=150&h=150&fit=crop&crop=face',
        position: 'Forward',
        level: 'Advanced'
      },
      technique: 'Shooting',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=200&fit=crop',
      submittedAt: '2024-08-15T14:20:00Z',
      status: 'reviewed',
      duration: '1:15',
      description: 'Practicing my shooting technique from different angles. Focus on accuracy vs power.',
      priority: 'medium',
      sessionId: 'session_002',
      attempts: 5,
      category: 'Shooting',
      difficulty: 'Intermediate',
      feedback: {
        rating: 4,
        text: 'Great improvement in your shooting form! Your body positioning is much better. Focus on keeping your head up longer before the shot.',
        tags: ['Body Position', 'Accuracy', 'Technique'],
        reviewedAt: '2024-08-15T16:45:00Z',
        reviewedBy: 'Coach Johnson'
      },
      aiAnalysis: {
        accuracy: 82,
        power: 79,
        technique: 86,
        consistency: 81,
        areas_for_improvement: ['Vision', 'Shot placement', 'Weak foot development']
      }
    },
    {
      id: '3',
      player: {
        id: 'mike_wilson',
        name: 'Mike Wilson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        position: 'Defender',
        level: 'Beginner'
      },
      technique: 'Passing',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_3mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=300&h=200&fit=crop',
      submittedAt: '2024-08-14T09:15:00Z',
      status: 'pending',
      duration: '2:30',
      description: 'Long passing practice. Having trouble with accuracy on longer distances.',
      priority: 'low',
      sessionId: 'session_003',
      attempts: 8,
      category: 'Passing',
      difficulty: 'Beginner',
      aiAnalysis: {
        accuracy: 65,
        power: 71,
        technique: 59,
        consistency: 63,
        areas_for_improvement: ['Follow-through', 'Body balance', 'Weight distribution']
      }
    }
  ]);

  const categories = [
    { key: 'pending', label: 'Pending', icon: 'schedule', count: videoSubmissions.filter(v => v.status === 'pending').length },
    { key: 'reviewed', label: 'Reviewed', icon: 'check-circle', count: videoSubmissions.filter(v => v.status === 'reviewed').length },
    { key: 'all', label: 'All Videos', icon: 'video-library', count: videoSubmissions.length },
  ];

  const techniqueTags = [
    'Excellent Form', 'Good Progress', 'Needs Work', 'Body Position', 'Footwork', 
    'Timing', 'Accuracy', 'Power', 'Consistency', 'Follow-through', 'Balance'
  ];

  const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call to refresh video submissions
      await new Promise(resolve => setTimeout(resolve, 2000));
      setRefreshing(false);
    } catch (error) {
      setRefreshing(false);
      Alert.alert('Error', 'Failed to refresh video submissions');
    }
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    Vibration.vibrate(50);
  };

  const handleVideoPress = (video) => {
    setSelectedVideo(video);
    setModalVisible(true);
  };

  const handleProvideFeedback = (video) => {
    setSelectedVideo(video);
    setFeedbackText(video.feedback?.text || '');
    setSelectedRating(video.feedback?.rating || 0);
    setSelectedTags(video.feedback?.tags || []);
    setFeedbackModalVisible(true);
  };

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
    Vibration.vibrate(30);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedRating || !feedbackText.trim()) {
      Alert.alert('Missing Information', 'Please provide both a rating and feedback text.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call to submit feedback
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update video status
      setVideoSubmissions(prev => 
        prev.map(video => 
          video.id === selectedVideo.id 
            ? {
                ...video,
                status: 'reviewed',
                feedback: {
                  rating: selectedRating,
                  text: feedbackText,
                  tags: selectedTags,
                  reviewedAt: new Date().toISOString(),
                  reviewedBy: user.name
                }
              }
            : video
        )
      );

      Alert.alert(
        'Feedback Submitted! 🎉',
        `Your feedback has been sent to ${selectedVideo.player.name}. They'll receive a notification with your detailed analysis.`,
        [{ text: 'Great!', style: 'default' }]
      );
      
      setFeedbackModalVisible(false);
      setModalVisible(false);
      setFeedbackText('');
      setSelectedRating(0);
      setSelectedTags([]);
      setIsLoading(false);
      
      Vibration.vibrate(100);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  const filteredVideos = videoSubmissions.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.status === selectedCategory;
    const matchesSearch = video.player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.technique.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'reviewed': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderVideoCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity onPress={() => handleVideoPress(item)}>
        <Card style={styles.videoCard}>
          <View style={styles.videoThumbnailContainer}>
            <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
            <View style={styles.videoOverlay}>
              <Icon name="play-circle-filled" size={40} color="rgba(255,255,255,0.9)" />
              <Text style={styles.videoDuration}>{item.duration}</Text>
            </View>
            <Chip
              mode="flat"
              textStyle={{ fontSize: 10, color: '#fff' }}
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            >
              {item.status.toUpperCase()}
            </Chip>
          </View>
          
          <Card.Content style={styles.cardContent}>
            <View style={styles.playerInfo}>
              <Avatar.Image size={40} source={{ uri: item.player.avatar }} />
              <View style={styles.playerDetails}>
                <Text style={TEXT_STYLES.subheading} numberOfLines={1}>
                  {item.player.name}
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  {item.player.position} • {item.technique}
                </Text>
              </View>
              <Chip
                mode="outlined"
                compact
                textStyle={{ fontSize: 10, color: getPriorityColor(item.priority) }}
                style={[styles.priorityChip, { borderColor: getPriorityColor(item.priority) }]}
              >
                {item.priority.toUpperCase()}
              </Chip>
            </View>

            <Text style={[TEXT_STYLES.body, styles.description]} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.videoMetrics}>
              <View style={styles.metricItem}>
                <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                <Text style={styles.metricText}>{formatTimeAgo(item.submittedAt)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="refresh" size={16} color={COLORS.info} />
                <Text style={styles.metricText}>{item.attempts} attempts</Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="psychology" size={16} color={COLORS.accent} />
                <Text style={styles.metricText}>AI: {item.aiAnalysis.technique}%</Text>
              </View>
            </View>

            {item.status === 'reviewed' && item.feedback && (
              <View style={styles.feedbackPreview}>
                <View style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      name="star"
                      size={16}
                      color={star <= item.feedback.rating ? COLORS.warning : '#e2e8f0'}
                    />
                  ))}
                </View>
                <Text style={styles.feedbackText} numberOfLines={1}>
                  {item.feedback.text}
                </Text>
              </View>
            )}
          </Card.Content>

          {item.status === 'pending' && (
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => handleProvideFeedback(item)}
                style={styles.feedbackButton}
                icon="rate-review"
              >
                Provide Feedback
              </Button>
            </Card.Actions>
          )}
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCategoryChip = ({ item }) => (
    <Chip
      mode={selectedCategory === item.key ? 'flat' : 'outlined'}
      selected={selectedCategory === item.key}
      onPress={() => handleCategorySelect(item.key)}
      icon={item.icon}
      style={[
        styles.categoryChip,
        selectedCategory === item.key && { backgroundColor: COLORS.primary }
      ]}
      textStyle={selectedCategory === item.key ? { color: '#fff' } : { color: COLORS.primary }}
    >
      {item.label} ({item.count})
    </Chip>
  );

  const renderRatingStars = () => (
    <View style={styles.ratingContainer}>
      <Text style={TEXT_STYLES.subheading}>Rating *</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setSelectedRating(star)}
            style={styles.starButton}
          >
            <Icon
              name="star"
              size={32}
              color={star <= selectedRating ? COLORS.warning : '#e2e8f0'}
            />
          </TouchableOpacity>
        ))}
      </View>
      {selectedRating > 0 && (
        <Text style={styles.ratingLabel}>{ratingLabels[selectedRating - 1]}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Technique Feedback 🎯</Text>
              <Text style={styles.headerSubtitle}>
                Review and analyze player submissions
              </Text>
            </View>
            <IconButton
              icon="refresh"
              iconColor="#fff"
              size={28}
              onPress={onRefresh}
              style={styles.refreshButton}
            />
          </View>
          
          <View style={styles.statsContainer}>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>
                {videoSubmissions.filter(v => v.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>
                {videoSubmissions.filter(v => v.status === 'reviewed').length}
              </Text>
              <Text style={styles.statLabel}>Reviewed</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statNumber}>
                {Math.round(videoSubmissions.reduce((acc, v) => acc + (v.aiAnalysis?.technique || 0), 0) / videoSubmissions.length)}%
              </Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </Surface>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search by player, technique, or description..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={{ color: COLORS.text }}
        />

        <FlatList
          data={categories}
          renderItem={renderCategoryChip}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={styles.categoriesList}
        />

        <FlatList
          data={filteredVideos}
          renderItem={renderVideoCard}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.videosList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Video Detail Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedVideo && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Image source={{ uri: selectedVideo.thumbnail }} style={styles.modalThumbnail} />
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                />
              </View>

              <View style={styles.playerInfoModal}>
                <Avatar.Image size={50} source={{ uri: selectedVideo.player.avatar }} />
                <View style={styles.playerDetailsModal}>
                  <Text style={TEXT_STYLES.heading}>{selectedVideo.player.name}</Text>
                  <Text style={TEXT_STYLES.caption}>
                    {selectedVideo.player.position} • {selectedVideo.technique}
                  </Text>
                </View>
              </View>

              <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
                {selectedVideo.description}
              </Text>

              <Card style={styles.aiAnalysisCard}>
                <Card.Title 
                  title="AI Analysis" 
                  titleStyle={TEXT_STYLES.subheading}
                  left={(props) => <Icon {...props} name="psychology" color={COLORS.accent} />}
                />
                <Card.Content>
                  <View style={styles.analysisMetrics}>
                    {Object.entries(selectedVideo.aiAnalysis)
                      .filter(([key]) => key !== 'areas_for_improvement')
                      .map(([key, value]) => (
                        <View key={key} style={styles.analysisMetric}>
                          <Text style={styles.analysisLabel}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Text>
                          <ProgressBar progress={value / 100} color={COLORS.primary} style={styles.analysisBar} />
                          <Text style={styles.analysisValue}>{value}%</Text>
                        </View>
                      ))}
                  </View>
                  
                  <Divider style={styles.divider} />
                  
                  <Text style={styles.improvementTitle}>Areas for Improvement:</Text>
                  {selectedVideo.aiAnalysis.areas_for_improvement.map((area, index) => (
                    <View key={index} style={styles.improvementItem}>
                      <Icon name="arrow-right" size={16} color={COLORS.warning} />
                      <Text style={styles.improvementText}>{area}</Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                >
                  Close
                </Button>
                {selectedVideo.status === 'pending' && (
                  <Button
                    mode="contained"
                    onPress={() => {
                      setModalVisible(false);
                      handleProvideFeedback(selectedVideo);
                    }}
                    style={styles.modalButton}
                    icon="rate-review"
                  >
                    Provide Feedback
                  </Button>
                )}
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      {/* Feedback Modal */}
      <Portal>
        <Modal
          visible={feedbackModalVisible}
          onDismiss={() => setFeedbackModalVisible(false)}
          contentContainerStyle={styles.feedbackModalContainer}
        >
          <ScrollView style={styles.feedbackModalContent}>
            <View style={styles.feedbackModalHeader}>
              <Text style={TEXT_STYLES.heading}>Provide Feedback</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setFeedbackModalVisible(false)}
                style={styles.closeButton}
              />
            </View>

            {selectedVideo && (
              <View style={styles.feedbackPlayerInfo}>
                <Avatar.Image size={40} source={{ uri: selectedVideo.player.avatar }} />
                <View>
                  <Text style={TEXT_STYLES.subheading}>{selectedVideo.player.name}</Text>
                  <Text style={TEXT_STYLES.caption}>{selectedVideo.technique}</Text>
                </View>
              </View>
            )}

            {renderRatingStars()}

            <View style={styles.feedbackTextContainer}>
              <Text style={TEXT_STYLES.subheading}>Detailed Feedback *</Text>
              <TextInput
                mode="outlined"
                placeholder="Provide detailed feedback on technique, areas for improvement, and positive aspects..."
                value={feedbackText}
                onChangeText={setFeedbackText}
                multiline
                numberOfLines={4}
                style={styles.feedbackInput}
                outlineColor={COLORS.primary}
              />
            </View>

            <View style={styles.tagsContainer}>
              <Text style={TEXT_STYLES.subheading}>Tags (Optional)</Text>
              <View style={styles.tagsGrid}>
                {techniqueTags.map((tag) => (
                  <Chip
                    key={tag}
                    mode={selectedTags.includes(tag) ? 'flat' : 'outlined'}
                    selected={selectedTags.includes(tag)}
                    onPress={() => handleTagToggle(tag)}
                    style={[
                      styles.tagChip,
                      selectedTags.includes(tag) && { backgroundColor: COLORS.primary }
                    ]}
                    textStyle={selectedTags.includes(tag) ? { color: '#fff' } : { color: COLORS.primary }}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.feedbackActions}>
              <Button
                mode="outlined"
                onPress={() => setFeedbackModalVisible(false)}
                style={styles.feedbackButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmitFeedback}
                style={styles.feedbackButton}
                loading={isLoading}
                disabled={isLoading || !selectedRating || !feedbackText.trim()}
              >
                Submit Feedback
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      <FAB
        icon="video-plus"
        label="View All Videos"
        style={styles.fab}
        onPress={() => navigation.navigate('VideoLibrary')}
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
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  refreshButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchBar: {
    marginVertical: SPACING.md,
    elevation: 2,
    backgroundColor: COLORS.surface,
  },
  categoriesList: {
    marginBottom: SPACING.md,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    elevation: 1,
  },
  videosList: {
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: SPACING.md,
  },
  videoCard: {
    elevation: 3,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  videoThumbnailContainer: {
    position: 'relative',
    height: 180,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusChip: {
    position: 'absolute',
    top: 10,
    left: 10,
    elevation: 2,
  },
  cardContent: {
    paddingTop: SPACING.md,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  playerDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  priorityChip: {
    height: 28,
  },
  description: {
    marginBottom: SPACING.md,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  videoMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  metricText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  feedbackPreview: {
    backgroundColor: '#f8fafc',
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  feedbackText: {
    fontSize: 14,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  feedbackButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  modalContainer: {
    margin: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    maxHeight: '85%',
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalHeader: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  modalThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  playerInfoModal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  playerDetailsModal: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  modalDescription: {
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  aiAnalysisCard: {
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  analysisMetrics: {
    marginBottom: SPACING.md,
  },
  analysisMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  analysisLabel: {
    width: 100,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  analysisBar: {
    flex: 1,
    marginHorizontal: SPACING.md,
    height: 6,
    borderRadius: 3,
  },
  analysisValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    width: 40,
    textAlign: 'right',
  },
  divider: {
    marginVertical: SPACING.md,
  },
  improvementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  improvementText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  feedbackModalContainer: {
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    maxHeight: '90%',
  },
  feedbackModalContent: {
    padding: SPACING.lg,
  },
  feedbackModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  feedbackPlayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  ratingContainer: {
    marginBottom: SPACING.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  starButton: {
    padding: SPACING.sm,
  },
  ratingLabel: {
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  feedbackTextContainer: {
    marginBottom: SPACING.lg,
  },
  feedbackInput: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  tagsContainer: {
    marginBottom: SPACING.lg,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  tagChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  feedbackActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  feedbackButton: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.accent,
  },
});

export default TechniqueFeedback;
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
  FlatList,
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
  Badge,
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
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#FF6B6B',
  purple: '#9C27B0',
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

const VideoAnalysis = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, videoAnalyses, isLoading } = useSelector(state => state.analysis);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('my-videos');
  const [analysisModal, setAnalysisModal] = useState({ visible: false, analysis: null });
  const [uploadModal, setUploadModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({ visible: false, feedback: null });
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Mock data for video analyses
  const mockAnalyses = [
    {
      id: '1',
      title: '⚽ Free Kick Practice',
      uploadDate: '2025-08-28',
      duration: '2:15',
      thumbnail: '🎯',
      status: 'analyzed',
      coachFeedback: {
        coach: 'Coach Sarah',
        rating: 4.2,
        comments: 'Great form! Work on follow-through for more power.',
        timestamp: '2025-08-28T15:30:00Z',
        hasAudio: true,
      },
      aiInsights: {
        accuracy: 85,
        technique: 78,
        power: 72,
        consistency: 88,
        improvements: ['Follow-through', 'Body positioning'],
        strengths: ['Ball placement', 'Approach angle'],
      },
      tags: ['free-kick', 'shooting', 'technique'],
      isNew: true,
    },
    {
      id: '2',
      title: '🏃‍♂️ Sprint Training',
      uploadDate: '2025-08-27',
      duration: '1:45',
      thumbnail: '💨',
      status: 'processing',
      coachFeedback: null,
      aiInsights: null,
      tags: ['sprint', 'speed', 'running'],
      isNew: false,
    },
    {
      id: '3',
      title: '🤹‍♂️ Ball Juggling',
      uploadDate: '2025-08-26',
      duration: '3:20',
      thumbnail: '⚽',
      status: 'analyzed',
      coachFeedback: {
        coach: 'Coach Mike',
        rating: 4.7,
        comments: 'Excellent control! Try mixing in some tricks next time.',
        timestamp: '2025-08-26T14:15:00Z',
        hasAudio: true,
      },
      aiInsights: {
        accuracy: 92,
        technique: 89,
        control: 94,
        consistency: 87,
        improvements: ['Variety of touches', 'Height control'],
        strengths: ['Balance', 'Touch consistency', 'Focus'],
      },
      tags: ['juggling', 'ball-control', 'skills'],
      isNew: false,
    },
    {
      id: '4',
      title: '🥅 Penalty Shots',
      uploadDate: '2025-08-25',
      duration: '4:10',
      thumbnail: '🎯',
      status: 'analyzed',
      coachFeedback: {
        coach: 'Coach Emma',
        rating: 3.8,
        comments: 'Good accuracy but work on power. Mix up your corners more.',
        timestamp: '2025-08-25T16:45:00Z',
        hasAudio: false,
      },
      aiInsights: {
        accuracy: 76,
        technique: 82,
        power: 65,
        placement: 89,
        improvements: ['Shot power', 'Corner variation'],
        strengths: ['Accuracy', 'Composure', 'Technique'],
      },
      tags: ['penalties', 'shooting', 'accuracy'],
      isNew: false,
    },
  ];

  const tabs = [
    { id: 'my-videos', label: 'My Videos', icon: 'video-library', count: mockAnalyses.length },
    { id: 'feedback', label: 'Feedback', icon: 'feedback', count: 3 },
    { id: 'insights', label: 'AI Insights', icon: 'psychology', count: 2 },
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
      Animated.spring(scaleAnim, {
        toValue: 1,
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(refreshVideoAnalyses());
    } catch (error) {
      Alert.alert('Oops! 😅', 'Something went wrong. Please try again!');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter analyses based on search and tab
  const filteredAnalyses = mockAnalyses.filter(analysis => {
    const matchesSearch = analysis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         analysis.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    switch (selectedTab) {
      case 'feedback':
        return matchesSearch && analysis.coachFeedback;
      case 'insights':
        return matchesSearch && analysis.aiInsights;
      default:
        return matchesSearch;
    }
  });

  // Handle video press
  const handleVideoPress = (analysis) => {
    Vibration.vibrate(50);
    setAnalysisModal({ visible: true, analysis });
  };

  // Handle upload video
  const handleUploadVideo = () => {
    Vibration.vibrate(30);
    setUploadModal(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'analyzed': return COLORS.success;
      case 'processing': return COLORS.warning;
      case 'pending': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  // Get status emoji
  const getStatusEmoji = (status) => {
    switch (status) {
      case 'analyzed': return '✅';
      case 'processing': return '🔄';
      case 'pending': return '⏳';
      default: return '📹';
    }
  };

  // Render tab chip
  const renderTabChip = (tab) => (
    <TouchableOpacity
      key={tab.id}
      onPress={() => setSelectedTab(tab.id)}
      style={[
        styles.tabChip,
        selectedTab === tab.id && styles.tabChipActive,
      ]}
    >
      <Icon
        name={tab.icon}
        size={20}
        color={selectedTab === tab.id ? 'white' : COLORS.primary}
        style={styles.tabIcon}
      />
      <Text
        style={[
          styles.tabText,
          selectedTab === tab.id && styles.tabTextActive,
        ]}
      >
        {tab.label}
      </Text>
      {tab.count > 0 && (
        <Badge
          size={18}
          style={[
            styles.tabBadge,
            selectedTab === tab.id && styles.tabBadgeActive,
          ]}
        >
          {tab.count}
        </Badge>
      )}
    </TouchableOpacity>
  );

  // Render video analysis card
  const renderAnalysisCard = (analysis) => (
    <Animated.View
      key={analysis.id}
      style={[
        styles.analysisCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Card style={styles.card} elevation={4}>
        <TouchableOpacity onPress={() => handleVideoPress(analysis)}>
          <Surface style={styles.thumbnailContainer}>
            <Text style={styles.thumbnailEmoji}>{analysis.thumbnail}</Text>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{analysis.duration}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(analysis.status) }]}>
              <Text style={styles.statusText}>
                {getStatusEmoji(analysis.status)} {analysis.status.toUpperCase()}
              </Text>
            </View>
            {analysis.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW! ✨</Text>
              </View>
            )}
          </Surface>
        </TouchableOpacity>

        <Card.Content style={styles.cardContent}>
          <View style={styles.videoHeader}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {analysis.title}
            </Text>
            <Text style={styles.uploadDate}>
              {new Date(analysis.uploadDate).toLocaleDateString()}
            </Text>
          </View>

          {/* Coach Feedback Preview */}
          {analysis.coachFeedback && (
            <TouchableOpacity
              style={styles.feedbackPreview}
              onPress={() => setFeedbackModal({ visible: true, feedback: analysis.coachFeedback })}
            >
              <View style={styles.feedbackHeader}>
                <Avatar.Text
                  size={32}
                  label={analysis.coachFeedback.coach.charAt(6)}
                  style={styles.coachAvatar}
                />
                <View style={styles.feedbackInfo}>
                  <Text style={styles.coachName}>{analysis.coachFeedback.coach}</Text>
                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        name="star"
                        size={16}
                        color={star <= Math.floor(analysis.coachFeedback.rating) ? COLORS.warning : COLORS.background}
                      />
                    ))}
                    <Text style={styles.ratingText}>({analysis.coachFeedback.rating})</Text>
                  </View>
                </View>
                {analysis.coachFeedback.hasAudio && (
                  <Icon name="volume-up" size={20} color={COLORS.primary} />
                )}
              </View>
              <Text style={styles.feedbackComment} numberOfLines={2}>
                "{analysis.coachFeedback.comments}"
              </Text>
            </TouchableOpacity>
          )}

          {/* AI Insights Preview */}
          {analysis.aiInsights && (
            <View style={styles.insightsPreview}>
              <View style={styles.insightsHeader}>
                <Icon name="psychology" size={20} color={COLORS.purple} />
                <Text style={styles.insightsTitle}>AI Analysis 🤖</Text>
              </View>
              <View style={styles.metricsContainer}>
                {Object.entries({
                  accuracy: analysis.aiInsights.accuracy,
                  technique: analysis.aiInsights.technique,
                }).map(([key, value]) => (
                  <View key={key} style={styles.metricItem}>
                    <Text style={styles.metricLabel}>{key}</Text>
                    <View style={styles.metricBar}>
                      <View
                        style={[
                          styles.metricFill,
                          { width: `${value}%`, backgroundColor: value >= 80 ? COLORS.success : value >= 60 ? COLORS.warning : COLORS.error }
                        ]}
                      />
                    </View>
                    <Text style={styles.metricValue}>{value}%</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {analysis.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                mode="outlined"
                compact
                textStyle={styles.tagText}
                style={styles.tag}
              >
                #{tag}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Video Analysis 📹</Text>
          <Text style={styles.headerSubtitle}>
            Get AI insights & coach feedback! 🚀
          </Text>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <Surface style={styles.searchContainer} elevation={2}>
        <Searchbar
          placeholder="Search your videos... 🔍"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
      </Surface>

      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map(renderTabChip)}
      </ScrollView>

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
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Surface style={styles.statCard} elevation={2}>
            <Icon name="video-library" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{mockAnalyses.length}</Text>
            <Text style={styles.statLabel}>Total Videos</Text>
          </Surface>
          <Surface style={styles.statCard} elevation={2}>
            <Icon name="feedback" size={24} color={COLORS.success} />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Coach Reviews</Text>
          </Surface>
          <Surface style={styles.statCard} elevation={2}>
            <Icon name="psychology" size={24} color={COLORS.purple} />
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>AI Analyses</Text>
          </Surface>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleUploadVideo}>
            <LinearGradient
              colors={[COLORS.accent, '#FF8A65']}
              style={styles.quickActionGradient}
            >
              <Icon name="video-call" size={32} color="white" />
            </LinearGradient>
            <Text style={styles.quickActionText}>Upload Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Coming Soon! 📱', 'Live analysis feature coming soon!')}
          >
            <LinearGradient
              colors={[COLORS.success, '#66BB6A']}
              style={styles.quickActionGradient}
            >
              <Icon name="videocam" size={32} color="white" />
            </LinearGradient>
            <Text style={styles.quickActionText}>Live Analysis</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert('Coming Soon! 📊', 'Progress reports coming soon!')}
          >
            <LinearGradient
              colors={[COLORS.purple, '#AB47BC']}
              style={styles.quickActionGradient}
            >
              <Icon name="assessment" size={32} color="white" />
            </LinearGradient>
            <Text style={styles.quickActionText}>Progress Report</Text>
          </TouchableOpacity>
        </View>

        {/* Video Analyses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedTab === 'my-videos' && 'My Videos 📹'}
            {selectedTab === 'feedback' && 'Coach Feedback 💬'}
            {selectedTab === 'insights' && 'AI Insights 🤖'}
          </Text>
          
          {filteredAnalyses.length > 0 ? (
            filteredAnalyses.map(renderAnalysisCard)
          ) : (
            <Surface style={styles.emptyState} elevation={1}>
              <Text style={styles.emptyStateEmoji}>
                {selectedTab === 'my-videos' && '📹'}
                {selectedTab === 'feedback' && '💬'}
                {selectedTab === 'insights' && '🤖'}
              </Text>
              <Text style={styles.emptyStateTitle}>
                {selectedTab === 'my-videos' && 'No videos found'}
                {selectedTab === 'feedback' && 'No feedback yet'}
                {selectedTab === 'insights' && 'No AI insights yet'}
              </Text>
              <Text style={styles.emptyStateText}>
                {selectedTab === 'my-videos' && 'Upload your first training video to get started!'}
                {selectedTab === 'feedback' && 'Your coach will provide feedback on uploaded videos'}
                {selectedTab === 'insights' && 'AI analysis will be available after video processing'}
              </Text>
            </Surface>
          )}
        </View>
      </ScrollView>

      {/* Upload Modal */}
      <Portal>
        <Modal
          visible={uploadModal}
          onDismiss={() => setUploadModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.uploadModal} elevation={8}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Training Video 📹</Text>
              <IconButton
                icon="close"
                onPress={() => setUploadModal(false)}
              />
            </View>
            
            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => {
                  setUploadModal(false);
                  Alert.alert('Feature Coming Soon! 📱', 'Camera recording will be available soon!');
                }}
              >
                <Icon name="videocam" size={48} color={COLORS.primary} />
                <Text style={styles.uploadOptionText}>Record Now 🎥</Text>
                <Text style={styles.uploadOptionDesc}>Use camera to record</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => {
                  setUploadModal(false);
                  Alert.alert('Feature Coming Soon! 📁', 'Gallery selection will be available soon!');
                }}
              >
                <Icon name="photo-library" size={48} color={COLORS.secondary} />
                <Text style={styles.uploadOptionText}>Choose from Gallery 📱</Text>
                <Text style={styles.uploadOptionDesc}>Select existing video</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </Modal>
      </Portal>

      {/* Analysis Detail Modal */}
      <Portal>
        <Modal
          visible={analysisModal.visible}
          onDismiss={() => setAnalysisModal({ visible: false, analysis: null })}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.blurContainer}>
            <Surface style={styles.analysisDetailModal} elevation={8}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {analysisModal.analysis?.title}
                  </Text>
                  <IconButton
                    icon="close"
                    onPress={() => setAnalysisModal({ visible: false, analysis: null })}
                  />
                </View>
                
                <View style={styles.videoPlayerPlaceholder}>
                  <Text style={styles.videoPlayerEmoji}>
                    {analysisModal.analysis?.thumbnail}
                  </Text>
                  <Text style={styles.videoPlayerText}>
                    Video Player Coming Soon! 🎬
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => Alert.alert('Coming Soon! 🚀', 'Video playback coming soon!')}
                    style={styles.playButton}
                  >
                    Play Video ▶️
                  </Button>
                </View>
                
                {/* Detailed AI Insights */}
                {analysisModal.analysis?.aiInsights && (
                  <View style={styles.detailedInsights}>
                    <Text style={styles.detailedInsightsTitle}>AI Analysis Results 🤖</Text>
                    
                    {/* Metrics */}
                    <View style={styles.detailedMetrics}>
                      {Object.entries(analysisModal.analysis.aiInsights)
                        .filter(([key]) => typeof analysisModal.analysis.aiInsights[key] === 'number')
                        .map(([key, value]) => (
                          <View key={key} style={styles.detailedMetric}>
                            <Text style={styles.detailedMetricLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                            <ProgressBar
                              progress={value / 100}
                              color={value >= 80 ? COLORS.success : value >= 60 ? COLORS.warning : COLORS.error}
                              style={styles.detailedMetricBar}
                            />
                            <Text style={styles.detailedMetricValue}>{value}%</Text>
                          </View>
                        ))}
                    </View>
                    
                    {/* Improvements */}
                    <View style={styles.improvementsSection}>
                      <Text style={styles.improvementsTitle}>Areas to Improve 📈</Text>
                      {analysisModal.analysis.aiInsights.improvements.map((improvement, index) => (
                        <View key={index} style={styles.improvementItem}>
                          <Icon name="trending-up" size={20} color={COLORS.warning} />
                          <Text style={styles.improvementText}>{improvement}</Text>
                        </View>
                      ))}
                    </View>
                    
                    {/* Strengths */}
                    <View style={styles.strengthsSection}>
                      <Text style={styles.strengthsTitle}>Your Strengths 💪</Text>
                      {analysisModal.analysis.aiInsights.strengths.map((strength, index) => (
                        <View key={index} style={styles.strengthItem}>
                          <Icon name="check-circle" size={20} color={COLORS.success} />
                          <Text style={styles.strengthText}>{strength}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>

      {/* Feedback Detail Modal */}
      <Portal>
        <Modal
          visible={feedbackModal.visible}
          onDismiss={() => setFeedbackModal({ visible: false, feedback: null })}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.feedbackDetailModal} elevation={8}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Coach Feedback 💬</Text>
              <IconButton
                icon="close"
                onPress={() => setFeedbackModal({ visible: false, feedback: null })}
              />
            </View>
            
            {feedbackModal.feedback && (
              <View style={styles.feedbackContent}>
                <View style={styles.feedbackCoachInfo}>
                  <Avatar.Text
                    size={48}
                    label={feedbackModal.feedback.coach.charAt(6)}
                    style={styles.feedbackCoachAvatar}
                  />
                  <View style={styles.feedbackCoachDetails}>
                    <Text style={styles.feedbackCoachName}>{feedbackModal.feedback.coach}</Text>
                    <View style={styles.feedbackRating}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          name="star"
                          size={20}
                          color={star <= Math.floor(feedbackModal.feedback.rating) ? COLORS.warning : COLORS.background}
                        />
                      ))}
                      <Text style={styles.feedbackRatingText}>({feedbackModal.feedback.rating}/5)</Text>
                    </View>
                  </View>
                  {feedbackModal.feedback.hasAudio && (
                    <Button
                      mode="contained"
                      compact
                      onPress={() => Alert.alert('Coming Soon! 🎵', 'Audio feedback coming soon!')}
                    >
                      🎵 Play Audio
                    </Button>
                  )}
                </View>
                
                <View style={styles.feedbackComment}>
                  <Text style={styles.feedbackCommentText}>
                    "{feedbackModal.feedback.comments}"
                  </Text>
                </View>
                
                <Text style={styles.feedbackTimestamp}>
                  {new Date(feedbackModal.feedback.timestamp).toLocaleString()}
                </Text>
              </View>
            )}
          </Surface>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="video-call"
        label="Upload Video"
        style={styles.fab}
        onPress={handleUploadVideo}
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
  tabsContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  tabsContent: {
    paddingRight: SPACING.md,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  tabChipActive: {
    backgroundColor: COLORS.primary,
  },
  tabIcon: {
    marginRight: SPACING.xs,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  tabTextActive: {
    color: 'white',
  },
  tabBadge: {
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.primary,
  },
  tabBadgeActive: {
    backgroundColor: 'white',
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
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    fontSize: 12,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
  analysisCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
  },
  thumbnailContainer: {
    height: 160,
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
    left: SPACING.sm,
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
  statusBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
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
  cardContent: {
    padding: SPACING.md,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  videoTitle: {
    ...TEXT_STYLES.subtitle,
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
  },
  uploadDate: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  feedbackPreview: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  coachAvatar: {
    backgroundColor: COLORS.primary,
  },
  feedbackInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  coachName: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  feedbackComment: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  insightsPreview: {
    backgroundColor: '#F3E5F5',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  insightsTitle: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    color: COLORS.purple,
  },
  metricsContainer: {
    gap: SPACING.sm,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    fontWeight: '600',
    width: 70,
    textTransform: 'capitalize',
  },
  metricBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    borderRadius: 3,
    marginHorizontal: SPACING.sm,
  },
  metricFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricValue: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    fontWeight: 'bold',
    width: 35,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tag: {
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.primary,
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
    fontSize: 18,
  },
  emptyStateText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  uploadModal: {
    width: width - SPACING.xl,
    borderRadius: 16,
    backgroundColor: 'white',
    maxHeight: height * 0.6,
  },
  analysisDetailModal: {
    width: width - SPACING.lg,
    maxHeight: height * 0.9,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  feedbackDetailModal: {
    width: width - SPACING.xl,
    maxHeight: height * 0.7,
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
    fontWeight: 'bold',
  },
  uploadOptions: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  uploadOption: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.background,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  uploadOptionText: {
    ...TEXT_STYLES.body,
    fontSize: 16,
    fontWeight: '600',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  uploadOptionDesc: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  videoPlayerPlaceholder: {
    height: 200,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.md,
    borderRadius: 8,
  },
  videoPlayerEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  videoPlayerText: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
  },
  playButton: {
    backgroundColor: COLORS.primary,
  },
  detailedInsights: {
    padding: SPACING.md,
  },
  detailedInsightsTitle: {
    ...TEXT_STYLES.subtitle,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.purple,
  },
  detailedMetrics: {
    marginBottom: SPACING.lg,
  },
  detailedMetric: {
    marginBottom: SPACING.md,
  },
  detailedMetricLabel: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    textTransform: 'capitalize',
  },
  detailedMetricBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  detailedMetricValue: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  improvementsSection: {
    marginBottom: SPACING.lg,
  },
  improvementsTitle: {
    ...TEXT_STYLES.body,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.warning,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  improvementText: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    marginLeft: SPACING.sm,
    color: COLORS.text,
  },
  strengthsSection: {
    marginBottom: SPACING.lg,
  },
  strengthsTitle: {
    ...TEXT_STYLES.body,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.success,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  strengthText: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    marginLeft: SPACING.sm,
    color: COLORS.text,
  },
  feedbackContent: {
    padding: SPACING.md,
  },
  feedbackCoachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  feedbackCoachAvatar: {
    backgroundColor: COLORS.primary,
  },
  feedbackCoachDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  feedbackCoachName: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  feedbackRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackRatingText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackComment: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  feedbackCommentText: {
    ...TEXT_STYLES.body,
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 22,
    color: COLORS.text,
  },
  feedbackTimestamp: {
    ...TEXT_STYLES.caption,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
  },
});

export default VideoAnalysis;
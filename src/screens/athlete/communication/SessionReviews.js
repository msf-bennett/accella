import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  Portal,
  Modal,
  TextInput,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SessionReviews = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  // Mock data for demonstration
  const mockReviews = [
    {
      id: '1',
      sessionId: 'sess_001',
      sessionTitle: 'Speed & Agility Training',
      sessionDate: '2024-08-20',
      coachName: 'Coach Sarah Johnson',
      coachAvatar: 'https://example.com/coach1.jpg',
      rating: 4.5,
      coachFeedback: 'Great improvement in your sprint technique today! Your acceleration has noticeably improved. Keep focusing on maintaining proper form during the explosive starts.',
      playerResponse: null,
      status: 'pending_response',
      timestamp: '2024-08-20T18:30:00Z',
      achievements: ['Speed Demon', 'Perfect Form'],
      recommendations: [
        'Continue plyometric exercises',
        'Focus on core strengthening',
        'Practice sprint starts'
      ],
    },
    {
      id: '2',
      sessionId: 'sess_002',
      sessionTitle: 'Ball Control & Passing',
      sessionDate: '2024-08-18',
      coachName: 'Coach Mike Torres',
      coachAvatar: 'https://example.com/coach2.jpg',
      rating: 4.0,
      coachFeedback: 'Your passing accuracy has improved significantly. Work on first touch control when receiving passes under pressure.',
      playerResponse: 'Thank you coach! I felt much more confident with my passing today. Will practice the pressure drills we discussed.',
      status: 'responded',
      timestamp: '2024-08-18T19:15:00Z',
      achievements: ['Precision Passer'],
      recommendations: [
        'Practice wall passes',
        'Work on weak foot passing',
        'Improve reaction time'
      ],
    },
    {
      id: '3',
      sessionId: 'sess_003',
      sessionTitle: 'Tactical Awareness',
      sessionDate: '2024-08-16',
      coachName: 'Coach Sarah Johnson',
      coachAvatar: 'https://example.com/coach1.jpg',
      rating: 5.0,
      coachFeedback: 'Outstanding tactical understanding today! Your positioning and decision-making have reached a new level. Keep up the excellent work!',
      playerResponse: 'This was one of my favorite sessions! Everything clicked for me today. Really excited to apply these concepts in the next match.',
      status: 'responded',
      timestamp: '2024-08-16T17:45:00Z',
      achievements: ['Tactical Genius', 'Team Player', 'Game Changer'],
      recommendations: [
        'Continue studying game footage',
        'Practice set piece positioning',
        'Develop leadership skills'
      ],
    },
  ];

  useEffect(() => {
    loadReviews();
    startAnimation();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, selectedFilter]);

  const startAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReviews(mockReviews);
    } catch (error) {
      Alert.alert('Error', 'Failed to load session reviews');
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;
    
    switch (selectedFilter) {
      case 'pending':
        filtered = reviews.filter(review => review.status === 'pending_response');
        break;
      case 'responded':
        filtered = reviews.filter(review => review.status === 'responded');
        break;
      case 'high_rating':
        filtered = reviews.filter(review => review.rating >= 4.5);
        break;
      default:
        filtered = reviews;
    }
    
    setFilteredReviews(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  }, []);

  const handleReply = (review) => {
    setSelectedReview(review);
    setReplyText('');
    setShowReplyModal(true);
  };

  const submitReply = async () => {
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter your response');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedReviews = reviews.map(review =>
        review.id === selectedReview.id
          ? { ...review, playerResponse: replyText, status: 'responded' }
          : review
      );
      
      setReviews(updatedReviews);
      setShowReplyModal(false);
      Alert.alert('Success', 'Your response has been sent to your coach!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send response');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="star" size={16} color={COLORS.warning} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half" size={16} color={COLORS.warning} />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star-border" size={16} color={COLORS.textSecondary} />
      );
    }

    return stars;
  };

  const renderReviewCard = (review) => (
    <Card key={review.id} style={styles.reviewCard}>
      <Card.Content>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.coachInfo}>
            <Avatar.Image
              size={40}
              source={{ uri: review.coachAvatar }}
              style={styles.coachAvatar}
            />
            <View style={styles.coachDetails}>
              <Text style={styles.coachName}>{review.coachName}</Text>
              <Text style={styles.sessionDate}>{review.sessionDate}</Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderStars(review.rating)}
            </View>
            <Text style={styles.ratingText}>{review.rating}</Text>
          </View>
        </View>

        {/* Session Title */}
        <Surface style={styles.sessionTitleContainer}>
          <Icon name="fitness-center" size={20} color={COLORS.primary} />
          <Text style={styles.sessionTitle}>{review.sessionTitle}</Text>
        </Surface>

        {/* Achievements */}
        {review.achievements.length > 0 && (
          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>🏆 Achievements Unlocked</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {review.achievements.map((achievement, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  style={styles.achievementChip}
                  textStyle={styles.achievementText}
                >
                  {achievement}
                </Chip>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Coach Feedback */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>💬 Coach Feedback</Text>
          <Surface style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{review.coachFeedback}</Text>
          </Surface>
        </View>

        {/* Recommendations */}
        {review.recommendations.length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>📋 Recommendations</Text>
            {review.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Player Response */}
        {review.playerResponse ? (
          <View style={styles.responseSection}>
            <Text style={styles.sectionTitle}>✍️ Your Response</Text>
            <Surface style={styles.responseContainer}>
              <Text style={styles.responseText}>{review.playerResponse}</Text>
            </Surface>
          </View>
        ) : (
          <Button
            mode="contained"
            onPress={() => handleReply(review)}
            style={styles.replyButton}
            contentStyle={styles.replyButtonContent}
          >
            Reply to Coach
          </Button>
        )}

        {/* Status Badge */}
        <Chip
          style={[
            styles.statusChip,
            review.status === 'responded' ? styles.respondedChip : styles.pendingChip
          ]}
          textStyle={styles.statusChipText}
        >
          {review.status === 'responded' ? '✅ Responded' : '⏳ Pending Response'}
        </Chip>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="rate-review" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>No Session Reviews</Text>
      <Text style={styles.emptyStateSubtitle}>
        Your coach will provide feedback after training sessions
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="rate-review" size={60} color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Session Reviews</Text>
        <Text style={styles.headerSubtitle}>
          Track your progress and communicate with coaches
        </Text>
      </LinearGradient>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { key: 'all', label: 'All Reviews', icon: 'list' },
          { key: 'pending', label: 'Pending', icon: 'schedule' },
          { key: 'responded', label: 'Responded', icon: 'check-circle' },
          { key: 'high_rating', label: 'Top Rated', icon: 'star' },
        ].map((filter) => (
          <Chip
            key={filter.key}
            mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
            selected={selectedFilter === filter.key}
            onPress={() => setSelectedFilter(filter.key)}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.selectedFilterChip
            ]}
            textStyle={[
              styles.filterChipText,
              selectedFilter === filter.key && styles.selectedFilterChipText
            ]}
            icon={filter.icon}
          >
            {filter.label}
          </Chip>
        ))}
      </ScrollView>

      {/* Reviews List */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.scrollView}
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
          {filteredReviews.length > 0 ? (
            <>
              {filteredReviews.map(renderReviewCard)}
              <View style={styles.bottomSpacer} />
            </>
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
      </Animated.View>

      {/* Reply Modal */}
      <Portal>
        <Modal
          visible={showReplyModal}
          onDismiss={() => setShowReplyModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
          >
            <Surface style={styles.replyModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Reply to Coach</Text>
                <TouchableOpacity
                  onPress={() => setShowReplyModal(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedReview && (
                <View style={styles.modalSessionInfo}>
                  <Text style={styles.modalSessionTitle}>
                    {selectedReview.sessionTitle}
                  </Text>
                  <Text style={styles.modalCoachName}>
                    Coach: {selectedReview.coachName}
                  </Text>
                </View>
              )}

              <TextInput
                mode="outlined"
                label="Your response"
                value={replyText}
                onChangeText={setReplyText}
                multiline
                numberOfLines={4}
                style={styles.replyInput}
                placeholder="Share your thoughts about the session..."
              />

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowReplyModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={submitReply}
                  style={styles.sendButton}
                >
                  Send Reply
                </Button>
              </View>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterContainer: {
    marginVertical: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.lg,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textPrimary,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  reviewCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 3,
  },
  cardHeader: {
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
    marginRight: SPACING.sm,
  },
  coachDetails: {
    flex: 1,
  },
  coachName: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
  },
  sessionDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  sessionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    marginBottom: SPACING.md,
  },
  sessionTitle: {
    ...TEXT_STYLES.subtitle,
    marginLeft: SPACING.sm,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  achievementsContainer: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  achievementChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: COLORS.success,
  },
  achievementText: {
    color: COLORS.success,
    fontSize: 12,
  },
  feedbackSection: {
    marginBottom: SPACING.md,
  },
  feedbackContainer: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  feedbackText: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
  },
  recommendationsSection: {
    marginBottom: SPACING.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  recommendationText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  responseSection: {
    marginBottom: SPACING.md,
  },
  responseContainer: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  responseText: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
  },
  replyButton: {
    marginBottom: SPACING.sm,
  },
  replyButtonContent: {
    paddingVertical: SPACING.xs,
  },
  statusChip: {
    alignSelf: 'flex-end',
  },
  respondedChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  pendingChip: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  statusChipText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h2,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
  },
  emptyStateSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
  modalContainer: {
    flex: 1,
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyModal: {
    width: width - SPACING.xl,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalSessionInfo: {
    marginBottom: SPACING.lg,
  },
  modalSessionTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  modalCoachName: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  replyInput: {
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  sendButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
};

export default SessionReviews;
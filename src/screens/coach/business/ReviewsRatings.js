import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  Dimensions,
  StatusBar,
  Alert,
  TouchableOpacity,
  Animated,
  Share,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  IconButton,
  Searchbar,
  FAB,
  Portal,
  Modal,
  Divider,
  ProgressBar,
  TextInput,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design System Imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
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
  h2: { fontSize: 22, fontWeight: '600' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const ReviewRatings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, reviews } = useSelector((state) => state.coach);
  
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [animatedValue] = useState(new Animated.Value(0));

  // Reviews data state
  const [reviewsData, setReviewsData] = useState({
    overallRating: 4.8,
    totalReviews: 127,
    ratingDistribution: {
      5: 89,
      4: 24,
      3: 8,
      2: 4,
      1: 2
    },
    recentReviews: [
      {
        id: '1',
        clientName: 'Sarah Johnson',
        clientAvatar: null,
        rating: 5,
        comment: 'Alex is an amazing trainer! He helped me lose 20 pounds and gain so much confidence. His personalized approach and constant motivation made all the difference. Highly recommend!',
        date: '2025-08-14',
        hasReply: false,
        isVerified: true,
        tags: ['Weight Loss', 'Motivation', 'Results'],
        helpful: 12
      },
      {
        id: '2',
        clientName: 'Mike Chen',
        clientAvatar: null,
        rating: 5,
        comment: 'Outstanding coach! Professional, knowledgeable, and really cares about his clients. The workout plans are challenging but achievable. Definitely worth every penny.',
        date: '2025-08-12',
        hasReply: true,
        reply: 'Thank you so much, Mike! It\'s been great working with you and seeing your progress. Keep up the excellent work! 💪',
        replyDate: '2025-08-12',
        isVerified: true,
        tags: ['Professional', 'Knowledge', 'Value'],
        helpful: 8
      },
      {
        id: '3',
        clientName: 'Emma Wilson',
        clientAvatar: null,
        rating: 4,
        comment: 'Great trainer with good expertise. Sessions are well-planned and effective. Only minor issue is sometimes sessions start a few minutes late, but overall very satisfied.',
        date: '2025-08-10',
        hasReply: false,
        isVerified: true,
        tags: ['Expertise', 'Planning', 'Effective'],
        helpful: 5
      },
      {
        id: '4',
        clientName: 'David Martinez',
        clientAvatar: null,
        rating: 5,
        comment: 'Best investment I\'ve made in my health! Alex\'s nutrition guidance combined with the training has completely transformed my lifestyle. Results speak for themselves.',
        date: '2025-08-08',
        hasReply: true,
        reply: 'David, your dedication is inspiring! Thank you for trusting me with your fitness journey. 🙏',
        replyDate: '2025-08-08',
        isVerified: true,
        tags: ['Nutrition', 'Lifestyle', 'Transformation'],
        helpful: 15
      },
      {
        id: '5',
        clientName: 'Lisa Anderson',
        clientAvatar: null,
        rating: 3,
        comment: 'Decent trainer but felt like the program could be more personalized. Results were okay but expected more for the price point.',
        date: '2025-08-05',
        hasReply: false,
        isVerified: true,
        tags: ['Personalization', 'Results', 'Value'],
        helpful: 3
      },
    ],
    monthlyStats: {
      newReviews: 12,
      averageRating: 4.7,
      responseRate: 85,
      positiveReviews: 94
    },
    reviewRequests: [
      {
        id: '1',
        clientName: 'John Smith',
        sessionCount: 8,
        lastSession: '2025-08-15',
        status: 'pending'
      },
      {
        id: '2',
        clientName: 'Maria Garcia',
        sessionCount: 12,
        lastSession: '2025-08-13',
        status: 'sent'
      },
    ]
  });

  // Animation setup
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Dispatch action to refresh reviews data
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh reviews data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleReplyToReview = (review) => {
    setSelectedReview(review);
    setReplyModalVisible(true);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a reply message');
      return;
    }
    
    Alert.alert(
      '✅ Reply Sent',
      'Your reply has been posted successfully!',
      [{ text: 'Great! 🎉', style: 'default' }]
    );
    setReplyModalVisible(false);
    setReplyText('');
    setSelectedReview(null);
  };

  const handleRequestReview = (clientName) => {
    Alert.alert(
      '📝 Review Request',
      `Send review request to ${clientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Request', 
          style: 'default',
          onPress: () => Alert.alert('✅ Request Sent', `Review request sent to ${clientName} successfully!`)
        }
      ]
    );
  };

  const handleShareReview = async (review) => {
    try {
      await Share.share({
        message: `⭐ ${review.rating}/5 stars from ${review.clientName}:\n\n"${review.comment}"\n\nBook your training session today!`,
        title: 'Client Review',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share review');
    }
  };

  const handleReportReview = (reviewId) => {
    Alert.alert(
      '🚨 Report Review',
      'Report this review for inappropriate content or spam?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          style: 'destructive',
          onPress: () => Alert.alert('✅ Reported', 'Review has been reported for moderation.')
        }
      ]
    );
  };

  const renderRatingOverview = () => (
    <Card style={styles.overviewCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.overviewGradient}
      >
        <View style={styles.overviewContent}>
          <Text style={[TEXT_STYLES.h1, { color: 'white', textAlign: 'center' }]}>
            ⭐ {reviewsData.overallRating}
          </Text>
          <Text style={styles.overviewSubtitle}>Overall Rating</Text>
          <Text style={styles.overviewReviews}>
            Based on {reviewsData.totalReviews} reviews
          </Text>
          
          <View style={styles.ratingDistribution}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <View key={rating} style={styles.ratingRow}>
                <Text style={styles.ratingNumber}>{rating}</Text>
                <Icon name="star" size={16} color="#FFD700" />
                <View style={styles.ratingBarContainer}>
                  <ProgressBar 
                    progress={reviewsData.ratingDistribution[rating] / reviewsData.totalReviews}
                    color="#FFD700"
                    style={styles.ratingBar}
                  />
                </View>
                <Text style={styles.ratingCount}>
                  {reviewsData.ratingDistribution[rating]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <Surface style={styles.statCard} elevation={2}>
          <Icon name="rate-review" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
            {reviewsData.monthlyStats.newReviews}
          </Text>
          <Text style={TEXT_STYLES.caption}>New Reviews</Text>
        </Surface>
        
        <Surface style={styles.statCard} elevation={2}>
          <Icon name="reply" size={24} color={COLORS.success} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
            {reviewsData.monthlyStats.responseRate}%
          </Text>
          <Text style={TEXT_STYLES.caption}>Response Rate</Text>
        </Surface>
      </View>
      
      <View style={styles.statsRow}>
        <Surface style={styles.statCard} elevation={2}>
          <Icon name="thumb-up" size={24} color={COLORS.warning} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.warning }]}>
            {reviewsData.monthlyStats.positiveReviews}%
          </Text>
          <Text style={TEXT_STYLES.caption}>Positive Reviews</Text>
        </Surface>
        
        <Surface style={styles.statCard} elevation={2}>
          <Icon name="trending-up" size={24} color={COLORS.secondary} />
          <Text style={[TEXT_STYLES.h3, { color: COLORS.secondary }]}>
            {reviewsData.monthlyStats.averageRating}
          </Text>
          <Text style={TEXT_STYLES.caption}>Avg Rating</Text>
        </Surface>
      </View>
    </View>
  );

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? 'star' : 'star-border'}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
    );
  };

  const renderReviewItem = (review) => (
    <Card key={review.id} style={styles.reviewCard}>
      <Card.Content>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewLeft}>
            <Avatar.Text
              size={40}
              label={review.clientName.split(' ').map(n => n[0]).join('')}
              backgroundColor={COLORS.primary + '20'}
              color={COLORS.primary}
            />
            <View style={styles.reviewInfo}>
              <View style={styles.clientRow}>
                <Text style={TEXT_STYLES.body}>{review.clientName}</Text>
                {review.isVerified && (
                  <Icon name="verified" size={16} color={COLORS.success} style={styles.verifiedIcon} />
                )}
              </View>
              {renderStars(review.rating)}
              <Text style={TEXT_STYLES.caption}>{review.date}</Text>
            </View>
          </View>
          
          <View style={styles.reviewActions}>
            <IconButton
              icon="share"
              size={20}
              onPress={() => handleShareReview(review)}
            />
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => {
                Alert.alert(
                  'Review Actions',
                  'What would you like to do?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Report Review', onPress: () => handleReportReview(review.id) },
                    { text: 'Share Review', onPress: () => handleShareReview(review) }
                  ]
                );
              }}
            />
          </View>
        </View>
        
        <Text style={styles.reviewComment}>{review.comment}</Text>
        
        {review.tags && review.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {review.tags.map((tag, index) => (
              <Chip
                key={index}
                mode="outlined"
                compact
                style={styles.reviewTag}
                textStyle={{ fontSize: 10 }}
              >
                {tag}
              </Chip>
            ))}
          </View>
        )}
        
        <View style={styles.reviewFooter}>
          <TouchableOpacity style={styles.helpfulButton}>
            <Icon name="thumb-up" size={14} color={COLORS.textSecondary} />
            <Text style={styles.helpfulText}>Helpful ({review.helpful})</Text>
          </TouchableOpacity>
          
          {!review.hasReply && (
            <Button
              mode="outlined"
              compact
              onPress={() => handleReplyToReview(review)}
              style={styles.replyButton}
            >
              Reply
            </Button>
          )}
        </View>
        
        {review.hasReply && review.reply && (
          <View style={styles.replyContainer}>
            <Divider style={styles.replyDivider} />
            <View style={styles.replyHeader}>
              <Icon name="reply" size={16} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.caption, styles.replyLabel]}>Your Reply</Text>
              <Text style={TEXT_STYLES.caption}>{review.replyDate}</Text>
            </View>
            <Text style={styles.replyText}>{review.reply}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderRecentReviews = () => (
    <View style={styles.reviewsSection}>
      <View style={styles.sectionHeader}>
        <Text style={TEXT_STYLES.h3}>💬 Recent Reviews</Text>
        <View style={styles.filterContainer}>
          <Searchbar
            placeholder="Search reviews..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={{ fontSize: 14 }}
          />
        </View>
      </View>
      
      <View style={styles.filterChips}>
        {['all', '5', '4', '3', '2', '1'].map((filter) => (
          <Chip
            key={filter}
            mode={selectedFilter === filter ? 'flat' : 'outlined'}
            selected={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
            style={styles.filterChip}
            compact
          >
            {filter === 'all' ? 'All' : `${filter} ⭐`}
          </Chip>
        ))}
      </View>
      
      {reviewsData.recentReviews
        .filter(review => {
          if (selectedFilter === 'all') return true;
          return review.rating.toString() === selectedFilter;
        })
        .filter(review => {
          if (!searchQuery) return true;
          return review.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 review.comment.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .map((review) => renderReviewItem(review))}
    </View>
  );

  const renderReviewRequests = () => (
    <Card style={styles.requestsCard}>
      <Card.Title 
        title="📝 Review Requests" 
        subtitle="Follow up with clients"
        titleStyle={TEXT_STYLES.h3}
      />
      <Card.Content>
        {reviewsData.reviewRequests.map((request) => (
          <View key={request.id} style={styles.requestItem}>
            <View style={styles.requestLeft}>
              <Avatar.Text
                size={32}
                label={request.clientName.split(' ').map(n => n[0]).join('')}
                backgroundColor={COLORS.warning + '20'}
                color={COLORS.warning}
              />
              <View style={styles.requestInfo}>
                <Text style={TEXT_STYLES.body}>{request.clientName}</Text>
                <Text style={TEXT_STYLES.caption}>
                  {request.sessionCount} sessions • Last: {request.lastSession}
                </Text>
              </View>
            </View>
            
            <Button
              mode={request.status === 'sent' ? 'outlined' : 'contained'}
              compact
              onPress={() => handleRequestReview(request.clientName)}
              disabled={request.status === 'sent'}
            >
              {request.status === 'sent' ? 'Sent' : 'Request'}
            </Button>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.actionsCard}>
      <Card.Title 
        title="⚡ Quick Actions" 
        titleStyle={TEXT_STYLES.h3}
      />
      <Card.Content>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ReviewAnalytics')}
          >
            <Icon name="analytics" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Review Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ReviewSettings')}
          >
            <Icon name="settings" size={24} color={COLORS.success} />
            <Text style={styles.actionText}>Review Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('TestimonialCreator')}
          >
            <Icon name="format-quote" size={24} color={COLORS.secondary} />
            <Text style={styles.actionText}>Create Testimonial</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ReputationManager')}
          >
            <Icon name="star" size={24} color={COLORS.warning} />
            <Text style={styles.actionText}>Reputation Manager</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>⭐ Reviews & Ratings</Text>
          <Text style={styles.headerSubtitle}>Manage your reputation</Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon="analytics"
            iconColor="white"
            size={24}
            onPress={() => navigation.navigate('ReviewAnalytics')}
          />
          <IconButton
            icon="dots-vertical"
            iconColor="white"
            size={24}
            onPress={() => navigation.navigate('ReviewSettings')}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderRatingOverview()}
        {renderStatsCards()}
        {renderRecentReviews()}
        {renderReviewRequests()}
        {renderQuickActions()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="message-reply"
        style={styles.fab}
        onPress={() => Alert.alert('💬 Quick Reply', 'Feature coming soon! Quick reply to multiple reviews at once.')}
        color="white"
      />

      {/* Reply Modal */}
      <Portal>
        <Modal
          visible={replyModalVisible}
          onDismiss={() => setReplyModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={TEXT_STYLES.h3}>💬 Reply to Review</Text>
            <IconButton
              icon="close"
              onPress={() => setReplyModalVisible(false)}
            />
          </View>
          
          {selectedReview && (
            <View style={styles.modalContent}>
              <View style={styles.originalReview}>
                <Text style={TEXT_STYLES.body}>{selectedReview.clientName}</Text>
                {renderStars(selectedReview.rating)}
                <Text style={styles.originalComment}>{selectedReview.comment}</Text>
              </View>
              
              <TextInput
                mode="outlined"
                label="Your Reply"
                value={replyText}
                onChangeText={setReplyText}
                multiline
                numberOfLines={4}
                style={styles.replyInput}
                placeholder="Thank you for your feedback..."
              />
              
              <View style={styles.modalActions}>
                <Button 
                  mode="outlined" 
                  onPress={() => setReplyModalVisible(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleSendReply}
                  style={styles.sendButton}
                >
                  Send Reply
                </Button>
              </View>
            </View>
          )}
        </Modal>
      </Portal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  overviewCard: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  overviewGradient: {
    padding: SPACING.lg,
  },
  overviewContent: {
    alignItems: 'center',
  },
  overviewSubtitle: {
    color: 'white',
    opacity: 0.9,
    fontSize: 16,
    marginTop: SPACING.xs,
  },
  overviewReviews: {
    color: 'white',
    opacity: 0.8,
    fontSize: 14,
    marginBottom: SPACING.lg,
  },
  ratingDistribution: {
    width: '100%',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingNumber: {
    color: 'white',
    width: 20,
    textAlign: 'center',
  },
  ratingBarContainer: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  ratingBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  ratingCount: {
    color: 'white',
    width: 30,
    textAlign: 'right',
    fontSize: 12,
  },
  statsContainer: {
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    backgroundColor: 'white',
  },
  reviewsSection: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  filterContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  searchbar: {
    height: 40,
    elevation: 0,
    backgroundColor: 'white',
  },
  filterChips: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  reviewCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  reviewLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  reviewInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  verifiedIcon: {
    marginLeft: SPACING.xs,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  reviewActions: {
    flexDirection: 'row',
  },
  reviewComment: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  reviewTag: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpfulText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  replyButton: {
    borderRadius: 20,
  },
  replyContainer: {
    marginTop: SPACING.md,
  },
  replyDivider: {
    marginBottom: SPACING.md,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  replyLabel: {
    marginLeft: SPACING.xs,
    flex: 1,
  },
  replyText: {
    ...TEXT_STYLES.body,
    fontStyle: 'italic',
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: 8,
  },
  requestsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  actionsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'white',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  modalContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  originalReview: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  originalComment: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  replyInput: {
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: SPACING.md,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
  },
});

export default ReviewRatings;

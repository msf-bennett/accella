import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Vibration,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { 
  Card,
  Button,
  Text,
  Avatar,
  Chip,
  IconButton,
  Searchbar,
  Surface,
  ProgressBar,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const ReviewsManagement = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Mock data - replace with actual Redux state
  const [reviews, setReviews] = useState([
    {
      id: '1',
      clientName: 'Sarah Johnson',
      clientAvatar: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      date: '2024-01-15',
      comment: 'Amazing trainer! Lost 15kg in 3 months with Jake\'s personalized program. Highly professional and motivating! 💪',
      program: 'Weight Loss Bootcamp',
      replied: false,
      helpful: 12,
      verified: true,
    },
    {
      id: '2',
      clientName: 'Mike Chen',
      clientAvatar: 'https://i.pravatar.cc/150?img=2',
      rating: 4,
      date: '2024-01-12',
      comment: 'Great workout plans and nutrition advice. Would love more flexibility in scheduling sessions.',
      program: 'Strength Training',
      replied: true,
      reply: 'Thank you Mike! I\'ll work on more flexible scheduling options. Keep up the great work! 🔥',
      replyDate: '2024-01-13',
      helpful: 8,
      verified: true,
    },
    {
      id: '3',
      clientName: 'Emma Wilson',
      clientAvatar: 'https://i.pravatar.cc/150?img=3',
      rating: 5,
      date: '2024-01-10',
      comment: 'Best investment I\'ve made for my health! Jake\'s expertise in functional training is outstanding.',
      program: 'Functional Fitness',
      replied: false,
      helpful: 15,
      verified: true,
    },
    {
      id: '4',
      clientName: 'David Park',
      clientAvatar: 'https://i.pravatar.cc/150?img=4',
      rating: 3,
      date: '2024-01-08',
      comment: 'Good trainer but sessions felt rushed. Could use more attention to form correction.',
      program: 'Personal Training',
      replied: false,
      helpful: 3,
      verified: true,
    },
  ]);

  const reviewStats = {
    totalReviews: 47,
    averageRating: 4.6,
    fiveStars: 32,
    fourStars: 11,
    threeStars: 3,
    twoStars: 1,
    oneStar: 0,
    responseRate: 85,
    pendingReplies: 3,
  };

  const filters = [
    { key: 'all', label: 'All Reviews', count: reviews.length },
    { key: '5', label: '5 Stars', count: reviews.filter(r => r.rating === 5).length },
    { key: '4', label: '4 Stars', count: reviews.filter(r => r.rating === 4).length },
    { key: '3', label: '3 Stars', count: reviews.filter(r => r.rating === 3).length },
    { key: 'pending', label: 'Pending Reply', count: reviews.filter(r => !r.replied).length },
  ];

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
    ]).start();

    // Load reviews data
    loadReviews();
  }, []);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app: dispatch(fetchReviews(user.id));
    } catch (error) {
      Alert.alert('Error', 'Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadReviews]);

  const handleReplyToReview = (review) => {
    setSelectedReview(review);
    setReplyText('');
    setShowReplyModal(true);
    Vibration.vibrate(50);
  };

  const submitReply = async () => {
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a reply message');
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setReviews(prev => prev.map(review => 
        review.id === selectedReview.id 
          ? { 
              ...review, 
              replied: true, 
              reply: replyText,
              replyDate: new Date().toISOString().split('T')[0]
            }
          : review
      ));
      
      setShowReplyModal(false);
      Alert.alert('Success', 'Reply posted successfully! 🎉');
      Vibration.vibrate([100, 50, 100]);
    } catch (error) {
      Alert.alert('Error', 'Failed to post reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, size = 16) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="star"
            size={size}
            color={star <= rating ? '#FFD700' : '#E0E0E0'}
          />
        ))}
      </View>
    );
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'pending') return matchesSearch && !review.replied;
    return matchesSearch && review.rating === parseInt(selectedFilter);
  });

  const renderReviewCard = (review) => (
    <Animated.View
      key={review.id}
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
        marginBottom: SPACING.md,
      }}
    >
      <Card style={{ backgroundColor: 'white', elevation: 3 }}>
        <Card.Content>
          {/* Review Header */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: SPACING.sm 
          }}>
            <Avatar.Image 
              size={40} 
              source={{ uri: review.clientAvatar }}
            />
            <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                  {review.clientName}
                </Text>
                {review.verified && (
                  <Icon 
                    name="verified" 
                    size={16} 
                    color={COLORS.primary} 
                    style={{ marginLeft: 4 }}
                  />
                )}
              </View>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                marginTop: 2 
              }}>
                {renderStars(review.rating)}
                <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs, color: '#666' }]}>
                  {review.date}
                </Text>
              </View>
            </View>
            <Chip 
              mode="outlined"
              compact
              style={{ backgroundColor: getStatusColor(review.rating) }}
            >
              {review.rating}.0
            </Chip>
          </View>

          {/* Program Info */}
          <Surface style={{
            backgroundColor: COLORS.secondary + '20',
            padding: SPACING.xs,
            borderRadius: 8,
            marginBottom: SPACING.sm,
          }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
              📋 {review.program}
            </Text>
          </Surface>

          {/* Review Comment */}
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm, lineHeight: 22 }]}>
            {review.comment}
          </Text>

          {/* Review Reply */}
          {review.replied && (
            <View style={{
              backgroundColor: '#F5F5F5',
              padding: SPACING.sm,
              borderRadius: 8,
              borderLeftWidth: 3,
              borderLeftColor: COLORS.primary,
              marginBottom: SPACING.sm,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Icon name="reply" size={16} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { 
                  marginLeft: 4, 
                  color: COLORS.primary,
                  fontWeight: '600'
                }]}>
                  Your Reply • {review.replyDate}
                </Text>
              </View>
              <Text style={TEXT_STYLES.body}>{review.reply}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'center' 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="thumb-up" size={14} color="#666" />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: '#666' }]}>
                {review.helpful} helpful
              </Text>
            </View>
            
            {!review.replied && (
              <Button
                mode="contained"
                compact
                onPress={() => handleReplyToReview(review)}
                style={{ backgroundColor: COLORS.primary }}
              >
                Reply
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const getStatusColor = (rating) => {
    if (rating >= 4.5) return COLORS.success + '20';
    if (rating >= 3.5) return '#FFA500' + '20';
    return COLORS.error + '20';
  };

  const renderStatsModal = () => (
    <Portal>
      <Modal 
        visible={showStatsModal} 
        onDismiss={() => setShowStatsModal(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          padding: SPACING.lg,
          borderRadius: 12,
        }}
      >
        <Text style={[TEXT_STYLES.heading, { marginBottom: SPACING.md }]}>
          📊 Review Analytics
        </Text>

        {/* Overall Stats */}
        <Surface style={{
          padding: SPACING.md,
          borderRadius: 8,
          backgroundColor: COLORS.primary + '10',
          marginBottom: SPACING.md,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.heading, { color: COLORS.primary }]}>
                {reviewStats.averageRating}
              </Text>
              <Text style={TEXT_STYLES.caption}>Average Rating</Text>
              {renderStars(Math.round(reviewStats.averageRating), 18)}
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.heading, { color: COLORS.primary }]}>
                {reviewStats.totalReviews}
              </Text>
              <Text style={TEXT_STYLES.caption}>Total Reviews</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.heading, { color: COLORS.primary }]}>
                {reviewStats.responseRate}%
              </Text>
              <Text style={TEXT_STYLES.caption}>Response Rate</Text>
            </View>
          </View>
        </Surface>

        {/* Rating Breakdown */}
        <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
          Rating Distribution
        </Text>
        
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = reviewStats[`${stars === 1 ? 'one' : stars === 2 ? 'two' : stars === 3 ? 'three' : stars === 4 ? 'four' : 'five'}Star${stars === 1 ? '' : 's'}`] || reviewStats[`${stars}Stars`] || reviewStats[`${stars}Star`];
          const percentage = (count / reviewStats.totalReviews) * 100;
          
          return (
            <View key={stars} style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: SPACING.xs 
            }}>
              <Text style={[TEXT_STYLES.caption, { width: 20 }]}>{stars}</Text>
              <Icon name="star" size={16} color="#FFD700" />
              <ProgressBar 
                progress={percentage / 100}
                style={{ flex: 1, marginHorizontal: SPACING.sm, height: 8 }}
                color={COLORS.primary}
              />
              <Text style={[TEXT_STYLES.caption, { width: 40, textAlign: 'right' }]}>
                {count}
              </Text>
            </View>
          );
        })}

        <Button
          mode="contained"
          onPress={() => setShowStatsModal(false)}
          style={{ marginTop: SPACING.md, backgroundColor: COLORS.primary }}
        >
          Close
        </Button>
      </Modal>
    </Portal>
  );

  const renderReplyModal = () => (
    <Portal>
      <Modal 
        visible={showReplyModal} 
        onDismiss={() => setShowReplyModal(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          padding: SPACING.lg,
          borderRadius: 12,
          maxHeight: '80%',
        }}
      >
        {selectedReview && (
          <>
            <Text style={[TEXT_STYLES.heading, { marginBottom: SPACING.md }]}>
              💬 Reply to Review
            </Text>

            {/* Original Review */}
            <Card style={{ marginBottom: SPACING.md, backgroundColor: '#F8F8F8' }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                  <Avatar.Image size={32} source={{ uri: selectedReview.clientAvatar }} />
                  <View style={{ marginLeft: SPACING.sm }}>
                    <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                      {selectedReview.clientName}
                    </Text>
                    {renderStars(selectedReview.rating)}
                  </View>
                </View>
                <Text style={TEXT_STYLES.body}>{selectedReview.comment}</Text>
              </Card.Content>
            </Card>

            {/* Reply Input */}
            <Surface style={{
              backgroundColor: 'white',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#E0E0E0',
              minHeight: 120,
              padding: SPACING.sm,
              marginBottom: SPACING.md,
            }}>
              <Text style={[TEXT_STYLES.caption, { color: '#666', marginBottom: SPACING.xs }]}>
                Your reply:
              </Text>
              <TextInput
                multiline
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Thank you for your feedback! I appreciate..."
                style={{
                  flex: 1,
                  fontSize: 16,
                  textAlignVertical: 'top',
                }}
              />
            </Surface>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                onPress={() => setShowReplyModal(false)}
                style={{ flex: 0.45 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={submitReply}
                loading={loading}
                style={{ flex: 0.45, backgroundColor: COLORS.primary }}
              >
                Post Reply
              </Button>
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: 50,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={[TEXT_STYLES.heading, { color: 'white', fontSize: 24 }]}>
              Reviews & Ratings
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'white', opacity: 0.9 }]}>
              ⭐ {reviewStats.averageRating}/5.0 • {reviewStats.totalReviews} reviews
            </Text>
          </View>
          <IconButton
            icon="analytics"
            size={28}
            iconColor="white"
            onPress={() => setShowStatsModal(true)}
          />
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        justifyContent: 'space-between',
      }}>
        <Surface style={{
          padding: SPACING.sm,
          borderRadius: 8,
          alignItems: 'center',
          flex: 1,
          marginRight: SPACING.xs,
          backgroundColor: COLORS.success + '20',
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: COLORS.success }]}>
            {reviewStats.responseRate}%
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>Response Rate</Text>
        </Surface>
        
        <Surface style={{
          padding: SPACING.sm,
          borderRadius: 8,
          alignItems: 'center',
          flex: 1,
          marginHorizontal: SPACING.xs,
          backgroundColor: reviewStats.pendingReplies > 0 ? COLORS.error + '20' : COLORS.success + '20',
        }}>
          <Text style={[TEXT_STYLES.body, { 
            fontWeight: '600', 
            color: reviewStats.pendingReplies > 0 ? COLORS.error : COLORS.success 
          }]}>
            {reviewStats.pendingReplies}
          </Text>
          <Text style={[TEXT_STYLES.caption, { 
            color: reviewStats.pendingReplies > 0 ? COLORS.error : COLORS.success 
          }]}>
            Pending Replies
          </Text>
        </Surface>
        
        <Surface style={{
          padding: SPACING.sm,
          borderRadius: 8,
          alignItems: 'center',
          flex: 1,
          marginLeft: SPACING.xs,
          backgroundColor: COLORS.primary + '20',
        }}>
          <Text style={[TEXT_STYLES.body, { fontWeight: '600', color: COLORS.primary }]}>
            {reviews.filter(r => r.rating >= 4).length}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>4+ Stars</Text>
        </Surface>
      </View>

      {/* Search and Filters */}
      <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }}>
        <Searchbar
          placeholder="Search reviews..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ backgroundColor: 'white', elevation: 2, marginBottom: SPACING.sm }}
          iconColor={COLORS.primary}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: SPACING.lg }}
        >
          {filters.map((filter) => (
            <Chip
              key={filter.key}
              mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
              selected={selectedFilter === filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              style={{
                marginRight: SPACING.sm,
                backgroundColor: selectedFilter === filter.key ? COLORS.primary : 'white',
              }}
              textStyle={{
                color: selectedFilter === filter.key ? 'white' : COLORS.primary,
              }}
            >
              {filter.label} ({filter.count})
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Reviews List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingHorizontal: SPACING.lg,
          paddingBottom: 100 
        }}
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
        {loading && !refreshing ? (
          <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
            <ProgressBar 
              indeterminate 
              style={{ width: '60%' }} 
              color={COLORS.primary}
            />
            <Text style={[TEXT_STYLES.body, { marginTop: SPACING.sm, color: '#666' }]}>
              Loading reviews...
            </Text>
          </View>
        ) : filteredReviews.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
            <Icon name="rate-review" size={60} color="#CCC" />
            <Text style={[TEXT_STYLES.heading, { color: '#999', marginTop: SPACING.md }]}>
              No Reviews Found
            </Text>
            <Text style={[TEXT_STYLES.body, { color: '#666', textAlign: 'center', marginTop: SPACING.sm }]}>
              {searchQuery ? 'Try adjusting your search or filter' : 'Reviews will appear here once clients start rating your services'}
            </Text>
          </View>
        ) : (
          filteredReviews.map(renderReviewCard)
        )}
      </ScrollView>

      {/* Modals */}
      {renderStatsModal()}
      {renderReplyModal()}
    </View>
  );
};

export default ReviewsManagement;
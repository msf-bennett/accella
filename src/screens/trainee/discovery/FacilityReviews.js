import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your design system constants
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
  border: '#e0e0e0',
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
  body: { fontSize: 16 },
  caption: { fontSize: 14 },
  small: { fontSize: 12 },
};

const { width } = Dimensions.get('window');

const FacilityReviews = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, facilities } = useSelector(state => ({
    user: state.auth.user,
    facilities: state.facilities.list,
  }));

  const facilityId = route?.params?.facilityId || 1;
  const facilityName = route?.params?.facilityName || 'Elite Fitness Academy';

  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [facilityStats, setFacilityStats] = useState({
    averageRating: 4.3,
    totalReviews: 127,
    ratingDistribution: [2, 5, 12, 45, 63],
  });

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    loadReviews();
    animateEntrance();
  }, []);

  const animateEntrance = () => {
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
  };

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual API integration
      const mockReviews = [
        {
          id: 1,
          userName: 'Sarah Johnson',
          userAvatar: null,
          rating: 5,
          date: '2024-08-20',
          text: 'Amazing facility with top-notch equipment! The trainers are incredibly knowledgeable and supportive. I\'ve seen great progress in just 3 months. 💪',
          helpful: 24,
          category: 'Equipment',
          verified: true,
        },
        {
          id: 2,
          userName: 'Mike Chen',
          userAvatar: null,
          rating: 4,
          date: '2024-08-15',
          text: 'Great gym with modern facilities. The group classes are fantastic and the atmosphere is motivating. Only downside is it can get crowded during peak hours.',
          helpful: 18,
          category: 'Classes',
          verified: true,
        },
        {
          id: 3,
          userName: 'Emma Davis',
          userAvatar: null,
          rating: 5,
          date: '2024-08-10',
          text: 'Best decision I made! The personal trainers here are exceptional. They created a perfect workout plan for my goals. Clean facilities and friendly staff. ⭐',
          helpful: 31,
          category: 'Trainers',
          verified: true,
        },
        {
          id: 4,
          userName: 'Alex Thompson',
          userAvatar: null,
          rating: 4,
          date: '2024-08-05',
          text: 'Solid gym with good equipment variety. The nutrition guidance they provide is really helpful. Would recommend to anyone serious about fitness.',
          helpful: 15,
          category: 'Nutrition',
          verified: false,
        },
        {
          id: 5,
          userName: 'Lisa Rodriguez',
          userAvatar: null,
          rating: 3,
          date: '2024-07-28',
          text: 'Decent facility but can be quite expensive. The trainers are good but I wish there were more flexible membership options.',
          helpful: 8,
          category: 'Pricing',
          verified: true,
        },
      ];
      
      setReviews(mockReviews);
    } catch (error) {
      Alert.alert('Error', 'Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [facilityId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  }, [loadReviews]);

  const handleWriteReview = () => {
    if (!reviewText.trim() || rating === 0) {
      Alert.alert('Incomplete Review', 'Please provide a rating and write your review.');
      return;
    }

    Alert.alert(
      'Review Submitted! 🎉',
      'Thank you for sharing your experience. Your review will help other trainees make informed decisions.',
      [{ text: 'Great!', onPress: () => {
        setShowWriteReview(false);
        setReviewText('');
        setRating(0);
      }}]
    );
  };

  const renderStars = (rating, size = 16) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name={i < rating ? 'star' : 'star-border'}
        size={size}
        color={i < rating ? '#FFD700' : '#E0E0E0'}
        style={{ marginRight: 2 }}
      />
    ));
  };

  const renderRatingBar = (starCount, total) => {
    const percentage = (starCount / total) * 100;
    return (
      <View style={styles.ratingBarContainer}>
        <Text style={styles.ratingBarLabel}>{5 - starCount + 1}★</Text>
        <View style={styles.ratingBar}>
          <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.ratingBarCount}>{starCount}</Text>
      </View>
    );
  };

  const renderReviewCard = (review) => (
    <Animated.View
      key={review.id}
      style={[
        styles.reviewCardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={styles.reviewCard}>
        <Card.Content>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewUserInfo}>
              <Avatar.Text
                size={40}
                label={review.userName.charAt(0)}
                style={{ backgroundColor: COLORS.primary }}
              />
              <View style={styles.reviewUserDetails}>
                <View style={styles.reviewUserName}>
                  <Text style={styles.userName}>{review.userName}</Text>
                  {review.verified && (
                    <Icon name="verified" size={16} color={COLORS.success} style={{ marginLeft: 4 }} />
                  )}
                </View>
                <View style={styles.reviewRatingRow}>
                  <View style={styles.reviewStars}>
                    {renderStars(review.rating, 14)}
                  </View>
                  <Text style={styles.reviewDate}> • {review.date}</Text>
                </View>
              </View>
            </View>
            <Chip
              mode="outlined"
              compact
              textStyle={styles.categoryChipText}
              style={styles.categoryChip}
            >
              {review.category}
            </Chip>
          </View>

          <Text style={styles.reviewText}>{review.text}</Text>

          <View style={styles.reviewFooter}>
            <TouchableOpacity style={styles.helpfulButton}>
              <Icon name="thumb-up" size={16} color={COLORS.textSecondary} />
              <Text style={styles.helpfulText}>Helpful ({review.helpful})</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="dots-vertical" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderWriteReviewModal = () => (
    <Portal>
      <Modal
        visible={showWriteReview}
        onDismiss={() => setShowWriteReview(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <Surface style={styles.reviewModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowWriteReview(false)}
              />
            </View>

            <Text style={styles.ratingLabel}>Rate this facility</Text>
            <View style={styles.ratingSelector}>
              {Array.from({ length: 5 }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setRating(i + 1)}
                >
                  <Icon
                    name={i < rating ? 'star' : 'star-border'}
                    size={32}
                    color={i < rating ? '#FFD700' : '#E0E0E0'}
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              mode="outlined"
              label="Share your experience..."
              multiline
              numberOfLines={4}
              value={reviewText}
              onChangeText={setReviewText}
              style={styles.reviewInput}
            />

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowWriteReview(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleWriteReview}
                style={styles.submitButton}
                buttonColor={COLORS.primary}
              >
                Submit Review
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>{facilityName}</Text>
          <IconButton
            icon="share"
            iconColor="#fff"
            size={24}
            onPress={() => Alert.alert('Feature Coming Soon', 'Share facility reviews feature will be available soon! 🚀')}
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
        {/* Overall Rating Section */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <View style={styles.overallRating}>
              <View style={styles.ratingNumber}>
                <Text style={styles.averageRating}>{facilityStats.averageRating}</Text>
                <View style={styles.overallStars}>
                  {renderStars(Math.floor(facilityStats.averageRating), 20)}
                </View>
                <Text style={styles.totalReviews}>{facilityStats.totalReviews} reviews</Text>
              </View>
              
              <View style={styles.ratingDistribution}>
                {facilityStats.ratingDistribution.reverse().map((count, index) => 
                  renderRatingBar(count, facilityStats.totalReviews)
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Filter and Sort Section */}
        <Surface style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {['all', 'Equipment', 'Trainers', 'Classes', 'Pricing'].map((filter) => (
                <Chip
                  key={filter}
                  mode={selectedFilter === filter ? 'flat' : 'outlined'}
                  selected={selectedFilter === filter}
                  onPress={() => setSelectedFilter(filter)}
                  style={styles.filterChip}
                  selectedColor={COLORS.primary}
                >
                  {filter === 'all' ? 'All Reviews' : filter}
                </Chip>
              ))}
            </View>
          </ScrollView>
          
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => Alert.alert('Feature Coming Soon', 'Sort options will be available soon! 🔧')}
          >
            <Icon name="sort" size={20} color={COLORS.textSecondary} />
            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        </Surface>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {reviews.map(renderReviewCard)}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Write Review FAB */}
      <FAB
        icon="edit"
        style={styles.fab}
        color="#fff"
        onPress={() => setShowWriteReview(true)}
        customSize={56}
      />

      {renderWriteReviewModal()}
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
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.h3,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    margin: SPACING.md,
    elevation: 4,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    alignItems: 'center',
    marginRight: SPACING.xl,
  },
  averageRating: {
    ...TEXT_STYLES.h1,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  overallStars: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
  },
  totalReviews: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  ratingDistribution: {
    flex: 1,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  ratingBarLabel: {
    ...TEXT_STYLES.small,
    width: 25,
    color: COLORS.textSecondary,
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: SPACING.sm,
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  ratingBarCount: {
    ...TEXT_STYLES.small,
    width: 25,
    textAlign: 'right',
    color: COLORS.textSecondary,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sortText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  reviewsList: {
    paddingHorizontal: SPACING.md,
  },
  reviewCardContainer: {
    marginBottom: SPACING.md,
  },
  reviewCard: {
    elevation: 2,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewUserDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  reviewUserName: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewDate: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  categoryChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  reviewText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpfulText: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  reviewModal: {
    width: width - SPACING.xl,
    maxHeight: '80%',
    borderRadius: 16,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  ratingLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  ratingSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  reviewInput: {
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: SPACING.md,
  },
  submitButton: {
    paddingHorizontal: SPACING.lg,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default FacilityReviews;
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import {
  Card,
  Searchbar,
  Button,
  Chip,
  Avatar,
  Surface,
  IconButton,
  FAB,
  ProgressBar,
  Badge,
  TextInput,
  Portal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const TrainerReviews = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { reviews, loading } = useSelector(state => state.reviews || {});

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    categories: {
      knowledge: 0,
      motivation: 0,
      punctuality: 0,
      communication: 0,
    },
  });

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All Reviews', icon: 'star' },
    { id: 'recent', label: 'Recent', icon: 'access-time' },
    { id: 'highest', label: 'Highest Rated', icon: 'trending-up' },
    { id: 'verified', label: 'Verified Only', icon: 'verified' },
  ];

  // Mock trainer reviews data
  const [reviewsData] = useState([
    {
      id: '1',
      trainerId: 't1',
      trainerName: 'John Smith',
      trainerImage: 'https://via.placeholder.com/100x100',
      trainerSpecialty: 'Personal Trainer',
      gym: 'Iron Paradise Gym',
      reviewerName: 'Sarah Johnson',
      reviewerImage: 'https://via.placeholder.com/50x50',
      rating: 5,
      title: 'Excellent trainer with amazing results!',
      comment: 'John has been my trainer for 6 months and the results are incredible. He\'s knowledgeable, motivating, and always punctual. His workout plans are challenging but achievable.',
      date: '2024-01-15',
      verified: true,
      helpful: 12,
      categories: {
        knowledge: 5,
        motivation: 5,
        punctuality: 5,
        communication: 4,
      },
      tags: ['Weight Loss', 'Strength Training', 'Professional'],
    },
    {
      id: '2',
      trainerId: 't1',
      trainerName: 'John Smith',
      trainerImage: 'https://via.placeholder.com/100x100',
      trainerSpecialty: 'Personal Trainer',
      gym: 'Iron Paradise Gym',
      reviewerName: 'Mike Wilson',
      reviewerImage: 'https://via.placeholder.com/50x50',
      rating: 4,
      title: 'Great trainer but sessions can be intense',
      comment: 'John knows his stuff and pushes you to your limits. Sometimes the workouts are too intense but the results speak for themselves.',
      date: '2024-01-10',
      verified: true,
      helpful: 8,
      categories: {
        knowledge: 5,
        motivation: 4,
        punctuality: 4,
        communication: 4,
      },
      tags: ['Muscle Building', 'Intense Workouts'],
    },
    {
      id: '3',
      trainerId: 't2',
      trainerName: 'Emily Davis',
      trainerImage: 'https://via.placeholder.com/100x100',
      trainerSpecialty: 'Yoga Instructor',
      gym: 'Zen Yoga & Wellness',
      reviewerName: 'Lisa Chen',
      reviewerImage: 'https://via.placeholder.com/50x50',
      rating: 5,
      title: 'Perfect for beginners and stress relief',
      comment: 'Emily creates such a peaceful atmosphere. Her yoga classes are perfect for beginners and she explains everything clearly.',
      date: '2024-01-12',
      verified: false,
      helpful: 15,
      categories: {
        knowledge: 5,
        motivation: 4,
        punctuality: 5,
        communication: 5,
      },
      tags: ['Yoga', 'Beginner Friendly', 'Stress Relief'],
    },
    {
      id: '4',
      trainerId: 't3',
      trainerName: 'David Rodriguez',
      trainerImage: 'https://via.placeholder.com/100x100',
      trainerSpecialty: 'CrossFit Coach',
      gym: 'CrossFit Warriors Box',
      reviewerName: 'Alex Thompson',
      reviewerImage: 'https://via.placeholder.com/50x50',
      rating: 4,
      title: 'Challenging workouts with great community',
      comment: 'David brings great energy to every class. The workouts are tough but he makes sure everyone is included and motivated.',
      date: '2024-01-08',
      verified: true,
      helpful: 6,
      categories: {
        knowledge: 4,
        motivation: 5,
        punctuality: 4,
        communication: 4,
      },
      tags: ['CrossFit', 'Group Training', 'High Energy'],
    },
  ]);

  const [filteredReviews, setFilteredReviews] = useState(reviewsData);

  useEffect(() => {
    filterReviews();
  }, [searchQuery, selectedFilter]);

  const filterReviews = useCallback(() => {
    let filtered = reviewsData;

    if (searchQuery) {
      filtered = filtered.filter(review =>
        review.trainerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.gym.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (selectedFilter) {
      case 'recent':
        filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'highest':
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'verified':
        filtered = filtered.filter(review => review.verified);
        break;
      default:
        break;
    }

    setFilteredReviews(filtered);
  }, [searchQuery, selectedFilter, reviewsData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Reviews updated! ⭐');
    }, 2000);
  }, []);

  const handleWriteReview = (trainer) => {
    setSelectedTrainer(trainer);
    setShowWriteReview(true);
  };

  const handleSubmitReview = () => {
    if (!newReview.title.trim() || !newReview.comment.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Review Submitted',
      'Thank you for your review! It will be published after moderation.',
      [{ text: 'OK', onPress: () => setShowWriteReview(false) }]
    );

    // Reset form
    setNewReview({
      rating: 5,
      title: '',
      comment: '',
      categories: {
        knowledge: 0,
        motivation: 0,
        punctuality: 0,
        communication: 0,
      },
    });
  };

  const handleHelpful = (reviewId) => {
    Alert.alert('Thanks!', 'Your feedback helps others find the best trainers! 👍');
  };

  const renderStars = (rating, size = 16, interactive = false, onPress = null) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && onPress && onPress(star)}
            disabled={!interactive}
          >
            <Icon
              name={star <= rating ? 'star' : 'star-border'}
              size={size}
              color="#FFC107"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCategoryRating = (label, value, onUpdate = null) => {
    const interactive = onUpdate !== null;
    return (
      <View style={styles.categoryRating}>
        <Text style={styles.categoryLabel}>{label}</Text>
        <View style={styles.categoryStars}>
          {renderStars(value, 20, interactive, onUpdate)}
        </View>
      </View>
    );
  };

  const renderFilterChip = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedFilter(item.id)}>
      <Chip
        selected={selectedFilter === item.id}
        onPress={() => setSelectedFilter(item.id)}
        style={[
          styles.filterChip,
          selectedFilter === item.id && styles.selectedFilterChip
        ]}
        textStyle={[
          styles.filterChipText,
          selectedFilter === item.id && styles.selectedFilterChipText
        ]}
        icon={item.icon}
      >
        {item.label}
      </Chip>
    </TouchableOpacity>
  );

  const renderReviewCard = ({ item }) => (
    <Card style={styles.reviewCard}>
      <Card.Content style={styles.reviewContent}>
        {/* Trainer Info */}
        <View style={styles.trainerSection}>
          <Avatar.Image source={{ uri: item.trainerImage }} size={60} />
          <View style={styles.trainerInfo}>
            <View style={styles.trainerNameRow}>
              <Text style={styles.trainerName}>{item.trainerName}</Text>
              {item.verified && (
                <Icon name="verified" size={16} color={COLORS.primary} />
              )}
            </View>
            <Text style={styles.trainerSpecialty}>{item.trainerSpecialty}</Text>
            <Text style={styles.gymName}>{item.gym}</Text>
          </View>
          <Button
            mode="outlined"
            compact
            onPress={() => handleWriteReview(item)}
            style={styles.writeReviewButton}
          >
            Write Review
          </Button>
        </View>

        {/* Review Content */}
        <View style={styles.reviewSection}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewerInfo}>
              <Avatar.Image source={{ uri: item.reviewerImage }} size={32} />
              <View style={styles.reviewerDetails}>
                <Text style={styles.reviewerName}>{item.reviewerName}</Text>
                <Text style={styles.reviewDate}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={styles.ratingSection}>
              {renderStars(item.rating)}
              <Text style={styles.ratingText}>{item.rating}/5</Text>
            </View>
          </View>

          <Text style={styles.reviewTitle}>{item.title}</Text>
          <Text style={styles.reviewComment}>{item.comment}</Text>

          {/* Category Ratings */}
          <View style={styles.categoriesSection}>
            <Text style={styles.categoriesTitle}>Detailed Ratings</Text>
            <View style={styles.categoriesGrid}>
              {renderCategoryRating('Knowledge', item.categories.knowledge)}
              {renderCategoryRating('Motivation', item.categories.motivation)}
              {renderCategoryRating('Punctuality', item.categories.punctuality)}
              {renderCategoryRating('Communication', item.categories.communication)}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsSection}>
            {item.tags.map((tag, index) => (
              <Chip key={index} compact style={styles.tagChip}>
                {tag}
              </Chip>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.reviewActions}>
            <TouchableOpacity
              style={styles.helpfulButton}
              onPress={() => handleHelpful(item.id)}
            >
              <Icon name="thumb-up" size={16} color={COLORS.textSecondary} />
              <Text style={styles.helpfulText}>
                Helpful ({item.helpful})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Icon name="share" size={16} color={COLORS.textSecondary} />
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderWriteReviewModal = () => (
    <Portal>
      <Modal
        visible={showWriteReview}
        onDismiss={() => setShowWriteReview(false)}
        style={styles.modal}
      >
        <Surface style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowWriteReview(false)}
              />
            </View>

            {selectedTrainer && (
              <View style={styles.selectedTrainerInfo}>
                <Avatar.Image source={{ uri: selectedTrainer.trainerImage }} size={50} />
                <View style={styles.selectedTrainerDetails}>
                  <Text style={styles.selectedTrainerName}>
                    {selectedTrainer.trainerName}
                  </Text>
                  <Text style={styles.selectedTrainerSpecialty}>
                    {selectedTrainer.trainerSpecialty}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Overall Rating *</Text>
              {renderStars(newReview.rating, 32, true, (rating) =>
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </View>

            <View style={styles.categoryRatingsSection}>
              <Text style={styles.categoryRatingsTitle}>Rate Specific Areas</Text>
              {renderCategoryRating('Knowledge', newReview.categories.knowledge, (rating) =>
                setNewReview(prev => ({
                  ...prev,
                  categories: { ...prev.categories, knowledge: rating }
                }))
              )}
              {renderCategoryRating('Motivation', newReview.categories.motivation, (rating) =>
                setNewReview(prev => ({
                  ...prev,
                  categories: { ...prev.categories, motivation: rating }
                }))
              )}
              {renderCategoryRating('Punctuality', newReview.categories.punctuality, (rating) =>
                setNewReview(prev => ({
                  ...prev,
                  categories: { ...prev.categories, punctuality: rating }
                }))
              )}
              {renderCategoryRating('Communication', newReview.categories.communication, (rating) =>
                setNewReview(prev => ({
                  ...prev,
                  categories: { ...prev.categories, communication: rating }
                }))
              )}
            </View>

            <TextInput
              label="Review Title *"
              value={newReview.title}
              onChangeText={(text) => setNewReview(prev => ({ ...prev, title: text }))}
              style={styles.titleInput}
              mode="outlined"
              placeholder="Summarize your experience..."
            />

            <TextInput
              label="Your Review *"
              value={newReview.comment}
              onChangeText={(text) => setNewReview(prev => ({ ...prev, comment: text }))}
              style={styles.commentInput}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Share your detailed experience with this trainer..."
            />

            <Button
              mode="contained"
              onPress={handleSubmitReview}
              style={styles.submitButton}
            >
              Submit Review
            </Button>
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="rate-review" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Reviews Found</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to review a trainer and help others make informed decisions!
      </Text>
      <Button
        mode="outlined"
        onPress={() => setSearchQuery('')}
        style={styles.clearSearchButton}
      >
        Clear Search
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Trainer Reviews</Text>
        <Text style={styles.headerSubtitle}>
          Find the perfect trainer through real experiences ⭐
        </Text>
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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search trainers, gyms, or reviews..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            icon="search"
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersContainer}>
          <FlatList
            data={filterOptions}
            renderItem={renderFilterChip}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
          />
        </View>

        {/* Stats Summary */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Review Statistics 📊</Text>
          <View style={styles.statsGrid}>
            <Surface style={styles.statCard} elevation={2}>
              <Text style={styles.statNumber}>{filteredReviews.length}</Text>
              <Text style={styles.statLabel}>Total Reviews</Text>
            </Surface>
            <Surface style={styles.statCard} elevation={2}>
              <Text style={styles.statNumber}>
                {(filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length || 0).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </Surface>
            <Surface style={styles.statCard} elevation={2}>
              <Text style={styles.statNumber}>
                {filteredReviews.filter(r => r.verified).length}
              </Text>
              <Text style={styles.statLabel}>Verified</Text>
            </Surface>
          </View>
        </View>

        {/* Reviews List */}
        {filteredReviews.length > 0 ? (
          <FlatList
            data={filteredReviews}
            renderItem={renderReviewCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.reviewsList}
          />
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      {/* Write Review Modal */}
      {renderWriteReviewModal()}

      {/* Floating Action Button */}
      <FAB
        icon="edit"
        style={styles.fab}
        onPress={() => setShowWriteReview(true)}
        label="Write Review"
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  filtersContainer: {
    paddingBottom: SPACING.md,
  },
  filtersList: {
    paddingHorizontal: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: '#FFFFFF',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textPrimary,
  },
  selectedFilterChipText: {
    color: '#FFFFFF',
  },
  statsSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    minWidth: (width - SPACING.md * 4) / 3,
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  reviewsList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  reviewCard: {
    marginBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },
  reviewContent: {
    padding: SPACING.md,
  },
  trainerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  trainerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  trainerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainerName: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },
  trainerSpecialty: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  gymName: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  writeReviewButton: {
    borderColor: COLORS.primary,
  },
  reviewSection: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerDetails: {
    marginLeft: SPACING.sm,
  },
  reviewerName: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  reviewDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  ratingSection: {
    alignItems: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reviewTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  reviewComment: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  categoriesSection: {
    marginBottom: SPACING.md,
  },
  categoriesTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryRating: {
    width: '48%',
    marginBottom: SPACING.sm,
  },
  categoryLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  categoryStars: {
    alignItems: 'flex-start',
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tagChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.success + '20',
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpfulText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.md,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  clearSearchButton: {
    borderColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    margin: SPACING.md,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '90%',
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
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
  },
  selectedTrainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.md,
  },
  selectedTrainerDetails: {
    marginLeft: SPACING.sm,
  },
  selectedTrainerName: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
  },
  selectedTrainerSpecialty: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  ratingLabel: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.md,
  },
  categoryRatingsSection: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  categoryRatingsTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  titleInput: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  commentInput: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  submitButton: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
});

export default TrainerReviews;
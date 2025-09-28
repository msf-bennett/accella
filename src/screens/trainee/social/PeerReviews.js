import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  Modal,
  TextInput,
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
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const PeerReviews = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { peers, reviews } = useSelector(state => state.social);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('received'); // received, given, write
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('recent'); // recent, rating, helpful

  // Sample data (replace with real data from Redux store)
  const [receivedReviews, setReceivedReviews] = useState([
    {
      id: '1',
      reviewer: {
        id: 'u1',
        name: 'Sarah Johnson',
        avatar: 'https://via.placeholder.com/50',
        level: 'Advanced',
        sport: 'CrossFit'
      },
      rating: 5,
      categories: ['Motivation', 'Technique', 'Consistency'],
      comment: 'Amazing workout partner! Always pushes me to do better and has great form tips. 💪',
      timestamp: '2024-08-25T10:30:00Z',
      helpful: 12,
      isHelpful: false,
      workoutSession: 'HIIT Cardio Blast'
    },
    {
      id: '2',
      reviewer: {
        id: 'u2',
        name: 'Mike Chen',
        avatar: 'https://via.placeholder.com/50',
        level: 'Intermediate',
        sport: 'Weightlifting'
      },
      rating: 4,
      categories: ['Spotting', 'Knowledge'],
      comment: 'Great spotter and knows a lot about proper lifting techniques. Would train with again!',
      timestamp: '2024-08-23T14:15:00Z',
      helpful: 8,
      isHelpful: true,
      workoutSession: 'Strength Training'
    }
  ]);

  const [givenReviews, setGivenReviews] = useState([
    {
      id: '3',
      reviewee: {
        id: 'u3',
        name: 'Alex Rodriguez',
        avatar: 'https://via.placeholder.com/50',
        level: 'Beginner',
        sport: 'Running'
      },
      rating: 5,
      categories: ['Dedication', 'Improvement'],
      comment: 'Super dedicated and shows consistent improvement every session! 🏃‍♂️',
      timestamp: '2024-08-24T16:45:00Z',
      workoutSession: 'Morning Run Club'
    }
  ]);

  const [availablePeers, setAvailablePeers] = useState([
    {
      id: 'u4',
      name: 'Emma Davis',
      avatar: 'https://via.placeholder.com/50',
      level: 'Intermediate',
      sport: 'Yoga',
      lastWorkout: '2024-08-26T09:00:00Z',
      mutualWorkouts: 5,
      averageRating: 4.8,
      badges: ['Consistency King', 'Motivation Master']
    },
    {
      id: 'u5',
      name: 'James Wilson',
      avatar: 'https://via.placeholder.com/50',
      level: 'Advanced',
      sport: 'Swimming',
      lastWorkout: '2024-08-26T07:30:00Z',
      mutualWorkouts: 3,
      averageRating: 4.6,
      badges: ['Technique Expert']
    }
  ]);

  const reviewCategories = [
    'Motivation', 'Technique', 'Consistency', 'Spotting', 
    'Knowledge', 'Dedication', 'Improvement', 'Energy', 
    'Punctuality', 'Equipment Sharing'
  ];

  // Component mount animation
  useEffect(() => {
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
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  // Tab switch handler
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Review submission
  const handleSubmitReview = () => {
    if (!selectedPeer || !reviewText.trim() || reviewRating === 0) {
      Alert.alert('Incomplete Review', 'Please fill in all required fields.');
      return;
    }

    const newReview = {
      id: Date.now().toString(),
      reviewee: selectedPeer,
      rating: reviewRating,
      categories: selectedCategories,
      comment: reviewText,
      timestamp: new Date().toISOString(),
      workoutSession: 'Recent Session'
    };

    setGivenReviews(prev => [newReview, ...prev]);
    setReviewModalVisible(false);
    setSelectedPeer(null);
    setReviewText('');
    setReviewRating(0);
    setSelectedCategories([]);
    
    Vibration.vibrate(100);
    Alert.alert('Review Submitted! 🎉', 'Your peer review has been posted.');
  };

  // Toggle helpful vote
  const toggleHelpful = (reviewId) => {
    setReceivedReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            isHelpful: !review.isHelpful,
            helpful: review.isHelpful ? review.helpful - 1 : review.helpful + 1
          }
        : review
    ));
    Vibration.vibrate(50);
  };

  // Star rating component
  const StarRating = ({ rating, onRate, interactive = false, size = 20 }) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && onRate(star)}
            disabled={!interactive}
          >
            <Icon
              name={star <= rating ? 'star' : 'star-border'}
              size={size}
              color={star <= rating ? '#FFD700' : '#E0E0E0'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Review card component
  const ReviewCard = ({ review, type = 'received' }) => (
    <Card style={styles.reviewCard}>
      <Card.Content>
        <View style={styles.reviewHeader}>
          <Avatar.Image 
            size={50} 
            source={{ uri: (type === 'received' ? review.reviewer : review.reviewee)?.avatar }} 
          />
          <View style={styles.reviewerInfo}>
            <Text style={styles.reviewerName}>
              {type === 'received' ? review.reviewer?.name : review.reviewee?.name}
            </Text>
            <Text style={styles.reviewerLevel}>
              {type === 'received' ? review.reviewer?.level : review.reviewee?.level} • {type === 'received' ? review.reviewer?.sport : review.reviewee?.sport}
            </Text>
            <StarRating rating={review.rating} />
          </View>
          <View style={styles.reviewMeta}>
            <Text style={styles.reviewDate}>
              {new Date(review.timestamp).toLocaleDateString()}
            </Text>
            {review.workoutSession && (
              <Chip style={styles.sessionChip} textStyle={styles.sessionChipText}>
                {review.workoutSession}
              </Chip>
            )}
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          {review.categories.map((category, index) => (
            <Chip
              key={index}
              style={styles.categoryChip}
              textStyle={styles.categoryChipText}
              icon="check-circle"
            >
              {category}
            </Chip>
          ))}
        </View>

        <Text style={styles.reviewComment}>{review.comment}</Text>

        {type === 'received' && (
          <View style={styles.reviewActions}>
            <TouchableOpacity
              style={[styles.helpfulButton, review.isHelpful && styles.helpfulButtonActive]}
              onPress={() => toggleHelpful(review.id)}
            >
              <Icon
                name={review.isHelpful ? 'thumb-up' : 'thumb-up-off-alt'}
                size={16}
                color={review.isHelpful ? COLORS.primary : '#666'}
              />
              <Text style={[styles.helpfulText, review.isHelpful && styles.helpfulTextActive]}>
                Helpful ({review.helpful})
              </Text>
            </TouchableOpacity>
            <IconButton
              icon="share"
              size={20}
              onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Share functionality will be available in the next update.')}
            />
          </View>
        )}
      </Card.Content>
    </Card>
  );

  // Available peer card component
  const PeerCard = ({ peer }) => (
    <Card style={styles.peerCard}>
      <Card.Content>
        <View style={styles.peerHeader}>
          <Avatar.Image size={60} source={{ uri: peer.avatar }} />
          <View style={styles.peerInfo}>
            <Text style={styles.peerName}>{peer.name}</Text>
            <Text style={styles.peerLevel}>{peer.level} • {peer.sport}</Text>
            <StarRating rating={Math.floor(peer.averageRating)} />
            <Text style={styles.peerRating}>{peer.averageRating}/5.0</Text>
          </View>
          <Button
            mode="contained"
            onPress={() => {
              setSelectedPeer(peer);
              setReviewModalVisible(true);
            }}
            style={styles.reviewButton}
          >
            Review
          </Button>
        </View>
        
        <View style={styles.peerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{peer.mutualWorkouts}</Text>
            <Text style={styles.statLabel}>Mutual Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Math.floor((Date.now() - new Date(peer.lastWorkout)) / (1000 * 60 * 60 * 24))}d
            </Text>
            <Text style={styles.statLabel}>Last Workout</Text>
          </View>
        </View>

        <View style={styles.badgesContainer}>
          {peer.badges.map((badge, index) => (
            <Chip
              key={index}
              style={styles.badgeChip}
              textStyle={styles.badgeChipText}
              icon="jump-rope"
            >
              {badge}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  // Header component
  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Peer Reviews 🤝</Text>
        <Text style={styles.headerSubtitle}>Share feedback and build community</Text>
      </View>
      <Surface style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{receivedReviews.length}</Text>
          <Text style={styles.statLabel}>Received</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{givenReviews.length}</Text>
          <Text style={styles.statLabel}>Given</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {receivedReviews.length > 0 
              ? (receivedReviews.reduce((sum, r) => sum + r.rating, 0) / receivedReviews.length).toFixed(1)
              : '0.0'
            }
          </Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </Surface>
    </LinearGradient>
  );

  // Tab bar component
  const renderTabBar = () => (
    <Surface style={styles.tabBar}>
      {[
        { key: 'received', label: 'Received', icon: 'inbox' },
        { key: 'given', label: 'Given', icon: 'send' },
        { key: 'write', label: 'Write New', icon: 'edit' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => handleTabSwitch(tab.key)}
        >
          <Icon
            name={tab.icon}
            size={20}
            color={activeTab === tab.key ? COLORS.primary : '#666'}
          />
          <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Surface>
  );

  // Content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'received':
        return (
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews About You 📝</Text>
              <IconButton
                icon="filter-list"
                size={24}
                onPress={() => setFilterModalVisible(true)}
              />
            </View>
            {receivedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} type="received" />
            ))}
            {receivedReviews.length === 0 && (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Icon name="rate-review" size={64} color="#E0E0E0" />
                  <Text style={styles.emptyTitle}>No Reviews Yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Complete more workouts with peers to receive feedback!
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        );

      case 'given':
        return (
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Reviews 👍</Text>
            </View>
            {givenReviews.map((review) => (
              <ReviewCard key={review.id} review={review} type="given" />
            ))}
            {givenReviews.length === 0 && (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Icon name="rate-review" size={64} color="#E0E0E0" />
                  <Text style={styles.emptyTitle}>No Reviews Given</Text>
                  <Text style={styles.emptySubtitle}>
                    Share your experience with workout partners!
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        );

      case 'write':
        return (
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Review a Peer 🌟</Text>
              <Searchbar
                placeholder="Search workout partners..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                inputStyle={styles.searchInput}
              />
            </View>
            <FlatList
              data={availablePeers.filter(peer => 
                peer.name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              renderItem={({ item }) => <PeerCard peer={item} />}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {renderHeader()}
        {renderTabBar()}
        
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
          {renderContent()}
        </ScrollView>

        {/* Review Modal */}
        <Portal>
          <Modal
            visible={reviewModalVisible}
            onDismiss={() => setReviewModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
              <Card style={styles.reviewModal}>
                <Card.Content>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Review {selectedPeer?.name}</Text>
                    <IconButton
                      icon="close"
                      size={24}
                      onPress={() => setReviewModalVisible(false)}
                    />
                  </View>

                  <View style={styles.ratingSection}>
                    <Text style={styles.ratingLabel}>Overall Rating</Text>
                    <StarRating
                      rating={reviewRating}
                      onRate={setReviewRating}
                      interactive={true}
                      size={32}
                    />
                  </View>

                  <View style={styles.categoriesSection}>
                    <Text style={styles.categoriesLabel}>What stood out?</Text>
                    <View style={styles.categoriesGrid}>
                      {reviewCategories.map((category) => (
                        <TouchableOpacity
                          key={category}
                          onPress={() => {
                            if (selectedCategories.includes(category)) {
                              setSelectedCategories(prev => prev.filter(c => c !== category));
                            } else {
                              setSelectedCategories(prev => [...prev, category]);
                            }
                          }}
                        >
                          <Chip
                            style={[
                              styles.selectableCategory,
                              selectedCategories.includes(category) && styles.selectedCategory
                            ]}
                            textStyle={[
                              styles.selectableCategoryText,
                              selectedCategories.includes(category) && styles.selectedCategoryText
                            ]}
                            selected={selectedCategories.includes(category)}
                          >
                            {category}
                          </Chip>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.commentSection}>
                    <Text style={styles.commentLabel}>Your Review</Text>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Share your experience working out with this person..."
                      value={reviewText}
                      onChangeText={setReviewText}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>

                  <View style={styles.modalActions}>
                    <Button
                      mode="outlined"
                      onPress={() => setReviewModalVisible(false)}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleSubmitReview}
                      style={styles.submitButton}
                      disabled={!reviewText.trim() || reviewRating === 0}
                    >
                      Submit Review
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </BlurView>
          </Modal>
        </Portal>
      </Animated.View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 12,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  activeTab: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
  },
  tabLabel: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    color: '#666',
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  searchBar: {
    flex: 1,
    marginLeft: SPACING.md,
    height: 40,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  reviewCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  reviewerName: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
  },
  reviewerLevel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginBottom: SPACING.xs,
  },
  reviewMeta: {
    alignItems: 'flex-end',
  },
  reviewDate: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  sessionChip: {
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  sessionChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  categoryChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
  },
  reviewComment: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  helpfulButtonActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  helpfulText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: '#666',
  },
  helpfulTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  peerCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  peerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  peerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  peerName: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
  },
  peerLevel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginBottom: SPACING.xs,
  },
  peerRating: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: SPACING.xs,
  },
  reviewButton: {
    borderRadius: 8,
  },
  peerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  badgeChipText: {
    ...TEXT_STYLES.caption,
    color: '#FFA000',
  },
  emptyCard: {
    marginTop: SPACING.xl,
    borderRadius: 12,
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: '#999',
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: '#666',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  reviewModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  ratingLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  categoriesSection: {
    marginBottom: SPACING.lg,
  },
  categoriesLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectableCategory: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: '#F5F5F5',
  },
  selectedCategory: {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
  },
  selectableCategoryText: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  selectedCategoryText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  commentSection: {
    marginBottom: SPACING.lg,
  },
  commentLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: SPACING.md,
    minHeight: 100,
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
};

export default PeerReviews;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Text,
  Share,
  Vibration,
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
  Badge,
  Portal,
  Modal,
  Divider,
  ProgressBar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../styles/designSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CoachRatings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, coachStats } = useSelector(state => ({
    user: state.auth.user,
    coachStats: state.coach.stats || {},
  }));

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Mock coach rating data
  const [coachProfile] = useState({
    overallRating: 4.8,
    totalReviews: 247,
    monthlyGrowth: 12.5,
    topSkills: ['Motivation', 'Technique', 'Communication'],
    achievements: ['Top Rated Coach 2024', '5-Star Excellence', 'Most Improved Athletes'],
    ratingBreakdown: {
      5: 189,
      4: 42,
      3: 12,
      2: 3,
      1: 1,
    }
  });

  const [mockReviews] = useState([
    {
      id: '1',
      playerName: 'Marcus Johnson',
      playerAvatar: 'https://i.pravatar.cc/100?img=1',
      rating: 5,
      comment: 'Incredible coach! Marcus helped me improve my game tremendously. His personalized training approach and motivational support made all the difference. I went from bench player to team captain! 🏆',
      sport: 'Football',
      date: '2024-08-15',
      verified: true,
      helpful: 24,
      categories: {
        technique: 5,
        motivation: 5,
        communication: 5,
        punctuality: 4,
      },
      parentReview: false,
    },
    {
      id: '2',
      playerName: 'Sarah Williams',
      playerAvatar: 'https://i.pravatar.cc/100?img=2',
      rating: 5,
      comment: 'Amazing experience! The training sessions are well-structured and Coach really knows how to push you to your limits while keeping it fun. Highly recommended! 💪',
      sport: 'Basketball',
      date: '2024-08-12',
      verified: true,
      helpful: 18,
      categories: {
        technique: 5,
        motivation: 5,
        communication: 4,
        punctuality: 5,
      },
      parentReview: false,
    },
    {
      id: '3',
      playerName: 'Jennifer Park (Parent)',
      playerAvatar: 'https://i.pravatar.cc/100?img=3',
      rating: 4,
      comment: 'Great coach for my daughter Emma. She\'s shown significant improvement in her tennis skills and confidence. Coach is professional and communicates well with parents about progress.',
      sport: 'Tennis',
      date: '2024-08-10',
      verified: true,
      helpful: 15,
      categories: {
        technique: 4,
        motivation: 5,
        communication: 5,
        punctuality: 4,
      },
      parentReview: true,
      childName: 'Emma Park',
    },
    {
      id: '4',
      playerName: 'David Rodriguez',
      playerAvatar: 'https://i.pravatar.cc/100?img=4',
      rating: 5,
      comment: 'Outstanding coaching! The attention to detail and personalized feedback helped me reach my goals faster than I expected. Worth every penny! ⭐',
      sport: 'Soccer',
      date: '2024-08-08',
      verified: true,
      helpful: 31,
      categories: {
        technique: 5,
        motivation: 4,
        communication: 5,
        punctuality: 5,
      },
      parentReview: false,
    },
    {
      id: '5',
      playerName: 'Lisa Chen',
      playerAvatar: 'https://i.pravatar.cc/100?img=5',
      rating: 4,
      comment: 'Really good coach with solid fundamentals. Sometimes sessions run a bit over time, but the quality of training is excellent. Definitely seeing improvements!',
      sport: 'Volleyball',
      date: '2024-08-05',
      verified: true,
      helpful: 9,
      categories: {
        technique: 5,
        motivation: 4,
        communication: 4,
        punctuality: 3,
      },
      parentReview: false,
    },
  ]);

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All Reviews', icon: 'star', count: mockReviews.length },
    { key: '5star', label: '5 Stars', icon: 'star', count: mockReviews.filter(r => r.rating === 5).length },
    { key: '4star', label: '4 Stars', icon: 'star-half', count: mockReviews.filter(r => r.rating === 4).length },
    { key: 'parents', label: 'Parents', icon: 'family-restroom', count: mockReviews.filter(r => r.parentReview).length },
    { key: 'recent', label: 'Recent', icon: 'schedule', count: mockReviews.filter(r => new Date(r.date) > new Date(Date.now() - 7*24*60*60*1000)).length },
  ];

  // Animation effects
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(refreshRatings());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh ratings');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter and sort reviews
  const filteredReviews = mockReviews.filter(review => {
    const matchesSearch = review.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    switch (activeFilter) {
      case '5star':
        matchesFilter = review.rating === 5;
        break;
      case '4star':
        matchesFilter = review.rating === 4;
        break;
      case 'parents':
        matchesFilter = review.parentReview;
        break;
      case 'recent':
        matchesFilter = new Date(review.date) > new Date(Date.now() - 7*24*60*60*1000);
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date) - new Date(a.date);
      case 'oldest':
        return new Date(a.date) - new Date(b.date);
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      default:
        return 0;
    }
  });

  // Handle review press
  const handleReviewPress = (review) => {
    setSelectedReview(review);
    setModalVisible(true);
    Vibration.vibrate(50);
  };

  // Share profile
  const shareProfile = async () => {
    try {
      const result = await Share.share({
        message: `Check out my coaching profile! ⭐ ${coachProfile.overallRating}/5.0 rating with ${coachProfile.totalReviews} reviews. Let's train together! 💪`,
        url: 'https://coachapp.com/profile/coach123',
        title: 'My Coaching Profile',
      });
      
      if (result.action === Share.sharedAction) {
        Vibration.vibrate(100);
        Alert.alert('Success', 'Profile shared successfully! 📤');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share profile');
    }
  };

  // Render star rating
  const renderStarRating = (rating, size = 16) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? 'star' : star - 0.5 <= rating ? 'star-half' : 'star-border'}
            size={size}
            color={COLORS.warning}
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  // Render rating breakdown
  const renderRatingBreakdown = () => (
    <Card style={{ margin: SPACING.md, elevation: 3 }}>
      <Card.Content style={{ padding: SPACING.lg }}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, textAlign: 'center' }]}>
          Rating Breakdown
        </Text>
        
        {Object.entries(coachProfile.ratingBreakdown).reverse().map(([stars, count]) => (
          <View key={stars} style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: SPACING.sm 
          }}>
            <Text style={[TEXT_STYLES.body2, { width: 20 }]}>{stars}</Text>
            <Icon name="star" size={16} color={COLORS.warning} style={{ marginHorizontal: SPACING.xs }} />
            <ProgressBar
              progress={count / coachProfile.totalReviews}
              color={COLORS.primary}
              style={{ flex: 1, height: 8, marginHorizontal: SPACING.sm }}
            />
            <Text style={[TEXT_STYLES.body2, { width: 30, textAlign: 'right' }]}>{count}</Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  // Render stats cards
  const renderStatsCards = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      style={{ marginBottom: SPACING.md }}
    >
      {/* Overall Rating */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Card style={{ 
          width: 160, 
          marginRight: SPACING.md, 
          elevation: 4,
          backgroundColor: COLORS.primary + '10',
        }}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primary + 'DD']}
            style={{ borderRadius: 8 }}
          >
            <Card.Content style={{ padding: SPACING.lg, alignItems: 'center' }}>
              <Icon name="star" size={32} color="white" />
              <Text style={[TEXT_STYLES.h1, { color: 'white', fontWeight: 'bold', marginTop: SPACING.sm }]}>
                {coachProfile.overallRating}
              </Text>
              <Text style={[TEXT_STYLES.body2, { color: 'rgba(255,255,255,0.9)' }]}>
                Overall Rating
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.7)' }]}>
                {coachProfile.totalReviews} reviews
              </Text>
            </Card.Content>
          </LinearGradient>
        </Card>
      </Animated.View>

      {/* Total Reviews */}
      <Card style={{ 
        width: 160, 
        marginRight: SPACING.md, 
        elevation: 4,
        backgroundColor: COLORS.success + '10',
      }}>
        <Card.Content style={{ padding: SPACING.lg, alignItems: 'center' }}>
          <Icon name="reviews" size={32} color={COLORS.success} />
          <Text style={[TEXT_STYLES.h1, { color: COLORS.success, fontWeight: 'bold', marginTop: SPACING.sm }]}>
            {coachProfile.totalReviews}
          </Text>
          <Text style={[TEXT_STYLES.body2, { color: COLORS.textPrimary }]}>
            Total Reviews
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs }}>
            <Icon name="trending-up" size={14} color={COLORS.success} />
            <Text style={[TEXT_STYLES.caption, { color: COLORS.success, marginLeft: 4 }]}>
              +{coachProfile.monthlyGrowth}% this month
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Top Skills */}
      <Card style={{ 
        width: 200, 
        marginRight: SPACING.md, 
        elevation: 4,
      }}>
        <Card.Content style={{ padding: SPACING.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
            <Icon name="jump-rope" size={24} color={COLORS.warning} />
            <Text style={[TEXT_STYLES.subtitle, { marginLeft: SPACING.sm, fontWeight: 'bold' }]}>
              Top Skills
            </Text>
          </View>
          {coachProfile.topSkills.map((skill, index) => (
            <Chip
              key={index}
              mode="outlined"
              compact
              style={{ 
                marginBottom: SPACING.xs,
                backgroundColor: COLORS.primary + '10',
                borderColor: COLORS.primary,
              }}
              textStyle={{ color: COLORS.primary, fontWeight: '500' }}
            >
              {skill}
            </Chip>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  // Render review item
  const renderReviewItem = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{
          translateY: slideAnim.interpolate({
            inputRange: [0, 50],
            outputRange: [0, index * 5],
          })
        }],
      }}
    >
      <TouchableOpacity
        onPress={() => handleReviewPress(item)}
        activeOpacity={0.7}
        style={{ marginBottom: SPACING.md }}
      >
        <Card style={{
          marginHorizontal: SPACING.md,
          elevation: 3,
          backgroundColor: item.rating === 5 ? COLORS.success + '05' : COLORS.background,
          borderLeftWidth: item.rating === 5 ? 4 : 0,
          borderLeftColor: COLORS.success,
        }}>
          <Card.Content style={{ padding: SPACING.lg }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
              <Avatar.Image
                size={45}
                source={{ uri: item.playerAvatar }}
                style={{ backgroundColor: COLORS.primary }}
              />
              
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[TEXT_STYLES.subtitle, { fontWeight: 'bold' }]}>
                    {item.playerName}
                  </Text>
                  {item.verified && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="verified" size={16} color={COLORS.primary} />
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginLeft: 4 }]}>
                        Verified
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  {renderStarRating(item.rating, 14)}
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.sm, color: COLORS.textSecondary }]}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Tags */}
            <View style={{ flexDirection: 'row', marginBottom: SPACING.md, flexWrap: 'wrap' }}>
              <Chip
                mode="outlined"
                compact
                icon="sports"
                style={{ marginRight: SPACING.sm, marginBottom: SPACING.xs }}
                textStyle={{ fontSize: 11 }}
              >
                {item.sport}
              </Chip>
              {item.parentReview && (
                <Chip
                  mode="outlined"
                  compact
                  icon="family-restroom"
                  style={{ marginRight: SPACING.sm, marginBottom: SPACING.xs }}
                  textStyle={{ fontSize: 11, color: COLORS.secondary }}
                >
                  Parent Review
                </Chip>
              )}
              {item.childName && (
                <Chip
                  mode="outlined"
                  compact
                  icon="child-care"
                  style={{ marginRight: SPACING.sm, marginBottom: SPACING.xs }}
                  textStyle={{ fontSize: 11 }}
                >
                  for {item.childName}
                </Chip>
              )}
            </View>

            {/* Comment */}
            <Text 
              style={[TEXT_STYLES.body2, { lineHeight: 22, marginBottom: SPACING.md }]}
              numberOfLines={3}
            >
              {item.comment}
            </Text>

            {/* Footer */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconButton
                  icon="thumb-up-outline"
                  size={18}
                  iconColor={COLORS.textSecondary}
                />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {item.helpful} helpful
                </Text>
              </View>
              
              <IconButton
                icon="chevron-right"
                size={20}
                iconColor={COLORS.textSecondary}
              />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render filter chips
  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}
    >
      {filterOptions.map((filter) => (
        <Chip
          key={filter.key}
          mode={activeFilter === filter.key ? 'flat' : 'outlined'}
          selected={activeFilter === filter.key}
          onPress={() => setActiveFilter(filter.key)}
          icon={filter.icon}
          style={{ 
            marginRight: SPACING.sm,
            backgroundColor: activeFilter === filter.key ? COLORS.primary : 'transparent',
          }}
          textStyle={{
            color: activeFilter === filter.key ? 'white' : COLORS.textPrimary,
            fontWeight: activeFilter === filter.key ? 'bold' : 'normal',
          }}
        >
          {filter.label} ({filter.count})
        </Chip>
      ))}
    </ScrollView>
  );

  // Review detail modal
  const renderReviewModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          borderRadius: 12,
          maxHeight: screenHeight * 0.8,
        }}
      >
        {selectedReview && (
          <ScrollView style={{ padding: SPACING.lg }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Text style={TEXT_STYLES.h3}>Review Details</Text>
              <IconButton
                icon="close"
                onPress={() => setModalVisible(false)}
              />
            </View>

            {/* Reviewer info */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Avatar.Image
                size={60}
                source={{ uri: selectedReview.playerAvatar }}
                style={{ backgroundColor: COLORS.primary }}
              />
              <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                <Text style={[TEXT_STYLES.h4, { fontWeight: 'bold' }]}>
                  {selectedReview.playerName}
                </Text>
                <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary }]}>
                  {selectedReview.sport} • {new Date(selectedReview.date).toLocaleDateString()}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs }}>
                  {renderStarRating(selectedReview.rating, 18)}
                  <Text style={[TEXT_STYLES.subtitle, { marginLeft: SPACING.sm, fontWeight: 'bold' }]}>
                    {selectedReview.rating}.0
                  </Text>
                </View>
              </View>
            </View>

            {/* Category ratings */}
            <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.md, fontWeight: 'bold' }]}>
              Category Ratings:
            </Text>
            {Object.entries(selectedReview.categories).map(([category, rating]) => (
              <View key={category} style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: SPACING.sm 
              }}>
                <Text style={[TEXT_STYLES.body2, { textTransform: 'capitalize' }]}>
                  {category}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {renderStarRating(rating, 14)}
                  <Text style={[TEXT_STYLES.body2, { marginLeft: SPACING.xs, width: 30 }]}>
                    {rating}.0
                  </Text>
                </View>
              </View>
            ))}

            <Divider style={{ marginVertical: SPACING.lg }} />

            {/* Comment */}
            <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.md, fontWeight: 'bold' }]}>
              Review:
            </Text>
            <Text style={[TEXT_STYLES.body2, { lineHeight: 24, marginBottom: SPACING.lg }]}>
              {selectedReview.comment}
            </Text>

            {/* Actions */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                icon="reply"
                onPress={() => {
                  setModalVisible(false);
                  Alert.alert('Reply', 'Reply to review feature coming soon! 💬');
                }}
                style={{ flex: 1, marginRight: SPACING.sm }}
              >
                Reply
              </Button>
              <Button
                mode="outlined"
                icon="share"
                onPress={() => {
                  setModalVisible(false);
                  Alert.alert('Share', 'Share review feature coming soon! 📤');
                }}
                style={{ flex: 1, marginLeft: SPACING.sm }}
              >
                Share
              </Button>
            </View>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.lg,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[TEXT_STYLES.h2, { color: 'white', fontWeight: 'bold' }]}>
              My Ratings ⭐
            </Text>
            <Text style={[TEXT_STYLES.body2, { color: 'rgba(255,255,255,0.8)' }]}>
              Your coaching reputation
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon="share"
              iconColor="white"
              size={28}
              onPress={shareProfile}
            />
            <IconButton
              icon="analytics"
              iconColor="white"
              size={28}
              onPress={() => Alert.alert('Analytics', 'Detailed analytics coming soon! 📊')}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Stats cards */}
      {renderStatsCards()}

      {/* Rating breakdown */}
      {renderRatingBreakdown()}

      {/* Search and sort */}
      <View style={{ margin: SPACING.md }}>
        <Surface style={{ borderRadius: 12, elevation: 2, marginBottom: SPACING.md }}>
          <Searchbar
            placeholder="Search reviews..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ backgroundColor: 'white' }}
            iconColor={COLORS.primary}
          />
        </Surface>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: SPACING.sm }}
        >
          {['newest', 'oldest', 'highest', 'lowest', 'helpful'].map((sort) => (
            <Chip
              key={sort}
              mode={sortBy === sort ? 'flat' : 'outlined'}
              selected={sortBy === sort}
              onPress={() => setSortBy(sort)}
              style={{ 
                marginRight: SPACING.sm,
                backgroundColor: sortBy === sort ? COLORS.secondary : 'transparent',
              }}
              textStyle={{
                color: sortBy === sort ? 'white' : COLORS.textPrimary,
                textTransform: 'capitalize',
              }}
            >
              {sort}
            </Chip>
          ))}
        </ScrollView>
      </div>

      {/* Filter chips */}
      {renderFilterChips()}

      {/* Reviews list */}
      <FlatList
        data={filteredReviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingVertical: SPACING.xl * 2 
          }}>
            <Icon name="star-outline" size={80} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.lg, color: COLORS.textSecondary }]}>
              No reviews found
            </Text>
            <Text style={[TEXT_STYLES.body2, { marginTop: SPACING.sm, color: COLORS.textSecondary, textAlign: 'center' }]}>
              Your reviews will appear here as clients rate your coaching!
            </Text>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <FAB
        icon="add"
        label="Request Review"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Request Review', 'Send review request to clients feature coming soon! 📝')}
      />

      {/* Review Detail Modal */}
      {renderReviewModal()}
    </View>
  );
};

export default CoachRatings;
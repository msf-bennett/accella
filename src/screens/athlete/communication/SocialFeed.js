import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Image,
  Share,
  Vibration,
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
  FAB,
  IconButton,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SocialFeed = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  // Mock data for demonstration
  const mockPosts = [
    {
      id: '1',
      type: 'achievement',
      author: {
        id: 'coach_1',
        name: 'Coach Sarah Johnson',
        avatar: 'https://example.com/coach1.jpg',
        role: 'coach',
        verified: true,
      },
      content: 'Incredible progress from our team this week! 🔥 Everyone hit their sprint targets and showed amazing teamwork during scrimmage. Special shoutout to @alex_martinez for the speed improvement! 🏃‍♂️💨',
      timestamp: '2024-08-22T10:30:00Z',
      images: ['https://example.com/team-training.jpg'],
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: true,
      tags: ['#TeamWork', '#SpeedTraining', '#Progress'],
      mentions: ['alex_martinez'],
    },
    {
      id: '2',
      type: 'workout_completed',
      author: {
        id: 'player_1',
        name: 'Alex Martinez',
        avatar: 'https://example.com/player1.jpg',
        role: 'player',
        verified: false,
      },
      content: 'Just crushed today\'s HIIT session! 💪 New personal best on the 100m sprint - 12.8 seconds! Thanks @coach_sarah for pushing me to my limits. Ready for tomorrow\'s match! ⚽',
      timestamp: '2024-08-22T08:15:00Z',
      workoutData: {
        duration: '45 mins',
        calories: 380,
        exercises: 8,
        personalBests: 2,
      },
      likes: 18,
      comments: 12,
      shares: 2,
      isLiked: false,
      tags: ['#PersonalBest', '#HIIT', '#Ready'],
      mentions: ['coach_sarah'],
    },
    {
      id: '3',
      type: 'team_announcement',
      author: {
        id: 'academy_1',
        name: 'Elite Sports Academy',
        avatar: 'https://example.com/academy.jpg',
        role: 'academy',
        verified: true,
      },
      content: '🏆 MATCH DAY ANNOUNCEMENT 🏆\n\nBig game this Saturday vs Thunder Hawks! All players report to the field by 2 PM. Parents and supporters welcome! Let\'s show our team spirit! 🦅⚡',
      timestamp: '2024-08-21T16:45:00Z',
      eventDetails: {
        date: '2024-08-24',
        time: '3:00 PM',
        location: 'Central Sports Complex',
        opponent: 'Thunder Hawks',
      },
      likes: 45,
      comments: 15,
      shares: 8,
      isLiked: true,
      tags: ['#MatchDay', '#ThunderHawks', '#TeamSpirit'],
      isPinned: true,
    },
    {
      id: '4',
      type: 'nutrition_tip',
      author: {
        id: 'nutritionist_1',
        name: 'Dr. Maya Patel',
        avatar: 'https://example.com/nutritionist.jpg',
        role: 'nutritionist',
        verified: true,
      },
      content: '🥗 NUTRITION TIP OF THE DAY 🥗\n\nPre-workout fuel: Try a banana with almond butter 30-60 minutes before training. The natural sugars provide quick energy while the protein helps sustain performance! 🍌🥜',
      timestamp: '2024-08-21T12:20:00Z',
      images: ['https://example.com/nutrition-tip.jpg'],
      likes: 32,
      comments: 6,
      shares: 12,
      isLiked: false,
      tags: ['#NutritionTip', '#PreWorkout', '#HealthyEating'],
    },
    {
      id: '5',
      type: 'player_spotlight',
      author: {
        id: 'team_manager',
        name: 'Team Manager',
        avatar: 'https://example.com/manager.jpg',
        role: 'manager',
        verified: true,
      },
      content: '🌟 PLAYER SPOTLIGHT 🌟\n\nThis week we\'re featuring Emma Wilson! Her dedication to training and positive attitude inspire everyone around her. Keep up the amazing work, Emma! 👏✨',
      timestamp: '2024-08-20T14:30:00Z',
      images: ['https://example.com/emma-spotlight.jpg'],
      playerStats: {
        trainingDays: 28,
        goals: 12,
        assists: 8,
        attendance: '100%',
      },
      likes: 67,
      comments: 23,
      shares: 5,
      isLiked: true,
      tags: ['#PlayerSpotlight', '#Inspiration', '#Dedication'],
    },
  ];

  useEffect(() => {
    loadPosts();
    startAnimation();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedFilter]);

  const startAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(mockPosts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load social feed');
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;
    
    switch (selectedFilter) {
      case 'achievements':
        filtered = posts.filter(post => 
          post.type === 'achievement' || post.type === 'workout_completed' || post.type === 'player_spotlight'
        );
        break;
      case 'announcements':
        filtered = posts.filter(post => post.type === 'team_announcement');
        break;
      case 'tips':
        filtered = posts.filter(post => post.type === 'nutrition_tip');
        break;
      case 'my_posts':
        filtered = posts.filter(post => post.author.id === user?.id);
        break;
      default:
        filtered = posts;
    }
    
    setFilteredPosts(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, []);

  const handleLike = async (postId) => {
    Vibration.vibrate(50);
    
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
  };

  const handleComment = (post) => {
    setSelectedPost(post);
    setCommentText('');
    setShowCommentModal(true);
  };

  const submitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedPosts = posts.map(post =>
        post.id === selectedPost.id
          ? { ...post, comments: post.comments + 1 }
          : post
      );
      
      setPosts(updatedPosts);
      setShowCommentModal(false);
      Alert.alert('Success', 'Comment posted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  const handleShare = async (post) => {
    try {
      await Share.share({
        message: `Check out this post from ${post.author.name}: ${post.content}`,
        title: 'Training Update',
      });
      
      // Update share count
      const updatedPosts = posts.map(p =>
        p.id === post.id ? { ...p, shares: p.shares + 1 } : p
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const createPost = async () => {
    if (!newPostText.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newPost = {
        id: Date.now().toString(),
        type: 'player_update',
        author: {
          id: user?.id || 'current_user',
          name: user?.name || 'You',
          avatar: user?.avatar || 'https://example.com/default-avatar.jpg',
          role: 'player',
          verified: false,
        },
        content: newPostText,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        tags: [],
      };
      
      setPosts([newPost, ...posts]);
      setShowCreateModal(false);
      setNewPostText('');
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderPostHeader = (post) => (
    <View style={styles.postHeader}>
      <View style={styles.authorInfo}>
        <Avatar.Image
          size={40}
          source={{ uri: post.author.avatar }}
          style={styles.authorAvatar}
        />
        <View style={styles.authorDetails}>
          <View style={styles.authorNameRow}>
            <Text style={styles.authorName}>{post.author.name}</Text>
            {post.author.verified && (
              <Icon name="verified" size={16} color={COLORS.primary} />
            )}
            {post.isPinned && (
              <Icon name="push-pin" size={14} color={COLORS.warning} />
            )}
          </View>
          <Text style={styles.postTime}>{formatTimestamp(post.timestamp)}</Text>
        </View>
      </View>
      <IconButton
        icon="dots-vertical"
        size={20}
        onPress={() => Alert.alert('More Options', 'Feature coming soon!')}
      />
    </View>
  );

  const renderWorkoutData = (workoutData) => (
    <Surface style={styles.workoutDataContainer}>
      <View style={styles.workoutStats}>
        <View style={styles.workoutStat}>
          <Icon name="timer" size={16} color={COLORS.primary} />
          <Text style={styles.workoutStatText}>{workoutData.duration}</Text>
        </View>
        <View style={styles.workoutStat}>
          <Icon name="local-fire-department" size={16} color={COLORS.error} />
          <Text style={styles.workoutStatText}>{workoutData.calories} cal</Text>
        </View>
        <View style={styles.workoutStat}>
          <Icon name="fitness-center" size={16} color={COLORS.success} />
          <Text style={styles.workoutStatText}>{workoutData.exercises} exercises</Text>
        </View>
        <View style={styles.workoutStat}>
          <Icon name="jump-rope" size={16} color={COLORS.warning} />
          <Text style={styles.workoutStatText}>{workoutData.personalBests} PBs</Text>
        </View>
      </View>
    </Surface>
  );

  const renderEventDetails = (eventDetails) => (
    <Surface style={styles.eventContainer}>
      <View style={styles.eventHeader}>
        <Icon name="event" size={20} color={COLORS.primary} />
        <Text style={styles.eventTitle}>Match Details</Text>
      </View>
      <View style={styles.eventDetails}>
        <View style={styles.eventDetail}>
          <Icon name="schedule" size={16} color={COLORS.textSecondary} />
          <Text style={styles.eventDetailText}>
            {eventDetails.date} at {eventDetails.time}
          </Text>
        </View>
        <View style={styles.eventDetail}>
          <Icon name="location-on" size={16} color={COLORS.textSecondary} />
          <Text style={styles.eventDetailText}>{eventDetails.location}</Text>
        </View>
        <View style={styles.eventDetail}>
          <Icon name="groups" size={16} color={COLORS.textSecondary} />
          <Text style={styles.eventDetailText}>vs {eventDetails.opponent}</Text>
        </View>
      </View>
    </Surface>
  );

  const renderPlayerStats = (playerStats) => (
    <Surface style={styles.playerStatsContainer}>
      <View style={styles.playerStatsGrid}>
        <View style={styles.playerStat}>
          <Text style={styles.playerStatNumber}>{playerStats.trainingDays}</Text>
          <Text style={styles.playerStatLabel}>Training Days</Text>
        </View>
        <View style={styles.playerStat}>
          <Text style={styles.playerStatNumber}>{playerStats.goals}</Text>
          <Text style={styles.playerStatLabel}>Goals</Text>
        </View>
        <View style={styles.playerStat}>
          <Text style={styles.playerStatNumber}>{playerStats.assists}</Text>
          <Text style={styles.playerStatLabel}>Assists</Text>
        </View>
        <View style={styles.playerStat}>
          <Text style={styles.playerStatNumber}>{playerStats.attendance}</Text>
          <Text style={styles.playerStatLabel}>Attendance</Text>
        </View>
      </View>
    </Surface>
  );

  const renderPostActions = (post) => (
    <View style={styles.postActions}>
      <TouchableOpacity
        style={[styles.actionButton, post.isLiked && styles.likedButton]}
        onPress={() => handleLike(post.id)}
      >
        <Icon
          name={post.isLiked ? "favorite" : "favorite-border"}
          size={20}
          color={post.isLiked ? COLORS.error : COLORS.textSecondary}
        />
        <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
          {post.likes}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleComment(post)}
      >
        <Icon name="chat-bubble-outline" size={20} color={COLORS.textSecondary} />
        <Text style={styles.actionText}>{post.comments}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleShare(post)}
      >
        <Icon name="share" size={20} color={COLORS.textSecondary} />
        <Text style={styles.actionText}>{post.shares}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPost = (post) => (
    <Card key={post.id} style={styles.postCard}>
      <Card.Content>
        {renderPostHeader(post)}

        {/* Post Content */}
        <Text style={styles.postContent}>{post.content}</Text>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {post.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.postImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* Workout Data */}
        {post.workoutData && renderWorkoutData(post.workoutData)}

        {/* Event Details */}
        {post.eventDetails && renderEventDetails(post.eventDetails)}

        {/* Player Stats */}
        {post.playerStats && renderPlayerStats(post.playerStats)}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <Chip
                key={index}
                mode="outlined"
                style={styles.tagChip}
                textStyle={styles.tagText}
              >
                {tag}
              </Chip>
            ))}
          </ScrollView>
        )}

        <Divider style={styles.actionsDivider} />
        {renderPostActions(post)}
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="dynamic-feed" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>No Posts Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Be the first to share your training journey!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="dynamic-feed" size={60} color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[
        styles.headerContainer,
        {
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, -50],
              extrapolate: 'clamp',
            }),
          }],
        }
      ]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Training Community</Text>
          <Text style={styles.headerSubtitle}>
            Stay connected with your team and coaches
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { key: 'all', label: 'All Posts', icon: 'dynamic-feed' },
          { key: 'achievements', label: 'Achievements', icon: 'jump-rope' },
          { key: 'announcements', label: 'Announcements', icon: 'campaign' },
          { key: 'tips', label: 'Tips', icon: 'lightbulb' },
          { key: 'my_posts', label: 'My Posts', icon: 'person' },
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

      {/* Posts Feed */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {filteredPosts.length > 0 ? (
            <>
              {filteredPosts.map(renderPost)}
              <View style={styles.bottomSpacer} />
            </>
          ) : (
            renderEmptyState()
          )}
        </Animated.ScrollView>
      </Animated.View>

      {/* Create Post FAB */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        label="Post"
      />

      {/* Create Post Modal */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
          >
            <Surface style={styles.createModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Post</Text>
                <TouchableOpacity
                  onPress={() => setShowCreateModal(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <TextInput
                mode="outlined"
                label="What's on your mind?"
                value={newPostText}
                onChangeText={setNewPostText}
                multiline
                numberOfLines={6}
                style={styles.postInput}
                placeholder="Share your training progress, achievements, or thoughts with the community..."
              />

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowCreateModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={createPost}
                  style={styles.createButton}
                >
                  Post
                </Button>
              </View>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>

      {/* Comment Modal */}
      <Portal>
        <Modal
          visible={showCommentModal}
          onDismiss={() => setShowCommentModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
          >
            <Surface style={styles.commentModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Comment</Text>
                <TouchableOpacity
                  onPress={() => setShowCommentModal(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedPost && (
                <View style={styles.originalPost}>
                  <Text style={styles.originalPostAuthor}>
                    {selectedPost.author.name}
                  </Text>
                  <Text style={styles.originalPostContent} numberOfLines={2}>
                    {selectedPost.content}
                  </Text>
                </View>
              )}

              <TextInput
                mode="outlined"
                label="Your comment"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                numberOfLines={3}
                style={styles.commentInput}
                placeholder="Share your thoughts..."
              />

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowCommentModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={submitComment}
                  style={styles.commentButton}
                >
                  Comment
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
  headerContainer: {
    zIndex: 1000,
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
    zIndex: 999,
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
    fontSize: 12,
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
  postCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    marginRight: SPACING.sm,
  },
  authorDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
  },
  postTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  postContent: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  imagesContainer: {
    marginBottom: SPACING.md,
  },
  postImage: {
    width: width * 0.7,
    height: 200,
    borderRadius: 12,
    marginRight: SPACING.sm,
  },
  workoutDataContainer: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    marginBottom: SPACING.md,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workoutStat: {
    alignItems: 'center',
    flex: 1,
  },
  workoutStatText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  eventContainer: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    marginBottom: SPACING.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  eventTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
    color: COLORS.primary,
  },
  eventDetails: {
    marginLeft: SPACING.lg,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  eventDetailText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
  },
  playerStatsContainer: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
    marginBottom: SPACING.md,
  },
  playerStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playerStat: {
    alignItems: 'center',
    flex: 1,
  },
  playerStatNumber: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  playerStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  tagsContainer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tagChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: COLORS.primary,
  },
  tagText: {
    color: COLORS.primary,
    fontSize: 11,
  },
  actionsDivider: {
    marginVertical: SPACING.sm,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  likedButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  actionText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  likedText: {
    color: COLORS.error,
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
    height: 100,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createModal: {
    width: width - SPACING.xl,
    borderRadius: 12,
    padding: SPACING.lg,
    maxHeight: height * 0.7,
  },
  commentModal: {
    width: width - SPACING.xl,
    borderRadius: 12,
    padding: SPACING.lg,
    maxHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  postInput: {
    marginBottom: SPACING.lg,
    minHeight: 150,
  },
  originalPost: {
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  originalPostAuthor: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  originalPostContent: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  commentInput: {
    marginBottom: SPACING.lg,
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  createButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  commentButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
};

export default SocialFeed;
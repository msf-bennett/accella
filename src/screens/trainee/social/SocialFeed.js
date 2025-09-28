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
  Image,
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
  Searchbar,
  Portal,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const SocialFeed = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { socialFeed, notifications } = useSelector(state => state.social);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerScale = useRef(new Animated.Value(1)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discover'); // discover, following, trending
  const [storyModalVisible, setStoryModalVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [quickPostModalVisible, setQuickPostModalVisible] = useState(false);
  const [quickPostText, setQuickPostText] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  // Sample data (replace with real data from Redux store)
  const [stories, setStories] = useState([
    {
      id: '1',
      user: {
        id: 'u1',
        name: 'Sarah J.',
        avatar: 'https://via.placeholder.com/50',
        isOnline: true
      },
      media: 'https://via.placeholder.com/300x600',
      timestamp: '2024-08-26T08:30:00Z',
      viewed: false,
      workoutType: 'Morning Yoga'
    },
    {
      id: '2',
      user: {
        id: 'u2',
        name: 'Mike C.',
        avatar: 'https://via.placeholder.com/50',
        isOnline: false
      },
      media: 'https://via.placeholder.com/300x600',
      timestamp: '2024-08-26T07:15:00Z',
      viewed: true,
      workoutType: 'Strength Training'
    },
    {
      id: '3',
      user: {
        id: 'u3',
        name: 'Emma R.',
        avatar: 'https://via.placeholder.com/50',
        isOnline: true
      },
      media: 'https://via.placeholder.com/300x600',
      timestamp: '2024-08-26T06:45:00Z',
      viewed: false,
      workoutType: 'Running'
    }
  ]);

  const [feedPosts, setFeedPosts] = useState([
    {
      id: '1',
      user: {
        id: 'u1',
        name: 'Alex Rivera',
        avatar: 'https://via.placeholder.com/50',
        level: 'Advanced',
        followers: 1250,
        verified: true,
        isFollowing: true
      },
      type: 'workout_complete',
      content: {
        text: 'Just crushed a 5K run in 22:30! 🏃‍♂️ New personal best and feeling amazing! The consistent training is really paying off. Who else is hitting their goals this week?',
        workout: {
          name: '5K Morning Run',
          duration: '22:30',
          calories: 285,
          distance: '5.0 km'
        },
        image: 'https://via.placeholder.com/400x200'
      },
      timestamp: '2024-08-26T10:45:00Z',
      likes: 89,
      comments: 23,
      shares: 7,
      isLiked: false,
      isBookmarked: true,
      engagement: 'high'
    },
    {
      id: '2',
      user: {
        id: 'u2',
        name: 'Jessica Martinez',
        avatar: 'https://via.placeholder.com/50',
        level: 'Intermediate',
        followers: 678,
        verified: false,
        isFollowing: false
      },
      type: 'motivation',
      content: {
        text: 'Remember: Progress isn\'t always visible on the scale. Sometimes it\'s in how you feel, how your clothes fit, or how much stronger you\'ve become. Keep going! 💪✨',
        quote: 'Your only limit is your mind',
        backgroundColor: '#667eea'
      },
      timestamp: '2024-08-26T09:15:00Z',
      likes: 156,
      comments: 34,
      shares: 28,
      isLiked: true,
      isBookmarked: false,
      engagement: 'viral'
    },
    {
      id: '3',
      user: {
        id: 'u3',
        name: 'David Kim',
        avatar: 'https://via.placeholder.com/50',
        level: 'Beginner',
        followers: 89,
        verified: false,
        isFollowing: true
      },
      type: 'achievement',
      content: {
        text: 'Week 4 of my fitness journey complete! 🎉 Lost 8 pounds and can finally do 10 push-ups without stopping. Small victories but they feel huge to me!',
        achievement: {
          type: '30-day challenge',
          progress: 28,
          total: 30,
          badge: 'consistency-warrior'
        },
        stats: {
          'Weight Lost': '8 lbs',
          'Workouts': '16/16',
          'Days Active': '28/30'
        }
      },
      timestamp: '2024-08-26T08:30:00Z',
      likes: 67,
      comments: 18,
      shares: 5,
      isLiked: true,
      isBookmarked: false,
      engagement: 'medium'
    },
    {
      id: '4',
      user: {
        id: 'u4',
        name: 'Team FitPro',
        avatar: 'https://via.placeholder.com/50',
        level: 'Coach',
        followers: 5420,
        verified: true,
        isFollowing: true,
        isOfficial: true
      },
      type: 'tip',
      content: {
        text: '🔥 Training Tip Tuesday: Focus on form over speed! Quality reps with proper technique will give you better results and prevent injuries. Your future self will thank you! 💯',
        tip: {
          category: 'Form & Technique',
          difficulty: 'Beginner Friendly',
          readTime: '2 min read'
        }
      },
      timestamp: '2024-08-25T16:20:00Z',
      likes: 234,
      comments: 45,
      shares: 67,
      isLiked: false,
      isBookmarked: true,
      engagement: 'high'
    }
  ]);

  const [trendingTopics, setTrendingTopics] = useState([
    { tag: 'MorningWorkout', posts: 1240 },
    { tag: '30DayChallenge', posts: 856 },
    { tag: 'TransformationTuesday', posts: 734 },
    { tag: 'FitnessMotivation', posts: 692 },
    { tag: 'HealthyLifestyle', posts: 543 }
  ]);

  const [suggestedUsers, setSuggestedUsers] = useState([
    {
      id: 'su1',
      name: 'Maria Santos',
      avatar: 'https://via.placeholder.com/50',
      level: 'Advanced',
      specialty: 'Yoga & Mindfulness',
      mutualFollows: 12,
      isFollowing: false
    },
    {
      id: 'su2',
      name: 'Chris Johnson',
      avatar: 'https://via.placeholder.com/50',
      level: 'Expert',
      specialty: 'Strength & Conditioning',
      mutualFollows: 8,
      isFollowing: false
    }
  ]);

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

  // Header animation on scroll
  const animateHeader = (scrollY) => {
    const scale = Math.max(0.9, 1 - scrollY / 200);
    Animated.timing(headerScale, {
      toValue: scale,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  // Like/Unlike handler
  const toggleLike = (postId) => {
    setFeedPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
    Vibration.vibrate(50);
  };

  // Follow/Unfollow handler
  const toggleFollow = (userId) => {
    setFeedPosts(prev => prev.map(post => 
      post.user.id === userId 
        ? { 
            ...post, 
            user: { ...post.user, isFollowing: !post.user.isFollowing }
          }
        : post
    ));
    setSuggestedUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isFollowing: !user.isFollowing }
        : user
    ));
    Vibration.vibrate(50);
  };

  // Story view handler
  const viewStory = (story) => {
    setSelectedStory(story);
    setStoryModalVisible(true);
    setStories(prev => prev.map(s => 
      s.id === story.id ? { ...s, viewed: true } : s
    ));
  };

  // Quick post handler
  const handleQuickPost = () => {
    if (!quickPostText.trim()) {
      Alert.alert('Empty Post', 'Please write something to share!');
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      user: {
        ...user,
        isFollowing: false
      },
      type: 'quick_post',
      content: {
        text: quickPostText
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
      engagement: 'new'
    };

    setFeedPosts(prev => [newPost, ...prev]);
    setQuickPostText('');
    setQuickPostModalVisible(false);
    
    Vibration.vibrate(100);
    Alert.alert('Post Shared! 🎉', 'Your update has been shared with the community.');
  };

  // Post engagement indicator
  const getEngagementColor = (engagement) => {
    switch (engagement) {
      case 'viral': return '#FF6B6B';
      case 'high': return '#4ECDC4';
      case 'medium': return '#45B7D1';
      case 'new': return '#96CEB4';
      default: return '#DDD';
    }
  };

  // Story component
  const StoryItem = ({ story }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => viewStory(story)}
    >
      <View style={[
        styles.storyAvatarContainer,
        story.viewed ? styles.viewedStory : styles.newStory
      ]}>
        <Avatar.Image size={60} source={{ uri: story.user.avatar }} />
        {story.user.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <Text style={styles.storyName}>{story.user.name}</Text>
    </TouchableOpacity>
  );

  // Feed post component
  const FeedPostCard = ({ post }) => {
    const engagementColor = getEngagementColor(post.engagement);
    
    return (
      <Card style={[styles.postCard, { borderLeftColor: engagementColor, borderLeftWidth: 4 }]}>
        <Card.Content>
          {/* Post Header */}
          <View style={styles.postHeader}>
            <TouchableOpacity style={styles.userInfo}>
              <Avatar.Image size={45} source={{ uri: post.user.avatar }} />
              <View style={styles.userDetails}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{post.user.name}</Text>
                  {post.user.verified && (
                    <Icon name="verified" size={16} color={COLORS.primary} />
                  )}
                  {post.user.isOfficial && (
                    <Badge style={styles.officialBadge}>Official</Badge>
                  )}
                </View>
                <Text style={styles.userLevel}>
                  {post.user.level} • {post.user.followers} followers
                </Text>
                <Text style={styles.timestamp}>
                  {new Date(post.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.postActions}>
              {!post.user.isFollowing && (
                <Button
                  mode="contained"
                  compact
                  onPress={() => toggleFollow(post.user.id)}
                  style={styles.followButton}
                  labelStyle={styles.followButtonText}
                >
                  Follow
                </Button>
              )}
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Post options will be available soon.')}
              />
            </View>
          </View>

          {/* Post Content */}
          {post.type === 'motivation' && (
            <LinearGradient
              colors={[post.content.backgroundColor, `${post.content.backgroundColor}CC`]}
              style={styles.motivationCard}
            >
              <Text style={styles.motivationQuote}>"{post.content.quote}"</Text>
            </LinearGradient>
          )}

          <Text style={styles.postText}>{post.content.text}</Text>

          {/* Workout Stats */}
          {post.content.workout && (
            <Surface style={styles.workoutStats}>
              <View style={styles.workoutHeader}>
                <Icon name="fitness-center" size={20} color={COLORS.primary} />
                <Text style={styles.workoutName}>{post.content.workout.name}</Text>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{post.content.workout.duration}</Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{post.content.workout.calories}</Text>
                  <Text style={styles.statLabel}>Calories</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{post.content.workout.distance}</Text>
                  <Text style={styles.statLabel}>Distance</Text>
                </View>
              </View>
            </Surface>
          )}

          {/* Achievement Progress */}
          {post.content.achievement && (
            <Surface style={styles.achievementContainer}>
              <View style={styles.achievementHeader}>
                <Icon name="jump-rope" size={20} color="#FFD700" />
                <Text style={styles.achievementTitle}>{post.content.achievement.type}</Text>
              </View>
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={post.content.achievement.progress / post.content.achievement.total}
                  color={COLORS.success}
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {post.content.achievement.progress}/{post.content.achievement.total} days
                </Text>
              </View>
              {post.content.stats && (
                <View style={styles.statsGrid}>
                  {Object.entries(post.content.stats).map(([key, value], index) => (
                    <View key={index} style={styles.statItem}>
                      <Text style={styles.statValue}>{value}</Text>
                      <Text style={styles.statLabel}>{key}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Surface>
          )}

          {/* Training Tip */}
          {post.content.tip && (
            <Surface style={styles.tipContainer}>
              <View style={styles.tipHeader}>
                <Icon name="lightbulb" size={20} color="#FF9800" />
                <Text style={styles.tipCategory}>{post.content.tip.category}</Text>
              </View>
              <View style={styles.tipMeta}>
                <Chip style={styles.tipChip} textStyle={styles.tipChipText}>
                  {post.content.tip.difficulty}
                </Chip>
                <Text style={styles.tipReadTime}>{post.content.tip.readTime}</Text>
              </View>
            </Surface>
          )}

          {/* Post Image */}
          {post.content.image && (
            <Image source={{ uri: post.content.image }} style={styles.postImage} />
          )}

          {/* Engagement Actions */}
          <View style={styles.engagementActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleLike(post.id)}
            >
              <Icon
                name={post.isLiked ? 'favorite' : 'favorite-border'}
                size={24}
                color={post.isLiked ? COLORS.error : '#666'}
              />
              <Text style={[styles.actionText, post.isLiked && styles.activeActionText]}>
                {post.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Feature Coming Soon! 💬', 'Comments will be available soon.')}
            >
              <Icon name="chat-bubble-outline" size={24} color="#666" />
              <Text style={styles.actionText}>{post.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Feature Coming Soon! 📤', 'Share feature will be available soon.')}
            >
              <Icon name="share" size={24} color="#666" />
              <Text style={styles.actionText}>{post.shares}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setFeedPosts(prev => prev.map(p => 
                  p.id === post.id ? { ...p, isBookmarked: !p.isBookmarked } : p
                ));
                Vibration.vibrate(50);
              }}
            >
              <Icon
                name={post.isBookmarked ? 'bookmark' : 'bookmark-border'}
                size={24}
                color={post.isBookmarked ? COLORS.primary : '#666'}
              />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Suggested user card
  const SuggestedUserCard = ({ user }) => (
    <Card style={styles.suggestedUserCard}>
      <Card.Content>
        <View style={styles.suggestedUserHeader}>
          <Avatar.Image size={40} source={{ uri: user.avatar }} />
          <View style={styles.suggestedUserInfo}>
            <Text style={styles.suggestedUserName}>{user.name}</Text>
            <Text style={styles.suggestedUserLevel}>{user.level}</Text>
            <Text style={styles.suggestedUserSpecialty}>{user.specialty}</Text>
            <Text style={styles.mutualFollows}>{user.mutualFollows} mutual follows</Text>
          </View>
          <Button
            mode={user.isFollowing ? "outlined" : "contained"}
            compact
            onPress={() => toggleFollow(user.id)}
            style={styles.suggestedFollowButton}
          >
            {user.isFollowing ? 'Following' : 'Follow'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  // Header component
  const renderHeader = () => (
    <Animated.View style={[styles.header, { transform: [{ scale: headerScale }] }]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Social Feed 🌟</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => setShowNotifications(!showNotifications)}
            >
              <Icon name="notifications" size={24} color="white" />
              {unreadNotifications > 0 && (
                <Badge style={styles.notificationBadge}>{unreadNotifications}</Badge>
              )}
            </TouchableOpacity>
            <IconButton
              icon="search"
              iconColor="white"
              size={24}
              onPress={() => Alert.alert('Feature Coming Soon! 🔍', 'Search functionality will be available soon.')}
            />
          </View>
        </View>

        {/* Tab Navigation */}
        <Surface style={styles.tabContainer}>
          {[
            { key: 'discover', label: 'Discover', icon: 'explore' },
            { key: 'following', label: 'Following', icon: 'people' },
            { key: 'trending', label: 'Trending', icon: 'trending-up' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Icon
                name={tab.icon}
                size={18}
                color={activeTab === tab.key ? COLORS.primary : '#666'}
              />
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Surface>
      </LinearGradient>
    </Animated.View>
  );

  // Stories section
  const renderStories = () => (
    <Surface style={styles.storiesContainer}>
      <Text style={styles.sectionTitle}>Stories 📸</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesScroll}
      >
        {/* Add Your Story */}
        <TouchableOpacity
          style={styles.addStoryItem}
          onPress={() => Alert.alert('Feature Coming Soon! 📱', 'Story creation will be available soon.')}
        >
          <View style={styles.addStoryButton}>
            <Icon name="add" size={30} color={COLORS.primary} />
          </View>
          <Text style={styles.addStoryText}>Your Story</Text>
        </TouchableOpacity>

        {stories.map((story) => (
          <StoryItem key={story.id} story={story} />
        ))}
      </ScrollView>
    </Surface>
  );

  // Trending section
  const renderTrending = () => (
    <Surface style={styles.trendingContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending Topics 🔥</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trendingScroll}
      >
        {trendingTopics.map((topic, index) => (
          <TouchableOpacity key={index} style={styles.trendingItem}>
            <Text style={styles.trendingTag}>#{topic.tag}</Text>
            <Text style={styles.trendingCount}>{topic.posts} posts</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  // Suggested users section
  const renderSuggestedUsers = () => (
    <Surface style={styles.suggestedUsersContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suggested for You 👥</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      {suggestedUsers.map((user) => (
        <SuggestedUserCard key={user.id} user={user} />
      ))}
    </Surface>
  );

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
        
        <FlatList
          data={feedPosts}
          renderItem={({ item }) => <FeedPostCard post={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={() => (
            <View>
              {activeTab === 'discover' && renderStories()}
              {activeTab === 'trending' && renderTrending()}
              {activeTab === 'following' && renderSuggestedUsers()}
            </View>
          )}
          contentContainerStyle={styles.feedContainer}
          onScroll={(event) => {
            const scrollY = event.nativeEvent.contentOffset.y;
            animateHeader(scrollY);
          }}
          scrollEventThrottle={16}
        />

        {/* Quick Post FAB */}
        <FAB
          icon="edit"
          style={styles.quickPostFab}
          onPress={() => setQuickPostModalVisible(true)}
          label="Quick Post"
        />

        {/* Story Modal */}
        <Portal>
          <Modal
            visible={storyModalVisible}
            onDismiss={() => setStoryModalVisible(false)}
            contentContainerStyle={styles.storyModalContainer}
          >
            <TouchableOpacity
              style={styles.storyModalOverlay}
              onPress={() => setStoryModalVisible(false)}
            >
              {selectedStory && (
                <View style={styles.storyContent}>
                  <Image
                    source={{ uri: selectedStory.media }}
                    style={styles.storyImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.7)', 'transparent']}
                    style={styles.storyOverlay}
                  >
                    <View style={styles.storyHeader}>
                      <Avatar.Image size={40} source={{ uri: selectedStory.user.avatar }} />
                      <View style={styles.storyUserInfo}>
                        <Text style={styles.storyUserName}>{selectedStory.user.name}</Text>
                        <Text style={styles.storyWorkoutType}>{selectedStory.workoutType}</Text>
                      </View>
                      <IconButton
                        icon="close"
                        iconColor="white"
                        size={24}
                        onPress={() => setStoryModalVisible(false)}
                      />
                    </View>
                  </LinearGradient>
                </View>
              )}
            </TouchableOpacity>
          </Modal>
        </Portal>

        {/* Quick Post Modal */}
        <Portal>
          <Modal
            visible={quickPostModalVisible}
            onDismiss={() => setQuickPostModalVisible(false)}
            contentContainerStyle={styles.quickPostModalContainer}
          >
            <BlurView style={styles.quickPostModalBlur} blurType="light" blurAmount={10}>
              <Card style={styles.quickPostModal}>
                <Card.Content>
                  <View style={styles.quickPostHeader}>
                    <Text style={styles.quickPostTitle}>Share a Quick Update 💬</Text>
                    <IconButton
                      icon="close"
                      size={24}
                      onPress={() => setQuickPostModalVisible(false)}
                    />
                  </View>
                  
                  <View style={styles.quickPostUserInfo}>
                    <Avatar.Image size={40} source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }} />
                    <Text style={styles.quickPostUserName}>{user?.name || 'Your Name'}</Text>
                  </View>

                  <TextInput
                    style={styles.quickPostInput}
                    placeholder="What's on your mind? Share your fitness journey..."
                    value={quickPostText}
                    onChangeText={setQuickPostText}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={280}
                  />

                  <View style={styles.quickPostFooter}>
                    <Text style={styles.characterCount}>
                      {quickPostText.length}/280
                    </Text>
                    <View style={styles.quickPostActions}>
                      <Button
                        mode="outlined"
                        onPress={() => setQuickPostModalVisible(false)}
                        style={styles.quickPostCancel}
                      >
                        Cancel
                      </Button>
                      <Button
                        mode="contained"
                        onPress={handleQuickPost}
                        style={styles.quickPostSubmit}
                        disabled={!quickPostText.trim()}
                      >
                        Post
                      </Button>
                    </View>
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
    zIndex: 1000,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: SPACING.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    color: '#666',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  feedContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  storiesContainer: {
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  seeAllText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  storiesScroll: {
    paddingHorizontal: SPACING.md,
  },
  addStoryItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 70,
  },
  addStoryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addStoryText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  storyItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 70,
  },
  storyAvatarContainer: {
    position: 'relative',
    padding: 3,
    borderRadius: 35,
  },
  newStory: {
    backgroundColor: COLORS.primary,
  },
  viewedStory: {
    backgroundColor: '#DDD',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: 'white',
  },
  storyName: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  trendingContainer: {
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  trendingScroll: {
    paddingHorizontal: SPACING.md,
  },
  trendingItem: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    alignItems: 'center',
  },
  trendingTag: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  trendingCount: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  suggestedUsersContainer: {
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  suggestedUserCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    elevation: 1,
  },
  suggestedUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestedUserInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  suggestedUserName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  suggestedUserLevel: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  suggestedUserSpecialty: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  mutualFollows: {
    ...TEXT_STYLES.caption,
    color: '#999',
  },
  suggestedFollowButton: {
    minWidth: 80,
  },
  postCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  userName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  officialBadge: {
    backgroundColor: COLORS.primary,
    color: 'white',
    fontSize: 10,
    marginLeft: SPACING.xs,
  },
  userLevel: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  timestamp: {
    ...TEXT_STYLES.caption,
    color: '#999',
    marginTop: SPACING.xs,
  },
  postActions: {
    alignItems: 'flex-end',
  },
  followButton: {
    marginBottom: SPACING.xs,
    minWidth: 80,
  },
  followButtonText: {
    fontSize: 12,
  },
  motivationCard: {
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  motivationQuote: {
    ...TEXT_STYLES.h3,
    color: 'white',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  postText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  workoutStats: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  workoutName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: SPACING.xs,
  },
  achievementContainer: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  achievementTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: '#666',
    textAlign: 'center',
  },
  tipContainer: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    elevation: 1,
    backgroundColor: '#FFF8E1',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tipCategory: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  tipMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tipChip: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
  },
  tipChipText: {
    ...TEXT_STYLES.caption,
    color: '#FF9800',
  },
  tipReadTime: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: SPACING.md,
    backgroundColor: '#F0F0F0',
  },
  engagementActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  actionText: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginLeft: SPACING.xs,
  },
  activeActionText: {
    color: COLORS.error,
    fontWeight: 'bold',
  },
  quickPostFab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  storyModalContainer: {
    flex: 1,
  },
  storyModalOverlay: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyUserInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  storyUserName: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
  },
  storyWorkoutType: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  quickPostModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickPostModalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  quickPostModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    elevation: 8,
  },
  quickPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quickPostTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  quickPostUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quickPostUserName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  quickPostInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: SPACING.md,
    minHeight: 100,
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickPostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  quickPostActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickPostCancel: {
    minWidth: 80,
  },
  quickPostSubmit: {
    minWidth: 80,
  },
};

export default SocialFeed;
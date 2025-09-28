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
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const ProgressSharing = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { progressPosts, community } = useSelector(state => state.social);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fabScale = useRef(new Animated.Value(1)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, following, achievements, transformations
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareType, setShareType] = useState('workout'); // workout, achievement, transformation, milestone
  const [shareTitle, setShareTitle] = useState('');
  const [shareDescription, setShareDescription] = useState('');
  const [shareImages, setShareImages] = useState([]);
  const [shareMetrics, setShareMetrics] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewMode, setViewMode] = useState('feed'); // feed, my-posts

  // Sample data (replace with real data from Redux store)
  const [progressPosts, setProgressPosts] = useState([
    {
      id: '1',
      user: {
        id: 'u1',
        name: 'Sarah Johnson',
        avatar: 'https://via.placeholder.com/50',
        level: 'Advanced',
        followers: 234,
        verified: true
      },
      type: 'transformation',
      title: '6-Month Transformation Journey! 💪',
      description: 'Finally hit my goal weight and feeling stronger than ever! The consistency really paid off. Thank you to everyone who supported me along the way! 🙏',
      images: [
        'https://via.placeholder.com/300x400',
        'https://via.placeholder.com/300x400'
      ],
      metrics: {
        weightLoss: '25 lbs',
        duration: '6 months',
        workoutsCompleted: 156
      },
      tags: ['transformation', 'weight-loss', 'consistency', 'strength-training'],
      timestamp: '2024-08-26T10:30:00Z',
      likes: 89,
      comments: 23,
      shares: 12,
      isLiked: false,
      isBookmarked: false,
      streak: 180
    },
    {
      id: '2',
      user: {
        id: 'u2',
        name: 'Mike Chen',
        avatar: 'https://via.placeholder.com/50',
        level: 'Intermediate',
        followers: 156,
        verified: false
      },
      type: 'achievement',
      title: 'First Marathon Complete! 🏃‍♂️',
      description: 'Just crossed the finish line of my first marathon in 3:45:23! The training was tough but so worth it. Next goal: sub 3:30! 🎯',
      images: [
        'https://via.placeholder.com/300x200'
      ],
      metrics: {
        distance: '26.2 miles',
        time: '3:45:23',
        pace: '8:37/mile'
      },
      tags: ['marathon', 'running', 'achievement', 'endurance'],
      timestamp: '2024-08-25T16:45:00Z',
      likes: 67,
      comments: 18,
      shares: 8,
      isLiked: true,
      isBookmarked: false,
      streak: 95
    },
    {
      id: '3',
      user: {
        id: 'u3',
        name: 'Emma Rodriguez',
        avatar: 'https://via.placeholder.com/50',
        level: 'Beginner',
        followers: 89,
        verified: false
      },
      type: 'milestone',
      title: '100 Days Streak! 🔥',
      description: 'Never thought I could stick to anything for 100 days straight! Thanks to this amazing community for keeping me motivated every single day! 💯',
      images: [],
      metrics: {
        streak: 100,
        totalWorkouts: 100,
        averagePerWeek: 7
      },
      tags: ['consistency', '100-day-challenge', 'motivation', 'daily-workouts'],
      timestamp: '2024-08-24T08:15:00Z',
      likes: 142,
      comments: 31,
      shares: 19,
      isLiked: true,
      isBookmarked: true,
      streak: 100
    }
  ]);

  const [myPosts, setMyPosts] = useState([
    {
      id: '4',
      type: 'workout',
      title: 'Crushing Leg Day! 🦵',
      description: 'New PR on squats today - 225lbs x 5! Feeling the burn but loving the progress.',
      images: ['https://via.placeholder.com/300x200'],
      metrics: {
        exercise: 'Squats',
        weight: '225 lbs',
        reps: '5x5'
      },
      tags: ['leg-day', 'squats', 'pr', 'strength'],
      timestamp: '2024-08-26T18:30:00Z',
      likes: 34,
      comments: 8,
      shares: 3,
      isLiked: false,
      isBookmarked: false
    }
  ]);

  const shareTypes = [
    { key: 'workout', label: 'Workout', icon: 'fitness-center', color: '#4CAF50' },
    { key: 'achievement', label: 'Achievement', icon: 'jump-rope', color: '#FF9800' },
    { key: 'transformation', label: 'Transformation', icon: 'trending-up', color: '#9C27B0' },
    { key: 'milestone', label: 'Milestone', icon: 'flag', color: '#2196F3' }
  ];

  const availableTags = [
    'transformation', 'weight-loss', 'muscle-gain', 'strength-training', 'cardio',
    'marathon', 'running', 'cycling', 'swimming', 'yoga', 'crossfit',
    'consistency', 'motivation', 'pr', 'achievement', 'milestone',
    '30-day-challenge', '100-day-challenge', 'daily-workouts', 'endurance'
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

  // FAB animation
  const animateFab = () => {
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
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
  const toggleLike = (postId, isMyPost = false) => {
    const updatePosts = isMyPost ? setMyPosts : setProgressPosts;
    updatePosts(prev => prev.map(post => 
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

  // Bookmark handler
  const toggleBookmark = (postId, isMyPost = false) => {
    const updatePosts = isMyPost ? setMyPosts : setProgressPosts;
    updatePosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
    Vibration.vibrate(50);
  };

  // Share post handler
  const handleSharePost = () => {
    if (!shareTitle.trim() || !shareDescription.trim()) {
      Alert.alert('Incomplete Post', 'Please add a title and description.');
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      type: shareType,
      title: shareTitle,
      description: shareDescription,
      images: shareImages,
      metrics: shareMetrics,
      tags: selectedTags,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false
    };

    if (viewMode === 'my-posts') {
      setMyPosts(prev => [newPost, ...prev]);
    } else {
      setProgressPosts(prev => [{ ...newPost, user }, ...prev]);
    }

    // Reset form
    setShareModalVisible(false);
    setShareTitle('');
    setShareDescription('');
    setShareImages([]);
    setShareMetrics({});
    setSelectedTags([]);
    setShareType('workout');
    
    Vibration.vibrate(100);
    Alert.alert('Post Shared! 🎉', 'Your progress update has been shared with the community.');
  };

  // Progress post card component
  const ProgressPostCard = ({ post, isMyPost = false }) => {
    const typeConfig = shareTypes.find(t => t.key === post.type) || shareTypes[0];
    
    return (
      <Card style={styles.postCard}>
        <Card.Content>
          {/* Post Header */}
          {!isMyPost && (
            <View style={styles.postHeader}>
              <Avatar.Image size={45} source={{ uri: post.user?.avatar }} />
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{post.user?.name}</Text>
                  {post.user?.verified && (
                    <Icon name="verified" size={16} color={COLORS.primary} />
                  )}
                </View>
                <Text style={styles.userLevel}>{post.user?.level} • {post.user?.followers} followers</Text>
              </View>
              <View style={styles.postMeta}>
                <Chip
                  style={[styles.typeChip, { backgroundColor: `${typeConfig.color}20` }]}
                  textStyle={[styles.typeChipText, { color: typeConfig.color }]}
                  icon={typeConfig.icon}
                >
                  {typeConfig.label}
                </Chip>
                <Text style={styles.timestamp}>
                  {new Date(post.timestamp).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          {isMyPost && (
            <View style={styles.myPostHeader}>
              <Chip
                style={[styles.typeChip, { backgroundColor: `${typeConfig.color}20` }]}
                textStyle={[styles.typeChipText, { color: typeConfig.color }]}
                icon={typeConfig.icon}
              >
                {typeConfig.label}
              </Chip>
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Post management options will be available soon.')}
              />
            </View>
          )}

          {/* Post Content */}
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postDescription}>{post.description}</Text>

          {/* Progress Images */}
          {post.images && post.images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imagesContainer}
            >
              {post.images.map((image, index) => (
                <TouchableOpacity key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image }} style={styles.progressImage} />
                  {post.type === 'transformation' && index === 0 && (
                    <View style={styles.imageLabel}>
                      <Text style={styles.imageLabelText}>Before</Text>
                    </View>
                  )}
                  {post.type === 'transformation' && index === 1 && (
                    <View style={styles.imageLabel}>
                      <Text style={styles.imageLabelText}>After</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Metrics Display */}
          {Object.keys(post.metrics).length > 0 && (
            <Surface style={styles.metricsContainer}>
              <Text style={styles.metricsTitle}>Progress Metrics 📊</Text>
              <View style={styles.metricsGrid}>
                {Object.entries(post.metrics).map(([key, value], index) => (
                  <View key={index} style={styles.metricItem}>
                    <Text style={styles.metricValue}>{value}</Text>
                    <Text style={styles.metricLabel}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Text>
                  </View>
                ))}
              </View>
            </Surface>
          )}

          {/* Streak Indicator */}
          {post.streak && (
            <View style={styles.streakContainer}>
              <Icon name="local-fire-department" size={20} color="#FF5722" />
              <Text style={styles.streakText}>{post.streak} Day Streak!</Text>
            </View>
          )}

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <Chip
                key={index}
                style={styles.tagChip}
                textStyle={styles.tagChipText}
              >
                #{tag}
              </Chip>
            ))}
          </View>

          {/* Post Actions */}
          <View style={styles.postActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleLike(post.id, isMyPost)}
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
              onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Comments feature will be available soon.')}
            >
              <Icon name="chat-bubble-outline" size={24} color="#666" />
              <Text style={styles.actionText}>{post.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Share feature will be available soon.')}
            >
              <Icon name="share" size={24} color="#666" />
              <Text style={styles.actionText}>{post.shares}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleBookmark(post.id, isMyPost)}
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

  // Header component
  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Progress Sharing 📈</Text>
        <Text style={styles.headerSubtitle}>Share your fitness journey and inspire others</Text>
      </View>
      
      {/* View Mode Toggle */}
      <Surface style={styles.viewModeToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'feed' && styles.activeToggle]}
          onPress={() => setViewMode('feed')}
        >
          <Icon
            name="public"
            size={20}
            color={viewMode === 'feed' ? 'white' : '#666'}
          />
          <Text style={[styles.toggleText, viewMode === 'feed' && styles.activeToggleText]}>
            Community
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'my-posts' && styles.activeToggle]}
          onPress={() => setViewMode('my-posts')}
        >
          <Icon
            name="person"
            size={20}
            color={viewMode === 'my-posts' ? 'white' : '#666'}
          />
          <Text style={[styles.toggleText, viewMode === 'my-posts' && styles.activeToggleText]}>
            My Posts
          </Text>
        </TouchableOpacity>
      </Surface>
    </LinearGradient>
  );

  // Filter bar component
  const renderFilterBar = () => (
    <Surface style={styles.filterBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { key: 'all', label: 'All Posts', icon: 'view-list' },
          { key: 'following', label: 'Following', icon: 'people' },
          { key: 'achievements', label: 'Achievements', icon: 'jump-rope' },
          { key: 'transformations', label: 'Transformations', icon: 'trending-up' }
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterChip, activeFilter === filter.key && styles.activeFilterChip]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Icon
              name={filter.icon}
              size={18}
              color={activeFilter === filter.key ? 'white' : '#666'}
            />
            <Text style={[styles.filterText, activeFilter === filter.key && styles.activeFilterText]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <IconButton
        icon="search"
        size={24}
        onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Advanced search will be available soon.')}
      />
    </Surface>
  );

  // Content based on view mode
  const renderContent = () => {
    const postsToShow = viewMode === 'my-posts' ? myPosts : progressPosts;
    const filteredPosts = postsToShow.filter(post => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'achievements') return post.type === 'achievement';
      if (activeFilter === 'transformations') return post.type === 'transformation';
      return true;
    });

    return (
      <FlatList
        data={filteredPosts}
        renderItem={({ item }) => (
          <ProgressPostCard post={item} isMyPost={viewMode === 'my-posts'} />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={() => (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="photo-library" size={64} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>
                {viewMode === 'my-posts' ? 'No Posts Yet' : 'No Progress Posts'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {viewMode === 'my-posts' 
                  ? 'Share your first progress update!'
                  : 'Be the first to share your fitness journey!'
                }
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    );
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
        {renderFilterBar()}
        
        <View style={styles.content}>
          {renderContent()}
        </View>

        {/* Floating Action Button */}
        <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}>
          <FAB
            icon="add"
            style={styles.fab}
            onPress={() => {
              animateFab();
              setShareModalVisible(true);
            }}
            label="Share Progress"
          />
        </Animated.View>

        {/* Share Modal */}
        <Portal>
          <Modal
            visible={shareModalVisible}
            onDismiss={() => setShareModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
              <ScrollView style={styles.shareModal} showsVerticalScrollIndicator={false}>
                <Card style={styles.modalCard}>
                  <Card.Content>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Share Your Progress 🚀</Text>
                      <IconButton
                        icon="close"
                        size={24}
                        onPress={() => setShareModalVisible(false)}
                      />
                    </View>

                    {/* Post Type Selection */}
                    <View style={styles.typeSelection}>
                      <Text style={styles.sectionLabel}>What are you sharing?</Text>
                      <View style={styles.typeGrid}>
                        {shareTypes.map((type) => (
                          <TouchableOpacity
                            key={type.key}
                            style={[
                              styles.typeOption,
                              shareType === type.key && styles.activeTypeOption,
                              { borderColor: type.color }
                            ]}
                            onPress={() => setShareType(type.key)}
                          >
                            <Icon
                              name={type.icon}
                              size={24}
                              color={shareType === type.key ? type.color : '#666'}
                            />
                            <Text
                              style={[
                                styles.typeOptionText,
                                shareType === type.key && { color: type.color }
                              ]}
                            >
                              {type.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Title Input */}
                    <View style={styles.inputSection}>
                      <Text style={styles.sectionLabel}>Title *</Text>
                      <TextInput
                        style={styles.titleInput}
                        placeholder="Give your post a catchy title..."
                        value={shareTitle}
                        onChangeText={setShareTitle}
                        maxLength={100}
                      />
                    </View>

                    {/* Description Input */}
                    <View style={styles.inputSection}>
                      <Text style={styles.sectionLabel}>Description *</Text>
                      <TextInput
                        style={styles.descriptionInput}
                        placeholder="Share your story, tips, or motivation..."
                        value={shareDescription}
                        onChangeText={setShareDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        maxLength={500}
                      />
                    </View>

                    {/* Image Upload Placeholder */}
                    <View style={styles.inputSection}>
                      <Text style={styles.sectionLabel}>Photos</Text>
                      <TouchableOpacity
                        style={styles.imageUploadArea}
                        onPress={() => Alert.alert('Feature Coming Soon! 📸', 'Photo upload will be available soon.')}
                      >
                        <Icon name="add-photo-alternate" size={48} color="#999" />
                        <Text style={styles.imageUploadText}>Add Progress Photos</Text>
                        <Text style={styles.imageUploadSubtext}>Show your transformation or achievements</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Tags Selection */}
                    <View style={styles.inputSection}>
                      <Text style={styles.sectionLabel}>Tags (Optional)</Text>
                      <View style={styles.tagsGrid}>
                        {availableTags.slice(0, 12).map((tag) => (
                          <TouchableOpacity
                            key={tag}
                            onPress={() => {
                              if (selectedTags.includes(tag)) {
                                setSelectedTags(prev => prev.filter(t => t !== tag));
                              } else if (selectedTags.length < 5) {
                                setSelectedTags(prev => [...prev, tag]);
                              }
                            }}
                          >
                            <Chip
                              style={[
                                styles.selectableTag,
                                selectedTags.includes(tag) && styles.selectedTag
                              ]}
                              textStyle={[
                                styles.selectableTagText,
                                selectedTags.includes(tag) && styles.selectedTagText
                              ]}
                            >
                              #{tag}
                            </Chip>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <Text style={styles.tagLimit}>Select up to 5 tags ({selectedTags.length}/5)</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.modalActions}>
                      <Button
                        mode="outlined"
                        onPress={() => setShareModalVisible(false)}
                        style={styles.cancelButton}
                      >
                        Cancel
                      </Button>
                      <Button
                        mode="contained"
                        onPress={handleSharePost}
                        style={styles.shareButton}
                        disabled={!shareTitle.trim() || !shareDescription.trim()}
                      >
                        Share Post
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              </ScrollView>
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
    marginBottom: SPACING.lg,
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
  viewModeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    color: '#666',
  },
  activeToggleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    elevation: 1,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  postsContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
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
  myPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  userLevel: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  postMeta: {
    alignItems: 'flex-end',
  },
  typeChip: {
    marginBottom: SPACING.xs,
  },
  typeChipText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  timestamp: {
    ...TEXT_STYLES.caption,
    color: '#999',
  },
  postTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  postDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  imagesContainer: {
    marginBottom: SPACING.md,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  progressImage: {
    width: 200,
    height: 250,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  imageLabel: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  imageLabelText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
  },
  metricsContainer: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  metricsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    minWidth: '30%',
    marginBottom: SPACING.sm,
  },
  metricValue: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  streakText: {
    ...TEXT_STYLES.body,
    color: '#FF5722',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tagChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  tagChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
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
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.md,
  },
  fab: {
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
  },
  modalBlur: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  shareModal: {
    flex: 1,
  },
  modalCard: {
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
  typeSelection: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeOption: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: SPACING.sm,
  },
  activeTypeOption: {
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  typeOptionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    color: '#666',
    fontWeight: 'bold',
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 100,
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  imageUploadArea: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  imageUploadText: {
    ...TEXT_STYLES.body,
    color: '#999',
    marginTop: SPACING.sm,
  },
  imageUploadSubtext: {
    ...TEXT_STYLES.caption,
    color: '#999',
    marginTop: SPACING.xs,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectableTag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: '#F5F5F5',
  },
  selectedTag: {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
  },
  selectableTagText: {
    ...TEXT_STYLES.caption,
    color: '#666',
  },
  selectedTagText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  tagLimit: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: SPACING.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  cancelButton: {
    flex: 1,
  },
  shareButton: {
    flex: 1,
  },
};

export default ProgressSharing;
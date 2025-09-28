import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
  FlatList,
  Share,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Badge,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#9C27B0',
  like: '#E91E63',
  inspiration: '#FF6B35',
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

const MotivationalPosts = ({ navigation }) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [expandedPosts, setExpandedPosts] = useState(new Set());

  // Redux state
  const currentUser = useSelector(state => state.auth.user);
  const motivationalPosts = useSelector(state => state.social.posts);
  const loading = useSelector(state => state.social.loading);
  const dispatch = useDispatch();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  // Mock data for demonstration
  const mockMotivationalPosts = [
    {
      id: '1',
      type: 'success_story',
      author: {
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/150?img=21',
        role: 'Fitness Enthusiast',
        verified: true,
      },
      timestamp: '2 hours ago',
      title: '🎉 6 Month Transformation Complete!',
      content: 'I can\'t believe how far I\'ve come! Started this journey feeling defeated and out of shape. Today I completed my first 10K run and deadlifted 200lbs! 💪\n\nTo anyone starting their fitness journey: consistency beats perfection every single time. You\'ve got this! 🔥',
      image: 'https://picsum.photos/400/300?random=1',
      stats: {
        likes: 342,
        comments: 28,
        shares: 15,
        saves: 89,
      },
      tags: ['transformation', 'running', 'strength', 'motivation'],
      category: 'success_story',
      isLiked: false,
      isSaved: false,
    },
    {
      id: '2',
      type: 'daily_motivation',
      author: {
        name: 'Coach Marcus',
        avatar: 'https://i.pravatar.cc/150?img=22',
        role: 'Certified Trainer',
        verified: true,
      },
      timestamp: '4 hours ago',
      title: '🌅 Monday Motivation',
      content: 'Your body can stand almost anything. It\'s your mind that you have to convince.\n\nStart this week strong:\n✅ Set 3 small, achievable goals\n✅ Celebrate every small victory\n✅ Remember why you started\n✅ Trust the process\n\nWhat\'s your goal for today? Drop it in the comments! 👇',
      image: 'https://picsum.photos/400/250?random=2',
      stats: {
        likes: 567,
        comments: 89,
        shares: 34,
        saves: 156,
      },
      tags: ['motivation', 'mindset', 'goals', 'monday'],
      category: 'daily_motivation',
      isLiked: true,
      isSaved: true,
    },
    {
      id: '3',
      type: 'workout_tip',
      author: {
        name: 'Dr. Emma Wilson',
        avatar: 'https://i.pravatar.cc/150?img=23',
        role: 'Sports Scientist',
        verified: true,
      },
      timestamp: '6 hours ago',
      title: '💡 Pro Tip: Perfect Your Push-Ups',
      content: 'Struggling with push-ups? Here\'s the progression that works:\n\n1️⃣ Wall push-ups (2 weeks)\n2️⃣ Incline push-ups (2-3 weeks)\n3️⃣ Knee push-ups (2-3 weeks)\n4️⃣ Full push-ups\n\nFocus on form over quantity. Quality reps build strength faster than sloppy ones! 💪\n\n#FormFirst #ProgressiveOverload',
      image: 'https://picsum.photos/400/280?random=3',
      stats: {
        likes: 289,
        comments: 45,
        shares: 67,
        saves: 203,
      },
      tags: ['workout', 'technique', 'progression', 'strength'],
      category: 'workout_tip',
      isLiked: false,
      isSaved: false,
    },
    {
      id: '4',
      type: 'nutrition_wisdom',
      author: {
        name: 'Nutritionist Lisa',
        avatar: 'https://i.pravatar.cc/150?img=24',
        role: 'Registered Dietitian',
        verified: true,
      },
      timestamp: '8 hours ago',
      title: '🥗 Fuel Your Workouts Right',
      content: 'Pre-workout nutrition doesn\'t have to be complicated!\n\n🍌 30-60 min before: Banana + almond butter\n🥤 15-30 min before: Sports drink or coffee\n💧 Always: Plenty of water\n\nPost-workout (within 30 min):\n🥛 Protein shake + fruit\n🍗 Lean protein + complex carbs\n\nYour body is your temple - feed it well! ✨',
      image: 'https://picsum.photos/400/320?random=4',
      stats: {
        likes: 401,
        comments: 52,
        shares: 78,
        saves: 267,
      },
      tags: ['nutrition', 'pre-workout', 'post-workout', 'fuel'],
      category: 'nutrition_wisdom',
      isLiked: false,
      isSaved: true,
    },
    {
      id: '5',
      type: 'community_challenge',
      author: {
        name: 'FitCommunity',
        avatar: 'https://i.pravatar.cc/150?img=25',
        role: 'Community Admin',
        verified: true,
      },
      timestamp: '12 hours ago',
      title: '🏆 30-Day Plank Challenge',
      content: 'Join thousands in our September Plank Challenge! 📅\n\nWeek 1: 30 seconds\nWeek 2: 45 seconds\nWeek 3: 60 seconds\nWeek 4: 90 seconds\n\nTag a friend to join you! Let\'s build those cores together! 🔥\n\n#PlankChallenge #CommunityFit #StrongerTogether',
      image: 'https://picsum.photos/400/300?random=5',
      stats: {
        likes: 1205,
        comments: 234,
        shares: 145,
        saves: 567,
      },
      tags: ['challenge', 'plank', 'community', 'core'],
      category: 'community_challenge',
      isLiked: true,
      isSaved: false,
    },
  ];

  // Effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    loadMotivationalPosts();
  }, [selectedCategory]);

  // Callbacks
  const loadMotivationalPosts = useCallback(() => {
    // In real app, dispatch Redux action to fetch data
    // dispatch(fetchMotivationalPosts({ category: selectedCategory }));
  }, [selectedCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      loadMotivationalPosts();
      setRefreshing(false);
    }, 1500);
  }, [loadMotivationalPosts]);

  const handleLikePost = useCallback((postId) => {
    // Animate heart
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  const handleSavePost = useCallback((postId) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  const handleSharePost = useCallback(async (post) => {
    try {
      await Share.share({
        message: `${post.title}\n\n${post.content}\n\n- Shared from FitApp 💪`,
        title: post.title,
      });
    } catch (error) {
      Alert.alert('Share', 'Sharing feature coming soon! 📤');
    }
  }, []);

  const handleCommentPress = useCallback((postId) => {
    Alert.alert(
      'Comments',
      'Comments feature coming soon! Join the conversation! 💬',
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const handleExpandPost = useCallback((postId) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleCreatePost = useCallback(() => {
    Alert.alert(
      'Create Post',
      'Post creation feature coming soon! Share your motivation! ✍️',
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  const handleAuthorPress = useCallback((author) => {
    Alert.alert(
      'User Profile',
      `View ${author.name}'s profile feature coming soon! 👤`,
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  // Render functions
  const renderPostTypeIcon = (type) => {
    const icons = {
      success_story: { name: 'jump-rope', color: COLORS.warning },
      daily_motivation: { name: 'psychology', color: COLORS.inspiration },
      workout_tip: { name: 'fitness-center', color: COLORS.primary },
      nutrition_wisdom: { name: 'restaurant', color: COLORS.success },
      community_challenge: { name: 'groups', color: COLORS.accent },
    };

    const icon = icons[type] || { name: 'star', color: COLORS.textSecondary };
    
    return (
      <Surface style={[styles.typeIcon, { backgroundColor: `${icon.color}20` }]}>
        <Icon name={icon.name} size={16} color={icon.color} />
      </Surface>
    );
  };

  const renderPostCard = (post, index) => {
    const isLiked = likedPosts.has(post.id) || post.isLiked;
    const isSaved = savedPosts.has(post.id) || post.isSaved;
    const isExpanded = expandedPosts.has(post.id);
    const shouldTruncate = post.content.length > 200;

    const animatedStyle = {
      opacity: fadeAnim,
      transform: [
        {
          translateY: slideAnim.interpolate({
            inputRange: [0, 30],
            outputRange: [0, 30],
          }),
        },
      ],
    };

    return (
      <Animated.View key={post.id} style={[animatedStyle, { delay: index * 100 }]}>
        <Card style={styles.postCard}>
          {/* Post Header */}
          <View style={styles.postHeader}>
            <TouchableOpacity
              onPress={() => handleAuthorPress(post.author)}
              style={styles.authorSection}
            >
              <Avatar.Image size={45} source={{ uri: post.author.avatar }} />
              <View style={styles.authorInfo}>
                <View style={styles.authorNameRow}>
                  <Text style={styles.authorName}>{post.author.name}</Text>
                  {post.author.verified && (
                    <Icon name="verified" size={16} color={COLORS.primary} />
                  )}
                </View>
                <Text style={styles.authorRole}>{post.author.role}</Text>
                <Text style={styles.timestamp}>{post.timestamp}</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.postTypeContainer}>
              {renderPostTypeIcon(post.type)}
            </View>
          </View>

          {/* Post Content */}
          <View style={styles.postContent}>
            <Text style={styles.postTitle}>{post.title}</Text>
            
            <Text style={styles.postText}>
              {shouldTruncate && !isExpanded 
                ? `${post.content.substring(0, 200)}...`
                : post.content
              }
            </Text>
            
            {shouldTruncate && (
              <TouchableOpacity
                onPress={() => handleExpandPost(post.id)}
                style={styles.expandButton}
              >
                <Text style={styles.expandButtonText}>
                  {isExpanded ? 'Show less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Post Image */}
            {post.image && (
              <TouchableOpacity style={styles.postImageContainer}>
                <Image source={{ uri: post.image }} style={styles.postImage} />
              </TouchableOpacity>
            )}

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {post.tags.slice(0, 3).map((tag, idx) => (
                <Chip key={idx} compact style={styles.tagChip}>
                  #{tag}
                </Chip>
              ))}
              {post.tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{post.tags.length - 3} more</Text>
              )}
            </View>
          </View>

          {/* Post Actions */}
          <View style={styles.postActions}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleLikePost(post.id)}
                style={styles.actionButton}
              >
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <Icon
                    name={isLiked ? 'favorite' : 'favorite-border'}
                    size={24}
                    color={isLiked ? COLORS.like : COLORS.textSecondary}
                  />
                </Animated.View>
                <Text style={[styles.actionText, isLiked && styles.likedText]}>
                  {post.stats.likes + (isLiked && !post.isLiked ? 1 : 0)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleCommentPress(post.id)}
                style={styles.actionButton}
              >
                <Icon name="comment" size={24} color={COLORS.textSecondary} />
                <Text style={styles.actionText}>{post.stats.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSharePost(post)}
                style={styles.actionButton}
              >
                <Icon name="share" size={24} color={COLORS.textSecondary} />
                <Text style={styles.actionText}>{post.stats.shares}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => handleSavePost(post.id)}
              style={styles.saveButton}
            >
              <Icon
                name={isSaved ? 'bookmark' : 'bookmark-border'}
                size={24}
                color={isSaved ? COLORS.primary : COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Engagement Stats */}
          <Divider style={styles.divider} />
          <View style={styles.engagementStats}>
            <Text style={styles.engagementText}>
              💪 {post.stats.saves} saved • 👥 {post.stats.likes + post.stats.comments} engaged
            </Text>
          </View>
        </Card>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>✨ Daily Motivation</Text>
      <Text style={styles.headerSubtitle}>Get inspired, stay motivated, achieve greatness!</Text>
    </LinearGradient>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {[
          { key: 'all', label: 'All Posts', icon: 'dynamic-feed', color: COLORS.primary },
          { key: 'success_story', label: 'Success', icon: 'jump-rope', color: COLORS.warning },
          { key: 'daily_motivation', label: 'Motivation', icon: 'psychology', color: COLORS.inspiration },
          { key: 'workout_tip', label: 'Tips', icon: 'fitness-center', color: COLORS.primary },
          { key: 'nutrition_wisdom', label: 'Nutrition', icon: 'restaurant', color: COLORS.success },
          { key: 'community_challenge', label: 'Challenges', icon: 'groups', color: COLORS.accent },
        ].map((category) => (
          <TouchableOpacity
            key={category.key}
            onPress={() => handleCategoryChange(category.key)}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && [
                styles.selectedCategoryButton,
                { backgroundColor: category.color }
              ],
            ]}
          >
            <Icon
              name={category.icon}
              size={20}
              color={
                selectedCategory === category.key 
                  ? COLORS.surface 
                  : category.color
              }
            />
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.key && styles.selectedCategoryButtonText,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMotivationalQuote = () => (
    <Card style={styles.quoteCard}>
      <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.quoteGradient}>
        <View style={styles.quoteContent}>
          <Icon name="format-quote" size={32} color={COLORS.surface} />
          <Text style={styles.quoteText}>
            "The only bad workout is the one that didn't happen."
          </Text>
          <Text style={styles.quoteAuthor}>- Unknown</Text>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderTrendingHashtags = () => (
    <Card style={styles.trendingCard}>
      <View style={styles.trendingHeader}>
        <Icon name="trending-up" size={24} color={COLORS.primary} />
        <Text style={styles.trendingTitle}>🔥 Trending Now</Text>
      </View>
      <View style={styles.trendingTags}>
        {['#MondayMotivation', '#TransformationTuesday', '#FitnessGoals', '#StayStrong'].map((tag, idx) => (
          <Chip key={idx} style={styles.trendingTag} onPress={() => setSearchQuery(tag)}>
            {tag}
          </Chip>
        ))}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.content}>
          {/* Search Bar */}
          <Searchbar
            placeholder="Search motivational posts..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />

          {/* Category Filter */}
          {renderCategoryFilter()}

          {/* Daily Quote */}
          {renderMotivationalQuote()}

          {/* Trending Tags */}
          {renderTrendingHashtags()}

          {/* Posts Feed */}
          <View style={styles.postsContainer}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              📱 Community Feed
            </Text>
            {mockMotivationalPosts.map((post, index) => renderPostCard(post, index))}
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="edit"
        style={styles.fab}
        color={COLORS.surface}
        onPress={handleCreatePost}
        label="Post"
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    color: COLORS.surface,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: COLORS.surface,
    textAlign: 'center',
    opacity: 0.9,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: SPACING.md,
  },
  categoryScroll: {
    paddingVertical: SPACING.xs,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    elevation: 1,
    gap: SPACING.xs,
  },
  selectedCategoryButton: {
    elevation: 3,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  selectedCategoryButtonText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  quoteCard: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 3,
  },
  quoteGradient: {
    padding: SPACING.lg,
  },
  quoteContent: {
    alignItems: 'center',
  },
  quoteText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: SPACING.md,
    lineHeight: 24,
  },
  quoteAuthor: {
    color: COLORS.surface,
    fontSize: 14,
    opacity: 0.9,
  },
  trendingCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  trendingTag: {
    backgroundColor: `${COLORS.primary}15`,
  },
  postsContainer: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  postCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    backgroundColor: COLORS.surface,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  authorRole: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  postTypeContainer: {
    alignSelf: 'flex-start',
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  postContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  postText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  expandButton: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  expandButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  postImageContainer: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  tagChip: {
    backgroundColor: `${COLORS.primary}10`,
    height: 24,
  },
  moreTagsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginLeft: SPACING.xs,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 20,
    backgroundColor: `${COLORS.textSecondary}05`,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  likedText: {
    color: COLORS.like,
  },
  saveButton: {
    padding: SPACING.xs,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}10`,
  },
  divider: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  engagementStats: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  engagementText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
});

// Add the export statement at the end of your file:
export default MotivationalPosts;
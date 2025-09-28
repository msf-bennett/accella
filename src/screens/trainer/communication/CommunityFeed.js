import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  Vibration,
  Text,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  FAB,
  Surface,
  IconButton,
  Searchbar,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const CommunityFeed = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isConnected } = useSelector(state => state.auth);
  const { communityFeed, loading } = useSelector(state => state.community);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPostType, setSelectedPostType] = useState('update');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for demonstration
  const [feedData] = useState([
    {
      id: '1',
      type: 'achievement',
      author: {
        name: 'Sarah Johnson',
        role: 'Fitness Trainer',
        avatar: 'https://via.placeholder.com/50',
        level: 15,
        verified: true,
      },
      content: 'Just helped my client Mark complete his first marathon! 🏃‍♂️ From couch to 26.2 miles in 6 months. The dedication pays off! #MarathonTraining #Success',
      timestamp: '2h ago',
      likes: 45,
      comments: 12,
      shares: 8,
      media: 'https://via.placeholder.com/300x200',
      tags: ['marathon', 'success', 'endurance'],
      achievements: ['Marathon Mentor', 'Client Success'],
    },
    {
      id: '2',
      type: 'tip',
      author: {
        name: 'Mike Chen',
        role: 'Strength Coach',
        avatar: 'https://via.placeholder.com/50',
        level: 22,
        verified: true,
      },
      content: 'Quick form tip: When deadlifting, think about pushing the floor away rather than pulling the bar up. This mental cue helps maintain proper hip hinge mechanics! 💪',
      timestamp: '4h ago',
      likes: 78,
      comments: 23,
      shares: 15,
      tags: ['deadlift', 'form', 'technique'],
      tipCategory: 'Strength Training',
    },
    {
      id: '3',
      type: 'question',
      author: {
        name: 'Emma Rodriguez',
        role: 'Yoga Instructor',
        avatar: 'https://via.placeholder.com/50',
        level: 8,
        verified: false,
      },
      content: 'Fellow trainers: How do you handle clients who consistently show up late? Looking for strategies that maintain professionalism while addressing the issue. 🤔',
      timestamp: '6h ago',
      likes: 34,
      comments: 29,
      shares: 5,
      tags: ['coaching', 'professionalism', 'advice'],
      answers: 12,
    },
    {
      id: '4',
      type: 'event',
      author: {
        name: 'FitLife Academy',
        role: 'Training Center',
        avatar: 'https://via.placeholder.com/50',
        level: 0,
        verified: true,
      },
      content: 'Join us for the Advanced HIIT Certification Workshop this Saturday! Learn cutting-edge interval training techniques from industry experts. Limited spots available! 🔥',
      timestamp: '8h ago',
      likes: 156,
      comments: 42,
      shares: 38,
      eventDate: 'Sat, Aug 24',
      eventLocation: 'Nairobi Sports Center',
      tags: ['hiit', 'certification', 'workshop'],
    },
  ]);

  const filters = [
    { key: 'all', label: 'All Posts', icon: 'dynamic-feed' },
    { key: 'tips', label: 'Tips', icon: 'lightbulb' },
    { key: 'achievements', label: 'Wins', icon: 'jump-rope' },
    { key: 'questions', label: 'Q&A', icon: 'help' },
    { key: 'events', label: 'Events', icon: 'event' },
  ];

  const postTypes = [
    { key: 'update', label: 'Update', icon: 'update', color: COLORS.primary },
    { key: 'tip', label: 'Training Tip', icon: 'lightbulb', color: COLORS.success },
    { key: 'achievement', label: 'Achievement', icon: 'jump-rope', color: '#FFD700' },
    { key: 'question', label: 'Question', icon: 'help', color: COLORS.secondary },
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
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchCommunityFeed());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh feed. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLike = useCallback((postId) => {
    Vibration.vibrate(50);
    // dispatch(likePost(postId));
    Alert.alert('Feature Coming Soon', 'Like functionality will be available in the next update! 👍');
  }, []);

  const handleComment = useCallback((postId) => {
    navigation.navigate('PostComments', { postId });
  }, [navigation]);

  const handleShare = useCallback((postId) => {
    Alert.alert('Feature Coming Soon', 'Share functionality will be available in the next update! 📤');
  }, []);

  const handleCreatePost = useCallback(() => {
    if (!newPostContent.trim()) {
      Alert.alert('Content Required', 'Please enter some content for your post.');
      return;
    }

    Vibration.vibrate(100);
    // dispatch(createPost({ content: newPostContent, type: selectedPostType }));
    setNewPostContent('');
    setShowCreatePost(false);
    Alert.alert('Success! 🎉', 'Your post has been shared with the community!');
  }, [newPostContent, selectedPostType]);

  const filteredFeed = feedData.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || post.type === activeFilter || 
                         (activeFilter === 'tips' && post.type === 'tip') ||
                         (activeFilter === 'achievements' && post.type === 'achievement') ||
                         (activeFilter === 'questions' && post.type === 'question') ||
                         (activeFilter === 'events' && post.type === 'event');
    return matchesSearch && matchesFilter;
  });

  const renderPostCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <Card style={{ 
        marginHorizontal: SPACING.md, 
        elevation: 3,
        backgroundColor: '#fff',
      }}>
        {/* Post Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: SPACING.md,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        }}>
          <Avatar.Image 
            size={50} 
            source={{ uri: item.author.avatar }}
            style={{ backgroundColor: COLORS.primary }}
          />
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.subtitle, { fontWeight: '600' }]}>
                {item.author.name}
              </Text>
              {item.author.verified && (
                <Icon name="verified" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
              )}
              {item.author.level > 0 && (
                <Chip
                  mode="outlined"
                  compact
                  style={{ 
                    marginLeft: SPACING.xs,
                    height: 24,
                    backgroundColor: COLORS.primary + '20',
                  }}
                  textStyle={{ fontSize: 10, color: COLORS.primary }}
                >
                  Lv.{item.author.level}
                </Chip>
              )}
            </View>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {item.author.role} • {item.timestamp}
            </Text>
          </View>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => Alert.alert('Feature Coming Soon', 'Post options will be available soon!')}
          />
        </View>

        {/* Post Content */}
        <View style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.body, { lineHeight: 22, marginBottom: SPACING.sm }]}>
            {item.content}
          </Text>

          {/* Tags */}
          {item.tags && (
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              marginBottom: SPACING.sm 
            }}>
              {item.tags.map((tag, tagIndex) => (
                <Chip
                  key={tagIndex}
                  mode="outlined"
                  compact
                  style={{ 
                    marginRight: SPACING.xs,
                    marginBottom: SPACING.xs,
                    backgroundColor: COLORS.background,
                  }}
                  textStyle={{ fontSize: 12 }}
                >
                  #{tag}
                </Chip>
              ))}
            </View>
          )}

          {/* Media */}
          {item.media && (
            <Image
              source={{ uri: item.media }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 8,
                marginBottom: SPACING.sm,
              }}
              resizeMode="cover"
            />
          )}

          {/* Achievements */}
          {item.achievements && (
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              marginBottom: SPACING.sm 
            }}>
              {item.achievements.map((achievement, achIndex) => (
                <Surface
                  key={achIndex}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: SPACING.sm,
                    paddingVertical: SPACING.xs,
                    borderRadius: 16,
                    marginRight: SPACING.xs,
                    marginBottom: SPACING.xs,
                    backgroundColor: '#FFD700' + '20',
                  }}
                >
                  <Icon name="jump-rope" size={16} color="#FFD700" />
                  <Text style={[TEXT_STYLES.caption, { 
                    marginLeft: 4, 
                    color: '#B8860B',
                    fontWeight: '600' 
                  }]}>
                    {achievement}
                  </Text>
                </Surface>
              ))}
            </View>
          )}

          {/* Event Details */}
          {item.type === 'event' && (
            <Surface style={{
              padding: SPACING.sm,
              borderRadius: 8,
              backgroundColor: COLORS.primary + '10',
              marginBottom: SPACING.sm,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="event" size={20} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, { 
                  marginLeft: SPACING.xs,
                  color: COLORS.primary,
                  fontWeight: '600'
                }]}>
                  {item.eventDate} • {item.eventLocation}
                </Text>
              </View>
            </Surface>
          )}
        </View>

        {/* Post Actions */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.md,
          paddingBottom: SPACING.md,
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingTop: SPACING.sm,
        }}>
          <TouchableOpacity
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              flex: 1,
              paddingVertical: SPACING.xs,
            }}
            onPress={() => handleLike(item.id)}
          >
            <Icon name="favorite-border" size={20} color={COLORS.error} />
            <Text style={[TEXT_STYLES.caption, { 
              marginLeft: 4, 
              color: COLORS.textSecondary 
            }]}>
              {item.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              flex: 1,
              paddingVertical: SPACING.xs,
            }}
            onPress={() => handleComment(item.id)}
          >
            <Icon name="chat-bubble-outline" size={20} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.caption, { 
              marginLeft: 4, 
              color: COLORS.textSecondary 
            }]}>
              {item.comments || item.answers || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              flex: 1,
              paddingVertical: SPACING.xs,
            }}
            onPress={() => handleShare(item.id)}
          >
            <Icon name="share" size={20} color={COLORS.secondary} />
            <Text style={[TEXT_STYLES.caption, { 
              marginLeft: 4, 
              color: COLORS.textSecondary 
            }]}>
              {item.shares}
            </Text>
          </TouchableOpacity>

          <IconButton
            icon="bookmark-border"
            size={20}
            onPress={() => Alert.alert('Feature Coming Soon', 'Save functionality will be available soon!')}
          />
        </View>
      </Card>
    </Animated.View>
  );

  const renderCreatePostModal = () => (
    <Modal
      visible={showCreatePost}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCreatePost(false)}
    >
      <BlurView style={{ flex: 1 }} blurType="dark" blurAmount={10}>
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          <Surface style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: SPACING.lg,
            maxHeight: '80%',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: SPACING.lg,
            }}>
              <Text style={[TEXT_STYLES.h3, { flex: 1 }]}>Create Post</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowCreatePost(false)}
              />
            </View>

            {/* Post Type Selection */}
            <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
              Post Type
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: SPACING.lg }}
            >
              {postTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  onPress={() => setSelectedPostType(type.key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.sm,
                    borderRadius: 20,
                    marginRight: SPACING.sm,
                    backgroundColor: selectedPostType === type.key ? type.color + '20' : '#f5f5f5',
                    borderWidth: selectedPostType === type.key ? 2 : 0,
                    borderColor: selectedPostType === type.key ? type.color : 'transparent',
                  }}
                >
                  <Icon 
                    name={type.icon} 
                    size={18} 
                    color={selectedPostType === type.key ? type.color : COLORS.textSecondary} 
                  />
                  <Text style={[TEXT_STYLES.caption, {
                    marginLeft: 4,
                    color: selectedPostType === type.key ? type.color : COLORS.textSecondary,
                    fontWeight: selectedPostType === type.key ? '600' : 'normal',
                  }]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Content Input */}
            <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
              What's on your mind?
            </Text>
            <TextInput
              multiline
              placeholder="Share your thoughts, tips, or achievements with the community..."
              value={newPostContent}
              onChangeText={setNewPostContent}
              style={{
                borderWidth: 1,
                borderColor: '#e0e0e0',
                borderRadius: 12,
                padding: SPACING.md,
                minHeight: 120,
                textAlignVertical: 'top',
                fontSize: 16,
                marginBottom: SPACING.lg,
              }}
            />

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="outlined"
                onPress={() => setShowCreatePost(false)}
                style={{ flex: 0.45 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreatePost}
                style={{ 
                  flex: 0.45,
                  backgroundColor: COLORS.primary,
                }}
                disabled={!newPostContent.trim()}
              >
                Share Post
              </Button>
            </View>
          </Surface>
        </View>
      </BlurView>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingBottom: SPACING.md,
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.md,
          marginBottom: SPACING.md,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: '#fff', fontWeight: 'bold' }]}>
              Community Feed 🌟
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: '#fff', opacity: 0.9 }]}>
              Connect, Share, and Grow Together
            </Text>
          </View>
          <Surface style={{
            borderRadius: 20,
            padding: SPACING.xs,
            backgroundColor: 'rgba(255,255,255,0.2)',
          }}>
            <Icon name="people" size={24} color="#fff" />
          </Surface>
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: SPACING.md }}>
          <Searchbar
            placeholder="Search posts, trainers, tips..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              elevation: 0,
            }}
            inputStyle={{ fontSize: 14 }}
            iconColor={COLORS.primary}
          />
        </View>
      </LinearGradient>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ 
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        }}
        contentContainerStyle={{ 
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
        }}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setActiveFilter(filter.key)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
              marginRight: SPACING.sm,
              backgroundColor: activeFilter === filter.key ? COLORS.primary : '#f5f5f5',
            }}
          >
            <Icon 
              name={filter.icon} 
              size={16} 
              color={activeFilter === filter.key ? '#fff' : COLORS.textSecondary} 
            />
            <Text style={[TEXT_STYLES.caption, {
              marginLeft: 4,
              color: activeFilter === filter.key ? '#fff' : COLORS.textSecondary,
              fontWeight: activeFilter === filter.key ? '600' : 'normal',
            }]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Community Stats */}
      <Surface style={{
        margin: SPACING.md,
        padding: SPACING.md,
        borderRadius: 12,
        elevation: 2,
        backgroundColor: '#fff',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, fontWeight: 'bold' }]}>
              2.4K
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Active Trainers
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.success, fontWeight: 'bold' }]}>
              156
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Posts Today
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.secondary, fontWeight: 'bold' }]}>
              89%
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Engagement
            </Text>
          </View>
        </View>
      </Surface>

      {/* Feed Content */}
      <ScrollView
        style={{ flex: 1 }}
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
        {loading ? (
          <View style={{ padding: SPACING.lg }}>
            {[1, 2, 3].map((item) => (
              <Card key={item} style={{ 
                marginHorizontal: SPACING.md, 
                marginBottom: SPACING.md,
                padding: SPACING.md,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                  <Surface style={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: 25,
                    backgroundColor: '#f0f0f0' 
                  }} />
                  <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                    <Surface style={{ 
                      height: 16, 
                      borderRadius: 8,
                      backgroundColor: '#f0f0f0',
                      marginBottom: 4,
                      width: '60%',
                    }} />
                    <Surface style={{ 
                      height: 12, 
                      borderRadius: 6,
                      backgroundColor: '#f5f5f5',
                      width: '40%',
                    }} />
                  </View>
                </View>
                <Surface style={{ 
                  height: 80, 
                  borderRadius: 8,
                  backgroundColor: '#f0f0f0',
                  marginBottom: SPACING.sm,
                }} />
                <ProgressBar progress={0.3} color={COLORS.primary} style={{ opacity: 0.5 }} />
              </Card>
            ))}
          </View>
        ) : filteredFeed.length > 0 ? (
          <View style={{ paddingBottom: 100 }}>
            {filteredFeed.map((item, index) => renderPostCard({ item, index }))}
          </View>
        ) : (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: SPACING.xl,
          }}>
            <Icon name="forum" size={80} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { 
              marginTop: SPACING.md,
              marginBottom: SPACING.sm,
              color: COLORS.textSecondary,
            }]}>
              No Posts Yet
            </Text>
            <Text style={[TEXT_STYLES.body, { 
              textAlign: 'center',
              color: COLORS.textSecondary,
              marginBottom: SPACING.lg,
            }]}>
              Be the first to share something with the community!
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowCreatePost(true)}
              style={{ backgroundColor: COLORS.primary }}
              icon="add"
            >
              Create First Post
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 80,
          backgroundColor: COLORS.primary,
        }}
        icon="add"
        onPress={() => setShowCreatePost(true)}
        label="Post"
        visible={!showCreatePost}
      />

      {/* Create Post Modal */}
      {renderCreatePostModal()}

      {/* Quick Action Buttons */}
      <Surface style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: SPACING.sm,
          }}
          onPress={() => navigation.navigate('TrendingTopics')}
        >
          <Icon name="trending-up" size={20} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.caption, { 
            marginLeft: 4, 
            color: COLORS.primary,
            fontWeight: '600',
          }]}>
            Trending
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: SPACING.sm,
          }}
          onPress={() => navigation.navigate('TrainerDirectory')}
        >
          <Icon name="people" size={20} color={COLORS.secondary} />
          <Text style={[TEXT_STYLES.caption, { 
            marginLeft: 4, 
            color: COLORS.secondary,
            fontWeight: '600',
          }]}>
            Trainers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: SPACING.sm,
          }}
          onPress={() => navigation.navigate('Events')}
        >
          <Icon name="event" size={20} color={COLORS.success} />
          <Text style={[TEXT_STYLES.caption, { 
            marginLeft: 4, 
            color: COLORS.success,
            fontWeight: '600',
          }]}>
            Events
          </Text>
        </TouchableOpacity>
      </Surface>
    </View>
  );
};

export default CommunityFeed;
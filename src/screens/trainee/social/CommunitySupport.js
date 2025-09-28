import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
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
  Portal,
  Modal,
  ProgressBar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
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
  accent: '#FF6B6B',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  bodySmall: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const CommunitySupport = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('forum');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data - replace with Redux state
  const [forumPosts, setForumPosts] = useState([
    {
      id: 1,
      author: 'Sarah M.',
      avatar: 'https://picsum.photos/100/100?random=1',
      title: 'Anyone else struggling with early morning workouts? 🌅',
      content: 'I\'ve been trying to switch to morning workouts but I\'m finding it so hard to get motivated. Any tips?',
      category: 'motivation',
      likes: 23,
      replies: 8,
      timeAgo: '2h ago',
      liked: false,
    },
    {
      id: 2,
      author: 'Mike R.',
      avatar: 'https://picsum.photos/100/100?random=2',
      title: 'Nutrition question: Pre-workout meals 🍌',
      content: 'What do you all eat before your workouts? Looking for something that gives energy but doesn\'t make me feel heavy.',
      category: 'nutrition',
      likes: 15,
      replies: 12,
      timeAgo: '4h ago',
      liked: true,
    },
    {
      id: 3,
      author: 'Emma K.',
      avatar: 'https://picsum.photos/100/100?random=3',
      title: 'Celebration post! 🎉 Finally hit my goal weight!',
      content: 'After 6 months of consistent training and community support, I\'ve reached my target! Thank you all for the motivation!',
      category: 'success',
      likes: 45,
      replies: 18,
      timeAgo: '6h ago',
      liked: true,
    },
  ]);

  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: '30-Day Plank Challenge',
      description: 'Build core strength with daily planks',
      participants: 234,
      daysLeft: 18,
      progress: 0.6,
      joined: true,
      emoji: '💪',
    },
    {
      id: 2,
      title: 'Hydration Hero',
      description: 'Drink 8 glasses of water daily',
      participants: 156,
      daysLeft: 7,
      progress: 0.8,
      joined: false,
      emoji: '💧',
    },
    {
      id: 3,
      title: 'Step It Up',
      description: '10,000 steps every day for 21 days',
      participants: 312,
      daysLeft: 25,
      progress: 0.4,
      joined: true,
      emoji: '👟',
    },
  ]);

  const [motivationalPosts, setMotivationalPosts] = useState([
    {
      id: 1,
      type: 'quote',
      content: 'The only bad workout is the one that didn\'t happen',
      author: 'Community Inspiration',
      likes: 89,
      shares: 23,
    },
    {
      id: 2,
      type: 'tip',
      content: 'Remember: Rest days are just as important as workout days. Your muscles grow during recovery! 🛌',
      author: 'Coach Alex',
      likes: 67,
      shares: 15,
    },
  ]);

  const categories = [
    { id: 'all', label: 'All', icon: 'forum', color: COLORS.primary },
    { id: 'motivation', label: 'Motivation', icon: 'favorite', color: COLORS.accent },
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant', color: COLORS.success },
    { id: 'success', label: 'Success', icon: 'celebration', color: COLORS.warning },
    { id: 'questions', label: 'Q&A', icon: 'help', color: COLORS.secondary },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
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
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleLike = (postId, type = 'forum') => {
    Vibration.vibrate(50);
    if (type === 'forum') {
      setForumPosts(posts => 
        posts.map(post => 
          post.id === postId 
            ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
            : post
        )
      );
    }
  };

  const handleJoinChallenge = (challengeId) => {
    Vibration.vibrate(100);
    setChallenges(challenges => 
      challenges.map(challenge => 
        challenge.id === challengeId 
          ? { 
              ...challenge, 
              joined: !challenge.joined,
              participants: challenge.joined ? challenge.participants - 1 : challenge.participants + 1 
            }
          : challenge
      )
    );
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }
    
    const newPost = {
      id: Date.now(),
      author: user?.name || 'You',
      avatar: user?.avatar || 'https://picsum.photos/100/100?random=user',
      title: newPostContent.split('\n')[0] || 'New Post',
      content: newPostContent,
      category: selectedCategory === 'all' ? 'general' : selectedCategory,
      likes: 0,
      replies: 0,
      timeAgo: 'now',
      liked: false,
    };

    setForumPosts(posts => [newPost, ...posts]);
    setNewPostContent('');
    setShowPostModal(false);
    Alert.alert('Success! 🎉', 'Your post has been shared with the community');
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        paddingTop: StatusBar.currentHeight + SPACING.lg,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text style={[TEXT_STYLES.h2, { color: 'white', marginBottom: SPACING.sm }]}>
          Community Support 🤝
        </Text>
        <Text style={[TEXT_STYLES.bodySmall, { color: 'rgba(255,255,255,0.8)' }]}>
          Connect, motivate, and grow together
        </Text>
      </Animated.View>
    </LinearGradient>
  );

  const renderTabBar = () => (
    <Surface style={{ elevation: 2, backgroundColor: 'white' }}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}
      >
        {[
          { id: 'forum', label: 'Forum', icon: 'forum' },
          { id: 'challenges', label: 'Challenges', icon: 'jump-rope' },
          { id: 'motivation', label: 'Daily Boost', icon: 'lightbulb' },
          { id: 'connect', label: 'Connect', icon: 'people' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              marginRight: SPACING.sm,
              borderRadius: 20,
              backgroundColor: activeTab === tab.id ? COLORS.primary : 'transparent',
            }}
          >
            <Icon 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.id ? 'white' : COLORS.textSecondary} 
            />
            <Text style={[
              TEXT_STYLES.bodySmall,
              { 
                marginLeft: SPACING.xs,
                color: activeTab === tab.id ? 'white' : COLORS.textSecondary,
                fontWeight: activeTab === tab.id ? '600' : 'normal',
              }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  const renderCategoryFilter = () => (
    <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            icon={() => <Icon name={category.icon} size={16} color={
              selectedCategory === category.id ? 'white' : category.color
            } />}
            style={{
              marginRight: SPACING.sm,
              backgroundColor: selectedCategory === category.id 
                ? category.color 
                : 'rgba(255,255,255,0.9)',
            }}
            textStyle={{
              color: selectedCategory === category.id ? 'white' : category.color,
              fontWeight: '600',
            }}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderForumPost = (post) => (
    <Card key={post.id} style={{ marginBottom: SPACING.md, elevation: 2 }}>
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
          <Avatar.Image size={40} source={{ uri: post.avatar }} />
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>{post.author}</Text>
            <Text style={TEXT_STYLES.caption}>{post.timeAgo}</Text>
          </View>
          <Chip
            compact
            style={{ backgroundColor: categories.find(c => c.id === post.category)?.color || COLORS.primary }}
            textStyle={{ color: 'white', fontSize: 10 }}
          >
            {post.category}
          </Chip>
        </View>
        
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.xs }]}>{post.title}</Text>
        <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>{post.content}</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => handleLike(post.id)}
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.md }}
            >
              <Icon 
                name={post.liked ? 'favorite' : 'favorite-border'} 
                size={20} 
                color={post.liked ? COLORS.accent : COLORS.textSecondary} 
              />
              <Text style={[TEXT_STYLES.bodySmall, { marginLeft: SPACING.xs }]}>{post.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Comments feature is under development')}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Icon name="chat-bubble-outline" size={20} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.bodySmall, { marginLeft: SPACING.xs }]}>{post.replies}</Text>
            </TouchableOpacity>
          </View>
          
          <IconButton
            icon="share"
            size={20}
            iconColor={COLORS.textSecondary}
            onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Share feature is under development')}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderChallenge = (challenge) => (
    <Card key={challenge.id} style={{ marginBottom: SPACING.md, elevation: 2 }}>
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
          <Text style={{ fontSize: 24, marginRight: SPACING.sm }}>{challenge.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.xs }]}>{challenge.title}</Text>
            <Text style={TEXT_STYLES.bodySmall}>{challenge.description}</Text>
          </View>
        </View>
        
        <View style={{ marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
            <Text style={TEXT_STYLES.bodySmall}>Progress</Text>
            <Text style={TEXT_STYLES.bodySmall}>{Math.round(challenge.progress * 100)}%</Text>
          </View>
          <ProgressBar 
            progress={challenge.progress} 
            color={COLORS.success}
            style={{ height: 6, borderRadius: 3 }}
          />
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={TEXT_STYLES.caption}>
              {challenge.participants} participants • {challenge.daysLeft} days left
            </Text>
          </View>
          <Button
            mode={challenge.joined ? "outlined" : "contained"}
            onPress={() => handleJoinChallenge(challenge.id)}
            style={{ borderColor: COLORS.primary }}
            buttonColor={challenge.joined ? 'transparent' : COLORS.primary}
          >
            {challenge.joined ? 'Joined ✓' : 'Join'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderMotivationalContent = () => (
    <View>
      {motivationalPosts.map((post) => (
        <Card key={post.id} style={{ marginBottom: SPACING.md, elevation: 2 }}>
          <LinearGradient
            colors={post.type === 'quote' ? [COLORS.accent, '#FF8E8E'] : [COLORS.success, '#66BB6A']}
            style={{ padding: SPACING.md }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Icon 
                name={post.type === 'quote' ? 'format-quote' : 'tips-and-updates'} 
                size={24} 
                color="white" 
              />
              <Text style={[TEXT_STYLES.bodySmall, { color: 'white', marginLeft: SPACING.sm }]}>
                {post.type === 'quote' ? 'Daily Quote' : 'Pro Tip'}
              </Text>
            </View>
            <Text style={[TEXT_STYLES.body, { color: 'white', marginBottom: SPACING.sm, fontStyle: 'italic' }]}>
              {post.content}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              - {post.author}
            </Text>
          </LinearGradient>
          <Card.Actions>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: SPACING.sm }}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.md }}>
                <Icon name="favorite-border" size={20} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.bodySmall, { marginLeft: SPACING.xs }]}>{post.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="share" size={20} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.bodySmall, { marginLeft: SPACING.xs }]}>{post.shares}</Text>
              </TouchableOpacity>
            </View>
          </Card.Actions>
        </Card>
      ))}
    </View>
  );

  const renderConnectContent = () => (
    <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
      <Card.Content style={{ padding: SPACING.md, alignItems: 'center' }}>
        <Icon name="people" size={80} color={COLORS.primary} />
        <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginVertical: SPACING.md }]}>
          Find Your Workout Buddy! 👫
        </Text>
        <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginBottom: SPACING.lg }]}>
          Connect with other trainees in your area, join workout groups, and find accountability partners.
        </Text>
        <Button
          mode="contained"
          onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'User connection feature is under development')}
          style={{ backgroundColor: COLORS.primary }}
        >
          Start Connecting
        </Button>
      </Card.Content>
    </Card>
  );

  const renderContent = () => {
    const filteredPosts = selectedCategory === 'all' 
      ? forumPosts 
      : forumPosts.filter(post => post.category === selectedCategory);

    switch (activeTab) {
      case 'forum':
        return (
          <View>
            {renderCategoryFilter()}
            <View style={{ paddingHorizontal: SPACING.md }}>
              {filteredPosts.map(renderForumPost)}
            </View>
          </View>
        );
      case 'challenges':
        return (
          <View style={{ paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
            {challenges.map(renderChallenge)}
          </View>
        );
      case 'motivation':
        return (
          <View style={{ paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
            {renderMotivationalContent()}
          </View>
        );
      case 'connect':
        return (
          <View style={{ paddingHorizontal: SPACING.md, paddingTop: SPACING.md }}>
            {renderConnectContent()}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {renderHeader()}
      {renderTabBar()}
      
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {activeTab === 'forum' && (
          <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
            <Searchbar
              placeholder="Search discussions..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{ elevation: 2 }}
              iconColor={COLORS.primary}
            />
          </View>
        )}
        
        <ScrollView
          style={{ flex: 1 }}
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
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {activeTab === 'forum' && (
        <FAB
          icon="add"
          style={{
            position: 'absolute',
            margin: SPACING.md,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.primary,
          }}
          onPress={() => setShowPostModal(true)}
        />
      )}

      <Portal>
        <Modal
          visible={showPostModal}
          onDismiss={() => setShowPostModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.lg,
            borderRadius: 12,
            padding: SPACING.lg,
            maxHeight: '80%',
          }}
        >
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Share with Community 📝
          </Text>
          <Searchbar
            placeholder="What's on your mind? Share your thoughts, ask questions, or celebrate achievements..."
            value={newPostContent}
            onChangeText={setNewPostContent}
            multiline
            style={{ marginBottom: SPACING.md, minHeight: 120 }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button onPress={() => setShowPostModal(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleCreatePost}
              style={{ backgroundColor: COLORS.primary }}
            >
              Post
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default CommunitySupport;
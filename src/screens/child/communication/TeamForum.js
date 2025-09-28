import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Vibration,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Avatar,
  IconButton,
  Searchbar,
  FAB,
  Surface,
  Badge,
  Button,
  Portal,
  Modal,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const TeamForum = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { forumTopics, categories } = useSelector(state => state.communication);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    loadForumTopics();
    animateEntrance();
  }, []);

  const animateEntrance = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadForumTopics = useCallback(async () => {
    try {
      // Mock forum topics - replace with actual API call
      const mockTopics = [
        {
          id: '1',
          title: 'Tips for Better Ball Control? ⚽',
          content: 'Hey everyone! I\'ve been practicing but still struggle with keeping the ball close. Any tips from the team?',
          author: 'Alex',
          authorId: 'player1',
          authorAvatar: 'https://example.com/player1.jpg',
          authorLevel: 'Rising Star',
          category: 'training',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          replies: 12,
          likes: 8,
          isSticky: false,
          isLocked: false,
          hasCoachReply: true,
          tags: ['ball-control', 'practice', 'tips'],
          lastReplyBy: 'Coach Sarah',
          lastReplyTime: new Date(Date.now() - 1800000), // 30 min ago
          viewCount: 45,
        },
        {
          id: '2',
          title: 'Great Game Yesterday! 🏆',
          content: 'I just wanted to say how proud I am of our team performance! Everyone played their hearts out! Special mention to Jordan for that amazing save! 🥅',
          author: 'Coach Sarah',
          authorId: 'coach1',
          authorAvatar: 'https://example.com/coach.jpg',
          authorLevel: 'Coach',
          category: 'celebration',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          replies: 23,
          likes: 18,
          isSticky: true,
          isLocked: false,
          hasCoachReply: false,
          tags: ['game', 'celebration', 'teamwork'],
          lastReplyBy: 'Sam',
          lastReplyTime: new Date(Date.now() - 3600000), // 1 hour ago
          viewCount: 89,
        },
        {
          id: '3',
          title: 'Pre-Game Snack Ideas? 🍎',
          content: 'What do you all eat before games? My mom wants to know what gives everyone energy without making us feel too full!',
          author: 'Jordan',
          authorId: 'player2',
          authorAvatar: 'https://example.com/player2.jpg',
          authorLevel: 'Team Player',
          category: 'nutrition',
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
          replies: 15,
          likes: 11,
          isSticky: false,
          isLocked: false,
          hasCoachReply: true,
          tags: ['nutrition', 'pre-game', 'energy'],
          lastReplyBy: 'Team Nutritionist',
          lastReplyTime: new Date(Date.now() - 7200000), // 2 hours ago
          viewCount: 67,
        },
        {
          id: '4',
          title: 'Equipment Check - What Do We Need? ⚽',
          content: 'Tournament season is coming up! Let\'s make sure everyone has what they need. What equipment should we double-check?',
          author: 'Team Manager',
          authorId: 'manager1',
          authorAvatar: 'https://example.com/manager.jpg',
          authorLevel: 'Team Staff',
          category: 'equipment',
          timestamp: new Date(Date.now() - 259200000), // 3 days ago
          replies: 8,
          likes: 6,
          isSticky: false,
          isLocked: false,
          hasCoachReply: true,
          tags: ['equipment', 'tournament', 'preparation'],
          lastReplyBy: 'Alex',
          lastReplyTime: new Date(Date.now() - 10800000), // 3 hours ago
          viewCount: 34,
        },
        {
          id: '5',
          title: 'Fun Team Building Ideas? 🎉',
          content: 'What are some fun activities we could do as a team outside of practice? Looking for ideas to bond more!',
          author: 'Sam',
          authorId: 'player3',
          authorAvatar: 'https://example.com/player3.jpg',
          authorLevel: 'Social Star',
          category: 'team-bonding',
          timestamp: new Date(Date.now() - 345600000), // 4 days ago
          replies: 19,
          likes: 14,
          isSticky: false,
          isLocked: false,
          hasCoachReply: true,
          tags: ['team-bonding', 'fun', 'activities'],
          lastReplyBy: 'Coach Mike',
          lastReplyTime: new Date(Date.now() - 14400000), // 4 hours ago
          viewCount: 78,
        }
      ];
      
      // Dispatch to Redux store
      // dispatch(setForumTopics(mockTopics));
    } catch (error) {
      Alert.alert('Oops! 🤔', 'Couldn\'t load forum topics right now. Please try again!');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadForumTopics();
    setRefreshing(false);
  }, [loadForumTopics]);

  const handleTopicPress = (topic) => {
    Vibration.vibrate(50);
    navigation.navigate('ForumTopicDetail', { topic });
  };

  const handleLikeTopic = (topicId) => {
    Vibration.vibrate(30);
    // dispatch(likeTopic(topicId, user.id));
  };

  const getCategoryIcon = (category) => {
    const icons = {
      training: 'fitness-center',
      celebration: 'celebration',
      nutrition: 'restaurant',
      equipment: 'sports-soccer',
      'team-bonding': 'group',
      general: 'forum',
      questions: 'help',
    };
    return icons[category] || 'forum';
  };

  const getCategoryColor = (category) => {
    const colors = {
      training: COLORS.primary,
      celebration: COLORS.success,
      nutrition: '#FF9800',
      equipment: '#9C27B0',
      'team-bonding': '#E91E63',
      general: COLORS.secondary,
      questions: '#00BCD4',
    };
    return colors[category] || COLORS.secondary;
  };

  const getAuthorLevelColor = (level) => {
    const colors = {
      'Coach': COLORS.primary,
      'Team Staff': COLORS.success,
      'Rising Star': '#FF9800',
      'Team Player': '#2196F3',
      'Social Star': '#E91E63',
      'Rookie': '#9E9E9E',
    };
    return colors[level] || COLORS.secondary;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - new Date(timestamp);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredAndSortedTopics = (forumTopics || [
    // Mock data for display
    {
      id: '1',
      title: 'Tips for Better Ball Control? ⚽',
      content: 'Hey everyone! I\'ve been practicing but still struggle with keeping the ball close. Any tips from the team?',
      author: 'Alex',
      authorLevel: 'Rising Star',
      category: 'training',
      timestamp: new Date(Date.now() - 3600000),
      replies: 12,
      likes: 8,
      hasCoachReply: true,
      lastReplyBy: 'Coach Sarah',
      lastReplyTime: new Date(Date.now() - 1800000),
      viewCount: 45,
    }
  ])
    .filter(topic => {
      const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           topic.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastReplyTime || b.timestamp) - new Date(a.lastReplyTime || a.timestamp);
        case 'popular':
          return (b.replies + b.likes) - (a.replies + a.likes);
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        default:
          return 0;
      }
    });

  const CategoryChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      style={{ marginBottom: SPACING.md }}
    >
      {[
        { key: 'all', label: 'All Topics 📋', icon: 'forum' },
        { key: 'training', label: 'Training 💪', icon: 'fitness-center' },
        { key: 'celebration', label: 'Celebrate 🎉', icon: 'celebration' },
        { key: 'nutrition', label: 'Nutrition 🍎', icon: 'restaurant' },
        { key: 'equipment', label: 'Equipment ⚽', icon: 'sports-soccer' },
        { key: 'team-bonding', label: 'Team Fun 🤝', icon: 'group' },
        { key: 'questions', label: 'Questions ❓', icon: 'help' },
      ].map(category => (
        <Chip
          key={category.key}
          selected={selectedCategory === category.key}
          onPress={() => setSelectedCategory(category.key)}
          icon={category.icon}
          style={{
            marginRight: SPACING.sm,
            backgroundColor: selectedCategory === category.key ? 
              getCategoryColor(category.key) : COLORS.background,
          }}
          textStyle={{
            color: selectedCategory === category.key ? 'white' : COLORS.text,
            fontSize: 12,
          }}
        >
          {category.label}
        </Chip>
      ))}
    </ScrollView>
  );

  const SortOptions = () => (
    <View style={{ 
      flexDirection: 'row', 
      paddingHorizontal: SPACING.md, 
      marginBottom: SPACING.md,
      alignItems: 'center',
    }}>
      <Icon name="sort" size={16} color={COLORS.secondary} />
      <Paragraph style={[TEXT_STYLES.caption, { marginLeft: 4, marginRight: SPACING.md }]}>
        Sort by:
      </Paragraph>
      {['recent', 'popular', 'oldest'].map(option => (
        <Chip
          key={option}
          compact
          selected={sortBy === option}
          onPress={() => setSortBy(option)}
          style={{
            marginRight: SPACING.sm,
            height: 28,
            backgroundColor: sortBy === option ? COLORS.primary : COLORS.surface,
          }}
          textStyle={{
            color: sortBy === option ? 'white' : COLORS.text,
            fontSize: 11,
            textTransform: 'capitalize',
          }}
        >
          {option}
        </Chip>
      ))}
    </View>
  );

  const TopicCard = ({ topic, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30 * (index + 1), 0],
          })
        }]
      }}
    >
      <Card
        style={{
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          elevation: topic.isSticky ? 6 : 3,
          borderLeftWidth: topic.isSticky ? 4 : 0,
          borderLeftColor: topic.isSticky ? COLORS.primary : 'transparent',
        }}
        onPress={() => handleTopicPress(topic)}
      >
        <Card.Content>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
            <Avatar.Image 
              size={36} 
              source={{ uri: topic.authorAvatar || 'https://via.placeholder.com/36' }}
              style={{ marginRight: SPACING.sm }}
            />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                <Paragraph style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>
                  {topic.author}
                </Paragraph>
                <Chip
                  compact
                  style={{
                    marginLeft: SPACING.sm,
                    height: 20,
                    backgroundColor: getAuthorLevelColor(topic.authorLevel) + '20',
                  }}
                  textStyle={{
                    color: getAuthorLevelColor(topic.authorLevel),
                    fontSize: 9,
                  }}
                >
                  {topic.authorLevel}
                </Chip>
                {topic.isSticky && (
                  <Icon name="push-pin" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                )}
              </View>
              <Paragraph style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                {formatTimeAgo(topic.timestamp)}
              </Paragraph>
            </View>
            
            <Chip
              compact
              icon={getCategoryIcon(topic.category)}
              style={{
                backgroundColor: getCategoryColor(topic.category) + '20',
                height: 24,
              }}
              textStyle={{
                color: getCategoryColor(topic.category),
                fontSize: 10,
              }}
            >
              {topic.category.replace('-', ' ')}
            </Chip>
          </View>

          {/* Title */}
          <Title style={[TEXT_STYLES.h3, { fontSize: 16, marginBottom: SPACING.sm, lineHeight: 22 }]}>
            {topic.title}
          </Title>

          {/* Content Preview */}
          <Paragraph style={[TEXT_STYLES.body, { 
            marginBottom: SPACING.md, 
            lineHeight: 20,
            color: COLORS.text + 'DD'
          }]}>
            {topic.content.length > 120 
              ? `${topic.content.substring(0, 120)}...` 
              : topic.content}
          </Paragraph>

          {/* Tags */}
          {topic.tags && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
              {topic.tags.slice(0, 3).map(tag => (
                <Surface
                  key={tag}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                    backgroundColor: COLORS.background,
                    marginRight: SPACING.sm,
                    marginBottom: 4,
                  }}
                >
                  <Paragraph style={{ fontSize: 10, color: COLORS.secondary }}>
                    #{tag}
                  </Paragraph>
                </Surface>
              ))}
            </View>
          )}

          {/* Stats */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => handleLikeTopic(topic.id)}
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.lg }}
              >
                <Icon name="thumb-up" size={16} color={COLORS.primary} />
                <Paragraph style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                  {topic.likes}
                </Paragraph>
              </TouchableOpacity>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.lg }}>
                <Icon name="comment" size={16} color={COLORS.secondary} />
                <Paragraph style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                  {topic.replies}
                </Paragraph>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="visibility" size={16} color={COLORS.secondary} />
                <Paragraph style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                  {topic.viewCount}
                </Paragraph>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              {topic.hasCoachReply && (
                <Surface style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8,
                  backgroundColor: COLORS.success + '20',
                  marginBottom: 2,
                }}>
                  <Icon name="verified" size={12} color={COLORS.success} />
                  <Paragraph style={{ 
                    fontSize: 9, 
                    color: COLORS.success, 
                    marginLeft: 2,
                    fontWeight: 'bold'
                  }}>
                    Coach Replied
                  </Paragraph>
                </Surface>
              )}
              
              {topic.lastReplyBy && (
                <Paragraph style={[TEXT_STYLES.caption, { fontSize: 10, color: COLORS.secondary }]}>
                  Last: {topic.lastReplyBy}
                </Paragraph>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const EmptyState = () => (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xl * 2,
    }}>
      <Icon name="forum" size={80} color={COLORS.secondary} />
      <Title style={[TEXT_STYLES.h2, { textAlign: 'center', marginTop: SPACING.lg }]}>
        No Topics Yet! 🤔
      </Title>
      <Paragraph style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm, marginBottom: SPACING.lg }]}>
        Be the first to start a discussion with your team! Share tips, ask questions, or celebrate wins together.
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => setShowNewTopicModal(true)}
        style={{ backgroundColor: COLORS.primary }}
      >
        Start First Topic! 🚀
      </Button>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: StatusBar.currentHeight + SPACING.lg, paddingBottom: SPACING.md }}
      >
        <View style={{ paddingHorizontal: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Title style={[TEXT_STYLES.h1, { color: 'white', marginBottom: 4 }]}>
                Team Forum 💭
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                Share ideas and connect! 🌟
              </Paragraph>
            </View>
            <Badge size={20} style={{ backgroundColor: COLORS.success }}>
              {filteredAndSortedTopics.length}
            </Badge>
          </View>
        </View>
      </LinearGradient>

      <Searchbar
        placeholder="Search topics, questions, tips... 🔍"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{
          margin: SPACING.md,
          elevation: 2,
        }}
        inputStyle={{ fontSize: 14 }}
        iconColor={COLORS.primary}
      />

      <CategoryChips />
      <SortOptions />

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
        {filteredAndSortedTopics.length > 0 ? (
          filteredAndSortedTopics.map((topic, index) => (
            <TopicCard key={topic.id} topic={topic} index={index} />
          ))
        ) : (
          <EmptyState />
        )}
        
        <View style={{ height: 80 }} />
      </ScrollView>

      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Coming Soon! 🚀', 'The ability to create new forum topics is coming soon!')}
      />
    </View>
  );
};

export default TeamForum;
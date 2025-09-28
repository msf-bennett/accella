import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Vibration,
  Dimensions,
  FlatList,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Badge,
  FAB,
  Searchbar,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const PeerSupport = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, team, peers } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('achievement');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchPeerPosts());
    } catch (error) {
      console.error('Error refreshing peer support:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleLikePost = (postId) => {
    Vibration.vibrate(30);
    // dispatch(likePost(postId));
  };

  const handleCheerPost = (postId) => {
    Vibration.vibrate([50, 50, 50]);
    // dispatch(cheerPost(postId));
  };

  const handleCommentPost = (postId) => {
    Vibration.vibrate(50);
    navigation.navigate('PostComments', { postId });
  };

  const handleCreatePost = () => {
    if (postText.trim()) {
      Vibration.vibrate(50);
      // dispatch(createPost({ text: postText, category: selectedCategory }));
      setPostText('');
      setShowPostModal(false);
      Alert.alert('🎉 Post Shared!', 'Your post has been shared with your teammates!');
    }
  };

  const handlePeerProfile = (peerId) => {
    Vibration.vibrate(50);
    navigation.navigate('PeerProfile', { peerId });
  };

  // Mock data for peer posts
  const mockPosts = [
    {
      id: '1',
      author: {
        name: 'Alex Chen',
        avatar: '🏃‍♂️',
        age: 12,
        sport: 'Track & Field',
      },
      category: 'achievement',
      content: 'Just ran my personal best in 100m sprint! 🏃‍♂️⚡ 14.2 seconds! Coach says I might make it to regionals! 🎯',
      timestamp: '2 hours ago',
      likes: 15,
      cheers: 8,
      comments: 3,
      hasLiked: false,
      hasCheered: true,
      achievements: ['🥇 Personal Best', '⚡ Speed Demon'],
    },
    {
      id: '2',
      author: {
        name: 'Maya Rodriguez',
        avatar: '⚽',
        age: 11,
        sport: 'Football',
      },
      category: 'support',
      content: 'Feeling nervous about tomorrow\'s big game 😰 Any tips from my teammates? This is my first time playing in front of so many people!',
      timestamp: '4 hours ago',
      likes: 12,
      cheers: 18,
      comments: 7,
      hasLiked: true,
      hasCheered: true,
      supportReplies: 7,
    },
    {
      id: '3',
      author: {
        name: 'Jordan Kim',
        avatar: '🏊‍♀️',
        age: 13,
        sport: 'Swimming',
      },
      category: 'motivation',
      content: 'Remember team: "Champions aren\'t made in comfort zones!" 💪 Let\'s crush our training this week! Who\'s with me? 🙋‍♀️',
      timestamp: '1 day ago',
      likes: 24,
      cheers: 31,
      comments: 12,
      hasLiked: true,
      hasCheered: false,
      motivationBoost: true,
    },
    {
      id: '4',
      author: {
        name: 'Sam Thompson',
        avatar: '🏀',
        age: 12,
        sport: 'Basketball',
      },
      category: 'question',
      content: 'Does anyone know good stretches for sore calves? 🦵 Coach Johnson mentioned some but I forgot! Thanks teammates! 🙏',
      timestamp: '2 days ago',
      likes: 8,
      cheers: 3,
      comments: 9,
      hasLiked: false,
      hasCheered: false,
      helpfulReplies: 5,
    },
  ];

  // Mock data for team challenges
  const mockChallenges = [
    {
      id: '1',
      title: 'Weekly Fitness Challenge 💪',
      description: 'Complete 50 push-ups this week!',
      progress: 32,
      goal: 50,
      participants: 18,
      daysLeft: 3,
      reward: '🏆 Champion Badge',
    },
    {
      id: '2',
      title: 'Team Spirit Week 🌟',
      description: 'Cheer for 10 different teammates!',
      progress: 7,
      goal: 10,
      participants: 25,
      daysLeft: 5,
      reward: '❤️ Team Player Badge',
    },
  ];

  const postCategories = [
    { id: 'achievement', label: 'Achievement 🏆', color: '#FFD700' },
    { id: 'support', label: 'Need Support 🤗', color: '#FF6B6B' },
    { id: 'motivation', label: 'Motivation 💪', color: '#4ECDC4' },
    { id: 'question', label: 'Question ❓', color: '#A8E6CF' },
  ];

  const renderTabBar = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
        onPress={() => setActiveTab('feed')}
      >
        <MaterialIcons 
          name="home" 
          size={20} 
          color={activeTab === 'feed' ? COLORS.white : COLORS.textSecondary} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'feed' && styles.activeTabText
        ]}>
          Team Feed
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
        onPress={() => setActiveTab('challenges')}
      >
        <MaterialIcons 
          name="jump-rope" 
          size={20} 
          color={activeTab === 'challenges' ? COLORS.white : COLORS.textSecondary} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'challenges' && styles.activeTabText
        ]}>
          Challenges
        </Text>
        <Badge style={styles.tabBadge} size={16}>
          2
        </Badge>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'teammates' && styles.activeTab]}
        onPress={() => setActiveTab('teammates')}
      >
        <MaterialIcons 
          name="group" 
          size={20} 
          color={activeTab === 'teammates' ? COLORS.white : COLORS.textSecondary} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'teammates' && styles.activeTabText
        ]}>
          Teammates
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPostCard = (post) => (
    <Card key={post.id} style={styles.postCard}>
      <Card.Content style={styles.postContent}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity 
            style={styles.authorInfo}
            onPress={() => handlePeerProfile(post.author.id)}
          >
            <View style={styles.authorAvatar}>
              <Text style={styles.avatarEmoji}>{post.author.avatar}</Text>
            </View>
            <View style={styles.authorDetails}>
              <Text style={[TEXT_STYLES.h4, styles.authorName]}>
                {post.author.name}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.authorMeta]}>
                {post.author.sport} • {post.timestamp}
              </Text>
            </View>
          </TouchableOpacity>
          
          <Chip 
            style={[
              styles.categoryChip, 
              { backgroundColor: postCategories.find(c => c.id === post.category)?.color + '20' }
            ]}
            textStyle={[
              styles.categoryText,
              { color: postCategories.find(c => c.id === post.category)?.color }
            ]}
          >
            {postCategories.find(c => c.id === post.category)?.label}
          </Chip>
        </View>

        {/* Post Content */}
        <Text style={[TEXT_STYLES.body, styles.postText]}>
          {post.content}
        </Text>

        {/* Achievement Badges */}
        {post.achievements && (
          <View style={styles.achievementContainer}>
            {post.achievements.map((achievement, index) => (
              <Chip key={index} style={styles.achievementBadge} textStyle={styles.achievementText}>
                {achievement}
              </Chip>
            ))}
          </View>
        )}

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLikePost(post.id)}
          >
            <MaterialIcons 
              name={post.hasLiked ? 'thumb-up' : 'thumb-up-off-alt'} 
              size={20} 
              color={post.hasLiked ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[
              styles.actionText,
              post.hasLiked && styles.activeActionText
            ]}>
              {post.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleCheerPost(post.id)}
          >
            <MaterialIcons 
              name={post.hasCheered ? 'celebration' : 'celebration'} 
              size={20} 
              color={post.hasCheered ? '#FFD700' : COLORS.textSecondary} 
            />
            <Text style={[
              styles.actionText,
              post.hasCheered && { color: '#FFD700' }
            ]}>
              {post.cheers} 🎉
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleCommentPost(post.id)}
          >
            <MaterialIcons 
              name="chat-bubble-outline" 
              size={20} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.actionText}>
              {post.comments}
            </Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderChallengeCard = (challenge) => (
    <Card key={challenge.id} style={styles.challengeCard}>
      <Card.Content style={styles.challengeContent}>
        <View style={styles.challengeHeader}>
          <Text style={[TEXT_STYLES.h4, styles.challengeTitle]}>
            {challenge.title}
          </Text>
          <Chip style={styles.daysLeftChip} textStyle={styles.daysLeftText}>
            {challenge.daysLeft} days left
          </Chip>
        </View>
        
        <Text style={[TEXT_STYLES.body, styles.challengeDescription]}>
          {challenge.description}
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[TEXT_STYLES.caption, styles.progressText]}>
              {challenge.progress} / {challenge.goal} completed
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.participantsText]}>
              {challenge.participants} teammates joined
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(challenge.progress / challenge.goal) * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.challengeFooter}>
          <Text style={[TEXT_STYLES.caption, styles.rewardText]}>
            Reward: {challenge.reward}
          </Text>
          <Button 
            mode="contained" 
            style={styles.joinButton}
            labelStyle={styles.joinButtonText}
            onPress={() => Alert.alert('🎯 Challenge Joined!', 'Good luck teammate!')}
          >
            Join Challenge
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const mockTeammates = [
    { id: '1', name: 'Alex Chen', avatar: '🏃‍♂️', sport: 'Track & Field', isOnline: true },
    { id: '2', name: 'Maya Rodriguez', avatar: '⚽', sport: 'Football', isOnline: false },
    { id: '3', name: 'Jordan Kim', avatar: '🏊‍♀️', sport: 'Swimming', isOnline: true },
    { id: '4', name: 'Sam Thompson', avatar: '🏀', sport: 'Basketball', isOnline: true },
    { id: '5', name: 'Emma Wilson', avatar: '🎾', sport: 'Tennis', isOnline: false },
    { id: '6', name: 'Liam Davis', avatar: '🥅', sport: 'Hockey', isOnline: true },
  ];

  const renderTeammateCard = (teammate) => (
    <TouchableOpacity
      key={teammate.id}
      style={styles.teammateCard}
      onPress={() => handlePeerProfile(teammate.id)}
      activeOpacity={0.7}
    >
      <View style={styles.teammateAvatar}>
        <Text style={styles.teammateEmoji}>{teammate.avatar}</Text>
        {teammate.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <Text style={[TEXT_STYLES.body, styles.teammateName]}>
        {teammate.name}
      </Text>
      <Text style={[TEXT_STYLES.caption, styles.teammateSport]}>
        {teammate.sport}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <View style={styles.tabContent}>
            {mockPosts.map(renderPostCard)}
          </View>
        );
      
      case 'challenges':
        return (
          <View style={styles.tabContent}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              Team Challenges 🏆
            </Text>
            <Text style={[TEXT_STYLES.body, styles.sectionSubtitle]}>
              Work together and achieve greatness! 💪
            </Text>
            {mockChallenges.map(renderChallengeCard)}
          </View>
        );
      
      case 'teammates':
        return (
          <View style={styles.tabContent}>
            <Searchbar
              placeholder="Search teammates..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              Your Teammates 👥
            </Text>
            <FlatList
              data={mockTeammates}
              renderItem={({ item }) => renderTeammateCard(item)}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.teammateRow}
              scrollEnabled={false}
            />
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
            Team Support 🤝
          </Text>
          <IconButton
            icon="help-circle"
            size={24}
            iconColor={COLORS.white}
            onPress={() => Alert.alert('ℹ️ Peer Support', 'Share achievements, ask questions, and support your teammates in a safe, moderated environment!')}
            style={styles.helpButton}
          />
        </View>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Connect, share, and grow together with your teammates! 🌟
        </Text>
      </LinearGradient>

      {renderTabBar()}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
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
          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>

      {activeTab === 'feed' && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setShowPostModal(true)}
          color={COLORS.white}
        />
      )}

      {/* Post Creation Modal */}
      <Portal>
        <Modal
          visible={showPostModal}
          onDismiss={() => setShowPostModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
            Share with Teammates 📝
          </Text>
          
          <Text style={[TEXT_STYLES.body, styles.modalLabel]}>
            Choose category:
          </Text>
          <View style={styles.categorySelector}>
            {postCategories.map((category) => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryOptionChip,
                  selectedCategory === category.id && { backgroundColor: category.color + '40' }
                ]}
                textStyle={[
                  styles.categoryOptionText,
                  selectedCategory === category.id && { color: category.color, fontWeight: 'bold' }
                ]}
              >
                {category.label}
              </Chip>
            ))}
          </View>
          
          <TextInput
            mode="outlined"
            placeholder="What do you want to share with your teammates?"
            value={postText}
            onChangeText={setPostText}
            multiline
            numberOfLines={4}
            style={styles.postInput}
            activeOutlineColor={COLORS.primary}
          />
          
          <View style={styles.modalActions}>
            <Button 
              mode="text" 
              onPress={() => setShowPostModal(false)}
              textColor={COLORS.textSecondary}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleCreatePost}
              disabled={!postText.trim()}
              style={styles.shareButton}
            >
              Share Post 🚀
            </Button>
          </View>
        </Modal>
      </Portal>
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
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: COLORS.white + 'CC',
    fontSize: 14,
  },
  helpButton: {
    margin: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  tabBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: COLORS.error,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
  },
  postCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 16,
    marginBottom: SPACING.md,
  },
  postContent: {
    paddingVertical: SPACING.md,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  authorMeta: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  categoryChip: {
    height: 28,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  postText: {
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  achievementContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  achievementBadge: {
    backgroundColor: '#FFD700' + '20',
    height: 28,
  },
  achievementText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  actionText: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeActionText: {
    color: COLORS.primary,
  },
  challengeCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  challengeContent: {
    paddingVertical: SPACING.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  challengeTitle: {
    flex: 1,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  daysLeftChip: {
    backgroundColor: COLORS.error + '20',
    height: 28,
  },
  daysLeftText: {
    fontSize: 11,
    color: COLORS.error,
    fontWeight: 'bold',
  },
  challengeDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  participantsText: {
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  joinButton: {
    backgroundColor: COLORS.primary,
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  teammateRow: {
    justifyContent: 'space-between',
  },
  teammateCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    width: (width - SPACING.md * 3) / 2,
    position: 'relative',
  },
  teammateAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  teammateEmoji: {
    fontSize: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  teammateName: {
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  teammateSport: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  modalLabel: {
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  categoryOptionChip: {
    backgroundColor: COLORS.surface,
    height: 32,
  },
  categoryOptionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  postInput: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  shareButton: {
    backgroundColor: COLORS.primary,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default PeerSupport;
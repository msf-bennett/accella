import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Text,
  Image,
  FlatList,
  Animated,
  StatusBar,
  Dimensions,
  Alert,
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
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TraineeCommunity = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, communityPosts, challenges, friends } = useSelector(state => state.trainee);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

    loadCommunityData();
  }, []);

  const loadCommunityData = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement API calls to fetch community data
      // dispatch(fetchCommunityPosts());
      // dispatch(fetchActiveChallenges());
      // dispatch(fetchFriendsList());
    } catch (error) {
      Alert.alert('Error', 'Failed to load community data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCommunityData();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadCommunityData]);

  const handleLikePost = useCallback((postId) => {
    Vibration.vibrate(30);
    // TODO: Implement like functionality
    // dispatch(likePost(postId));
    Alert.alert('Feature Coming Soon', 'Post interaction features are under development! 🚀');
  }, []);

  const handleCreatePost = useCallback(() => {
    Vibration.vibrate(50);
    setShowCreatePost(true);
  }, []);

  const handleJoinChallenge = useCallback((challengeId) => {
    Vibration.vibrate(50);
    // TODO: Implement challenge join functionality
    Alert.alert('Feature Coming Soon', 'Challenge participation is under development! 💪');
  }, []);

  // Mock data - replace with real data from Redux store
  const mockPosts = [
    {
      id: '1',
      user: { name: 'Sarah Johnson', avatar: 'https://via.placeholder.com/50', level: 12 },
      content: 'Just crushed my 5K PR! 🏃‍♀️ New time: 22:45. The training plan is really paying off!',
      image: 'https://via.placeholder.com/300x200',
      likes: 24,
      comments: 8,
      timestamp: '2h ago',
      type: 'achievement',
    },
    {
      id: '2',
      user: { name: 'Mike Chen', avatar: 'https://via.placeholder.com/50', level: 8 },
      content: 'Week 6 of strength training complete! 💪 Deadlifted 180kg today - feeling stronger every day.',
      likes: 31,
      comments: 12,
      timestamp: '4h ago',
      type: 'progress',
    },
    {
      id: '3',
      user: { name: 'Emma Davis', avatar: 'https://via.placeholder.com/50', level: 15 },
      content: 'Yoga session this morning was exactly what I needed. Remember to take rest days seriously! 🧘‍♀️',
      likes: 18,
      comments: 5,
      timestamp: '6h ago',
      type: 'motivation',
    },
  ];

  const mockChallenges = [
    {
      id: '1',
      title: '30-Day Plank Challenge',
      description: 'Build core strength with progressive plank holds',
      participants: 127,
      daysLeft: 12,
      progress: 0.6,
      image: 'https://via.placeholder.com/150x100',
    },
    {
      id: '2',
      title: 'Run 100K This Month',
      description: 'Accumulate 100km of running throughout the month',
      participants: 89,
      daysLeft: 8,
      progress: 0.75,
      image: 'https://via.placeholder.com/150x100',
    },
  ];

  const renderTabButton = (tab, title, icon) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton,
      ]}
    >
      <Icon 
        name={icon} 
        size={20} 
        color={activeTab === tab ? COLORS.primary : COLORS.textSecondary} 
      />
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.activeTabButtonText,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }) => (
    <Animated.View style={[styles.postContainer, { opacity: fadeAnim }]}>
      <Card style={styles.postCard}>
        <View style={styles.postHeader}>
          <Avatar.Image source={{ uri: item.user.avatar }} size={40} />
          <View style={styles.postUserInfo}>
            <View style={styles.postUserRow}>
              <Text style={styles.postUserName}>{item.user.name}</Text>
              <Chip 
                style={styles.levelChip} 
                textStyle={styles.levelChipText}
                compact
              >
                Lvl {item.user.level}
              </Chip>
            </View>
            <Text style={styles.postTimestamp}>{item.timestamp}</Text>
          </View>
          <IconButton
            icon="dots-vertical"
            size={20}
            iconColor={COLORS.textSecondary}
            onPress={() => Alert.alert('Feature Coming Soon', 'Post options coming soon! ⚙️')}
          />
        </View>

        <Card.Content>
          <Text style={styles.postContent}>{item.content}</Text>
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.postImage} />
          )}
        </Card.Content>

        <Card.Actions style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLikePost(item.id)}
          >
            <Icon name="favorite-border" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="chat-bubble-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="share" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  const renderChallenge = ({ item }) => (
    <Card style={styles.challengeCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.challengeGradient}
      >
        <Image source={{ uri: item.image }} style={styles.challengeImage} />
        <View style={styles.challengeOverlay}>
          <Text style={styles.challengeTitle}>{item.title}</Text>
          <Text style={styles.challengeDescription}>{item.description}</Text>
          
          <View style={styles.challengeStats}>
            <View style={styles.challengeStat}>
              <Icon name="people" size={16} color={COLORS.white} />
              <Text style={styles.challengeStatText}>{item.participants} joined</Text>
            </View>
            <View style={styles.challengeStat}>
              <Icon name="schedule" size={16} color={COLORS.white} />
              <Text style={styles.challengeStatText}>{item.daysLeft} days left</Text>
            </View>
          </View>

          <ProgressBar
            progress={item.progress}
            color={COLORS.white}
            style={styles.challengeProgress}
          />

          <Button
            mode="contained"
            onPress={() => handleJoinChallenge(item.id)}
            style={styles.joinButton}
            contentStyle={styles.joinButtonContent}
            labelStyle={styles.joinButtonLabel}
          >
            Join Challenge
          </Button>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderFeedContent = () => (
    <FlatList
      data={mockPosts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.feedContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    />
  );

  const renderChallengesContent = () => (
    <FlatList
      data={mockChallenges}
      renderItem={renderChallenge}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.challengesContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    />
  );

  const renderLeaderboardContent = () => (
    <View style={styles.leaderboardContainer}>
      <Text style={styles.comingSoonText}>🏆</Text>
      <Text style={styles.comingSoonTitle}>Leaderboard Coming Soon!</Text>
      <Text style={styles.comingSoonSubtitle}>
        Compare your progress with friends and community members
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Community 🌟</Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="notifications-none"
              size={24}
              iconColor={COLORS.white}
              onPress={() => Alert.alert('Feature Coming Soon', 'Notifications coming soon! 🔔')}
            />
            <IconButton
              icon="search"
              size={24}
              iconColor={COLORS.white}
              onPress={() => Alert.alert('Feature Coming Soon', 'Search functionality coming soon! 🔍')}
            />
          </View>
        </View>

        <View style={styles.tabContainer}>
          {renderTabButton('feed', 'Feed', 'home')}
          {renderTabButton('challenges', 'Challenges', 'jump-rope')}
          {renderTabButton('leaderboard', 'Leaderboard', 'leaderboard')}
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.contentContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {activeTab === 'feed' && renderFeedContent()}
        {activeTab === 'challenges' && renderChallengesContent()}
        {activeTab === 'leaderboard' && renderLeaderboardContent()}
      </Animated.View>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={handleCreatePost}
        color={COLORS.white}
      />

      <Portal>
        <Modal
          visible={showCreatePost}
          onDismiss={() => setShowCreatePost(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
            <Card style={styles.createPostCard}>
              <Card.Title
                title="Create Post"
                titleStyle={styles.modalTitle}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="close"
                    onPress={() => setShowCreatePost(false)}
                  />
                )}
              />
              <Card.Content>
                <Text style={styles.comingSoonModalText}>
                  Post creation feature is under development! 📝
                </Text>
                <Text style={styles.comingSoonModalSubtext}>
                  Soon you'll be able to share your achievements, progress photos, and motivate others!
                </Text>
              </Card.Content>
            </Card>
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
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTabButton: {
    backgroundColor: COLORS.white,
  },
  tabButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    marginLeft: SPACING.xs,
    fontSize: 12,
  },
  activeTabButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  feedContainer: {
    padding: SPACING.md,
  },
  postContainer: {
    marginBottom: SPACING.md,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  postUserInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  postUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postUserName: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  levelChip: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
    height: 20,
  },
  levelChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    fontSize: 10,
  },
  postTimestamp: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  postContent: {
    ...TEXT_STYLES.body,
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  actionText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  challengesContainer: {
    padding: SPACING.md,
  },
  challengeCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: SPACING.md,
    minHeight: 180,
  },
  challengeImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  challengeOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  challengeTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  challengeDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    marginVertical: SPACING.sm,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeStatText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  challengeProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: SPACING.sm,
  },
  joinButton: {
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
  },
  joinButtonContent: {
    paddingVertical: 4,
  },
  joinButtonLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  leaderboardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  comingSoonText: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  comingSoonTitle: {
    ...TEXT_STYLES.h1,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  comingSoonSubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: screenWidth * 0.9,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createPostCard: {
    backgroundColor: COLORS.white,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
  },
  comingSoonModalText: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  comingSoonModalSubtext: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
};

export default TraineeCommunity;
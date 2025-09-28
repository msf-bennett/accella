import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Animated,
  StatusBar,
  Dimensions,
  Alert,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  IconButton,
  Searchbar,
  Badge,
  FAB,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width } = Dimensions.get('window');

const TeamUpdates = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostText, setNewPostText] = useState('');

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const tabs = [
    { key: 'all', label: 'All Updates', icon: 'dynamic-feed' },
    { key: 'announcements', label: 'Announcements', icon: 'campaign' },
    { key: 'achievements', label: 'Achievements', icon: 'jump-rope' },
    { key: 'social', label: 'Social', icon: 'people' },
  ];

  // Mock team data
  const teamInfo = {
    name: 'Thunder Bolts FC',
    members: 24,
    coaches: 3,
    upcomingMatch: 'vs Lightning Strikers - Tomorrow 3:00 PM',
    season: 'Fall 2024',
    ranking: '#3 in Division',
  };

  // Mock updates data
  const teamUpdates = [
    {
      id: 1,
      type: 'announcement',
      category: 'announcements',
      author: {
        name: 'Coach Martinez',
        role: 'Head Coach',
        avatar: null,
        verified: true,
      },
      title: 'Team Meeting Tomorrow',
      content: 'Important team meeting before the match. Please arrive 30 minutes early for tactical discussion and warm-up routine.',
      timestamp: '2024-08-24T15:30:00Z',
      priority: 'high',
      reactions: {
        likes: 18,
        comments: 5,
      },
      tags: ['important', 'match-prep'],
      isPinned: true,
    },
    {
      id: 2,
      type: 'achievement',
      category: 'achievements',
      author: {
        name: 'Alex Thompson',
        role: 'Forward',
        avatar: null,
        verified: false,
      },
      title: 'Personal Best! 🏆',
      content: 'Just hit my fastest sprint time: 11.2 seconds! Thanks to everyone for the support during training.',
      timestamp: '2024-08-24T14:15:00Z',
      priority: 'normal',
      reactions: {
        likes: 12,
        comments: 8,
      },
      achievement: {
        type: 'Sprint Record',
        value: '11.2s',
        improvement: '-0.3s',
      },
      tags: ['personal-best', 'sprint'],
    },
    {
      id: 3,
      type: 'social',
      category: 'social',
      author: {
        name: 'Maya Rodriguez',
        role: 'Midfielder',
        avatar: null,
        verified: false,
      },
      title: 'Team Bonding Success! 🎉',
      content: 'What an amazing team dinner last night! Great to see everyone outside of training. The team chemistry is really building up!',
      timestamp: '2024-08-24T09:45:00Z',
      priority: 'normal',
      reactions: {
        likes: 24,
        comments: 12,
      },
      images: ['team_dinner.jpg'],
      tags: ['team-bonding', 'social'],
    },
    {
      id: 4,
      type: 'announcement',
      category: 'announcements',
      author: {
        name: 'Assistant Coach Kim',
        role: 'Fitness Coach',
        avatar: null,
        verified: true,
      },
      title: 'New Training Schedule',
      content: 'Updated training schedule for next week. Focus on defensive formations and set pieces. Nutrition plan also attached.',
      timestamp: '2024-08-24T08:30:00Z',
      priority: 'medium',
      reactions: {
        likes: 15,
        comments: 3,
      },
      attachments: ['training_schedule.pdf', 'nutrition_plan.pdf'],
      tags: ['schedule', 'training'],
    },
    {
      id: 5,
      type: 'achievement',
      category: 'achievements',
      author: {
        name: 'Team Thunder Bolts',
        role: 'Team',
        avatar: null,
        verified: true,
      },
      title: 'Team Achievement Unlocked! 🌟',
      content: 'Congratulations team! We\'ve completed 100 training sessions together this season. Consistency pays off!',
      timestamp: '2024-08-23T19:20:00Z',
      priority: 'high',
      reactions: {
        likes: 32,
        comments: 15,
      },
      achievement: {
        type: 'Team Milestone',
        value: '100 Sessions',
        reward: '+500 Team XP',
      },
      tags: ['milestone', 'team-achievement'],
    },
    {
      id: 6,
      type: 'social',
      category: 'social',
      author: {
        name: 'Jordan Lee',
        role: 'Defender',
        avatar: null,
        verified: false,
      },
      title: 'Match Preparation Vibes! ⚡',
      content: 'Feeling confident about tomorrow\'s match! Our defensive line has been solid in practice. Let\'s bring that energy to the field! 💪',
      timestamp: '2024-08-23T17:10:00Z',
      priority: 'normal',
      reactions: {
        likes: 19,
        comments: 7,
      },
      tags: ['motivation', 'match-prep'],
    },
    {
      id: 7,
      type: 'announcement',
      category: 'announcements',
      author: {
        name: 'Team Manager',
        role: 'Manager',
        avatar: null,
        verified: true,
      },
      title: 'Equipment Check Reminder',
      content: 'Please ensure all equipment is ready for tomorrow\'s match. Backup jerseys available in the equipment room.',
      timestamp: '2024-08-23T16:45:00Z',
      priority: 'medium',
      reactions: {
        likes: 8,
        comments: 2,
      },
      tags: ['equipment', 'reminder'],
    },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Team Updates! 📢', 'Latest team news and updates have been loaded.');
    }, 1500);
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return time.toLocaleDateString();
  };

  const filteredUpdates = teamUpdates.filter(update => {
    const matchesSearch = update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         update.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         update.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === 'all' || update.category === selectedTab;
    return matchesSearch && matchesTab;
  });

  const handleLike = (postId) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
  };

  const handleComment = (post) => {
    Alert.alert(
      '💬 Comments',
      `View comments for "${post.title}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Comments', onPress: () => navigation.navigate('Comments', { postId: post.id }) }
      ]
    );
  };

  const handleShare = (post) => {
    Alert.alert(
      '📤 Share Post',
      `Share "${post.title}" with teammates or on social media?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share with Team', onPress: () => Alert.alert('Shared!', 'Post shared with team members.') },
        { text: 'Share Externally', onPress: () => Alert.alert('Shared!', 'Post shared on social media.') }
      ]
    );
  };

  const handleNewPost = () => {
    if (newPostText.trim()) {
      Alert.alert('Post Created! 📝', 'Your update has been shared with the team.');
      setNewPostText('');
      setModalVisible(false);
    }
  };

  const renderTeamHeader = () => (
    <Card style={styles.teamCard} elevation={4}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.teamGradient}
      >
        <View style={styles.teamHeader}>
          <Avatar.Icon
            size={60}
            icon="groups"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
          <View style={styles.teamInfo}>
            <Text style={[TEXT_STYLES.h4, { color: 'white', marginBottom: SPACING.xs }]}>
              {teamInfo.name}
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)', marginBottom: SPACING.xs }]}>
              {teamInfo.members} Members • {teamInfo.coaches} Coaches
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              {teamInfo.ranking} • {teamInfo.season}
            </Text>
          </View>
        </View>
        
        <Surface style={styles.nextMatchCard} elevation={2}>
          <View style={styles.nextMatchContent}>
            <Icon name="event" size={20} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1, color: COLORS.primary }]}>
              {teamInfo.upcomingMatch}
            </Text>
          </View>
        </Surface>
      </LinearGradient>
    </Card>
  );

  const renderTabBar = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
      <View style={styles.tabButtons}>
        {tabs.map((tab) => (
          <Chip
            key={tab.key}
            mode={selectedTab === tab.key ? 'flat' : 'outlined'}
            selected={selectedTab === tab.key}
            onPress={() => setSelectedTab(tab.key)}
            icon={tab.icon}
            style={[
              styles.tabChip,
              selectedTab === tab.key && { backgroundColor: COLORS.primary }
            ]}
            textStyle={{
              color: selectedTab === tab.key ? 'white' : COLORS.primary
            }}
          >
            {tab.label}
          </Chip>
        ))}
      </View>
    </ScrollView>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return '#ff9800';
      case 'low': return COLORS.success;
      default: return COLORS.secondary;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'announcement': return 'campaign';
      case 'achievement': return 'jump-rope';
      case 'social': return 'chat';
      default: return 'info';
    }
  };

  const renderUpdateItem = ({ item }) => (
    <Card style={[styles.updateCard, item.isPinned && styles.pinnedCard]} elevation={2}>
      <Card.Content style={styles.updateContent}>
        {/* Header */}
        <View style={styles.updateHeader}>
          <View style={styles.authorInfo}>
            <Avatar.Text
              size={40}
              label={item.author.name.charAt(0)}
              style={{ backgroundColor: COLORS.primary }}
            />
            <View style={styles.authorText}>
              <View style={styles.authorName}>
                <Text style={TEXT_STYLES.h6}>{item.author.name}</Text>
                {item.author.verified && (
                  <Icon name="verified" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
                )}
              </View>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
                {item.author.role} • {formatTimeAgo(item.timestamp)}
              </Text>
            </View>
          </View>
          
          <View style={styles.updateMeta}>
            {item.isPinned && (
              <Icon name="push-pin" size={16} color={COLORS.error} style={{ marginRight: 4 }} />
            )}
            <Icon name={getTypeIcon(item.type)} size={18} color={getPriorityColor(item.priority)} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.updateBody}>
          <Text style={[TEXT_STYLES.h5, { marginBottom: SPACING.sm }]}>
            {item.title}
          </Text>
          <Text style={[TEXT_STYLES.body, { color: COLORS.secondary, lineHeight: 20 }]}>
            {item.content}
          </Text>

          {/* Achievement Badge */}
          {item.achievement && (
            <Surface style={styles.achievementBadge} elevation={1}>
              <Icon name="star" size={20} color="#ffd700" />
              <View style={styles.achievementInfo}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                  {item.achievement.type}: {item.achievement.value}
                </Text>
                {item.achievement.improvement && (
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.success }]}>
                    {item.achievement.improvement}
                  </Text>
                )}
                {item.achievement.reward && (
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                    {item.achievement.reward}
                  </Text>
                )}
              </View>
            </Surface>
          )}

          {/* Attachments */}
          {item.attachments && (
            <View style={styles.attachments}>
              {item.attachments.map((attachment, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  icon="attachment"
                  compact
                  style={styles.attachmentChip}
                  onPress={() => Alert.alert('Download', `Download ${attachment}?`)}
                >
                  {attachment}
                </Chip>
              ))}
            </View>
          )}

          {/* Tags */}
          {item.tags && (
            <View style={styles.tags}>
              {item.tags.map((tag, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={styles.tagChip}
                  textStyle={{ fontSize: 10 }}
                >
                  #{tag}
                </Chip>
              ))}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.updateActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Icon
              name={likedPosts.has(item.id) ? 'favorite' : 'favorite-border'}
              size={20}
              color={likedPosts.has(item.id) ? COLORS.error : COLORS.secondary}
            />
            <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.secondary }]}>
              {item.reactions.likes + (likedPosts.has(item.id) ? 1 : 0)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleComment(item)}
          >
            <Icon name="comment" size={20} color={COLORS.secondary} />
            <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.secondary }]}>
              {item.reactions.comments}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(item)}
          >
            <Icon name="share" size={20} color={COLORS.secondary} />
            <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS.secondary }]}>
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderNewPostModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
          Share Team Update 📝
        </Text>
        
        <TextInput
          mode="outlined"
          label="What's happening with the team?"
          value={newPostText}
          onChangeText={setNewPostText}
          multiline
          numberOfLines={4}
          style={styles.textInput}
          placeholder="Share achievements, motivation, or team news..."
        />

        <View style={styles.modalActions}>
          <Button
            mode="outlined"
            onPress={() => setModalVisible(false)}
            style={{ flex: 1, marginRight: SPACING.sm }}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleNewPost}
            style={{ flex: 1 }}
            disabled={!newPostText.trim()}
          >
            Post Update
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: SPACING.xs }]}>
            Team Updates 📢
          </Text>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
            Stay connected with your team
          </Text>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search team updates..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={TEXT_STYLES.body}
            iconColor={COLORS.primary}
          />
        </View>

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
          showsVerticalScrollIndicator={false}
        >
          {/* Team Header */}
          {renderTeamHeader()}
          
          {/* Tab Bar */}
          {renderTabBar()}
          
          {/* Updates List */}
          <View style={styles.updatesContainer}>
            <FlatList
              data={filteredUpdates}
              renderItem={renderUpdateItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
              ListEmptyComponent={() => (
                <Card style={styles.emptyCard} elevation={1}>
                  <Card.Content style={styles.emptyContent}>
                    <Icon name="forum" size={48} color={COLORS.secondary} />
                    <Text style={[TEXT_STYLES.h4, { color: COLORS.secondary, marginTop: SPACING.md }]}>
                      No updates found
                    </Text>
                    <Text style={[TEXT_STYLES.body, { color: COLORS.secondary, textAlign: 'center', marginTop: SPACING.sm }]}>
                      Try adjusting your search or check back later for team news
                    </Text>
                  </Card.Content>
                </Card>
              )}
            />
          </View>
          
          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        label="Post Update"
      />

      {renderNewPostModal()}
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + 30,
    paddingBottom: SPACING.lg,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  teamCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  teamGradient: {
    padding: SPACING.lg,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  teamInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  nextMatchCard: {
    borderRadius: 8,
    backgroundColor: 'white',
    padding: SPACING.md,
  },
  nextMatchContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabContainer: {
    marginBottom: SPACING.lg,
  },
  tabButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
  },
  tabChip: {
    marginRight: SPACING.sm,
  },
  updatesContainer: {
    marginBottom: SPACING.lg,
  },
  updateCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  pinnedCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  updateContent: {
    padding: SPACING.md,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  authorName: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateBody: {
    marginBottom: SPACING.md,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: '#fff8e1',
    marginTop: SPACING.sm,
  },
  achievementInfo: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  attachments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  attachmentChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  tagChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    height: 24,
  },
  updateActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  emptyCard: {
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: SPACING.lg,
    margin: SPACING.lg,
    borderRadius: 16,
  },
  textInput: {
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
};

export default TeamUpdates;
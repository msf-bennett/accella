import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Vibration,
  Animated,
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
  TextInput,
  Badge,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const CommunityGroups = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { groups, myGroups, recommendations } = useSelector(state => state.community);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [createGroupVisible, setCreateGroupVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Group categories
  const categories = [
    { id: 'all', label: 'All Groups', icon: 'groups', color: COLORS.primary },
    { id: 'running', label: 'Running', icon: 'directions-run', color: '#FF6B6B' },
    { id: 'cycling', label: 'Cycling', icon: 'pedal-bike', color: '#4ECDC4' },
    { id: 'fitness', label: 'Fitness', icon: 'fitness-center', color: '#45B7D1' },
    { id: 'swimming', label: 'Swimming', icon: 'pool', color: '#96CEB4' },
    { id: 'team-sports', label: 'Team Sports', icon: 'sports-soccer', color: '#FECA57' },
    { id: 'yoga', label: 'Yoga', icon: 'self-improvement', color: '#FF9FF3' },
    { id: 'martial-arts', label: 'Martial Arts', icon: 'sports-martial-arts', color: '#54A0FF' },
  ];

  // Tabs
  const tabs = [
    { id: 'discover', label: 'Discover', icon: 'explore' },
    { id: 'my-groups', label: 'My Groups', icon: 'group' },
    { id: 'recommended', label: 'For You', icon: 'recommend' },
  ];

  // Mock groups data
  const mockGroups = [
    {
      id: 1,
      name: 'Marathon Training Squad 🏃‍♂️',
      description: 'Join fellow runners preparing for upcoming marathons. Weekly group runs and training tips!',
      category: 'running',
      memberCount: 156,
      isJoined: false,
      isPrivate: false,
      coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      admin: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      },
      recentActivity: '5 new posts today',
      tags: ['marathon', 'long-distance', 'weekend-runs'],
      location: 'Nairobi, Kenya',
      weeklyGoal: { current: 8, target: 12, unit: 'runs' },
      lastActive: '2 hours ago',
    },
    {
      id: 2,
      name: 'Cycling Enthusiasts KE 🚴‍♀️',
      description: 'Explore Kenya\'s beautiful cycling routes with like-minded cyclists. All levels welcome!',
      category: 'cycling',
      memberCount: 89,
      isJoined: true,
      isPrivate: false,
      coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      admin: {
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      recentActivity: '12 new posts today',
      tags: ['cycling', 'road-bike', 'weekend-rides'],
      location: 'Nairobi, Kenya',
      weeklyGoal: { current: 3, target: 4, unit: 'rides' },
      lastActive: '1 hour ago',
      unreadMessages: 7,
    },
    {
      id: 3,
      name: 'HIIT Warriors 💪',
      description: 'High-intensity interval training group. Push your limits with daily challenges!',
      category: 'fitness',
      memberCount: 234,
      isJoined: false,
      isPrivate: false,
      coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      admin: {
        name: 'Alex Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      },
      recentActivity: '8 new posts today',
      tags: ['HIIT', 'strength', 'cardio'],
      location: 'Global',
      weeklyGoal: { current: 5, target: 6, unit: 'workouts' },
      lastActive: '30 min ago',
    },
    {
      id: 4,
      name: 'Morning Yoga Circle 🧘‍♀️',
      description: 'Start your day with peaceful yoga sessions. Beginner-friendly community focused on mindfulness.',
      category: 'yoga',
      memberCount: 67,
      isJoined: true,
      isPrivate: true,
      coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      admin: {
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      },
      recentActivity: '3 new posts today',
      tags: ['yoga', 'mindfulness', 'morning-routine'],
      location: 'Nairobi, Kenya',
      weeklyGoal: { current: 4, target: 7, unit: 'sessions' },
      lastActive: '4 hours ago',
      unreadMessages: 2,
    },
    {
      id: 5,
      name: 'Weekend Warriors FC ⚽',
      description: 'Football team looking for passionate players. Training every Saturday, matches on Sundays!',
      category: 'team-sports',
      memberCount: 22,
      isJoined: false,
      isPrivate: true,
      coverImage: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400',
      admin: {
        name: 'David Ochieng',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      },
      recentActivity: '1 new post today',
      tags: ['football', 'team', 'competitive'],
      location: 'Nairobi, Kenya',
      weeklyGoal: { current: 2, target: 2, unit: 'sessions' },
      lastActive: '1 day ago',
    },
  ];

  // Load groups data
  useEffect(() => {
    loadGroups();
    startAnimations();
  }, [selectedTab, selectedCategory]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Loading groups for tab:', selectedTab);
    } catch (error) {
      Alert.alert('Error', 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [selectedTab, selectedCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGroups().finally(() => setRefreshing(false));
  }, [loadGroups]);

  // Filter groups based on tab and category
  const getFilteredGroups = () => {
    let filteredGroups = [...mockGroups];

    // Filter by tab
    if (selectedTab === 'my-groups') {
      filteredGroups = filteredGroups.filter(group => group.isJoined);
    } else if (selectedTab === 'recommended') {
      // Mock recommendation logic
      filteredGroups = filteredGroups.filter(group => 
        !group.isJoined && (group.category === 'running' || group.category === 'fitness')
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filteredGroups = filteredGroups.filter(group => group.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      filteredGroups = filteredGroups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filteredGroups;
  };

  // Handle group actions
  const handleJoinGroup = async (group) => {
    if (group.isPrivate) {
      setSelectedGroup(group);
      setJoinModalVisible(true);
      return;
    }

    try {
      setLoading(true);
      // Simulate join request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success! 🎉', `You've joined ${group.name}!`);
      Vibration.vibrate([100, 50, 100]);
      
      // Update group status
      const updatedGroups = mockGroups.map(g => 
        g.id === group.id ? { ...g, isJoined: true, memberCount: g.memberCount + 1 } : g
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (group) => {
    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave ${group.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await new Promise(resolve => setTimeout(resolve, 1000));
              Alert.alert('Left Group', `You've left ${group.name}`);
            } catch (error) {
              Alert.alert('Error', 'Failed to leave group');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleGroupPress = (group) => {
    navigation.navigate('GroupChat', { 
      groupId: group.id,
      groupName: group.name,
      groupImage: group.coverImage 
    });
  };

  const renderTabBar = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabContainer}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => setSelectedTab(tab.id)}
          style={styles.tabButton}
        >
          <Surface
            style={[
              styles.tabChip,
              {
                backgroundColor: selectedTab === tab.id 
                  ? COLORS.primary 
                  : COLORS.background,
                elevation: selectedTab === tab.id ? 4 : 1,
              }
            ]}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={selectedTab === tab.id ? '#fff' : COLORS.primary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: selectedTab === tab.id ? '#fff' : COLORS.primary,
                  fontWeight: selectedTab === tab.id ? 'bold' : 'normal',
                }
              ]}
            >
              {tab.label}
            </Text>
          </Surface>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryContainer}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setSelectedCategory(category.id)}
          style={styles.categoryButton}
        >
          <Surface
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === category.id 
                  ? category.color 
                  : COLORS.background,
                elevation: selectedCategory === category.id ? 4 : 1,
              }
            ]}
          >
            <Icon
              name={category.icon}
              size={16}
              color={selectedCategory === category.id ? '#fff' : category.color}
            />
            <Text
              style={[
                styles.categoryText,
                {
                  color: selectedCategory === category.id ? '#fff' : category.color,
                  fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                }
              ]}
            >
              {category.label}
            </Text>
          </Surface>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderGroupCard = ({ item: group }) => {
    const category = categories.find(cat => cat.id === group.category);
    const progressPercentage = group.weeklyGoal.current / group.weeklyGoal.target;

    return (
      <Animated.View style={[styles.groupCard, { opacity: fadeAnim }]}>
        <Card style={styles.card} onPress={() => handleGroupPress(group)}>
          <View style={styles.cardHeader}>
            <Image source={{ uri: group.coverImage }} style={styles.coverImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageOverlay}
            />
            <View style={styles.headerContent}>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <View style={styles.groupMeta}>
                  <Icon name="location-on" size={14} color="#fff" />
                  <Text style={styles.locationText}>{group.location}</Text>
                  {group.isPrivate && (
                    <View style={styles.privateIndicator}>
                      <Icon name="lock" size={14} color="#fff" />
                    </View>
                  )}
                </View>
              </View>
              <Avatar.Image
                size={40}
                source={{ uri: group.admin.avatar }}
                style={styles.adminAvatar}
              />
            </View>
          </View>

          <Card.Content style={styles.cardContent}>
            <Text style={styles.groupDescription} numberOfLines={2}>
              {group.description}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="group" size={16} color={COLORS.text + '80'} />
                <Text style={styles.statText}>{group.memberCount} members</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="schedule" size={16} color={COLORS.text + '80'} />
                <Text style={styles.statText}>{group.lastActive}</Text>
              </View>
              {group.unreadMessages && (
                <Badge
                  style={styles.unreadBadge}
                  size={20}
                >
                  {group.unreadMessages}
                </Badge>
              )}
            </View>

            <View style={styles.tagsContainer}>
              {group.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  compact
                  style={[styles.tag, { borderColor: category?.color + '60' }]}
                  textStyle={[styles.tagText, { color: category?.color }]}
                >
                  {tag}
                </Chip>
              ))}
            </View>

            {group.isJoined && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Weekly Goal</Text>
                  <Text style={styles.progressValue}>
                    {group.weeklyGoal.current}/{group.weeklyGoal.target} {group.weeklyGoal.unit}
                  </Text>
                </View>
                <ProgressBar
                  progress={Math.min(progressPercentage, 1)}
                  color={category?.color || COLORS.primary}
                  style={styles.progressBar}
                />
              </View>
            )}

            <View style={styles.actionContainer}>
              <Text style={styles.recentActivity}>{group.recentActivity}</Text>
              <View style={styles.actionButtons}>
                {group.isJoined ? (
                  <>
                    <Button
                      mode="contained"
                      onPress={() => handleGroupPress(group)}
                      style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                      contentStyle={styles.buttonContent}
                      labelStyle={styles.buttonText}
                    >
                      <Icon name="chat" size={16} color="#fff" />
                      Chat
                    </Button>
                    <IconButton
                      icon="dots-vertical"
                      size={20}
                      onPress={() => handleLeaveGroup(group)}
                    />
                  </>
                ) : (
                  <Button
                    mode={group.isPrivate ? 'outlined' : 'contained'}
                    onPress={() => handleJoinGroup(group)}
                    style={[
                      styles.actionButton,
                      group.isPrivate && { borderColor: COLORS.primary }
                    ]}
                    contentStyle={styles.buttonContent}
                    labelStyle={[
                      styles.buttonText,
                      group.isPrivate && { color: COLORS.primary }
                    ]}
                  >
                    <Icon 
                      name={group.isPrivate ? "lock" : "group-add"} 
                      size={16} 
                      color={group.isPrivate ? COLORS.primary : "#fff"} 
                    />
                    {group.isPrivate ? 'Request' : 'Join'}
                  </Button>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const renderJoinModal = () => (
    <Portal>
      <Modal
        visible={joinModalVisible}
        onDismiss={() => setJoinModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurContainer} blurType="dark" blurAmount={10}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join Private Group</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setJoinModalVisible(false)}
              />
            </View>

            {selectedGroup && (
              <>
                <View style={styles.groupPreview}>
                  <Image 
                    source={{ uri: selectedGroup.coverImage }} 
                    style={styles.previewImage} 
                  />
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewName}>{selectedGroup.name}</Text>
                    <Text style={styles.previewMembers}>
                      {selectedGroup.memberCount} members
                    </Text>
                  </View>
                </View>

                <TextInput
                  mode="outlined"
                  label="Why do you want to join?"
                  placeholder="Tell the admin why you'd like to join this group..."
                  multiline
                  numberOfLines={4}
                  style={styles.requestMessage}
                  outlineColor={COLORS.primary}
                  activeOutlineColor={COLORS.primary}
                />

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setJoinModalVisible(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      setJoinModalVisible(false);
                      Alert.alert('Request Sent!', 'Your join request has been sent to the group admin.');
                    }}
                    loading={loading}
                    style={styles.confirmButton}
                  >
                    Send Request
                  </Button>
                </View>
              </>
            )}
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-back"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Community Groups</Text>
          <IconButton
            icon="filter-list"
            iconColor="#fff"
            size={24}
            onPress={() => setFilterModalVisible(true)}
          />
        </View>
      </View>
    </LinearGradient>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="groups" size={64} color={COLORS.text + '40'} />
      <Text style={styles.emptyTitle}>
        {selectedTab === 'my-groups' ? 'No groups joined yet' : 'No groups found'}
      </Text>
      <Text style={styles.emptyMessage}>
        {selectedTab === 'my-groups' 
          ? 'Join your first group to connect with fellow athletes!'
          : 'Try adjusting your search or category filters.'
        }
      </Text>
    </View>
  );

  const filteredGroups = getFilteredGroups();

  return (
    <View style={styles.container}>
      {renderHeader()}

      <View style={styles.content}>
        {renderTabBar()}

        <Searchbar
          placeholder="Search groups..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />

        {renderCategoryFilter()}

        <FlatList
          data={filteredGroups}
          renderItem={renderGroupCard}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.groupsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Coming Soon!', 'Group creation feature in development')}
      />

      {renderJoinModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: SPACING.sm,
  },
  tabContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  tabButton: {
    marginRight: SPACING.sm,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  tabText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  searchBar: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  categoryButton: {
    marginRight: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  groupsList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  groupCard: {
    marginBottom: SPACING.md,
  },
  card: {
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    position: 'relative',
    height: 160,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    ...TEXT_STYLES.h4,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: SPACING.xs,
    marginRight: SPACING.sm,
  },
  privateIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
  },
  adminAvatar: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardContent: {
    padding: SPACING.md,
  },
  groupDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text + '90',
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text + '80',
    marginLeft: SPACING.xs,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    marginLeft: 'auto',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tag: {
    height: 24,
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  tagText: {
    fontSize: 10,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressValue: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentActivity: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: '600',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: SPACING.sm,
  },
  buttonContent: {
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    marginLeft: SPACING.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.lg,
    color: COLORS.text + '80',
    textAlign: 'center',
  },
  emptyMessage: {
    ...TEXT_STYLES.body,
    color: COLORS.text + '60',
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    width: width - SPACING.xl * 2,
    padding: SPACING.lg,
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
    fontWeight: 'bold',
  },
  groupPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: SPACING.md,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  previewMembers: {
    ...TEXT_STYLES.caption,
    color: COLORS.text + '80',
  },
  requestMessage: {
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    borderColor: COLORS.text + '40',
  },
});

export default CommunityGroups;
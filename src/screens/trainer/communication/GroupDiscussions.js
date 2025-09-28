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
  FlatList,
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
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Import design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const GroupDiscussions = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isConnected } = useSelector(state => state.auth);
  const { groups, loading } = useSelector(state => state.groups);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my_groups');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedGroupType, setSelectedGroupType] = useState('training');
  const [selectedPrivacy, setSelectedPrivacy] = useState('private');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for demonstration
  const [groupsData] = useState([
    {
      id: '1',
      name: 'HIIT Masters Training Group',
      description: 'High-intensity interval training specialists sharing advanced techniques and workout plans',
      type: 'training',
      privacy: 'private',
      memberCount: 24,
      messageCount: 156,
      lastActivity: '5 min ago',
      isOwner: true,
      isMember: true,
      avatar: 'https://via.placeholder.com/60',
      coverImage: 'https://via.placeholder.com/300x120',
      unreadCount: 3,
      activeMembers: 8,
      category: 'Strength Training',
      tags: ['HIIT', 'Cardio', 'Advanced'],
      recentMessages: [
        {
          id: 'm1',
          sender: 'Mike Chen',
          message: 'Just shared the new tabata protocol!',
          timestamp: '5 min ago',
          avatar: 'https://via.placeholder.com/30',
        }
      ],
      stats: {
        postsToday: 12,
        activeToday: 8,
        weeklyGrowth: '+15%',
      }
    },
    {
      id: '2',
      name: 'Yoga & Mindfulness Collective',
      description: 'Connecting yoga instructors and mindfulness coaches for holistic wellness approaches',
      type: 'discussion',
      privacy: 'public',
      memberCount: 89,
      messageCount: 342,
      lastActivity: '12 min ago',
      isOwner: false,
      isMember: true,
      avatar: 'https://via.placeholder.com/60',
      coverImage: 'https://via.placeholder.com/300x120',
      unreadCount: 7,
      activeMembers: 15,
      category: 'Yoga',
      tags: ['Yoga', 'Mindfulness', 'Wellness'],
      recentMessages: [
        {
          id: 'm2',
          sender: 'Sarah Williams',
          message: 'New breathing technique discussion started',
          timestamp: '12 min ago',
          avatar: 'https://via.placeholder.com/30',
        }
      ],
      stats: {
        postsToday: 23,
        activeToday: 15,
        weeklyGrowth: '+8%',
      }
    },
    {
      id: '3',
      name: 'Nutrition for Athletes',
      description: 'Sports nutritionists and trainers discussing meal plans, supplements, and recovery nutrition',
      type: 'educational',
      privacy: 'private',
      memberCount: 45,
      messageCount: 289,
      lastActivity: '1h ago',
      isOwner: false,
      isMember: true,
      avatar: 'https://via.placeholder.com/60',
      coverImage: 'https://via.placeholder.com/300x120',
      unreadCount: 0,
      activeMembers: 6,
      category: 'Nutrition',
      tags: ['Nutrition', 'Recovery', 'Performance'],
      recentMessages: [
        {
          id: 'm3',
          sender: 'Dr. Emma Rodriguez',
          message: 'Shared research on post-workout nutrition',
          timestamp: '1h ago',
          avatar: 'https://via.placeholder.com/30',
        }
      ],
      stats: {
        postsToday: 8,
        activeToday: 6,
        weeklyGrowth: '+12%',
      }
    },
    {
      id: '4',
      name: 'Youth Sports Development',
      description: 'Coaches specializing in youth athletics sharing age-appropriate training methods',
      type: 'training',
      privacy: 'public',
      memberCount: 67,
      messageCount: 198,
      lastActivity: '2h ago',
      isOwner: false,
      isMember: false,
      avatar: 'https://via.placeholder.com/60',
      coverImage: 'https://via.placeholder.com/300x120',
      unreadCount: 0,
      activeMembers: 12,
      category: 'Youth Training',
      tags: ['Youth', 'Development', 'Safety'],
      recentMessages: [],
      stats: {
        postsToday: 15,
        activeToday: 12,
        weeklyGrowth: '+20%',
      }
    },
  ]);

  const tabs = [
    { key: 'my_groups', label: 'My Groups', icon: 'group', count: 3 },
    { key: 'discover', label: 'Discover', icon: 'explore', count: 0 },
    { key: 'trending', label: 'Trending', icon: 'trending-up', count: 0 },
    { key: 'invites', label: 'Invites', icon: 'mail', count: 2 },
  ];

  const groupTypes = [
    { key: 'training', label: 'Training Group', icon: 'fitness-center', color: COLORS.primary },
    { key: 'discussion', label: 'Discussion', icon: 'forum', color: COLORS.secondary },
    { key: 'educational', label: 'Educational', icon: 'school', color: COLORS.success },
    { key: 'support', label: 'Support', icon: 'favorite', color: COLORS.error },
  ];

  const privacyOptions = [
    { key: 'public', label: 'Public', icon: 'public', description: 'Anyone can join and see content' },
    { key: 'private', label: 'Private', icon: 'lock', description: 'Invite only, content hidden' },
    { key: 'restricted', label: 'Restricted', icon: 'verified-user', description: 'Request to join required' },
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
      // dispatch(fetchGroups());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh groups. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleJoinGroup = useCallback((groupId) => {
    Vibration.vibrate(100);
    Alert.alert('Feature Coming Soon', 'Group joining functionality will be available in the next update! 🤝');
  }, []);

  const handleLeaveGroup = useCallback((groupId) => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            Vibration.vibrate(100);
            Alert.alert('Feature Coming Soon', 'Group leaving functionality will be available soon!');
          }
        }
      ]
    );
  }, []);

  const handleCreateGroup = useCallback(() => {
    if (!newGroupName.trim()) {
      Alert.alert('Name Required', 'Please enter a group name.');
      return;
    }
    if (!newGroupDescription.trim()) {
      Alert.alert('Description Required', 'Please enter a group description.');
      return;
    }

    Vibration.vibrate(100);
    // dispatch(createGroup({ name: newGroupName, description: newGroupDescription, type: selectedGroupType, privacy: selectedPrivacy }));
    setNewGroupName('');
    setNewGroupDescription('');
    setShowCreateGroup(false);
    Alert.alert('Success! 🎉', 'Your group has been created successfully!');
  }, [newGroupName, newGroupDescription, selectedGroupType, selectedPrivacy]);

  const handleOpenGroup = useCallback((group) => {
    if (group.isMember) {
      navigation.navigate('GroupChat', { 
        groupId: group.id,
        groupName: group.name,
        memberCount: group.memberCount 
      });
    } else {
      navigation.navigate('GroupDetails', { groupId: group.id });
    }
  }, [navigation]);

  const getFilteredGroups = () => {
    let filtered = groupsData.filter(group => {
      const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });

    switch (activeTab) {
      case 'my_groups':
        return filtered.filter(group => group.isMember);
      case 'discover':
        return filtered.filter(group => !group.isMember && group.privacy === 'public');
      case 'trending':
        return filtered.sort((a, b) => parseInt(b.stats.weeklyGrowth) - parseInt(a.stats.weeklyGrowth));
      case 'invites':
        return []; // Mock empty invites for now
      default:
        return filtered;
    }
  };

  const renderGroupCard = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <TouchableOpacity
        onPress={() => handleOpenGroup(item)}
        activeOpacity={0.9}
      >
        <Card style={{ 
          marginHorizontal: SPACING.md, 
          elevation: 3,
          backgroundColor: '#fff',
        }}>
          {/* Cover Image */}
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: item.coverImage }}
              style={{
                width: '100%',
                height: 120,
                backgroundColor: COLORS.primary + '20',
              }}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 60,
                justifyContent: 'flex-end',
                padding: SPACING.sm,
              }}
            >
              {item.unreadCount > 0 && (
                <Badge
                  style={{
                    position: 'absolute',
                    top: SPACING.sm,
                    right: SPACING.sm,
                    backgroundColor: COLORS.error,
                  }}
                >
                  {item.unreadCount}
                </Badge>
              )}
            </LinearGradient>
          </View>

          {/* Group Info */}
          <View style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
              <Avatar.Image 
                size={50} 
                source={{ uri: item.avatar }}
                style={{ 
                  backgroundColor: COLORS.primary,
                  marginRight: SPACING.sm,
                }}
              />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={[TEXT_STYLES.subtitle, { fontWeight: '600', flex: 1 }]}>
                    {item.name}
                  </Text>
                  {item.isOwner && (
                    <Chip
                      mode="outlined"
                      compact
                      style={{
                        height: 24,
                        backgroundColor: COLORS.primary + '20',
                      }}
                      textStyle={{ fontSize: 10, color: COLORS.primary }}
                    >
                      Owner
                    </Chip>
                  )}
                </View>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {item.category}
                </Text>
              </View>
            </View>

            <Text style={[TEXT_STYLES.body, { 
              lineHeight: 20, 
              marginBottom: SPACING.sm,
              color: COLORS.textSecondary,
            }]}>
              {item.description}
            </Text>

            {/* Tags */}
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              marginBottom: SPACING.md 
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
                  textStyle={{ fontSize: 11 }}
                >
                  {tag}
                </Chip>
              ))}
            </View>

            {/* Group Stats */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: SPACING.sm,
              borderTopWidth: 1,
              borderTopColor: '#f0f0f0',
              marginBottom: SPACING.sm,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="people" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { 
                  marginLeft: 4, 
                  color: COLORS.textSecondary 
                }]}>
                  {item.memberCount} members
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="chat" size={16} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { 
                  marginLeft: 4, 
                  color: COLORS.textSecondary 
                }]}>
                  {item.messageCount} messages
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: item.activeMembers > 0 ? COLORS.success : COLORS.textSecondary,
                  marginRight: 4,
                }} />
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  {item.activeMembers} active
                </Text>
              </View>
            </View>

            {/* Recent Activity */}
            {item.recentMessages.length > 0 && (
              <Surface style={{
                padding: SPACING.sm,
                borderRadius: 8,
                backgroundColor: COLORS.background,
                marginBottom: SPACING.sm,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Avatar.Image 
                    size={24} 
                    source={{ uri: item.recentMessages[0].avatar }}
                    style={{ marginRight: SPACING.xs }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[TEXT_STYLES.caption, { 
                      fontWeight: '600',
                      color: COLORS.textPrimary 
                    }]}>
                      {item.recentMessages[0].sender}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                      {item.recentMessages[0].message}
                    </Text>
                  </View>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    {item.recentMessages[0].timestamp}
                  </Text>
                </View>
              </Surface>
            )}

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {item.isMember ? (
                <>
                  <Button
                    mode="contained"
                    onPress={() => handleOpenGroup(item)}
                    style={{ 
                      flex: 0.7,
                      backgroundColor: COLORS.primary,
                    }}
                    icon="chat"
                  >
                    Open Chat
                  </Button>
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => Alert.alert('Feature Coming Soon', 'Group options will be available soon!')}
                  />
                </>
              ) : (
                <>
                  <Button
                    mode="contained"
                    onPress={() => handleJoinGroup(item.id)}
                    style={{ 
                      flex: 0.7,
                      backgroundColor: COLORS.success,
                    }}
                    icon="group-add"
                  >
                    Join Group
                  </Button>
                  <IconButton
                    icon="info"
                    size={20}
                    onPress={() => handleOpenGroup(item)}
                  />
                </>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCreateGroupModal = () => (
    <Modal
      visible={showCreateGroup}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCreateGroup(false)}
    >
      <BlurView style={{ flex: 1 }} blurType="dark" blurAmount={10}>
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          <ScrollView>
            <Surface style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: SPACING.lg,
              maxHeight: '90%',
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: SPACING.lg,
              }}>
                <Text style={[TEXT_STYLES.h3, { flex: 1 }]}>Create New Group</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowCreateGroup(false)}
                />
              </View>

              {/* Group Name */}
              <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
                Group Name *
              </Text>
              <TextInput
                placeholder="Enter group name..."
                value={newGroupName}
                onChangeText={setNewGroupName}
                style={{
                  borderWidth: 1,
                  borderColor: '#e0e0e0',
                  borderRadius: 12,
                  padding: SPACING.md,
                  fontSize: 16,
                  marginBottom: SPACING.lg,
                }}
              />

              {/* Group Description */}
              <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
                Description *
              </Text>
              <TextInput
                multiline
                placeholder="Describe your group's purpose and goals..."
                value={newGroupDescription}
                onChangeText={setNewGroupDescription}
                style={{
                  borderWidth: 1,
                  borderColor: '#e0e0e0',
                  borderRadius: 12,
                  padding: SPACING.md,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  fontSize: 16,
                  marginBottom: SPACING.lg,
                }}
              />

              {/* Group Type Selection */}
              <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
                Group Type
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: SPACING.lg }}
              >
                {groupTypes.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    onPress={() => setSelectedGroupType(type.key)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: SPACING.md,
                      paddingVertical: SPACING.sm,
                      borderRadius: 20,
                      marginRight: SPACING.sm,
                      backgroundColor: selectedGroupType === type.key ? type.color + '20' : '#f5f5f5',
                      borderWidth: selectedGroupType === type.key ? 2 : 0,
                      borderColor: selectedGroupType === type.key ? type.color : 'transparent',
                    }}
                  >
                    <Icon 
                      name={type.icon} 
                      size={18} 
                      color={selectedGroupType === type.key ? type.color : COLORS.textSecondary} 
                    />
                    <Text style={[TEXT_STYLES.caption, {
                      marginLeft: 4,
                      color: selectedGroupType === type.key ? type.color : COLORS.textSecondary,
                      fontWeight: selectedGroupType === type.key ? '600' : 'normal',
                    }]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Privacy Settings */}
              <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.sm }]}>
                Privacy Setting
              </Text>
              <View style={{ marginBottom: SPACING.lg }}>
                {privacyOptions.map((privacy) => (
                  <TouchableOpacity
                    key={privacy.key}
                    onPress={() => setSelectedPrivacy(privacy.key)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: SPACING.md,
                      borderRadius: 12,
                      marginBottom: SPACING.sm,
                      backgroundColor: selectedPrivacy === privacy.key ? COLORS.primary + '10' : '#f5f5f5',
                      borderWidth: selectedPrivacy === privacy.key ? 2 : 0,
                      borderColor: selectedPrivacy === privacy.key ? COLORS.primary : 'transparent',
                    }}
                  >
                    <Icon 
                      name={privacy.icon} 
                      size={24} 
                      color={selectedPrivacy === privacy.key ? COLORS.primary : COLORS.textSecondary} 
                    />
                    <View style={{ flex: 1, marginLeft: SPACING.md }}>
                      <Text style={[TEXT_STYLES.subtitle, {
                        color: selectedPrivacy === privacy.key ? COLORS.primary : COLORS.textPrimary,
                        fontWeight: selectedPrivacy === privacy.key ? '600' : 'normal',
                      }]}>
                        {privacy.label}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { 
                        color: COLORS.textSecondary,
                        marginTop: 2,
                      }]}>
                        {privacy.description}
                      </Text>
                    </View>
                    {selectedPrivacy === privacy.key && (
                      <Icon name="check-circle" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  mode="outlined"
                  onPress={() => setShowCreateGroup(false)}
                  style={{ flex: 0.45 }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreateGroup}
                  style={{ 
                    flex: 0.45,
                    backgroundColor: COLORS.primary,
                  }}
                  disabled={!newGroupName.trim() || !newGroupDescription.trim()}
                >
                  Create Group
                </Button>
              </View>
            </Surface>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    }}>
      <Icon name="group" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, { 
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
        color: COLORS.textSecondary,
      }]}>
        {activeTab === 'my_groups' ? 'No Groups Yet' : 
         activeTab === 'discover' ? 'No Groups to Discover' :
         activeTab === 'trending' ? 'No Trending Groups' : 'No Invites'}
      </Text>
      <Text style={[TEXT_STYLES.body, { 
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginBottom: SPACING.lg,
      }]}>
        {activeTab === 'my_groups' ? 'Join or create groups to start connecting with other trainers!' :
         activeTab === 'discover' ? 'Check back later for new groups to explore!' :
         activeTab === 'trending' ? 'No trending groups at the moment.' : 'You have no pending group invites.'}
      </Text>
      {activeTab === 'my_groups' && (
        <Button
          mode="contained"
          onPress={() => setShowCreateGroup(true)}
          style={{ backgroundColor: COLORS.primary }}
          icon="add"
        >
          Create Your First Group
        </Button>
      )}
    </View>
  );

  const filteredGroups = getFilteredGroups();

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
              Group Discussions 💬
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: '#fff', opacity: 0.9 }]}>
              Connect with Training Communities
            </Text>
          </View>
          <Surface style={{
            borderRadius: 20,
            padding: SPACING.xs,
            backgroundColor: 'rgba(255,255,255,0.2)',
          }}>
            <Icon name="groups" size={24} color="#fff" />
          </Surface>
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: SPACING.md }}>
          <Searchbar
            placeholder="Search groups, topics, trainers..."
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

      {/* Tab Navigation */}
      <Surface style={{
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
      }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
          }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                borderRadius: 20,
                marginRight: SPACING.sm,
                backgroundColor: activeTab === tab.key ? COLORS.primary : 'transparent',
              }}
            >
              <Icon 
                name={tab.icon} 
                size={16} 
                color={activeTab === tab.key ? '#fff' : COLORS.textSecondary} 
              />
              <Text style={[TEXT_STYLES.caption, {
                marginLeft: 4,
                color: activeTab === tab.key ? '#fff' : COLORS.textSecondary,
                fontWeight: activeTab === tab.key ? '600' : 'normal',
              }]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <Badge
                  style={{
                    marginLeft: 4,
                    backgroundColor: activeTab === tab.key ? '#fff' : COLORS.error,
                  }}
                  size={16}
                >
                  <Text style={{
                    fontSize: 10,
                    color: activeTab === tab.key ? COLORS.primary : '#fff',
                    fontWeight: 'bold',
                  }}>
                    {tab.count}
                  </Text>
                </Badge>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Surface>

      {/* Quick Stats */}
      {activeTab === 'my_groups' && (
        <Surface style={{
          margin: SPACING.md,
          padding: SPACING.md,
          borderRadius: 12,
          elevation: 2,
          backgroundColor: '#fff',
        }}>
          <Text style={[TEXT_STYLES.subtitle, { 
            marginBottom: SPACING.sm,
            fontWeight: '600',
          }]}>
            Your Community Impact Today 📊
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.primary, fontWeight: 'bold' }]}>
                43
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Messages Sent
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.success, fontWeight: 'bold' }]}>
                12
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Tips Shared
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.secondary, fontWeight: 'bold' }]}>
                8
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Questions Answered
              </Text>
            </View>
          </View>
        </Surface>
      )}

      {/* Content */}
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
                <Surface style={{ 
                  height: 120, 
                  borderRadius: 8,
                  backgroundColor: '#f0f0f0',
                  marginBottom: SPACING.md,
                }} />
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
                      width: '70%',
                    }} />
                    <Surface style={{ 
                      height: 12, 
                      borderRadius: 6,
                      backgroundColor: '#f5f5f5',
                      width: '50%',
                    }} />
                  </View>
                </View>
                <ProgressBar progress={0.4} color={COLORS.primary} style={{ opacity: 0.5 }} />
              </Card>
            ))}
          </View>
        ) : filteredGroups.length > 0 ? (
          <View style={{ paddingBottom: 100 }}>
            {filteredGroups.map((item, index) => renderGroupCard({ item, index }))}
          </View>
        ) : (
          renderEmptyState()
        )}

        {/* Trending Topics Section */}
        {activeTab === 'discover' && (
          <Surface style={{
            margin: SPACING.md,
            padding: SPACING.md,
            borderRadius: 12,
            elevation: 2,
            backgroundColor: '#fff',
          }}>
            <Text style={[TEXT_STYLES.subtitle, { 
              marginBottom: SPACING.md,
              fontWeight: '600',
            }]}>
              Trending Discussion Topics 🔥
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {['Functional Training', 'Recovery Methods', 'Client Retention', 'Nutrition Planning', 'Youth Athletics'].map((topic, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSearchQuery(topic)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: SPACING.sm,
                    paddingVertical: SPACING.xs,
                    borderRadius: 16,
                    marginRight: SPACING.xs,
                    marginBottom: SPACING.xs,
                    backgroundColor: COLORS.primary + '10',
                  }}
                >
                  <Icon name="trending-up" size={14} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.caption, {
                    marginLeft: 4,
                    color: COLORS.primary,
                    fontWeight: '500',
                  }]}>
                    {topic}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Surface>
        )}

        {/* Group Recommendations */}
        {activeTab === 'discover' && (
          <Surface style={{
            margin: SPACING.md,
            padding: SPACING.md,
            borderRadius: 12,
            elevation: 2,
            backgroundColor: '#fff',
          }}>
            <Text style={[TEXT_STYLES.subtitle, { 
              marginBottom: SPACING.md,
              fontWeight: '600',
            }]}>
              Recommended For You 💡
            </Text>
            <Text style={[TEXT_STYLES.body, { 
              color: COLORS.textSecondary,
              marginBottom: SPACING.md,
            }]}>
              Based on your specialization in strength training and client demographics
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {['Powerlifting Techniques', 'Senior Fitness', 'Sports Conditioning'].map((rec, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  style={{
                    marginRight: SPACING.xs,
                    marginBottom: SPACING.xs,
                    backgroundColor: COLORS.success + '10',
                  }}
                  textStyle={{ color: COLORS.success }}
                  onPress={() => Alert.alert('Feature Coming Soon', 'Group recommendations will be available soon!')}
                >
                  {rec}
                </Chip>
              ))}
            </View>
          </Surface>
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
        onPress={() => setShowCreateGroup(true)}
        label="New Group"
        visible={!showCreateGroup}
      />

      {/* Create Group Modal */}
      {renderCreateGroupModal()}

      {/* Bottom Navigation */}
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
          onPress={() => navigation.navigate('DirectMessages')}
        >
          <Icon name="message" size={20} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.caption, { 
            marginLeft: 4, 
            color: COLORS.primary,
            fontWeight: '600',
          }]}>
            Direct Messages
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
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={{ position: 'relative' }}>
            <Icon name="notifications" size={20} color={COLORS.secondary} />
            <Badge
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: COLORS.error,
              }}
              size={16}
            >
              5
            </Badge>
          </View>
          <Text style={[TEXT_STYLES.caption, { 
            marginLeft: 4, 
            color: COLORS.secondary,
            fontWeight: '600',
          }]}>
            Notifications
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
          onPress={() => navigation.navigate('GroupSettings')}
        >
          <Icon name="settings" size={20} color={COLORS.success} />
          <Text style={[TEXT_STYLES.caption, { 
            marginLeft: 4, 
            color: COLORS.success,
            fontWeight: '600',
          }]}>
            Settings
          </Text>
        </TouchableOpacity>
      </Surface>
    </View>
  );
};

export default GroupDiscussions;
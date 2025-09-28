import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  Surface,
  Portal,
  Modal,
  FAB,
  IconButton,
  Badge,
  Searchbar,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const TrainingPartnerChat = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [availablePartners, setAvailablePartners] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const scrollViewRef = useRef();

  // Mock data for demonstration
  const mockConversations = [
    {
      id: 'chat_1',
      type: 'individual',
      participant: {
        id: 'partner_1',
        name: 'Alex Martinez',
        avatar: 'https://example.com/alex.jpg',
        status: 'online',
        sport: 'Football',
        position: 'Midfielder',
        isVerified: false,
      },
      lastMessage: {
        id: 'msg_1',
        text: 'Great job in today\'s training! Your passing accuracy has improved so much 💪',
        senderId: 'partner_1',
        timestamp: '2024-08-22T14:30:00Z',
        type: 'text',
        isRead: true,
      },
      unreadCount: 0,
      isPinned: false,
      isActive: true,
      sharedWorkouts: 15,
      commonGoals: ['Speed Training', 'Endurance'],
    },
    {
      id: 'chat_2',
      type: 'group',
      groupName: 'Team Alpha Squad 🦅',
      groupAvatar: 'https://example.com/team-alpha.jpg',
      participants: [
        { id: 'p1', name: 'Emma Wilson', avatar: 'https://example.com/emma.jpg' },
        { id: 'p2', name: 'Jake Thompson', avatar: 'https://example.com/jake.jpg' },
        { id: 'p3', name: 'Maya Patel', avatar: 'https://example.com/maya.jpg' },
        { id: 'p4', name: 'Current User', avatar: 'https://example.com/user.jpg' },
      ],
      lastMessage: {
        id: 'msg_2',
        text: 'Who\'s joining the morning run tomorrow? 🏃‍♀️',
        senderId: 'p1',
        senderName: 'Emma Wilson',
        timestamp: '2024-08-22T12:15:00Z',
        type: 'text',
        isRead: false,
      },
      unreadCount: 3,
      isPinned: true,
      isActive: true,
      createdBy: 'p1',
      sport: 'Cross Training',
    },
    {
      id: 'chat_3',
      type: 'individual',
      participant: {
        id: 'partner_2',
        name: 'Sarah Johnson',
        avatar: 'https://example.com/sarah.jpg',
        status: 'offline',
        lastSeen: '2024-08-22T10:00:00Z',
        sport: 'Tennis',
        position: 'Singles Player',
        isVerified: true,
      },
      lastMessage: {
        id: 'msg_3',
        text: 'Check out this new training technique I found! 🎾',
        senderId: 'partner_2',
        timestamp: '2024-08-21T18:45:00Z',
        type: 'text',
        isRead: true,
      },
      unreadCount: 0,
      isPinned: false,
      isActive: true,
      sharedWorkouts: 8,
      commonGoals: ['Agility', 'Coordination'],
    },
    {
      id: 'chat_4',
      type: 'group',
      groupName: 'Study Buddies 📚',
      groupAvatar: 'https://example.com/study-group.jpg',
      participants: [
        { id: 's1', name: 'Mike Torres', avatar: 'https://example.com/mike.jpg' },
        { id: 's2', name: 'Lisa Chen', avatar: 'https://example.com/lisa.jpg' },
        { id: 's3', name: 'Current User', avatar: 'https://example.com/user.jpg' },
      ],
      lastMessage: {
        id: 'msg_4',
        text: 'Anyone up for reviewing nutrition plans tonight?',
        senderId: 's1',
        senderName: 'Mike Torres',
        timestamp: '2024-08-21T16:20:00Z',
        type: 'text',
        isRead: false,
      },
      unreadCount: 1,
      isPinned: false,
      isActive: true,
      createdBy: 's1',
      sport: 'General Fitness',
    },
    {
      id: 'chat_5',
      type: 'individual',
      participant: {
        id: 'partner_3',
        name: 'David Kim',
        avatar: 'https://example.com/david.jpg',
        status: 'training',
        sport: 'Basketball',
        position: 'Point Guard',
        isVerified: false,
      },
      lastMessage: {
        id: 'msg_5',
        text: 'Thanks for the motivation! Crushed my PR today 🏀',
        senderId: 'current_user',
        timestamp: '2024-08-21T14:10:00Z',
        type: 'text',
        isRead: true,
      },
      unreadCount: 0,
      isPinned: false,
      isActive: false,
      sharedWorkouts: 22,
      commonGoals: ['Vertical Jump', 'Ball Handling'],
    },
  ];

  const mockAvailablePartners = [
    { id: 'ap1', name: 'Jordan Lee', avatar: 'https://example.com/jordan.jpg', sport: 'Swimming' },
    { id: 'ap2', name: 'Casey Brown', avatar: 'https://example.com/casey.jpg', sport: 'Track & Field' },
    { id: 'ap3', name: 'Riley Davis', avatar: 'https://example.com/riley.jpg', sport: 'Cycling' },
    { id: 'ap4', name: 'Taylor Swift', avatar: 'https://example.com/taylor.jpg', sport: 'Gymnastics' },
  ];

  useEffect(() => {
    loadConversations();
    loadAvailablePartners();
    startAnimation();
  }, []);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchQuery, selectedFilter]);

  const startAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConversations(mockConversations);
    } catch (error) {
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePartners = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setAvailablePartners(mockAvailablePartners);
    } catch (error) {
      console.log('Failed to load available partners');
    }
  };

  const filterConversations = () => {
    let filtered = conversations;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(conv => {
        const searchTarget = conv.type === 'individual' 
          ? conv.participant.name.toLowerCase()
          : conv.groupName.toLowerCase();
        return searchTarget.includes(searchQuery.toLowerCase());
      });
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'individual':
        filtered = filtered.filter(conv => conv.type === 'individual');
        break;
      case 'groups':
        filtered = filtered.filter(conv => conv.type === 'group');
        break;
      case 'unread':
        filtered = filtered.filter(conv => conv.unreadCount > 0);
        break;
      case 'active':
        filtered = filtered.filter(conv => conv.isActive);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Sort by pinned first, then by last message timestamp
    filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return b.isPinned - a.isPinned;
      }
      return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
    });

    setFilteredConversations(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, []);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.floor((now - messageTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return COLORS.success;
      case 'training': return COLORS.warning;
      case 'offline': 
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status, lastSeen) => {
    switch (status) {
      case 'online': return 'Online';
      case 'training': return 'Training';
      case 'offline': 
        if (lastSeen) {
          const diffInHours = Math.floor((new Date() - new Date(lastSeen)) / (1000 * 60 * 60));
          if (diffInHours < 24) return `Last seen ${diffInHours}h ago`;
          return `Last seen ${Math.floor(diffInHours / 24)}d ago`;
        }
        return 'Offline';
      default: return 'Unknown';
    }
  };

  const handleConversationPress = (conversation) => {
    Vibration.vibrate(50);
    
    // Mark as read if there are unread messages
    if (conversation.unreadCount > 0) {
      const updatedConversations = conversations.map(conv =>
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, isRead: true }}
          : conv
      );
      setConversations(updatedConversations);
    }

    // Navigate to chat screen
    navigation.navigate('ChatMessages', { 
      conversationId: conversation.id,
      conversationData: conversation 
    });
  };

  const handlePinConversation = (conversationId) => {
    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId 
        ? { ...conv, isPinned: !conv.isPinned }
        : conv
    );
    setConversations(updatedConversations);
    
    const conversation = conversations.find(c => c.id === conversationId);
    Alert.alert(
      'Success', 
      conversation?.isPinned ? 'Conversation unpinned' : 'Conversation pinned'
    );
  };

  const handleDeleteConversation = (conversationId) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
            setConversations(updatedConversations);
          },
        },
      ]
    );
  };

  const toggleParticipantSelection = (partner) => {
    const isSelected = selectedParticipants.find(p => p.id === partner.id);
    if (isSelected) {
      setSelectedParticipants(selectedParticipants.filter(p => p.id !== partner.id));
    } else {
      setSelectedParticipants([...selectedParticipants, partner]);
    }
  };

  const createGroupChat = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedParticipants.length < 2) {
      Alert.alert('Error', 'Please select at least 2 participants');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newGroup = {
        id: `chat_${Date.now()}`,
        type: 'group',
        groupName: groupName,
        groupAvatar: 'https://example.com/default-group.jpg',
        participants: [...selectedParticipants, { 
          id: user?.id || 'current_user',
          name: user?.name || 'You',
          avatar: user?.avatar || 'https://example.com/user.jpg'
        }],
        lastMessage: {
          id: `msg_${Date.now()}`,
          text: 'Group created! Let\'s start training together! 💪',
          senderId: user?.id || 'current_user',
          senderName: user?.name || 'You',
          timestamp: new Date().toISOString(),
          type: 'system',
          isRead: true,
        },
        unreadCount: 0,
        isPinned: false,
        isActive: true,
        createdBy: user?.id || 'current_user',
        sport: 'General Training',
      };

      setConversations([newGroup, ...conversations]);
      setShowCreateGroupModal(false);
      setGroupName('');
      setSelectedParticipants([]);
      
      Alert.alert('Success', 'Group chat created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create group chat');
    }
  };

  const renderConversationCard = (conversation) => {
    const isGroup = conversation.type === 'group';
    
    return (
      <TouchableOpacity
        key={conversation.id}
        onPress={() => handleConversationPress(conversation)}
        onLongPress={() => {
          Alert.alert(
            'Conversation Options',
            'What would you like to do?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: conversation.isPinned ? 'Unpin' : 'Pin',
                onPress: () => handlePinConversation(conversation.id),
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => handleDeleteConversation(conversation.id),
              },
            ]
          );
        }}
      >
        <Card style={[
          styles.conversationCard,
          conversation.unreadCount > 0 && styles.unreadCard,
          conversation.isPinned && styles.pinnedCard
        ]}>
          <Card.Content>
            <View style={styles.conversationHeader}>
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
                {isGroup ? (
                  <View style={styles.groupAvatarContainer}>
                    <Avatar.Image
                      size={50}
                      source={{ uri: conversation.groupAvatar }}
                      style={styles.groupAvatar}
                    />
                    <View style={styles.participantCount}>
                      <Text style={styles.participantCountText}>
                        {conversation.participants.length}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.individualAvatarContainer}>
                    <Avatar.Image
                      size={50}
                      source={{ uri: conversation.participant.avatar }}
                      style={styles.individualAvatar}
                    />
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(conversation.participant.status) }
                    ]} />
                    {conversation.participant.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Icon name="verified" size={12} color={COLORS.primary} />
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Conversation Info */}
              <View style={styles.conversationInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.conversationName} numberOfLines={1}>
                    {isGroup ? conversation.groupName : conversation.participant.name}
                  </Text>
                  {conversation.isPinned && (
                    <Icon name="push-pin" size={14} color={COLORS.warning} />
                  )}
                  {conversation.unreadCount > 0 && (
                    <Badge style={styles.unreadBadge} size={20}>
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </Badge>
                  )}
                </View>

                <Text style={styles.conversationSubtitle} numberOfLines={1}>
                  {isGroup 
                    ? `${conversation.participants.length} members • ${conversation.sport}`
                    : `${conversation.participant.sport} • ${getStatusText(conversation.participant.status, conversation.participant.lastSeen)}`
                  }
                </Text>

                <View style={styles.lastMessageRow}>
                  <Text style={[
                    styles.lastMessageText,
                    conversation.unreadCount > 0 && styles.unreadMessageText
                  ]} numberOfLines={1}>
                    {isGroup && conversation.lastMessage.senderName ? 
                      `${conversation.lastMessage.senderName}: ${conversation.lastMessage.text}` :
                      conversation.lastMessage.text
                    }
                  </Text>
                </View>

                {/* Training Stats for Individual Chats */}
                {!isGroup && conversation.sharedWorkouts && (
                  <View style={styles.trainingStats}>
                    <View style={styles.statItem}>
                      <Icon name="fitness-center" size={12} color={COLORS.primary} />
                      <Text style={styles.statText}>{conversation.sharedWorkouts} shared workouts</Text>
                    </View>
                    {conversation.commonGoals && conversation.commonGoals.length > 0 && (
                      <View style={styles.commonGoals}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {conversation.commonGoals.map((goal, index) => (
                            <Chip
                              key={index}
                              mode="outlined"
                              style={styles.goalChip}
                              textStyle={styles.goalChipText}
                            >
                              {goal}
                            </Chip>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Time and Actions */}
              <View style={styles.timeActions}>
                <Text style={styles.timeText}>
                  {formatTimestamp(conversation.lastMessage.timestamp)}
                </Text>
                <IconButton
                  icon="dots-vertical"
                  size={18}
                  onPress={() => {
                    Alert.alert(
                      'Quick Actions',
                      'Choose an action',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: conversation.isPinned ? 'Unpin' : 'Pin',
                          onPress: () => handlePinConversation(conversation.id),
                        },
                        { text: 'Mute', onPress: () => Alert.alert('Feature', 'Mute feature coming soon!') },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => handleDeleteConversation(conversation.id),
                        },
                      ]
                    );
                  }}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="chat" size={80} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>No Conversations</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start chatting with your training partners and build stronger connections!
      </Text>
      <Button
        mode="contained"
        onPress={() => setShowCreateGroupModal(true)}
        style={styles.emptyStateButton}
      >
        Create Group Chat
      </Button>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="chat" size={60} color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Training Partners</Text>
        <Text style={styles.headerSubtitle}>
          Connect and chat with your training community
        </Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search conversations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { key: 'all', label: 'All Chats', icon: 'chat' },
          { key: 'individual', label: 'Individual', icon: 'person' },
          { key: 'groups', label: 'Groups', icon: 'group' },
          { key: 'unread', label: 'Unread', icon: 'mark-chat-unread' },
          { key: 'active', label: 'Active', icon: 'radio-button-checked' },
        ].map((filter) => (
          <Chip
            key={filter.key}
            mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
            selected={selectedFilter === filter.key}
            onPress={() => setSelectedFilter(filter.key)}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.selectedFilterChip
            ]}
            textStyle={[
              styles.filterChipText,
              selectedFilter === filter.key && styles.selectedFilterChipText
            ]}
            icon={filter.icon}
          >
            {filter.label}
          </Chip>
        ))}
      </ScrollView>

      {/* Conversations List */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
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
          {filteredConversations.length > 0 ? (
            <>
              {filteredConversations.map(renderConversationCard)}
              <View style={styles.bottomSpacer} />
            </>
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
      </Animated.View>

      {/* Create Group FAB */}
      <FAB
        icon="group-add"
        style={styles.fab}
        onPress={() => setShowCreateGroupModal(true)}
        label="New Group"
      />

      {/* Create Group Modal */}
      <Portal>
        <Modal
          visible={showCreateGroupModal}
          onDismiss={() => {
            setShowCreateGroupModal(false);
            setGroupName('');
            setSelectedParticipants([]);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
          >
            <Surface style={styles.createGroupModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Group Chat</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowCreateGroupModal(false);
                    setGroupName('');
                    setSelectedParticipants([]);
                  }}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Group Name Input */}
                <View style={styles.groupNameSection}>
                  <Text style={styles.sectionTitle}>Group Name</Text>
                  <TextInput
                    style={styles.groupNameInput}
                    placeholder="Enter group name..."
                    value={groupName}
                    onChangeText={setGroupName}
                    maxLength={50}
                  />
                </View>

                {/* Participants Selection */}
                <View style={styles.participantsSection}>
                  <Text style={styles.sectionTitle}>
                    Add Participants ({selectedParticipants.length} selected)
                  </Text>
                  
                  {/* Selected Participants */}
                  {selectedParticipants.length > 0 && (
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={styles.selectedParticipants}
                    >
                      {selectedParticipants.map((participant) => (
                        <View key={participant.id} style={styles.selectedParticipant}>
                          <Avatar.Image
                            size={40}
                            source={{ uri: participant.avatar }}
                          />
                          <TouchableOpacity
                            style={styles.removeParticipant}
                            onPress={() => toggleParticipantSelection(participant)}
                          >
                            <Icon name="close" size={16} color="white" />
                          </TouchableOpacity>
                          <Text style={styles.participantName} numberOfLines={1}>
                            {participant.name}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  )}

                  {/* Available Partners */}
                  <View style={styles.availablePartners}>
                    {availablePartners.map((partner) => {
                      const isSelected = selectedParticipants.find(p => p.id === partner.id);
                      return (
                        <TouchableOpacity
                          key={partner.id}
                          style={[
                            styles.partnerItem,
                            isSelected && styles.selectedPartnerItem
                          ]}
                          onPress={() => toggleParticipantSelection(partner)}
                        >
                          <Avatar.Image
                            size={40}
                            source={{ uri: partner.avatar }}
                          />
                          <View style={styles.partnerInfo}>
                            <Text style={styles.partnerName}>{partner.name}</Text>
                            <Text style={styles.partnerSport}>{partner.sport}</Text>
                          </View>
                          {isSelected && (
                            <Icon name="check-circle" size={24} color={COLORS.success} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowCreateGroupModal(false);
                    setGroupName('');
                    setSelectedParticipants([]);
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={createGroupChat}
                  style={styles.createButton}
                  disabled={!groupName.trim() || selectedParticipants.length < 2}
                >
                  Create Group
                </Button>
              </View>
            </Surface>
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
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: 'white',
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterContent: {
    paddingHorizontal: SPACING.lg,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  conversationCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  pinnedCard: {
    backgroundColor: 'rgba(102, 126, 234, 0.02)',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSection: {
    marginRight: SPACING.sm,
  },
  groupAvatarContainer: {
    position: 'relative',
  },
  groupAvatar: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  participantCount: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  participantCountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  individualAvatarContainer: {
    position: 'relative',
  },
  individualAvatar: {
    backgroundColor: COLORS.surface,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 2,
  },
  conversationInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  conversationName: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    flex: 1,
    marginRight: SPACING.xs,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  conversationSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  lastMessageRow: {
    marginBottom: SPACING.xs,
  },
  lastMessageText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  unreadMessageText: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  trainingStats: {
    marginTop: SPACING.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  commonGoals: {
    marginTop: 4,
  },
  goalChip: {
    marginRight: SPACING.xs,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: COLORS.primary,
    height: 24,
  },
  goalChipText: {
    fontSize: 10,
    color: COLORS.primary,
  },
  timeActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
  },
  timeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h2,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
  },
  emptyStateSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyStateButton: {
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createGroupModal: {
    width: width - SPACING.xl,
    maxHeight: height * 0.8,
    borderRadius: 12,
    padding: SPACING.lg,
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
  closeButton: {
    padding: SPACING.xs,
  },
  modalContent: {
    maxHeight: height * 0.5,
  },
  groupNameSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  groupNameInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    ...TEXT_STYLES.body,
  },
  participantsSection: {
    marginBottom: SPACING.lg,
  },
  selectedParticipants: {
    marginBottom: SPACING.lg,
  },
  selectedParticipant: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 60,
  },
  removeParticipant: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantName: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  availablePartners: {
    maxHeight: 200,
  },
  partnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  selectedPartnerItem: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  partnerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  partnerName: {
    ...TEXT_STYLES.subtitle,
    fontWeight: '500',
  },
  partnerSport: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  createButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
};

export default TrainingPartnerChat;
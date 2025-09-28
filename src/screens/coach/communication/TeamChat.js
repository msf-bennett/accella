import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Badge,
  Searchbar,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const { width, height } = Dimensions.get('window');

const TeamChat = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { team, messages, loading } = useSelector(state => state.chat);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('team'); // 'team', 'individual'
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const scrollViewRef = useRef(null);
  const textInputRef = useRef(null);

  // Sample team data
  const sampleTeam = {
    id: 1,
    name: 'Elite Football Academy U-16',
    coach: 'Coach Sarah Miller',
    totalPlayers: 18,
    activeChats: 5,
    unreadMessages: 12,
    players: [
      {
        id: 1,
        name: 'Emma Johnson',
        position: 'Forward',
        avatar: 'EJ',
        online: true,
        lastSeen: 'Now',
        unreadCount: 3,
        performance: 92,
        attendance: 95,
      },
      {
        id: 2,
        name: 'Alex Rodriguez',
        position: 'Midfielder',
        avatar: 'AR',
        online: false,
        lastSeen: '2 hours ago',
        unreadCount: 0,
        performance: 88,
        attendance: 90,
      },
      {
        id: 3,
        name: 'Maya Patel',
        position: 'Defender',
        avatar: 'MP',
        online: true,
        lastSeen: 'Now',
        unreadCount: 1,
        performance: 85,
        attendance: 98,
      },
      {
        id: 4,
        name: 'James Wilson',
        position: 'Goalkeeper',
        avatar: 'JW',
        online: false,
        lastSeen: '1 day ago',
        unreadCount: 0,
        performance: 90,
        attendance: 92,
      },
      {
        id: 5,
        name: 'Sophie Chen',
        position: 'Forward',
        avatar: 'SC',
        online: true,
        lastSeen: 'Now',
        unreadCount: 2,
        performance: 87,
        attendance: 94,
      },
      {
        id: 6,
        name: 'David Thompson',
        position: 'Midfielder',
        avatar: 'DT',
        online: false,
        lastSeen: '30 minutes ago',
        unreadCount: 0,
        performance: 89,
        attendance: 96,
      },
    ],
  };

  // Sample messages data
  const sampleTeamMessages = [
    {
      id: 1,
      type: 'coach',
      sender: 'Coach Sarah',
      message: 'Great job in today\'s practice everyone! Remember to work on the passing drills we covered.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      reactions: [
        { emoji: '👍', count: 12, users: ['Emma', 'Alex', 'Maya'] },
        { emoji: '⚽', count: 8, users: ['James', 'Sophie'] },
      ],
      isPinned: true,
    },
    {
      id: 2,
      type: 'announcement',
      sender: 'System',
      message: 'Match scheduled: Elite Academy vs City Stars - Saturday 2:00 PM at Central Stadium',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      reactions: [
        { emoji: '🔥', count: 15, users: ['Emma', 'Alex'] },
        { emoji: '💪', count: 10, users: ['Maya', 'James'] },
      ],
      isPinned: false,
    },
    {
      id: 3,
      type: 'player',
      sender: 'Emma Johnson',
      message: 'Coach, what time should we arrive for warm-up before the match?',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      reactions: [],
      isPinned: false,
    },
    {
      id: 4,
      type: 'coach',
      sender: 'Coach Sarah',
      message: 'Please arrive by 1:00 PM for warm-up and team talk. Don\'t forget your water bottles! 💧',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      reactions: [
        { emoji: '👍', count: 8, users: ['Emma', 'Alex'] },
      ],
      isPinned: false,
    },
    {
      id: 5,
      type: 'player',
      sender: 'Alex Rodriguez',
      message: 'Thanks Coach! Should we bring our backup jerseys?',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      reactions: [],
      isPinned: false,
    },
  ];

  // Quick message templates
  const quickMessages = [
    { id: 1, text: 'Great job in practice today! 👏', category: 'praise' },
    { id: 2, text: 'Remember to practice the drills we covered', category: 'reminder' },
    { id: 3, text: 'Match tomorrow at 2 PM - don\'t be late!', category: 'reminder' },
    { id: 4, text: 'Excellent improvement this week! Keep it up! 🔥', category: 'praise' },
    { id: 5, text: 'Please confirm your attendance for next session', category: 'question' },
    { id: 6, text: 'Stay hydrated and get plenty of rest 💪', category: 'advice' },
  ];

  // Effects
  useEffect(() => {
    loadTeamChat();
    animateTabChange();
  }, [selectedTab]);

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [sampleTeamMessages]);

  // Handlers
  const loadTeamChat = useCallback(async () => {
    try {
      // dispatch(loadTeamMessages());
      // dispatch(loadTeamPlayers());
    } catch (error) {
      Alert.alert('Error', 'Failed to load team chat');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTeamChat();
    setRefreshing(false);
  }, [loadTeamChat]);

  const animateTabChange = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: selectedTab === 'team' ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTabChange = (tab) => {
    if (tab !== selectedTab) {
      setSelectedTab(tab);
      Vibration.vibrate(50);
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // dispatch(sendTeamMessage(messageText));
      setMessageText('');
      Vibration.vibrate(50);
      
      // Simulate message sent
      Alert.alert('Message Sent', 'Your message has been sent to the team!');
    }
  };

  const handleQuickMessage = (message) => {
    setMessageText(message.text);
    textInputRef.current?.focus();
    Vibration.vibrate(50);
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
    Vibration.vibrate(50);
  };

  const handleMessagePlayer = (player) => {
    setShowPlayerModal(false);
    navigation.navigate('IndividualChat', { player });
    Vibration.vibrate(50);
  };

  const handleReaction = (messageId, emoji) => {
    // dispatch(addMessageReaction(messageId, emoji));
    Vibration.vibrate(50);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} min ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredPlayers = sampleTeam.players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render functions
  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.teamName}>{sampleTeam.name}</Text>
            <Text style={styles.teamDetails}>
              {sampleTeam.totalPlayers} players • {sampleTeam.activeChats} active chats
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={() => navigation.navigate('TeamInfo')}
            >
              <Icon name="info" size={24} color="white" />
              {sampleTeam.unreadMessages > 0 && (
                <Badge
                  visible={true}
                  size={18}
                  style={styles.headerBadge}
                >
                  {sampleTeam.unreadMessages}
                </Badge>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'team' && styles.activeTab,
            ]}
            onPress={() => handleTabChange('team')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'team' && styles.activeTabText,
            ]}>
              Team Chat
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'individual' && styles.activeTab,
            ]}
            onPress={() => handleTabChange('individual')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'individual' && styles.activeTabText,
            ]}>
              Individual
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTeamChat = () => (
    <Animated.View style={[styles.chatContainer, { opacity: fadeAnim }]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
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
        {sampleTeamMessages.map((message) => (
          <View key={message.id} style={styles.messageWrapper}>
            {message.isPinned && (
              <View style={styles.pinnedIndicator}>
                <Icon name="push-pin" size={16} color={COLORS.warning} />
                <Text style={styles.pinnedText}>Pinned Message</Text>
              </View>
            )}
            
            <View style={[
              styles.messageContainer,
              message.type === 'coach' && styles.coachMessage,
              message.type === 'announcement' && styles.announcementMessage,
            ]}>
              <View style={styles.messageHeader}>
                <Avatar.Text
                  size={32}
                  label={message.sender.charAt(0)}
                  style={[
                    styles.messageAvatar,
                    message.type === 'coach' && styles.coachAvatar,
                    message.type === 'announcement' && styles.announcementAvatar,
                  ]}
                  labelStyle={styles.avatarLabel}
                />
                <View style={styles.messageInfo}>
                  <Text style={[
                    styles.senderName,
                    message.type === 'coach' && styles.coachSenderName,
                  ]}>
                    {message.sender}
                    {message.type === 'coach' && (
                      <Icon name="verified" size={16} color={COLORS.primary} style={styles.verifiedIcon} />
                    )}
                  </Text>
                  <Text style={styles.messageTime}>
                    {formatTimestamp(message.timestamp)}
                  </Text>
                </View>
              </View>

              <Text style={styles.messageText}>{message.message}</Text>

              {message.reactions.length > 0 && (
                <View style={styles.reactionsContainer}>
                  {message.reactions.map((reaction, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.reactionChip}
                      onPress={() => handleReaction(message.id, reaction.emoji)}
                    >
                      <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                      <Text style={styles.reactionCount}>{reaction.count}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.addReactionButton}
                    onPress={() => handleReaction(message.id, '👍')}
                  >
                    <Icon name="add" size={16} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Quick Messages */}
      <View style={styles.quickMessagesContainer}>
        <Text style={styles.quickMessagesTitle}>Quick Messages</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickMessages}
        >
          {quickMessages.map((message) => (
            <TouchableOpacity
              key={message.id}
              style={styles.quickMessageChip}
              onPress={() => handleQuickMessage(message)}
            >
              <Text style={styles.quickMessageText}>{message.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Message Input */}
      <View style={styles.messageInputContainer}>
        <View style={styles.messageInputWrapper}>
          <TextInput
            ref={textInputRef}
            style={styles.messageInput}
            placeholder="Type a message to your team..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowMessageOptions(true)}
          >
            <Icon name="attach-file" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.sendButton,
            messageText.trim() && styles.sendButtonActive,
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Icon
            name="send"
            size={24}
            color={messageText.trim() ? 'white' : COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderIndividualChats = () => (
    <Animated.View style={[styles.chatContainer, { opacity: fadeAnim }]}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search players..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      <ScrollView
        style={styles.playersContainer}
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
        {filteredPlayers.map((player) => (
          <TouchableOpacity
            key={player.id}
            style={styles.playerItem}
            onPress={() => handlePlayerSelect(player)}
          >
            <View style={styles.playerInfo}>
              <View style={styles.playerAvatarContainer}>
                <Avatar.Text
                  size={48}
                  label={player.avatar}
                  style={styles.playerAvatar}
                  labelStyle={styles.playerAvatarLabel}
                />
                {player.online && <View style={styles.onlineIndicator} />}
                {player.unreadCount > 0 && (
                  <Badge
                    visible={true}
                    size={20}
                    style={styles.unreadBadge}
                  >
                    {player.unreadCount}
                  </Badge>
                )}
              </View>

              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerPosition}>{player.position}</Text>
                <Text style={styles.playerLastSeen}>
                  {player.online ? 'Online' : `Last seen ${player.lastSeen}`}
                </Text>
              </View>
            </View>

            <View style={styles.playerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Performance</Text>
                <Text style={styles.statValue}>{player.performance}%</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Attendance</Text>
                <Text style={styles.statValue}>{player.attendance}%</Text>
              </View>
            </View>

            <IconButton
              icon="chevron-right"
              iconColor={COLORS.textSecondary}
              onPress={() => handlePlayerSelect(player)}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderPlayerModal = () => (
    <Portal>
      <Modal
        visible={showPlayerModal}
        onDismiss={() => setShowPlayerModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedPlayer && (
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Avatar.Text
                size={64}
                label={selectedPlayer.avatar}
                style={styles.modalAvatar}
                labelStyle={styles.modalAvatarLabel}
              />
              <View style={styles.modalPlayerInfo}>
                <Text style={styles.modalPlayerName}>{selectedPlayer.name}</Text>
                <Text style={styles.modalPlayerPosition}>{selectedPlayer.position}</Text>
                <View style={styles.modalPlayerStats}>
                  <Chip
                    compact
                    style={styles.modalStatChip}
                    textStyle={styles.modalStatText}
                  >
                    Performance: {selectedPlayer.performance}%
                  </Chip>
                  <Chip
                    compact
                    style={styles.modalStatChip}
                    textStyle={styles.modalStatText}
                  >
                    Attendance: {selectedPlayer.attendance}%
                  </Chip>
                </View>
              </View>
            </View>

            <Divider style={styles.modalDivider} />

            <View style={styles.modalActions}>
              <Button
                mode="contained"
                onPress={() => handleMessagePlayer(selectedPlayer)}
                style={styles.modalButton}
                labelStyle={styles.modalButtonLabel}
                icon="chat"
              >
                Send Message
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('PlayerProfile', { player: selectedPlayer })}
                style={styles.modalButton}
                labelStyle={styles.modalButtonOutlineLabel}
                icon="person"
              >
                View Profile
              </Button>
            </View>
          </Surface>
        )}
      </Modal>
    </Portal>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
      {selectedTab === 'team' ? renderTeamChat() : renderIndividualChats()}
      
      {renderPlayerModal()}

      {selectedTab === 'team' && (
        <FAB
          icon="campaign"
          style={styles.fab}
          color="white"
          onPress={() => {
            Alert.alert(
              'Send Announcement',
              'Send an important announcement to all team members?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Send', onPress: () => navigation.navigate('SendAnnouncement') },
              ]
            );
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerInfo: {
    flex: 1,
  },
  teamName: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  teamDetails: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerAction: {
    padding: SPACING.xs,
    position: 'relative',
  },
  headerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  messageWrapper: {
    marginBottom: SPACING.md,
  },
  pinnedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  pinnedText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    fontWeight: '600',
  },
  messageContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: SPACING.md,
    elevation: 1,
  },
  coachMessage: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  announcementMessage: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    backgroundColor: COLORS.warning + '10',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  messageAvatar: {
    backgroundColor: COLORS.surface,
  },
  coachAvatar: {
    backgroundColor: COLORS.primaryLight,
  },
  announcementAvatar: {
    backgroundColor: COLORS.warning + '20',
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageInfo: {
    flex: 1,
  },
  senderName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  coachSenderName: {
    color: COLORS.primary,
  },
  verifiedIcon: {
    marginLeft: SPACING.xs,
  },
  messageTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  messageText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  addReactionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: 32,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickMessagesContainer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: 'white',
  },
  quickMessagesTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  quickMessages: {
    gap: SPACING.sm,
  },
  quickMessageChip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  quickMessageText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  messageInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  messageInput: {
    flex: 1,
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    maxHeight: 100,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  attachButton: {
    padding: SPACING.xs,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    backgroundColor: COLORS.surface,
    elevation: 0,
  },
  playersContainer: {
    flex: 1,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  playerAvatarContainer: {
    position: 'relative',
  },
  playerAvatar: {
    backgroundColor: COLORS.primaryLight,
  },
  playerAvatarLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: 'white',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  playerPosition: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  playerLastSeen: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: SPACING.xs,
  },
  playerStats: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  statValue: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    elevation: 8,
    maxWidth: width * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  modalAvatar: {
    backgroundColor: COLORS.primaryLight,
  },
  modalAvatarLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalPlayerInfo: {
    flex: 1,
  },
  modalPlayerName: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalPlayerPosition: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  modalPlayerStats: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  modalStatChip: {
    backgroundColor: COLORS.surface,
    height: 28,
  },
  modalStatText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  modalDivider: {
    backgroundColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  modalActions: {
    gap: SPACING.md,
  },
  modalButton: {
    borderRadius: 12,
  },
  modalButtonLabel: {
    color: 'white',
    fontWeight: '600',
  },
  modalButtonOutlineLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    elevation: 8,
  },
});

export default TeamChat;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
  Vibration,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  FlatList,
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
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/styles';

const { width, height } = Dimensions.get('window');

const TeamMessages = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { messages, conversations, unreadCount } = useSelector(state => state.messages);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const chatScrollRef = useRef(null);

  useEffect(() => {
    loadMessages();
    animateEntrance();
    
    // Set up real-time message listeners
    const messageListener = setupMessageListener();
    
    return () => {
      if (messageListener) {
        messageListener();
      }
    };
  }, []);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadMessages = useCallback(async () => {
    try {
      // Dispatch action to load messages
      // dispatch(loadTeamMessages());
      
      // Mock data for demonstration
      const mockConversations = [
        {
          id: 1,
          name: "Eagles Soccer Team",
          type: "team",
          avatar: "https://via.placeholder.com/50",
          lastMessage: "Great practice today everyone! 💪",
          lastMessageTime: "2 min ago",
          unreadCount: 3,
          members: 15,
          isCoach: true,
        },
        {
          id: 2,
          name: "Coach Martinez",
          type: "direct",
          avatar: "https://via.placeholder.com/50",
          lastMessage: "Your form is improving nicely",
          lastMessageTime: "1h ago",
          unreadCount: 0,
          isCoach: false,
        },
        {
          id: 3,
          name: "Training Group A",
          type: "group",
          avatar: "https://via.placeholder.com/50",
          lastMessage: "Who's joining tomorrow's session?",
          lastMessageTime: "3h ago",
          unreadCount: 1,
          members: 8,
          isCoach: false,
        },
      ];
      
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  }, [dispatch]);

  const setupMessageListener = () => {
    // Set up real-time message listener
    // This would integrate with your real-time messaging service
    console.log('Setting up message listener...');
    
    // Return cleanup function
    return () => {
      console.log('Cleaning up message listener...');
    };
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  }, [loadMessages]);

  const handleConversationPress = (conversation) => {
    Vibration.vibrate(50);
    setSelectedConversation(conversation);
    setShowChatModal(true);
    
    // Mark as read
    if (conversation.unreadCount > 0) {
      // dispatch(markConversationAsRead(conversation.id));
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    try {
      const newMessage = {
        id: Date.now(),
        text: messageText.trim(),
        sender: user.name,
        senderId: user.id,
        timestamp: new Date(),
        type: 'text',
        conversationId: selectedConversation.id,
      };
      
      // dispatch(sendMessage(newMessage));
      setMessageText('');
      
      // Scroll to bottom
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      Vibration.vibrate(30);
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  }, [messageText, selectedConversation, user, dispatch]);

  const handleNewMessage = () => {
    Alert.alert(
      "New Message",
      "Choose message type:",
      [
        { text: "Team Message", onPress: () => setShowNewMessageModal(true) },
        { text: "Direct Message", onPress: () => navigation.navigate('TeamDirectory') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const getConversationIcon = (conversation) => {
    switch (conversation.type) {
      case 'team':
        return 'group';
      case 'group':
        return 'group-work';
      case 'direct':
        return 'person';
      default:
        return 'chat';
    }
  };

  const formatMessageTime = (time) => {
    // Format time helper function
    return time;
  };

  const mockMessages = selectedConversation ? [
    {
      id: 1,
      text: "Hey team! Great job at today's training session 🔥",
      sender: "Coach Martinez",
      senderId: "coach1",
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
    },
    {
      id: 2,
      text: "Thanks coach! Feeling stronger already 💪",
      sender: "Alex Johnson",
      senderId: "player1",
      timestamp: new Date(Date.now() - 3000000),
      type: 'text',
    },
    {
      id: 3,
      text: "Can't wait for tomorrow's match!",
      sender: user.name,
      senderId: user.id,
      timestamp: new Date(Date.now() - 1800000),
      type: 'text',
    },
  ] : [];

  const renderConversationItem = ({ item }) => (
    <Animated.View
      style={[
        styles.conversationCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => handleConversationPress(item)}
        style={styles.conversationTouchable}
        activeOpacity={0.7}
      >
        <Surface style={styles.conversationSurface}>
          <View style={styles.conversationContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Image
                size={50}
                source={{ uri: item.avatar }}
                style={styles.avatar}
              />
              {item.unreadCount > 0 && (
                <Badge size={20} style={styles.unreadBadge}>
                  {item.unreadCount}
                </Badge>
              )}
              <Surface style={styles.typeIndicator}>
                <Icon
                  name={getConversationIcon(item)}
                  size={14}
                  color={COLORS.primary}
                />
              </Surface>
            </View>
            
            <View style={styles.messageInfo}>
              <View style={styles.headerRow}>
                <Text style={styles.conversationName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.timestamp}>
                  {item.lastMessageTime}
                </Text>
              </View>
              
              <Text style={styles.lastMessage} numberOfLines={2}>
                {item.lastMessage}
              </Text>
              
              {item.members && (
                <View style={styles.membersRow}>
                  <Icon name="people" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.membersCount}>
                    {item.members} members
                  </Text>
                  {item.isCoach && (
                    <Chip
                      mode="outlined"
                      compact
                      style={styles.roleChip}
                      textStyle={styles.roleChipText}
                    >
                      Coach
                    </Chip>
                  )}
                </View>
              )}
            </View>
          </View>
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderMessageItem = ({ item }) => {
    const isOwnMessage = item.senderId === user.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {!isOwnMessage && (
          <Avatar.Text
            size={32}
            label={item.sender.charAt(0)}
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          {!isOwnMessage && (
            <Text style={styles.senderName}>{item.sender}</Text>
          )}
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {formatMessageTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderChatModal = () => (
    <Portal>
      <Modal
        visible={showChatModal}
        onDismiss={() => setShowChatModal(false)}
        contentContainerStyle={styles.chatModal}
      >
        <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
          <KeyboardAvoidingView
            style={styles.chatContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Chat Header */}
            <LinearGradient
              colors={[COLORS.primary, '#764ba2']}
              style={styles.chatHeader}
            >
              <View style={styles.chatHeaderContent}>
                <IconButton
                  icon="arrow-back"
                  iconColor="white"
                  size={24}
                  onPress={() => setShowChatModal(false)}
                />
                <View style={styles.chatHeaderInfo}>
                  <Avatar.Image
                    size={36}
                    source={{ uri: selectedConversation?.avatar }}
                  />
                  <View style={styles.chatHeaderText}>
                    <Text style={styles.chatTitle}>
                      {selectedConversation?.name}
                    </Text>
                    <Text style={styles.chatSubtitle}>
                      {selectedConversation?.members ? 
                        `${selectedConversation.members} members` : 
                        'Online'
                      }
                    </Text>
                  </View>
                </View>
                <IconButton
                  icon="dots-vertical"
                  iconColor="white"
                  size={24}
                  onPress={() => {
                    Alert.alert('Chat Options', 'Feature coming soon!');
                  }}
                />
              </View>
            </LinearGradient>

            {/* Messages List */}
            <FlatList
              ref={chatScrollRef}
              data={mockMessages}
              renderItem={renderMessageItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            />

            {/* Message Input */}
            <Surface style={styles.messageInputContainer}>
              <View style={styles.inputRow}>
                <IconButton
                  icon="attach-file"
                  size={24}
                  iconColor={COLORS.primary}
                  onPress={() => {
                    Alert.alert('Attachments', 'Feature coming soon!');
                  }}
                />
                <TextInput
                  style={styles.messageInput}
                  placeholder="Type a message..."
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  maxLength={500}
                />
                <IconButton
                  icon="send"
                  size={24}
                  iconColor={COLORS.primary}
                  onPress={handleSendMessage}
                  disabled={!messageText.trim()}
                />
              </View>
            </Surface>
          </KeyboardAvoidingView>
        </BlurView>
      </Modal>
    </Portal>
  );

  const filteredConversations = [
    {
      id: 1,
      name: "Eagles Soccer Team",
      type: "team",
      avatar: "https://via.placeholder.com/50",
      lastMessage: "Great practice today everyone! 💪",
      lastMessageTime: "2 min ago",
      unreadCount: 3,
      members: 15,
      isCoach: true,
    },
    {
      id: 2,
      name: "Coach Martinez",
      type: "direct",
      avatar: "https://via.placeholder.com/50",
      lastMessage: "Your form is improving nicely",
      lastMessageTime: "1h ago",
      unreadCount: 0,
      isCoach: false,
    },
    {
      id: 3,
      name: "Training Group A",
      type: "group",
      avatar: "https://via.placeholder.com/50",
      lastMessage: "Who's joining tomorrow's session?",
      lastMessageTime: "3h ago",
      unreadCount: 1,
      members: 8,
      isCoach: false,
    },
  ].filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Team Messages</Text>
          <IconButton
            icon="search"
            iconColor="white"
            size={24}
            onPress={() => {
              Alert.alert('Search', 'Feature coming soon!');
            }}
          />
        </View>
        
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
      </LinearGradient>

      {/* Quick Stats */}
      <Surface style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="message" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{filteredConversations.length}</Text>
            <Text style={styles.statLabel}>Chats</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="notifications" size={24} color={COLORS.success} />
            <Text style={styles.statNumber}>
              {filteredConversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
            </Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="group" size={24} color={COLORS.secondary} />
            <Text style={styles.statNumber}>
              {filteredConversations.filter(conv => conv.type === 'team').length}
            </Text>
            <Text style={styles.statLabel}>Teams</Text>
          </View>
        </View>
      </Surface>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.conversationsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB for New Message */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleNewMessage}
        color="white"
      />

      {/* Chat Modal */}
      {renderChatModal()}
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.header,
    color: 'white',
  },
  searchContainer: {
    marginTop: SPACING.sm,
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 0,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  statsContainer: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  conversationsList: {
    padding: SPACING.md,
  },
  conversationCard: {
    marginBottom: SPACING.sm,
  },
  conversationTouchable: {
    borderRadius: 12,
  },
  conversationSurface: {
    borderRadius: 12,
    elevation: 2,
  },
  conversationContent: {
    padding: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
  },
  typeIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  messageInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  conversationName: {
    ...TEXT_STYLES.h3,
    flex: 1,
  },
  timestamp: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  lastMessage: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    marginRight: SPACING.sm,
  },
  roleChip: {
    height: 24,
    borderColor: COLORS.primary,
  },
  roleChipText: {
    fontSize: 10,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  chatModal: {
    flex: 1,
    margin: 0,
  },
  blurContainer: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  chatHeader: {
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  chatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  chatHeaderText: {
    marginLeft: SPACING.sm,
  },
  chatTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
  },
  chatSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContent: {
    padding: SPACING.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    backgroundColor: COLORS.secondary,
    marginRight: SPACING.xs,
  },
  messageBubble: {
    maxWidth: width * 0.7,
    padding: SPACING.sm,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    elevation: 1,
  },
  senderName: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  messageText: {
    ...TEXT_STYLES.body,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: COLORS.text,
  },
  messageTime: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherMessageTime: {
    color: COLORS.textSecondary,
  },
  messageInputContainer: {
    padding: SPACING.md,
    elevation: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    maxHeight: 100,
    ...TEXT_STYLES.body,
  },
});

export default TeamMessages;
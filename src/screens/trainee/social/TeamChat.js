import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Vibration,
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
  Portal,
  Modal,
  Searchbar,
  Badge,
  Menu,
  Divider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-blur/blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const TeamChat = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const teamId = route?.params?.teamId || 'default-team';
  
  const [refreshing, setRefreshing] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  const flatListRef = useRef(null);
  const textInputRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Mock data - Replace with Redux state
  const [teamInfo, setTeamInfo] = useState({
    id: teamId,
    name: 'Elite Fitness Squad 💪',
    description: 'Training hard, achieving goals together!',
    avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150',
    memberCount: 12,
    coachName: 'Coach Sarah',
    isPrivate: false,
    createdAt: '2024-06-15'
  });

  const [teamMembers] = useState([
    {
      id: '1',
      name: 'Coach Sarah',
      role: 'coach',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      status: 'online',
      isVerified: true
    },
    {
      id: '2',
      name: 'Mike Johnson',
      role: 'trainee',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'online'
    },
    {
      id: '3',
      name: 'Emily Chen',
      role: 'trainee',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      status: 'offline'
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'assistant-coach',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      status: 'away'
    }
  ]);

  const [messages, setMessages] = useState([
    {
      id: '1',
      senderId: '1',
      senderName: 'Coach Sarah',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      senderRole: 'coach',
      content: 'Great job everyone on today\'s workout! 🔥 Remember to stay hydrated and get proper rest tonight.',
      type: 'text',
      timestamp: '2024-08-27T14:30:00Z',
      reactions: [
        { emoji: '🔥', count: 5, users: ['2', '3', '4', '5', '6'] },
        { emoji: '💪', count: 3, users: ['2', '3', '4'] },
        { emoji: '👍', count: 2, users: ['3', '5'] }
      ],
      isRead: true,
      isPinned: false
    },
    {
      id: '2',
      senderId: '2',
      senderName: 'Mike Johnson',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      senderRole: 'trainee',
      content: 'Thanks Coach! That HIIT session was intense but amazing! 💯',
      type: 'text',
      timestamp: '2024-08-27T14:32:00Z',
      reactions: [
        { emoji: '💯', count: 4, users: ['1', '3', '4', '5'] }
      ],
      isRead: true,
      replyTo: '1'
    },
    {
      id: '3',
      senderId: '1',
      senderName: 'Coach Sarah',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      senderRole: 'coach',
      content: 'Tomorrow we\'ll focus on strength training. Make sure to bring your lifting gloves! 🏋️‍♀️',
      type: 'announcement',
      timestamp: '2024-08-27T15:00:00Z',
      reactions: [
        { emoji: '💪', count: 6, users: ['2', '3', '4', '5', '6', '7'] }
      ],
      isRead: true,
      isPinned: true
    },
    {
      id: '4',
      senderId: '3',
      senderName: 'Emily Chen',
      senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      senderRole: 'trainee',
      content: 'Quick question - what time should we arrive tomorrow?',
      type: 'text',
      timestamp: '2024-08-27T15:15:00Z',
      reactions: [],
      isRead: true
    },
    {
      id: '5',
      senderId: '4',
      senderName: 'David Kim',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      senderRole: 'assistant-coach',
      content: '@Emily Chen Session starts at 6:30 AM sharp. Early birds get the best equipment! 🐦',
      type: 'text',
      timestamp: '2024-08-27T15:17:00Z',
      reactions: [
        { emoji: '👍', count: 2, users: ['3', '5'] }
      ],
      isRead: false,
      mentions: ['3']
    }
  ]);

  const emojis = ['😊', '👍', '❤️', '🔥', '💪', '💯', '🎉', '👏', '😂', '😍', '🤔', '😴'];

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    loadTeamChat();
    setupTypingIndicator();
    scrollToBottom();
  }, []);

  useEffect(() => {
    // Mark messages as read when screen is focused
    markMessagesAsRead();
  }, [messages]);

  const loadTeamChat = async () => {
    try {
      // Replace with actual API call
      // const response = await dispatch(fetchTeamMessages(teamId));
      console.log('Loading team chat...');
    } catch (error) {
      Alert.alert('Error', 'Failed to load team chat');
    }
  };

  const setupTypingIndicator = () => {
    // Simulate typing indicator
    setTimeout(() => {
      setTypingUsers(['Mike Johnson']);
      setTimeout(() => setTypingUsers([]), 3000);
    }, 5000);
  };

  const markMessagesAsRead = () => {
    setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTeamChat();
    setRefreshing(false);
  }, []);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar,
        senderRole: user.role,
        content: messageText.trim(),
        type: 'text',
        timestamp: new Date().toISOString(),
        reactions: [],
        isRead: false,
        replyTo: replyingTo?.id || null
      };

      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      setReplyingTo(null);
      Vibration.vibrate(30);
      scrollToBottom();

      // Simulate message sending
      // dispatch(sendTeamMessage(teamId, newMessage));
    }
  };

  const handleReaction = (messageId, emoji) => {
    Vibration.vibrate(50);
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes(user.id)) {
            // Remove reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== user.id) }
                  : r
              ).filter(r => r.count > 0)
            };
          } else {
            // Add reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count + 1, users: [...r.users, user.id] }
                  : r
              )
            };
          }
        } else {
          // New reaction
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1, users: [user.id] }]
          };
        }
      }
      return msg;
    }));
  };

  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
    textInputRef.current?.focus();
  };

  const handleMessageLongPress = (message) => {
    setSelectedMessage(message);
    setShowMessageActions(true);
    Vibration.vibrate(100);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'coach': return COLORS.primary;
      case 'assistant-coach': return COLORS.secondary;
      case 'trainee': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'away': return '#FF9800';
      case 'offline': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.teamInfo}>
          <Avatar.Image source={{ uri: teamInfo.avatar }} size={40} />
          <View style={styles.teamDetails}>
            <Text style={styles.teamName}>{teamInfo.name}</Text>
            <Text style={styles.teamStatus}>
              {onlineUsers.size} online • {teamInfo.memberCount} members
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <IconButton
            icon="videocam"
            iconColor="white"
            onPress={() => Alert.alert('Video Call', 'Video call feature coming soon!')}
          />
          <IconButton
            icon="dots-vertical"
            iconColor="white"
            onPress={() => Alert.alert('Team Info', 'Team settings feature coming soon!')}
          />
        </View>
      </View>
    </LinearGradient>
  );

  const renderMessageItem = ({ item: message, index }) => {
    const isMyMessage = message.senderId === user.id;
    const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
    const replyMessage = message.replyTo ? messages.find(m => m.id === message.replyTo) : null;

    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
        ]}
        onLongPress={() => handleMessageLongPress(message)}
        delayLongPress={500}
      >
        {!isMyMessage && showAvatar && (
          <Avatar.Image source={{ uri: message.senderAvatar }} size={32} />
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          message.type === 'announcement' && styles.announcementBubble,
          message.isPinned && styles.pinnedMessage
        ]}>
          {message.isPinned && (
            <View style={styles.pinnedIndicator}>
              <Icon name="push-pin" size={12} color={COLORS.primary} />
              <Text style={styles.pinnedText}>Pinned</Text>
            </View>
          )}

          {!isMyMessage && showAvatar && (
            <View style={styles.messageHeader}>
              <Text style={[styles.senderName, { color: getRoleColor(message.senderRole) }]}>
                {message.senderName}
              </Text>
              <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
            </View>
          )}

          {replyMessage && (
            <View style={styles.replyContainer}>
              <View style={styles.replyLine} />
              <View style={styles.replyContent}>
                <Text style={styles.replyAuthor}>{replyMessage.senderName}</Text>
                <Text style={styles.replyText} numberOfLines={2}>
                  {replyMessage.content}
                </Text>
              </View>
            </View>
          )}

          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText,
            message.type === 'announcement' && styles.announcementText
          ]}>
            {message.content}
          </Text>

          {isMyMessage && (
            <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
          )}

          {message.reactions.length > 0 && (
            <View style={styles.reactionsContainer}>
              {message.reactions.map((reaction, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.reactionBubble,
                    reaction.users.includes(user.id) && styles.myReactionBubble
                  ]}
                  onPress={() => handleReaction(message.id, reaction.emoji)}
                >
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  <Text style={styles.reactionCount}>{reaction.count}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addReactionButton}
                onPress={() => {
                  setSelectedMessage(message);
                  setShowEmojiPicker(true);
                }}
              >
                <Icon name="add" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isMyMessage && showAvatar && (
          <Avatar.Image source={{ uri: user.avatar }} size={32} />
        )}

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleReplyToMessage(message)}
          >
            <Icon name="reply" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              setSelectedMessage(message);
              setShowEmojiPicker(true);
            }}
          >
            <Icon name="emoji-emotions" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    return (
      <View style={styles.typingContainer}>
        <Text style={styles.typingText}>
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </Text>
        <View style={styles.typingDots}>
          <Animated.View style={styles.typingDot} />
          <Animated.View style={styles.typingDot} />
          <Animated.View style={styles.typingDot} />
        </View>
      </View>
    );
  };

  const renderMessageInput = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.inputContainer}
    >
      {replyingTo && (
        <View style={styles.replyingToContainer}>
          <View style={styles.replyingToLine} />
          <View style={styles.replyingToContent}>
            <Text style={styles.replyingToAuthor}>Replying to {replyingTo.senderName}</Text>
            <Text style={styles.replyingToText} numberOfLines={1}>
              {replyingTo.content}
            </Text>
          </View>
          <IconButton
            icon="close"
            size={20}
            onPress={() => setReplyingTo(null)}
          />
        </View>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={() => setShowAttachmentMenu(true)}
        >
          <Icon name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textSecondary}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
        />

        <TouchableOpacity
          style={styles.emojiButton}
          onPress={() => setShowEmojiPicker(true)}
        >
          <Icon name="emoji-emotions" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sendButton,
            messageText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Icon name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderEmojiPicker = () => (
    <Portal>
      <Modal
        visible={showEmojiPicker}
        onDismiss={() => setShowEmojiPicker(false)}
        contentContainerStyle={styles.emojiPickerModal}
      >
        <View style={styles.emojiPickerContent}>
          <Text style={styles.emojiPickerTitle}>Choose Reaction</Text>
          <View style={styles.emojiGrid}>
            {emojis.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.emojiButton}
                onPress={() => {
                  if (selectedMessage) {
                    handleReaction(selectedMessage.id, emoji);
                  }
                  setShowEmojiPicker(false);
                  setSelectedMessage(null);
                }}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </Portal>
  );

  const renderMessageActions = () => (
    <Portal>
      <Modal
        visible={showMessageActions}
        onDismiss={() => setShowMessageActions(false)}
        contentContainerStyle={styles.messageActionsModal}
      >
        <BlurView
          style={styles.messageActionsBlur}
          blurType="light"
          blurAmount={10}
        >
          <View style={styles.messageActionsContent}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                handleReplyToMessage(selectedMessage);
                setShowMessageActions(false);
              }}
            >
              <Icon name="reply" size={24} color={COLORS.text} />
              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setShowMessageActions(false);
                setShowEmojiPicker(true);
              }}
            >
              <Icon name="emoji-emotions" size={24} color={COLORS.text} />
              <Text style={styles.actionText}>React</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setShowMessageActions(false);
                Alert.alert('Copy', 'Message copied to clipboard!');
              }}
            >
              <Icon name="content-copy" size={24} color={COLORS.text} />
              <Text style={styles.actionText}>Copy</Text>
            </TouchableOpacity>

            {selectedMessage?.senderId === user.id && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  setShowMessageActions(false);
                  Alert.alert('Delete Message', 'Delete message feature coming soon!');
                }}
              >
                <Icon name="delete" size={24} color={COLORS.error} />
                <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {renderHeader()}
      
      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />
        
        {renderTypingIndicator()}
      </View>

      {renderMessageInput()}
      {renderEmojiPicker()}
      {renderMessageActions()}
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  teamInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  teamName: {
    ...TEXT_STYLES.subtitle,
    color: 'white',
    fontWeight: 'bold',
  },
  teamStatus: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  headerActions: {
    flexDirection: 'row',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.7,
    padding: SPACING.md,
    borderRadius: 16,
    marginHorizontal: SPACING.sm,
  },
  myMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  announcementBubble: {
    backgroundColor: '#FFF3CD',
    borderColor: '#F0D000',
    borderWidth: 1,
  },
  pinnedMessage: {
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  pinnedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  pinnedText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  senderName: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  messageTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    opacity: 0.8,
  },
  replyLine: {
    width: 3,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
    borderRadius: 2,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  replyText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  messageText: {
    ...TEXT_STYLES.body,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: COLORS.text,
  },
  announcementText: {
    color: '#856404',
    fontWeight: '500',
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  myReactionBubble: {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderColor: COLORS.primary,
  },
  reactionEmoji: {
    fontSize: 12,
    marginRight: SPACING.xs / 2,
  },
  reactionCount: {
    ...TEXT_STYLES.caption,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  addReactionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  quickActions: {
    position: 'absolute',
    right: -60,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    opacity: 0, // Initially hidden, show on hover/long press
  },
  quickActionButton: {
    padding: SPACING.xs,
    marginVertical: SPACING.xs / 2,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  typingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  typingDots: {
    flexDirection: 'row',
    marginLeft: SPACING.sm,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: 2,
    opacity: 0.6,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  replyingToLine: {
    width: 3,
    height: 40,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.md,
    borderRadius: 2,
  },
  replyingToContent: {
    flex: 1,
  },
  replyingToAuthor: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  replyingToText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 60,
  },
  attachmentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.sm,
    backgroundColor: 'white',
    ...TEXT_STYLES.body,
    color: COLORS.text,
    textAlignVertical: 'center',
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sendButtonInactive: {
    backgroundColor: COLORS.textSecondary,
  },
  emojiPickerModal: {
    margin: SPACING.xl,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 0,
  },
  emojiPickerContent: {
    padding: SPACING.lg,
  },
  emojiPickerTitle: {
    ...TEXT_STYLES.subtitle,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  emojiButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    margin: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  emojiText: {
    fontSize: 24,
  },
  messageActionsModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  messageActionsBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 200,
  },
  messageActionsContent: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: SPACING.lg,
    borderRadius: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  actionText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.lg,
    color: COLORS.text,
  },
});

export default TeamChat;
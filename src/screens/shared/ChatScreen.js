import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  Animated,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  StatusBar
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
  Divider,
  IconButton,
  Portal,
  Modal,
  Surface,
  Chip,
  FAB,
  ProgressBar
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';
import { useChatWithAuth } from '../../hooks/useChatWithAuth'; // Use the hook instead of direct service
import ChatService from '../../services/ChatService'; // Still needed for event listeners

const { width, height } = Dimensions.get('window');

const ChatScreen = ({ navigation, route }) => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  // Use the chat hook instead of direct ChatService calls
  const { 
    getChatMessages,
    subscribeToChat,
    sendMessage: sendChatMessage,
    sendTypingIndicator,
    subscribeToTyping,
    markMessagesAsRead,
    addMessageReaction,
    authReady,
    currentFirebaseUser
  } = useChatWithAuth();
  
  // Navigation params
  const { chatId, chatPartner, chatName } = route.params || {};
  
  // State management
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [partner, setPartner] = useState(chatPartner);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [attachmentModal, setAttachmentModal] = useState(false);
  const [reactionModal, setReactionModal] = useState({ visible: false, messageId: null });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  
  // Refs
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const unsubscribeMessagesRef = useRef(null);
  const unsubscribeTypingRef = useRef(null);

  // Initialize chat data - wait for auth to be ready
  useEffect(() => {
    if (authReady && currentFirebaseUser) {
      initializeChat();
    }
    setupNavigationHeader();
    
    return () => {
      cleanup();
    };
  }, [chatId, authReady, currentFirebaseUser]);

  // Network status listener
  useEffect(() => {
    const unsubscribe = ChatService.addEventListener((event) => {
      if (event.type === 'networkStatusChanged') {
        setIsOnline(event.data.isOnline);
      }
    });

    return unsubscribe;
  }, []);

  const initializeChat = async () => {
    if (!authReady || !currentFirebaseUser) {
      console.log('Auth not ready for chat initialization');
      return;
    }

    try {
      setLoading(true);
      
      if (!chatId) {
        Alert.alert('Error', 'Chat not found');
        navigation.goBack();
        return;
      }

      // Load messages
      await loadMessages(true);
      
      // Subscribe to real-time messages
      subscribeToMessages();
      
      // Subscribe to typing indicators
      subscribeToTypingIndicators();
      
      // Mark messages as read
      markChatMessagesAsRead();
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (initial = false) => {
    if (!authReady || !currentFirebaseUser) {
      console.log('Auth not ready for loading messages');
      return;
    }

    try {
      // Use the hook's getChatMessages method instead of direct ChatService call
      const result = await getChatMessages(
        chatId,
        50,
        initial ? null : lastMessageId
      );
      
      if (result.success) {
        if (initial) {
          setMessages(result.messages);
        } else {
          setMessages(prev => [...result.messages, ...prev]);
        }
        
        setHasMoreMessages(result.messages.length === 50);
        
        if (result.messages.length > 0) {
          setLastMessageId(result.messages[result.messages.length - 1].id);
        }
      }
      
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', error.message || 'Failed to load messages');
    }
  };

  const subscribeToMessages = () => {
    if (!authReady || !currentFirebaseUser) {
      console.log('Auth not ready for message subscription');
      return;
    }

    // Use the hook's subscribeToChat method instead of direct ChatService call
    unsubscribeMessagesRef.current = subscribeToChat(chatId, (newMessages) => {
      setMessages(newMessages);
      
      // Auto-scroll to bottom for new messages from current user or if already at bottom
      const isCurrentUserMessage = newMessages.length > 0 && 
        newMessages[newMessages.length - 1]?.senderId === currentFirebaseUser?.uid;
        
      if (isCurrentUserMessage || !showScrollToBottom) {
        scrollToBottom();
      }
      
      // Mark new messages as read
      markChatMessagesAsRead();
    });
  };

  const subscribeToTypingIndicators = () => {
    if (!authReady || !currentFirebaseUser) {
      console.log('Auth not ready for typing subscription');
      return;
    }

    // Use the hook's subscribeToTyping method instead of direct ChatService call
    unsubscribeTypingRef.current = subscribeToTyping(chatId, (users) => {
      setTypingUsers(users.filter(userId => userId !== currentFirebaseUser?.uid));
    });
  };

  const setupNavigationHeader = () => {
    navigation.setOptions({
      title: chatName || partner?.name || 'Chat',
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: 'white',
      headerRight: () => (
        <View style={styles.headerActions}>
          <IconButton
            icon="phone"
            iconColor="white"
            size={24}
            onPress={handleVoiceCall}
          />
          <IconButton
            icon="videocam"
            iconColor="white"
            size={24}
            onPress={handleVideoCall}
          />
          <IconButton
            icon="dots-vertical"
            iconColor="white"
            size={24}
            onPress={handleMoreActions}
          />
        </View>
      ),
    });
  };

  const cleanup = () => {
    if (unsubscribeMessagesRef.current) {
      unsubscribeMessagesRef.current();
    }
    if (unsubscribeTypingRef.current) {
      unsubscribeTypingRef.current();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || sending) return;
    
    if (!authReady || !currentFirebaseUser) {
      Alert.alert('Authentication Required', 'Please wait for authentication to complete');
      return;
    }

    try {
      setSending(true);
      const messageText = message.trim();
      setMessage(''); // Clear input immediately for better UX
      
      const messageData = {
        text: messageText,
        type: 'text',
        metadata: {
          senderName: `${user?.firstName} ${user?.lastName}`.trim(),
          senderAvatar: user?.profileImage || ''
        }
      };

      // Use the hook's sendMessage method instead of direct ChatService call
      const result = await sendChatMessage(chatId, messageData);
      
      if (result.success) {
        // Message will be updated via real-time listener
        scrollToBottom();
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', error.message || 'Failed to send message. Please try again.');
      setMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleTyping = useCallback((text) => {
    setMessage(text);
    
    if (!authReady || !currentFirebaseUser) {
      return;
    }
    
    // Use the hook's sendTypingIndicator method instead of direct ChatService call
    sendTypingIndicator(chatId, true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(chatId, false);
    }, 2000);
  }, [chatId, authReady, currentFirebaseUser, sendTypingIndicator]);

  const markChatMessagesAsRead = async () => {
    if (!authReady || !currentFirebaseUser) {
      return;
    }

    try {
      const unreadMessages = messages
        .filter(msg => msg.senderId !== currentFirebaseUser?.uid && !msg.readBy?.[currentFirebaseUser?.uid])
        .map(msg => msg.id);
        
      if (unreadMessages.length > 0) {
        // Use the hook's markMessagesAsRead method instead of direct ChatService call
        await markMessagesAsRead(chatId, unreadMessages);
      }
    } catch (error) {
      console.warn('Error marking messages as read:', error);
    }
  };

  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 100);
  };

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isNearBottom = contentOffset.y > (contentSize.height - layoutMeasurement.height - 100);
    setShowScrollToBottom(!isNearBottom);
    
    // Animated header background
    scrollOffsetY.setValue(contentOffset.y);
  };

  const onRefresh = async () => {
    if (!hasMoreMessages) return;
    
    setRefreshing(true);
    await loadMessages(false);
    setRefreshing(false);
  };

  const handleMessageLongPress = (message) => {
    const options = ['Copy', 'Reply'];
    
    if (message.senderId === currentFirebaseUser?.uid) {
      options.push('Delete');
    }
    
    options.push('Add Reaction', 'Cancel');
    
    Alert.alert('Message Options', '', [
      ...options.slice(0, -1).map(option => ({
        text: option,
        onPress: () => handleMessageAction(option, message)
      })),
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleMessageAction = async (action, message) => {
    switch (action) {
      case 'Copy':
        // TODO: Implement copy to clipboard
        break;
      case 'Reply':
        messageInputRef.current?.focus();
        // TODO: Set reply context
        break;
      case 'Delete':
        // TODO: Implement message deletion
        break;
      case 'Add Reaction':
        setReactionModal({ visible: true, messageId: message.id });
        break;
    }
  };

  const addReaction = async (reaction) => {
    if (!authReady || !currentFirebaseUser) {
      Alert.alert('Error', 'Authentication not ready');
      return;
    }

    try {
      // Use the hook's addMessageReaction method instead of direct ChatService call
      await addMessageReaction(
        chatId,
        reactionModal.messageId,
        reaction
      );
      setReactionModal({ visible: false, messageId: null });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add reaction');
    }
  };

  const handleAttachment = (type) => {
    setAttachmentModal(false);
    
    switch (type) {
      case 'camera':
        // TODO: Open camera
        break;
      case 'gallery':
        // TODO: Open gallery
        break;
      case 'document':
        // TODO: Open document picker
        break;
      case 'location':
        // TODO: Share location
        break;
    }
  };

  const handleVoiceCall = () => {
    Alert.alert('Voice Call', 'Voice calling feature coming soon!');
  };

  const handleVideoCall = () => {
    Alert.alert('Video Call', 'Video calling feature coming soon!');
  };

  const handleMoreActions = () => {
    Alert.alert('Chat Options', '', [
      { text: 'View Profile', onPress: () => navigation.navigate('Profile', { userId: partner?.id }) },
      { text: 'Mute Chat', onPress: () => {} },
      { text: 'Block User', onPress: () => {}, style: 'destructive' },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins < 1 ? 'now' : `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return diffDays === 1 ? 'yesterday' : `${diffDays}d`;
    }
  };

  const renderMessage = ({ item, index }) => {
    const isMe = item.senderId === currentFirebaseUser?.uid;
    const showAvatar = !isMe && (index === messages.length - 1 || 
      messages[index + 1]?.senderId !== item.senderId);
    const isConsecutive = index > 0 && messages[index - 1]?.senderId === item.senderId;
    
    return (
      <TouchableOpacity
        onLongPress={() => handleMessageLongPress(item)}
        activeOpacity={0.7}>
        <View style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.otherMessageContainer,
          isConsecutive && styles.consecutiveMessage
        ]}>
          {showAvatar && (
            <Avatar.Text 
              size={32} 
              label={partner?.name?.substring(0, 2) || 'U'}
              style={styles.messageAvatar}
            />
          )}
          
          <View style={[
            styles.messageBubble,
            isMe ? styles.myMessage : styles.otherMessage,
            !showAvatar && !isMe && styles.messageWithoutAvatar
          ]}>
            {!isMe && !isConsecutive && (
              <Text style={styles.senderName}>
                {item.metadata?.senderName || 'Unknown User'}
              </Text>
            )}
            
            <Text style={[
              styles.messageText,
              isMe ? styles.myMessageText : styles.otherMessageText
            ]}>
              {item.text}
            </Text>
            
            {/* Message reactions */}
            {item.reactions && Object.keys(item.reactions).length > 0 && (
              <View style={styles.reactionsContainer}>
                {Object.entries(item.reactions).map(([reaction, users]) => (
                  <Chip
                    key={reaction}
                    compact
                    style={styles.reactionChip}
                    textStyle={styles.reactionText}>
                    {reaction} {users.length}
                  </Chip>
                ))}
              </View>
            )}
            
            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                isMe ? styles.myMessageTime : styles.otherMessageTime
              ]}>
                {formatTime(item.timestamp)}
              </Text>
              
              {isMe && (
                <View style={styles.messageStatus}>
                  {item.status === 'pending' && (
                    <Icon name="access-time" size={12} color="rgba(255,255,255,0.5)" />
                  )}
                  {item.status === 'sent' && (
                    <Icon name="check" size={12} color="rgba(255,255,255,0.7)" />
                  )}
                  {item.status === 'delivered' && (
                    <Icon name="done-all" size={12} color="rgba(255,255,255,0.7)" />
                  )}
                  {item.status === 'read' && (
                    <Icon name="done-all" size={12} color={COLORS.success} />
                  )}
                  {item.status === 'failed' && (
                    <Icon name="error" size={12} color={COLORS.error} />
                  )}
                </View>
              )}
            </View>
          </View>
          
          {isMe && showAvatar && (
            <Avatar.Text 
              size={32} 
              label={`${user?.firstName?.charAt(0)}${user?.lastName?.charAt(0)}`}
              style={styles.messageAvatar}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    
    return (
      <View style={styles.typingContainer}>
        <Avatar.Text 
          size={24} 
          label={partner?.name?.substring(0, 2) || 'U'}
          style={styles.typingAvatar}
        />
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>
            {typingUsers.length === 1 ? 'typing' : `${typingUsers.length} people typing`}
            <Text style={styles.typingDots}>...</Text>
          </Text>
        </View>
      </View>
    );
  };

  const renderConnectionStatus = () => {
    if (!authReady) {
      return (
        <Surface style={styles.connectionBanner}>
          <Icon name="hourglass-empty" size={16} color={COLORS.primary} />
          <Text style={styles.connectionText}>
            Initializing authentication...
          </Text>
        </Surface>
      );
    }

    if (!currentFirebaseUser) {
      return (
        <Surface style={styles.connectionBanner}>
          <Icon name="person-off" size={16} color={COLORS.error} />
          <Text style={styles.connectionText}>
            Authentication required - Please sign in
          </Text>
        </Surface>
      );
    }

    if (!isOnline) {
      return (
        <Surface style={styles.connectionBanner}>
          <Icon name="wifi-off" size={16} color={COLORS.error} />
          <Text style={styles.connectionText}>
            No internet connection. Messages will be sent when connected.
          </Text>
        </Surface>
      );
    }

    return null;
  };

  const renderAttachmentModal = () => (
    <Portal>
      <Modal
        visible={attachmentModal}
        onDismiss={() => setAttachmentModal(false)}
        contentContainerStyle={styles.attachmentModalContainer}>
        <BlurView intensity={20} style={styles.attachmentModal}>
          <Text style={styles.attachmentModalTitle}>Send attachment</Text>
          
          <View style={styles.attachmentOptions}>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachment('camera')}>
              <Icon name="camera-alt" size={24} color={COLORS.primary} />
              <Text style={styles.attachmentOptionText}>Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachment('gallery')}>
              <Icon name="photo-library" size={24} color={COLORS.primary} />
              <Text style={styles.attachmentOptionText}>Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachment('document')}>
              <Icon name="insert-drive-file" size={24} color={COLORS.primary} />
              <Text style={styles.attachmentOptionText}>Document</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => handleAttachment('location')}>
              <Icon name="location-on" size={24} color={COLORS.primary} />
              <Text style={styles.attachmentOptionText}>Location</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderReactionModal = () => (
    <Portal>
      <Modal
        visible={reactionModal.visible}
        onDismiss={() => setReactionModal({ visible: false, messageId: null })}
        contentContainerStyle={styles.reactionModalContainer}>
        <Surface style={styles.reactionModal}>
          <Text style={styles.reactionModalTitle}>Add reaction</Text>
          
          <View style={styles.reactionOptions}>
            {['👍', '❤️', '😂', '😮', '😢', '😡'].map((reaction) => (
              <TouchableOpacity
                key={reaction}
                style={styles.reactionOption}
                onPress={() => addReaction(reaction)}>
                <Text style={styles.reactionEmoji}>{reaction}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  // Show loading screen while authentication is not ready
  if (!authReady) {
    return (
      <View style={styles.loadingContainer}>
        <ProgressBar indeterminate color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing authentication...</Text>
      </View>
    );
  }

  // Show authentication required screen
  if (!currentFirebaseUser) {
    return (
      <View style={styles.authRequiredContainer}>
        <Icon name="person-off" size={64} color={COLORS.error} />
        <Text style={styles.authRequiredTitle}>Authentication Required</Text>
        <Text style={styles.authRequiredSubtitle}>
          Please sign in to access this chat.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Dashboard', { screen: 'LoginScreen' })}
          style={styles.signInButton}>
          Sign In
        </Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ProgressBar indeterminate color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {renderConnectionStatus()}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesList}
        contentContainerStyle={[
          styles.messagesContainer,
          messages.length === 0 && styles.emptyContainer
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Pull to load more messages"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyMessages}>
            <Icon name="chat-bubble-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyMessagesText}>
              No messages yet. Start the conversation!
            </Text>
          </View>
        )}
        ListFooterComponent={renderTypingIndicator}
      />

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <FAB
          icon="keyboard-arrow-down"
          style={styles.scrollToBottomFAB}
          onPress={() => scrollToBottom()}
          size="small"
        />
      )}

      {/* Upload progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <View style={styles.uploadProgressContainer}>
          <ProgressBar progress={uploadProgress / 100} color={COLORS.primary} />
          <Text style={styles.uploadProgressText}>Uploading... {uploadProgress}%</Text>
        </View>
      )}

      {/* Message Input */}
      <Surface style={styles.inputContainer} elevation={8}>
        <View style={styles.inputRow}>
          <IconButton
            icon="attach-file"
            size={24}
            iconColor={COLORS.primary}
            onPress={() => setAttachmentModal(true)}
            disabled={!authReady || !currentFirebaseUser}
          />
          
          <TextInput
            ref={messageInputRef}
            value={message}
            onChangeText={handleTyping}
            placeholder="Type your message..."
            mode="outlined"
            multiline
            maxLength={4000}
            style={styles.messageInput}
            contentStyle={styles.inputContent}
            outlineStyle={styles.inputOutline}
            onFocus={() => scrollToBottom()}
            editable={authReady && currentFirebaseUser}
          />
          
          {message.trim() ? (
            <IconButton
              icon="send"
              size={24}
              iconColor="white"
              style={[styles.sendButton, { backgroundColor: COLORS.primary }]}
              onPress={sendMessage}
              disabled={sending || !authReady || !currentFirebaseUser}
            />
          ) : (
            <IconButton
              icon="mic"
              size={24}
              iconColor={COLORS.primary}
              onPress={() => Alert.alert('Voice Message', 'Voice messages coming soon!')}
              disabled={!authReady || !currentFirebaseUser}
            />
          )}
        </View>
      </Surface>

      {renderAttachmentModal()}
      {renderReactionModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
  },
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  authRequiredTitle: {
    ...TEXT_STYLES.h2,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  authRequiredSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.errorSurface,
  },
  connectionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyMessagesText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    alignItems: 'flex-end',
  },
  consecutiveMessage: {
    marginTop: SPACING.xs / 2,
    marginBottom: SPACING.xs / 2,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.xs,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
  },
  messageWithoutAvatar: {
    marginLeft: 40,
  },
  myMessage: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
  },
  otherMessage: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 6,
    elevation: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  senderName: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
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
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  messageTime: {
    ...TEXT_STYLES.caption,
    fontSize: 10,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: COLORS.textSecondary,
  },
  messageStatus: {
    marginLeft: SPACING.xs,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  reactionChip: {
    height: 24,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  reactionText: {
    fontSize: 10,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  typingAvatar: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.xs,
  },
  typingBubble: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
  },
  typingText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  typingDots: {
    fontWeight: 'bold',
  },
  scrollToBottomFAB: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 80,
    backgroundColor: COLORS.surface,
  },
  uploadProgressContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  uploadProgressText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  messageInput: {
    flex: 1,
    maxHeight: 100,
    marginHorizontal: SPACING.xs,
  },
  inputContent: {
    paddingVertical: SPACING.sm,
  },
  inputOutline: {
    borderColor: COLORS.border,
    borderRadius: 25,
  },
  sendButton: {
    borderRadius: 25,
    margin: 0,
  },
  attachmentModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  attachmentModal: {
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  attachmentModalTitle: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  attachmentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
  },
  attachmentOption: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.primarySurface,
    minWidth: 80,
  },
  attachmentOptionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.sm,
    textAlign: 'center',
    color: COLORS.primary,
  },
  reactionModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  reactionModal: {
    padding: SPACING.lg,
    marginHorizontal: SPACING.xl,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  reactionModalTitle: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  reactionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
  },
  reactionOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primarySurface,
  },
  reactionEmoji: {
    fontSize: 24,
  },
});

export default ChatScreen;
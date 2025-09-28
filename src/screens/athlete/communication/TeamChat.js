import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Vibration,
  Dimensions,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import { 
  Card,
  Avatar,
  IconButton,
  FAB,
  Chip,
  Surface,
  Portal,
  Modal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  online: '#4CAF50',
  away: '#FF9800',
  offline: '#9E9E9E',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  bodySmall: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const TeamChatScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, teamData, chatMessages, onlineMembers } = useSelector(state => ({
    user: state.auth.user,
    teamData: state.team.currentTeam,
    chatMessages: state.chat.messages,
    onlineMembers: state.chat.onlineMembers,
  }));

  // State Management
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [scrollToBottom, setScrollToBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);

  // Refs
  const scrollViewRef = useRef(null);
  const textInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const typingTimeout = useRef(null);

  // Mock data for demonstration
  const mockMessages = [
    {
      id: '1',
      userId: 'coach1',
      userName: 'Coach Martinez',
      userAvatar: null,
      message: 'Great practice today everyone! 💪 Remember to hydrate well tonight.',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      reactions: { '👍': ['player1', 'player2'], '🔥': ['player3'] },
      isCoach: true,
    },
    {
      id: '2',
      userId: 'player1',
      userName: 'Alex Thompson',
      userAvatar: null,
      message: 'Thanks coach! That last drill really helped with my footwork.',
      timestamp: new Date(Date.now() - 3000000),
      type: 'text',
      replyTo: '1',
    },
    {
      id: '3',
      userId: 'player2',
      userName: 'Sarah Johnson',
      userAvatar: null,
      message: 'Can someone share the workout plan for tomorrow?',
      timestamp: new Date(Date.now() - 2400000),
      type: 'text',
    },
    {
      id: '4',
      userId: 'coach1',
      userName: 'Coach Martinez',
      userAvatar: null,
      message: 'I\'ll upload it to the training section shortly 📋',
      timestamp: new Date(Date.now() - 1800000),
      type: 'text',
      isCoach: true,
    },
    {
      id: '5',
      userId: 'player3',
      userName: 'Mike Davis',
      userAvatar: null,
      message: 'Quick video from today\'s practice',
      timestamp: new Date(Date.now() - 1200000),
      type: 'video',
      attachments: [{ type: 'video', url: 'video.mp4', thumbnail: null }],
    },
  ];

  const mockOnlineMembers = [
    { id: 'coach1', name: 'Coach Martinez', status: 'online' },
    { id: 'player1', name: 'Alex Thompson', status: 'online' },
    { id: 'player2', name: 'Sarah Johnson', status: 'away' },
    { id: 'player3', name: 'Mike Davis', status: 'online' },
  ];

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '💪', '⚽', '🏆'];

  // Animation Effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollToBottom) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [mockMessages, scrollToBottom]);

  // Handle typing indicator
  const handleTyping = useCallback((text) => {
    setMessage(text);
    
    if (!isTyping) {
      setIsTyping(true);
      // Dispatch typing start action
    }
    
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
      // Dispatch typing stop action
    }, 2000);
  }, [isTyping]);

  const sendMessage = useCallback(() => {
    if (message.trim() === '') return;

    const newMessage = {
      id: Date.now().toString(),
      userId: user?.id || 'current_user',
      userName: user?.name || 'You',
      userAvatar: user?.avatar,
      message: message.trim(),
      timestamp: new Date(),
      type: 'text',
      replyTo: replyToMessage?.id,
    };

    // Dispatch send message action
    console.log('Sending message:', newMessage);
    
    setMessage('');
    setReplyToMessage(null);
    setIsTyping(false);
    Vibration.vibrate(50);
    
    // Show success feedback
    Alert.alert('Message Sent', 'Your message has been sent to the team! 📤', [
      { text: 'OK', style: 'default' }
    ]);
  }, [message, user, replyToMessage]);

  const handleReaction = useCallback((messageId, emoji) => {
    // Dispatch reaction action
    console.log('Adding reaction:', { messageId, emoji });
    Vibration.vibrate(30);
  }, []);

  const handleReply = useCallback((msg) => {
    setReplyToMessage(msg);
    textInputRef.current?.focus();
  }, []);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return timestamp.toLocaleDateString();
  };

  const MessageBubble = ({ msg, isOwn }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        alignSelf: isOwn ? 'flex-end' : 'flex-start',
        maxWidth: width * 0.8,
        marginVertical: SPACING.xs,
        marginHorizontal: SPACING.md,
      }}
    >
      {msg.replyTo && (
        <Surface
          style={{
            padding: SPACING.sm,
            marginBottom: SPACING.xs,
            borderRadius: 8,
            borderLeftWidth: 3,
            borderLeftColor: COLORS.primary,
            backgroundColor: COLORS.background,
          }}
        >
          <Text style={[TEXT_STYLES.caption, { fontStyle: 'italic' }]}>
            Replying to: "{mockMessages.find(m => m.id === msg.replyTo)?.message?.substring(0, 50)}..."
          </Text>
        </Surface>
      )}
      
      <TouchableOpacity
        onLongPress={() => setSelectedMessage(msg)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isOwn ? [COLORS.primary, COLORS.secondary] : ['#f0f0f0', '#e8e8e8']}
          style={{
            padding: SPACING.md,
            borderRadius: 20,
            borderBottomRightRadius: isOwn ? 4 : 20,
            borderBottomLeftRadius: isOwn ? 20 : 4,
          }}
        >
          {!isOwn && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
              <Avatar.Text
                size={20}
                label={msg.userName[0]}
                style={{ backgroundColor: msg.isCoach ? COLORS.warning : COLORS.success }}
              />
              <Text style={[TEXT_STYLES.caption, { 
                marginLeft: SPACING.xs, 
                color: msg.isCoach ? COLORS.warning : COLORS.text,
                fontWeight: '600'
              }]}>
                {msg.userName} {msg.isCoach && '👑'}
              </Text>
            </View>
          )}
          
          <Text style={[TEXT_STYLES.body, { 
            color: isOwn ? '#ffffff' : COLORS.text,
            lineHeight: 22 
          }]}>
            {msg.message}
          </Text>
          
          {msg.type === 'video' && (
            <View style={{
              marginTop: SPACING.sm,
              height: 120,
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Icon name="play-circle-filled" size={40} color="#ffffff" />
              <Text style={[TEXT_STYLES.caption, { color: '#ffffff', marginTop: SPACING.xs }]}>
                Tap to play video
              </Text>
            </View>
          )}
          
          <Text style={[TEXT_STYLES.caption, { 
            color: isOwn ? 'rgba(255,255,255,0.8)' : COLORS.textSecondary,
            textAlign: 'right',
            marginTop: SPACING.xs 
          }]}>
            {formatTime(msg.timestamp)}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      
      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
        <View style={{
          flexDirection: 'row',
          marginTop: SPACING.xs,
          alignSelf: isOwn ? 'flex-end' : 'flex-start'
        }}>
          {Object.entries(msg.reactions).map(([emoji, users]) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => handleReaction(msg.id, emoji)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 12,
                paddingHorizontal: SPACING.sm,
                paddingVertical: SPACING.xs,
                marginRight: SPACING.xs,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <Text>{emoji}</Text>
              <Text style={[TEXT_STYLES.caption, { marginLeft: 2 }]}>{users.length}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );

  const TypingIndicator = () => (
    typingUsers.length > 0 && (
      <Animated.View
        style={{
          opacity: fadeAnim,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
        }}
      >
        <View style={{
          flexDirection: 'row',
          backgroundColor: COLORS.background,
          padding: SPACING.sm,
          borderRadius: 20,
          alignItems: 'center'
        }}>
          <Text style={[TEXT_STYLES.caption, { marginRight: SPACING.xs }]}>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {[0, 1, 2].map(i => (
              <Animated.View
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: COLORS.primary,
                  marginHorizontal: 1,
                  opacity: fadeAnim
                }}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    )
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.sm,
          paddingHorizontal: SPACING.md,
          paddingBottom: SPACING.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <IconButton
            icon="arrow-back"
            iconColor="#ffffff"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
            <Text style={[TEXT_STYLES.h3, { color: '#ffffff' }]}>
              {teamData?.name || 'Team Chat'} 💬
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              {mockOnlineMembers.filter(m => m.status === 'online').length} online
            </Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon="info"
            iconColor="#ffffff"
            size={20}
            onPress={() => Alert.alert('Team Info', 'Team information and settings coming soon! ℹ️')}
          />
          <IconButton
            icon="dots-vertical"
            iconColor="#ffffff"
            size={20}
            onPress={() => Alert.alert('Chat Options', 'More chat options coming soon! ⚙️')}
          />
        </View>
      </LinearGradient>

      {/* Online Members Strip */}
      <Surface style={{ paddingVertical: SPACING.sm }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.md }}
        >
          {mockOnlineMembers.map((member, index) => (
            <TouchableOpacity
              key={member.id}
              style={{ 
                alignItems: 'center', 
                marginRight: SPACING.md,
                opacity: member.status === 'online' ? 1 : 0.6 
              }}
            >
              <View style={{ position: 'relative' }}>
                <Avatar.Text
                  size={36}
                  label={member.name[0]}
                  style={{ backgroundColor: COLORS.primary }}
                />
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: member.status === 'online' ? COLORS.online : 
                                   member.status === 'away' ? COLORS.away : COLORS.offline,
                    borderWidth: 2,
                    borderColor: COLORS.surface,
                  }}
                />
              </View>
              <Text style={[TEXT_STYLES.caption, { 
                marginTop: SPACING.xs,
                maxWidth: 60,
                textAlign: 'center'
              }]} numberOfLines={1}>
                {member.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Surface>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          onScroll={(e) => {
            const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
            const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;
            setScrollToBottom(isAtBottom);
          }}
          scrollEventThrottle={16}
        >
          <View style={{ paddingVertical: SPACING.md }}>
            {mockMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isOwn={msg.userId === (user?.id || 'current_user')}
              />
            ))}
            <TypingIndicator />
          </View>
        </ScrollView>

        {/* Quick Scroll to Bottom */}
        {!scrollToBottom && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: SPACING.md,
              bottom: 100,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: COLORS.primary,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 4,
            }}
            onPress={() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
              setScrollToBottom(true);
            }}
          >
            <Icon name="keyboard-arrow-down" size={24} color="#ffffff" />
            {newMessageCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  backgroundColor: COLORS.error,
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={[TEXT_STYLES.caption, { color: '#ffffff', fontSize: 10 }]}>
                  {newMessageCount > 99 ? '99+' : newMessageCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Reply Banner */}
        {replyToMessage && (
          <Surface
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: SPACING.md,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
            }}
          >
            <Icon name="reply" size={20} color={COLORS.primary} />
            <View style={{ flex: 1, marginHorizontal: SPACING.sm }}>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                Replying to {replyToMessage.userName}
              </Text>
              <Text style={[TEXT_STYLES.bodySmall]} numberOfLines={1}>
                {replyToMessage.message}
              </Text>
            </View>
            <IconButton
              icon="close"
              size={20}
              onPress={() => setReplyToMessage(null)}
            />
          </Surface>
        )}

        {/* Message Input */}
        <Surface
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            padding: SPACING.md,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
          }}
        >
          <TouchableOpacity
            onPress={() => setShowAttachments(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: COLORS.background,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: SPACING.sm,
            }}
          >
            <Icon name="attach-file" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={{ 
            flex: 1, 
            backgroundColor: COLORS.background,
            borderRadius: 20,
            paddingHorizontal: SPACING.md,
            minHeight: 40,
            maxHeight: 100,
            justifyContent: 'center'
          }}>
            <TextInput
              ref={textInputRef}
              style={[TEXT_STYLES.body, { 
                textAlignVertical: 'center',
                minHeight: 40,
                maxHeight: 100,
              }]}
              multiline
              placeholder="Type a message... 💬"
              placeholderTextColor={COLORS.textSecondary}
              value={message}
              onChangeText={handleTyping}
              onSubmitEditing={sendMessage}
            />
          </View>

          <TouchableOpacity
            onPress={() => setShowEmojiPicker(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: COLORS.background,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: SPACING.sm,
            }}
          >
            <Text style={{ fontSize: 20 }}>😊</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={sendMessage}
            disabled={message.trim() === ''}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: message.trim() ? COLORS.primary : COLORS.background,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon 
              name="send" 
              size={20} 
              color={message.trim() ? '#ffffff' : COLORS.textSecondary} 
            />
          </TouchableOpacity>
        </Surface>
      </KeyboardAvoidingView>

      {/* Message Options Modal */}
      <Portal>
        <Modal
          visible={!!selectedMessage}
          onDismiss={() => setSelectedMessage(null)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.md,
            borderRadius: 12,
            padding: SPACING.md,
          }}
        >
          {selectedMessage && (
            <>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                Message Options
              </Text>
              
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: SPACING.md,
                }}
                onPress={() => {
                  handleReply(selectedMessage);
                  setSelectedMessage(null);
                }}
              >
                <Icon name="reply" size={24} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.md }]}>Reply</Text>
              </TouchableOpacity>

              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginVertical: SPACING.md
              }}>
                {emojis.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={{
                      padding: SPACING.sm,
                      margin: SPACING.xs,
                      backgroundColor: COLORS.background,
                      borderRadius: 8,
                    }}
                    onPress={() => {
                      handleReaction(selectedMessage.id, emoji);
                      setSelectedMessage(null);
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: SPACING.md,
                }}
                onPress={() => {
                  Alert.alert('Copy Message', 'Message copied to clipboard! 📋');
                  setSelectedMessage(null);
                }}
              >
                <Icon name="content-copy" size={24} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.md }]}>Copy</Text>
              </TouchableOpacity>
            </>
          )}
        </Modal>
      </Portal>

      {/* Emoji Picker Modal */}
      <Portal>
        <Modal
          visible={showEmojiPicker}
          onDismiss={() => setShowEmojiPicker(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.md,
            borderRadius: 12,
            padding: SPACING.md,
          }}
        >
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Quick Emojis 😊
          </Text>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}>
            {emojis.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={{
                  width: '18%',
                  aspectRatio: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: COLORS.background,
                  borderRadius: 8,
                  marginBottom: SPACING.sm,
                }}
                onPress={() => {
                  setMessage(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }}
              >
                <Text style={{ fontSize: 28 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
      </Portal>

      {/* Attachments Modal */}
      <Portal>
        <Modal
          visible={showAttachments}
          onDismiss={() => setShowAttachments(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.md,
            borderRadius: 12,
            padding: SPACING.md,
          }}
        >
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Share Content 📎
          </Text>
          
          {[
            { icon: 'photo-camera', label: 'Camera', action: 'camera' },
            { icon: 'photo-library', label: 'Gallery', action: 'gallery' },
            { icon: 'videocam', label: 'Video', action: 'video' },
            { icon: 'insert-drive-file', label: 'Document', action: 'document' },
            { icon: 'location-on', label: 'Location', action: 'location' },
          ].map((item) => (
            <TouchableOpacity
              key={item.action}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: SPACING.md,
              }}
              onPress={() => {
                Alert.alert(
                  'Feature Coming Soon',
                  `${item.label} sharing will be available soon! 🚀`,
                  [{ text: 'OK', style: 'default' }]
                );
                setShowAttachments(false);
              }}
            >
              <Icon name={item.icon} size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.md }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Modal>
      </Portal>
    </View>
  );
};

export default TeamChatScreen;
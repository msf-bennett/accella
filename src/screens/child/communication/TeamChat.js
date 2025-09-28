import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Vibration,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Keyboard,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Avatar,
  IconButton,
  Searchbar,
  FAB,
  Surface,
  Badge,
  Button,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { height: screenHeight } = Dimensions.get('window');

const TeamChat = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { messages, onlineMembers } = useSelector(state => state.communication);
  
  const [refreshing, setRefreshing] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);
  const textInputRef = useRef(null);

  const commonEmojis = ['⚽', '🏆', '👏', '💪', '🔥', '⭐', '👍', '❤️', '😊', '🎉', '⚡', '🌟'];
  const quickMessages = [
    'Great job! 👏',
    'Good luck! 🍀',
    'See you at practice! ⚽',
    'Way to go! 🏆',
    'Keep it up! 💪',
    'Awesome! 🌟'
  ];

  useEffect(() => {
    loadMessages();
    animateEntrance();
    setupKeyboardListeners();
    
    return () => {
      Keyboard.removeAllListeners();
    };
  }, []);

  const setupKeyboardListeners = () => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => scrollToBottom(), 100);
      }
    );
    
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    
    return () => {
      keyboardWillShow?.remove();
      keyboardWillHide?.remove();
    };
  };

  const animateEntrance = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadMessages = useCallback(async () => {
    try {
      // Mock messages data - replace with actual API call
      const mockMessages = [
        {
          id: '1',
          text: 'Great practice today everyone! 🏆 Keep up the amazing work!',
          author: 'Coach Sarah',
          authorId: 'coach1',
          authorAvatar: 'https://example.com/coach-avatar.jpg',
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          type: 'text',
          isCoach: true,
          reactions: { '👏': ['player1', 'player2'], '⚽': ['player3'] }
        },
        {
          id: '2',
          text: 'Thanks coach! That new drill was fun! ⚽',
          author: 'Alex',
          authorId: 'player1',
          authorAvatar: 'https://example.com/player1-avatar.jpg',
          timestamp: new Date(Date.now() - 240000), // 4 minutes ago
          type: 'text',
          isCoach: false,
          reactions: { '👍': ['coach1', 'player2'] }
        },
        {
          id: '3',
          text: 'Can\'t wait for the game tomorrow! 🔥',
          author: 'Jordan',
          authorId: 'player2',
          authorAvatar: 'https://example.com/player2-avatar.jpg',
          timestamp: new Date(Date.now() - 180000), // 3 minutes ago
          type: 'text',
          isCoach: false,
          reactions: { '🏆': ['coach1'], '⭐': ['player1', 'player3'] }
        },
        {
          id: '4',
          text: 'Remember to bring water bottles and arrive 15 minutes early! 💪',
          author: 'Coach Sarah',
          authorId: 'coach1',
          authorAvatar: 'https://example.com/coach-avatar.jpg',
          timestamp: new Date(Date.now() - 120000), // 2 minutes ago
          type: 'text',
          isCoach: true,
          reactions: { '👍': ['player1', 'player2', 'player3'] }
        }
      ];
      
      // Dispatch to Redux store
      // dispatch(setMessages(mockMessages));
    } catch (error) {
      Alert.alert('Oops! 🤔', 'Couldn\'t load messages right now. Please try again!');
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  }, [loadMessages]);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const sendMessage = () => {
    if (messageText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: messageText.trim(),
        author: user?.name || 'You',
        authorId: user?.id,
        authorAvatar: user?.avatar,
        timestamp: new Date(),
        type: 'text',
        isCoach: user?.role === 'coach',
        reactions: {}
      };
      
      // Dispatch to Redux store
      // dispatch(sendChatMessage(newMessage));
      
      setMessageText('');
      Vibration.vibrate(30);
      setTimeout(scrollToBottom, 100);
    }
  };

  const addReaction = (messageId, emoji) => {
    Vibration.vibrate(30);
    // dispatch(addMessageReaction(messageId, emoji, user.id));
  };

  const sendQuickMessage = (message) => {
    setMessageText(message);
    sendMessage();
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isToday = (timestamp) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    return today.toDateString() === messageDate.toDateString();
  };

  const OnlineMembersList = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      style={{ marginBottom: SPACING.sm }}
    >
      {[
        { id: 'coach1', name: 'Coach Sarah', avatar: 'https://example.com/coach.jpg', isOnline: true },
        { id: 'player1', name: 'Alex', avatar: 'https://example.com/player1.jpg', isOnline: true },
        { id: 'player2', name: 'Jordan', avatar: 'https://example.com/player2.jpg', isOnline: true },
        { id: 'player3', name: 'Sam', avatar: 'https://example.com/player3.jpg', isOnline: false },
      ].map(member => (
        <View key={member.id} style={{ alignItems: 'center', marginRight: SPACING.md }}>
          <View style={{ position: 'relative' }}>
            <Avatar.Image 
              size={50} 
              source={{ uri: member.avatar || 'https://via.placeholder.com/50' }}
            />
            {member.isOnline && (
              <View style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: COLORS.success,
                borderWidth: 2,
                borderColor: 'white',
              }} />
            )}
          </View>
          <Paragraph style={[TEXT_STYLES.caption, { fontSize: 10, marginTop: 4 }]}>
            {member.name}
          </Paragraph>
        </View>
      ))}
    </ScrollView>
  );

  const MessageBubble = ({ message, index }) => {
    const isOwn = message.authorId === user?.id;
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            })
          }]
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: isOwn ? 'flex-end' : 'flex-start',
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.sm,
        }}>
          {!isOwn && (
            <Avatar.Image 
              size={32} 
              source={{ uri: message.authorAvatar || 'https://via.placeholder.com/32' }}
              style={{ marginRight: SPACING.sm, alignSelf: 'flex-end' }}
            />
          )}
          
          <View style={{ maxWidth: '70%' }}>
            {!isOwn && (
              <Paragraph style={[TEXT_STYLES.caption, { 
                marginBottom: 2, 
                marginLeft: SPACING.sm,
                color: message.isCoach ? COLORS.primary : COLORS.secondary 
              }]}>
                {message.author} {message.isCoach && '👨‍🏫'}
              </Paragraph>
            )}
            
            <Surface style={{
              padding: SPACING.sm,
              borderRadius: 16,
              backgroundColor: isOwn ? COLORS.primary : 
                              message.isCoach ? COLORS.success + '20' : COLORS.surface,
              elevation: 2,
            }}>
              <Paragraph style={{
                color: isOwn ? 'white' : COLORS.text,
                fontSize: 14,
                lineHeight: 20,
              }}>
                {message.text}
              </Paragraph>
              
              <Paragraph style={{
                fontSize: 10,
                marginTop: 4,
                color: isOwn ? 'rgba(255,255,255,0.7)' : COLORS.secondary,
                textAlign: 'right',
              }}>
                {formatTime(message.timestamp)}
              </Paragraph>
            </Surface>
            
            {/* Reactions */}
            {Object.keys(message.reactions).length > 0 && (
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginTop: 4,
                marginLeft: isOwn ? 0 : SPACING.sm,
              }}>
                {Object.entries(message.reactions).map(([emoji, users]) => (
                  <Surface
                    key={emoji}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      marginRight: 4,
                      marginBottom: 2,
                      borderRadius: 12,
                      backgroundColor: users.includes(user?.id) ? COLORS.primary + '30' : COLORS.background,
                    }}
                  >
                    <Paragraph style={{ fontSize: 12, marginRight: 2 }}>{emoji}</Paragraph>
                    <Paragraph style={{ fontSize: 10, color: COLORS.secondary }}>{users.length}</Paragraph>
                  </Surface>
                ))}
              </View>
            )}
            
            {/* Quick reaction buttons */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 4 }}
            >
              {['👍', '❤️', '😊', '👏'].map(emoji => (
                <IconButton
                  key={emoji}
                  icon={() => <Paragraph style={{ fontSize: 16 }}>{emoji}</Paragraph>}
                  size={20}
                  onPress={() => addReaction(message.id, emoji)}
                  style={{ 
                    margin: 0, 
                    marginRight: 4,
                    backgroundColor: COLORS.background + '80'
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Animated.View>
    );
  };

  const EmojiPicker = () => (
    <Portal>
      <Modal
        visible={showEmojiPicker}
        onDismiss={() => setShowEmojiPicker(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          borderRadius: 16,
          padding: SPACING.md,
          maxHeight: screenHeight * 0.6,
        }}
      >
        <Title style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          Quick Messages & Emojis 🎉
        </Title>
        
        <Paragraph style={[TEXT_STYLES.body, { marginBottom: SPACING.md, color: COLORS.secondary }]}>
          Tap to send a quick message!
        </Paragraph>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ marginBottom: SPACING.lg }}>
            <Paragraph style={[TEXT_STYLES.caption, { marginBottom: SPACING.sm, color: COLORS.primary }]}>
              QUICK MESSAGES
            </Paragraph>
            {quickMessages.map((message, index) => (
              <Button
                key={index}
                mode="outlined"
                onPress={() => sendQuickMessage(message)}
                style={{
                  marginBottom: SPACING.sm,
                  borderColor: COLORS.primary + '40',
                }}
                contentStyle={{ justifyContent: 'flex-start' }}
              >
                {message}
              </Button>
            ))}
          </View>
          
          <View>
            <Paragraph style={[TEXT_STYLES.caption, { marginBottom: SPACING.sm, color: COLORS.primary }]}>
              EMOJIS
            </Paragraph>
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              justifyContent: 'space-between' 
            }}>
              {commonEmojis.map((emoji, index) => (
                <IconButton
                  key={index}
                  icon={() => <Paragraph style={{ fontSize: 24 }}>{emoji}</Paragraph>}
                  size={40}
                  onPress={() => setMessageText(prev => prev + emoji)}
                  style={{ 
                    margin: 4,
                    backgroundColor: COLORS.background,
                  }}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: StatusBar.currentHeight + SPACING.lg, paddingBottom: SPACING.md }}
      >
        <View style={{ paddingHorizontal: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Title style={[TEXT_STYLES.h1, { color: 'white', marginBottom: 4 }]}>
                Team Chat 💬
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                Connect with your teammates! 🤝
              </Paragraph>
            </View>
            <Badge size={16} style={{ backgroundColor: COLORS.success }}>
              {onlineMembers?.length || 3} online
            </Badge>
          </View>
        </View>
      </LinearGradient>

      <OnlineMembersList />

      <ScrollView
        ref={scrollViewRef}
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
        onContentSizeChange={scrollToBottom}
      >
        {(messages || [
          // Mock data for display
          {
            id: '1',
            text: 'Great practice today everyone! 🏆 Keep up the amazing work!',
            author: 'Coach Sarah',
            authorId: 'coach1',
            authorAvatar: 'https://example.com/coach-avatar.jpg',
            timestamp: new Date(Date.now() - 300000),
            type: 'text',
            isCoach: true,
            reactions: { '👏': ['player1', 'player2'], '⚽': ['player3'] }
          }
        ]).map((message, index) => (
          <MessageBubble key={message.id} message={message} index={index} />
        ))}
        
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Message Input */}
      <Surface style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: 'white',
        elevation: 8,
        marginBottom: keyboardHeight > 0 ? keyboardHeight - 20 : 0,
      }}>
        <IconButton
          icon="emoji-emotions"
          size={24}
          onPress={() => setShowEmojiPicker(true)}
          iconColor={COLORS.primary}
        />
        
        <TextInput
          ref={textInputRef}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 20,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            marginHorizontal: SPACING.sm,
            maxHeight: 100,
            fontSize: 14,
          }}
          placeholder="Type a friendly message... 😊"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        
        <IconButton
          icon="send"
          size={24}
          onPress={sendMessage}
          iconColor={messageText.trim() ? COLORS.primary : COLORS.secondary}
          disabled={!messageText.trim()}
        />
      </Surface>

      <EmojiPicker />
    </KeyboardAvoidingView>
  );
};

export default TeamChat;
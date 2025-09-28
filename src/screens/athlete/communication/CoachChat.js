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
  KeyboardAvoidingView,
  Platform,
  Vibration,
  FlatList,
  Animated,
} from 'react-native';
import { 
  Card,
  Button,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
  TextInput,
  Chip,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const CoachChat = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { coaches, activeChats } = useSelector(state => state.chat);
  
  const coachId = route?.params?.coachId;
  const scrollViewRef = useRef(null);
  const textInputRef = useRef(null);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Mock coach data
  const mockCoach = {
    id: coachId || 1,
    name: 'Coach Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    role: 'Running Coach',
    specialization: 'Marathon Training',
    isOnline: true,
    lastSeen: '2 min ago',
    responseTime: 'Usually replies in 15 min',
  };

  // Mock messages data
  const mockMessages = [
    {
      id: 1,
      text: "Hey! Great job on today's 10K run! 🏃‍♂️ How are you feeling?",
      sender: 'coach',
      timestamp: '2024-08-22T08:30:00Z',
      type: 'text',
      isRead: true,
    },
    {
      id: 2,
      text: "Thank you! I felt really strong throughout. My legs feel good too!",
      sender: 'user',
      timestamp: '2024-08-22T08:35:00Z',
      type: 'text',
      isRead: true,
    },
    {
      id: 3,
      text: "That's fantastic! Your pace was consistent. Let's increase the distance gradually next week.",
      sender: 'coach',
      timestamp: '2024-08-22T08:40:00Z',
      type: 'text',
      isRead: true,
    },
    {
      id: 4,
      text: "Should I focus on any specific drills?",
      sender: 'user',
      timestamp: '2024-08-22T08:45:00Z',
      type: 'text',
      isRead: true,
    },
    {
      id: 5,
      text: "Yes! Here's a video showing the proper form for interval training:",
      sender: 'coach',
      timestamp: '2024-08-22T08:50:00Z',
      type: 'text',
      isRead: true,
    },
    {
      id: 6,
      text: '',
      sender: 'coach',
      timestamp: '2024-08-22T08:51:00Z',
      type: 'video',
      media: {
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
        duration: '2:45',
        title: 'Interval Training Form'
      },
      isRead: true,
    },
    {
      id: 7,
      text: "Perfect! I'll practice this before our next session 👍",
      sender: 'user',
      timestamp: '2024-08-22T09:00:00Z',
      type: 'text',
      isRead: false,
    },
  ];

  // Load chat data
  useEffect(() => {
    loadChatData();
    startAnimations();
  }, [coachId]);

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

  const loadChatData = useCallback(async () => {
    try {
      setLoading(true);
      setSelectedCoach(mockCoach);
      setChatMessages(mockMessages);
      // Simulate typing indicator
      setTimeout(() => setIsTyping(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to load chat data');
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadChatData().finally(() => setRefreshing(false));
  }, [loadChatData]);

  // Send message
  const sendMessage = useCallback(async () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: false,
    };

    setChatMessages(prev => [...prev, newMessage]);
    setMessage('');
    Vibration.vibrate(50);

    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate coach response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        const responses = [
          "Got it! Thanks for the update 👍",
          "Perfect! Keep up the great work!",
          "That's exactly what I wanted to hear!",
          "Excellent progress! Let's continue with the plan.",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const coachReply = {
          id: Date.now() + 1,
          text: randomResponse,
          sender: 'coach',
          timestamp: new Date().toISOString(),
          type: 'text',
          isRead: false,
        };
        
        setChatMessages(prev => [...prev, coachReply]);
        setIsTyping(false);
        
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1500);
    }, 1000);
  }, [message]);

  // Quick actions
  const quickActions = [
    {
      id: 'schedule',
      title: 'Schedule Session',
      icon: 'event',
      color: COLORS.primary,
      action: () => Alert.alert('Coming Soon!', 'Session scheduling feature in development'),
    },
    {
      id: 'progress',
      title: 'Share Progress',
      icon: 'trending-up',
      color: COLORS.success,
      action: () => Alert.alert('Coming Soon!', 'Progress sharing feature in development'),
    },
    {
      id: 'camera',
      title: 'Take Photo',
      icon: 'camera-alt',
      color: '#FF6B6B',
      action: () => Alert.alert('Coming Soon!', 'Camera feature in development'),
    },
    {
      id: 'video',
      title: 'Record Video',
      icon: 'videocam',
      color: '#4ECDC4',
      action: () => Alert.alert('Coming Soon!', 'Video recording feature in development'),
    },
  ];

  const handleQuickAction = (action) => {
    setQuickActionsVisible(false);
    Vibration.vibrate(50);
    action.action();
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.sender === 'user';
    const isLastMessage = index === chatMessages.length - 1;

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.coachMessageContainer,
          { opacity: fadeAnim },
        ]}
      >
        {!isUser && (
          <Avatar.Image
            size={32}
            source={{ uri: selectedCoach?.avatar }}
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.coachMessageBubble,
        ]}>
          {item.type === 'text' && (
            <Text style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.coachMessageText,
            ]}>
              {item.text}
            </Text>
          )}

          {item.type === 'video' && item.media && (
            <TouchableOpacity
              style={styles.mediaContainer}
              onPress={() => {
                setSelectedMedia(item.media);
                setMediaModalVisible(true);
              }}
            >
              <Image source={{ uri: item.media.thumbnail }} style={styles.videoThumbnail} />
              <View style={styles.videoOverlay}>
                <Icon name="play-arrow" size={32} color="#fff" />
                <Text style={styles.videoDuration}>{item.media.duration}</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTimestamp,
              isUser ? styles.userTimestamp : styles.coachTimestamp,
            ]}>
              {formatTimestamp(item.timestamp)}
            </Text>
            {isUser && (
              <Icon
                name={item.isRead ? 'done-all' : 'done'}
                size={14}
                color={item.isRead ? COLORS.primary : COLORS.text + '60'}
                style={styles.readIndicator}
              />
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderTypingIndicator = () => (
    isTyping && (
      <Animated.View style={[styles.typingContainer, { opacity: fadeAnim }]}>
        <Avatar.Image
          size={32}
          source={{ uri: selectedCoach?.avatar }}
          style={styles.messageAvatar}
        />
        <Surface style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </Surface>
      </Animated.View>
    )
  );

  const renderQuickActionsModal = () => (
    <Portal>
      <Modal
        visible={quickActionsVisible}
        onDismiss={() => setQuickActionsVisible(false)}
        contentContainerStyle={styles.quickActionsModal}
      >
        <BlurView style={styles.blurContainer} blurType="dark" blurAmount={10}>
          <Surface style={styles.quickActionsContent}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionItem}
                  onPress={() => handleQuickAction(action)}
                >
                  <Surface style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                    <Icon name={action.icon} size={24} color={action.color} />
                  </Surface>
                  <Text style={styles.quickActionText}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderMediaModal = () => (
    <Portal>
      <Modal
        visible={mediaModalVisible}
        onDismiss={() => setMediaModalVisible(false)}
        contentContainerStyle={styles.mediaModal}
      >
        <Surface style={styles.mediaContent}>
          <View style={styles.mediaHeader}>
            <Text style={styles.mediaTitle}>{selectedMedia?.title}</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setMediaModalVisible(false)}
            />
          </View>
          {selectedMedia && (
            <View style={styles.videoPlayer}>
              <Image source={{ uri: selectedMedia.thumbnail }} style={styles.fullVideoThumbnail} />
              <TouchableOpacity style={styles.playButton}>
                <Icon name="play-arrow" size={48} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </Surface>
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
          
          <TouchableOpacity 
            style={styles.coachInfo}
            onPress={() => navigation.navigate('CoachProfile', { coachId: selectedCoach?.id })}
          >
            <Avatar.Image
              size={40}
              source={{ uri: selectedCoach?.avatar }}
              style={styles.coachAvatar}
            />
            <View style={styles.coachDetails}>
              <Text style={styles.coachName}>{selectedCoach?.name}</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { 
                  backgroundColor: selectedCoach?.isOnline ? COLORS.success : '#ccc' 
                }]} />
                <Text style={styles.statusText}>
                  {selectedCoach?.isOnline ? 'Online' : selectedCoach?.lastSeen}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <IconButton
              icon="videocam"
              iconColor="#fff"
              size={24}
              onPress={() => Alert.alert('Coming Soon!', 'Video call feature in development')}
            />
            <IconButton
              icon="phone"
              iconColor="#fff"
              size={24}
              onPress={() => Alert.alert('Coming Soon!', 'Voice call feature in development')}
            />
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderMessageInput = () => (
    <View style={styles.inputContainer}>
      <Surface style={styles.inputSurface}>
        <TextInput
          ref={textInputRef}
          mode="outlined"
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          multiline
          maxLength={500}
          style={styles.messageInput}
          outlineColor="transparent"
          activeOutlineColor="transparent"
          contentStyle={styles.inputContent}
        />
        <View style={styles.inputActions}>
          <IconButton
            icon="add"
            size={24}
            iconColor={COLORS.primary}
            onPress={() => setQuickActionsVisible(true)}
          />
          <IconButton
            icon="send"
            size={24}
            iconColor={message.trim() ? COLORS.primary : COLORS.text + '40'}
            onPress={sendMessage}
            disabled={!message.trim()}
          />
        </View>
      </Surface>
    </View>
  );

  if (!selectedCoach) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderHeader()}

      <View style={styles.chatContainer}>
        <FlatList
          ref={scrollViewRef}
          data={chatMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListFooterComponent={renderTypingIndicator}
          onContentSizeChange={() => 
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        />
      </View>

      {renderMessageInput()}
      {renderQuickActionsModal()}
      {renderMediaModal()}
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
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  coachAvatar: {
    marginRight: SPACING.md,
  },
  coachDetails: {
    flex: 1,
  },
  coachName: {
    ...TEXT_STYLES.h4,
    color: '#fff',
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
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
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  coachMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: SPACING.sm,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  userMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
    marginLeft: SPACING.xl,
  },
  coachMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    marginRight: SPACING.xl,
  },
  messageText: {
    ...TEXT_STYLES.body,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  coachMessageText: {
    color: COLORS.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  messageTimestamp: {
    ...TEXT_STYLES.caption,
    fontSize: 11,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
  },
  coachTimestamp: {
    color: COLORS.text + '60',
  },
  readIndicator: {
    marginLeft: SPACING.xs,
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  videoThumbnail: {
    width: 200,
    height: 120,
    borderRadius: 8,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  videoDuration: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  typingBubble: {
    backgroundColor: '#fff',
    padding: SPACING.md,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    marginRight: SPACING.xl,
    elevation: 2,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.text + '40',
    marginHorizontal: 2,
  },
  dot1: {
    animationDelay: '0s',
  },
  dot2: {
    animationDelay: '0.2s',
  },
  dot3: {
    animationDelay: '0.4s',
  },
  inputContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  inputSurface: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 24,
    elevation: 2,
    paddingVertical: SPACING.xs,
  },
  messageInput: {
    flex: 1,
    backgroundColor: 'transparent',
    maxHeight: 100,
  },
  inputContent: {
    paddingHorizontal: SPACING.md,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionsModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  quickActionsContent: {
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 16,
    elevation: 8,
  },
  quickActionsTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    fontWeight: '600',
  },
  mediaModal: {
    flex: 1,
    margin: SPACING.lg,
  },
  mediaContent: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mediaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#fff',
  },
  mediaTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    flex: 1,
  },
  videoPlayer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  fullVideoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CoachChat;
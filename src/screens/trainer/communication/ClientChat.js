import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Vibration,
  Animated,
  Image,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  ProgressBar,
  Portal,
  Modal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const ClientChat = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { clientId } = route.params;
  const { user } = useSelector(state => state.auth);
  const scrollViewRef = useRef(null);
  const messageInputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [client, setClient] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('online');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock client data
  const mockClient = {
    id: clientId,
    name: 'Sarah Johnson',
    avatar: 'https://via.placeholder.com/100',
    status: 'online',
    lastSeen: 'Active now',
    program: 'Weight Loss Program',
    streak: 12,
    level: 'Intermediate',
    nextSession: 'Tomorrow 9:00 AM',
    goals: ['Lose 10kg', 'Build endurance', 'Improve strength'],
  };

  // Mock messages data
  const mockMessages = [
    {
      id: '1',
      text: "Good morning! How are you feeling today? Ready for our session? 💪",
      sender: 'trainer',
      timestamp: '9:00 AM',
      type: 'text',
      read: true,
    },
    {
      id: '2',
      text: "Morning coach! Feeling great and ready to crush it! 🔥",
      sender: 'client',
      timestamp: '9:15 AM',
      type: 'text',
      read: true,
    },
    {
      id: '3',
      text: "Awesome! I've updated your workout plan based on your progress. Check it out when you can 📋",
      sender: 'trainer',
      timestamp: '9:20 AM',
      type: 'text',
      read: true,
    },
    {
      id: '4',
      text: "Quick question - how's your recovery been? Any soreness from yesterday?",
      sender: 'trainer',
      timestamp: '9:25 AM',
      type: 'text',
      read: false,
    },
    {
      id: '5',
      text: "",
      sender: 'client',
      timestamp: '10:30 AM',
      type: 'workout_log',
      data: {
        exercise: 'Deadlifts',
        sets: 4,
        reps: 8,
        weight: '80kg',
        notes: 'Felt strong today!',
      },
      read: true,
    },
    {
      id: '6',
      text: "Excellent form on those deadlifts! 🎯 Your technique is really improving. Keep it up!",
      sender: 'trainer',
      timestamp: '10:35 AM',
      type: 'text',
      read: false,
    },
  ];

  const quickReplies = [
    "Great job! 🎉",
    "Keep it up! 💪",
    "How are you feeling?",
    "Any questions?",
    "Ready for next session?",
    "Need any adjustments?",
    "Awesome progress! ⭐",
    "Take your time 😊",
  ];

  useEffect(() => {
    setClient(mockClient);
    setMessages(mockMessages);
    
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Set navigation options
    navigation.setOptions({
      headerShown: false,
    });

    // Scroll to bottom when messages load
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [clientId, navigation, fadeAnim, slideAnim]);

  const sendMessage = useCallback(() => {
    if (!messageText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: messageText.trim(),
      sender: 'trainer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      read: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    Vibration.vibrate(50);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate client typing response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Add auto-response for demo
        if (Math.random() > 0.5) {
          const responses = [
            "Thanks coach! 😊",
            "Got it! 👍",
            "Will do! 💪",
            "Appreciate the support! 🙏",
          ];
          const autoResponse = {
            id: (Date.now() + 1).toString(),
            text: responses[Math.floor(Math.random() * responses.length)],
            sender: 'client',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
            read: true,
          };
          setMessages(prev => [...prev, autoResponse]);
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }, 2000);
    }, 1000);
  }, [messageText]);

  const sendQuickReply = (reply) => {
    setMessageText(reply);
    setShowQuickReplies(false);
    setTimeout(() => sendMessage(), 100);
  };

  const renderMessage = (message) => {
    const isTrainer = message.sender === 'trainer';
    const isWorkoutLog = message.type === 'workout_log';

    if (isWorkoutLog) {
      return (
        <View key={message.id} style={[styles.messageContainer, styles.workoutLogContainer]}>
          <Card style={styles.workoutLogCard}>
            <LinearGradient
              colors={[COLORS.success, COLORS.successDark]}
              style={styles.workoutLogGradient}
            >
              <View style={styles.workoutLogHeader}>
                <Icon name="fitness-center" size={24} color="white" />
                <Text style={styles.workoutLogTitle}>Workout Completed! 🏋️‍♀️</Text>
              </View>
              
              <View style={styles.workoutLogDetails}>
                <View style={styles.workoutLogRow}>
                  <Text style={styles.workoutLogLabel}>Exercise:</Text>
                  <Text style={styles.workoutLogValue}>{message.data.exercise}</Text>
                </View>
                <View style={styles.workoutLogRow}>
                  <Text style={styles.workoutLogLabel}>Sets × Reps:</Text>
                  <Text style={styles.workoutLogValue}>{message.data.sets} × {message.data.reps}</Text>
                </View>
                <View style={styles.workoutLogRow}>
                  <Text style={styles.workoutLogLabel}>Weight:</Text>
                  <Text style={styles.workoutLogValue}>{message.data.weight}</Text>
                </View>
                {message.data.notes && (
                  <View style={styles.workoutLogNotes}>
                    <Text style={styles.workoutLogNotesLabel}>Notes:</Text>
                    <Text style={styles.workoutLogNotesText}>{message.data.notes}</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.workoutLogTime}>{message.timestamp}</Text>
            </LinearGradient>
          </Card>
        </View>
      );
    }

    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isTrainer ? styles.trainerMessageContainer : styles.clientMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isTrainer ? styles.trainerBubble : styles.clientBubble
        ]}>
          <Text style={[
            styles.messageText,
            isTrainer ? styles.trainerMessageText : styles.clientMessageText
          ]}>
            {message.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isTrainer ? styles.trainerMessageTime : styles.clientMessageTime
            ]}>
              {message.timestamp}
            </Text>
            {isTrainer && (
              <Icon 
                name={message.read ? "done-all" : "done"} 
                size={14} 
                color={message.read ? COLORS.primary : COLORS.textSecondary}
                style={styles.readIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
        <Text style={styles.typingText}>{client?.name} is typing...</Text>
      </View>
    );
  };

  const renderClientHeader = () => (
    <Surface style={styles.clientHeader} elevation={2}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.clientHeaderInfo}
        onPress={() => navigation.navigate('ClientProfile', { clientId })}
      >
        <Avatar.Image 
          source={{ uri: client?.avatar }} 
          size={40}
        />
        <View style={styles.clientHeaderDetails}>
          <Text style={styles.clientHeaderName}>{client?.name}</Text>
          <View style={styles.clientHeaderStatus}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: client?.status === 'online' ? COLORS.success : COLORS.textSecondary }
            ]} />
            <Text style={styles.clientHeaderStatusText}>
              {client?.status === 'online' ? 'Active now' : client?.lastSeen}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.headerActions}>
        <IconButton
          icon="videocam"
          size={24}
          iconColor={COLORS.primary}
          onPress={() => Alert.alert('Feature Coming Soon', 'Video calls under development! 📹')}
        />
        <IconButton
          icon="dots-vertical"
          size={24}
          iconColor={COLORS.primary}
          onPress={() => Alert.alert('Feature Coming Soon', 'More options coming soon! ⚙️')}
        />
      </View>
    </Surface>
  );

  const renderQuickActions = () => (
    <Card style={styles.quickActionsCard}>
      <Card.Content>
        <Text style={styles.quickActionsTitle}>Quick Actions ⚡</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => Alert.alert('Feature Coming Soon', 'Workout assignment under development! 🏋️‍♀️')}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.quickActionGradient}
              >
                <Icon name="fitness-center" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Assign Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => Alert.alert('Feature Coming Soon', 'Progress review coming soon! 📊')}
            >
              <LinearGradient
                colors={[COLORS.success, COLORS.successDark]}
                style={styles.quickActionGradient}
              >
                <Icon name="trending-up" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.quickActionText}>View Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => Alert.alert('Feature Coming Soon', 'Nutrition plans under development! 🥗')}
            >
              <LinearGradient
                colors={[COLORS.warning, COLORS.warningDark]}
                style={styles.quickActionGradient}
              >
                <Icon name="restaurant" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Nutrition Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => Alert.alert('Feature Coming Soon', 'Session scheduling coming soon! 📅')}
            >
              <LinearGradient
                colors={[COLORS.info, COLORS.infoDark]}
                style={styles.quickActionGradient}
              >
                <Icon name="schedule" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Schedule Session</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderQuickRepliesModal = () => (
    <Modal
      visible={showQuickReplies}
      transparent
      animationType="slide"
      onRequestClose={() => setShowQuickReplies(false)}
    >
      <TouchableOpacity 
        style={styles.quickRepliesOverlay}
        activeOpacity={1}
        onPress={() => setShowQuickReplies(false)}
      >
        <View style={styles.quickRepliesContainer}>
          <Surface style={styles.quickRepliesContent}>
            <Text style={styles.quickRepliesTitle}>Quick Replies 💬</Text>
            <ScrollView style={styles.quickRepliesList}>
              {quickReplies.map((reply, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickReplyItem}
                  onPress={() => sendQuickReply(reply)}
                >
                  <Text style={styles.quickReplyText}>{reply}</Text>
                  <Icon name="send" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Surface>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderConnectionStatus = () => {
    if (connectionStatus === 'online') return null;
    
    return (
      <View style={styles.connectionStatus}>
        <Icon name="wifi-off" size={16} color={COLORS.warning} />
        <Text style={styles.connectionStatusText}>
          {connectionStatus === 'offline' ? 'Offline - Messages will sync when online' : 'Connecting...'}
        </Text>
      </View>
    );
  };

  const renderMessageInput = () => (
    <View style={styles.messageInputContainer}>
      <Surface style={styles.messageInputSurface} elevation={4}>
        <View style={styles.messageInputRow}>
          <IconButton
            icon="add"
            size={24}
            iconColor={COLORS.primary}
            onPress={() => Alert.alert('Feature Coming Soon', 'Media attachments under development! 📎')}
          />
          
          <TextInput
            ref={messageInputRef}
            style={styles.messageInput}
            placeholder="Type your message..."
            placeholderTextColor={COLORS.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
            onFocus={() => setShowQuickReplies(false)}
          />

          <IconButton
            icon="sentiment-satisfied"
            size={24}
            iconColor={COLORS.primary}
            onPress={() => setShowQuickReplies(!showQuickReplies)}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              messageText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!messageText.trim()}
          >
            <Icon 
              name="send" 
              size={20} 
              color={messageText.trim() ? "white" : COLORS.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </Surface>
    </View>
  );

  if (!client) {
    return (
      <View style={styles.loadingContainer}>
        <ProgressBar indeterminate color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      {renderClientHeader()}
      {renderConnectionStatus()}

      <Animated.View 
        style={[
          styles.chatContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {renderQuickActions()}

          <View style={styles.messagesContent}>
            {messages.map(renderMessage)}
            {renderTypingIndicator()}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>

      {renderMessageInput()}
      {renderQuickRepliesModal()}
    </KeyboardAvoidingView>
  );
};

const quickReplies = [
  "Great job! 🎉",
  "Keep it up! 💪",
  "How are you feeling?",
  "Any questions?",
  "Ready for next session?",
  "Need any adjustments?",
  "Awesome progress! ⭐",
  "Take your time 😊",
];

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: SPACING.sm,
  },
  clientHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientHeaderDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  clientHeaderName: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  clientHeaderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  clientHeaderStatusText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warningLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  connectionStatusText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    marginLeft: SPACING.sm,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  quickActionsCard: {
    margin: SPACING.md,
    borderRadius: 16,
    elevation: 2,
  },
  quickActionsTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  quickActionsContainer: {
    flexDirection: 'row',
  },
  quickAction: {
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  quickActionGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
    textAlign: 'center',
    maxWidth: 80,
  },
  messagesContent: {
    paddingHorizontal: SPACING.md,
  },
  messageContainer: {
    marginVertical: SPACING.sm,
  },
  trainerMessageContainer: {
    alignItems: 'flex-end',
  },
  clientMessageContainer: {
    alignItems: 'flex-start',
  },
  workoutLogContainer: {
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  trainerBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
  },
  clientBubble: {
    backgroundColor: COLORS.backgroundLight,
    borderBottomLeftRadius: 6,
  },
  messageText: {
    ...TEXT_STYLES.body,
  },
  trainerMessageText: {
    color: 'white',
  },
  clientMessageText: {
    color: COLORS.textPrimary,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
  },
  messageTime: {
    ...TEXT_STYLES.caption,
    fontSize: 11,
  },
  trainerMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  clientMessageTime: {
    color: COLORS.textSecondary,
  },
  readIcon: {
    marginLeft: SPACING.xs,
  },
  workoutLogCard: {
    borderRadius: 16,
    elevation: 3,
    maxWidth: '90%',
  },
  workoutLogGradient: {
    padding: SPACING.lg,
    borderRadius: 16,
  },
  workoutLogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  workoutLogTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  workoutLogDetails: {
    marginBottom: SPACING.md,
  },
  workoutLogRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  workoutLogLabel: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
  },
  workoutLogValue: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
  },
  workoutLogNotes: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  workoutLogNotesLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.xs,
  },
  workoutLogNotesText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontStyle: 'italic',
  },
  workoutLogTime: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginVertical: SPACING.sm,
  },
  typingBubble: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: 2,
  },
  typingDot1: {
    animationDelay: '0s',
  },
  typingDot2: {
    animationDelay: '0.2s',
  },
  typingDot3: {
    animationDelay: '0.4s',
  },
  typingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginLeft: SPACING.md,
  },
  messageInputContainer: {
    backgroundColor: 'white',
  },
  messageInputSurface: {
    margin: SPACING.md,
    borderRadius: 25,
    backgroundColor: 'white',
  },
  messageInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  messageInput: {
    flex: 1,
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    maxHeight: 100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sendButtonInactive: {
    backgroundColor: COLORS.backgroundLight,
  },
  quickRepliesOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  quickRepliesContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  quickRepliesContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    maxHeight: 300,
  },
  quickRepliesTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  quickRepliesList: {
    maxHeight: 200,
  },
  quickReplyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
  },
  quickReplyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
};

export default ClientChat;
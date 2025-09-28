import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Avatar,
  Surface,
  IconButton,
  FAB,
  Badge,
  Searchbar,
  Portal,
  Modal,
  ProgressBar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
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
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const CoachMessages = ({ navigation }) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Redux state
  const { user, isLoading } = useSelector(state => state.auth);
  const { messages, coaches, unreadCount } = useSelector(state => state.communication);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('conversations'); // conversations, coaches
  const [filteredData, setFilteredData] = useState([]);

  // Mock data for demonstration
  const mockConversations = [
    {
      id: '1',
      coachId: 'coach_1',
      coachName: 'Coach Sarah Wilson',
      coachAvatar: 'https://i.pravatar.cc/150?img=1',
      sport: 'Football',
      lastMessage: "Great improvement in your passing accuracy! Keep up the excellent work 🏈",
      lastMessageTime: '2 hours ago',
      unreadCount: 2,
      isActive: true,
      messages: [
        {
          id: 'm1',
          senderId: 'coach_1',
          senderName: 'Coach Sarah',
          message: "Hey! How did today's training feel?",
          timestamp: '10:30 AM',
          type: 'text',
        },
        {
          id: 'm2',
          senderId: user?.id,
          senderName: 'You',
          message: "It was challenging but I loved it! The new drills really helped.",
          timestamp: '10:32 AM',
          type: 'text',
        },
        {
          id: 'm3',
          senderId: 'coach_1',
          senderName: 'Coach Sarah',
          message: "Great improvement in your passing accuracy! Keep up the excellent work 🏈",
          timestamp: '2 hours ago',
          type: 'text',
        },
      ],
    },
    {
      id: '2',
      coachId: 'coach_2',
      coachName: 'Coach Mike Thompson',
      coachAvatar: 'https://i.pravatar.cc/150?img=2',
      sport: 'Basketball',
      lastMessage: "Don't forget tomorrow's early morning session at 7 AM",
      lastMessageTime: '1 day ago',
      unreadCount: 0,
      isActive: true,
    },
    {
      id: '3',
      coachId: 'coach_3',
      coachName: 'Coach Lisa Chen',
      coachAvatar: 'https://i.pravatar.cc/150?img=3',
      sport: 'Swimming',
      lastMessage: "Your stroke technique has improved dramatically!",
      lastMessageTime: '3 days ago',
      unreadCount: 1,
      isActive: false,
    },
  ];

  const mockAvailableCoaches = [
    {
      id: 'coach_4',
      name: 'Coach David Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=4',
      sport: 'Tennis',
      rating: 4.8,
      experience: '8 years',
      specialization: 'Youth Development',
      isOnline: true,
      responseTime: 'Usually responds in 30 min',
    },
    {
      id: 'coach_5',
      name: 'Coach Emma Johnson',
      avatar: 'https://i.pravatar.cc/150?img=5',
      sport: 'Soccer',
      rating: 4.9,
      experience: '12 years',
      specialization: 'Technical Skills',
      isOnline: false,
      responseTime: 'Usually responds in 2 hours',
    },
  ];

  useEffect(() => {
    // Entrance animation
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

    // Filter data based on active tab and search
    filterData();
  }, [fadeAnim, slideAnim, activeTab, searchQuery]);

  const filterData = useCallback(() => {
    if (activeTab === 'conversations') {
      const filtered = mockConversations.filter(conv =>
        conv.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.sport.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      const filtered = mockAvailableCoaches.filter(coach =>
        coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.specialization.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [activeTab, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh messages');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const openChat = (conversation) => {
    Vibration.vibrate(50);
    setSelectedCoach(conversation);
    setShowChatModal(true);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      Vibration.vibrate(50);
      // Add message sending logic here
      Alert.alert('Success! 🎉', 'Message sent to your coach!');
      setNewMessage('');
    }
  };

  const startNewConversation = (coach) => {
    Vibration.vibrate(50);
    Alert.alert(
      'Start Conversation? 💬',
      `Would you like to start a conversation with ${coach.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Let\'s Chat!', 
          onPress: () => {
            // Create new conversation logic
            Alert.alert('Success! 🎉', `Conversation started with ${coach.name}!`);
          }
        }
      ]
    );
  };

  const renderConversationItem = ({ item }) => (
    <Animated.View
      style={[
        styles.conversationCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <TouchableOpacity 
        onPress={() => openChat(item)}
        style={styles.conversationTouchable}
      >
        <Card style={styles.messageCard} elevation={2}>
          <View style={styles.conversationContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Image 
                size={55} 
                source={{ uri: item.coachAvatar }} 
              />
              {item.isActive && <View style={styles.onlineIndicator} />}
              {item.unreadCount > 0 && (
                <Badge 
                  style={styles.unreadBadge} 
                  size={20}
                >
                  {item.unreadCount}
                </Badge>
              )}
            </View>
            
            <View style={styles.messageInfo}>
              <View style={styles.messageHeader}>
                <Text style={styles.coachName}>{item.coachName}</Text>
                <Text style={styles.messageTime}>{item.lastMessageTime}</Text>
              </View>
              
              <Text style={styles.sportTag}>{item.sport}</Text>
              
              <Text 
                style={[
                  styles.lastMessage,
                  item.unreadCount > 0 && styles.unreadMessage
                ]}
                numberOfLines={2}
              >
                {item.lastMessage}
              </Text>
            </View>
            
            <IconButton
              icon="chevron-right"
              iconColor={COLORS.primary}
              size={24}
            />
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCoachItem = ({ item }) => (
    <Animated.View
      style={[
        styles.coachCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Card style={styles.messageCard} elevation={2}>
        <View style={styles.coachContent}>
          <View style={styles.coachHeader}>
            <View style={styles.avatarContainer}>
              <Avatar.Image 
                size={50} 
                source={{ uri: item.avatar }} 
              />
              {item.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            
            <View style={styles.coachInfo}>
              <Text style={styles.coachName}>{item.name}</Text>
              <Text style={styles.sportTag}>{item.sport}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.rating}>{item.rating}</Text>
                <Text style={styles.experience}>• {item.experience}</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.specialization}>
            Specializes in: {item.specialization}
          </Text>
          <Text style={styles.responseTime}>
            ⏱️ {item.responseTime}
          </Text>
          
          <Button
            mode="contained"
            onPress={() => startNewConversation(item)}
            style={styles.connectButton}
            buttonColor={COLORS.primary}
          >
            Start Conversation 💬
          </Button>
        </View>
      </Card>
    </Animated.View>
  );

  const ChatModal = () => (
    <Portal>
      <Modal
        visible={showChatModal}
        onDismiss={() => setShowChatModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
        >
          <KeyboardAvoidingView
            style={styles.chatContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.chatHeader}>
              <Avatar.Image 
                size={40} 
                source={{ uri: selectedCoach?.coachAvatar }} 
              />
              <View style={styles.chatHeaderInfo}>
                <Text style={styles.chatHeaderName}>
                  {selectedCoach?.coachName}
                </Text>
                <Text style={styles.chatHeaderStatus}>
                  {selectedCoach?.isActive ? '🟢 Active now' : '⚫ Last seen recently'}
                </Text>
              </View>
              <IconButton
                icon="close"
                onPress={() => setShowChatModal(false)}
                iconColor={COLORS.text}
              />
            </View>
            
            <ScrollView style={styles.messagesContainer}>
              {selectedCoach?.messages?.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageItem,
                    msg.senderId === user?.id ? styles.sentMessage : styles.receivedMessage
                  ]}
                >
                  <Text style={styles.messageText}>{msg.message}</Text>
                  <Text style={styles.messageTimestamp}>{msg.timestamp}</Text>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type your message... ✨"
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                maxLength={500}
              />
              <IconButton
                icon="send"
                onPress={sendMessage}
                iconColor={COLORS.primary}
                size={28}
              />
            </View>
          </KeyboardAvoidingView>
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
      
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages 💬</Text>
          <Text style={styles.headerSubtitle}>
            Stay connected with your coaches
          </Text>
          {unreadCount > 0 && (
            <Badge style={styles.headerBadge}>
              {unreadCount} new
            </Badge>
          )}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search conversations or coaches..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'conversations' && styles.activeTab
            ]}
            onPress={() => setActiveTab('conversations')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'conversations' && styles.activeTabText
            ]}>
              My Coaches ({mockConversations.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'coaches' && styles.activeTab
            ]}
            onPress={() => setActiveTab('coaches')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'coaches' && styles.activeTabText
            ]}>
              Find Coaches ({mockAvailableCoaches.length})
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.listContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={activeTab === 'conversations' ? renderConversationItem : renderCoachItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon 
                  name="chat-bubble-outline" 
                  size={80} 
                  color={COLORS.textSecondary} 
                />
                <Text style={styles.emptyTitle}>
                  {activeTab === 'conversations' ? 
                    'No conversations yet' : 
                    'No coaches found'
                  }
                </Text>
                <Text style={styles.emptySubtitle}>
                  {activeTab === 'conversations' ? 
                    'Start chatting with your coaches!' : 
                    'Try adjusting your search terms'
                  }
                </Text>
              </View>
            }
          />
        </Animated.View>
      </View>

      <ChatModal />

      <FAB
        icon="help-circle"
        style={styles.fab}
        color={COLORS.surface}
        backgroundColor={COLORS.primary}
        onPress={() => Alert.alert(
          'Need Help? 🤔',
          'Contact support or check our FAQ section for assistance!',
          [{ text: 'Got it!', style: 'default' }]
        )}
      />
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.surface,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  headerBadge: {
    backgroundColor: COLORS.accent,
    marginTop: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchBar: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xs,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.surface,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  conversationCard: {
    marginBottom: SPACING.md,
  },
  conversationTouchable: {
    borderRadius: 12,
  },
  messageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.accent,
  },
  messageInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  coachName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  messageTime: {
    ...TEXT_STYLES.small,
  },
  sportTag: {
    ...TEXT_STYLES.small,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  lastMessage: {
    ...TEXT_STYLES.caption,
  },
  unreadMessage: {
    fontWeight: '600',
    color: COLORS.text,
  },
  coachCard: {
    marginBottom: SPACING.md,
  },
  coachContent: {
    padding: SPACING.md,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  coachInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  rating: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  experience: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
  },
  specialization: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.sm,
  },
  responseTime: {
    ...TEXT_STYLES.small,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  connectButton: {
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    margin: 0,
  },
  blurView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  chatHeaderName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  chatHeaderStatus: {
    ...TEXT_STYLES.small,
  },
  messagesContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  messageItem: {
    marginBottom: SPACING.md,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: SPACING.md,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background,
    borderRadius: 18,
    padding: SPACING.md,
  },
  messageText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  messageTimestamp: {
    ...TEXT_STYLES.small,
    marginTop: SPACING.xs,
    opacity: 0.7,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    ...TEXT_STYLES.body,
    maxHeight: 100,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
});

export default CoachMessages;
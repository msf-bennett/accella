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
  Dimensions,
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
  Chip,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

const { width } = Dimensions.get('window');

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
  notification: '#2196f3',
  achievement: '#9c27b0',
  coach: '#4caf50',
  parent: '#ff5722',
  system: '#607d8b',
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

const MessageCenter = ({ navigation }) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const notificationPulse = useRef(new Animated.Value(1)).current;

  // Redux state
  const { user, isLoading } = useSelector(state => state.auth);
  const { messages, notifications, unreadCounts } = useSelector(state => state.communication);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, coaches, parents, notifications, achievements
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  // Notification pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(notificationPulse, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(notificationPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (unreadCounts?.total > 0) {
      pulse.start();
    } else {
      pulse.stop();
      notificationPulse.setValue(1);
    }
    
    return () => pulse.stop();
  }, [unreadCounts?.total, notificationPulse]);

  // Mock message data
  const mockMessages = [
    {
      id: 'msg_1',
      type: 'coach',
      senderName: 'Coach Sarah Wilson',
      senderAvatar: 'https://i.pravatar.cc/150?img=1',
      subject: 'Great Progress This Week! 🏈',
      preview: "I'm really impressed with your improvement in passing accuracy. Keep up the fantastic work!",
      content: "Hey champion! I wanted to reach out and let you know how proud I am of your progress this week. Your passing accuracy has improved by 25% and your footwork is getting much better. Keep practicing those drills we worked on, and don't forget to stay hydrated during training! You're doing amazing! 🌟",
      timestamp: '2 hours ago',
      isRead: false,
      priority: 'normal',
      category: 'feedback',
      hasAttachment: false,
      sport: 'Football',
    },
    {
      id: 'msg_2',
      type: 'parent',
      senderName: 'Mom',
      senderAvatar: 'https://i.pravatar.cc/150?img=2',
      subject: 'Pickup Time Change',
      preview: 'Hi sweetie! I need to pick you up 30 minutes later today because of traffic.',
      content: "Hi my star athlete! I hope training is going well today. I wanted to let you know that I'll be about 30 minutes late picking you up because there's heavy traffic on the highway. Please wait inside the academy and let Coach Sarah know. Love you! 💕",
      timestamp: '4 hours ago',
      isRead: true,
      priority: 'high',
      category: 'logistics',
      hasAttachment: false,
    },
    {
      id: 'msg_3',
      type: 'notification',
      senderName: 'TrainSmart App',
      senderAvatar: null,
      subject: 'Achievement Unlocked! 🏆',
      preview: 'Congratulations! You\'ve completed 10 training sessions this month.',
      content: "🎉 Wow! You've just unlocked the 'Dedicated Athlete' achievement by completing 10 training sessions this month. You're showing incredible commitment to your sport! Keep up the amazing work and you'll unlock even more achievements. Your next goal: Complete 15 sessions to unlock 'Training Champion'! 💪",
      timestamp: '1 day ago',
      isRead: false,
      priority: 'normal',
      category: 'achievement',
      hasAttachment: false,
      achievementIcon: 'jump-rope',
    },
    {
      id: 'msg_4',
      type: 'coach',
      senderName: 'Coach Mike Thompson',
      senderAvatar: 'https://i.pravatar.cc/150?img=3',
      subject: 'Tomorrow\'s Training Session',
      preview: 'Don\'t forget we have an early morning session at 7 AM tomorrow!',
      content: "Hey there! Just a friendly reminder that we have our special conditioning session tomorrow morning at 7 AM sharp. Please bring your water bottle, towel, and wear your training gear. We'll be working on agility drills and strength training. It's going to be an awesome session! See you bright and early! 🌅",
      timestamp: '1 day ago',
      isRead: true,
      priority: 'high',
      category: 'schedule',
      hasAttachment: false,
      sport: 'Basketball',
    },
    {
      id: 'msg_5',
      type: 'system',
      senderName: 'TrainSmart System',
      senderAvatar: null,
      subject: 'Weekly Progress Report 📊',
      preview: 'Your weekly training summary is ready to view.',
      content: "Hi there, superstar! Your weekly progress report is ready! This week you completed 3 training sessions, improved your performance by 12%, and earned 250 points. You're currently ranked #3 in your age group for this month. Keep pushing yourself - you're doing incredible! 🚀",
      timestamp: '2 days ago',
      isRead: false,
      priority: 'normal',
      category: 'report',
      hasAttachment: true,
      attachmentType: 'pdf',
    },
    {
      id: 'msg_6',
      type: 'parent',
      senderName: 'Dad',
      senderAvatar: 'https://i.pravatar.cc/150?img=4',
      subject: 'So Proud of You! 🌟',
      preview: 'I heard from Coach Sarah about your amazing progress. Keep it up!',
      content: "Hey champ! Coach Sarah called me today and told me all about your fantastic improvement this week. She said you're working really hard and showing great dedication. I'm so incredibly proud of you! Remember, whether you win or lose, what matters most is that you're trying your best and having fun. Can't wait to see you play this weekend! Love, Dad ❤️",
      timestamp: '3 days ago',
      isRead: true,
      priority: 'normal',
      category: 'encouragement',
      hasAttachment: false,
    },
  ];

  const mockRecipients = [
    {
      id: 'coach_1',
      name: 'Coach Sarah Wilson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      type: 'coach',
      sport: 'Football',
      isAvailable: true,
    },
    {
      id: 'coach_2',
      name: 'Coach Mike Thompson',
      avatar: 'https://i.pravatar.cc/150?img=3',
      type: 'coach',
      sport: 'Basketball',
      isAvailable: true,
    },
    {
      id: 'parent_1',
      name: 'Mom',
      avatar: 'https://i.pravatar.cc/150?img=2',
      type: 'parent',
      isAvailable: true,
    },
    {
      id: 'parent_2',
      name: 'Dad',
      avatar: 'https://i.pravatar.cc/150?img=4',
      type: 'parent',
      isAvailable: true,
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

    filterMessages();
  }, [fadeAnim, slideAnim, activeTab, searchQuery]);

  const filterMessages = useCallback(() => {
    let filtered = mockMessages;

    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'coaches') {
        filtered = filtered.filter(msg => msg.type === 'coach');
      } else if (activeTab === 'parents') {
        filtered = filtered.filter(msg => msg.type === 'parent');
      } else if (activeTab === 'notifications') {
        filtered = filtered.filter(msg => msg.type === 'notification' || msg.type === 'system');
      } else if (activeTab === 'achievements') {
        filtered = filtered.filter(msg => msg.category === 'achievement');
      }
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(msg =>
        msg.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.sport && msg.sport.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp);
      const timeB = new Date(b.timestamp);
      return timeB - timeA;
    });

    setFilteredMessages(filtered);
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

  const openMessage = (message) => {
    Vibration.vibrate(50);
    setSelectedMessage(message);
    setShowMessageModal(true);
    
    // Mark as read if it wasn't already
    if (!message.isRead) {
      // Dispatch action to mark as read
      message.isRead = true;
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'coach': return COLORS.coach;
      case 'parent': return COLORS.parent;
      case 'notification': return COLORS.notification;
      case 'system': return COLORS.system;
      default: return COLORS.primary;
    }
  };

  const getMessageTypeIcon = (type, category) => {
    if (category === 'achievement') return 'jump-rope';
    
    switch (type) {
      case 'coach': return 'sports';
      case 'parent': return 'family-restroom';
      case 'notification': return 'notifications';
      case 'system': return 'settings';
      default: return 'message';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'normal': return 'remove';
      case 'low': return 'expand-more';
      default: return 'remove';
    }
  };

  const formatTimeAgo = (timestamp) => {
    // Simple time formatting - in real app would use a library like moment.js
    return timestamp;
  };

  const tabs = [
    { id: 'all', label: 'All Messages', count: mockMessages.length },
    { id: 'coaches', label: 'Coaches', count: mockMessages.filter(m => m.type === 'coach').length },
    { id: 'parents', label: 'Parents', count: mockMessages.filter(m => m.type === 'parent').length },
    { id: 'notifications', label: 'Updates', count: mockMessages.filter(m => m.type === 'notification' || m.type === 'system').length },
    { id: 'achievements', label: 'Achievements', count: mockMessages.filter(m => m.category === 'achievement').length },
  ];

  const renderMessageItem = ({ item }) => (
    <Animated.View
      style={[
        styles.messageCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <TouchableOpacity 
        onPress={() => openMessage(item)}
        style={styles.messageTouchable}
      >
        <Card 
          style={[
            styles.messageCardInner,
            !item.isRead && styles.unreadMessageCard
          ]} 
          elevation={item.isRead ? 2 : 4}
        >
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <View style={styles.senderInfo}>
                {item.senderAvatar ? (
                  <Avatar.Image 
                    size={45} 
                    source={{ uri: item.senderAvatar }} 
                  />
                ) : (
                  <Avatar.Icon
                    size={45}
                    icon={getMessageTypeIcon(item.type, item.category)}
                    style={{ 
                      backgroundColor: getMessageTypeColor(item.type),
                    }}
                  />
                )}
                
                <View style={styles.senderDetails}>
                  <View style={styles.senderNameRow}>
                    <Text style={[
                      styles.senderName,
                      !item.isRead && styles.unreadText
                    ]}>
                      {item.senderName}
                    </Text>
                    {item.sport && (
                      <Chip 
                        mode="outlined"
                        compact
                        style={styles.sportChip}
                        textStyle={styles.sportChipText}
                      >
                        {item.sport}
                      </Chip>
                    )}
                  </View>
                  
                  <View style={styles.messageMetaRow}>
                    <Text style={styles.timestamp}>
                      {formatTimeAgo(item.timestamp)}
                    </Text>
                    
                    {item.priority === 'high' && (
                      <Icon 
                        name={getPriorityIcon(item.priority)} 
                        size={16} 
                        color={COLORS.error} 
                      />
                    )}
                    
                    {item.hasAttachment && (
                      <Icon 
                        name="attachment" 
                        size={16} 
                        color={COLORS.primary} 
                        style={{ marginLeft: SPACING.xs }}
                      />
                    )}
                  </View>
                </View>
              </View>
              
              <View style={styles.messageActions}>
                {!item.isRead && (
                  <Badge 
                    size={12}
                    style={[
                      styles.unreadBadge,
                      { backgroundColor: getMessageTypeColor(item.type) }
                    ]}
                  />
                )}
                
                <IconButton
                  icon="chevron-right"
                  size={20}
                  iconColor={COLORS.textSecondary}
                />
              </View>
            </View>
            
            <View style={styles.messageBody}>
              <Text style={[
                styles.messageSubject,
                !item.isRead && styles.unreadText
              ]}>
                {item.subject}
              </Text>
              
              <Text 
                style={styles.messagePreview}
                numberOfLines={2}
              >
                {item.preview}
              </Text>
              
              <View style={styles.messageTags}>
                <Chip 
                  mode="flat"
                  compact
                  style={[
                    styles.categoryChip,
                    { backgroundColor: getMessageTypeColor(item.type) }
                  ]}
                  textStyle={{ color: COLORS.surface, fontSize: 10 }}
                >
                  {item.category}
                </Chip>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const MessageModal = () => (
    <Portal>
      <Modal
        visible={showMessageModal}
        onDismiss={() => setShowMessageModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
        >
          <Surface style={styles.messageModalContent} elevation={4}>
            <View style={styles.messageModalHeader}>
              <View style={styles.modalSenderInfo}>
                {selectedMessage?.senderAvatar ? (
                  <Avatar.Image 
                    size={50} 
                    source={{ uri: selectedMessage.senderAvatar }} 
                  />
                ) : (
                  <Avatar.Icon
                    size={50}
                    icon={getMessageTypeIcon(selectedMessage?.type, selectedMessage?.category)}
                    style={{ 
                      backgroundColor: getMessageTypeColor(selectedMessage?.type),
                    }}
                  />
                )}
                
                <View style={styles.modalSenderDetails}>
                  <Text style={styles.modalSenderName}>
                    {selectedMessage?.senderName}
                  </Text>
                  <Text style={styles.modalTimestamp}>
                    {selectedMessage?.timestamp}
                  </Text>
                  {selectedMessage?.sport && (
                    <Chip 
                      mode="outlined"
                      compact
                      style={styles.modalSportChip}
                      textStyle={styles.sportChipText}
                    >
                      {selectedMessage.sport}
                    </Chip>
                  )}
                </View>
              </View>
              
              <IconButton
                icon="close"
                onPress={() => setShowMessageModal(false)}
                style={styles.modalCloseButton}
              />
            </View>
            
            <Divider />
            
            <ScrollView style={styles.messageModalBody}>
              <Text style={styles.modalMessageSubject}>
                {selectedMessage?.subject}
              </Text>
              
              <Text style={styles.modalMessageContent}>
                {selectedMessage?.content}
              </Text>
              
              {selectedMessage?.hasAttachment && (
                <View style={styles.attachmentSection}>
                  <Surface style={styles.attachmentCard} elevation={2}>
                    <View style={styles.attachmentInfo}>
                      <Icon 
                        name="attachment" 
                        size={24} 
                        color={COLORS.primary} 
                      />
                      <View style={styles.attachmentDetails}>
                        <Text style={styles.attachmentName}>
                          Weekly_Progress_Report.pdf
                        </Text>
                        <Text style={styles.attachmentSize}>
                          2.3 MB
                        </Text>
                      </View>
                      <IconButton
                        icon="download"
                        iconColor={COLORS.primary}
                        onPress={() => Alert.alert('Download', 'File download started!')}
                      />
                    </View>
                  </Surface>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.messageModalActions}>
              {selectedMessage?.type !== 'system' && selectedMessage?.type !== 'notification' && (
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowMessageModal(false);
                    setTimeout(() => {
                      setSelectedRecipient({
                        id: selectedMessage?.type === 'coach' ? 'coach_1' : 'parent_1',
                        name: selectedMessage?.senderName,
                        avatar: selectedMessage?.senderAvatar,
                        type: selectedMessage?.type,
                      });
                      setShowComposeModal(true);
                    }, 200);
                  }}
                  style={styles.modalActionButton}
                  buttonColor={getMessageTypeColor(selectedMessage?.type)}
                  icon="reply"
                >
                  Reply
                </Button>
              )}
              
              <Button
                mode="outlined"
                onPress={() => {
                  Vibration.vibrate(50);
                  Alert.alert('Saved! 💾', 'Message saved to your favorites.');
                }}
                style={styles.modalActionButton}
                textColor={COLORS.primary}
                icon="bookmark"
              >
                Save
              </Button>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  const ComposeModal = () => (
    <Portal>
      <Modal
        visible={showComposeModal}
        onDismiss={() => setShowComposeModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
        >
          <KeyboardAvoidingView
            style={styles.composeContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Surface style={styles.composeModalContent} elevation={4}>
              <View style={styles.composeHeader}>
                <Text style={styles.composeTitle}>New Message 💬</Text>
                <IconButton
                  icon="close"
                  onPress={() => setShowComposeModal(false)}
                />
              </View>
              
              <Divider />
              
              {!selectedRecipient ? (
                <View style={styles.recipientSelector}>
                  <Text style={styles.recipientSelectorTitle}>
                    Who would you like to message?
                  </Text>
                  <FlatList
                    data={mockRecipients}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.recipientOption}
                        onPress={() => setSelectedRecipient(item)}
                      >
                        <Avatar.Image 
                          size={40} 
                          source={{ uri: item.avatar }} 
                        />
                        <View style={styles.recipientInfo}>
                          <Text style={styles.recipientName}>{item.name}</Text>
                          <Text style={styles.recipientType}>{item.type}</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    )}
                  />
                </View>
              ) : (
                <View style={styles.composeBody}>
                  <View style={styles.selectedRecipient}>
                    <Text style={styles.toLabel}>To:</Text>
                    <View style={styles.recipientChip}>
                      <Avatar.Image 
                        size={30} 
                        source={{ uri: selectedRecipient.avatar }} 
                      />
                      <Text style={styles.recipientChipText}>
                        {selectedRecipient.name}
                      </Text>
                      <IconButton
                        icon="close"
                        size={16}
                        onPress={() => setSelectedRecipient(null)}
                      />
                    </View>
                  </View>
                  
                  <TextInput
                    style={styles.messageInput}
                    placeholder="Type your message here... ✨"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                    maxLength={1000}
                    textAlignVertical="top"
                  />
                  
                  <View style={styles.composeActions}>
                    <Text style={styles.characterCount}>
                      {newMessage.length}/1000 characters
                    </Text>
                    
                    <Button
                      mode="contained"
                      onPress={() => {
                        if (newMessage.trim()) {
                          Vibration.vibrate(50);
                          Alert.alert('Success! 🎉', 'Your message has been sent!');
                          setNewMessage('');
                          setSelectedRecipient(null);
                          setShowComposeModal(false);
                        } else {
                          Alert.alert('Oops! 😅', 'Please write a message first.');
                        }
                      }}
                      disabled={!newMessage.trim()}
                      buttonColor={COLORS.primary}
                      icon="send"
                    >
                      Send Message
                    </Button>
                  </View>
                </View>
              )}
            </Surface>
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
          <Animated.View
            style={[
              styles.headerTitleContainer,
              { transform: [{ scale: notificationPulse }] }
            ]}
          >
            <Text style={styles.headerTitle}>Message Center 📬</Text>
            {(unreadCounts?.total || 0) > 0 && (
              <Badge 
                style={styles.headerBadge}
                size={24}
              >
                {unreadCounts.total}
              </Badge>
            )}
          </Animated.View>
          <Text style={styles.headerSubtitle}>
            Stay connected with your team
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search messages..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabScrollContainer}
          contentContainerStyle={styles.tabContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <Badge 
                  size={18}
                  style={[
                    styles.tabBadge,
                    { backgroundColor: activeTab === tab.id ? COLORS.surface : COLORS.primary }
                  ]}
                >
                  {tab.count}
                </Badge>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Animated.View
          style={[
            styles.listContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <FlatList
            data={filteredMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
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
                  name="inbox" 
                  size={80} 
                  color={COLORS.textSecondary} 
                />
                <Text style={styles.emptyTitle}>No messages found</Text>
                <Text style={styles.emptySubtitle}>
                  {activeTab === 'all' 
                    ? 'Your message center is empty' 
                    : `No ${activeTab} messages yet`
                  }
                </Text>
              </View>
            }
          />
        </Animated.View>
      </View>

      <MessageModal />
      <ComposeModal />

      <FAB
        icon="edit"
        style={styles.fab}
        color={COLORS.surface}
        backgroundColor={COLORS.primary}
        onPress={() => setShowComposeModal(true)}
        label="Compose"
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  headerBadge: {
    backgroundColor: COLORS.accent,
    marginLeft: SPACING.sm,
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.surface,
    opacity: 0.9,
    marginTop: SPACING.xs,
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
  tabScrollContainer: {
    marginBottom: SPACING.md,
  },
  tabContainer: {
    paddingRight: SPACING.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    marginRight: SPACING.sm,
    elevation: 2,
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
  tabBadge: {
    marginLeft: SPACING.xs,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  messageCard: {
    marginBottom: SPACING.md,
  },
  messageTouchable: {
    borderRadius: 12,
  },
  messageCardInner: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  unreadMessageCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  messageContent: {
    padding: SPACING.md,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  senderInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  senderDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  senderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  senderName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    flex: 1,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  sportChip: {
    height: 24,
    marginLeft: SPACING.xs,
  },
  sportChipText: {
    fontSize: 10,
  },
  messageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    ...TEXT_STYLES.small,
    marginRight: SPACING.sm,
  },
  messageActions: {
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: 10,
  },
  messageBody: {
    paddingLeft: 57, // Avatar width + margin
  },
  messageSubject: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  messagePreview: {
    ...TEXT_STYLES.caption,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  messageTags: {
    flexDirection: 'row',
  },
  categoryChip: {
    height: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  messageModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    maxWidth: width - 32,
    width: '100%',
    maxHeight: '90%',
  },
  messageModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    position: 'relative',
  },
  modalSenderInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  modalSenderDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  modalSenderName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  modalTimestamp: {
    ...TEXT_STYLES.small,
    marginBottom: SPACING.xs,
  },
  modalSportChip: {
    height: 24,
    alignSelf: 'flex-start',
  },
  modalCloseButton: {
    margin: 0,
  },
  messageModalBody: {
    flex: 1,
    padding: SPACING.md,
  },
  modalMessageSubject: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  modalMessageContent: {
    ...TEXT_STYLES.body,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  attachmentSection: {
    marginTop: SPACING.lg,
  },
  attachmentCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  attachmentName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  attachmentSize: {
    ...TEXT_STYLES.small,
  },
  messageModalActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  modalActionButton: {
    flex: 1,
  },
  composeContainer: {
    flex: 1,
  },
  composeModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    maxWidth: width - 32,
    width: '100%',
    maxHeight: '90%',
    flex: 1,
  },
  composeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  composeTitle: {
    ...TEXT_STYLES.h3,
  },
  recipientSelector: {
    flex: 1,
    padding: SPACING.md,
  },
  recipientSelectorTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  recipientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  recipientInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  recipientName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  recipientType: {
    ...TEXT_STYLES.small,
    textTransform: 'capitalize',
  },
  composeBody: {
    flex: 1,
    padding: SPACING.md,
  },
  selectedRecipient: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  toLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginRight: SPACING.md,
  },
  recipientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingLeft: SPACING.sm,
    paddingRight: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  recipientChipText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    ...TEXT_STYLES.body,
    minHeight: 120,
    marginBottom: SPACING.md,
  },
  composeActions: {
    alignItems: 'flex-end',
  },
  characterCount: {
    ...TEXT_STYLES.small,
    marginBottom: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
});

export default MessageCenter;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  TouchableOpacity,
  FlatList,
  TextInput as RNTextInput,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Surface,
  IconButton,
  FAB,
  Portal,
  Modal,
  TextInput,
  Searchbar,
  Avatar,
  Badge,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const CoachCommunication = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, messages, notifications } = useSelector(state => state.coach);
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Mock data - replace with Redux/API data
  const mockChats = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Player',
      avatar: 'SJ',
      lastMessage: 'Thanks for the training plan! 💪',
      timestamp: '2 min ago',
      unread: 3,
      online: true,
      sport: 'Football',
    },
    {
      id: 2,
      name: 'Mike Wilson',
      role: 'Parent',
      avatar: 'MW',
      lastMessage: 'Can we reschedule Tuesday session?',
      timestamp: '15 min ago',
      unread: 1,
      online: false,
      sport: 'Basketball',
    },
    {
      id: 3,
      name: 'Team Alpha',
      role: 'Group',
      avatar: 'TA',
      lastMessage: 'Great practice today team! 🏆',
      timestamp: '1 hour ago',
      unread: 0,
      online: null,
      sport: 'Football',
      memberCount: 12,
    },
    {
      id: 4,
      name: 'Emma Davis',
      role: 'Player',
      avatar: 'ED',
      lastMessage: 'Ready for tomorrow\'s session!',
      timestamp: '3 hours ago',
      unread: 0,
      online: true,
      sport: 'Tennis',
    },
  ];

  const mockNotifications = [
    {
      id: 1,
      type: 'message',
      title: 'New Message from Sarah',
      description: 'Thanks for the training plan!',
      timestamp: '2 min ago',
      read: false,
    },
    {
      id: 2,
      type: 'session',
      title: 'Session Feedback',
      description: 'Mike rated your session 5 stars',
      timestamp: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      type: 'booking',
      title: 'New Booking Request',
      description: 'Lisa wants to book a session',
      timestamp: '2 hours ago',
      read: true,
    },
  ];

  const tabs = [
    { key: 'messages', label: 'Messages', icon: 'chat', badge: 4 },
    { key: 'notifications', label: 'Notifications', icon: 'notifications', badge: 2 },
    { key: 'broadcast', label: 'Broadcast', icon: 'campaign', badge: 0 },
  ];

  useEffect(() => {
    navigation.setOptions({
      title: 'Communication Hub',
      headerShown: true,
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        ...TEXT_STYLES.h2,
        color: '#fff',
      },
      headerRight: () => (
        <IconButton
          icon="video-call"
          iconColor="#fff"
          onPress={() => Alert.alert('Feature Coming Soon', 'Video calling will be available soon!')}
        />
      ),
    });

    // Animation on mount
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    loadCommunicationData();
  }, []);

  const loadCommunicationData = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Dispatch actual data to Redux
      // dispatch(loadMessages());
      // dispatch(loadNotifications());
    } catch (error) {
      Alert.alert('Error', 'Failed to load communication data');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCommunicationData();
    setRefreshing(false);
  }, [loadCommunicationData]);

  const handleTabPress = useCallback((tab) => {
    Vibration.vibrate(50);
    setActiveTab(tab.key);
  }, []);

  const handleChatPress = useCallback((chat) => {
    Vibration.vibrate(50);
    setSelectedChat(chat);
    setModalVisible(true);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) {
      Alert.alert('Validation Error', 'Please enter a message');
      return;
    }

    // TODO: Send message via API and update Redux
    Alert.alert('Success! 📩', 'Message sent successfully');
    setNewMessage('');
    setModalVisible(false);
    Vibration.vibrate(100);
  }, [newMessage]);

  const handleBroadcastMessage = useCallback(() => {
    if (!broadcastMessage.trim()) {
      Alert.alert('Validation Error', 'Please enter a broadcast message');
      return;
    }

    if (selectedRecipients.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one recipient');
      return;
    }

    // TODO: Send broadcast via API
    Alert.alert('Success! 📢', `Broadcast sent to ${selectedRecipients.length} recipients`);
    setBroadcastMessage('');
    setSelectedRecipients([]);
    setBroadcastModal(false);
    Vibration.vibrate(100);
  }, [broadcastMessage, selectedRecipients]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return 'chat';
      case 'session': return 'fitness-center';
      case 'booking': return 'event';
      default: return 'notifications';
    }
  };

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTabBar = () => (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, 0],
        })}],
        opacity: fadeAnim,
      }}
    >
      <Surface style={{
        flexDirection: 'row',
        marginHorizontal: SPACING.md,
        marginVertical: SPACING.sm,
        borderRadius: 12,
        elevation: 4,
      }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabPress(tab)}
            style={{
              flex: 1,
              paddingVertical: SPACING.md,
              alignItems: 'center',
              backgroundColor: activeTab === tab.key ? COLORS.primary : 'transparent',
              borderRadius: 12,
            }}
            activeOpacity={0.8}
          >
            <View style={{ position: 'relative' }}>
              <Icon
                name={tab.icon}
                size={24}
                color={activeTab === tab.key ? '#fff' : COLORS.primary}
              />
              {tab.badge > 0 && (
                <Badge
                  size={16}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: COLORS.error,
                  }}
                >
                  {tab.badge}
                </Badge>
              )}
            </View>
            <Text style={{
              ...TEXT_STYLES.caption,
              color: activeTab === tab.key ? '#fff' : COLORS.primary,
              marginTop: SPACING.xs,
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Surface>
    </Animated.View>
  );

  const renderChatItem = ({ item: chat }) => (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: fadeAnim,
      }}
    >
      <TouchableOpacity
        onPress={() => handleChatPress(chat)}
        activeOpacity={0.8}
      >
        <Card style={{
          margin: SPACING.xs,
          marginHorizontal: SPACING.md,
          elevation: 2,
        }}>
          <View style={{
            flexDirection: 'row',
            padding: SPACING.md,
            alignItems: 'center',
          }}>
            <View style={{ position: 'relative' }}>
              <Avatar.Text
                size={50}
                label={chat.avatar}
                style={{
                  backgroundColor: COLORS.primary,
                }}
              />
              {chat.online === true && (
                <View style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: COLORS.success,
                  borderWidth: 2,
                  borderColor: '#fff',
                }} />
              )}
            </View>

            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Text style={{
                  ...TEXT_STYLES.h4,
                  color: COLORS.text,
                  flex: 1,
                }}>
                  {chat.name}
                </Text>
                <Text style={{
                  ...TEXT_STYLES.caption,
                  color: COLORS.text,
                  opacity: 0.6,
                }}>
                  {chat.timestamp}
                </Text>
              </View>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: SPACING.xs,
              }}>
                <Chip
                  mode="outlined"
                  style={{
                    height: 24,
                    marginRight: SPACING.xs,
                  }}
                  textStyle={{ fontSize: 10 }}
                >
                  {chat.role}
                </Chip>
                <Chip
                  mode="outlined"
                  style={{ height: 24 }}
                  textStyle={{ fontSize: 10 }}
                >
                  {chat.sport}
                </Chip>
                {chat.memberCount && (
                  <Text style={{
                    ...TEXT_STYLES.caption,
                    color: COLORS.text,
                    opacity: 0.6,
                    marginLeft: SPACING.xs,
                  }}>
                    ({chat.memberCount} members)
                  </Text>
                )}
              </View>

              <Text style={{
                ...TEXT_STYLES.body,
                color: COLORS.text,
                opacity: 0.8,
                marginTop: SPACING.xs,
              }} numberOfLines={1}>
                {chat.lastMessage}
              </Text>
            </View>

            {chat.unread > 0 && (
              <Badge
                size={20}
                style={{
                  backgroundColor: COLORS.primary,
                  marginLeft: SPACING.sm,
                }}
              >
                {chat.unread}
              </Badge>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderNotificationItem = ({ item: notification }) => (
    <Animated.View
      style={{
        transform: [{ translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        })}],
        opacity: fadeAnim,
      }}
    >
      <Card style={{
        margin: SPACING.xs,
        marginHorizontal: SPACING.md,
        elevation: notification.read ? 1 : 3,
        backgroundColor: notification.read ? '#fff' : '#f8f9ff',
      }}>
        <View style={{
          flexDirection: 'row',
          padding: SPACING.md,
          alignItems: 'center',
        }}>
          <Surface style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: notification.read ? '#f5f5f5' : COLORS.primary,
          }}>
            <Icon
              name={getNotificationIcon(notification.type)}
              size={20}
              color={notification.read ? COLORS.text : '#fff'}
            />
          </Surface>

          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                ...TEXT_STYLES.h4,
                color: COLORS.text,
                fontWeight: notification.read ? 'normal' : 'bold',
              }}>
                {notification.title}
              </Text>
              <Text style={{
                ...TEXT_STYLES.caption,
                color: COLORS.text,
                opacity: 0.6,
              }}>
                {notification.timestamp}
              </Text>
            </View>
            <Text style={{
              ...TEXT_STYLES.body,
              color: COLORS.text,
              opacity: 0.8,
              marginTop: SPACING.xs,
            }}>
              {notification.description}
            </Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const renderMessagesTab = () => (
    <View style={{ flex: 1 }}>
      <Searchbar
        placeholder="Search conversations..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{
          margin: SPACING.md,
          elevation: 2,
        }}
      />

      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: SPACING.xl,
          }}>
            <Icon name="chat-bubble-outline" size={64} color={COLORS.primary} />
            <Text style={{
              ...TEXT_STYLES.h4,
              color: COLORS.text,
              textAlign: 'center',
              marginTop: SPACING.md,
            }}>
              No conversations yet
            </Text>
            <Text style={{
              ...TEXT_STYLES.body,
              color: COLORS.text,
              opacity: 0.7,
              textAlign: 'center',
              marginTop: SPACING.xs,
            }}>
              Start connecting with your players!
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderNotificationsTab = () => (
    <FlatList
      data={mockNotifications}
      renderItem={renderNotificationItem}
      keyExtractor={item => item.id.toString()}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
      ListHeaderComponent={
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: SPACING.md,
        }}>
          <Text style={{
            ...TEXT_STYLES.h3,
            color: COLORS.primary,
          }}>
            🔔 Recent Activity
          </Text>
          <Button
            mode="text"
            onPress={() => Alert.alert('Feature Coming Soon', 'Mark all as read will be available soon!')}
          >
            Mark all read
          </Button>
        </View>
      }
    />
  );

  const renderBroadcastTab = () => (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: SPACING.md }}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            padding: SPACING.lg,
            borderRadius: 16,
            marginBottom: SPACING.lg,
          }}
        >
          <Text style={{
            ...TEXT_STYLES.h3,
            color: '#fff',
            textAlign: 'center',
            marginBottom: SPACING.sm,
          }}>
            📢 Broadcast Center
          </Text>
          <Text style={{
            ...TEXT_STYLES.body,
            color: '#fff',
            opacity: 0.9,
            textAlign: 'center',
          }}>
            Send messages to multiple recipients at once
          </Text>
        </LinearGradient>

        <Card style={{ padding: SPACING.lg, marginBottom: SPACING.md }}>
          <Text style={{
            ...TEXT_STYLES.h4,
            color: COLORS.primary,
            marginBottom: SPACING.md,
          }}>
            Quick Broadcast Templates
          </Text>

          <Button
            mode="outlined"
            onPress={() => setBroadcastModal(true)}
            style={{ marginBottom: SPACING.sm }}
            contentStyle={{ paddingVertical: SPACING.sm }}
          >
            🏋️ Training Reminder
          </Button>

          <Button
            mode="outlined"
            onPress={() => setBroadcastModal(true)}
            style={{ marginBottom: SPACING.sm }}
            contentStyle={{ paddingVertical: SPACING.sm }}
          >
            🏆 Match Announcement
          </Button>

          <Button
            mode="outlined"
            onPress={() => setBroadcastModal(true)}
            style={{ marginBottom: SPACING.sm }}
            contentStyle={{ paddingVertical: SPACING.sm }}
          >
            📅 Schedule Update
          </Button>

          <Button
            mode="contained"
            onPress={() => setBroadcastModal(true)}
            style={{ backgroundColor: COLORS.primary }}
            contentStyle={{ paddingVertical: SPACING.sm }}
          >
            ✨ Custom Broadcast
          </Button>
        </Card>

        {/* Broadcast History */}
        <Card style={{ padding: SPACING.lg }}>
          <Text style={{
            ...TEXT_STYLES.h4,
            color: COLORS.primary,
            marginBottom: SPACING.md,
          }}>
            📊 Recent Broadcasts
          </Text>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: SPACING.sm,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TEXT_STYLES.body, color: COLORS.text }}>
                Training session reminder
              </Text>
              <Text style={{ ...TEXT_STYLES.caption, color: COLORS.text, opacity: 0.6 }}>
                Sent to 15 players • 2 hours ago
              </Text>
            </View>
            <Chip mode="outlined" style={{ height: 24 }}>
              Delivered
            </Chip>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: SPACING.sm,
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TEXT_STYLES.body, color: COLORS.text }}>
                Match schedule update
              </Text>
              <Text style={{ ...TEXT_STYLES.caption, color: COLORS.text, opacity: 0.6 }}>
                Sent to 8 parents • Yesterday
              </Text>
            </View>
            <Chip mode="outlined" style={{ height: 24 }}>
              Read
            </Chip>
          </View>
        </Card>
      </View>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Stats Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          padding: SPACING.lg,
          paddingTop: SPACING.xl,
        }}
      >
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-30, 0],
            })}],
            opacity: fadeAnim,
          }}
        >
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...TEXT_STYLES.h2, color: '#fff' }}>24</Text>
              <Text style={{ ...TEXT_STYLES.caption, color: '#fff', opacity: 0.8 }}>
                Active Chats
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...TEXT_STYLES.h2, color: '#fff' }}>6</Text>
              <Text style={{ ...TEXT_STYLES.caption, color: '#fff', opacity: 0.8 }}>
                Unread
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ ...TEXT_STYLES.h2, color: '#fff' }}>98%</Text>
              <Text style={{ ...TEXT_STYLES.caption, color: '#fff', opacity: 0.8 }}>
                Response Rate
              </Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'messages' && renderMessagesTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === 'broadcast' && renderBroadcastTab()}
      </View>

      {/* Chat Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.md,
            borderRadius: 16,
            maxHeight: '80%',
          }}
        >
          {selectedChat && (
            <View style={{ padding: SPACING.lg }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: SPACING.lg,
              }}>
                <Avatar.Text
                  size={40}
                  label={selectedChat.avatar}
                  style={{ backgroundColor: COLORS.primary }}
                />
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <Text style={{ ...TEXT_STYLES.h4, color: COLORS.text }}>
                    {selectedChat.name}
                  </Text>
                  <Text style={{ ...TEXT_STYLES.caption, color: COLORS.text, opacity: 0.7 }}>
                    {selectedChat.role} • {selectedChat.sport}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  onPress={() => setModalVisible(false)}
                />
              </View>

              <TextInput
                label="Type your message..."
                value={newMessage}
                onChangeText={setNewMessage}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={{ marginBottom: SPACING.lg }}
              />

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={{ width: '30%' }}
                >
                  Cancel
                </Button>
                
                <Button
                  mode="contained"
                  onPress={handleSendMessage}
                  style={{ width: '65%', backgroundColor: COLORS.primary }}
                >
                  Send Message
                </Button>
              </View>
            </View>
          )}
        </Modal>

        {/* Broadcast Modal */}
        <Modal
          visible={broadcastModal}
          onDismiss={() => setBroadcastModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.md,
            borderRadius: 16,
            maxHeight: '80%',
          }}
        >
          <ScrollView style={{ padding: SPACING.lg }}>
            <Text style={{
              ...TEXT_STYLES.h3,
              color: COLORS.primary,
              textAlign: 'center',
              marginBottom: SPACING.lg,
            }}>
              📢 Create Broadcast
            </Text>

            <TextInput
              label="Broadcast Message"
              value={broadcastMessage}
              onChangeText={setBroadcastMessage}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={{ marginBottom: SPACING.lg }}
            />

            <Text style={{
              ...TEXT_STYLES.h4,
              color: COLORS.primary,
              marginBottom: SPACING.md,
            }}>
              Select Recipients ({selectedRecipients.length} selected)
            </Text>

            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: SPACING.lg,
            }}>
              <Chip
                mode={selectedRecipients.includes('players') ? 'flat' : 'outlined'}
                onPress={() => setSelectedRecipients(prev => 
                  prev.includes('players') 
                    ? prev.filter(r => r !== 'players')
                    : [...prev, 'players']
                )}
                style={{ margin: SPACING.xs }}
              >
                All Players (12)
              </Chip>
              
              <Chip
                mode={selectedRecipients.includes('parents') ? 'flat' : 'outlined'}
                onPress={() => setSelectedRecipients(prev => 
                  prev.includes('parents') 
                    ? prev.filter(r => r !== 'parents')
                    : [...prev, 'parents']
                )}
                style={{ margin: SPACING.xs }}
              >
                All Parents (8)
              </Chip>
              
              <Chip
                mode={selectedRecipients.includes('teams') ? 'flat' : 'outlined'}
                onPress={() => setSelectedRecipients(prev => 
                  prev.includes('teams') 
                    ? prev.filter(r => r !== 'teams')
                    : [...prev, 'teams']
                )}
                style={{ margin: SPACING.xs }}
              >
                All Teams (3)
              </Chip>
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <Button
                mode="outlined"
                onPress={() => setBroadcastModal(false)}
                style={{ width: '30%' }}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={handleBroadcastMessage}
                style={{ width: '65%', backgroundColor: COLORS.primary }}
              >
                Send Broadcast
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="add-comment"
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => Alert.alert('Feature Coming Soon', 'Quick message compose will be available soon!')}
      />
    </View>
  );
};

export default CoachCommunication;
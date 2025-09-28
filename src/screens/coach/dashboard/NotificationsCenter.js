import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
  Platform,
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
  Badge,
  Portal,
  Modal,
  Divider,
  Switch,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../../styles/colors';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';
// BlurView is optional - can be replaced with Modal overlay if not available

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const NotificationCenter = ({ navigation }) => {
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({});
  const [animatedValue] = useState(new Animated.Value(0));

  // Redux
  const dispatch = useDispatch();
  const { user, unreadCount } = useSelector(state => ({
    user: state.auth.user,
    unreadCount: state.notifications?.unreadCount || 0,
  }));

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All', icon: 'notifications', count: notifications.length },
    { key: 'unread', label: 'Unread', icon: 'mark-email-unread', count: notifications.filter(n => !n.read).length },
    { key: 'sessions', label: 'Sessions', icon: 'event', count: notifications.filter(n => n.type === 'session').length },
    { key: 'messages', label: 'Messages', icon: 'chat', count: notifications.filter(n => n.type === 'message').length },
    { key: 'payments', label: 'Payments', icon: 'payment', count: notifications.filter(n => n.type === 'payment').length },
    { key: 'system', label: 'System', icon: 'settings', count: notifications.filter(n => n.type === 'system').length },
  ];

  // Animation Setup
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Data Fetching
  useEffect(() => {
    fetchNotifications();
    fetchNotificationSettings();
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      // Simulate API call - replace with actual API integration
      const mockNotifications = [
        {
          id: '1',
          type: 'session',
          title: 'Session Reminder',
          message: 'Morning Training starts in 30 minutes',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          read: false,
          priority: 'high',
          actionable: true,
          data: { sessionId: 's1' },
          sender: { name: 'System', avatar: null },
        },
        {
          id: '2',
          type: 'message',
          title: 'New Message from Alex Johnson',
          message: 'Coach, I won\'t be able to make it to today\'s practice due to a doctor\'s appointment.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false,
          priority: 'medium',
          actionable: true,
          data: { playerId: 'p1', chatId: 'c1' },
          sender: { name: 'Alex Johnson', avatar: 'https://via.placeholder.com/40' },
        },
        {
          id: '3',
          type: 'payment',
          title: 'Payment Received',
          message: '$150 payment received from Sarah Smith for monthly training package',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          read: true,
          priority: 'medium',
          actionable: false,
          data: { amount: 150, playerId: 'p2' },
          sender: { name: 'Payment System', avatar: null },
        },
        {
          id: '4',
          type: 'system',
          title: 'App Update Available',
          message: 'Version 2.1.0 is now available with new performance tracking features',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          read: true,
          priority: 'low',
          actionable: true,
          data: { version: '2.1.0' },
          sender: { name: 'App Store', avatar: null },
        },
        {
          id: '5',
          type: 'sessions',
          title: 'Training Plan Completed',
          message: 'Mike Wilson has completed the 4-week strength training program',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          read: false,
          priority: 'medium',
          actionable: true,
          data: { playerId: 'p3', planId: 'plan1' },
          sender: { name: 'Training System', avatar: null },
        },
        {
          id: '6',
          type: 'message',
          title: 'Parent Inquiry',
          message: 'Lisa Davis\'s mother asked about the upcoming tournament schedule',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          read: true,
          priority: 'medium',
          actionable: true,
          data: { playerId: 'p4', parentId: 'parent1' },
          sender: { name: 'Mary Davis', avatar: 'https://via.placeholder.com/40' },
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    }
  }, []);

  const fetchNotificationSettings = useCallback(async () => {
    try {
      // Simulate fetching notification preferences
      const mockSettings = {
        sessions: { enabled: true, push: true, email: false },
        messages: { enabled: true, push: true, email: true },
        payments: { enabled: true, push: true, email: true },
        system: { enabled: true, push: false, email: false },
        quiet_hours: { enabled: true, start: '22:00', end: '07:00' },
      };
      setNotificationSettings(mockSettings);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  }, []);

  // Event Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const handleNotificationPress = useCallback((notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.actionable) {
      switch (notification.type) {
        case 'session':
          navigation.navigate('SessionDetails', { sessionId: notification.data.sessionId });
          break;
        case 'message':
          navigation.navigate('Chat', { playerId: notification.data.playerId });
          break;
        case 'payment':
          navigation.navigate('PaymentDetails', { playerId: notification.data.playerId });
          break;
        case 'system':
          if (notification.data.version) {
            Alert.alert('Update App', 'Would you like to update to the latest version?', [
              { text: 'Later', style: 'cancel' },
              { text: 'Update', onPress: () => console.log('Update app') },
            ]);
          }
          break;
        default:
          break;
      }
    }
  }, [navigation]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    Vibration.vibrate(25);
  }, []);

  const markAllAsRead = useCallback(() => {
    Alert.alert(
      'Mark All as Read',
      'This will mark all notifications as read. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: () => {
            setNotifications(prev => 
              prev.map(notification => ({ ...notification, read: true }))
            );
            Vibration.vibrate(50);
          },
        },
      ]
    );
  }, []);

  const deleteNotification = useCallback((notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => 
              prev.filter(notification => notification.id !== notificationId)
            );
            Vibration.vibrate(100);
          },
        },
      ]
    );
  }, []);

  const handleBulkAction = useCallback((action) => {
    if (selectedNotifications.size === 0) {
      Alert.alert('No Notifications Selected', 'Please select notifications first');
      return;
    }

    const actionText = action === 'read' ? 'mark as read' : 'delete';
    Alert.alert(
      'Confirm Bulk Action',
      `${actionText} ${selectedNotifications.size} notifications?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            if (action === 'read') {
              setNotifications(prev =>
                prev.map(notification =>
                  selectedNotifications.has(notification.id)
                    ? { ...notification, read: true }
                    : notification
                )
              );
            } else if (action === 'delete') {
              setNotifications(prev =>
                prev.filter(notification => !selectedNotifications.has(notification.id))
              );
            }
            setSelectedNotifications(new Set());
            setBulkActionMode(false);
            Vibration.vibrate(100);
          },
        },
      ]
    );
  }, [selectedNotifications]);

  const toggleNotificationSelection = useCallback((notificationId) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(notificationId)) {
      newSelection.delete(notificationId);
    } else {
      newSelection.add(notificationId);
    }
    setSelectedNotifications(newSelection);
    Vibration.vibrate(25);
  }, [selectedNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'session': return 'event';
      case 'message': return 'chat';
      case 'payment': return 'payment';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'session': return COLORS.primary;
      case 'message': return COLORS.info;
      case 'payment': return COLORS.success;
      case 'system': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  // Filtered notifications based on search and filter
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply type filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'unread') {
        filtered = filtered.filter(n => !n.read);
      } else {
        filtered = filtered.filter(n => n.type === selectedFilter);
      }
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [notifications, selectedFilter, searchQuery]);

  // Render Components
  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={{
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.md,
      }}
    >
      <Animated.View
        style={{
          opacity: animatedValue,
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, marginLeft: SPACING.sm }]}>
            🔔 Notifications
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon={bulkActionMode ? 'close' : 'checklist'}
              iconColor="white"
              size={24}
              onPress={() => setBulkActionMode(!bulkActionMode)}
            />
            <IconButton
              icon="settings"
              iconColor="white"
              size={24}
              onPress={() => setSettingsModalVisible(true)}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
          <TouchableOpacity
            onPress={markAllAsRead}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              borderRadius: 20,
            }}
          >
            <MaterialIcons name="done-all" size={16} color="white" />
            <Text style={[TEXT_STYLES.caption, { color: 'white', marginLeft: SPACING.xs }]}>
              Mark All Read
            </Text>
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              {notifications.filter(n => !n.read).length} unread
            </Text>
            {notifications.filter(n => !n.read).length > 0 && (
              <Badge
                size={20}
                style={{ backgroundColor: COLORS.error, marginLeft: SPACING.xs }}
              />
            )}
          </View>
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search notifications..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            elevation: 0,
          }}
          iconColor={COLORS.primary}
        />
      </Animated.View>
    </LinearGradient>
  );

  const renderFilters = () => (
    <View style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filterOptions.map(filter => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setSelectedFilter(filter.key)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
              marginRight: SPACING.sm,
              borderRadius: 20,
              backgroundColor: selectedFilter === filter.key ? COLORS.primary : COLORS.surface,
              borderWidth: 1,
              borderColor: selectedFilter === filter.key ? COLORS.primary : COLORS.border,
              elevation: selectedFilter === filter.key ? 2 : 0,
            }}
          >
            <MaterialIcons
              name={filter.icon}
              size={16}
              color={selectedFilter === filter.key ? 'white' : COLORS.textSecondary}
            />
            <Text style={{
              marginLeft: SPACING.xs,
              color: selectedFilter === filter.key ? 'white' : COLORS.text,
              fontWeight: selectedFilter === filter.key ? 'bold' : 'normal',
            }}>
              {filter.label}
            </Text>
            {filter.count > 0 && (
              <Badge
                size={18}
                style={{
                  backgroundColor: selectedFilter === filter.key ? 'rgba(255,255,255,0.3)' : COLORS.primary,
                  marginLeft: SPACING.xs,
                }}
              >
                {filter.count}
              </Badge>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderNotificationItem = ({ item: notification }) => (
    <Surface
      style={{
        marginHorizontal: SPACING.md,
        marginVertical: SPACING.xs,
        borderRadius: 12,
        elevation: notification.read ? 1 : 2,
        backgroundColor: notification.read ? COLORS.surface : COLORS.unread,
        borderLeftWidth: 4,
        borderLeftColor: getNotificationColor(notification.type),
      }}
    >
      <TouchableOpacity
        onPress={() => bulkActionMode ? toggleNotificationSelection(notification.id) : handleNotificationPress(notification)}
        onLongPress={() => {
          setBulkActionMode(true);
          toggleNotificationSelection(notification.id);
        }}
        style={{ padding: SPACING.md }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {bulkActionMode && (
            <MaterialIcons
              name={selectedNotifications.has(notification.id) ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={selectedNotifications.has(notification.id) ? COLORS.primary : COLORS.textSecondary}
              style={{ marginRight: SPACING.sm, marginTop: SPACING.xs }}
            />
          )}
          
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: getNotificationColor(notification.type),
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: SPACING.md,
          }}>
            {notification.sender.avatar ? (
              <Avatar.Image size={40} source={{ uri: notification.sender.avatar }} />
            ) : (
              <MaterialIcons
                name={getNotificationIcon(notification.type)}
                size={20}
                color="white"
              />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
              <Text style={[TEXT_STYLES.body, { flex: 1, fontWeight: notification.read ? 'normal' : 'bold' }]}>
                {notification.title}
              </Text>
              {notification.priority === 'high' && (
                <MaterialIcons name="priority-high" size={16} color={getPriorityColor(notification.priority)} />
              )}
              {!notification.read && (
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: COLORS.primary,
                  marginLeft: SPACING.xs,
                }} />
              )}
            </View>
            
            <Text style={[
              TEXT_STYLES.caption,
              { marginBottom: SPACING.sm, opacity: notification.read ? 0.7 : 1 }
            ]}>
              {notification.message}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="access-time" size={12} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.small, { marginLeft: SPACING.xs }]}>
                  {formatTimestamp(notification.timestamp)}
                </Text>
                <Chip
                  mode="outlined"
                  textStyle={{ fontSize: 10 }}
                  style={{ marginLeft: SPACING.sm, height: 20 }}
                >
                  {notification.type.toUpperCase()}
                </Chip>
              </View>
              
              {!bulkActionMode && (
                <View style={{ flexDirection: 'row' }}>
                  {!notification.read && (
                    <IconButton
                      icon="check"
                      size={16}
                      iconColor={COLORS.success}
                      onPress={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    />
                  )}
                  <IconButton
                    icon="delete"
                    size={16}
                    iconColor={COLORS.error}
                    onPress={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Surface>
  );

  const renderBulkActionModal = () => (
    <Portal>
      <Modal
        visible={bulkActionMode && selectedNotifications.size > 0}
        onDismiss={() => setBulkActionMode(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          borderRadius: 20,
          padding: SPACING.lg,
          elevation: 5,
        }}
      >
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md, textAlign: 'center' }]}>
          Bulk Actions ({selectedNotifications.size} selected)
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <Button
            mode="contained"
            buttonColor={COLORS.success}
            onPress={() => handleBulkAction('read')}
            style={{ minWidth: 120 }}
            icon="check"
          >
            Mark as Read
          </Button>
          <Button
            mode="contained"
            buttonColor={COLORS.error}
            onPress={() => handleBulkAction('delete')}
            style={{ minWidth: 120 }}
            icon="delete"
          >
            Delete
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  const renderSettingsModal = () => (
    <Portal>
      <Modal
        visible={settingsModalVisible}
        onDismiss={() => setSettingsModalVisible(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.lg,
          borderRadius: 20,
          padding: SPACING.lg,
          maxHeight: screenHeight * 0.7,
          elevation: 5,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md }}>
          <MaterialIcons name="settings" size={24} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
          <Text style={TEXT_STYLES.h3}>
            Notification Settings
          </Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.keys(notificationSettings).map(key => {
            if (key === 'quiet_hours') return null;
            const setting = notificationSettings[key];
            const categoryIcons = {
              sessions: 'event',
              messages: 'chat',
              payments: 'payment',
              system: 'settings'
            };
            
            return (
              <View key={key}>
                <Surface style={{
                  padding: SPACING.md,
                  borderRadius: 12,
                  marginBottom: SPACING.sm,
                  elevation: 1,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <MaterialIcons 
                        name={categoryIcons[key]} 
                        size={20} 
                        color={COLORS.primary} 
                        style={{ marginRight: SPACING.sm }} 
                      />
                      <Text style={TEXT_STYLES.body}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                      </Text>
                    </View>
                    <Switch
                      value={setting.enabled}
                      onValueChange={(value) => {
                        setNotificationSettings(prev => ({
                          ...prev,
                          [key]: { ...prev[key], enabled: value }
                        }));
                        Vibration.vibrate(25);
                      }}
                      thumbColor={setting.enabled ? COLORS.primary : COLORS.textSecondary}
                      trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                    />
                  </View>
                  
                  {setting.enabled && (
                    <View style={{ 
                      marginLeft: SPACING.lg + 20, 
                      paddingTop: SPACING.sm, 
                      borderTopWidth: 1, 
                      borderTopColor: COLORS.border 
                    }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <MaterialIcons name="notifications" size={16} color={COLORS.textSecondary} />
                          <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>Push Notifications</Text>
                        </View>
                        <Switch
                          value={setting.push}
                          onValueChange={(value) => {
                            setNotificationSettings(prev => ({
                              ...prev,
                              [key]: { ...prev[key], push: value }
                            }));
                            Vibration.vibrate(25);
                          }}
                          thumbColor={setting.push ? COLORS.success : COLORS.textSecondary}
                          trackColor={{ false: COLORS.border, true: COLORS.success + '50' }}
                        />
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <MaterialIcons name="email" size={16} color={COLORS.textSecondary} />
                          <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>Email Notifications</Text>
                        </View>
                        <Switch
                          value={setting.email}
                          onValueChange={(value) => {
                            setNotificationSettings(prev => ({
                              ...prev,
                              [key]: { ...prev[key], email: value }
                            }));
                            Vibration.vibrate(25);
                          }}
                          thumbColor={setting.email ? COLORS.info : COLORS.textSecondary}
                          trackColor={{ false: COLORS.border, true: COLORS.info + '50' }}
                        />
                      </View>
                    </View>
                  )}
                </Surface>
              </View>
            );
          })}
          
          {/* Quiet Hours Section */}
          <Surface style={{
            padding: SPACING.md,
            borderRadius: 12,
            marginBottom: SPACING.sm,
            elevation: 1,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <MaterialIcons name="bedtime" size={20} color={COLORS.warning} style={{ marginRight: SPACING.sm }} />
                <Text style={TEXT_STYLES.body}>Quiet Hours</Text>
              </View>
              <Switch
                value={notificationSettings.quiet_hours?.enabled}
                onValueChange={(value) => {
                  setNotificationSettings(prev => ({
                    ...prev,
                    quiet_hours: { ...prev.quiet_hours, enabled: value }
                  }));
                  Vibration.vibrate(25);
                }}
                thumbColor={notificationSettings.quiet_hours?.enabled ? COLORS.warning : COLORS.textSecondary}
                trackColor={{ false: COLORS.border, true: COLORS.warning + '50' }}
              />
            </View>
            {notificationSettings.quiet_hours?.enabled && (
              <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.lg + 20, color: COLORS.warning }]}>
                🌙 {notificationSettings.quiet_hours?.start} - {notificationSettings.quiet_hours?.end}
              </Text>
            )}
          </Surface>
        </ScrollView>
        
        <Button
          mode="contained"
          onPress={() => {
            setSettingsModalVisible(false);
            Vibration.vibrate(50);
            Alert.alert(
              'Settings Saved! 🎉',
              'Your notification preferences have been updated successfully.',
              [{ text: 'Great!', style: 'default' }]
            );
          }}
          style={{ marginTop: SPACING.md }}
          buttonColor={COLORS.primary}
          icon="check"
        >
          Save Settings
        </Button>
      </Modal>
    </Portal>
  );

  const renderEmptyState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
      <View style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
      }}>
        <MaterialIcons name="notifications-none" size={60} color={COLORS.textSecondary} />
      </View>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm, textAlign: 'center' }]}>
        All Caught Up! 🎉
      </Text>
      <Text style={[TEXT_STYLES.caption, { textAlign: 'center', lineHeight: 20 }]}>
        You have no notifications right now.{'\n'}
        We'll let you know when something important happens!
      </Text>
      
      <TouchableOpacity
        onPress={onRefresh}
        style={{
          marginTop: SPACING.lg,
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          backgroundColor: COLORS.primary,
          borderRadius: 25,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <MaterialIcons name="refresh" size={16} color="white" style={{ marginRight: SPACING.xs }} />
        <Text style={[TEXT_STYLES.caption, { color: 'white', fontWeight: 'bold' }]}>
          Check Again
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFloatingActions = () => (
    <>
      <FAB
        icon="refresh"
        style={{
          position: 'absolute',
          right: SPACING.md,
          bottom: 100,
          backgroundColor: COLORS.primary,
        }}
        onPress={onRefresh}
      />
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          right: SPACING.md,
          bottom: SPACING.md,
          backgroundColor: COLORS.secondary,
        }}
        onPress={() => {
          Alert.alert(
            'Feature Development',
            'Create custom notifications and reminders for your team. This feature is being developed!',
            [{ text: 'Got it! 👍', style: 'default' }]
          );
        }}
      />
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      {renderFilters()}
      
      {filteredNotifications.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              title="Pull to refresh"
              titleColor={COLORS.textSecondary}
            />
          }
          contentContainerStyle={{ 
            paddingBottom: 120,
            flexGrow: 1 
          }}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'}
          updateCellsBatchingPeriod={100}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.xs }} />}
          ListHeaderComponent={() => (
            <View style={{ paddingTop: SPACING.sm }} />
          )}
          onEndReachedThreshold={0.1}
          onEndReached={() => {
            // Handle pagination if needed
            console.log('Load more notifications');
          }}
        />
      )}

      {renderBulkActionModal()}
      {renderSettingsModal()}
      {renderFloatingActions()}
    </View>
  );
};

export default NotificationCenter;
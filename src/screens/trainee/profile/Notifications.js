import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Vibration,
  FlatList,
  Dimensions,
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
  Portal,
  Modal,
  Switch,
  Badge,
  Divider,
  ProgressBar,
  Menu,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

// Design System
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  border: '#e1e8ed',
  unread: '#e3f2fd',
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
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const Notifications = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, notifications, unreadCount } = useSelector(state => state.trainee);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));
  const flatListRef = useRef();
  
  // Sample notifications data
  const [notificationData, setNotificationData] = useState([
    {
      id: '1',
      type: 'training',
      title: 'Training Session Reminder 🏃‍♂️',
      message: 'Your cardio session starts in 30 minutes. Get ready to crush it!',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      priority: 'high',
      icon: 'fitness-center',
      color: COLORS.primary,
      actionable: true,
      data: { sessionId: 'session_123' },
    },
    {
      id: '2',
      type: 'achievement',
      title: 'New Achievement Unlocked! 🏆',
      message: 'Congratulations! You completed 7 consecutive training days. Keep the streak alive!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      priority: 'medium',
      icon: 'jump-rope',
      color: COLORS.warning,
      actionable: false,
    },
    {
      id: '3',
      type: 'coach_message',
      title: 'Message from Coach Sarah 👋',
      message: 'Great progress on your strength training! Let\'s focus on flexibility next week.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
      priority: 'medium',
      icon: 'person',
      color: COLORS.success,
      actionable: true,
      data: { coachId: 'coach_456', messageId: 'msg_789' },
    },
    {
      id: '4',
      type: 'nutrition',
      title: 'Meal Plan Update 🥗',
      message: 'Your new nutrition plan for this week is ready. Check it out!',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: true,
      priority: 'low',
      icon: 'restaurant',
      color: COLORS.info,
      actionable: true,
    },
    {
      id: '5',
      type: 'system',
      title: 'App Update Available 📱',
      message: 'Version 2.1.0 is available with new features and improvements.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      priority: 'low',
      icon: 'system-update',
      color: COLORS.textSecondary,
      actionable: true,
    },
    {
      id: '6',
      type: 'social',
      title: 'Training Buddy Request 🤝',
      message: 'Alex wants to be your training buddy. Accept to train together!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: false,
      priority: 'medium',
      icon: 'group',
      color: COLORS.secondary,
      actionable: true,
      data: { userId: 'user_123', requestId: 'req_456' },
    },
  ]);

  // Notification settings
  const [settings, setSettings] = useState({
    training: true,
    achievements: true,
    coachMessages: true,
    nutrition: true,
    system: false,
    social: true,
    pushEnabled: true,
    emailEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const filters = [
    { key: 'all', label: 'All', count: notificationData.length },
    { key: 'unread', label: 'Unread', count: notificationData.filter(n => !n.read).length },
    { key: 'training', label: 'Training', count: notificationData.filter(n => n.type === 'training').length },
    { key: 'achievement', label: 'Achievements', count: notificationData.filter(n => n.type === 'achievement').length },
    { key: 'coach_message', label: 'Coach', count: notificationData.filter(n => n.type === 'coach_message').length },
  ];

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    loadNotifications();
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      // Load notifications from Redux/API
      // This would integrate with your actual data source
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const filteredNotifications = notificationData
    .filter(notification => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'unread') return !notification.read;
      return notification.type === selectedFilter;
    })
    .filter(notification => 
      searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const markAsRead = useCallback((notificationId) => {
    setNotificationData(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotificationData(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    Vibration.vibrate(100);
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
            setNotificationData(prev => 
              prev.filter(notification => notification.id !== notificationId)
            );
            Vibration.vibrate(50);
          },
        },
      ]
    );
  }, []);

  const handleNotificationPress = useCallback((notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    Vibration.vibrate(50);

    if (notification.actionable) {
      switch (notification.type) {
        case 'training':
          navigation.navigate('TrainingSession', { sessionId: notification.data?.sessionId });
          break;
        case 'coach_message':
          navigation.navigate('ChatScreen', { coachId: notification.data?.coachId });
          break;
        case 'nutrition':
          navigation.navigate('NutritionPlan');
          break;
        case 'social':
          handleSocialAction(notification);
          break;
        case 'system':
          // Handle app update or system notification
          break;
        default:
          break;
      }
    }
  }, [navigation, markAsRead]);

  const handleSocialAction = useCallback((notification) => {
    Alert.alert(
      'Training Buddy Request',
      'Do you want to accept this training buddy request?',
      [
        { text: 'Decline', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            // Handle buddy request acceptance
            Alert.alert('Success!', 'Training buddy request accepted! 🤝');
            deleteNotification(notification.id);
          }
        }
      ]
    );
  }, [deleteNotification]);

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Notifications 🔔</Text>
          <Text style={styles.headerSubtitle}>
            Stay updated with your training
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={markAllAsRead}
            style={styles.headerButton}
          >
            <Icon name="done-all" size={20} color="white" />
          </TouchableOpacity>
          
          <Menu
            visible={showMenu}
            onDismiss={() => setShowMenu(false)}
            anchor={
              <TouchableOpacity
                onPress={() => setShowMenu(true)}
                style={styles.headerButton}
              >
                <Icon name="dots-vertical" size={20} color="white" />
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => {
              setShowMenu(false);
              setShowSettingsModal(true);
            }} title="Notification Settings" />
            <Menu.Item onPress={() => {
              setShowMenu(false);
              Alert.alert(
                'Clear All',
                'Are you sure you want to clear all notifications?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: () => setNotificationData([]),
                  },
                ]
              );
            }} title="Clear All" />
          </Menu>
        </View>
      </View>
      
      {unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Badge size={20} style={{ backgroundColor: COLORS.warning }}>
            {unreadCount}
          </Badge>
          <Text style={styles.unreadText}>unread notifications</Text>
        </View>
      )}
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search notifications..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <Chip
            key={filter.key}
            selected={selectedFilter === filter.key}
            onPress={() => {
              setSelectedFilter(filter.key);
              Vibration.vibrate(30);
            }}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.selectedFilterChip
            ]}
            textStyle={[
              styles.filterChipText,
              selectedFilter === filter.key && styles.selectedFilterChipText
            ]}
          >
            {filter.label} ({filter.count})
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderNotificationItem = ({ item, index }) => {
    const slideInAnim = new Animated.Value(50);
    const opacityAnim = new Animated.Value(0);

    React.useEffect(() => {
      Animated.parallel([
        Animated.timing(slideInAnim, {
          toValue: 0,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.notificationContainer,
          {
            opacity: opacityAnim,
            transform: [{ translateX: slideInAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleNotificationPress(item)}
          style={[
            styles.notificationItem,
            !item.read && styles.unreadNotification,
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.notificationHeader}>
            <View style={styles.iconContainer}>
              <Avatar.Icon
                size={40}
                icon={item.icon}
                style={{ backgroundColor: item.color }}
              />
              {!item.read && (
                <View style={styles.unreadDot} />
              )}
            </View>
            
            <View style={styles.notificationContent}>
              <Text style={[
                styles.notificationTitle,
                !item.read && styles.unreadTitle
              ]}>
                {item.title}
              </Text>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {item.message}
              </Text>
              <View style={styles.notificationMeta}>
                <Text style={styles.timestamp}>
                  {formatTimestamp(item.timestamp)}
                </Text>
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.priorityChip, { borderColor: item.color }]}
                  textStyle={{ color: item.color, fontSize: 10 }}
                >
                  {item.priority.toUpperCase()}
                </Chip>
              </View>
            </View>
            
            <View style={styles.notificationActions}>
              <IconButton
                icon="delete"
                size={20}
                onPress={() => deleteNotification(item.id)}
                iconColor={COLORS.error}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="notifications-none" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        {selectedFilter === 'all' 
          ? "You're all caught up! 🎉" 
          : `No ${selectedFilter === 'unread' ? 'unread' : selectedFilter} notifications`
        }
      </Text>
      <Button
        mode="contained"
        onPress={onRefresh}
        style={styles.refreshButton}
        icon="refresh"
      >
        Refresh
      </Button>
    </View>
  );

  const renderSettingsModal = () => (
    <Portal>
      <Modal
        visible={showSettingsModal}
        onDismiss={() => setShowSettingsModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Card style={styles.modalCard}>
            <Card.Title
              title="Notification Settings"
              left={(props) => <Avatar.Icon {...props} icon="settings" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="close"
                  onPress={() => setShowSettingsModal(false)}
                />
              )}
            />
            <Card.Content>
              <ScrollView style={styles.settingsScroll}>
                {Object.entries(settings).map(([key, value]) => (
                  <View key={key} style={styles.settingItem}>
                    <Text style={styles.settingLabel}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Text>
                    <Switch
                      value={value}
                      onValueChange={(newValue) => 
                        setSettings(prev => ({ ...prev, [key]: newValue }))
                      }
                      color={COLORS.primary}
                    />
                  </View>
                ))}
              </ScrollView>
            </Card.Content>
            
            <Card.Actions>
              <Button onPress={() => setShowSettingsModal(false)}>
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={() => {
                  setShowSettingsModal(false);
                  Alert.alert('Settings Saved', 'Your notification preferences have been updated! ✅');
                }}
              >
                Save Settings
              </Button>
            </Card.Actions>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <Animated.View 
        style={[
          styles.animatedContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {renderHeader()}
        {renderSearchAndFilters()}
        
        {filteredNotifications.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            ref={flatListRef}
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
              />
            }
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
        
        {renderSettingsModal()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    marginLeft: SPACING.sm,
  },
  unreadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  unreadText: {
    color: 'rgba(255,255,255,0.8)',
    marginLeft: SPACING.sm,
    fontSize: 12,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: COLORS.background,
    borderRadius: 25,
  },
  filtersContainer: {
    marginTop: SPACING.sm,
  },
  filtersContent: {
    paddingRight: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.text,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  listContainer: {
    paddingVertical: SPACING.sm,
  },
  notificationContainer: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  unreadNotification: {
    backgroundColor: COLORS.unread,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: 'white',
  },
  notificationContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  notificationTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  unreadTitle: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  notificationMessage: {
    ...TEXT_STYLES.caption,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timestamp: {
    ...TEXT_STYLES.small,
  },
  priorityChip: {
    height: 20,
  },
  notificationActions: {
    marginLeft: SPACING.sm,
  },
  separator: {
    height: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    maxHeight: '80%',
  },
  settingsScroll: {
    maxHeight: 400,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
});

export default Notifications;
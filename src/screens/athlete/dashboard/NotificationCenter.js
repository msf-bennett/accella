import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  FlatList,
  Vibration,
  Alert,
  StyleSheet,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
  Divider,
  Badge,
  Switch,
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
  background: '#f5f6fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
  info: '#2196F3',
  purple: '#9c27b0',
  teal: '#009688',
  lightBlue: '#e3f2fd',
  lightGreen: '#e8f5e8',
  lightRed: '#ffebee',
  lightOrange: '#fff3e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  heading2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  heading3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const NotificationContent = ({ navigation }) => {
  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    training: true,
    achievements: true,
    messages: true,
    reminders: true,
    social: false,
    marketing: false,
  });
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;

  // Redux State
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const unreadCount = useSelector(state => state.notifications.unreadCount);

  // Mock Notifications Data
  const notifications = [
    {
      id: 1,
      type: 'training',
      title: '⚡ Training Reminder',
      message: 'Your speed training session starts in 30 minutes. Get ready to push your limits!',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      priority: 'high',
      actionable: true,
      action: 'View Session',
      icon: 'fitness-center',
      color: COLORS.primary,
      avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100',
    },
    {
      id: 2,
      type: 'achievement',
      title: '🏆 New Achievement Unlocked!',
      message: 'Congratulations! You\'ve completed your 7-day training streak. Keep it up, champion!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      priority: 'medium',
      actionable: true,
      action: 'View Achievement',
      icon: 'jump-rope',
      color: COLORS.warning,
      points: 150,
    },
    {
      id: 3,
      type: 'message',
      title: '💬 Message from Coach Martinez',
      message: 'Great progress in today\'s session! Focus on your form during tomorrow\'s drill practice.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true,
      priority: 'medium',
      actionable: true,
      action: 'Reply',
      icon: 'person',
      color: COLORS.success,
      sender: 'Coach Martinez',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    {
      id: 4,
      type: 'reminder',
      title: '🥤 Hydration Reminder',
      message: 'Don\'t forget to drink water! You\'ve only had 3 glasses today. Target: 8 glasses.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: true,
      priority: 'low',
      actionable: true,
      action: 'Log Water',
      icon: 'local-drink',
      color: COLORS.info,
      progress: 0.375,
    },
    {
      id: 5,
      type: 'social',
      title: '👥 Team Update',
      message: 'Sarah Johnson completed the "Mental Toughness Challenge". Motivate your teammate!',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      read: true,
      priority: 'low',
      actionable: true,
      action: 'Congratulate',
      icon: 'people',
      color: COLORS.purple,
      teammate: 'Sarah Johnson',
    },
    {
      id: 6,
      type: 'training',
      title: '📊 Weekly Report Ready',
      message: 'Your training analysis for this week is ready. Check your progress and areas for improvement.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      priority: 'medium',
      actionable: true,
      action: 'View Report',
      icon: 'assessment',
      color: COLORS.teal,
    },
    {
      id: 7,
      type: 'system',
      title: '🔄 App Update Available',
      message: 'Version 2.1 is now available with improved performance tracking and new challenges!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      priority: 'low',
      actionable: true,
      action: 'Update Now',
      icon: 'system-update',
      color: COLORS.secondary,
    },
  ];

  const filterCategories = [
    { id: 'all', label: 'All', icon: 'notifications', color: COLORS.text, count: notifications.length },
    { id: 'training', label: 'Training', icon: 'fitness-center', color: COLORS.primary, count: notifications.filter(n => n.type === 'training').length },
    { id: 'achievement', label: 'Achievements', icon: 'jump-rope', color: COLORS.warning, count: notifications.filter(n => n.type === 'achievement').length },
    { id: 'message', label: 'Messages', icon: 'message', color: COLORS.success, count: notifications.filter(n => n.type === 'message').length },
    { id: 'reminder', label: 'Reminders', icon: 'schedule', color: COLORS.info, count: notifications.filter(n => n.type === 'reminder').length },
    { id: 'social', label: 'Social', icon: 'people', color: COLORS.purple, count: notifications.filter(n => n.type === 'social').length },
  ];

  // Effects
  useEffect(() => {
    // Animate notifications on mount
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

    // Animate badge if there are unread notifications
    if (getUnreadCount() > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(badgeAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  // Callbacks
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      Vibration.vibrate(50);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh notifications');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleNotificationPress = useCallback((notification) => {
    Vibration.vibrate(50);
    
    if (isSelectionMode) {
      toggleSelection(notification.id);
      return;
    }

    // Mark as read
    // dispatch(markNotificationAsRead(notification.id));

    // Handle different notification types
    switch (notification.type) {
      case 'training':
        Alert.alert('Feature Coming Soon', 'Training session details will be available soon! 🏋️‍♂️');
        break;
      case 'achievement':
        Alert.alert('🏆 Achievement Details', `Congratulations on earning ${notification.points} points!`);
        break;
      case 'message':
        Alert.alert('Feature Coming Soon', 'Coach messaging will be available soon! 💬');
        break;
      case 'reminder':
        Alert.alert('Feature Coming Soon', 'Quick logging will be available soon! 📝');
        break;
      case 'social':
        Alert.alert('Feature Coming Soon', 'Social features will be available soon! 👥');
        break;
      default:
        Alert.alert('Notification', notification.message);
    }
  }, [isSelectionMode]);

  const handleNotificationLongPress = useCallback((notification) => {
    Vibration.vibrate(100);
    setIsSelectionMode(true);
    setSelectedNotifications(new Set([notification.id]));
  }, []);

  const toggleSelection = useCallback((notificationId) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }
      
      return newSet;
    });
  }, []);

  const handleBulkAction = useCallback((action) => {
    Vibration.vibrate(75);
    const selectedCount = selectedNotifications.size;
    
    switch (action) {
      case 'markRead':
        Alert.alert('Success', `${selectedCount} notification(s) marked as read`);
        break;
      case 'delete':
        Alert.alert(
          'Delete Notifications',
          `Are you sure you want to delete ${selectedCount} notification(s)?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => {
              Alert.alert('Success', `${selectedCount} notification(s) deleted`);
              setSelectedNotifications(new Set());
              setIsSelectionMode(false);
            }}
          ]
        );
        return;
      case 'archive':
        Alert.alert('Success', `${selectedCount} notification(s) archived`);
        break;
    }
    
    setSelectedNotifications(new Set());
    setIsSelectionMode(false);
  }, [selectedNotifications]);

  const getFilteredNotifications = () => {
    let filtered = notifications;
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === selectedFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by timestamp (newest first) and unread status
    return filtered.sort((a, b) => {
      if (a.read !== b.read) return a.read - b.read;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const getTimeDifference = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  // Render Functions
  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.headerGradient}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitleText}>Notifications</Text>
            {getUnreadCount() > 0 && (
              <Animated.View
                style={[
                  styles.unreadBadge,
                  {
                    opacity: badgeAnim,
                    transform: [{
                      scale: badgeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                      })
                    }]
                  }
                ]}
              >
                <Text style={styles.unreadBadgeText}>{getUnreadCount()}</Text>
              </Animated.View>
            )}
          </View>
          <Text style={styles.headerSubtitle}>
            {isSelectionMode 
              ? `${selectedNotifications.size} selected`
              : `${getUnreadCount()} unread messages`
            }
          </Text>
        </View>

        <View style={styles.headerActions}>
          {isSelectionMode ? (
            <TouchableOpacity
              onPress={() => {
                setIsSelectionMode(false);
                setSelectedNotifications(new Set());
              }}
              style={styles.headerAction}
            >
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => setShowSettingsModal(true)}
              style={styles.headerAction}
            >
              <Icon name="settings" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );

  const renderQuickActions = () => {
    if (!isSelectionMode) return null;

    return (
      <Surface style={styles.quickActionsBar} elevation={4}>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => handleBulkAction('markRead')}
        >
          <Icon name="mark-email-read" size={20} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Mark Read</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => handleBulkAction('archive')}
        >
          <Icon name="archive" size={20} color={COLORS.warning} />
          <Text style={styles.quickActionText}>Archive</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => handleBulkAction('delete')}
        >
          <Icon name="delete" size={20} color={COLORS.error} />
          <Text style={styles.quickActionText}>Delete</Text>
        </TouchableOpacity>
      </Surface>
    );
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {filterCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterTab,
              selectedFilter === category.id && styles.filterTabActive,
              { borderColor: category.color }
            ]}
            onPress={() => setSelectedFilter(category.id)}
          >
            <Icon 
              name={category.icon} 
              size={18} 
              color={selectedFilter === category.id ? 'white' : category.color}
              style={{ marginRight: SPACING.xs }}
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === category.id && styles.filterTextActive
              ]}
            >
              {category.label}
            </Text>
            {category.count > 0 && (
              <Badge 
                size={18}
                style={[
                  styles.filterBadge,
                  { backgroundColor: selectedFilter === category.id ? 'rgba(255,255,255,0.3)' : category.color + '30' }
                ]}
              >
                {category.count}
              </Badge>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderNotificationItem = ({ item: notification, index }) => {
    const isSelected = selectedNotifications.has(notification.id);
    const timeAgo = getTimeDifference(notification.timestamp);

    return (
      <Animated.View
        style={[
          styles.notificationWrapper,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, 30],
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.notificationCard,
            !notification.read && styles.unreadNotification,
            isSelected && styles.selectedNotification
          ]}
          onPress={() => handleNotificationPress(notification)}
          onLongPress={() => handleNotificationLongPress(notification)}
          activeOpacity={0.7}
        >
          <Card style={styles.notificationCardInner} elevation={notification.read ? 1 : 3}>
            <Card.Content style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <View style={styles.notificationLeft}>
                  {notification.senderAvatar || notification.avatar ? (
                    <Avatar.Image
                      size={48}
                      source={{ uri: notification.senderAvatar || notification.avatar }}
                      style={styles.notificationAvatar}
                    />
                  ) : (
                    <Surface 
                      style={[
                        styles.notificationIcon, 
                        { backgroundColor: notification.color + '20' }
                      ]}
                      elevation={1}
                    >
                      <Icon name={notification.icon} size={24} color={notification.color} />
                    </Surface>
                  )}
                  
                  <View style={styles.notificationInfo}>
                    <View style={styles.titleRow}>
                      <Text 
                        style={[
                          styles.notificationTitle,
                          !notification.read && { fontWeight: 'bold' }
                        ]} 
                        numberOfLines={1}
                      >
                        {notification.title}
                      </Text>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </View>
                    
                    <Text 
                      style={[
                        styles.notificationMessage,
                        !notification.read && { color: COLORS.text }
                      ]} 
                      numberOfLines={2}
                    >
                      {notification.message}
                    </Text>
                    
                    <View style={styles.notificationMeta}>
                      <Text style={styles.notificationTime}>{timeAgo}</Text>
                      {notification.priority === 'high' && (
                        <Chip 
                          style={[styles.priorityChip, { backgroundColor: COLORS.error + '20' }]}
                          textStyle={styles.priorityText}
                          compact
                        >
                          High Priority
                        </Chip>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.notificationRight}>
                  {isSelectionMode && (
                    <Surface 
                      style={[
                        styles.selectionCheckbox,
                        isSelected && { backgroundColor: COLORS.primary }
                      ]}
                      elevation={1}
                    >
                      {isSelected && <Icon name="check" size={16} color="white" />}
                    </Surface>
                  )}
                  
                  {!isSelectionMode && notification.actionable && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleNotificationPress(notification)}
                    >
                      <Icon name="arrow-forward" size={20} color={notification.color} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {notification.progress !== undefined && (
                <View style={styles.progressSection}>
                  <View style={styles.progressInfo}>
                    <Text style={TEXT_STYLES.small}>Progress</Text>
                    <Text style={[TEXT_STYLES.small, { fontWeight: 'bold' }]}>
                      {Math.round(notification.progress * 100)}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={notification.progress}
                    color={notification.color}
                    style={styles.notificationProgressBar}
                  />
                </View>
              )}

              {notification.points && (
                <View style={styles.pointsSection}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={[TEXT_STYLES.small, { color: COLORS.warning, fontWeight: 'bold' }]}>
                    +{notification.points} points earned
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="notifications-off" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.heading3, { marginTop: SPACING.md, textAlign: 'center' }]}>
        No notifications found
      </Text>
      <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
        {selectedFilter === 'all' 
          ? 'You\'re all caught up! New notifications will appear here.'
          : `No ${selectedFilter} notifications at the moment.`
        }
      </Text>
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
          <View style={styles.settingsModal}>
            <View style={styles.modalHeader}>
              <Text style={TEXT_STYLES.heading2}>Notification Settings</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.settingsContent}>
              {Object.entries(notificationSettings).map(([key, enabled]) => (
                <View key={key} style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={[TEXT_STYLES.body, { fontWeight: '500' }]}>
                      {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                    </Text>
                    <Text style={TEXT_STYLES.caption}>
                      {getSettingDescription(key)}
                    </Text>
                  </View>
                  <Switch
                    value={enabled}
                    onValueChange={(value) => {
                      Vibration.vibrate(50);
                      setNotificationSettings(prev => ({ ...prev, [key]: value }));
                    }}
                    trackColor={{ false: COLORS.background, true: COLORS.primary + '50' }}
                    thumbColor={enabled ? COLORS.primary : COLORS.textSecondary}
                  />
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowSettingsModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  Alert.alert('Settings Saved', 'Your notification preferences have been updated.');
                  setShowSettingsModal(false);
                }}
                style={styles.modalButton}
              >
                Save Changes
              </Button>
            </View>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  const getSettingDescription = (key) => {
    const descriptions = {
      training: 'Session reminders and schedule updates',
      achievements: 'Badge unlocks and milestone celebrations',
      messages: 'Coach communications and team updates',
      reminders: 'Hydration, rest, and habit tracking',
      social: 'Team member activities and challenges',
      marketing: 'App updates and promotional content',
    };
    return descriptions[key] || '';
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderQuickActions()}
      
      <View style={styles.content}>
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search notifications..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />
        </View>

        {renderFilterTabs()}

        <Animated.View style={styles.notificationsSection}>
          {filteredNotifications.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredNotifications}
              renderItem={renderNotificationItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[COLORS.primary]}
                  tintColor={COLORS.primary}
                />
              }
              ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          )}
        </Animated.View>
      </View>

      {renderSettingsModal()}

      {/* Mark All Read FAB */}
      {!isSelectionMode && getUnreadCount() > 0 && (
        <FAB
          icon="done-all"
          style={styles.fab}
          onPress={() => {
            Vibration.vibrate(50);
            Alert.alert(
              'Mark All as Read',
              `Mark all ${getUnreadCount()} notifications as read?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Mark All', onPress: () => Alert.alert('Success', 'All notifications marked as read!') }
              ]
            );
          }}
          color="white"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    padding: SPACING.sm,
  },
  quickActionsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionText: {
    fontSize: 12,
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  searchSection: {
    marginBottom: SPACING.md,
  },
  searchbar: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 2,
  },
  filterContainer: {
    marginBottom: SPACING.lg,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    gap: SPACING.xs,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  filterBadge: {
    marginLeft: SPACING.xs,
  },
  notificationsSection: {
    flex: 1,
  },
  notificationWrapper: {
    marginBottom: SPACING.sm,
  },
  notificationCard: {
    borderRadius: 16,
  },
  unreadNotification: {
    transform: [{ scale: 1.02 }],
  },
  selectedNotification: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 16,
  },
  notificationCardInner: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  notificationContent: {
    padding: SPACING.md,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  notificationLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationAvatar: {
    marginRight: SPACING.md,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  notificationInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priorityChip: {
    height: 20,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  notificationRight: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  selectionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  progressSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  notificationProgressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.background,
  },
  pointsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    gap: SPACING.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsModal: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginHorizontal: SPACING.lg,
    maxHeight: height * 0.8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  settingsContent: {
    maxHeight: height * 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
    borderRadius: 25,
  },
});

export default NotificationContent;
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Badge,
  Portal,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const Notifications = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, notifications, unreadCount } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call to fetch notifications
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchNotifications());
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleNotificationPress = (notification) => {
    Vibration.vibrate(50);
    
    if (!notification.read) {
      // Mark as read
      // dispatch(markNotificationAsRead(notification.id));
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'training':
        navigation.navigate('TrainingPlan');
        break;
      case 'achievement':
        navigation.navigate('Progress');
        break;
      case 'message':
        navigation.navigate('Messages');
        break;
      case 'session':
        navigation.navigate('Schedule');
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      '📬 Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark All', 
          onPress: () => {
            Vibration.vibrate(50);
            // dispatch(markAllNotificationsAsRead());
          }
        },
      ]
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'training':
        return 'fitness-center';
      case 'achievement':
        return 'stars';
      case 'message':
        return 'message';
      case 'session':
        return 'schedule';
      case 'reminder':
        return 'alarm';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'training':
        return COLORS.primary;
      case 'achievement':
        return '#FFD700';
      case 'message':
        return COLORS.secondary;
      case 'session':
        return COLORS.success;
      case 'reminder':
        return '#FF6B6B';
      default:
        return COLORS.primary;
    }
  };

  const mockNotifications = [
    {
      id: '1',
      type: 'achievement',
      title: '🎉 New Achievement Unlocked!',
      message: 'Congratulations! You completed 5 training sessions this week!',
      time: '2 hours ago',
      read: false,
      avatar: '🏆'
    },
    {
      id: '2',
      type: 'training',
      title: '⚽ New Training Session Available',
      message: 'Coach Sarah has assigned you a new dribbling drill session.',
      time: '4 hours ago',
      read: false,
      avatar: '👩‍🏫'
    },
    {
      id: '3',
      type: 'message',
      title: '💬 Message from Coach',
      message: 'Great job in today\'s practice! Keep up the excellent work!',
      time: '1 day ago',
      read: true,
      avatar: '👨‍💼'
    },
    {
      id: '4',
      type: 'session',
      title: '📅 Upcoming Training Session',
      message: 'Reminder: You have football practice tomorrow at 4:00 PM',
      time: '1 day ago',
      read: true,
      avatar: '⚽'
    },
    {
      id: '5',
      type: 'reminder',
      title: '⏰ Don\'t Forget!',
      message: 'Complete your daily fitness challenge to maintain your streak!',
      time: '2 days ago',
      read: false,
      avatar: '🔥'
    }
  ];

  const filteredNotifications = mockNotifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    return true;
  });

  const renderNotificationCard = (notification) => (
    <TouchableOpacity
      key={notification.id}
      onPress={() => handleNotificationPress(notification)}
      activeOpacity={0.7}
    >
      <Card style={[
        styles.notificationCard,
        !notification.read && styles.unreadCard
      ]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.notificationRow}>
            <View style={styles.avatarContainer}>
              <Surface style={[
                styles.iconSurface,
                { backgroundColor: getNotificationColor(notification.type) + '20' }
              ]}>
                <Text style={styles.avatarEmoji}>{notification.avatar}</Text>
              </Surface>
              {!notification.read && (
                <View style={styles.unreadDot} />
              )}
            </View>
            
            <View style={styles.contentContainer}>
              <Text style={[
                TEXT_STYLES.h4,
                styles.notificationTitle,
                !notification.read && styles.unreadText
              ]}>
                {notification.title}
              </Text>
              <Text style={[
                TEXT_STYLES.body,
                styles.notificationMessage
              ]}>
                {notification.message}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.timeText]}>
                {notification.time}
              </Text>
            </View>
            
            <IconButton
              icon={getNotificationIcon(notification.type)}
              size={20}
              iconColor={getNotificationColor(notification.type)}
              style={styles.notificationIcon}
            />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons 
        name="notifications-none" 
        size={80} 
        color={COLORS.textSecondary} 
      />
      <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
        No Notifications Yet! 📭
      </Text>
      <Text style={[TEXT_STYLES.body, styles.emptyMessage]}>
        When you have new messages, achievements, or training updates, they'll appear here!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
            Notifications 🔔
          </Text>
          {unreadCount > 0 && (
            <Badge style={styles.badge} size={24}>
              {unreadCount}
            </Badge>
          )}
        </View>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <View style={styles.chipContainer}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={[styles.filterChip, filter === 'all' && styles.selectedChip]}
            textStyle={filter === 'all' ? styles.selectedChipText : styles.chipText}
          >
            All
          </Chip>
          <Chip
            selected={filter === 'unread'}
            onPress={() => setFilter('unread')}
            style={[styles.filterChip, filter === 'unread' && styles.selectedChip]}
            textStyle={filter === 'unread' ? styles.selectedChipText : styles.chipText}
          >
            Unread ({mockNotifications.filter(n => !n.read).length})
          </Chip>
        </View>
        
        {mockNotifications.some(n => !n.read) && (
          <Button
            mode="text"
            onPress={handleMarkAllAsRead}
            textColor={COLORS.primary}
            style={styles.markAllButton}
            labelStyle={styles.markAllText}
          >
            Mark All Read
          </Button>
        )}
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {filteredNotifications.length > 0 ? (
            <View style={styles.notificationsList}>
              {filteredNotifications.map(renderNotificationCard)}
            </View>
          ) : (
            renderEmptyState()
          )}
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: COLORS.error,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  selectedChipText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  markAllButton: {
    marginRight: -SPACING.xs,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: SPACING.sm,
  },
  notificationsList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 12,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  cardContent: {
    paddingVertical: SPACING.sm,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  iconSurface: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTitle: {
    fontWeight: '600',
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
  },
  unreadText: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  notificationMessage: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  timeText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  notificationIcon: {
    margin: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    textAlign: 'center',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});

export default Notification;
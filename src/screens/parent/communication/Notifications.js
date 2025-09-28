import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Badge,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Notifications = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, payments, achievements, sessions

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      type: 'payment',
      title: 'Payment Due Reminder',
      message: 'Monthly payment for Elite Sports Academy is due in 3 days',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      priority: 'high',
      actionable: true,
      academy: 'Elite Sports Academy',
      amount: '$150',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      icon: 'card-outline',
      color: '#FF3B30'
    },
    {
      id: 2,
      type: 'achievement',
      title: 'New Achievement Unlocked! 🎉',
      message: 'Alex completed 10 consecutive training sessions - "Consistency Champion"',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false,
      priority: 'normal',
      childName: 'Alex Johnson',
      achievementType: 'Consistency Champion',
      icon: 'trophy-outline',
      color: '#FFD700'
    },
    {
      id: 3,
      type: 'session',
      title: 'Session Update',
      message: 'Tomorrow\'s football training has been moved to 4:00 PM due to weather conditions',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: true,
      priority: 'high',
      sessionId: 'sess_123',
      oldTime: '3:00 PM',
      newTime: '4:00 PM',
      reason: 'Weather conditions',
      icon: 'time-outline',
      color: '#FF9500'
    },
    {
      id: 4,
      type: 'performance',
      title: 'Weekly Performance Report',
      message: 'Your child\'s performance summary for week of Jan 8-14 is now available',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: true,
      priority: 'normal',
      reportWeek: 'Jan 8-14',
      childName: 'Alex Johnson',
      icon: 'analytics-outline',
      color: '#007AFF'
    },
    {
      id: 5,
      type: 'payment',
      title: 'Payment Successful',
      message: 'Your payment of $150 has been processed successfully',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
      priority: 'normal',
      amount: '$150',
      academy: 'Elite Sports Academy',
      transactionId: 'TXN123456',
      icon: 'checkmark-circle-outline',
      color: '#00C853'
    },
    {
      id: 6,
      type: 'general',
      title: 'New Feature Available',
      message: 'Video session reviews are now available! Check out recorded training sessions.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: false,
      priority: 'low',
      icon: 'play-circle-outline',
      color: '#9C27B0'
    },
    {
      id: 7,
      type: 'session',
      title: 'Session Reminder',
      message: 'Football training starts in 2 hours at Elite Sports Academy',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      read: true,
      priority: 'normal',
      sessionTime: '3:00 PM',
      academy: 'Elite Sports Academy',
      icon: 'alarm-outline',
      color: '#007AFF'
    }
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    // Replace with actual API call
    setNotifications(mockNotifications);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'payments':
        return notifications.filter(n => n.type === 'payment');
      case 'achievements':
        return notifications.filter(n => n.type === 'achievement');
      case 'sessions':
        return notifications.filter(n => n.type === 'session');
      default:
        return notifications;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
          }
        }
      ]
    );
  };

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'payment':
        if (notification.actionable) {
          navigation.navigate('PaymentScreen', { 
            academy: notification.academy,
            amount: notification.amount,
            dueDate: notification.dueDate
          });
        }
        break;
      case 'session':
        navigation.navigate('SessionDetails', { 
          sessionId: notification.sessionId 
        });
        break;
      case 'achievement':
        navigation.navigate('AchievementsScreen', {
          childName: notification.childName,
          highlightAchievement: notification.achievementType
        });
        break;
      case 'performance':
        navigation.navigate('PerformanceReport', {
          week: notification.reportWeek,
          childName: notification.childName
        });
        break;
      default:
        // For general notifications, maybe show a detail modal
        break;
    }
  };

  const getNotificationAction = (notification) => {
    switch (notification.type) {
      case 'payment':
        if (notification.actionable) {
          return (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleNotificationPress(notification)}
            >
              <Text style={styles.actionButtonText}>Pay Now</Text>
            </TouchableOpacity>
          );
        }
        return null;
      case 'session':
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => handleNotificationPress(notification)}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>View Details</Text>
          </TouchableOpacity>
        );
      case 'achievement':
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.achievementButton]}
            onPress={() => handleNotificationPress(notification)}
          >
            <Text style={[styles.actionButtonText, styles.achievementButtonText]}>Celebrate</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.read && styles.unreadCard,
        item.priority === 'high' && styles.highPriorityCard
      ]}
      onPress={() => handleNotificationPress(item)}
      onLongPress={() => deleteNotification(item.id)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={item.icon} 
              size={24} 
              color={item.color} 
            />
            {!item.read && <View style={styles.unreadIndicator} />}
          </View>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
              {item.title}
            </Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            
            {/* Additional context based on type */}
            {item.type === 'payment' && item.actionable && (
              <View style={styles.paymentDetails}>
                <Text style={styles.amount}>Amount: {item.amount}</Text>
                <Text style={styles.dueDate}>
                  Due: {item.dueDate.toLocaleDateString()}
                </Text>
              </View>
            )}
            
            {item.type === 'achievement' && (
              <View style={styles.achievementDetails}>
                <Text style={styles.childName}>🎯 {item.childName}</Text>
                <Text style={styles.achievementType}>{item.achievementType}</Text>
              </View>
            )}
            
            {item.type === 'session' && item.newTime && (
              <View style={styles.sessionDetails}>
                <Text style={styles.timeChange}>
                  {item.oldTime} → {item.newTime}
                </Text>
                <Text style={styles.reason}>Reason: {item.reason}</Text>
              </View>
            )}
          </View>
          <View style={styles.timestampContainer}>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            {item.priority === 'high' && (
              <Ionicons name="warning" size={16} color="#FF3B30" />
            )}
          </View>
        </View>
        
        {/* Action buttons */}
        <View style={styles.actionContainer}>
          {getNotificationAction(item)}
        </View>
      </View>
    </TouchableOpacity>
  );

  const FilterTabs = () => {
    const filters = [
      { key: 'all', label: 'All', count: notifications.length },
      { key: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
      { key: 'payments', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length },
      { key: 'achievements', label: 'Awards', count: notifications.filter(n => n.type === 'achievement').length },
      { key: 'sessions', label: 'Sessions', count: notifications.filter(n => n.type === 'session').length },
    ];

    return (
      <View style={styles.filterContainer}>
        {filters.map(filterItem => (
          <TouchableOpacity
            key={filterItem.key}
            style={[
              styles.filterTab,
              filter === filterItem.key && styles.activeFilterTab
            ]}
            onPress={() => setFilter(filterItem.key)}
          >
            <Text style={[
              styles.filterText,
              filter === filterItem.key && styles.activeFilterText
            ]}>
              {filterItem.label}
            </Text>
            {filterItem.count > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{filterItem.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <FilterTabs />

      {/* Notifications List */}
      <FlatList
        data={getFilteredNotifications()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        contentContainerStyle={styles.notificationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyMessage}>
              {filter === 'all' 
                ? "You're all caught up!" 
                : `No ${filter} notifications`}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 16,
  },
  markAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  countText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  notificationsList: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  highPriorityCard: {
    borderLeftColor: '#FF3B30',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
    marginTop: 2,
  },
  unreadIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  unreadTitle: {
    color: '#000',
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  timestampContainer: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  paymentDetails: {
    backgroundColor: '#fff5f5',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  amount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  achievementDetails: {
    backgroundColor: '#fffbf0',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  childName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementType: {
    fontSize: 12,
    color: '#B8860B',
    marginTop: 2,
  },
  sessionDetails: {
    backgroundColor: '#fff8f0',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  timeChange: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  reason: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionContainer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  achievementButton: {
    backgroundColor: '#FFD700',
  },
  achievementButtonText: {
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default Notifications;
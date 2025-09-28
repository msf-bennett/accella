import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
  Vibration,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Modal,
  Searchbar,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9ff',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const ParentNotifications = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, notifications, children } = useSelector(state => ({
    user: state.auth.user,
    notifications: state.notifications.parentNotifications || [],
    children: state.family.children || [],
  }));

  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState({
    safetyAlerts: true,
    attendanceUpdates: true,
    performanceReports: true,
    coachMessages: true,
    emergencyAlerts: true,
    behaviorReports: true,
    scheduleChanges: true,
    paymentReminders: true,
  });

  // Sample notification data (would come from Redux store)
  const sampleNotifications = [
    {
      id: '1',
      type: 'safety',
      priority: 'high',
      title: 'Safety Check-in Required',
      message: 'Emma has arrived safely at soccer practice. Location verified.',
      childName: 'Emma Johnson',
      childId: 'child_1',
      timestamp: new Date().getTime() - 300000, // 5 minutes ago
      read: false,
      actionRequired: false,
      location: 'Riverside Sports Complex',
      coach: 'Coach Martinez',
    },
    {
      id: '2',
      type: 'emergency',
      priority: 'critical',
      title: '🚨 Emergency Alert',
      message: 'Training session cancelled due to severe weather. All children are safe indoors.',
      childName: 'All Children',
      childId: 'all',
      timestamp: new Date().getTime() - 1800000, // 30 minutes ago
      read: false,
      actionRequired: true,
      location: 'Central Park Field',
      coach: 'Coach Thompson',
    },
    {
      id: '3',
      type: 'attendance',
      priority: 'medium',
      title: '✅ Practice Attendance Confirmed',
      message: 'Alex has been marked present for basketball practice.',
      childName: 'Alex Johnson',
      childId: 'child_2',
      timestamp: new Date().getTime() - 3600000, // 1 hour ago
      read: true,
      actionRequired: false,
      location: 'Community Center Gym',
      coach: 'Coach Williams',
    },
    {
      id: '4',
      type: 'behavior',
      priority: 'medium',
      title: '⭐ Positive Behavior Report',
      message: 'Emma showed excellent teamwork and leadership during practice today!',
      childName: 'Emma Johnson',
      childId: 'child_1',
      timestamp: new Date().getTime() - 7200000, // 2 hours ago
      read: true,
      actionRequired: false,
      location: 'Riverside Sports Complex',
      coach: 'Coach Martinez',
    },
    {
      id: '5',
      type: 'safety',
      priority: 'high',
      title: '⚠️ Late Check-out Alert',
      message: 'Alex has not been picked up 15 minutes after practice ended. Please confirm pickup status.',
      childName: 'Alex Johnson',
      childId: 'child_2',
      timestamp: new Date().getTime() - 10800000, // 3 hours ago
      read: false,
      actionRequired: true,
      location: 'Community Center Gym',
      coach: 'Coach Williams',
    },
  ];

  const [filteredNotifications, setFilteredNotifications] = useState(sampleNotifications);

  // Categories for filtering
  const categories = [
    { id: 'all', label: 'All', icon: 'notifications', count: sampleNotifications.length },
    { id: 'safety', label: 'Safety', icon: 'security', count: sampleNotifications.filter(n => n.type === 'safety').length },
    { id: 'emergency', label: 'Emergency', icon: 'warning', count: sampleNotifications.filter(n => n.type === 'emergency').length },
    { id: 'attendance', label: 'Attendance', icon: 'check-circle', count: sampleNotifications.filter(n => n.type === 'attendance').length },
    { id: 'behavior', label: 'Behavior', icon: 'star', count: sampleNotifications.filter(n => n.type === 'behavior').length },
  ];

  // Effects
  useEffect(() => {
    filterNotifications();
  }, [selectedCategory, searchQuery]);

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchParentNotifications());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh notifications');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const filterNotifications = () => {
    let filtered = sampleNotifications;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(notification => notification.type === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.childName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const handleNotificationPress = (notification) => {
    Vibration.vibrate(50);
    
    if (!notification.read) {
      // Mark as read
      // dispatch(markNotificationAsRead(notification.id));
    }

    if (notification.actionRequired) {
      showActionRequiredAlert(notification);
    } else {
      showNotificationDetails(notification);
    }
  };

  const showActionRequiredAlert = (notification) => {
    Alert.alert(
      notification.title,
      notification.message,
      [
        {
          text: 'Dismiss',
          style: 'cancel',
        },
        {
          text: 'Take Action',
          onPress: () => handleNotificationAction(notification),
        },
      ]
    );
  };

  const showNotificationDetails = (notification) => {
    Alert.alert(
      notification.title,
      `${notification.message}\n\nLocation: ${notification.location}\nCoach: ${notification.coach}\nTime: ${formatTime(notification.timestamp)}`,
      [{ text: 'OK' }]
    );
  };

  const handleNotificationAction = (notification) => {
    switch (notification.type) {
      case 'emergency':
        // Navigate to emergency procedures or contact coach
        navigation.navigate('EmergencyContact', { notification });
        break;
      case 'safety':
        // Navigate to child tracking or contact coach
        navigation.navigate('ChildTracking', { childId: notification.childId });
        break;
      default:
        Alert.alert('Action', 'Feature coming soon!');
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date().getTime();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return COLORS.error;
      case 'high':
        return COLORS.warning;
      case 'medium':
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'safety':
        return 'security';
      case 'emergency':
        return 'warning';
      case 'attendance':
        return 'check-circle';
      case 'behavior':
        return 'star';
      case 'coach':
        return 'message';
      default:
        return 'notifications';
    }
  };

  const renderNotificationCard = (notification) => (
    <TouchableOpacity
      key={notification.id}
      onPress={() => handleNotificationPress(notification)}
      activeOpacity={0.7}
    >
      <Surface style={[styles.notificationCard, !notification.read && styles.unreadCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Avatar.Icon
              size={40}
              icon={getTypeIcon(notification.type)}
              style={[styles.typeIcon, { backgroundColor: getPriorityColor(notification.priority) }]}
            />
            <View style={styles.titleContainer}>
              <Text style={[TEXT_STYLES.h3, styles.notificationTitle]}>
                {notification.title}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.childName]}>
                {notification.childName} • {formatTime(notification.timestamp)}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {!notification.read && <Badge style={styles.unreadBadge} />}
            {notification.actionRequired && (
              <Icon name="priority-high" size={20} color={COLORS.error} />
            )}
          </View>
        </View>
        
        <Text style={[TEXT_STYLES.body, styles.notificationMessage]}>
          {notification.message}
        </Text>
        
        <View style={styles.cardFooter}>
          <Chip
            icon="location-on"
            textStyle={styles.chipText}
            style={styles.locationChip}
          >
            {notification.location}
          </Chip>
          <Chip
            icon="person"
            textStyle={styles.chipText}
            style={styles.coachChip}
          >
            {notification.coach}
          </Chip>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderSettingsModal = () => (
    <Portal>
      <Modal
        visible={showSettingsModal}
        onDismiss={() => setShowSettingsModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Surface style={styles.modalSurface}>
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
              Notification Settings
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowSettingsModal(false)}
            />
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              Safety & Security 🔒
            </Text>
            
            {Object.entries(notificationSettings).map(([key, value]) => (
              <View key={key} style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={TEXT_STYLES.body}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, styles.settingDescription]}>
                    {getSettingDescription(key)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                  style={[styles.toggle, value && styles.toggleActive]}
                >
                  <Icon
                    name={value ? 'check' : 'close'}
                    size={16}
                    color={value ? COLORS.success : COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          
          <Button
            mode="contained"
            onPress={() => {
              setShowSettingsModal(false);
              Alert.alert('Settings Saved', 'Your notification preferences have been updated.');
            }}
            style={styles.saveButton}
          >
            Save Settings
          </Button>
        </Surface>
      </Modal>
    </Portal>
  );

  const getSettingDescription = (key) => {
    const descriptions = {
      safetyAlerts: 'Arrival, departure, and location updates',
      attendanceUpdates: 'Practice and session attendance confirmations',
      performanceReports: 'Progress and achievement notifications',
      coachMessages: 'Direct messages from coaches and trainers',
      emergencyAlerts: 'Critical safety and emergency notifications',
      behaviorReports: 'Behavior and conduct updates',
      scheduleChanges: 'Training schedule modifications',
      paymentReminders: 'Payment due dates and confirmations',
    };
    return descriptions[key] || '';
  };

  // Unread count
  const unreadCount = sampleNotifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-back"
              size={24}
              iconColor="white"
              onPress={() => navigation.goBack()}
            />
            <View style={styles.headerTitleContainer}>
              <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
                Safety Notifications
              </Text>
              {unreadCount > 0 && (
                <Badge style={styles.headerBadge}>{unreadCount}</Badge>
              )}
            </View>
            <IconButton
              icon="settings"
              size={24}
              iconColor="white"
              onPress={() => setShowSettingsModal(true)}
            />
          </View>
          
          <Searchbar
            placeholder="Search notifications..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
            >
              <Icon
                name={category.icon}
                size={16}
                color={selectedCategory === category.id ? 'white' : COLORS.primary}
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategory === category.id && styles.categoryLabelActive,
                ]}
              >
                {category.label}
              </Text>
              {category.count > 0 && (
                <Badge
                  style={[
                    styles.categoryBadge,
                    selectedCategory === category.id && styles.categoryBadgeActive,
                  ]}
                >
                  {category.count}
                </Badge>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Emergency Banner */}
        {filteredNotifications.some(n => n.type === 'emergency' && !n.read) && (
          <Surface style={styles.emergencyBanner}>
            <LinearGradient
              colors={[COLORS.error, '#c62828']}
              style={styles.emergencyGradient}
            >
              <Icon name="warning" size={24} color="white" />
              <View style={styles.emergencyText}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                  Emergency Alerts Active
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
                  Tap notifications for immediate action
                </Text>
              </View>
            </LinearGradient>
          </Surface>
        )}

        {/* Notifications List */}
        <View style={styles.notificationsContainer}>
          {filteredNotifications.length === 0 ? (
            <Surface style={styles.emptyState}>
              <Icon
                name="notifications-none"
                size={64}
                color={COLORS.textSecondary}
                style={styles.emptyIcon}
              />
              <Text style={[TEXT_STYLES.h3, styles.emptyTitle]}>
                No notifications found
              </Text>
              <Text style={[TEXT_STYLES.body, styles.emptyDescription]}>
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'All caught up! Your children are safe and sound. 🛡️'}
              </Text>
            </Surface>
          ) : (
            filteredNotifications.map(renderNotificationCard)
          )}
        </View>

        {/* Quick Actions */}
        <Surface style={styles.quickActions}>
          <Text style={[TEXT_STYLES.h3, styles.quickActionsTitle]}>
            Quick Actions
          </Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('ChildTracking')}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.actionGradient}
              >
                <Icon name="my-location" size={24} color="white" />
              </LinearGradient>
              <Text style={[TEXT_STYLES.caption, styles.actionLabel]}>
                Track Location
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('EmergencyContacts')}
            >
              <LinearGradient
                colors={[COLORS.error, '#c62828']}
                style={styles.actionGradient}
              >
                <Icon name="emergency" size={24} color="white" />
              </LinearGradient>
              <Text style={[TEXT_STYLES.caption, styles.actionLabel]}>
                Emergency
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('ChatWithCoach')}
            >
              <LinearGradient
                colors={[COLORS.success, '#388e3c']}
                style={styles.actionGradient}
              >
                <Icon name="chat" size={24} color="white" />
              </LinearGradient>
              <Text style={[TEXT_STYLES.caption, styles.actionLabel]}>
                Contact Coach
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowSettingsModal(true)}
            >
              <LinearGradient
                colors={[COLORS.warning, '#f57c00']}
                style={styles.actionGradient}
              >
                <Icon name="tune" size={24} color="white" />
              </LinearGradient>
              <Text style={[TEXT_STYLES.caption, styles.actionLabel]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>
      </ScrollView>

      {renderSettingsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    marginRight: SPACING.sm,
  },
  headerBadge: {
    backgroundColor: COLORS.error,
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    elevation: 0,
    borderRadius: 12,
  },
  searchInput: {
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    marginVertical: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    marginRight: SPACING.xs,
  },
  categoryLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  categoryLabelActive: {
    color: 'white',
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    fontSize: 10,
  },
  categoryBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  emergencyBanner: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  emergencyText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  notificationsContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  notificationCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    padding: SPACING.md,
    elevation: 2,
    backgroundColor: COLORS.surface,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: '#f8f9ff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  typeIcon: {
    marginRight: SPACING.md,
  },
  titleContainer: {
    flex: 1,
  },
  notificationTitle: {
    marginBottom: SPACING.xs / 2,
  },
  childName: {
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    width: 8,
    height: 8,
  },
  notificationMessage: {
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  locationChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    height: 28,
  },
  coachChip: {
    backgroundColor: 'rgba(118, 75, 162, 0.1)',
    height: 28,
  },
  chipText: {
    fontSize: 11,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  emptyIcon: {
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  quickActions: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  quickActionsTitle: {
    marginBottom: SPACING.md,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionLabel: {
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalSurface: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    flex: 1,
  },
  modalScrollView: {
    padding: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingDescription: {
    marginTop: SPACING.xs / 2,
  },
  toggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.success,
  },
  saveButton: {
    margin: SPACING.md,
    backgroundColor: COLORS.primary,
  },
});

export default ParentNotifications;
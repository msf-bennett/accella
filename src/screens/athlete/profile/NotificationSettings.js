import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Vibration,
  Platform,
} from 'react-native';
import { 
  Card,
  Button,
  Switch,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Modal,
  TextInput,
  Chip,
  Divider,
  List,
  RadioButton,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Notifications from 'expo-notifications';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const NotificationSettings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, notificationSettings } = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  // Notification settings state
  const [settings, setSettings] = useState({
    // Master Controls
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    
    // Training & Sessions
    sessionReminders: true,
    sessionCancellations: true,
    newSessionAssigned: true,
    trainingPlanUpdates: true,
    performanceGoals: true,
    
    // Health & Medical
    medicalReminders: true,
    injuryAlerts: true,
    clearanceExpiry: true,
    healthCheckups: true,
    
    // Social & Communication
    coachMessages: true,
    teamUpdates: true,
    achievementUnlocked: true,
    socialInteractions: true,
    
    // Performance & Progress
    weeklyReports: true,
    milestoneReached: true,
    performanceInsights: true,
    progressUpdates: true,
    
    // Scheduling & Events
    upcomingEvents: true,
    scheduleChanges: true,
    competitionUpdates: true,
    
    // Payment & Billing
    paymentReminders: true,
    subscriptionUpdates: false,
    
    // Quiet Hours
    quietHoursEnabled: true,
    quietStartTime: '22:00',
    quietEndTime: '07:00',
    
    // Frequency Settings
    summaryFrequency: 'weekly', // daily, weekly, monthly
    reminderTiming: '30', // minutes before
    
    // Advanced Settings
    vibration: true,
    sound: true,
    badge: true,
    lockScreen: true,
    priority: 'normal', // low, normal, high
  });

  const [notificationHistory, setNotificationHistory] = useState([
    {
      id: 1,
      type: 'session_reminder',
      title: 'Training Session Reminder',
      message: 'Football practice starts in 30 minutes',
      timestamp: '2024-08-22T14:30:00Z',
      read: true,
      category: 'Training'
    },
    {
      id: 2,
      type: 'achievement',
      title: 'New Achievement! 🏆',
      message: 'You completed 10 consecutive training sessions',
      timestamp: '2024-08-22T10:15:00Z',
      read: true,
      category: 'Achievement'
    },
    {
      id: 3,
      type: 'coach_message',
      title: 'Message from Coach Johnson',
      message: 'Great work in today\'s practice! Keep it up.',
      timestamp: '2024-08-21T18:45:00Z',
      read: false,
      category: 'Communication'
    },
    {
      id: 4,
      type: 'medical_reminder',
      title: 'Medical Clearance Expiring',
      message: 'Your cardiac screening expires in 7 days',
      timestamp: '2024-08-21T09:00:00Z',
      read: false,
      category: 'Medical'
    }
  ]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    checkNotificationPermission();
    loadNotificationSettings();
  }, []);

  const checkNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      // Check Android notification permission
      setHasPermission(true); // Simplified for demo
    } else {
      // Check iOS notification permission
      setHasPermission(true); // Simplified for demo
    }
  };

  const requestNotificationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        // Request Android notification permission
        Alert.alert('Permission Granted! 🎉', 'You will now receive push notifications.');
      } else {
        // Request iOS notification permission
        Alert.alert('Permission Granted! 🎉', 'You will now receive push notifications.');
      }
      setHasPermission(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to enable notifications. Please check your device settings.');
    }
  };

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, dispatch action to load settings
    } catch (error) {
      Alert.alert('Error', 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotificationSettings();
    setRefreshing(false);
  }, []);

  const updateSetting = async (key, value) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      
      // Vibration feedback for important toggles
      if (['pushNotifications', 'emailNotifications'].includes(key)) {
        Vibration.vibrate(value ? 100 : 50);
      }
      
      // Show confirmation for master controls
      if (key === 'pushNotifications' && !value) {
        Alert.alert(
          'Notifications Disabled 📵',
          'You won\'t receive any push notifications. You can re-enable them anytime.',
          [{ text: 'Got it', style: 'default' }]
        );
      }
      
      // In real app, dispatch action to save settings
      // dispatch(updateNotificationSetting({ key, value }));
      
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
      // Revert the change
      setSettings(prev => ({ ...prev, [key]: !value }));
    }
  };

  const testNotification = (type) => {
    const testMessages = {
      training: {
        title: 'Training Reminder 🏃‍♂️',
        message: 'Your football practice starts in 30 minutes at the main field.'
      },
      achievement: {
        title: 'New Achievement! 🏆',
        message: 'Congratulations! You\'ve completed your weekly training goal.'
      },
      medical: {
        title: 'Medical Reminder 🏥',
        message: 'Your annual physical exam is due next week.'
      },
      coach: {
        title: 'Coach Message 💬',
        message: 'Great improvement in today\'s session! Keep up the excellent work.'
      }
    };

    const notification = testMessages[type];
    Alert.alert(notification.title, notification.message);
    Vibration.vibrate(200);
  };

  const getNotificationCount = (category) => {
    return notificationHistory.filter(n => n.category === category && !n.read).length;
  };

  const renderPermissionCard = () => {
    if (hasPermission) return null;

    return (
      <Card style={[styles.card, styles.permissionCard]}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E53']}
          style={styles.permissionGradient}
        >
          <View style={styles.permissionContent}>
            <Icon name="notifications-off" size={48} color="white" />
            <Text style={styles.permissionTitle}>Enable Notifications</Text>
            <Text style={styles.permissionText}>
              Allow notifications to stay updated with your training schedule, messages, and important reminders.
            </Text>
            <Button
              mode="contained"
              onPress={requestNotificationPermission}
              style={styles.permissionButton}
              labelStyle={{ color: COLORS.primary }}
            >
              Enable Notifications
            </Button>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  const renderMasterControls = () => (
    <Card style={styles.card}>
      <Card.Title
        title="Master Controls 🎛️"
        titleStyle={styles.cardTitle}
        left={() => <Avatar.Icon icon="tune" size={40} />}
      />
      <Card.Content>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDesc}>Receive notifications on this device</Text>
          </View>
          <Switch
            value={settings.pushNotifications && hasPermission}
            onValueChange={(value) => updateSetting('pushNotifications', value)}
            disabled={!hasPermission}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Email Notifications</Text>
            <Text style={styles.settingDesc}>Receive notifications via email</Text>
          </View>
          <Switch
            value={settings.emailNotifications}
            onValueChange={(value) => updateSetting('emailNotifications', value)}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>SMS Notifications</Text>
            <Text style={styles.settingDesc}>Receive important alerts via SMS</Text>
          </View>
          <Switch
            value={settings.smsNotifications}
            onValueChange={(value) => updateSetting('smsNotifications', value)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderNotificationCategory = (title, icon, settings_keys, description) => (
    <Card style={styles.card}>
      <Card.Title
        title={title}
        titleStyle={styles.cardTitle}
        subtitle={description}
        left={() => <Avatar.Icon icon={icon} size={40} />}
        right={() => {
          const unreadCount = getNotificationCount(title.split(' ')[0]);
          return unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          ) : null;
        }}
      />
      <Card.Content>
        {settings_keys.map(({ key, label, desc }) => (
          <View key={key} style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{label}</Text>
              <Text style={styles.settingDesc}>{desc}</Text>
            </View>
            <Switch
              value={settings[key]}
              onValueChange={(value) => updateSetting(key, value)}
              disabled={!settings.pushNotifications && !hasPermission}
            />
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderQuietHours = () => (
    <Card style={styles.card}>
      <Card.Title
        title="Quiet Hours 🌙"
        titleStyle={styles.cardTitle}
        subtitle="Set times when notifications are paused"
        left={() => <Avatar.Icon icon="bedtime" size={40} />}
      />
      <Card.Content>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Enable Quiet Hours</Text>
            <Text style={styles.settingDesc}>Pause non-urgent notifications during set hours</Text>
          </View>
          <Switch
            value={settings.quietHoursEnabled}
            onValueChange={(value) => updateSetting('quietHoursEnabled', value)}
          />
        </View>

        {settings.quietHoursEnabled && (
          <>
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <Surface style={styles.timeButton}>
                  <Text style={styles.timeText}>{settings.quietStartTime}</Text>
                </Surface>
              </View>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>End Time</Text>
                <Surface style={styles.timeButton}>
                  <Text style={styles.timeText}>{settings.quietEndTime}</Text>
                </Surface>
              </View>
            </View>
          </>
        )}
      </Card.Content>
    </Card>
  );

  const renderAdvancedSettings = () => (
    <Card style={styles.card}>
      <Card.Title
        title="Advanced Settings ⚙️"
        titleStyle={styles.cardTitle}
        left={() => <Avatar.Icon icon="settings" size={40} />}
      />
      <Card.Content>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Vibration</Text>
            <Text style={styles.settingDesc}>Vibrate device for notifications</Text>
          </View>
          <Switch
            value={settings.vibration}
            onValueChange={(value) => updateSetting('vibration', value)}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Sound</Text>
            <Text style={styles.settingDesc}>Play notification sounds</Text>
          </View>
          <Switch
            value={settings.sound}
            onValueChange={(value) => updateSetting('sound', value)}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Lock Screen</Text>
            <Text style={styles.settingDesc}>Show notifications on lock screen</Text>
          </View>
          <Switch
            value={settings.lockScreen}
            onValueChange={(value) => updateSetting('lockScreen', value)}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>App Badge</Text>
            <Text style={styles.settingDesc}>Show notification count on app icon</Text>
          </View>
          <Switch
            value={settings.badge}
            onValueChange={(value) => updateSetting('badge', value)}
          />
        </View>

        <Divider style={styles.divider} />

        <List.Item
          title="Reminder Timing"
          description={`${settings.reminderTiming} minutes before`}
          left={() => <List.Icon icon="schedule" />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => Alert.alert('Settings', 'Reminder timing options coming soon!')}
        />

        <List.Item
          title="Summary Frequency"
          description={`${settings.summaryFrequency.charAt(0).toUpperCase() + settings.summaryFrequency.slice(1)} reports`}
          left={() => <List.Icon icon="summarize" />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => Alert.alert('Settings', 'Summary frequency options coming soon!')}
        />
      </Card.Content>
    </Card>
  );

  const renderTestNotifications = () => (
    <Card style={styles.card}>
      <Card.Title
        title="Test Notifications 🧪"
        titleStyle={styles.cardTitle}
        subtitle="Preview different notification types"
        left={() => <Avatar.Icon icon="bug-report" size={40} />}
      />
      <Card.Content>
        <View style={styles.testGrid}>
          <Button
            mode="outlined"
            icon="sports"
            onPress={() => testNotification('training')}
            style={styles.testButton}
          >
            Training
          </Button>
          <Button
            mode="outlined"
            icon="jump-rope"
            onPress={() => testNotification('achievement')}
            style={styles.testButton}
          >
            Achievement
          </Button>
          <Button
            mode="outlined"
            icon="medical-services"
            onPress={() => testNotification('medical')}
            style={styles.testButton}
          >
            Medical
          </Button>
          <Button
            mode="outlined"
            icon="message"
            onPress={() => testNotification('coach')}
            style={styles.testButton}
          >
            Coach Message
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderRecentNotifications = () => (
    <Card style={styles.card}>
      <Card.Title
        title="Recent Notifications 📬"
        titleStyle={styles.cardTitle}
        right={() => (
          <IconButton
            icon="clear-all"
            onPress={() => Alert.alert('Clear All', 'Feature coming soon!')}
          />
        )}
      />
      <Card.Content>
        {notificationHistory.slice(0, 5).map(notification => (
          <Surface key={notification.id} style={styles.notificationItem}>
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, !notification.read && styles.unreadTitle]}>
                {notification.title}
              </Text>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationTime}>
                {new Date(notification.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
            {!notification.read && <View style={styles.unreadDot} />}
          </Surface>
        ))}
        
        <Button
          mode="text"
          onPress={() => navigation.navigate('NotificationHistory')}
          style={styles.viewAllButton}
        >
          View All Notifications
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        {renderPermissionCard()}
        {renderMasterControls()}
        
        {renderNotificationCategory(
          "Training & Sessions 🏃‍♂️",
          "sports",
          [
            { key: 'sessionReminders', label: 'Session Reminders', desc: 'Get notified before training sessions' },
            { key: 'sessionCancellations', label: 'Cancellations', desc: 'Alert when sessions are cancelled' },
            { key: 'newSessionAssigned', label: 'New Sessions', desc: 'When new sessions are assigned to you' },
            { key: 'trainingPlanUpdates', label: 'Plan Updates', desc: 'Changes to your training program' },
          ],
          "Stay updated with your training schedule"
        )}

        {renderNotificationCategory(
          "Health & Medical 🏥",
          "medical-services",
          [
            { key: 'medicalReminders', label: 'Medical Reminders', desc: 'Checkups and appointment reminders' },
            { key: 'clearanceExpiry', label: 'Clearance Expiry', desc: 'When medical clearances expire' },
            { key: 'injuryAlerts', label: 'Injury Alerts', desc: 'Important health and safety notifications' },
            { key: 'healthCheckups', label: 'Health Checkups', desc: 'Scheduled health assessment reminders' },
          ],
          "Important health and medical notifications"
        )}

        {renderNotificationCategory(
          "Communication 💬",
          "message",
          [
            { key: 'coachMessages', label: 'Coach Messages', desc: 'Direct messages from your coaches' },
            { key: 'teamUpdates', label: 'Team Updates', desc: 'Team announcements and news' },
            { key: 'socialInteractions', label: 'Social Activity', desc: 'Comments, likes, and mentions' },
          ],
          "Messages and social interactions"
        )}

        {renderNotificationCategory(
          "Progress & Achievement 🏆",
          "jump-rope",
          [
            { key: 'achievementUnlocked', label: 'Achievements', desc: 'When you unlock new achievements' },
            { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Your weekly progress summary' },
            { key: 'milestoneReached', label: 'Milestones', desc: 'When you reach important milestones' },
            { key: 'performanceInsights', label: 'Performance Insights', desc: 'AI-generated performance tips' },
          ],
          "Track your progress and celebrate wins"
        )}

        {renderQuietHours()}
        {renderAdvancedSettings()}
        {renderTestNotifications()}
        {renderRecentNotifications()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.xl * 2,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  card: {
    marginBottom: SPACING.lg,
    elevation: 2,
    borderRadius: 12,
  },
  cardTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  permissionCard: {
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  permissionGradient: {
    padding: SPACING.xl,
  },
  permissionContent: {
    alignItems: 'center',
  },
  permissionTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  permissionText: {
    ...TEXT_STYLES.body,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: 'white',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingDesc: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
    lineHeight: 18,
  },
  badge: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  timeItem: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  timeLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  timeButton: {
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  timeText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  testGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  testButton: {
    width: '48%',
    marginBottom: SPACING.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  notificationTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  viewAllButton: {
    marginTop: SPACING.sm,
  },
});

export default NotificationSettings;
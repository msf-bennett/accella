import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Switch,
  Platform,
  Linking,
  Vibration,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Divider,
  List,
  RadioButton,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// Design system imports
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const NotificationSettings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { notificationSettings, loading } = useSelector(state => state.settings);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState({
    // Push Notifications
    pushEnabled: true,
    messageNotifications: true,
    sessionReminders: true,
    attendanceAlerts: true,
    paymentNotifications: true,
    performanceUpdates: true,
    teamAnnouncements: true,
    parentMessages: true,
    
    // Email Notifications
    emailEnabled: true,
    dailyDigest: true,
    weeklyReports: true,
    monthlyAnalytics: true,
    systemUpdates: true,
    marketingEmails: false,
    
    // SMS Notifications
    smsEnabled: false,
    emergencyOnly: true,
    sessionCancellations: true,
    
    // Timing Settings
    quietHoursEnabled: true,
    quietHoursStart: new Date(2024, 0, 1, 22, 0), // 10:00 PM
    quietHoursEnd: new Date(2024, 0, 1, 7, 0),   // 7:00 AM
    
    // Sound & Vibration
    soundEnabled: true,
    vibrationEnabled: true,
    notificationSound: 'default',
    
    // Frequency Settings
    messageFrequency: 'instant',
    digestFrequency: 'daily',
    reportFrequency: 'weekly',
  });

  const [showTimePickerStart, setShowTimePickerStart] = useState(false);
  const [showTimePickerEnd, setShowTimePickerEnd] = useState(false);

  // Notification categories with detailed settings
  const notificationCategories = [
    {
      id: 'messages',
      title: 'Messages & Communication',
      icon: 'chat',
      description: 'Direct messages, team chat, and parent communications',
      settings: [
        {
          key: 'messageNotifications',
          title: 'New Messages',
          subtitle: 'Get notified when you receive new messages',
        },
        {
          key: 'parentMessages',
          title: 'Parent Messages',
          subtitle: 'Notifications from parents and guardians',
        },
        {
          key: 'teamAnnouncements',
          title: 'Team Announcements',
          subtitle: 'Important team-wide communications',
        },
      ],
    },
    {
      id: 'sessions',
      title: 'Training Sessions',
      icon: 'fitness-center',
      description: 'Session reminders, attendance, and updates',
      settings: [
        {
          key: 'sessionReminders',
          title: 'Session Reminders',
          subtitle: 'Reminders before training sessions start',
        },
        {
          key: 'attendanceAlerts',
          title: 'Attendance Alerts',
          subtitle: 'When players mark attendance or are absent',
        },
        {
          key: 'performanceUpdates',
          title: 'Performance Updates',
          subtitle: 'Player performance and progress notifications',
        },
      ],
    },
    {
      id: 'business',
      title: 'Business & Payments',
      icon: 'business',
      description: 'Payment confirmations, bookings, and revenue updates',
      settings: [
        {
          key: 'paymentNotifications',
          title: 'Payment Notifications',
          subtitle: 'Payment confirmations and booking updates',
        },
      ],
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: 'analytics',
      description: 'Performance reports, insights, and summaries',
      settings: [
        {
          key: 'dailyDigest',
          title: 'Daily Digest',
          subtitle: 'Daily summary of activities and updates',
        },
        {
          key: 'weeklyReports',
          title: 'Weekly Reports',
          subtitle: 'Comprehensive weekly performance reports',
        },
        {
          key: 'monthlyAnalytics',
          title: 'Monthly Analytics',
          subtitle: 'Detailed monthly insights and trends',
        },
      ],
    },
  ];

  // Frequency options
  const frequencyOptions = [
    { value: 'instant', label: 'Instant', description: 'Notify me immediately' },
    { value: 'hourly', label: 'Hourly', description: 'Bundle notifications hourly' },
    { value: 'daily', label: 'Daily', description: 'Send once per day' },
    { value: 'weekly', label: 'Weekly', description: 'Weekly summary only' },
    { value: 'never', label: 'Never', description: 'Turn off these notifications' },
  ];

  const soundOptions = [
    { value: 'default', label: 'Default', description: 'System default sound' },
    { value: 'coach_whistle', label: 'Coach Whistle', description: 'Sports-themed sound' },
    { value: 'chime', label: 'Chime', description: 'Gentle notification sound' },
    { value: 'ping', label: 'Ping', description: 'Short ping sound' },
    { value: 'silent', label: 'Silent', description: 'Visual notification only' },
  ];

  // Effects
  useEffect(() => {
    loadNotificationSettings();
    requestNotificationPermissions();
  }, []);

  // Handlers
  const loadNotificationSettings = useCallback(async () => {
    try {
      // Simulate API call to load current settings
      // dispatch(loadNotificationSettings());
    } catch (error) {
      Alert.alert('Error', 'Failed to load notification settings');
    }
  }, [dispatch]);

  const requestNotificationPermissions = async () => {
    if (Platform.OS === 'ios') {
      // Request iOS notification permissions
      // const { status } = await Notifications.requestPermissionsAsync();
      // if (status !== 'granted') {
      //   Alert.alert('Permission Required', 'Please enable notifications in Settings');
      // }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotificationSettings();
    setRefreshing(false);
  }, [loadNotificationSettings]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Save to backend
    // dispatch(updateNotificationSetting(key, value));
    
    // Provide haptic feedback
    Vibration.vibrate(50);
  };

  const handleSaveSettings = async () => {
    try {
      // dispatch(saveNotificationSettings(settings));
      Alert.alert('Success', 'Notification settings saved successfully! ✅');
      Vibration.vibrate([50, 50, 50]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleTestNotification = () => {
    Alert.alert(
      'Test Notification',
      'This is how your notifications will look! 📱',
      [{ text: 'OK', onPress: () => Vibration.vibrate(100) }]
    );
  };

  const openSystemSettings = () => {
    Alert.alert(
      'System Settings',
      'Open your device settings to manage notification permissions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render functions
  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Notification Settings</Text>
            <Text style={styles.headerSubtitle}>
              Manage how and when you receive notifications
            </Text>
          </View>
          <Avatar.Icon 
            size={50} 
            icon="notifications" 
            style={styles.avatar}
          />
        </View>
      </View>
    </LinearGradient>
  );

  const renderQuickActions = () => (
    <Surface style={styles.quickActionsCard}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={handleTestNotification}
        >
          <Icon name="notifications-active" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Test Notification</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickAction}
          onPress={openSystemSettings}
        >
          <Icon name="settings" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>System Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => handleSettingChange('pushEnabled', !settings.pushEnabled)}
        >
          <Icon 
            name={settings.pushEnabled ? 'notifications-off' : 'notifications'} 
            size={24} 
            color={settings.pushEnabled ? COLORS.error : COLORS.success} 
          />
          <Text style={styles.quickActionText}>
            {settings.pushEnabled ? 'Disable All' : 'Enable All'}
          </Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );

  const renderMainSettings = () => (
    <Surface style={styles.settingsCard}>
      <Text style={styles.sectionTitle}>Notification Types</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Icon name="notifications" size={24} color={COLORS.primary} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingSubtitle}>
              Receive notifications on this device
            </Text>
          </View>
        </View>
        <Switch
          value={settings.pushEnabled}
          onValueChange={(value) => handleSettingChange('pushEnabled', value)}
          trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
          thumbColor={settings.pushEnabled ? COLORS.primary : COLORS.textSecondary}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Icon name="email" size={24} color={COLORS.primary} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Email Notifications</Text>
            <Text style={styles.settingSubtitle}>
              Receive notifications via email
            </Text>
          </View>
        </View>
        <Switch
          value={settings.emailEnabled}
          onValueChange={(value) => handleSettingChange('emailEnabled', value)}
          trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
          thumbColor={settings.emailEnabled ? COLORS.primary : COLORS.textSecondary}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Icon name="sms" size={24} color={COLORS.primary} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>SMS Notifications</Text>
            <Text style={styles.settingSubtitle}>
              Receive important alerts via SMS
            </Text>
          </View>
        </View>
        <Switch
          value={settings.smsEnabled}
          onValueChange={(value) => handleSettingChange('smsEnabled', value)}
          trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
          thumbColor={settings.smsEnabled ? COLORS.primary : COLORS.textSecondary}
        />
      </View>
    </Surface>
  );

  const renderNotificationCategories = () => {
    if (!settings.pushEnabled) {
      return (
        <Surface style={styles.disabledCard}>
          <Icon name="notifications-off" size={48} color={COLORS.textSecondary} />
          <Text style={styles.disabledText}>
            Enable push notifications to configure detailed settings
          </Text>
        </Surface>
      );
    }

    return notificationCategories.map((category) => (
      <Surface key={category.id} style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <Icon name={category.icon} size={24} color={COLORS.primary} />
            <View style={styles.categoryText}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
          </View>
        </View>
        
        {category.settings.map((setting, index) => (
          <View key={setting.key}>
            {index > 0 && <Divider style={styles.divider} />}
            <View style={styles.settingItem}>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
              </View>
              <Switch
                value={settings[setting.key]}
                onValueChange={(value) => handleSettingChange(setting.key, value)}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={settings[setting.key] ? COLORS.primary : COLORS.textSecondary}
              />
            </View>
          </View>
        ))}
      </Surface>
    ));
  };

  const renderQuietHours = () => (
    <Surface style={styles.settingsCard}>
      <Text style={styles.sectionTitle}>Quiet Hours</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>Enable Quiet Hours</Text>
          <Text style={styles.settingSubtitle}>
            Pause non-urgent notifications during these hours
          </Text>
        </View>
        <Switch
          value={settings.quietHoursEnabled}
          onValueChange={(value) => handleSettingChange('quietHoursEnabled', value)}
          trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
          thumbColor={settings.quietHoursEnabled ? COLORS.primary : COLORS.textSecondary}
        />
      </View>

      {settings.quietHoursEnabled && (
        <>
          <Divider style={styles.divider} />
          
          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => setShowTimePickerStart(true)}
          >
            <View style={styles.timeSelectorInfo}>
              <Icon name="bedtime" size={24} color={COLORS.primary} />
              <View style={styles.timeSelectorText}>
                <Text style={styles.settingTitle}>Start Time</Text>
                <Text style={styles.settingSubtitle}>Quiet hours begin</Text>
              </View>
            </View>
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>{formatTime(settings.quietHoursStart)}</Text>
              <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
            </View>
          </TouchableOpacity>

          <Divider style={styles.divider} />

          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => setShowTimePickerEnd(true)}
          >
            <View style={styles.timeSelectorInfo}>
              <Icon name="wb-sunny" size={24} color={COLORS.primary} />
              <View style={styles.timeSelectorText}>
                <Text style={styles.settingTitle}>End Time</Text>
                <Text style={styles.settingSubtitle}>Quiet hours end</Text>
              </View>
            </View>
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>{formatTime(settings.quietHoursEnd)}</Text>
              <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
            </View>
          </TouchableOpacity>
        </>
      )}
    </Surface>
  );

  const renderSoundSettings = () => (
    <Surface style={styles.settingsCard}>
      <Text style={styles.sectionTitle}>Sound & Vibration</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Icon name="volume-up" size={24} color={COLORS.primary} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Sound</Text>
            <Text style={styles.settingSubtitle}>Play sound for notifications</Text>
          </View>
        </View>
        <Switch
          value={settings.soundEnabled}
          onValueChange={(value) => handleSettingChange('soundEnabled', value)}
          trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
          thumbColor={settings.soundEnabled ? COLORS.primary : COLORS.textSecondary}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Icon name="vibration" size={24} color={COLORS.primary} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Vibration</Text>
            <Text style={styles.settingSubtitle}>Vibrate for notifications</Text>
          </View>
        </View>
        <Switch
          value={settings.vibrationEnabled}
          onValueChange={(value) => handleSettingChange('vibrationEnabled', value)}
          trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
          thumbColor={settings.vibrationEnabled ? COLORS.primary : COLORS.textSecondary}
        />
      </View>

      {settings.soundEnabled && (
        <>
          <Divider style={styles.divider} />
          <View style={styles.soundSelection}>
            <Text style={styles.subsectionTitle}>Notification Sound</Text>
            {soundOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => handleSettingChange('notificationSound', option.value)}
              >
                <RadioButton
                  value={option.value}
                  status={settings.notificationSound === option.value ? 'checked' : 'unchecked'}
                  color={COLORS.primary}
                />
                <View style={styles.radioText}>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                  <Text style={styles.radioDescription}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </Surface>
  );

  const renderFrequencySettings = () => (
    <Surface style={styles.settingsCard}>
      <Text style={styles.sectionTitle}>Notification Frequency</Text>
      <Text style={styles.sectionDescription}>
        Control how often you receive different types of notifications
      </Text>
      
      <View style={styles.frequencyItem}>
        <Text style={styles.frequencyLabel}>Message Notifications</Text>
        <View style={styles.frequencyChips}>
          {frequencyOptions.map((option) => (
            <Chip
              key={option.value}
              selected={settings.messageFrequency === option.value}
              onPress={() => handleSettingChange('messageFrequency', option.value)}
              style={[
                styles.frequencyChip,
                settings.messageFrequency === option.value && styles.selectedFrequencyChip,
              ]}
              textStyle={[
                styles.frequencyChipText,
                settings.messageFrequency === option.value && styles.selectedFrequencyChipText,
              ]}
              compact
            >
              {option.label}
            </Chip>
          ))}
        </View>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.frequencyItem}>
        <Text style={styles.frequencyLabel}>Daily Digest</Text>
        <View style={styles.frequencyChips}>
          {frequencyOptions.slice(2, 5).map((option) => (
            <Chip
              key={option.value}
              selected={settings.digestFrequency === option.value}
              onPress={() => handleSettingChange('digestFrequency', option.value)}
              style={[
                styles.frequencyChip,
                settings.digestFrequency === option.value && styles.selectedFrequencyChip,
              ]}
              textStyle={[
                styles.frequencyChipText,
                settings.digestFrequency === option.value && styles.selectedFrequencyChipText,
              ]}
              compact
            >
              {option.label}
            </Chip>
          ))}
        </View>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}
      
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
        {renderQuickActions()}
        {renderMainSettings()}
        {renderNotificationCategories()}
        {renderQuietHours()}
        {renderSoundSettings()}
        {renderFrequencySettings()}
        
        <View style={styles.saveButtonContainer}>
          <Button
            mode="contained"
            onPress={handleSaveSettings}
            style={styles.saveButton}
            labelStyle={styles.saveButtonLabel}
            icon="save"
          >
            Save Settings
          </Button>
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      <DateTimePickerModal
        isVisible={showTimePickerStart}
        mode="time"
        onConfirm={(time) => {
          handleSettingChange('quietHoursStart', time);
          setShowTimePickerStart(false);
        }}
        onCancel={() => setShowTimePickerStart(false)}
        date={settings.quietHoursStart}
      />

      <DateTimePickerModal
        isVisible={showTimePickerEnd}
        mode="time"
        onConfirm={(time) => {
          handleSettingChange('quietHoursEnd', time);
          setShowTimePickerEnd(false);
        }}
        onCancel={() => setShowTimePickerEnd(false)}
        date={settings.quietHoursEnd}
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
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    gap: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  quickActionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  sectionDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    minWidth: 80,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  settingText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  settingTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  disabledCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    elevation: 2,
    alignItems: 'center',
  },
  disabledText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  categoryHeader: {
    marginBottom: SPACING.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  categoryTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  categoryDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  timeSelectorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeSelectorText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  subsectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  soundSelection: {
    marginTop: SPACING.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  radioText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  radioLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
  },
  radioDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  frequencyItem: {
    marginBottom: SPACING.lg,
  },
  frequencyLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  frequencyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  frequencyChip: {
    backgroundColor: COLORS.surface,
  },
  selectedFrequencyChip: {
    backgroundColor: COLORS.primary,
  },
  frequencyChipText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  selectedFrequencyChipText: {
    color: 'white',
  },
  saveButtonContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    paddingVertical: SPACING.xs,
  },
  saveButtonLabel: {
    ...TEXT_STYLES.button,
    color: 'white',
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 50,
  },
});

export default NotificationSettings;
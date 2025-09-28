import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Alert,
  Vibration,
} from 'react-native';
import {
  Card,
  Switch,
  Button,
  Surface,
  Chip,
  IconButton,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const NotificationSettings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, selectedChild } = useSelector(state => state.auth);
  const { notificationSettings } = useSelector(state => state.settings);

  const [settings, setSettings] = useState({
    // Training & Sessions
    trainingReminders: true,
    sessionUpdates: true,
    scheduleChanges: true,
    
    // Progress & Performance
    progressReports: true,
    achievementBadges: true,
    weeklyUpdates: true,
    performanceAlerts: true,
    
    // Communication
    coachMessages: true,
    teamAnnouncements: true,
    parentUpdates: true,
    
    // Health & Safety
    injuryAlerts: true,
    attendanceAlerts: true,
    emergencyNotifications: true,
    
    // Social & Engagement
    teammateBirthdays: false,
    socialEvents: true,
    challengeInvites: true,
    
    // System
    appUpdates: false,
    maintenanceAlerts: true,
    securityAlerts: true,
  });

  const [quietHours, setQuietHours] = useState({
    enabled: true,
    startTime: '21:00',
    endTime: '08:00',
  });

  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTimeType, setSelectedTimeType] = useState('start');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved notification settings
    if (notificationSettings && selectedChild) {
      setSettings(prevSettings => ({
        ...prevSettings,
        ...notificationSettings[selectedChild.id],
      }));
    }
  }, [selectedChild, notificationSettings]);

  const handleToggleSetting = (settingKey) => {
    setSettings(prev => ({
      ...prev,
      [settingKey]: !prev[settingKey],
    }));
    
    // Provide haptic feedback
    Vibration.vibrate(50);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dispatch to Redux store
      dispatch({
        type: 'UPDATE_NOTIFICATION_SETTINGS',
        payload: {
          childId: selectedChild.id,
          settings,
          quietHours,
        },
      });

      Alert.alert(
        'Settings Saved! ✅',
        `Notification preferences for ${selectedChild?.firstName} have been updated successfully.`,
        [{ text: 'Great!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'Error Saving Settings',
        'Please check your connection and try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = () => {
    Alert.alert(
      'Test Notification 📱',
      'This is how notifications will appear for your child\'s account.',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const notificationCategories = [
    {
      title: '🏃‍♂️ Training & Sessions',
      subtitle: 'Stay updated on training schedules',
      settings: [
        { key: 'trainingReminders', label: 'Training Reminders', description: '30 minutes before sessions' },
        { key: 'sessionUpdates', label: 'Session Updates', description: 'Changes to training content' },
        { key: 'scheduleChanges', label: 'Schedule Changes', description: 'Cancellations and rescheduling' },
      ],
    },
    {
      title: '📈 Progress & Performance',
      subtitle: 'Track your child\'s development',
      settings: [
        { key: 'progressReports', label: 'Progress Reports', description: 'Weekly performance summaries' },
        { key: 'achievementBadges', label: 'Achievement Badges', description: 'When milestones are reached' },
        { key: 'weeklyUpdates', label: 'Weekly Updates', description: 'Training progress overview' },
        { key: 'performanceAlerts', label: 'Performance Alerts', description: 'Notable improvements or concerns' },
      ],
    },
    {
      title: '💬 Communication',
      subtitle: 'Stay connected with coaches and team',
      settings: [
        { key: 'coachMessages', label: 'Coach Messages', description: 'Direct messages from coaches' },
        { key: 'teamAnnouncements', label: 'Team Announcements', description: 'Important team updates' },
        { key: 'parentUpdates', label: 'Parent Updates', description: 'Updates specifically for parents' },
      ],
    },
    {
      title: '🛡️ Health & Safety',
      subtitle: 'Important alerts for your child\'s wellbeing',
      settings: [
        { key: 'injuryAlerts', label: 'Injury Alerts', description: 'Immediate safety notifications' },
        { key: 'attendanceAlerts', label: 'Attendance Alerts', description: 'Missing session notifications' },
        { key: 'emergencyNotifications', label: 'Emergency Notifications', description: 'Critical safety updates' },
      ],
    },
    {
      title: '🎉 Social & Engagement',
      subtitle: 'Fun and social activities',
      settings: [
        { key: 'teammateBirthdays', label: 'Teammate Birthdays', description: 'Celebrate with the team' },
        { key: 'socialEvents', label: 'Social Events', description: 'Team parties and gatherings' },
        { key: 'challengeInvites', label: 'Challenge Invites', description: 'Fun competitions and games' },
      ],
    },
  ];

  const renderNotificationCategory = (category) => (
    <Card key={category.title} style={styles.categoryCard}>
      <Card.Content>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
          </View>
        </View>

        {category.settings.map((setting, index) => (
          <View key={setting.key}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{setting.label}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              <Switch
                value={settings[setting.key]}
                onValueChange={() => handleToggleSetting(setting.key)}
                color={COLORS.primary}
              />
            </View>
            {index < category.settings.length - 1 && (
              <Divider style={styles.settingDivider} />
            )}
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderQuietHours = () => (
    <Card style={styles.categoryCard}>
      <Card.Content>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryTitle}>🌙 Quiet Hours</Text>
            <Text style={styles.categorySubtitle}>Set notification-free time</Text>
          </View>
          <Switch
            value={quietHours.enabled}
            onValueChange={(value) => setQuietHours(prev => ({ ...prev, enabled: value }))}
            color={COLORS.primary}
          />
        </View>

        {quietHours.enabled && (
          <View style={styles.quietHoursContainer}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>From:</Text>
              <Chip
                mode="outlined"
                onPress={() => {
                  setSelectedTimeType('start');
                  setTimePickerVisible(true);
                }}
                style={styles.timeChip}
              >
                {quietHours.startTime}
              </Chip>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>To:</Text>
              <Chip
                mode="outlined"
                onPress={() => {
                  setSelectedTimeType('end');
                  setTimePickerVisible(true);
                }}
                style={styles.timeChip}
              >
                {quietHours.endTime}
              </Chip>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Notification Settings</Text>
            <Text style={styles.headerSubtitle}>
              {selectedChild ? `Managing ${selectedChild.firstName}'s notifications` : 'Child Account Settings'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Child Info */}
        <Card style={styles.childInfoCard}>
          <Card.Content>
            <View style={styles.childInfo}>
              <View style={styles.childAvatar}>
                <Text style={styles.childInitial}>
                  {selectedChild?.firstName?.charAt(0) || 'C'}
                </Text>
              </View>
              <View style={styles.childDetails}>
                <Text style={styles.childName}>
                  {selectedChild?.firstName} {selectedChild?.lastName}
                </Text>
                <Text style={styles.childAge}>
                  Age {selectedChild?.age} • {selectedChild?.sport || 'Multi-Sport'}
                </Text>
              </View>
              <IconButton
                icon="notifications"
                iconColor={COLORS.primary}
                size={24}
                onPress={handleTestNotification}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Notification Categories */}
        {notificationCategories.map(renderNotificationCategory)}

        {/* Quiet Hours */}
        {renderQuietHours()}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            mode="outlined"
            onPress={handleTestNotification}
            style={styles.testButton}
            icon="play-circle"
          >
            Test Notification
          </Button>
        </View>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <Button
            mode="contained"
            onPress={handleSaveSettings}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            labelStyle={styles.saveButtonLabel}
          >
            {loading ? 'Saving Settings...' : 'Save Notification Settings'}
          </Button>
        </View>

        {/* Help Text */}
        <Surface style={styles.helpCard}>
          <View style={styles.helpContent}>
            <Icon name="info-outline" size={20} color={COLORS.primary} />
            <Text style={styles.helpText}>
              Critical safety notifications will always be delivered, regardless of these settings.
            </Text>
          </View>
        </Surface>
      </ScrollView>

      {/* Time Picker Modal */}
      <Portal>
        <Modal
          visible={timePickerVisible}
          onDismiss={() => setTimePickerVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Text style={styles.modalTitle}>
                Select {selectedTimeType === 'start' ? 'Start' : 'End'} Time
              </Text>
              <Text style={styles.modalSubtitle}>
                Choose when quiet hours should {selectedTimeType === 'start' ? 'begin' : 'end'}
              </Text>
              
              {/* Simple time selection - in real app would use TimePicker */}
              <View style={styles.timeOptions}>
                {['20:00', '21:00', '22:00', '23:00'].map(time => (
                  <Chip
                    key={time}
                    mode={quietHours[selectedTimeType === 'start' ? 'startTime' : 'endTime'] === time ? 'filled' : 'outlined'}
                    onPress={() => {
                      setQuietHours(prev => ({
                        ...prev,
                        [selectedTimeType === 'start' ? 'startTime' : 'endTime']: time,
                      }));
                      setTimePickerVisible(false);
                    }}
                    style={styles.timeOption}
                  >
                    {time}
                  </Chip>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="text"
                  onPress={() => setTimePickerVisible(false)}
                >
                  Cancel
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    fontSize: 20,
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  childInfoCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childInitial: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  childDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  childName: {
    ...TEXT_STYLES.subheading,
    fontSize: 16,
  },
  childAge: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  categoryCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    ...TEXT_STYLES.subheading,
    fontSize: 16,
  },
  categorySubtitle: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    ...TEXT_STYLES.body,
    fontSize: 15,
    fontWeight: '500',
  },
  settingDescription: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  settingDivider: {
    marginVertical: SPACING.sm,
  },
  quietHoursContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  timeLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  timeChip: {
    backgroundColor: 'white',
  },
  quickActions: {
    marginVertical: SPACING.md,
  },
  testButton: {
    borderColor: COLORS.primary,
  },
  saveContainer: {
    marginTop: SPACING.lg,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  saveButtonContent: {
    paddingVertical: SPACING.sm,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  helpCard: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 8,
    elevation: 1,
  },
  helpContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  modalContainer: {
    margin: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.subheading,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  timeOption: {
    margin: SPACING.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
};

export default NotificationSettings;
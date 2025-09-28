import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Text, List, Switch, Button, Surface, Divider, Dialog, Portal, RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../store/reducers/authReducer';
import AuthService from '../../services/AuthService';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';

const SettingsScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      email: false,
      sessionReminders: true,
      progressReports: true,
      coachMessages: true,
    },
    privacy: {
      profileVisibility: 'coaches', // 'public', 'coaches', 'private'
      shareProgress: true,
      allowMessages: true,
    },
    app: {
      darkMode: false,
      language: 'en',
      units: 'metric', // 'metric', 'imperial'
      autoSync: true,
    }
  });

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'pending', 'error'

  useEffect(() => {
    loadSettings();
    checkSyncStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const checkSyncStatus = async () => {
    try {
      const pendingSync = await AsyncStorage.getItem('pending_sync');
      if (pendingSync) {
        const syncData = JSON.parse(pendingSync);
        const hasUnsynced = syncData.some(item => !item.synced);
        setSyncStatus(hasUnsynced ? 'pending' : 'synced');
      }
    } catch (error) {
      setSyncStatus('error');
    }
  };

  const updateNotificationSetting = (key, value) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  const updatePrivacySetting = (key, value) => {
    const newSettings = {
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  const updateAppSetting = (key, value) => {
    const newSettings = {
      ...settings,
      app: {
        ...settings.app,
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  const handleSync = async () => {
    try {
      setSyncStatus('pending');
      await AuthService.syncWithServer();
      setSyncStatus('synced');
      Alert.alert('Success', 'Data synced successfully');
    } catch (error) {
      setSyncStatus('error');
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      dispatch(logout());
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleClearData = async () => {
    try {
      await AsyncStorage.multiRemove([
        'stored_users',
        'user_data',
        'user_token',
        'pending_sync',
        'app_settings',
        'offline_data'
      ]);
      
      Alert.alert('Success', 'All local data cleared', [
        {
          text: 'OK',
          onPress: () => {
            dispatch(logout());
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to clear data');
    }
  };

  const getSyncStatusInfo = () => {
    switch (syncStatus) {
      case 'synced':
        return { icon: 'cloud-check', text: 'All data synced', color: COLORS.success };
      case 'pending':
        return { icon: 'cloud-sync', text: 'Sync pending', color: COLORS.warning };
      case 'error':
        return { icon: 'cloud-off', text: 'Sync failed', color: COLORS.error };
      default:
        return { icon: 'cloud', text: 'Unknown status', color: COLORS.textSecondary };
    }
  };

  const syncInfo = getSyncStatusInfo();

  return (
    <ScrollView style={styles.container}>
      {/* Account Section */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <List.Item
          title={`${user?.firstName} ${user?.lastName}`}
          description={user?.email}
          left={(props) => <List.Icon {...props} icon="account" />}
          onPress={() => navigation.navigate('Profile')}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />
        
        <List.Item
          title="Data Sync"
          description={syncInfo.text}
          left={(props) => <List.Icon {...props} icon={syncInfo.icon} color={syncInfo.color} />}
          onPress={handleSync}
          right={(props) => (
            <Button 
              mode="text" 
              onPress={handleSync}
              loading={syncStatus === 'pending'}>
              Sync
            </Button>
          )}
        />
      </Surface>

      {/* Notifications Section */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <List.Item
          title="Push Notifications"
          description="Receive app notifications"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={settings.notifications.push}
              onValueChange={(value) => updateNotificationSetting('push', value)}
            />
          )}
        />
        
        <List.Item
          title="Session Reminders"
          description="Get notified before workouts"
          left={(props) => <List.Icon {...props} icon="alarm" />}
          right={() => (
            <Switch
              value={settings.notifications.sessionReminders}
              onValueChange={(value) => updateNotificationSetting('sessionReminders', value)}
            />
          )}
        />
        
        <List.Item
          title="Progress Reports"
          description="Weekly training summaries"
          left={(props) => <List.Icon {...props} icon="trending-up" />}
          right={() => (
            <Switch
              value={settings.notifications.progressReports}
              onValueChange={(value) => updateNotificationSetting('progressReports', value)}
            />
          )}
        />
        
        <List.Item
          title="Coach Messages"
          description="Notifications for new messages"
          left={(props) => <List.Icon {...props} icon="message" />}
          right={() => (
            <Switch
              value={settings.notifications.coachMessages}
              onValueChange={(value) => updateNotificationSetting('coachMessages', value)}
            />
          )}
        />
        
        <List.Item
          title="Email Updates"
          description="Receive updates via email"
          left={(props) => <List.Icon {...props} icon="email" />}
          right={() => (
            <Switch
              value={settings.notifications.email}
              onValueChange={(value) => updateNotificationSetting('email', value)}
            />
          )}
        />
      </Surface>

      {/* Privacy Section */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        
        <List.Item
          title="Profile Visibility"
          description={`Visible to ${settings.privacy.profileVisibility}`}
          left={(props) => <List.Icon {...props} icon="eye" />}
          onPress={() => {
            // TODO: Show profile visibility options
            Alert.alert('Profile Visibility', 'Feature coming soon');
          }}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />
        
        <List.Item
          title="Share Progress"
          description="Allow coaches to see your progress"
          left={(props) => <List.Icon {...props} icon="share" />}
          right={() => (
            <Switch
              value={settings.privacy.shareProgress}
              onValueChange={(value) => updatePrivacySetting('shareProgress', value)}
            />
          )}
        />
        
        <List.Item
          title="Allow Messages"
          description="Let coaches and trainers message you"
          left={(props) => <List.Icon {...props} icon="chat" />}
          right={() => (
            <Switch
              value={settings.privacy.allowMessages}
              onValueChange={(value) => updatePrivacySetting('allowMessages', value)}
            />
          )}
        />
      </Surface>

      {/* App Settings Section */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <List.Item
          title="Dark Mode"
          description="Use dark theme"
          left={(props) => <List.Icon {...props} icon="brightness-6" />}
          right={() => (
            <Switch
              value={settings.app.darkMode}
              onValueChange={(value) => updateAppSetting('darkMode', value)}
            />
          )}
        />
        
        <List.Item
          title="Units"
          description={settings.app.units === 'metric' ? 'Metric (kg, km)' : 'Imperial (lbs, miles)'}
          left={(props) => <List.Icon {...props} icon="ruler" />}
          onPress={() => {
            const newUnits = settings.app.units === 'metric' ? 'imperial' : 'metric';
            updateAppSetting('units', newUnits);
          }}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />
        
        <List.Item
          title="Auto Sync"
          description="Automatically sync when online"
          left={(props) => <List.Icon {...props} icon="sync" />}
          right={() => (
            <Switch
              value={settings.app.autoSync}
              onValueChange={(value) => updateAppSetting('autoSync', value)}
            />
          )}
        />
        
        <List.Item
          title="Language"
          description="English"
          left={(props) => <List.Icon {...props} icon="translate" />}
          onPress={() => Alert.alert('Language', 'More languages coming soon')}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />
      </Surface>

      {/* Support Section */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <List.Item
          title="Help & FAQ"
          description="Get help and find answers"
          left={(props) => <List.Icon {...props} icon="help" />}
          onPress={() => Alert.alert('Help', 'Help section coming soon')}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />
        
        <List.Item
          title="Contact Support"
          description="Get in touch with our team"
          left={(props) => <List.Icon {...props} icon="support" />}
          onPress={() => Alert.alert('Contact Support', 'Email: support@acceilla.com')}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />
        
        <List.Item
          title="Rate App"
          description="Help us improve"
          left={(props) => <List.Icon {...props} icon="star" />}
          onPress={() => Alert.alert('Rate App', 'Thank you for your feedback!')}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />
      </Surface>

      {/* Danger Zone */}
      <Surface style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <List.Item
          title="Clear Local Data"
          description="Remove all locally stored data"
          left={(props) => <List.Icon {...props} icon="delete" color={COLORS.warning} />}
          onPress={() => setShowClearDataDialog(true)}
          titleStyle={{ color: COLORS.warning }}
        />
        
        <Divider />
        
        <List.Item
          title="Logout"
          description="Sign out of your account"
          left={(props) => <List.Icon {...props} icon="logout" color={COLORS.error} />}
          onPress={() => setShowLogoutDialog(true)}
          titleStyle={{ color: COLORS.error }}
        />
      </Surface>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to logout? Any unsaved data will be lost.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button 
              onPress={() => {
                setShowLogoutDialog(false);
                handleLogout();
              }}
              textColor={COLORS.error}>
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Clear Data Confirmation Dialog */}
      <Portal>
        <Dialog visible={showClearDataDialog} onDismiss={() => setShowClearDataDialog(false)}>
          <Dialog.Title>Clear Local Data</Dialog.Title>
          <Dialog.Content>
            <Text>
              This will permanently delete all locally stored data including:
              {'\n'}• User profiles
              {'\n'}• Workout history
              {'\n'}• App settings
              {'\n'}• Offline data
              {'\n\n'}This action cannot be undone. Are you sure?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowClearDataDialog(false)}>Cancel</Button>
            <Button 
              onPress={() => {
                setShowClearDataDialog(false);
                handleClearData();
              }}
              textColor={COLORS.warning}>
              Clear Data
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* App Version Info */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>Acceilla v1.2.0</Text>
        <Text style={styles.copyrightText}>© 2024 Acceilla. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  versionText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  copyrightText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    fontSize: 12,
  },
});

export default SettingsScreen;
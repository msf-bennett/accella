import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
  // State management
  const [userProfile, setUserProfile] = useState({
    parentName: '',
    email: '',
    phone: '',
    children: [],
    emergencyContact: '',
    preferredLanguage: 'English',
  });

  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    sessionReminders: true,
    paymentAlerts: true,
    coachMessages: true,
    achievementAlerts: true,
    weeklyReports: true,
    emergencyAlerts: true,
  });

  const [privacy, setPrivacy] = useState({
    shareLocation: false,
    shareProgress: true,
    allowCoachContact: true,
    shareWithAcademies: false,
  });

  const [preferences, setPreferences] = useState({
    autoSync: true,
    offlineMode: true,
    dataUsage: 'wifi', // wifi, mobile, both
    videoQuality: 'high', // low, medium, high
    reminderTime: 30, // minutes before session
    currency: 'USD',
    distanceUnit: 'km', // km, miles
  });

  const [modals, setModals] = useState({
    editProfile: false,
    changePassword: false,
    manageChildren: false,
    dataExport: false,
    deleteAccount: false,
  });

  const [loading, setLoading] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const savedSettings = await AsyncStorage.getItem('parentSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setUserProfile(parsedSettings.userProfile || userProfile);
        setNotifications(parsedSettings.notifications || notifications);
        setPrivacy(parsedSettings.privacy || privacy);
        setPreferences(parsedSettings.preferences || preferences);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const settingsData = {
        userProfile,
        notifications,
        privacy,
        preferences,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem('parentSettings', JSON.stringify(settingsData));
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const toggleModal = (modalName) => {
    setModals(prev => ({
      ...prev,
      [modalName]: !prev[modalName]
    }));
  };

  const updateNotification = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updatePrivacy = (key, value) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all data will be permanently lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Handle account deletion logic here
            Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const handleDataExport = async () => {
    try {
      setLoading(true);
      // Simulate data export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert(
        'Data Export Complete',
        'Your data has been exported and will be sent to your email address within 24 hours.'
      );
      toggleModal('dataExport');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, showArrow = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color="#007AFF" style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && !rightComponent && (
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={saveSettings}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <SectionHeader title="PROFILE" />
        <View style={styles.section}>
          <SettingItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Name, email, phone, emergency contact"
            onPress={() => toggleModal('editProfile')}
          />
          <SettingItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => toggleModal('changePassword')}
          />
          <SettingItem
            icon="people-outline"
            title="Manage Children"
            subtitle={`${userProfile.children.length} children added`}
            onPress={() => toggleModal('manageChildren')}
          />
        </View>

        {/* Notifications Section */}
        <SectionHeader title="NOTIFICATIONS" />
        <View style={styles.section}>
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Allow app to send notifications"
            rightComponent={
              <Switch
                value={notifications.pushNotifications}
                onValueChange={(value) => updateNotification('pushNotifications', value)}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="time-outline"
            title="Session Reminders"
            subtitle="Get notified before sessions"
            rightComponent={
              <Switch
                value={notifications.sessionReminders}
                onValueChange={(value) => updateNotification('sessionReminders', value)}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="card-outline"
            title="Payment Alerts"
            subtitle="Payment due and receipt notifications"
            rightComponent={
              <Switch
                value={notifications.paymentAlerts}
                onValueChange={(value) => updateNotification('paymentAlerts', value)}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="chatbubble-outline"
            title="Coach Messages"
            subtitle="New message notifications"
            rightComponent={
              <Switch
                value={notifications.coachMessages}
                onValueChange={(value) => updateNotification('coachMessages', value)}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="trophy-outline"
            title="Achievement Alerts"
            subtitle="Celebrate your child's progress"
            rightComponent={
              <Switch
                value={notifications.achievementAlerts}
                onValueChange={(value) => updateNotification('achievementAlerts', value)}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              />
            }
            showArrow={false}
          />
        </View>

        {/* Privacy Section */}
        <SectionHeader title="PRIVACY & SECURITY" />
        <View style={styles.section}>
          <SettingItem
            icon="location-outline"
            title="Share Location"
            subtitle="Help find nearby academies"
            rightComponent={
              <Switch
                value={privacy.shareLocation}
                onValueChange={(value) => updatePrivacy('shareLocation', value)}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="analytics-outline"
            title="Share Progress Data"
            subtitle="Allow coaches to view progress"
            rightComponent={
              <Switch
                value={privacy.shareProgress}
                onValueChange={(value) => updatePrivacy('shareProgress', value)}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="call-outline"
            title="Allow Coach Contact"
            subtitle="Coaches can contact you directly"
            rightComponent={
              <Switch
                value={privacy.allowCoachContact}
                onValueChange={(value) => updatePrivacy('allowCoachContact', value)}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              />
            }
            showArrow={false}
          />
        </View>

        {/* App Preferences */}
        <SectionHeader title="APP PREFERENCES" />
        <View style={styles.section}>
          <SettingItem
            icon="sync-outline"
            title="Auto Sync"
            subtitle="Automatically sync data when online"
            rightComponent={
              <Switch
                value={preferences.autoSync}
                onValueChange={(value) => updatePreference('autoSync', value)}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="cloud-offline-outline"
            title="Offline Mode"
            subtitle="Work without internet connection"
            rightComponent={
              <Switch
                value={preferences.offlineMode}
                onValueChange={(value) => updatePreference('offlineMode', value)}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="videocam-outline"
            title="Video Quality"
            subtitle={`Currently: ${preferences.videoQuality}`}
            onPress={() => {
              // Show video quality selector
              Alert.alert('Video Quality', 'Select video quality', [
                { text: 'Low', onPress: () => updatePreference('videoQuality', 'low') },
                { text: 'Medium', onPress: () => updatePreference('videoQuality', 'medium') },
                { text: 'High', onPress: () => updatePreference('videoQuality', 'high') },
                { text: 'Cancel', style: 'cancel' }
              ]);
            }}
          />
          <SettingItem
            icon="globe-outline"
            title="Language"
            subtitle={userProfile.preferredLanguage}
            onPress={() => {
              // Show language selector
              Alert.alert('Language', 'Select preferred language', [
                { text: 'English', onPress: () => setUserProfile(prev => ({...prev, preferredLanguage: 'English'})) },
                { text: 'Spanish', onPress: () => setUserProfile(prev => ({...prev, preferredLanguage: 'Spanish'})) },
                { text: 'French', onPress: () => setUserProfile(prev => ({...prev, preferredLanguage: 'French'})) },
                { text: 'Cancel', style: 'cancel' }
              ]);
            }}
          />
        </View>

        {/* Data & Storage */}
        <SectionHeader title="DATA & STORAGE" />
        <View style={styles.section}>
          <SettingItem
            icon="download-outline"
            title="Export Data"
            subtitle="Download your data"
            onPress={() => toggleModal('dataExport')}
          />
          <SettingItem
            icon="trash-outline"
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={() => {
              Alert.alert('Clear Cache', 'This will clear temporary files and free up space.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', onPress: () => Alert.alert('Success', 'Cache cleared successfully!') }
              ]);
            }}
          />
        </View>

        {/* Support */}
        <SectionHeader title="SUPPORT" />
        <View style={styles.section}>
          <SettingItem
            icon="help-circle-outline"
            title="Help Center"
            subtitle="FAQs and tutorials"
            onPress={() => navigation.navigate('SupportScreen')}
          />
          <SettingItem
            icon="mail-outline"
            title="Contact Support"
            subtitle="Get help from our team"
            onPress={() => {
              // Open email or support chat
              Alert.alert('Contact Support', 'How would you like to contact us?', [
                { text: 'Email', onPress: () => console.log('Open email') },
                { text: 'Live Chat', onPress: () => console.log('Open chat') },
                { text: 'Cancel', style: 'cancel' }
              ]);
            }}
          />
          <SettingItem
            icon="document-text-outline"
            title="Terms & Privacy"
            subtitle="App terms and privacy policy"
            onPress={() => console.log('Open terms')}
          />
          <SettingItem
            icon="star-outline"
            title="Rate App"
            subtitle="Help us improve"
            onPress={() => console.log('Open app store rating')}
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="ACCOUNT" />
        <View style={styles.section}>
          <SettingItem
            icon="log-out-outline"
            title="Sign Out"
            subtitle="Sign out of your account"
            onPress={() => {
              Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: () => navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                }) }
              ]);
            }}
          />
          <TouchableOpacity style={[styles.settingItem, styles.dangerItem]} onPress={handleDeleteAccount}>
            <View style={styles.settingLeft}>
              <Ionicons name="warning-outline" size={24} color="#FF3B30" style={styles.settingIcon} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, styles.dangerText]}>Delete Account</Text>
                <Text style={styles.settingSubtitle}>Permanently delete your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.2.0</Text>
          <Text style={styles.footerText}>© 2025 CoachingApp</Text>
        </View>
      </ScrollView>

      {/* Data Export Modal */}
      <Modal
        visible={modals.dataExport}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => toggleModal('dataExport')}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Export Data</Text>
            <TouchableOpacity onPress={handleDataExport} disabled={loading}>
              <Text style={[styles.modalDone, loading && styles.modalDisabled]}>
                {loading ? 'Exporting...' : 'Export'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Export your data including:
            </Text>
            <View style={styles.exportList}>
              <Text style={styles.exportItem}>• Child profiles and progress</Text>
              <Text style={styles.exportItem}>• Session history and feedback</Text>
              <Text style={styles.exportItem}>• Payment records</Text>
              <Text style={styles.exportItem}>• Communication history</Text>
              <Text style={styles.exportItem}>• Academy and coach information</Text>
            </View>
            <Text style={styles.modalNote}>
              Your data will be sent to your registered email address as a ZIP file within 24 hours.
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D6D70',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6D6D70',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#FF3B30',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6D6D70',
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modalCancel: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    padding: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
  },
  exportList: {
    marginBottom: 20,
  },
  exportItem: {
    fontSize: 15,
    color: '#6D6D70',
    marginBottom: 8,
    paddingLeft: 8,
  },
  modalNote: {
    fontSize: 14,
    color: '#6D6D70',
    fontStyle: 'italic',
  },
});

export default SettingsScreen;
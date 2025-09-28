import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Vibration,
  Platform,
  Animated
} from 'react-native';
import { 
  Card,
  Text,
  Switch,
  Button,
  Chip,
  Surface,
  IconButton,
  Portal,
  Modal,
  Divider,
  List
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your app's design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const PrivacySettings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, privacySettings } = useSelector(state => state.auth);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  
  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [settings, setSettings] = useState({
    profileVisibility: 'public', // public, private, coaches-only
    showLocation: true,
    showContactInfo: true,
    showCertifications: true,
    showExperience: true,
    showReviews: true,
    allowDirectBooking: true,
    showAvailability: true,
    dataAnalytics: true,
    marketingEmails: false,
    pushNotifications: true,
    messageRequests: 'everyone', // everyone, coaches-only, none
    clientDataSharing: false,
    sessionRecording: true,
    performanceTracking: true,
    locationTracking: false,
    biometricLogin: false,
    twoFactorAuth: false
  });

  useEffect(() => {
    // Entrance animation
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

    // Load privacy settings
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, dispatch action to load settings
      // dispatch(loadUserPrivacySettings());
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to load privacy settings');
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPrivacySettings();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadPrivacySettings]);

  const handleSettingChange = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    Vibration.vibrate(30);
    
    // In real app, dispatch action to update setting
    // dispatch(updatePrivacySetting({ key, value }));
  }, []);

  const handleSaveSettings = useCallback(async () => {
    try {
      setLoading(true);
      Vibration.vibrate(50);
      
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        '✅ Settings Saved',
        'Your privacy settings have been updated successfully!',
        [{ text: 'OK', style: 'default' }]
      );
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to save settings');
    }
  }, [settings]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      '⚠️ Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In development, show feature notification
            Alert.alert(
              '🚧 Feature in Development',
              'Account deletion is currently being implemented. This feature will be available in the next update.',
              [{ text: 'OK', style: 'default' }]
            );
          }
        }
      ]
    );
  }, []);

  const SettingCard = ({ title, description, children, icon }) => (
    <Card style={styles.settingCard} elevation={2}>
      <Card.Content>
        <View style={styles.settingHeader}>
          <Icon name={icon} size={24} color={COLORS.primary} />
          <View style={styles.settingTitleContainer}>
            <Text style={styles.settingTitle}>{title}</Text>
            {description && (
              <Text style={styles.settingDescription}>{description}</Text>
            )}
          </View>
        </View>
        <View style={styles.settingContent}>
          {children}
        </View>
      </Card.Content>
    </Card>
  );

  const SwitchRow = ({ label, value, onValueChange, description }) => (
    <View style={styles.switchRow}>
      <View style={styles.switchLabelContainer}>
        <Text style={styles.switchLabel}>{label}</Text>
        {description && (
          <Text style={styles.switchDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        color={COLORS.primary}
      />
    </View>
  );

  const ProfileVisibilityChip = ({ value, current, onPress, label }) => (
    <Chip
      mode={current === value ? 'flat' : 'outlined'}
      selected={current === value}
      onPress={onPress}
      style={[
        styles.visibilityChip,
        current === value && { backgroundColor: COLORS.primary }
      ]}
      textStyle={[
        styles.chipText,
        current === value && { color: 'white' }
      ]}
    >
      {label}
    </Chip>
  );

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={28}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Privacy Settings 🔒</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          style={styles.scrollView}
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
          {/* Profile Visibility Section */}
          <SettingCard
            title="Profile Visibility"
            description="Control who can see your trainer profile"
            icon="visibility"
          >
            <View style={styles.chipContainer}>
              <ProfileVisibilityChip
                value="public"
                current={settings.profileVisibility}
                onPress={() => handleSettingChange('profileVisibility', 'public')}
                label="🌐 Public"
              />
              <ProfileVisibilityChip
                value="coaches-only"
                current={settings.profileVisibility}
                onPress={() => handleSettingChange('profileVisibility', 'coaches-only')}
                label="👥 Coaches Only"
              />
              <ProfileVisibilityChip
                value="private"
                current={settings.profileVisibility}
                onPress={() => handleSettingChange('profileVisibility', 'private')}
                label="🔒 Private"
              />
            </View>
          </SettingCard>

          {/* Profile Information Section */}
          <SettingCard
            title="Profile Information"
            description="Choose what information to display publicly"
            icon="person"
          >
            <SwitchRow
              label="Show Location"
              description="Display your general area to potential clients"
              value={settings.showLocation}
              onValueChange={(value) => handleSettingChange('showLocation', value)}
            />
            <Divider style={styles.divider} />
            <SwitchRow
              label="Show Contact Information"
              description="Display phone and email for direct contact"
              value={settings.showContactInfo}
              onValueChange={(value) => handleSettingChange('showContactInfo', value)}
            />
            <Divider style={styles.divider} />
            <SwitchRow
              label="Show Certifications"
              description="Display your training certifications and qualifications"
              value={settings.showCertifications}
              onValueChange={(value) => handleSettingChange('showCertifications', value)}
            />
            <Divider style={styles.divider} />
            <SwitchRow
              label="Show Experience"
              description="Display years of experience and specializations"
              value={settings.showExperience}
              onValueChange={(value) => handleSettingChange('showExperience', value)}
            />
            <Divider style={styles.divider} />
            <SwitchRow
              label="Show Reviews & Ratings"
              description="Display client reviews and ratings on your profile"
              value={settings.showReviews}
              onValueChange={(value) => handleSettingChange('showReviews', value)}
            />
          </SettingCard>

          {/* Booking & Availability Section */}
          <SettingCard
            title="Booking & Availability"
            description="Manage how clients can book sessions with you"
            icon="event"
          >
            <SwitchRow
              label="Allow Direct Booking"
              description="Let clients book sessions without prior approval"
              value={settings.allowDirectBooking}
              onValueChange={(value) => handleSettingChange('allowDirectBooking', value)}
            />
            <Divider style={styles.divider} />
            <SwitchRow
              label="Show Availability"
              description="Display your available time slots publicly"
              value={settings.showAvailability}
              onValueChange={(value) => handleSettingChange('showAvailability', value)}
            />
          </SettingCard>

          {/* Communication Settings */}
          <SettingCard
            title="Communication"
            description="Control who can contact you"
            icon="message"
          >
            <View style={styles.messageRequestsContainer}>
              <Text style={styles.settingLabel}>Message Requests</Text>
              <View style={styles.chipContainer}>
                <ProfileVisibilityChip
                  value="everyone"
                  current={settings.messageRequests}
                  onPress={() => handleSettingChange('messageRequests', 'everyone')}
                  label="Everyone"
                />
                <ProfileVisibilityChip
                  value="coaches-only"
                  current={settings.messageRequests}
                  onPress={() => handleSettingChange('messageRequests', 'coaches-only')}
                  label="Coaches Only"
                />
                <ProfileVisibilityChip
                  value="none"
                  current={settings.messageRequests}
                  onPress={() => handleSettingChange('messageRequests', 'none')}
                  label="None"
                />
              </View>
            </View>
            <Divider style={styles.divider} />
            <SwitchRow
              label="Push Notifications"
              description="Receive notifications for messages and updates"
              value={settings.pushNotifications}
              onValueChange={(value) => handleSettingChange('pushNotifications', value)}
            />
          </SettingCard>

          {/* Data & Privacy Section */}
          <SettingCard
            title="Data & Privacy"
            description="Control how your data is used"
            icon="security"
          >
            <SwitchRow
              label="Client Data Sharing"
              description="Share anonymized client progress data for research"
              value={settings.clientDataSharing}
              onValueChange={(value) => handleSettingChange('clientDataSharing', value)}
            />
            <Divider style={styles.divider} />
            <SwitchRow
              label="Session Recording Analytics"
              description="Allow anonymous analysis of training sessions"
              value={settings.sessionRecording}
              onValueChange={(value) => handleSettingChange('sessionRecording', value)}
            />
            <Divider style={styles.divider} />
            <SwitchRow
              label="Performance Tracking"
              description="Track app usage for personalized recommendations"
              value={settings.performanceTracking}
              onValueChange={(value) => handleSettingChange('performanceTracking', value)}
            />
            <Divider style={styles.divider} />
            <SwitchRow
              label="Location Tracking"
              description="Use location for nearby client recommendations"
              value={settings.locationTracking}
              onValueChange={(value) => handleSettingChange('locationTracking', value)}
            />
            <Divider style={styles.divider} />
            <SwitchRow
              label="Data Analytics"
              description="Help improve the app through usage analytics"
              value={settings.dataAnalytics}
              onValueChange={(value) => handleSettingChange('dataAnalytics', value)}
            />
            <Divider style={styles.divider} />
            <SwitchRow
              label="Marketing Emails"
              description="Receive promotional emails and feature updates"
              value={settings.marketingEmails}
              onValueChange={(value) => handleSettingChange('marketingEmails', value)}
            />
          </SettingCard>

          {/* Security Section */}
          <SettingCard
            title="Account Security"
            description="Additional security features"
            icon="lock"
          >
            <SwitchRow
              label="Biometric Login"
              description={`Use ${Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'fingerprint'} to unlock app`}
              value={settings.biometricLogin}
              onValueChange={(value) => handleSettingChange('biometricLogin', value)}
            />
            <Divider style={styles.divider} />
            <SwitchRow
              label="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              value={settings.twoFactorAuth}
              onValueChange={(value) => handleSettingChange('twoFactorAuth', value)}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Change Password"
              description="Update your account password"
              left={props => <List.Icon {...props} icon="key" color={COLORS.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                Alert.alert(
                  '🚧 Feature in Development',
                  'Password change functionality is currently being implemented.',
                  [{ text: 'OK', style: 'default' }]
                );
              }}
              style={styles.listItem}
            />
          </SettingCard>

          {/* Account Management Section */}
          <SettingCard
            title="Account Management"
            description="Manage your account data"
            icon="manage-accounts"
          >
            <List.Item
              title="Download My Data"
              description="Export all your personal data"
              left={props => <List.Icon {...props} icon="download" color={COLORS.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                Alert.alert(
                  '🚧 Feature in Development',
                  'Data export functionality is currently being implemented.',
                  [{ text: 'OK', style: 'default' }]
                );
              }}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Delete Account"
              description="Permanently delete your account and data"
              left={props => <List.Icon {...props} icon="delete-forever" color={COLORS.error} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleDeleteAccount}
              style={styles.listItem}
              titleStyle={{ color: COLORS.error }}
            />
          </SettingCard>

          {/* Save Button */}
          <Surface style={styles.saveButtonContainer} elevation={4}>
            <Button
              mode="contained"
              onPress={handleSaveSettings}
              loading={loading}
              disabled={loading}
              style={styles.saveButton}
              labelStyle={styles.saveButtonText}
              icon="save"
            >
              {loading ? 'Saving Settings...' : 'Save Privacy Settings'}
            </Button>
          </Surface>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>

      {/* Account Deletion Modal */}
      <Portal>
        <Modal
          visible={showAccountModal}
          onDismiss={() => setShowAccountModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
          />
          <Card style={styles.modalCard}>
            <Card.Content>
              <Text style={styles.modalTitle}>⚠️ Delete Account</Text>
              <Text style={styles.modalDescription}>
                This action cannot be undone. All your data, client information,
                and training plans will be permanently deleted.
              </Text>
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowAccountModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  buttonColor={COLORS.error}
                  onPress={() => {
                    setShowAccountModal(false);
                    handleDeleteAccount();
                  }}
                  style={styles.modalButton}
                >
                  Delete
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  headerSpacer: {
    width: 48,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  settingCard: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  settingTitleContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  settingTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  settingDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingContent: {
    marginTop: SPACING.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  switchLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    color: COLORS.text,
  },
  switchDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  visibilityChip: {
    backgroundColor: 'transparent',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageRequestsContainer: {
    paddingVertical: SPACING.sm,
  },
  settingLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  listItem: {
    paddingHorizontal: 0,
    paddingVertical: SPACING.xs,
  },
  saveButtonContainer: {
    margin: SPACING.md,
    marginTop: SPACING.lg,
    borderRadius: 12,
    backgroundColor: 'white',
    padding: SPACING.md,
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: SPACING.xs,
  },
  saveButtonText: {
    ...TEXT_STYLES.button,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default PrivacySettings;
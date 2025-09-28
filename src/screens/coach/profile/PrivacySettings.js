import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Animated,
  Alert,
  Switch,
  TouchableOpacity,
  Vibration
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Portal,
  Dialog,
  RadioButton,
  Divider,
  List
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design system constants
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

const PrivacySettings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, privacySettings } = useSelector(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  // Privacy settings state
  const [settings, setSettings] = useState({
    profileVisibility: 'public', // public, connections, private
    showOnlineStatus: true,
    shareLocation: false,
    allowMessages: true,
    showTrainingHistory: true,
    dataAnalytics: true,
    marketingEmails: false,
    pushNotifications: true,
    sharePerformanceData: false,
    allowVideoRecording: true,
    parentalAccess: true, // for minors
    coachAccess: true,
    showInSearch: true,
    dataRetention: '2years', // 1year, 2years, 5years, forever
    twoFactorAuth: false,
    sessionRecording: true,
    biometricAuth: false
  });

  useEffect(() => {
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
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Vibration.vibrate(50);
    // Simulate API call to refresh privacy settings
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const handleSettingChange = (key, value) => {
    Vibration.vibrate(30);
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Show confirmation for sensitive changes
    if (['shareLocation', 'sharePerformanceData', 'allowVideoRecording'].includes(key)) {
      Alert.alert(
        '🔒 Privacy Setting Updated',
        `${key} has been ${value ? 'enabled' : 'disabled'}. Changes will take effect immediately.`,
        [{ text: 'Got it', style: 'default' }]
      );
    }
  };

  const handleFeatureTap = (feature) => {
    Vibration.vibrate(30);
    Alert.alert(
      '🚧 Feature in Development',
      `${feature} is coming soon! We're working hard to bring you enhanced privacy controls.`,
      [{ text: 'Got it! 👍', style: 'default' }]
    );
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      '⚠️ Account Deletion',
      'This feature is currently in development. Contact support for account deletion requests.',
      [{ text: 'Contact Support', onPress: () => handleFeatureTap('Support') }]
    );
    setShowDeleteDialog(false);
  };

  const exportUserData = () => {
    Alert.alert(
      '📊 Data Export',
      'We\'ll prepare your data export and send it to your email within 48 hours.',
      [{ text: 'Request Export', onPress: () => handleFeatureTap('Data Export') }]
    );
  };

  const PrivacyCard = ({ icon, title, description, children, warning = false }) => (
    <Card style={[styles.privacyCard, warning && styles.warningCard]} elevation={2}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Icon name={icon} size={24} color={warning ? COLORS.error : COLORS.primary} />
            <View style={styles.cardTitleText}>
              <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>{title}</Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>{description}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardContent}>
          {children}
        </View>
      </Card.Content>
    </Card>
  );

  const SettingRow = ({ label, description, value, onValueChange, type = 'switch' }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={TEXT_STYLES.body}>{label}</Text>
        {description && (
          <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary, marginTop: 2 }]}>
            {description}
          </Text>
        )}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#e0e0e0', true: COLORS.primary }}
          thumbColor={value ? 'white' : '#f4f3f4'}
        />
      )}
      {type === 'button' && (
        <TouchableOpacity onPress={onValueChange} style={styles.settingButton}>
          <Text style={[TEXT_STYLES.body, { color: COLORS.primary }]}>{value}</Text>
          <Icon name="chevron-right" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={[TEXT_STYLES.h2, { color: 'white', flex: 1, textAlign: 'center' }]}>
            🔒 Privacy Settings
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
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
          {/* Profile Privacy */}
          <PrivacyCard
            icon="account-circle"
            title="Profile Privacy"
            description="Control who can see your profile information"
          >
            <SettingRow
              label="Profile Visibility"
              description="Who can view your profile"
              value={settings.profileVisibility}
              onValueChange={() => setShowLocationDialog(true)}
              type="button"
            />
            <SettingRow
              label="Show Online Status"
              description="Let others see when you're active"
              value={settings.showOnlineStatus}
              onValueChange={(value) => handleSettingChange('showOnlineStatus', value)}
            />
            <SettingRow
              label="Show in Search Results"
              description="Allow others to find you in searches"
              value={settings.showInSearch}
              onValueChange={(value) => handleSettingChange('showInSearch', value)}
            />
          </PrivacyCard>

          {/* Communication Privacy */}
          <PrivacyCard
            icon="message"
            title="Communication Privacy"
            description="Manage who can contact you"
          >
            <SettingRow
              label="Allow Messages"
              description="Receive messages from coaches/players"
              value={settings.allowMessages}
              onValueChange={(value) => handleSettingChange('allowMessages', value)}
            />
            <SettingRow
              label="Push Notifications"
              description="Receive app notifications"
              value={settings.pushNotifications}
              onValueChange={(value) => handleSettingChange('pushNotifications', value)}
            />
            <SettingRow
              label="Marketing Emails"
              description="Receive promotional content"
              value={settings.marketingEmails}
              onValueChange={(value) => handleSettingChange('marketingEmails', value)}
            />
          </PrivacyCard>

          {/* Training & Performance Data */}
          <PrivacyCard
            icon="fitness-center"
            title="Training & Performance"
            description="Control sharing of your training data"
          >
            <SettingRow
              label="Show Training History"
              description="Display your workout history to coaches"
              value={settings.showTrainingHistory}
              onValueChange={(value) => handleSettingChange('showTrainingHistory', value)}
            />
            <SettingRow
              label="Share Performance Data"
              description="Allow analytics on your performance"
              value={settings.sharePerformanceData}
              onValueChange={(value) => handleSettingChange('sharePerformanceData', value)}
            />
            <SettingRow
              label="Session Recording"
              description="Allow coaches to record training sessions"
              value={settings.sessionRecording}
              onValueChange={(value) => handleSettingChange('sessionRecording', value)}
            />
            <SettingRow
              label="Video Recording Consent"
              description="Allow video recording during sessions"
              value={settings.allowVideoRecording}
              onValueChange={(value) => handleSettingChange('allowVideoRecording', value)}
            />
          </PrivacyCard>

          {/* Location & Safety */}
          <PrivacyCard
            icon="location-on"
            title="Location & Safety"
            description="Manage location sharing and safety features"
          >
            <SettingRow
              label="Share Location"
              description="Allow location sharing with coaches"
              value={settings.shareLocation}
              onValueChange={(value) => handleSettingChange('shareLocation', value)}
            />
            {user?.age < 18 && (
              <SettingRow
                label="Parental Access"
                description="Allow parent/guardian to view your data"
                value={settings.parentalAccess}
                onValueChange={(value) => handleSettingChange('parentalAccess', value)}
              />
            )}
          </PrivacyCard>

          {/* Security */}
          <PrivacyCard
            icon="security"
            title="Security & Authentication"
            description="Enhance your account security"
          >
            <SettingRow
              label="Two-Factor Authentication"
              description="Add extra security to your account"
              value={settings.twoFactorAuth}
              onValueChange={() => handleFeatureTap('Two-Factor Auth Setup')}
            />
            <SettingRow
              label="Biometric Login"
              description="Use fingerprint or face ID"
              value={settings.biometricAuth}
              onValueChange={() => handleFeatureTap('Biometric Auth Setup')}
            />
          </PrivacyCard>

          {/* Data Management */}
          <PrivacyCard
            icon="storage"
            title="Data Management"
            description="Control how your data is stored and used"
          >
            <SettingRow
              label="Data Analytics"
              description="Help improve the app with usage data"
              value={settings.dataAnalytics}
              onValueChange={(value) => handleSettingChange('dataAnalytics', value)}
            />
            <SettingRow
              label="Data Retention Period"
              description="How long we keep your data"
              value={settings.dataRetention}
              onValueChange={() => setShowDataDialog(true)}
              type="button"
            />
          </PrivacyCard>

          {/* Data Rights */}
          <PrivacyCard
            icon="account-balance"
            title="Your Data Rights"
            description="Access and control your personal data"
          >
            <View style={styles.dataRightsContainer}>
              <Button
                mode="outlined"
                icon="download"
                onPress={exportUserData}
                style={styles.dataButton}
              >
                Export My Data
              </Button>
              <Button
                mode="outlined"
                icon="visibility"
                onPress={() => handleFeatureTap('View Data')}
                style={styles.dataButton}
              >
                View Collected Data
              </Button>
            </View>
          </PrivacyCard>

          {/* Danger Zone */}
          <PrivacyCard
            icon="warning"
            title="Danger Zone"
            description="Irreversible actions"
            warning={true}
          >
            <Button
              mode="contained"
              icon="delete-forever"
              buttonColor={COLORS.error}
              textColor="white"
              onPress={handleDeleteAccount}
              style={styles.deleteButton}
            >
              Delete Account
            </Button>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm, color: COLORS.error }]}>
              ⚠️ This action cannot be undone
            </Text>
          </PrivacyCard>

          {/* Privacy Notice */}
          <Card style={styles.noticeCard} elevation={1}>
            <Card.Content>
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginBottom: SPACING.sm }]}>
                📋 Privacy Notice
              </Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center', color: COLORS.secondary }]}>
                We respect your privacy and are committed to protecting your personal data. 
                Read our full Privacy Policy for details on how we collect, use, and protect your information.
              </Text>
              <Button
                mode="text"
                onPress={() => handleFeatureTap('Privacy Policy')}
                style={{ marginTop: SPACING.sm }}
              >
                View Privacy Policy
              </Button>
            </Card.Content>
          </Card>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </Animated.View>

      {/* Data Retention Dialog */}
      <Portal>
        <Dialog visible={showDataDialog} onDismiss={() => setShowDataDialog(false)}>
          <Dialog.Title>📅 Data Retention Period</Dialog.Title>
          <Dialog.Content>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
              How long should we keep your data?
            </Text>
            <RadioButton.Group
              onValueChange={value => handleSettingChange('dataRetention', value)}
              value={settings.dataRetention}
            >
              <RadioButton.Item label="1 Year" value="1year" />
              <RadioButton.Item label="2 Years" value="2years" />
              <RadioButton.Item label="5 Years" value="5years" />
              <RadioButton.Item label="Forever" value="forever" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDataDialog(false)}>Cancel</Button>
            <Button onPress={() => setShowDataDialog(false)}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Profile Visibility Dialog */}
      <Portal>
        <Dialog visible={showLocationDialog} onDismiss={() => setShowLocationDialog(false)}>
          <Dialog.Title>👤 Profile Visibility</Dialog.Title>
          <Dialog.Content>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
              Who can view your profile?
            </Text>
            <RadioButton.Group
              onValueChange={value => handleSettingChange('profileVisibility', value)}
              value={settings.profileVisibility}
            >
              <RadioButton.Item label="🌍 Public - Everyone can see" value="public" />
              <RadioButton.Item label="👥 Connections - Only my coaches/players" value="connections" />
              <RadioButton.Item label="🔒 Private - Only me" value="private" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLocationDialog(false)}>Cancel</Button>
            <Button onPress={() => setShowLocationDialog(false)}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Account Confirmation */}
      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>⚠️ Delete Account</Dialog.Title>
          <Dialog.Content>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
              Are you sure you want to delete your account? This will:
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.secondary }]}>
              • Permanently delete all your data{'\n'}
              • Remove you from all teams and training programs{'\n'}
              • Cancel any active subscriptions{'\n'}
              • This action cannot be undone
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button textColor={COLORS.error} onPress={confirmDeleteAccount}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  privacyCard: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitleText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  cardContent: {
    marginTop: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  dataRightsContainer: {
    marginTop: SPACING.md,
  },
  dataButton: {
    marginBottom: SPACING.sm,
    borderColor: COLORS.primary,
  },
  deleteButton: {
    marginTop: SPACING.md,
  },
  noticeCard: {
    marginTop: SPACING.lg,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
};

export default PrivacySettings;
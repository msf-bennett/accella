import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Switch,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Button,
  Surface,
  List,
  Divider,
  IconButton,
  Avatar,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Constants (these would typically be imported from your constants file)
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#ff9800',
  background: '#f8f9fa',
  white: '#ffffff',
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
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
};

const { width } = Dimensions.get('window');

const PrivacySettings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  
  // Privacy Settings State
  const [settings, setSettings] = useState({
    profileVisibility: 'coaches_only',
    allowMessaging: false,
    shareProgress: true,
    allowPhotoSharing: false,
    locationSharing: false,
    dataCollection: true,
    parentalNotifications: true,
    coachCommunication: true,
    performanceSharing: true,
    videoRecording: false,
  });

  const [privacyScore, setPrivacyScore] = useState(0.85);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh action
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    
    // Show confirmation for important changes
    if (['allowMessaging', 'locationSharing', 'videoRecording'].includes(key)) {
      Alert.alert(
        '🔒 Privacy Setting Updated',
        `${key === 'allowMessaging' ? 'Messaging' : key === 'locationSharing' ? 'Location sharing' : 'Video recording'} has been ${value ? 'enabled' : 'disabled'}. Parent will be notified of this change.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleResetToDefault = () => {
    Alert.alert(
      '🔄 Reset Privacy Settings',
      'This will reset all privacy settings to the most secure defaults recommended for children. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              profileVisibility: 'coaches_only',
              allowMessaging: false,
              shareProgress: true,
              allowPhotoSharing: false,
              locationSharing: false,
              dataCollection: true,
              parentalNotifications: true,
              coachCommunication: true,
              performanceSharing: true,
              videoRecording: false,
            });
            Alert.alert('✅ Settings Reset', 'All privacy settings have been reset to secure defaults!');
          },
        },
      ]
    );
  };

  const handleDataDownload = () => {
    Alert.alert(
      '📥 Download Your Data',
      'We\'ll prepare a copy of your child\'s data and send it to the parent email address. This may take up to 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request Download', onPress: () => Alert.alert('Feature Coming Soon', 'Data download feature is in development! 📋') },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '❌ Delete Account',
      'Account deletion requires parent verification. A parent or guardian must confirm this action via email.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Contact Parent', onPress: () => Alert.alert('Feature Coming Soon', 'Parent verification system coming soon! 👨‍👩‍👧‍👦') },
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-back"
            iconColor={COLORS.white}
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Privacy Settings</Text>
          <IconButton
            icon="shield-check"
            iconColor={COLORS.white}
            size={24}
            onPress={() => Alert.alert('🛡️ Privacy Protected', 'Your privacy is our priority! All settings are monitored by parents.')}
          />
        </View>
        <Text style={styles.headerSubtitle}>
          Keep your information safe and secure 🔒
        </Text>
      </View>
    </LinearGradient>
  );

  const renderPrivacyScore = () => (
    <View style={styles.section}>
      <Card style={styles.scoreCard}>
        <LinearGradient
          colors={[COLORS.success + '20', COLORS.success + '10']}
          style={styles.scoreGradient}
        >
          <Card.Content style={styles.scoreContent}>
            <View style={styles.scoreHeader}>
              <Avatar.Icon 
                size={50} 
                icon="shield-check" 
                style={styles.scoreAvatar}
                color={COLORS.success}
              />
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreTitle}>Privacy Score</Text>
                <Text style={styles.scoreValue}>{Math.round(privacyScore * 100)}%</Text>
              </View>
            </View>
            <ProgressBar
              progress={privacyScore}
              color={COLORS.success}
              style={styles.scoreProgress}
            />
            <Text style={styles.scoreDescription}>
              Great job! Your privacy settings are secure 🌟
            </Text>
          </Card.Content>
        </LinearGradient>
      </Card>
    </View>
  );

  const renderParentalControls = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Parental Controls</Text>
      <Card style={styles.settingsCard}>
        <Card.Content>
          <View style={styles.parentalInfo}>
            <Icon name="family-restroom" size={24} color={COLORS.primary} />
            <View style={styles.parentalText}>
              <Text style={styles.parentalTitle}>Parent Supervision Active</Text>
              <Text style={styles.parentalSubtitle}>
                All settings are monitored by your parent or guardian
              </Text>
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Parental Notifications</Text>
              <Text style={styles.settingSubtitle}>
                Parent receives alerts for privacy changes
              </Text>
            </View>
            <Switch
              value={settings.parentalNotifications}
              onValueChange={(value) => updateSetting('parentalNotifications', value)}
              trackColor={{ false: COLORS.border, true: COLORS.success + '50' }}
              thumbColor={settings.parentalNotifications ? COLORS.success : COLORS.textSecondary}
              disabled={true} // Parent-controlled setting
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Coach Communication</Text>
              <Text style={styles.settingSubtitle}>
                Allow direct communication with coaches
              </Text>
            </View>
            <Switch
              value={settings.coachCommunication}
              onValueChange={(value) => updateSetting('coachCommunication', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={settings.coachCommunication ? COLORS.primary : COLORS.textSecondary}
            />
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderAccountVisibility = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>👁️ Account Visibility</Text>
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text style={styles.settingGroupTitle}>Who can see your profile?</Text>
          <View style={styles.visibilityOptions}>
            {[
              { value: 'coaches_only', label: 'Coaches Only', icon: 'sports', recommended: true },
              { value: 'team_members', label: 'Team Members', icon: 'group' },
              { value: 'private', label: 'Private', icon: 'lock' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.visibilityOption,
                  settings.profileVisibility === option.value && styles.selectedOption,
                ]}
                onPress={() => updateSetting('profileVisibility', option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Icon 
                    name={option.icon} 
                    size={20} 
                    color={settings.profileVisibility === option.value ? COLORS.primary : COLORS.textSecondary} 
                  />
                  <Text style={[
                    styles.optionLabel,
                    settings.profileVisibility === option.value && styles.selectedOptionLabel,
                  ]}>
                    {option.label}
                  </Text>
                  {option.recommended && (
                    <Chip mode="flat" style={styles.recommendedChip} textStyle={styles.recommendedChipText}>
                      Recommended
                    </Chip>
                  )}
                </View>
                {settings.profileVisibility === option.value && (
                  <Icon name="check-circle" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderCommunicationSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💬 Communication Settings</Text>
      <Card style={styles.settingsCard}>
        <Card.Content>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingTitleRow}>
                <Text style={styles.settingTitle}>Allow Direct Messaging</Text>
                <Chip mode="flat" style={styles.restrictedChip} textStyle={styles.restrictedChipText}>
                  Parent Approval Required
                </Chip>
              </View>
              <Text style={styles.settingSubtitle}>
                Coaches and trainers can send messages
              </Text>
            </View>
            <Switch
              value={settings.allowMessaging}
              onValueChange={(value) => updateSetting('allowMessaging', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={settings.allowMessaging ? COLORS.primary : COLORS.textSecondary}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Share Training Progress</Text>
              <Text style={styles.settingSubtitle}>
                Allow coaches to see performance data
              </Text>
            </View>
            <Switch
              value={settings.shareProgress}
              onValueChange={(value) => updateSetting('shareProgress', value)}
              trackColor={{ false: COLORS.border, true: COLORS.success + '50' }}
              thumbColor={settings.shareProgress ? COLORS.success : COLORS.textSecondary}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Performance Sharing</Text>
              <Text style={styles.settingSubtitle}>
                Share achievements with team members
              </Text>
            </View>
            <Switch
              value={settings.performanceSharing}
              onValueChange={(value) => updateSetting('performanceSharing', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={settings.performanceSharing ? COLORS.primary : COLORS.textSecondary}
            />
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderMediaSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📸 Media & Content</Text>
      <Card style={styles.settingsCard}>
        <Card.Content>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingTitleRow}>
                <Text style={styles.settingTitle}>Photo Sharing</Text>
                <Icon name="warning" size={16} color={COLORS.warning} />
              </View>
              <Text style={styles.settingSubtitle}>
                Allow photos to be shared with coaches
              </Text>
            </View>
            <Switch
              value={settings.allowPhotoSharing}
              onValueChange={(value) => updateSetting('allowPhotoSharing', value)}
              trackColor={{ false: COLORS.border, true: COLORS.warning + '50' }}
              thumbColor={settings.allowPhotoSharing ? COLORS.warning : COLORS.textSecondary}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingTitleRow}>
                <Text style={styles.settingTitle}>Video Recording</Text>
                <Icon name="warning" size={16} color={COLORS.warning} />
              </View>
              <Text style={styles.settingSubtitle}>
                Allow training videos to be recorded
              </Text>
            </View>
            <Switch
              value={settings.videoRecording}
              onValueChange={(value) => updateSetting('videoRecording', value)}
              trackColor={{ false: COLORS.border, true: COLORS.error + '50' }}
              thumbColor={settings.videoRecording ? COLORS.error : COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.mediaInfo}>
            <Icon name="info" size={16} color={COLORS.primary} />
            <Text style={styles.mediaInfoText}>
              All media shared requires parent approval and is automatically monitored
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderLocationSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📍 Location & Safety</Text>
      <Card style={styles.settingsCard}>
        <Card.Content>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingTitleRow}>
                <Text style={styles.settingTitle}>Location Sharing</Text>
                <Chip mode="flat" style={styles.emergencyChip} textStyle={styles.emergencyChipText}>
                  Emergency Only
                </Chip>
              </View>
              <Text style={styles.settingSubtitle}>
                Share location for safety and session check-ins
              </Text>
            </View>
            <Switch
              value={settings.locationSharing}
              onValueChange={(value) => updateSetting('locationSharing', value)}
              trackColor={{ false: COLORS.border, true: COLORS.error + '50' }}
              thumbColor={settings.locationSharing ? COLORS.error : COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.locationInfo}>
            <Icon name="my-location" size={20} color={COLORS.success} />
            <Text style={styles.locationInfoText}>
              Location is only shared during training sessions and with parent approval
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderDataSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📊 Data & Analytics</Text>
      <Card style={styles.settingsCard}>
        <Card.Content>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Performance Analytics</Text>
              <Text style={styles.settingSubtitle}>
                Allow app to collect training data for improvement
              </Text>
            </View>
            <Switch
              value={settings.dataCollection}
              onValueChange={(value) => updateSetting('dataCollection', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={settings.dataCollection ? COLORS.primary : COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.dataActions}>
            <Button
              mode="outlined"
              icon="download"
              onPress={handleDataDownload}
              style={styles.dataButton}
              textColor={COLORS.primary}
            >
              Download My Data
            </Button>
            <Button
              mode="outlined"
              icon="visibility"
              onPress={() => Alert.alert('Feature Coming Soon', 'Data viewer feature is in development! 👀')}
              style={styles.dataButton}
              textColor={COLORS.primary}
            >
              View What We Store
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderPrivacyEducation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎓 Privacy Education</Text>
      <Card style={styles.educationCard}>
        <Card.Content style={styles.educationContent}>
          <View style={styles.educationHeader}>
            <Icon name="school" size={28} color={COLORS.primary} />
            <Text style={styles.educationTitle}>Learn About Privacy</Text>
          </View>
          <Text style={styles.educationText}>
            Understanding privacy helps keep you safe online. Learn about protecting your information!
          </Text>
          <View style={styles.educationActions}>
            <Button
              mode="contained"
              icon="play-circle-filled"
              onPress={() => Alert.alert('Feature Coming Soon', 'Privacy education videos coming soon! 🎬')}
              style={styles.educationButton}
              buttonColor={COLORS.primary}
            >
              Watch Videos
            </Button>
            <Button
              mode="outlined"
              icon="quiz"
              onPress={() => Alert.alert('Feature Coming Soon', 'Privacy quiz feature in development! 🧠')}
              style={styles.educationButton}
              textColor={COLORS.primary}
            >
              Take Quiz
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderAccountActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚙️ Account Management</Text>
      <Card style={styles.settingsCard}>
        <List.Section>
          <List.Item
            title="Reset to Secure Defaults"
            description="Reset all settings to child-safe defaults"
            left={() => <List.Icon icon="restore" color={COLORS.primary} />}
            right={() => <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />}
            onPress={handleResetToDefault}
            style={styles.listItem}
            titleStyle={TEXT_STYLES.body}
            descriptionStyle={TEXT_STYLES.caption}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy Policy"
            description="Read our child privacy policy"
            left={() => <List.Icon icon="policy" color={COLORS.primary} />}
            right={() => <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />}
            onPress={() => Alert.alert('Feature Coming Soon', 'Privacy policy viewer coming soon! 📄')}
            style={styles.listItem}
            titleStyle={TEXT_STYLES.body}
            descriptionStyle={TEXT_STYLES.caption}
          />
          
          <Divider />
          
          <List.Item
            title="Delete Account"
            description="Requires parent verification"
            left={() => <List.Icon icon="delete-forever" color={COLORS.error} />}
            right={() => <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />}
            onPress={handleDeleteAccount}
            style={styles.listItem}
            titleStyle={[TEXT_STYLES.body, { color: COLORS.error }]}
            descriptionStyle={TEXT_STYLES.caption}
          />
        </List.Section>
      </Card>
    </View>
  );

  const renderEmergencyContacts = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🚨 Emergency & Safety</Text>
      <Card style={styles.emergencyCard}>
        <LinearGradient
          colors={[COLORS.error + '20', COLORS.error + '10']}
          style={styles.emergencyGradient}
        >
          <Card.Content style={styles.emergencyContent}>
            <View style={styles.emergencyHeader}>
              <Icon name="emergency" size={24} color={COLORS.error} />
              <Text style={styles.emergencyTitle}>Safety First</Text>
            </View>
            <Text style={styles.emergencyText}>
              If you ever feel unsafe or uncomfortable, immediately contact:
            </Text>
            <View style={styles.emergencyActions}>
              <Button
                mode="contained"
                icon="call"
                onPress={() => Linking.openURL('tel:+1234567890')}
                style={styles.emergencyButton}
                buttonColor={COLORS.error}
              >
                Emergency Contact
              </Button>
              <Button
                mode="outlined"
                icon="report"
                onPress={() => Alert.alert('Feature Coming Soon', 'Safety reporting system coming soon! 🛡️')}
                style={[styles.emergencyButton, styles.emergencyButtonOutlined]}
                textColor={COLORS.error}
              >
                Report Issue
              </Button>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.primary}
        barStyle="light-content"
        translucent
      />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollContainer}
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
        {renderPrivacyScore()}
        {renderParentalControls()}
        {renderAccountVisibility()}
        {renderCommunicationSettings()}
        {renderMediaSettings()}
        {renderLocationSettings()}
        {renderDataSettings()}
        {renderPrivacyEducation()}
        {renderEmergencyContacts()}
        {renderAccountActions()}
        
        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 All privacy settings are monitored and can be changed by your parent or guardian
          </Text>
          <Text style={styles.footerSubtext}>
            Last updated: Today • Settings sync across devices
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  scoreCard: {
    backgroundColor: COLORS.white,
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  scoreGradient: {
    padding: SPACING.lg,
  },
  scoreContent: {
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreAvatar: {
    backgroundColor: COLORS.white,
    marginRight: SPACING.md,
  },
  scoreInfo: {
    alignItems: 'flex-start',
  },
  scoreTitle: {
    ...TEXT_STYLES.subheading,
    color: COLORS.success,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  scoreProgress: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  scoreDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.success,
    textAlign: 'center',
    fontWeight: '500',
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 12,
  },
  parentalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  parentalText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  parentalTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  parentalSubtitle: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  settingTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  settingSubtitle: {
    ...TEXT_STYLES.caption,
    lineHeight: 16,
  },
  settingGroupTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  restrictedChip: {
    backgroundColor: COLORS.warning + '20',
  },
  restrictedChipText: {
    color: COLORS.warning,
    fontSize: 10,
    fontWeight: '600',
  },
  emergencyChip: {
    backgroundColor: COLORS.error + '20',
  },
  emergencyChipText: {
    color: COLORS.error,
    fontSize: 10,
    fontWeight: '600',
  },
  recommendedChip: {
    backgroundColor: COLORS.success + '20',
    marginLeft: SPACING.sm,
  },
  recommendedChipText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '600',
  },
  divider: {
    marginVertical: SPACING.sm,
  },
  visibilityOptions: {
    gap: SPACING.sm,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLabel: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  selectedOptionLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  mediaInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  mediaInfoText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.success + '10',
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  locationInfoText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.success,
    fontWeight: '500',
  },
  dataActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    flexWrap: 'wrap',
  },
  dataButton: {
    borderRadius: 8,
    flex: 1,
    minWidth: 120,
  },
  educationCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  educationContent: {
    paddingVertical: SPACING.lg,
  },
  educationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  educationTitle: {
    ...TEXT_STYLES.subheading,
    marginLeft: SPACING.sm,
    color: COLORS.primary,
  },
  educationText: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  educationActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  educationButton: {
    borderRadius: 8,
    flex: 1,
    minWidth: 140,
  },
  emergencyCard: {
    backgroundColor: COLORS.white,
    elevation: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emergencyGradient: {
    padding: SPACING.lg,
  },
  emergencyContent: {
    alignItems: 'center',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emergencyTitle: {
    ...TEXT_STYLES.subheading,
    marginLeft: SPACING.sm,
    color: COLORS.error,
    fontWeight: 'bold',
  },
  emergencyText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emergencyButton: {
    borderRadius: 8,
    minWidth: 140,
  },
  emergencyButtonOutlined: {
    borderColor: COLORS.error,
  },
  listItem: {
    paddingVertical: SPACING.sm,
  },
  footer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  footerSubtext: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default PrivacySettings;
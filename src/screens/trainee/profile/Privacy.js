import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Switch,
  Vibration,
  Animated,
  Linking,
} from 'react-native';
import {
  Card,
  Button,
  List,
  Surface,
  Chip,
  IconButton,
  Divider,
  RadioButton,
  Portal,
  Modal,
  ProgressBar,
  Badge,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/Theme';

const Privacy = ({ navigation }) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Redux state
  const { user, loading } = useSelector(state => state.auth);
  const { privacySettings, dataExportStatus } = useSelector(state => state.privacy);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);
  const [showLoginActivityModal, setShowLoginActivityModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [privacyScore, setPrivacyScore] = useState(85);
  const [settings, setSettings] = useState({
    profileVisibility: 'friends',
    shareWorkouts: true,
    shareAchievements: true,
    shareProgress: false,
    allowCoachAccess: true,
    showOnlineStatus: true,
    allowSearchByEmail: false,
    allowSearchByPhone: false,
    dataCollection: true,
    analyticsData: true,
    crashReports: true,
    performanceData: false,
    locationTracking: false,
    contactSync: false,
    socialMediaSync: false,
    thirdPartySharing: false,
    marketingEmails: false,
    researchParticipation: false,
    biometricData: true,
    healthData: true,
    workoutVideos: true,
    voiceRecordings: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    deviceTrust: true,
    loginNotifications: true,
  });

  // Mock data for demonstration
  const [loginActivity] = useState([
    { device: 'iPhone 14 Pro', location: 'New York, US', time: '2 hours ago', status: 'active' },
    { device: 'MacBook Pro', location: 'New York, US', time: '1 day ago', status: 'inactive' },
    { device: 'iPad Air', location: 'Boston, US', time: '3 days ago', status: 'inactive' },
  ]);

  const [dataUsage] = useState({
    totalData: '2.4 GB',
    workouts: '1.2 GB',
    photos: '800 MB',
    videos: '300 MB',
    messages: '100 MB',
  });

  // Initialize settings
  useEffect(() => {
    if (privacySettings) {
      setSettings(prev => ({
        ...prev,
        ...privacySettings,
      }));
    }
  }, [privacySettings]);

  // Calculate privacy score
  useEffect(() => {
    const calculatePrivacyScore = () => {
      let score = 0;
      const securityFeatures = [
        settings.twoFactorAuth,
        !settings.locationTracking,
        !settings.thirdPartySharing,
        !settings.marketingEmails,
        settings.loginNotifications,
        !settings.allowSearchByEmail,
        !settings.allowSearchByPhone,
        settings.profileVisibility !== 'public',
      ];
      
      score = Math.round((securityFeatures.filter(Boolean).length / securityFeatures.length) * 100);
      setPrivacyScore(score);
    };

    calculatePrivacyScore();
  }, [settings]);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Screen options
  useEffect(() => {
    navigation.setOptions({
      title: 'Privacy & Security',
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        ...TEXT_STYLES.h2,
        color: '#fff',
      },
      headerRight: () => (
        <IconButton
          icon="info-outline"
          iconColor="#fff"
          size={24}
          onPress={() => Alert.alert(
            'Privacy Information',
            'We take your privacy seriously. All data is encrypted and stored securely. You have full control over what data is collected and how it\'s used.',
            [{ text: 'Got it', style: 'default' }]
          )}
        />
      ),
    });
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      dispatch({ type: 'FETCH_PRIVACY_SETTINGS_REQUEST' });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
    Vibration.vibrate(50);
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    
    // Dispatch update to Redux
    dispatch({
      type: 'UPDATE_PRIVACY_SETTING_REQUEST',
      payload: { key, value },
    });
    
    Vibration.vibrate(30);
  }, [dispatch]);

  const handleDataExport = useCallback(() => {
    Alert.alert(
      'Export Data',
      'We\'ll prepare your data export and send it to your email within 24 hours. This includes your profile, workouts, achievements, and messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Export',
          onPress: () => {
            dispatch({ type: 'REQUEST_DATA_EXPORT' });
            setShowDataExportModal(false);
            Alert.alert(
              'Export Requested!',
              'Your data export has been requested. You\'ll receive an email with download instructions within 24 hours.'
            );
          },
        },
      ]
    );
  }, [dispatch]);

  const handleAccountDeletion = useCallback(() => {
    if (deleteStep === 0) {
      setDeleteStep(1);
    } else if (deleteStep === 1) {
      Alert.alert(
        'Final Confirmation',
        'This action is permanent and cannot be undone. All your data will be permanently deleted within 30 days.\n\nType "DELETE" to confirm:',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setDeleteStep(0) },
          {
            text: 'Delete Forever',
            style: 'destructive',
            onPress: () => {
              dispatch({ type: 'DELETE_ACCOUNT_REQUEST' });
              setShowDeleteConfirm(false);
              setDeleteStep(0);
              Alert.alert(
                'Account Deletion Initiated',
                'Your account will be deleted within 30 days. You can cancel this action by logging in before then.'
              );
            },
          },
        ]
      );
    }
  }, [deleteStep, dispatch]);

  const renderPrivacyScore = () => (
    <Card style={styles.scoreCard}>
      <Card.Content>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{privacyScore}</Text>
            <Text style={styles.scoreLabel}>Privacy Score</Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreTitle}>
              {privacyScore >= 80 ? 'Excellent Security' : 
               privacyScore >= 60 ? 'Good Security' : 
               'Needs Improvement'}
            </Text>
            <Text style={styles.scoreDescription}>
              {privacyScore >= 80 
                ? 'Your privacy settings provide strong protection.'
                : privacyScore >= 60
                ? 'Consider enabling more privacy features.'
                : 'Review and improve your privacy settings.'}
            </Text>
            <ProgressBar
              progress={privacyScore / 100}
              color={privacyScore >= 80 ? COLORS.success : privacyScore >= 60 ? '#FFA500' : COLORS.error}
              style={styles.scoreProgress}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderHeaderSection = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.headerGradient}
    >
      <Icon name="security" size={60} color="#fff" />
      <Text style={styles.headerTitle}>Privacy & Security</Text>
      <Text style={styles.headerSubtitle}>
        Control your data and protect your privacy
      </Text>
      
      {/* Quick Stats */}
      <View style={styles.quickStatsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{dataUsage.totalData}</Text>
          <Text style={styles.statLabel}>Data Stored</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{loginActivity.length}</Text>
          <Text style={styles.statLabel}>Active Devices</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {settings.twoFactorAuth ? 'ON' : 'OFF'}
          </Text>
          <Text style={styles.statLabel}>2FA Status</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderProfilePrivacy = () => (
    <Card style={styles.sectionCard}>
      <List.Accordion
        title="Profile Privacy"
        titleStyle={styles.accordionTitle}
        left={(props) => <List.Icon {...props} icon="account-circle" color={COLORS.primary} />}
        expanded={expandedSections.profile}
        onPress={() => toggleSection('profile')}
        right={(props) => (
          <Badge
            size={20}
            style={[styles.badge, { backgroundColor: settings.profileVisibility === 'public' ? COLORS.error : COLORS.success }]}
          >
            {settings.profileVisibility === 'public' ? '!' : '✓'}
          </Badge>
        )}
      >
        <View style={styles.settingsContainer}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Profile Visibility</Text>
              <Text style={styles.settingDescription}>Who can see your profile information</Text>
            </View>
          </View>
          <View style={styles.radioGroup}>
            {[
              { value: 'public', label: 'Public', desc: 'Everyone can see your profile' },
              { value: 'friends', label: 'Friends Only', desc: 'Only your connections can see' },
              { value: 'private', label: 'Private', desc: 'Only you can see your profile' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => updateSetting('profileVisibility', option.value)}
              >
                <RadioButton
                  value={option.value}
                  status={settings.profileVisibility === option.value ? 'checked' : 'unchecked'}
                  color={COLORS.primary}
                />
                <View style={styles.radioContent}>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                  <Text style={styles.radioDescription}>{option.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <Divider style={styles.divider} />
          
          {[
            { key: 'shareWorkouts', title: 'Share Workouts', desc: 'Let others see your workout history' },
            { key: 'shareAchievements', title: 'Share Achievements', desc: 'Display your fitness milestones publicly' },
            { key: 'shareProgress', title: 'Share Progress', desc: 'Show your fitness journey progress' },
            { key: 'showOnlineStatus', title: 'Show Online Status', desc: 'Let others know when you\'re active' },
          ].map(({ key, title, desc }) => (
            <View key={key} style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingDescription}>{desc}</Text>
              </View>
              <Switch
                value={settings[key]}
                onValueChange={(value) => updateSetting(key, value)}
                trackColor={{ false: '#e0e0e0', true: COLORS.primary + '50' }}
                thumbColor={settings[key] ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          ))}
        </View>
      </List.Accordion>
    </Card>
  );

  const renderDataCollection = () => (
    <Card style={styles.sectionCard}>
      <List.Accordion
        title="Data Collection"
        titleStyle={styles.accordionTitle}
        left={(props) => <List.Icon {...props} icon="analytics" color={COLORS.primary} />}
        expanded={expandedSections.data}
        onPress={() => toggleSection('data')}
      >
        <View style={styles.settingsContainer}>
          {[
            { key: 'dataCollection', title: 'Basic Data Collection', desc: 'Help improve the app with usage data' },
            { key: 'analyticsData', title: 'Analytics Data', desc: 'Anonymous usage statistics' },
            { key: 'crashReports', title: 'Crash Reports', desc: 'Automatic crash reporting for bug fixes' },
            { key: 'performanceData', title: 'Performance Data', desc: 'App performance monitoring' },
            { key: 'locationTracking', title: 'Location Tracking', desc: 'Track workouts by location (GPS)' },
            { key: 'biometricData', title: 'Biometric Data', desc: 'Heart rate, steps, and health metrics' },
            { key: 'healthData', title: 'Health Data Integration', desc: 'Sync with health apps and devices' },
          ].map(({ key, title, desc }) => (
            <View key={key} style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingDescription}>{desc}</Text>
              </View>
              <Switch
                value={settings[key]}
                onValueChange={(value) => updateSetting(key, value)}
                trackColor={{ false: '#e0e0e0', true: COLORS.primary + '50' }}
                thumbColor={settings[key] ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          ))}
        </View>
      </List.Accordion>
    </Card>
  );

  const renderSecurity = () => (
    <Card style={styles.sectionCard}>
      <List.Accordion
        title="Security Settings"
        titleStyle={styles.accordionTitle}
        left={(props) => <List.Icon {...props} icon="lock" color={COLORS.primary} />}
        expanded={expandedSections.security}
        onPress={() => toggleSection('security')}
        right={(props) => (
          <Badge
            size={20}
            style={[styles.badge, { backgroundColor: settings.twoFactorAuth ? COLORS.success : COLORS.error }]}
          >
            {settings.twoFactorAuth ? '✓' : '!'}
          </Badge>
        )}
      >
        <View style={styles.settingsContainer}>
          <TouchableOpacity
            style={styles.securityButton}
            onPress={() => Alert.alert('Feature Coming Soon', 'Two-Factor Authentication will be available in the next update!')}
          >
            <View style={styles.securityButtonContent}>
              <Icon name="security" size={24} color={COLORS.primary} />
              <View style={styles.securityButtonInfo}>
                <Text style={styles.securityButtonTitle}>Two-Factor Authentication</Text>
                <Text style={styles.securityButtonDesc}>
                  {settings.twoFactorAuth ? 'Enabled - Your account is secure' : 'Recommended - Protect your account'}
                </Text>
              </View>
              <Switch
                value={settings.twoFactorAuth}
                onValueChange={(value) => updateSetting('twoFactorAuth', value)}
                trackColor={{ false: '#e0e0e0', true: COLORS.primary + '50' }}
                thumbColor={settings.twoFactorAuth ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          </TouchableOpacity>
          
          <Divider style={styles.divider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Session Timeout</Text>
              <Text style={styles.settingDescription}>Auto-logout after inactivity</Text>
            </View>
          </View>
          <View style={styles.chipContainer}>
            {[15, 30, 60, 120].map((minutes) => (
              <Chip
                key={minutes}
                selected={settings.sessionTimeout === minutes}
                onPress={() => updateSetting('sessionTimeout', minutes)}
                style={[
                  styles.chip,
                  settings.sessionTimeout === minutes && styles.selectedChip,
                ]}
                textStyle={[
                  styles.chipText,
                  settings.sessionTimeout === minutes && styles.selectedChipText,
                ]}
              >
                {minutes} min
              </Chip>
            ))}
          </View>
          
          <Divider style={styles.divider} />
          
          {[
            { key: 'deviceTrust', title: 'Trust This Device', desc: 'Remember this device for faster login' },
            { key: 'loginNotifications', title: 'Login Notifications', desc: 'Get notified of new logins' },
          ].map(({ key, title, desc }) => (
            <View key={key} style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingDescription}>{desc}</Text>
              </View>
              <Switch
                value={settings[key]}
                onValueChange={(value) => updateSetting(key, value)}
                trackColor={{ false: '#e0e0e0', true: COLORS.primary + '50' }}
                thumbColor={settings[key] ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          ))}
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowLoginActivityModal(true)}
          >
            <Icon name="devices" size={24} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>View Login Activity</Text>
            <Icon name="chevron-right" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </List.Accordion>
    </Card>
  );

  const renderDataManagement = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Text style={styles.sectionDescription}>
          Manage your personal data and exercise your privacy rights
        </Text>
        
        <View style={styles.dataStatsContainer}>
          <Text style={styles.dataStatsTitle}>Your Data Usage</Text>
          {Object.entries(dataUsage).map(([category, size]) => (
            <View key={category} style={styles.dataStatRow}>
              <Text style={styles.dataStatLabel}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              <Text style={styles.dataStatValue}>{size}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <Button
            mode="outlined"
            onPress={() => setShowDataExportModal(true)}
            style={styles.dataActionButton}
            icon="download"
          >
            Export My Data
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Feature Coming Soon', 'Data correction will be available in the next update!')}
            style={styles.dataActionButton}
            icon="edit"
          >
            Request Data Correction
          </Button>
          
          <Button
            mode="contained"
            onPress={() => setShowDeleteConfirm(true)}
            style={[styles.dataActionButton, styles.dangerButton]}
            icon="delete-forever"
            buttonColor={COLORS.error}
          >
            Delete My Account
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderThirdPartyServices = () => (
    <Card style={styles.sectionCard}>
      <List.Accordion
        title="Third-Party Services"
        titleStyle={styles.accordionTitle}
        left={(props) => <List.Icon {...props} icon="link" color={COLORS.primary} />}
        expanded={expandedSections.thirdParty}
        onPress={() => toggleSection('thirdParty')}
      >
        <View style={styles.settingsContainer}>
          {[
            { key: 'contactSync', title: 'Contact Sync', desc: 'Find friends from your contacts' },
            { key: 'socialMediaSync', title: 'Social Media Integration', desc: 'Connect with social platforms' },
            { key: 'thirdPartySharing', title: 'Third-Party Data Sharing', desc: 'Share data with partner apps' },
            { key: 'marketingEmails', title: 'Marketing Emails', desc: 'Receive promotional content' },
            { key: 'researchParticipation', title: 'Research Participation', desc: 'Anonymous research studies' },
          ].map(({ key, title, desc }) => (
            <View key={key} style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingDescription}>{desc}</Text>
              </View>
              <Switch
                value={settings[key]}
                onValueChange={(value) => updateSetting(key, value)}
                trackColor={{ false: '#e0e0e0', true: COLORS.primary + '50' }}
                thumbColor={settings[key] ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          ))}
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Feature Coming Soon', 'Connected services management will be available in the next update!')}
          >
            <Icon name="settings-applications" size={24} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Manage Connected Services</Text>
            <Icon name="chevron-right" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </List.Accordion>
    </Card>
  );

  const renderLegalInfo = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Legal & Compliance</Text>
        <View style={styles.legalContainer}>
          <TouchableOpacity
            style={styles.legalButton}
            onPress={() => Alert.alert('Feature Coming Soon', 'Privacy Policy will be available in the next update!')}
          >
            <Icon name="policy" size={24} color={COLORS.primary} />
            <Text style={styles.legalButtonText}>Privacy Policy</Text>
            <Icon name="open-in-new" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.legalButton}
            onPress={() => Alert.alert('Feature Coming Soon', 'Terms of Service will be available in the next update!')}
          >
            <Icon name="description" size={24} color={COLORS.primary} />
            <Text style={styles.legalButtonText}>Terms of Service</Text>
            <Icon name="open-in-new" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.legalButton}
            onPress={() => Alert.alert('Feature Coming Soon', 'Data Processing Agreement will be available in the next update!')}
          >
            <Icon name="handshake" size={24} color={COLORS.primary} />
            <Text style={styles.legalButtonText}>Data Processing Agreement</Text>
            <Icon name="open-in-new" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderLoginActivityModal = () => (
    <Portal>
      <Modal
        visible={showLoginActivityModal}
        onDismiss={() => setShowLoginActivityModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        >
          <Text style={styles.modalTitle}>Login Activity</Text>
          <ScrollView style={styles.modalScrollView}>
            {loginActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityHeader}>
                  <Icon
                    name={activity.device.toLowerCase().includes('iphone') ? 'smartphone' : 
                          activity.device.toLowerCase().includes('mac') ? 'laptop' : 'tablet'}
                    size={24}
                    color={activity.status === 'active' ? COLORS.success : COLORS.secondary}
                  />
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityDevice}>{activity.device}</Text>
                    <Text style={styles.activityLocation}>{activity.location}</Text>
                  </View>
                  <View style={styles.activityStatus}>
                    <Badge
                      size={8}
                      style={{
                        backgroundColor: activity.status === 'active' ? COLORS.success : COLORS.secondary
                      }}
                    />
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <Button
            mode="outlined"
            onPress={() => setShowLoginActivityModal(false)}
            style={styles.modalCloseButton}
          >
            Close
          </Button>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderDataExportModal = () => (
    <Portal>
      <Modal
        visible={showDataExportModal}
        onDismiss={() => setShowDataExportModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        >
          <Icon name="download" size={48} color={COLORS.primary} />
          <Text style={styles.modalTitle}>Export Your Data</Text>
          <Text style={styles.modalDescription}>
            We'll prepare a comprehensive export of all your data including:
          </Text>
          <View style={styles.exportList}>
            <Text style={styles.exportItem}>• Profile information and settings</Text>
            <Text style={styles.exportItem}>• Workout history and progress</Text>
            <Text style={styles.exportItem}>• Achievements and milestones</Text>
            <Text style={styles.exportItem}>• Messages and communications</Text>
            <Text style={styles.exportItem}>• Photos and videos</Text>
          </View>
          <Text style={styles.exportNote}>
            You'll receive an email with download instructions within 24 hours.
          </Text>
          <View style={styles.modalButtonContainer}>
            <Button
              mode="contained"
              onPress={handleDataExport}
              style={styles.modalButton}
              icon="download"
            >
              Request Export
            </Button>
            <Button
              mode="outlined"
              onPress={() => setShowDataExportModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderDeleteConfirmModal = () => (
    <Portal>
      <Modal
        visible={showDeleteConfirm}
        onDismiss={() => {
          setShowDeleteConfirm(false);
          setDeleteStep(0);
        }}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        >
          <Icon name="warning" size={48} color={COLORS.error} />
          <Text style={styles.modalTitle}>Delete Account</Text>
          {deleteStep === 0 ? (
            <>
              <Text style={styles.modalDescription}>
                This action cannot be undone. Deleting your account will:
              </Text>
              <View style={styles.deleteWarningList}>
                <Text style={styles.deleteWarningItem}>• Permanently delete all your data</Text>
                <Text style={styles.deleteWarningItem}>• Remove your workout history</Text>
                <Text style={styles.deleteWarningItem}>• Delete your achievements</Text>
                <Text style={styles.deleteWarningItem}>• Cancel any active subscriptions</Text>
                <Text style={styles.deleteWarningItem}>• Remove you from all groups</Text>
              </View>
              <Text style={styles.deleteNote}>
                Consider exporting your data first if you want to keep a copy.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.modalDescription}>
                Are you absolutely sure? This is your final warning.
              </Text>
              <Text style={styles.deleteNote}>
                Your account and all associated data will be permanently deleted within 30 days.
              </Text>
            </>
          )}
          <View style={styles.modalButtonContainer}>
            <Button
              mode="contained"
              onPress={handleAccountDeletion}
              style={[styles.modalButton, styles.dangerButton]}
              buttonColor={COLORS.error}
              icon="delete-forever"
            >
              {deleteStep === 0 ? 'Continue Deletion' : 'Delete Forever'}
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                setShowDeleteConfirm(false);
                setDeleteStep(0);
              }}
              style={styles.modalButton}
            >
              Cancel
            </Button>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.primary}
          translucent
        />
        <Icon name="security" size={60} color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading privacy settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent
      />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              progressBackgroundColor="#fff"
            />
          }
        >
          {renderHeaderSection()}
          {renderPrivacyScore()}
          {renderProfilePrivacy()}
          {renderDataCollection()}
          {renderSecurity()}
          {renderThirdPartyServices()}
          {renderDataManagement()}
          {renderLegalInfo()}
          
          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </Animated.View>

      {renderLoginActivityModal()}
      {renderDataExportModal()}
      {renderDeleteConfirmModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    ...TEXT_STYLES.body1,
    marginTop: SPACING.md,
    textAlign: 'center',
    color: COLORS.secondary,
  },
  headerGradient: {
    paddingTop: SPACING.xl * 2,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#fff',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body1,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: '#fff',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  scoreCard: {
    margin: SPACING.md,
    elevation: 4,
    backgroundColor: '#fff',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  scoreNumber: {
    ...TEXT_STYLES.h1,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  scoreLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  scoreDescription: {
    ...TEXT_STYLES.body2,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  scoreProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
  },
  sectionCard: {
    margin: SPACING.md,
    elevation: 3,
    backgroundColor: '#fff',
  },
  accordionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  settingsContainer: {
    padding: SPACING.md,
  },
  settingRow: {
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
    ...TEXT_STYLES.body1,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  radioGroup: {
    marginVertical: SPACING.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  radioContent: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  radioLabel: {
    ...TEXT_STYLES.body1,
    fontWeight: '600',
  },
  radioDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  chip: {
    backgroundColor: '#f5f5f5',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.secondary,
  },
  selectedChipText: {
    color: '#fff',
  },
  divider: {
    marginVertical: SPACING.md,
    backgroundColor: '#e0e0e0',
  },
  securityButton: {
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: SPACING.md,
  },
  securityButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  securityButtonInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  securityButtonTitle: {
    ...TEXT_STYLES.body1,
    fontWeight: '600',
    color: COLORS.text,
  },
  securityButtonDesc: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginVertical: SPACING.xs,
  },
  actionButtonText: {
    ...TEXT_STYLES.body1,
    flex: 1,
    marginLeft: SPACING.md,
    color: COLORS.text,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  sectionDescription: {
    ...TEXT_STYLES.body2,
    color: COLORS.secondary,
    marginBottom: SPACING.lg,
  },
  dataStatsContainer: {
    backgroundColor: '#f8f9fa',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  dataStatsTitle: {
    ...TEXT_STYLES.body1,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  dataStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  dataStatLabel: {
    ...TEXT_STYLES.body2,
    color: COLORS.secondary,
  },
  dataStatValue: {
    ...TEXT_STYLES.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionButtonsContainer: {
    gap: SPACING.md,
  },
  dataActionButton: {
    marginVertical: SPACING.xs,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  legalContainer: {
    gap: SPACING.sm,
  },
  legalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  legalButtonText: {
    ...TEXT_STYLES.body1,
    flex: 1,
    marginLeft: SPACING.md,
    color: COLORS.text,
  },
  modalContainer: {
    margin: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  blurView: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    marginVertical: SPACING.md,
    textAlign: 'center',
    color: COLORS.text,
  },
  modalDescription: {
    ...TEXT_STYLES.body1,
    textAlign: 'center',
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  modalScrollView: {
    maxHeight: 300,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  activityItem: {
    marginBottom: SPACING.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  activityInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  activityDevice: {
    ...TEXT_STYLES.body1,
    fontWeight: '600',
  },
  activityLocation: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  activityStatus: {
    alignItems: 'center',
  },
  activityTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  exportList: {
    alignSelf: 'stretch',
    marginVertical: SPACING.md,
  },
  exportItem: {
    ...TEXT_STYLES.body2,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  exportNote: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
  },
  deleteWarningList: {
    alignSelf: 'stretch',
    marginVertical: SPACING.md,
  },
  deleteWarningItem: {
    ...TEXT_STYLES.body2,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  deleteNote: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
  },
  modalButtonContainer: {
    width: '100%',
    gap: SPACING.sm,
  },
  modalButton: {
    marginVertical: SPACING.xs,
  },
  modalCloseButton: {
    marginTop: SPACING.md,
    width: '100%',
  },
};

export default Privacy;
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  TouchableOpacity,
  Switch,
  Vibration,
  Linking,
} from 'react-native';
import { 
  Card,
  Button,
  Surface,
  Portal,
  Modal,
  Divider,
  List,
  IconButton,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const PrivacySettings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { privacySettings } = useSelector((state) => state.athlete);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [dataExportModalVisible, setDataExportModalVisible] = useState(false);
  const [privacyScore, setPrivacyScore] = useState(0);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Privacy settings state
  const [settings, setSettings] = useState({
    profileVisibility: 'friends', // 'public', 'friends', 'private'
    showRealName: true,
    showAge: true,
    showLocation: false,
    showPerformanceStats: true,
    showTrainingHistory: false,
    allowCoachInvites: true,
    allowParentAccess: true,
    showOnlineStatus: false,
    allowDirectMessages: true,
    shareProgressWithTeam: true,
    showAchievements: true,
    dataCollection: true,
    analyticsTracking: false,
    marketingEmails: false,
    pushNotifications: true,
    locationTracking: false,
    performanceAnalytics: true,
  });

  const [dataUsage, setDataUsage] = useState({
    storageUsed: '45.2 MB',
    lastBackup: '2 days ago',
    trainingSessions: 127,
    messagesExchanged: 1_203,
    photosUploaded: 34,
    videosUploaded: 8,
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: 'Profile viewed by Coach Martinez', time: '2 hours ago', type: 'view' },
    { id: 2, action: 'Performance data shared with team', time: '1 day ago', type: 'share' },
    { id: 3, action: 'Training video uploaded', time: '3 days ago', type: 'upload' },
    { id: 4, action: 'Message from teammate', time: '5 days ago', type: 'message' },
  ]);

  useEffect(() => {
    // Initialize animations
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

    // Calculate privacy score
    calculatePrivacyScore();
  }, [settings]);

  const calculatePrivacyScore = () => {
    const totalSettings = Object.keys(settings).length;
    const privateSettings = Object.values(settings).filter(value => 
      value === false || value === 'private' || value === 'friends'
    ).length;
    const score = Math.round((privateSettings / totalSettings) * 100);
    setPrivacyScore(score);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call to refresh privacy settings
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleSettingChange = (settingKey, value) => {
    // Show confirmation for critical privacy changes
    const criticalSettings = ['profileVisibility', 'allowParentAccess', 'dataCollection'];
    
    if (criticalSettings.includes(settingKey) && value !== settings[settingKey]) {
      setConfirmAction({ settingKey, value });
      setConfirmModalVisible(true);
      Vibration.vibrate(100);
    } else {
      updateSetting(settingKey, value);
    }
  };

  const updateSetting = (settingKey, value) => {
    setSettings(prev => ({
      ...prev,
      [settingKey]: value
    }));
    
    // Provide user feedback
    Vibration.vibrate(50);
  };

  const confirmSettingChange = () => {
    if (confirmAction) {
      updateSetting(confirmAction.settingKey, confirmAction.value);
      setConfirmModalVisible(false);
      setConfirmAction(null);
    }
  };

  const handleDataExport = () => {
    setDataExportModalVisible(true);
  };

  const exportUserData = (format) => {
    Alert.alert(
      'Export Started! 📊',
      `Your data export in ${format} format has been initiated. You'll receive an email when it's ready for download.`,
      [{ text: 'Got it!' }]
    );
    setDataExportModalVisible(false);
  };

  const handleAccountDeletion = () => {
    Alert.alert(
      'Delete Account ⚠️',
      'This action cannot be undone. All your data, progress, and connections will be permanently deleted. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Forever', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Feature Coming Soon! 🚧', 'Account deletion will be available in the next update.');
          }
        }
      ]
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://yourapp.com/privacy-policy');
  };

  const SettingCard = ({ title, children, icon, description }) => (
    <Card style={styles.settingCard}>
      <Surface style={styles.cardHeader}>
        <View style={styles.cardHeaderContent}>
          <MaterialIcons name={icon} size={24} color={COLORS.primary} />
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            {description && (
              <Text style={styles.cardDescription}>{description}</Text>
            )}
          </View>
        </View>
      </Surface>
      <View style={styles.cardContent}>
        {children}
      </View>
    </Card>
  );

  const SettingRow = ({ label, description, value, onValueChange, type = 'switch', options = [] }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={value ? 'white' : COLORS.secondary}
        />
      )}
      
      {type === 'select' && (
        <View style={styles.selectContainer}>
          {options.map((option) => (
            <Chip
              key={option.value}
              selected={value === option.value}
              onPress={() => onValueChange(option.value)}
              style={[
                styles.selectChip,
                value === option.value && styles.selectedChip
              ]}
              textStyle={value === option.value && styles.selectedChipText}
            >
              {option.label}
            </Chip>
          ))}
        </View>
      )}
    </View>
  );

  const ActivityItem = ({ activity }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <MaterialIcons 
          name={
            activity.type === 'view' ? 'visibility' :
            activity.type === 'share' ? 'share' :
            activity.type === 'upload' ? 'cloud-upload' :
            'message'
          } 
          size={20} 
          color={COLORS.primary} 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>{activity.action}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
    </View>
  );

  const getPrivacyScoreColor = () => {
    if (privacyScore >= 70) return COLORS.success;
    if (privacyScore >= 40) return '#FFA726';
    return COLORS.error;
  };

  const getPrivacyScoreLabel = () => {
    if (privacyScore >= 70) return 'High Privacy 🛡️';
    if (privacyScore >= 40) return 'Medium Privacy ⚖️';
    return 'Low Privacy ⚠️';
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="white"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>Privacy Settings</Text>
          <Text style={styles.headerSubtitle}>Control your data and visibility</Text>
          
          <View style={styles.privacyScoreContainer}>
            <Text style={styles.privacyScoreLabel}>{getPrivacyScoreLabel()}</Text>
            <ProgressBar 
              progress={privacyScore / 100} 
              color={getPrivacyScoreColor()}
              style={styles.privacyScoreBar}
            />
            <Text style={styles.privacyScoreText}>{privacyScore}/100</Text>
          </View>
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
          {/* Profile Visibility */}
          <SettingCard 
            title="Profile Visibility" 
            icon="visibility"
            description="Control who can see your profile information"
          >
            <SettingRow
              label="Profile Visibility"
              description="Choose who can view your profile"
              value={settings.profileVisibility}
              onValueChange={(value) => handleSettingChange('profileVisibility', value)}
              type="select"
              options={[
                { label: 'Public', value: 'public' },
                { label: 'Friends', value: 'friends' },
                { label: 'Private', value: 'private' }
              ]}
            />
            
            <Divider style={styles.divider} />
            
            <SettingRow
              label="Show Real Name"
              description="Display your full name on your profile"
              value={settings.showRealName}
              onValueChange={(value) => handleSettingChange('showRealName', value)}
            />
            
            <SettingRow
              label="Show Age"
              description="Make your age visible to others"
              value={settings.showAge}
              onValueChange={(value) => handleSettingChange('showAge', value)}
            />
            
            <SettingRow
              label="Show Location"
              description="Display your location information"
              value={settings.showLocation}
              onValueChange={(value) => handleSettingChange('showLocation', value)}
            />
            
            <SettingRow
              label="Show Achievements"
              description="Display your badges and accomplishments"
              value={settings.showAchievements}
              onValueChange={(value) => handleSettingChange('showAchievements', value)}
            />
          </SettingCard>

          {/* Training & Performance */}
          <SettingCard 
            title="Training & Performance" 
            icon="fitness-center"
            description="Control sharing of your athletic data"
          >
            <SettingRow
              label="Performance Stats"
              description="Show your training statistics"
              value={settings.showPerformanceStats}
              onValueChange={(value) => handleSettingChange('showPerformanceStats', value)}
            />
            
            <SettingRow
              label="Training History"
              description="Make your training log visible"
              value={settings.showTrainingHistory}
              onValueChange={(value) => handleSettingChange('showTrainingHistory', value)}
            />
            
            <SettingRow
              label="Share Progress with Team"
              description="Allow teammates to see your progress"
              value={settings.shareProgressWithTeam}
              onValueChange={(value) => handleSettingChange('shareProgressWithTeam', value)}
            />
            
            <SettingRow
              label="Performance Analytics"
              description="Enable detailed performance tracking"
              value={settings.performanceAnalytics}
              onValueChange={(value) => handleSettingChange('performanceAnalytics', value)}
            />
          </SettingCard>

          {/* Communication */}
          <SettingCard 
            title="Communication" 
            icon="chat"
            description="Manage how others can contact you"
          >
            <SettingRow
              label="Allow Coach Invites"
              description="Let coaches send you training invitations"
              value={settings.allowCoachInvites}
              onValueChange={(value) => handleSettingChange('allowCoachInvites', value)}
            />
            
            <SettingRow
              label="Allow Parent Access"
              description="Let parents view your training data"
              value={settings.allowParentAccess}
              onValueChange={(value) => handleSettingChange('allowParentAccess', value)}
            />
            
            <SettingRow
              label="Direct Messages"
              description="Allow others to message you directly"
              value={settings.allowDirectMessages}
              onValueChange={(value) => handleSettingChange('allowDirectMessages', value)}
            />
            
            <SettingRow
              label="Show Online Status"
              description="Let others see when you're online"
              value={settings.showOnlineStatus}
              onValueChange={(value) => handleSettingChange('showOnlineStatus', value)}
            />
          </SettingCard>

          {/* Data & Analytics */}
          <SettingCard 
            title="Data & Analytics" 
            icon="analytics"
            description="Control data collection and usage"
          >
            <SettingRow
              label="Data Collection"
              description="Allow app to collect usage data for improvements"
              value={settings.dataCollection}
              onValueChange={(value) => handleSettingChange('dataCollection', value)}
            />
            
            <SettingRow
              label="Analytics Tracking"
              description="Enable detailed app usage analytics"
              value={settings.analyticsTracking}
              onValueChange={(value) => handleSettingChange('analyticsTracking', value)}
            />
            
            <SettingRow
              label="Location Tracking"
              description="Allow location-based features"
              value={settings.locationTracking}
              onValueChange={(value) => handleSettingChange('locationTracking', value)}
            />
            
            <SettingRow
              label="Marketing Emails"
              description="Receive promotional content via email"
              value={settings.marketingEmails}
              onValueChange={(value) => handleSettingChange('marketingEmails', value)}
            />
          </SettingCard>

          {/* Data Usage Overview */}
          <Card style={styles.settingCard}>
            <Surface style={styles.cardHeader}>
              <View style={styles.cardHeaderContent}>
                <MaterialIcons name="storage" size={24} color={COLORS.primary} />
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>Data Usage</Text>
                  <Text style={styles.cardDescription}>Overview of your stored data</Text>
                </View>
              </View>
            </Surface>
            <View style={styles.cardContent}>
              <View style={styles.dataStatsGrid}>
                <View style={styles.dataStat}>
                  <Text style={styles.dataStatValue}>{dataUsage.storageUsed}</Text>
                  <Text style={styles.dataStatLabel}>Storage Used</Text>
                </View>
                <View style={styles.dataStat}>
                  <Text style={styles.dataStatValue}>{dataUsage.trainingSessions}</Text>
                  <Text style={styles.dataStatLabel}>Training Sessions</Text>
                </View>
                <View style={styles.dataStat}>
                  <Text style={styles.dataStatValue}>{dataUsage.messagesExchanged.toLocaleString()}</Text>
                  <Text style={styles.dataStatLabel}>Messages</Text>
                </View>
                <View style={styles.dataStat}>
                  <Text style={styles.dataStatValue}>{dataUsage.photosUploaded}</Text>
                  <Text style={styles.dataStatLabel}>Photos</Text>
                </View>
              </View>
              
              <Text style={styles.lastBackupText}>
                Last backup: {dataUsage.lastBackup}
              </Text>
            </View>
          </Card>

          {/* Recent Activity */}
          <Card style={styles.settingCard}>
            <Surface style={styles.cardHeader}>
              <View style={styles.cardHeaderContent}>
                <MaterialIcons name="history" size={24} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Recent Privacy Activity</Text>
              </View>
            </Surface>
            <View style={styles.cardContent}>
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </View>
          </Card>

          {/* Data Management Actions */}
          <Card style={styles.settingCard}>
            <Surface style={styles.cardHeader}>
              <View style={styles.cardHeaderContent}>
                <MaterialIcons name="admin-panel-settings" size={24} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Data Management</Text>
              </View>
            </Surface>
            <View style={styles.cardContent}>
              <Button
                mode="outlined"
                onPress={handleDataExport}
                style={styles.actionButton}
                icon="download"
              >
                Export My Data
              </Button>
              
              <Button
                mode="outlined"
                onPress={openPrivacyPolicy}
                style={styles.actionButton}
                icon="description"
              >
                Privacy Policy
              </Button>
              
              <Button
                mode="contained"
                onPress={handleAccountDeletion}
                style={[styles.actionButton, styles.deleteButton]}
                buttonColor={COLORS.error}
                icon="delete-forever"
              >
                Delete Account
              </Button>
            </View>
          </Card>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>

      {/* Confirmation Modal */}
      <Portal>
        <Modal
          visible={confirmModalVisible}
          onDismiss={() => setConfirmModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          >
            <Card style={styles.confirmCard}>
              <MaterialIcons name="security" size={48} color={COLORS.primary} style={styles.confirmIcon} />
              <Text style={styles.confirmTitle}>Confirm Privacy Change</Text>
              <Text style={styles.confirmText}>
                This change will affect how your data is shared and who can access your information. Are you sure you want to proceed?
              </Text>
              
              <View style={styles.confirmActions}>
                <Button
                  mode="outlined"
                  onPress={() => setConfirmModalVisible(false)}
                  style={styles.confirmButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={confirmSettingChange}
                  style={styles.confirmButton}
                  buttonColor={COLORS.primary}
                >
                  Confirm
                </Button>
              </View>
            </Card>
          </BlurView>
        </Modal>
      </Portal>

      {/* Data Export Modal */}
      <Portal>
        <Modal
          visible={dataExportModalVisible}
          onDismiss={() => setDataExportModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          >
            <Card style={styles.exportCard}>
              <MaterialIcons name="download" size={48} color={COLORS.primary} style={styles.exportIcon} />
              <Text style={styles.exportTitle}>Export Your Data 📊</Text>
              <Text style={styles.exportText}>
                Choose the format for your data export:
              </Text>
              
              <View style={styles.exportOptions}>
                <Button
                  mode="contained"
                  onPress={() => exportUserData('JSON')}
                  style={styles.exportButton}
                  buttonColor={COLORS.primary}
                  icon="code-json"
                >
                  JSON Format
                </Button>
                
                <Button
                  mode="contained"
                  onPress={() => exportUserData('CSV')}
                  style={styles.exportButton}
                  buttonColor={COLORS.success}
                  icon="table"
                >
                  CSV Format
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={() => setDataExportModalVisible(false)}
                  style={styles.exportButton}
                >
                  Cancel
                </Button>
              </View>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    </>
  );
};

const styles = {
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.lg,
  },
  privacyScoreContainer: {
    width: '100%',
    alignItems: 'center',
  },
  privacyScoreLabel: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  privacyScoreBar: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  privacyScoreText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  settingCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  cardTitle: {
    ...TEXT_STYLES.h4,
    color: 'white',
    fontWeight: 'bold',
  },
  cardDescription: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    lineHeight: 16,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  selectChip: {
    backgroundColor: COLORS.background,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  selectedChipText: {
    color: 'white',
  },
  divider: {
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  dataStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dataStat: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  dataStatValue: {
    ...TEXT_STYLES.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  dataStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  lastBackupText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  activityTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  actionButton: {
    marginBottom: SPACING.md,
  },
  deleteButton: {
    marginTop: SPACING.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmCard: {
    width: '90%',
    padding: SPACING.xl,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmIcon: {
    marginBottom: SPACING.lg,
  },
  confirmTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  confirmText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  confirmButton: {
    flex: 0.4,
  },
  exportCard: {
    width: '90%',
    padding: SPACING.xl,
    borderRadius: 16,
    alignItems: 'center',
  },
  exportIcon: {
    marginBottom: SPACING.lg,
  },
  exportTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  exportText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  exportOptions: {
    width: '100%',
  },
  exportButton: {
    marginBottom: SPACING.md,
  },
  bottomSpacing: {
    height: SPACING.xl * 2,
  },
};

export default PrivacySettings;
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
  SegmentedButtons,
  List,
  Avatar,
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

const ParentalControls = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, selectedChild } = useSelector(state => state.auth);
  const { parentalControls } = useSelector(state => state.settings);

  const [controls, setControls] = useState({
    // Privacy & Safety
    profileVisibility: 'coaches-only', // public, team-only, coaches-only, private
    allowDirectMessages: false,
    shareProgressPublicly: false,
    allowLocationSharing: false,
    
    // Communication Controls
    approveNewContacts: true,
    moderateGroupChats: true,
    blockUnknownUsers: true,
    requireParentApproval: true,
    
    // Content & Activity
    allowVideoUploads: false,
    allowPhotoSharing: true,
    allowSocialFeatures: true,
    allowMarketplace: false,
    
    // Screen Time & Usage
    dailyTimeLimit: 120, // minutes
    sessionTimeLimit: 60, // minutes
    allowWeekendExtension: true,
    pauseAppDuringStudy: false,
    
    // Data & Analytics
    shareDataWithCoaches: true,
    allowPerformanceTracking: true,
    shareProgressWithTeam: false,
    allowAIRecommendations: true,
    
    // Emergency & Safety
    emergencyContacts: [],
    allowEmergencyBypass: true,
    safetyModeActive: true,
    locationAlertsEnabled: true,
  });

  const [approvedContacts, setApprovedContacts] = useState([
    { id: '1', name: 'Coach Johnson', role: 'Head Coach', avatar: 'CJ', verified: true },
    { id: '2', name: 'Assistant Coach Maria', role: 'Assistant Coach', avatar: 'AM', verified: true },
  ]);

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedModal, setSelectedModal] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved parental controls
    if (parentalControls && selectedChild) {
      setControls(prevControls => ({
        ...prevControls,
        ...parentalControls[selectedChild.id],
      }));
    }
  }, [selectedChild, parentalControls]);

  const handleToggleControl = (controlKey) => {
    setControls(prev => ({
      ...prev,
      [controlKey]: !prev[controlKey],
    }));
    
    // Provide haptic feedback
    Vibration.vibrate(50);
  };

  const handleProfileVisibilityChange = (value) => {
    setControls(prev => ({
      ...prev,
      profileVisibility: value,
    }));
  };

  const handleTimeLimitChange = (type, value) => {
    setControls(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleSaveControls = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dispatch to Redux store
      dispatch({
        type: 'UPDATE_PARENTAL_CONTROLS',
        payload: {
          childId: selectedChild.id,
          controls,
          approvedContacts,
          blockedUsers,
        },
      });

      Alert.alert(
        'Controls Updated! 🛡️',
        `Parental controls for ${selectedChild?.firstName} have been successfully updated.`,
        [{ text: 'Perfect!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'Error Saving Controls',
        'Please check your connection and try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyMode = () => {
    Alert.alert(
      'Emergency Mode 🚨',
      'This will temporarily disable all restrictions and notify emergency contacts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Activate', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Emergency Mode Activated',
              'All restrictions temporarily disabled. Emergency contacts notified.',
              [{ text: 'OK', style: 'default' }]
            );
          }
        },
      ]
    );
  };

  const openModal = (modalType) => {
    setSelectedModal(modalType);
    setModalVisible(true);
  };

  const controlCategories = [
    {
      title: '🔒 Privacy & Safety',
      subtitle: 'Control who can see and interact with your child',
      settings: [
        { 
          key: 'allowDirectMessages', 
          label: 'Allow Direct Messages', 
          description: 'From approved contacts only',
          type: 'toggle'
        },
        { 
          key: 'shareProgressPublicly', 
          label: 'Share Progress Publicly', 
          description: 'Display achievements on public profile',
          type: 'toggle'
        },
        { 
          key: 'allowLocationSharing', 
          label: 'Location Sharing', 
          description: 'Share training location with team',
          type: 'toggle'
        },
      ],
    },
    {
      title: '💬 Communication Controls',
      subtitle: 'Manage who your child can communicate with',
      settings: [
        { 
          key: 'approveNewContacts', 
          label: 'Approve New Contacts', 
          description: 'Parent approval required for new connections',
          type: 'toggle'
        },
        { 
          key: 'moderateGroupChats', 
          label: 'Moderate Group Chats', 
          description: 'Monitor team chat conversations',
          type: 'toggle'
        },
        { 
          key: 'blockUnknownUsers', 
          label: 'Block Unknown Users', 
          description: 'Prevent contact from unverified users',
          type: 'toggle'
        },
      ],
    },
    {
      title: '📱 Content & Activity',
      subtitle: 'Control what your child can share and access',
      settings: [
        { 
          key: 'allowVideoUploads', 
          label: 'Video Uploads', 
          description: 'Allow uploading training videos',
          type: 'toggle'
        },
        { 
          key: 'allowPhotoSharing', 
          label: 'Photo Sharing', 
          description: 'Share photos with team and coaches',
          type: 'toggle'
        },
        { 
          key: 'allowSocialFeatures', 
          label: 'Social Features', 
          description: 'Team chat, celebrations, challenges',
          type: 'toggle'
        },
        { 
          key: 'allowMarketplace', 
          label: 'Marketplace Access', 
          description: 'Book additional training sessions',
          type: 'toggle'
        },
      ],
    },
    {
      title: '📊 Data & Analytics',
      subtitle: 'Control data sharing and tracking',
      settings: [
        { 
          key: 'shareDataWithCoaches', 
          label: 'Share Data with Coaches', 
          description: 'Performance metrics and progress data',
          type: 'toggle'
        },
        { 
          key: 'allowPerformanceTracking', 
          label: 'Performance Tracking', 
          description: 'Track physical and skill development',
          type: 'toggle'
        },
        { 
          key: 'allowAIRecommendations', 
          label: 'AI Recommendations', 
          description: 'Personalized training suggestions',
          type: 'toggle'
        },
      ],
    },
  ];

  const profileVisibilityOptions = [
    { value: 'private', label: 'Private' },
    { value: 'coaches-only', label: 'Coaches Only' },
    { value: 'team-only', label: 'Team Only' },
    { value: 'public', label: 'Public' },
  ];

  const timeLimitOptions = [30, 60, 90, 120, 180, 240];

  const renderControlCategory = (category) => (
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
                value={controls[setting.key]}
                onValueChange={() => handleToggleControl(setting.key)}
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

  const renderProfileVisibility = () => (
    <Card style={styles.categoryCard}>
      <Card.Content>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryTitle}>👁️ Profile Visibility</Text>
            <Text style={styles.categorySubtitle}>Who can see your child's profile</Text>
          </View>
        </View>

        <SegmentedButtons
          value={controls.profileVisibility}
          onValueChange={handleProfileVisibilityChange}
          buttons={[
            { value: 'private', label: 'Private' },
            { value: 'coaches-only', label: 'Coaches' },
            { value: 'team-only', label: 'Team' },
            { value: 'public', label: 'Public' },
          ]}
          style={styles.segmentedButtons}
        />
      </Card.Content>
    </Card>
  );

  const renderScreenTime = () => (
    <Card style={styles.categoryCard}>
      <Card.Content>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryTitle}>⏱️ Screen Time Limits</Text>
            <Text style={styles.categorySubtitle}>Manage app usage time</Text>
          </View>
        </View>

        <View style={styles.timeLimitContainer}>
          <View style={styles.timeLimitItem}>
            <Text style={styles.timeLimitLabel}>Daily Limit</Text>
            <View style={styles.timeLimitOptions}>
              {timeLimitOptions.map(minutes => (
                <Chip
                  key={minutes}
                  mode={controls.dailyTimeLimit === minutes ? 'filled' : 'outlined'}
                  onPress={() => handleTimeLimitChange('dailyTimeLimit', minutes)}
                  style={styles.timeChip}
                  textStyle={styles.timeChipText}
                >
                  {minutes}m
                </Chip>
              ))}
            </View>
          </View>

          <Divider style={styles.settingDivider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Weekend Extension</Text>
              <Text style={styles.settingDescription}>Allow extra time on weekends</Text>
            </View>
            <Switch
              value={controls.allowWeekendExtension}
              onValueChange={() => handleToggleControl('allowWeekendExtension')}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Study Mode</Text>
              <Text style={styles.settingDescription}>Pause app during study hours</Text>
            </View>
            <Switch
              value={controls.pauseAppDuringStudy}
              onValueChange={() => handleToggleControl('pauseAppDuringStudy')}
              color={COLORS.primary}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderApprovedContacts = () => (
    <Card style={styles.categoryCard}>
      <Card.Content>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryTitle}>✅ Approved Contacts</Text>
            <Text style={styles.categorySubtitle}>People who can contact your child</Text>
          </View>
          <IconButton
            icon="person-add"
            iconColor={COLORS.primary}
            size={24}
            onPress={() => openModal('addContact')}
          />
        </View>

        {approvedContacts.map((contact, index) => (
          <View key={contact.id}>
            <View style={styles.contactItem}>
              <Avatar.Text
                size={40}
                label={contact.avatar}
                style={{ backgroundColor: COLORS.primary }}
              />
              <View style={styles.contactInfo}>
                <View style={styles.contactHeader}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  {contact.verified && (
                    <Icon name="verified" size={16} color={COLORS.success} />
                  )}
                </View>
                <Text style={styles.contactRole}>{contact.role}</Text>
              </View>
              <IconButton
                icon="dots-vertical"
                iconColor={COLORS.textSecondary}
                size={20}
                onPress={() => openModal('contactOptions')}
              />
            </View>
            {index < approvedContacts.length - 1 && (
              <Divider style={styles.settingDivider} />
            )}
          </View>
        ))}

        <Button
          mode="outlined"
          onPress={() => openModal('manageContacts')}
          style={styles.manageButton}
          icon="people"
        >
          Manage All Contacts
        </Button>
      </Card.Content>
    </Card>
  );

  const renderEmergencySettings = () => (
    <Card style={[styles.categoryCard, styles.emergencyCard]}>
      <Card.Content>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryTitle}>🚨 Emergency & Safety</Text>
            <Text style={styles.categorySubtitle}>Critical safety controls</Text>
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Safety Mode</Text>
            <Text style={styles.settingDescription}>Enhanced monitoring and restrictions</Text>
          </View>
          <Switch
            value={controls.safetyModeActive}
            onValueChange={() => handleToggleControl('safetyModeActive')}
            color={COLORS.error}
          />
        </View>

        <Divider style={styles.settingDivider} />

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Location Alerts</Text>
            <Text style={styles.settingDescription}>Notify when arriving/leaving training venues</Text>
          </View>
          <Switch
            value={controls.locationAlertsEnabled}
            onValueChange={() => handleToggleControl('locationAlertsEnabled')}
            color={COLORS.primary}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleEmergencyMode}
          style={styles.emergencyButton}
          buttonColor={COLORS.error}
          icon="warning"
        >
          Emergency Override
        </Button>
      </Card.Content>
    </Card>
  );

  const renderActivitySummary = () => (
    <Surface style={styles.summaryCard}>
      <View style={styles.summaryContent}>
        <View style={styles.summaryHeader}>
          <Icon name="timeline" size={24} color={COLORS.primary} />
          <Text style={styles.summaryTitle}>Today's Activity</Text>
        </View>
        
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>45m</Text>
            <Text style={styles.statLabel}>App Usage</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>Training</Text>
          </View>
        </View>
      </View>
    </Surface>
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
            <Text style={styles.headerTitle}>Parental Controls</Text>
            <Text style={styles.headerSubtitle}>
              {selectedChild ? `Managing ${selectedChild.firstName}'s account safety` : 'Child Account Controls'}
            </Text>
          </View>
          <IconButton
            icon="shield-check"
            iconColor="white"
            size={24}
            onPress={() => Alert.alert(
              'Safety First! 🛡️',
              'These controls help keep your child safe while using the app.',
              [{ text: 'Understood', style: 'default' }]
            )}
          />
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
                <View style={styles.safetyStatus}>
                  <Icon name="shield" size={16} color={COLORS.success} />
                  <Text style={styles.safetyStatusText}>
                    Safety Mode: {controls.safetyModeActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              <Chip
                mode="filled"
                style={[styles.statusChip, { backgroundColor: COLORS.success }]}
                textStyle={{ color: 'white', fontSize: 12 }}
              >
                Protected
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Activity Summary */}
        {renderActivitySummary()}

        {/* Profile Visibility */}
        {renderProfileVisibility()}

        {/* Control Categories */}
        {controlCategories.map(renderControlCategory)}

        {/* Screen Time Controls */}
        {renderScreenTime()}

        {/* Approved Contacts */}
        {renderApprovedContacts()}

        {/* Emergency Settings */}
        {renderEmergencySettings()}

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <Button
            mode="contained"
            onPress={handleSaveControls}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            labelStyle={styles.saveButtonLabel}
          >
            {loading ? 'Saving Controls...' : 'Save Parental Controls'}
          </Button>
        </View>

        {/* Help Section */}
        <Surface style={styles.helpCard}>
          <View style={styles.helpContent}>
            <Icon name="help-outline" size={20} color={COLORS.primary} />
            <Text style={styles.helpText}>
              Need help setting up controls? Our support team can guide you through the best safety settings for your child's age and activity level.
            </Text>
          </View>
          <Button
            mode="text"
            onPress={() => Alert.alert(
              'Feature Coming Soon! 🚧',
              'Support chat will be available in the next update.',
              [{ text: 'OK', style: 'default' }]
            )}
            style={styles.helpButton}
          >
            Contact Support
          </Button>
        </Surface>
      </ScrollView>

      {/* Modal for various actions */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              {selectedModal === 'addContact' && (
                <>
                  <Text style={styles.modalTitle}>Add Approved Contact</Text>
                  <Text style={styles.modalSubtitle}>
                    Search for coaches, trainers, or team members to approve for contact
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => {
                      setModalVisible(false);
                      Alert.alert(
                        'Feature Coming Soon! 🚧',
                        'Contact search and approval system is in development.',
                        [{ text: 'OK', style: 'default' }]
                      );
                    }}
                    style={styles.modalButton}
                  >
                    Search Contacts
                  </Button>
                </>
              )}

              {selectedModal === 'manageContacts' && (
                <>
                  <Text style={styles.modalTitle}>Manage Contacts</Text>
                  <Text style={styles.modalSubtitle}>
                    Review, approve, or block contacts for your child
                  </Text>
                  <View style={styles.modalActions}>
                    <Button
                      mode="outlined"
                      onPress={() => setModalVisible(false)}
                      style={styles.modalActionButton}
                    >
                      Pending Requests (2)
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => setModalVisible(false)}
                      style={styles.modalActionButton}
                    >
                      Blocked Users (0)
                    </Button>
                  </View>
                </>
              )}

              <View style={styles.modalButtonContainer}>
                <Button
                  mode="text"
                  onPress={() => setModalVisible(false)}
                >
                  Close
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
    marginHorizontal: SPACING.sm,
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
  safetyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  safetyStatusText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  statusChip: {
    height: 28,
  },
  summaryCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 1,
  },
  summaryContent: {
    
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryTitle: {
    ...TEXT_STYLES.subheading,
    fontSize: 16,
    marginLeft: SPACING.sm,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.heading,
    fontSize: 20,
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  categoryCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  emergencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
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
  segmentedButtons: {
    marginTop: SPACING.sm,
  },
  timeLimitContainer: {
    marginTop: SPACING.sm,
  },
  timeLimitItem: {
    marginBottom: SPACING.md,
  },
  timeLimitLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  timeLimitOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  timeChipText: {
    fontSize: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  contactInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    ...TEXT_STYLES.body,
    fontSize: 15,
    fontWeight: '500',
    marginRight: SPACING.xs,
  },
  contactRole: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  manageButton: {
    marginTop: SPACING.md,
    borderColor: COLORS.primary,
  },
  emergencyButton: {
    marginTop: SPACING.md,
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
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  helpText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
  },
  helpButton: {
    alignSelf: 'flex-end',
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
  modalButton: {
    marginBottom: SPACING.md,
  },
  modalActions: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  modalActionButton: {
    borderColor: COLORS.primary,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
};

export default ParentalControls;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Vibration,
  Switch,
  Slider,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Modal,
  TextInput,
  ProgressBar,
  Divider,
  List,
  RadioButton,
  Checkbox,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Design System
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  border: '#e1e8ed',
  safe: '#4CAF50',
  restricted: '#FF5722',
  parent: '#9C27B0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const ParentalControls = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, parentalSettings } = useSelector(state => state.trainee);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));
  
  // Parental control settings
  const [settings, setSettings] = useState({
    parentalControlsEnabled: true,
    parentalPin: '1234',
    maxDailyTraining: 120, // minutes
    maxWeeklyTraining: 600, // minutes
    allowedTrainingTypes: {
      cardio: true,
      strength: false, // Restricted for safety
      flexibility: true,
      sports: true,
      swimming: true,
      martial_arts: false, // Restricted
    },
    allowedTimeSlots: {
      morning: { enabled: true, start: '06:00', end: '09:00' },
      afternoon: { enabled: true, start: '15:00', end: '18:00' },
      evening: { enabled: false, start: '18:00', end: '20:00' },
    },
    restDayEnforcement: true,
    minimumRestDays: 2,
    intensityLimit: 'moderate', // light, moderate, high
    requireParentApproval: {
      newCoach: true,
      trainingPlan: true,
      competitions: true,
      groupTraining: false,
    },
    allowedCoaches: ['coach_123', 'coach_456'],
    emergencyContacts: [
      { name: 'Mom', phone: '+254700123456', relationship: 'Mother' },
      { name: 'Dad', phone: '+254700654321', relationship: 'Father' },
    ],
    locationTracking: true,
    communicationRestrictions: {
      allowCoachMessages: true,
      allowPeerMessages: false,
      allowGroupChats: true,
      moderateContent: true,
    },
    dataSharing: {
      shareProgressWithParents: true,
      shareLocationWithParents: true,
      shareHealthDataWithCoach: true,
    },
    notifications: {
      notifyParentOfSessions: true,
      notifyParentOfMissedSessions: true,
      notifyParentOfInjuries: true,
      notifyParentOfNewContacts: true,
    },
  });

  // Current activity data for monitoring
  const [activityData, setActivityData] = useState({
    todayTraining: 45, // minutes
    weekTraining: 180, // minutes
    lastSession: new Date(Date.now() - 2 * 60 * 60 * 1000),
    upcomingSessions: 3,
    currentLocation: 'Home',
    activeCoaches: 2,
    recentContacts: ['Coach Sarah', 'Training Buddy Alex'],
    complianceScore: 85,
  });

  const [pinInput, setPinInput] = useState('');
  const [newSchedule, setNewSchedule] = useState({
    day: 'monday',
    startTime: '15:00',
    endTime: '17:00',
    type: 'training',
  });

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    
    // Animate screen entrance
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
    
    loadParentalSettings();
  }, []);

  const loadParentalSettings = useCallback(async () => {
    try {
      // Load parental settings from Redux/API
      // This would integrate with your actual data source
    } catch (error) {
      console.error('Error loading parental settings:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    await loadParentalSettings();
    setRefreshing(false);
  }, [loadParentalSettings]);

  const verifyParentalPin = useCallback((callback) => {
    Alert.prompt(
      'Parental Verification Required 🔒',
      'Please enter your parental PIN to continue:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: (pin) => {
            if (pin === settings.parentalPin) {
              callback();
              Vibration.vibrate(100);
            } else {
              Alert.alert('Access Denied', 'Incorrect PIN. Please try again.');
              Vibration.vibrate([100, 50, 100]);
            }
          },
        },
      ],
      'secure-text'
    );
  }, [settings.parentalPin]);

  const updateSetting = useCallback((path, value) => {
    verifyParentalPin(() => {
      setSettings(prev => {
        const newSettings = { ...prev };
        const keys = path.split('.');
        let current = newSettings;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return newSettings;
      });
    });
  }, [verifyParentalPin]);

  const getComplianceColor = (score) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const getIntensityColor = (level) => {
    switch (level) {
      case 'light': return COLORS.success;
      case 'moderate': return COLORS.warning;
      case 'high': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.parent, COLORS.secondary]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Parental Controls 👨‍👩‍👧‍👦</Text>
          <Text style={styles.headerSubtitle}>Keep your child safe while training</Text>
        </View>
        
        <TouchableOpacity
          onPress={() => verifyParentalPin(() => setShowPinModal(true))}
          style={styles.settingsButton}
        >
          <Icon name="admin-panel-settings" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Text style={styles.statusValue}>
            {settings.parentalControlsEnabled ? 'ACTIVE' : 'INACTIVE'}
          </Text>
          <Text style={styles.statusLabel}>Protection Status</Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={[styles.statusValue, { color: getComplianceColor(activityData.complianceScore) }]}>
            {activityData.complianceScore}%
          </Text>
          <Text style={styles.statusLabel}>Compliance Score</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderQuickStats = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="dashboard" size={20} color={COLORS.info} />
          <Text style={styles.sectionTitle}>Today's Activity Overview</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <Surface style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>
              {activityData.todayTraining}min
            </Text>
            <Text style={styles.statLabel}>Today's Training</Text>
            <ProgressBar
              progress={activityData.todayTraining / settings.maxDailyTraining}
              color={activityData.todayTraining > settings.maxDailyTraining ? COLORS.error : COLORS.primary}
              style={styles.statProgress}
            />
          </Surface>
          
          <Surface style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              {activityData.weekTraining}min
            </Text>
            <Text style={styles.statLabel}>This Week</Text>
            <ProgressBar
              progress={activityData.weekTraining / settings.maxWeeklyTraining}
              color={activityData.weekTraining > settings.maxWeeklyTraining ? COLORS.error : COLORS.success}
              style={styles.statProgress}
            />
          </Surface>
          
          <Surface style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>
              {activityData.upcomingSessions}
            </Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </Surface>
          
          <Surface style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.info }]}>
              {activityData.activeCoaches}
            </Text>
            <Text style={styles.statLabel}>Active Coaches</Text>
          </Surface>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTrainingLimits = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="schedule" size={20} color={COLORS.warning} />
          <Text style={styles.sectionTitle}>Training Limits & Schedule</Text>
          <IconButton
            icon="edit"
            size={20}
            onPress={() => verifyParentalPin(() => setShowScheduleModal(true))}
          />
        </View>
        
        <View style={styles.limitContainer}>
          <Text style={styles.limitLabel}>Daily Limit: {settings.maxDailyTraining} minutes</Text>
          <Slider
            style={styles.slider}
            minimumValue={30}
            maximumValue={180}
            value={settings.maxDailyTraining}
            onSlidingComplete={(value) => updateSetting('maxDailyTraining', Math.round(value))}
            thumbStyle={{ backgroundColor: COLORS.primary }}
            trackStyle={{ backgroundColor: COLORS.border }}
            minimumTrackTintColor={COLORS.primary}
          />
        </View>
        
        <View style={styles.limitContainer}>
          <Text style={styles.limitLabel}>Intensity Level: {settings.intensityLimit}</Text>
          <View style={styles.intensityButtons}>
            {['light', 'moderate', 'high'].map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => updateSetting('intensityLimit', level)}
                style={[
                  styles.intensityButton,
                  { 
                    backgroundColor: settings.intensityLimit === level 
                      ? getIntensityColor(level) 
                      : COLORS.border 
                  }
                ]}
              >
                <Text style={[
                  styles.intensityText,
                  { 
                    color: settings.intensityLimit === level 
                      ? 'white' 
                      : COLORS.text 
                  }
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.schedulePreview}>
          <Text style={styles.scheduleTitle}>Allowed Time Slots:</Text>
          {Object.entries(settings.allowedTimeSlots).map(([slot, config]) => (
            <View key={slot} style={styles.timeSlot}>
              <Chip
                mode={config.enabled ? 'flat' : 'outlined'}
                style={{
                  backgroundColor: config.enabled ? COLORS.success : 'transparent',
                  borderColor: config.enabled ? COLORS.success : COLORS.border,
                }}
                textStyle={{ color: config.enabled ? 'white' : COLORS.text }}
              >
                {slot.charAt(0).toUpperCase() + slot.slice(1)}: {config.start} - {config.end}
              </Chip>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderAllowedActivities = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="sports" size={20} color={COLORS.success} />
          <Text style={styles.sectionTitle}>Allowed Training Types</Text>
        </View>
        
        <View style={styles.activitiesGrid}>
          {Object.entries(settings.allowedTrainingTypes).map(([activity, allowed]) => (
            <View key={activity} style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <Icon
                  name={allowed ? 'check-circle' : 'cancel'}
                  size={20}
                  color={allowed ? COLORS.success : COLORS.error}
                />
                <Text style={[styles.activityName, { marginLeft: SPACING.sm }]}>
                  {activity.replace('_', ' ').charAt(0).toUpperCase() + activity.replace('_', ' ').slice(1)}
                </Text>
              </View>
              <Switch
                value={allowed}
                onValueChange={(value) => updateSetting(`allowedTrainingTypes.${activity}`, value)}
                color={COLORS.primary}
              />
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderSafetySettings = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="security" size={20} color={COLORS.error} />
          <Text style={styles.sectionTitle}>Safety & Communication</Text>
        </View>
        
        <List.Section>
          <List.Item
            title="Location Tracking"
            description="Track your child's location during training"
            left={() => <Icon name="location-on" size={24} color={COLORS.info} />}
            right={() => (
              <Switch
                value={settings.locationTracking}
                onValueChange={(value) => updateSetting('locationTracking', value)}
                color={COLORS.primary}
              />
            )}
          />
          
          <List.Item
            title="Coach Message Approval"
            description="Require approval for new coach communications"
            left={() => <Icon name="message" size={24} color={COLORS.warning} />}
            right={() => (
              <Switch
                value={settings.requireParentApproval.newCoach}
                onValueChange={(value) => updateSetting('requireParentApproval.newCoach', value)}
                color={COLORS.primary}
              />
            )}
          />
          
          <List.Item
            title="Emergency Contacts"
            description={`${settings.emergencyContacts.length} contacts configured`}
            left={() => <Icon name="emergency" size={24} color={COLORS.error} />}
            right={() => <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />}
            onPress={() => verifyParentalPin(() => setShowContactsModal(true))}
          />
          
          <List.Item
            title="Content Moderation"
            description="Filter inappropriate content in communications"
            left={() => <Icon name="shield" size={24} color={COLORS.success} />}
            right={() => (
              <Switch
                value={settings.communicationRestrictions.moderateContent}
                onValueChange={(value) => updateSetting('communicationRestrictions.moderateContent', value)}
                color={COLORS.primary}
              />
            )}
          />
        </List.Section>
      </Card.Content>
    </Card>
  );

  const renderRecentActivity = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Icon name="history" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        
        <View style={styles.activityLog}>
          <View style={styles.logItem}>
            <Icon name="fitness-center" size={16} color={COLORS.success} />
            <Text style={styles.logText}>Completed cardio session - 45 min ago</Text>
          </View>
          
          <View style={styles.logItem}>
            <Icon name="message" size={16} color={COLORS.info} />
            <Text style={styles.logText}>Received message from Coach Sarah - 2h ago</Text>
          </View>
          
          <View style={styles.logItem}>
            <Icon name="location-on" size={16} color={COLORS.warning} />
            <Text style={styles.logText}>Arrived at Sports Center - 3h ago</Text>
          </View>
          
          <View style={styles.logItem}>
            <Icon name="group" size={16} color={COLORS.secondary} />
            <Text style={styles.logText}>Joined group training session - Yesterday</Text>
          </View>
        </View>
        
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('ActivityLog')}
          style={styles.viewMoreButton}
          icon="visibility"
        >
          View Full Activity Log
        </Button>
      </Card.Content>
    </Card>
  );

  const renderPinModal = () => (
    <Portal>
      <Modal
        visible={showPinModal}
        onDismiss={() => setShowPinModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Card style={styles.modalCard}>
            <Card.Title
              title="Change Parental PIN"
              left={(props) => <Avatar.Icon {...props} icon="lock" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="close"
                  onPress={() => setShowPinModal(false)}
                />
              )}
            />
            <Card.Content>
              <Text style={styles.modalDescription}>
                Enter a new 4-digit PIN to secure parental controls:
              </Text>
              
              <TextInput
                label="New PIN"
                value={pinInput}
                onChangeText={setPinInput}
                style={styles.pinInput}
                mode="outlined"
                secureTextEntry
                keyboardType="numeric"
                maxLength={4}
              />
              
              <Text style={styles.pinHint}>
                💡 Choose a PIN that's easy for you to remember but hard for others to guess
              </Text>
            </Card.Content>
            
            <Card.Actions>
              <Button onPress={() => setShowPinModal(false)}>Cancel</Button>
              <Button 
                mode="contained" 
                onPress={() => {
                  if (pinInput.length === 4) {
                    setSettings(prev => ({ ...prev, parentalPin: pinInput }));
                    setPinInput('');
                    setShowPinModal(false);
                    Alert.alert('Success!', 'Parental PIN updated successfully! 🔒');
                  } else {
                    Alert.alert('Error', 'PIN must be 4 digits long');
                  }
                }}
              >
                Update PIN
              </Button>
            </Card.Actions>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderEmergencyButton = () => (
    <Surface style={styles.emergencyContainer}>
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={() => {
          Alert.alert(
            'Emergency Alert',
            'This will immediately notify all emergency contacts and share your location. Continue?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Send Alert',
                style: 'destructive',
                onPress: () => {
                  Alert.alert('Emergency Alert Sent', 'All emergency contacts have been notified! 🚨');
                  Vibration.vibrate([100, 50, 100, 50, 100]);
                }
              }
            ]
          );
        }}
      >
        <Icon name="warning" size={24} color="white" />
        <Text style={styles.emergencyText}>Emergency Alert</Text>
      </TouchableOpacity>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <Animated.View 
        style={[
          styles.animatedContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {renderHeader()}
        
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.parent]}
              tintColor={COLORS.parent}
            />
          }
        >
          {renderQuickStats()}
          {renderTrainingLimits()}
          {renderAllowedActivities()}
          {renderSafetySettings()}
          {renderRecentActivity()}
          {renderEmergencyButton()}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
        
        {renderPinModal()}
      </Animated.View>
      
      <FAB
        style={[styles.fab, { backgroundColor: COLORS.parent }]}
        small={false}
        icon="tune"
        onPress={() => {
          Alert.alert(
            'Quick Settings',
            'What would you like to adjust?',
            [
              { text: 'Training Limits', onPress: () => verifyParentalPin(() => {}) },
              { text: 'Safety Settings', onPress: () => verifyParentalPin(() => {}) },
              { text: 'Emergency Contacts', onPress: () => verifyParentalPin(() => setShowContactsModal(true)) },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  settingsButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusValue: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
  },
  statusLabel: {
    ...TEXT_STYLES.small,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  card: {
    marginVertical: SPACING.sm,
    elevation: 4,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  statValue: {
    ...TEXT_STYLES.h2,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  statProgress: {
    width: '100%',
    height: 4,
    marginTop: SPACING.xs,
    borderRadius: 2,
  },
  limitContainer: {
    marginBottom: SPACING.lg,
  },
  limitLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  intensityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  intensityButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
  },
  intensityText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  schedulePreview: {
    marginTop: SPACING.md,
  },
  scheduleTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  timeSlot: {
    marginBottom: SPACING.sm,
  },
  activitiesGrid: {
    gap: SPACING.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityName: {
    ...TEXT_STYLES.body,
  },
  activityLog: {
    marginBottom: SPACING.md,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  logText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  viewMoreButton: {
    marginTop: SPACING.sm,
  },
  emergencyContainer: {
    margin: SPACING.md,
    borderRadius: 12,
    elevation: 4,
  },
  emergencyButton: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
  },
  emergencyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    marginHorizontal: SPACING.md,
    borderRadius: 12,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  pinInput: {
    marginBottom: SPACING.md,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
  },
  pinHint: {
    ...TEXT_STYLES.caption,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
  bottomSpacing: {
    height: 100,
  },
  scheduleModalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  scheduleModalCard: {
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    maxHeight: '80%',
  },
  scheduleForm: {
    paddingVertical: SPACING.md,
  },
  scheduleFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  scheduleFormLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    flex: 1,
  },
  scheduleFormInput: {
    flex: 2,
    marginLeft: SPACING.md,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  timePickerButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 80,
    alignItems: 'center',
  },
  timePickerText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  dayButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayButtonText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
  },
  dayButtonTextSelected: {
    color: 'white',
  },

  // Contacts Modal styles
  contactsModalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  contactsModalCard: {
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    maxHeight: '80%',
  },
  contactsList: {
    maxHeight: 300,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  contactName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  contactDetails: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addContactButton: {
    margin: SPACING.md,
  },
  addContactForm: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    margin: SPACING.md,
  },
  addContactInput: {
    marginBottom: SPACING.md,
  },
  relationshipPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  relationshipButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  relationshipButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  relationshipButtonText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
  },
  relationshipButtonTextSelected: {
    color: 'white',
  },

  // Additional utility styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  mt8: {
    marginTop: SPACING.sm,
  },
  mt16: {
    marginTop: SPACING.md,
  },
  mb8: {
    marginBottom: SPACING.sm,
  },
  mb16: {
    marginBottom: SPACING.md,
  },
  p16: {
    padding: SPACING.md,
  },
  px16: {
    paddingHorizontal: SPACING.md,
  },
  py8: {
    paddingVertical: SPACING.sm,
  },
  textCenter: {
    textAlign: 'center',
  },
  textBold: {
    fontWeight: 'bold',
  },
  borderRadius8: {
    borderRadius: 8,
  },
  borderRadius12: {
    borderRadius: 12,
  },
  elevation2: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  elevation4: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    ...TEXT_STYLES.body,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    marginTop: SPACING.md,
  },

  // Notification styles
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Accessibility styles
  accessibilityHidden: {
    position: 'absolute',
    left: -10000,
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
});

// Export statement - add this at the bottom of your file:
export default ParentalControls;
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
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/Theme';

const Preferences = ({ navigation }) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Redux state
  const { user, preferences, loading } = useSelector(state => state.auth);
  const { darkMode, units } = useSelector(state => state.settings);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showUnitsModal, setShowUnitsModal] = useState(false);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSettings, setTempSettings] = useState({
    notifications: {
      workoutReminders: true,
      achievementAlerts: true,
      coachMessages: true,
      weeklyProgress: true,
      motivationalQuotes: false,
      socialUpdates: true,
      systemUpdates: true,
    },
    privacy: {
      profileVisibility: 'friends',
      shareWorkouts: true,
      shareAchievements: true,
      shareProgress: false,
      allowCoachAccess: true,
      dataCollection: true,
      analytics: true,
    },
    training: {
      preferredWorkoutTime: 'morning',
      restDayReminders: true,
      autoProgressTracking: true,
      formCheckReminders: true,
      hydrationReminders: true,
      recoveryTracking: true,
      aiRecommendations: true,
    },
    display: {
      theme: 'auto',
      language: 'en',
      units: 'metric',
      timezone: 'auto',
      fontSize: 'medium',
    },
    sound: {
      enableSounds: true,
      enableVibration: true,
      workoutSounds: true,
      achievementSounds: true,
      volume: 0.8,
    },
  });

  // Initialize settings from Redux
  useEffect(() => {
    if (preferences) {
      setTempSettings(prev => ({
        ...prev,
        ...preferences,
      }));
    }
  }, [preferences]);

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
      title: 'Preferences',
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
          icon="check"
          iconColor="#fff"
          size={24}
          onPress={handleSavePreferences}
        />
      ),
    });
  }, [navigation]);

  const handleSavePreferences = useCallback(async () => {
    try {
      dispatch({
        type: 'UPDATE_PREFERENCES_REQUEST',
        payload: tempSettings,
      });

      Vibration.vibrate([50, 100, 50]);
      Alert.alert(
        'Preferences Saved! ✅',
        'Your preferences have been updated successfully.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    }
  }, [tempSettings, dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      dispatch({ type: 'FETCH_PREFERENCES_REQUEST' });
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

  const updateSetting = useCallback((category, key, value) => {
    setTempSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    Vibration.vibrate(30);
  }, []);

  const resetToDefaults = useCallback(() => {
    Alert.alert(
      'Reset to Defaults?',
      'This will reset all preferences to their default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'RESET_PREFERENCES_REQUEST' });
            Vibration.vibrate([100, 50, 100]);
            Alert.alert('Reset Complete! 🔄', 'All preferences have been reset to defaults.');
          },
        },
      ]
    );
  }, [dispatch]);

  const renderHeaderSection = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.headerGradient}
    >
      <Icon name="settings" size={60} color="#fff" />
      <Text style={styles.headerTitle}>Preferences ⚙️</Text>
      <Text style={styles.headerSubtitle}>
        Customize your fitness journey experience
      </Text>
      
      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setShowLanguageModal(true)}
        >
          <Icon name="language" size={20} color="#fff" />
          <Text style={styles.quickActionText}>Language</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setShowUnitsModal(true)}
        >
          <Icon name="straighten" size={20} color="#fff" />
          <Text style={styles.quickActionText}>Units</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={resetToDefaults}
        >
          <Icon name="refresh" size={20} color="#fff" />
          <Text style={styles.quickActionText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderNotificationSettings = () => (
    <Card style={styles.sectionCard}>
      <List.Accordion
        title="Notifications 🔔"
        titleStyle={styles.accordionTitle}
        left={(props) => <List.Icon {...props} icon="notifications" color={COLORS.primary} />}
        expanded={expandedSections.notifications}
        onPress={() => toggleSection('notifications')}
      >
        <View style={styles.settingsContainer}>
          {Object.entries(tempSettings.notifications).map(([key, value]) => (
            <View key={key} style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  {getSettingTitle(key, 'notifications')}
                </Text>
                <Text style={styles.settingDescription}>
                  {getSettingDescription(key, 'notifications')}
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={(newValue) => updateSetting('notifications', key, newValue)}
                trackColor={{ false: '#e0e0e0', true: COLORS.primary + '50' }}
                thumbColor={value ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          ))}
        </View>
      </List.Accordion>
    </Card>
  );

  const renderPrivacySettings = () => (
    <Card style={styles.sectionCard}>
      <List.Accordion
        title="Privacy & Sharing 🔒"
        titleStyle={styles.accordionTitle}
        left={(props) => <List.Icon {...props} icon="privacy-tip" color={COLORS.primary} />}
        expanded={expandedSections.privacy}
        onPress={() => toggleSection('privacy')}
      >
        <View style={styles.settingsContainer}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Profile Visibility</Text>
              <Text style={styles.settingDescription}>Who can see your profile</Text>
            </View>
            <View style={styles.radioGroup}>
              {['public', 'friends', 'private'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOption}
                  onPress={() => updateSetting('privacy', 'profileVisibility', option)}
                >
                  <RadioButton
                    value={option}
                    status={tempSettings.privacy.profileVisibility === option ? 'checked' : 'unchecked'}
                    onPress={() => updateSetting('privacy', 'profileVisibility', option)}
                    color={COLORS.primary}
                  />
                  <Text style={styles.radioLabel}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {Object.entries(tempSettings.privacy)
            .filter(([key]) => key !== 'profileVisibility')
            .map(([key, value]) => (
              <View key={key} style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>
                    {getSettingTitle(key, 'privacy')}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {getSettingDescription(key, 'privacy')}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={(newValue) => updateSetting('privacy', key, newValue)}
                  trackColor={{ false: '#e0e0e0', true: COLORS.primary + '50' }}
                  thumbColor={value ? COLORS.primary : '#f4f3f4'}
                />
              </View>
            ))}
        </View>
      </List.Accordion>
    </Card>
  );

  const renderTrainingSettings = () => (
    <Card style={styles.sectionCard}>
      <List.Accordion
        title="Training Preferences 💪"
        titleStyle={styles.accordionTitle}
        left={(props) => <List.Icon {...props} icon="fitness-center" color={COLORS.primary} />}
        expanded={expandedSections.training}
        onPress={() => toggleSection('training')}
      >
        <View style={styles.settingsContainer}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Preferred Workout Time</Text>
              <Text style={styles.settingDescription}>Best time for workout reminders</Text>
            </View>
          </View>
          <View style={styles.chipContainer}>
            {['morning', 'afternoon', 'evening', 'flexible'].map((time) => (
              <Chip
                key={time}
                selected={tempSettings.training.preferredWorkoutTime === time}
                onPress={() => updateSetting('training', 'preferredWorkoutTime', time)}
                style={[
                  styles.chip,
                  tempSettings.training.preferredWorkoutTime === time && styles.selectedChip,
                ]}
                textStyle={[
                  styles.chipText,
                  tempSettings.training.preferredWorkoutTime === time && styles.selectedChipText,
                ]}
              >
                {time.charAt(0).toUpperCase() + time.slice(1)}
              </Chip>
            ))}
          </View>
          
          <Divider style={styles.divider} />
          
          {Object.entries(tempSettings.training)
            .filter(([key]) => key !== 'preferredWorkoutTime')
            .map(([key, value]) => (
              <View key={key} style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>
                    {getSettingTitle(key, 'training')}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {getSettingDescription(key, 'training')}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={(newValue) => updateSetting('training', key, newValue)}
                  trackColor={{ false: '#e0e0e0', true: COLORS.primary + '50' }}
                  thumbColor={value ? COLORS.primary : '#f4f3f4'}
                />
              </View>
            ))}
        </View>
      </List.Accordion>
    </Card>
  );

  const renderDisplaySettings = () => (
    <Card style={styles.sectionCard}>
      <List.Accordion
        title="Display & Accessibility 🎨"
        titleStyle={styles.accordionTitle}
        left={(props) => <List.Icon {...props} icon="palette" color={COLORS.primary} />}
        expanded={expandedSections.display}
        onPress={() => toggleSection('display')}
      >
        <View style={styles.settingsContainer}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Theme</Text>
              <Text style={styles.settingDescription}>App appearance</Text>
            </View>
          </View>
          <View style={styles.chipContainer}>
            {['light', 'dark', 'auto'].map((theme) => (
              <Chip
                key={theme}
                selected={tempSettings.display.theme === theme}
                onPress={() => updateSetting('display', 'theme', theme)}
                style={[
                  styles.chip,
                  tempSettings.display.theme === theme && styles.selectedChip,
                ]}
                textStyle={[
                  styles.chipText,
                  tempSettings.display.theme === theme && styles.selectedChipText,
                ]}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </Chip>
            ))}
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Font Size</Text>
              <Text style={styles.settingDescription}>Text size throughout the app</Text>
            </View>
          </View>
          <View style={styles.chipContainer}>
            {['small', 'medium', 'large', 'extra-large'].map((size) => (
              <Chip
                key={size}
                selected={tempSettings.display.fontSize === size}
                onPress={() => updateSetting('display', 'fontSize', size)}
                style={[
                  styles.chip,
                  tempSettings.display.fontSize === size && styles.selectedChip,
                ]}
                textStyle={[
                  styles.chipText,
                  tempSettings.display.fontSize === size && styles.selectedChipText,
                ]}
              >
                {size.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Chip>
            ))}
          </View>
        </View>
      </List.Accordion>
    </Card>
  );

  const renderSoundSettings = () => (
    <Card style={styles.sectionCard}>
      <List.Accordion
        title="Sound & Haptics 🔊"
        titleStyle={styles.accordionTitle}
        left={(props) => <List.Icon {...props} icon="volume-up" color={COLORS.primary} />}
        expanded={expandedSections.sound}
        onPress={() => toggleSection('sound')}
      >
        <View style={styles.settingsContainer}>
          {Object.entries(tempSettings.sound)
            .filter(([key]) => key !== 'volume')
            .map(([key, value]) => (
              <View key={key} style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>
                    {getSettingTitle(key, 'sound')}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {getSettingDescription(key, 'sound')}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={(newValue) => updateSetting('sound', key, newValue)}
                  trackColor={{ false: '#e0e0e0', true: COLORS.primary + '50' }}
                  thumbColor={value ? COLORS.primary : '#f4f3f4'}
                />
              </View>
            ))}
        </View>
      </List.Accordion>
    </Card>
  );

  const renderSupportSection = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Help & Support 🆘</Text>
        <View style={styles.supportContainer}>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Alert.alert('Feature Coming Soon', 'Help Center will be available in the next update! 📚')}
          >
            <Icon name="help-outline" size={24} color={COLORS.primary} />
            <Text style={styles.supportButtonText}>Help Center</Text>
            <Icon name="chevron-right" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Alert.alert('Feature Coming Soon', 'Contact Support will be available in the next update! 📞')}
          >
            <Icon name="support-agent" size={24} color={COLORS.primary} />
            <Text style={styles.supportButtonText}>Contact Support</Text>
            <Icon name="chevron-right" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Alert.alert('Feature Coming Soon', 'Send Feedback will be available in the next update! 💬')}
          >
            <Icon name="feedback" size={24} color={COLORS.primary} />
            <Text style={styles.supportButtonText}>Send Feedback</Text>
            <Icon name="chevron-right" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Alert.alert('Feature Coming Soon', 'Privacy Policy will be available in the next update! 📋')}
          >
            <Icon name="privacy-tip" size={24} color={COLORS.primary} />
            <Text style={styles.supportButtonText}>Privacy Policy</Text>
            <Icon name="chevron-right" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderLanguageModal = () => (
    <Portal>
      <Modal
        visible={showLanguageModal}
        onDismiss={() => setShowLanguageModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        >
          <Text style={styles.modalTitle}>Select Language 🌍</Text>
          <ScrollView style={styles.modalScrollView}>
            {[
              { code: 'en', name: 'English', flag: '🇺🇸' },
              { code: 'es', name: 'Español', flag: '🇪🇸' },
              { code: 'fr', name: 'Français', flag: '🇫🇷' },
              { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
              { code: 'it', name: 'Italiano', flag: '🇮🇹' },
              { code: 'pt', name: 'Português', flag: '🇧🇷' },
              { code: 'zh', name: '中文', flag: '🇨🇳' },
              { code: 'ja', name: '日本語', flag: '🇯🇵' },
            ].map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.modalOption,
                  tempSettings.display.language === language.code && styles.selectedOption,
                ]}
                onPress={() => {
                  updateSetting('display', 'language', language.code);
                  setShowLanguageModal(false);
                }}
              >
                <Text style={styles.flagEmoji}>{language.flag}</Text>
                <Text style={styles.optionText}>{language.name}</Text>
                {tempSettings.display.language === language.code && (
                  <Icon name="check" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button
            mode="outlined"
            onPress={() => setShowLanguageModal(false)}
            style={styles.modalCloseButton}
          >
            Close
          </Button>
        </BlurView>
      </Modal>
    </Portal>
  );

  const getSettingTitle = (key, category) => {
    const titles = {
      notifications: {
        workoutReminders: 'Workout Reminders',
        achievementAlerts: 'Achievement Alerts',
        coachMessages: 'Coach Messages',
        weeklyProgress: 'Weekly Progress',
        motivationalQuotes: 'Daily Motivation',
        socialUpdates: 'Social Updates',
        systemUpdates: 'System Updates',
      },
      privacy: {
        shareWorkouts: 'Share Workouts',
        shareAchievements: 'Share Achievements',
        shareProgress: 'Share Progress',
        allowCoachAccess: 'Coach Access',
        dataCollection: 'Data Collection',
        analytics: 'Analytics',
      },
      training: {
        restDayReminders: 'Rest Day Reminders',
        autoProgressTracking: 'Auto Progress Tracking',
        formCheckReminders: 'Form Check Reminders',
        hydrationReminders: 'Hydration Reminders',
        recoveryTracking: 'Recovery Tracking',
        aiRecommendations: 'AI Recommendations',
      },
      sound: {
        enableSounds: 'Enable Sounds',
        enableVibration: 'Enable Vibration',
        workoutSounds: 'Workout Sounds',
        achievementSounds: 'Achievement Sounds',
      },
    };
    return titles[category]?.[key] || key;
  };

  const getSettingDescription = (key, category) => {
    const descriptions = {
      notifications: {
        workoutReminders: 'Get notified about upcoming workouts',
        achievementAlerts: 'Celebrate your fitness milestones',
        coachMessages: 'Receive messages from your coach',
        weeklyProgress: 'Weekly summary of your progress',
        motivationalQuotes: 'Daily inspiration to keep you motivated',
        socialUpdates: 'Updates from your fitness community',
        systemUpdates: 'Important app updates and announcements',
      },
      privacy: {
        shareWorkouts: 'Allow others to see your workout history',
        shareAchievements: 'Show your achievements to friends',
        shareProgress: 'Share your progress publicly',
        allowCoachAccess: 'Let your coach view your detailed data',
        dataCollection: 'Help improve the app with anonymous data',
        analytics: 'Enable usage analytics for better experience',
      },
      training: {
        restDayReminders: 'Get reminded to take rest days',
        autoProgressTracking: 'Automatically track your progress',
        formCheckReminders: 'Reminders to check your exercise form',
        hydrationReminders: 'Stay hydrated during workouts',
        recoveryTracking: 'Monitor your recovery between sessions',
        aiRecommendations: 'Get personalized AI-powered suggestions',
      },
      sound: {
        enableSounds: 'Play app sounds and notifications',
        enableVibration: 'Use vibration for feedback',
        workoutSounds: 'Play sounds during workouts',
        achievementSounds: 'Play sounds for achievements',
      },
    };
    return descriptions[category]?.[key] || '';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.primary}
          translucent
        />
        <Icon name="settings" size={60} color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading preferences...</Text>
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
          {renderNotificationSettings()}
          {renderPrivacySettings()}
          {renderTrainingSettings()}
          {renderDisplaySettings()}
          {renderSoundSettings()}
          {renderSupportSection()}
          
          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </Animated.View>

      {renderLanguageModal()}
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
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 80,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    color: '#fff',
    marginTop: SPACING.xs,
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
    flexDirection: 'column',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  radioLabel: {
    ...TEXT_STYLES.body2,
    marginLeft: SPACING.sm,
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
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  supportContainer: {
    gap: SPACING.sm,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  supportButtonText: {
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
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    color: COLORS.text,
  },
  modalScrollView: {
    maxHeight: 300,
    marginBottom: SPACING.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  selectedOption: {
    backgroundColor: COLORS.primary + '20',
  },
  flagEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  optionText: {
    ...TEXT_STYLES.body1,
    flex: 1,
  },
  modalCloseButton: {
    marginTop: SPACING.md,
  },
};

export default Preferences;
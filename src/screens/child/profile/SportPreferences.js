import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  Vibration,
  Platform,
  FlatList,
} from 'react-native';
import {
  Card,
  Text,
  Switch,
  Button,
  Avatar,
  Chip,
  Surface,
  Portal,
  Modal,
  IconButton,
  Divider,
  ProgressBar,
  Slider,
  TextInput,
  Searchbar,
  List,
  RadioButton,
  Checkbox,
  FAB,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BlurView from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const SafetyPreferences = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, safetyPreferences, isLoading } = useSelector((state) => ({
    user: state.user.currentUser,
    safetyPreferences: state.user.safetyPreferences,
    isLoading: state.user.isLoading,
  }));

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('communication');
  const [searchQuery, setSearchQuery] = useState('');
  const [customWordsModal, setCustomWordsModal] = useState(false);
  const [newCustomWord, setNewCustomWord] = useState('');
  
  const [preferences, setPreferences] = useState({
    communication: {
      allowedContactTypes: ['coach', 'parent', 'teammate'],
      messageApproval: 'automatic',
      chatFilterStrength: 80,
      customBlockedWords: ['inappropriate1', 'inappropriate2'],
      allowGroupChats: false,
      allowMediaSharing: false,
      quietHours: { enabled: true, start: '21:00', end: '07:00' },
      readReceipts: false,
    },
    privacy: {
      profileVisibility: 'friends',
      showActivityStatus: false,
      showLastSeen: false,
      allowLocationTracking: 'training_only',
      dataRetentionPeriod: 90,
      allowAnalytics: false,
      allowTargetedContent: false,
      shareProgressWithCoaches: true,
    },
    content: {
      ageAppropriateFilter: true,
      violenceFilter: 100,
      languageFilter: 90,
      bullyCyberFilter: 100,
      allowEducationalExceptions: true,
      reportSuspiciousContent: true,
      blockedCategories: ['violence', 'inappropriate_language', 'bullying'],
    },
    monitoring: {
      parentalDashboard: true,
      activityReports: 'weekly',
      screenTimeLimit: 120, // minutes
      breakReminders: 30, // minutes
      appUsageAlerts: true,
      unusualActivityAlerts: true,
      locationAlerts: true,
    },
    emergency: {
      autoContactParents: true,
      emergencyPhrase: 'help me now',
      quickExitEnabled: true,
      panicButtonVisible: true,
      autoScreenshot: false,
      emergencyLocationSharing: true,
    },
  });

  useEffect(() => {
    // Initialize component with entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Load preferences from Redux store
    if (safetyPreferences) {
      setPreferences({ ...preferences, ...safetyPreferences });
    }
  }, [safetyPreferences]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert(
        "Preferences Updated! 🔄",
        "Your safety preferences have been refreshed successfully.",
        [{ text: "Awesome! 🎉", style: "default" }]
      );
    } catch (error) {
      Alert.alert("Update Failed", "Please try again later.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handlePreferenceChange = useCallback((category, key, value) => {
    Vibration.vibrate(30);
    
    // Check if change requires parental approval
    const sensitiveSettings = [
      'allowLocationTracking', 'allowGroupChats', 'allowMediaSharing',
      'profileVisibility', 'dataRetentionPeriod', 'screenTimeLimit'
    ];
    
    if (sensitiveSettings.includes(key) && category !== 'emergency') {
      Alert.alert(
        "Parental Approval Needed 👨‍👩‍👧‍👦",
        "This setting change requires approval from your parent or guardian.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Request Approval", onPress: () => requestApproval(category, key, value) }
        ]
      );
      return;
    }

    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  }, []);

  const requestApproval = (category, key, value) => {
    Alert.alert(
      "Request Sent! 📨",
      "Your parent will receive a notification about this change. You'll be notified when they respond!",
      [{ text: "Got it! 👍" }]
    );
  };

  const addCustomBlockedWord = () => {
    if (newCustomWord.trim()) {
      const currentWords = preferences.communication.customBlockedWords;
      setPreferences(prev => ({
        ...prev,
        communication: {
          ...prev.communication,
          customBlockedWords: [...currentWords, newCustomWord.trim().toLowerCase()]
        }
      }));
      setNewCustomWord('');
      setCustomWordsModal(false);
      Alert.alert("Word Added! ✅", "The word has been added to your blocked list.");
    }
  };

  const removeCustomBlockedWord = (word) => {
    Alert.alert(
      "Remove Word? 🗑️",
      `Remove "${word}" from your blocked words list?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: () => {
          const currentWords = preferences.communication.customBlockedWords;
          setPreferences(prev => ({
            ...prev,
            communication: {
              ...prev.communication,
              customBlockedWords: currentWords.filter(w => w !== word)
            }
          }));
        }}
      ]
    );
  };

  const CategoryTabs = () => {
    const categories = [
      { id: 'communication', label: 'Communication', icon: 'chat', color: '#4CAF50' },
      { id: 'privacy', label: 'Privacy', icon: 'privacy-tip', color: '#2196F3' },
      { id: 'content', label: 'Content', icon: 'filter-list', color: '#FF9800' },
      { id: 'monitoring', label: 'Monitoring', icon: 'visibility', color: '#9C27B0' },
      { id: 'emergency', label: 'Emergency', icon: 'emergency', color: '#F44336' },
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {categories.map((category) => (
          <Surface
            key={category.id}
            style={[
              styles.tabChip,
              selectedCategory === category.id && { 
                backgroundColor: category.color,
                elevation: 6 
              }
            ]}
            elevation={2}
          >
            <Button
              mode={selectedCategory === category.id ? "contained" : "outlined"}
              onPress={() => setSelectedCategory(category.id)}
              compact
              icon={category.icon}
              buttonColor={selectedCategory === category.id ? category.color : 'transparent'}
              textColor={selectedCategory === category.id ? 'white' : category.color}
              style={styles.tabButton}
              labelStyle={styles.tabLabel}
            >
              {category.label}
            </Button>
          </Surface>
        ))}
      </ScrollView>
    );
  };

  const SliderPreference = ({ title, description, value, onValueChange, min = 0, max = 100, step = 10, unit = '%' }) => (
    <Card style={styles.preferenceCard} elevation={2}>
      <Card.Content>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderValue}>{value}{unit}</Text>
          <Slider
            style={styles.slider}
            value={value}
            onValueChange={onValueChange}
            minimumValue={min}
            maximumValue={max}
            step={step}
            thumbStyle={{ backgroundColor: COLORS.primary }}
            trackStyle={{ backgroundColor: COLORS.primary + '30' }}
            minimumTrackStyle={{ backgroundColor: COLORS.primary }}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>Low</Text>
            <Text style={styles.sliderLabel}>High</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const SelectPreference = ({ title, description, options, value, onValueChange, icon }) => (
    <Card style={styles.preferenceCard} elevation={2}>
      <Card.Content>
        <View style={styles.selectHeader}>
          <Icon name={icon} size={24} color={COLORS.primary} />
          <View style={styles.selectInfo}>
            <Text style={styles.preferenceTitle}>{title}</Text>
            <Text style={styles.preferenceDescription}>{description}</Text>
          </View>
        </View>
        <View style={styles.radioContainer}>
          {options.map((option) => (
            <View key={option.value} style={styles.radioOption}>
              <RadioButton
                value={option.value}
                status={value === option.value ? 'checked' : 'unchecked'}
                onPress={() => onValueChange(option.value)}
                color={COLORS.primary}
              />
              <View style={styles.radioText}>
                <Text style={styles.radioLabel}>{option.label}</Text>
                {option.description && (
                  <Text style={styles.radioDescription}>{option.description}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const SwitchPreference = ({ title, description, value, onValueChange, icon, level = 'medium' }) => {
    const levelColors = {
      high: COLORS.error,
      medium: COLORS.warning || '#ff9800',
      low: COLORS.success
    };

    return (
      <Card style={styles.preferenceCard} elevation={2}>
        <Card.Content>
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <View style={styles.switchHeader}>
                <Icon name={icon} size={24} color={levelColors[level]} />
                <Text style={styles.preferenceTitle}>{title}</Text>
              </View>
              <Text style={styles.preferenceDescription}>{description}</Text>
            </View>
            <Switch
              value={value}
              onValueChange={onValueChange}
              thumbColor={value ? COLORS.primary : '#f4f3f4'}
              trackColor={{ false: '#767577', true: COLORS.primary + '50' }}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  const CommunicationPreferences = () => (
    <View>
      <Text style={styles.categoryTitle}>Communication Safety 💬</Text>
      
      <SelectPreference
        title="Message Approval"
        description="How should new messages be handled?"
        icon="approval"
        value={preferences.communication.messageApproval}
        onValueChange={(value) => handlePreferenceChange('communication', 'messageApproval', value)}
        options={[
          { value: 'manual', label: 'Manual Review', description: 'Parent approves each message' },
          { value: 'automatic', label: 'Smart Filter', description: 'AI filters inappropriate content' },
          { value: 'trusted_only', label: 'Trusted Contacts', description: 'Only pre-approved contacts' },
        ]}
      />

      <SliderPreference
        title="Chat Filter Strength"
        description="How strictly should messages be filtered?"
        value={preferences.communication.chatFilterStrength}
        onValueChange={(value) => handlePreferenceChange('communication', 'chatFilterStrength', value)}
      />

      <SwitchPreference
        title="Group Chats"
        description="Allow participation in group conversations"
        icon="group"
        value={preferences.communication.allowGroupChats}
        onValueChange={(value) => handlePreferenceChange('communication', 'allowGroupChats', value)}
        level="medium"
      />

      <SwitchPreference
        title="Media Sharing"
        description="Allow sharing photos and videos"
        icon="photo"
        value={preferences.communication.allowMediaSharing}
        onValueChange={(value) => handlePreferenceChange('communication', 'allowMediaSharing', value)}
        level="high"
      />

      <Card style={styles.preferenceCard} elevation={2}>
        <Card.Content>
          <View style={styles.customWordsHeader}>
            <Text style={styles.preferenceTitle}>Custom Blocked Words 🚫</Text>
            <IconButton
              icon="add"
              onPress={() => setCustomWordsModal(true)}
              iconColor={COLORS.primary}
            />
          </View>
          <Text style={styles.preferenceDescription}>
            Add specific words you want to block in messages
          </Text>
          <View style={styles.wordsContainer}>
            {preferences.communication.customBlockedWords.map((word, index) => (
              <Chip
                key={index}
                onClose={() => removeCustomBlockedWord(word)}
                style={styles.wordChip}
                textStyle={{ color: COLORS.error }}
                closeIcon="close"
              >
                {word}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const PrivacyPreferences = () => (
    <View>
      <Text style={styles.categoryTitle}>Privacy Controls 🔒</Text>
      
      <SelectPreference
        title="Profile Visibility"
        description="Who can see your profile information?"
        icon="visibility"
        value={preferences.privacy.profileVisibility}
        onValueChange={(value) => handlePreferenceChange('privacy', 'profileVisibility', value)}
        options={[
          { value: 'private', label: 'Private', description: 'Only you can see your profile' },
          { value: 'friends', label: 'Friends Only', description: 'Approved contacts only' },
          { value: 'coaches', label: 'Coaches & Friends', description: 'Coaches and approved contacts' },
        ]}
      />

      <SelectPreference
        title="Location Tracking"
        description="When can the app track your location?"
        icon="location-on"
        value={preferences.privacy.allowLocationTracking}
        onValueChange={(value) => handlePreferenceChange('privacy', 'allowLocationTracking', value)}
        options={[
          { value: 'never', label: 'Never', description: 'Never track my location' },
          { value: 'training_only', label: 'Training Only', description: 'Only during scheduled training' },
          { value: 'always', label: 'Always', description: 'Always allow location tracking' },
        ]}
      />

      <SliderPreference
        title="Data Retention"
        description="How long should your data be kept?"
        value={preferences.privacy.dataRetentionPeriod}
        onValueChange={(value) => handlePreferenceChange('privacy', 'dataRetentionPeriod', value)}
        min={30}
        max={365}
        step={30}
        unit=" days"
      />

      <SwitchPreference
        title="Activity Status"
        description="Show when you're online and active"
        icon="radio-button-on"
        value={preferences.privacy.showActivityStatus}
        onValueChange={(value) => handlePreferenceChange('privacy', 'showActivityStatus', value)}
        level="medium"
      />

      <SwitchPreference
        title="Analytics"
        description="Allow anonymous usage analytics"
        icon="analytics"
        value={preferences.privacy.allowAnalytics}
        onValueChange={(value) => handlePreferenceChange('privacy', 'allowAnalytics', value)}
        level="low"
      />
    </View>
  );

  const ContentPreferences = () => (
    <View>
      <Text style={styles.categoryTitle}>Content Filtering 🛡️</Text>
      
      <SwitchPreference
        title="Age-Appropriate Filter"
        description="Automatically filter content based on your age"
        icon="child-care"
        value={preferences.content.ageAppropriateFilter}
        onValueChange={(value) => handlePreferenceChange('content', 'ageAppropriateFilter', value)}
        level="high"
      />

      <SliderPreference
        title="Violence Filter"
        description="Block violent content and imagery"
        value={preferences.content.violenceFilter}
        onValueChange={(value) => handlePreferenceChange('content', 'violenceFilter', value)}
      />

      <SliderPreference
        title="Language Filter"
        description="Block inappropriate language"
        value={preferences.content.languageFilter}
        onValueChange={(value) => handlePreferenceChange('content', 'languageFilter', value)}
      />

      <SliderPreference
        title="Cyberbullying Filter"
        description="Detect and block bullying behavior"
        value={preferences.content.bullyCyberFilter}
        onValueChange={(value) => handlePreferenceChange('content', 'bullyCyberFilter', value)}
      />

      <SwitchPreference
        title="Educational Exceptions"
        description="Allow educational content that might otherwise be filtered"
        icon="school"
        value={preferences.content.allowEducationalExceptions}
        onValueChange={(value) => handlePreferenceChange('content', 'allowEducationalExceptions', value)}
        level="low"
      />

      <SwitchPreference
        title="Auto-Report Suspicious Content"
        description="Automatically report potentially harmful content"
        icon="report"
        value={preferences.content.reportSuspiciousContent}
        onValueChange={(value) => handlePreferenceChange('content', 'reportSuspiciousContent', value)}
        level="medium"
      />
    </View>
  );

  const MonitoringPreferences = () => (
    <View>
      <Text style={styles.categoryTitle}>Activity Monitoring 👁️</Text>
      
      <SwitchPreference
        title="Parental Dashboard"
        description="Give parents access to activity dashboard"
        icon="dashboard"
        value={preferences.monitoring.parentalDashboard}
        onValueChange={(value) => handlePreferenceChange('monitoring', 'parentalDashboard', value)}
        level="medium"
      />

      <SelectPreference
        title="Activity Reports"
        description="How often should parents receive activity reports?"
        icon="schedule"
        value={preferences.monitoring.activityReports}
        onValueChange={(value) => handlePreferenceChange('monitoring', 'activityReports', value)}
        options={[
          { value: 'never', label: 'Never', description: 'No automatic reports' },
          { value: 'weekly', label: 'Weekly', description: 'Every Sunday' },
          { value: 'daily', label: 'Daily', description: 'Every evening' },
        ]}
      />

      <SliderPreference
        title="Screen Time Limit"
        description="Maximum daily app usage time"
        value={preferences.monitoring.screenTimeLimit}
        onValueChange={(value) => handlePreferenceChange('monitoring', 'screenTimeLimit', value)}
        min={30}
        max={300}
        step={30}
        unit=" min"
      />

      <SliderPreference
        title="Break Reminders"
        description="Remind to take breaks every X minutes"
        value={preferences.monitoring.breakReminders}
        onValueChange={(value) => handlePreferenceChange('monitoring', 'breakReminders', value)}
        min={15}
        max={120}
        step={15}
        unit=" min"
      />

      <SwitchPreference
        title="Unusual Activity Alerts"
        description="Alert parents about unusual app behavior"
        icon="warning"
        value={preferences.monitoring.unusualActivityAlerts}
        onValueChange={(value) => handlePreferenceChange('monitoring', 'unusualActivityAlerts', value)}
        level="medium"
      />
    </View>
  );

  const EmergencyPreferences = () => (
    <View>
      <Text style={styles.categoryTitle}>Emergency Features 🚨</Text>
      
      <SwitchPreference
        title="Auto-Contact Parents"
        description="Automatically contact parents in emergencies"
        icon="phone"
        value={preferences.emergency.autoContactParents}
        onValueChange={(value) => handlePreferenceChange('emergency', 'autoContactParents', value)}
        level="high"
      />

      <Card style={styles.preferenceCard} elevation={2}>
        <Card.Content>
          <Text style={styles.preferenceTitle}>Emergency Phrase 🆘</Text>
          <Text style={styles.preferenceDescription}>
            Special phrase that triggers emergency protocols
          </Text>
          <TextInput
            mode="outlined"
            value={preferences.emergency.emergencyPhrase}
            onChangeText={(text) => handlePreferenceChange('emergency', 'emergencyPhrase', text)}
            placeholder="Enter emergency phrase"
            style={styles.emergencyInput}
            left={<TextInput.Icon icon="key" />}
          />
        </Card.Content>
      </Card>

      <SwitchPreference
        title="Quick Exit Feature"
        description="Enable quick app exit in emergency situations"
        icon="exit-to-app"
        value={preferences.emergency.quickExitEnabled}
        onValueChange={(value) => handlePreferenceChange('emergency', 'quickExitEnabled', value)}
        level="high"
      />

      <SwitchPreference
        title="Visible Panic Button"
        description="Show emergency button on main screens"
        icon="panic"
        value={preferences.emergency.panicButtonVisible}
        onValueChange={(value) => handlePreferenceChange('emergency', 'panicButtonVisible', value)}
        level="high"
      />

      <SwitchPreference
        title="Emergency Location Sharing"
        description="Share location with emergency contacts when activated"
        icon="my-location"
        value={preferences.emergency.emergencyLocationSharing}
        onValueChange={(value) => handlePreferenceChange('emergency', 'emergencyLocationSharing', value)}
        level="high"
      />
    </View>
  );

  const CustomWordsModal = () => (
    <Portal>
      <Modal
        visible={customWordsModal}
        onDismiss={() => setCustomWordsModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.modalCard} elevation={8}>
          <Card.Content>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Blocked Word 🚫</Text>
              <IconButton
                icon="close"
                onPress={() => setCustomWordsModal(false)}
                iconColor={COLORS.primary}
              />
            </View>
            <TextInput
              mode="outlined"
              value={newCustomWord}
              onChangeText={setNewCustomWord}
              placeholder="Enter word to block"
              style={styles.wordInput}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setCustomWordsModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={addCustomBlockedWord}
                style={styles.modalButton}
                buttonColor={COLORS.primary}
                disabled={!newCustomWord.trim()}
              >
                Add Word
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'communication':
        return <CommunicationPreferences />;
      case 'privacy':
        return <PrivacyPreferences />;
      case 'content':
        return <ContentPreferences />;
      case 'monitoring':
        return <MonitoringPreferences />;
      case 'emergency':
        return <EmergencyPreferences />;
      default:
        return <CommunicationPreferences />;
    }
  };

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
          <Avatar.Icon
            size={60}
            icon="tune"
            style={styles.headerIcon}
            color="white"
          />
          <Text style={styles.headerTitle}>Safety Preferences ⚙️</Text>
          <Text style={styles.headerSubtitle}>
            Customize your safety settings to fit your needs
          </Text>
        </View>
      </LinearGradient>

      <CategoryTabs />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          },
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
          {renderCategoryContent()}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>

      <FAB
        icon="save"
        label="Save All"
        onPress={() => Alert.alert("Settings Saved! ✅", "All your preferences have been saved successfully.")}
        style={styles.fab}
        color="white"
      />

      <CustomWordsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl + (Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0),
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  tabsContainer: {
    backgroundColor: 'white',
    elevation: 4,
  },
  tabsContent: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  tabChip: {
    marginHorizontal: SPACING.xs,
    borderRadius: 25,
  },
  tabButton: {
    borderRadius: 25,
  },
  tabLabel: {
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  categoryTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginVertical: SPACING.lg,
    marginLeft: SPACING.xs,
  },
  preferenceCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  preferenceTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.xs,
  },
  preferenceDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  sliderContainer: {
    marginTop: SPACING.sm,
  },
  sliderValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  sliderLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  selectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  selectInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  radioContainer: {
    marginTop: SPACING.sm,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  radioText: {
    flex: 1,
    marginLeft: SPACING.sm,
    marginTop: SPACING.xs,
  },
  radioLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '500',
  },
  radioDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  switchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  customWordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  wordChip: {
    margin: SPACING.xs,
    backgroundColor: COLORS.error + '20',
  },
  emergencyInput: {
    marginTop: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    margin: SPACING.lg,
    borderRadius: 20,
    maxWidth: 350,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    flex: 1,
  },
  wordInput: {
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpacing: {
    height: SPACING.xl * 2,
  },
});

export default SafetyPreferences;
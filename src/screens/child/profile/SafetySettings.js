import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BlurView from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const SafetySettings = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, safetySettings, isLoading } = useSelector((state) => ({
    user: state.user.currentUser,
    safetySettings: state.user.safetySettings,
    isLoading: state.user.isLoading,
  }));

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [localSettings, setLocalSettings] = useState({
    contactRestrictions: true,
    locationSharing: false,
    parentalApproval: true,
    publicProfile: false,
    chatFilters: true,
    screenTimeAlerts: true,
    inappropriateContentFilter: true,
    emergencyContacts: true,
    activityMonitoring: true,
    dataSharing: false,
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
    ]).start();

    // Load safety settings from Redux store
    if (safetySettings) {
      setLocalSettings({ ...localSettings, ...safetySettings });
    }
  }, [safetySettings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call to refresh safety settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchSafetySettings());
      Alert.alert(
        "Settings Updated! 🔄",
        "Your safety settings have been refreshed successfully.",
        [{ text: "Got it! 👍", style: "default" }]
      );
    } catch (error) {
      Alert.alert("Update Failed", "Please try again later.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleSettingToggle = useCallback((settingKey, value) => {
    Vibration.vibrate(50);
    
    // Some settings require parental approval
    const requiresApproval = ['publicProfile', 'locationSharing', 'dataSharing'];
    
    if (requiresApproval.includes(settingKey) && value) {
      Alert.alert(
        "Parental Approval Required 👨‍👩‍👧‍👦",
        "This setting change needs approval from your parent or guardian. They will receive a notification.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Request Approval", onPress: () => requestParentalApproval(settingKey, value) }
        ]
      );
      return;
    }

    setLocalSettings(prev => ({
      ...prev,
      [settingKey]: value
    }));

    // dispatch(updateSafetySetting(settingKey, value));
  }, []);

  const requestParentalApproval = (settingKey, value) => {
    Alert.alert(
      "Request Sent! 📨",
      "Your parent/guardian will be notified about this change. You'll get a notification when they respond.",
      [{ text: "Okay! 👍" }]
    );
  };

  const showSettingInfo = (settingKey) => {
    setSelectedSetting(settingKey);
    setModalVisible(true);
  };

  const getSettingInfo = (key) => {
    const infoMap = {
      contactRestrictions: {
        title: "Contact Restrictions 🛡️",
        description: "Only approved contacts can message you. New contacts need parental approval.",
        benefits: "Keeps you safe from strangers and unwanted messages."
      },
      locationSharing: {
        title: "Location Sharing 📍",
        description: "Controls who can see where you are during training sessions.",
        benefits: "Helps coaches know you're at practice while keeping your location private from others."
      },
      parentalApproval: {
        title: "Parental Approval ✅",
        description: "Important changes need parent/guardian approval first.",
        benefits: "Ensures your safety by involving trusted adults in important decisions."
      },
      publicProfile: {
        title: "Public Profile 👁️",
        description: "Makes your profile visible to other users in the app.",
        benefits: "When off, only approved contacts can see your full profile information."
      },
      chatFilters: {
        title: "Chat Filters 💬",
        description: "Automatically filters inappropriate language and content in messages.",
        benefits: "Creates a positive and safe communication environment."
      },
      screenTimeAlerts: {
        title: "Screen Time Alerts ⏰",
        description: "Reminds you to take breaks and manage your app usage time.",
        benefits: "Helps maintain healthy digital habits and balance with other activities."
      }
    };
    return infoMap[key] || { title: "Safety Setting", description: "Keeps you safe!", benefits: "Enhanced protection." };
  };

  const SafetyCard = ({ title, description, settingKey, value, icon, level = "medium" }) => {
    const levelColors = {
      high: COLORS.error,
      medium: COLORS.warning || '#ff9800',
      low: COLORS.success
    };

    return (
      <Card style={styles.settingCard} elevation={2}>
        <Card.Content>
          <View style={styles.settingHeader}>
            <View style={styles.settingInfo}>
              <View style={styles.titleRow}>
                <Icon name={icon} size={24} color={levelColors[level]} />
                <Text style={styles.settingTitle}>{title}</Text>
                <IconButton
                  icon="info-outline"
                  size={18}
                  onPress={() => showSettingInfo(settingKey)}
                  iconColor={COLORS.primary}
                />
              </View>
              <Text style={styles.settingDescription}>{description}</Text>
              <Chip
                mode="outlined"
                compact
                style={[styles.levelChip, { borderColor: levelColors[level] }]}
                textStyle={{ color: levelColors[level], fontSize: 12 }}
              >
                {level.toUpperCase()} PROTECTION
              </Chip>
            </View>
            <Switch
              value={value}
              onValueChange={(newValue) => handleSettingToggle(settingKey, newValue)}
              thumbColor={value ? COLORS.primary : '#f4f3f4'}
              trackColor={{ false: '#767577', true: COLORS.primary + '50' }}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  const EmergencyContactCard = () => (
    <Card style={styles.emergencyCard} elevation={3}>
      <LinearGradient
        colors={[COLORS.error, COLORS.error + 'CC']}
        style={styles.emergencyGradient}
      >
        <Card.Content>
          <View style={styles.emergencyHeader}>
            <Icon name="emergency" size={28} color="white" />
            <Text style={styles.emergencyTitle}>Emergency Contacts 🚨</Text>
          </View>
          <Text style={styles.emergencyDescription}>
            Quick access to trusted adults who can help in emergencies
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('EmergencyContacts')}
            style={styles.emergencyButton}
            labelStyle={{ color: COLORS.error }}
            buttonColor="white"
          >
            Manage Contacts
          </Button>
        </Card.Content>
      </LinearGradient>
    </Card>
  );

  const SafetyScore = () => {
    const enabledSettings = Object.values(localSettings).filter(Boolean).length;
    const totalSettings = Object.keys(localSettings).length;
    const score = Math.round((enabledSettings / totalSettings) * 100);
    
    const getScoreColor = () => {
      if (score >= 80) return COLORS.success;
      if (score >= 60) return COLORS.warning || '#ff9800';
      return COLORS.error;
    };

    const getScoreEmoji = () => {
      if (score >= 80) return '🛡️';
      if (score >= 60) return '⚠️';
      return '🚨';
    };

    return (
      <Surface style={styles.scoreCard} elevation={4}>
        <LinearGradient
          colors={[getScoreColor(), getScoreColor() + 'CC']}
          style={styles.scoreGradient}
        >
          <View style={styles.scoreContent}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreEmoji}>{getScoreEmoji()}</Text>
              <Text style={styles.scoreTitle}>Safety Score</Text>
            </View>
            <Text style={styles.scoreNumber}>{score}%</Text>
            <ProgressBar
              progress={score / 100}
              color="white"
              style={styles.scoreProgress}
            />
            <Text style={styles.scoreDescription}>
              {score >= 80 ? "Excellent protection! 🌟" : 
               score >= 60 ? "Good, but can improve 💪" : 
               "Needs attention for better safety 🚨"}
            </Text>
          </View>
        </LinearGradient>
      </Surface>
    );
  };

  const InfoModal = () => {
    if (!selectedSetting) return null;
    const info = getSettingInfo(selectedSetting);

    return (
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.blurBackground} blurType="light" blurAmount={10}>
            <Card style={styles.modalCard} elevation={8}>
              <Card.Content>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{info.title}</Text>
                  <IconButton
                    icon="close"
                    onPress={() => setModalVisible(false)}
                    iconColor={COLORS.primary}
                  />
                </View>
                <Divider style={styles.modalDivider} />
                <Text style={styles.modalDescription}>{info.description}</Text>
                <View style={styles.benefitsSection}>
                  <Text style={styles.benefitsTitle}>Why it helps you: 💡</Text>
                  <Text style={styles.benefitsText}>{info.benefits}</Text>
                </View>
                <Button
                  mode="contained"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                  buttonColor={COLORS.primary}
                >
                  Got it! 👍
                </Button>
              </Card.Content>
            </Card>
          </BlurView>
        </Modal>
      </Portal>
    );
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
            icon="shield-check"
            style={styles.headerIcon}
            color="white"
          />
          <Text style={styles.headerTitle}>Safety Settings 🛡️</Text>
          <Text style={styles.headerSubtitle}>
            Your safety is our priority! Customize your protection settings.
          </Text>
        </View>
      </LinearGradient>

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
          <SafetyScore />
          
          <EmergencyContactCard />

          <Text style={styles.sectionTitle}>Privacy & Communication 🔒</Text>
          
          <SafetyCard
            title="Contact Restrictions"
            description="Only approved people can message you"
            settingKey="contactRestrictions"
            value={localSettings.contactRestrictions}
            icon="contacts"
            level="high"
          />

          <SafetyCard
            title="Chat Filters"
            description="Filters inappropriate messages automatically"
            settingKey="chatFilters"
            value={localSettings.chatFilters}
            icon="filter-list"
            level="high"
          />

          <SafetyCard
            title="Public Profile"
            description="Makes your profile visible to other users"
            settingKey="publicProfile"
            value={localSettings.publicProfile}
            icon="public"
            level="medium"
          />

          <Text style={styles.sectionTitle}>Location & Data 📍</Text>

          <SafetyCard
            title="Location Sharing"
            description="Share location during training sessions"
            settingKey="locationSharing"
            value={localSettings.locationSharing}
            icon="location-on"
            level="high"
          />

          <SafetyCard
            title="Data Sharing"
            description="Share performance data with third parties"
            settingKey="dataSharing"
            value={localSettings.dataSharing}
            icon="share"
            level="medium"
          />

          <Text style={styles.sectionTitle}>Monitoring & Controls ⏰</Text>

          <SafetyCard
            title="Parental Approval"
            description="Important changes need parent approval"
            settingKey="parentalApproval"
            value={localSettings.parentalApproval}
            icon="family-restroom"
            level="high"
          />

          <SafetyCard
            title="Screen Time Alerts"
            description="Get reminders to take breaks"
            settingKey="screenTimeAlerts"
            value={localSettings.screenTimeAlerts}
            icon="schedule"
            level="low"
          />

          <SafetyCard
            title="Activity Monitoring"
            description="Parents can see your app activity"
            settingKey="activityMonitoring"
            value={localSettings.activityMonitoring}
            icon="monitoring"
            level="medium"
          />

          <SafetyCard
            title="Content Filter"
            description="Blocks inappropriate content automatically"
            settingKey="inappropriateContentFilter"
            value={localSettings.inappropriateContentFilter}
            icon="block"
            level="high"
          />

          <View style={styles.helpSection}>
            <Card style={styles.helpCard} elevation={2}>
              <Card.Content>
                <View style={styles.helpHeader}>
                  <Icon name="help-outline" size={28} color={COLORS.primary} />
                  <Text style={styles.helpTitle}>Need Help? 🤝</Text>
                </View>
                <Text style={styles.helpDescription}>
                  If you feel unsafe or need help, talk to a trusted adult or contact our support team.
                </Text>
                <Button
                  mode="contained"
                  onPress={() => Alert.alert("Feature Coming Soon! 🚀", "Help center will be available soon.")}
                  style={styles.helpButton}
                  buttonColor={COLORS.primary}
                >
                  Get Support 💬
                </Button>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>

      <InfoModal />
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
  content: {
    flex: 1,
    marginTop: -SPACING.md,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  scoreCard: {
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.sm,
  },
  scoreEmoji: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  scoreTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
  },
  scoreNumber: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.sm,
  },
  scoreProgress: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: SPACING.sm,
  },
  scoreDescription: {
    ...TEXT_STYLES.body,
    color: 'white',
    textAlign: 'center',
  },
  emergencyCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emergencyGradient: {
    padding: SPACING.lg,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  emergencyTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginLeft: SPACING.sm,
  },
  emergencyDescription: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.md,
  },
  emergencyButton: {
    borderRadius: 25,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginVertical: SPACING.md,
    marginLeft: SPACING.xs,
  },
  settingCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  settingTitle: {
    ...TEXT_STYLES.subtitle,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  settingDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  levelChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  helpSection: {
    marginTop: SPACING.lg,
  },
  helpCard: {
    borderRadius: 12,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  helpTitle: {
    ...TEXT_STYLES.h3,
    marginLeft: SPACING.sm,
  },
  helpDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  helpButton: {
    borderRadius: 25,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
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
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    flex: 1,
  },
  modalDivider: {
    marginBottom: SPACING.md,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  benefitsSection: {
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  benefitsTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  benefitsText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    lineHeight: 20,
  },
  modalButton: {
    borderRadius: 25,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default SafetySettings;
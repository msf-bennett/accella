import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Vibration,
  Switch,
} from 'react-native';
import { 
  Card,
  Button,
  Surface,
  Portal,
  Modal,
  Divider,
  IconButton,
  Chip,
  Avatar,
  ProgressBar,
  Searchbar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your design constants
import { COLORS, SPACING, TEXT_STYLES } from '../../constants/theme';

const ProfileVisibility = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { athleteProfile } = useSelector((state) => state.athlete);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Visibility settings state
  const [visibilitySettings, setVisibilitySettings] = useState({
    profileVisibility: 'friends', // 'public', 'friends', 'private'
    showRealName: true,
    showAge: true,
    showLocation: false,
    showSport: true,
    showPosition: true,
    showTeam: true,
    showCoach: false,
    showPerformanceStats: true,
    showTrainingHistory: false,
    showAchievements: true,
    showPersonalRecords: false,
    showUpcomingSessions: true,
    showAvailability: false,
    showSocialMedia: false,
    showContactInfo: false,
    allowSearch: true,
    showInDirectory: false,
  });

  const [profilePreview, setProfilePreview] = useState({
    name: user?.displayName || 'John Doe',
    age: 17,
    location: 'Nairobi, Kenya',
    sport: 'Football',
    position: 'Midfielder',
    team: 'Arsenal Youth FC',
    coach: 'Coach Martinez',
    avatar: user?.profileImage,
    achievements: ['Regional Champion', 'Best Player 2024'],
    stats: {
      matchesPlayed: 45,
      goals: 12,
      assists: 18,
      trainingHours: 240,
    },
  });

  const [whoCanSeeOptions] = useState([
    { 
      id: 'public', 
      label: 'Everyone', 
      description: 'Anyone can view your profile',
      icon: 'public',
      color: COLORS.success,
    },
    { 
      id: 'friends', 
      label: 'Team & Friends', 
      description: 'Only teammates and friends',
      icon: 'group',
      color: COLORS.primary,
    },
    { 
      id: 'private', 
      label: 'Private', 
      description: 'Only you can see your profile',
      icon: 'lock',
      color: COLORS.error,
    },
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
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call to refresh visibility settings
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleSettingChange = (settingKey, value) => {
    // Show confirmation for critical visibility changes
    const criticalSettings = ['profileVisibility', 'showContactInfo', 'allowSearch'];
    
    if (criticalSettings.includes(settingKey) && value !== visibilitySettings[settingKey]) {
      setConfirmAction({ settingKey, value });
      setConfirmModalVisible(true);
      Vibration.vibrate(100);
    } else {
      updateSetting(settingKey, value);
    }
  };

  const updateSetting = (settingKey, value) => {
    setVisibilitySettings(prev => ({
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

  const handlePreviewProfile = () => {
    setPreviewModalVisible(true);
  };

  const getVisibilityScore = () => {
    const totalSettings = Object.keys(visibilitySettings).length;
    const visibleSettings = Object.values(visibilitySettings).filter(value => 
      value === true || value === 'public'
    ).length;
    return Math.round((visibleSettings / totalSettings) * 100);
  };

  const getVisibilityScoreColor = () => {
    const score = getVisibilityScore();
    if (score >= 70) return COLORS.success;
    if (score >= 40) return '#FFA726';
    return COLORS.error;
  };

  const getVisibilityScoreLabel = () => {
    const score = getVisibilityScore();
    if (score >= 70) return 'High Visibility 🌟';
    if (score >= 40) return 'Medium Visibility 👥';
    return 'Low Visibility 🔒';
  };

  const VisibilityCard = ({ title, children, icon, description }) => (
    <Card style={styles.visibilityCard}>
      <Surface style={styles.cardHeader}>
        <View style={styles.cardHeaderContent}>
          <MaterialIcons name={icon} size={24} color="white" />
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

  const SettingRow = ({ label, description, value, onValueChange, type = 'switch' }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={value ? 'white' : COLORS.secondary}
      />
    </View>
  );

  const VisibilityOption = ({ option, isSelected, onSelect }) => (
    <Card 
      style={[
        styles.visibilityOption,
        isSelected && { borderColor: option.color, borderWidth: 2 }
      ]}
      onPress={() => onSelect(option.id)}
    >
      <View style={styles.optionContent}>
        <View style={[styles.optionIcon, { backgroundColor: `${option.color}20` }]}>
          <MaterialIcons name={option.icon} size={24} color={option.color} />
        </View>
        <View style={styles.optionInfo}>
          <Text style={styles.optionLabel}>{option.label}</Text>
          <Text style={styles.optionDescription}>{option.description}</Text>
        </View>
        {isSelected && (
          <MaterialIcons name="check-circle" size={24} color={option.color} />
        )}
      </View>
    </Card>
  );

  const ProfilePreviewItem = ({ label, value, visible }) => {
    if (!visible) return null;
    
    return (
      <View style={styles.previewItem}>
        <Text style={styles.previewLabel}>{label}:</Text>
        <Text style={styles.previewValue}>{value}</Text>
      </View>
    );
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
          <Text style={styles.headerTitle}>Profile Visibility</Text>
          <Text style={styles.headerSubtitle}>Control who sees your information 👁️</Text>
          
          <View style={styles.visibilityScoreContainer}>
            <Text style={styles.visibilityScoreLabel}>{getVisibilityScoreLabel()}</Text>
            <ProgressBar 
              progress={getVisibilityScore() / 100} 
              color={getVisibilityScoreColor()}
              style={styles.visibilityScoreBar}
            />
            <Text style={styles.visibilityScoreText}>{getVisibilityScore()}% Visible</Text>
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
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              onPress={handlePreviewProfile}
              style={styles.actionButton}
              icon="visibility"
              buttonColor={COLORS.primary}
            >
              Preview Profile
            </Button>
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Profile sharing will be available in the next update.')}
              style={styles.actionButton}
              icon="share"
            >
              Share Profile
            </Button>
          </View>

          {/* Profile Visibility Level */}
          <VisibilityCard 
            title="Who Can See Your Profile" 
            icon="visibility"
            description="Choose your default profile visibility"
          >
            {whoCanSeeOptions.map((option) => (
              <VisibilityOption
                key={option.id}
                option={option}
                isSelected={visibilitySettings.profileVisibility === option.id}
                onSelect={(value) => handleSettingChange('profileVisibility', value)}
              />
            ))}
          </VisibilityCard>

          {/* Basic Information */}
          <VisibilityCard 
            title="Basic Information" 
            icon="person"
            description="Control visibility of your basic details"
          >
            <SettingRow
              label="Real Name"
              description="Show your full name instead of username"
              value={visibilitySettings.showRealName}
              onValueChange={(value) => handleSettingChange('showRealName', value)}
            />
            
            <SettingRow
              label="Age"
              description="Display your age on your profile"
              value={visibilitySettings.showAge}
              onValueChange={(value) => handleSettingChange('showAge', value)}
            />
            
            <SettingRow
              label="Location"
              description="Show your city and country"
              value={visibilitySettings.showLocation}
              onValueChange={(value) => handleSettingChange('showLocation', value)}
            />
            
            <SettingRow
              label="Contact Information"
              description="Allow others to see your contact details"
              value={visibilitySettings.showContactInfo}
              onValueChange={(value) => handleSettingChange('showContactInfo', value)}
            />
          </VisibilityCard>

          {/* Sports Information */}
          <VisibilityCard 
            title="Sports Information" 
            icon="sports-soccer"
            description="Control visibility of your athletic details"
          >
            <SettingRow
              label="Sport & Position"
              description="Show what sport you play and your position"
              value={visibilitySettings.showSport && visibilitySettings.showPosition}
              onValueChange={(value) => {
                handleSettingChange('showSport', value);
                handleSettingChange('showPosition', value);
              }}
            />
            
            <SettingRow
              label="Current Team"
              description="Display your team affiliation"
              value={visibilitySettings.showTeam}
              onValueChange={(value) => handleSettingChange('showTeam', value)}
            />
            
            <SettingRow
              label="Coach Information"
              description="Show who your coach is"
              value={visibilitySettings.showCoach}
              onValueChange={(value) => handleSettingChange('showCoach', value)}
            />
          </VisibilityCard>

          {/* Performance & Training */}
          <VisibilityCard 
            title="Performance & Training" 
            icon="trending-up"
            description="Control sharing of your athletic performance"
          >
            <SettingRow
              label="Performance Statistics"
              description="Show your match stats and performance metrics"
              value={visibilitySettings.showPerformanceStats}
              onValueChange={(value) => handleSettingChange('showPerformanceStats', value)}
            />
            
            <SettingRow
              label="Training History"
              description="Display your past training sessions"
              value={visibilitySettings.showTrainingHistory}
              onValueChange={(value) => handleSettingChange('showTrainingHistory', value)}
            />
            
            <SettingRow
              label="Personal Records"
              description="Show your best performances and PRs"
              value={visibilitySettings.showPersonalRecords}
              onValueChange={(value) => handleSettingChange('showPersonalRecords', value)}
            />
            
            <SettingRow
              label="Achievements & Badges"
              description="Display your awards and accomplishments"
              value={visibilitySettings.showAchievements}
              onValueChange={(value) => handleSettingChange('showAchievements', value)}
            />
          </VisibilityCard>

          {/* Availability & Schedule */}
          <VisibilityCard 
            title="Availability & Schedule" 
            icon="schedule"
            description="Control sharing of your schedule information"
          >
            <SettingRow
              label="Upcoming Sessions"
              description="Show your scheduled training sessions"
              value={visibilitySettings.showUpcomingSessions}
              onValueChange={(value) => handleSettingChange('showUpcomingSessions', value)}
            />
            
            <SettingRow
              label="Availability Status"
              description="Let others know when you're available to train"
              value={visibilitySettings.showAvailability}
              onValueChange={(value) => handleSettingChange('showAvailability', value)}
            />
          </VisibilityCard>

          {/* Discovery & Search */}
          <VisibilityCard 
            title="Discovery & Search" 
            icon="search"
            description="Control how others can find you"
          >
            <SettingRow
              label="Allow Search"
              description="Let others find your profile through search"
              value={visibilitySettings.allowSearch}
              onValueChange={(value) => handleSettingChange('allowSearch', value)}
            />
            
            <SettingRow
              label="Show in Directory"
              description="Include your profile in athlete directories"
              value={visibilitySettings.showInDirectory}
              onValueChange={(value) => handleSettingChange('showInDirectory', value)}
            />
            
            <SettingRow
              label="Social Media Links"
              description="Display links to your social media profiles"
              value={visibilitySettings.showSocialMedia}
              onValueChange={(value) => handleSettingChange('showSocialMedia', value)}
            />
          </VisibilityCard>

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
              <MaterialIcons name="visibility" size={48} color={COLORS.primary} style={styles.confirmIcon} />
              <Text style={styles.confirmTitle}>Update Visibility? 👁️</Text>
              <Text style={styles.confirmText}>
                This change will affect who can see your profile information. Make sure you're comfortable with this visibility level.
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

      {/* Profile Preview Modal */}
      <Portal>
        <Modal
          visible={previewModalVisible}
          onDismiss={() => setPreviewModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          >
            <Card style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <MaterialIcons name="preview" size={24} color={COLORS.primary} />
                <Text style={styles.previewTitle}>Profile Preview 👀</Text>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => setPreviewModalVisible(false)}
                />
              </View>
              
              <ScrollView style={styles.previewContent}>
                <View style={styles.previewProfile}>
                  <Avatar.Image
                    size={80}
                    source={{ uri: profilePreview.avatar }}
                    style={styles.previewAvatar}
                  />
                  
                  <ProfilePreviewItem
                    label="Name"
                    value={visibilitySettings.showRealName ? profilePreview.name : 'Hidden'}
                    visible={true}
                  />
                  
                  <ProfilePreviewItem
                    label="Age"
                    value={profilePreview.age}
                    visible={visibilitySettings.showAge}
                  />
                  
                  <ProfilePreviewItem
                    label="Location"
                    value={profilePreview.location}
                    visible={visibilitySettings.showLocation}
                  />
                  
                  <ProfilePreviewItem
                    label="Sport"
                    value={`${profilePreview.sport} - ${profilePreview.position}`}
                    visible={visibilitySettings.showSport}
                  />
                  
                  <ProfilePreviewItem
                    label="Team"
                    value={profilePreview.team}
                    visible={visibilitySettings.showTeam}
                  />
                  
                  <ProfilePreviewItem
                    label="Coach"
                    value={profilePreview.coach}
                    visible={visibilitySettings.showCoach}
                  />
                  
                  {visibilitySettings.showAchievements && (
                    <View style={styles.previewSection}>
                      <Text style={styles.previewSectionTitle}>Achievements 🏆</Text>
                      {profilePreview.achievements.map((achievement, index) => (
                        <Text key={index} style={styles.previewAchievement}>• {achievement}</Text>
                      ))}
                    </View>
                  )}
                  
                  {visibilitySettings.showPerformanceStats && (
                    <View style={styles.previewSection}>
                      <Text style={styles.previewSectionTitle}>Performance Stats 📊</Text>
                      <Text style={styles.previewStat}>Matches Played: {profilePreview.stats.matchesPlayed}</Text>
                      <Text style={styles.previewStat}>Goals: {profilePreview.stats.goals}</Text>
                      <Text style={styles.previewStat}>Assists: {profilePreview.stats.assists}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
              
              <Button
                mode="outlined"
                onPress={() => setPreviewModalVisible(false)}
                style={styles.previewCloseButton}
              >
                Close Preview
              </Button>
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
  visibilityScoreContainer: {
    width: '100%',
    alignItems: 'center',
  },
  visibilityScoreLabel: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  visibilityScoreBar: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  visibilityScoreText: {
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
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },
  visibilityCard: {
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
  visibilityOption: {
    marginBottom: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  previewCard: {
    width: '95%',
    maxHeight: '85%',
    borderRadius: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  previewTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  previewContent: {
    maxHeight: 400,
  },
  previewProfile: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  previewAvatar: {
    marginBottom: SPACING.lg,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  previewLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  previewValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  previewSection: {
    width: '100%',
    marginTop: SPACING.lg,
  },
  previewSectionTitle: {
    ...TEXT_STYLES.h5,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  previewAchievement: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  previewStat: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  previewCloseButton: {
    margin: SPACING.lg,
  },
  bottomSpacing: {
    height: SPACING.xl * 2,
  },
};

export default ProfileVisibility;
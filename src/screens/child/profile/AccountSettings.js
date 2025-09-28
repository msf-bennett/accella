import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  StatusBar,
  Vibration,
  Platform,
} from 'react-native';
import {
  Card,
  Button,
  Avatar,
  Surface,
  TextInput,
  Switch,
  List,
  Chip,
  Portal,
  Modal,
  IconButton,
  ProgressBar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../styles/theme';

const AccountSettings = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.settings);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    school: '',
    emergencyContact: '',
    medicalInfo: '',
    favoritePosition: '',
    skillLevel: 'Beginner',
  });

  // UI state
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [notifications, setNotifications] = useState({
    sessionReminders: true,
    progressUpdates: true,
    coachMessages: true,
    achievements: true,
  });

  // Load user data on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = useCallback(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dateOfBirth: user.dateOfBirth || '',
        school: user.school || '',
        emergencyContact: user.emergencyContact || '',
        medicalInfo: user.medicalInfo || '',
        favoritePosition: user.favoritePosition || '',
        skillLevel: user.skillLevel || 'Beginner',
      });
      setNotifications(user.notificationSettings || notifications);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadUserProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh profile data');
    }
    setRefreshing(false);
  }, [loadUserProfile]);

  const handleSaveProfile = async () => {
    try {
      Vibration.vibrate(50);
      
      // Validate required fields
      if (!formData.firstName || !formData.lastName) {
        Alert.alert('Error', 'First name and last name are required');
        return;
      }

      // Dispatch update action
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: { ...formData, notificationSettings: notifications }
      });

      Alert.alert(
        'Success! 🎉',
        'Your profile has been updated successfully',
        [{ text: 'OK', onPress: () => setEditMode(false) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleImageChange = () => {
    Alert.alert(
      'Change Profile Picture',
      'This feature is coming soon! 📸',
      [{ text: 'OK', style: 'default' }]
    );
    setShowImageModal(false);
  };

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const positions = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper', 'Winger', 'Striker'];

  const SettingItem = ({ title, subtitle, icon, onPress, rightComponent }) => (
    <Surface style={styles.settingItem} elevation={1}>
      <List.Item
        title={title}
        description={subtitle}
        left={() => <MaterialIcons name={icon} size={24} color={COLORS.primary} />}
        right={() => rightComponent}
        onPress={onPress}
        titleStyle={[TEXT_STYLES.body, { color: theme === 'dark' ? '#fff' : '#000' }]}
        descriptionStyle={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}
      />
    </Surface>
  );

  const ProfileHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.headerGradient}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={80}
            source={{ uri: user?.profileImage || 'https://via.placeholder.com/80' }}
          />
          <IconButton
            icon="camera"
            size={20}
            style={styles.cameraButton}
            iconColor={COLORS.white}
            onPress={() => setShowImageModal(true)}
          />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[TEXT_STYLES.h3, styles.profileName]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <View style={styles.statsRow}>
            <Chip icon="star" style={styles.statChip} textStyle={styles.chipText}>
              Level {user?.level || 1}
            </Chip>
            <Chip icon="trophy" style={styles.statChip} textStyle={styles.chipText}>
              {user?.points || 0} pts
            </Chip>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const PersonalInfoSection = () => (
    <Card style={styles.sectionCard}>
      <Card.Title
        title="Personal Information"
        left={() => <MaterialIcons name="person" size={24} color={COLORS.primary} />}
        right={() => (
          <IconButton
            icon={editMode ? "check" : "edit"}
            iconColor={COLORS.primary}
            onPress={editMode ? handleSaveProfile : () => setEditMode(true)}
          />
        )}
        titleStyle={[TEXT_STYLES.h4, { color: theme === 'dark' ? '#fff' : '#000' }]}
      />
      <Card.Content>
        <View style={styles.formRow}>
          <TextInput
            label="First Name"
            value={formData.firstName}
            onChangeText={(text) => setFormData({...formData, firstName: text})}
            style={styles.halfInput}
            disabled={!editMode}
            mode="outlined"
          />
          <TextInput
            label="Last Name"
            value={formData.lastName}
            onChangeText={(text) => setFormData({...formData, lastName: text})}
            style={styles.halfInput}
            disabled={!editMode}
            mode="outlined"
          />
        </View>
        
        <TextInput
          label="Date of Birth"
          value={formData.dateOfBirth}
          onChangeText={(text) => setFormData({...formData, dateOfBirth: text})}
          style={styles.fullInput}
          disabled={!editMode}
          mode="outlined"
          placeholder="MM/DD/YYYY"
        />
        
        <TextInput
          label="School"
          value={formData.school}
          onChangeText={(text) => setFormData({...formData, school: text})}
          style={styles.fullInput}
          disabled={!editMode}
          mode="outlined"
        />

        <View style={styles.skillSection}>
          <Button
            mode="outlined"
            onPress={() => setShowSkillModal(true)}
            disabled={!editMode}
            style={styles.skillButton}
            icon="trending-up"
          >
            Skill Level: {formData.skillLevel}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const NotificationSection = () => (
    <Card style={styles.sectionCard}>
      <Card.Title
        title="Notifications"
        left={() => <MaterialIcons name="notifications" size={24} color={COLORS.primary} />}
        titleStyle={[TEXT_STYLES.h4, { color: theme === 'dark' ? '#fff' : '#000' }]}
      />
      <Card.Content>
        {Object.entries(notifications).map(([key, value]) => (
          <SettingItem
            key={key}
            title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            subtitle={value ? 'Enabled' : 'Disabled'}
            icon="notifications"
            rightComponent={
              <Switch
                value={value}
                onValueChange={(newValue) => 
                  setNotifications({...notifications, [key]: newValue})
                }
                color={COLORS.primary}
              />
            }
          />
        ))}
      </Card.Content>
    </Card>
  );

  const SafetySection = () => (
    <Card style={styles.sectionCard}>
      <Card.Title
        title="Safety & Emergency"
        left={() => <MaterialIcons name="security" size={24} color={COLORS.error} />}
        titleStyle={[TEXT_STYLES.h4, { color: theme === 'dark' ? '#fff' : '#000' }]}
      />
      <Card.Content>
        <TextInput
          label="Emergency Contact"
          value={formData.emergencyContact}
          onChangeText={(text) => setFormData({...formData, emergencyContact: text})}
          style={styles.fullInput}
          disabled={!editMode}
          mode="outlined"
          placeholder="Parent/Guardian Phone Number"
        />
        
        <TextInput
          label="Medical Information"
          value={formData.medicalInfo}
          onChangeText={(text) => setFormData({...formData, medicalInfo: text})}
          style={styles.fullInput}
          disabled={!editMode}
          mode="outlined"
          multiline
          numberOfLines={3}
          placeholder="Allergies, medications, medical conditions..."
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView
        style={styles.scrollView}
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
        <ProfileHeader />
        
        <View style={styles.content}>
          <PersonalInfoSection />
          <NotificationSection />
          <SafetySection />
          
          {/* Quick Actions */}
          <Card style={styles.sectionCard}>
            <Card.Title
              title="Quick Actions"
              left={() => <MaterialIcons name="speed" size={24} color={COLORS.success} />}
              titleStyle={[TEXT_STYLES.h4, { color: theme === 'dark' ? '#fff' : '#000' }]}
            />
            <Card.Content>
              <View style={styles.actionGrid}>
                <Button
                  mode="contained"
                  icon="help"
                  onPress={() => Alert.alert('Help', 'Help center coming soon! 🆘')}
                  style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                >
                  Help
                </Button>
                <Button
                  mode="contained"
                  icon="privacy-tip"
                  onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon! 🔒')}
                  style={[styles.actionButton, { backgroundColor: COLORS.secondary }]}
                >
                  Privacy
                </Button>
                <Button
                  mode="contained"
                  icon="feedback"
                  onPress={() => Alert.alert('Feedback', 'Feedback form coming soon! 💬')}
                  style={[styles.actionButton, { backgroundColor: COLORS.success }]}
                >
                  Feedback
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Skill Level Modal */}
      <Portal>
        <Modal
          visible={showSkillModal}
          onDismiss={() => setShowSkillModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Title title="Select Skill Level" />
            <Card.Content>
              {skillLevels.map((level) => (
                <List.Item
                  key={level}
                  title={level}
                  onPress={() => {
                    setFormData({...formData, skillLevel: level});
                    setShowSkillModal(false);
                    Vibration.vibrate(50);
                  }}
                  left={() => <MaterialIcons name="trending-up" size={24} color={COLORS.primary} />}
                  right={() => 
                    formData.skillLevel === level && 
                    <MaterialIcons name="check" size={24} color={COLORS.success} />
                  }
                />
              ))}
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Profile Image Modal */}
      <Portal>
        <Modal
          visible={showImageModal}
          onDismiss={() => setShowImageModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
            <Card>
              <Card.Title title="Change Profile Picture" />
              <Card.Actions>
                <Button onPress={() => setShowImageModal(false)}>Cancel</Button>
                <Button mode="contained" onPress={handleImageChange}>
                  Choose Photo
                </Button>
              </Card.Actions>
            </Card>
          </BlurView>
        </Modal>
      </Portal>

      {/* Loading Progress */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ProgressBar indeterminate color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  profileName: {
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  statChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chipText: {
    color: COLORS.white,
    fontSize: 12,
  },
  content: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  sectionCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  settingItem: {
    marginBottom: SPACING.xs,
    borderRadius: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfInput: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  fullInput: {
    marginBottom: SPACING.md,
  },
  skillSection: {
    alignItems: 'flex-start',
  },
  skillButton: {
    marginTop: SPACING.sm,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
  },
  modalContainer: {
    margin: SPACING.lg,
    borderRadius: 12,
  },
  blurContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
});

export default AccountSettings;